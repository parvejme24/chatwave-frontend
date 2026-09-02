"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Archive,
  Ban,
  Bell,
  CheckCheck,
  LogOut,
  MessageCircle,
  Phone,
  Pin,
  Search,
  Shield,
  ShieldMinus,
  ShieldPlus,
  Trash2,
  UserMinus,
  Video,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { IconBtn } from "../../components/layout/icon-btn"
import { chatActionError, useChat } from "./chat-provider"
import { SharedMediaSection } from "./shared-media-section"
import { GroupInfoEditor } from "./group-info-editor"
import { signalEase } from "../../components/motion/motion-item"
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
import { Switch } from "../../components/ui/switch"
import { callPageHref } from "../../lib/call"
import { useMediaQuery } from "../../lib/hooks/use-media-query"
import type { Conversation, GroupMember, ProfilePerson } from "../../lib/types/chat"
import { isGroupAdmin, personFromConversation } from "../../lib/types/chat"
import { useBlockUserMutation } from "../../lib/store/blocks-api"
import {
  useGetConversationMembersQuery,
  useGetConversationQuery,
} from "../../lib/store/conversations-api"
import {
  useGetUserByIdQuery,
  useGetUserByUsernameQuery,
} from "../../lib/store/users-api"
import { isMongoUserId, presenceNote } from "../../lib/users"

const actionClass =
  "flex w-[66px] cursor-pointer flex-col items-center gap-[5px] rounded-[14px] bg-surface-2 py-2.5 text-[11.5px] font-medium text-ink-2 transition-transform hover:scale-[1.04] hover:bg-surface-3"

function useResolvedPerson(person: ProfilePerson | null) {
  const userId =
    person && !person.group && isMongoUserId(person.userId)
      ? person.userId
      : undefined
  const username =
    person && !person.group && !userId && person.username
      ? person.username.replace(/^@/, "")
      : undefined
  const byId = useGetUserByIdQuery(userId ?? "", { skip: !userId })
  const byName = useGetUserByUsernameQuery(username ?? "", {
    skip: !username,
  })
  const user = byId.data ?? byName.data
  if (!person) return null
  if (!user) return person
  return {
    ...person,
    userId: user.id,
    username: user.username,
    name: user.name,
    initials: user.initials,
    tone: user.tone,
    photo: user.photoUrl,
    presence: user.presence,
    sub: user.sub || person.sub,
    status: presenceNote(user),
  }
}

export function DetailsDrawer({ conversationId }: { conversationId: string }) {
  const {
    getConversation,
    drawerOpen,
    profile,
    setDrawerOpen,
    setPinned,
    setMuted,
    setArchived,
    openProfile,
    requestConversationSearch,
    removeGroupMember,
    setGroupAdmin,
    leaveGroup,
    deleteConversation,
  } = useChat()
  const [blockUser] = useBlockUserMutation()
  const fromList = getConversation(conversationId)
  const { data: detail } = useGetConversationQuery(conversationId, {
    skip: !conversationId,
  })
  const conversationBase = detail ?? fromList
  const { data: members } = useGetConversationMembersQuery(conversationId, {
    skip: !conversationId || !conversationBase?.group,
  })
  const conversation = conversationBase
    ? { ...conversationBase, members: members ?? conversationBase.members }
    : undefined
  const person = useResolvedPerson(profile)
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 859px)")
  const isOverlay = useMediaQuery("(max-width: 1079px)")
  const isNarrow = useMediaQuery("(max-width: 1280px)")
  const reduceMotion = useReducedMotion()
  const show = Boolean(drawerOpen && person && conversation)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!drawerOpen) {
      setDeleteOpen(false)
      setDeleting(false)
      return
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleteOpen) setDrawerOpen(false)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [deleteOpen, drawerOpen, setDrawerOpen])

  if (!conversation) return null

  const forEveryone = !conversation.group
  const peerName = person?.name?.split(" ")[0] || person?.name || "them"
  const conversationIdToDelete = conversation.id

  async function confirmDelete() {
    setDeleting(true)
    try {
      if (!(await deleteConversation(conversationIdToDelete))) {
        toast.error("Could not delete this conversation")
        return
      }
      setDeleteOpen(false)
      setDrawerOpen(false)
      toast(
        forEveryone
          ? "Conversation deleted for both of you"
          : "Conversation deleted"
      )
      router.push("/chats")
    } finally {
      setDeleting(false)
    }
  }

  const transition = { duration: reduceMotion ? 0.01 : 0.32, ease: signalEase }
  const body =
    person && conversation ? (
      <DrawerBody
        conversation={conversation}
        person={person}
        onClose={() => setDrawerOpen(false)}
        onPin={(checked) => {
          void setPinned(conversation.id, Boolean(checked)).catch((error) =>
            toast.error(chatActionError(error, "Could not update pin"))
          )
        }}
        onMute={(muted) => {
          void setMuted(conversation.id, muted).catch((error) =>
            toast.error(chatActionError(error, "Could not update mute"))
          )
        }}
        onOpenMember={openProfile}
        onSearch={requestConversationSearch}
        onRemoveMember={async (memberId) => {
          const member = conversation.members?.find((item) => item.id === memberId)
          if (!(await removeGroupMember(conversation.id, memberId))) {
            toast("Only a group admin can remove people")
            return
          }
          toast(`${member?.name ?? "Member"} removed from the group`)
        }}
        onSetAdmin={async (memberId, nextAdmin) => {
          const member = conversation.members?.find((item) => item.id === memberId)
          if (!(await setGroupAdmin(conversation.id, memberId, nextAdmin))) {
            toast(
              nextAdmin
                ? "Could not make this person an admin"
                : "A group needs at least one admin"
            )
            return
          }
          toast(
            nextAdmin
              ? `${member?.name ?? "Member"} is now a group admin`
              : `Admin removed from ${member?.name ?? "member"}`
          )
        }}
        onLeave={async () => {
          if (!(await leaveGroup(conversation.id))) {
            toast("Could not leave this group")
            return
          }
          toast("You left the group")
          router.push("/chats")
        }}
        onArchive={async () => {
          const next = !conversation.archived
          try {
            await setArchived(conversation.id, next)
            toast(next ? "Conversation archived" : "Conversation unarchived")
            if (next) setDrawerOpen(false)
          } catch (error) {
            toast.error(chatActionError(error, "Could not update archive"))
          }
        }}
        onDelete={() => setDeleteOpen(true)}
        onEditGroup={
          conversation.group ? (
            <GroupInfoEditor
              conversation={conversation}
              asManageRow
              onSaved={(latest) => openProfile(personFromConversation(latest))}
            />
          ) : null
        }
        onBlock={async () => {
          const userId =
            person.userId ??
            conversation.members?.find((item) => !item.isMe)?.id
          if (!userId) {
            toast.error("Could not block this person")
            return
          }
          try {
            await blockUser({ userId }).unwrap()
            try {
              await setArchived(conversation.id, true)
            } catch {
              /* backend also archives on block — still refresh lists */
            }
            const first = person.name.split(" ")[0] || person.name
            toast(
              `You blocked ${first}. They can't message or call you. This chat is in Archived.`
            )
            setDrawerOpen(false)
            router.push("/chats")
          } catch (error) {
            toast.error(chatActionError(error, "Could not block this person"))
          }
        }}
        reduceMotion={Boolean(reduceMotion)}
      />
    ) : null

  return (
    <>
      <AnimatePresence>
        {show ? (
          isMobile ? (
            <motion.div
              key="details-mobile"
              className="fixed inset-0 z-[55] bg-surface"
              initial={reduceMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              transition={transition}
            >
              <aside
                aria-label="Conversation details"
                className="h-full overflow-y-auto bg-surface"
              >
                {body}
              </aside>
            </motion.div>
          ) : isOverlay ? (
            <motion.div
              key="details-overlay"
              className="absolute inset-0 z-40"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: signalEase }}
            >
              <button
                type="button"
                aria-label="Close details"
                className="absolute inset-0 cursor-pointer bg-[rgba(17,24,33,0.28)]"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.aside
                aria-label="Conversation details"
                className="absolute inset-y-0 right-0 w-80 overflow-y-auto bg-surface shadow-[0_24px_64px_rgba(17,24,33,0.18)] max-[1280px]:w-72"
                initial={reduceMotion ? false : { x: "100%" }}
                animate={{ x: 0 }}
                exit={reduceMotion ? undefined : { x: "100%" }}
                transition={transition}
              >
                {body}
              </motion.aside>
            </motion.div>
          ) : (
            <motion.aside
              key="details-inline"
              aria-label="Conversation details"
              initial={reduceMotion ? false : { width: 0, opacity: 0 }}
              animate={{ width: isNarrow ? 288 : 320, opacity: 1 }}
              exit={
                reduceMotion ? { opacity: 0 } : { width: 0, opacity: 0 }
              }
              transition={transition}
              className="h-full shrink-0 overflow-hidden border-l border-edge bg-surface"
            >
              <div className="h-full w-80 overflow-y-auto max-[1280px]:w-72">
                {body}
              </div>
            </motion.aside>
          )
        ) : null}
      </AnimatePresence>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[70]"
          className="z-[70] max-w-[400px] overflow-hidden border-0 bg-surface p-0 shadow-[0_24px_64px_rgba(17,24,33,0.22)] ring-1 ring-edge sm:max-w-[400px]"
        >
          <div className="relative overflow-hidden px-6 pt-7 pb-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--pulse)_22%,transparent),transparent_70%)]"
            />
            <div className="relative mx-auto mb-4 grid size-14 place-items-center rounded-full bg-pulse/12 text-pulse ring-1 ring-pulse/20">
              <Trash2 className="size-6 stroke-[1.75]" aria-hidden />
            </div>
            <DialogHeader className="relative items-center gap-2 text-center">
              <DialogTitle className="font-display text-[18px] font-bold tracking-tight text-ink">
                Delete conversation?
              </DialogTitle>
              <DialogDescription className="text-[13.5px] leading-relaxed text-ink-3">
                {forEveryone ? (
                  <>
                    This permanently deletes the chat with{" "}
                    <span className="font-semibold text-ink">{peerName}</span> for
                    both of you. All messages are removed and cannot be recovered.
                    To keep the chat, use Archive instead.
                  </>
                ) : (
                  <>
                    This removes the conversation from your list only. Other members
                    keep their copy. To hide it without deleting, use Archive.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="m-0 gap-2 border-t border-edge bg-surface-2/60 p-4 sm:justify-stretch">
            <Button
              type="button"
              variant="secondary"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
              className="h-10 flex-1 rounded-[14px] border border-edge bg-surface px-3 text-[13.5px] font-semibold text-ink hover:bg-surface-3"
            >
              Keep chat
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
              className="h-10 flex-1 rounded-[14px] bg-pulse px-3 text-[13.5px] font-semibold text-white hover:bg-pulse/90 hover:text-white focus-visible:border-pulse/40 focus-visible:ring-pulse/25"
            >
              {deleting ? "Deleting…" : "Delete conversation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function memberLine(member: GroupMember) {
  if (member.isMe) return "You"
  if (member.presence === "online") return "Online"
  if (member.presence === "away") return "Away"
  return member.user ? `@${member.user}` : "Offline"
}

function DrawerBody({
  conversation,
  person,
  onClose,
  onPin,
  onMute,
  onOpenMember,
  onSearch,
  onRemoveMember,
  onSetAdmin,
  onLeave,
  onArchive,
  onBlock,
  onDelete,
  onEditGroup,
  reduceMotion,
}: {
  conversation: Conversation
  person: ProfilePerson
  onClose: () => void
  onPin: (checked: boolean) => void
  onMute: (muted: boolean) => void
  onOpenMember: (person: ProfilePerson) => void
  onSearch: () => void
  onRemoveMember: (memberId: string) => void
  onSetAdmin: (memberId: string, isAdmin: boolean) => void
  onLeave: () => void
  onArchive: () => void
  onBlock: () => void
  onDelete: () => void
  onEditGroup?: React.ReactNode
  reduceMotion: boolean
}) {
  const router = useRouter()
  const showConversationTools = !person.isMe && person.name === conversation.name
  const canManageGroup = isGroupAdmin(conversation)

  function call(type: "audio" | "video") {
    const memberCall =
      Boolean(person.userId) &&
      !person.group &&
      person.name !== conversation.name
    router.push(
      memberCall
        ? callPageHref({
            type,
            userId: person.userId,
            peer: person.name,
          })
        : callPageHref({
            type,
            conversationId: conversation.id,
            peer: conversation.name,
          })
    )
  }
  const adminCount =
    conversation.members?.filter((member) => member.role === "admin").length ?? 0

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${person.name}-${person.isMe ? "me" : "peer"}`}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: signalEase }}
      >
        <div className="relative border-b border-edge px-[22px] pt-7 pb-5 text-center">
          <IconBtn
            aria-label="Close details"
            className="absolute top-3 right-3"
            onClick={onClose}
          >
            <X className="size-5 stroke-[1.75]" aria-hidden />
          </IconBtn>
          <motion.div
            initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.28, ease: signalEase }}
          >
            <UserAvatar
              initials={person.initials}
              tone={person.tone}
              photo={person.photo}
              presence={person.presence}
              showPresence={Boolean(person.presence) && !person.group}
              size="xl"
              className="mx-auto mb-3.5"
            />
          </motion.div>
          <h3 className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
            {person.isMe ? "You" : person.name}
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-3">
            {person.sub || person.status || conversation.sub}
          </p>
          {person.status && person.sub ? (
            <p className="mt-1 font-mono text-[12px] text-ink-4">
              {person.status}
            </p>
          ) : null}
          <div className="mt-[18px] flex justify-center gap-2">
            {person.isMe ? null : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/chats/${conversation.id}`)
                    onClose()
                  }}
                  className={actionClass}
                >
                  <MessageCircle
                    className="size-[19px] stroke-[1.75] text-signal"
                    aria-hidden
                  />
                  Message
                </button>
                <button
                  type="button"
                  onClick={() => call("audio")}
                  className={actionClass}
                >
                  <Phone
                    className="size-[19px] stroke-[1.75] text-signal"
                    aria-hidden
                  />
                  Call
                </button>
                <button
                  type="button"
                  onClick={() => call("video")}
                  className={actionClass}
                >
                  <Video
                    className="size-[19px] stroke-[1.75] text-signal"
                    aria-hidden
                  />
                  Video
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onSearch}
              className={actionClass}
            >
              <Search
                className="size-[19px] stroke-[1.75] text-signal"
                aria-hidden
              />
              Search
            </button>
          </div>
        </div>

        {conversation.group && conversation.members?.length ? (
          <div className="border-b border-edge px-[22px] py-[18px]">
            <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
              Members · {conversation.members.length}
            </h4>
            <div className="flex flex-col gap-0.5">
              {conversation.members.map((member) => {
                const isAdmin = member.role === "admin"
                return (
                  <div
                    key={member.id}
                    className="flex items-start gap-2 rounded-[12px] px-1 py-2 hover:bg-surface-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onOpenMember({
                          conversationId: conversation.id,
                          name: member.name,
                          initials: member.initials,
                          tone: member.tone,
                          presence: member.presence,
                          isMe: member.isMe,
                          userId: member.id,
                          username: member.user,
                          status: memberLine(member),
                          sub: member.isMe
                            ? "You"
                            : member.user
                              ? `@${member.user}`
                              : memberLine(member),
                        })
                      }
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                    >
                      <UserAvatar
                        initials={member.initials}
                        tone={member.tone}
                        photo={member.photo}
                        presence={member.presence}
                        showPresence={Boolean(member.presence)}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {member.isMe ? "You" : member.name}
                          </span>
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-signal-wash px-1.5 py-px font-mono text-[10px] font-semibold tracking-[0.04em] text-signal uppercase">
                              <Shield className="size-2.5 stroke-[1.75]" aria-hidden />
                              Admin
                            </span>
                          ) : null}
                        </span>
                        <span className="block truncate text-[12.5px] text-ink-3">
                          {memberLine(member)}
                        </span>
                      </span>
                    </button>
                    {canManageGroup && !member.isMe ? (
                      <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onSetAdmin(member.id, !isAdmin)
                          }}
                          disabled={isAdmin && adminCount <= 1}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-[8px] px-1.5 py-0.5 text-[11.5px] font-medium text-ink-2 hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isAdmin ? (
                            <ShieldMinus className="size-3 stroke-[1.75]" aria-hidden />
                          ) : (
                            <ShieldPlus className="size-3 stroke-[1.75]" aria-hidden />
                          )}
                          {isAdmin ? "Remove admin" : "Make admin"}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onRemoveMember(member.id)
                          }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-[8px] px-1.5 py-0.5 text-[11.5px] font-medium text-pulse hover:bg-surface-3"
                        >
                          <UserMinus className="size-3 stroke-[1.75]" aria-hidden />
                          Remove
                        </button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={onLeave}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-surface-2 py-2.5 text-[13px] font-medium text-pulse hover:bg-surface-3"
            >
              <LogOut className="size-4 stroke-[1.75]" aria-hidden />
              Leave group
            </button>
          </div>
        ) : null}

        <SharedMediaSection conversationId={conversation.id} />

        {showConversationTools ? (
          <>
            <div className="border-b border-edge px-[22px] py-[18px]">
              <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                Preferences
              </h4>
              <label className="flex items-center justify-between border-b border-edge py-[11px]">
                <span className="flex items-center gap-[11px] text-sm text-ink">
                  <Bell
                    className="size-[18px] stroke-[1.75] text-ink-3"
                    aria-hidden
                  />
                  Notifications
                </span>
                <Switch
                  checked={!conversation.muted}
                  onCheckedChange={(checked) => onMute(!checked)}
                  aria-label="Notifications"
                />
              </label>
              <label className="flex items-center justify-between border-b border-edge py-[11px]">
                <span className="flex items-center gap-[11px] text-sm text-ink">
                  <Pin
                    className="size-[18px] stroke-[1.75] text-ink-3"
                    aria-hidden
                  />
                  Pin to top
                </span>
                <Switch
                  checked={Boolean(conversation.pinned)}
                  onCheckedChange={onPin}
                  aria-label="Pin conversation"
                />
              </label>
              <label className="flex items-center justify-between py-[11px]">
                <span className="flex items-center gap-[11px] text-sm text-ink">
                  <CheckCheck
                    className="size-[18px] stroke-[1.75] text-ink-3"
                    aria-hidden
                  />
                  Send read receipts
                </span>
                <Switch defaultChecked aria-label="Read receipts" />
              </label>
            </div>

            <div className="px-[22px] py-[18px]">
              <h4 className="mb-3 text-[11px] font-bold tracking-[0.1em] text-ink-4 uppercase">
                Manage
              </h4>
              {onEditGroup}
              <button
                type="button"
                onClick={onArchive}
                className="flex w-full cursor-pointer items-center justify-between border-b border-edge py-[11px] text-left"
              >
                <span className="flex items-center gap-[11px] text-sm text-ink">
                  <Archive
                    className="size-[18px] stroke-[1.75] text-ink-3"
                    aria-hidden
                  />
                  {conversation.archived
                    ? "Unarchive conversation"
                    : "Archive conversation"}
                </span>
              </button>
              {conversation.group ? null : (
                <button
                  type="button"
                  onClick={onBlock}
                  className="flex w-full cursor-pointer items-center justify-between border-b border-edge py-[11px] text-left"
                >
                  <span className="flex items-center gap-[11px] text-sm text-pulse">
                    <Ban className="size-[18px] stroke-[1.75]" aria-hidden />
                    Block contact
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={onDelete}
                className="flex w-full cursor-pointer items-center justify-between py-[11px] text-left"
              >
                <span className="flex items-center gap-[11px] text-sm text-pulse">
                  <Trash2 className="size-[18px] stroke-[1.75]" aria-hidden />
                  Delete conversation
                </span>
              </button>
            </div>
          </>
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}