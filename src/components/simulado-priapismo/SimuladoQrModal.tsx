'use client';

import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface SimuladoQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const SimuladoQrModal: React.FC<SimuladoQrModalProps> = ({ isOpen, onClose, url }) => {
  const { accentConfig, mode } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const isDark = mode === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl transition-all"
        style={{
          backgroundColor: isDark ? '#111827' : '#ffffff',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
          >
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">QR Code de Acesso</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Escaneie com a câmera do celular</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 my-2 rounded-xl bg-white border border-slate-200 dark:border-slate-800 shadow-inner">
          <img
            src="/qr-priapismo.svg"
            alt="QR Code Simulado Priapismo"
            className="w-48 h-48 object-contain"
          />
          <span className="text-[11px] font-semibold text-slate-500 mt-2 tracking-wide uppercase">
            Acesso Direto • 2 Questões
          </span>
        </div>

        {/* URL Box */}
        <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="truncate flex-1 font-mono text-slate-700 dark:text-slate-300 select-all">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: copied ? '#10b981' : accentConfig.primaryHex,
              color: '#ffffff'
            }}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
