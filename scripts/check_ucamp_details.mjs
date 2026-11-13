async function checkUcamp() {
  const u = 'https://ucamp.org.br/';
  const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();
  console.log('HTML length:', text.length);
  const links = [...text.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
  console.log('Total links:', links.length);
  links.forEach(l => {
    if (l.includes('pdf') || l.includes('exame') || l.includes('prova') || l.includes('gabarito')) {
      console.log(' ->', l);
    }
  });
}
checkUcamp();
