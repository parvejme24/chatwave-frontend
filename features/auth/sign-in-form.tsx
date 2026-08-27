"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FlaskConical, Loader2, LogIn } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, type SubmitErrorHandler } from "react-hook-form"
import { toast } from "sonner"

import { PasswordField } from "./password-field"
import { MotionItem } from "../../components/motion/motion-item"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { DEMO_ACCOUNT } from "../../lib/auth/demo-account"
import {
  useLoginMutation,
  useRegisterMutation,
} from "../../lib/store/auth-api"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { signInSchema, type SignInValues } from "../../lib/validations/auth"

const inputClassName =
  "h-[46px] rounded-[14px] border-edge bg-surface-2 px-3.5 text-[15px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash dark:bg-surface-2 dark:focus-visible:bg-surface"

export function SignInForm() {
  const router = useRouter()
  const [login, { isLoading: isLoggingIn }] = useLoginMutation()
  const [registerAccount, { isLoading: isRegistering }] = useRegisterMutation()
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const email = form.watch("email")
  const password = form.watch("password")
  const isComplete = email.trim().length > 0 && password.trim().length > 0
  const isSubmitting =
    isLoggingIn || isRegistering || form.formState.isSubmitting

  const onInvalid: SubmitErrorHandler<SignInValues> = (errors) => {
    if (errors.email) {
      toast.error(errors.email.message ?? "Enter a valid email address")
      form.setFocus("email")
      return
    }

    toast.error(errors.password?.message ?? "Password is required")
    form.setFocus("password")
  }

  async function onSubmit(values: SignInValues) {
    try {
      await login({
        email: values.email,
        password: values.password,
      }).unwrap()
      toast.success("Signed in")
      router.push("/chats")
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not sign in"))
    }
  }

  async function useDemoAccount() {
    form.setValue("email", DEMO_ACCOUNT.email, { shouldValidate: true })
    form.setValue("password", DEMO_ACCOUNT.password, { shouldValidate: true })

    try {
      await login({
        email: DEMO_ACCOUNT.email,
        password: DEMO_ACCOUNT.password,
      }).unwrap()
      toast.success("Signed in with demo account")
      router.push("/chats")
      return
    } catch {
      /* Demo user may not exist yet — create then sign in. */
    }

    try {
      await registerAccount({
        name: DEMO_ACCOUNT.name,
        email: DEMO_ACCOUNT.email,
        password: DEMO_ACCOUNT.password,
      }).unwrap()
      await login({
        email: DEMO_ACCOUNT.email,
        password: DEMO_ACCOUNT.password,
      }).unwrap()
      toast.success("Demo account ready — signed in")
      router.push("/chats")
    } catch (error) {
      toast.error(
        mutationErrorMessage(
          error,
          "Could not start the demo account. Try signing up manually."
        )
      )
    }
  }

  return (
    <div>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-4"
      >
        <MotionItem delay={0.1}>
          <div className="space-y-[7px]">
            <Label htmlFor="email" className="text-[13px] font-semibold text-ink">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.email}
              className={inputClassName}
              {...form.register("email")}
            />
          </div>
        </MotionItem>

        <MotionItem delay={0.15}>
          <div className="space-y-2">
            <PasswordField
              autoComplete="current-password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="cursor-pointer text-[12.5px] font-medium text-signal underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </MotionItem>

        <MotionItem delay={0.2}>
          <Button
            type="submit"
            disabled={!isComplete || isSubmitting}
            className="h-[46px] w-full gap-2 rounded-[14px] bg-signal text-[14.5px] font-medium tracking-[-0.01em] text-white hover:bg-signal-deep focus-visible:border-signal focus-visible:ring-signal-wash"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="size-4 stroke-[1.75]" aria-hidden />
            )}
            Sign in
          </Button>
        </MotionItem>
      </form>

      <MotionItem delay={0.22}>
        <div className="relative mt-4 overflow-hidden rounded-[16px] border border-signal/20 bg-signal-wash">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-signal"
            aria-hidden
          />
          <div className="px-4 pt-3.5 pb-3.5 pl-[18px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px] bg-signal text-white shadow-[0_6px_16px_-8px_rgba(43,63,255,0.7)]">
                <FlaskConical className="size-4 stroke-[1.75]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
                  Try a demo account
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-3">
                  Instant access for portfolio reviews — no signup needed.
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-2.5">
              <div className="space-y-1">
                <Label
                  htmlFor="demo-email"
                  className="text-[11px] font-semibold tracking-[0.04em] text-ink-3 uppercase"
                >
                  Email
                </Label>
                <Input
                  id="demo-email"
                  type="email"
                  readOnly
                  value={DEMO_ACCOUNT.email}
                  onFocus={(event) => event.currentTarget.select()}
                  className="h-10 cursor-text rounded-[11px] border-edge/80 bg-surface font-mono text-[13px] text-ink shadow-none focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-signal-wash"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="demo-password"
                  className="text-[11px] font-semibold tracking-[0.04em] text-ink-3 uppercase"
                >
                  Password
                </Label>
                <Input
                  id="demo-password"
                  type="text"
                  readOnly
                  value={DEMO_ACCOUNT.password}
                  onFocus={(event) => event.currentTarget.select()}
                  className="h-10 cursor-text rounded-[11px] border-edge/80 bg-surface font-mono text-[13px] text-ink shadow-none focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-signal-wash"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void useDemoAccount()}
              className="mt-3 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-ink text-[13.5px] font-medium tracking-[-0.01em] text-paper transition-[transform,background-color,opacity] duration-200 hover:-translate-y-px hover:bg-ink/90 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-[#0A0D13] dark:hover:bg-white/90"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <FlaskConical className="size-4 stroke-[1.75]" aria-hidden />
              )}
              Continue with demo
            </button>
          </div>
        </div>
      </MotionItem>

      <MotionItem delay={0.25}>
        <p className="mt-[26px] text-[14.5px] text-ink-3">
          New to ChatWave?{" "}
          <Link
            href="/sign-up"
            className="cursor-pointer font-medium text-signal underline-offset-2 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </MotionItem>

      <MotionItem delay={0.42}>
        <p className="mt-3.5 text-[12.5px] leading-[1.55] text-ink-4">
          By continuing you agree to the{" "}
          <Link
            href="/terms"
            className="cursor-pointer text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="cursor-pointer text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            Privacy Policy
          </Link>
          . We&apos;ll only email you about your account.
        </p>
      </MotionItem>
    </div>
  )
}
