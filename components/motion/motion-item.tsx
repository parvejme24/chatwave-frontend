"use client"

import { motion, useReducedMotion } from "framer-motion"

export const signalEase = [0.22, 0.61, 0.36, 1] as const

type MotionItemProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function MotionItem({
  children,
  className,
  delay = 0,
}: MotionItemProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: signalEase }}
    >
      {children}
    </motion.div>
  )
}
