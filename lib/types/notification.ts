import type { AvatarTone } from "./chat"

export type NotificationType =
  | "message"
  | "reaction"
  | "group"
  | "call"
  | "missed_call"
  | "system"

export type NotificationActor = {
  id: string
  name: string
  username?: string
  initials: string
  tone: AvatarTone
  photoUrl: string | null
}

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  href: string
  readAt: string | null
  createdAt: string
  actor: NotificationActor | null
  conversationId?: string | null
  messageId?: string | null
  callId?: string | null
}

export type NotificationsPage = {
  notifications: AppNotification[]
  unreadCount: number
  nextCursor: string | null
}

export type NotificationsQuery = {
  cursor?: string
  limit?: number
  unreadOnly?: boolean
}

const TYPES = new Set<NotificationType>([
  "message",
  "reaction",
  "group",
  "call",
  "missed_call",
  "system",
])

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function actorFromDto(value: unknown): NotificationActor | null {
  const record = asRecord(value)
  if (!record || typeof record.id !== "string") return null
  return {
    id: record.id,
    name: typeof record.name === "string" ? record.name : "Someone",
    username: typeof record.username === "string" ? record.username : undefined,
    initials: typeof record.initials === "string" ? record.initials : "?",
    tone: (typeof record.tone === "string" ? record.tone : "a") as AvatarTone,
    photoUrl: typeof record.photoUrl === "string" ? record.photoUrl : null,
  }
}

export function notificationFromDto(value: unknown): AppNotification {
  const record = asRecord(value) ?? {}
  const nested = asRecord(record.notification)
  const source = nested ?? record
  const type =
    typeof source.type === "string" && TYPES.has(source.type as NotificationType)
      ? (source.type as NotificationType)
      : "system"
  return {
    id: typeof source.id === "string" ? source.id : "",
    type,
    title: typeof source.title === "string" ? source.title : "ChatWave",
    body: typeof source.body === "string" ? source.body : "",
    href: typeof source.href === "string" ? source.href : "",
    readAt: typeof source.readAt === "string" ? source.readAt : null,
    createdAt: typeof source.createdAt === "string" ? source.createdAt : "",
    actor: actorFromDto(source.actor),
    conversationId:
      typeof source.conversationId === "string" ? source.conversationId : null,
    messageId: typeof source.messageId === "string" ? source.messageId : null,
    callId: typeof source.callId === "string" ? source.callId : null,
  }
}

export function unwrapNotificationsPage(payload: unknown): NotificationsPage {
  const record = asRecord(payload)
  const raw = Array.isArray(record?.notifications)
    ? record.notifications
    : Array.isArray(payload)
      ? payload
      : []
  const notifications = raw.map(notificationFromDto)
  return {
    notifications,
    unreadCount:
      typeof record?.unreadCount === "number" ? record.unreadCount : 0,
    nextCursor:
      typeof record?.nextCursor === "string" ? record.nextCursor : null,
  }
}

export function unwrapUnreadCount(payload: unknown): number {
  const record = asRecord(payload)
  if (typeof record?.unreadCount === "number") return record.unreadCount
  if (typeof record?.count === "number") return record.count
  return 0
}
