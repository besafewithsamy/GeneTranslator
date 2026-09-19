import { useEffect, useState } from 'react';

export interface ToastMsg {
  id: number;
  text: string;
}

let nextId = 1;

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const push = (text: string) => {
    const id = nextId++;
    setToasts((t) => [...t, { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((m) => m.id !== id)), 2600);
  };
  return { toasts, push };
}

export function ToastStack({ toasts }: { toasts: ToastMsg[] }) {
  useEffect(() => {}, [toasts]);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="step-enter rounded-full border border-violet-400/30 bg-white/95 px-4 py-2 text-sm text-zinc-800 shadow-xl dark:bg-[#12141c]/95 dark:text-zinc-200"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
