import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';
import type { FlashcardImportFormat } from '@/types/flashcards';

export interface ParsedImportCard {
  front: string;
  back: string;
  comment?: string;
  frontImageRef?: string;
  backImageRef?: string;
  imageFrontUrl?: string;
  imageUrl?: string;
  specialty?: string;
  theme?: string;
  focus?: string;
  subfocus?: string;
  deckId?: string;
  sourceDeckName?: string;
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
  mediaFiles?: Record<string, Buffer>;
  message?: string;
}

const IMAGE_FILE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i;

/**
 * Extrai referências de imagem (<img src="...">) de um trecho HTML do Anki
 * antes que as tags sejam removidas.
 */
export function extractAnkiImageRefs(html: string): string[] {
  if (!html) return [];
  const refs: string[] = [];
  const imgTagRegex = /<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgTagRegex.exec(html)) !== null) {
    const rawSrc = (match[1] ?? match[2] ?? match[3] ?? '').trim();
    if (!rawSrc) continue;

    const decodedEntities = rawSrc
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");

    let cleaned = decodedEntities;
    try {
      cleaned = decodeURIComponent(decodedEntities);
    } catch {
      cleaned = decodedEntities;
    }

    cleaned = cleaned.trim().replace(/^\.\//, '');
    const lower = cleaned.toLowerCase();

    if (
      !cleaned ||
      lower.startsWith('data:image/svg+xml') ||
      lower.startsWith('javascript:') ||
      lower.startsWith('vbscript:')
    ) {
      continue;
    }

    refs.push(cleaned);
  }

  return refs;
}

function isSafeHttpImageUrl(ref?: string): boolean {
  if (!ref) return false;
  return /^https?:\/\/.+/i.test(ref.trim());
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

const MAX_ZIP_ENTRIES = 2500;
const MAX_SINGLE_ENTRY_BYTES = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_UNCOMPRESSED_BYTES = 120 * 1024 * 1024; // 120MB (suporta baralhos médicos com imagens)
const MAX_SQLITE_CARDS = 25000;
const MAX_ARCHIVE_DEPTH = 1;

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
  if (totalEntries > MAX_ZIP_ENTRIES) {
    throw new Error(
      `Pacote compactado excede o limite máximo seguro de entradas (${MAX_ZIP_ENTRIES}).`
    );
  }

  const files: Record<string, Buffer> = {};
  let totalUncompressedBytes = 0;

  let cur = cdOffset;
  for (let e = 0; e < totalEntries && cur < buffer.length - 46; e++) {
    if (buffer.readUInt32LE(cur) !== 0x02014b50) break;

    const method = buffer.readUInt16LE(cur + 10);
    const compSize = buffer.readUInt32LE(cur + 20);
    const uncompSize = buffer.readUInt32LE(cur + 24);
    const fnLen = buffer.readUInt16LE(cur + 28);
    const extraLen = buffer.readUInt16LE(cur + 30);
    const commentLen = buffer.readUInt16LE(cur + 32);
    const localHeaderOffset = buffer.readUInt32LE(cur + 42);

    if (uncompSize > MAX_SINGLE_ENTRY_BYTES) {
      throw new Error('Entrada compactada excede o limite máximo permitido de 25MB.');
    }

    let rawName = buffer.toString('utf8', cur + 46, cur + 46 + fnLen);
    // Sanitização estrita de caminho contra Zip-Slip
    rawName = path.posix
      .normalize(rawName.replace(/\\/g, '/'))
      .replace(/^(\.\.\/)+/, '')
      .replace(/^\/+/, '');

    if (localHeaderOffset + 30 <= buffer.length) {
      const localFnLen = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLen = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFnLen + localExtraLen;

      if (dataOffset + compSize <= buffer.length) {
        const rawData = buffer.subarray(dataOffset, dataOffset + compSize);
        let content: Buffer | null = null;
        if (method === 0) {
          if (rawData.length > MAX_SINGLE_ENTRY_BYTES) {
            throw new Error('Entrada do pacote excede o limite máximo permitido de 25MB.');
          }
          content = rawData;
        } else if (method === 8) {
          try {
            content = zlib.inflateRawSync(rawData, { maxOutputLength: MAX_SINGLE_ENTRY_BYTES });
          } catch {
            throw new Error(
              'Entrada compactada inválida ou excede o limite seguro de descompressão (proteção contra ZIP bomb).'
            );
          }
        }
        if (content) {
          totalUncompressedBytes += content.length;
          if (totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
            throw new Error(
              'Volume total descompactado excede o limite máximo seguro de 120MB (proteção contra ZIP bomb).'
            );
          }
          files[rawName] = content;
        }
      }
    }

    cur += 46 + fnLen + extraLen + commentLen;
  }

  return files;
}

function isZstdBuffer(buf?: Buffer): boolean {
  return Boolean(
    buf &&
    buf.length >= 4 &&
    buf[0] === 0x28 &&
    buf[1] === 0xb5 &&
    buf[2] === 0x2f &&
    buf[3] === 0xfd
  );
}

/**
 * Lê o manifesto 'media' de pacotes .apkg/.colpkg e mapeia apenas os nomes de arquivos
 * efetivamente referenciados pelos cartões importados.
 */
function extractReferencedAnkiMedia(
  unzipped: Record<string, Buffer>,
  cards: ParsedImportCard[]
): Record<string, Buffer> {
  const referenced = new Set<string>();
  for (const c of cards) {
    if (c.frontImageRef && !isSafeHttpImageUrl(c.frontImageRef)) {
      referenced.add(c.frontImageRef);
    }
    if (c.backImageRef && !isSafeHttpImageUrl(c.backImageRef)) {
      referenced.add(c.backImageRef);
    }
  }
  if (referenced.size === 0) return {};

  const mediaFiles: Record<string, Buffer> = {};
  const mediaManifestBuf = unzipped['media'];

  if (mediaManifestBuf && !isZstdBuffer(mediaManifestBuf)) {
    const manifestText = mediaManifestBuf.toString('utf8').trim();
    if (manifestText.startsWith('{')) {
      try {
        const manifest = JSON.parse(manifestText) as Record<string, string>;
        const filenameToZipKey = new Map<string, string>();
        for (const [zipKey, originalName] of Object.entries(manifest)) {
          if (typeof originalName === 'string' && originalName.trim()) {
            filenameToZipKey.set(originalName.trim(), zipKey);
            filenameToZipKey.set(originalName.trim().toLowerCase(), zipKey);
          }
        }

        for (const ref of referenced) {
          const zipKey =
            filenameToZipKey.get(ref) ??
            filenameToZipKey.get(ref.toLowerCase()) ??
            filenameToZipKey.get(path.posix.basename(ref)) ??
            filenameToZipKey.get(path.posix.basename(ref).toLowerCase());
          if (zipKey && unzipped[zipKey]) {
            mediaFiles[ref] = unzipped[zipKey];
          }
        }
      } catch {
        // segue para fallback por caminho direto no ZIP
      }
    }
  }

  // Fallback para ZIPs genéricos (ex.: CSV + pasta media/ ou arquivos nomeados diretamente)
  if (Object.keys(mediaFiles).length < referenced.size) {
    const zipEntriesLower = new Map<string, Buffer>();
    const zipBasenameLower = new Map<string, Buffer>();
    for (const [entryName, entryBuf] of Object.entries(unzipped)) {
      if (!IMAGE_FILE_EXT_RE.test(entryName)) continue;
      const normalized = entryName.replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
      zipEntriesLower.set(normalized, entryBuf);
      zipBasenameLower.set(path.posix.basename(normalized), entryBuf);
    }

    for (const ref of referenced) {
      if (mediaFiles[ref]) continue;
      const normRef = ref.replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
      const buf =
        unzipped[ref] ??
        zipEntriesLower.get(normRef) ??
        zipBasenameLower.get(path.posix.basename(normRef));
      if (buf) {
        mediaFiles[ref] = buf;
      }
    }
  }

  return mediaFiles;
}

/**
 * Lê uma base SQLite nativa do Anki (collection.anki2, collection.anki21 ou .db)
 */
export function parseAnkiSqliteBuffer(dbBuffer: Buffer): {
  cards: ParsedImportCard[];
  deckMap: Record<string, string>;
} {
  if (dbBuffer.length > MAX_SINGLE_ENTRY_BYTES) {
    throw new Error('Banco de dados SQLite excede o limite máximo permitido de 25MB.');
  }
  if (dbBuffer.length < 16 || dbBuffer.subarray(0, 15).toString('ascii') !== 'SQLite format 3') {
    throw new Error('Arquivo SQLite inválido ou corrompido.');
  }

  const tempPath = path.join(
    os.tmpdir(),
    `anki_${Date.now()}_${Math.random().toString(36).substring(2)}.db`
  );

  let db: DatabaseSync | null = null;
  try {
    fs.writeFileSync(tempPath, dbBuffer);
    db = new DatabaseSync(tempPath, { readOnly: true });

    // Blindagem anti-View/CTE/Trigger/Corrupted-Cell Bomb no motor SQLite
    db.exec('PRAGMA trusted_schema = OFF; PRAGMA cell_size_check = ON; PRAGMA query_only = ON;');

    const schemaEntries = (db
      .prepare('SELECT name, type, sql FROM sqlite_master')
      .all() || []) as unknown as Array<{ name?: string; type?: string; sql?: string | null }>;

    const tableNames = new Set<string>();
    for (const entry of schemaEntries) {
      const objType = String(entry.type || '').toLowerCase();
      const objName = String(entry.name || '').toLowerCase();
      const objSql = String(entry.sql || '');

      if (objType === 'view' || objType === 'trigger' || /\bvirtual\s+table\b/i.test(objSql)) {
        throw new Error(
          'Pacote SQLite bloqueado por segurança: views, triggers ou tabelas virtuais não são permitidos.'
        );
      }
      if (objType === 'table') {
        tableNames.add(objName);
      }
    }

    // 1. Mapeamento de Baralhos
    const deckMap: Record<string, string> = {};
    if (tableNames.has('col')) {
      try {
        const colRow = (db.prepare('SELECT substr(decks, 1, 524288) AS decks FROM col LIMIT 1').get() || {}) as { decks?: string };
        if (colRow?.decks) {
          const parsed = JSON.parse(colRow.decks);
          for (const [id, val] of Object.entries(parsed)) {
            if (val && typeof val === 'object' && 'name' in val) {
              deckMap[id] = String((val as { name: unknown }).name);
            }
          }
        }
      } catch {
        // segue para tabela decks se existir
      }
    }
    if (Object.keys(deckMap).length === 0 && tableNames.has('decks')) {
      try {
        const deckRows = (db.prepare('SELECT id, substr(name, 1, 512) AS name FROM decks LIMIT 500').all() || []) as unknown as Array<{ id: number | string; name: string }>;
        for (const d of deckRows) {
          deckMap[String(d.id)] = d.name;
        }
      } catch {}
    }

    // 2. Extração O(N) em duas consultas lineares separadas (elimina Join Bomb O(N*M) sem índice)
    interface NoteCardRow {
      id: number;
      tags: string;
      flds: string;
      did?: number;
    }

    let noteRows: NoteCardRow[] = [];
    if (tableNames.has('notes')) {
      noteRows = (db
        .prepare(
          `SELECT id, substr(tags, 1, 2048) AS tags, substr(flds, 1, 32768) AS flds FROM notes LIMIT ${MAX_SQLITE_CARDS}`
        )
        .all() || []) as unknown as NoteCardRow[];

      if (noteRows.length > 0 && tableNames.has('cards')) {
        try {
          const cardLinks = (db
            .prepare(`SELECT nid, did FROM cards LIMIT ${MAX_SQLITE_CARDS * 2}`)
            .all() || []) as unknown as Array<{ nid: number; did: number }>;
          const nidToDid = new Map<number, number>();
          for (const link of cardLinks) {
            if (!nidToDid.has(link.nid) && link.did !== undefined && link.did !== null) {
              nidToDid.set(link.nid, link.did);
            }
          }
          for (const n of noteRows) {
            const did = nidToDid.get(n.id);
            if (did !== undefined) n.did = did;
          }
        } catch {
          // did permanece opcional
        }
      }
    } else if (tableNames.has('flashcards')) {
      try {
        const generic = (db
          .prepare(
            `SELECT substr(front, 1, 16384) AS front, substr(back, 1, 16384) AS back, substr(comment, 1, 16384) AS comment, substr(tags, 1, 2048) AS tags FROM flashcards LIMIT ${MAX_SQLITE_CARDS}`
          )
          .all() || []) as unknown as Array<{
          front: string;
          back: string;
          comment?: string;
          tags?: string;
        }>;
        return {
          cards: generic.map((g, idx) => {
            const frontRefs = extractAnkiImageRefs(g.front);
            const backRefs = extractAnkiImageRefs(g.back);
            const commentRefs = g.comment ? extractAnkiImageRefs(g.comment) : [];
            const frontImageRef = frontRefs[0];
            const backImageRef = backRefs[0] || commentRefs[0];

            return {
              front: cleanAnkiHtml(g.front),
              back: cleanAnkiHtml(g.back) || (g.front.includes('{{c') ? extractClozeBack(g.front) : ''),
              comment: g.comment ? cleanAnkiHtml(g.comment) : undefined,
              frontImageRef,
              backImageRef,
              imageFrontUrl: isSafeHttpImageUrl(frontImageRef) ? frontImageRef : undefined,
              imageUrl: isSafeHttpImageUrl(backImageRef) ? backImageRef : undefined,
              tags: g.tags ? g.tags.split(/[\s,]+/).filter(Boolean) : undefined,
              rawLineIndex: idx + 1
            };
          }),
          deckMap
        };
      } catch {}
    }

    const cards: ParsedImportCard[] = [];
    for (let i = 0; i < noteRows.length; i++) {
      const row = noteRows[i];
      if (!row.flds) continue;

      const fields = row.flds.split(String.fromCharCode(31));
      const rawFront = fields[0] || '';
      const rawBack = fields[1] || '';
      const rawExtras = fields.slice(2);

      const frontRefs = extractAnkiImageRefs(rawFront);
      const backRefs = extractAnkiImageRefs(rawBack);
      const extraRefs = rawExtras.flatMap((f) => extractAnkiImageRefs(f));

      const frontImageRef = frontRefs[0];
      const backImageRef = backRefs[0] || extraRefs[0];

      const front = cleanAnkiHtml(rawFront);
      let back = cleanAnkiHtml(rawBack);
      const extraFields = rawExtras.map((f) => cleanAnkiHtml(f)).filter(Boolean);
      const comment = extraFields.join('\n\n');

      if (!front && !back && !frontImageRef && !backImageRef) continue;

      // Suporte inteligente a cartões Cloze
      if (front.includes('{{c') && !back) {
        back = extractClozeBack(front);
      } else if (!back && !backImageRef && (front || frontImageRef)) {
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
        frontImageRef,
        backImageRef,
        imageFrontUrl: isSafeHttpImageUrl(frontImageRef) ? frontImageRef : undefined,
        imageUrl: isSafeHttpImageUrl(backImageRef) ? backImageRef : undefined,
        sourceDeckName: deckName || undefined,
        tags: tags.length > 0 ? tags : undefined,
        specialty,
        theme,
        focus,
        rawLineIndex: i + 1
      });
    }

    return { cards, deckMap };
  } finally {
    try {
      if (db) db.close();
    } catch {}
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

    const rawFront = cols[0] || '';
    const rawBack = cols[1] || '';

    const frontRefs = extractAnkiImageRefs(rawFront);
    const backRefs = extractAnkiImageRefs(rawBack);

    const front = cleanAnkiHtml(rawFront);
    let back = cleanAnkiHtml(rawBack);
    let comment = '';
    let tags: string[] = [];
    const extraRefs: string[] = [];

    if (tagColumnIndex >= 0 && cols[tagColumnIndex]) {
      tags = cols[tagColumnIndex].split(/[\s,]+/).map((t) => t.trim()).filter(Boolean);
    }

    if (format === 'txt_cards') {
      // Cartões em Texto Simples: 2 colunas principais (front / back)
      if (cols.length > 2 && tagColumnIndex !== 2) {
        const extraSlice = cols.slice(2).join('\n');
        extraRefs.push(...extractAnkiImageRefs(extraSlice));
        comment = cleanAnkiHtml(extraSlice);
      }
    } else {
      // Notas em Texto Puro: coluna 0 = frente, 1 = verso, 2..N = extras
      const extraCols: string[] = [];
      for (let i = 2; i < cols.length; i++) {
        if (i !== tagColumnIndex) {
          extraRefs.push(...extractAnkiImageRefs(cols[i]));
          const c = cleanAnkiHtml(cols[i]);
          if (c) extraCols.push(c);
        }
      }
      if (extraCols.length > 0) comment = extraCols.join('\n\n');
    }

    if (front.includes('{{c') && !back) {
      back = extractClozeBack(front);
    }

    const frontImageRef = frontRefs[0];
    const backImageRef = backRefs[0] || extraRefs[0];

    if (front || back || frontImageRef || backImageRef) {
      cards.push({
        front,
        back: back || (backImageRef ? '' : 'Oclusão Cloze'),
        comment: comment || undefined,
        frontImageRef,
        backImageRef,
        imageFrontUrl: isSafeHttpImageUrl(frontImageRef) ? frontImageRef : undefined,
        imageUrl: isSafeHttpImageUrl(backImageRef) ? backImageRef : undefined,
        sourceDeckName: detectedDeck || undefined,
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
  requestedFormat: FlashcardImportFormat = 'auto',
  depth = 0
): ParsedImportResult {
  if (depth > MAX_ARCHIVE_DEPTH) {
    throw new Error('Profundidade máxima de pacotes aninhados excedida (proteção contra recursão).');
  }

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
      const mediaFiles = extractReferencedAnkiMedia(unzipped, res.cards);
      return {
        success: true,
        cards: res.cards,
        detectedFormat: ext === '.colpkg' ? 'colpkg' : 'apkg',
        detectedDeckName: deckName,
        mediaFiles: Object.keys(mediaFiles).length > 0 ? mediaFiles : undefined
      };
    }

    // Pacote moderno do Anki 23.10+ (zstd / anki21b) sem fallback legado
    if (unzipped['collection.anki21b'] || isZstdBuffer(unzipped['media'])) {
      throw new Error(
        'Este pacote foi exportado no formato moderno comprimido do Anki (anki21b/zstd). No Anki Desktop, clique em Exportar e marque a opção "Suporte a versões antigas do Anki" (Legacy) para importar notas e imagens.'
      );
    }

    // Se houver pacote anki aninhado dentro de um .zip
    const nestedApkg = Object.keys(unzipped).find(
      (k) => k.endsWith('.apkg') || k.endsWith('.colpkg')
    );
    if (nestedApkg && unzipped[nestedApkg]) {
      return parseUniversalFlashcardFile(unzipped[nestedApkg], nestedApkg, 'apkg', depth + 1);
    }

    // Se houver banco sqlite genérico dentro do zip
    const sqliteEntry = Object.keys(unzipped).find(
      (k) => k.endsWith('.db') || k.endsWith('.sqlite')
    );
    if (sqliteEntry && unzipped[sqliteEntry]) {
      const res = parseAnkiSqliteBuffer(unzipped[sqliteEntry]);
      const mediaFiles = extractReferencedAnkiMedia(unzipped, res.cards);
      return {
        success: true,
        cards: res.cards,
        detectedFormat: 'db',
        detectedDeckName: Object.values(res.deckMap)[0] || filename.replace(/\.[^/.]+$/, ''),
        mediaFiles: Object.keys(mediaFiles).length > 0 ? mediaFiles : undefined
      };
    }

    // Se houver arquivos de texto dentro do zip (.csv, .tsv, .txt) + eventual pasta de imagens
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
      const mediaFiles = extractReferencedAnkiMedia(unzipped, textCards);
      return {
        success: true,
        cards: textCards,
        detectedFormat: 'zip',
        detectedDeckName: detectedDeck || filename.replace(/\.[^/.]+$/, ''),
        mediaFiles: Object.keys(mediaFiles).length > 0 ? mediaFiles : undefined
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
