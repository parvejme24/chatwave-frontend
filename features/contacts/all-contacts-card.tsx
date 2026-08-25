"use client"

import { Check, Plus } from "lucide-react"
import { toast } from "sonner"

import { UserAvatar } from "../../components/shared/user-avatar"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { useAddContactMutation } from "../../lib/store/contacts-api"
import { contactInitials, type Contact } from "../../lib/types/contact"
import { cn } from "../../lib/utils"

export function AllContactsCard({
  contacts,
  savedIds,
  loading,
  error,
  searching,
}: {
  contacts: Contact[]
  savedIds: Set<string>
  loading?: boolean
  error?: boolean
  searching?: boolean
}) {
  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          All contacts
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          {contacts.length ? `${contacts.length} people on ChatWave · ` : ""}
          Save someone to keep them in your list
        </p>
      </div>
      {error ? (
        <div className="px-5 py-[13px] text-[13px] text-ink-3">
          Could not load people.
        </div>
      ) : loading && contacts.length === 0 ? (
        <div className="px-5 py-[13px] text-[13px] text-ink-3">Loading…</div>
      ) : contacts.length ? (
        <div className="flex gap-3 overflow-x-auto px-5 py-4 [scrollbar-width:thin]">
          {contacts.map((contact) => (
            <PersonTile
              key={contact.id ?? contact.user}
              contact={contact}
              saved={Boolean(contact.id && savedIds.has(contact.id))}
            />
          ))}
        </div>
      ) : (
        <div className="px-5 py-[13px] text-[13px] text-ink-3">
          {searching
            ? "No people match that search."
            : "No other people in ChatWave yet."}
        </div>
      )}
    </section>
  )
}

function PersonTile({
  contact,
  saved,
}: {
  contact: Contact
  saved: boolean
}) {
  const [addContact, { isLoading }] = useAddContactMutation()

  async function save() {
    if (!contact.id && !contact.user) return
    try {
      await addContact(
        contact.id ? { userId: contact.id } : { username: contact.user }
      ).unwrap()
      toast(`Saved ${contact.name}`)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not save contact"))
    }
  }

  return (
    <article className="flex w-[132px] shrink-0 flex-col items-center rounded-[16px] border border-edge bg-surface-2 px-3 pt-3.5 pb-3">
      <UserAvatar
        initials={contact.initials ?? contactInitials(contact.name)}
        tone={contact.tone}
        photo={contact.photo}
        presence={contact.presence}
        showPresence
        size="lg"
      />
      <p className="mt-2.5 w-full truncate text-center font-display text-[13.5px] font-semibold text-ink">
        {contact.name}
      </p>
      <p className="w-full truncate text-center text-[12px] text-ink-3">
        @{contact.user}
      </p>
      <button
        type="button"
        disabled={saved || isLoading}
        onClick={() => void save()}
        className={cn(
          "mt-2.5 inline-flex h-8 w-full items-center justify-center gap-1 rounded-[11px] text-[12.5px] font-semibold",
          saved
            ? "bg-ok-wash text-ok"
            : "bg-signal text-white hover:bg-signal-deep"
        )}
      >
        {saved ? (
          <>
            <Check className="size-3.5 stroke-[2.2]" aria-hidden />
            Saved
          </>
        ) : (
          <>
            <Plus className="size-3.5 stroke-[2.2]" aria-hidden />
            Save
          </>
        )}
      </button>
    </article>
  )
}
