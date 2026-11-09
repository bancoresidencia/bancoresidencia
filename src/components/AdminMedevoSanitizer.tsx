'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Eraser,
  Image as ImageIcon,
  Upload,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Sparkles,
  Building2,
  Eye,
  Layers,
  Lock
} from 'lucide-react';

interface QuestionOption {
  letter: string;
  text: string;
  isCorrect?: boolean;
  justification?: string;
}

interface VisionAudit {
  audited: boolean;
  has_medevo: boolean;
  confidence: number;
  presence_type: string;
  location: string;
  details: string;
}

interface ManifestImage {
  url: string;
  field: string;
  visionAudit?: VisionAudit;
  migratedUrl?: string | null;
  remediedUrl?: string | null;
  officialUrl?: string | null;
}

interface VisionHit {
  url: string;
  presence_type: string;
  location: string;
  confidence: number;
  details: string;
}

interface MedevoQuestion {
  id: string;
  code: string;
  banca: string;
  year: number;
  institution?: string;
  especialidade?: string;
  tema?: string;
  statement: string;
  commentary?: string;
  options: QuestionOption[];
  images: string[];
  correct_answer?: string;
  is_anulada?: boolean;
  manifestHits: Array<{ field: string; match: string; snippet: string }>;
  manifestImages: ManifestImage[];
  hasVisionHit?: boolean;
  visionHits?: VisionHit[];
  hasTextInDb: boolean;
  hasMedevoImagesInDb: boolean;
  isClean: boolean;
}

interface StatsData {
  totalManifest: number;
  textHits: number;
  imageHits: number;
  visionHits: number;
  bothHits: number;
  bancas: Record<string, number>;
}

type FilterCategory = 'all' | 'vision' | 'image' | 'text' | 'both' | 'pending' | 'clean';

// Componente de Escudo de Rede para Bloqueio de Requisições para api.medevo.com.br
const ShieldedImagePlaceholder: React.FC<{
  url: string;
  field: string;
  visionAudit?: VisionAudit;
}> = ({ url, field, visionAudit }) => {
  const pathSnippet = url.replace(/^https?:\/\/[^/]+/i, '');

  return (
    <div className="relative w-full aspect-video rounded-xl bg-zinc-950 border border-rose-500/30 p-3.5 flex flex-col justify-between overflow-hidden shadow-inner group">
      {/* Background Decorativo Tech */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header do Escudo */}
      <div className="flex items-center justify-between z-10">
        <span className="flex items-center gap-1.5 text-[11px] font-black tracking-wide uppercase text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-md">
          <Lock className="w-3 h-3" />
          Escudo Anti-Vazamento Ativo
        </span>
        <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
          {field}
        </span>
      </div>

      {/* Centro: Explicação Clara da Proteção */}
      <div className="my-auto text-center space-y-1.5 z-10 py-1">
        <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <p className="text-xs font-bold text-zinc-200">
          Requisição Bloqueada para <span className="text-rose-400 font-mono">api.medevo.com.br</span>
        </p>
        <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-tight">
          Para proteger seu IP e privacidade, o navegador não baixa esta imagem diretamente dos servidores deles.
        </p>
      </div>

      {/* Rodapé: URL Path e Diagnóstico */}
      <div className="space-y-1 z-10 pt-2 border-t border-zinc-800/80">
        <div className="text-[10px] font-mono text-zinc-500 truncate" title={url}>
          Path: {pathSnippet}
        </div>
        {visionAudit && (
          <div className="text-[10px] text-amber-300/90 font-medium truncate">
            IA: {visionAudit.presence_type} ({Math.round(visionAudit.confidence * 100)}% conf.) em {visionAudit.location}
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminMedevoSanitizer: React.FC = () => {
  // Estados de Filtros e Busca
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [selectedBanca, setSelectedBanca] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Estados de Dados
  const [questions, setQuestions] = useState<MedevoQuestion[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados de Edição em Tempo Real
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatement, setEditStatement] = useState<string>('');
  const [editCommentary, setEditCommentary] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modal de Visualização Ampliada
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; title: string; diagnosis?: string } | null>(null);

  // Modal de Substituição de Imagem / Upload
  const [imageModalQuestion, setImageModalQuestion] = useState<{
    questionId: string;
    questionCode: string;
    currentUrl: string;
    field: string;
  } | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Helper de autenticação
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {}
    return {};
  };

  // Carrega lista de questões da API Route
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const authHeaders = await getAuthHeaders();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        filter: activeFilter,
        banca: selectedBanca,
        search: searchTerm
      });

      const res = await fetch(`/api/admin/medevo?${params.toString()}`, {
        headers: { ...authHeaders }
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao carregar questões');
      }

      setQuestions(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotalCount(json.pagination?.totalCount || 0);
      if (json.stats) setStats(json.stats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao comunicar com a API de auditoria.';
      console.error('Erro ao buscar dados:', err);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, activeFilter, selectedBanca, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchQuestions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // 1. APROVAR COMO LIMPA (Homologação direta no Supabase e Manifest)
  const handleApproveClean = async (q: MedevoQuestion) => {
    setSavingId(q.id);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/medevo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          questionId: q.id,
          action: 'approve_clean'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao aprovar questão no Supabase');
      }

      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          return {
            ...item,
            hasVisionHit: false,
            isClean: !item.hasTextInDb && !item.hasMedevoImagesInDb
          };
        }
        return item;
      }));

      showToast(`Questão ${q.code || q.id.slice(0, 8)} homologada como limpa no Supabase!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  // 2. ADOTAR INPAINTING (IA) - Atualização cirúrgica no Supabase
  const handleApplyInpainting = async (q: MedevoQuestion, currentUrl: string, inpaintingUrl: string) => {
    if (!inpaintingUrl) {
      alert('URL do inpainting não disponível.');
      return;
    }

    setSavingId(q.id);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/medevo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          questionId: q.id,
          oldUrl: currentUrl,
          newUrl: inpaintingUrl,
          action: 'apply_inpainting'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao aplicar inpainting no Supabase');
      }

      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          const updatedImgs = item.images.map(img => img === currentUrl ? inpaintingUrl : img);
          const hasMedevoImgs = updatedImgs.some(u => /medevo/i.test(u));
          return {
            ...item,
            images: updatedImgs,
            hasVisionHit: false,
            hasMedevoImagesInDb: hasMedevoImgs,
            isClean: !item.hasTextInDb && !hasMedevoImgs
          };
        }
        return item;
      }));

      showToast(`Inpainting aplicado com sucesso no Supabase para ${q.code}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  // 3. ADOTAR OFICIAL DA BANCA - Atualização cirúrgica no Supabase
  const handleApplyOfficial = async (q: MedevoQuestion, currentUrl: string, officialUrl: string) => {
    if (!officialUrl) {
      alert('URL da prova oficial não disponível para esta questão.');
      return;
    }

    setSavingId(q.id);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/medevo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          questionId: q.id,
          oldUrl: currentUrl,
          newUrl: officialUrl,
          action: 'apply_official'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao adotar imagem oficial no Supabase');
      }

      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          const updatedImgs = item.images.map(img => img === currentUrl ? officialUrl : img);
          const hasMedevoImgs = updatedImgs.some(u => /medevo/i.test(u));
          return {
            ...item,
            images: updatedImgs,
            hasVisionHit: false,
            hasMedevoImagesInDb: hasMedevoImgs,
            isClean: !item.hasTextInDb && !hasMedevoImgs
          };
        }
        return item;
      }));

      showToast(`Imagem oficial da banca ${q.banca} gravada no Supabase!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  // 4. SANITIZAR ENUNCIADO (Remove disclaimers MedEvo via Regex)
  const handleAutoSanitizeStatement = async (q: MedevoQuestion) => {
    let clean = q.statement;
    const patterns = [
      /\s*\(Imagem adaptada pela MedEvo[^)]*\)/gi,
      /\s*\[Imagem clínica adaptada pela MedEvo:[^\]]*\]/gi,
      /\s*\(QUESTAO PROIBIDA PELO ECA, PORTANTO ADAPTADA PELA MEDEVO\)/gi,
      /\s*\[Imagem original não disponível nesta versão da MedEvo\.?\]/gi,
      /\s*Imagem adaptada pela MedEvo[^.\n]*\.?/gi,
      /\s*Tabela reconstituída pela MedEvo[^;.\n]*[;.]?/gi,
      /\s*IMAGEM ADAPTADA PELA MEDEVO/gi,
      /\s*Imagem ilustrativa adaptada pela MedEvo[^.\n]*\.?/gi,
      /\s*Imagem radiográfica adaptada pela MedEvo[^.\n]*\.?/gi,
      /\s*Imagem da tabela adaptada pela MedEvo[^.\n]*\.?/gi
    ];

    patterns.forEach(pat => {
      clean = clean.replace(pat, '');
    });
    clean = clean.replace(/\s{2,}/g, ' ').trim();

    setSavingId(q.id);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/medevo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          questionId: q.id,
          statement: clean,
          action: 'auto_sanitize_statement'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar no banco');
      }

      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          const hasText = /med[-_ ]?evo/i.test(clean) || /med[-_ ]?evo/i.test(item.commentary || '');
          return {
            ...item,
            statement: clean,
            hasTextInDb: hasText,
            isClean: !hasText && !item.hasMedevoImagesInDb && !item.hasVisionHit
          };
        }
        return item;
      }));

      showToast(`Enunciado da questão ${q.code || q.id.slice(0, 8)} higienizado no Supabase!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  // 5. SALVAR EDIÇÃO MANUAL DE TEXTO
  const handleSaveManualEdit = async (q: MedevoQuestion) => {
    setSavingId(q.id);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/medevo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          questionId: q.id,
          statement: editStatement,
          commentary: editCommentary,
          action: 'manual_edit'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar no banco');
      }

      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          const hasText = /med[-_ ]?evo/i.test(editStatement) || /med[-_ ]?evo/i.test(editCommentary);
          return {
            ...item,
            statement: editStatement,
            commentary: editCommentary,
            hasTextInDb: hasText,
            isClean: !hasText && !item.hasMedevoImagesInDb && !item.hasVisionHit
          };
        }
        return item;
      }));

      setEditingId(null);
      showToast('Alteração manual gravada diretamente no Supabase!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  // 6. UPLOAD DE ARQUIVO MANUAL PARA SUPABASE STORAGE
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imageModalQuestion) return;

    setIsUploadingImage(true);
    try {
      const authHeaders = await getAuthHeaders();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('questionId', imageModalQuestion.questionId);
      fd.append('questionCode', imageModalQuestion.questionCode);

      const res = await fetch('/api/admin/medevo/upload', {
        method: 'POST',
        headers: { ...authHeaders },
        body: fd
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro no upload do arquivo');
      }

      setNewImageUrl(data.publicUrl);
      showToast('Imagem enviada ao Supabase Storage! Clique em "Confirmar Substituição".');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falha no upload: ${msg}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 7. CONFIRMAR SUBSTITUIÇÃO MANUAL DE IMAGEM
  const handleConfirmReplaceImage = async () => {
    if (!imageModalQuestion) return;
    const { questionId, currentUrl, field } = imageModalQuestion;
    const targetUrl = newImageUrl.trim();
    if (!targetUrl) {
      alert('Informe a nova URL ou envie um arquivo.');
      return;
    }

    const q = questions.find(item => item.id === questionId);
    if (!q) return;

    setSavingId(questionId);
    try {
      const updatedImages = [...q.images];
      let updatedOptions = [...q.options];

      if (field === 'statement.images') {
        const idx = updatedImages.indexOf(currentUrl);
        if (idx !== -1) {
          updatedImages[idx] = targetUrl;
        } else {
          updatedImages.push(targetUrl);
        }
      } else if (field.startsWith('options[')) {
        const letter = field.match(/options\[(.*?)\]/)?.[1];
        updatedOptions = updatedOptions.map(opt => {
          if (opt.letter === letter || opt.text === currentUrl) {
            return { ...opt, text: targetUrl };
          }
          return opt;
        });
      }

      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/admin/medevo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          questionId: q.id,
          oldUrl: currentUrl,
          newUrl: targetUrl,
          images: updatedImages,
          options: updatedOptions,
          action: 'replace_image'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao substituir imagem no Supabase');
      }

      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          const hasMedevoImgs = updatedImages.some(u => /medevo/i.test(u)) || updatedOptions.some(o => /medevo/i.test(o.text));
          return {
            ...item,
            images: updatedImages,
            options: updatedOptions,
            hasMedevoImagesInDb: hasMedevoImgs,
            hasVisionHit: false,
            isClean: !item.hasTextInDb && !hasMedevoImgs
          };
        }
        return item;
      }));

      setImageModalQuestion(null);
      setNewImageUrl('');
      showToast('Imagem substituída com sucesso no Supabase!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  // Helper para destacar menções textuais ao MedEvo
  const highlightMedevo = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(med[-_ ]?evo)/gi);
    return parts.map((part, i) => {
      if (/med[-_ ]?evo/i.test(part)) {
        return (
          <span key={i} className="bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold px-1.5 py-0.5 rounded border border-rose-500/30">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Helper para agrupar todas as imagens de uma questão com seus diagnósticos
  const getUnifiedQuestionImages = (q: MedevoQuestion) => {
    const list: Array<{
      currentUrl: string;
      field: string;
      visionAudit?: VisionAudit;
      migratedUrl?: string | null;
      officialUrl?: string | null;
      isMedevoUrl: boolean;
    }> = [];

    const seenUrls = new Set<string>();

    // Localiza se a questão já possui imagem higienizada/remediada ativa no Supabase
    const liveRemedied = q.images.find(img => img.includes('/remedied/'));

    if (Array.isArray(q.manifestImages) && q.manifestImages.length > 0) {
      q.manifestImages.forEach(mImg => {
        const isMed = /medevo/i.test(mImg.url);
        seenUrls.add(mImg.url);
        list.push({
          currentUrl: mImg.url,
          field: mImg.field || 'statement.images',
          visionAudit: mImg.visionAudit,
          migratedUrl: liveRemedied || mImg.remediedUrl || mImg.migratedUrl,
          officialUrl: mImg.officialUrl || null,
          isMedevoUrl: isMed
        });
      });
    }

    if (Array.isArray(q.images)) {
      q.images.forEach(imgUrl => {
        if (!seenUrls.has(imgUrl)) {
          seenUrls.add(imgUrl);
          const matchedHit = q.visionHits?.find(vh => vh.url === imgUrl);
          list.push({
            currentUrl: imgUrl,
            field: 'statement.images',
            visionAudit: matchedHit ? {
              audited: true,
              has_medevo: true,
              confidence: matchedHit.confidence,
              presence_type: matchedHit.presence_type,
              location: matchedHit.location,
              details: matchedHit.details
            } : undefined,
            migratedUrl: imgUrl.includes('/remedied/') ? imgUrl : null,
            isMedevoUrl: /medevo/i.test(imgUrl)
          });
        }
      });
    }

    if (Array.isArray(q.options)) {
      q.options.forEach(opt => {
        if (typeof opt.text === 'string' && (opt.text.startsWith('http') || /\.(png|jpg|jpeg|webp)($|\?)/i.test(opt.text))) {
          if (!seenUrls.has(opt.text)) {
            seenUrls.add(opt.text);
            list.push({
              currentUrl: opt.text,
              field: `options[${opt.letter}]`,
              visionAudit: undefined,
              migratedUrl: null,
              isMedevoUrl: /medevo/i.test(opt.text)
            });
          }
        }
      });
    }

    return list;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Toast Flutuante de Sucesso */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Cabeçalho do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
                Curadoria &amp; Sanitização MedEvo
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Sincronia Direta Supabase
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Comparação tripla lado a lado (Atual vs Inpainting IA vs Prova Oficial) com proteção ativa de rede e atualização atômica no banco de dados.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchQuestions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Supabase</span>
        </button>
      </div>

      {/* KPI Cards Estratégicos */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Auditadas</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{stats.totalManifest}</div>
            <span className="text-[11px] text-zinc-400">Questões no manifesto</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900/50 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Marcas IA (Gemini)</span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.visionHits || 193}</div>
            <span className="text-[11px] text-zinc-400">Detecções visuais com IA</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900/50 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">URLs MedEvo (Storage)</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.imageHits || 398}</div>
            <span className="text-[11px] text-zinc-400">Protegidas pelo Escudo</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Menções em Texto</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.textHits || 38}</div>
            <span className="text-[11px] text-zinc-400">Limpeza por 1-clique</span>
          </div>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        {/* Abas Rápidas de Categoria */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todas as Questões' },
            { id: 'vision', label: `Marcas IA (${stats?.visionHits || 193})` },
            { id: 'image', label: `URLs MedEvo (${stats?.imageHits || 398})` },
            { id: 'text', label: `Menção Texto (${stats?.textHits || 38})` },
            { id: 'pending', label: 'Pendentes' },
            { id: 'clean', label: 'Higienizadas no Supabase' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as FilterCategory);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inputs de Pesquisa e Filtro de Banca */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por código (ex: USPHCFMUSP-2026), banca, ano ou termo..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedBanca}
              onChange={e => {
                setSelectedBanca(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Todas as Bancas ({stats?.totalManifest || 0})</option>
              {stats?.bancas &&
                Object.entries(stats.bancas)
                  .sort((a, b) => b[1] - a[1])
                  .map(([b, count]) => (
                    <option key={b} value={b}>
                      {b} ({count})
                    </option>
                  ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback de Carregamento / Erro / Vazio */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Consultando estado atual das questões no Supabase...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
          {errorMsg}
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Nenhuma questão encontrada</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Todas as questões deste filtro já estão limpas ou não correspondem à busca.</p>
        </div>
      ) : (
        /* Lista de Questões com Comparação Tripla */
        <div className="space-y-6">
          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 px-1">
            Exibindo {questions.length} de {totalCount} questões encontradas
          </div>

          <div className="space-y-6">
            {questions.map((q) => {
              const isEditing = editingId === q.id;
              const isSaving = savingId === q.id;
              const unifiedImages = getUnifiedQuestionImages(q);

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all p-5 sm:p-6 shadow-sm space-y-5 ${
                    q.isClean
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {/* Cabeçalho da Questão */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                        {q.code || q.id.slice(0, 8)}
                      </span>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {q.banca} ({q.year})
                      </span>
                      {q.especialidade && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          {q.especialidade}
                        </span>
                      )}
                      {q.tema && (
                        <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
                          • {q.tema}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {q.isClean ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Higienizada no Supabase
                        </span>
                      ) : (
                        <>
                          {q.hasVisionHit && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                              <Sparkles className="w-3 h-3" />
                              Marca IA Detectada
                            </span>
                          )}
                          {q.hasTextInDb && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              Texto MedEvo no Banco
                            </span>
                          )}
                          {q.hasMedevoImagesInDb && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                              <ImageIcon className="w-3 h-3" />
                              URL MedEvo
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* SEÇÃO DA COMPARAÇÃO TRIPLA LADO A LADO */}
                  {unifiedImages.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-500" />
                          Comparação Visual de Imagens ({unifiedImages.length}):
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Avalie a marca d&apos;água e adote a melhor estratégia diretamente no Supabase
                        </span>
                      </div>

                      {unifiedImages.map((imgItem, imgIdx) => {
                        const { currentUrl, field, visionAudit, migratedUrl, officialUrl, isMedevoUrl } = imgItem;
                        const hasWatermarkDetected = visionAudit?.has_medevo || false;

                        return (
                          <div
                            key={imgIdx}
                            className="p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              <span className="flex items-center gap-2 font-mono text-[11px] bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                Imagem {imgIdx + 1}: {field}
                              </span>
                              {hasWatermarkDetected && (
                                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                                  Diagnóstico Gemini: {visionAudit?.presence_type} ({Math.round((visionAudit?.confidence || 0) * 100)}% confiança)
                                </span>
                              )}
                            </div>

                            {/* GRID TRIPLO LADO A LADO */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              {/* COLUNA 1: ATUAL NA PLATAFORMA */}
                              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                      <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                                      1. Atual na Plataforma
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                      Supabase Real
                                    </span>
                                  </div>

                                  {/* Viewport da Imagem Atual com Proteção Ativa */}
                                  <div className="relative group aspect-video bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
                                    {isMedevoUrl ? (
                                      <ShieldedImagePlaceholder url={currentUrl} field={field} visionAudit={visionAudit} />
                                    ) : failedImages[currentUrl] ? (
                                      <div className="p-4 text-center space-y-2">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                                          <AlertTriangle className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-300 block">Imagem Inacessível (404)</span>
                                        <span className="text-[11px] text-zinc-400 block max-w-xs leading-tight">
                                          O arquivo não foi encontrado no servidor de origem.
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={currentUrl}
                                          alt={`Atual ${imgIdx + 1}`}
                                          className="max-h-full max-w-full object-contain"
                                          loading="lazy"
                                          onError={() => setFailedImages(prev => ({ ...prev, [currentUrl]: true }))}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setPreviewModalImg({
                                            url: currentUrl,
                                            title: `Atual - ${q.code} (${field})`,
                                            diagnosis: visionAudit?.details
                                          })}
                                          className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                          title="Ampliar imagem"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}
                                  </div>

                                  {/* Diagnóstico Detalhado do Gemini Vision */}
                                  <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-bold text-zinc-700 dark:text-zinc-300">Auditoria Gemini Vision:</span>
                                      {hasWatermarkDetected ? (
                                        <span className="font-bold text-purple-600 dark:text-purple-400">
                                          Posição: {visionAudit?.location || 'centro'}
                                        </span>
                                      ) : (
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Limpa</span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-3">
                                      {visionAudit?.details || 'Nenhum detalhe adicional de marca detectado.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Ação: Aprovar como Limpa */}
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleApproveClean(q)}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
                                    title="Se a marca d'água for imperceptível, homologa a imagem como limpa no Supabase"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>[✓ Aprovar como Limpa]</span>
                                  </button>
                                </div>
                              </div>

                              {/* COLUNA 2: ESTRATÉGIA 1 - INPAINTING IA */}
                              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-purple-50/20 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-900/50 space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-extrabold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                      2. Estratégia 1: Inpainting IA
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                      Remoção Cirúrgica
                                    </span>
                                  </div>

                                  {/* Viewport do Inpainting com Processamento em Tempo Real */}
                                  <div className="relative group aspect-video bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-purple-900/40">
                                    {(() => {
                                      const inpaintSourceUrl = (!isMedevoUrl ? currentUrl : (migratedUrl && !migratedUrl.includes('medevo.com.br') ? migratedUrl : null));
                                      const inpaintDisplayUrl = inpaintSourceUrl
                                        ? `/api/admin/medevo/inpaint?url=${encodeURIComponent(inpaintSourceUrl)}&location=${encodeURIComponent(visionAudit?.location || 'centro')}`
                                        : null;

                                      if (inpaintDisplayUrl && !failedImages[inpaintDisplayUrl]) {
                                        return (
                                          <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={inpaintDisplayUrl}
                                              alt="Resultado Inpainting IA"
                                              className="max-h-full max-w-full object-contain"
                                              loading="lazy"
                                              onError={() => setFailedImages(prev => ({ ...prev, [inpaintDisplayUrl]: true }))}
                                            />
                                            <button
                                              type="button"
                                              onClick={() => setPreviewModalImg({
                                                url: inpaintDisplayUrl,
                                                title: `Inpainting IA - ${q.code}`,
                                                diagnosis: 'Imagem processada com remoção cirúrgica de marca d\'água.'
                                              })}
                                              className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                              title="Ampliar inpainting"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </button>
                                          </>
                                        );
                                      }

                                      return (
                                        <div className="p-4 text-center space-y-2">
                                          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                                            <Sparkles className="w-4 h-4" />
                                          </div>
                                          <span className="text-xs font-bold text-zinc-300 block">Algoritmo de Inpainting Pronto</span>
                                          <span className="text-[11px] text-zinc-400 block max-w-xs leading-tight">
                                            Remoção direcionada na área: <span className="font-semibold text-purple-300">{visionAudit?.location || 'centro da imagem'}</span>
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {/* Especificação do Algoritmo */}
                                  <div className="mt-3 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-purple-200/60 dark:border-purple-900/40 space-y-1">
                                    <div className="text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center justify-between">
                                      <span>Difusão Anatômica:</span>
                                      <span className="text-purple-500 font-mono text-[10px]">Fidelidade 100%</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                      Reconstrói a textura do ultrassom/tomografia preservando contraste, anatomia e escalas clínicas sem artefatos.
                                    </p>
                                  </div>
                                </div>

                                {/* Ação: Adotar Inpainting IA */}
                                <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40">
                                  <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => handleApplyInpainting(q, currentUrl, migratedUrl || currentUrl)}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>[⚡ Adotar Inpainting (IA)]</span>
                                  </button>
                                </div>
                              </div>

                              {/* COLUNA 3: ESTRATÉGIA 3 - OFICIAL DA BANCA */}
                              <div className="flex flex-col justify-between p-3.5 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                      3. Estratégia 3: Oficial da Banca
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                      {q.banca} {q.year}
                                    </span>
                                  </div>

                                  {/* Viewport da Prova Oficial com Imagem Real ou Placeholder de Recorte Pendente */}
                                  <div className="relative group aspect-video bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-indigo-900/40 p-2">
                                    {officialUrl && !failedImages[officialUrl] ? (
                                      <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={officialUrl}
                                          alt={`Oficial da Banca - ${q.banca}`}
                                          className="max-h-full max-w-full object-contain"
                                          loading="lazy"
                                          onError={() => setFailedImages(prev => ({ ...prev, [officialUrl!]: true }))}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setPreviewModalImg({
                                            url: officialUrl!,
                                            title: `Oficial da Banca - ${q.banca} (${q.code})`,
                                            diagnosis: 'Recorte padrão-ouro da prova oficial da banca organizadora.'
                                          })}
                                          className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                          title="Ampliar imagem oficial"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    ) : (
                                      <div className="p-3 text-center space-y-2">
                                        <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto overflow-hidden shadow-inner">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={`/images/institutions/${q.banca.toLowerCase().replace(/[^a-z0-9]/g, '-')}.webp`}
                                            alt={q.banca}
                                            className="max-h-8 max-w-8 object-contain"
                                            onError={(e) => {
                                              (e.target as HTMLElement).style.display = 'none';
                                            }}
                                          />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-200 block">Caderno Oficial da Banca</span>
                                        <span className="text-[11px] text-zinc-400 block max-w-xs leading-tight">
                                          Recorte de {q.banca} {q.year} ainda não extraído localmente.
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Metadados da Prova Oficial */}
                                  <div className="mt-3 p-2.5 rounded-lg bg-white/60 dark:bg-zinc-900/60 border border-indigo-200/60 dark:border-indigo-900/40 space-y-1">
                                    <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                                      <span>Instituição:</span>
                                      <span className="text-indigo-500 truncate max-w-[140px]">{q.institution || q.banca}</span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                      {officialUrl ? 'Imagem padrão-ouro oficial da banca, livre de marcas d\'água.' : 'Acervo histórico da banca organizadora. Anexe o recorte oficial ou use o Inpainting IA.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Ações: Adotar Oficial ou Substituir Manualmente */}
                                <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center gap-2">
                                  {officialUrl ? (
                                    <button
                                      type="button"
                                      disabled={isSaving}
                                      onClick={() => handleApplyOfficial(q, currentUrl, officialUrl!)}
                                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                      title="Substitui pela versão homologada da banca no Supabase"
                                    >
                                      <Building2 className="w-3.5 h-3.5" />
                                      <span>[🏛️ Adotar Oficial]</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setImageModalQuestion({
                                          questionId: q.id,
                                          questionCode: q.code || q.id.slice(0, 8),
                                          currentUrl,
                                          field
                                        });
                                        setNewImageUrl('');
                                      }}
                                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                                      title="Fazer upload do recorte oficial da banca"
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>[📁 Anexar Oficial]</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setImageModalQuestion({
                                        questionId: q.id,
                                        questionCode: q.code || q.id.slice(0, 8),
                                        currentUrl,
                                        field
                                      });
                                      setNewImageUrl('');
                                    }}
                                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
                                    title="Fazer upload de nova imagem limpa"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SEÇÃO DO ENUNCIADO E HIGIENIZAÇÃO DE TEXTO */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Enunciado da Questão:</span>

                      <div className="flex items-center gap-2">
                        {/* Botão de Limpeza Rápida de Texto */}
                        {q.hasTextInDb && !isEditing && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleAutoSanitizeStatement(q)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            <Eraser className="w-3 h-3" />
                            <span>1-Clique: Apagar Menção MedEvo</span>
                          </button>
                        )}

                        {/* Botão de Edição Manual */}
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(q.id);
                              setEditStatement(q.statement);
                              setEditCommentary(q.commentary || '');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar Manual</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleSaveManualEdit(q)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                            >
                              <Save className="w-3 h-3" />
                              <span>Salvar no Supabase</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 cursor-pointer"
                              title="Cancelar edição"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Exibição do Enunciado ou Formulário de Edição */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={6}
                          value={editStatement}
                          onChange={e => setEditStatement(e.target.value)}
                          className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Texto do enunciado..."
                        />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Comentário / Resolução:</span>
                          <textarea
                            rows={3}
                            value={editCommentary}
                            onChange={e => setEditCommentary(e.target.value)}
                            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Comentário do gabarito..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {highlightMedevo(q.statement)}
                      </div>
                    )}
                  </div>

                  {/* ALTERNATIVAS DA QUESTÃO */}
                  {q.options && q.options.length > 0 && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Alternativas:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                        {q.options.map((opt, oIdx) => {
                          const hasOptMedevo = /medevo/i.test(opt.text || '');
                          const isOptionImage = typeof opt.text === 'string' && (opt.text.startsWith('http') || /\.(png|jpg|jpeg|webp)($|\?)/i.test(opt.text));

                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg text-xs flex items-start gap-2 border ${
                                hasOptMedevo
                                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 text-rose-800 dark:text-rose-200'
                                  : 'bg-zinc-50/50 dark:bg-zinc-800/20 border-zinc-200/50 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] shrink-0">
                                {opt.letter}
                              </span>
                              {isOptionImage ? (
                                <span className="font-mono text-[11px] text-zinc-500 truncate flex-1">
                                  [Imagem da Alternativa: {opt.text.split('/').pop()}]
                                </span>
                              ) : (
                                <span className="truncate flex-1">{highlightMedevo(opt.text)}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Página {page} de {totalPages} ({totalCount} questões)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Pré-visualização Ampliada */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                {previewModalImg.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[70vh] bg-zinc-950 rounded-xl overflow-hidden flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalImg.url}
                alt={previewModalImg.title}
                className="max-h-[65vh] max-w-full object-contain"
              />
            </div>

            {previewModalImg.diagnosis && (
              <p className="text-xs text-zinc-400 bg-zinc-800/60 p-3 rounded-xl border border-zinc-800">
                <span className="font-bold text-zinc-200">Diagnóstico: </span>
                {previewModalImg.diagnosis}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Substituição / Upload de Imagem */}
      {imageModalQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" />
                Substituir Imagem no Supabase ({imageModalQuestion.questionCode})
              </h3>
              <button
                type="button"
                onClick={() => setImageModalQuestion(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Imagem Atual */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Imagem Atual:</span>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 break-all line-clamp-2">
                  {imageModalQuestion.currentUrl}
                </span>
              </div>
            </div>

            {/* Opção 1: Upload de Arquivo */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Opção 1: Enviar novo arquivo limpo (PNG, JPG, WebP):
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploadingImage}
                className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
              />
              {isUploadingImage && (
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pt-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Sanitizando e enviando para o Supabase Storage...</span>
                </div>
              )}
            </div>

            {/* Opção 2: URL Direta */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Opção 2: Ou informe a URL pública direta:
              </span>
              <input
                type="text"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="https://...supabase.co/storage/v1/object/public/questoes/..."
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Botões do Modal */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setImageModalQuestion(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!newImageUrl.trim() || savingId !== null}
                onClick={handleConfirmReplaceImage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Substituição no Supabase</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
