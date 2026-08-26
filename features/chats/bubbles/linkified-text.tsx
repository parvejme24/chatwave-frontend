import { splitTextAndUrls } from "../../../lib/links"
import { cn } from "../../../lib/utils"

export function LinkifiedText({
  text,
  outgoing,
}: {
  text: string
  outgoing: boolean
}) {
  const pieces = splitTextAndUrls(text)
  return (
    <>
      {pieces.map((piece, index) =>
        piece.href ? (
          <a
            key={`${piece.href}-${index}`}
            href={piece.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "break-all underline decoration-[1.5px] underline-offset-[3px]",
              outgoing
                ? "text-white decoration-white/70 hover:decoration-white"
                : "text-signal decoration-signal/50 hover:decoration-signal"
            )}
          >
            {piece.text}
          </a>
        ) : (
          <span key={index}>{piece.text}</span>
        )
      )}
    </>
  )
}
