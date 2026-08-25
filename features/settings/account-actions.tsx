"use client"

import { useState } from "react"
import { LogOut, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { useLogoutMutation } from "../../lib/store/auth-api"
import { useRequestDeleteAccountMutation } from "../../lib/store/settings-api"

export function AccountActions() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [logout, { isLoading: signingOut }] = useLogoutMutation()
  const [requestDelete, { isLoading: requesting }] =
    useRequestDeleteAccountMutation()

  async function signOut() {
    try {
      await logout().unwrap()
    } catch {
      /* Auth slice still clears the local session */
    }
    toast.success("Signed out")
    router.push("/sign-in")
  }

  async function startDelete() {
    try {
      await requestDelete().unwrap()
      setOpen(false)
      toast.success("Check your email to confirm account deletion")
    } catch (error) {
      toast.error(
        mutationErrorMessage(error, "Could not start account deletion")
      )
    }
  }

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="px-5 pt-1.5 pb-3.5">
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void signOut()}
          className="flex w-full cursor-pointer items-center gap-[11px] border-b border-edge py-[11px] text-left text-sm text-ink disabled:opacity-50"
        >
          <LogOut className="size-[18px] stroke-[1.75] text-ink-3" aria-hidden />
          Sign out of this device
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full cursor-pointer items-center gap-[11px] py-[11px] text-left text-sm text-pulse"
        >
          <Trash2 className="size-[18px] stroke-[1.75]" aria-hidden />
          Delete account
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[420px] bg-surface sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-display text-[17px] font-bold text-ink">
              Delete your account?
            </DialogTitle>
            <DialogDescription className="text-[13px] text-ink-3">
              We will email you a confirmation link. Your account is not deleted
              until you open that link.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-edge bg-transparent">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              className="h-[34px] rounded-[14px] border border-edge bg-surface-2 px-3 text-[13px] font-medium text-ink hover:bg-surface-3"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={requesting}
              onClick={() => void startDelete()}
              className="h-[34px] rounded-[14px] px-3 text-[13px] font-medium"
            >
              Email me a link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
