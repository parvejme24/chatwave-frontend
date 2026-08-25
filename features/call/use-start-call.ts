"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"

import { hrefForLiveCall, persistLiveCallId, readLiveCallId } from "../../lib/call"
import { isAlreadyInCallError } from "../../lib/store/api-error"
import {
  useDeclineCallMutation,
  useEndCallMutation,
  useLazyGetCallsQuery,
  useStartCallMutation,
} from "../../lib/store/calls-api"
import { useOpenContactChatMutation } from "../../lib/store/contacts-api"
import { useCreateDirectConversationMutation } from "../../lib/store/conversations-api"
import { useAppDispatch } from "../../lib/store/hooks"
import { setIncomingCall } from "../../lib/store/realtime-slice"
import type { CallRecord, CallType, LiveCall } from "../../lib/types/call"
import { isOpenCallStatus } from "../../lib/types/call"

const pending = new Map<string, Promise<LiveCall>>()

function isLeftoverCall(call: CallRecord) {
  return Boolean(call.id) && isOpenCallStatus(call.status)
}

export function useStartCall() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [startCallMut, startState] = useStartCallMutation()
  const [endCallMut, endState] = useEndCallMutation()
  const [declineCallMut, declineState] = useDeclineCallMutation()
  const [loadCalls] = useLazyGetCallsQuery()
  const [openChat, chatState] = useOpenContactChatMutation()
  const [createDirect, directState] = useCreateDirectConversationMutation()

  const closeCall = useCallback(
    async (id: string, direction?: CallRecord["direction"], status?: string) => {
      try {
        if (direction === "in" && status === "ringing") {
          await declineCallMut(id).unwrap()
          return
        }
        await endCallMut({ id }).unwrap()
      } catch {
        try {
          await endCallMut({ id }).unwrap()
        } catch {
          try {
            await declineCallMut(id).unwrap()
          } catch {
            /* call already closed */
          }
        }
      }
    },
    [declineCallMut, endCallMut]
  )

  const hangUpLeftovers = useCallback(async () => {
    dispatch(setIncomingCall(null))
    const ids = new Set<string>()
    const stored = readLiveCallId()
    if (stored) ids.add(stored)
    try {
      const list = await loadCalls({ filter: "all", limit: 20 }).unwrap()
      for (const call of list.calls.filter(isLeftoverCall)) {
        ids.add(call.id)
        await closeCall(call.id, call.direction, call.status)
      }
    } catch {
      /* history can fail; still try the stored id */
    }
    if (stored && ids.has(stored)) {
      await closeCall(stored)
    }
    persistLiveCallId(null)
  }, [closeCall, dispatch, loadCalls])

  const placeCall = useCallback(
    async (conversationId: string, type: CallType) => {
      try {
        return await startCallMut({ conversationId, type }).unwrap()
      } catch (error) {
        if (!isAlreadyInCallError(error)) throw error
        await hangUpLeftovers()
        return await startCallMut({ conversationId, type }).unwrap()
      }
    },
    [hangUpLeftovers, startCallMut]
  )

  const startCall = useCallback(
    async (args: {
      type: CallType
      conversationId?: string
      userId?: string
      peer?: string
    }) => {
      const key = `${args.type}:${args.conversationId || args.userId || args.peer}`
      const existing = pending.get(key)
      if (existing) return existing

      const request = (async () => {
        let conversationId = args.conversationId
        if (!conversationId && args.userId) {
          try {
            const chat = await openChat(args.userId).unwrap()
            conversationId = chat.conversationId
          } catch {
            const conversation = await createDirect({
              userId: args.userId,
            }).unwrap()
            conversationId = conversation.id
          }
        }
        if (!conversationId) {
          throw new Error("Pick someone to call from Contacts or a chat")
        }
        await hangUpLeftovers()
        const live = await placeCall(conversationId, args.type)
        const href = hrefForLiveCall(live)
        if (pathname === "/call") router.replace(href)
        else router.push(href)
        return live
      })()

      pending.set(key, request)
      try {
        return await request
      } finally {
        pending.delete(key)
      }
    },
    [createDirect, hangUpLeftovers, openChat, pathname, placeCall, router]
  )

  return {
    startCall,
    isStarting:
      startState.isLoading ||
      chatState.isLoading ||
      directState.isLoading ||
      endState.isLoading ||
      declineState.isLoading,
  }
}
