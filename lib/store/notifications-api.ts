import { createApi } from "@reduxjs/toolkit/query/react"

import {
  unwrapNotificationsPage,
  unwrapUnreadCount,
  type NotificationsPage,
  type NotificationsQuery,
} from "../types/notification"
import { axiosBaseQuery } from "./base-query"

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Notifications", "NotificationBadge"],
  endpoints: (build) => ({
    getNotifications: build.query<NotificationsPage, NotificationsQuery | void>({
      query: (args) => ({
        url: "/api/notifications",
        params: {
          limit: args?.limit ?? 30,
          ...(args?.cursor ? { cursor: args.cursor } : {}),
          ...(args?.unreadOnly ? { unreadOnly: true } : {}),
        },
      }),
      transformResponse: (response: unknown) => unwrapNotificationsPage(response),
      providesTags: ["Notifications"],
    }),
    getUnreadCount: build.query<{ unreadCount: number }, void>({
      query: () => ({ url: "/api/notifications/unread-count" }),
      transformResponse: (response: unknown) => ({
        unreadCount: unwrapUnreadCount(response),
      }),
      providesTags: ["NotificationBadge"],
    }),
    markNotificationsRead: build.mutation<
      { unreadCount: number },
      { ids?: string[] } | void
    >({
      query: (body) => ({
        url: "/api/notifications/read",
        method: "POST",
        data: body?.ids ? { ids: body.ids } : {},
      }),
      transformResponse: (response: unknown) => ({
        unreadCount: unwrapUnreadCount(response),
      }),
      invalidatesTags: ["Notifications", "NotificationBadge"],
    }),
    markNotificationRead: build.mutation<{ ok?: boolean }, string>({
      query: (id) => ({
        url: `/api/notifications/${id}/read`,
        method: "POST",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            notificationsApi.util.updateQueryData(
              "getUnreadCount",
              undefined,
              (draft) => {
                draft.unreadCount = Math.max(0, draft.unreadCount - 1)
              }
            )
          )
          dispatch(
            notificationsApi.util.updateQueryData(
              "getNotifications",
              undefined,
              (draft) => {
                const item = draft.notifications.find((row) => row.id === id)
                if (item && !item.readAt) {
                  item.readAt = new Date().toISOString()
                  draft.unreadCount = Math.max(0, draft.unreadCount - 1)
                }
              }
            )
          )
        } catch {
          /* mutation error stays with the caller */
        }
      },
      invalidatesTags: ["NotificationBadge"],
    }),
  }),
})

export { notificationFromDto } from "../types/notification"

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationsReadMutation,
  useMarkNotificationReadMutation,
} = notificationsApi
