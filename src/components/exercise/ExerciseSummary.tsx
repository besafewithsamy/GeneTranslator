import { splitCodons } from '../../lib/biology';
import { mutationMechanism, type ExerciseResult, type MutationClass } from '../../lib/exercise';
import { aminoName, type Key } from '../../i18n';
import { useLang } from '../../lang';
import { SectionTitle, StatRow, panelClass } from './section';

function effectKey(c: MutationClass | null): Key {
  if (c === 'missense') return 'ex.effect.substitution';
  if (c === 'silent') return 'ex.effect.synonymous';
  if (c === 'nonsense') return 'ex.effect.shorter';
  if (c === 'frameshift') return 'ex.effect.shift';
  if (c === 'insertion' || c === 'deletion') return 'ex.effect.indel';
  return 'ex.effect.same';
}

export function ExerciseSummary({ result }: { result: ExerciseResult }) {
  const { lang, t } = useLang();
  const p = result.primary;
  const sameLength = result.normal.dna.length === result.mutant.dna.length;
  const nDnaCodons = splitCodons(result.normal.dna, result.frame);
  const mDnaCodons = splitCodons(result.mutant.dna, result.frame);
  const dnaPair =
    p && sameLength && nDnaCodons[p.codonIndex] && mDnaCodons[p.codonIndex]
      ? `${nDnaCodons[p.codonIndex]} → ${mDnaCodons[p.codonIndex]}`
      : '·';
  const mech = mutationMechanism(result);
  const classLabel = result.classification
    ? t(`ex.mut.kind.${result.classification}`)
    : t('ex.mut.kind.identical');

  return (
    <section>
      <SectionTitle>{t('ex.summary.title')}</SectionTitle>
      <div className={`${panelClass} mt-3`}>
        <StatRow label={t('ex.summary.mutation')} value={classLabel} />
        {mech && <StatRow label={t('ex.mut.mechanism')} value={t(`ex.mech.${mech}`)} />}
        <StatRow
          label={t('ex.summary.dnaPos')}
          value={result.stats.firstDiffPosition !== null ? String(result.stats.firstDiffPosition) : t('ex.stats.none')}
          mono
        />
        <StatRow label={t('ex.summary.codon')} value={dnaPair} mono />
        <StatRow
          label={t('ex.summary.mrna')}
          value={p ? `${p.normalCodon} → ${p.mutantCodon}` : '·'}
          mono
        />
        <StatRow
          label={t('ex.summary.aa')}
          value={
            p
              ? `${aminoName(lang, p.normalAA)} → ${aminoName(lang, p.mutantAA)}`
              : t('ex.compare.same')
          }
          mono
        />
        <StatRow
          label={t('ex.summary.proteinLen')}
          value={`${result.normal.proteinLength} aa → ${result.mutant.proteinLength} aa`}
          mono
        />
        <StatRow label={t('ex.summary.effect')} value={t(effectKey(result.classification))} />
      </div>

      <div className={`${panelClass} mt-4`}>
        <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {t('ex.stats.title')}
        </h3>
        <StatRow label={t('ex.stats.normalLen')} value={`${result.stats.normalLength} nt`} mono />
        <StatRow label={t('ex.stats.mutantLen')} value={`${result.stats.mutantLength} nt`} mono />
        <StatRow label={t('ex.stats.diffs')} value={String(result.stats.diffCount)} mono />
        <StatRow label={t('ex.stats.percent')} value={`${result.stats.mutationPercent}%`} mono />
        <StatRow label={t('ex.stats.normalProt')} value={`${result.stats.normalProteinLength} aa`} mono />
        <StatRow label={t('ex.stats.mutantProt')} value={`${result.stats.mutantProteinLength} aa`} mono />
        <StatRow label={t('ex.stats.changedAA')} value={String(result.stats.changedAminoAcids)} mono />
        <StatRow
          label={t('ex.stats.firstPos')}
          value={result.stats.firstDiffPosition !== null ? String(result.stats.firstDiffPosition) : t('ex.stats.none')}
          mono
        />
      </div>
    </section>
  );
}
