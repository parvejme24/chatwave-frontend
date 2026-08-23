"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Mic, Paperclip, Send, Smile, Video } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { EmojiPicker } from "./emoji-picker"
import { IconBtn } from "../../components/layout/icon-btn"
import { useChat } from "./chat-provider"
import { Recorder } from "./recorder"
import { signalEase } from "../../components/motion/motion-item"
import { playSound } from "../../lib/sounds"
import type { RecordKind } from "../../lib/types/chat"
import { cn } from "../../lib/utils"

export function Composer({ conversationId }: { conversationId: string }) {
  const { sendText, sendRecording } = useChat()
  const [value, setValue] = useState("")
  const [recording, setRecording] = useState<RecordKind | null>(null)
  const [online, setOnline] = useState(true)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 148)}px`
  }, [value])

  useEffect(() => {
    const goOffline = () => setOnline(false)
    const goOnline = () => {
      setOnline(true)
      toast("Back online — queued messages sent")
    }
    window.addEventListener("offline", goOffline)
    window.addEventListener("online", goOnline)
    setOnline(navigator.onLine)
    return () => {
      window.removeEventListener("offline", goOffline)
      window.removeEventListener("online", goOnline)
    }
  }, [])

  useEffect(() => {
    if (!emojiOpen) return

    function onPointer(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setEmojiOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setEmojiOpen(false)
    }

    window.addEventListener("pointerdown", onPointer)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("pointerdown", onPointer)
      window.removeEventListener("keydown", onKey)
    }
  }, [emojiOpen])

  function send() {
    const text = value.trim()
    if (!text) return
    sendText(conversationId, text)
    setValue("")
  }

  function insertEmoji(emoji: string) {
    const field = inputRef.current
    const start = field?.selectionStart ?? value.length
    const end = field?.selectionEnd ?? value.length
    const next = `${value.slice(0, start)}${emoji}${value.slice(end)}`
    setValue(next)
    requestAnimationFrame(() => {
      field?.focus()
      const caret = start + emoji.length
      field?.setSelectionRange(caret, caret)
    })
  }

  function startRecording(kind: RecordKind) {
    setRecording(kind)
    toast(kind === "voice" ? "Recording voice message" : "Recording video message")
  }

  return (
    <footer className="shrink-0 border-t border-edge bg-surface px-5 pt-3 pb-4 max-[859px]:px-3 max-[859px]:pt-2.5 max-[859px]:pb-[calc(12px+env(safe-area-inset-bottom))]">
      <AnimatePresence mode="wait" initial={false}>
      {recording ? (
        <motion.div
          key="recorder"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
          transition={{ duration: 0.2, ease: signalEase }}
        >
          <Recorder
            kind={recording}
            onCancel={() => {
              setRecording(null)
              toast("Recording discarded")
            }}
            onSend={(duration) => {
              sendRecording(conversationId, recording, duration)
              toast(
                recording === "voice" ? "Voice message sent" : "Video message sent"
              )
              setRecording(null)
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="composer"
          ref={wrapRef}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 6 }}
          transition={{ duration: 0.2, ease: signalEase }}
          className="relative flex items-end gap-2 rounded-[28px] border border-edge bg-surface-2 py-1.5 pr-1.5 pl-2 transition-[border-color,box-shadow,background-color] focus-within:border-signal focus-within:bg-surface focus-within:shadow-[0_0_0_3px_var(--signal-wash)]"
        >
          <AnimatePresence>
            {emojiOpen ? (
              <EmojiPicker
                key="emoji-picker"
                onPick={insertEmoji}
                onClose={() => setEmojiOpen(false)}
              />
            ) : null}
          </AnimatePresence>
          <IconBtn
            aria-label="Attach file"
            onClick={() => toast("Attach a file")}
          >
            <Paperclip className="size-5 stroke-[1.75]" aria-hidden />
          </IconBtn>
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              if (event.target.value) playSound("typing")
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
            placeholder="Write a message"
            aria-label="Message"
            className="max-h-[148px] min-h-[34px] flex-1 resize-none bg-transparent py-[7px] text-[15px] leading-[1.45] text-ink outline-none placeholder:text-ink-4"
          />
          <div className="flex items-center">
            <IconBtn
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
              active={emojiOpen}
              onClick={() => setEmojiOpen((open) => !open)}
            >
              <Smile className="size-5 stroke-[1.75]" aria-hidden />
            </IconBtn>
            <IconBtn
              aria-label="Record video message"
              onClick={() => startRecording("video")}
            >
              <Video className="size-5 stroke-[1.75]" aria-hidden />
            </IconBtn>
            <IconBtn
              aria-label="Record voice message"
              onClick={() => startRecording("voice")}
            >
              <Mic className="size-5 stroke-[1.75]" aria-hidden />
            </IconBtn>
            <button
              type="button"
              aria-label="Send message"
              disabled={!value.trim()}
              onClick={send}
              className={cn(
                "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-signal text-white transition-transform hover:scale-105 hover:bg-signal-deep disabled:cursor-not-allowed disabled:bg-edge-2 disabled:text-ink-4 disabled:hover:scale-100"
              )}
            >
              <Send className="size-4 stroke-[1.75]" aria-hidden />
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="mt-[7px] flex justify-between px-2 text-[11.5px] text-ink-4 max-[859px]:hidden">
        <span>
          <kbd className="rounded-[5px] border border-edge bg-surface-2 px-[5px] py-px font-mono text-[10.5px]">
            Enter
          </kbd>{" "}
          send ·{" "}
          <kbd className="rounded-[5px] border border-edge bg-surface-2 px-[5px] py-px font-mono text-[10.5px]">
            Shift
          </kbd>
          +
          <kbd className="rounded-[5px] border border-edge bg-surface-2 px-[5px] py-px font-mono text-[10.5px]">
            Enter
          </kbd>{" "}
          new line
        </span>
        <span className={cn(!online && "text-pulse")}>
          {online ? "Connected" : "Reconnecting…"}
        </span>
      </div>
    </footer>
  )
}
