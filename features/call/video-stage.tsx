"use client"

import { MonitorUp, VideoOff } from "lucide-react"
import { useEffect, useRef } from "react"

import { SpeakRing } from "./speak-ring"

function hasLiveVideo(stream: MediaStream | null | undefined) {
  return Boolean(
    stream
      ?.getVideoTracks()
      .some((track) => track.readyState !== "ended" && track.enabled)
  )
}

export function VideoStage({
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
  const mainRef = useRef<HTMLVideoElement>(null)
  const pipRef = useRef<HTMLVideoElement>(null)

  const ringing = status === "ringing" || status === "connecting"
  const showRemoteVideo =
    !remoteCameraOff &&
    (hasRemoteVideo || hasLiveVideo(remoteStream)) &&
    Boolean(remoteStream)

  const mainStream =
    sharing && screenStream
      ? screenStream
      : showRemoteVideo
        ? remoteStream!
        : null

  const pipStream =
    !cameraOff && hasLiveVideo(localStream) ? localStream : null

  useEffect(() => {
    const node = mainRef.current
    if (!node) return
    if (node.srcObject !== mainStream) node.srcObject = mainStream
    if (mainStream) void node.play().catch(() => undefined)
  }, [mainStream])

  useEffect(() => {
    const node = pipRef.current
    if (!node) return
    if (node.srcObject !== pipStream) node.srcObject = pipStream
    if (pipStream) void node.play().catch(() => undefined)
  }, [pipStream])

  const waitingLabel = ringing
    ? "Calling…"
    : remoteCameraOff
      ? "Camera off"
      : status === "active" || remoteJoined
        ? "Connecting video…"
        : "Waiting for them to join…"

  return (
    <div className="absolute inset-0 bg-linear-to-b from-[#233043] to-[#0F151E]">
      <div className="relative size-full">
        {mainStream ? (
          <video
            ref={mainRef}
            muted
            playsInline
            autoPlay
            className={
              sharing
                ? "absolute inset-0 size-full object-contain bg-black"
                : "absolute inset-0 size-full object-cover"
            }
          />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <div className="flex flex-col items-center">
              <SpeakRing
                initials={initials}
                size="md"
                ripple={ringing && !remoteCameraOff}
              />
              <p className="mt-6 font-display text-[22px] font-bold tracking-[-0.02em] text-white">
                {peer}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] text-white/50">
                {remoteCameraOff ? (
                  <VideoOff className="size-3.5 stroke-[1.75]" aria-hidden />
                ) : null}
                {waitingLabel}
              </p>
            </div>
            <video ref={mainRef} muted playsInline className="hidden" />
          </div>
        )}

        {sharing ? (
          <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-white uppercase backdrop-blur-sm">
            <MonitorUp className="size-3.5 stroke-[1.75]" aria-hidden />
            Sharing screen
          </span>
        ) : showRemoteVideo ? (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {peer}
          </span>
        ) : remoteCameraOff && !ringing ? (
          <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <VideoOff className="size-3.5 stroke-[1.75]" aria-hidden />
            Camera off
          </span>
        ) : null}
      </div>

      <div className="absolute right-5 bottom-[122px] z-10 w-[148px] overflow-hidden rounded-2xl border-2 border-white/16 bg-[#161C26] shadow-[0_12px_32px_rgba(0,0,0,0.35)] max-[859px]:right-3.5 max-[859px]:bottom-[112px] max-[859px]:w-[108px]">
        <div className="relative aspect-[3/4]">
          {pipStream ? (
            <video
              ref={pipRef}
              muted
              playsInline
              autoPlay
              className="absolute inset-0 size-full object-cover -scale-x-100"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-[#2B3648] to-[#1E2733] text-white/45">
              <video ref={pipRef} muted playsInline className="hidden" />
              <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                <VideoOff className="size-6 stroke-[1.75]" aria-hidden />
                <span className="text-[10px] font-medium tracking-[0.04em] text-white/55 uppercase">
                  Camera off
                </span>
              </div>
            </div>
          )}
          <span className="absolute top-2 left-2 rounded-md bg-black/45 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] text-white uppercase">
            You
          </span>
        </div>
      </div>
    </div>
  )
}
