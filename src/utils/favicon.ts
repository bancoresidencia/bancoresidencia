/**
 * Utilitário de Geração e Atualização Dinâmica de Favicon & Logo SVG
 * Identidade visual oficial Hippocampus.
 * Renderiza fielmente o símbolo puro sem círculo envolvente.
 */

const PATH_SYMBOL_1 =
  'M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282';
const PATH_SYMBOL_2 =
  'M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094';

export function generateLogoSvgString(strokeColor: string = '#000000'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2160 1920"><g id="Layer_1" data-name="Layer 1"><path d="${PATH_SYMBOL_1}" fill="none" stroke="${strokeColor}" stroke-width="132" stroke-miterlimit="10"/><path d="${PATH_SYMBOL_2}" fill="none" stroke="${strokeColor}" stroke-width="132" stroke-miterlimit="10"/></g></svg>`;
}

/**
 * Atualiza dinamicamente o favicon na tag <link rel="icon">
 */
export function updateFavicon(primaryColor: string, contrastColor?: string): void {
  void contrastColor;
  if (typeof document === 'undefined') return;

  try {
    const svg = generateLogoSvgString(primaryColor);
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    // 1. Tag SVG principal
    let svgLink = document.querySelector<HTMLLinkElement>("link[rel='icon'][type='image/svg+xml']");
    if (!svgLink) {
      svgLink = document.createElement('link');
      svgLink.rel = 'icon';
      svgLink.type = 'image/svg+xml';
      document.head.appendChild(svgLink);
    }
    svgLink.href = dataUri;

    // 2. Tag genérica de favicon (se existir)
    const existingIcons = document.querySelectorAll<HTMLLinkElement>(
      "link[rel='shortcut icon'], link[rel='icon']:not([type='image/svg+xml'])"
    );
    existingIcons.forEach((el) => {
      el.href = dataUri;
    });
  } catch (err) {
    console.warn('Erro ao atualizar favicon dinâmico:', err);
  }
}
