import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SESSION_COOKIE = 'eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..jeYonZ-V-m9ht0-3.GdsL_DHReG1vW94wGbJ3e8ospKPtL6J5aWELvwTSPLBS_ktOQ8mNKp-C8EVah9E449rXvOFDE0Y0Ubv1FiW268ns85Oi75TlXOOB8TE6y5ASGqIffJh8NR5f_b2cd2oWkax9lnO-3n0kAYWXlmb-vFmIv8t4p2dYYM5-k14fQ9k-kbEFU-1zGUrqO7yYJOuOGn_dZjW6Epw-9ApTlOPp96aLV1FTmdUhFZXnMOHpDGc1HpWhHZt2eMX9PYAJFf0lz6APsaSVztBJTL02ipQIQSjPU6gYStmZWl0pLYe0zYWSpiC6AiDxqgyfFactKk9G3p1_NfkpJraROLfqalxjXpEiS_5ebXpwH2LYKifnn-f-1_o3vlUBuSLafTiU1xR1QiEhFsRdgOZSerVsE63FcMiSD87hmSyYpWqPrpOX4m869iiMGGIlg-MMLZ_khC5KKt5N0ofkS2ny3Swkd_YH9SmLg4arlpmhb_WqPdREmA6JqxClNP7KJGrMn6lB_BD3P-HvOeSP3WWb2xVKNpFOahDzEZkqpooh5WPdAC82BEPJ5iDOPP25KjN5GtaP8l9Oo0l83Mtm_qtNyzRgKoGEHAKFxhejlNVxcpYctH7Tb6V6rAVrtgS1X0n--WC_Cq-0x2dBhw2uyK3dreJuWBm9BAKAmeEnY2YE6ektEvj2vv4D01FqiOO0ix1D3y-deqtyRYKaotcBu6lTSy662d1zkLE9FW2Ym5JWeTiqnOm3YgQ7kK989R8kJG8iBE3FmvYbx1Mw6EaiLD9WROxl8RWdYwV4phOX5_YQlOI55V1_Ay4qfX82Z20yCImv43i16TErlS4ZNQmFKHoIzrh2c8FdZxc8vsF6wU3wZrwszgxYOEX8Odz4tlqefz6pJEzJooz-TxfI2VhfiC-2MHE13t-bS1ZBUvbw79FFv3LLd6e8Z-NbfQbJ-iRGYUOtQpAxhDl8cDUF4aIwDuw8Yp_LZbw9gLiFfffR0KAWhAj9Vcms2jaqqt08O_fmoyXtor5wv_OsiGCnab5FTChGWxB2a810V8WcDqKqo912sYWHc6PkevuF4zACRlpIsw-3g9RT5KStw1uyhBn23uI-8A3IZW9hXzBc_92Ujm9WipwXtyD4f3aeY9JUxOuvrs-hZPNlHqIFTUnb-44ansEZ63Y7wnpMmOp-c46kLbWBs559teYtvkI1kVvVmtp-0-dc_5k8mCK5J82OE-cmGBU4NE1FJTOcfjxlFIyW5OJFFLtt0OZCq4ikN7BD_H-wINih91ZBwDd78uyBPdqlqVe45QBELvU216uD2fmuRRQSIbPhLh9iQMl4QJsR5AqpcQ3RylwDmOVt-BfX3SKseH2njh9MWtl9At2GPbiVKdIGVNiWC7KKufO0c6ZX4jHl2_hWu2GDA_F118318Q7R3A2uw7vcPq5_wszI0HEpEmofqsz1YHWIvwe7TOT_bWfwtnsAHkMDSOYPI95vXXlavRLtoZYgWvFAHLmUhPAydDz_T1U_mqvtuwLTPaYbI0czKi24AnHHBa30n37sAh5GHCmQWnP1i_tJAAbR613qFnMOtAf3EuVO_0XMc-W6E56S4z_PQa2a5OpipAVtDKRGgskGxIMaogqpEuftKOTisZMnHRcb8bBJPSiUDSwtLin20YciS7W0ET3y7j48RzrUKULJut2oflxTd2ulwrM2SF_fHg7KmP-Q8FQ_IdY_2YUDxrXV1NNpMiZCkCKXhfLyJ6Kj6XmhB_YlEqHNGEGH4XtCDOAQ-ARpkBckLL13cxIaXICOIq9NcfGCbbu61hVnNYQ4tTAQTEImTafURMEUSmfdxIcc-wBuF1k15qheemRj-4wadLKX8b7USg3hVxMifljp4TUA6vzkHDNiQ8gbyIY9ZvhAmZUL_us4Ngq0Q9V8w4XJhFbDq21du9UXwSpNjLXNP-eA_bHtdSNLOQdD1_MDb2wbkuMDIdODdEELw_Dz34msTQBU1F4BvKNbTZh7qT-kC7tohqE8RF1Bfmggq0M3KKxTBAIkwBbXnWjY8rD3YJvlkdkPKLfn2Rc8FlseoLhGc8r8rSnZBT1Nwr-O3DjQAHRSscJD5AurcNVUQx5krAOUFu5Se-rqzmXaETgTSSHmfwXiFw5x_ceLhGDIRIzNjQEdMj2Rwq_koTDXclMgdxv9FVqymGC6Pdxm-u6EuvJNy-zxbkCv-63poX5mYreOC-IfblKgBpH3TfSxVEAao0XXgrmk78v0FX_X3WSMdmq2oegYENQh7AV0d4cXnpp74w1bRJ7KgaGRPmTz_PdTB8giq8X1R7ZPYtytFqqEOpp24QpV1-3lCRu_V_yR2RIEIPI4dbuPkuishs7Usz1AM3HkPell1EMMPZYmzfwdVcxgHE1b1dlmv8h_HbzD2tjfBpANWxmnxizNk74AxfJ_B0OXtOO7niIwXgfR2o_8ppfLw8TKvcR6S4SCLoW9LHdYzQSEB0EcCeBDku05j6Kz2Zzudo23mmiNZIoTj5jiasegIrg8Q_ZQtNJZ5s0gZHGMTrW0udUegiBhIziSf_Aye-TU4wQJgSec3d4DlsqUNnUH6EWNX2IK70Qc4iXtCfA_FrgQtX0tDkcdsjPCCpD6xOsmNc4M65lxH_hIIl-P7gOF0O_eQvrAncruWu9hYiqS2YDTYSgU9OoxsqoBaAdQCXUJv0wJRQcJB4gOnrPPz_wlWZCZLosUHJuvXCbAvYK_u0ioar-fRRLk-ffVFdLikBQkjx24iV4hP-fIG4m5j3IfECfzVY0w9kVBjxwKzWlehHDhs3sCrSCbq-QpO0YCuCCZm0IorpDnDu4gMYnyHBDhyoTFnGmcFxHSiSeIgJ2964sSwU-UyPB8PMmnzML64610ix0nTKfc1r2-zVhpyhBFFuc1jddqYTFhN_cjGDaNd9FoUchJAK9Gc2q3lDXFzkgv6rIhewznilfG5QqwJPt45lQv5hcnmdXwxqIScKppFrvtnAOkjrSUMfQlW9tUDhwexkJ2WY0IAhxDyIVCP-OMcZAQFhrN-cekoe2LwW1epbT4Gd9iHevMfWthU_RfbcnXM4xj_g1bqVMSaxYYSbfyiZBEGle8OIRpv_waJm8zbWonRpORnEoZKCEXc9xwIvjVsAyJKckX-hw4eIpDkTOFqCTJSEE5pccKU3ClxKJ8m5Eaa3nxfRF4z9DlusnQGTSoSoq02EXw1_GpfKEv3sV1G-LhHO_PLgeW8QofebHcAFfk9UBnOYvkxS6L_nkjJg.kprs1vZiALNZAXRMbftERg';

const BASE_DIR = path.resolve('data/scraped_exams');
const RAW_DIR = path.join(BASE_DIR, 'raw');
const META_DIR = path.join(BASE_DIR, 'metadata');

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(META_DIR, { recursive: true });

function getAlreadySavedExamIds() {
  const existing = new Set();
  if (fs.existsSync(RAW_DIR)) {
    const years = fs.readdirSync(RAW_DIR);
    for (const y of years) {
      const yDir = path.join(RAW_DIR, y);
      if (fs.statSync(yDir).isDirectory()) {
        const files = fs.readdirSync(yDir);
        for (const f of files) {
          if (f.endsWith('.json')) {
            const parts = f.replace('.json', '').split('_');
            const examId = parts[parts.length - 1];
            existing.add(examId);
          }
        }
      }
    }
  }
  return existing;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 INICIANDO EXTRAÇÃO COMPLETA: QUESTÕES DE RESIDÊNCIA');
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  await context.addCookies([
    {
      name: '__session',
      value: SESSION_COOKIE,
      domain: 'www.questoesderesidencia.com.br',
      path: '/'
    }
  ]);

  const page = await context.newPage();
  console.log('\n[1/4] Estabelecendo sessão autenticada com a plataforma...');
  await page.goto('https://www.questoesderesidencia.com.br/panel/exams', { waitUntil: 'domcontentloaded' });
  console.log('✔ Sessão ativa confirmada! Título da página:', await page.title());

  // 1. Download Taxonomy / Filters
  console.log('\n[2/4] Baixando árvore taxonômica de filtros (Especialidades / Subespecialidades / Temas)...');
  const filtersData = await page.evaluate(async () => {
    const res = await fetch('/api/unauthenticated/get/allFilters');
    return await res.json();
  });
  fs.writeFileSync(path.join(META_DIR, 'filters_taxonomy.json'), JSON.stringify(filtersData, null, 2), 'utf8');
  console.log('✔ Taxonomia salva em data/scraped_exams/metadata/filters_taxonomy.json');

  // 2. Download All Exams Catalog
  console.log('\n[3/4] Baixando catálogo completo de provas...');
  const examsCatalogRaw = await page.evaluate(async () => {
    const res = await fetch('/api/unauthenticated/get/allExamsProps');
    return await res.json();
  });
  const allExams = examsCatalogRaw.data || [];
  fs.writeFileSync(path.join(META_DIR, 'exams_catalog.json'), JSON.stringify(allExams, null, 2), 'utf8');
  console.log(`✔ Catálogo salvo com ${allExams.length} provas mapeadas!`);

  // 3. Identification of existing/pending exams
  const savedIds = getAlreadySavedExamIds();
  const pendingExams = allExams.filter(e => !savedIds.has(e._id));
  console.log(`\n[4/4] Status da Extração:`);
  console.log(` - Total de provas no acervo: ${allExams.length}`);
  console.log(` - Já extraídas anteriormente: ${savedIds.size}`);
  console.log(` - Restantes para extrair:    ${pendingExams.length}`);
  console.log('='.repeat(70));

  let successCount = savedIds.size;
  let totalQuestionsCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  // Concurrency worker queue
  const CONCURRENCY = 4;
  let index = 0;

  async function worker(workerId) {
    while (index < pendingExams.length) {
      const currentIndex = index++;
      const exam = pendingExams[currentIndex];
      const examId = exam._id;
      const year = String(exam.year || 'OUTROS');
      const safeInst = (exam.institution?.abbreviation || exam.state || 'EXAM').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const yearDir = path.join(RAW_DIR, year);
      const filename = `${safeInst}_${examId}.json`;
      const filePath = path.join(yearDir, filename);

      let attempts = 0;
      let questions = null;

      while (attempts < 3) {
        attempts++;
        try {
          questions = await page.evaluate(async (id) => {
            const res = await fetch(`/api/authenticated/get/questionsLib/getAllQuestionsByExamId/${id}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
          }, examId);
          break;
        } catch (err) {
          if (attempts >= 3) {
            console.error(`❌ [Worker ${workerId}] Falha persistente no exame ${exam.title} (${examId}): ${err.message}`);
            errorCount++;
          } else {
            await new Promise(r => setTimeout(r, 1000 * attempts));
          }
        }
      }

      if (questions && Array.isArray(questions)) {
        if (!fs.existsSync(yearDir)) {
          fs.mkdirSync(yearDir, { recursive: true });
        }
        const fileData = {
          exam,
          totalQuestions: questions.length,
          extractedAt: new Date().toISOString(),
          questions
        };
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
        successCount++;
        totalQuestionsCount += questions.length;

        const elapsedSec = (Date.now() - startTime) / 1000;
        const processed = currentIndex + 1;
        const rate = processed / (elapsedSec || 1);
        const remainingSec = Math.round((pendingExams.length - processed) / (rate || 1));
        const etaMin = Math.floor(remainingSec / 60);
        const etaSec = remainingSec % 60;

        if (successCount % 10 === 0 || currentIndex === pendingExams.length - 1) {
          console.log(`[${successCount}/${allExams.length}] (${year}) ${exam.title.slice(0, 40)}... | ${questions.length} Qs | ETA: ${etaMin}m ${etaSec}s`);
        }
      }

      // Small delay between requests to avoid overloading
      await new Promise(r => setTimeout(r, 120));
    }
  }

  // Launch workers
  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(worker(w + 1));
  }

  await Promise.all(workers);

  const totalTimeSec = Math.round((Date.now() - startTime) / 1000);
  console.log('\n' + '='.repeat(70));
  console.log('🎉 EXTRAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log(` - Provas processadas: ${successCount} de ${allExams.length}`);
  console.log(` - Novas questões extraídas nesta execução: ${totalQuestionsCount}`);
  console.log(` - Erros: ${errorCount}`);
  console.log(` - Tempo total: ${Math.floor(totalTimeSec / 60)}m ${totalTimeSec % 60}s`);
  console.log(` - Diretório de destino: ${BASE_DIR}`);
  console.log('='.repeat(70));

  await browser.close();
}

main().catch(err => {
  console.error('Fatal extraction error:', err);
  process.exit(1);
});

