import { createApi } from "@reduxjs/toolkit/query/react"

import { formatFileSize } from "../files"
import type { ChatMessage, MessageDto, MessagesPage, ThreadView } from "../types/chat"
import {
  asMessageType,
  formatChatClock,
  formatConversationTime,
  messageFromDto,
  previewFromMessage,
} from "../types/chat"
import { axiosBaseQuery } from "./base-query"
import { conversationsApi } from "./conversations-api"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

type ViewerIdReader = () => string | undefined

let readViewerId: ViewerIdReader = () => undefined

export function bindViewerIdReader(reader: ViewerIdReader) {
  readViewerId = reader
}

function unwrapMessage(payload: unknown, asOutgoing = false): ChatMessage {
  const record = asRecord(payload)
  const nested = record?.message
  const raw = (
    nested && typeof nested === "object" ? nested : payload
  ) as MessageDto
  const message = messageFromDto(raw, readViewerId())
  if (!asOutgoing) return message
  const viewerId = readViewerId()
  return {
    ...message,
    dir: "out",
    senderId: message.senderId || viewerId,
  }
}

function unwrapPage(payload: unknown): MessagesPage {
  const record = asRecord(payload)
  const raw = Array.isArray(record?.messages)
    ? (record.messages as MessageDto[])
    : Array.isArray(payload)
      ? (payload as MessageDto[])
      : []
  const viewerId = readViewerId()
  return {
    messages: raw.map((item) => messageFromDto(item, viewerId)),
    nextCursor:
      typeof record?.nextCursor === "string" ? record.nextCursor : null,
  }
}

function bumpConversationPreview(conversationId: string, message: ChatMessage) {
  return conversationsApi.util.updateQueryData(
    "getConversations",
    { filter: "all" },
    (draft) => {
      const row = draft.conversations.find((item) => item.id === conversationId)
      if (!row) return
      row.preview = previewFromMessage(message)
      row.time = message.sentAt
        ? formatConversationTime(message.sentAt)
        : row.time
      if (message.dir === "out") row.unread = 0
    }
  )
}

function conversationGroupMap(getState: () => unknown) {
  const list = conversationsApi.endpoints.getConversations.select({
    filter: "all",
  })(getState() as never).data
  const map = new Map<string, boolean>()
  for (const row of list?.conversations ?? []) {
    map.set(row.id, Boolean(row.group))
  }
  return map
}

function cachedMessageEntries(getState: () => unknown) {
  const queries = (
    getState() as {
      messagesApi?: {
        queries?: Record<
          string,
          { endpointName?: string; originalArgs?: GetMessagesArgs }
        >
      }
    }
  ).messagesApi?.queries
  const seen = new Map<string, GetMessagesArgs>()
  if (!queries) return seen
  for (const entry of Object.values(queries)) {
    if (!entry || entry.endpointName !== "getMessages") continue
    const args = entry.originalArgs
    if (!args?.conversationId || seen.has(args.conversationId)) continue
    seen.set(args.conversationId, args)
  }
  return seen
}

function scrubSharedMessages(
  dispatch: (action: unknown) => unknown,
  getState: () => unknown,
  conversationId: string,
  messages: ChatMessage[]
) {
  const ids = new Set(messages.map((item) => item.id))
  if (ids.size === 0) return
  const groups = conversationGroupMap(getState)
  const isGroup = groups.get(conversationId) === true
  const caches = cachedMessageEntries(getState)

  if (isGroup) {
    for (const [cachedId, args] of caches) {
      if (cachedId === conversationId || groups.get(cachedId) === true) continue
      dispatch(
        messagesApi.util.updateQueryData("getMessages", args, (draft) => {
          draft.messages = draft.messages.filter((item) => !ids.has(item.id))
        })
      )
    }
    return
  }

  const groupOwned = new Set<string>()
  for (const [cachedId, args] of caches) {
    if (groups.get(cachedId) !== true) continue
    const page = messagesApi.endpoints.getMessages.select(args)(
      getState() as never
    ).data
    for (const item of page?.messages ?? []) groupOwned.add(item.id)
  }
  if (groupOwned.size === 0) return
  dispatch(
    messagesApi.util.updateQueryData(
      "getMessages",
      caches.get(conversationId) ?? { conversationId },
      (draft) => {
        draft.messages = draft.messages.filter((item) => !groupOwned.has(item.id))
      }
    )
  )
}

export type GetMessagesArgs = {
  conversationId: string
  cursor?: string
  limit?: number
  view?: ThreadView
  q?: string
}

export type SendMessageArg = {
  conversationId: string
  type?: ChatMessage["type"] | "audio"
  text?: string
  caption?: string
  replyTo?: string
  file?: File
  files?: File[]
  links?: string[]
  duration?: number
}

function collectFiles(arg: Pick<SendMessageArg, "file" | "files">) {
  const list = [...(arg.files ?? [])]
  if (arg.file && !list.includes(arg.file)) list.unshift(arg.file)
  return list.slice(0, 10)
}

function apiMediaType(type?: SendMessageArg["type"]) {
  if (!type || type === "text") return undefined
  if (type === "audio") return "voice"
  return type
}

export const messagesApi = createApi({
  reducerPath: "messagesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Messages"],
  endpoints: (build) => ({
    getMessages: build.query<MessagesPage, GetMessagesArgs>({
      query: ({ conversationId, cursor, limit, view, q }) => ({
        url: `/api/conversations/${conversationId}/messages`,
        params: {
          ...(typeof limit === "number" ? { limit } : {}),
          ...(cursor ? { cursor } : {}),
          ...(view && view !== "all" ? { view } : {}),
          ...(q ? { q } : {}),
        },
      }),
      transformResponse: (response: unknown, _meta, arg) => {
        const page = unwrapPage(response)
        return {
          ...page,
          messages: page.messages.filter((message) => {
            if (
              message.conversationId &&
              message.conversationId !== arg.conversationId
            ) {
              return false
            }
            return true
          }).map((message) => ({
            ...message,
            conversationId: message.conversationId || arg.conversationId,
          })),
        }
      },
      providesTags: (_result, _error, arg) => [
        { type: "Messages", id: arg.conversationId },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled
          scrubSharedMessages(dispatch, getState, arg.conversationId, data.messages)
        } catch {
          /* list errors stay on the query */
        }
      },
    }),
    sendMessage: build.mutation<ChatMessage, SendMessageArg>({
      query: (arg) => {
        const { conversationId, ...body } = arg
        const uploads = collectFiles(arg)
        const links = (body.links ?? []).filter(Boolean).slice(0, 10)
        // Multipart only when uploading real files. Link-only / text must stay JSON
        // or Nest validation returns 400.
        if (uploads.length) {
          const data = new FormData()
          if (uploads.length === 1) {
            data.append("file", uploads[0], uploads[0].name || "upload")
          } else {
            for (const file of uploads) {
              data.append("files", file, file.name || "upload")
            }
          }
          const type = apiMediaType(body.type) ?? "file"
          if (type) data.append("type", type)
          const caption = (body.caption ?? body.text ?? "").trim()
          if (caption) data.append("caption", caption)
          if (body.replyTo) data.append("replyTo", body.replyTo)
          if (typeof body.duration === "number") {
            data.append("duration", String(Math.round(body.duration)))
          }
          if (links.length === 1) data.append("links", links[0])
          else if (links.length > 1) data.append("links", JSON.stringify(links))
          return {
            url: `/api/conversations/${conversationId}/messages`,
            method: "POST",
            data,
          }
        }
        return {
          url: `/api/conversations/${conversationId}/messages`,
          method: "POST",
          data: {
            type: body.type ?? "text",
            ...(body.text ? { text: body.text } : {}),
            ...(body.caption ? { caption: body.caption } : {}),
            ...(body.replyTo ? { replyTo: body.replyTo } : {}),
            ...(typeof body.duration === "number"
              ? { duration: Math.round(body.duration) }
              : {}),
            ...(links.length ? { links } : {}),
          },
        }
      },
      transformResponse: (response: unknown, _meta, arg) => {
        const message = unwrapMessage(response, true)
        return {
          ...message,
          conversationId: message.conversationId || arg.conversationId,
          type: asMessageType(message.type || arg.type),
          mediaUrl: message.mediaUrl,
          attachments: message.attachments,
          duration: message.duration || arg.duration,
          caption: message.caption || arg.caption,
        }
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const uploads = collectFiles(arg)
        const links = (arg.links ?? []).filter(Boolean)
        const blobUrls = uploads.map((file) => URL.createObjectURL(file))
        const tempId = `local-${Date.now()}`
        const sentAt = new Date().toISOString()
        const hasMedia = uploads.length > 0 || links.length > 0
        const optimisticAttachments = [
          ...uploads.map((file, index) => ({
            url: blobUrls[index] || "",
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            mimeType: file.type,
            kind: (file.type.startsWith("image/")
              ? "image"
              : file.type.startsWith("video/")
                ? "video"
                : "file") as "image" | "video" | "file",
          })),
          ...links.map((url) => ({
            url,
            fileName: url,
            kind: "link" as const,
          })),
        ]
        const optimistic: ChatMessage = {
          id: tempId,
          kind: "message",
          conversationId: arg.conversationId,
          senderId: readViewerId(),
          dir: "out",
          type: asMessageType(arg.type),
          time: formatChatClock(sentAt),
          sentAt,
          status: "sending",
          text: hasMedia ? undefined : arg.text,
          caption:
            arg.caption ||
            (hasMedia ? arg.text : undefined) ||
            undefined,
          duration: arg.duration,
          mediaUrl: blobUrls[0] || links[0],
          fileName: uploads[0]?.name,
          fileSize: uploads[0] ? formatFileSize(uploads[0].size) : undefined,
          attachments: optimisticAttachments.length
            ? optimisticAttachments
            : undefined,
          seenCount: 0,
          seenBy: [],
        }
        dispatch(
          messagesApi.util.updateQueryData(
            "getMessages",
            { conversationId: arg.conversationId },
            (draft) => {
              if (!draft.messages.some((item) => item.id === tempId)) {
                draft.messages.push(optimistic)
              }
            }
          )
        )
        dispatch(bumpConversationPreview(arg.conversationId, optimistic))
        try {
          const { data } = await queryFulfilled
          const saved: ChatMessage = {
            ...data,
            type: asMessageType(data.type || arg.type),
            mediaUrl: data.mediaUrl || blobUrls[0] || links[0],
            attachments: data.attachments?.length
              ? data.attachments
              : optimistic.attachments,
            duration: data.duration || arg.duration,
            caption: data.caption || arg.caption,
            fileName: data.fileName || uploads[0]?.name,
            fileSize:
              data.fileSize ||
              (uploads[0] ? formatFileSize(uploads[0].size) : undefined),
            status:
              data.status === "seen" || data.status === "delivered"
                ? data.status
                : "sent",
            seenCount: data.seenCount ?? data.seenBy?.length ?? 0,
            seenBy: data.seenBy ?? [],
          }
          dispatch(
            messagesApi.util.updateQueryData(
              "getMessages",
              { conversationId: arg.conversationId },
              (draft) => {
                const index = draft.messages.findIndex((item) => item.id === tempId)
                if (index >= 0) draft.messages[index] = saved
                else if (!draft.messages.some((item) => item.id === saved.id)) {
                  draft.messages.push(saved)
                }
              }
            )
          )
          dispatch(bumpConversationPreview(arg.conversationId, saved))
          for (const url of blobUrls) {
            if (data.mediaUrl || data.attachments?.length) URL.revokeObjectURL(url)
          }
        } catch {
          dispatch(
            messagesApi.util.updateQueryData(
              "getMessages",
              { conversationId: arg.conversationId },
              (draft) => {
                draft.messages = draft.messages.filter((item) => item.id !== tempId)
              }
            )
          )
          for (const url of blobUrls) URL.revokeObjectURL(url)
        }
      },
    }),
    markDelivered: build.mutation<{ ok?: boolean }, string>({
      query: (conversationId) => ({
        url: `/api/conversations/${conversationId}/delivered`,
        method: "POST",
      }),
    }),
    markSeen: build.mutation<{ ok?: boolean }, string>({
      query: (conversationId) => ({
        url: `/api/conversations/${conversationId}/seen`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Messages", id },
      ],
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Conversation", id: "LIST" },
              { type: "Conversation", id: conversationId },
            ])
          )
        } catch {
          /* receipts can fail quietly */
        }
      },
    }),
    toggleReaction: build.mutation<
      ChatMessage,
      { messageId: string; conversationId: string; emoji: string }
    >({
      query: ({ messageId, emoji }) => ({
        url: `/api/messages/${messageId}/reactions`,
        method: "POST",
        data: { emoji },
      }),
      transformResponse: (response: unknown) => unwrapMessage(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Messages", id: arg.conversationId },
      ],
    }),
    toggleMessagePin: build.mutation<
      ChatMessage,
      { messageId: string; conversationId: string }
    >({
      query: ({ messageId }) => ({
        url: `/api/messages/${messageId}/pin`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => unwrapMessage(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Messages", id: arg.conversationId },
      ],
    }),
    deleteMessage: build.mutation<
      { ok?: boolean },
      { messageId: string; conversationId: string; scope?: "me" | "everyone" }
    >({
      query: ({ messageId, scope = "me" }) => ({
        url: `/api/messages/${messageId}`,
        method: "DELETE",
        params: { scope },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Messages", id: arg.conversationId },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Conversation", id: "LIST" },
              { type: "Conversation", id: arg.conversationId },
            ])
          )
        } catch {
          /* mutation error stays with the caller */
        }
      },
    }),
  }),
})

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkDeliveredMutation,
  useMarkSeenMutation,
  useToggleReactionMutation,
  useToggleMessagePinMutation,
  useDeleteMessageMutation,
} = messagesApi
