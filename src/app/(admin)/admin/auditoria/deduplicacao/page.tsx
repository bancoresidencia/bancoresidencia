'use client';

import React from 'react';
import { ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AdminAuditoriaDeduplicacaoPage() {
  const iframeUrl = 'http://localhost:3335/admin/auditoria/deduplicacao';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-950 text-slate-100">
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">Quarentena & Deduplicação Canônica (Frente 1)</span>
          <span className="text-slate-400">• Servidor Ativo na porta 3335</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const ifr = document.getElementById('dedupFrame') as HTMLIFrameElement;
              if (ifr) ifr.src = ifr.src;
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Recarregar</span>
          </button>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
          >
            <span>Abrir em Nova Aba</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-950 relative">
        <iframe
          id="dedupFrame"
          src={iframeUrl}
          className="w-full h-full border-0"
          title="Painel de Auditoria e Deduplicação"
        />
      </div>
    </div>
  );
}

