"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"

import { ThemeSwitch } from "@/components/theme-switch"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <ThemeSwitch className="fixed right-5 bottom-5 z-50" />
      <Toaster
        theme="system"
        richColors
        position="top-center"
        closeButton={false}
      />
    </NextThemesProvider>
  )
}
