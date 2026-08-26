export type LinkPiece = {
  text: string
  href?: string
}

export type LinkPreviewData = {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
}

const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<]+)/gi

export function normalizeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/[),.;:!?\]>'"]+$/g, "")
  if (!trimmed) return null
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    if (url.username || url.password) return null
    // Keep a stable href that class-validator @IsUrl accepts
    url.hash = ""
    return url.toString()
  } catch {
    return null
  }
}

/** Links safe to send to POST /messages `links` field. */
export function extractSendableLinks(text: string): string[] {
  return extractHttpUrls(text).filter((href) => {
    try {
      const url = new URL(href)
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        Boolean(url.hostname.includes(".")) &&
        href.length <= 2000
      )
    } catch {
      return false
    }
  })
}

export function extractHttpUrls(text: string): string[] {
  const found: string[] = []
  const seen = new Set<string>()
  for (const match of text.matchAll(URL_RE)) {
    const href = normalizeHttpUrl(match[1] ?? "")
    if (!href || seen.has(href)) continue
    seen.add(href)
    found.push(href)
  }
  return found
}

export function splitTextAndUrls(text: string): LinkPiece[] {
  const pieces: LinkPiece[] = []
  let last = 0
  for (const match of text.matchAll(URL_RE)) {
    const raw = match[1] ?? ""
    const index = match.index ?? 0
    if (index > last) pieces.push({ text: text.slice(last, index) })
    const href = normalizeHttpUrl(raw)
    const display = raw.replace(/[),.;:!?\]>'"]+$/g, "")
    if (href) pieces.push({ text: display, href })
    else pieces.push({ text: raw })
    last = index + raw.length
  }
  if (last < text.length) pieces.push({ text: text.slice(last) })
  return pieces.length > 0 ? pieces : [{ text }]
}

export function linkHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function faviconUrl(url: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(linkHostname(url))}&sz=64`
}

export function youtubeVideoId(input: string): string | null {
  try {
    const url = new URL(input)
    const host = url.hostname.replace(/^www\./, "")
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? ""
      return isYouTubeId(id) ? id : null
    }
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const v = url.searchParams.get("v")
      if (v && isYouTubeId(v)) return v
      const parts = url.pathname.split("/").filter(Boolean)
      if (
        (parts[0] === "embed" ||
          parts[0] === "shorts" ||
          parts[0] === "live") &&
        parts[1] &&
        isYouTubeId(parts[1])
      ) {
        return parts[1]
      }
    }
  } catch {
    return null
  }
  return null
}

export function youtubeThumbnailUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
}

export function vimeoVideoId(input: string): string | null {
  try {
    const url = new URL(input)
    const host = url.hostname.replace(/^www\./, "")
    if (host !== "vimeo.com" && host !== "player.vimeo.com") return null
    const parts = url.pathname.split("/").filter(Boolean)
    if (host === "player.vimeo.com" && parts[0] === "video" && parts[1]) {
      return /^\d+$/.test(parts[1]) ? parts[1] : null
    }
    const id = parts.find((part) => /^\d+$/.test(part))
    return id || null
  } catch {
    return null
  }
}

export function vimeoEmbedUrl(id: string) {
  return `https://player.vimeo.com/video/${id}`
}

export function isDirectVideoUrl(input: string): boolean {
  try {
    const url = new URL(input)
    if (url.protocol !== "http:" && url.protocol !== "https:") return false
    const path = url.pathname.toLowerCase()
    return /\.(mp4|webm|ogg|ogv|mov|m4v)(?:$|[?#])/i.test(path)
  } catch {
    return false
  }
}

export type PlayableVideoLink =
  | { kind: "youtube"; id: string; embedUrl: string; poster: string }
  | { kind: "vimeo"; id: string; embedUrl: string }
  | { kind: "direct"; src: string }

export function playableVideoLink(input: string): PlayableVideoLink | null {
  const youtubeId = youtubeVideoId(input)
  if (youtubeId) {
    return {
      kind: "youtube",
      id: youtubeId,
      embedUrl: youtubeEmbedUrl(youtubeId),
      poster: youtubeThumbnailUrl(youtubeId),
    }
  }
  const vimeoId = vimeoVideoId(input)
  if (vimeoId) {
    return {
      kind: "vimeo",
      id: vimeoId,
      embedUrl: vimeoEmbedUrl(vimeoId),
    }
  }
  if (isDirectVideoUrl(input)) {
    return { kind: "direct", src: input }
  }
  return null
}

export function isPrivateHttpUrl(input: string) {
  try {
    const url = new URL(input)
    if (url.protocol !== "http:" && url.protocol !== "https:") return true
    const host = url.hostname.toLowerCase().replace(/\.$/, "")
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]"
    ) {
      return true
    }
    if (host.includes(":")) {
      if (
        host === "::1" ||
        host.startsWith("fe80:") ||
        host.startsWith("fc") ||
        host.startsWith("fd")
      ) {
        return true
      }
    }
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/
    if (ipv4.test(host)) {
      const [a, b] = host.split(".").map(Number)
      if (a === 10 || a === 127 || a === 0) return true
      if (a === 169 && b === 254) return true
      if (a === 192 && b === 168) return true
      if (a === 172 && b >= 16 && b <= 31) return true
      if (a === 100 && b >= 64 && b <= 127) return true
    }
    return false
  } catch {
    return true
  }
}

export function parseOpenGraph(html: string, pageUrl: string): LinkPreviewData {
  const title =
    metaContent(html, "og:title") ||
    metaContent(html, "twitter:title") ||
    firstMatch(html, /<title[^>]*>([^<]+)<\/title>/i)
  const description =
    metaContent(html, "og:description") ||
    metaContent(html, "twitter:description") ||
    metaContent(html, "description")
  const imageRaw =
    metaContent(html, "og:image") ||
    metaContent(html, "og:image:secure_url") ||
    metaContent(html, "twitter:image")
  const siteName = metaContent(html, "og:site_name")
  return {
    url: pageUrl,
    title: decodeEntities(title).slice(0, 180) || undefined,
    description: decodeEntities(description).slice(0, 240) || undefined,
    image: resolvePreviewImage(imageRaw, pageUrl),
    siteName: decodeEntities(siteName).slice(0, 80) || undefined,
  }
}

function isYouTubeId(value: string) {
  return /^[\w-]{11}$/.test(value)
}

function metaContent(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`,
      "i"
    ),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ""
}

function firstMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1]?.trim() ?? ""
}

function resolvePreviewImage(raw: string, pageUrl: string) {
  if (!raw) return undefined
  try {
    const href = new URL(raw, pageUrl).href
    if (!/^https?:\/\//i.test(href)) return undefined
    if (isPrivateHttpUrl(href)) return undefined
    return href
  } catch {
    return undefined
  }
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim()
}
