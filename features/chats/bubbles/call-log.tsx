import { PhoneIncoming, PhoneOutgoing } from "lucide-react"

import type { CallItem } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"

export function CallLog({ item }: { item: CallItem }) {
  const Icon = item.missed ? PhoneIncoming : PhoneOutgoing

  return (
    <div
      className={cn(
        "my-2.5 flex items-center gap-2.5 self-center rounded-full border bg-surface px-[15px] py-[9px] text-[13px] text-ink-2 shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        item.missed && "border-pulse bg-pulse-wash text-pulse"
      )}
    >
      <Icon
        className={cn("size-[17px] stroke-[1.75] text-ink-3", item.missed && "text-pulse")}
        aria-hidden
      />
      <span>{item.label}</span>
      <span className="font-mono text-[11.5px] text-ink-3">{item.meta}</span>
    </div>
  )
}
