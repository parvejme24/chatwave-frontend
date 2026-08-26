import { UserAvatar } from "../../../components/shared/user-avatar"
import type { SeenByPerson } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"

const PREVIEW = 4

export function SeenByRow({
  people,
  count,
}: {
  people: SeenByPerson[]
  count?: number
  outgoing?: boolean
}) {
  const shown = people.slice(0, PREVIEW)
  const total = Math.max(count ?? 0, people.length)
  if (total <= 0 && shown.length === 0) return null
  const extra = Math.max(0, total - shown.length)
  const first = people[0]
  const label =
    total === 1
      ? `Seen by ${first?.name || first?.initials || "1"}`
      : `Seen by ${total}`

  return (
    <span
      className="mt-1 inline-flex items-center gap-1.5 px-1"
      title={people.map((person) => person.name || person.initials).join(", ")}
    >
      {shown.length ? (
        <span className="flex items-center">
          {shown.map((person, index) => (
            <UserAvatar
              key={person.id}
              initials={person.initials}
              tone={person.tone}
              photo={person.photo}
              size="xs"
              className={cn(
                "size-5 text-[8px] ring-2 ring-paper",
                index > 0 && "-ml-1.5"
              )}
            />
          ))}
        </span>
      ) : null}
      <span className="font-mono text-[10.5px] text-ink-3">
        {label}
        {extra > 0 && shown.length ? ` · +${extra}` : ""}
      </span>
    </span>
  )
}
