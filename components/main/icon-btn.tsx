import { cn } from "@/lib/utils"

type IconBtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function IconBtn({
  className,
  active,
  type = "button",
  ...props
}: IconBtnProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink max-[479px]:size-[38px]",
        active && "bg-signal-wash text-signal",
        className
      )}
      {...props}
    />
  )
}
