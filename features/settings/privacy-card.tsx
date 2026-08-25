"use client"

import { useState } from "react"
import { toast } from "sonner"

import { SettingRow } from "./setting-row"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Switch } from "../../components/ui/switch"
import { UserAvatar } from "../../components/shared/user-avatar"
import { mutationErrorMessage } from "../../lib/store/api-error"
import {
  useGetBlocksQuery,
  useUnblockUserMutation,
} from "../../lib/store/blocks-api"
import { formatConversationTime } from "../../lib/types/chat"

export function PrivacyCard({
  readReceipts,
  showLastSeen,
  onReadReceiptsChange,
  onShowLastSeenChange,
}: {
  readReceipts: boolean
  showLastSeen: boolean
  onReadReceiptsChange: (value: boolean) => void
  onShowLastSeenChange: (value: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const { data, isFetching } = useGetBlocksQuery()
  const [unblock, { isLoading: unblocking }] = useUnblockUserMutation()
  const total = data?.total ?? data?.blocks.length ?? 0
  const people = total === 1 ? "person" : "people"

  async function unblockPerson(userId: string, name: string) {
    try {
      await unblock(userId).unwrap()
      toast(`${name} can message you again`)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not unblock"))
    }
  }

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Privacy
        </h3>
      </div>
      <div className="px-5 py-1.5">
        <SettingRow
          title="Send read receipts"
          hint="Turn this off and you stop seeing other people's too"
        >
          <Switch
            checked={readReceipts}
            onCheckedChange={onReadReceiptsChange}
            aria-label="Send read receipts"
            className="cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          title="Show last seen"
          hint="Contacts can see when you were last active"
        >
          <Switch
            checked={showLastSeen}
            onCheckedChange={onShowLastSeenChange}
            aria-label="Show last seen"
            className="cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          title="Blocked contacts"
          hint={
            isFetching && total === 0
              ? "Loading blocked contacts"
              : `${total} ${people} cannot message or call you`
          }
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(true)}
            className="h-[34px] rounded-[14px] border border-edge bg-surface-2 px-3 text-[13px] font-medium text-ink hover:bg-surface-3"
          >
            Manage
          </Button>
        </SettingRow>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[420px] bg-surface p-0 sm:max-w-[420px]">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="font-display text-[17px] font-bold text-ink">
              Blocked contacts
            </DialogTitle>
            <DialogDescription className="text-[13px] text-ink-3">
              People you block cannot message or call you.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[360px] overflow-y-auto px-3 pb-4">
            {isFetching && total === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-ink-3">
                Loading…
              </p>
            ) : total === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-ink-3">
                You have not blocked anyone.
              </p>
            ) : (
              (data?.blocks ?? []).map((block) => (
                <div
                  key={block.id}
                  className="flex items-center gap-3 rounded-[14px] px-2 py-2.5"
                >
                  <UserAvatar
                    initials={block.initials}
                    tone={block.tone}
                    photo={block.photoUrl}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {block.name}
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-3">
                      @{block.username}
                      {block.blockedAt
                        ? ` · ${formatConversationTime(block.blockedAt)}`
                        : ""}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={unblocking}
                    onClick={() => void unblockPerson(block.id, block.name)}
                    className="h-8 rounded-[11px] border border-edge bg-surface-2 px-2.5 text-[12.5px] font-medium text-ink hover:bg-surface-3"
                  >
                    Unblock
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
