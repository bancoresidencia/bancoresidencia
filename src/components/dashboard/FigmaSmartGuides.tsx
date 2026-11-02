'use client';

import React from 'react';

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number; // Coordenada Y (se horizontal) ou X (se vertical) relativa ao grid
  start: number;    // Início da linha
  end: number;      // Fim da linha
  label?: string;   // Ex: 'Topo alinhado', 'Centro', 'Base'
  distance?: number; // Ex: 16 (px de gap)
}

interface FigmaSmartGuidesProps {
  guides: AlignmentGuide[];
  containerRect?: DOMRect | null;
}

export const FigmaSmartGuides: React.FC<FigmaSmartGuidesProps> = ({
  guides,
  containerRect
}) => {
  if (!containerRect && guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
      {/* LINHAS PONTILHADAS DE ALINHAMENTO ESTILO FIGMA / CANVA */}
      {guides.map((guide, idx) => {
        if (guide.type === 'horizontal') {
          return (
            <div
              key={`h-guide-${idx}`}
              className="absolute pointer-events-none flex items-center"
              style={{
                top: `${guide.position}px`,
                left: `${guide.start}px`,
                width: `${Math.max(10, guide.end - guide.start)}px`,
                transform: 'translateY(-50%)'
              }}
            >
              {/* Linha pontilhada horizontal fluorescente */}
              <div className="w-full h-0 border-t-2 border-dashed border-blue-500 dark:border-blue-400 opacity-90 shadow-sm" />

              {/* Tag / Badge de alinhamento inteligente */}
              {guide.label && (
                <span className="absolute left-1/2 -translate-x-1/2 -top-5 px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[9px] font-bold shadow-md whitespace-nowrap animate-in fade-in duration-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {guide.label}
                  {guide.distance !== undefined && ` (${guide.distance}px)`}
                </span>
              )}
            </div>
          );
        }

        // Guia Vertical
        return (
          <div
            key={`v-guide-${idx}`}
            className="absolute pointer-events-none flex flex-col items-center"
            style={{
              left: `${guide.position}px`,
              top: `${guide.start}px`,
              height: `${Math.max(10, guide.end - guide.start)}px`,
              transform: 'translateX(-50%)'
            }}
          >
            {/* Linha pontilhada vertical fluorescente */}
            <div className="h-full w-0 border-l-2 border-dashed border-blue-500 dark:border-blue-400 opacity-90 shadow-sm" />

            {/* Tag / Badge de alinhamento inteligente */}
            {guide.label && (
              <span className="absolute top-1/2 -translate-y-1/2 -left-6 -rotate-90 px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[9px] font-bold shadow-md whitespace-nowrap animate-in fade-in duration-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {guide.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
