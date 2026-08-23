import type { AvatarTone, Presence } from "./chat"

export type ManagedUserStatus = "active" | "banned"

export type UserHistoryKind =
  | "signup"
  | "login"
  | "message"
  | "media"
  | "call"
  | "group"

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
}
