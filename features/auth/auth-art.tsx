"use client"

import { AudioLines } from "lucide-react"
import Link from "next/link"

import { AuthChatScene } from "./auth-chat-scene"
import { MotionItem } from "../../components/motion/motion-item"

export type AuthArtStat = {
  value: string
  label: string
}

export type AuthArtProps = {
  eyebrow?: string
  headline?: string
  subcopy?: string
  stats?: AuthArtStat[]
}

const defaultStats: AuthArtStat[] = [
  { value: "<80ms", label: "message delivery" },
  { value: "P2P", label: "encrypted calls" },
  { value: "3", label: "ways to sign in" },
]

export function AuthArt({
  eyebrow = "Messaging · Voice · Video",
  headline = "Every message arrives the moment you send it.",
  subcopy = "Text, voice notes, video messages, and calls — on one connection that stays open across all your devices.",
  stats = defaultStats,
}: AuthArtProps) {
  return (
    <section className="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-[#111821] px-11 py-11 text-white lg:flex dark:bg-[#070A0F]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_5%,rgba(43,63,255,0.42),transparent_62%),radial-gradient(90%_80%_at_92%_96%,rgba(255,45,111,0.28),transparent_58%)]"
      />

      <MotionItem>
        <Link
          href="/sign-in"
          className="relative z-2 inline-flex cursor-pointer items-center gap-[11px] font-display text-[19px] font-bold tracking-[-0.02em]"
        >
          <span className="grid size-[34px] place-items-center rounded-[10px] bg-signal text-white">
            <AudioLines className="size-[19px] stroke-[2.2]" aria-hidden />
          </span>
          ChatWave
        </Link>
      </MotionItem>

      <div className="relative z-2 max-w-[440px]">
        <MotionItem delay={0.05}>
          <p className="mb-[18px] font-mono text-[11.5px] font-semibold tracking-[0.18em] text-white/55 uppercase">
            {eyebrow}
          </p>
        </MotionItem>
        <MotionItem delay={0.1}>
          <h1 className="mb-4 font-display text-[clamp(34px,3.4vw,50px)] leading-[1.03] font-extrabold tracking-[-0.04em]">
            {headline}
          </h1>
        </MotionItem>
        <MotionItem delay={0.16}>
          <p className="text-base leading-[1.55] text-white/72">{subcopy}</p>
        </MotionItem>

        <AuthChatScene />
      </div>

      <div className="relative z-2 flex gap-[26px] text-[12.5px] text-white/50">
        {stats.map((stat, index) => (
          <MotionItem key={stat.label} delay={0.22 + index * 0.06}>
            <b className="block font-mono text-[17px] font-bold text-white">
              {stat.value}
            </b>
            {stat.label}
          </MotionItem>
        ))}
      </div>
    </section>
  )
}
