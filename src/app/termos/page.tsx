import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, FileText, ShieldCheck, CheckCircle2, CreditCard, Lock, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso | Hippocampus',
  description: 'Termos e condições de uso da plataforma acadêmica Hippocampus — Questões de Residência Médica.'
};

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-800 dark:text-zinc-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Página Inicial</span>
          </Link>
        </div>

        <header className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Contrato e Transparência Acadêmica
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Termos de Uso
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Estes Termos regulam o acesso e a utilização da plataforma educacional <strong>Hippocampus</strong> (banco de questões comentadas, simulados, flashcards FSRS, resumos clínicos e métricas de estudo para estudantes de medicina e médicos), em conformidade com a legislação brasileira vigente, o Marco Civil da Internet (Lei nº 12.965/2014) e o Código de Defesa do Consumidor (Lei nº 8.078/1990).
          </p>
        </header>

        <main className="space-y-5">
          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              1. Finalidade Educacional e Escopo Médico
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              O conteúdo disponibilizado no Hippocampus destina-se exclusivamente à preparação científica e treinamento acadêmico para provas de Residência Médica, Revalidação de Diploma (Revalida) e Título de Especialista (R+). As resoluções comentadas e os resumos refletem diretrizes médicas oficiais vigentes à época das provas e não substituem o julgamento clínico individualizado no atendimento direto a pacientes.
            </p>
          </section>

          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              2. Licença de Acesso Individual e Intransferível
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              A conta do aluno é pessoal, individual e intransferível, permitindo sincronização entre seus dispositivos pessoais (computador, tablet e smartphone). É vedado o compartilhamento simultâneo de credenciais com terceiros, a extração automatizada de dados (scraping) ou a reprodução comercial não autorizada de comentários, flashcards e materiais autorais da plataforma.
            </p>
          </section>

          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500 shrink-0" />
              3. Planos, Pagamentos e Garantia Incondicional de 7 Dias
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Os pagamentos são processados em ambiente criptografado via parceiro homologado (Mercado Pago), com liberação imediata após confirmação. Nos termos do Art. 49 do Código de Defesa do Consumidor, o assinante dispõe do prazo incondicional de <strong>7 (sete) dias corridos</strong> a contar da contratação inicial para solicitar o cancelamento e reembolso integral de 100% do valor pago, diretamente pelo painel da conta ou pelos canais oficiais de atendimento.
            </p>
          </section>

          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              4. Privacidade e Proteção de Dados (LGPD)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              O tratamento de dados pessoais, métricas de estudo e integrações opcionais de calendário obedece rigorosamente à Lei Geral de Proteção de Dados (Lei nº 13.709/2018), conforme detalhado em nossa{' '}
              <Link href="/privacidade" className="font-bold underline text-blue-600 dark:text-blue-400">
                Política de Privacidade
              </Link>
              .
            </p>
          </section>

          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              5. Suporte ao Estudante
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Em caso de dúvidas técnicas, financeiras ou acadêmicas, nossa equipe atende prontamente pelos canais oficiais de suporte indicados na página inicial e no painel interno do estudante.
            </p>
          </section>
        </main>

        <footer className="text-center pt-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© {new Date().getFullYear()} Hippocampus — Questões de Residência Médica. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
