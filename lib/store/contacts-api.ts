import { createApi } from "@reduxjs/toolkit/query/react"

import type { AvatarTone } from "../types/chat"
import type {
  ContactDto,
  ContactsList,
  InviteLink,
  OpenChatResult,
} from "../types/contact"
import { contactInitials } from "../types/contact"
import { axiosBaseQuery } from "./base-query"
import { conversationsApi } from "./conversations-api"
import { usersApi } from "./users-api"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function unwrapContact(payload: unknown): ContactDto {
  const record = asRecord(payload)
  const nested = record?.contact ?? payload
  const normalized = normalizeContact(nested)
  if (normalized) {
    return {
      ...normalized,
      following: Boolean(normalized.following || record?.following),
      hrefChat:
        normalized.hrefChat ||
        (typeof record?.hrefChat === "string" ? record.hrefChat : undefined),
    }
  }
  return {
    id: "",
    name: "Someone",
    user: "",
    initials: "?",
    tone: "a",
    photoUrl: null,
    presence: "offline",
    note: "",
    following: Boolean(record?.following),
  }
}

function pickList(record: Record<string, unknown> | null, payload: unknown) {
  if (Array.isArray(payload)) return payload
  if (!record) return []
  if (Array.isArray(record.contacts)) return record.contacts
  if (Array.isArray(record.users)) return record.users
  if (Array.isArray(record.people)) return record.people
  if (Array.isArray(record.results)) return record.results
  if (Array.isArray(record.items)) return record.items
  if (Array.isArray(record.following)) return record.following
  const nested = asRecord(record.data)
  if (Array.isArray(record.data)) return record.data
  if (nested) {
    if (Array.isArray(nested.contacts)) return nested.contacts
    if (Array.isArray(nested.users)) return nested.users
    if (Array.isArray(nested.people)) return nested.people
  }
  return []
}

function asTone(value: unknown): AvatarTone {
  if (value === "a" || value === "b" || value === "c" || value === "d" || value === "e" || value === "f") {
    return value
  }
  return "a"
}

function asId(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim()
  if (typeof value === "number") return String(value)
  if (!value || typeof value !== "object") return ""
  const record = value as Record<string, unknown>
  if (typeof record.id === "string" && record.id.trim()) return record.id.trim()
  if (typeof record._id === "string" && record._id.trim()) return record._id.trim()
  return ""
}

function normalizeContact(item: unknown): ContactDto | null {
  const record = asRecord(item)
  if (!record) return null
  const nestedUser = asRecord(record.user)
  const id = asId(record.id) || asId(record._id) || asId(nestedUser)
  const name =
    (typeof record.name === "string" && record.name) ||
    (typeof nestedUser?.name === "string" && nestedUser.name) ||
    ""
  const username =
    (typeof record.username === "string" && record.username) ||
    (typeof record.user === "string" && record.user) ||
    (typeof nestedUser?.username === "string" && nestedUser.username) ||
    ""
  if (!id && !username && !name) return null
  return {
    ...(record as unknown as ContactDto),
    id: id || username,
    name: name || username || "Someone",
    user: username || id,
    username: username || undefined,
    following: Boolean(record.following),
    tone: asTone(record.tone ?? nestedUser?.tone),
    presence:
      record.presence === "online" || record.presence === "away"
        ? record.presence
        : "offline",
    initials:
      (typeof record.initials === "string" && record.initials) ||
      contactInitials(name || username || "Someone"),
    hrefChat:
      typeof record.hrefChat === "string" ? record.hrefChat : undefined,
    photoUrl:
      (typeof record.photoUrl === "string" && record.photoUrl) ||
      (typeof nestedUser?.photoUrl === "string" && nestedUser.photoUrl) ||
      null,
  }
}

function unwrapList(payload: unknown): ContactsList {
  const record = asRecord(payload)
  const contacts = pickList(record, payload)
    .map(normalizeContact)
    .filter((item): item is ContactDto => Boolean(item))
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

export function contactPreview(contact: {
  id?: string
  name: string
  user: string
  initials?: string
  tone?: ContactDto["tone"]
  photo?: string | null
  presence?: ContactDto["presence"]
  note?: string
  hrefChat?: string
}): Partial<ContactDto> {
  return {
    id: contact.id,
    name: contact.name,
    user: contact.user,
    username: contact.user,
    initials: contact.initials || contact.name.slice(0, 2).toUpperCase(),
    tone: contact.tone || "a",
    photoUrl: contact.photo ?? null,
    presence: contact.presence || "offline",
    note: contact.note || "",
    following: true,
    hrefChat: contact.hrefChat,
  }
}

export type ContactsListArgs = {
  q?: string
  limit?: number
}

export type FollowUserArg = {
  userId: string
  preview?: Partial<ContactDto>
}

function contactsParams(args?: ContactsListArgs | void) {
  const q = args?.q?.trim()
  const limit = Math.min(Math.max(args?.limit ?? 200, 1), 500)
  return q ? { q, limit } : { limit }
}

function samePerson(item: ContactDto, userId: string) {
  return (
    item.id === userId ||
    item.user === userId ||
    item.username === userId
  )
}

function definedFields<T extends object>(value?: T) {
  if (!value) return {} as Partial<T>
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  ) as Partial<T>
}

function applyFollowToContacts(
  contacts: ContactDto[],
  userId: string,
  following: boolean,
  extra?: Partial<ContactDto>
) {
  const patch = definedFields(extra)
  const index = contacts.findIndex((item) => samePerson(item, userId))
  if (index < 0) {
    if (following && patch.id && patch.name) {
      contacts.unshift({ ...(patch as ContactDto), following: true })
    }
    return
  }
  contacts[index] = {
    ...contacts[index],
    ...patch,
    following,
  }
}

type CachePatch = { undo: () => void }

function isMissingRoute(error: { status?: number } | undefined) {
  return error?.status === 404 || error?.status === 405
}

let followingRouteMissing = false
let followNestedRouteMissing = false

function cacheEntryReady(entry: {
  status?: string
  data?: unknown
}) {
  return entry.status === "fulfilled" && entry.data != null
}

function patchFollowCaches(
  dispatch: (action: unknown) => unknown,
  getState: () => unknown,
  userId: string,
  following: boolean,
  extra?: Partial<ContactDto>
) {
  const queries = (
    getState() as {
      contactsApi?: {
        queries?: Record<
          string,
          {
            endpointName?: string
            originalArgs?: ContactsListArgs | void
            status?: string
            data?: unknown
          }
        >
      }
    }
  ).contactsApi?.queries
  const patches: CachePatch[] = []
  const seen = new Set<string>()
  for (const [key, entry] of Object.entries(queries ?? {})) {
    if (!entry?.endpointName || seen.has(key) || !cacheEntryReady(entry)) continue
    seen.add(key)
    try {
      if (
        entry.endpointName === "getContacts" ||
        entry.endpointName === "getOnlineContacts"
      ) {
        const patch = dispatch(
          contactsApi.util.updateQueryData(
            entry.endpointName,
            entry.originalArgs,
            (draft) => {
              if (!draft?.contacts) return
              applyFollowToContacts(draft.contacts, userId, following, extra)
            }
          )
        ) as CachePatch
        if (typeof patch?.undo === "function") patches.push(patch)
        continue
      }
      if (entry.endpointName === "getFollowing") {
        const patch = dispatch(
          contactsApi.util.updateQueryData(
            "getFollowing",
            entry.originalArgs,
            (draft) => {
              if (!draft?.contacts) return
              const next = definedFields(extra)
              const index = draft.contacts.findIndex((item) =>
                samePerson(item, userId)
              )
              if (!following) {
                if (index >= 0) {
                  draft.contacts.splice(index, 1)
                  draft.total = Math.max(0, draft.total - 1)
                }
                return
              }
              if (index >= 0) {
                draft.contacts[index] = {
                  ...draft.contacts[index],
                  ...next,
                  following: true,
                }
                return
              }
              if (!next.id || !next.name) return
              draft.contacts.unshift({ ...(next as ContactDto), following: true })
              draft.total += 1
            }
          )
        ) as CachePatch
        if (typeof patch?.undo === "function") patches.push(patch)
        continue
      }
      if (entry.endpointName === "getContactSuggestions") {
        const patch = dispatch(
          contactsApi.util.updateQueryData(
            "getContactSuggestions",
            undefined,
            (draft) => {
              if (!Array.isArray(draft)) return
              applyFollowToContacts(draft, userId, following, extra)
            }
          )
        ) as CachePatch
        if (typeof patch?.undo === "function") patches.push(patch)
      }
    } catch {
      /* skip cache entries that are not patchable */
    }
  }

  const userQueries = (
    getState() as {
      usersApi?: {
        queries?: Record<
          string,
          {
            endpointName?: string
            originalArgs?: unknown
            status?: string
            data?: unknown
          }
        >
      }
    }
  ).usersApi?.queries
  for (const [key, entry] of Object.entries(userQueries ?? {})) {
    if (entry?.endpointName !== "listUsers" || !cacheEntryReady(entry)) continue
    if (seen.has(`users:${key}`)) continue
    seen.add(`users:${key}`)
    try {
      const patch = dispatch(
        usersApi.util.updateQueryData(
          "listUsers",
          entry.originalArgs as never,
          (draft) => {
            if (!draft?.users) return
            const index = draft.users.findIndex(
              (item) =>
                item.id === userId ||
                item.username === userId ||
                item.user === userId
            )
            if (index < 0) return
            draft.users[index] = {
              ...draft.users[index],
              ...(extra?.name ? { name: extra.name } : {}),
              ...(extra?.photoUrl !== undefined
                ? { photoUrl: extra.photoUrl }
                : {}),
              ...(extra?.hrefChat ? { hrefChat: extra.hrefChat } : {}),
              following,
            }
          }
        )
      ) as CachePatch
      if (typeof patch?.undo === "function") patches.push(patch)
    } catch {
      /* skip */
    }
  }
  return patches
}

function undoPatches(patches: CachePatch[]) {
  for (const patch of [...patches].reverse()) {
    if (typeof patch?.undo === "function") patch.undo()
  }
}

async function runFollowLifecycle(
  userId: string,
  following: boolean,
  extra: Partial<ContactDto> | undefined,
  api: {
    dispatch: (action: unknown) => unknown
    getState: () => unknown
    queryFulfilled: Promise<{ data: ContactDto | { ok?: boolean } }>
  }
) {
  let patches: CachePatch[] = []
  try {
    patches = patchFollowCaches(
      api.dispatch,
      api.getState,
      userId,
      following,
      extra
    )
  } catch {
    patches = []
  }
  try {
    const { data } = await api.queryFulfilled
    const contact = "id" in data && data.id ? (data as ContactDto) : extra
    try {
      patchFollowCaches(
        api.dispatch,
        api.getState,
        userId,
        following,
        contact
      )
    } catch {
      /* cache patch is best-effort */
    }
    api.dispatch(
      conversationsApi.util.invalidateTags([
        { type: "Conversation", id: "LIST" },
      ])
    )
  } catch {
    undoPatches(patches)
  }
}

export const contactsApi = createApi({
  reducerPath: "contactsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Contacts", "OnlineContacts", "ContactSuggestions", "Following"],
  endpoints: (build) => ({
    getContacts: build.query<ContactsList, ContactsListArgs | void>({
      query: (args) => ({
        url: "/api/contacts",
        params: contactsParams(args),
      }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: [{ type: "Contacts", id: "LIST" }],
    }),
    getOnlineContacts: build.query<ContactsList, void>({
      query: () => ({ url: "/api/contacts/online" }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: [{ type: "OnlineContacts", id: "LIST" }],
    }),
    getFollowing: build.query<ContactsList, ContactsListArgs | void>({
      async queryFn(args, _api, _extra, baseQuery) {
        if (!followingRouteMissing) {
          const direct = await baseQuery({
            url: "/api/contacts/following",
            params: args?.q?.trim() ? { q: args.q.trim() } : undefined,
          })
          if (!direct.error) {
            const list = unwrapList(direct.data)
            return {
              data: {
                ...list,
                contacts: list.contacts.map((item) => ({
                  ...item,
                  following: true,
                })),
              },
            }
          }
          if (!isMissingRoute(direct.error)) return { error: direct.error }
          followingRouteMissing = true
        }
        const all = await baseQuery({
          url: "/api/contacts",
          params: contactsParams(args),
        })
        if (all.error) return { error: all.error }
        const list = unwrapList(all.data)
        const contacts = list.contacts.filter((item) => item.following)
        return {
          data: {
            contacts,
            total: contacts.length,
            onlineCount: contacts.filter((item) => item.presence === "online")
              .length,
          },
        }
      },
      providesTags: [{ type: "Following", id: "LIST" }],
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
      async onQueryStarted(body, api) {
        const userId = body.userId || body.username
        if (!userId) return
        await runFollowLifecycle(userId, true, { id: body.userId, following: true }, api)
      },
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: "Contacts", id: "LIST" },
              { type: "Following", id: "LIST" },
              { type: "OnlineContacts", id: "LIST" },
              { type: "ContactSuggestions", id: "LIST" },
            ],
    }),
    followUser: build.mutation<ContactDto, FollowUserArg>({
      async queryFn(arg, _api, _extra, baseQuery) {
        const userId = arg.userId
        if (!followNestedRouteMissing) {
          const nested = await baseQuery({
            url: `/api/contacts/${userId}/follow`,
            method: "POST",
          })
          if (!nested.error) return { data: unwrapContact(nested.data) }
          if (!isMissingRoute(nested.error)) return { error: nested.error }
          followNestedRouteMissing = true
        }
        const created = await baseQuery({
          url: "/api/contacts",
          method: "POST",
          data: { userId },
        })
        if (created.error) return { error: created.error }
        return { data: unwrapContact(created.data) }
      },
      async onQueryStarted(arg, api) {
        await runFollowLifecycle(
          arg.userId,
          true,
          {
            id: arg.userId,
            following: true,
            ...arg.preview,
          },
          api
        )
      },
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: "Contacts", id: "LIST" },
              { type: "Following", id: "LIST" },
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
    unfollowUser: build.mutation<{ ok: boolean }, string>({
      query: (personId) => ({
        url: `/api/contacts/${personId}`,
        method: "DELETE",
      }),
      async onQueryStarted(userId, api) {
        await runFollowLifecycle(userId, false, { following: false }, api)
      },
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: "Contacts", id: "LIST" },
              { type: "Following", id: "LIST" },
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
  useGetFollowingQuery,
  useLazyGetInviteLinkQuery,
  useGetContactSuggestionsQuery,
  useAddContactMutation,
  useFollowUserMutation,
  useUpdateContactNoteMutation,
  useUnfollowUserMutation,
  useOpenContactChatMutation,
} = contactsApi

export const useListContactsQuery = useGetContactsQuery
export const useListFollowingQuery = useGetFollowingQuery
export const useFollowContactMutation = useFollowUserMutation
export const useDeleteContactMutation = useUnfollowUserMutation

export const listContacts = contactsApi.endpoints.getContacts.initiate
export const listFollowing = contactsApi.endpoints.getFollowing.initiate
export const followUser = contactsApi.endpoints.followUser.initiate
export const unfollowUser = contactsApi.endpoints.unfollowUser.initiate
export const openContactChat = contactsApi.endpoints.openContactChat.initiate
