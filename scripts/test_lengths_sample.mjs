import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLengths() {
  console.log('Testing commentary characteristics in Supabase questions_direto...');

  // 1. Sample of 100 questions from questions_direto
  const { data, error } = await supabase
    .from('questions_direto')
    .select('id, code, has_gabarito, is_anulada, commentary')
    .limit(100);

  if (error) {
    console.error('Error:', error);
    return;
  }

  let emptyCount = 0;
  let shortCount = 0; // < 200 chars
  let mediumCount = 0; // 200 - 600 chars
  let goldStructuredCount = 0; // has Take-Home Message or > 600 chars
  
  for (const q of data) {
    const c = q.commentary ? q.commentary.trim() : '';
    if (!c) emptyCount++;
    else if (c.length < 200) shortCount++;
    else if (c.length < 600) mediumCount++;
    else goldStructuredCount++;
  }

  console.log('Sample of 100 questions:');
  console.log(`- Empty: ${emptyCount}`);
  console.log(`- Short (<200 chars): ${shortCount}`);
  console.log(`- Medium (200-600 chars): ${mediumCount}`);
  console.log(`- Gold/Structured (>=600 chars): ${goldStructuredCount}`);
}

testLengths();
