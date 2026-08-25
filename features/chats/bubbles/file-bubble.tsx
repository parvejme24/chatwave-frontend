import { FileText } from "lucide-react"

import { MessageMeta } from "./message-meta"
import type { ChatMessage } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"

export function FileBubble({
  message,
  outgoing,
  seenTotal = 0,
}: {
  message: ChatMessage
  outgoing: boolean
  seenTotal?: number
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] border px-3.5 pt-[9px] pb-2 shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        outgoing
          ? "rounded-br-[7px] border-signal bg-signal text-white"
          : "rounded-bl-[7px] border-edge bg-surface text-ink"
      )}
    >
      <div className="flex min-w-[230px] items-center gap-3 px-0.5 py-[3px]">
        <span
          className={cn(
            "grid size-[42px] shrink-0 place-items-center rounded-[11px]",
            outgoing ? "bg-white/20 text-white" : "bg-signal-wash text-signal"
          )}
        >
          <FileText className="size-5 stroke-[1.75]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {message.fileName}
          </span>
          <span
            className={cn(
              "font-mono text-[11.5px]",
              outgoing ? "text-white/70" : "text-ink-3"
            )}
          >
            {message.fileSize} · PDF
          </span>
        </span>
      </div>
      <div className="text-right">
        <MessageMeta time={message.time} status={message.status} outgoing={outgoing} seenCount={message.seenCount} seenTotal={seenTotal} />
      </div>
    </div>
  )
}
