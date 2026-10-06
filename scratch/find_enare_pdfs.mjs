
// Script para descobrir URLs diretas dos PDFs de provas e gabaritos do ENARE
// Tenta várias combinações de URLs baseadas nos padrões já encontrados

const YEARS = ['2021-2022', '2022-2023', '2023-2024', '2024-2025'];
const AREAS = ['area-medica', 'area-multiprofissional'];

// Padrões de nomenclatura dos cadernos (baseados em crawl anterior)
const CADERNOS = {
  '2021-2022': {
    gabarito: [
      '10-01-2022-gabarito-pos-recursos.pdf',
      '12-12-2021-gabarito-preliminar.pdf',
    ],
    prova: [
      'caderno-de-questoes.pdf',
      'prova.pdf',
      'caderno-questoes.pdf'
    ]
  },
  '2022-2023': {
    gabarito: [
      'gabarito-definitivo.pdf',
      'gabarito-pos-recursos.pdf',
      '2022-gabarito-definitivo.pdf',
    ],
    prova: [
      'caderno-de-questoes.pdf',
      'prova.pdf',
    ]
  }
};

// Base URLs dos dois domínios
const BASES = [
  'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores',
  'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores',
];

async function tryDownload(url) {
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });
    return { status: resp.status, size: resp.headers.get('content-length'), type: resp.headers.get('content-type') };
  } catch(e) {
    return { status: 'error', error: e.message };
  }
}

const results = {};

// Testar URLs com padrões conhecidos
const testUrls = [
  // 2021 - os que já sabemos que funcionaram
  { year: '2021', tipo: 'prova', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022/area-medica/caderno-de-questoes-area-medica.pdf' },
  { year: '2021', tipo: 'gabarito', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022/area-medica/10-01-2022-gabarito-pos-recursos.pdf' },
  // 2022
  { year: '2022', tipo: 'prova', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/area-medica/caderno-de-questoes-area-medica.pdf' },
  { year: '2022', tipo: 'gabarito', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/area-medica/gabarito-definitivo.pdf' },
  { year: '2022', tipo: 'gabarito', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/area-medica/gabarito-pos-recursos.pdf' },
  // 2023
  { year: '2023', tipo: 'prova', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/area-medica/caderno-de-questoes-area-medica.pdf' },
  { year: '2023', tipo: 'gabarito', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/area-medica/gabarito-definitivo.pdf' },
  // Alternativas com ebserh
  { year: '2022', tipo: 'prova', url: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/area-medica/caderno-de-questoes-area-medica.pdf' },
  { year: '2022', tipo: 'gabarito', url: 'https://www.gov.br/ebserh/pt-br/hospitais-universitarios/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/area-medica/gabarito-definitivo.pdf' },
  // FGV 2024/2025
  { year: '2024', tipo: 'prova', url: 'https://conhecimento.fgv.br/concursos/enare24/arquivos/enare_2024_prova_medica.pdf' },
  { year: '2024', tipo: 'gabarito', url: 'https://conhecimento.fgv.br/concursos/enare24/arquivos/gabarito_definitivo_medica.pdf' },
];

console.log('Testando URLs de PDFs do ENARE...\n');
for (const item of testUrls) {
  const result = await tryDownload(item.url);
  console.log(`[${item.year}] ${item.tipo}: ${result.status} | ${result.type || ''} | size=${result.size || '?'}`);
  console.log(`  URL: ${item.url}`);
  if (!results[item.year]) results[item.year] = [];
  if (result.status === 200) {
    results[item.year].push({ ...item, result });
    console.log('  ✅ FUNCIONOU!');
  }
  console.log();
}

import { writeFileSync } from 'fs';
writeFileSync('/d/bancoresidencia/data/enare_pdf_links.json', JSON.stringify(results, null, 2));
console.log('\nResultados salvos em enare_pdf_links.json');
console.log('Links que funcionaram:', Object.values(results).flat().length);
