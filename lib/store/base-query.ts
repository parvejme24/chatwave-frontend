import type { BaseQueryFn } from "@reduxjs/toolkit/query"
import type { AxiosError, AxiosRequestConfig } from "axios"

import { axiosClient, axiosErrorMessage } from "../api/client"

export type ApiQueryError = {
  status?: number
  data?: unknown
  message: string
}

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string
      method?: AxiosRequestConfig["method"]
      data?: AxiosRequestConfig["data"]
      params?: AxiosRequestConfig["params"]
    },
    unknown,
    ApiQueryError
  > =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await axiosClient({ url, method, data, params })
      return { data: result.data }
    } catch (caught) {
      const error = caught as AxiosError
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data,
          message: axiosErrorMessage(error, "Request failed"),
        },
      }
    }
  }
