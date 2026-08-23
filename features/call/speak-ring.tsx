"use client"

import { motion, useReducedMotion } from "framer-motion"

import { signalEase } from "../../components/motion/motion-item"
import { cn } from "../../lib/utils"

const sizes = {
  lg: "size-[150px] text-[46px] max-[479px]:size-[118px] max-[479px]:text-[36px] [@media(max-height:520px)_and_(orientation:landscape)]:size-[92px] [@media(max-height:520px)_and_(orientation:landscape)]:text-[28px]",
  md: "size-[120px] text-[38px] max-[479px]:size-[118px] max-[479px]:text-[36px] [@media(max-height:520px)_and_(orientation:landscape)]:size-[92px] [@media(max-height:520px)_and_(orientation:landscape)]:text-[28px]",
  sm: "size-24 text-[30px]",
} as const

export function SpeakRing({
  initials,
  size = "lg",
  ripple = true,
}: {
  initials: string
  size?: keyof typeof sizes
  ripple?: boolean
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={cn("relative grid place-items-center", sizes[size])}>
      {ripple
        ? [0, 0.65, 1.3].map((delay) => (
            <motion.span
              key={delay}
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-signal"
              initial={false}
              animate={
                reduceMotion
                  ? { opacity: 0.2, scale: 1 }
                  : { scale: [1, 2.1], opacity: [0.55, 0] }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 2.6, delay, repeat: Infinity, ease: signalEase }
              }
            />
          ))
        : null}
      <span className="relative z-[1] grid size-full place-items-center rounded-full border-[3px] border-white/14 bg-linear-to-br from-[#3A4A63] to-[#1B2431] font-display font-bold text-white">
        {initials}
      </span>
    </div>
  )
}
