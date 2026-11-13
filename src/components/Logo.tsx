'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'symbol' | 'full';
  size?: number | string;
  color?: string;
  glow?: boolean;
  // Props de retrocompatibilidade
  circleColor?: string;
  letterColor?: string;
  showMonogramOnly?: boolean;
}

// 1. Vetores exatos do símbolo isolado (hippotalamus.svg) — coordenadas e distâncias originais
const PATH_SYMBOL_1 =
  'M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282';
const PATH_SYMBOL_2 =
  'M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094';

// 2. Vetores exatos da logo completa (hippocampus_completo.svg) — distâncias originais em relação ao texto
const PATH_FULL_1 =
  'M807.546 906.921 C971.51 405.986 1791.69 702.375 1632.222 1022.75 C1462.544 1363.638 1138.814 860.221 931.533 1632.282';
const PATH_FULL_2 =
  'M942.839 1157.092 C762.021 1042.009 511.607 1191.281 387.139 1070.475 C273.093 959.785 450.853 674.876 450.853 674.876 C764.156 161.911 1446.599 222.808 1759.799 488.16 C2449.803 1072.751 1359.562 1971.842 1359.562 1336.094';

/**
 * Componente oficial da identidade visual Hippocampus.
 * Renderiza fielmente os vetores da marca sem alteração de geometria, cantos ou distâncias.
 * - variant='symbol': Símbolo isolado (viewBox 0 0 2160 1920)
 * - variant='full': Lockup completo horizontal (viewBox 0 0 7034.06 1920)
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'symbol',
  size,
  className = 'w-9 h-9',
  color,
  circleColor,
  letterColor,
  glow = false,
  style,
  ...props
}) => {
  const { accentConfig, mode } = useTheme();
  const isDark = mode === 'dark';

  // Resolução de cor preservando fidelidade e adaptação instantânea ao tema via currentColor
  const strokeColor = color || letterColor || circleColor || 'currentColor';
  const fillColor = color || letterColor || circleColor || 'currentColor';

  const sizeStyle: React.CSSProperties = size
    ? {
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      minWidth: typeof size === 'number' ? `${size}px` : size,
      minHeight: typeof size === 'number' ? `${size}px` : size
    }
    : {};

  const glowStyle: React.CSSProperties = glow
    ? {
      filter: `drop-shadow(0 6px 18px ${accentConfig?.bgRgba || 'rgba(37, 99, 235, 0.28)'})`
    }
    : {};

  if (variant === 'full') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 7150 1920"
        className={`shrink-0 select-none text-zinc-950 dark:text-white ${className}`}
        style={{ ...sizeStyle, ...glowStyle, ...style }}
        aria-label="Hippocampus — Questões de Residência"
        role="img"
        {...props}
      >
        <g id="Layer_1" data-name="Layer 1">
          <path
            d={PATH_FULL_1}
            fill="none"
            stroke={strokeColor}
            strokeWidth="132"
            strokeMiterlimit="10"
            className="transition-colors duration-200"
          />
          <path
            d={PATH_FULL_2}
            fill="none"
            stroke={strokeColor}
            strokeWidth="132"
            strokeMiterlimit="10"
            className="transition-colors duration-200"
          />
          {/* Nome Hippocampus aumentado e calibrado para maior presença e força visual */}
          <text
            transform="matrix(63 0 0 63 2263.296 1050)"
            x="0"
            y="0"
            xmlSpace="preserve"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 'bold',
              fill: fillColor,
              letterSpacing: '-0.6px'
            }}
            className="transition-colors duration-200"
          >
            <tspan x="0" y="0">Hippocampus</tspan>
          </text>
          {/* Subtítulo Questões de Residência proporcionalmente ajustado e em Regular (400) */}
          <text
            transform="matrix(17.5 0 0 17.5 2293.201 1385)"
            x="0"
            y="0"
            xmlSpace="preserve"
            style={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 400,
              fill: fillColor,
              letterSpacing: '1.56px'
            }}
            className="transition-colors duration-200"
          >
            <tspan x="0" y="0">QUESTÕES DE RESIDÊNCIA</tspan>
          </text>
        </g>
      </svg>
    );
  }

  // Símbolo isolado (puro, sem círculo envolvente)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2160 1920"
      className={`shrink-0 select-none text-zinc-950 dark:text-white ${className}`}
      style={{ ...sizeStyle, ...glowStyle, ...style }}
      aria-label="Hippocampus"
      role="img"
      {...props}
    >
      <g id="Layer_1" data-name="Layer 1">
        <path
          d={PATH_SYMBOL_1}
          fill="none"
          stroke={strokeColor}
          strokeWidth="132"
          strokeMiterlimit="10"
          className="transition-colors duration-200"
        />
        <path
          d={PATH_SYMBOL_2}
          fill="none"
          stroke={strokeColor}
          strokeWidth="132"
          strokeMiterlimit="10"
          className="transition-colors duration-200"
        />
      </g>
    </svg>
  );
};

export default Logo;
