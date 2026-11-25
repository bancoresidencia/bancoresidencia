import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];
const uspItems = cat.filter(c => c.banca && c.banca.includes('USP/HCFMUSP'));

function cleanText(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const remainingMap = new Map();
for (const item of uspItems) {
  const row = db.prepare('SELECT id, statement, year FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row) {
    const norm = cleanText(row.statement);
    remainingMap.set(row.id, { ...row, norm, p30: norm.substring(0, 30) });
  }
}

const API_URL = "https://question-hub-bff.sanar.com.br/lunar/questions";
const TOKEN = "jMI0WGzXmML33e7cIm9D5JEf-JrTdXcH_QL4odQrgRk";
const uspId = "438e2592-cecd-4b9c-8c66-701f0464b120";

let hasImgCount = 0;
for (let skip = 0; skip < 990; skip += 50) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOKEN}` },
    body: JSON.stringify({ institution: { id: uspId }, limit: 50, skip, order: "DESC" })
  });
  if (!res.ok) break;
  const json = await res.json();
  const list = json.data || [];
  if (list.length === 0) break;

  for (const sq of list) {
    const sNorm = cleanText(sq.statement);
    for (const [id, ourQ] of remainingMap.entries()) {
      if (sNorm.includes(ourQ.p30)) {
        const fullText = (sq.statement || '') + ' ' + (sq.study_case || '');
        const imgs = fullText.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
        const allHttp = fullText.match(/https?:\/\/[^\s"'>]+/gi) || [];
        console.log(`Matched ${id}: imgs=${imgs.length}, allHttp=${allHttp.length}`);
        if (imgs.length > 0) {
          hasImgCount++;
          console.log(`  Img tags:`, imgs);
        } else if (allHttp.length > 0) {
          console.log(`  Http urls:`, allHttp);
        }
      }
    }
  }
}
console.log(`Total matched with images in Sanar: ${hasImgCount}`);
