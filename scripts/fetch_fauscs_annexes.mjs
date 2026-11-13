async function fetchPage(id) {
  const url = `https://fauscs.selecao.net.br/informacoes/${id}/`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log(`Status ${id}: ${res.status}`);
  if (!res.ok) return;
  const html = await res.text();
  const pdfs = [...html.matchAll(/href="([^"]+\.pdf)"[^>]*>([^<]+)/gi)];
  for (const p of pdfs) {
    console.log(`[${id}] ${p[2].trim()} -> ${p[1]}`);
  }
}

async function main() {
  await fetchPage(28);
  await fetchPage(29);
}

main();
