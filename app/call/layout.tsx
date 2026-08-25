import { RequireAuth } from "../../features/auth/require-auth"

export default function CallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireAuth>{children}</RequireAuth>
}
