import { Thread } from "@/components/chats/thread"

export function ChatsPage() {
  return (
    <div className="hidden h-full min-[860px]:flex min-[860px]:flex-1">
      <Thread conversationId="nadia" />
    </div>
  )
}
