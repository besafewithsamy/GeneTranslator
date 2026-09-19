import {
  normalizeSequence,
  splitCodons,
  translateCodon,
  translateRNA,
  type ReadingFrame,
} from './biology';

export type DnaStrand = 'coding' | 'template';

const TEMPLATE_PAIR: Record<string, string> = { A: 'U', T: 'A', C: 'G', G: 'C' };

export function transcribeTemplateDNA(dna: string): string {
  return [...normalizeSequence(dna)].map((b) => TEMPLATE_PAIR[b] ?? b).join('');
}

export function transcribeCodingDNA(dna: string): string {
  return normalizeSequence(dna).replace(/T/g, 'U');
}

export function transcribeDNA(dna: string, strand: DnaStrand): string {
  return strand === 'template' ? transcribeTemplateDNA(dna) : transcribeCodingDNA(dna);
}

export interface SeqDiff {
  positions: number[];
  normalBases: string[];
  mutantBases: string[];
}

export interface IndelBlock {
  kind: 'insertion' | 'deletion';
  at: number;
  bases: string;
  length: number;
  frameshift: boolean;
}

export function compareSequences(normal: string, mutant: string): SeqDiff {
  const n = normalizeSequence(normal);
  const m = normalizeSequence(mutant);
  const len = Math.min(n.length, m.length);
  const positions: number[] = [];
  const normalBases: string[] = [];
  const mutantBases: string[] = [];
  for (let i = 0; i < len; i++) {
    if (n[i] !== m[i]) {
      positions.push(i + 1);
      normalBases.push(n[i]);
      mutantBases.push(m[i]);
    }
  }
  return { positions, normalBases, mutantBases };
}

export function detectIndel(normal: string, mutant: string): IndelBlock | null {
  const n = normalizeSequence(normal);
  const m = normalizeSequence(mutant);
  if (n.length === m.length) return null;
  let prefix = 0;
  while (prefix < n.length && prefix < m.length && n[prefix] === m[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < n.length - prefix &&
    suffix < m.length - prefix &&
    n[n.length - 1 - suffix] === m[m.length - 1 - suffix]
  ) {
    suffix++;
  }
  const longerIsMutant = m.length > n.length;
  const block = longerIsMutant
    ? m.slice(prefix, m.length - suffix)
    : n.slice(prefix, n.length - suffix);
  const length = Math.abs(m.length - n.length);
  return {
    kind: longerIsMutant ? 'insertion' : 'deletion',
    at: prefix + 1,
    bases: block,
    length,
    frameshift: length % 3 !== 0,
  };
}

export type CodonMutationKind = 'silent' | 'missense' | 'nonsense';

export interface CodonMutation {
  codonIndex: number;
  dnaPosition: number;
  normalCodon: string;
  mutantCodon: string;
  normalAA: string;
  normalLetter: string;
  mutantAA: string;
  mutantLetter: string;
  kind: CodonMutationKind;
}

export function detectMutations(
  normalMrna: string,
  mutantMrna: string,
  frame: ReadingFrame = 1,
): CodonMutation[] {
  const nCodons = splitCodons(normalMrna, frame);
  const mCodons = splitCodons(mutantMrna, frame);
  const offset = frame - 1;
  const out: CodonMutation[] = [];
  const len = Math.min(nCodons.length, mCodons.length);
  for (let i = 0; i < len; i++) {
    if (nCodons[i] === mCodons[i]) continue;
    const nInfo = translateCodon(nCodons[i]);
    const mInfo = translateCodon(mCodons[i]);
    const kind: CodonMutationKind =
      mInfo.type === 'stop' && nInfo.type !== 'stop'
        ? 'nonsense'
        : nInfo.letter === mInfo.letter
          ? 'silent'
          : 'missense';
    out.push({
      codonIndex: i,
      dnaPosition: offset + i * 3 + 1,
      normalCodon: nCodons[i],
      mutantCodon: mCodons[i],
      normalAA: nInfo.abbr,
      normalLetter: nInfo.letter,
      mutantAA: mInfo.abbr,
      mutantLetter: mInfo.letter,
      kind,
    });
  }
  return out;
}

export type MutationClass =
  | 'silent'
  | 'missense'
  | 'nonsense'
  | 'insertion'
  | 'deletion'
  | 'frameshift';

export function classifyMutation(mutations: CodonMutation[], indel: IndelBlock | null): MutationClass | null {
  if (indel) {
    if (indel.frameshift) return 'frameshift';
    return indel.kind;
  }
  if (mutations.length === 0) return null;
  const rank: Record<CodonMutationKind, number> = { nonsense: 0, missense: 1, silent: 2 };
  const primary = [...mutations].sort((a, b) => rank[a.kind] - rank[b.kind])[0];
  return primary.kind;
}

export function compareProteins(normalProtein: string, mutantProtein: string): number[] {
  const changed: number[] = [];
  const len = Math.max(normalProtein.length, mutantProtein.length);
  for (let i = 0; i < len; i++) {
    if ((normalProtein[i] ?? '') !== (mutantProtein[i] ?? '')) changed.push(i);
  }
  return changed;
}

export interface PrematureStop {
  normalLength: number;
  mutantLength: number;
  normalStopIndex: number | null;
  mutantStopIndex: number | null;
}

export function findPrematureStop(normalMrna: string, mutantMrna: string, frame: ReadingFrame = 1): PrematureStop | null {
  const stopIndex = (mrna: string): number | null => {
    const codons = splitCodons(mrna, frame);
    for (let i = 0; i < codons.length; i++) {
      if (translateCodon(codons[i]).type === 'stop') return i;
    }
    return null;
  };
  const nT = translateRNA(normalMrna, { frame, requireStart: false });
  const mT = translateRNA(mutantMrna, { frame, requireStart: false });
  const nStop = stopIndex(normalMrna);
  const mStop = stopIndex(mutantMrna);
  if (mStop === null) return null;
  if (nStop !== null && mStop >= nStop) return null;
  return {
    normalLength: nT.proteinLength,
    mutantLength: mT.proteinLength,
    normalStopIndex: nStop,
    mutantStopIndex: mStop,
  };
}

export type MutationMechanism = 'substitution' | 'addition' | 'deletion';

export function mutationMechanism(result: {
  classification: MutationClass | null;
  normal: { dna: string };
  mutant: { dna: string };
}): MutationMechanism | null {
  if (result.classification === null) return null;
  if (result.mutant.dna.length > result.normal.dna.length) return 'addition';
  if (result.mutant.dna.length < result.normal.dna.length) return 'deletion';
  return 'substitution';
}

export interface AlleleAnalysis {
  dna: string;
  mrna: string;
  codons: string[];
  acids: string[];
  oneLetter: string;
  protein: string;
  proteinLength: number;
  stopCodon: string | null;
  stopCodonIndex: number | null;
}

function analyzeAllele(dna: string, strand: DnaStrand, frame: ReadingFrame): AlleleAnalysis {
  const clean = normalizeSequence(dna);
  const mrna = transcribeDNA(clean, strand);
  const codons = splitCodons(mrna, frame);
  const t = translateRNA(mrna, { frame, requireStart: false });
  let stopCodonIndex: number | null = null;
  for (let i = 0; i < codons.length; i++) {
    if (translateCodon(codons[i]).type === 'stop') {
      stopCodonIndex = i;
      break;
    }
  }
  return {
    dna: clean,
    mrna,
    codons,
    acids: t.acids,
    oneLetter: t.oneLetter,
    protein: t.protein,
    proteinLength: t.proteinLength,
    stopCodon: t.stopCodon,
    stopCodonIndex,
  };
}

export interface ExerciseStats {
  normalLength: number;
  mutantLength: number;
  diffCount: number;
  mutationPercent: number;
  normalProteinLength: number;
  mutantProteinLength: number;
  changedAminoAcids: number;
  firstDiffPosition: number | null;
}

export interface ExerciseResult {
  strand: DnaStrand;
  frame: ReadingFrame;
  normal: AlleleAnalysis;
  mutant: AlleleAnalysis;
  diff: SeqDiff;
  indel: IndelBlock | null;
  codonMutations: CodonMutation[];
  classification: MutationClass | null;
  primary: CodonMutation | null;
  changedProteinPositions: number[];
  prematureStop: PrematureStop | null;
  stats: ExerciseStats;
}

export function analyzeExercise(
  normalDna: string,
  mutantDna: string,
  strand: DnaStrand = 'template',
  frame: ReadingFrame = 1,
): ExerciseResult {
  const normal = analyzeAllele(normalDna, strand, frame);
  const mutant = analyzeAllele(mutantDna, strand, frame);
  const rawDiff = compareSequences(normal.dna, mutant.dna);
  const indel = detectIndel(normal.dna, mutant.dna);
  const diff: SeqDiff = indel
    ? {
        positions: rawDiff.positions.filter((p) => p < indel.at),
        normalBases: rawDiff.positions
          .map((p, i) => (p < indel.at ? rawDiff.normalBases[i] : null))
          .filter((b): b is string => b !== null),
        mutantBases: rawDiff.positions
          .map((p, i) => (p < indel.at ? rawDiff.mutantBases[i] : null))
          .filter((b): b is string => b !== null),
      }
    : rawDiff;
  const codonMutations = detectMutations(normal.mrna, mutant.mrna, frame);
  const classification = classifyMutation(codonMutations, indel);
  const rank: Record<CodonMutationKind, number> = { nonsense: 0, missense: 1, silent: 2 };
  const primary = codonMutations.length > 0
    ? [...codonMutations].sort((a, b) => rank[a.kind] - rank[b.kind])[0]
    : null;
  const changedProteinPositions = compareProteins(normal.oneLetter, mutant.oneLetter);
  const prematureStop = findPrematureStop(normal.mrna, mutant.mrna, frame);
  const denom = Math.max(normal.dna.length, mutant.dna.length, 1);
  const stats: ExerciseStats = {
    normalLength: normal.dna.length,
    mutantLength: mutant.dna.length,
    diffCount: diff.positions.length + (indel ? indel.length : 0),
    mutationPercent: Math.round(((diff.positions.length + (indel ? indel.length : 0)) / denom) * 1000) / 10,
    normalProteinLength: normal.proteinLength,
    mutantProteinLength: mutant.proteinLength,
    changedAminoAcids: changedProteinPositions.length,
    firstDiffPosition: diff.positions.length > 0 ? diff.positions[0] : (indel ? indel.at : null),
  };
  return {
    strand,
    frame,
    normal,
    mutant,
    diff,
    indel,
    codonMutations,
    classification,
    primary,
    changedProteinPositions,
    prematureStop,
    stats,
  };
}

export function generateExerciseAnalysis(result: ExerciseResult, lang: 'en' | 'fr'): string {
  const en = lang === 'en';
  const lines: string[] = [];
  const c = result.classification;
  if (c === null) {
    lines.push(
      en
        ? 'Comparison of the two alleles shows no nucleotide difference in the aligned region. Both alleles produce the same amino acid sequence.'
        : 'La comparaison des deux allèles ne montre aucune différence nucléotidique dans la région alignée. Les deux allèles produisent la même séquence d’acides aminés.',
    );
    return lines.join(' ');
  }
  const first = result.diff.positions[0] ?? result.indel?.at ?? 0;
  lines.push(
    en
      ? `Comparison of the two alleles shows a nucleotide difference starting at position ${first}.`
      : `La comparaison des deux allèles montre une différence nucléotidique à partir de la position ${first}.`,
  );
  if (result.primary && !result.indel) {
    const p = result.primary;
    lines.push(
      en
        ? `This changes the codon from ${p.normalCodon} to ${p.mutantCodon}.`
        : `Le codon passe de ${p.normalCodon} à ${p.mutantCodon}.`,
    );
  }
  if (result.indel) {
    lines.push(
      en
        ? `A block of ${result.indel.length} nucleotide(s) is ${result.indel.kind === 'insertion' ? 'added at' : 'removed at'} position ${result.indel.at}.`
        : `Un bloc de ${result.indel.length} nucléotide(s) est ${result.indel.kind === 'insertion' ? 'ajouté à' : 'retiré à'} la position ${result.indel.at}.`,
    );
  }
  if (c === 'silent') {
    lines.push(
      en
        ? 'The nucleotide substitution changes the codon but does not change the encoded amino acid.'
        : 'La substitution nucléotidique change le codon mais ne change pas l’acide aminé codé.',
    );
  } else if (c === 'missense') {
    const p = result.primary;
    if (p) {
      lines.push(
        en
          ? `As a result, the corresponding amino acid changes from ${p.normalAA} to ${p.mutantAA}. Therefore, the mutation modifies the amino acid sequence of the protein.`
          : `L’acide aminé correspondant passe donc de ${p.normalAA} à ${p.mutantAA}. La mutation modifie donc la séquence d’acides aminés de la protéine.`,
      );
    }
  } else if (c === 'nonsense') {
    lines.push(
      en
        ? 'The mutation generates a premature stop codon, causing translation to terminate earlier and producing a shorter protein.'
        : 'La mutation génère un codon stop prématuré, ce qui interrompt la traduction plus tôt et produit une protéine plus courte.',
    );
  } else if (c === 'frameshift') {
    lines.push(
      en
        ? 'The insertion or deletion shifts the reading frame, changing the downstream codons and therefore the resulting amino acid sequence.'
        : 'L’insertion ou la délétion décale le cadre de lecture, modifiant les codons en aval et donc la séquence d’acides aminés produite.',
    );
  } else {
    lines.push(
      en
        ? 'The insertion or deletion preserves the reading frame but adds or removes amino acids from the protein.'
        : 'L’insertion ou la délétion conserve le cadre de lecture mais ajoute ou retire des acides aminés de la protéine.',
    );
  }
  return lines.join(' ');
}

export function generateExamAnswer(result: ExerciseResult, lang: 'en' | 'fr'): string {
  const en = lang === 'en';
  const L = {
    transcription: en ? 'Transcription:' : 'Transcription :',
    translation: en ? 'Translation:' : 'Traduction :',
    comparison: en ? 'Comparison:' : 'Comparaison :',
    mutation: en ? 'Mutation:' : 'Mutation :',
    conclusion: en ? 'Conclusion:' : 'Conclusion :',
    normal: en ? 'Normal' : 'Normal',
    mutant: en ? 'Mutant' : 'Mutant',
    noMutation: en ? 'No nucleotide difference detected.' : 'Aucune différence nucléotidique détectée.',
  };
  const r = result;
  const out: string[] = [];
  out.push(`${L.transcription}\n${L.normal} -> ${r.normal.mrna}\n${L.mutant} -> ${r.mutant.mrna}`);
  out.push(`${L.translation}\n${L.normal} -> ${r.normal.oneLetter} (${r.normal.proteinLength} aa)\n${L.mutant} -> ${r.mutant.oneLetter} (${r.mutant.proteinLength} aa)`);
  if (r.classification === null) {
    out.push(`${L.comparison}\n${L.noMutation}`);
  } else {
    const parts: string[] = [];
    const sameLength = r.normal.dna.length === r.mutant.dna.length;
    if (r.primary && sameLength) {
      const nDnaCodons = splitCodons(r.normal.dna, r.frame);
      const mDnaCodons = splitCodons(r.mutant.dna, r.frame);
      const nDnaCodon = nDnaCodons[r.primary.codonIndex] ?? r.primary.normalCodon;
      const mDnaCodon = mDnaCodons[r.primary.codonIndex] ?? r.primary.mutantCodon;
      parts.push(`DNA: ${nDnaCodon} -> ${mDnaCodon} (pos. ${r.primary.dnaPosition})`);
      parts.push(`mRNA: ${r.primary.normalCodon} -> ${r.primary.mutantCodon}`);
      parts.push(`AA: ${r.primary.normalAA} -> ${r.primary.mutantAA}`);
    }
    if (r.indel) {
      parts.push(`${r.indel.kind} of ${r.indel.length} nt at position ${r.indel.at}${r.indel.frameshift ? ' (frameshift)' : ''}`);
    }
    out.push(`${L.comparison}\n${parts.join('\n')}`);
  }
  const classLabel = r.classification ?? (en ? 'identical' : 'identique');
  const mech = mutationMechanism(r);
  out.push(
    `${L.mutation}\n${classLabel}${mech ? `\n${en ? 'Mechanism' : 'Mécanisme'}: ${mech}` : ''}`,
  );
  out.push(`${L.conclusion}\n${generateExerciseAnalysis(result, lang)}`);
  return out.join('\n\n');
}
