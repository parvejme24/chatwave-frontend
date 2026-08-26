"use client"

import { useChat } from "../../features/chats/chat-provider"

/** Unread chat messages for the Chats nav badge (not system notifications). */
export function useNavUnread() {
  const { conversations } = useChat()
  return conversations.reduce(
    (sum, conversation) => sum + (conversation.unread || 0),
    0
  )
}
