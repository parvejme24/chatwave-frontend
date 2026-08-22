"use client"

import { motion, useReducedMotion } from "framer-motion"

import { Composer } from "@/components/chats/composer"
import { MessageList } from "@/components/chats/message-list"
import { ThreadHeader } from "@/components/chats/thread-header"
import { useChat } from "@/components/chats/chat-provider"
import { signalEase } from "@/components/motion/motion-item"
import { useMediaQuery } from "@/lib/hooks/use-media-query"

export function Thread({ conversationId }: { conversationId: string }) {
  const { getConversation } = useChat()
  const conversation = getConversation(conversationId)
  const isMobile = useMediaQuery("(max-width: 859px)")
  const reduceMotion = useReducedMotion()

  if (!conversation) {
    return (
      <section className="flex h-full flex-1 items-center justify-center bg-paper text-ink-3">
        Conversation not found.
      </section>
    )
  }

  return (
    <motion.section
      aria-label="Conversation"
      initial={isMobile && !reduceMotion ? { x: "100%" } : false}
      animate={{ x: 0 }}
      transition={{ duration: 0.28, ease: signalEase }}
      className="flex h-full min-w-0 flex-1 flex-col bg-paper max-[859px]:fixed max-[859px]:inset-0 max-[859px]:z-50"
    >
      <ThreadHeader conversation={conversation} />
      <MessageList conversation={conversation} />
      <Composer conversationId={conversation.id} />
    </motion.section>
  )
}
