"use client"

import { toast } from "sonner"

import { SettingRow } from "./setting-row"
import { Button } from "../../components/ui/button"
import { Switch } from "../../components/ui/switch"

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
          hint="2 people cannot message or call you"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => toast("Blocked list opened")}
            className="h-[34px] rounded-[14px] border border-edge bg-surface-2 px-3 text-[13px] font-medium text-ink hover:bg-surface-3"
          >
            Manage
          </Button>
        </SettingRow>
      </div>
    </section>
  )
}
