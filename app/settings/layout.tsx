import { MainLayout } from "@/components/main/main-layout"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
