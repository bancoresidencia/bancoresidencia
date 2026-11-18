import { StudyHighlight } from '@/types/studyMaterialAnnotations';
import { createClient } from '@/lib/supabase/client';

const HIGHLIGHTS_STORAGE_PREFIX = 'bancoresidencia_study_highlights_';

export function getHighlightsStorageKey(materialId: string, userId?: string | null): string {
  const userSegment = userId ? `user_${userId}` : 'guest';
  return `${HIGHLIGHTS_STORAGE_PREFIX}${userSegment}_${materialId}`;
}

export const studyAnnotationsService = {
  /**
   * Carrega os grifos e notas salvos do material (cache local instantâneo + reconciliação reativa Supabase)
   */
  loadMaterialHighlights(
    materialId: string,
    userId?: string | null,
    onRemoteSynced?: (highlights: StudyHighlight[]) => void
  ): StudyHighlight[] {
    if (typeof window === 'undefined') return [];

    try {
      const key = getHighlightsStorageKey(materialId, userId);
      const data = localStorage.getItem(key);
      const localHighlights: StudyHighlight[] = data ? JSON.parse(data) : [];

      if (userId && userId !== 'demo-student') {
        this.syncRemoteHighlights(materialId, userId, localHighlights)
          .then((merged) => {
            if (onRemoteSynced) {
              onRemoteSynced(merged);
            }
          })
          .catch((err) => {
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
   * Salva os grifos no localStorage e sincroniza em lote no Supabase
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

      if (userId && userId !== 'demo-student' && highlights.length > 0) {
        const client = createClient();
        const payload = highlights.map((hl) => ({
          id: hl.id,
          user_id: userId,
          material_id: materialId,
          text_quote: hl.textQuote,
          color: hl.color,
          style: hl.style,
          note: hl.note || null,
          created_at: hl.createdAt,
          updated_at: hl.updatedAt || new Date().toISOString()
        }));

        client
          .from('user_study_highlights')
          .upsert(payload, { onConflict: 'id' })
          .then(() => {}, () => {});
      }
    } catch (e) {
      console.warn('[studyAnnotationsService] Erro ao salvar grifos:', e);
    }
  },

  addHighlight(
    materialId: string,
    highlight: StudyHighlight,
    userId?: string | null
  ): StudyHighlight[] {
    const current = this.loadMaterialHighlights(materialId, userId);
    const filtered = current.filter(
      (h) =>
        h.id !== highlight.id &&
        !(
          h.textQuote.toLowerCase() === highlight.textQuote.toLowerCase() &&
          h.prefix === highlight.prefix &&
          h.suffix === highlight.suffix
        )
    );
    const updated = [highlight, ...filtered];
    this.saveMaterialHighlights(materialId, updated, userId);
    return updated;
  },

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
   * Sincronização remota bidirecional: compara updatedAt e envia grifos locais faltantes
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

      interface DbHighlightRow {
        id: string;
        material_id: string;
        user_id: string;
        text_quote: string;
        color: StudyHighlight['color'];
        style: StudyHighlight['style'];
        note?: string | null;
        created_at: string;
        updated_at?: string;
      }

      const remoteMap = new Map<string, StudyHighlight>();
      for (const row of data as unknown as DbHighlightRow[]) {
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
      }

      const mergedMap = new Map<string, StudyHighlight>();
      const toUpload: StudyHighlight[] = [];

      for (const localHl of localHighlights) {
        const remoteHl = remoteMap.get(localHl.id);
        if (!remoteHl) {
          mergedMap.set(localHl.id, localHl);
          toUpload.push(localHl);
        } else {
          const localTs = localHl.updatedAt ? new Date(localHl.updatedAt).getTime() : 0;
          const remoteTs = remoteHl.updatedAt ? new Date(remoteHl.updatedAt).getTime() : 0;
          if (remoteTs >= localTs) {
            mergedMap.set(remoteHl.id, {
              ...localHl,
              ...remoteHl,
              prefix: localHl.prefix,
              suffix: localHl.suffix
            });
          } else {
            mergedMap.set(localHl.id, localHl);
            toUpload.push(localHl);
          }
        }
      }

      remoteMap.forEach((remoteHl, id) => {
        if (!mergedMap.has(id)) {
          mergedMap.set(id, remoteHl);
        }
      });

      const merged = Array.from(mergedMap.values());
      const key = getHighlightsStorageKey(materialId, userId);
      localStorage.setItem(key, JSON.stringify(merged));

      if (toUpload.length > 0) {
        const payload = toUpload.map((hl) => ({
          id: hl.id,
          user_id: userId,
          material_id: materialId,
          text_quote: hl.textQuote,
          color: hl.color,
          style: hl.style,
          note: hl.note || null,
          created_at: hl.createdAt,
          updated_at: hl.updatedAt || new Date().toISOString()
        }));
        client
          .from('user_study_highlights')
          .upsert(payload, { onConflict: 'id' })
          .then(() => {}, () => {});
      }

      return merged;
    } catch {
      return localHighlights;
    }
  }
};
