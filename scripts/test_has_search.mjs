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

async function testHasSearch() {
  const { data: qObj } = await supabase.from('questions').select('statement, options').eq('code', 'HAS-2025-CLM-14558').single();
  const stmt = qObj.statement.replace(/\s+/g, ' ').trim();
  const optA = (qObj.options?.[0]?.text || '').replace(/\s+/g, ' ').trim();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Test 1: Full text without quotes (truncated to 200 chars if long)
  const qFull = `${stmt} ${optA}`.slice(0, 220);
  console.log('Query enviada (220 chars):', qFull);

  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(qFull), { waitUntil: 'networkidle' });

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('li.b_algo h2 a')).map(a => a.href);
  });

  console.log(`Total links: ${links.length}`);
  links.forEach(l => {
    if (l.includes('u=a1')) {
      const b64 = l.split('u=a1')[1].split('&')[0];
      const dec = Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      console.log('  ->', dec);
    }
  });

  await browser.close();
}

testHasSearch();
