"use client"

import { useMemo, useState } from "react"

import { AllContactsCard } from "./all-contacts-card"
import { ContactSearch } from "./contact-search"
import { OnlineCard } from "./online-card"
import { useSettings } from "../settings/settings-provider"
import { isManagedUserHidden } from "../../lib/data/admin-users"
import { CONTACTS, filterContacts } from "../../lib/data/contacts"

export function ContactsPage() {
  const { users, removedUserKeys } = useSettings()
  const [query, setQuery] = useState("")
  const matches = useMemo(() => {
    const available = CONTACTS.filter(
      (contact) =>
        !isManagedUserHidden(users, removedUserKeys, contact.user, contact.name)
    )
    return filterContacts(available, query)
  }, [query, removedUserKeys, users])

  return (
    <section className="h-dvh overflow-y-auto bg-paper max-[859px]:pb-[calc(74px+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[780px] px-[26px] pt-[34px] pb-[70px] max-[859px]:px-[18px] max-[859px]:pt-[26px]">
        <header className="mb-[26px]">
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink max-[859px]:text-[27px]">
            Contacts
          </h1>
          <p className="mt-[5px] text-[14.5px] text-ink-3">
            People you can message or call directly.
          </p>
        </header>

        <ContactSearch value={query} onChange={setQuery} />
        <OnlineCard contacts={matches} />
        <AllContactsCard contacts={matches} />
      </div>
    </section>
  )
}
