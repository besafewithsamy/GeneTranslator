import { useState } from 'react';
import { generateExamAnswer, generateExerciseAnalysis, type ExerciseResult } from '../../lib/exercise';
import { copyText } from '../seq-utils';
import { useLang } from '../../lang';
import { SectionTitle, panelClass } from './section';

export function ExamAnswer({ result, notify }: { result: ExerciseResult; notify: (m: string) => void }) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const analysis = generateExerciseAnalysis(result, lang);
  const answer = open ? generateExamAnswer(result, lang) : '';

  return (
    <section>
      <SectionTitle>{t('ex.analysis.title')}</SectionTitle>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">{analysis}</p>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400"
          >
            {t('ex.exam.generate')}
          </button>
          {open && (
            <button
              onClick={async () => {
                const ok = await copyText(generateExamAnswer(result, lang));
                notify(ok ? t('ex.exam.copied') : t('notify.copyFailed'));
              }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:bg-zinc-900/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              {t('ex.exam.copy')}
            </button>
          )}
        </div>
        {open && (
          <div className={`${panelClass} mt-3`}>
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t('ex.exam.title')}
            </h3>
            <pre className="seq-scroll overflow-x-auto whitespace-pre-wrap font-mono text-[13px] leading-6 text-zinc-800 dark:text-zinc-200">
              {answer}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
