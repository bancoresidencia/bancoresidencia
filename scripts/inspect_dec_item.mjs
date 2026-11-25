import fs from 'fs';

const dec = JSON.parse(fs.readFileSync('data/supabase_tables/image_watermark_decisions.json', 'utf8'));
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));

const testId = 'questions_690c186d-6980-444d-8246-4a30104d024e';
console.log('Decisions action for testId:', dec.medq_actions ? dec.medq_actions[testId] : 'no actions');

const catItem = cat.catalog ? cat.catalog.find(c => c.id === testId) : null;
console.log('Catalog item for testId:', catItem);
