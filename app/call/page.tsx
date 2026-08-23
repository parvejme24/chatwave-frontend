import type { Metadata } from "next"
import { Suspense } from "react"

import { CallPageContent } from "@/features/call/call-page-content"

export const metadata: Metadata = {
  title: "Call",
}

export default function CallPage() {
  return (
    <Suspense fallback={<section className="h-dvh bg-[#0A0D13]" />}>
      <CallPageContent />
    </Suspense>
  )
}
