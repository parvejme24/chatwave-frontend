import { ACCESS_TOKEN_KEY } from "./api/client"
import { API_PROXY_PREFIX } from "./api"
import type { CallType, LiveCall } from "./types/call"

export const LAST_CALL_KEY = "convw_last_call"
export const LIVE_CALL_ID_KEY = "cw_live_call_id"

export function readLiveCallId() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(LIVE_CALL_ID_KEY)?.trim() || ""
}

export function persistLiveCallId(id: string | null) {
  if (typeof window === "undefined") return
  if (id) window.localStorage.setItem(LIVE_CALL_ID_KEY, id)
  else window.localStorage.removeItem(LIVE_CALL_ID_KEY)
}

const remotelyClosedCalls = new Set<string>()

/** Mark a call closed by socket so the call page can skip a duplicate toast. */
export function markCallRemotelyClosed(callId: string) {
  if (!callId) return
  remotelyClosedCalls.add(callId)
  window.setTimeout(() => remotelyClosedCalls.delete(callId), 8000)
}

export function consumeCallRemotelyClosed(callId: string) {
  if (!callId || !remotelyClosedCalls.has(callId)) return false
  remotelyClosedCalls.delete(callId)
  return true
}

export function endCallKeepalive(id: string) {
  if (typeof window === "undefined" || !id) return
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  // Do not send ice: "unknown" — EndCallDto only allows p2p | turn.
  void fetch(`${API_PROXY_PREFIX}/api/calls/${id}/end`, {
    method: "POST",
    body: JSON.stringify({}),
    headers,
    keepalive: true,
    credentials: "include",
  })
  persistLiveCallId(null)
}

export function formatCallTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function parseCallType(value: string | null) {
  return value === "audio" ? "audio" : "video"
}

export function conversationIdFromHref(href?: string | null) {
  if (!href) return ""
  const match = href.match(/\/chats\/([^/?#]+)/)
  return match?.[1] ?? ""
}

export function callPageHref(opts: {
  type: CallType
  callId?: string
  conversationId?: string
  peer?: string
  userId?: string
}) {
  const params = new URLSearchParams()
  params.set("type", opts.type)
  if (opts.callId) params.set("callId", opts.callId)
  if (opts.conversationId) params.set("conversationId", opts.conversationId)
  if (opts.peer) params.set("peer", opts.peer)
  if (opts.userId) params.set("userId", opts.userId)
  return `/call?${params.toString()}`
}

export function hrefForLiveCall(call: LiveCall) {
  return callPageHref({
    type: call.type || "video",
    callId: call.id,
    conversationId: call.conversationId,
    peer: call.peer?.name,
    userId: call.peer?.id,
  })
}
