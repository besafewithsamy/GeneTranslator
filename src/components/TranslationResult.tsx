import { useEffect, useState } from 'react';
import type { AnalysisResult } from '../lib/biology';
import { CodonCard } from './CodonCard';
import { SequenceDisplay } from './SequenceDisplay';
import { copyText } from './seq-utils';
import { aminoName } from '../i18n';
import { useLang } from '../lang';

interface Props {
  result: AnalysisResult;
  notify: (msg: string) => void;
}

function FlowArrow() {
  return (
    <div className="flex items-center gap-3 py-1" aria-hidden>
      <div className="flow-line flow-track h-6 w-px">
        <span className="flow-dot" />
      </div>
      <span className="text-[11px] text-zinc-400 dark:text-zinc-600">↓</span>
    </div>
  );
}

function useAssembly(total: number, resetKey: string): number {
  const [shown, setShown] = useState(total);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(total);
      return;
    }
    if (total > 60) {
      setShown(total);
      return;
    }
    setShown(0);
    if (total === 0) return;
    const id = window.setInterval(() => {
      setShown((s) => {
        if (s >= total) {
          window.clearInterval(id);
          return s;
        }
        return s + 1;
      });
    }, 110);
    return () => window.clearInterval(id);
  }, [total, resetKey]);
  return shown;
}

export function TranslationResult({ result, notify }: Props) {
  const { lang, t } = useLang();
  const [hovered, setHovered] = useState<number | null>(null);
  const active = result.codons.filter((c) => !c.skipped);
  const skipped = result.codons.filter((c) => c.skipped);
  const offset = result.frame - 1;
  const shownAcids = useAssembly(result.acids.length, `${result.rna}-${result.frame}-${result.requireStart}`);

  const copyFeedback = (ok: boolean, what: string) =>
    notify(ok ? t('notify.copied', { what }) : t('notify.copyFailed'));

  const isDna = result.kind === 'dna';

  return (
    <div className="mt-8 space-y-2">
      <div className="step-enter" style={{ animationDelay: '0ms' }}>
        <SequenceDisplay
          label={isDna ? t('step.dna') : t('step.rna')}
          sublabel={isDna ? t('step.dna.sub') : t('step.rna.sub')}
          sequence={isDna ? result.dna : result.rna}
          fivePrime="5'"
          threePrime="3'"
          highlightStart={hovered !== null ? offset + hovered * 3 : -1}
          highlightLength={hovered !== null ? 3 : 0}
          dimBefore={result.requireStart ? offset + result.leaderLength * 3 : offset}
          onCopy={(ok) => copyFeedback(ok, isDna ? t('step.dna') : t('step.rna'))}
        />
      </div>

      <FlowArrow />

      <div className="step-enter" style={{ animationDelay: '90ms' }}>
        <SequenceDisplay
          label={isDna ? t('step.transcript') : t('step.cdna')}
          sublabel={isDna ? t('step.transcript.sub') : t('step.cdna.sub')}
          sequence={isDna ? result.rna : result.dna}
          fivePrime={isDna ? "5'" : "3'"}
          threePrime={isDna ? "3'" : "5'"}
          highlightStart={hovered !== null ? offset + hovered * 3 : -1}
          highlightLength={hovered !== null ? 3 : 0}
          onCopy={(ok) => copyFeedback(ok, isDna ? t('step.transcript') : 'cDNA')}
        />
        <p className="mt-2 font-mono text-xs text-zinc-500">
          {isDna ? (
            <>T → U</>
          ) : (
            <>A → T&nbsp;&nbsp;·&nbsp;&nbsp;U → A&nbsp;&nbsp;·&nbsp;&nbsp;G → C&nbsp;&nbsp;·&nbsp;&nbsp;C → G</>
          )}
        </p>
      </div>

      <FlowArrow />

      <div className="step-enter" style={{ animationDelay: '180ms' }}>
        <div className="mb-1.5 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('step.codons')}</h3>
          <span className="text-xs text-zinc-400 dark:text-zinc-600">
            {t('frame.label')} +{result.frame}{result.requireStart ? ` · ${t('frame.fromStart')}` : ` · ${t('frame.raw')}`}
          </span>
        </div>
        {skipped.length > 0 && (
          <p className="mb-2 text-xs text-zinc-500">
            <span className="font-mono text-zinc-600 dark:text-zinc-400">{skipped.map((c) => c.codon).join(' ')}</span>
            {' '}{t('codons.skipped')}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {active.map((c) => (
            <CodonCard key={c.index} item={c} active={hovered === c.index} onHover={setHovered} />
          ))}
        </div>
        {result.trailingBases && (
          <p className="mt-2 font-mono text-xs text-zinc-400 dark:text-zinc-600">
            +{result.trailingBases} · {result.trailingBases.length} {t('codons.trailing')}
          </p>
        )}
        <div className="mt-3 space-y-1 border-l border-zinc-300 pl-4 font-mono text-[13px] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          {active.slice(0, 8).map((c) => (
            <p key={c.index}>
              <span className="text-zinc-800 dark:text-zinc-200">{c.codon}</span>
              <span className="text-zinc-400 dark:text-zinc-600"> → </span>
              <span className={c.type === 'stop' ? 'text-rose-600 dark:text-rose-300' : 'text-sky-700 dark:text-sky-300'}>
                {aminoName(lang, c.abbr) === c.abbr ? c.abbr : `${c.abbr} (${aminoName(lang, c.abbr)})`}
              </span>
            </p>
          ))}
          {active.length > 8 && <p className="text-zinc-400 dark:text-zinc-600">… {active.length - 8} {t('codons.more')}</p>}
        </div>
      </div>

      <FlowArrow />

      <div className="step-enter rounded-xl border border-zinc-300 bg-zinc-900/[0.03] p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]" style={{ animationDelay: '270ms' }}>
        <div className="mb-1.5 flex items-center gap-2">
          <h3 className="text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('step.protein')}</h3>
          <span className="text-xs text-zinc-400 dark:text-zinc-600">{t('step.protein.sub')}</span>
          <button
            onClick={async () => copyFeedback(await copyText(result.protein), t('step.protein'))}
            aria-label={t('copy.protein.aria')}
            className="ml-auto rounded-md border border-zinc-300 px-2 py-0.5 font-mono text-[11px] text-zinc-500 transition hover:bg-zinc-900/5 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
          >
            {t('copy.label')}
          </button>
        </div>
        {result.proteinLength === 0 ? (
          <p className="text-sm text-zinc-500">{t('protein.none')}</p>
        ) : (
          <>
            <p className={`font-mono text-lg tracking-wide text-zinc-900 dark:text-zinc-100 ${shownAcids < result.acids.length ? 'assembly-caret' : ''}`}>
              {result.acids.slice(0, shownAcids).join(' · ')}
            </p>
            <p className="mt-2 font-mono text-sm tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              {[...result.oneLetter].slice(0, shownAcids).join(' ')}
            </p>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {t('protein.length')}{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {result.proteinLength} {t('protein.unit')}
              </span>
            </p>
          </>
        )}
        {result.stopCodon && (
          <p className="mt-3 inline-block rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-800 dark:text-rose-200">
            {t('protein.stop', { codon: result.stopCodon })}
          </p>
        )}
        {!result.stopCodon && result.proteinLength > 0 && (
          <p className="mt-3 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs text-amber-800 dark:text-amber-200">
            {t('protein.open')}
          </p>
        )}
      </div>
    </div>
  );
}
