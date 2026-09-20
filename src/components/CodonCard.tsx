import { useState } from 'react';
import { anticodonFor } from '../lib/genetic-code';
import type { TranslatedCodon } from '../lib/biology';
import { aminoName } from '../i18n';
import { useLang } from '../lang';

interface Props {
  item: TranslatedCodon;
  active: boolean;
  onHover: (index: number | null) => void;
}

const RING: Record<string, string> = {
  start: 'border-emerald-500/60 hover:border-emerald-500 dark:border-emerald-400/50 dark:hover:border-emerald-300',
  stop: 'border-rose-500/60 hover:border-rose-500 dark:border-rose-400/50 dark:hover:border-rose-300',
  normal: 'border-zinc-300 hover:border-violet-500/60 dark:border-white/10 dark:hover:border-violet-400/50',
};

export function CodonCard({ item, active, onHover }: Props) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const typeLabel = t(`codon.type.${item.type}`);
  const name = aminoName(lang, item.abbr);
  return (
    <div className="group relative">
      <button
        onMouseEnter={() => onHover(item.index)}
        onMouseLeave={() => { onHover(null); setOpen(false); }}
        onFocus={() => onHover(item.index)}
        onBlur={() => { onHover(null); setOpen(false); }}
        onClick={() => { onHover(item.index); setOpen((o) => !o); }}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        aria-expanded={open}
        aria-label={`Codon ${item.codon}, ${name}, ${typeLabel}`}
        style={{ animationDelay: `${Math.min(item.index, 20) * 45}ms` }}
        className={`codon-pop w-[72px] rounded-lg border bg-zinc-900/[0.04] px-2 py-2 text-center transition-all hover:-translate-y-0.5 hover:bg-zinc-900/[0.07] sm:w-[76px] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] ${
          RING[item.type]
        } ${active ? 'border-violet-500 bg-violet-500/15 dark:border-violet-400 dark:bg-violet-500/15' : ''} ${item.skipped ? 'opacity-35' : ''}`}
      >
        <span className="block font-mono text-[15px] font-semibold tracking-wider text-zinc-900 dark:text-zinc-100">{item.codon}</span>
        <span className={`mt-0.5 block text-xs ${item.type === 'stop' ? 'text-rose-600 dark:text-rose-300' : item.type === 'start' ? 'text-emerald-700 dark:text-emerald-300' : 'text-sky-700 dark:text-sky-300'}`}>
          {item.abbr}
        </span>
      </button>
      <div className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 rounded-lg border border-zinc-300 bg-white p-3 text-left shadow-xl group-hover:block group-focus-within:block dark:border-white/10 dark:bg-[#12141c] ${open ? 'block' : 'hidden'}`}>
        <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.codon}</p>
        <p className="mt-0.5 text-[13px] text-zinc-700 dark:text-zinc-300">{name}</p>
        <p className="font-mono text-xs text-zinc-500">
          {item.abbr} · {item.letter} · anti-codon {anticodonFor(item.codon)}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{t('codon.tooltip.type', { type: typeLabel })}</p>
      </div>
    </div>
  );
}
