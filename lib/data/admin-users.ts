import { CALLS } from "./calls"
import { CONTACTS } from "./contacts"
import { CONVERSATIONS } from "./conversations"
import type { ChatMessage } from "../types/chat"
import type {
  ManagedUser,
  UserHistoryEvent,
} from "../types/admin"
import type { Contact } from "../types/contact"

const META: Record<
  string,
  { email: string; joined: string; lastSeen: string }
> = {
  family: {
    email: "amma@chatwave.app",
    joined: "3 Jan 2026",
    lastSeen: "9:04 AM",
  },
  farhan: {
    email: "farhan@chatwave.app",
    joined: "18 Feb 2026",
    lastSeen: "Tuesday",
  },
  ishrat: {
    email: "ishrat@chatwave.app",
    joined: "2 Mar 2026",
    lastSeen: "In a meeting",
  },
  nadia: {
    email: "nadia@chatwave.app",
    joined: "12 Mar 2026",
    lastSeen: "2:14 PM",
  },
  rakib: {
    email: "rakib@chatwave.app",
    joined: "12 Mar 2026",
    lastSeen: "1:48 PM",
  },
  sumaiya: {
    email: "sumaiya@chatwave.app",
    joined: "14 Mar 2026",
    lastSeen: "Yesterday",
  },
  tanvir: {
    email: "tanvir@chatwave.app",
    joined: "20 Mar 2026",
    lastSeen: "11:20 AM",
  },
  zarif: {
    email: "zarif@chatwave.app",
    joined: "4 Apr 2026",
    lastSeen: "Yesterday",
  },
  lamia: {
    email: "lamia@chatwave.app",
    joined: "11 Aug 2026",
    lastSeen: "4:02 PM",
  },
  arif: {
    email: "arif@chatwave.app",
    joined: "19 Aug 2026",
    lastSeen: "10:18 AM",
  },
}

const EXTRA: Contact[] = [
  {
    name: "Lamia Noor",
    user: "lamia",
    tone: "e",
    presence: "online",
    note: "Signed up from the landing page",
  },
  {
    name: "Arif Hossain",
    user: "arif",
    tone: "f",
    presence: "offline",
    note: "Pending first conversation",
  },
]

function messageDetail(message: ChatMessage) {
  if (message.type === "image") return message.caption || "Sent a photo"
  if (message.type === "file") return message.fileName || "Sent a file"
  if (message.type === "voice") {
    return `Voice message · ${message.duration ?? 0}s`
  }
  if (message.type === "video") return message.fileName || "Sent a video"
  if (message.type === "video_note") {
    return `Video note · ${message.duration ?? 0}s`
  }
  return message.text || "Message"
}

function historyFor(name: string, user: string): UserHistoryEvent[] {
  const meta = META[user]
  const events: UserHistoryEvent[] = [
    {
      id: `${user}-signup`,
      at: "9:00 AM",
      day: meta?.joined ?? "2026",
      kind: "signup",
      title: "Created a ChatWave account",
      detail: meta?.email,
    },
  ]

  for (const conversation of CONVERSATIONS) {
    let day = "Today"
    for (const item of conversation.messages) {
      if (item.kind === "day") {
        day = item.label
        continue
      }
      if (item.kind === "call" && conversation.name === name) {
        events.push({
          id: item.id,
          at: item.meta,
          day,
          kind: "call",
          title: item.label,
          detail: item.meta,
        })
        continue
      }
      if (item.kind !== "message") continue
      const theirs = conversation.group
        ? item.senderName === name
        : conversation.name === name && item.dir === "in"
      if (!theirs) continue
      events.push({
        id: item.id,
        at: item.time,
        day,
        kind: item.type === "text" ? "message" : "media",
        title: conversation.group ? conversation.name : "Direct message",
        detail: messageDetail(item),
      })
    }
  }

  for (const call of CALLS) {
    if (call.group || call.name !== name) continue
    events.push({
      id: call.id,
      at: call.subtitle,
      day: call.section === "today" ? "Today" : "Yesterday",
      kind: "call",
      title: call.subtitle,
      detail: call.duration ? `Duration ${call.duration}` : undefined,
    })
  }

  events.push({
    id: `${user}-login`,
    at: meta?.lastSeen ?? "Recently",
    day: "Latest session",
    kind: "login",
    title: "Signed in from Dhaka",
    detail: "Chrome · ChatWave web",
  })

  return events
}

export function createManagedUsers(): ManagedUser[] {
  return [...CONTACTS, ...EXTRA].map((contact) => {
    const meta = META[contact.user]
    return {
      id: contact.user,
      name: contact.name,
      user: contact.user,
      email: meta?.email ?? `${contact.user}@chatwave.app`,
      tone: contact.tone,
      presence: contact.presence,
      note: contact.note,
      joined: meta?.joined ?? "2026",
      lastSeen: meta?.lastSeen ?? contact.note,
      status: "active",
      history: historyFor(contact.name, contact.user),
    }
  })
}

export function isManagedUserHidden(
  users: ManagedUser[],
  removedUserKeys: string[],
  id?: string,
  name?: string
) {
  if (id && removedUserKeys.includes(id)) return true
  if (name && removedUserKeys.includes(name)) return true
  const match = users.find((user) => user.id === id || user.name === name)
  return match?.status === "banned"
}

export function filterManagedUsers(users: ManagedUser[], query: string) {
  const term = query.trim().toLowerCase()
  if (!term) return users
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(term) ||
      user.user.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
  )
}
