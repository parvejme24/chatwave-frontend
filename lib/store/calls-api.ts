import { createApi } from "@reduxjs/toolkit/query/react"

import { persistLiveCallId } from "../call"
import { entityId } from "../types/chat"
import type {
  CallFilter,
  CallQuality,
  CallsHistory,
  CallRecord,
  CallSection,
  CallStatus,
  IcePath,
  IceServer,
  LiveCall,
} from "../types/call"
import { asCallLiveStatus, liveCallFromPayload } from "../types/call"
import { axiosBaseQuery } from "./base-query"
import { conversationsApi } from "./conversations-api"
import { setIncomingCall } from "./realtime-slice"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function unwrapIceServers(payload: unknown): IceServer[] | undefined {
  const record = asRecord(payload)
  if (Array.isArray(record?.iceServers)) return record.iceServers as IceServer[]
  const nested = asRecord(record?.call)
  if (Array.isArray(nested?.iceServers)) return nested.iceServers as IceServer[]
  return undefined
}

function unwrapCall(payload: unknown): LiveCall {
  const mapped = liveCallFromPayload(payload)
  const iceServers = unwrapIceServers(payload)
  if (mapped) return iceServers ? { ...mapped, iceServers } : mapped
  const record = asRecord(payload)
  const nested = record?.call
  const call = (
    nested && typeof nested === "object" ? nested : payload
  ) as LiveCall
  return iceServers ? { ...call, iceServers } : call
}

function unwrapHistory(payload: unknown): CallsHistory {
  const record = asRecord(payload)
  const raw = Array.isArray(record?.calls)
    ? record.calls
    : Array.isArray(payload)
      ? payload
      : []
  const calls = raw.map((item) => {
    const call = asRecord(item) ?? {}
    const id = entityId(call.id) || entityId(call._id) || entityId(call)
    return {
      ...(item as CallRecord),
      id,
        status: asCallLiveStatus(call.status, "ended"),
      direction:
        call.direction === "in" || call.direction === "missed"
          ? call.direction
          : "out",
      initials:
        (typeof call.initials === "string" && call.initials) || "?",
      tone: (typeof call.tone === "string" && call.tone) || "a",
      subtitle: (typeof call.subtitle === "string" && call.subtitle) || "",
      section: (typeof call.section === "string" && call.section) || "today",
    } as CallRecord
  })
  const sections = Array.isArray(record?.sections)
    ? (record.sections as CallSection[])
    : []
  return { calls, sections }
}

function unwrapQuality(payload: unknown): CallQuality {
  const record = asRecord(payload)
  return {
    p2p: typeof record?.p2p === "number" ? record.p2p : 0,
    turn: typeof record?.turn === "number" ? record.turn : 0,
    unknown: typeof record?.unknown === "number" ? record.unknown : 0,
  }
}

function invalidateConversationList(dispatch: (action: unknown) => void) {
  dispatch(
    conversationsApi.util.invalidateTags([{ type: "Conversation", id: "LIST" }])
  )
}

export function closeCallInCache(
  dispatch: (action: unknown) => unknown,
  getState: () => unknown,
  callId: string,
  status: CallStatus = "ended"
) {
  const queries = (
    getState() as {
      callsApi?: {
        queries?: Record<
          string,
          { endpointName?: string; originalArgs?: CallsListArgs | void }
        >
      }
    }
  ).callsApi?.queries
  if (!queries) return
  const seen = new Set<string>()
  for (const entry of Object.values(queries)) {
    if (!entry || entry.endpointName !== "getCalls") continue
    const key = JSON.stringify(entry.originalArgs ?? null)
    if (seen.has(key)) continue
    seen.add(key)
    dispatch(
      callsApi.util.updateQueryData("getCalls", entry.originalArgs, (draft) => {
        const row = draft.calls.find((item) => item.id === callId)
        if (row) row.status = status
      })
    )
  }
}

export type CallsListArgs = {
  filter?: CallFilter
  limit?: number
}

export const callsApi = createApi({
  reducerPath: "callsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Calls", "Call", "CallQuality"],
  endpoints: (build) => ({
    getCalls: build.query<CallsHistory, CallsListArgs | void>({
      query: (args) => ({
        url: "/api/calls",
        params: {
          filter: args?.filter ?? "all",
          limit: args?.limit ?? 50,
        },
      }),
      transformResponse: (response: unknown) => unwrapHistory(response),
      providesTags: (result) =>
        result
          ? [
              { type: "Calls", id: "LIST" },
              ...result.calls.map((call) => ({
                type: "Call" as const,
                id: call.id,
              })),
            ]
          : [{ type: "Calls", id: "LIST" }],
    }),
    getCallQuality: build.query<CallQuality, void>({
      query: () => ({ url: "/api/calls/quality" }),
      transformResponse: (response: unknown) => unwrapQuality(response),
      providesTags: [{ type: "CallQuality", id: "SUMMARY" }],
    }),
    getCall: build.query<LiveCall, string>({
      query: (id) => ({ url: `/api/calls/${id}` }),
      transformResponse: (response: unknown) => unwrapCall(response),
      providesTags: (_result, _error, id) => [{ type: "Call", id }],
    }),
    startCall: build.mutation<
      LiveCall,
      { conversationId: string; type: "audio" | "video" }
    >({
      query: (body) => ({
        url: "/api/calls",
        method: "POST",
        data: body,
      }),
      transformResponse: (response: unknown) => unwrapCall(response),
      invalidatesTags: [{ type: "Calls", id: "LIST" }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled
          const incoming = (
            getState() as { realtime?: { incomingCall?: LiveCall | null } }
          ).realtime?.incomingCall
          if (
            incoming &&
            (incoming.id === data.id || incoming.initiatedBy === data.initiatedBy)
          ) {
            dispatch(setIncomingCall(null))
          }
          invalidateConversationList(dispatch)
        } catch {
          /* mutation error stays with the caller */
        }
      },
    }),
    acceptCall: build.mutation<LiveCall, string>({
      query: (id) => ({
        url: `/api/calls/${id}/accept`,
        method: "POST",
      }),
      transformResponse: (response: unknown) => unwrapCall(response),
      invalidatesTags: (_result, _error, id) => [
        { type: "Calls", id: "LIST" },
        { type: "Call", id },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
          const incoming = (
            getState() as { realtime?: { incomingCall?: LiveCall | null } }
          ).realtime?.incomingCall
          if (!incoming || incoming.id === id) dispatch(setIncomingCall(null))
        } catch {
          /* mutation error stays with the caller */
        }
      },
    }),
    declineCall: build.mutation<{ ok?: boolean }, string>({
      query: (id) => ({
        url: `/api/calls/${id}/decline`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Calls", id: "LIST" },
        { type: "Call", id },
        { type: "CallQuality", id: "SUMMARY" },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
          closeCallInCache(dispatch, getState, id, "declined")
          const incoming = (
            getState() as { realtime?: { incomingCall?: LiveCall | null } }
          ).realtime?.incomingCall
          if (!incoming || incoming.id === id) dispatch(setIncomingCall(null))
          persistLiveCallId(null)
        } catch {
          /* mutation error stays with the caller */
        }
      },
    }),
    endCall: build.mutation<LiveCall, { id: string; ice?: IcePath }>({
      query: ({ id, ice }) => ({
        url: `/api/calls/${id}/end`,
        method: "POST",
        data: ice ? { ice } : undefined,
      }),
      transformResponse: (response: unknown) => unwrapCall(response),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Calls", id: "LIST" },
        { type: "Call", id: arg.id },
        { type: "CallQuality", id: "SUMMARY" },
      ],
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
          closeCallInCache(dispatch, getState, arg.id, "ended")
          const incoming = (
            getState() as { realtime?: { incomingCall?: LiveCall | null } }
          ).realtime?.incomingCall
          if (!incoming || incoming.id === arg.id) {
            dispatch(setIncomingCall(null))
          }
          persistLiveCallId(null)
          invalidateConversationList(dispatch)
        } catch {
          /* mutation error stays with the caller */
        }
      },
    }),
  }),
})

export const {
  useGetCallsQuery,
  useLazyGetCallsQuery,
  useGetCallQualityQuery,
  useGetCallQuery,
  useStartCallMutation,
  useAcceptCallMutation,
  useDeclineCallMutation,
  useEndCallMutation,
} = callsApi
