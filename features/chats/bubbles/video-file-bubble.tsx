import { Film } from "lucide-react"

import { resolveMediaUrl } from "../../../lib/api"
import type { ChatMessage } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"
import { MessageText } from "./message-text"

export function VideoFileBubble({
  message,
  outgoing,
}: {
  message: ChatMessage
  outgoing: boolean
}) {
  const src = resolveMediaUrl(message.mediaUrl)

  return (
    <div
      className={cn(
        "max-w-[320px] overflow-hidden rounded-[20px] border p-[5px] shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        outgoing
          ? "rounded-br-[7px] border-signal bg-signal text-white"
          : "rounded-bl-[7px] border-edge bg-surface text-ink"
      )}
    >
      {src ? (
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full rounded-[15px] bg-[#111821]"
        />
      ) : (
        <div className="grid aspect-video w-full place-items-center rounded-[15px] bg-linear-to-br from-[#3A4A63] to-[#1D2634] text-white/90">
          <Film className="size-7 stroke-[1.75]" aria-hidden />
        </div>
      )}
      {message.caption ? (
        <div className="px-[9px] pt-[7px] pb-1.5 text-[13.5px] leading-[1.45]">
          <MessageText text={message.caption} outgoing={outgoing} />
        </div>
      ) : message.fileName ? (
        <div className="px-[9px] pt-[7px] pb-1.5 text-[13.5px] leading-[1.45]">
          {message.fileName}
        </div>
      ) : null}
    </div>
  )
}
