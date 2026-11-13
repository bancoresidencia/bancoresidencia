async function probeVerbena() {
  const urls = [
    'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/',
    'https://sistemas.institutoverbena.ufg.br/2025/coreme-ses/',
    'https://sistemas.institutoverbena.ufg.br/2024/coreme-ses/'
  ];

  for (const url of urls) {
    console.log(`\n=== Fetching ${url} ===`);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const matches = [...html.matchAll(/href=["']([^"']*\.pdf[^"']*)["']/gi)].map(m => m[1]);
        const unique = [...new Set(matches)];
        console.log(`Found ${unique.length} PDF links:`);
        unique.forEach(l => {
          const full = l.startsWith('http') ? l : new URL(l, url).href;
          console.log('  ->', full);
        });
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

probeVerbena();
