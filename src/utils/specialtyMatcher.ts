import { SpecialtyHierarchy } from '@/types';
import { FlashcardItem } from '@/types/flashcards';

/**
 * Normaliza texto removendo acentos e pontuação
 */
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Helper para matching preciso de especialidades médicas
 * Garante distinção entre Ginecologia e Obstetrícia, Clínica e Cirurgia, etc.
 */
export function itemMatchesSpecialty(
  item: { specialty: string; theme?: string; focus?: string },
  specHierarchyKey: string
): boolean {
  const s = (item.specialty || '').toLowerCase();
  const target = (specHierarchyKey || '').toLowerCase();

  if (target.includes('clínica') || target.includes('clinica')) {
    return s.includes('clínica') || s.includes('clinica');
  }
  if (target.includes('cirurgia')) {
    return s.includes('cirurgia');
  }
  if (target.includes('pediatria')) {
    return s.includes('pediatria');
  }
  if (target.includes('preventiva')) {
    return s.includes('preventiva');
  }
  if (target.includes('ginecologia')) {
    if (s === 'ginecologia') return true;
    if (s.includes('ginecologia')) {
      const th = (item.theme || '').toLowerCase();
      const fo = (item.focus || '').toLowerCase();
      if (
        th.includes('obstetr') ||
        fo.includes('parto') ||
        fo.includes('eclâmpsia') ||
        fo.includes('eclampsia')
      ) {
        return false;
      }
      return true;
    }
    return false;
  }
  if (target.includes('obstetr')) {
    if (s === 'obstetrícia' || s === 'obstetricia') return true;
    if (s.includes('obstetr')) {
      const th = (item.theme || '').toLowerCase();
      const fo = (item.focus || '').toLowerCase();
      if (
        th.includes('gineco') ||
        th.includes('mioma') ||
        fo.includes('colo uterino') ||
        fo.includes('mioma')
      ) {
        return false;
      }
      return true;
    }
    return false;
  }
  return false;
}

export function cardMatchesSpec(c: FlashcardItem, specName: string): boolean {
  const s = normalizeText(c.specialty);
  const target = normalizeText(specName);
  if (target.includes('clinica')) return s.includes('clinica');
  if (target.includes('cirurgia')) return s.includes('cirurgia');
  if (target.includes('pediatria')) return s.includes('pediatria');
  if (target.includes('preventiva')) return s.includes('preventiva');
  if (target.includes('ginecologia')) {
    if (s === 'ginecologia') return true;
    if (s.includes('ginecologia')) {
      const th = normalizeText(c.theme);
      const fo = normalizeText(c.focus);
      if (th.includes('obstetr') || fo.includes('parto') || fo.includes('eclampsia')) return false;
      return true;
    }
    return false;
  }
  if (target.includes('obstetr')) {
    if (s.includes('obstetr')) {
      const th = normalizeText(c.theme);
      const fo = normalizeText(c.focus);
      if (th.includes('gineco') || th.includes('mioma') || fo.includes('colo uterino')) return false;
      return true;
    }
    return false;
  }
  return s.includes(target) || target.includes(s);
}

export function cardMatchesTema(c: FlashcardItem, specName: string, temaName: string): boolean {
  if (!cardMatchesSpec(c, specName)) return false;
  const normTema = normalizeText(temaName);
  const normItemTh = normalizeText(c.theme);
  const normItemFo = normalizeText(c.focus);

  const matchesTh =
    normItemTh.includes(normTema) ||
    normTema.includes(normItemTh) ||
    normItemFo.includes(normTema);

  const isEndo = normTema.includes('endocrino') && normItemTh.includes('endocrino');
  const isCardio = normTema.includes('cardio') && normItemTh.includes('cardio');
  const isGinecoOnco = normTema.includes('oncologia') && normItemTh.includes('ginecologia');
  const isMioma = normTema.includes('mioma') && normItemTh.includes('mioma');
  const isObstetr = normTema.includes('obstetr') && normItemTh.includes('obstetr');
  const isPrev = normTema.includes('epidemiologia') && normItemTh.includes('epidemiologia');

  return matchesTh || isEndo || isCardio || isGinecoOnco || isMioma || isObstetr || isPrev;
}

export function cardMatchesFoco(
  c: FlashcardItem,
  specName: string,
  temaName: string,
  focoName: string
): boolean {
  if (!cardMatchesTema(c, specName, temaName)) return false;
  const normFoco = normalizeText(focoName);
  const normItemFo = normalizeText(c.focus);
  const normFront = c.front ? normalizeText(c.front) : '';
  const normBack = c.back ? normalizeText(c.back) : '';
  const normComment = c.comment ? normalizeText(c.comment) : '';

  const direct = normItemFo.includes(normFoco) || normFoco.includes(normItemFo);
  const content =
    normFront.includes(normFoco) ||
    normBack.includes(normFoco) ||
    normComment.includes(normFoco);

  const words = normFoco.split(/\s+/).filter((w) => w.length > 3);
  const wordsMatch =
    words.length > 0 &&
    words.some(
      (w) =>
        normItemFo.includes(w) ||
        normFront.includes(w) ||
        (c.tags && c.tags.some((t) => normalizeText(t).includes(w)))
    );

  return direct || content || wordsMatch;
}

export function cardMatchesSubfoco(
  c: FlashcardItem,
  specName: string,
  temaName: string,
  focoName: string,
  subfocoName: string
): boolean {
  if (!cardMatchesFoco(c, specName, temaName, focoName)) return false;
  const normSub = normalizeText(subfocoName);
  if (c.subfocus) {
    const normCSub = normalizeText(c.subfocus);
    if (normCSub.includes(normSub) || normSub.includes(normCSub)) return true;
  }
  const normFront = c.front ? normalizeText(c.front) : '';
  const normBack = c.back ? normalizeText(c.back) : '';
  const words = normSub.split(/\s+/).filter((w) => w.length > 3);
  return (
    words.length > 0 &&
    words.some(
      (w) =>
        normFront.includes(w) ||
        normBack.includes(w) ||
        (c.tags && c.tags.some((t) => normalizeText(t).includes(w)))
    )
  );
}

export function cardMatchesSubSubfoco(
  c: FlashcardItem,
  specName: string,
  temaName: string,
  focoName: string,
  subfocoName: string,
  subSubfocoName: string
): boolean {
  if (!cardMatchesSubfoco(c, specName, temaName, focoName, subfocoName)) return false;
  const normSubSub = normalizeText(subSubfocoName);
  const cardSS = c.sub_subfocus || c.subSubfocus;
  if (cardSS) {
    const normCSS = normalizeText(cardSS);
    if (normCSS.includes(normSubSub) || normSubSub.includes(normCSS)) return true;
  }
  const normFront = c.front ? normalizeText(c.front) : '';
  const normBack = c.back ? normalizeText(c.back) : '';
  const normComment = c.comment ? normalizeText(c.comment) : '';

  if (
    normFront.includes(normSubSub) ||
    normBack.includes(normSubSub) ||
    normComment.includes(normSubSub)
  ) {
    return true;
  }

  const words = normSubSub
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  return (
    words.length > 0 &&
    words.filter(
      (w) =>
        normFront.includes(w) ||
        normBack.includes(w) ||
        normComment.includes(w) ||
        (c.tags && c.tags.some((t) => normalizeText(t).includes(w)))
    ).length >= Math.min(2, words.length)
  );
}

export interface HierarchyCardsCache {
  specMap: Map<string, FlashcardItem[]>;
  temaMap: Map<string, FlashcardItem[]>;
  focoMap: Map<string, FlashcardItem[]>;
  subfocoMap: Map<string, FlashcardItem[]>;
  subSubfocoMap: Map<string, FlashcardItem[]>;
}

export function buildHierarchyCardsCache(
  hierarchy: SpecialtyHierarchy[],
  effectiveCards: FlashcardItem[]
): HierarchyCardsCache {
  const specMap = new Map<string, FlashcardItem[]>();
  const temaMap = new Map<string, FlashcardItem[]>();
  const focoMap = new Map<string, FlashcardItem[]>();
  const subfocoMap = new Map<string, FlashcardItem[]>();
  const subSubfocoMap = new Map<string, FlashcardItem[]>();

  hierarchy.forEach((spec) => {
    const sCards = effectiveCards.filter((c) => cardMatchesSpec(c, spec.especialidade));
    specMap.set(spec.especialidade, sCards);

    spec.temas.forEach((tem) => {
      const tKey = `${spec.especialidade}:::${tem.tema}`;
      const tCards = sCards.filter((c) => cardMatchesTema(c, spec.especialidade, tem.tema));
      temaMap.set(tKey, tCards);

      tem.focos.forEach((foc) => {
        const fKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}`;
        const fCards = tCards.filter((c) =>
          cardMatchesFoco(c, spec.especialidade, tem.tema, foc.foco)
        );
        focoMap.set(fKey, fCards);

        foc.subfocos?.forEach((sub) => {
          const subName = typeof sub === 'string' ? sub : sub.subfoco;
          const subKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}`;
          const subCards = fCards.filter((c) =>
            cardMatchesSubfoco(c, spec.especialidade, tem.tema, foc.foco, subName)
          );
          subfocoMap.set(subKey, subCards);

          // Nível 5: Sub-subfocos (quando existirem na taxonomia)
          if (typeof sub !== 'string' && sub.sub_subfocos) {
            sub.sub_subfocos.forEach((ss) => {
              const ssKey = `${spec.especialidade}:::${tem.tema}:::${foc.foco}:::${subName}:::${ss}`;
              const ssCards = subCards.filter((c) =>
                cardMatchesSubSubfoco(c, spec.especialidade, tem.tema, foc.foco, subName, ss)
              );
              subSubfocoMap.set(ssKey, ssCards);
            });
          }
        });
      });
    });
  });

  return { specMap, temaMap, focoMap, subfocoMap, subSubfocoMap };
}

export function resolveCardsFromHierarchyKeys(
  selectedKeys: string[] | Set<string>,
  cardsCache: HierarchyCardsCache
): FlashcardItem[] {
  const cardSet = new Map<string, FlashcardItem>();
  const keysArray = Array.isArray(selectedKeys) ? selectedKeys : Array.from(selectedKeys);

  keysArray.forEach((key) => {
    if (key.startsWith('spec:')) {
      const specName = key.replace('spec:', '');
      const cards = cardsCache.specMap.get(specName) || [];
      cards.forEach((c) => cardSet.set(c.id, c));
    } else if (key.startsWith('tema:')) {
      const temaKey = key.replace('tema:', '');
      const cards = cardsCache.temaMap.get(temaKey) || [];
      cards.forEach((c) => cardSet.set(c.id, c));
    } else if (key.startsWith('foco:')) {
      const focoKey = key.replace('foco:', '');
      const cards = cardsCache.focoMap.get(focoKey) || [];
      cards.forEach((c) => cardSet.set(c.id, c));
    } else if (key.startsWith('subfoco:')) {
      const subKey = key.replace('subfoco:', '');
      const cards = cardsCache.subfocoMap.get(subKey) || [];
      cards.forEach((c) => cardSet.set(c.id, c));
    } else if (key.startsWith('subsubfoco:') || key.startsWith('sub_subfoco:')) {
      const ssKey = key.replace(/^(subsubfoco|sub_subfoco):/, '');
      const cards = cardsCache.subSubfocoMap.get(ssKey) || [];
      cards.forEach((c) => cardSet.set(c.id, c));
    }
  });

  return Array.from(cardSet.values());
}
