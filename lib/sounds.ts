export type SoundEvent =
  | "send"
  | "typing"
  | "notify"
  | "incoming"
  | "callStart"
  | "callEnd"
  | "delete"

export type SoundId = SoundEvent

type Tone = {
  freq: number
  at: number
  dur: number
  type?: OscillatorType
  gain?: number
  endFreq?: number
}

export type SoundOption = {
  id: string
  name: string
  tones: Tone[]
  loopMs?: number
}

export const SOUND_OPTIONS: Record<SoundEvent, SoundOption[]> = {
  send: [
    {
      id: "pop",
      name: "Pop",
      tones: [
        { freq: 820, at: 0, dur: 0.055, type: "sine", gain: 0.09 },
        { freq: 1240, at: 0.04, dur: 0.08, type: "sine", gain: 0.11 },
      ],
    },
    {
      id: "soft",
      name: "Soft",
      tones: [
        { freq: 620, at: 0, dur: 0.08, type: "sine", gain: 0.06 },
        { freq: 880, at: 0.06, dur: 0.1, type: "sine", gain: 0.07 },
      ],
    },
    {
      id: "click",
      name: "Click",
      tones: [{ freq: 1680, at: 0, dur: 0.035, type: "triangle", gain: 0.07 }],
    },
    {
      id: "bubble",
      name: "Bubble",
      tones: [
        { freq: 540, at: 0, dur: 0.12, type: "sine", gain: 0.08, endFreq: 980 },
      ],
    },
  ],
  typing: [
    {
      id: "tick",
      name: "Tick",
      tones: [{ freq: 1860, at: 0, dur: 0.022, type: "triangle", gain: 0.028 }],
    },
    {
      id: "soft",
      name: "Soft",
      tones: [{ freq: 1420, at: 0, dur: 0.028, type: "sine", gain: 0.02 }],
    },
    {
      id: "knock",
      name: "Knock",
      tones: [{ freq: 420, at: 0, dur: 0.03, type: "triangle", gain: 0.035 }],
    },
  ],
  notify: [
    {
      id: "chime",
      name: "Chime",
      tones: [
        { freq: 659, at: 0, dur: 0.11, type: "sine", gain: 0.1 },
        { freq: 831, at: 0.1, dur: 0.12, type: "sine", gain: 0.1 },
        { freq: 1047, at: 0.22, dur: 0.2, type: "sine", gain: 0.12 },
      ],
    },
    {
      id: "ping",
      name: "Ping",
      tones: [
        { freq: 1320, at: 0, dur: 0.08, type: "sine", gain: 0.1 },
        { freq: 1760, at: 0.06, dur: 0.14, type: "sine", gain: 0.08 },
      ],
    },
    {
      id: "bell",
      name: "Bell",
      tones: [
        { freq: 523, at: 0, dur: 0.22, type: "triangle", gain: 0.09 },
        { freq: 784, at: 0.08, dur: 0.24, type: "sine", gain: 0.08 },
      ],
    },
    {
      id: "marimba",
      name: "Marimba",
      tones: [
        { freq: 392, at: 0, dur: 0.12, type: "sine", gain: 0.09 },
        { freq: 523, at: 0.1, dur: 0.12, type: "sine", gain: 0.09 },
        { freq: 659, at: 0.2, dur: 0.16, type: "sine", gain: 0.1 },
      ],
    },
  ],
  incoming: [
    {
      id: "classic",
      name: "Classic",
      loopMs: 2000,
      tones: [
        { freq: 440, at: 0, dur: 0.18, type: "sine", gain: 0.1 },
        { freq: 480, at: 0.2, dur: 0.18, type: "sine", gain: 0.1 },
        { freq: 440, at: 0.4, dur: 0.18, type: "sine", gain: 0.1 },
        { freq: 480, at: 0.6, dur: 0.18, type: "sine", gain: 0.1 },
      ],
    },
    {
      id: "bright",
      name: "Bright",
      loopMs: 1800,
      tones: [
        { freq: 660, at: 0, dur: 0.16, type: "sine", gain: 0.1 },
        { freq: 880, at: 0.18, dur: 0.2, type: "sine", gain: 0.11 },
      ],
    },
    {
      id: "soft",
      name: "Soft",
      loopMs: 2400,
      tones: [
        { freq: 392, at: 0, dur: 0.22, type: "sine", gain: 0.07 },
        { freq: 523, at: 0.24, dur: 0.28, type: "sine", gain: 0.08 },
      ],
    },
    {
      id: "pulse",
      name: "Pulse",
      loopMs: 1600,
      tones: [
        { freq: 520, at: 0, dur: 0.12, type: "triangle", gain: 0.09 },
        { freq: 520, at: 0.22, dur: 0.12, type: "triangle", gain: 0.07 },
      ],
    },
  ],
  callStart: [
    {
      id: "sweep",
      name: "Sweep",
      tones: [
        { freq: 392, at: 0, dur: 0.22, type: "sine", gain: 0.08, endFreq: 523 },
        { freq: 659, at: 0.18, dur: 0.16, type: "sine", gain: 0.1 },
        { freq: 784, at: 0.32, dur: 0.18, type: "sine", gain: 0.11 },
        { freq: 988, at: 0.48, dur: 0.22, type: "triangle", gain: 0.08 },
      ],
    },
    {
      id: "rise",
      name: "Rise",
      tones: [
        { freq: 330, at: 0, dur: 0.35, type: "sine", gain: 0.09, endFreq: 880 },
      ],
    },
    {
      id: "chirp",
      name: "Chirp",
      tones: [
        { freq: 740, at: 0, dur: 0.08, type: "sine", gain: 0.09 },
        { freq: 990, at: 0.09, dur: 0.12, type: "sine", gain: 0.1 },
      ],
    },
    {
      id: "fanfare",
      name: "Fanfare",
      tones: [
        { freq: 523, at: 0, dur: 0.12, type: "triangle", gain: 0.08 },
        { freq: 659, at: 0.12, dur: 0.12, type: "triangle", gain: 0.09 },
        { freq: 784, at: 0.24, dur: 0.18, type: "sine", gain: 0.1 },
      ],
    },
  ],
  callEnd: [
    {
      id: "drop",
      name: "Drop",
      tones: [
        { freq: 494, at: 0, dur: 0.16, type: "sine", gain: 0.09, endFreq: 330 },
        { freq: 247, at: 0.12, dur: 0.2, type: "triangle", gain: 0.07 },
      ],
    },
    {
      id: "fade",
      name: "Fade",
      tones: [
        { freq: 440, at: 0, dur: 0.32, type: "sine", gain: 0.08, endFreq: 180 },
      ],
    },
    {
      id: "click",
      name: "Click",
      tones: [{ freq: 210, at: 0, dur: 0.06, type: "square", gain: 0.04 }],
    },
    {
      id: "low",
      name: "Low",
      tones: [{ freq: 160, at: 0, dur: 0.18, type: "sine", gain: 0.08 }],
    },
  ],
  delete: [
    {
      id: "thud",
      name: "Thud",
      tones: [
        { freq: 420, at: 0, dur: 0.05, type: "square", gain: 0.045 },
        { freq: 240, at: 0.04, dur: 0.1, type: "sine", gain: 0.07, endFreq: 140 },
      ],
    },
    {
      id: "snap",
      name: "Snap",
      tones: [{ freq: 980, at: 0, dur: 0.04, type: "triangle", gain: 0.06 }],
    },
    {
      id: "whoosh",
      name: "Whoosh",
      tones: [
        { freq: 720, at: 0, dur: 0.14, type: "sine", gain: 0.07, endFreq: 180 },
      ],
    },
  ],
}

export const SOUND_EVENTS: {
  id: SoundEvent
  title: string
  hint: string
}[] = [
  { id: "send", title: "Send message", hint: "When you send a text, voice, or video note" },
  { id: "notify", title: "Notification", hint: "Incoming message alert" },
  { id: "incoming", title: "Incoming call", hint: "Rings while a call is waiting" },
  { id: "callStart", title: "Start call", hint: "When a voice or video call connects" },
  { id: "callEnd", title: "End call", hint: "When a call ends or is declined" },
  { id: "typing", title: "Typing", hint: "Key ticks while you write" },
  { id: "delete", title: "Delete message", hint: "When you remove a message" },
]

export type SoundFavorites = Record<SoundEvent, string>

export const DEFAULT_SOUND_FAVORITES: SoundFavorites = {
  send: "pop",
  typing: "tick",
  notify: "chime",
  incoming: "classic",
  callStart: "sweep",
  callEnd: "drop",
  delete: "thud",
}

export const SOUND_OFF = "off"

let enabled = true
let favorites: SoundFavorites = { ...DEFAULT_SOUND_FAVORITES }
let ctx: AudioContext | null = null
let lastTyping = 0
const loops = new Map<SoundEvent, number>()

function context() {
  if (typeof window === "undefined") return null
  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  ctx ??= new AudioCtx()
  return ctx
}

function optionFor(event: SoundEvent, variantId: string) {
  return SOUND_OPTIONS[event].find((option) => option.id === variantId)
}

function playTones(tones: Tone[]) {
  const audio = context()
  if (!audio) return

  void audio.resume()

  const master = audio.createGain()
  master.gain.value = 0.7
  master.connect(audio.destination)

  for (const tone of tones) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    const start = audio.currentTime + tone.at
    const peak = tone.gain ?? 0.1

    osc.type = tone.type ?? "sine"
    osc.frequency.setValueAtTime(tone.freq, start)
    if (tone.endFreq) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(tone.endFreq, 1),
        start + tone.dur
      )
    }

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.dur)

    osc.connect(gain)
    gain.connect(master)
    osc.start(start)
    osc.stop(start + tone.dur + 0.03)
  }
}

function resolve(event: SoundEvent, variantId = favorites[event]) {
  if (!enabled || variantId === SOUND_OFF) return null
  return optionFor(event, variantId) ?? SOUND_OPTIONS[event][0]
}

export function setSoundsEnabled(value: boolean) {
  enabled = value
  if (!value) stopAllSounds()
}

export function setSoundFavorites(next: SoundFavorites) {
  favorites = { ...next }
}

export function playSound(event: SoundEvent) {
  if (event === "typing") {
    const now = performance.now()
    if (now - lastTyping < 80) return
    lastTyping = now
  }
  const option = resolve(event)
  if (!option) return
  playTones(option.tones)
}

export function previewSound(event: SoundEvent, variantId: string) {
  if (variantId === SOUND_OFF) return
  const option = optionFor(event, variantId)
  if (!option) return
  const audio = context()
  if (!audio) return
  void audio.resume()
  playTones(option.tones)
}

export function startSoundLoop(event: SoundEvent) {
  if (loops.has(event)) return
  const option = resolve(event)
  if (!option) return
  playTones(option.tones)
  const interval = window.setInterval(
    () => playTones(option.tones),
    option.loopMs ?? 2000
  )
  loops.set(event, interval)
}

export function stopSoundLoop(event: SoundEvent) {
  const interval = loops.get(event)
  if (interval === undefined) return
  window.clearInterval(interval)
  loops.delete(event)
}

export function stopAllSounds() {
  for (const event of [...loops.keys()]) stopSoundLoop(event)
}
