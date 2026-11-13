import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const db = new DatabaseSync('data/supabase_tables.db', { readOnly: true });

const rows = db.prepare(`
  SELECT 
    COALESCE(NULLIF(TRIM(banca), ''), NULLIF(TRIM(institution), '')) as banca_clean,
    COALESCE(NULLIF(TRIM(institution), ''), NULLIF(TRIM(banca), '')) as institution_clean,
    modalidade,
    count(*) as count
  FROM questions_curated_staging
  WHERE (banca IS NOT NULL AND TRIM(banca) != '') OR (institution IS NOT NULL AND TRIM(institution) != '')
  GROUP BY banca_clean, institution_clean, modalidade
`).all();

function inferUf(sigla, nome) {
  const text = `${sigla} ${nome}`.toUpperCase();

  // 1. Prioridade Nacional
  if (
    text.includes('ENARE') ||
    text.includes('INEP') ||
    text.includes('REVALIDA') ||
    text.includes('TEGO') ||
    text.includes('TECM') ||
    text.includes('EBSERH') ||
    text.includes('NACIONAL') ||
    text.includes('TÍTULO')
  ) {
    if (!text.includes('UFMT REVALIDA') && !text.includes('UEPA REVALIDA') && !text.includes('FMRP-USP')) {
      return 'Nacional';
    }
  }

  // 2. Traço, barra, parênteses ou espaço com UF explícita (ex: SES-PE, PUC-PR, SMS-RJ, UFMT (MT))
  const m = text.match(/[-/(\s](AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)(?=[^A-Z]|$)/);
  if (m) return m[1];

  // 3. Siglas e nomes canônicos de cada estado
  const UF_KEYWORDS = {
    SP: ['USP', 'FUVEST', 'SUS-SP', 'UNICAMP', 'UNIFESP', 'IAMSPE', 'SANTA CASA DE SÃO PAULO', 'EINSTEIN', 'SÍRIO', 'FAMERP', 'FAMEMA', 'UNESP', 'PUC-SP', 'PUC-CAMPINAS', 'FMRP-USP', 'FMABC', 'SANTO AMARO', 'SANTA MARCELINA', 'HIAE', 'SÍRIO-LIBANÊS', 'TAUBATÉ', 'JUNDIAÍ', 'SOROCABA', 'MARÍLIA', 'BOTUCATU', 'RIBEIRÃO PRETO', 'SCMSP', 'FASM', 'SÃO PAULO'],
    RJ: ['UFRJ', 'UERJ', 'UFF', 'UNIRIO', 'SMS-RJ', 'INCA', 'FIOCRUZ', 'HSE-RJ', 'HSE', 'PETRÓPOLIS', 'VASSOURAS', 'VALENÇA', 'REDENTOR', 'SOUZA AGUIAR', 'CER-LEBLON', 'MIGUEL COUTO', 'RIO DE JANEIRO'],
    MG: ['PSU-MG', 'UFMG', 'SANTA CASA BH', 'UFU', 'UFJF', 'UFTM', 'UNIMONTES', 'FCMMG', 'SUPREMA', 'HMD', 'IPSEMG', 'HPS', 'BELO HORIZONTE', 'JUIZ DE FORA', 'UBERLÂNDIA', 'UBERABA', 'MONTES CLAROS', 'MINAS GERAIS'],
    RS: ['AMRIGS', 'HCPA', 'UFRGS', 'UFCSPA', 'PUCRS', 'PUC-RS', 'PELOTAS', 'UFPEL', 'UFSM', 'SANTA MARIA', 'PASSO FUNDO', 'CAXIAS DO SUL', 'RIO GRANDE DO SUL'],
    PR: ['UFPR', 'PUC-PR', 'UEL', 'UEM', 'AMP', 'LONDRINA', 'MARINGÁ', 'CURITIBA', 'PARANÁ', 'CASCAVEL', 'PONTA GROSSA', 'UNIOESTE'],
    SC: ['ACM', 'UFSC', 'UDESC', 'JOINVILLE', 'FLORIANÓPOLIS', 'BLUMENAU', 'SANTA CATARINA', 'UNESC', 'CRICIÚMA'],
    BA: ['SUS-BA', 'UFBA', 'EBMSP', 'BAHIANA', 'SALVADOR', 'UESC', 'UESB', 'FEIRA DE SANTANA', 'ILHÉUS', 'VITÓRIA DA CONQUISTA', 'SANTO ANTÔNIO', 'BAHIA'],
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

  for (const [uf, keywords] of Object.entries(UF_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return uf;
      }
    }
  }

  return 'Nacional';
}

const map = new Map();
for (const r of rows) {
  const sigla = r.banca_clean;
  const nome = r.institution_clean || sigla;
  const mod = r.modalidade || 'Acesso Direto';
  const c = Number(r.count);

  const existing = map.get(sigla) || {
    sigla,
    nome,
    count: 0,
    uf: inferUf(sigla, nome),
    key: sigla,
    modalidades: new Set()
  };

  existing.count += c;
  existing.modalidades.add(mod);
  map.set(sigla, existing);
}

const sorted = Array.from(map.values())
  .map(b => ({
    sigla: b.sigla,
    nome: b.nome,
    count: b.count,
    uf: b.uf,
    key: b.sigla,
    modalidades: Array.from(b.modalidades)
  }))
  .sort((a, b) => b.count - a.count);

console.log('Top 15 bancas categorizadas com precisão:');
sorted.slice(0, 15).forEach(b => console.log(`  [${b.uf}] ${b.sigla}: ${b.count.toLocaleString('pt-BR')} q`));

const code = `// Catálogo Oficial de Bancas e Instituições Consolidadas
// Censo Real extraído diretamente das tabelas do banco
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

fs.writeFileSync('src/data/canonicalBancasDirectory.ts', code, 'utf8');
console.log('Arquivo salvo com sucesso!');
