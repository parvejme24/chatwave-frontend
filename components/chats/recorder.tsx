"use client"

import { Send, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import type { RecordKind } from "@/lib/types/chat"
import { fmtTime } from "@/lib/waveform"

type RecorderProps = {
  kind: RecordKind
  onCancel: () => void
  onSend: (duration: number) => void
}

export function Recorder({ kind, onCancel, onSend }: RecorderProps) {
  const [seconds, setSeconds] = useState(0)
  const [bars, setBars] = useState<number[]>([])
  const onSendRef = useRef(onSend)

  useEffect(() => {
    onSendRef.current = onSend
  }, [onSend])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        const next = current + 0.1
        if (next >= 300) {
          window.clearInterval(timer)
          onSendRef.current(next)
          return next
        }
        return next
      })
      setBars((current) => {
        const next = [...current, 6 + Math.random() * 26]
        return next.length > 68 ? next.slice(-68) : next
      })
    }, 100)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      className="flex items-center gap-3.5 rounded-[28px] border border-pulse bg-pulse-wash px-3.5 py-2.5 max-[859px]:gap-[9px] max-[859px]:px-2.5"
      role="status"
    >
      <i
        className="cw-motion size-[11px] shrink-0 rounded-full bg-pulse"
        style={{ animation: "cw-rec 1.25s ease-in-out infinite" }}
        aria-hidden
      />
      <span className="font-mono text-sm font-semibold text-pulse">
        {fmtTime(seconds)}
      </span>
      <div className="flex h-[34px] flex-1 items-center gap-0.5 overflow-hidden">
        {bars.map((height, index) => (
          <i
            key={`${index}-${height}`}
            className="w-[3px] shrink-0 rounded-full bg-pulse opacity-75"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          aria-label="Discard recording"
          className="h-[38px] rounded-[14px] border border-edge px-[18px] text-ink-2 hover:bg-surface-2 max-[859px]:w-[38px] max-[859px]:px-0"
        >
          <Trash2 className="size-4 stroke-[1.75]" aria-hidden />
          <span className="max-[859px]:hidden">Cancel</span>
        </Button>
        <Button
          type="button"
          onClick={() => onSend(seconds)}
          className="h-[38px] rounded-[14px] bg-signal px-[18px] text-white hover:bg-signal-deep"
        >
          <Send className="size-4 stroke-[1.75]" aria-hidden />
          Send
        </Button>
      </div>
      <span className="sr-only">
        Recording {kind === "voice" ? "voice" : "video"} message
      </span>
    </div>
  )
}
