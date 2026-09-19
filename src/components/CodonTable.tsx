import { useMemo, useState } from 'react';
import { ALL_CODONS } from '../lib/genetic-code';
import { aminoName } from '../i18n';
import { useLang } from '../lang';

export function CodonTable({ onUseCodon }: { onUseCodon?: (codon: string) => void }) {
  const { lang, t } = useLang();
  const [query, setQuery] = useState('');

  const entries = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return ALL_CODONS;
    return ALL_CODONS.filter(
      (c) =>
        c.codon.includes(q) ||
        c.name.toUpperCase().includes(q) ||
        aminoName(lang, c.abbr).toUpperCase().includes(q) ||
        c.abbr.toUpperCase().includes(q) ||
        c.letter.toUpperCase() === q,
    );
  }, [query, lang]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('codontable.search')}
          aria-label={t('codontable.search.aria')}
          className="w-full max-w-md rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:w-96"
        />
        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600">{entries.length} / 64</span>
        <span className="ml-auto flex gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" /> {t('codontable.start')}</span>
          <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300"><span className="h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400" /> {t('codontable.stop')}</span>
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-lg border border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-white/10">
          {t('codontable.empty', { q: query })}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="list">
          {entries.map((c) => (
            <button
              key={c.codon}
              role="listitem"
              onClick={() => onUseCodon?.(c.codon)}
              title={onUseCodon ? t('codontable.use', { codon: c.codon }) : undefined}
              className={`rounded-lg border p-3 text-left transition hover:-translate-y-0.5 ${
                c.type === 'start'
                  ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 dark:border-emerald-400/40 dark:hover:border-emerald-300'
                  : c.type === 'stop'
                    ? 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500 dark:border-rose-400/40 dark:hover:border-rose-300'
                    : 'border-zinc-300 bg-zinc-900/[0.02] hover:border-violet-500/40 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-violet-400/40'
              }`}
            >
              <span className="block font-mono text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{c.codon}</span>
              <span className="block truncate text-[13px] text-zinc-700 dark:text-zinc-300">{aminoName(lang, c.abbr)}</span>
              <span className="mt-0.5 block font-mono text-xs text-zinc-500">
                {c.abbr} · {c.letter}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
