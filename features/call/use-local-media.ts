"use client"

import { useEffect, useState } from "react"

export function useLocalMedia(active: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !navigator.mediaDevices) {
      setStream(null)
      return
    }

    let current: MediaStream | null = null
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((next) => {
        if (cancelled) {
          next.getTracks().forEach((track) => track.stop())
          return
        }
        current = next
        setStream(next)
      })
      .catch(() => {
        if (!cancelled) setStream(null)
      })

    return () => {
      cancelled = true
      current?.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [active])

  return stream
}
