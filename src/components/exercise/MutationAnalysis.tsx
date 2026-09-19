import { splitCodons } from '../../lib/biology';
import { mutationMechanism, type ExerciseResult } from '../../lib/exercise';
import { aminoName } from '../../i18n';
import { useLang } from '../../lang';
import { SectionTitle, StatRow, panelClass } from './section';

export function MutationAnalysis({ result }: { result: ExerciseResult }) {
  const { lang, t } = useLang();
  const p = result.primary;
  const sameLength = result.normal.dna.length === result.mutant.dna.length;
  const nDnaCodons = splitCodons(result.normal.dna, result.frame);
  const mDnaCodons = splitCodons(result.mutant.dna, result.frame);
  const dnaPair =
    p && sameLength && nDnaCodons[p.codonIndex] && mDnaCodons[p.codonIndex]
      ? `${nDnaCodons[p.codonIndex]} → ${mDnaCodons[p.codonIndex]}`
      : null;
  const mech = mutationMechanism(result);

  return (
    <section>
      <SectionTitle>{t('ex.mut.title')}</SectionTitle>
      <div className={`${panelClass} mt-3`}>
        {!result.classification ? (
          <p className="text-sm text-zinc-500">{t('ex.mut.none')}</p>
        ) : (
          <>
            <p className="inline-block rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-900 dark:text-violet-200">
              {t('ex.mut.detected')} · {t(`ex.mut.kind.${result.classification}`)}
            </p>
            <div className="mt-2">
              <StatRow label={t('ex.mut.type')} value={t(`ex.mut.kind.${result.classification}`)} />
              {mech && <StatRow label={t('ex.mut.mechanism')} value={t(`ex.mech.${mech}`)} />}
              <StatRow
                label={t('ex.mut.dnaPos')}
                value={String(result.stats.firstDiffPosition ?? t('ex.stats.none'))}
                mono
              />
              {dnaPair && <StatRow label={t('ex.mut.dna')} value={dnaPair} mono />}
              {p && <StatRow label={t('ex.mut.mrna')} value={`${p.normalCodon} → ${p.mutantCodon}`} mono />}
              {p && (
                <StatRow
                  label={t('ex.mut.aa')}
                  value={`${aminoName(lang, p.normalAA)} → ${aminoName(lang, p.mutantAA)} (${p.normalAA} → ${p.mutantAA})`}
                />
              )}
              {result.indel && (
                <StatRow
                  label={t('ex.mut.classification')}
                  value={t('ex.mut.indel', {
                    kind: t(`ex.mut.kind.${result.indel.kind}`),
                    n: result.indel.length,
                    at: result.indel.at,
                  })}
                  mono
                />
              )}
            </div>
          </>
        )}
      </div>

      {result.prematureStop && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-5">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">{t('ex.stop.title')}</p>
          <div className="mt-2">
            <StatRow
              label={t('ex.stop.normalLen')}
              value={`${result.prematureStop.normalLength} aa`}
              mono
            />
            <StatRow
              label={t('ex.stop.mutantLen')}
              value={`${result.prematureStop.mutantLength} aa`}
              mono
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">{t('ex.stop.note')}</p>
        </div>
      )}
    </section>
  );
}
