"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, Info, Phone, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { IconBtn } from "../../components/layout/icon-btn"
import { useChat } from "./chat-provider"
import { useStartCall } from "../call/use-start-call"
import { signalEase } from "../../components/motion/motion-item"
import { UserAvatar } from "../../components/shared/user-avatar"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { personFromConversation, type Conversation } from "../../lib/types/chat"
import { cn } from "../../lib/utils"

export function ThreadHeader({ conversation }: { conversation: Conversation }) {
  const router = useRouter()
  const { openProfile } = useChat()
  const { startCall, isStarting } = useStartCall()
  const reduceMotion = useReducedMotion()

  async function call(type: "audio" | "video") {
    try {
      await startCall({
        type,
        conversationId: conversation.id,
        peer: conversation.name,
      })
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not start call"))
    }
  }

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-edge bg-surface px-[18px] py-3 max-[859px]:gap-2 max-[859px]:px-3 max-[859px]:py-2.5">
      <IconBtn
        aria-label="Back to conversations"
        className="hidden max-[859px]:inline-flex"
        onClick={() => router.push("/chats")}
      >
        <ChevronLeft className="size-5 stroke-[1.75]" aria-hidden />
      </IconBtn>

      <button
        type="button"
        onClick={() => openProfile(personFromConversation(conversation))}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
      >
        <motion.span
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          transition={{ duration: 0.16, ease: signalEase }}
          className="shrink-0"
        >
          <UserAvatar
            initials={conversation.initials}
            tone={conversation.tone}
            photo={conversation.photoUrl}
            presence={conversation.presence}
            showPresence={!conversation.group}
            className="max-[859px]:size-[38px] max-[859px]:text-[13px]"
          />
        </motion.span>
        <span className="min-w-0">
          <span className="block truncate text-[15.5px] font-semibold tracking-[-0.015em] text-ink">
            {conversation.name}
          </span>
          <span
            className={cn(
              "block truncate text-[12.5px] text-ink-3",
              conversation.live && "cw-motion font-medium text-ok"
            )}
            style={
              conversation.live
                ? { animation: "cw-live 1.8s ease-in-out infinite" }
                : undefined
            }
          >
            {conversation.status}
          </span>
        </span>
      </button>

      <div className="flex gap-0.5">
        <button
          type="button"
          disabled={isStarting}
          aria-label="Start voice call"
          onClick={() => void call("audio")}
          className="inline-flex size-10 items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 max-[479px]:size-[38px]"
        >
          <Phone className="size-5 stroke-[1.75]" aria-hidden />
        </button>
        <button
          type="button"
          disabled={isStarting}
          aria-label="Start video call"
          onClick={() => void call("video")}
          className="inline-flex size-10 items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 max-[479px]:size-[38px]"
        >
          <Video className="size-5 stroke-[1.75]" aria-hidden />
        </button>
        <IconBtn
          aria-label="Conversation details"
          className="max-[859px]:hidden"
          onClick={() => openProfile(personFromConversation(conversation))}
        >
          <Info className="size-5 stroke-[1.75]" aria-hidden />
        </IconBtn>
      </div>
    </header>
  )
}
