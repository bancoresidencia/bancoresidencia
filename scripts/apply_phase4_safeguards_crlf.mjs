import fs from 'fs';

console.log('='.repeat(70));
console.log('🛡️ APLICANDO REGRAS CANÔNICAS DE HAS_GABARITO (CRLF-SAFE)');
console.log('='.repeat(70));

// 1. questionService.ts
let qService = fs.readFileSync('src/services/questionService.ts', 'utf8');

// 1.1 buildQuestionQuery
const target1 = `  // Regra de Gabarito: Todas as 132.965 questões presentes por padrão
  if (filters.ocultarAnuladasErro) {
    query = query.eq('is_anulada', false);
  }`.replace(/\r?\n/g, '\r\n');

const replace1 = `  // Regra Canônica de Gabarito: Alunos só visualizam questões com gabarito homologado (A-E ou Anuladas)
  if (filters.gabaritoStatus === 'sem_gabarito') {
    query = query.eq('has_gabarito', false);
  } else if (filters.gabaritoStatus === 'todas') {
    // Curadoria administrativa visualiza todas
  } else {
    // Padrão do aluno: oculta discursivas sem alternativa e questões de bancas sem gabarito
    query = query.eq('has_gabarito', true);
  }

  if (filters.ocultarAnuladasErro) {
    query = query.eq('is_anulada', false);
  }`.replace(/\r?\n/g, '\r\n');

if (qService.includes(target1)) {
  qService = qService.replace(target1, replace1);
  console.log('✅ questionService.ts: buildQuestionQuery atualizada!');
} else {
  console.log('⚠️ target1 não encontrado em questionService.ts');
}

// 1.2 countQuery
const target2 = `      if (filters.ocultarAnuladasErro) {
        countQuery = countQuery.eq('is_anulada', false);
      }`.replace(/\r?\n/g, '\r\n');

const replace2 = `      if (filters.gabaritoStatus === 'sem_gabarito') {
        countQuery = countQuery.eq('has_gabarito', false);
      } else if (filters.gabaritoStatus !== 'todas') {
        countQuery = countQuery.eq('has_gabarito', true);
      }

      if (filters.ocultarAnuladasErro) {
        countQuery = countQuery.eq('is_anulada', false);
      }`.replace(/\r?\n/g, '\r\n');

if (qService.includes(target2)) {
  qService = qService.replace(target2, replace2);
  console.log('✅ questionService.ts: countQuery atualizada!');
} else {
  console.log('⚠️ target2 não encontrado em questionService.ts');
}

// 1.3 retryQuery
const target3 = `      let retryQuery = supabase.from('questions').select(publicCols);
      if (filters.ocultarAnuladasErro) retryQuery = retryQuery.eq('is_anulada', false);`.replace(/\r?\n/g, '\r\n');

const replace3 = `      let retryQuery = supabase.from('questions').select(publicCols);
      if (filters.gabaritoStatus === 'sem_gabarito') {
        retryQuery = retryQuery.eq('has_gabarito', false);
      } else if (filters.gabaritoStatus !== 'todas') {
        retryQuery = retryQuery.eq('has_gabarito', true);
      }
      if (filters.ocultarAnuladasErro) retryQuery = retryQuery.eq('is_anulada', false);`.replace(/\r?\n/g, '\r\n');

if (qService.includes(target3)) {
  qService = qService.replace(target3, replace3);
  console.log('✅ questionService.ts: retryQuery atualizada!');
} else {
  console.log('⚠️ target3 não encontrado em questionService.ts');
}

fs.writeFileSync('src/services/questionService.ts', qService, 'utf8');

// 2. api/questions/route.ts
let apiRoute = fs.readFileSync('src/app/api/questions/route.ts', 'utf8');

const target4 = `  // Regra de Gabarito: Todas as 132.965 questões presentes por padrão
  if (filters.gabaritoStatus === 'sem_gabarito') {
    query = query.or('correct_answer.is.null,correct_answer.eq.').eq('is_anulada', false);
  } else if (filters.gabaritoStatus === 'com_gabarito') {
    query = query.or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
  }`.replace(/\r?\n/g, '\r\n');

const replace4 = `  // Regra Canônica de Gabarito: Por padrão, alunos só veem questões com gabarito homologado
  if (filters.gabaritoStatus === 'sem_gabarito') {
    query = query.eq('has_gabarito', false);
  } else if (filters.gabaritoStatus === 'todas') {
    // Curadoria/Admin irrestrito
  } else {
    // Padrão do aluno (com_gabarito):
    query = query.eq('has_gabarito', true);
  }`.replace(/\r?\n/g, '\r\n');

if (apiRoute.includes(target4)) {
  apiRoute = apiRoute.replace(target4, replace4);
  console.log('✅ api/questions/route.ts: applyQuestionFilters atualizada!');
} else {
  console.log('⚠️ target4 não encontrado em api/questions/route.ts');
}

fs.writeFileSync('src/app/api/questions/route.ts', apiRoute, 'utf8');

console.log('='.repeat(70));
console.log('🚀 FASE 4 CONCLUÍDA COM SUCESSO!');
console.log('='.repeat(70));

