"use client"

import { SpeakRing } from "./speak-ring"
import { VideoStage } from "./video-stage"

export function CallStage({
  kind,
  peer,
  initials,
  localStream,
  remoteStream,
  screenStream,
  sharing,
  status = "active",
  remoteJoined = false,
  hasRemoteVideo = false,
  cameraOff = false,
  remoteCameraOff = false,
}: {
  kind: "audio" | "video"
  peer: string
  initials: string
  localStream: MediaStream | null
  remoteStream?: MediaStream | null
  screenStream?: MediaStream | null
  sharing?: boolean
  status?: "ringing" | "active" | "ended" | "missed" | "declined" | "connecting"
  remoteJoined?: boolean
  hasRemoteVideo?: boolean
  cameraOff?: boolean
  remoteCameraOff?: boolean
}) {
  if (kind === "video" || sharing) {
    return (
      <VideoStage
        peer={peer}
        initials={initials}
        localStream={localStream}
        remoteStream={remoteStream}
        screenStream={screenStream}
        sharing={sharing}
        status={status}
        remoteJoined={remoteJoined}
        hasRemoteVideo={hasRemoteVideo}
        cameraOff={cameraOff}
        remoteCameraOff={remoteCameraOff}
      />
    )
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
      <SpeakRing initials={initials} size="lg" ripple={status === "ringing"} />
      <h2 className="mt-8 font-display text-[27px] font-bold tracking-[-0.03em] text-white max-[479px]:text-[24px] [@media(max-height:520px)_and_(orientation:landscape)]:mt-4">
        {peer}
      </h2>
      <p className="mt-1.5 text-[13.5px] text-white/50">
        {status === "ringing"
          ? "Calling…"
          : status === "active" && remoteJoined
            ? "Connected · voice is live"
            : status === "active"
              ? "Connecting audio…"
              : "Connecting…"}
      </p>
    </div>
  )
}
