import { useLang } from '../lang';
import { useTheme } from '../theme';

export type View = 'translator' | 'exercise' | 'codons' | 'about';

const ITEMS: { id: View; key: 'nav.translator' | 'nav.exercise' | 'nav.codons' | 'nav.about' }[] = [
  { id: 'translator', key: 'nav.translator' },
  { id: 'exercise', key: 'nav.exercise' },
  { id: 'codons', key: 'nav.codons' },
  { id: 'about', key: 'nav.about' },
];

export function Header({ view, onNav }: { view: View; onNav: (v: View) => void }) {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLang();

  return (
    <header className="border-b border-zinc-300 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:gap-x-6 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20">
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden>
              <g stroke-linecap="round">
                <path d="M22 8 C40 15, 40 23, 22 30 C4 37, 4 45, 22 52" stroke="#8b5cf6" stroke-width="5"/>
                <path d="M42 8 C24 15, 24 23, 42 30 C60 37, 60 45, 42 52" stroke="#0ea5e9" stroke-width="5"/>
                <g stroke="currentColor" stroke-width="3.5" opacity="0.55" className="text-zinc-500">
                  <line x1="27" y1="15" x2="37" y2="15"/>
                  <line x1="23" y1="23" x2="41" y2="23"/>
                  <line x1="22" y1="30" x2="42" y2="30"/>
                  <line x1="12" y1="38" x2="52" y2="38"/>
                  <line x1="11" y1="45" x2="53" y2="45"/>
                </g>
              </g>
              <g>
                <circle cx="22" cy="8" r="4" fill="#8b5cf6"/>
                <circle cx="42" cy="8" r="4" fill="#0ea5e9"/>
                <circle cx="22" cy="52" r="4" fill="#8b5cf6"/>
                <circle cx="42" cy="52" r="4" fill="#0ea5e9"/>
              </g>
            </svg>
          </span>
          <div>
            <p className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">GeneTranslator</p>
            <p className="hidden font-mono text-xs tracking-widest text-zinc-500 min-[420px]:block">{t('brand.tagline')}</p>
          </div>
        </div>
        <nav className="ml-auto flex max-w-full items-center gap-1 overflow-x-auto" aria-label="Primary">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              aria-current={view === item.id ? 'page' : undefined}
              className={`min-h-[36px] shrink-0 rounded-md px-2.5 py-1.5 text-sm transition-colors sm:px-3 ${
                view === item.id
                  ? 'bg-zinc-900/10 text-zinc-900 dark:bg-white/10 dark:text-zinc-100'
                  : 'text-zinc-500 hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'
              }`}
            >
              {t(item.key)}
            </button>
          ))}
          <span aria-hidden className="mx-1 h-5 w-px bg-zinc-300 dark:bg-white/10" />
          <div className="flex shrink-0 overflow-hidden rounded-md border border-zinc-300 dark:border-white/10" role="group" aria-label={t('lang.label')}>
            {(['en', 'fr'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`shrink-0 px-2 py-1.5 font-mono text-xs uppercase transition-colors ${
                  lang === l
                    ? 'bg-violet-500/25 text-violet-900 dark:text-violet-200'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={toggle}
            aria-pressed={theme === 'light'}
            title={t(theme === 'dark' ? 'theme.toggle.dark' : 'theme.toggle.light')}
            aria-label={t(theme === 'dark' ? 'theme.toggle.dark' : 'theme.toggle.light')}
            className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-300 text-zinc-600 transition hover:bg-zinc-900/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
