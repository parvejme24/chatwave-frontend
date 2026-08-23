"use client"

import { SettingRow } from "./setting-row"
import { Switch } from "../../components/ui/switch"

type NotificationsState = {
  messageNotifications: boolean
  notificationSounds: boolean
  missedCallEmails: boolean
  unreadDigest: boolean
}

export function NotificationsCard({
  value,
  onChange,
}: {
  value: NotificationsState
  onChange: (value: NotificationsState) => void
}) {
  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Notifications
        </h3>
      </div>
      <div className="px-5 py-1.5">
        <SettingRow
          title="Message notifications"
          hint="Desktop alerts when a message arrives"
        >
          <Switch
            checked={value.messageNotifications}
            onCheckedChange={(checked) =>
              onChange({ ...value, messageNotifications: checked })
            }
            aria-label="Message notifications"
            className="cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          title="Play sounds"
          hint="Turn this off if you do not want any ChatWave sounds"
        >
          <Switch
            checked={value.notificationSounds}
            onCheckedChange={(checked) =>
              onChange({ ...value, notificationSounds: checked })
            }
            aria-label="Play sounds"
            className="cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          title="Email me about missed calls"
          hint="Only when you have been offline for 30 minutes"
        >
          <Switch
            checked={value.missedCallEmails}
            onCheckedChange={(checked) =>
              onChange({ ...value, missedCallEmails: checked })
            }
            aria-label="Email me about missed calls"
            className="cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          title="Unread digest"
          hint="One summary email instead of a message per alert"
        >
          <Switch
            checked={value.unreadDigest}
            onCheckedChange={(checked) =>
              onChange({ ...value, unreadDigest: checked })
            }
            aria-label="Unread digest"
            className="cursor-pointer"
          />
        </SettingRow>
      </div>
    </section>
  )
}
