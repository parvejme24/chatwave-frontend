"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import {
  endCallKeepalive,
  persistLiveCallId,
  readLiveCallId,
} from "../../lib/call"
import {
  useDeclineCallMutation,
  useEndCallMutation,
} from "../../lib/store/calls-api"

export function CallSessionGuard() {
  const pathname = usePathname()
  const [endCall] = useEndCallMutation()
  const [declineCall] = useDeclineCallMutation()
  const wasOnCall = useRef(pathname === "/call")

  useEffect(() => {
    if (pathname === "/call") return
    const leftover = readLiveCallId()
    if (!leftover) return
    void (async () => {
      try {
        await endCall({ id: leftover }).unwrap()
      } catch {
        try {
          await declineCall(leftover).unwrap()
        } catch {
          persistLiveCallId(null)
        }
      }
    })()
    // Only clear a leftover from a previous session on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pathname !== "/call") return
    wasOnCall.current = true
    const id =
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("callId")?.trim() || ""
    if (id) persistLiveCallId(id)
  }, [pathname])

  useEffect(() => {
    if (pathname === "/call") return
    if (!wasOnCall.current) return
    wasOnCall.current = false
    const id = readLiveCallId()
    if (!id) return
    void (async () => {
      try {
        await endCall({ id }).unwrap()
      } catch {
        try {
          await declineCall(id).unwrap()
        } catch {
          persistLiveCallId(null)
        }
      }
    })()
  }, [declineCall, endCall, pathname])

  useEffect(() => {
    function onPageHide() {
      const id = readLiveCallId()
      if (id) endCallKeepalive(id)
    }
    window.addEventListener("pagehide", onPageHide)
    return () => window.removeEventListener("pagehide", onPageHide)
  }, [])

  return null
}
