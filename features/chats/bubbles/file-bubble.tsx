import { FileArchive, FileSpreadsheet, FileText, File } from "lucide-react"

import { resolveMediaUrl } from "../../../lib/api"
import { fileExtension } from "../../../lib/files"
import type { ChatMessage } from "../../../lib/types/chat"
import { cn } from "../../../lib/utils"
import { MessageText } from "./message-text"

function FileIcon({ ext }: { ext: string }) {
  if (["XLS", "XLSX", "CSV", "ODS", "NUMBERS"].includes(ext)) {
    return <FileSpreadsheet className="size-5 stroke-[1.75]" aria-hidden />
  }
  if (["ZIP", "RAR", "7Z", "TAR", "GZ"].includes(ext)) {
    return <FileArchive className="size-5 stroke-[1.75]" aria-hidden />
  }
  if (["PDF", "DOC", "DOCX", "TXT", "RTF", "ODT", "MD", "PAGES"].includes(ext)) {
    return <FileText className="size-5 stroke-[1.75]" aria-hidden />
  }
  return <File className="size-5 stroke-[1.75]" aria-hidden />
}

export function FileBubble({
  message,
  outgoing,
}: {
  message: ChatMessage
  outgoing: boolean
}) {
  const src = resolveMediaUrl(message.mediaUrl)
  const ext = fileExtension(message.fileName)
  const label = [message.fileSize, ext].filter(Boolean).join(" · ")
  const inner = (
    <div className="flex min-w-[230px] max-w-[280px] items-center gap-3 px-0.5 py-[3px]">
      <span
        className={cn(
          "grid size-[42px] shrink-0 place-items-center rounded-[11px]",
          outgoing ? "bg-white/20 text-white" : "bg-signal-wash text-signal"
        )}
      >
        <FileIcon ext={ext} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {message.fileName || "File"}
        </span>
        <span
          className={cn(
            "font-mono text-[11.5px]",
            outgoing ? "text-white/70" : "text-ink-3"
          )}
        >
          {label || "Document"}
        </span>
      </span>
    </div>
  )

  return (
    <div
      className={cn(
        "rounded-[20px] border px-3.5 pt-[9px] pb-2 shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]",
        outgoing
          ? "rounded-br-[7px] border-signal bg-signal text-white"
          : "rounded-bl-[7px] border-edge bg-surface text-ink"
      )}
    >
      {src ? (
        <a
          href={src}
          download={message.fileName}
          target="_blank"
          rel="noreferrer"
          className="block rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
      {message.caption ? (
        <div className="mt-1.5 px-0.5 text-[14px] leading-[1.45]">
          <MessageText text={message.caption} outgoing={outgoing} />
        </div>
      ) : null}
    </div>
  )
}
