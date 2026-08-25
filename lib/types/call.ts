import type { AvatarTone, Presence } from "./chat"
import { entityId } from "./chat"

export type CallType = "audio" | "video"
export type CallLiveStatus = "ringing" | "active" | "ended" | "missed" | "declined"
export type CallStatus = CallLiveStatus
export type CallDirection = "in" | "out" | "missed"
export type CallFilter = "all" | "missed" | "voice" | "video"
export type CallSectionId = "today" | "yesterday" | "older" | (string & {})
export type IcePath = "p2p" | "turn" | "unknown"

export type CallAction = {
  type: CallType
  href: string
  label: string
}

export type CallRecord = {
  id: string
  section: CallSectionId
  name: string
  initials: string
  tone: AvatarTone
  photoUrl?: string | null
  presence?: Presence
  group?: boolean
  type: CallType
  status: CallStatus
  direction: CallDirection
  subtitle: string
  duration?: string
  endTag?: string | null
  actions?: CallAction[]
  conversationId?: string
  href?: string
}

export type IceServer = {
  urls: string | string[]
  username?: string
  credential?: string
}

export type CallPeer = {
  id: string
  name: string
  username?: string
  initials: string
  tone: AvatarTone
  photoUrl: string | null
  presence?: Presence
  group?: boolean
}

export type LiveCall = {
  id: string
  conversationId: string
  type: CallType
  status: CallLiveStatus
  initiatedBy: string
  peer: CallPeer
  href: string
  startedAt: string
  answeredAt: string | null
  durationSec: number
  iceServers?: IceServer[]
}

export type CallQuality = {
  p2p: number
  turn: number
  unknown: number
}

export type CallsHistory = {
  calls: CallRecord[]
  sections: CallSection[]
}

export type CallSection = {
  id: CallSectionId
  title: string
  meta: string
  showNewCall?: boolean
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

export function isOpenCallStatus(status?: string | null) {
  return status !== "ended" && status !== "missed" && status !== "declined"
}

export function asCallLiveStatus(
  value: unknown,
  fallback: CallLiveStatus = "ringing"
): CallLiveStatus {
  if (
    value === "active" ||
    value === "ended" ||
    value === "missed" ||
    value === "declined" ||
    value === "ringing"
  ) {
    return value
  }
  if (typeof value === "string" && value.trim()) return "ringing"
  return fallback
}

export function liveCallFromPayload(payload: unknown): LiveCall | null {
  const record = asRecord(payload)
  if (!record) return null
  const nested = asRecord(record.call)
  const call = nested ?? record
  const id = entityId(call.id) || entityId(call._id) || entityId(call)
  if (!id) return null
  const peerRecord = asRecord(call.peer)
  const name =
    (typeof peerRecord?.name === "string" && peerRecord.name) ||
    (typeof call.name === "string" && call.name) ||
    "Incoming call"
  const type = call.type === "audio" ? "audio" : "video"
  return {
    id,
    conversationId: entityId(call.conversationId),
    type,
    status: asCallLiveStatus(call.status),
    initiatedBy: entityId(call.initiatedBy) || entityId(call.createdBy),
    peer: {
      id: entityId(peerRecord) || entityId(peerRecord?.id),
      name,
      username:
        typeof peerRecord?.username === "string" ? peerRecord.username : undefined,
      initials:
        (typeof peerRecord?.initials === "string" && peerRecord.initials) ||
        (typeof call.initials === "string" && call.initials) ||
        "?",
      tone: ((typeof peerRecord?.tone === "string" && peerRecord.tone) ||
        (typeof call.tone === "string" && call.tone) ||
        "a") as LiveCall["peer"]["tone"],
      photoUrl:
        typeof peerRecord?.photoUrl === "string" ? peerRecord.photoUrl : null,
      presence:
        typeof peerRecord?.presence === "string"
          ? (peerRecord.presence as LiveCall["peer"]["presence"])
          : undefined,
      group: Boolean(peerRecord?.group ?? call.group),
    },
    href: typeof call.href === "string" ? call.href : "",
    startedAt: typeof call.startedAt === "string" ? call.startedAt : "",
    answeredAt: typeof call.answeredAt === "string" ? call.answeredAt : null,
    durationSec: typeof call.durationSec === "number" ? call.durationSec : 0,
  }
}
