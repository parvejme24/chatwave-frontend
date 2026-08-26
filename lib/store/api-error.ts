import type { ApiQueryError } from "./base-query"

export function isApiQueryError(error: unknown): error is ApiQueryError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
  )
}

export function mutationErrorMessage(error: unknown, fallback: string) {
  if (isApiQueryError(error) && error.message) return error.message
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === "object" && "error" in data) {
      const value = (data as { error?: unknown }).error
      if (typeof value === "string" && value) return value
    }
  }
  return fallback
}

export function isBadRequest(error: unknown) {
  if (!error || typeof error !== "object") return false
  return (error as { status?: unknown }).status === 400
}

export function isAlreadyInCallError(error: unknown) {
  return /already in a call/i.test(mutationErrorMessage(error, ""))
}

export function photoUploadErrorMessage(error: unknown) {
  const raw = mutationErrorMessage(error, "")
  if (/cloud_name|cloudinary/i.test(raw)) {
    return "Photo could not be uploaded. Cloudinary is not set up on the server."
  }
  return raw || "Could not upload photo"
}
