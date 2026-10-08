import fs from 'fs';
import path from 'path';

// Load .env.local
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
const KNOWLEDGE_DIR = path.join(process.cwd(), 'data', 'knowledge');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente.');
  process.exit(1);
}

// Coleta todos os arquivos JSON locais
const allFiles = [];
const specialties = fs.readdirSync(KNOWLEDGE_DIR).filter(d => fs.statSync(path.join(KNOWLEDGE_DIR, d)).isDirectory());

function toS3Key(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._\-\/]/g, '_')
    .replace(/_+/g, '_');
}

for (const spec of specialties) {
  const specDir = path.join(KNOWLEDGE_DIR, spec);
  const jsonFiles = fs.readdirSync(specDir).filter(f => f.endsWith('.json'));
  for (const f of jsonFiles) {
    const s3Path = `${toS3Key(spec)}/${toS3Key(f)}`;
    allFiles.push({
      specialty: spec,
      fileName: f,
      localPath: path.join(specDir, f),
      storagePath: s3Path,
      cleanStoragePath: `${spec}/${f}`
    });
  }
}

console.log(`\n======================================================`);
console.log(`🚀 INICIANDO UPLOAD DA BASE DE CONHECIMENTO PARA O SUPABASE`);
console.log(`======================================================`);
console.log(`📦 Total de Livros Identificados: ${allFiles.length}`);
console.log(`📁 Bucket de Destino: ${BUCKET_NAME} (Privado)\n`);

async function uploadFile(item) {
  const fileBuffer = fs.readFileSync(item.localPath);
  const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${item.storagePath}`;

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
    const errText = await res.text();
    throw new Error(`Status ${res.status}: ${errText}`);
  }
  return true;
}

async function run() {
  let uploaded = 0;
  let failed = 0;
  const concurrency = 6;
  const queue = [...allFiles];

  async function worker(workerId) {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      try {
        await uploadFile(item);
        uploaded++;
        if (uploaded % 25 === 0 || uploaded === allFiles.length) {
          console.log(`   ⬆️ [${uploaded}/${allFiles.length}] Enviado: ${item.specialty} -> ${item.fileName}`);
        }
      } catch (err) {
        console.error(`   ⚠️ Falha ao enviar ${item.cleanStoragePath}: ${err.message}`);
        failed++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  console.log(`\n======================================================`);
  console.log(`🎉 UPLOAD CONCLUÍDO!`);
  console.log(`✅ Sucessos: ${uploaded}`);
  console.log(`❌ Falhas:   ${failed}`);
  console.log(`======================================================\n`);
}

run();
