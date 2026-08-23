"use client"

import { Video } from "lucide-react"
import { useEffect, useRef } from "react"

import { SpeakRing } from "./speak-ring"

export function VideoStage({
  initials,
  localStream,
}: {
  initials: string
  localStream: MediaStream | null
}) {
  const localRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const node = localRef.current
    if (!node) return
    node.srcObject = localStream
    if (localStream) void node.play().catch(() => undefined)
  }, [localStream])

  return (
    <div className="absolute inset-0 bg-linear-to-b from-[#233043] to-[#0F151E]">
      <div className="grid h-full place-items-center">
        <SpeakRing initials={initials} size="md" ripple={false} />
      </div>

      <div className="absolute right-5 bottom-[122px] w-[148px] overflow-hidden rounded-2xl border-2 border-white/16 bg-[#161C26] shadow-[0_12px_32px_rgba(0,0,0,0.35)] max-[859px]:right-3.5 max-[859px]:bottom-[112px] max-[859px]:w-[108px]">
        <div className="relative aspect-[3/4]">
          {localStream ? (
            <video
              ref={localRef}
              muted
              playsInline
              autoPlay
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-[#2B3648] to-[#1E2733] text-white/45">
              <video ref={localRef} muted playsInline className="hidden" />
              <Video className="size-7 stroke-[1.75]" aria-hidden />
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
