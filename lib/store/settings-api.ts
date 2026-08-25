import { createApi } from "@reduxjs/toolkit/query/react"

import {
  applySettingsPatch,
  unwrapPresentSettings,
  unwrapSettingsPage,
  unwrapSoundsCatalog,
  type SettingsPagePayload,
  type SoundsCatalog,
  type UpdateSettingsInput,
} from "../types/settings"
import { axiosBaseQuery } from "./base-query"

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Settings", "Sounds"],
  endpoints: (build) => ({
    getSettings: build.query<SettingsPagePayload, void>({
      query: () => ({ url: "/api/settings" }),
      transformResponse: (response: unknown) => unwrapSettingsPage(response),
      providesTags: ["Settings"],
    }),
    updateSettings: build.mutation<
      { page: SettingsPagePayload; present: UpdateSettingsInput },
      UpdateSettingsInput
    >({
      query: (body) => ({
        url: "/api/settings",
        method: "PATCH",
        data: body,
      }),
      transformResponse: (response: unknown) => ({
        page: unwrapSettingsPage(response),
        present: unwrapPresentSettings(response),
      }),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          settingsApi.util.updateQueryData("getSettings", undefined, (draft) => {
            draft.settings = applySettingsPatch(draft.settings, patch)
          })
        )
        try {
          const { data } = await queryFulfilled
          const { page, present } = data
          dispatch(
            settingsApi.util.updateQueryData(
              "getSettings",
              undefined,
              (draft) => {
                if (Object.keys(present).length) {
                  draft.settings = applySettingsPatch(draft.settings, present)
                }
                if (page.profile) draft.profile = page.profile
                if (page.auth) draft.auth = page.auth
                if (page.privacy) draft.privacy = page.privacy
                if (typeof page.isOwner === "boolean") draft.isOwner = page.isOwner
                if (page.sessions) draft.sessions = page.sessions
                if (page.storage) draft.storage = page.storage
              }
            )
          )
        } catch {
          optimistic.undo()
        }
      },
    }),
    getSoundsCatalog: build.query<SoundsCatalog, void>({
      query: () => ({ url: "/api/settings/sounds" }),
      transformResponse: (response: unknown) => unwrapSoundsCatalog(response),
      providesTags: ["Sounds"],
    }),
    requestDeleteAccount: build.mutation<{ ok?: boolean; emailed?: boolean }, void>(
      {
        query: () => ({
          url: "/api/settings/delete-account",
          method: "POST",
        }),
      }
    ),
    confirmDeleteAccount: build.mutation<{ ok?: boolean }, { token: string }>({
      query: (body) => ({
        url: "/api/settings/delete-account/confirm",
        method: "POST",
        data: body,
      }),
    }),
  }),
})

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetSoundsCatalogQuery,
  useRequestDeleteAccountMutation,
  useConfirmDeleteAccountMutation,
} = settingsApi
