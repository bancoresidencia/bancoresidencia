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

function slugify(text, maxWords = 10) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join('-');
}

async function testSample() {
  // Get 3 questions from Mandic (Lote 6)
  const { data: mandic } = await supabase.from('questions')
    .select('id, code, statement, options')
    .ilike('institution', '%Mandic%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(3);

  console.log('=== MANDIC SAMPLES ===');
  for (const q of mandic || []) {
    console.log(`\nCode: ${q.code}`);
    console.log(`Statement: ${q.statement.slice(0, 100)}...`);
    for (const w of [6, 8, 10, 12]) {
      const slug = slugify(q.statement, w);
      const url = `https://sanarmed.com/q/${slug}/`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`  Slug (${w} words): ${slug} -> Status ${res.status}`);
      if (res.ok) {
        console.log(`    FOUND! URL: ${url}`);
        break;
      }
    }
  }
}

testSample();
