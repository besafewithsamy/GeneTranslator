import { useLang } from '../lang';

export function AboutPage() {
  const { t } = useLang();
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t('about.title')}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
        <p>{t('about.p0')}</p>
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
        <p>{t('about.p3')}</p>
        <p className="border-l-2 border-violet-500/40 pl-4 text-zinc-500">
          {t('about.note')}
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-300 bg-zinc-900/[0.04] p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t('about.author.title')}
        </h3>
        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          {t('about.author.body')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="https://github.com/besafewithsamy"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-300 px-4 py-1.5 font-mono text-xs text-zinc-600 transition hover:border-violet-500/40 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-violet-400/40 dark:hover:text-zinc-100"
          >
            {t('about.author.github')}
          </a>
          <a
            href="https://www.linkedin.com/in/sami-salhi-1770b4248"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-zinc-300 px-4 py-1.5 font-mono text-xs text-zinc-600 transition hover:border-violet-500/40 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:border-violet-400/40 dark:hover:text-zinc-100"
          >
            {t('about.author.linkedin')}
          </a>
        </div>
      </div>
    </div>
  );
}
