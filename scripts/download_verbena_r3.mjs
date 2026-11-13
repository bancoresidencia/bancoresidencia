import fs from 'fs';
import path from 'path';

const outDir = path.resolve('data/official_exams/SES_GO_2026');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const baseUrl = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/';

const downloads = [
  { name: 'GB_CLINICA_MEDICA_A.pdf', rel: 'gabaritos_finais/Gabarito Final - R1 com pre-requisito em Clinica Medica Tipo A.pdf' },
  { name: 'GB_CIRURGIA_GERAL_A.pdf', rel: 'gabaritos_finais/Gabarito Final- R1 com pre-requisito em Cirurgia Geral ou Area Basica Cirurgica Tipo A.pdf' },
  { name: 'GB_GIN_OBS_A.pdf', rel: 'gabaritos_finais/Gabarito Final -  R1 com pre-requisito em Ginecologia e Obstetricia Tipo A.pdf' },
  { name: 'GB_PEDIATRIA_A.pdf', rel: 'gabaritos_finais/Gabarito Final - R1 com pre-requisito em Pediatria todos Tipo A.pdf' },
  { name: 'GB_GASTRO_A.pdf', rel: 'gabaritos_finais/Gabarito Final - R1 com pre-requisito em Gastroenterologia Tipo A.pdf' },
  { name: 'GB_NEURO_A.pdf', rel: 'gabaritos_finais/Gabarito Final - R1 com pre-requisito em Neurologia Tipo A.pdf' },
  { name: 'GB_ANEST_CIR_CAB_A.pdf', rel: 'gabaritos_finais/Gabarito Final - R1 com pre-requisito em Anestesiologia ou Cirurgia de Cabeca e Pescoco Tipo A.pdf' },

  { name: 'PV_CLINICA_MEDICA_A.pdf', rel: 'provas/R1 COM PR%C3%89-REQUISITO EM CL%C3%8DNICA M%C3%89DICA TIPO A.pdf' },
  { name: 'PV_CIRURGIA_GERAL_A.pdf', rel: 'provas/R1 COM PR%C3%89-REQUISITO EM CIRURGIA GERAL OU %C3%81REA B%C3%81SICA CIR%C3%9ARGICA TIPO A.pdf' },
  { name: 'PV_GIN_OBS_A.pdf', rel: 'provas/R1 COM PR%C3%89-REQUISITO EM GINECOLOGIA E OBSTETR%C3%8DCIA TIPO A.pdf' },
  { name: 'PV_PEDIATRIA_A.pdf', rel: 'provas/R1 COM PR%C3%89-REQUISITO EM PEDIATRIA TIPO A.pdf' },
  { name: 'PV_GASTRO_A.pdf', rel: 'provas/R1 COM PR%C3%89-REQUISITO EM GASTROENTEROLOGIA TIPO A.pdf' },
  { name: 'PV_NEURO_A.pdf', rel: 'provas/R1 COM PR%C3%89-REQUISITO EM NEUROLOGIA TIPO A.pdf' }
];

async function run() {
  for (const item of downloads) {
    const dest = path.join(outDir, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`Already exists: ${item.name} (${(fs.statSync(dest).size / 1024).toFixed(1)} KB)`);
      continue;
    }

    const fullUrl = baseUrl + encodeURI(item.rel).replace(/%25/g, '%');
    console.log(`Downloading ${item.name}...`);
    try {
      const res = await fetch(fullUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (!res.ok) {
        console.error(`Failed ${item.name}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`  -> Saved ${item.name} (${(buf.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Error downloading ${item.name}:`, e.message);
    }
  }
  console.log('Download complete.');
}

run();
