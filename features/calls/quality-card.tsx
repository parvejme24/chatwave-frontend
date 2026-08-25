import type { CallQuality } from "../../lib/types/call"

export function QualityCard({ quality }: { quality?: CallQuality }) {
  const p2p = quality?.p2p ?? 0
  const turn = quality?.turn ?? 0
  const unknown = quality?.unknown ?? 0
  const total = p2p + turn + unknown
  const sample = total > 0 ? total : 10

  return (
    <section className="mb-[18px] overflow-hidden rounded-[20px] border border-edge bg-surface shadow-[0_1px_2px_rgba(17,24,33,0.06),0_2px_8px_rgba(17,24,33,0.04)]">
      <div className="border-b border-edge px-5 py-4">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Connection quality
        </h3>
        <p className="mt-px text-[13px] text-ink-3">
          How your last {sample} calls connected
        </p>
      </div>
      <div className="px-5 pt-1.5 pb-5">
        <div className="flex items-center gap-4 py-[15px]">
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ink">
              Direct peer-to-peer
            </span>
            <span className="mt-0.5 block text-[13px] text-ink-3">
              Media never touched a relay server
            </span>
          </span>
          <span className="rounded-full bg-ok-wash px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ok">
            {p2p} of {sample}
          </span>
        </div>
        <div className="flex items-center gap-4 border-t border-edge py-[15px]">
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold text-ink">
              Relayed through TURN
            </span>
            <span className="mt-0.5 block text-[13px] text-ink-3">
              Used when a firewall blocked the direct route
            </span>
          </span>
          <span className="rounded-full bg-signal-wash px-[9px] py-[3px] font-mono text-[11px] font-semibold text-signal">
            {turn} of {sample}
          </span>
        </div>
        {unknown > 0 ? (
          <div className="flex items-center gap-4 border-t border-edge py-[15px]">
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-ink">
                Unknown path
              </span>
              <span className="mt-0.5 block text-[13px] text-ink-3">
                The client did not report ICE on hangup
              </span>
            </span>
            <span className="rounded-full bg-surface-2 px-[9px] py-[3px] font-mono text-[11px] font-semibold text-ink-3">
              {unknown} of {sample}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
