import type { AnalysisResult } from '../lib/biology';
import { downloadFile, toFASTA, toJSON, toTXT } from '../lib/export';
import { useLang } from '../lang';

export function ExportControls({ result, notify }: { result: AnalysisResult; notify: (m: string) => void }) {
  const { t } = useLang();
  const doExport = (kind: 'FASTA' | 'TXT' | 'JSON') => {
    const content = kind === 'FASTA' ? toFASTA(result) : kind === 'TXT' ? toTXT(result) : toJSON(result);
    downloadFile(`genetranslator_protein.${kind.toLowerCase()}`, content, 'text/plain');
    notify(t('notify.exported', { kind }));
  };
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t('export.title')}>
      {(['FASTA', 'TXT', 'JSON'] as const).map((k) => (
        <button
          key={k}
          onClick={() => doExport(k)}
          className="rounded-lg border border-zinc-300 px-4 py-1.5 font-mono text-xs text-zinc-600 transition hover:border-violet-500/40 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-violet-400/40 dark:hover:text-zinc-100"
        >
          {k}
        </button>
      ))}
    </div>
  );
}
