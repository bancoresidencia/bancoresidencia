import https from 'https';
import fs from 'fs';

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log('🔍 Varrendo seleções da UEL para Residência Médica...');
  const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  const results = [];

  for (const y of years) {
    const listUrl = `https://www.cops.uel.br/v2/Selecao/ListarSelecoes/ano/${y}/tipo/C`;
    try {
      const html = await fetchPage(listUrl);
      const regex = /<a[^>]+href=['"](\/v2\/Selecao\/DetalharSelecao\/Selecao\/\d+)['"][^>]*>(.*?)<\/a>/gi;
      let m;
      while ((m = regex.exec(html)) !== null) {
        const href = m[1];
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        if (title.toLowerCase().includes('resid') && title.toLowerCase().includes('médica')) {
          console.log(`  [${y}] ${title} -> https://www.cops.uel.br${href}`);
          results.push({ year: y, title, url: `https://www.cops.uel.br${href}` });
        }
      }
    } catch (e) {
      console.error(`Erro ano ${y}:`, e.message);
    }
  }

  console.log(`\nTotal de seleções de Residência Médica encontradas: ${results.length}`);
  fs.writeFileSync('data/uel_residencia_selecoes.json', JSON.stringify(results, null, 2), 'utf8');
}

run();
