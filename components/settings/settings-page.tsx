"use client"

import { AccountActions } from "@/components/settings/account-actions"
import { AppearanceCard } from "@/components/settings/appearance-card"
import { MediaCard } from "@/components/settings/media-card"
import { NotificationsCard } from "@/components/settings/notifications-card"
import { PrivacyCard } from "@/components/settings/privacy-card"
import { ProfileCard } from "@/components/settings/profile-card"
import { SessionsCard } from "@/components/settings/sessions-card"
import { useSettings } from "@/components/settings/settings-provider"
import { SoundsCard } from "@/components/settings/sounds-card"
import { SignInMethods } from "@/components/settings/sign-in-methods"
import { playSound, setSoundsEnabled } from "@/lib/sounds"

export function SettingsPage() {
  const { settings, setSettings } = useSettings()

  return (
    <section className="h-dvh overflow-y-auto bg-paper max-[859px]:pb-[calc(74px+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[780px] px-[26px] pt-[34px] pb-[70px] max-[859px]:px-[18px] max-[859px]:pt-[26px]">
        <header className="mb-[26px]">
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink max-[859px]:text-[27px]">
            Settings
          </h1>
          <p className="mt-[5px] text-[14.5px] text-ink-3">
            Your account, privacy, and how ChatWave behaves.
          </p>
        </header>

        <ProfileCard />
        <SignInMethods />
        <AppearanceCard
          reduceMotion={settings.reduceMotion}
          onReduceMotionChange={(reduceMotion) =>
            setSettings((current) => ({ ...current, reduceMotion }))
          }
        />
        <NotificationsCard
          value={settings}
          onChange={(next) => {
            const turningOn =
              next.notificationSounds && !settings.notificationSounds
            setSettings((current) => ({ ...current, ...next }))
            if (turningOn) {
              setSoundsEnabled(true)
              playSound("notify")
            }
          }}
        />
        <SoundsCard
          enabled={settings.notificationSounds}
          favorites={settings.soundFavorites}
          onChange={(soundFavorites) =>
            setSettings((current) => ({ ...current, soundFavorites }))
          }
        />
        <PrivacyCard
          readReceipts={settings.readReceipts}
          showLastSeen={settings.showLastSeen}
          onReadReceiptsChange={(readReceipts) =>
            setSettings((current) => ({ ...current, readReceipts }))
          }
          onShowLastSeenChange={(showLastSeen) =>
            setSettings((current) => ({ ...current, showLastSeen }))
          }
        />
        <MediaCard
          videoQuality={settings.videoQuality}
          noiseSuppression={settings.noiseSuppression}
          autoDownload={settings.autoDownload}
          onVideoQualityChange={(videoQuality) =>
            setSettings((current) => ({ ...current, videoQuality }))
          }
          onNoiseSuppressionChange={(noiseSuppression) =>
            setSettings((current) => ({ ...current, noiseSuppression }))
          }
          onAutoDownloadChange={(autoDownload) =>
            setSettings((current) => ({ ...current, autoDownload }))
          }
        />
        <SessionsCard
          androidSession={settings.androidSession}
          onAndroidSignOut={() =>
            setSettings((current) => ({ ...current, androidSession: false }))
          }
        />
        <AccountActions />

        <p className="mt-2 text-center font-mono text-[12.5px] text-ink-4">
          ChatWave · UI prototype v1.0
        </p>
      </div>
    </section>
  )
}
