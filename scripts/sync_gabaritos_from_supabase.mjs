import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const MANIFEST_PATH = path.join(BASE_DIR, 'data', 'gabarito_das_questoes_manifest.json');
const TARGET_DIR = path.join(BASE_DIR, 'data', 'knowledge', 'gabarito_das_questoes');

// Carrega variáveis do Supabase
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

async function sync() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Manifesto não encontrado em data/gabarito_das_questoes_manifest.json');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log('🔄 Sincronizando base de gabaritos do Supabase Storage para o ambiente local...');
  console.log(`📦 Bucket: ${BUCKET_NAME} | Total Livros: ${manifest.totalBooks}`);

  let downloaded = 0;
  let alreadyPresent = 0;

  for (const spec of manifest.specialties) {
    const specDir = path.join(TARGET_DIR, spec.specialty);
    if (!fs.existsSync(specDir)) {
      fs.mkdirSync(specDir, { recursive: true });
    }

    for (const book of spec.books) {
      const fileName = path.basename(book.supabasePath);
      const localFilePath = path.join(specDir, fileName);

      if (fs.existsSync(localFilePath)) {
        alreadyPresent++;
        continue;
      }

      const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${book.supabasePath}`;
      try {
        const res = await fetch(fileUrl, {
          headers: SERVICE_KEY ? { 'Authorization': `Bearer ${SERVICE_KEY}` } : {}
        });

        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(localFilePath, buffer);
          downloaded++;
          console.log(`   ⬇️ Baixado: [${spec.specialty}] ${book.theme}`);
        } else {
          console.warn(`   ⚠️ Erro ao baixar ${book.supabasePath}: HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`   ⚠️ Falha de rede para ${book.theme}:`, err.message);
      }
    }
  }

  console.log('\n======================================================');
  console.log('✅ SINCRONIZAÇÃO CONCLUÍDA!');
  console.log(`📂 Arquivos já presentes: ${alreadyPresent}`);
  console.log(`📥 Novos arquivos baixados: ${downloaded}`);
  console.log(`📁 Local: data/knowledge/gabarito_das_questoes/`);
  console.log('======================================================\n');
}

sync().catch(console.error);
