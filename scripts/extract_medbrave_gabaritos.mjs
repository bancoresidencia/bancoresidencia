import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'medevo_config.json');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'medbrave_questions_full.json');
const OUTPUT_JSONL = path.join(process.cwd(), 'data', 'medbrave_questions_stream.jsonl');

const args = process.argv.slice(2);
const getArg = (name) => {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  if (found) return found.slice(prefix.length);
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) return args[idx + 1];
  return null;
};

// Configurações e limites opcionais
const limitPerPage = 100;
const maxPagesArg = getArg('max-pages') ? parseInt(getArg('max-pages'), 10) : null;
const delayMs = parseInt(getArg('delay') || '400', 10); // amigável (400ms entre páginas)

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch {}
  }
  return {};
}

const config = loadConfig();
const token = getArg('token') || process.env.MEDBRAVE_USER_TOKEN || config.MEDBRAVE_USER_TOKEN;

if (!token) {
  console.error('❌ ERRO: Token do MedBrave não encontrado em scripts/medevo_config.json');
  process.exit(1);
}

async function fetchPage(page, attempt = 1) {
  const maxAttempts = 5;
  const url = `https://api.medbrave.com.br/api/questions?limit=${limitPerPage}&page=${page}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'X-Client-Platform': 'web',
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 429 || res.status === 503) {
      if (attempt <= maxAttempts) {
        const wait = 2000 * attempt;
        console.warn(`⏳ [Rate Limit HTTP ${res.status}] Aguardando ${wait / 1000}s na página ${page}...`);
        await new Promise(r => setTimeout(r, wait));
        return fetchPage(page, attempt + 1);
      }
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err.slice(0, 100)}`);
    }

    return await res.json();
  } catch (e) {
    if (attempt <= maxAttempts) {
      await new Promise(r => setTimeout(r, 1000 * attempt));
      return fetchPage(page, attempt + 1);
    }
    throw e;
  }
}

async function main() {
  console.log('===============================================================');
  console.log('🚀 EXTRATOR ULTRA-RÁPIDO MEDBRAVE (API NATIVA / GABARITOS DIRETOS)');
  console.log('===============================================================');
  console.log(`👤 Usuário: ${config.USER_NAME || config.USER_EMAIL || 'Autenticado'}`);
  console.log(`🔑 Token ativo: ${token.slice(0, 10)}...${token.slice(-6)}`);

  // Testa conectividade e descobre total
  console.log('\n📡 Conectando ao backend MedBrave...');
  const firstPage = await fetchPage(1);
  const totalQuestions = firstPage.total || 59877;
  const totalPages = Math.ceil(totalQuestions / limitPerPage);
  const pagesToDownload = maxPagesArg ? Math.min(totalPages, maxPagesArg) : totalPages;

  console.log(`📊 Universo total no MedBrave: ${totalQuestions.toLocaleString('pt-BR')} questões`);
  console.log(`📄 Total de páginas (100 por pág): ${totalPages} páginas`);
  console.log(`🎯 Meta de download nesta execução: ${pagesToDownload} páginas (~${(pagesToDownload * limitPerPage).toLocaleString('pt-BR')} questões)`);

  // Carrega progresso anterior se existir
  const processedIds = new Set();
  let existingList = [];
  
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingList = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      if (Array.isArray(existingList)) {
        existingList.forEach(q => processedIds.add(q.id));
        console.log(`📦 Cache existente carregado: ${processedIds.size.toLocaleString('pt-BR')} questões já salvas.`);
      }
    } catch (e) {
      console.warn('⚠️ Alerta ao ler cache existente:', e.message);
    }
  }

  // Prepara append stream para segurança máxima (zero perda em falhas de energia/processo)
  const jsonlStream = fs.createWriteStream(OUTPUT_JSONL, { flags: 'a', encoding: 'utf8' });

  const startTime = Date.now();
  let newlyCollected = 0;
  let pagesCompleted = 0;

  // Processa página 1 (já temos em memória)
  function ingestItems(items) {
    for (const item of items) {
      if (!processedIds.has(item.id)) {
        processedIds.add(item.id);
        existingList.push(item);
        jsonlStream.write(JSON.stringify(item) + '\n');
        newlyCollected++;
      }
    }
  }

  ingestItems(firstPage.items || []);
  pagesCompleted++;

  console.log(`\n⚡ Iniciando coleta sequencial suave (delay: ${delayMs}ms)...`);

  for (let p = 2; p <= pagesToDownload; p++) {
    try {
      const data = await fetchPage(p);
      ingestItems(data.items || []);
      pagesCompleted++;

      if (pagesCompleted % 5 === 0 || p === pagesToDownload) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (newlyCollected / (Date.now() - startTime) * 1000).toFixed(1);
        const pct = ((p / pagesToDownload) * 100).toFixed(1);
        console.log(`[${pct}%] Pág ${p}/${pagesToDownload} | Coletadas: ${processedIds.size.toLocaleString('pt-BR')} | Novos: ${newlyCollected} | Vel: ${rate} q/s | Tempo: ${elapsed}s`);
      }

      // Salva snapshot consolidado a cada 25 páginas (2.500 questões)
      if (p % 25 === 0 || p === pagesToDownload) {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingList, null, 2), 'utf8');
      }

      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    } catch (err) {
      console.error(`❌ Erro na página ${p}:`, err.message);
      // Salva antes de interromper
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingList, null, 2), 'utf8');
      break;
    }
  }

  jsonlStream.end();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingList, null, 2), 'utf8');

  console.log('\n===============================================================');
  console.log('🎉 DOWNLOAD CONCLUÍDO COM SUCESSO!');
  console.log(`📁 Arquivo consolidado: ${OUTPUT_FILE}`);
  console.log(`📁 Stream JSONL: ${OUTPUT_JSONL}`);
  console.log(`📊 Total final de questões com gabarito no banco: ${processedIds.size.toLocaleString('pt-BR')}`);
  console.log(`✨ Novos adicionados nesta rodada: ${newlyCollected.toLocaleString('pt-BR')}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('\n❌ Erro na execução:', err.message);
  process.exit(1);
});
