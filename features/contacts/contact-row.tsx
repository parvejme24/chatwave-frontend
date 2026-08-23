import { MessageCircle, Phone, Video } from "lucide-react"
import Link from "next/link"

import { UserAvatar } from "../../components/shared/user-avatar"
import { contactInitials, type Contact } from "../../lib/types/contact"

export function ContactRow({ contact }: { contact: Contact }) {
  const peer = encodeURIComponent(contact.name)

  return (
    <div className="flex items-center gap-3.5 border-t border-edge py-[13px] first:border-t-0">
      <UserAvatar
        initials={contactInitials(contact.name)}
        tone={contact.tone}
        presence={contact.presence}
        showPresence
      />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[14.5px] font-semibold text-ink">
          {contact.name}
        </span>
        <span className="mt-px block truncate text-[13px] text-ink-3">
          @{contact.user} · {contact.note}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        <Link
          href="/chats"
          aria-label={`Message ${contact.name}`}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <MessageCircle className="size-5 stroke-[1.75]" aria-hidden />
        </Link>
        <Link
          href={`/call?type=audio&peer=${peer}`}
          aria-label={`Call ${contact.name}`}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Phone className="size-5 stroke-[1.75]" aria-hidden />
        </Link>
        <Link
          href={`/call?type=video&peer=${peer}`}
          aria-label={`Video call ${contact.name}`}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-[11px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Video className="size-5 stroke-[1.75]" aria-hidden />
        </Link>
      </span>
    </div>
  )
}
