"use client"

import { useCallback, useEffect, useState } from "react"

export type CallMedia = {
  camera: MediaStream | null
  screen: MediaStream | null
  display: MediaStream | null
  sharing: boolean
  muted: boolean
  cameraOff: boolean
  setMuted: (value: boolean) => void
  setCameraOff: (value: boolean) => void
  startShare: () => Promise<void>
  stopShare: () => void
  stopAll: () => void
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

export function useCallMedia(kind: "audio" | "video"): CallMedia {
  const [camera, setCamera] = useState<MediaStream | null>(null)
  const [screen, setScreen] = useState<MediaStream | null>(null)
  const [muted, setMutedState] = useState(false)
  const [cameraOff, setCameraOffState] = useState(kind === "audio")

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return
    }

    let current: MediaStream | null = null
    let cancelled = false
    const wantVideo = kind === "video" && !cameraOff

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: wantVideo
          ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
          : false,
      })
      .then((next) => {
        if (cancelled) {
          stopStream(next)
          return
        }
        next.getAudioTracks().forEach((track) => {
          track.enabled = !muted
        })
        current = next
        setCamera(next)
      })
      .catch(() => {
        if (!cancelled) setCamera(null)
      })

    return () => {
      cancelled = true
      stopStream(current)
      setCamera(null)
    }
    // Re-acquire when camera toggles or call kind changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, cameraOff])

  useEffect(() => {
    camera?.getAudioTracks().forEach((track) => {
      track.enabled = !muted
    })
  }, [camera, muted])

  const stopShare = useCallback(() => {
    setScreen((current) => {
      if (!current) return null
      // Detach ended listeners conceptually by clearing first; then stop tracks.
      // Stopping tracks must not hang up the call — only the screen stream ends.
      current.getTracks().forEach((track) => {
        track.onended = null
        track.stop()
      })
      return null
    })
  }, [])

  const startShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("Screen sharing is not supported in this browser")
    }
    const next = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: false,
    })
    setScreen((previous) => {
      previous?.getTracks().forEach((track) => {
        track.onended = null
        track.stop()
      })
      return next
    })
    const [track] = next.getVideoTracks()
    if (track) {
      track.onended = () => {
        setScreen((current) => (current === next ? null : current))
      }
    }
  }, [])

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value)
  }, [])

  const setCameraOff = useCallback((value: boolean) => {
    setCameraOffState(value)
  }, [])

  const stopAll = useCallback(() => {
    stopShare()
    setCamera((current) => {
      stopStream(current)
      return null
    })
  }, [stopShare])

  const display = screen ?? (kind === "video" && !cameraOff ? camera : null)

  return {
    camera,
    screen,
    display,
    sharing: Boolean(screen),
    muted,
    cameraOff,
    setMuted,
    setCameraOff,
    startShare,
    stopShare,
    stopAll,
  }
}
