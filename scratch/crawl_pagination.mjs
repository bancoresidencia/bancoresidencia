import fs from 'fs';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

async function crawlAreaMedica(year, baseUrl) {
  const allPdfLinks = [];
  let pageIndex = 0;

  while (true) {
    const pageUrl = pageIndex === 0 ? baseUrl : `${baseUrl}?b_start:int=${pageIndex * 20}`;
    console.log(`Checking [${year}] page ${pageIndex}: ${pageUrl}`);
    try {
      const res = await fetch(pageUrl, { headers });
      if (!res.ok) {
        console.log(`Stop status ${res.status}`);
        break;
      }
      const html = await res.text();
      
      const linkRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let count = 0;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        let href = match[1];
        let text = match[2].replace(/<[^>]+>/g, '').trim();
        if (href.startsWith('/')) href = 'https://www.gov.br' + href;
        
        const lower = (text + ' ' + href).toLowerCase();
        if (lower.includes('.pdf') && (lower.includes('gabarito') || lower.includes('acesso direto') || lower.includes('prm') || lower.includes('prova') || lower.includes('caderno'))) {
          allPdfLinks.push({ text, href });
          count++;
        }
      }

      console.log(`Found ${count} candidates on page ${pageIndex}`);
      
      if (!html.includes('b_start:int=' + ((pageIndex + 1) * 20))) {
        console.log(`Reached last page for ${year}`);
        break;
      }
      pageIndex++;
    } catch (e) {
      console.error('Error:', e.message);
      break;
    }
  }

  return allPdfLinks;
}

async function main() {
  const y21 = await crawlAreaMedica('2021-2022', 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022/area-medica');
  const y22 = await crawlAreaMedica('2022-2023', 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/area-medica');
  
  fs.writeFileSync('d:/bancoresidencia/data/enare_test/y21_y22_links.json', JSON.stringify({
    '2021-2022': y21,
    '2022-2023': y22
  }, null, 2), 'utf8');
  console.log('Saved y21_y22_links.json');
}

main();
