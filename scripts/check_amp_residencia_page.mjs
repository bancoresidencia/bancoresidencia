async function checkResidenciaMedica() {
  const u = 'https://www.amp.org.br/residencia-medica';
  const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();
  const links = [...text.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
  console.log('All links:');
  links.forEach(l => console.log(' ->', l));
}
checkResidenciaMedica();
