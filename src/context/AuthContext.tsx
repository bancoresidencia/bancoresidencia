'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UpdateProfileData } from '@/types/auth';

const STORAGE_USERS_KEY = 'bancoresidencia_registered_users';
const STORAGE_CURRENT_USER_KEY = 'bancoresidencia_current_user';

const DEFAULT_DEMO_USER: UserAccount = {
  id: 'user-demo-1',
  name: 'Dr. Lucas Rocha',
  email: 'lucas.rocha@med.br',
  password: 'med123',
  avatarUrl: '',
  specialtyTarget: 'Clínica Médica',
  college: 'Faculdade de Medicina (USP)',
  graduationYear: 2025,
  dailyGoal: 30,
  phone: '(11) 98765-4321',
  state: 'SP',
  createdAt: '2026-01-15T10:00:00.000Z'
};

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
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
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateAvatar: (avatarUrl: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUsersRaw = localStorage.getItem(STORAGE_USERS_KEY);
      let usersList: UserAccount[] = [];
      if (storedUsersRaw) {
        usersList = JSON.parse(storedUsersRaw);
      } else {
        usersList = [DEFAULT_DEMO_USER];
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(usersList));
      }

      const savedUserRaw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (savedUserRaw) {
        const savedUser = JSON.parse(savedUserRaw);
        setUser(usersList.find((u) => u.id === savedUser.id) || savedUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUsersList = (users: UserAccount[]) => {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  };

  const saveCurrentUser = (currentUser: UserAccount | null) => {
    setUser(currentUser);
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const rawUsers = localStorage.getItem(STORAGE_USERS_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : [DEFAULT_DEMO_USER];

    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!foundUser) {
      return { success: false, message: 'Nenhuma conta encontrada com este e-mail.' };
    }

    if (foundUser.password !== password) {
      return { success: false, message: 'Senha incorreta. Verifique suas credenciais.' };
    }

    saveCurrentUser(foundUser);
    return { success: true };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    specialtyTarget?: string;
    college?: string;
    graduationYear?: number;
  }): Promise<{ success: boolean; message?: string }> => {
    const rawUsers = localStorage.getItem(STORAGE_USERS_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : [DEFAULT_DEMO_USER];

    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existing) {
      return { success: false, message: 'Já existe um cadastro com este endereço de e-mail.' };
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      password: data.password,
      avatarUrl: '',
      specialtyTarget: data.specialtyTarget || 'Clínica Médica',
      college: data.college || '',
      graduationYear: data.graduationYear || new Date().getFullYear(),
      dailyGoal: 30,
      createdAt: new Date().toISOString()
    };

    const updatedList = [...users, newUser];
    saveUsersList(updatedList);
    saveCurrentUser(newUser);

    return { success: true };
  };

  const logout = () => {
    saveCurrentUser(null);
  };

  const loginAsDemo = () => {
    saveCurrentUser(DEFAULT_DEMO_USER);
  };

  const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' };

    const rawUsers = localStorage.getItem(STORAGE_USERS_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : [DEFAULT_DEMO_USER];

    // Se o e-mail foi alterado, checa duplicidade
    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = users.some(
        (u) => u.id !== user.id && u.email.toLowerCase() === data.email!.trim().toLowerCase()
      );
      if (emailExists) {
        return { success: false, message: 'Este e-mail já está sendo utilizado por outro aluno.' };
      }
    }

    const updatedUser: UserAccount = {
      ...user,
      ...data,
      email: data.email ? data.email.trim().toLowerCase() : user.email
    };

    const updatedList = users.map((u) => (u.id === user.id ? updatedUser : u));
    saveUsersList(updatedList);
    saveCurrentUser(updatedUser);

    return { success: true, message: 'Perfil atualizado com sucesso!' };
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'Usuário não autenticado.' };

    if (user.password && user.password !== currentPassword) {
      return { success: false, message: 'A senha atual informada está incorreta.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'A nova senha deve possuir no mínimo 6 caracteres.' };
    }

    const rawUsers = localStorage.getItem(STORAGE_USERS_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : [DEFAULT_DEMO_USER];

    const updatedUser: UserAccount = {
      ...user,
      password: newPassword
    };

    const updatedList = users.map((u) => (u.id === user.id ? updatedUser : u));
    saveUsersList(updatedList);
    saveCurrentUser(updatedUser);

    return { success: true, message: 'Senha alterada com sucesso!' };
  };

  const updateAvatar = async (avatarUrl: string): Promise<{ success: boolean; message?: string }> => {
    return updateProfile({ avatarUrl });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
