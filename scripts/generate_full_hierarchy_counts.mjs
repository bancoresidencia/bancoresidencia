import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/)[1];
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/)[1];
const supabase = createClient(url, key);

async function main() {
  console.log('🔄 Iniciando sincronização da hierarquia completa do Supabase via Keyset Pagination...');

  const { count: totalCount, error: countError } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true });

  if (countError || !totalCount) {
    console.error('Erro ao obter total:', countError);
    process.exit(1);
  }

  console.log(`📊 Total de questões a processar: ${totalCount}`);

  const counts = {
    especialidades: {},
    temas: {},
    focos: {},
    subfocos: {}
  };

  const PAGE_SIZE = 1000;
  let lastId = null;
  let processed = 0;
  const startTime = Date.now();

  while (true) {
    let query = supabase
      .from('questions')
      .select('id, especialidade, tema, foco, subfoco')
      .order('id', { ascending: true })
      .limit(PAGE_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('\nErro ao buscar lote:', error);
      // Aguarda 1s e tenta novamente
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const row of data) {
      const esp = row.especialidade;
      if (esp) {
        counts.especialidades[esp] = (counts.especialidades[esp] || 0) + 1;
        if (esp === 'Cirurgia') {
          counts.especialidades['Cirurgia Geral'] = (counts.especialidades['Cirurgia Geral'] || 0) + 1;
        }
      }

      const tem = row.tema;
      if (tem) {
        counts.temas[tem] = (counts.temas[tem] || 0) + 1;
      }

      const foc = row.foco;
      if (foc) {
        counts.focos[foc] = (counts.focos[foc] || 0) + 1;
      }

      const sub = row.subfoco;
      if (sub) {
        counts.subfocos[sub] = (counts.subfocos[sub] || 0) + 1;
      }
    }

    processed += data.length;
    lastId = data[data.length - 1].id;

    const percent = Math.round((processed / totalCount) * 100);
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\rProgresso: ${processed} / ${totalCount} (${percent}%) - ${elapsedSec}s`);

    if (data.length < PAGE_SIZE) {
      break;
    }
  }

  console.log('\n✅ Todos os registros foram processados com sucesso!');

  // Normalização combinada de Ginecologia e Obstetrícia
  counts.especialidades['Ginecologia e Obstetrícia'] =
    (counts.especialidades['Ginecologia'] || 0) + (counts.especialidades['Obstetrícia'] || 0);

  console.log('Especialidades contadas:', counts.especialidades);
  console.log('Total de temas:', Object.keys(counts.temas).length);
  console.log('Total de focos:', Object.keys(counts.focos).length);
  console.log('Total de subfocos:', Object.keys(counts.subfocos).length);

  const fileContent = `export const hierarchyQuestionCounts = ${JSON.stringify(counts, null, 2)};

const normalizeStr = (str: string): string =>
  (str || '')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .trim();

// Mapas auxiliares para busca resiliente (case-insensitive / sem acento)
const normalizedMaps = {
  especialidades: new Map<string, number>(),
  temas: new Map<string, number>(),
  focos: new Map<string, number>(),
  subfocos: new Map<string, number>()
};

for (const [type, map] of Object.entries(hierarchyQuestionCounts)) {
  const normMap = normalizedMaps[type as keyof typeof normalizedMaps];
  if (normMap) {
    for (const [key, count] of Object.entries(map as Record<string, number>)) {
      normMap.set(normalizeStr(key), count);
    }
  }
}

export function getQuestionCount(type: 'especialidades' | 'temas' | 'focos' | 'subfocos', name: string): number {
  if (type === 'especialidades') {
    if (name === 'Cirurgia' || name === 'Cirurgia Geral') {
      return hierarchyQuestionCounts.especialidades['Cirurgia Geral'] || hierarchyQuestionCounts.especialidades['Cirurgia'] || 0;
    }
    if (name === 'Ginecologia e Obstetrícia') {
      return hierarchyQuestionCounts.especialidades['Ginecologia e Obstetrícia'] || 0;
    }
  }

  // 1. Match exato
  const exact = (hierarchyQuestionCounts[type] as Record<string, number>)[name];
  if (exact !== undefined) return exact;

  // 2. Fallback normalizado resiliente (ignora maiúsculas/minúsculas e acentos)
  const normVal = normalizedMaps[type]?.get(normalizeStr(name));
  return normVal || 0;
}
`;

  fs.writeFileSync('src/data/hierarchyCounts.ts', fileContent, 'utf8');
  console.log('🎉 src/data/hierarchyCounts.ts atualizado com 100% dos dados reais do Supabase!');
}

main().catch(console.error);
