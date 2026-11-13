import fs from 'fs';
import path from 'path';
import { parseVerbenaGabarito, parseVerbenaCaderno } from './parse_verbena_booklet.mjs';

const dir = path.resolve('data/official_exams/SES_GO_2026');

const booklets = [
  { id: 'ACESSO_DIRETO', gb: 'GB_ACESSO_DIRETO_A.pdf', pv: 'PV_ACESSO_DIRETO_A.pdf', name: 'SES-GO 2026 Acesso Direto' },
  { id: 'CLINICA_MEDICA', gb: 'GB_CLINICA_MEDICA_A.pdf', pv: 'PV_CLINICA_MEDICA_A.pdf', name: 'SES-GO 2026 R1 Clinica Medica' },
  { id: 'CIRURGIA_GERAL', gb: 'GB_CIRURGIA_GERAL_A.pdf', pv: 'PV_CIRURGIA_GERAL_A.pdf', name: 'SES-GO 2026 R1 Cirurgia Geral' },
  { id: 'GIN_OBS', gb: 'GB_GIN_OBS_A.pdf', pv: 'PV_GIN_OBS_A.pdf', name: 'SES-GO 2026 R1 Ginecologia e Obstetricia' },
  { id: 'PEDIATRIA', gb: 'GB_PEDIATRIA_A.pdf', pv: 'PV_PEDIATRIA_A.pdf', name: 'SES-GO 2026 R1 Pediatria' },
  { id: 'GASTRO', gb: 'GB_GASTRO_A.pdf', pv: 'PV_GASTRO_A.pdf', name: 'SES-GO 2026 R1 Gastroenterologia' },
  { id: 'NEURO', gb: 'GB_NEURO_A.pdf', pv: 'PV_NEURO_A.pdf', name: 'SES-GO 2026 R1 Neurologia' }
];

async function verifyAll() {
  console.log('Verifying all 7 Verbena booklets:');
  let totalQ = 0;
  for (const b of booklets) {
    const gbPath = path.join(dir, b.gb);
    const pvPath = path.join(dir, b.pv);
    if (!fs.existsSync(gbPath) || !fs.existsSync(pvPath)) {
      console.log(`[MISSING] ${b.id}`);
      continue;
    }
    const answers = await parseVerbenaGabarito(gbPath);
    const questions = await parseVerbenaCaderno(pvPath);
    const qCount = Object.keys(questions).length;
    const aCount = Object.keys(answers).length;
    totalQ += qCount;
    console.log(`[OK] ${b.name}: ${qCount} questions, ${aCount} answers`);
  }
  console.log(`\nTotal questions available in Verbena 2026 repository: ${totalQ}`);
}

verifyAll();
