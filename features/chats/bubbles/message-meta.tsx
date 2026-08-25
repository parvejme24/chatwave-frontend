import { Check, CheckCheck, Clock } from "lucide-react"

import type { MessageStatus } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"

export function MessageMeta({
  time,
  status,
  outgoing,
  seenCount = 0,
  seenTotal = 0,
}: {
  time: string
  status?: MessageStatus
  outgoing?: boolean
  seenCount?: number
  seenTotal?: number
}) {
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center gap-[5px] align-baseline font-mono text-[10.5px] whitespace-nowrap text-ink-4",
        outgoing && "text-white/68"
      )}
    >
      {time}
      {outgoing ? (
        <StatusLabel
          status={status}
          seenCount={seenCount}
          seenTotal={seenTotal}
        />
      ) : null}
    </span>
  )
}

function StatusLabel({
  status,
  seenCount,
  seenTotal,
}: {
  status?: MessageStatus
  seenCount: number
  seenTotal: number
}) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1">
        <Check className="size-[13px] stroke-[2.1]" aria-hidden />
        Sent
      </span>
    )
  }
  if (status === "sending") {
    return (
      <span className="inline-flex items-center gap-1">
        <Clock className="size-[13px] stroke-[2.1]" aria-hidden />
        Sending...
      </span>
    )
  }
  if (status === "seen") {
    const count = Math.max(1, seenCount)
    const label =
      seenTotal > 1 ? `Seen ${count}/${seenTotal}` : `Seen ${count}`
    return (
      <span className="inline-flex items-center gap-1 text-[#9BE8FF] dark:text-[#7FDBFF]">
        <CheckCheck className="size-[13px] stroke-[2.1]" aria-hidden />
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1">
      {status === "delivered" ? (
        <CheckCheck className="size-[13px] stroke-[2.1]" aria-hidden />
      ) : (
        <Check className="size-[13px] stroke-[2.1]" aria-hidden />
      )}
      Sent
    </span>
  )
}
