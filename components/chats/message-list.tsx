"use client"

import { Trash2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { CallLog } from "@/components/chats/bubbles/call-log"
import { FileBubble } from "@/components/chats/bubbles/file-bubble"
import { ImageBubble } from "@/components/chats/bubbles/image-bubble"
import { TextBubble } from "@/components/chats/bubbles/text-bubble"
import { TypingIndicator } from "@/components/chats/bubbles/typing-indicator"
import { VideoNote } from "@/components/chats/bubbles/video-note"
import { VoiceBubble } from "@/components/chats/bubbles/voice-bubble"
import { useChat } from "@/components/chats/chat-provider"
import { UserAvatar } from "@/components/shared/user-avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatMessage, Conversation } from "@/lib/types/chat"
import { SENDER_TONES } from "@/lib/types/chat"
import { cn } from "@/lib/utils"

export function MessageList({ conversation }: { conversation: Conversation }) {
  const { toggleReaction, deleteMessage } = useChat()
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
        {conversation.messages.map((item) => {
          if (item.kind === "day") {
            prevDir = null
            return (
              <div
                key={item.id}
                className="my-[18px] self-center rounded-full border border-edge bg-surface px-[13px] py-[5px] font-mono text-[11px] font-semibold tracking-[0.04em] text-ink-3 uppercase"
              >
                {item.label}
              </div>
            )
          }

          if (item.kind === "call") {
            prevDir = null
            return <CallLog key={item.id} item={item} />
          }

          if (item.kind === "typing") {
            return <TypingIndicator key={item.id} conversation={conversation} />
          }

          const outgoing = item.dir === "out"
          const gap = prevDir !== null && prevDir !== item.dir
          prevDir = item.dir
          const showAvatar = !outgoing && Boolean(conversation.group)

          return (
            <div
              key={item.id}
              className={cn(
                "flex max-w-full items-end gap-2.5",
                outgoing && "flex-row-reverse",
                gap && "mt-3.5"
              )}
            >
              {!outgoing ? (
                showAvatar ? (
                  <UserAvatar
                    initials={item.senderInitials || conversation.initials}
                    tone={item.senderTone || conversation.tone}
                    size="xs"
                    className="mb-0.5"
                  />
                ) : (
                  <span className="w-[30px] shrink-0" />
                )
              ) : null}
              <div
                className={cn(
                  "flex min-w-0 max-w-[min(560px,74%)] flex-col gap-[3px] max-[859px]:max-w-[82%] max-[479px]:max-w-[88%]",
                  outgoing && "items-end"
                )}
              >
                {showAvatar && item.senderName ? (
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
            </div>
          )
        })}
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
