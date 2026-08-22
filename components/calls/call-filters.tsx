"use client"

import type { CallFilter } from "@/lib/types/call"
import { cn } from "@/lib/utils"

const chips: { id: CallFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "missed", label: "Missed" },
  { id: "voice", label: "Voice" },
  { id: "video", label: "Video" },
]

export function CallFilters({
  value,
  onChange,
}: {
  value: CallFilter
  onChange: (value: CallFilter) => void
}) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Filter calls"
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          aria-pressed={value === chip.id}
          onClick={() => onChange(chip.id)}
          className={cn(
            "h-[30px] shrink-0 cursor-pointer rounded-full border border-edge px-[13px] text-[13px] font-medium text-ink-3 transition-colors hover:border-edge-2 hover:text-ink",
            value === chip.id && "border-ink bg-ink text-paper hover:text-paper"
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
