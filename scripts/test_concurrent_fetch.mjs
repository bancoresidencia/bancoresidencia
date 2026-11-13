import fs from 'fs';

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanStatementForSlug(stmt) {
  if (!stmt) return '';
  return stmt
    .replace(/^quest[aã]o\s*\d+[\.\:\-\s]*/i, '')
    .replace(/^\d+[\.\:\-\s]+/i, '')
    .replace(/^\([^\)]+\)\s*/i, '')
    .replace(/^(com relação|em relação|quanto|sobre|acerca|assinale|considere|observe)\s*(a|ao|à|às|aos|o|os|as)?\s*/i, '')
    .trim();
}

function slugify(text, maxWords = 10) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join('-');
}

async function fetchSingleSlug(slug) {
  const url = `https://sanarmed.com/q/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = ldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(m[1]);
        if (data['@type'] === 'QAPage' || data.mainEntity?.['@type'] === 'Question') {
          const accepted = data.mainEntity?.acceptedAnswer;
          if (accepted && accepted.text) {
            const cleanWinning = cleanHtml(accepted.text);
            const comment = cleanHtml(accepted.comment?.text || '');
            const letMatch = comment.match(/(?:resposta\s+correta|gabarito)[^\w]*letra\s*([A-E])\b/i) ||
                             comment.match(/(?:alternativa|letra)\s*([A-E])\s*(?:é\s+a\s+correta|correta)/i);
            return {
              provider: 'SanarMed',
              winningOptionText: cleanWinning,
              publishedLetter: letMatch ? letMatch[1].toUpperCase() : null,
              sourceUrl: url,
              confidence: 0.98
            };
          }
        }
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

// Teste concorrente: dispara os slugs em paralelo e pega o primeiro que achar
async function fetchSanarConcurrent(statement) {
  const cleanStmt = cleanStatementForSlug(statement);
  const candidates = [
    slugify(cleanStmt, 6),
    slugify(statement, 6),
    slugify(cleanStmt, 8),
    slugify(statement, 8),
    slugify(cleanStmt, 10)
  ];
  const uniqueSlugs = [...new Set(candidates.filter(Boolean))];

  const results = await Promise.all(uniqueSlugs.map(slug => fetchSingleSlug(slug)));
  return results.find(r => r !== null) || null;
}

async function benchmark() {
  const testStmt = "Durante uma consulta de rotina, você avalia um menino de 3 anos que ainda não começou a falar.";
  console.log('Testando busca concorrente...');
  const t0 = Date.now();
  const res = await fetchSanarConcurrent(testStmt);
  console.log(`Resultado obtido em ${Date.now() - t0}ms:`, res?.winningOptionText);
}

benchmark();
