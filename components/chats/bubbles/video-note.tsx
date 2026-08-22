"use client"

import { Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { fmtTime } from "@/lib/waveform"

const RADIUS = 92
const LENGTH = 2 * Math.PI * RADIUS

export function VideoNote({ duration = 18 }: { duration?: number }) {
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const elapsedRef = useRef(0)

  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  useEffect(() => {
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
  }, [duration, playing])

  const remaining = Math.max(0, duration - elapsed)
  const offset = LENGTH - (elapsed / duration) * LENGTH

  return (
    <button
      type="button"
      aria-label={`Play video message, ${duration} seconds`}
      onClick={() => setPlaying((value) => !value)}
      className="relative size-[190px] cursor-pointer max-[479px]:size-[158px]"
    >
      <span className="grid size-full place-items-center overflow-hidden rounded-full border-[3px] border-surface bg-linear-to-br from-[#3A4A63] to-[#1D2634] shadow-[0_4px_12px_rgba(17,24,33,0.08),0_12px_32px_rgba(17,24,33,0.08)]">
        {!playing ? (
          <Play className="size-10 fill-white/90 stroke-none text-white/90" aria-hidden />
        ) : null}
      </span>
      <svg
        className="pointer-events-none absolute inset-[-3px] size-[calc(100%+6px)]"
        viewBox="0 0 196 196"
        aria-hidden
      >
        <circle
          cx="98"
          cy="98"
          r={RADIUS}
          fill="none"
          strokeWidth="3"
          className="stroke-edge"
        />
        <circle
          cx="98"
          cy="98"
          r={RADIUS}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className="stroke-signal"
          transform="rotate(-90 98 98)"
          strokeDasharray={LENGTH}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[rgba(10,14,20,0.72)] px-[9px] py-[3px] font-mono text-[11px] font-semibold text-white backdrop-blur-[6px]">
        {fmtTime(playing ? remaining : duration)}
      </span>
    </button>
  )
}
