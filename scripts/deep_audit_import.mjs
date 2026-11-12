import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

const tables = [
  'questions',
  'questions_expansion_direto',
  'questions_expansion_r_plus',
  'questions_expansion_revalida',
  'questions_expansion_titulo_especialista'
];

const auditResults = {
  timestamp: new Date().toISOString(),
  tables: {}
};

for (const t of tables) {
  console.log(`\n======================================================`);
  console.log(`🔍 AUDITANDO TABELA: ${t}`);
  console.log(`======================================================`);

  const total = db.prepare(`SELECT COUNT(*) as c FROM "${t}"`).get().c;

  // 1. FILTROS
  const f_especialidade = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE especialidade IS NOT NULL AND TRIM(especialidade) != ''`).get().c;
  const f_tema = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE tema IS NOT NULL AND TRIM(tema) != ''`).get().c;
  const f_foco = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE foco IS NOT NULL AND TRIM(foco) != ''`).get().c;
  const f_subfoco = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE subfoco IS NOT NULL AND TRIM(subfoco) != ''`).get().c;
  const f_banca = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE banca IS NOT NULL AND TRIM(banca) != ''`).get().c;
  const f_inst = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE institution IS NOT NULL AND TRIM(institution) != ''`).get().c;
  const f_year = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE year IS NOT NULL AND year != ''`).get().c;
  const f_diff = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE difficulty IS NOT NULL AND TRIM(difficulty) != ''`).get().c;
  const f_modalidade = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE modalidade IS NOT NULL AND TRIM(modalidade) != ''`).get().c;

  const yearRange = db.prepare(`SELECT MIN(CAST(year as INTEGER)) as min_y, MAX(CAST(year as INTEGER)) as max_y FROM "${t}" WHERE CAST(year as INTEGER) > 1980`).get();

  // 2. GABARITOS
  const g_filled = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE correct_answer IS NOT NULL AND TRIM(correct_answer) != ''`).get().c;
  const g_hasGabaritoTrue = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE has_gabarito = 1 OR has_gabarito = 'true'`).get().c;
  const g_anuladas = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE is_anulada = 1 OR is_anulada = 'true'`).get().c;
  const sampleGabaritos = db.prepare(`SELECT correct_answer, COUNT(*) as c FROM "${t}" GROUP BY correct_answer ORDER BY c DESC LIMIT 8`).all();

  // 3. COMENTÁRIOS
  const c_filled = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE commentary IS NOT NULL AND TRIM(commentary) != '' AND TRIM(commentary) != '[]' AND TRIM(commentary) != '{}'`).get().c;
  const c_avgLen = db.prepare(`SELECT AVG(LENGTH(commentary)) as avg_len FROM "${t}" WHERE commentary IS NOT NULL AND TRIM(commentary) != ''`).get().avg_len;

  // 4. IMAGENS
  const rowsWithImages = db.prepare(`SELECT id, images, statement FROM "${t}" WHERE images IS NOT NULL AND TRIM(images) != '' AND TRIM(images) != '[]'`).all();
  
  let totalImagesCount = 0;
  let webpCount = 0;
  let pngCount = 0;
  let jpgCount = 0;
  let otherExtCount = 0;
  let hasCaptionOrTextCount = 0;
  const sampleUrls = [];

  for (const r of rowsWithImages) {
    let imgParsed = null;
    try {
      imgParsed = JSON.parse(r.images);
    } catch {
      imgParsed = [r.images];
    }
    if (Array.isArray(imgParsed)) {
      totalImagesCount += imgParsed.length;
      for (const item of imgParsed) {
        let url = typeof item === 'string' ? item : (item.url || item.src || item.path || '');
        let caption = typeof item === 'object' ? (item.caption || item.text || item.title || item.alt || '') : '';
        if (caption) hasCaptionOrTextCount++;

        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('.webp')) webpCount++;
        else if (lowerUrl.includes('.png')) pngCount++;
        else if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg')) jpgCount++;
        else otherExtCount++;

        if (sampleUrls.length < 15 && url.startsWith('http')) {
          sampleUrls.push({ id: r.id, url, caption });
        }
      }
    }
  }

  // Também verificar se há menção a imagens no statement (ex: [IMAGEM], <img, webp)
  const stmtWithImgTag = db.prepare(`SELECT COUNT(*) as c FROM "${t}" WHERE statement LIKE '%<img%' OR statement LIKE '%.webp%' OR statement LIKE '%[IMAGEM%'`).get().c;

  auditResults.tables[t] = {
    total,
    filtros: {
      especialidade: { count: f_especialidade, pct: ((f_especialidade/total)*100).toFixed(1) },
      tema: { count: f_tema, pct: ((f_tema/total)*100).toFixed(1) },
      foco: { count: f_foco, pct: ((f_foco/total)*100).toFixed(1) },
      subfoco: { count: f_subfoco, pct: ((f_subfoco/total)*100).toFixed(1) },
      banca: { count: f_banca, pct: ((f_banca/total)*100).toFixed(1) },
      institution: { count: f_inst, pct: ((f_inst/total)*100).toFixed(1) },
      year: { count: f_year, pct: ((f_year/total)*100).toFixed(1), min: yearRange.min_y, max: yearRange.max_y },
      difficulty: { count: f_diff, pct: ((f_diff/total)*100).toFixed(1) },
      modalidade: { count: f_modalidade, pct: ((f_modalidade/total)*100).toFixed(1) }
    },
    gabaritos: {
      com_gabarito: { count: g_filled, pct: ((g_filled/total)*100).toFixed(1) },
      has_gabarito_flag: { count: g_hasGabaritoTrue, pct: ((g_hasGabaritoTrue/total)*100).toFixed(1) },
      anuladas: g_anuladas,
      distribuicao_amostra: sampleGabaritos
    },
    comentarios: {
      preenchidos: { count: c_filled, pct: ((c_filled/total)*100).toFixed(1) },
      tamanho_medio_caracteres: Math.round(c_avgLen || 0)
    },
    imagens: {
      questoes_com_campo_imagens: rowsWithImages.length,
      pct_questoes_com_imagens: ((rowsWithImages.length/total)*100).toFixed(2),
      total_imagens_encontradas: totalImagesCount,
      webp_count: webpCount,
      png_count: pngCount,
      jpg_count: jpgCount,
      outros_formatos: otherExtCount,
      com_legenda_ou_texto: hasCaptionOrTextCount,
      enunciados_com_tags_imagem: stmtWithImgTag,
      amostra_urls: sampleUrls
    }
  };

  console.log(`Total: ${total.toLocaleString()}`);
  console.log(`Filtros: Esp=${((f_especialidade/total)*100).toFixed(1)}%, Tema=${((f_tema/total)*100).toFixed(1)}%, Foco=${((f_foco/total)*100).toFixed(1)}%, Banca=${((f_banca/total)*100).toFixed(1)}%, Ano=${((f_year/total)*100).toFixed(1)}%`);
  console.log(`Gabarito: ${((g_filled/total)*100).toFixed(1)}% preenchidos | Anuladas: ${g_anuladas}`);
  console.log(`Comentários: ${((c_filled/total)*100).toFixed(1)}% preenchidos (tamanho médio: ${Math.round(c_avgLen || 0)} chars)`);
  console.log(`Imagens: ${rowsWithImages.length} questões com imagens (${totalImagesCount} arquivos no total) | WebP=${webpCount}, PNG=${pngCount}, JPG=${jpgCount}`);
}

db.close();

fs.writeFileSync('data/supabase_tables/audit_deep_report.json', JSON.stringify(auditResults, null, 2), 'utf8');
console.log('\n✅ Relatório salvo em data/supabase_tables/audit_deep_report.json');

