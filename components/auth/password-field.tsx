"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const inputClassName =
  "h-[46px] rounded-[14px] border-edge bg-surface-2 px-3.5 pr-11 text-[15px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash dark:bg-surface-2 dark:focus-visible:bg-surface"

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "className"
> & {
  label?: string
  autoComplete?: "current-password" | "new-password"
}

export function PasswordField({
  id = "password",
  label = "Password",
  autoComplete = "current-password",
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-[7px]">
      <Label htmlFor={id} className="text-[13px] font-semibold text-ink">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className={inputClassName}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          className={cn(
            "absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-ink-4 transition-colors hover:text-ink-2"
          )}
        >
          {visible ? (
            <EyeOff className="size-4 stroke-[1.75]" aria-hidden />
          ) : (
            <Eye className="size-4 stroke-[1.75]" aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}
