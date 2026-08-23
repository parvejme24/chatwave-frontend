"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { signalEase } from "../../components/motion/motion-item"
import { EMOJI_CATEGORIES, filterEmojis } from "../../lib/data/emojis"
import { cn } from "../../lib/utils"

export function EmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (emoji: string) => void
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(EMOJI_CATEGORIES[0].id)
  const tabsRef = useRef<HTMLDivElement>(null)
  const groups = useMemo(() => filterEmojis(query), [query])
  const shown = query ? groups : groups.filter((group) => group.id === active)

  useEffect(() => {
    const selected = tabsRef.current?.querySelector<HTMLElement>(
      `[data-emoji-tab="${active}"]`
    )
    selected?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" })
  }, [active])

  useEffect(() => {
    const scroller = tabsRef.current
    if (!scroller) return
    const node: HTMLDivElement = scroller

    function onWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      node.scrollBy({ left: event.deltaY })
    }

    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  }, [query])

  return (
    <motion.div
      role="dialog"
      aria-label="Emoji picker"
      initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.2, ease: signalEase }}
      className="absolute right-1.5 bottom-full z-20 mb-1.5 w-[196px] overflow-hidden rounded-[14px] border border-edge bg-surface shadow-[0_8px_24px_rgba(17,24,33,0.12)] max-[479px]:right-0 max-[479px]:w-[168px]"
    >
      <div className="flex items-center gap-1 border-b border-edge px-1.5 py-1">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-1.5 size-3 -translate-y-1/2 text-ink-4"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search emoji"
            className="h-6 w-full rounded-[8px] border border-edge bg-surface-2 pr-1.5 pl-6 text-[11px] text-ink outline-none placeholder:text-ink-4 focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-signal-wash"
          />
        </div>
        <button
          type="button"
          aria-label="Close emoji picker"
          onClick={onClose}
          className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-[7px] text-ink-3 hover:bg-surface-2 hover:text-ink"
        >
          <X className="size-3 stroke-[1.75]" aria-hidden />
        </button>
      </div>

      {!query ? (
        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Emoji categories"
          className="flex touch-pan-x gap-px overflow-x-auto overscroll-x-contain border-b border-edge px-1 py-0.5 [scrollbar-color:var(--edge-2)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-edge-2"
        >
          {EMOJI_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              data-emoji-tab={category.id}
              aria-selected={active === category.id}
              aria-label={category.label}
              onClick={() => setActive(category.id)}
              className={cn(
                "grid size-6 shrink-0 cursor-pointer place-items-center rounded-[6px] text-[12px]",
                active === category.id
                  ? "bg-signal-wash"
                  : "hover:bg-surface-2"
              )}
            >
              {category.icon}
            </button>
          ))}
        </div>
      ) : null}

      <div className="max-h-[112px] overflow-y-auto px-1 py-1 max-[479px]:max-h-[96px]">
        {shown.length === 0 ? (
          <p className="px-1 py-3 text-center text-[11px] text-ink-3">
            No matches.
          </p>
        ) : (
          shown.map((group) => (
            <div key={group.id} className="mb-1 last:mb-0">
              {query ? (
                <p className="px-1 pb-0.5 font-mono text-[9px] font-semibold tracking-[0.06em] text-ink-4 uppercase">
                  {group.label}
                </p>
              ) : null}
              <div className="grid grid-cols-8 gap-px max-[479px]:grid-cols-7">
                {group.emojis.map((emoji, index) => (
                  <button
                    key={`${group.id}-${emoji}-${index}`}
                    type="button"
                    onClick={() => onPick(emoji)}
                    className="grid aspect-square cursor-pointer place-items-center rounded-[5px] text-[15px] leading-none hover:bg-surface-2 max-[479px]:text-[13px]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
