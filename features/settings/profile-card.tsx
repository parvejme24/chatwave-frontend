"use client"

import { Camera, Loader2, Pen, X } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { useSettings } from "./settings-provider"
import { UserAvatar } from "../../components/shared/user-avatar"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  initialsFromName,
  profileBio,
  profileHandle,
  type SettingsProfile,
} from "../../lib/data/settings"
import {
  mutationErrorMessage,
  photoUploadErrorMessage,
} from "../../lib/store/api-error"
import {
  useDeleteMyPhotoMutation,
  useUpdateMyPhotoMutation,
  useUpdateMyUserMutation,
} from "../../lib/store/users-api"
import { AVATAR_TONES, type AvatarTone } from "../../lib/types/chat"
import { cn } from "../../lib/utils"

const fieldClassName =
  "h-[46px] rounded-[14px] border-edge bg-surface-2 px-3.5 text-[15px] text-ink placeholder:text-ink-4 focus-visible:border-signal focus-visible:bg-surface focus-visible:ring-3 focus-visible:ring-signal-wash dark:bg-surface-2 dark:focus-visible:bg-surface"

const tones = Object.keys(AVATAR_TONES) as AvatarTone[]
const usernamePattern = /^[a-z0-9._]{3,24}$/

function draftFrom(profile: SettingsProfile): SettingsProfile {
  return { ...profile }
}

export function ProfileCard() {
  const { profile } = useSettings()
  const [updateMyUser, { isLoading: savingProfile }] = useUpdateMyUserMutation()
  const [updateMyPhoto, { isLoading: savingPhoto }] = useUpdateMyPhotoMutation()
  const [deleteMyPhoto, { isLoading: removingPhoto }] = useDeleteMyPhotoMutation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const saving = savingProfile || savingPhoto || removingPhoto
  const previewName = editing ? draft.name || "Your name" : profile.name
  const previewBio = editing
    ? profileBio(draft) || "Role · location"
    : profileBio(profile)
  const previewUsername = (editing ? draft.username : profile.username).replace(
    /^@/,
    ""
  )
  const previewEmail = editing ? draft.email : profile.email
  const previewHandle = editing ? profileHandle(draft) : profileHandle(profile)

  function openEditor() {
    setDraft(draftFrom(profile))
    setPhotoFile(null)
    setRemovePhoto(false)
    setEditing(true)
  }

  function closeEditor() {
    setEditing(false)
    setPhotoFile(null)
    setRemovePhoto(false)
    setDraft(draftFrom(profile))
  }

  function patch(partial: Partial<SettingsProfile>) {
    setDraft((current) => ({ ...current, ...partial }))
  }

  function onPhoto(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Keep the photo under 2 MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patch({ photo: reader.result })
        setPhotoFile(file)
        setRemovePhoto(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function save() {
    const name = draft.name.trim()
    if (name.length < 2) {
      toast.error("Name must be at least 2 characters")
      return
    }
    const username = draft.username.trim().replace(/^@/, "").toLowerCase()
    if (!usernamePattern.test(username)) {
      toast.error("Username must be 3–24 characters: letters, numbers, . or _")
      return
    }

    try {
      await updateMyUser({
        name,
        username,
        role: draft.role.trim(),
        location: draft.location.trim(),
        tone: draft.tone,
      }).unwrap()
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not update profile"))
      return
    }

    if (photoFile) {
      try {
        await updateMyPhoto(photoFile).unwrap()
      } catch (error) {
        setPhotoFile(null)
        setRemovePhoto(false)
        setEditing(false)
        toast.error(photoUploadErrorMessage(error))
        return
      }
    } else if (removePhoto && profile.photo) {
      try {
        await deleteMyPhoto().unwrap()
      } catch (error) {
        setPhotoFile(null)
        setRemovePhoto(false)
        setEditing(false)
        toast.error(photoUploadErrorMessage(error))
        return
      }
    }

    setPhotoFile(null)
    setRemovePhoto(false)
    setEditing(false)
    toast("Profile updated")
  }

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="px-4 py-5 sm:px-5 sm:py-6">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center sm:gap-5">
            <UserAvatar
              initials={editing ? initialsFromName(draft.name) : profile.initials}
              tone={editing ? draft.tone : profile.tone}
              photo={editing ? draft.photo : profile.photo}
              size="xl"
              className="size-16 text-[20px] sm:size-24 sm:text-[30px]"
            />
            <div className="min-w-0 flex-1">
              <h2 className="break-words font-display text-[18px] font-bold tracking-[-0.025em] text-ink sm:truncate sm:text-[22px]">
                {previewName}
              </h2>
              <p className="mt-0.5 truncate text-[13px] text-ink-3 sm:text-sm">
                {previewBio}
              </p>
              {previewUsername ? (
                <p className="mt-0.5 truncate font-mono text-[12px] text-ink-4 sm:hidden">
                  @{previewUsername}
                </p>
              ) : null}
              {previewEmail ? (
                <p className="truncate font-mono text-[12px] text-ink-4 sm:hidden">
                  {previewEmail}
                </p>
              ) : null}
              <p className="mt-0.5 hidden truncate font-mono text-[12.5px] text-ink-4 sm:block">
                {previewHandle}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={editing ? closeEditor : openEditor}
            className="h-9 w-full gap-1.5 rounded-[14px] border border-edge bg-surface-2 px-3.5 text-[13.5px] font-medium text-ink hover:bg-surface-3 sm:w-auto sm:shrink-0"
          >
            {editing ? (
              <X className="size-4 stroke-[1.75]" aria-hidden />
            ) : (
              <Pen className="size-4 stroke-[1.75]" aria-hidden />
            )}
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      {editing ? (
        <form
          className="grid gap-3.5 border-t border-edge px-4 py-5 sm:grid-cols-2 sm:px-5"
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <div className="sm:col-span-2">
            <Label htmlFor="profile-photo" className="mb-2 text-[13px] text-ink-2">
              Picture
            </Label>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <input
                ref={fileRef}
                id="profile-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  onPhoto(event.target.files?.[0])
                  event.target.value = ""
                }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => fileRef.current?.click()}
                className="h-9 gap-1.5 rounded-[14px] border border-edge bg-surface-2 px-3.5 text-[13.5px] font-medium text-ink hover:bg-surface-3"
              >
                <Camera className="size-4 stroke-[1.75]" aria-hidden />
                {draft.photo ? "Change photo" : "Upload photo"}
              </Button>
              {draft.photo ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={saving}
                  onClick={() => {
                    patch({ photo: null })
                    setPhotoFile(null)
                    setRemovePhoto(true)
                  }}
                  className="h-9 rounded-[14px] px-3 text-[13.5px] font-medium text-ink-2 hover:text-ink"
                >
                  Remove
                </Button>
              ) : null}
              <span className="flex w-full flex-wrap gap-1.5 sm:w-auto" role="group" aria-label="Avatar color">
                {tones.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    aria-label={`Avatar tone ${tone}`}
                    aria-pressed={draft.tone === tone}
                    onClick={() => patch({ tone })}
                    className={cn(
                      "size-6 cursor-pointer rounded-full border-2",
                      AVATAR_TONES[tone],
                      draft.tone === tone ? "border-signal" : "border-transparent"
                    )}
                  />
                ))}
              </span>
            </div>
          </div>

          <Field
            id="profile-name"
            label="Name"
            value={draft.name}
            onChange={(name) => patch({ name })}
            autoComplete="name"
          />
          <Field
            id="profile-role"
            label="Role"
            value={draft.role}
            onChange={(role) => patch({ role })}
            placeholder="Full-stack developer"
          />
          <Field
            id="profile-location"
            label="Location"
            value={draft.location}
            onChange={(location) => patch({ location })}
            placeholder="Dhaka"
          />
          <Field
            id="profile-username"
            label="Username"
            value={draft.username}
            onChange={(username) => patch({ username })}
            autoComplete="username"
          />
          <Field
            id="profile-email"
            label="Email"
            type="email"
            value={draft.email}
            onChange={() => undefined}
            autoComplete="email"
            disabled
            className="sm:col-span-2"
          />

          <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={closeEditor}
              className="h-9 rounded-[14px] border border-edge bg-surface-2 px-3.5 text-[13.5px] font-medium text-ink hover:bg-surface-3 max-sm:w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="h-9 gap-1.5 rounded-[14px] bg-signal px-3.5 text-[13.5px] font-medium text-white hover:bg-signal-deep max-sm:w-full"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Save
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  className,
  disabled,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-[13px] text-ink-2">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(fieldClassName, disabled && "opacity-70")}
      />
    </div>
  )
}
