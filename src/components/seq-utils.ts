const BASE_COLORS: Record<string, string> = {
  A: 'text-emerald-700 dark:text-emerald-300',
  U: 'text-violet-700 dark:text-violet-300',
  G: 'text-sky-700 dark:text-sky-300',
  C: 'text-amber-700 dark:text-amber-300',
  T: 'text-rose-700 dark:text-rose-300',
};

export function baseColorClass(base: string): string {
  return BASE_COLORS[base] ?? 'text-zinc-700 dark:text-zinc-200';
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      ta.remove();
    }
  }
}

export function groupTriplets(seq: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < seq.length; i += 3) out.push(seq.slice(i, i + 3));
  return out;
}
