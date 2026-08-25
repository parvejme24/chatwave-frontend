import { createApi } from "@reduxjs/toolkit/query/react"

import type { BlockDto, BlocksList } from "../types/block"
import { axiosBaseQuery } from "./base-query"
import { contactsApi } from "./contacts-api"
import { conversationsApi } from "./conversations-api"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function unwrapBlock(payload: unknown): BlockDto {
  const record = asRecord(payload)
  const nested = record?.block
  if (nested && typeof nested === "object") return nested as BlockDto
  return payload as BlockDto
}

function unwrapList(payload: unknown): BlocksList {
  const record = asRecord(payload)
  const blocks = Array.isArray(record?.blocks)
    ? (record.blocks as BlockDto[])
    : Array.isArray(payload)
      ? (payload as BlockDto[])
      : []
  return {
    blocks,
    total: typeof record?.total === "number" ? record.total : blocks.length,
  }
}

export const blocksApi = createApi({
  reducerPath: "blocksApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Blocks"],
  endpoints: (build) => ({
    getBlocks: build.query<BlocksList, void>({
      query: () => ({ url: "/api/blocks" }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: [{ type: "Blocks", id: "LIST" }],
    }),
    blockUser: build.mutation<BlockDto, { userId?: string; username?: string }>({
      query: (body) => ({
        url: "/api/blocks",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapBlock(response),
      invalidatesTags: [{ type: "Blocks", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Conversation", id: "LIST" },
            ])
          )
          dispatch(
            contactsApi.util.invalidateTags([
              { type: "Contacts", id: "LIST" },
              { type: "OnlineContacts", id: "LIST" },
              { type: "ContactSuggestions", id: "LIST" },
            ])
          )
        } catch {
          /* mutation error stays with the caller */
        }
      },
    }),
    unblockUser: build.mutation<{ ok: boolean }, string>({
      query: (userId) => ({
        url: `/api/blocks/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Blocks", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Conversation", id: "LIST" },
            ])
          )
          dispatch(
            contactsApi.util.invalidateTags([
              { type: "Contacts", id: "LIST" },
              { type: "OnlineContacts", id: "LIST" },
              { type: "ContactSuggestions", id: "LIST" },
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
  useGetBlocksQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
} = blocksApi
