import type { AvatarTone, Presence } from "./chat"

export type AuthProviders = {
  google: boolean
  github: boolean
}

export type AuthUser = {
  id: string
  name: string
  email: string
  username: string
  initials: string
  tone: AvatarTone
  photoUrl: string | null
  role: string
  location: string
  isOwner: boolean
  presence: Presence
  lastSeenAt: string | null
  status: "active" | "banned"
  providers: AuthProviders
  settings?: {
    showLastSeen?: boolean
    readReceipts?: boolean
  }
  createdAt: string
}

export type AuthPayload = {
  user: AuthUser
  accessToken?: string
}
