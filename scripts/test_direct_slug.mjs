import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      env[k] = v;
    }
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function slugify(text, maxWords = 11) {
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

async function testDirectSlug() {
  const { data: qs } = await supabase.from('questions')
    .select('id, code, statement, options')
    .ilike('institution', '%São Caetano%')
    .eq('year', 2025)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(10);

  console.log(`Testando busca direta por slug em ${qs.length} questões da USCS 2025:`);

  for (const q of qs) {
    const slug = slugify(q.statement, 10);
    const url = `https://sanarmed.com/q/${slug}/`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      console.log(`[${q.code}] status: ${res.status} | URL: ${url}`);
      if (res.ok) {
        const html = await res.text();
        const m = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
        if (m) {
          const d = JSON.parse(m[1]);
          console.log(`   🎯 WINNER: ${d.mainEntity?.acceptedAnswer?.text}`);
        }
      }
    } catch (e) {
      console.log(`[${q.code}] err: ${e.message}`);
    }
  }
}

testDirectSlug();
