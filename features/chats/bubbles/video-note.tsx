"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { resolveMediaUrl } from "../../../lib/api"
import { fmtTime } from "../../../lib/waveform"

export function VideoNote({
  duration = 18,
  src,
}: {
  duration?: number
  src?: string
}) {
  const media = resolveMediaUrl(src)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const elapsedRef = useRef(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  useEffect(() => {
    const video = videoRef.current
    if (media && video) {
      if (playing) void video.play()
      else video.pause()
      return
    }
    if (!playing) return
    const timer = window.setInterval(() => {
      const next = elapsedRef.current + 0.1
      if (next >= duration) {
        elapsedRef.current = 0
        setElapsed(0)
        setPlaying(false)
        return
      }
      elapsedRef.current = next
      setElapsed(next)
    }, 100)
    return () => window.clearInterval(timer)
  }, [duration, media, playing])

  const remaining = Math.max(0, duration - elapsed)
  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0

  return (
    <button
      type="button"
      aria-label={`Play video message, ${duration} seconds`}
      onClick={() => setPlaying((value) => !value)}
      className="relative w-[220px] cursor-pointer overflow-hidden rounded-[18px] bg-linear-to-br from-[#3A4A63] to-[#1D2634] shadow-[0_4px_12px_rgba(17,24,33,0.08),0_12px_32px_rgba(17,24,33,0.08)] max-[479px]:w-[180px]"
    >
      <span className="relative block aspect-square w-full overflow-hidden">
        {media ? (
          <video
            ref={videoRef}
            src={media}
            playsInline
            className="size-full object-cover"
            onTimeUpdate={(event) => {
              const current = event.currentTarget.currentTime
              elapsedRef.current = current
              setElapsed(current)
            }}
            onEnded={() => {
              elapsedRef.current = 0
              setElapsed(0)
              setPlaying(false)
            }}
          />
        ) : null}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-12 place-items-center rounded-[14px] bg-[rgba(10,14,20,0.55)] text-white backdrop-blur-[6px]">
            {playing ? (
              <Pause className="size-5 fill-white stroke-none" aria-hidden />
            ) : (
              <Play className="size-5 fill-white stroke-none" aria-hidden />
            )}
          </span>
        </span>
        <span className="absolute right-2 bottom-2 rounded-[8px] bg-[rgba(10,14,20,0.72)] px-2 py-[3px] font-mono text-[11px] font-semibold text-white backdrop-blur-[6px]">
          {fmtTime(playing ? remaining : duration)}
        </span>
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
          <span
            className="block h-full bg-signal"
            style={{ width: `${progress * 100}%` }}
          />
        </span>
      </span>
    </button>
  )
}
