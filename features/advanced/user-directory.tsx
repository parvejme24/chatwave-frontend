"use client"

import { Ban, Clock3, Search, ShieldAlert, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { UserHistoryDialog } from "./user-history-dialog"
import { ContactListSkeleton } from "../../components/shared/loading-skeletons"
import { UserAvatar } from "../../components/shared/user-avatar"
import { Input } from "../../components/ui/input"
import { useDebouncedValue } from "../../lib/hooks/use-debounced-value"
import { playSound } from "../../lib/sounds"
import { mutationErrorMessage } from "../../lib/store/api-error"
import {
  useBanAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
  useUnbanAdminUserMutation,
} from "../../lib/store/admin-api"
import { selectAuthUser } from "../../lib/store/auth-slice"
import { useAppSelector } from "../../lib/store/hooks"
import { contactInitials } from "../../lib/types/contact"
import { cn } from "../../lib/utils"

export function UserDirectory() {
  const me = useAppSelector(selectAuthUser)
  const [query, setQuery] = useState("")
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const debounced = useDebouncedValue(query, 300)
  const { data, isFetching, isError, error } = useGetAdminUsersQuery({
    q: debounced.trim() || undefined,
    limit: 50,
  })
  const [banUser, { isLoading: banning }] = useBanAdminUserMutation()
  const [unbanUser, { isLoading: unbanning }] = useUnbanAdminUserMutation()
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation()

  const users = data?.users ?? []
  const total = data?.total ?? users.length
  const bannedCount = data?.bannedCount ?? 0
  const historyUser = users.find((user) => user.id === historyId) ?? null
  const busy = banning || unbanning || deleting

  async function toggleBan(id: string, name: string, banned: boolean) {
    try {
      if (banned) {
        await unbanUser(id).unwrap()
        toast(`${name} is active again`)
      } else {
        await banUser(id).unwrap()
        toast(`${name} is banned`)
      }
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not update account"))
    }
  }

  async function confirmDelete(id: string, name: string) {
    try {
      await deleteUser(id).unwrap()
      playSound("delete")
      toast(`${name} was deleted`)
      setConfirmId(null)
      if (historyId === id) setHistoryId(null)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not delete account"))
    }
  }

  return (
    <section className="overflow-hidden rounded-[20px] border border-pulse/35 bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="flex items-center gap-3 border-b border-edge px-5 py-3">
        <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-pulse-wash text-pulse">
          <ShieldAlert className="size-5 stroke-[1.75]" aria-hidden />
        </span>
        <p className="min-w-0 text-[13px] text-ink-3">
          {isFetching && !users.length ? (
            "Loading accounts…"
          ) : (
            <>
              <span className="font-semibold text-ink">{total} accounts</span>
              {bannedCount > 0 ? ` · ${bannedCount} banned` : " · none banned"}
            </>
          )}
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
        {!users.length ? (
          isFetching && !isError ? (
            <ContactListSkeleton count={5} className="px-1" />
          ) : (
            <p className="px-3 py-8 text-center text-sm text-ink-3">
              {isError
                ? mutationErrorMessage(error, "Could not load accounts")
                : query.trim()
                  ? "No accounts match that search."
                  : "No accounts yet."}
            </p>
          )
        ) : (
          users.map((user) => {
            const banned = user.status === "banned"
            const confirming = confirmId === user.id
            const locked = Boolean(user.isOwner) || user.id === me?.id
            return (
              <div key={user.id} className="rounded-[14px] px-2.5 py-3">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    initials={user.initials || contactInitials(user.name)}
                    tone={user.tone}
                    photo={user.photoUrl}
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
                      {user.eventCount ?? user.history.length} events · Joined{" "}
                      {user.joined || "—"}
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
                  {locked ? null : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggleBan(user.id, user.name, banned)}
                      className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[10px] border border-edge bg-surface-2 px-2.5 text-[12.5px] font-medium text-ink-2 hover:bg-surface-3 disabled:opacity-50"
                    >
                      <Ban className="size-3.5 stroke-[1.75]" aria-hidden />
                      {banned ? "Unban" : "Ban"}
                    </button>
                  )}
                  {locked ? null : confirming ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void confirmDelete(user.id, user.name)}
                      className="inline-flex h-[32px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-pulse px-2.5 text-[12.5px] font-medium text-white hover:bg-pulse/90 disabled:opacity-50"
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
        userId={historyId}
        onClose={() => setHistoryId(null)}
      />
    </section>
  )
}
