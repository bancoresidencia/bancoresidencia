async function checkMarioGattiSite() {
  try {
    const res = await fetch('https://residenciamedicamariogatti.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('Length:', html.length);
    const links = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    for (const l of links) {
      if (l.includes('pdf') || l.includes('edital') || l.includes('prova') || l.includes('gabarito')) {
        console.log('  ->', l);
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}
checkMarioGattiSite();
