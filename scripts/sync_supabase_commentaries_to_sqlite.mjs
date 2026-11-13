import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

db.exec(`
  DROP TABLE IF EXISTS supabase_live_commentaries;
  CREATE TABLE supabase_live_commentaries (
    id TEXT PRIMARY KEY,
    supabase_table TEXT,
    commentary TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_slc_id ON supabase_live_commentaries(id);
`);

const insertComm = db.prepare(`
  INSERT OR REPLACE INTO supabase_live_commentaries (id, supabase_table, commentary)
  VALUES (?, ?, ?)
`);

const tablesWithComm = ['questions_direto', 'questions_revalida', 'questions_rplus'];

async function fetchCommentariesForTable(table) {
  console.log(`\n📥 Coletando comentários completos de '${table}'...`);
  const pageSize = 1000;
  let lastId = null;
  let totalFetched = 0;
  const t0 = Date.now();

  while (true) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=id,commentary&commentary=not.is.null&commentary=neq.&limit=${pageSize}&order=id.asc`;
    if (lastId) {
      url += `&id=gt.${encodeURIComponent(lastId)}`;
    }

    let res = null;
    let attempt = 0;
    while (attempt < 5) {
      try {
        attempt++;
        res = await fetch(url, {
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`
          }
        });
        if (res.ok) break;
        await new Promise(r => setTimeout(r, 400 * attempt));
      } catch (e) {
        if (attempt >= 5) throw e;
        await new Promise(r => setTimeout(r, 400 * attempt));
      }
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) break;

    db.exec('BEGIN TRANSACTION');
    for (const r of rows) {
      insertComm.run(String(r.id), table, r.commentary || '');
      lastId = String(r.id);
    }
    db.exec('COMMIT');

    totalFetched += rows.length;
    if (totalFetched % 25000 === 0 || rows.length < pageSize) {
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  ⏳ ${table}: ${totalFetched.toLocaleString('pt-BR')} comentários salvos em ${sec}s...`);
    }
  }

  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  ✅ ${table} concluído: ${totalFetched.toLocaleString('pt-BR')} comentários em ${sec}s.`);
}

async function run() {
  console.log('='.repeat(75));
  console.log('📥 SINCRONIZANDO COMENTÁRIOS DO SUPABASE PARA O SQLITE LOCAL');
  console.log('='.repeat(75));
  for (const t of tablesWithComm) {
    await fetchCommentariesForTable(t);
  }
  const total = db.prepare('SELECT count(*) as c FROM supabase_live_commentaries').get().c;
  const takeHome = db.prepare("SELECT count(*) as c FROM supabase_live_commentaries WHERE commentary LIKE '%Take-Home%'").get().c;
  console.log('\n' + '='.repeat(75));
  console.log(`🎉 Coleta finalizada! Total salvo no SQLite: ${total.toLocaleString('pt-BR')} comentários`);
  console.log(`   Com Take-Home Message Padrão-Ouro: ${takeHome.toLocaleString('pt-BR')} comentários`);
  console.log('='.repeat(75));
}

run().catch(console.error);

