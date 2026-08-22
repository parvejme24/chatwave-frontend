export function makePeaks(seed: number, count = 42) {
  const peaks: number[] = []
  let s = seed

  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280
    const base = s / 233280
    const env = Math.sin((i / count) * Math.PI) * 0.45 + 0.55
    const shaped = 0.34 + base * 0.66
    peaks.push(Math.max(0.26, Math.min(1, shaped * env * 1.2)))
  }

  return peaks
}

export function fmtTime(sec: number) {
  const safe = Math.max(0, sec)
  const minutes = Math.floor(safe / 60)
  const seconds = Math.floor(safe % 60)
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}
