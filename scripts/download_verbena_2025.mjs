import fs from 'fs';
import path from 'path';

async function downloadVerbena2025() {
  const baseUrl = 'https://sistemas.institutoverbena.ufg.br/2025/coreme-ses/sistema/provas_gabaritos/';
  const outDir = path.resolve('data/official_exams/SES_GO_2025');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const targets = [
    {
      name: 'PV_ACESSO_DIRETO_2025.pdf',
      rel: 'prova/areas basicas e especialidades de acesso direto r1.pdf'
    },
    {
      name: 'GB_ACESSO_DIRETO_2025.pdf',
      rel: 'gabarito_final/areas basicas e especialidades de acesso direto r1 final.pdf'
    },
    {
      name: 'PV_PEDIATRIA_2025.pdf',
      rel: 'prova/r1 com pre requisito em pediatria.pdf'
    },
    {
      name: 'GB_PEDIATRIA_2025.pdf',
      rel: 'gabarito_final/r1 com pre requisito em pediatria final.pdf'
    },
    {
      name: 'PV_CLINICA_MEDICA_2025.pdf',
      rel: 'prova/r1 com pre requisito em clinica medica.pdf'
    },
    {
      name: 'GB_CLINICA_MEDICA_2025.pdf',
      rel: 'gabarito_final/r1 com pre requisito em clinica medica final.pdf'
    },
    {
      name: 'PV_CIRURGIA_GERAL_2025.pdf',
      rel: 'prova/r1 com pre requisito em cirurgia geral alterado.pdf'
    },
    {
      name: 'GB_CIRURGIA_GERAL_2025.pdf',
      rel: 'gabarito_final/r1 com pre requisito em cirurgia geral alterado.pdf'
    },
    {
      name: 'PV_GIN_OBS_2025.pdf',
      rel: 'prova/r1 com pre requisito em ginecologia e obstetricia.pdf'
    },
    {
      name: 'GB_GIN_OBS_2025.pdf',
      rel: 'gabarito_final/r1 com pre requisito em ginecologia e obstetricia final.pdf'
    }
  ];

  for (const t of targets) {
    const fullUrl = baseUrl + encodeURI(t.rel);
    console.log(`Downloading ${t.name}...`);
    try {
      const res = await fetch(fullUrl);
      console.log(`Status [${res.status}] for ${t.name}`);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(path.join(outDir, t.name), buf);
        console.log(`Saved ${t.name} (${(buf.length/1024).toFixed(1)} KB)`);
      }
    } catch (e) {
      console.error(`Error ${t.name}:`, e.message);
    }
  }
}

downloadVerbena2025();
