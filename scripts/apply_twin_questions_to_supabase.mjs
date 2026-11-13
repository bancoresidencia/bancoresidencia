import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const dbPath = path.resolve('data/questoes_132k.db');
const localDb = new DatabaseSync(dbPath, { readOnly: true });

function cleanLexical(text) {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(\d+)([a-zA-Z]+)\b/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateJaccard(s1, s2) {
  const w1 = new Set(cleanLexical(s1).split(' ').filter(w => w.length > 2));
  const w2 = new Set(cleanLexical(s2).split(' ').filter(w => w.length > 2));
  if (w1.size === 0 || w2.size === 0) return 0;
  let inter = 0;
  for (const w of w1) if (w2.has(w)) inter++;
  return inter / new Set([...w1, ...w2]).size;
}

function calculateSimilarity(s1, s2) {
  const j = calculateJaccard(s1, s2);
  const s1C = cleanLexical(s1).replace(/\s+/g, '');
  const s2C = cleanLexical(s2).replace(/\s+/g, '');
  if (!s1C || !s2C) return j;
  const bg1 = new Set();
  const bg2 = new Set();
  for (let i = 0; i < s1C.length - 1; i++) bg1.add(s1C.slice(i, i + 2));
  for (let i = 0; i < s2C.length - 1; i++) bg2.add(s2C.slice(i, i + 2));
  if (bg1.size === 0 || bg2.size === 0) return j;
  let inter = 0;
  for (const b of bg1) if (bg2.has(b)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (j * 0.4) + (bgSim * 0.6);
}

function parseOptions(opts) {
  if (!opts) return [];
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try {
      return JSON.parse(opts);
    } catch (e) {
      return [];
    }
  }
  return [];
}

async function main() {
  console.log('🚀 INICIANDO APLICAÇÃO HOMOLOGADA DE QUESTÕES GÊMEAS NO SUPABASE...');

  const previewPath = path.resolve('data/staging_questoes_gemeas_preview.json');
  if (!fs.existsSync(previewPath)) {
    console.error('Arquivo de preview não encontrado!');
    return;
  }
  const pairs = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
  console.log(`📋 Total de pares no arquivo: ${pairs.length}`);

  // Prepara busca no sqlite
  const stmtRes = localDb.prepare('SELECT id, code, statement, options, correct_answer FROM questions WHERE code = ?');

  const report = {
    dataInicio: new Date().toISOString(),
    totalPares: pairs.length,
    sucesso: 0,
    erros: 0,
    pulados: 0,
    detalhes: []
  };

  for (let i = 0; i < pairs.length; i++) {
    const p = pairs[i];
    
    // 1. Busca questão pendente no Supabase
    const { data: qPend, error: errPend } = await supabase
      .from('questions')
      .select('id, code, year, institution, statement, options, correct_answer')
      .eq('code', p.pendenteCode)
      .single();

    if (errPend || !qPend) {
      console.log(`⚠️ [PULADA] Não encontrada no Supabase: ${p.pendenteCode}`);
      report.pulados++;
      report.detalhes.push({ code: p.pendenteCode, status: 'NOT_FOUND_SUPABASE', error: errPend?.message });
      continue;
    }

    if (qPend.correct_answer && qPend.correct_answer.trim() !== '') {
      console.log(`ℹ️ [JÁ TEM GABARITO] ${p.pendenteCode}: GB=${qPend.correct_answer}`);
      report.pulados++;
      report.detalhes.push({ code: p.pendenteCode, status: 'ALREADY_HAS_ANSWER', answer: qPend.correct_answer });
      continue;
    }

    // 2. Busca questão resolvida no SQLite
    const qRes = stmtRes.get(p.resolvidaCode);
    if (!qRes || !qRes.correct_answer) {
      console.log(`⚠️ [PULADA] Resolvida não encontrada no SQLite: ${p.resolvidaCode}`);
      report.pulados++;
      report.detalhes.push({ code: p.pendenteCode, status: 'RESOLVED_NOT_FOUND_LOCAL' });
      continue;
    }

    const rawAns = qRes.correct_answer.trim().toUpperCase();
    let finalAnswer = rawAns;
    let foiRemapeado = false;
    let isAnulada = rawAns === 'ANULADA';

    // 3. Dual-Gate Anti-Permutação de Alternativas
    if (!isAnulada && ['A', 'B', 'C', 'D', 'E'].includes(rawAns)) {
      const resOpts = parseOptions(qRes.options);
      const pendOpts = parseOptions(qPend.options);

      const winningResOpt = resOpts.find(o => (o.letter || '').toUpperCase() === rawAns);

      if (winningResOpt && winningResOpt.text && pendOpts.length > 0) {
        // Encontra no qPend a opção com o mesmo texto
        let bestOpt = null;
        let bestSim = 0;
        for (const po of pendOpts) {
          const sim = calculateSimilarity(winningResOpt.text, po.text || '');
          if (sim > bestSim) {
            bestSim = sim;
            bestOpt = po;
          }
        }

        if (bestOpt && bestSim >= 0.80) {
          const targetLetter = (bestOpt.letter || '').toUpperCase();
          if (targetLetter !== rawAns) {
            finalAnswer = targetLetter;
            foiRemapeado = true;
            console.log(`   🔄 Remapeamento Anti-Permutação: ${p.pendenteCode}: de ${rawAns} -> ${finalAnswer} (${(bestSim*100).toFixed(1)}% match no texto "${winningResOpt.text.slice(0,30)}...")`);
          } else {
            finalAnswer = targetLetter;
          }
        } else {
          // Se não encontrou a alternativa correspondente com certeza >= 80%, pula por segurança
          console.log(`   ⚠️ [PULADA POR SEGURANÇA] ${p.pendenteCode}: texto da alternativa vencedora não confere (bestSim: ${(bestSim*100).toFixed(1)}%)`);
          report.pulados++;
          report.detalhes.push({ code: p.pendenteCode, status: 'OPTION_MISMATCH', bestSim });
          continue;
        }
      }
    }

    // 4. Grava no Supabase
    const updatePayload = {
      correct_answer: finalAnswer
    };
    if (isAnulada) {
      updatePayload.is_anulada = true;
    }

    const { error: updateErr } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', qPend.id);

    if (updateErr) {
      console.error(`❌ Erro ao atualizar ${p.pendenteCode}:`, updateErr);
      report.erros++;
      report.detalhes.push({ code: p.pendenteCode, status: 'UPDATE_ERROR', error: updateErr.message });
    } else {
      report.sucesso++;
      report.detalhes.push({
        code: p.pendenteCode,
        id: qPend.id,
        status: 'SUCCESS',
        gabarito: finalAnswer,
        isAnulada,
        foiRemapeado,
        resolvidaOrigem: p.resolvidaCode,
        similaridade: p.similaridade
      });
      console.log(`✅ [${report.sucesso}/${pairs.length}] ${p.pendenteCode} -> GB=${finalAnswer} ${foiRemapeado ? '(REMAPEADA)' : ''} (Gêmea de ${p.resolvidaCode})`);
    }
  }

  report.dataFim = new Date().toISOString();
  console.log(`\n======================================================`);
  console.log(`🏁 APLICAÇÃO FINALIZADA!`);
  console.log(`Total Analisado: ${pairs.length}`);
  console.log(`Gravadas com Sucesso: ${report.sucesso}`);
  console.log(`Erros: ${report.erros}`);
  console.log(`Puladas: ${report.pulados}`);
  console.log(`======================================================\n`);

  fs.writeFileSync('data/relatorio_aplicacao_supabase_twins_188.json', JSON.stringify(report, null, 2));
  console.log('Relatório salvo em data/relatorio_aplicacao_supabase_twins_188.json');
}

main().catch(console.error);
