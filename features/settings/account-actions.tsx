"use client"

import { LogOut, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function AccountActions() {
  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="px-5 pt-1.5 pb-3.5">
        <button
          type="button"
          onClick={() => toast("Signed out")}
          className="flex w-full cursor-pointer items-center gap-[11px] border-b border-edge py-[11px] text-left text-sm text-ink"
        >
          <LogOut className="size-[18px] stroke-[1.75] text-ink-3" aria-hidden />
          Sign out of this device
        </button>
        <button
          type="button"
          onClick={() => toast("Account deletion needs email confirmation")}
          className="flex w-full cursor-pointer items-center gap-[11px] py-[11px] text-left text-sm text-pulse"
        >
          <Trash2 className="size-[18px] stroke-[1.75]" aria-hidden />
          Delete account
        </button>
      </div>
    </section>
  )
}
