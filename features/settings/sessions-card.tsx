"use client"

import { formatDistanceToNow } from "date-fns"
import { Shield } from "lucide-react"
import { toast } from "sonner"

import { useSettings } from "./settings-provider"
import { Button } from "../../components/ui/button"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { useRevokeSessionMutation } from "../../lib/store/auth-api"
import type { SettingsSession } from "../../lib/types/settings"

function isCurrentSession(session: SettingsSession) {
  return Boolean(session.current || session.thisDevice)
}

function sessionTitle(session: SettingsSession) {
  if (session.name?.trim()) return session.name.trim()
  if (session.device?.trim()) return session.device.trim()
  if (session.browser && session.os) {
    return `${session.browser} on ${session.os}`
  }
  if (session.browser?.trim()) return session.browser.trim()
  if (session.os?.trim()) return session.os.trim()
  return "Session"
}

function sessionWhen(session: SettingsSession) {
  if (isCurrentSession(session)) return "active now"
  const stamp = session.lastActive || session.lastActiveAt
  if (!stamp) return null
  const date = new Date(stamp)
  if (Number.isNaN(date.getTime())) return stamp
  return formatDistanceToNow(date, { addSuffix: true })
}

function sessionMeta(session: SettingsSession) {
  return [session.location, sessionWhen(session)].filter(Boolean).join(" · ")
}

function SessionRow({
  session,
  current,
  onRevoke,
  revoking,
}: {
  session: SettingsSession
  current: boolean
  onRevoke: (id: string) => void
  revoking: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-3.5 py-[13px]">
      <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-signal-wash text-signal">
        <Shield className="size-5 stroke-[1.75]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold text-ink">
          {sessionTitle(session)}
          {current ? " — this device" : ""}
        </span>
        <span className="mt-px block font-mono text-[13px] text-ink-3">
          {sessionMeta(session) || "Signed in"}
        </span>
      </span>
      {current ? (
        <span className="rounded-full bg-ok-wash px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ok">
          Current
        </span>
      ) : (
        <Button
          type="button"
          variant="ghost"
          disabled={revoking || !session.id}
          onClick={() => onRevoke(session.id)}
          className="h-[34px] rounded-[14px] border border-edge px-3 text-[13px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          Sign out
        </Button>
      )}
    </div>
  )
}

export function SessionsCard() {
  const { sessions } = useSettings()
  const [revokeSession, { isLoading: revoking }] = useRevokeSessionMutation()

  async function onRevoke(id: string) {
    try {
      await revokeSession(id).unwrap()
      toast("Session ended")
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not sign out that device"))
    }
  }

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Active sessions
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          Devices signed in to this account
        </p>
      </div>
      <div className="divide-y divide-edge px-5 py-1.5">
        {sessions.length === 0 ? (
          <div className="flex flex-wrap items-center gap-3.5 py-[13px]">
            <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-signal-wash text-signal">
              <Shield className="size-5 stroke-[1.75]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-ink">
                This device
              </span>
              <span className="mt-px block font-mono text-[13px] text-ink-3">
                Active now
              </span>
            </span>
            <span className="rounded-full bg-ok-wash px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ok">
              Current
            </span>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionRow
              key={session.id || sessionTitle(session)}
              session={session}
              current={isCurrentSession(session)}
              onRevoke={(id) => void onRevoke(id)}
              revoking={revoking}
            />
          ))
        )}
      </div>
    </section>
  )
}
