"use client"

import { useRef } from "react"

import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { cn } from "../../lib/utils"

const OTP_LENGTH = 6

type OtpFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  invalid?: boolean
}

export function OtpField({
  value,
  onChange,
  disabled,
  invalid,
}: OtpFieldProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? "")

  function focusAt(index: number) {
    inputsRef.current[index]?.focus()
    inputsRef.current[index]?.select()
  }

  function setDigits(next: string[]) {
    onChange(next.join("").slice(0, OTP_LENGTH))
  }

  function handleChange(index: number, raw: string) {
    const nextDigit = raw.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = nextDigit
    setDigits(next)

    if (nextDigit && index < OTP_LENGTH - 1) {
      focusAt(index + 1)
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault()
      const next = [...digits]
      next[index - 1] = ""
      setDigits(next)
      focusAt(index - 1)
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault()
      focusAt(index - 1)
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)

    if (!pasted) return

    setDigits(pasted.split(""))
    focusAt(Math.min(pasted.length, OTP_LENGTH) - 1)
  }

  return (
    <div className="space-y-[7px]">
      <Label className="text-[13px] font-semibold text-ink">
        Verification code
      </Label>
      <div className="flex gap-2">
        {digits.map((digit, index) => (
          <Input
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node
            }}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${index + 1}`}
            aria-invalid={invalid}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.currentTarget.select()}
            className={cn(
              "h-[46px] w-full rounded-[14px] border-edge bg-surface-2 px-0 text-center font-mono text-[18px] text-ink focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash dark:bg-surface-2 dark:focus-visible:bg-surface"
            )}
          />
        ))}
      </div>
    </div>
  )
}
