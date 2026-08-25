"use client"

import { MotionItem } from "../../components/motion/motion-item"
import { AccountActions } from "./account-actions"
import { AdvancedEntry } from "./advanced-entry"
import { AppearanceCard } from "./appearance-card"
import { MediaCard } from "./media-card"
import { NotificationsCard } from "./notifications-card"
import { PrivacyCard } from "./privacy-card"
import { ProfileCard } from "./profile-card"
import { SessionsCard } from "./sessions-card"
import { useSettings } from "./settings-provider"
import { SoundsCard } from "./sounds-card"
import { SignInMethods } from "./sign-in-methods"
import { isAppOwner } from "../../lib/data/settings"
import { playSound, setSoundsEnabled } from "../../lib/sounds"
import { formatStorageUsed } from "../../lib/types/settings"

export function SettingsPage() {
  const { settings, setSettings, profile, storage } = useSettings()
  const owner = isAppOwner(profile)

  return (
    <section className="h-dvh overflow-y-auto bg-paper max-[859px]:pb-[calc(74px+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-[780px] px-[26px] pt-[34px] pb-[70px] max-[859px]:px-[18px] max-[859px]:pt-[26px]">
        <MotionItem className="mb-[26px]">
          <header>
            <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink max-[859px]:text-[27px]">
              Settings
            </h1>
            <p className="mt-[5px] text-[14.5px] text-ink-3">
              Your account, privacy, and how ChatWave behaves.
            </p>
          </header>
        </MotionItem>

        <MotionItem delay={0.04}>
          <ProfileCard />
        </MotionItem>
        <MotionItem delay={0.08}>
          <SignInMethods />
        </MotionItem>
        <MotionItem delay={0.12}>
          <AppearanceCard
            reduceMotion={settings.reduceMotion}
            onThemeChange={(theme) =>
              setSettings((current) => ({ ...current, theme }))
            }
            onReduceMotionChange={(reduceMotion) =>
              setSettings((current) => ({ ...current, reduceMotion }))
            }
          />
        </MotionItem>
        <MotionItem delay={0.16}>
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
        </MotionItem>
        <MotionItem delay={0.2}>
          <SoundsCard
            enabled={settings.notificationSounds}
            favorites={settings.soundFavorites}
            onChange={(soundFavorites) =>
              setSettings((current) => ({ ...current, soundFavorites }))
            }
          />
        </MotionItem>
        <MotionItem delay={0.24}>
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
        </MotionItem>
        <MotionItem delay={0.28}>
          <MediaCard
            videoQuality={settings.videoQuality}
            noiseSuppression={settings.noiseSuppression}
            autoDownload={settings.autoDownload}
            storageHint={formatStorageUsed(storage)}
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
        </MotionItem>
        <MotionItem delay={0.32}>
          <SessionsCard />
        </MotionItem>
        {owner ? (
          <MotionItem delay={0.36}>
            <AdvancedEntry />
          </MotionItem>
        ) : null}
        <MotionItem delay={owner ? 0.4 : 0.36}>
          <AccountActions />
        </MotionItem>

        <MotionItem delay={owner ? 0.44 : 0.4}>
          <p className="mt-2 text-center font-mono text-[12.5px] text-ink-4">
            ChatWave · UI prototype v1.0
          </p>
        </MotionItem>
      </div>
    </section>
  )
}
