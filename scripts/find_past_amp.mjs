async function findPastAmpEditions() {
  // Probe IDs between 450 and 525 with small step
  const testIds = [];
  for (let i = 450; i <= 525; i += 5) testIds.push(i);

  for (const id of testIds) {
    const url = `https://www.ucamp.org.br/residencia-medica/${id}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (res.ok) {
        const html = await res.text();
        const matches = [...html.matchAll(/href=["']([^"']*\.pdf[^"']*)["']/gi)].map(m => m[1]);
        const unique = [...new Set(matches)];
        const provaMatches = unique.filter(u => u.toLowerCase().includes('prova') || u.toLowerCase().includes('gabarito'));
        if (provaMatches.length > 0) {
          console.log(`[ID ${id}] Found ${provaMatches.length} exam/gabarito PDFs:`);
          provaMatches.forEach(p => console.log('   ->', p));
        } else if (unique.length > 0) {
          console.log(`[ID ${id}] ${unique.length} other PDFs (e.g. ${unique[0].slice(0, 70)})`);
        }
      }
    } catch (e) {}
  }
}

findPastAmpEditions();
