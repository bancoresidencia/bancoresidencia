'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAccount, UpdateProfileData } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';
import { validatePasswordRequirements } from '@/utils/security';

const STORAGE_CURRENT_USER_KEY = 'bancoresidencia_current_user';

const STORAGE_CACHED_USER_KEY = 'bancoresidencia_cached_user_session';

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    specialtyTarget?: string;
    college?: string;
    graduationYear?: number;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateAvatar: (avatarUrl: string) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
}


function migrateGuestAnswersToUser(userId: string, supabaseClient: any) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const guestAnswersRaw = localStorage.getItem('bancoresidencia_user_answers_guest') || localStorage.getItem('bancoresidencia_user_answers');
    if (!guestAnswersRaw) return;

    let guestAnswers: Record<string, any>;
    try {
      guestAnswers = JSON.parse(guestAnswersRaw);
    } catch {
      return;
    }
    if (!guestAnswers || typeof guestAnswers !== 'object' || Object.keys(guestAnswers).length === 0) return;

    const userKey = `bancoresidencia_user_answers_${userId}`;
    let existingUserAnswers: Record<string, any> = {};
    try {
      const existingRaw = localStorage.getItem(userKey);
      if (existingRaw) existingUserAnswers = JSON.parse(existingRaw);
    } catch {}

    const merged = { ...guestAnswers, ...existingUserAnswers };
    localStorage.setItem(userKey, JSON.stringify(merged));

    const payload = Object.entries(guestAnswers).map(([qid, ans]: [string, any]) => ({
      user_id: userId,
      question_id: qid,
      selected_option: ans.letter,
      is_correct: ans.isCorrect,
      answered_at: new Date(ans.timestamp || Date.now()).toISOString(),
      specialty: ans.specialty || null,
      tema: ans.tema || null,
      foco: ans.foco || null,
      subfoco: ans.subfoco || null,
      difficulty: ans.difficulty || null,
      banca: ans.banca || null,
      year: ans.year ? Number(ans.year) : null,
      error_reason: ans.errorReason || null,
      student_notes: ans.studentNotes || null,
      status_retrial: ans.statusRetrial || (ans.isCorrect ? 'recuperado' : 'pendente'),
      attempts: ans.attempts || [{ letter: ans.letter, isCorrect: ans.isCorrect, timestamp: ans.timestamp || Date.now() }]
    }));

    if (payload.length > 0) {
      supabaseClient
        .from('user_answers')
        .upsert(payload, { onConflict: 'user_id,question_id' })
        .then(() => {}, () => {});
    }

    localStorage.removeItem('bancoresidencia_user_answers_guest');
  } catch (err) {
    console.warn('[AuthContext] Aviso na migração de respostas de visitante:', err);
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createClient();

  const setPersistedUser = useCallback(
    (account: UserAccount | null | ((prev: UserAccount | null) => UserAccount | null)) => {
      setUser((prev) => {
        const next = typeof account === 'function' ? account(prev) : account;
        if (typeof window !== 'undefined') {
          try {
            if (next) {
              localStorage.setItem(STORAGE_CACHED_USER_KEY, JSON.stringify(next));
            } else {
              localStorage.removeItem(STORAGE_CACHED_USER_KEY);
            }
          } catch {}
        }
        return next;
      });
    },
    []
  );

  const mapSupabaseUserToAccount = useCallback(async (supabaseUser: { id: string; email?: string; created_at?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }): Promise<UserAccount> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      const appRole = supabaseUser.app_metadata?.role as string | undefined;
      const rawRole = profile?.role || appRole || 'student';
      const role: 'admin' | 'curator' | 'curador' | 'superadmin' | 'student' =
        rawRole as 'admin' | 'curator' | 'curador' | 'superadmin' | 'student';

      const targetExamName =
        (supabaseUser.user_metadata?.target_exam_name as string) ||
        ((profile as Record<string, unknown>)?.target_exam_name as string) ||
        (typeof window !== 'undefined' ? localStorage.getItem(`user_target_exam_name_${supabaseUser.id}`) : null) ||
        undefined;

      const targetExamDate =
        ((profile as Record<string, unknown>)?.target_exam_date as string) ||
        (supabaseUser.user_metadata?.target_exam_date as string) ||
        (typeof window !== 'undefined' ? localStorage.getItem(`user_target_exam_date_${supabaseUser.id}`) : null) ||
        undefined;

      const preferences = ((profile as Record<string, unknown>)?.preferences as Record<string, unknown>) || undefined;

      if (typeof window !== 'undefined') {
        if (targetExamName && targetExamDate) {
          localStorage.setItem(`user_target_exam_name_${supabaseUser.id}`, targetExamName);
          localStorage.setItem(`user_target_exam_date_${supabaseUser.id}`, targetExamDate);
          localStorage.setItem('user_target_exam_name', targetExamName);
          localStorage.setItem('user_target_exam_date', targetExamDate);
        }
        if (preferences) {
          if (preferences.themeMode === 'dark' || preferences.themeMode === 'light') {
            localStorage.setItem('banco_theme_mode', preferences.themeMode as string);
          }
          if (typeof preferences.accentColor === 'string') {
            localStorage.setItem('banco_accent_color', preferences.accentColor as string);
          }
          if (typeof preferences.fontSize === 'string') {
            localStorage.setItem('bancoresidencia_question_font_size', preferences.fontSize as string);
          }
          window.dispatchEvent(new CustomEvent('bancoresidencia_preferences_synced', { detail: preferences }));
        }
      };

      const name =
        profile?.name ||
        (supabaseUser.user_metadata?.name as string) ||
        (supabaseUser.user_metadata?.full_name as string) ||
        (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'Médico Residente');

      const avatarUrl =
        profile?.avatar_url ||
        (supabaseUser.user_metadata?.avatar_url as string) ||
        (supabaseUser.user_metadata?.picture as string) ||
        '';

      const subscriptionPlan =
        (profile as Record<string, unknown>)?.subscription_plan as 'free' | 'pro' | 'premium' ||
        (supabaseUser.app_metadata?.subscription_plan as 'free' | 'pro' | 'premium') ||
        (supabaseUser.user_metadata?.subscription_plan as 'free' | 'pro' | 'premium') ||
        'free';

      const subscriptionStatus =
        (profile as Record<string, unknown>)?.subscription_status as 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive' | 'refunded' ||
        (supabaseUser.app_metadata?.subscription_status as 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive' | 'refunded') ||
        (supabaseUser.user_metadata?.subscription_status as 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive' | 'refunded') ||
        'inactive';

      const subscriptionDuration =
        (profile as Record<string, unknown>)?.subscription_duration as 'monthly' | 'semiannual' | 'annual' | 'biennial' ||
        (supabaseUser.user_metadata?.subscription_duration as 'monthly' | 'semiannual' | 'annual' | 'biennial') ||
        undefined;

      const subscriptionExpiresAt =
        ((profile as Record<string, unknown>)?.subscription_expires_at as string) ||
        (supabaseUser.user_metadata?.subscription_expires_at as string) ||
        undefined;

      const guaranteeExpiresAt =
        ((profile as Record<string, unknown>)?.guarantee_expires_at as string) ||
        (supabaseUser.user_metadata?.guarantee_expires_at as string) ||
        undefined;

      return {
        id: supabaseUser.id,
        name,
        email: supabaseUser.email || '',
        role,
        avatarUrl,
        specialtyTarget: profile?.specialty_target || (supabaseUser.user_metadata?.specialty_target as string) || 'Clínica Médica',
        college: profile?.college || (supabaseUser.user_metadata?.college as string) || '',
        graduationYear: profile?.graduation_year || (supabaseUser.user_metadata?.graduation_year as number) || 2026,
        dailyGoal: profile?.daily_goal || 30,
        phone: profile?.phone || '',
        state: profile?.state || '',
        targetExamName,
        targetExamDate,
        preferences,
        subscriptionPlan,
        subscriptionStatus,
        subscriptionDuration,
        subscriptionExpiresAt,
        guaranteeExpiresAt,
        createdAt: profile?.created_at || supabaseUser.created_at || new Date().toISOString()
      };
    } catch {
      const name =
        (supabaseUser.user_metadata?.name as string) ||
        (supabaseUser.user_metadata?.full_name as string) ||
        'Médico Residente';

      const avatarUrl =
        (supabaseUser.user_metadata?.avatar_url as string) ||
        (supabaseUser.user_metadata?.picture as string) ||
        '';

      return {
        id: supabaseUser.id,
        name,
        email: supabaseUser.email || '',
        role: 'student',
        avatarUrl,
        specialtyTarget: 'Clínica Médica',
        college: '',
        graduationYear: 2026,
        dailyGoal: 30,
        targetExamName: (supabaseUser.user_metadata?.target_exam_name as string) || undefined,
        targetExamDate: (supabaseUser.user_metadata?.target_exam_date as string) || undefined,
        createdAt: supabaseUser.created_at || new Date().toISOString()
      };
    }
  }, [supabase]);

  // Sincroniza sessão inicial e ouve alterações de autenticação
  useEffect(() => {
    let isMounted = true;

    // Leitura síncrona do cache do localStorage no cliente pós-hidratação para evitar qualquer flash
    try {
      const cached = localStorage.getItem(STORAGE_CACHED_USER_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          setUser(parsed as UserAccount);
          setIsLoading(false);
        }
      }
    } catch {}

    async function initSession() {
      try {
        // 1. Processa código de autenticação OAuth se presente na URL (?code=...)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const authCode = urlParams.get('code');
          if (authCode) {
            try {
              const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
              if (!exchangeError && exchangeData?.session?.user) {
                // Limpa o ?code da barra de endereços mantendo a URL limpa
                const cleanUrl = window.location.pathname + (window.location.hash || '');
                window.history.replaceState({}, document.title, cleanUrl);

                const account = await mapSupabaseUserToAccount(exchangeData.session.user);
                if (isMounted) {
                  setPersistedUser(account);
                  setIsLoading(false);
                  return;
                }
              } else if (exchangeError) {
                console.warn('[AuthContext] Erro ao trocar código OAuth:', exchangeError.message);
              }
            } catch (exchangeErr) {
              console.warn('[AuthContext] Falha na troca do código OAuth:', exchangeErr);
            }
          }
        }

        // 2. Busca a sessão existente
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          const account = await mapSupabaseUserToAccount(session.user);
          if (isMounted) setPersistedUser(account);
        } else if (isMounted) {
          // Remove resquícios de credenciais de demonstração ou sessões antigas
          localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
          setPersistedUser(null);
        }
      } catch {
        if (isMounted) setPersistedUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const account = await mapSupabaseUserToAccount(session.user);
        if (isMounted) setPersistedUser(account);
        migrateGuestAnswersToUser(session.user.id, supabase);
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) setPersistedUser(null);
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
        localStorage.removeItem(STORAGE_CACHED_USER_KEY);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, mapSupabaseUserToAccount]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        const account = await mapSupabaseUserToAccount(data.user);
        setPersistedUser(account);
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
        migrateGuestAnswersToUser(data.user.id, supabase);
      }

      return { success: true };
    } catch {
      return { success: false, message: 'Erro de conexão com o servidor de autenticação.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      // Define URL de retorno com prioridade para o domínio de produção oficial
      let redirectUrl = 'https://bancoresidencia-kappa.vercel.app';
      if (typeof window !== 'undefined') {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          redirectUrl = window.location.origin;
        } else {
          redirectUrl = window.location.origin || 'https://bancoresidencia-kappa.vercel.app';
        }
      }

      // Preserva intenção de plano pendente se houver no storage
      let callbackNext = '/';
      if (typeof window !== 'undefined') {
        const pendingPlan = localStorage.getItem('pending_checkout_plan') || sessionStorage.getItem('pending_checkout_plan');
        if (pendingPlan) {
          callbackNext = `/?plan=${encodeURIComponent(pendingPlan)}&checkout=1`;
        }
      }

      const finalRedirectTo = `${redirectUrl}/auth/callback?next=${encodeURIComponent(callbackNext)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: finalRedirectTo
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch {
      return { success: false, message: 'Falha ao conectar com o serviço de autenticação Google.' };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    specialtyTarget?: string;
    college?: string;
    graduationYear?: number;
  }): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = data.email.trim().toLowerCase();

    const validation = validatePasswordRequirements(data.password);
    if (!validation.isValid) {
      return { success: false, message: validation.errorMessage || 'A senha não atende aos requisitos de segurança.' };
    }

    try {
      const { data: res, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password,
        options: {
          data: {
            name: data.name.trim(),
            specialty_target: data.specialtyTarget || 'Clínica Médica',
            college: data.college || '',
            graduation_year: data.graduationYear || new Date().getFullYear()
          }
        }
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (res.user) {
        const account = await mapSupabaseUserToAccount(res.user);
        setPersistedUser(account);
      }

      return { success: true };
    } catch {
      return { success: false, message: 'Falha ao conectar com o serviço de cadastro.' };
    }
  };

  const logout = async () => {
    const currentUserId = user?.id;
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    localStorage.removeItem(STORAGE_CACHED_USER_KEY);
    setPersistedUser(null);

    // Higienização completa de dados sensíveis da conta no navegador
    if (currentUserId && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`bancoresidencia_user_answers_${currentUserId}`);
        localStorage.removeItem(`bancoresidencia_folders_${currentUserId}`);
        localStorage.removeItem(`bancoresidencia_lists_${currentUserId}`);
        localStorage.removeItem(`bancoresidencia_bookmarks_${currentUserId}`);
        localStorage.removeItem(`bancoresidencia_custom_decks_${currentUserId}`);
        localStorage.removeItem(`bancoresidencia_user_cards_${currentUserId}`);
        localStorage.removeItem(`bancoresidencia_flashcards_progress_${currentUserId}`);
        localStorage.removeItem(`user_target_exam_name_${currentUserId}`);
        localStorage.removeItem(`user_target_exam_date_${currentUserId}`);
      } catch {}
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' };

    try {
      const updatePayload: Record<string, unknown> = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.specialtyTarget !== undefined) updatePayload.specialty_target = data.specialtyTarget;
      if (data.college !== undefined) updatePayload.college = data.college;
      if (data.graduationYear !== undefined) updatePayload.graduation_year = data.graduationYear;
      if (data.dailyGoal !== undefined) updatePayload.daily_goal = data.dailyGoal;
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.state !== undefined) updatePayload.state = data.state;
      if (data.avatarUrl !== undefined) updatePayload.avatar_url = data.avatarUrl;
      if (data.targetExamName !== undefined) updatePayload.target_exam_name = data.targetExamName;
      if (data.targetExamDate !== undefined) updatePayload.target_exam_date = data.targetExamDate;
      if (data.preferences !== undefined) updatePayload.preferences = data.preferences;

      if (Object.keys(updatePayload).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', user.id);

        if (error) {
          return { success: false, message: error.message };
        }
      }

      if (data.targetExamName || data.targetExamDate) {
        const metadataUpdate: Record<string, string> = {};
        if (data.targetExamName) metadataUpdate.target_exam_name = data.targetExamName;
        if (data.targetExamDate) metadataUpdate.target_exam_date = data.targetExamDate;
        await supabase.auth.updateUser({ data: metadataUpdate }).catch(() => {});
        if (typeof window !== 'undefined') {
          if (data.targetExamName) {
            localStorage.setItem(`user_target_exam_name_${user.id}`, data.targetExamName);
            localStorage.setItem('user_target_exam_name', data.targetExamName);
          }
          if (data.targetExamDate) {
            localStorage.setItem(`user_target_exam_date_${user.id}`, data.targetExamDate);
            localStorage.setItem('user_target_exam_date', data.targetExamDate);
          }
          window.dispatchEvent(new Event('bancoresidencia_target_exam_changed'));
        }
      }

      setPersistedUser((prev) => (prev ? { ...prev, ...data } : null));
      return { success: true, message: 'Perfil atualizado com sucesso!' };
    } catch {
      return { success: false, message: 'Erro ao atualizar dados do perfil.' };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' };

    const validation = validatePasswordRequirements(newPassword);
    if (!validation.isValid) {
      return { success: false, message: validation.errorMessage || 'A nova senha não atende aos requisitos de segurança.' };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Senha alterada com sucesso!' };
    } catch {
      return { success: false, message: 'Erro ao conectar ao servidor para alterar senha.' };
    }
  };

  const updateAvatar = async (avatarUrl: string): Promise<{ success: boolean; message?: string }> => {
    return updateProfile({ avatarUrl });
  };

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const updated = await mapSupabaseUserToAccount(currentUser);
        setPersistedUser(updated);
      }
    } catch (err) {
      console.error('Erro ao recarregar usuário:', err);
    }
  }, [supabase, mapSupabaseUserToAccount]);

  const isAdmin = Boolean(
    user &&
      (user.role === 'admin' ||
        user.role === 'curator' ||
        user.role === 'curador' ||
        user.role === 'superadmin')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        updatePassword,
        updateAvatar,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
