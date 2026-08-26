"use client"

import { ContactRow } from "./contact-row"
import type { Contact } from "../../lib/types/contact"

export function AllContactsCard({
  contacts,
  loading,
  error,
  searching,
  total,
}: {
  contacts: Contact[]
  loading?: boolean
  error?: boolean
  searching?: boolean
  total?: number
}) {
  const count = total ?? contacts.length

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          All contacts
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          {count
            ? `${count} people on ChatWave`
            : "Everyone on ChatWave appears here"}
        </p>
      </div>
      <div className="px-5 py-1.5">
        {error ? (
          <div className="py-[13px] text-[13px] text-ink-3">
            Could not load people.
          </div>
        ) : loading && contacts.length === 0 ? (
          <div className="py-[13px] text-[13px] text-ink-3">Loading…</div>
        ) : contacts.length ? (
          contacts.map((contact) => (
            <ContactRow
              key={contact.id ?? contact.user}
              contact={contact}
            />
          ))
        ) : (
          <div className="py-[13px] text-[13px] text-ink-3">
            {searching
              ? "No people match that search."
              : "No other people in ChatWave yet."}
          </div>
        )}
      </div>
    </section>
  )
}
