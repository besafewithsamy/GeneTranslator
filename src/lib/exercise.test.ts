import { describe, expect, it } from 'vitest';
import {
  analyzeExercise,
  classifyMutation,
  compareProteins,
  compareSequences,
  detectIndel,
  detectMutations,
  findPrematureStop,
  generateExamAnswer,
  generateExerciseAnalysis,
  mutationMechanism,
  transcribeCodingDNA,
  transcribeDNA,
  transcribeTemplateDNA,
} from './exercise';
import { validateDNA } from './biology';

const NORMAL = 'CTTCTACAAGGAACCTATTGTATT';
const MUTANT = 'CTTCTACAAGGAACCTATTTGATT';

describe('transcription', () => {
  it('transcribes template DNA', () => {
    expect(transcribeTemplateDNA('CTTCTACAA')).toBe('GAAGAU GUU'.replace(/ /g, ''));
    expect(transcribeTemplateDNA('ACGT')).toBe('UGCA');
  });
  it('transcribes coding DNA', () => {
    expect(transcribeCodingDNA('ATGGCC')).toBe('AUGGCC');
  });
  it('dispatches by strand', () => {
    expect(transcribeDNA('CTT', 'template')).toBe('GAA');
    expect(transcribeDNA('CTT', 'coding')).toBe('CUU');
  });
});

describe('validateDNA', () => {
  it('accepts the exercise alleles', () => {
    expect(validateDNA(NORMAL).valid).toBe(true);
    expect(validateDNA(MUTANT).valid).toBe(true);
  });
  it('normalizes whitespace and lowercase', () => {
    expect(validateDNA('ctt cta\ncaa').valid).toBe(true);
  });
  it('rejects invalid sequences', () => {
    expect(validateDNA('CTTX').valid).toBe(false);
    expect(validateDNA('').valid).toBe(false);
  });
});

describe('compareSequences', () => {
  it('finds diff positions 20 and 21', () => {
    const d = compareSequences(NORMAL, MUTANT);
    expect(d.positions).toEqual([20, 21]);
    expect(d.normalBases).toEqual(['G', 'T']);
    expect(d.mutantBases).toEqual(['T', 'G']);
  });
  it('returns empty diffs for identical sequences', () => {
    expect(compareSequences(NORMAL, NORMAL).positions).toEqual([]);
  });
});

describe('detectMutations', () => {
  it('detects the missense ACA -> AAC', () => {
    const m = detectMutations('GAAG AUGUUCCUUGGAUAACAUAA'.replace(/ /g, ''), 'GAAG AUGUUCCUUGGAUAA ACUAA'.replace(/ /g, ''));
    expect(m.length).toBeGreaterThan(0);
  });
  it('detects silent mutation', () => {
    const m = detectMutations('GCU', 'GCC', 1);
    expect(m).toHaveLength(1);
    expect(m[0].kind).toBe('silent');
  });
  it('detects missense mutation', () => {
    const m = detectMutations('ACA', 'AAC', 1);
    expect(m).toHaveLength(1);
    expect(m[0].kind).toBe('missense');
    expect(m[0].normalAA).toBe('Thr');
    expect(m[0].mutantAA).toBe('Asn');
  });
  it('detects nonsense mutation', () => {
    const m = detectMutations('CAA', 'UAA', 1);
    expect(m).toHaveLength(1);
    expect(m[0].kind).toBe('nonsense');
  });
});

describe('indels', () => {
  it('detects insertion', () => {
    const indel = detectIndel('CTTCTA', 'CTTGGCTA');
    expect(indel?.kind).toBe('insertion');
    expect(indel?.at).toBe(4);
    expect(indel?.bases).toBe('GG');
    expect(indel?.frameshift).toBe(true);
  });
  it('detects deletion', () => {
    const indel = detectIndel('CTTGGCTA', 'CTTCTA');
    expect(indel?.kind).toBe('deletion');
    expect(indel?.frameshift).toBe(true);
  });
  it('flags in-frame indel as non-frameshift', () => {
    const indel = detectIndel('CTTCTA', 'CTTGGGCTA');
    expect(indel?.frameshift).toBe(false);
  });
  it('returns null for equal lengths', () => {
    expect(detectIndel(NORMAL, MUTANT)).toBeNull();
  });
  it('classifies frameshift', () => {
    expect(classifyMutation([], detectIndel('CTTCTA', 'CTTGGCTA'))).toBe('frameshift');
  });
  it('classifies silent / missense / nonsense', () => {
    expect(classifyMutation(detectMutations('GCU', 'GCC', 1), null)).toBe('silent');
    expect(classifyMutation(detectMutations('ACA', 'AAC', 1), null)).toBe('missense');
    expect(classifyMutation(detectMutations('CAA', 'UAA', 1), null)).toBe('nonsense');
  });
  it('returns null when alleles are identical', () => {
    expect(classifyMutation([], null)).toBeNull();
  });
});

describe('compareProteins', () => {
  it('marks changed positions', () => {
    expect(compareProteins('EDVPWIT*', 'EDVPWIN*')).toEqual([6]);
    expect(compareProteins('MAIV*', 'MAIV*')).toEqual([]);
  });
});

describe('findPrematureStop', () => {
  it('detects premature stop', () => {
    const p = findPrematureStop('CAACUAAAAUAA', 'CAAUAAAAAUAA', 1);
    expect(p).not.toBeNull();
    expect(p?.mutantLength).toBe(1);
    expect(p?.normalLength).toBe(3);
  });
  it('returns null when stops align', () => {
    const n = 'GAAG AUGUUCCUUGGAUAACAUAA'.replace(/ /g, '');
    expect(findPrematureStop(n, n, 1)).toBeNull();
  });
});

describe('analyzeExercise end to end', () => {
  it('reproduces the BRCA1-style example', () => {
    const r = analyzeExercise(
      'CTT CTA CAA GGA ACC TAT TGT ATT',
      'CTT CTA CAA GGA ACC TAT TTG ATT',
      'template',
      1,
    );
    expect(r.normal.mrna).toBe('GAAGAUGUUCCUUGGAUAACAUAA');
    expect(r.mutant.mrna).toBe('GAAGAUGUUCCUUGGAUAAACUAA');
    expect(r.normal.oneLetter).toBe('EDVPWIT*');
    expect(r.mutant.oneLetter).toBe('EDVPWIN*');
    expect(r.classification).toBe('missense');
    expect(r.primary?.normalCodon).toBe('ACA');
    expect(r.primary?.mutantCodon).toBe('AAC');
    expect(r.primary?.normalAA).toBe('Thr');
    expect(r.primary?.mutantAA).toBe('Asn');
    expect(r.primary?.dnaPosition).toBe(19);
    expect(r.stats.diffCount).toBe(2);
    expect(r.stats.firstDiffPosition).toBe(20);
    expect(r.stats.normalProteinLength).toBe(7);
    expect(r.prematureStop).toBeNull();
  });
  it('computes stats from actual sequences', () => {
    const r = analyzeExercise(NORMAL, MUTANT, 'template', 1);
    expect(r.stats.normalLength).toBe(24);
    expect(r.stats.mutantLength).toBe(24);
    expect(r.stats.mutationPercent).toBeCloseTo(8.3, 0);
    expect(r.stats.changedAminoAcids).toBe(1);
  });
  it('generates analysis and exam answer without medical claims', () => {
    const r = analyzeExercise(NORMAL, MUTANT, 'template', 1);
    const analysis = generateExerciseAnalysis(r, 'en');
    expect(analysis).toMatch(/position 20/);
    expect(analysis).toMatch(/Thr/);
    expect(analysis).not.toMatch(/cancer/i);
    const answer = generateExamAnswer(r, 'en');
    expect(answer).toMatch(/Transcription:/);
    expect(answer).toMatch(/Conclusion:/);
    expect(answer).toMatch(/Mechanism: substitution/);
    expect(generateExamAnswer(r, 'fr')).toMatch(/Conclusion :/);
  });
});

describe('mutation mechanism', () => {
  it('reports substitution for equal lengths', () => {
    const r = analyzeExercise(NORMAL, MUTANT, 'template', 1);
    expect(mutationMechanism(r)).toBe('substitution');
  });
  it('reports addition for insertion', () => {
    const r = analyzeExercise('CTTCTA', 'CTTGGCTA', 'template', 1);
    expect(mutationMechanism(r)).toBe('addition');
  });
  it('reports deletion', () => {
    const r = analyzeExercise('CTTGGCTA', 'CTTCTA', 'template', 1);
    expect(mutationMechanism(r)).toBe('deletion');
  });
  it('returns null when identical', () => {
    const r = analyzeExercise(NORMAL, NORMAL, 'template', 1);
    expect(mutationMechanism(r)).toBeNull();
  });
});

describe('indel stats hygiene', () => {
  it('excludes misaligned downstream positions', () => {
    const r = analyzeExercise('CTTCTA', 'CTTGGCTA', 'template', 1);
    expect(r.indel?.kind).toBe('insertion');
    expect(r.indel?.at).toBe(4);
    expect(r.diff.positions.every((p) => p < 4)).toBe(true);
    expect(r.stats.diffCount).toBe(2);
    expect(r.stats.firstDiffPosition).toBe(4);
    expect(generateExerciseAnalysis(r, 'en')).not.toMatch(/changes the codon from/);
  });
});

describe('open-frame stop gain', () => {
  it('reports premature stop when normal is an open frame', () => {
    const r = analyzeExercise('CAACUAAAAAA', 'CAAATTAAAAA', 'template', 1);
    expect(r.prematureStop).not.toBeNull();
    expect(r.prematureStop?.mutantLength).toBe(1);
    expect(r.prematureStop?.normalLength).toBe(3);
  });
});
