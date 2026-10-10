import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const TARGET_DIR = path.join(BASE_DIR, 'data', 'knowledge', 'extracao_de_questoes');
const TARGET_SUBFOLDER = 'extracao_de_questoes';
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
    console.error('❌ Supabase credentials missing');
    process.exit(1);
  }

  console.log('🚀 Sincronizando todos os arquivos de extracao_de_questoes para o Supabase Storage...');
  console.log(`📦 Bucket: ${BUCKET_NAME} | Pasta: ${TARGET_SUBFOLDER}/`);

  let totalFiles = 0;
  let successCount = 0;
  let failCount = 0;

  const filesToUpload = [];

  for (const spec of fs.readdirSync(TARGET_DIR)) {
    const specDir = path.join(TARGET_DIR, spec);
    if (!fs.statSync(specDir).isDirectory()) continue;
    for (const f of fs.readdirSync(specDir)) {
      if (!f.endsWith('.json')) continue;
      filesToUpload.push({
        specialty: spec,
        fileName: f,
        localPath: path.join(specDir, f)
      });
    }
  }

  totalFiles = filesToUpload.length;
  console.log(`📁 Total de arquivos para upload: ${totalFiles}`);

  const CONCURRENCY = 8;
  let idx = 0;

  async function worker() {
    while (idx < filesToUpload.length) {
      const cur = filesToUpload[idx++];
      const s3Path = `${TARGET_SUBFOLDER}/${toS3Key(cur.specialty)}/${toS3Key(cur.fileName)}`;
      const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${s3Path}`;
      const buf = fs.readFileSync(cur.localPath);

      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'x-upsert': 'true'
          },
          body: buf
        });

        if (res.ok) {
          successCount++;
        } else {
          const err = await res.text();
          console.warn(`   ⚠️ Erro upload (${cur.fileName}): ${err.slice(0, 100)}`);
          failCount++;
        }
      } catch (err) {
        console.warn(`   ⚠️ Erro de rede (${cur.fileName}): ${err.message}`);
        failCount++;
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log('\n===============================================================');
  console.log(`✅ Sincronização Supabase Concluída!`);
  console.log(`   • Sucesso: ${successCount}/${totalFiles} arquivos`);
  console.log(`   • Falhas:  ${failCount}`);
  console.log('===============================================================\n');
}

main().catch(console.error);
