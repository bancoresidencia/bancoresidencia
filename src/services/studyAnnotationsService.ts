import { StudyHighlight } from '@/types/studyMaterialAnnotations';
import { createClient } from '@/lib/supabase/client';

const HIGHLIGHTS_STORAGE_PREFIX = 'bancoresidencia_study_highlights_';

export function getHighlightsStorageKey(materialId: string, userId?: string | null): string {
  const userSegment = userId ? `user_${userId}` : 'guest';
  return `${HIGHLIGHTS_STORAGE_PREFIX}${userSegment}_${materialId}`;
}

export const studyAnnotationsService = {
  /**
   * Carrega os grifos e notas salvos do material (cache local instantâneo + sincronização Supabase)
   */
  loadMaterialHighlights(materialId: string, userId?: string | null): StudyHighlight[] {
    if (typeof window === 'undefined') return [];

    try {
      const key = getHighlightsStorageKey(materialId, userId);
      const data = localStorage.getItem(key);
      const localHighlights: StudyHighlight[] = data ? JSON.parse(data) : [];

      // Sincronização assíncrona em background se o usuário estiver autenticado
      if (userId && userId !== 'demo-student') {
        this.syncRemoteHighlights(materialId, userId, localHighlights).catch((err) => {
          console.warn('[studyAnnotationsService] Falha na sincronização remota:', err);
        });
      }

      return localHighlights;
    } catch (e) {
      console.warn('[studyAnnotationsService] Erro ao carregar grifos:', e);
      return [];
    }
  },

  /**
   * Salva os grifos no localStorage e sincroniza no Supabase
   */
  async saveMaterialHighlights(
    materialId: string,
    highlights: StudyHighlight[],
    userId?: string | null
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const key = getHighlightsStorageKey(materialId, userId);
      localStorage.setItem(key, JSON.stringify(highlights));

      if (userId && userId !== 'demo-student') {
        const client = createClient();
        // Tenta sincronizar com o Supabase sem bloquear a UI do estudante
        for (const hl of highlights) {
          client
            .from('user_study_highlights')
            .upsert(
              {
                id: hl.id,
                user_id: userId,
                material_id: materialId,
                text_quote: hl.textQuote,
                color: hl.color,
                style: hl.style,
                note: hl.note || null,
                created_at: hl.createdAt,
                updated_at: hl.updatedAt || new Date().toISOString()
              },
              { onConflict: 'id' }
            )
            .then(() => {}, () => {});
        }
      }
    } catch (e) {
      console.warn('[studyAnnotationsService] Erro ao salvar grifos:', e);
    }
  },

  /**
   * Adiciona um novo grifo
   */
  addHighlight(
    materialId: string,
    highlight: StudyHighlight,
    userId?: string | null
  ): StudyHighlight[] {
    const current = this.loadMaterialHighlights(materialId, userId);
    // Evita duplicatas exatas do mesmo texto com mesma cor
    // Evita duplicatas exatas do mesmo trecho na mesma posicao
    const filtered = current.filter((h) => h.id !== highlight.id && !(h.textQuote.toLowerCase() === highlight.textQuote.toLowerCase() && h.prefix === highlight.prefix && h.suffix === highlight.suffix));
    const updated = [highlight, ...filtered];
    this.saveMaterialHighlights(materialId, updated, userId);
    return updated;
  },

  /**
   * Remove um grifo pelo ID
   */
  removeHighlight(
    materialId: string,
    highlightId: string,
    userId?: string | null
  ): StudyHighlight[] {
    const current = this.loadMaterialHighlights(materialId, userId);
    const updated = current.filter((h) => h.id !== highlightId);
    this.saveMaterialHighlights(materialId, updated, userId);

    if (userId && userId !== 'demo-student' && typeof window !== 'undefined') {
      const client = createClient();
      client
        .from('user_study_highlights')
        .delete()
        .eq('id', highlightId)
        .eq('user_id', userId)
        .then(() => {}, () => {});
    }

    return updated;
  },

  /**
   * Atualiza cor, estilo ou nota de um grifo
   */
  updateHighlight(
    materialId: string,
    highlightId: string,
    updates: Partial<StudyHighlight>,
    userId?: string | null
  ): StudyHighlight[] {
    const current = this.loadMaterialHighlights(materialId, userId);
    const updated = current.map((h) => {
      if (h.id === highlightId) {
        return {
          ...h,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return h;
    });

    this.saveMaterialHighlights(materialId, updated, userId);
    return updated;
  },

  /**
   * Sincronização remota em background com reconciliação não-bloqueante
   */
  async syncRemoteHighlights(
    materialId: string,
    userId: string,
    localHighlights: StudyHighlight[]
  ): Promise<StudyHighlight[]> {
    try {
      const client = createClient();
      const { data, error } = await client
        .from('user_study_highlights')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId);

      if (error || !data) return localHighlights;

      const remoteMap = new Map<string, StudyHighlight>();
      data.forEach((row: any) => {
        remoteMap.set(row.id, {
          id: row.id,
          materialId: row.material_id,
          userId: row.user_id,
          textQuote: row.text_quote,
          color: row.color,
          style: row.style,
          note: row.note || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        });
      });

      // Mescla priorizando a versão mais recente
      const mergedMap = new Map<string, StudyHighlight>();
      localHighlights.forEach((h) => mergedMap.set(h.id, h));
      remoteMap.forEach((h, id) => {
        if (!mergedMap.has(id)) {
          mergedMap.set(id, h);
        }
      });

      const merged = Array.from(mergedMap.values());
      const key = getHighlightsStorageKey(materialId, userId);
      localStorage.setItem(key, JSON.stringify(merged));
      return merged;
    } catch {
      return localHighlights;
    }
  }
};

