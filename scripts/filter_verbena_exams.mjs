async function filterVerbenaPdfs() {
  const years = ['2026', '2025', '2024'];

  for (const yr of years) {
    const url = `https://sistemas.institutoverbena.ufg.br/${yr}/coreme-ses/`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (res.ok) {
        const html = await res.text();
        const matches = [...html.matchAll(/href=["']([^"']*\.pdf[^"']*)["']/gi)].map(m => m[1]);
        const unique = [...new Set(matches)];
        const relevant = unique.filter(l => {
          const lower = l.toLowerCase();
          return lower.includes('prova') || lower.includes('gabarito') || lower.includes('caderno');
        });
        console.log(`\n=== Year ${yr}: Found ${relevant.length} relevant exam/answer key PDFs ===`);
        relevant.forEach(l => {
          const full = l.startsWith('http') ? l : new URL(l, url).href;
          console.log('  ->', full);
        });
      }
    } catch (e) {
      console.error(yr, e.message);
    }
  }
}

filterVerbenaPdfs();
