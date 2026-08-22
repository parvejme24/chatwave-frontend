"use client"

import { format } from "date-fns"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import { CONVERSATIONS, ME, createConversations } from "@/lib/data/conversations"
import type {
  ChatMessage,
  Conversation,
  Me,
  MessageStatus,
  RecordKind,
  ThreadItem,
} from "@/lib/types/chat"
import { fmtTime } from "@/lib/waveform"

type ChatContextValue = {
  me: Me
  conversations: Conversation[]
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  playingVoiceId: string | null
  setPlayingVoiceId: (id: string | null) => void
  getConversation: (id: string) => Conversation | undefined
  clearUnread: (id: string) => void
  sendText: (conversationId: string, text: string) => void
  sendRecording: (
    conversationId: string,
    kind: RecordKind,
    duration: number
  ) => void
  toggleReaction: (conversationId: string, messageId: string, emoji: string) => void
  setPinned: (id: string, pinned: boolean) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

function patchConversation(
  list: Conversation[],
  id: string,
  updater: (conversation: Conversation) => Conversation
) {
  return list.map((conversation) =>
    conversation.id === id ? updater(conversation) : conversation
  )
}

function insertBeforeTyping(items: ThreadItem[], item: ThreadItem) {
  const next = [...items]
  const typingIndex = next.findIndex((entry) => entry.kind === "typing")
  if (typingIndex > -1) next.splice(typingIndex, 0, item)
  else next.push(item)
  return next
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    createConversations()
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)

  const getConversation = useCallback(
    (id: string) => conversations.find((conversation) => conversation.id === id),
    [conversations]
  )

  const clearUnread = useCallback((id: string) => {
    setConversations((current) =>
      patchConversation(current, id, (conversation) => ({
        ...conversation,
        unread: 0,
      }))
    )
  }, [])

  const setMessageStatus = useCallback(
    (conversationId: string, messageId: string, status: MessageStatus) => {
      setConversations((current) =>
        patchConversation(current, conversationId, (conversation) => ({
          ...conversation,
          messages: conversation.messages.map((item) =>
            item.kind === "message" && item.id === messageId
              ? { ...item, status }
              : item
          ),
        }))
      )
    },
    []
  )

  const sendText = useCallback(
    (conversationId: string, text: string) => {
      const time = format(new Date(), "h:mm a")
      const id = `${conversationId}-${Date.now()}`
      const message: ChatMessage = {
        id,
        kind: "message",
        dir: "out",
        type: "text",
        text,
        time,
        status: "sending",
      }

      setConversations((current) =>
        patchConversation(current, conversationId, (conversation) => ({
          ...conversation,
          preview: `You: ${text}`,
          previewIcon: undefined,
          time,
          messages: insertBeforeTyping(conversation.messages, message),
        }))
      )

      window.setTimeout(() => setMessageStatus(conversationId, id, "sent"), 420)
      window.setTimeout(
        () => setMessageStatus(conversationId, id, "delivered"),
        1100
      )
      window.setTimeout(() => setMessageStatus(conversationId, id, "seen"), 2600)
    },
    [setMessageStatus]
  )

  const sendRecording = useCallback(
    (conversationId: string, kind: RecordKind, duration: number) => {
      const time = format(new Date(), "h:mm a")
      const id = `${conversationId}-${Date.now()}`
      const dur = Math.max(1, Math.round(duration))
      const message: ChatMessage =
        kind === "voice"
          ? {
              id,
              kind: "message",
              dir: "out",
              type: "voice",
              duration: dur,
              seed: Math.floor(Math.random() * 900) + 20,
              time,
              status: "sent",
            }
          : {
              id,
              kind: "message",
              dir: "out",
              type: "video_note",
              duration: dur,
              time,
              status: "sent",
            }

      setConversations((current) =>
        patchConversation(current, conversationId, (conversation) => ({
          ...conversation,
          preview:
            kind === "voice"
              ? `You: Voice message · ${fmtTime(dur)}`
              : "You: Video message",
          previewIcon: kind === "voice" ? "mic" : "video",
          time,
          messages: insertBeforeTyping(conversation.messages, message),
        }))
      )
    },
    []
  )

  const toggleReaction = useCallback(
    (conversationId: string, messageId: string, emoji: string) => {
      setConversations((current) =>
        patchConversation(current, conversationId, (conversation) => ({
          ...conversation,
          messages: conversation.messages.map((item) => {
            if (item.kind !== "message" || item.id !== messageId) return item
            return {
              ...item,
              reactions: (item.reactions ?? []).map((reaction) =>
                reaction.emoji === emoji
                  ? {
                      ...reaction,
                      mine: !reaction.mine,
                      count: reaction.count + (reaction.mine ? -1 : 1),
                    }
                  : reaction
              ),
            }
          }),
        }))
      )
    },
    []
  )

  const setPinned = useCallback((id: string, pinned: boolean) => {
    setConversations((current) =>
      patchConversation(current, id, (conversation) => ({
        ...conversation,
        pinned,
      }))
    )
  }, [])

  const value = useMemo(
    () => ({
      me: ME,
      conversations,
      drawerOpen,
      setDrawerOpen,
      playingVoiceId,
      setPlayingVoiceId,
      getConversation,
      clearUnread,
      sendText,
      sendRecording,
      toggleReaction,
      setPinned,
    }),
    [
      conversations,
      drawerOpen,
      playingVoiceId,
      getConversation,
      clearUnread,
      sendText,
      sendRecording,
      toggleReaction,
      setPinned,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within ChatProvider")
  }
  return context
}

export const DEFAULT_CHAT_ID = CONVERSATIONS[0].id
