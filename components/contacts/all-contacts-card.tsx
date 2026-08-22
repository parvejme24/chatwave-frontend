import { ContactRow } from "@/components/contacts/contact-row"
import type { Contact } from "@/lib/types/contact"

function groupByLetter(contacts: Contact[]) {
  const groups: { letter: string; contacts: Contact[] }[] = []

  for (const contact of contacts) {
    const letter = contact.name[0]?.toUpperCase() ?? ""
    const last = groups.at(-1)
    if (last?.letter === letter) last.contacts.push(contact)
    else groups.push({ letter, contacts: [contact] })
  }

  return groups
}

export function AllContactsCard({ contacts }: { contacts: Contact[] }) {
  const groups = groupByLetter(contacts)

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          All contacts
        </h3>
        <p className="mt-px text-[13px] text-ink-3">Sorted alphabetically</p>
      </div>
      <div className="px-5 pb-3">
        {contacts.length ? (
          groups.map((group) => (
            <div key={group.letter}>
              <p className="pt-5 pb-2 font-mono text-xs font-bold text-signal">
                {group.letter}
              </p>
              {group.contacts.map((contact) => (
                <ContactRow key={contact.user} contact={contact} />
              ))}
            </div>
          ))
        ) : (
          <div className="py-[13px] text-[13px] text-ink-3">
            No contact matches that search.
          </div>
        )}
      </div>
    </section>
  )
}
