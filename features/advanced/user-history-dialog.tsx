"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect } from "react"
import {
  ImageIcon,
  LogIn,
  MessageCircle,
  Phone,
  UserPlus,
  Users,
  X,
} from "lucide-react"

import { IconBtn } from "../../components/layout/icon-btn"
import { signalEase } from "../../components/motion/motion-item"
import { UserAvatar } from "../../components/shared/user-avatar"
import { contactInitials } from "../../lib/types/contact"
import type { ManagedUser, UserHistoryKind } from "../../lib/types/admin"

const kindIcon: Record<UserHistoryKind, typeof MessageCircle> = {
  signup: UserPlus,
  login: LogIn,
  message: MessageCircle,
  media: ImageIcon,
  call: Phone,
  group: Users,
}

export function UserHistoryDialog({
  user,
  onClose,
}: {
  user: ManagedUser | null
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!user) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [user, onClose])

  return (
    <AnimatePresence>
      {user ? (
        <motion.div
          key={user.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-history-title"
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(8,11,16,0.46)] p-0 backdrop-blur-[4px] min-[480px]:items-center min-[480px]:p-5"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: signalEase }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            initial={reduceMotion ? false : { y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 12, opacity: 0 }}
            transition={{ duration: 0.28, ease: signalEase }}
            className="flex h-[min(720px,100dvh)] w-full max-w-[440px] flex-col bg-surface min-[480px]:h-[min(640px,calc(100dvh-40px))] min-[480px]:rounded-[22px] min-[480px]:shadow-[0_24px_64px_rgba(17,24,33,0.18)]"
          >
            <header className="flex shrink-0 items-start gap-3 border-b border-edge px-4 py-4">
              <UserAvatar
                initials={contactInitials(user.name)}
                tone={user.tone}
                presence={user.presence}
                showPresence={user.status === "active"}
              />
              <div className="min-w-0 flex-1">
                <h2
                  id="user-history-title"
                  className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink"
                >
                  {user.name}
                </h2>
                <p className="truncate text-[13px] text-ink-3">
                  @{user.user} · {user.email}
                </p>
                <p className="mt-1 font-mono text-[11.5px] text-ink-4">
                  Joined {user.joined} · Last seen {user.lastSeen}
                </p>
              </div>
              <IconBtn aria-label="Close history" onClick={onClose}>
                <X className="size-5 stroke-[1.75]" aria-hidden />
              </IconBtn>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <p className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                Activity · {user.history.length}
              </p>
              <ol className="flex flex-col gap-2.5">
                {user.history.map((event) => {
                  const Icon = kindIcon[event.kind]
                  return (
                    <li
                      key={event.id}
                      className="rounded-[14px] border border-edge bg-surface-2 px-3.5 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px] bg-surface text-ink-3">
                          <Icon className="size-4 stroke-[1.75]" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-semibold text-ink">
                            {event.title}
                          </span>
                          {event.detail ? (
                            <span className="mt-0.5 block text-[13px] text-ink-3">
                              {event.detail}
                            </span>
                          ) : null}
                          <span className="mt-1 block font-mono text-[11px] text-ink-4">
                            {event.day} · {event.at}
                          </span>
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
