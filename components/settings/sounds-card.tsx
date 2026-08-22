"use client"

import { Volume2 } from "lucide-react"

import { SettingRow } from "@/components/settings/setting-row"
import { cn } from "@/lib/utils"
import {
  previewSound,
  SOUND_EVENTS,
  SOUND_OFF,
  SOUND_OPTIONS,
  type SoundEvent,
  type SoundFavorites,
} from "@/lib/sounds"

export function SoundsCard({
  enabled,
  favorites,
  onChange,
}: {
  enabled: boolean
  favorites: SoundFavorites
  onChange: (favorites: SoundFavorites) => void
}) {
  function pick(event: SoundEvent, variantId: string) {
    onChange({ ...favorites, [event]: variantId })
    if (enabled) previewSound(event, variantId)
  }

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Sounds
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          Pick a favorite for each event, or choose Off. The Play sounds switch
          above mutes everything.
        </p>
      </div>
      <div
        className={cn("px-5 py-1.5", !enabled && "pointer-events-none opacity-50")}
      >
        {SOUND_EVENTS.map((event) => (
          <SettingRow key={event.id} title={event.title} hint={event.hint}>
            <div
              role="group"
              aria-label={event.title}
              className="flex max-w-[360px] flex-wrap justify-end gap-[3px] rounded-[11px] border border-edge bg-surface-2 p-[3px]"
            >
              <Chip
                pressed={favorites[event.id] === SOUND_OFF}
                onClick={() => pick(event.id, SOUND_OFF)}
              >
                Off
              </Chip>
              {SOUND_OPTIONS[event.id].map((option) => (
                <Chip
                  key={option.id}
                  pressed={favorites[event.id] === option.id}
                  onClick={() => pick(event.id, option.id)}
                >
                  {favorites[event.id] === option.id ? (
                    <Volume2 className="size-3 stroke-[1.75]" aria-hidden />
                  ) : null}
                  {option.name}
                </Chip>
              ))}
            </div>
          </SettingRow>
        ))}
      </div>
    </section>
  )
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
        pressed &&
          "bg-surface text-ink shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]"
      )}
    >
      {children}
    </button>
  )
}
