import type { AnalysisResult } from '../lib/biology';
import { useLang } from '../lang';

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-zinc-200 py-2 last:border-0 dark:border-white/5">
      <span className="text-[13px] text-zinc-500">{label}</span>
      <span className={`text-sm text-zinc-800 dark:text-zinc-200 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export function StatisticsPanel({ result }: { result: AnalysisResult }) {
  const { t } = useLang();
  return (
    <aside aria-label={t('stats.title')} className="rounded-xl border border-zinc-300 bg-zinc-900/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('stats.title')}</h3>
      <Row label={t('stats.length')} value={`${result.rna.length} ${t('editor.unit.nt')}`} mono />
      <Row label={t('stats.gc')} value={`${result.gcContent}%`} mono />
      <Row label={t('stats.au')} value={`${result.auContent}%`} mono />
      <Row label={t('stats.codons')} value={String(result.codonCount)} mono />
      <Row label={t('stats.protein')} value={`${result.proteinLength} ${t('stats.unit.aa')}`} mono />
      <Row label={t('stats.start')} value={result.startCodon ?? t('stats.none')} mono />
      <Row label={t('stats.stop')} value={result.stopCodon ?? t('stats.none')} mono />
      <Row label={t('stats.mw')} value={result.molecularWeight > 0 ? `${result.molecularWeight} Da` : t('stats.none')} mono />
    </aside>
  );
}
