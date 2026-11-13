async function checkUcampMain() {
  const url = 'https://ucamp.org.br/residencia-medica';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('HTML length:', html.length);
  const links = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
  console.log('Total links:', links.length);
  for (const l of links) {
    if (l.includes('pdf') || l.includes('bibliotecaarquivos') || l.includes('residencia-medica/')) {
      console.log(' ->', l);
    }
  }
}
checkUcampMain();

