import type { AvatarTone } from "../types/chat"
import { DEFAULT_SOUND_FAVORITES } from "../sounds"

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

export type VideoQuality = "auto" | "720p" | "1080p"

export const INITIAL_SETTINGS = {
  reduceMotion: false,
  messageNotifications: true,
  notificationSounds: true,
  soundFavorites: { ...DEFAULT_SOUND_FAVORITES },
  missedCallEmails: true,
  unreadDigest: false,
  readReceipts: true,
  showLastSeen: true,
  videoQuality: "720p" as VideoQuality,
  noiseSuppression: true,
  autoDownload: false,
  androidSession: true,
}
