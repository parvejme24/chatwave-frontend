import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"

import { persistAccessToken } from "../api/client"
import type { AuthPayload, AuthUser } from "../types/auth"

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  hydrated: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  hydrated: false,
}

function readStoredToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem("cw_access_token")
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state) {
      state.accessToken = readStoredToken()
      state.hydrated = true
    },
    setCredentials(state, action: PayloadAction<AuthPayload>) {
      state.user = action.payload.user
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken
        persistAccessToken(action.payload.accessToken)
      }
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
    },
    clearAuth(state) {
      state.user = null
      state.accessToken = null
      persistAccessToken(null)
    },
  },
})

export const { hydrateAuth, setCredentials, setUser, clearAuth } =
  authSlice.actions
export const authReducer = authSlice.reducer

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.accessToken
export const selectAuthHydrated = (state: { auth: AuthState }) =>
  state.auth.hydrated
