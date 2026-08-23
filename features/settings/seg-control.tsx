import { cn } from "../../lib/utils"

type SegControlProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  ariaLabel: string
}

export function SegControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: SegControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex gap-[3px] rounded-[11px] border border-edge bg-surface-2 p-[3px]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "cursor-pointer rounded-lg px-[13px] py-1.5 text-[13px] font-medium text-ink-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
            value === option.value &&
              "bg-surface text-ink shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
