import fs from 'fs';

async function testFetchGabarito() {
  const url = 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas/area-medica/gabarito-pre-requisito-ano-adicional-area-de-atuacao-e-acesso-direto.pdf/@@download/file';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync('d:/bancoresidencia/data/enare_test/enare_2023_gabarito.pdf', buf);
    console.log('Saved gabarito PDF successfully, size bytes:', buf.length);
  }
}

testFetchGabarito();
