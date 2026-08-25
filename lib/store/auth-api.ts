import { createApi } from "@reduxjs/toolkit/query/react"

import type { AuthPayload, AuthUser } from "../types/auth"
import { disconnectSocket } from "../realtime/socket"
import { adminApi } from "./admin-api"
import { axiosBaseQuery } from "./base-query"
import { clearAuth, setCredentials, setUser } from "./auth-slice"
import { blocksApi } from "./blocks-api"
import { callsApi } from "./calls-api"
import { contactsApi } from "./contacts-api"
import { conversationsApi } from "./conversations-api"
import { messagesApi } from "./messages-api"
import { notificationsApi } from "./notifications-api"
import { resetRealtime } from "./realtime-slice"
import { settingsApi } from "./settings-api"
import { usersApi } from "./users-api"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function unwrapUser(payload: unknown): AuthUser {
  const record = asRecord(payload)
  const nested = record?.user
  if (nested && typeof nested === "object") return nested as AuthUser
  return payload as AuthUser
}

function unwrapAuth(payload: unknown): AuthPayload {
  const record = asRecord(payload)
  const user = unwrapUser(payload)
  const token =
    (typeof record?.accessToken === "string" && record.accessToken) ||
    (typeof record?.token === "string" && record.token) ||
    undefined
  return { user, accessToken: token }
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Auth"],
  endpoints: (build) => ({
    register: build.mutation<AuthUser, { name: string; email: string; password: string }>(
      {
        query: (body) => ({
          url: "/api/auth/register",
          method: "POST",
          data: body,
        }),
        transformResponse: (response: unknown) => unwrapUser(response),
      }
    ),
    login: build.mutation<
      AuthPayload,
      { email: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapAuth(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch {
          /* login errors stay in the mutation result */
        }
      },
      invalidatesTags: ["Auth"],
    }),
    logout: build.mutation<{ ok?: boolean }, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch {
          /* still clear local session */
        } finally {
          dispatch(clearAuth())
          dispatch(resetRealtime())
          disconnectSocket()
          dispatch(authApi.util.resetApiState())
          dispatch(usersApi.util.resetApiState())
          dispatch(contactsApi.util.resetApiState())
          dispatch(blocksApi.util.resetApiState())
          dispatch(conversationsApi.util.resetApiState())
          dispatch(messagesApi.util.resetApiState())
          dispatch(callsApi.util.resetApiState())
          dispatch(settingsApi.util.resetApiState())
          dispatch(adminApi.util.resetApiState())
          dispatch(notificationsApi.util.resetApiState())
        }
      },
    }),
    forgotPassword: build.mutation<{ ok: boolean }, { email: string }>({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        data: body,
      }),
    }),
    resetPassword: build.mutation<
      { ok: boolean },
      { email: string; otp: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        data: body,
      }),
    }),
    revokeSession: build.mutation<{ ok?: boolean }, string>({
      query: (id) => ({
        url: `/api/auth/sessions/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            settingsApi.util.updateQueryData(
              "getSettings",
              undefined,
              (draft) => {
                if (!draft.sessions) return
                draft.sessions = draft.sessions.filter(
                  (session) => session.id !== id
                )
              }
            )
          )
        } catch {
          /* mutation error stays on the card */
        }
      },
    }),
    getMe: build.query<AuthUser, void>({
      query: () => ({ url: "/api/auth/me" }),
      transformResponse: (response: unknown) => unwrapUser(response),
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
      providesTags: ["Auth"],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRevokeSessionMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi
