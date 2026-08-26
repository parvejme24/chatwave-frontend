import type { ChatMessage } from "./types/chat"

export const MAX_CHAT_FILE_BYTES = 50 * 1024 * 1024
export const MAX_CHAT_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_CHAT_VOICE_BYTES = 10 * 1024 * 1024
export const MAX_CHAT_FILES = 10

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
])

export type ApiMediaType =
  | "image"
  | "file"
  | "voice"
  | "video"
  | "video_note"

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return ""
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`
}

export function fileExtension(name?: string | null) {
  if (!name) return "FILE"
  const base = name.split(/[\\/]/).pop() || name
  const dot = base.lastIndexOf(".")
  if (dot <= 0 || dot === base.length - 1) return "FILE"
  return base.slice(dot + 1).toUpperCase().slice(0, 5)
}

export function looksLikeVideoFile(name?: string | null) {
  if (!name) return false
  const base = name.split(/[?#]/)[0].toLowerCase()
  return /\.(mp4|webm|mov|m4v|mkv|avi|mpeg)$/.test(base)
}

export function messageTypeForFile(file: File): ChatMessage["type"] {
  const mime = (file.type || "").toLowerCase()
  const name = file.name.toLowerCase()
  if (
    mime.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|heic|heif|avif|bmp|svg)$/.test(name)
  ) {
    return "image"
  }
  if (mime.startsWith("video/") || looksLikeVideoFile(name)) {
    return "video"
  }
  if (
    mime.startsWith("audio/") ||
    /\.(mp3|wav|m4a|aac|ogg|flac|opus)$/.test(name)
  ) {
    return "voice"
  }
  return "file"
}

export function messageTypeForFiles(files: File[]): ChatMessage["type"] {
  if (files.length === 0) return "file"
  const kinds = new Set(files.map(messageTypeForFile))
  if (kinds.size === 1) return [...kinds][0]
  return "file"
}

export function apiTypeForFiles(files: File[]): ApiMediaType {
  if (files.length === 0) return "file"
  const mimes = files.map((file) => (file.type || "").toLowerCase())

  // Only declare image/video/voice when every file has a matching MIME.
  // Filename-only guesses can make the API reject the upload (400).
  if (
    mimes.every((mime) => IMAGE_MIMES.has(mime)) &&
    files.every((file) => file.size <= MAX_CHAT_IMAGE_BYTES)
  ) {
    return "image"
  }
  if (mimes.every((mime) => mime.startsWith("video/"))) return "video"
  if (
    mimes.every(
      (mime) =>
        mime.startsWith("audio/") ||
        mime === "audio/webm" ||
        mime === "audio/mpeg" ||
        mime === "audio/ogg" ||
        mime === "audio/mp4" ||
        mime === "audio/wav"
    ) &&
    files.every((file) => file.size <= MAX_CHAT_VOICE_BYTES)
  ) {
    return "voice"
  }
  return "file"
}

export function sendLabelForType(type: ChatMessage["type"], count = 1) {
  if (type === "image") return count > 1 ? `${count} photos sent` : "Photo sent"
  if (type === "video") return count > 1 ? `${count} videos sent` : "Video sent"
  if (type === "voice") return "Audio sent"
  return count > 1 ? `${count} files sent` : "File sent"
}
