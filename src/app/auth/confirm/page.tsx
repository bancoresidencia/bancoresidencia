import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { isSignupTokenHash } from '@/utils/emailConfirmation';
import { confirmSignup } from './actions';
import { ConfirmEmailButton } from './ConfirmEmailButton';

export const metadata: Metadata = {
  title: 'Confirmar e-mail | Banco Residência',
  robots: { index: false, follow: false }
};

const primaryAction = 'flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--primary-color)] px-4 text-sm font-semibold text-[var(--primary-contrast)] hover:bg-[var(--primary-hover)]';

export default async function ConfirmEmailPage({
  searchParams
}: {
  searchParams: Promise<{ token_hash?: string | string[]; estado?: string | string[] }>;
}) {
  const { token_hash: tokenHash, estado: status } = await searchParams;
  const hasValidHash = isSignupTokenHash(tokenHash);

  return (
    <main className="grid flex-1 place-items-center bg-[var(--bg-page)] px-4 py-8 text-[var(--foreground)]">
      <section aria-labelledby="confirm-signup-title" className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-[var(--bg-card)] p-5 shadow-lg dark:border-zinc-800 sm:p-6">
        <Logo variant="full" className="h-10 w-auto max-w-[220px]" />
        <h1 id="confirm-signup-title" className="text-xl font-bold">
          {hasValidHash ? 'Confirme seu e-mail' : 'Não foi possível confirmar o e-mail'}
        </h1>
        {hasValidHash ? (
          <form action={confirmSignup} className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Confirme seu endereço para acessar o Banco Residência.</p>
            <input type="hidden" name="token_hash" value={tokenHash} />
            <ConfirmEmailButton className={primaryAction} />
          </form>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {status === 'indisponivel'
                ? 'Aguarde alguns instantes e abra novamente o link do e-mail.'
                : 'O link é inválido, expirou ou já foi usado. Entre com seu e-mail e senha para continuar ou pedir um novo link.'}
            </p>
            <Link href="/login" className={primaryAction}>Ir para o login</Link>
          </>
        )}
      </section>
    </main>
  );
}
