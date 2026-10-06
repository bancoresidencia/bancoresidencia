import fs from 'fs';

async function download2021() {
  const provaUrl = 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2020-2021/provas/area-medica/prm-acesso-direto-m209-divulgacao.pdf/@@download/file';
  const gabUrl = 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2020-2021/provas/area-medica/gabarito-pos-recursos-acesso-e-outros.pdf/@@download/file';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  const res1 = await fetch(provaUrl, { headers });
  console.log('2021 Prova status:', res1.status);
  if (res1.ok) {
    fs.mkdirSync('d:/bancoresidencia/data/enare_raw', { recursive: true });
    fs.writeFileSync('d:/bancoresidencia/data/enare_raw/enare_2021_prova.pdf', Buffer.from(await res1.arrayBuffer()));
    console.log('Saved enare_2021_prova.pdf');
  }

  const res2 = await fetch(gabUrl, { headers });
  console.log('2021 Gabarito status:', res2.status);
  if (res2.ok) {
    fs.writeFileSync('d:/bancoresidencia/data/enare_raw/enare_2021_gabarito.pdf', Buffer.from(await res2.arrayBuffer()));
    console.log('Saved enare_2021_gabarito.pdf');
  }
}

download2021();
