'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShieldAlert,
  Search,
  Eraser,
  Image as ImageIcon,
  Upload,
  Trash2,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Check
} from 'lucide-react';

interface QuestionOption {
  letter: string;
  text: string;
  isCorrect?: boolean;
  justification?: string;
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
  manifestImages: Array<{ url: string; field: string }>;
  hasTextInDb: boolean;
  hasMedevoImagesInDb: boolean;
  isClean: boolean;
}

interface StatsData {
  totalManifest: number;
  textHits: number;
  imageHits: number;
  bothHits: number;
  bancas: Record<string, number>;
}

type FilterCategory = 'all' | 'text' | 'image' | 'both' | 'pending' | 'clean';

export const AdminMedevoSanitizer: React.FC = () => {
  // Estados de Filtros e Busca
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [selectedBanca, setSelectedBanca] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

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

  // Modal de Imagem / Substituição
  const [imageModalQuestion, setImageModalQuestion] = useState<{ questionId: string; currentUrl: string; field: string } | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  // Helper para obter token de autenticação
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {}
    return {};
  };

  // Carrega lista de questões via API Route
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
        headers: {
          ...authHeaders
        }
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
    fetchQuestions();
  }, [fetchQuestions]);

  // Exibe toast temporário
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // 1. Limpeza Automática Inteligente de Menções MedEvo no Enunciado
  const handleAutoSanitizeStatement = async (q: MedevoQuestion) => {
    let clean = q.statement;

    // Expressões regulares de adaptação identificadas na auditoria
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

    // Limpa espaços duplos residuais
    clean = clean.replace(/\s{2,}/g, ' ').trim();

    // Salva direto no Supabase
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

      // Atualiza estado local
      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          const hasText = /med[-_ ]?evo/i.test(clean) || /med[-_ ]?evo/i.test(item.commentary || '');
          return {
            ...item,
            statement: clean,
            hasTextInDb: hasText,
            isClean: !hasText && !item.hasMedevoImagesInDb
          };
        }
        return item;
      }));

      showToast(`Questão ${q.code || q.id} higienizada no Supabase com sucesso!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  // 2. Salvar Edição Manual (Enunciado / Comentário)
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
            isClean: !hasText && !item.hasMedevoImagesInDb
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

  // 3. Remover Imagem da Questão
  const handleRemoveImage = async (q: MedevoQuestion, imgUrlToRemove: string, field: string) => {
    if (!confirm('Deseja realmente remover esta imagem desta questão no Supabase?')) return;

    setSavingId(q.id);
    try {
      let updatedImages = [...q.images];
      let updatedOptions = [...q.options];

      if (field === 'statement.images') {
        updatedImages = updatedImages.filter(url => url !== imgUrlToRemove);
      } else if (field.startsWith('options[')) {
        const letter = field.match(/options\[(.*?)\]/)?.[1];
        updatedOptions = updatedOptions.map(opt => {
          if (opt.letter === letter || opt.text === imgUrlToRemove) {
            return { ...opt, text: '' };
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
          images: updatedImages,
          options: updatedOptions,
          action: 'remove_image'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao remover imagem');

      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          const hasMedevoImgs = updatedImages.some(u => /medevo/i.test(u)) || updatedOptions.some(o => /medevo/i.test(o.text));
          return {
            ...item,
            images: updatedImages,
            options: updatedOptions,
            hasMedevoImagesInDb: hasMedevoImgs,
            isClean: !item.hasTextInDb && !hasMedevoImgs
          };
        }
        return item;
      }));

      showToast('Imagem removida com sucesso no Supabase!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erro: ${msg}`);
    } finally {
      setSavingId(null);
    }
  };

  // 4. Substituir Imagem (Upload de arquivo para Supabase Storage ou nova URL)
  const handleReplaceImage = async () => {
    if (!imageModalQuestion) return;
    const { questionId, currentUrl, field } = imageModalQuestion;
    const targetUrl = newImageUrl.trim();
    if (!targetUrl) {
      alert('Informe a nova URL da imagem ou faça upload de um arquivo.');
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
          images: updatedImages,
          options: updatedOptions,
          action: 'replace_image'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro ao substituir imagem');

      setQuestions(prev => prev.map(item => {
        if (item.id === q.id) {
          const hasMedevoImgs = updatedImages.some(u => /medevo/i.test(u)) || updatedOptions.some(o => /medevo/i.test(o.text));
          return {
            ...item,
            images: updatedImages,
            options: updatedOptions,
            hasMedevoImagesInDb: hasMedevoImgs,
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

  // Upload direto de arquivo para o bucket de questões
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !imageModalQuestion) return;

    setIsUploadingImage(true);
    try {
      const authHeaders = await getAuthHeaders();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('questionId', imageModalQuestion.questionId);

      const res = await fetch('/api/admin/medevo/upload', {
        method: 'POST',
        headers: { ...authHeaders },
        body: fd
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erro no upload do arquivo');

      setNewImageUrl(data.publicUrl);
      showToast('Imagem carregada no Supabase Storage! Clique em "Confirmar Substituição".');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falha no upload: ${msg}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Destaca em vermelho a palavra "medevo"
  const highlightMedevo = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(med[-_ ]?evo)/gi);
    return parts.map((part, i) => {
      if (/med[-_ ]?evo/i.test(part)) {
        return (
          <span key={i} className="bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold px-1 rounded underline decoration-rose-500">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Toast Flutuante */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Cabeçalho do Painel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Auditoria &amp; Higienização MedEvo
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Apenas Administrador
                </span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Revise, higienize textos e substitua imagens de questões afetadas diretamente no banco de dados Supabase.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchQuestions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Supabase</span>
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Auditadas</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalManifest}</div>
            <span className="text-[11px] text-slate-400">Questões no manifesto</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Menções em Texto</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.textHits}</div>
            <span className="text-[11px] text-slate-400">Enunciados / Alternativas</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900/50 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Imagens / Marca d&apos;água</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.imageHits}</div>
            <span className="text-[11px] text-slate-400">Storage / URLs MedEvo</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Ambos (Texto + Imagem)</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.bothHits}</div>
            <span className="text-[11px] text-slate-400">Requerem dupla ação</span>
          </div>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        {/* Abas Rápidas de Categoria */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todas as Questões' },
            { id: 'text', label: 'Menção no Texto (38)' },
            { id: 'image', label: 'Imagens / Marca d\'Água (398)' },
            { id: 'both', label: 'Ambos (26)' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'clean', label: 'Já Higienizadas' }
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
                  : 'bg-zinc-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inputs de Pesquisa e Filtro de Banca */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por código (ex: SUSSP-2021), banca, ano ou termo..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedBanca}
              onChange={e => {
                setSelectedBanca(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

      {/* Feedback de Carregamento / Erro */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Consultando estado atual das questões no Supabase...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm">
          {errorMsg}
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhuma questão encontrada</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Todas as questões deste filtro já foram higienizadas ou não correspondem à busca.</p>
        </div>
      ) : (
        /* Lista de Questões */
        <div className="space-y-6">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            Exibindo {questions.length} de {totalCount} questões encontradas
          </div>

          <div className="space-y-4">
            {questions.map((q) => {
              const isEditing = editingId === q.id;
              const isSaving = savingId === q.id;

              // Coleta todas as imagens associadas
              const allImages = [
                ...q.images.map(url => ({ url, field: 'statement.images' })),
                ...q.options
                  .filter(o => typeof o.text === 'string' && (o.text.startsWith('http') || /\.(png|jpg|jpeg|webp)($|\?)/i.test(o.text)))
                  .map(o => ({ url: o.text, field: `options[${o.letter}]` }))
              ];

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all p-5 shadow-sm ${
                    q.isClean
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200">
                        {q.code || q.id.slice(0, 8)}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {q.banca} ({q.year})
                      </span>
                      {q.especialidade && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-slate-500">
                          {q.especialidade}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {q.isClean ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Higienizada no Supabase
                        </span>
                      ) : (
                        <>
                          {q.hasTextInDb && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              Texto MedEvo no Banco
                            </span>
                          )}
                          {q.hasMedevoImagesInDb && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                              <ImageIcon className="w-3 h-3" />
                              Imagem MedEvo / Marca d&apos;água
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Seção de Imagens da Questão */}
                  {allImages.length > 0 && (
                    <div className="mb-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                          Imagens da Questão ({allImages.length}):
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Verifique se há o símbolo do cérebro azul no fundo
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                        {allImages.map((img, imgIdx) => {
                          const isMedevoUrl = /medevo/i.test(img.url);
                          return (
                            <div
                              key={imgIdx}
                              className={`p-2 rounded-xl border flex flex-col justify-between space-y-2 ${
                                isMedevoUrl
                                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              <div className="relative group aspect-video bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img.url}
                                  alt={`Imagem ${imgIdx + 1}`}
                                  className="max-h-full max-w-full object-contain"
                                />
                                <a
                                  href={img.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Abrir imagem em tamanho real"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-mono text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                    {img.field}
                                  </span>
                                  {isMedevoUrl && (
                                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
                                      Origem MedEvo
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Ações da Imagem */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImageModalQuestion({
                                      questionId: q.id,
                                      currentUrl: img.url,
                                      field: img.field
                                    });
                                    setNewImageUrl('');
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-[11px] font-bold transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Substituir</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleRemoveImage(q, img.url, img.field)}
                                  className="flex items-center justify-center p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 text-[11px] font-bold transition-all cursor-pointer border border-rose-200 dark:border-rose-800"
                                  title="Remover imagem da questão"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Seção de Enunciado */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enunciado:</span>

                      <div className="flex items-center gap-2">
                        {/* Botão de Limpeza Automática com 1 Clique */}
                        {q.hasTextInDb && !isEditing && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleAutoSanitizeStatement(q)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-zinc-100 text-xs font-bold transition-all cursor-pointer"
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
                              className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-500 cursor-pointer"
                              title="Cancelar edição"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Exibição ou Área de Edição do Enunciado */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={6}
                          value={editStatement}
                          onChange={e => setEditStatement(e.target.value)}
                          className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Texto do enunciado..."
                        />
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Comentário / Resolução:</span>
                          <textarea
                            rows={3}
                            value={editCommentary}
                            onChange={e => setEditCommentary(e.target.value)}
                            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Comentário do gabarito..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                        {highlightMedevo(q.statement)}
                      </div>
                    )}
                  </div>

                  {/* Alternativas (Apenas visualização das opções) */}
                  {q.options && q.options.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alternativas:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                        {q.options.map((opt, oIdx) => {
                          const hasOptMedevo = /medevo/i.test(opt.text || '');
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg text-xs flex items-start gap-2 border ${
                                hasOptMedevo
                                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 text-rose-800 dark:text-rose-200'
                                  : 'bg-zinc-50/50 dark:bg-zinc-800/20 border-zinc-200/50 dark:border-zinc-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px]">
                                {opt.letter}
                              </span>
                              <span className="truncate flex-1">{highlightMedevo(opt.text)}</span>
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
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Página {page} de {totalPages} ({totalCount} questões)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Substituição de Imagem */}
      {imageModalQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" />
                Substituir Imagem no Supabase
              </h3>
              <button
                type="button"
                onClick={() => setImageModalQuestion(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Imagem Atual */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Imagem Atual:</span>
              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageModalQuestion.currentUrl}
                  alt="Atual"
                  className="w-16 h-16 object-contain rounded-lg bg-zinc-900"
                />
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all line-clamp-2">
                  {imageModalQuestion.currentUrl}
                </span>
              </div>
            </div>

            {/* Upload de Novo Arquivo */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Opção 1: Enviar novo arquivo limpo (PNG, JPG, WebP):
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploadingImage}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
              />
              {isUploadingImage && (
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Enviando para o Supabase Storage...</span>
                </div>
              )}
            </div>

            {/* Inserir URL Direta */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Opção 2: Ou cole a nova URL da imagem:
              </span>
              <input
                type="text"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="https://bxedpdmgvgatjdfxgxij.supabase.co/storage/..."
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Botões do Modal */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setImageModalQuestion(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!newImageUrl.trim() || savingId !== null}
                onClick={handleReplaceImage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirmar Substituição</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
