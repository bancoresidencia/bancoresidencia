import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carrega variáveis de ambiente
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/^\uFEFF/, '').trim();
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

function sanitizeBanca(banca) {
  return banca
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 15)
    .toUpperCase();
}

function getPriority(banca, faltam, ano) {
  const b = banca.toUpperCase();
  const majorBoards = ['ENARE', 'UNICAMP', 'USP', 'SES-GO', 'SES-PE', 'SES-DF', 'PSU-MG', 'AMRIGS', 'SUS-SP', 'SUS-BA', 'UERJ', 'ABEM', 'AMP'];
  const isMajor = majorBoards.some(mb => b.includes(mb));
  
  if (isMajor && faltam >= 40) return 1; // P1 - Alta Prioridade
  if (ano >= 2024 && faltam >= 50) return 1;
  if (isMajor || faltam >= 50 || ano >= 2025) return 2; // P2 - Prioridade Média
  return 3; // P3 - Prioridade Normal
}

async function main() {
  console.log('================================================================');
  console.log('  MOTOR DISTRIBUÍDO FASE 2 — INICIALIZAÇÃO NO SUPABASE');
  console.log('  Universo: Provas 2020-2026 com >= 20 questões faltando');
  console.log('================================================================\n');

  const csvPath = path.resolve('data/provas_faltantes_gt20_etapas.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Arquivo CSV não encontrado: ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const lines = fileContent.split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = parseCSVLine(lines[0]).map(h => cleanText(h));
  
  const colInstituicao = header.indexOf('instituicao');
  const colBanca = header.indexOf('banca');
  const colAno = header.indexOf('ano');
  const colTipoProva = header.indexOf('tipo_prova');
  const colTotal = header.indexOf('total_questoes');
  const colFaltam = header.indexOf('faltam_gabaritos');
  const colCob = header.indexOf('percentual_cobertura');
  const colEtapa = header.indexOf('classificacao_etapa');
  const colDetalhes = header.indexOf('detalhes_estrategicos');
  const colPortal = header.indexOf('portal_oficial_identificado');
  const colPdrId = header.indexOf('pdr_prova_id');
  const colPdrTitulo = header.indexOf('pdr_titulo');

  const tasks = [];
  const statsByYear = {};
  let totalMissing = 0;
  let totalQuestions = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < colFaltam) continue;

    const ano = parseInt(cols[colAno]);
    const faltam = parseInt(cols[colFaltam]);
    const totalQ = parseInt(cols[colTotal]) || 0;
    const banca = cols[colBanca] || 'BANCA';
    const instituicao = cols[colInstituicao] || banca;
    const pdrIdRaw = colPdrId !== -1 ? cols[colPdrId] : null;
    const pdrId = pdrIdRaw && !isNaN(parseInt(pdrIdRaw)) ? parseInt(pdrIdRaw) : null;
    const pdrTitulo = colPdrTitulo !== -1 ? cols[colPdrTitulo] : '';

    if (ano >= 2020 && ano <= 2026 && faltam >= 20) {
      const priority = getPriority(banca, faltam, ano);
      const bancaClean = sanitizeBanca(banca);
      const taskId = `TASK-${ano}-${bancaClean}-${String(tasks.length + 1).padStart(3, '0')}`;

      tasks.push({
        id: taskId,
        ordem: tasks.length + 1,
        prioridade: priority,
        ano: ano,
        banca: banca,
        instituicao: instituicao,
        tipo_prova: cols[colTipoProva] || 'Prova 1 / Regular',
        total_questoes: totalQ,
        faltam_gabaritos: faltam,
        percentual_cobertura: cols[colCob] || '0%',
        classificacao_etapa: cols[colEtapa] || '',
        detalhes: cols[colDetalhes] || '',
        portal_oficial: cols[colPortal] || '',
        pdr_prova_id: pdrId,
        pdr_titulo: pdrTitulo,
        status: 'PENDENTE', // PENDENTE | EM_ANDAMENTO | CONCLUIDO | BUSCA_WEB_CONCLUIDA
        assigned_to: null,  // 'DEV_1' | 'DEV_2' | null
        claimed_at: null,
        heartbeat_at: null,
        completed_at: null,
        resultado: {
          gabaritos_aplicados: 0,
          questoes_resolvidas: 0,
          observacoes: ''
        }
      });

      statsByYear[ano] = (statsByYear[ano] || 0) + 1;
      totalMissing += faltam;
      totalQuestions += totalQ;
    }
  }

  // Ordena por Prioridade (P1 -> P2 -> P3) e depois por maior quantidade de faltantes
  tasks.sort((a, b) => {
    if (a.prioridade !== b.prioridade) return a.prioridade - b.prioridade;
    return b.faltam_gabaritos - a.faltam_gabaritos;
  });

  // Reatribui ordem final
  tasks.forEach((t, idx) => { t.ordem = idx + 1; });

  console.log(`✅ Total de provas 2020-2026 mapeadas: ${tasks.length} provas`);
  console.log(`✅ Total de questões no universo     : ${totalQuestions.toLocaleString('pt-BR')} questões`);
  console.log(`✅ Total de gabaritos a recuperar    : ${totalMissing.toLocaleString('pt-BR')} gabaritos\n`);

  console.log('Distribuição por Ano:');
  Object.keys(statsByYear).sort().forEach(y => {
    console.log(`  • Ano ${y}: ${statsByYear[y]} provas`);
  });

  const p1Count = tasks.filter(t => t.prioridade === 1).length;
  const p2Count = tasks.filter(t => t.prioridade === 2).length;
  const p3Count = tasks.filter(t => t.prioridade === 3).length;
  console.log(`\nPrioridades do Motor:`);
  console.log(`  • P1 (Alta - Bancas Estaduais/Nacionais e Grandes Volumes): ${p1Count} provas`);
  console.log(`  • P2 (Média - Anos 2024-2026 e > 50 faltantes)          : ${p2Count} provas`);
  console.log(`  • P3 (Normal - Demais Provas Regionais)                 : ${p3Count} provas\n`);

  // Salva cópia local
  const localManifest = path.resolve('data/fase2_motor_manifest.json');
  fs.writeFileSync(localManifest, JSON.stringify(tasks, null, 2), 'utf8');
  console.log(`💾 Cópia local salva em: ${localManifest}`);

  // Prepara status inicial
  const statusDoc = {
    updated_at: new Date().toISOString(),
    total_provas: tasks.length,
    total_questoes: totalQuestions,
    total_gabaritos_faltantes: totalMissing,
    concluidas: 0,
    em_andamento: 0,
    pendentes: tasks.length,
    busca_web_concluida: 0,
    gabaritos_aplicados_total: 0,
    progresso_percentual: '0.0%',
    workers: {
      DEV_1: { status: 'DISPONIVEL', current_task: null, last_heartbeat: null },
      DEV_2: { status: 'DISPONIVEL', current_task: null, last_heartbeat: null }
    }
  };

  // Faz upload para o Supabase Storage (Bucket 'questoes')
  console.log('\n[Supabase Storage] Fazendo upload do Plano Motor...');
  
  // 1. Manifest Imutável
  const { error: err1 } = await supabase.storage
    .from('questoes')
    .upload('fase2_motor_manifest.json', JSON.stringify(tasks, null, 2), {
      contentType: 'application/json',
      upsert: true
    });
  if (err1) throw new Error(`Falha no upload do manifest: ${err1.message}`);
  console.log('  ✅ fase2_motor_manifest.json subido com sucesso.');

  // 2. Fila Viva (Queue)
  const { error: err2 } = await supabase.storage
    .from('questoes')
    .upload('fase2_motor_queue.json', JSON.stringify(tasks, null, 2), {
      contentType: 'application/json',
      upsert: true
    });
  if (err2) throw new Error(`Falha no upload da fila: ${err2.message}`);
  console.log('  ✅ fase2_motor_queue.json subido com sucesso.');

  // 3. Status Dashboard
  const { error: err3 } = await supabase.storage
    .from('questoes')
    .upload('fase2_motor_status.json', JSON.stringify(statusDoc, null, 2), {
      contentType: 'application/json',
      upsert: true
    });
  if (err3) throw new Error(`Falha no upload do status: ${err3.message}`);
  console.log('  ✅ fase2_motor_status.json subido com sucesso.');

  console.log('\n================================================================');
  console.log('🚀 PLANO MOTOR FASE 2 INICIALIZADO NO SUPABASE COM SUCESSO!');
  console.log('   Fila com 530 provas pronta para consumo paralelo por DEV_1 e DEV_2.');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('❌ Erro na inicialização do motor:', err);
  process.exit(1);
});
