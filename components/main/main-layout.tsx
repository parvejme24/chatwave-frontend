import { AppShell } from "@/components/main/app-shell"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
