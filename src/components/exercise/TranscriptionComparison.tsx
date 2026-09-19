import type { ExerciseResult } from '../../lib/exercise';
import { SequenceDisplay } from '../SequenceDisplay';
import { useLang } from '../../lang';
import { SectionTitle } from './section';

function FlowArrow() {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden>
      <div className="flow-line h-6 w-px" />
      <span className="text-[11px] text-zinc-400 dark:text-zinc-600">↓</span>
    </div>
  );
}

export function TranscriptionComparison({ result, notify }: { result: ExerciseResult; notify: (m: string) => void }) {
  const { t } = useLang();
  const legend = t(result.strand === 'template' ? 'ex.tx.legend.template' : 'ex.tx.legend.coding');
  const transcribed = result.strand === 'template';
  return (
    <section>
      <SectionTitle>{t('ex.tx.title')}</SectionTitle>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="step-enter">
          <SequenceDisplay
            label={t('ex.dna.normal')}
            sequence={result.normal.dna}
            fivePrime={transcribed ? "3'" : "5'"}
            threePrime={transcribed ? "5'" : "3'"}
            onCopy={async (ok) => notify(ok ? t('notify.copied', { what: t('ex.dna.normal') }) : t('notify.copyFailed'))}
            compact
          />
          <FlowArrow />
          <SequenceDisplay
            label="mRNA"
            sublabel={t('ex.dna.normal')}
            sequence={result.normal.mrna}
            fivePrime="5'"
            threePrime="3'"
            compact
          />
        </div>
        <div className="step-enter" style={{ animationDelay: '90ms' }}>
          <SequenceDisplay
            label={t('ex.dna.mutant')}
            sequence={result.mutant.dna}
            fivePrime={transcribed ? "3'" : "5'"}
            threePrime={transcribed ? "5'" : "3'"}
            onCopy={async (ok) => notify(ok ? t('notify.copied', { what: t('ex.dna.mutant') }) : t('notify.copyFailed'))}
            compact
          />
          <FlowArrow />
          <SequenceDisplay
            label="mRNA"
            sublabel={t('ex.dna.mutant')}
            sequence={result.mutant.mrna}
            fivePrime="5'"
            threePrime="3'"
            compact
          />
        </div>
      </div>
      <p className="mt-2 font-mono text-xs text-zinc-500">{legend}</p>
    </section>
  );
}
