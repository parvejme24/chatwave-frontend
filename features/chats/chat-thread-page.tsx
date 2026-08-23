"use client"

import { useParams } from "next/navigation"

import { Thread } from "./thread"

export function ChatThreadPage() {
  const { id } = useParams<{ id: string }>()
  return <Thread conversationId={id} />
}
