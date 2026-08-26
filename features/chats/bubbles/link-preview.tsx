"use client"

import { ExternalLink, Play } from "lucide-react"
import { useEffect, useState } from "react"

import {
  faviconUrl,
  linkHostname,
  playableVideoLink,
  youtubeThumbnailUrl,
  youtubeVideoId,
  type LinkPreviewData,
  type PlayableVideoLink,
} from "../../../lib/links"
import { cn } from "../../../lib/utils"

const cache = new Map<string, LinkPreviewData>()

export function LinkPreview({
  urls,
  outgoing,
}: {
  urls: string[]
  outgoing: boolean
}) {
  const unique = urls.slice(0, 2)
  if (unique.length === 0) return null
  return (
    <div className="grid gap-2">
      {unique.map((url) => (
        <LinkPreviewCard key={url} url={url} outgoing={outgoing} />
      ))}
    </div>
  )
}

function LinkPreviewCard({
  url,
  outgoing,
}: {
  url: string
  outgoing: boolean
}) {
  const video = playableVideoLink(url)
  if (video) {
    return <PlayableVideoCard url={url} video={video} outgoing={outgoing} />
  }
  return <WebsitePreviewCard url={url} outgoing={outgoing} />
}

function PlayableVideoCard({
  url,
  video,
  outgoing,
}: {
  url: string
  video: PlayableVideoLink
  outgoing: boolean
}) {
  const [playing, setPlaying] = useState(false)
  const [title, setTitle] = useState(
    () => cache.get(url)?.title || (video.kind === "youtube" ? "YouTube" : video.kind === "vimeo" ? "Vimeo" : "Video")
  )
  const site =
    video.kind === "youtube"
      ? "YouTube"
      : video.kind === "vimeo"
        ? "Vimeo"
        : linkHostname(url)

  useEffect(() => {
    if (video.kind !== "youtube") return
    const cached = cache.get(url)
    // Title already comes from useState initializer when cache is warm.
    if (cached?.title && cached.title !== "YouTube") return
    let cancelled = false
    fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { title?: string } | null) => {
        if (cancelled || !data?.title) return
        cache.set(url, {
          url,
          title: data.title,
          siteName: "YouTube",
          image: youtubeThumbnailUrl(video.id),
        })
        setTitle(data.title)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [url, video])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border text-left",
        outgoing
          ? "border-white/25 bg-white/14 text-white"
          : "border-edge bg-surface-2 text-ink"
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-[#111821]">
        {playing || video.kind === "direct" ? (
          video.kind === "direct" ? (
            <video
              src={video.src}
              controls
              playsInline
              preload="metadata"
              className="size-full object-contain"
            />
          ) : (
            <iframe
              src={`${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="size-full border-0"
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="relative block size-full cursor-pointer"
            aria-label={`Play ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                video.kind === "youtube"
                  ? video.poster
                  : `https://vumbnail.com/${video.id}.jpg`
              }
              alt=""
              className="size-full object-cover"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/30">
              <span className="grid size-12 place-items-center rounded-full bg-black/75 text-white shadow-lg">
                <Play className="size-5 fill-white stroke-white" aria-hidden />
              </span>
            </span>
          </button>
        )}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 no-underline transition-opacity hover:opacity-90",
          outgoing ? "text-white" : "text-ink"
        )}
      >
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate font-mono text-[10.5px] uppercase tracking-[0.04em]",
              outgoing ? "text-white/70" : "text-ink-3"
            )}
          >
            {site}
          </span>
          <span className="mt-0.5 block truncate text-[13.5px] font-semibold leading-snug">
            {title}
          </span>
        </span>
        <ExternalLink
          className="size-3.5 shrink-0 opacity-70"
          aria-hidden
        />
        <span className="sr-only">Open in new tab</span>
      </a>
    </div>
  )
}

function WebsitePreviewCard({
  url,
  outgoing,
}: {
  url: string
  outgoing: boolean
}) {
  const youtubeId = youtubeVideoId(url)
  const [preview, setPreview] = useState<LinkPreviewData | null>(
    () => cache.get(url) ?? null
  )

  useEffect(() => {
    if (cache.has(url)) return

    let cancelled = false
    fetch(`/link-preview?url=${encodeURIComponent(url)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: LinkPreviewData | null) => {
        if (cancelled) return
        const next: LinkPreviewData = {
          url,
          title: data?.title,
          description: data?.description,
          image: data?.image,
          siteName: data?.siteName,
        }
        cache.set(url, next)
        setPreview(next)
      })
      .catch(() => {
        if (cancelled) return
        const fallback = { url }
        cache.set(url, fallback)
        setPreview(fallback)
      })
    return () => {
      cancelled = true
    }
  }, [url])

  const host = linkHostname(url)
  const title = preview?.title || host
  const description = preview?.description
  const image = preview?.image
  const site = preview?.siteName || host

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block overflow-hidden rounded-[14px] border text-left no-underline transition-opacity hover:opacity-95",
        outgoing
          ? "border-white/25 bg-white/14 text-white"
          : "border-edge bg-surface-2 text-ink"
      )}
    >
      {image ? (
        <span className="relative block aspect-video overflow-hidden bg-[#111821]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="size-full object-cover" />
          {youtubeId ? (
            <span className="absolute inset-0 grid place-items-center bg-black/25">
              <span className="grid size-11 place-items-center rounded-full bg-black/70 text-white">
                <Play className="size-5 fill-white stroke-white" aria-hidden />
              </span>
            </span>
          ) : null}
        </span>
      ) : null}
      <span className="flex items-start gap-2.5 px-3 py-2.5">
        {!image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconUrl(url)}
            alt=""
            width={18}
            height={18}
            className="mt-0.5 size-[18px] shrink-0 rounded-[4px] bg-white"
          />
        ) : null}
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block truncate font-mono text-[10.5px] uppercase tracking-[0.04em]",
              outgoing ? "text-white/70" : "text-ink-3"
            )}
          >
            {site}
          </span>
          <span className="mt-0.5 block truncate text-[13.5px] font-semibold leading-snug">
            {title}
          </span>
          {description ? (
            <span
              className={cn(
                "mt-0.5 line-clamp-2 text-[12.5px] leading-snug",
                outgoing ? "text-white/75" : "text-ink-2"
              )}
            >
              {description}
            </span>
          ) : null}
        </span>
        <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-70" aria-hidden />
      </span>
    </a>
  )
}
