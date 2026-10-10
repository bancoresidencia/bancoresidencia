import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PDFParse } from 'pdf-parse';

const BASE_DIR = process.cwd();
const AUTH_STATE_PATH = path.join(BASE_DIR, 'scripts', 'drive_auth_state.json');
const TARGET_SUBFOLDER = 'extracao_de_questoes';
const BASE_KNOWLEDGE_DIR = path.join(BASE_DIR, 'data', 'knowledge', TARGET_SUBFOLDER);
const STATUS_PATH = path.join(BASE_DIR, 'data', 'medcurso_extraction_status.json');
const TEMP_FILE_PATH = path.join(BASE_DIR, 'data', 'temp_medcurso_dl');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'medical-knowledge';

if (!fs.existsSync(BASE_KNOWLEDGE_DIR)) {
  fs.mkdirSync(BASE_KNOWLEDGE_DIR, { recursive: true });
}

// -------------------------------------------------------------
// Carrega bases anteriores para comparação simultânea em memória
// -------------------------------------------------------------
console.log('🔄 Indexando bases existentes para comparação cruzada simultânea...');

const extração1_ids = new Set();
const extração2_ids = new Set();
const plataforma_ids = new Set();
const plataforma_hashes = new Set();

// 1. Extração 1
const k1_dir = path.join(BASE_DIR, 'data', 'knowledge');
if (fs.existsSync(k1_dir)) {
  const dirs = fs.readdirSync(k1_dir).filter(d => d !== 'gabarito_das_questoes' && d !== TARGET_SUBFOLDER && fs.statSync(path.join(k1_dir, d)).isDirectory());
  for (const d of dirs) {
    const files = fs.readdirSync(path.join(k1_dir, d)).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const c = JSON.parse(fs.readFileSync(path.join(k1_dir, d, f), 'utf8'));
        const text = (c.chunks || []).map(x => x.content).join('\n\n');
        const ids = text.match(/\b4\d{8,10}\b/g) || [];
        ids.forEach(id => extração1_ids.add(id));
      } catch {}
    }
  }
}

// 2. Extração 2
const k2_dir = path.join(BASE_DIR, 'data', 'knowledge', 'gabarito_das_questoes');
if (fs.existsSync(k2_dir)) {
  const dirs = fs.readdirSync(k2_dir).filter(d => fs.statSync(path.join(k2_dir, d)).isDirectory());
  for (const d of dirs) {
    const files = fs.readdirSync(path.join(k2_dir, d)).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const c = JSON.parse(fs.readFileSync(path.join(k2_dir, d, f), 'utf8'));
        const text = (c.chunks || []).map(x => x.content).join('\n\n');
        const ids = text.match(/\b4\d{8,10}\b/g) || [];
        ids.forEach(id => extração2_ids.add(id));
      } catch {}
    }
  }
}

// 3. Plataforma Atual
const goldPath = path.join(BASE_DIR, 'data', 'all_homologated_questions_gold.json');
if (fs.existsSync(goldPath)) {
  try {
    const gold = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
    (Array.isArray(gold) ? gold : []).forEach(q => {
      if (q.id) plataforma_ids.add(String(q.id));
      if (q.enunciado) {
        const h = q.enunciado.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (h.length > 25) plataforma_hashes.add(h);
      }
    });
  } catch {}
}

console.log(`✅ Base 1 indexada: ${extração1_ids.size.toLocaleString('pt-BR')} IDs`);
console.log(`✅ Base 2 indexada: ${extração2_ids.size.toLocaleString('pt-BR')} IDs`);
console.log(`✅ Plataforma indexada: ${plataforma_ids.size.toLocaleString('pt-BR')} IDs / ${plataforma_hashes.size.toLocaleString('pt-BR')} enunciados`);

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
}

function toS3Key(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._\-\/]/g, '_')
    .replace(/_+/g, '_');
}

function updateStatus(patch) {
  let curr = {};
  if (fs.existsSync(STATUS_PATH)) {
    try { curr = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')); } catch {}
  }
  const next = { ...curr, ...patch, updatedAt: new Date().toISOString() };
  fs.writeFileSync(STATUS_PATH, JSON.stringify(next, null, 2), 'utf8');
}

// Bancas / Instituições Oficiais reconhecidas
const BANCAS_REGEX = /(?:USP|UNICAMP|UNIFESP|ENARE|UFRJ|UERJ|SUS-SP|AMRIGS|SURCE|IAMSPE|UFMG|UFRGS|UFPR|UFSC|UFPE|UFBA|UFC|UNESP|SCMSP|HCPA|EINSTEIN|SÍRIO|REVALIDA|INEP|SES-RJ|SES-DF|SMS-SP|HIAE|FMUSP|UNIRIO|UFF|FUVEST)/i;
const AUTORAIS_REGEX = /(?:autoral|inédita|inédito|simulado medcurso|questão autoral|prof\.|comentário autoral)/i;

function isQuestaoOficial(text) {
  if (AUTORAIS_REGEX.test(text) && !BANCAS_REGEX.test(text)) return false;
  return BANCAS_REGEX.test(text) || /\b(?:19|20)\d{2}\s*[-–]\s*(?:Resid|Acesso|R1)/i.test(text);
}

function normalizeHash(statement) {
  return statement.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);
}

function parseHTMLQuestions(htmlText) {
  const questoes = [];
  const blocks = htmlText.split(/(?:<div[^>]*class="[^"]*questao[^"]*"|<section[^>]*class="[^"]*question[^"]*"|<article[^>]*class="[^"]*question[^"]*")/i);
  
  for (const block of blocks) {
    const rawClean = block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (rawClean.length < 50) continue;
    if (!isQuestaoOficial(rawClean)) continue;

    const gabMatch = rawClean.match(/(?:Gabarito|Resposta|Alternativa Correta)\s*[:\s-]+\s*([A-E])/i);
    const idMatch = rawClean.match(/\b4\d{8,10}\b/);
    const bancaMatch = rawClean.match(BANCAS_REGEX);

    questoes.push({
      origem: 'html',
      id: idMatch ? idMatch[0] : null,
      banca: bancaMatch ? bancaMatch[0].toUpperCase() : 'OFICIAL',
      gabarito: gabMatch ? gabMatch[1].toUpperCase() : null,
      texto: rawClean.slice(0, 500),
      hash: normalizeHash(rawClean)
    });
  }

  return questoes;
}

async function parsePDFQuestions(pdfPath) {
  try {
    const buffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    const rawText = (typeof result === 'string' ? result : (result?.text || '')).trim();

    const questoes = [];
    const paragraphs = rawText.split(/\n\s*(?=\d+[\.\)]\s+|QUEST[ÃA]O\s+\d+|Quest[ãa]o\s+\d+)/g);

    for (const p of paragraphs) {
      const clean = p.replace(/\s+/g, ' ').trim();
      if (clean.length < 50) continue;
      if (!isQuestaoOficial(clean)) continue;

      const gabMatch = clean.match(/(?:Gabarito|Resposta)\s*[:\s-]+\s*([A-E])/i);
      const idMatch = clean.match(/\b4\d{8,10}\b/);
      const bancaMatch = clean.match(BANCAS_REGEX);

      questoes.push({
        origem: 'pdf',
        id: idMatch ? idMatch[0] : null,
        banca: bancaMatch ? bancaMatch[0].toUpperCase() : 'OFICIAL',
        gabarito: gabMatch ? gabMatch[1].toUpperCase() : null,
        texto: clean.slice(0, 500),
        hash: normalizeHash(clean)
      });
    }

    return questoes;
  } catch {
    return [];
  }
}

async function downloadFileFromDrive(page, fileId, destPath) {
  try {
    let dlPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    await page.goto(`https://drive.usercontent.google.com/u/3/uc?id=${fileId}&export=download`, {
      timeout: 20000,
      waitUntil: 'commit'
    }).catch(() => {});

    let dl = await dlPromise;
    if (dl) {
      await dl.saveAs(destPath);
      return true;
    }

    const hasDownloadAnyway = await page.evaluate(() => {
      const btn = document.querySelector('#uc-download-link, a[href*="confirm"], input[type="submit"], button');
      return Boolean(btn);
    });

    if (hasDownloadAnyway) {
      dlPromise = page.waitForEvent('download', { timeout: 25000 }).catch(() => null);
      await page.evaluate(() => {
        const btn = document.querySelector('#uc-download-link, a[href*="confirm"], input[type="submit"], button');
        if (btn) btn.click();
      });
      dl = await dlPromise;
      if (dl) {
        await dl.saveAs(destPath);
        return true;
      }
    }
  } catch {}

  try {
    await page.goto(`https://drive.google.com/file/d/${fileId}/view`, {
      waitUntil: 'domcontentloaded',
      timeout: 25000
    }).catch(() => {});
    await page.waitForTimeout(2000);

    let dlPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('[aria-label="Fazer o download"], [aria-label="Baixar"], button[aria-label*="download" i]');
      if (btn) { btn.click(); return true; }
      return false;
    });

    if (clicked) {
      let dl = await dlPromise;
      if (dl) {
        await dl.saveAs(destPath);
        return true;
      }
    }
  } catch {}

  return false;
}

async function listFolderItems(page, folderId) {
  await page.goto(`https://drive.google.com/drive/folders/${folderId}`, {
    waitUntil: 'domcontentloaded',
    timeout: 35000
  });
  await page.waitForTimeout(3000);

  return await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-id]'));
    const map = new Map();
    for (const r of rows) {
      const id = r.getAttribute('data-id');
      const text = (r.innerText || '').split('\n')[0].trim();
      if (id && text && text.length > 1 && !map.has(id)) {
        map.set(id, text);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  });
}

async function uploadJsonToSupabase(specialty, fileName, localJsonPath) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  const s3Path = `${TARGET_SUBFOLDER}/${toS3Key(specialty)}/${toS3Key(fileName)}`;
  const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${s3Path}`;
  const fileBuffer = fs.readFileSync(localJsonPath);

  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true'
    },
    body: fileBuffer
  });

  if (!res.ok) {
    const t = await res.text();
    console.warn(`   ⚠️ Aviso upload Supabase (${fileName}): ${t.slice(0, 100)}`);
  }
}

// Busca recursiva profunda por pastas que contenham 'Questões'
async function findQuestoesFoldersRecursively(page, folderId, folderName, specName, collected = []) {
  let subItems = [];
  try {
    subItems = await listFolderItems(page, folderId);
  } catch {
    return collected;
  }

  const qFolder = subItems.find(s => s.name.toLowerCase().includes('quest'));
  if (qFolder) {
    collected.push({
      themeName: folderName,
      specName: specName,
      questoesFolderId: qFolder.id,
      questoesFolderName: qFolder.name
    });
  } else {
    // Se não achou 'Questões', desce nas subpastas (ex: Hematologia, Reumatologia, etc.)
    for (const sub of subItems) {
      if (
        !sub.name.includes('#Med Eletro') &&
        !sub.name.includes('Mentoria') &&
        !sub.name.includes('.txt') &&
        !sub.name.includes('.pdf') &&
        !sub.name.includes('.html') &&
        sub.id !== '_gd'
      ) {
        await findQuestoesFoldersRecursively(page, sub.id, sub.name, specName, collected);
      }
    }
  }

  return collected;
}

async function main() {
  console.log('\n================================================================');
  console.log('🚀 INICIANDO EXTRAÇÃO COMPLETA MEDCURSO 2026 (BUSCA RECURSIVA)');
  console.log('================================================================\n');

  updateStatus({
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    totalTemasProcessados: 0,
    questoesOficiaisUnicas: 0,
    jaNaExtracao1: 0,
    jaNaExtracao2: 0,
    jaNaPlataforma: 0,
    novasParaPlataforma: 0,
    especialidadeAtiva: 'Mapeando árvore de pastas...',
    temaAtivo: 'Conectando...'
  });

  const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: true
  });
  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined,
    acceptDownloads: true
  });
  const page = await context.newPage();

  const ROOT_FOLDER = '1ssJVFdvRGZN8g4l6NoMwHiKrQhhLpNse';
  const rootItems = await listFolderItems(page, ROOT_FOLDER);
  const mainSpecialties = rootItems.filter(item => 
    !item.name.includes('#Med Eletro') && 
    !item.name.includes('Mentoria') && 
    !item.name.includes('.txt') &&
    item.id !== '_gd'
  );

  console.log(`📋 Grandes Especialidades no Topo: ${mainSpecialties.length}`);
  mainSpecialties.forEach(s => console.log(`   • ${s.name} (${s.id})`));

  const CATALOG_PATH = path.join(process.cwd(), 'data', 'medcurso_all_questoes_folders.json');
  let catalogItems = [];
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      catalogItems = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    } catch {}
  }

  console.log(`📋 Total de temas com pasta 'Questões' no catálogo: ${catalogItems.length}`);

  const medcursoGlobalUnique = new Map();
  let temasProcessados = 0;

  for (let i = 0; i < catalogItems.length; i++) {
    const qf = catalogItems[i];
    const specName = qf.specialty;
    const cleanTheme = qf.theme.replace(/^\d+[\s-_.]*/, '').trim();
    const specDir = path.join(BASE_KNOWLEDGE_DIR, sanitize(specName));
    if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });

    const jsonFileName = `${sanitize(cleanTheme)}.json`;
    const localJsonPath = path.join(specDir, jsonFileName);

    // Retomada inteligente (pula se já finalizado)
    if (fs.existsSync(localJsonPath)) {
      try {
        const prev = JSON.parse(fs.readFileSync(localJsonPath, 'utf8'));
        (prev.questoes || []).forEach(q => medcursoGlobalUnique.set(q.chaveUnica, q));
        temasProcessados++;
        console.log(`   ⏭️ Já processado anteriormente [${i + 1}/${catalogItems.length}]: ${cleanTheme} (${prev.questoes?.length || 0} questões)`);
        continue;
      } catch {}
    }

    console.log(`\n🏥 [${i + 1}/${catalogItems.length}] Processando: ${specName} -> ${cleanTheme}...`);
    updateStatus({
      especialidadeAtiva: specName,
      temaAtivo: cleanTheme
    });

    let qArquivos = [];
    try {
      qArquivos = await listFolderItems(page, qf.questoesFolderId);
    } catch {
      continue;
    }

    const htmlFile = qArquivos.find(a => a.name.toLowerCase().endsWith('.html'));
    const pdfQuestoesFile = qArquivos.find(a => a.name.toLowerCase().includes('questoes') && a.name.toLowerCase().endsWith('.pdf'));
    const resumoPdfFile = qArquivos.find(a => a.name.toLowerCase().endsWith('.pdf') && !a.name.toLowerCase().includes('questoes'));

    const alvos = [htmlFile, pdfQuestoesFile, resumoPdfFile].filter(Boolean);
    console.log(`      📁 ${alvos.length} arquivos-alvo localizados.`);
    const temaQuestoes = [];

    for (const alvo of alvos) {
      console.log(`      📥 Baixando e analisando: ${alvo.name}...`);
      const tempExt = alvo.name.toLowerCase().endsWith('.html') ? '.html' : '.pdf';
      const tempPath = `${TEMP_FILE_PATH}${tempExt}`;

      const ok = await downloadFileFromDrive(page, alvo.id, tempPath);
      if (!ok) continue;

      if (tempExt === '.html') {
        const htmlText = fs.readFileSync(tempPath, 'utf8');
        const parsed = parseHTMLQuestions(htmlText);
        parsed.forEach(q => temaQuestoes.push({ ...q, fonteArquivo: alvo.name }));
      } else {
        const parsed = await parsePDFQuestions(tempPath);
        parsed.forEach(q => temaQuestoes.push({ ...q, fonteArquivo: alvo.name }));
      }

      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch {}
      }
    }

    // Desduplicação Estrita do Tema + Comparação Cruzada
    const temaUniqueMap = new Map();
    for (const q of temaQuestoes) {
      const key = q.id || (q.banca + '_' + q.hash);
      if (!temaUniqueMap.has(key)) {
        const inE1 = q.id ? extração1_ids.has(q.id) : false;
        const inE2 = q.id ? extração2_ids.has(q.id) : false;
        const inPlat = (q.id && plataforma_ids.has(q.id)) || plataforma_hashes.has(q.hash);

        const enriquecida = {
          chaveUnica: key,
          id: q.id,
          banca: q.banca,
          gabarito: q.gabarito,
          texto: q.texto,
          fonteArquivo: q.fonteArquivo,
          especialidade: specName,
          tema: cleanTheme,
          presenteNaExtracao1: inE1,
          presenteNaExtracao2: inE2,
          presenteNaPlataforma: inPlat,
          novaParaPlataforma: !inPlat
        };

        temaUniqueMap.set(key, enriquecida);
        medcursoGlobalUnique.set(key, enriquecida);
      }
    }

    const listaTema = Array.from(temaUniqueMap.values());
    const record = {
      especialidade: specName,
      tema: cleanTheme,
      extraidoEm: new Date().toISOString(),
      arquivosAlvo: alvos.map(a => a.name),
      totalQuestoesOficiaisUnicas: listaTema.length,
      questoes: listaTema
    };

    fs.writeFileSync(localJsonPath, JSON.stringify(record, null, 2), 'utf8');
    await uploadJsonToSupabase(specName, jsonFileName, localJsonPath);

    temasProcessados++;
    console.log(`      ✅ Sucesso [${cleanTheme}]: ${listaTema.length} questões oficiais únicas auditadas.`);

    let cE1 = 0, cE2 = 0, cPlat = 0, cNovas = 0;
    for (const q of medcursoGlobalUnique.values()) {
      if (q.presenteNaExtracao1) cE1++;
      if (q.presenteNaExtracao2) cE2++;
      if (q.presenteNaPlataforma) cPlat++;
      if (q.novaParaPlataforma) cNovas++;
    }

    updateStatus({
      totalTemasProcessados: temasProcessados,
      questoesOficiaisUnicas: medcursoGlobalUnique.size,
      jaNaExtracao1: cE1,
      jaNaExtracao2: cE2,
      jaNaPlataforma: cPlat,
      novasParaPlataforma: cNovas,
      ultimoTemaConcluido: `${specName} - ${cleanTheme}`
    });
  }

  await browser.close();

  updateStatus({
    status: 'completed',
    completedAt: new Date().toISOString()
  });

  console.log('\n======================================================');
  console.log('🎉 VARREDURA RECURSIVA MEDCURSO 2026 CONCLUÍDA!');
  console.log(`📚 Temas processados: ${temasProcessados}`);
  console.log(`🎯 Questões oficiais únicas: ${medcursoGlobalUnique.size}`);
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('Erro na extração recursiva MEDCURSO:', err);
  updateStatus({ status: 'error', error: err.message });
});
