import { createApi } from "@reduxjs/toolkit/query/react"

import type {
  ContactDto,
  ContactsList,
  InviteLink,
  OpenChatResult,
} from "../types/contact"
import { axiosBaseQuery } from "./base-query"
import { conversationsApi } from "./conversations-api"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function unwrapContact(payload: unknown): ContactDto {
  const record = asRecord(payload)
  const nested = record?.contact
  if (nested && typeof nested === "object") return nested as ContactDto
  return payload as ContactDto
}

function unwrapList(payload: unknown): ContactsList {
  const record = asRecord(payload)
  const contacts = Array.isArray(record?.contacts)
    ? (record.contacts as ContactDto[])
    : Array.isArray(payload)
      ? (payload as ContactDto[])
      : []
  return {
    contacts,
    total: typeof record?.total === "number" ? record.total : contacts.length,
    onlineCount:
      typeof record?.onlineCount === "number" ? record.onlineCount : 0,
  }
}

function unwrapInvite(payload: unknown): InviteLink {
  const record = asRecord(payload)
  if (typeof record?.url === "string") return { url: record.url }
  return { url: "" }
}

function unwrapChat(payload: unknown): OpenChatResult {
  const record = asRecord(payload)
  const conversationId =
    typeof record?.conversationId === "string" ? record.conversationId : ""
  const href =
    typeof record?.href === "string"
      ? record.href
      : conversationId
        ? `/chats/${conversationId}`
        : "/chats"
  return { conversationId, href }
}

export const contactsApi = createApi({
  reducerPath: "contactsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Contacts", "OnlineContacts", "ContactSuggestions"],
  endpoints: (build) => ({
    getContacts: build.query<ContactsList, { q?: string } | void>({
      query: (args) => ({
        url: "/api/contacts",
        params: args?.q ? { q: args.q } : undefined,
      }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: [{ type: "Contacts", id: "LIST" }],
    }),
    getOnlineContacts: build.query<ContactsList, void>({
      query: () => ({ url: "/api/contacts/online" }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: [{ type: "OnlineContacts", id: "LIST" }],
    }),
    getInviteLink: build.query<InviteLink, void>({
      query: () => ({ url: "/api/contacts/invite-link" }),
      transformResponse: (response: unknown) => unwrapInvite(response),
    }),
    getContactSuggestions: build.query<ContactDto[], void>({
      query: () => ({ url: "/api/contacts/suggestions" }),
      transformResponse: (response: unknown) => unwrapList(response).contacts,
      providesTags: [{ type: "ContactSuggestions", id: "LIST" }],
    }),
    addContact: build.mutation<
      ContactDto,
      { userId?: string; username?: string; note?: string }
    >({
      query: (body) => ({
        url: "/api/contacts",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapContact(response),
      invalidatesTags: [
        { type: "Contacts", id: "LIST" },
        { type: "OnlineContacts", id: "LIST" },
        { type: "ContactSuggestions", id: "LIST" },
      ],
    }),
    updateContactNote: build.mutation<
      ContactDto,
      { personId: string; note: string }
    >({
      query: ({ personId, note }) => ({
        url: `/api/contacts/${personId}`,
        method: "PATCH",
        data: { note },
      }),
      transformResponse: (response: unknown) => unwrapContact(response),
      invalidatesTags: [
        { type: "Contacts", id: "LIST" },
        { type: "OnlineContacts", id: "LIST" },
      ],
    }),
    deleteContact: build.mutation<{ ok: boolean }, string>({
      query: (personId) => ({
        url: `/api/contacts/${personId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Contacts", id: "LIST" },
        { type: "OnlineContacts", id: "LIST" },
        { type: "ContactSuggestions", id: "LIST" },
      ],
    }),
    openContactChat: build.mutation<OpenChatResult, string>({
      query: (personId) => ({
        url: `/api/contacts/${personId}/chat`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => unwrapChat(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Conversation", id: "LIST" },
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
  useGetContactsQuery,
  useGetOnlineContactsQuery,
  useLazyGetInviteLinkQuery,
  useGetContactSuggestionsQuery,
  useAddContactMutation,
  useUpdateContactNoteMutation,
  useDeleteContactMutation,
  useOpenContactChatMutation,
} = contactsApi
