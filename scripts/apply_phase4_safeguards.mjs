import fs from 'fs';

console.log('='.repeat(70));
console.log('🛡️ APLICANDO FASE 4: BLINDAGEM DA CAMADA DE CONSULTA (FRONT-END & API)');
console.log('='.repeat(70));

// 1. Atualiza src/types/index.ts
let typesContent = fs.readFileSync('src/types/index.ts', 'utf8');
if (!typesContent.includes('has_gabarito?: boolean;')) {
  typesContent = typesContent.replace(
    'isAnulada: boolean;',
    'isAnulada: boolean;\n  hasGabarito?: boolean;\n  has_gabarito?: boolean;'
  );
  fs.writeFileSync('src/types/index.ts', typesContent, 'utf8');
  console.log('✅ src/types/index.ts atualizado com hasGabarito e has_gabarito.');
} else {
  console.log('ℹ️ src/types/index.ts já continha has_gabarito.');
}

// 2. Atualiza src/services/questionService.ts
let qService = fs.readFileSync('src/services/questionService.ts', 'utf8');

// 2.1 SAFE_QUESTION_COLUMNS
if (!qService.includes('images, has_gabarito')) {
  qService = qService.replace(
    "options, images'",
    "options, images, has_gabarito'"
  );
  console.log('✅ questionService.ts: SAFE_QUESTION_COLUMNS atualizada com has_gabarito.');
}

// 2.2 QuestionDbRow
if (!qService.includes('has_gabarito?: boolean;')) {
  qService = qService.replace(
    'is_anulada?: boolean;',
    'is_anulada?: boolean;\n  has_gabarito?: boolean;'
  );
  console.log('✅ questionService.ts: QuestionDbRow atualizada com has_gabarito.');
}

// 2.3 mapRowToQuestion
if (!qService.includes('hasGabarito: row.has_gabarito')) {
  qService = qService.replace(
    'isAnulada: row.is_anulada ?? false,',
    'isAnulada: row.is_anulada ?? false,\n    hasGabarito: row.has_gabarito ?? true,\n    has_gabarito: row.has_gabarito ?? true,'
  );
  console.log('✅ questionService.ts: mapRowToQuestion mapeando has_gabarito.');
}

// 2.4 buildQuestionQuery (busca pública do aluno)
const oldRule = `  // Regra de Gabarito: Todas as 132.965 questões presentes por padrão
  if (filters.ocultarAnuladasErro) {
    query = query.eq('is_anulada', false);
  }`;

const newRule = `  // Regra Canônica de Gabarito: Alunos só visualizam questões com gabarito homologado (A-E ou Anuladas)
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
  }`;

if (qService.includes(oldRule)) {
  qService = qService.replace(oldRule, newRule);
  console.log('✅ questionService.ts: buildQuestionQuery aplicando has_gabarito = true.');
}

// 2.5 retryQuery fallback
const oldRetry = `      const publicCols = 'id,code,institution,banca,year,tipo_prova,modalidade,especialidade,tema,foco,subfoco,difficulty,type,is_anulada,statement,options,images';
      let retryQuery = supabase.from('questions').select(publicCols);
      if (filters.ocultarAnuladasErro) retryQuery = retryQuery.eq('is_anulada', false);`;

const newRetry = `      const publicCols = 'id,code,institution,banca,year,tipo_prova,modalidade,especialidade,tema,foco,subfoco,difficulty,type,is_anulada,statement,options,images,has_gabarito';
      let retryQuery = supabase.from('questions').select(publicCols);
      if (filters.gabaritoStatus === 'sem_gabarito') {
        retryQuery = retryQuery.eq('has_gabarito', false);
      } else if (filters.gabaritoStatus !== 'todas') {
        retryQuery = retryQuery.eq('has_gabarito', true);
      }
      if (filters.ocultarAnuladasErro) retryQuery = retryQuery.eq('is_anulada', false);`;

if (qService.includes(oldRetry)) {
  qService = qService.replace(oldRetry, newRetry);
  console.log('✅ questionService.ts: retryQuery aplicando has_gabarito = true.');
}

// 2.6 countQuery
const oldCount = `      let countQuery = supabase
        .from('questions')
        .select('id', { count: 'exact', head: true });

      if (filters.ocultarAnuladasErro) {
        countQuery = countQuery.eq('is_anulada', false);
      }`;

const newCount = `      let countQuery = supabase
        .from('questions')
        .select('id', { count: 'exact', head: true });

      if (filters.gabaritoStatus === 'sem_gabarito') {
        countQuery = countQuery.eq('has_gabarito', false);
      } else if (filters.gabaritoStatus !== 'todas') {
        countQuery = countQuery.eq('has_gabarito', true);
      }

      if (filters.ocultarAnuladasErro) {
        countQuery = countQuery.eq('is_anulada', false);
      }`;

if (qService.includes(oldCount)) {
  qService = qService.replace(oldCount, newCount);
  console.log('✅ questionService.ts: countQuery aplicando has_gabarito = true.');
}

// 2.7 fetchAdminCurationStats
qService = qService.replaceAll(
  ".or('correct_answer.in.(A,B,C,D,E),is_anulada.eq.true')",
  ".eq('has_gabarito', true)"
);
console.log('✅ questionService.ts: fetchAdminCurationStats otimizada com has_gabarito.');

fs.writeFileSync('src/services/questionService.ts', qService, 'utf8');

// 3. Atualiza src/app/api/questions/route.ts
let apiRoute = fs.readFileSync('src/app/api/questions/route.ts', 'utf8');

if (!apiRoute.includes('images, has_gabarito')) {
  apiRoute = apiRoute.replace(
    "options, images'",
    "options, images, has_gabarito'"
  );
  console.log('✅ api/questions/route.ts: SAFE_QUESTION_COLUMNS atualizada.');
}

if (!apiRoute.includes('has_gabarito?: boolean;')) {
  apiRoute = apiRoute.replace(
    'is_anulada?: boolean;',
    'is_anulada?: boolean;\n  has_gabarito?: boolean;'
  );
  console.log('✅ api/questions/route.ts: QuestionDbRow atualizada.');
}

if (!apiRoute.includes('hasGabarito: row.has_gabarito')) {
  apiRoute = apiRoute.replace(
    'isAnulada: row.is_anulada ?? false,',
    'isAnulada: row.is_anulada ?? false,\n    hasGabarito: row.has_gabarito ?? true,\n    has_gabarito: row.has_gabarito ?? true,'
  );
  console.log('✅ api/questions/route.ts: mapRowToQuestion mapeando has_gabarito.');
}

const oldApiRule = `  // Regra de Gabarito: Todas as 132.965 questões presentes por padrão
  if (filters.gabaritoStatus === 'sem_gabarito') {
    query = query.or('correct_answer.is.null,correct_answer.eq.').eq('is_anulada', false);
  } else if (filters.gabaritoStatus === 'com_gabarito') {
    query = query.or('correct_answer.in.(A,B,C,D,E,ANULADA),is_anulada.eq.true');
  }`;

const newApiRule = `  // Regra Canônica de Gabarito: Por padrão, alunos só veem questões com gabarito homologado
  if (filters.gabaritoStatus === 'sem_gabarito') {
    query = query.eq('has_gabarito', false);
  } else if (filters.gabaritoStatus === 'todas') {
    // Curadoria/Admin irrestrito
  } else {
    // Padrão do aluno (com_gabarito):
    query = query.eq('has_gabarito', true);
  }`;

if (apiRoute.includes(oldApiRule)) {
  apiRoute = apiRoute.replace(oldApiRule, newApiRule);
  console.log('✅ api/questions/route.ts: applyQuestionFilters aplicando has_gabarito = true.');
}

fs.writeFileSync('src/app/api/questions/route.ts', apiRoute, 'utf8');

console.log('='.repeat(70));
console.log('🚀 FASE 4 APLICADA COM SUCESSO!');
console.log('='.repeat(70));

