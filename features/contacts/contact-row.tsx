"use client"

import { MessageCircle, MoreHorizontal, PenLine, Phone, Plus, UserMinus, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { UserAvatar } from "../../components/shared/user-avatar"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Input } from "../../components/ui/input"
import { conversationIdFromHref } from "../../lib/call"
import { mutationErrorMessage } from "../../lib/store/api-error"
import {
  useAddContactMutation,
  useDeleteContactMutation,
  useOpenContactChatMutation,
  useUpdateContactNoteMutation,
} from "../../lib/store/contacts-api"
import { contactInitials, type Contact } from "../../lib/types/contact"
import { useStartCall } from "../call/use-start-call"

function actionClassName(extra?: string) {
  return `inline-flex size-10 cursor-pointer items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink ${extra ?? ""}`
}

export function ContactRow({
  contact,
  mode = "saved",
}: {
  contact: Contact
  mode?: "saved" | "add"
}) {
  const router = useRouter()
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState(contact.note)
  const [addContact, { isLoading: adding }] = useAddContactMutation()
  const [updateNote, { isLoading: savingNote }] = useUpdateContactNoteMutation()
  const [deleteContact, { isLoading: removing }] = useDeleteContactMutation()
  const [openChat, { isLoading: openingChat }] = useOpenContactChatMutation()
  const { startCall, isStarting } = useStartCall()
  const busy = adding || savingNote || removing || openingChat || isStarting
  const personId = contact.id

  async function startVoiceOrVideo(type: "audio" | "video") {
    const conversationId = conversationIdFromHref(contact.hrefChat)
    try {
      await startCall({
        type,
        conversationId: conversationId || undefined,
        userId: personId,
        peer: contact.name,
      })
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not start call"))
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

  async function add() {
    if (!personId && !contact.user) return
    try {
      await addContact(
        personId ? { userId: personId } : { username: contact.user }
      ).unwrap()
      toast(`Added ${contact.name}`)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not add contact"))
    }
  }

  async function saveNote() {
    if (!personId) return
    try {
      await updateNote({ personId, note: note.trim() }).unwrap()
      setNoteOpen(false)
      toast("Note updated")
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not update note"))
    }
  }

  async function remove() {
    if (!personId) return
    try {
      await deleteContact(personId).unwrap()
      toast(`Removed ${contact.name}`)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not remove contact"))
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
        <span className="mt-px block truncate text-[13px] text-ink-3">
          @{contact.user}
          {contact.note ? ` · ${contact.note}` : ""}
        </span>
      </span>
      {mode === "add" ? (
        <button
          type="button"
          disabled={busy}
          aria-label={`Add ${contact.name}`}
          onClick={() => void add()}
          className={actionClassName("text-signal hover:text-signal")}
        >
          <Plus className="size-5 stroke-[1.75]" aria-hidden />
        </button>
      ) : (
        <span className="flex shrink-0 items-center gap-0.5">
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
            onClick={() => void startVoiceOrVideo("audio")}
            className={actionClassName()}
          >
            <Phone className="size-5 stroke-[1.75]" aria-hidden />
          </button>
          <button
            type="button"
            disabled={busy}
            aria-label={`Video call ${contact.name}`}
            onClick={() => void startVoiceOrVideo("video")}
            className={actionClassName()}
          >
            <Video className="size-5 stroke-[1.75]" aria-hidden />
          </button>
          {personId ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={busy}
                aria-label={`More actions for ${contact.name}`}
                className={actionClassName()}
              >
                <MoreHorizontal className="size-5 stroke-[1.75]" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setNote(contact.note)
                    setNoteOpen(true)
                  }}
                >
                  <PenLine className="size-4 stroke-[1.75]" aria-hidden />
                  Edit note
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => void remove()}>
                  <UserMinus className="size-4 stroke-[1.75]" aria-hidden />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </span>
      )}

      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="rounded-[20px] bg-surface p-5 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display text-[17px] font-bold text-ink">
              Note for {contact.name}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={note}
            maxLength={120}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a short note"
            className="h-[46px] rounded-[14px] border-edge bg-surface-2 px-3.5 text-[15px] text-ink"
          />
          <DialogFooter className="border-edge bg-transparent">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setNoteOpen(false)}
              className="h-9 rounded-[14px] border border-edge bg-surface-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={savingNote}
              onClick={() => void saveNote()}
              className="h-9 rounded-[14px] bg-signal text-white hover:bg-signal-deep"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
