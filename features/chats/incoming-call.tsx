"use client"

import { AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

import { IncomingCallDialog } from "../call/incoming-call-dialog"
import { hrefForLiveCall } from "../../lib/call"
import { mutationErrorMessage } from "../../lib/store/api-error"
import { selectAccessToken, selectAuthUser } from "../../lib/store/auth-slice"
import {
  useAcceptCallMutation,
  useDeclineCallMutation,
  useGetCallsQuery,
} from "../../lib/store/calls-api"
import { useAppDispatch, useAppSelector } from "../../lib/store/hooks"
import {
  selectIncomingCall,
  selectSocketConnected,
  setIncomingCall,
} from "../../lib/store/realtime-slice"
import { playSound, startSoundLoop, stopSoundLoop } from "../../lib/sounds"

export function IncomingCall() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAccessToken)
  const me = useAppSelector(selectAuthUser)
  const socketConnected = useAppSelector(selectSocketConnected)
  const socketIncoming = useAppSelector(selectIncomingCall)
  const activeCallId = useMemo(() => {
    if (pathname !== "/call") return ""
    if (typeof window === "undefined") return ""
    return new URLSearchParams(window.location.search).get("callId")?.trim() || ""
  }, [pathname])
  const { data } = useGetCallsQuery(
    { filter: "all", limit: 20 },
    {
      skip: !token || socketConnected,
      pollingInterval: token && !socketConnected ? 4000 : 0,
    }
  )
  const polled = useMemo(() => {
    if (socketConnected) return undefined
    return data?.calls.find(
      (call) =>
        call.status === "ringing" &&
        call.direction === "in" &&
        call.id !== activeCallId
    )
  }, [activeCallId, data, socketConnected])
  const [acceptCall, { isLoading: accepting }] = useAcceptCallMutation()
  const [declineCall, { isLoading: declining }] = useDeclineCallMutation()

  const incoming =
    socketIncoming &&
    socketIncoming.status === "ringing" &&
    socketIncoming.id !== activeCallId &&
    socketIncoming.initiatedBy !== me?.id
      ? socketIncoming
      : null

  const peer = incoming?.peer.name || polled?.name || ""
  const initials = incoming?.peer.initials || polled?.initials || "?"
  const kind = incoming?.type || polled?.type || "video"
  const callId = incoming?.id || polled?.id || ""
  const open = Boolean(callId)

  useEffect(() => {
    if (!open) {
      stopSoundLoop("incoming")
      return
    }
    startSoundLoop("incoming")
    return () => stopSoundLoop("incoming")
  }, [open, callId])

  async function decline() {
    if (!callId) return
    try {
      await declineCall(callId).unwrap()
      dispatch(setIncomingCall(null))
      playSound("callEnd")
      toast("Call declined")
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not decline call"))
    }
  }

  async function accept() {
    if (!callId) return
    try {
      const live = await acceptCall(callId).unwrap()
      dispatch(setIncomingCall(null))
      stopSoundLoop("incoming")
      const href =
        hrefForLiveCall(live) ||
        (incoming ? hrefForLiveCall(incoming) : "") ||
        polled?.href ||
        polled?.actions?.[0]?.href ||
        "/"
      router.replace(href.startsWith("/call") ? href : hrefForLiveCall(live) || href)
    } catch (error) {
      toast.error(mutationErrorMessage(error, "Could not accept call"))
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <IncomingCallDialog
          key={callId}
          peer={peer}
          initials={initials}
          kind={kind}
          busy={accepting || declining}
          onDismiss={() => void decline()}
          onDecline={() => void decline()}
          onAccept={() => void accept()}
        />
      ) : null}
    </AnimatePresence>
  )
}
