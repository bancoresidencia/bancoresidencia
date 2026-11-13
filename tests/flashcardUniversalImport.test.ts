import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { DatabaseSync } from 'node:sqlite';

import {
  cleanAnkiHtml,
  extractClozeBack,
  parseZipEntries,
  parseAnkiSqliteBuffer,
  parseAnkiText,
  parseUniversalFlashcardFile
} from '../src/lib/flashcards/ankiPackageParser';
import {
  parseFlashcardsCsv,
  buildFlashcardPreviews
} from '../src/utils/flashcardDistributionEngine';
import { clinicalHierarchy } from '../src/data/mockQuestions';

console.log('--- TEST SUITE: Flashcard Universal Import ---');

// Helper to build test zip buffers
function createZip(files: Record<string, Buffer>): Buffer {
  const localHeaders: Buffer[] = [];
  const cdHeaders: Buffer[] = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const fnBuf = Buffer.from(name, 'utf8');
    const comp = zlib.deflateRawSync(content);

    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4);
    lfh.writeUInt16LE(0, 6);
    lfh.writeUInt16LE(8, 8);
    lfh.writeUInt16LE(0, 10);
    lfh.writeUInt16LE(0, 12);
    lfh.writeUInt32LE(0, 14);
    lfh.writeUInt32LE(comp.length, 18);
    lfh.writeUInt32LE(content.length, 22);
    lfh.writeUInt16LE(fnBuf.length, 26);
    lfh.writeUInt16LE(0, 28);

    const localEntry = Buffer.concat([lfh, fnBuf, comp]);
    localHeaders.push(localEntry);

    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(0, 8);
    cdh.writeUInt16LE(8, 10);
    cdh.writeUInt16LE(0, 12);
    cdh.writeUInt16LE(0, 14);
    cdh.writeUInt32LE(0, 16);
    cdh.writeUInt32LE(comp.length, 20);
    cdh.writeUInt32LE(content.length, 24);
    cdh.writeUInt16LE(fnBuf.length, 28);
    cdh.writeUInt16LE(0, 30);
    cdh.writeUInt16LE(0, 32);
    cdh.writeUInt16LE(0, 34);
    cdh.writeUInt16LE(0, 36);
    cdh.writeUInt32LE(0, 38);
    cdh.writeUInt32LE(offset, 42);

    cdHeaders.push(Buffer.concat([cdh, fnBuf]));
    offset += localEntry.length;
  }

  const cdTotalLen = cdHeaders.reduce((acc, h) => acc + h.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(cdHeaders.length, 8);
  eocd.writeUInt16LE(cdHeaders.length, 10);
  eocd.writeUInt32LE(cdTotalLen, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, ...cdHeaders, eocd]);
}

// 1. Test cleanAnkiHtml and extractClozeBack
console.log('1. Testing cleanAnkiHtml and extractClozeBack...');
const dirtyHtml = '<div>Paciente com <b>dor torácica</b> súbita.<br>Suspeita de <u>TEP</u>.</div>[sound:rec1.mp3]';
const cleaned = cleanAnkiHtml(dirtyHtml);
assert.strictEqual(cleaned.includes('<div>'), false, 'Deve remover tags div');
assert.strictEqual(cleaned.includes('**dor torácica**'), true, 'Deve converter b para markdown bold');
assert.strictEqual(cleaned.includes('_TEP_'), true, 'Deve converter u para markdown underline');
assert.strictEqual(cleaned.includes('[sound:'), false, 'Deve remover referências de áudio anki');

const clozeFront = 'O sinal de Murphy positivo sugere {{c1::colecistite aguda}} por cálculo impactado.';
const extractedBack = extractClozeBack(clozeFront);
assert.strictEqual(extractedBack, 'colecistite aguda', 'Deve extrair o gabarito do cloze');

// 2. Test Anki Plain Text Notes with directives
console.log('2. Testing Anki text notes parsing with directives (#separator, #tags column, #deck)...');
const sampleAnkiText = `#separator:tab
#html:true
#tags column:3
#deck:Ginecologia::Oncologia Ginecológica::Câncer de Colo Uterino
<div>Qual a conduta no <b>LIEAG</b> aos 32 anos?</div>\tColposcopia com biópsia\tginecologia rastreamento
<div>A vacina HPV nonavalente cobre os subtipos {{c1::6, 11, 16, 18, 31, 33, 45, 52 e 58}}.</div>\t\thpv prevencao`;

const textParsed = parseAnkiText(sampleAnkiText, 'txt_notes');
assert.strictEqual(textParsed.cards.length, 2, 'Deve identificar 2 cartões');
assert.strictEqual(textParsed.cards[0].front, 'Qual a conduta no **LIEAG** aos 32 anos?');
assert.strictEqual(textParsed.cards[0].back, 'Colposcopia com biópsia');
assert.deepStrictEqual(textParsed.cards[0].tags, ['ginecologia', 'rastreamento']);
assert.strictEqual(textParsed.cards[1].back, '6, 11, 16, 18, 31, 33, 45, 52 e 58', 'Deve resolver o verso do cloze');
assert.strictEqual(textParsed.detectedDeck, 'Ginecologia::Oncologia Ginecológica::Câncer de Colo Uterino');

// 3. Test Anki SQLite parser and ZIP extraction (.apkg & .colpkg)
console.log('3. Testing SQLite and .apkg / .colpkg packaging and extraction...');
const tmpDbPath = path.join(os.tmpdir(), `test_anki_suite_${Date.now()}.db`);
const db = new DatabaseSync(tmpDbPath);
db.exec('CREATE TABLE col (id INTEGER PRIMARY KEY, decks TEXT)');
db.exec('CREATE TABLE notes (id INTEGER PRIMARY KEY, mid INTEGER, tags TEXT, flds TEXT)');
db.exec('CREATE TABLE cards (id INTEGER PRIMARY KEY, nid INTEGER, did INTEGER, ord INTEGER)');

const deckMap = { '1': { name: 'Cardiologia::Insuficiência Cardíaca::Tratamento Medicamentoso' } };
db.prepare('INSERT INTO col (id, decks) VALUES (?, ?)').run(1, JSON.stringify(deckMap));

const cardFlds = [
  'Qual a terapia quádrupla canônica para ICFEr?',
  'IECA/BRA/INRA + Betabloqueador + Antagonista de mineralocorticoide + iSGLT2.',
  'Evidência robusta classe I com redução de mortalidade cardiovascular.'
].join(String.fromCharCode(31));

db.prepare('INSERT INTO notes (id, mid, tags, flds) VALUES (?, ?, ?, ?)').run(1, 1, 'icfer sbc cardiologia', cardFlds);
db.prepare('INSERT INTO cards (id, nid, did, ord) VALUES (?, ?, ?, ?)').run(1, 1, 1, 0);
db.close();

const sqliteBytes = fs.readFileSync(tmpDbPath);
fs.unlinkSync(tmpDbPath);

// Test Direct .db
const dbResult = parseUniversalFlashcardFile(sqliteBytes, 'colecao_cardio.db');
assert.strictEqual(dbResult.success, true);
assert.strictEqual(dbResult.detectedFormat, 'db');
assert.strictEqual(dbResult.cards.length, 1);
assert.strictEqual(dbResult.cards[0].specialty, 'Cardiologia');

// Test .apkg Package
const apkgBytes = createZip({ 'collection.anki2': sqliteBytes, media: Buffer.from('{}') });
const apkgResult = parseUniversalFlashcardFile(apkgBytes, 'baralho_has.apkg');
assert.strictEqual(apkgResult.success, true);
assert.strictEqual(apkgResult.detectedFormat, 'apkg');
assert.strictEqual(apkgResult.cards.length, 1);
assert.strictEqual(apkgResult.cards[0].front, 'Qual a terapia quádrupla canônica para ICFEr?');
assert.strictEqual(apkgResult.detectedDeckName, 'Cardiologia::Insuficiência Cardíaca::Tratamento Medicamentoso');

// Test .colpkg Package
const colpkgResult = parseUniversalFlashcardFile(apkgBytes, 'colecao_total.colpkg');
assert.strictEqual(colpkgResult.success, true);
assert.strictEqual(colpkgResult.detectedFormat, 'colpkg');

// 4. Test .zip with text notes
console.log('4. Testing .zip containing text cards...');
const zipTextBytes = Buffer.from('Frente no Zip\tVerso no Zip\ttag1 tag2', 'utf8');
const zipFileBuffer = createZip({ 'flashcards.txt': zipTextBytes });
const zipResult = parseUniversalFlashcardFile(zipFileBuffer, 'meu_pacote.zip');
assert.strictEqual(zipResult.success, true);
assert.strictEqual(zipResult.detectedFormat, 'zip');
assert.strictEqual(zipResult.cards.length, 1);
assert.strictEqual(zipResult.cards[0].front, 'Frente no Zip');

// 5. Test parseFlashcardsCsv and buildFlashcardPreviews integration
console.log('5. Testing parseFlashcardsCsv and buildFlashcardPreviews...');
const sampleCsv = `Frente;Verso;Comentario;Especialidade;Tema;Foco
"Qual a conduta no LIEAG?";"Colposcopia";"Alto risco";Ginecologia;Oncologia Ginecológica;Colo Uterino`;

const rows = parseFlashcardsCsv(sampleCsv);
assert.strictEqual(rows.length, 1);
const previews = buildFlashcardPreviews(rows, clinicalHierarchy, 'auto');
assert.strictEqual(previews.length, 1);
assert.strictEqual(previews[0].isValid, true);
assert.strictEqual(previews[0].specialty, 'Ginecologia');

console.log('✅ ALL FLASHCARD UNIVERSAL IMPORT TESTS PASSED SUCCESSFULLY!');
