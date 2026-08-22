"use client"

import { PenLine, Search, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { useMediaQuery } from "@/lib/hooks/use-media-query"

import { IconBtn } from "@/components/main/icon-btn"
import { ConversationRow } from "@/components/chats/conversation-row"
import { useChat } from "@/components/chats/chat-provider"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { FilterChip } from "@/lib/types/chat"
import { cn } from "@/lib/utils"

const chips: { id: FilterChip; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
  { id: "calls", label: "Calls" },
  { id: "archived", label: "Archived" },
]

export function ConversationList() {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 859px)")
  const { conversations, clearUnread } = useChat()
  const [query, setQuery] = useState("")
  const [chip, setChip] = useState<FilterChip>("all")

  const routeId = pathname.startsWith("/chats/")
    ? pathname.split("/")[2]
    : pathname === "/chats" && !isMobile
      ? "nadia"
      : null

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = conversations

    if (chip === "unread") list = list.filter((item) => item.unread > 0)
    if (chip === "groups") list = list.filter((item) => item.group)
    if (chip === "calls") {
      list = list.filter(
        (item) =>
          item.preview.toLowerCase().includes("call") ||
          item.previewIcon === "video" ||
          item.messages.some((message) => message.kind === "call")
      )
    }
    if (chip === "archived") list = []

    if (q) {
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.preview.toLowerCase().includes(q)
      )
    }

    return list
  }, [chip, conversations, query])

  const searching = query.trim().length > 0
  const pinned = searching ? [] : shown.filter((item) => item.pinned)
  const rest = searching ? shown : shown.filter((item) => !item.pinned)
  const emptyLabel = searching ? query.trim() : chips.find((item) => item.id === chip)?.label

  return (
    <section
      aria-label="Conversations"
      className="flex h-dvh w-full shrink-0 flex-col bg-surface min-[860px]:w-[348px] min-[860px]:border-r min-[860px]:border-edge max-[1079px]:min-[860px]:w-[300px] max-[859px]:pb-[74px]"
    >
      <header className="shrink-0 px-[18px] pt-5 pb-3 max-[479px]:px-3.5 max-[479px]:pt-4">
        <div className="mb-3.5 flex items-center justify-between">
          <h1 className="font-display text-[25px] font-bold tracking-[-0.03em] text-ink max-[479px]:text-[22px]">
            Chats
          </h1>
          <div className="flex gap-0.5">
            <IconBtn
              aria-label="New group"
              onClick={() => toast("New group — coming in the build")}
            >
              <Users className="size-5 stroke-[1.75]" aria-hidden />
            </IconBtn>
            <IconBtn
              aria-label="New chat"
              onClick={() => toast("Start a new chat")}
            >
              <PenLine className="size-5 stroke-[1.75]" aria-hidden />
            </IconBtn>
          </div>
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-[13px] size-[17px] -translate-y-1/2 text-ink-4"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search messages and people"
            aria-label="Search conversations"
            className="h-[42px] rounded-[14px] border-edge bg-surface-2 pr-3.5 pl-[39px] text-[14.5px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash dark:bg-surface-2"
          />
        </div>
      </header>

      <div
        className="flex shrink-0 gap-1.5 overflow-x-auto px-[18px] py-3 max-[479px]:px-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="Filter conversations"
      >
        {chips.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={chip === item.id}
            onClick={() => setChip(item.id)}
            className={cn(
              "h-[30px] shrink-0 cursor-pointer rounded-full border border-edge px-[13px] text-[13px] font-medium text-ink-3 transition-colors hover:border-edge-2 hover:text-ink",
              chip === item.id && "border-ink bg-ink text-paper hover:text-paper"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ScrollArea className="h-full min-h-0 flex-1">
        <div className="px-2.5 pb-4 max-[479px]:px-2" role="list">
          {!shown.length ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <div className="mb-2.5 grid size-[68px] place-items-center rounded-[20px] border border-edge bg-surface text-ink-4 shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
                <Search className="size-7 stroke-[1.75]" aria-hidden />
              </div>
              <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
                No matches
              </h3>
              <p className="mt-1 max-w-[320px] text-sm text-ink-3">
                Nothing here for {emptyLabel}.
              </p>
            </div>
          ) : (
            <>
              {pinned.length > 0 ? (
                <p className="px-3 pt-4 pb-[7px] text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                  Pinned
                </p>
              ) : null}
              {pinned.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={routeId === conversation.id}
                  onOpen={clearUnread}
                />
              ))}
              {pinned.length > 0 && rest.length > 0 ? (
                <p className="px-3 pt-4 pb-[7px] text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                  All conversations
                </p>
              ) : null}
              {rest.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={routeId === conversation.id}
                  onOpen={clearUnread}
                />
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </section>
  )
}
