"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { Composer } from "./composer"
import { MessageList } from "./message-list"
import { ThreadHeader } from "./thread-header"
import { THREAD_SEARCH_INPUT_ID, ThreadTools } from "./thread-tools"
import { useChat } from "./chat-provider"
import { signalEase } from "../../components/motion/motion-item"
import { useMediaQuery } from "../../lib/hooks/use-media-query"
import {
  useGetConversationQuery,
  useMarkConversationReadMutation,
} from "../../lib/store/conversations-api"
import {
  useGetMessagesQuery,
  useMarkDeliveredMutation,
  useMarkSeenMutation,
} from "../../lib/store/messages-api"
import type { ChatMessage, ThreadView } from "../../lib/types/chat"
import { messagesForConversation, withDaySeparators } from "../../lib/types/chat"

export function Thread({ conversationId }: { conversationId: string }) {
  const { getConversation, searchFocusNonce, conversations } = useChat()
  const fromList = getConversation(conversationId)
  const { data: detail, isLoading } = useGetConversationQuery(
    conversationId,
    { skip: !conversationId }
  )
  const conversation = detail ?? fromList
  const { data: page } = useGetMessagesQuery(
    { conversationId },
    { skip: !conversationId }
  )
  const [markRead] = useMarkConversationReadMutation()
  const [markDelivered] = useMarkDeliveredMutation()
  const [markSeen] = useMarkSeenMutation()
  const isMobile = useMediaQuery("(max-width: 859px)")
  const reduceMotion = useReducedMotion()
  const [threadState, setThreadState] = useState({
    id: conversationId,
    view: "all" as ThreadView,
    query: "",
  })
  if (threadState.id !== conversationId) {
    setThreadState({ id: conversationId, view: "all", query: "" })
  }
  const threadView = threadState.view
  const threadQuery = threadState.query
  const lastSearchFocus = useRef(0)

  useEffect(() => {
    if (searchFocusNonce <= lastSearchFocus.current) return
    lastSearchFocus.current = searchFocusNonce
    document.getElementById(THREAD_SEARCH_INPUT_ID)?.focus()
  }, [searchFocusNonce])

  useEffect(() => {
    if (!conversationId) return
    void markRead(conversationId)
    void markDelivered(conversationId)
    void markSeen(conversationId)
  }, [conversationId, markDelivered, markRead, markSeen])

  if (!conversationId) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-paper text-ink-3">
        Select a conversation
      </section>
    )
  }

  if (!conversation && isLoading) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-paper text-ink-3">
        Loading conversation…
      </section>
    )
  }

  if (!conversation) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-paper text-ink-3">
        Conversation not found.
      </section>
    )
  }

  const thread = {
    ...conversation,
    messages: withDaySeparators(
      messagesForConversation(
        page?.messages ??
          conversation.messages.filter(
            (item): item is ChatMessage => item.kind === "message"
          ),
        conversationId,
        {
          isGroup: Boolean(conversation.group),
          groupIds: conversations.filter((item) => item.group).map((item) => item.id),
        }
      )
    ),
  }

  return (
    <motion.section
      key={conversation.id}
      aria-label="Conversation"
      initial={
        reduceMotion
          ? false
          : isMobile
            ? { x: "100%" }
            : { opacity: 0, y: 8 }
      }
      animate={{ x: 0, opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: signalEase }}
      className="flex h-full min-w-0 flex-1 flex-col bg-paper max-[859px]:fixed max-[859px]:inset-0 max-[859px]:z-50"
    >
      <ThreadHeader conversation={thread} />
      <ThreadTools
        conversation={thread}
        view={threadView}
        query={threadQuery}
        onViewChange={(view) =>
          setThreadState((current) => ({ ...current, view }))
        }
        onQueryChange={(query) =>
          setThreadState((current) => ({ ...current, query }))
        }
      />
      <MessageList
        conversation={thread}
        view={threadView}
        query={threadQuery}
      />
      <Composer conversationId={conversation.id} />
    </motion.section>
  )
}
