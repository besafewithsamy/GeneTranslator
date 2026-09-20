import { useEffect, useState } from 'react';
import { normalizeSequence, type SequenceKind } from '../lib/biology';
import { useLang } from '../lang';

interface Props {
  kind: SequenceKind;
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onExample: () => void;
  onReset: () => void;
  analyzing: boolean;
}

const ROTATING: Record<SequenceKind, string[]> = {
  rna: ['AUGGCCAUUGUAUAA', 'AUGUUUUCUUAUGGU', 'AUGGCUCGUAA'],
  dna: ['ATGGCCATTGTATAA', 'ATGTTTTCTTATGGT', 'ATGGCTCGTAA'],
};

export function SequenceEditor({ kind, value, onChange, onAnalyze, onClear, onExample, onReset, analyzing }: Props) {
  const { t } = useLang();
  const length = normalizeSequence(value).length;
  const [typed, setTyped] = useState('');
  const [focused, setFocused] = useState(false);
  const examples = ROTATING[kind];

  useEffect(() => {
    if (focused || value) return;
    let seq = 0;
    let pos = 0;
    let deleting = false;
    const id = window.setInterval(() => {
      const full = examples[seq];
      if (!deleting) {
        pos++;
        setTyped(full.slice(0, pos));
        if (pos >= full.length) {
          deleting = true;
          pos = full.length + 6;
        }
      } else {
        pos--;
        if (pos <= full.length) setTyped(full.slice(0, Math.max(0, pos)));
        if (pos <= 0) {
          deleting = false;
          pos = 0;
          seq = (seq + 1) % examples.length;
          setTyped('');
        }
      }
    }, 70);
    return () => window.clearInterval(id);
  }, [focused, value, examples]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onAnalyze();
    }
  };

  return (
    <section aria-label={t('editor.section')}>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor="rna-input" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {kind === 'dna' ? t('editor.label.dna') : t('editor.label')}
        </label>
        <span className="font-mono text-xs text-zinc-500" aria-live="polite">
          {length} {t('editor.unit.nt')}
        </span>
      </div>
      <textarea
        id="rna-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={typed || examples[0]}
        spellCheck={false}
        rows={4}
        className="seq-scroll w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 font-mono text-base leading-7 tracking-wider text-zinc-900 placeholder:text-zinc-400 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:placeholder:text-zinc-600"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="min-h-[44px] w-full rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60 sm:w-auto dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          {analyzing ? t('editor.analyzing') : t('editor.analyze')}
        </button>
        <button onClick={onExample} className="min-h-[44px] rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-900/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5">
          {t('editor.example')}
        </button>
        <button onClick={onClear} className="min-h-[44px] rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-900/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5">
          {t('editor.clear')}
        </button>
        <button onClick={onReset} className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-300">
          {t('editor.reset')}
        </button>
        <span className="ml-auto hidden font-mono text-[11px] text-zinc-400 dark:text-zinc-600 sm:inline">{t('editor.shortcut')}</span>
      </div>
    </section>
  );
}
