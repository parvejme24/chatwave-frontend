import axios, { type AxiosError } from "axios"

import { apiBaseUrl, apiErrorMessage } from "../api"

export const ACCESS_TOKEN_KEY = "cw_access_token"

type TokenReader = () => string | null

let readAccessToken: TokenReader = () => {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function bindAccessTokenReader(reader: TokenReader) {
  readAccessToken = reader
}

export function persistAccessToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
  else window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const axiosClient = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

axiosClient.interceptors.request.use((config) => {
  config.baseURL = apiBaseUrl()
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type")
    } else {
      delete config.headers["Content-Type"]
    }
  }
  const token = readAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function isBrowserNetworkError(error: AxiosError) {
  return (
    !error.response &&
    (error.code === "ERR_NETWORK" ||
      error.message === "Network Error" ||
      error.message.includes("CORS"))
  )
}

export function axiosErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    if (isBrowserNetworkError(axiosError)) {
      return "Cannot reach the API. Check that the backend is running."
    }
    return apiErrorMessage(axiosError.response?.data, axiosError.message || fallback)
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
