import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';
import { FlashcardImportFormat } from '@/types/flashcards';

export interface ParsedImportCard {
  front: string;
  back: string;
  comment?: string;
  specialty?: string;
  theme?: string;
  focus?: string;
  subfocus?: string;
  deckId?: string;
  priority?: 'essential' | 'standard';
  studyDepth?: 'study' | 'review';
  tags?: string[];
  rawLineIndex?: number;
}

export interface ParsedImportResult {
  success: boolean;
  cards: ParsedImportCard[];
  detectedFormat: string;
  detectedDeckName?: string;
  message?: string;
}

/**
 * Limpa marcações HTML típicas do Anki preservando formatação semântica e quebras de linha
 */
export function cleanAnkiHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<u>(.*?)<\/u>/gi, '_$1_')
    .replace(/<[^>]+>/g, '') // remove tags restantes sem apagar chaves do cloze
    .replace(/\[sound:[^\]]+\]/gi, '') // remove referências a áudio anki
    .trim();
}

/**
 * Extrai os termos ocluídos de um cloze deletion {{c1::termo}} para servir como gabarito (verso)
 */
export function extractClozeBack(front: string): string {
  const matches: string[] = [];
  const regex = /\{\{c\d+::(.*?)(?:::.*?)?\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(front)) !== null) {
    if (match[1]) matches.push(cleanAnkiHtml(match[1]));
  }
  return matches.join(', ') || 'Oclusão Cloze';
}

/**
 * Extrator leve de ZIP em memória puro Node.js sem dependências externas
 */
export function parseZipEntries(buffer: Buffer): Record<string, Buffer> {
  let eocdOffset = -1;
  const maxSearch = Math.min(buffer.length, 65557);
  for (let i = buffer.length - 22; i >= buffer.length - maxSearch; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Arquivo compactado inválido: cabeçalho central ZIP/APKG não localizado.');
  }

  const cdOffset = buffer.readUInt32LE(eocdOffset + 16);
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const files: Record<string, Buffer> = {};

  let cur = cdOffset;
  for (let e = 0; e < totalEntries && cur < buffer.length - 46; e++) {
    if (buffer.readUInt32LE(cur) !== 0x02014b50) break;

    const method = buffer.readUInt16LE(cur + 10);
    const compSize = buffer.readUInt32LE(cur + 20);
    const fnLen = buffer.readUInt16LE(cur + 28);
    const extraLen = buffer.readUInt16LE(cur + 30);
    const commentLen = buffer.readUInt16LE(cur + 32);
    const localHeaderOffset = buffer.readUInt32LE(cur + 42);

    let rawName = buffer.toString('utf8', cur + 46, cur + 46 + fnLen);
    // Sanitização de caminho contra zip-slip
    rawName = path.normalize(rawName).replace(/^(\.\.[\/\\])+/, '');

    if (localHeaderOffset + 30 <= buffer.length) {
      const localFnLen = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFnLen + localExtraLen;

      if (dataOffset + compSize <= buffer.length) {
        const rawData = buffer.subarray(dataOffset, dataOffset + compSize);
        let content: Buffer | null = null;
        if (method === 0) {
          content = rawData;
        } else if (method === 8) {
          content = zlib.inflateRawSync(rawData);
        }
        if (content) {
          files[rawName] = content;
        }
      }
    }

    cur += 46 + fnLen + extraLen + commentLen;
  }

  return files;
}

/**
 * Lê uma base SQLite nativa do Anki (collection.anki2, collection.anki21 ou .db)
 */
export function parseAnkiSqliteBuffer(dbBuffer: Buffer): {
  cards: ParsedImportCard[];
  deckMap: Record<string, string>;
} {
  const tempPath = path.join(
    os.tmpdir(),
    `anki_${Date.now()}_${Math.random().toString(36).substring(2)}.db`
  );

  try {
    fs.writeFileSync(tempPath, dbBuffer);
    const db = new DatabaseSync(tempPath, { readOnly: true });

    // 1. Mapeamento de Baralhos
    const deckMap: Record<string, string> = {};
    try {
      const colRow = (db.prepare('SELECT decks FROM col LIMIT 1').get() || {}) as { decks?: string };
      if (colRow?.decks) {
        const parsed = JSON.parse(colRow.decks);
        for (const [id, val] of Object.entries(parsed)) {
          if (val && typeof val === 'object' && 'name' in val) {
            deckMap[id] = (val as { name: string }).name;
          }
        }
      }
    } catch {
      try {
        const deckRows = (db.prepare('SELECT id, name FROM decks').all() || []) as unknown as Array<{ id: number | string; name: string }>;
        for (const d of deckRows) {
          deckMap[String(d.id)] = d.name;
        }
      } catch {}
    }

    // 2. Extração de Notas e Cartões
    interface NoteCardRow {
      id: number;
      tags: string;
      flds: string;
      did?: number;
    }

    let noteRows: NoteCardRow[] = [];
    try {
      noteRows = db.prepare(`
        SELECT n.id, n.tags, n.flds, c.did
        FROM notes n
        LEFT JOIN cards c ON n.id = c.nid
        GROUP BY n.id
      `).all() as unknown as NoteCardRow[];
    } catch {
      try {
        noteRows = db.prepare('SELECT id, tags, flds FROM notes').all() as unknown as NoteCardRow[];
      } catch {
        // Tenta tabela genérica caso seja um .db de outro aplicativo de flashcards
        try {
          const generic = db.prepare('SELECT front, back, comment, tags FROM flashcards').all() as unknown as Array<{
            front: string;
            back: string;
            comment?: string;
            tags?: string;
          }>;
          db.close();
          return {
            cards: generic.map((g, idx) => ({
              front: cleanAnkiHtml(g.front),
              back: cleanAnkiHtml(g.back) || (g.front.includes('{{c') ? extractClozeBack(g.front) : 'Oclusão Cloze'),
              comment: g.comment ? cleanAnkiHtml(g.comment) : undefined,
              tags: g.tags ? g.tags.split(/[\s,]+/).filter(Boolean) : undefined,
              rawLineIndex: idx + 1
            })),
            deckMap
          };
        } catch {}
      }
    }

    const cards: ParsedImportCard[] = [];
    for (let i = 0; i < noteRows.length; i++) {
      const row = noteRows[i];
      if (!row.flds) continue;

      const fields = row.flds.split(String.fromCharCode(31));
      const front = cleanAnkiHtml(fields[0] || '');
      let back = cleanAnkiHtml(fields[1] || '');
      const extraFields = fields.slice(2).map((f) => cleanAnkiHtml(f)).filter(Boolean);
      const comment = extraFields.join('\n\n');

      if (!front && !back) continue;

      // Suporte inteligente a cartões Cloze
      if (front.includes('{{c') && !back) {
        back = extractClozeBack(front);
      } else if (!back && front) {
        back = 'Sem resposta cadastrada';
      }

      // Tags
      const tags = (row.tags || '')
        .split(/[\s,]+/)
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      // Nome do baralho e inferência de especialidade / tema / foco
      const deckName = (row.did && deckMap[String(row.did)]) || Object.values(deckMap)[0] || '';
      let specialty: string | undefined;
      let theme: string | undefined;
      let focus: string | undefined;

      if (deckName) {
        const parts = deckName.split('::').map((p) => p.trim());
        if (parts.length >= 1) specialty = parts[0];
        if (parts.length >= 2) theme = parts[1];
        if (parts.length >= 3) focus = parts[2];
      }

      cards.push({
        front,
        back,
        comment: comment || undefined,
        tags: tags.length > 0 ? tags : undefined,
        specialty,
        theme,
        focus,
        rawLineIndex: i + 1
      });
    }

    db.close();
    return { cards, deckMap };
  } finally {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}
  }
}

/**
 * Analisa textos de exportação do Anki ("Notas em Texto Puro" e "Cartões em Texto Simples")
 * bem como CSVs e TSVs convencionais com metadados e diretivas (#separator, #html, #tags column)
 */
export function parseAnkiText(
  content: string,
  format: FlashcardImportFormat = 'auto'
): { cards: ParsedImportCard[]; detectedDeck?: string } {
  const lines = content.split(/\r?\n/);
  let delimiter = '\t';
  let tagColumnIndex = -1;
  let detectedDeck = '';
  const dataLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Linhas de diretivas de cabeçalho do Anki
    if (trimmed.startsWith('#')) {
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('#separator:')) {
        const sep = lower.replace('#separator:', '').trim();
        if (sep === 'tab') delimiter = '\t';
        else if (sep === 'comma') delimiter = ',';
        else if (sep === 'semicolon') delimiter = ';';
        else if (sep === 'space') delimiter = ' ';
      } else if (lower.startsWith('#tags column:')) {
        const colNum = parseInt(lower.replace('#tags column:', '').trim(), 10);
        if (!isNaN(colNum) && colNum > 0) tagColumnIndex = colNum - 1;
      } else if (lower.startsWith('#deck:')) {
        detectedDeck = trimmed.substring(6).trim();
      }
      continue;
    }

    dataLines.push(line);
  }

  // Se não houve diretiva explícita, detecta o delimitador estatisticamente da 1ª linha
  if (dataLines.length > 0 && !content.includes('#separator:')) {
    const first = dataLines[0];
    const commas = (first.match(/,/g) || []).length;
    const semis = (first.match(/;/g) || []).length;
    const tabs = (first.match(/\t/g) || []).length;
    if (tabs >= commas && tabs >= semis && tabs > 0) delimiter = '\t';
    else if (semis > commas) delimiter = ';';
    else if (commas > 0) delimiter = ',';
  }

  const cards: ParsedImportCard[] = [];
  for (let idx = 0; idx < dataLines.length; idx++) {
    const line = dataLines[idx];
    const cols = line.split(delimiter);
    if (cols.length === 0) continue;

    const front = cleanAnkiHtml(cols[0] || '');
    let back = cleanAnkiHtml(cols[1] || '');
    let comment = '';
    let tags: string[] = [];

    if (tagColumnIndex >= 0 && cols[tagColumnIndex]) {
      tags = cols[tagColumnIndex].split(/[\s,]+/).map((t) => t.trim()).filter(Boolean);
    }

    if (format === 'txt_cards') {
      // Cartões em Texto Simples: 2 colunas principais (front / back)
      if (cols.length > 2 && tagColumnIndex !== 2) {
        comment = cleanAnkiHtml(cols.slice(2).join('\n'));
      }
    } else {
      // Notas em Texto Puro: coluna 0 = frente, 1 = verso, 2..N = extras
      const extraCols: string[] = [];
      for (let i = 2; i < cols.length; i++) {
        if (i !== tagColumnIndex) {
          const c = cleanAnkiHtml(cols[i]);
          if (c) extraCols.push(c);
        }
      }
      if (extraCols.length > 0) comment = extraCols.join('\n\n');
    }

    if (front.includes('{{c') && !back) {
      back = extractClozeBack(front);
    }

    if (front || back) {
      cards.push({
        front,
        back: back || 'Oclusão Cloze',
        comment: comment || undefined,
        tags: tags.length > 0 ? tags : undefined,
        rawLineIndex: idx + 1
      });
    }
  }

  return { cards, detectedDeck: detectedDeck || undefined };
}

/**
 * Analisador Universal que reconhece automaticamente qualquer um dos formatos suportados:
 * *.zip, *.colpkg, *.db, *.csv, *.apkg, *.txt, *.tsv, *.anki2
 */
export function parseUniversalFlashcardFile(
  buffer: Buffer,
  filename: string,
  requestedFormat: FlashcardImportFormat = 'auto'
): ParsedImportResult {
  const ext = (path.extname(filename) || '').toLowerCase();

  // 1. Arquivos ZIP / APKG / COLPKG
  const isZip = buffer.length > 4 && buffer.readUInt32LE(0) === 0x04034b50;
  if (isZip || ext === '.apkg' || ext === '.colpkg' || ext === '.zip') {
    const unzipped = parseZipEntries(buffer);

    // Procura a base anki sqlite dentro do pacote (.anki2, .anki21)
    const ankiDbName = Object.keys(unzipped).find(
      (k) => k === 'collection.anki2' || k === 'collection.anki21' || k.endsWith('.anki2')
    );

    if (ankiDbName && unzipped[ankiDbName]) {
      const res = parseAnkiSqliteBuffer(unzipped[ankiDbName]);
      const deckName = Object.values(res.deckMap)[0] || filename.replace(/\.[^/.]+$/, '');
      return {
        success: true,
        cards: res.cards,
        detectedFormat: ext === '.colpkg' ? 'colpkg' : 'apkg',
        detectedDeckName: deckName
      };
    }

    // Se houver pacote anki aninhado dentro de um .zip
    const nestedApkg = Object.keys(unzipped).find(
      (k) => k.endsWith('.apkg') || k.endsWith('.colpkg')
    );
    if (nestedApkg && unzipped[nestedApkg]) {
      return parseUniversalFlashcardFile(unzipped[nestedApkg], nestedApkg, 'apkg');
    }

    // Se houver banco sqlite genérico dentro do zip
    const sqliteEntry = Object.keys(unzipped).find(
      (k) => k.endsWith('.db') || k.endsWith('.sqlite')
    );
    if (sqliteEntry && unzipped[sqliteEntry]) {
      const res = parseAnkiSqliteBuffer(unzipped[sqliteEntry]);
      return {
        success: true,
        cards: res.cards,
        detectedFormat: 'db',
        detectedDeckName: Object.values(res.deckMap)[0] || filename.replace(/\.[^/.]+$/, '')
      };
    }

    // Se houver arquivos de texto dentro do zip (.csv, .tsv, .txt)
    const textCards: ParsedImportCard[] = [];
    let detectedDeck = '';
    for (const [k, textBuf] of Object.entries(unzipped)) {
      if (k.endsWith('.csv') || k.endsWith('.tsv') || k.endsWith('.txt')) {
        const textStr = textBuf.toString('utf8');
        const parsed = parseAnkiText(textStr, requestedFormat);
        textCards.push(...parsed.cards);
        if (parsed.detectedDeck) detectedDeck = parsed.detectedDeck;
      }
    }

    if (textCards.length > 0) {
      return {
        success: true,
        cards: textCards,
        detectedFormat: 'zip',
        detectedDeckName: detectedDeck || filename.replace(/\.[^/.]+$/, '')
      };
    }

    throw new Error('Nenhum baralho Anki (.anki2) ou arquivo de cartões suportado foi encontrado dentro do arquivo ZIP.');
  }

  // 2. Banco de Dados SQLite (.db, .anki2, .anki21)
  const isSqlite = buffer.length > 16 && buffer.toString('utf8', 0, 15) === 'SQLite format 3';
  if (isSqlite || ext === '.db' || ext === '.anki2' || ext === '.anki21') {
    const res = parseAnkiSqliteBuffer(buffer);
    return {
      success: true,
      cards: res.cards,
      detectedFormat: 'db',
      detectedDeckName: Object.values(res.deckMap)[0] || filename.replace(/\.[^/.]+$/, '')
    };
  }

  // 3. Arquivos de Texto (.csv, .tsv, .txt)
  const textContent = buffer.toString('utf8');
  const res = parseAnkiText(textContent, requestedFormat);
  const detectedFormat = ext === '.csv' ? 'csv' : ext === '.tsv' ? 'tsv' : 'txt';

  return {
    success: true,
    cards: res.cards,
    detectedFormat,
    detectedDeckName: res.detectedDeck || filename.replace(/\.[^/.]+$/, '')
  };
}
