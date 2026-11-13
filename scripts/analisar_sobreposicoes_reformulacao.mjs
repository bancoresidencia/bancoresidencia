import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const BACKUP_DIR = path.resolve('data/backups/supabase_backup_2026-11-13T02-27-33-296Z/tables');

function normalizeStatement(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeStatementHash(text) {
  const norm = normalizeStatement(text);
  if (!norm || norm.length < 25) return null;
  return crypto.createHash('md5').update(norm).digest('hex');
}

console.log('🔍 Iniciando análise de sobreposições e cruzamentos...');

// 1. Carregar Revalida Base
console.log('Carregando questions_revalida_base.json...');
const revalidaBase = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_revalida_base.json'), 'utf8'));
const revalidaBaseIds = new Set(revalidaBase.map(q => String(q.id)));
const revalidaBaseHashes = new Map();
for (const q of revalidaBase) {
  const h = computeStatementHash(q.statement);
  if (h) revalidaBaseHashes.set(h, q.id);
}
console.log(`  -> ${revalidaBase.length} questões carregadas de questions_revalida_base (${revalidaBaseHashes.size} hashes únicos)`);

// 2. Carregar Revalida Expansão
console.log('Carregando questions_expansion_revalida.json...');
const expRevalida = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_expansion_revalida.json'), 'utf8'));
let revalidaExactIdMatch = 0;
let revalidaHashMatch = 0;
for (const q of expRevalida) {
  const idStr = String(q.id);
  const h = computeStatementHash(q.statement);
  if (revalidaBaseIds.has(idStr)) revalidaExactIdMatch++;
  else if (h && revalidaBaseHashes.has(h)) revalidaHashMatch++;
}
console.log(`  -> ${expRevalida.length} questões em questions_expansion_revalida`);
console.log(`  -> Sobreposições com questions_revalida_base: ${revalidaExactIdMatch} por ID, ${revalidaHashMatch} por Hash de enunciado`);

// 3. Carregar questions_expansion_direto
console.log('Carregando questions_expansion_direto.json...');
const expDireto = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_expansion_direto.json'), 'utf8'));
let expDiretoRevalidaIdMatch = 0;
let expDiretoRevalidaHashMatch = 0;
const expDiretoIds = new Set(expDireto.map(q => String(q.id)));
const expDiretoHashes = new Map();

for (const q of expDireto) {
  const idStr = String(q.id);
  const h = computeStatementHash(q.statement);
  if (revalidaBaseIds.has(idStr)) expDiretoRevalidaIdMatch++;
  else if (h && revalidaBaseHashes.has(h)) expDiretoRevalidaHashMatch++;
  if (h) expDiretoHashes.set(h, q);
}
console.log(`  -> ${expDireto.length} questões em questions_expansion_direto`);
console.log(`  -> Contaminações de Revalida em exp_direto: ${expDiretoRevalidaIdMatch} por ID, ${expDiretoRevalidaHashMatch} por Hash`);

// 4. Carregar questions
console.log('Carregando questions.json (isso pode levar alguns segundos)...');
const questions = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions.json'), 'utf8'));
let questionsRevalidaIdMatch = 0;
let questionsRevalidaHashMatch = 0;
let questionsExpDiretoIdMatch = 0;
let questionsExpDiretoHashMatch = 0;

for (const q of questions) {
  const idStr = String(q.id);
  const h = computeStatementHash(q.statement);
  
  // Revalida check
  if (revalidaBaseIds.has(idStr)) questionsRevalidaIdMatch++;
  else if (h && revalidaBaseHashes.has(h)) questionsRevalidaHashMatch++;

  // Exp Direto check
  if (expDiretoIds.has(idStr)) questionsExpDiretoIdMatch++;
  else if (h && expDiretoHashes.has(h)) questionsExpDiretoHashMatch++;
}

console.log(`  -> ${questions.length} questões em questions`);
console.log(`  -> Contaminações de Revalida em questions: ${questionsRevalidaIdMatch} por ID, ${questionsRevalidaHashMatch} por Hash`);
console.log(`  -> Sobreposições entre questions e exp_direto: ${questionsExpDiretoIdMatch} por ID, ${questionsExpDiretoHashMatch} por Hash`);

// 5. Verificar R+ e Título
console.log('Carregando R+ e Título...');
const rplus = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_expansion_r_plus.json'), 'utf8'));
const titulo = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'questions_expansion_titulo_especialista.json'), 'utf8'));
console.log(`  -> questions_expansion_r_plus: ${rplus.length}`);
console.log(`  -> questions_expansion_titulo_especialista: ${titulo.length}`);

console.log('\n📊 RESUMO GERAL DAS CONTAGENS:');
console.log('='.repeat(60));
console.log(`Revalida Base:                   ${revalidaBase.length}`);
console.log(`Revalida Expansão:               ${expRevalida.length}`);
console.log(`Revalida Único Estimado:         ~${revalidaBase.length + expRevalida.length - revalidaExactIdMatch - revalidaHashMatch}`);
console.log(`Questions (Acesso Direto base):  ${questions.length}`);
console.log(`Expansão Acesso Direto:          ${expDireto.length}`);
console.log(`Revalida a remover de Direto:    ${questionsRevalidaIdMatch + questionsRevalidaHashMatch + expDiretoRevalidaIdMatch + expDiretoRevalidaHashMatch}`);
console.log(`R+ Total:                        ${rplus.length}`);
console.log(`Título Total:                    ${titulo.length}`);
console.log('='.repeat(60));

