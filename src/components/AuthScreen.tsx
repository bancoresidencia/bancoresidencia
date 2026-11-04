'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/Logo';
import { validatePasswordRequirements } from '@/utils/security';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: (planTitle?: string, isNewRegister?: boolean) => void;
  initialMode?: 'login' | 'register';
  onClose?: () => void;
  selectedPlanTitle?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  initialMode = 'login',
  onClose,
  selectedPlanTitle
}) => {
  const { login, loginWithGoogle, register } = useAuth();
  const { accentConfig } = useTheme();

  const planDisplayName = selectedPlanTitle === 'monthly' ? 'Plano Mensal'
    : selectedPlanTitle === 'semiannual' ? 'Plano Semestral'
    : selectedPlanTitle === 'annual' ? 'Plano Anual'
    : selectedPlanTitle === 'biennial' ? 'Plano Bienal'
    : selectedPlanTitle;

  // 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOver18, setIsOver18] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // UI States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleToggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setConfirmPassword('');
    setShowConfirmPassword(false);
    resetMessages();
  };

  // Avaliação de Força da Senha
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Fraca', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, label: 'Boa', color: 'bg-amber-500' };
    return { score: 3, label: 'Forte', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordValidation = validatePasswordRequirements(password);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !password) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Login realizado com sucesso! Redirecionando...');
        if (onSuccess) setTimeout(() => onSuccess(selectedPlanTitle), 500);
      } else {
        setErrorMsg(res.message || 'Falha ao realizar login.');
      }
    } catch {
      setErrorMsg('Ocorreu um erro inesperado ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, insira um endereço de e-mail válido.');
      return;
    }
    const validation = validatePasswordRequirements(password);
    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || 'A senha deve conter no mínimo 6 caracteres, uma letra maiúscula, um número e um símbolo.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem. Por favor, repita a mesma senha.');
      return;
    }
    if (!isOver18) {
      setErrorMsg('Você precisa confirmar ter 18 anos ou mais para criar sua conta.');
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg('Você precisa aceitar os Termos de Uso e Política de Privacidade.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: name.trim(),
        email,
        password
      });

      if (res.success) {
        setSuccessMsg('Conta criada com sucesso! Redirecionando para a configuração do seu perfil...');
        if (onSuccess) setTimeout(() => onSuccess(selectedPlanTitle, true), 600);
      } else {
        setErrorMsg(res.message || 'Não foi possível cadastrar.');
      }
    } catch {
      setErrorMsg('Erro inesperado ao registrar nova conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    resetMessages();
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMsg(res.message || 'Falha ao autenticar com o Google.');
        setGoogleLoading(false);
      }
    } catch {
      setErrorMsg('Ocorreu um erro inesperado ao conectar com a conta Google.');
      setGoogleLoading(false);
    }
  };


  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Cabeçalho Visual da Marca */}
        <div className="relative px-5 py-4 sm:px-7 sm:py-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-slate-50/80 to-transparent dark:from-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Logo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 transition-transform hover:scale-105 duration-200" glow />
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Banco Residência</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    2026
                  </span>
                </h2>
              </div>
            </div>

            {/* Ações da Direita: Fechar */}
            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Destaque do Plano Selecionado (se houver) */}
          {selectedPlanTitle && (
            <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-transparent border border-blue-500/25 text-xs animate-fadeIn space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Plano selecionado: <strong className="font-extrabold text-slate-900 dark:text-white">{planDisplayName}</strong></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                  100% Liberado
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Garantia de 7 dias com <strong>Reembolso Instantâneo em 1 clique</strong>.</span>
              </div>
            </div>
          )}

          {/* Abas Alternadoras: Entrar vs Criar Conta */}
          <div className="mt-3.5 sm:mt-4 flex bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleMode('login')}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Entrar na Conta</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('register')}
              className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Criar Nova Conta</span>
            </button>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Mensagens de Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Botão de Autenticação Social Google */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSubmit}
              disabled={loading || googleLoading}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:border-slate-400 dark:hover:border-slate-600 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? 'Redirecionando para o Google...' : 'Continuar com o Google'}</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                <span className="bg-white dark:bg-[var(--bg-card)] px-3 text-slate-400 dark:text-slate-500">
                  {mode === 'login' ? 'ou entre com e-mail' : 'ou cadastre com e-mail'}
                </span>
              </div>
            </div>
          </div>

          {/* ================= FORMULÁRIO DE LOGIN ================= */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Senha
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 mt-1"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 6px 20px -3px ${accentConfig.bgRgba}`
                }}
              >
                {loading ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>Entrar na Plataforma</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= FORMULÁRIO DE REGISTRO (SIMPLIFICADO) ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Senha e Repita a senha lado a lado no desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      title={showPassword ? "Ocultar senha" : "Exibir senha"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Repita a Senha */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Repita a senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                      title={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {password && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p
                    className={`text-[10px] transition-colors ${
                      password && !passwordValidation.isValid
                        ? 'text-amber-600 dark:text-amber-400 font-medium'
                        : 'text-emerald-600 dark:text-emerald-400 font-medium'
                    }`}
                  >
                    {password && passwordValidation.isValid ? (
                      <span>✓ Senha forte e segura</span>
                    ) : (
                      <span>Mínimo 6 caracteres, contendo maiúscula, número e símbolo especial.</span>
                    )}
                  </p>
                </div>
              )}

              {/* Checkboxes de Maioridade e Termos de Uso */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isOver18}
                    onChange={(e) => setIsOver18(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
                  />
                  <span>Tenho 18 anos ou mais</span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer mt-0.5"
                  />
                  <span>
                    Concordo com os{' '}
                    <span className="font-bold underline text-blue-600 dark:text-blue-400">Termos de Uso</span>{' '}
                    e <span className="font-bold underline text-blue-600 dark:text-blue-400">Política de Privacidade</span>
                  </span>
                </label>
              </div>

              {/* Botão Cadastrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 mt-1"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 6px 20px -3px ${accentConfig.bgRgba}`
                }}
              >
                {loading ? (
                  <span>Criando Conta...</span>
                ) : (
                  <>
                    <span>Criar Conta</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Alternador rápido para Login */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => handleToggleMode('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Já tem uma conta? <strong className="font-bold text-blue-600 dark:text-blue-400">Entrar na Conta</strong>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
