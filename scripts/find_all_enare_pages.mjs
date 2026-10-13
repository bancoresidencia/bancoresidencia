process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const pages = [
    'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024-2025',
    'https://www.gov.br/ebserh/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024/area-do-candidato',
    'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024-2025/provas/area-medica',
    'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/provas/area-medica',
    'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022/provas/area-medica',
    'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2020-2021/provas/area-medica'
  ];

  for (const p of pages) {
    try {
      const res = await fetch(p);
      console.log(`${p} -> Status ${res.status}`);
      if (res.status === 200) {
        const html = await res.text();
        const matches = Array.from(html.matchAll(/href="([^"]+)"/gi)).map(m => m[1]);
        const ad = matches.filter(m => m.toLowerCase().includes('acesso-direto') || m.toLowerCase().includes('gabarito'));
        if (ad.length > 0) {
          console.log(`  Relevant links in ${p}:`, ad);
        }
      }
    } catch(e) {
      console.error(e.message);
    }
  }
}

main();
