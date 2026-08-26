"use client"

import { MonitorUp, Video } from "lucide-react"
import { useEffect, useRef } from "react"

import { SpeakRing } from "./speak-ring"

export function VideoStage({
  initials,
  localStream,
  screenStream,
  sharing,
}: {
  initials: string
  localStream: MediaStream | null
  screenStream?: MediaStream | null
  sharing?: boolean
}) {
  const mainRef = useRef<HTMLVideoElement>(null)
  const pipRef = useRef<HTMLVideoElement>(null)
  const mainStream = sharing && screenStream ? screenStream : localStream
  const pipStream = localStream

  useEffect(() => {
    const node = mainRef.current
    if (!node) return
    node.srcObject = mainStream
    if (mainStream) void node.play().catch(() => undefined)
  }, [mainStream])

  useEffect(() => {
    const node = pipRef.current
    if (!node) return
    node.srcObject = pipStream
    if (pipStream) void node.play().catch(() => undefined)
  }, [pipStream])

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
          <div className="grid h-full place-items-center">
            <SpeakRing initials={initials} size="md" ripple={false} />
            <video ref={mainRef} muted playsInline className="hidden" />
          </div>
        )}

        {sharing ? (
          <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-white uppercase backdrop-blur-sm">
            <MonitorUp className="size-3.5 stroke-[1.75]" aria-hidden />
            Sharing screen
          </span>
        ) : null}
      </div>

      <div className="absolute right-5 bottom-[122px] w-[148px] overflow-hidden rounded-2xl border-2 border-white/16 bg-[#161C26] shadow-[0_12px_32px_rgba(0,0,0,0.35)] max-[859px]:right-3.5 max-[859px]:bottom-[112px] max-[859px]:w-[108px]">
        <div className="relative aspect-[3/4]">
          {pipStream ? (
            <video
              ref={pipRef}
              muted
              playsInline
              autoPlay
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-[#2B3648] to-[#1E2733] text-white/45">
              <video ref={pipRef} muted playsInline className="hidden" />
              {sharing ? (
                <span className="font-display text-lg font-semibold text-white/70">
                  {initials}
                </span>
              ) : (
                <Video className="size-7 stroke-[1.75]" aria-hidden />
              )}
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
