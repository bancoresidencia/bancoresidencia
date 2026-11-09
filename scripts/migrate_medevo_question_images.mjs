import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// Carrega variáveis de ambiente de .env.local
function loadEnv() {
  const env = {};
  if (fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^['\"]|['\"]$/g, '');
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  db: { schema: 'public' }
});

const QUESTIONS_JSON_PATH = path.resolve('scripts/medevo_image_url_questions.json');
const PROGRESS_PATH = path.resolve('scripts/medevo_questions_migration_progress.json');

// Headers que simulam o Google Chrome desktop no Windows 11
const STUDENT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'image',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'cross-site',
  'Priority': 'u=1, i'
};

// Fisher-Yates Shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Extrai nome de arquivo limpo da URL
function getFilenameFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const last = parts[parts.length - 1] || 'image.webp';
    return last.replace(/[^a-zA-Z0-9._-]/g, '_');
  } catch (e) {
    return `img_${Date.now()}.webp`;
  }
}

// Helper com retry e backoff para operações no Supabase
async function withSupabaseRetry(fn, retries = 3, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fn();
      if (result && result.error) {
        const msg = result.error.message || '';
        if (attempt < retries && (msg.includes('timed out') || msg.includes('timeout') || msg.includes('connections') || msg.includes('Gateway') || msg.includes('500') || msg.includes('503'))) {
          console.log(`      ⏳ Supabase ocupado (${msg}). Tentativa ${attempt}/${retries} em ${delayMs * attempt}ms...`);
          await new Promise(r => setTimeout(r, delayMs * attempt));
          continue;
        }
      }
      return result;
    } catch (err) {
      if (attempt < retries) {
        console.log(`      ⏳ Erro transitório no Supabase (${err.message}). Tentativa ${attempt}/${retries} em ${delayMs * attempt}ms...`);
        await new Promise(r => setTimeout(r, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

async function run() {
  console.log('====================================================');
  console.log('   FASE 2: MIGRAÇÃO DAS IMAGENS DE QUESTÕES');
  console.log('   CADÊNCIA HIPER-REALISTA COM RETRY ROBUSTO');
  console.log('====================================================');

  if (!fs.existsSync(QUESTIONS_JSON_PATH)) {
    console.error(`❌ Arquivo ${QUESTIONS_JSON_PATH} não encontrado.`);
    process.exit(1);
  }

  const questionsList = JSON.parse(fs.readFileSync(QUESTIONS_JSON_PATH, 'utf8'));

  // Carrega progresso anterior
  let progress = {};
  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
    } catch (e) {
      progress = {};
    }
  }

  // Mapeia todas as URLs únicas e suas respectivas questões
  const urlMap = new Map();
  for (const q of questionsList) {
    for (const img of (q.images || [])) {
      const url = img.url;
      if (!url) continue;
      if (!urlMap.has(url)) {
        urlMap.set(url, {
          url,
          questions: []
        });
      }
      urlMap.get(url).questions.push({
        questionId: q.questionId,
        code: q.code,
        field: img.field
      });
    }
  }

  const allUrls = Array.from(urlMap.values());
  const pendingUrls = allUrls.filter(item => !progress[item.url] || progress[item.url].status !== 'success');

  console.log(`📋 Total de imagens únicas de questões: ${allUrls.length}`);
  console.log(`📦 Já migradas com sucesso anteriormente: ${allUrls.length - pendingUrls.length}`);
  console.log(`⏳ A processar/retentar nesta rodada: ${pendingUrls.length}`);

  if (pendingUrls.length === 0) {
    console.log('🎉 100% de todas as imagens de questões já foram migradas com sucesso para o Supabase oficial!');
    return;
  }

  // Embaralha para simular ordem aleatória de resolução de questões
  const shuffledItems = shuffle(pendingUrls);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < shuffledItems.length; i++) {
    const item = shuffledItems[i];
    const originalUrl = item.url;
    const filename = getFilenameFromUrl(originalUrl);
    const storagePath = `migrated-medevo/${filename}`;

    try {
      // Jitter calibrado estritamente entre 4.000ms e 25.000ms (4s a 25s)
      const jitterMs = Math.floor(4000 + Math.random() * 21000);
      const seconds = (jitterMs / 1000).toFixed(1);
      console.log(`\n[${i + 1}/${shuffledItems.length}] Estudo Clínico: Lendo questão e baixando imagem (espera ${seconds}s)...`);
      console.log(`   🔗 Origem: ${originalUrl}`);
      console.log(`   📋 Referenciada em ${item.questions.length} questão(ões): ${item.questions.map(q => q.code).join(', ')}`);

      await new Promise(r => setTimeout(r, jitterMs));

      // 1. Download simulando Google Chrome no Windows 11
      const res = await fetch(originalUrl, { headers: STUDENT_HEADERS });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const rawBuffer = Buffer.from(await res.arrayBuffer());

      // 2. Higienização no Sharp (descarta EXIF e metadados, re-encoda para WebP 85%)
      const cleanBuffer = await sharp(rawBuffer)
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      console.log(`   🧹 Higienizado com Sharp: ${(cleanBuffer.length / 1024).toFixed(1)} KB`);

      // 3. Upload para o Supabase oficial do Banco Residência com retry
      const uploadRes = await withSupabaseRetry(async () => {
        return await supabase.storage
          .from('questoes')
          .upload(storagePath, cleanBuffer, {
            contentType: 'image/webp',
            upsert: true
          });
      }, 3, 3000);

      if (uploadRes.error) {
        throw new Error(`Falha no upload do Supabase: ${uploadRes.error.message}`);
      }

      // 4. URL pública no Banco Residência
      const { data: publicUrlData } = supabase.storage
        .from('questoes')
        .getPublicUrl(storagePath);

      const newPublicUrl = publicUrlData.publicUrl;
      console.log(`   🚀 Hospedado no Supabase do Banco Residência: ${newPublicUrl}`);

      // 5. Atualiza as questões no PostgreSQL com retry
      for (const ref of item.questions) {
        const fetchRes = await withSupabaseRetry(async () => {
          return await supabase
            .from('questions')
            .select('id, image_url, images, statement, options, commentary')
            .eq('id', ref.questionId)
            .single();
        }, 3, 3000);

        if (!fetchRes.error && fetchRes.data) {
          const qData = fetchRes.data;
          const updates = {};
          let needsUpdate = false;

          // Atualiza image_url se for a URL antiga
          if (qData.image_url === originalUrl) {
            updates.image_url = newPublicUrl;
            needsUpdate = true;
          }

          // Atualiza array de images
          if (Array.isArray(qData.images) && qData.images.includes(originalUrl)) {
            updates.images = qData.images.map(u => u === originalUrl ? newPublicUrl : u);
            needsUpdate = true;
          }

          // Atualiza ocorrências dentro do enunciado (statement) se houver
          if (typeof qData.statement === 'string' && qData.statement.includes(originalUrl)) {
            updates.statement = qData.statement.replaceAll(originalUrl, newPublicUrl);
            needsUpdate = true;
          }

          // Atualiza ocorrências dentro dos comentários se houver
          if (typeof qData.commentary === 'string' && qData.commentary.includes(originalUrl)) {
            updates.commentary = qData.commentary.replaceAll(originalUrl, newPublicUrl);
            needsUpdate = true;
          }

          // Atualiza ocorrências nas alternativas se houver
          if (Array.isArray(qData.options)) {
            const updatedOptions = qData.options.map(opt => {
              if (typeof opt.text === 'string' && opt.text.includes(originalUrl)) {
                needsUpdate = true;
                return { ...opt, text: opt.text.replaceAll(originalUrl, newPublicUrl) };
              }
              return opt;
            });
            if (needsUpdate) updates.options = updatedOptions;
          }

          if (needsUpdate) {
            const updateRes = await withSupabaseRetry(async () => {
              return await supabase
                .from('questions')
                .update(updates)
                .eq('id', ref.questionId);
            }, 3, 3000);

            if (updateRes.error) {
              console.warn(`   ⚠️ Erro ao atualizar questão ${ref.code}: ${updateRes.error.message}`);
            } else {
              console.log(`   ✅ Questão ${ref.code} atualizada no banco com sucesso.`);
            }
          }
        }
      }

      // Registra checkpoint de sucesso
      progress[originalUrl] = {
        status: 'success',
        newUrl: newPublicUrl,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
      successCount++;

      // Pausa de descanso a cada 20 questões resolvidas (simulando pausa de estudo)
      if ((i + 1) % 20 === 0 && i + 1 < shuffledItems.length) {
        const restSeconds = Math.floor(30 + Math.random() * 30);
        console.log(`\n☕ [Pausa de Estudo do Estudante] Pausa de ${restSeconds}s após 20 questões resolvidas...\n`);
        await new Promise(r => setTimeout(r, restSeconds * 1000));
      }

    } catch (err) {
      console.error(`   ❌ Falha na imagem '${originalUrl}': ${err.message}`);
      progress[originalUrl] = {
        status: 'error',
        error: err.message,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
      failCount++;
    }
  }

  console.log('\n====================================================');
  console.log('   RODADA CONCLUÍDA');
  console.log(`   Novos Sucessos nesta rodada: ${successCount}`);
  console.log(`   Pendências restantes: ${failCount}`);
  console.log('====================================================\n');
}

run().catch(console.error);
