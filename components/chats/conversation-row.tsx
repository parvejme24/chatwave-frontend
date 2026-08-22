"use client"

import { BellOff, ImageIcon, Mic, Video } from "lucide-react"
import Link from "next/link"

import { UserAvatar } from "@/components/shared/user-avatar"
import type { Conversation, PreviewIcon } from "@/lib/types/chat"
import { cn } from "@/lib/utils"

const previewIcons: Record<PreviewIcon, typeof Mic> = {
  mic: Mic,
  video: Video,
  image: ImageIcon,
}

type ConversationRowProps = {
  conversation: Conversation
  active: boolean
  onOpen: (id: string) => void
}

export function ConversationRow({
  conversation,
  active,
  onOpen,
}: ConversationRowProps) {
  const PreviewIcon = conversation.previewIcon
    ? previewIcons[conversation.previewIcon]
    : null

  return (
    <Link
      href={`/chats/${conversation.id}`}
      role="listitem"
      aria-current={active || undefined}
      onClick={() => onOpen(conversation.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-[14px] px-2.5 py-[11px] text-left transition-colors hover:bg-surface-2",
        active && "bg-signal-wash",
        conversation.unread > 0 && "is-unread"
      )}
    >
      <UserAvatar
        initials={conversation.initials}
        tone={conversation.tone}
        presence={conversation.presence}
        showPresence={!conversation.group}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2.5">
          <span
            className={cn(
              "truncate font-display text-[14.5px] tracking-[-0.01em] text-ink",
              conversation.unread > 0 ? "font-bold" : "font-semibold"
            )}
          >
            {conversation.name}
          </span>
          <span className="shrink-0 font-mono text-[11px] text-ink-4">
            {conversation.time}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              "flex min-w-0 flex-1 items-center gap-[5px] text-[13.5px] text-ink-3",
              conversation.unread > 0 && "font-medium text-ink-2"
            )}
          >
            {PreviewIcon ? (
              <PreviewIcon
                className="size-3.5 shrink-0 stroke-[1.75] text-ink-4"
                aria-hidden
              />
            ) : null}
            <span className="truncate">{conversation.preview}</span>
          </span>
          {conversation.unread > 0 ? (
            <span
              className={cn(
                "grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 font-mono text-[11px] font-bold text-white",
                conversation.muted ? "bg-ink-4" : "bg-signal"
              )}
            >
              {conversation.unread}
            </span>
          ) : conversation.muted ? (
            <BellOff className="size-4 shrink-0 text-ink-4" aria-hidden />
          ) : null}
        </span>
      </span>
    </Link>
  )
}
