"use client"

import { MotionItem } from "@/components/motion/motion-item"

export type LegalSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

type LegalDocProps = {
  eyebrow?: string
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}

export function LegalDoc({
  eyebrow = "Legal",
  title,
  updated,
  intro,
  sections,
}: LegalDocProps) {
  return (
    <article>
      <MotionItem>
        <p className="mb-3 font-mono text-[11.5px] font-semibold tracking-[0.18em] text-ink-3 uppercase">
          {eyebrow}
        </p>
      </MotionItem>
      <MotionItem delay={0.05}>
        <h1 className="font-display text-[clamp(32px,5vw,46px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-ink">
          {title}
        </h1>
      </MotionItem>
      <MotionItem delay={0.1}>
        <p className="mt-3 font-mono text-[12.5px] text-ink-3">
          Last updated {updated}
        </p>
      </MotionItem>
      <MotionItem delay={0.14}>
        <p className="mt-6 text-[16px] leading-[1.65] text-ink-2">{intro}</p>
      </MotionItem>

      <div className="mt-10 space-y-9">
        {sections.map((section, index) => (
          <MotionItem key={section.title} delay={0.16 + index * 0.03}>
            <section className="scroll-mt-8">
              <h2 className="font-display text-[20px] leading-snug font-bold tracking-[-0.03em] text-ink">
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-[15px] leading-[1.7] text-ink-2"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-[1.7] text-ink-2">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          </MotionItem>
        ))}
      </div>
    </article>
  )
}
