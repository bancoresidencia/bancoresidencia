import fs from 'fs';

async function probeYears() {
  const years = [2025, 2024, 2023, 2022, 2021];
  for (const yr of years) {
    const urls = [
      `https://sistemas.institutoverbena.ufg.br/${yr}/coreme-ses/sistema/provas_gabaritos/`,
      `https://sistemas.institutoverbena.ufg.br/${yr}/coreme-ses/`,
      `https://sistemas.institutoverbena.ufg.br/${yr}/coreme/`,
      `https://centrodeselecao.ufg.br/${yr}/coreme-ses/`
    ];
    for (const u of urls) {
      try {
        const res = await fetch(u, { method: 'HEAD' });
        console.log(`[${yr}] [${res.status}] ${u}`);
      } catch (e) {
        // ignore
      }
    }
  }
}

probeYears();
