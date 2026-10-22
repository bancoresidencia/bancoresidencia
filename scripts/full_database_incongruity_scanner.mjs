import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const QUESTION_FILES = [
  { name: 'Cirurgia', file: 'cirurgia_final_questions.json' },
  { name: 'Clínica Médica', file: 'clinica_medica_final_questions.json' },
  { name: 'Ginecologia', file: 'ginecologia_final_questions.json' },
  { name: 'Medicina Preventiva e Social', file: 'medicina_preventiva_final_questions.json' },
  { name: 'Obstetrícia', file: 'obstetricia_final_questions.json' },
  { name: 'Pediatria', file: 'pediatria_final_questions.json' },
  { name: 'Urologia', file: 'urologia_final_questions.json' }
];

async function scan() {
  console.log('='.repeat(90));
  console.log('🔎 VARREDURA COMPLETA E DETALHADA DE INCONGRUÊNCIAS NO BANCO DE QUESTÕES (100%)');
  console.log('='.repeat(90));

  const stats = {
    totalQuestions: 0,
    outOfOptions: [],
    anuladasWithValidLetter: [],
    letterIsAnuladaButFlagFalse: [],
    placeholderHomo: [],
    fakeUSP8: [],
    emptyAnswerWithGoldMatch: [],
    mismatchesWithGold: []
  };

  // 1. Carregar Checkpoints de Ouro
  console.log('\n📦 1. Carregando Bases Padrão-Ouro / Checkpoints...');
  const goldGineco = JSON.parse(fs.readFileSync('data/checkpoints/ginecologia_gold_anchors_complete.json', 'utf8'));
  const goldGinecoMap = new Map(goldGineco.map(g => [g.id, g]));

  const goldAll = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  const goldAllMap = new Map(goldAll.filter(q => q.id).map(q => [q.id, q]));

  const goldUro = JSON.parse(fs.readFileSync('data/checkpoints/urologia_gold_anchors_complete.json', 'utf8'));
  const goldUroMap = new Map(goldUro.map(u => [u.id, u]));

  console.log(`• Checkpoint Ginecologia: ${goldGineco.length} questões`);
  console.log(`• Checkpoint Urologia: ${goldUro.length} questões`);
  console.log(`• Homologadas Gold Geral: ${goldAll.length} questões`);

  // 2. Analisar Arquivos Finais
  console.log('\n📦 2. Analisando as 7 Especialidades...');
  for (const item of QUESTION_FILES) {
    const fpath = path.join('data', item.file);
    if (!fs.existsSync(fpath)) continue;
    const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    stats.totalQuestions += questions.length;

    let spOutOfOptions = 0;
    let spPlaceholderHomo = 0;
    let spAnuladaConflict = 0;
    let spUsp8 = 0;
    let spGoldMismatch = 0;

    for (const q of questions) {
      const qid = q.id;
      const ans = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
      const isAnul = Boolean(q.is_anulada || q.isAnulada || ans === 'ANULADA');
      const isDisc = q.type === 'Dissertativa' || ans === 'DISCURSIVA';
      const optLetters = (q.options || []).map(o => o.letter);
      const comm = (q.commentary || '').toLowerCase();
      const src = (q.official_source || '').toLowerCase();

      // Incongruência A: Letra fora das opções (ex: 4 alternativas e gabarito E)
      if (!isAnul && !isDisc && ans && optLetters.length > 0 && !optLetters.includes(ans)) {
        spOutOfOptions++;
        stats.outOfOptions.push({
          id: qid,
          code: q.code,
          spec: item.name,
          institution: q.institution,
          ans,
          optLetters,
          optionsCount: optLetters.length
        });
      }

      // Incongruência B: Comentário provisório ("em processo de homologação")
      if (comm.includes('processo de homologação')) {
        spPlaceholderHomo++;
        stats.placeholderHomo.push({ id: qid, code: q.code, spec: item.name });
      }

      // Incongruência C: official_source incorreto ("USP 2025 Questão 8") em outras bancas
      if (src.includes('usp 2025 questão 8') && !(q.institution || '').toLowerCase().includes('usp') && !(q.banca || '').toLowerCase().includes('usp')) {
        spUsp8++;
        stats.fakeUSP8.push({ id: qid, code: q.code, spec: item.name, institution: q.institution });
      }

      // Incongruência D: Conflito de Anuladas
      if (ans === 'ANULADA' && !q.is_anulada) {
        spAnuladaConflict++;
        stats.letterIsAnuladaButFlagFalse.push({ id: qid, code: q.code, spec: item.name });
      }

      // Incongruência E: Divergência com Checkpoint de Ouro
      let goldItem = null;
      if (item.name === 'Ginecologia') goldItem = goldGinecoMap.get(qid);
      else if (item.name === 'Urologia') goldItem = goldUroMap.get(qid);
      else goldItem = goldAllMap.get(qid);

      if (goldItem) {
        const goldAns = (goldItem.official_answer || goldItem.correct_answer || goldItem.correctAnswer || '').trim().toUpperCase();
        if (goldAns && goldAns !== 'DISCURSIVA' && ['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(goldAns)) {
          const isGoldAnul = goldAns === 'ANULADA';
          const isLocalAnul = Boolean(q.is_anulada || ans === 'ANULADA');
          if (isGoldAnul) {
            if (!isLocalAnul) {
              spGoldMismatch++;
              stats.mismatchesWithGold.push({
                id: qid,
                code: q.code,
                spec: item.name,
                current: ans,
                gold: goldAns,
                status: goldItem.status
              });
            }
          } else if (ans !== goldAns) {
            spGoldMismatch++;
            stats.mismatchesWithGold.push({
              id: qid,
              code: q.code,
              spec: item.name,
              current: ans,
              gold: goldAns,
              status: goldItem.status
            });
          }
        }
      }
    }

    console.log(`\n• [${item.name}] (${questions.length} questões):`);
    console.log(`   - Letras fora das opções: ${spOutOfOptions}`);
    console.log(`   - Comentários provisórios ('em homologação'): ${spPlaceholderHomo}`);
    console.log(`   - Fonte espúria 'USP 2025 Q8': ${spUsp8}`);
    console.log(`   - Conflitos de flag Anulada: ${spAnuladaConflict}`);
    console.log(`   - Divergências com Checkpoints de Ouro: ${spGoldMismatch}`);
  }

  console.log('\n' + '='.repeat(90));
  console.log('📊 CONSOLIDAÇÃO TOTAL DE INCONGRUÊNCIAS ENCONTRADAS:');
  console.log('='.repeat(90));
  console.log(`1. Total de questões com letra de resposta FORA das opções existentes: ${stats.outOfOptions.length}`);
  console.log(`2. Total de questões com comentário provisório ('em homologação'): ${stats.placeholderHomo.length}`);
  console.log(`3. Total de questões com fonte espúria 'USP 2025 Questão 8': ${stats.fakeUSP8.length}`);
  console.log(`4. Total de divergências onde o checkpoint de ouro possui gabarito diferente: ${stats.mismatchesWithGold.length}`);
  console.log(`5. Total de conflitos de flag de Anulada: ${stats.letterIsAnuladaButFlagFalse.length}`);

  // Salvar relatório JSON detalhado
  const outPath = 'data/relatorio_completo_incongruencias_gabarito.json';
  fs.writeFileSync(outPath, JSON.stringify(stats, null, 2));
  console.log(`\n📄 Relatório completo salvo em: ${outPath}`);
}

scan().catch(console.error);
