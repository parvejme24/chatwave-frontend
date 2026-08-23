import { Check, CheckCheck, Clock } from "lucide-react"

import type { MessageStatus } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"

export function MessageMeta({
  time,
  status,
  outgoing,
}: {
  time: string
  status?: MessageStatus
  outgoing?: boolean
}) {
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center gap-[5px] align-baseline font-mono text-[10.5px] whitespace-nowrap text-ink-4",
        outgoing && "text-white/68"
      )}
    >
      {time}
      {outgoing ? <StatusTick status={status} /> : null}
    </span>
  )
}

function StatusTick({ status }: { status?: MessageStatus }) {
  if (!status) return null
  if (status === "sending") {
    return <Clock className="size-[15px] stroke-[2.1]" aria-hidden />
  }
  if (status === "sent") {
    return <Check className="size-[15px] stroke-[2.1]" aria-hidden />
  }
  return (
    <CheckCheck
      className={cn(
        "size-[15px] stroke-[2.1]",
        status === "seen" && "text-[#9BE8FF] dark:text-[#7FDBFF]"
      )}
      aria-hidden
    />
  )
}
