import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { createClient } from '@supabase/supabase-js';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'alternativas');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const MANIFEST_PATH = path.join(process.cwd(), 'scripts', 'all_options_images_manifest.json');

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} para ${url}`));
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(resolve);
        });
        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Timeout ao baixar ${url}`));
    });
  });
}

async function main() {
  console.log('🚀 Iniciando download anônimo das imagens via GitHub Actions Runner...');
  console.log(`📁 Destino: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifesto não encontrado: ${MANIFEST_PATH}`);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`📋 Total de questões para processar: ${manifest.length}`);

  let totalDownloaded = 0;
  let totalErrors = 0;

  for (const item of manifest) {
    for (const img of item.imageOptions) {
      const destPath = path.join(OUTPUT_DIR, img.fileName);
      try {
        if (!fs.existsSync(destPath) || fs.statSync(destPath).size === 0) {
          await downloadFile(img.originalUrl, destPath);
          totalDownloaded++;
          console.log(`  ✓ [${item.code} Alt ${img.letter}] Baixado -> ${img.fileName}`);
          await new Promise((r) => setTimeout(r, 100));
        } else {
          console.log(`  ⚡ [${item.code} Alt ${img.letter}] Já existe -> ${img.fileName}`);
        }

        // Atualiza a opção no array da questão
        const targetOpt = item.options.find((o) => o.letter === img.letter);
        if (targetOpt) {
          targetOpt.text = img.localUrl;
        }
      } catch (err) {
        totalErrors++;
        console.error(`  ❌ [${item.code} Alt ${img.letter}] Erro: ${err.message}`);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 Download de imagens concluído!`);
  console.log(`Baixadas: ${totalDownloaded}`);
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
      const { error } = await supabase
        .from('questions')
        .update({ options: item.options })
        .eq('id', item.id);

      if (error) {
        console.error(`  ❌ Erro ao atualizar questão ${item.code} (${item.id}):`, error.message);
      } else {
        syncCount++;
      }
    }
    console.log(`✅ ${syncCount} / ${manifest.length} questões sincronizadas no Supabase com sucesso!\n`);
  } else {
    console.log('ℹ️ SUPABASE_SERVICE_ROLE_KEY não configurada no ambiente.');
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
