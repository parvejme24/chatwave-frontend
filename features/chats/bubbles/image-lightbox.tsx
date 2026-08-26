"use client"

import { X } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"

import { cn } from "../../../lib/utils"

function subscribe() {
  return () => undefined
}

export function ImageLightbox({
  src,
  alt,
  open,
  onClose,
}: {
  src: string
  alt?: string
  open: boolean
  onClose: () => void
}) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!mounted || !open || !src) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
      className="fixed inset-0 z-100 flex cursor-pointer items-center justify-center bg-[rgba(10,14,20,0.88)] p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute top-4 right-4 grid size-10 cursor-pointer place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-5 stroke-[1.75]" aria-hidden />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || "Photo"}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "max-h-[min(92dvh,920px)] max-w-[min(96vw,1100px)] cursor-default rounded-[12px] object-contain shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        )}
      />
    </div>,
    document.body
  )
}

export function PreviewableImage({
  src,
  alt,
  className,
}: {
  src: string
  alt?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `Preview ${alt}` : "Preview image"}
        className="block w-full cursor-zoom-in overflow-hidden rounded-[inherit] p-0 text-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || "Photo"} className={className} />
      </button>
      <ImageLightbox
        src={src}
        alt={alt}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
