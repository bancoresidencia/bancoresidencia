import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups_pre_correcao');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('='.repeat(90));
console.log('🚀 EXECUTANDO FASE 3: CORREÇÃO CIRÚRGICA DE GABARITOS E ALINHAMENTO CLÍNICO');
console.log('='.repeat(90));

const QUESTION_FILES = [
  { spec: 'Cirurgia Geral', file: 'cirurgia_final_questions.json' },
  { spec: 'Clínica Médica', file: 'clinica_medica_final_questions.json' },
  { spec: 'Ginecologia', file: 'ginecologia_final_questions.json' },
  { spec: 'Medicina Preventiva', file: 'medicina_preventiva_final_questions.json' },
  { spec: 'Obstetrícia', file: 'obstetricia_final_questions.json' },
  { spec: 'Pediatria', file: 'pediatria_final_questions.json' },
  { spec: 'Urologia', file: 'urologia_final_questions.json' }
];

function normalize(s) {
  if (!s) return '';
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordSimilarity(a, b) {
  const wa = new Set(normalize(a).split(' ').filter(w => w.length > 2));
  const wb = new Set(normalize(b).split(' ').filter(w => w.length > 2));
  if (wa.size === 0 || wb.size === 0) return 0;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  return inter / Math.min(wa.size, wb.size);
}

// 1. Carregar Relatório e Categorias
const rep = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'relatorio_auditoria_integral_gabaritos.json'), 'utf8'));
const cat5 = rep.details.commentaryExplicitDifferentKey || [];
const cat6 = rep.details.commentaryPerAlternativeMismatch || [];

const cat5Map = new Map(cat5.map(c => [c.id, c]));
const cat6Map = new Map(cat6.map(c => [c.id, c]));

console.log(`• Questões em Cat 5 (Comentário com declaração explícita): ${cat5.length}`);
console.log(`• Questões em Cat 6 (Análise por alternativa com única correta): ${cat6.length}`);

let totalKeysCorrected = 0;
let totalHeadersAligned = 0;
let totalCat6Corrected = 0;
const phase3Log = [];

for (const qf of QUESTION_FILES) {
  const fpath = path.join(DATA_DIR, qf.file);
  const bpath = path.join(BACKUP_DIR, `${qf.file}.bak_phase3`);
  fs.copyFileSync(fpath, bpath);

  const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  let modifiedInFile = false;

  for (const q of questions) {
    // Caso Especial: INTO-2022-CIR-4058 (Paciente estável FAST+ no trauma abdominal fechado)
    if (q.code === 'INTO-2022-CIR-4058') {
      q.previous_answer = q.correct_answer;
      q.correct_answer = 'A';
      q.correctAnswer = 'A';
      q.commentary = `Gabarito Oficial: A) Tomografia computadorizada com contraste;

Raciocínio Clínico e Conduta (ATLS 10ª Edição):
Paciente vítima de acidente automobilístico com protocolo ATLS em andamento. Apresenta-se completamente ESTÁVEL hemodinamicamente (PA 150x90 mmHg, FC 92 bpm, FR 18 irpm, SatO2 97%).
Ao exame físico abdominal, há dor à palpação difusa, porém SEM sinais de peritonite (sem descompressão dolorosa).
O FAST realizado à beira-leito foi positivo, evidenciando líquido livre em loja esplenorrenal.
De acordo com as diretrizes consolidadas do ATLS (Advanced Trauma Life Support), a conduta diante de trauma abdominal fechado com FAST positivo em paciente HEMODINAMICAMENTE ESTÁVEL é a realização de TOMOGRAFIA COMPUTADORIZADA (TC) DE ABDOME COM CONTRASTE INTRAVENOSO para estadiamento e identificação da lesão orgânica específica, viabilizando o tratamento conservador não operatório.
A laparotomia exploradora imediata (Alternativa B) está indicada apenas em pacientes hemodinamicamente instáveis com FAST positivo ou na presença de peritonite franca ao exame físico.`;
      modifiedInFile = true;
      totalKeysCorrected++;
      phase3Log.push({ id: q.id, code: q.code, type: 'ATLS_INTO_CORRECTION', from: 'B', to: 'A' });
      continue;
    }

    // Processamento Cat 5
    if (cat5Map.has(q.id) && q.options && q.options.length > 0) {
      const item = cat5Map.get(q.id);
      const comm = q.commentary || '';
      const m = comm.match(/(?:gabarito|resposta|gabarito oficial)[\s:]+(?:alternativa\s+)?([A-E])\)?\s*[:\-–]?\s*(.+)/i);
      
      if (m) {
        const declaredLetter = m[1].toUpperCase();
        const rawSolutionText = m[2].split(/\n|\. |\bjustificativa\b|\bdiscussão\b|\bcomentário\b/i)[0].trim();

        let bestOpt = null;
        let bestSim = 0;

        for (const opt of q.options) {
          const sim = wordSimilarity(rawSolutionText, opt.text);
          if (sim > bestSim) {
            bestSim = sim;
            bestOpt = opt;
          }
        }

        const curAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();

        if (bestSim >= 0.5 && bestOpt) {
          const targetLetter = bestOpt.letter.toUpperCase();
          if (targetLetter !== curAns) {
            // ERRO REAL NO BANCO -> Atualizar gabarito para a alternativa médica correta
            q.previous_answer = curAns;
            q.correct_answer = targetLetter;
            q.correctAnswer = targetLetter;

            // Alinhar também o cabeçalho do comentário para não ficar conflitante
            q.commentary = comm.replace(
              /(?:gabarito|resposta|gabarito oficial)[\s:]+(?:alternativa\s+)?[A-E]\)?/i,
              `Gabarito Oficial: Alternativa ${targetLetter}`
            );

            totalKeysCorrected++;
            modifiedInFile = true;
            phase3Log.push({
              id: q.id,
              code: q.code,
              type: 'KEY_CORRECTED_TO_MATCH_OPTION',
              from: curAns,
              to: targetLetter,
              matchedText: bestOpt.text.slice(0, 60)
            });
          } else {
            // BANCO JÁ CORRETO -> Apenas alinhar o cabeçalho do comentário que tinha a letra antiga
            q.commentary = comm.replace(
              /(?:gabarito|resposta|gabarito oficial)[\s:]+(?:alternativa\s+)?[A-E]\)?/i,
              `Gabarito Oficial: Alternativa ${curAns}`
            );
            totalHeadersAligned++;
            modifiedInFile = true;
            phase3Log.push({
              id: q.id,
              code: q.code,
              type: 'COMMENTARY_HEADER_ALIGNED',
              letter: curAns,
              matchedText: bestOpt.text.slice(0, 60)
            });
          }
        }
      }
    }

    // Processamento Cat 6 (Análise por alternativa com uma única correta)
    if (cat6Map.has(q.id) && q.options && q.options.length > 0) {
      const item = cat6Map.get(q.id);
      const curAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
      const target = item.suspected_answer;
      if (target && target !== curAns && q.options.some(o => o.letter === target)) {
        q.previous_answer = curAns;
        q.correct_answer = target;
        q.correctAnswer = target;
        totalCat6Corrected++;
        modifiedInFile = true;
        phase3Log.push({
          id: q.id,
          code: q.code,
          type: 'CAT6_ALTERNATIVE_STEP_CORRECTED',
          from: curAns,
          to: target
        });
      }
    }
  }

  if (modifiedInFile) {
    fs.writeFileSync(fpath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`  • [${qf.spec}] atualizado com sucesso.`);
  }
}

console.log('\n' + '='.repeat(90));
console.log('📊 RESUMO DA EXECUÇÃO DA FASE 3:');
console.log('='.repeat(90));
console.log(`• Total de Gabaritos Errados Corrigidos no Banco:       ${totalKeysCorrected}`);
console.log(`• Total de Cabeçalhos de Caderno Descompassado Alinhados: ${totalHeadersAligned}`);
console.log(`• Total de Correções por Análise de Alternativa (Cat 6):  ${totalCat6Corrected}`);
console.log(`• Total Geral de Itens Saneados:                         ${totalKeysCorrected + totalHeadersAligned + totalCat6Corrected}`);

// Salvar log detalhado
const logPath = path.join(DATA_DIR, 'log_execucao_fase3.json');
fs.writeFileSync(logPath, JSON.stringify({
  executed_at: new Date().toISOString(),
  totalKeysCorrected,
  totalHeadersAligned,
  totalCat6Corrected,
  log: phase3Log
}, null, 2));

console.log(`\n📄 Log detalhado salvo em: ${logPath}`);
