"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Archive,
  Ban,
  Bell,
  CheckCheck,
  FileText,
  ImageIcon,
  Phone,
  Pin,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { toast } from "sonner"

import { IconBtn } from "../../components/layout/icon-btn"
import { useChat } from "./chat-provider"
import { signalEase } from "../../components/motion/motion-item"
import { UserAvatar } from "../../components/shared/user-avatar"
import { Switch } from "../../components/ui/switch"
import { useMediaQuery } from "../../lib/hooks/use-media-query"
import type { Conversation, GroupMember, ProfilePerson } from "../../lib/types/chat"

const mediaTiles = [
  ImageIcon,
  ImageIcon,
  Video,
  ImageIcon,
  ImageIcon,
  FileText,
] as const

const actionClass =
  "flex w-[66px] cursor-pointer flex-col items-center gap-[5px] rounded-[14px] bg-surface-2 py-2.5 text-[11.5px] font-medium text-ink-2 transition-transform hover:scale-[1.04] hover:bg-surface-3"

export function DetailsDrawer({ conversationId }: { conversationId: string }) {
  const {
    getConversation,
    drawerOpen,
    profile,
    setDrawerOpen,
    setPinned,
    openProfile,
  } = useChat()
  const conversation = getConversation(conversationId)
  const isMobile = useMediaQuery("(max-width: 859px)")
  const isOverlay = useMediaQuery("(max-width: 1079px)")
  const isNarrow = useMediaQuery("(max-width: 1280px)")
  const reduceMotion = useReducedMotion()
  const person = profile
  const show = Boolean(drawerOpen && person && conversation)

  useEffect(() => {
    if (!drawerOpen) return

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [drawerOpen, setDrawerOpen])

  if (!conversation) return null

  const transition = { duration: reduceMotion ? 0.01 : 0.32, ease: signalEase }
  const body =
    person && conversation ? (
      <DrawerBody
        conversation={conversation}
        person={person}
        onClose={() => setDrawerOpen(false)}
        onPin={(checked) => setPinned(conversation.id, Boolean(checked))}
        onOpenMember={openProfile}
        reduceMotion={Boolean(reduceMotion)}
      />
    ) : null

  return (
    <AnimatePresence>
      {show ? (
        isMobile ? (
          <motion.div
            key="details-mobile"
            className="fixed inset-0 z-[55] bg-surface"
            initial={reduceMotion ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={transition}
          >
            <aside
              aria-label="Conversation details"
              className="h-full overflow-y-auto bg-surface"
            >
              {body}
            </aside>
          </motion.div>
        ) : isOverlay ? (
          <motion.div
            key="details-overlay"
            className="absolute inset-0 z-40"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: signalEase }}
          >
            <button
              type="button"
              aria-label="Close details"
              className="absolute inset-0 cursor-pointer bg-[rgba(17,24,33,0.28)]"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              aria-label="Conversation details"
              className="absolute inset-y-0 right-0 w-80 overflow-y-auto bg-surface shadow-[0_24px_64px_rgba(17,24,33,0.18)] max-[1280px]:w-72"
              initial={reduceMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "100%" }}
              transition={transition}
            >
              {body}
            </motion.aside>
          </motion.div>
        ) : (
          <motion.aside
            key="details-inline"
            aria-label="Conversation details"
            initial={reduceMotion ? false : { width: 0, opacity: 0 }}
            animate={{ width: isNarrow ? 288 : 320, opacity: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { width: 0, opacity: 0 }
            }
            transition={transition}
            className="h-full shrink-0 overflow-hidden border-l border-edge bg-surface"
          >
            <div className="h-full w-80 overflow-y-auto max-[1280px]:w-72">
              {body}
            </div>
          </motion.aside>
        )
      ) : null}
    </AnimatePresence>
  )
}

function memberLine(member: GroupMember) {
  if (member.isMe) return "You"
  if (member.presence === "online") return "Online"
  if (member.presence === "away") return "Away"
  return member.user ? `@${member.user}` : "Offline"
}

function DrawerBody({
  conversation,
  person,
  onClose,
  onPin,
  onOpenMember,
  reduceMotion,
}: {
  conversation: Conversation
  person: ProfilePerson
  onClose: () => void
  onPin: (checked: boolean) => void
  onOpenMember: (person: ProfilePerson) => void
  reduceMotion: boolean
}) {
  const peer = encodeURIComponent(person.name)
  const firstName = person.name.split(" ")[0]
  const showConversationTools = !person.isMe && person.name === conversation.name

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${person.name}-${person.isMe ? "me" : "peer"}`}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: signalEase }}
      >
        <div className="relative border-b border-edge px-[22px] pt-7 pb-5 text-center">
          <IconBtn
            aria-label="Close details"
            className="absolute top-3 right-3"
            onClick={onClose}
          >
            <X className="size-5 stroke-[1.75]" aria-hidden />
          </IconBtn>
          <motion.div
            initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.28, ease: signalEase }}
          >
            <UserAvatar
              initials={person.initials}
              tone={person.tone}
              photo={person.photo}
              presence={person.presence}
              showPresence={Boolean(person.presence) && !person.group}
              size="xl"
              className="mx-auto mb-3.5"
            />
          </motion.div>
          <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
            {person.isMe ? "You" : person.name}
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-3">
            {person.sub || person.status || conversation.sub}
          </p>
          {person.status && person.sub ? (
            <p className="mt-1 font-mono text-[12px] text-ink-4">
              {person.status}
            </p>
          ) : null}
          <div className="mt-[18px] flex justify-center gap-2">
            {person.isMe ? null : (
              <>
                <Link
                  href={`/call?type=audio&peer=${peer}`}
                  className={actionClass}
                >
                  <Phone
                    className="size-[19px] stroke-[1.75] text-signal"
                    aria-hidden
                  />
                  Call
                </Link>
                <Link
                  href={`/call?type=video&peer=${peer}`}
                  className={actionClass}
                >
                  <Video
                    className="size-[19px] stroke-[1.75] text-signal"
                    aria-hidden
                  />
                  Video
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => toast("Search in this conversation")}
              className={actionClass}
            >
              <Search
                className="size-[19px] stroke-[1.75] text-signal"
                aria-hidden
              />
              Search
            </button>
          </div>
        </div>

        {conversation.group && conversation.members?.length ? (
          <div className="border-b border-edge px-[22px] py-[18px]">
            <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
              Members · {conversation.members.length}
            </h4>
            <div className="flex flex-col gap-0.5">
              {conversation.members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() =>
                    onOpenMember({
                      conversationId: conversation.id,
                      name: member.name,
                      initials: member.initials,
                      tone: member.tone,
                      presence: member.presence,
                      isMe: member.isMe,
                      status: memberLine(member),
                      sub: member.isMe
                        ? "You"
                        : member.user
                          ? `@${member.user}`
                          : memberLine(member),
                    })
                  }
                  className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-1 py-2 text-left hover:bg-surface-2"
                >
                  <UserAvatar
                    initials={member.initials}
                    tone={member.tone}
                    presence={member.presence}
                    showPresence={Boolean(member.presence)}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {member.isMe ? "You" : member.name}
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-3">
                      {memberLine(member)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {showConversationTools ? (
          <>
            <div className="border-b border-edge px-[22px] py-[18px]">
              <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                Shared media · 24
              </h4>
              <div className="grid grid-cols-3 gap-[5px]">
                {mediaTiles.map((Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    className="grid aspect-square cursor-pointer place-items-center rounded-[9px] bg-linear-to-br from-[#C8D4E4] to-[#A8BBD1] text-white/85 transition-transform hover:scale-95 dark:from-[#2B3648] dark:to-[#1E2733]"
                  >
                    <Icon className="size-5 stroke-[1.75]" aria-hidden />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-edge px-[22px] py-[18px]">
              <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                Preferences
              </h4>
              <label className="flex items-center justify-between border-b border-edge py-[11px]">
                <span className="flex items-center gap-[11px] text-sm text-ink">
                  <Bell
                    className="size-[18px] stroke-[1.75] text-ink-3"
                    aria-hidden
                  />
                  Notifications
                </span>
                <Switch defaultChecked aria-label="Notifications" />
              </label>
              <label className="flex items-center justify-between border-b border-edge py-[11px]">
                <span className="flex items-center gap-[11px] text-sm text-ink">
                  <Pin
                    className="size-[18px] stroke-[1.75] text-ink-3"
                    aria-hidden
                  />
                  Pin to top
                </span>
                <Switch
                  checked={Boolean(conversation.pinned)}
                  onCheckedChange={onPin}
                  aria-label="Pin conversation"
                />
              </label>
              <label className="flex items-center justify-between py-[11px]">
                <span className="flex items-center gap-[11px] text-sm text-ink">
                  <CheckCheck
                    className="size-[18px] stroke-[1.75] text-ink-3"
                    aria-hidden
                  />
                  Send read receipts
                </span>
                <Switch defaultChecked aria-label="Read receipts" />
              </label>
            </div>

            <div className="px-[22px] py-[18px]">
              <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                Manage
              </h4>
              <button
                type="button"
                onClick={() => toast("Conversation archived")}
                className="flex w-full cursor-pointer items-center justify-between border-b border-edge py-[11px] text-left"
              >
                <span className="flex items-center gap-[11px] text-sm text-ink">
                  <Archive
                    className="size-[18px] stroke-[1.75] text-ink-3"
                    aria-hidden
                  />
                  Archive conversation
                </span>
              </button>
              <button
                type="button"
                onClick={() => toast(`${firstName} is blocked`)}
                className="flex w-full cursor-pointer items-center justify-between border-b border-edge py-[11px] text-left"
              >
                <span className="flex items-center gap-[11px] text-sm text-pulse">
                  <Ban className="size-[18px] stroke-[1.75]" aria-hidden />
                  Block contact
                </span>
              </button>
              <button
                type="button"
                onClick={() => toast("Conversation deleted")}
                className="flex w-full cursor-pointer items-center justify-between py-[11px] text-left"
              >
                <span className="flex items-center gap-[11px] text-sm text-pulse">
                  <Trash2 className="size-[18px] stroke-[1.75]" aria-hidden />
                  Delete conversation
                </span>
              </button>
            </div>
          </>
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}