export type PlatformTabKey =
  | 'home'
  | 'agenda'
  | 'banco'
  | 'caderno_erros'
  | 'flashcards'
  | 'resumos'
  | 'listas'
  | 'provas'
  | 'simulados'
  | 'stats'
  | 'ranking'
  | 'configuracoes';

export interface TabConfig {
  key: PlatformTabKey;
  label: string;
  path: string;
  description: string;
}

export const PLATFORM_TABS: TabConfig[] = [
  { key: 'home', label: 'Início', path: '/dashboard', description: 'Painel principal e metas diárias' },
  { key: 'agenda', label: 'Agenda', path: '/agenda', description: 'Cronograma inteligente integrado ao Google Agenda e plantões' },
  { key: 'banco', label: 'Banco de Questões', path: '/questoes', description: 'Resolução e filtros de questões' },
  { key: 'caderno_erros', label: 'Caderno de Erros', path: '/caderno-de-erros', description: 'Revisão ativa de questões erradas' },
  { key: 'flashcards', label: 'Flashcards', path: '/flashcards', description: 'Repetição espaçada com algoritmo FSRS' },
  { key: 'resumos', label: 'Resumos Clínicos', path: '/resumos', description: 'Resumos de alto rendimento médico' },
  { key: 'listas', label: 'Listas & Pastas', path: '/listas', description: 'Cadernos personalizados e favoritos' },
  { key: 'provas', label: 'Provas na Íntegra', path: '/provas', description: 'Exames oficiais completos' },
  { key: 'simulados', label: 'Simulados Oficiais', path: '/simulados', description: 'Simulações cronometradas com TRI' },
  { key: 'stats', label: 'Meu Desempenho', path: '/desempenho', description: 'Métricas, percentil e evolução' },
  { key: 'ranking', label: 'Ranking Oficial', path: '/ranking', description: 'Classificação geral dos estudantes' },
  { key: 'configuracoes', label: 'Perfil & Ajustes', path: '/configuracoes', description: 'Dados e preferências da conta' },
];

export type TabStatusMap = Record<PlatformTabKey, boolean>;

export const DEFAULT_TAB_STATUS: TabStatusMap = {
  home: true,
  agenda: true,
  banco: true,
  caderno_erros: true,
  flashcards: true,
  resumos: true,
  listas: true,
  provas: true,
  simulados: true,
  stats: true,
  ranking: true,
  configuracoes: true,
};
