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

interface CachedGuidelineDoc {
  id: string;
  file: string;
  title: string;
  sourceUrl?: string;
  maxYear: number;
  raw: string;
  contentLower: string;
  paragraphs: string[];
}

let cachedGuidelinesIndex: CachedGuidelineDoc[] | null = null;

function loadGuidelinesIndex(baseDir: string): CachedGuidelineDoc[] {
  if (cachedGuidelinesIndex) {
    return cachedGuidelinesIndex;
  }

  const docs: CachedGuidelineDoc[] = [];

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

      // Extração de ano para priorização temporal
      const yearMatches = raw.match(/\b(202[0-6]|201[5-9])\b/g);
      let maxYear = 2020;
      if (yearMatches && yearMatches.length > 0) {
        const validYears = yearMatches.map(y => parseInt(y, 10)).filter(y => y >= 2015 && y <= 2026);
        if (validYears.length > 0) {
          maxYear = Math.max(...validYears);
        }
      }

      const paragraphs = raw.split(/\n\n+/);

      docs.push({
        id: file.replace('.md', ''),
        file,
        title,
        sourceUrl,
        maxYear,
        raw,
        contentLower,
        paragraphs
      });
    }

    cachedGuidelinesIndex = docs;
  } catch (err) {
    console.warn('[GuidelinesKnowledgeService] Erro ao carregar índice de diretrizes locais:', err);
  }

  return docs;
}

export const guidelinesKnowledgeService = {
  /**
   * Limpa o cache em memória das diretrizes para recarga
   */
  clearCache(): void {
    cachedGuidelinesIndex = null;
  },

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
    const { foco, tema, maxChunks = 4 } = params;
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
      const docs = loadGuidelinesIndex(baseDir);

      for (const doc of docs) {
        // Cálculo de pontuação de relevância temática
        let matchCount = 0;
        for (const term of searchTerms) {
          if (doc.contentLower.includes(term)) {
            matchCount += (doc.contentLower.match(new RegExp(term, 'g')) || []).length;
          }
        }

        if (matchCount === 0) continue;

        // Pontuação ponderada: relevância de conteúdo * peso da recência
        // Diretrizes de 2024-2026 ganham multiplicador de peso
        const recencyMultiplier = doc.maxYear >= 2024 ? 2.0 : doc.maxYear >= 2022 ? 1.5 : 1.0;
        const score = matchCount * recencyMultiplier;

        // Extrai os trechos clínicos mais pertinentes
        // Prioriza seções que contenham palavras-chave de conduta, diagnóstico e tratamento
        const relevantParagraphs = doc.paragraphs.filter(p => {
          const pl = p.toLowerCase();
          return searchTerms.some(t => pl.includes(t)) &&
            (pl.includes('tratamento') || pl.includes('conduta') || pl.includes('diagnóstic') ||
             pl.includes('dose') || pl.includes('recomend') || pl.includes('guideline') || pl.includes('consenso') || pl.includes('indica'));
        });

        const snippet = relevantParagraphs.slice(0, 3).join('\n\n') || doc.paragraphs.slice(0, 3).join('\n\n');

        matchedFiles.push({
          id: doc.id,
          title: doc.title,
          year: doc.maxYear,
          sourceType: 'DIRETRIZ_OFICIAL',
          sourceUrl: doc.sourceUrl,
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
