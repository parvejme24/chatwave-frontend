"use client"

import { ExternalLink, Film, File as FileIcon, ImageIcon } from "lucide-react"

import { resolveMediaUrl } from "../../../lib/api"
import { fileExtension } from "../../../lib/files"
import { faviconUrl, linkHostname, playableVideoLink } from "../../../lib/links"
import type { ChatMessage, MessageAttachment } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"
import { MessageText } from "./message-text"
import { LinkifiedText } from "./linkified-text"
import { LinkPreview } from "./link-preview"
import { PreviewableImage } from "./image-lightbox"

export function AttachmentsBubble({
  message,
  outgoing,
}: {
  message: ChatMessage
  outgoing: boolean
}) {
  const attachments =
    message.attachments?.length
      ? message.attachments
      : message.mediaUrl
        ? [
            {
              url: message.mediaUrl,
              fileName: message.fileName,
              fileSize: message.fileSize,
              duration: message.duration,
              kind:
                message.type === "image"
                  ? ("image" as const)
                  : message.type === "video" || message.type === "video_note"
                    ? ("video" as const)
                    : ("file" as const),
            },
          ]
        : []
  const caption = message.caption || message.text

  return (
    <div
      className={cn(
        "max-w-[320px] overflow-hidden rounded-[20px] border p-[5px] shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        outgoing
          ? "rounded-br-[7px] border-signal bg-signal text-white"
          : "rounded-bl-[7px] border-edge bg-surface text-ink"
      )}
    >
      <div
        className={cn(
          "grid gap-1.5",
          attachments.length > 1 ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {attachments.map((item, index) => (
          <AttachmentTile
            key={`${item.url}-${index}`}
            item={item}
            outgoing={outgoing}
            solo={attachments.length === 1}
          />
        ))}
      </div>
      {caption ? (
        <div className="px-[9px] pt-[7px] pb-1.5 text-[14px] leading-[1.45]">
          {attachments.some((item) => item.kind === "link") ? (
            <LinkifiedText text={caption} outgoing={outgoing} />
          ) : (
            <MessageText text={caption} outgoing={outgoing} />
          )}
        </div>
      ) : null}
    </div>
  )
}

function AttachmentTile({
  item,
  outgoing,
  solo,
}: {
  item: MessageAttachment
  outgoing: boolean
  solo: boolean
}) {
  const src = resolveMediaUrl(item.url)
  if (item.kind === "image") {
    return (
      <div className="overflow-hidden rounded-[15px]">
        {src ? (
          <PreviewableImage
            src={src}
            alt={item.fileName || "Photo"}
            className={cn(
              "w-full object-cover",
              solo ? "max-h-[360px]" : "aspect-square"
            )}
          />
        ) : (
          <div className="grid aspect-square place-items-center bg-linear-to-br from-[#C8D4E4] to-[#A8BBD1] text-white/90">
            <ImageIcon className="size-7 stroke-[1.75]" aria-hidden />
          </div>
        )}
      </div>
    )
  }

  if (item.kind === "video") {
    return src ? (
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className={cn(
          "w-full rounded-[15px] bg-[#111821]",
          solo ? "aspect-video" : "aspect-square object-cover"
        )}
      />
    ) : (
      <div className="grid aspect-video place-items-center rounded-[15px] bg-linear-to-br from-[#3A4A63] to-[#1D2634] text-white/90">
        <Film className="size-7 stroke-[1.75]" aria-hidden />
      </div>
    )
  }

  if (item.kind === "link") {
    if (playableVideoLink(item.url)) {
      return (
        <div className={cn(solo ? "col-span-full" : null)}>
          <LinkPreview urls={[item.url]} outgoing={outgoing} />
        </div>
      )
    }
    const host = linkHostname(item.url)
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2.5 rounded-[14px] border px-3 py-2.5 no-underline",
          outgoing
            ? "border-white/25 bg-white/14 text-white"
            : "border-edge bg-surface-2 text-ink",
          solo ? "col-span-full" : null
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl(item.url)}
          alt=""
          width={18}
          height={18}
          className="size-[18px] shrink-0 rounded-[4px] bg-white"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">
            {item.fileName || host}
          </span>
          <span
            className={cn(
              "block truncate font-mono text-[10.5px]",
              outgoing ? "text-white/70" : "text-ink-3"
            )}
          >
            {host}
          </span>
        </span>
        <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
      </a>
    )
  }

  const ext = fileExtension(item.fileName)
  return (
    <a
      href={src || undefined}
      download={item.fileName}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex items-center gap-2.5 rounded-[14px] border px-3 py-2.5 no-underline",
        outgoing
          ? "border-white/25 bg-white/14 text-white"
          : "border-edge bg-surface-2 text-ink",
        solo ? "col-span-full" : null
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[10px]",
          outgoing ? "bg-white/20" : "bg-signal-wash text-signal"
        )}
      >
        <FileIcon className="size-4 stroke-[1.75]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold">
          {item.fileName || "File"}
        </span>
        <span
          className={cn(
            "font-mono text-[10.5px]",
            outgoing ? "text-white/70" : "text-ink-3"
          )}
        >
          {[item.fileSize, ext].filter(Boolean).join(" · ") || "Document"}
        </span>
      </span>
    </a>
  )
}
