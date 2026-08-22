import type { Metadata } from "next"

import { AuthArt } from "@/components/auth/auth-art"
import { AuthFormPanel } from "@/components/auth/auth-form-panel"
import { SignInForm } from "@/components/auth/sign-in-form"
import { MotionItem } from "@/components/motion/motion-item"

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Messaging, voice notes, and calls that stay in sync across every device.",
}

export default function SignInPage() {
  return (
    <main className="grid min-h-dvh bg-surface lg:grid-cols-2">
      <AuthArt />
      <AuthFormPanel>
        <MotionItem>
          <h2 className="font-display text-[29px] leading-none font-bold tracking-[-0.03em] text-ink">
            Sign in
          </h2>
        </MotionItem>
        <MotionItem delay={0.05}>
          <p className="mt-[7px] mb-[30px] text-[14.5px] text-ink-3">
            Use your email and password to continue.
          </p>
        </MotionItem>
        <SignInForm />
      </AuthFormPanel>
    </main>
  )
}
