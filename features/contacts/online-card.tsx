"use client"

import { Plus } from "lucide-react"
import { toast } from "sonner"

import { ContactRow } from "./contact-row"
import { Button } from "../../components/ui/button"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { useLazyGetInviteLinkQuery } from "../../lib/store/contacts-api"
import type { Contact } from "../../lib/types/contact"

export function OnlineCard({
  contacts,
  loading,
  error,
  total,
  onlineCount,
}: {
  contacts: Contact[]
  loading?: boolean
  error?: boolean
  total?: number
  onlineCount?: number
}) {
  const [getInviteLink, { isFetching }] = useLazyGetInviteLinkQuery()
  const shown = onlineCount ?? contacts.length

  async function copyInvite() {
    try {
      const result = await getInviteLink().unwrap()
      if (!result.url) {
        toast.error("Invite link is not available")
        return
      }
      await navigator.clipboard.writeText(result.url)
      toast("Invite link copied")
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not copy invite link"))
    }
  }

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Online now
          </h3>
          <p className="mt-px text-[13px] text-ink-3">
            {shown}
            {typeof total === "number" ? ` of ${total} contacts` : " online"}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={isFetching}
          onClick={() => void copyInvite()}
          className="h-9 gap-1.5 rounded-[14px] border border-edge bg-surface-2 px-3.5 text-[13.5px] font-medium text-ink hover:bg-surface-3"
        >
          <Plus className="size-4 stroke-[1.75]" aria-hidden />
          Invite
        </Button>
      </div>
      <div className="px-5 py-1.5">
        {error ? (
          <div className="py-[13px] text-[13px] text-ink-3">
            Could not load who is online.
          </div>
        ) : loading && contacts.length === 0 ? (
          <div className="py-[13px] text-[13px] text-ink-3">Loading…</div>
        ) : contacts.length ? (
          contacts.map((contact) => (
            <ContactRow key={contact.id ?? contact.user} contact={contact} />
          ))
        ) : (
          <div className="py-[13px] text-[13px] text-ink-3">
            Nobody online right now.
          </div>
        )}
      </div>
    </section>
  )
}
