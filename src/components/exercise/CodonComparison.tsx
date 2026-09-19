import { useState } from 'react';
import { translateCodon } from '../../lib/biology';
import type { ExerciseResult } from '../../lib/exercise';
import { CodonCard } from '../CodonCard';
import { useLang } from '../../lang';
import { SectionTitle } from './section';

export function CodonComparison({ result }: { result: ExerciseResult }) {
  const { t } = useLang();
  const [hovered, setHovered] = useState<number | null>(null);
  const changed = new Set(result.codonMutations.map((m) => m.codonIndex));
  const minLen = Math.min(result.normal.codons.length, result.mutant.codons.length);

  const renderRow = (codons: string[], side: 'n' | 'm') => (
    <div className="flex flex-wrap gap-2">
      {codons.map((codon, i) => {
        const info = translateCodon(codon);
        const isChanged = changed.has(i);
        const isExtra = i >= minLen;
        return (
          <span
            key={`${side}-${i}`}
            className={
              isChanged
                ? 'rounded-lg outline outline-2 outline-rose-500/70 outline-offset-2 dark:outline-rose-400/70'
                : isExtra
                  ? 'rounded-lg outline outline-2 outline-dashed outline-amber-500/70 outline-offset-2 dark:outline-amber-400/70'
                  : undefined
            }
          >
            <CodonCard
              item={{ ...info, index: i, skipped: false, terminated: info.type === 'stop' }}
              active={hovered === i}
              onHover={setHovered}
            />
          </span>
        );
      })}
      {codons.length === 0 && <span className="text-sm text-zinc-500">·</span>}
    </div>
  );

  return (
    <section>
      <SectionTitle>{t('ex.codons.title')}</SectionTitle>
      <div className="mt-3 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('ex.codons.normal')}
          </h3>
          {renderRow(result.normal.codons, 'n')}
        </div>
        <div>
          <h3 className="mb-1.5 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('ex.codons.mutant')}
          </h3>
          {renderRow(result.mutant.codons, 'm')}
        </div>
      </div>
    </section>
  );
}
