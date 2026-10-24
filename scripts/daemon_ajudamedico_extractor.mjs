import fs from 'fs';
import path from 'path';

// Diretórios principais
const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'questions', 'ajudamedico');
const STATUS_PATH = path.join(process.cwd(), 'data', 'ajudamedico_extraction_status.json');
const SESSION_PATH = path.join(process.cwd(), 'scripts', 'ajudamedico_session.json');

// Garante que as pastas existam
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Carrega a sessão
if (!fs.existsSync(SESSION_PATH)) {
  console.error('❌ Arquivo de sessão não encontrado em:', SESSION_PATH);
  process.exit(1);
}

const session = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
const TOKEN = session.token;

// Carrega status anterior para continuar de onde parou
let status = {
  status: 'idle',
  currentPage: 1,
  totalQuestions: 0,
  totalImages: 0,
  extractedIds: [],
  lastUpdated: new Date().toISOString(),
  lastExam: null,
  recentBatches: []
};

if (fs.existsSync(STATUS_PATH)) {
  try {
    const prev = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
    status = { ...status, ...prev };
  } catch (e) {
    console.warn('Aviso: status anterior não pôde ser lido, iniciando novo.');
  }
}

const seenIds = new Set(status.extractedIds || []);

// Configurações de execução
const args = process.argv.slice(2);
const limitPerPage = 10;
const maxPagesToRun = args.find(a => a.startsWith('--pages=')) 
  ? parseInt(args.find(a => a.startsWith('--pages=')).split('=')[1], 10) 
  : (args.includes('--pilot') ? 2 : 20); // Default: 20 páginas (~200 questões) por ciclo seguro

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath)) return true; // Já baixado
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    return false;
  }
}

async function fetchPage(page) {
  const url = `https://app.ajudamedico.com/api/v1/questions/?limit=${limitPerPage}&page=${page}&order_by=reaction&order_direction=desc&return_user_answered_questions=true`;
  
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      });

      if (res.status === 429) {
        console.warn(`⚠️ Rate limit (429) na página ${page}. Aguardando 30s para backoff...`);
        await delay(30000);
        continue;
      }

      if (res.status === 401 || res.status === 403) {
        throw new Error(`Autenticação recusada (HTTP ${res.status}). O token pode ter expirado.`);
      }

      if (!res.ok) {
        throw new Error(`Erro na API: HTTP ${res.status} (${res.statusText})`);
      }

      const data = await res.json();
      return Array.isArray(data) ? data : (data.results || data.questions || []);
    } catch (err) {
      if (attempts >= 3) throw err;
      console.warn(`Tentativa ${attempts} falhou: ${err.message}. Aguardando 5s...`);
      await delay(5000);
    }
  }
  return [];
}

async function main() {
  console.log('===============================================================');
  console.log('🚀 EXTRATOR SEGURO DE QUESTÕES: AJUDAMÉDICO');
  console.log(`👤 Usuário autenticado: ${session.username}`);
  console.log(`📄 Página inicial: ${status.currentPage} | Meta deste ciclo: ${maxPagesToRun} páginas`);
  console.log('🛡️ Throttling ativo: Pausa de 4 a 7 segundos por página com jitter');
  console.log('===============================================================\n');

  status.status = 'in_progress';
  status.lastUpdated = new Date().toISOString();
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2), 'utf8');

  let pagesProcessedInRun = 0;
  let newQuestionsInRun = 0;
  let newImagesInRun = 0;

  try {
    while (pagesProcessedInRun < maxPagesToRun) {
      const targetPage = status.currentPage;
      console.log(`\n⏳ [Página ${targetPage}] Requisitando lote (${limitPerPage} questões)...`);

      const rawQuestions = await fetchPage(targetPage);

      if (!rawQuestions || rawQuestions.length === 0) {
        console.log(`🏁 Nenhuma questão retornada na página ${targetPage}. Fim das questões disponíveis.`);
        status.status = 'completed';
        break;
      }

      const formattedQuestions = [];

      for (const q of rawQuestions) {
        if (seenIds.has(q.id)) {
          continue;
        }

        // Processa imagens do enunciado
        const processedImages = [];
        if (Array.isArray(q.images)) {
          for (const imgObj of q.images) {
            const fileUrl = imgObj.file?.url;
            if (fileUrl) {
              const ext = imgObj.file?.mime?.includes('png') ? '.png' : (imgObj.file?.mime?.includes('jpeg') ? '.jpg' : '.webp');
              const filename = `ajuda_${q.id}_img_${imgObj.order || 0}${ext}`;
              const localPath = path.join(IMAGES_DIR, filename);
              const ok = await downloadImage(fileUrl, localPath);
              if (ok) {
                status.totalImages++;
                newImagesInRun++;
                processedImages.push({
                  order: imgObj.order || 0,
                  originalUrl: fileUrl,
                  localUrl: `/images/questions/ajudamedico/${filename}`
                });
              }
            }
          }
        }

        // Processa imagens das alternativas
        const optionsList = [
          { letter: 'A', text: q.iten_a_text, img: q.iten_a_image },
          { letter: 'B', text: q.iten_b_text, img: q.iten_b_image },
          { letter: 'C', text: q.iten_c_text, img: q.iten_c_image },
          { letter: 'D', text: q.iten_d_text, img: q.iten_d_image },
          { letter: 'E', text: q.iten_e_text, img: q.iten_e_image }
        ].filter(opt => opt.text !== null && opt.text !== undefined && opt.text.trim() !== '');

        const mappedOptions = [];
        for (const opt of optionsList) {
          let optLocalImg = null;
          if (opt.img) {
            const filename = `ajuda_${q.id}_opt_${opt.letter}.webp`;
            const localPath = path.join(IMAGES_DIR, filename);
            const ok = await downloadImage(opt.img, localPath);
            if (ok) {
              status.totalImages++;
              newImagesInRun++;
              optLocalImg = `/images/questions/ajudamedico/${filename}`;
            }
          }

          mappedOptions.push({
            id: opt.letter,
            text: opt.text.trim(),
            imageUrl: optLocalImg,
            isCorrect: String(q.resposta || '').trim().toUpperCase() === opt.letter
          });
        }

        // Formatação padronizada para o Banco Residência
        const normalized = {
          id: `AJUDA_${q.id}`,
          originalId: q.id,
          statement: q.enunciado || '',
          options: mappedOptions,
          officialAnswer: String(q.resposta || '').trim().toUpperCase(),
          medicalExplanation: q.explicacao || '',
          exam: q.test?.name || 'Oficial',
          year: q.test?.test_year ? Number(q.test.test_year) : null,
          banca: q.test?.banca || 'N/A',
          uf: q.test?.estado || null,
          tags: Array.isArray(q.tags) ? q.tags.map(t => t.name) : [],
          difficulty: q.difficulty_score || null,
          images: processedImages,
          officialFiles: {
            examPdf: q.test?.prova_file?.url || null,
            keyPdf: q.test?.gabarito_file?.url || null
          },
          collectedAt: new Date().toISOString()
        };

        formattedQuestions.push(normalized);
        seenIds.add(q.id);
        status.totalQuestions++;
        newQuestionsInRun++;
        status.lastExam = `${normalized.exam} ${normalized.year || ''} (${normalized.banca})`;
      }

      // Salva o lote no disco
      if (formattedQuestions.length > 0) {
        const batchFile = path.join(DATA_DIR, `lote_pagina_${String(targetPage).padStart(4, '0')}.json`);
        fs.writeFileSync(batchFile, JSON.stringify(formattedQuestions, null, 2), 'utf8');
        console.log(`💾 Salvas ${formattedQuestions.length} questões em: ${path.basename(batchFile)}`);
      } else {
        console.log(`ℹ️ Todas as questões da página ${targetPage} já haviam sido processadas.`);
      }

      // Atualiza ponteiro e status
      status.currentPage = targetPage + 1;
      status.extractedIds = Array.from(seenIds);
      status.lastUpdated = new Date().toISOString();
      fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2), 'utf8');

      pagesProcessedInRun++;

      // Pausa humana com jitter (4500ms a 7500ms)
      if (pagesProcessedInRun < maxPagesToRun) {
        const jitter = Math.floor(Math.random() * 3000) + 4500;
        console.log(`⏸️ Pausa de segurança anti-bot: ${(jitter / 1000).toFixed(1)}s...`);
        await delay(jitter);

        // Pausa extra de descanso a cada 10 páginas
        if (pagesProcessedInRun % 10 === 0) {
          console.log(`☕ Descanso preventivo de 25s após 10 páginas...`);
          await delay(25000);
        }
      }
    }

    status.status = status.status === 'completed' ? 'completed' : 'paused';
    status.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2), 'utf8');

    console.log('\n===============================================================');
    console.log('🎉 CICLO FINALIZADO COM SUCESSO!');
    console.log(`📊 Páginas neste ciclo:      ${pagesProcessedInRun}`);
    console.log(`📝 Novas questões salvas:   ${newQuestionsInRun} (Total acumulado: ${status.totalQuestions})`);
    console.log(`🖼️ Novas imagens baixadas:  ${newImagesInRun} (Total acumulado: ${status.totalImages})`);
    console.log(`📌 Próxima página na fila:   ${status.currentPage}`);
    console.log(`📁 Destino dos dados:        ${DATA_DIR}`);
    console.log('===============================================================\n');

  } catch (err) {
    console.error('\n❌ Erro durante o ciclo de extração:', err.message);
    status.status = 'error';
    status.lastError = err.message;
    status.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2), 'utf8');
    process.exit(1);
  }
}

main().catch(console.error);
