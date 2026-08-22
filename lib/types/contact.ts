import type { AvatarTone, Presence } from "@/lib/types/chat"

export type Contact = {
  name: string
  user: string
  tone: AvatarTone
  presence: Presence
  note: string
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
