'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';

export function extractClipboardImageFile(e: React.ClipboardEvent): File | null {
  const items = e.clipboardData?.items;
  if (!items) return null;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}

export async function uploadFlashcardImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/flashcards/upload-media', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success || !data.publicUrl) {
    throw new Error(data.error || 'Falha ao enviar imagem.');
  }
  return String(data.publicUrl);
}

interface FlashcardImageFieldProps {
  label: string;
  imageUrl?: string | null;
  onChange: (url: string | null) => void;
  compact?: boolean;
}

export const FlashcardImageField: React.FC<FlashcardImageFieldProps> = ({
  label,
  imageUrl,
  onChange,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setIsUploading(true);
    try {
      const publicUrl = await uploadFlashcardImageFile(file);
      onChange(publicUrl);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handlePasteBox = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const file = extractClipboardImageFile(e);
    if (file) {
      e.preventDefault();
      void handleFile(file);
    }
  };

  return (
    <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
          {label}
        </span>
        {imageUrl && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setErrorMsg(null);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remover imagem</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      {imageUrl ? (
        <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-2 flex items-center gap-3">
          <img
            src={imageUrl}
            alt={label}
            className={`${compact ? 'h-16 w-20' : 'h-24 w-32'} object-contain rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 shrink-0`}
          />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Imagem WebP pronta
            </p>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Enviando...' : 'Trocar imagem'}
            </button>
          </div>
        </div>
      ) : (
        <div
          tabIndex={0}
          onPaste={handlePasteBox}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f && f.type.startsWith('image/')) {
              void handleFile(f);
            }
          }}
          onClick={() => {
            if (!isUploading) inputRef.current?.click();
          }}
          className={`rounded-xl border border-dashed ${
            compact ? 'px-3 py-2' : 'px-3 py-3'
          } flex items-center justify-center gap-2 text-[11px] cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
              : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-900/40 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-400'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Convertendo para WebP...</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-3.5 h-3.5 shrink-0" />
              <span>Clique, arraste ou cole (Ctrl+V) uma imagem (ECG, RX, foto...)</span>
            </>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] font-semibold text-rose-500">{errorMsg}</p>
      )}
    </div>
  );
};
