"use client"

import { useMemo, useState } from "react"

import { AllContactsCard } from "./all-contacts-card"
import { ContactSearch } from "./contact-search"
import { FollowingCard } from "./following-card"
import { filterContacts } from "../../lib/data/contacts"
import { useDebouncedValue } from "../../lib/hooks/use-debounced-value"
import { selectAccessToken, selectAuthUser } from "../../lib/store/auth-slice"
import {
  useGetContactsQuery,
  useListFollowingQuery,
} from "../../lib/store/contacts-api"
import { useAppSelector } from "../../lib/store/hooks"
import { contactFromDto } from "../../lib/types/contact"
import { sortContacts } from "../../lib/users"

const DIRECTORY_LIMIT = 200

export function ContactsPage() {
  const me = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAccessToken)
  const [query, setQuery] = useState("")
  const debounced = useDebouncedValue(query.trim(), 300)
  const searching = debounced.length > 0

  // GET /api/contacts?limit=200 (& q when searching)
  const {
    data: directory,
    isFetching: loadingContacts,
    isError: contactsFailed,
  } = useGetContactsQuery(
    searching
      ? { q: debounced, limit: DIRECTORY_LIMIT }
      : { limit: DIRECTORY_LIMIT },
    { skip: !token }
  )

  // Following list only — do not re-fetch the full directory here.
  const {
    data: followingList,
    isFetching: loadingFollowing,
    isError: followingFailed,
  } = useListFollowingQuery(
    searching ? { q: debounced } : undefined,
    { skip: !token }
  )

  const followingIds = useMemo(() => {
    const ids = new Set<string>()
    for (const contact of followingList?.contacts ?? []) {
      if (contact.id) ids.add(contact.id)
    }
    for (const contact of directory?.contacts ?? []) {
      if (contact.following && contact.id) ids.add(contact.id)
    }
    return ids
  }, [directory, followingList])

  const following = useMemo(() => {
    const rows = (followingList?.contacts ?? [])
      .map(contactFromDto)
      .filter((person) => person.id !== me?.id)
      .map((person) => ({ ...person, following: true }))
    return sortContacts(filterContacts(rows, query))
  }, [followingList, me?.id, query])

  const allPeople = useMemo(() => {
    const rows = (directory?.contacts ?? [])
      .map(contactFromDto)
      .filter((person) => person.id !== me?.id)
      .map((person) => ({
        ...person,
        following: Boolean(
          person.following || (person.id && followingIds.has(person.id))
        ),
      }))
      // Discover only — already-followed people live under My contacts.
      .filter((person) => !person.following)
    return sortContacts(filterContacts(rows, query))
  }, [directory, followingIds, me?.id, query])

  return (
    <section className="h-dvh overflow-y-auto bg-paper max-[859px]:pb-[calc(74px+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[780px] px-[26px] pt-[34px] pb-[70px] max-[859px]:px-[18px] max-[859px]:pt-[26px]">
        <header className="mb-[26px]">
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink max-[859px]:text-[27px]">
            Contacts
          </h1>
          <p className="mt-[5px] text-[14.5px] text-ink-3">
            Follow someone to save them and start a chat.
          </p>
        </header>

        <ContactSearch value={query} onChange={setQuery} />
        <FollowingCard
          contacts={following}
          loading={loadingFollowing}
          error={followingFailed}
        />
        <AllContactsCard
          contacts={allPeople}
          loading={loadingContacts}
          error={contactsFailed && !(directory?.contacts.length ?? 0)}
          searching={searching}
          total={allPeople.length}
        />
      </div>
    </section>
  )
}
