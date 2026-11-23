import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const totalPadraoOuroNow = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE commentary LIKE '%Take-Home%'").get().c;
const diretoPadraoOuroNow = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE modalidade = 'Acesso Direto' AND commentary LIKE '%Take-Home%'").get().c;

console.log({ totalPadraoOuroNow, diretoPadraoOuroNow });
