import { AuthArt } from "./auth-art"
import { AuthFormPanel } from "./auth-form-panel"
import { ForgotPasswordForm } from "./forgot-password-form"
import { GuestOnly } from "./guest-only"
import { MotionItem } from "../../components/motion/motion-item"

export function ForgotPasswordPage() {
  return (
    <GuestOnly>
    <main className="grid min-h-dvh bg-surface lg:grid-cols-2">
      <AuthArt
        eyebrow="Reset access"
        headline="Get back in without losing the thread."
        subcopy="We'll email a one-time code. Enter it, choose a new password, and you're back on the same line."
        stats={[
          { value: "6", label: "digit code" },
          { value: "10m", label: "code lifetime" },
          { value: "1", label: "use per code" },
        ]}
      />
      <AuthFormPanel>
        <MotionItem>
          <h2 className="font-display text-[29px] leading-none font-bold tracking-[-0.03em] text-ink">
            Forgot password
          </h2>
        </MotionItem>
        <MotionItem delay={0.05}>
          <p className="mt-[7px] mb-[30px] text-[14.5px] text-ink-3">
            Enter your email and we&apos;ll send a 6-digit code to verify it&apos;s
            you.
          </p>
        </MotionItem>
        <ForgotPasswordForm />
      </AuthFormPanel>
    </main>
    </GuestOnly>
  )
}
