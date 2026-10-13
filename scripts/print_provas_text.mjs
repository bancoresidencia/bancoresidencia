process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const url = 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas';
  const res = await fetch(url);
  const html = await res.text();
  // Strip tags
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  console.log(text.slice(0, 2500));
}

main();
