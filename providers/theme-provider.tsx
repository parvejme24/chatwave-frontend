"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"

import { ChatProvider } from "../features/chats/chat-provider"
import { RealtimeHost } from "../features/realtime/realtime-host"
import { SettingsProvider } from "../features/settings/settings-provider"
import { ThemeSwitch } from "../components/shared/theme-switch"
import { StoreProvider } from "./store-provider"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <StoreProvider>
        <SettingsProvider>
          <RealtimeHost />
          <ChatProvider>{children}</ChatProvider>
        </SettingsProvider>
      </StoreProvider>
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
