import { Phone, PhoneIncoming, PhoneOutgoing, Video } from "lucide-react"
import Link from "next/link"

import { UserAvatar } from "../../components/shared/user-avatar"
import type { CallRecord } from "../../lib/types/call"
import { cn } from "../../lib/utils"

const directionClass = {
  in: "text-ok",
  out: "text-signal",
  missed: "text-pulse",
} as const

export function CallRow({ call }: { call: CallRecord }) {
  const DirectionIcon = call.direction === "out" ? PhoneOutgoing : PhoneIncoming

  return (
    <div className="flex items-center gap-3.5 border-t border-edge py-[13px] first:border-t-0">
      <UserAvatar
        initials={call.initials}
        tone={call.tone}
        photo={call.photoUrl}
        presence={call.presence}
        showPresence={!call.group && Boolean(call.presence)}
      />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[14.5px] font-semibold text-ink">
          {call.name}
        </span>
        <span
          className={cn(
            "mt-px flex items-center gap-1.5 text-[13px]",
            directionClass[call.direction]
          )}
        >
          <DirectionIcon className="size-[15px] stroke-[1.75]" aria-hidden />
          {call.subtitle}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {call.duration ? (
          <span className="rounded-full border border-edge bg-surface-2 px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ink-3">
            {call.duration}
          </span>
        ) : null}
        {call.endTag ? (
          <span className="rounded-full border border-edge bg-surface-2 px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ink-3">
            {call.endTag}
          </span>
        ) : null}
        {call.actions?.map((action) => {
          const ActionIcon = action.type === "video" ? Video : Phone
          return (
            <Link
              key={action.label}
              href={
                action.href ||
                `/call?type=${action.type}&conversationId=${call.conversationId ?? ""}&peer=${encodeURIComponent(call.name)}`
              }
              aria-label={action.label}
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <ActionIcon className="size-5 stroke-[1.75]" aria-hidden />
            </Link>
          )
        })}
      </span>
    </div>
  )
}
