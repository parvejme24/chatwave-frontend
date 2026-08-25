"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import {
  connectSocket,
  disconnectSocket,
  emitCallJoin,
  emitCallLeave,
  emitJoinConversation,
  emitLeaveConversation,
} from "../../lib/realtime/socket"
import { playSound } from "../../lib/sounds"
import { useLogoutMutation } from "../../lib/store/auth-api"
import { selectAccessToken, selectAuthUser } from "../../lib/store/auth-slice"
import { callsApi, closeCallInCache } from "../../lib/store/calls-api"
import { conversationsApi } from "../../lib/store/conversations-api"
import { useAppDispatch, useAppSelector } from "../../lib/store/hooks"
import { store } from "../../lib/store/store"
import { messagesApi, type GetMessagesArgs } from "../../lib/store/messages-api"
import {
  notificationFromDto,
  notificationsApi,
} from "../../lib/store/notifications-api"
import {
  setIncomingCall,
  setSocketConnected,
  setTyping,
} from "../../lib/store/realtime-slice"
import { liveCallFromPayload } from "../../lib/types/call"
import type { AvatarTone } from "../../lib/types/chat"
import {
  asMessageStatus,
  entityId,
  formatConversationTime,
  messageFromDto,
  previewFromMessage,
  seenCountFromReceipts,
  statusFromReceipts,
  type ChatMessage,
  type ConversationsList,
  type MessageDto,
  type MessagesPage,
} from "../../lib/types/chat"
import { useSettings } from "../settings/settings-provider"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function messageFromSocket(payload: unknown, viewerId?: string): {
  envelopeId: string
  nestedId: string
  payloadKind: "group" | "direct" | null
  message: ChatMessage
} | null {
  const record = asRecord(payload)
  const raw = (asRecord(record?.message) ?? record) as MessageDto | null
  if (!raw || typeof raw.id !== "string") return null
  const conversation = asRecord(record?.conversation)
  const envelopeId =
    entityId(record?.conversationId) || entityId(record?.conversation)
  const nestedId = entityId(raw.conversationId)
  const payloadKind =
    record?.type === "group" ||
    record?.group === true ||
    conversation?.type === "group" ||
    conversation?.group === true
      ? "group"
      : record?.type === "direct" ||
          record?.group === false ||
          conversation?.type === "direct"
        ? "direct"
        : null
  return {
    envelopeId,
    nestedId,
    payloadKind,
    message: messageFromDto(raw, viewerId),
  }
}

function threadIdFromPath(pathname: string) {
  if (!pathname.startsWith("/chats/")) return ""
  return pathname.split("/")[2] ?? ""
}

function callIdFromLocation() {
  if (typeof window === "undefined") return ""
  return new URLSearchParams(window.location.search).get("callId")?.trim() ?? ""
}

export function SocketBridge() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectAuthUser)
  const { settings } = useSettings()
  const [logout] = useLogoutMutation()
  const viewerId = user?.id
  const threadId = threadIdFromPath(pathname)
  const joinedThread = useRef("")
  const joinedCall = useRef("")
  const viewerRef = useRef(viewerId)
  const notifyRef = useRef(settings.messageNotifications)

  useEffect(() => {
    viewerRef.current = viewerId
    notifyRef.current = settings.messageNotifications
  }, [settings.messageNotifications, viewerId])

  useEffect(() => {
    if (!token) {
      disconnectSocket()
      dispatch(setSocketConnected(false))
      return
    }

    const socket = connectSocket(token)

    function onConnect() {
      dispatch(setSocketConnected(true))
    }
    function onDisconnect() {
      dispatch(setSocketConnected(false))
    }

    function cachedMessageArgs() {
      const seen = new Map<string, GetMessagesArgs>()
      const queries = store.getState()[messagesApi.reducerPath].queries
      for (const entry of Object.values(queries)) {
        if (!entry || entry.endpointName !== "getMessages") continue
        const args = entry.originalArgs as GetMessagesArgs | undefined
        if (!args?.conversationId || seen.has(args.conversationId)) continue
        seen.set(args.conversationId, args)
      }
      return seen
    }

    function conversationKind(conversationId: string) {
      const list = conversationsApi.endpoints.getConversations.select({
        filter: "all",
      })(store.getState()).data
      const row = list?.conversations.find((item) => item.id === conversationId)
      if (!row) return null
      return row.group ? "group" : "direct"
    }

    function groupHomeForMessage(messageId: string) {
      for (const [cachedId, args] of cachedMessageArgs()) {
        if (conversationKind(cachedId) !== "group") continue
        const page = messagesApi.endpoints.getMessages.select(args)(
          store.getState()
        ).data
        if (page?.messages.some((item) => item.id === messageId)) return cachedId
      }
      return null
    }

    function resolveConversationId(
      envelopeId: string,
      nestedId: string,
      payloadKind: "group" | "direct" | null,
      messageId: string
    ) {
      const envelopeKind = envelopeId ? conversationKind(envelopeId) : null
      const nestedKind = nestedId ? conversationKind(nestedId) : null
      if (envelopeKind === "group") return envelopeId
      if (nestedKind === "group") return nestedId
      const groupHome = groupHomeForMessage(messageId)
      if (groupHome) return groupHome
      if (payloadKind === "group") {
        if (envelopeKind === "direct" || nestedKind === "direct") return ""
        return envelopeId || nestedId
      }
      return envelopeId || nestedId
    }

    function upsertThreadMessage(conversationId: string, message: ChatMessage) {
      const caches = cachedMessageArgs()
      for (const [cachedId, args] of caches) {
        dispatch(
          messagesApi.util.updateQueryData("getMessages", args, (draft: MessagesPage) => {
            if (cachedId === conversationId) {
              const index = draft.messages.findIndex((item) => item.id === message.id)
              if (index >= 0) draft.messages[index] = message
              else draft.messages.push(message)
            } else {
              draft.messages = draft.messages.filter((item) => item.id !== message.id)
            }
          })
        )
      }
      if (!caches.has(conversationId)) {
        dispatch(
          messagesApi.util.updateQueryData(
            "getMessages",
            { conversationId },
            (draft: MessagesPage) => {
              const index = draft.messages.findIndex((item) => item.id === message.id)
              if (index >= 0) draft.messages[index] = message
              else draft.messages.push(message)
            }
          )
        )
      }
    }

    function bumpConversation(conversationId: string, message: ChatMessage) {
      const viewing = threadIdFromPath(window.location.pathname) === conversationId
      const updater = (draft: ConversationsList) => {
        const row = draft.conversations.find((item) => item.id === conversationId)
        if (!row) return
        row.preview = previewFromMessage(message)
        row.time = message.sentAt
          ? formatConversationTime(message.sentAt)
          : row.time
        if (message.dir === "in" && !viewing) {
          row.unread = (row.unread ?? 0) + 1
        }
        if (message.dir === "out") row.unread = 0
      }
      dispatch(
        conversationsApi.util.updateQueryData(
          "getConversations",
          { filter: "all" },
          updater
        )
      )
    }

    function onMessageNew(payload: unknown) {
      const parsed = messageFromSocket(payload, viewerRef.current)
      if (!parsed) {
        dispatch(
          conversationsApi.util.invalidateTags([{ type: "Conversation", id: "LIST" }])
        )
        return
      }
      const conversationId = resolveConversationId(
        parsed.envelopeId,
        parsed.nestedId,
        parsed.payloadKind,
        parsed.message.id
      )
      if (!conversationId) {
        if (!parsed.envelopeId && !parsed.nestedId) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Conversation", id: "LIST" },
            ])
          )
        }
        return
      }
      const kind = conversationKind(conversationId)
      if (parsed.payloadKind === "group" && kind === "direct") return
      if (kind === "direct" && groupHomeForMessage(parsed.message.id)) return
      const message = {
        ...parsed.message,
        conversationId,
      }
      upsertThreadMessage(conversationId, message)
      bumpConversation(conversationId, message)
      if (
        message.dir === "in" &&
        threadIdFromPath(window.location.pathname) !== conversationId
      ) {
        playSound("notify")
      }
    }

    function onMessageUpdated(payload: unknown) {
      const parsed = messageFromSocket(payload, viewerRef.current)
      if (!parsed) return
      const conversationId = resolveConversationId(
        parsed.envelopeId,
        parsed.nestedId,
        parsed.payloadKind,
        parsed.message.id
      )
      if (!conversationId) return
      upsertThreadMessage(conversationId, {
        ...parsed.message,
        conversationId,
      })
    }

    function onReceiptsUpdated(payload: unknown) {
      const record = asRecord(payload)
      if (!record) return
      if (record.message) {
        onMessageUpdated(payload)
        return
      }
      const conversationId = entityId(record.conversationId)
      const messageId = entityId(record.messageId) || entityId(record.id)
      if (!conversationId || !messageId) return
      const receipts = record.receipts
      const caches = cachedMessageArgs()
      const args = caches.get(conversationId) ?? { conversationId }
      dispatch(
        messagesApi.util.updateQueryData(
          "getMessages",
          args,
          (draft: MessagesPage) => {
            const row = draft.messages.find((item) => item.id === messageId)
            if (!row) return
            const seenCount =
              typeof record.seenCount === "number"
                ? record.seenCount
                : seenCountFromReceipts(receipts, row.senderId)
            const status =
              asMessageStatus(record.status) ||
              statusFromReceipts(receipts, row.senderId) ||
              (seenCount > 0 ? "seen" : row.status)
            row.seenCount = seenCount
            if (status && status !== "sending") row.status = status
          }
        )
      )
    }

    function onMessageDeleted(payload: unknown) {
      const record = asRecord(payload)
      const id = typeof record?.id === "string" ? record.id : ""
      const conversationId = entityId(record?.conversationId)
      if (!id || !conversationId) return
      const scope = record?.scope === "everyone" ? "everyone" : "me"
      if (scope === "me") return
      dispatch(
        messagesApi.util.updateQueryData(
          "getMessages",
          { conversationId },
          (draft: MessagesPage) => {
            draft.messages = draft.messages.filter((item) => item.id !== id)
          }
        )
      )
    }

    function onTyping(payload: unknown) {
      const record = asRecord(payload)
      if (!record) return
      const conversationId = entityId(record.conversationId)
      if (!conversationId) return
      const userRecord = asRecord(record.user)
      const userId =
        (typeof record.userId === "string" && record.userId) ||
        (typeof userRecord?.id === "string" && userRecord.id) ||
        ""
      if (!userId || userId === viewerRef.current) {
        if (userId === viewerRef.current) {
          dispatch(setTyping({ conversationId, peer: null }))
        }
        return
      }
      const typing = record.typing !== false
      dispatch(
        setTyping({
          conversationId,
          peer: typing
            ? {
                userId,
                name:
                  (typeof record.name === "string" && record.name) ||
                  (typeof userRecord?.name === "string" && userRecord.name) ||
                  "Someone",
                initials:
                  (typeof userRecord?.initials === "string" &&
                    userRecord.initials) ||
                  "?",
                tone: ((typeof userRecord?.tone === "string" &&
                  userRecord.tone) ||
                  "a") as AvatarTone,
              }
            : null,
        })
      )
    }

    function onCallIncoming(payload: unknown) {
      const call = liveCallFromPayload(payload)
      if (!call) return
      if (call.status && call.status !== "ringing") return
      if (call.initiatedBy && call.initiatedBy === viewerRef.current) return
      const currentId = callIdFromLocation()
      if (currentId && currentId === call.id) return
      dispatch(setIncomingCall(call))
      dispatch(callsApi.util.invalidateTags([{ type: "Calls", id: "LIST" }]))
    }

    function onCallAccepted(payload: unknown) {
      const nested = liveCallFromPayload(payload)
      const record = asRecord(payload)
      const callId =
        nested?.id ||
        (typeof record?.callId === "string" && record.callId) ||
        ""
      const incoming = store.getState().realtime.incomingCall
      if (!callId || incoming?.id === callId) {
        dispatch(setIncomingCall(null))
      }
      if (callId) {
        dispatch(callsApi.util.invalidateTags([{ type: "Call", id: callId }]))
      }
      dispatch(callsApi.util.invalidateTags([{ type: "Calls", id: "LIST" }]))
    }

    function onCallDeclined(payload: unknown) {
      onCallClosed(payload, "declined")
    }
    function onCallEnded(payload: unknown) {
      onCallClosed(payload, "ended")
    }
    function onCallMissed(payload: unknown) {
      onCallClosed(payload, "missed")
    }

    function onCallClosed(
      payload: unknown,
      status: "ended" | "declined" | "missed"
    ) {
      const record = asRecord(payload)
      const nested = liveCallFromPayload(payload)
      const nestedCallId = asRecord(record?.call)?.id
      const callId =
        nested?.id ||
        (typeof record?.callId === "string" ? record.callId : "") ||
        (typeof nestedCallId === "string" ? nestedCallId : "")
      const incoming = store.getState().realtime.incomingCall
      if (!callId || incoming?.id === callId) {
        dispatch(setIncomingCall(null))
      }
      if (callId) {
        closeCallInCache(dispatch, store.getState, callId, status)
        dispatch(callsApi.util.invalidateTags([{ type: "Call", id: callId }]))
      }
      dispatch(callsApi.util.invalidateTags([{ type: "Calls", id: "LIST" }]))
    }

    function onNotificationNew(payload: unknown) {
      const record = asRecord(payload)
      const notification = notificationFromDto(
        record?.notification ?? payload
      )
      if (!notification.id) return
      dispatch(
        notificationsApi.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft) => {
            if (draft.notifications.some((row) => row.id === notification.id)) {
              return
            }
            draft.notifications.unshift(notification)
            draft.unreadCount += 1
          }
        )
      )
      if (typeof record?.unreadCount === "number") {
        dispatch(
          notificationsApi.util.updateQueryData(
            "getUnreadCount",
            undefined,
            (draft) => {
              draft.unreadCount = record.unreadCount as number
            }
          )
        )
      } else {
        dispatch(
          notificationsApi.util.updateQueryData(
            "getUnreadCount",
            undefined,
            (draft) => {
              draft.unreadCount += 1
            }
          )
        )
      }
      if (
        !notifyRef.current ||
        notification.type === "call" ||
        (notification.conversationId &&
          threadIdFromPath(window.location.pathname) ===
            notification.conversationId)
      ) {
        return
      }
      playSound("notify")
      toast(notification.title, {
        description: notification.body || undefined,
        action: notification.href
          ? {
              label: "Open",
              onClick: () => router.push(notification.href),
            }
          : undefined,
      })
    }

    function onNotificationBadge(payload: unknown) {
      const record = asRecord(payload)
      if (typeof record?.unreadCount === "number") {
        dispatch(
          notificationsApi.util.updateQueryData(
            "getUnreadCount",
            undefined,
            (draft) => {
              draft.unreadCount = record.unreadCount as number
            }
          )
        )
      }
    }

    function onBanned() {
      toast.error("This account has been banned")
      void logout()
      router.replace("/sign-in")
    }

    function onConversationRemoved(payload: unknown) {
      const record = asRecord(payload)
      const conversationId = entityId(record?.conversationId)
      dispatch(
        conversationsApi.util.invalidateTags([{ type: "Conversation", id: "LIST" }])
      )
      if (
        conversationId &&
        threadIdFromPath(window.location.pathname) === conversationId
      ) {
        router.replace("/chats")
      }
    }

    function onGroupUpdated() {
      dispatch(
        conversationsApi.util.invalidateTags([{ type: "Conversation", id: "LIST" }])
      )
    }

    function onConversationPreview(payload: unknown) {
      const record = asRecord(payload)
      const conversationId = entityId(record?.conversationId)
      const preview =
        typeof record?.preview === "string" ? record.preview : ""
      if (!conversationId) return
      dispatch(
        conversationsApi.util.updateQueryData(
          "getConversations",
          { filter: "all" },
          (draft: ConversationsList) => {
            const row = draft.conversations.find((item) => item.id === conversationId)
            if (!row) return
            if (preview) row.preview = preview
            if (typeof record?.time === "string") {
              row.time = formatConversationTime(record.time)
            }
            if (typeof record?.unread === "number") {
              row.unread = record.unread
            }
          }
        )
      )
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("message:new", onMessageNew)
    socket.on("message:updated", onMessageUpdated)
    socket.on("receipts:updated", onReceiptsUpdated)
    socket.on("message:deleted", onMessageDeleted)
    socket.on("typing", onTyping)
    socket.on("call:incoming", onCallIncoming)
    socket.on("call:accepted", onCallAccepted)
    socket.on("call:declined", onCallDeclined)
    socket.on("call:ended", onCallEnded)
    socket.on("call:missed", onCallMissed)
    socket.on("notification:new", onNotificationNew)
    socket.on("notification:badge", onNotificationBadge)
    socket.on("auth:banned", onBanned)
    socket.on("conversation:removed", onConversationRemoved)
    socket.on("group:updated", onGroupUpdated)
    socket.on("conversation:preview", onConversationPreview)
    if (socket.connected) onConnect()

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("message:new", onMessageNew)
      socket.off("message:updated", onMessageUpdated)
      socket.off("receipts:updated", onReceiptsUpdated)
      socket.off("message:deleted", onMessageDeleted)
      socket.off("typing", onTyping)
      socket.off("call:incoming", onCallIncoming)
      socket.off("call:accepted", onCallAccepted)
      socket.off("call:declined", onCallDeclined)
      socket.off("call:ended", onCallEnded)
      socket.off("call:missed", onCallMissed)
      socket.off("notification:new", onNotificationNew)
      socket.off("notification:badge", onNotificationBadge)
      socket.off("auth:banned", onBanned)
      socket.off("conversation:removed", onConversationRemoved)
      socket.off("group:updated", onGroupUpdated)
      socket.off("conversation:preview", onConversationPreview)
      disconnectSocket()
      dispatch(setSocketConnected(false))
    }
  }, [dispatch, logout, router, token])

  useEffect(() => {
    const previous = joinedThread.current
    if (previous && previous !== threadId) emitLeaveConversation(previous)
    if (threadId) emitJoinConversation(threadId)
    joinedThread.current = threadId
    return () => {
      if (threadId) emitLeaveConversation(threadId)
      joinedThread.current = ""
    }
  }, [threadId, token])

  useEffect(() => {
    if (!pathname.startsWith("/call")) {
      if (joinedCall.current) {
        emitCallLeave(joinedCall.current)
        joinedCall.current = ""
      }
      return
    }
    const callId = callIdFromLocation()
    if (!callId || callId === joinedCall.current) return
    if (joinedCall.current) emitCallLeave(joinedCall.current)
    emitCallJoin(callId)
    joinedCall.current = callId
  }, [pathname, token])

  return null
}
