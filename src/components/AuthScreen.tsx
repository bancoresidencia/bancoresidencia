'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { login, register, loginAsDemo } = useAuth();
  const { accentConfig } = useTheme();

  // 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specialtyTarget, setSpecialtyTarget] = useState('Clínica Médica');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(2025);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleToggleMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
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
        if (onSuccess) setTimeout(onSuccess, 500);
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
    if (password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name,
        email,
        password,
        specialtyTarget,
        college,
        graduationYear
      });

      if (res.success) {
        setSuccessMsg('Conta criada com sucesso! Seja bem-vindo ao Banco Residência.');
        if (onSuccess) setTimeout(onSuccess, 600);
      } else {
        setErrorMsg(res.message || 'Não foi possível cadastrar.');
      }
    } catch {
      setErrorMsg('Erro inesperado ao registrar nova conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    loginAsDemo();
    setSuccessMsg('Acessando com a conta de demonstração (Dr. Lucas Rocha)...');
    if (onSuccess) setTimeout(onSuccess, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300">
        {/* Cabeçalho Visual da Marca */}
        <div className="relative p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-slate-50/80 to-transparent dark:from-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 duration-200"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 8px 24px -4px ${accentConfig.bgRgba}`
                }}
              >
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Banco Residência</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    2026
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Plataforma de Alta Performance & Raciocínio Clínico
                </p>
              </div>
            </div>

            {/* Selo de Proteção */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Acesso Seguro</span>
            </div>
          </div>

          {/* Abas Alternadoras: Entrar vs Criar Conta */}
          <div className="mt-6 flex bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Entrar na Conta</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Criar Nova Conta</span>
            </button>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Mensagens de Feedback */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= FORMULÁRIO DE LOGIN ================= */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Endereço de E-mail
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
                    placeholder="ex: lucas.rocha@med.br"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('lucas.rocha@med.br');
                      setPassword('med123');
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Preencher conta Demo
                  </button>
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
                    placeholder="Sua senha secreta"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
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
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer disabled:opacity-50 mt-2"
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
            /* ================= FORMULÁRIO DE REGISTRO ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
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
                    placeholder="Ex: Dra. Mariana Costa"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Endereço de E-mail
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
                    placeholder="seu.email@medicina.com.br"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Especialidade Alvo
                  </label>
                  <select
                    value={specialtyTarget}
                    onChange={(e) => setSpecialtyTarget(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                  >
                    <option value="Clínica Médica">Clínica Médica</option>
                    <option value="Cirurgia Geral">Cirurgia Geral</option>
                    <option value="Pediatria">Pediatria</option>
                    <option value="Ginecologia e Obstetrícia">Ginecologia e Obstetrícia</option>
                    <option value="Medicina Preventiva & Saúde Coletiva">Medicina Preventiva</option>
                    <option value="Anestesiologia">Anestesiologia</option>
                    <option value="Ortopedia">Ortopedia</option>
                    <option value="Dermatologia">Dermatologia</option>
                    <option value="Oftalmologia">Oftalmologia</option>
                    <option value="Radiologia">Radiologia</option>
                    <option value="Psiquiatria">Psiquiatria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ano Formatura / Residência
                  </label>
                  <input
                    type="number"
                    min={2015}
                    max={2032}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculdade de Medicina (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Ex: USP, UNIFESP, UFRJ, UFMG, Santa Casa..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Criar Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                  {password && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Botão Cadastrar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer disabled:opacity-50 mt-3"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 6px 20px -3px ${accentConfig.bgRgba}`
                }}
              >
                {loading ? (
                  <span>Criando Conta...</span>
                ) : (
                  <>
                    <span>Concluir Cadastro & Começar</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divisor */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-bold">
              <span className="bg-white dark:bg-[#0c1424] px-3 text-slate-400">
                Ou acesso rápido
              </span>
            </div>
          </div>

          {/* Botão de Demonstração Instantânea */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Award className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>Acessar com Conta Demo (Dr. Lucas Rocha - P78)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
