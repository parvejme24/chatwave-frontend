import { ChatsShell } from "@/components/chats/chats-shell"
import { MainLayout } from "@/components/main/main-layout"

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      <ChatsShell>{children}</ChatsShell>
    </MainLayout>
  )
}
