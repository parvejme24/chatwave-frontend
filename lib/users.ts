import type { Contact } from "./types/contact"
import type { Presence } from "./types/chat"
import type { PublicUser } from "./types/user"

const USER_ID = /^[a-f0-9]{24}$/i

export function isMongoUserId(value?: string | null) {
  return Boolean(value && USER_ID.test(value))
}

export function formatLastSeen(iso: string | null | undefined) {
  if (!iso) return "Offline"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "Offline"

  const diff = Date.now() - date.getTime()
  if (diff < 60_000) return "Last seen just now"
  if (diff < 3_600_000) {
    return `Last seen ${Math.max(1, Math.floor(diff / 60_000))}m ago`
  }

  const sameDay = date.toDateString() === new Date().toDateString()
  if (sameDay) {
    return `Last seen at ${date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`
  }

  return `Last seen ${date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })}`
}

export function presenceNote(user: {
  presence: Presence
  lastSeenAt: string | null
  sub?: string
}) {
  if (user.presence === "online") return user.sub || "Online"
  if (user.presence === "away") return user.sub || "Away"
  if (user.lastSeenAt) return formatLastSeen(user.lastSeenAt)
  return user.sub || "Offline"
}

export function contactFromPublicUser(user: PublicUser): Contact {
  return {
    id: user.id,
    name: user.name,
    user: user.username,
    tone: user.tone,
    presence: user.presence,
    note: presenceNote(user),
    initials: user.initials,
    photo: user.photoUrl,
  }
}

export function sortContacts(contacts: Contact[]) {
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name))
}
