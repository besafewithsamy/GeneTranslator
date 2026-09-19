import { CODON_TABLE, type CodonInfo } from './genetic-code';

export const MAX_SEQUENCE_LENGTH = 10000;

export type ReadingFrame = 1 | 2 | 3;

export interface TranslatedCodon extends CodonInfo {
  index: number;
  skipped: boolean;
  terminated: boolean;
}

export interface TranslationResult {
  codons: TranslatedCodon[];
  acids: string[];
  oneLetter: string;
  protein: string;
  proteinLength: number;
  startCodon: string | null;
  stopCodon: string | null;
  stoppedEarly: boolean;
  leaderLength: number;
  trailingBases: string;
}

export interface AnalysisResult extends TranslationResult {
  kind: SequenceKind;
  inputSeq: string;
  rna: string;
  dna: string;
  frame: ReadingFrame;
  requireStart: boolean;
  gcContent: number;
  auContent: number;
  codonCount: number;
  molecularWeight: number;
}

const VALID_BASES = new Set(['A', 'U', 'G', 'C']);
const VALID_DNA_BASES = new Set(['A', 'T', 'G', 'C']);

export type SequenceKind = 'rna' | 'dna';

export function normalizeSequence(input: string): string {
  return input.toUpperCase().replace(/\s+/g, '');
}

export type ValidationError = 'empty' | 'too-long' | 'invalid-bases';

export function validateRNA(input: string): {
  valid: boolean;
  errorCode?: ValidationError;
  invalidBases?: string[];
  cleaned: string;
} {
  const cleaned = normalizeSequence(input);
  if (cleaned.length === 0) {
    return { valid: false, errorCode: 'empty', cleaned };
  }
  if (cleaned.length > MAX_SEQUENCE_LENGTH) {
    return { valid: false, errorCode: 'too-long', cleaned };
  }
  const invalid = [...new Set([...cleaned].filter((b) => !VALID_BASES.has(b)))];
  if (invalid.length > 0) {
    return { valid: false, errorCode: 'invalid-bases', invalidBases: invalid, cleaned };
  }
  return { valid: true, cleaned };
}

export function validateDNA(input: string): {
  valid: boolean;
  errorCode?: ValidationError;
  invalidBases?: string[];
  cleaned: string;
} {
  const cleaned = normalizeSequence(input);
  if (cleaned.length === 0) {
    return { valid: false, errorCode: 'empty', cleaned };
  }
  if (cleaned.length > MAX_SEQUENCE_LENGTH) {
    return { valid: false, errorCode: 'too-long', cleaned };
  }
  const invalid = [...new Set([...cleaned].filter((b) => !VALID_DNA_BASES.has(b)))];
  if (invalid.length > 0) {
    return { valid: false, errorCode: 'invalid-bases', invalidBases: invalid, cleaned };
  }
  return { valid: true, cleaned };
}

const DNA_PAIR: Record<string, string> = { A: 'T', U: 'A', G: 'C', C: 'G' };

export function rnaToDNA(rna: string): string {
  return [...rna].map((b) => DNA_PAIR[b] ?? b).join('');
}

export function dnaToRNA(dna: string): string {
  return dna.replace(/T/g, 'U');
}

export function splitCodons(seq: string, frame: ReadingFrame = 1): string[] {
  const offset = frame - 1;
  const out: string[] = [];
  for (let i = offset; i + 3 <= seq.length; i += 3) {
    out.push(seq.slice(i, i + 3));
  }
  return out;
}

export function translateCodon(codon: string): CodonInfo {
  const info = CODON_TABLE[codon];
  if (!info) throw new Error(`Unknown codon: ${codon}`);
  return info;
}

export function translateRNA(
  rna: string,
  opts: { frame?: ReadingFrame; requireStart?: boolean } = {},
): TranslationResult {
  const frame = opts.frame ?? 1;
  const requireStart = opts.requireStart ?? true;
  const offset = frame - 1;
  const codons = splitCodons(rna, frame);

  let startIndex = 0;
  if (requireStart) {
    const found = codons.indexOf('AUG');
    startIndex = found === -1 ? 0 : found;
  }

  const translated: TranslatedCodon[] = [];
  const acids: string[] = [];
  let oneLetter = '';
  let protein = '';
  let startCodon: string | null = null;
  let stopCodon: string | null = null;
  let stoppedEarly = false;

  for (let i = 0; i < codons.length; i++) {
    const codon = codons[i];
    const info = translateCodon(codon);
    const skipped = i < startIndex;
    if (skipped) {
      translated.push({ ...info, index: i, skipped: true, terminated: false });
      continue;
    }
    if (startCodon === null && requireStart) startCodon = codon;
    if (startCodon === null && !requireStart && info.type === 'start') startCodon = codon;
    if (info.type === 'stop') {
      stopCodon = codon;
      stoppedEarly = true;
      translated.push({ ...info, index: i, skipped: false, terminated: true });
      acids.push(info.abbr);
      oneLetter += info.letter;
      break;
    }
    translated.push({ ...info, index: i, skipped: false, terminated: false });
    acids.push(info.abbr);
    oneLetter += info.letter;
    protein += info.letter;
    if (startCodon === null) startCodon = codon;
  }

  if (requireStart && startIndex < codons.length && codons[startIndex] === 'AUG') {
    startCodon = 'AUG';
  } else if (!requireStart) {
    const firstStart = translated.find((c) => !c.skipped && c.codon === 'AUG');
    startCodon = firstStart ? 'AUG' : startCodon;
  }

  const consumed = offset + codons.length * 3;
  const trailingBases = rna.slice(consumed);

  return {
    codons: translated,
    acids,
    oneLetter,
    protein,
    proteinLength: protein.length,
    startCodon: requireStart
      ? codons[startIndex] === 'AUG'
        ? 'AUG'
        : null
      : (translated.find((c) => !c.skipped && c.codon === 'AUG')?.codon ?? null),
    stopCodon,
    stoppedEarly,
    leaderLength: startIndex,
    trailingBases,
  };
}

export function calculateGCContent(seq: string): number {
  if (seq.length === 0) return 0;
  let gc = 0;
  for (const b of seq) if (b === 'G' || b === 'C') gc++;
  return (gc / seq.length) * 100;
}

export function calculateAUContent(seq: string): number {
  if (seq.length === 0) return 0;
  let au = 0;
  for (const b of seq) if (b === 'A' || b === 'U') au++;
  return (au / seq.length) * 100;
}

const RESIDUE_MASS: Record<string, number> = {
  A: 71.08, R: 156.19, N: 114.1, D: 115.09, C: 103.14, E: 129.12, Q: 128.13,
  G: 57.05, H: 137.14, I: 113.16, L: 113.16, K: 128.17, M: 131.19, F: 147.18,
  P: 97.12, S: 87.08, T: 101.11, W: 186.21, Y: 163.18, V: 99.13,
};

export function molecularWeight(protein: string): number {
  if (protein.length === 0) return 0;
  let mass = 18.015;
  for (const aa of protein) mass += RESIDUE_MASS[aa] ?? 0;
  return Math.round(mass * 100) / 100;
}

export function analyzeSequence(
  input: string,
  opts: { frame?: ReadingFrame; requireStart?: boolean; kind?: SequenceKind } = {},
): AnalysisResult {
  const kind = opts.kind ?? 'rna';
  const cleaned = normalizeSequence(input);
  const rna = kind === 'dna' ? dnaToRNA(cleaned) : cleaned;
  const frame = opts.frame ?? 1;
  const requireStart = opts.requireStart ?? true;
  const t = translateRNA(rna, { frame, requireStart });
  const gcContent = Math.round(calculateGCContent(rna) * 10) / 10;
  const auContent = Math.round(calculateAUContent(rna) * 10) / 10;
  return {
    ...t,
    kind,
    inputSeq: cleaned,
    rna,
    dna: kind === 'dna' ? cleaned : rnaToDNA(rna),
    frame,
    requireStart,
    gcContent,
    auContent,
    codonCount: splitCodons(rna, frame).length,
    molecularWeight: molecularWeight(t.protein),
  };
}
