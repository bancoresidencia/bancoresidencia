import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const matchesData = JSON.parse(fs.readFileSync('data/sanar_matches_round2.json', 'utf8'));
const matches = matchesData.matches.filter(m => m.dbImagesCount > 0);

const validTables = ['questions', 'questions_expansion_direto', 'questions_expansion_r_plus', 'questions_expansion_revalida', 'questions_expansion_titulo_especialista'];

function getRemoteTableAndId(fullId) {
  let sourceTable = 'questions';
  let cleanId = fullId;
  for (const vt of validTables) {
    if (cleanId.startsWith(vt + '_')) {
      cleanId = cleanId.replace(vt + '_', '');
      sourceTable = vt;
      break;
    }
  }
  if (cleanId.startsWith('questions_')) {
    cleanId = cleanId.replace('questions_', '');
    sourceTable = 'questions';
  }
  return { sourceTable, cleanId, isLocalOnly: fullId.startsWith('pdr_') };
}

async function fixRemote() {
  console.log(`Fixing remote table for 52 questions...`);
  for (const m of matches) {
    const qId = m.stagingId;
    const cleanQId = qId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `resgatadas/resgatada_${cleanQId}.webp`;
    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    const publicUrl = pubData.publicUrl;

    const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(qId);
    if (!isLocalOnly) {
      const { error } = await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanId);
      if (error) console.error(`Error on ${sourceTable}/${cleanId}:`, error.message);
    }
  }
  console.log('Remote fix done!');

  // Reload dashboard
  try {
    const res = await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
    console.log('Dashboard reload response:', res.status);
  } catch (e) {
    console.warn('Dashboard reload failed:', e.message);
  }
}

fixRemote().catch(console.error);
