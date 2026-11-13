import fs from 'fs';
import path from 'path';

async function downloadVerbena2024() {
  const baseUrl = 'https://sistemas.institutoverbena.ufg.br/2024/coreme-ses/sistema/provas_gabaritos/';
  const outDir = path.resolve('data/official_exams/SES_GO_2024');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const targets = [
    {
      name: 'PV_ACESSO_DIRETO_2024.pdf',
      rel: 'prova/CADERNO DE PROVA - COREME - Areas Basicas e Especialidades de Acesso Direto (R1) 2024.pdf'
    },
    {
      name: 'GB_ACESSO_DIRETO_2024.pdf',
      rel: 'gabarito_final/Areas Basicas e Especialidades de Acesso Direto (R1) 2024.pdf'
    },
    {
      name: 'PV_CLINICA_MEDICA_2024.pdf',
      rel: 'prova/CADERNO DE PROVA - COREME - R1 com pre-requisito em Clinica Medica 2024.pdf'
    },
    {
      name: 'GB_CLINICA_MEDICA_2024.pdf',
      rel: 'gabarito_final/R1 com pre-requisito em Clinica Medica 2024.pdf'
    },
    {
      name: 'PV_CIRURGIA_GERAL_2024.pdf',
      rel: 'prova/CADERNO DE PROVA - COREME - R1 com pre-requisito em Cirurgia Geral ou Area Basica Cirurgica 2024.pdf'
    },
    {
      name: 'GB_CIRURGIA_GERAL_2024.pdf',
      rel: 'gabarito_final/R1 com pre-requisito em Cirurgia Geral ou Area Basica Cirurgica 2024.pdf'
    },
    {
      name: 'PV_GIN_OBS_2024.pdf',
      rel: 'prova/CADERNO DE PROVA - COREME - R1 com pre-requisito em Ginecologia e Obstetricia 2024.pdf'
    },
    {
      name: 'GB_GIN_OBS_2024.pdf',
      rel: 'gabarito_final/R1 com pre-requisito em Ginecologia e Obstetricia 2024.pdf'
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

downloadVerbena2024();
