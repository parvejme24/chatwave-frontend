export function AuthFormPanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex items-center justify-center bg-surface px-6 py-10 sm:px-8">
      <div className="w-full max-w-[380px]">{children}</div>
    </section>
  )
}
