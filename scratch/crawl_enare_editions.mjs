import fs from 'fs';

const editions = [
  { year: '2021', name: '2020-2021', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2020-2021/provas' },
  { year: '2022', name: '2021-2022', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022/provas' },
  { year: '2023', name: '2022-2023', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/provas' },
  { year: '2024', name: '2023-2024', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas' },
  { year: '2025', name: '2024-2025', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024-2025/provas' }
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function crawl() {
  const result = {};

  for (const ed of editions) {
    console.log(`\nFetching ${ed.name}...`);
    try {
      const res = await fetch(ed.url, { headers });
      if (!res.ok) {
        console.warn(`[HTTP ${res.status}] for ${ed.url}`);
        continue;
      }
      const html = await res.text();
      
      // Match all <a href="...">...</a>
      const linkRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      const found = [];
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        let href = match[1];
        let text = match[2].replace(/<[^>]+>/g, '').trim();
        
        if (href.startsWith('/')) {
          href = 'https://www.gov.br' + href;
        }

        const lowerHref = href.toLowerCase();
        const lowerText = text.toLowerCase();

        if (lowerHref.includes('.pdf') || lowerText.includes('.pdf') || lowerText.includes('acesso direto') || lowerText.includes('gabarito')) {
          found.push({ text, href });
        }
      }

      result[ed.year] = found;
      console.log(`Found ${found.length} relevant links for ${ed.year}`);
    } catch (e) {
      console.error(`Error fetching ${ed.year}:`, e.message);
    }
  }

  fs.writeFileSync('d:/bancoresidencia/data/enare_test/crawled_links.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('Saved crawled_links.json');
}

crawl();
