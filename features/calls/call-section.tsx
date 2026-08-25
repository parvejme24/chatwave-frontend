"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { CallRow } from "./call-row"
import { Button } from "../../components/ui/button"
import type { CallRecord, CallSection as CallSectionType } from "../../lib/types/call"

export function CallSection({
  section,
  calls,
}: {
  section: CallSectionType
  calls: CallRecord[]
}) {
  const router = useRouter()
  if (!calls.length) return null

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            {section.title}
          </h3>
          <p className="mt-px text-[13px] text-ink-3">{section.meta}</p>
        </div>
        {section.showNewCall ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/contacts")}
            className="h-9 gap-1.5 rounded-[14px] border border-edge bg-surface-2 px-3.5 text-[13.5px] font-medium text-ink hover:bg-surface-3"
          >
            <Plus className="size-4 stroke-[1.75]" aria-hidden />
            New call
          </Button>
        ) : null}
      </div>
      <div className="px-5 py-1.5">
        {calls.map((call) => (
          <CallRow key={call.id} call={call} />
        ))}
      </div>
    </section>
  )
}
