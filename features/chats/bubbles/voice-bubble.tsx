"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { MessageMeta } from "./message-meta"
import { useChat } from "../chat-provider"
import { resolveMediaUrl } from "../../../lib/api"
import type { ChatMessage } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"
import { fmtTime, makePeaks } from "../../../lib/waveform"

const RATES = [1, 1.5, 2] as const

export function VoiceBubble({
  message,
  outgoing,
  seenTotal = 0,
}: {
  message: ChatMessage
  outgoing: boolean
  seenTotal?: number
}) {
  const { playingVoiceId, setPlayingVoiceId } = useChat()
  const src = resolveMediaUrl(message.mediaUrl)
  const total = message.duration ?? 12
  const peaks = useMemo(
    () => makePeaks(message.seed ?? 12, 32),
    [message.seed]
  )
  const [elapsed, setElapsed] = useState(0)
  const [rateIndex, setRateIndex] = useState(0)
  const playing = playingVoiceId === message.id
  const elapsedRef = useRef(0)
  const rateRef = useRef<(typeof RATES)[number]>(RATES[0])
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  useEffect(() => {
    rateRef.current = RATES[rateIndex]
    const audio = audioRef.current
    if (audio) audio.playbackRate = RATES[rateIndex]
  }, [rateIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (src && audio) {
      if (playing) void audio.play()
      else audio.pause()
      return
    }
    if (!playing) return
    const timer = window.setInterval(() => {
      const next = elapsedRef.current + 0.1 * rateRef.current
      if (next >= total) {
        elapsedRef.current = 0
        setElapsed(0)
        setPlayingVoiceId(null)
        return
      }
      elapsedRef.current = next
      setElapsed(next)
    }, 100)
    return () => window.clearInterval(timer)
  }, [playing, setPlayingVoiceId, src, total])

  function togglePlay() {
    if (playing) {
      setPlayingVoiceId(null)
      return
    }
    setPlayingVoiceId(message.id)
  }

  function seek(event: React.MouseEvent<HTMLSpanElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const next = ((event.clientX - rect.left) / rect.width) * total
    elapsedRef.current = next
    setElapsed(next)
    const audio = audioRef.current
    if (audio && src) audio.currentTime = next
  }

  const ratio = total > 0 ? elapsed / total : 0
  const rate = RATES[rateIndex]

  return (
    <div
      className={cn(
        "rounded-[20px] border px-3.5 pt-[9px] pb-2 shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        outgoing
          ? "rounded-br-[7px] border-signal bg-signal text-white"
          : "rounded-bl-[7px] border-edge bg-surface text-ink"
      )}
    >
      {src ? (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={(event) => {
            const current = event.currentTarget.currentTime
            elapsedRef.current = current
            setElapsed(current)
          }}
          onEnded={() => {
            elapsedRef.current = 0
            setElapsed(0)
            setPlayingVoiceId(null)
          }}
        />
      ) : null}
      <div className="flex min-w-[246px] items-center gap-3 py-0.5 max-[479px]:min-w-[190px]">
        <button
          type="button"
          aria-label={playing ? "Pause voice message" : "Play voice message"}
          onClick={togglePlay}
          className={cn(
            "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full transition-transform hover:scale-105",
            outgoing ? "bg-white text-signal" : "bg-signal text-white"
          )}
        >
          {playing ? (
            <Pause className="size-[17px] fill-current stroke-none" aria-hidden />
          ) : (
            <Play className="size-[17px] fill-current stroke-none" aria-hidden />
          )}
        </button>
        <span className="min-w-0 flex-1">
          <span
            role="slider"
            tabIndex={0}
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={Math.round(elapsed)}
            onClick={seek}
            className="flex h-[30px] w-full cursor-pointer items-center gap-0.5"
          >
            {peaks.map((peak, index) => (
              <i
                key={index}
                className={cn(
                  "max-w-[3px] min-w-[2px] flex-1 rounded-full",
                  index / peaks.length <= ratio
                    ? outgoing
                      ? "bg-white"
                      : "bg-signal"
                    : outgoing
                      ? "bg-white/38"
                      : "bg-edge-2"
                )}
                style={{ height: `${Math.round(peak * 26 + 4)}px` }}
              />
            ))}
          </span>
          <span
            className={cn(
              "mt-px flex items-center justify-between font-mono text-[11px]",
              outgoing ? "text-white/72" : "text-ink-3"
            )}
          >
            <span>{fmtTime(Math.min(elapsed, total))}</span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                className={cn(
                  "cursor-pointer rounded-full px-1.5 py-px text-[10.5px] font-semibold",
                  outgoing ? "bg-white/22 text-white" : "bg-surface-3"
                )}
                onClick={() => setRateIndex((index) => (index + 1) % RATES.length)}
              >
                {rate}×
              </button>
              <span>{fmtTime(total)}</span>
            </span>
          </span>
        </span>
      </div>
      <div className="mt-0.5 text-right">
        <MessageMeta time={message.time} status={message.status} outgoing={outgoing} seenCount={message.seenCount} seenTotal={seenTotal} />
      </div>
    </div>
  )
}
