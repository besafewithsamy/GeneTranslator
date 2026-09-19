import type { AnalysisResult } from './biology';

export function toFASTA(result: AnalysisResult): string {
  return `>GeneTranslator_protein length=${result.proteinLength}\n${result.protein || '(no protein translated)'}`;
}

export function toTXT(result: AnalysisResult): string {
  const strandLines =
    result.kind === 'dna'
      ? [
          `DNA input (${result.inputSeq.length} nt): ${result.inputSeq}`,
          `RNA transcript: ${result.rna}`,
        ]
      : [
          `RNA (${result.rna.length} nt): ${result.rna}`,
          `cDNA: ${result.dna}`,
        ];
  const lines = [
    'GeneTranslator result',
    `Input: ${result.kind.toUpperCase()}`,
    ...strandLines,
    `Frame: +${result.frame}  ORF mode: ${result.requireStart ? 'from first AUG' : 'raw'}`,
    `Codons: ${result.codons.filter((c) => !c.skipped).map((c) => c.codon).join(' ')}`,
    `Protein (${result.proteinLength} aa): ${result.protein}`,
    `One-letter: ${result.oneLetter}`,
    `GC: ${result.gcContent}%  AU: ${result.auContent}%`,
    `Start: ${result.startCodon ?? 'none'}  Stop: ${result.stopCodon ?? 'none'}`,
  ];
  return lines.join('\n');
}

export function toJSON(result: AnalysisResult): string {
  return JSON.stringify(
    {
      kind: result.kind,
      input: result.inputSeq,
      rna: result.rna,
      dna: result.dna,
      frame: result.frame,
      requireStart: result.requireStart,
      codons: result.codons.filter((c) => !c.skipped).map((c) => c.codon),
      aminoAcids: result.acids,
      oneLetter: result.oneLetter,
      protein: result.protein,
      stats: {
        sequenceLength: result.rna.length,
        gcContent: result.gcContent,
        auContent: result.auContent,
        codonCount: result.codonCount,
        proteinLength: result.proteinLength,
        startCodon: result.startCodon,
        stopCodon: result.stopCodon,
        molecularWeight: result.molecularWeight,
      },
    },
    null,
    2,
  );
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
