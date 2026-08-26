import { Skeleton } from "../ui/skeleton"
import { cn } from "../../lib/utils"

export function ConversationRowSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-[14px] px-2.5 py-[11px]",
        className
      )}
      aria-hidden
    >
      <Skeleton className="size-11 shrink-0 rounded-full bg-surface-2" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3.5 w-[42%] rounded-md bg-surface-2" />
          <Skeleton className="h-2.5 w-10 rounded-md bg-surface-2" />
        </div>
        <Skeleton className="h-3 w-[68%] rounded-md bg-surface-2" />
      </div>
    </div>
  )
}

export function ConversationListSkeleton({
  count = 8,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-0.5", className)} aria-busy aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <ConversationRowSkeleton key={index} />
      ))}
    </div>
  )
}

export function CallRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-[14px] px-2.5 py-[11px]",
        className
      )}
      aria-hidden
    >
      <Skeleton className="size-11 shrink-0 rounded-full bg-surface-2" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-[38%] rounded-md bg-surface-2" />
        <Skeleton className="h-3 w-[52%] rounded-md bg-surface-2" />
      </div>
      <Skeleton className="size-10 shrink-0 rounded-[11px] bg-surface-2" />
    </div>
  )
}

export function CallListSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-0.5", className)} aria-busy aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <CallRowSkeleton key={index} />
      ))}
    </div>
  )
}

export function ContactRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-3 py-[13px]", className)}
      aria-hidden
    >
      <Skeleton className="size-11 shrink-0 rounded-full bg-surface-2" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-[40%] rounded-md bg-surface-2" />
        <Skeleton className="h-3 w-[55%] rounded-md bg-surface-2" />
      </div>
      <Skeleton className="h-8 w-[72px] shrink-0 rounded-[12px] bg-surface-2" />
    </div>
  )
}

export function ContactListSkeleton({
  count = 5,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-0.5", className)} aria-busy aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <ContactRowSkeleton key={index} />
      ))}
    </div>
  )
}

export function MessageBubbleSkeleton({
  outgoing = false,
  className,
}: {
  outgoing?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex max-w-full items-end gap-2.5",
        outgoing && "flex-row-reverse",
        className
      )}
      aria-hidden
    >
      <Skeleton className="mb-0.5 size-7 shrink-0 rounded-full bg-surface-2" />
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1.5",
          outgoing ? "items-end" : "items-start"
        )}
      >
        <Skeleton
          className={cn(
            "h-11 rounded-[18px] bg-surface-2",
            outgoing ? "w-[min(220px,58vw)] rounded-br-[7px]" : "w-[min(260px,62vw)] rounded-bl-[7px]"
          )}
        />
        <Skeleton className="h-2.5 w-12 rounded-md bg-surface-2" />
      </div>
    </div>
  )
}

export function MessageListSkeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-6 pt-5 pb-4 max-[859px]:px-3.5",
        className
      )}
      aria-busy
      aria-label="Loading messages"
    >
      <Skeleton className="mx-auto h-6 w-16 rounded-full bg-surface-2" />
      <MessageBubbleSkeleton />
      <MessageBubbleSkeleton outgoing />
      <MessageBubbleSkeleton />
      <MessageBubbleSkeleton outgoing />
      <MessageBubbleSkeleton />
      <MessageBubbleSkeleton outgoing />
    </div>
  )
}

export function ThreadSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex h-full min-w-0 flex-1 flex-col bg-paper", className)}
      aria-busy
      aria-label="Loading conversation"
    >
      <div className="flex items-center gap-3 border-b border-edge px-4 py-3">
        <Skeleton className="size-10 shrink-0 rounded-full bg-surface-2" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-[36%] rounded-md bg-surface-2" />
          <Skeleton className="h-3 w-[24%] rounded-md bg-surface-2" />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-[11px] bg-surface-2" />
        <Skeleton className="size-9 shrink-0 rounded-[11px] bg-surface-2" />
      </div>
      <div className="min-h-0 flex-1">
        <MessageListSkeleton />
      </div>
      <div className="border-t border-edge px-4 py-3">
        <Skeleton className="h-11 w-full rounded-[18px] bg-surface-2" />
      </div>
    </div>
  )
}

export function MediaGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn("grid grid-cols-3 gap-1.5", className)}
      aria-busy
      aria-label="Loading media"
    >
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          className="aspect-square rounded-[10px] bg-surface-2"
        />
      ))}
    </div>
  )
}

export function PeoplePickerSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-1", className)} aria-busy aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-1 py-2">
          <Skeleton className="size-9 shrink-0 rounded-full bg-surface-2" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-[44%] rounded-md bg-surface-2" />
            <Skeleton className="h-2.5 w-[30%] rounded-md bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  )
}
