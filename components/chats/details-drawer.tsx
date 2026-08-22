"use client"

import {
  Archive,
  Ban,
  Bell,
  CheckCheck,
  FileText,
  ImageIcon,
  Phone,
  Pin,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { toast } from "sonner"

import { IconBtn } from "@/components/main/icon-btn"
import { useChat } from "@/components/chats/chat-provider"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Switch } from "@/components/ui/switch"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { cn } from "@/lib/utils"

const mediaTiles = [
  ImageIcon,
  ImageIcon,
  Video,
  ImageIcon,
  ImageIcon,
  FileText,
] as const

export function DetailsDrawer({ conversationId }: { conversationId: string }) {
  const { getConversation, drawerOpen, setDrawerOpen, setPinned } = useChat()
  const conversation = getConversation(conversationId)
  const isMobile = useMediaQuery("(max-width: 859px)")
  const isOverlay = useMediaQuery("(max-width: 1079px)")

  useEffect(() => {
    if (!drawerOpen) return

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [drawerOpen, setDrawerOpen])

  if (!conversation || !drawerOpen) return null

  const peer = encodeURIComponent(conversation.name)
  const firstName = conversation.name.split(" ")[0]

  const panel = (
    <aside
      aria-label="Conversation details"
      className={cn(
        "h-full overflow-y-auto bg-surface",
        isMobile
          ? "w-full"
          : isOverlay
            ? "absolute inset-y-0 right-0 z-40 w-80 shadow-[0_24px_64px_rgba(17,24,33,0.18)] max-[1280px]:w-72"
            : "w-80 shrink-0 border-l border-edge max-[1280px]:w-72"
      )}
    >
      <div className="relative border-b border-edge px-[22px] pt-7 pb-5 text-center">
        <IconBtn
          aria-label="Close details"
          className="absolute top-3 right-3"
          onClick={() => setDrawerOpen(false)}
        >
          <X className="size-5 stroke-[1.75]" aria-hidden />
        </IconBtn>
        <UserAvatar
          initials={conversation.initials}
          tone={conversation.tone}
          size="xl"
          className="mx-auto mb-3.5"
        />
        <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
          {conversation.name}
        </h3>
        <p className="mt-0.5 text-[13px] text-ink-3">{conversation.sub}</p>
        <div className="mt-[18px] flex justify-center gap-2">
          <Link
            href={`/call?type=audio&peer=${peer}`}
            className="flex w-[66px] cursor-pointer flex-col items-center gap-[5px] rounded-[14px] bg-surface-2 py-2.5 text-[11.5px] font-medium text-ink-2 hover:bg-surface-3"
          >
            <Phone className="size-[19px] stroke-[1.75] text-signal" aria-hidden />
            Call
          </Link>
          <Link
            href={`/call?type=video&peer=${peer}`}
            className="flex w-[66px] cursor-pointer flex-col items-center gap-[5px] rounded-[14px] bg-surface-2 py-2.5 text-[11.5px] font-medium text-ink-2 hover:bg-surface-3"
          >
            <Video className="size-[19px] stroke-[1.75] text-signal" aria-hidden />
            Video
          </Link>
          <button
            type="button"
            onClick={() => toast("Search in this conversation")}
            className="flex w-[66px] cursor-pointer flex-col items-center gap-[5px] rounded-[14px] bg-surface-2 py-2.5 text-[11.5px] font-medium text-ink-2 hover:bg-surface-3"
          >
            <Search className="size-[19px] stroke-[1.75] text-signal" aria-hidden />
            Search
          </button>
        </div>
      </div>

      <div className="border-b border-edge px-[22px] py-[18px]">
        <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
          Shared media · 24
        </h4>
        <div className="grid grid-cols-3 gap-[5px]">
          {mediaTiles.map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="grid aspect-square cursor-pointer place-items-center rounded-[9px] bg-linear-to-br from-[#C8D4E4] to-[#A8BBD1] text-white/85 transition-transform hover:scale-95 dark:from-[#2B3648] dark:to-[#1E2733]"
            >
              <Icon className="size-5 stroke-[1.75]" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-edge px-[22px] py-[18px]">
        <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
          Preferences
        </h4>
        <label className="flex items-center justify-between border-b border-edge py-[11px]">
          <span className="flex items-center gap-[11px] text-sm text-ink">
            <Bell className="size-[18px] stroke-[1.75] text-ink-3" aria-hidden />
            Notifications
          </span>
          <Switch defaultChecked aria-label="Notifications" />
        </label>
        <label className="flex items-center justify-between border-b border-edge py-[11px]">
          <span className="flex items-center gap-[11px] text-sm text-ink">
            <Pin className="size-[18px] stroke-[1.75] text-ink-3" aria-hidden />
            Pin to top
          </span>
          <Switch
            checked={Boolean(conversation.pinned)}
            onCheckedChange={(checked) =>
              setPinned(conversation.id, Boolean(checked))
            }
            aria-label="Pin conversation"
          />
        </label>
        <label className="flex items-center justify-between py-[11px]">
          <span className="flex items-center gap-[11px] text-sm text-ink">
            <CheckCheck className="size-[18px] stroke-[1.75] text-ink-3" aria-hidden />
            Send read receipts
          </span>
          <Switch defaultChecked aria-label="Read receipts" />
        </label>
      </div>

      <div className="px-[22px] py-[18px]">
        <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
          Manage
        </h4>
        <button
          type="button"
          onClick={() => toast("Conversation archived")}
          className="flex w-full cursor-pointer items-center justify-between border-b border-edge py-[11px] text-left"
        >
          <span className="flex items-center gap-[11px] text-sm text-ink">
            <Archive className="size-[18px] stroke-[1.75] text-ink-3" aria-hidden />
            Archive conversation
          </span>
        </button>
        <button
          type="button"
          onClick={() => toast(`${firstName} is blocked`)}
          className="flex w-full cursor-pointer items-center justify-between border-b border-edge py-[11px] text-left"
        >
          <span className="flex items-center gap-[11px] text-sm text-pulse">
            <Ban className="size-[18px] stroke-[1.75]" aria-hidden />
            Block contact
          </span>
        </button>
        <button
          type="button"
          onClick={() => toast("Conversation deleted")}
          className="flex w-full cursor-pointer items-center justify-between py-[11px] text-left"
        >
          <span className="flex items-center gap-[11px] text-sm text-pulse">
            <Trash2 className="size-[18px] stroke-[1.75]" aria-hidden />
            Delete conversation
          </span>
        </button>
      </div>
    </aside>
  )

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[55] bg-surface">{panel}</div>
    )
  }

  return panel
}
