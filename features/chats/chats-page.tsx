"use client"

import { Thread } from "./thread"
import { useChat } from "./chat-provider"

export function ChatsPage() {
  const { conversations, conversationsLoading } = useChat()
  const first = conversations[0]

  if (conversationsLoading) {
    return (
      <div className="hidden h-full items-center justify-center bg-paper text-sm text-ink-3 min-[860px]:flex min-[860px]:flex-1">
        Loading conversations…
      </div>
    )
  }

  if (!first) {
    return (
      <div className="hidden h-full items-center justify-center bg-paper px-6 text-center text-sm text-ink-3 min-[860px]:flex min-[860px]:flex-1">
        No conversations yet. Message someone from Contacts.
      </div>
    )
  }

  return (
    <div className="hidden h-full min-[860px]:flex min-[860px]:flex-1">
      <Thread conversationId={first.id} />
    </div>
  )
}
