async function checkSelectingOftal() {
  const u = 'https://selecting.com.br/residencia-medica-em-oftalmologia/';
  const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();
  console.log('Length:', text.length);
  const links = [...text.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
  links.filter(l => l.includes('edital') || l.includes('concursos') || l.includes('pdf') || l.includes('fubog')).forEach(l => console.log(' ->', l));
}
checkSelectingOftal();

