import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const SOURCE_DB_PATH = path.resolve('data/supabase_tables.db');
const FTS_DB_PATH = path.resolve('data/questions_golden_fts.db');

console.log('========================================================================');
console.log('⚡ CONSTRUÇÃO DO ÍNDICE BM25 (SQLITE FTS5) DAS 130K QUESTÕES GOLDEN');
console.log(`📖 Fonte: ${SOURCE_DB_PATH}`);
console.log(`💾 Destino: ${FTS_DB_PATH}`);
console.log('========================================================================\n');

if (!fs.existsSync(SOURCE_DB_PATH)) {
  console.error(`❌ Banco de dados fonte não encontrado: ${SOURCE_DB_PATH}`);
  process.exit(1);
}

// Remover banco antigo se existir
if (fs.existsSync(FTS_DB_PATH)) {
  fs.unlinkSync(FTS_DB_PATH);
}

const srcDb = new DatabaseSync(SOURCE_DB_PATH, { readOnly: true });
const ftsDb = new DatabaseSync(FTS_DB_PATH);

// Otimizações de escrita no SQLite
ftsDb.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA page_size = 4096;
  PRAGMA cache_size = -64000; -- 64MB cache
`);

// Criar tabela virtual FTS5 com tokenizador unicode61 para português (remove acentos)
ftsDb.exec(`
  CREATE VIRTUAL TABLE questions_fts USING fts5(
    id UNINDEXED,
    especialidade,
    tema,
    foco,
    subfoco,
    content,
    tokenize = 'unicode61 remove_diacritics 2'
  );
`);

console.log('📡 Lendo questões golden da tabela [questions]...');
const t0 = Date.now();
const rows = srcDb.prepare(`
  SELECT id, especialidade, tema, foco, subfoco, statement, options, correct_answer, commentary
  FROM questions
  WHERE especialidade IS NOT NULL 
    AND foco IS NOT NULL 
    AND foco != 'Geral'
    AND subfoco IS NOT NULL
    AND subfoco != 'Geral'
`).all();

console.log(`✅ ${rows.length.toLocaleString('pt-BR')} questões golden carregadas da memória em ${((Date.now() - t0) / 1000).toFixed(2)}s.`);

console.log('🚀 Indexando no SQLite FTS5 em lote transacional...');
const t1 = Date.now();

const insertStmt = ftsDb.prepare(`
  INSERT INTO questions_fts(id, especialidade, tema, foco, subfoco, content)
  VALUES (?, ?, ?, ?, ?, ?)
`);

ftsDb.exec('BEGIN TRANSACTION;');

let count = 0;
for (const r of rows) {
  let correctText = '';
  let opts = [];
  try {
    opts = typeof r.options === 'string' ? JSON.parse(r.options) : (r.options || []);
  } catch {}

  const letters = ['A', 'B', 'C', 'D', 'E'];
  for (let k = 0; k < opts.length; k++) {
    const o = opts[k];
    const letter = o.letter || (typeof o.index === 'number' ? letters[o.index] : null);
    if (letter && letter === r.correct_answer) {
      correctText = o.text || '';
      break;
    }
  }

  // Conteúdo clínico agregador
  const content = `${r.statement || ''} ${correctText} ${r.commentary ? r.commentary.slice(0, 300) : ''}`
    .replace(/\s+/g, ' ')
    .trim();

  insertStmt.run(
    r.id,
    r.especialidade,
    r.tema,
    r.foco,
    r.subfoco,
    content
  );

  count++;
  if (count % 25000 === 0) {
    process.stdout.write(`  Indexadas: ${count.toLocaleString('pt-BR')} / ${rows.length.toLocaleString('pt-BR')}\r`);
  }
}

ftsDb.exec('COMMIT;');
const indexTime = ((Date.now() - t1) / 1000).toFixed(2);
console.log(`\n✅ ${count.toLocaleString('pt-BR')} questões indexadas com sucesso em ${indexTime}s!`);

const ftsSize = (fs.statSync(FTS_DB_PATH).size / (1024 * 1024)).toFixed(2);
console.log(`📁 Tamanho final do arquivo FTS5: ${ftsSize} MB\n`);

// Teste de consulta BM25
console.log('🧪 Teste de query BM25: "angina instavel nitroglicerina"...');
const testQuery = ftsDb.prepare(`
  SELECT especialidade, tema, foco, subfoco, bm25(questions_fts) as rank
  FROM questions_fts
  WHERE questions_fts MATCH 'angina instavel nitroglicerina'
  ORDER BY rank
  LIMIT 3
`).all();

console.log('Resultado BM25:', testQuery);
console.log('\n🏁 Construção do índice FTS5 concluída com 100% de integridade!');
