'use client';

import React, { useId } from 'react';
import { AccentConfig, ThemeMode } from '@/context/ThemeContext';

interface HeroLogo3DProps {
  accentConfig: AccentConfig;
  mode: ThemeMode;
  isMonochrome: boolean;
  scrollOffset: number;
}

const OUTER_PATH_D =
  'M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094';

const INNER_PATH_D =
  'M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282';

/**
 * Renders a large, translucent glass-like 3D version of hippotalamus.svg
 * with dynamic theme gradients, beveled specular rims, and scroll-linked 3D motion.
 */
export const HeroLogo3D: React.FC<HeroLogo3DProps> = ({
  accentConfig,
  mode,
  isMonochrome,
  scrollOffset
}) => {
  const rawId = useId();
  const safeId = rawId.replace(/:/g, '');
  const outerGlassId = `hippo-outer-glass-${safeId}`;
  const innerGlassId = `hippo-inner-glass-${safeId}`;
  const rimGradId = `hippo-rim-glass-${safeId}`;
  const specGradId = `hippo-spec-glass-${safeId}`;

  const gradStart = isMonochrome
    ? mode === 'dark'
      ? '#f4f4f5'
      : '#27272a'
    : accentConfig.primaryHex;

  const gradMid = isMonochrome
    ? mode === 'dark'
      ? '#a1a1aa'
      : '#52525b'
    : accentConfig.chartPalette[1] ?? accentConfig.hoverHex;

  const gradEnd = isMonochrome
    ? mode === 'dark'
      ? '#71717a'
      : '#71717a'
    : accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex;

  const glassBodyOpacity = mode === 'dark' ? 0.56 : 0.48;
  const glassMidOpacity = mode === 'dark' ? 0.42 : 0.34;
  const rimOpacity = mode === 'dark' ? 0.28 : 0.65;
  const specTopOpacity = mode === 'dark' ? 0.62 : 0.88;

  // Continuação suave da rotação 3D conforme o scroll do mouse
  const scrollRotateY = (scrollOffset * 0.045).toFixed(2);
  const scrollRotateX = (scrollOffset * -0.024).toFixed(2);
  const scrollTranslateY = (scrollOffset * 0.03).toFixed(2);

  return (
    <div
      className="relative w-full flex items-center justify-center select-none pointer-events-none"
      style={{ perspective: '1050px' }}
      aria-hidden="true"
    >
      {/* Aura luminosa refratária atrás do vidro */}
      <div
        className="absolute w-72 h-60 sm:w-96 sm:h-80 rounded-full blur-[78px] opacity-30 dark:opacity-35 transition-colors duration-500"
        style={{
          background: isMonochrome
            ? mode === 'dark'
              ? 'radial-gradient(circle, rgba(255,255,255,0.38) 0%, transparent 72%)'
              : 'radial-gradient(circle, rgba(24,24,27,0.22) 0%, transparent 72%)'
            : `radial-gradient(circle, ${accentConfig.primaryHex} 0%, transparent 72%)`
        }}
      />

      {/* Wrapper controlado pelo scroll */}
      <div
        className="relative will-change-transform transition-transform duration-150 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate3d(0, ${scrollTranslateY}px, 0) rotateY(${scrollRotateY}deg) rotateX(${scrollRotateX}deg)`
        }}
      >
        {/* Palco 3D ampliado em loop contínuo */}
        <div className="relative w-[300px] h-[252px] sm:w-[375px] sm:h-[315px] lg:w-[435px] lg:h-[365px] animate-hippo-3d-float">
          {/* 1. Refração/sombra profunda atrás do vidro (Z negativo) */}
          <svg
            viewBox="185 210 1790 1500"
            className="absolute inset-0 w-full h-full overflow-visible opacity-35 dark:opacity-45 blur-[8px]"
            style={{ transform: 'translateZ(-26px)' }}
            shapeRendering="geometricPrecision"
          >
            <path
              d={OUTER_PATH_D}
              fill="none"
              stroke={gradStart}
              strokeWidth={140}
              strokeMiterlimit={10}
            />
            <path
              d={INNER_PATH_D}
              fill="none"
              stroke={gradEnd}
              strokeWidth={140}
              strokeMiterlimit={10}
            />
          </svg>

          {/* 2. Corpo externo em vidro translúcido + borda biselada (Z = 0) */}
          <svg
            viewBox="185 210 1790 1500"
            className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_18px_36px_rgba(0,0,0,0.14)] dark:drop-shadow-[0_22px_42px_rgba(0,0,0,0.58)]"
            style={{ transform: 'translateZ(0px)' }}
            shapeRendering="geometricPrecision"
          >
            <defs>
              <linearGradient id={outerGlassId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradStart} stopOpacity={glassBodyOpacity} />
                <stop offset="50%" stopColor={gradMid} stopOpacity={glassMidOpacity} />
                <stop offset="100%" stopColor={gradEnd} stopOpacity={glassBodyOpacity} />
              </linearGradient>
              <linearGradient id={rimGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={rimOpacity} />
                <stop offset="50%" stopColor="#ffffff" stopOpacity={rimOpacity * 0.25} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={rimOpacity * 0.85} />
              </linearGradient>
              <linearGradient id={specGradId} x1="0%" y1="0%" x2="100%" y2="95%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={specTopOpacity} />
                <stop offset="45%" stopColor="#ffffff" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={specTopOpacity * 0.65} />
              </linearGradient>
            </defs>

            {/* Borda externa cristalina */}
            <path
              d={OUTER_PATH_D}
              fill="none"
              stroke={`url(#${rimGradId})`}
              strokeWidth={140}
              strokeMiterlimit={10}
            />
            {/* Massa translúcida de vidro */}
            <path
              d={OUTER_PATH_D}
              fill="none"
              stroke={`url(#${outerGlassId})`}
              strokeWidth={130}
              strokeMiterlimit={10}
            />
            {/* Reflexo especular interno ao longo da curva externa */}
            <path
              d={OUTER_PATH_D}
              fill="none"
              stroke={`url(#${specGradId})`}
              strokeWidth={32}
              strokeMiterlimit={10}
              transform="translate(-12 -14)"
            />
          </svg>

          {/* 3. Corpo interno em vidro translúcido elevado no eixo Z (+22px) */}
          <svg
            viewBox="185 210 1790 1500"
            className="absolute inset-0 w-full h-full overflow-visible drop-shadow-[0_14px_26px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_18px_32px_rgba(0,0,0,0.52)]"
            style={{ transform: 'translateZ(22px)' }}
            shapeRendering="geometricPrecision"
          >
            <defs>
              <linearGradient id={innerGlassId} x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor={gradEnd} stopOpacity={glassBodyOpacity} />
                <stop offset="50%" stopColor={gradMid} stopOpacity={glassMidOpacity} />
                <stop offset="100%" stopColor={gradStart} stopOpacity={glassBodyOpacity} />
              </linearGradient>
            </defs>

            {/* Borda externa cristalina */}
            <path
              d={INNER_PATH_D}
              fill="none"
              stroke={`url(#${rimGradId})`}
              strokeWidth={140}
              strokeMiterlimit={10}
            />
            {/* Massa translúcida de vidro */}
            <path
              d={INNER_PATH_D}
              fill="none"
              stroke={`url(#${innerGlassId})`}
              strokeWidth={130}
              strokeMiterlimit={10}
            />
            {/* Reflexo especular interno */}
            <path
              d={INNER_PATH_D}
              fill="none"
              stroke={`url(#${specGradId})`}
              strokeWidth={30}
              strokeMiterlimit={10}
              transform="translate(-10 -12)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
