export function AppPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="h-dvh overflow-y-auto bg-paper max-[859px]:pb-[74px]">
      <div className="mx-auto max-w-[780px] px-[26px] pt-[34px] pb-[70px] max-[859px]:px-[18px] max-[859px]:pt-[26px]">
        <h1 className="font-display text-[32px] font-extrabold tracking-[-0.035em] text-ink max-[859px]:text-[27px]">
          {title}
        </h1>
        <p className="mt-[5px] text-[14.5px] text-ink-3">{description}</p>
      </div>
    </section>
  )
}
