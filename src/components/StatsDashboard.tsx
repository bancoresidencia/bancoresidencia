'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import {
  Calendar,
  Search,
  Filter,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Stethoscope,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CircleCheck,
  Play,
  X,
  BookOpen,
  ArrowUpDown,
  AlertOctagon,
  Loader2,
  Baby,
  HeartPulse,
  Activity,
  ShieldAlert,
  Scissors,
  ShieldCheck,
  Flower2,
  Footprints
} from 'lucide-react';
import { UserStats, PerformanceFilterState, PeriodFilter, Modalidade, UserAnswerItem } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { clinicalHierarchy, mockInstitutionsList, mockBancas } from '@/data/mockQuestions';
import { AIPerformanceMentorCard } from './AIPerformanceMentorCard';
import { DailyHabitsAndHourlyExplorer } from './DailyHabitsAndHourlyExplorer';

// Ícone anatômico de Ginecologia: Útero, colo uterino, trompas de Falópio e ovários bilaterais
export const UterusIcon: React.FC<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }> = ({
  className = 'w-5 h-5',
  strokeWidth = 2,
  style
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    {/* Fundo e corpo uterino com colo (cérvix) */}
    <path d="M8.5 10c0 4 2 5.5 2 9.5h3c0-4 2-5.5 2-9.5" />
    <path d="M8.5 10c1-1.2 2.2-1.8 3.5-1.8s2.5.6 3.5 1.8" />
    {/* Trompa de Falópio esquerda com fímbrias */}
    <path d="M8.5 10C6.5 7.8 4.5 6 2.5 7c-1.3.8-1 3.2.5 3.8" />
    {/* Trompa de Falópio direita com fímbrias */}
    <path d="M15.5 10c2-2.2 4-4 6-3 1.3.8 1 3.2-.5 3.8" />
    {/* Ovários bilaterais */}
    <circle cx="3.5" cy="13" r="1.8" />
    <circle cx="20.5" cy="13" r="1.8" />
  </svg>
);

// Ícone clínico de Obstetrícia: Gestante com barriga crescida e acolhimento materno
export const PregnantWomanIcon: React.FC<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }> = ({
  className = 'w-5 h-5',
  strokeWidth = 2,
  style
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    {/* Cabeça */}
    <circle cx="11" cy="4" r="2.2" />
    {/* Coluna e postura dorsal */}
    <path d="M8.5 7.5v13.5" />
    {/* Silhueta com barriga gravídica volumosa e proeminente */}
    <path d="M10.8 7.5c1 .5 1.5 1.2 1.5 2.2 0 .6.3 1 .8 1.4 2 .8 4.2 2.2 4.2 4.9 0 2.8-2.2 4.5-4.8 4.5H10" />
    {/* Perna de apoio */}
    <path d="M11.5 20.5v1.5" />
    {/* Mão materna acariciando a barriga */}
    <path d="M12.2 11c.8 1 2 2 3.4 2.2" />
  </svg>
);

// Componente de Contagem Fluida com Interpolação Ease-Out
export const AnimatedCounter: React.FC<{
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  className?: string;
  formatAsTime?: boolean;
}> = ({ value, decimals = 0, suffix = '', duration = 750, className = '', formatAsTime = false }) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const startValRef = useRef<number>(0);

  useEffect(() => {
    const startVal = startValRef.current;
    const targetVal = value;
    let animFrame: number;
    startTimeRef.current = null;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);

      const current = startVal + (targetVal - startVal) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetVal);
        startValRef.current = targetVal;
      }
    };

    animFrame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [value, duration]);

  if (formatAsTime) {
    const totalSecs = Math.round(displayValue);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return <span className={className}>{m}m {s.toString().padStart(2, '0')}s</span>;
  }

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString('pt-BR');

  return <span className={className}>{formatted}{suffix}</span>;
};

interface StatsDashboardProps {
  stats: UserStats;
  filters: PerformanceFilterState;
  onFilterChange: (filters: PerformanceFilterState) => void;
  onResetFilters: () => void;
  onSimulateDemoQuestions?: (amount: number) => void;
  onNavigateToBancoWithSubfoco?: (specialty: string, tema: string, subfoco: string) => void;
  onNavigateToRanking?: () => void;
  userAnswers?: Record<string, UserAnswerItem>;
  onNavigateToCadernoErros?: (specialty?: string, tema?: string) => void;
}

// 6 Especialidades Médicas Oficiais dos Filtros da Plataforma
export const SIX_FILTER_SPECIALTIES = [
  { id: 'clinica', nome: 'Clínica Médica', cor: '#3B82F6' },
  { id: 'cirurgia', nome: 'Cirurgia Geral', cor: '#10B981' },
  { id: 'pediatria', nome: 'Pediatria', cor: '#F59E0B' },
  { id: 'ginecologia', nome: 'Ginecologia', cor: '#EC4899' },
  { id: 'obstetricia', nome: 'Obstetrícia', cor: '#8B5CF6' },
  { id: 'preventiva', nome: 'Medicina Preventiva e Social', cor: '#06B6D4' }
];

// Dados temporais parametrizados por período
const quickPeriodConfig: Record<string, { factor: number; label: string; trendVolume: string; trendAproveitamento: string }> = {
  '7d': { factor: 0.22, label: '7D', trendVolume: '+18.0%', trendAproveitamento: '-2.1%' },
  '30d': { factor: 0.52, label: '30D', trendVolume: '+24.5%', trendAproveitamento: '+4.2%' },
  'mes': { factor: 0.42, label: 'Mês', trendVolume: '+16.3%', trendAproveitamento: '+3.1%' },
  '6m': { factor: 0.85, label: '6M', trendVolume: '+29.0%', trendAproveitamento: '+3.8%' },
  '2026.1': { factor: 0.75, label: '2026.1', trendVolume: '+22.4%', trendAproveitamento: '+1.9%' },
  '2026.2': { factor: 0.90, label: '2026.2', trendVolume: '+31.2%', trendAproveitamento: '+2.8%' },
  'all': { factor: 1.0, label: 'Tudo', trendVolume: '+14.2%', trendAproveitamento: '+5.4%' },
  'custom': { factor: 0.65, label: 'Personalizado', trendVolume: '+21.0%', trendAproveitamento: '+3.0%' }
};

type StatsSubTab = 'overview' | 'specialties' | 'weaknesses';

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      date?: string;
      resolvidas: number;
      acertos: number;
      erros: number;
    };
  }>;
  label?: string;
}

const CustomBarTooltip: React.FC<CustomBarTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const taxa = data.resolvidas > 0 ? ((data.acertos / data.resolvidas) * 100).toFixed(1) : '0.0';
    const isGood = Number(taxa) >= 70;
    const displayTitle = data.date && data.date !== data.label ? `${data.label} (${data.date})` : (data.date || label);
    return (
      <div className="bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--card-border)] rounded-xl p-3.5 shadow-2xl min-w-[185px] text-xs">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-2 mb-2.5">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-heading">{displayTitle}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
            isGood
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
              : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
          }`}>
            {taxa}% acerto
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-500" />
              Total Feitas:
            </span>
            <span className="font-bold text-slate-900 dark:text-white font-sans tabular-nums">{data.resolvidas}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Acertos:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans tabular-nums">{data.acertos}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Erros:
            </span>
            <span className="font-bold text-rose-600 dark:text-rose-400 font-sans tabular-nums">{data.erros}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  filters,
  onFilterChange,
  onResetFilters,
  onNavigateToBancoWithSubfoco,
  userAnswers = {},
  onNavigateToCadernoErros
}) => {
  const { mode, accentConfig } = useTheme();

  // Sub-abas principais: Visão Geral | Especialidades | Raio-X de Erros
  const [activeSubTab, setActiveSubTab] = useState<StatsSubTab>('overview');

  // Controle de expansão da tabela sanfona de especialidades e legenda (Imagem 3)
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);

  const toggleAreaExpansion = (areaId: string) => {
    setExpandedAreas((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
    );
  };

  // Drawer lateral para temas da especialidade
  const [selectedSpecialtyForDrawer, setSelectedSpecialtyForDrawer] = useState<{
    id: string;
    nome: string;
    cor: string;
    resolvidas: number;
    acertos: number;
    erros: number;
    taxa: number;
    temas: Array<{ nome: string; resolvidas: number; acertos: number; erros: number; taxa: number }>;
  } | null>(null);
  const [isSpecialtyDrawerOpen, setIsSpecialtyDrawerOpen] = useState<boolean>(false);
  const [drawerTemaSearch, setDrawerTemaSearch] = useState<string>('');
  const [drawerTemaFilter, setDrawerTemaFilter] = useState<'all' | 'errors' | 'good'>('all');

  // Estados de controle de filtros, busca de instituições e calendário
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);
  const [instSearch, setInstSearch] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [tempStartDate, setTempStartDate] = useState<string>(filters.customStartDate || '');
  const [tempEndDate, setTempEndDate] = useState<string>(filters.customEndDate || '');

  const SPECIALTY_CARD_CONFIG: Record<string, {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    bgLight: string;
    bgDark: string;
    textColor: string;
    borderLight: string;
    borderDark: string;
  }> = {
    clinica: {
      icon: Stethoscope,
      bgLight: 'bg-blue-500/10',
      bgDark: 'dark:bg-blue-500/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderLight: 'border-blue-500/30',
      borderDark: 'dark:border-blue-500/40'
    },
    cirurgia: {
      icon: Scissors,
      bgLight: 'bg-emerald-500/10',
      bgDark: 'dark:bg-emerald-500/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderLight: 'border-emerald-500/30',
      borderDark: 'dark:border-emerald-500/40'
    },
    pediatria: {
      icon: Baby,
      bgLight: 'bg-amber-500/10',
      bgDark: 'dark:bg-amber-500/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderLight: 'border-amber-500/30',
      borderDark: 'dark:border-amber-500/40'
    },
    ginecologia: {
      icon: UterusIcon,
      bgLight: 'bg-pink-500/10',
      bgDark: 'dark:bg-pink-500/20',
      textColor: 'text-pink-600 dark:text-pink-400',
      borderLight: 'border-pink-500/30',
      borderDark: 'dark:border-pink-500/40'
    },
    obstetricia: {
      icon: PregnantWomanIcon,
      bgLight: 'bg-purple-500/10',
      bgDark: 'dark:bg-purple-500/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderLight: 'border-purple-500/30',
      borderDark: 'dark:border-purple-500/40'
    },
    preventiva: {
      icon: ShieldCheck,
      bgLight: 'bg-cyan-500/10',
      bgDark: 'dark:bg-cyan-500/20',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      borderLight: 'border-cyan-500/30',
      borderDark: 'dark:border-cyan-500/40'
    }
  };

  const getSpecialtyCardIcon = (id: string) => {
    return SPECIALTY_CARD_CONFIG[id]?.icon || Stethoscope;
  };

  // Filtros da aba Raio-X de Erros
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('Todas');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'todos' | 'criticos' | 'atencao'>('todos');
  const [subfocoSearch, setSubfocoSearch] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: 'errors' | 'accuracy' | 'total'; direction: 'asc' | 'desc' }>({
    key: 'errors',
    direction: 'desc'
  });
  const [dataScope, setDataScope] = useState<'pessoal' | 'global'>('pessoal');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modal de Recuperação Ativa
  const [trainingModal, setTrainingModal] = useState<{
    titulo: string;
    subtitulo: string;
    erros: number;
    rendimento: number;
    specialty?: string;
    tema?: string;
    subfoco?: string;
  } | null>(null);
  const [trainingMode, setTrainingMode] = useState<'erradas' | 'ineditas'>('erradas');
  const [isRaioXTransitioning, setIsRaioXTransitioning] = useState<boolean>(false);
  const [isStartingTraining, setIsStartingTraining] = useState<boolean>(false);

  React.useEffect(() => {
    setIsRaioXTransitioning(true);
    const t = setTimeout(() => setIsRaioXTransitioning(false), 260);
    return () => clearTimeout(t);
  }, [selectedAreaFilter, selectedStatusFilter, subfocoSearch, dataScope]);

  // Toggle para expandir/recolher área específica
  const toggleExpandArea = useCallback((id: string) => {
    setExpandedAreas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Expandir todas ou recolher todas as áreas
  const toggleExpandAll = useCallback(() => {
    setExpandedAreas((prev) =>
      prev.length === SIX_FILTER_SPECIALTIES.length ? [] : SIX_FILTER_SPECIALTIES.map((e) => e.id)
    );
  }, []);

  // Helper para rótulo legível do período selecionado
  const getPeriodDisplayLabel = useCallback(() => {
    if (filters.period === 'custom' && filters.customStartDate && filters.customEndDate) {
      const s = filters.customStartDate.split('-');
      const e = filters.customEndDate.split('-');
      if (s.length === 3 && e.length === 3) {
        return `${s[2]}/${s[1]} - ${e[2]}/${e[1]}`;
      }
      return 'Personalizado';
    }
    const map: Record<string, string> = {
      '7d': 'Últimos 7 dias',
      '30d': 'Últimos 30 dias',
      'mes': 'Mês Atual',
      '6m': 'Últimos 6 meses',
      '2026.1': 'Semestre 2026.1',
      '2026.2': 'Semestre 2026.2',
      'all': 'Todo o Histórico'
    };
    return map[filters.period] || 'Período';
  }, [filters.period, filters.customStartDate, filters.customEndDate]);

  // Métricas ativas com base no período e nas respostas reais do aluno (userAnswers)
  const activeMetrics = useMemo(() => {
    const q = quickPeriodConfig[filters.period] || quickPeriodConfig['all'];
    const factor = q.factor;

    // 1. Filtragem das respostas reais do usuário
    const allAnswers = Object.values(userAnswers);
    let filteredAnswers: UserAnswerItem[] = [];
    let now = 0;

    if (allAnswers.length > 0) {
      // eslint-disable-next-line react-hooks/purity
      now = Date.now();
      filteredAnswers = allAnswers.filter((ans) => {
        // Filtro por instituição
        if (filters.institutions.length > 0) {
          const ansBanca = ans.banca || '';
          const matchInst = filters.institutions.some((inst) =>
            ansBanca.toLowerCase().includes(inst.toLowerCase())
          );
          if (!matchInst) return false;
        }

        // Filtro por banca
        if (filters.banca !== 'Todas as Bancas' && ans.banca !== filters.banca) {
          return false;
        }

        // Filtro por período
        const ts = ans.timestamp || now;
        if (filters.period === 'custom' && filters.customStartDate && filters.customEndDate) {
          const start = new Date(filters.customStartDate).getTime();
          const end = new Date(filters.customEndDate + 'T23:59:59').getTime();
          return ts >= start && ts <= end;
        }
        if (filters.period === '7d') return ts >= now - 7 * 86400000;
        if (filters.period === '30d') return ts >= now - 30 * 86400000;
        if (filters.period === 'mes') {
          const startOfMonth = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
          return ts >= startOfMonth;
        }
        if (filters.period === '6m') return ts >= now - 180 * 86400000;
        if (filters.period === '2026.1') {
          const start = new Date('2026-01-01').getTime();
          const end = new Date('2026-06-30T23:59:59').getTime();
          return ts >= start && ts <= end;
        }
        if (filters.period === '2026.2') {
          const start = new Date('2026-07-01').getTime();
          const end = new Date('2026-12-31T23:59:59').getTime();
          return ts >= start && ts <= end;
        }
        return true; // 'all'
      });
    }

    const hasRealAnswers = filteredAnswers.length > 0;
      const answered = hasRealAnswers
        ? filteredAnswers.length
        : Math.round((stats.totalAnswered || 0) * factor);
      const correct = hasRealAnswers
        ? filteredAnswers.filter((a) => a.isCorrect).length
        : Math.round((stats.totalCorrect || 0) * factor);
      const incorrect = Math.max(0, answered - correct);
      const accuracy = answered > 0 ? (correct / answered) * 100 : stats.accuracyRate || 0;
      const unique = Math.round((stats.uniqueAnswered || (stats.totalAnswered || 0)) * factor);
      const ineditas = Math.round(unique * 0.9);

      // Geração de buckets adaptativos estritamente sincronizados com o filtro de período
      const nowObj = new Date();
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

      interface BucketDef {
        label: string;
        date: string;
        startTs: number;
        endTs: number;
        weight: number;
      }

      const buckets: BucketDef[] = [];

      if (filters.period === '7d') {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(nowObj);
          d.setDate(d.getDate() - i);
          const startTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
          const endTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
          const label = i === 0 ? 'Hoje' : dayNames[d.getDay()];
          const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          buckets.push({
            label,
            date,
            startTs,
            endTs,
            weight: 0.08 + (6 - i) * 0.03
          });
        }
      } else if (filters.period === '30d') {
        const stepDays = 4;
        const numPoints = 8;
        for (let i = numPoints - 1; i >= 0; i--) {
          const d = new Date(nowObj);
          d.setDate(d.getDate() - i * stepDays);
          const startTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
          const endTs = startTs + stepDays * 86400000 - 1;
          const label = i === 0 ? 'Hoje' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          buckets.push({
            label,
            date: label,
            startTs,
            endTs,
            weight: 0.07 + (numPoints - 1 - i) * 0.02
          });
        }
      } else if (filters.period === 'mes') {
        const curYear = nowObj.getFullYear();
        const curMonth = nowObj.getMonth();
        const curDay = nowObj.getDate();
        const numPoints = Math.min(7, Math.max(4, Math.ceil(curDay / 4)));
        const step = Math.max(1, Math.floor(curDay / numPoints));

        for (let i = 0; i < numPoints; i++) {
          const day = Math.min(curDay, 1 + i * step);
          const startTs = new Date(curYear, curMonth, day, 0, 0, 0, 0).getTime();
          const endTs = startTs + step * 86400000 - 1;
          const label = i === numPoints - 1 ? 'Hoje' : `${String(day).padStart(2, '0')}/${monthNames[curMonth]}`;
          buckets.push({
            label,
            date: label,
            startTs,
            endTs,
            weight: 0.09 + i * 0.03
          });
        }
      } else if (filters.period === '6m') {
        // 6 Meses consecutivos mapeados perfeitamente
        for (let i = 5; i >= 0; i--) {
          const d = new Date(nowObj.getFullYear(), nowObj.getMonth() - i, 1);
          const y = d.getFullYear();
          const m = d.getMonth();
          const startTs = new Date(y, m, 1, 0, 0, 0, 0).getTime();
          const endTs = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();
          const label = monthNames[m];
          buckets.push({
            label,
            date: `${monthNames[m]}/${String(y).slice(2)}`,
            startTs,
            endTs,
            weight: 0.09 + (5 - i) * 0.035
          });
        }
      } else if (filters.period === '2026.1') {
        for (let m = 0; m < 6; m++) {
          const startTs = new Date(2026, m, 1, 0, 0, 0, 0).getTime();
          const endTs = new Date(2026, m + 1, 0, 23, 59, 59, 999).getTime();
          buckets.push({
            label: monthNames[m],
            date: `${monthNames[m]}/26`,
            startTs,
            endTs,
            weight: 0.11 + m * 0.025
          });
        }
      } else if (filters.period === '2026.2') {
        for (let m = 6; m < 12; m++) {
          const startTs = new Date(2026, m, 1, 0, 0, 0, 0).getTime();
          const endTs = new Date(2026, m + 1, 0, 23, 59, 59, 999).getTime();
          buckets.push({
            label: monthNames[m],
            date: `${monthNames[m]}/26`,
            startTs,
            endTs,
            weight: 0.11 + (m - 6) * 0.025
          });
        }
      } else if (filters.period === 'all') {
        for (let i = 7; i >= 0; i--) {
          const d = new Date(nowObj.getFullYear(), nowObj.getMonth() - i, 1);
          const y = d.getFullYear();
          const m = d.getMonth();
          const startTs = new Date(y, m, 1, 0, 0, 0, 0).getTime();
          const endTs = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();
          buckets.push({
            label: monthNames[m],
            date: `${monthNames[m]}/${String(y).slice(2)}`,
            startTs,
            endTs,
            weight: 0.08 + (7 - i) * 0.02
          });
        }
      } else if (filters.period === 'custom' && filters.customStartDate && filters.customEndDate) {
        const start = new Date(filters.customStartDate).getTime();
        const end = new Date(filters.customEndDate + 'T23:59:59').getTime();
        const diffDays = Math.max(1, Math.round((end - start) / 86400000));
        const numPoints = Math.min(8, Math.max(4, diffDays));
        const stepMs = (end - start) / numPoints;

        for (let i = 0; i < numPoints; i++) {
          const pStart = start + i * stepMs;
          const pEnd = pStart + stepMs;
          const d = new Date(pStart);
          const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          buckets.push({
            label,
            date: label,
            startTs: pStart,
            endTs: pEnd,
            weight: 1 / numPoints
          });
        }
      } else {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(nowObj);
          d.setDate(d.getDate() - i);
          const startTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
          const endTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
          const label = i === 0 ? 'Hoje' : dayNames[d.getDay()];
          buckets.push({
            label,
            date: label,
            startTs,
            endTs,
            weight: 0.08 + (6 - i) * 0.03
          });
        }
      }

      // Normaliza pesos
      const sumWeights = buckets.reduce((acc, b) => acc + b.weight, 0);
      if (sumWeights > 0) {
        buckets.forEach((b) => {
          b.weight = b.weight / sumWeights;
        });
      }

      // Agrupa respostas reais que caem no intervalo de cada bucket
      const bucketRealStats = buckets.map((b) => {
        const answersInBucket = filteredAnswers.filter(
          (ans) => (ans.timestamp || now) >= b.startTs && (ans.timestamp || now) <= b.endTs
        );
        const correctInBucket = answersInBucket.filter((a) => a.isCorrect).length;
        return {
          realCount: answersInBucket.length,
          realCorrect: correctInBucket
        };
      });

      const totalRealInBuckets = bucketRealStats.reduce((acc, s) => acc + s.realCount, 0);
      const hasSufficientRealData = totalRealInBuckets >= 12;

      const chartData: {
        label: string;
        date: string;
        answered: number;
        correct: number;
        resolvidas: number;
        acertos: number;
        erros: number;
      }[] = buckets.map((b, idx) => {
        let ans: number;
        let cor: number;

        if (hasSufficientRealData) {
          ans = bucketRealStats[idx].realCount;
          cor = bucketRealStats[idx].realCorrect;
        } else {
          // Harmoniza dados proporcionais à métrica do período, integrando respostas reais quando existentes
          const simAns = Math.max(1, Math.round(answered * b.weight));
          const simCor = Math.min(simAns, Math.max(0, Math.round(simAns * (accuracy / 100))));

          const realAns = bucketRealStats[idx].realCount;
          const realCor = bucketRealStats[idx].realCorrect;

          ans = Math.max(simAns, realAns);
          cor = realAns > 0 ? Math.min(ans, simCor + realCor) : simCor;
        }

        const err = Math.max(0, ans - cor);
        return {
          label: b.label,
          date: b.date,
          answered: ans,
          correct: cor,
          resolvidas: ans,
          acertos: cor,
          erros: err
        };
      });

    return {
      factor,
      label: q.label,
      trendVolume: q.trendVolume,
      trendAproveitamento: q.trendAproveitamento,
      answered,
      correct,
      incorrect,
      accuracy,
      unique,
      ineditas,
      chartData
    };
  }, [filters, stats, userAnswers]);

  // Especialidades mapeadas com as cores dinâmicas do tema ativo
  const dynamicSpecialties = useMemo(() => {
    return SIX_FILTER_SPECIALTIES.map((spec, index) => ({
      ...spec,
      cor: accentConfig?.chartPalette?.[index] || spec.cor
    }));
  }, [accentConfig]);

  // Agregação das 6 Especialidades e seus respectivos Temas Resolvidos
  // Regra crítica: SOMENTE temas com questões resolvidas (> 0) são listados na tabela
  const specialtiesBreakdown = useMemo(() => {
    // Mapa de temas resolvidos reais obtidos do stats.byTheme ou calculados do histórico
    const themeAnswerMap: Record<string, { total: number; correct: number }> = {};

    if (stats.byTheme && stats.byTheme.length > 0) {
      stats.byTheme.forEach((item) => {
        let specName = item.specialty;
        if (specName === 'Cirurgia') specName = 'Cirurgia Geral';
        const key = `${specName}:::${item.tema}`;
        themeAnswerMap[key] = { total: item.total, correct: item.correct };
      });
    }

    return dynamicSpecialties.map((specConfig) => {
      // Localiza o nó da hierarquia correspondente
      const hierarchyNode = clinicalHierarchy.find((h) =>
        h.especialidade === specConfig.nome ||
        (specConfig.nome === 'Cirurgia Geral' && h.especialidade === 'Cirurgia')
      );

      const catalogTemas = hierarchyNode?.temas || [];

      // Filtra e computa APENAS os temas que possuem resolução de questões
      const temasResolvidos = catalogTemas
        .map((t) => {
          const key = `${specConfig.nome}:::${t.tema}`;
          const recorded = themeAnswerMap[key];

          // Se houver registro real em stats.byTheme, usa-o
          let total = recorded ? Math.round(recorded.total * activeMetrics.factor) : 0;
          let correct = recorded ? Math.round(recorded.correct * activeMetrics.factor) : 0;

          // Se o usuário tiver resolvido questões nesta especialidade geral mas não tiver byTheme granular,
          // faz uma distribuição representativa proporcional baseada no volume da especialidade
          if (total === 0 && (!stats.byTheme || stats.byTheme.length === 0)) {
            const specStat = stats.bySpecialty?.find((s) => s.specialty === specConfig.nome || (specConfig.nome === 'Cirurgia Geral' && s.specialty === 'Cirurgia'));
            if (specStat && specStat.total > 0) {
              const specTotal = Math.round(specStat.total * activeMetrics.factor);
              // Mapeia apenas alguns temas-chave da especialidade com base no volume para não inflar artificialmente
              const hash = (t.tema.length * 7 + specConfig.nome.length) % 10;
              if (hash < 4 && specTotal > 0) {
                total = Math.max(1, Math.round(specTotal * 0.25));
                correct = Math.round(total * (specStat.accuracy / 100));
              }
            }
          }

          const errors = Math.max(0, total - correct);
          const taxa = total > 0 ? (correct / total) * 100 : 0;

          return {
            nome: t.tema,
            resolvidas: total,
            acertos: correct,
            erros: errors,
            taxa
          };
        })
        .filter((t) => t.resolvidas > 0); // "so contabilize na tabela quando for havendo a resolução das questoes daquele tema"

      // Totais da especialidade
      let specResolvidas = temasResolvidos.reduce((acc, curr) => acc + curr.resolvidas, 0);
      let specAcertos = temasResolvidos.reduce((acc, curr) => acc + curr.acertos, 0);

      // Se a soma dos temas for 0, mas stats.bySpecialty tiver valor direto:
      if (specResolvidas === 0) {
        const directStat = stats.bySpecialty?.find((s) => s.specialty === specConfig.nome || (specConfig.nome === 'Cirurgia Geral' && s.specialty === 'Cirurgia'));
        if (directStat && directStat.total > 0) {
          specResolvidas = Math.round(directStat.total * activeMetrics.factor);
          specAcertos = Math.round(directStat.correct * activeMetrics.factor);
        }
      }

      const specErros = Math.max(0, specResolvidas - specAcertos);
      const specTaxa = specResolvidas > 0 ? (specAcertos / specResolvidas) * 100 : 0;

      return {
        id: specConfig.id,
        nome: specConfig.nome,
        cor: specConfig.cor,
        resolvidas: specResolvidas,
        acertos: specAcertos,
        erros: specErros,
        taxa: specTaxa,
        temas: temasResolvidos
      };
    });
  }, [stats, activeMetrics, dynamicSpecialties]);

  // Top Temas para o novo gráfico integrado da Visão Geral
  const topThemesList = useMemo(() => {
    const list: {
      nome: string;
      specialty: string;
      resolvidas: number;
      acertos: number;
      erros: number;
      taxa: number;
    }[] = [];

    specialtiesBreakdown.forEach((spec) => {
      spec.temas.forEach((t) => {
        if (t.resolvidas > 0) {
          list.push({
            nome: t.nome,
            specialty: spec.nome,
            resolvidas: t.resolvidas,
            acertos: t.acertos,
            erros: t.erros,
            taxa: t.taxa
          });
        }
      });
    });

    list.sort((a, b) => b.resolvidas - a.resolvidas);
    if (list.length >= 3) {
      return list.slice(0, 6);
    }

    // Amostra representativa caso não haja temas suficientes no período
    const baseTotal = activeMetrics.answered || 60;
    return [
      { nome: 'Cardiologia & ECG', specialty: 'Clínica Médica', resolvidas: Math.max(8, Math.round(baseTotal * 0.22)), acertos: Math.max(6, Math.round(baseTotal * 0.22 * 0.75)), erros: Math.round(baseTotal * 0.22 * 0.25), taxa: 75.0 },
      { nome: 'Trauma & ATLS', specialty: 'Cirurgia Geral', resolvidas: Math.max(7, Math.round(baseTotal * 0.18)), acertos: Math.max(5, Math.round(baseTotal * 0.18 * 0.68)), erros: Math.round(baseTotal * 0.18 * 0.32), taxa: 68.0 },
      { nome: 'Pré-Natal & Obstetrícia', specialty: 'Ginecologia', resolvidas: Math.max(6, Math.round(baseTotal * 0.16)), acertos: Math.max(5, Math.round(baseTotal * 0.16 * 0.82)), erros: Math.round(baseTotal * 0.16 * 0.18), taxa: 82.0 },
      { nome: 'Neonatologia & Vacinas', specialty: 'Pediatria', resolvidas: Math.max(6, Math.round(baseTotal * 0.15)), acertos: Math.max(4, Math.round(baseTotal * 0.15 * 0.72)), erros: Math.round(baseTotal * 0.15 * 0.28), taxa: 72.0 },
      { nome: 'Atenção Primária & SUS', specialty: 'Preventiva', resolvidas: Math.max(5, Math.round(baseTotal * 0.14)), acertos: Math.max(4, Math.round(baseTotal * 0.14 * 0.85)), erros: Math.round(baseTotal * 0.14 * 0.15), taxa: 85.0 },
      { nome: 'Infectologia & Sepse', specialty: 'Clínica Médica', resolvidas: Math.max(5, Math.round(baseTotal * 0.12)), acertos: Math.max(3, Math.round(baseTotal * 0.12 * 0.64)), erros: Math.round(baseTotal * 0.12 * 0.36), taxa: 64.0 }
    ];
  }, [specialtiesBreakdown, activeMetrics.answered]);

  // Volume total somado das 6 especialidades para base do Donut
  const totalSpecialtiesVolume = useMemo(() => {
    const sum = specialtiesBreakdown.reduce((acc, curr) => acc + curr.resolvidas, 0);
    return Math.max(1, sum);
  }, [specialtiesBreakdown]);

  // Dados formatados para o Donut Chart Recharts
  const donutData = useMemo(() => {
    return specialtiesBreakdown.map((s) => ({
      name: s.nome,
      value: s.resolvidas > 0 ? s.resolvidas : 0,
      cor: s.cor,
      taxa: s.taxa
    }));
  }, [specialtiesBreakdown]);

  // Estatísticas detalhadas de subfocos para a aba Raio-X de Erros
  const hierarchyDetailedStats = useMemo(() => {
    interface SubfocoItem {
      id: string;
      specialty: string;
      tema: string;
      subfoco: string;
      total: number;
      correct: number;
      errors: number;
      accuracy: number;
      status: 'critico' | 'atencao' | 'dominado';
    }

    const items: SubfocoItem[] = [];

    if (dataScope === 'pessoal') {
      // 1. CÁLCULO 100% REAL BASEADO NA CONTA DO ALUNO (userAnswers)
      const subfocoMap: Record<
        string,
        {
          specialty: string;
          tema: string;
          subfoco: string;
          total: number;
          correct: number;
          errors: number;
        }
      > = {};

      Object.values(userAnswers).forEach((ans) => {
        let spec = ans.specialty;
        if (!spec) return;
        if (spec === 'Cirurgia') spec = 'Cirurgia Geral';
        if (spec === 'Ginecologia e Obstetrícia') spec = 'Ginecologia';

        // Filtro por grande área das 6 especialidades
        if (selectedAreaFilter !== 'Todas' && spec !== selectedAreaFilter) {
          return;
        }

        const tema = ans.tema || 'Geral';
        const subfoco = ans.subfoco || ans.foco || 'Conceitos Gerais';

        if (subfocoSearch.trim()) {
          const query = subfocoSearch.toLowerCase();
          const match =
            subfoco.toLowerCase().includes(query) ||
            tema.toLowerCase().includes(query) ||
            spec.toLowerCase().includes(query);
          if (!match) return;
        }

        const key = `${spec}:::${tema}:::${subfoco}`;
        if (!subfocoMap[key]) {
          subfocoMap[key] = {
            specialty: spec,
            tema,
            subfoco,
            total: 0,
            correct: 0,
            errors: 0
          };
        }

        subfocoMap[key].total++;
        if (ans.isCorrect) {
          subfocoMap[key].correct++;
        } else {
          subfocoMap[key].errors++;
        }
      });

      Object.entries(subfocoMap).forEach(([key, val]) => {
        const accuracy = val.total > 0 ? (val.correct / val.total) * 100 : 0;
        let status: 'critico' | 'atencao' | 'dominado' = 'dominado';
        if (accuracy < 60 && val.errors > 0) {
          status = 'critico';
        } else if (accuracy < 75) {
          status = 'atencao';
        }

        items.push({
          id: key,
          specialty: val.specialty,
          tema: val.tema,
          subfoco: val.subfoco,
          total: val.total,
          correct: val.correct,
          errors: val.errors,
          accuracy,
          status
        });
      });
    } else {
      // 2. MODO GLOBAL / DEMONSTRAÇÃO COMPARATIVA DA BASE
      clinicalHierarchy.forEach((h) => {
        let specName = h.especialidade;
        if (specName === 'Cirurgia') specName = 'Cirurgia Geral';

        if (selectedAreaFilter !== 'Todas' && specName !== selectedAreaFilter) {
          return;
        }

        h.temas.forEach((t) => {
          t.focos.forEach((f) => {
            f.subfocos.forEach((sf, sfIdx) => {
              if (subfocoSearch.trim()) {
                const query = subfocoSearch.toLowerCase();
                const match =
                  sf.toLowerCase().includes(query) ||
                  t.tema.toLowerCase().includes(query) ||
                  f.foco.toLowerCase().includes(query) ||
                  specName.toLowerCase().includes(query);
                if (!match) return;
              }

              const baseMultiplier = (specName.length + t.tema.length + sf.length + sfIdx * 7) % 19;
              const total = Math.max(8, Math.round(14 + baseMultiplier * 2.1));
              const accuracyRaw = 52 + ((baseMultiplier * 3.3) % 44);
              const accuracy = Math.min(96.5, Math.max(44.0, accuracyRaw));
              const correct = Math.round((total * accuracy) / 100);
              const errors = Math.max(0, total - correct);

              let status: 'critico' | 'atencao' | 'dominado' = 'dominado';
              if (accuracy < 60) status = 'critico';
              else if (accuracy < 75) status = 'atencao';

              items.push({
                id: `${specName}-${t.tema}-${sf}`,
                specialty: specName,
                tema: t.tema,
                subfoco: sf,
                total,
                correct,
                errors,
                accuracy,
                status
              });
            });
          });
        });
      });
    }

    // Filtro por status
    let filtered = items;
    if (selectedStatusFilter === 'criticos') {
      filtered = filtered.filter((i) => i.status === 'critico');
    } else if (selectedStatusFilter === 'atencao') {
      filtered = filtered.filter((i) => i.status === 'atencao');
    }

    // Ordenação dinâmica configurável
    filtered.sort((a, b) => {
      let valA = a.errors;
      let valB = b.errors;
      if (sortConfig.key === 'accuracy') {
        valA = a.accuracy;
        valB = b.accuracy;
      } else if (sortConfig.key === 'total') {
        valA = a.total;
        valB = b.total;
      }

      if (sortConfig.direction === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    return filtered;
  }, [userAnswers, dataScope, selectedAreaFilter, selectedStatusFilter, subfocoSearch, sortConfig]);

  // Contagem de subfocos críticos no período
  const criticalCount = useMemo(() => {
    return hierarchyDetailedStats.filter((s) => s.status === 'critico').length;
  }, [hierarchyDetailedStats]);

  // Resumo diagnóstico do Raio-X
  const diagnosticSummary = useMemo(() => {
    const totalErros = hierarchyDetailedStats.reduce((acc, curr) => acc + curr.errors, 0);
    const totalQuestoes = hierarchyDetailedStats.reduce((acc, curr) => acc + curr.total, 0);
    const totalAcertos = hierarchyDetailedStats.reduce((acc, curr) => acc + curr.correct, 0);
    const mediaAproveitamento = totalQuestoes > 0 ? (totalAcertos / totalQuestoes) * 100 : 0;

    return {
      totalErros,
      mediaAproveitamento
    };
  }, [hierarchyDetailedStats]);

  // Paginação dos subfocos
  const totalPages = Math.max(1, Math.ceil(hierarchyDetailedStats.length / itemsPerPage));
  const paginatedSubfocos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return hierarchyDetailedStats.slice(start, start + itemsPerPage);
  }, [hierarchyDetailedStats, currentPage, itemsPerPage]);

  // Alternador de ordenação de colunas da tabela
  const handleSort = (key: 'errors' | 'accuracy' | 'total') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Filtragem de instituições no drawer
  const filteredInstitutions = useMemo(() => {
    if (!instSearch.trim()) return mockInstitutionsList;
    return mockInstitutionsList.filter((inst) =>
      inst.toLowerCase().includes(instSearch.toLowerCase().trim())
    );
  }, [instSearch]);

  const toggleInstitution = (inst: string) => {
    const next = filters.institutions.includes(inst)
      ? filters.institutions.filter((item) => item !== inst)
      : [...filters.institutions, inst];
    onFilterChange({ ...filters, institutions: next });
  };



  return (
    <div className="space-y-6">
      {/* =========================================================================
          BARRA SUPERIOR: NAVEGAÇÃO DE ABAS + PERÍODO + FILTROS DE BANCAS
      ========================================================================== */}
      <div className="sticky top-[4.5rem] z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 py-3 bg-[var(--bg-page)]/95 dark:bg-[#09090b]/95 backdrop-blur-md border-b border-[var(--card-border)] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-colors">
        {/* Lado Esquerdo: Abas Principais Segmentadas */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-card)] p-1.5 rounded-xl border border-[var(--card-border)] w-fit">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? 'text-white shadow-lg'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
            }`}
            style={activeSubTab === 'overview' ? { backgroundColor: accentConfig.primaryHex } : undefined}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Visão Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('specialties')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'specialties'
                ? 'text-white shadow-lg'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
            }`}
            style={activeSubTab === 'specialties' ? { backgroundColor: accentConfig.primaryHex } : undefined}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Especialidades</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('weaknesses')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'weaknesses'
                ? 'text-white shadow-lg'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
            }`}
            style={activeSubTab === 'weaknesses' ? { backgroundColor: accentConfig.primaryHex } : undefined}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Raio-X de Erros</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeSubTab === 'weaknesses'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {criticalCount}
            </span>
          </button>
        </div>

        {/* Lado Direito: Período + Modalidade + Drawer de Bancas & Reset [Imagem 5] */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Período & Calendário */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--card-border)] text-slate-700 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-xs"
              title="Filtrar por data no calendário ou atalhos"
            >
              <span>{getPeriodDisplayLabel()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
            </button>

            {isCalendarOpen && (
              <div className="absolute left-0 sm:right-auto z-40 mt-1.5 w-76 bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--card-border)]">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-heading">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    Filtrar por Período
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Presets rápidos */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1.5">
                    Atalhos de Estudo
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { id: '7d', label: 'Últimos 7 dias' },
                      { id: '30d', label: 'Últimos 30 dias' },
                      { id: 'mes', label: 'Mês Atual' },
                      { id: '6m', label: 'Últimos 6 meses' },
                      { id: '2026.1', label: 'Semestre 2026.1' },
                      { id: '2026.2', label: 'Semestre 2026.2' },
                      { id: 'all', label: 'Todo o Histórico' }
                    ].map((preset) => {
                      const isSel = filters.period === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            onFilterChange({ ...filters, period: preset.id as PeriodFilter });
                            setIsCalendarOpen(false);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold'
                              : 'bg-slate-100 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Intervalo Personalizado no Calendário */}
                <div className="pt-2 border-t border-[var(--card-border)] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                    Intervalo no Calendário
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-0.5">De:</label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-0.5">Até:</label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!tempStartDate || !tempEndDate}
                    onClick={() => {
                      if (tempStartDate && tempEndDate) {
                        onFilterChange({
                          ...filters,
                          period: 'custom',
                          customStartDate: tempStartDate,
                          customEndDate: tempEndDate
                        });
                        setIsCalendarOpen(false);
                      }
                    }}
                    className="w-full py-1.5 text-xs font-bold text-center text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
                  >
                    Aplicar Intervalo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modalidade */}
          <select
            value={filters.modalidade}
            onChange={(e) => onFilterChange({ ...filters, modalidade: e.target.value as Modalidade })}
            aria-label="Modalidade de estudo"
            className="bg-[var(--bg-card)] border border-[var(--card-border)] text-xs font-medium rounded-xl px-3 py-1.5 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[var(--primary-color)] cursor-pointer"
          >
            <option value="Residência">Residência Médica</option>
            <option value="Revalida">Revalida</option>
            <option value="Graduação / Internato">Graduação</option>
          </select>

          {/* Dropdown / Drawer de Bancas & Instituições [Imagem 5] */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--card-border)] text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <Filter className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
              <span>
                {filters.institutions.length > 0
                  ? `${filters.institutions.length} Inst.`
                  : filters.banca !== 'Todas as Bancas'
                  ? filters.banca
                  : 'Todas'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 z-40 mt-1.5 w-72 bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Banca Examinadora
                  </label>
                  <select
                    value={filters.banca}
                    onChange={(e) => onFilterChange({ ...filters, banca: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-zinc-200 focus:outline-none"
                  >
                    {mockBancas.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      Instituições ({filters.institutions.length || 'Todas'})
                    </label>
                    {filters.institutions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onFilterChange({ ...filters, institutions: [] })}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={instSearch}
                    onChange={(e) => setInstSearch(e.target.value)}
                    placeholder="Buscar instituição..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 mb-1.5 focus:outline-none"
                  />
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {filteredInstitutions.slice(0, 30).map((inst) => {
                      const isChecked = filters.institutions.includes(inst);
                      return (
                        <label
                          key={inst}
                          onClick={() => toggleInstitution(inst)}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1A1A20] cursor-pointer text-xs text-slate-700 dark:text-zinc-300"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'text-white shadow-xs'
                                : 'border-slate-300 dark:border-zinc-600'
                            }`}
                            style={isChecked ? {
                              backgroundColor: accentConfig.primaryHex,
                              borderColor: accentConfig.primaryHex
                            } : undefined}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <span className="truncate">{inst}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterDropdownOpen(false)}
                  className="w-full py-1.5 text-xs font-bold text-center text-white rounded-xl cursor-pointer shadow-sm transition-opacity hover:opacity-95"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>

          {/* Botão Redefinir Filtros [Imagem 5] */}
          <button
            type="button"
            onClick={onResetFilters}
            title="Redefinir filtros"
            className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-[var(--bg-card)] border border-[var(--card-border)] hover:border-slate-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          ABA 1: VISÃO GERAL (4 KPIS + GRÁFICO DE LINHAS DIÁRIO + ÁREAS/TEMAS)
      ========================================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Grid de 4 KPIs Estratégicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Volume Resolvido */}
            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    Volume Resolvido
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    {activeMetrics.trendVolume}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1 font-sans tabular-nums">
                  <AnimatedCounter value={activeMetrics.answered} />
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  <AnimatedCounter value={activeMetrics.unique} /> únicas e{' '}
                  <span className="text-slate-800 dark:text-zinc-200 font-medium"><AnimatedCounter value={activeMetrics.ineditas} /> inéditas</span>
                </p>
              </div>
              <div className="mt-5 w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out bg-slate-400 dark:bg-zinc-500"
                  style={{
                    width: `${Math.min(100, Math.round((activeMetrics.answered / 500) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Card 2: Acertos Líquidos */}
            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    Acertos Líquidos
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CircleCheck className="w-3 h-3 text-emerald-500" />
                    Consistente
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mb-1 font-sans tabular-nums">
                  <AnimatedCounter value={activeMetrics.correct} />
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  <span className="text-rose-600 dark:text-rose-400 font-medium"><AnimatedCounter value={activeMetrics.incorrect} /> erros</span> mapeados no período
                </p>
              </div>
              <div className="mt-5 w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, activeMetrics.accuracy)}%` }}
                />
              </div>
            </div>

            {/* Card 3: Aproveitamento (com marcador de meta em 80%) */}
            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    Aproveitamento
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      activeMetrics.trendAproveitamento.startsWith('+')
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    }`}
                  >
                    {activeMetrics.trendAproveitamento.startsWith('+') ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {activeMetrics.trendAproveitamento}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1 font-sans tabular-nums">
                  <AnimatedCounter value={activeMetrics.accuracy} decimals={1} suffix="%" />
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Taxa bruta (meta:{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">≥ 80% ideal</span>)
                </p>
              </div>
              <div className="mt-5 w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full relative">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, activeMetrics.accuracy)}%` }}
                />
                <div
                  title="Meta de 80%"
                  className="w-0.5 h-3 bg-slate-900 dark:bg-white absolute -top-0.5 rounded shadow-xs"
                  style={{ left: '80%' }}
                />
              </div>
            </div>

            {/* Card 4: Ritmo Médio */}
            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    Ritmo Médio
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: accentConfig.timeAccent.hex, backgroundColor: accentConfig.timeAccent.bgRgba }}
                  >
                    <Clock className="w-3 h-3" />
                    Ideal &lt; 2m 30s
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1 font-sans tabular-nums">
                  <AnimatedCounter value={108} formatAsTime />
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400">Tempo médio / questão</p>
              </div>
              <div className="mt-5 w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out w-[65%]"
                  style={{ backgroundColor: accentConfig.timeAccent.hex }}
                />
              </div>
            </div>
          </div>

          {/* Gráfico de Evolução Diária (Linhas: Feitas vs Acertos) */}
          <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    {filters.period === '6m' || filters.period === '2026.1' || filters.period === '2026.2' || filters.period === 'all'
                      ? 'Evolução Mensal de Resoluções'
                      : filters.period === '30d'
                      ? 'Evolução nos Últimos 30 Dias'
                      : filters.period === 'mes'
                      ? 'Evolução no Mês Atual'
                      : filters.period === 'custom'
                      ? 'Evolução no Período Selecionado'
                      : 'Evolução Diária de Resoluções'}
                  </h2>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {activeMetrics.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  {filters.period === '6m' || filters.period === '2026.1' || filters.period === '2026.2' || filters.period === 'all'
                    ? 'Acompanhamento mensal contínuo de questões resolvidas e acertos obtidos'
                    : filters.period === '30d'
                    ? 'Acompanhamento de questões resolvidas e acertos ao longo dos últimos 30 dias'
                    : filters.period === 'mes'
                    ? 'Acompanhamento contínuo de questões resolvidas e acertos no mês corrente'
                    : filters.period === 'custom'
                    ? 'Acompanhamento de questões resolvidas e acertos no período customizado'
                    : 'Acompanhamento diário contínuo de questões resolvidas e acertos obtidos'}
                </p>
              </div>

              {/* Legenda Soft */}
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-zinc-500" />
                  Feitas (Total)
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Acertos
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Erros
                </span>
              </div>
            </div>

            <div className="h-56 sm:h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeMetrics.chartData} margin={{ top: 8, right: 12, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="softGreenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.20} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="softNeutralGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={mode === 'dark' ? '#71717A' : '#94A3B8'} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={mode === 'dark' ? '#71717A' : '#94A3B8'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={mode === 'dark' ? '#27272A' : '#E2E8F0'} strokeOpacity={0.6} />
                  <XAxis
                    dataKey="label"
                    axisLine={{ stroke: mode === 'dark' ? '#27272A' : '#CBD5E1' }}
                    tickLine={false}
                    tick={{ fill: mode === 'dark' ? '#71717A' : '#64748B', fontSize: 11, fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: mode === 'dark' ? '#71717A' : '#64748B', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="resolvidas"
                    name="Total Feitas"
                    stroke={mode === 'dark' ? '#71717A' : '#94A3B8'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#softNeutralGrad)"
                    activeDot={{ r: 4, stroke: mode === 'dark' ? '#71717A' : '#94A3B8', strokeWidth: 2, fill: mode === 'dark' ? '#121215' : '#ffffff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="acertos"
                    name="Acertos"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#softGreenGrad)"
                    activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: mode === 'dark' ? '#121215' : '#ffffff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Análise de Hábitos Diários, Cronobiologia e Gráfico de Horas */}
          <DailyHabitsAndHourlyExplorer
            userAnswers={userAnswers}
            period={filters.period}
            dailyGoal={stats.dailyGoal || 30}
            totalAnsweredInPeriod={activeMetrics.answered}
          />
        </div>
      )}

      {/* =========================================================================
          ABA 2: ESPECIALIDADES & TEMAS (DONUT 6 ÁREAS + TABELA SANFONA) [Imagens 1 e 2]
      ========================================================================== */}
      {activeSubTab === 'specialties' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Coluna Esquerda: Gráfico Donut de 6 Fatias [Imagem 1] */}
          <div className="lg:col-span-4 bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribuição por Grande Área</h2>
            </div>

            <div className="h-64 w-full relative my-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={95}
                    paddingAngle={3}
                    onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                    onMouseLeave={() => setHoveredPieIndex(null)}
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.cor}
                        opacity={hoveredPieIndex === null || hoveredPieIndex === index ? 1 : 0.35}
                        className="transition-opacity duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centro Reativo com Estatísticas */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
                {hoveredPieIndex !== null && donutData[hoveredPieIndex] ? (
                  <>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 line-clamp-1 max-w-[130px]">
                      {donutData[hoveredPieIndex].name}
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-sans tabular-nums">
                      {donutData[hoveredPieIndex].value}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {((donutData[hoveredPieIndex].value / totalSpecialtiesVolume) * 100).toFixed(1)}% do total
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-500">
                      Volume Total
                    </span>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-sans tabular-nums">
                      {totalSpecialtiesVolume === 1 && activeMetrics.answered === 0 ? 0 : totalSpecialtiesVolume}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400">6 Especialidades</span>
                  </>
                )}
              </div>
            </div>

            {/* Legenda Vertical com as 6 Áreas (Opção de Expandir/Recolher com Seta - Imagem 3) */}
            <div className="pt-3 border-t border-[var(--card-border)]">
              <div 
                onClick={() => setIsLegendExpanded(!isLegendExpanded)}
                className="flex items-center justify-between text-xs py-1 px-1 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Detalhamento por Área
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 font-sans tabular-nums font-semibold">
                    6
                  </span>
                </div>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title={isLegendExpanded ? 'Recolher áreas' : 'Expandir áreas'}
                >
                  {isLegendExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {isLegendExpanded && (
                <div className="space-y-1 pt-2 animate-in fade-in duration-200">
                  {specialtiesBreakdown.map((item, idx) => {
                    const pct = ((item.resolvidas / totalSpecialtiesVolume) * 100).toFixed(1);
                    const isItemExpanded = expandedAreas.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className="rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/30"
                      >
                        <div
                          onMouseEnter={() => setHoveredPieIndex(idx)}
                          onMouseLeave={() => setHoveredPieIndex(null)}
                          onClick={() => toggleAreaExpansion(item.id)}
                          className="flex items-center justify-between text-xs py-1.5 px-2 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.cor }} />
                            <span className="text-slate-800 dark:text-zinc-200 font-medium truncate">{item.nome}</span>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-slate-500 dark:text-zinc-400 font-sans tabular-nums">{item.resolvidas} q.</span>
                            <span className="font-bold text-slate-900 dark:text-white w-12 text-right font-sans tabular-nums">
                              {item.resolvidas > 0 ? pct : '0.0'}%
                            </span>
                            <div className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
                              {isItemExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Detalhamento inline ao expandir a especialidade individual */}
                        {isItemExpanded && (
                          <div className="pl-5 pr-2 pb-2 pt-1 space-y-1.5 border-l-2 ml-3 my-1" style={{ borderColor: item.cor }}>
                            <div className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                              <span>{item.acertos} acertos · {item.erros} erros</span>
                              <span
                                className="font-bold"
                                style={{
                                  color: item.taxa >= 70 ? '#10B981' : item.taxa >= 60 ? '#F59E0B' : '#EF4444'
                                }}
                              >
                                {item.taxa.toFixed(1)}% acerto
                              </span>
                            </div>
                            {item.temas.slice(0, 3).map((t, tIdx) => (
                              <div key={tIdx} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
                                <span className="truncate pr-2">{t.nome}</span>
                                <span className="tabular-nums font-semibold shrink-0">{t.resolvidas} q. ({t.taxa.toFixed(0)}%)</span>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSpecialtyForDrawer(item);
                                setDrawerTemaFilter('all');
                                setDrawerTemaSearch('');
                                setIsSpecialtyDrawerOpen(true);
                              }}
                              className="text-[11px] font-bold flex items-center gap-1 hover:underline pt-0.5 cursor-pointer"
                              style={{ color: accentConfig.primaryHex }}
                            >
                              Ver todos os temas no Raio-X <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: 6 Cards de Especialidades ➔ Drawer com Temas */}
          <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Quadro Geral & Aproveitamento por Especialidade</h2>
              </div>

              {/* Grid com os 6 Cards em 2 Colunas e 3 Linhas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specialtiesBreakdown.map((area) => {
                  const cfg = SPECIALTY_CARD_CONFIG[area.id] || {
                    icon: Stethoscope,
                    bgLight: 'bg-slate-500/10',
                    bgDark: 'dark:bg-zinc-800',
                    textColor: 'text-slate-700 dark:text-zinc-300',
                    borderLight: 'border-slate-300',
                    borderDark: 'dark:border-zinc-700'
                  };
                  const IconComp = cfg.icon;
                  const hasQuestions = area.resolvidas > 0;
                  const isGood = area.taxa >= 70;
                  const isMedium = area.taxa >= 60 && area.taxa < 70;

                  return (
                    <div
                      key={area.id}
                      onClick={() => {
                        setSelectedSpecialtyForDrawer(area);
                        setDrawerTemaFilter('all');
                        setDrawerTemaSearch('');
                        setIsSpecialtyDrawerOpen(true);
                      }}
                      className="group p-4 sm:p-4.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/90 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 shadow-2xs hover:shadow-xs"
                    >
                      {/* Topo do Card: Ícone com contraste UX + Título da Especialidade + Total Feitas à Direita (Estilo Imagem 2) */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs transition-transform group-hover:scale-105"
                            style={{
                              backgroundColor: accentConfig.bgRgba,
                              borderColor: accentConfig.borderRgba,
                              color: accentConfig.primaryHex
                            }}
                          >
                            <IconComp className="w-5 h-5" strokeWidth={2.2} />
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                            {area.nome}
                          </h3>
                        </div>

                        {/* Total feitas alinhado à direita (Estilo Imagem 2) */}
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-sans tabular-nums shrink-0 font-medium">
                          {area.resolvidas} {area.resolvidas === 1 ? 'feita' : 'feitas'}
                        </span>
                      </div>

                      {/* Barra de Progresso Dual (Estilo Imagem 2) */}
                      <div className="space-y-2">
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                          {hasQuestions ? (
                            <>
                              <div
                                className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
                                style={{ width: `${Math.min(100, area.taxa)}%` }}
                                title={`Acertos: ${area.acertos}`}
                              />
                              {area.erros > 0 && (
                                <div
                                  className="h-full bg-rose-500/40 dark:bg-rose-500/35 rounded-r-full transition-all duration-300"
                                  style={{ width: `${Math.max(0, 100 - area.taxa)}%` }}
                                  title={`Erros: ${area.erros}`}
                                />
                              )}
                            </>
                          ) : (
                            <div className="h-full w-full bg-transparent" />
                          )}
                        </div>

                        {/* Linha de Contagem e Aproveitamento (Estilo Exato da Imagem 2) */}
                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium font-sans tabular-nums">
                              {area.acertos} {area.acertos === 1 ? 'acerto' : 'acertos'}
                            </span>
                            <span className="text-slate-300 dark:text-zinc-600 font-bold">·</span>
                            <span className="text-rose-600 dark:text-rose-400 font-medium font-sans tabular-nums">
                              {area.erros} {area.erros === 1 ? 'erro' : 'erros'}
                            </span>
                          </div>

                          {/* Badge de Porcentagem à direita (Estilo Imagem 2) */}
                          <span
                            className={`font-bold font-sans tabular-nums px-2.5 py-0.5 rounded-full border text-xs shrink-0 ${
                              !hasQuestions
                                ? 'text-slate-400 dark:text-zinc-500 border-slate-200/80 dark:border-zinc-800 bg-slate-100/60 dark:bg-zinc-900/60'
                                : isGood
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                                : isMedium
                                ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
                                : 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/25'
                            }`}
                          >
                            {area.taxa.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Rodapé do Card */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                          {area.temas.length} {area.temas.length === 1 ? 'tema estudado' : 'temas estudados'}
                        </span>

                        <span
                          className="text-xs font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                          style={{ color: accentConfig.primaryHex }}
                        >
                          Ver Temas <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1F1F25] flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-zinc-500 gap-2">
              <span>Taxonomia oficial integrada aos filtros do Banco Residência (6 Especialidades).</span>
              <div className="flex items-center gap-3 font-medium">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ≥ 75% Seguro
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  65-74% Atenção
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  &lt; 65% Crítico
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 3: RAIO-X DE ERROS & SUBFOCOS CRÍTICOS
      ========================================================================== */}
      {activeSubTab === 'weaknesses' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Componente Mentor Clínico IA & Auditoria Psicométrica */}
          <AIPerformanceMentorCard
            stats={stats}
            userAnswers={userAnswers || {}}
            criticalSubfocos={hierarchyDetailedStats}
            targetExam={filters.banca && filters.banca !== 'Todas' ? filters.banca : 'ENARE 2026'}
            onStartRecoverySession={onNavigateToBancoWithSubfoco}
          />

          {/* Topo com 3 Mini-KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className={`text-3xl font-extrabold text-rose-500 font-sans tabular-nums flex items-center gap-2 transition-all duration-200 ${
                    isRaioXTransitioning ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
                  }`}>
                    <AnimatedCounter value={dataScope === 'pessoal' ? criticalCount : 3140} />
                    {isRaioXTransitioning && (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDataScope(dataScope === 'pessoal' ? 'global' : 'pessoal')}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-[var(--card-border)] cursor-pointer"
                  >
                    {dataScope === 'pessoal' ? 'Meus Dados' : 'Base Global'}
                  </button>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mt-0.5">
                  Subfocos Críticos (&lt; 60%)
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  color: accentConfig.energyAccent.hex,
                  backgroundColor: accentConfig.energyAccent.bgRgba,
                  border: `1px solid ${accentConfig.energyAccent.borderRgba}`
                }}
              >
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div
                  className={`text-3xl font-extrabold font-sans tabular-nums flex items-center gap-2 transition-all duration-200 ${
                    isRaioXTransitioning ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
                  }`}
                  style={{ color: accentConfig.energyAccent.hex }}
                >
                  <AnimatedCounter value={dataScope === 'pessoal' ? diagnosticSummary.totalErros : 28993} />
                  {isRaioXTransitioning && (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                  )}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mt-0.5">
                  Total de Erros Mapeados ({activeMetrics.label})
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-5 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  color: accentConfig.primaryHex,
                  backgroundColor: accentConfig.bgRgba,
                  border: `1px solid ${accentConfig.borderRgba}`
                }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div
                  className={`text-3xl font-extrabold font-sans tabular-nums flex items-center gap-2 transition-all duration-200 ${
                    isRaioXTransitioning ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'
                  }`}
                  style={{ color: accentConfig.primaryHex }}
                >
                  <AnimatedCounter value={diagnosticSummary.mediaAproveitamento} decimals={1} suffix="%" />
                  {isRaioXTransitioning && (
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentConfig.primaryHex }} />
                  )}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mt-0.5">
                  Rendimento Médio no Filtro
                </p>
              </div>
            </div>
          </div>

          {/* Card Destaque: Ponto Mais Crítico Detectado com Efeito Pulsante */}
          {hierarchyDetailedStats.length > 0 && (
            <div className="bg-gradient-to-r from-rose-500/10 via-[var(--bg-card)] to-[var(--bg-card)] border border-rose-500/30 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">Ponto mais crítico detectado:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{hierarchyDetailedStats[0].subfoco}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 pl-4">
                  {hierarchyDetailedStats[0].errors} erros acumulados ({hierarchyDetailedStats[0].accuracy.toFixed(1)}% acerto) em {hierarchyDetailedStats[0].specialty} • {hierarchyDetailedStats[0].tema}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {onNavigateToCadernoErros && (
                  <button
                    type="button"
                    onClick={() => onNavigateToCadernoErros(hierarchyDetailedStats[0].specialty, hierarchyDetailedStats[0].tema)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                    <span>Ver no Caderno</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setTrainingModal({
                      titulo: hierarchyDetailedStats[0].subfoco,
                      subtitulo: `${hierarchyDetailedStats[0].specialty} • ${hierarchyDetailedStats[0].tema}`,
                      erros: hierarchyDetailedStats[0].errors,
                      rendimento: hierarchyDetailedStats[0].accuracy,
                      specialty: hierarchyDetailedStats[0].specialty,
                      tema: hierarchyDetailedStats[0].tema,
                      subfoco: hierarchyDetailedStats[0].subfoco
                    })
                  }
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/25 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <span>Treinar Esse Subfoco</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Barra de Filtros: 6 Especialidades + Status + Busca Textual */}
          <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Pílulas das 6 Especialidades */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {['Todas', ...SIX_FILTER_SPECIALTIES.map((s) => s.nome)].map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      setSelectedAreaFilter(spec);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedAreaFilter === spec
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-[#18181C] text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-[#242429]'
                    }`}
                  >
                    {spec === 'Medicina Preventiva e Social' ? 'Preventiva' : spec}
                  </button>
                ))}
              </div>

              {/* Status e Busca */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center bg-slate-100 dark:bg-[#0C0C0E] p-1 rounded-xl border border-slate-200 dark:border-[#222227] text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter('todos')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      selectedStatusFilter === 'todos' ? 'bg-white dark:bg-[#222228] text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter('criticos')}
                    className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedStatusFilter === 'criticos'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Críticos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter('atencao')}
                    className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedStatusFilter === 'atencao'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Atenção
                  </button>
                </div>

                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subfocoSearch}
                    onChange={(e) => {
                      setSubfocoSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Buscar subfoco ou tema..."
                    className="w-full bg-slate-50 dark:bg-[#0C0C0E] border border-slate-200 dark:border-[#222227] focus:border-rose-500/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Subfocos ou Empty State */}
          {paginatedSubfocos.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {dataScope === 'pessoal'
                  ? 'Nenhum subfoco com erros registrado nesta conta ainda'
                  : 'Nenhum subfoco encontrado com os filtros atuais'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                {dataScope === 'pessoal'
                  ? 'Conforme você resolver questões no Banco de Questões, este Raio-X mapeará os seus pontos fracos automaticamente em tempo real.'
                  : 'Tente alterar os filtros de especialidade ou busca textual.'}
              </p>
              {dataScope === 'pessoal' && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDataScope('global')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    Ver Base Global de Demonstração
                  </button>
                  {onNavigateToCadernoErros && (
                    <button
                      type="button"
                      onClick={() => onNavigateToCadernoErros()}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-xs"
                    >
                      Abrir Caderno de Erros
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--card-border)] bg-slate-100/70 dark:bg-zinc-900/40 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      <th className="py-3.5 pl-5 w-28">Status</th>
                      <th className="py-3.5">Subfoco Clínico & Tema</th>
                      <th className="py-3.5">Grande Área</th>
                      <th
                        onClick={() => handleSort('errors')}
                        className="py-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none"
                      >
                        <div className="inline-flex items-center gap-1">
                          <span>Erros</span>
                          <ArrowUpDown className="w-3 h-3 text-rose-500" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('accuracy')}
                        className="py-3.5 w-44 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors select-none"
                      >
                        <div className="inline-flex items-center gap-1">
                          <span>Rendimento</span>
                          <ArrowUpDown className="w-3 h-3 text-rose-500" />
                        </div>
                      </th>
                      <th className="py-3.5 pr-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-200 dark:divide-[#1A1A20] text-xs transition-opacity duration-200 ${
                    isRaioXTransitioning ? 'opacity-40' : 'opacity-100'
                  }`}>
                    {paginatedSubfocos.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#17171C] transition-colors group">
                        <td className="py-4 pl-5">
                          {item.status === 'critico' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              Crítico
                            </span>
                          )}
                          {item.status === 'atencao' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Atenção
                            </span>
                          )}
                          {item.status === 'dominado' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              Seguro
                            </span>
                          )}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                            {item.subfoco}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">{item.tema}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-semibold text-slate-800 dark:text-zinc-200">{item.specialty}</div>
                        </td>
                        <td className="py-4 font-sans tabular-nums">
                          <div className="font-bold text-rose-600 dark:text-rose-400">
                            <AnimatedCounter value={item.errors} /> {item.errors === 1 ? 'erro' : 'erros'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-500">
                            <AnimatedCounter value={item.correct} />/<AnimatedCounter value={item.total} /> q.
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white font-sans tabular-nums">
                              <AnimatedCounter value={item.accuracy} decimals={1} suffix="%" />
                            </span>
                            <div className="w-32 bg-slate-200 dark:bg-[#1F1F26] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                  item.accuracy < 60 ? 'bg-rose-500' : item.accuracy < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${item.accuracy}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {onNavigateToCadernoErros && item.errors > 0 && (
                              <button
                                type="button"
                                onClick={() => onNavigateToCadernoErros(item.specialty, item.tema)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                title="Ver no Caderno de Erros"
                              >
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setTrainingModal({
                                  titulo: item.subfoco,
                                  subtitulo: `${item.specialty} • ${item.tema}`,
                                  erros: item.errors,
                                  rendimento: item.accuracy,
                                  specialty: item.specialty,
                                  tema: item.tema,
                                  subfoco: item.subfoco
                                })
                              }
                              className="text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 font-bold inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 transition-all cursor-pointer"
                            >
                              <span>Treinar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação e Contador */}
              <div className="px-5 py-3.5 border-t border-slate-200 dark:border-[#1F1F25] bg-slate-50 dark:bg-[#101013] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-500">
                <span>
                  Mostrando <strong className="text-slate-800 dark:text-zinc-300">{paginatedSubfocos.length}</strong> de{' '}
                  <strong className="text-slate-800 dark:text-zinc-300">{hierarchyDetailedStats.length}</strong> subfocos mapeados
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded-lg border border-slate-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-sans tabular-nums text-slate-600 dark:text-zinc-400 font-semibold">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded-lg border border-slate-200 dark:border-zinc-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}


      {/* =========================================================================
          MODAL DE RECUPERAÇÃO ATIVA (DISPARADO POR "TREINAR" OU "FOCAR")
      ========================================================================== */}
      {trainingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] border border-[var(--card-border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                  <Play className="w-4 h-4 fill-rose-500" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Sessão de Recuperação Ativa
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{trainingModal.titulo}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrainingModal(null)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-[#18181D] border border-slate-200 dark:border-[#24242C] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Área / Especialidade:</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{trainingModal.subtitulo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Erros registrados:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-sans tabular-nums">{trainingModal.erros} questões</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Aproveitamento atual:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans tabular-nums">
                  {trainingModal.rendimento.toFixed(1)}% (Meta: 80%)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                Modo do Caderno Gerado:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  onClick={() => setTrainingMode('erradas')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    trainingMode === 'erradas'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-[#18181C] border-slate-200 dark:border-[#25252C] text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Refazer Erradas + Similares (15 q.)
                </div>
                <div
                  onClick={() => setTrainingMode('ineditas')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    trainingMode === 'ineditas'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-[#18181C] border-slate-200 dark:border-[#25252C] text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Somente Inéditas do Foco (20 q.)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTrainingModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isStartingTraining}
                onClick={async () => {
                  try {
                    setIsStartingTraining(true);
                    if (onNavigateToBancoWithSubfoco) {
                      await onNavigateToBancoWithSubfoco(
                        trainingModal.specialty || '',
                        trainingModal.tema || '',
                        trainingModal.subfoco || ''
                      );
                    }
                  } finally {
                    setTimeout(() => {
                      setIsStartingTraining(false);
                      setTrainingModal(null);
                    }, 400);
                  }
                }}
                className={`bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all ${
                  isStartingTraining ? 'opacity-80 cursor-wait' : ''
                }`}
              >
                {isStartingTraining ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Iniciando Bateria...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Iniciar Bateria Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* DRAWER CENTRAL: TEMAS DA ESPECIALIDADE SELECIONADA */}
      {isSpecialtyDrawerOpen && selectedSpecialtyForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setIsSpecialtyDrawerOpen(false)}
          />

          {/* Painel Central do Drawer com Bordas do Restante da Plataforma */}
          <div className="relative w-full max-w-2xl lg:max-w-3xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-10 max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header do Drawer */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-3 min-w-0">
                {(() => {
                  const cfg = SPECIALTY_CARD_CONFIG[selectedSpecialtyForDrawer.id] || {
                    icon: Stethoscope
                  };
                  const IconComp = cfg.icon;
                  return (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs"
                      style={{
                        backgroundColor: accentConfig.bgRgba,
                        borderColor: accentConfig.borderRgba,
                        color: accentConfig.primaryHex
                      }}
                    >
                      <IconComp className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">
                    {selectedSpecialtyForDrawer.nome}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {selectedSpecialtyForDrawer.temas.length} {selectedSpecialtyForDrawer.temas.length === 1 ? 'tema avaliado' : 'temas avaliados'} • {selectedSpecialtyForDrawer.resolvidas} questões
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black font-sans tabular-nums ${
                    selectedSpecialtyForDrawer.taxa >= 75
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : selectedSpecialtyForDrawer.taxa >= 65
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {selectedSpecialtyForDrawer.taxa.toFixed(1)}%
                </span>
                <button
                  type="button"
                  onClick={() => setIsSpecialtyDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Fechar painel (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Barra de Busca & Filtros Rápidos */}
            <div className="p-3 border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/30 dark:bg-zinc-900/20 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={drawerTemaSearch}
                  onChange={(e) => setDrawerTemaSearch(e.target.value)}
                  placeholder="Buscar tema clínico..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                  Filtro:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDrawerTemaFilter('all')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      drawerTemaFilter === 'all'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Todos ({selectedSpecialtyForDrawer.temas.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTemaFilter('errors')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      drawerTemaFilter === 'errors'
                        ? 'bg-rose-600 text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Com Erros ({selectedSpecialtyForDrawer.temas.filter((t) => t.erros > 0).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTemaFilter('good')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      drawerTemaFilter === 'good'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                    }`}
                  >
                    ≥ 75% ({selectedSpecialtyForDrawer.temas.filter((t) => t.taxa >= 75).length})
                  </button>
                </div>
              </div>
            </div>

            {/* Lista dos Temas com Rolagem */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {(() => {
                const q = drawerTemaSearch.trim().toLowerCase();
                const filtered = selectedSpecialtyForDrawer.temas.filter((t) => {
                  if (q && !t.nome.toLowerCase().includes(q)) return false;
                  if (drawerTemaFilter === 'errors') return t.erros > 0;
                  if (drawerTemaFilter === 'good') return t.taxa >= 75;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                      <Target className="w-7 h-7 text-slate-400 mx-auto mb-1 opacity-70" />
                      <p className="font-bold text-slate-700 dark:text-zinc-300">
                        Nenhum tema encontrado com este filtro
                      </p>
                      <p className="text-slate-500 dark:text-zinc-500">
                        {drawerTemaSearch ? 'Tente outro termo na busca.' : 'Ajuste o filtro acima para ver outros tópicos.'}
                      </p>
                    </div>
                  );
                }

                return filtered.map((tema, idx) => {
                  const isHigh = tema.taxa >= 75;
                  const isMedium = tema.taxa >= 65 && tema.taxa < 75;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2.5 transition-colors hover:border-slate-300 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {tema.nome}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-sans tabular-nums block">
                            {tema.resolvidas} {tema.resolvidas === 1 ? 'questão' : 'questões'} • {tema.acertos} acertos / {tema.erros} erros
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-sans tabular-nums shrink-0 ${
                            isHigh
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : isMedium
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tema.taxa.toFixed(1)}%
                        </span>
                      </div>

                      {/* Barra de Aproveitamento do Tema */}
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${tema.taxa}%` }}
                        />
                      </div>

                      {/* Ação de Treino para o Tema */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                          {tema.erros > 0 ? `${tema.erros} questões para revisar` : '100% de precisão'}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setTrainingModal({
                              titulo: tema.nome,
                              subtitulo: selectedSpecialtyForDrawer.nome,
                              erros: tema.erros,
                              rendimento: tema.taxa,
                              specialty: selectedSpecialtyForDrawer.nome,
                              tema: tema.nome
                            });
                          }}
                          className="text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800"
                          style={{ color: selectedSpecialtyForDrawer.cor }}
                        >
                          <span>Treinar Tema</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer do Drawer */}
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setTrainingModal({
                    titulo: selectedSpecialtyForDrawer.nome,
                    subtitulo: 'Caderno Inteligente da Especialidade',
                    erros: selectedSpecialtyForDrawer.erros,
                    rendimento: selectedSpecialtyForDrawer.taxa,
                    specialty: selectedSpecialtyForDrawer.nome
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:opacity-90"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Treinar Especialidade Completa</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSpecialtyDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
