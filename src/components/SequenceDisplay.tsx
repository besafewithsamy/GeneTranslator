import { baseColorClass, copyText } from './seq-utils';
import { useLang } from '../lang';

interface Props {
  label: string;
  sublabel?: string;
  sequence: string;
  fivePrime?: string;
  threePrime?: string;
  highlightStart?: number;
  highlightLength?: number;
  dimBefore?: number;
  onCopy?: (ok: boolean) => void;
  compact?: boolean;
}

const COLORED_LIMIT = 600;

export function SequenceDisplay({
  label,
  sublabel,
  sequence,
  fivePrime = "5'",
  threePrime = "3'",
  highlightStart = -1,
  highlightLength = 0,
  dimBefore = 0,
  onCopy,
  compact = false,
}: Props) {
  const { t } = useLang();
  const colored = sequence.length <= COLORED_LIMIT;

  const renderBases = () => {
    if (!colored) {
      return <span className="text-zinc-700 dark:text-zinc-300">{sequence}</span>;
    }
    const triplets: string[] = [];
    for (let i = 0; i < sequence.length; i += 3) triplets.push(sequence.slice(i, i + 3));
    return triplets.map((trip, ti) => (
      <span key={ti} className="mr-[0.55em] inline-block whitespace-nowrap last:mr-0">
        {[...trip].map((b, bi) => {
          const pos = ti * 3 + bi;
          const inHighlight = pos >= highlightStart && pos < highlightStart + highlightLength;
          const dimmed = pos < dimBefore;
          return (
            <span
              key={bi}
              className={`${baseColorClass(b)} rounded px-[1px] transition-colors ${
                inHighlight ? 'bg-violet-500/40' : ''
              } ${dimmed ? 'opacity-30' : ''}`}
            >
              {b}
            </span>
          );
        })}
      </span>
    ));
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</h3>
        {sublabel && <span className="text-xs text-zinc-400 dark:text-zinc-600">{sublabel}</span>}
        {onCopy && (
          <button
            onClick={async () => onCopy(await copyText(sequence))}
            aria-label={`${t('copy.label')} ${label}`}
            className="ml-auto rounded-md border border-zinc-300 px-2 py-0.5 font-mono text-[11px] text-zinc-500 transition hover:bg-zinc-900/5 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
          >
            {t('copy.label')}
          </button>
        )}
      </div>
      <div className="seq-scroll overflow-x-auto rounded-lg border border-zinc-300 bg-white px-4 py-3 dark:border-white/10 dark:bg-black/40">
        <p className={`font-mono leading-8 tracking-wider ${compact ? 'text-[15px]' : 'text-lg'}`}>
          <span className="mr-3 select-none text-xs text-zinc-400 dark:text-zinc-600">{fivePrime} ·</span>
          {renderBases()}
          <span className="ml-3 select-none text-xs text-zinc-400 dark:text-zinc-600">· {threePrime}</span>
        </p>
        {sequence.length > COLORED_LIMIT && (
          <p className="mt-1 font-mono text-[11px] text-zinc-400 dark:text-zinc-600">{t('seq.long', { n: COLORED_LIMIT })}</p>
        )}
      </div>
    </div>
  );
}
