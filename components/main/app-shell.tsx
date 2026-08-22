"use client"

import { usePathname } from "next/navigation"

import { IncomingCall } from "@/components/chats/incoming-call"
import { AppRail } from "@/components/main/app-rail"
import { MobileTabBar } from "@/components/main/mobile-tabbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const threadOpen = pathname.startsWith("/chats/") && pathname !== "/chats"

  return (
    <div className="flex h-dvh overflow-hidden bg-paper">
      <AppRail />
      <div className="min-w-0 flex-1">{children}</div>
      <MobileTabBar hidden={threadOpen} />
      <IncomingCall />
    </div>
  )
}
