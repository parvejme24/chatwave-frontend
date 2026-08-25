import { createApi } from "@reduxjs/toolkit/query/react"

import {
  unwrapAdminUserDetail,
  unwrapAdminUsers,
  type AdminUserDetail,
  type AdminUsersList,
  type AdminUsersQuery,
  type ManagedUser,
} from "../types/admin"
import { axiosBaseQuery } from "./base-query"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function unwrapUser(payload: unknown): ManagedUser {
  const record = asRecord(payload)
  const nested = record?.user ?? payload
  return unwrapAdminUserDetail({ user: nested, history: record?.history }).user
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AdminUsers", "AdminUser"],
  endpoints: (build) => ({
    getAdminUsers: build.query<AdminUsersList, AdminUsersQuery | void>({
      query: (args) => ({
        url: "/api/admin/users",
        params: {
          q: args?.q || undefined,
          status: args?.status && args.status !== "all" ? args.status : undefined,
          limit: args?.limit ?? 50,
          ...(args?.includeDeleted ? { includeDeleted: true } : {}),
        },
      }),
      transformResponse: (response: unknown) => unwrapAdminUsers(response),
      providesTags: (result) =>
        result
          ? [
              { type: "AdminUsers", id: "LIST" },
              ...result.users.map((user) => ({
                type: "AdminUser" as const,
                id: user.id,
              })),
            ]
          : [{ type: "AdminUsers", id: "LIST" }],
    }),
    getAdminUser: build.query<AdminUserDetail, string>({
      query: (id) => ({ url: `/api/admin/users/${id}` }),
      transformResponse: (response: unknown) => unwrapAdminUserDetail(response),
      providesTags: (_result, _error, id) => [{ type: "AdminUser", id }],
    }),
    banAdminUser: build.mutation<ManagedUser, string>({
      query: (id) => ({
        url: `/api/admin/users/${id}/ban`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => unwrapUser(response),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminUsers", id: "LIST" },
        { type: "AdminUser", id },
      ],
    }),
    unbanAdminUser: build.mutation<ManagedUser, string>({
      query: (id) => ({
        url: `/api/admin/users/${id}/unban`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => unwrapUser(response),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminUsers", id: "LIST" },
        { type: "AdminUser", id },
      ],
    }),
    deleteAdminUser: build.mutation<{ ok?: boolean }, string>({
      query: (id) => ({
        url: `/api/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "AdminUsers", id: "LIST" },
        { type: "AdminUser", id },
      ],
    }),
  }),
})

export const {
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useBanAdminUserMutation,
  useUnbanAdminUserMutation,
  useDeleteAdminUserMutation,
} = adminApi
