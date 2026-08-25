"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useGetMyUserQuery } from "../../lib/store/users-api"
import {
  selectAccessToken,
  selectAuthHydrated,
  selectAuthUser,
} from "../../lib/store/auth-slice"
import { useAppSelector } from "../../lib/store/hooks"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hydrated = useAppSelector(selectAuthHydrated)
  const user = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAccessToken)
  const { isFetching } = useGetMyUserQuery(undefined, {
    skip: !hydrated || !token,
  })

  useEffect(() => {
    if (!hydrated || isFetching) return
    if (!user) router.replace("/sign-in")
  }, [hydrated, isFetching, router, user])

  if (!hydrated || (!user && isFetching) || !user) {
    return (
      <div className="grid h-dvh place-items-center bg-paper text-sm text-ink-3">
        Loading…
      </div>
    )
  }

  return children
}
