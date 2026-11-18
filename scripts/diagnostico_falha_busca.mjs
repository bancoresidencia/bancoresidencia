import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const t = l.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testDiagnostic() {
  const codes = ['IOG-2024-CLM-21481', 'HMG-2022-MPS-4615', 'HAS-2025-CLM-14558'];
  const { data: qs } = await supabase.from('questions').select('code, statement, options, year, institution').in('code', codes);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const q of qs) {
    console.log(`\n======================================================`);
    console.log(`DIAGNÓSTICO PARA: ${q.code} (${q.institution} - ${q.year})`);
    const stmtClean = (q.statement || '').replace(/\s+/g, ' ').trim();
    const optClean = (q.options?.[0]?.text || '').replace(/\s+/g, ' ').trim();
    console.log(`Enunciado (${stmtClean.length} chars): ${stmtClean.slice(0, 120)}...`);
    console.log(`Alternativa A (${optClean.length} chars): ${optClean.slice(0, 60)}...`);

    // Busca Bing
    const query = `${stmtClean} ${optClean}`.trim();
    const searchUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(query);
    console.log(`Query enviada: ${query.slice(0, 100)}...`);

    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 15000 });
    const results = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('li.b_algo h2 a, #b_results .b_title a').forEach(a => {
        links.push({ title: a.innerText.trim(), href: a.href });
      });
      return links;
    });

    console.log(`Resultados encontrados no Bing (${results.length}):`);
    results.forEach((r, idx) => {
      console.log(`  [${idx+1}] ${r.title.slice(0, 60)} -> ${r.href.slice(0, 80)}`);
    });
  }

  await browser.close();
}

testDiagnostic();
