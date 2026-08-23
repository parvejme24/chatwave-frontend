import { cn } from "../../lib/utils"

export function SettingRow({
  title,
  hint,
  children,
  className,
}: {
  title: string
  hint: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-t border-edge py-[15px] first:border-t-0",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h4 className="text-[14.5px] font-semibold text-ink">{title}</h4>
        <p className="mt-0.5 text-[13px] text-ink-3">{hint}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
