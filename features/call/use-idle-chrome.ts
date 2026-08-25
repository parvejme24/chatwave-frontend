"use client"

import { useEffect, useState } from "react"

export function useIdleChrome(enabled: boolean, idleMs = 5000) {
  const [visible, setVisible] = useState(true)
  if (!enabled && !visible) setVisible(true)

  useEffect(() => {
    if (!enabled) return

    let timer = window.setTimeout(() => setVisible(false), idleMs)

    function bump() {
      setVisible(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setVisible(false), idleMs)
    }

    window.addEventListener("mousemove", bump)
    window.addEventListener("touchstart", bump)
    window.addEventListener("keydown", bump)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("mousemove", bump)
      window.removeEventListener("touchstart", bump)
      window.removeEventListener("keydown", bump)
    }
  }, [enabled, idleMs])

  return visible
}
