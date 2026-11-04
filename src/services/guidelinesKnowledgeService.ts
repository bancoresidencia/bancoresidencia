import fs from 'fs';
import path from 'path';

export interface RetrievedGuidelineChunk {
  id: string;
  title: string;
  year: number;
  sourceType: string;
  sourceUrl?: string;
  content: string;
  relevanceScore: number;
}

export const guidelinesKnowledgeService = {
  /**
   * Busca e ranqueia trechos das 1.337 diretrizes oficiais locais e 350 livros,
   * aplicando priorização temporal (consenso mais recente: 2024–2026 sobre consensos antigos).
   */
  async retrieveTopGuidelines(params: {
    especialidade: string;
    tema: string;
    foco: string;
    maxChunks?: number;
  }): Promise<{ formattedText: string; chunks: RetrievedGuidelineChunk[] }> {
    const { especialidade, tema, foco, maxChunks = 4 } = params;
    const baseDir = path.join(process.cwd(), 'data', 'knowledge', 'diretrizes_oficiais', 'markdown_docs');

    if (!fs.existsSync(baseDir)) {
      return { formattedText: '', chunks: [] };
    }

    const searchTerms = [
      foco.toLowerCase(),
      tema.toLowerCase(),
      ...foco.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    ];

    const matchedFiles: RetrievedGuidelineChunk[] = [];

    try {
      const files = fs.readdirSync(baseDir);

      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(baseDir, file);
        const stats = fs.statSync(filePath);
        // Evita ler arquivos gigantes desnecessariamente
        if (stats.size > 800 * 1024) continue;

        const raw = fs.readFileSync(filePath, 'utf-8');

        // Extrai frontmatter básico
        const titleMatch = raw.match(/titulo:\s*"([^"]+)"/i) || raw.match(/#\s+([^\n]+)/);
        const title = titleMatch ? titleMatch[1] : file;

        const urlMatch = raw.match(/url_original:\s*"([^"]+)"/i);
        const sourceUrl = urlMatch ? urlMatch[1] : undefined;

        const contentLower = raw.toLowerCase();

        // Cálculo de pontuação de relevância temática
        let matchCount = 0;
        for (const term of searchTerms) {
          if (contentLower.includes(term)) {
            matchCount += (contentLower.match(new RegExp(term, 'g')) || []).length;
          }
        }

        if (matchCount === 0) continue;

        // Extração de ano para priorização temporal
        const yearMatches = raw.match(/\b(202[0-6]|201[5-9])\b/g);
        let maxYear = 2020;
        if (yearMatches && yearMatches.length > 0) {
          const validYears = yearMatches.map(y => parseInt(y, 10)).filter(y => y >= 2015 && y <= 2026);
          if (validYears.length > 0) {
            maxYear = Math.max(...validYears);
          }
        }

        // Pontuação ponderada: relevância de conteúdo * peso da recência
        // Diretrizes de 2024-2026 ganham multiplicador de peso
        const recencyMultiplier = maxYear >= 2024 ? 2.0 : maxYear >= 2022 ? 1.5 : 1.0;
        const score = matchCount * recencyMultiplier;

        // Extrai os trechos clínicos mais pertinentes
        // Prioriza seções que contenham palavras-chave de conduta, diagnóstico e tratamento
        const paragraphs = raw.split(/\n\n+/);
        const relevantParagraphs = paragraphs.filter(p => {
          const pl = p.toLowerCase();
          return searchTerms.some(t => pl.includes(t)) &&
            (pl.includes('tratamento') || pl.includes('conduta') || pl.includes('diagnóstic') ||
             pl.includes('dose') || pl.includes('recomend') || pl.includes('guideline') || pl.includes('consenso') || pl.includes('indica'));
        });

        const snippet = relevantParagraphs.slice(0, 3).join('\n\n') || paragraphs.slice(0, 3).join('\n\n');

        matchedFiles.push({
          id: file.replace('.md', ''),
          title,
          year: maxYear,
          sourceType: 'DIRETRIZ_OFICIAL',
          sourceUrl,
          content: snippet.substring(0, 2500),
          relevanceScore: score
        });
      }
    } catch (err) {
      console.warn('[GuidelinesKnowledgeService] Erro ao buscar diretrizes locais:', err);
    }

    // Ordena os melhores matches pelo score ponderado
    const sorted = matchedFiles.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, maxChunks);

    const formattedText = sorted
      .map(
        c =>
          `[DIRETRIZ OFICIAL (${c.year}) - ${c.title}]\n(Fonte: ${c.sourceUrl || 'Repositório Oficial'})\n${c.content}`
      )
      .join('\n\n---\n\n');

    return {
      formattedText,
      chunks: sorted
    };
  }
};
