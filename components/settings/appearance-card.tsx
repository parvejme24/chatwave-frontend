"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { SegControl } from "@/components/settings/seg-control"
import { SettingRow } from "@/components/settings/setting-row"
import { Switch } from "@/components/ui/switch"

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const

export function AppearanceCard({
  reduceMotion,
  onReduceMotionChange,
}: {
  reduceMotion: boolean
  onReduceMotionChange: (value: boolean) => void
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current = mounted ? (theme ?? "light") : "light"

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Appearance
        </h3>
      </div>
      <div className="px-5 py-1.5">
        <SettingRow title="Theme" hint="System follows your device setting">
          <SegControl
            ariaLabel="Theme"
            value={current}
            onChange={setTheme}
            options={[...themeOptions]}
          />
        </SettingRow>
        <SettingRow
          title="Reduce motion"
          hint="Turns off the waveform and ripple animations"
        >
            <Switch
            checked={reduceMotion}
            onCheckedChange={onReduceMotionChange}
            aria-label="Reduce motion"
            className="cursor-pointer"
          />
        </SettingRow>
      </div>
    </section>
  )
}
