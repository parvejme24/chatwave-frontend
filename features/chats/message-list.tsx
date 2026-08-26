"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { EyeOff, Pin, Search, Trash2, Users } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"

import { CallLog } from "./bubbles/call-log"
import { AttachmentsBubble } from "./bubbles/attachments-bubble"
import { FileBubble } from "./bubbles/file-bubble"
import { ImageBubble } from "./bubbles/image-bubble"
import { TextBubble } from "./bubbles/text-bubble"
import { TypingIndicator } from "./bubbles/typing-indicator"
import { VideoFileBubble } from "./bubbles/video-file-bubble"
import { VideoNote } from "./bubbles/video-note"
import { VoiceBubble } from "./bubbles/voice-bubble"
import { MessageMeta, SendingLabel } from "./bubbles/message-meta"
import { SeenByRow } from "./bubbles/seen-by"
import { chatActionError, useChat } from "./chat-provider"
import { signalEase } from "../../components/motion/motion-item"
import { useSettings } from "../settings/settings-provider"
import { UserAvatar } from "../../components/shared/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { ScrollArea } from "../../components/ui/scroll-area"
import { profileHandle } from "../../lib/data/settings"
import { useGetConversationMembersQuery } from "../../lib/store/conversations-api"
import { useAppSelector } from "../../lib/store/hooks"
import { looksLikeVideoFile } from "../../lib/files"
import type {
  ChatMessage,
  Conversation,
  ProfilePerson,
  ThreadView,
} from "../../lib/types/chat"
import {
  filterThreadItems,
  isOutgoingMessage,
  resolveSeenPeople,
  SENDER_TONES,
} from "../../lib/types/chat"
import { cn } from "../../lib/utils"

export function MessageList({
  conversation,
  view = "all",
  query = "",
}: {
  conversation: Conversation
  view?: ThreadView
  query?: string
}) {
  const { toggleReaction, togglePinMessage, deleteMessage, openProfile, me } =
    useChat()
  const { data: members } = useGetConversationMembersQuery(conversation.id, {
    skip: !conversation.id || !conversation.group,
  })
  const thread = {
    ...conversation,
    members: members ?? conversation.members,
  }
  const { profile } = useSettings()
  const reduceMotion = useReducedMotion()
  const endRef = useRef<HTMLDivElement>(null)
  const typing = useAppSelector(
    (state) => state.realtime.typing[conversation.id]
  )
  const items = useMemo(() => {
    const next = filterThreadItems(conversation.messages, view, query)
    if (typing && view === "all" && !query.trim()) {
      next.push({ id: `typing-${typing.userId}`, kind: "typing" })
    }
    return next
  }, [conversation.messages, query, typing, view])
  const lastId = items.at(-1)?.id
  const lastOutgoing = [...items]
    .reverse()
    .find(
      (item) =>
        item.kind === "message" && isOutgoingMessage(item, me.id)
    )
  const lastStatus =
    lastOutgoing && lastOutgoing.kind === "message" ? lastOutgoing.status : null
  const filtering = view === "pinned" || query.trim().length > 0

  useEffect(() => {
    if (filtering) return
    endRef.current?.scrollIntoView({ block: "end" })
  }, [conversation.id, filtering, lastId, lastStatus])

  const visibleMessages = items.filter((item) => item.kind === "message")

  return (
    <ScrollArea className="h-full min-h-0 flex-1">
      <div
        className="flex flex-col gap-[3px] px-6 pt-5 pb-2 max-[859px]:px-3.5 max-[859px]:pt-4"
        role="log"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
        {!visibleMessages.length && filtering ? (
          <motion.div
            key="thread-empty"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center px-5 py-16 text-center"
          >
            <div className="mb-2.5 grid size-[68px] place-items-center rounded-[20px] border border-edge bg-surface text-ink-4 shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
              {view === "pinned" && !query.trim() ? (
                <Pin className="size-7 stroke-[1.75]" aria-hidden />
              ) : (
                <Search className="size-7 stroke-[1.75]" aria-hidden />
              )}
            </div>
            <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
              {view === "pinned" && !query.trim()
                ? "No pinned messages"
                : "No matches"}
            </h3>
            <p className="mt-1.5 max-w-[240px] text-[13.5px] leading-5 text-ink-3">
              {view === "pinned" && !query.trim()
                ? "Pin a message in this chat to keep it here."
                : `Nothing in this conversation matches “${query.trim()}”.`}
            </p>
          </motion.div>
        ) : !visibleMessages.length ? (
          <p className="px-5 py-16 text-center text-sm text-ink-3">
            No messages yet. Say hello.
          </p>
        ) : null}
        {items.map((item, index) => {
          const previous = items[index - 1]
          const prevDir =
            previous?.kind === "message"
              ? isOutgoingMessage(previous, me.id)
                ? "out"
                : "in"
              : null
          if (item.kind === "day") {
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
                <TypingIndicator
                  conversation={conversation}
                  name={typing?.name}
                  initials={typing?.initials}
                  tone={typing?.tone}
                />
              </motion.div>
            )
          }

          if (item.type === "system") {
            return (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2, ease: signalEase }}
                className="my-2 flex w-full justify-center px-8 max-[859px]:px-5"
              >
                <div className="w-full max-w-[260px] text-center max-[479px]:max-w-[220px]">
                  <p className="text-[11px] leading-[1.35] text-ink-4 [overflow-wrap:anywhere]">
                    {item.text}
                  </p>
                  {item.time ? (
                    <span className="mt-0.5 block font-mono text-[9.5px] tracking-[0.02em] text-ink-4/65">
                      {item.time}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            )
          }

          const outgoing = isOutgoingMessage(item, me.id)
          const gap = prevDir !== null && prevDir !== item.dir
          const showSenderName = !outgoing && Boolean(conversation.group)
          const bubblePerson: ProfilePerson = outgoing
            ? {
                conversationId: conversation.id,
                name: profile.name,
                initials: profile.initials,
                tone: profile.tone,
                photo: profile.photo || me.photoUrl,
                sub: profileHandle(profile),
                status: "Online",
                isMe: true,
              }
            : {
                conversationId: conversation.id,
                name: item.senderName || conversation.name,
                initials: item.senderInitials || conversation.initials,
                tone: item.senderTone || conversation.tone,
                photo: item.senderPhoto,
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
                gap && "mt-3.5",
                outgoing && item.status === "sending" && "opacity-80"
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
                {item.pinned ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-1 text-[11px] font-medium text-ink-3",
                      outgoing && "flex-row-reverse"
                    )}
                  >
                    <Pin className="size-3 stroke-[1.75]" aria-hidden />
                    Pinned
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
                    aria-label={item.pinned ? "Unpin message" : "Pin message"}
                    onClick={() => {
                      void togglePinMessage(conversation.id, item.id)
                        .then(() =>
                          toast(item.pinned ? "Message unpinned" : "Message pinned")
                        )
                        .catch((error) =>
                          toast.error(chatActionError(error, "Could not pin message"))
                        )
                    }}
                    className={cn(
                      "mb-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-[8px] transition-opacity hover:bg-surface-2 hover:text-ink focus-visible:opacity-100 max-[859px]:opacity-70 min-[860px]:opacity-0 min-[860px]:group-hover:opacity-100 min-[860px]:group-focus-within:opacity-100",
                      item.pinned ? "text-signal opacity-100" : "text-ink-4 opacity-70"
                    )}
                  >
                    <Pin
                      className={cn(
                        "size-3.5 stroke-[1.75]",
                        item.pinned && "fill-current"
                      )}
                      aria-hidden
                    />
                  </button>
                  <DeleteMessageButton
                    outgoing={outgoing}
                    onDelete={(scope) => {
                      void deleteMessage(conversation.id, item.id, scope)
                        .then(() =>
                          toast(
                            scope === "everyone"
                              ? "Message deleted for everyone"
                              : "Message deleted"
                          )
                        )
                        .catch((error) =>
                          toast.error(
                            chatActionError(error, "Could not delete message")
                          )
                        )
                    }}
                  />
                </div>
                {item.reactions?.length ? (
                  <div className="flex gap-1 px-1">
                    {item.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        type="button"
                        onClick={() =>
                          void toggleReaction(
                            conversation.id,
                            item.id,
                            reaction.emoji
                          ).catch((error) =>
                            toast.error(
                              chatActionError(error, "Could not update reaction")
                            )
                          )
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
                <MessageMeta
                  time={item.time}
                  status={item.status}
                  outgoing={outgoing}
                  latest={lastOutgoing?.id === item.id}
                  seen={Boolean(
                    item.status === "seen" ||
                      (item.seenCount && item.seenCount > 0) ||
                      item.seenBy?.length
                  )}
                />
                {outgoing ? (
                  <SeenByRow
                    people={resolveSeenPeople(item, thread, me.id)}
                    count={item.seenCount}
                  />
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
  const multi =
    (message.attachments?.length ?? 0) > 1 ||
    message.attachments?.some((item) => item.kind === "link")
  if (multi) {
    return <AttachmentsBubble message={message} outgoing={outgoing} />
  }

  switch (message.type) {
    case "image":
      return <ImageBubble message={message} outgoing={outgoing} />
    case "video":
      return <VideoFileBubble message={message} outgoing={outgoing} />
    case "file":
      if (looksLikeVideoFile(message.fileName || message.mediaUrl)) {
        return <VideoFileBubble message={message} outgoing={outgoing} />
      }
      if (message.attachments?.length) {
        return <AttachmentsBubble message={message} outgoing={outgoing} />
      }
      return <FileBubble message={message} outgoing={outgoing} />
    case "voice":
      return <VoiceBubble message={message} outgoing={outgoing} />
    case "video_note":
      return (
        <div className="relative">
          <VideoNote duration={message.duration} src={message.mediaUrl} />
          {outgoing && message.status === "sending" ? (
            <span className="absolute inset-0 grid place-items-center rounded-[18px] bg-[rgba(10,14,20,0.55)] font-mono text-[12px] font-semibold text-white">
              <SendingLabel />
            </span>
          ) : null}
        </div>
      )
    default:
      return <TextBubble message={message} outgoing={outgoing} />
  }
}

const deleteTriggerClass =
  "mb-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-transparent text-ink-4 opacity-70 transition-[opacity,background-color,color,border-color,transform] hover:border-pulse/20 hover:bg-pulse-wash hover:text-pulse hover:opacity-100 active:scale-95 focus-visible:opacity-100 max-[859px]:opacity-70 min-[860px]:opacity-0 min-[860px]:group-hover:opacity-100 min-[860px]:group-focus-within:opacity-100"

function DeleteMessageButton({
  outgoing,
  onDelete,
}: {
  outgoing: boolean
  onDelete: (scope: "me" | "everyone") => void
}) {
  if (!outgoing) {
    return (
      <button
        type="button"
        aria-label="Delete message for me"
        onClick={() => onDelete("me")}
        className={deleteTriggerClass}
      >
        <Trash2 className="size-3.5 stroke-[1.75]" aria-hidden />
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Delete message"
        className={deleteTriggerClass}
      >
        <Trash2 className="size-3.5 stroke-[1.75]" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[248px] rounded-[16px] border border-edge bg-surface p-1.5 shadow-[0_12px_40px_rgba(17,24,33,0.14),0_2px_8px_rgba(17,24,33,0.06)]"
      >
        <div className="px-2.5 pt-2 pb-1.5">
          <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
            Delete message
          </p>
        </div>
        <DropdownMenuItem
          onClick={() => onDelete("me")}
          className="cursor-pointer items-start gap-3 rounded-[12px] px-2.5 py-2.5 focus:bg-surface-2"
        >
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[11px] bg-surface-2 text-ink-2 ring-1 ring-edge">
            <EyeOff className="size-4 stroke-[1.75]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold text-ink">
              Delete for me
            </span>
            <span className="mt-0.5 block text-[12px] leading-snug text-ink-3">
              Hide this message only on your side
            </span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1.5 bg-edge" />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete("everyone")}
          className="cursor-pointer items-start gap-3 rounded-[12px] px-2.5 py-2.5 focus:bg-pulse-wash"
        >
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[11px] bg-pulse-wash text-pulse ring-1 ring-pulse/20">
            <Users className="size-4 stroke-[1.75]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold text-pulse">
              Delete for everyone
            </span>
            <span className="mt-0.5 block text-[12px] leading-snug text-pulse/80">
              Remove this message for all chat members
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
