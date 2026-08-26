"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Skeleton } from "../../components/ui/skeleton"
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
      <div
        className="grid h-dvh place-items-center bg-paper px-6"
        aria-busy
        aria-label="Loading"
      >
        <div className="flex w-full max-w-[280px] flex-col items-center gap-4">
          <Skeleton className="size-12 rounded-[14px] bg-surface-2" />
          <div className="w-full space-y-2">
            <Skeleton className="mx-auto h-3.5 w-[48%] rounded-md bg-surface-2" />
            <Skeleton className="mx-auto h-3 w-[64%] rounded-md bg-surface-2" />
          </div>
        </div>
      </div>
    )
  }

  return children
}
