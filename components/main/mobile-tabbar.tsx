"use client"

import { MessageCircle, Phone, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const tabs = [
  { href: "/chats", label: "Chats", icon: MessageCircle, badge: 7 },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
] as const

function isCurrent(pathname: string, href: string) {
  return href === "/chats"
    ? pathname === "/chats" || pathname.startsWith("/chats/")
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function MobileTabBar({ hidden }: { hidden?: boolean }) {
  const pathname = usePathname()

  if (hidden) return null

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-edge bg-surface px-1.5 pt-[7px] pb-[calc(7px+env(safe-area-inset-bottom))] min-[860px]:hidden"
    >
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const current = isCurrent(pathname, tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-[3px] py-[5px] text-[10.5px] font-semibold text-ink-4",
                current && "text-signal"
              )}
            >
              <Icon className="size-5 stroke-[1.75]" aria-hidden />
              {tab.label}
              {"badge" in tab ? (
                <span className="absolute top-0 right-[22%] grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-surface bg-pulse px-[5px] font-mono text-[10.5px] font-bold text-white">
                  {tab.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
