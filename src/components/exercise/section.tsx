import type { ReactNode } from 'react';

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
      {children}
    </h2>
  );
}

export function StatRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-zinc-200 py-2 last:border-0 dark:border-white/5">
      <span className="min-w-0 text-[13px] text-zinc-500">{label}</span>
      <span className={`shrink-0 text-right text-sm text-zinc-800 dark:text-zinc-200 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export const panelClass =
  'rounded-xl border border-zinc-300 bg-white p-5 dark:border-white/10 dark:bg-black/40';
