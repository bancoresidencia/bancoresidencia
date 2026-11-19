'use client';

import { useFormStatus } from 'react-dom';

export function ConfirmEmailButton({ className }: { className: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? 'Confirmando…' : 'Confirmar e-mail'}
    </button>
  );
}
