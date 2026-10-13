import fs from 'fs';
import path from 'path';

// Carrega variáveis Supabase
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSupabase() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { error: 'Sem credenciais Supabase' };
  }
  try {
    // Total questions
    const resCount = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=count`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range-Unit': 'items',
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    const contentRange = resCount.headers.get('content-range');
    const totalCount = contentRange ? contentRange.split('/')[1] : null;

    // Questions with correct_answer not null and not empty
    const resWithAnswer = await fetch(`${SUPABASE_URL}/rest/v1/questions?correct_answer=not.is.null&correct_answer=neq.&select=count`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range-Unit': 'items',
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    const rangeWithAnswer = resWithAnswer.headers.get('content-range');
    const totalWithAnswer = rangeWithAnswer ? rangeWithAnswer.split('/')[1] : null;

    // Sample/Specialty breakdown
    const resSample = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=specialty,institution,year,banca,source&limit=5000`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const sample = await resSample.json();

    return { totalCount, totalWithAnswer, sampleLength: sample.length, sample: sample.slice(0, 5) };
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  console.log('=== AUDITORIA DE FONTES E GABARITOS ===\n');

  // 1. gabarito_das_questoes_manifest.json
  const gabPath = './data/gabarito_das_questoes_manifest.json';
  if (fs.existsSync(gabPath)) {
    const gab = JSON.parse(fs.readFileSync(gabPath, 'utf8'));
    console.log(`[1] MANIFESTO: gabarito_das_questoes_manifest.json`);
    console.log(`    Título: ${gab.title}`);
    console.log(`    Total Livros: ${gab.totalBooks}`);
    console.log(`    Total Questões Mapeadas: ${gab.totalUniqueQuestions}`);
    console.log('    Por Especialidade:');
    gab.specialties.forEach(s => {
      console.log(`     • ${s.specialty.padEnd(25)}: ${String(s.booksCount).padStart(3)} livros | ${s.books.reduce((acc, b) => acc + (b.totalQuestions || 0), 0)} questões`);
    });
    console.log('');
  }

  // 2. medcurso_extracao_manifest.json
  const medPath = './data/medcurso_extracao_manifest.json';
  if (fs.existsSync(medPath)) {
    const med = JSON.parse(fs.readFileSync(medPath, 'utf8'));
    console.log(`[2] MANIFESTO: medcurso_extracao_manifest.json`);
    console.log(`    Título: ${med.title}`);
    console.log(`    Total Arquivos/Temas: ${med.totalFiles}`);
    console.log(`    Total Questões Extraídas: ${med.totalUniqueQuestions}`);
    console.log(`    Novas para Plataforma: ${med.novasParaPlataforma}`);
    console.log('    Por Especialidade:');
    med.specialties.forEach(s => {
      console.log(`     • ${s.specialty.padEnd(25)}: ${String(s.filesCount).padStart(3)} temas | ${String(s.totalQuestions).padStart(4)} questões`);
    });
    console.log('');
  }

  // 3. Supabase Database Status
  console.log('[3] BANCO DE DADOS SUPABASE (Tabela questions):');
  const supa = await checkSupabase();
  console.log(JSON.stringify(supa, null, 2));
}

main().catch(console.error);
