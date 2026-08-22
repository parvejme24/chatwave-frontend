"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

import { ConversationList } from "@/components/chats/conversation-list"
import { DetailsDrawer } from "@/components/chats/details-drawer"
import { useChat } from "@/components/chats/chat-provider"
import { useMediaQuery } from "@/lib/hooks/use-media-query"

export function ChatsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 859px)")
  const { setDrawerOpen } = useChat()
  const routeId = pathname.startsWith("/chats/")
    ? pathname.split("/")[2]
    : pathname === "/chats" && !isMobile
      ? "nadia"
      : undefined

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname, setDrawerOpen])

  return (
    <div className="relative flex h-dvh min-w-0 flex-1">
      <ConversationList />
      <div className="relative flex h-full min-h-0 min-w-0 flex-1">
        {children}
        {routeId ? <DetailsDrawer conversationId={routeId} /> : null}
      </div>
    </div>
  )
}
