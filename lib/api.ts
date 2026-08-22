const DEFAULT_API_URL = "http://localhost:4000"

export function apiUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
    /\/$/,
    ""
  )

  if (!path) return base

  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export function apiErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as { error?: unknown; message?: unknown }
    if (typeof record.error === "string" && record.error) return record.error
    if (typeof record.message === "string" && record.message) {
      return record.message
    }
  }

  return fallback
}
