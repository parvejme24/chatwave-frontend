"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"

import {
  endCallKeepalive,
  hrefForLiveCall,
  persistLiveCallId,
  readLiveCallId,
} from "../../lib/call"
import { isAlreadyInCallError } from "../../lib/store/api-error"
import { useStartCallMutation } from "../../lib/store/calls-api"
import { useOpenContactChatMutation } from "../../lib/store/contacts-api"
import { useCreateDirectConversationMutation } from "../../lib/store/conversations-api"
import { useAppDispatch } from "../../lib/store/hooks"
import { setIncomingCall } from "../../lib/store/realtime-slice"
import type { CallType, LiveCall } from "../../lib/types/call"

const pending = new Map<string, Promise<LiveCall>>()

export function useStartCall() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [startCallMut, startState] = useStartCallMutation()
  const [openChat, chatState] = useOpenContactChatMutation()
  const [createDirect, directState] = useCreateDirectConversationMutation()

  const clearLocalBusy = useCallback(() => {
    dispatch(setIncomingCall(null))
    const stored = readLiveCallId()
    persistLiveCallId(null)
    if (stored) endCallKeepalive(stored)
  }, [dispatch])

  const placeCall = useCallback(
    async (conversationId: string, type: CallType) => {
      try {
        return await startCallMut({ conversationId, type }).unwrap()
      } catch (error) {
        if (!isAlreadyInCallError(error)) throw error
        clearLocalBusy()
        return await startCallMut({ conversationId, type }).unwrap()
      }
    },
    [clearLocalBusy, startCallMut]
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

        clearLocalBusy()
        const live = await placeCall(conversationId, args.type)
        const href = hrefForLiveCall({
          ...live,
          peer: {
            ...live.peer,
            name: live.peer?.name || args.peer || "ChatWave",
          },
        })
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
    [clearLocalBusy, createDirect, openChat, pathname, placeCall, router]
  )

  return {
    startCall,
    isStarting:
      startState.isLoading || chatState.isLoading || directState.isLoading,
  }
}
