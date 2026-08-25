"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm, type SubmitErrorHandler } from "react-hook-form"
import { toast } from "sonner"

import { OtpField } from "./otp-field"
import { PasswordField } from "./password-field"
import { MotionItem } from "../../components/motion/motion-item"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "../../lib/store/auth-api"
import { mutationErrorMessage } from "../../lib/store/api-error"
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "../../lib/validations/auth"

const inputClassName =
  "h-[46px] rounded-[14px] border-edge bg-surface-2 px-3.5 text-[15px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash dark:bg-surface-2 dark:focus-visible:bg-surface"

const RESET_EMAIL_KEY = "cw_reset_email"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [forgotPassword, { isLoading: sendingRemote }] =
    useForgotPasswordMutation()
  const [resetPassword, { isLoading: resettingRemote }] =
    useResetPasswordMutation()
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [resending, setResending] = useState(false)

  const emailForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  })

  const watchedEmail = emailForm.watch("email")
  const otp = resetForm.watch("otp")
  const password = resetForm.watch("password")
  const confirmPassword = resetForm.watch("confirmPassword")

  const emailReady = watchedEmail.trim().length > 0
  const resetReady =
    otp.trim().length === 6 &&
    password.trim().length > 0 &&
    confirmPassword.trim().length > 0

  const sendingCode = sendingRemote || emailForm.formState.isSubmitting
  const resetting = resettingRemote || resetForm.formState.isSubmitting

  const onEmailInvalid: SubmitErrorHandler<ForgotPasswordValues> = () => {
    toast.error("Enter a valid email address")
    emailForm.setFocus("email")
  }

  const onResetInvalid: SubmitErrorHandler<ResetPasswordValues> = (errors) => {
    if (errors.otp) {
      toast.error(errors.otp.message ?? "Enter the 6-digit code")
      return
    }

    if (errors.password) {
      toast.error(errors.password.message ?? "Enter a password")
      resetForm.setFocus("password")
      return
    }

    toast.error(errors.confirmPassword?.message ?? "Confirm your password")
    resetForm.setFocus("confirmPassword")
  }

  async function sendCode(address: string) {
    await forgotPassword({ email: address }).unwrap()
  }

  async function onEmailSubmit(values: ForgotPasswordValues) {
    try {
      await sendCode(values.email)
      sessionStorage.setItem(RESET_EMAIL_KEY, values.email)
      setEmail(values.email)
      resetForm.reset({ otp: "", password: "", confirmPassword: "" })
      setStep("otp")
      toast.success("Verification code sent")
    } catch (error) {
      toast.error(
        mutationErrorMessage(error, "Could not send verification code")
      )
    }
  }

  async function onResetSubmit(values: ResetPasswordValues) {
    try {
      await resetPassword({
        email,
        otp: values.otp,
        password: values.password,
      }).unwrap()
      toast.success("Password updated")
      router.push("/sign-in")
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not reset password"))
    }
  }

  async function resendCode() {
    if (!email) return

    setResending(true)
    try {
      await sendCode(email)
      toast.success("New code sent")
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not send a new code"))
    } finally {
      setResending(false)
    }
  }

  if (step === "otp") {
    return (
      <div>
        <form
          noValidate
          onSubmit={resetForm.handleSubmit(onResetSubmit, onResetInvalid)}
          className="space-y-4"
        >
          <MotionItem>
            <p className="text-[14.5px] text-ink-3">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-ink">{email}</span>.
            </p>
          </MotionItem>

          <MotionItem delay={0.06}>
            <Controller
              name="otp"
              control={resetForm.control}
              render={({ field, fieldState }) => (
                <OtpField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={resetting}
                  invalid={!!fieldState.error}
                />
              )}
            />
          </MotionItem>

          <MotionItem delay={0.12}>
            <PasswordField
              id="new-password"
              label="New password"
              autoComplete="new-password"
              aria-invalid={!!resetForm.formState.errors.password}
              {...resetForm.register("password")}
            />
          </MotionItem>

          <MotionItem delay={0.18}>
            <PasswordField
              id="confirm-password"
              label="Confirm password"
              autoComplete="new-password"
              aria-invalid={!!resetForm.formState.errors.confirmPassword}
              {...resetForm.register("confirmPassword")}
            />
          </MotionItem>

          <MotionItem delay={0.24}>
            <Button
              type="submit"
              disabled={!resetReady || resetting}
              className="h-[46px] w-full gap-2 rounded-[14px] bg-signal text-[14.5px] font-medium tracking-[-0.01em] text-white hover:bg-signal-deep focus-visible:border-signal focus-visible:ring-signal-wash"
            >
              {resetting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <KeyRound className="size-4 stroke-[1.75]" aria-hidden />
              )}
              Reset password
            </Button>
          </MotionItem>
        </form>

        <MotionItem delay={0.3}>
          <p className="mt-[26px] text-[14.5px] text-ink-3">
            Didn&apos;t get a code?{" "}
            <button
              type="button"
              disabled={resending || resetting}
              onClick={resendCode}
              className="cursor-pointer font-medium text-signal underline-offset-2 hover:underline disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </p>
        </MotionItem>

        <MotionItem delay={0.34}>
          <p className="mt-3.5 text-[14.5px] text-ink-3">
            Wrong address?{" "}
            <button
              type="button"
              disabled={resetting}
              onClick={() => setStep("email")}
              className="cursor-pointer font-medium text-signal underline-offset-2 hover:underline"
            >
              Use a different email
            </button>
          </p>
        </MotionItem>
      </div>
    )
  }

  return (
    <div>
      <form
        noValidate
        onSubmit={emailForm.handleSubmit(onEmailSubmit, onEmailInvalid)}
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
              aria-invalid={!!emailForm.formState.errors.email}
              className={inputClassName}
              {...emailForm.register("email")}
            />
          </div>
        </MotionItem>

        <MotionItem delay={0.16}>
          <Button
            type="submit"
            disabled={!emailReady || sendingCode}
            className="h-[46px] w-full gap-2 rounded-[14px] bg-signal text-[14.5px] font-medium tracking-[-0.01em] text-white hover:bg-signal-deep focus-visible:border-signal focus-visible:ring-signal-wash"
          >
            {sendingCode ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Mail className="size-4 stroke-[1.75]" aria-hidden />
            )}
            Send verification code
          </Button>
        </MotionItem>
      </form>

      <MotionItem delay={0.22}>
        <p className="mt-[26px] text-[14.5px] text-ink-3">
          Remembered it?{" "}
          <Link
            href="/sign-in"
            className="cursor-pointer font-medium text-signal underline-offset-2 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </MotionItem>
    </div>
  )
}
