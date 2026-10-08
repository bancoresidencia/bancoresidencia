import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const MANIFEST_PATH = path.join(process.cwd(), 'scripts', 'all_options_images_manifest.json');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bHVoYXJ4bG1scWhka3FyamJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTI0OTE3NywiZXhwIjoyMTA2ODI1MTc3fQ.4HC3igdIbIuObD8jhQnIBMA5PoN9ShjeBcK37o9kYvA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadAndUploadImage(url, fileName) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);

    const { error } = await supabase.storage
      .from('questoes')
      .upload(`alternativas/${fileName}`, buf, {
        upsert: true,
        contentType: 'image/webp'
      });

    if (error) {
      throw new Error(`Storage error: ${error.message}`);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function main() {
  console.log('🚀 Iniciando pipeline 100% anônimo na nuvem (GitHub Actions / Azure)...');
  console.log(`📡 Supabase de destino: ${supabaseUrl}\n`);

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifesto não encontrado: ${MANIFEST_PATH}`);
  }

  // Garante que o bucket existe
  try {
    await supabase.storage.createBucket('questoes', { public: true });
  } catch (e) {
    // Ignora se já existir
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`📋 Total de questões para processar: ${manifest.length}`);

  const downloadQueue = [];
  for (const item of manifest) {
    for (const img of item.imageOptions) {
      downloadQueue.push({
        itemCode: item.code,
        itemId: item.id,
        letter: img.letter,
        originalUrl: img.originalUrl,
        fileName: img.fileName,
        storageUrl: `${supabaseUrl}/storage/v1/object/public/questoes/alternativas/${img.fileName}`
      });
    }
  }

  console.log(`🖼️ Total de imagens na fila: ${downloadQueue.length}`);

  let totalUploaded = 0;
  let totalErrors = 0;

  const BATCH_SIZE = 8;
  for (let i = 0; i < downloadQueue.length; i += BATCH_SIZE) {
    const batch = downloadQueue.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (task) => {
        try {
          await downloadAndUploadImage(task.originalUrl, task.fileName);
          totalUploaded++;
          console.log(`  ✓ [${task.itemCode} Alt ${task.letter}] Salvo no Supabase -> ${task.fileName}`);
        } catch (err) {
          totalErrors++;
          console.error(`  ❌ [${task.itemCode} Alt ${task.letter}] Erro: ${err.message}`);
        }
      })
    );
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\n========================================`);
  console.log(`🎉 Upload de imagens concluído no Supabase Storage!`);
  console.log(`Total salvas: ${totalUploaded}`);
  console.log(`Erros: ${totalErrors}`);
  console.log(`========================================\n`);

  // Atualização das alternativas nas questões no Supabase
  console.log('🔄 Atualizando opções das 91 questões no banco de dados...');
  let syncSuccess = 0;

  for (const item of manifest) {
    for (const img of item.imageOptions) {
      const targetOpt = item.options.find((o) => o.letter === img.letter);
      if (targetOpt) {
        targetOpt.text = `${supabaseUrl}/storage/v1/object/public/questoes/alternativas/${img.fileName}`;
      }
    }

    try {
      const { error } = await supabase
        .from('questions')
        .update({ options: item.options })
        .eq('id', item.id);

      if (error) {
        console.error(`  ❌ Erro ao atualizar questão ${item.code}:`, error.message);
      } else {
        syncSuccess++;
      }
    } catch (err) {
      console.error(`  ❌ Exceção ao atualizar questão ${item.code}:`, err.message);
    }
  }

  console.log(`✅ ${syncSuccess} / ${manifest.length} questões atualizadas com sucesso no Supabase!\n`);
  console.log('🏁 Processo finalizado com 100% de sucesso.');
}

main().catch((err) => {
  console.error('FATAL ERROR:', err.stack || err);
  process.exit(1);
});
