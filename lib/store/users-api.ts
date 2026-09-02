import { createApi } from "@reduxjs/toolkit/query/react"

import type { AuthUser } from "../types/auth"
import type { Presence } from "../types/chat"
import type {
  DirectoryUser,
  PresenceUpdate,
  PublicUser,
  SearchUsersArgs,
  UpdateProfileInput,
  UsersDirectoryList,
} from "../types/user"
import { clearAuth, setUser } from "./auth-slice"
import { axiosBaseQuery } from "./base-query"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function unwrapOwner(payload: unknown): AuthUser {
  const record = asRecord(payload)
  const nested = record?.user
  if (nested && typeof nested === "object") return nested as AuthUser
  return payload as AuthUser
}

function unwrapPublic(payload: unknown): PublicUser {
  const record = asRecord(payload)
  const nested = record?.user
  if (nested && typeof nested === "object") return nested as PublicUser
  return payload as PublicUser
}

function unwrapUserList(payload: unknown): PublicUser[] {
  const record = asRecord(payload)
  const nested = asRecord(record?.data)
  const raw = Array.isArray(record?.users)
    ? record.users
    : Array.isArray(record?.people)
      ? record.people
      : Array.isArray(record?.results)
        ? record.results
        : Array.isArray(record?.items)
          ? record.items
          : Array.isArray(record?.data)
            ? record.data
            : Array.isArray(nested?.users)
              ? nested.users
              : Array.isArray(payload)
                ? payload
                : []
  return (raw as unknown[])
    .map((item) => normalizePublicUser(item))
    .filter((item): item is PublicUser => Boolean(item))
}

function unwrapDirectory(payload: unknown): UsersDirectoryList {
  const record = asRecord(payload)
  const raw = Array.isArray(record?.users)
    ? record.users
    : Array.isArray(record?.contacts)
      ? record.contacts
      : Array.isArray(payload)
        ? payload
        : []
  const users: DirectoryUser[] = []
  for (const item of raw) {
    const base = normalizePublicUser(item)
    if (!base) continue
    const entry = asRecord(item)
    users.push({
      ...base,
      following: Boolean(entry?.following),
      note:
        (typeof entry?.note === "string" && entry.note) ||
        (typeof entry?.sub === "string" && entry.sub) ||
        base.sub ||
        "",
      hrefChat:
        typeof entry?.hrefChat === "string" ? entry.hrefChat : undefined,
      hrefAudio:
        typeof entry?.hrefAudio === "string" ? entry.hrefAudio : undefined,
      hrefVideo:
        typeof entry?.hrefVideo === "string" ? entry.hrefVideo : undefined,
      user:
        (typeof entry?.user === "string" && entry.user) ||
        base.username ||
        base.id,
    })
  }

  return {
    users,
    total: typeof record?.total === "number" ? record.total : users.length,
    onlineCount:
      typeof record?.onlineCount === "number"
        ? record.onlineCount
        : users.filter((item) => item.presence === "online").length,
  }
}

function normalizePublicUser(item: unknown): PublicUser | null {
  const record = asRecord(item)
  if (!record) return null
  const id =
    (typeof record.id === "string" && record.id) ||
    (typeof record._id === "string" && record._id) ||
    ""
  const username =
    (typeof record.username === "string" && record.username) ||
    (typeof record.user === "string" && record.user) ||
    ""
  const name = typeof record.name === "string" ? record.name : username
  if (!id && !username && !name) return null
  return {
    ...(record as unknown as PublicUser),
    id: id || username,
    name: name || "Someone",
    username: username || id,
  }
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["User", "UserList", "OnlineUsers"],
  endpoints: (build) => ({
    getMyUser: build.query<AuthUser, void>({
      query: () => ({ url: "/api/users/me" }),
      transformResponse: (response: unknown) => unwrapOwner(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch (caught) {
          const status = (caught as { error?: { status?: number } }).error
            ?.status
          if (status === 401) dispatch(clearAuth())
        }
      },
      providesTags: [{ type: "User", id: "ME" }],
    }),
    updateMyUser: build.mutation<AuthUser, UpdateProfileInput>({
      query: (body) => ({
        url: "/api/users/me",
        method: "PATCH",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapOwner(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch {
          /* mutation error stays on the form */
        }
      },
      invalidatesTags: [
        { type: "User", id: "ME" },
        { type: "UserList", id: "SEARCH" },
      ],
    }),
    updateMyPhoto: build.mutation<AuthUser, File>({
      query: (file) => {
        const data = new FormData()
        data.append("photo", file)
        return {
          url: "/api/users/me/photo",
          method: "PATCH",
          data,
        }
      },
      transformResponse: (response: unknown) => unwrapOwner(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch {
          /* mutation error stays on the form */
        }
      },
      invalidatesTags: [
        { type: "User", id: "ME" },
        { type: "UserList", id: "SEARCH" },
      ],
    }),
    deleteMyPhoto: build.mutation<AuthUser, void>({
      query: () => ({
        url: "/api/users/me/photo",
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrapOwner(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch {
          /* mutation error stays on the form */
        }
      },
      invalidatesTags: [
        { type: "User", id: "ME" },
        { type: "UserList", id: "SEARCH" },
      ],
    }),
    updateMyPresence: build.mutation<PresenceUpdate, { presence: Presence }>({
      query: (body) => ({
        url: "/api/users/me/presence",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: [{ type: "OnlineUsers", id: "LIST" }],
    }),
    searchUsers: build.query<PublicUser[], SearchUsersArgs | void>({
      query: (args) => ({
        url: "/api/users/search",
        params: {
          limit: args?.limit ?? 200,
          ...(args?.q ? { q: args.q } : {}),
          ...(args?.presence ? { presence: args.presence } : {}),
        },
      }),
      transformResponse: (response: unknown) => unwrapUserList(response),
      providesTags: [{ type: "UserList", id: "SEARCH" }],
    }),
    listUsers: build.query<UsersDirectoryList, SearchUsersArgs | void>({
      query: (args) => ({
        url: "/api/contacts",
        params: {
          limit: Math.min(Math.max(args?.limit ?? 200, 1), 200),
          ...(args?.q?.trim() ? { q: args.q.trim() } : {}),
          ...(args?.presence ? { presence: args.presence } : {}),
        },
      }),
      transformResponse: (response: unknown) => unwrapDirectory(response),
      providesTags: [{ type: "UserList", id: "DIRECTORY" }],
    }),
    getOnlineUsers: build.query<PublicUser[], void>({
      query: () => ({ url: "/api/users/online" }),
      transformResponse: (response: unknown) => unwrapUserList(response),
      providesTags: [{ type: "OnlineUsers", id: "LIST" }],
    }),
    getUserById: build.query<PublicUser, string>({
      query: (id) => ({ url: `/api/users/${id}` }),
      transformResponse: (response: unknown) => unwrapPublic(response),
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),
    getUserByUsername: build.query<PublicUser, string>({
      query: (username) => ({
        url: `/api/users/by-username/${encodeURIComponent(username)}`,
      }),
      transformResponse: (response: unknown) => unwrapPublic(response),
      providesTags: (result) =>
        result ? [{ type: "User", id: result.id }] : [],
    }),
  }),
})

export const {
  useGetMyUserQuery,
  useUpdateMyUserMutation,
  useUpdateMyPhotoMutation,
  useDeleteMyPhotoMutation,
  useUpdateMyPresenceMutation,
  useSearchUsersQuery,
  useListUsersQuery,
  useGetOnlineUsersQuery,
  useGetUserByIdQuery,
  useGetUserByUsernameQuery,
} = usersApi
