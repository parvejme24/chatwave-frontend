import { ContactRow } from "./contact-row"
import type { Contact } from "../../lib/types/contact"

export function SuggestionsCard({
  contacts,
  loading,
}: {
  contacts: Contact[]
  loading?: boolean
}) {
  if (!loading && contacts.length === 0) return null

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Suggestions
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          People you can add to contacts
        </p>
      </div>
      <div className="px-5 py-1.5">
        {loading && contacts.length === 0 ? (
          <div className="py-[13px] text-[13px] text-ink-3">Loading…</div>
        ) : (
          contacts.map((contact) => (
            <ContactRow
              key={contact.id ?? contact.user}
              contact={contact}
              mode="add"
            />
          ))
        )}
      </div>
    </section>
  )
}
