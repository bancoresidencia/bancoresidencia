'use client';

import React, { useState, useEffect } from 'react';

interface DigitColumnProps {
  targetDigit: number; // 0 a 9
  spinning: boolean;
  delayMs?: number;
  durationMs?: number;
  color?: string;
}

// 2 ciclos completos de 0 a 9 para dar inércia mecânica real ao giro
const DIGIT_REEL_CYCLES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9
];

function DigitColumn({
  targetDigit,
  spinning,
  delayMs = 0,
  durationMs = 1800,
  color
}: DigitColumnProps) {
  // O alvo final trava no segundo ciclo (índice 10 + targetDigit)
  const targetIndex = 10 + Math.min(Math.max(targetDigit, 0), 9);
  const totalCount = DIGIT_REEL_CYCLES.length;
  const translateYPercent = spinning ? (targetIndex / totalCount) * 100 : 0;

  return (
    <span
      className="inline-block overflow-hidden align-baseline select-none"
      style={{
        height: '0.92em',
        lineHeight: '0.92em',
        color: color || 'inherit'
      }}
    >
      <span
        className="inline-flex flex-col will-change-transform"
        style={{
          transform: `translateY(-${translateYPercent}%)`,
          transitionProperty: 'transform',
          transitionDuration: `${durationMs}ms`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: `${delayMs}ms`
        }}
      >
        {DIGIT_REEL_CYCLES.map((val, idx) => (
          <span
            key={idx}
            className="flex items-center justify-center select-none"
            style={{
              height: '0.92em',
              lineHeight: '0.92em'
            }}
          >
            {val}
          </span>
        ))}
      </span>
    </span>
  );
}

export function OdometerReel({
  color,
  className = '',
  style
}: {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [spinKey, setSpinKey] = useState(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    // Reseta estado para garantir novo ciclo de animação a cada spinKey
    setSpinning(false);

    const timer = setTimeout(() => setSpinning(true), 150);
    return () => clearTimeout(timer);
  }, [spinKey]);

  const handleReSpin = () => {
    setSpinKey((prev) => prev + 1);
  };

  const activeColor = color || 'inherit';

  return (
    <span
      key={spinKey}
      onClick={handleReSpin}
      style={{
        color: activeColor,
        ...style
      }}
      className={`inline-flex items-baseline font-bebas tracking-wide select-none cursor-pointer ${className}`}
      title="Clique para girar o odômetro novamente"
    >
      <span style={{ color: activeColor }}>+</span>
      <DigitColumn targetDigit={1} spinning={spinning} delayMs={50} durationMs={1600} color={activeColor} />
      <DigitColumn targetDigit={3} spinning={spinning} delayMs={160} durationMs={1900} color={activeColor} />
      <DigitColumn targetDigit={0} spinning={spinning} delayMs={270} durationMs={2200} color={activeColor} />
      <span className="ml-2.5" style={{ color: activeColor }}>MIL</span>
    </span>
  );
}
