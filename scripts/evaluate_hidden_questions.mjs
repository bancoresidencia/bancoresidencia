import { SanarMassCrawler } from './sanar_mass_crawler.mjs';

async function evaluateHidden() {
  console.log('=== AVALIAÇÃO DE QUESTÕES DOS SITEMAPS (QUESTÕES "OCULTAS") ===\n');

  // Let's get 5 URLs from sitemap 2 (which is deeper in the catalog)
  const smRes = await fetch('https://sanarmed.com/questao-sitemap2.xml', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const smText = await smRes.text();
  const locs = [...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

  console.log(`Encontradas ${locs.length} URLs no questao-sitemap2.xml.`);
  console.log(`Testando 5 questões representativas...\n`);

  const crawler = new SanarMassCrawler();

  for (let i = 0; i < 5; i++) {
    const url = locs[i * 150]; // amostras espaçadas
    console.log(`--- Testando amostra #${i + 1}: ${url} ---`);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`  HTTP Status: ${res.status}`);
    const html = await res.text();

    const hasWpData = html.includes('id="wordpress-question-data"');
    console.log(`  Contém JSON nativo (wordpress-question-data): ${hasWpData}`);

    if (hasWpData) {
      const match = html.match(/<script type="application\/json" id="wordpress-question-data">([\s\S]*?)<\/script>/i);
      const data = JSON.parse(match[1]);
      console.log(`  ID: ${data.id}`);
      console.log(`  Instituição: ${data.institution?.name || 'Não informada'}`);
      console.log(`  Ano: ${data.year || 'Não informado'}`);
      console.log(`  Alternativas disponíveis: ${data.alternatives?.length}`);
      const correct = data.alternatives?.find(a => a.correct === true);
      console.log(`  Gabarito homologado: ${correct ? `Índice ${correct.index} (${String.fromCharCode(65 + correct.index)})` : 'Não identificado'}`);
      console.log(`  Possui imagens no enunciado: ${(data.statement || '').includes('<img')}`);
      console.log(`  Comentários presentes no HTML original da Sanar: ${Boolean(data.comment_text)} (serão descartados)`);
      console.log(`  Viabilidade de coleta: 100% VIÁVEL\n`);
    }
  }
}

evaluateHidden().catch(console.error);
