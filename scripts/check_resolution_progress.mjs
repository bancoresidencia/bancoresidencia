import fs from 'fs';
import path from 'path';

const SPECIALTY_FILES = {
  urologia: { name: 'Urologia', path: 'data/urologia_final_questions.json' },
  ginecologia: { name: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
  obstetricia: { name: 'Obstetrícia', path: 'data/obstetricia_final_questions.json' },
  pediatria: { name: 'Pediatria', path: 'data/pediatria_final_questions.json' },
  cirurgia: { name: 'Cirurgia Geral', path: 'data/cirurgia_final_questions.json' },
  preventiva: { name: 'Medicina Preventiva', path: 'data/medicina_preventiva_final_questions.json' },
  clinica: { name: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json' }
};

export function getResolutionStatus() {
  const checkpointDir = path.resolve('data/checkpoints');
  const report = [];

  let grandTotal = 0;
  let grandSolved = 0;

  for (const [key, info] of Object.entries(SPECIALTY_FILES)) {
    if (!fs.existsSync(info.path)) continue;

    const questions = JSON.parse(fs.readFileSync(info.path, 'utf8'));
    const total = questions.length;
    grandTotal += total;

    // Verifica quantas possuem mainErrorReason ou takeHomeMessage (padrão ouro)
    let solved = 0;
    const checkpointFile = path.join(checkpointDir, `${key}_deep_solved.json`);

    if (fs.existsSync(checkpointFile)) {
      try {
        const cpData = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
        solved = cpData.length;
      } catch {}
    } else {
      // Conta direto no arquivo
      solved = questions.filter(q => q.mainErrorReason || (q.commentary && q.commentary.includes('Principal Motivo'))).length;
    }

    grandSolved += solved;
    const pct = total > 0 ? ((solved / total) * 100).toFixed(1) : '0.0';

    report.push({
      key,
      name: info.name,
      total,
      solved,
      remaining: total - solved,
      percentage: pct
    });
  }

  const grandPct = grandTotal > 0 ? ((grandSolved / grandTotal) * 100).toFixed(1) : '0.0';

  return {
    specialties: report,
    grandTotal,
    grandSolved,
    grandRemaining: grandTotal - grandSolved,
    grandPercentage: grandPct
  };
}

// Execução direta via terminal
if (process.argv[1] && process.argv[1].endsWith('check_resolution_progress.mjs')) {
  const status = getResolutionStatus();
  console.log('\n========================================================================');
  console.log('📊 PAINEL DE ACOMPANHAMENTO: GABARITOS & JUSTIFICATIVAS PROFUNDAS');
  console.log('========================================================================\n');
  console.log('| Especialidade         | Total      | Padrão Ouro | Restantes  | Progresso |');
  console.log('|-----------------------|------------|-------------|------------|-----------|');
  for (const s of status.specialties) {
    const namePad = s.name.padEnd(21);
    const totalPad = s.total.toLocaleString('pt-BR').padStart(10);
    const solvedPad = s.solved.toLocaleString('pt-BR').padStart(11);
    const remPad = s.remaining.toLocaleString('pt-BR').padStart(10);
    const pctPad = `${s.percentage}%`.padStart(9);
    console.log(`| ${namePad} | ${totalPad} | ${solvedPad} | ${remPad} | ${pctPad} |`);
  }
  console.log('|-----------------------|------------|-------------|------------|-----------|');
  const gName = 'TOTAL DO BANCO'.padEnd(21);
  const gTot = status.grandTotal.toLocaleString('pt-BR').padStart(10);
  const gSolv = status.grandSolved.toLocaleString('pt-BR').padStart(11);
  const gRem = status.grandRemaining.toLocaleString('pt-BR').padStart(10);
  const gPct = `${status.grandPercentage}%`.padStart(9);
  console.log(`| ${gName} | ${gTot} | ${gSolv} | ${gRem} | ${gPct} |`);
  console.log('========================================================================\n');
}
