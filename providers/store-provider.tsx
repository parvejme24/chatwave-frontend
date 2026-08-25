"use client"

import { Provider } from "react-redux"

import { AuthBoot } from "../features/auth/auth-boot"
import { store } from "../lib/store/store"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBoot>{children}</AuthBoot>
    </Provider>
  )
}
