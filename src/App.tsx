import { useState } from 'react';
import { Header, type View } from './components/Header';
import { ToastStack, useToasts } from './components/Toast';
import { TranslatorPage } from './pages/TranslatorPage';
import { ExercisePage } from './pages/ExercisePage';
import { CodonTablePage } from './pages/CodonTablePage';
import { AboutPage } from './pages/AboutPage';
import { ThemeProvider } from './theme';
import { LangProvider, useLang } from './lang';
import type { Key } from './i18n';
import type { SequenceKind } from './lib/biology';

function Shell() {
  const [view, setView] = useState<View>('translator');
  const [externalSequence, setExternalSequence] = useState<string | null>(null);
  const [externalKind, setExternalKind] = useState<SequenceKind | null>(null);
  const { toasts, push } = useToasts();
  const { t } = useLang();

  const useCodon = (codon: string) => {
    setExternalSequence(`AUG${codon}UAA`);
    setExternalKind('rna');
    setView('translator');
  };

  return (
    <div className="min-h-screen">
      <Header view={view} onNav={setView} />
      <main className="mx-auto max-w-6xl px-5 py-8">
        {view === 'translator' && (
          <TranslatorPage
            notify={push}
            externalSequence={externalSequence}
            externalKind={externalKind}
            onConsumedExternal={() => { setExternalSequence(null); setExternalKind(null); }}
          />
        )}
        {view === 'exercise' && <ExercisePage notify={push} />}
        {view === 'codons' && <CodonTablePage onUseCodon={useCodon} />}
        {view === 'about' && <AboutPage />}
      </main>
      <footer className="border-t border-zinc-200 py-6 dark:border-white/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-5">
          <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-600">
            {t('footer')}
          </p>
          <nav className="ml-auto flex gap-4" aria-label="Footer">
            {(['translator', 'exercise', 'codons', 'about'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="font-mono text-[11px] text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300"
              >
                {t(`nav.${v}` as Key)}
              </button>
            ))}
          </nav>
        </div>
      </footer>
      <ToastStack toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <Shell />
      </LangProvider>
    </ThemeProvider>
  );
}
