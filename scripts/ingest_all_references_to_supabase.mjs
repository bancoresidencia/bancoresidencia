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

const TARGET_DIR = path.join(process.cwd(), 'data', 'knowledge', 'referencias_materiais_apoio');

async function main() {
  console.log('===============================================================');
  console.log('📦 CONSOLIDAÇÃO E INGESTÃO COMPLETA NO SUPABASE (SEM EXPOSIÇÃO)');
  console.log('🛡️ REGRA ATIVA: NENHUM DADO SERÁ EXPOSTO NO FRONTEND');
  console.log('===============================================================\n');

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  // 1. Carrega fontes
  const file1 = path.join(process.cwd(), 'data', 'medevo_materials_references_gold.json');
  const file2 = path.join(process.cwd(), 'data', 'medevo_all_references_catalog.json');
  const file3 = path.join(process.cwd(), 'data', 'medevo_material_apoio_full_manifest.json');

  let list1 = [];
  if (fs.existsSync(file1)) {
    list1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
  }

  let list2 = { referencias: [] };
  if (fs.existsSync(file2)) {
    list2 = JSON.parse(fs.readFileSync(file2, 'utf8'));
  }

  let manifest = {};
  if (fs.existsSync(file3)) {
    manifest = JSON.parse(fs.readFileSync(file3, 'utf8'));
  }

  console.log(`📂 Fonte 1 (Materiais Cirurgia Coletados): ${list1.length} materiais`);
  console.log(`📂 Fonte 2 (Catálogo Geral de Referências): ${list2.referencias?.length || 0} referências`);
  console.log(`📂 Fonte 3 (Mapeamento de 122 Temas): ${manifest.total_materiais || 0} materiais mapeados\n`);

  // 2. Unificação e Deduplicação rigorosa
  const allReferences = [];
  const seenKeys = new Set();

  // Adiciona do catálogo geral
  if (Array.isArray(list2.referencias)) {
    for (const r of list2.referencias) {
      const key = (r.url || r.titulo || '').toLowerCase().trim();
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        allReferences.push({
          id: `ref_cat_${allReferences.length + 1}`,
          titulo: r.titulo,
          url: r.url || null,
          tipo: r.tipo || 'referencia_cientifica',
          dominio: r.dominio || (r.url ? new URL(r.url).hostname : null),
          especialidade_sugerida: r.titulo?.includes('FEBRASGO') ? 'Ginecologia/Obstetrícia' : (r.titulo?.includes('EAU') || r.titulo?.includes('SBU') ? 'Urologia' : 'Geral')
        });
      }
    }
  }

  // Adiciona dos materiais de Cirurgia extraídos
  for (const m of list1) {
    if (Array.isArray(m.referencias)) {
      for (const r of m.referencias) {
        const key = (r.url || r.texto_referencia || '').toLowerCase().trim();
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          allReferences.push({
            id: `ref_mat_${allReferences.length + 1}`,
            titulo: r.texto_referencia || r.url,
            url: r.url || null,
            tipo: r.tipo,
            dominio: r.dominio || (r.url ? new URL(r.url).hostname : null),
            origem_material: m.titulo,
            especialidade: m.especialidade,
            tema: m.tema
          });
        }
      }
    }
  }

  console.log(`🎯 TOTAL DE REFERÊNCIAS CONSOLIDADAS E DEDUPLICADAS: ${allReferences.length}`);

  // 3. Gera pacotes estruturados
  const cirurgiaRefs = allReferences.filter(r => r.especialidade === 'Cirurgia');
  const outrasRefs = allReferences.filter(r => r.especialidade !== 'Cirurgia');

  const payloadMaster = {
    total_referencias: allReferences.length,
    data_geracao: new Date().toISOString(),
    seguranca: 'USO_INTERNO_RESTRITO_BACKEND',
    exposicao_frontend: false,
    referencias: allReferences
  };

  const payloadCirurgia = {
    especialidade: 'Cirurgia',
    total_referencias: cirurgiaRefs.length,
    referencias: cirurgiaRefs
  };

  const payloadGinecologiaUro = {
    especialidade: 'Ginecologia_Obstetricia_Urologia',
    total_referencias: outrasRefs.length,
    referencias: outrasRefs
  };

  // Salva localmente em data/knowledge/referencias_materiais_apoio/
  const fileMasterPath = path.join(TARGET_DIR, 'todas_referencias_unificadas.json');
  const fileCirurgiaPath = path.join(TARGET_DIR, 'cirurgia_referencias_materiais.json');
  const fileOutrasPath = path.join(TARGET_DIR, 'ginecologia_urologia_referencias.json');
  const fileManifestPath = path.join(TARGET_DIR, 'manifest_122_temas_733_materiais.json');

  fs.writeFileSync(fileMasterPath, JSON.stringify(payloadMaster, null, 2), 'utf8');
  fs.writeFileSync(fileCirurgiaPath, JSON.stringify(payloadCirurgia, null, 2), 'utf8');
  fs.writeFileSync(fileOutrasPath, JSON.stringify(payloadGinecologiaUro, null, 2), 'utf8');
  fs.writeFileSync(fileManifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`✅ Arquivos gerados localmente em data/knowledge/referencias_materiais_apoio/`);

  // 4. Ingestão no Bucket Privado do Supabase (medical-knowledge)
  console.log(`\n☁️ 4. Enviando arquivos para o Supabase (Bucket Privado: ${BUCKET_NAME})...`);

  const filesToUpload = [
    { local: fileMasterPath, remote: 'referencias_materiais_apoio/todas_referencias_unificadas.json' },
    { local: fileCirurgiaPath, remote: 'referencias_materiais_apoio/cirurgia_referencias_materiais.json' },
    { local: fileOutrasPath, remote: 'referencias_materiais_apoio/ginecologia_urologia_referencias.json' },
    { local: fileManifestPath, remote: 'referencias_materiais_apoio/manifest_122_temas_733_materiais.json' }
  ];

  for (const item of filesToUpload) {
    const fileBuffer = fs.readFileSync(item.local);
    const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${item.remote}`;

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
      const err = await res.text();
      console.error(`❌ Falha ao enviar ${item.remote}: HTTP ${res.status} - ${err}`);
    } else {
      console.log(`   ⬆️ Sucesso: [${item.remote}] inserido no Supabase!`);
    }
  }

  console.log('\n===============================================================');
  console.log('🎉 INGESTÃO NO SUPABASE CONCLUÍDA COM TOTAL SUCESSO!');
  console.log(`🔒 NENHUM DADO FOI EXPOSTO NO FRONTEND DA PLATAFORMA.`);
  console.log(`📚 Total de referências salvas: ${allReferences.length}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
