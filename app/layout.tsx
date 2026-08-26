import type { Metadata } from "next"
import {
  Bricolage_Grotesque,
  Inter_Tight,
  JetBrains_Mono,
} from "next/font/google"

import { ThemeProvider } from "../providers/theme-provider"

import "./globals.css"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz"],
  display: "swap",
  preload: false,
})

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  preload: false,
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: "ChatWave",
    template: "%s · ChatWave",
  },
  description:
    "Messaging, voice notes, and calls that stay in sync across every device.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/app-icon.png", sizes: "1024x1024" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className={`${sans.className} flex min-h-full flex-col font-sans`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
