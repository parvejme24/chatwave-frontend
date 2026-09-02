"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Contact, Search, UsersRound } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from "react"

import { useMediaQuery } from "../../lib/hooks/use-media-query"
import { useDebouncedValue } from "../../lib/hooks/use-debounced-value"

import { IconBtn } from "../../components/layout/icon-btn"
import { ConversationRow } from "./conversation-row"
import { CreateGroupDialog } from "./create-group-dialog"
import { useChat } from "./chat-provider"
import { MotionItem, signalEase } from "../../components/motion/motion-item"
import { Input } from "../../components/ui/input"
import { ScrollArea } from "../../components/ui/scroll-area"
import { selectAccessToken } from "../../lib/store/auth-slice"
import { useGetCallsQuery } from "../../lib/store/calls-api"
import { useGetConversationsQuery } from "../../lib/store/conversations-api"
import { useAppSelector } from "../../lib/store/hooks"
import type { ConversationFilter, FilterChip } from "../../lib/types/chat"
import { cn } from "../../lib/utils"
import { CallRow } from "../calls/call-row"
import {
  CallListSkeleton,
  ConversationListSkeleton,
} from "../../components/shared/loading-skeletons"

const chips: { id: FilterChip; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
  { id: "calls", label: "Calls" },
  { id: "archived", label: "Archived" },
]

function listFilter(chip: FilterChip): ConversationFilter {
  if (chip === "unread" || chip === "groups" || chip === "archived") return chip
  return "all"
}

export function ConversationList() {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 859px)")
  const reduceMotion = useReducedMotion()
  const { conversations, conversationsLoading, clearUnread } = useChat()
  const token = useAppSelector(selectAccessToken)
  const [query, setQuery] = useState("")
  const [chip, setChip] = useState<FilterChip>("all")
  const [groupOpen, setGroupOpen] = useState(false)
  const chipScroller = useRef<HTMLDivElement>(null)
  const chipDrag = useRef({
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    dragging: false,
    suppressClick: false,
  })
  const [chipEdge, setChipEdge] = useState({ left: false, right: false })
  const [chipGrabbing, setChipGrabbing] = useState(false)
  const chipStopDrag = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => chipStopDrag.current?.()
  }, [])
  const debounced = useDebouncedValue(query.trim(), 300)
  const filtered = chip !== "all" || debounced.length > 0
  const skipFiltered = !token || chip === "calls" || !filtered
  const { data, isFetching } = useGetConversationsQuery(
    { filter: listFilter(chip), q: debounced || undefined },
    { skip: skipFiltered }
  )
  const { data: callsData, isFetching: callsFetching } = useGetCallsQuery(
    { filter: "all" },
    { skip: !token || chip !== "calls" }
  )
  const callRows = useMemo(() => {
    const rows = callsData?.calls ?? []
    const q = debounced.toLowerCase()
    if (!q) return rows
    return rows.filter(
      (call) =>
        call.name.toLowerCase().includes(q) ||
        call.subtitle.toLowerCase().includes(q)
    )
  }, [callsData?.calls, debounced])

  const routeId = pathname.startsWith("/chats/")
    ? pathname.split("/")[2]
    : pathname === "/chats" && !isMobile
      ? conversations[0]?.id
      : null

  const shown = useMemo(() => {
    if (chip === "calls") return []
    if (!filtered) return conversations
    return data?.conversations ?? []
  }, [chip, conversations, data, filtered])

  const searching = query.trim().length > 0
  const pinned = searching ? [] : shown.filter((item) => item.pinned)
  const rest = searching ? shown : shown.filter((item) => !item.pinned)
  const emptyLabel = searching ? query.trim() : chips.find((item) => item.id === chip)?.label
  const listLoading =
    chip === "calls"
      ? callsFetching && callRows.length === 0
      : conversationsLoading || (filtered && isFetching && !shown.length)
  const listEmpty = chip === "calls" ? callRows.length === 0 : shown.length === 0

  useEffect(() => {
    const scroller = chipScroller.current
    if (!scroller) return

    function updateEdges() {
      const el = chipScroller.current
      if (!el) return
      setChipEdge({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      })
    }

    updateEdges()
    scroller.addEventListener("scroll", updateEdges, { passive: true })
    const observer = new ResizeObserver(updateEdges)
    observer.observe(scroller)
    return () => {
      scroller.removeEventListener("scroll", updateEdges)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const scroller = chipScroller.current
    const selected = scroller?.querySelector<HTMLElement>(
      `[data-filter-chip="${chip}"]`
    )
    if (!scroller || !selected) return
    const selectedRect = selected.getBoundingClientRect()
    const scrollerRect = scroller.getBoundingClientRect()
    const pad = 18
    if (selectedRect.left < scrollerRect.left + pad) {
      scroller.scrollBy({
        left: selectedRect.left - scrollerRect.left - pad,
        behavior: reduceMotion ? "auto" : "smooth",
      })
    } else if (selectedRect.right > scrollerRect.right - pad) {
      scroller.scrollBy({
        left: selectedRect.right - scrollerRect.right + pad,
        behavior: reduceMotion ? "auto" : "smooth",
      })
    }
  }, [chip, reduceMotion])

  function onChipPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return
    const el = chipScroller.current
    if (!el) return
    chipDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      dragging: false,
      suppressClick: false,
    }

    function onMove(move: globalThis.PointerEvent) {
      if (move.pointerId !== chipDrag.current.pointerId) return
      const scroller = chipScroller.current
      if (!scroller) return
      const dx = move.clientX - chipDrag.current.startX
      if (!chipDrag.current.dragging) {
        if (Math.abs(dx) < 8) return
        chipDrag.current.dragging = true
        chipDrag.current.suppressClick = true
        setChipGrabbing(true)
      }
      scroller.scrollLeft = chipDrag.current.startScroll - dx
      move.preventDefault()
    }

    function onUp(up: globalThis.PointerEvent) {
      if (up.pointerId !== chipDrag.current.pointerId) return
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      chipStopDrag.current = null
      chipDrag.current.pointerId = -1
      chipDrag.current.dragging = false
      setChipGrabbing(false)
    }

    chipStopDrag.current?.()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    chipStopDrag.current = () => onUp(event.nativeEvent)
  }

  function onChipClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!chipDrag.current.suppressClick) return
    event.preventDefault()
    event.stopPropagation()
    chipDrag.current.suppressClick = false
  }

  return (
    <>
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
              aria-label="Contacts"
              onClick={() => router.push("/contacts")}
            >
              <Contact className="size-5 stroke-[1.75]" aria-hidden />
            </IconBtn>
            <IconBtn
              aria-label="Create group"
              onClick={() => setGroupOpen(true)}
            >
              <UsersRound className="size-5 stroke-[1.75]" aria-hidden />
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

      <div className="relative shrink-0">
        <div
          ref={chipScroller}
          onPointerDown={onChipPointerDown}
          onClickCapture={onChipClickCapture}
          className={cn(
            "overflow-x-auto overscroll-x-contain py-3 select-none [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden",
            chipGrabbing ? "cursor-grabbing" : "cursor-grab"
          )}
          role="group"
          aria-label="Filter conversations"
        >
          <div className="flex w-max min-w-full flex-nowrap gap-1.5 px-[18px] max-[479px]:px-3.5">
            {chips.map((item) => (
              <button
                key={item.id}
                type="button"
                data-filter-chip={item.id}
                aria-pressed={chip === item.id}
                onClick={() => setChip(item.id)}
                className={cn(
                  "relative h-[30px] shrink-0 cursor-pointer rounded-full border px-[13px] text-[13px] font-medium whitespace-nowrap transition-colors",
                  chip === item.id
                    ? "border-ink text-paper"
                    : "border-edge text-ink-3 hover:border-edge-2 hover:text-ink"
                )}
              >
                {chip === item.id ? (
                  <motion.span
                    layoutId={reduceMotion ? undefined : "chat-filter-chip"}
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ duration: 0.22, ease: signalEase }}
                  />
                ) : null}
                <span className="relative z-[1]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        {chipEdge.left ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-linear-to-r from-surface to-transparent"
          />
        ) : null}
        {chipEdge.right ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-surface to-transparent"
          />
        ) : null}
      </div>

      <ScrollArea className="h-full min-h-0 flex-1">
        <div className="px-2.5 pb-4 max-[479px]:px-2" role="list">
          {listLoading ? (
            chip === "calls" ? (
              <CallListSkeleton />
            ) : (
              <ConversationListSkeleton />
            )
          ) : listEmpty ? (
            <MotionItem className="flex flex-col items-center px-5 py-12 text-center">
              <div className="mb-2.5 grid size-[68px] place-items-center rounded-[20px] border border-edge bg-surface text-ink-4 shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
                <Search className="size-7 stroke-[1.75]" aria-hidden />
              </div>
              <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
                {chip === "calls"
                  ? "No calls yet"
                  : chip === "archived"
                    ? "No archived chats"
                    : "No matches"}
              </h3>
              <p className="mt-1 max-w-[320px] text-sm text-ink-3">
                {chip === "calls"
                  ? "Voice and video calls from chats will appear here."
                  : chip === "archived"
                    ? "Archived and blocked chats appear here."
                    : `Nothing here for ${emptyLabel}.`}
              </p>
            </MotionItem>
          ) : chip === "calls" ? (
            callRows.map((call, index) => (
              <MotionItem key={call.id} delay={Math.min(index * 0.03, 0.18)}>
                <CallRow
                  call={call}
                  className="rounded-[14px] border-t-0 px-2.5 py-[11px] hover:bg-surface-2"
                />
              </MotionItem>
            ))
          ) : (
            <>
              {pinned.length > 0 ? (
                <p className="px-3 pt-4 pb-[7px] text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                  Pinned
                </p>
              ) : null}
              {pinned.map((conversation, index) => (
                <MotionItem
                  key={conversation.id}
                  delay={Math.min(index * 0.03, 0.18)}
                >
                  <ConversationRow
                    conversation={conversation}
                    active={routeId === conversation.id}
                    onOpen={clearUnread}
                  />
                </MotionItem>
              ))}
              {pinned.length > 0 && rest.length > 0 ? (
                <p className="px-3 pt-4 pb-[7px] text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                  All conversations
                </p>
              ) : null}
              {rest.map((conversation, index) => (
                <MotionItem
                  key={conversation.id}
                  delay={Math.min((pinned.length + index) * 0.03, 0.24)}
                >
                  <ConversationRow
                    conversation={conversation}
                    active={routeId === conversation.id}
                    onOpen={clearUnread}
                  />
                </MotionItem>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </section>
    <CreateGroupDialog open={groupOpen} onClose={() => setGroupOpen(false)} />
    </>
  )
}
