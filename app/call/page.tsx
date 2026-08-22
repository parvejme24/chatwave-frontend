import type { Metadata } from "next"
import { Suspense } from "react"

import { CallPageContent } from "@/components/call/call-page-content"

export const metadata: Metadata = {
  title: "Call",
}

export default function CallPage() {
  return (
    <Suspense fallback={<section className="h-dvh bg-paper max-[859px]:pb-[74px]" />}>
      <CallPageContent />
    </Suspense>
  )
}
