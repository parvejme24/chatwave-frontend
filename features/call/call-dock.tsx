"use client"

import {
  Ear,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
} from "lucide-react"
import { toast } from "sonner"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import { cn } from "../../lib/utils"

type CallDockProps = {
  kind: "audio" | "video"
  muted: boolean
  cameraOff: boolean
  speakerOn: boolean
  sharing: boolean
  visible: boolean
  /** Media controls stay off until the remote party answers. */
  controlsEnabled?: boolean
  onMutedChange: (value: boolean) => void
  onCameraOffChange: (value: boolean) => void
  onSpeakerOnChange: (value: boolean) => void
  onSharingChange: (value: boolean) => void
  onEnd: () => void
}

export function CallDock({
  kind,
  muted,
  cameraOff,
  speakerOn,
  sharing,
  visible,
  controlsEnabled = true,
  onMutedChange,
  onCameraOffChange,
  onSpeakerOnChange,
  onSharingChange,
  onEnd,
}: CallDockProps) {
  return (
    <TooltipProvider delay={200}>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex items-end justify-center gap-[18px] px-4 pt-4 pb-[calc(22px+env(safe-area-inset-bottom))] transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] max-[859px]:gap-[9px] max-[859px]:pb-[calc(18px+env(safe-area-inset-bottom))] [@media(max-height:520px)_and_(orientation:landscape)]:gap-3 [@media(max-height:520px)_and_(orientation:landscape)]:pt-2 [@media(max-height:520px)_and_(orientation:landscape)]:pb-[calc(12px+env(safe-area-inset-bottom))]",
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <DockButton
          label={muted ? "Unmute" : "Mute"}
          off={muted}
          disabled={!controlsEnabled}
          onClick={() => {
            onMutedChange(!muted)
            toast(muted ? "Microphone on" : "Microphone muted")
          }}
        >
          {muted ? (
            <MicOff className="size-6 stroke-[1.75]" aria-hidden />
          ) : (
            <Mic className="size-6 stroke-[1.75]" aria-hidden />
          )}
        </DockButton>

        {kind === "video" ? (
          <DockButton
            label={cameraOff ? "Turn camera on" : "Turn camera off"}
            off={cameraOff}
            disabled={!controlsEnabled}
            onClick={() => {
              onCameraOffChange(!cameraOff)
              toast(cameraOff ? "Camera on" : "Camera off")
            }}
          >
            {cameraOff ? (
              <VideoOff className="size-6 stroke-[1.75]" aria-hidden />
            ) : (
              <Video className="size-6 stroke-[1.75]" aria-hidden />
            )}
          </DockButton>
        ) : null}

        <DockButton
          label={speakerOn ? "Speaker" : "Earpiece"}
          off={!speakerOn}
          disabled={!controlsEnabled}
          onClick={() => {
            onSpeakerOnChange(!speakerOn)
            toast(speakerOn ? "Switched to earpiece" : "Speaker on")
          }}
        >
          {speakerOn ? (
            <Volume2 className="size-6 stroke-[1.75]" aria-hidden />
          ) : (
            <Ear className="size-6 stroke-[1.75]" aria-hidden />
          )}
        </DockButton>

        {kind === "video" ? (
          <DockButton
            label={sharing ? "Stop share" : "Share screen"}
            off={!sharing}
            disabled={!controlsEnabled}
            onClick={(event) => {
              // Keep this click from landing on End after the label/layout updates.
              event.preventDefault()
              event.stopPropagation()
              onSharingChange(!sharing)
            }}
          >
            <MonitorUp className="size-6 stroke-[1.75]" aria-hidden />
          </DockButton>
        ) : null}

        <span className="mx-1 hidden h-10 w-px bg-white/15 sm:block" aria-hidden />

        <DockButton label="End" end onClick={onEnd}>
          <PhoneOff className="size-6 stroke-[1.75]" aria-hidden />
        </DockButton>
      </div>
    </TooltipProvider>
  )
}

function DockButton({
  label,
  off,
  end,
  disabled,
  onClick,
  children,
}: {
  label: string
  off?: boolean
  end?: boolean
  disabled?: boolean
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={end ? undefined : !off}
            disabled={disabled}
            onClick={onClick}
            className={cn(
              "flex w-[72px] flex-col items-center gap-1.5 text-[11px] text-white/70 max-[859px]:w-[58px] max-[859px]:[&_.dock-label]:hidden",
              disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
            )}
          />
        }
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-[background-color,color,transform,opacity] duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
            end
              ? "size-[66px] bg-pulse text-white hover:-translate-y-0.5 hover:brightness-110 max-[859px]:size-[60px]"
              : "size-14 max-[859px]:size-[52px]",
            !end &&
              (off
                ? "bg-white text-[#0A0D13]"
                : "bg-white/11 text-white backdrop-blur-md"),
            !end &&
              !disabled &&
              (off
                ? "hover:-translate-y-0.5"
                : "hover:-translate-y-0.5 hover:bg-white/20")
          )}
        >
          {children}
        </span>
        <span className="dock-label truncate">{label}</span>
      </TooltipTrigger>
      <TooltipContent side="top">
        {disabled && !end ? "Available when the call connects" : label}
      </TooltipContent>
    </Tooltip>
  )
}
