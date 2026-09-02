import { conversationsApi, type ConversationListArgs } from "./conversations-api"
import type { RootState } from "./store"
import type { ConversationsList, PreviewIcon } from "../types/chat"
import { formatConversationTime } from "../types/chat"

export type ConversationSidebarPatch = {
  conversationId: string
  preview?: string
  lastMessageAt?: string
  /** Absolute unread from the server (conversation:preview). */
  unread?: number
  /** Increment unread by 1 when absolute value is unknown (notifications). */
  bumpUnread?: boolean
  clearUnread?: boolean
  previewIcon?: PreviewIcon | null
  moveToTop?: boolean
}

type Dispatch = (action: unknown) => unknown

/**
 * Patch every cached getConversations result so the sidebar updates without a
 * full page reload. Returns true when at least one row was updated.
 */
export function patchConversationSidebar(
  dispatch: Dispatch,
  getState: () => RootState,
  patch: ConversationSidebarPatch
): boolean {
  const conversationId = patch.conversationId?.trim()
  if (!conversationId) return false

  const argSets: Array<ConversationListArgs | void> = []
  const seen = new Set<string>()
  const queries = getState()[conversationsApi.reducerPath]?.queries
  if (queries) {
    for (const entry of Object.values(queries)) {
      if (!entry || entry.endpointName !== "getConversations") continue
      const key = JSON.stringify(entry.originalArgs ?? null)
      if (seen.has(key)) continue
      seen.add(key)
      argSets.push(entry.originalArgs as ConversationListArgs | void)
    }
  }
  const defaultKey = JSON.stringify({ filter: "all" })
  if (!seen.has(defaultKey)) argSets.push({ filter: "all" })

  let found = false

  for (const args of argSets) {
    dispatch(
      conversationsApi.util.updateQueryData(
        "getConversations",
        (args ?? { filter: "all" }) as ConversationListArgs,
        (draft: ConversationsList) => {
          if (!draft?.conversations?.length) return
          const index = draft.conversations.findIndex(
            (item) => item.id === conversationId
          )
          if (index < 0) return
          found = true
          const row = draft.conversations[index]!
          if (typeof patch.preview === "string" && patch.preview) {
            row.preview = patch.preview
          }
          if (patch.lastMessageAt) {
            row.time = formatConversationTime(patch.lastMessageAt)
          }
          if (typeof patch.unread === "number") {
            row.unread = patch.unread
          } else if (patch.clearUnread) {
            row.unread = 0
          } else if (patch.bumpUnread) {
            row.unread = (row.unread ?? 0) + 1
          }
          if (patch.previewIcon !== undefined) {
            row.previewIcon = patch.previewIcon || undefined
          }
          if (patch.moveToTop !== false && index > 0) {
            draft.conversations.splice(index, 1)
            draft.conversations.unshift(row)
          }
        }
      )
    )
  }

  return found
}

/** Force a network refresh of the main chat list (and mark other filters stale). */
export function refetchConversationSidebar(dispatch: Dispatch) {
  dispatch(
    conversationsApi.util.invalidateTags([{ type: "Conversation", id: "LIST" }])
  )
  void dispatch(
    conversationsApi.endpoints.getConversations.initiate(
      { filter: "all" },
      { forceRefetch: true, subscribe: false }
    ) as never
  )
}
