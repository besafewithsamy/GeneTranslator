import { describe, expect, it } from 'vitest';
import {
  analyzeSequence,
  calculateGCContent,
  dnaToRNA,
  normalizeSequence,
  rnaToDNA,
  splitCodons,
  translateCodon,
  translateRNA,
  validateDNA,
  validateRNA,
} from './biology';
import { ALL_CODONS, CODON_TABLE } from './genetic-code';

describe('normalizeSequence', () => {
  it('uppercases lowercase input', () => {
    expect(normalizeSequence('auggcc')).toBe('AUGGCC');
  });
  it('strips whitespace and line breaks', () => {
    expect(normalizeSequence('AUG\nGCC AUU\tGUA')).toBe('AUGGCCAUUGUA');
  });
});

describe('validateRNA', () => {
  it('accepts valid RNA', () => {
    expect(validateRNA('AUGGCCAUUGUAA').valid).toBe(true);
  });
  it('rejects invalid characters with detail', () => {
    const r = validateRNA('AUGXTT');
    expect(r.valid).toBe(false);
    expect(r.errorCode).toBe('invalid-bases');
    expect(r.invalidBases).toContain('X');
  });
  it('rejects empty sequence', () => {
    expect(validateRNA('   \n ').valid).toBe(false);
  });
  it('accepts lowercase and whitespace forms', () => {
    expect(validateRNA('aug gcc\nauu').valid).toBe(true);
  });
});

describe('rnaToDNA', () => {
  it('pairs RNA bases to complementary DNA', () => {
    expect(rnaToDNA('AUGGCCAUUGUA')).toBe('TACCGGTAACAT');
  });
  it('maps A->T U->A G->C C->G', () => {
    expect(rnaToDNA('AUGC')).toBe('TACG');
  });
});

describe('validateDNA', () => {
  it('accepts valid DNA', () => {
    expect(validateDNA('ATGGCCATTGTATAA').valid).toBe(true);
  });
  it('rejects U as invalid for DNA', () => {
    const r = validateDNA('AUG');
    expect(r.valid).toBe(false);
    expect(r.errorCode).toBe('invalid-bases');
    expect(r.invalidBases).toContain('U');
  });
  it('rejects empty sequence', () => {
    expect(validateDNA('  ').valid).toBe(false);
    expect(validateDNA('  ').errorCode).toBe('empty');
  });
  it('accepts lowercase and whitespace forms', () => {
    expect(validateDNA('atg gcc\natt').valid).toBe(true);
  });
});

describe('dnaToRNA', () => {
  it('transcribes the coding strand', () => {
    expect(dnaToRNA('ATGGCCATTGTATAA')).toBe('AUGGCCAUUGUAUAA');
  });
  it('replaces T with U, keeps A/G/C', () => {
    expect(dnaToRNA('ATGC')).toBe('AUGC');
  });
});

describe('splitCodons', () => {
  it('splits frame +1', () => {
    expect(splitCodons('AUGGCCAUUGUA', 1)).toEqual(['AUG', 'GCC', 'AUU', 'GUA']);
  });
  it('shifts for frames +2 and +3', () => {
    expect(splitCodons('AAUGGCCAUU', 2)).toEqual(['AUG', 'GCC', 'AUU']);
    expect(splitCodons('AAAUGGCCAUU', 3)).toEqual(['AUG', 'GCC', 'AUU']);
  });
  it('drops trailing partial codon', () => {
    expect(splitCodons('AUGGCCA', 1)).toEqual(['AUG', 'GCC']);
  });
});

describe('translateCodon', () => {
  it('recognizes start codon', () => {
    expect(translateCodon('AUG').type).toBe('start');
    expect(translateCodon('AUG').abbr).toBe('Met');
  });
  it('recognizes all stop codons', () => {
    for (const s of ['UAA', 'UAG', 'UGA']) expect(translateCodon(s).type).toBe('stop');
  });
  it('covers all 64 codons', () => {
    expect(ALL_CODONS).toHaveLength(64);
    for (const c of ALL_CODONS) expect(translateCodon(c.codon).codon).toBe(c.codon);
  });
  it('spot-checks known mappings', () => {
    expect(CODON_TABLE['GCC'].abbr).toBe('Ala');
    expect(CODON_TABLE['AUU'].letter).toBe('I');
    expect(CODON_TABLE['GUA'].name).toBe('Valine');
  });
});

describe('translateRNA', () => {
  it('translates the canonical example with stop', () => {
    const t = translateRNA('AUGGCCAUUGUAUAA', { requireStart: true });
    expect(t.protein).toBe('MAIV');
    expect(t.oneLetter).toBe('MAIV*');
    expect(t.stopCodon).toBe('UAA');
    expect(t.stoppedEarly).toBe(true);
    expect(t.startCodon).toBe('AUG');
  });
  it('starts at first AUG in ORF mode, skipping leader', () => {
    const t = translateRNA('CCCAUGGCCUAA', { requireStart: true });
    expect(t.leaderLength).toBe(1);
    expect(t.protein).toBe('MA');
  });
  it('falls back gracefully when no AUG exists', () => {
    const t = translateRNA('GCCAUUGUA', { requireStart: true });
    expect(t.startCodon).toBeNull();
  });
  it('raw mode translates without requiring start', () => {
    const t = translateRNA('GCCAUUGUA', { requireStart: false });
    expect(t.protein).toBe('AIV');
  });
  it('frame shift changes the result', () => {
    const a = translateRNA('GGAUGGCCAUUGUA', { frame: 1, requireStart: false });
    const b = translateRNA('GGAUGGCCAUUGUA', { frame: 3, requireStart: false });
    expect(a.protein).not.toBe(b.protein);
    expect(b.codons[0].codon).toBe('AUG');
  });
  it('handles length not divisible by 3', () => {
    const t = translateRNA('AUGGCCA', { requireStart: false });
    expect(t.protein).toBe('MA');
    expect(t.trailingBases).toBe('A');
  });
});

describe('calculateGCContent', () => {
  it('computes GC percent', () => {
    expect(calculateGCContent('AUGGCCAUUGUA')).toBeCloseTo(41.7, 0);
    expect(calculateGCContent('AAAA')).toBe(0);
    expect(calculateGCContent('GCGC')).toBe(100);
    expect(calculateGCContent('')).toBe(0);
  });
});

describe('analyzeSequence', () => {
  it('composes full analysis', () => {
    const a = analyzeSequence('AUGGCCAUUGUAUAA', { frame: 1, requireStart: true });
    expect(a.rna).toBe('AUGGCCAUUGUAUAA');
    expect(a.dna).toBe('TACCGGTAACATATT');
    expect(a.codonCount).toBe(5);
    expect(a.proteinLength).toBe(4);
    expect(a.molecularWeight).toBeGreaterThan(0);
  });
  it('transcribes DNA input then translates identically', () => {
    const a = analyzeSequence('ATGGCCATTGTATAA', { frame: 1, requireStart: true, kind: 'dna' });
    expect(a.kind).toBe('dna');
    expect(a.inputSeq).toBe('ATGGCCATTGTATAA');
    expect(a.rna).toBe('AUGGCCAUUGUAUAA');
    expect(a.dna).toBe('ATGGCCATTGTATAA');
    expect(a.protein).toBe('MAIV');
    expect(a.oneLetter).toBe('MAIV*');
    expect(a.stopCodon).toBe('UAA');
  });
});
