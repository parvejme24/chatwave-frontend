"use client"

import { Shrink } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "../../lib/utils"

export function CallHeader({
  peer,
  kind,
  timer,
  visible,
}: {
  peer: string
  kind: "audio" | "video"
  timer: string
  visible: boolean
}) {
  const router = useRouter()

  return (
    <header
      className={cn(
        "absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 px-6 pt-[18px] pb-3 transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[859px]:px-4",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate font-display text-base font-[650] tracking-[-0.02em] text-white">
          {peer}
        </h1>
        <p className="mt-1 flex items-center gap-2 text-[13px] text-white/55">
          <i
            className="cw-motion size-[7px] shrink-0 rounded-full bg-ok"
            style={{ animation: "cw-live 1.8s ease-in-out infinite" }}
            aria-hidden
          />
          <span className="font-mono text-[13px] text-white tabular-nums">
            {timer}
          </span>
          <span className="text-white/45">
            · {kind === "audio" ? "Voice call" : "Video call"}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-2.5 py-1.5 backdrop-blur-md">
          <span className="flex items-end gap-px" aria-hidden>
            {[7, 10, 13, 16].map((height, index) => (
              <span
                key={height}
                className={cn(
                  "w-[3px] rounded-[1px]",
                  index < 3 ? "bg-ok" : "bg-white/25"
                )}
                style={{ height }}
              />
            ))}
          </span>
          <span className="font-mono text-[11px] text-white/80">
            {kind === "audio" ? "P2P · 48 kbps" : "P2P · 1.4 Mbps"}
          </span>
        </div>
        <button
          type="button"
          aria-label="Minimize call"
          onClick={() => router.back()}
          className="grid size-[42px] cursor-pointer place-items-center rounded-full bg-white/11 text-white backdrop-blur-md transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-white/20"
        >
          <Shrink className="size-5 stroke-[1.75]" aria-hidden />
        </button>
      </div>
    </header>
  )
}
