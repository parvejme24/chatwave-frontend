import { ChatsShell } from "../../features/chats/chats-shell"
import { MainLayout } from "../../components/layout/main-layout"

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
