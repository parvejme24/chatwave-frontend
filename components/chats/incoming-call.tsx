"use client"

import { PhoneOff, Video } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function IncomingCall() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      if (event.key === "Escape") {
        setOpen(false)
        return
      }

      if ((event.key === "i" || event.key === "I") && !typing) {
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ring-name"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,11,16,0.62)] p-5 backdrop-blur-[5px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
    >
      <div className="w-full max-w-[340px] rounded-[28px] bg-surface px-[26px] pt-[34px] pb-[26px] text-center shadow-[0_24px_64px_rgba(17,24,33,0.18)]">
        <div className="relative mx-auto mb-5 grid size-24 place-items-center">
          <div className="absolute inset-0 grid place-items-center" aria-hidden>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="cw-motion absolute size-24 rounded-full border-2 border-signal"
                style={{
                  animation: "cw-ripple 2.6s cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
                  animationDelay: `${index * 0.65}s`,
                }}
              />
            ))}
          </div>
          <div className="relative z-[2] grid size-24 place-items-center rounded-full border-[3px] border-white/14 bg-linear-to-br from-[#3A4A63] to-[#1B2431] font-display text-[30px] font-bold text-white">
            TR
          </div>
        </div>
        <p className="mb-1.5 font-mono text-[11px] font-semibold tracking-[0.16em] text-pulse uppercase">
          Incoming video call
        </p>
        <h3
          id="ring-name"
          className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink"
        >
          Tanvir Rahman
        </h3>
        <p className="mt-[3px] text-[13.5px] text-ink-3">Calling on ChatWave</p>
        <div className="mt-[26px] flex justify-center gap-[34px] max-[479px]:gap-[26px]">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              toast("Call declined")
            }}
            className="flex cursor-pointer flex-col items-center gap-2 text-xs text-ink-3"
          >
            <span className="grid size-[58px] place-items-center rounded-full bg-pulse text-white transition-transform hover:scale-105">
              <PhoneOff className="size-6 stroke-[1.75]" aria-hidden />
            </span>
            Decline
          </button>
          <Link
            href="/call?type=video&peer=Tanvir%20Rahman"
            className="flex cursor-pointer flex-col items-center gap-2 text-xs text-ink-3"
          >
            <span
              className="cw-motion grid size-[58px] place-items-center rounded-full bg-ok text-white"
              style={{ animation: "cw-bob 1.5s ease-in-out infinite" }}
            >
              <Video className="size-6 stroke-[1.75]" aria-hidden />
            </span>
            Accept
          </Link>
        </div>
      </div>
    </div>
  )
}
