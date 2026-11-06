/**
 * Utilitário de Esteganografia Forense com Caracteres de Largura Zero (Zero-Width Watermarking)
 * Banco Residência Médica
 * 
 * Permite injetar silenciosamente a identidade do aluno (userId/email) dentro de
 * comentários e justificativas de questões sem afetar o layout visual ou KaTeX.
 * Se o material for raspado, copiado ou vazado, o autor da extração pode ser decodificado.
 */

const ZW_ZERO = '\u200B'; // Zero-Width Space (Bit 0)
const ZW_ONE = '\u200C';  // Zero-Width Non-Joiner (Bit 1)
const ZW_START = '\u200D\uFEFF'; // Delimitador de início
const ZW_END = '\uFEFF\u200D';   // Delimitador de fim

/**
 * Injeta uma marca d'água forense invisível no texto.
 */
export function injectZeroWidthWatermark(text: string, userId: string): string {
  if (!text || typeof text !== 'string' || !userId || typeof userId !== 'string') {
    return text || '';
  }

  // Previne injeção duplicada
  if (text.includes(ZW_START)) {
    return text;
  }

  try {
    // Converte userId para sequência binária (UTF-8)
    const encoder = new TextEncoder();
    const bytes = encoder.encode(userId.trim());
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += bytes[i].toString(2).padStart(8, '0');
    }

    const encoded = binary
      .split('')
      .map((bit) => (bit === '1' ? ZW_ONE : ZW_ZERO))
      .join('');

    const watermarkTag = `${ZW_START}${encoded}${ZW_END}`;

    // Injeta após a primeira quebra de linha ou após os 2 primeiros caracteres
    const firstNewline = text.indexOf('\n');
    if (firstNewline > 0 && firstNewline < 100) {
      return text.slice(0, firstNewline + 1) + watermarkTag + text.slice(firstNewline + 1);
    }

    return text.length > 2
      ? text.slice(0, 2) + watermarkTag + text.slice(2)
      : watermarkTag + text;
  } catch {
    return text;
  }
}

/**
 * Decodifica a marca d'água invisível de um texto vazado/copiado para auditoria forense.
 */
export function decodeZeroWidthWatermark(text: string): { userId?: string } | null {
  if (!text || typeof text !== 'string') return null;

  const startIdx = text.indexOf(ZW_START);
  const endIdx = text.indexOf(ZW_END);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  try {
    const rawBits = text.slice(startIdx + ZW_START.length, endIdx);
    let binary = '';
    for (let i = 0; i < rawBits.length; i++) {
      const ch = rawBits[i];
      if (ch === ZW_ONE) binary += '1';
      else if (ch === ZW_ZERO) binary += '0';
    }

    if (binary.length === 0 || binary.length % 8 !== 0) {
      return null;
    }

    const byteList: number[] = [];
    for (let i = 0; i < binary.length; i += 8) {
      const byteStr = binary.slice(i, i + 8);
      byteList.push(parseInt(byteStr, 2));
    }

    const decoder = new TextDecoder();
    const decoded = decoder.decode(new Uint8Array(byteList));
    return { userId: decoded };
  } catch {
    return null;
  }
}
