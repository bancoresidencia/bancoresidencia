import fs from 'fs';
import path from 'path';

async function downloadMissing2026() {
  const baseUrl = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/';
  const outDir = path.resolve('data/official_exams/SES_GO_2026');

  const targets = [
    {
      name: 'PV_ANEST_CIR_CAB_A.pdf',
      rel: 'provas/R1 COM PRÉ-REQUISITO EM ANESTESIOLOGIA OU CIRURGIA DE CABEÇA E PESCOÇO TIPO A.pdf'
    },
    {
      name: 'GB_ANEST_CIR_CAB_A.pdf',
      rel: 'gabaritos_finais/Gabarito Final - R1 com pre-requisito em Anestesiologia ou Cirurgia de Cabeca e Pescoco Tipo A.pdf'
    },
    {
      name: 'PV_CIR_BAS_GERAL_CLM_A.pdf',
      rel: 'provas/R1 COM PRÉ-REQUISITO EM CIRURGIA BÁSICA OU CIRURGIA GERAL OU CLÍNICA MÉDICA TIPO A.pdf'
    },
    {
      name: 'GB_CIR_BAS_GERAL_CLM_A.pdf',
      rel: 'gabaritos_finais/Gabarito Final - R1 com pre-requisito em Cirurgia Basica ou Cirurgia Geral ou Clinica Medica Tipo A.pdf'
    }
  ];

  for (const t of targets) {
    const fullUrl = baseUrl + encodeURI(t.rel);
    console.log(`Downloading ${t.name} from ${fullUrl}...`);
    try {
      const res = await fetch(fullUrl);
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(path.join(outDir, t.name), buf);
        console.log(`Saved ${t.name} (${(buf.length/1024).toFixed(1)} KB)`);
      }
    } catch (e) {
      console.error(`Error downloading ${t.name}:`, e.message);
    }
  }
}

downloadMissing2026();
