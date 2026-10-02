import { SpecialtyHierarchy } from '@/types';

export const pediatriaHierarchy: SpecialtyHierarchy = {
  especialidade: 'Pediatria',
  temas: [
    {
      tema: 'Puericultura e Crescimento',
      focos: [
        {
          foco: 'Crescimento e Desenvolvimento',
          subfocos: [
            'Avaliação Antropométrica e Curvas de Crescimento',
            'Z-Score Interpretação',
            'Velocidade de Crescimento',
            'Baixa Estatura: Investigação',
            'Curvas OMS: Peso, Estatura, PC',
            'Idade Óssea: Quando Solicitar'
          ]
        },
        {
          foco: 'Aleitamento Materno',
          subfocos: [
            'Manejo de Dificuldades e Desafios na Amamentação',
            'Composição e Benefícios do Leite Materno',
            'Contraindicações Formais e Absolutas ao Aleitamento Materno',
            'Técnica de Amamentação e Pega Correta',
            'Armazenamento e Manejo do Leite Materno Ordenhado',
            'Avaliação do Ganho Ponderal e Crescimento do Lactente'
          ]
        },
        {
          foco: 'DNPM: Marcos do Desenvolvimento',
          subfocos: [
            'Motor Grosso: Sentar, Engatinhar, Andar',
            'Motor Fino: Pinça, Desenho, Escrita',
            'Linguagem: Balbucio, Palavras, Frases',
            'Social/Adaptativo: Sorriso, Estranho, Tchau',
            'Sinais de Alerta por Idade (Caderneta)',
            'Caderneta de Saúde: Vigilância do DNPM'
          ]
        },
        {
          foco: 'Vacinas: Indicações, Contraindicações e Eventos Adversos',
          subfocos: [
            'EAPV: Notificação e Conduta',
            'Intervalos Mínimos entre Doses',
            'Contraindicações Absolutas e Relativas',
            'Falsas Contraindicações',
            'Vacinas Vivas: Imunossuprimidos'
          ]
        },
        {
          foco: 'Calendário Vacinal',
          subfocos: [
            '2-6 meses: Penta, VIP, Rotavírus, Pneumo10',
            'Nascimento: BCG e Hepatite B',
            '12-15 meses: Tríplice Viral, Varicela, Hepatite A',
            'EAPV: Eventos Adversos Pós-Vacinais',
            'Contraindicações: Imunossuprimidos e Vacinas Vivas',
            '4 anos: Reforços DTP, VIP e Varicela'
          ]
        },
        {
          foco: 'Suplementação de Ferro e Vitamina D por Faixa Etária',
          subfocos: [
            'SBP vs MS: Diferenças nas Recomendações',
            'Ferro Profilático: 1mg/kg/dia',
            'Vitamina D: 400UI/dia até 2 Anos',
            'Prematuros: 2-4mg/kg/dia',
            'Quando Iniciar e Quando Suspender'
          ]
        },
        {
          foco: 'Alimentação Complementar',
          subfocos: [
            'Início: 6 Meses Completos',
            'Introdução de Proteínas e Ovos',
            'Alimentos Proibidos: Mel, Açúcar, Sal',
            'BLW vs Tradicional',
            'Janela Imunológica: Prevenção de Alergias'
          ]
        },
        {
          foco: 'Segurança da Criança e Prevenção de Acidentes',
          subfocos: [
            'Ambiente Doméstico: Quedas, Queimaduras',
            'Transporte: Bebê-Conforto, Cadeirinha',
            'Sono Seguro: Posição Supina, Síndrome Morte Súbita',
            'Intoxicações: Medicamentos e Produtos de Limpeza',
            'Afogamento: Principal Causa 1-4 Anos'
          ]
        }
      ]
    },
    {
      tema: 'Neonatologia',
      focos: [
        {
          foco: 'Reanimação Neonatal',
          subfocos: [
            'VPP: Técnica e Frequência',
            'Passos Iniciais: Aquecer, Posicionar, Aspirar',
            'Clampeamento Tardio do Cordão',
            'Adrenalina: Via e Dose',
            'IOT: Quando Indicar',
            'Massagem Cardíaca: Técnica 3:1'
          ]
        },
        {
          foco: 'Icterícia Neonatal',
          subfocos: [
            'Incompatibilidade ABO e Rh',
            'Fisiológica vs Patológica: Critérios',
            'Icterícia do Leite Materno',
            'Fototerapia: Indicações e Técnica',
            'Zonas de Kramer',
            'Nomograma de Bhutani'
          ]
        },
        {
          foco: 'Triagem Neonatal',
          subfocos: [
            'Teste do Pezinho: Doenças Rastradas',
            'Teste do Coraçãozinho: Oximetria',
            'Teste do Olhinho: Reflexo Vermelho',
            'Teste da Orelhinha: EOA',
            'Pezinho Ampliado: 50+ Doenças'
          ]
        },
        {
          foco: 'Sífilis Congênita e Infecção por CMV',
          subfocos: [
            'Sífilis: VDRL Líquor e Penicilina Cristalina',
            'Sífilis: Tratamento Materno Inadequado',
            'CMV: Calcificações Periventriculares',
            'CMV: Ganciclovir/Valganciclovir',
            'Follow-up Auditivo: Ambas as Condições'
          ]
        },
        {
          foco: 'Infecções Congênitas TORCH',
          subfocos: [
            'Toxoplasmose: Calcificações Difusas e Coriorretinite',
            'Rubéola Congênita: Surdez, Catarata, Cardiopatia',
            'CMV Congênito: Calcificações Periventriculares',
            'Zika Congênita: Microcefalia e Artrogripose',
            'Sífilis Congênita: Rinite Sifilítica e Lesões Ósseas',
            'Herpes Neonatal: Parto e Aciclovir'
          ]
        },
        {
          foco: 'Sepse Neonatal Precoce e Tardia: Protocolos e Antibiótico',
          subfocos: [
            'Precoce (<72h): GBS, E. coli, Listeria',
            'Triagem: PCR, Hemograma, Hemocultura',
            'ATB Empírico: Ampicilina + Gentamicina',
            'Fatores de Risco: RPMO, Febre Materna, Corioamnionite',
            'Tardia (>72h): CoNS, S. aureus'
          ]
        },
        {
          foco: 'Distúrbios Metabólicos do RN',
          subfocos: [
            'Hipoglicemia Neonatal: Triagem e Tratamento',
            'Hipercalcemia: ECG e Tratamento',
            'Hipocalcemia: Precoce vs Tardia',
            'Hipernatremia: Desidratação e Manejo',
            'Hipomagnesemia: Associação com Hipocalcemia'
          ]
        },
        {
          foco: 'Prematuridade',
          subfocos: [
            'Classificação: Extrema, Muito, Moderada, Tardio',
            'Follow-up: Idade Corrigida até 2 Anos',
            'DBP: Displasia Broncopulmonar',
            'HPIV: Hemorragia Peri-Intraventricular',
            'ROP: Retinopatia da Prematuridade'
          ]
        },
        {
          foco: 'Malformações Congênitas e Defeitos da Parede Abdominal Neonatal',
          subfocos: [
            'Gastrosquise: Defeito Lateral ao Cordão',
            'Atresia Duodenal: Sinal da Dupla Bolha',
            'Atresia de Esôfago: Tipos e Fístula Traqueoesofágica',
            'Ânus Imperfurado e Malformações Anorretais',
            'Onfalocele: Defeito com Saco Peritoneal'
          ]
        },
        {
          foco: 'Distúrbios Respiratórios Neonatais Avançados',
          subfocos: [
            'TTBN: Taquipneia Transitória do RN',
            'HPP: Hipertensão Pulmonar Persistente',
            'SDR: Surfactante e CPAP',
            'SAM: Síndrome Aspiração Meconial',
            'Hérnia Diafragmática Congênita'
          ]
        },
        {
          foco: 'Síndrome do Desconforto Respiratório do RN: CPAP e Surfactante',
          subfocos: [
            'Fisiopatologia: Deficiência de Surfactante',
            'CPAP Nasal Não Invasivo',
            'RX: Vidro Moído e Broncograma Aéreo',
            'Surfactante Exógeno: INSURE',
            'Corticoide Antenatal: Prevenção'
          ]
        },
        {
          foco: 'Enterocolite Necrosante: Risco e Manejo',
          subfocos: [
            'Fatores de Risco: Prematuridade, Fórmula',
            'RX: Pneumatose Intestinal',
            'Tratamento: NPO, ATB, Suporte',
            'Prevenção: Leite Materno',
            'Classificação de Bell: Estágios'
          ]
        },
        {
          foco: 'Prematuridade: Retinopatia, DBP e Hemorragia Peri-Intraventricular',
          subfocos: [
            'HPIV: Classificação de Papile',
            'DBP: Critérios Diagnósticos',
            'ROP: Classificação: Zonas e Estágios',
            'LPV: Leucomalácia Periventricular',
            'ROP: Tratamento Laser e Anti-VEGF'
          ]
        },
        {
          foco: 'Kernicterus e Encefalopatia Bilirrubínica',
          subfocos: [
            'Encefalopatia Bilirrubínica Aguda',
            'Fatores de Risco: Hemólise, Prematuridade',
            'Kernicterus Crônico: Sequelas',
            'Exsanguineotransfusão: Indicações',
            'Bilirrubina Indireta: Toxicidade Neurológica'
          ]
        },
        {
          foco: 'Principais Síndromes Genéticas Neonatais',
          subfocos: [
            'Síndrome de Down (Trissomia 21)',
            'Síndrome de Edwards (Trissomia 18)',
            'Síndrome de Turner (45,X)',
            'Síndrome de Patau (Trissomia 13)',
            'Síndrome de DiGeorge (22q11.2 Deletion)',
            'Síndrome de Noonan'
          ]
        }
      ]
    },
    {
      tema: 'Doenças Infecciosas Pediátricas',
      focos: [
        {
          foco: 'Doenças Exantemáticas',
          subfocos: [
            'Sarampo: Diagnóstico, Clínica e Prevenção',
            'Varicela (Catapora): Lesões Vesiculares e Manejo',
            'Escarlatina: Quadro Clínico e Diagnóstico Diferencial',
            'Exantema Súbito (Roséola): Febre e Exantema Pós-Defervescência',
            'Dengue: Manifestações Clínicas e Complicações',
            'Eritema Infeccioso (5ª Doença): Parvovírus B19 e Manifestações',
            'Rubéola: Exantema e Linfonodomegalia Retroauricular'
          ]
        },
        {
          foco: 'Infecções de Vias Aéreas Superiores: OMA e Sinusite Bacteriana',
          subfocos: [
            'OMA: Antibioticoterapia e Watch-and-Wait',
            'Sinusite Aguda: Critérios AAP (10 dias, Bifásica, Grave)',
            'Faringotonsilite Estreptocócica: Critérios de Centor',
            'OMA: Critérios Diagnósticos e Otoscopia Pneumática',
            'Sinusite: Complicações Orbitárias e Intracranianas',
            'OMA de Repetição: Critérios e Timpanostomia'
          ]
        },
        {
          foco: 'Meningites',
          subfocos: [
            'Meningite Bacteriana: Agentes Etiológicos',
            'Profilaxia de Contatos: Rifampicina',
            'Punção Lombar: Técnica e Interpretação do LCR',
            'Etiologia por Faixa Etária: RN vs Lactente vs Escolar',
            'Sequelas: Surdez Neurossensorial e HIC',
            'ATB Empírico: Ceftriaxone + Ampicilina em RN'
          ]
        },
        {
          foco: 'Gastroenterites',
          subfocos: [
            'Diarreia Invasiva vs Aquosa: Diferenciação',
            'Rotavírus: Principal Agente e Vacina',
            'ATB: Quando Indicar (Shigella, Cólera)',
            'TRO: Sais OMS e Osmolaridade Reduzida',
            'Zinco: Suplementação Obrigatória',
            'Fase de Expansão e Manutenção Venosa'
          ]
        },
        {
          foco: 'Parasitoses Intestinais Pediátricas',
          subfocos: [
            'Oxiuríase (Enterobíase): Prurido Anal Noturno',
            'Ascaridíase: Síndrome de Löffler e Obstrução',
            'Giardíase: Síndrome Disabsortiva',
            'Ancilostomíase: Anemia Ferropriva e Geofagia',
            'Teníase e Cisticercose: Ciclo e Neurocisticercose'
          ]
        },
        {
          foco: 'Prevenção de Doenças Transmitidas por Vetores e Reações a Picadas de Insetos',
          subfocos: [
            'Leishmaniose: Tegumentar e Visceral (Calazar)',
            'Dengue Pediátrica: Sinais de Alarme',
            'Malária: Plasmodium e Profilaxia',
            'Reações a Picadas: Prurigo Estrófulo',
            'Zika e Chikungunya: Manifestações na Criança'
          ]
        },
        {
          foco: 'Tuberculose Pediátrica',
          subfocos: [
            'Contato Domiciliar e Quimioprofilaxia',
            'TB Pulmonar: RX e Lavado Gástrico',
            'Sistema de Pontuação (Escore) do MS',
            'Prova Tuberculínica (PPD/Mantoux)',
            'Tratamento: RIPE e Particularidades Pediátricas'
          ]
        }
      ]
    },
    {
      tema: 'Pneumologia Pediátrica',
      focos: [
        {
          foco: 'Pneumonia Pediátrica',
          subfocos: [
            'Etiologia por Idade: VSR, Pneumococo, Mycoplasma',
            'Complicações: Derrame Pleural e Empiema',
            'Sinais de Gravidade: Tiragem, BAN, SatO2<92%',
            'Critérios de Internação e Gravidade',
            'ATB Hospitalar: Ampicilina ou Penicilina Cristalina',
            'ATB Ambulatorial: Amoxicilina',
            'Pneumonia Atípica: Macrolídeos'
          ]
        },
        {
          foco: 'Asma na Infância',
          subfocos: [
            'GINA Pediátrico: Steps de Tratamento',
            'Asma em Pediatria: Diagnóstico e Apresentação Clínica',
            'Crise: SABA + Corticoide Sistêmico',
            'Critérios de Castro-Rodríguez (API)',
            'Fenótipos: Sibilância Transitória vs Persistente',
            'Dispositivos: Espaçador é Obrigatório'
          ]
        },
        {
          foco: 'Bronquiolite Viral Aguda',
          subfocos: [
            'Tratamento: Suporte (O2, Hidratação)',
            'VSR: Principal Agente Etiológico',
            'Clínica: Sibilância e Hiperinsuflação',
            'O que NÃO Fazer: Beta-2, Corticoide, Raio',
            'Critérios de Internação: SatO2 e FR',
            'Fatores de Risco: Prematuridade, Cardiopatia'
          ]
        },
        {
          foco: 'Fibrose Cística',
          subfocos: [
            'Manifestações GI: Íleo Meconial, Insuf. Pancreática',
            'Teste do Suor: Diagnóstico Confirmatório',
            'Manifestações Pulmonares: Bronquiectasias',
            'Colonização por P. aeruginosa',
            'Triagem: IRT no Pezinho',
            'Enzimas Pancreáticas e DNase'
          ]
        },
        {
          foco: 'Coqueluche (Pertussis)',
          subfocos: [
            'Tratamento Antimicrobiano e Profilaxia',
            'Diagnóstico e Achados Laboratoriais',
            'Quadro Clínico e Sintomatologia Clássica',
            'Fases da Doença e Apresentação Atípica',
            'Complicações e Gravidade em Lactentes'
          ]
        },
        {
          foco: 'Asma: Crise Aguda e Manejo na Emergência Pediátrica',
          subfocos: [
            'Manejo de Crise Asmática Grave (Estado de Mal Asmático)',
            'Manejo de Crise Asmática Leve a Moderada',
            'Diagnóstico Diferencial e Avaliação da Asma',
            'Obstrução de Vias Aéreas em Lactentes: Diagnóstico',
            'Tratamento de Manutenção e Prevenção de Asma'
          ]
        },
        {
          foco: 'Crupe, Laringotraqueíte e Estridor Agudo',
          subfocos: [
            'Tratamento: Dexametasona + Nebulização Adrenalina',
            'Etiologia: Parainfluenza',
            'Diagnóstico Diferencial: Epiglotite',
            'Tríade: Tosse Ladrante, Estridor, Rouquidão',
            'Classificação: Westley Score'
          ]
        },
        {
          foco: 'Prevenção do VSR: Nirsevimabe e Palivizumabe',
          subfocos: [
            'Indicações de Palivizumabe para Prematuros e Cardiopatas',
            'Prematuros: <28 sem: Indicação Palivizumabe',
            'Cardiopatas e Displasia Broncopulmonar',
            'Nirsevimabe: Profilaxia do VSR (Novo: Dose Única)',
            'Sazonalidade: Abril a Setembro no Brasil'
          ]
        }
      ]
    },
    {
      tema: 'Hematologia Pediátrica',
      focos: [
        {
          foco: 'Anemias Pediátricas',
          subfocos: [
            'Anemia Ferropriva: Diagnóstico e Etiologia',
            'Anemia Hemolítica Autoimune: Coombs Direto',
            'Talassemia: Minor vs Major',
            'Ferropriva: Principal Causa e Profilaxia',
            'Anemia Fisiológica do Lactente',
            'Esferocitose Hereditária: Teste de Fragilidade'
          ]
        },
        {
          foco: 'Leucemias Pediátricas',
          subfocos: [
            'Apresentação Clínica e Diagnóstico de LLA',
            'Apresentação: Pancitopenia, Dor Óssea',
            'LLA: Principal Neoplasia Pediátrica',
            'Síndrome de Lise Tumoral',
            'Mielograma: Diagnóstico',
            'Fator Prognóstico: Idade, Leucometria'
          ]
        },
        {
          foco: 'Doença Falciforme: Triagem Neonatal, Crises e Profilaxias',
          subfocos: [
            'Profilaxia: Penicilina e Vacinas',
            'Sequestro Esplênico: Emergência',
            'Triagem Neonatal: Eletroforese',
            'Crise Álgica: Hidratação e Analgesia',
            'Hidroxiureia: Indicações',
            'AVC: Rastreamento com Doppler'
          ]
        },
        {
          foco: 'Púrpuras e Plaquetopenia',
          subfocos: [
            'PTI: Púrpura Trombocitopênica Idiopática',
            'Sinais de Alarme: Sangramento Ativo',
            'Tratamento: IVIG, Corticoide',
            'PTT e SHU: Emergências',
            'Púrpura de Henoch-Schönlein'
          ]
        },
        {
          foco: 'Hemofilia e Coagulopatias',
          subfocos: [
            'Coagulopatias Adquiridas: Deficiência de Vitamina K',
            'Hemofilia: Diagnóstico e Manifestações Clínicas',
            'Distúrbios da Coagulação: Trombose e Anticoagulação',
            'Hemofilia: Manejo e Tratamento de Complicações',
            'Hemofilia: Genética e Aconselhamento'
          ]
        }
      ]
    },
    {
      tema: 'Gastroenterologia Pediátrica',
      focos: [
        {
          foco: 'Desidratação na GECA: TRO e Hidratação Venosa',
          subfocos: [
            'Plano A, B e C',
            'Hidratação Venosa: Fase Rápida e Manutenção',
            'Princípios e Indicações da Terapia de Reidratação Oral (TRO)',
            'Classificação OMS: Sem, Alguma, Grave',
            'Suplementação de Zinco na Diarreia Aguda',
            'Sinais de Reidratação: Peso, Diurese',
            'Composição e Administração da Solução de Reidratação Oral (SRO)'
          ]
        },
        {
          foco: 'Constipação Funcional e Dor Abdominal Recorrente',
          subfocos: [
            'Dor Abdominal Recorrente Funcional (DARF)',
            'Sinais de Alarme e Causas Orgânicas',
            'Diagnóstico de Constipação Funcional (Critérios Roma IV)',
            'Fecaloma: Diagnóstico e Desimpactação',
            'PEG e Lactulose: Tratamento Farmacológico',
            'Tratamento de Manutenção da Constipação'
          ]
        },
        {
          foco: 'Refluxo Gastroesofágico',
          subfocos: [
            'Regurgitação Fisiológica: Caracterização e Manejo Inicial',
            'Doença do Refluxo Gastroesofágico (DRGE): Diagnóstico Clínico e Sinais de Alarme',
            'Manejo Não Farmacológico e Medidas Posturais',
            'Tratamento Farmacológico: Inibidores da Bomba de Prótons (IBP)',
            'Complicações da DRGE: Esofagite e Outras Manifestações Graves',
            'Diagnóstico Diferencial de Vômitos em Lactentes (Estenose Pilórica, Vômitos Biliosos e Outras Causas)',
            'Indicação Cirúrgica: Fundoplicatura de Nissen'
          ]
        },
        {
          foco: 'Intussuscepção: Diagnóstico por US e Enema Terapêutico',
          subfocos: [
            'Diagnóstico por Imagem na Intussuscepção',
            'Quadro Clínico e Epidemiologia da Intussuscepção',
            'Redução Não Cirúrgica da Intussuscepção',
            'Outras Emergências Cirúrgicas Pediátricas',
            'Tratamento Cirúrgico e Complicações da Intussuscepção'
          ]
        },
        {
          foco: 'Alergia à Proteína do Leite de Vaca: Fenótipo IgE e Não IgE',
          subfocos: [
            'Não IgE Mediada: Proctocolite, FPIES',
            'Fórmulas: Extensamente Hidrolisada, Aminoácidos',
            'Diagnóstico: Teste de Provocação Oral',
            'IgE Mediada: Urticária, Anafilaxia',
            'Reintrodução: Escada do Leite'
          ]
        },
        {
          foco: 'Doença Celíaca',
          subfocos: [
            'Diagnóstico: Sorologia e Biópsia Intestinal',
            'Quadro Clínico e Manifestações Gastrointestinais',
            'Diagnóstico Diferencial: Outras Enteropatias e Condições GI',
            'Tratamento: Dieta Sem Glúten',
            'Associações e Comorbidades'
          ]
        }
      ]
    },
    {
      tema: 'Endocrinologia Pediátrica',
      focos: [
        {
          foco: 'Puberdade Precoce e Tardia',
          subfocos: [
            'Puberdade Precoce Central: Diagnóstico e Etiologia',
            'Telarca < 8 Anos (Meninas)',
            'Central vs Periférica: Diferenciação',
            'Teste de Estímulo com GnRH',
            'Aumento Testicular < 9 Anos (Meninos)',
            'Análogos de GnRH: Tratamento Central'
          ]
        },
        {
          foco: 'Diabetes Mellitus Tipo 1',
          subfocos: [
            'CAD: Cetoacidose Diabética',
            'Diagnóstico e Fisiopatologia do DM1',
            'Diagnóstico: Glicemia, HbA1c, Autoanticorpos',
            'Insulinoterapia: Basal-Bolus',
            'Metas Glicêmicas Pediátricas',
            'Contagem de Carboidratos'
          ]
        },
        {
          foco: 'Baixa Estatura',
          subfocos: [
            'Atraso Constitucional do Crescimento e Puberdade (ACCP) e Baixa Estatura Familiar (BEF)',
            'Avaliação Diagnóstica da Baixa Estatura',
            'Síndromes Genéticas e Cromossomopatias Associadas à Baixa Estatura',
            'Hipotireoidismo e Baixa Estatura',
            'Deficiência de Hormônio de Crescimento (GH) - Diagnóstico e Terapêutica',
            'Outras Causas Endócrinas, Metabólicas e Nutricionais de Baixa Estatura'
          ]
        },
        {
          foco: 'Desordens do Desenvolvimento Sexual',
          subfocos: [
            'HAC: Causa Mais Comum (46,XX)',
            'Cariótipo e 17-OHP',
            'Genitália Ambígua: Emergência',
            'Registro Civil: Orientações',
            'Abordagem Multidisciplinar'
          ]
        },
        {
          foco: 'Hipotireoidismo Congênito',
          subfocos: [
            'Triagem Neonatal: Teste do Pezinho e Protocolos',
            'Quadro Clínico e Manifestações Neonatais do HC',
            'Outras Tireoidopatias Pediátricas e Diagnóstico Diferencial',
            'Tratamento, Manejo e Prognóstico do HC',
            'Diagnóstico Laboratorial Confirmatório do HC'
          ]
        }
      ]
    },
    {
      tema: 'Urgências Pediátricas',
      focos: [
        {
          foco: 'Trauma Pediátrico',
          subfocos: [
            'TCE Pediátrico: Glasgow e PECARN',
            'ATLS Pediátrico: ABCDE Adaptado',
            'Queimaduras: Lund-Browder e Reposição',
            'Trauma Abdominal: Fígado e Baço',
            'Afogamento: Suporte e Aquecimento',
            'Maus-Tratos Infantis: Sinais de Alerta'
          ]
        },
        {
          foco: 'Intoxicações Pediátricas',
          subfocos: [
            'Principais Agentes: Paracetamol, Organofosforados',
            'Antídotos Específicos: NAC, Atropina',
            'Carvão Ativado: Indicações',
            'ABCDE e Estabilização',
            'Lavagem Gástrica: Raramente Indicada'
          ]
        },
        {
          foco: 'Choque Pediátrico: Reconhecimento e Estabilização',
          subfocos: [
            'Expansão Volêmica Inicial',
            'Sinais Precoces: Taquicardia, TEC Prolongado',
            'Acesso Venoso e IO',
            'Tipos: Hipovolêmico, Distributivo, Cardiogênico',
            'Sinal Tardio: Hipotensão'
          ]
        },
        {
          foco: 'Febre sem Foco de 0 a 36 Meses: Estratificação de Risco e Condutas',
          subfocos: [
            'Step-by-Step e PECARN: Novos Critérios',
            'Exames: Hemograma, EAS, PCR, Procalcitonina',
            '29-90 dias: Estratificação de Risco',
            '< 28 dias: Internação e ATB Empírico',
            'Rochester, Boston, Philadelphia: Critérios'
          ]
        },
        {
          foco: 'Corpo Estranho em Vias Aéreas: Aspiração e Desobstrução',
          subfocos: [
            'RX e Broncoscopia Diagnóstica',
            'Manobra de Heimlich e Tapotagem',
            'Corpos Estranhos Específicos: Baterias e Objetos Pontiagudos',
            'Epidemiologia: < 3 Anos, Amendoim',
            'Broncoscopia Rígida: Extração',
            'Prevenção: Alimentos de Risco'
          ]
        },
        {
          foco: 'PCR Pediátrica: PALS e Ressuscitação',
          subfocos: [
            'Reconhecimento e Abordagem Inicial da PCR',
            'Acesso Vascular e Administração de Drogas',
            'Suporte Básico de Vida (SBV) em Pediatria',
            'Causas Reversíveis e Ritmos de PCR',
            'Suporte Avançado de Vida (SAV) em Pediatria',
            'RCP em Situações Específicas'
          ]
        },
        {
          foco: 'Urticária e Angioedema Pediátricos',
          subfocos: [
            'Tratamento de Urticária/Angioedema',
            'Urticária Aguda: Etiologias Comuns na Infância',
            'Anafilaxia: Reconhecimento e Manejo Imediato',
            'Angioedema: Manifestações e Obstrução de Vias Aéreas',
            'Urticária Gigante e Reações a Picadas de Insetos'
          ]
        },
        {
          foco: 'Síndrome Morte Súbita do Lactente (SMSL)',
          subfocos: [
            'Fatores de Risco: Prona, Fumo, Coleito',
            'ALTE/BRUE: Evento Aparentemente Ameaçador',
            'Definição: Morte Inexplicada < 1 Ano',
            'Ambiente Seguro: Supino, Colchão Firme',
            'Chupeta e Aleitamento: Fatores Protetores'
          ]
        }
      ]
    },
    {
      tema: 'Nefrologia Pediátrica',
      focos: [
        {
          foco: 'Infecção Urinária na Criança',
          subfocos: [
            'EAS e Urocultura: Interpretação',
            'USG e UCRM: Quando Indicar',
            'Coleta: Punção Suprapúbica, Cateterismo, Jato Médio',
            'ATB: Ambulatorial vs Hospitalar',
            'RVU: Refluxo Vesicoureteral'
          ]
        },
        {
          foco: 'Glomerulonefrite Pós-Estreptocócica: Diagnóstico e Conduta',
          subfocos: [
            'Clínica: Edema, Hematúria, HAS',
            'Tratamento: Suporte e Restrição',
            'Complemento C3 Baixo (Transitório)',
            'Prognóstico: Excelente em Crianças',
            'ASLO e Anti-DNAse B'
          ]
        },
        {
          foco: 'Síndrome Nefrótica na Infância: Corticossensível e Recaídas',
          subfocos: [
            'Tríade: Proteinúria, Hipoalbuminemia, Edema, Hiperlipidemia',
            'Complicações: Infecção, Trombose',
            'Lesão Mínima: Principal em Crianças',
            'Corticoterapia: Prednisona 6 Semanas',
            'Recaídas Frequentes e Corticodependência'
          ]
        },
        {
          foco: 'Síndrome Hemolítico-Urêmica',
          subfocos: [
            'Tríade: Anemia Hemolítica, Plaquetopenia, IRA',
            'E. coli O157:H7 (STEC-SHU)',
            'Tratamento: Suporte, Não Usar ATB',
            'SHU Atípica: Eculizumabe'
          ]
        },
        {
          foco: 'Glomerulopatias Pediátricas (Nefropatia por IgA, Membranosa)',
          subfocos: [
            'Nefropatia por IgA: Hematúria Recorrente',
            'Púrpura de Henoch-Schönlein: Nefrite Associada',
            'GNPE: Clínica e Complemento Baixo',
            'Indicações de Biópsia Renal',
            'Síndrome Nefrótica: Lesão Mínima'
          ]
        },
        {
          foco: 'Refluxo Vesicoureteral',
          subfocos: [
            'Diagnóstico e Investigação de RVU',
            'Quadro Clínico e Suspeita Diagnóstica',
            'Manejo Terapêutico: Conservador e Cirúrgico',
            'Infecção do Trato Urinário (ITU) e Dano Renal',
            'Classificação e Fisiopatologia do RVU',
            'Profilaxia Antibiótica e Prevenção de ITU'
          ]
        },
        {
          foco: 'Enurese Noturna',
          subfocos: [
            'Monossintomática vs Não-Mono',
            'Primária vs Secundária',
            'Desmopressina: Indicações',
            'Avaliação: Diário Miccional',
            'Alarme Noturno: Primeira Linha'
          ]
        }
      ]
    },
    {
      tema: 'Reumatologia Pediátrica',
      focos: [
        {
          foco: 'Febre Reumática',
          subfocos: [
            'Critérios de Jones: Diagnóstico e Aplicação',
            'Tratamento e Profilaxia de Febre Reumática',
            'Manifestações Extracardíacas (Coreia, Nódulos, Eritema)',
            'Manifestações Cardíacas na Febre Reumática',
            'Febre Reumática: Etiologia e Epidemiologia',
            'Manifestações Articulares na Febre Reumática'
          ]
        },
        {
          foco: 'Doença de Kawasaki',
          subfocos: [
            'Critérios: Febre >= 5 dias + 4/5 Principais',
            'IVIG 2g/kg: Tratamento até 10º Dia',
            'Aneurismas Coronarianos: ECO e Seguimento',
            'Kawasaki Incompleto: Protocolo',
            'AAS em Dose Anti-inflamatória'
          ]
        },
        {
          foco: 'Púrpura de Henoch-Schönlein',
          subfocos: [
            'Púrpura de Henoch-Schönlein: Apresentação Clínica Clássica',
            'Púrpura de Henoch-Schönlein: Diagnóstico Diferencial e Abordagem Inicial',
            'Púrpura de Henoch-Schönlein: Tétrade Completa',
            'Púrpura de Henoch-Schönlein: Acometimento Renal (Nefrite)',
            'Púrpura de Henoch-Schönlein: Manejo Terapêutico',
            'Púrpura de Henoch-Schönlein: Prognóstico e Complicações'
          ]
        },
        {
          foco: 'Dor Musculoesquelética na Criança',
          subfocos: [
            'Artrite Séptica Pediátrica',
            'Sinovite Transitória do Quadril',
            'Dor de Crescimento: Característica Noturna',
            'Epifisiólise (Deslizamento Epifisário)',
            'Doença de Legg-Calvé-Perthes'
          ]
        },
        {
          foco: 'Artrite Idiopática Juvenil',
          subfocos: [
            'AIJ Sistêmica (Still): Febre Alta e Rash Salmão',
            'AIJ Oligoarticular: <= 4 Articulações, Risco de Uveíte',
            'Diagnóstico Diferencial e Critérios ILAR',
            'Uveíte Anterior: Rastreamento Oftalmológico',
            'AIJ Poliarticular: FR+ e FR- (Diferenças)',
            'MTX e Biológicos: Anti-TNF, Tocilizumabe'
          ]
        },
        {
          foco: 'Síndrome Inflamatória Multissistêmica Pediátrica',
          subfocos: [
            'Definição CDC/OMS: Febre + Inflamação + COVID',
            'Disfunção Cardíaca e Choque',
            'Tratamento: IVIG e Corticoide',
            'Diferencial com Kawasaki',
            'Manifestações GI: Dor Abdominal, Vômitos'
          ]
        },
        {
          foco: 'Lúpus Eritematoso Sistêmico Pediátrico',
          subfocos: [
            'Critérios ACR/EULAR Pediátrico',
            'Manifestações Hematológicas: Citopenias',
            'Nefrite Lúpica: Classes e Tratamento',
            'Tratamento: Hidroxicloroquina, Corticoide',
            'Anti-dsDNA e Complemento',
            'Manifestações Cutâneas Clássicas'
          ]
        }
      ]
    },
    {
      tema: 'Neurologia Pediátrica',
      focos: [
        {
          foco: 'Convulsões Febris',
          subfocos: [
            'Definição e Critérios de Convulsão Febril Simples',
            'Investigação Diagnóstica e Indicações de Punção Lombar',
            'Conduta Imediata e Manejo na Emergência',
            'Relação com Epilepsia e Fatores de Risco',
            'Profilaxia e Manejo a Longo Prazo',
            'Definição e Critérios de Convulsão Febril Complexa'
          ]
        },
        {
          foco: 'Epilepsia Pediátrica',
          subfocos: [
            'Estado de Mal Epiléptico: Benzodiazepínicos',
            'Síndrome de West: Espasmos e Hipsarritmia',
            'Primeira Escolha: Valproato, Carbamazepina',
            'Classificação: Focais vs Generalizadas',
            'Epilepsia Ausência: Ponta-Onda 3Hz',
            'Epilepsia Rolândica Benigna'
          ]
        },
        {
          foco: 'Meningites e Encefalites',
          subfocos: [
            'LCR: Diferenciação Bacteriana vs Viral vs TB',
            'Encefalite: Herpes Simplex e Aciclovir',
            'Meningite Bacteriana: ATB Empírico por Idade',
            'Sinais de Irritação Meníngea: Kernig, Brudzinski',
            'Meningococcemia e Profilaxia de Contatos'
          ]
        },
        {
          foco: 'Transtornos do Neurodesenvolvimento',
          subfocos: [
            'TEA: Critérios DSM-5 e Sinais Precoces',
            'TDAH: Critérios, Subtipos e Comorbidades',
            'Deficiência Intelectual: Classificação e Etiologias',
            'Intervenção Precoce e Equipe Multidisciplinar',
            'Transtornos Específicos de Aprendizagem: Dislexia',
            'Transtorno do Desenvolvimento da Linguagem'
          ]
        },
        {
          foco: 'Cefaleia na Infância',
          subfocos: [
            'Sinais de Alerta: Neuroimagem',
            'Migrânea: Critérios Pediátricos',
            'Tratamento Agudo: Ibuprofeno',
            'Cefaleia Tensional',
            'Profilaxia: Quando Indicar'
          ]
        },
        {
          foco: 'Paralisia Cerebral: Classificação, GMFCS e Comorbidades',
          subfocos: [
            'Comorbidades: Epilepsia, Disfagia, Escoliose',
            'GMFCS: Classificação da Função Motora Grossa',
            'PC Espástica: Hemi, Di e Tetraparesia',
            'Reabilitação Multidisciplinar',
            'PC Discinética (Atetoide) e Atáxica',
            'Classificação: Espástica'
          ]
        }
      ]
    },
    {
      tema: 'Cardiologia Pediátrica',
      focos: [
        {
          foco: 'Cardiopatias Congênitas Acianóticas',
          subfocos: [
            'CIV: Defeito do Septo Ventricular',
            'Coarctação da Aorta: Diferença de PA',
            'ICC no Lactente: Sinais e Manejo',
            'PCA: Persistência do Canal Arterial',
            'DSAV: Defeito do Septo Atrioventricular (Down)',
            'CIA: Defeito do Septo Atrial',
            'Comunicação Interventricular (CIV): Pequena e Assintomática'
          ]
        },
        {
          foco: 'Cardiopatias Congênitas Cianóticas',
          subfocos: [
            'Tetralogia de Fallot: Crise Hipóxica',
            'TGA: Canal-Dependente e Rashkind',
            'Prostaglandina E1: Canal-Dependente',
            'Atresia Tricúspide',
            'Síndrome do Coração Esquerdo Hipoplásico'
          ]
        },
        {
          foco: 'Arritmias Cardíacas Pediátricas',
          subfocos: [
            'Taquicardia Supraventricular (TSV): Adenosina',
            'Síndrome do QT Longo: Risco de Morte Súbita',
            'Fibrilação/Flutter Atrial em Cardiopatas Congênitos',
            'Bloqueio Atrioventricular (BAV) Congênito',
            'Síndrome de Wolff-Parkinson-White (WPW)'
          ]
        },
        {
          foco: 'Sopros Cardíacos na Criança',
          subfocos: [
            'Sopros Inocentes: Características',
            'Sopros Patológicos: Sinais de Alerta',
            'Sopro de Still: Vibratório Musical',
            'Quando Encaminhar ao Cardiologista',
            'Ecocardiograma: Indicações'
          ]
        }
      ]
    },
    {
      tema: 'Adolescência',
      focos: [
        {
          foco: 'Puberdade e Desenvolvimento Puberal',
          subfocos: [
            'Estágios de Tanner: Mamas e Pelos Pubianos',
            'Estirão Puberal: Velocidade de Crescimento',
            'Menarca e Ginecomastia Puberal',
            'Aumento Testicular: Primeiro Sinal Masculino',
            'Telarca: Primeiro Sinal Feminino'
          ]
        },
        {
          foco: 'Saúde Mental do Adolescente',
          subfocos: [
            'Avaliação e Consulta do Adolescente',
            'Ideação Suicida e Automutilação',
            'Rastreamento e Manejo de Uso de Substâncias (Álcool e Drogas)',
            'Depressão e Sintomas Depressivos',
            'Ansiedade e Transtornos de Ansiedade',
            'Uso Excessivo de Tecnologia e Impacto Psicossocial'
          ]
        },
        {
          foco: 'Saúde Sexual e Reprodutiva',
          subfocos: [
            'Sigilo e Confidencialidade na Consulta',
            'Violência Sexual: Profilaxia PEP',
            'Gravidez na Adolescência: Pré-Natal',
            'ISTs: Sífilis, HIV, HPV, Clamídia',
            'Vacinação: HPV 9-14 Anos'
          ]
        },
        {
          foco: 'Contracepção na Adolescência: Aconselhamento e ISTs',
          subfocos: [
            'Dupla Proteção: ISTs e Gravidez',
            'LARCs: DIU e Implante (Primeira Linha)',
            'Contracepção de Emergência: Levonorgestrel',
            'Contraceptivos Hormonais: ACO, Injetável',
            'Critérios de Elegibilidade OMS'
          ]
        },
        {
          foco: 'Transtornos Alimentares na Adolescência',
          subfocos: [
            'Anorexia Nervosa: Apresentação Clínica e Diagnóstico',
            'Transtornos Alimentares: Tratamento Multidisciplinar',
            'Deficiências Nutricionais Associadas a TAU',
            'Transtornos Alimentares: Complicações Metabólicas e Cardíacas',
            'Transtornos Alimentares: Fatores Psicossociais e Ambientais'
          ]
        }
      ]
    },
    {
      tema: 'Terapia Intensiva Pediátrica',
      focos: [
        {
          foco: 'Sepse e Choque Séptico Pediátrico',
          subfocos: [
            'Primeira Hora: Bundle de Sepse',
            'Sinais de Disfunção Orgânica',
            'Acesso e Ressuscitação Volêmica',
            'ATB Empírico Precoce',
            'Princípios do Cuidado Intensivo Pediátrico',
            'Phoenix Criteria: Nova Definição'
          ]
        },
        {
          foco: 'PCR Pediátrica: Cuidados Pós-Parada',
          subfocos: [
            'Cuidados Pós-Ressuscitação',
            'PALS: Algoritmo de PCR Pediátrica',
            'Ritmos Chocáveis: FV/TV sem Pulso',
            'Ritmos Não-Chocáveis: Assistolia/AESP',
            'Hipotermia Terapêutica'
          ]
        },
        {
          foco: 'Insuficiência Respiratória Aguda',
          subfocos: [
            'Sinais Clínicos: Tiragem, BAN, Gemência',
            'Tipo I (Hipoxêmica) vs Tipo II (Hipercápnica)',
            'IOT Pediátrica: Indicações e Técnica',
            'Oxigenoterapia: Cateter, Máscara, Cânula Alto Fluxo',
            'PARDS: Síndrome do Desconforto Respiratório Pediátrico',
            'VNI: CPAP e BiPAP Pediátrico'
          ]
        },
        {
          foco: 'Choque Pediátrico: Manejo Intensivo',
          subfocos: [
            'Expansão: 20mL/kg SF em Bolus',
            'Metas: PAM, Lactato, Débito Urinário',
            'Drogas Vasoativas: Adrenalina, Nora, Dopamina',
            'Choque Frio vs Quente',
            'Hidrocortisona: Quando Usar'
          ]
        },
        {
          foco: 'Convulsões e Status Epilepticus',
          subfocos: [
            'Primeira Linha: Diazepam Retal ou Midazolam IM',
            'Etiologia: Febril, Metabólica, Estrutural',
            'Segunda Linha: Fenitoína IV',
            'Status Refratário: Fenobarbital, Valproato',
            'Investigação Emergencial: Glicemia, Eletrólitos'
          ]
        }
      ]
    },
    {
      tema: 'Distúrbios Genéticos e Metabólicos',
      focos: [
        {
          foco: 'Síndromes Genéticas Comuns',
          subfocos: [
            'Síndrome de Down: Fenótipo e Comorbidades',
            'Síndrome do X Frágil: TDAH e TEA',
            'Síndrome de Turner: 45,X e Follow-up',
            'Síndrome de Marfan: Aorta e Cristalino',
            'Síndrome de Klinefelter: 47,XXY'
          ]
        },
        {
          foco: 'Erros Inatos do Metabolismo',
          subfocos: [
            'Sinais de Alerta: Odor, Acidose, Hipoglicemia',
            'Galactosemia: Clínica e Manejo',
            'Investigação Laboratorial de Erros Inatos do Metabolismo',
            'Hiperplasia Adrenal Congênita: 17-OHP',
            'Doença de Gaucher: Glicocerebrosidase, MPS',
            'Fenilcetonúria: Triagem e Dieta',
            'Hipotireoidismo Congênito: TSH no Pezinho'
          ]
        },
        {
          foco: 'Distúrbios Cromossômicos',
          subfocos: [
            'Síndromes Cromossômicas Específicas (Exceto Down)',
            'Síndrome de Down: Diagnóstico e Manifestações Clínicas',
            'Aconselhamento Genético em Doenças Cromossômicas',
            'Cariótipo: Indicações e Interpretação',
            'Microdeleções e Microduplicações Específicas',
            'Array-CGH: Aplicações Clínicas'
          ]
        }
      ]
    },
    {
      tema: 'Dermatologia Pediátrica',
      focos: [
        {
          foco: 'Dermatite Atópica: Critérios de Hanifin-Rajka e Manejo',
          subfocos: [
            'Critérios de Hanifin-Rajka',
            'Manejo de Dermatite Atópica: Emolientes e Barreira Cutânea',
            'Inibidores de Calcineurina',
            'Distribuição por Idade: Flexuras',
            'Hidratação: Base do Tratamento',
            'Corticoide Tópico: Potência e Local'
          ]
        },
        {
          foco: 'Escabiose e Pediculose',
          subfocos: [
            'Tratamento: Permetrina 5%, Ivermectina',
            'Escabiose: Sarcoptes scabiei',
            'Tratamento Domiciliar: Contatos',
            'Pediculose Capitis: Lêndeas',
            'Lesões: Túnel e Prurido Noturno'
          ]
        },
        {
          foco: 'Impetigo',
          subfocos: [
            'Tratamento: Mupirocina Tópica e ATB Sistêmico',
            'Impetigo: Etiologia e Diagnóstico',
            'Impetigo Crostoso (Não-Bolhoso): S. aureus e S. pyogenes',
            'Impetigo Bolhoso: Toxina Esfoliativa Estafilocócica',
            'SSSS: Síndrome Pele Escaldada Estafilocócica',
            'Complicações: GNPE e Febre Reumática'
          ]
        },
        {
          foco: 'Dermatite Seborreica',
          subfocos: [
            'Dermatite Seborreica Neonatal e Infantil (Crosta Láctea)',
            'Milium Sebáceo Neonatal',
            'Diagnóstico Diferencial: Dermatite Atópica',
            'Malassezia furfur: Papel no Lactente',
            'Tratamento: Óleo Mineral e Xampu Antifúngico'
          ]
        }
      ]
    }
  ]
};

