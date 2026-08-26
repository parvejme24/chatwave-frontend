"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useGetMeQuery } from "../../lib/store/auth-api"
import {
  selectAccessToken,
  selectAuthHydrated,
  selectAuthUser,
} from "../../lib/store/auth-slice"
import { useAppSelector } from "../../lib/store/hooks"

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hydrated = useAppSelector(selectAuthHydrated)
  const user = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAccessToken)
  const { isSuccess, isFetching } = useGetMeQuery(undefined, {
    skip: !hydrated || !token,
  })

  const signedIn = Boolean(user) || (hydrated && isSuccess)
  const verifyingSession = hydrated && Boolean(token) && isFetching

  useEffect(() => {
    if (!hydrated || isFetching) return
    if (user || isSuccess) router.replace("/chats")
  }, [hydrated, isFetching, isSuccess, router, user])

  // Guests see the form immediately. Only hold the page when a session
  // is confirmed or currently being verified.
  if (signedIn || verifyingSession) {
    return (
      <div className="grid h-dvh place-items-center bg-paper text-sm text-ink-3">
        Redirecting…
      </div>
    )
  }

  return children
}
