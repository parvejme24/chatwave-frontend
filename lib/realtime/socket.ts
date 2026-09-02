import { io, type Socket } from "socket.io-client"

import { remoteApiBaseUrl } from "../api"

let socket: Socket | null = null

export function socketOrigin() {
  return (
    process.env.NEXT_PUBLIC_SOCKET_URL || remoteApiBaseUrl()
  ).replace(/\/$/, "")
}

export function getSocket() {
  return socket
}

export function connectSocket(token: string) {
  if (socket?.connected) return socket
  if (socket) {
    socket.auth = { token }
    socket.connect()
    return socket
  }

  socket = io(socketOrigin(), {
    path: "/socket.io",
    withCredentials: true,
    auth: { token },
    transports: ["polling", "websocket"],
    autoConnect: true,
  })
  return socket
}

export function disconnectSocket() {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}

export function emitJoinConversation(conversationId: string) {
  socket?.emit("conversation:join", { conversationId })
}

export function emitLeaveConversation(conversationId: string) {
  socket?.emit("conversation:leave", { conversationId })
}

export function emitTyping(conversationId: string, typing: boolean) {
  socket?.emit(typing ? "typing:start" : "typing:stop", { conversationId })
}

export function emitCallJoin(callId: string) {
  socket?.emit("call:join", { callId })
}

export function emitCallLeave(callId: string) {
  socket?.emit("call:leave", { callId })
}

export function emitWebRtcOffer(payload: {
  callId: string
  toUserId: string
  sdp: RTCSessionDescriptionInit
}) {
  socket?.emit("webrtc:offer", payload)
}

export function emitWebRtcAnswer(payload: {
  callId: string
  toUserId: string
  sdp: RTCSessionDescriptionInit
}) {
  socket?.emit("webrtc:answer", payload)
}

export function emitWebRtcIce(payload: {
  callId: string
  toUserId: string
  candidate: RTCIceCandidateInit | null
}) {
  socket?.emit("webrtc:ice", payload)
}

export function emitCallMedia(payload: {
  callId: string
  muted?: boolean
  cameraOff?: boolean
}) {
  socket?.emit("call:media", payload)
}
