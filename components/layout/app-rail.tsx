"use client"

import {
  AudioLines,
  MessageCircle,
  Moon,
  Phone,
  Settings,
  Sun,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { useSettings } from "../../features/settings/settings-provider"
import { UserAvatar } from "../shared/user-avatar"
import { cn } from "../../lib/utils"

const links = [
  { href: "/chats", label: "Chats", icon: MessageCircle, badge: 7 },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/contacts", label: "Contacts", icon: Users },
] as const

function isCurrent(pathname: string, href: string) {
  return href === "/chats"
    ? pathname === "/chats" || pathname.startsWith("/chats/")
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function AppRail() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { profile } = useSettings()

  return (
    <nav
      aria-label="Primary"
      className="z-30 hidden h-dvh w-[76px] flex-col items-center gap-1.5 border-r border-edge bg-surface pt-[18px] pb-3.5 min-[860px]:flex"
    >
      <Link
        href="/chats"
        aria-label="ChatWave home"
        className="mb-3.5 grid size-[38px] place-items-center rounded-[11px] bg-signal text-white"
      >
        <AudioLines className="size-[22px] stroke-[1.75]" aria-hidden />
      </Link>

      {links.map((item) => {
        const Icon = item.icon
        const current = isCurrent(pathname, item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={current ? "page" : undefined}
            className={cn(
              "relative grid size-[46px] place-items-center rounded-[13px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink",
              current &&
                "bg-signal-wash text-signal before:absolute before:top-1/2 before:left-[-15px] before:h-[22px] before:w-[3px] before:-translate-y-1/2 before:rounded-r-[3px] before:bg-signal"
            )}
          >
            <Icon className="size-6 stroke-[1.75]" aria-hidden />
            {"badge" in item ? (
              <span className="absolute top-1.5 right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-surface bg-pulse px-[5px] font-mono text-[10.5px] font-bold text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        )
      })}

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Switch theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="grid size-[46px] cursor-pointer place-items-center rounded-[13px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Sun className="hidden size-6 stroke-[1.75] dark:block" aria-hidden />
        <Moon className="size-6 stroke-[1.75] dark:hidden" aria-hidden />
      </button>

      <Link
        href="/settings"
        aria-label="Settings"
        aria-current={
          pathname.startsWith("/settings") || pathname.startsWith("/advanced")
            ? "page"
            : undefined
        }
        className={cn(
          "relative grid size-[46px] place-items-center rounded-[13px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink",
          (pathname.startsWith("/settings") ||
            pathname.startsWith("/advanced")) &&
            "bg-signal-wash text-signal before:absolute before:top-1/2 before:left-[-15px] before:h-[22px] before:w-[3px] before:-translate-y-1/2 before:rounded-r-[3px] before:bg-signal"
        )}
      >
        <Settings className="size-6 stroke-[1.75]" aria-hidden />
      </Link>

      <Link href="/settings" aria-label="Your profile" className="mt-1.5">
        <UserAvatar
          initials={profile.initials}
          tone={profile.tone}
          photo={profile.photo}
          presence="online"
          showPresence
          size="sm"
        />
      </Link>
    </nav>
  )
}
