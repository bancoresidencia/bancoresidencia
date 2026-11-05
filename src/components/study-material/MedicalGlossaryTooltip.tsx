'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, BookOpen, Stethoscope, ChevronRight } from 'lucide-react';
import { MedicalGlossaryEntry } from '@/types/studyMaterialAnnotations';

interface MedicalGlossaryTooltipProps {
  term: string;
  entry: MedicalGlossaryEntry;
  children: React.ReactNode;
}

export const MedicalGlossaryTooltip: React.FC<MedicalGlossaryTooltipProps> = ({
  term,
  entry,
  children
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 6,
        left: Math.max(16, Math.min(window.innerWidth - 300, rect.left + window.scrollX - 40))
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => setIsOpen(false);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const categoryLabels: Record<string, string> = {
    obstetricia: 'Obstetrícia',
    ginecologia: 'Ginecologia',
    cardiologia: 'Cardiologia',
    cirurgia: 'Cirurgia',
    pediatria: 'Pediatria',
    clinica: 'Clínica Médica',
    geral: 'Conceito Clínico'
  };

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="inline-flex items-baseline relative cursor-help decoration-zinc-400 dark:decoration-zinc-500 underline decoration-dotted underline-offset-4 hover:decoration-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
      title={`${entry.fullName} (Clique para ver a dica clínica)`}
    >
      {children}

      {isOpen && (
        <span
          className="fixed z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-left select-text animate-in fade-in zoom-in-95 duration-150"
          style={{
            top: `${coords.top - window.scrollY}px`,
            left: `${coords.left - window.scrollX}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho do Glossário */}
          <span className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="flex items-center gap-1.5 font-heading font-black text-xs text-zinc-900 dark:text-zinc-100">
              <Stethoscope className="w-3.5 h-3.5 text-amber-500" />
              {entry.term}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              {categoryLabels[entry.category] || entry.category}
            </span>
          </span>

          {/* Nome por extenso */}
          <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1 leading-snug">
            {entry.fullName}
          </span>

          {/* Definição clínica objetiva */}
          <span className="block text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed mb-2.5">
            {entry.definition}
          </span>

          {/* Dica de Prova de Residência */}
          {entry.examTip && (
            <span className="flex items-start gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="font-bold">Dica para Prova: </strong>
                {entry.examTip}
              </span>
            </span>
          )}
        </span>
      )}
    </span>
  );
};

