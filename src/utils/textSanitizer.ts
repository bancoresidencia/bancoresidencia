import React from 'react';

/**
 * Sanitiza e normaliza textos médicos de questões, eliminando:
 * - Resíduos de espaço insecável (\u00A0, &nbsp;) -> espaço comum ASCII 0x20
 * - Caracteres invisíveis de largura zero (\u200B ZWSP, \u200C ZWNJ, \u200D ZWJ, \uFEFF BOM, \u2060 Word Joiner)
 * - Tags HTML escapadas e entidades (&lt;p&gt;, &amp;, &quot;, &#39;, <br/>, <b>, <i>, etc.)
 * - Marcas d'água legadas de Telegram (T.ME, MEDOPEN, ACERVO GRATUITO)
 * - Cabeçalhos de apostilas e paginação de PDFs (Extensivo - Cirurgia 115/265)
 * - Menções a concorrentes (Estratégia, Sanar, etc.)
 * - LaTeX cru comum e fórmulas quebradas ($\le$, $\ge$, $\beta$, \times, etc.)
 * - Operadores de digitação informais (>=, <=, ->, +/-)
 * - Unidades físicas e gases arteriais sem sub/sobrescrito (kg/m2, cm3, PaO2)
 */
const FORENSIC_WATERMARK_REGEX = /\u200D\uFEFF[\u200B\u200C]+\uFEFF\u200D/;

export interface UnpackedCommentaryOption {
  letter?: string;
  text?: string;
  explanation?: string;
  justification?: string;
  [key: string]: unknown;
}

/**
 * Desempacota comentários legados armazenados como JSON bruto
 * (`{"_id": "...", "statementComment": "...", "alternativesComments": [...]}`)
 * em comentário limpo do enunciado + justificativas individuais por alternativa.
 */
export function unpackStructuredCommentary(
  rawCommentary: string | null | undefined,
  rawOptions?: unknown[] | null
): { commentary: string; options: unknown[] } {
  const safeOptions = Array.isArray(rawOptions) ? rawOptions : [];
  if (!rawCommentary || typeof rawCommentary !== 'string') {
    return { commentary: '', options: safeOptions };
  }

  const trimmed = rawCommentary.trim();
  if (trimmed.startsWith('{') && trimmed.includes('"statementComment"')) {
    try {
      const parsed = JSON.parse(trimmed) as {
        statementComment?: unknown;
        alternativesComments?: unknown;
      };
      const stmtComment =
        typeof parsed.statementComment === 'string' ? parsed.statementComment : '';
      const altComments = Array.isArray(parsed.alternativesComments)
        ? parsed.alternativesComments
        : [];

      const enrichedOptions = safeOptions.map((opt, idx) => {
        if (!opt || typeof opt !== 'object') return opt;
        const optObj = opt as UnpackedCommentaryOption;
        const existingExpl =
          (typeof optObj.explanation === 'string' && optObj.explanation.trim()) ||
          (typeof optObj.justification === 'string' && optObj.justification.trim());
        if (existingExpl) return optObj;

        const rawAltComm = altComments[idx];
        if (typeof rawAltComm === 'string' && rawAltComm.trim()) {
          const strippedPrefix = rawAltComm
            .trim()
            .replace(/^[A-Ea-e]\s*\)\s*/, '');
          return {
            ...optObj,
            explanation: strippedPrefix
          };
        }
        return optObj;
      });

      return {
        commentary: stmtComment,
        options: enrichedOptions
      };
    } catch {
      // Se JSON estiver truncado, segue fluxo normal de sanitização
    }
  }

  return { commentary: rawCommentary, options: safeOptions };
}

const SANITIZE_CACHE_MAX = 500;
const sanitizeCache = new Map<string, string>();

export function sanitizeMedicalText(rawText: string | null | undefined): string {
  if (!rawText || typeof rawText !== 'string') return '';

  const cached = sanitizeCache.get(rawText);
  if (cached !== undefined) return cached;

  // Preserva marca d'água forense invisível (\u200D\uFEFF...\uFEFF\u200D) contra remoção acidental no cliente
  const existingWatermark = rawText.match(FORENSIC_WATERMARK_REGEX)?.[0] || '';
  let text = existingWatermark ? rawText.replace(FORENSIC_WATERMARK_REGEX, '') : rawText;

  // 0. Desempacotar JSON legado {"_id":..., "statementComment":...} caso invocado diretamente
  const trimmedCandidate = text.trim();
  if (trimmedCandidate.startsWith('{') && trimmedCandidate.includes('"statementComment"')) {
    try {
      const parsed = JSON.parse(trimmedCandidate) as { statementComment?: unknown };
      if (typeof parsed.statementComment === 'string') {
        text = parsed.statementComment;
      }
    } catch {
      // Fallback seguro
    }
  }

  // 1. Eliminação cirúrgica imediata de caracteres invisíveis e controle zero-width avulsos
  // (\u200B ZWSP, \u200C ZWNJ, \u200D ZWJ, \uFEFF BOM, \u2060 Word Joiner)
  text = text.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '');

  // 2. Normalizar espaços insecáveis Unicode (\u00A0) para espaço ASCII comum
  text = text.replace(/\u00A0/g, ' ');

  // 3. Tratar entidades HTML duplamente escapadas recorrentes em bancos de dados
  text = text
    .replace(/&amp;nbsp;/gi, ' ')
    .replace(/&amp;lt;/gi, '<')
    .replace(/&amp;gt;/gi, '>')
    .replace(/&amp;quot;/gi, '"')
    .replace(/&amp;apos;|&amp;#0*39;/gi, "'")
    .replace(/&amp;amp;/gi, '&');

  // 4. Decodificar Entidades HTML Numéricas (decimais e hexadecimais)
  try {
    text = text
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = Number(dec);
        if (code === 160) return ' '; // &nbsp;
        if (code === 8203 || code === 8204 || code === 8205 || code === 65279 || code === 8288) return ''; // ZWSP/BOM/WJ
        return code >= 32 && code <= 65535 ? String.fromCharCode(code) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        if (code === 0xA0) return ' '; // &nbsp;
        if (code === 0x200B || code === 0x200C || code === 0x200D || code === 0xFEFF || code === 0x2060) return '';
        return code >= 32 && code <= 65535 ? String.fromCharCode(code) : '';
      });
  } catch {
    // Fallback silencioso
  }

  // 5. Decodificar Entidades HTML Nomeadas
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&amp;/gi, '&')
    .replace(/&ge;/gi, '≥')
    .replace(/&le;/gi, '≤')
    .replace(/&plusmn;/gi, '±')
    .replace(/&deg;/gi, '°')
    .replace(/&middot;/gi, '·')
    .replace(/&times;/gi, '×')
    .replace(/&micro;/gi, 'µ');

  // 6. Remover Marcas de Água de Telegram e Paginação de Apostilas
  text = text
    .replace(/T\.ME(?:\/[^\s]*)?/gi, '')
    .replace(/MEDOPEN\s*-\s*ACERVO\s*MÉDICO\s*GRATUITO/gi, '')
    .replace(/MEDOPEN/gi, '')
    .replace(/ACERVO\s*MÉDICO\s*GRATUITO/gi, '')
    .replace(/Extensivo\s*-\s*[A-Za-zÀ-ÿ\s]+\s*\t?\d+\/\d+/gi, '')
    .replace(/\d+\.\s*[A-Za-zÀ-ÿ\s]+-\s*Parte\s+[IVX]+/gi, '')
    .replace(/Fala,\s*Estrategista!?\s*/gi, '')
    .replace(/Caro\s*estrategista,?\s*/gi, '')
    .replace(/Olá,?\s*estrategista!?\s*/gi, '')
    .replace(/\bEstrategista,?\s*/gi, '')
    .replace(/^Olá,?\s*estudante!?\s*/i, '')
    .replace(/\bestrat[ée]gia\s*med\b|\bestrategiamed\b/gi, 'Base Médica Teórica')
    .replace(/\bestrat[ée]gia\s*(?:vestibulares|concursos|militares)\b/gi, 'Base Teórica')
    .replace(/\(\s*ProvaDeResidencia\s*\)|\bProvaDeResidencia\b/gi, '')
    .replace(/\bnão\s+houveram\s+(atualizações|mudanças|alterações)\b/gi, 'Não houve $1');

  // 7. Remover Resíduos de IA / Prompts / Templates
  text = text
    .replace(/\[(?:RESPOSTA|JUSTIFICATIVA|COMENTÁRIO|GABARITO)\]/gi, '')
    .replace(/```(?:markdown)?/g, '')
    .replace(/Como inteligência artificial[^\n]*/gi, '');

  // 8. Normalizar Tags HTML residuais e converter para Markdown / Quebras Semânticas
  text = text
    .replace(/<\/?(?:p|div|section|article|header|footer)\b[^>]*>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/(?:ul|ol|li)\b[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**')
    .replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
    .replace(/<\/?[a-zA-Z!][^>]*>/g, ''); // Expurga todas as outras tags HTML (<span...>, <font...>, etc.) sem comer operadores <= / ->

  // 9. Converter Códigos LaTeX e Delimitadores Matemáticos Comuns
  text = text
    // Setas e operadores LaTeX
    .replace(/\$\s*\\rightarrow\s*\$|\\rightarrow\b|\$\s*\\to\s*\$|\\to\b/g, '→')
    .replace(/\$\s*\\leftarrow\s*\$|\\leftarrow\b/g, '←')
    // Menor ou igual / Maior ou igual
    .replace(/\$\s*\\le\s*\$|\\le\b|\$\s*\\leq\s*\$|\\leq\b/g, '≤')
    .replace(/\$\s*\\ge\s*\$|\\ge\b|\$\s*\\geq\s*\$|\\geq\b/g, '≥')
    // Letras Gregas em hormônios e exames
    .replace(/\$\s*\\beta\s*\$|\\beta\b/g, 'β')
    .replace(/\$\s*\\alpha\s*\$|\\alpha\b/g, 'α')
    .replace(/\$\s*\\gamma\s*\$|\\gamma\b/g, 'γ')
    .replace(/\$\s*\\delta\s*\$|\\delta\b/g, 'δ')
    .replace(/\$\s*\\Delta\s*\$|\\Delta\b/g, 'Δ')
    .replace(/\$\s*\\mu\s*\$|\\mu\b/g, 'µ')
    // Símbolos matemáticos comuns
    .replace(/\$\s*\\times\s*\$|\\times\b/g, '×')
    .replace(/\$\s*\\approx\s*\$|\\approx\b/g, '≈')
    .replace(/\$\s*\\pm\s*\$|\\pm\b/g, '±')
    .replace(/1x\\dia\b/g, '1x/dia')
    // Íons e Bioquímica
    .replace(/\$Ca\^\{2\+\}\$|Ca\^\{2\+\}/g, 'Ca²⁺')
    .replace(/\$Fe\^\{3\+\}\$|Fe\^\{3\+\}/g, 'Fe³⁺')
    .replace(/\$Fe\^\{2\+\}\$|Fe\^\{2\+\}/g, 'Fe²⁺')
    .replace(/\$I_f\$|I_f\b/g, 'If')
    .replace(/\^\s*\{\s*\\circ\s*\}|\^\s*\\circ/g, '°')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    // Descascar cifrões envolvendo qualquer conteúdo de fórmula matemática inline ($...$)
    .replace(/\$([^\$\n\r]+?)\$/g, '$1')
    // Limpar cifrão residual colado em letras (ex: $pH -> pH)
    .replace(/\$([a-zA-ZÀ-ÿ])/g, '$1');

  // 6. Converter Operadores de Digitação Informais
  text = text
    .replace(/\s*>=\s*/g, ' ≥ ')
    .replace(/\s*<=\s*/g, ' ≤ ')
    .replace(/\s*->\s*|\s*=>\s*/g, ' → ')
    .replace(/\s*\+\/-\s*/g, ' ± ');

  // 7. Formatar Unidades Físicas e Fisiologia Arterial
  text = text
    .replace(/\bkg\/m2\b/g, 'kg/m²')
    .replace(/(\d+)\s*cm3\b|\bcm3\b/g, (_, n) => n ? `${n} cm³` : 'cm³')
    .replace(/(\d+)\s*mm3\b|\bmm3\b/g, (_, n) => n ? `${n} mm³` : 'mm³')
    .replace(/(\d+)\s*m2\b|\bm2\b/g, (_, n) => n ? `${n} m²` : 'm²')
    .replace(/\b([pP][aAvV]?|[Ff][iI])O[_]?2\b/g, '$1O₂')
    .replace(/\b([pP][aAvV]?|[Ee]t)CO[_]?2\b/g, '$1CO₂')
    .replace(/\b([Ss][apAP]?)O[_]?2\b/g, '$1O₂')
    .replace(/\bSO2\s*(\d{1,3}%)/gi, 'SO₂ $1')
    .replace(/\bHCO3\b/g, 'HCO₃')
    .replace(/\bH2O\b/g, 'H₂O');

  // 8. Correção Cirúrgica de Erros de OCR/CMap em Temperaturas e Indicadores Ordinais (° e º)
  text = text
    // 8.1 Temperaturas com '0' em vez de '°' (ex.: T=390C, febre (T: 380 C), à 370C, 36 0C, 39-40 0C)
    .replace(/(\bT\s*[:=]\s*|\bTax\s*[:=]?\s*|\btemperatura\s*(?:axilar\s*)?(?:de\s*)?|\bfebre\s*(?:de\s*)?|\bfebril\s*com\s*|[àa]\s+)(3[4-9]|4[0-3])0\s*°?\s*C\b/gi, '$1$2°C')
    .replace(/\b(3[4-9]|4[0-3])0\s*°?\s*C\b/g, '$1°C')
    .replace(/\b(3[4-9]|4[0-3])\s+0\s*C\b/g, '$1°C')
    // 8.2 Temperaturas decimais corrompidas (ex.: 37,50C -> 37,5°C, 38.50C -> 38,5°C)
    .replace(/\b(3[4-9]|4[0-3])([,\.]\d)0\s*°?\s*C\b/g, (_, intP, decP) => `${intP}${decP.replace('.', ',')}°C`)
    // 8.3 Temperaturas com letra 'o' ou 'O' em vez de '°' (ex.: 38oC, 39o C, 40 oC, 38OC)
    .replace(/\b(3[4-9]|4[0-3])([,\.]\d)?\s*[oO]\s*C\b/g, (_, intP, decP) => `${intP}${decP ? decP.replace('.', ',') : ''}°C`)
    // 8.4 Indicadores ordinais masculinos com '0' por OCR (ex.: '150 dia pós', '20 grau', 'no 10 dia')
    .replace(/\b150\s+dia\s+(pós|de)/gi, '15º dia $1')
    .replace(/\b([1234])0\s+grau\b/gi, '$1º grau')
    .replace(/\b(no|ao|do|o|pelo)\s+([1-9])0\s+(dia|trimestre|mês|ano)\b/gi, '$1 $2º $3')
    // 8.5 Indicadores ordinais com letra 'o' (ex.: 1o dia, 2o trimestre, 1o grau, 5o dia, 40o dia)
    .replace(/\b(\d{1,3})\s*[oO]\s+(dia|trimestre|grau|mês|ano|tempo|lugar|episódio|ciclo|parto|período|estágio|minuto|semestre|passo|nível|plano|pós|horário)\b/gi, '$1º $2')
    // 8.6 Indicadores ordinais femininos com 'a' (ex.: 1a escolha, 2a linha, 1a dose, 1a semana)
    .replace(/\b([1-9]|10)\s*a\s+(escolha|linha|dose|gestação|fase|vez|semana|hora|infância|intenção|tentativa|consulta|avaliação|etapa|opção|geração|posologia)\b/gi, '$1ª $2');

  // 12. Normalizar Quebras de Linha, Espaços Insecáveis e Resíduos Finais
  text = text
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const result = (existingWatermark && text.length > 0)
    ? (text.length > 2 ? text.slice(0, 2) + existingWatermark + text.slice(2) : existingWatermark + text)
    : text;

  if (rawText.length <= 16000) {
    if (sanitizeCache.size >= SANITIZE_CACHE_MAX) {
      const oldestKey = sanitizeCache.keys().next().value;
      if (oldestKey !== undefined) sanitizeCache.delete(oldestKey);
    }
    sanitizeCache.set(rawText, result);
  }

  return result;
}

/**
 * Renderizador nativo React que interpreta:
 * - **negrito** -> <strong>
 * - *itálico* e _itálico_ -> <em>
 * - ***negrito+itálico*** -> <strong><em>
 * Aplicando sanitização médica prévia de forma transparente.
 */
export function renderFormattedMedicalText(
  text: string | null | undefined,
  options?: { boldColorClass?: string; enableSanitizer?: boolean }
): React.ReactNode {
  if (!text) return null;

  const shouldSanitize = options?.enableSanitizer !== false;
  let processedText = shouldSanitize ? sanitizeMedicalText(text) : text;
  // Blindagem defensiva: mesmo se desativado o sanitizador geral, nunca expor \u00A0 ou \u200B ao layout
  if (!shouldSanitize) {
    const wm = processedText.match(FORENSIC_WATERMARK_REGEX)?.[0] || '';
    const base = wm ? processedText.replace(FORENSIC_WATERMARK_REGEX, '') : processedText;
    const cleanedBase = base
      .replace(/\u00A0/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
      .replace(/[ \t]{2,}/g, ' ');
    processedText = wm && cleanedBase.length > 0
      ? (cleanedBase.length > 2 ? cleanedBase.slice(0, 2) + wm + cleanedBase.slice(2) : wm + cleanedBase)
      : cleanedBase;
  }
  const boldClass = options?.boldColorClass || 'font-bold text-slate-900 dark:text-white';

  const parseItalics = (str: string, parentKey: string | number) => {
    const italicParts = str.split(/(\*(?!\*)[^*\n]+?\*|_(?!_)[^_\n]+?_)/g);
    return italicParts.map((subPart, subIdx) => {
      const key = `${parentKey}-${subIdx}`;
      if (
        (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) ||
        (subPart.startsWith('_') && subPart.endsWith('_') && subPart.length > 2)
      ) {
        const inner = subPart.slice(1, -1).trim();
        if (inner) {
          return React.createElement('em', { key, className: 'italic font-medium' }, inner);
        }
      }
      return subPart;
    });
  };

  const boldParts = processedText.split(/(\*{3}.*?\*{3}|\*{2}.*?\*{2})/g);
  return boldParts.flatMap((part, index) => {
    if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
      return [
        React.createElement(
          'strong',
          { key: `bi-${index}`, className: boldClass },
          React.createElement('em', { className: 'italic font-medium' }, part.slice(3, -3).trim())
        ),
      ];
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return [
        React.createElement(
          'strong',
          { key: `b-${index}`, className: boldClass },
          parseItalics(part.slice(2, -2), `b-${index}`)
        ),
      ];
    }
    return parseItalics(part, `p-${index}`);
  });
}
