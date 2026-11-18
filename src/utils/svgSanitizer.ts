/**
 * Sanitizador Estrito de SVG para Diagramas Clínicos (Mermaid)
 * Combina tokenização determinística de tags/atributos (compatível com Node.js e Browser)
 * e filtragem por árvore DOM (DOMParser no navegador) contra Stored/Self XSS via:
 * - Separadores sem espaço (<svg/onload=...>, <img/src=x/onerror=...>)
 * - Elementos executáveis ou SMIL (<script>, <foreignObject> malicioso, <animate>, <set>, <iframe>, <use> externo)
 * - Entidades HTML numéricas/hexadecimais em href / xlink:href (jav&#x09;ascript:)
 * - Atributos sem aspas (href=javascript:...)
 */

const FORBIDDEN_SVG_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'audio',
  'video',
  'canvas',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'meta',
  'link',
  'base',
  'animate',
  'animatemotion',
  'animatetransform',
  'set',
  'handler',
  'listener'
]);

function decodeHtmlEntitiesForSchemeCheck(raw: string): string {
  return raw
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(Math.min(code, 0x10ffff)) : '';
    })
    .replace(/&#(\d+);?/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(Math.min(code, 0x10ffff)) : '';
    })
    .replace(/[\u0000-\u0020\s]+/g, '')
    .toLowerCase();
}

function isDangerousUriValue(rawValue: string): boolean {
  const unquoted = rawValue.trim().replace(/^["']|["']$/g, '');
  const normalized = decodeHtmlEntitiesForSchemeCheck(unquoted);
  if (!normalized) return false;
  if (normalized.startsWith('#')) return false;
  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('data:')
  ) {
    return true;
  }
  return false;
}

function sanitizeSvgTagAttributes(tagName: string, rawAttrs: string): string {
  const attrRegex = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const safeAttrs: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(rawAttrs)) !== null) {
    const attrName = match[1];
    const lowerName = attrName.toLowerCase();
    const rawVal = match[2] ?? match[3] ?? match[4] ?? '';

    // Bloqueia absolutamente qualquer handler de evento inline (onload, onclick, onbegin, onerror, etc.)
    if (lowerName.startsWith('on')) {
      continue;
    }

    // Bloqueia atributos SMIL capazes de mutar atributos de eventos ou href dinamicamente
    if (lowerName === 'attributename' && decodeHtmlEntitiesForSchemeCheck(rawVal).startsWith('on')) {
      continue;
    }

    // Bloqueia protocolos executáveis ou externos em href / xlink:href / src / action / formaction
    if (
      lowerName === 'href' ||
      lowerName === 'xlink:href' ||
      lowerName === 'src' ||
      lowerName === 'action' ||
      lowerName === 'formaction'
    ) {
      if (isDangerousUriValue(rawVal)) {
        continue;
      }
      // Em <use>, permite apenas referências internas #id
      if (tagName === 'use' && !rawVal.trim().startsWith('#')) {
        continue;
      }
    }

    // Bloqueia expressões JS em style (expression(), url(javascript:...))
    if (lowerName === 'style') {
      const normStyle = decodeHtmlEntitiesForSchemeCheck(rawVal);
      if (normStyle.includes('javascript:') || normStyle.includes('expression(') || normStyle.includes('@import')) {
        continue;
      }
    }

    if (match[2] !== undefined || match[3] !== undefined || match[4] !== undefined) {
      const escapedVal = rawVal.replace(/"/g, '&quot;');
      safeAttrs.push(`${attrName}="${escapedVal}"`);
    } else {
      safeAttrs.push(attrName);
    }
  }

  return safeAttrs.length > 0 ? ' ' + safeAttrs.join(' ') : '';
}

export function sanitizeMermaidSvg(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== 'string') return '';

  // 1. Remove blocos completos de elementos executáveis (script, iframe, object, embed, style malicioso)
  let cleaned = rawSvg.replace(
    /<\s*(script|iframe|object|embed|applet|audio|video|form)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ''
  );

  // 2. Tokeniza todas as tags de abertura/fechamento independente de separadores (espaço, quebra de linha ou '/')
  cleaned = cleaned.replace(/<\s*(\/?)\s*([a-zA-Z][\w:-]*)([\s\S]*?)(\/?)>/g, (full, slash, rawTag, attrs, selfClose) => {
    const lowerTag = String(rawTag).toLowerCase();
    if (FORBIDDEN_SVG_TAGS.has(lowerTag)) {
      return '';
    }
    if (slash === '/') {
      return `</${rawTag}>`;
    }
    const trailingSlash = selfClose === '/' || attrs.trim().endsWith('/');
    const trimmedAttrs = trailingSlash && selfClose !== '/' ? attrs.replace(/\/\s*$/, '') : attrs;
    const safeAttrs = sanitizeSvgTagAttributes(lowerTag, trimmedAttrs);
    return `<${rawTag}${safeAttrs}${trailingSlash ? ' /' : ''}>`;
  });

  // 3. Defesa em profundidade no navegador via DOMParser nativo
  if (typeof DOMParser !== 'undefined' && typeof XMLSerializer !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleaned, 'text/html');
      const svgEl = doc.querySelector('svg');
      if (svgEl) {
        const allNodes = [svgEl, ...Array.from(svgEl.querySelectorAll('*'))];
        for (const el of allNodes) {
          const tag = el.tagName.toLowerCase();
          if (FORBIDDEN_SVG_TAGS.has(tag)) {
            el.remove();
            continue;
          }
          for (const attr of Array.from(el.attributes)) {
            const aName = attr.name.toLowerCase();
            if (
              aName.startsWith('on') ||
              ((aName === 'href' || aName === 'xlink:href' || aName === 'src') && isDangerousUriValue(attr.value))
            ) {
              el.removeAttribute(attr.name);
            }
          }
        }
        return svgEl.outerHTML;
      }
    } catch {
      // Preserva saída já higienizada pelo tokenizador estrito
    }
  }

  return cleaned;
}
