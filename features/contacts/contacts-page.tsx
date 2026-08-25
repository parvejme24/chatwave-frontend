"use client"

import { useMemo, useState } from "react"

import { AllContactsCard } from "./all-contacts-card"
import { ContactSearch } from "./contact-search"
import { OnlineCard } from "./online-card"
import { SuggestionsCard } from "./suggestions-card"
import { filterContacts } from "../../lib/data/contacts"
import { useDebouncedValue } from "../../lib/hooks/use-debounced-value"
import { selectAccessToken, selectAuthUser } from "../../lib/store/auth-slice"
import {
  useGetContactSuggestionsQuery,
  useGetContactsQuery,
  useGetOnlineContactsQuery,
} from "../../lib/store/contacts-api"
import { useAppSelector } from "../../lib/store/hooks"
import { useSearchUsersQuery, useGetOnlineUsersQuery } from "../../lib/store/users-api"
import { contactFromDto } from "../../lib/types/contact"
import { contactFromPublicUser, sortContacts } from "../../lib/users"

export function ContactsPage() {
  const me = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAccessToken)
  const [query, setQuery] = useState("")
  const debounced = useDebouncedValue(query.trim(), 300)
  const searching = debounced.length > 0
  const { data: list } = useGetContactsQuery()
  const {
    data: onlineList,
    isFetching: loadingOnline,
    isError: onlineFailed,
  } = useGetOnlineContactsQuery()
  const { data: suggestionResults, isFetching: loadingSuggestions } =
    useGetContactSuggestionsQuery(undefined, { skip: searching })
  const {
    data: directory,
    isFetching: loadingDirectory,
    isError: directoryFailed,
  } = useSearchUsersQuery({ limit: 100 }, { skip: !token })
  const { data: onlineUsers } = useGetOnlineUsersQuery(undefined, {
    skip: !token,
  })
  const { data: searchHits, isFetching: searchingPeople } = useSearchUsersQuery(
    { q: debounced, limit: 40 },
    { skip: !token || debounced.length < 2 }
  )

  const savedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const contact of list?.contacts ?? []) {
      if (contact.id) ids.add(contact.id)
    }
    return ids
  }, [list])
  const online = useMemo(() => {
    const rows = (onlineList?.contacts ?? []).map(contactFromDto)
    return sortContacts(filterContacts(rows, query))
  }, [onlineList, query])
  const suggestions = useMemo(
    () => (suggestionResults ?? []).map(contactFromDto),
    [suggestionResults]
  )
  const directoryPeople = useMemo(() => {
    const byId = new Map<string, ReturnType<typeof contactFromPublicUser>>()
    for (const person of directory ?? []) {
      if (person.id === me?.id) continue
      byId.set(person.id, contactFromPublicUser(person))
    }
    for (const person of onlineUsers ?? []) {
      if (person.id === me?.id) continue
      byId.set(person.id, contactFromPublicUser(person))
    }
    for (const person of searchHits ?? []) {
      if (person.id === me?.id) continue
      byId.set(person.id, contactFromPublicUser(person))
    }
    for (const contact of list?.contacts ?? []) {
      if (!contact.id || contact.id === me?.id || byId.has(contact.id)) continue
      byId.set(contact.id, contactFromDto(contact))
    }
    return sortContacts(filterContacts([...byId.values()], query))
  }, [directory, list, me?.id, onlineUsers, query, searchHits])

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
        <OnlineCard
          contacts={online}
          loading={loadingOnline}
          error={onlineFailed}
          total={onlineList?.total ?? list?.total}
          onlineCount={onlineList?.onlineCount ?? list?.onlineCount}
        />
        {searching ? null : (
          <SuggestionsCard
            contacts={suggestions}
            loading={loadingSuggestions}
          />
        )}
        <AllContactsCard
          contacts={directoryPeople}
          savedIds={savedIds}
          loading={loadingDirectory || searchingPeople}
          error={directoryFailed}
          searching={searching}
        />
      </div>
    </section>
  )
}
