import { splitCodons } from '../../lib/biology';
import type { ExerciseResult } from '../../lib/exercise';
import { SequenceDisplay } from '../SequenceDisplay';
import { useLang } from '../../lang';
import { panelClass } from './section';

export function SequenceComparison({ result, notify }: { result: ExerciseResult; notify: (m: string) => void }) {
  const { t } = useLang();
  const first = result.stats.firstDiffPosition;
  const hlStart = first !== null ? first - 1 : -1;
  const hlNormal = result.indel && result.indel.kind === 'deletion' ? result.indel.length : 1;
  const hlMutant = result.indel && result.indel.kind === 'insertion' ? result.indel.length : 1;
  const codonIdx = result.primary?.codonIndex ?? null;
  const nDnaCodons = splitCodons(result.normal.dna, result.frame);
  const mDnaCodons = splitCodons(result.mutant.dna, result.frame);
  const showCodonCallout = codonIdx !== null && nDnaCodons[codonIdx] && mDnaCodons[codonIdx];

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="step-enter">
          <SequenceDisplay
            label={t('ex.dna.normal')}
            sequence={result.normal.dna}
            fivePrime="5'"
            threePrime="3'"
            highlightStart={hlStart}
            highlightLength={hlNormal}
            onCopy={async (ok) => notify(ok ? t('notify.copied', { what: t('ex.dna.normal') }) : t('notify.copyFailed'))}
          />
        </div>
        <div className="step-enter" style={{ animationDelay: '90ms' }}>
          <SequenceDisplay
            label={t('ex.dna.mutant')}
            sequence={result.mutant.dna}
            fivePrime="5'"
            threePrime="3'"
            highlightStart={hlStart}
            highlightLength={hlMutant}
            onCopy={async (ok) => notify(ok ? t('notify.copied', { what: t('ex.dna.mutant') }) : t('notify.copyFailed'))}
          />
        </div>
      </div>
      <div className={`${panelClass} mt-4`}>
        {result.diff.positions.length === 0 && !result.indel ? (
          <p className="text-sm text-zinc-500">{t('ex.diff.none')}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-sm">
            <span className="text-zinc-500">
              {t('ex.diff.position')}: <span className="font-semibold text-violet-700 dark:text-violet-300">{result.diff.positions.join(', ') || result.indel?.at}</span>
            </span>
            {showCodonCallout && (
              <>
                <span className="text-zinc-500">
                  {t('ex.diff.normal')}: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{nDnaCodons[codonIdx!]}</span>
                </span>
                <span className="text-zinc-500">
                  {t('ex.diff.mutant')}: <span className="font-semibold text-rose-700 dark:text-rose-300">{mDnaCodons[codonIdx!]}</span>
                </span>
              </>
            )}
            {result.indel && (
              <span className="text-zinc-500">
                {t('ex.mut.indel', { kind: t(`ex.mut.kind.${result.indel.kind}`), n: result.indel.length, at: result.indel.at })}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
