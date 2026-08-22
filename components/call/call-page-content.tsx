"use client"

import { useSearchParams } from "next/navigation"

import { AppPage } from "@/components/main/app-page"

export function CallPageContent() {
  const params = useSearchParams()
  const type = params.get("type") === "video" ? "Video" : "Voice"
  const peer = params.get("peer") ?? "ChatWave"

  return (
    <AppPage
      title={`${type} call`}
      description={`Calling ${peer}. The live call screen lands in the next build.`}
    />
  )
}
