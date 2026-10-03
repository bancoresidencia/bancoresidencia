import { Question, StudyModalidade } from '@/types';

/**
 * Retorna todas as modalidades de estudo para as quais a questão é aplicável.
 * Garante que cada questão médica seja devidamente direcionada nos filtros de todas as modalidades de estudo:
 * - Residência Médica (Acesso Direto)
 * - Revalida (INEP/Bancas de Revalidação)
 * - Ciclo Básico (Fisiopatologia, Semiologia, Farmacologia, Condutas Iniciais)
 * - R+ Clínica Médica
 * - R+ Cirurgia
 * - R+ Pediatria
 * - R+ Ginecologia e Obstetrícia
 * - R+ Neuropediatria
 * - Título de Oftalmologia (CBO)
 * - Título Clínica Médica (TECM)
 */
export function getQuestionModalidades(q: Question): StudyModalidade[] {
  const set = new Set<StudyModalidade>();

  // 1. Modalidades declaradas explicitamente no objeto da questão
  if (q.modalidade) {
    set.add(q.modalidade);
  }
  if (Array.isArray(q.modalidades)) {
    q.modalidades.forEach((m) => set.add(m));
  }

  // 2. Provas de Residência Médica e Revalida compartilham todo o acervo clínico das grandes áreas
  set.add('Residência Médica');
  set.add('Revalida');

  const esp = (q.especialidade || q.specialty || '').toLowerCase();
  const tema = (q.tema || '').toLowerCase();
  const foco = (q.foco || '').toLowerCase();
  const subfoco = (q.subfoco || '').toLowerCase();
  const stmt = (q.statement || '').toLowerCase();

  // 3. R+ Clínica Médica e Título de Especialista em Clínica Médica (TECM)
  const isClinica =
    esp.includes('clínica') ||
    esp.includes('clinica') ||
    tema.includes('cardio') ||
    tema.includes('nefro') ||
    tema.includes('pneumo') ||
    tema.includes('endocrino') ||
    tema.includes('gastro') ||
    tema.includes('infecto') ||
    tema.includes('hemato') ||
    tema.includes('reumato') ||
    tema.includes('uti') ||
    tema.includes('intensiva') ||
    tema.includes('emergência') ||
    tema.includes('emergencia') ||
    tema.includes('geriatria') ||
    tema.includes('paliativo') ||
    tema.includes('has') ||
    foco.includes('sepse') ||
    foco.includes('diálise') ||
    foco.includes('pcr');

  if (isClinica) {
    set.add('R+ Clínica Médica');
    set.add('Título Clínica Médica (TECM)');
  }

  // 4. R+ Cirurgia Geral
  const isCirurgia =
    esp.includes('cirurgia') ||
    tema.includes('abdome agudo') ||
    tema.includes('trauma') ||
    tema.includes('queimadura') ||
    tema.includes('hérnia') ||
    tema.includes('hernia') ||
    foco.includes('cirúrgico') ||
    foco.includes('cirurgico') ||
    subfoco.includes('apendicectomia') ||
    subfoco.includes('pneumotórax');

  if (isCirurgia) {
    set.add('R+ Cirurgia');
  }

  // 5. R+ Pediatria
  const isPediatria =
    esp.includes('pediatria') ||
    tema.includes('neonato') ||
    tema.includes('puericultura') ||
    tema.includes('infância') ||
    tema.includes('infancia') ||
    tema.includes('exantema') ||
    tema.includes('aleitamento') ||
    stmt.includes('lactente') ||
    stmt.includes('criança');

  if (isPediatria) {
    set.add('R+ Pediatria');
  }

  // 6. R+ Neuropediatria
  const isNeuroped =
    (isPediatria || esp.includes('pediatria') || stmt.includes('lactente') || stmt.includes('criança')) &&
    (tema.includes('neuro') ||
      foco.includes('convuls') ||
      foco.includes('epilepsia') ||
      foco.includes('meningite') ||
      foco.includes('neuropsicomotor') ||
      stmt.includes('convuls') ||
      stmt.includes('crise febril') ||
      stmt.includes('desenvolvimento neuropsicomotor'));

  if (isNeuroped) {
    set.add('R+ Neuropediatria');
  }

  // 7. R+ Ginecologia e Obstetrícia
  const isGO =
    esp.includes('ginecologia') ||
    esp.includes('obstetrícia') ||
    esp.includes('obstetricia') ||
    tema.includes('parto') ||
    tema.includes('gesta') ||
    tema.includes('pré-natal') ||
    tema.includes('pre-natal') ||
    tema.includes('colo') ||
    tema.includes('mamas') ||
    tema.includes('mastologia') ||
    foco.includes('eclâmpsia') ||
    foco.includes('puerpério') ||
    foco.includes('colposcopia');

  if (isGO) {
    set.add('R+ Ginecologia e Obstetrícia');
  }

  // 8. Título de Oftalmologia (CBO)
  const isOftalmo =
    esp.includes('oftalmo') ||
    tema.includes('oftalmo') ||
    tema.includes('olho') ||
    foco.includes('glaucoma') ||
    foco.includes('retina') ||
    foco.includes('acuidade visual') ||
    stmt.includes('oftalmol') ||
    stmt.includes('glaucoma') ||
    stmt.includes('colírio') ||
    stmt.includes('tonometria') ||
    stmt.includes('pressão intraocular');

  if (isOftalmo) {
    set.add('Título de Oftalmologia (CBO)');
  }

  // 9. Ciclo Básico (fundamentos clínicos, fisiopatologia, semiologia, exames de triagem e conduta inicial)
  const isCicloBasico =
    q.difficulty === 'Fácil' ||
    q.difficulty === 'Médio' ||
    tema.includes('epidemiologia') ||
    tema.includes('bioestatística') ||
    tema.includes('fisiologia') ||
    tema.includes('farmacologia') ||
    foco.includes('alvarado') ||
    foco.includes('rastreamento') ||
    foco.includes('sensibilidade') ||
    foco.includes('semiologia') ||
    stmt.includes('fisiopatologia') ||
    stmt.includes('mecanismo de ação') ||
    stmt.includes('diagnóstico');

  if (isCicloBasico) {
    set.add('Ciclo Básico');
  }

  return Array.from(set);
}

/**
 * Verifica se a questão pertence a qualquer uma das modalidades selecionadas no filtro.
 */
export function matchesStudyModalidades(
  q: Question,
  filterModalidades: StudyModalidade[]
): boolean {
  if (!filterModalidades || filterModalidades.length === 0) {
    return true;
  }
  const questionModalidades = getQuestionModalidades(q);
  return filterModalidades.some((mod) => questionModalidades.includes(mod));
}
