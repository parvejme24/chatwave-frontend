import type { AvatarTone, Presence } from "../types/chat"
import { DEFAULT_USER_SETTINGS, type UserSettings } from "../types/settings"

export type { ThemePreference, UserSettings, VideoQuality } from "../types/settings"

export type SettingsProfile = {
  name: string
  role: string
  location: string
  username: string
  email: string
  initials: string
  tone: AvatarTone
  photo: string | null
  isOwner?: boolean
  presence?: Presence
}

export const SETTINGS_PROFILE: SettingsProfile = {
  name: "Md Parvej",
  role: "Full-stack developer",
  location: "Dhaka",
  username: "parvej",
  email: "devparvej@gmail.com",
  initials: "PR",
  tone: "a",
  photo: null,
  isOwner: true,
}

export function isAppOwner(profile: SettingsProfile) {
  return Boolean(profile.isOwner)
}

export function profileBio(profile: SettingsProfile) {
  return [profile.role, profile.location].filter(Boolean).join(" · ")
}

export function profileHandle(profile: SettingsProfile) {
  const user = profile.username.replace(/^@/, "")
  return [`@${user}`, profile.email].filter(Boolean).join(" · ")
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export const INITIAL_SETTINGS: UserSettings = {
  ...DEFAULT_USER_SETTINGS,
  soundFavorites: { ...DEFAULT_USER_SETTINGS.soundFavorites },
}
