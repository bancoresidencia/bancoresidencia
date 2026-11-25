import fs from 'fs';

const dec = JSON.parse(fs.readFileSync('data/supabase_tables/image_watermark_decisions.json', 'utf8'));
const medqActions = dec.medq_actions || {};

const entries = Object.entries(medqActions);
console.log('Total medq_actions:', entries.length);
console.log('Sample entry:', entries.slice(0, 3));
