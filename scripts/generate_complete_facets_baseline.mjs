import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Carrega .env.local
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function extractAllCounts(viewName) {
  console.log(`\n================================================================`);
  console.log(`Extraindo Especialidades, Temas, Focos e Subfocos de [${viewName}]...`);
  console.log(`================================================================`);

  const especialidades = {};
  const temas = {};
  const focos = {};
  const subfocos = {};
  let totalRows = 0;

  let from = 0;
  const batchSize = 1000;
  let hasMore = true;
  const t0 = Date.now();

  while (hasMore) {
    const { data, error } = await supabase
      .from(viewName)
      .select('especialidade, tema, foco, subfoco')
      .range(from, from + batchSize - 1);

    if (error) {
      console.error(`Erro ao paginar ${viewName}:`, error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of data) {
      totalRows++;
      const esp = row.especialidade;
      const tem = row.tema;
      const foc = row.foco;
      const sub = row.subfoco;

      if (esp && typeof esp === 'string' && esp.trim()) {
        especialidades[esp] = (especialidades[esp] || 0) + 1;
      }
      if (tem && typeof tem === 'string' && tem.trim()) {
        temas[tem] = (temas[tem] || 0) + 1;
      }
      if (foc && typeof foc === 'string' && foc.trim()) {
        focos[foc] = (focos[foc] || 0) + 1;
      }
      if (sub && typeof sub === 'string' && sub.trim() && sub.trim() !== 'Geral') {
        subfocos[sub] = (subfocos[sub] || 0) + 1;
      }
    }

    from += batchSize;
    if (data.length < batchSize) {
      hasMore = false;
    }
    if (totalRows % 25000 === 0) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  Processadas ${totalRows} linhas em ${elapsed}s...`);
    }
  }

  // Normalização das 5 Grandes Áreas Agregadas para Especialidades
  if (especialidades['Cirurgia'] || especialidades['Cirurgia Geral']) {
    const cirurgiaSum = (especialidades['Cirurgia Geral'] || 0) + (especialidades['Cirurgia'] || 0);
    especialidades['Cirurgia Geral'] = cirurgiaSum;
    especialidades['Cirurgia'] = cirurgiaSum;
  }
  if (especialidades['Medicina Preventiva'] || especialidades['Medicina Preventiva e Social']) {
    const prevSum = (especialidades['Medicina Preventiva e Social'] || 0) + (especialidades['Medicina Preventiva'] || 0);
    especialidades['Medicina Preventiva e Social'] = prevSum;
    especialidades['Medicina Preventiva'] = prevSum;
  }
  if (especialidades['Ginecologia'] || especialidades['Obstetrícia'] || especialidades['Ginecologia e Obstetrícia']) {
    const goSum = (especialidades['Ginecologia'] || 0) + (especialidades['Obstetrícia'] || 0) + (especialidades['Ginecologia e Obstetrícia'] || 0);
    especialidades['Ginecologia e Obstetrícia'] = goSum;
  }

  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`-> Finalizado ${viewName}: ${totalRows} questões em ${durationSec}s`);
  console.log(`   Especialidades: ${Object.keys(especialidades).length}`);
  console.log(`   Temas: ${Object.keys(temas).length}`);
  console.log(`   Focos: ${Object.keys(focos).length}`);
  console.log(`   Subfocos: ${Object.keys(subfocos).length}`);

  return {
    total: totalRows,
    especialidades,
    temas,
    focos,
    subfocos
  };
}

async function main() {
  console.log('Iniciando extração do catálogo completo de facetas homologadas...');
  
  // 1. Extrai Revalida
  const revalidaData = await extractAllCounts('view_questions_revalida');

  // 2. Extrai Acesso Direto
  const diretoData = await extractAllCounts('view_questions_acesso_direto');

  // 3. Monta o arquivo TypeScript canônico
  const tsContent = `// Arquivo canônico gerado a partir de view_questions_acesso_direto (173.526 Q) e view_questions_revalida (5.499 Q)
// Exclui estritamente as questões em quarentena (subfoco = 'Geral' ou nulo)

export interface HomologatedBaseline {
  total: number;
  especialidades: Record<string, number>;
  temas: Record<string, number>;
  focos: Record<string, number>;
  subfocos: Record<string, number>;
}

export const homologatedDiretoBaseline: HomologatedBaseline = ${JSON.stringify(diretoData, null, 2)};

export const homologatedRevalidaBaseline: HomologatedBaseline = ${JSON.stringify(revalidaData, null, 2)};
`;

  fs.writeFileSync('src/data/homologatedFacetsBaseline.ts', tsContent, 'utf-8');
  console.log('\n✅ [SUCESSO] src/data/homologatedFacetsBaseline.ts gerado com todas as Especialidades, Temas, Focos e Subfocos!');
}

main().catch(console.error);
