"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, type SubmitErrorHandler } from "react-hook-form"
import { toast } from "sonner"

import { PasswordField } from "./password-field"
import { MotionItem } from "../../components/motion/motion-item"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useRegisterMutation } from "../../lib/store/auth-api"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { signUpSchema, type SignUpValues } from "../../lib/validations/auth"

const inputClassName =
  "h-[46px] rounded-[14px] border-edge bg-surface-2 px-3.5 text-[15px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash dark:bg-surface-2 dark:focus-visible:bg-surface"

export function SignUpForm() {
  const router = useRouter()
  const [registerAccount, { isLoading }] = useRegisterMutation()
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const name = form.watch("name")
  const email = form.watch("email")
  const password = form.watch("password")
  const isComplete =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0
  const isSubmitting = isLoading || form.formState.isSubmitting

  const onInvalid: SubmitErrorHandler<SignUpValues> = (errors) => {
    if (errors.name) {
      toast.error(errors.name.message ?? "Enter your name")
      form.setFocus("name")
      return
    }

    if (errors.email) {
      toast.error(errors.email.message ?? "Enter a valid email address")
      form.setFocus("email")
      return
    }

    toast.error(errors.password?.message ?? "Enter a password")
    form.setFocus("password")
  }

  async function onSubmit(values: SignUpValues) {
    try {
      await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap()
      toast.success("Account created")
      router.push("/sign-in")
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not create your account"))
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
            <Label htmlFor="name" className="text-[13px] font-semibold text-ink">
              Your name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ayesha Rahman"
              autoComplete="name"
              aria-invalid={!!form.formState.errors.name}
              className={inputClassName}
              {...form.register("name")}
            />
          </div>
        </MotionItem>

        <MotionItem delay={0.15}>
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

        <MotionItem delay={0.2}>
          <PasswordField
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
        </MotionItem>

        <MotionItem delay={0.25}>
          <Button
            type="submit"
            disabled={!isComplete || isSubmitting}
            className="h-[46px] w-full gap-2 rounded-[14px] bg-signal text-[14.5px] font-medium tracking-[-0.01em] text-white hover:bg-signal-deep focus-visible:border-signal focus-visible:ring-signal-wash"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <UserPlus className="size-4 stroke-[1.75]" aria-hidden />
            )}
            Create account
          </Button>
        </MotionItem>
      </form>

      <MotionItem delay={0.3}>
        <p className="mt-[26px] text-[14.5px] text-ink-3">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="cursor-pointer font-medium text-signal underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </MotionItem>

      <MotionItem delay={0.46}>
        <p className="mt-3.5 text-[12.5px] leading-[1.55] text-ink-4">
          By creating an account you agree to the{" "}
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
