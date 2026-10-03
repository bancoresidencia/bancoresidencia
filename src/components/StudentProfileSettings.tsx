'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
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
  Palette
} from 'lucide-react';
import { PercentileColorTester } from './PercentileColorTester';

interface StudentProfileSettingsProps {
  fontSize: 'sm' | 'base' | 'lg';
  onChangeFontSize: (size: 'sm' | 'base' | 'lg') => void;
  onLogout: () => void;
  simulatedPercentile?: number;
  onSimulatePercentile?: (percentile: number) => void;
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
  simulatedPercentile,
  onSimulatePercentile
}) => {
  const { user, updateProfile, updatePassword, updateAvatar } = useAuth();
  const { accentConfig } = useTheme();

  // Abas de Configurações
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'study' | 'percentile'>('profile');

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

    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
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

  const userInitials = (name || 'Lucas Rocha')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Título e Header da Seção */}
      <div className="bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 p-6 sm:p-7 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {name || 'Meu Perfil'}
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Aluno Ativo
              </span>
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
            setActiveTab('percentile');
            clearStatus();
          }}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'percentile'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-amber-500" />
          <span>Cores do Percentil</span>
        </button>
      </div>

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
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 p-6 rounded-3xl shadow-xs space-y-4">
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
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 p-6 rounded-3xl shadow-xs space-y-4">
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
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
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
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-900 dark:text-white"
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
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 p-6 rounded-3xl shadow-xs space-y-4">
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
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 p-6 rounded-3xl shadow-xs space-y-5">
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChangeFontSize('sm')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    fontSize === 'sm'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  A- Compacta (Recomendada)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontSize('base')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    fontSize === 'base'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  A Média
                </button>
                <button
                  type="button"
                  onClick={() => onChangeFontSize('lg')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    fontSize === 'lg'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  A+ Grande
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ABA 4: AJUSTES DE PERCENTIL & TESTE DE CORES ================= */}
      {activeTab === 'percentile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 p-6 sm:p-7 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Ajustes e Simulação de Cores do Percentil
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure e visualize como as diferentes faixas de percentil homologado são exibidas na plataforma
                </p>
              </div>
            </div>

            <PercentileColorTester
              currentPercentile={simulatedPercentile ?? 78}
              onSelectTestPercentile={onSimulatePercentile}
            />
          </div>
        </div>
      )}
    </div>
  );
};
