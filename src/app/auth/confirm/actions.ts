'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSignupTokenHash } from '@/utils/emailConfirmation';

export async function confirmSignup(formData: FormData) {
  const tokenHash = formData.get('token_hash');
  if (!isSignupTokenHash(tokenHash)) {
    redirect('/auth/confirm?estado=invalido');
  }

  let destination: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type: 'signup', token_hash: tokenHash });

    if (error || !data.session) {
      destination = error && (!error.status || error.status === 429 || error.status >= 500)
        ? '/auth/confirm?estado=indisponivel'
        : '/auth/confirm?estado=invalido';
    } else {
      destination = '/dashboard';
    }
  } catch {
    destination = '/auth/confirm?estado=indisponivel';
  }

  redirect(destination);
}
