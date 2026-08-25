import {
  DEFAULT_SOUND_FAVORITES,
  type SoundEvent,
  type SoundFavorites,
} from "../sounds"
import type { AuthProviders, AuthUser } from "./auth"

export type ThemePreference = "light" | "dark" | "system"
export type VideoQuality = "auto" | "720p" | "1080p"

export type UserSettings = {
  theme: ThemePreference
  reduceMotion: boolean
  messageNotifications: boolean
  notificationSounds: boolean
  missedCallEmails: boolean
  unreadDigest: boolean
  readReceipts: boolean
  showLastSeen: boolean
  videoQuality: VideoQuality
  noiseSuppression: boolean
  autoDownload: boolean
  soundFavorites: SoundFavorites
}

export type UpdateSettingsInput = Partial<
  Omit<UserSettings, "soundFavorites">
> & {
  soundFavorites?: Partial<SoundFavorites>
}

export type SettingsAuth = {
  email: string
  emailVerified: boolean
  providers: AuthProviders
}

export type SettingsSession = {
  id: string
  current?: boolean
  thisDevice?: boolean
  name?: string
  device?: string
  browser?: string
  os?: string
  location?: string
  lastActive?: string
  lastActiveAt?: string
  ip?: string
}

export type SettingsStorage = {
  bytes?: number
  conversations?: number
}

export type SettingsPrivacy = {
  blockedCount?: number
}

export type SettingsPagePayload = {
  settings: UserSettings
  profile?: AuthUser
  auth?: SettingsAuth
  privacy?: SettingsPrivacy
  isOwner?: boolean
  sessions?: SettingsSession[]
  storage?: SettingsStorage
}

export type SoundCatalogOption = {
  id: string
  name: string
}

export type SoundCatalogEvent = {
  id: string
  title: string
  hint: string
  options: SoundCatalogOption[]
}

export type SoundsCatalog = {
  events: SoundCatalogEvent[]
  off: string
  favorites?: Partial<SoundFavorites>
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: "system",
  reduceMotion: false,
  messageNotifications: true,
  notificationSounds: true,
  missedCallEmails: true,
  unreadDigest: false,
  readReceipts: true,
  showLastSeen: true,
  videoQuality: "720p",
  noiseSuppression: true,
  autoDownload: false,
  soundFavorites: { ...DEFAULT_SOUND_FAVORITES },
}

const THEMES: ThemePreference[] = ["light", "dark", "system"]
const QUALITIES: VideoQuality[] = ["auto", "720p", "1080p"]

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback
}

function asTheme(value: unknown, fallback: ThemePreference): ThemePreference {
  return typeof value === "string" && THEMES.includes(value as ThemePreference)
    ? (value as ThemePreference)
    : fallback
}

function asQuality(value: unknown, fallback: VideoQuality): VideoQuality {
  return typeof value === "string" && QUALITIES.includes(value as VideoQuality)
    ? (value as VideoQuality)
    : fallback
}

export function mergeUserSettings(
  base: UserSettings,
  patch?: Partial<UserSettings> | null
): UserSettings {
  if (!patch) return { ...base, soundFavorites: { ...base.soundFavorites } }
  return {
    theme: asTheme(patch.theme, base.theme),
    reduceMotion: asBoolean(patch.reduceMotion, base.reduceMotion),
    messageNotifications: asBoolean(
      patch.messageNotifications,
      base.messageNotifications
    ),
    notificationSounds: asBoolean(
      patch.notificationSounds,
      base.notificationSounds
    ),
    missedCallEmails: asBoolean(patch.missedCallEmails, base.missedCallEmails),
    unreadDigest: asBoolean(patch.unreadDigest, base.unreadDigest),
    readReceipts: asBoolean(patch.readReceipts, base.readReceipts),
    showLastSeen: asBoolean(patch.showLastSeen, base.showLastSeen),
    videoQuality: asQuality(patch.videoQuality, base.videoQuality),
    noiseSuppression: asBoolean(patch.noiseSuppression, base.noiseSuppression),
    autoDownload: asBoolean(patch.autoDownload, base.autoDownload),
    soundFavorites: {
      ...base.soundFavorites,
      ...(patch.soundFavorites ?? {}),
    },
  }
}

export function applySettingsPatch(
  current: UserSettings,
  patch: UpdateSettingsInput
): UserSettings {
  return mergeUserSettings(current, patch as Partial<UserSettings>)
}

const SETTINGS_KEYS = [
  "theme",
  "reduceMotion",
  "messageNotifications",
  "notificationSounds",
  "missedCallEmails",
  "unreadDigest",
  "readReceipts",
  "showLastSeen",
  "videoQuality",
  "noiseSuppression",
  "autoDownload",
  "soundFavorites",
] as const

function looksLikeSettings(record: Record<string, unknown> | null) {
  if (!record) return false
  return SETTINGS_KEYS.some((key) => key in record)
}

function unwrapAuth(
  record: Record<string, unknown> | null,
  profile?: AuthUser
): SettingsAuth | undefined {
  const nested = asRecord(record?.auth)
  if (!nested && !profile) return undefined
  const providers = asRecord(nested?.providers) ?? asRecord(profile?.providers)
  const email =
    (typeof nested?.email === "string" && nested.email) ||
    profile?.email ||
    ""
  if (!nested && !email) return undefined
  return {
    email,
    emailVerified:
      typeof nested?.emailVerified === "boolean"
        ? nested.emailVerified
        : true,
    providers: {
      google: Boolean(providers?.google),
      github: Boolean(providers?.github),
    },
  }
}

function unwrapStorage(
  value: unknown
): SettingsStorage | undefined {
  const record = asRecord(value)
  if (!record) return undefined
  return {
    bytes: typeof record.bytes === "number" ? record.bytes : undefined,
    conversations:
      typeof record.conversations === "number"
        ? record.conversations
        : undefined,
  }
}

function unwrapPrivacy(value: unknown): SettingsPrivacy | undefined {
  const record = asRecord(value)
  if (!record) return undefined
  return {
    blockedCount:
      typeof record.blockedCount === "number"
        ? record.blockedCount
        : undefined,
  }
}

export function unwrapPresentSettings(payload: unknown): Partial<UserSettings> {
  const record = asRecord(payload)
  const nested = asRecord(record?.settings)
  const source = nested ?? (looksLikeSettings(record) ? record : null)
  if (!source) return {}
  const out: Partial<UserSettings> = {}
  if ("theme" in source) out.theme = asTheme(source.theme, DEFAULT_USER_SETTINGS.theme)
  if ("reduceMotion" in source) {
    out.reduceMotion = asBoolean(source.reduceMotion, DEFAULT_USER_SETTINGS.reduceMotion)
  }
  if ("messageNotifications" in source) {
    out.messageNotifications = asBoolean(
      source.messageNotifications,
      DEFAULT_USER_SETTINGS.messageNotifications
    )
  }
  if ("notificationSounds" in source) {
    out.notificationSounds = asBoolean(
      source.notificationSounds,
      DEFAULT_USER_SETTINGS.notificationSounds
    )
  }
  if ("missedCallEmails" in source) {
    out.missedCallEmails = asBoolean(
      source.missedCallEmails,
      DEFAULT_USER_SETTINGS.missedCallEmails
    )
  }
  if ("unreadDigest" in source) {
    out.unreadDigest = asBoolean(
      source.unreadDigest,
      DEFAULT_USER_SETTINGS.unreadDigest
    )
  }
  if ("readReceipts" in source) {
    out.readReceipts = asBoolean(
      source.readReceipts,
      DEFAULT_USER_SETTINGS.readReceipts
    )
  }
  if ("showLastSeen" in source) {
    out.showLastSeen = asBoolean(
      source.showLastSeen,
      DEFAULT_USER_SETTINGS.showLastSeen
    )
  }
  if ("videoQuality" in source) {
    out.videoQuality = asQuality(
      source.videoQuality,
      DEFAULT_USER_SETTINGS.videoQuality
    )
  }
  if ("noiseSuppression" in source) {
    out.noiseSuppression = asBoolean(
      source.noiseSuppression,
      DEFAULT_USER_SETTINGS.noiseSuppression
    )
  }
  if ("autoDownload" in source) {
    out.autoDownload = asBoolean(
      source.autoDownload,
      DEFAULT_USER_SETTINGS.autoDownload
    )
  }
  if ("soundFavorites" in source) {
    const favorites = asRecord(source.soundFavorites)
    if (favorites) {
      const next: SoundFavorites = { ...DEFAULT_USER_SETTINGS.soundFavorites }
      for (const key of Object.keys(next) as SoundEvent[]) {
        const value = favorites[key]
        if (typeof value === "string") next[key] = value
      }
      out.soundFavorites = next
    }
  }
  return out
}

export function unwrapSettingsPage(payload: unknown): SettingsPagePayload {
  const record = asRecord(payload)
  const nestedProfile = asRecord(record?.profile)
  const profile = nestedProfile
    ? (nestedProfile as unknown as AuthUser)
    : undefined
  const nestedSettings = asRecord(record?.settings)
  const rawSettings = nestedSettings
    ? (nestedSettings as Partial<UserSettings>)
    : looksLikeSettings(record)
      ? (record as Partial<UserSettings>)
      : undefined

  return {
    settings: mergeUserSettings(DEFAULT_USER_SETTINGS, rawSettings),
    profile,
    auth: unwrapAuth(record, profile),
    privacy: unwrapPrivacy(record?.privacy),
    isOwner:
      typeof record?.isOwner === "boolean"
        ? record.isOwner
        : profile?.isOwner,
    sessions: Array.isArray(record?.sessions)
      ? (record.sessions as SettingsSession[])
      : undefined,
    storage: unwrapStorage(record?.storage),
  }
}

export function unwrapSoundsCatalog(payload: unknown): SoundsCatalog {
  const record = asRecord(payload)
  const events = Array.isArray(record?.events)
    ? (record.events as SoundCatalogEvent[])
    : []
  return {
    events,
    off: typeof record?.off === "string" ? record.off : "off",
    favorites: asRecord(record?.favorites) as Partial<SoundFavorites> | undefined,
  }
}

export function formatStorageUsed(storage?: SettingsStorage) {
  const bytes = storage?.bytes
  const conversations = storage?.conversations
  if (typeof bytes !== "number" && typeof conversations !== "number") {
    return null
  }
  const size =
    typeof bytes === "number" ? formatBytes(bytes) : "Media size unknown"
  if (typeof conversations === "number") {
    const label = conversations === 1 ? "conversation" : "conversations"
    return `${size} of media across ${conversations} ${label}`
  }
  return size
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
  const gb = mb / 1024
  return `${gb < 10 ? gb.toFixed(1) : Math.round(gb)} GB`
}
