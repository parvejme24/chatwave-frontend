"use client"

import { motion, useReducedMotion } from "framer-motion"

import { signalEase } from "../../components/motion/motion-item"

const CYCLE = 7.4

const opening = [
  {
    id: "in-1",
    side: "in" as const,
    text: "Just dropped the voice note.",
    times: [0, 0.06, 0.88, 1],
  },
  {
    id: "out-1",
    side: "out" as const,
    text: "Heard. I'm on the call.",
    times: [0.12, 0.18, 0.88, 1],
  },
] as const

const reply = {
  id: "in-2",
  side: "in" as const,
  text: "Joining now.",
  times: [0.46, 0.52, 0.88, 1],
} as const

function bubbleClass(side: "in" | "out") {
  if (side === "out") {
    return "ml-auto max-w-[78%] rounded-[16px_16px_5px_16px] bg-signal px-3.5 py-2 text-[13px] leading-snug text-white"
  }

  return "mr-auto max-w-[78%] rounded-[16px_16px_16px_5px] bg-white/12 px-3.5 py-2 text-[13px] leading-snug text-white/90"
}

export function AuthChatScene() {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return (
      <div className="mt-9 flex max-w-[300px] flex-col gap-2" aria-hidden>
        {[...opening, reply].map((message) => (
          <p key={message.id} className={bubbleClass(message.side)}>
            {message.text}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-9 flex max-w-[300px] flex-col gap-2" aria-hidden>
      {opening.map((message) => (
        <motion.p
          key={message.id}
          className={bubbleClass(message.side)}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [8, 0, 0, 0],
            scale: [0.96, 1, 1, 1],
          }}
          transition={{
            duration: CYCLE,
            times: [...message.times],
            repeat: Infinity,
            ease: signalEase,
          }}
        >
          {message.text}
        </motion.p>
      ))}

      <div className="relative min-h-[38px]">
        <motion.div
          className="flex w-fit items-center gap-1 rounded-[16px_16px_16px_5px] bg-white/12 px-3.5 py-2.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [8, 0, 0, 0],
          }}
          transition={{
            duration: CYCLE,
            times: [0.28, 0.32, 0.42, 0.46],
            repeat: Infinity,
            ease: signalEase,
          }}
        >
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="size-1.5 rounded-full bg-white/70"
              animate={{ opacity: [0.28, 1, 0.28], y: [0, -2.5, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: dot * 0.14,
                ease: signalEase,
              }}
            />
          ))}
        </motion.div>

        <motion.p
          className={`absolute inset-x-0 top-0 ${bubbleClass(reply.side)}`}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [8, 0, 0, 0],
            scale: [0.96, 1, 1, 1],
          }}
          transition={{
            duration: CYCLE,
            times: [...reply.times],
            repeat: Infinity,
            ease: signalEase,
          }}
        >
          {reply.text}
        </motion.p>
      </div>
    </div>
  )
}
