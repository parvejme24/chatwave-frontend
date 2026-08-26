import { ContactRow } from "./contact-row"
import { ContactListSkeleton } from "../../components/shared/loading-skeletons"
import type { Contact } from "../../lib/types/contact"

export function FollowingCard({
  contacts,
  loading,
  error,
}: {
  contacts: Contact[]
  loading?: boolean
  error?: boolean
}) {
  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          My contacts
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          {contacts.length
            ? `${contacts.length} people you follow`
            : "People you follow appear here"}
        </p>
      </div>
      <div className="px-5 py-1.5">
        {error ? (
          <div className="py-[13px] text-[13px] text-ink-3">
            Could not load saved contacts.
          </div>
        ) : loading && contacts.length === 0 ? (
          <ContactListSkeleton count={4} />
        ) : contacts.length ? (
          contacts.map((contact) => (
            <ContactRow
              key={contact.id ?? contact.user}
              contact={{ ...contact, following: true }}
            />
          ))
        ) : (
          <div className="py-[13px] text-[13px] text-ink-3">
            Follow someone from All contacts to save them here.
          </div>
        )}
      </div>
    </section>
  )
}
