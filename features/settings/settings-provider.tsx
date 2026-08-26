"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { INITIAL_SETTINGS, SETTINGS_PROFILE } from "../../lib/data/settings"
import type { SettingsProfile } from "../../lib/data/settings"
import { setSoundFavorites, setSoundsEnabled } from "../../lib/sounds"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { contactInitials } from "../../lib/types/contact"
import {
  selectAccessToken,
  selectAuthHydrated,
  selectAuthUser,
} from "../../lib/store/auth-slice"
import { useAppSelector } from "../../lib/store/hooks"
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../lib/store/settings-api"
import { useGetMyUserQuery } from "../../lib/store/users-api"
import type { AuthUser } from "../../lib/types/auth"
import type {
  SettingsAuth,
  SettingsSession,
  SettingsStorage,
  UpdateSettingsInput,
  UserSettings,
} from "../../lib/types/settings"

export type AppSettings = UserSettings

type SettingsContextValue = {
  settings: AppSettings
  profile: SettingsProfile
  authMethods: SettingsAuth
  sessions: SettingsSession[]
  storage?: SettingsStorage
  setSettings: (updater: (current: AppSettings) => AppSettings) => void
  setProfile: (updater: (current: SettingsProfile) => SettingsProfile) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const SCALAR_KEYS = [
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
] as const

function profileFromAuthUser(user: AuthUser): SettingsProfile {
  const name = user.name || user.username || "You"
  return {
    name,
    role: user.role || "",
    location: user.location || "",
    username: user.username || "",
    email: user.email || "",
    initials: user.initials || contactInitials(name),
    tone: user.tone || "a",
    photo: user.photoUrl,
    isOwner: user.isOwner,
    presence: user.presence,
  }
}

function defaultAuthMethods(profile: SettingsProfile, user: AuthUser | null): SettingsAuth {
  return {
    email: profile.email,
    emailVerified: true,
    providers: user?.providers ?? { google: false, github: false },
  }
}

function diffSettings(
  previous: UserSettings,
  next: UserSettings
): UpdateSettingsInput {
  const patch: UpdateSettingsInput = {}
  for (const key of SCALAR_KEYS) {
    if (previous[key] !== next[key]) {
      Object.assign(patch, { [key]: next[key] })
    }
  }
  if (
    JSON.stringify(previous.soundFavorites) !==
    JSON.stringify(next.soundFavorites)
  ) {
    patch.soundFavorites = next.soundFavorites
  }
  return patch
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme()
  const authUser = useAppSelector(selectAuthUser)
  const hydrated = useAppSelector(selectAuthHydrated)
  const token = useAppSelector(selectAccessToken)
  useGetMyUserQuery(undefined, { skip: !hydrated || !token })
  const { data } = useGetSettingsQuery(undefined, {
    skip: !hydrated || !token,
  })
  const [updateSettings] = useUpdateSettingsMutation()
  const [profileOverride, setProfileOverride] = useState<{
    userId: string
    profile: SettingsProfile
  } | null>(null)
  const appliedTheme = useRef<string | null>(null)

  const settings = data?.settings ?? INITIAL_SETTINGS
  const derivedProfile = useMemo(() => {
    if (!authUser) return SETTINGS_PROFILE
    return {
      ...profileFromAuthUser(authUser),
      isOwner: data?.isOwner ?? authUser.isOwner,
    }
  }, [authUser, data?.isOwner])
  const profile =
    profileOverride && profileOverride.userId === authUser?.id
      ? profileOverride.profile
      : derivedProfile

  useEffect(() => {
    const theme = data?.settings.theme
    if (!theme || appliedTheme.current === theme) return
    appliedTheme.current = theme
    setTheme(theme)
  }, [data?.settings.theme, setTheme])

  const setSettings = useCallback(
    (updater: (current: AppSettings) => AppSettings) => {
      const next = updater(settings)
      const patch = diffSettings(settings, next)
      if (Object.keys(patch).length === 0) return
      if (patch.theme) {
        appliedTheme.current = patch.theme
        setTheme(patch.theme)
      }
      void updateSettings(patch)
        .unwrap()
        .catch((error) => {
          toast.error(mutationErrorMessage(error, "Could not save settings"))
        })
    },
    [setTheme, settings, updateSettings]
  )

  const setProfile = useCallback(
    (updater: (current: SettingsProfile) => SettingsProfile) => {
      setProfileOverride((current) => {
        const from =
          current && current.userId === authUser?.id
            ? current.profile
            : derivedProfile
        const next = updater(from)
        return {
          userId: authUser?.id ?? "anon",
          profile: { ...next, isOwner: next.isOwner ?? from.isOwner },
        }
      })
    },
    [authUser?.id, derivedProfile]
  )

  useEffect(() => {
    document.documentElement.toggleAttribute(
      "data-reduce-motion",
      settings.reduceMotion
    )
    setSoundsEnabled(settings.notificationSounds)
    setSoundFavorites(settings.soundFavorites)
  }, [
    settings.reduceMotion,
    settings.notificationSounds,
    settings.soundFavorites,
  ])

  const authMethods = data?.auth ?? defaultAuthMethods(profile, authUser)

  const value = useMemo(
    () => ({
      settings,
      profile,
      authMethods,
      sessions: data?.sessions ?? [],
      storage: data?.storage,
      setSettings,
      setProfile,
    }),
    [
      settings,
      profile,
      authMethods,
      data?.sessions,
      data?.storage,
      setSettings,
      setProfile,
    ]
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}
