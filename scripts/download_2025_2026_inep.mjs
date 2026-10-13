import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.join(process.cwd(), 'data', 'official_exams', 'INEP_REVALIDA');

const files = [
  // 2025.1
  { name: 'INEP_2025_1_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2025_1_PV_objetiva_regular.pdf' },
  { name: 'INEP_2025_1_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2025_1_GB_objetiva_definitivo.pdf' },
  // 2025.2
  { name: 'INEP_2025_2_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2025_2_caderno_1_preliminar.pdf' },
  { name: 'INEP_2025_2_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2025_2_gabarito_caderno_1.pdf' },
  // 2026.1
  { name: 'INEP_2026_1_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2026_1_caderno_1_.pdf' },
  { name: 'INEP_2026_1_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2026_1_gabarito_definitivo_caderno1.pdf' },
  // 2026.2
  { name: 'INEP_2026_2_PV.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2026_2_caderno_1.pdf' },
  { name: 'INEP_2026_2_GB.pdf', url: 'https://download.inep.gov.br/revalida/provas_e_gabaritos/2026_2_gabarito_preliminar_caderno1.pdf' }
];

console.log('Baixando 2025 e 2026 oficiais do INEP...');

for (const item of files) {
  const dest = path.join(TARGET_DIR, item.name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`[EXISTE] ${item.name}`);
    continue;
  }
  console.log(`Baixando ${item.name}...`);
  try {
    execSync(`curl.exe -k -s -L --max-time 60 "${item.url}" -o "${dest}"`);
    const sz = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    console.log(`✅ [OK] ${item.name} (${sz} bytes)`);
  } catch(e) {
    console.log(`❌ [ERRO] ${item.name}: ${e.message}`);
  }
}
console.log('Concluído!');
