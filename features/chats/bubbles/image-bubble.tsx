"use client"

import { ImageIcon } from "lucide-react"

import { resolveMediaUrl } from "../../../lib/api"
import type { ChatMessage } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"
import { PreviewableImage } from "./image-lightbox"
import { MessageText } from "./message-text"

export function ImageBubble({
  message,
  outgoing,
}: {
  message: ChatMessage
  outgoing: boolean
}) {
  const src = resolveMediaUrl(message.mediaUrl)
  const alt = message.caption || message.fileName || "Photo"
  const canPreview = Boolean(src) && message.status !== "sending"

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
        {src ? (
          canPreview ? (
            <PreviewableImage
              src={src}
              alt={alt}
              className="max-h-[360px] w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              className="max-h-[360px] w-full object-cover"
            />
          )
        ) : (
          <div className="grid aspect-4/3 w-full place-items-center bg-linear-to-br from-[#C8D4E4] to-[#A8BBD1] text-white/90 dark:from-[#2B3648] dark:to-[#1E2733]">
            <ImageIcon className="size-7 stroke-[1.75]" aria-hidden />
          </div>
        )}
      </div>
      {message.caption ? (
        <div className="px-[9px] pt-[7px] pb-1.5 text-[14.5px] leading-[1.48]">
          <MessageText text={message.caption} outgoing={outgoing} />
        </div>
      ) : null}
    </div>
  )
}
