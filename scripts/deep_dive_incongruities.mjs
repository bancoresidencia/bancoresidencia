import fs from 'fs';
import path from 'path';

const rep = JSON.parse(fs.readFileSync('data/relatorio_auditoria_integral_gabaritos.json', 'utf8'));

console.log('=== DETALHAMENTO CIRÚRGICO DAS DIVERGÊNCIAS ===\n');

// 1. Analisar cat5 (1257 questões):
// Quantas o texto da alternativa atual bate com o texto mencionado no comentário?
// Quantas o texto da alternativa declarada no comentário é que é a correta?
let cat5_textMatchesDeclared = 0;
let cat5_textMatchesCurrent = 0;
let cat5_bothDifferent = 0;

for (const item of rep.details.commentaryExplicitDifferentKey) {
  // Vamos ver se o snippet do comentário contém o texto de current_text ou declared_text
  const comm = (item.commentary_snippet || '').toLowerCase();
  const curT = (item.current_text || '').toLowerCase().slice(0, 30);
  const decT = (item.declared_text || '').toLowerCase().slice(0, 30);

  const curInComm = curT.length > 5 && comm.includes(curT);
  const decInComm = decT.length > 5 && comm.includes(decT);

  if (decInComm && !curInComm) {
    cat5_textMatchesDeclared++;
  } else if (curInComm && !decInComm) {
    cat5_textMatchesCurrent++;
  } else {
    cat5_bothDifferent++;
  }
}

console.log('• Categoria 5 (Comentário cita explicitamente outra letra - 1.257 casos):');
console.log(`  - Comentário traz o texto da alternativa declarada (ERRO REAL DE GABARITO na plataforma): ${cat5_textMatchesDeclared}`);
console.log(`  - Comentário traz o texto da alternativa atual (CADERNO EMBARALHADO / letra do comentário desatualizada): ${cat5_textMatchesCurrent}`);
console.log(`  - Outros / texto longo / ambíguo: ${cat5_bothDifferent}`);

// 2. Analisar cat9 (Gold Reference - 317 casos):
const goldIsTextMatch = rep.details.goldReferenceMismatch.filter(g => g.is_text_matching).length;
const goldRealMismatch = rep.details.goldReferenceMismatch.filter(g => !g.is_text_matching).length;
console.log('\n• Categoria 9 (Divergências com Base Ouro - 317 casos):');
console.log(`  - Caderno embaralhado (mesmo texto de alternativa, letra diferente): ${goldIsTextMatch}`);
console.log(`  - Divergência real de texto/gabarito: ${goldRealMismatch}`);

// 3. Analisar cat3 (Conflitos de Anulada - 246 casos):
const anuladaFlagFalse = rep.details.anuladaConflicts.filter(a => a.type === 'FLAG_FALSE_BUT_ANSWER_ANULADA').length;
const anuladaActiveLetter = rep.details.anuladaConflicts.filter(a => a.type === 'FLAG_TRUE_BUT_HAS_ACTIVE_LETTER').length;
console.log('\n• Categoria 3 (Conflitos de Anulação - 246 casos):');
console.log(`  - Resposta é ANULADA mas flag is_anulada=false: ${anuladaFlagFalse}`);
console.log(`  - Flag is_anulada=true mas mantém letra ativa A-E: ${anuladaActiveLetter}`);

// 4. Analisar cat10 (Drive Reference - 1.475 casos):
console.log('\n• Categoria 10 (Divergências com Base Drive dos Livros - 1.475 casos):');
console.log('  Primeiros 5 exemplos:');
for (const item of rep.details.driveReferenceMismatch.slice(0, 5)) {
  console.log(`  - [${item.spec}] ${item.code || item.id}: Atual=${item.current_answer} vs Drive=${item.drive_answer} (${item.book})`);
  console.log(`    Comentário Drive: ${item.drive_commentary_snippet}`);
}

// 5. Analisar duplicatas com conflito real (1.244 casos):
console.log('\n• Categoria 11 (Questões idênticas em provas/especialidades com gabaritos conflitantes):');
console.log(`  Total de grupos de duplicatas discordantes: ${rep.details.duplicateRealConflicts.length}`);
console.log('  Primeiros 3 exemplos:');
for (const dup of rep.details.duplicateRealConflicts.slice(0, 3)) {
  console.log(`  - Grupo: ${dup.statement_key}`);
  for (const q of dup.questions) {
    console.log(`    * [${q.spec}] ID: ${q.id} -> Gabarito: ${q.ans} | Texto: ${q.optText.slice(0, 60)}`);
  }
}
