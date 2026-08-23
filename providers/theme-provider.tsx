"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"

import { ChatProvider } from "../features/chats/chat-provider"
import { SettingsProvider } from "../features/settings/settings-provider"
import { ThemeSwitch } from "../components/shared/theme-switch"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SettingsProvider>
        <ChatProvider>{children}</ChatProvider>
      </SettingsProvider>
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
