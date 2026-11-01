import { spawn } from 'child_process';
import path from 'path';

const ALL_SPECIALTIES = [
  'urologia',
  'nefrologia',
  'ginecologia',
  'obstetricia',
  'pediatria',
  'cirurgia',
  'preventiva',
  'clinica'
];

function runSpecialty(spec, extraArgs = []) {
  return new Promise((resolve, reject) => {
    console.log(`\n======================================================`);
    console.log(`🚀 [PIPELINE] INICIANDO ESPECIALIDADE: ${spec.toUpperCase()}`);
    console.log(`======================================================\n`);

    const child = spawn('node', ['scripts/batch_solve_specialty.mjs', spec, ...extraArgs], {
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
  const rawArgs = process.argv.slice(2);
  let targetSpecs = [...ALL_SPECIALTIES];

  // Se o primeiro argumento for o nome de uma especialidade, filtra ou inicia a partir dela
  const firstArg = (rawArgs[0] || '').toLowerCase();
  const matchedIdx = ALL_SPECIALTIES.indexOf(firstArg);
  const forwardArgs = [];

  if (matchedIdx !== -1) {
    if (rawArgs.includes('--only')) {
      targetSpecs = [ALL_SPECIALTIES[matchedIdx]];
    } else {
      targetSpecs = ALL_SPECIALTIES.slice(matchedIdx);
    }
    // Repassa os argumentos restantes após o nome da especialidade
    for (let i = 1; i < rawArgs.length; i++) {
      if (rawArgs[i] !== '--only') forwardArgs.push(rawArgs[i]);
    }
  } else {
    forwardArgs.push(...rawArgs);
  }

  console.log('🏁 INICIANDO PIPELINE SEQUENCIAL AUTOMÁTICO COM AUTO-RETRY');
  console.log(`📋 Fila: ${targetSpecs.map(s => s.toUpperCase()).join(' ➔ ')}`);
  if (forwardArgs.length > 0) {
    console.log(`⚙️ Argumentos extras repassados: ${forwardArgs.join(' ')}`);
  }
  console.log('');

  for (const spec of targetSpecs) {
    let completed = false;
    let attempt = 1;
    while (!completed) {
      try {
        await runSpecialty(spec, forwardArgs);
        completed = true;
      } catch (err) {
        console.error(`\n⚠️ Pausa temporária em ${spec.toUpperCase()}: ${err.message}`);
        console.log(`⏳ Aguardando 5 minutos para renovação de cotas no Google AI Studio (Tentativa ${attempt})...`);
        attempt++;
        await new Promise(r => setTimeout(r, 5 * 60 * 1000));
        console.log(`\n🔄 Retomando execução da especialidade ${spec.toUpperCase()}...`);
      }
    }
  }

  console.log('\n🏆🏆🏆 PIPELINE COMPLETO CONCLUÍDO COM SUCESSO! 🏆🏆🏆');
  console.log('Todas as especialidades da fila foram resolvidas no padrão-ouro e sincronizadas no Supabase!');
}

runPipeline();
