"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { CallDock } from "./call-dock"
import { CallHeader } from "./call-header"
import { CallStage } from "./call-stage"
import { useCallMedia } from "./use-call-media"
import { useCallWebRtc } from "./use-call-webrtc"
import { useIdleChrome } from "./use-idle-chrome"
import { useStartCall } from "./use-start-call"
import {
  formatCallTime,
  LAST_CALL_KEY,
  parseCallType,
  persistLiveCallId,
  consumeCallRemotelyClosed,
} from "../../lib/call"
import { initialsFromName } from "../../lib/data/settings"
import { emitCallLeave } from "../../lib/realtime/socket"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { selectAuthUser } from "../../lib/store/auth-slice"
import {
  useEndCallMutation,
  useGetCallQuery,
} from "../../lib/store/calls-api"
import { useAppSelector } from "../../lib/store/hooks"
import { selectSocketConnected } from "../../lib/store/realtime-slice"
import { playSound, startSoundLoop, stopSoundLoop } from "../../lib/sounds"
import { callEndedMessage, type CallLiveStatus } from "../../lib/types/call"

export function CallPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const me = useAppSelector(selectAuthUser)
  const kind = parseCallType(params.get("type"))
  const callId = params.get("callId")?.trim() || ""
  const conversationId = params.get("conversationId")?.trim() || ""
  const userId = params.get("userId")?.trim() || ""
  const peerName = params.get("peer")?.trim() || ""
  const started = useRef(false)
  const ended = useRef(false)
  const ignoreEndUntil = useRef(0)
  const connectedSound = useRef(false)
  const { startCall, isStarting } = useStartCall()
  const [endCallMut] = useEndCallMutation()
  const { data: live, isLoading, isError, isFetching } = useGetCallQuery(callId, {
    skip: !callId,
    // Socket call:ended updates cache; keep light polling as backup only.
    pollingInterval: callId ? 4000 : 0,
  })

  const peer = live?.peer.name || peerName || "ChatWave"
  const initials = live?.peer.initials || initialsFromName(peer)
  const status: CallLiveStatus | "connecting" = live?.status
    ?? (isStarting || (!callId && (conversationId || userId))
      ? "ringing"
      : "connecting")
  const active = status === "active"
  const waiting = !live && (isLoading || isStarting || !callId)
  const ringing = !active && !ended.current && (waiting || status === "ringing" || status === "connecting")
  // Prepare peer connection while ringing so we don't miss the peer's join.
  const webrtcEnabled =
    Boolean(callId) &&
    (status === "ringing" || status === "active" || status === "connecting")

  const [seconds, setSeconds] = useState(0)
  const [speakerOn, setSpeakerOn] = useState(true)
  const media = useCallMedia(kind)
  const stopAllMedia = media.stopAll
  const socketConnected = useAppSelector(selectSocketConnected)
  const isCaller = Boolean(me?.id && live?.initiatedBy && live.initiatedBy === me.id)
  // Callee already knows the caller is in the call once status is active.
  const peerLikelyJoined = active && !isCaller
  const { remoteStream, remoteJoined, hasRemoteVideo, remoteCameraOff } =
    useCallWebRtc({
    callId,
    peerUserId: live?.peer.id || userId,
    iceServers: live?.iceServers,
    localStream: media.camera,
    screenStream: media.screen,
    kind,
    // Prefer starting WebRTC once local media is ready so the first offer/answer
    // includes camera tracks (avoids both sides stuck on "Connecting video…").
    enabled:
      webrtcEnabled &&
      Boolean(live?.peer.id || userId) &&
      (kind === "audio" || Boolean(media.camera) || media.cameraOff),
    socketConnected,
    isCaller,
    muted: media.muted,
    cameraOff: media.cameraOff,
    speakerOn,
  })
  const showRemoteJoined = remoteJoined || peerLikelyJoined
  const chromeVisible = useIdleChrome(kind === "video" || media.sharing)
  const timer = formatCallTime(seconds)
  // Don't flash "no longer available" on a transient refetch error while we
  // still have a live ringing/active call in cache.
  const callGone =
    Boolean(callId) &&
    isError &&
    !isFetching &&
    (!live ||
      live.status === "ended" ||
      live.status === "missed" ||
      live.status === "declined")

  useEffect(() => {
    if (callId) persistLiveCallId(callId)
  }, [callId])

  useEffect(() => {
    if (callId || started.current) return
    if (!conversationId && !userId) {
      toast.error("Start a call from a chat or contact")
      router.replace("/contacts")
      return
    }
    started.current = true
    void startCall({ type: kind, conversationId, userId, peer: peerName }).catch(
      (error) => {
        started.current = false
        toast.error(mutationErrorMessage(error, "Could not start call"))
        router.replace("/chats")
      }
    )
  }, [callId, conversationId, kind, peerName, router, startCall, userId])

  useEffect(() => {
    if (!ringing) {
      stopSoundLoop("incoming")
      return
    }
    startSoundLoop("incoming")
    return () => stopSoundLoop("incoming")
  }, [ringing])

  useEffect(() => {
    if (!active || connectedSound.current) return
    connectedSound.current = true
    stopSoundLoop("incoming")
    playSound("callStart")
  }, [active])

  useEffect(() => {
    if (!active) return
    const startedAt = live?.answeredAt
      ? Date.parse(live.answeredAt)
      : Date.now()
    const id = window.setInterval(() => {
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
    }, 1000)
    return () => window.clearInterval(id)
  }, [active, live?.answeredAt])

  useEffect(() => {
    if (!live) return
    if (
      live.status !== "ended" &&
      live.status !== "missed" &&
      live.status !== "declined"
    ) {
      return
    }
    if (ended.current) return
    ended.current = true
    stopSoundLoop("incoming")
    stopAllMedia()
    const remotelyClosed = consumeCallRemotelyClosed(callId)
    if (!remotelyClosed) {
      playSound("callEnd")
      const endedByIsMe = Boolean(live.endedBy && me?.id && live.endedBy === me.id)
      const endedByName =
        live.endedBy && !endedByIsMe
          ? peer.split(" ")[0] || peer
          : null
      toast(
        callEndedMessage(live.status, {
          endedByIsMe,
          endedByName,
        })
      )
    }
    if (window.location.pathname.startsWith("/call")) {
      router.replace("/calls")
    }
  }, [callId, live, me?.id, peer, router, stopAllMedia])

  function endCall() {
    if (ended.current) return
    // Stopping screen share can shift the dock; ignore accidental End clicks briefly.
    if (Date.now() < ignoreEndUntil.current) return
    ended.current = true
    stopSoundLoop("incoming")
    playSound("callEnd")
    const id = callId
    // Leave the UI immediately; hang-up continues in the background.
    persistLiveCallId(null)
    media.stopAll()
    sessionStorage.setItem(LAST_CALL_KEY, `${peer} · ${timer}`)
    toast("Call ended")
    router.replace("/calls")
    if (!id) return
    void endCallMut({ id })
      .unwrap()
      .then(() => emitCallLeave(id))
      .catch((error) => {
        toast.error(mutationErrorMessage(error, "Could not end call"))
      })
  }
  async function toggleShare(next: boolean) {
    if (!active) return
    try {
      if (next) {
        await media.startShare()
        toast("Sharing your screen")
      } else {
        ignoreEndUntil.current = Date.now() + 600
        media.stopShare()
        toast("Stopped sharing")
      }
    } catch (error) {
      toast.error(
        mutationErrorMessage(error, "Could not share screen. Allow screen access and try again.")
      )
    }
  }

  return (
    <section
      className="relative flex h-dvh flex-col overflow-hidden bg-[#0A0D13] text-white"
      style={{
        backgroundImage:
          "radial-gradient(85% 70% at 50% 0%, rgba(43,63,255,0.20), transparent 70%)",
      }}
    >
      <CallHeader
        peer={peer}
        kind={kind}
        timer={active ? timer : status === "ringing" || waiting ? "Ringing" : "Connecting"}
        visible={chromeVisible}
      />
      {callGone ? (
        <p className="relative z-20 m-auto px-6 text-center text-sm text-white/70">
          This call is no longer available.
        </p>
      ) : (
        <CallStage
          kind={kind}
          peer={peer}
          initials={initials}
          localStream={media.camera}
          remoteStream={remoteStream}
          screenStream={media.screen}
          sharing={media.sharing}
          status={waiting ? "ringing" : status}
          remoteJoined={showRemoteJoined}
          hasRemoteVideo={hasRemoteVideo}
          cameraOff={media.cameraOff}
          remoteCameraOff={remoteCameraOff}
        />
      )}
      <CallDock
        kind={kind}
        muted={media.muted}
        cameraOff={media.cameraOff}
        speakerOn={speakerOn}
        sharing={media.sharing}
        visible={chromeVisible}
        controlsEnabled={active}
        onMutedChange={media.setMuted}
        onCameraOffChange={media.setCameraOff}
        onSpeakerOnChange={setSpeakerOn}
        onSharingChange={(value) => void toggleShare(value)}
        onEnd={endCall}
      />
    </section>
  )
}
