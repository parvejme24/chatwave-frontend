"use client"

import { useEffect, useRef } from "react"

import { ACCESS_TOKEN_KEY } from "../../lib/api/client"
import { API_PROXY_PREFIX } from "../../lib/api"
import { useUpdateMyPresenceMutation } from "../../lib/store/users-api"
import type { Presence } from "../../lib/types/chat"

const HEARTBEAT_MS = 30_000

function currentPresence(): Presence {
  return document.visibilityState === "visible" ? "online" : "away"
}

export function PresenceHeartbeat() {
  const [updatePresence] = useUpdateMyPresenceMutation()
  const latest = useRef(updatePresence)

  useEffect(() => {
    latest.current = updatePresence
  }, [updatePresence])

  useEffect(() => {
    function send(presence: Presence) {
      void latest.current({ presence })
    }

    send(currentPresence())
    const tick = window.setInterval(() => {
      if (document.visibilityState === "visible") send("online")
    }, HEARTBEAT_MS)

    function onVisibility() {
      send(currentPresence())
    }

    function onPageHide() {
      const token =
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem(ACCESS_TOKEN_KEY)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers.Authorization = `Bearer ${token}`
      void fetch(`${API_PROXY_PREFIX}/api/users/me/presence`, {
        method: "PATCH",
        body: JSON.stringify({ presence: "offline" }),
        headers,
        keepalive: true,
        credentials: "include",
      })
    }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", onPageHide)
    return () => {
      window.clearInterval(tick)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", onPageHide)
    }
  }, [])

  return null
}
