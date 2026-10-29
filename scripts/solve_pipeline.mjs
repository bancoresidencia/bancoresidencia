import { spawn } from 'child_process';
import path from 'path';

const specialties = [
  'nefrologia',
  'ginecologia',
  'obstetricia',
  'pediatria',
  'cirurgia',
  'preventiva',
  'clinica'
];

function runSpecialty(spec) {
  return new Promise((resolve, reject) => {
    console.log(`\n======================================================`);
    console.log(`🚀 [PIPELINE] INICIANDO ESPECIALIDADE: ${spec.toUpperCase()}`);
    console.log(`======================================================\n`);

    const child = spawn('node', ['scripts/batch_solve_specialty.mjs', spec], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', code => {
      if (code === 0) {
        console.log(`\n✅ [PIPELINE] Especialidade ${spec.toUpperCase()} finalizada com sucesso (código 0)!`);
        resolve();
      } else {
        console.error(`\n❌ [PIPELINE] Especialidade ${spec.toUpperCase()} encerrou com código ${code}.`);
        reject(new Error(`Falha na especialidade ${spec} (código ${code})`));
      }
    });

    child.on('error', err => {
      reject(err);
    });
  });
}

async function runPipeline() {
  console.log('🏁 INICIANDO PIPELINE SEQUENCIAL AUTOMÁTICO');
  console.log(`📋 Fila: ${specialties.map(s => s.toUpperCase()).join(' ➔ ')}\n`);

  for (const spec of specialties) {
    try {
      await runSpecialty(spec);
    } catch (err) {
      console.error(`🛑 Interrupção do pipeline em ${spec}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n🏆🏆🏆 PIPELINE COMPLETO CONCLUÍDO COM SUCESSO! 🏆🏆🏆');
  console.log('Todas as especialidades da fila foram resolvidas no padrão-ouro e sincronizadas no Supabase!');
}

runPipeline();
