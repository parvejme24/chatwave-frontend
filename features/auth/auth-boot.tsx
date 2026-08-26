"use client"

import { useLayoutEffect } from "react"
import { toast } from "sonner"

import { persistAccessToken } from "../../lib/api/client"
import { useLazyGetMeQuery } from "../../lib/store/auth-api"
import { hydrateAuth, setCredentials } from "../../lib/store/auth-slice"
import { useAppDispatch } from "../../lib/store/hooks"

export function AuthBoot({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const [getMe] = useLazyGetMeQuery()

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get("accessToken") || params.get("token")

    if (params.get("auth") === "error") {
      toast.error("Could not continue with that account")
    }

    if (tokenFromUrl) {
      persistAccessToken(tokenFromUrl)
      dispatch(hydrateAuth())
      void getMe()
        .unwrap()
        .then((user) => {
          dispatch(setCredentials({ user, accessToken: tokenFromUrl }))
        })
        .catch(() => {
          /* RequireAuth / GuestOnly handle 401 */
        })
      return
    }

    dispatch(hydrateAuth())
  }, [dispatch, getMe])

  return children
}
