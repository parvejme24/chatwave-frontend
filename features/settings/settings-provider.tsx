"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { createManagedUsers } from "../../lib/data/admin-users"
import { INITIAL_SETTINGS, SETTINGS_PROFILE } from "../../lib/data/settings"
import type { SettingsProfile } from "../../lib/data/settings"
import { setSoundFavorites, setSoundsEnabled } from "../../lib/sounds"
import type { ManagedUser } from "../../lib/types/admin"

export type AppSettings = typeof INITIAL_SETTINGS

type SettingsContextValue = {
  settings: AppSettings
  profile: SettingsProfile
  users: ManagedUser[]
  removedUserKeys: string[]
  setSettings: (updater: (current: AppSettings) => AppSettings) => void
  setProfile: (updater: (current: SettingsProfile) => SettingsProfile) => void
  banUser: (id: string) => void
  unbanUser: (id: string) => void
  deleteUser: (id: string) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState(INITIAL_SETTINGS)
  const [profile, setProfileState] = useState(SETTINGS_PROFILE)
  const [users, setUsers] = useState<ManagedUser[]>(createManagedUsers)
  const [removedUserKeys, setRemovedUserKeys] = useState<string[]>([])

  const setSettings = useCallback((updater: (current: AppSettings) => AppSettings) => {
    setSettingsState(updater)
  }, [])

  const setProfile = useCallback(
    (updater: (current: SettingsProfile) => SettingsProfile) => {
      setProfileState((current) => {
        const next = updater(current)
        return { ...next, isOwner: current.isOwner }
      })
    },
    []
  )

  const banUser = useCallback((id: string) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, status: "banned" as const } : user
      )
    )
  }, [])

  const unbanUser = useCallback((id: string) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, status: "active" as const } : user
      )
    )
  }, [])

  const deleteUser = useCallback(
    (id: string) => {
      const target = users.find((user) => user.id === id)
      if (!target) return
      setUsers((current) => current.filter((user) => user.id !== id))
      setRemovedUserKeys((keys) =>
        keys.includes(target.id)
          ? keys
          : [...keys, target.id, target.name, target.user]
      )
    },
    [users]
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

  const value = useMemo(
    () => ({
      settings,
      profile,
      users,
      removedUserKeys,
      setSettings,
      setProfile,
      banUser,
      unbanUser,
      deleteUser,
    }),
    [
      settings,
      profile,
      users,
      removedUserKeys,
      setSettings,
      setProfile,
      banUser,
      unbanUser,
      deleteUser,
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
