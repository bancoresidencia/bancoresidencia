'use client';
import { useState } from 'react';
import { Check, Clock, Copy, Loader2, QrCode } from 'lucide-react';
interface Props {
  pixData: { qrCode?: string; qrCodeBase64?: string } | null;
  isSubmitting: boolean;
  generate: (cpf: string) => Promise<void>;
}
export function CheckoutPixForm({ pixData, isSubmitting, generate }: Props) {
  const [cpf, setCpf] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copyError, setCopyError] = useState(false);
  // Formatação de CPF para PIX
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(val);
  };


  async function handleCopyPix() {
    if (!pixData?.qrCode) return;
    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopyError(false);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    } catch { setCopyError(true); }
  }
  return (        <div className="space-y-4">
          {!pixData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  CPF do Titular (Exigido pelo Banco Central para PIX)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-500 space-y-1">

                <p>• A aprovação é imediata e libera todas as questões automaticamente.</p>
              </div>

              <button
                type="button"
                onClick={() => void generate(cpf)}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando QR Code Oficial...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    Gerar Código PIX
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Aguardando Pagamento no seu App do Banco...
              </div>

              {/* QR Code Imagem */}
              {pixData.qrCodeBase64 && (
                <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code PIX Banco Residência"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              )}

              {copyError && <p role="status">Selecione o código abaixo e copie manualmente.</p>}
              {/* Código Copia e Cola */}
              {pixData.qrCode && (
                <div className="space-y-2 text-left">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixData.qrCode}
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 shrink-0 hover:opacity-90 cursor-pointer"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>O sistema reconhecerá o pagamento em tempo real sem precisar recarregar.</span>
              </div>
            </div>
          )}
        </div>
);
}
