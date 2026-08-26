import { extractHttpUrls } from "../../../lib/links"
import { cn } from "../../../lib/utils"
import { LinkifiedText } from "./linkified-text"
import { LinkPreview } from "./link-preview"

export function MessageText({
  text,
  outgoing,
}: {
  text: string
  outgoing: boolean
}) {
  const urls = extractHttpUrls(text)
  return (
    <>
      <LinkifiedText text={text} outgoing={outgoing} />
      {urls.length > 0 ? (
        <div className={cn(text.trim() ? "mt-2" : null)}>
          <LinkPreview urls={urls} outgoing={outgoing} />
        </div>
      ) : null}
    </>
  )
}
