'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Building2,
  Filter,
  RotateCcw,
  Search,
  X
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { getLandingHighlightTextStyle } from './landingThemeHelpers';
import canonicalBrazilStatesSvgData from '@/data/canonicalBrazilStatesSvgData.json';
import {
  STATE_INSTITUTIONS,
  NACIONAL_INSTITUTIONS,
  UF_FULL_NAMES,
  InstitutionInfo
} from '@/data/institutionsByUf';
import type { CanonicalBancaItem } from '@/data/canonicalBancasDirectory';
import { useScrollReveal, useAnimatedCounter } from './useScrollReveal';

// Coordenadas projetadas precisas (em espaço 450x460) das 31 cidades com instituições cadastradas
const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
  Aracaju: { x: 412.8, y: 184.5 },
  'Belo Horizonte': { x: 338.3, y: 283.1 },
  Belém: { x: 288.7, y: 83.3 },
  'Boa Vista': { x: 156.6, y: 38.0 },
  Brasília: { x: 295.5, y: 237.3 },
  Campinas: { x: 304.4, y: 317.2 },
  'Campo Grande': { x: 222.3, y: 289.3 },
  Cuiabá: { x: 206.3, y: 235.2 },
  Curitiba: { x: 280.4, y: 346.4 },
  Florianópolis: { x: 288.3, y: 372.1 },
  Fortaleza: { x: 397.1, y: 107.4 },
  Goiânia: { x: 280.5, y: 247.1 },
  Gurupi: { x: 282.7, y: 192.9 },
  'João Pessoa': { x: 436.8, y: 143.4 },
  Londrina: { x: 259.9, y: 321.8 },
  Macapá: { x: 260.9, y: 67.6 },
  Maceió: { x: 427.4, y: 170.7 },
  Manaus: { x: 163.7, y: 100.9 },
  Natal: { x: 433.1, y: 129.3 },
  'Porto Alegre': { x: 259.1, y: 401.6 },
  'Porto Velho': { x: 121.5, y: 161.0 },
  Recife: { x: 436.6, y: 153.4 },
  'Rio Branco': { x: 79.1, y: 174.0 },
  'Rio de Janeiro': { x: 346.6, y: 317.2 },
  Salvador: { x: 397.3, y: 206.4 },
  'Santo André': { x: 310.1, y: 325.9 },
  'São Luís': { x: 334.3, y: 94.7 },
  'São Paulo': { x: 309.0, y: 324.6 },
  Teresina: { x: 350.6, y: 121.9 },
  Vitória: { x: 377.4, y: 287.6 }
};

// Coordenadas geográficas calibradas para garantir que 100% dos pins fiquem estritamente DENTRO do território do estado,
// com espaçamento mínimo garantido de >= 40px (ZERO sobreposição) e sem invasão de oceano em cidades litorâneas.
const STATE_ANCHOR_COORDINATES: Record<string, { x: number; y: number; stemHeight?: number }> = {
  // São Paulo (SP) - 8 instituições perfeitamente espaçadas por todo o território paulista (minD >= 46px)
  'sus-sp': { x: 275.0, y: 296.0 },        // Ribeirão Preto / Franca (Norte SP)
  'unicamp': { x: 292.0, y: 308.0 },       // Campinas
  'santa-casa-sp': { x: 314.0, y: 312.0 }, // Vale do Paraíba / São José dos Campos
  'einstein': { x: 258.0, y: 316.0 },      // Sorocaba / Bauru (Oeste)
  'usp-sp': { x: 285.0, y: 324.0 },        // Capital Centro-Oeste / Pinheiros
  'unifesp': { x: 302.0, y: 322.0 },       // Capital Centro-Sul
  'iamspe': { x: 268.0, y: 330.0 },        // Sudoeste / Itapeva
  'fmabc': { x: 312.0, y: 328.0 },         // Santo André / Grande ABC

  // Pernambuco (PE) - 2 instituições no interior (zero mar)
  'ses-pe': { x: 426.0, y: 151.0 },        // Recife / Litoral (dentro do território)
  'ufpe': { x: 398.0, y: 148.0 },          // Agreste / Interior PE

  // Bahia (BA) - 2 instituições
  'sus-ba': { x: 390.0, y: 206.0 },        // Salvador / Recôncavo
  'ufba': { x: 356.0, y: 204.0 },          // Chapada Diamantina / Centro BA

  // Minas Gerais (MG) - 3 instituições
  'psu-mg': { x: 298.0, y: 275.0 },        // Triângulo Mineiro / Oeste MG
  'santa-casa-bh': { x: 338.3, y: 283.1 }, // Belo Horizonte / Centro
  'ipsemg': { x: 332.0, y: 305.0 },        // Sul de Minas / Zona da Mata

  // Rio de Janeiro (RJ) - 4 instituições
  'ufrj': { x: 341.0, y: 311.0 },          // Capital Norte
  'uerj': { x: 347.0, y: 316.0 },          // Capital Centro
  'ses-rj': { x: 358.0, y: 305.0 },        // Norte Fluminense / Serrana
  'unimed-rio': { x: 333.0, y: 318.0 },    // Costa Verde / Sul Fluminense

  // Ceará (CE) - 3 instituições
  'surce': { x: 392.0, y: 108.0 },         // Fortaleza / Litoral Norte
  'ufc': { x: 380.0, y: 122.0 },           // Sertão Central / Sobral
  'ijf': { x: 388.0, y: 138.0 },           // Sul / Cariri

  // Rio Grande do Sul (RS) - 3 instituições
  'amrigs': { x: 260.0, y: 400.0 },        // Porto Alegre / Metropolitana
  'hcpa': { x: 248.0, y: 385.0 },          // Serra Gaúcha / Passo Fundo
  'ufcspa': { x: 242.0, y: 416.0 },        // Sul / Pelotas

  // Paraná (PR) - 3 instituições
  'uel': { x: 259.9, y: 321.8 },           // Londrina / Norte
  'amp': { x: 278.0, y: 344.0 },           // Curitiba Centro
  'puc-pr': { x: 286.0, y: 350.0 },        // Metropolitana / Litoral

  // Santa Catarina (SC) - 2 instituições
  'acm': { x: 282.0, y: 372.0 },           // Florianópolis / Continental
  'ufsc': { x: 262.0, y: 368.0 },          // Vale do Itajaí / Oeste

  // Pará (PA) - 2 instituições
  'uepa': { x: 288.0, y: 83.0 },           // Belém / Litoral
  'cesupa': { x: 250.0, y: 95.0 },         // Santarém / Baixo Amazonas

  // Distrito Federal (DF) - 2 instituições
  'ses-df': { x: 293.0, y: 235.5 },        // Asa Norte
  'habm': { x: 299.0, y: 239.5 },          // Asa Sul

  // Goiás (GO) - 2 instituições
  'ses-go': { x: 280.5, y: 247.1 },        // Goiânia Centro
  'psu-go': { x: 275.0, y: 235.0 }         // Anápolis / Norte
};

interface CanonicalStateItem {
  uf: string;
  name: string;
  d: string;
  bbox: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number };
  center: { x: number; y: number };
  zoomScale: number;
}

export interface LandingInstitutionsAndMapSectionProps {
  onSelectInstitution?: (inst: InstitutionInfo) => void;
  onScrollToQuestions?: () => void;
}

export const LandingInstitutionsAndMapSection: React.FC<LandingInstitutionsAndMapSectionProps> = ({
  onSelectInstitution,
  onScrollToQuestions
}) => {
  const { accent, mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const isMonochrome = accent === 'neutral';

  const highlightTextStyle = getLandingHighlightTextStyle(accentConfig, mode, isMonochrome);

  // Padrão: Todas as UFs (ALL)
  const [selectedUf, setSelectedUf] = useState<string>('ALL');
  const [hoveredUf, setHoveredUf] = useState<string | null>(null);

  // Hook de animação para os contadores numéricos e para a dobra do mapa
  const { ref: statsRef, isVisible: statsVisible, isExiting: statsExiting } = useScrollReveal<HTMLDivElement>(0.12);
  const { ref: mapSectionRef, isVisible: mapVisible, isExiting: mapExiting } = useScrollReveal<HTMLDivElement>(0.06);
  const count200 = useAnimatedCounter(200, statsVisible, 1200);
  const count100 = useAnimatedCounter(100, statsVisible, 1200);
  const count120 = useAnimatedCounter(120, statsVisible, 1200);

  // Lista de estados ordenados para o seletor (Apenas nomes dos estados)
  const ufOptions = useMemo(() => {
    return Object.keys(UF_FULL_NAMES)
      .sort((a, b) => UF_FULL_NAMES[a].localeCompare(UF_FULL_NAMES[b]))
      .map((uf) => ({
        uf,
        name: UF_FULL_NAMES[uf]
      }));
  }, []);

  const activeInstitutions: InstitutionInfo[] = useMemo(() => {
    if (selectedUf === 'ALL') {
      const all: InstitutionInfo[] = [];
      const priorityUfs = ['SP', 'RJ', 'MG', 'RS', 'CE', 'PR', 'BA', 'PE', 'SC', 'GO', 'DF'];
      priorityUfs.forEach((uf) => {
        if (STATE_INSTITUTIONS[uf]) {
          all.push(...STATE_INSTITUTIONS[uf]);
        }
      });
      // Apenas instituições estaduais / regionais, sem provas nacionais
      return all.filter((i) => !i.isNacional);
    }
    const stateList = STATE_INSTITUTIONS[selectedUf] || [];
    return stateList.filter((i) => !i.isNacional);
  }, [selectedUf]);

  const currentUfName = selectedUf === 'ALL'
    ? 'Todas as UFs'
    : UF_FULL_NAMES[selectedUf] || 'Estado Selecionado';

  // Opção A: Alternador entre Destaques (3 a 8 principais) e Todas as 950+ bancas do estado
  const [catalogMode, setCatalogMode] = useState<'destaques' | 'todas'>('destaques');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelectState = (uf: string) => {
    setSelectedUf(uf);
    setHighlightedInstId(null);
    setSearchQuery('');
    setCatalogMode('destaques');
  };

  // Mapa de logos oficiais indexadas por sigla ou ID
  const logoBySiglaOrName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const list of Object.values(STATE_INSTITUTIONS)) {
      for (const inst of list) {
        if (inst.logoSlug) {
          map[inst.sigla.toLowerCase()] = inst.logoSlug;
          map[inst.id.toLowerCase()] = inst.logoSlug;
        }
      }
    }
    for (const inst of NACIONAL_INSTITUTIONS) {
      if (inst.logoSlug) {
        map[inst.sigla.toLowerCase()] = inst.logoSlug;
        map[inst.id.toLowerCase()] = inst.logoSlug;
      }
    }
    return map;
  }, []);

  // Catálogo completo de bancas carregado sob demanda (reduz ~291 KB do bundle inicial)
  const [fullBancasDirectory, setFullBancasDirectory] = useState<CanonicalBancaItem[] | null>(null);

  useEffect(() => {
    if (catalogMode === 'todas' || searchQuery.trim()) {
      import('@/data/canonicalBancasDirectory').then((m) => {
        setFullBancasDirectory(m.CANONICAL_BANCAS_DIRECTORY);
      });
    }
  }, [catalogMode, searchQuery]);

  // Bancas canônicas do estado selecionado (ou todas)
  const stateCanonicalBancas = useMemo(() => {
    const dir = fullBancasDirectory || [];
    if (selectedUf === 'ALL') {
      return dir;
    }
    return dir.filter((b) => b.uf === selectedUf);
  }, [selectedUf, fullBancasDirectory]);

  // Lista de instituições renderizadas na vitrine lateral
  const displayedInstitutions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. Pesquisa ativa do usuário
    if (query) {
      const list = stateCanonicalBancas.length > 0
        ? stateCanonicalBancas
        : activeInstitutions.map((i) => ({
          key: i.id,
          sigla: i.sigla,
          nome: i.nome,
          uf: i.uf,
          count: i.questoesCount,
          bancaOrganizadora: undefined as string | undefined
        }));

      return list
        .filter((b) => {
          const siglaMatch = b.sigla.toLowerCase().includes(query);
          const nomeMatch = b.nome.toLowerCase().includes(query);
          const orgMatch = b.bancaOrganizadora ? b.bancaOrganizadora.toLowerCase().includes(query) : false;
          return siglaMatch || nomeMatch || orgMatch;
        })
        .map((b) => ({
          id: b.key,
          sigla: b.sigla,
          nome: b.nome,
          uf: b.uf,
          questoesCount: b.count,
          provasCount: Math.max(1, Math.round(b.count / 100)),
          bancaOrganizadora: b.bancaOrganizadora,
          logoSlug: logoBySiglaOrName[b.sigla.toLowerCase()] || logoBySiglaOrName[b.key.toLowerCase()]
        }));
    }

    // 2. Modo catálogo completo da UF
    if (catalogMode === 'todas') {
      if (stateCanonicalBancas.length > 0) {
        return stateCanonicalBancas.map((b) => ({
          id: b.key,
          sigla: b.sigla,
          nome: b.nome,
          uf: b.uf,
          questoesCount: b.count,
          provasCount: Math.max(1, Math.round(b.count / 100)),
          bancaOrganizadora: b.bancaOrganizadora,
          logoSlug: logoBySiglaOrName[b.sigla.toLowerCase()] || logoBySiglaOrName[b.key.toLowerCase()]
        }));
      }
    }

    // 3. Modo destaques (padrão com 3 a 8 principais âncoras)
    return activeInstitutions.map((inst) => ({
      id: inst.id,
      sigla: inst.sigla,
      nome: inst.nome,
      uf: inst.uf,
      questoesCount: inst.questoesCount,
      provasCount: inst.provasCount,
      bancaOrganizadora: undefined as string | undefined,
      logoSlug: inst.logoSlug
    }));
  }, [searchQuery, catalogMode, stateCanonicalBancas, activeInstitutions, logoBySiglaOrName]);

  // Instituição destacada (via hover no pin ou no card)
  const [highlightedInstId, setHighlightedInstId] = useState<string | null>(null);

  // Metadados canônicos do estado selecionado (centro, zoom calibrado e bbox)
  const currentStateData = useMemo(() => {
    if (selectedUf === 'ALL') return null;
    return (canonicalBrazilStatesSvgData as CanonicalStateItem[]).find((s) => s.uf === selectedUf) || null;
  }, [selectedUf]);

  // Lógica de Zoom Vetorial Dinâmico no Estado Selecionado (com escala aumentada)
  const isZoomed = selectedUf !== 'ALL' && Boolean(currentStateData);
  const center = currentStateData ? currentStateData.center : { x: 225, y: 230 };
  const zoomScale = currentStateData ? currentStateData.zoomScale : 1;
  const translateX = isZoomed ? 225 - center.x * zoomScale : 0;
  const translateY = isZoomed ? 230 - center.y * zoomScale : 0;

  // TODAS as instituições do estado selecionado (SEM slice de 2, contemplando todas as bancas)
  const stateCalloutInstitutions = useMemo(() => {
    if (!isZoomed || !selectedUf) return [];
    const list = STATE_INSTITUTIONS[selectedUf] || [];
    return list.filter((i) => !i.isNacional);
  }, [isZoomed, selectedUf]);

  // Cálculo das coordenadas dos Pins de GPS na tela estritamente DENTRO do território do estado (Zero sobreposição e Zero overflow)
  const institutionPins = useMemo(() => {
    if (!isZoomed || !currentStateData || !stateCalloutInstitutions.length) return [];

    return stateCalloutInstitutions.map((inst) => {
      // 1. Busca coordenadas geográficas calibradas para o estado, ou coordenada da cidade sede
      const anchorConfig = STATE_ANCHOR_COORDINATES[inst.id];
      const cityPoint = anchorConfig
        ? { x: anchorConfig.x, y: anchorConfig.y }
        : CITY_COORDINATES[inst.cidade] || currentStateData.center;

      // 2. Converte coordenada SVG para percentual do contêiner em tela
      const scrX = ((cityPoint.x * zoomScale + translateX) / 450) * 100;
      const scrY = ((cityPoint.y * zoomScale + translateY) / 460) * 100;

      return {
        inst,
        screenX: scrX,
        screenY: scrY
      };
    });
  }, [isZoomed, currentStateData, stateCalloutInstitutions, zoomScale, translateX, translateY]);

  // Pins do estado ordenados de Sul para Norte para entrada em cascata regional
  const sortedStatePins = useMemo(() => {
    return [...institutionPins].sort((a, b) => b.screenY - a.screenY);
  }, [institutionPins]);

  return (
    <section
      id="onde-vem-as-provas"
      className="relative scroll-mt-16 pt-12 sm:pt-16 pb-12 sm:pb-16 bg-transparent text-[var(--foreground,#09090b)] dark:text-[var(--foreground,#f4f4f5)] transition-colors duration-200"
    >
      {/* Iluminação Ambiente Suave Atrás da Dobra (Zero Linhas / Divisórias) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] sm:w-[980px] h-72 opacity-25 dark:opacity-15 blur-3xl rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${accentConfig.primaryHex} 0%, transparent 70%)`
        }}
      />
      <div ref={mapSectionRef} className={`max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12 fold-reveal ${mapVisible ? 'is-visible' : ''} ${mapExiting ? 'is-exiting' : ''}`}>
        {/* =========================================================================
            1. DOBRA DO MAPA DO BRASIL: LIVRE E INTEGRADA AO FUNDO CONTÍNUO
            ========================================================================= */}
        {/* Cabeçalho Limpo Padronizado: Livre no fluxo de rolagem contínua */}
        <div className="max-w-3xl text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-[-0.03em] text-zinc-950 dark:text-white leading-[1.15]">
            De onde vêm as provas oficiais do{' '}
            <span
              className="bg-clip-text text-transparent animate-hippo-text-sweep opacity-95"
              style={highlightTextStyle}
            >
              Banco Residência
            </span>
          </h2>
        </div>

        {/* Grid Principal: Seletor com Funil na Esquerda + Mapa & Vitrine de Logos */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start fold-reveal fold-delay-1 ${mapVisible ? 'is-visible' : ''}`}>
          {/* Lado Esquerdo: Seletor com Funil no lado esquerdo + Mapa do Brasil */}
          <div className="lg:col-span-6 bg-zinc-50/80 dark:bg-[#121216] p-5 sm:p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 flex flex-col justify-between">
            {/* Seletor: Sem label de cima, ícone de funil na esquerda do select, sem nome em baixo */}
            <div className="relative mb-6">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500">
                <Filter className="w-4 h-4" />
              </div>

              <select
                id="uf-select"
                aria-label="Selecionar estado"
                value={selectedUf}
                onChange={(e) => handleSelectState(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-[#18181f] border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-white font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] cursor-pointer shadow-xs transition-colors"
              >
                <option value="ALL">Todas as UFs</option>
                {ufOptions.map((opt) => (
                  <option key={opt.uf} value={opt.uf}>
                    {opt.name}
                  </option>
                ))}
              </select>

              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Mapa do Brasil SVG Interativo com Zoom no Estado, Setas e Logos Flutuantes */}
            <div className="relative w-full aspect-[450/460] max-w-[420px] mx-auto my-auto flex items-center justify-center py-2 overflow-hidden rounded-2xl select-none">
              {/* Botão Flutuante de Retornar à Visão Geral do Brasil */}
              {isZoomed && (
                <button
                  type="button"
                  onClick={() => handleSelectState('ALL')}
                  className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#18181f]/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-700/80 text-xs font-black text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white shadow-md hover:scale-105 transition-all cursor-pointer animate-in fade-in duration-200"
                  title="Retornar ao mapa completo do Brasil"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ver Brasil</span>
                </button>
              )}

              {/* SVG do Mapa com Efeito de Zoom Dinâmico e Contornos Oficiais do IBGE */}
              <svg
                viewBox="0 0 450 460"
                className="w-full h-full select-none"
                style={{ overflow: 'visible' }}
                shapeRendering="geometricPrecision"
              >
                {/* Grupo dos Estados com Transição Suave de Posição e Escala Aumentada */}
                <g
                  style={{
                    transform: isZoomed ? `translate(${translateX}px, ${translateY}px) scale(${zoomScale})` : 'none',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformOrigin: '0 0'
                  }}
                >
                  {(canonicalBrazilStatesSvgData as CanonicalStateItem[]).map((state, stateIdx) => {
                    const isSelected = selectedUf === state.uf;
                    const isHovered = hoveredUf === state.uf;

                    // Cores adaptadas ao tema neutro e ao acento do usuário:
                    // Ao dar zoom, os outros estados continuam visíveis, porém de forma suave e esvaecida
                    const fill = isSelected
                      ? accentConfig.primaryHex
                      : isHovered
                        ? isDark ? '#323242' : '#cbd5e1'
                        : isDark
                          ? isZoomed ? '#1c1c26' : '#16161d'
                          : isZoomed ? '#f1f1f5' : '#e4e4e7';

                    const stroke = isSelected
                      ? isDark
                        ? accentConfig.id === 'neutral' ? '#ffffff' : (accentConfig.hoverHex || '#93c5fd')
                        : accentConfig.id === 'neutral' ? '#09090b' : (accentConfig.hoverHex || '#1d4ed8')
                      : isDark
                        ? isZoomed ? 'rgba(255, 255, 255, 0.28)' : '#2a2a35'
                        : isZoomed ? 'rgba(0, 0, 0, 0.22)' : '#d1d5db';

                    const strokeWidth = isSelected
                      ? 1.5
                      : isZoomed ? 0.85 : 0.8;

                    const opacity = isZoomed && !isSelected
                      ? isHovered ? 0.85 : 0.42
                      : 1;

                    return (
                      <g
                        key={state.uf}
                        className={`cursor-pointer transition-all duration-150 ${mapVisible ? 'animate-state-contour' : 'opacity-0'}`}
                        style={{
                          opacity,
                          animationDelay: `${(stateIdx % 10) * 35}ms`,
                          transition: 'opacity 0.3s ease'
                        }}
                        onClick={() => handleSelectState(state.uf)}
                        onMouseEnter={() => setHoveredUf(state.uf)}
                        onMouseLeave={() => setHoveredUf(null)}
                      >
                        <path
                          d={state.d}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={strokeWidth}
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-colors duration-200"
                        />
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Marcadores de GPS com Logo Redonda e Ponteiro no Solo (Quando em Zoom no Estado) */}
              {isZoomed &&
                sortedStatePins.map(({ inst, screenX, screenY }, pinIdx) => {
                  const isHighlighted = highlightedInstId === inst.id;
                  return (
                    <div
                      key={inst.id}
                      className="absolute z-20 flex flex-col items-center pointer-events-auto cursor-pointer group transition-all duration-200 animate-pin-teardrop-pop"
                      style={{
                        left: `${screenX}%`,
                        top: `${screenY}%`,
                        transform: 'translate(-50%, -100%)',
                        animationDelay: `${pinIdx * 30}ms`,
                        animationFillMode: 'both'
                      }}
                      onClick={() => {
                        setHighlightedInstId(inst.id);
                        onSelectInstitution?.(inst);
                        const cardEl = document.getElementById(`inst-card-${inst.id}`);
                        if (cardEl) {
                          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      onMouseEnter={() => setHighlightedInstId(inst.id)}
                      onMouseLeave={() => setHighlightedInstId(null)}
                    >
                      {/* Marcador de GPS Teardrop Moderno: Cabeça Circular + Agulha Direta no Solo */}
                      <div className="relative flex flex-col items-center">
                        {/* Anel de pulso sutil e contínuo (ripple wave) de 2.5s no pin selecionado */}
                        {isHighlighted && (
                          <div
                            aria-hidden="true"
                            className="absolute -inset-1 rounded-full animate-pin-ripple pointer-events-none"
                            style={{
                              border: `2px solid ${accentConfig.primaryHex}`,
                              boxShadow: `0 0 14px ${accentConfig.primaryHex}`
                            }}
                          />
                        )}

                        <div
                          className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.6)] border-2 transition-all duration-200 flex items-center justify-center overflow-hidden shrink-0 ${isHighlighted ? 'scale-125 ring-2 ring-white' : 'group-hover:scale-115'
                            }`}
                          style={{
                            borderColor: '#ffffff',
                            boxShadow: isHighlighted
                              ? `0 0 16px rgba(255,255,255,0.95), 0 0 24px ${accentConfig.primaryHex}`
                              : '0 4px 14px rgba(0,0,0,0.65)'
                          }}
                        >
                          {inst.logoSlug ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/images/institutions/${inst.logoSlug}.webp`}
                              alt={inst.sigla}
                              width={28}
                              height={28}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-black tracking-tight text-zinc-950 uppercase px-0.5 leading-none text-center">
                              {inst.sigla.split('/')[0].trim().slice(0, 6)}
                            </span>
                          )}
                        </div>

                        {/* Ponta da Agulha de GPS no Solo: Compacta e Nítida em Branco Puro */}
                        <div
                          className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] -mt-0.5 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
                          style={{ borderTopColor: '#ffffff' }}
                        />
                      </div>

                      {/* Tooltip elegante suspenso exibido EXCLUSIVAMENTE no hover (zero poluição no mapa) */}
                      {isHighlighted && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-lg bg-zinc-950 text-white text-[10px] font-black tracking-tight whitespace-nowrap shadow-2xl border border-zinc-700/80 pointer-events-none z-30 animate-in fade-in zoom-in-95 duration-150">
                          {inst.sigla} • {inst.cidade}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Lado Direito: Vitrine de Provas Nacionais e Instituições Estaduais */}
          <div className="lg:col-span-6 space-y-4">
            {/* 1. Bloco de Provas Nacionais Unificadas (Imagem 2 antes da Imagem 1, com AMB incluída) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50/80 dark:bg-[#121216] border border-zinc-200/90 dark:border-zinc-800/90 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-950 dark:text-white">
                    Provas Nacionais Unificadas (Brasil)
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Cadernos oficiais na íntegra de 2018 a 2026 com cronômetro e resolução completa.
                  </div>
                </div>
              </div>

              {/* 3 Provas Nacionais: ENARE, INEP Revalida e AMB / Especialidades */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {NACIONAL_INSTITUTIONS.map((nac) => (
                  <div
                    key={nac.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#18181f] border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      {nac.logoSlug ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/images/institutions/${nac.logoSlug}.webp`}
                          alt={nac.sigla}
                          width={36}
                          height={36}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <GraduationCap className="w-5 h-5 text-zinc-700" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-zinc-950 dark:text-white truncate">
                        {nac.sigla}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {nac.nome}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Instituições & Provas Oficiais Estaduais (Opção A: Destaques vs Catálogo Completo 950+ com Busca) */}
            <div className="space-y-2.5">
              {/* Header: Título + Alternador de Modo Destaques / Todas */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300 shrink-0" />
                  <span>Instituições & Provas ({currentUfName})</span>
                </div>

                {/* Toggle Pills: Principais vs Todas */}
                <div className="inline-flex p-1 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogMode('destaques');
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-lg transition-all cursor-pointer ${catalogMode === 'destaques' && !searchQuery
                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                  >
                    Destaques
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatalogMode('todas')}
                    className={`px-3 py-1.5 min-h-[36px] sm:min-h-[32px] rounded-lg transition-all cursor-pointer ${catalogMode === 'todas' || searchQuery
                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                  >
                    Todas
                  </button>
                </div>
              </div>

              {/* Barra de Pesquisa Rápida */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar instituição ou banca..."
                  className="w-full pl-9 pr-9 py-2 min-h-[40px] rounded-xl bg-white dark:bg-[#18181f] border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-[var(--primary-color)] shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded cursor-pointer"
                    title="Limpar busca"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid de Cards com Rolagem Interna Calibrada à Altura Exata do Mapa */}
              <div className="max-h-[295px] lg:max-h-[295px] overflow-y-auto pr-1 sm:pr-1.5 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700/60 rounded-xl">
                {displayedInstitutions.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-zinc-50/60 dark:bg-[#121216] border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-500 space-y-2">
                    <p>Nenhuma banca encontrada para &quot;{searchQuery}&quot; em {currentUfName}.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCatalogMode('destaques');
                      }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Restaurar visualização padrão
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayedInstitutions.map((inst, idx) => {
                      const isHighlighted = highlightedInstId === inst.id;
                      return (
                        <div
                          key={inst.id}
                          id={`inst-card-${inst.id}`}
                          className={`animate-banca-stagger p-3 rounded-2xl border transition-all duration-200 flex items-center group shadow-2xs cursor-pointer ${isHighlighted
                              ? 'bg-zinc-100 dark:bg-[#1b1b24] ring-2 scale-[1.01]'
                              : 'bg-zinc-50/80 dark:bg-[#121216] border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-400 dark:hover:border-zinc-700'
                            }`}
                          style={{
                            animationDelay: `${Math.min(idx, 15) * 35}ms`,
                            ...(isHighlighted ? { borderColor: accentConfig.primaryHex } : {})
                          }}
                          onMouseEnter={() => setHighlightedInstId(inst.id)}
                          onMouseLeave={() => setHighlightedInstId(null)}
                          onClick={() => onSelectInstitution?.(inst as unknown as InstitutionInfo)}
                        >
                          <div className="flex items-center gap-3 w-full min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                              {inst.logoSlug ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={`/images/institutions/${inst.logoSlug}.webp`}
                                  alt={inst.sigla}
                                  width={32}
                                  height={32}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <GraduationCap className="w-5 h-5 text-zinc-700" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white truncate">
                                  {inst.sigla}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 shrink-0">
                                  {inst.uf}
                                </span>
                                {inst.bancaOrganizadora && (
                                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate max-w-[140px]">
                                    • {inst.bancaOrganizadora}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug line-clamp-1 mt-0.5">
                                {inst.nome}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. ESTATÍSTICAS DA IMAGEM 1 ABAIXO DO MAPA (COM ANIMAÇÃO DE CONTAGEM & ESTILO IMAGEM 5)
            ========================================================================= */}
        <div ref={statsRef} className={`fold-reveal fold-delay-1 ${statsVisible ? 'is-visible' : ''} ${statsExiting ? 'is-exiting' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1: +200 mil */}
            <div className="relative rounded-3xl p-6 sm:p-7 bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] flex flex-col justify-between transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-700">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`,
                  opacity: 0.55
                }}
              />
              <div>
                <div className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  +{count200} mil
                </div>
                <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                  Questões Cadastradas
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  Acervo completo com as principais provas de residência do país.
                </p>
              </div>
            </div>

            {/* Card 2: 100% comentadas */}
            <div className="relative rounded-3xl p-6 sm:p-7 bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] flex flex-col justify-between transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-700">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`,
                  opacity: 0.55
                }}
              />
              <div>
                <div className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {count100}%
                </div>
                <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                  Comentadas Alternativa por Alternativa
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  Justificativas padrão-ouro e fundamentação médica diretriz a diretriz.
                </p>
              </div>
            </div>

            {/* Card 3: 120+ instituições */}
            <div className="relative rounded-3xl p-6 sm:p-7 bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] flex flex-col justify-between transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-700">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`,
                  opacity: 0.55
                }}
              />
              <div>
                <div className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  +{count120}
                </div>
                <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                  Instituições e Bancas Oficiais
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  Cobertura em todas as 27 Unidades da Federação do Brasil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingInstitutionsAndMapSection;
