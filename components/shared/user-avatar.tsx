import { AVATAR_TONES, type AvatarTone, type Presence } from "@/lib/types/chat"
import { cn } from "@/lib/utils"

const sizes = {
  xs: "size-7 text-[11px]",
  sm: "size-9 text-[13px]",
  md: "size-11 text-[15px]",
  lg: "size-[60px] text-xl",
  xl: "size-24 text-[30px]",
} as const

const presenceClass: Record<Presence, string> = {
  online: "bg-ok",
  away: "bg-warn",
  offline: "bg-ink-4",
}

type UserAvatarProps = {
  initials: string
  tone: AvatarTone
  presence?: Presence
  showPresence?: boolean
  size?: keyof typeof sizes
  className?: string
}

export function UserAvatar({
  initials,
  tone,
  presence,
  showPresence = false,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full font-display font-semibold select-none",
        sizes[size],
        AVATAR_TONES[tone],
        className
      )}
    >
      <span className="relative z-[1]">{initials}</span>
      {showPresence && presence ? (
        <i
          className={cn(
            "absolute right-[-1px] bottom-[-1px] z-[2] size-[13px] rounded-full border-[2.5px] border-surface",
            presenceClass[presence]
          )}
          aria-hidden
        />
      ) : null}
    </span>
  )
}
