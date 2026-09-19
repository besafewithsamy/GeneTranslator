import { useEffect, useState } from 'react';
import {
  MAX_SEQUENCE_LENGTH,
  normalizeSequence,
  validateDNA,
  type ReadingFrame,
} from '../lib/biology';
import { analyzeExercise, type DnaStrand, type ExerciseResult } from '../lib/exercise';import { ExerciseInput } from '../components/exercise/ExerciseInput';
import { SequenceComparison } from '../components/exercise/SequenceComparison';
import { TranscriptionComparison } from '../components/exercise/TranscriptionComparison';
import { CodonComparison } from '../components/exercise/CodonComparison';
import { ProteinComparison } from '../components/exercise/ProteinComparison';
import { MutationAnalysis } from '../components/exercise/MutationAnalysis';
import { ExerciseSummary } from '../components/exercise/ExerciseSummary';
import { ExamAnswer } from '../components/exercise/ExamAnswer';
import type { Key } from '../i18n';
import { useLang } from '../lang';

export const EXERCISE_NORMAL = 'CTT CTA CAA GGA ACC TAT TGT ATT';
export const EXERCISE_MUTANT = 'CTT CTA CAA GGA ACC TAT TTG ATT';

function FlowNode({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-3 py-1.5 text-center font-mono text-[11px] tracking-wider ${
        accent
          ? 'border-violet-500/50 bg-violet-500/10 text-violet-900 dark:text-violet-200'
          : 'border-zinc-300 text-zinc-600 dark:border-white/10 dark:text-zinc-400'
      }`}
    >
      {label}
    </div>
  );
}

function PipelineDiagram({ t }: { t: (k: Key) => string }) {
  const tx = t('ex.flow.transcription');
  const tl = t('ex.flow.translation');
  const nDna = t('ex.dna.normal');
  const mDna = t('ex.dna.mutant');
  return (
    <div className="overflow-x-auto" aria-hidden>
      <div className="grid min-w-[520px] grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-1.5">
        <FlowNode label={nDna} />
        <span />
        <FlowNode label={mDna} />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <span />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <FlowNode label={tx} />
        <span />
        <FlowNode label={tx} />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <span />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <FlowNode label="mRNA" />
        <span />
        <FlowNode label="mRNA" />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <span />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <FlowNode label={tl} />
        <span />
        <FlowNode label={tl} />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <span />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <FlowNode label={t('ex.compare.normalProtein')} />
        <span />
        <FlowNode label={t('ex.compare.mutantProtein')} />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↘</div>
        <FlowNode label={t('ex.flow.comparison')} accent />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↙</div>
        <span />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <span />
        <FlowNode label={t('ex.flow.mutation')} accent />
        <span />
        <span />
        <div className="text-center text-zinc-400 dark:text-zinc-600">↓</div>
        <span />
        <FlowNode label={t('ex.flow.conclusion')} accent />
        <span />
      </div>
    </div>
  );
}

export function ExercisePage({ notify }: { notify: (msg: string) => void }) {
  const { t } = useLang();
  const [normal, setNormal] = useState('');
  const [mutant, setMutant] = useState('');
  const [strand, setStrand] = useState<DnaStrand>('template');
  const [frame, setFrame] = useState<ReadingFrame>(1);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('genetranslator:exercise') ?? 'null');
      if (p && typeof p.normal === 'string' && typeof p.mutant === 'string') {
        setNormal(p.normal);
        setMutant(p.mutant);
        if (p.strand === 'coding' || p.strand === 'template') setStrand(p.strand);
        if ([1, 2, 3].includes(p.frame)) setFrame(p.frame);
      }
    } catch { /* ignore */ }
  }, []);

  const errorText = (v: ReturnType<typeof validateDNA>, allele: string): string => {
    const msg = (() => {
      if (v.errorCode === 'empty') return t('error.empty');
      if (v.errorCode === 'too-long') return t('error.tooLong', { n: v.cleaned.length, max: MAX_SEQUENCE_LENGTH });
      if (v.errorCode === 'invalid-bases')
        return t('error.invalid', { bases: (v.invalidBases ?? []).join(', '), kind: t('kind.dna'), alphabet: 'A, T, G, C' });
      return t('error.generic');
    })();
    return `${allele}: ${msg}`;
  };

  const runAnalysis = () => {
    const vn = validateDNA(normal);
    if (!vn.valid) {
      setError(errorText(vn, t('ex.normal.label')));
      setResult(null);
      return;
    }
    const vm = validateDNA(mutant);
    if (!vm.valid) {
      setError(errorText(vm, t('ex.mutant.label')));
      setResult(null);
      return;
    }
    setError(null);
    setAnalyzing(true);
    window.setTimeout(() => {
      const r = analyzeExercise(vn.cleaned, vm.cleaned, strand, frame);
      setResult(r);
      setAnalyzing(false);
      localStorage.setItem('genetranslator:exercise', JSON.stringify({ normal, mutant, strand, frame }));
    }, 350);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t('ex.title')}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t('ex.subtitle')}</p>
      </div>

      <ExerciseInput
        normal={normal}
        mutant={mutant}
        onNormal={setNormal}
        onMutant={setMutant}
        strand={strand}
        onStrand={setStrand}
        frame={frame}
        onFrame={setFrame}
        onAnalyze={runAnalysis}
        onExample={() => { setNormal(EXERCISE_NORMAL); setMutant(EXERCISE_MUTANT); setError(null); }}
        onClear={() => { setNormal(''); setMutant(''); setResult(null); setError(null); }}
        analyzing={analyzing}
      />

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-800 dark:text-rose-200">
          {error}
        </p>
      )}

      {analyzing && (
        <div className="mt-10 flex flex-col items-center gap-3" aria-label={t('loading.label')}>
          <div className="flex gap-1.5 font-mono text-lg text-violet-600 dark:text-violet-300" aria-hidden>
            {['A', 'T', 'G', 'C'].map((b, i) => (
              <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 120}ms` }}>{b}</span>
            ))}
          </div>
          <p className="text-xs text-zinc-500">{t('loading.text')}</p>
        </div>
      )}

      {!analyzing && !result && !error && (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-white/10">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t('ex.empty.title')}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{t('ex.empty.body')}</p>
          <p className="mt-4 font-mono text-xs text-zinc-400 dark:text-zinc-600">
            {t('empty.try')} {normalizeSequence(EXERCISE_NORMAL).length} {t('editor.unit.nt')}
          </p>
        </div>
      )}

      {!analyzing && result && (
        <div key={`${result.normal.dna}-${result.mutant.dna}-${result.strand}-${result.frame}`} className="mt-10 space-y-10">
          <PipelineDiagram t={t} />
          <SequenceComparison result={result} notify={notify} />
          <TranscriptionComparison result={result} notify={notify} />
          <CodonComparison result={result} />
          <ProteinComparison result={result} />
          <MutationAnalysis result={result} />
          <ExamAnswer result={result} notify={notify} />
          <ExerciseSummary result={result} />
        </div>
      )}
    </div>
  );
}
