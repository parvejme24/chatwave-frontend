import { configureStore } from "@reduxjs/toolkit"

import { bindAccessTokenReader } from "../api/client"
import { adminApi } from "./admin-api"
import { authApi } from "./auth-api"
import { authReducer } from "./auth-slice"
import { blocksApi } from "./blocks-api"
import { callsApi } from "./calls-api"
import { contactsApi } from "./contacts-api"
import { conversationsApi } from "./conversations-api"
import { bindViewerIdReader, messagesApi } from "./messages-api"
import { notificationsApi } from "./notifications-api"
import { realtimeReducer } from "./realtime-slice"
import { settingsApi } from "./settings-api"
import { usersApi } from "./users-api"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    realtime: realtimeReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [blocksApi.reducerPath]: blocksApi.reducer,
    [conversationsApi.reducerPath]: conversationsApi.reducer,
    [messagesApi.reducerPath]: messagesApi.reducer,
    [callsApi.reducerPath]: callsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      usersApi.middleware,
      contactsApi.middleware,
      blocksApi.middleware,
      conversationsApi.middleware,
      messagesApi.middleware,
      callsApi.middleware,
      settingsApi.middleware,
      adminApi.middleware,
      notificationsApi.middleware
    ),
})

bindAccessTokenReader(() => store.getState().auth.accessToken)
bindViewerIdReader(() => store.getState().auth.user?.id)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
