"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { CallLog } from "./bubbles/call-log"
import { FileBubble } from "./bubbles/file-bubble"
import { ImageBubble } from "./bubbles/image-bubble"
import { TextBubble } from "./bubbles/text-bubble"
import { TypingIndicator } from "./bubbles/typing-indicator"
import { VideoNote } from "./bubbles/video-note"
import { VoiceBubble } from "./bubbles/voice-bubble"
import { useChat } from "./chat-provider"
import { signalEase } from "../../components/motion/motion-item"
import { useSettings } from "../settings/settings-provider"
import { UserAvatar } from "../../components/shared/user-avatar"
import { ScrollArea } from "../../components/ui/scroll-area"
import { profileHandle } from "../../lib/data/settings"
import type { ChatMessage, Conversation, ProfilePerson } from "../../lib/types/chat"
import { SENDER_TONES } from "../../lib/types/chat"
import { cn } from "../../lib/utils"

export function MessageList({ conversation }: { conversation: Conversation }) {
  const { toggleReaction, deleteMessage, openProfile } = useChat()
  const { profile } = useSettings()
  const reduceMotion = useReducedMotion()
  const endRef = useRef<HTMLDivElement>(null)
  const lastId = conversation.messages.at(-1)?.id
  const lastOutgoing = [...conversation.messages]
    .reverse()
    .find((item) => item.kind === "message" && item.dir === "out")
  const lastStatus =
    lastOutgoing && lastOutgoing.kind === "message" ? lastOutgoing.status : null

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [conversation.id, lastId, lastStatus])

  let prevDir: "in" | "out" | null = null

  return (
    <ScrollArea className="h-full min-h-0 flex-1">
      <div
        className="flex flex-col gap-[3px] px-6 pt-5 pb-2 max-[859px]:px-3.5 max-[859px]:pt-4"
        role="log"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
        {conversation.messages.map((item) => {
          if (item.kind === "day") {
            prevDir = null
            return (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: signalEase }}
                className="my-[18px] self-center rounded-full border border-edge bg-surface px-[13px] py-[5px] font-mono text-[11px] font-semibold tracking-[0.04em] text-ink-3 uppercase"
              >
                {item.label}
              </motion.div>
            )
          }

          if (item.kind === "call") {
            prevDir = null
            return (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.22, ease: signalEase }}
                className="self-center"
              >
                <CallLog item={item} />
              </motion.div>
            )
          }

          if (item.kind === "typing") {
            return (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                transition={{ duration: 0.22, ease: signalEase }}
              >
                <TypingIndicator conversation={conversation} />
              </motion.div>
            )
          }

          const outgoing = item.dir === "out"
          const gap = prevDir !== null && prevDir !== item.dir
          prevDir = item.dir
          const showSenderName = !outgoing && Boolean(conversation.group)
          const bubblePerson: ProfilePerson = outgoing
            ? {
                conversationId: conversation.id,
                name: profile.name,
                initials: profile.initials,
                tone: profile.tone,
                photo: profile.photo,
                sub: profileHandle(profile),
                status: "Online",
                isMe: true,
              }
            : {
                conversationId: conversation.id,
                name: item.senderName || conversation.name,
                initials: item.senderInitials || conversation.initials,
                tone: item.senderTone || conversation.tone,
                presence: conversation.group ? undefined : conversation.presence,
                status: conversation.group
                  ? `Member of ${conversation.name}`
                  : conversation.status,
                sub: conversation.group
                  ? conversation.sub
                  : conversation.sub,
              }

          return (
            <motion.div
              key={item.id}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 12, x: outgoing ? 16 : -16, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, y: -8, scale: 0.96 }
              }
              transition={{ duration: 0.28, ease: signalEase }}
              className={cn(
                "flex max-w-full items-end gap-2.5",
                outgoing && "flex-row-reverse",
                gap && "mt-3.5"
              )}
            >
              <motion.button
                type="button"
                aria-label={`Open ${bubblePerson.name} profile`}
                onClick={() => openProfile(bubblePerson)}
                whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                transition={{ duration: 0.16, ease: signalEase }}
                className="mb-0.5 shrink-0 cursor-pointer rounded-full"
              >
                <UserAvatar
                  initials={bubblePerson.initials}
                  tone={bubblePerson.tone}
                  photo={bubblePerson.photo}
                  size="xs"
                />
              </motion.button>
              <div
                className={cn(
                  "flex min-w-0 max-w-[min(560px,74%)] flex-col gap-[3px] max-[859px]:max-w-[82%] max-[479px]:max-w-[88%]",
                  outgoing && "items-end"
                )}
              >
                {showSenderName && item.senderName ? (
                  <span
                    className={cn(
                      "px-1 text-xs font-semibold",
                      SENDER_TONES[item.senderTone || conversation.tone]
                    )}
                  >
                    {item.senderName}
                  </span>
                ) : null}
                <div
                  className={cn(
                    "group flex items-end gap-1.5",
                    outgoing && "flex-row-reverse"
                  )}
                >
                  <MessageBody message={item} outgoing={outgoing} />
                  <button
                    type="button"
                    aria-label="Delete message"
                    onClick={() => {
                      deleteMessage(conversation.id, item.id)
                      toast("Message deleted")
                    }}
                    className="mb-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-[8px] text-ink-4 opacity-70 transition-opacity hover:bg-surface-2 hover:text-pulse focus-visible:opacity-100 max-[859px]:opacity-70 min-[860px]:opacity-0 min-[860px]:group-hover:opacity-100 min-[860px]:group-focus-within:opacity-100"
                  >
                    <Trash2 className="size-3.5 stroke-[1.75]" aria-hidden />
                  </button>
                </div>
                {item.reactions?.length ? (
                  <div className="flex gap-1 px-1">
                    {item.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        type="button"
                        onClick={() =>
                          toggleReaction(conversation.id, item.id, reaction.emoji)
                        }
                        className={cn(
                          "inline-flex h-[25px] cursor-pointer items-center gap-1 rounded-full border bg-surface px-2 text-[12.5px] shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
                          reaction.mine
                            ? "border-signal bg-signal-wash"
                            : "border-edge hover:border-edge-2"
                        )}
                      >
                        {reaction.emoji}
                        <span className="font-mono text-[11px] text-ink-3">
                          {reaction.count}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )
        })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </ScrollArea>
  )
}

function MessageBody({
  message,
  outgoing,
}: {
  message: ChatMessage
  outgoing: boolean
}) {
  switch (message.type) {
    case "image":
      return <ImageBubble message={message} outgoing={outgoing} />
    case "file":
      return <FileBubble message={message} outgoing={outgoing} />
    case "voice":
      return <VoiceBubble message={message} outgoing={outgoing} />
    case "video_note":
      return <VideoNote duration={message.duration} />
    default:
      return <TextBubble message={message} outgoing={outgoing} />
  }
}
