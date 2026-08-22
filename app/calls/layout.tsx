import { MainLayout } from "@/components/main/main-layout"

export default function CallsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}
