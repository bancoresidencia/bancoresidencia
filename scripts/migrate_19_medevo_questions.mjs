import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Credenciais do Supabase ausentes no ambiente.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const MANIFEST_PATH = path.join(process.cwd(), 'src', 'data', 'medevoAuditManifest.json');

async function run() {
  console.log('===============================================================');
  console.log('🚀 INICIANDO MIGRAÇÃO AUTOMÁTICA DAS 19 QUESTÕES COM MEDEVO');
  console.log('===============================================================\n');

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifesto não encontrado em ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const questionsInManifest = manifestData.questions || [];

  // Filtra as questões que têm menção nas opções (alternativas)
  const targetQuestions = questionsInManifest.filter(q => 
    (q.textHits && q.textHits.some(t => t.field.startsWith('options'))) || 
    (q.images && q.images.some(i => i.field.startsWith('options')))
  );

  console.log(`📋 Total de questões selecionadas no manifesto: ${targetQuestions.length}`);

  const targetIds = targetQuestions.map(q => q.id);

  // Busca o estado atual no Supabase
  const { data: dbQuestions, error: fetchErr } = await supabase
    .from('questions')
    .select('id, code, banca, year, statement, commentary, options, images')
    .in('id', targetIds);

  if (fetchErr || !dbQuestions) {
    console.error('Erro ao buscar questões no Supabase:', fetchErr);
    process.exit(1);
  }

  console.log(`📡 Questões retornadas do Supabase: ${dbQuestions.length}\n`);

  // Cache para evitar re-upload da mesma imagem se reutilizada
  const urlCache = new Map(); // originalUrl -> newPublicUrl
  let totalImagesUploaded = 0;
  let totalQuestionsUpdated = 0;

  for (let qIdx = 0; qIdx < dbQuestions.length; qIdx++) {
    const q = dbQuestions[qIdx];
    const code = q.code || q.id;
    const safeCode = code.replace(/[^a-zA-Z0-9_-]/g, '_');

    let hasChanges = false;
    let updatedOptions = Array.isArray(q.options) ? JSON.parse(JSON.stringify(q.options)) : [];
    let updatedImages = Array.isArray(q.images) 
      ? [...q.images] 
      : (typeof q.images === 'string' && q.images ? [q.images] : []);

    console.log(`[${qIdx + 1}/${dbQuestions.length}] Processando ${code} (${q.banca} - ${q.year})...`);

    // 1. Processa Alternativas (Options)
    for (let optIdx = 0; optIdx < updatedOptions.length; optIdx++) {
      const opt = updatedOptions[optIdx];
      const optText = opt.text || '';

      if (typeof optText === 'string' && optText.toLowerCase().includes('medevo')) {
        let newUrl = urlCache.get(optText);

        if (!newUrl) {
          try {
            console.log(`  ⬇️  Baixando alternativa [${opt.letter}]: ${optText.slice(0, 75)}...`);
            const res = await fetch(optText);
            if (!res.ok) {
              console.warn(`  ⚠️ Falha ao baixar ${optText}: status ${res.status}`);
              continue;
            }

            const buffer = Buffer.from(await res.arrayBuffer());
            const contentType = res.headers.get('content-type') || 'image/webp';
            let ext = 'webp';
            if (contentType.includes('png')) ext = 'png';
            else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';

            const storagePath = `remedied/${safeCode}_opt_${opt.letter}.${ext}`;

            console.log(`  ⬆️  Enviando para Supabase: questoes/${storagePath}`);
            const { error: uploadErr } = await supabase.storage
              .from('questoes')
              .upload(storagePath, buffer, {
                contentType,
                upsert: true
              });

            if (uploadErr) {
              console.error(`  ❌ Erro no upload Supabase Storage:`, uploadErr.message);
              continue;
            }

            newUrl = `${SUPABASE_URL}/storage/v1/object/public/questoes/${storagePath}`;
            urlCache.set(optText, newUrl);
            totalImagesUploaded++;
          } catch (err) {
            console.error(`  ❌ Erro no download/upload da opção [${opt.letter}]:`, err.message);
            continue;
          }
        }

        if (newUrl) {
          opt.text = newUrl;
          hasChanges = true;
          console.log(`  ✅ Opção [${opt.letter}] substituída por URL limpa.`);
        }
      }
    }

    // 2. Processa Imagens do Enunciado (images)
    for (let imgIdx = 0; imgIdx < updatedImages.length; imgIdx++) {
      const imgUrl = updatedImages[imgIdx];
      if (typeof imgUrl === 'string' && imgUrl.toLowerCase().includes('medevo')) {
        let newUrl = urlCache.get(imgUrl);

        if (!newUrl) {
          try {
            console.log(`  ⬇️  Baixando imagem do enunciado: ${imgUrl.slice(0, 75)}...`);
            const res = await fetch(imgUrl);
            if (!res.ok) {
              console.warn(`  ⚠️ Falha ao baixar ${imgUrl}: status ${res.status}`);
              continue;
            }

            const buffer = Buffer.from(await res.arrayBuffer());
            const contentType = res.headers.get('content-type') || 'image/webp';
            let ext = 'webp';
            if (contentType.includes('png')) ext = 'png';
            else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';

            const storagePath = `remedied/${safeCode}_stmt_${imgIdx + 1}.${ext}`;

            console.log(`  ⬆️  Enviando para Supabase: questoes/${storagePath}`);
            const { error: uploadErr } = await supabase.storage
              .from('questoes')
              .upload(storagePath, buffer, {
                contentType,
                upsert: true
              });

            if (uploadErr) {
              console.error(`  ❌ Erro no upload Supabase Storage:`, uploadErr.message);
              continue;
            }

            newUrl = `${SUPABASE_URL}/storage/v1/object/public/questoes/${storagePath}`;
            urlCache.set(imgUrl, newUrl);
            totalImagesUploaded++;
          } catch (err) {
            console.error(`  ❌ Erro no download/upload da imagem ${imgIdx + 1}:`, err.message);
            continue;
          }
        }

        if (newUrl) {
          updatedImages[imgIdx] = newUrl;
          hasChanges = true;
          console.log(`  ✅ Imagem ${imgIdx + 1} do enunciado substituída por URL limpa.`);
        }
      }
    }

    // 3. Atualiza a questão no banco de dados Supabase
    if (hasChanges) {
      const { error: updateErr } = await supabase
        .from('questions')
        .update({
          options: updatedOptions,
          images: updatedImages
        })
        .eq('id', q.id);

      if (updateErr) {
        console.error(`  ❌ Falha ao atualizar questão ${code} no Supabase:`, updateErr.message);
      } else {
        totalQuestionsUpdated++;
        console.log(`  🎉 Questão ${code} atualizada com sucesso no banco!\n`);
      }
    } else {
      console.log(`  ℹ️ Nenhuma alteração pendente para ${code}.\n`);
    }
  }

  // 4. Atualiza o manifesto local para marcar essas questões como higienizadas
  console.log('🔄 Sincronizando manifesto local medevoAuditManifest.json...');
  for (const item of manifestData.questions) {
    if (targetIds.includes(item.id)) {
      item.hasTextHit = false;
      item.textHits = [];
      if (Array.isArray(item.images)) {
        item.images = item.images.map(img => {
          const cached = urlCache.get(img.url);
          return {
            ...img,
            url: cached || img.url
          };
        });
      }
      item.hasImageHit = item.images.some(img => img.url.toLowerCase().includes('medevo'));
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestData, null, 2), 'utf8');
  console.log('✅ Manifesto local sincronizado com sucesso!');

  console.log('\n===============================================================');
  console.log('🏁 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log(`🖼️ Total de imagens clonadas no Supabase Storage: ${totalImagesUploaded}`);
  console.log(`📝 Total de questões atualizadas no banco: ${totalQuestionsUpdated}`);
  console.log('===============================================================\n');
}

run().catch(err => {
  console.error('Erro fatal na execução:', err);
  process.exit(1);
});

