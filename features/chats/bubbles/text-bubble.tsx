import type { ChatMessage } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"
import { MessageText } from "./message-text"

export function TextBubble({
  message,
  outgoing,
}: {
  message: ChatMessage
  outgoing: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] border px-3.5 py-2.5 text-[14.5px] leading-[1.48] break-words shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        outgoing
          ? "rounded-br-[7px] border-signal bg-signal text-white"
          : "rounded-bl-[7px] border-edge bg-surface text-ink"
      )}
    >
      {message.reply ? (
        <span
          className={cn(
            "mb-1.5 block rounded-[6px] border-l-[3px] px-2.5 py-1.5 text-[13px]",
            outgoing
              ? "border-white/80 bg-white/16 text-white/90"
              : "border-signal bg-signal-wash text-ink-2"
          )}
        >
          <b className="mb-px block text-xs font-semibold">{message.reply.who}</b>
          {message.reply.text}
        </span>
      ) : null}
      {message.text ? (
        <MessageText text={message.text} outgoing={outgoing} />
      ) : null}
    </div>
  )
}
