import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const tables = [
  { table: 'questions_direto', modalidade: 'Acesso Direto' },
  { table: 'questions_revalida', modalidade: 'Revalida' },
  { table: 'questions_rplus', modalidade: 'R+' },
  { table: 'questions_titulo', modalidade: 'Título de Especialista' }
];

// Mapeamento heurístico de estados a partir de siglas e nomes
const UF_MAP = {
  SP: ['USP', 'SUS-SP', 'UNICAMP', 'UNIFESP', 'IAMSPE', 'SANTA CASA DE SÃO PAULO', 'EINSTEIN', 'SÍRIO', 'FAMERP', 'FAMEMA', 'UNESP', 'PUC-SP', 'PUC-CAMPINAS', 'FMRP-USP', 'FMABC', 'SANTO AMARO', 'SANTA MARCELINA', 'HIAE', 'SÍRIO-LIBANÊS', 'TAUBATÉ', 'JUNDIAÍ', 'SOROCABA', 'MARÍLIA', 'BOTUCATU', 'RIBEIRÃO PRETO'],
  RJ: ['UFRJ', 'UERJ', 'UFF', 'UNIRIO', 'SMS-RJ', 'INCA', 'FIOCRUZ', 'HSE-RJ', 'HSE', 'PETRÓPOLIS', 'VASSOURAS', 'VALENÇA', 'REDENTOR', 'SOUZA AGUIAR', 'CER-LEBLON', 'MIGUEL COUTO', 'RIO DE JANEIRO'],
  MG: ['PSU-MG', 'UFMG', 'SANTA CASA BH', 'UFU', 'UFJF', 'UFTM', 'UNIMONTES', 'FCMMG', 'SUPREMA', 'HMD', 'IPSEMG', 'HPS', 'BELO HORIZONTE', 'JUIZ DE FORA', 'UBERLÂNDIA', 'UBERABA', 'MONTES CLAROS'],
  RS: ['AMRIGS', 'HCPA', 'UFRGS', 'UFCSPA', 'PUCRS', 'PUC-RS', 'PELOTAS', 'UFPEL', 'UFSM', 'SANTA MARIA', 'PASSO FUNDO', 'CAXIAS DO SUL', 'RIO GRANDE DO SUL'],
  PR: ['UFPR', 'PUC-PR', 'UEL', 'UEM', 'AMP', 'LONDRINA', 'MARINGÁ', 'CURITIBA', 'PARANÁ', 'CASCAVEL', 'PONTA GROSSA', 'UNIOESTE'],
  SC: ['ACM', 'UFSC', 'UDESC', 'JOINVILLE', 'FLORIANÓPOLIS', 'BLUMENAU', 'SANTA CATARINA', 'UNESC', 'CRICIÚMA'],
  BA: ['SUS-BA', 'UFBA', 'EBMSP', 'BAHIANA', 'SALVADOR', 'UESC', 'UESB', 'FEIRA DE SANTANA', 'ILHÉUS', 'VITÓRIA DA CONQUISTA', 'SANTO ANTÔNIO'],
  PE: ['SES-PE', 'UPE', 'UFPE', 'RECIFE', 'PERNAMBUCO', 'IMIP', 'HGV-PE', 'HR-PE', 'HAM-PE', 'PETROLINA'],
  CE: ['SURCE', 'UFC', 'CEARÁ', 'FORTALEZA', 'SOBRAL', 'BARBALHA', 'IJF', 'HGF'],
  DF: ['SES-DF', 'UNB', 'HUB', 'BRASÍLIA', 'DISTRITO FEDERAL', 'HFA', 'HRAN', 'HRT', 'HBDF'],
  GO: ['SES-GO', 'UFG', 'GOIÂNIA', 'GOIÁS', 'PUC-GO', 'ANÁPOLIS', 'HUGO', 'HGG'],
  ES: ['UFES', 'EMESCAM', 'ESPÍRITO SANTO', 'VITÓRIA', 'VILA VELHA', 'HUCAM'],
  PA: ['UFPA', 'UEPA', 'PARÁ', 'BELÉM', 'HUJBB'],
  AM: ['UFAM', 'UEA', 'AMAZONAS', 'MANAUS', 'HUGV'],
  PB: ['UFPB', 'UFCG', 'PARAÍBA', 'JOÃO PESSOA', 'CAMPINA GRANDE', 'HULW'],
  RN: ['UFRN', 'RIO GRANDE DO NORTE', 'NATAL', 'MOSSORÓ', 'HUOL'],
  AL: ['UNCISAL', 'UFAL', 'ALAGOAS', 'MACEIÓ', 'SANTA CASA DE MACEIÓ'],
  SE: ['UFS', 'SERGIPE', 'ARACAJU', 'HUSE'],
  PI: ['UFPI', 'PIAUÍ', 'TERESINA', 'HUT'],
  MA: ['UFMA', 'MARANHÃO', 'SÃO LUÍS', 'HUUFMA'],
  MT: ['UFMT', 'MATO GROSSO', 'CUIABÁ', 'HUJM'],
  MS: ['UFMS', 'MATO GROSSO DO SUL', 'CAMPO GRANDE', 'DOURADOS'],
  TO: ['UFT', 'TOCANTINS', 'PALMAS', 'ARAGUAÍNA', 'UNIRG'],
  RO: ['UNIR', 'RONDÔNIA', 'PORTO VELHO'],
  AC: ['UFAC', 'ACRE', 'RIO BRANCO'],
  AP: ['UNIFAP', 'AMAPÁ', 'MACAPÁ'],
  RR: ['UFRR', 'RORAIMA', 'BOA VISTA']
};

function inferUf(name) {
  const upper = name.toUpperCase();
  if (upper.includes('ENARE') || upper.includes('INEP') || upper.includes('NACIONAL') || upper.includes('TEGO') || upper.includes('TECM') || upper.includes('TÍTULO')) {
    return 'Nacional';
  }
  for (const [uf, keywords] of Object.entries(UF_MAP)) {
    for (const kw of keywords) {
      if (upper.includes(kw)) {
        return uf;
      }
    }
  }
  return 'Nacional';
}

async function extractBancas() {
  console.log('Extraindo bancas e instituições do Supabase...');

  const bancasMap = new Map();

  for (const { table, modalidade } of tables) {
    console.log(`Processando ${table}...`);
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    // Buscar lotes de banca/institution com paginação
    while (hasMore && page < 250) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from(table)
        .select('banca, institution')
        .range(from, to);

      if (error || !data || data.length === 0) {
        hasMore = false;
        break;
      }

      for (const row of data) {
        const rawBanca = (row.banca || '').trim();
        const rawInst = (row.institution || '').trim();
        const primary = rawBanca || rawInst;
        if (!primary) continue;

        const current = bancasMap.get(primary) || {
          sigla: primary,
          nome: rawInst && rawInst !== primary ? rawInst : primary,
          count: 0,
          modalidades: new Set(),
          uf: inferUf(primary + ' ' + rawInst)
        };

        current.count++;
        current.modalidades.add(modalidade);
        bancasMap.set(primary, current);
      }

      page++;
      if (data.length < pageSize) hasMore = false;
    }
  }

  console.log(`Total de bancas distintas extraídas: ${bancasMap.size}`);

  const sorted = Array.from(bancasMap.values())
    .map(b => ({
      sigla: b.sigla,
      nome: b.nome,
      count: b.count,
      uf: b.uf,
      key: b.sigla,
      modalidades: Array.from(b.modalidades)
    }))
    .sort((a, b) => b.count - a.count);

  console.log(`Top 10 bancas mais frequentes:`);
  sorted.slice(0, 10).forEach(b => console.log(`  - [${b.uf}] ${b.sigla}: ${b.count} questões`));

  const outputContent = `// Catálogo Oficial e Consolidado de Bancas e Instituições
// Gerado automaticamente a partir das 257.111 questões do Supabase
export interface CanonicalBancaItem {
  sigla: string;
  nome: string;
  count: number;
  uf: string;
  key: string;
  modalidades: string[];
}

export const CANONICAL_BANCAS_DIRECTORY: CanonicalBancaItem[] = ${JSON.stringify(sorted, null, 2)};
`;

  fs.writeFileSync('src/data/canonicalBancasDirectory.ts', outputContent, 'utf8');
  console.log('Arquivo salvo com sucesso: src/data/canonicalBancasDirectory.ts');
}

extractBancas().catch(console.error);

