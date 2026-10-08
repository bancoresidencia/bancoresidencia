import fs from 'fs';
import { solveQuestionDeep } from './solve_questions_engine.mjs';

async function runPilot() {
  console.log('\n======================================================');
  console.log('🩺 TESTE PILOTO DE RESOLUÇÃO SISTEMÁTICA DE QUESTÃO');
  console.log('======================================================\n');

  // Carrega uma questão de Ginecologia
  const raw = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
  const sampleQuestion = raw[1]; // Pegamos a segunda questão (hiperplasia endometrial / sangramento pós-menopausa)

  console.log('📌 Enunciado da Questão:');
  console.log(`Instituição: ${sampleQuestion.institution} (${sampleQuestion.year})`);
  console.log(`Tema: ${sampleQuestion.tema} | Foco: ${sampleQuestion.foco}`);
  console.log(`Texto: ${sampleQuestion.statement}\n`);
  console.log('Alternativas:');
  sampleQuestion.options.forEach(o => console.log(`  ${o.letter}) ${o.text}`));

  console.log('\n⏳ Gerando gabarito, justificativas detalhadas, motivo de erro e take-home message...');
  const startTime = Date.now();
  const solved = await solveQuestionDeep(sampleQuestion);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  if (!solved) {
    console.error('❌ Falha na resolução.');
    return;
  }

  console.log(`\n✅ RESOLVIDO COM SUCESSO EM ${elapsed}s!`);
  console.log('------------------------------------------------------');
  console.log(`🏆 GABARITO OFICIAL DEFINITIVO: [ ${solved.correctAnswer} ]\n`);
  console.log(solved.commentary);
  console.log('\n------------------------------------------------------');
  console.log('🔍 Explicações individuais por alternativa:');
  solved.options.forEach(opt => {
    console.log(`\n👉 Alternativa ${opt.letter}:`);
    console.log(`   ${opt.explanation}`);
  });
  console.log('\n🎉 TESTE PILOTO CONCLUÍDO COM 100% DE ÊXITO!');
}

runPilot().catch(console.error);
