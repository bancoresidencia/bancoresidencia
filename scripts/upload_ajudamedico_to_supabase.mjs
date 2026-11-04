import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data', 'knowledge', 'extracao_ajudamedico');
const IMAGES_DIR = path.join(BASE_DIR, 'public', 'images', 'questions', 'ajudamedico');
const TARGET_SUBFOLDER = 'extracao_ajudamedico';
const BUCKET_NAME = 'medical-knowledge';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

function toS3Key(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._\-\/]/g, '_')
    .replace(/_+/g, '_');
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Credenciais do Supabase ausentes em .env.local');
    process.exit(1);
  }

  console.log('========================================================================');
  console.log('🚀 UPLOAD PRIVADO AJUDAMÉDICO -> SUPABASE STORAGE');
  console.log(`📦 Bucket Privado: ${BUCKET_NAME} (public: false - INACESSÍVEL A ALUNOS)`);
  console.log(`📁 Pasta Alvo:     ${TARGET_SUBFOLDER}/`);
  console.log('🛡️ Tabela Principal (questions): ZERO ALTERAÇÕES (100% Intacta)');
  console.log('========================================================================\n');

  const filesToUpload = [];

  // 1. Mapear JSONs de questões
  if (fs.existsSync(DATA_DIR)) {
    const jsonFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    for (const f of jsonFiles) {
      filesToUpload.push({
        type: 'question_json',
        localPath: path.join(DATA_DIR, f),
        s3Path: `${TARGET_SUBFOLDER}/questoes/${toS3Key(f)}`,
        contentType: 'application/json'
      });
    }
  }

  // 2. Mapear Imagens
  if (fs.existsSync(IMAGES_DIR)) {
    const imgFiles = fs.readdirSync(IMAGES_DIR).filter(f => !f.startsWith('.'));
    for (const f of imgFiles) {
      const ext = path.extname(f).toLowerCase();
      const contentType = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg';
      filesToUpload.push({
        type: 'image',
        localPath: path.join(IMAGES_DIR, f),
        s3Path: `${TARGET_SUBFOLDER}/imagens/${toS3Key(f)}`,
        contentType
      });
    }
  }

  const totalFiles = filesToUpload.length;
  console.log(`📊 Total de arquivos mapeados: ${totalFiles} (${filesToUpload.filter(x => x.type === 'question_json').length} JSONs, ${filesToUpload.filter(x => x.type === 'image').length} imagens)`);

  if (totalFiles === 0) {
    console.log('Nenhum arquivo encontrado para envio.');
    return;
  }

  const CONCURRENCY = 10;
  let idx = 0;
  let successCount = 0;
  let failCount = 0;
  let lastReport = Date.now();

  async function worker() {
    while (idx < filesToUpload.length) {
      const item = filesToUpload[idx++];
      const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${item.s3Path}`;
      const buf = fs.readFileSync(item.localPath);

      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': item.contentType,
            'x-upsert': 'true'
          },
          body: buf
        });

        if (res.ok) {
          successCount++;
        } else {
          const err = await res.text();
          console.warn(`   ⚠️ Erro ao subir (${path.basename(item.localPath)}): ${err.slice(0, 80)}`);
          failCount++;
        }
      } catch (err) {
        console.warn(`   ⚠️ Erro de rede (${path.basename(item.localPath)}): ${err.message}`);
        failCount++;
      }

      if (Date.now() - lastReport > 3000) {
        lastReport = Date.now();
        const pct = (((successCount + failCount) / totalFiles) * 100).toFixed(1);
        process.stdout.write(`⏳ Progresso: ${successCount + failCount}/${totalFiles} (${pct}%) | Sucessos: ${successCount} | Falhas: ${failCount}\r`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  // Criar manifesto de envio
  const manifest = {
    title: 'Manifesto de Upload Privado AjudaMédico',
    uploadedAt: new Date().toISOString(),
    bucket: BUCKET_NAME,
    folder: TARGET_SUBFOLDER,
    totalFiles,
    totalJsonQuestions: filesToUpload.filter(x => x.type === 'question_json').length,
    totalImages: filesToUpload.filter(x => x.type === 'image').length,
    successCount,
    failCount,
    visibility: 'RESTRICTO_ADMIN_NAO_PUBLICADO_A_ALUNOS'
  };

  const manifestPath = path.join(BASE_DIR, 'data', 'ajudamedico_upload_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n\n========================================================================');
  console.log('✅ UPLOAD CONCLUÍDO COM SUCESSO!');
  console.log(`   • Sucessos: ${successCount}/${totalFiles}`);
  console.log(`   • Falhas:   ${failCount}`);
  console.log(`   • Local no Storage:  ${BUCKET_NAME}/${TARGET_SUBFOLDER}/`);
  console.log(`   • Status dos Alunos: INTACTO (Zero questões na tabela pública)`);
  console.log(`   • Manifesto salvo em: data/ajudamedico_upload_manifest.json`);
  console.log('========================================================================\n');
}

main().catch(console.error);

