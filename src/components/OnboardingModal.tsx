'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  applyReferralCode,
  getUserReferralCode,
  AppliedReferral
} from '@/config/ambassadorConfig';
import { getInstitutions } from '@/services/officialExamsService';
import {
  Stethoscope,
  Sparkles,
  Gift,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  Building2,
  Calendar,
  Target,
  GraduationCap,
  Award,
  Check,
  AlertCircle,
  CreditCard,
  Layers,
  LayoutDashboard,
  X,
  Edit3
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (action?: 'plans' | 'questions' | 'home') => void;
}

// Lista curada das principais Faculdades de Medicina do Brasil para autocomplete rápido
const PRESET_COLLEGES = [
  'USP - Universidade de São Paulo (FMUSP)',
  'USP - Ribeirão Preto (FMRP-USP)',
  'UNICAMP - Universidade Estadual de Campinas',
  'UNIFESP - Universidade Federal de São Paulo (EPM)',
  'UNESP - Universidade Estadual Paulista (Botucatu)',
  'UFRJ - Universidade Federal do Rio de Janeiro',
  'UERJ - Universidade do Estado do Rio de Janeiro',
  'UFF - Universidade Federal Fluminense',
  'UFMG - Universidade Federal de Minas Gerais',
  'UFBA - Universidade Federal da Bahia',
  'UFC - Universidade Federal do Ceará',
  'UFRGS - Universidade Federal do Rio Grande do Sul',
  'UFSC - Universidade Federal de Santa Catarina',
  'UFPR - Universidade Federal do Paraná',
  'UnB - Universidade de Brasília',
  'UFPE - Universidade Federal de Pernambuco',
  'UFAL - Universidade Federal de Alagoas',
  'UFMA - Universidade Federal do Maranhão',
  'UFPA - Universidade Federal do Pará',
  'UFRN - Universidade Federal do Rio Grande do Norte',
  'UFPB - Universidade Federal da Paraíba',
  'UFES - Universidade Federal do Espírito Santo',
  'UFMS - Universidade Federal de Mato Grosso do Sul',
  'UFG - Universidade Federal de Goiás',
  'UFPI - Universidade Federal do Piauí',
  'UFS - Universidade Federal de Sergipe',
  'Santa Casa de São Paulo (FCMS-SP)',
  'FMABC - Centro Universitário FMABC',
  'FAMERP - Fac. de Medicina de São José do Rio Preto',
  'FAMEMA - Faculdade de Medicina de Marília',
  'Hospital Israelita Albert Einstein (FICSAE)',
  'PUCRS - Pontifícia Univ. Católica do Rio Grande do Sul',
  'PUCPR - Pontifícia Univ. Católica do Paraná',
  'PUC Minas - Pontifícia Univ. Católica de Minas Gerais',
  'PUC-SP - Pontifícia Univ. Católica de São Paulo',
  'PUC-Campinas - Pontifícia Univ. Católica de Campinas',
  'EMESCAM - Escola Sup. de Ciências da Santa Casa de Vitória',
  'Uniube - Universidade de Uberaba',
  'Univas - Universidade do Vale do Sapucaí',
  'UNIFOR - Universidade de Fortaleza',
  'Bahiana - Escola Bahiana de Medicina e Saúde Pública',
  'UPE - Universidade de Pernambuco',
  'FCM-CG - Fac. de Ciências Médicas de Campina Grande'
];

// Lista de Especialidades Médicas para o Passo 6
const MEDICAL_SPECIALTIES = [
  'Clínica Médica',
  'Cirurgia Geral',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Medicina Preventiva e Social',
  'Anestesiologia',
  'Cardiologia',
  'Dermatologia',
  'Ortopedia e Traumatologia',
  'Radiologia e Diagnóstico por Imagem',
  'Oftalmologia',
  'Psiquiatria',
  'Neurologia',
  'Infectologia',
  'Medicina de Emergência',
  'Medicina de Família e Comunidade',
  'Gastroenterologia',
  'Endocrinologia e Metabologia',
  'Nefrologia',
  'Pneumologia',
  'Reumatologia',
  'Hematologia e Hemoterapia',
  'Oncologia Clínica',
  'Cirurgia Plástica',
  'Cirurgia Vascular',
  'Urologia',
  'Otorrinolaringologia',
  'Neurocirurgia',
  'Cirurgia Cardiovascular',
  'Geriatria',
  'Medicina Intensiva'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user, updateProfile } = useAuth();
  const { accentConfig } = useTheme();

  // Etapa atual: 1 a 7 (Configuração) e 8 (Tela Final de Ações)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Passo 1: Quem te indicou (Código de Indicação)
  const [hasReferralCode, setHasReferralCode] = useState<boolean | null>(null);
  const [referralInput, setReferralInput] = useState<string>('');
  const [appliedReferral, setAppliedReferral] = useState<AppliedReferral | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [skippedReferral, setSkippedReferral] = useState<boolean>(false);

  // Passo 2: Objetivo
  const [objective, setObjective] = useState<'Residência Médica' | 'Revalida' | 'ENAMED / ENARE' | 'Internato' | 'R+'>('Residência Médica');

  // Passo 3: Faculdade
  const [collegeInput, setCollegeInput] = useState<string>(user?.college || '');
  const [collegeSearch, setCollegeSearch] = useState<string>('');

  // Passo 4: Prazo (trocado com o antigo passo 6 a pedido)
  const [deadline, setDeadline] = useState<string>('Ciclo 2026 (1 ano)');

  // Passo 5: Provas Foco (Instituições do Banco)
  const [selectedExamInst, setSelectedExamInst] = useState<string>(user?.targetExamName || 'ENARE / ENAMED');
  const [examSearch, setExamSearch] = useState<string>('');

  // Passo 6: Especialidade (trocado com o antigo passo 4 a pedido)
  const [specialty, setSpecialty] = useState<string>(user?.specialtyTarget || 'Clínica Médica');
  const [specialtySearch, setSpecialtySearch] = useState<string>('');

  // Status de salvamento final
  const [isSaving, setIsSaving] = useState(false);

  // Instituições disponíveis no banco
  const allInstitutions = useMemo(() => {
    try {
      const list = getInstitutions();
      return list.sort((a, b) => (b.totalQuestions || 0) - (a.totalQuestions || 0));
    } catch {
      return [];
    }
  }, []);

  // Filtragem de instituições no Passo 5
  const filteredInstitutions = useMemo(() => {
    if (!examSearch.trim()) return allInstitutions.slice(0, 35);
    const q = examSearch.toLowerCase();
    return allInstitutions.filter((item) =>
      item.shortName.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.state && item.state.toLowerCase().includes(q)) ||
      item.aliases?.some((al) => al.toLowerCase().includes(q))
    ).slice(0, 35);
  }, [allInstitutions, examSearch]);

  // Filtragem de faculdades no Passo 3
  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return PRESET_COLLEGES.slice(0, 8);
    const q = collegeSearch.toLowerCase();
    return PRESET_COLLEGES.filter((c) => c.toLowerCase().includes(q));
  }, [collegeSearch]);

  // Filtragem de especialidades no Passo 6
  const filteredSpecialties = useMemo(() => {
    if (!specialtySearch.trim()) return MEDICAL_SPECIALTIES;
    const q = specialtySearch.toLowerCase();
    return MEDICAL_SPECIALTIES.filter((s) => s.toLowerCase().includes(q));
  }, [specialtySearch]);

  if (!isOpen) return null;

  // Validação do Código de Indicação (Passo 1)
  const handleValidateReferral = () => {
    setReferralError(null);
    if (!referralInput.trim()) {
      setReferralError('Digite o código de indicação ou selecione "Não tenho código".');
      return;
    }
    const currentUserCode = getUserReferralCode(user);
    const res = applyReferralCode(referralInput, currentUserCode, user?.id, user);
    if (res.success && res.referral) {
      setAppliedReferral(res.referral);
      setSkippedReferral(false);
      setCurrentStep(2);
    } else {
      setReferralError(res.message);
    }
  };

  const handleSkipReferral = () => {
    setAppliedReferral(null);
    setSkippedReferral(true);
    setReferralInput('');
    setCurrentStep(2);
  };

  // Finalização do Onboarding (com escolha da ação inicial)
  const handleFinishOnboarding = async (action: 'plans' | 'questions' | 'home' = 'home') => {
    setIsSaving(true);
    try {
      let targetDate = '2026-11-01';
      if (deadline.includes('3 meses')) {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        targetDate = d.toISOString().split('T')[0];
      } else if (deadline.includes('6 meses')) {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        targetDate = d.toISOString().split('T')[0];
      } else if (deadline.includes('2025')) {
        targetDate = '2025-11-01';
      } else if (deadline.includes('2026')) {
        targetDate = '2026-11-01';
      } else if (deadline.includes('2027')) {
        targetDate = '2027-11-01';
      } else if (deadline.includes('2 anos')) {
        targetDate = '2028-11-01';
      }

      if (user) {
        await updateProfile({
          college: collegeInput || 'Faculdade de Medicina',
          specialtyTarget: specialty === 'Ainda não sei / vou decidir depois' ? 'Clínica Médica' : specialty,
          targetExamName: selectedExamInst,
          targetExamDate: targetDate
        });
        localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
        localStorage.setItem('user_target_exam_name', selectedExamInst);
        localStorage.setItem('user_target_exam_date', targetDate);
      }

      if (appliedReferral) {
        applyReferralCode(appliedReferral.code);
      }

      localStorage.setItem('bancoresidencia_user_objective', objective);
      localStorage.setItem('bancoresidencia_user_deadline', deadline);

      if (onComplete) onComplete(action);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar onboarding:', err);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Títulos descritivos dos passos
  const stepTitles: Record<number, string> = {
    1: 'Quem te indicou',
    2: 'Seu objetivo',
    3: 'Sua faculdade',
    4: 'Seu prazo',
    5: 'Provas foco',
    6: 'Especialidade alvo',
    7: 'Revisão do plano',
    8: 'Tudo pronto!'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#16171a] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Barra Superior com Progresso */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Banco Residência
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    Onboarding
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  {currentStep <= 7 ? `Passo ${currentStep} de 7 · ${stepTitles[currentStep]}` : 'Tudo pronto · Como você quer começar?'}
                </span>
              </div>
            </div>

            {/* Indicador visual de progresso (7 barras) */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      s === currentStep
                        ? 'w-6 shadow-xs'
                        : s < currentStep
                        ? 'w-2 bg-emerald-500'
                        : 'w-2 bg-slate-200 dark:bg-zinc-800'
                    }`}
                    style={s === currentStep ? { backgroundColor: accentConfig.primaryHex } : {}}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Corpo do Passo com Scroll */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          
          {/* ======================================================== */}
          {/* PASSO 1: Quem te indicou (Código de Indicação)           */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Alguém te indicou o Banco Residência?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  Se um amigo, colega ou embaixador te recomendou a plataforma, registre o código para garantir{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">10% de desconto imediato</strong>. Se não tiver, seguimos normalmente!
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {/* Opções Iniciais (Tenho código vs Não tenho código) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHasReferralCode(true)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      hasReferralCode === true
                        ? 'border-2 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/40 dark:bg-zinc-900/30'
                    }`}
                    style={hasReferralCode === true ? { borderColor: accentConfig.primaryHex } : {}}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Tenho um código
                      </span>
                      {hasReferralCode === true && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Um colega ou embaixador me indicou.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHasReferralCode(false);
                      handleSkipReferral();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      hasReferralCode === false
                        ? 'border-2 bg-slate-100 dark:bg-zinc-800 shadow-sm'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/40 dark:bg-zinc-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Não tenho código
                      </span>
                      {hasReferralCode === false && <Check className="w-4 h-4 text-slate-500" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Conheci o Banco Residência de outra forma.
                    </p>
                  </button>
                </div>

                {/* Campo de inserção do código */}
                {hasReferralCode === true && (
                  <div className="space-y-3 pt-2 animate-in fade-in duration-150">
                    <div className="relative">
                      <input
                        type="text"
                        value={referralInput}
                        onChange={(e) => {
                          setReferralInput(e.target.value.toUpperCase());
                          setReferralError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleValidateReferral();
                        }}
                        placeholder="Ex: RESIDENCIA10 ou MED-LUCAS-10"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white font-mono font-bold text-center tracking-wider placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>

                    {referralError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{referralError}</span>
                      </div>
                    )}

                    {appliedReferral && (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                        <div>
                          <div className="font-bold">Código {appliedReferral.code} Ativado!</div>
                          <div className="text-[11px] opacity-90">
                            10% de desconto garantido por {appliedReferral.referrerName}.
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleValidateReferral}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <Check className="w-4 h-4" />
                      Validar Código & Continuar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 2: Objetivo (O que você vai estudar?)               */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  O que você vai estudar?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Escolha seu objetivo para encontrar questões, revisões e pesos psicométricos alinhados ao seu foco.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  {
                    id: 'Residência Médica',
                    title: 'Residência Médica',
                    desc: 'Preparação para provas de acesso direto (R1: ENARE, USP, AMRIGS, PSU-MG).'
                  },
                  {
                    id: 'Revalida',
                    title: 'Revalida',
                    desc: 'Foco total no INEP e provas de revalidação de diploma médico com gabaritos detalhados.'
                  },
                  {
                    id: 'ENAMED / ENARE',
                    title: 'ENAMED / ENARE',
                    desc: 'Exame Nacional e seleção unificada com alta densidade de questões recentes.'
                  },
                  {
                    id: 'Internato',
                    title: 'Internato Médico',
                    desc: 'Estudo prático para rodízios, ciclo clínico e raciocínio de conduta beira-leito.'
                  },
                  {
                    id: 'R+',
                    title: 'R+ (Especialidades)',
                    desc: 'Provas com pré-requisito clínico, cirúrgico, pediátrico e títulos de especialista.'
                  }
                ].map((item) => {
                  const isSelected = objective === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setObjective(item.id as typeof objective)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-2 bg-blue-50/50 dark:bg-blue-950/20 shadow-md'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/30 dark:bg-zinc-900/30'
                      }`}
                      style={isSelected ? { borderColor: accentConfig.primaryHex } : {}}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              className="w-4 h-4"
                              style={{ color: accentConfig.primaryHex }}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 3: Sua Faculdade de Origem                         */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  De qual faculdade você é?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Sua faculdade ajuda a calibrar suas comparações de desempenho e contextualizar seus estudos.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={collegeInput}
                    onChange={(e) => {
                      setCollegeInput(e.target.value);
                      setCollegeSearch(e.target.value);
                    }}
                    placeholder="Digite ou busque sua universidade..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-900 dark:text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Sugestões rápidas:
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {filteredColleges.map((c) => {
                    const isSelected = collegeInput === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCollegeInput(c)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/30 font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                            : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{c}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCollegeInput('Estudei no exterior / Não listada')}
                  className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Minha faculdade não está na lista / estudei no exterior
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 4: Seu Prazo (Trocado com o antigo passo 6)        */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Qual é o seu prazo de aprovação?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Com um prazo em mente, calibramos o ritmo ideal de questões e o cronômetro do seu ciclo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  {
                    id: 'Ciclo 2026 (1 ano)',
                    title: 'Ciclo 2026 (1 ano)',
                    desc: 'Preparação completa com cobertura das 5 grandes áreas e simulados periódicos.'
                  },
                  {
                    id: 'Reta Final (3 meses)',
                    title: 'Reta Final (3 meses)',
                    desc: 'Foco total em provas anteriores, pontos fracos e revisão de alto rendimento.'
                  },
                  {
                    id: 'Intensivo (6 meses)',
                    title: 'Intensivo (6 meses)',
                    desc: 'Aceleração de conteúdo e bateria de questões para provas de meio/fim de ano.'
                  },
                  {
                    id: 'Ciclo 2027 (2 anos)',
                    title: 'Ciclo 2027 (2 anos)',
                    desc: 'Construção de base para estudantes no início do internato ou 5º ano.'
                  },
                  {
                    id: 'Mais de 2 anos',
                    title: 'Mais de 2 anos',
                    desc: 'Ciclo clínico e fixação de longo prazo com método psicométrico.'
                  },
                  {
                    id: 'Sem prazo definido',
                    title: 'Sem prazo definido',
                    desc: 'Estudo livre e contínuo para aperfeiçoamento da prática médica.'
                  }
                ].map((item) => {
                  const isSelected = deadline === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDeadline(item.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-2 bg-amber-50/40 dark:bg-amber-950/20 shadow-md'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/30 dark:bg-zinc-900/30'
                      }`}
                      style={isSelected ? { borderColor: accentConfig.primaryHex } : {}}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              className="w-4 h-4"
                              style={{ color: accentConfig.primaryHex }}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 5: Provas Foco (Todas as Bancas e Instituições)     */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Quais provas são seu foco?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Diga quais bancas ou hospitais importam para você. Mais de 290 instituições disponíveis.
                </p>
              </div>

              <div className="max-w-lg mx-auto space-y-3">
                {/* Pílulas rápidas com as bancas mais concorridas */}
                <div className="flex flex-wrap gap-1.5">
                  {['ENARE / ENAMED', 'USP São Paulo', 'UNICAMP', 'AMRIGS', 'PSU-MG', 'SUS-SP', 'UFRJ'].map((inst) => {
                    const isSelected = selectedExamInst === inst;
                    return (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => setSelectedExamInst(inst)}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {inst}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="Buscar por sigla ou estado (ex: ENARE, USP, UNICAMP, PSU-MG)..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-900 dark:text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-zinc-800/40">
                  {filteredInstitutions.map((inst) => {
                    const isSelected = selectedExamInst === inst.shortName || selectedExamInst === inst.name;
                    return (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => setSelectedExamInst(inst.shortName)}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80'
                            : 'hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                              {inst.shortName}
                            </span>
                            {inst.state && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400">
                                {inst.state}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {inst.name}
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          {inst.totalQuestions && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {inst.totalQuestions} questões
                            </span>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 6: Especialidade Desejada (Trocado com antigo 4)    */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Qual especialidade quer seguir?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Personalizamos as notas de corte e a distribuição de temas para a sua especialidade pretendida.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                {/* Opção para decidir depois */}
                <button
                  type="button"
                  onClick={() => setSpecialty('Ainda não sei / vou decidir depois')}
                  className={`w-full p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    specialty === 'Ainda não sei / vou decidir depois'
                      ? 'border-2 border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>Ainda não sei / vou decidir depois</span>
                  {specialty === 'Ainda não sei / vou decidir depois' && <Check className="w-4 h-4 text-rose-500" />}
                </button>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                    placeholder="Buscar especialidade médica..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-slate-900 dark:text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {filteredSpecialties.map((spec) => {
                    const isSelected = specialty === spec;
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setSpecialty(spec)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/30 font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                            : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{spec}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 7: Revisão do Plano de Partida                     */}
          {/* ======================================================== */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Confira seu plano de partida
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Confira suas escolhas antes de acessar. Você pode clicar em <strong className="font-bold">Editar</strong> em qualquer item para ajustá-lo.
                </p>
              </div>

              <div className="max-w-lg mx-auto bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3.5">
                
                {/* 1. Indicação */}
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Indicação:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {appliedReferral ? (
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {appliedReferral.code} (-10%)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {skippedReferral ? 'Sem código' : 'Não informado'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                </div>

                {/* 2. Objetivo */}
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Target className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Objetivo:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {objective}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                </div>

                {/* 3. Faculdade */}
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Faculdade:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate text-right">
                      {collegeInput || 'Não informada'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                </div>

                {/* 4. Prazo */}
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Prazo:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {deadline}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                </div>

                {/* 5. Provas Foco */}
                <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Prova Foco:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 max-w-[200px] truncate text-right">
                      {selectedExamInst}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                </div>

                {/* 6. Especialidade */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Award className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Especialidade:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {specialty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  </div>
                </div>
              </div>

              {appliedReferral && (
                <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 text-emerald-500" />
                  <div>
                    <strong>10% de desconto pronto para uso!</strong> Seu código foi validado e o desconto será aplicado na ativação do plano.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 8: Boas-Vindas & Ações de Partida                   */}
          {/* ======================================================== */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Como você quer começar?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Seu espaço de estudos está pronto. Escolha sua primeira ação e comece a acelerar sua evolução.
                </p>
              </div>

              <div className="space-y-3 max-w-lg mx-auto">
                {/* 1. ADQUIRIR PLANO (Destaque Principal com Desconto) */}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleFinishOnboarding('plans')}
                  className="w-full p-4 rounded-2xl border-2 border-amber-500/80 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent dark:from-amber-950/40 dark:via-orange-950/20 text-left transition-all hover:scale-[1.01] hover:shadow-lg cursor-pointer flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          Adquirir Plano & Liberar Acesso Total
                        </span>
                        {appliedReferral ? (
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                            -10% OFF
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-600 text-white">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Acesso irrestrito a 160 mil questões comentadas, modelo TRI e inteligência de provas.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </button>

                {/* 2. FAZER QUESTÕES */}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleFinishOnboarding('questions')}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-left transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        Fazer Questões Agora
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Pratique com os filtros configurados para {selectedExamInst} e {specialty}.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </button>

                {/* 3. EXPLORAR A PLATAFORMA */}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleFinishOnboarding('home')}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-left transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-between group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-700 dark:bg-zinc-700 text-white flex items-center justify-center shadow-md shrink-0">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        Explorar a Plataforma
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Acesse seu dashboard inicial, métricas psicométricas e cadernos de erro.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Barra Inferior com Navegação (visível do passo 1 ao 7) */}
        {currentStep <= 7 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center justify-between gap-3 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSkipReferral}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Pular
              </button>
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && hasReferralCode === true && !appliedReferral) {
                    handleValidateReferral();
                  } else {
                    setCurrentStep((prev) => Math.min(7, prev + 1));
                  }
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition-all hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(8)}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Tudo certo, vamos lá!</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
