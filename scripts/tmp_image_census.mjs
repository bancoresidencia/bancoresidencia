import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('=== SUPABASE IMAGE CENSUS ===');
  console.log('Target URL:', env.NEXT_PUBLIC_SUPABASE_URL);

  // 1. Total questions count
  const { count: totalQuestions, error: errTotal } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });
  console.log('Total questions in DB:', totalQuestions, errTotal || '');

  // 2. Questions where images is not null
  const { count: questionsWithImagesCol, error: errCol } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .not('images', 'is', null);
  console.log('Questions where `images IS NOT NULL`:', questionsWithImagesCol, errCol || '');

  // 3. Storage objects in 'questoes' bucket
  async function listAllFiles(bucket, prefix = '') {
    let allFiles = [];
    let offset = 0;
    const limit = 100;
    while (true) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      });
      if (error) {
        console.error('Error listing storage:', error);
        break;
      }
      if (!data || data.length === 0) break;
      for (const item of data) {
        const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
          // Folder
          const subFiles = await listAllFiles(bucket, itemPath);
          allFiles = allFiles.concat(subFiles);
        } else {
          allFiles.push({ ...item, fullPath: itemPath });
        }
      }
      if (data.length < limit) break;
      offset += limit;
    }
    return allFiles;
  }

  console.log('\n--- Listing storage bucket "questoes" ---');
  const storageFiles = await listAllFiles('questoes');
  console.log(`Total objects in "questoes" storage bucket: ${storageFiles.length}`);
  const storageImages = storageFiles.filter(f => /\.(webp|png|jpe?g|gif|svg)$/i.test(f.name));
  console.log(`Total image files in "questoes" storage bucket: ${storageImages.length}`);
  if (storageFiles.length > 0) {
    console.log('Sample storage files:');
    storageFiles.slice(0, 15).forEach(f => console.log(' -', f.fullPath, `(${f.metadata?.size || 0} bytes)`));
  }
}

main().catch(console.error);

