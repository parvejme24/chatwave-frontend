"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Pin, Search, X } from "lucide-react"

import { signalEase } from "../../components/motion/motion-item"
import { Input } from "../../components/ui/input"
import type { Conversation, ThreadView } from "../../lib/types/chat"
import { pinnedMessageCount } from "../../lib/types/chat"
import { cn } from "../../lib/utils"

export const THREAD_SEARCH_INPUT_ID = "thread-message-search"

const views: { id: ThreadView; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pinned", label: "Pinned" },
]

export function ThreadTools({
  conversation,
  view,
  query,
  onViewChange,
  onQueryChange,
}: {
  conversation: Conversation
  view: ThreadView
  query: string
  onViewChange: (view: ThreadView) => void
  onQueryChange: (query: string) => void
}) {
  const reduceMotion = useReducedMotion()
  const pinnedCount = pinnedMessageCount(conversation.messages)

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-edge bg-surface px-[18px] py-2 max-[859px]:px-3">
      <div className="flex items-center gap-1.5">
        <div
          className="flex shrink-0 gap-1"
          role="group"
          aria-label="Filter messages"
        >
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={view === item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "relative h-[28px] cursor-pointer rounded-full border px-2.5 text-[12.5px] font-medium transition-colors",
                view === item.id
                  ? "border-ink text-paper"
                  : "border-edge text-ink-3 hover:border-edge-2 hover:text-ink"
              )}
            >
              {view === item.id ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : "thread-filter-chip"}
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ duration: 0.22, ease: signalEase }}
                />
              ) : null}
              <span className="relative z-[1] inline-flex items-center gap-1">
                {item.id === "pinned" ? (
                  <Pin className="size-3 stroke-[1.75]" aria-hidden />
                ) : null}
                {item.label}
                {item.id === "pinned" && pinnedCount > 0 ? (
                  <span className="font-mono text-[11px]">{pinnedCount}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-4"
            aria-hidden
          />
          <Input
            id={THREAD_SEARCH_INPUT_ID}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search messages"
            aria-label="Search messages in this conversation"
            className="h-[32px] rounded-[10px] border-edge bg-surface-2 pr-8 pl-8 text-[13.5px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash dark:bg-surface-2"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onQueryChange("")}
              className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-[7px] text-ink-4 hover:bg-surface-3 hover:text-ink"
            >
              <X className="size-3.5 stroke-[1.75]" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
