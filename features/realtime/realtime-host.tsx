"use client"

import { IncomingCall } from "../chats/incoming-call"
import { PresenceHeartbeat } from "../users/presence-heartbeat"
import { CallSessionGuard } from "../call/call-session-guard"
import { selectAccessToken } from "../../lib/store/auth-slice"
import { useAppSelector } from "../../lib/store/hooks"
import { SocketBridge } from "./socket-bridge"

export function RealtimeHost() {
  const token = useAppSelector(selectAccessToken)
  if (!token) return null
  return (
    <>
      <PresenceHeartbeat />
      <SocketBridge />
      <IncomingCall />
      <CallSessionGuard />
    </>
  )
}
