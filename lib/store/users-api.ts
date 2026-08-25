import { createApi } from "@reduxjs/toolkit/query/react"

import type { AuthUser } from "../types/auth"
import type { Presence } from "../types/chat"
import type {
  PresenceUpdate,
  PublicUser,
  SearchUsersArgs,
  UpdateProfileInput,
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
  if (Array.isArray(record?.users)) return record.users as PublicUser[]
  if (Array.isArray(payload)) return payload as PublicUser[]
  return []
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
          limit: args?.limit ?? 50,
          ...(args?.q ? { q: args.q } : {}),
          ...(args?.presence ? { presence: args.presence } : {}),
        },
      }),
      transformResponse: (response: unknown) => unwrapUserList(response),
      providesTags: [{ type: "UserList", id: "SEARCH" }],
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
  useGetOnlineUsersQuery,
  useGetUserByIdQuery,
  useGetUserByUsernameQuery,
} = usersApi
