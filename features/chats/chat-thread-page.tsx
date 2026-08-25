"use client"

import { useParams } from "next/navigation"

import { Thread } from "./thread"

export function ChatThreadPage() {
  const { id } = useParams<{ id: string }>()
  const conversationId = Array.isArray(id) ? id[0] : id
  return <Thread conversationId={conversationId ?? ""} />
}
