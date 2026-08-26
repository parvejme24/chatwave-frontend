"use client"

import { FileText, ImageIcon, Play } from "lucide-react"
import { useMemo, useState } from "react"

import { ImageLightbox } from "./bubbles/image-lightbox"
import { MediaGridSkeleton } from "../../components/shared/loading-skeletons"
import { resolveMediaUrl } from "../../lib/api"
import { useGetMessagesQuery } from "../../lib/store/messages-api"
import type { ChatMessage, MessageAttachment } from "../../lib/types/chat"

type SharedItem = {
  id: string
  kind: "image" | "video" | "file"
  url: string
  fileName?: string
}

function collectSharedMedia(messages: ChatMessage[]): SharedItem[] {
  const items: SharedItem[] = []
  const seen = new Set<string>()

  function push(item: SharedItem) {
    if (!item.url || seen.has(item.url)) return
    seen.add(item.url)
    items.push(item)
  }

  for (const message of messages) {
    if (message.kind !== "message") continue
    const attachments = message.attachments ?? []
    if (attachments.length) {
      attachments.forEach((attachment: MessageAttachment, index) => {
        if (attachment.kind === "link") return
        const url = resolveMediaUrl(attachment.url)
        if (!url) return
        push({
          id: `${message.id}-a${index}`,
          kind:
            attachment.kind === "image" || attachment.kind === "video"
              ? attachment.kind
              : "file",
          url,
          fileName: attachment.fileName || message.fileName,
        })
      })
      continue
    }
    const url = resolveMediaUrl(message.mediaUrl)
    if (!url) continue
    if (message.type === "image") {
      push({
        id: message.id,
        kind: "image",
        url,
        fileName: message.fileName || message.caption,
      })
    } else if (message.type === "video" || message.type === "video_note") {
      push({
        id: message.id,
        kind: "video",
        url,
        fileName: message.fileName || message.caption,
      })
    } else if (message.type === "file") {
      push({
        id: message.id,
        kind: "file",
        url,
        fileName: message.fileName,
      })
    }
  }

  return items
}

export function SharedMediaSection({
  conversationId,
}: {
  conversationId: string
}) {
  const { data, isFetching } = useGetMessagesQuery(
    { conversationId, limit: 100 },
    { skip: !conversationId }
  )
  const items = useMemo(
    () => collectSharedMedia(data?.messages ?? []),
    [data?.messages]
  )
  const [preview, setPreview] = useState<SharedItem | null>(null)

  if (!isFetching && items.length === 0) return null

  return (
    <div className="border-b border-edge px-[22px] py-[18px]">
      <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
        Shared media
        {items.length ? ` · ${items.length}` : ""}
      </h4>
      {isFetching && items.length === 0 ? (
        <MediaGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-3 gap-[5px]">
          {items.slice(0, 24).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={
                item.kind === "image"
                  ? `Open photo ${item.fileName || ""}`.trim()
                  : item.kind === "video"
                    ? `Open video ${item.fileName || ""}`.trim()
                    : `Open file ${item.fileName || "attachment"}`
              }
              onClick={() => {
                if (item.kind === "image") {
                  setPreview(item)
                  return
                }
                window.open(item.url, "_blank", "noopener,noreferrer")
              }}
              className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-[9px] bg-linear-to-br from-[#C8D4E4] to-[#A8BBD1] text-white/85 transition-transform hover:scale-[0.97] dark:from-[#2B3648] dark:to-[#1E2733]"
            >
              {item.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : item.kind === "video" ? (
                <>
                  <video
                    src={item.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <span className="relative z-[1] grid size-8 place-items-center rounded-full bg-black/55">
                    <Play className="size-4 fill-white stroke-white" aria-hidden />
                  </span>
                </>
              ) : (
                <span className="relative z-[1] flex flex-col items-center gap-1 px-1">
                  <FileText className="size-5 stroke-[1.75]" aria-hidden />
                  <span className="line-clamp-2 text-center text-[9px] font-medium text-white/90">
                    {item.fileName || "File"}
                  </span>
                </span>
              )}
              {item.kind === "image" ? (
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
              ) : null}
              {!item.url ? (
                <ImageIcon className="size-5 stroke-[1.75]" aria-hidden />
              ) : null}
            </button>
          ))}
        </div>
      )}
      <ImageLightbox
        src={preview?.url || ""}
        alt={preview?.fileName || "Shared photo"}
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
      />
    </div>
  )
}
