import type { AvatarTone } from "./chat"

export type BlockDto = {
  id: string
  name: string
  username: string
  initials: string
  tone: AvatarTone
  photoUrl: string | null
  blockedAt: string
}

export type BlocksList = {
  blocks: BlockDto[]
  total: number
}
