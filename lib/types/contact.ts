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

export function contactInitials(name: string) {
  const parts = name.split(" ").filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function contactFromDto(dto: ContactDto): Contact {
  return {
    id: dto.id,
    name: dto.name,
    user: dto.username || dto.user,
    tone: dto.tone,
    presence: dto.presence,
    note: dto.note,
    initials: dto.initials,
    photo: dto.photoUrl,
    hrefChat: dto.hrefChat,
    hrefAudio: dto.hrefAudio,
    hrefVideo: dto.hrefVideo,
  }
}
