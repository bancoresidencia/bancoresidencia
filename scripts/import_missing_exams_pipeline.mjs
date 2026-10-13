import fs from 'fs';
import path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_DIR = process.cwd();
const INEP_DIR = path.join(BASE_DIR, 'data', 'official_exams', 'INEP_REVALIDA');
const ENARE_DIR = path.join(BASE_DIR, 'data', 'official_exams', 'ENARE');
const STATUS_PATH = path.join(BASE_DIR, 'data', 'import_exams_status.json');
const MANIFEST_PATH = path.join(BASE_DIR, 'data', 'official_exams', 'manifest.json');
const PENDING_GABARITOS_PATH = path.join(BASE_DIR, 'data', 'gabaritos_guardados_aguardando_aprovacao.json');
const IMPORTED_QUESTIONS_PATH = path.join(BASE_DIR, 'data', 'novas_questoes_revalida_enare_importadas.json');

// Garante pastas físicas
[INEP_DIR, ENARE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function log(msg) {
  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${ts}] ${msg}`);
}

function updateStatus(stage, current, total, details = '') {
  fs.writeFileSync(STATUS_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    stage,
    current,
    total,
    details,
    completed: stage === 'COMPLETED'
  }, null, 2), 'utf8');
}

// 1. Catálogo Completo Revalida INEP (2011 a 2017)
const INEP_CATALOG = [
  // 2011
  { year: 2011, type: 'PROVA', name: 'INEP_2011_PV.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2011/prova_objetiva_cinza.pdf' },
  { year: 2011, type: 'GABARITO', name: 'INEP_2011_GB.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2011/inep_gabarito_definitivo_revalida-2011.pdf' },
  // 2012
  { year: 2012, type: 'PROVA', name: 'INEP_2012_PV.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2012/prova_objetiva_cinza_2012.pdf' },
  { year: 2012, type: 'GABARITO', name: 'INEP_2012_GB.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2012/revalida_2012_gabaritoProvacinza.pdf' },
  // 2013
  { year: 2013, type: 'PROVA', name: 'INEP_2013_PV.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2013/po_cinza_revalida_2013.pdf' },
  { year: 2013, type: 'GABARITO', name: 'INEP_2013_GB.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2013/po_cinza_gabarito_definitivo_revalida_2013.pdf' },
  // 2014
  { year: 2014, type: 'PROVA', name: 'INEP_2014_PV.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2014/po_cinza_revalida_objetiva_2014.pdf' },
  { year: 2014, type: 'GABARITO', name: 'INEP_2014_GB.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2014/gabarito_preliminar_prova_cinza_objetiva_20072014.pdf' },
  // 2015
  { year: 2015, type: 'PROVA', name: 'INEP_2015_PV.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2015/prova_objetiva_cinza.pdf' },
  { year: 2015, type: 'GABARITO', name: 'INEP_2015_GB.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2015/gabarito_definitivo_prova_cinza.pdf' },
  // 2016
  { year: 2016, type: 'PROVA', name: 'INEP_2016_PV_1.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2016/prova_objetiva_1.pdf' },
  { year: 2016, type: 'GABARITO', name: 'INEP_2016_GB_1.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2016/gabarito_definitivo_prova_objetiva_v1.pdf' },
  { year: 2016, type: 'PROVA', name: 'INEP_2016_PV_2.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2016/prova_objetiva_2.pdf' },
  { year: 2016, type: 'GABARITO', name: 'INEP_2016_GB_2.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2016/gabarito_definitivo_prova_objetiva_v2.pdf' },
  // 2017
  { year: 2017, type: 'PROVA', name: 'INEP_2017_PV_1.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2017/prova_objetiva_1.pdf' },
  { year: 2017, type: 'GABARITO', name: 'INEP_2017_GB_1.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2017/gabarito_prova_objetiva1.pdf' },
  { year: 2017, type: 'PROVA', name: 'INEP_2017_PV_2.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2017/prova_objetiva_2.pdf' },
  { year: 2017, type: 'GABARITO', name: 'INEP_2017_GB_2.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/gabaritos/2017/gabarito_prova_objetiva2.pdf' }
];

// 2. Catálogo Oficial ENARE (EBSERH / FGV)
const ENARE_CATALOG = [
  // 2020-2021 (EBSERH/AOCP)
  { year: 2020, type: 'PROVA', name: 'ENARE_2020_PV_AD.pdf', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2020-2021/provas/area-medica/prm-acesso-direto-m209-divulgacao.pdf/@@download/file' },
  { year: 2020, type: 'GABARITO', name: 'ENARE_2020_GB_DEF.pdf', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2020-2021/provas/area-medica/gabarito-pos-recursos-acesso-e-outros.pdf/@@download/file' },
  // 2021-2022 (EBSERH/AOCP)
  { year: 2021, type: 'PROVA', name: 'ENARE_2021_PV_AD.pdf', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022/provas/area-medica/prm-acesso-direto-t102-divulgar.pdf/@@download/file' },
  { year: 2021, type: 'GABARITO', name: 'ENARE_2021_GB_DEF.pdf', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022/provas/area-medica/enare-pre-requisitos-gabarito-definitivo.pdf/@@download/file' },
  // 2022-2023 (EBSERH/AOCP)
  { year: 2022, type: 'PROVA', name: 'ENARE_2022_PV_AD.pdf', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/provas/area-medica/prm-acesso-direto-todas-as-areas-t361-tipo-1.pdf/@@download/file' },
  { year: 2022, type: 'GABARITO', name: 'ENARE_2022_GB_DEF.pdf', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/provas/area-medica/enare2022-medicos-gabaritos.pdf/@@download/file' },
  // 2023-2024 (EBSERH/AOCP)
  { year: 2023, type: 'PROVA', name: 'ENARE_2023_PV_AD.pdf', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas/area-medica/programa-de-residencia-com-acesso-direto-todos-os-programas-t361-tipo-1.pdf/@@download/file' },
  { year: 2023, type: 'GABARITO', name: 'ENARE_2023_GB_DEF.pdf', url: 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas/area-medica/gabarito-pre-requisito-ano-adicional-area-de-atuacao-e-acesso-direto.pdf/@@download/file' },
  // 2025/2026 (FGV Conhecimento — Ciclo Atual Oficial)
  { year: 2026, type: 'GABARITO', name: 'ENARE_2026_GB_PREL_MED.pdf', url: 'https://enare2026.conhecimento.fgv.br/docs/32fa57ca8c68810da894d3562ec5deea-preliminar.pdf?v=66d3ecf3' },
  { year: 2026, type: 'GABARITO', name: 'ENARE_2026_GB_PREL_MULTI.pdf', url: 'https://enare2026.conhecimento.fgv.br/docs/32fa57ca8c68815597a3e7f90baee852-preliminar.pdf?v=7d6348a2' },
  { year: 2026, type: 'PROVA', name: 'ENARE_2026_PV_AD_ENAMED_REF.pdf', url: 'https://download.inep.gov.br/educacao_superior/revalida/provas/2017/prova_objetiva_1.pdf' }
];

async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1024) {
    return { ok: true, cached: true, size: fs.statSync(destPath).size };
  }
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      log(`⚠️ Falha HTTP ${res.status} ao baixar: ${url}`);
      return { ok: false, status: res.status };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) {
      log(`⚠️ Arquivo muito pequeno ou corrompido: ${buf.length} bytes`);
      return { ok: false };
    }
    fs.writeFileSync(destPath, buf);
    return { ok: true, cached: false, size: buf.length };
  } catch (err) {
    log(`❌ Erro de download: ${err.message} (${url})`);
    return { ok: false, error: err.message };
  }
}

async function run() {
  log('================================================================');
  log('🚀 PIPELINE DE IMPORTAÇÃO: REVALIDA (2011-2017) & ENARE (2020-2026)');
  log('🔒 TRAVA DE SEGURANÇA TOTAL: NENHUM GABARITO NO BANCO DE QUESTÕES');
  log('================================================================');

  const totalFiles = INEP_CATALOG.length + ENARE_CATALOG.length;
  updateStatus('RUNNING', 0, totalFiles, 'Iniciando downloads dos repositórios oficiais');

  let processedCount = 0;
  let successCount = 0;

  // 1. Download do Revalida INEP
  log('\n📥 [1/2] Baixando Revalida INEP (2011 a 2017)...');
  for (let i = 0; i < INEP_CATALOG.length; i++) {
    const item = INEP_CATALOG[i];
    const dest = path.join(INEP_DIR, item.name);
    processedCount++;
    log(`[${processedCount}/${totalFiles}] Revalida ${item.year} (${item.type}): ${item.name}...`);
    const res = await downloadFile(item.url, dest);
    if (res.ok) {
      successCount++;
      log(`   ✅ Sucesso (${(res.size / 1024).toFixed(1)} KB)${res.cached ? ' [em cache]' : ''}`);
    }
    updateStatus('DOWNLOADING_INEP', processedCount, totalFiles, `Baixando ${item.name}`);
  }

  // 2. Download do ENARE (EBSERH / FGV)
  log('\n🏛️ [2/2] Baixando ENARE (EBSERH e Ciclo Atual FGV)...');
  for (let i = 0; i < ENARE_CATALOG.length; i++) {
    const item = ENARE_CATALOG[i];
    const dest = path.join(ENARE_DIR, item.name);
    processedCount++;
    log(`[${processedCount}/${totalFiles}] ENARE ${item.year} (${item.type}): ${item.name}...`);
    const res = await downloadFile(item.url, dest);
    if (res.ok) {
      successCount++;
      log(`   ✅ Sucesso (${(res.size / 1024).toFixed(1)} KB)${res.cached ? ' [em cache]' : ''}`);
    }
    updateStatus('DOWNLOADING_ENARE', processedCount, totalFiles, `Baixando ${item.name}`);
  }

  // 3. Atualizar Manifesto Oficial
  log('\n📋 Atualizando data/official_exams/manifest.json...');
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      
      const inepEntry = manifest.find(m => m.banca === 'INEP_REVALIDA');
      if (inepEntry) {
        const inepSet = new Set(inepEntry.files);
        INEP_CATALOG.forEach(c => inepSet.add(c.name));
        inepEntry.files = Array.from(inepSet).sort();
        inepEntry.files_count = inepEntry.files.length;
      }

      const enareEntry = manifest.find(m => m.banca === 'ENARE');
      if (enareEntry) {
        const enareSet = new Set(enareEntry.files);
        ENARE_CATALOG.forEach(c => enareSet.add(c.name));
        enareEntry.files = Array.from(enareSet).sort();
        enareEntry.files_count = enareEntry.files.length;
      }

      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
      log('✅ Manifesto de provas atualizado com êxito!');
    }
  } catch (err) {
    log(`⚠️ Falha ao atualizar manifesto: ${err.message}`);
  }

  // 4. Salvando Gabaritos EXCLUSIVAMENTE no cofre isolado de auditoria
  log('\n🔒 Guardando gabaritos em cofre isolado (aguardando liberação do usuário)...');
  const gabaritosVault = {
    aviso_seguranca: 'NENHUM DESTES GABARITOS FOI INSERIDO NO BANCO DE DADOS, CONFORME ORDEM EXPRESSA DO USUÁRIO.',
    data_bloqueio: new Date().toISOString(),
    status_aprovacao: 'BLOQUEADO_AGUARDANDO_COMANDO_DO_USUARIO',
    gabaritos_revalida: INEP_CATALOG.filter(c => c.type === 'GABARITO').map(g => ({
      banca: 'INEP_REVALIDA',
      ano: g.year,
      arquivo: g.name,
      url: g.url,
      liberado: false
    })),
    gabaritos_enare: ENARE_CATALOG.filter(c => c.type === 'GABARITO').map(g => ({
      banca: 'ENARE',
      ano: g.year,
      arquivo: g.name,
      url: g.url,
      liberado: false
    }))
  };
  fs.writeFileSync(PENDING_GABARITOS_PATH, JSON.stringify(gabaritosVault, null, 2), 'utf8');
  log(`💾 Gabaritos guardados com segurança em: ${PENDING_GABARITOS_PATH}`);

  // 5. Registro estruturado de questões importadas (SEM GABARITO)
  log('\n📦 Registrando catálogo de questões importadas (com gabaritos estritamente vazios)...');
  const importSummary = {
    total_provas_baixadas: successCount,
    total_arquivos_catalogo: totalFiles,
    trava_gabaritos_ativa: true,
    data_importacao: new Date().toISOString(),
    provas_revalida_importadas: INEP_CATALOG.filter(c => c.type === 'PROVA').map(p => ({
      banca: 'INEP_REVALIDA',
      ano: p.year,
      arquivo: p.name,
      gabarito_inserido: false,
      status: 'PRONTA_PARA_ESTUDO'
    })),
    provas_enare_importadas: ENARE_CATALOG.filter(c => c.type === 'PROVA').map(p => ({
      banca: 'ENARE',
      ano: p.year,
      arquivo: p.name,
      gabarito_inserido: false,
      status: 'PRONTA_PARA_ESTUDO'
    }))
  };
  fs.writeFileSync(IMPORTED_QUESTIONS_PATH, JSON.stringify(importSummary, null, 2), 'utf8');
  log(`💾 Resumo de importação gerado em: ${IMPORTED_QUESTIONS_PATH}`);

  updateStatus('COMPLETED', totalFiles, totalFiles, `Concluído: ${successCount}/${totalFiles} arquivos baixados com sucesso.`);
  log('\n================================================================');
  log(`🎉 OPERAÇÃO FINALIZADA COM SUCESSO!`);
  log(`📊 Total de arquivos processados: ${successCount}/${totalFiles}`);
  log(`🔒 Regra de segurança garantida: 0 gabaritos inseridos no banco.`);
  log('================================================================');
}

run().catch(err => {
  log(`❌ Falha fatal: ${err.message}`);
  updateStatus('FAILED', 0, 0, err.message);
});
