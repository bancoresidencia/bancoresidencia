import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const q = stagingDb.prepare('SELECT id, images FROM questions_curated_staging WHERE id = ?')
  .get('questions_1550514f-0e3f-484a-b90a-efe9764e5788');
console.log('Local SQLite images:', q.images);

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

const { data, error } = await supabase.from('questions').select('id, images').eq('id', '1550514f-0e3f-484a-b90a-efe9764e5788').single();
console.log('Remote Supabase images:', data ? data.images : error);
