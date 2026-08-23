import { ChevronRight, ShieldAlert } from "lucide-react"
import Link from "next/link"

export function AdvancedEntry() {
  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-pulse/35 bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <Link
        href="/advanced"
        className="flex items-center gap-3.5 px-5 py-4"
      >
        <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-pulse-wash text-pulse">
          <ShieldAlert className="size-5 stroke-[1.75]" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Advanced settings
            </span>
            <span className="rounded-full bg-pulse-wash px-2 py-0.5 font-mono text-[10.5px] font-semibold tracking-[0.04em] text-pulse uppercase">
              Owner
            </span>
          </span>
          <span className="mt-px block text-[13px] text-ink-3">
            User history, ban, unban, and delete accounts
          </span>
        </span>
        <ChevronRight
          className="size-5 shrink-0 stroke-[1.75] text-ink-4"
          aria-hidden
        />
      </Link>
    </section>
  )
}
