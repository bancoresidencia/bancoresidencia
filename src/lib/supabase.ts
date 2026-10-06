import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bHVoYXJ4bG1scWhka3FyamJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNDkxNzcsImV4cCI6MjEwNjgyNTE3N30.kT9521OP3j5yTmnQTqF6Wzl29xc6ZjV2UzF8EB_5xrI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
