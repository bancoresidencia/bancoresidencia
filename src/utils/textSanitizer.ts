import React from 'react';

/**
 * Sanitiza e normaliza textos médicos de questões, eliminando:
 * - Entidades HTML (&#39;, &nbsp;, &quot;, &gt;, numéricas decimais/hexadecimais, etc.)
 * - Marcas d'água legadas de Telegram (T.ME, MEDOPEN, ACERVO GRATUITO)
 * - Cabeçalhos de apostilas e paginação de PDFs (Extensivo - Cirurgia 115/265)
 * - Menções a concorrentes (Estratégia, Sanar, etc.)
 * - LaTeX cru comum e fórmulas quebradas ($\le$, $\ge$, $\beta$, \times, etc.)
 * - Operadores de digitação informais (>=, <=, ->, +/-)
 * - Unidades físicas e gases arteriais sem sub/sobrescrito (kg/m2, cm3, PaO2)
 * - Tags HTML de bloco soltas (<p>, <div>, etc.)
 */
export function sanitizeMedicalText(rawText: string | null | undefined): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Decodificar Entidades HTML (Numéricas decimais, hexadecimais e nomeadas)
  try {
    text = text
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = Number(dec);
        return code >= 32 && code <= 65535 ? String.fromCharCode(code) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        return code >= 32 && code <= 65535 ? String.fromCharCode(code) : '';
      });
  } catch {
    // Fallback silencioso caso ocorra erro inesperado de faixa de caractere
  }

  text = text
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&ge;/g, '≥')
    .replace(/&le;/g, '≤')
    .replace(/&plusmn;/g, '±')
    .replace(/&deg;/g, '°')
    .replace(/&middot;/g, '·')
    .replace(/&times;/g, '×')
    .replace(/&micro;/g, 'µ');

  // 2. Remover Marcas de Água de Telegram e Paginação de Apostilas
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

  // 3. Remover Resíduos de IA / Prompts / Templates
  text = text
    .replace(/\[(?:RESPOSTA|JUSTIFICATIVA|COMENTÁRIO|GABARITO)\]/gi, '')
    .replace(/```(?:markdown)?/g, '')
    .replace(/Como inteligência artificial[^\n]*/gi, '');

  // 4. Normalizar Tags HTML residuais
  text = text
    .replace(/<\/?(?:p|div|section)\b[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b\b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em\b[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i\b[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<\/?span\b[^>]*>/gi, '');

  // 5. Converter Códigos LaTeX e Delimitadores Matemáticos Comuns
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
    .replace(/\bcm3\b/g, 'cm³')
    .replace(/\bmm3\b/g, 'mm³')
    .replace(/\bm2\b/g, 'm²')
    .replace(/\bPaO2\b/g, 'PaO₂')
    .replace(/\bPaCO2\b/g, 'PaCO₂')
    .replace(/\bFiO2\b/g, 'FiO₂')
    .replace(/\bSaO2\b/g, 'SaO₂')
    .replace(/\bSpO2\b/g, 'SpO₂')
    .replace(/\bHCO3\b/g, 'HCO₃');

  // 8. Normalizar Quebras de Linha e Espaçamentos Residuais
  text = text
    .replace(/[ \t]{2,}/g, ' ')
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
  const processedText = shouldSanitize ? sanitizeMedicalText(text) : text;
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
