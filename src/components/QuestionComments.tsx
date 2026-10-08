'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ThumbsUp, Trash2, User, Sparkles } from 'lucide-react';
import { StudentComment } from '@/types';
import { supabase } from '@/lib/supabase';

interface QuestionCommentsProps {
  questionId: string;
  isAnswered: boolean;
  currentUser?: {
    id?: string;
    name?: string;
    avatar?: string;
  };
}

export const QuestionComments: React.FC<QuestionCommentsProps> = ({
  questionId,
  isAnswered,
  currentUser = { name: 'Aluno(a)' }
}) => {
  const [comments, setComments] = useState<StudentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Carrega comentários do Supabase com fallback para localStorage
  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      try {
        // Tenta buscar no Supabase
        const { data, error } = await supabase
          .from('question_comments')
          .select('*')
          .eq('question_id', questionId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          if (isMounted) {
            setComments(
              data.map((c) => ({
                id: c.id,
                questionId: c.question_id,
                userId: c.user_id,
                userName: c.user_name || 'Aluno(a)',
                userAvatar: c.user_avatar,
                content: c.content,
                createdAt: c.created_at,
                likes: c.likes || 0
              }))
            );
            return;
          }
        }
      } catch {
        // Silencia erro se a tabela remota não existir ou estiver offline
      }

      // Fallback para localStorage
      if (typeof window !== 'undefined') {
        try {
          const localData = localStorage.getItem(`medevo_comments_${questionId}`);
          if (localData && isMounted) {
            setComments(JSON.parse(localData));
          }
        } catch {
          // ignore
        }
      }
    }

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [questionId]);

  // Salva no localStorage quando os comentários mudam
  const persistLocally = (updated: StudentComment[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`medevo_comments_${questionId}`, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);

    const commentItem: StudentComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      questionId,
      userId: currentUser.id,
      userName: currentUser.name || 'Aluno(a)',
      userAvatar: currentUser.avatar,
      content: trimmed,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    const updated = [commentItem, ...comments];
    setComments(updated);
    persistLocally(updated);
    setNewComment('');

    // Tenta persistir no Supabase em segundo plano
    try {
      await supabase.from('question_comments').insert([
        {
          id: commentItem.id,
          question_id: commentItem.questionId,
          user_id: commentItem.userId || null,
          user_name: commentItem.userName,
          user_avatar: commentItem.userAvatar || null,
          content: commentItem.content,
          created_at: commentItem.createdAt,
          likes: 0
        }
      ]);
    } catch {
      // Já está salvo no localStorage
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (commentId: string) => {
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        const isLiked = !c.isLiked;
        return {
          ...c,
          isLiked,
          likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1)
        };
      }
      return c;
    });

    setComments(updated);
    persistLocally(updated);

    // Tenta atualizar no Supabase se houver tabela
    try {
      const target = updated.find((c) => c.id === commentId);
      if (target) {
        await supabase
          .from('question_comments')
          .update({ likes: target.likes })
          .eq('id', commentId);
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    persistLocally(updated);

    try {
      await supabase.from('question_comments').delete().eq('id', commentId);
    } catch {
      // ignore
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recente';
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 transition-colors">
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <span>Comentários dos Alunos</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold">
            {comments.length}
          </span>
        </button>

        {!isOpen && comments.length > 0 && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
            Clique para ver e participar da discussão
          </span>
        )}
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-in fade-in duration-200">
          {/* Formulário de Envio de Comentário */}
          <form onSubmit={handleAddComment} className="space-y-2.5">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isAnswered
                    ? 'Compartilhe sua dúvida, raciocínio clínico ou dica prática sobre esta questão...'
                    : 'Recomendamos resolver a questão antes de interagir nos comentários.'
                }
                rows={3}
                maxLength={1000}
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-sans"
              />
              <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-400">
                {newComment.length}/1000
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Espaço colaborativo para tirar dúvidas e fixar conceitos</span>
              </div>

              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  newComment.trim() && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:scale-102 active:scale-98'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Comentar'}</span>
              </button>
            </div>
          </form>

          {/* Listagem de Comentários */}
          {comments.length > 0 ? (
            <div className="space-y-3 pt-2">
              {comments.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs space-y-2 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold shrink-0">
                        {item.userName ? item.userName.slice(0, 2).toUpperCase() : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.userName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(item.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                          item.isLiked
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Curtir comentário"
                      >
                        <ThumbsUp className={`w-3 h-3 ${item.isLiked ? 'fill-current' : ''}`} />
                        <span>{item.likes}</span>
                      </button>

                      {/* Excluir comentário próprio */}
                      {item.userId === currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(item.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Excluir meu comentário"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line pl-9">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Nenhum comentário publicado nesta questão ainda.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Seja o primeiro a deixar uma observação ou tirar uma dúvida com a comunidade!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
