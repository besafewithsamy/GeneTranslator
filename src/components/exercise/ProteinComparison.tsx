import type { ExerciseResult } from '../../lib/exercise';
import { aminoName } from '../../i18n';
import { useLang } from '../../lang';
import { SectionTitle } from './section';

function AcidLine({ acids, changed }: { acids: string[]; changed: Set<number> }) {
  return (
    <p className="font-mono text-[15px] leading-8 tracking-wide text-zinc-900 dark:text-zinc-100">
      {acids.map((a, i) => (
        <span key={i}>
          {i > 0 && <span className="text-zinc-400 dark:text-zinc-600"> · </span>}
          <span
            className={
              changed.has(i)
                ? 'rounded bg-rose-500/20 px-1 font-semibold text-rose-800 dark:text-rose-200'
                : undefined
            }
          >
            {a}
          </span>
        </span>
      ))}
      {acids.length === 0 && <span className="text-zinc-500">·</span>}
    </p>
  );
}

function OneLetterLine({ oneLetter, changed }: { oneLetter: string; changed: Set<number> }) {
  return (
    <p className="mt-1 font-mono text-sm tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
      {[...oneLetter].map((ch, i) => (
        <span
          key={i}
          className={changed.has(i) ? 'font-semibold text-rose-700 dark:text-rose-300' : undefined}
        >
          {ch}{' '}
        </span>
      ))}
    </p>
  );
}

export function ProteinComparison({ result }: { result: ExerciseResult }) {
  const { lang, t } = useLang();
  const changedN = new Set(
    result.changedProteinPositions.filter((i) => i < result.normal.oneLetter.length),
  );
  const changedM = new Set(
    result.changedProteinPositions.filter((i) => i < result.mutant.oneLetter.length),
  );
  const stopLine = (stopIdx: number | null) =>
    stopIdx !== null ? t('ex.prot.stopAt', { n: stopIdx + 1 }) : t('ex.prot.noStop');

  return (
    <section>
      <SectionTitle>{t('ex.prot.title')}</SectionTitle>
      <div className="mt-3 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('ex.prot.normalAcids')}
          </h3>
          <AcidLine acids={result.normal.acids} changed={changedN} />
          <OneLetterLine oneLetter={result.normal.oneLetter} changed={changedN} />
          <p className="mt-2 text-sm text-zinc-500">
            {t('ex.prot.length')}{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{result.normal.proteinLength} aa</span>
            {' · '}
            {stopLine(result.normal.stopCodonIndex)}
          </p>
        </div>
        <div>
          <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('ex.prot.mutantAcids')}
          </h3>
          <AcidLine acids={result.mutant.acids} changed={changedM} />
          <OneLetterLine oneLetter={result.mutant.oneLetter} changed={changedM} />
          <p className="mt-2 text-sm text-zinc-500">
            {t('ex.prot.length')}{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{result.mutant.proteinLength} aa</span>
            {' · '}
            {stopLine(result.mutant.stopCodonIndex)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {t('ex.compare.title')}
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          {t('ex.compare.normalProtein')}
        </p>
        <AcidLine acids={result.normal.acids} changed={changedN} />
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          {t('ex.compare.mutantProtein')}
        </p>
        <AcidLine acids={result.mutant.acids} changed={changedM} />
        {result.primary ? (
          <p className="mt-3 font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {t('ex.compare.change')}{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {aminoName(lang, result.primary.normalAA)} → {aminoName(lang, result.primary.mutantAA)}
            </span>{' '}
            <span className="text-zinc-500">
              ({result.primary.normalAA} → {result.primary.mutantAA})
            </span>
          </p>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">{t('ex.compare.same')}</p>
        )}
      </div>
    </section>
  );
}
