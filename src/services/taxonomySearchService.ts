export interface TaxonomyItem {
  id: string;
  especialidade: string;
  tema?: string;
  foco?: string;
  subfoco?: string;
  label: string;
  breadcrumb: string;
  level: 'especialidade' | 'tema' | 'foco' | 'subfoco';
}

let cachedIndex: TaxonomyItem[] | null = null;
let isIndexing = false;

// Principais Especialidades Canônicas com cores dedicadas
export const CORE_SPECIALTIES = [
  { name: 'Clínica Médica', color: '#3b82f6' },
  { name: 'Cirurgia', color: '#10b981' },
  { name: 'Pediatria', color: '#f59e0b' },
  { name: 'Ginecologia', color: '#ec4899' },
  { name: 'Obstetrícia', color: '#8b5cf6' },
  { name: 'Medicina Preventiva e Social', color: '#06b6d4' }
];

export async function getTaxonomyIndex(): Promise<TaxonomyItem[]> {
  if (cachedIndex) return cachedIndex;
  if (isIndexing) {
    while (isIndexing) {
      await new Promise((r) => setTimeout(r, 50));
    }
    if (cachedIndex) return cachedIndex;
  }

  isIndexing = true;
  try {
    const rawData = await import('@/data/hierarquiaCompletaFiltros.json');
    const hierarquia = rawData.hierarquia_padrao || [];

    const items: TaxonomyItem[] = [];

    for (const esp of hierarquia) {
      const espNome = esp.especialidade;
      items.push({
        id: `esp_${espNome}`,
        especialidade: espNome,
        label: espNome,
        breadcrumb: espNome,
        level: 'especialidade'
      });

      for (const t of esp.temas || []) {
        const temaNome = t.tema;
        items.push({
          id: `tema_${espNome}_${temaNome}`,
          especialidade: espNome,
          tema: temaNome,
          label: temaNome,
          breadcrumb: `${espNome} › ${temaNome}`,
          level: 'tema'
        });

        for (const f of t.focos || []) {
          const focoNome = f.foco;
          items.push({
            id: `foco_${espNome}_${temaNome}_${focoNome}`,
            especialidade: espNome,
            tema: temaNome,
            foco: focoNome,
            label: focoNome,
            breadcrumb: `${espNome} › ${temaNome} › ${focoNome}`,
            level: 'foco'
          });

          for (const sf of f.subfocos || []) {
            if (sf !== focoNome) {
              items.push({
                id: `subfoco_${espNome}_${temaNome}_${focoNome}_${sf}`,
                especialidade: espNome,
                tema: temaNome,
                foco: focoNome,
                subfoco: sf,
                label: sf,
                breadcrumb: `${espNome} › ${temaNome} › ${focoNome} › ${sf}`,
                level: 'subfoco'
              });
            }
          }
        }
      }
    }

    cachedIndex = items;
    return items;
  } catch (err) {
    console.error('Falha ao indexar taxonomia médica:', err);
    return [];
  } finally {
    isIndexing = false;
  }
}

export async function searchTaxonomy(query: string, limit = 20): Promise<TaxonomyItem[]> {
  const index = await getTaxonomyIndex();
  const cleanQ = query.trim().toLowerCase();

  if (!cleanQ) {
    // Retorna as especialidades e principais temas por padrão
    return index.filter((item) => item.level === 'especialidade' || item.level === 'tema').slice(0, limit);
  }

  // Pontuação simples para ordenação relevante
  const scored = index
    .map((item) => {
      const l = item.label.toLowerCase();
      const b = item.breadcrumb.toLowerCase();
      let score = 0;

      if (l === cleanQ) score += 100;
      else if (l.startsWith(cleanQ)) score += 50;
      else if (l.includes(cleanQ)) score += 30;
      else if (b.includes(cleanQ)) score += 10;

      // Favorece níveis mais altos (Especialidade/Tema) se empatar
      if (item.level === 'especialidade') score += 5;
      if (item.level === 'tema') score += 3;

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);

  return scored;
}
