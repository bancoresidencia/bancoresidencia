import fs from 'fs';
import path from 'path';

const files = [
  { key: 'cirurgia', name: 'Cirurgia Geral', file: 'data/cirurgia_final_questions.json', checkpoint: 'data/checkpoints/cirurgia_gold_anchors_complete.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json', checkpoint: 'data/checkpoints/clinica_medica_gold_anchors_complete.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'data/ginecologia_final_questions.json', checkpoint: 'data/checkpoints/ginecologia_gold_anchors_complete.json' },
  { key: 'preventiva', name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json', checkpoint: 'data/checkpoints/medicina_preventiva_gold_anchors_complete.json' },
  { key: 'nefrologia', name: 'Nefrologia', file: 'data/nefrologia_final_questions.json', checkpoint: 'data/checkpoints/nefrologia_gold_anchors_complete.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json', checkpoint: 'data/checkpoints/obstetricia_gold_anchors_complete.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'data/pediatria_final_questions.json', checkpoint: 'data/checkpoints/pediatria_gold_anchors_complete.json' },
  { key: 'urologia', name: 'Urologia', file: 'data/urologia_final_questions.json', checkpoint: 'data/checkpoints/urologia_gold_anchors_complete.json' }
];

console.log('='.repeat(80));
console.log('📁 AUDITORIA DETALHADA DOS ARQUIVOS LOCAIS DE QUESTÕES');
console.log('='.repeat(80));

const localStats = [];
const allLocalIds = new Map(); // id -> { file, spec, ans, isAnulada, isDissertativa, isHomologado }

for (const item of files) {
  if (!fs.existsSync(item.file)) {
    console.log(`❌ Arquivo não encontrado: ${item.file}`);
    continue;
  }

  const raw = fs.readFileSync(item.file, 'utf8');
  const qs = JSON.parse(raw);
  
  let validAns = 0;
  let anuladas = 0;
  let dissertativas = 0;
  let semGabarito = 0;
  let comCarimboHomologado = 0;
  let comCarimboOficial = 0;
  let comExplicacao = 0;

  for (const q of qs) {
    const ans = (q.correctAnswer || q.correct_answer || '').trim().toUpperCase();
    const isAnulada = Boolean(q.isAnulada || q.is_anulada || ans === 'ANULADA');
    const isDissertativa = q.type === 'Dissertativa' || (!q.options || q.options.length === 0);
    const comm = (q.commentary || q.finalCommentary || '');
    const hasHomologCarimbo = comm.includes('Gabarito Oficial Homologado') || comm.includes('Âncora de Ouro') || Boolean(q.official_audit);
    const hasOficialCarimbo = comm.includes('Gabarito Oficial') || Boolean(q.is_official);
    const hasExpl = comm.length > 50;

    if (isAnulada) {
      anuladas++;
    } else if (isDissertativa) {
      dissertativas++;
    } else if (['A', 'B', 'C', 'D', 'E'].includes(ans)) {
      validAns++;
    } else {
      semGabarito++;
    }

    if (hasHomologCarimbo) comCarimboHomologado++;
    if (hasOficialCarimbo) comCarimboOficial++;
    if (hasExpl) comExplicacao++;

    if (!allLocalIds.has(q.id)) {
      allLocalIds.set(q.id, {
        file: item.key,
        spec: q.especialidade || item.name,
        ans,
        isAnulada,
        isDissertativa,
        hasAnswer: ['A', 'B', 'C', 'D', 'E'].includes(ans),
        hasHomologCarimbo,
        hasOficialCarimbo
      });
    }
  }

  const stat = {
    especialidade: item.name,
    arquivo: item.file,
    checkpointExiste: fs.existsSync(item.checkpoint),
    total: qs.length,
    validAns,
    anuladas,
    dissertativas,
    semGabarito,
    comCarimboHomologado,
    comCarimboOficial,
    comExplicacao
  };
  localStats.push(stat);

  console.log(`\n🩺 ${item.name.toUpperCase()} (${path.basename(item.file)})`);
  console.log(`   Total de Questões       : ${stat.total.toLocaleString('pt-BR')}`);
  console.log(`   • Gabarito Válido (A-E) : ${stat.validAns.toLocaleString('pt-BR')} (${((stat.validAns/stat.total)*100).toFixed(1)}%)`);
  console.log(`   • Anuladas              : ${stat.anuladas.toLocaleString('pt-BR')} (${((stat.anuladas/stat.total)*100).toFixed(1)}%)`);
  console.log(`   • Discursivas (2ª fase) : ${stat.dissertativas.toLocaleString('pt-BR')} (${((stat.dissertativas/stat.total)*100).toFixed(1)}%)`);
  console.log(`   • SEM Gabarito Válido   : ${stat.semGabarito.toLocaleString('pt-BR')} (${((stat.semGabarito/stat.total)*100).toFixed(1)}%)`);
  console.log(`   • Com Carimbo Homologado: ${stat.comCarimboHomologado.toLocaleString('pt-BR')}`);
  console.log(`   • Com Carimbo Oficial   : ${stat.comCarimboOficial.toLocaleString('pt-BR')}`);
  console.log(`   • Com Comentário/Resol. : ${stat.comExplicacao.toLocaleString('pt-BR')}`);
  console.log(`   • Checkpoint Homologado : ${stat.checkpointExiste ? '✅ PRESENTE' : '⏳ PENDENTE'}`);
}

// Totalizadores dos 8 arquivos
const totGeral = localStats.reduce((acc, s) => acc + s.total, 0);
const totValid = localStats.reduce((acc, s) => acc + s.validAns, 0);
const totAnul = localStats.reduce((acc, s) => acc + s.anuladas, 0);
const totDiss = localStats.reduce((acc, s) => acc + s.dissertativas, 0);
const totSemGab = localStats.reduce((acc, s) => acc + s.semGabarito, 0);
const totHomolog = localStats.reduce((acc, s) => acc + s.comCarimboHomologado, 0);
const totOficial = localStats.reduce((acc, s) => acc + s.comCarimboOficial, 0);

console.log('\n' + '='.repeat(80));
console.log('📊 RESUMO CONSOLIDADO DOS ARQUIVOS LOCAIS:');
console.log('='.repeat(80));
console.log(`Total Bruto de Questões (8 especialidades) : ${totGeral.toLocaleString('pt-BR')}`);
console.log(`Total de IDs Únicos Locais                : ${allLocalIds.size.toLocaleString('pt-BR')}`);
console.log(`• Questões com Gabarito Válido (A-E)      : ${totValid.toLocaleString('pt-BR')} (${((totValid/totGeral)*100).toFixed(2)}%)`);
console.log(`• Questões Anuladas                       : ${totAnul.toLocaleString('pt-BR')} (${((totAnul/totGeral)*100).toFixed(2)}%)`);
console.log(`• Questões Discursivas (sem alternativas) : ${totDiss.toLocaleString('pt-BR')} (${((totDiss/totGeral)*100).toFixed(2)}%)`);
console.log(`• Questões SEM Gabarito Válido (Vazio)    : ${totSemGab.toLocaleString('pt-BR')} (${((totSemGab/totGeral)*100).toFixed(2)}%)`);
console.log(`• Total Auditado / Aproveitável           : ${(totValid + totAnul).toLocaleString('pt-BR')} (${(((totValid + totAnul)/totGeral)*100).toFixed(2)}%)`);
console.log(`• Com Carimbo Homologado                  : ${totHomolog.toLocaleString('pt-BR')}`);
console.log(`• Com Carimbo Oficial (amplo)             : ${totOficial.toLocaleString('pt-BR')}`);

// Salva resumo em JSON para uso cruzado
fs.writeFileSync('data/local_questions_audit_summary.json', JSON.stringify({
  timestamp: new Date().toISOString(),
  totGeral,
  uniqueIds: allLocalIds.size,
  totValid,
  totAnul,
  totDiss,
  totSemGab,
  totHomolog,
  totOficial,
  specialties: localStats
}, null, 2), 'utf8');

console.log('\n💾 Resumo salvo em data/local_questions_audit_summary.json');

