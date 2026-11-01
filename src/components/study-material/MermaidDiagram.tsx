'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Maximize2, Minimize2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface MermaidDiagramProps {
  code: string;
  title?: string;
  className?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  code,
  title,
  className = ''
}) => {
  const { mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';

  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function renderMermaid() {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          fontFamily: 'inherit',
          theme: isDark ? 'dark' : 'default',
          themeVariables: isDark
            ? {
                darkMode: true,
                background: '#121215',
                primaryColor: '#1E293B',
                primaryTextColor: '#F1F5F9',
                primaryBorderColor: '#475569',
                lineColor: '#94A3B8',
                secondaryColor: '#0F172A',
                tertiaryColor: '#18181B',
                nodeBorder: '#475569',
                mainBkg: '#18181B',
                clusterBkg: '#121215',
                titleColor: '#F8FAFC',
                edgeLabelBackground: '#18181B',
                actorBkg: '#1E293B',
                actorBorder: '#475569',
                actorTextColor: '#F1F5F9',
                labelColor: '#F1F5F9',
                fontFamily: 'inherit'
              }
            : {
                darkMode: false,
                background: '#FFFFFF',
                primaryColor: '#F1F5F9',
                primaryTextColor: '#0F172A',
                primaryBorderColor: '#CBD5E1',
                lineColor: '#475569',
                secondaryColor: '#F8FAFC',
                tertiaryColor: '#F1F5F9',
                nodeBorder: '#CBD5E1',
                mainBkg: '#FFFFFF',
                clusterBkg: '#F8FAFC',
                titleColor: '#0F172A',
                edgeLabelBackground: '#FFFFFF',
                labelColor: '#0F172A',
                fontFamily: 'inherit'
              }
        });

        // Gera id único alfanumérico estrito
        const cleanId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(cleanId, code.trim());

        if (isMounted) {
          setSvgHtml(svg);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : 'Falha ao renderizar diagrama Mermaid';
          console.warn('[MermaidDiagram] Render warning:', errMsg);
          setError(errMsg);
          setIsLoading(false);
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [code, isDark]);

  return (
    <>
      <div
        className={`my-6 rounded-2xl border transition-all overflow-hidden ${
          isDark
            ? 'bg-[#121215] border-zinc-800/90 shadow-sm'
            : 'bg-white border-zinc-200/90 shadow-xs'
        } ${className}`}
      >
        {/* Barra superior de identificação e controles */}
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/70 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: accentConfig.primaryHex }}
            />
            <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 opacity-70" />
              {title || 'Esquema Visual de Estudo'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {svgHtml && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Expandir diagrama em tela cheia"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Expandir</span>
              </button>
            )}
          </div>
        </div>

        {/* Área de conteúdo do SVG */}
        <div className="p-4 sm:p-6 overflow-x-auto flex items-center justify-center min-h-[140px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2.5 py-8 text-zinc-400 dark:text-zinc-500">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Renderizando figura do resumo...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="w-full p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Diagrama esquemático</span>
              </div>
              <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-200 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          )}

          {!isLoading && !error && svgHtml && (
            <div
              ref={containerRef}
              className="w-full flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:mx-auto"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          )}
        </div>
      </div>

      {/* Modal Expandido em Tela Cheia */}
      {isExpanded && svgHtml && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-8 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-2xl">
            {/* Cabeçalho do Modal */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                />
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {title || 'Visualização Ampliada do Esquema'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Fechar"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo com Zoom e Scroll livre */}
            <div className="flex-1 overflow-auto p-6 sm:p-10 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/50">
              <div
                className="w-full flex items-center justify-center [&_svg]:w-full [&_svg]:max-w-4xl [&_svg]:h-auto [&_svg]:mx-auto"
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
