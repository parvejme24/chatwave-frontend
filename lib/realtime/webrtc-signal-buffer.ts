"use client"

/**
 * Buffers WebRTC signaling that arrives before the call page mounts its PC.
 * Without this, the caller's first offers are lost while the callee navigates
 * to /call — leaving both sides on "Connecting video…".
 */

export type BufferedSignal =
  | { kind: "offer"; callId: string; fromUserId: string; sdp: RTCSessionDescriptionInit }
  | { kind: "answer"; callId: string; fromUserId: string; sdp: RTCSessionDescriptionInit }
  | { kind: "ice"; callId: string; fromUserId: string; candidate: RTCIceCandidateInit }

const buffers = new Map<string, BufferedSignal[]>()
const listeners = new Map<string, Set<(signal: BufferedSignal) => void>>()

function key(callId: string) {
  return callId.trim()
}

export function pushWebRtcSignal(signal: BufferedSignal) {
  const id = key(signal.callId)
  if (!id) return
  const subs = listeners.get(id)
  if (subs && subs.size > 0) {
    for (const sub of subs) sub(signal)
    return
  }
  const list = buffers.get(id) ?? []
  list.push(signal)
  // Keep the buffer small — only the latest offer/answer matter.
  if (list.length > 40) list.splice(0, list.length - 40)
  buffers.set(id, list)
}

export function subscribeWebRtcSignals(
  callId: string,
  onSignal: (signal: BufferedSignal) => void
) {
  const id = key(callId)
  if (!id) return () => undefined

  let set = listeners.get(id)
  if (!set) {
    set = new Set()
    listeners.set(id, set)
  }
  set.add(onSignal)

  const queued = buffers.get(id) ?? []
  buffers.delete(id)
  for (const signal of queued) onSignal(signal)

  return () => {
    set?.delete(onSignal)
    if (set && set.size === 0) listeners.delete(id)
  }
}

export function clearWebRtcSignals(callId: string) {
  const id = key(callId)
  buffers.delete(id)
}
