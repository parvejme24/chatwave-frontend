"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "../../lib/utils"

const links = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const

export function LegalNav() {
  const pathname = usePathname()

  return (
    <nav className="flex h-16 items-stretch gap-5 text-[13.5px] font-medium text-ink-3">
      {links.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex cursor-pointer items-center text-ink-3 no-underline hover:no-underline",
              isActive &&
                "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-signal"
            )}
          >
            {item.label}
          </Link>
        )
      })}
      <Link
        href="/sign-in"
        className="flex cursor-pointer items-center text-signal underline-offset-2 hover:underline"
      >
        Sign in
      </Link>
    </nav>
  )
}
