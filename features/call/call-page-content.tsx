"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { CallDock } from "./call-dock"
import { CallHeader } from "./call-header"
import { CallStage } from "./call-stage"
import { useIdleChrome } from "./use-idle-chrome"
import { useLocalMedia } from "./use-local-media"
import { formatCallTime, LAST_CALL_KEY, parseCallType } from "../../lib/call"
import { initialsFromName } from "../../lib/data/settings"
import { playSound } from "../../lib/sounds"

export function CallPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const kind = parseCallType(params.get("type"))
  const peer = params.get("peer")?.trim() || "Nadia Hasan"
  const initials = initialsFromName(peer)

  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [sharing, setSharing] = useState(false)

  const chromeVisible = useIdleChrome(kind === "video")
  const localStream = useLocalMedia(kind === "video" && !cameraOff)
  const timer = formatCallTime(seconds)

  useEffect(() => {
    playSound("callStart")
    const tick = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(tick)
  }, [])

  function endCall() {
    playSound("callEnd")
    sessionStorage.setItem(LAST_CALL_KEY, `${peer} · ${timer}`)
    toast("Call ended")
    router.push("/chats")
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
        timer={timer}
        visible={chromeVisible}
      />
      <CallStage
        kind={kind}
        peer={peer}
        initials={initials}
        localStream={localStream}
      />
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
        onEnd={endCall}
      />
    </section>
  )
}
