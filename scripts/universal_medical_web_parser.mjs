import vm from 'vm';

/**
 * Universal Medical Web Page Parser
 * Extracts question statement, alternatives, and official correct letter
 * from ANY free medical / exam website.
 */
export function parseUniversalMedicalHtml(html, url) {
  if (!html || typeof html !== 'string') return null;

  // ==============================================================
  // 1. ESTRATÉGIA MED (Nuxt.js state in window.__NUXT__)
  // ==============================================================
  if (url.includes('estrategia.com') || html.includes('window.__NUXT__')) {
    try {
      const match = html.match(/window\.__NUXT__\s*=\s*([\s\S]*?);<\/script>/);
      if (match) {
        const sandbox = { window: {} };
        vm.createContext(sandbox);
        vm.runInContext(`window.__NUXT__ = ${match[1]};`, sandbox, { timeout: 1000 });
        const nuxt = sandbox.window.__NUXT__;
        const fetchKeys = Object.keys(nuxt.fetch || {});
        for (const k of fetchKeys) {
          const qData = nuxt.fetch[k]?.question;
          if (qData && qData.alternatives && Array.isArray(qData.alternatives)) {
            const correctAlt = qData.alternatives.find(a => a.correct === true);
            const pos = correctAlt ? parseInt(correctAlt.position ?? correctAlt.index ?? 0, 10) : -1;
            const correctLetter = pos >= 0 ? String.fromCharCode(65 + pos) : null;
            if (correctLetter) {
              return {
                source: 'estrategia',
                statement: (qData.statement_text || qData.statement || '').replace(/<[^>]+>/g, ' ').trim(),
                alternatives: qData.alternatives.map((a, idx) => ({
                  letter: String.fromCharCode(65 + parseInt(a.position ?? idx, 10)),
                  text: (a.body || a.text || '').replace(/<[^>]+>/g, ' ').trim(),
                  correct: a.correct === true
                })),
                correctLetter
              };
            }
          }
        }
      }
    } catch (e) {}
  }

  // ==============================================================
  // 2. SANARMED (Embedded JSON in script tags)
  // ==============================================================
  if (url.includes('sanarmed.com') || html.includes('"correct": true') || html.includes('"correct":true')) {
    const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
    for (const sm of scriptMatches) {
      const content = sm[1];
      if (content.includes('"correct": true') || content.includes('"correct":true')) {
        try {
          const data = JSON.parse(content);
          if (data.alternatives && Array.isArray(data.alternatives)) {
            const correctAlt = data.alternatives.find(a => a.correct === true);
            const correctLetter = correctAlt ? String.fromCharCode(65 + correctAlt.index) : null;
            if (correctLetter) {
              return {
                source: 'sanar',
                statement: (data.statement || '').replace(/<[^>]+>/g, ' ').trim(),
                alternatives: data.alternatives.map(a => ({
                  letter: String.fromCharCode(65 + a.index),
                  text: (a.text || '').replace(/<[^>]+>/g, ' ').trim(),
                  correct: a.correct === true
                })),
                correctLetter
              };
            }
          }
        } catch (e) {}
      }
    }
  }

  // ==============================================================
  // 3. SCHEMA.ORG (JSON-LD QAPage / Question -> acceptedAnswer)
  // ==============================================================
  const ldMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const lm of ldMatches) {
    try {
      const data = JSON.parse(lm[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'QAPage' || item['@type'] === 'Question' || item.mainEntity?.['@type'] === 'Question') {
          const q = item.mainEntity || item;
          const accepted = q.acceptedAnswer?.text || q.acceptedAnswer?.name || '';
          if (accepted) {
            const cleanAns = accepted.replace(/<[^>]+>/g, ' ').trim();
            // Check if accepted answer starts with letter: e.g. "Alternativa B", "(B)", "B)"
            const letterMatch = cleanAns.match(/^(?:Alternativa\s+|Opção\s+|Letra\s+)?([A-E])(?:\)|\.|\s|$)/i);
            const correctLetter = letterMatch ? letterMatch[1].toUpperCase() : null;
            return {
              source: 'schema_ld_json',
              statement: (q.text || q.name || '').replace(/<[^>]+>/g, ' ').trim(),
              winningText: cleanAns,
              correctLetter
            };
          }
        }
      }
    } catch (e) {}
  }

  // ==============================================================
  // 4. QCONCURSOS / CONCURSOS NO BRASIL / PASSEI DIRETO (DOM markup)
  // ==============================================================
  // 4.1 Marcação explícita de alternativa correta
  const domCorrectMatch = html.match(/<(?:div|li|span|button)[^>]*class=["'][^"']*(?:is-correct|js-alternative-correct|q-option-correct|correct-answer|answer-correct)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|li|span|button)>/i);
  if (domCorrectMatch) {
    const rawContent = domCorrectMatch[1].replace(/<[^>]+>/g, ' ').trim();
    const lMatch = rawContent.match(/^([A-E])(?:\)|\.|\s)/i);
    return {
      source: 'dom_class_correct',
      winningText: rawContent,
      correctLetter: lMatch ? lMatch[1].toUpperCase() : null
    };
  }

  // 4.2 Texto explícito de gabarito: "Gabarito: B", "Resposta: Alternativa C", etc.
  const textGabaritoMatch = html.match(/(?:Gabarito(?:\s+Definitivo|\s+Oficial|\s+Comentado)?|Resposta(?:\s+Correta)?)\s*:\s*(?:<[^>]+>\s*)*\b([A-E])\b/i);
  if (textGabaritoMatch) {
    return {
      source: 'text_regex_gabarito',
      correctLetter: textGabaritoMatch[1].toUpperCase()
    };
  }

  return null;
}
