import fs from 'fs';

async function checkAmpPdfs() {
  const years = [2026, 2025, 2024, 2023];
  const specialties = [
    'prova-geral',
    'gabarito',
    'gabarito-retificado',
    'pediatria',
    'clinica-medica',
    'cirurgia-geral',
    'ginecologia-e-obstetricia',
    'medicina-da-familia-e-comunidade'
  ];

  for (const yr of years) {
    for (const sp of specialties) {
      const urls = [
        `https://cms.amp.org.br/arquivos/exame-amp-${yr}-${sp}.pdf`,
        `https://cms.amp.org.br/arquivos/exame-amp-${yr}-prova-${sp}.pdf`,
        `https://cms.amp.org.br/arquivos/${yr}-${sp}.pdf`,
        `https://cms.amp.org.br/arquivos/prova-${sp}-${yr}.pdf`,
        `https://cms.amp.org.br/arquivos/gabarito-definitivo-${yr}.pdf`
      ];
      for (const u of urls) {
        try {
          const res = await fetch(u, { method: 'HEAD' });
          if (res.ok) {
            console.log(`[FOUND ${res.status}] ${u} (${res.headers.get('content-length')} bytes)`);
          }
        } catch (_) {}
      }
    }
  }
}

checkAmpPdfs();
