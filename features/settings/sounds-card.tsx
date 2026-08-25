"use client"

import { Volume2 } from "lucide-react"

import { SettingRow } from "./setting-row"
import { cn } from "../../lib/utils"
import {
  previewSound,
  SOUND_EVENTS,
  SOUND_OFF,
  SOUND_OPTIONS,
  type SoundEvent,
  type SoundFavorites,
} from "../../lib/sounds"
import {
  selectAccessToken,
  selectAuthHydrated,
} from "../../lib/store/auth-slice"
import { useAppSelector } from "../../lib/store/hooks"
import { useGetSoundsCatalogQuery } from "../../lib/store/settings-api"
import type { SoundCatalogEvent } from "../../lib/types/settings"

const SOUND_EVENT_IDS = new Set<string>(SOUND_EVENTS.map((event) => event.id))

function fallbackEvents(): SoundCatalogEvent[] {
  return SOUND_EVENTS.map((event) => ({
    id: event.id,
    title: event.title,
    hint: event.hint,
    options: SOUND_OPTIONS[event.id].map((option) => ({
      id: option.id,
      name: option.name,
    })),
  }))
}

export function SoundsCard({
  enabled,
  favorites,
  onChange,
}: {
  enabled: boolean
  favorites: SoundFavorites
  onChange: (favorites: SoundFavorites) => void
}) {
  const hydrated = useAppSelector(selectAuthHydrated)
  const token = useAppSelector(selectAccessToken)
  const { data } = useGetSoundsCatalogQuery(undefined, {
    skip: !hydrated || !token,
  })
  const events = data?.events?.length ? data.events : fallbackEvents()
  const off = data?.off || SOUND_OFF

  function pick(eventId: string, variantId: string) {
    if (!SOUND_EVENT_IDS.has(eventId)) return
    const event = eventId as SoundEvent
    onChange({ ...favorites, [event]: variantId })
    if (enabled && variantId !== off) previewSound(event, variantId)
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
        {events.map((event) => (
          <SettingRow key={event.id} title={event.title} hint={event.hint}>
            <div
              role="group"
              aria-label={event.title}
              className="flex max-w-[360px] flex-wrap justify-end gap-[3px] rounded-[11px] border border-edge bg-surface-2 p-[3px]"
            >
              <Chip
                pressed={favorites[event.id as SoundEvent] === off}
                onClick={() => pick(event.id, off)}
              >
                Off
              </Chip>
              {(event.options?.length
                ? event.options
                : SOUND_OPTIONS[event.id as SoundEvent] ?? []
              ).map((option) => (
                <Chip
                  key={option.id}
                  pressed={favorites[event.id as SoundEvent] === option.id}
                  onClick={() => pick(event.id, option.id)}
                >
                  {favorites[event.id as SoundEvent] === option.id ? (
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
