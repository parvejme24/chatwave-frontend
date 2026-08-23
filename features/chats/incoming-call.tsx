"use client"

import { AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { IncomingCallDialog } from "../call/incoming-call-dialog"
import { playSound, startSoundLoop, stopSoundLoop } from "../../lib/sounds"

export function IncomingCall() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      if (event.key === "Escape") {
        setOpen((wasOpen) => {
          if (wasOpen) playSound("callEnd")
          return false
        })
        return
      }

      if ((event.key === "i" || event.key === "I") && !typing) {
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!open) {
      stopSoundLoop("incoming")
      return
    }
    startSoundLoop("incoming")
    return () => stopSoundLoop("incoming")
  }, [open])

  function close() {
    setOpen(false)
    playSound("callEnd")
  }

  return (
    <AnimatePresence>
      {open ? (
        <IncomingCallDialog
          key="incoming-call"
          peer="Tanvir Rahman"
          initials="TR"
          href="/call?type=video&peer=Tanvir%20Rahman"
          onDismiss={close}
          onDecline={() => {
            close()
            toast("Call declined")
          }}
          onAccept={() => setOpen(false)}
        />
      ) : null}
    </AnimatePresence>
  )
}
