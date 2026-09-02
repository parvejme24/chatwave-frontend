"use client"

import { useRouter } from "next/navigation"
import { useRef, type PointerEvent } from "react"
import { toast } from "sonner"

import { UserAvatar } from "../../components/shared/user-avatar"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { mutationErrorMessage } from "../../lib/store/api-error"
import {
  contactPreview,
  useAddContactMutation,
  useFollowUserMutation,
  useOpenContactChatMutation,
  useUnfollowUserMutation,
} from "../../lib/store/contacts-api"
import { contactInitials, type Contact } from "../../lib/types/contact"
import { cn } from "../../lib/utils"

export function PeopleRail({
  contacts,
  loading,
  error,
  empty,
}: {
  contacts: Contact[]
  loading?: boolean
  error?: string
  empty?: string
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const drag = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: false,
    suppressClick: false,
  })

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !scroller.current) return
    // Don't steal clicks from Follow / Message / Unfollow controls.
    const target = event.target as HTMLElement | null
    if (target?.closest("button, a, input, textarea, select, [role='button']")) {
      return
    }
    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: scroller.current.scrollLeft,
      moved: false,
      suppressClick: false,
    }
    scroller.current.setPointerCapture(event.pointerId)

    function onMove(move: globalThis.PointerEvent) {
      if (!drag.current.active || !scroller.current) return
      const delta = move.clientX - drag.current.startX
      if (Math.abs(delta) > 6) drag.current.moved = true
      scroller.current.scrollLeft = drag.current.startScroll - delta
    }

    function onUp() {
      if (drag.current.moved) drag.current.suppressClick = true
      drag.current.active = false
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
  }

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!drag.current.suppressClick) return
    event.preventDefault()
    event.stopPropagation()
    drag.current.suppressClick = false
  }

  if (error) {
    return <p className="px-5 py-4 text-[13px] text-ink-3">{error}</p>
  }

  if (loading && contacts.length === 0) {
    return (
      <div
        className="flex gap-3 overflow-hidden px-5 py-4"
        aria-busy
        aria-label="Loading people"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-[188px] w-[138px] shrink-0 rounded-[16px] bg-surface-2"
          />
        ))}
      </div>
    )
  }

  if (!contacts.length) {
    return (
      <p className="px-5 py-4 text-[13px] text-ink-3">
        {empty || "No people to show."}
      </p>
    )
  }

  return (
    <div
      ref={scroller}
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
      className={cn(
        "flex gap-3 overflow-x-auto overscroll-x-contain px-5 py-4 select-none",
        "[scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden",
        "cursor-grab active:cursor-grabbing"
      )}
      role="list"
      aria-label="People"
    >
      {contacts.map((contact) => (
        <PeopleCard
          key={contact.id ?? contact.user}
          contact={contact}
        />
      ))}
    </div>
  )
}

function PeopleCard({ contact }: { contact: Contact }) {
  const router = useRouter()
  const [addContact, { isLoading: adding }] = useAddContactMutation()
  const [followUser, { isLoading: followingBusy }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: removing }] = useUnfollowUserMutation()
  const [openChat, { isLoading: openingChat }] = useOpenContactChatMutation()
  const busy = adding || followingBusy || removing || openingChat
  const following = Boolean(contact.following)
  const personId = contact.id
  const username = contact.user ? `@${contact.user}` : ""

  async function follow() {
    if (!personId && !contact.user) return
    try {
      if (personId) {
        await followUser({
          userId: personId,
          preview: contactPreview(contact),
        }).unwrap()
      } else {
        await addContact({ username: contact.user }).unwrap()
      }
      toast(`Following ${contact.name}`)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not follow"))
    }
  }

  async function unfollow() {
    if (!personId) return
    try {
      await unfollowUser(personId).unwrap()
      toast(`Unfollowed ${contact.name}`)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not unfollow"))
    }
  }

  async function message() {
    if (!personId) {
      router.push("/chats")
      return
    }
    if (contact.hrefChat) {
      router.push(contact.hrefChat)
      return
    }
    try {
      const result = await openChat(personId).unwrap()
      router.push(result.href || `/chats/${result.conversationId}`)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not open chat"))
    }
  }

  return (
    <article
      role="listitem"
      className="flex w-[138px] shrink-0 flex-col items-center rounded-[16px] border border-edge bg-surface-2/60 px-3 pt-4 pb-3 text-center"
    >
      <UserAvatar
        initials={contact.initials ?? contactInitials(contact.name)}
        tone={contact.tone}
        photo={contact.photo}
        presence={contact.presence}
        showPresence
        size="lg"
      />
      <p className="mt-3 w-full truncate font-display text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
        {contact.name}
      </p>
      <p className="mt-0.5 w-full truncate text-[11.5px] text-ink-3">
        {username || "ChatWave"}
      </p>
      <div className="mt-3 flex w-full flex-col gap-1.5">
        {following ? (
          <>
            <Button
              type="button"
              disabled={busy}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => void message()}
              className="h-8 w-full cursor-pointer rounded-[11px] bg-signal px-2 text-[12.5px] font-medium text-white hover:bg-signal-deep"
            >
              Message
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => void unfollow()}
              className="h-8 w-full cursor-pointer rounded-[11px] border border-edge bg-surface px-2 text-[12.5px] font-medium text-ink hover:bg-surface-3"
            >
              Unfollow
            </Button>
          </>
        ) : (
          <Button
            type="button"
            disabled={busy || (!personId && !contact.user)}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => void follow()}
            className="h-8 w-full cursor-pointer rounded-[11px] bg-signal px-2 text-[12.5px] font-medium text-white hover:bg-signal-deep"
          >
            Follow
          </Button>
        )}
      </div>
    </article>
  )
}
