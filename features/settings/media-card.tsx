"use client"

import { toast } from "sonner"

import { SegControl } from "./seg-control"
import { SettingRow } from "./setting-row"
import { Button } from "../../components/ui/button"
import { Switch } from "../../components/ui/switch"
import type { VideoQuality } from "../../lib/data/settings"

const qualityOptions = [
  { value: "auto", label: "Auto" },
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
] as const

export function MediaCard({
  videoQuality,
  noiseSuppression,
  autoDownload,
  storageHint,
  onVideoQualityChange,
  onNoiseSuppressionChange,
  onAutoDownloadChange,
}: {
  videoQuality: VideoQuality
  noiseSuppression: boolean
  autoDownload: boolean
  storageHint?: string | null
  onVideoQualityChange: (value: VideoQuality) => void
  onNoiseSuppressionChange: (value: boolean) => void
  onAutoDownloadChange: (value: boolean) => void
}) {
  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Calls and media
        </h3>
      </div>
      <div className="px-5 py-1.5">
        <SettingRow
          title="Video call quality"
          hint="Higher quality uses more data on mobile networks"
        >
          <SegControl
            ariaLabel="Video call quality"
            value={videoQuality}
            onChange={onVideoQualityChange}
            options={[...qualityOptions]}
          />
        </SettingRow>
        <SettingRow
          title="Noise suppression"
          hint="Filters background sound on calls and voice messages"
        >
          <Switch
            checked={noiseSuppression}
            onCheckedChange={onNoiseSuppressionChange}
            aria-label="Noise suppression"
            className="cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          title="Download media automatically"
          hint="Photos and voice messages save as they arrive"
        >
          <Switch
            checked={autoDownload}
            onCheckedChange={onAutoDownloadChange}
            aria-label="Download media automatically"
            className="cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          title="Storage used"
          hint={storageHint ?? "Cache on this device only"}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => toast("Storage cleared")}
            className="h-[34px] rounded-[14px] border border-edge bg-surface-2 px-3 text-[13px] font-medium text-ink hover:bg-surface-3"
          >
            Clear cache
          </Button>
        </SettingRow>
      </div>
    </section>
  )
}
