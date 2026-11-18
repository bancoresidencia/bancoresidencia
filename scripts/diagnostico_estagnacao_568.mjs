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

function cleanText(s) {
  return (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildPureStatementQuery(statement) {
  const rawClean = cleanText(statement);
  if (rawClean.length <= 160) return rawClean;
  const words = rawClean.split(' ').filter(Boolean);
  let q = '';
  for (const w of words) {
    if ((q + ' ' + w).trim().length > 150) break;
    q = (q + ' ' + w).trim();
  }
  return q || rawClean.slice(0, 150);
}

async function testDiagnostic() {
  const codes = ['CEOQ-2026-CLM-37129', 'HMASP-2022-PED-15082', 'SUSBA-2015-CIR-7542'];
  const { data: qs } = await supabase.from('questions').select('code, statement, options, institution, year').in('code', codes);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const q of qs) {
    console.log(`\n======================================================`);
    console.log(`CODE: ${q.code} (${q.institution} - ${q.year})`);
    const qStmt = buildPureStatementQuery(q.statement);
    console.log(`Statement puro (${qStmt.length} chars): ${qStmt}`);

    await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(qStmt), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const items = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('li.b_algo')).map(li => {
        const a = li.querySelector('h2 a');
        const cite = li.querySelector('cite');
        return {
          title: a?.innerText?.trim(),
          href: a?.href,
          cite: cite?.innerText?.trim()
        };
      });
    });

    console.log(`Total resultados Bing: ${items.length}`);
    items.forEach((it, i) => {
      console.log(`  [${i+1}] ${it.title?.slice(0, 60)} | Cite: ${it.cite}`);
    });
  }

  await browser.close();
}

testDiagnostic();
