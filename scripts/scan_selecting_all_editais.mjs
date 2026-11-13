import fs from 'fs';

async function scanEditais() {
  console.log('Varrendo editais públicos no portal Selecting...');
  for (let id = 1; id <= 60; id++) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const html = await res.text();
      const titleMatch = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      if (/resid[eê]ncia|m[eé]dic|fubog|oftalm/i.test(html)) {
        console.log(`[EDITAL ${id}] ${title}`);
        const pdfMatches = [...html.matchAll(/href=["'](https?:\/\/concursos\.selecting\.com\.br\/arquivo\.php\?file=[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
        for (const pm of pdfMatches) {
          const label = pm[2].replace(/<[^>]+>/g, '').trim();
          if (/gabarito|caderno|prova/i.test(label)) {
            console.log(`   -> [${label}] ${pm[1]}`);
          }
        }
      }
    } catch (e) {}
  }
}

scanEditais().catch(console.error);

