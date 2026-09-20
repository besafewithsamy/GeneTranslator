import { normalizeSequence, type ReadingFrame } from '../../lib/biology';
import type { DnaStrand } from '../../lib/exercise';
import { useLang } from '../../lang';

interface Props {
  normal: string;
  mutant: string;
  onNormal: (v: string) => void;
  onMutant: (v: string) => void;
  strand: DnaStrand;
  onStrand: (s: DnaStrand) => void;
  frame: ReadingFrame;
  onFrame: (f: ReadingFrame) => void;
  onAnalyze: () => void;
  onExample: () => void;
  onClear: () => void;
  analyzing: boolean;
}

function AlleleEditor({
  id,
  label,
  value,
  onChange,
  onAnalyze,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
}) {
  const { t } = useLang();
  return (
    <div className="flex-1">
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <span className="font-mono text-xs text-zinc-500" aria-live="polite">
          {normalizeSequence(value).length} {t('editor.unit.nt')}
        </span>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onAnalyze();
          }
        }}
        placeholder="CTTCTACAAGGAACCTATTGTATT"
        spellCheck={false}
        rows={4}
        className="seq-scroll w-full resize-y rounded-xl border border-zinc-300 bg-white p-4 font-mono text-[15px] leading-7 tracking-wider text-zinc-900 placeholder:text-zinc-400 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:placeholder:text-zinc-600"
      />
    </div>
  );
}

export function ExerciseInput(props: Props) {
  const { t } = useLang();
  const { strand, onStrand, frame, onFrame, onAnalyze, onExample, onClear, analyzing } = props;
  return (
    <section aria-label={t('ex.title')}>
      <div className="flex flex-col gap-4 md:flex-row">
        <AlleleEditor
          id="ex-normal"
          label={t('ex.normal.label')}
          value={props.normal}
          onChange={props.onNormal}
          onAnalyze={onAnalyze}
        />
        <AlleleEditor
          id="ex-mutant"
          label={t('ex.mutant.label')}
          value={props.mutant}
          onChange={props.onMutant}
          onAnalyze={onAnalyze}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-3" role="radiogroup" aria-label={t('ex.strand.label')}>
          <span className="text-xs text-zinc-500">{t('ex.strand.label')}</span>
          {(['coding', 'template'] as DnaStrand[]).map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="radio"
                name="ex-strand"
                checked={strand === s}
                onChange={() => onStrand(s)}
                className="h-3.5 w-3.5 accent-violet-500"
              />
              {t(s === 'coding' ? 'ex.strand.coding' : 'ex.strand.template')}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2" role="group" aria-label={t('frame.label')}>
          <span className="text-xs text-zinc-500">{t('frame.label')}</span>
          {([1, 2, 3] as ReadingFrame[]).map((f) => (
            <button
              key={f}
              onClick={() => onFrame(f)}
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
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="min-h-[44px] w-full rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60 sm:w-auto dark:bg-violet-500 dark:hover:bg-violet-400"
        >
          {analyzing ? t('ex.analyzing') : t('ex.analyze')}
        </button>
        <button onClick={onExample} className="min-h-[44px] rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-900/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5">
          {t('ex.example')}
        </button>
        <button onClick={onClear} className="min-h-[44px] rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-900/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5">
          {t('ex.clear')}
        </button>
        <span className="ml-auto hidden font-mono text-[11px] text-zinc-400 dark:text-zinc-600 sm:inline">{t('editor.shortcut')}</span>
      </div>
    </section>
  );
}
