import fs from 'fs';
import path from 'path';

const specs = [
  { key: 'urologia', name: 'Urologia', file: 'data/urologia_final_questions.json', checkpoint: 'data/checkpoints/urologia_gold_anchors_complete.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'data/ginecologia_final_questions.json', checkpoint: 'data/checkpoints/ginecologia_gold_anchors_complete.json' },
  { key: 'cirurgia', name: 'Cirurgia Geral', file: 'data/cirurgia_final_questions.json', checkpoint: 'data/checkpoints/cirurgia_gold_anchors_complete.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json', checkpoint: 'data/checkpoints/obstetricia_gold_anchors_complete.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'data/pediatria_final_questions.json', checkpoint: 'data/checkpoints/pediatria_gold_anchors_complete.json' },
  { key: 'preventiva', name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json', checkpoint: 'data/checkpoints/medicina_preventiva_gold_anchors_complete.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json', checkpoint: 'data/checkpoints/clinica_medica_gold_anchors_complete.json' }
];

const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

console.log('========================================================================================');
console.log(` 🛡️  PAINEL DE AUDITORIA: PRINCÍPIO DO GABARITO IMUTÁVEL (ÂNCORA DE OURO)`);
console.log(` 📅 Atualizado em: ${now}`);
console.log('========================================================================================\n');

let grandTotal = 0;
let grandAudited = 0;
let grandAnuladas = 0;
let grandDissertativas = 0;
let grandMultipla = 0;

specs.forEach(s => {
  if (fs.existsSync(s.file)) {
    const qs = JSON.parse(fs.readFileSync(s.file, 'utf8'));
    const total = qs.length;
    let withAns = 0;
    let anuladas = 0;
    let dissertativas = 0;

    qs.forEach(q => {
      const isAnulada = Boolean(q.isAnulada || q.is_anulada);
      const isDissertativa = q.type === 'Dissertativa' || (!q.options || q.options.length === 0);
      const ans = (q.correctAnswer || q.correct_answer || '').trim();

      if (isAnulada) anuladas++;
      else if (isDissertativa) dissertativas++;
      else if (ans) withAns++;
    });

    const isComplete = fs.existsSync(s.checkpoint);
    const audited = withAns + anuladas + dissertativas;
    const pct = ((audited / total) * 100).toFixed(1);

    grandTotal += total;
    grandAudited += audited;
    grandAnuladas += anuladas;
    grandDissertativas += dissertativas;
    grandMultipla += withAns;

    let statusTag = '⏳ NA FILA';
    if (isComplete && audited === total) {
      statusTag = '✅ 100% BLINDADO';
    } else if (audited > 0) {
      statusTag = '🟡 EM AUDITORIA';
    }

    console.log(`┌─ [${s.name}] - ${statusTag}`);
    console.log(`│  Total: ${String(total).padStart(6)} questões | Auditadas: ${String(audited).padStart(6)} (${pct}%)`);
    console.log(`│  • Múltipla Escolha Homologada: ${String(withAns).padStart(5)}`);
    console.log(`│  • Anuladas pela Banca:         ${String(anuladas).padStart(5)}`);
    console.log(`│  • Discursivas (2ª fase):       ${String(dissertativas).padStart(5)}`);
    console.log(`│  • Manifesto de Ouro:           ${isComplete ? 'REGISTRADO (' + s.checkpoint + ')' : 'Pendente'}`);
    console.log(`└─────────────────────────────────────────────────────────────────────────────\n`);
  } else {
    console.log(`[${s.name.padEnd(20)}] ARQUIVO NÃO ENCONTRADO: ${s.file}\n`);
  }
});

const grandPct = ((grandAudited / grandTotal) * 100).toFixed(2);
console.log('========================================================================================');
console.log(` 📊 RESUMO GERAL DO UNIVERSO:`);
console.log(` • Total de Questões no Banco:           ${grandTotal.toLocaleString('pt-BR')}`);
console.log(` • Total Blindado / Auditado:            ${grandAudited.toLocaleString('pt-BR')} (${grandPct}%)`);
console.log(` • Múltipla Escolha com Gabarito Real:   ${grandMultipla.toLocaleString('pt-BR')}`);
console.log(` • Anuladas Oficiais Identificadas:      ${grandAnuladas.toLocaleString('pt-BR')}`);
console.log(` • Discursivas Identificadas e Isoladas: ${grandDissertativas.toLocaleString('pt-BR')}`);
console.log('========================================================================================\n');
