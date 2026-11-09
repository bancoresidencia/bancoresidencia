import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/questoes_132k.db');

console.log('========================================================================');
console.log('🚀 CONSOLIDAÇÃO INTEGRAL: BANCO SQLITE <-> ÁRVORE DO FRONTEND (OPTIMIZED)');
console.log('========================================================================\n');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados SQLite não encontrado em: ${DB_PATH}`);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

// 1. Dicionário dos 19 Temas com sufixos ou parênteses
const TEMA_NORMALIZATIONS = {
  // Clínica Médica (16 temas)
  'Cardiologia (Doenças Cardiovasculares)': 'Cardiologia',
  'Pneumologia (Doenças Pulmonares e Vias Aéreas)': 'Pneumologia',
  'Gastroenterologia (Aparelho Digestivo e Fígado)': 'Gastroenterologia',
  'Nefrologia (Distúrbios Renais e Meio Interno)': 'Nefrologia',
  'Endocrinologia (Metabologia e Diabetes)': 'Endocrinologia',
  'Reumatologia (Doenças Autoimunes e Articulares)': 'Reumatologia',
  'Infectologia (Doenças Infecciosas e Parasitárias)': 'Infectologia',
  'Hematologia (Hemoterapia e Coagulação)': 'Hematologia',
  'Neurologia (Doenças Neurológicas e Cefaleias)': 'Neurologia',
  'Dermatologia (Afecções Cutâneas)': 'Dermatologia',
  'Alergia e Imunologia (Disfunções Imunológicas)': 'Alergia e Imunologia',
  'Oncologia Clínica (Neoplasias e Terapêutica Antineoplásica)': 'Oncologia Clínica',
  'Medicina de Emergência (Terapia Intensiva e Suporte de Vida)': 'Medicina de Emergência',
  'Geriatria (Saúde do Idoso e Fragilidade)': 'Geriatria',
  'Cuidados Paliativos (Manejo da Dor e Fim de Vida)': 'Cuidados Paliativos',
  'Toxicologia Clínica (Intoxicações e Envenenamentos)': 'Toxicologia Clínica',
  // Cirurgia Geral
  'Trauma e Atendimento Inicial (ATLS)': 'Trauma e Atendimento Inicial',
  // Obstetrícia
  'Puerpério e Hemorragia Pós-Parto (HPP)': 'Puerpério e Hemorragia Pós-Parto',
  // Ginecologia
  'Infecções Ginecológicas e Doença Inflamatória Pélvica (DIP)': 'Infecções Ginecológicas e Doença Inflamatória Pélvica'
};

// 2. Mapeamento das questões órfãs
const REMAP_ORPHANS = {
  // --- MEDICINA PREVENTIVA E SOCIAL ---
  "Medicina Preventiva e Social ||| Vigilância em Saúde ||| Investigação de Surtos e Resposta a Epidemias: Definição de Caso, SINAN e Controle": {
    tema: "Vigilância em Saúde e Notificação Compulsória",
    foco: "Investigação de Surtos e Epidemias"
  },
  "Medicina Preventiva e Social ||| Vigilância em Saúde ||| Zoonoses e Controle Vetorial: Arboviroses, Febre Amarela e Manejo Territorial": {
    tema: "Vigilância em Saúde e Notificação Compulsória",
    foco: "Vigilância Epidemiológica de Doenças Transmissíveis"
  },
  "Medicina Preventiva e Social ||| Vigilância em Saúde ||| Vigilância em Saúde do Trabalhador": {
    tema: "Saúde do Trabalhador e Riscos Ocupacionais",
    foco: "Acidentes de Trabalho e Emissão de CAT"
  },
  "Medicina Preventiva e Social ||| Epidemiologia ||| Medidas de Frequência": {
    tema: "Medidas de Frequência e Associação Epidemiológica",
    foco: "Incidência, Prevalência e Taxa de Ataque"
  },
  "Medicina Preventiva e Social ||| Epidemiologia ||| Desenhos de Estudos: Coorte, Caso-Controle e Transversal": {
    tema: "Desenhos de Estudos Epidemiológicos",
    foco: "Estudo de Coorte"
  },
  "Medicina Preventiva e Social ||| Epidemiologia ||| Distribuição de Doenças: Tempo, Pessoa, Espaço": {
    tema: "Medidas de Frequência e Associação Epidemiológica",
    foco: "Incidência, Prevalência e Taxa de Ataque"
  },
  "Medicina Preventiva e Social ||| Epidemiologia ||| Transição Demográfica e Epidemiológica": {
    tema: "Demografia Médica e Indicadores de Saúde",
    foco: "Transição Demográfica e Transição Epidemiológica no Brasil"
  },
  "Medicina Preventiva e Social ||| Epidemiologia ||| Epidemiologia de Doenças Transmissíveis": {
    tema: "Vigilância em Saúde e Notificação Compulsória",
    foco: "Vigilância Epidemiológica de Doenças Transmissíveis"
  },
  "Medicina Preventiva e Social ||| Medicina Legal e Perícias ||| Responsabilidade Profissional": {
    tema: "Bioética e Código de Ética Médica",
    foco: "Relação Médico-Paciente e Responsabilidade Profissional"
  },
  "Medicina Preventiva e Social ||| Medicina Legal e Perícias ||| Documentos Médico-Legais": {
    tema: "Declaração de Óbito e Atestados Médicos",
    foco: "Atestados Médicos, Prontuário e Guarda de Documentos"
  },
  "Medicina Preventiva e Social ||| Saúde do Idoso ||| Política Nacional do Idoso": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Política Nacional de Atenção Básica (PNAB)"
  },
  "Medicina Preventiva e Social ||| Atenção Primária à Saúde ||| Estratégia Saúde da Família": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Estratégia Saúde da Família (ESF) e Equipe Multiprofissional (eMulti)"
  },
  "Medicina Preventiva e Social ||| Atenção Primária à Saúde ||| Visita Domiciliar e Cuidado Longitudinal": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Princípios da Atenção Primária (Starfield: Atributos Essenciais e Derivados)"
  },
  "Medicina Preventiva e Social ||| Atenção Primária à Saúde ||| Condições Crônicas na APS": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Princípios da Atenção Primária (Starfield: Atributos Essenciais e Derivados)"
  },
  "Medicina Preventiva e Social ||| Atenção Primária à Saúde ||| Territorialização e Cadastramento": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Estratégia Saúde da Família (ESF) e Equipe Multiprofissional (eMulti)"
  },
  "Medicina Preventiva e Social ||| Atenção Primária à Saúde ||| Segurança do Paciente e IRAS: Bundles, Indicadores e Notificação": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Prevenção Quaternária e Segurança do Paciente na APS"
  },
  "Medicina Preventiva e Social ||| Saúde Mental ||| Transtornos Mentais Comuns na APS": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Princípios da Atenção Primária (Starfield: Atributos Essenciais e Derivados)"
  },
  "Medicina Preventiva e Social ||| Imunizações ||| Vacinas Especiais (CRIE)": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Política Nacional de Atenção Básica (PNAB)"
  },
  "Medicina Preventiva e Social ||| Imunizações ||| Indicações e Momento Ideal para Vacinação": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Política Nacional de Atenção Básica (PNAB)"
  },
  "Medicina Preventiva e Social ||| Imunizações ||| Calendário Nacional de Vacinação: Esquemas, Intervalos e Rede de Frio": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Política Nacional de Atenção Básica (PNAB)"
  },
  "Medicina Preventiva e Social ||| Políticas Públicas de Saúde ||| Determinantes Sociais: Políticas de Equidade e Redução de Desigualdades": {
    tema: "História das Políticas de Saúde e Gestão do SUS",
    foco: "Evolução Histórica das Políticas de Saúde no Brasil (INAMPS, Reforma Sanitária e 8ª CNS)"
  },
  "Medicina Preventiva e Social ||| Políticas Públicas de Saúde ||| Determinantes Sociais: Modelo de Dahlgren-Whitehead": {
    tema: "História das Políticas de Saúde e Gestão do SUS",
    foco: "Evolução Histórica das Políticas de Saúde no Brasil (INAMPS, Reforma Sanitária e 8ª CNS)"
  },
  "Medicina Preventiva e Social ||| Políticas Públicas de Saúde ||| Política Nacional de Atenção Básica": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Política Nacional de Atenção Básica (PNAB)"
  },
  "Medicina Preventiva e Social ||| Saúde do Trabalhador ||| Acidentes de Trabalho": {
    tema: "Saúde do Trabalhador e Riscos Ocupacionais",
    foco: "Acidentes de Trabalho e Emissão de CAT"
  },
  "Medicina Preventiva e Social ||| Saúde do Trabalhador ||| Evolução Histórica da Saúde do Trabalhador: Ramazzini aos Dias Atuais": {
    tema: "História das Políticas de Saúde e Gestão do SUS",
    foco: "Evolução Histórica das Políticas de Saúde no Brasil (INAMPS, Reforma Sanitária e 8ª CNS)"
  },
  "Medicina Preventiva e Social ||| Saúde do Trabalhador ||| Normas Regulamentadoras (NRs) Principais": {
    tema: "Saúde do Trabalhador e Riscos Ocupacionais",
    foco: "Acidentes de Trabalho e Emissão de CAT"
  },
  "Medicina Preventiva e Social ||| Bioestatística ||| Tipos de Variáveis e Medidas-Resumo": {
    tema: "Medidas de Frequência e Associação Epidemiológica",
    foco: "Incidência, Prevalência e Taxa de Ataque"
  },
  "Medicina Preventiva e Social ||| Bioestatística ||| Estatística Descritiva": {
    tema: "Medidas de Frequência e Associação Epidemiológica",
    foco: "Incidência, Prevalência e Taxa de Ataque"
  },
  "Medicina Preventiva e Social ||| Bioestatística ||| Interpretação de P-valor e IC": {
    tema: "Medidas de Frequência e Associação Epidemiológica",
    foco: "Risco Relativo (RR) e Razão de Prevalência (RP)"
  },
  "Medicina Preventiva e Social ||| Medicina Baseada em Evidências ||| Hierarquia de Evidências e Pesquisa Clínica": {
    tema: "Desenhos de Estudos Epidemiológicos",
    foco: "Revisões Sistemáticas e Metanálises"
  },
  "Medicina Preventiva e Social ||| Sistema Único de Saúde ||| História e Modelos de Sistemas de Saúde": {
    tema: "História das Políticas de Saúde e Gestão do SUS",
    foco: "Evolução Histórica das Políticas de Saúde no Brasil (INAMPS, Reforma Sanitária e 8ª CNS)"
  },
  "Medicina Preventiva e Social ||| Sistema Único de Saúde ||| Financiamento da APS no Previne Brasil: Capitação Ponderada e Desempenho": {
    tema: "Sistema Único de Saúde (SUS): Princípios e Legislação",
    foco: "Financiamento do SUS e Emendas Constitucionais"
  },
  "Medicina Preventiva e Social ||| Sistema Único de Saúde ||| Marcos Legais do SUS: Leis 8.080 e 8.142": {
    tema: "Sistema Único de Saúde (SUS): Princípios e Legislação",
    foco: "Lei Orgânica da Saúde 8.080/1990"
  },
  "Medicina Preventiva e Social ||| Sistema Único de Saúde ||| Níveis de Atenção à Saúde": {
    tema: "Sistema Único de Saúde (SUS): Princípios e Legislação",
    foco: "Princípios Doutrinários e Organizativos do SUS (Universalidade, Integralidade, Equidade, Descentralização)"
  },
  "Medicina Preventiva e Social ||| Saúde da Criança ||| AIDPI: Manejo Integrado das Doenças Prevalentes da Infância": {
    tema: "Atenção Primária à Saúde e Medicina de Família",
    foco: "Princípios da Atenção Primária (Starfield: Atributos Essenciais e Derivados)"
  },

  // --- CIRURGIA GERAL ---
  "Cirurgia Geral ||| Oncologia Cirúrgica ||| Carcinoma Hepatocelular": {
    tema: "Cirurgia Hepato-Bilio-Pancreática",
    foco: "Tumores Hepáticos Benignos e Malignos (Carcinoma Hepatocelular e Metástases)"
  },
  "Cirurgia Geral ||| Oncologia Cirúrgica ||| Câncer de Pâncreas": {
    tema: "Cirurgia Hepato-Bilio-Pancreática",
    foco: "Neoplasias do Pâncreas (Adenocarcinoma e Neoplasias Císticas)"
  },
  "Cirurgia Geral ||| Cirurgia Geral e Digestiva ||| Colecistite Aguda e Crônica": {
    tema: "Cirurgia Hepato-Bilio-Pancreática",
    foco: "Colelitíase e Coledocolitíase"
  },
  "Cirurgia Geral ||| Cirurgia Geral e Digestiva ||| Coledocolitíase": {
    tema: "Cirurgia Hepato-Bilio-Pancreática",
    foco: "Colelitíase e Coledocolitíase"
  },
  "Cirurgia Geral ||| Cirurgia Geral e Digestiva ||| Abdome Agudo Obstrutivo: Diagnóstico e Classificação": {
    tema: "Abdome Agudo Cirúrgico",
    foco: "Abdome Agudo Obstrutivo"
  },
  "Cirurgia Geral ||| Cirurgia Geral e Digestiva ||| Técnicas e Procedimentos Cirúrgicos": {
    tema: "Princípios Cirúrgicos e Cuidados Perioperatórios",
    foco: "Técnica Cirúrgica, Fios e Drenos"
  },
  "Cirurgia Geral ||| Cirurgia de Cabeça e Pescoço ||| Cirurgia da Tireoide: Bócio e Neoplasias": {
    tema: "Cirurgia Cervical e Tireoidiana",
    foco: "Nódulos e Câncer de Tireoide Cirúrgico"
  },
  "Cirurgia Geral ||| Cirurgia de Cabeça e Pescoço ||| Tumores de Cabeça e Pescoço": {
    tema: "Cirurgia Cervical e Tireoidiana",
    foco: "Câncer de Laringe e Cavidade Oral"
  },
  "Cirurgia Geral ||| Ortopedia e Traumatologia ||| Fraturas de MMII (Fêmur, Tíbia, Tornozelo, Quadril)": {
    tema: "Trauma e Atendimento Inicial",
    foco: "Avaliação Inicial e Via Aérea no Trauma (A do ATLS)"
  },
  "Cirurgia Geral ||| Cirurgia Pediátrica ||| Hérnias e Massas Abdominais": {
    tema: "Cirurgia Pediátrica e Neonatal",
    foco: "Criptorquidia e Hérnias Congênitas"
  },
  "Cirurgia Geral ||| Cirurgia Pediátrica ||| Atresia de Esôfago e Fístula Traqueoesofágica": {
    tema: "Cirurgia Pediátrica e Neonatal",
    foco: "Atresia de Esôfago e Fístula Traqueoesofágica"
  },
  "Cirurgia Geral ||| Hérnias da Parede Abdominal ||| Hérnias: Conceitos, Classificação e Diagnóstico": {
    tema: "Hérnias e Parede Abdominal",
    foco: "Hérnia Inguinal (Indireta e Direta)"
  },
  "Cirurgia Geral ||| Urologia ||| Câncer de Próstata: Rastreamento e Estadiamento": {
    tema: "Patologias Cirúrgicas Urológicas",
    foco: "Câncer de Próstata"
  },
  "Cirurgia Geral ||| Princípios Fundamentais em Cirurgia ||| Técnica Cirúrgica e Instrumentação": {
    tema: "Princípios Cirúrgicos e Cuidados Perioperatórios",
    foco: "Técnica Cirúrgica, Fios e Drenos"
  },
  "Cirurgia Geral ||| Princípios Fundamentais em Cirurgia ||| Propedêutica Cirúrgica": {
    tema: "Princípios Cirúrgicos e Cuidados Perioperatórios",
    foco: "Avaliação de Risco Cirúrgico e Cardiopulmonar"
  },
  "Cirurgia Geral ||| Princípios Fundamentais em Cirurgia ||| Infecção de Sítio Cirúrgico": {
    tema: "Princípios Cirúrgicos e Cuidados Perioperatórios",
    foco: "Infecção de Sítio Cirúrgico (ISC) e Profilaxia Antibiótica"
  },
  "Cirurgia Geral ||| Antibioticoprofilaxia e Infecção ||| Infecção de Sítio Cirúrgico": {
    tema: "Princípios Cirúrgicos e Cuidados Perioperatórios",
    foco: "Infecção de Sítio Cirúrgico (ISC) e Profilaxia Antibiótica"
  },
  "Cirurgia Geral ||| Trauma e Emergência ||| Trauma Cranioencefálico": {
    tema: "Trauma e Atendimento Inicial",
    foco: "Trauma Cranioencefálico (TCE Leve, Moderado e Grave)"
  },
  "Cirurgia Geral ||| Anestesiologia ||| Via Aérea Difícil": {
    tema: "Anestesia e Controle da Dor",
    foco: "Avaliação Pré-Anestésica (Classificação ASA)"
  },
  "Cirurgia Geral ||| Cirurgia Vascular ||| Dissecção Aórtica": {
    tema: "Doenças Vasculares Cirúrgicas",
    foco: "Aneurisma de Aorta Abdominal (AAA) e Torácica"
  },

  // --- OBSTETRÍCIA ---
  "Obstetrícia ||| Trabalho de Parto e Parto ||| Bacia Obstétrica e Pelvimetria": {
    tema: "Mecanismo de Parto, Partograma e Distócias",
    foco: "Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas"
  },
  "Obstetrícia ||| Trabalho de Parto e Parto ||| Trabalho de Parto: Fases, Períodos e Assistência": {
    tema: "Mecanismo de Parto, Partograma e Distócias",
    foco: "Trabalho de Parto (Fases Clínicas e Assistência Humanizada)"
  },
  "Obstetrícia ||| Trabalho de Parto e Parto ||| Cesariana": {
    tema: "Mecanismo de Parto, Partograma e Distócias",
    foco: "Cesariana (Indicações, Técnica e Parto Vaginal após Cesárea)"
  },
  "Obstetrícia ||| Doenças Hipertensivas na Gestação ||| Síndrome HELLP": {
    tema: "Síndromes Hipertensivas na Gravidez",
    foco: "Síndrome HELLP"
  },
  "Obstetrícia ||| Doenças Hipertensivas na Gestação ||| Pré-eclâmpsia e Eclâmpsia": {
    tema: "Síndromes Hipertensivas na Gravidez",
    foco: "Pré-Eclâmpsia (com e sem Sinais de Gravidade)"
  },
  "Obstetrícia ||| Intercorrências Clínicas na Gestação ||| Diabetes Gestacional": {
    tema: "Diabetes Gestacional e Endocrinopatias",
    foco: "Diabetes Mellitus Gestacional (DMG: Rastreamento, Diagnóstico e Metas)"
  },
  "Obstetrícia ||| Intercorrências Clínicas na Gestação ||| Sífilis na Gestação: Diagnóstico e Tratamento": {
    tema: "Infecções Congênitas e Perinatais",
    foco: "Sífilis Gestacional e Congênita"
  },
  "Obstetrícia ||| Intercorrências Clínicas na Gestação ||| LES e Síndrome Antifosfolípide na Gestação": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Rotina do Pré-Natal de Baixo Risco (Consultas, Exames e Calendário)"
  },
  "Obstetrícia ||| Intercorrências Clínicas na Gestação ||| Trombofilias na Gestação": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Rotina do Pré-Natal de Baixo Risco (Consultas, Exames e Calendário)"
  },
  "Obstetrícia ||| Assistência Pré-natal ||| Modificações Fisiológicas da Gravidez": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Modificações Fisiológicas da Gravidez (Cardiovasculares, Renais, Hematológicas)"
  },
  "Obstetrícia ||| Assistência Pré-natal ||| Propedêutica do Pré-natal": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Rotina do Pré-Natal de Baixo Risco (Consultas, Exames e Calendário)"
  },
  "Obstetrícia ||| Assistência Pré-natal ||| Diagnóstico e Datação da Gestação": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Cálculo da Idade Gestacional e Data Provável do Parto"
  },
  "Obstetrícia ||| Assistência Pré-natal ||| Imunologia na Gestação": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Modificações Fisiológicas da Gravidez (Cardiovasculares, Renais, Hematológicas)"
  },
  "Obstetrícia ||| Assistência Pré-natal ||| Queixas Comuns na Gestação": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Rotina do Pré-Natal de Baixo Risco (Consultas, Exames e Calendário)"
  },
  "Obstetrícia ||| Fisiologia Fetal e Embriologia ||| Desenvolvimento Embriológico": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Modificações Fisiológicas da Gravidez (Cardiovasculares, Renais, Hematológicas)"
  },
  "Obstetrícia ||| Fisiologia Fetal e Embriologia ||| Modificações Fisiológicas da Gravidez": {
    tema: "Assistência Pré-Natal e Fisiologia Gestacional",
    foco: "Modificações Fisiológicas da Gravidez (Cardiovasculares, Renais, Hematológicas)"
  },
  "Obstetrícia ||| Abortamento ||| Doença Trofoblástica Gestacional": {
    tema: "Hemorragias da Primeira Metade da Gravidez",
    foco: "Doença Trofoblástica Gestacional (Mola Hidatiforme e Neoplasias)"
  },
  "Obstetrícia ||| Abortamento ||| Tipos de Abortamento": {
    tema: "Hemorragias da Primeira Metade da Gravidez",
    foco: "Abortamento Espontâneo e suas Formas Clínicas (Ameaça, Inevitável, Incompleto, Retido, Infectado)"
  },
  "Obstetrícia ||| Hemorragias Obstétricas ||| Placenta Prévia e Acretismo": {
    tema: "Hemorragias da Segunda Metade da Gravidez",
    foco: "Placenta Prévia"
  },
  "Obstetrícia ||| Hemorragias Obstétricas ||| Descolamento Prematuro de Placenta": {
    tema: "Hemorragias da Segunda Metade da Gravidez",
    foco: "Descolamento Prematuro de Placenta (DPP)"
  },
  "Obstetrícia ||| Hemorragias Obstétricas ||| Hemorragia Pós-parto": {
    tema: "Puerpério e Hemorragia Pós-Parto",
    foco: "Hemorragia Pós-Parto (HPP: 4 Ts - Tônus, Trauma, Tecido, Trombina)"
  },
  "Obstetrícia ||| Puerpério ||| Infecção Puerperal": {
    tema: "Puerpério e Hemorragia Pós-Parto",
    foco: "Infecção Puerperal e Endometrite Pós-Parto"
  },
  "Obstetrícia ||| Puerpério ||| Puerpério Normal": {
    tema: "Puerpério e Hemorragia Pós-Parto",
    foco: "Puerpério Fisiológico e Aleitamento Materno"
  },
  "Obstetrícia ||| Medicina Fetal ||| Morte Fetal e Investigação": {
    tema: "Avaliação da Vitalidade Fetal",
    foco: "Cardiotocografia Basal e Intraparto (Categorias I, II e III)"
  }
};

db.exec('BEGIN TRANSACTION;');

try {
  // ETAPA 1: Garantir colunas de preservação histórica
  console.log('1️⃣ Preservando histórico taxonômico original em antigo_*...');
  const cols = db.prepare('PRAGMA table_info(questions)').all().map(c => c.name);
  if (!cols.includes('antigo_tema')) db.exec('ALTER TABLE questions ADD COLUMN antigo_tema TEXT;');
  if (!cols.includes('antigo_foco')) db.exec('ALTER TABLE questions ADD COLUMN antigo_foco TEXT;');
  if (!cols.includes('antigo_subfoco')) db.exec('ALTER TABLE questions ADD COLUMN antigo_subfoco TEXT;');

  db.exec(`
    UPDATE questions 
    SET antigo_tema = tema, antigo_foco = foco, antigo_subfoco = subfoco 
    WHERE antigo_tema IS NULL;
  `);

  // ETAPA 2: Unificar Especialidade 'Cirurgia' -> 'Cirurgia Geral'
  console.log('2️⃣ Unificando especialidade Cirurgia -> Cirurgia Geral...');
  const resEsp = db.prepare(`UPDATE questions SET especialidade = 'Cirurgia Geral' WHERE especialidade = 'Cirurgia';`).run();
  console.log(`   ✅ ${resEsp.changes} questões atualizadas para 'Cirurgia Geral'.`);

  // ETAPA 3: Normalizar os 19 Temas com parênteses em novo_tema usando CASE (1 único scan!)
  console.log('3️⃣ Normalizando os 19 temas com parênteses em novo_tema...');
  const escapeSqlStr = (s) => `'${s.replace(/'/g, "''")}'`;
  const whenClauses = Object.entries(TEMA_NORMALIZATIONS)
    .map(([from, to]) => `WHEN novo_tema = ${escapeSqlStr(from)} THEN ${escapeSqlStr(to)}`)
    .join('\n      ');
  const inList = Object.keys(TEMA_NORMALIZATIONS).map(t => escapeSqlStr(t)).join(', ');

  const updateThemesSql = `
    UPDATE questions 
    SET novo_tema = CASE 
      ${whenClauses}
      ELSE novo_tema
    END
    WHERE novo_tema IN (${inList});
  `;
  const resThemes = db.prepare(updateThemesSql).run();
  console.log(`   ✅ ${resThemes.changes} questões normalizadas em novo_tema.`);

  // ETAPA 4: Remapear as 146 questões órfãs
  console.log('4️⃣ Remapeando questões órfãs para a árvore canônica do front-end...');
  const updateOrphanStmt = db.prepare(`
    UPDATE questions 
    SET novo_tema = ?, novo_foco = ? 
    WHERE especialidade = ? AND novo_tema = ? AND novo_foco = ?;
  `);

  let totalOrphansRemapped = 0;
  for (const [key, dest] of Object.entries(REMAP_ORPHANS)) {
    const [esp, temaOrig, focoOrig] = key.split(' ||| ');
    const info = updateOrphanStmt.run(dest.tema, dest.foco, esp, temaOrig, focoOrig);
    totalOrphansRemapped += info.changes;
  }
  console.log(`   ✅ ${totalOrphansRemapped} questões órfãs integradas com sucesso.`);

  // ETAPA 5: Promover novo_* para as colunas oficiais tema, foco, subfoco
  console.log('5️⃣ Promovendo novo_tema, novo_foco e novo_subfoco para colunas canônicas...');
  const resPromote = db.prepare(`
    UPDATE questions 
    SET 
      tema = novo_tema, 
      foco = novo_foco, 
      subfoco = novo_subfoco 
    WHERE novo_tema IS NOT NULL;
  `).run();
  console.log(`   ✅ ${resPromote.changes} questões promovidas.`);

  // ETAPA 6: Criar Índices de Alta Performance
  console.log('6️⃣ Criando índices de alta performance para buscas instantâneas (< 5ms)...');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_questions_tema ON questions(tema);
    CREATE INDEX IF NOT EXISTS idx_questions_foco ON questions(foco);
    CREATE INDEX IF NOT EXISTS idx_questions_subfoco ON questions(subfoco);
    CREATE INDEX IF NOT EXISTS idx_questions_especialidade ON questions(especialidade);
    CREATE INDEX IF NOT EXISTS idx_questions_banca ON questions(banca);
    CREATE INDEX IF NOT EXISTS idx_questions_year ON questions(year);
    CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
    CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
    CREATE INDEX IF NOT EXISTS idx_questions_is_anulada ON questions(is_anulada);
  `);
  console.log('   ✅ Índices criados e ativos.');

  db.exec('COMMIT;');
  console.log('\n🎉 TRANSAÇÃO DO SQLITE CONCLUÍDA COM SUCESSO!');
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('❌ ERRO CRÍTICO NA CONSOLIDAÇÃO:', err);
  process.exit(1);
} finally {
  db.close();
}
