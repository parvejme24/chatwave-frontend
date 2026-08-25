"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { LegalShell } from "../legal/legal-shell"
import { Button } from "../../components/ui/button"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { useLogoutMutation } from "../../lib/store/auth-api"
import { selectAccessToken } from "../../lib/store/auth-slice"
import { useAppSelector } from "../../lib/store/hooks"
import { useConfirmDeleteAccountMutation } from "../../lib/store/settings-api"

export function DeleteAccountConfirmPage() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token")?.trim() ?? ""
  const accessToken = useAppSelector(selectAccessToken)
  const [logout] = useLogoutMutation()
  const [confirmDelete, { isLoading, isSuccess }] =
    useConfirmDeleteAccountMutation()
  const [done, setDone] = useState(false)

  async function confirm() {
    if (!token) return
    try {
      await confirmDelete({ token }).unwrap()
      if (accessToken) {
        try {
          await logout().unwrap()
        } catch {
          /* local session still clears */
        }
      }
      setDone(true)
      toast.success("Your account has been deleted")
      router.replace("/sign-in")
    } catch (error) {
      toast.error(
        mutationErrorMessage(error, "Could not confirm account deletion")
      )
    }
  }

  return (
    <LegalShell>
      <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink">
        Delete account
      </h1>
      <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-3">
        {token
          ? "This permanently removes your ChatWave account, conversations, and sign-in methods. You cannot undo this."
          : "This confirmation link is missing a token. Open the link from the email we sent you."}
      </p>
      <div className="mt-8 flex flex-wrap gap-2.5">
        <Button
          type="button"
          variant="destructive"
          disabled={!token || isLoading || isSuccess || done}
          onClick={() => void confirm()}
          className="h-11 rounded-[14px] px-4 text-[14.5px] font-medium"
        >
          {isLoading ? "Deleting…" : "Delete my account"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/sign-in")}
          className="h-11 rounded-[14px] border border-edge bg-surface-2 px-4 text-[14.5px] font-medium text-ink hover:bg-surface-3"
        >
          Cancel
        </Button>
      </div>
    </LegalShell>
  )
}
