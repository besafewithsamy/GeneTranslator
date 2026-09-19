export type CodonType = 'start' | 'stop' | 'normal';

export interface CodonInfo {
  codon: string;
  name: string;
  abbr: string;
  letter: string;
  type: CodonType;
}

export const CODON_TABLE: Record<string, CodonInfo> = {
  UUU: { codon: 'UUU', name: 'Phenylalanine', abbr: 'Phe', letter: 'F', type: 'normal' },
  UUC: { codon: 'UUC', name: 'Phenylalanine', abbr: 'Phe', letter: 'F', type: 'normal' },
  UUA: { codon: 'UUA', name: 'Leucine', abbr: 'Leu', letter: 'L', type: 'normal' },
  UUG: { codon: 'UUG', name: 'Leucine', abbr: 'Leu', letter: 'L', type: 'normal' },
  CUU: { codon: 'CUU', name: 'Leucine', abbr: 'Leu', letter: 'L', type: 'normal' },
  CUC: { codon: 'CUC', name: 'Leucine', abbr: 'Leu', letter: 'L', type: 'normal' },
  CUA: { codon: 'CUA', name: 'Leucine', abbr: 'Leu', letter: 'L', type: 'normal' },
  CUG: { codon: 'CUG', name: 'Leucine', abbr: 'Leu', letter: 'L', type: 'normal' },
  AUU: { codon: 'AUU', name: 'Isoleucine', abbr: 'Ile', letter: 'I', type: 'normal' },
  AUC: { codon: 'AUC', name: 'Isoleucine', abbr: 'Ile', letter: 'I', type: 'normal' },
  AUA: { codon: 'AUA', name: 'Isoleucine', abbr: 'Ile', letter: 'I', type: 'normal' },
  AUG: { codon: 'AUG', name: 'Methionine', abbr: 'Met', letter: 'M', type: 'start' },
  GUU: { codon: 'GUU', name: 'Valine', abbr: 'Val', letter: 'V', type: 'normal' },
  GUC: { codon: 'GUC', name: 'Valine', abbr: 'Val', letter: 'V', type: 'normal' },
  GUA: { codon: 'GUA', name: 'Valine', abbr: 'Val', letter: 'V', type: 'normal' },
  GUG: { codon: 'GUG', name: 'Valine', abbr: 'Val', letter: 'V', type: 'normal' },
  UCU: { codon: 'UCU', name: 'Serine', abbr: 'Ser', letter: 'S', type: 'normal' },
  UCC: { codon: 'UCC', name: 'Serine', abbr: 'Ser', letter: 'S', type: 'normal' },
  UCA: { codon: 'UCA', name: 'Serine', abbr: 'Ser', letter: 'S', type: 'normal' },
  UCG: { codon: 'UCG', name: 'Serine', abbr: 'Ser', letter: 'S', type: 'normal' },
  CCU: { codon: 'CCU', name: 'Proline', abbr: 'Pro', letter: 'P', type: 'normal' },
  CCC: { codon: 'CCC', name: 'Proline', abbr: 'Pro', letter: 'P', type: 'normal' },
  CCA: { codon: 'CCA', name: 'Proline', abbr: 'Pro', letter: 'P', type: 'normal' },
  CCG: { codon: 'CCG', name: 'Proline', abbr: 'Pro', letter: 'P', type: 'normal' },
  ACU: { codon: 'ACU', name: 'Threonine', abbr: 'Thr', letter: 'T', type: 'normal' },
  ACC: { codon: 'ACC', name: 'Threonine', abbr: 'Thr', letter: 'T', type: 'normal' },
  ACA: { codon: 'ACA', name: 'Threonine', abbr: 'Thr', letter: 'T', type: 'normal' },
  ACG: { codon: 'ACG', name: 'Threonine', abbr: 'Thr', letter: 'T', type: 'normal' },
  GCU: { codon: 'GCU', name: 'Alanine', abbr: 'Ala', letter: 'A', type: 'normal' },
  GCC: { codon: 'GCC', name: 'Alanine', abbr: 'Ala', letter: 'A', type: 'normal' },
  GCA: { codon: 'GCA', name: 'Alanine', abbr: 'Ala', letter: 'A', type: 'normal' },
  GCG: { codon: 'GCG', name: 'Alanine', abbr: 'Ala', letter: 'A', type: 'normal' },
  UAU: { codon: 'UAU', name: 'Tyrosine', abbr: 'Tyr', letter: 'Y', type: 'normal' },
  UAC: { codon: 'UAC', name: 'Tyrosine', abbr: 'Tyr', letter: 'Y', type: 'normal' },
  UAA: { codon: 'UAA', name: 'Stop', abbr: 'Stop', letter: '*', type: 'stop' },
  UAG: { codon: 'UAG', name: 'Stop', abbr: 'Stop', letter: '*', type: 'stop' },
  CAU: { codon: 'CAU', name: 'Histidine', abbr: 'His', letter: 'H', type: 'normal' },
  CAC: { codon: 'CAC', name: 'Histidine', abbr: 'His', letter: 'H', type: 'normal' },
  CAA: { codon: 'CAA', name: 'Glutamine', abbr: 'Gln', letter: 'Q', type: 'normal' },
  CAG: { codon: 'CAG', name: 'Glutamine', abbr: 'Gln', letter: 'Q', type: 'normal' },
  AAU: { codon: 'AAU', name: 'Asparagine', abbr: 'Asn', letter: 'N', type: 'normal' },
  AAC: { codon: 'AAC', name: 'Asparagine', abbr: 'Asn', letter: 'N', type: 'normal' },
  AAA: { codon: 'AAA', name: 'Lysine', abbr: 'Lys', letter: 'K', type: 'normal' },
  AAG: { codon: 'AAG', name: 'Lysine', abbr: 'Lys', letter: 'K', type: 'normal' },
  GAU: { codon: 'GAU', name: 'Aspartic acid', abbr: 'Asp', letter: 'D', type: 'normal' },
  GAC: { codon: 'GAC', name: 'Aspartic acid', abbr: 'Asp', letter: 'D', type: 'normal' },
  GAA: { codon: 'GAA', name: 'Glutamic acid', abbr: 'Glu', letter: 'E', type: 'normal' },
  GAG: { codon: 'GAG', name: 'Glutamic acid', abbr: 'Glu', letter: 'E', type: 'normal' },
  UGU: { codon: 'UGU', name: 'Cysteine', abbr: 'Cys', letter: 'C', type: 'normal' },
  UGC: { codon: 'UGC', name: 'Cysteine', abbr: 'Cys', letter: 'C', type: 'normal' },
  UGA: { codon: 'UGA', name: 'Stop', abbr: 'Stop', letter: '*', type: 'stop' },
  UGG: { codon: 'UGG', name: 'Tryptophan', abbr: 'Trp', letter: 'W', type: 'normal' },
  CGU: { codon: 'CGU', name: 'Arginine', abbr: 'Arg', letter: 'R', type: 'normal' },
  CGC: { codon: 'CGC', name: 'Arginine', abbr: 'Arg', letter: 'R', type: 'normal' },
  CGA: { codon: 'CGA', name: 'Arginine', abbr: 'Arg', letter: 'R', type: 'normal' },
  CGG: { codon: 'CGG', name: 'Arginine', abbr: 'Arg', letter: 'R', type: 'normal' },
  AGU: { codon: 'AGU', name: 'Serine', abbr: 'Ser', letter: 'S', type: 'normal' },
  AGC: { codon: 'AGC', name: 'Serine', abbr: 'Ser', letter: 'S', type: 'normal' },
  AGA: { codon: 'AGA', name: 'Arginine', abbr: 'Arg', letter: 'R', type: 'normal' },
  AGG: { codon: 'AGG', name: 'Arginine', abbr: 'Arg', letter: 'R', type: 'normal' },
  GGU: { codon: 'GGU', name: 'Glycine', abbr: 'Gly', letter: 'G', type: 'normal' },
  GGC: { codon: 'GGC', name: 'Glycine', abbr: 'Gly', letter: 'G', type: 'normal' },
  GGA: { codon: 'GGA', name: 'Glycine', abbr: 'Gly', letter: 'G', type: 'normal' },
  GGG: { codon: 'GGG', name: 'Glycine', abbr: 'Gly', letter: 'G', type: 'normal' },
};

export const STOP_CODONS = ['UAA', 'UAG', 'UGA'];
export const START_CODON = 'AUG';

export const ALL_CODONS: CodonInfo[] = Object.values(CODON_TABLE);

const ANTICODON_MAP: Record<string, string> = { A: 'U', U: 'A', G: 'C', C: 'G' };

export function anticodonFor(codon: string): string {
  return codon
    .split('')
    .reverse()
    .map((b) => ANTICODON_MAP[b] ?? b)
    .join('');
}
