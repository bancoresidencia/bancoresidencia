async function checkUfgArchives() {
  const years = [2020, 2021, 2022, 2023, 2024];
  const paths = [
    'coreme', 'coreme-ses', 'residencia-medica', 'ses', 'fubog'
  ];

  for (const y of years) {
    for (const p of paths) {
      const u = `https://centrodeselecao.ufg.br/${y}/${p}/`;
      try {
        const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, method: 'HEAD' });
        console.log(`[${res.status}] ${u}`);
      } catch (e) {
        // console.error(u, e.message);
      }
    }
  }
}
checkUfgArchives();
