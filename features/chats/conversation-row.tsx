"use client"

import { motion, useReducedMotion } from "framer-motion"
import { BellOff, ImageIcon, Mic, Video } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useChat } from "./chat-provider"
import { signalEase } from "../../components/motion/motion-item"
import { UserAvatar } from "../../components/shared/user-avatar"
import { personFromConversation, type Conversation, type PreviewIcon } from "../../lib/types/chat"
import { cn } from "../../lib/utils"

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
  const router = useRouter()
  const { openProfile } = useChat()
  const reduceMotion = useReducedMotion()
  const PreviewIcon = conversation.previewIcon
    ? previewIcons[conversation.previewIcon]
    : null

  return (
    <div
      role="listitem"
      aria-current={active || undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-[14px] px-2.5 py-[11px] text-left transition-colors hover:bg-surface-2",
        active && "bg-signal-wash",
        conversation.unread > 0 && "is-unread"
      )}
    >
      <motion.button
        type="button"
        aria-label={`Open ${conversation.name} profile`}
        onClick={() => {
          onOpen(conversation.id)
          openProfile(personFromConversation(conversation))
          router.push(`/chats/${conversation.id}`)
        }}
        whileHover={reduceMotion ? undefined : { scale: 1.06 }}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        transition={{ duration: 0.16, ease: signalEase }}
        className="shrink-0 cursor-pointer rounded-full"
      >
        <UserAvatar
          initials={conversation.initials}
          tone={conversation.tone}
          presence={conversation.presence}
          showPresence={!conversation.group}
        />
      </motion.button>
      <Link
        href={`/chats/${conversation.id}`}
        onClick={() => onOpen(conversation.id)}
        className="min-w-0 flex-1"
      >
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
      </Link>
    </div>
  )
}
