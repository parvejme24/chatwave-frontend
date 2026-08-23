import type { Metadata } from "next"

import { ForgotPasswordPage } from "../../features/auth/forgot-password-page"

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your ChatWave password with a one-time verification code.",
}

export default ForgotPasswordPage
