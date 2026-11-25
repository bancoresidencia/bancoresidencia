import type { CSSProperties } from 'react';
import type { AccentConfig, ThemeMode } from '@/context/ThemeContext';

/**
 * Generates the gradient style for animated `.animate-hippo-text-sweep` headline spans
 * with proper contrast across both light and dark modes (including monochrome).
 */
export function getLandingHighlightTextStyle(
  accentConfig: AccentConfig,
  mode: ThemeMode,
  isMonochrome: boolean
): CSSProperties {
  if (isMonochrome) {
    return {
      backgroundImage:
        mode === 'dark'
          ? 'linear-gradient(110deg, rgba(255,255,255,0.92) 0%, rgba(161,161,170,0.72) 28%, rgba(255,255,255,1) 50%, rgba(113,113,122,0.76) 76%, rgba(255,255,255,0.92) 100%)'
          : 'linear-gradient(110deg, rgba(9,9,11,0.92) 0%, rgba(82,82,91,0.74) 28%, rgba(9,9,11,1) 50%, rgba(113,113,122,0.78) 76%, rgba(9,9,11,0.92) 100%)'
    };
  }

  const secondaryStop = accentConfig.chartPalette[1] ?? accentConfig.hoverHex;
  const shimmerCenterStop =
    mode === 'dark' ? 'rgba(224,242,254,0.95)' : accentConfig.hoverHex;
  const tertiaryStop = accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex;

  return {
    backgroundImage: `linear-gradient(110deg, ${accentConfig.primaryHex} 0%, ${secondaryStop} 26%, ${shimmerCenterStop} 48%, ${tertiaryStop} 68%, ${accentConfig.primaryHex} 100%)`
  };
}
