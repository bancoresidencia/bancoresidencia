import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.join(process.cwd(), 'data', 'official_exams', 'INEP_REVALIDA');
if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });

const downloads = [
  // 2024.2
  { name: 'INEP_2024_2_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2024_2_PV_objetiva_regular.pdf' },
  { name: 'INEP_2024_2_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2024_2_GB_objetiva.pdf' },
  // 2024.1
  { name: 'INEP_2024_1_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2024_1_PV_objetiva_regular.pdf' },
  { name: 'INEP_2024_1_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2024_1_GB_objetiva.pdf' },
  // 2023.2
  { name: 'INEP_2023_2_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2023_2_PV_objetiva_regular.pdf' },
  { name: 'INEP_2023_2_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2023_2_GB_objetiva.pdf' },
  // 2023.1
  { name: 'INEP_2023_1_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2023_1_PV_objetiva_regular.pdf' },
  { name: 'INEP_2023_1_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2023_1_GB_objetiva_definitivo.pdf' },
  // 2022.2
  { name: 'INEP_2022_2_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2022-2_PV_objetiva.pdf' },
  { name: 'INEP_2022_2_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2022-2_GB_objetiva.pdf' },
  // 2022.1
  { name: 'INEP_2022_1_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2022_PV_objetiva_1.pdf' },
  { name: 'INEP_2022_1_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2022_GB_objetiva_1.pdf' },
  // 2021
  { name: 'INEP_2021_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2021_PV_objetiva_1.pdf' },
  { name: 'INEP_2021_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2021_GB_objetiva_1.pdf' }
];

console.log(`Iniciando download de ${downloads.length} arquivos oficiais do INEP Revalida (2021 a 2024)...`);

for (const item of downloads) {
  const dest = path.join(TARGET_DIR, item.name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`[EXISTE] ${item.name} (${fs.statSync(dest).size} bytes)`);
    continue;
  }
  console.log(`Baixando ${item.name}...`);
  try {
    execSync(`curl.exe -k -s -L "${item.url}" -o "${dest}"`, { timeout: 30000 });
    const sz = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    if (sz > 2000) {
      console.log(`✅ [OK] ${item.name} baixado com sucesso (${sz} bytes)`);
    } else {
      console.log(`⚠️ [ALERTA] ${item.name} baixou arquivo pequeno/inválido (${sz} bytes)`);
    }
  } catch (err) {
    console.log(`❌ [ERRO] Falha ao baixar ${item.name}: ${err.message}`);
  }
}

console.log('\nFinalizado download dos arquivos oficiais!');
