"use client"

import { useMemo, useState } from "react"

import { AllContactsCard } from "./all-contacts-card"
import { ContactSearch } from "./contact-search"
import { FollowingCard } from "./following-card"
import { OnlineCard } from "./online-card"
import { SuggestionsCard } from "./suggestions-card"
import { filterContacts } from "../../lib/data/contacts"
import { useDebouncedValue } from "../../lib/hooks/use-debounced-value"
import { selectAccessToken, selectAuthUser } from "../../lib/store/auth-slice"
import {
  useGetContactSuggestionsQuery,
  useGetOnlineContactsQuery,
  useListFollowingQuery,
} from "../../lib/store/contacts-api"
import { useAppSelector } from "../../lib/store/hooks"
import { useListUsersQuery } from "../../lib/store/users-api"
import {
  contactFromDirectoryUser,
  contactFromDto,
} from "../../lib/types/contact"
import { sortContacts } from "../../lib/users"

export function ContactsPage() {
  const me = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAccessToken)
  const [query, setQuery] = useState("")
  const debounced = useDebouncedValue(query.trim(), 300)
  const searching = debounced.length > 0
  const {
    data: directory,
    isFetching: loadingContacts,
    isError: contactsFailed,
  } = useListUsersQuery(
    searching ? { q: debounced, limit: 200 } : { limit: 200 },
    { skip: !token }
  )
  const {
    data: followingList,
    isFetching: loadingFollowing,
    isError: followingFailed,
  } = useListFollowingQuery(undefined, { skip: !token })
  const {
    data: onlineList,
    isFetching: loadingOnline,
    isError: onlineFailed,
  } = useGetOnlineContactsQuery(undefined, { skip: !token })
  const { data: suggestionResults, isFetching: loadingSuggestions } =
    useGetContactSuggestionsQuery(undefined, { skip: !token || searching })

  const followingIds = useMemo(() => {
    const ids = new Set<string>()
    for (const contact of followingList?.contacts ?? []) {
      if (contact.id) ids.add(contact.id)
    }
    for (const user of directory?.users ?? []) {
      if (user.following && user.id) ids.add(user.id)
    }
    for (const contact of onlineList?.contacts ?? []) {
      if (contact.following && contact.id) ids.add(contact.id)
    }
    return ids
  }, [directory, followingList, onlineList])

  const following = useMemo(() => {
    const rows = (followingList?.contacts ?? [])
      .map(contactFromDto)
      .filter((person) => person.id !== me?.id)
      .map((person) => ({ ...person, following: true }))
    return sortContacts(filterContacts(rows, query))
  }, [followingList, me?.id, query])

  const online = useMemo(() => {
    const rows = (onlineList?.contacts ?? [])
      .map(contactFromDto)
      .filter((person) => person.id !== me?.id)
      .map((person) => ({
        ...person,
        following: Boolean(
          person.following || (person.id && followingIds.has(person.id))
        ),
      }))
    return sortContacts(filterContacts(rows, query))
  }, [followingIds, me?.id, onlineList, query])

  const suggestions = useMemo(
    () =>
      (suggestionResults ?? [])
        .map(contactFromDto)
        .filter((person) => person.id !== me?.id)
        .map((person) => ({
          ...person,
          following: Boolean(
            person.following || (person.id && followingIds.has(person.id))
          ),
        })),
    [followingIds, me?.id, suggestionResults]
  )

  const allPeople = useMemo(() => {
    const rows = (directory?.users ?? [])
      .map(contactFromDirectoryUser)
      .filter((person) => person.id !== me?.id)
      .map((person) => ({
        ...person,
        following: Boolean(
          person.following || (person.id && followingIds.has(person.id))
        ),
      }))
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
        <OnlineCard
          contacts={online}
          loading={loadingOnline}
          error={onlineFailed}
          total={onlineList?.total ?? directory?.total}
          onlineCount={onlineList?.onlineCount ?? directory?.onlineCount}
        />
        <FollowingCard
          contacts={following}
          loading={loadingFollowing}
          error={followingFailed}
        />
        {searching ? null : (
          <SuggestionsCard
            contacts={suggestions}
            loading={loadingSuggestions}
          />
        )}
        <AllContactsCard
          contacts={allPeople}
          loading={loadingContacts}
          error={contactsFailed && !directory?.users.length}
          searching={searching}
          total={directory?.total}
        />
      </div>
    </section>
  )
}
