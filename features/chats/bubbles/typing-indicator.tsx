"use client"

import { useEffect } from "react"

import { UserAvatar } from "../../../components/shared/user-avatar"
import { playSound } from "../../../lib/sounds"
import type { AvatarTone, Conversation } from "../../../lib/types/chat"

export function TypingIndicator({
  conversation,
  name,
  initials,
  tone,
}: {
  conversation: Conversation
  name?: string
  initials?: string
  tone?: AvatarTone
}) {
  const label = name || conversation.name
  const firstName = label.split(" ")[0]

  useEffect(() => {
    playSound("typing")
  }, [conversation.id, name])

  return (
    <div className="flex items-center gap-2.5 pt-1.5 pb-0.5">
      <UserAvatar
        initials={initials || conversation.initials}
        tone={tone || conversation.tone}
        size="xs"
      />
      <span
        className="inline-flex h-[34px] items-center gap-[3px] rounded-[20px] rounded-bl-[7px] border border-edge bg-surface px-[15px] shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]"
        aria-label={`${label} is typing`}
      >
        {[0, 1, 2, 3].map((index) => (
          <i
            key={index}
            className="cw-motion block w-[3px] rounded-full bg-signal"
            style={{
              height: 8,
              animation: "cw-typing 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
              animationDelay: `${index * 0.13}s`,
            }}
          />
        ))}
      </span>
      <span className="text-[12.5px] text-ink-3">{firstName} is typing</span>
    </div>
  )
}
