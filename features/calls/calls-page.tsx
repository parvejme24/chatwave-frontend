"use client"

import { useMemo, useState } from "react"

import { CallFilters } from "./call-filters"
import { CallSection } from "./call-section"
import { QualityCard } from "./quality-card"
import { selectAccessToken } from "../../lib/store/auth-slice"
import {
  useGetCallQualityQuery,
  useGetCallsQuery,
} from "../../lib/store/calls-api"
import { useAppSelector } from "../../lib/store/hooks"
import type { CallFilter, CallSection as CallSectionType } from "../../lib/types/call"

const fallbackSections: CallSectionType[] = [
  { id: "today", title: "Today", meta: "", showNewCall: true },
  { id: "yesterday", title: "Yesterday", meta: "" },
  { id: "older", title: "Older", meta: "" },
]

export function CallsPage() {
  const token = useAppSelector(selectAccessToken)
  const [filter, setFilter] = useState<CallFilter>("all")
  const { data, isFetching, isError } = useGetCallsQuery(
    { filter },
    { skip: !token }
  )
  const { data: quality } = useGetCallQualityQuery(undefined, { skip: !token })
  const calls = data?.calls ?? []
  const sections = useMemo(() => {
    const fromApi = data?.sections ?? []
    const known = new Set(fromApi.map((section) => section.id))
    const extra = [...new Set(calls.map((call) => call.section))]
      .filter((id) => id && !known.has(id))
      .map((id) => ({
        id,
        title:
          id === "today" ? "Today" : id === "yesterday" ? "Yesterday" : "Older",
        meta: "",
      }))
    const list = [...fromApi, ...extra]
    return (list.length ? list : fallbackSections).map((section, index) => ({
      ...section,
      showNewCall: index === 0,
    }))
  }, [calls, data?.sections])

  return (
    <section className="h-dvh overflow-y-auto bg-paper max-[859px]:pb-[calc(74px+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[760px] px-[26px] pt-[34px] pb-[70px] max-[859px]:px-[18px] max-[859px]:pt-[26px]">
        <header className="mb-[26px]">
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink max-[859px]:text-[27px]">
            Calls
          </h1>
          <p className="mt-[5px] text-[14.5px] text-ink-3">
            Voice and video calls from the last two weeks.
          </p>
        </header>

        <CallFilters value={filter} onChange={setFilter} />

        {isFetching && calls.length === 0 ? (
          <p className="py-10 text-[14.5px] text-ink-3">Loading calls…</p>
        ) : isError ? (
          <p className="py-10 text-[14.5px] text-ink-3">
            Could not load calls. Try again in a moment.
          </p>
        ) : calls.length === 0 ? (
          <p className="py-10 text-[14.5px] text-ink-3">
            No calls in this filter. Start one from Contacts or a chat.
          </p>
        ) : (
          sections.map((section) => (
            <CallSection
              key={section.id}
              section={section}
              calls={calls.filter((call) => call.section === section.id)}
            />
          ))
        )}

        <QualityCard quality={quality} />
      </div>
    </section>
  )
}
