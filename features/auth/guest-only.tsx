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

/**
 * Auth screens (sign-in / sign-up / forgot password).
 * Always render the page for guests. If a valid session exists, send them to /chats.
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hydrated = useAppSelector(selectAuthHydrated)
  const user = useAppSelector(selectAuthUser)
  const token = useAppSelector(selectAccessToken)
  const { isSuccess, isFetching } = useGetMeQuery(undefined, {
    skip: !hydrated || !token,
  })

  useEffect(() => {
    if (!hydrated || isFetching) return
    if (user || isSuccess) router.replace("/chats")
  }, [hydrated, isFetching, isSuccess, router, user])

  return children
}
