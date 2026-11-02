'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useTheme } from '@/context/ThemeContext';
import { validatePasswordRequirements } from '@/utils/security';
import {
  User,
  Lock,
  Camera,
  GraduationCap,
  Mail,
  CheckCircle2,
  AlertCircle,
  Shield,
  Target,
  LogOut,
  Phone,
  Trash2,
  Save,
  CalendarDays,
  Clock,
  Crown,
  ShieldCheck,
  Check,
  Zap,
  RotateCcw,
  Sparkles,
  X,
  Gift,
  Award
} from 'lucide-react';
import { StudentAmbassadorSettings } from '@/components/StudentAmbassadorSettings';
import { getAmbassadorStats } from '@/config/ambassadorConfig';

interface StudentProfileSettingsProps {
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  onChangeFontSize: (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl') => void;
  onLogout: () => void;
}

// Avatares médicos pré-configurados
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80', // Médico 1
  'https://images.unsplash.com/photo-1594824813633-5c249a5b4869?w=150&auto=format&fit=crop&q=80', // Médica 1
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80', // Médica 2
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80', // Médico 2
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80'  // Médico 3
];

export const StudentProfileSettings: React.FC<StudentProfileSettingsProps> = ({
  fontSize,
  onChangeFontSize,
  onLogout,
}) => {
  const { user, updateProfile, updatePassword, updateAvatar, refreshUser } = useAuth();
  const { plan, isAdmin, openUpgradeModal } = useSubscription();
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundMessage, setRefundMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { accentConfig } = useTheme();
  const ambassadorStats = getAmbassadorStats(user?.id || 'guest', user?.name);

  // Abas de Configurações
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'study' | 'subscription' | 'ambassador'>('profile');

  // Estado dos campos de Perfil
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [specialtyTarget, setSpecialtyTarget] = useState(user?.specialtyTarget || 'Clínica Médica');
  const [college, setCollege] = useState(user?.college || '');
  const [graduationYear, setGraduationYear] = useState<number>(user?.graduationYear || 2025);
  const [dailyGoal, setDailyGoal] = useState<number>(user?.dailyGoal || 30);
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(user?.state || 'SP');
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || '');

  // Configuração da Prova Alvo e Reta Final (Countdown)
  const [targetExam, setTargetExam] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_target_exam_name') || 'ENARE 2026';
    }
    return 'ENARE 2026';
  });
  const [targetExamDate, setTargetExamDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_target_exam_date') || '2026-11-01';
    }
    return '2026-11-01';
  });

  const examCountdown = React.useMemo(() => {
    try {
      const target = new Date(targetExamDate + 'T00:00:00');
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = (diffDays / 30).toFixed(1);
      return { diffDays, diffWeeks, diffMonths };
    } catch {
      return { diffDays: 0, diffWeeks: 0, diffMonths: '0' };
    }
  }, [targetExamDate]);

  const handleSaveExamTarget = (nameVal: string, dateVal: string) => {
    setTargetExam(nameVal);
    setTargetExamDate(dateVal);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_target_exam_name', nameVal);
      localStorage.setItem('user_target_exam_date', dateVal);
    }
    setStatusMsg({ type: 'success', text: `Prova alvo configurada para ${nameVal}!` });
  };

  // Estado dos campos de Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Feedbacks
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const clearStatus = () => setStatusMsg(null);

  // Upload de Foto via input file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WEBP).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'A imagem deve ter no máximo 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setAvatarPreview(base64Url);
      updateAvatar(base64Url);
      setStatusMsg({ type: 'success', text: 'Foto de perfil atualizada!' });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url: string) => {
    setAvatarPreview(url);
    updateAvatar(url);
    setStatusMsg({ type: 'success', text: 'Avatar médico selecionado com sucesso!' });
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    updateAvatar('');
    setStatusMsg({ type: 'success', text: 'Foto de perfil removida. O sistema exibirá suas iniciais.' });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();
    setLoading(true);

    try {
      const res = await updateProfile({
        name,
        email,
        specialtyTarget,
        college,
        graduationYear,
        dailyGoal,
        phone,
        state
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || 'Dados do perfil salvos com sucesso!' });
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Erro ao atualizar perfil.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Erro inesperado ao salvar alterações.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();

    if (!currentPassword) {
      setStatusMsg({ type: 'error', text: 'Informe a sua senha atual.' });
      return;
    }

    const validation = validatePasswordRequirements(newPassword);
    if (!validation.isValid) {
      setStatusMsg({ type: 'error', text: validation.errorMessage || 'A nova senha deve conter no mínimo 6 caracteres, uma letra maiúscula, um número e um símbolo.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setStatusMsg({ type: 'error', text: 'A confirmação não coincide com a nova senha digitada.' });
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword(currentPassword, newPassword);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Não foi possível alterar a senha.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Erro ao processar a troca de senha.' });
    } finally {
      setLoading(false);
    }
  };


  const handleRequestRefund = async () => {
    if (!window.confirm('Tem certeza de que deseja solicitar o estorno integral da sua assinatura? Seu acesso PRO será revogado imediatamente e o estorno será processado pelo Mercado Pago de forma incontestável.')) {
      return;
    }

    setIsRefunding(true);
    setRefundMessage(null);

    try {
      const res = await fetch('/api/checkout/refund', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar estorno.');
      }

      setRefundMessage({
        type: 'success',
        text: 'Reembolso aprovado com sucesso! O valor foi estornado e sua conta retornou ao plano gratuito.'
      });
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      setRefundMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Falha ao solicitar reembolso.'
      });
    } finally {
      setIsRefunding(false);
    }
  };

  const userInitials = (name || user?.name || 'Médico Residente')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Título e Header da Seção */}
      <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Foto de Perfil"
                className="w-16 h-16 rounded-2xl object-cover border-2 shadow-md"
                style={{ borderColor: accentConfig.primaryHex }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-md"
                style={{
                  backgroundColor: accentConfig.bgRgba,
                  color: accentConfig.primaryHex,
                  border: `2px solid ${accentConfig.primaryHex}`
                }}
              >
                {userInitials}
              </div>
            )}
            <label
              htmlFor="avatar-upload-header"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xs"
              title="Trocar Foto"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input
              id="avatar-upload-header"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {name || 'Meu Perfil'}
              </h1>
              {ambassadorStats.hasAmbassadorBadge && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-xs">
                  <Award className="w-3 h-3 text-amber-500" />
                  Embaixador Oficial (10+ indicações)
                </span>
              )}
              {user?.role === 'admin' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  Administrador
                </span>
              ) : user?.subscriptionPlan === 'premium' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                  <Crown className="w-3 h-3 text-purple-500" />
                  Assinante Premium
                </span>
              ) : user?.subscriptionPlan === 'pro' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Zap className="w-3 h-3 text-emerald-500" />
                  Assinante Pro
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  Plano Gratuito
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>{email}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{specialtyTarget}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Encerrar Sessão</span>
        </button>
      </div>

      {/* Navegação entre Abas de Configurações */}
      <div className="flex bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('profile');
            clearStatus();
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Dados Pessoais & Foto</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('password');
            clearStatus();
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'password'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Segurança & Senha</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('study');
            clearStatus();
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'study'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Metas & Estudo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('subscription');
            clearStatus();
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'subscription'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Plano & Privilégios</span>
        </button>

      </div>

      {activeTab === 'ambassador' && (
        <StudentAmbassadorSettings />
      )}

      {/* Alerta de Status */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ================= ABA 1: DADOS PESSOAIS & FOTO ================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Card de Gerenciamento de Foto */}
          <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-500" />
              <span>Foto de Perfil & Avatar</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Preview Grande */}
              <div className="shrink-0 text-center">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-3xl object-cover border-2 shadow-md mx-auto"
                    style={{ borderColor: accentConfig.primaryHex }}
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center font-extrabold text-2xl shadow-md mx-auto"
                    style={{
                      backgroundColor: accentConfig.bgRgba,
                      color: accentConfig.primaryHex,
                      border: `2px solid ${accentConfig.primaryHex}`
                    }}
                  >
                    {userInitials}
                  </div>
                )}
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="mt-2 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remover foto</span>
                  </button>
                )}
              </div>

              {/* Controles de Foto */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Faça upload de uma foto do seu computador ou escolha um dos avatares médicos disponíveis.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <label
                    htmlFor="custom-avatar-upload"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:scale-102 cursor-pointer flex items-center gap-2"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Carregar Nova Foto</span>
                  </label>
                  <input
                    id="custom-avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Galeria de Avatares Pré-definidos */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">
                    Ou selecione um avatar rápido:
                  </span>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(url)}
                        className={`w-11 h-11 rounded-2xl overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                          avatarPreview === url
                            ? 'ring-2 ring-blue-500 scale-105'
                            : 'border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Avatar médico ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Dados Pessoais */}
          <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span>Informações do Aluno</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-[var(--bg-input)] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-[var(--bg-input)] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Especialidade Alvo
                </label>
                <select
                  value={specialtyTarget}
                  onChange={(e) => setSpecialtyTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white font-medium"
                >
                  <option value="Clínica Médica">Clínica Médica</option>
                  <option value="Cirurgia Geral">Cirurgia Geral</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Ginecologia e Obstetrícia">Ginecologia e Obstetrícia</option>
                  <option value="Medicina Preventiva & Saúde Coletiva">Medicina Preventiva</option>
                  <option value="Anestesiologia">Anestesiologia</option>
                  <option value="Ortopedia e Traumatologia">Ortopedia e Traumatologia</option>
                  <option value="Dermatologia">Dermatologia</option>
                  <option value="Oftalmologia">Oftalmologia</option>
                  <option value="Radiologia e Diagnóstico por Imagem">Radiologia</option>
                  <option value="Psiquiatria">Psiquiatria</option>
                  <option value="Infectologia">Infectologia</option>
                  <option value="Neurologia">Neurologia</option>
                  <option value="Cardiologia">Cardiologia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Faculdade de Origem
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Ex: USP, UNICAMP, UFRJ..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ano Formatura / Residência
                </label>
                <input
                  type="number"
                  min={2010}
                  max={2035}
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone / WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estado (UF)
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                >
                  {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES', 'PA', 'AM', 'Outro'].map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 4px 14px -2px ${accentConfig.bgRgba}`
                }}
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações do Perfil</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= ABA 2: SEGURANÇA & SENHA ================= */}
      {activeTab === 'password' && (
        <form onSubmit={handleSavePassword} className="space-y-6">
          <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Modificar Senha de Acesso</span>
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Para maior segurança da sua conta, utilize uma senha com letras maiúsculas, números e caracteres especiais.
            </p>

            <div className="space-y-3.5 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Indicação sutil de requisitos para troca de senha */}
            {(() => {
              const val = validatePasswordRequirements(newPassword);
              return (
                <p
                  className={`text-[11px] leading-relaxed transition-colors ${
                    newPassword && !val.isValid
                      ? 'text-amber-600 dark:text-amber-400 font-medium'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {newPassword && !val.isValid ? (
                    <span>A senha deve conter letras maiúsculas e minúsculas, um número e um símbolo.</span>
                  ) : newPassword && val.isValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Senha atende a todos os requisitos</span>
                  ) : (
                    <span>A senha deve conter letras maiúsculas e minúsculas, um número e um símbolo.</span>
                  )}
                </p>
              );
            })()}

            <div className="pt-2 flex justify-start">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 4px 14px -2px ${accentConfig.bgRgba}`
                }}
              >
                <Lock className="w-4 h-4" />
                <span>Atualizar Senha</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= ABA 3: METAS & PREFERÊNCIAS DE ESTUDO ================= */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs space-y-5">
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" />
              <span>Metas Diárias & Preferências de Visualização</span>
            </h2>

            {/* Meta Diária */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Meta Diária de Questões Respondidas
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[15, 20, 30, 50, 80, 100].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      setDailyGoal(goal);
                      updateProfile({ dailyGoal: goal });
                      setStatusMsg({ type: 'success', text: `Meta diária atualizada para ${goal} questões/dia!` });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      dailyGoal === goal
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {goal} questões / dia
                  </button>
                ))}
              </div>
            </div>

            {/* Tamanho da Fonte Padrão */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Tamanho de Fonte Padrão para Resolução de Questões
              </label>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { id: 'xs' as const, label: 'A-- Muito Compacta' },
                  { id: 'sm' as const, label: 'A- Compacta' },
                  { id: 'base' as const, label: 'A Padrão' },
                  { id: 'lg' as const, label: 'A+ Grande' },
                  { id: 'xl' as const, label: 'A++ Muito Grande' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onChangeFontSize(f.id)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      fontSize === f.id
                        ? 'text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    style={fontSize === f.id ? { backgroundColor: accentConfig.primaryHex } : undefined}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reta Final para a Residência - Configuração da Prova e Contagem de Dias */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" style={{ color: accentConfig.timeAccent.hex }} />
                  <span>Prova Alvo e Contagem Regressiva (Reta Final)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Defina o concurso pretendido e acompanhe quantos dias faltam para a prova diretamente no seu perfil.
                </p>
              </div>

              {/* Card visual do countdown */}
              <div
                className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{
                  backgroundColor: accentConfig.bgRgba,
                  borderColor: accentConfig.borderRgba
                }}
              >
                <div className="space-y-1 text-center sm:text-left">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border"
                    style={{
                      backgroundColor: accentConfig.timeAccent.bgRgba,
                      color: accentConfig.timeAccent.hex,
                      borderColor: accentConfig.timeAccent.borderRgba
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Contagem Regressiva</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                    <GraduationCap className="w-5 h-5" style={{ color: accentConfig.primaryHex }} />
                    <span>{targetExam}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Data prevista: {new Date(targetExamDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div
                  className="border px-6 py-3 rounded-2xl text-center min-w-[150px] shadow-xs"
                  style={{
                    backgroundColor: accentConfig.timeAccent.bgRgba,
                    borderColor: accentConfig.timeAccent.borderRgba
                  }}
                >
                  <div
                    className="text-3xl font-black tracking-tight leading-none"
                    style={{ color: accentConfig.timeAccent.hex }}
                  >
                    {examCountdown.diffDays}
                    <span
                      className="text-xs font-bold uppercase ml-1.5 tracking-wider"
                      style={{ color: accentConfig.timeAccent.hex }}
                    >
                      dias
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    ~{examCountdown.diffWeeks} semanas • ~{examCountdown.diffMonths} meses
                  </div>
                </div>
              </div>

              {/* Seletor rápido de provas e data customizada */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: 'ENARE 2026', date: '2026-11-01' },
                    { name: 'USP-SP 2026', date: '2026-11-15' },
                    { name: 'UNICAMP 2026', date: '2026-11-20' },
                    { name: 'SUS-SP 2026', date: '2026-12-06' },
                    { name: 'AMRIGS 2026', date: '2026-11-29' }
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSaveExamTarget(p.name, p.date)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        targetExam === p.name
                          ? 'text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      style={targetExam === p.name ? { backgroundColor: accentConfig.primaryHex } : undefined}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Nome da Prova / Concurso
                    </label>
                    <input
                      type="text"
                      value={targetExam}
                      onChange={(e) => handleSaveExamTarget(e.target.value, targetExamDate)}
                      placeholder="Ex: USP, ENARE, AMP..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Data da Prova
                    </label>
                    <input
                      type="date"
                      value={targetExamDate}
                      onChange={(e) => handleSaveExamTarget(targetExam, e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ABA DE PLANO, ASSINATURA & PRIVILÉGIOS ================= */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Card Principal de Status do Perfil */}
          <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 p-6 sm:p-7 rounded-3xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{
                    backgroundColor: isAdmin
                      ? 'rgba(245, 158, 11, 0.15)'
                      : plan === 'free'
                      ? 'rgba(100, 116, 139, 0.15)'
                      : accentConfig.bgRgba,
                    color: isAdmin
                      ? '#f59e0b'
                      : plan === 'free'
                      ? '#64748b'
                      : accentConfig.primaryHex
                  }}
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : plan === 'free' ? (
                    <Zap className="w-6 h-6" />
                  ) : (
                    <Crown className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                      {isAdmin
                        ? 'Perfil de Administrador'
                        : plan === 'free'
                        ? 'Plano Gratuito'
                        : 'Perfil do Assinante Pro'}
                    </h2>
                    {isAdmin ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        Admin
                      </span>
                    ) : plan === 'free' ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 font-bold">
                        Plano FREE
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isAdmin
                      ? 'Credenciais com privilégios de gestão técnica, curadoria de gabaritos e controle do banco.'
                      : plan === 'free'
                      ? 'Plano FREE • Limite de 10 resoluções diárias de questões e recursos básicos.'
                      : `Plano ${user?.subscriptionPlan?.toUpperCase() || 'PRO'} • Acesso completo ao banco de questões classificadas e gabaritos.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tipo de Conta:</span>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700">
                    {isAdmin
                      ? 'Administrador da Plataforma'
                      : plan === 'free'
                      ? 'Estudante (Gratuito)'
                      : 'Assinante Oficial'}
                  </span>
                </div>

                {/* BOTÃO LIBERAR ILIMITADO NO CABEÇALHO (QUANDO NO PLANO FREE) */}
                {plan === 'free' && !isAdmin && (
                  <button
                    type="button"
                    onClick={() => openUpgradeModal()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    style={{
                      backgroundColor: accentConfig.primaryHex,
                      boxShadow: `0 4px 14px ${accentConfig.bgRgba}`
                    }}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Liberar Ilimitado</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mensagem de Feedback de Reembolso */}
            {refundMessage && (
              <div
                className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  refundMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                {refundMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{refundMessage.text}</span>
              </div>
            )}

            {/* Card de Garantia de 7 Dias e Cancelamento (Apenas para assinantes Pro com até 7 dias) */}
            {user?.subscriptionPlan === 'pro' && !isAdmin && (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    Garantia Incondicional de 7 Dias do Mercado Pago
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {user?.subscriptionExpiresAt
                      ? `Assinatura ativa até ${new Date(user.subscriptionExpiresAt).toLocaleDateString('pt-BR')}. `
                      : 'Assinatura ativa. '}
                    Caso queira cancelar dentro do período de 7 dias, seu estorno é processado automaticamente sem burocracia.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRequestRefund}
                  disabled={isRefunding}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isRefunding ? 'Processando Estorno...' : 'Solicitar Reembolso (7 Dias)'}
                </button>
              </div>
            )}

            {/* CONTEÚDO PARA USUÁRIOS DO PLANO GRATUITO */}
            {plan === 'free' && !isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card Plano Atual Gratuito */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-400" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        Plano Gratuito
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-400 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      Seu Plano Atual
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
                    Plano de avaliação básico com acesso diário limitado.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-400">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span><strong>10 questões diárias</strong> para resolução</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>Gabarito oficial de bancas médicas</span>
                    </li>
                    <li className="flex items-start gap-2 opacity-60">
                      <X className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                      <span>Sem métricas TRI calibradas ou percentil</span>
                    </li>
                    <li className="flex items-start gap-2 opacity-60">
                      <X className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                      <span>Sem visualização completa de provas oficiais</span>
                    </li>
                  </ul>
                </div>

                {/* Card Plano Ilimitado Pro Recomendado */}
                <div
                  className="p-5 rounded-2xl border transition-all relative flex flex-col justify-between"
                  style={{
                    borderColor: accentConfig.primaryHex,
                    backgroundColor: accentConfig.bgRgba
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Plano Pro Ilimitado
                        </h3>
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        Recomendado
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 mb-4">
                      Acesso completo e irrestrito para garantir sua aprovação na Residência Médica.
                    </p>
                    <ul className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-200">
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span><strong>Resoluções 100% ILIMITADAS</strong> (+133.000 questões)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>Comentários completos padrão-ouro em todas as alternativas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>Estatísticas psicométricas TRI, percentil e histórico</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>Todas as provas oficiais na íntegra com cronômetro real</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>Garantia de 7 dias com estorno imediato no Mercado Pago</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => openUpgradeModal()}
                    className="w-full mt-5 py-3 px-4 rounded-xl text-xs font-black text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    style={{
                      backgroundColor: accentConfig.primaryHex,
                      boxShadow: `0 4px 14px ${accentConfig.bgRgba}`
                    }}
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Conhecer Planos e Assinar (a partir de R$ 19,90/mês)</span>
                  </button>
                </div>
              </div>
            )}

            {/* CONTEÚDO PARA ASSINANTES PRO */}
            {plan === 'pro' && !isAdmin && (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Recursos Inclusos no seu Plano Pro
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                    Seu Plano Atual
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span><strong>Resolução ILIMITADA</strong> de questões</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Filtros avançados multicritério</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Comentários completos padrão-ouro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Estatísticas psicométricas TRI e percentil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Provas oficiais na íntegra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Pastas de 3 níveis e cadernos</span>
                  </li>
                </ul>
              </div>
            )}

            {/* CONTEÚDO EXCLUSIVO PARA ADMINISTRADORES (APENAS SE isAdmin FOR VERDADEIRO) */}
            {isAdmin && (
              <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Privilégios da Administração da Plataforma
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                    Acesso Total
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Reservado para a equipe médica e de gestão da plataforma para homologação e curadoria contínua.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span><strong>Aba exclusiva de Curadoria de Gabaritos</strong> no cabeçalho</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>Auditoria das 47.641+ questões pendentes de classificação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>Homologação e correção de gabaritos divergentes ou anulados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>Auditoria de segurança, RLS do Supabase e integridade de dados</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
