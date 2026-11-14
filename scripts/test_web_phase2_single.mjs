import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanText(txt) {
  if (!txt) return '';
  return txt
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/["'“”«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

async function searchDuckDuckGo(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    if (res.status === 429) {
      console.log('HTTP 429 detectado em DuckDuckGo!');
      return { status: 429, links: [] };
    }
    const html = await res.text();
    // Extrai snippets e links
    const linkMatches = [...html.matchAll(/<a class="result__url" href="([^"]+)">([^<]+)<\/a>/g)];
    const snippetMatches = [...html.matchAll(/<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g)];
    const results = [];
    for (let i = 0; i < Math.min(linkMatches.length, 5); i++) {
      results.push({
        url: linkMatches[i] ? linkMatches[i][1].trim() : '',
        snippet: snippetMatches[i] ? snippetMatches[i][1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''
      });
    }
    return { status: res.status, results };
  } catch (e) {
    return { status: 500, error: e.message, results: [] };
  }
}

async function testSingle() {
  console.log('Testando busca Fase 2...');
  // Pega uma questão da USCS ou FUBOG
  const { data } = await supabase
    .from('questions')
    .select('id, code, statement, options, institution')
    .ilike('code', 'UNIVERSIDADE-2025%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(1);

  if (!data || data.length === 0) {
    console.log('Nenhuma questão encontrada para teste.');
    return;
  }

  const q = data[0];
  console.log(`Questão: ${q.code}`);
  console.log(`Enunciado: ${q.statement.slice(0, 100)}...`);

  const stmtClean = cleanText(q.statement);
  const firstOpt = Array.isArray(q.options) && q.options[0] ? cleanText(q.options[0].text || '') : '';

  // 1º Enunciado Inteiro + Alternativa
  const query1 = `"${stmtClean.slice(0, 100)}" "${firstOpt.slice(0, 40)}"`;
  console.log(`\nQuery 1 (Enunciado + Alternativa): ${query1}`);
  const res1 = await searchDuckDuckGo(query1);
  console.log(`Status 1: ${res1.status} | Resultados: ${res1.results?.length || 0}`);
  if (res1.results && res1.results.length > 0) {
    res1.results.forEach((r, i) => console.log(`  [${i+1}] ${r.url} -> ${r.snippet.slice(0, 80)}`));
  } else {
    // 2º Fallback: Só Enunciado Inteiro
    const query2 = `"${stmtClean.slice(0, 120)}"`;
    console.log(`\nQuery 2 (Fallback: Só Enunciado): ${query2}`);
    const res2 = await searchDuckDuckGo(query2);
    console.log(`Status 2: ${res2.status} | Resultados: ${res2.results?.length || 0}`);
    if (res2.results) {
      res2.results.forEach((r, i) => console.log(`  [${i+1}] ${r.url} -> ${r.snippet.slice(0, 80)}`));
    }
  }
}

testSingle().catch(console.error);
