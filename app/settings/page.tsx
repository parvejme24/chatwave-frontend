import type { Metadata } from "next"

import { MainLayout } from "../../components/layout/main-layout"
import { SettingsPage } from "../../features/settings/settings-page"

export const metadata: Metadata = {
  title: "Settings",
  description: "Your account, privacy, and how ChatWave behaves.",
}

export default function SettingsRoute() {
  return (
    <MainLayout>
      <SettingsPage />
    </MainLayout>
  )
}
