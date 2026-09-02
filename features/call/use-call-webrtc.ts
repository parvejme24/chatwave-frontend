"use client"

import { useEffect, useRef, useState } from "react"

import {
  emitCallMedia,
  emitWebRtcAnswer,
  emitWebRtcIce,
  emitWebRtcOffer,
  emitWebRtcReady,
  getSocket,
} from "../../lib/realtime/socket"
import {
  subscribeWebRtcSignals,
  type BufferedSignal,
} from "../../lib/realtime/webrtc-signal-buffer"
import type { IceServer } from "../../lib/types/call"

type UseCallWebRtcArgs = {
  callId: string
  peerUserId: string
  iceServers?: IceServer[]
  localStream: MediaStream | null
  screenStream: MediaStream | null
  kind: "audio" | "video"
  enabled: boolean
  socketConnected: boolean
  isCaller: boolean
  muted: boolean
  cameraOff: boolean
  speakerOn: boolean
}

const DEFAULT_ICE: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
]

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function toRtcIceServers(servers?: IceServer[]): RTCIceServer[] {
  if (!servers?.length) return DEFAULT_ICE
  return servers.map((server) => ({
    urls: server.urls,
    username: server.username,
    credential: server.credential,
  }))
}

function trackIsUsable(track: MediaStreamTrack) {
  return track.readyState !== "ended"
}

/**
 * 1:1 WebRTC. Signaling is buffered globally so offers sent while the callee
 * is still navigating to /call are not lost.
 */
export function useCallWebRtc({
  callId,
  peerUserId,
  iceServers,
  localStream,
  screenStream,
  kind,
  enabled,
  socketConnected,
  isCaller,
  muted,
  cameraOff,
  speakerOn,
}: UseCallWebRtcArgs) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [remoteJoined, setRemoteJoined] = useState(false)
  const [remoteCameraOff, setRemoteCameraOff] = useState(false)
  const [remoteMuted, setRemoteMuted] = useState(false)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const makingOffer = useRef(false)
  const polite = !isCaller
  const peerReady = useRef(!isCaller)
  const pendingIce = useRef<RTCIceCandidateInit[]>([])
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const offerSentAt = useRef(0)
  const lastHandledSdp = useRef("")
  const signalChain = useRef(Promise.resolve())

  const peerIdRef = useRef(peerUserId)
  const callIdRef = useRef(callId)
  const localStreamRef = useRef(localStream)
  const screenStreamRef = useRef(screenStream)
  const cameraOffRef = useRef(cameraOff)
  const iceServersRef = useRef(iceServers)

  peerIdRef.current = peerUserId
  callIdRef.current = callId
  localStreamRef.current = localStream
  screenStreamRef.current = screenStream
  cameraOffRef.current = cameraOff
  iceServersRef.current = iceServers

  useEffect(() => {
    if (typeof document === "undefined") return
    let audio = remoteAudioRef.current
    if (!audio) {
      audio = document.createElement("audio")
      audio.autoplay = true
      audio.setAttribute("playsinline", "true")
      remoteAudioRef.current = audio
    }
    audio.srcObject = remoteStream
    audio.muted = !speakerOn
    audio.volume = speakerOn ? 1 : 0
    if (remoteStream) void audio.play().catch(() => undefined)
  }, [remoteStream, speakerOn])

  useEffect(() => {
    function teardown() {
      pcRef.current?.close()
      pcRef.current = null
      pendingIce.current = []
      makingOffer.current = false
      peerReady.current = !isCaller
      offerSentAt.current = 0
      lastHandledSdp.current = ""
      signalChain.current = Promise.resolve()
      setRemoteStream(null)
      setRemoteJoined(false)
      setRemoteCameraOff(false)
      setRemoteMuted(false)
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null
    }

    if (!enabled || !socketConnected || !callId || !peerUserId) {
      teardown()
      return
    }

    const socket = getSocket()
    if (!socket?.connected) {
      teardown()
      return
    }

    let cancelled = false
    const pc = new RTCPeerConnection({
      iceServers: toRtcIceServers(iceServersRef.current),
    })
    pcRef.current = pc
    peerReady.current = !isCaller

    // Only the caller creates m-lines. Callee answers the remote offer as-is.
    if (isCaller) {
      pc.addTransceiver("audio", { direction: "sendrecv" })
      if (kind === "video") {
        pc.addTransceiver("video", { direction: "sendrecv" })
      }
    }

    const remote = new MediaStream()

    function publishRemote() {
      setRemoteStream(new MediaStream(remote.getTracks()))
      setRemoteJoined(true)
    }

    pc.ontrack = (event) => {
      const tracks = event.streams[0]?.getTracks() ?? [event.track]
      for (const track of tracks) {
        if (!remote.getTracks().some((item) => item.id === track.id)) {
          remote.addTrack(track)
        }
        track.onunmute = () => publishRemote()
        track.onended = () => {
          try {
            remote.removeTrack(track)
          } catch {
            /* gone */
          }
          publishRemote()
        }
      }
      if (!remote.getTracks().some((item) => item.id === event.track.id)) {
        remote.addTrack(event.track)
      }
      publishRemote()
    }

    pc.onicecandidate = (event) => {
      if (!event.candidate || !peerIdRef.current) return
      emitWebRtcIce({
        callId: callIdRef.current,
        toUserId: peerIdRef.current,
        candidate: event.candidate.toJSON(),
      })
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") void pc.restartIce()
      if (pc.connectionState === "connected") setRemoteJoined(true)
    }

    syncLocalTracks(pc, localStreamRef.current, screenStreamRef.current, cameraOffRef.current)

    async function flushIce() {
      if (!pcRef.current?.remoteDescription) return
      const queued = pendingIce.current.splice(0)
      for (const candidate of queued) {
        try {
          await pcRef.current.addIceCandidate(candidate)
        } catch {
          /* stale */
        }
      }
    }

    async function createOffer(opts?: { replaceStuck?: boolean }) {
      if (cancelled || !pcRef.current || !isCaller) return
      if (!peerReady.current) return
      const connection = pcRef.current
      if (remote.getTracks().some(trackIsUsable)) return
      if (connection.connectionState === "connected") return

      // Never interrupt a healthy pending answer — this was causing multi-minute stalls.
      if (connection.signalingState === "have-local-offer") {
        const waitingMs = Date.now() - offerSentAt.current
        if (!opts?.replaceStuck || waitingMs < 5000) return
        try {
          await connection.setLocalDescription({ type: "rollback" })
        } catch {
          return
        }
      }
      if (connection.signalingState !== "stable") return

      try {
        makingOffer.current = true
        syncLocalTracks(
          connection,
          localStreamRef.current,
          screenStreamRef.current,
          cameraOffRef.current
        )
        const offer = await connection.createOffer()
        if (cancelled || connection.signalingState !== "stable") return
        await connection.setLocalDescription(offer)
        offerSentAt.current = Date.now()
        emitWebRtcOffer({
          callId: callIdRef.current,
          toUserId: peerIdRef.current,
          sdp: {
            type: connection.localDescription!.type,
            sdp: connection.localDescription!.sdp,
          },
        })
      } catch {
        /* glare */
      } finally {
        makingOffer.current = false
      }
    }

    async function handleOffer(sdp: RTCSessionDescriptionInit) {
      if (!pcRef.current) return
      const fingerprint = `${sdp.type}:${sdp.sdp ?? ""}`
      if (fingerprint && fingerprint === lastHandledSdp.current) return
      const connection = pcRef.current
      const collision =
        makingOffer.current || connection.signalingState !== "stable"
      if (collision && !polite) return

      try {
        if (collision) {
          await Promise.all([
            connection.setLocalDescription({ type: "rollback" }),
            connection.setRemoteDescription(sdp),
          ])
        } else {
          await connection.setRemoteDescription(sdp)
        }
        lastHandledSdp.current = fingerprint
        await flushIce()
        syncLocalTracks(
          connection,
          localStreamRef.current,
          screenStreamRef.current,
          cameraOffRef.current
        )
        const answer = await connection.createAnswer()
        await connection.setLocalDescription(answer)
        emitWebRtcAnswer({
          callId: callIdRef.current,
          toUserId: peerIdRef.current,
          sdp: {
            type: connection.localDescription!.type,
            sdp: connection.localDescription!.sdp,
          },
        })
        setRemoteJoined(true)
      } catch {
        /* bad sdp */
      }
    }

    async function handleAnswer(sdp: RTCSessionDescriptionInit) {
      if (!pcRef.current) return
      try {
        if (pcRef.current.signalingState !== "have-local-offer") return
        await pcRef.current.setRemoteDescription(sdp)
        await flushIce()
        setRemoteJoined(true)
        syncLocalTracks(
          pcRef.current,
          localStreamRef.current,
          screenStreamRef.current,
          cameraOffRef.current
        )
      } catch {
        /* ignore */
      }
    }

    async function handleIce(candidate: RTCIceCandidateInit) {
      if (!pcRef.current?.remoteDescription) {
        pendingIce.current.push(candidate)
        return
      }
      try {
        await pcRef.current.addIceCandidate(candidate)
      } catch {
        /* ignore */
      }
    }

    function enqueueSignal(work: () => Promise<void>) {
      signalChain.current = signalChain.current
        .then(work)
        .catch(() => undefined)
    }

    function onSignal(signal: BufferedSignal) {
      if (signal.callId !== callIdRef.current) return
      // Accept same-call signals even if peer id is briefly stale.
      enqueueSignal(async () => {
        if (signal.kind === "offer") await handleOffer(signal.sdp)
        if (signal.kind === "answer") await handleAnswer(signal.sdp)
        if (signal.kind === "ice") await handleIce(signal.candidate)
      })
    }

    function onParticipant(payload: unknown) {
      const record = asRecord(payload)
      if (!record || record.callId !== callIdRef.current) return
      if (
        typeof record.userId === "string" &&
        record.userId &&
        peerIdRef.current &&
        record.userId !== peerIdRef.current
      ) {
        return
      }
      if (record.action === "joined") {
        peerReady.current = true
        setRemoteJoined(true)
        if (isCaller) void createOffer()
      }
      if (record.action === "left") {
        peerReady.current = false
        setRemoteJoined(false)
        setRemoteStream(null)
        setRemoteCameraOff(false)
        setRemoteMuted(false)
      }
    }

    function onMedia(payload: unknown) {
      const record = asRecord(payload)
      if (!record || record.callId !== callIdRef.current) return
      if (
        typeof record.userId === "string" &&
        record.userId &&
        peerIdRef.current &&
        record.userId !== peerIdRef.current
      ) {
        return
      }
      if (typeof record.cameraOff === "boolean") setRemoteCameraOff(record.cameraOff)
      if (typeof record.muted === "boolean") setRemoteMuted(record.muted)
    }

    function onReady(payload: unknown) {
      const record = asRecord(payload)
      if (!record || record.callId !== callIdRef.current) return
      if (!isCaller) return
      peerReady.current = true
      void createOffer({ replaceStuck: true })
    }

    const unsubscribeSignals = subscribeWebRtcSignals(callId, onSignal)
    socket.on("call:participant", onParticipant)
    socket.on("call:media", onMedia)
    socket.on("webrtc:ready", onReady)

    // Tell the caller we can accept an offer (covers missed participant events).
    if (!isCaller && peerIdRef.current) {
      emitWebRtcReady({
        callId: callIdRef.current,
        toUserId: peerIdRef.current,
      })
    }

    let kickoff: number | undefined
    let retry: number | undefined
    let readyPulse: number | undefined
    if (isCaller) {
      kickoff = window.setTimeout(() => {
        if (cancelled) return
        peerReady.current = true
        void createOffer()
      }, 400)
      // Retry only when idle (stable) or when an offer has been stuck >5s.
      retry = window.setInterval(() => {
        if (cancelled || !pcRef.current) return
        if (remote.getTracks().some(trackIsUsable)) return
        if (pcRef.current.connectionState === "connected") return
        peerReady.current = true
        if (pcRef.current.signalingState === "stable") {
          void createOffer()
          return
        }
        if (
          pcRef.current.signalingState === "have-local-offer" &&
          offerSentAt.current > 0 &&
          Date.now() - offerSentAt.current > 5000
        ) {
          void createOffer({ replaceStuck: true })
        }
      }, 2000)
    } else {
      readyPulse = window.setInterval(() => {
        if (cancelled || !pcRef.current || !peerIdRef.current) return
        if (remote.getTracks().some(trackIsUsable)) return
        if (pcRef.current.connectionState === "connected") return
        if (pcRef.current.remoteDescription) return
        emitWebRtcReady({
          callId: callIdRef.current,
          toUserId: peerIdRef.current,
        })
      }, 2500)
    }

    return () => {
      cancelled = true
      if (kickoff != null) window.clearTimeout(kickoff)
      if (retry != null) window.clearInterval(retry)
      if (readyPulse != null) window.clearInterval(readyPulse)
      unsubscribeSignals()
      socket.off("call:participant", onParticipant)
      socket.off("call:media", onMedia)
      socket.off("webrtc:ready", onReady)
      // Do NOT clear the global signal buffer here — remounts (Strict Mode /
      // peer id settle) must still see offers that arrived mid-transition.
      teardown()
    }
  }, [enabled, socketConnected, callId, peerUserId, isCaller, kind])

  useEffect(() => {
    const pc = pcRef.current
    if (!pc || !enabled) return
    syncLocalTracks(pc, localStream, screenStream, cameraOff)
  }, [enabled, localStream, screenStream, cameraOff])

  useEffect(() => {
    if (!enabled || !callId) return
    emitCallMedia({ callId, muted, cameraOff })
  }, [enabled, callId, muted, cameraOff])

  return {
    remoteStream,
    remoteJoined:
      remoteJoined ||
      Boolean(
        remoteStream &&
          (remoteStream.getVideoTracks().some(trackIsUsable) ||
            remoteStream.getAudioTracks().some(trackIsUsable))
      ),
    hasRemoteVideo: Boolean(
      remoteStream?.getVideoTracks().some(trackIsUsable) && !remoteCameraOff
    ),
    remoteCameraOff,
    remoteMuted,
  }
}

function syncLocalTracks(
  pc: RTCPeerConnection,
  localStream: MediaStream | null,
  screenStream: MediaStream | null,
  cameraOff: boolean
) {
  const audio = localStream?.getAudioTracks().find(trackIsUsable) ?? null
  const video =
    screenStream?.getVideoTracks().find(trackIsUsable) ??
    (!cameraOff
      ? localStream?.getVideoTracks().find(trackIsUsable) ?? null
      : null)

  for (const transceiver of pc.getTransceivers()) {
    if (transceiver.currentDirection === "stopped") continue
    try {
      transceiver.direction = "sendrecv"
    } catch {
      /* ignore */
    }
  }

  const audioSender =
    pc.getSenders().find((sender) => sender.track?.kind === "audio") ||
    pc.getTransceivers().find((item) => item.receiver.track.kind === "audio")
      ?.sender
  const videoSender =
    pc.getSenders().find((sender) => sender.track?.kind === "video") ||
    pc.getTransceivers().find((item) => item.receiver.track.kind === "video")
      ?.sender

  if (audio) {
    if (audioSender) void audioSender.replaceTrack(audio)
    else if (localStream) pc.addTrack(audio, localStream)
  }

  if (video) {
    const stream = screenStream ?? localStream
    if (videoSender) void videoSender.replaceTrack(video)
    else if (stream) pc.addTrack(video, stream)
  } else if (videoSender) {
    void videoSender.replaceTrack(null)
  }
}
