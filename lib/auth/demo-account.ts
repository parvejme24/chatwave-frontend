export type DemoAccount = {
  id: "a" | "b"
  label: string
  browserHint: string
  name: string
  email: string
  password: string
}

/**
 * Two public test accounts so reviewers can open ChatWave in two browsers
 * and test chat + calls together.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: "a",
    label: "User A",
    browserHint: "Browser 1",
    name: "Test User A",
    email: "mdparvejmep@gmail.com",
    password: "12345678",
  },
  {
    id: "b",
    label: "User B",
    browserHint: "Browser 2",
    name: "Test User B",
    email: "mdparvejme24@gmail.com",
    password: "12345678",
  },
] as const
