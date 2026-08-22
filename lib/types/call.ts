import type { AvatarTone, Presence } from "@/lib/types/chat"

export type CallType = "audio" | "video"
export type CallStatus = "ended" | "missed" | "declined"
export type CallDirection = "in" | "out" | "missed"
export type CallFilter = "all" | "missed" | "voice" | "video"
export type CallSectionId = "today" | "yesterday"

export type CallAction = {
  type: CallType
  href: string
  label: string
}

export type CallRecord = {
  id: string
  section: CallSectionId
  name: string
  initials: string
  tone: AvatarTone
  presence?: Presence
  group?: boolean
  type: CallType
  status: CallStatus
  direction: CallDirection
  subtitle: string
  duration?: string
  endTag?: string
  actions?: CallAction[]
}

export type CallSection = {
  id: CallSectionId
  title: string
  meta: string
  showNewCall?: boolean
}
