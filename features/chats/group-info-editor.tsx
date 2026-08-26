"use client"

import { Camera, Loader2, Pen } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { UserAvatar } from "../../components/shared/user-avatar"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  mutationErrorMessage,
  photoUploadErrorMessage,
} from "../../lib/store/api-error"
import {
  useDeleteConversationPhotoMutation,
  useUpdateConversationMutation,
  useUpdateConversationPhotoMutation,
} from "../../lib/store/conversations-api"
import type { Conversation } from "../../lib/types/chat"
import { initialsFromName } from "../../lib/data/settings"
import { cn } from "../../lib/utils"

type GroupInfoEditorProps = {
  conversation: Conversation
  onSaved?: (conversation: Conversation) => void
  /** When true, render only the Manage-row trigger (dialog still included). */
  asManageRow?: boolean
}

export function GroupInfoEditor({
  conversation,
  onSaved,
  asManageRow = false,
}: GroupInfoEditorProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(conversation.name)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [updateGroup, { isLoading: savingName }] = useUpdateConversationMutation()
  const [updatePhoto, { isLoading: savingPhoto }] =
    useUpdateConversationPhotoMutation()
  const [deletePhoto, { isLoading: removingPhoto }] =
    useDeleteConversationPhotoMutation()
  const saving = savingName || savingPhoto || removingPhoto

  useEffect(() => {
    if (!open) {
      setName(conversation.name)
      setPhotoFile(null)
      setRemovePhoto(false)
      setPhotoPreview(null)
    }
  }, [conversation.name, conversation.photoUrl, open])

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null)
      return
    }
    const url = URL.createObjectURL(photoFile)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  const previewUrl = photoPreview
    ? photoPreview
    : removePhoto
      ? null
      : conversation.photoUrl
  const previewName = name.trim() || conversation.name
  const previewInitials = initialsFromName(previewName)

  function openEditor() {
    setName(conversation.name)
    setPhotoFile(null)
    setRemovePhoto(false)
    setPhotoPreview(null)
    setOpen(true)
  }

  async function save() {
    const nextName = name.trim()
    if (nextName.length < 2) {
      toast.error("Give this group a name")
      return
    }
    try {
      let latest = conversation
      if (nextName !== conversation.name) {
        latest = await updateGroup({
          conversationId: conversation.id,
          name: nextName,
        }).unwrap()
      }
      if (photoFile) {
        latest = await updatePhoto({
          conversationId: conversation.id,
          file: photoFile,
        }).unwrap()
      } else if (removePhoto && conversation.photoUrl) {
        latest = await deletePhoto(conversation.id).unwrap()
      }
      onSaved?.(latest)
      toast("Group updated")
      setOpen(false)
    } catch (error) {
      toast.error(
        photoFile || removePhoto
          ? photoUploadErrorMessage(error)
          : mutationErrorMessage(error, "Could not update group")
      )
    }
  }

  return (
    <>
      {asManageRow ? (
        <button
          type="button"
          onClick={openEditor}
          className="flex w-full cursor-pointer items-center justify-between border-b border-edge py-[11px] text-left"
        >
          <span className="flex items-center gap-[11px] text-sm text-ink">
            <Pen className="size-[18px] stroke-[1.75] text-ink-3" aria-hidden />
            Edit group
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={openEditor}
          aria-label="Edit group"
          className="grid size-9 cursor-pointer place-items-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Pen className="size-[18px] stroke-[1.75]" aria-hidden />
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={!saving}
          overlayClassName="z-[70]"
          className="z-[70] max-w-[400px] overflow-hidden border-0 bg-surface p-0 shadow-[0_24px_64px_rgba(17,24,33,0.22)] ring-1 ring-edge sm:max-w-[400px]"
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="font-display text-[18px] font-bold tracking-tight text-ink">
              Edit group
            </DialogTitle>
            <DialogDescription className="text-[13px] text-ink-3">
              Update the group name or photo. Any member can do this.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 px-6 py-2">
            <div className="relative">
              <UserAvatar
                initials={previewInitials}
                tone={conversation.tone}
                photo={previewUrl}
                size="lg"
                className="rounded-[16px] [&_img]:rounded-[16px]"
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => fileRef.current?.click()}
                className="absolute -right-1 -bottom-1 grid size-9 cursor-pointer place-items-center rounded-full border border-edge bg-surface text-ink shadow-sm hover:bg-surface-2 disabled:opacity-50"
                aria-label="Change group photo"
              >
                <Camera className="size-4 stroke-[1.75]" aria-hidden />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                tabIndex={-1}
                aria-hidden
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setPhotoFile(file)
                  setRemovePhoto(false)
                  event.target.value = ""
                }}
              />
            </div>
            {(conversation.photoUrl || photoFile) && !removePhoto ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setPhotoFile(null)
                  setRemovePhoto(true)
                }}
                className="cursor-pointer text-[12.5px] font-medium text-pulse hover:underline disabled:opacity-50"
              >
                Remove photo
              </button>
            ) : null}

            <div className="w-full space-y-2">
              <Label htmlFor="group-name" className="text-[12.5px] text-ink-3">
                Group name
              </Label>
              <Input
                id="group-name"
                value={name}
                maxLength={60}
                disabled={saving}
                onChange={(event) => setName(event.target.value)}
                className="h-[42px] rounded-[14px] border-edge bg-surface-2 px-3.5 text-[15px] text-ink"
              />
            </div>
          </div>

          <DialogFooter className="m-0 gap-2 border-t border-edge bg-surface-2/60 p-4 sm:justify-stretch">
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => setOpen(false)}
              className="h-10 flex-1 rounded-[14px] border border-edge bg-surface px-3 text-[13.5px] font-semibold text-ink hover:bg-surface-3"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className={cn(
                "h-10 flex-1 rounded-[14px] bg-signal px-3 text-[13.5px] font-semibold text-white hover:bg-signal/90"
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
