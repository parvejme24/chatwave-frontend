import type { AvatarTone, Presence } from "./chat"

export type Contact = {
  id?: string
  name: string
  user: string
  tone: AvatarTone
  presence: Presence
  note: string
  initials?: string
  photo?: string | null
  hrefChat?: string
  hrefAudio?: string
  hrefVideo?: string
  following?: boolean
}

export type ContactDto = {
  id: string
  name: string
  user: string
  username?: string
  initials: string
  tone: AvatarTone
  photoUrl: string | null
  presence: Presence
  note: string
  sub?: string
  hrefChat?: string
  hrefAudio?: string
  hrefVideo?: string
  following?: boolean
}

export type ContactsList = {
  contacts: ContactDto[]
  total: number
  onlineCount: number
}

export type InviteLink = {
  url: string
}

export type OpenChatResult = {
  conversationId: string
  href: string
}

export function contactInitials(name?: string | null) {
  const parts = (name ?? "").split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function contactFromDto(dto: ContactDto): Contact {
  const name = dto.name || dto.username || dto.user || "Someone"
  return {
    id: dto.id,
    name,
    user: dto.username || dto.user || dto.id,
    tone: dto.tone || "a",
    presence: dto.presence || "offline",
    note: dto.note || dto.sub || "",
    initials: dto.initials || contactInitials(name),
    photo: dto.photoUrl,
    hrefChat: dto.hrefChat,
    hrefAudio: dto.hrefAudio,
    hrefVideo: dto.hrefVideo,
    following: Boolean(dto.following),
  }
}

export function contactFromDirectoryUser(user: {
  id: string
  name: string
  username?: string
  user?: string
  initials?: string
  tone?: AvatarTone
  photoUrl?: string | null
  presence?: Presence
  note?: string
  sub?: string
  following?: boolean
  hrefChat?: string
  hrefAudio?: string
  hrefVideo?: string
}): Contact {
  return contactFromDto({
    id: user.id,
    name: user.name,
    user: user.user || user.username || user.id,
    username: user.username,
    initials: user.initials || contactInitials(user.name),
    tone: user.tone || "a",
    photoUrl: user.photoUrl ?? null,
    presence: user.presence || "offline",
    note: user.note || user.sub || "",
    following: Boolean(user.following),
    hrefChat: user.hrefChat,
    hrefAudio: user.hrefAudio,
    hrefVideo: user.hrefVideo,
  })
}
