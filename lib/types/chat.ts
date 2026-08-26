import { format, isToday, isYesterday } from "date-fns"

export type AvatarTone = "a" | "b" | "c" | "d" | "e" | "f"
export type Presence = "online" | "away" | "offline"
export type MessageStatus = "sending" | "sent" | "delivered" | "seen"
export type PreviewIcon = "mic" | "video" | "image"
export type FilterChip = "all" | "unread" | "groups" | "calls" | "archived"
export type ConversationFilter = "all" | "unread" | "groups" | "archived"
export type RecordKind = "voice" | "video"

export type Reaction = {
  emoji: string
  count: number
  mine: boolean
}

export type SeenByPerson = {
  id: string
  name?: string
  initials: string
  tone: AvatarTone
  photo?: string | null
}

export type DayItem = {
  id: string
  kind: "day"
  label: string
}

export type CallItem = {
  id: string
  kind: "call"
  missed: boolean
  label: string
  meta: string
}

export type TypingItem = {
  id: string
  kind: "typing"
}

export type MessageAttachment = {
  url: string
  fileName?: string
  fileSize?: string
  mimeType?: string
  duration?: number
  kind: "image" | "video" | "file" | "link"
}

export type ChatMessage = {
  id: string
  kind: "message"
  conversationId?: string
  senderId?: string
  dir: "in" | "out"
  type: "text" | "image" | "file" | "voice" | "video_note" | "video" | "system"
  time: string
  status?: MessageStatus
  text?: string
  caption?: string
  fileName?: string
  fileSize?: string
  duration?: number
  seed?: number
  senderName?: string
  senderTone?: AvatarTone
  senderInitials?: string
  reply?: { who: string; text: string }
  reactions?: Reaction[]
  pinned?: boolean
  sentAt?: string
  mediaUrl?: string
  attachments?: MessageAttachment[]
  senderPhoto?: string | null
  seenCount?: number
  seenBy?: SeenByPerson[]
}

export type ThreadItem = DayItem | CallItem | TypingItem | ChatMessage

export type GroupRole = "admin" | "member"

export type ThreadView = "all" | "pinned"

export type GroupMember = {
  id: string
  name: string
  initials: string
  tone: AvatarTone
  presence?: Presence
  user?: string
  isMe?: boolean
  role?: GroupRole
  photo?: string | null
}

export type Conversation = {
  id: string
  name: string
  initials: string
  tone: AvatarTone
  presence: Presence
  status: string
  live: boolean
  sub: string
  time: string
  unread: number
  pinned?: boolean
  muted?: boolean
  archived?: boolean
  group?: boolean
  members?: GroupMember[]
  preview: string
  previewIcon?: PreviewIcon
  messages: ThreadItem[]
  photoUrl?: string | null
  username?: string | null
  createdBy?: string
}

export const MIN_GROUP_MEMBERS = 3

export type Me = {
  id?: string
  name: string
  initials: string
  tone: AvatarTone
  photoUrl?: string | null
}

export type ProfilePerson = {
  conversationId: string
  name: string
  initials: string
  tone: AvatarTone
  photo?: string | null
  presence?: Presence
  status?: string
  sub?: string
  isMe?: boolean
  group?: boolean
  userId?: string
  username?: string
}

export function isGroupAdmin(conversation: Conversation) {
  return Boolean(
    conversation.members?.some((member) => member.isMe && member.role === "admin")
  )
}

export function messageSearchText(message: ChatMessage) {
  return [message.text, message.caption, message.fileName, message.senderName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

export function messageMatchesQuery(message: ChatMessage, query: string) {
  const term = query.trim().toLowerCase()
  if (!term) return true
  return messageSearchText(message).includes(term)
}

export function pinnedMessageCount(items: ThreadItem[]) {
  return items.filter(
    (item): item is ChatMessage => item.kind === "message" && Boolean(item.pinned)
  ).length
}

export function filterThreadItems(
  items: ThreadItem[],
  view: ThreadView,
  query: string
) {
  const term = query.trim().toLowerCase()
  const filtered: ThreadItem[] = []
  let pendingDay: DayItem | null = null

  for (const item of items) {
    if (item.kind === "day") {
      pendingDay = item
      continue
    }

    if (item.kind === "typing") {
      if (view === "all" && !term) {
        if (pendingDay) {
          filtered.push(pendingDay)
          pendingDay = null
        }
        filtered.push(item)
      }
      continue
    }

    if (item.kind === "call") {
      if (view === "pinned") continue
      if (
        term &&
        !item.label.toLowerCase().includes(term) &&
        !item.meta.toLowerCase().includes(term)
      ) {
        continue
      }
      if (pendingDay) {
        filtered.push(pendingDay)
        pendingDay = null
      }
      filtered.push(item)
      continue
    }

    if (view === "pinned" && !item.pinned) continue
    if (!messageMatchesQuery(item, query)) continue
    if (pendingDay) {
      filtered.push(pendingDay)
      pendingDay = null
    }
    filtered.push(item)
  }

  return filtered
}

export function personFromConversation(conversation: Conversation): ProfilePerson {
  const peer = conversation.members?.find((member) => !member.isMe)
  return {
    conversationId: conversation.id,
    name: conversation.name,
    initials: conversation.initials,
    tone: conversation.tone,
    photo: conversation.photoUrl,
    presence: conversation.presence,
    status: conversation.status,
    sub: conversation.sub,
    group: conversation.group,
    userId: conversation.group ? undefined : peer?.id,
    username: conversation.username ?? peer?.user,
  }
}

export type ConversationMemberDto = {
  id: string
  name: string
  username: string
  initials: string
  tone: AvatarTone
  photoUrl: string | null
  presence: Presence
  role: GroupRole
  isMe: boolean
}

export type ConversationListItem = {
  id: string
  type?: "direct" | "group"
  group?: boolean
  name: string
  username?: string | null
  initials: string
  tone: AvatarTone
  photoUrl?: string | null
  presence: Presence
  status: string
  sub: string
  time: string
  unread: number
  pinned?: boolean
  muted?: boolean
  archived?: boolean
  preview: string
  previewIcon?: PreviewIcon | null
  live?: boolean
}

export type ConversationDetail = ConversationListItem & {
  createdBy?: string
  members?: ConversationMemberDto[]
}

export type ConversationsList = {
  conversations: Conversation[]
}

export type MessageDto = {
  id: string
  conversationId?: string | { id?: string; _id?: string }
  kind?: "message"
  dir?: "in" | "out"
  mine?: boolean
  isMine?: boolean
  senderId?: string | { id?: string; _id?: string }
  userId?: string
  from?: string | { id?: string; _id?: string }
  author?: string | { id?: string; _id?: string }
  user?: string | { id?: string; _id?: string }
  createdBy?: string | { id?: string; _id?: string }
  type: ChatMessage["type"]
  text?: string
  caption?: string
  fileName?: string
  fileSize?: string
  duration?: number | string
  seed?: number
  mediaUrl?: string
  url?: string
  fileUrl?: string
  audioUrl?: string
  videoUrl?: string
  attachments?: Array<{
    url?: string
    fileName?: string
    fileSize?: string
    mimeType?: string
    duration?: number
    kind?: string
  }>
  file?: { url?: string; secureUrl?: string; secure_url?: string }
  media?: { url?: string; secureUrl?: string; secure_url?: string }
  time: string
  status?: MessageStatus
  sender?: {
    id?: string
    _id?: string
    name: string
    username?: string
    initials: string
    tone: AvatarTone
    photoUrl: string | null
  }
  senderName?: string
  senderTone?: AvatarTone
  senderInitials?: string
  reply?: { who: string; text: string } | null
  reactions?: Reaction[]
  pinned?: boolean
  receipts?: Array<{
    user?: string | { id?: string; _id?: string }
    userId?: string
    status?: MessageStatus | string
  }>
  seenCount?: number
  seenBy?: unknown
}

export function entityId(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return String(value)
  if (!value || typeof value !== "object") return ""
  const record = value as Record<string, unknown>
  if (typeof record.id === "string" && record.id.trim()) return record.id.trim()
  if (typeof record._id === "string" && record._id.trim()) return record._id.trim()
  return ""
}

function personId(value: unknown): string {
  if (typeof value === "string") {
    const id = value.trim()
    return /^[a-f0-9]{24}$/i.test(id) ? id : ""
  }
  return entityId(value)
}

export function idsEqual(left?: string | null, right?: string | null) {
  return Boolean(left && right && left === right)
}

export function isOutgoingMessage(message: ChatMessage, viewerId?: string) {
  if (viewerId && message.senderId) return idsEqual(message.senderId, viewerId)
  return message.dir === "out"
}

export function previewFromMessage(message: ChatMessage) {
  if (message.text?.trim()) return message.text
  if (message.caption?.trim()) return message.caption
  const attachments = message.attachments ?? []
  if (attachments.length > 1) {
    if (attachments.every((item) => item.kind === "image")) {
      return `${attachments.length} photos`
    }
    if (attachments.every((item) => item.kind === "link")) {
      return `${attachments.length} links`
    }
    return `${attachments.length} files`
  }
  if (attachments[0]?.kind === "link") {
    return attachments[0].fileName || "Link"
  }
  if (message.type === "image") return "Photo"
  if (message.type === "video") return message.fileName || "Video"
  if (message.type === "file") return message.fileName || "File"
  if (message.type === "voice") return "Voice message"
  if (message.type === "video_note") return "Video note"
  return "New message"
}

export function messagesForConversation(
  messages: ChatMessage[],
  conversationId: string,
  options?: { isGroup?: boolean; groupIds?: Iterable<string> }
) {
  const groupIds = options?.groupIds
    ? new Set(options.groupIds)
    : null
  return messages.filter((message) => {
    const origin = message.conversationId
    if (origin && !idsEqual(origin, conversationId)) return false
    if (!options?.isGroup && origin && groupIds?.has(origin)) return false
    return true
  })
}

export type MessagesPage = {
  messages: ChatMessage[]
  nextCursor: string | null
}

export function formatChatClock(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return format(date, "h:mm a")
}

export function formatConversationTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  if (isToday(date)) return format(date, "h:mm a")
  if (isYesterday(date)) return "Yesterday"
  return format(date, "MMM d")
}

export function formatDayLabel(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "MMMM d, yyyy")
}

export function memberFromDto(dto: ConversationMemberDto): GroupMember {
  return {
    id: dto.id,
    name: dto.name,
    initials: dto.initials,
    tone: dto.tone,
    presence: dto.presence,
    user: dto.username,
    isMe: dto.isMe,
    role: dto.role,
    photo: dto.photoUrl,
  }
}

export function conversationFromDto(
  dto: ConversationListItem | ConversationDetail
): Conversation {
  const members =
    "members" in dto && Array.isArray(dto.members)
      ? dto.members.map(memberFromDto)
      : undefined
  return {
    id: dto.id,
    name: dto.name,
    initials: dto.initials || "?",
    tone: dto.tone || "a",
    photoUrl: dto.photoUrl,
    username: dto.username,
    presence: dto.presence || "offline",
    status: dto.status || "",
    live: Boolean(dto.live),
    sub: dto.sub || "",
    time: dto.time ? formatConversationTime(dto.time) : "",
    unread: dto.unread ?? 0,
    pinned: dto.pinned,
    muted: dto.muted,
    archived: dto.archived,
    group: Boolean(dto.group || dto.type === "group"),
    members,
    preview: dto.preview || "No messages yet",
    previewIcon: dto.previewIcon ?? undefined,
    messages: [],
    createdBy: "createdBy" in dto ? dto.createdBy : undefined,
  }
}

export function asMessageStatus(value: unknown): MessageStatus | undefined {
  if (
    value === "sending" ||
    value === "sent" ||
    value === "delivered" ||
    value === "seen"
  ) {
    return value
  }
  return undefined
}

export function seenByIds(value: unknown): string[] {
  return seenPeopleFromUnknown(value).map((person) => person.id)
}

export function seenPeopleFromUnknown(
  value: unknown,
  senderId?: string
): SeenByPerson[] {
  if (!Array.isArray(value)) return []
  const people: SeenByPerson[] = []
  const seen = new Set<string>()
  for (const item of value) {
    const person = seenPersonFromUnknown(item)
    if (!person) continue
    if (senderId && idsEqual(person.id, senderId)) continue
    if (seen.has(person.id)) continue
    seen.add(person.id)
    people.push(person)
  }
  return people
}

function seenPersonFromUnknown(item: unknown): SeenByPerson | null {
  if (typeof item === "string") {
    const id = item.trim()
    return id ? { id, initials: "?", tone: "a" } : null
  }
  if (!item || typeof item !== "object") return null
  const record = item as Record<string, unknown>
  const nested =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : record.viewer && typeof record.viewer === "object"
        ? (record.viewer as Record<string, unknown>)
        : null
  const source = nested ?? record
  const id =
    personId(record.userId) ||
    personId(record.user) ||
    personId(record.viewer) ||
    personId(nested) ||
    entityId(record)
  if (!id) return null
  if (record.status && record.status !== "seen" && record.seen !== true) {
    return null
  }
  const name =
    (typeof source.name === "string" && source.name) ||
    (typeof record.name === "string" && record.name) ||
    undefined
  const initials =
    (typeof source.initials === "string" && source.initials) ||
    (typeof record.initials === "string" && record.initials) ||
    initialsFromName(name)
  const tone = asAvatarTone(source.tone) || asAvatarTone(record.tone) || "a"
  const photo =
    (typeof source.photoUrl === "string" && source.photoUrl) ||
    (typeof source.photo === "string" && source.photo) ||
    (typeof record.photoUrl === "string" && record.photoUrl) ||
    (typeof record.photo === "string" && record.photo) ||
    null
  return { id, name, initials, tone, photo }
}

function initialsFromName(name?: string) {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function asAvatarTone(value: unknown): AvatarTone | undefined {
  if (
    value === "a" ||
    value === "b" ||
    value === "c" ||
    value === "d" ||
    value === "e" ||
    value === "f"
  ) {
    return value
  }
  return undefined
}

export function seenCountFromSeenBy(seenBy: unknown, senderId?: string) {
  return seenPeopleFromUnknown(seenBy, senderId).length
}

export function resolveSeenPeople(
  message: ChatMessage,
  conversation: Conversation,
  viewerId?: string
): SeenByPerson[] {
  const senderId = message.senderId || viewerId
  const fromMessage = (message.seenBy ?? []).filter(
    (person) => !senderId || !idsEqual(person.id, senderId)
  )
  const members = conversation.members ?? []
  const byId = new Map(members.map((member) => [member.id, member]))
  const resolved = fromMessage.map((person) => {
    const member = byId.get(person.id)
    if (!member) return person
    return {
      id: person.id,
      name: person.name || member.name,
      initials: person.initials !== "?" ? person.initials : member.initials,
      tone: person.tone || member.tone,
      photo: person.photo || member.photo,
    }
  })
  if (resolved.length > 0) return resolved
  const seen = Math.max(0, message.seenCount ?? 0)
  if (seen === 0 && message.status !== "seen") return []
  const peers = members.filter(
    (member) =>
      !member.isMe && (!senderId || !idsEqual(member.id, senderId))
  )
  if (conversation.group) return peers.slice(0, seen || peers.length).map(memberToSeen)
  if (peers[0]) return [memberToSeen(peers[0])]
  if (message.status === "seen" || seen > 0) {
    return [
      {
        id: conversation.id,
        name: conversation.name,
        initials: conversation.initials,
        tone: conversation.tone,
        photo: conversation.photoUrl,
      },
    ]
  }
  return []
}

function memberToSeen(member: GroupMember): SeenByPerson {
  return {
    id: member.id,
    name: member.name,
    initials: member.initials,
    tone: member.tone,
    photo: member.photo,
  }
}

export function seenCountFromReceipts(receipts: unknown, senderId?: string) {
  if (typeof receipts === "number" && Number.isFinite(receipts)) {
    return Math.max(0, Math.floor(receipts))
  }
  if (!Array.isArray(receipts)) return 0
  let count = 0
  for (const item of receipts) {
    if (!item || typeof item !== "object") continue
    const record = item as Record<string, unknown>
    const userId =
      personId(record.user) || personId(record.userId) || entityId(record)
    if (senderId && userId && idsEqual(userId, senderId)) continue
    if (record.status === "seen" || record.seen === true) count += 1
  }
  return count
}

export function statusFromReceipts(
  receipts: unknown,
  senderId?: string
): MessageStatus | undefined {
  if (!Array.isArray(receipts) || receipts.length === 0) return undefined
  let delivered = false
  let seen = 0
  for (const item of receipts) {
    if (!item || typeof item !== "object") continue
    const record = item as Record<string, unknown>
    const userId =
      personId(record.user) || personId(record.userId) || entityId(record)
    if (senderId && userId && idsEqual(userId, senderId)) continue
    if (record.status === "seen" || record.seen === true) {
      seen += 1
      delivered = true
    } else if (record.status === "delivered") {
      delivered = true
    }
  }
  if (seen > 0) return "seen"
  if (delivered) return "delivered"
  return "sent"
}

export function asMessageType(value: unknown): ChatMessage["type"] {
  if (
    value === "image" ||
    value === "file" ||
    value === "voice" ||
    value === "video_note" ||
    value === "video" ||
    value === "system"
  ) {
    return value
  }
  if (value === "audio" || value === "voice_note") return "voice"
  if (value === "videoNote") return "video_note"
  return "text"
}

function asDuration(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) return parsed
  }
  return undefined
}

function nestedUrl(value: unknown) {
  if (!value || typeof value !== "object") return ""
  const record = value as Record<string, unknown>
  if (typeof record.url === "string") return record.url
  if (typeof record.secureUrl === "string") return record.secureUrl
  if (typeof record.secure_url === "string") return record.secure_url
  return ""
}

function mediaUrlFromDto(dto: MessageDto) {
  return (
    (typeof dto.mediaUrl === "string" && dto.mediaUrl) ||
    (typeof dto.url === "string" && dto.url) ||
    (typeof dto.fileUrl === "string" && dto.fileUrl) ||
    (typeof dto.audioUrl === "string" && dto.audioUrl) ||
    (typeof dto.videoUrl === "string" && dto.videoUrl) ||
    nestedUrl(dto.file) ||
    nestedUrl(dto.media) ||
    (Array.isArray(dto.attachments) &&
    typeof dto.attachments[0]?.url === "string"
      ? dto.attachments[0].url
      : "") ||
    ""
  )
}

function attachmentsFromDto(dto: MessageDto): MessageAttachment[] | undefined {
  if (!Array.isArray(dto.attachments) || dto.attachments.length === 0) {
    return undefined
  }
  const rows: MessageAttachment[] = []
  for (const item of dto.attachments) {
    if (!item || typeof item !== "object") continue
    const url = typeof item.url === "string" ? item.url : ""
    if (!url) continue
    const mime = typeof item.mimeType === "string" ? item.mimeType : ""
    const kindRaw = item.kind
    const kind =
      kindRaw === "image" ||
      kindRaw === "video" ||
      kindRaw === "file" ||
      kindRaw === "link"
        ? kindRaw
        : mime.startsWith("image/")
          ? "image"
          : mime.startsWith("video/")
            ? "video"
            : mime === "text/uri-list"
              ? "link"
              : "file"
    rows.push({
      url,
      fileName: typeof item.fileName === "string" ? item.fileName : undefined,
      fileSize: typeof item.fileSize === "string" ? item.fileSize : undefined,
      mimeType: mime || undefined,
      duration:
        typeof item.duration === "number" && item.duration > 0
          ? item.duration
          : undefined,
      kind,
    })
  }
  return rows.length ? rows : undefined
}

export function messageFromDto(
  dto: MessageDto,
  viewerId?: string
): ChatMessage {
  const senderId =
    personId(dto.senderId) ||
    personId(dto.sender) ||
    personId(dto.userId) ||
    personId(dto.from) ||
    personId(dto.author) ||
    personId(dto.user) ||
    personId(dto.createdBy)
  const conversationId = entityId(dto.conversationId)
  const mineFlag = dto.mine === true || dto.isMine === true
  const dir: ChatMessage["dir"] = viewerId
    ? senderId
      ? idsEqual(senderId, viewerId)
        ? "out"
        : "in"
      : mineFlag || dto.dir === "out"
        ? "out"
        : "in"
    : mineFlag || dto.dir === "out"
      ? "out"
      : "in"
  const type = asMessageType(dto.type)
  const seenBy = [
    ...seenPeopleFromUnknown(dto.seenBy, senderId),
    ...seenPeopleFromUnknown(dto.receipts, senderId),
  ].filter((person, index, list) =>
    list.findIndex((item) => item.id === person.id) === index
  )
  const seenCount =
    typeof dto.seenCount === "number"
      ? dto.seenCount
      : seenBy.length > 0
        ? seenBy.length
        : seenCountFromReceipts(dto.receipts, senderId)
  const status =
    asMessageStatus(dto.status) ||
    (seenCount > 0 ? "seen" : statusFromReceipts(dto.receipts, senderId))
  return {
    id: entityId(dto.id) || entityId(dto),
    kind: "message",
    conversationId: conversationId || undefined,
    senderId: senderId || undefined,
    dir,
    type,
    time: dto.time ? formatChatClock(dto.time) : "",
    sentAt: dto.time,
    status,
    seenCount,
    seenBy: seenBy.length > 0 ? seenBy : undefined,
    text: dto.text || undefined,
    caption: dto.caption || undefined,
    fileName: dto.fileName || undefined,
    fileSize: dto.fileSize || undefined,
    duration:
      asDuration(dto.duration) ||
      (type === "voice" || type === "video_note" || type === "video"
        ? asDuration(dto.text)
        : undefined),
    seed: dto.seed || undefined,
    mediaUrl: mediaUrlFromDto(dto) || undefined,
    attachments: attachmentsFromDto(dto),
    senderName: dto.senderName || dto.sender?.name,
    senderTone: dto.senderTone || dto.sender?.tone,
    senderInitials: dto.senderInitials || dto.sender?.initials,
    senderPhoto: dto.sender?.photoUrl,
    reply: dto.reply ?? undefined,
    reactions: Array.isArray(dto.reactions) ? dto.reactions : [],
    pinned: Boolean(dto.pinned),
  }
}

export function withDaySeparators(messages: ChatMessage[]): ThreadItem[] {
  const ordered = [...messages].sort((left, right) => {
    const a = left.sentAt ? Date.parse(left.sentAt) : 0
    const b = right.sentAt ? Date.parse(right.sentAt) : 0
    return a - b
  })
  const items: ThreadItem[] = []
  let lastLabel = ""
  for (const message of ordered) {
    const label = message.sentAt ? formatDayLabel(message.sentAt) : ""
    if (label && label !== lastLabel) {
      lastLabel = label
      items.push({ id: `day-${message.sentAt}`, kind: "day", label })
    }
    items.push(message)
  }
  return items
}

export const AVATAR_TONES: Record<AvatarTone, string> = {
  a: "bg-[#DDE2FF] text-[#2B3FFF] dark:bg-[#1E2450] dark:text-[#8E9BFF]",
  b: "bg-[#FFE0EB] text-[#D4155A] dark:bg-[#3D1729] dark:text-[#FF7DA5]",
  c: "bg-[#D7F2E9] text-[#007A5C] dark:bg-[#0F3730] dark:text-[#35D6AC]",
  d: "bg-[#FFEBCC] text-[#A96C00] dark:bg-[#3B2C0E] dark:text-[#E8B24C]",
  e: "bg-[#E4DDFF] text-[#5B36D9] dark:bg-[#291F4D] dark:text-[#A48CFF]",
  f: "bg-[#D5EDFB] text-[#0470A8] dark:bg-[#0D2E42] dark:text-[#4FBBEF]",
}

export const SENDER_TONES: Record<AvatarTone, string> = {
  a: "text-[#2B3FFF] dark:text-[#8E9BFF]",
  b: "text-[#D4155A] dark:text-[#FF7DA5]",
  c: "text-[#007A5C] dark:text-[#35D6AC]",
  d: "text-[#A96C00] dark:text-[#E8B24C]",
  e: "text-[#5B36D9] dark:text-[#A48CFF]",
  f: "text-[#0470A8] dark:text-[#4FBBEF]",
}
