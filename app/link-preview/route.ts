import { NextResponse } from "next/server"

import {
  isPrivateHttpUrl,
  normalizeHttpUrl,
  parseOpenGraph,
  youtubeThumbnailUrl,
  youtubeVideoId,
} from "../../lib/links"

export const dynamic = "force-dynamic"

const MAX_HTML_BYTES = 512_000

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")
  const target = raw ? normalizeHttpUrl(raw) : null
  if (!target || isPrivateHttpUrl(target)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  try {
    const youtube = await youtubePreview(target)
    if (youtube) return NextResponse.json(youtube)

    const html = await readPublicHtml(target)
    if (!html) {
      return NextResponse.json({ url: target })
    }
    return NextResponse.json(parseOpenGraph(html, target))
  } catch {
    return NextResponse.json({ url: target })
  }
}

async function youtubePreview(target: string) {
  const id = youtubeVideoId(target)
  if (!id) return null

  const base = {
    url: target,
    title: "YouTube",
    siteName: "YouTube",
    image: youtubeThumbnailUrl(id),
  }

  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(target)}&format=json`,
      { signal: AbortSignal.timeout(4000) }
    )
    if (!response.ok) return base
    const data = (await response.json()) as { title?: string; author_name?: string }
    return {
      ...base,
      title: data.title || base.title,
      description: data.author_name || undefined,
    }
  } catch {
    return base
  }
}

async function readPublicHtml(startUrl: string) {
  let current = startUrl
  for (let hop = 0; hop < 3; hop += 1) {
    if (isPrivateHttpUrl(current)) return ""
    const response = await fetch(current, {
      redirect: "manual",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; ChatWaveLinkPreview/1.0; +https://chatwave.app)",
      },
      signal: AbortSignal.timeout(5000),
    })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location")
      if (!location) return ""
      current = new URL(location, current).href
      continue
    }
    if (!response.ok) return ""
    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("html") && !contentType.includes("xml")) return ""
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_HTML_BYTES) return ""
    return new TextDecoder("utf-8").decode(buffer)
  }
  return ""
}
