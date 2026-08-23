import { AudioLines } from "lucide-react"
import Link from "next/link"

import { LegalNav } from "./legal-nav"

export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-edge bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-[720px] items-center justify-between px-6">
          <Link
            href="/sign-in"
            className="inline-flex cursor-pointer items-center gap-[11px] font-display text-[17px] font-bold tracking-[-0.02em] text-ink"
          >
            <span className="grid size-[30px] place-items-center rounded-[9px] bg-signal text-white">
              <AudioLines className="size-4 stroke-[2.2]" aria-hidden />
            </span>
            ChatWave
          </Link>
          <LegalNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        {children}
      </main>
    </div>
  )
}
