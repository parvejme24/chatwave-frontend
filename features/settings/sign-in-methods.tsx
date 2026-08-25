"use client"

import { Mail } from "lucide-react"

import { useSettings } from "./settings-provider"
import { Button } from "../../components/ui/button"
import { remoteApiUrl } from "../../lib/api"

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  )
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.2 4.9 18.2 5.2 18.2 5.2c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"
      />
    </svg>
  )
}

function MethodIcon({
  children,
  wash,
}: {
  children: React.ReactNode
  wash?: boolean
}) {
  return (
    <span
      className={
        wash
          ? "grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-surface-2 text-ink"
          : "grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-signal-wash text-signal"
      }
    >
      {children}
    </span>
  )
}

function LinkedBadge() {
  return (
    <span className="rounded-full bg-ok-wash px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ok">
      Linked
    </span>
  )
}

function LinkButton({ provider }: { provider: "google" | "github" }) {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        window.location.href = remoteApiUrl(`/api/auth/${provider}`)
      }}
      className="h-[34px] rounded-[14px] border border-edge bg-surface-2 px-3 text-[13px] font-medium text-ink hover:bg-surface-3"
    >
      Link
    </Button>
  )
}

export function SignInMethods() {
  const { authMethods } = useSettings()
  const email = authMethods.email || "Not set"
  const google = authMethods.providers.google
  const github = authMethods.providers.github

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Sign-in methods
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          Any of these gets you into the same account
        </p>
      </div>
      <div className="px-5 py-1.5">
        <div className="flex flex-wrap items-center gap-3.5 py-[13px]">
          <MethodIcon>
            <Mail className="size-5 stroke-[1.75]" aria-hidden />
          </MethodIcon>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ink">
              Email
            </span>
            <span className="mt-px block font-mono text-[13px] text-ink-3">
              {email}
            </span>
          </span>
          <span className="rounded-full bg-ok-wash px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ok">
            {authMethods.emailVerified ? "Verified" : "Unverified"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 border-t border-edge py-[13px]">
          <MethodIcon wash>
            <GoogleMark />
          </MethodIcon>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ink">
              Google
            </span>
            <span className="mt-px block text-[13px] text-ink-3">
              {google ? "Connected to this account" : "Not connected"}
            </span>
          </span>
          {google ? <LinkedBadge /> : <LinkButton provider="google" />}
        </div>
        <div className="flex flex-wrap items-center gap-3.5 border-t border-edge py-[13px]">
          <MethodIcon wash>
            <GitHubMark />
          </MethodIcon>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ink">
              GitHub
            </span>
            <span className="mt-px block text-[13px] text-ink-3">
              {github ? "Connected to this account" : "Not connected"}
            </span>
          </span>
          {github ? <LinkedBadge /> : <LinkButton provider="github" />}
        </div>
      </div>
    </section>
  )
}
