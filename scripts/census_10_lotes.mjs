import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const LOTE_DEFINITIONS = [
  { id: 1, name: 'ABEM — TPN 2024/2025/2026', filter: q => q.ilike('institution', '%ABEM%') },
  { id: 2, name: 'SES-GO — Instituto Verbena / UFG 2026', filter: q => q.ilike('institution', '%SES-GO%') },
  { id: 3, name: 'UNIP — Univ. Paulista 2026', filter: q => q.ilike('institution', '%UNIP%').eq('year', 2026) },
  { id: 4, name: 'USCS / FAUSCS 2025/2026', filter: q => q.ilike('institution', '%São Caetano%') },
  { id: 5, name: 'Rede Américas / HOA / Jayme Neves / SC Maceió', filter: q => q.or('institution.ilike.%Américas%,institution.ilike.%Oftalmológico do Acre%,institution.ilike.%Jayme%,institution.ilike.%Maceió%') },
  { id: 6, name: 'São Leopoldo Mandic & Araras', filter: q => q.ilike('institution', '%Mandic%') },
  { id: 7, name: 'HSL Brasília / CEPOA / HMMSJP / FBHC / UERN', filter: q => q.or('institution.ilike.%Sírio-Libanês%,institution.ilike.%CEPOA%,institution.ilike.%Pinhais%,institution.ilike.%Beneficência%,institution.ilike.%Rio Grande do Norte%') },
  { id: 8, name: 'Resíduos R3 Grandes Bancas (UNICAMP, UERJ, SURCE, PSU-MG)', filter: q => q.or('banca.ilike.%UNICAMP%,banca.ilike.%UERJ%,banca.ilike.%SURCE%,banca.ilike.%PSU-MG%,banca.ilike.%AREMG%') },
  { id: 9, name: 'Redes Hospitalares & Santas Casas', filter: q => q.or('institution.ilike.%Santa Casa%,institution.ilike.%Samaritano%,institution.ilike.%Adventista%,institution.ilike.%Mário Gatti%') },
  { id: 10, name: 'Concursos Federais & Históricos Remanescentes', filter: q => q.or('institution.ilike.%Federal%,institution.ilike.%Macaé%,institution.ilike.%Evangélica%,institution.ilike.%UNITPAC%,institution.ilike.%Tocantins%') }
];

async function census() {
  console.log('=== CENSO DOS 10 LOTES DE QUESTÕES PENDENTES ===\n');
  let totalPendingLotes = 0;

  for (const lote of LOTE_DEFINITIONS) {
    let q = supabase.from('questions')
      .select('id', { count: 'exact', head: true })
      .or('correct_answer.is.null,correct_answer.eq.');

    q = lote.filter(q);
    const { count, error } = await q;
    if (error) {
      console.error(`Erro no Lote ${lote.id}:`, error.message);
    } else {
      console.log(`Lote ${String(lote.id).padStart(2)}: ${String(count).padStart(5)} pendentes | ${lote.name}`);
      totalPendingLotes += (count || 0);
    }
  }

  // Total geral pendente na tabela questions
  const { count: totalQuestionsPending } = await supabase.from('questions')
    .select('id', { count: 'exact', head: true })
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`\nTotal somado nos 10 Lotes: ${totalPendingLotes}`);
  console.log(`Total geral pendente em 'questions': ${totalQuestionsPending}`);
}

census();
