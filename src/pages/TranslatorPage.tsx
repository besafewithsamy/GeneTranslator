import { useEffect, useState } from 'react';
import { analyzeSequence, normalizeSequence, MAX_SEQUENCE_LENGTH, validateDNA, validateRNA, type AnalysisResult, type ReadingFrame, type SequenceKind } from '../lib/biology';
import { SequenceEditor } from '../components/SequenceEditor';
import { TranslationResult } from '../components/TranslationResult';
import { StatisticsPanel } from '../components/StatisticsPanel';
import { ExportControls } from '../components/ExportControls';
import { useLang } from '../lang';

export const EXAMPLE_WITH_STOP: Record<SequenceKind, string> = {
  rna: 'AUGGCCAUUGUAUAA',
  dna: 'ATGGCCATTGTATAA',
};
export const EXAMPLE_NO_STOP: Record<SequenceKind, string> = {
  rna: 'AUGGCCAUUGUAA',
  dna: 'ATGGCCATTGTA',
};

function encodeState(seq: string, frame: ReadingFrame, requireStart: boolean, kind: SequenceKind): string {
  return btoa(JSON.stringify({ s: seq, f: frame, o: requireStart, k: kind }));
}

function decodeState(hash: string): { s: string; f: ReadingFrame; o: boolean; k: SequenceKind } | null {
  try {
    const p = JSON.parse(atob(hash.replace(/^#/, '')));
    if (typeof p.s !== 'string' || ![1, 2, 3].includes(p.f)) return null;
    return { s: p.s, f: p.f, o: p.o !== false, k: p.k === 'dna' ? 'dna' : 'rna' };
  } catch { /* ignore */ }
  return null;
}

interface Props {
  notify: (msg: string) => void;
  externalSequence: string | null;
  externalKind: SequenceKind | null;
  onConsumedExternal: () => void;
}

export function TranslatorPage({ notify, externalSequence, externalKind, onConsumedExternal }: Props) {
  const { lang, t } = useLang();
  const [kind, setKind] = useState<SequenceKind>('rna');
  const [input, setInput] = useState('');
  const [frame, setFrame] = useState<ReadingFrame>(1);
  const [requireStart, setRequireStart] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('genetranslator:last');
    const fromHash = decodeState(window.location.hash);
    if (fromHash) {
      setInput(fromHash.s);
      setFrame(fromHash.f);
      setRequireStart(fromHash.o);
      setKind(fromHash.k);
    } else if (saved) {
      try {
        const p = JSON.parse(saved);
        if (typeof p.input === 'string') {
          setInput(p.input);
          if ([1, 2, 3].includes(p.frame)) setFrame(p.frame);
          if (typeof p.requireStart === 'boolean') setRequireStart(p.requireStart);
          if (p.kind === 'dna' || p.kind === 'rna') setKind(p.kind);
        }
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (externalSequence !== null) {
      setInput(externalSequence);
      if (externalKind !== null) setKind(externalKind);
      onConsumedExternal();
      notify(t('notify.codonLoaded'));
    }
  }, [externalSequence, externalKind, onConsumedExternal, notify, t]);

  const alphabet = kind === 'dna' ? 'A, T, G, C' : 'A, U, G, C';

  const errorText = (v: ReturnType<typeof validateRNA>): string => {
    if (v.errorCode === 'empty') return t('error.empty');
    if (v.errorCode === 'too-long') return t('error.tooLong', { n: v.cleaned.length, max: MAX_SEQUENCE_LENGTH });
    if (v.errorCode === 'invalid-bases')
      return t('error.invalid', { bases: (v.invalidBases ?? []).join(', '), kind: t(kind === 'dna' ? 'kind.dna' : 'kind.rna'), alphabet });
    return t('error.generic');
  };

  const runAnalysis = (seq = input, f = frame, o = requireStart, k = kind) => {
    const v = k === 'dna' ? validateDNA(seq) : validateRNA(seq);
    if (!v.valid) {
      setError(errorText(v));
      setResult(null);
      return;
    }
    setError(null);
    setAnalyzing(true);
    window.setTimeout(() => {
      const r = analyzeSequence(v.cleaned, { frame: f, requireStart: o, kind: k });
      setResult(r);
      setAnalyzing(false);
      localStorage.setItem('genetranslator:last', JSON.stringify({ input: seq, frame: f, requireStart: o, kind: k }));
      window.location.hash = encodeState(v.cleaned, f, o, k);
      if (r.trailingBases) notify(t('notify.trailing', { n: r.trailingBases.length }));
    }, 350);
  };

  const switchKind = (k: SequenceKind) => {
    setKind(k);
    setInput('');
    setResult(null);
    setError(null);
  };

  const switchFrame = (f: ReadingFrame) => {
    setFrame(f);
    if (result) runAnalysis(input, f, requireStart);
  };

  const switchMode = (o: boolean) => {
    setRequireStart(o);
    if (result) runAnalysis(input, frame, o);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t('nav.translator')}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t('translator.subtitle')}</p>
      </div>

      <SequenceEditor
        kind={kind}
        value={input}
        onChange={setInput}
        onAnalyze={() => runAnalysis()}
        onClear={() => { setInput(''); setResult(null); setError(null); }}
        onExample={() => { setInput(EXAMPLE_WITH_STOP[kind]); setError(null); }}
        onReset={() => { setInput(''); setResult(null); setError(null); setFrame(1); setRequireStart(true); }}
        analyzing={analyzing}
      />

      <div className="mt-4 rounded-xl border border-zinc-300 bg-zinc-900/[0.04] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2" role="group" aria-label={t('input.kind.label')}>
            <span className="text-xs text-zinc-500">{t('input.kind.label')}</span>
            {(['rna', 'dna'] as SequenceKind[]).map((k) => (
              <button
                key={k}
                onClick={() => switchKind(k)}
                aria-pressed={kind === k}
                className={`min-h-[36px] rounded-md px-3 py-1 font-mono text-xs uppercase transition ${
                  kind === k
                    ? 'bg-violet-500/25 text-violet-900 dark:text-violet-200'
                    : 'border border-zinc-300 text-zinc-500 hover:bg-zinc-900/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2" role="group" aria-label={t('frame.label')}>
            <span className="text-xs text-zinc-500">{t('frame.label')}</span>
            {([1, 2, 3] as ReadingFrame[]).map((f) => (
              <button
                key={f}
                onClick={() => switchFrame(f)}
                aria-pressed={frame === f}
                className={`min-h-[36px] rounded-md px-3 py-1 font-mono text-xs transition ${
                  frame === f
                    ? 'bg-violet-500/25 text-violet-900 dark:text-violet-200'
                    : 'border border-zinc-300 text-zinc-500 hover:bg-zinc-900/5 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5'
                }`}
              >
                +{f}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={requireStart}
              onChange={(e) => switchMode(e.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
            {t('orf.label')}
          </label>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="hidden font-mono text-[11px] text-zinc-400 dark:text-zinc-600 lg:inline">
              {kind === 'dna' ? t('kind.dna') : t('kind.rna')} · {alphabet}
            </span>
            <button onClick={() => setInput(EXAMPLE_WITH_STOP[kind])} className="min-h-[36px] rounded-md px-2 font-mono text-zinc-500 transition hover:text-violet-600 dark:hover:text-violet-300">
              {t('examples.withStop')}
            </button>
            <span className="text-zinc-400 dark:text-zinc-700">·</span>
            <button onClick={() => setInput(EXAMPLE_NO_STOP[kind])} className="min-h-[36px] rounded-md px-2 font-mono text-zinc-500 transition hover:text-violet-600 dark:hover:text-violet-300">
              {t('examples.noStop')}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-800 dark:text-rose-200">
          {error}
        </p>
      )}

      {analyzing && (
        <div className="mt-10 flex flex-col items-center gap-3" aria-label={t('loading.label')}>
          <div className="flex gap-1.5 font-mono text-lg text-violet-600 dark:text-violet-300" aria-hidden>
            {(kind === 'dna' ? ['A', 'T', 'G', 'C'] : ['A', 'U', 'G', 'C']).map((b, i) => (
              <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 120}ms` }}>{b}</span>
            ))}
          </div>
          <p className="text-xs text-zinc-500">{t('loading.text')}</p>
        </div>
      )}

      {!analyzing && !result && !error && (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-white/10">
          <p className="font-mono text-sm tracking-widest text-zinc-500">{t(kind === 'dna' ? 'empty.flow.dna' : 'empty.flow')}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
            {t(kind === 'dna' ? 'empty.body.dna' : 'empty.body')}
          </p>
          <p className="mt-4 font-mono text-xs text-zinc-400 dark:text-zinc-600">{t('empty.try')} {normalizeSequence(EXAMPLE_WITH_STOP[kind]).length} {t('editor.unit.nt')} · {EXAMPLE_WITH_STOP[kind]}</p>
        </div>
      )}

      {!analyzing && result && (
        <div key={`${result.kind}-${result.rna}-${result.frame}-${result.requireStart}-${lang}`}>
          <TranslationResult result={result} notify={notify} />
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
            <StatisticsPanel result={result} />
            <div className="rounded-xl border border-zinc-300 bg-zinc-900/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t('export.title')}</h3>
              <ExportControls result={result} notify={notify} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
