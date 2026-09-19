import { CodonTable } from '../components/CodonTable';
import { useLang } from '../lang';

export function CodonTablePage({ onUseCodon }: { onUseCodon: (codon: string) => void }) {
  const { t } = useLang();
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{t('codontable.title')}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
          {t('codontable.body')}
        </p>
      </div>
      <CodonTable onUseCodon={onUseCodon} />
    </div>
  );
}
