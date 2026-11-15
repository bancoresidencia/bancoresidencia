import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectOrphanQuestions() {
  // USCS
  const { data: uscs } = await supabase.from('questions')
    .select('id, code, year, institution, statement, options')
    .ilike('institution', '%Caetano%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(3);
    
  console.log('--- SAMPLE USCS ---');
  for (const q of uscs || []) {
    console.log(`Code: ${q.code} | Year: ${q.year}`);
    console.log(`Statement: ${q.statement.slice(0, 150)}...`);
    console.log(`Options count: ${Array.isArray(q.options) ? q.options.length : typeof q.options}`);
    if (Array.isArray(q.options) && q.options.length > 0) {
      console.log(`Option A:`, q.options[0]);
    }
    console.log('----------------');
  }

  // UERJ
  const { data: uerj } = await supabase.from('questions')
    .select('id, code, year, institution, statement, options')
    .ilike('institution', '%UERJ%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(3);
    
  console.log('--- SAMPLE UERJ ---');
  for (const q of uerj || []) {
    console.log(`Code: ${q.code} | Year: ${q.year}`);
    console.log(`Statement: ${q.statement.slice(0, 150)}...`);
    console.log(`Options count: ${Array.isArray(q.options) ? q.options.length : typeof q.options}`);
    if (Array.isArray(q.options) && q.options.length > 0) {
      console.log(`Option A:`, q.options[0]);
    }
    console.log('----------------');
  }
}

inspectOrphanQuestions().catch(console.error);
