export type AvatarTone = "a" | "b" | "c" | "d" | "e" | "f"
export type Presence = "online" | "away" | "offline"
export type MessageStatus = "sending" | "sent" | "delivered" | "seen"
export type PreviewIcon = "mic" | "video" | "image"
export type FilterChip = "all" | "unread" | "groups" | "calls" | "archived"
export type RecordKind = "voice" | "video"

export type Reaction = {
  emoji: string
  count: number
  mine: boolean
}

export type DayItem = {
  id: string
  kind: "day"
  label: string
}

export type CallItem = {
  id: string
  kind: "call"
  missed: boolean
  label: string
  meta: string
}

export type TypingItem = {
  id: string
  kind: "typing"
}

export type ChatMessage = {
  id: string
  kind: "message"
  dir: "in" | "out"
  type: "text" | "image" | "file" | "voice" | "video_note"
  time: string
  status?: MessageStatus
  text?: string
  caption?: string
  fileName?: string
  fileSize?: string
  duration?: number
  seed?: number
  senderName?: string
  senderTone?: AvatarTone
  senderInitials?: string
  reply?: { who: string; text: string }
  reactions?: Reaction[]
}

export type ThreadItem = DayItem | CallItem | TypingItem | ChatMessage

export type Conversation = {
  id: string
  name: string
  initials: string
  tone: AvatarTone
  presence: Presence
  status: string
  live: boolean
  sub: string
  time: string
  unread: number
  pinned?: boolean
  muted?: boolean
  group?: boolean
  preview: string
  previewIcon?: PreviewIcon
  messages: ThreadItem[]
}

export type Me = {
  name: string
  initials: string
  tone: AvatarTone
}

export const AVATAR_TONES: Record<AvatarTone, string> = {
  a: "bg-[#DDE2FF] text-[#2B3FFF] dark:bg-[#1E2450] dark:text-[#8E9BFF]",
  b: "bg-[#FFE0EB] text-[#D4155A] dark:bg-[#3D1729] dark:text-[#FF7DA5]",
  c: "bg-[#D7F2E9] text-[#007A5C] dark:bg-[#0F3730] dark:text-[#35D6AC]",
  d: "bg-[#FFEBCC] text-[#A96C00] dark:bg-[#3B2C0E] dark:text-[#E8B24C]",
  e: "bg-[#E4DDFF] text-[#5B36D9] dark:bg-[#291F4D] dark:text-[#A48CFF]",
  f: "bg-[#D5EDFB] text-[#0470A8] dark:bg-[#0D2E42] dark:text-[#4FBBEF]",
}

export const SENDER_TONES: Record<AvatarTone, string> = {
  a: "text-[#2B3FFF] dark:text-[#8E9BFF]",
  b: "text-[#D4155A] dark:text-[#FF7DA5]",
  c: "text-[#007A5C] dark:text-[#35D6AC]",
  d: "text-[#A96C00] dark:text-[#E8B24C]",
  e: "text-[#5B36D9] dark:text-[#A48CFF]",
  f: "text-[#0470A8] dark:text-[#4FBBEF]",
}
