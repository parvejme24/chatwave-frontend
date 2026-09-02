"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import { playSound } from "../../lib/sounds"
import { isBadRequest, mutationErrorMessage } from "../../lib/store/api-error"
import {
  useCreateGroupConversationMutation,
  useGetConversationsQuery,
  useLeaveConversationMutation,
  useDeleteConversationMutation,
  useMarkConversationReadMutation,
  useRemoveConversationMemberMutation,
  useSetConversationMemberAdminMutation,
  useUpdateMembershipMutation,
} from "../../lib/store/conversations-api"
import { selectAccessToken, selectAuthUser } from "../../lib/store/auth-slice"
import { contactsApi } from "../../lib/store/contacts-api"
import { useAppDispatch, useAppSelector } from "../../lib/store/hooks"
import {
  useDeleteMessageMutation,
  useSendMessageMutation,
  useToggleMessagePinMutation,
  useToggleReactionMutation,
} from "../../lib/store/messages-api"
import type {
  Conversation,
  GroupMember,
  Me,
  ProfilePerson,
  RecordKind,
} from "../../lib/types/chat"
import { MIN_GROUP_MEMBERS } from "../../lib/types/chat"
import { apiTypeForFiles } from "../../lib/files"

type ChatContextValue = {
  me: Me
  conversations: Conversation[]
  conversationsLoading: boolean
  drawerOpen: boolean
  profile: ProfilePerson | null
  setDrawerOpen: (open: boolean) => void
  openProfile: (person: ProfilePerson) => void
  playingVoiceId: string | null
  setPlayingVoiceId: (id: string | null) => void
  getConversation: (id: string) => Conversation | undefined
  clearUnread: (id: string) => void
  sendText: (conversationId: string, text: string) => Promise<void>
  sendRecording: (
    conversationId: string,
    kind: RecordKind,
    payload: { file: File; duration: number }
  ) => Promise<void>
  sendAttachment: (
    conversationId: string,
    file: File | File[],
    caption?: string
  ) => Promise<void>
  deleteMessage: (
    conversationId: string,
    messageId: string,
    scope?: "me" | "everyone"
  ) => Promise<void>
  toggleReaction: (
    conversationId: string,
    messageId: string,
    emoji: string
  ) => Promise<void>
  togglePinMessage: (conversationId: string, messageId: string) => Promise<void>
  setPinned: (id: string, pinned: boolean) => Promise<void>
  setMuted: (id: string, muted: boolean) => Promise<void>
  setArchived: (id: string, archived: boolean) => Promise<void>
  createGroup: (name: string, members: GroupMember[]) => Promise<string>
  removeGroupMember: (conversationId: string, memberId: string) => Promise<boolean>
  setGroupAdmin: (
    conversationId: string,
    memberId: string,
    isAdmin: boolean
  ) => Promise<boolean>
  leaveGroup: (conversationId: string) => Promise<boolean>
  deleteConversation: (conversationId: string) => Promise<boolean>
  searchFocusNonce: number
  requestConversationSearch: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

const FALLBACK_ME: Me = { name: "You", initials: "Y", tone: "a" }

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAccessToken)
  const { data, isFetching } = useGetConversationsQuery(
    { filter: "all" },
    { skip: !token }
  )
  // Depend on `data` so Immer socket patches always re-render the chat list.
  const conversations = data?.conversations ?? []
  const [sendMessage] = useSendMessageMutation()
  const [deleteMessageMut] = useDeleteMessageMutation()
  const [toggleReactionMut] = useToggleReactionMutation()
  const [togglePinMut] = useToggleMessagePinMutation()
  const [updateMembership] = useUpdateMembershipMutation()
  const [markRead] = useMarkConversationReadMutation()
  const [createGroupMut] = useCreateGroupConversationMutation()
  const [removeMemberMut] = useRemoveConversationMemberMutation()
  const [setAdminMut] = useSetConversationMemberAdminMutation()
  const [leaveMut] = useLeaveConversationMutation()
  const [deleteConversationMut] = useDeleteConversationMutation()
  const [drawerOpen, setDrawerOpenState] = useState(false)
  const [profile, setProfile] = useState<ProfilePerson | null>(null)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const [searchFocusNonce, setSearchFocusNonce] = useState(0)

  const me = useMemo<Me>(() => {
    if (!user) return FALLBACK_ME
    return {
      id: user.id,
      name: user.name,
      initials: user.initials,
      tone: user.tone,
      photoUrl: user.photoUrl,
    }
  }, [user])

  const setDrawerOpen = useCallback((open: boolean) => {
    setDrawerOpenState(open)
    if (!open) setProfile(null)
  }, [])

  const openProfile = useCallback((person: ProfilePerson) => {
    setProfile(person)
    setDrawerOpenState(true)
  }, [])

  const requestConversationSearch = useCallback(() => {
    setSearchFocusNonce((current) => current + 1)
    setDrawerOpen(false)
  }, [setDrawerOpen])

  const getConversation = useCallback(
    (id: string) => conversations.find((conversation) => conversation.id === id),
    [conversations]
  )

  const clearUnread = useCallback(
    (id: string) => {
      void markRead(id)
    },
    [markRead]
  )

  const sendText = useCallback(
    async (conversationId: string, text: string) => {
      playSound("send")
      // Send plain text only. URLs stay in `text` so the bubble can linkify /
      // preview them. Do not post `links` here — Nest @IsUrl often 400s on
      // real-world URLs (YouTube query strings, etc.).
      await sendMessage({
        conversationId,
        type: "text",
        text,
      }).unwrap()
    },
    [sendMessage]
  )

  const sendRecording = useCallback(
    async (
      conversationId: string,
      kind: RecordKind,
      payload: { file: File; duration: number }
    ) => {
      playSound("send")
      const types =
        kind === "voice"
          ? (["voice", "file"] as const)
          : (["video_note", "video", "file"] as const)
      let lastError: unknown
      for (const type of types) {
        try {
          await sendMessage({
            conversationId,
            type,
            file: payload.file,
            duration: payload.duration,
          }).unwrap()
          return
        } catch (error) {
          lastError = error
          if (type === types[types.length - 1] || !isBadRequest(error)) {
            throw error
          }
        }
      }
      throw lastError
    },
    [sendMessage]
  )

  const sendAttachment = useCallback(
    async (conversationId: string, file: File | File[], caption?: string) => {
      playSound("send")
      const files = (Array.isArray(file) ? file : [file]).slice(0, 10)
      if (!files.length) return
      const type = apiTypeForFiles(files)
      const text = caption?.trim() || undefined
      // Links in caption are rendered client-side; only send file fields here
      // so a bad URL cannot 400 the whole attachment.
      await sendMessage({
        conversationId,
        type,
        files,
        file: files[0],
        caption: text,
      }).unwrap()
    },
    [sendMessage]
  )

  const deleteMessage = useCallback(
    async (
      conversationId: string,
      messageId: string,
      scope: "me" | "everyone" = "me"
    ) => {
      await deleteMessageMut({
        conversationId,
        messageId,
        scope,
      }).unwrap()
      setPlayingVoiceId((current) => (current === messageId ? null : current))
      playSound("delete")
    },
    [deleteMessageMut]
  )

  const toggleReaction = useCallback(
    async (conversationId: string, messageId: string, emoji: string) => {
      await toggleReactionMut({ conversationId, messageId, emoji }).unwrap()
    },
    [toggleReactionMut]
  )

  const togglePinMessage = useCallback(
    async (conversationId: string, messageId: string) => {
      await togglePinMut({ conversationId, messageId }).unwrap()
    },
    [togglePinMut]
  )

  const setPinned = useCallback(
    async (id: string, pinned: boolean) => {
      await updateMembership({ conversationId: id, pinned }).unwrap()
    },
    [updateMembership]
  )

  const setMuted = useCallback(
    async (id: string, muted: boolean) => {
      await updateMembership({ conversationId: id, muted }).unwrap()
    },
    [updateMembership]
  )

  const setArchived = useCallback(
    async (id: string, archived: boolean) => {
      await updateMembership({ conversationId: id, archived }).unwrap()
    },
    [updateMembership]
  )

  const removeGroupMember = useCallback(
    async (conversationId: string, memberId: string) => {
      try {
        await removeMemberMut({ conversationId, userId: memberId }).unwrap()
        playSound("delete")
        return true
      } catch {
        return false
      }
    },
    [removeMemberMut]
  )

  const setGroupAdmin = useCallback(
    async (conversationId: string, memberId: string, nextAdmin: boolean) => {
      try {
        await setAdminMut({
          conversationId,
          userId: memberId,
          isAdmin: nextAdmin,
        }).unwrap()
        return true
      } catch {
        return false
      }
    },
    [setAdminMut]
  )

  const leaveGroup = useCallback(
    async (conversationId: string) => {
      try {
        await leaveMut(conversationId).unwrap()
        setDrawerOpen(false)
        playSound("delete")
        return true
      } catch {
        return false
      }
    },
    [leaveMut, setDrawerOpen]
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await deleteConversationMut(conversationId).unwrap()
        dispatch(
          contactsApi.util.invalidateTags([
            { type: "Contacts", id: "LIST" },
            { type: "Following", id: "LIST" },
            { type: "OnlineContacts", id: "LIST" },
          ])
        )
        setDrawerOpen(false)
        playSound("delete")
        return true
      } catch {
        return false
      }
    },
    [deleteConversationMut, dispatch, setDrawerOpen]
  )

  const createGroup = useCallback(
    async (name: string, members: GroupMember[]) => {
      const title = name.trim()
      if (!title) {
        throw new Error("Group name is required")
      }
      if (members.length < MIN_GROUP_MEMBERS) {
        throw new Error(`Select at least ${MIN_GROUP_MEMBERS} people`)
      }
      const memberIds = members.map((member) => member.id).filter(Boolean)
      const created = await createGroupMut({ name: title, memberIds }).unwrap()
      playSound("send")
      return created.id
    },
    [createGroupMut]
  )

  const value = useMemo(
    () => ({
      me,
      conversations,
      conversationsLoading: isFetching && conversations.length === 0,
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
      sendAttachment,
      deleteMessage,
      toggleReaction,
      togglePinMessage,
      setPinned,
      setMuted,
      setArchived,
      createGroup,
      removeGroupMember,
      setGroupAdmin,
      leaveGroup,
      deleteConversation,
      searchFocusNonce,
      requestConversationSearch,
    }),
    [
      me,
      data,
      conversations,
      isFetching,
      drawerOpen,
      profile,
      playingVoiceId,
      searchFocusNonce,
      getConversation,
      clearUnread,
      sendText,
      sendRecording,
      sendAttachment,
      deleteMessage,
      setDrawerOpen,
      openProfile,
      toggleReaction,
      togglePinMessage,
      setPinned,
      setMuted,
      setArchived,
      createGroup,
      removeGroupMember,
      setGroupAdmin,
      leaveGroup,
      deleteConversation,
      requestConversationSearch,
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

export function chatActionError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return mutationErrorMessage(error, fallback)
}
