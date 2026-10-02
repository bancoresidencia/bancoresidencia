import { SpecialtyHierarchy } from '@/types';

export const preventivaHierarchy: SpecialtyHierarchy = {
  especialidade: 'Medicina Preventiva e Social',
  temas: [
    {
      tema: 'Epidemiologia',
      focos: [
        {
          foco: 'Medidas de Frequência',
          subfocos: [
            'Prevalência: Pontual e de Período',
            'Taxa de Mortalidade: Geral, Específica e Infantil',
            'Letalidade, Morbidade e Anos Potenciais de Vida Perdidos',
            'Incidência: Cálculo e Interpretação',
            'Padronização de Taxas: Direta e Indireta'
          ]
        },
        {
          foco: 'Desenhos de Estudos: Coorte, Caso-Controle e Transversal',
          subfocos: [
            'Estudo de Coorte: Características e Vantagens',
            'Estudo Caso-Controle: Delineamento e Resultados',
            'Estudo Transversal: Definição e Aplicações',
            'Ensaio Clínico Randomizado: Princípios e Vieses'
          ]
        },
        {
          foco: 'Epidemiologia de Doenças Transmissíveis',
          subfocos: [
            'Modos de Transmissão: Direta, Indireta e Vetorial',
            'Período de Incubação, Latência e Transmissibilidade',
            'Cadeia Epidemiológica: Agente, Hospedeiro, Meio',
            'Imunidade de Rebanho e R0',
            'Medidas de Controle: Bloqueio, Quarentena, Isolamento'
          ]
        },
        {
          foco: 'Medidas de Associação: Risco Relativo, Odds Ratio e Risco Atribuível',
          subfocos: [
            'Risco Relativo (RR): Cálculo e Interpretação',
            'Odds Ratio (OR): Cálculo e Quando Usar',
            'Risco Atribuível (RA) e Fração Atribuível na População',
            'Interpretação do IC nas Medidas de Associação',
            'NNT e NNH: Número Necessário para Tratar/Prejudicar'
          ]
        },
        {
          foco: 'Distribuição de Doenças: Tempo, Pessoa, Espaço',
          subfocos: [
            'Distribuição por Pessoa: Idade, Sexo, Raça e Etnia',
            'Padrões Temporais: Sazonalidade e Variações Cíclicas',
            'Distribuição por Ocupação, Escolaridade e Condição Socioeconômica',
            'Distribuição Espacial: Geográfica e Ambiental',
            'Tendências de Longo Prazo e Secular',
            'Mapeamento Epidemiológico e SIG'
          ]
        },
        {
          foco: 'Transição Demográfica e Epidemiológica',
          subfocos: [
            'Transição Epidemiológica: Doenças Infecciosas vs. Crônicas',
            'Estrutura Etária Populacional: Pirâmides e Envelhecimento',
            'Transição Demográfica: Fecundidade e Mortalidade',
            'Carga de Doenças no Brasil: Dupla e Tripla',
            'Transição Nutricional: Desnutrição e Obesidade'
          ]
        },
        {
          foco: 'Determinantes Sociais: Modelo de Dahlgren-Whitehead',
          subfocos: [
            'Iniquidades em Saúde e Gradiente Social',
            'Determinantes Intermediários: Condições de Vida e Trabalho',
            'Modelo de Dahlgren-Whitehead: Camadas e Determinantes',
            'Determinantes Proximais: Comportamento e Estilo de Vida',
            'Determinantes Estruturais: Macroeconomia e Políticas'
          ]
        },
        {
          foco: 'Rastreamento: Critérios de Wilson-Jungner e Lead-time Bias',
          subfocos: [
            'Interpretação de Testes em Diferentes Prevalências',
            'Definição e Aplicação de Sensibilidade',
            'Matriz de Contingência e Acurácia Diagnóstica',
            'Definição e Aplicação de Especificidade',
            'Cálculo e Interpretação de VPP e VPN'
          ]
        },
        {
          foco: 'Causalidade em Epidemiologia',
          subfocos: [
            'Conceitos de Causalidade: Associação vs Causa',
            'Critérios de Hill para Causalidade',
            'Confundimento e Modificação de Efeito',
            'Modelo dos Componentes Causais de Rothman',
            'Vieses: Seleção, Aferição e Informação'
          ]
        }
      ]
    },
    {
      tema: 'Sistema Único de Saúde (SUS)',
      focos: [
        {
          foco: 'Princípios e Diretrizes do SUS',
          subfocos: [
            'Princípios Doutrinários: Universalidade, Integralidade, Equidade',
            'Princípios Organizativos: Descentralização e Regionalização',
            'Hierarquização e Resolubilidade',
            'Participação e Controle Social: Conselhos e Conferências',
            'Complementaridade do Setor Privado'
          ]
        },
        {
          foco: 'Marcos Legais do SUS: Leis 8.080 e 8.142',
          subfocos: [
            'Lei 8.080/1990: Organização e Funcionamento do SUS',
            'Lei 8.142/1990: Participação Social e Financiamento',
            'Pacto pela Saúde 2006 e Decreto 7.508/2011',
            'COAP e Instrumentos de Planejamento do SUS',
            'NOBs e NOAS: Evolução Normativa do SUS'
          ]
        },
        {
          foco: 'Políticas Nacionais de Saúde',
          subfocos: [
            'Política Nacional de Humanização (PNH)',
            'Políticas de Equidade: LGBT+, Negros, Indígenas',
            'Política Nacional de Promoção da Saúde',
            'Política Nacional de Medicamentos e Assistência Farmacêutica',
            'Política Nacional de Educação Permanente'
          ]
        },
        {
          foco: 'História e Modelos de Sistemas de Saúde',
          subfocos: [
            'Modelos Históricos de Sistemas de Saúde',
            'Movimento Sanitário e Reforma da Saúde',
            'Normas Operacionais do SUS (NOB/NOAS)',
            'Constituição de 1988: Saúde como Direito',
            'Brasil Pré-SUS: Previdência e Modelos Assistenciais',
            'História da Saúde Pública no Brasil (Pré-SUS)'
          ]
        },
        {
          foco: 'Controle Social e Conselhos de Saúde',
          subfocos: [
            'Funções e Atribuições dos Conselhos e Conferências de Saúde',
            'Composição e Representatividade dos Conselhos de Saúde',
            'Princípio da Participação Popular e Controle Social no SUS'
          ]
        },
        {
          foco: 'Níveis de Atenção à Saúde',
          subfocos: [
            'Níveis de Prevenção de Leavell e Clark',
            'Atenção Primária: Porta de Entrada e Coordenação',
            'Integralidade e Fluxos entre Níveis',
            'Atenção Secundária: Especialidades e Apoio Diagnóstico',
            'Atenção Terciária e Quaternária: Alta Complexidade'
          ]
        },
        {
          foco: 'Financiamento do SUS',
          subfocos: [
            'EC 29 e LC 141: Mínimos Constitucionais',
            'Fontes de Financiamento: União, Estados e Municípios',
            'Subfinanciamento e Desafios Atuais',
            'Blocos de Financiamento e Transferências F-a-F',
            'Fundos de Saúde e Gestão Financeira'
          ]
        },
        {
          foco: 'Descentralização e Regionalização',
          subfocos: [
            'Regionalização: Definição e Decreto 7.508/11',
            'Descentralização: Princípios e Comando Único',
            'Municipalização: Gestão e Responsabilidades',
            'Comissões Intergestores: Bipartite (CIB)',
            'Comissões Intergestores: Tripartite (CIT)',
            'Comissões Intergestores: Regional (CIR)'
          ]
        },
        {
          foco: 'Financiamento da APS no Previne Brasil: Capitação Ponderada e Desempenho',
          subfocos: [
            'Modelo Previne Brasil: Componentes e Cálculo',
            'Indicadores de Desempenho ISF e ISF-AP',
            'Capitação Ponderada e Cadastro Efetivo',
            'Incentivos Financeiros a Ações Estratégicas'
          ]
        }
      ]
    },
    {
      tema: 'Vigilância em Saúde',
      focos: [
        {
          foco: 'Vigilância Epidemiológica',
          subfocos: [
            'Doenças de Notificação Compulsória: Lista e SVE',
            'Conceito e Funções da Vigilância Epidemiológica',
            'Sistemas de Informação: SIM, SINASC, SINAN',
            'Monitoramento de Indicadores de Saúde',
            'Tipos de Vigilância: Passiva, Ativa e Sentinela'
          ]
        },
        {
          foco: 'Investigação de Surtos e Resposta a Epidemias: Definição de Caso, SINAN e Controle',
          subfocos: [
            'Definição de Caso e Curva Epidêmica',
            'SINAN e Notificação de Agravos',
            'Etapas da Investigação de Surtos',
            'Conceito de Surto, Epidemia, Endemia e Pandemia',
            'Medidas de Contenção e Bloqueio'
          ]
        },
        {
          foco: 'Zoonoses e Controle Vetorial: Arboviroses, Febre Amarela e Manejo Territorial',
          subfocos: [
            'Arboviroses: Dengue, Zika, Chikungunya - Epidemiologia',
            'Febre Amarela: Silvestre vs Urbana e Vacinação',
            'Leishmanioses e Outras Zoonoses de Importância',
            'Raiva: Profilaxia Pré e Pós-Exposição',
            'Controle Vetorial do Aedes aegypti'
          ]
        },
        {
          foco: 'Vigilância do Óbito Materno, Infantil e Fetal: Comitês e Evitabilidade',
          subfocos: [
            'Indicadores de Mortalidade Materna e Coeficientes',
            'Indicadores de Mortalidade Infantil e Neonatal',
            'Mortalidade Fetal e Perinatal',
            'Comitês de Mortalidade e Investigação de Evitabilidade',
            'Declaração de Óbito (DO) e Sistemas de Informação'
          ]
        },
        {
          foco: 'Vigilância Sanitária',
          subfocos: [
            'Conceito e Campos de Atuação da VISA',
            'Regulação de Medicamentos e Produtos de Saúde',
            'Fiscalização de Estabelecimentos e Serviços',
            'ANVISA e Sistema Nacional da Vigilância Sanitária',
            'Vigilância de Eventos Adversos e Tecnovigilância'
          ]
        },
        {
          foco: 'Vigilância Ambiental: Qualidade da Água, VIGIAGUA e Controle de Riscos',
          subfocos: [
            'VIGIAGUA: Cloro Residual e Potabilidade',
            'Saneamento Esgoto: 80% das Doenças Hídricas',
            'VIGIDESASTRES: Desastres Naturais',
            'VIGIAR: Qualidade do Ar',
            'VIGISOLO: Contaminação do Solo'
          ]
        }
      ]
    },
    {
      tema: 'Atenção Primária à Saúde',
      focos: [
        {
          foco: 'Estratégia Saúde da Família',
          subfocos: [
            'Princípios e Atributos da APS/ESF',
            'Acolhimento, Clínica Ampliada e MCCP',
            'Composição e Atribuições da Equipe de Saúde da Família',
            'Ferramentas de Abordagem Familiar: Genograma e Ecomapa'
          ]
        },
        {
          foco: 'Visita Domiciliar e Cuidado Longitudinal',
          subfocos: [
            'PTS: Projeto Terapêutico Singular',
            'Indicações: Acamados, Idosos, Puérperas',
            'Avaliação do Contexto: Genograma e Ecomapa',
            'Cuidado Paliativo Domiciliar',
            'Equipes de Atenção Domiciliar (EMAD/EMAP)'
          ]
        },
        {
          foco: 'Territorialização e Cadastramento',
          subfocos: [
            'Conceito e Delineação do Território Adscrito',
            'Microáreas, Áreas de Risco e Populações Vulneráveis',
            'Mapeamento de Recursos e Diagnóstico Comunitário',
            'Cadastramento de Famílias no e-SUS APS'
          ]
        },
        {
          foco: 'Condições Crônicas na APS',
          subfocos: [
            'Diabetes Mellitus na APS: Rastreamento, Diagnóstico e Manejo',
            'Outras Condições Crônicas: Renais, Infecciosas e Organização do Cuidado',
            'Risco Cardiovascular: Dislipidemia, Obesidade e Tabagismo',
            'Hipertensão Arterial na APS: Diagnóstico, Monitoramento e Tratamento',
            'Saúde Mental e Uso de Substâncias na APS'
          ]
        },
        {
          foco: 'Segurança do Paciente e IRAS: Bundles, Indicadores e Notificação',
          subfocos: [
            'Notificação de Eventos Adversos e Indicadores',
            'Metas Internacionais de Segurança do Paciente',
            'Prevenção de IRAS: Bundles e Protocolos',
            'Higienização das Mãos e Precauções Padrão'
          ]
        },
        {
          foco: 'Prevenção Combinada do HIV na APS: Testagem, PEP e PrEP',
          subfocos: [
            'PrEP: Profilaxia Pré-Exposição e População-Chave',
            'PEP: Profilaxia Pós-Exposição e Indicações',
            'Epidemiologia, Transmissão e Testagem do HIV',
            'TasP e Prevenção da Transmissão Vertical',
            'Violência Sexual e Profilaxias Combinadas'
          ]
        }
      ]
    },
    {
      tema: 'Políticas Públicas de Saúde',
      focos: [
        {
          foco: 'Política Nacional de Atenção Básica',
          subfocos: [
            'PNAB 2017: Portaria 2.436 e Princípios',
            'Atribuições Comuns e Específicas dos Profissionais',
            'Composição das Equipes: eSF, eAB, NASF-AB',
            'Carga Horária, Cobertura e Indicadores PNAB'
          ]
        },
        {
          foco: 'Determinantes Sociais: Políticas de Equidade e Redução de Desigualdades',
          subfocos: [
            'Políticas de Redução de Desigualdades no Brasil',
            'Intersetorialidade e Políticas Públicas Integradas',
            'Populações Vulneráveis: Quilombolas, Indígenas, Pop Rua',
            'Conceito de Equidade em Saúde e Direito à Saúde',
            'Indicadores de Desigualdade em Saúde'
          ]
        },
        {
          foco: 'Redes de Atenção à Saúde',
          subfocos: [
            'APS como Coordenadora do Cuidado na RAS',
            'Conceito e Atributos das RAS: Portaria 4.279',
            'Linhas de Cuidado e Pontos de Atenção',
            'Redes Temáticas: Rede Cegonha, de Urgência, Oncológica',
            'Regulação e Sistemas de Referência/Contrarreferência'
          ]
        },
        {
          foco: 'Programas Prioritários e Linhas de Cuidado no Brasil: TB, Hanseníase, HIV, Hepatites, Sífilis e ISTs',
          subfocos: [
            'ISTs: Sífilis, Hepatites Virais e Abordagem Sindrômica',
            'Programa Nacional de Controle da TB: TDO e Esquemas',
            'Doenças de Notificação Compulsória e Lista Nacional',
            'Vigilância, Busca Ativa e Investigação de Contatos',
            'Programa Nacional de Hanseníase: Classificação e Tratamento'
          ]
        },
        {
          foco: 'Avaliação de Tecnologias em Saúde e Economia da Saúde no SUS',
          subfocos: [
            'Avaliação de Tecnologias em Saúde (ATS) e HTA',
            'Análise de Custo-Efetividade e Métodos Econômicos',
            'Financiamento e Orçamento do SUS',
            'Medicamentos Essenciais e RENAME',
            'Regulação e Saúde Suplementar',
            'Incorporação de Tecnologias no SUS (CONITEC)'
          ]
        }
      ]
    },
    {
      tema: 'Imunizações',
      focos: [
        {
          foco: 'Indicações e Momento Ideal para Vacinação',
          subfocos: [
            'Calendário Vacinal da Criança: PNI',
            'Calendário Vacinal do Adolescente e Adulto',
            'Contraindicações Absolutas e Falsas Contraindicações',
            'Calendário Vacinal do Idoso e Gestante'
          ]
        },
        {
          foco: 'Calendário Nacional de Vacinação: Esquemas, Intervalos e Rede de Frio',
          subfocos: [
            'Calendário Vacinal e Esquemas',
            'Logística e Conservação Específica de Vacinas',
            'Manutenção da Cadeia de Frio (2-8ºC)',
            'Validade e Descarte de Imunobiológicos'
          ]
        },
        {
          foco: 'Eventos Adversos Pós-Vacinação',
          subfocos: [
            'Vigilância e Notificação de Eventos Adversos',
            'Eventos Adversos Locais Pós-Vacinação',
            'Febre Amarela: Vacinotrofia e Contraindicações'
          ]
        },
        {
          foco: 'Vacinas Especiais (CRIE)',
          subfocos: [
            'Vacinas para Imunodeprimidos: HIV, Transplantados, Oncológicos',
            'Vacinas para Asplênicos e Cardiopatas',
            'Indicações para Encaminhamento ao CRIE',
            'Imunoglobulinas e Profilaxia Passiva'
          ]
        }
      ]
    },
    {
      tema: 'Testes Diagnósticos e Rastreamento',
      focos: [
        {
          foco: 'Acurácia de Testes: Sensibilidade, Especificidade e Valores Preditivos',
          subfocos: [
            'Sensibilidade e Especificidade: Conceitos e Cálculos',
            'Valores Preditivos: VPP e VPN',
            'Influência da Prevalência nos Valores Preditivos',
            'Acurácia Global e Tabela 2x2',
            'Likelihood Ratios: Cálculo e Interpretação'
          ]
        }
      ]
    },
    {
      tema: 'Estudos Epidemiológicos e Medidas de Associação',
      focos: [
        {
          foco: 'Validade e Vieses em Estudos',
          subfocos: [
            'Viés de Seleção: Tipos e Exemplos',
            'Métodos de Controle de Vieses: Randomização e Mascaramento',
            'Viés de Informação: Aferição e Memória',
            'Viés de Confusão: Identificação e Controle',
            'Validade Interna e Externa: Conceitos e Avaliação',
            'Métodos de Controle de Vieses: Pareamento e Estratificação'
          ]
        },
        {
          foco: 'Classificação de Estudos: Observacionais vs Experimentais e Níveis de Evidência',
          subfocos: [
            'Estudos Observacionais: Coorte, Caso-Controle, Transversal',
            'Estudos Experimentais: ECR e Quase-experimentais',
            'Vantagens, Limitações e Vieses de Cada Desenho',
            'Revisões Sistemáticas e Metanálises',
            'Níveis de Evidência e Pirâmide de Evidência'
          ]
        },
        {
          foco: 'Impacto Epidemiológico: NNT, RAP e Fração Etiológica',
          subfocos: [
            'NNT: Número Necessário para Tratar',
            'Medidas de Impacto Populacional (PA, RAE, FE)',
            'Medidas de Associação em Estudos Específicos',
            'Razão de Prevalência (RP): Cálculo e Interpretação'
          ]
        }
      ]
    },
    {
      tema: 'Pesquisa Clínica e Fases de Estudos',
      focos: [
        {
          foco: 'Fases I, II, III e IV de Ensaios Clínicos',
          subfocos: [
            'Randomização, Cegamento e Grupo Controle',
            'Desfechos Primários, Secundários e Surrogate',
            'Ética em Pesquisa: TCLE, CEP/CONEP e Resolução 466',
            'Análise por Intenção de Tratar (ITT) e por Protocolo'
          ]
        }
      ]
    },
    {
      tema: 'Saúde do Trabalhador',
      focos: [
        {
          foco: 'Doenças Ocupacionais',
          subfocos: [
            'Lista de Doenças Relacionadas ao Trabalho (LDRT)',
            'Conceito: Doença Profissional vs Doença do Trabalho',
            'PAIR: Perda Auditiva Induzida por Ruído',
            'Dermatoses Ocupacionais e Neoplasias Relacionadas',
            'Pneumoconioses: Silicose, Asbestose, Antracose'
          ]
        },
        {
          foco: 'Acidentes de Trabalho',
          subfocos: [
            'CAT: Comunicação de Acidente de Trabalho',
            'Conceito e Tipos de Acidente de Trabalho',
            'Prevenção de Acidentes e Indicadores',
            'Acidente de Trajeto e Equiparados',
            'Nexo Técnico Epidemiológico (NTEP)'
          ]
        },
        {
          foco: 'Vigilância em Saúde do Trabalhador',
          subfocos: [
            'Notificação de Agravos Relacionados ao Trabalho',
            'Conceito e Objetivos da VISAT',
            'Inspeções Sanitárias em Ambientes de Trabalho',
            'CEREST: Centro de Referência em Saúde do Trabalhador',
            'SINAN-NET: Sistema de Informação de Agravos'
          ]
        },
        {
          foco: 'Normas Regulamentadoras (NRs) Principais',
          subfocos: [
            'NR-7 (PCMSO) e ASO',
            'NR-17 (Ergonomia) e NR-32 (Serviços de Saúde)',
            'NR-6 (EPI) e NR-9 (PGR)',
            'NR-4 (SESMT) e NR-5 (CIPA)',
            'NR-15 (Insalubridade) e NR-16 (Periculosidade)'
          ]
        },
        {
          foco: 'Pneumoconioses Ocupacionais',
          subfocos: [
            'Asbestose: Exposição ao Amianto e Doenças Associadas',
            'Silicose: Etiologia, Diagnóstico e Manifestações Radiológicas',
            'Quadro Clínico e Epidemiologia das Pneumoconioses',
            'Pneumonite por Hipersensibilidade e Bisinose',
            'Prevenção e Controle de Doenças Ocupacionais Respiratórias'
          ]
        },
        {
          foco: 'DORT/LER: Lesões por Esforços Repetitivos',
          subfocos: [
            'Diagnóstico e Nexo Causal',
            'Principais Síndromes: Túnel do Carpo, Epicondilite',
            'Conceito e Fatores de Risco para DORT/LER',
            'Prevenção: Ergonomia e Pausas'
          ]
        },
        {
          foco: 'Transtornos Mentais Ocupacionais',
          subfocos: [
            'Síndrome de Burnout: Diagnóstico e Nexo Ocupacional',
            'Prevenção e Promoção de Saúde Mental no Trabalho',
            'TEPT Ocupacional e Violência no Trabalho',
            'Fatores Psicossociais do Trabalho',
            'Transtornos de Ansiedade e Depressão no Trabalho'
          ]
        },
        {
          foco: 'CEREST e Notificações',
          subfocos: [
            'Notificação Compulsória de Agravos à Saúde do Trabalhador',
            'Atribuições e Estrutura do CEREST',
            'Ações Integradas em Saúde do Trabalhador (Vigilância, Assistência, Promoção)',
            'Rede Nacional de Atenção Integral à Saúde do Trabalhador (RENAST)'
          ]
        },
        {
          foco: 'Evolução Histórica da Saúde do Trabalhador: Ramazzini aos Dias Atuais',
          subfocos: [
            'Revolução Industrial e Medicina do Trabalho',
            'RENAST e PNSTT: Brasil Atual',
            'Ramazzini: De Morbis Artificum Diatriba (1700)'
          ]
        }
      ]
    },
    {
      tema: 'Ética Médica e Bioética',
      focos: [
        {
          foco: 'Código de Ética Médica: Principais Capítulos',
          subfocos: [
            'Princípios Fundamentais, Direitos e Deveres do Médico',
            'Sigilo Médico, Quebra de Sigilo e Confidencialidade',
            'Documentos Médicos: Prontuário, Atestado e Prescrição',
            'Perícia, Auditoria, Publicidade e Situações Éticas Específicas',
            'Transplante de Órgãos, Pesquisa e Relação Médico-Paciente'
          ]
        },
        {
          foco: 'Princípios Bioéticos e Ética em Pesquisa',
          subfocos: [
            'Beneficência, Não-Maleficência, Justiça e Equidade',
            'Ética em Pesquisa com Seres Humanos',
            'Terminalidade: Ortotanásia, DAV e Cuidados Paliativos',
            'Autonomia do Paciente e Consentimento Informado'
          ]
        },
        {
          foco: 'Relação Médico-Paciente e Direitos',
          subfocos: [
            'Autonomia, Decisão Compartilhada e Direitos do Paciente',
            'Método Clínico Centrado na Pessoa (MCCP)',
            'Sigilo em Menores, Violência Sexual e Situações Especiais',
            'Comunicação de Más Notícias e Escuta Ativa'
          ]
        }
      ]
    },
    {
      tema: 'Prevenção de Doenças Crônicas',
      focos: [
        {
          foco: 'Rastreamento de Câncer Colorretal e Próstata: Diretrizes Brasileiras',
          subfocos: [
            'Indicações e Faixa Etária para Rastreamento CCR',
            'Rastreamento do CA de Próstata: Controvérsias do PSA',
            'Rastreamento do CA Colorretal: PSOF e Colonoscopia',
            'Decisão Compartilhada em Rastreamentos Controversos',
            'Critérios de Wilson-Jungner para Rastreamento'
          ]
        },
        {
          foco: 'Tabagismo',
          subfocos: [
            'Abordagem Breve (5 As) e Entrevista Motivacional',
            'Escalas Fagerström e Estágios de Prochaska',
            'TRN: Terapia de Reposição de Nicotina',
            'Bupropiona: Primeira Linha no SUS',
            'Vareniclina: Mecanismo e Eficácia'
          ]
        },
        {
          foco: 'Hipertensão e Diabetes',
          subfocos: [
            'Rastreamento e Diagnóstico de DM2 na APS',
            'Rastreamento e Diagnóstico de HAS na APS',
            'Estratificação de Risco e Metas Terapêuticas',
            'Linha de Cuidado e Acompanhamento pelo ACS',
            'Prevenção de Complicações: Nefropatia, Retinopatia, Pé Diabético'
          ]
        },
        {
          foco: 'Dislipidemias na APS: Rastreamento e Estratificação de Risco Cardiovascular',
          subfocos: [
            'Rastreamento de Dislipidemias: Indicações e Periodicidade',
            'Tratamento: MEV e Estatinas na APS',
            'Prevenção Primária vs Secundária Cardiovascular',
            'Escore de Risco Cardiovascular Global',
            'Classificação e Metas Terapêuticas por Risco CV'
          ]
        },
        {
          foco: 'Obesidade: SISVAN, Guias Alimentares e Promoção da Alimentação Saudável',
          subfocos: [
            'Estratégias de Promoção da Alimentação Saudável',
            'Guia Alimentar para a População Brasileira',
            'Vigilância Alimentar e Nutricional: SISVAN',
            'Classificação do Estado Nutricional por Faixa Etária',
            'Atenção Nutricional na APS: Consultas e Grupos'
          ]
        }
      ]
    },
    {
      tema: 'Medicina Legal e Perícias',
      focos: [
        {
          foco: 'Documentos Médico-Legais',
          subfocos: [
            'Declaração de Óbito: Preenchimento e Causas de Morte',
            'Declaração de Óbito: Emissão e Responsabilidades Médicas',
            'Atestado Médico: Finalidades e Emissão',
            'Receita Médica: Prescrição de Controlados',
            'Prontuário Médico: Aspectos Legais e Documentais',
            'Notificação Compulsória: Doenças e Agravos'
          ]
        },
        {
          foco: 'Tanatologia e Morte',
          subfocos: [
            'Declaração de Óbito: Preenchimento e Responsabilidade',
            'Atestado de Óbito em Situações Especiais: IML, SVO',
            'Diagnóstico de Morte: Clínica e Encefálica',
            'Fenômenos Cadavéricos: Abióticos e Transformativos'
          ]
        },
        {
          foco: 'Responsabilidade Profissional',
          subfocos: [
            'Responsabilidade Ética e Normativa (CFM/Legislação)',
            'Negligência e Omissão de Cuidado',
            'Erro Médico: Pré-requisitos e Julgamento',
            'Atestado Médico: Emissão e Implicações'
          ]
        },
        {
          foco: 'Perícias Médicas',
          subfocos: [
            'Perícia Médica e Reabilitação Profissional',
            'Nexo Causal em Doenças Ocupacionais',
            'Comunicação de Acidente de Trabalho (CAT)',
            'Aptidão para Doação de Órgãos',
            'Avaliação de Incapacidade Laborativa'
          ]
        },
        {
          foco: 'Traumatologia Forense',
          subfocos: [
            'Agentes Causadores de Lesões (Biológico, Físico, Químico)',
            'Violência Sexual: Estupro e Estupro de Vulnerável',
            'Classificação de Lesões Corporais (Leve, Grave, Gravíssima)',
            'Perícia em Acidentes e Trauma'
          ]
        }
      ]
    },
    {
      tema: 'Bioestatística',
      focos: [
        {
          foco: 'Interpretação do P-valor e IC',
          subfocos: [
            'Relação entre P-valor e IC Quando Cruzam 1 ou 0',
            'Conceito e Interpretação Correta do P-valor',
            'Intervalo de Confiança 95%: Cálculo e Significado',
            'Erros Comuns na Interpretação do P-valor',
            'Significância Estatística vs Significância Clínica'
          ]
        },
        {
          foco: 'Estatística Descritiva',
          subfocos: [
            'Medidas de Tendência Central: Média, Mediana e Moda',
            'Tabelas de Frequência e Análise Exploratória',
            'Distribuição Normal e Assimetria',
            'Medidas de Dispersão: Variância, DP e Amplitude',
            'Percentis, Quartis e Coeficiente de Variação'
          ]
        },
        {
          foco: 'Tipos de Variáveis e Medidas-Resumo',
          subfocos: [
            'Medidas-Resumo por Tipo de Variável',
            'Variáveis Qualitativas: Nominais e Ordinais',
            'Variáveis Quantitativas: Discretas e Contínuas',
            'Escalas de Medida: Nominal, Ordinal, Intervalar, Razão',
            'Variáveis Dependentes, Independentes e de Confusão'
          ]
        },
        {
          foco: 'Amostragem e Representação Gráfica',
          subfocos: [
            'Amostragem Probabilística: Simples, Sistemática e Estratificada',
            'Representação Gráfica: Histogramas, Box-Plot e Pirâmides',
            'Amostragem Não-Probabilística e Vieses',
            'Cálculo do Tamanho Amostral e Erros',
            'Amostragem por Conglomerados e Técnicas Complexas'
          ]
        },
        {
          foco: 'Estatística Inferencial: Conceitos de Hipótese e Erro Tipo I/II',
          subfocos: [
            'Erros Tipo I (Alfa) e Tipo II (Beta)',
            'Conceitos de Inferência: População e Amostra',
            'Poder Estatístico e Fatores que o Influenciam',
            'Distribuições Amostrais e Teorema Central do Limite'
          ]
        },
        {
          foco: 'Curva ROC e Likelihood Ratios em Testes Diagnósticos',
          subfocos: [
            'Likelihood Ratios (LR+ e LR-) e Probabilidade Pós-Teste',
            'AUC: Área sob a Curva e Capacidade Discriminativa',
            'Construção e Interpretação da Curva ROC',
            'Escolha do Ponto de Corte e Comparação de Testes'
          ]
        },
        {
          foco: 'Testes de Hipótese: T-Student, Qui-quadrado e ANOVA',
          subfocos: [
            'Qui-quadrado e Teste Exato de Fisher',
            'Teste t de Student: Pareado e Não Pareado',
            'Formulação de Hipóteses H0 e H1',
            'Pressupostos e Escolha do Teste Adequado',
            'ANOVA e Comparações Múltiplas (Bonferroni, Tukey)'
          ]
        },
        {
          foco: 'Testes Não Paramétricos e Escolha do Método Estatístico',
          subfocos: [
            'Mann-Whitney e Wilcoxon: Comparação de Grupos',
            'Indicações para Testes Não-Paramétricos',
            'Correlação de Spearman vs Pearson',
            'Kruskal-Wallis: Alternativa à ANOVA'
          ]
        }
      ]
    },
    {
      tema: 'Medicina Baseada em Evidências',
      focos: [
        {
          foco: 'Hierarquia da Evidência e Pesquisa Clínica',
          subfocos: [
            'Hierarquia de Evidência: Níveis e Tipos de Estudo',
            'Definição e Princípios da MBE',
            'Metodologia de Pesquisa: Fases e Estudos',
            'Aplicação Clínica da MBE e Tomada de Decisão',
            'Bases de Dados e Fontes de Evidência',
            'Sistemas de Avaliação de Evidências: GRADE e Oxford'
          ]
        }
      ]
    },
    {
      tema: 'Saúde da Mulher',
      focos: [
        {
          foco: 'Rastreamento do Câncer de Mama na APS: Fluxos e Diretrizes',
          subfocos: [
            'Mamografia Bienal 50-69 Anos (MS/INCA)',
            'ECM: Exame Clínico das Mamas na APS',
            'BI-RADS e Fluxo de Encaminhamento',
            'Alto Risco: BRCA1/2 e Rastreamento Precoce'
          ]
        },
        {
          foco: 'Rastreamento do Câncer de Colo Uterino',
          subfocos: [
            'Diretrizes de Rastreamento: Faixa Etária e Intervalo',
            'Coleta de Citologia Oncótica e Procedimento',
            'Vacinação HPV e Prevenção Primária',
            'Classificação de Bethesda e Condutas',
            'Papel do HPV na Carcinogênese Cervical'
          ]
        },
        {
          foco: 'Planejamento Familiar',
          subfocos: [
            'Direitos Reprodutivos e Lei do Planejamento Familiar',
            'Critérios de Elegibilidade da OMS para Anticoncepção',
            'Métodos Hormonais: Pílulas, Injetáveis, Implantes',
            'Métodos Definitivos: Laqueadura e Vasectomia',
            'DIU de Cobre e Hormonal - Indicações e Contraindicações'
          ]
        },
        {
          foco: 'Pré-natal de Baixo Risco: Atribuições da APS e Estratificação de Risco',
          subfocos: [
            'Consultas de Pré-natal na APS: Periodicidade e Conteúdo',
            'Estratificação de Risco Gestacional',
            'Sinais de Alerta e Encaminhamento para Alto Risco',
            'Exames de Rotina e Momento de Solicitação',
            'Suplementação: Ácido Fólico, Ferro e Vitaminas'
          ]
        }
      ]
    },
    {
      tema: 'Saúde Mental',
      focos: [
        {
          foco: 'Transtornos Mentais Comuns na APS',
          subfocos: [
            'Manejo da Depressão na APS',
            'Rastreamento de TMC: PHQ-9, GAD-7',
            'Manejo da Ansiedade na APS',
            'Uso de Psicotrópicos na APS: Indicações e Riscos',
            'Risco de Suicídio: Avaliação e Manejo'
          ]
        },
        {
          foco: 'Rede de Atenção Psicossocial',
          subfocos: [
            'Componentes da RAPS: CAPS, UBS, Urgência, Residenciais',
            'CAPS: Tipos (I, II, III, AD, i) e Indicações',
            'Reforma Psiquiátrica e Desinstitucionalização',
            'Matriciamento em Saúde Mental na APS'
          ]
        },
        {
          foco: 'Reforma Psiquiátrica',
          subfocos: [
            'Internação: Voluntária, Involuntária, Compulsória',
            'Desinstitucionalização e Integração',
            'CAPS como Substitutivo ao Hospital Psiquiátrico',
            'Lei 10.216/2001: Lei Paulo Delgado',
            'Residências Terapêuticas e PVC'
          ]
        }
      ]
    },
    {
      tema: 'Saúde do Idoso',
      focos: [
        {
          foco: 'Política Nacional do Idoso',
          subfocos: [
            'Estatuto do Idoso e Lei 10.741/2003',
            'Política Nacional de Saúde da Pessoa Idosa',
            'Envelhecimento Ativo e Promoção da Saúde',
            'Rede de Atenção à Saúde do Idoso'
          ]
        },
        {
          foco: 'Prevenção de Quedas',
          subfocos: [
            'Prevenção Multifatorial: Exercícios, Ambiente, Medicamentos',
            'Fatores de Risco para Quedas em Idosos',
            'Consequências das Quedas e Síndrome Pós-queda',
            'Avaliação do Risco de Quedas: Testes e Escalas'
          ]
        },
        {
          foco: 'Caderneta de Saúde da Pessoa Idosa (MS) e Avaliação Funcional',
          subfocos: [
            'Avaliação Multidimensional e Cuidado Integral',
            'Prevenção de Doenças e Promoção da Saúde',
            'Instrumentos de Acompanhamento e Registro'
          ]
        },
        {
          foco: 'Síndrome de Fragilidade: Critérios de Fried, Sarcopenia e Avaliação Geriátrica',
          subfocos: [
            'Avaliação Geriátrica Ampla (AGA)',
            'Conceito e Critérios de Fried para Fragilidade',
            'Sarcopenia: Diagnóstico e Manejo'
          ]
        }
      ]
    },
    {
      tema: 'Saúde da Criança',
      focos: [
        {
          foco: 'Puericultura',
          subfocos: [
            'Consultas de Puericultura: Periodicidade e Conteúdo',
            'Orientações Alimentares: Aleitamento e Alimentação',
            'Prevenção de Acidentes e Vacinação na Puericultura',
            'Avaliação do Crescimento: Curvas OMS e Marcos',
            'Avaliação do Desenvolvimento Neuropsicomotor'
          ]
        },
        {
          foco: 'AIDPI: Manejo Integrado das Doenças Prevalentes da Infância',
          subfocos: [
            'Classificação de Risco e Sinais de Perigo na AIDPI',
            'Manejo de Diarreia e Desidratação',
            'Manejo da Tosse/Dificuldade Respiratória',
            'Acompanhamento e Quando Retornar Imediatamente',
            'Avaliação Nutricional e da Alimentação'
          ]
        }
      ]
    }
  ]
};
