"use client"

import { ChevronLeft, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { UserDirectory } from "./user-directory"
import { IconBtn } from "../../components/layout/icon-btn"
import { MotionItem } from "../../components/motion/motion-item"
import { useSettings } from "../settings/settings-provider"
import { isAppOwner } from "../../lib/data/settings"

export function AdvancedPage() {
  const router = useRouter()
  const { profile } = useSettings()
  const owner = isAppOwner(profile)

  useEffect(() => {
    if (!owner) router.replace("/settings")
  }, [owner, router])

  if (!owner) {
    return (
      <section className="grid h-dvh place-items-center bg-paper px-6 text-center">
        <p className="text-sm text-ink-3">This area is only for the owner.</p>
      </section>
    )
  }

  return (
    <section className="h-dvh overflow-y-auto bg-paper max-[859px]:pb-[calc(74px+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[780px] px-[26px] pt-[26px] pb-[70px] max-[859px]:px-[18px] max-[859px]:pt-[18px]">
        <MotionItem className="mb-[26px]">
          <header>
            <div className="mb-3 flex items-center gap-1.5">
              <IconBtn
                aria-label="Back to settings"
                onClick={() => router.push("/settings")}
              >
                <ChevronLeft className="size-5 stroke-[1.75]" aria-hidden />
              </IconBtn>
              <Link
                href="/settings"
                className="text-[13px] font-medium text-ink-3 hover:text-ink"
              >
                Settings
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink max-[859px]:text-[27px]">
                Advanced
              </h1>
              <span className="rounded-full bg-pulse-wash px-2 py-0.5 font-mono text-[10.5px] font-semibold tracking-[0.04em] text-pulse uppercase">
                Owner only
              </span>
            </div>
            <p className="mt-[5px] text-[14.5px] text-ink-3">
              Account history, bans, and removals. Regular settings stay on
              their own page.
            </p>
          </header>
        </MotionItem>

        <MotionItem delay={0.06}>
          <UserDirectory />
        </MotionItem>

        <MotionItem delay={0.12} className="mt-4">
          <p className="flex items-center justify-center gap-1.5 font-mono text-[12.5px] text-ink-4">
            <ShieldAlert className="size-3.5 stroke-[1.75]" aria-hidden />
            ChatWave · Owner tools
          </p>
        </MotionItem>
      </div>
    </section>
  )
}
