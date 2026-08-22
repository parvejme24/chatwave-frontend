"use client"

import { ChevronLeft, Info, Phone, Video } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { IconBtn } from "@/components/main/icon-btn"
import { useChat } from "@/components/chats/chat-provider"
import { UserAvatar } from "@/components/shared/user-avatar"
import type { Conversation } from "@/lib/types/chat"
import { cn } from "@/lib/utils"

export function ThreadHeader({ conversation }: { conversation: Conversation }) {
  const router = useRouter()
  const { setDrawerOpen } = useChat()
  const peer = encodeURIComponent(conversation.name)

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-edge bg-surface px-[18px] py-3 max-[859px]:gap-2 max-[859px]:px-3 max-[859px]:py-2.5">
      <IconBtn
        aria-label="Back to conversations"
        className="hidden max-[859px]:inline-flex"
        onClick={() => router.push("/chats")}
      >
        <ChevronLeft className="size-5 stroke-[1.75]" aria-hidden />
      </IconBtn>

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
      >
        <UserAvatar
          initials={conversation.initials}
          tone={conversation.tone}
          presence={conversation.presence}
          showPresence={!conversation.group}
          className="max-[859px]:size-[38px] max-[859px]:text-[13px]"
        />
        <span className="min-w-0">
          <span className="block truncate text-[15.5px] font-semibold tracking-[-0.015em] text-ink">
            {conversation.name}
          </span>
          <span
            className={cn(
              "block truncate text-[12.5px] text-ink-3",
              conversation.live && "cw-motion font-medium text-ok"
            )}
            style={
              conversation.live
                ? { animation: "cw-live 1.8s ease-in-out infinite" }
                : undefined
            }
          >
            {conversation.status}
          </span>
        </span>
      </button>

      <div className="flex gap-0.5">
        <Link
          href={`/call?type=audio&peer=${peer}`}
          aria-label="Start voice call"
          className="inline-flex size-10 items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink max-[479px]:size-[38px]"
        >
          <Phone className="size-5 stroke-[1.75]" aria-hidden />
        </Link>
        <Link
          href={`/call?type=video&peer=${peer}`}
          aria-label="Start video call"
          className="inline-flex size-10 items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink max-[479px]:size-[38px]"
        >
          <Video className="size-5 stroke-[1.75]" aria-hidden />
        </Link>
        <IconBtn
          aria-label="Conversation details"
          className="max-[859px]:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <Info className="size-5 stroke-[1.75]" aria-hidden />
        </IconBtn>
      </div>
    </header>
  )
}
