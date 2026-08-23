"use client"

import { Ban, Clock3, Search, ShieldAlert, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { UserHistoryDialog } from "./user-history-dialog"
import { useSettings } from "../settings/settings-provider"
import { UserAvatar } from "../../components/shared/user-avatar"
import { Input } from "../../components/ui/input"
import { filterManagedUsers } from "../../lib/data/admin-users"
import { playSound } from "../../lib/sounds"
import { contactInitials } from "../../lib/types/contact"
import { cn } from "../../lib/utils"

export function UserDirectory() {
  const { users, banUser, unbanUser, deleteUser } = useSettings()
  const [query, setQuery] = useState("")
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const shown = useMemo(() => filterManagedUsers(users, query), [query, users])
  const historyUser = users.find((user) => user.id === historyId) ?? null
  const bannedCount = users.filter((user) => user.status === "banned").length

  return (
    <section className="overflow-hidden rounded-[20px] border border-pulse/35 bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="flex items-center gap-3 border-b border-edge px-5 py-3">
        <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-pulse-wash text-pulse">
          <ShieldAlert className="size-5 stroke-[1.75]" aria-hidden />
        </span>
        <p className="min-w-0 text-[13px] text-ink-3">
          <span className="font-semibold text-ink">{users.length} accounts</span>
          {bannedCount > 0 ? ` · ${bannedCount} banned` : " · none banned"}
        </p>
      </div>

      <div className="px-5 pt-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-[13px] size-[17px] -translate-y-1/2 text-ink-4"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, username, or email"
            aria-label="Search users"
            className="h-[42px] rounded-[14px] border-edge bg-surface-2 pr-3.5 pl-[39px] text-[14.5px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash"
          />
        </div>
      </div>

      <div className="px-2.5 pt-2 pb-3">
        {shown.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-ink-3">
            No accounts match that search.
          </p>
        ) : (
          shown.map((user) => {
            const banned = user.status === "banned"
            const confirming = confirmId === user.id
            return (
              <div key={user.id} className="rounded-[14px] px-2.5 py-3">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    initials={contactInitials(user.name)}
                    tone={user.tone}
                    presence={user.presence}
                    showPresence={!banned}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[14.5px] font-semibold text-ink">
                        {user.name}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase",
                          banned
                            ? "bg-pulse-wash text-pulse"
                            : "bg-ok-wash text-ok"
                        )}
                      >
                        {banned ? "Banned" : "Active"}
                      </span>
                    </div>
                    <p className="truncate text-[13px] text-ink-3">
                      @{user.user} · {user.email}
                    </p>
                    <p className="mt-0.5 font-mono text-[11.5px] text-ink-4">
                      {user.history.length} events · Joined {user.joined}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5 pl-14">
                  <button
                    type="button"
                    onClick={() => setHistoryId(user.id)}
                    className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[10px] border border-edge bg-surface-2 px-2.5 text-[12.5px] font-medium text-ink-2 hover:bg-surface-3"
                  >
                    <Clock3 className="size-3.5 stroke-[1.75]" aria-hidden />
                    History
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (banned) {
                        unbanUser(user.id)
                        toast(`${user.name} is active again`)
                      } else {
                        banUser(user.id)
                        toast(`${user.name} is banned`)
                      }
                    }}
                    className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[10px] border border-edge bg-surface-2 px-2.5 text-[12.5px] font-medium text-ink-2 hover:bg-surface-3"
                  >
                    <Ban className="size-3.5 stroke-[1.75]" aria-hidden />
                    {banned ? "Unban" : "Ban"}
                  </button>
                  {confirming ? (
                    <button
                      type="button"
                      onClick={() => {
                        deleteUser(user.id)
                        playSound("delete")
                        toast(`${user.name} was deleted`)
                        setConfirmId(null)
                        if (historyId === user.id) setHistoryId(null)
                      }}
                      className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-pulse px-2.5 text-[12.5px] font-medium text-white hover:bg-pulse/90"
                    >
                      Confirm delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(user.id)}
                      className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[10px] border border-pulse/30 bg-pulse-wash px-2.5 text-[12.5px] font-medium text-pulse hover:bg-pulse/15"
                    >
                      <Trash2 className="size-3.5 stroke-[1.75]" aria-hidden />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <UserHistoryDialog
        user={historyUser}
        onClose={() => setHistoryId(null)}
      />
    </section>
  )
}
