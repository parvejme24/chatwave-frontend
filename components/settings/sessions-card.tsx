"use client"

import { Shield } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function SessionsCard({
  androidSession,
  onAndroidSignOut,
}: {
  androidSession: boolean
  onAndroidSignOut: () => void
}) {
  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Active sessions
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          Devices signed in to this account
        </p>
      </div>
      <div className="px-5 py-1.5">
        <div className="flex flex-wrap items-center gap-3.5 py-[13px]">
          <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-signal-wash text-signal">
            <Shield className="size-5 stroke-[1.75]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ink">
              Chrome on Linux — this device
            </span>
            <span className="mt-px block font-mono text-[13px] text-ink-3">
              Dhaka, Bangladesh · active now
            </span>
          </span>
          <span className="rounded-full bg-ok-wash px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ok">
            Current
          </span>
        </div>
        {androidSession ? (
          <div className="flex flex-wrap items-center gap-3.5 border-t border-edge py-[13px]">
            <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-signal-wash text-signal">
              <Shield className="size-5 stroke-[1.75]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-ink">
                ChatWave on Android
              </span>
              <span className="mt-px block font-mono text-[13px] text-ink-3">
                Dhaka, Bangladesh · 2 hours ago
              </span>
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onAndroidSignOut()
                toast("Session ended")
              }}
              className="h-[34px] rounded-[14px] border border-edge px-3 text-[13px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              Sign out
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
