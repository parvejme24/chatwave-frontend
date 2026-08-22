"use client"

import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { signalEase } from "@/components/motion/motion-item"
import { cn } from "@/lib/utils"

type ThemeSwitchProps = {
  className?: string
}

const appPaths = ["/chats", "/calls", "/contacts", "/settings", "/call"]

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const hide = appPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (hide) return null

  return (
    <motion.button
      type="button"
      aria-label="Switch theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.18, ease: signalEase }}
      className={cn(
        "inline-flex size-11 cursor-pointer items-center justify-center rounded-[14px] border border-edge bg-surface text-ink-2 shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)] transition-colors hover:bg-surface-2 hover:text-ink focus-visible:rounded-[14px] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <Sun className="hidden size-[18px] stroke-[1.75] dark:block" aria-hidden />
      <Moon className="size-[18px] stroke-[1.75] dark:hidden" aria-hidden />
    </motion.button>
  )
}
