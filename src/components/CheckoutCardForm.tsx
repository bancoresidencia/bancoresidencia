'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CardPayment } from '@mercadopago/sdk-react';
import type { ComponentProps } from 'react';

type Brick = ComponentProps<typeof CardPayment>;
interface Props {
  amount: number;
  email?: string;
  maxInstallments: number;
  dark: boolean;
  color: string;
  onSubmit: Brick['onSubmit'];
}

export function CheckoutCardForm({ amount, email, maxInstallments, dark, color, onSubmit }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const submit = useRef(onSubmit);
  useEffect(() => { submit.current = onSubmit; }, [onSubmit]);
  const handleSubmit = useCallback<Brick['onSubmit']>((data) => submit.current(data), []);
  const ready = useCallback(() => setState('ready'), []);
  const handleError = useCallback<NonNullable<Brick['onError']>>(error => {
    if (error.type === 'critical') setState('failed');
  }, []);
  const initialization = useMemo(() => ({ amount, payer: { email } }), [amount, email]);
  const customization = useMemo<Brick['customization']>(() => ({
    paymentMethods: { maxInstallments }, visual: { hideFormTitle: true,
      style: { theme: dark ? 'dark' : 'default', customVariables: { baseColor: color } } }
  }), [maxInstallments, dark, color]);
  useEffect(() => {
    if (state !== 'loading') return;
    const timer = setTimeout(() => setState('failed'), 20000);
    return () => clearTimeout(timer);
  }, [state, attempt]);
  if (state === 'failed') return <div role="alert">Não foi possível carregar o formulário de cartão.
    <button type="button" className="ml-2 underline" onClick={() => { setAttempt(n => n + 1); setState('loading'); }}>Tentar novamente</button></div>;
  return <>
    {state === 'loading' && <p role="status">Carregando formulário do cartão…</p>}
    <CardPayment key={attempt} initialization={initialization} customization={customization} locale="pt-BR"
      onReady={ready} onError={handleError} onSubmit={handleSubmit} />
  </>;
}
