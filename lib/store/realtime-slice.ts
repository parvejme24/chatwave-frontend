import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { LiveCall } from "../types/call"
import type { AvatarTone } from "../types/chat"

export type TypingPeer = {
  userId: string
  name: string
  initials: string
  tone: AvatarTone
}

type RealtimeState = {
  connected: boolean
  typing: Record<string, TypingPeer | undefined>
  incomingCall: LiveCall | null
}

const initialState: RealtimeState = {
  connected: false,
  typing: {},
  incomingCall: null,
}

const realtimeSlice = createSlice({
  name: "realtime",
  initialState,
  reducers: {
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload
      if (!action.payload) {
        state.typing = {}
      }
    },
    setTyping(
      state,
      action: PayloadAction<{
        conversationId: string
        peer: TypingPeer | null
      }>
    ) {
      const { conversationId, peer } = action.payload
      if (!peer) delete state.typing[conversationId]
      else state.typing[conversationId] = peer
    },
    setIncomingCall(state, action: PayloadAction<LiveCall | null>) {
      state.incomingCall = action.payload
    },
    resetRealtime() {
      return initialState
    },
  },
})

export const {
  setSocketConnected,
  setTyping,
  setIncomingCall,
  resetRealtime,
} = realtimeSlice.actions
export const realtimeReducer = realtimeSlice.reducer

export const selectSocketConnected = (state: { realtime: RealtimeState }) =>
  state.realtime.connected
export const selectIncomingCall = (state: { realtime: RealtimeState }) =>
  state.realtime.incomingCall
export const selectTyping = (
  state: { realtime: RealtimeState },
  conversationId: string
) => state.realtime.typing[conversationId]
