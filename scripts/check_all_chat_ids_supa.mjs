import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const allChatIds = [
  '10e76580-a740-4708-b318-48b12c7fe597',
  'c1b750cf-9f7f-46f9-866f-8e860bf436d0',
  '3a13087b-ffd2-4422-9fed-b97e688341c7',
  'ffed3e25-82f1-4cf2-ba32-9ad49fcf97cf',
  '69cd133a-45a8-4a3d-9060-21791b7958c6',
  '61811d7d-16a6-4def-a384-0d0823c5dcc4',
  '4e1540f8-eecf-4ebf-a1a3-69a4c5e570b2',
  '0b257dbd-0cac-4bc4-90ff-0baf889e4bd4',
  '57ee1182-b696-4151-91d8-ea21c1a20aa9',
  'd025af0f-10d4-409b-b91a-7bb63b3a1a2e',
  '60aa48ce-2430-4f7a-bfab-f5c48b3a4d85',
  '568ebfb1-9c70-44e8-8ab9-61b2c40cca4f',
  '5e5f6e88-46e8-4b27-9c72-f2ddfb668030',
  '6c998a2d-0c7c-4787-8a07-731c5c2f745e',
  '17004dcf-f0b1-4106-8196-56a2b471ca7a',
  '75a8fb9f-0851-4171-899e-37c5a0ec341e',
  '85ac3a97-5436-4382-87ea-8ae4fed8fde6',
  '3202ab2d-e6d7-42e4-8e4e-30e628a1b810'
];

async function checkStatus() {
  console.log(`Checking ${allChatIds.length} IDs in Supabase...`);
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, commentary, options')
    .in('id', allChatIds);

  if (error) {
    console.error('Error querying Supabase:', error);
    return;
  }

  console.log(`Retrieved ${data.length} records from Supabase:`);
  const hasComment = data.filter(d => !!d.commentary && d.commentary.trim().length > 0);
  const noComment = data.filter(d => !d.commentary || d.commentary.trim().length === 0);

  console.log(`- With commentary in Supabase: ${hasComment.length}`);
  console.log(`- WITHOUT commentary in Supabase: ${noComment.length}`);
  noComment.forEach(d => console.log(`   Pending ID: ${d.id} (${d.code})`));
}

checkStatus().catch(console.error);

