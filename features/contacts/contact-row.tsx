"use client"

import { MessageCircle, Phone, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { UserAvatar } from "../../components/shared/user-avatar"
import { Button } from "../../components/ui/button"
import { callPageHref, conversationIdFromHref } from "../../lib/call"
import { mutationErrorMessage } from "../../lib/store/api-error"
import {
  contactPreview,
  useAddContactMutation,
  useFollowUserMutation,
  useOpenContactChatMutation,
  useUnfollowUserMutation,
} from "../../lib/store/contacts-api"
import { contactInitials, type Contact } from "../../lib/types/contact"

function actionClassName(extra?: string) {
  return `inline-flex size-10 cursor-pointer items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink ${extra ?? ""}`
}

export function ContactRow({ contact }: { contact: Contact }) {
  const router = useRouter()
  const [addContact, { isLoading: adding }] = useAddContactMutation()
  const [followUser, { isLoading: followingBusy }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: removing }] = useUnfollowUserMutation()
  const [openChat, { isLoading: openingChat }] = useOpenContactChatMutation()
  const busy = adding || followingBusy || removing || openingChat
  const personId = contact.id
  const following = Boolean(contact.following)
  const username = contact.user ? `@${contact.user}` : ""

  function startVoiceOrVideo(type: "audio" | "video") {
    const conversationId = conversationIdFromHref(contact.hrefChat)
    router.push(
      callPageHref({
        type,
        conversationId: conversationId || undefined,
        userId: personId,
        peer: contact.name,
      })
    )
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

  async function follow() {
    if (!personId && !contact.user) return
    try {
      const result = personId
        ? await followUser({
            userId: personId,
            preview: contactPreview(contact),
          }).unwrap()
        : await addContact({ username: contact.user }).unwrap()
      if (result.hrefChat) {
        router.push(result.hrefChat)
        return
      }
      const chatId = personId || result.id
      if (chatId) {
        const chat = await openChat(chatId).unwrap()
        router.push(chat.href || `/chats/${chat.conversationId}`)
      }
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not follow"))
    }
  }

  async function unfollow() {
    if (!personId) return
    try {
      await unfollowUser(personId).unwrap()
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not unfollow"))
    }
  }

  return (
    <div className="flex items-center gap-3.5 border-t border-edge py-[13px] first:border-t-0">
      <UserAvatar
        initials={contact.initials ?? contactInitials(contact.name)}
        tone={contact.tone}
        photo={contact.photo}
        presence={contact.presence}
        showPresence
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[14.5px] font-semibold text-ink">
          {contact.name}
        </span>
        {username ? (
          <span className="mt-px block truncate text-[13px] text-ink-3">
            {username}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        {following ? (
          <>
            <button
              type="button"
              disabled={busy}
              aria-label={`Message ${contact.name}`}
              onClick={() => void message()}
              className={actionClassName()}
            >
              <MessageCircle className="size-5 stroke-[1.75]" aria-hidden />
            </button>
            <button
              type="button"
              disabled={busy}
              aria-label={`Call ${contact.name}`}
              onClick={() => startVoiceOrVideo("audio")}
              className={actionClassName()}
            >
              <Phone className="size-5 stroke-[1.75]" aria-hidden />
            </button>
            <button
              type="button"
              disabled={busy}
              aria-label={`Video call ${contact.name}`}
              onClick={() => startVoiceOrVideo("video")}
              className={actionClassName()}
            >
              <Video className="size-5 stroke-[1.75]" aria-hidden />
            </button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void unfollow()}
              className="h-9 cursor-pointer rounded-[14px] border border-edge bg-surface-2 px-3 text-[13px] font-medium text-ink hover:bg-surface-3"
            >
              Unfollow
            </Button>
          </>
        ) : (
          <Button
            type="button"
            disabled={busy || (!personId && !contact.user)}
            onClick={() => void follow()}
            className="h-9 cursor-pointer rounded-[14px] bg-signal px-3.5 text-[13.5px] font-medium text-white hover:bg-signal-deep"
          >
            Follow
          </Button>
        )}
      </span>
    </div>
  )
}
