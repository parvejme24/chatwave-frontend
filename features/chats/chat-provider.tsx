"use client"

import { format } from "date-fns"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import { useSettings } from "../settings/settings-provider"
import { isManagedUserHidden } from "../../lib/data/admin-users"
import { CONVERSATIONS, ME, createConversations } from "../../lib/data/conversations"
import { initialsFromName } from "../../lib/data/settings"
import { playSound } from "../../lib/sounds"
import type {
  AvatarTone,
  ChatMessage,
  Conversation,
  GroupMember,
  Me,
  MessageStatus,
  PreviewIcon,
  ProfilePerson,
  RecordKind,
  ThreadItem,
} from "../../lib/types/chat"
import { MIN_GROUP_MEMBERS } from "../../lib/types/chat"
import { fmtTime } from "../../lib/waveform"

type ChatContextValue = {
  me: Me
  conversations: Conversation[]
  drawerOpen: boolean
  profile: ProfilePerson | null
  setDrawerOpen: (open: boolean) => void
  openProfile: (person: ProfilePerson) => void
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
  deleteMessage: (conversationId: string, messageId: string) => void
  toggleReaction: (conversationId: string, messageId: string, emoji: string) => void
  setPinned: (id: string, pinned: boolean) => void
  createGroup: (name: string, members: GroupMember[]) => string
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

function lastMessagePreview(items: ThreadItem[]): {
  preview: string
  previewIcon?: PreviewIcon
  time: string
} {
  const last = [...items]
    .reverse()
    .find((item): item is ChatMessage => item.kind === "message")

  if (!last) {
    return { preview: "No messages yet", previewIcon: undefined, time: "" }
  }

  const prefix = last.dir === "out" ? "You: " : ""

  if (last.type === "voice") {
    return {
      preview: `${prefix}Voice message · ${fmtTime(last.duration ?? 0)}`,
      previewIcon: "mic",
      time: last.time,
    }
  }
  if (last.type === "video_note") {
    return {
      preview: `${prefix}Video message`,
      previewIcon: "video",
      time: last.time,
    }
  }
  if (last.type === "image") {
    return {
      preview: `${prefix}${last.caption || "Photo"}`,
      previewIcon: "image",
      time: last.time,
    }
  }
  if (last.type === "file") {
    return {
      preview: `${prefix}${last.fileName || "File"}`,
      previewIcon: undefined,
      time: last.time,
    }
  }

  return {
    preview: `${prefix}${last.text || ""}`,
    previewIcon: undefined,
    time: last.time,
  }
}

function insertBeforeTyping(items: ThreadItem[], item: ThreadItem) {
  const next = [...items]
  const typingIndex = next.findIndex((entry) => entry.kind === "typing")
  if (typingIndex > -1) next.splice(typingIndex, 0, item)
  else next.push(item)
  return next
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { users, removedUserKeys } = useSettings()
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    createConversations()
  )
  const [drawerOpen, setDrawerOpenState] = useState(false)
  const [profile, setProfile] = useState<ProfilePerson | null>(null)

  const setDrawerOpen = useCallback((open: boolean) => {
    setDrawerOpenState(open)
    if (!open) setProfile(null)
  }, [])

  const openProfile = useCallback((person: ProfilePerson) => {
    setProfile(person)
    setDrawerOpenState(true)
  }, [])
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)

  const visibleConversations = useMemo(() => {
    return conversations
      .filter((conversation) => {
        if (conversation.group) return true
        return !isManagedUserHidden(
          users,
          removedUserKeys,
          conversation.id,
          conversation.name
        )
      })
      .map((conversation) => {
        if (!conversation.members) return conversation
        return {
          ...conversation,
          members: conversation.members.filter(
            (member) =>
              member.isMe ||
              !isManagedUserHidden(
                users,
                removedUserKeys,
                member.id,
                member.name
              )
          ),
        }
      })
  }, [conversations, removedUserKeys, users])

  const getConversation = useCallback(
    (id: string) =>
      visibleConversations.find((conversation) => conversation.id === id),
    [visibleConversations]
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

      playSound("send")
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
      playSound("send")
    },
    []
  )

  const deleteMessage = useCallback(
    (conversationId: string, messageId: string) => {
      setConversations((current) =>
        patchConversation(current, conversationId, (conversation) => {
          const messages = conversation.messages.filter(
            (item) => item.kind !== "message" || item.id !== messageId
          )
          return {
            ...conversation,
            messages,
            ...lastMessagePreview(messages),
          }
        })
      )
      setPlayingVoiceId((current) => (current === messageId ? null : current))
      playSound("delete")
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

  const createGroup = useCallback((name: string, members: GroupMember[]) => {
    const title = name.trim()
    if (!title) {
      throw new Error("Group name is required")
    }
    if (members.length < MIN_GROUP_MEMBERS) {
      throw new Error(`Select at least ${MIN_GROUP_MEMBERS} people`)
    }

    const time = format(new Date(), "h:mm a")
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 20)
    const id = `g-${slug || "group"}-${Date.now().toString(36)}`
    const tones: AvatarTone[] = ["a", "b", "c", "d", "e", "f"]
    const tone = tones[title.length % tones.length]
    const meMember: GroupMember = {
      id: "me",
      name: ME.name,
      initials: ME.initials,
      tone: ME.tone,
      presence: "online",
      isMe: true,
    }
    const roster = [meMember, ...members]
    const count = roster.length
    const conversation: Conversation = {
      id,
      name: title,
      initials: initialsFromName(title),
      tone,
      group: true,
      presence: "online",
      status: `${count} members`,
      live: false,
      sub: `${count} members · Created just now`,
      time,
      unread: 0,
      members: roster,
      preview: "You created this group",
      messages: [
        { id: `${id}-d1`, kind: "day", label: "Today" },
        {
          id: `${id}-1`,
          kind: "message",
          dir: "out",
          type: "text",
          text: `You created “${title}” with ${members.length} ${
            members.length === 1 ? "person" : "people"
          }.`,
          time,
          status: "seen",
        },
      ],
    }

    setConversations((current) => [conversation, ...current])
    playSound("send")
    return id
  }, [])

  const value = useMemo(
    () => ({
      me: ME,
      conversations: visibleConversations,
      drawerOpen,
      profile,
      setDrawerOpen,
      openProfile,
      playingVoiceId,
      setPlayingVoiceId,
      getConversation,
      clearUnread,
      sendText,
      sendRecording,
      deleteMessage,
      toggleReaction,
      setPinned,
      createGroup,
    }),
    [
      visibleConversations,
      drawerOpen,
      profile,
      playingVoiceId,
      getConversation,
      clearUnread,
      sendText,
      sendRecording,
      deleteMessage,
      setDrawerOpen,
      openProfile,
      toggleReaction,
      setPinned,
      createGroup,
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
