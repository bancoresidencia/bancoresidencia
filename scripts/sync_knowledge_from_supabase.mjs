import fs from 'fs';
import path from 'path';

// Carrega .env.local se existir
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = 'medical-knowledge';
const KNOWLEDGE_DIR = path.join(process.cwd(), 'data', 'knowledge');
const CATALOG_PATH = path.join(process.cwd(), 'src', 'data', 'medicalKnowledgeCatalog.json');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_URL ou credenciais de acesso do Supabase ausentes no .env.local');
  process.exit(1);
}

if (!fs.existsSync(CATALOG_PATH)) {
  console.error('❌ ERRO: src/data/medicalKnowledgeCatalog.json não encontrado.');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

console.log('\n======================================================');
console.log('📥 SINCRONIZADOR DA BASE DE CONHECIMENTO (SUPABASE -> LOCAL)');
console.log('======================================================');
console.log(`🎯 Bucket: ${BUCKET_NAME}`);
console.log(`📚 Total de Livros no Catálogo: ${catalog.totalBooks}`);
console.log(`🧠 Total de Blocos Teóricos: ${catalog.totalChunks.toLocaleString('pt-BR')}\n`);

async function downloadBook(storagePath) {
  const url = `${SUPABASE_URL}/storage/v1/object/authenticated/${BUCKET_NAME}/${storagePath}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });

  if (!res.ok) {
    // Tenta rota padrão caso pública ou permissão direta
    const fallbackUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${storagePath}`;
    const fbRes = await fetch(fallbackUrl, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (!fbRes.ok) {
      throw new Error(`HTTP ${fbRes.status}: ${await fbRes.text()}`);
    }
    return await fbRes.json();
  }

  return await res.json();
}

async function run() {
  const specialtyFilter = process.argv[2]; // opcional: node sync_knowledge_from_supabase.mjs Cardiologia
  let downloaded = 0;
  let alreadyExists = 0;
  let failed = 0;

  for (const [specName, specData] of Object.entries(catalog.specialties)) {
    if (specialtyFilter && specName.toLowerCase() !== specialtyFilter.toLowerCase()) {
      continue;
    }

    const targetDir = path.join(KNOWLEDGE_DIR, specName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    console.log(`📂 Especialidade: ${specName} (${specData.booksCount} livros)`);

    for (const book of specData.books) {
      const localFilePath = path.join(targetDir, book.fileName);
      if (fs.existsSync(localFilePath)) {
        alreadyExists++;
        continue;
      }

      try {
        const content = await downloadBook(book.storagePath);
        fs.writeFileSync(localFilePath, JSON.stringify(content, null, 2), 'utf8');
        downloaded++;
        console.log(`   ⬇️ Baixado com sucesso: ${book.fileName} (${book.totalChunks} chunks)`);
      } catch (err) {
        console.error(`   ⚠️ Falha ao baixar ${book.fileName}: ${err.message}`);
        failed++;
      }
    }
  }

  console.log('\n======================================================');
  console.log('🏁 SINCRONIZAÇÃO CONCLUÍDA!');
  console.log(`⬇️ Baixados nesta execução: ${downloaded}`);
  console.log(`⏭️ Já existiam localmente:  ${alreadyExists}`);
  console.log(`❌ Falhas:                  ${failed}`);
  console.log('======================================================\n');
}

run().catch(console.error);
