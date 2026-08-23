"use client"

import { useMemo, useState } from "react"

import { CallFilters } from "./call-filters"
import { CallSection } from "./call-section"
import { QualityCard } from "./quality-card"
import { useSettings } from "../settings/settings-provider"
import { isManagedUserHidden } from "../../lib/data/admin-users"
import { CALLS, CALL_SECTIONS, filterCalls } from "../../lib/data/calls"
import type { CallFilter } from "../../lib/types/call"

export function CallsPage() {
  const { users, removedUserKeys } = useSettings()
  const [filter, setFilter] = useState<CallFilter>("all")
  const shown = useMemo(() => {
    const visible = CALLS.filter(
      (call) =>
        call.group ||
        !isManagedUserHidden(users, removedUserKeys, undefined, call.name)
    )
    return filterCalls(visible, filter)
  }, [filter, removedUserKeys, users])

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

        {shown.length === 0 ? (
          <p className="py-10 text-[14.5px] text-ink-3">No calls in this filter.</p>
        ) : (
          CALL_SECTIONS.map((section) => (
            <CallSection
              key={section.id}
              section={section}
              calls={shown.filter((call) => call.section === section.id)}
            />
          ))
        )}

        <QualityCard />
      </div>
    </section>
  )
}
