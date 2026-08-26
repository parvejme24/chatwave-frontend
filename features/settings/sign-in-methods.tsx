"use client"

import { Mail } from "lucide-react"

import { useSettings } from "./settings-provider"

export function SignInMethods() {
  const { authMethods } = useSettings()
  const email = authMethods.email || "Not set"

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Sign-in methods
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          Email used to access this account
        </p>
      </div>
      <div className="px-5 py-1.5">
        <div className="flex flex-wrap items-center gap-3.5 py-[13px]">
          <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-signal-wash text-signal">
            <Mail className="size-5 stroke-[1.75]" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ink">
              Email
            </span>
            <span className="mt-px block font-mono text-[13px] text-ink-3">
              {email}
            </span>
          </span>
          <span className="rounded-full bg-ok-wash px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ok">
            {authMethods.emailVerified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>
    </section>
  )
}
