"use client"

import { useChat } from "../../features/chats/chat-provider"
import { selectAccessToken } from "../store/auth-slice"
import { useAppSelector } from "../store/hooks"
import { useGetUnreadCountQuery } from "../store/notifications-api"

export function useNavUnread() {
  const token = useAppSelector(selectAccessToken)
  const { conversations } = useChat()
  const { data } = useGetUnreadCountQuery(undefined, { skip: !token })
  const chatUnread = conversations.reduce(
    (sum, conversation) => sum + (conversation.unread || 0),
    0
  )
  return Math.max(chatUnread, data?.unreadCount ?? 0)
}
