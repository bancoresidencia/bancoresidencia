import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRpc() {
  // Let's test calling query_study_questions
  const { data, error } = await supabase.rpc('query_study_questions', {
    p_filters: {},
    p_mode: 'list',
    p_page: 1,
    p_size: 5
  });

  console.log('query_study_questions test:', { error, dataLength: data ? data.length : 0 });
  if (data && data.length > 0) {
    console.log('Sample question from query_study_questions:');
    console.log(data[0]);
  }
}

checkRpc();
