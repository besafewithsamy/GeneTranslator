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
    </div>
  );
}
