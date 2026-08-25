import { AuthArt } from "./auth-art"
import { AuthFormPanel } from "./auth-form-panel"
import { GuestOnly } from "./guest-only"
import { MotionItem } from "../../components/motion/motion-item"
import { SignUpForm } from "./sign-up-form"

export function SignUpPage() {
  return (
    <GuestOnly>
    <main className="grid min-h-dvh bg-surface lg:grid-cols-2">
      <AuthArt
        eyebrow="New on ChatWave"
        headline="Join the conversation. Stay on the same line."
        subcopy="Create an account with your name, email, and a password. One login for text, voice, and calls across every device."
        stats={[
          { value: "Free", label: "to start" },
          { value: "P2P", label: "encrypted calls" },
          { value: "3", label: "ways to join" },
        ]}
      />
      <AuthFormPanel>
        <MotionItem>
          <h2 className="font-display text-[29px] leading-none font-bold tracking-[-0.03em] text-ink">
            Create account
          </h2>
        </MotionItem>
        <MotionItem delay={0.05}>
          <p className="mt-[7px] mb-[30px] text-[14.5px] text-ink-3">
            Tell us your name, email, and a password to get started.
          </p>
        </MotionItem>
        <SignUpForm />
      </AuthFormPanel>
    </main>
    </GuestOnly>
  )
}
