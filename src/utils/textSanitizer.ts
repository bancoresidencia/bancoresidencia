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
export function sanitizeMedicalText(rawText: string | null | undefined): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Eliminação cirúrgica imediata de caracteres invisíveis e controle zero-width
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
    .replace(/Estrategista,?\s*/gi, '')
    .replace(/estrat[ée]gia\s*med/gi, 'Base Médica Teórica')
    .replace(/estrat[ée]gia\s*vestibulares/gi, 'Base Teórica')
    .replace(/estrat[ée]gia/gi, 'Literatura Oficial');

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
    .replace(/<[^>]+>/g, ''); // Expurga todas as outras tags HTML (<span...>, <font...>, etc.)

  // 9. Converter Códigos LaTeX e Delimitadores Matemáticos Comuns
  text = text
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
    .replace(/\\text\{([^}]+)\}/g, '$1')
    // Cifrões isolados ao redor de valores simples ($20$, $4 mm$)
    .replace(/\$([a-zA-Z0-9_\-±≤≥%°/,.\s]+)\$/g, '$1');

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
    .replace(/\bPaO2\b/g, 'PaO₂')
    .replace(/\bPaCO2\b/g, 'PaCO₂')
    .replace(/\bFiO2\b/g, 'FiO₂')
    .replace(/\bSaO2\b/g, 'SaO₂')
    .replace(/\bSpO2\b/g, 'SpO₂')
    .replace(/\bSatO2\b/g, 'SatO₂')
    .replace(/\bSO2\s*(\d{1,3}%)/gi, 'SO₂ $1')
    .replace(/\bHCO3\b/g, 'HCO₃')
    .replace(/\bEtCO2\b/g, 'EtCO₂')
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

  return text;
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
    processedText = processedText
      .replace(/\u00A0/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
      .replace(/[ \t]{2,}/g, ' ');
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
