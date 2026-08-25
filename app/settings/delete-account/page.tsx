import type { Metadata } from "next"
import { Suspense } from "react"

import { DeleteAccountConfirmPage } from "../../../features/settings/delete-account-confirm-page"

export const metadata: Metadata = {
  title: "Delete account",
  description: "Confirm deletion of your ChatWave account.",
}

export default function SettingsDeleteAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-dvh place-items-center bg-paper text-sm text-ink-3">
          Loading…
        </div>
      }
    >
      <DeleteAccountConfirmPage />
    </Suspense>
  )
}
