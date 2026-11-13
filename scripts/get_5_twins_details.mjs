import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const dbPath = path.resolve('data/questoes_132k.db');
const localDb = new DatabaseSync(dbPath, { readOnly: true });

async function main() {
  const preview = JSON.parse(fs.readFileSync('data/staging_questoes_gemeas_preview.json', 'utf8'));

  // Seleciona 5 pares com alta similaridade e diversidade de bancas
  const selectedPairs = [
    preview.find(p => p.similaridade === 100 && p.pendenteCode.includes('PSUPRMMT')),
    preview.find(p => p.similaridade === 100 && p.pendenteCode.includes('HSLRP')),
    preview.find(p => p.pendenteCode.includes('HEAAFMC')),
    preview.find(p => p.pendenteCode.includes('HMMSJP-2025')),
    preview.find(p => p.pendenteCode.includes('SANTACASADEA'))
  ].filter(Boolean);

  console.log('Pares selecionados:', selectedPairs.map(p => `${p.pendenteCode} <-> ${p.resolvidaCode} (${p.similaridade}%)`));

  const detailed = [];

  for (const pair of selectedPairs) {
    // Busca do Supabase a pendente
    const { data: pendDb } = await supabase
      .from('questions')
      .select('code, year, institution, statement, options, correct_answer')
      .eq('code', pair.pendenteCode)
      .single();

    // Busca do SQLite a resolvida
    const resDb = localDb.prepare('SELECT code, year, institution, statement, options, correct_answer FROM questions WHERE code = ?').get(pair.resolvidaCode);

    detailed.push({
      pendente: pendDb,
      resolvida: {
        ...resDb,
        options: typeof resDb.options === 'string' ? JSON.parse(resDb.options) : resDb.options
      },
      matchInfo: pair
    });
  }

  fs.writeFileSync('data/5_twins_detailed.json', JSON.stringify(detailed, null, 2));
  console.log('Salvo em data/5_twins_detailed.json');
}

main().catch(console.error);
