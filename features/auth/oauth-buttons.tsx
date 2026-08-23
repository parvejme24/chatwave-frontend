"use client"

import { toast } from "sonner"

import { MotionItem } from "../../components/motion/motion-item"
import { Button } from "../../components/ui/button"
import { apiUrl } from "../../lib/api"

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[19px]" aria-hidden>
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
    <svg viewBox="0 0 24 24" className="size-[19px]" aria-hidden>
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.2 4.9 18.2 5.2 18.2 5.2c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"
      />
    </svg>
  )
}

const oauthButtonClassName =
  "h-11 w-full gap-2 rounded-[14px] border-edge bg-transparent text-[14.5px] font-medium tracking-[-0.01em] text-ink-2 hover:bg-surface-2 hover:text-ink"

type OAuthButtonsProps = {
  disabled?: boolean
}

export function OAuthButtons({ disabled }: OAuthButtonsProps) {
  function continueWith(provider: "google" | "github") {
    toast("Redirecting…")
    window.location.href = apiUrl(`/api/auth/${provider}`)
  }

  return (
    <div className="flex flex-col gap-[9px]">
      <MotionItem delay={0.28}>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => continueWith("google")}
          className={oauthButtonClassName}
        >
          <GoogleMark />
          Continue with Google
        </Button>
      </MotionItem>
      <MotionItem delay={0.32}>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => continueWith("github")}
          className={oauthButtonClassName}
        >
          <GitHubMark />
          Continue with GitHub
        </Button>
      </MotionItem>
    </div>
  )
}
