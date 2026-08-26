"use client"

import { Check, CheckCheck, Clock } from "lucide-react"

import type { MessageStatus } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"

export function MessageMeta({
  time,
  status,
  outgoing,
  seen = false,
  latest = false,
}: {
  time: string
  status?: MessageStatus
  outgoing?: boolean
  seen?: boolean
  latest?: boolean
}) {
  const sending = status === "sending"
  const label = statusLabel(status, outgoing, seen, latest)
  const title = [sending ? "Sending..." : label, time].filter(Boolean).join(" · ")

  return (
    <span
      title={title}
      className="mt-1 inline-flex items-center gap-1.5 px-1 font-mono text-[10.5px] leading-none text-ink-3"
    >
      {time ? <time dateTime={time}>{time}</time> : null}
      {label || sending ? (
        <>
          {time ? <span className="text-ink-4" aria-hidden>·</span> : null}
          {sending ? (
            <SendingLabel className="font-medium text-ink-2" />
          ) : (
            <span className="font-medium">{label}</span>
          )}
        </>
      ) : null}
      {outgoing ? <StatusIcon status={status} seen={seen} /> : null}
    </span>
  )
}

export function SendingLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-baseline font-medium", className)}
      aria-label="Sending"
    >
      Sending
      <span className="inline-flex w-[1.1em]" aria-hidden>
        <span
          className="animate-[cw-sending-dot_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: "0ms" }}
        >
          .
        </span>
        <span
          className="animate-[cw-sending-dot_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: "200ms" }}
        >
          .
        </span>
        <span
          className="animate-[cw-sending-dot_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: "400ms" }}
        >
          .
        </span>
      </span>
    </span>
  )
}

function statusLabel(
  status: MessageStatus | undefined,
  outgoing?: boolean,
  seen?: boolean,
  latest?: boolean
) {
  if (!outgoing) return null
  if (status === "sending") return null
  if (!latest) return null
  if (status === "seen" || seen) return seen ? null : "Seen"
  if (status === "delivered") return "Delivered"
  return "Sent"
}

function StatusIcon({
  status,
  seen,
}: {
  status?: MessageStatus
  seen?: boolean
}) {
  if (status === "sending") {
    return (
      <Clock
        className="size-3 animate-pulse stroke-[2.1]"
        aria-hidden
      />
    )
  }
  if (status === "seen" || seen) {
    return (
      <CheckCheck
        className="size-3.5 stroke-[2.2] text-signal"
        aria-hidden
      />
    )
  }
  if (status === "delivered") {
    return <CheckCheck className="size-3.5 stroke-[2.1]" aria-hidden />
  }
  return <Check className="size-3.5 stroke-[2.1]" aria-hidden />
}
