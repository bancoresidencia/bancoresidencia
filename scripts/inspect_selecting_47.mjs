async function inspectSelectingEdital47() {
  const u = 'https://portal.concursos.selecting.com.br/edital/ver/47';
  const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();
  console.log('Edital 47 length:', text.length);
  // find headers or table content
  const matches = [...text.matchAll(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('Headers:', matches);

  // find all links
  const links = [...text.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
  console.log('Total links:', links.length);
  links.filter(l => l.includes('download') || l.includes('arquivo') || l.includes('pdf') || l.includes('documento')).forEach(l => console.log(' ->', l));
}
inspectSelectingEdital47();
