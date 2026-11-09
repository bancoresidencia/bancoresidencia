import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carrega variáveis de ambiente de .env.local
function loadEnv() {
  const env = {};
  if (fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^['\"]|['\"]$/g, '');
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  db: { schema: 'public' }
});

const isApply = process.argv.includes('--apply');

export function sanitizeText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Eliminação de caracteres invisíveis e controle zero-width
  text = text.replace(/[\u200B-\u200D\uFEFF\u2060]/g, '');

  // 2. Normalizar espaços insecáveis Unicode (\u00A0)
  text = text.replace(/\u00A0/g, ' ');

  // 3. Entidades HTML duplamente escapadas
  text = text
    .replace(/&amp;nbsp;/gi, ' ')
    .replace(/&amp;lt;/gi, '<')
    .replace(/&amp;gt;/gi, '>')
    .replace(/&amp;quot;/gi, '"')
    .replace(/&amp;apos;|&amp;#0*39;/gi, "'")
    .replace(/&amp;amp;/gi, '&');

  // 4. Entidades HTML Numéricas
  try {
    text = text
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = Number(dec);
        if (code === 160) return ' ';
        if (code === 8203 || code === 8204 || code === 8205 || code === 65279 || code === 8288) return '';
        return code >= 32 && code <= 65535 ? String.fromCharCode(code) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        if (code === 0xA0) return ' ';
        if (code === 0x200B || code === 0x200C || code === 0x200D || code === 0xFEFF || code === 0x2060) return '';
        return code >= 32 && code <= 65535 ? String.fromCharCode(code) : '';
      });
  } catch {
    // Fallback silencioso
  }

  // 5. Entidades HTML Nomeadas
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&gt;/gi, '>')
    .replace(/&lt;/gi, '<')
    .replace(/&amp;/gi, '&')
    .replace(/&ge;/gi, '≥')
    .replace(/&le;/gi, '≤')
    .replace(/&plusmn;/gi, '±')
    .replace(/&deg;/gi, '°')
    .replace(/&middot;/gi, '·')
    .replace(/&times;/gi, '×')
    .replace(/&micro;/gi, 'µ');

  // 6. Remover Marcas d'Água de Concorrentes e Apostilas
  text = text
    .replace(/T\.ME(?:\/[^\s]*)?/gi, '')
    .replace(/MEDOPEN\s*-\s*ACERVO\s*MÉDICO\s*GRATUITO/gi, '')
    .replace(/MEDOPEN/gi, '')
    .replace(/ACERVO\s*MÉDICO\s*GRATUITO/gi, '')
    .replace(/Extensivo\s*-\s*[A-Za-zÀ-ÿ\s]+\s*\t?\d+\/\d+/gi, '')
    .replace(/\d+\.\s*[A-Za-zÀ-ÿ\s]+-\s*Parte\s+[IVX]+/gi, '')
    .replace(/Fala,\s*Estrategista!?\s*/gi, '')
    .replace(/Caro\s*estrategista,?\s*/gi, '')
    .replace(/Estrategista,?\s*/gi, '')
    .replace(/estrat[ée]gia\s*med/gi, 'Base Médica Teórica')
    .replace(/estrat[ée]gia\s*vestibulares/gi, 'Base Teórica')
    .replace(/estrat[ée]gia/gi, 'Literatura Oficial');

  // 7. Normalizar Tags HTML residuais para Markdown e quebras limpas
  text = text
    .replace(/<\/?(?:p|div|section|article|header|footer)\b[^>]*>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/(?:ul|ol|li)\b[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**')
    .replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
    .replace(/<[^>]+>/g, '');

  // 8. Normalização final de quebras de linha e espaçamentos
  text = text
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

async function runAudit() {
  console.log('====================================================');
  console.log('   AUDITORIA / SANITIZAÇÃO TEXTUAL DO BANCO');
  console.log(`   MODO: ${isApply ? '🚀 APLICAÇÃO REAL (--apply)' : '🔍 DRY-RUN DE AUDITORIA'}`);
  console.log('   (Imagens e URLs MedEvo NÃO são modificadas)');
  console.log('====================================================\n');

  // Consulta por lotes
  const PAGE_SIZE = 1000;
  let offset = 0;
  let totalChecked = 0;
  let affectedCount = 0;

  const hasResidue = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.includes('\u00A0') ||
           str.includes('&nbsp;') ||
           /[\u200B-\u200D\uFEFF\u2060]/.test(str) ||
           /&lt;|&gt;|&amp;|&quot;|&#39;|<[a-zA-Z\/][^>]*>/.test(str);
  };

  while (true) {
    const { data: rows, error } = await supabase
      .from('questions')
      .select('id, code, statement, options, commentary')
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error('❌ Erro na leitura do Supabase:', error.message);
      break;
    }

    if (!rows || rows.length === 0) {
      break;
    }

    totalChecked += rows.length;

    for (const row of rows) {
      let changed = false;
      const updates = {};

      if (hasResidue(row.statement)) {
        const cleaned = sanitizeText(row.statement);
        if (cleaned !== row.statement) {
          updates.statement = cleaned;
          changed = true;
        }
      }

      if (hasResidue(row.commentary)) {
        const cleaned = sanitizeText(row.commentary);
        if (cleaned !== row.commentary) {
          updates.commentary = cleaned;
          changed = true;
        }
      }

      if (Array.isArray(row.options)) {
        let optChanged = false;
        const cleanedOptions = row.options.map(opt => {
          let itemChanged = false;
          let newOptText = opt.text;
          let newOptExp = opt.explanation;
          if (hasResidue(opt.text)) {
            newOptText = sanitizeText(opt.text);
            itemChanged = true;
          }
          if (hasResidue(opt.explanation)) {
            newOptExp = sanitizeText(opt.explanation);
            itemChanged = true;
          }
          if (itemChanged) {
            optChanged = true;
            const res = { ...opt, text: newOptText };
            if (newOptExp !== undefined) res.explanation = newOptExp;
            return res;
          }
          return opt;
        });

        if (optChanged) {
          updates.options = cleanedOptions;
          changed = true;
        }
      }

      if (changed) {
        affectedCount++;
        if (isApply) {
          await supabase.from('questions').update(updates).eq('id', row.id);
        }
      }
    }

    process.stdout.write(`\rVerificadas: ${totalChecked} | Afetadas com resíduos: ${affectedCount}`);
    offset += PAGE_SIZE;

    // Amostra de auditoria no dry-run inicial
    if (!isApply && totalChecked >= 5000) {
      console.log('\n\n[Audit Sample] Primeiras 5.000 questões avaliadas no acervo.');
      break;
    }
  }

  console.log(`\n\nFinalizado: ${totalChecked} questões processadas.`);
  console.log(`Questões com resíduos detectados: ${affectedCount}`);
  if (!isApply) {
    console.log('\nℹ️ Para aplicar as correções no banco, execute com: node scripts/sanitize_database_question_texts.mjs --apply');
  }
}

runAudit().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
