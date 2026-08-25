"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Phone, PhoneOff, Video } from "lucide-react"

import { SpeakRing } from "./speak-ring"
import { signalEase } from "../../components/motion/motion-item"
import type { CallType } from "../../lib/types/call"

export function IncomingCallDialog({
  peer,
  initials,
  kind = "video",
  busy,
  onDecline,
  onAccept,
  onDismiss,
}: {
  peer: string
  initials: string
  kind?: CallType
  busy?: boolean
  onDecline: () => void
  onAccept: () => void
  onDismiss?: () => void
}) {
  const reduceMotion = useReducedMotion()
  const AcceptIcon = kind === "audio" ? Phone : Video

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-call-name"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,11,16,0.62)] p-5 backdrop-blur-[5px]"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: signalEase }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss?.()
      }}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.32, ease: signalEase }}
        className="w-full max-w-[340px] rounded-[28px] bg-surface px-[26px] pt-[34px] pb-[26px] text-center shadow-[0_24px_64px_rgba(17,24,33,0.18)]"
      >
        <div className="mx-auto mb-5">
          <SpeakRing initials={initials} size="sm" />
        </div>
        <p className="mb-1.5 font-mono text-[11px] font-semibold tracking-[0.16em] text-pulse uppercase">
          Incoming {kind === "audio" ? "voice" : "video"} call
        </p>
        <h3
          id="incoming-call-name"
          className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink"
        >
          {peer}
        </h3>
        <p className="mt-[3px] text-[13.5px] text-ink-3">Calling on ChatWave</p>
        <div className="mt-[26px] flex justify-center gap-[34px] max-[479px]:gap-[26px]">
          <button
            type="button"
            disabled={busy}
            onClick={onDecline}
            className="flex cursor-pointer flex-col items-center gap-2 text-xs text-ink-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="grid size-[58px] place-items-center rounded-full bg-pulse text-white transition-transform hover:scale-105">
              <PhoneOff className="size-6 stroke-[1.75]" aria-hidden />
            </span>
            Decline
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onAccept}
            className="flex cursor-pointer flex-col items-center gap-2 text-xs text-ink-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <motion.span
              className="grid size-[58px] place-items-center rounded-full bg-ok text-white"
              animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <AcceptIcon className="size-6 stroke-[1.75]" aria-hidden />
            </motion.span>
            Accept
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
