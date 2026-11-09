import { DatabaseSync } from 'node:sqlite';
import path from 'path';

function sanitizeText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Eliminação cirúrgica de caracteres invisíveis e controle zero-width
  text = text.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '');

  // 2. Normalizar espaços insecáveis Unicode (\u00A0)
  text = text.replace(/\u00A0/g, ' ');

  // 3. Entidades HTML duplamente escapadas
  text = text
    .replace(/&amp;nbsp;/gi, ' ')
    .replace(/&amp;lt;/gi, '<')
    .replace(/&amp;gt;/gi, '>')
    .replace(/&amp;quot;/gi, '"')
    .replace(/&amp;apos;|&amp;#0*39;/gi, "'")
    .replace(/&amp;amp;/gi, '&');

  // 4. Entidades HTML Numéricas
  try {
    text = text
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = Number(dec);
        if (code === 160) return ' ';
        if (code === 8203 || code === 8204 || code === 8205 || code === 65279 || code === 8288) return '';
        return code >= 32 && code <= 65535 ? String.fromCharCode(code) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        if (code === 0xA0) return ' ';
        if (code === 0x200B || code === 0x200C || code === 0x200D || code === 0xFEFF || code === 0x2060) return '';
        return code >= 32 && code <= 65535 ? String.fromCharCode(code) : '';
      });
  } catch {
    // Fallback
  }

  // 5. Entidades HTML Nomeadas
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

  // 6. Remover marcas residuais de concorrentes e apostilas
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

  // 7. Normalizar Tags HTML residuais para Markdown e quebras limpas
  text = text
    .replace(/<\/?(?:p|div|section|article|header|footer)\b[^>]*>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/(?:ul|ol|li)\b[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**')
    .replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
    .replace(/<[^>]+>/g, '');

  // 8. Normalização final de quebras de linha e espaçamentos
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

const dbPath = path.resolve('data/questoes_132k.db');
console.log('Abrindo banco SQLite:', dbPath);
const db = new DatabaseSync(dbPath);

console.log('Iniciando varredura e sanitização das 132k questões...');

const updateStmt = db.prepare(`
  UPDATE questions 
  SET statement = ?, options = ?, commentary = ?
  WHERE id = ?
`);

const hasResidue = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.includes('\u00A0') ||
         str.includes('&nbsp;') ||
         /[\u200B-\u200D\uFEFF\u2060]/.test(str) ||
         /&lt;|&gt;|&amp;|&quot;|&#39;|<[a-zA-Z\/][^>]*>/.test(str);
};

const rows = db.prepare('SELECT id, statement, options, commentary FROM questions').all();
console.log(`Total de questões carregadas: ${rows.length}`);

let updatedCount = 0;

db.exec('BEGIN TRANSACTION;');

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  let changed = false;

  let newStatement = row.statement;
  if (hasResidue(row.statement)) {
    const cleaned = sanitizeText(row.statement);
    if (cleaned !== row.statement) {
      newStatement = cleaned;
      changed = true;
    }
  }

  let newCommentary = row.commentary;
  if (hasResidue(row.commentary)) {
    const cleaned = sanitizeText(row.commentary);
    if (cleaned !== row.commentary) {
      newCommentary = cleaned;
      changed = true;
    }
  }

  let newOptions = row.options;
  if (typeof row.options === 'string' && hasResidue(row.options)) {
    try {
      const parsed = JSON.parse(row.options);
      if (Array.isArray(parsed)) {
        let optChanged = false;
        const cleanedOpts = parsed.map(opt => {
          let itemChanged = false;
          let newOptText = opt.text;
          let newOptExp = opt.explanation;
          if (hasResidue(opt.text)) {
            newOptText = sanitizeText(opt.text);
            itemChanged = true;
          }
          if (hasResidue(opt.explanation)) {
            newOptExp = sanitizeText(opt.explanation);
            itemChanged = true;
          }
          if (itemChanged) {
            optChanged = true;
            const res = { ...opt, text: newOptText };
            if (newOptExp !== undefined) res.explanation = newOptExp;
            return res;
          }
          return opt;
        });
        if (optChanged) {
          newOptions = JSON.stringify(cleanedOpts);
          changed = true;
        }
      }
    } catch {
      // String simples
      const cleaned = sanitizeText(row.options);
      if (cleaned !== row.options) {
        newOptions = cleaned;
        changed = true;
      }
    }
  }

  if (changed) {
    updateStmt.run(newStatement, newOptions, newCommentary, row.id);
    updatedCount++;
  }

  if (i > 0 && i % 25000 === 0) {
    console.log(`  Processadas: ${i}/${rows.length} | Atualizadas com sucesso: ${updatedCount}`);
  }
}

db.exec('COMMIT;');

console.log(`\n🎉 Sanitização concluída com sucesso no SQLite!`);
console.log(`Total de questões limpas e atualizadas: ${updatedCount} de ${rows.length}`);
