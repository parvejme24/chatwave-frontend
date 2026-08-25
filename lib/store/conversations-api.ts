import { createApi } from "@reduxjs/toolkit/query/react"

import type {
  Conversation,
  ConversationDetail,
  ConversationFilter,
  ConversationListItem,
  ConversationMemberDto,
  ConversationsList,
  GroupMember,
} from "../types/chat"
import {
  conversationFromDto,
  memberFromDto,
} from "../types/chat"
import { axiosBaseQuery } from "./base-query"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function unwrapConversation(payload: unknown): Conversation {
  const record = asRecord(payload)
  const nested = record?.conversation
  if (nested && typeof nested === "object") {
    return conversationFromDto(nested as ConversationDetail)
  }
  return conversationFromDto(payload as ConversationDetail)
}

function unwrapList(payload: unknown): ConversationsList {
  const record = asRecord(payload)
  const raw = Array.isArray(record?.conversations)
    ? (record.conversations as ConversationListItem[])
    : Array.isArray(payload)
      ? (payload as ConversationListItem[])
      : []
  return { conversations: raw.map(conversationFromDto) }
}

function unwrapMembers(payload: unknown): GroupMember[] {
  const record = asRecord(payload)
  const raw = Array.isArray(record?.members)
    ? (record.members as ConversationMemberDto[])
    : Array.isArray(payload)
      ? (payload as ConversationMemberDto[])
      : []
  return raw.map(memberFromDto)
}

export type ConversationListArgs = {
  filter?: ConversationFilter
  q?: string
  limit?: number
}

export type MembershipPatch = {
  conversationId: string
  pinned?: boolean
  muted?: boolean
  archived?: boolean
}

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Conversation", "ConversationMembers"],
  endpoints: (build) => ({
    getConversations: build.query<ConversationsList, ConversationListArgs | void>(
      {
        query: (args) => ({
          url: "/api/conversations",
          params: {
            filter: args?.filter ?? "all",
            ...(args?.q ? { q: args.q } : {}),
            limit: args?.limit ?? 50,
          },
        }),
        transformResponse: (response: unknown) => unwrapList(response),
        providesTags: (result) =>
          result
            ? [
                { type: "Conversation", id: "LIST" },
                ...result.conversations.map((item) => ({
                  type: "Conversation" as const,
                  id: item.id,
                })),
              ]
            : [{ type: "Conversation", id: "LIST" }],
      }
    ),
    getConversation: build.query<Conversation, string>({
      query: (id) => ({ url: `/api/conversations/${id}` }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      providesTags: (_result, _error, id) => [
        { type: "Conversation", id },
        { type: "ConversationMembers", id },
      ],
    }),
    createDirectConversation: build.mutation<Conversation, { userId: string }>({
      query: (body) => ({
        url: "/api/conversations/direct",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),
    createGroupConversation: build.mutation<
      Conversation,
      { name: string; memberIds: string[] }
    >({
      query: (body) => ({
        url: "/api/conversations/groups",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      invalidatesTags: [{ type: "Conversation", id: "LIST" }],
    }),
    updateConversation: build.mutation<
      Conversation,
      { conversationId: string; name?: string; tone?: string }
    >({
      query: ({ conversationId, ...body }) => ({
        url: `/api/conversations/${conversationId}`,
        method: "PATCH",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Conversation", id: "LIST" },
        { type: "Conversation", id: arg.conversationId },
      ],
    }),
    updateMembership: build.mutation<Conversation, MembershipPatch>({
      query: ({ conversationId, ...body }) => ({
        url: `/api/conversations/${conversationId}/membership`,
        method: "PATCH",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Conversation", id: "LIST" },
        { type: "Conversation", id: arg.conversationId },
      ],
    }),
    markConversationRead: build.mutation<Conversation, string>({
      query: (conversationId) => ({
        url: `/api/conversations/${conversationId}/read`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      invalidatesTags: (_result, _error, id) => [
        { type: "Conversation", id: "LIST" },
        { type: "Conversation", id },
      ],
    }),
    getConversationMembers: build.query<GroupMember[], string>({
      query: (id) => ({ url: `/api/conversations/${id}/members` }),
      transformResponse: (response: unknown) => unwrapMembers(response),
      providesTags: (_result, _error, id) => [
        { type: "ConversationMembers", id },
      ],
    }),
    addConversationMembers: build.mutation<
      Conversation,
      { conversationId: string; userIds: string[] }
    >({
      query: ({ conversationId, userIds }) => ({
        url: `/api/conversations/${conversationId}/members`,
        method: "POST",
        data: { userIds },
      }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Conversation", id: "LIST" },
        { type: "Conversation", id: arg.conversationId },
        { type: "ConversationMembers", id: arg.conversationId },
      ],
    }),
    removeConversationMember: build.mutation<
      Conversation,
      { conversationId: string; userId: string }
    >({
      query: ({ conversationId, userId }) => ({
        url: `/api/conversations/${conversationId}/members/${userId}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Conversation", id: "LIST" },
        { type: "Conversation", id: arg.conversationId },
        { type: "ConversationMembers", id: arg.conversationId },
      ],
    }),
    setConversationMemberAdmin: build.mutation<
      Conversation,
      { conversationId: string; userId: string; isAdmin: boolean }
    >({
      query: ({ conversationId, userId, isAdmin }) => ({
        url: `/api/conversations/${conversationId}/members/${userId}/admin`,
        method: "PATCH",
        data: { isAdmin },
      }),
      transformResponse: (response: unknown) => unwrapConversation(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Conversation", id: arg.conversationId },
        { type: "ConversationMembers", id: arg.conversationId },
      ],
    }),
    leaveConversation: build.mutation<{ ok: boolean }, string>({
      query: (conversationId) => ({
        url: `/api/conversations/${conversationId}/leave`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Conversation", id: "LIST" },
        { type: "Conversation", id },
        { type: "ConversationMembers", id },
      ],
    }),
  }),
})

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateDirectConversationMutation,
  useCreateGroupConversationMutation,
  useUpdateConversationMutation,
  useUpdateMembershipMutation,
  useMarkConversationReadMutation,
  useGetConversationMembersQuery,
  useAddConversationMembersMutation,
  useRemoveConversationMemberMutation,
  useSetConversationMemberAdminMutation,
  useLeaveConversationMutation,
} = conversationsApi
