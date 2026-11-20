'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
export function useCheckoutTracker(planId: string, paymentMethod: 'pix' | 'card', couponCode: string,
  setPaymentMethod: (method: 'pix' | 'card') => void, setErrorMessage: (message: string) => void) {
  const { user, refreshUser } = useAuth();
  const [pixData, setPixData] = useState<{
    qrCode?: string;
    qrCodeBase64?: string;
    ticketUrl?: string;
    paymentId?: string;
  } | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const storageKey = 'checkout:' + user?.id + ':' + planId;
  const [trackedId, setTrackedId] = useState(() => typeof window === 'undefined' ? '' : sessionStorage.getItem(storageKey) || '');
  const [notice, setNotice] = useState('');
  const attemptKey = storageKey + ':attempt:' + paymentMethod + ':' + couponCode;
  function requestId() {
    const id = sessionStorage.getItem(attemptKey) || crypto.randomUUID();
    sessionStorage.setItem(attemptKey, id);
    sessionStorage.setItem(storageKey + ':last', attemptKey);
    return id;
  }
  function track(id: string) {
    sessionStorage.setItem(storageKey, id);
    sessionStorage.setItem(storageKey + ':key', attemptKey);
    setTrackedId(id);
  }

  useEffect(() => {
    const lastKey = sessionStorage.getItem(storageKey + ':last');
    const attempt = lastKey && sessionStorage.getItem(lastKey);
    if (trackedId || !attempt) return;
    let cancelled = false;
    const recover = async () => {
      try {
        const response = await fetch('/api/checkout/status?attempt=' + encodeURIComponent(attempt), { cache: 'no-store' });
        const result = await response.json();
        if (!cancelled && result.found && result.paymentId) {
          sessionStorage.setItem(storageKey, result.paymentId);
          sessionStorage.setItem(storageKey + ':key', lastKey);
          setTrackedId(result.paymentId);
        }
      } catch { /* Submitting the same attempt also reconciles it on the server. */ }
    };
    void recover();
    return () => { cancelled = true; };
  }, [trackedId, storageKey]);

  useEffect(() => {
    if (!trackedId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const r = await fetch('/api/checkout/status?paymentId=' + encodeURIComponent(trackedId), { cache: 'no-store' });
        const data = await r.json();
        if (cancelled) return;
        if (!r.ok) throw new Error();
        const terminal = ['rejected','cancelled','refunded','charged_back','expired'].includes(data.status);
        if (data.isApproved || terminal) {
          sessionStorage.removeItem(storageKey);
          const key = sessionStorage.getItem(storageKey + ':key');
          if (key) sessionStorage.removeItem(key);
          sessionStorage.removeItem(storageKey + ':key');
          sessionStorage.removeItem(storageKey + ':last');
          setTrackedId('');
          setPixData(null);
          setNotice('');
          if (data.isApproved) { setIsPaidSuccess(true); await refreshUser(); }
          else setErrorMessage('Pagamento encerrado. Você pode iniciar uma nova tentativa.');
          return;
        }
        if (data.pix?.qrCode || data.pix?.qrCodeBase64) {
          setPaymentMethod('pix');
          setPixData(data.pix);
        } else setPixData(null);
        setNotice(data.status === 'approved' ? 'Pagamento recebido. Estamos confirmando seu acesso.' : 'Aguardando confirmação do pagamento.');
      } catch {
        if (!cancelled) setNotice('Aguardando confirmação. A consulta será repetida automaticamente.');
      }
      if (!cancelled) timer = setTimeout(poll, 5000);
    };
    void poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [trackedId, storageKey, refreshUser, setPaymentMethod, setErrorMessage]);


  return { trackedId, notice, attemptKey, requestId, track, pixData, setPixData, isPaidSuccess };
}
