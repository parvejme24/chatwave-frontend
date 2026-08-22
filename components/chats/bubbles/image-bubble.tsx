import { ImageIcon } from "lucide-react"

import { MessageMeta } from "@/components/chats/bubbles/message-meta"
import type { ChatMessage } from "@/lib/types/chat"
import { cn } from "@/lib/utils"

export function ImageBubble({
  message,
  outgoing,
}: {
  message: ChatMessage
  outgoing: boolean
}) {
  return (
    <div
      className={cn(
        "max-w-[320px] overflow-hidden rounded-[20px] border p-[5px] shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        outgoing
          ? "rounded-br-[7px] border-signal bg-signal text-white"
          : "rounded-bl-[7px] border-edge bg-surface text-ink"
      )}
    >
      <div className="overflow-hidden rounded-[15px]">
        <div className="grid aspect-4/3 w-full place-items-center bg-linear-to-br from-[#C8D4E4] to-[#A8BBD1] text-white/90 dark:from-[#2B3648] dark:to-[#1E2733]">
          <ImageIcon className="size-7 stroke-[1.75]" aria-hidden />
        </div>
      </div>
      <div className="px-[9px] pt-[7px] pb-0.5 text-[14.5px] leading-[1.48]">
        {message.caption}
        <MessageMeta time={message.time} status={message.status} outgoing={outgoing} />
      </div>
    </div>
  )
}
