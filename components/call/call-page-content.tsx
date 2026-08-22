"use client"

import { PhoneOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

import { playSound } from "@/lib/sounds"

export function CallPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const isVideo = params.get("type") === "video"
  const type = isVideo ? "Video" : "Voice"
  const peer = params.get("peer") ?? "ChatWave"

  useEffect(() => {
    playSound("callStart")
  }, [])

  function endCall() {
    playSound("callEnd")
    toast("Call ended")
    router.back()
  }

  return (
    <section className="h-dvh overflow-y-auto bg-paper max-[859px]:pb-[74px]">
      <div className="mx-auto flex max-w-[780px] flex-col px-[26px] pt-[34px] pb-[70px] max-[859px]:px-[18px] max-[859px]:pt-[26px]">
        <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink max-[859px]:text-[27px]">
          {type} call
        </h1>
        <p className="mt-[5px] text-[14.5px] text-ink-3">Calling {peer}…</p>
        <button
          type="button"
          onClick={endCall}
          className="mt-8 inline-flex h-12 w-fit cursor-pointer items-center gap-2 rounded-full bg-pulse px-5 text-[14.5px] font-medium text-white hover:brightness-95"
        >
          <PhoneOff className="size-5 stroke-[1.75]" aria-hidden />
          End call
        </button>
      </div>
    </section>
  )
}
