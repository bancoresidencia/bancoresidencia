import fs from 'fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const urls = [
    'https://enare2026.conhecimento.fgv.br/provas/',
    'https://enare2026.conhecimento.fgv.br/'
  ];

  for (const u of urls) {
    try {
      console.log(`\nFetching ${u}...`);
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const links = [];
      const matches = html.matchAll(/href=["']([^"']+)["']/gi);
      for (const m of matches) {
        links.push(m[1]);
      }
      console.log(`Found ${links.length} total links on ${u}`);
      const pdfs = links.filter(l => l.toLowerCase().includes('.pdf'));
      console.log(`Found ${pdfs.length} PDF links on ${u}:`);
      pdfs.forEach(p => console.log(' - ' + p));
      
      const relevant = links.filter(l => /prova|gabarito|edital|concurso/i.test(l));
      console.log(`Relevant links (${relevant.length}):`);
      relevant.slice(0, 30).forEach(r => console.log(' * ' + r));
    } catch (e) {
      console.error(`Error on ${u}:`, e.message);
    }
  }
}

main();
