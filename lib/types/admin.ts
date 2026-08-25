import type { AvatarTone, Presence } from "./chat"

export type ManagedUserStatus = "active" | "banned"

export type UserHistoryKind =
  | "signup"
  | "login"
  | "message"
  | "media"
  | "call"
  | "group"
  | "ban"
  | "unban"
  | "delete"

export type UserHistoryEvent = {
  id: string
  at: string
  day: string
  kind: UserHistoryKind
  title: string
  detail?: string
}

export type ManagedUser = {
  id: string
  name: string
  user: string
  email: string
  tone: AvatarTone
  presence: Presence
  note: string
  joined: string
  lastSeen: string
  status: ManagedUserStatus
  history: UserHistoryEvent[]
  initials?: string
  photoUrl?: string | null
  eventCount?: number
  isOwner?: boolean
}

export type AdminUsersList = {
  total: number
  bannedCount: number
  users: ManagedUser[]
}

export type AdminUserDetail = {
  user: ManagedUser
  history: UserHistoryEvent[]
}

export type AdminUsersQuery = {
  q?: string
  status?: "active" | "banned" | "all"
  limit?: number
  includeDeleted?: boolean
}

const HISTORY_KINDS = new Set<UserHistoryKind>([
  "signup",
  "login",
  "message",
  "media",
  "call",
  "group",
  "ban",
  "unban",
  "delete",
])

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function asHistoryKind(value: unknown): UserHistoryKind {
  return typeof value === "string" && HISTORY_KINDS.has(value as UserHistoryKind)
    ? (value as UserHistoryKind)
    : "login"
}

export function historyEventFromDto(value: unknown): UserHistoryEvent {
  const record = asRecord(value) ?? {}
  return {
    id:
      typeof record.id === "string"
        ? record.id
        : typeof record._id === "string"
          ? record._id
          : `${asHistoryKind(record.kind)}-${record.at ?? ""}-${record.title ?? ""}`,
    at: typeof record.at === "string" ? record.at : "",
    day: typeof record.day === "string" ? record.day : "",
    kind: asHistoryKind(record.kind),
    title: typeof record.title === "string" ? record.title : "Activity",
    detail: typeof record.detail === "string" ? record.detail : undefined,
  }
}

export function managedUserFromDto(
  value: unknown,
  history: UserHistoryEvent[] = []
): ManagedUser {
  const record = asRecord(value) ?? {}
  const username =
    (typeof record.user === "string" && record.user) ||
    (typeof record.username === "string" && record.username) ||
    ""
  const status = record.status === "banned" ? "banned" : "active"
  const events = Array.isArray(record.history)
    ? record.history.map(historyEventFromDto)
    : history
  return {
    id:
      typeof record.id === "string"
        ? record.id
        : typeof record._id === "string"
          ? record._id
          : username,
    name: typeof record.name === "string" ? record.name : username || "User",
    user: username,
    email: typeof record.email === "string" ? record.email : "",
    tone: (typeof record.tone === "string" ? record.tone : "a") as AvatarTone,
    presence: (typeof record.presence === "string"
      ? record.presence
      : "offline") as Presence,
    note: typeof record.note === "string" ? record.note : "",
    joined: typeof record.joined === "string" ? record.joined : "",
    lastSeen: typeof record.lastSeen === "string" ? record.lastSeen : "",
    status,
    history: events,
    initials: typeof record.initials === "string" ? record.initials : undefined,
    photoUrl:
      typeof record.photoUrl === "string" || record.photoUrl === null
        ? (record.photoUrl as string | null)
        : undefined,
    eventCount:
      typeof record.eventCount === "number" ? record.eventCount : events.length,
    isOwner: Boolean(record.isOwner),
  }
}

export function unwrapAdminUsers(payload: unknown): AdminUsersList {
  const record = asRecord(payload)
  const raw = Array.isArray(record?.users)
    ? record.users
    : Array.isArray(payload)
      ? payload
      : []
  const users = raw.map((item) => managedUserFromDto(item))
  return {
    total: typeof record?.total === "number" ? record.total : users.length,
    bannedCount:
      typeof record?.bannedCount === "number"
        ? record.bannedCount
        : users.filter((user) => user.status === "banned").length,
    users,
  }
}

export function unwrapAdminUserDetail(payload: unknown): AdminUserDetail {
  const record = asRecord(payload)
  const nestedUser = record?.user ?? payload
  const history = Array.isArray(record?.history)
    ? record.history.map(historyEventFromDto)
    : []
  return {
    user: managedUserFromDto(nestedUser, history),
    history,
  }
}
