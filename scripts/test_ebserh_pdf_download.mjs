process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const url1 = 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas/area-medica/programa-de-residencia-com-acesso-direto-todos-os-programas-t361-tipo-1.pdf/@@download/file';
  const url2 = 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas/area-medica/gabarito-pre-requisito-ano-adicional-area-de-atuacao-e-acesso-direto.pdf/@@download/file';

  for (const u of [url1, url2]) {
    console.log(`Downloading ${u}...`);
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('Status:', res.status, 'Content-Type:', res.headers.get('content-type'));
    const buf = await res.arrayBuffer();
    console.log('Size:', buf.byteLength);
  }
}

main();
