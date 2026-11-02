'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  applyReferralCode,
  validateReferralCode,
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
  AlertCircle
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
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

  // Etapa atual: 1 a 7
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Passo 1: Código de Indicação
  const [referralInput, setReferralInput] = useState<string>('');
  const [appliedReferral, setAppliedReferral] = useState<AppliedReferral | null>(null);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [skippedReferral, setSkippedReferral] = useState<boolean>(false);

  // Passo 2: Objetivo
  const [objective, setObjective] = useState<'Residência Médica' | 'Revalida' | 'ENAMED/ENARE' | 'R+'>('Residência Médica');

  // Passo 3: Faculdade
  const [collegeInput, setCollegeInput] = useState<string>(user?.college || '');
  const [collegeSearch, setCollegeSearch] = useState<string>('');

  // Passo 4: Prova Alvo (Instituições do Banco)
  const [selectedExamInst, setSelectedExamInst] = useState<string>(user?.targetExamName || 'ENARE / ENAMED');
  const [examSearch, setExamSearch] = useState<string>('');

  // Passo 5: Prazo
  const [deadline, setDeadline] = useState<string>('2026');

  // Passo 6: Especialidade
  const [specialty, setSpecialty] = useState<string>(user?.specialtyTarget || 'Clínica Médica');
  const [specialtySearch, setSpecialtySearch] = useState<string>('');

  // Status de salvamento final
  const [isSaving, setIsSaving] = useState(false);

  // Todas as 291 instituições disponíveis no banco
  const allInstitutions = useMemo(() => {
    try {
      const list = getInstitutions();
      return list.sort((a, b) => (b.totalQuestions || 0) - (a.totalQuestions || 0));
    } catch {
      return [];
    }
  }, []);

  // Filtragem de instituições no Passo 4
  const filteredInstitutions = useMemo(() => {
    if (!examSearch.trim()) return allInstitutions.slice(0, 40);
    const q = examSearch.toLowerCase();
    return allInstitutions.filter((item) =>
      item.shortName.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.state && item.state.toLowerCase().includes(q)) ||
      item.aliases?.some((al) => al.toLowerCase().includes(q))
    ).slice(0, 40);
  }, [allInstitutions, examSearch]);

  // Filtragem de faculdades no Passo 3
  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return PRESET_COLLEGES.slice(0, 10);
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
      setReferralError('Digite o código de indicação ou clique em "Não tenho código".');
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

  // Finalização do Onboarding (Passo 7)
  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      // Data estimada da prova de acordo com o prazo
      const targetDate = deadline === '2025'
        ? '2025-11-01'
        : deadline === '2026'
        ? '2026-11-01'
        : deadline === '2027'
        ? '2027-11-01'
        : '2028-11-01';

      if (user) {
        await updateProfile({
          college: collegeInput || 'Faculdade de Medicina',
          specialtyTarget: specialty,
          targetExamName: selectedExamInst,
          targetExamDate: targetDate
        });
        localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
        localStorage.setItem('user_target_exam_name', selectedExamInst);
        localStorage.setItem('user_target_exam_date', targetDate);
      }

      // Se aplicou cupom, já fica salvo no storage global
      if (appliedReferral) {
        applyReferralCode(appliedReferral.code);
      }

      localStorage.setItem('bancoresidencia_user_objective', objective);
      localStorage.setItem('bancoresidencia_user_deadline', deadline);

      if (onComplete) onComplete();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar onboarding:', err);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Barra Superior com Progresso */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Configuração Inicial de Estudos
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Passo {currentStep} de 7
                </span>
              </div>
            </div>

            {/* Barra de Progresso visual com 7 steps */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === currentStep
                      ? 'w-6 shadow-xs'
                      : s < currentStep
                      ? 'w-2 bg-emerald-500'
                      : 'w-2 bg-slate-200 dark:bg-slate-800'
                  }`}
                  style={s === currentStep ? { backgroundColor: accentConfig.primaryHex } : {}}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Corpo do Passo com Scroll */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* ======================================================== */}
          {/* PASSO 1: Código de Indicação                             */}
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
                  Se um colega ou professor te recomendou a plataforma, digite o código dele para garantir{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">10% de desconto imediato</strong> em qualquer plano!
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
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
                    placeholder="Ex: MED-LUCAS-10 ou RESIDENCIA10"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white font-mono font-bold text-center tracking-wider placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
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

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleValidateReferral}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-all hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <Check className="w-4 h-4" />
                    Validar Código & Continuar
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipReferral}
                    className="py-3 px-4 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    Não tenho código
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 2: Objetivo                                        */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Qual é o seu objetivo principal?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Personalizamos as questões, simulados e pesos psicométricos de acordo com a sua meta.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  {
                    id: 'Residência Médica',
                    desc: 'Acesso direto para as principais bancas e hospitais do Brasil (ENARE, USP, PSU, AMRIGS, etc.).'
                  },
                  {
                    id: 'Revalida',
                    desc: 'Foco total no INEP e provas de revalidação de diploma médico com gabaritos detalhados.'
                  },
                  {
                    id: 'ENAMED/ENARE',
                    desc: 'Exame Nacional de Residência e Avaliação da Formação Médica em alto rendimento.'
                  },
                  {
                    id: 'R+',
                    desc: 'Especialidades clínicas, cirúrgicas e pediátricas com pré-requisito e provas específicas.'
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
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30'
                      }`}
                      style={isSelected ? { borderColor: accentConfig.primaryHex } : {}}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {item.id}
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
          {/* PASSO 3: Faculdade de Origem                             */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Você é de qual faculdade?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Selecione sua instituição ou digite o nome caso não esteja listada.
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
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{c}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PASSO 4: Prova Alvo (Todas as 291 Instituições)           */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Qual prova você quer passar?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Todas as 290+ instituições do Banco Residência estão disponíveis.
                </p>
              </div>

              <div className="max-w-lg mx-auto space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="Buscar por sigla, nome ou estado (ex: ENARE, USP, UNICAMP, PSU-MG)..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/40">
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
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                              {inst.shortName}
                            </span>
                            {inst.state && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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
          {/* PASSO 5: Prazo de Preparação                             */}
          {/* ======================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Qual é o seu prazo de aprovação?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Ajustamos o cronômetro de contagem regressiva e o ritmo de questões para o seu ciclo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {[
                  {
                    id: '2025',
                    title: '2025 (Reta Final)',
                    desc: 'Foco total nas provas deste ano com simulados intensivos e revisão de pontos fracos.'
                  },
                  {
                    id: '2026',
                    title: '2026 (Próximo Ciclo)',
                    desc: 'Preparação completa de 1 ano com cobertura ampla de todas as grandes áreas.'
                  },
                  {
                    id: '2027',
                    title: '2027 (Médio Prazo)',
                    desc: '2 anos de preparação para quem está no início do internato ou 5º ano.'
                  },
                  {
                    id: 'Mais de 2 anos',
                    title: 'Mais de 2 anos',
                    desc: 'Construção sólida de base clínica e psicométrica desde o ciclo clínico.'
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
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30'
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
          {/* PASSO 6: Especialidade Desejada                          */}
          {/* ======================================================== */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Qual especialidade você deseja passar?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Selecione sua primeira opção para calibrarmos as notas de corte do seu ranking.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                    placeholder="Buscar especialidade médica..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
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
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
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
          {/* PASSO 7: Conferir Todos os Pontos & Finalizar            */}
          {/* ======================================================== */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
              <div className="text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Tudo pronto! Vamos conferir seus dados?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Verifique suas escolhas antes de acessar a plataforma.
                </p>
              </div>

              <div className="max-w-lg mx-auto bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-3.5">
                {/* Código de Indicação */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Código de Indicação:</span>
                  </div>
                  <div className="text-right">
                    {appliedReferral ? (
                      <div>
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {appliedReferral.code} (-10%)
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Indicado por {appliedReferral.referrerName}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {skippedReferral ? 'Sem código aplicado' : 'Não informado'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Objetivo */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Target className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Objetivo:</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {objective}
                  </span>
                </div>

                {/* Faculdade */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <GraduationCap className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Faculdade:</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white max-w-[240px] truncate text-right">
                    {collegeInput || 'Não informada'}
                  </span>
                </div>

                {/* Prova Alvo */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Prova Alvo:</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 max-w-[240px] truncate text-right">
                    {selectedExamInst}
                  </span>
                </div>

                {/* Prazo */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Prazo de Aprovação:</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {deadline}
                  </span>
                </div>

                {/* Especialidade */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                    <Award className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Especialidade Desejada:</span>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {specialty}
                  </span>
                </div>
              </div>

              {appliedReferral && (
                <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 text-emerald-500" />
                  <div>
                    <strong>10% de desconto pronto para uso!</strong> Ao entrar na plataforma, clique em <strong>Adquirir Plano</strong> no cabeçalho para ver os valores com o desconto já aplicado.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barra Inferior com Navegação */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : (
            <div />
          )}

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition-all hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <span>Avançar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Acessar a Plataforma</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

