"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, Search, Users, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { useChat } from "./chat-provider"
import { IconBtn } from "../../components/layout/icon-btn"
import { signalEase } from "../../components/motion/motion-item"
import { useSettings } from "../settings/settings-provider"
import { UserAvatar } from "../../components/shared/user-avatar"
import { Input } from "../../components/ui/input"
import { isManagedUserHidden } from "../../lib/data/admin-users"
import { CONTACTS, filterContacts } from "../../lib/data/contacts"
import { useMediaQuery } from "../../lib/hooks/use-media-query"
import { MIN_GROUP_MEMBERS, type GroupMember } from "../../lib/types/chat"
import { contactInitials, type Contact } from "../../lib/types/contact"
import { cn } from "../../lib/utils"

export function CreateGroupDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const { createGroup } = useChat()
  const { users, removedUserKeys } = useSettings()
  const reduceMotion = useReducedMotion()
  const isMobile = useMediaQuery("(max-width: 859px)")
  const [name, setName] = useState("")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Contact[]>([])

  useEffect(() => {
    if (!open) return

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) return
    setName("")
    setQuery("")
    setSelected([])
  }, [open])

  const people = useMemo(() => {
    const available = CONTACTS.filter(
      (contact) =>
        !isManagedUserHidden(users, removedUserKeys, contact.user, contact.name)
    )
    return filterContacts(available, query)
  }, [query, removedUserKeys, users])

  useEffect(() => {
    setSelected((current) =>
      current.filter(
        (contact) =>
          !isManagedUserHidden(
            users,
            removedUserKeys,
            contact.user,
            contact.name
          )
      )
    )
  }, [removedUserKeys, users])
  const ready = name.trim().length > 0 && selected.length >= MIN_GROUP_MEMBERS
  const needed = Math.max(0, MIN_GROUP_MEMBERS - selected.length)

  function toggle(contact: Contact) {
    setSelected((current) =>
      current.some((item) => item.user === contact.user)
        ? current.filter((item) => item.user !== contact.user)
        : [...current, contact]
    )
  }

  function create() {
    if (!name.trim()) {
      toast("Give the group a name")
      return
    }
    if (selected.length < MIN_GROUP_MEMBERS) {
      toast(`Select at least ${MIN_GROUP_MEMBERS} people`)
      return
    }

    const members: GroupMember[] = selected.map((contact) => ({
      id: contact.user,
      name: contact.name,
      initials: contactInitials(contact.name),
      tone: contact.tone,
      presence: contact.presence,
      user: contact.user,
    }))

    const id = createGroup(name, members)
    toast(`Created ${name.trim()}`)
    onClose()
    router.push(`/chats/${id}`)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="create-group"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-group-title"
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
            initial={
              reduceMotion
                ? false
                : isMobile
                  ? { y: 28, opacity: 0 }
                  : { y: 16, scale: 0.97, opacity: 0 }
            }
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={
              reduceMotion
                ? undefined
                : { y: 12, opacity: 0, scale: 0.98 }
            }
            transition={{ duration: 0.28, ease: signalEase }}
            className="flex h-[min(720px,100dvh)] w-full max-w-[440px] flex-col bg-surface min-[480px]:h-[min(680px,calc(100dvh-40px))] min-[480px]:rounded-[22px] min-[480px]:shadow-[0_24px_64px_rgba(17,24,33,0.18)]"
          >
            <header className="flex shrink-0 items-center gap-2 border-b border-edge px-4 py-3">
              <IconBtn aria-label="Close create group" onClick={onClose}>
                <X className="size-5 stroke-[1.75]" aria-hidden />
              </IconBtn>
              <div className="min-w-0 flex-1">
                <h2
                  id="create-group-title"
                  className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink"
                >
                  New group
                </h2>
                <p className="text-[12.5px] text-ink-3">
                  Add at least {MIN_GROUP_MEMBERS} people.
                </p>
              </div>
              <button
                type="button"
                disabled={!ready}
                onClick={create}
                className="h-9 cursor-pointer rounded-[11px] bg-signal px-3.5 text-[13.5px] font-semibold text-white transition-transform hover:bg-signal-deep disabled:cursor-not-allowed disabled:bg-edge-2 disabled:text-ink-4"
              >
                Create
              </button>
            </header>

            <div className="shrink-0 space-y-3 px-4 pt-4 pb-2">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                  Group name
                </span>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Frontend Guild"
                  aria-label="Group name"
                  className="h-[42px] rounded-[14px] border-edge bg-surface-2 px-3.5 text-[14.5px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash"
                />
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-[13px] size-[17px] -translate-y-1/2 text-ink-4"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search people"
                  aria-label="Search people"
                  className="h-[42px] rounded-[14px] border-edge bg-surface-2 pr-3.5 pl-[39px] text-[14.5px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash"
                />
              </div>
            </div>

            {selected.length > 0 ? (
              <div className="flex shrink-0 gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {selected.map((contact) => (
                  <button
                    key={contact.user}
                    type="button"
                    onClick={() => toggle(contact)}
                    aria-label={`Remove ${contact.name}`}
                    className="flex shrink-0 cursor-pointer flex-col items-center gap-1"
                  >
                    <span className="relative">
                      <UserAvatar
                        initials={contactInitials(contact.name)}
                        tone={contact.tone}
                        size="sm"
                      />
                      <i className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-ink text-paper">
                        <X className="size-2.5 stroke-[2.2]" aria-hidden />
                      </i>
                    </span>
                    <span className="max-w-[52px] truncate text-[10.5px] text-ink-3">
                      {contact.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
              {people.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-ink-3">
                  No one matches “{query.trim()}”.
                </p>
              ) : (
                people.map((contact) => {
                  const on = selected.some((item) => item.user === contact.user)
                  return (
                    <button
                      key={contact.user}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(contact)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-2.5 py-[11px] text-left hover:bg-surface-2",
                        on && "bg-signal-wash"
                      )}
                    >
                      <UserAvatar
                        initials={contactInitials(contact.name)}
                        tone={contact.tone}
                        presence={contact.presence}
                        showPresence
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-[14.5px] font-semibold text-ink">
                          {contact.name}
                        </span>
                        <span className="block truncate text-[13px] text-ink-3">
                          @{contact.user} · {contact.note}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-full border",
                          on
                            ? "border-signal bg-signal text-white"
                            : "border-edge-2 text-transparent"
                        )}
                      >
                        <Check className="size-3.5 stroke-[2.2]" aria-hidden />
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <footer className="flex shrink-0 items-center gap-2 border-t border-edge px-4 py-3 text-[12.5px] text-ink-3">
              <Users className="size-4 stroke-[1.75] text-ink-4" aria-hidden />
              <span>
                {selected.length} selected
                {needed > 0
                  ? ` · ${needed} more to create`
                  : " · ready to create"}
              </span>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
