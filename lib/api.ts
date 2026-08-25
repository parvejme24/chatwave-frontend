const DEFAULT_API_URL = "https://chatwave-backend-z7n1.onrender.com"

/** Same-origin prefix rewritten to the backend in next.config.ts. Avoids browser CORS. */
export const API_PROXY_PREFIX = "/cw-api"

export function remoteApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "")
}

export function apiBaseUrl() {
  if (typeof window !== "undefined") return API_PROXY_PREFIX
  return remoteApiBaseUrl()
}

export function apiUrl(path = "") {
  const base = apiBaseUrl()
  if (!path) return base
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export function remoteApiUrl(path = "") {
  const base = remoteApiBaseUrl()
  if (!path) return base
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return ""
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (/^(https?:|blob:|data:)/i.test(trimmed)) return trimmed
  if (trimmed.startsWith("//")) {
    if (typeof window === "undefined") return `https:${trimmed}`
    return `${window.location.protocol}${trimmed}`
  }
  if (trimmed.startsWith(API_PROXY_PREFIX)) return trimmed
  if (trimmed.startsWith("/")) return `${API_PROXY_PREFIX}${trimmed}`
  return trimmed
}

export function apiErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string" && payload.trim()) return payload

  if (payload && typeof payload === "object") {
    const record = payload as {
      error?: unknown
      message?: unknown
      data?: unknown
    }

    if (typeof record.error === "string" && record.error) return record.error
    if (Array.isArray(record.message) && typeof record.message[0] === "string") {
      return record.message[0]
    }
    if (typeof record.message === "string" && record.message) {
      return record.message
    }
    if (record.data && record.data !== payload) {
      return apiErrorMessage(record.data, fallback)
    }
  }

  return fallback
}
