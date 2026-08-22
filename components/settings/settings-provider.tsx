"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { INITIAL_SETTINGS, SETTINGS_PROFILE } from "@/lib/data/settings"
import type { SettingsProfile } from "@/lib/data/settings"
import { setSoundFavorites, setSoundsEnabled } from "@/lib/sounds"

export type AppSettings = typeof INITIAL_SETTINGS

type SettingsContextValue = {
  settings: AppSettings
  profile: SettingsProfile
  setSettings: (updater: (current: AppSettings) => AppSettings) => void
  setProfile: (updater: (current: SettingsProfile) => SettingsProfile) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState(INITIAL_SETTINGS)
  const [profile, setProfileState] = useState(SETTINGS_PROFILE)

  const setSettings = useCallback((updater: (current: AppSettings) => AppSettings) => {
    setSettingsState(updater)
  }, [])

  const setProfile = useCallback(
    (updater: (current: SettingsProfile) => SettingsProfile) => {
      setProfileState(updater)
    },
    []
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
    () => ({ settings, profile, setSettings, setProfile }),
    [settings, profile, setSettings, setProfile]
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
