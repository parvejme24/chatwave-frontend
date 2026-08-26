"use client"

import {
  Bell,
  Keyboard,
  Phone,
  PhoneIncoming,
  PhoneOff,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react"

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

const EVENT_ICONS: Record<string, LucideIcon> = {
  send: Send,
  notify: Bell,
  incoming: PhoneIncoming,
  callStart: Phone,
  callEnd: PhoneOff,
  typing: Keyboard,
  delete: Trash2,
}

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
      <div className="flex items-start gap-3 border-b border-edge px-5 py-4 max-[479px]:px-4">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[11px] bg-signal-wash text-signal min-[860px]:hidden">
          <Volume2 className="size-4 stroke-[1.75]" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Sounds
          </h3>
          <p className="mt-px text-[13px] text-ink-3">
            Tap a tone to preview it. Off silences that event.
          </p>
        </div>
      </div>
      {!enabled ? (
        <div className="mx-5 mt-3 flex items-center gap-2.5 rounded-[14px] border border-edge bg-surface-2 px-3 py-2.5 text-[13px] text-ink-2 max-[479px]:mx-4">
          <VolumeX className="size-4 shrink-0 text-ink-3" aria-hidden />
          Play sounds is off, so previews are muted. Your picks still save.
        </div>
      ) : null}
      <div className="px-5 py-3 max-[479px]:px-4 min-[860px]:py-1.5">
        {events.map((event) => {
          const selected = favorites[event.id as SoundEvent]
          const options =
            event.options?.length
              ? event.options
              : (SOUND_OPTIONS[event.id as SoundEvent] ?? [])
          const selectedName =
            selected === off
              ? "Off"
              : options.find((option) => option.id === selected)?.name || "Custom"
          const Icon = EVENT_ICONS[event.id] ?? Volume2

          return (
            <article
              key={event.id}
              className="border-t border-edge py-[15px] first:border-t-0 max-[859px]:mb-2.5 max-[859px]:rounded-[16px] max-[859px]:border max-[859px]:border-edge max-[859px]:bg-surface-2 max-[859px]:px-3.5 max-[859px]:py-3.5 max-[859px]:first:border max-[859px]:last:mb-0"
            >
              <div className="flex items-start gap-3 min-[860px]:items-center min-[860px]:justify-between min-[860px]:gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-signal-wash text-signal min-[860px]:hidden">
                  <Icon className="size-[18px] stroke-[1.75]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-[14.5px] font-semibold text-ink">
                      {event.title}
                    </h4>
                    <span className="hidden max-[859px]:inline-flex shrink-0 items-center gap-1 rounded-full bg-surface px-2 py-0.5 font-mono text-[10.5px] font-semibold text-signal">
                      {selected === off ? (
                        <VolumeX className="size-3 stroke-[1.75]" aria-hidden />
                      ) : (
                        <Volume2 className="size-3 stroke-[1.75]" aria-hidden />
                      )}
                      {selectedName}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-ink-3">{event.hint}</p>
                </div>
                <div className="hidden min-w-0 min-[860px]:block min-[860px]:max-w-[360px] min-[860px]:shrink-0">
                  <SoundChoices
                    eventId={event.id}
                    title={event.title}
                    options={options}
                    selected={selected}
                    off={off}
                    onPick={pick}
                    compact
                  />
                </div>
              </div>
              <div className="mt-3 min-[860px]:hidden">
                <SoundChoices
                  eventId={event.id}
                  title={event.title}
                  options={options}
                  selected={selected}
                  off={off}
                  onPick={pick}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function SoundChoices({
  eventId,
  title,
  options,
  selected,
  off,
  onPick,
  compact = false,
}: {
  eventId: string
  title: string
  options: { id: string; name: string }[]
  selected: string
  off: string
  onPick: (eventId: string, variantId: string) => void
  compact?: boolean
}) {
  return (
    <div
      role="group"
      aria-label={title}
      className={cn(
        compact
          ? "flex max-w-[360px] flex-wrap justify-end gap-[3px] rounded-[11px] border border-edge bg-surface-2 p-[3px]"
          : "grid grid-cols-2 gap-1.5 min-[480px]:grid-cols-3"
      )}
    >
      <Chip
        pressed={selected === off}
        off
        compact={compact}
        onClick={() => onPick(eventId, off)}
      >
        Off
      </Chip>
      {options.map((option) => (
        <Chip
          key={option.id}
          pressed={selected === option.id}
          compact={compact}
          onClick={() => onPick(eventId, option.id)}
        >
          {option.name}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  pressed,
  off = false,
  compact = false,
  onClick,
  children,
}: {
  pressed: boolean
  off?: boolean
  compact?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
        compact
          ? "rounded-lg px-2.5 py-1.5 text-[13px] text-ink-3"
          : "min-h-11 rounded-[12px] border px-2.5 text-[13px]",
        compact &&
          pressed &&
          "bg-surface text-ink shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        !compact &&
          !pressed &&
          (off
            ? "border-edge bg-surface text-ink-3"
            : "border-transparent bg-surface text-ink-2 shadow-[0_1px_2px_rgba(17,24,33,0.04)]"),
        !compact &&
          pressed &&
          (off
            ? "border-ink/10 bg-ink text-white"
            : "border-signal bg-signal text-white shadow-[0_6px_16px_rgba(43,63,255,0.22)]")
      )}
    >
      {pressed && !off && !compact ? (
        <SoundBars />
      ) : pressed && !compact && off ? (
        <VolumeX className="size-3.5 stroke-[1.75]" aria-hidden />
      ) : pressed && compact ? (
        <Volume2 className="size-3 stroke-[1.75]" aria-hidden />
      ) : null}
      {children}
    </button>
  )
}

function SoundBars() {
  return (
    <span className="flex h-3 items-end gap-px" aria-hidden>
      {[5, 10, 7, 12, 6].map((height, index) => (
        <i
          key={index}
          className="w-[2.5px] rounded-full bg-white/90"
          style={{ height }}
        />
      ))}
    </span>
  )
}
