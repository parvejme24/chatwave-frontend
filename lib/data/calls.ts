import type { CallFilter, CallRecord, CallSection } from "@/lib/types/call"

export const CALL_SECTIONS: CallSection[] = [
  {
    id: "today",
    title: "Today",
    meta: "4 calls · 41 minutes total",
    showNewCall: true,
  },
  {
    id: "yesterday",
    title: "Yesterday",
    meta: "2 calls",
  },
]

export const CALLS: CallRecord[] = [
  {
    id: "tanvir-missed-video",
    section: "today",
    name: "Tanvir Rahman",
    initials: "TR",
    tone: "f",
    presence: "away",
    type: "video",
    status: "missed",
    direction: "missed",
    subtitle: "Missed video call · 11:20 AM",
    actions: [
      {
        type: "audio",
        href: "/call?type=audio&peer=Tanvir%20Rahman",
        label: "Call Tanvir back",
      },
      {
        type: "video",
        href: "/call?type=video&peer=Tanvir%20Rahman",
        label: "Video call Tanvir",
      },
    ],
  },
  {
    id: "nadia-out-video",
    section: "today",
    name: "Nadia Hasan",
    initials: "NH",
    tone: "b",
    presence: "online",
    type: "video",
    status: "ended",
    direction: "out",
    subtitle: "Outgoing video · 9:02 AM",
    duration: "24:18",
    actions: [
      {
        type: "video",
        href: "/call?type=video&peer=Nadia%20Hasan",
        label: "Call Nadia again",
      },
    ],
  },
  {
    id: "guild-in-voice",
    section: "today",
    name: "Frontend Guild",
    initials: "FG",
    tone: "e",
    group: true,
    type: "audio",
    status: "ended",
    direction: "in",
    subtitle: "Group voice · 4 joined · 8:30 AM",
    duration: "12:44",
    actions: [
      {
        type: "audio",
        href: "/call?type=audio&peer=Frontend%20Guild",
        label: "Rejoin group call",
      },
    ],
  },
  {
    id: "sumaiya-in-voice",
    section: "today",
    name: "Sumaiya Akter",
    initials: "SA",
    tone: "d",
    presence: "online",
    type: "audio",
    status: "ended",
    direction: "in",
    subtitle: "Incoming voice · 7:55 AM",
    duration: "04:02",
    actions: [
      {
        type: "audio",
        href: "/call?type=audio&peer=Sumaiya%20Akter",
        label: "Call Sumaiya",
      },
    ],
  },
  {
    id: "amma-out-voice",
    section: "yesterday",
    name: "Amma",
    initials: "AM",
    tone: "c",
    type: "audio",
    status: "ended",
    direction: "out",
    subtitle: "Outgoing voice · 8:15 PM",
    duration: "31:07",
    actions: [
      {
        type: "audio",
        href: "/call?type=audio&peer=Amma",
        label: "Call Amma",
      },
    ],
  },
  {
    id: "nadia-declined",
    section: "yesterday",
    name: "Nadia Hasan",
    initials: "NH",
    tone: "b",
    type: "video",
    status: "declined",
    direction: "missed",
    subtitle: "Declined · 2:40 PM",
    endTag: "Declined",
  },
]

export function filterCalls(calls: CallRecord[], filter: CallFilter) {
  if (filter === "all") return calls
  if (filter === "missed") {
    return calls.filter(
      (call) => call.status === "missed" || call.status === "declined"
    )
  }
  if (filter === "voice") return calls.filter((call) => call.type === "audio")
  return calls.filter((call) => call.type === "video")
}
