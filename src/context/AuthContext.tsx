'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAccount, UpdateProfileData } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';

const STORAGE_CURRENT_USER_KEY = 'bancoresidencia_current_user';

export const DEFAULT_DEMO_USER: UserAccount = {
  id: 'user-demo-1',
  name: 'Dr. Lucas Rocha',
  email: 'lucas.rocha@med.br',
  role: 'student',
  avatarUrl: '',
  specialtyTarget: 'Clínica Médica',
  college: 'Faculdade de Medicina (USP)',
  graduationYear: 2025,
  dailyGoal: 30,
  phone: '(11) 98765-4321',
  state: 'SP',
  targetExamName: 'ENARE 2026',
  targetExamDate: '2026-11-01',
  createdAt: '2026-01-15T10:00:00.000Z'
};

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
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
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClient();

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
        (supabaseUser.user_metadata?.target_exam_date as string) ||
        ((profile as Record<string, unknown>)?.target_exam_date as string) ||
        (typeof window !== 'undefined' ? localStorage.getItem(`user_target_exam_date_${supabaseUser.id}`) : null) ||
        undefined;

      return {
        id: supabaseUser.id,
        name: profile?.name || (supabaseUser.user_metadata?.name as string) || (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'Médico Residente'),
        email: supabaseUser.email || '',
        role,
        avatarUrl: profile?.avatar_url || '',
        specialtyTarget: profile?.specialty_target || (supabaseUser.user_metadata?.specialty_target as string) || 'Clínica Médica',
        college: profile?.college || (supabaseUser.user_metadata?.college as string) || '',
        graduationYear: profile?.graduation_year || (supabaseUser.user_metadata?.graduation_year as number) || 2026,
        dailyGoal: profile?.daily_goal || 30,
        phone: profile?.phone || '',
        state: profile?.state || '',
        targetExamName,
        targetExamDate,
        createdAt: profile?.created_at || supabaseUser.created_at || new Date().toISOString()
      };
    } catch {
      return {
        id: supabaseUser.id,
        name: (supabaseUser.user_metadata?.name as string) || 'Médico Residente',
        email: supabaseUser.email || '',
        role: 'student',
        avatarUrl: '',
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

    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          const account = await mapSupabaseUserToAccount(session.user);
          if (isMounted) setUser(account);
        } else if (isMounted) {
          // Checa se há usuário demo local ativo
          const savedUserRaw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
          if (savedUserRaw) {
            const parsed = JSON.parse(savedUserRaw);
            if (parsed?.id === DEFAULT_DEMO_USER.id) {
              setUser(DEFAULT_DEMO_USER);
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const account = await mapSupabaseUserToAccount(session.user);
        if (isMounted) setUser(account);
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) setUser(null);
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, mapSupabaseUserToAccount]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    // Suporte ao usuário de demonstração local
    if (normalizedEmail === DEFAULT_DEMO_USER.email.toLowerCase() && password === 'med123') {
      setUser(DEFAULT_DEMO_USER);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
      return { success: true };
    }

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
        setUser(account);
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }

      return { success: true };
    } catch {
      return { success: false, message: 'Erro de conexão com o servidor de autenticação.' };
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
        setUser(account);
      }

      return { success: true };
    } catch {
      return { success: false, message: 'Falha ao conectar com o serviço de cadastro.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  };

  const loginAsDemo = () => {
    setUser(DEFAULT_DEMO_USER);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
  };

  const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' };

    // Se estiver em modo demo local
    if (user.id === DEFAULT_DEMO_USER.id) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updated));
      if (data.targetExamName) localStorage.setItem(`user_target_exam_name_${user.id}`, data.targetExamName);
      if (data.targetExamDate) localStorage.setItem(`user_target_exam_date_${user.id}`, data.targetExamDate);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bancoresidencia_target_exam_changed'));
      }
      return { success: true, message: 'Perfil demo atualizado!' };
    }

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
          if (data.targetExamName) localStorage.setItem(`user_target_exam_name_${user.id}`, data.targetExamName);
          if (data.targetExamDate) localStorage.setItem(`user_target_exam_date_${user.id}`, data.targetExamDate);
          window.dispatchEvent(new Event('bancoresidencia_target_exam_changed'));
        }
      }

      setUser((prev) => (prev ? { ...prev, ...data } : null));
      return { success: true, message: 'Perfil atualizado com sucesso!' };
    } catch {
      return { success: false, message: 'Erro ao atualizar dados do perfil.' };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' };

    if (user.id === DEFAULT_DEMO_USER.id) {
      return { success: true, message: 'Senha atualizada na conta de demonstração.' };
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
        register,
        logout,
        updateProfile,
        updatePassword,
        updateAvatar,
        loginAsDemo
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
