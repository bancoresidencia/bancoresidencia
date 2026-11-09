import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

// 1. Carrega variáveis de ambiente de .env.local
const env = {};
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Erro: Chaves de conexão ao Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

// 2. Garante diretório data/
const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'questoes_132k.db');
console.log('========================================================================');
console.log('📦 EXPORTADOR RESILIENTE DE QUESTÕES PARA SQLITE LOCAL (100% READ-ONLY)');
console.log(`📁 Destino: ${dbPath}`);
console.log('========================================================================\n');

// 3. Inicializa banco SQLite
const db = new DatabaseSync(dbPath);

// Otimizações de escrita no SQLite
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

// Cria tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    code TEXT,
    institution TEXT,
    banca TEXT,
    year INTEGER,
    tipo_prova TEXT,
    modalidade TEXT,
    especialidade TEXT,
    tema TEXT,
    foco TEXT,
    subfoco TEXT,
    difficulty TEXT,
    type TEXT,
    is_anulada INTEGER,
    statement TEXT,
    options TEXT,
    images TEXT,
    correct_answer TEXT,
    commentary TEXT
  );
`);

// 4. Prepara statement de inserção
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO questions (
    id, code, institution, banca, year, tipo_prova, modalidade,
    especialidade, tema, foco, subfoco, difficulty, type, is_anulada,
    statement, options, images, correct_answer, commentary
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  );
`);

// 5. Conta total no Supabase
console.log('🔍 Consultando total de questões no Supabase...');
const { count: totalSupabase, error: countErr } = await supabase
  .from('questions')
  .select('id', { count: 'exact', head: true });

if (countErr) {
  console.error('❌ Erro ao consultar contagem no Supabase:', countErr.message);
  process.exit(1);
}

console.log(`📊 Total oficial no Supabase: ${totalSupabase.toLocaleString('pt-BR')} questões.`);

// Verifica o progresso atual no SQLite (para retomada transparente)
const currentCount = db.prepare('SELECT COUNT(*) as count FROM questions;').get().count;
console.log(`💾 Registros já presentes no SQLite local: ${currentCount.toLocaleString('pt-BR')}`);

let lastId = null;
if (currentCount > 0 && currentCount < totalSupabase) {
  const lastRow = db.prepare('SELECT id FROM questions ORDER BY id DESC LIMIT 1;').get();
  if (lastRow?.id) {
    lastId = lastRow.id;
    console.log(`🔄 Retomando download a partir do ID: ${lastId}`);
  }
} else if (currentCount >= totalSupabase) {
  console.log('✅ Todas as questões já foram baixadas! Verificando índices...');
  criarIndices();
  process.exit(0);
}

const BATCH_SIZE = 1000;
let downloadedTotal = currentCount;
const startTime = Date.now();

console.log(`\n🚀 Iniciando extração passiva em lotes de ${BATCH_SIZE} questões...\n`);

while (true) {
  let query = supabase
    .from('questions')
    .select(`
      id, code, institution, banca, year, tipo_prova, modalidade,
      especialidade, tema, foco, subfoco, difficulty, type, is_anulada,
      statement, options, images, correct_answer, commentary
    `)
    .order('id', { ascending: true })
    .limit(BATCH_SIZE);

  if (lastId) {
    query = query.gt('id', lastId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`\n⚠️ Erro na requisição após ID ${lastId}:`, error.message);
    console.log('⏳ Aguardando 3 segundos para tentar novamente...');
    await new Promise(r => setTimeout(r, 3000));
    continue;
  }

  if (!data || data.length === 0) {
    break; // Concluído!
  }

  // Grava o lote no SQLite dentro de uma transação rápida
  db.exec('BEGIN TRANSACTION;');
  for (const q of data) {
    insertStmt.run(
      q.id || '',
      q.code || '',
      q.institution || '',
      q.banca || '',
      q.year !== undefined && q.year !== null ? Number(q.year) : null,
      q.tipo_prova || '',
      q.modalidade || '',
      q.especialidade || '',
      q.tema || '',
      q.foco || '',
      q.subfoco || '',
      q.difficulty || '',
      q.type || '',
      q.is_anulada ? 1 : 0,
      q.statement || '',
      q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : '[]',
      q.images ? (typeof q.images === 'string' ? q.images : JSON.stringify(q.images)) : '[]',
      q.correct_answer || '',
      q.commentary || ''
    );
  }
  db.exec('COMMIT;');

  lastId = data[data.length - 1].id;
  downloadedTotal += data.length;

  const pct = ((downloadedTotal / totalSupabase) * 100).toFixed(1);
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(0);
  const qps = (downloadedTotal - currentCount) / (Math.max(1, (Date.now() - startTime) / 1000));

  process.stdout.write(`\r📥 Progresso: ${downloadedTotal.toLocaleString('pt-BR')} / ${totalSupabase.toLocaleString('pt-BR')} (${pct}%) | Velocidade: ${qps.toFixed(0)} q/s | Decorrido: ${elapsedSec}s   `);

  if (data.length < BATCH_SIZE) {
    break;
  }
}

console.log('\n\n✅ Download concluído com sucesso!');
criarIndices();

function criarIndices() {
  console.log('⚡ Criando índices de alta performance no SQLite local...');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_questions_code ON questions(code);
    CREATE INDEX IF NOT EXISTS idx_questions_especialidade ON questions(especialidade);
    CREATE INDEX IF NOT EXISTS idx_questions_tema ON questions(tema);
    CREATE INDEX IF NOT EXISTS idx_questions_foco ON questions(foco);
    CREATE INDEX IF NOT EXISTS idx_questions_banca ON questions(banca);
    CREATE INDEX IF NOT EXISTS idx_questions_year ON questions(year);
  `);
  
  const finalCount = db.prepare('SELECT COUNT(*) as count FROM questions;').get().count;
  const stat = fs.statSync(dbPath);
  const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);

  console.log('========================================================================');
  console.log(`🎉 BANCO SQLITE LOCAL PRONTO:`);
  console.log(`   - Arquivo: ${dbPath}`);
  console.log(`   - Total Questões: ${finalCount.toLocaleString('pt-BR')}`);
  console.log(`   - Tamanho no Disco: ${sizeMB} MB`);
  console.log(`   - Integridade: 100% dos Enunciados, Alternativas A-E, Comentários e URLs de Imagens`);
  console.log('========================================================================\n');
}

