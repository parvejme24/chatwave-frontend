import { AuthArt } from "./auth-art"
import { AuthFormPanel } from "./auth-form-panel"
import { MotionItem } from "../../components/motion/motion-item"
import { SignInForm } from "./sign-in-form"

export function SignInPage() {
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
