"use client"

import { PeopleRail } from "./people-rail"
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
            ? `${count} ${count === 1 ? "person" : "people"} to follow · swipe to browse`
            : "People you can still follow appear here"}
        </p>
      </div>
      <PeopleRail
        contacts={contacts}
        loading={loading}
        error={error ? "Could not load people." : undefined}
        empty={
          searching
            ? "No people match that search."
            : "Everyone you might follow is already in My contacts."
        }
      />
    </section>
  )
}
