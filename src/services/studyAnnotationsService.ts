import { StudyHighlight } from '@/types/studyMaterialAnnotations';
import { createClient } from '@/lib/supabase/client';

const HIGHLIGHTS_STORAGE_PREFIX = 'bancoresidencia_study_highlights_';

export function getHighlightsStorageKey(materialId: string, userId?: string | null): string {
  const userSegment = userId ? `user_${userId}` : 'guest';
  return `${HIGHLIGHTS_STORAGE_PREFIX}${userSegment}_${materialId}`;
}

async function upsertHighlightsBatchResilient(
  materialId: string,
  highlights: StudyHighlight[],
  userId: string
): Promise<void> {
  if (!highlights.length || !userId || userId === 'demo-student') return;
  try {
    const client = createClient();
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData?.session) return;

    const extendedPayload = highlights.map((hl) => ({
      id: hl.id,
      user_id: userId,
      material_id: materialId,
      text_quote: hl.textQuote,
      prefix: hl.prefix || null,
      suffix: hl.suffix || null,
      color: hl.color,
      style: hl.style,
      note: hl.note || null,
      created_at: hl.createdAt,
      updated_at: hl.updatedAt || new Date().toISOString()
    }));

    const { error } = await client
      .from('user_study_highlights')
      .upsert(extendedPayload, { onConflict: 'id' });

    if (error && error.code !== 'PGRST205' && error.code !== '42P01') {
      const basePayload = highlights.map((hl) => ({
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
      await client.from('user_study_highlights').upsert(basePayload, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('[studyAnnotationsService] Erro ao persistir grifos no Supabase:', err);
  }
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
        await upsertHighlightsBatchResilient(materialId, highlights, userId);
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
    const safeHighlight: StudyHighlight = {
      ...highlight,
      id:
        highlight.id && highlight.id.length > 24
          ? highlight.id
          : typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `hl-${crypto.randomUUID()}`
          : `hl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    };
    const current = this.loadMaterialHighlights(materialId, userId);
    const filtered = current.filter(
      (h) =>
        h.id !== safeHighlight.id &&
        !(
          h.textQuote.toLowerCase() === safeHighlight.textQuote.toLowerCase() &&
          h.prefix === safeHighlight.prefix &&
          h.suffix === safeHighlight.suffix
        )
    );
    const updated = [safeHighlight, ...filtered];
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
    void this.saveMaterialHighlights(materialId, updated, userId);

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

    void this.saveMaterialHighlights(materialId, updated, userId);
    return updated;
  },

  /**
   * Sincronização remota bidirecional: compara updatedAt, preserva âncoras prefix/suffix e envia grifos locais faltantes
   */
  async syncRemoteHighlights(
    materialId: string,
    userId: string,
    localHighlights: StudyHighlight[]
  ): Promise<StudyHighlight[]> {
    try {
      const client = createClient();
      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData?.session) return localHighlights;

      const { data, error } = await client
        .from('user_study_highlights')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId);

      if (error || !data) return localHighlights;

      const remoteMap = new Map<string, StudyHighlight>();
      for (const row of data as Record<string, unknown>[]) {
        const id = String(row.id);
        remoteMap.set(id, {
          id,
          materialId: String(row.material_id || materialId),
          userId: String(row.user_id || userId),
          textQuote: String(row.text_quote || ''),
          prefix: typeof row.prefix === 'string' ? row.prefix : undefined,
          suffix: typeof row.suffix === 'string' ? row.suffix : undefined,
          color: row.color as StudyHighlight['color'],
          style: row.style as StudyHighlight['style'],
          note: typeof row.note === 'string' ? row.note : undefined,
          createdAt: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString(),
          updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined
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
              prefix: remoteHl.prefix || localHl.prefix,
              suffix: remoteHl.suffix || localHl.suffix
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
        await upsertHighlightsBatchResilient(materialId, toUpload, userId);
      }

      return merged;
    } catch {
      return localHighlights;
    }
  }
};
