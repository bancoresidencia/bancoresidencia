'use client';

import React, { useState } from 'react';
import { Sliders, Palette, ArrowRight } from 'lucide-react';
import { getPercentileColor, PercentileTier } from '@/utils/percentile';

interface PercentileColorTesterProps {
  currentPercentile?: number | null;
  onSelectTestPercentile?: (percentile: number) => void;
  inline?: boolean;
}

export const PercentileColorTester: React.FC<PercentileColorTesterProps> = ({
  currentPercentile = 78,
  onSelectTestPercentile
}) => {
  const [testPercentile, setTestPercentile] = useState<number>(
    typeof currentPercentile === 'number' ? currentPercentile : 78
  );

  const activeTier: PercentileTier = getPercentileColor(testPercentile);

  const handlePercentileChange = (val: number) => {
    setTestPercentile(val);
    if (onSelectTestPercentile) {
      onSelectTestPercentile(val);
    }
  };

  const presetTiers = [
    { p: 15, range: '0 - 30', hex: '#603027', label: 'Bronze' },
    { p: 42, range: '30 - 50', hex: '#CE8946', label: 'Cobre' },
    { p: 62, range: '50 - 70', hex: '#C4C4C4', label: 'Prata' },
    { p: 78, range: '70 - 85', hex: '#FFD700', label: 'Ouro' },
    { p: 88, range: '85 - 90', hex: '#6AE88B', label: 'Esmeralda' },
    { p: 94, range: '90 - 97', hex: '#00E5FF', label: 'Diamante' },
    { p: 99, range: '98 - 99', hex: '#FF1E44', label: 'Elite' },
  ];

  return (
    <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-md"
            style={{
              backgroundColor: activeTier.bgRgba,
              borderColor: activeTier.color,
              borderWidth: '1.5px',
              color: activeTier.textContrast
            }}
          >
            <Palette className="w-5 h-5" style={{ color: activeTier.textContrast }} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Laboratório Interativo de Cores de Percentil
              <span
                className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase transition-all shadow-xs"
                style={{
                  backgroundColor: activeTier.bgRgba,
                  color: activeTier.textContrast,
                  borderColor: activeTier.borderRgba,
                  borderWidth: '1px'
                }}
              >
                {activeTier.color}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Faixas cromáticas oficiais calibradas estritamente de acordo com as especificações da plataforma.
            </p>
          </div>
        </div>

        {/* Botão de Aplicar para Todo o Sistema */}
        {onSelectTestPercentile && (
          <button
            onClick={() => onSelectTestPercentile(testPercentile)}
            className="self-start sm:self-auto text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 hover:scale-102 active:scale-98"
            style={{
              backgroundColor: activeTier.color,
              color: ['#FFD700', '#6AE88B', '#C4C4C4', '#00E5FF'].includes(activeTier.color) ? '#090d16' : '#ffffff'
            }}
          >
            <span>Aplicar P{testPercentile} ({activeTier.name})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid com os 7 Tiers Pré-definidos */}
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Tiers Oficiais Calibrados (Clique para testar)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {presetTiers.map((tier) => {
            const isSelected = getPercentileColor(tier.p).color === activeTier.color;

            return (
              <button
                key={tier.range}
                onClick={() => handlePercentileChange(tier.p)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-24 relative overflow-hidden group shadow-xs ${
                  isSelected
                    ? 'border-slate-900 dark:border-white shadow-md scale-102 bg-slate-50 dark:bg-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="w-4 h-4 rounded-full border shadow-sm transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: tier.hex,
                      borderColor: 'rgba(255, 255, 255, 0.4)'
                    }}
                  />
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {tier.hex}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    P{tier.p} • {tier.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Faixa {tier.range}
                  </div>
                </div>

                {isSelected && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: tier.hex }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slider Interativo de 0 a 99 */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Ajuste Fino de Percentil: <strong className="text-slate-900 dark:text-white font-mono text-sm ml-1">P{testPercentile}</strong>
            </span>
          </div>
          <span
            className="text-xs font-mono font-bold px-3 py-1 rounded-full border shadow-xs"
            style={{
              backgroundColor: activeTier.bgRgba,
              borderColor: activeTier.color,
              color: activeTier.textContrast
            }}
          >
            {activeTier.name} • Faixa {activeTier.rangeLabel}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="99"
          value={testPercentile}
          onChange={(e) => handlePercentileChange(Number(e.target.value))}
          className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
          style={{
            accentColor: activeTier.color
          }}
        />

        <div className="flex justify-between text-[11px] text-slate-400 font-mono font-medium">
          <span>0 (Min)</span>
          <span>P30 (Bronze)</span>
          <span>P50 (Cobre)</span>
          <span>P70 (Prata)</span>
          <span>P85 (Ouro)</span>
          <span>P90 (Esmeralda)</span>
          <span>99 (Elite)</span>
        </div>
      </div>
    </div>
  );
};
