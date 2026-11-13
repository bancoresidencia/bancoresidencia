'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  circleColor?: string;
  letterColor?: string;
  showMonogramOnly?: boolean;
  glow?: boolean;
}

/**
 * Componente oficial de Logo em SVG do Hippocampus • Questões de Residência
 * Fiel 100% ao arquivo SVG original:
 * - Bordas retas perpendiculares (stroke-linecap="butt", sem arredondamento).
 * - Espessura canônica stroke-width="132" com stroke-miterlimit="10".
 * - Tipografia e espaçamentos exatos em linha única de hippocampus_completo.svg.
 */
export const Logo: React.FC<LogoProps> = ({
  size,
  className = 'w-8 h-8',
  circleColor,
  letterColor,
  showMonogramOnly = true,
  glow = false,
  style,
  ...props
}) => {
  const { accentConfig, accent, mode } = useTheme();

  const isDark = mode === 'dark';
  const isNeutral = accent === 'neutral';

  // Resolução dinâmica de cores: branco no modo escuro, chumbo no claro, ou acento
  const resolvedColor =
    letterColor ||
    circleColor ||
    (isNeutral
      ? isDark
        ? '#ffffff'
        : '#09090b'
      : accentConfig?.primaryHex || (isDark ? '#ffffff' : '#09090b'));

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
        filter: `drop-shadow(0 4px 16px ${accentConfig?.bgRgba || 'rgba(255, 255, 255, 0.25)'})`
      }
    : {};

  if (showMonogramOnly) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2160 1920"
        className={`shrink-0 select-none ${className}`}
        style={{ ...sizeStyle, ...glowStyle, ...style }}
        aria-label="Hippocampus"
        role="img"
        {...props}
      >
        <g id="Hippocampus_Symbol">
          {/* Linha 2: Externa (Calota craniana) - Bordas retas originais */}
          <path
            d="M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094"
            fill="none"
            stroke={resolvedColor}
            strokeWidth="132"
            strokeMiterlimit="10"
            strokeLinecap="butt"
            className="transition-colors duration-200"
          />
          {/* Linha 1: Interna (Giro do hipocampo) - Bordas retas originais */}
          <path
            d="M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282"
            fill="none"
            stroke={resolvedColor}
            strokeWidth="132"
            strokeMiterlimit="10"
            strokeLinecap="butt"
            className="transition-colors duration-200"
          />
        </g>
      </svg>
    );
  }

  // Modo Completo: Símbolo + Nome em Linha Única (Fiel ao SVG oficial)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 7034.06 1920"
      className={`shrink-0 select-none ${className}`}
      style={{ ...sizeStyle, ...glowStyle, ...style }}
      aria-label="Hippocampus • Questões de Residência"
      role="img"
      {...props}
    >
      <g id="Hippocampus_Full">
        {/* Linha 1: Interna - Bordas retas originais */}
        <path
          d="M807.546 906.921 C971.51 405.986 1791.69 702.375 1632.222 1022.75 C1462.544 1363.638 1138.814 860.221 931.533 1632.282"
          fill="none"
          stroke={resolvedColor}
          strokeWidth="132"
          strokeMiterlimit="10"
          strokeLinecap="butt"
          className="transition-colors duration-200"
        />
        {/* Linha 2: Externa - Bordas retas originais */}
        <path
          d="M942.839 1157.092 C762.021 1042.009 511.607 1191.281 387.139 1070.475 C273.093 959.785 450.853 674.876 450.853 674.876 C764.156 161.911 1446.599 222.808 1759.799 488.16 C2449.803 1072.751 1359.562 1971.842 1359.562 1336.094"
          fill="none"
          stroke={resolvedColor}
          strokeWidth="132"
          strokeMiterlimit="10"
          strokeLinecap="butt"
          className="transition-colors duration-200"
        />
        {/* Nome da Marca - Matriz exata do SVG */}
        <text
          transform="matrix(58.865 0 0 58.865 2263.296 1058.395)"
          x="0"
          y="0"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          fontSize="12px"
          fontWeight="bold"
          letterSpacing="-0.6px"
          fill={resolvedColor}
        >
          Hippocampus
        </text>
        {/* Subtítulo em Linha Única - Matriz exata do SVG */}
        <text
          transform="matrix(17.244 0 0 17.244 2293.201 1417.919)"
          x="0"
          y="0"
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          fontSize="12px"
          fontWeight="200"
          letterSpacing="1.56px"
          fill={isDark ? '#d4d4d8' : '#52525b'}
        >
          QUESTÕES DE RESIDÊNCIA
        </text>
      </g>
    </svg>
  );
};

export default Logo;
