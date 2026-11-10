import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Carrega credenciais do .env.local
const env = {};
const envPath = path.join(ROOT_DIR, '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas.');
  process.exit(1);
}

const STAGING_DIR = path.join(ROOT_DIR, 'data', 'bancos_organizados_staging');

const TARGETS = [
  {
    dbName: 'titulo_especialista.db',
    tablePrefix: 'questions_expansion_titulo_especialista',
    codePrefix: 'EXP-TIT',
    display: 'Título de Especialista (857 q)'
  },
  {
    dbName: 'revalida.db',
    tablePrefix: 'questions_expansion_revalida',
    codePrefix: 'EXP-REV',
    display: 'Revalida (1.465 q)'
  },
  {
    dbName: 'r_plus.db',
    tablePrefix: 'questions_expansion_r_plus',
    codePrefix: 'EXP-RPL',
    display: 'R+ Especialidades (45.055 q)'
  },
  {
    dbName: 'residencia_acesso_direto.db',
    tablePrefix: 'questions_expansion_direto',
    codePrefix: 'EXP-DIR',
    display: 'Residência Médica Acesso Direto (49.483 q)'
  }
];

const BATCH_SIZE = 200;
const CONCURRENCY = 10;
const CHECKPOINT_FILE = path.join(STAGING_DIR, 'merge_to_questions_checkpoint.json');

let checkpoint = {};
if (fs.existsSync(CHECKPOINT_FILE)) {
  try {
    checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
  } catch (e) {
    checkpoint = {};
  }
}

function saveCheckpoint(dbName, lastIndex) {
  checkpoint[dbName] = lastIndex;
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf8');
}

function cleanNullChars(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\0/g, '').replace(/\\u0000/g, '');
}

async function loadRowsFromSqlite(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
    });
    db.all("SELECT * FROM questoes ORDER BY id_staging ASC", (err, rows) => {
      db.close();
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// UUID v5 determinístico
import crypto from 'crypto';
function uuidv5(name, namespace) {
  const nsBytes = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  const nameBytes = Buffer.from(name, 'utf8');
  const hash = crypto.createHash('sha1').update(nsBytes).update(nameBytes).digest();
  
  hash[6] = (hash[6] & 0x0f) | 0x50; // Version 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // Variant RFC 4122
  
  const hex = hash.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

function transformRowToPayload(row, config) {
  const idStaging = row.id_staging;
  const qUuid = uuidv5(`${config.tablePrefix}_${idStaging}`, DNS_NAMESPACE);
  const code = `${config.codePrefix}-${String(idStaging).padStart(6, '0')}`;

  const gabarito = (row.gabarito || '').trim().toUpperCase();
  const hasGabarito = ['A', 'B', 'C', 'D', 'E'].includes(gabarito);

  let options = [];
  if (row.opcoes_json) {
    try {
      const parsed = typeof row.opcoes_json === 'string' ? JSON.parse(row.opcoes_json) : row.opcoes_json;
      if (Array.isArray(parsed)) {
        options = parsed.map((opt, i) => {
          let letter = opt.letter;
          if (!letter) {
            const idx = opt.index !== undefined ? opt.index : i;
            letter = idx < 26 ? String.fromCharCode(65 + Number(idx)) : String(idx);
          }
          return {
            letter: String(letter).trim().toUpperCase(),
            text: cleanNullChars(opt.text || ''),
            explanation: opt.explanation ? cleanNullChars(opt.explanation) : null
          };
        });
      }
    } catch (e) {
      options = [];
    }
  }

  let ano = row.ano;
  try {
    ano = parseInt(ano, 10);
    if (isNaN(ano) || ano < 1900) ano = null;
  } catch (e) {
    ano = null;
  }

  return {
    id: qUuid,
    code: code,
    institution: cleanNullChars(row.instituicao) || 'N/A',
    banca: cleanNullChars(row.banca) || 'N/A',
    year: ano,
    tipo_prova: cleanNullChars(row.tipo_prova) || 'Residência Médica',
    modalidade: cleanNullChars(row.modalidade) || 'Residência Médica',
    especialidade: cleanNullChars(row.especialidade) || 'Clínica Geral',
    tema: cleanNullChars(row.tema) || 'Geral',
    foco: cleanNullChars(row.foco) || 'Geral',
    subfoco: cleanNullChars(row.subfoco) || 'Geral',
    difficulty: cleanNullChars(row.dificuldade) || 'Média',
    type: 'Múltipla escolha',
    is_anulada: Boolean(row.is_anulada),
    statement: cleanNullChars(row.enunciado || ''),
    options: options,
    correct_answer: gabarito || null,
    commentary: row.comentarios ? cleanNullChars(row.comentarios) : null,
    images: [],
    has_gabarito: hasGabarito,
    created_at: new Date().toISOString()
  };
}

async function uploadBatchWithRetry(batch, attempt = 1) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify(batch)
    });
    if (res.ok) return true;
    if (attempt <= 4) {
      await new Promise(r => setTimeout(r, 500 * attempt));
      return uploadBatchWithRetry(batch, attempt + 1);
    }
    const err = await res.text();
    console.error(`❌ Erro no lote: HTTP ${res.status} - ${err.slice(0, 150)}`);
    return false;
  } catch (e) {
    if (attempt <= 4) {
      await new Promise(r => setTimeout(r, 600 * attempt));
      return uploadBatchWithRetry(batch, attempt + 1);
    }
    console.error(`❌ Exceção de rede: ${e.message}`);
    return false;
  }
}

async function processTarget(target) {
  const dbPath = path.join(STAGING_DIR, target.dbName);
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 Processando: ${target.display}`);
  console.log(`   Origem: ${dbPath}`);
  console.log(`${'='.repeat(70)}`);

  const rawRows = await loadRowsFromSqlite(dbPath);
  console.log(`   Carregadas ${rawRows.length.toLocaleString('pt-BR')} questões do SQLite.`);

  const startIndex = checkpoint[target.dbName] || 0;
  if (startIndex >= rawRows.length) {
    console.log(`   ✅ Tabela já concluída anteriormente (checkpoint: ${startIndex}/${rawRows.length}).`);
    return rawRows.length;
  }

  const pendingRows = rawRows.slice(startIndex);
  console.log(`   Processando a partir do registro ${startIndex + 1} (${pendingRows.length.toLocaleString('pt-BR')} pendentes)...`);

  const batches = [];
  for (let i = 0; i < pendingRows.length; i += BATCH_SIZE) {
    const chunk = pendingRows.slice(i, i + BATCH_SIZE).map(r => transformRowToPayload(r, target));
    batches.push({ offset: startIndex + i + chunk.length, chunk });
  }

  let batchPointer = 0;
  let successCount = startIndex;
  const t0 = Date.now();

  async function worker(id) {
    while (batchPointer < batches.length) {
      const bIdx = batchPointer++;
      const { offset, chunk } = batches[bIdx];
      const ok = await uploadBatchWithRetry(chunk);
      if (ok) {
        successCount += chunk.length;
      }
      if (bIdx % 10 === 0 || bIdx === batches.length - 1) {
        saveCheckpoint(target.dbName, offset);
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        const rate = ((successCount - startIndex) / (elapsed || 1)).toFixed(0);
        const pct = ((successCount / rawRows.length) * 100).toFixed(1);
        process.stdout.write(`\r   Progresso: ${successCount.toLocaleString('pt-BR')} / ${rawRows.length.toLocaleString('pt-BR')} (${pct}%) | ${rate} q/s`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  saveCheckpoint(target.dbName, rawRows.length);
  console.log(`\n   ✔ Concluído para ${target.display} em ${((Date.now() - t0) / 1000).toFixed(1)}s!`);
  return rawRows.length;
}

async function main() {
  console.log('='.repeat(70));
  console.log('INTEGRAÇÃO DAS 96.860 QUESTÕES DE EXPANSÃO NA TABELA PRINCIPAL questions');
  console.log(`Destino: ${SUPABASE_URL}`);
  console.log(`Concorrência: ${CONCURRENCY} workers | Lote: ${BATCH_SIZE} q`);
  console.log('='.repeat(70));

  let totalProcessed = 0;
  const startGlobal = Date.now();

  for (const t of TARGETS) {
    const count = await processTarget(t);
    totalProcessed += count;
  }

  console.log('\n' + '='.repeat(70));
  console.log(`✔ INTEGRAÇÃO CONCLUÍDA! ${totalProcessed.toLocaleString('pt-BR')} questões processadas em ${((Date.now() - startGlobal) / 1000).toFixed(1)}s.`);
  console.log('='.repeat(70));
}

main().catch(console.error);

