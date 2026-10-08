import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { createClient } from '@supabase/supabase-js';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'alternativas');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = [
  'data/obstetricia_final_questions.json',
  'data/cirurgia_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/clinica_medica_final_questions.json',
  'data/ginecologia_final_questions.json'
];

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

const isImageUrl = (str) => {
  if (!str) return false;
  const t = str.trim();
  return (
    (t.startsWith('http://') || t.startsWith('https://')) &&
    (/\.(webp|png|jpe?g|gif|svg)(\?.*)?$/i.test(t) ||
      t.includes('/storage/v1/object/public/') ||
      t.includes('/alternativas/'))
  );
};

function getFileExtension(url) {
  try {
    const clean = url.split('?')[0];
    const ext = path.extname(clean).toLowerCase();
    if (ext && ['.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      return ext;
    }
  } catch (e) {}
  return '.webp';
}

async function main() {
  console.log('🚀 Iniciando download anônimo de imagens das alternativas...');
  console.log(`📁 Diretório de destino: ${OUTPUT_DIR}\n`);

  let totalDownloaded = 0;
  let totalErrors = 0;
  const updatedQuestionsForSupabase = [];

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    console.log(`📖 Processando ${filePath}...`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fileModified = false;

    for (const q of questions) {
      if (!Array.isArray(q.options) || q.options.length === 0) continue;
      let questionModified = false;

      for (const opt of q.options) {
        if (isImageUrl(opt.text)) {
          const originalUrl = opt.text.trim();
          const ext = getFileExtension(originalUrl);
          const cleanCode = (q.code || q.id || 'q')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .toLowerCase();
          const fileName = `${cleanCode}_alt_${opt.letter}${ext}`;
          const destPath = path.join(OUTPUT_DIR, fileName);
          const localUrl = `/images/alternativas/${fileName}`;

          try {
            if (!fs.existsSync(destPath) || fs.statSync(destPath).size === 0) {
              await downloadFile(originalUrl, destPath);
              totalDownloaded++;
              console.log(`  ✓ [${q.code} Alt ${opt.letter}] Baixado -> ${fileName}`);
              // Pequena pausa para requisições suaves
              await new Promise((r) => setTimeout(r, 80));
            } else {
              console.log(`  ⚡ [${q.code} Alt ${opt.letter}] Já existia -> ${fileName}`);
            }

            opt.text = localUrl;
            questionModified = true;
            fileModified = true;
          } catch (err) {
            totalErrors++;
            console.error(`  ❌ [${q.code} Alt ${opt.letter}] Erro: ${err.message}`);
          }
        }
      }

      if (questionModified) {
        updatedQuestionsForSupabase.push({
          id: q.id,
          options: q.options
        });
      }
    }

    if (fileModified) {
      fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
      console.log(`💾 ${filePath} atualizado com os novos caminhos locais.\n`);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 Download concluído!`);
  console.log(`Total baixadas: ${totalDownloaded}`);
  console.log(`Total de falhas: ${totalErrors}`);
  console.log(`Total de questões para atualizar no Supabase: ${updatedQuestionsForSupabase.length}`);
  console.log(`========================================\n`);

  // Atualização no Supabase se as credenciais estiverem disponíveis no ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && updatedQuestionsForSupabase.length > 0) {
    console.log('🔄 Sincronizando alternativas atualizadas com o Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let syncCount = 0;
    for (const item of updatedQuestionsForSupabase) {
      const { error } = await supabase
        .from('questions')
        .update({ options: item.options })
        .eq('id', item.id);

      if (error) {
        console.error(`  ❌ Erro ao atualizar questão ${item.id} no Supabase:`, error.message);
      } else {
        syncCount++;
      }
    }
    console.log(`✅ ${syncCount} questões sincronizadas com o Supabase com sucesso!`);
  } else {
    console.log('ℹ️ Credenciais do Supabase não encontradas no ambiente de execução. As atualizações foram gravadas nos arquivos JSON locais.');
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
