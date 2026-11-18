import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data: q } = await supabase.from('questions').select('code, statement, options').eq('code', 'UNIVERSIDADE-2020-OBS-11524').single();
  if (!q) { console.log('Questão não encontrada'); return; }
  
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();
  
  const stmt = q.statement.replace(/\s+/g, ' ').trim();
  const altA = (q.options[0]?.text || '').replace(/\s+/g, ' ').trim();
  const query = stmt + ' ' + altA;
  
  console.log('Questão:', q.code);
  console.log('Query chars:', query.length);
  console.log('Query:', query);
  
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(query), { waitUntil: 'domcontentloaded', timeout: 15000 });
  
  // Pega TODOS os links, não só h2
  const allLinks = await page.evaluate(() => {
    const links = [];
    document.querySelectorAll('a').forEach(a => {
      if (a.href && !a.href.includes('javascript:') && a.innerText.trim()) {
        links.push({ text: a.innerText.trim().slice(0, 60), href: a.href });
      }
    });
    return links;
  });
  
  const decoded = [];
  for (const lk of allLinks) {
    if (lk.href.includes('u=a1')) {
      const b64 = lk.href.split('u=a1')[1].split('&')[0];
      try {
        const dec = Buffer.from(b64.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8');
        if (dec.startsWith('http')) decoded.push({ text: lk.text, url: dec });
      } catch {}
    } else if (lk.href.startsWith('http') && !lk.href.includes('bing.com')) {
      decoded.push({ text: lk.text, url: lk.href });
    }
  }
  
  console.log('\nTODOS os links decodificados:', decoded.length);
  decoded.slice(0, 15).forEach(l => console.log(' -', l.url, '|', l.text));
  
  // Verifica o que os primeiros sites retornam
  for (const { url } of decoded.slice(0, 3)) {
    try {
      const resp = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124', 'Accept': 'text/html' },
        signal: AbortSignal.timeout(8000)
      });
      const html = await resp.text();
      const hasGabarito = html.match(/Gabarito|gabarito|correct_answer|correta|is-correct/gi);
      console.log('\n URL:', url);
      console.log(' Status:', resp.status, 'Gabarito clues:', hasGabarito?.length || 0);
      if (hasGabarito?.length > 0) {
        console.log('  SAMPLE:', html.slice(0, 300));
      }
    } catch (e) {
      console.log(' URL:', url, 'ERROR:', e.message.slice(0, 50));
    }
  }
  
  await browser.close();
})();
