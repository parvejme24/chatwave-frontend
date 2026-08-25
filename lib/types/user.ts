import type { AuthUser } from "./auth"
import type { AvatarTone, Presence } from "./chat"

export type OwnerUser = AuthUser

export type PublicUser = {
  id: string
  name: string
  username: string
  initials: string
  tone: AvatarTone
  photoUrl: string | null
  role: string
  location: string
  presence: Presence
  lastSeenAt: string | null
  sub: string
}

export type UpdateProfileInput = {
  name?: string
  username?: string
  role?: string
  location?: string
  tone?: AvatarTone
}

export type SearchUsersArgs = {
  q?: string
  presence?: Presence
  limit?: number
}

export type PresenceUpdate = {
  presence: Presence
  lastSeenAt: string | null
}
