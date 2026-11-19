'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';

const RESEND_INTERVAL_MS = 60_000;
const RESEND_MESSAGE = 'Se houver uma confirmação pendente, você receberá um novo link.';

interface EmailConfirmationPendingProps {
  email: string;
  justRegistered: boolean;
  onEdit: () => void;
  onLogin: () => void;
  onClose?: () => void;
}

export function EmailConfirmationPending({
  email, justRegistered, onEdit, onLogin, onClose
}: EmailConfirmationPendingProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [cooldown, setCooldown] = useState(justRegistered);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => heading.current?.focus(), []);

  useEffect(() => {
    if (!cooldown) return;

    const timeout = window.setTimeout(() => setCooldown(false), RESEND_INTERVAL_MS);
    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  async function resend() {
    setSending(true);
    setMessage('');

    try {
      const { error } = await createClient().auth.resend({ type: 'signup', email });
      if (error?.status === 429) {
        setCooldown(true);
        setMessage('Aguarde um minuto para pedir outro link.');
      } else if (error && (!error.status || error.status >= 500)) {
        setMessage('O serviço de envio está indisponível. Tente novamente em instantes.');
      } else {
        setCooldown(true);
        setMessage(RESEND_MESSAGE);
      }
    } catch {
      setMessage('O serviço de envio está indisponível. Tente novamente em instantes.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-labelledby="email-confirmation-heading" className="w-full space-y-4 rounded-2xl border border-zinc-200 bg-[var(--bg-card)] p-5 text-[var(--foreground)] shadow-2xl dark:border-zinc-800 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <Logo variant="full" className="h-10 w-auto max-w-[220px]" />
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-lg hover:bg-zinc-500/10">
            <X aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        <h2 id="email-confirmation-heading" ref={heading} tabIndex={-1} className="text-xl font-bold focus:outline-none">Confirme seu e-mail</h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Se o cadastro estiver pendente, você receberá um link em <strong className="break-all">{email}</strong>. Confira também a pasta de spam.
        </p>
      </div>
      <button type="button" onClick={resend} disabled={sending || cooldown} className="min-h-11 w-full cursor-pointer rounded-xl bg-[var(--primary-color)] px-4 text-sm font-semibold text-[var(--primary-contrast)] enabled:hover:bg-[var(--primary-hover)] disabled:cursor-default disabled:opacity-60">
        {sending ? 'Reenviando…' : 'Reenviar e-mail'}
      </button>
      <p role="status" className="text-sm text-zinc-600 empty:hidden dark:text-zinc-300">
        {message || (cooldown ? 'Você pode pedir outro link em um minuto.' : '')}
      </p>
      <div className="flex flex-wrap gap-x-4">
        <button type="button" onClick={onEdit} className="min-h-11 cursor-pointer rounded-sm text-sm font-medium hover:underline">Corrigir e-mail</button>
        {justRegistered && (
          <button type="button" onClick={onLogin} className="min-h-11 cursor-pointer rounded-sm text-sm font-medium hover:underline">Já confirmei, quero entrar</button>
        )}
      </div>
    </section>
  );
}
