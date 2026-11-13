'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, Calendar, ArrowLeft, CheckCircle2, Mail, ExternalLink } from 'lucide-react';

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0c] text-zinc-800 dark:text-zinc-200 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-500/20">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Botão Voltar */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Plataforma</span>
          </Link>
        </div>

        {/* Cabeçalho */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Segurança e Transparência
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Política de Privacidade
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
            Esta Política descreve como a plataforma <strong>Hippocampus</strong> (Questões de Residência Médica) coleta, utiliza, armazena e protege suas informações pessoais e os dados da sua agenda, em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e com as Políticas de Dados de Usuários dos Serviços de API do Google.
          </p>
        </div>

        {/* Conteúdo das Seções */}
        <div className="space-y-6">

          {/* 1. Identificação e Finalidade */}
          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              1. Identificação e Finalidade da Plataforma
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              O <strong>Hippocampus</strong> é uma plataforma acadêmica e tecnológica de alta performance voltada ao estudo e preparação de estudantes de medicina e médicos para concursos de Residência Médica e Revalidação de Diplomas. A plataforma fornece simulados comentados, métricas de desempenho, flashcards de repetição espaçada e organizador de cronogramas diários de estudos adaptados à rotina de internato e plantões médicos.
            </p>
          </section>

          {/* 2. Integração com o Google Calendar API (Exigência Oficial Google) */}
          <section className="bg-white dark:bg-[#121215] border border-blue-500/30 dark:border-blue-500/20 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm bg-gradient-to-b from-blue-500/[0.02] to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                2. Integração com a Google Calendar API (Google Agenda)
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Para auxiliar na conciliação dos horários de estudo com os horários de hospital (plantões, rounds e internato), oferecemos a opção de integração com a sua conta do <strong>Google Calendar</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  Dados Acessados (Leitura)
                </h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Acessamos exclusivamente os compromissos agendados para a data corrente (título do evento, horário de início e fim e local) para preencher os intervalos livres do seu dia com os blocos de estudo recomendados.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-500" />
                  Gravação de Eventos (Escrita)
                </h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Quando você clica no botão de exportar/adicionar um bloco de estudos à sua agenda, a plataforma envia o título e o horário daquele bloco para ser registrado na sua agenda do Google.
                </p>
              </div>
            </div>

            {/* Google Limited Use Disclosure */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-zinc-800 dark:text-zinc-300 text-xs space-y-2 mt-2">
              <h4 className="font-bold text-amber-900 dark:text-amber-200">
                Declaração de Uso Limitado da Google API (Limited Use Disclosure)
              </h4>
              <p className="leading-relaxed text-[11px]">
                O uso e a transferência para qualquer outro aplicativo das informações recebidas das APIs do Google pelo <strong>Hippocampus</strong> obedecerão integralmente à{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-blue-600 dark:text-blue-400 inline-flex items-center gap-0.5"
                >
                  Política de Dados do Usuário dos Serviços de API do Google
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
                , incluindo os requisitos de <strong>Uso Limitado (Limited Use)</strong>.
              </p>
            </div>
          </section>

          {/* 3. Não Compartilhamento e Não Venda de Dados */}
          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              3. Proteção e Não Compartilhamento de Dados
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li>
                <strong>Não comercialização:</strong> Nós nunca vendemos, alugamos ou comercializamos dados de usuários ou informações de calendários para terceiros ou anunciantes.
              </li>
              <li>
                <strong>Sem anúncios baseados em dados de agenda:</strong> Os dados de seus compromissos não são utilizados para publicidade direcionada nem para fins de profiling comercial.
              </li>
              <li>
                <strong>Sem uso para treino de IA pública:</strong> Seus dados de agenda pessoal não são utilizados para treinar modelos públicos de inteligência artificial.
              </li>
            </ul>
          </section>

          {/* 4. Armazenamento e Segurança */}
          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              4. Armazenamento Seguro e Criptografia
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Todas as comunicações entre o seu navegador, os servidores da plataforma e a API do Google utilizam tráfego criptografado com o protocolo TLS/HTTPS de última geração. Os tokens de autorização de calendário são manipulados localmente no seu dispositivo através de armazenamento seguro de sessão (Local Storage autenticado do navegador) e você pode desconectar sua conta a qualquer momento com apenas 1 clique.
            </p>
          </section>

          {/* 5. Como Revogar o Acesso à Sua Agenda */}
          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              5. Como Desconectar ou Revogar o Acesso
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Você tem total controle sobre os seus dados e pode revogar o acesso à sua agenda médica a qualquer momento de duas maneiras:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li>
                <strong>Na própria plataforma:</strong> Abra a aba da Agenda, clique em <em>Configurar</em> e em seguida em <strong>"Desconectar"</strong>. Todos os dados sincronizados serão apagados imediatamente do seu navegador.
              </li>
              <li>
                <strong>Pela sua conta Google:</strong> Acesse as permissões de segurança da sua conta Google em{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-blue-600 dark:text-blue-400"
                >
                  myaccount.google.com/permissions
                </a>{' '}
                e remova o acesso do aplicativo <em>Hippocampus</em>.
              </li>
            </ol>
          </section>

          {/* 6. Contato com o Encarregado de Dados (DPO) */}
          <section className="bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              6. Canal de Atendimento e Dúvidas
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Caso tenha dúvidas sobre como seus dados são tratados ou queira exercer quaisquer dos seus direitos previstos pela LGPD, entre em contato com nossa equipe pelo e-mail de suporte da plataforma ou através de nossos canais oficiais de atendimento.
            </p>
          </section>

        </div>

        {/* Rodapé da Política */}
        <div className="text-center pt-4 text-xs text-zinc-400 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} Hippocampus — Questões de Residência. Todos os direitos reservados.</p>
        </div>

      </div>
    </div>
  );
}
