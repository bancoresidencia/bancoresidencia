import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'alternativas');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const MANIFEST_PATH = path.join(process.cwd(), 'scripts', 'all_options_images_manifest.json');

async function downloadSingleImage(url, destPath) {
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
    fs.writeFileSync(destPath, buf);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function main() {
  console.log('🚀 Iniciando download anônimo das imagens via GitHub Actions Runner (Fetch Nativo)...');
  console.log(`📁 Destino: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifesto não encontrado: ${MANIFEST_PATH}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`📋 Total de questões para processar: ${manifest.length}`);

  let totalDownloaded = 0;
  let totalErrors = 0;
  let alreadyExisted = 0;

  // Monta lista plana de todas as imagens para download concorrente em lotes controlados
  const downloadQueue = [];
  for (const item of manifest) {
    for (const img of item.imageOptions) {
      downloadQueue.push({
        itemCode: item.code,
        itemId: item.id,
        letter: img.letter,
        originalUrl: img.originalUrl,
        fileName: img.fileName,
        destPath: path.join(OUTPUT_DIR, img.fileName),
        localUrl: img.localUrl
      });
    }
  }

  console.log(`🖼️ Total de imagens na fila: ${downloadQueue.length}`);

  // Processa em lotes de 6 imagens concorrentes
  const BATCH_SIZE = 6;
  for (let i = 0; i < downloadQueue.length; i += BATCH_SIZE) {
    const batch = downloadQueue.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (task) => {
        try {
          if (!fs.existsSync(task.destPath) || fs.statSync(task.destPath).size === 0) {
            await downloadSingleImage(task.originalUrl, task.destPath);
            totalDownloaded++;
            console.log(`  ✓ [${task.itemCode} Alt ${task.letter}] Baixado -> ${task.fileName}`);
          } else {
            alreadyExisted++;
          }
        } catch (err) {
          totalErrors++;
          console.error(`  ❌ [${task.itemCode} Alt ${task.letter}] Erro: ${err.message}`);
        }
      })
    );
    // Intervalo suave entre lotes
    await new Promise((r) => setTimeout(r, 150));
  }

  // Atualiza as alternativas no manifesto
  for (const item of manifest) {
    for (const img of item.imageOptions) {
      const targetOpt = item.options.find((o) => o.letter === img.letter);
      if (targetOpt) {
        targetOpt.text = img.localUrl;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 Download de imagens finalizado!`);
  console.log(`Baixadas com sucesso: ${totalDownloaded}`);
  console.log(`Já existiam: ${alreadyExisted}`);
  console.log(`Falhas: ${totalErrors}`);
  console.log(`========================================\n`);

  // Atualização das 91 questões no Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    console.log('🔄 Sincronizando alternativas atualizadas diretamente com o Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let syncCount = 0;
    for (const item of manifest) {
      try {
        const { error } = await supabase
          .from('questions')
          .update({ options: item.options })
          .eq('id', item.id);

        if (error) {
          console.error(`  ❌ Erro ao atualizar questão ${item.code} (${item.id}):`, error.message);
        } else {
          syncCount++;
        }
      } catch (e) {
        console.error(`  ❌ Exceção ao atualizar questão ${item.code}:`, e.message);
      }
    }
    console.log(`✅ ${syncCount} / ${manifest.length} questões sincronizadas no Supabase com sucesso!\n`);
  } else {
    console.log('ℹ️ SUPABASE_SERVICE_ROLE_KEY não configurada no ambiente.');
  }

  // Salva manifesto atualizado com os caminhos locais
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

  // Salva resumo em disco para verificação do workflow
  fs.writeFileSync(
    path.join(process.cwd(), 'download_summary.txt'),
    `Download concluído: ${totalDownloaded} baixadas, ${alreadyExisted} existentes, ${totalErrors} erros.`
  );

  console.log('✅ Execução concluída com sucesso!');
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(0);
});

