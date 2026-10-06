import fs from 'fs';

async function testFetch() {
  const url = 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas/area-medica/programa-de-residencia-com-acesso-direto-todos-os-programas-t361-tipo-1.pdf/@@download/file';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    console.log('Node fetch status:', res.status);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync('d:/bancoresidencia/data/enare_test', { recursive: true });
      fs.writeFileSync('d:/bancoresidencia/data/enare_test/enare_2023_prova.pdf', buf);
      console.log('Saved PDF successfully, size bytes:', buf.length);
    }
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

testFetch();
