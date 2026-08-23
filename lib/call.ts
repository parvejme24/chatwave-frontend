export const LAST_CALL_KEY = "convw_last_call"

export function formatCallTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function parseCallType(value: string | null) {
  return value === "audio" ? "audio" : "video"
}
