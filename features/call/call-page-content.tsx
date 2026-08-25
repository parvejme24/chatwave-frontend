"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { CallDock } from "./call-dock"
import { CallHeader } from "./call-header"
import { CallStage } from "./call-stage"
import { useIdleChrome } from "./use-idle-chrome"
import { useLocalMedia } from "./use-local-media"
import { useStartCall } from "./use-start-call"
import { formatCallTime, LAST_CALL_KEY, parseCallType, persistLiveCallId } from "../../lib/call"
import { initialsFromName } from "../../lib/data/settings"
import { mutationErrorMessage } from "../../lib/store/api-error"
import {
  useEndCallMutation,
  useGetCallQuery,
} from "../../lib/store/calls-api"
import { playSound } from "../../lib/sounds"
import type { CallLiveStatus } from "../../lib/types/call"

export function CallPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const kind = parseCallType(params.get("type"))
  const callId = params.get("callId")?.trim() || ""
  const conversationId = params.get("conversationId")?.trim() || ""
  const userId = params.get("userId")?.trim() || ""
  const peerName = params.get("peer")?.trim() || ""
  const started = useRef(false)
  const ended = useRef(false)
  const { startCall, isStarting } = useStartCall()
  const [endCallMut] = useEndCallMutation()
  const { data: live, isLoading, isError } = useGetCallQuery(callId, {
    skip: !callId,
    pollingInterval: callId ? 2000 : 0,
  })

  const peer = live?.peer.name || peerName || "ChatWave"
  const initials = live?.peer.initials || initialsFromName(peer)
  const status: CallLiveStatus | "connecting" = live?.status
    ?? (isStarting || (!callId && (conversationId || userId))
      ? "ringing"
      : "connecting")
  const active = status === "active"

  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [sharing, setSharing] = useState(false)

  const chromeVisible = useIdleChrome(kind === "video")
  const localStream = useLocalMedia(kind === "video" && !cameraOff)
  const timer = formatCallTime(seconds)

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
    playSound("callStart")
  }, [])

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
    if (live.status === "ended" || live.status === "missed" || live.status === "declined") {
      if (ended.current) return
      ended.current = true
      playSound("callEnd")
      toast(
        live.status === "declined"
          ? "Call declined"
          : live.status === "missed"
            ? "Missed call"
            : "Call ended"
      )
      router.replace("/calls")
    }
  }, [live, router])

  async function endCall() {
    if (ended.current) return
    ended.current = true
    playSound("callEnd")
    if (callId) {
      try {
        await endCallMut({ id: callId, ice: "unknown" }).unwrap()
      } catch (error) {
        toast.error(mutationErrorMessage(error, "Could not end call"))
      }
    }
    sessionStorage.setItem(LAST_CALL_KEY, `${peer} · ${timer}`)
    toast("Call ended")
    router.replace("/calls")
  }

  const waiting = !live && (isLoading || isStarting || !callId)

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
        timer={active ? timer : status === "ringing" ? "Ringing" : "Connecting"}
        visible={chromeVisible}
      />
      {isError && callId ? (
        <p className="relative z-20 m-auto px-6 text-center text-sm text-white/70">
          This call is no longer available.
        </p>
      ) : (
        <CallStage
          kind={kind}
          peer={peer}
          initials={initials}
          localStream={localStream}
          status={waiting ? "ringing" : status}
        />
      )}
      <CallDock
        kind={kind}
        muted={muted}
        cameraOff={cameraOff}
        speakerOn={speakerOn}
        sharing={sharing}
        visible={chromeVisible}
        onMutedChange={setMuted}
        onCameraOffChange={setCameraOff}
        onSpeakerOnChange={setSpeakerOn}
        onSharingChange={setSharing}
        onEnd={() => void endCall()}
      />
    </section>
  )
}
