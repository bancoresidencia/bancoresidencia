import fs from 'fs';

async function scan() {
  for (const id of [10, 11, 12, 13, 14, 15, 18, 20, 24, 28, 30, 42, 43, 44]) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) continue;
    const html = await res.text();
    const files = [...html.matchAll(/arquivo\.php\?file=([^"']+)/g)].map(m => m[1]);
    const pMatches = [...html.matchAll(/<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    if (files.length > 0) {
      console.log(`[EDITAL ${id}] ${pMatches[0] || 'Edital'} -> ${files.length} arquivos encontrados`);
      for (let i = 0; i < Math.min(files.length, pMatches.length); i++) {
        if (/gabarito|caderno|prova/i.test(pMatches[i])) {
          console.log(`   -> [${pMatches[i]}]`);
        }
      }
    }
  }
}

scan().catch(console.error);

