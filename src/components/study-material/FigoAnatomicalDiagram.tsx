'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Layers, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface FigoItem {
  type: string;
  category: 'Submucoso' | 'Intramural' | 'Subseroso' | 'Especial' | 'Híbrido';
  title: string;
  depthDescription: string;
  clinicalImpact: string;
  surgicalPearls: string;
  examClue: string;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const FIGO_DATA: FigoItem[] = [
  {
    type: 'FIGO 0',
    category: 'Submucoso',
    title: 'Submucoso Pediculado Intracavitário',
    depthDescription: '100% intracavitário, preso à parede endometrial apenas por pedículo vascular fino.',
    clinicalImpact: 'Sangramento uterino anormal volumoso (menorragia), dismenorreia espasmódica por cólica expulsiva, anemia ferropriva grave e abortamento precoce.',
    surgicalPearls: 'Padrão-ouro: Miomectomia histeroscópica em tempo único (ressectoscópio com alça de polipectomia/miomectomia). Baixo risco cirúrgico.',
    examClue: 'Pode evoluir para "Mioma Parido" se exteriorizado pelo canal cervical. DIU de Levonorgestrel é formalmente contraindicado.',
    colorClass: '#EF4444',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-700 dark:text-rose-400'
  },
  {
    type: 'FIGO 1',
    category: 'Submucoso',
    title: 'Submucoso Séssil com < 50% Intramural',
    depthDescription: 'Predomínio na cavidade endometrial (> 50% cavitário); menos da metade do seu volume invade o miométrio adjacente.',
    clinicalImpact: 'Hemorragia abundante cíclica, anemia ferropriva refratária, falha na nidação/implantação embrionária.',
    surgicalPearls: 'Miomectomia histeroscópica por fatiamento (slicing) com ressectoscópio monopolar (solução não-eletrolítica) ou bipolar (soro fisiológico). Escore STEPW ≤ 4.',
    examClue: 'Histerossonografia com infusão salina ou RNM medem com precisão a margem livre miometrial até a serosa.',
    colorClass: '#F43F5E',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-700 dark:text-rose-400'
  },
  {
    type: 'FIGO 2',
    category: 'Submucoso',
    title: 'Submucoso com ≥ 50% Intramural',
    depthDescription: 'A maior parte do volume do mioma encontra-se imersa no miométrio, mas há protrusão para a cavidade endometrial.',
    clinicalImpact: 'SUA severo combinado com dismenorreia e aumento focal do contorno uterino.',
    surgicalPearls: 'Procedimento histeroscópico complexo (Grupo II de Lasmar: 5 a 6 pts). Frequentemente exige cirurgia em dois tempos ou preparo com Análogo de GnRH por 2-3 meses.',
    examClue: 'Risco de perfuração uterina e sobrecarga hídrica (síndrome de TURP) se forçado em tempo único sem margem miometrial de segurança (mínimo 5 mm).',
    colorClass: '#FB7185',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-700 dark:text-rose-400'
  },
  {
    type: 'FIGO 3',
    category: 'Intramural',
    title: 'Intramural em Contato Endometrial (100% miometrial)',
    depthDescription: 'Totalmente circunscrito ao miométrio, porém sua margem interna tangencia diretamente a linha endometrial sem invadir o lúmen.',
    clinicalImpact: 'Aumento da perda sanguínea menstrual por alteração na contratilidade e angiogênese venosa local; infertilidade por distorção microvascular.',
    surgicalPearls: 'Não é passível de ressecção histeroscópica pura; conduta conservadora é miomectomia laparoscópica/laparotômica se sintomática.',
    examClue: 'Diferenciação sutil com FIGO 2: o FIGO 3 não possui qualquer componente visível dentro da cavidade na histeroscopia diagnóstica.',
    colorClass: '#F59E0B',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-700 dark:text-amber-400'
  },
  {
    type: 'FIGO 4',
    category: 'Intramural',
    title: 'Intramural Verdadeiro (100% puro)',
    depthDescription: 'Localizado inteiramente na espessura do miométrio, sem qualquer contato com o endométrio e sem abaular a serosa peritoneal.',
    clinicalImpact: 'Uteromegalia difusa, dismenorreia secundária dolorosa, sensação de peso pélvico. Não costuma provocar hemorragia cataclísmica direta.',
    surgicalPearls: 'Tratamento clínico com progestágenos/DIU-Mirena (cavidade preservada) ou miomectomia laparotômica/laparoscópica se refratário com desejo de gestação.',
    examClue: 'É a localização anatômica mais prevalente no total das pacientes com miomatose (~65% dos casos).',
    colorClass: '#D97706',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-700 dark:text-amber-400'
  },
  {
    type: 'FIGO 5',
    category: 'Subseroso',
    title: 'Subseroso com ≥ 50% Intramural',
    depthDescription: 'Componente intramural profundo, mas projeta-se abaulando a superfície externa serosa do útero.',
    clinicalImpact: 'Geralmente oligossintomático ou assintomático; pode gerar compressão de órgãos adjacentes se volumoso.',
    surgicalPearls: 'Abordagem preferencial por videolaparoscopia ou laparotomia. Risco cirúrgico relacionado a sangramento do leito miometrial.',
    examClue: 'Pode ser palpado no toque bimanual como nódulo fibroelástico aderido ao corpo uterino.',
    colorClass: '#0284C7',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-700 dark:text-sky-400'
  },
  {
    type: 'FIGO 6',
    category: 'Subseroso',
    title: 'Subseroso Séssil com < 50% Intramural',
    depthDescription: 'Predomínio exofítico voltado para o peritônio; menos da metade de sua base está cravada no miométrio.',
    clinicalImpact: 'Sintomas compressivos mecânicos pélvicos: urgência miccional e polaciúria (parede anterior) ou constipação crônica e tenesmo (parede posterior).',
    surgicalPearls: 'Miomectomia laparoscópica minimamente invasiva altamente favorável devido à fácil dissecção da cápsula externa.',
    examClue: 'NÃO provoca sangramento uterino anormal. Se a questão descrever paciente com mioma FIGO 6 e SUA, investigar causa endometrial associada!',
    colorClass: '#0EA5E9',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-700 dark:text-sky-400'
  },
  {
    type: 'FIGO 7',
    category: 'Subseroso',
    title: 'Subseroso Pediculado',
    depthDescription: '100% exteriorizado na cavidade peritoneal, ligado ao útero exclusivamente por uma haste vascularizada.',
    clinicalImpact: 'Elevadíssimo risco de Torção Aguda de Pedículo, precipitando necrose isquêmica e abdome agudo ginecológico cirúrgico.',
    surgicalPearls: 'Tratamento de emergência por videolaparoscopia com ligadura ou clipagem do pedículo vascular torcido.',
    examClue: 'Quadro clássico de prova: dor pélvica aguda súbita em cólica com descompressão dolorosa positiva em mulher com mioma conhecido.',
    colorClass: '#38BDF8',
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/15',
    badgeBorder: 'border-sky-500/30',
    badgeText: 'text-sky-700 dark:text-sky-400'
  },
  {
    type: 'FIGO 8',
    category: 'Especial',
    title: 'Localização Cervical / Atípica',
    depthDescription: 'Mioma originado no colo uterino (estroma cervical), ligamento largo ou parasita peritoneal.',
    clinicalImpact: 'Dispareunia de profundidade, distócia de trajeto no parto vaginal, compressão de ureteres pélvicos com hidronefrose progressiva silenciosa.',
    surgicalPearls: 'Dissecção cirúrgica de alto risco anatômico pela proximidade imediata dos vasos uterinos e ureteres pélvicos.',
    examClue: 'Mioma cervical projeta-se na vagina ou deforma o canal cervical; em grávidas, é indicação formal de cesariana eletiva.',
    colorClass: '#8B5CF6',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-700 dark:text-purple-400'
  },
  {
    type: 'Híbrido 2-5',
    category: 'Híbrido',
    title: 'Transmural (FIGO 2-5)',
    depthDescription: 'Estende-se através de toda a espessura miometrial, desde a cavidade endometrial até a serosa externa.',
    clinicalImpact: 'Associação severa de sangramento uterino volumoso com distorção cavitária acentuada e compressão de vísceras adjacentes.',
    surgicalPearls: 'Cirurgia complexa; em nuligestas exige reconstrução em múltiplos planos com risco de sinéquias uterinas e fraqueza na cicatriz miometrial.',
    examClue: 'Abertura transmural durante miomectomia torna a indicação de cesariana eletiva mandatória em gravidezes subsequentes.',
    colorClass: '#EC4899',
    badgeBg: 'bg-pink-500/10 dark:bg-pink-500/15',
    badgeBorder: 'border-pink-500/30',
    badgeText: 'text-pink-700 dark:text-pink-400'
  }
];

export const FigoAnatomicalDiagram: React.FC = () => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const [selectedType, setSelectedType] = useState<string>('FIGO 0');

  const selectedItem = FIGO_DATA.find((item) => item.type === selectedType) || FIGO_DATA[0];

  return (
    <div
      className={`my-8 rounded-2xl border transition-all overflow-hidden ${
        isDark ? 'bg-[#121215] border-zinc-800 shadow-md' : 'bg-white border-zinc-200/90 shadow-xs'
      }`}
    >
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Classificação FIGO dos Leiomiomas Uterinos
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Sistema PALM-COEIN / FEBRASGO
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Corte coronal anatômico do útero com mapeamento topográfico exato das lesões (0 a 8 e Híbridos)
            </p>
          </div>
        </div>

        {/* Pílulas de Legenda Soberas */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            Submucoso (0, 1, 2)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            Intramural (3, 4)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30">
            Subseroso (5, 6, 7)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">
            Cervical (8)
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel Esquerdo: Corte Coronal Anatômico do Útero (7 colunas) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <span>VISÃO CORONAL DO ÚTERO & CORRELAÇÃO TOPOGRÁFICA</span>
            <span className="text-[11px] font-normal text-zinc-400">Toque no nódulo para inspecionar</span>
          </div>

          <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 p-4 overflow-hidden">
            <svg
              viewBox="0 0 560 480"
              className="w-full h-auto select-none"
              style={{ maxHeight: '450px' }}
            >
              <defs>
                {/* Gradiente da Parede Muscular do Miométrio */}
                <linearGradient id="coronalMyoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isDark ? '#2E2E35' : '#E2E8F0'} />
                  <stop offset="50%" stopColor={isDark ? '#24242A' : '#CBD5E1'} />
                  <stop offset="100%" stopColor={isDark ? '#1C1C22' : '#94A3B8'} />
                </linearGradient>

                {/* Gradiente do Endométrio e Cavidade */}
                <linearGradient id="coronalCavityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={isDark ? '#18181B' : '#FFFFFF'} />
                  <stop offset="100%" stopColor={isDark ? '#09090B' : '#F8FAFC'} />
                </linearGradient>

                {/* Filtro de Sombra Suave dos Nódulos */}
                <filter id="coronalNoduleShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity={isDark ? '0.6' : '0.25'} />
                </filter>
              </defs>

              {/* Linhas Guias e Rótulos Anatômicos Externos */}
              {/* Rótulo: Fundo Uterino */}
              <text x="280" y="24" fill={isDark ? '#A1A1AA' : '#64748B'} fontSize="11" fontWeight="bold" textAnchor="middle">
                Fundo Uterino
              </text>
              <line x1="280" y1="28" x2="280" y2="46" stroke={isDark ? '#52525B' : '#CBD5E1'} strokeWidth="1" strokeDasharray="2 2" />

              {/* Rótulo: Serosa / Peritônio */}
              <text x="35" y="70" fill={isDark ? '#7DD3FC' : '#0369A1'} fontSize="10" fontWeight="bold">
                Serosa (Peritônio)
              </text>
              <line x1="125" y1="67" x2="160" y2="67" stroke={isDark ? '#38BDF8' : '#0284C7'} strokeWidth="1" />

              {/* Rótulo: Miométrio */}
              <text x="20" y="225" fill={isDark ? '#E4E4E7' : '#334155'} fontSize="10" fontWeight="bold">
                Miométrio (Parede Muscular)
              </text>
              <line x1="150" y1="222" x2="190" y2="222" stroke={isDark ? '#71717A' : '#94A3B8'} strokeWidth="1" />

              {/* Rótulo: Cavidade Endometrial */}
              <text x="410" y="270" fill={isDark ? '#FDA4AF' : '#BE123C'} fontSize="10" fontWeight="bold">
                Cavidade Endometrial (Lúmen)
              </text>
              <line x1="320" y1="210" x2="405" y2="267" stroke={isDark ? '#FB7185' : '#E11D48'} strokeWidth="1" />

              {/* Rótulo: Colo Uterino */}
              <text x="410" y="420" fill={isDark ? '#C4B5FD' : '#6D28D9'} fontSize="10" fontWeight="bold">
                Colo Uterino (Cérvice)
              </text>
              <line x1="315" y1="417" x2="405" y2="417" stroke={isDark ? '#A78BFA' : '#7C3AED'} strokeWidth="1" />

              {/* ======================================================== */}
              {/* CORPO UTERINO: PAREDE MUSCULAR EXTERNA (MIOMÉTRIO + SEROSA) */}
              {/* ======================================================== */}
              {/* Contorno anatômico coronal: Cúpula do fundo, cornos bilaterais, parede corporal convergindo ao colo */}
              <path
                d="M 280,48
                   C 360,48 440,75 440,110
                   C 440,140 430,190 395,250
                   C 370,290 330,335 325,370
                   L 325,440
                   C 325,450 310,455 280,455
                   C 250,455 235,450 235,440
                   L 235,370
                   C 230,335 190,290 165,250
                   C 130,190 120,140 120,110
                   C 120,75 200,48 280,48 Z"
                fill="url(#coronalMyoGrad)"
                stroke={isDark ? '#38BDF8' : '#0284C7'}
                strokeWidth="2.5"
                strokeDasharray="none"
              />

              {/* Fibras Musculares do Miométrio (Arcos Anatômicos Sutis) */}
              <path
                d="M 155,120 Q 280,95 405,120"
                fill="none"
                stroke={isDark ? '#3F3F46' : '#E2E8F0'}
                strokeWidth="1"
                opacity="0.4"
              />
              <path
                d="M 165,165 Q 280,145 395,165"
                fill="none"
                stroke={isDark ? '#3F3F46' : '#E2E8F0'}
                strokeWidth="1"
                opacity="0.4"
              />
              <path
                d="M 180,210 Q 280,195 380,210"
                fill="none"
                stroke={isDark ? '#3F3F46' : '#E2E8F0'}
                strokeWidth="1"
                opacity="0.4"
              />

              {/* ======================================================== */}
              {/* ZONA JUNCIONAL SUBENDOMETRIAL (Linha Guia de Prova) */}
              {/* ======================================================== */}
              <path
                d="M 280,86
                   C 325,86 365,100 365,122
                   C 365,145 315,250 295,290
                   L 295,370
                   L 265,370
                   L 265,290
                   C 245,250 195,145 195,122
                   C 195,100 235,86 280,86 Z"
                fill="none"
                stroke="#E11D48"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity={isDark ? '0.7' : '0.5'}
              />

              {/* ======================================================== */}
              {/* CAVIDADE ENDOMETRIAL (TRIÂNGULO ANATÔMICO & CANAL CERVICAL) */}
              {/* ======================================================== */}
              {/* Mucosa Endometrial (Borda Espessa em Rosa/Vermelho) */}
              <path
                d="M 280,96
                   C 320,96 350,108 350,126
                   C 350,145 306,245 288,285
                   L 288,435
                   L 272,435
                   L 272,285
                   C 254,245 210,145 210,126
                   C 210,108 240,96 280,96 Z"
                fill="url(#coronalCavityGrad)"
                stroke="#E11D48"
                strokeWidth="2.5"
              />

              {/* Orifício Cervical Externo (Base do Colo) */}
              <ellipse cx="280" cy="435" rx="8" ry="3" fill="#E11D48" />

              {/* ======================================================== */}
              {/* NÓDULOS MIOMATOSOS (FIGO 0 A 8 + HÍBRIDO 2-5) */}
              {/* ======================================================== */}

              {/* FIGO 7: Subseroso Pediculado (Exteriorizado na serosa do fundo) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 7')}
              >
                {/* Haste / Pedículo */}
                <path d="M 175,70 Q 155,50 145,45" fill="none" stroke="#0284C7" strokeWidth="4" />
                <circle
                  cx="140"
                  cy="40"
                  r="15"
                  fill="#0284C7"
                  stroke={selectedType === 'FIGO 7' ? '#FFFFFF' : '#38BDF8'}
                  strokeWidth={selectedType === 'FIGO 7' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="140" y="44" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                  7
                </text>
              </g>

              {/* FIGO 6: Subseroso Séssil < 50% intramural (Abaulado para fora) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 6')}
              >
                <circle
                  cx="120"
                  cy="175"
                  r="18"
                  fill="#0EA5E9"
                  stroke={selectedType === 'FIGO 6' ? '#FFFFFF' : '#7DD3FC'}
                  strokeWidth={selectedType === 'FIGO 6' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="120" y="179" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  6
                </text>
              </g>

              {/* FIGO 5: Subseroso ≥ 50% intramural (Dentro do miométrio, abaulando serosa) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 5')}
              >
                <circle
                  cx="410"
                  cy="120"
                  r="19"
                  fill="#38BDF8"
                  stroke={selectedType === 'FIGO 5' ? '#FFFFFF' : '#0284C7'}
                  strokeWidth={selectedType === 'FIGO 5' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="410" y="124" fill="#0F172A" fontSize="11" fontWeight="bold" textAnchor="middle">
                  5
                </text>
              </g>

              {/* FIGO 4: Intramural Puro (100% no centro da parede miometrial) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 4')}
              >
                <circle
                  cx="375"
                  cy="195"
                  r="22"
                  fill="#D97706"
                  stroke={selectedType === 'FIGO 4' ? '#FFFFFF' : '#FDE68A'}
                  strokeWidth={selectedType === 'FIGO 4' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="375" y="199" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">
                  4
                </text>
              </g>

              {/* FIGO 3: Intramural tangenciando a mucosa (100% miometrial, toca endométrio) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 3')}
              >
                <circle
                  cx="235"
                  cy="190"
                  r="18"
                  fill="#F59E0B"
                  stroke={selectedType === 'FIGO 3' ? '#FFFFFF' : '#FEF3C7'}
                  strokeWidth={selectedType === 'FIGO 3' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="235" y="194" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  3
                </text>
              </g>

              {/* FIGO 2: Submucoso ≥ 50% intramural (Abaúla discretamente a cavidade) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 2')}
              >
                <circle
                  cx="245"
                  cy="255"
                  r="17"
                  fill="#FB7185"
                  stroke={selectedType === 'FIGO 2' ? '#FFFFFF' : '#FFE4E6'}
                  strokeWidth={selectedType === 'FIGO 2' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="245" y="259" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  2
                </text>
              </g>

              {/* FIGO 1: Submucoso < 50% intramural (Maior parte projeta na cavidade) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 1')}
              >
                <circle
                  cx="250"
                  cy="135"
                  r="16"
                  fill="#F43F5E"
                  stroke={selectedType === 'FIGO 1' ? '#FFFFFF' : '#FFE4E6'}
                  strokeWidth={selectedType === 'FIGO 1' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="250" y="139" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  1
                </text>
              </g>

              {/* FIGO 0: Submucoso Pediculado Intracavitário (Dentro do lúmen com pedículo) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 0')}
              >
                {/* Pedículo fino suspenso no fundo da cavidade */}
                <line x1="280" y1="96" x2="280" y2="160" stroke="#E11D48" strokeWidth="2.5" />
                <circle
                  cx="280"
                  cy="172"
                  r="15"
                  fill="#EF4444"
                  stroke={selectedType === 'FIGO 0' ? '#FFFFFF' : '#FFE4E6'}
                  strokeWidth={selectedType === 'FIGO 0' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="280" y="176" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  0
                </text>
              </g>

              {/* FIGO 8: Cervical (Anatomicamente posicionado no COLO UTERINO) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('FIGO 8')}
              >
                <circle
                  cx="305"
                  cy="405"
                  r="16"
                  fill="#8B5CF6"
                  stroke={selectedType === 'FIGO 8' ? '#FFFFFF' : '#EDE9FE'}
                  strokeWidth={selectedType === 'FIGO 8' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="305" y="409" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                  8
                </text>
              </g>

              {/* HÍBRIDO 2-5: Transmural (Ocupa toda a parede do miométrio, do endométrio à serosa) */}
              <g
                className="cursor-pointer transition-all"
                onClick={() => setSelectedType('Híbrido 2-5')}
              >
                <ellipse
                  cx="180"
                  cy="125"
                  rx="18"
                  ry="32"
                  transform="rotate(-20 180 125)"
                  fill="#EC4899"
                  stroke={selectedType === 'Híbrido 2-5' ? '#FFFFFF' : '#FCE7F3'}
                  strokeWidth={selectedType === 'Híbrido 2-5' ? '3' : '1.5'}
                  filter="url(#coronalNoduleShadow)"
                />
                <text x="178" y="129" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                  2-5
                </text>
              </g>
            </svg>
          </div>

          {/* Guia Rápido dos Nódulos para Seleção em Toque Rápido */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {FIGO_DATA.map((item) => {
              const isSelected = item.type === selectedType;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedType(item.type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {item.type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel Direito: Inspetor de Detalhes Clínicos e Cirúrgicos (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-4">
            {/* Título e Badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Nódulo Selecionado
                </span>
                <h4 className="text-lg font-black font-heading text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {selectedItem.type}
                </h4>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${selectedItem.badgeBg} ${selectedItem.badgeBorder} ${selectedItem.badgeText}`}
              >
                {selectedItem.category}
              </span>
            </div>

            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {selectedItem.title}
            </p>

            {/* Relação Anatômica */}
            <div className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 text-xs space-y-1">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Relação Anatômica Exata
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {selectedItem.depthDescription}
              </p>
            </div>

            {/* Repercussão Clínica */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                Repercussão Clínica Típica
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {selectedItem.clinicalImpact}
              </p>
            </div>

            {/* Conduta Cirúrgica Padrão-Ouro */}
            <div className="space-y-1 text-xs border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Conduta Cirúrgica Padrão-Ouro
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {selectedItem.surgicalPearls}
              </p>
            </div>

            {/* Pegadinha / Ponto Crítico de Banca */}
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 text-xs space-y-1">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Ponto Crítico de Prova
              </span>
              <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                {selectedItem.examClue}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
