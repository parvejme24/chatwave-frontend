"use client"

import { Send, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "../../components/ui/button"
import type { RecordKind } from "../../lib/types/chat"
import { fmtTime } from "../../lib/waveform"

export type RecordingPayload = {
  file: File
  duration: number
}

type RecorderProps = {
  kind: RecordKind
  onCancel: () => void
  onSend: (payload: RecordingPayload) => void
}

const MAX_SECONDS = 300

function pickMime(kind: RecordKind) {
  if (typeof MediaRecorder === "undefined") return ""
  const types =
    kind === "voice"
      ? ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
      : ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp9,opus", "video/webm", "video/mp4"]
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
}

function cleanMime(mime: string) {
  return mime.split(";")[0].trim()
}

function extensionFor(mime: string, kind: RecordKind) {
  const type = cleanMime(mime)
  if (type.includes("mp4")) return kind === "voice" ? "m4a" : "mp4"
  if (type.includes("ogg")) return "ogg"
  return "webm"
}

async function captureStream(kind: RecordKind) {
  if (kind === "voice") {
    return navigator.mediaDevices.getUserMedia({ audio: true })
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 480 },
        height: { ideal: 480 },
      },
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  }
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop())
}

export function Recorder({ kind, onCancel, onSend }: RecorderProps) {
  const [seconds, setSeconds] = useState(0)
  const [bars, setBars] = useState<number[]>([])
  const [ready, setReady] = useState(false)
  const [sending, setSending] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const secondsRef = useRef(0)
  const onSendRef = useRef(onSend)
  const onCancelRef = useRef(onCancel)

  useEffect(() => {
    onSendRef.current = onSend
    onCancelRef.current = onCancel
  }, [onCancel, onSend])

  useEffect(() => {
    let cancelled = false
    let timer = 0
    let analyserFrame = 0
    let audioContext: AudioContext | null = null
    try {
      if (typeof AudioContext !== "undefined") audioContext = new AudioContext()
    } catch {
      audioContext = null
    }

    async function start() {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        toast.error("Recording is not supported in this browser")
        onCancelRef.current()
        return
      }

      try {
        const stream = await captureStream(kind)
        if (cancelled) {
          stopStream(stream)
          return
        }
        streamRef.current = stream
        if (audioContext?.state === "suspended") void audioContext.resume()
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          void videoRef.current.play()
        }

        const mime = pickMime(kind)
        let recorder: MediaRecorder
        try {
          recorder = mime
            ? new MediaRecorder(stream, { mimeType: mime })
            : new MediaRecorder(stream)
        } catch {
          recorder = new MediaRecorder(stream)
        }
        recorderRef.current = recorder
        chunksRef.current = []
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data)
        }
        recorder.start(200)
        setReady(true)

        try {
          const source = audioContext
            ? audioContext.createMediaStreamSource(stream)
            : null
          const analyser = audioContext ? audioContext.createAnalyser() : null
          if (source && analyser) {
            analyser.fftSize = 64
            source.connect(analyser)
            const data = new Uint8Array(analyser.frequencyBinCount)
            const tick = () => {
              analyser.getByteFrequencyData(data)
              const level =
                data.reduce((sum, value) => sum + value, 0) / data.length
              setBars((current) => {
                const next = [...current, 6 + (level / 255) * 26]
                return next.length > 68 ? next.slice(-68) : next
              })
              analyserFrame = window.requestAnimationFrame(tick)
            }
            analyserFrame = window.requestAnimationFrame(tick)
          }
        } catch {
          /* waveform is optional; recording can continue */
        }

        timer = window.setInterval(() => {
          secondsRef.current = Math.round((secondsRef.current + 0.1) * 10) / 10
          setSeconds(secondsRef.current)
          if (secondsRef.current >= MAX_SECONDS) {
            window.clearInterval(timer)
            finish(true)
          }
        }, 100)
      } catch {
        toast.error(
          kind === "voice"
            ? "Allow microphone access to record a voice message"
            : "Allow camera and microphone access to record a video message"
        )
        onCancelRef.current()
      }
    }

    void start()

    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.cancelAnimationFrame(analyserFrame)
      void audioContext?.close()
      const recorder = recorderRef.current
      if (recorder && recorder.state !== "inactive") recorder.stop()
      stopStream(streamRef.current)
      streamRef.current = null
    }
  }, [kind])

  function finish(send: boolean) {
    if (sending) return
    const recorder = recorderRef.current
    const duration = Math.max(secondsRef.current, 0.1)
    if (!recorder || recorder.state === "inactive") {
      if (!send) onCancel()
      return
    }
    if (send && duration < 0.5) {
      toast.error("Hold a little longer before sending")
      return
    }
    if (send) setSending(true)
    recorder.onstop = () => {
      stopStream(streamRef.current)
      streamRef.current = null
      if (!send) {
        chunksRef.current = []
        toast("Recording discarded")
        onCancel()
        return
      }
      const rawMime =
        recorder.mimeType ||
        pickMime(kind) ||
        (kind === "voice" ? "audio/webm" : "video/webm")
      const mime = cleanMime(rawMime)
      const blob = new Blob(chunksRef.current, { type: mime })
      chunksRef.current = []
      if (blob.size < 64) {
        setSending(false)
        toast.error("Recording was empty. Try again.")
        onCancel()
        return
      }
      const file = new File(
        [blob],
        `${kind === "voice" ? "voice" : "video"}.${extensionFor(mime, kind)}`,
        { type: mime }
      )
      onSendRef.current({ file, duration: Math.max(1, Math.round(duration)) })
    }
    try {
      if (recorder.state === "recording") recorder.requestData()
    } catch {
      /* Safari may not implement requestData */
    }
    recorder.stop()
  }

  return (
    <div
      className="flex items-center gap-3.5 rounded-[28px] border border-pulse bg-pulse-wash px-3.5 py-2.5 max-[859px]:gap-[9px] max-[859px]:px-2.5"
      role="status"
    >
      <i
        className="cw-motion size-[11px] shrink-0 rounded-full bg-pulse"
        style={{ animation: "cw-rec 1.25s ease-in-out infinite" }}
        aria-hidden
      />
      {kind === "video" ? (
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="size-10 shrink-0 rounded-[10px] object-cover"
        />
      ) : null}
      <span className="font-mono text-sm font-semibold text-pulse">
        {fmtTime(seconds)}
      </span>
      <div className="flex h-[34px] flex-1 items-center gap-0.5 overflow-hidden">
        {bars.map((height, index) => (
          <i
            key={`${index}-${height}`}
            className="w-[3px] shrink-0 rounded-full bg-pulse opacity-75"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => finish(false)}
          disabled={sending}
          aria-label="Discard recording"
          className="h-[38px] rounded-[14px] border border-edge px-[18px] text-ink-2 hover:bg-surface-2 max-[859px]:w-[38px] max-[859px]:px-0"
        >
          <Trash2 className="size-4 stroke-[1.75]" aria-hidden />
          <span className="max-[859px]:hidden">Cancel</span>
        </Button>
        <Button
          type="button"
          onClick={() => finish(true)}
          disabled={!ready || sending}
          className="h-[38px] rounded-[14px] bg-signal px-[18px] text-white hover:bg-signal-deep"
        >
          <Send className="size-4 stroke-[1.75]" aria-hidden />
          Send
        </Button>
      </div>
      <span className="sr-only">
        Recording {kind === "voice" ? "voice" : "video"} message
      </span>
    </div>
  )
}
