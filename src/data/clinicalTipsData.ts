// Catálogo Padrão-Ouro de 385 Cards Clínicos para Active Recall & Dica do Dia
// Gerado com embasamento médico oficial (SBC, SBD, FEBRASGO, SBP, CBC, ATLS, INCA, MS)
// Inclui imagens de Domínio Público / CC-BY (Wikimedia Commons, CDC PHIL, MedPix e ISIC Archive).

export interface ClinicalTipItem {
  id: string;
  category: 'criterios' | 'triades' | 'mnemonicos' | 'antidotos' | 'semiologia' | 'rastreamento' | 'radiologia' | 'decorebas' | 'tratamento' | 'transfusao';
  categoryLabel?: string;
  title: string;
  fullTitle?: string;
  specialty: string;
  tema: string;
  foco?: string;
  subfocos?: string[];
  provenanceDefault: string;
  acronym?: string;
  requiresImage?: boolean;
  imageUrl?: string;
  imageCaption?: string;
  imageModality?: 'ecg' | 'rx' | 'tc' | 'usg' | 'dermato' | 'esquema';
  imageSource?: string;
  imageAuthor?: string;
  imageLicense?: string;
  imageOriginUrl?: string;
  chips: Array<{
    label: string;
    letter?: string;
    value: string;
  }>;
  rule: string;
  bancaTrap?: string;
}

export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = [
  {
    "id": "tip-clin-1-sindromes-coronarianas-is",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Síndromes Coronarianas Isquêmicas",
    "fullTitle": "Síndromes Coronarianas Isquêmicas (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Síndromes Coronarianas Isquêmicas (Aguda e Crônica)",
    "subfocos": [
      "IAM com Supradesnivelamento do Segmento ST (IAMCSST)",
      "Síndrome Coronariana Aguda sem Supra de ST (SCASST) e Angina Instável",
      "Doença Arterial Coronariana Crônica e Angina Estável"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Eletrocardiograma e Localização da Parede Infartada",
        "value": "Anterior, Inferior com VD, Lateral"
      },
      {
        "letter": "B",
        "label": "Terapia de Reperfusão Imediata",
        "value": "Angioplastia Primária (< 90-120 min) vs Fibrinólise (< 30 min e até 12h)"
      },
      {
        "letter": "C",
        "label": "Terapia Farmacológica Coadjuvante",
        "value": "Dupla Antiagregação, Anticoagulação, Estatina e Betabloqueador"
      },
      {
        "letter": "D",
        "label": "Complicações Mecânicas",
        "value": "Rotura de Parede Livre, Septo Interventricular e Músculo Papilar"
      }
    ],
    "rule": "Diretrizes SBC / AHA: O supradesnivelamento do segmento ST em ≥ 2 derivações contíguas define IAM com supra (IAMCSST); tempo porta-balão alvo < 90 min (ou porta-agulha < 30 min se trombólise).",
    "bancaTrap": "Em IAM de parede inferior (DII, DIII, aVF), é mandatório rodar as derivações direitas (V3R e V4R); se houver acometimento de ventrículo direito, nitratos e betabloqueadores são formalmente contraindicados.",
    "imageUrl": "/images/medical/iam_supra_st.webp",
    "imageCaption": "Eletrocardiograma de 12 derivações: supradesnivelamento do segmento ST em parede anterior extensa (V1-V6) com ondas Q patológicas.",
    "imageModality": "ecg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Displaced",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:12_Lead_EKG_ST_Elevation_tracing_color_coded.jpg"
  },
  {
    "id": "tip-clin-2-insuficiencia-cardiaca-e",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Insuficiência Cardíaca e Cardiomiopatias",
    "fullTitle": "Insuficiência Cardíaca e Cardiomiopatias (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Insuficiência Cardíaca e Cardiomiopatias",
    "subfocos": [
      "Insuficiência Cardíaca com Fração de Ejeção Reduzida (ICFER)",
      "Insuficiência Cardíaca Agudamente Descompensada",
      "Cardiomiopatia Hipertrófica e Cardiomiopatia Chagásica"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Diagnósticos de Framingham e Papel dos Peptídeos Natriuréticos",
        "value": "BNP / NT-proBNP"
      },
      {
        "letter": "B",
        "label": "O \"Quarteto Fantástico\" Modificador de Sobrevida",
        "value": "iSGLT2, iECA/BRA/ARNI, Betabloqueador e Antagonista da Aldosterona"
      },
      {
        "letter": "C",
        "label": "Indicações de Dispositivos",
        "value": "Cardiodesfibrilador Implantável - CDI e Terapia de Ressincronização Cardíaca"
      },
      {
        "letter": "D",
        "label": "Perfil Hemodinâmico de Stevenson",
        "value": "Perfil A Quente/Seco, B Quente/Úmido, L Frio/Seco, C Frio/Úmido"
      }
    ],
    "rule": "Diretriz oficial de Cardiologia (Diretrizes SBC / AHA / ESC 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios Diagnósticos de Framingham e Papel dos Peptídeos Natriuréticos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Insuficiência Cardíaca e Cardiomiopatias e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-3-taquiarritmias-e-bradiarr",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Taquiarritmias e Bradiarritmias",
    "fullTitle": "Taquiarritmias e Bradiarritmias (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Taquiarritmias e Bradiarritmias",
    "subfocos": [
      "Fibrilação Atrial e Flutter Atrial",
      "Taquicardias Supraventriculares Paroxísticas",
      "Bradiarritmias e Bloqueios Atrioventriculares"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Avaliação de Risco Tromboembólico pelo Escore CHA2DS2-VASc e Indicação de Anticoagulação Oral",
        "value": "DOACs vs Varfarina"
      },
      {
        "letter": "B",
        "label": "Fibrilação Atrial e Flutter Atrial",
        "value": "Escore HAS-BLED para Risco de Sangramento"
      },
      {
        "letter": "C",
        "label": "Controle de Ritmo",
        "value": "Cardioversão Química/Elétrica) vs Controle de Frequência Cardíaca (Betabloqueador / Bloqueador de Canal de Cálcio"
      },
      {
        "letter": "D",
        "label": "Conduta na Instabilidade Hemodinâmica",
        "value": "Cardioversão Elétrica Sincronizada Imediata"
      }
    ],
    "rule": "Protocolo ACLS / AHA 2024: Ritmos chocáveis são Fibrilação Ventricular (FV) e Taquicardia Ventricular sem Pulso (TVSP); ritmos não-chocáveis são Assistolia e Atividade Elétrica Sem Pulso (AESP).",
    "bancaTrap": "Na assistolia e na AESP, o desfibrilador NUNCA deve ser acionado; a conduta é massagem de alta qualidade, adrenalina 1 mg a cada 3 a 5 min e investigação imediata das causas 5Hs e 5Ts.",
    "imageUrl": "/images/medical/taquicardia_supraventricular.webp",
    "imageCaption": "Eletrocardiograma: taquicardia por reentrada nodal (TRN) de QRS estreito (< 120 ms), ritmo regular e frequência > 150 bpm.",
    "imageModality": "ecg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Michael Rosengarten BEng, MD.McGill",
    "imageLicense": "CC BY-SA 3.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:E345_(CardioNetworks_ECGpedia).jpg"
  },
  {
    "id": "tip-clin-4-doencas-valvares-cardiaca",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Doenças Valvares Cardíacas",
    "fullTitle": "Doenças Valvares Cardíacas (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Doenças Valvares Cardíacas",
    "subfocos": [
      "Estenose Aórtica",
      "Insuficiência Mitral e Estenose Mitral"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Clássica de Gravidade",
        "value": "Angina, Síncope e Dispneia aos Esforços"
      },
      {
        "letter": "B",
        "label": "Exame Físico",
        "value": "Sopro Mesossistólico em Diamante com Irradiação para Carótidas e Pulso Parvus et Tardus"
      },
      {
        "letter": "C",
        "label": "Tratamento Cirúrgico",
        "value": "Troca Valvar Aórtica Cirúrgica vs TAVI (Transcatheter Aortic Valve Implantation)"
      },
      {
        "letter": "D",
        "label": "Estenose Mitral Reumática",
        "value": "Ruflar Diastólico com Estalido de Abertura, Reforço Pré-Sistólico e Hipertensão Pulmonar"
      }
    ],
    "rule": "Diretriz oficial de Cardiologia (Diretrizes SBC / AHA / ESC 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tríade Clássica de Gravidade) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Valvares Cardíacas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-5-hipertensao-arterial-sist",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Hipertensão Arterial Sistêmica e Crise Hipertensiva",
    "fullTitle": "Hipertensão Arterial Sistêmica e Crise Hipertensiva (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Hipertensão Arterial Sistêmica e Crise Hipertensiva",
    "subfocos": [
      "Diagnóstico e Manejo Ambulatorial da Hipertensão",
      "Crise Hipertensiva (Urgência vs Emergência Hipertensiva)"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios da Diretriz Brasileira de HAS",
        "value": "Classificação em Estágios 1, 2 e 3 e Metas Pressóricas"
      },
      {
        "letter": "B",
        "label": "Papel do MAPA e MRPA",
        "value": "Fenômeno do Avental Branco e Hipertensão Mascarada"
      },
      {
        "letter": "C",
        "label": "Escolha de Anti-hipertensivos de 1ª Linha",
        "value": "Tiazídicos, Bloqueadores de Canal de Cálcio, iECA/BRA"
      },
      {
        "letter": "D",
        "label": "Emergência Hipertensiva",
        "value": "Lesão Aguda e Progressiva de Órgãos-Alvo (Redução com Nitroprussiato ou Nitroglicerina EV)"
      }
    ],
    "rule": "Diretriz oficial de Cardiologia (Diretrizes SBC / AHA / ESC 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios da Diretriz Brasileira de HAS) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hipertensão Arterial Sistêmica e Crise Hipertensiva e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-6-doencas-do-pericardio-e-e",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Doenças do Pericárdio e Endocardite Infecciosa",
    "fullTitle": "Doenças do Pericárdio e Endocardite Infecciosa (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Doenças do Pericárdio e Endocardite Infecciosa",
    "subfocos": [
      "Pericardite Aguda e Tamponamento Cardíaco",
      "Endocardite Infecciosa"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Pericardite",
        "value": "Dor Torácica Pleurítica que Melhora ao Inclinar o Tronco para Frente, Atrito Pericárdico e Supra de ST Côncavo Difuso"
      },
      {
        "letter": "B",
        "label": "Tamponamento Cardíaco",
        "value": "Tríade de Beck (Hipotensão, Hipofonese de Bulhas e Turgência Jugular) + Pulso Paradoxal"
      },
      {
        "letter": "C",
        "label": "Conduta Imediata no Tamponamento",
        "value": "Pericardiocentese de Urgência (Manobra de Marfan)"
      },
      {
        "letter": "D",
        "label": "Critérios Modificados de Duke (Critérios Maiores",
        "value": "Hemoculturas Típicas e Vegetação no Ecocardiograma)"
      }
    ],
    "rule": "Diretriz oficial de Cardiologia (Diretrizes SBC / AHA / ESC 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Pericardite) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças do Pericárdio e Endocardite Infecciosa e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/pericardite_ecg.webp",
    "imageCaption": "Eletrocardiograma: pericardite aguda com supradesnivelamento difuso do segmento ST de concavidade superior e infradesnivelamento do segmento PR.",
    "imageModality": "ecg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "James Heilman, MD",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Acute_pericarditis.jpg"
  },
  {
    "id": "tip-clin-7-parada-cardiorrespiratori",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Parada Cardiorrespiratória e Ressuscitação",
    "fullTitle": "Parada Cardiorrespiratória e Ressuscitação (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Parada Cardiorrespiratória e Ressuscitação (ACLS)",
    "subfocos": [
      "Ritmos Chocáveis e Não Chocáveis",
      "Cuidados Pós-Parada Cardiorrespiratória"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Ritmos Chocáveis",
        "value": "Fibrilação Ventricular (FV) e Taquicardia Ventricular sem Pulso (TVSP) - Choque Imediato + RCP"
      },
      {
        "letter": "B",
        "label": "Ritmos Não Chocáveis",
        "value": "Assistolia e Atividade Elétrica sem Pulso (AESP) - RCP Imediata + Adrenalina 1 mg precoce"
      },
      {
        "letter": "C",
        "label": "Drogas no Suporte Avançado de Vida",
        "value": "Adrenalina a cada 3-5 min e Amiodarona / Lidocaína para Ritmos Chocáveis"
      },
      {
        "letter": "D",
        "label": "Causas Reversíveis de PCR",
        "value": "Mnemônicos dos 5 Hs e 5 Ts"
      }
    ],
    "rule": "Protocolo ACLS / AHA 2024: Ritmos chocáveis são Fibrilação Ventricular (FV) e Taquicardia Ventricular sem Pulso (TVSP); ritmos não-chocáveis são Assistolia e Atividade Elétrica Sem Pulso (AESP).",
    "bancaTrap": "Na assistolia e na AESP, o desfibrilador NUNCA deve ser acionado; a conduta é massagem de alta qualidade, adrenalina 1 mg a cada 3 a 5 min e investigação imediata das causas 5Hs e 5Ts."
  },
  {
    "id": "tip-clin-8-doencas-obstrutivas-das-v",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doenças Obstrutivas das Vias Aéreas",
    "fullTitle": "Doenças Obstrutivas das Vias Aéreas (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Obstrutivas das Vias Aéreas (Asma e DPOC)",
    "subfocos": [
      "Asma Brônquica no Adulto",
      "Doença Pulmonar Obstrutiva Crônica (DPOC)"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico Espirométrico",
        "value": "Distúrbio Ventilatório Obstrutivo com Resposta Significativa ao Broncodilatador (Aumento VEF1 > 12% e > 200 mL)"
      },
      {
        "letter": "B",
        "label": "Manejo Crônico pelo GINA",
        "value": "Corticoide Inalatório como Pilar Central Obrigatório (Associação com Formoterol de Demanda/Manutenção)"
      },
      {
        "letter": "C",
        "label": "Crise Asmática Aguda no Pronto-Socorro",
        "value": "Beta-2 Agonista Inalatório, Corticoide Sistêmico Precoce e Brometo de Ipratrópio"
      },
      {
        "letter": "D",
        "label": "Diagnóstico Espirométrico",
        "value": "Obstrução Fixa Pós-Broncodilatador (VEF1 / CVF < 0,70)"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/dpoc_enfisema_rx.webp",
    "imageCaption": "Radiografia de tórax: hiperinsuflação pulmonar com rebaixamento e retificação das hemicúpulas diafragmáticas e aumento do diâmetro anteroposterior.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Cenveo",
    "imageLicense": "CC BY 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Anatomytool_Lungs_and_chest_wall_English.jpg"
  },
  {
    "id": "tip-clin-9-infeccoes-respiratorias-b",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Infecções Respiratórias Baixas",
    "fullTitle": "Infecções Respiratórias Baixas (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Infecções Respiratórias Baixas (Pneumonias e Abscessos)",
    "subfocos": [
      "Pneumonia Adquirida na Comunidade (PAC) no Adulto",
      "Abscesso Pulmonar e Pneumonia Aspirativa"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estratificação de Gravidade pelo Escore CURB-65",
        "value": "Confusão, Ureia >= 50, FR >= 30, PAS < 90 ou PAD <= 60, Idade >= 65"
      },
      {
        "letter": "B",
        "label": "Esquemas de Antibioticoterapia Empírica",
        "value": "Ambulatorial (Amoxicilina ou Macrolídeo), Enfermaria (Beta-lactâmico + Macrolídeo ou Quinolona Respiratória) e UTI"
      },
      {
        "letter": "C",
        "label": "Abscesso Pulmonar e Pneumonia Aspirativa",
        "value": "Agentes Anaeróbios da Cavidade Oral, Imagem com Nível Hidroaéreo e Tratamento com Amoxicilina/Clavulanato ou Clindamicina"
      },
      {
        "letter": "D",
        "label": "Abscesso Pulmonar e Pneumonia Aspirativa",
        "value": "Critérios para Drenagem Externa vs Suporte Clínico Prolongado"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-clin-10-doencas-vasculares-pulmon",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Doenças Vasculares Pulmonares",
    "fullTitle": "Doenças Vasculares Pulmonares (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Vasculares Pulmonares (TEP e Hipertensão Pulmonar)",
    "subfocos": [
      "Tromboembolismo Pulmonar (TEP)",
      "Hipertensão Pulmonar"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tromboembolismo Pulmonar (TEP)",
        "value": "Estratificação de Probabilidade Clínica pelos Escores de Wells e Genebra"
      },
      {
        "letter": "B",
        "label": "Algoritmo Diagnóstico",
        "value": "D-Dímero em Baixa/Intermediária Probabilidade vs Angio-TC de Tórax em Alta Probabilidade"
      },
      {
        "letter": "C",
        "label": "TEP Maciço / Choque Obstrutivo",
        "value": "Indicação de Trombólise Sistêmica (Alteplase) e Suporte Hemodinâmico"
      },
      {
        "letter": "D",
        "label": "Anticoagulação Plena",
        "value": "DOACs de 1ª Escolha, Enoxaparina e Varfarina"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-clin-11-doencas-pleurais",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Doenças Pleurais",
    "fullTitle": "Doenças Pleurais (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Pleurais (Derrames e Pneumotórax)",
    "subfocos": [
      "Derrame Pleural e Critérios de Light",
      "Pneumotórax Espontâneo no Adulto"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios de Light para Diferenciação Transudato vs Exsudato",
        "value": "Proteína Pleural/Sérica > 0,5, LDH Pleural/Sérico > 0,6, LDH Pleural > 2/3 LSN Sérico"
      },
      {
        "letter": "B",
        "label": "Derrame Parapneumônico Complicado e Empiema (Critérios de Drenagem em Selo d'Água",
        "value": "pH < 7,20, Glicose < 40, Bactérias ou Pus Franco)"
      },
      {
        "letter": "C",
        "label": "Pneumotórax Primário",
        "value": "Jovens Longilíneos com Blebs Apicais) vs Secundário (DPOC com Bolhas Enfisematosas"
      },
      {
        "letter": "D",
        "label": "Conduta pelo Tamanho",
        "value": "Observação com O2 em Pequenos Volumes vs Drenagem Torácica Fechada e Pleurodese em Recidivantes"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/pneumotorax_rx.webp",
    "imageCaption": "Radiografia de tórax: hipertransparência unilateral com ausência de trama vascular periférica e retração do parênquima pulmonar (pneumotórax).",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Pilate SA, De Clercq S",
    "imageLicense": "CC BY 2.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:PMC3160360_1749-7922-6-23-1.png"
  },
  {
    "id": "tip-clin-12-doencas-pulmonares-inters",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doenças Pulmonares Intersticiais e Fibrose",
    "fullTitle": "Doenças Pulmonares Intersticiais e Fibrose (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Pulmonares Intersticiais e Fibrose",
    "subfocos": [
      "Fibrose Pulmonar Idiopática (FPI) e Padrão TCAR de PIU",
      "Sarcoidose e Pneumonite por Hipersensibilidade (PH)"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Padrão Tomográfico de Pneumonia Intersticial Usual (PIU",
        "value": "Faveolamento Subpleural, Bronquiectasias de Tração e Gradiente Ápico-Basal)"
      },
      {
        "letter": "B",
        "label": "Fibrose Pulmonar Idiopática (FPI) e Padrão TCAR de PIU",
        "value": "Terapia Antifibrótica com Nintedanibe e Pirfenidona para Redução do Declínio da CVF"
      },
      {
        "letter": "C",
        "label": "Sarcoidose Pulmonar",
        "value": "Linfadenopatia Hilar Bilateral Simétrica, Granulomas Não-Caseificantes e Corticoterapia"
      },
      {
        "letter": "D",
        "label": "Pneumonite por Hipersensibilidade",
        "value": "Exposição a Mofo/Pássaros, Padrão em Mosaico e Lavado com Linfocitose CD4/CD8"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-clin-13-tuberculose-pulmonar-e-mi",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Tuberculose Pulmonar e Micobacterioses",
    "fullTitle": "Tuberculose Pulmonar e Micobacterioses (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Tuberculose Pulmonar e Micobacterioses",
    "subfocos": [
      "Diagnóstico e Manejo Clínico da Tuberculose Ativa",
      "Infecção Latente pelo Mycobacterium tuberculosis (ILTB)"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico Laboratorial",
        "value": "Teste Rápido Molecular para TB (TRM-TB) com Detecção de Resistência à Rifampicina e Bacilos Álcool-Ácido Resistentes (BAAR)"
      },
      {
        "letter": "B",
        "label": "Esquema Básico RIPE",
        "value": "Rifampicina, Isoniazida, Pirazinamida e Etambutol por 2 meses + Rifampicina e Isoniazida por 4 meses"
      },
      {
        "letter": "C",
        "label": "Efeitos Adversos dos Fármacos Antituberculose",
        "value": "Hepatotoxicidade, Neurite Óptica pelo Etambutol, Hiperuricemia"
      },
      {
        "letter": "D",
        "label": "Indicações de Rastreamento com PPD / IGRA",
        "value": "Contatos Domiciliares, PVHIV, Imunossuprimidos"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/tuberculose_rx.webp",
    "imageCaption": "Radiografia de tórax: lesão cavitária de paredes espessas em segmento apical do lobo superior direito característica de tuberculose pós-primária.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Yale Rosen",
    "imageLicense": "CC BY-SA 2.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Cavitary_tuberculosis.jpg"
  },
  {
    "id": "tip-clin-14-neoplasias-pulmonares-e-n",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário",
    "fullTitle": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário",
    "subfocos": [
      "Nódulo Pulmonar Solitário (NPS): Critérios de Fleischner e Malignidade",
      "Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estratificação de Risco pelo Critério de Fleischner",
        "value": "Tamanho, Vidro Fosco vs Sólido, Margens Espiculadas"
      },
      {
        "letter": "B",
        "label": "Conduta Propedêutica",
        "value": "Acompanhamento Tomográfico vs PET-CT e Biópsia/Ressonância em Alto Risco"
      },
      {
        "letter": "C",
        "label": "Pesquisa de Mutações Condutoras no Adenocarcinoma",
        "value": "EGFR, ALK, ROS1, BRAF e Expressão de PD-L1"
      },
      {
        "letter": "D",
        "label": "Síndrome da Veia Cava Superior e Síndrome de Pancoast",
        "value": "Dor no Ombro e Síndrome de Horner por Invasão do Gânglio Estrelado"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-clin-15-doencas-esofagicas-e-gast",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doenças Esofágicas e Gastroduodenais",
    "fullTitle": "Doenças Esofágicas e Gastroduodenais (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças Esofágicas e Gastroduodenais (DRGE, Úlcera e Gastrite)",
    "subfocos": [
      "Doença do Refluxo Gastroesofágico (DRGE) e Esôfago de Barrett",
      "Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sintomas Típicos",
        "value": "Pirose e Regurgitação) e Indicações de Endoscopia Digestiva Alta (Sinais de Alarme ou Idade > 40-45 anos"
      },
      {
        "letter": "B",
        "label": "Esôfago de Barrett",
        "value": "Metaplasia Intestinal Especializada com Células Caliciformes"
      },
      {
        "letter": "C",
        "label": "Diferenciação Úlcera Gástrica",
        "value": "Obrigatoriedade de Biópsia para Excluir Neoplasia) vs Duodenal (Maior Associação com H. pylori"
      },
      {
        "letter": "D",
        "label": "Esquema Canônico de Erradicação de 1ª Linha",
        "value": "IBP + Claritromicina + Amoxicilina por 14 Dias e Controle de Cura"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Sintomas Típicos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Esofágicas e Gastroduodenais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-16-hemorragia-digestiva",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Hemorragia Digestiva",
    "fullTitle": "Hemorragia Digestiva (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Hemorragia Digestiva (Alta e Baixa)",
    "subfocos": [
      "Hemorragia Digestiva Alta (HDA) Não-Varicosa vs Varicosa",
      "Hemorragia Digestiva Baixa (HDB): Divertículos, Angiodisplasia e Conduta"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estratificação de Risco",
        "value": "Escore de Glasgow-Blatchford e Rockall"
      },
      {
        "letter": "B",
        "label": "Classificação de Forrest para Úlcera Sangrante e Terapia Endoscópica Combinada",
        "value": "Injeção de Adrenalina + Termocoagulação/Clipe"
      },
      {
        "letter": "C",
        "label": "Principais Causas",
        "value": "Doença Diverticular dos Cólons (Sangramento Arterial Volumoso) e Angiodisplasias (Idosos e DRC)"
      },
      {
        "letter": "D",
        "label": "Algoritmo Propedêutico",
        "value": "Colonoscopia após Preparo Rápido vs Angio-TC e Arteriografia com Embolização na Instabilidade"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Estratificação de Risco) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hemorragia Digestiva e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-17-hepatites-agudas-e-cronic",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hepatites Agudas e Crônicas",
    "fullTitle": "Hepatites Agudas e Crônicas (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Hepatites Agudas e Crônicas (Virais, Tóxicas e Autoimunes)",
    "subfocos": [
      "Hepatite B e C: Interpretação Sorológica e Terapia Antiviral",
      "Hepatite Autoimune e Doença Hepática Alcoólica"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Perfil Sorológico da Hepatite B",
        "value": "HBsAg, Anti-HBc IgM/IgG, HBeAg e Anti-HBe"
      },
      {
        "letter": "B",
        "label": "Hepatite C",
        "value": "Diagnóstico com Anti-HCV e Carga Viral (HCV-RNA) e Cura com Antivirais de Ação Direta (Sofosbuvir/Velpatasvir)"
      },
      {
        "letter": "C",
        "label": "Hepatite Autoimune",
        "value": "Elevação de IgG, Autoanticorpos (FAN, Antimúsculo Liso, Anti-LKM1) e Resposta a Prednisona e Azatioprina"
      },
      {
        "letter": "D",
        "label": "Hepatite Alcoólica Aguda",
        "value": "Relação AST/ALT > 2 com AST < 300-500 U/L e Cálculo da Função Discriminante de Maddrey (Corticoide se >= 32)"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Perfil Sorológico da Hepatite B) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hepatites Agudas e Crônicas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-18-cirrose-hepatica-e-hipert",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Cirrose Hepática e Hipertensão Portal",
    "fullTitle": "Cirrose Hepática e Hipertensão Portal (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Cirrose Hepática e Hipertensão Portal",
    "subfocos": [
      "Estratificação Prognóstica (Child-Pugh e MELD) e Síndrome de Hipertensão Portal",
      "Manejo da Ascite, Peritonite Bacteriana Espontânea (PBE) e Encefalopatia Hepática"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação de Child-Pugh",
        "value": "Bilirrubina, Albumina, INR, Ascite, Encefalopatia"
      },
      {
        "letter": "B",
        "label": "Gradiente de Pressão Venosa Hepática",
        "value": "GPVH >= 10 mmHg para Hipertensão Portal Clinicamente Significativa"
      },
      {
        "letter": "C",
        "label": "Análise do Líquido Ascítico pelo GASA",
        "value": "GASA >= 1,1 g/dL Indica Hipertensão Portal"
      },
      {
        "letter": "D",
        "label": "Diagnóstico de PBE",
        "value": "PMN >= 250/mm3 no Líquido Ascítico), Tratamento com Cefotaxima e Profilaxia com Albumina Humana (1,5g/kg no D1 e 1g/kg no D3"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação de Child-Pugh) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Cirrose Hepática e Hipertensão Portal e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-19-doencas-da-vesicula-vias",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Doenças da Vesícula, Vias Biliares e Pancreatite",
    "fullTitle": "Doenças da Vesícula, Vias Biliares e Pancreatite (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças da Vesícula, Vias Biliares e Pancreatite",
    "subfocos": [
      "Pancreatite Aguda no Adulto: Diagnóstico Clínico e Escores Prognósticos",
      "Pancreatite Crônica, Doenças Colestáticas (Cirrose Biliar Primária e CEP)"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Diagnósticos de Atlanta (2 de 3",
        "value": "Dor Típica em Faixa, Amilase/Lipase > 3x o LSN, Achados Radiológicos em TC/USG)"
      },
      {
        "letter": "B",
        "label": "Estratificação Prognóstica Precoce",
        "value": "Critérios de Ranson, BISAP, Apache II e Hematócrito > 44%"
      },
      {
        "letter": "C",
        "label": "Tríade da Pancreatite Crônica Avançada",
        "value": "Calcificações Pancreáticas à TC, Esteatorreia e Diabetes Mellitus Secundário"
      },
      {
        "letter": "D",
        "label": "Colangite Biliar Primária",
        "value": "Anticorpo Antimitocôndria - AMA Positivo e Ácido Ursodesoxicólico) vs Colangite Esclerosante Primária (p-ANCA"
      }
    ],
    "rule": "Diretrizes Internacionais e CBC: Critérios de Ranson ≥ 3 na admissão (LEGAL: Leucócitos > 16k, Enzima LDH > 350, Glicose > 200, Anos/Idade > 55, AST > 250) indicam pancreatite aguda potencialmente grave.",
    "bancaTrap": "Amilase e lipase séricas servem unicamente para confirmação diagnóstica na admissão; os seus títulos séricos absolutos NÃO têm correlação com gravidade, prognóstico ou indicação cirúrgica.",
    "imageUrl": "/images/medical/colecistite_usg.webp",
    "imageCaption": "Ultrassonografia de abdome superior: cálculo impactado no colo da vesícula biliar, espessamento parietal (> 4 mm) e líquido perivesicular.",
    "imageModality": "usg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Cerevisae",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Acute_cholecystitis_as_seen_on_ultrasound_axial_view.jpg"
  },
  {
    "id": "tip-clin-20-doencas-inflamatorias-int",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Doenças Inflamatórias Intestinais",
    "fullTitle": "Doenças Inflamatórias Intestinais (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças Inflamatórias Intestinais (Crohn e RCU)",
    "subfocos": [
      "Diagnóstico Diferencial Clínico e Endoscópico: Doença de Crohn vs Retocolite Ulcerativa",
      "Terapia de Indução e Manutenção (Biológicos) e Megacólon Tóxico"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Retocolite Ulcerativa",
        "value": "Acometimento Contínuo, Restrito à Mucosa, Iniciando no Reto com Sangramento Retal Frequente e Pseudopólipos"
      },
      {
        "letter": "B",
        "label": "Doença de Crohn",
        "value": "Acometimento Transmural, Salteado (Skip Lesions), da Boca ao Ânus (Íleo Terminal), com Fístulas, Estenoses e Fissuras"
      },
      {
        "letter": "C",
        "label": "Escalonamento Terapêutico",
        "value": "Derivados de 5-ASA (Mesalazina), Corticoides para Crise e Biológicos Anti-TNF (Infliximabe, Adalimumabe)"
      },
      {
        "letter": "D",
        "label": "Megacólon Tóxico",
        "value": "Dilatação do Cólon Transverso > 6 cm à Radiografia com Toxemia Sistêmica (Urgência Clínica e Cirúrgica)"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Retocolite Ulcerativa) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Inflamatórias Intestinais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-21-sindromes-malabsortivas-e",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais",
    "fullTitle": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais",
    "subfocos": [
      "Doença Celíaca: Fisiopatologia, Sorologia e Biópsia Duodenal",
      "Síndrome do Intestino Irritável (Critérios de Roma IV) e Supercrescimento Bacteriano (SIBO)"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Propedêutica Sorológica",
        "value": "Anticorpo Antitransglutaminase Tecidual IgA (Anti-tTG) e Dosagem Concomitante de IgA Total"
      },
      {
        "letter": "B",
        "label": "Critérios de Roma IV para SII",
        "value": "Dor Abdominal Recorrente >= 1 dia/semana associada a Mudança na Frequência ou Forma das Fezes"
      },
      {
        "letter": "C",
        "label": "Supercrescimento Bacteriano no Intestino Delgado (SIBO)",
        "value": "Teste Respiratório do Hidrogênio Expirado e Tratamento com Rifaximina"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Propedêutica Sorológica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Síndromes Malabsortivas e Transtornos Funcionais Intestinais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-22-injuria-renal-aguda",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Injúria Renal Aguda",
    "fullTitle": "Injúria Renal Aguda (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Injúria Renal Aguda (LRA)",
    "subfocos": [
      "Classificação KDIGO e Fisiopatologia da LRA",
      "Indicações de Diálise de Urgência"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação KDIGO e Fisiopatologia da LRA",
        "value": "Estágios KDIGO 1, 2 e 3 Baseados em Níveis de Creatinina Sérica e Débito Urinário"
      },
      {
        "letter": "B",
        "label": "Diferenciação LRA Pré-Renal vs Necrose Tubular Aguda (NTA)",
        "value": "Fração de Excreção de Sódio (FeNa < 1% vs > 2%) e Osmolaridade Urinária"
      },
      {
        "letter": "C",
        "label": "Sedimento Urinário",
        "value": "Cilindros Hialinos (Pré-Renal) vs Cilindros Granulosos Pigmentares / Marrom-Grumosos (NTA)"
      },
      {
        "letter": "D",
        "label": "Indicações Absolutas de Terapia Renal Substitutiva de Urgência (Critérios AEIOU",
        "value": "Acidose Refratária pH < 7,15, Hipercalemia Grave Refratária, Intoxicações Exógenas Dialisáveis, Sobrecarga Volêmica / Edema Agudo Refratário, Uremia Grave Encefalopatia/Pericardite)"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação KDIGO e Fisiopatologia da LRA) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Injúria Renal Aguda e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-23-doenca-renal-cronica",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Doença Renal Crônica",
    "fullTitle": "Doença Renal Crônica (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Doença Renal Crônica (DRC) e Manejo Conservador/Dialítico",
    "subfocos": [
      "Estadiamento da DRC (KDIGO por TFG e Albuminúria) e Medidas Nefroprotetoras",
      "Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo (DMO-DRC)"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação KDIGO",
        "value": "Estágios G1 a G5 combinados com Categorias de Albuminúria A1 < 30, A2 30-300, A3 > 300 mg/g"
      },
      {
        "letter": "B",
        "label": "Nefroproteção Canônica",
        "value": "Controle Estrito de PA com Bloqueadores do SRAA (IECA/BRA), Inibidores de SGLT2 e Restrição Salina"
      },
      {
        "letter": "C",
        "label": "Anemia da DRC por Deficiência de Eritropoietina",
        "value": "Alvo de Hemoglobina 10-11,5 g/dL com Reposição de Ferro e Alfaepoetina"
      },
      {
        "letter": "D",
        "label": "DMO-DRC",
        "value": "Hiperparatireoidismo Secundário, Controle de Fósforo com Quelantes e Indicações Formais de Hemodiálise de Urgência"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação KDIGO) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doença Renal Crônica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-24-disturbios-hidroeletrolit",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Distúrbios Hidroeletrolíticos",
    "fullTitle": "Distúrbios Hidroeletrolíticos (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Distúrbios Hidroeletrolíticos (Sódio, Potássio, Cálcio, Magnésio)",
    "subfocos": [
      "Hiponatremia e Hipernatremia",
      "Distúrbios do Potássio (Hipercalemia e Hipocalemia)"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hiponatremia Hipotônica",
        "value": "Diferenciação pelo Volume Extracelular (Hipovolêmica, Euvolêmica - SIADH, Hipervolêmica)"
      },
      {
        "letter": "B",
        "label": "Hiponatremia e Hipernatremia",
        "value": "Correção com Solução Salina Hipertônica a 3% na Hiponatremia Aguda Sintomática Grave"
      },
      {
        "letter": "C",
        "label": "Limite de Correção da Natremia",
        "value": "Não Ultrapassar 8-10 mEq/L em 24 Horas para Evitar Síndrome de Desmielinização Osmótica (Mielinólise Pontina)"
      },
      {
        "letter": "D",
        "label": "Alterações Eletrocardiográficas da Hipercalemia",
        "value": "Onda T Apiculada e Simétrica em Tenda, Achatamento de P, Alargamento de QRS e Ritmo Sinusoidal"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Hiponatremia Hipotônica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Distúrbios Hidroeletrolíticos e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-25-disturbios-do-equilibrio",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Distúrbios do Equilíbrio Ácido-Base",
    "fullTitle": "Distúrbios do Equilíbrio Ácido-Base (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Distúrbios do Equilíbrio Ácido-Base",
    "subfocos": [
      "Acidose Metabólica com Ânion Gap Elevado vs Normal (Hiperclorêmica)",
      "Alcalose Metabólica e Distúrbios Respiratórios (Acidose e Alcalose)"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Cálculo do Ânion Gap Sérico (Na - [Cl + HCO3]; Normal",
        "value": "8 a 12 mEq/L) e Causas de AG Elevado (Mnemônico GOLD MARK: Cetoacidose, Uremia, Lático)"
      },
      {
        "letter": "B",
        "label": "Acidose Metabólica Hiperclorêmica (Ânion Gap Normal)",
        "value": "Perdas Digestivas Baixas (Diarreia) e Acidoses Tubulares Renais (ATRs)"
      },
      {
        "letter": "C",
        "label": "Alcalose Metabólica",
        "value": "Avaliação do Cloro Urinário (Cl-Responsiva < 15 mEq/L por Vômitos/Diuréticos vs Cl-Resistente por Hiperaldosteronismo)"
      },
      {
        "letter": "D",
        "label": "Compensação Respiratória Esperada (Fórmula de Winter",
        "value": "pCO2 = [1,5 x HCO3] + 8 +/- 2) para Identificação de Distúrbios Mistos"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Cálculo do Ânion Gap Sérico (Na - [Cl + HCO3]; Normal) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Distúrbios do Equilíbrio Ácido-Base e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-26-sindromes-glomerulares",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Síndromes Glomerulares",
    "fullTitle": "Síndromes Glomerulares (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Síndromes Glomerulares (Nefrítica, Nefrótica, GNRP)",
    "subfocos": [
      "Síndrome Nefrótica: Fisiopatologia, Complicações e Padrões Histológicos",
      "Síndrome Nefrítica, GNRP e Glomerulonefrite Difusa Aguda (GNDA)"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Clássica",
        "value": "Proteinúria Maciça (> 3,5 g/24h ou Relação P/C urinária > 3,0), Hipoalbuminemia Severa e Edema Generalizado"
      },
      {
        "letter": "B",
        "label": "Principais Nefropatias",
        "value": "Lesão Mínima (Crianças, Resposta a Corticoide), GESF (Mais Comum em Adultos), Membranosa (Anticorpo Anti-PLA2R) e Risco de Trombose de Veia Renal"
      },
      {
        "letter": "C",
        "label": "Tétrade Nefrítica",
        "value": "Hematúria Dismórfica com Cilindros Hemáticos, Hipertensão Arterial, Edema Periorbital e Oligúria"
      },
      {
        "letter": "D",
        "label": "GNDA Pós-Estreptocócica",
        "value": "Queda Transitória de C3 e Consumo de Complemento"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tríade Clássica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Síndromes Glomerulares e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-27-doencas-tubulointersticia",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Doenças Tubulointersticiais e Microangiopatias Trombóticas",
    "fullTitle": "Doenças Tubulointersticiais e Microangiopatias Trombóticas (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Doenças Tubulointersticiais e Microangiopatias Trombóticas",
    "subfocos": [
      "Nefrite Intersticial Aguda (NIA) e Necrose Tubular Aguda (NTA)",
      "Microangiopatia Trombótica: Púrpura Trombocitopênica Trombótica (PTT) e SHU"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Nefrite Intersticial Aguda Induzida por Fármacos (Beta-lactâmicos, AINEs, IBP) com Tríade Típica",
        "value": "Febre, Rash Cutâneo e Eosinofilia/Eosinofilúria"
      },
      {
        "letter": "B",
        "label": "Necrose Tubular Aguda",
        "value": "NTA Isquêmica ou Tóxica por Aminoglicosídeos/Contraste Iodado"
      },
      {
        "letter": "C",
        "label": "PTT no Adulto",
        "value": "Deficiência Severa da Metaloprotease ADAMTS13 (< 10%), Presença de Esquizócitos no Sangue Periférico e Plasmaférese Terapêutica de Emergência"
      },
      {
        "letter": "D",
        "label": "Síndrome Hemolítico-Urêmica",
        "value": "SHU Típica por E. coli produtora de Toxina Shiga vs Atípica por Desregulação do Complemento"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Nefrite Intersticial Aguda Induzida por Fármacos (Beta-lactâmicos, AINEs, IBP) com Tríade Típica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Tubulointersticiais e Microangiopatias Trombóticas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-28-litiase-renal-e-infeccoes",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Litíase Renal e Infecções Urinárias no Adulto",
    "fullTitle": "Litíase Renal e Infecções Urinárias no Adulto (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Litíase Renal e Infecções Urinárias no Adulto",
    "subfocos": [
      "Investigação Metabólica da Nefrolitíase Recorrente",
      "Cistite, Pielonefrite Aguda e ITU Complicada no Adulto"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Composição dos Cálculos",
        "value": "Oxalato de Cálcio 75-80%, Ácido Úrico radiotransparente, Fosfato de Cálcio e Estruvita / Coraliforme"
      },
      {
        "letter": "B",
        "label": "Painel Metabólico Urinário de 24 Horas",
        "value": "Hipercalciúria Idiopática (Tratamento com Tiazídicos) e Hipocitratúria (Citrato de Potássio)"
      },
      {
        "letter": "C",
        "label": "Tratamento da Cistite Aguda Não-Complicada em Mulheres",
        "value": "Fosfomicina Trometamol 3g Dose Única ou Nitrofurantoína 100mg 6/6h por 5 dias"
      },
      {
        "letter": "D",
        "label": "Pielonefrite Aguda",
        "value": "Critérios de Internação Hospitalar e Terapia Empírica Guiada por Antibiograma (Ceftriaxona vs Ciprofloxacino)"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Composição dos Cálculos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Litíase Renal e Infecções Urinárias no Adulto e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-29-diabetes-mellitus-e-compl",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Diabetes Mellitus e Complicações Agudas",
    "fullTitle": "Diabetes Mellitus e Complicações Agudas (Endocrinologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Diabetes Mellitus e Complicações Agudas (CAD e EHH)",
    "subfocos": [
      "Diagnóstico e Metas Glicêmicas no Diabetes Tipo 2",
      "Cetoacidose Diabética (CAD) e Estado Hiperglicêmico Hiperosmolar (EHH)"
    ],
    "provenanceDefault": "Diretrizes SBD 2024-2025 / ADA 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Diagnósticos da SBD/ADA",
        "value": "Glicemia de Jejum >= 126 mg/dL, TOTG 2h >= 200 mg/dL, HbA1c >= 6,5% ou Sintomas Típicos com Glicemia Casual >= 200"
      },
      {
        "letter": "B",
        "label": "Metas Terapêuticas Individualizadas de Hemoglobina Glicada",
        "value": "Geral < 7,0%; Idosos/Frágeis < 8,0%"
      },
      {
        "letter": "C",
        "label": "Fármacos de Escolha com Proteção Cardiorrenal Comprovada",
        "value": "Inibidores de SGLT2 e Agonistas do GLP-1"
      },
      {
        "letter": "D",
        "label": "Critérios Laboratoriais da CAD",
        "value": "Glicemia > 250, Cetonemia/Cetonúria, Acidose Metabólica pH < 7,30 e Bicarbonato < 15"
      }
    ],
    "rule": "Diretriz SBD 2024-2025: Na cetoacidose diabética (CAD), a reposição de potássio precede a insulinoterapia: se K+ < 3,3 mEq/L, adie a insulina e reponha cloreto de potássio até normalização.",
    "bancaTrap": "A resolução da CAD não é determinada pela queda da glicemia (< 200 mg/dL), mas sim pelo fechamento do ânion-gap (≤ 12 mEq/L) e elevação do bicarbonato sérico (≥ 18 mEq/L)."
  },
  {
    "id": "tip-clin-30-complicacoes-cronicas-do",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Complicações Crônicas do Diabetes",
    "fullTitle": "Complicações Crônicas do Diabetes (Endocrinologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Complicações Crônicas do Diabetes (Nefropatia, Retinopatia, Neuropatia)",
    "subfocos": [
      "Doença Renal do Diabetes (DRD) e Rastreamento de Albuminúria",
      "Retinopatia Diabética, Polineuropatia Simétrica Distal e Pé Diabético"
    ],
    "provenanceDefault": "Diretrizes SBD 2024-2025 / ADA 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Rastreamento Anual Obrigatório",
        "value": "Relação Albuminúria/Creatinúria (RAC em Amostra Isolada) e Estimativa da TFG"
      },
      {
        "letter": "B",
        "label": "Histologia Típica",
        "value": "Glomeruloesclerose Nodular Intercapilar (Nódulos de Kimmelstiel-Wilson) e Terapia com iSGLT2 e Finerenona"
      },
      {
        "letter": "C",
        "label": "Retinopatia Diabética Não-Proliferativa",
        "value": "Microaneurismas e Exsudatos) vs Proliferativa (Neovascularização de Retina e Laserterapia"
      },
      {
        "letter": "D",
        "label": "Exame do Pé Diabético",
        "value": "Teste do Monofilamento de Semmes-Weinstein de 10g para Perda da Sensibilidade Protetora e Prevenção de Úlceras"
      }
    ],
    "rule": "Diretriz SBD 2024-2025: Na cetoacidose diabética (CAD), a reposição de potássio precede a insulinoterapia: se K+ < 3,3 mEq/L, adie a insulina e reponha cloreto de potássio até normalização.",
    "bancaTrap": "A resolução da CAD não é determinada pela queda da glicemia (< 200 mg/dL), mas sim pelo fechamento do ânion-gap (≤ 12 mEq/L) e elevação do bicarbonato sérico (≥ 18 mEq/L)."
  },
  {
    "id": "tip-clin-31-doencas-da-glandula-tireo",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doenças da Glândula Tireoide",
    "fullTitle": "Doenças da Glândula Tireoide (Endocrinologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Doenças da Glândula Tireoide (Hipo, Hiper e Tireoidites)",
    "subfocos": [
      "Hipotireoidismo Primário (Tireoidite de Hashimoto) e Hipotireoidismo Subclínico",
      "Hipertireoidismo (Doença de Graves, Bócio Multinodular Tóxico) e Tireoidites"
    ],
    "provenanceDefault": "Diretrizes SBD 2024-2025 / ADA 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico Laboratorial",
        "value": "TSH Elevado e T4 Livre Baixo; Anticorpo Anti-TPO Positivo Confirmando Doença de Hashimoto"
      },
      {
        "letter": "B",
        "label": "Tratamento com Levotiroxina",
        "value": "1,6 mcg/kg/dia em Jejum) e Critérios de Tratamento do Hipotireoidismo Subclínico (TSH > 10 ou Gravidez"
      },
      {
        "letter": "C",
        "label": "Doença de Graves",
        "value": "Anticorpo Anti-Receptor de TSH (TRAb) Positivo, Bócio Difuso Vascularizado e Oftalmopatia Infiltrativa"
      },
      {
        "letter": "D",
        "label": "Tireoidite Subaguda de De Quervain",
        "value": "Pós-Viral, Dor Cervical Intensa, VHS Muito Alto, Captação de Iodo Baixa e Tratamento com AINEs"
      }
    ],
    "rule": "Diretriz oficial de Endocrinologia (Diretrizes SBD 2024-2025 / ADA 2025): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Diagnóstico Laboratorial) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças da Glândula Tireoide e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-32-doencas-das-glandulas-adr",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Doenças das Glândulas Adrenais",
    "fullTitle": "Doenças das Glândulas Adrenais (Endocrinologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Doenças das Glândulas Adrenais (Cushing, Addison, Feocromocitoma)",
    "subfocos": [
      "Síndrome de Cushing: Algoritmo de Triagem e Localização Etiológica",
      "Insuficiência Adrenal (Doença de Addison) e Feocromocitoma"
    ],
    "provenanceDefault": "Diretrizes SBD 2024-2025 / ADA 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Testes de Triagem Inicial",
        "value": "Cortisol Salivar Noturno, Cortisol Livre Urinário de 24h e Teste de Supressão com 1mg de Dexametasona"
      },
      {
        "letter": "B",
        "label": "Dosagem de ACTH Plasmático para Diferenciação",
        "value": "ACTH-Dependente (Doença de Cushing Hipofisária) vs ACTH- Independente (Adenoma Adrenal)"
      },
      {
        "letter": "C",
        "label": "Insuficiência Adrenal Primária",
        "value": "Hipotensão, Hiponatremia, Hipercalemia e Hiperpigmentação Cutaneomucosa por Excesso de ACTH"
      },
      {
        "letter": "D",
        "label": "Feocromocitoma",
        "value": "Paroxismos de Cefaleia, Sudorese e Palpitações associados a HAS Severa e Dosagem de Metanefrinas Livres Plasmáticas"
      }
    ],
    "rule": "Diretriz oficial de Endocrinologia (Diretrizes SBD 2024-2025 / ADA 2025): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Testes de Triagem Inicial) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças das Glândulas Adrenais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-33-disturbios-hipotalamo-hip",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Distúrbios Hipotálamo-Hipofisários e Prolactina",
    "fullTitle": "Distúrbios Hipotálamo-Hipofisários e Prolactina (Endocrinologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Distúrbios Hipotálamo-Hipofisários e Prolactina",
    "subfocos": [
      "Hiperprolactinemia e Prolactinomas (Micro vs Macroprolactinomas)",
      "Acromegalia e Diabetes Insipidus (Central vs Nefrogênico)"
    ],
    "provenanceDefault": "Diretrizes SBD 2024-2025 / ADA 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Causas Mais Frequentes",
        "value": "Fármacos Antidopaminérgicos (Antipsicóticos, Metoclopramida), Hipotireoidismo Primário e Prolactinomas"
      },
      {
        "letter": "B",
        "label": "Tratamento Clínico de 1ª Linha com Agonistas Dopaminérgicos",
        "value": "Cabergolina / Bromocriptina"
      },
      {
        "letter": "C",
        "label": "Acromegalia",
        "value": "Dosagem de IGF-1 Sérico Elevado e Falha de Supressão do GH no Teste Oral de Tolerância à Glicose"
      },
      {
        "letter": "D",
        "label": "Diabetes Insipidus",
        "value": "Poliúria Hipotônica (Osmolaridade Urinária < 300 mOsm/kg) e Teste da Desmopressina (dDAVP) para Diferenciação Central vs Renal"
      }
    ],
    "rule": "Diretriz oficial de Endocrinologia (Diretrizes SBD 2024-2025 / ADA 2025): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Causas Mais Frequentes) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Distúrbios Hipotálamo-Hipofisários e Prolactina e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-34-obesidade-sindrome-metabo",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Obesidade, Síndrome Metabólica e Dislipidemias",
    "fullTitle": "Obesidade, Síndrome Metabólica e Dislipidemias (Endocrinologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Obesidade, Síndrome Metabólica e Dislipidemias",
    "subfocos": [
      "Critérios Diagnósticos de Síndrome Metabólica (NCEP-ATP III / IDF)",
      "Dislipidemias: Metas de LDL-c e Terapia Farmacológica (Estatinas e Ezetimiba)"
    ],
    "provenanceDefault": "Diretrizes SBD 2024-2025 / ADA 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Harmonizados (Presença de 3 ou mais",
        "value": "Circunferência Abdominal Aumentada, Triglicerídeos >= 150, HDL < 40/50, PA >= 130/85, Glicemia >= 100)"
      },
      {
        "letter": "B",
        "label": "Critérios Diagnósticos de Síndrome Metabólica (NCEP-ATP III / IDF)",
        "value": "Fisiopatologia Central da Resistência Insulínica e Risco Cardiovascular Exponencial"
      },
      {
        "letter": "C",
        "label": "Estratificação do Risco Cardiovascular",
        "value": "Baixo, Intermediário, Alto e Muito Alto Risco) com Metas Específicas de LDL-c (< 50 mg/dL no Muito Alto"
      },
      {
        "letter": "D",
        "label": "Terapia Hipolipemiante de Alta Potência",
        "value": "Atorvastatina 40-80mg ou Rosuvastatina 20-40mg"
      }
    ],
    "rule": "Diretriz oficial de Endocrinologia (Diretrizes SBD 2024-2025 / ADA 2025): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios Harmonizados (Presença de 3 ou mais) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Obesidade, Síndrome Metabólica e Dislipidemias e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-35-disturbios-do-metabolismo",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Distúrbios do Metabolismo Ósseo e Paratireoide",
    "fullTitle": "Distúrbios do Metabolismo Ósseo e Paratireoide (Endocrinologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Distúrbios do Metabolismo Ósseo e Paratireoide",
    "subfocos": [
      "Osteoporose no Adulto: Densitometria Óssea e Escore FRAX",
      "Distúrbios do Cálcio: Hipercalcemia da Malignidade vs Hiperparatireoidismo"
    ],
    "provenanceDefault": "Diretrizes SBD 2024-2025 / ADA 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Diagnósticos da OMS à Densitometria",
        "value": "T-score <= -2,5 Desvios-Padrão em Coluna Lombar ou Colo Femoral"
      },
      {
        "letter": "B",
        "label": "Tratamento Farmacológico Anti-Reabsortivo (Bisfosfonatos Orais e Intravenosos",
        "value": "Alendronato e Zoledronato) e Teriparatida"
      },
      {
        "letter": "C",
        "label": "Hipercalcemia da Malignidade",
        "value": "Queda Rápida do Estado Geral, PTH Suprimido e Elevação do Peptídeo Relacionado ao PTH (PTHrP)"
      },
      {
        "letter": "D",
        "label": "Distúrbios do Cálcio: Hipercalcemia da Malignidade vs Hiperparatireoidismo",
        "value": "Tratamento Imediato da Crise Hipercalcêmica com Hidratação Vigorosa com Solução Salina 0,9% e Ácido Zoledrônico EV"
      }
    ],
    "rule": "Diretriz oficial de Endocrinologia (Diretrizes SBD 2024-2025 / ADA 2025): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios Diagnósticos da OMS à Densitometria) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Distúrbios do Metabolismo Ósseo e Paratireoide e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-36-artrite-reumatoide-e-doen",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Artrite Reumatoide e Doença de Still",
    "fullTitle": "Artrite Reumatoide e Doença de Still (Reumatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Artrite Reumatoide e Doença de Still",
    "subfocos": [
      "Critérios de Classificação ACR/EULAR 2010 da Artrite Reumatoide",
      "Medicamentos Modificadores do Curso da Doença (DMARDs) e Doença de Still"
    ],
    "provenanceDefault": "Diretrizes SBR / Consenso ACR-EULAR 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Poliartrite Crônica, Simétrica, Periférica, de Pequenas e Grandes Articulações, com Rigidez Matinal > 1 Hora e Poupação das Interfalângicas Distais",
        "value": "IFD"
      },
      {
        "letter": "B",
        "label": "Marcadores Sorológicos",
        "value": "Fator Reumatoide (FR) e Anticorpo Antipeptídeo Citrulinado Cíclico (Anti-CCP: Alta Especificidade)"
      },
      {
        "letter": "C",
        "label": "Terapia de 1ª Linha Canônica",
        "value": "Metotrexato (MTX) associado a Ácido Fólico e Associação com Biológicos Anti-TNF na Falha Terapêutica"
      },
      {
        "letter": "D",
        "label": "Doença de Still do Adulto",
        "value": "Febre Diária em Agulha, Erupção Cutânea Evanescente Cor Salmão e Hiperferritinemia Acentuada"
      }
    ],
    "rule": "Diretriz oficial de Reumatologia (Diretrizes SBR / Consenso ACR-EULAR 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Poliartrite Crônica, Simétrica, Periférica, de Pequenas e Grandes Articulações, com Rigidez Matinal > 1 Hora e Poupação das Interfalângicas Distais) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Artrite Reumatoide e Doença de Still e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-37-lupus-eritematoso-sistemi",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Lúpus Eritematoso Sistêmico",
    "fullTitle": "Lúpus Eritematoso Sistêmico (Reumatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Lúpus Eritematoso Sistêmico (LES) e SAF",
    "subfocos": [
      "Critérios EULAR/ACR 2019 de Classificação do LES",
      "Síndrome do Anticorpo Antifosfolípide (SAF) e Tratamento do LES"
    ],
    "provenanceDefault": "Diretrizes SBR / Consenso ACR-EULAR 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critério de Entrada Obrigatório",
        "value": "Anticorpo Antinuclear (FAN) Positivo em Título >= 1:80 em Células HEp-2"
      },
      {
        "letter": "B",
        "label": "Critérios Aditivos e Específicos",
        "value": "Anti-Sm e Anti-DNA Dupla Hélice (Nativo), Queda de Complemento (C3 e C4) e Nefrite Lúpica"
      },
      {
        "letter": "C",
        "label": "SAF",
        "value": "Eventos Trombóticos Vasculares ou Morbidade Gestacional associados a Anticoagulante Lúpico, Anticardiolipina ou Anti-Beta-2-Glicoproteína I"
      },
      {
        "letter": "D",
        "label": "Pilar Terapêutico Universal do LES",
        "value": "Hidroxicloroquina para Todos os Pacientes e Imunossupressão (Micofenolato / Ciclofosfamida na Nefrite)"
      }
    ],
    "rule": "Diretriz oficial de Reumatologia (Diretrizes SBR / Consenso ACR-EULAR 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critério de Entrada Obrigatório) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Lúpus Eritematoso Sistêmico e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-38-espondiloartrites",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Espondiloartrites",
    "fullTitle": "Espondiloartrites (Reumatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Espondiloartrites (Espondilite Anquilosante, Artrite Psoriásica, Reativa)",
    "subfocos": [
      "Espondilite Anquilosante: Lombalgia Inflamatória e HLA-B27",
      "Artrite Psoriásica e Artrite Reativa (Síndrome de Reiter)"
    ],
    "provenanceDefault": "Diretrizes SBR / Consenso ACR-EULAR 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Características da Dor Lombar Inflamatória",
        "value": "Início < 45 anos, Melhora com Movimento, Piora com Repouso e Rigidez Matinal > 30 min"
      },
      {
        "letter": "B",
        "label": "Espondilite Anquilosante: Lombalgia Inflamatória e HLA-B27",
        "value": "Sacroiliíte Bilateral à Ressonância Magnética / Radiografia e Presença do Antígeno HLA-B27"
      },
      {
        "letter": "C",
        "label": "Artrite Psoriásica",
        "value": "Padrão Oligoarticular Assimétrico ou Poliarticular com Acometimento de IFD, Dactilite ('Dedo em Salsicha') e Pitting Ungueal"
      },
      {
        "letter": "D",
        "label": "Artrite Reativa",
        "value": "Tríade Clássica (Artrite Assimétrica, Uretrite Não-Gonocócica e Conjuntivite) após Infecção Geniturinária ou Gastrointestinal"
      }
    ],
    "rule": "Diretriz oficial de Reumatologia (Diretrizes SBR / Consenso ACR-EULAR 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Características da Dor Lombar Inflamatória) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Espondiloartrites e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-39-vasculites-sistemicas",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Vasculites Sistêmicas",
    "fullTitle": "Vasculites Sistêmicas (Reumatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Vasculites Sistêmicas (Grandes, Médios e Pequenos Vasos)",
    "subfocos": [
      "Vasculites de Grandes e Médios Vasos (Arterite Temporal, Takayasu e Poliarterite Nodosa)",
      "Vasculites de Pequenos Vasos Associadas ao ANCA e por Imunocomplexos"
    ],
    "provenanceDefault": "Diretrizes SBR / Consenso ACR-EULAR 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Arterite de Células Gigantes / Temporal",
        "value": "Idosos > 50 Anos com Cefaleia Temporal, Claudicação de Mandíbula, VHS Muito Alto e Risco de Cegueira por Oclusão da Artéria Ciliar"
      },
      {
        "letter": "B",
        "label": "Arterite de Takayasu",
        "value": "Mulheres Jovens, Assimetria de Pulsos e Sopros Vasculares) e Poliarterite Nodosa (Associação com Hepatite B"
      },
      {
        "letter": "C",
        "label": "Granulomatose com Poliangiite / Wegener",
        "value": "c-ANCA / Anti-PR3 Positivo, Sinusopatia Crônica, Nódulos Pulmonares Cavitados e Glomerulonefrite"
      },
      {
        "letter": "D",
        "label": "Poliangiite Microscópica",
        "value": "p-ANCA / Anti-MPO) e Púrpura de Henoch-Schönlein (Vasculite por IgA com Púrpura Palpável em Membros Inferiores"
      }
    ],
    "rule": "Diretriz oficial de Reumatologia (Diretrizes SBR / Consenso ACR-EULAR 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Arterite de Células Gigantes / Temporal) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Vasculites Sistêmicas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-40-esclerose-sistemica-e-mio",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Esclerose Sistêmica e Miopatias Inflamatórias",
    "fullTitle": "Esclerose Sistêmica e Miopatias Inflamatórias (Reumatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Esclerose Sistêmica e Miopatias Inflamatórias",
    "subfocos": [
      "Esclerose Sistêmica Limitada (Síndrome CREST) vs Difusa",
      "Polimiosite e Dermatomiosite: Diagnóstico Clínico e Imunológico"
    ],
    "provenanceDefault": "Diretrizes SBR / Consenso ACR-EULAR 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Síndrome CREST",
        "value": "Calcinose, Raynaud, Esofagopatia, Esclerodactilia, Telangiectasias"
      },
      {
        "letter": "B",
        "label": "Forma Difusa",
        "value": "Espessamento Cutâneo Proximal aos Cotovelos/Joelhos, Anticorpo Anti-Scl-70 (Topoisomerase I) e Risco de Crise Renal Esclerodérmica"
      },
      {
        "letter": "C",
        "label": "Fraqueza Muscular Proximal e Simétrica com Elevação Acentuada de Enzimas Musculares",
        "value": "CPK e Aldolase"
      },
      {
        "letter": "D",
        "label": "Manifestações Cutâneas Patognomônicas da Dermatomiosite",
        "value": "Heliótropo (Eritema Violáceo Periorbital) e Pápulas de Gottron sobre as Articulações"
      }
    ],
    "rule": "Diretriz oficial de Reumatologia (Diretrizes SBR / Consenso ACR-EULAR 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Síndrome CREST) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Esclerose Sistêmica e Miopatias Inflamatórias e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-41-artropatias-por-microcris",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Artropatias por Microcristais",
    "fullTitle": "Artropatias por Microcristais (Reumatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Artropatias por Microcristais (Gota e Pseudogota)",
    "subfocos": [
      "Gota Úrica: Fisiopatologia, Crise Aguda de Podagra e Artrocentese",
      "Tratamento da Crise Aguda vs Terapia Hipouricemiante Crônica"
    ],
    "provenanceDefault": "Diretrizes SBR / Consenso ACR-EULAR 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Clínico da Crise Aguda",
        "value": "Monoartrite Hiperaguda Exuberante, Mais Comumente na 1ª Articulação Metatarsofalângica (Podagra)"
      },
      {
        "letter": "B",
        "label": "Manejo da Crise Inflamatória",
        "value": "AINEs em Doses Plenas, Colchicina Precoce ou Corticoides Orais (Proibido Alterar Dose de Alopurinol na Crise)"
      },
      {
        "letter": "C",
        "label": "Controle Crônico com Alopurinol associado a Profilaxia de Crise com Colchicina em Baixa Dose",
        "value": "Meta de Ácido Úrico < 6,0 mg/dL"
      }
    ],
    "rule": "Diretriz oficial de Reumatologia (Diretrizes SBR / Consenso ACR-EULAR 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Quadro Clínico da Crise Aguda) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Artropatias por Microcristais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-42-osteoartrite-e-fibromialg",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Osteoartrite e Fibromialgia",
    "fullTitle": "Osteoartrite e Fibromialgia (Reumatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Osteoartrite e Fibromialgia",
    "subfocos": [
      "Osteoartrite (Artrose): Fisiopatologia, Nódulos de Heberden/Bouchard e Radiologia",
      "Fibromialgia: Critérios Diagnósticos do ACR e Terapia Farmacológica"
    ],
    "provenanceDefault": "Diretrizes SBR / Consenso ACR-EULAR 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Clínico",
        "value": "Dor Articular Mecânica que Piora com o Uso e Melhora com o Repouso, Rigidez Matinal Breve (< 30 min) e Crepitação"
      },
      {
        "letter": "B",
        "label": "Sinais Radiológicos Típicos",
        "value": "Redução Assimétrica do Espaço Articular, Esclerose Subcondral, Osteófitos Marginais e Cistos Subcondrais"
      },
      {
        "letter": "C",
        "label": "Fibromialgia: Critérios Diagnósticos do ACR e Terapia Farmacológica",
        "value": "Quadro de Dor Crônica Difusa Generalizada por mais de 3 Meses associada a Fadiga Crônica, Sono Não-Reparador e Disfunção Cognitiva"
      },
      {
        "letter": "D",
        "label": "Tratamento Multidisciplinar com Exercícios Físicos Aeróbicos Regulares e Farmacoterapia Central",
        "value": "Duloxetina, Pregabalina e Ciclobenzaprina"
      }
    ],
    "rule": "Diretriz oficial de Reumatologia (Diretrizes SBR / Consenso ACR-EULAR 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Quadro Clínico) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Osteoartrite e Fibromialgia e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-43-infeccao-pelo-hiv-e-doenc",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Infecção pelo HIV e Doenças Oportunistas",
    "fullTitle": "Infecção pelo HIV e Doenças Oportunistas (Infectologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecção pelo HIV e Doenças Oportunistas",
    "subfocos": [
      "Diagnóstico e Terapia Antirretroviral (TARV)",
      "Doenças Oportunistas Maiores no HIV"
    ],
    "provenanceDefault": "PCDT Ministério da Saúde / Surviving Sepsis 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico pelo Fluxograma do MS",
        "value": "Testes Rápidos em Paralelo ou Sequencial e Carga Viral"
      },
      {
        "letter": "B",
        "label": "Esquema Inicial de Escolha no Brasil",
        "value": "Tenofovir (TDF) + Lamivudina (3TC) + Dolutegravir (DTG)"
      },
      {
        "letter": "C",
        "label": "Monitorização Terapêutica",
        "value": "Carga Viral Indetectável e Contagem de Linfócitos T CD4+"
      },
      {
        "letter": "D",
        "label": "Profilaxia Pré-Exposição",
        "value": "PrEP) e Profilaxia Pós-Exposição (PEP em até 72h"
      }
    ],
    "rule": "Diretriz oficial de Infectologia (PCDT Ministério da Saúde / Surviving Sepsis 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Diagnóstico pelo Fluxograma do MS) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Infecção pelo HIV e Doenças Oportunistas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-44-arboviroses-e-viroses-sis",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Arboviroses e Viroses Sistêmicas",
    "fullTitle": "Arboviroses e Viroses Sistêmicas (Infectologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Arboviroses e Viroses Sistêmicas (Dengue, Chikungunya, Zika, Febre Amarela)",
    "subfocos": [
      "Dengue (Classificação de Risco e Manejo Clínico)",
      "Febre Amarela, Chikungunya e Zika Vírus"
    ],
    "provenanceDefault": "PCDT Ministério da Saúde / Surviving Sepsis 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Grupos de Manejo do MS",
        "value": "Grupo A (Sem Alarme/Risco - Hidratação Oral Domiciliar), Grupo B (Condição Especial / Risco Social - Hidratação Oral Supervisionada no Posto)"
      },
      {
        "letter": "B",
        "label": "Sinais de Alarme",
        "value": "Dor Abdominal Intensa/Contínua, Vômitos Persistentes, Acúmulo de Líquidos, Hipotensão Postural, Hepatomegalia > 2 cm, Letargia e Hemoconcentração) = Grupo C (Hidratação Venosa Imediata 10 mL/kg na 1ª hora"
      },
      {
        "letter": "C",
        "label": "Choque e Sangramento Grave = Grupo D",
        "value": "Ressuscitação Volêmica Venosa Agressiva 20 mL/kg em 20 min"
      },
      {
        "letter": "D",
        "label": "Febre Amarela",
        "value": "Sinal de Faget (Dissociação Pulso-Temperatura), Insuficiência Hepatorrenal Ictérica e Hemorrágica"
      }
    ],
    "rule": "Diretriz oficial de Infectologia (PCDT Ministério da Saúde / Surviving Sepsis 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Grupos de Manejo do MS) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Arboviroses e Viroses Sistêmicas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-45-sepse-e-choque-septico-no",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Sepse e Choque Séptico no Adulto",
    "fullTitle": "Sepse e Choque Séptico no Adulto (Infectologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Sepse e Choque Séptico no Adulto",
    "subfocos": [
      "Definições do Consenso Sepsis-3 e Escore SOFA / qSOFA",
      "Pacote de 1 Hora do Surviving Sepsis Campaign (SSC)"
    ],
    "provenanceDefault": "PCDT Ministério da Saúde / Surviving Sepsis 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sepse",
        "value": "Disfunção Orgânica Ameaçadora à Vida Causada por Resposta Desregulada do Hospedeiro à Infecção (Aumento de >= 2 Pontos no Escore SOFA)"
      },
      {
        "letter": "B",
        "label": "Choque Séptico",
        "value": "Necessidade de Vasopressor (Noradrenalina) para Manter PAM >= 65 mmHg E Lactato Sérico > 2 mmol/L apesar de Ressuscitação Volêmica Adequada"
      },
      {
        "letter": "C",
        "label": "Medidas Canônicas Obrigatórias na 1ª Hora",
        "value": "Dosagem de Lactato Sérico, Coleta de Hemoculturas antes dos Antibióticos e Início Imediato de Antimicrobianos de Amplo Espectro"
      },
      {
        "letter": "D",
        "label": "Ressuscitação Volêmica com Cristaloides",
        "value": "30 mL/kg nas Primeiras 3 Horas"
      }
    ],
    "rule": "Diretriz oficial de Infectologia (PCDT Ministério da Saúde / Surviving Sepsis 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Sepse) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Sepse e Choque Séptico no Adulto e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-46-infeccoes-por-micobacteri",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Infecções por Micobactérias e Fungos Sistêmicos",
    "fullTitle": "Infecções por Micobactérias e Fungos Sistêmicos (Infectologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecções por Micobactérias e Fungos Sistêmicos",
    "subfocos": [
      "Tuberculose Pulmonar: Diagnóstico (TRM-TB, Baciloscopia) e Esquema RIPE",
      "Micoses Endêmicas: Paracoccidioidomicose, Histoplasmose e Criptococose"
    ],
    "provenanceDefault": "PCDT Ministério da Saúde / Surviving Sepsis 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Teste Rápido Molecular para Tuberculose (TRM-TB)",
        "value": "Detecção do DNA do M. tuberculosis e Detecção Rápida de Resistência à Rifampicina"
      },
      {
        "letter": "B",
        "label": "Paracoccidioidomicose",
        "value": "Exposição Rural, Lesões Mucosas em Estomatite Moriforme e Leveduras com Brotamento Múltiplo em 'Roda de Leme'"
      },
      {
        "letter": "C",
        "label": "Histoplasmose Disseminada e Criptococose Meníngea no Paciente Imunodeprimido",
        "value": "Tratamento com Anfotericina B e Fluconazol"
      }
    ],
    "rule": "Diretriz oficial de Infectologia (PCDT Ministério da Saúde / Surviving Sepsis 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Teste Rápido Molecular para Tuberculose (TRM-TB)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Infecções por Micobactérias e Fungos Sistêmicos e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-47-zoonoses-e-doencas-tropic",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Zoonoses e Doenças Tropicais",
    "fullTitle": "Zoonoses e Doenças Tropicais (Infectologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Zoonoses e Doenças Tropicais (Leptospirose, Malária, Chagas, Leishmanioses)",
    "subfocos": [
      "Leptospirose (Doença de Weil) e Malária no Brasil",
      "Doença de Chagas (Fase Aguda e Crônica) e Leishmaniose Visceral (Calazar)"
    ],
    "provenanceDefault": "PCDT Ministério da Saúde / Surviving Sepsis 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Síndrome de Weil (Forma Ictero-Hemorrágica Grave)",
        "value": "Tríade de Icterícia Rubínica / Alaranjada, Insuficiência Renal Aguda Hipocalêmica e Hemorragia Pulmonar"
      },
      {
        "letter": "B",
        "label": "Malária",
        "value": "Febre Terçã (P. vivax e P. falciparum) vs Quartã (P. malariae), Diagnóstico por Gota Espessa e Tratamento com Cloroquina + Primaquina"
      },
      {
        "letter": "C",
        "label": "Doença de Chagas",
        "value": "Formas Clínicas Crônicas Cardíaca (Bloqueio de Ramo Direito + BDAS) e Digestiva (Megaesôfago e Megacólon)"
      },
      {
        "letter": "D",
        "label": "Leishmaniose Visceral",
        "value": "Febre Prolongada, Hepatoesplenomegalia Volumosa Maciça, Pancitopenia e Terapia com Antimoniato de Meglumina ou Anfotericina B Lipossomal"
      }
    ],
    "rule": "Diretriz oficial de Infectologia (PCDT Ministério da Saúde / Surviving Sepsis 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Síndrome de Weil (Forma Ictero-Hemorrágica Grave)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Zoonoses e Doenças Tropicais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-48-infeccoes-respiratorias-e",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Infecções Respiratórias e Faríngeas",
    "fullTitle": "Infecções Respiratórias e Faríngeas (Infectologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecções Respiratórias e Faríngeas (COVID-19, Influenza)",
    "subfocos": [
      "Síndrome Respiratória Aguda Grave (SRAG) por Influenza e Oseltamivir",
      "COVID-19 no Adulto: Estratificação de Gravidade e Manejo Terapêutico"
    ],
    "provenanceDefault": "PCDT Ministério da Saúde / Surviving Sepsis 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Definição de SRAG",
        "value": "Síndrome Gripal associada a Dispneia, Saturação de O2 < 95% em ar ambiente ou Desconforto Respiratório"
      },
      {
        "letter": "B",
        "label": "Indicação Precoce de Inibidores da Neuraminidase",
        "value": "Oseltamivir Oral"
      },
      {
        "letter": "C",
        "label": "COVID-19 no Adulto: Estratificação de Gravidade e Manejo Terapêutico",
        "value": "Critérios de Gravidade e Indicação de Oxigenoterapia em Pacientes Hipoxêmicos"
      },
      {
        "letter": "D",
        "label": "Terapia com Corticosteroides Sistêmicos",
        "value": "Dexametasona 6 mg/dia por até 10 dias"
      }
    ],
    "rule": "Diretriz oficial de Infectologia (PCDT Ministério da Saúde / Surviving Sepsis 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Definição de SRAG) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Infecções Respiratórias e Faríngeas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-49-infeccoes-do-sistema-nerv",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Infecções do Sistema Nervoso Central no Adulto",
    "fullTitle": "Infecções do Sistema Nervoso Central no Adulto (Infectologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecções do Sistema Nervoso Central no Adulto (Meningites e Encefalites)",
    "subfocos": [
      "Meningite Bacteriana Aguda: Quadro Clínico, Punção Lombar e Análise Liquórica",
      "Terapia Antimicrobiana Empírica Imediata e Encefalite Herpética"
    ],
    "provenanceDefault": "PCDT Ministério da Saúde / Surviving Sepsis 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Clássica",
        "value": "Febre Alta, Rigidez de Nuca (Sinais de Kernig e Brudzinski) e Alteração do Nível de Consciência"
      },
      {
        "letter": "B",
        "label": "Padrão Liquórico Bacteriano Típico",
        "value": "Pleocitose com Predomínio Neutrofílico (> 80%), Hiperproteinorraquia (> 100-200 mg/dL) e Hipoglicorraquia Severa (Razão Líquor/Sérica < 0,4)"
      },
      {
        "letter": "C",
        "label": "Esquema Empírico de 1ª Linha",
        "value": "Ceftriaxona 2g EV 12/12h associada a Dexametasona EV Precoce antes ou junto com a Primeira Dose de Antibiótico"
      },
      {
        "letter": "D",
        "label": "Encefalite por Herpes Simples (HSV-1)",
        "value": "Febre, Alteração Comportamental, Crises Focais, Acometimento Temporal Típico à RNM e Aciclovir EV Imediato"
      }
    ],
    "rule": "Diretriz oficial de Infectologia (PCDT Ministério da Saúde / Surviving Sepsis 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tríade Clássica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Infecções do Sistema Nervoso Central no Adulto e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-50-infeccoes-hospitalares-e",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Infecções Hospitalares e Uso Racional de Antimicrobianos",
    "fullTitle": "Infecções Hospitalares e Uso Racional de Antimicrobianos (Infectologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecções Hospitalares e Uso Racional de Antimicrobianos",
    "subfocos": [
      "Pneumonia Associada à Ventilação Mecânica (PAV) e Infecções de Corrente Sanguínea (IPCS)",
      "Patógenos Multirresistentes (MDR / ESKAPE) e Stewardship de Antimicrobianos"
    ],
    "provenanceDefault": "PCDT Ministério da Saúde / Surviving Sepsis 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "PAV",
        "value": "Critérios Diagnósticos Radiológicos e Clínicos, Coleta de Aspirado Traqueal e Pacote de Medidas Preventivas (Cabeceira Elevada 30-45°)"
      },
      {
        "letter": "B",
        "label": "Infecção Primária de Corrente Sanguínea associada a Cateter Venoso Central",
        "value": "CVC"
      },
      {
        "letter": "C",
        "label": "Mecanismos de Resistência",
        "value": "Enterobactérias Produtoras de ESBL (Tratamento com Carbapenêmicos) e KPC (Tratamento com Ceftazidima-Avibactam)"
      },
      {
        "letter": "D",
        "label": "Staphylococcus aureus Resistente à Meticilina (MRSA",
        "value": "Tratamento com Vancomicina e Daptomicina) e Descalonamento Guiado por Cultura"
      }
    ],
    "rule": "Diretriz oficial de Infectologia (PCDT Ministério da Saúde / Surviving Sepsis 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (PAV) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Infecções Hospitalares e Uso Racional de Antimicrobianos e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-51-anemias-carenciais-e-de-d",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Anemias Carenciais e de Doença Crônica",
    "fullTitle": "Anemias Carenciais e de Doença Crônica (Hematologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Anemias Carenciais e de Doença Crônica",
    "subfocos": [
      "Anemia Ferropriva: Cinética do Ferro e Propedêutica Laboratorial",
      "Anemia de Doença Crônica e Anemias Megaloblásticas (B12 e Folato)"
    ],
    "provenanceDefault": "Associação Brasileira de Hematologia e Hemoterapia (ABHH)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Padrão Laboratorial Clássico",
        "value": "Microcitose e Hipocromia com RDW Elevado (Anisocitose), Ferritina Sérica Baixa (< 30 ng/mL) e Capacidade Total de Ligação do Ferro (TIBC) Elevada"
      },
      {
        "letter": "B",
        "label": "Anemia Ferropriva: Cinética do Ferro e Propedêutica Laboratorial",
        "value": "Investigação Etiológica Obrigatória de Sangramento Gastrointestinal Oculto em Homens Adultos e Mulheres Pós- Menopausadas"
      },
      {
        "letter": "C",
        "label": "Anemia de Doença Crônica / Inflamatória",
        "value": "Bloqueio de Ferro Mediado por Hepcidina com Ferritina Normal ou Elevada e Ferro Sérico Baixo"
      },
      {
        "letter": "D",
        "label": "Anemia Megaloblástica",
        "value": "Macrocitose Acentuada (VCM > 100-110 fL), Neutrófilos Hipersegmentados e Deficiência de Vitamina B12 com Sintomas Neurológicos"
      }
    ],
    "rule": "Diretriz oficial de Hematologia (Associação Brasileira de Hematologia e Hemoterapia (ABHH)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Padrão Laboratorial Clássico) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Anemias Carenciais e de Doença Crônica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-52-anemias-hemoliticas-adqui",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Anemias Hemolíticas Adquiridas e Congênitas",
    "fullTitle": "Anemias Hemolíticas Adquiridas e Congênitas (Hematologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Anemias Hemolíticas Adquiridas e Congênitas",
    "subfocos": [
      "Achados Gerais de Hemólise e Anemia Falciforme (Crises Vaso-Oclusivas)",
      "Anemias Hemolíticas Autoimunes (AHAI) e Esferocitose Hereditária"
    ],
    "provenanceDefault": "Associação Brasileira de Hematologia e Hemoterapia (ABHH)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tétrade Laboratorial da Hemólise",
        "value": "Aumento de Reticulócitos, Elevação de LDH, Hiperbilirrubinemia Indireta e Queda Acentuada de Haptoglobina"
      },
      {
        "letter": "B",
        "label": "Anemia Falciforme",
        "value": "Manejo da Crise Álgica Aguda Vaso-Oclusiva (Hidratação, Analgesia Escalonada com Opioides) e Síndrome Torácica Aguda"
      },
      {
        "letter": "C",
        "label": "AHAI por Anticorpos Quentes",
        "value": "IgG, Teste de Coombs Direto Positivo, Resposta a Corticoide) vs Anticorpos Frios (IgM / Aglutininas Frias"
      },
      {
        "letter": "D",
        "label": "Esferocitose Hereditária",
        "value": "Defeito no Citoesqueleto Eritrocitário (Espectrina/Anquirina), Teste de Fragilidade Osmótica Aumentado e Esplenectomia"
      }
    ],
    "rule": "Diretriz oficial de Hematologia (Associação Brasileira de Hematologia e Hemoterapia (ABHH)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tétrade Laboratorial da Hemólise) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Anemias Hemolíticas Adquiridas e Congênitas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-53-leucemias-agudas-e-cronic",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Leucemias Agudas e Crônicas no Adulto",
    "fullTitle": "Leucemias Agudas e Crônicas no Adulto (Hematologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Leucemias Agudas e Crônicas no Adulto",
    "subfocos": [
      "Leucemia Mieloide Aguda (LMA) e Leucemia Linfoide Aguda (LLA)",
      "Leucemia Mieloide Crônica (LMC) e Leucemia Linfoide Crônica (LLC)"
    ],
    "provenanceDefault": "Associação Brasileira de Hematologia e Hemoterapia (ABHH)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Definição Diagnóstica de Leucemia Aguda",
        "value": "Presença de >= 20% de Blastos na Medula Óssea ou Sangue Periférico"
      },
      {
        "letter": "B",
        "label": "LMA",
        "value": "Presença de Bastonetes de Auer ao Mielograma e Leucemia Promielocítica Aguda (LMA-M3 / Translocação t[15;17] tratada com ATRA)"
      },
      {
        "letter": "C",
        "label": "LMC",
        "value": "Neutrofilia Intensa com Desvio Escalonado à Esquerda, Cromossomo Philadelphia t(9;22) com Gene de Fusão BCR- ABL e Tratamento com Imatinibe"
      },
      {
        "letter": "D",
        "label": "LLC",
        "value": "Linfocitose B Clonal Absoluta Persistente em Idosos, Manchas de Gumprecht no Esfregaço e Estadiamento de Rai e Binet"
      }
    ],
    "rule": "Diretriz oficial de Hematologia (Associação Brasileira de Hematologia e Hemoterapia (ABHH)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Definição Diagnóstica de Leucemia Aguda) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Leucemias Agudas e Crônicas no Adulto e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-54-linfomas",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Linfomas",
    "fullTitle": "Linfomas (Hematologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Linfomas (Hodgkin e Não-Hodgkin) e Mieloma Múltiplo",
    "subfocos": [
      "Linfoma de Hodgkin vs Linfoma Não-Hodgkin (LNH)",
      "Mieloma Múltiplo: Critérios Diagnósticos Canônicos (CRAB)"
    ],
    "provenanceDefault": "Associação Brasileira de Hematologia e Hemoterapia (ABHH)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Linfoma de Hodgkin",
        "value": "Presença Típica de Células de Reed-Sternberg à Biópsia Linfonodal Excisional e Sintomas B (Febre Pel-Ebstein, Sudorese Noturna e Perda de Peso)"
      },
      {
        "letter": "B",
        "label": "Linfomas Não-Hodgkin",
        "value": "Linfoma Difuso de Grandes Células B (Tipo Mais Comum, Agressivo) e Linfoma Folicular Indolente"
      },
      {
        "letter": "C",
        "label": "Tétrade CRAB",
        "value": "Hipercalcemia (C), Insuficiência Renal (R), Anemia Normo/Normo (A) e Lesões Ósseas Líticas em 'Saca- Bocado' (B)"
      },
      {
        "letter": "D",
        "label": "Propedêutica",
        "value": "Eletroforese de Proteínas com Pico Monoclonal, Cadeias Leves Livres Séricas e Mielograma com Plasmócitos Clonais >= 10%"
      }
    ],
    "rule": "Diretriz oficial de Hematologia (Associação Brasileira de Hematologia e Hemoterapia (ABHH)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Linfoma de Hodgkin) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Linfomas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-55-disturbios-da-hemostasia",
    "category": "transfusao",
    "categoryLabel": "Gatilhos Hemoterápicos",
    "title": "Distúrbios da Hemostasia e Coagulopatias",
    "fullTitle": "Distúrbios da Hemostasia e Coagulopatias (Hematologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Distúrbios da Hemostasia e Coagulopatias (Hemofilias e Plaquetopenias)",
    "subfocos": [
      "Púrpura Trombocitopênica Imunológica (PTI) e Trombocitopenia Induzida por Heparina (HIT)",
      "Hemofilias Congênitas (Hemofilia A e B) e Coagulação Intravascular Disseminada (CIVD)"
    ],
    "provenanceDefault": "Associação Brasileira de Hematologia e Hemoterapia (ABHH)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "PTI Primária",
        "value": "Trombocitopenia Isolada sem Outras Citopenias ou Esquizócitos e Tratamento Inicial com Corticoides ou Imunoglobulina Humana EV"
      },
      {
        "letter": "B",
        "label": "HIT Tipo II",
        "value": "Queda de > 50% das Plaquetas após 5-10 Dias de Heparina com Alto Risco Paradoxal de Trombose (Suspensão e Troca por Fondaparinux)"
      },
      {
        "letter": "C",
        "label": "Hemofilia A (Deficiência de Fator VIII) e B (Deficiência de Fator IX)",
        "value": "Herança Ligada ao X, Alargamento Isolado do TTPA com TP Normal e Hemartroses"
      },
      {
        "letter": "D",
        "label": "CIVD",
        "value": "Consumo de Fatores e Plaquetas com Alargamento Simultâneo de TP e TTPA, Hipofibrinogenemia e Elevação Maciça de Dímero-D"
      }
    ],
    "rule": "Diretriz oficial de Hematologia (Associação Brasileira de Hematologia e Hemoterapia (ABHH)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (PTI Primária) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Distúrbios da Hemostasia e Coagulopatias e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-56-trombofilias-e-trombose",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Trombofilias e Trombose",
    "fullTitle": "Trombofilias e Trombose (Hematologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Trombofilias e Trombose",
    "subfocos": [
      "Trombofilias Hereditárias (Fator V de Leiden, Mutação da Protrombina)",
      "Indicações de Rastreamento de Trombofilias e Duração da Anticoagulação"
    ],
    "provenanceDefault": "Associação Brasileira de Hematologia e Hemoterapia (ABHH)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Trombofilia Hereditária Mais Comum",
        "value": "Fator V de Leiden (Resistência à Proteína C Ativada) e Mutação G20210A da Protrombina"
      },
      {
        "letter": "B",
        "label": "Deficiências de Inibidores Naturais da Coagulação",
        "value": "Antitrombina III, Proteína C e Proteína S (Risco de Necrose Cutânea por Varfarina)"
      },
      {
        "letter": "C",
        "label": "Critérios Clínicos de Investigação",
        "value": "TVP Não-Provocada em Idade Jovem (< 50 anos), Trombose em Sítios Incomuns (Mesentérica, Cerebral) ou Trombose Recorrente"
      },
      {
        "letter": "D",
        "label": "Momento Correto da Coleta",
        "value": "Evitar Dosagens na Fase Aguda da Trombose ou sob Uso de Anticoagulantes para Evitar Falso-Positivos"
      }
    ],
    "rule": "Diretriz oficial de Hematologia (Associação Brasileira de Hematologia e Hemoterapia (ABHH)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Trombofilia Hereditária Mais Comum) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Trombofilias e Trombose e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-57-medicina-transfusional-e",
    "category": "transfusao",
    "categoryLabel": "Gatilhos Hemoterápicos",
    "title": "Medicina Transfusional e Reações Hemolíticas",
    "fullTitle": "Medicina Transfusional e Reações Hemolíticas (Hematologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Medicina Transfusional e Reações Hemolíticas",
    "subfocos": [
      "Gatilhos Transfusionais para Concentrado de Hemácias e Plaquetas",
      "Reações Transfusionais Graves: TRALI, TACO e Hemólise Aguda Imune"
    ],
    "provenanceDefault": "Associação Brasileira de Hematologia e Hemoterapia (ABHH)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Gatilho Restritivo Padrão",
        "value": "Hemoglobina < 7,0 g/dL no Paciente Crítico Estável (Gatilho < 8,0 g/dL em Pacientes com Doença Cardiovascular Aguda)"
      },
      {
        "letter": "B",
        "label": "Transfusão de Plaquetas",
        "value": "Profilática em Contagens < 10.000/mm3 (Falência Medular) ou < 50.000/mm3 antes de Procedimentos Invasivos de Médio Porte"
      },
      {
        "letter": "C",
        "label": "TRALI (Lesão Pulmonar Aguda Relacionada à Transfusão)",
        "value": "Hipoxemia e Infiltrado Pulmonar Bilateral Não-Cardiogênico em até 6 Horas Pós-Transfusão"
      },
      {
        "letter": "D",
        "label": "TACO (Sobrecarga Circulatória Associada à Transfusão)",
        "value": "Edema Agudo Cardiogênico com Aumento de Pressão Venosa e BNP (Tratamento com Furosemida EV)"
      }
    ],
    "rule": "Diretriz oficial de Hematologia (Associação Brasileira de Hematologia e Hemoterapia (ABHH)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Gatilho Restritivo Padrão) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Medicina Transfusional e Reações Hemolíticas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-58-acidente-vascular-cerebra",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Acidente Vascular Cerebral",
    "fullTitle": "Acidente Vascular Cerebral (Neurologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Acidente Vascular Cerebral (Isquêmico e Hemorrágico)",
    "subfocos": [
      "Acidente Vascular Cerebral Isquêmico (AVCi) Agudo",
      "Acidente Vascular Cerebral Hemorrágico e Hemorragia Subaracnóidea"
    ],
    "provenanceDefault": "Academia Brasileira de Neurologia (ABN) 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Acidente Vascular Cerebral Isquêmico (AVCi) Agudo",
        "value": "Tomografia de Crânio sem Contraste Imediata para Exclusão de Sangramento"
      },
      {
        "letter": "B",
        "label": "Janela de Trombólise Intravenosa com Alteplase em até 4,5 Horas do Ictus",
        "value": "Critérios de Inclusão, Exclusão e Alvo Pressórico < 185x110 mmHg"
      },
      {
        "letter": "C",
        "label": "Acidente Vascular Cerebral Isquêmico (AVCi) Agudo",
        "value": "Trombectomia Mecânica Endovascular em até 6 a 24 Horas para Oclusão de Grandes Vasos da Circulação Anterior"
      },
      {
        "letter": "D",
        "label": "Prevenção Secundária",
        "value": "Antiagregação Plaquetária (AAS / Clopidogrel), Estatina de Alta Potência e Anticoagulação se Origem Cardioembólica"
      }
    ],
    "rule": "Diretriz oficial de Neurologia (Academia Brasileira de Neurologia (ABN) 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Acidente Vascular Cerebral Isquêmico (AVCi) Agudo) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Acidente Vascular Cerebral e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/avc_isquemico_tc.webp",
    "imageCaption": "Tomografia computadorizada de crânio sem contraste: área de hipodensidade corticossubcortical no território da artéria cerebral média esquerda.",
    "imageModality": "tc",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Lucien Monfils",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:CT_Brain_MCA_Infarct.jpg"
  },
  {
    "id": "tip-clin-59-epilepsias-e-estado-de-ma",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Epilepsias e Estado de Mal Epiléptico no Adulto",
    "fullTitle": "Epilepsias e Estado de Mal Epiléptico no Adulto (Neurologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Epilepsias e Estado de Mal Epiléptico no Adulto",
    "subfocos": [
      "Classificação das Crises Epilépticas (Focais vs Generalizadas)",
      "Protocolo de Manejo do Estado de Mal Epiléptico (Status Epilepticus)"
    ],
    "provenanceDefault": "Academia Brasileira de Neurologia (ABN) 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Crises Focais com Percepção Preservada vs Comprometida",
        "value": "Origem Temporal com Automatismos Motores"
      },
      {
        "letter": "B",
        "label": "Propedêutica Inicial do 1º Episódio Crítico",
        "value": "Neuroimagem (TC/RNM) e Eletroencefalograma (EEG) para Pesquisa de Descargas Epileptiformes"
      },
      {
        "letter": "C",
        "label": "Definição Operacional",
        "value": "Crise Convulsiva Contínua >= 5 Minutos ou 2 Crises sem Recuperação da Consciência"
      },
      {
        "letter": "D",
        "label": "Algoritmo Escalonado",
        "value": "1ª Linha com Benzodiazepínico EV (Diazepam / Lorazepam) seguido de 2ª Linha (Fenitoína EV ou Levetiracetam)"
      }
    ],
    "rule": "Diretriz oficial de Neurologia (Academia Brasileira de Neurologia (ABN) 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Crises Focais com Percepção Preservada vs Comprometida) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Epilepsias e Estado de Mal Epiléptico no Adulto e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-60-cefaleias-primarias-e-sec",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Cefaleias Primárias e Secundárias",
    "fullTitle": "Cefaleias Primárias e Secundárias (Neurologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Cefaleias Primárias e Secundárias",
    "subfocos": [
      "Cefaleias Primárias: Enxaqueca, Tensional e Cefaleia em Salvas",
      "Sinais de Alarme (Red Flags) e Cefaleia Secundária (Hemorragia Subaracnóidea)"
    ],
    "provenanceDefault": "Academia Brasileira de Neurologia (ABN) 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Migrânea / Enxaqueca",
        "value": "Unilateral, Pulsátil, Moderada a Grave, Piora com Atividade, Foto/Fonofobia e Náuseas (Tratamento Agudo com Triptanos)"
      },
      {
        "letter": "B",
        "label": "Cefaleia em Salvas",
        "value": "Dor Periorbital Unilateral Excruciante em Homens, Acompanhada de Sinais Autonômicos (Lacrimejamento e Rinorreia, Tratada com O2 a 100%)"
      },
      {
        "letter": "C",
        "label": "Sinais de Alarme (Mnemônico SNOOP",
        "value": "Sintomas Sistêmicos, Déficit Neurológico, Início Súbito 'Em Trovoada' e Mudança de Padrão)"
      },
      {
        "letter": "D",
        "label": "Hemorragia Subaracnóidea por Ruptura de Aneurisma Sacular",
        "value": "Cefaleia em Trovoada Hiperaguda, Rigidez de Nuca e TC de Crânio Imediata"
      }
    ],
    "rule": "Diretriz oficial de Neurologia (Academia Brasileira de Neurologia (ABN) 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Migrânea / Enxaqueca) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Cefaleias Primárias e Secundárias e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-61-sindromes-demenciais-e-do",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Síndromes Demenciais e Doença de Alzheimer",
    "fullTitle": "Síndromes Demenciais e Doença de Alzheimer (Neurologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Síndromes Demenciais e Doença de Alzheimer",
    "subfocos": [
      "Doença de Alzheimer: Fisiopatologia, Perda de Memória Recente e Farmacoterapia",
      "Diagnóstico Diferencial: Demência Vascular, Corpos de Lewy e Frontotemporal"
    ],
    "provenanceDefault": "Academia Brasileira de Neurologia (ABN) 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Doença de Alzheimer: Fisiopatologia, Perda de Memória Recente e Farmacoterapia",
        "value": "Déficit Amnéstico Precoce da Memória Episódica Recente com Preservação da Memória Remota e Deposição de Placas Beta-Amiloides e Emaranhados Tau"
      },
      {
        "letter": "B",
        "label": "Tratamento com Inibidores da Acetilcolinesterase",
        "value": "Donepezila, Rivastigmina, Galantamina) e Antagonista NMDA (Memantina nas Fases Moderadas a Graves"
      },
      {
        "letter": "C",
        "label": "Demência com Corpos de Lewy",
        "value": "Flutuação Cognitiva Cognitiva Precoce, Alucinações Visuais Vívidas e Parkinsonismo Espontâneo"
      },
      {
        "letter": "D",
        "label": "Demência Vascular",
        "value": "Evolução em Degraus associada a Doença Cerebrovascular"
      }
    ],
    "rule": "Diretriz oficial de Neurologia (Academia Brasileira de Neurologia (ABN) 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Doença de Alzheimer: Fisiopatologia, Perda de Memória Recente e Farmacoterapia) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Síndromes Demenciais e Doença de Alzheimer e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-62-doencas-desmielinizantes",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doenças Desmielinizantes",
    "fullTitle": "Doenças Desmielinizantes (Neurologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Doenças Desmielinizantes (Esclerose Múltipla)",
    "subfocos": [
      "Esclerose Múltipla: Fisiopatologia, Disseminação no Tempo e Espaço (Critérios de McDonald)",
      "Tratamento do Surto Agudo (Pulsoterapia) e Terapias Modificadoras de Doença"
    ],
    "provenanceDefault": "Academia Brasileira de Neurologia (ABN) 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Manifestações Típicas em Mulheres Jovens",
        "value": "Neurite Óptica Unilateral Dolorosa, Mielite Transversa e Síndrome de Fadiga"
      },
      {
        "letter": "B",
        "label": "Ressonância Magnética com Lesões Desmielinizantes Periventriculares",
        "value": "'Dedos de Dawson'"
      },
      {
        "letter": "C",
        "label": "Tratamento do Surto Neurológico Agudo com Metilprednisolona Intravenosa em Altas Doses",
        "value": "1g/dia por 3 a 5 dias"
      },
      {
        "letter": "D",
        "label": "Terapias de Manutenção Modificadoras da Doença",
        "value": "Interferon-beta, Acetato de Glatirâmer, Natalizumabe e Ocrelizumabe"
      }
    ],
    "rule": "Diretriz oficial de Neurologia (Academia Brasileira de Neurologia (ABN) 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Manifestações Típicas em Mulheres Jovens) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Desmielinizantes e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-63-doencas-neuromusculares-e",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doenças Neuromusculares e Polineuropatias",
    "fullTitle": "Doenças Neuromusculares e Polineuropatias (Neurologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Doenças Neuromusculares e Polineuropatias (Guillain-Barré, Miastenia Gravis)",
    "subfocos": [
      "Síndrome de Guillain-Barré (Polirradiculoneuropatia Inflamatória Desmielinizante Aguda)",
      "Miastenia Gravis: Fisiopatologia Autoimune da Placa Motora e Crise Miastênica"
    ],
    "provenanceDefault": "Academia Brasileira de Neurologia (ABN) 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Clínico",
        "value": "Paralisia Flácida Ascendente, Simétrica e Arreflexia com Início após Infecção Prévia (Campylobacter jejuni)"
      },
      {
        "letter": "B",
        "label": "Dissociação Proteíno-Citológica no Líquor",
        "value": "Proteína Elevada sem Elevação de Celularidade"
      },
      {
        "letter": "C",
        "label": "Fatigabilidade Muscular Flutuante com Piora ao Final do Dia",
        "value": "Ptose Palpebral, Diplopia, Disartria) e Anticorpos Anti- Receptor de Acetilcolina (Anti-AChR"
      },
      {
        "letter": "D",
        "label": "Tratamento com Piridostigmina",
        "value": "Inibidor da Acetilcolinesterase"
      }
    ],
    "rule": "Diretriz oficial de Neurologia (Academia Brasileira de Neurologia (ABN) 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Quadro Clínico) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Neuromusculares e Polineuropatias e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-64-doenca-de-parkinson-e-dis",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doença de Parkinson e Distúrbios do Movimento",
    "fullTitle": "Doença de Parkinson e Distúrbios do Movimento (Neurologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Doença de Parkinson e Distúrbios do Movimento",
    "subfocos": [
      "Tétrade Motora Canônica do Parkinsonismo e Diagnóstico Clínico",
      "Tratamento com Levodopa/Carbidopa e Diagnóstico Diferencial de Parkinsonismo Secundário"
    ],
    "provenanceDefault": "Academia Brasileira de Neurologia (ABN) 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Clínico",
        "value": "Tremor de Repouso Unilateral ('Contar Moedas'), Rigidez em 'Roda Dentada', Bradicinesia Obrigatória e Instabilidade Postural Tardia"
      },
      {
        "letter": "B",
        "label": "Tétrade Motora Canônica do Parkinsonismo e Diagnóstico Clínico",
        "value": "Assimetria dos Sintomas Motores no Início e Excelente Resposta Terapêutica ao Teste com Levodopa Confirmando o Diagnóstico"
      },
      {
        "letter": "C",
        "label": "Uso da Levodopa associada a Inibidor da Dopa-Descarboxilase e Complicações Motoras Tardias",
        "value": "Flutuações 'On-Off' e Discinesias"
      },
      {
        "letter": "D",
        "label": "Parkinsonismo Medicamentoso Induzido por Antagonistas Dopaminérgicos (Antipsicóticos, Metoclopramida, Flunarizina",
        "value": "Quadro Bilateral e Simétrico)"
      }
    ],
    "rule": "Diretriz oficial de Neurologia (Academia Brasileira de Neurologia (ABN) 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Quadro Clínico) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doença de Parkinson e Distúrbios do Movimento e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-65-dermatoses-inflamatorias",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Dermatoses Inflamatórias e Eritêmato-Descamativas",
    "fullTitle": "Dermatoses Inflamatórias e Eritêmato-Descamativas (Dermatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Dermatoses Inflamatórias e Eritêmato-Descamativas (Psoríase, Dermatite Atópica)",
    "subfocos": [
      "Psoríase Vulgar: Fisiopatologia, Quadro Clínico e Fenômeno de Koebner",
      "Dermatite Atópica e Dermatite de Contato (Alérgica vs Irritativa)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Placas Eritematodescamativas Bem Delimitadas com Escamas Prateadas em Áreas de Extensão",
        "value": "Cotovelos, Joelhos e Couro Cabeludo"
      },
      {
        "letter": "B",
        "label": "Semiologia Dermatológica Típica",
        "value": "Curetagem de Brocq (Sinal da Vela e Orvalho Sanguinante de Auspitz) e Fenômeno de Koebner"
      },
      {
        "letter": "C",
        "label": "Dermatite Atópica",
        "value": "Prurido Intenso, Pele Seca e Lesões Eczematosas em Áreas Flexurais (Fossas Antecubitais e Poplíteas) associadas a Asma e Rinite"
      },
      {
        "letter": "D",
        "label": "Dermatite de Contato por Irritante Primário",
        "value": "Dano Direto, Todos Indivíduos) vs Alérgica por Hipersensibilidade Tipo IV (Níquel, Teste de Contato Positivo"
      }
    ],
    "rule": "Diretriz oficial de Dermatologia (Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Placas Eritematodescamativas Bem Delimitadas com Escamas Prateadas em Áreas de Extensão) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Dermatoses Inflamatórias e Eritêmato-Descamativas e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/psoriase_dermato.webp",
    "imageCaption": "Exame dermatológico: placas eritemato-descamativas bem delimitadas com escamas prateadas micáceas e sinal do orvalho sangrante (Auspitz).",
    "imageModality": "dermato",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Albanesi C, Madonna S, Gisondi P and Girolomoni G",
    "imageLicense": "CC BY 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Aberrant_interplay_of_keratinocytes_and_immune_cells_in_psoriasis.jpg"
  },
  {
    "id": "tip-clin-66-erupcoes-medicamentosas-g",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Erupções Medicamentosas Graves",
    "fullTitle": "Erupções Medicamentosas Graves (Dermatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Erupções Medicamentosas Graves (DRESS, Stevens-Johnson, NET)",
    "subfocos": [
      "Síndrome DRESS (Drug Reaction with Eosinophilia and Systemic Symptoms)",
      "Síndrome de Stevens-Johnson (SSJ) e Necrólise Epidérmica Tóxica (NET)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Início Tardio",
        "value": "2 a 8 Semanas após Fármacos como Anticonvulsivantes e Alopurinol"
      },
      {
        "letter": "B",
        "label": "Comprometimento de Órgão-Alvo",
        "value": "Hepatite Aguda, Nefrite"
      },
      {
        "letter": "C",
        "label": "Destacamento Epidérmico Agudo Necrótico com Sinal de Nikolsky Positivo e Acometimento Severo de Múltiplas Mucosas",
        "value": "Oral, Ocular, Genital"
      },
      {
        "letter": "D",
        "label": "Diferenciação por Área de Superfície Corporal Descolada",
        "value": "SSJ (< 10%), Superposição SSJ/NET (10-30%) e NET (> 30%) com Tratamento em Centro de Queimados"
      }
    ],
    "rule": "Diretriz oficial de Dermatologia (Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Início Tardio) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Erupções Medicamentosas Graves e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-67-doencas-bolhosas-autoimun",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Doenças Bolhosas Autoimunes",
    "fullTitle": "Doenças Bolhosas Autoimunes (Dermatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Doenças Bolhosas Autoimunes (Pênfigos e Penfigoide)",
    "subfocos": [
      "Pênfigo Vulgar vs Pênfigo Foliáceo",
      "Penfigoide Bolhoso: Fisiopatologia e Quadro Clínico em Idosos"
    ],
    "provenanceDefault": "Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Pênfigo Vulgar",
        "value": "Autoanticorpos Anti-Desmogleína 3, Bolhas Flácidas Intraepidérmicas Suprabasais que se Rompem Facilmente, Sinal de Nikolsky Positivo e Envolvimento Mucoso Oral Extenso"
      },
      {
        "letter": "B",
        "label": "Pênfigo Foliáceo ('Fogo Selvagem')",
        "value": "Anticorpos Anti-Desmogleína 1, Bolhas Subcórneas Superficiais com Crostas e Poupação Mandatória de Mucosas"
      },
      {
        "letter": "C",
        "label": "Autoanticorpos contra a Zona da Membrana Basal",
        "value": "Anti-BP180 e Anti-BP230"
      },
      {
        "letter": "D",
        "label": "Penfigoide Bolhoso: Fisiopatologia e Quadro Clínico em Idosos",
        "value": "Acometimento Predominante em Idosos com Sinal de Nikolsky Negativo e Resposta Favorável a Corticosteroides Sistêmicos"
      }
    ],
    "rule": "Diretriz oficial de Dermatologia (Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Pênfigo Vulgar) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Bolhosas Autoimunes e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-68-infeccoes-cutaneas-bacter",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Infecções Cutâneas Bacterianas, Fúngicas e Virais",
    "fullTitle": "Infecções Cutâneas Bacterianas, Fúngicas e Virais (Dermatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Infecções Cutâneas Bacterianas, Fúngicas e Virais",
    "subfocos": [
      "Infecções Bacterianas Cutâneas: Erisipela, Celulite e Fasciíte Necrosante",
      "Micoses Superficiais (Dermatofitoses) e Infecções Virais (Herpes-Zóster)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Erisipela (Estrepto do Grupo A",
        "value": "Superficial, Bordas Nítidas, Bem Delimitadas e Dor Aguda) vs Celulite (Estafilo/Estrepto: Mais Profunda e Bordas Indistintas)"
      },
      {
        "letter": "B",
        "label": "Fasciíte Necrosante",
        "value": "Emergência Cirúrgica Ameaçadora com Dor Desproporcional aos Achados Físicos, Crepitação e Rápida Progressão com Bolhas Hemorrágicas"
      },
      {
        "letter": "C",
        "label": "Tinea Corporis, Cruris e Pedis",
        "value": "Lesões Anulares com Bordas Eritematosas Elevadas e Centro Mais Claro (Exame Micológico Direto com Hifas Hialinas)"
      },
      {
        "letter": "D",
        "label": "Herpes-Zóster",
        "value": "Reativação do Vírus Varicela-Zóster em Dermátomo Unilateral com Vesículas Agrupadas em Base Eritematosa e Neuralgia Pós-Herpética"
      }
    ],
    "rule": "Diretriz oficial de Dermatologia (Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Erisipela (Estrepto do Grupo A) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Infecções Cutâneas Bacterianas, Fúngicas e Virais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-69-hanseniase-e-manifestacoe",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Hanseníase e Manifestações Cutâneas",
    "fullTitle": "Hanseníase e Manifestações Cutâneas (Dermatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Hanseníase e Manifestações Cutâneas",
    "subfocos": [
      "Classificação de Ridley-Jopling e Formas Operacionais (Paucibacilar vs Multibacilar)",
      "Poliquimioterapia Única (PQT-U) e Estados Reacionais Hansênicos"
    ],
    "provenanceDefault": "Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Diagnósticos Clínicos",
        "value": "Lesão Cutânea com Alteração Térmica, Dolorosa e Tátil associada a Espessamento de Nervos Periféricos"
      },
      {
        "letter": "B",
        "label": "Classificação Operacional da OMS",
        "value": "Paucibacilar (Até 5 lesões de pele: Formas Indeterminada e Tuberculoide) vs Multibacilar (Mais de 5 lesões: Virchowiana e Dimorfa)"
      },
      {
        "letter": "C",
        "label": "Esquema Terapêutico Padrão PQT-U",
        "value": "Rifampicina, Dapsona e Clofazimina) por 6 Meses (PB) ou 12 Meses (MB"
      },
      {
        "letter": "D",
        "label": "Reações Hansênicas",
        "value": "Reação Tipo 1 (Reversa: Neurite Aguda tratada com Prednisona) vs Reação Tipo 2 (Eritema Nodoso Hansênico tratado com Talidomida)"
      }
    ],
    "rule": "Diretriz oficial de Dermatologia (Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios Diagnósticos Clínicos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hanseníase e Manifestações Cutâneas e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/hanseniase_dermato.webp",
    "imageCaption": "Exame dermatológico: mancha hipocrômica com alteração precoce da sensibilidade térmica e dolorosa, típica de Hanseníase.",
    "imageModality": "dermato",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "US Department of Health and Human Services",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Leprosy_thigh_demarcated_cutaneous_lesions.jpg"
  },
  {
    "id": "tip-clin-70-cancer-de-pele-e-lesoes-p",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Câncer de Pele e Lesões Pré-Malignas no Adulto",
    "fullTitle": "Câncer de Pele e Lesões Pré-Malignas no Adulto (Dermatologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Câncer de Pele e Lesões Pré-Malignas no Adulto",
    "subfocos": [
      "Carcinomas Cutâneos (CBC e CEC) e Ceratose Actínica na Prática Clínica",
      "Melanoma Cutâneo: Reconhecimento Precoce e Triagem Dermatológica"
    ],
    "provenanceDefault": "Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Identificação Clínica de Ceratoses Actínicas",
        "value": "Placas Ásperas Eritematosas Hiperceratóticas em Áreas Expostas ao Sol tratadas com Crioterapia ou Fluorouracil"
      },
      {
        "letter": "B",
        "label": "Carcinomas Cutâneos (CBC e CEC) e Ceratose Actínica na Prática Clínica",
        "value": "Suspeição Clínica de Carcinoma Basocelular e Espinocelular e Encaminhamento com Biópsia Confirmatória"
      },
      {
        "letter": "C",
        "label": "Aplicação da Regra do ABCDE no Exame Físico de Rotina e Identificação do 'Sinal do Patinho Feio'",
        "value": "Lesão Pigmentada Doadora Distinta das Demais"
      },
      {
        "letter": "D",
        "label": "Melanoma Cutâneo: Reconhecimento Precoce e Triagem Dermatológica",
        "value": "Indicação Precisa de Biópsia Excisional em Lesões Pigmentadas Suspeitas e Avaliação de Linfonodos Regionais"
      }
    ],
    "rule": "Diretriz oficial de Dermatologia (Sociedade Brasileira de Dermatologia (SBD) / PCDT Hanseníase): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Identificação Clínica de Ceratoses Actínicas) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Câncer de Pele e Lesões Pré-Malignas no Adulto e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/melanoma_isic.webp",
    "imageCaption": "Dermatoscopia digital: lesão melanocítica assimétrica, bordas irregulares, pigmentação policromática e rede pigmentar atípica (Melanoma cutâneo).",
    "imageModality": "dermato",
    "imageSource": "ISIC Archive (International Skin Imaging Collaboration)",
    "imageAuthor": "ISIC Archive / Contribuidores Clínicos",
    "imageLicense": "CC0 (Domínio Público)",
    "imageOriginUrl": "https://www.isic-archive.com/image/ISIC_0000000"
  },
  {
    "id": "tip-clin-71-anafilaxia-e-reacoes-aler",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Anafilaxia e Reações Alérgicas Graves",
    "fullTitle": "Anafilaxia e Reações Alérgicas Graves (Alergia e Imunologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Alergia e Imunologia",
    "foco": "Anafilaxia e Reações Alérgicas Graves",
    "subfocos": [
      "Critérios Clínicos de Diagnóstico Imediato da Anafilaxia",
      "Protocolo de Emergência: Adrenalina Intramuscular Precoce e Manejo"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Início Agudo",
        "value": "Minutos a Horas) envolvendo Pele/Mucosas (Urticária, Angioedema"
      },
      {
        "letter": "B",
        "label": "Principais Gatilhos",
        "value": "Alimentos (Amendoim, Frutos do Mar), Medicamentos (Beta-lactâmicos, AINEs) e Venenos de Insetos Himenópteros"
      },
      {
        "letter": "C",
        "label": "Medicamento de 1ª Linha Absoluto e Mandatório",
        "value": "Adrenalina Aquosa (1:1.000) por Via Intramuscular na Face Anterolateral da Coxa (0,3 a 0,5 mg no Adulto)"
      },
      {
        "letter": "D",
        "label": "Protocolo de Emergência: Adrenalina Intramuscular Precoce e Manejo",
        "value": "Posicionamento em Decúbito Dorsal com Elevação de Membros, Oxigenoterapia, Expansão com Cristaloide e Corticoide/Anti-histamínico apenas como Coadjuvantes Tardios"
      }
    ],
    "rule": "Diretriz oficial de Alergia e Imunologia (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Início Agudo) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Anafilaxia e Reações Alérgicas Graves e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-72-urticaria-e-angioedema",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Urticária e Angioedema",
    "fullTitle": "Urticária e Angioedema (Alergia e Imunologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Alergia e Imunologia",
    "foco": "Urticária e Angioedema (Hereditário e Adquirido)",
    "subfocos": [
      "Urticária Aguda vs Crônica e Terapia com Anti-Histamínicos H1",
      "Angioedema Hereditário Mediado por Bradicinina"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Definição Temporal",
        "value": "Urticária Aguda (< 6 semanas) vs Urticária Crônica Espontânea (>= 6 semanas com Lesões Fugazes e Pruriginosas que Duram < 24h sem Deixar Marcas)"
      },
      {
        "letter": "B",
        "label": "Tratamento Escalonado de 1ª Linha",
        "value": "Anti-histamínicos H1 de 2ª Geração Não-Sedantes (Cetirizina, Fexofenadina) com Possibilidade de Aumento da Dose em até 4 Vezes"
      },
      {
        "letter": "C",
        "label": "Fisiopatologia",
        "value": "Deficiência Quantitativa ou Funcional do Inibidor de C1-Esterase (C1-INH) com Edema Subcutâneo/Mucoso Não-Pruriginoso e sem Urticária Concomitante"
      },
      {
        "letter": "D",
        "label": "Risco de Edema de Glote e Refratariedade a Adrenalina e Corticoides; Tratamento Específico com Concentrado de C1-INH ou Antagonista do Receptor B2 de Bradicinina",
        "value": "Icatibanto"
      }
    ],
    "rule": "Diretriz oficial de Alergia e Imunologia (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Definição Temporal) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Urticária e Angioedema e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-73-rinite-alergica-e-alergia",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Rinite Alérgica e Alergias Alimentares/Medicamentosas",
    "fullTitle": "Rinite Alérgica e Alergias Alimentares/Medicamentosas (Alergia e Imunologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Alergia e Imunologia",
    "foco": "Rinite Alérgica e Alergias Alimentares/Medicamentosas",
    "subfocos": [
      "Rinite Alérgica: Classificação ARIA e Corticoterapia Nasal",
      "Reações Adversas a Fármacos: Reações Alérgicas Tipo I (IgE) vs Reações Pseudoalérgicas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação ARIA",
        "value": "Intermitente vs Persistente; Leve vs Moderada-Grave"
      },
      {
        "letter": "B",
        "label": "Reações Adversas a Fármacos: Reações Alérgicas Tipo I (IgE) vs Reações Pseudoalérgicas",
        "value": "Reações Mediadas por IgE a Antibióticos Beta-Lactâmicos e Papel dos Testes Cutâneos e Dessensibilização"
      },
      {
        "letter": "C",
        "label": "Reações de Hipersensibilidade a AINEs Mediadas por Inibição da COX-1 e Desvio para Via dos Leucotrienos",
        "value": "Tríade de Samter / Doença Respiratória Exacerbada por AAS"
      }
    ],
    "rule": "Diretriz oficial de Alergia e Imunologia (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação ARIA) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Rinite Alérgica e Alergias Alimentares/Medicamentosas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-74-imunodeficiencias-primari",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Imunodeficiências Primárias e Secundárias no Adulto",
    "fullTitle": "Imunodeficiências Primárias e Secundárias no Adulto (Alergia e Imunologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Alergia e Imunologia",
    "foco": "Imunodeficiências Primárias e Secundárias no Adulto",
    "subfocos": [
      "Imunodeficiência Comum Variável (IDCV) no Adulto",
      "Imunodeficiências Secundárias a Fármacos Imunossupressores e Doenças Sistêmicas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Imunodeficiência Primária Sintomática Mais Frequente no Adulto",
        "value": "Infecções Sinopulmonares de Repetição por Bactérias Encapsuladas e Bronquiectasias"
      },
      {
        "letter": "B",
        "label": "Achado Laboratorial Típico",
        "value": "Hipogamaglobulinemia Marcada (Redução Significativa de IgG associada a IgA ou IgM) e Tratamento com Imunoglobulina Humana de Reposição"
      },
      {
        "letter": "C",
        "label": "Imunodeficiências Secundárias a Fármacos Imunossupressores e Doenças Sistêmicas",
        "value": "Imunossupressão Iatrogênica por Corticoterapia Prolongada, Agentes Biológicos Anti-TNF e Inibidores de Checkpoint Imunológico"
      },
      {
        "letter": "D",
        "label": "Risco Aumentado de Reativação de Infecções Latentes",
        "value": "Tuberculose, Hepatite B, Estrongiloidíase"
      }
    ],
    "rule": "Diretriz oficial de Alergia e Imunologia (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Imunodeficiência Primária Sintomática Mais Frequente no Adulto) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Imunodeficiências Primárias e Secundárias no Adulto e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-75-principios-de-oncogenese",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Princípios de Oncogênese, Estadiamento e Biópsia",
    "fullTitle": "Princípios de Oncogênese, Estadiamento e Biópsia (Oncologia Clínica • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Oncologia Clínica",
    "foco": "Princípios de Oncogênese, Estadiamento e Biópsia",
    "subfocos": [
      "Bases Biológicas do Câncer e Avaliação do Performance Status (ECOG / Karnofsky)",
      "Princípios do Sistema TNM e Importância da Confirmação Histopatológica"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hallmarks do Câncer",
        "value": "Sustentação de Sinal Proliferativo, Evasão de Supressores, Resistência à Apoptose, Angiogênese e Metástase"
      },
      {
        "letter": "B",
        "label": "Escalas de Funcionalidade Clínica",
        "value": "ECOG (0: Atividade Plena a 4: Confinado ao Leito) como Determinante Crítico de Elegibilidade Quimioterápica"
      },
      {
        "letter": "C",
        "label": "Sistema de Estadiamento TNM",
        "value": "Tamanho do Tumor Primário, Linfonodos Regionais e Metástase a Distância"
      },
      {
        "letter": "D",
        "label": "Princípios do Sistema TNM e Importância da Confirmação Histopatológica",
        "value": "Obrigatoriedade de Biópsia Tecidual com Análise Imuno-histoquímica antes de Qualquer Intervenção Sistêmica Neoplásica"
      }
    ],
    "rule": "Diretrizes SBC / AHA: O supradesnivelamento do segmento ST em ≥ 2 derivações contíguas define IAM com supra (IAMCSST); tempo porta-balão alvo < 90 min (ou porta-agulha < 30 min se trombólise).",
    "bancaTrap": "Em IAM de parede inferior (DII, DIII, aVF), é mandatório rodar as derivações direitas (V3R e V4R); se houver acometimento de ventrículo direito, nitratos e betabloqueadores são formalmente contraindicados."
  },
  {
    "id": "tip-clin-76-emergencias-oncologicas",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Emergências Oncológicas",
    "fullTitle": "Emergências Oncológicas (Oncologia Clínica • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Oncologia Clínica",
    "foco": "Emergências Oncológicas (Síndrome de Lise Tumoral, Neutropenia Febril, Hipercalcemia)",
    "subfocos": [
      "Síndrome de Lise Tumoral (SLT): Fisiopatologia, Critérios de Cairo-Bishop e Rasburicase",
      "Neutropenia Febril e Compressão Medular Maligna"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Alterações Laboratoriais Típicas por Destruição Celular Maciça",
        "value": "Hiperuricemia, Hipercalemia, Hiperfosfatemia e Hipocalcemia Secundária"
      },
      {
        "letter": "B",
        "label": "Prevenção e Tratamento",
        "value": "Hiper-hidratação Venosa Vigorosa associada a Hipouricemiantes (Alopurinol) ou Rasburicase (Urato Oxidase Recombinante)"
      },
      {
        "letter": "C",
        "label": "Neutropenia Febril (Neutrófilos Totais < 500/mm3 associados a Temperatura >= 38,3°C)",
        "value": "Emergência com Início Imediato de Cefepime EV em até 1 Hora"
      },
      {
        "letter": "D",
        "label": "Compressão Medular Neoplásica",
        "value": "Dor Dorsal/Lombar com Déficit Motor e Disfunção Esfincteriana (RNM de Coluna Total e Dexametasona em Altas Doses)"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-clin-77-toxicidades-de-quimiotera",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo",
    "fullTitle": "Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo (Oncologia Clínica • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Oncologia Clínica",
    "foco": "Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo",
    "subfocos": [
      "Toxicidades Clássicas de Quimioterápicos Citotóxicos",
      "Eventos Adversos Imunomediados por Inibidores de Checkpoint (Anti-PD-1, Anti-CTLA-4)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Cardiotoxicidade por Antraciclinas",
        "value": "Doxorrubicina com Disfunção Ventricular Cumulativa) e Nefrotoxicidade/Ototoxicidade por Platinas (Cisplatina"
      },
      {
        "letter": "B",
        "label": "Toxicidades Clássicas de Quimioterápicos Citotóxicos",
        "value": "Neuropatia Periférica Sensitiva por Taxanos e Oxaliplatina e Alopecia Induzida por Quimioterapia"
      },
      {
        "letter": "C",
        "label": "Toxicidades Autoimunes Induzidas por Pembrolizumabe e Ipilimumabe",
        "value": "Colite Imunomediada, Hipofisite, Pneumonite e Tiroidite"
      },
      {
        "letter": "D",
        "label": "Eventos Adversos Imunomediados por Inibidores de Checkpoint (Anti-PD-1, Anti-CTLA-4)",
        "value": "Manejo das Toxicidades Imunomediadas Graves com Suspensão do Agente Imunoterápico e Instituição Precoce de Corticoterapia em Altas Doses"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-clin-78-sindromes-paraneoplasicas",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Síndromes Paraneoplásicas",
    "fullTitle": "Síndromes Paraneoplásicas (Oncologia Clínica • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Oncologia Clínica",
    "foco": "Síndromes Paraneoplásicas",
    "subfocos": [
      "Síndromes Paraneoplásicas Endócrinas (SIADH, Cushing Ectópico, Hipercalcemia)",
      "Síndromes Paraneoplásicas Neurológicas e Hematológicas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "SIADH Paraneoplásica associada ao Carcinoma Pulmonar de Pequenas Células",
        "value": "Oat-Cell"
      },
      {
        "letter": "B",
        "label": "Síndromes Paraneoplásicas Endócrinas (SIADH, Cushing Ectópico, Hipercalcemia)",
        "value": "Síndrome de Cushing Ectópica por Secreção de ACTH por Tumores Neuroendócrinos Pulmonares com Alcalose Metabólica e Hiperpigmentação"
      },
      {
        "letter": "C",
        "label": "Síndrome Miastênica de Lambert-Eaton",
        "value": "Anticorpos contra Canais de Cálcio Voltagem-Dependentes, Melhora com Repetição do Movimento, Pequenas Células de Pulmão"
      },
      {
        "letter": "D",
        "label": "Encefalite Límbica Paraneoplásica e Tromboflebite Migratória",
        "value": "Sinal de Trousseau associado ao Adenocarcinoma de Pâncreas"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-clin-79-choque-circulatorio-e-mon",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Choque Circulatório e Monitorização Hemodinâmica",
    "fullTitle": "Choque Circulatório e Monitorização Hemodinâmica (Medicina de Emergência • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Choque Circulatório e Monitorização Hemodinâmica",
    "subfocos": [
      "Diferenciação Hemodinâmica dos 4 Tipos de Choque (Distributivo, Cardiogênico, Hipovolêmico, Obstrutivo)",
      "Uso de Drogas Vasoativas, Inotrópicos e Ressuscitação Guiada por Metas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Choque Distributivo (Séptico/Anafilático)",
        "value": "RVP Baixa, Débito Cardíaco Elevado na Fase Inicial e Saturação Venosa Central (SvcO2) Normal ou Elevada"
      },
      {
        "letter": "B",
        "label": "Choque Cardiogênico e Hipovolêmico",
        "value": "RVP Elevada Compensatória com Baixo Débito Cardíaco) vs Obstrutivo (Tamponamento, TEP Maciço, Pneumotórax Hipertensivo"
      },
      {
        "letter": "C",
        "label": "Vasopressor de 1ª Escolha Universal",
        "value": "Noradrenalina Titulada para Alvo de PAM >= 65 mmHg associada precocemente a Vasopressina"
      },
      {
        "letter": "D",
        "label": "Inotrópico de Escolha na Disfunção Miocárdica",
        "value": "Dobutamina associada a Alvos de Clearance de Lactato e Tempo de Enchimento Capilar"
      }
    ],
    "rule": "Diretriz oficial de Medicina de Emergência (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Choque Distributivo (Séptico/Anafilático)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Choque Circulatório e Monitorização Hemodinâmica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-80-insuficiencia-respiratori",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Insuficiência Respiratória Aguda e Ventilação Mecânica",
    "fullTitle": "Insuficiência Respiratória Aguda e Ventilação Mecânica (Medicina de Emergência • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Insuficiência Respiratória Aguda e Ventilação Mecânica",
    "subfocos": [
      "Insuficiência Respiratória Tipo 1 (Hipoxêmica) vs Tipo 2 (Hipercápnica)",
      "Parâmetros Iniciais da Ventilação Mecânica Protetora na SDRA"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tipo 1 / Hipoxêmica",
        "value": "Distúrbio V/Q e Shunt Intrapulmonar em EAP, Pneumonia e SDRA com Gradiente Alvéolo-Arterial Elevado"
      },
      {
        "letter": "B",
        "label": "Tipo 2 / Hipercápnica",
        "value": "Hipoventilação Alveolar em DPOC Descompensada, Doenças Neuromusculares e Depressão do SNC com pCO2 > 45-50 mmHg"
      },
      {
        "letter": "C",
        "label": "Protocolo ARDSNet",
        "value": "Volume Corrente Baixo (4 a 6 mL/kg de Peso Predito) para Prevenção de Volutrauma e Biotrauma"
      },
      {
        "letter": "D",
        "label": "Limitação de Pressão de Platô <= 30 cmH2O e Pressão de Distensão Alveolar",
        "value": "Driving Pressure <= 15 cmH2O"
      }
    ],
    "rule": "Diretriz oficial de Medicina de Emergência (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tipo 1 / Hipoxêmica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Insuficiência Respiratória Aguda e Ventilação Mecânica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-81-intoxicacoes-exogenas-agu",
    "category": "antidotos",
    "categoryLabel": "Toxicologia & Antídotos",
    "title": "Intoxicações Exógenas Agudas e Síndromes Tóxicas",
    "fullTitle": "Intoxicações Exógenas Agudas e Síndromes Tóxicas (Medicina de Emergência • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Intoxicações Exógenas Agudas e Síndromes Tóxicas",
    "subfocos": [
      "Descontaminação Gastrointestinal e Métodos de Eliminação Acelerada",
      "Reconhecimento das Toxidromes e Antídotos Específicos em Emergência"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Carvão Ativado em Dose Única",
        "value": "1 g/kg até 1-2 Horas da Ingestão Oral) e Contraindicações (Cáusticos, Hidrocarbonetos, Metais"
      },
      {
        "letter": "B",
        "label": "Lavagem Gástrica",
        "value": "Apenas em Ingestões Potencialmente Fatais em até 1 Hora com Via Aérea Protegida"
      },
      {
        "letter": "C",
        "label": "Síndrome Opioide",
        "value": "Depressão Respiratória, Miose Puntiforme e Coma tratada com Naloxona EV Titulada"
      },
      {
        "letter": "D",
        "label": "Síndrome Sedativo-Hipnótica",
        "value": "Flumazenil com Cuidado em Usuários Crônicos de BZD"
      }
    ],
    "rule": "Diretriz oficial de Medicina de Emergência (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Carvão Ativado em Dose Única) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Intoxicações Exógenas Agudas e Síndromes Tóxicas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-82-coma-e-alteracao-aguda-do",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Coma e Alteração Aguda do Nível de Consciência",
    "fullTitle": "Coma e Alteração Aguda do Nível de Consciência (Medicina de Emergência • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Coma e Alteração Aguda do Nível de Consciência (Delirium)",
    "subfocos": [
      "Coma Agudo: Escala de Coma de Glasgow-P e Avaliação de Tronco Encefálico",
      "Delirium no Paciente Grave: Avaliação com CAM-ICU e Manejo"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Aplicação da Escala de Glasgow Atualizada com Reatividade Pupilar (ECG-P",
        "value": "Pontuação de 1 a 15) e Indicação de IOT se Pontuação <= 8"
      },
      {
        "letter": "B",
        "label": "Reflexos de Tronco Encefálico",
        "value": "Fotomotor, Córneo-Palpebral, Oculocefálico ('Olhos de Boneca') e Oculovestibular"
      },
      {
        "letter": "C",
        "label": "Critérios do CAM-ICU",
        "value": "Início Agudo/Flutuante, Inatenção associada a Pensamento Desorganizado ou Nível Alterado de Consciência"
      },
      {
        "letter": "D",
        "label": "Subtipos Hiperativo vs Hipoativo",
        "value": "Mais Comum e de Pior Prognóstico) e Manejo Não-Farmacológico Primário associado a Antipsicóticos (Haloperidol"
      }
    ],
    "rule": "Diretriz oficial de Medicina de Emergência (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Aplicação da Escala de Glasgow Atualizada com Reatividade Pupilar (ECG-P) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Coma e Alteração Aguda do Nível de Consciência e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-83-hipotermia-e-queimaduras",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Hipotermia e Queimaduras no Adulto em UTI",
    "fullTitle": "Hipotermia e Queimaduras no Adulto em UTI (Medicina de Emergência • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Hipotermia e Queimaduras no Adulto em UTI",
    "subfocos": [
      "Hipotermia Acidental Grave no Adulto e Reaquecimento Ativo",
      "Suporte Intensivo ao Grande Queimado Adulto e Complicações Sistêmicas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estadiamento da Hipotermia",
        "value": "Leve (32-35°C), Moderada (28-32°C com Arritmias e Bradicardia) e Grave (< 28°C com Risco de FV)"
      },
      {
        "letter": "B",
        "label": "Eletrocardiograma Típico",
        "value": "Ondas J de Osborn e Técnicas de Reaquecimento Ativo Interno (Fluidos Aquecidos EV, Lavagem Pleural/Peritoneal)"
      },
      {
        "letter": "C",
        "label": "Suporte Intensivo ao Grande Queimado Adulto e Complicações Sistêmicas",
        "value": "Hipermetabolismo Severo no Grande Queimado, Síndrome da Resposta Inflamatória Sistêmica e Nutrição Enteral Precoce"
      },
      {
        "letter": "D",
        "label": "Monitorização do Débito Urinário",
        "value": "Alvo de 0,5 mL/kg/h em Adultos"
      }
    ],
    "rule": "Diretriz oficial de Medicina de Emergência (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Estadiamento da Hipotermia) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hipotermia e Queimaduras no Adulto em UTI e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-84-grandes-sindromes-geriatr",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Grandes Síndromes Geriátricas",
    "fullTitle": "Grandes Síndromes Geriátricas (Geriatria • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Geriatria",
    "foco": "Grandes Síndromes Geriátricas (Instabilidade, Quedas e Fragilidade)",
    "subfocos": [
      "Síndrome da Fragilidade no Idoso: Fenótipo de Fried",
      "Instabilidade Postural, Marcha e Avaliação de Quedas em Idosos"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios do Fenótipo de Fried (>= 3 presentes",
        "value": "Perda de Peso Não-Intencional, Exaustão, Fraqueza na Força de Preensão, Marcha Lenta e Baixa Atividade Física)"
      },
      {
        "letter": "B",
        "label": "Síndrome da Fragilidade no Idoso: Fenótipo de Fried",
        "value": "Fisiopatologia da Sarcopenia e Vulnerabilidade Acentuada a Desfechos Adversos e Hospitalização"
      },
      {
        "letter": "C",
        "label": "Avaliação Funcional da Mobilidade com Teste Timed Up and Go",
        "value": "TUG > 12-14 segundos indica Alto Risco de Quedas"
      },
      {
        "letter": "D",
        "label": "Investigação Multifatorial de Quedas",
        "value": "Hipotensão Postural, Déficits Sensoriais, Fatores Ambientais Domiciliares e Polifarmácia"
      }
    ],
    "rule": "Diretriz oficial de Geriatria (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios do Fenótipo de Fried (>= 3 presentes) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Grandes Síndromes Geriátricas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-85-polifarmacia-e-criterios",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Polifarmácia e Critérios de Beers/STOPP-START",
    "fullTitle": "Polifarmácia e Critérios de Beers/STOPP-START (Geriatria • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Geriatria",
    "foco": "Polifarmácia e Critérios de Beers/STOPP-START",
    "subfocos": [
      "Definição de Polifarmácia e Efeito Cascata Iatrogênico",
      "Critérios de Beers e Ferramenta STOPP/START para Prescrição Segura"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Conceito de Polifarmácia",
        "value": "Uso Concomitante de >= 5 Medicamentos Contínuos) e Farmacocinética do Envelhecimento (Queda de TFG e Aumento de Gordura Corporal"
      },
      {
        "letter": "B",
        "label": "Cascata Iatrogênica",
        "value": "Prescrição de Novo Fármaco para Tratar Efeito Colateral Não Reconhecido de Medicamento Prévio"
      },
      {
        "letter": "C",
        "label": "Medicamentos Potencialmente Inapropriados para Idosos",
        "value": "Benzodiazepínicos de Longa Ação, Anticolinérgicos, AINEs Contínuos e Antipsicóticos"
      },
      {
        "letter": "D",
        "label": "Critérios de Beers e Ferramenta STOPP/START para Prescrição Segura",
        "value": "Desprescrição Estruturada e Aplicação dos Critérios START para Iniciar Terapias com Benefício Comprovado"
      }
    ],
    "rule": "Diretriz oficial de Geriatria (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Conceito de Polifarmácia) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Polifarmácia e Critérios de Beers/STOPP-START e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-86-avaliacao-geriatrica-ampl",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Avaliação Geriátrica Ampla",
    "fullTitle": "Avaliação Geriátrica Ampla (Geriatria • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Geriatria",
    "foco": "Avaliação Geriátrica Ampla (AGA) e Funcionalidade",
    "subfocos": [
      "Instrumentos de Avaliação das Atividades de Vida Diária (AVDs e AIVDs)",
      "Avaliação Cognitiva e Rastreamento de Humor no Idoso (MEEM e GDS)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Atividades Básicas de Vida Diária (ABVD / Índice de Katz",
        "value": "Banho, Vestir-se, Higiene Pessoal, Transferência, Continência e Alimentação)"
      },
      {
        "letter": "B",
        "label": "Atividades Instrumentais de Vida Diária (AIVD / Escala de Lawton",
        "value": "Uso do Telefone, Compras, Preparo de Refeições, Tarefas Domésticas e Gestão de Finanças)"
      },
      {
        "letter": "C",
        "label": "Miniexame do Estado Mental",
        "value": "MEEM / Folstein"
      },
      {
        "letter": "D",
        "label": "Escala de Depressão Geriátrica (GDS-15",
        "value": "Triagem Específica de Sintomas Depressivos no Paciente Idoso)"
      }
    ],
    "rule": "Diretriz oficial de Geriatria (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Atividades Básicas de Vida Diária (ABVD / Índice de Katz) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Avaliação Geriátrica Ampla e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-87-incontinencia-e-imobilida",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Incontinência e Imobilidade no Idoso",
    "fullTitle": "Incontinência e Imobilidade no Idoso (Geriatria • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Geriatria",
    "foco": "Incontinência e Imobilidade no Idoso",
    "subfocos": [
      "Incontinência Urinária no Idoso: Causas Transitórias (Mnemônico DIAPPERS)",
      "Síndrome da Imobilidade e Consequências Sistêmicas do Confinamento ao Leito"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Mnemônico DIAPPERS",
        "value": "Delirium, Infecção Urinária, Atrofia Vaginal, Farmacológica, Psiquiátrica, Excesso de Produção de Urina, Restrição de Mobilidade e Fecaloma"
      },
      {
        "letter": "B",
        "label": "Diferenciação Canônica",
        "value": "Incontinência de Urgência (Bexiga Hiperativa) vs Esforço vs Transbordamento por Retenção Urinária Crônica"
      },
      {
        "letter": "C",
        "label": "Critérios Maiores e Menores da Síndrome de Imobilização Prolongada",
        "value": "Contraturas Articulares, Úlceras por Pressão e Atrofia Muscular"
      },
      {
        "letter": "D",
        "label": "Síndrome da Imobilidade e Consequências Sistêmicas do Confinamento ao Leito",
        "value": "Prevenção Terciária e Reabilitação Motora Multidisciplinar com Fisioterapia Motora Precoce"
      }
    ],
    "rule": "Diretriz oficial de Geriatria (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Mnemônico DIAPPERS) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Incontinência e Imobilidade no Idoso e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-88-principios-e-filosofia-do",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Princípios e Filosofia dos Cuidados Paliativos",
    "fullTitle": "Princípios e Filosofia dos Cuidados Paliativos (Cuidados Paliativos • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cuidados Paliativos",
    "foco": "Princípios e Filosofia dos Cuidados Paliativos",
    "subfocos": [
      "Definição da OMS, Indicações Precoces e Ortogásia",
      "Avaliação do Sofrimento Global (Dor Total de Cicely Saunders)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Conceito Canônico de Cuidados Paliativos",
        "value": "Abordagem que Aprimora a Qualidade de Vida de Pacientes e Familiares diante de Doenças Ameaçadoras da Vida"
      },
      {
        "letter": "B",
        "label": "Definição da OMS, Indicações Precoces e Ortogásia",
        "value": "Integração Precoce dos Cuidados Paliativos Concomitante à Terapia Modificadora de Doença desde o Diagnóstico de Doença Crônica Avançada"
      },
      {
        "letter": "C",
        "label": "Conceito de Dor Total",
        "value": "Dimensões Física, Psicológica, Social e Espiritual do Sofrimento Humano"
      },
      {
        "letter": "D",
        "label": "Comunicação de Más Notícias",
        "value": "Protocolo SPIKES (Setting, Perception, Invitation, Knowledge, Empathy, Strategy/Summary)"
      }
    ],
    "rule": "Diretriz oficial de Cuidados Paliativos (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Conceito Canônico de Cuidados Paliativos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Princípios e Filosofia dos Cuidados Paliativos e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-89-manejo-da-dor-cronica-e-e",
    "category": "antidotos",
    "categoryLabel": "Toxicologia & Antídotos",
    "title": "Manejo da Dor Crônica e Escada Analgésica da OMS",
    "fullTitle": "Manejo da Dor Crônica e Escada Analgésica da OMS (Cuidados Paliativos • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cuidados Paliativos",
    "foco": "Manejo da Dor Crônica e Escada Analgésica da OMS",
    "subfocos": [
      "Escada Analgésica da OMS para Dor Oncológica e Não-Oncológica",
      "Conversão de Opioides, Manejo de Efeitos Colaterais e Dor Incidental"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Degraus Canônicos",
        "value": "Degrau 1 (Não-Opioides: Dipirona/Paracetamol +/- Adjuvante); Degrau 2 (Opioides Fracos: Codeína, Tramadol); Degrau 3 (Opioides Fortes: Morfina, Metadona, Fentanil)"
      },
      {
        "letter": "B",
        "label": "Princípios Fundamentais",
        "value": "Administração 'Pelo Relógio' (Horário Fixo, Não se Dor), Pela Boca (Via Oral Preferencial) e Individualizada"
      },
      {
        "letter": "C",
        "label": "Cálculo de Doses de Resgate para Dor Irruptiva",
        "value": "10 a 1/6 da Dose Total Diária de Morfina Oral em Tomadas Extras"
      },
      {
        "letter": "D",
        "label": "Manejo Obrigatório da Constipação Induzida por Opioides com Laxativos Estimulantes",
        "value": "Bisacodil, Senne"
      }
    ],
    "rule": "Diretriz oficial de Cuidados Paliativos (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Degraus Canônicos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Manejo da Dor Crônica e Escada Analgésica da OMS e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-90-controle-de-sintomas-nao",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Controle de Sintomas Não-Dor",
    "fullTitle": "Controle de Sintomas Não-Dor (Cuidados Paliativos • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cuidados Paliativos",
    "foco": "Controle de Sintomas Não-Dor (Dispneia, Náusea, Estertor, Agitação)",
    "subfocos": [
      "Dispneia Refratária em Cuidados Paliativos e Uso de Opioides",
      "Manejo de Sintomas Digestivos e Neuropsiquiátricos (Estertor Agônico)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Medidas Não-Farmacológicas Eficazes",
        "value": "Posicionamento Elevado, Ventilação Facial Direta com Ventilador Portátil e Janela Aberta"
      },
      {
        "letter": "B",
        "label": "Estertor do Fim de Vida ('Respiração Ruidosa')",
        "value": "Esclarecimento à Família e Terapia com Anticolinérgicos (Butilescopolamina SC)"
      },
      {
        "letter": "C",
        "label": "Náuseas e Vômitos Intratáveis",
        "value": "Diferenciação entre Causas Centrais (Haloperidol), Gastroparesia (Metoclopramida) e Hipertensão Intracraniana (Dexametasona)"
      }
    ],
    "rule": "Diretriz oficial de Cuidados Paliativos (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Medidas Não-Farmacológicas Eficazes) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Controle de Sintomas Não-Dor e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-91-sedacao-paliativa-e-comun",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Sedação Paliativa e Comunicação em Fim de Vida",
    "fullTitle": "Sedação Paliativa e Comunicação em Fim de Vida (Cuidados Paliativos • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cuidados Paliativos",
    "foco": "Sedação Paliativa e Comunicação em Fim de Vida",
    "subfocos": [
      "Critérios Éticos e Indicações Formais de Sedação Paliativa",
      "Protocolos Farmacológicos de Sedação com Midazolam e Cuidados com a Família"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Indicação Estrita",
        "value": "Presença de Sintoma Refratário Insuportável (Dispneia Asfixiante, Delirium Hiperativo Grave, Dor Incontrolável) no Paciente em Fase Terminal"
      },
      {
        "letter": "B",
        "label": "Distinção Ética e Legal Absoluta entre Sedação Paliativa",
        "value": "Objetivo de Alívio do Sofrimento) e Eutanásia (Objetivo de Provocar a Morte"
      },
      {
        "letter": "C",
        "label": "Fármaco de Escolha Canônico",
        "value": "Midazolam em Infusão Contínua Subcutânea ou Intravenosa Titulado até o Alívio do Sintoma Alvo"
      },
      {
        "letter": "D",
        "label": "Protocolos Farmacológicos de Sedação com Midazolam e Cuidados com a Família",
        "value": "Apoio Psicológico e Espiritual à Família, Acolhimento do Luto Antecipatório e Adequação do Plano de Cuidados"
      }
    ],
    "rule": "Diretriz oficial de Cuidados Paliativos (Sociedade Brasileira de Clínica Médica (SBCM)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Indicação Estrita) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Sedação Paliativa e Comunicação em Fim de Vida e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-92-sindromes-toxicas",
    "category": "antidotos",
    "categoryLabel": "Toxicologia & Antídotos",
    "title": "Síndromes Tóxicas",
    "fullTitle": "Síndromes Tóxicas (Toxicologia Clínica • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Toxicologia Clínica",
    "foco": "Síndromes Tóxicas (Anticolinérgica, Colinérgica, Simpaticomimética, Opioide)",
    "subfocos": [
      "Síndrome Colinérgica e Síndrome Anticolinérgica",
      "Síndrome Simpaticomimética (Cocaína, Anfetaminas) vs Síndrome Serotoninérgica"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Síndrome Colinérgica (Organofosforados/Carbamatos)",
        "value": "Miose, Sialorreia Intensa, Broncorreia, Broncoespasmo, Fasciculações e Bradicardia (Tratamento com Atropina)"
      },
      {
        "letter": "B",
        "label": "Síndrome Anticolinérgica",
        "value": "'Cego como uma Coruja, Louco como um Chapeleiro, Vermelho como uma Beterraba, Seco como um Osso' (Midríase, Pele Seca e Quente, Retenção Urinária)"
      },
      {
        "letter": "C",
        "label": "Simpaticomimética",
        "value": "Midríase, Taquicardia, Hipertensão, Sudorese Profusa e Agitação Psicomotora (Tratamento com Benzodiazepínicos e Contraindicação a Beta-Bloqueadores Puros)"
      },
      {
        "letter": "D",
        "label": "Síndrome Serotoninérgica",
        "value": "Hiper-reflexia Acentuada, Clônus Induzível/Espontâneo, Instabilidade Autonômica e Hipertermia após Antidepressivos"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-clin-93-intoxicacoes-por-medicame",
    "category": "antidotos",
    "categoryLabel": "Toxicologia & Antídotos",
    "title": "Intoxicações por Medicamentos",
    "fullTitle": "Intoxicações por Medicamentos (Toxicologia Clínica • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Toxicologia Clínica",
    "foco": "Intoxicações por Medicamentos (Paracetamol, Benzodiazepínicos, Antidepressivos)",
    "subfocos": [
      "Intoxicação por Paracetamol (Acetaminofeno) e N-Acetilcisteína",
      "Intoxicação por Antidepressivos Tricíclicos (ADT) e Bicarbonato de Sódio"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia",
        "value": "Depleção de Glutationa Hepática e Acúmulo do Metabólito Tóxico NAPQI causando Necrose Hepática Fulminante"
      },
      {
        "letter": "B",
        "label": "Nomograma de Rumack-Matthew para Avaliação do Risco de Hepatotoxicidade e Tratamento com N-Acetilcisteína",
        "value": "NAC"
      },
      {
        "letter": "C",
        "label": "Tétrade Tóxica",
        "value": "Alteração da Consciência, Arritmias Cardíacas Ventriculares, Convulsões e Efeitos Anticolinérgicos"
      },
      {
        "letter": "D",
        "label": "Eletrocardiograma Típico",
        "value": "Alargamento de QRS > 100 ms e Onda R Alta em aVR"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-clin-94-acidentes-por-animais-pec",
    "category": "antidotos",
    "categoryLabel": "Toxicologia & Antídotos",
    "title": "Acidentes por Animais Peçonhentos",
    "fullTitle": "Acidentes por Animais Peçonhentos (Toxicologia Clínica • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Toxicologia Clínica",
    "foco": "Acidentes por Animais Peçonhentos (Ofídico, Escorpiônico, Aracnídico)",
    "subfocos": [
      "Acidentes Ofídicos no Brasil: Botrópico, Crotálico, Laquético e Elapídico",
      "Escorpionismo (Tityus serrulatus) e Araneísmo (Loxosceles e Phoneutria)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Acidente Botrópico (Jararaca",
        "value": "Mais Comum - 85% dos casos, Ação Proteolítica/Inflamatória Local, Coagulante e Hemorrágica)"
      },
      {
        "letter": "B",
        "label": "Acidente Crotálico (Cascavel",
        "value": "Ação Neurotóxica com Fácies Miatênica/Ptose, Miotóxica com Rabdomiólise e Urina Escura, sem Reação Local)"
      },
      {
        "letter": "C",
        "label": "Escorpionismo Grave em Crianças",
        "value": "Manifestações Sistêmicas Autonômicas (Vômitos Profusos, Sudorese, Insuficiência Cardíaca e Edema Pulmonar tratados com Soro Antiescorpiônico)"
      },
      {
        "letter": "D",
        "label": "Loxoscelismo (Aranha-Marrom)",
        "value": "Placa Marmórea Típica com Necrose Cutânea Tardia e Forma Cutâneo-Hemolítica Grave"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-clin-95-intoxicacao-por-agrotoxic",
    "category": "antidotos",
    "categoryLabel": "Toxicologia & Antídotos",
    "title": "Intoxicação por Agrotóxicos e Álcoois Tóxicos",
    "fullTitle": "Intoxicação por Agrotóxicos e Álcoois Tóxicos (Toxicologia Clínica • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Toxicologia Clínica",
    "foco": "Intoxicação por Agrotóxicos e Álcoois Tóxicos (Metanol, Etilenoglicol)",
    "subfocos": [
      "Intoxicação por Inibidores da Colinesterase (Organofosforados e Carbamatos)",
      "Álcoois Tóxicos: Metanol e Etilenoglicol (Fomepizol e Etanol)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Clínica Médica (SBCM)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Inibição Irreversível da Acetilcolinesterase por Organofosforados",
        "value": "'Envelhecimento da Enzima') vs Reversível por Carbamatos (Chumbinho"
      },
      {
        "letter": "B",
        "label": "Atropinização Contínua Titulada com Alvo em Parâmetros Pulmonares",
        "value": "Cessação da Broncorreia e Ressecamento de Secreções) e Oximas (Pralidoxima"
      },
      {
        "letter": "C",
        "label": "Metanol",
        "value": "Ácido Fórmico causando Neurite Óptica e Cegueira Típica) vs Etilenoglicol (Ácido Oxálico com Cristais de Oxalato de Cálcio e Insuficiência Renal Aguda"
      },
      {
        "letter": "D",
        "label": "Acidose Metabólica com Ânion Gap Elevado e Gap Osmolar Aumentado",
        "value": "> 10-15 mOsm/kg"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-clin-96-sindromes-coronarianas-is",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Síndromes Coronarianas Isquêmicas",
    "fullTitle": "Síndromes Coronarianas Isquêmicas (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Síndromes Coronarianas Isquêmicas (Aguda e Crônica)",
    "subfocos": [
      "IAM com Supradesnivelamento do Segmento ST (IAMCSST)",
      "Síndrome Coronariana Aguda sem Supra de ST (SCASST) e Angina Instável",
      "Doença Arterial Coronariana Crônica e Angina Estável"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Eletrocardiograma e Localização da Parede Infartada",
        "value": "Anterior, Inferior com VD, Lateral"
      },
      {
        "letter": "B",
        "label": "Terapia de Reperfusão Imediata",
        "value": "Angioplastia Primária (< 90-120 min) vs Fibrinólise (< 30 min e até 12h)"
      },
      {
        "letter": "C",
        "label": "Terapia Farmacológica Coadjuvante",
        "value": "Dupla Antiagregação, Anticoagulação, Estatina e Betabloqueador"
      },
      {
        "letter": "D",
        "label": "Complicações Mecânicas",
        "value": "Rotura de Parede Livre, Septo Interventricular e Músculo Papilar"
      }
    ],
    "rule": "Diretrizes SBC / AHA: O supradesnivelamento do segmento ST em ≥ 2 derivações contíguas define IAM com supra (IAMCSST); tempo porta-balão alvo < 90 min (ou porta-agulha < 30 min se trombólise).",
    "bancaTrap": "Em IAM de parede inferior (DII, DIII, aVF), é mandatório rodar as derivações direitas (V3R e V4R); se houver acometimento de ventrículo direito, nitratos e betabloqueadores são formalmente contraindicados.",
    "imageUrl": "/images/medical/iam_supra_st.webp",
    "imageCaption": "Eletrocardiograma de 12 derivações: supradesnivelamento do segmento ST em parede anterior extensa (V1-V6) com ondas Q patológicas.",
    "imageModality": "ecg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Displaced",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:12_Lead_EKG_ST_Elevation_tracing_color_coded.jpg"
  },
  {
    "id": "tip-clin-97-insuficiencia-cardiaca-e",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Insuficiência Cardíaca e Cardiomiopatias",
    "fullTitle": "Insuficiência Cardíaca e Cardiomiopatias (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Insuficiência Cardíaca e Cardiomiopatias",
    "subfocos": [
      "Insuficiência Cardíaca com Fração de Ejeção Reduzida (ICFER)",
      "Insuficiência Cardíaca Agudamente Descompensada",
      "Cardiomiopatia Hipertrófica e Cardiomiopatia Chagásica"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Diagnósticos de Framingham e Papel dos Peptídeos Natriuréticos",
        "value": "BNP / NT-proBNP"
      },
      {
        "letter": "B",
        "label": "O \"Quarteto Fantástico\" Modificador de Sobrevida",
        "value": "iSGLT2, iECA/BRA/ARNI, Betabloqueador e Antagonista da Aldosterona"
      },
      {
        "letter": "C",
        "label": "Indicações de Dispositivos",
        "value": "Cardiodesfibrilador Implantável - CDI e Terapia de Ressincronização Cardíaca"
      },
      {
        "letter": "D",
        "label": "Perfil Hemodinâmico de Stevenson",
        "value": "Perfil A Quente/Seco, B Quente/Úmido, L Frio/Seco, C Frio/Úmido"
      }
    ],
    "rule": "Diretriz oficial de Cardiologia (Diretrizes SBC / AHA / ESC 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios Diagnósticos de Framingham e Papel dos Peptídeos Natriuréticos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Insuficiência Cardíaca e Cardiomiopatias e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-98-taquiarritmias-e-bradiarr",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Taquiarritmias e Bradiarritmias",
    "fullTitle": "Taquiarritmias e Bradiarritmias (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Taquiarritmias e Bradiarritmias",
    "subfocos": [
      "Fibrilação Atrial e Flutter Atrial",
      "Taquicardias Supraventriculares Paroxísticas",
      "Bradiarritmias e Bloqueios Atrioventriculares"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Avaliação de Risco Tromboembólico pelo Escore CHA2DS2-VASc e Indicação de Anticoagulação Oral",
        "value": "DOACs vs Varfarina"
      },
      {
        "letter": "B",
        "label": "Fibrilação Atrial e Flutter Atrial",
        "value": "Escore HAS-BLED para Risco de Sangramento"
      },
      {
        "letter": "C",
        "label": "Controle de Ritmo",
        "value": "Cardioversão Química/Elétrica) vs Controle de Frequência Cardíaca (Betabloqueador / Bloqueador de Canal de Cálcio"
      },
      {
        "letter": "D",
        "label": "Conduta na Instabilidade Hemodinâmica",
        "value": "Cardioversão Elétrica Sincronizada Imediata"
      }
    ],
    "rule": "Protocolo ACLS / AHA 2024: Ritmos chocáveis são Fibrilação Ventricular (FV) e Taquicardia Ventricular sem Pulso (TVSP); ritmos não-chocáveis são Assistolia e Atividade Elétrica Sem Pulso (AESP).",
    "bancaTrap": "Na assistolia e na AESP, o desfibrilador NUNCA deve ser acionado; a conduta é massagem de alta qualidade, adrenalina 1 mg a cada 3 a 5 min e investigação imediata das causas 5Hs e 5Ts.",
    "imageUrl": "/images/medical/taquicardia_supraventricular.webp",
    "imageCaption": "Eletrocardiograma: taquicardia por reentrada nodal (TRN) de QRS estreito (< 120 ms), ritmo regular e frequência > 150 bpm.",
    "imageModality": "ecg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Michael Rosengarten BEng, MD.McGill",
    "imageLicense": "CC BY-SA 3.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:E345_(CardioNetworks_ECGpedia).jpg"
  },
  {
    "id": "tip-clin-99-doencas-valvares-cardiaca",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Doenças Valvares Cardíacas",
    "fullTitle": "Doenças Valvares Cardíacas (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Doenças Valvares Cardíacas",
    "subfocos": [
      "Estenose Aórtica",
      "Insuficiência Mitral e Estenose Mitral"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Clássica de Gravidade",
        "value": "Angina, Síncope e Dispneia aos Esforços"
      },
      {
        "letter": "B",
        "label": "Exame Físico",
        "value": "Sopro Mesossistólico em Diamante com Irradiação para Carótidas e Pulso Parvus et Tardus"
      },
      {
        "letter": "C",
        "label": "Tratamento Cirúrgico",
        "value": "Troca Valvar Aórtica Cirúrgica vs TAVI (Transcatheter Aortic Valve Implantation)"
      },
      {
        "letter": "D",
        "label": "Estenose Mitral Reumática",
        "value": "Ruflar Diastólico com Estalido de Abertura, Reforço Pré-Sistólico e Hipertensão Pulmonar"
      }
    ],
    "rule": "Diretriz oficial de Cardiologia (Diretrizes SBC / AHA / ESC 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tríade Clássica de Gravidade) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Valvares Cardíacas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-100-hipertensao-arterial-sist",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Hipertensão Arterial Sistêmica e Crise Hipertensiva",
    "fullTitle": "Hipertensão Arterial Sistêmica e Crise Hipertensiva (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Hipertensão Arterial Sistêmica e Crise Hipertensiva",
    "subfocos": [
      "Diagnóstico e Manejo Ambulatorial da Hipertensão",
      "Crise Hipertensiva (Urgência vs Emergência Hipertensiva)"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios da Diretriz Brasileira de HAS",
        "value": "Classificação em Estágios 1, 2 e 3 e Metas Pressóricas"
      },
      {
        "letter": "B",
        "label": "Papel do MAPA e MRPA",
        "value": "Fenômeno do Avental Branco e Hipertensão Mascarada"
      },
      {
        "letter": "C",
        "label": "Escolha de Anti-hipertensivos de 1ª Linha",
        "value": "Tiazídicos, Bloqueadores de Canal de Cálcio, iECA/BRA"
      },
      {
        "letter": "D",
        "label": "Emergência Hipertensiva",
        "value": "Lesão Aguda e Progressiva de Órgãos-Alvo (Redução com Nitroprussiato ou Nitroglicerina EV)"
      }
    ],
    "rule": "Diretriz oficial de Cardiologia (Diretrizes SBC / AHA / ESC 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios da Diretriz Brasileira de HAS) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hipertensão Arterial Sistêmica e Crise Hipertensiva e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-101-doencas-do-pericardio-e-e",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Doenças do Pericárdio e Endocardite Infecciosa",
    "fullTitle": "Doenças do Pericárdio e Endocardite Infecciosa (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Doenças do Pericárdio e Endocardite Infecciosa",
    "subfocos": [
      "Pericardite Aguda e Tamponamento Cardíaco",
      "Endocardite Infecciosa"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Pericardite",
        "value": "Dor Torácica Pleurítica que Melhora ao Inclinar o Tronco para Frente, Atrito Pericárdico e Supra de ST Côncavo Difuso"
      },
      {
        "letter": "B",
        "label": "Tamponamento Cardíaco",
        "value": "Tríade de Beck (Hipotensão, Hipofonese de Bulhas e Turgência Jugular) + Pulso Paradoxal"
      },
      {
        "letter": "C",
        "label": "Conduta Imediata no Tamponamento",
        "value": "Pericardiocentese de Urgência (Manobra de Marfan)"
      },
      {
        "letter": "D",
        "label": "Critérios Modificados de Duke (Critérios Maiores",
        "value": "Hemoculturas Típicas e Vegetação no Ecocardiograma)"
      }
    ],
    "rule": "Diretriz oficial de Cardiologia (Diretrizes SBC / AHA / ESC 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Pericardite) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças do Pericárdio e Endocardite Infecciosa e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/pericardite_ecg.webp",
    "imageCaption": "Eletrocardiograma: pericardite aguda com supradesnivelamento difuso do segmento ST de concavidade superior e infradesnivelamento do segmento PR.",
    "imageModality": "ecg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "James Heilman, MD",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Acute_pericarditis.jpg"
  },
  {
    "id": "tip-clin-102-parada-cardiorrespiratori",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Parada Cardiorrespiratória e Ressuscitação",
    "fullTitle": "Parada Cardiorrespiratória e Ressuscitação (Cardiologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Parada Cardiorrespiratória e Ressuscitação (ACLS)",
    "subfocos": [
      "Ritmos Chocáveis e Não Chocáveis",
      "Cuidados Pós-Parada Cardiorrespiratória"
    ],
    "provenanceDefault": "Diretrizes SBC / AHA / ESC 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Ritmos Chocáveis",
        "value": "Fibrilação Ventricular (FV) e Taquicardia Ventricular sem Pulso (TVSP) - Choque Imediato + RCP"
      },
      {
        "letter": "B",
        "label": "Ritmos Não Chocáveis",
        "value": "Assistolia e Atividade Elétrica sem Pulso (AESP) - RCP Imediata + Adrenalina 1 mg precoce"
      },
      {
        "letter": "C",
        "label": "Drogas no Suporte Avançado de Vida",
        "value": "Adrenalina a cada 3-5 min e Amiodarona / Lidocaína para Ritmos Chocáveis"
      },
      {
        "letter": "D",
        "label": "Causas Reversíveis de PCR",
        "value": "Mnemônicos dos 5 Hs e 5 Ts"
      }
    ],
    "rule": "Protocolo ACLS / AHA 2024: Ritmos chocáveis são Fibrilação Ventricular (FV) e Taquicardia Ventricular sem Pulso (TVSP); ritmos não-chocáveis são Assistolia e Atividade Elétrica Sem Pulso (AESP).",
    "bancaTrap": "Na assistolia e na AESP, o desfibrilador NUNCA deve ser acionado; a conduta é massagem de alta qualidade, adrenalina 1 mg a cada 3 a 5 min e investigação imediata das causas 5Hs e 5Ts."
  },
  {
    "id": "tip-clin-103-doencas-obstrutivas-das-v",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doenças Obstrutivas das Vias Aéreas",
    "fullTitle": "Doenças Obstrutivas das Vias Aéreas (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Obstrutivas das Vias Aéreas (Asma e DPOC)",
    "subfocos": [
      "Asma Brônquica no Adulto",
      "Doença Pulmonar Obstrutiva Crônica (DPOC)"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico Espirométrico",
        "value": "Distúrbio Ventilatório Obstrutivo com Resposta Significativa ao Broncodilatador (Aumento VEF1 > 12% e > 200 mL)"
      },
      {
        "letter": "B",
        "label": "Manejo Crônico pelo GINA",
        "value": "Corticoide Inalatório como Pilar Central Obrigatório (Associação com Formoterol de Demanda/Manutenção)"
      },
      {
        "letter": "C",
        "label": "Crise Asmática Aguda no Pronto-Socorro",
        "value": "Beta-2 Agonista Inalatório, Corticoide Sistêmico Precoce e Brometo de Ipratrópio"
      },
      {
        "letter": "D",
        "label": "Diagnóstico Espirométrico",
        "value": "Obstrução Fixa Pós-Broncodilatador (VEF1 / CVF < 0,70)"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/dpoc_enfisema_rx.webp",
    "imageCaption": "Radiografia de tórax: hiperinsuflação pulmonar com rebaixamento e retificação das hemicúpulas diafragmáticas e aumento do diâmetro anteroposterior.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Cenveo",
    "imageLicense": "CC BY 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Anatomytool_Lungs_and_chest_wall_English.jpg"
  },
  {
    "id": "tip-clin-104-infeccoes-respiratorias-b",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Infecções Respiratórias Baixas",
    "fullTitle": "Infecções Respiratórias Baixas (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Infecções Respiratórias Baixas (Pneumonias e Abscessos)",
    "subfocos": [
      "Pneumonia Adquirida na Comunidade (PAC) no Adulto",
      "Abscesso Pulmonar e Pneumonia Aspirativa"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estratificação de Gravidade pelo Escore CURB-65",
        "value": "Confusão, Ureia >= 50, FR >= 30, PAS < 90 ou PAD <= 60, Idade >= 65"
      },
      {
        "letter": "B",
        "label": "Esquemas de Antibioticoterapia Empírica",
        "value": "Ambulatorial (Amoxicilina ou Macrolídeo), Enfermaria (Beta-lactâmico + Macrolídeo ou Quinolona Respiratória) e UTI"
      },
      {
        "letter": "C",
        "label": "Abscesso Pulmonar e Pneumonia Aspirativa",
        "value": "Agentes Anaeróbios da Cavidade Oral, Imagem com Nível Hidroaéreo e Tratamento com Amoxicilina/Clavulanato ou Clindamicina"
      },
      {
        "letter": "D",
        "label": "Abscesso Pulmonar e Pneumonia Aspirativa",
        "value": "Critérios para Drenagem Externa vs Suporte Clínico Prolongado"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-clin-105-doencas-vasculares-pulmon",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Doenças Vasculares Pulmonares",
    "fullTitle": "Doenças Vasculares Pulmonares (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Vasculares Pulmonares (TEP e Hipertensão Pulmonar)",
    "subfocos": [
      "Tromboembolismo Pulmonar (TEP)",
      "Hipertensão Pulmonar"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tromboembolismo Pulmonar (TEP)",
        "value": "Estratificação de Probabilidade Clínica pelos Escores de Wells e Genebra"
      },
      {
        "letter": "B",
        "label": "Algoritmo Diagnóstico",
        "value": "D-Dímero em Baixa/Intermediária Probabilidade vs Angio-TC de Tórax em Alta Probabilidade"
      },
      {
        "letter": "C",
        "label": "TEP Maciço / Choque Obstrutivo",
        "value": "Indicação de Trombólise Sistêmica (Alteplase) e Suporte Hemodinâmico"
      },
      {
        "letter": "D",
        "label": "Anticoagulação Plena",
        "value": "DOACs de 1ª Escolha, Enoxaparina e Varfarina"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-clin-106-doencas-pleurais",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Doenças Pleurais",
    "fullTitle": "Doenças Pleurais (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Pleurais (Derrames e Pneumotórax)",
    "subfocos": [
      "Derrame Pleural e Critérios de Light",
      "Pneumotórax Espontâneo no Adulto"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios de Light para Diferenciação Transudato vs Exsudato",
        "value": "Proteína Pleural/Sérica > 0,5, LDH Pleural/Sérico > 0,6, LDH Pleural > 2/3 LSN Sérico"
      },
      {
        "letter": "B",
        "label": "Derrame Parapneumônico Complicado e Empiema (Critérios de Drenagem em Selo d'Água",
        "value": "pH < 7,20, Glicose < 40, Bactérias ou Pus Franco)"
      },
      {
        "letter": "C",
        "label": "Pneumotórax Primário",
        "value": "Jovens Longilíneos com Blebs Apicais) vs Secundário (DPOC com Bolhas Enfisematosas"
      },
      {
        "letter": "D",
        "label": "Conduta pelo Tamanho",
        "value": "Observação com O2 em Pequenos Volumes vs Drenagem Torácica Fechada e Pleurodese em Recidivantes"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/pneumotorax_rx.webp",
    "imageCaption": "Radiografia de tórax: hipertransparência unilateral com ausência de trama vascular periférica e retração do parênquima pulmonar (pneumotórax).",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Pilate SA, De Clercq S",
    "imageLicense": "CC BY 2.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:PMC3160360_1749-7922-6-23-1.png"
  },
  {
    "id": "tip-clin-107-doencas-pulmonares-inters",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doenças Pulmonares Intersticiais e Fibrose",
    "fullTitle": "Doenças Pulmonares Intersticiais e Fibrose (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Pulmonares Intersticiais e Fibrose",
    "subfocos": [
      "Fibrose Pulmonar Idiopática (FPI) e Padrão TCAR de PIU",
      "Sarcoidose e Pneumonite por Hipersensibilidade (PH)"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Padrão Tomográfico de Pneumonia Intersticial Usual (PIU",
        "value": "Faveolamento Subpleural, Bronquiectasias de Tração e Gradiente Ápico-Basal)"
      },
      {
        "letter": "B",
        "label": "Fibrose Pulmonar Idiopática (FPI) e Padrão TCAR de PIU",
        "value": "Terapia Antifibrótica com Nintedanibe e Pirfenidona para Redução do Declínio da CVF"
      },
      {
        "letter": "C",
        "label": "Sarcoidose Pulmonar",
        "value": "Linfadenopatia Hilar Bilateral Simétrica, Granulomas Não-Caseificantes e Corticoterapia"
      },
      {
        "letter": "D",
        "label": "Pneumonite por Hipersensibilidade",
        "value": "Exposição a Mofo/Pássaros, Padrão em Mosaico e Lavado com Linfocitose CD4/CD8"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-clin-108-tuberculose-pulmonar-e-mi",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Tuberculose Pulmonar e Micobacterioses",
    "fullTitle": "Tuberculose Pulmonar e Micobacterioses (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Tuberculose Pulmonar e Micobacterioses",
    "subfocos": [
      "Diagnóstico e Manejo Clínico da Tuberculose Ativa",
      "Infecção Latente pelo Mycobacterium tuberculosis (ILTB)"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico Laboratorial",
        "value": "Teste Rápido Molecular para TB (TRM-TB) com Detecção de Resistência à Rifampicina e Bacilos Álcool-Ácido Resistentes (BAAR)"
      },
      {
        "letter": "B",
        "label": "Esquema Básico RIPE",
        "value": "Rifampicina, Isoniazida, Pirazinamida e Etambutol por 2 meses + Rifampicina e Isoniazida por 4 meses"
      },
      {
        "letter": "C",
        "label": "Efeitos Adversos dos Fármacos Antituberculose",
        "value": "Hepatotoxicidade, Neurite Óptica pelo Etambutol, Hiperuricemia"
      },
      {
        "letter": "D",
        "label": "Indicações de Rastreamento com PPD / IGRA",
        "value": "Contatos Domiciliares, PVHIV, Imunossuprimidos"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/tuberculose_rx.webp",
    "imageCaption": "Radiografia de tórax: lesão cavitária de paredes espessas em segmento apical do lobo superior direito característica de tuberculose pós-primária.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Yale Rosen",
    "imageLicense": "CC BY-SA 2.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Cavitary_tuberculosis.jpg"
  },
  {
    "id": "tip-clin-109-neoplasias-pulmonares-e-n",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário",
    "fullTitle": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário (Pneumologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário",
    "subfocos": [
      "Nódulo Pulmonar Solitário (NPS): Critérios de Fleischner e Malignidade",
      "Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo"
    ],
    "provenanceDefault": "Diretrizes SBPT / Consensos GOLD & GINA 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estratificação de Risco pelo Critério de Fleischner",
        "value": "Tamanho, Vidro Fosco vs Sólido, Margens Espiculadas"
      },
      {
        "letter": "B",
        "label": "Conduta Propedêutica",
        "value": "Acompanhamento Tomográfico vs PET-CT e Biópsia/Ressonância em Alto Risco"
      },
      {
        "letter": "C",
        "label": "Pesquisa de Mutações Condutoras no Adenocarcinoma",
        "value": "EGFR, ALK, ROS1, BRAF e Expressão de PD-L1"
      },
      {
        "letter": "D",
        "label": "Síndrome da Veia Cava Superior e Síndrome de Pancoast",
        "value": "Dor no Ombro e Síndrome de Horner por Invasão do Gânglio Estrelado"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-clin-110-doencas-esofagicas-e-gast",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doenças Esofágicas e Gastroduodenais",
    "fullTitle": "Doenças Esofágicas e Gastroduodenais (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças Esofágicas e Gastroduodenais (DRGE, Úlcera e Gastrite)",
    "subfocos": [
      "Doença do Refluxo Gastroesofágico (DRGE) e Esôfago de Barrett",
      "Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sintomas Típicos",
        "value": "Pirose e Regurgitação) e Indicações de Endoscopia Digestiva Alta (Sinais de Alarme ou Idade > 40-45 anos"
      },
      {
        "letter": "B",
        "label": "Esôfago de Barrett",
        "value": "Metaplasia Intestinal Especializada com Células Caliciformes"
      },
      {
        "letter": "C",
        "label": "Diferenciação Úlcera Gástrica",
        "value": "Obrigatoriedade de Biópsia para Excluir Neoplasia) vs Duodenal (Maior Associação com H. pylori"
      },
      {
        "letter": "D",
        "label": "Esquema Canônico de Erradicação de 1ª Linha",
        "value": "IBP + Claritromicina + Amoxicilina por 14 Dias e Controle de Cura"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Sintomas Típicos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Esofágicas e Gastroduodenais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-111-hemorragia-digestiva",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Hemorragia Digestiva",
    "fullTitle": "Hemorragia Digestiva (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Hemorragia Digestiva (Alta e Baixa)",
    "subfocos": [
      "Hemorragia Digestiva Alta (HDA) Não-Varicosa vs Varicosa",
      "Hemorragia Digestiva Baixa (HDB): Divertículos, Angiodisplasia e Conduta"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estratificação de Risco",
        "value": "Escore de Glasgow-Blatchford e Rockall"
      },
      {
        "letter": "B",
        "label": "Classificação de Forrest para Úlcera Sangrante e Terapia Endoscópica Combinada",
        "value": "Injeção de Adrenalina + Termocoagulação/Clipe"
      },
      {
        "letter": "C",
        "label": "Principais Causas",
        "value": "Doença Diverticular dos Cólons (Sangramento Arterial Volumoso) e Angiodisplasias (Idosos e DRC)"
      },
      {
        "letter": "D",
        "label": "Algoritmo Propedêutico",
        "value": "Colonoscopia após Preparo Rápido vs Angio-TC e Arteriografia com Embolização na Instabilidade"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Estratificação de Risco) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hemorragia Digestiva e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-112-hepatites-agudas-e-cronic",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hepatites Agudas e Crônicas",
    "fullTitle": "Hepatites Agudas e Crônicas (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Hepatites Agudas e Crônicas (Virais, Tóxicas e Autoimunes)",
    "subfocos": [
      "Hepatite B e C: Interpretação Sorológica e Terapia Antiviral",
      "Hepatite Autoimune e Doença Hepática Alcoólica"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Perfil Sorológico da Hepatite B",
        "value": "HBsAg, Anti-HBc IgM/IgG, HBeAg e Anti-HBe"
      },
      {
        "letter": "B",
        "label": "Hepatite C",
        "value": "Diagnóstico com Anti-HCV e Carga Viral (HCV-RNA) e Cura com Antivirais de Ação Direta (Sofosbuvir/Velpatasvir)"
      },
      {
        "letter": "C",
        "label": "Hepatite Autoimune",
        "value": "Elevação de IgG, Autoanticorpos (FAN, Antimúsculo Liso, Anti-LKM1) e Resposta a Prednisona e Azatioprina"
      },
      {
        "letter": "D",
        "label": "Hepatite Alcoólica Aguda",
        "value": "Relação AST/ALT > 2 com AST < 300-500 U/L e Cálculo da Função Discriminante de Maddrey (Corticoide se >= 32)"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Perfil Sorológico da Hepatite B) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hepatites Agudas e Crônicas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-113-cirrose-hepatica-e-hipert",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Cirrose Hepática e Hipertensão Portal",
    "fullTitle": "Cirrose Hepática e Hipertensão Portal (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Cirrose Hepática e Hipertensão Portal",
    "subfocos": [
      "Estratificação Prognóstica (Child-Pugh e MELD) e Síndrome de Hipertensão Portal",
      "Manejo da Ascite, Peritonite Bacteriana Espontânea (PBE) e Encefalopatia Hepática"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação de Child-Pugh",
        "value": "Bilirrubina, Albumina, INR, Ascite, Encefalopatia"
      },
      {
        "letter": "B",
        "label": "Gradiente de Pressão Venosa Hepática",
        "value": "GPVH >= 10 mmHg para Hipertensão Portal Clinicamente Significativa"
      },
      {
        "letter": "C",
        "label": "Análise do Líquido Ascítico pelo GASA",
        "value": "GASA >= 1,1 g/dL Indica Hipertensão Portal"
      },
      {
        "letter": "D",
        "label": "Diagnóstico de PBE",
        "value": "PMN >= 250/mm3 no Líquido Ascítico), Tratamento com Cefotaxima e Profilaxia com Albumina Humana (1,5g/kg no D1 e 1g/kg no D3"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação de Child-Pugh) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Cirrose Hepática e Hipertensão Portal e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-114-doencas-da-vesicula-vias",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Doenças da Vesícula, Vias Biliares e Pancreatite",
    "fullTitle": "Doenças da Vesícula, Vias Biliares e Pancreatite (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças da Vesícula, Vias Biliares e Pancreatite",
    "subfocos": [
      "Pancreatite Aguda no Adulto: Diagnóstico Clínico e Escores Prognósticos",
      "Pancreatite Crônica, Doenças Colestáticas (Cirrose Biliar Primária e CEP)"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Diagnósticos de Atlanta (2 de 3",
        "value": "Dor Típica em Faixa, Amilase/Lipase > 3x o LSN, Achados Radiológicos em TC/USG)"
      },
      {
        "letter": "B",
        "label": "Estratificação Prognóstica Precoce",
        "value": "Critérios de Ranson, BISAP, Apache II e Hematócrito > 44%"
      },
      {
        "letter": "C",
        "label": "Tríade da Pancreatite Crônica Avançada",
        "value": "Calcificações Pancreáticas à TC, Esteatorreia e Diabetes Mellitus Secundário"
      },
      {
        "letter": "D",
        "label": "Colangite Biliar Primária",
        "value": "Anticorpo Antimitocôndria - AMA Positivo e Ácido Ursodesoxicólico) vs Colangite Esclerosante Primária (p-ANCA"
      }
    ],
    "rule": "Diretrizes Internacionais e CBC: Critérios de Ranson ≥ 3 na admissão (LEGAL: Leucócitos > 16k, Enzima LDH > 350, Glicose > 200, Anos/Idade > 55, AST > 250) indicam pancreatite aguda potencialmente grave.",
    "bancaTrap": "Amilase e lipase séricas servem unicamente para confirmação diagnóstica na admissão; os seus títulos séricos absolutos NÃO têm correlação com gravidade, prognóstico ou indicação cirúrgica.",
    "imageUrl": "/images/medical/colecistite_usg.webp",
    "imageCaption": "Ultrassonografia de abdome superior: cálculo impactado no colo da vesícula biliar, espessamento parietal (> 4 mm) e líquido perivesicular.",
    "imageModality": "usg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Cerevisae",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Acute_cholecystitis_as_seen_on_ultrasound_axial_view.jpg"
  },
  {
    "id": "tip-clin-115-doencas-inflamatorias-int",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Doenças Inflamatórias Intestinais",
    "fullTitle": "Doenças Inflamatórias Intestinais (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças Inflamatórias Intestinais (Crohn e RCU)",
    "subfocos": [
      "Diagnóstico Diferencial Clínico e Endoscópico: Doença de Crohn vs Retocolite Ulcerativa",
      "Terapia de Indução e Manutenção (Biológicos) e Megacólon Tóxico"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Retocolite Ulcerativa",
        "value": "Acometimento Contínuo, Restrito à Mucosa, Iniciando no Reto com Sangramento Retal Frequente e Pseudopólipos"
      },
      {
        "letter": "B",
        "label": "Doença de Crohn",
        "value": "Acometimento Transmural, Salteado (Skip Lesions), da Boca ao Ânus (Íleo Terminal), com Fístulas, Estenoses e Fissuras"
      },
      {
        "letter": "C",
        "label": "Escalonamento Terapêutico",
        "value": "Derivados de 5-ASA (Mesalazina), Corticoides para Crise e Biológicos Anti-TNF (Infliximabe, Adalimumabe)"
      },
      {
        "letter": "D",
        "label": "Megacólon Tóxico",
        "value": "Dilatação do Cólon Transverso > 6 cm à Radiografia com Toxemia Sistêmica (Urgência Clínica e Cirúrgica)"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Retocolite Ulcerativa) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doenças Inflamatórias Intestinais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-116-sindromes-malabsortivas-e",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais",
    "fullTitle": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais (Gastroenterologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais",
    "subfocos": [
      "Doença Celíaca: Fisiopatologia, Sorologia e Biópsia Duodenal",
      "Síndrome do Intestino Irritável (Critérios de Roma IV) e Supercrescimento Bacteriano (SIBO)"
    ],
    "provenanceDefault": "Federação Brasileira de Gastroenterologia (FBG) / Baveno VII",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Propedêutica Sorológica",
        "value": "Anticorpo Antitransglutaminase Tecidual IgA (Anti-tTG) e Dosagem Concomitante de IgA Total"
      },
      {
        "letter": "B",
        "label": "Critérios de Roma IV para SII",
        "value": "Dor Abdominal Recorrente >= 1 dia/semana associada a Mudança na Frequência ou Forma das Fezes"
      },
      {
        "letter": "C",
        "label": "Supercrescimento Bacteriano no Intestino Delgado (SIBO)",
        "value": "Teste Respiratório do Hidrogênio Expirado e Tratamento com Rifaximina"
      }
    ],
    "rule": "Diretriz oficial de Gastroenterologia (Federação Brasileira de Gastroenterologia (FBG) / Baveno VII): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Propedêutica Sorológica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Síndromes Malabsortivas e Transtornos Funcionais Intestinais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-117-injuria-renal-aguda",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Injúria Renal Aguda",
    "fullTitle": "Injúria Renal Aguda (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Injúria Renal Aguda (LRA)",
    "subfocos": [
      "Classificação KDIGO e Fisiopatologia da LRA",
      "Indicações de Diálise de Urgência"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação KDIGO e Fisiopatologia da LRA",
        "value": "Estágios KDIGO 1, 2 e 3 Baseados em Níveis de Creatinina Sérica e Débito Urinário"
      },
      {
        "letter": "B",
        "label": "Diferenciação LRA Pré-Renal vs Necrose Tubular Aguda (NTA)",
        "value": "Fração de Excreção de Sódio (FeNa < 1% vs > 2%) e Osmolaridade Urinária"
      },
      {
        "letter": "C",
        "label": "Sedimento Urinário",
        "value": "Cilindros Hialinos (Pré-Renal) vs Cilindros Granulosos Pigmentares / Marrom-Grumosos (NTA)"
      },
      {
        "letter": "D",
        "label": "Indicações Absolutas de Terapia Renal Substitutiva de Urgência (Critérios AEIOU",
        "value": "Acidose Refratária pH < 7,15, Hipercalemia Grave Refratária, Intoxicações Exógenas Dialisáveis, Sobrecarga Volêmica / Edema Agudo Refratário, Uremia Grave Encefalopatia/Pericardite)"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação KDIGO e Fisiopatologia da LRA) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Injúria Renal Aguda e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-118-doenca-renal-cronica",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Doença Renal Crônica",
    "fullTitle": "Doença Renal Crônica (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Doença Renal Crônica (DRC) e Manejo Conservador/Dialítico",
    "subfocos": [
      "Estadiamento da DRC (KDIGO por TFG e Albuminúria) e Medidas Nefroprotetoras",
      "Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo (DMO-DRC)"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação KDIGO",
        "value": "Estágios G1 a G5 combinados com Categorias de Albuminúria A1 < 30, A2 30-300, A3 > 300 mg/g"
      },
      {
        "letter": "B",
        "label": "Nefroproteção Canônica",
        "value": "Controle Estrito de PA com Bloqueadores do SRAA (IECA/BRA), Inibidores de SGLT2 e Restrição Salina"
      },
      {
        "letter": "C",
        "label": "Anemia da DRC por Deficiência de Eritropoietina",
        "value": "Alvo de Hemoglobina 10-11,5 g/dL com Reposição de Ferro e Alfaepoetina"
      },
      {
        "letter": "D",
        "label": "DMO-DRC",
        "value": "Hiperparatireoidismo Secundário, Controle de Fósforo com Quelantes e Indicações Formais de Hemodiálise de Urgência"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação KDIGO) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doença Renal Crônica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-119-disturbios-hidroeletrolit",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Distúrbios Hidroeletrolíticos",
    "fullTitle": "Distúrbios Hidroeletrolíticos (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Distúrbios Hidroeletrolíticos (Sódio, Potássio, Cálcio, Magnésio)",
    "subfocos": [
      "Hiponatremia e Hipernatremia",
      "Distúrbios do Potássio (Hipercalemia e Hipocalemia)"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hiponatremia Hipotônica",
        "value": "Diferenciação pelo Volume Extracelular (Hipovolêmica, Euvolêmica - SIADH, Hipervolêmica)"
      },
      {
        "letter": "B",
        "label": "Hiponatremia e Hipernatremia",
        "value": "Correção com Solução Salina Hipertônica a 3% na Hiponatremia Aguda Sintomática Grave"
      },
      {
        "letter": "C",
        "label": "Limite de Correção da Natremia",
        "value": "Não Ultrapassar 8-10 mEq/L em 24 Horas para Evitar Síndrome de Desmielinização Osmótica (Mielinólise Pontina)"
      },
      {
        "letter": "D",
        "label": "Alterações Eletrocardiográficas da Hipercalemia",
        "value": "Onda T Apiculada e Simétrica em Tenda, Achatamento de P, Alargamento de QRS e Ritmo Sinusoidal"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Hiponatremia Hipotônica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Distúrbios Hidroeletrolíticos e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-clin-120-disturbios-do-equilibrio",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Distúrbios do Equilíbrio Ácido-Base",
    "fullTitle": "Distúrbios do Equilíbrio Ácido-Base (Nefrologia • Clínica Médica)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Distúrbios do Equilíbrio Ácido-Base",
    "subfocos": [
      "Acidose Metabólica com Ânion Gap Elevado vs Normal (Hiperclorêmica)",
      "Alcalose Metabólica e Distúrbios Respiratórios (Acidose e Alcalose)"
    ],
    "provenanceDefault": "Diretrizes SBN / Consenso KDIGO 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Cálculo do Ânion Gap Sérico (Na - [Cl + HCO3]; Normal",
        "value": "8 a 12 mEq/L) e Causas de AG Elevado (Mnemônico GOLD MARK: Cetoacidose, Uremia, Lático)"
      },
      {
        "letter": "B",
        "label": "Acidose Metabólica Hiperclorêmica (Ânion Gap Normal)",
        "value": "Perdas Digestivas Baixas (Diarreia) e Acidoses Tubulares Renais (ATRs)"
      },
      {
        "letter": "C",
        "label": "Alcalose Metabólica",
        "value": "Avaliação do Cloro Urinário (Cl-Responsiva < 15 mEq/L por Vômitos/Diuréticos vs Cl-Resistente por Hiperaldosteronismo)"
      },
      {
        "letter": "D",
        "label": "Compensação Respiratória Esperada (Fórmula de Winter",
        "value": "pCO2 = [1,5 x HCO3] + 8 +/- 2) para Identificação de Distúrbios Mistos"
      }
    ],
    "rule": "Diretriz oficial de Nefrologia (Diretrizes SBN / Consenso KDIGO 2024): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Cálculo do Ânion Gap Sérico (Na - [Cl + HCO3]; Normal) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Distúrbios do Equilíbrio Ácido-Base e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-121-avaliacao-inicial-e-via-a",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Avaliação Inicial e Via Aérea no Trauma",
    "fullTitle": "Avaliação Inicial e Via Aérea no Trauma (Trauma e Atendimento Inicial • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Avaliação Inicial e Via Aérea no Trauma (A do ATLS)",
    "subfocos": [
      "Sistematização do Exame Primário (ABCDE do ATLS)",
      "Via Aérea Definitiva e Via Aérea Difícil no Trauma"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "A",
        "value": "Via Aérea com Controle Cervical (Colar Cervical e Prancha Rígida)"
      },
      {
        "letter": "B",
        "label": "B",
        "value": "Respiração e Ventilação; C: Circulação e Controle da Hemorragia; D: Incapacidade e Estado Neurológico; E: Exposição com Controle de Hipotermia"
      },
      {
        "letter": "C",
        "label": "Via Aérea Definitiva e Via Aérea Difícil no Trauma",
        "value": "Sequência de Prioridades e Reavaliação Contínua"
      },
      {
        "letter": "D",
        "label": "Indicações Formais de Via Aérea Definitiva",
        "value": "Apneia, Glasgow <= 8, Fraturas Faciais Graves, Queimadura de Vias Aéreas"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-122-trauma-toracico-com-risco",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Trauma Torácico com Risco Iminente de Morte",
    "fullTitle": "Trauma Torácico com Risco Iminente de Morte (Trauma e Atendimento Inicial • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Torácico com Risco Iminente de Morte (Pneumotórax Hipertensivo/Aberto, Hemotórax Maciço, Tamponamento)",
    "subfocos": [
      "Pneumotórax Hipertensivo e Pneumotórax Aberto",
      "Hemotórax Maciço e Tamponamento Cardíaco",
      "Tórax Instável e Contusão Pulmonar"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Pneumotórax Hipertensivo",
        "value": "Diagnóstico Clínico Imediato (Hipotensão, Turgência Jugular, Murmúrio Vesicular Abolido e Desvio de Traqueia) - Jamais Aguardar Radiografia"
      },
      {
        "letter": "B",
        "label": "Descompressão Imediata por Toracostomia com Agulha",
        "value": "5º EIC na Linha Axilar Anterior ou 2º EIC na Linha Hemiclavicular"
      },
      {
        "letter": "C",
        "label": "Pneumotórax Aberto",
        "value": "Curativo de 3 Pontas Provisório e Drenagem em Sítio Cirúrgico Distante"
      },
      {
        "letter": "D",
        "label": "Hemotórax Maciço",
        "value": "Drenagem Torácica Imediata > 1.500 mL de Sangue ou > 200-300 mL/hora por 2-4 Horas Consecutivas = Indicação de Toracotomia de Urgência"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/pneumotorax_rx.webp",
    "imageCaption": "Radiografia de tórax: hipertransparência unilateral com ausência de trama vascular periférica e retração do parênquima pulmonar (pneumotórax).",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Pilate SA, De Clercq S",
    "imageLicense": "CC BY 2.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:PMC3160360_1749-7922-6-23-1.png"
  },
  {
    "id": "tip-ciru-123-trauma-abdominal-contuso",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Trauma Abdominal Contuso e Penetrante",
    "fullTitle": "Trauma Abdominal Contuso e Penetrante (Trauma e Atendimento Inicial • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Abdominal Contuso e Penetrante (FAST e Laparotomia)",
    "subfocos": [
      "Avaliação por FAST e Lavado Peritoneal Diagnóstico",
      "Trauma Penetrante: Arma Branca vs Arma de Fogo",
      "Trauma de Baço e Fígado (Manejo Não Operatório - MNO)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tratamento Centrado na Analgesia Agressiva",
        "value": "Bloqueio Epidural"
      },
      {
        "letter": "B",
        "label": "E-FAST",
        "value": "Avaliação dos 4 Espaços Anatômicos (Hepatorrenal / Morrison, Esplenorrenal, Pelve / Suprapúbico e Subxifoide / Pericárdico) + Janelas Apicais Pleurais"
      },
      {
        "letter": "C",
        "label": "Trauma Penetrante: Arma Branca vs Arma de Fogo",
        "value": "Paciente Instável com FAST Positivo = Laparotomia Exploradora Imediata sem Perda de Tempo com TC"
      },
      {
        "letter": "D",
        "label": "Trauma Penetrante: Arma Branca vs Arma de Fogo",
        "value": "Paciente Estável com Trauma Fechado = Tomografia de Abdome com Contraste Venoso"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-124-trauma-cranioencefalico",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Trauma Cranioencefálico",
    "fullTitle": "Trauma Cranioencefálico (Trauma e Atendimento Inicial • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Cranioencefálico (TCE Leve, Moderado e Grave)",
    "subfocos": [
      "Hematoma Extradural vs Hematoma Subdural Agudo",
      "Manejo da Hipertensão Intracraniana e Escala de Glasgow"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hematoma Extradural vs Hematoma Subdural Agudo",
        "value": "Angioembolização em Lesões de Alto Grau com \"Blush\" Arterial de Contraste na TC"
      },
      {
        "letter": "B",
        "label": "Hematoma Extradural / Epidural",
        "value": "Rotura da Artéria Meníngea Média, História de \"Intervalo Lúcido\", TC com Imagem Biconvexa / Hiperdensa que Respeita as Suturas Cranianas"
      },
      {
        "letter": "C",
        "label": "Hematoma Subdural Agudo",
        "value": "Ruptura de Veias Pontes Corticais, Idosos e Alcoólatras, TC com Imagem em Crescente / Semilunar Hiperdensa que Ultrapassa as Suturas"
      },
      {
        "letter": "D",
        "label": "Classificação",
        "value": "TCE Leve (Glasgow 13-15), Moderado (9-12) e Grave (<= 8)"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-125-trauma-raquimedular",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Trauma Raquimedular",
    "fullTitle": "Trauma Raquimedular (Trauma e Atendimento Inicial • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Raquimedular (TRM)",
    "subfocos": [
      "Avaliação Neurológica Inicial e Nível de Lesão (Escala ASIA)",
      "Imobilização, Propedêutica por Imagem e Indicações Cirúrgicas de Descompressão"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação da Escala de Deficiência de ASIA (A",
        "value": "Completo a E: Normal) e Nível Motor/Sensitivo"
      },
      {
        "letter": "B",
        "label": "Diferenciação Canônica",
        "value": "Choque Medular (Flacidez e Arreflexia Transitória) vs Choque Neurogênico (Hipotensão e Bradicardia por Perda de Tônus Simpático)"
      },
      {
        "letter": "C",
        "label": "Imobilização, Propedêutica por Imagem e Indicações Cirúrgicas de Descompressão",
        "value": "Critérios de Restrição de Movimento da Coluna e Critérios NEXUS / Canadian C-Spine Rule para TC de Coluna"
      },
      {
        "letter": "D",
        "label": "Indicações Cirúrgicas de Urgência",
        "value": "Déficit Neurológico Progressivo, Fratura Instável e Compressão Medular Aguda"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-126-trauma-pelvico-e-hemorrag",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Trauma Pélvico e Hemorragia Retroperitoneal",
    "fullTitle": "Trauma Pélvico e Hemorragia Retroperitoneal (Trauma e Atendimento Inicial • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Pélvico e Hemorragia Retroperitoneal",
    "subfocos": [
      "Mecanismo de Trauma, Classificação de Young-Burgess e Diagnóstico",
      "Estabilização Hemodinâmica, Lençol Pélvico, Fixador Externo e Angioembolização"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Propedêutica Rápida no Trauma",
        "value": "Radiografia de Bacia no ATLS, FAST Estendido e Angio-TC em Paciente Estável"
      },
      {
        "letter": "B",
        "label": "Estabilização Hemodinâmica, Lençol Pélvico, Fixador Externo e Angioembolização",
        "value": "Fechamento Imediato da Pelve no Choque com Lençol / Cinta Pélvica na Altura dos Grandes Trocanteres"
      },
      {
        "letter": "C",
        "label": "Parâmetro de Avaliação 3",
        "value": "Estratificação de gravidade e monitorização contínua de resposta terapêutica"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-127-choque-no-trauma-e-ressus",
    "category": "transfusao",
    "categoryLabel": "Gatilhos Hemoterápicos",
    "title": "Choque no Trauma e Ressuscitação Hemostática",
    "fullTitle": "Choque no Trauma e Ressuscitação Hemostática (Trauma e Atendimento Inicial • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Choque no Trauma e Ressuscitação Hemostática",
    "subfocos": [
      "Classificação do Choque Hemorrágico (Classes I a IV do ATLS)",
      "Hipotensão Permissiva e Alvos de Ressuscitação"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Algoritmo no Paciente Instável",
        "value": "Fixação Externa e Packing Pré-Peritoneal vs Angiografia com Embolização Seletiva"
      },
      {
        "letter": "B",
        "label": "Classe I",
        "value": "< 15% de perda), Classe II (15-30% - Taquicardia, PA normal), Classe III (30-40% - Hipotensão, Oligúria), Classe IV (> 40% - Choque Profundo, Rebaixamento"
      },
      {
        "letter": "C",
        "label": "Transfusão Maciça",
        "value": "Relação 1:1:1 (Concentrado de Hemácias, Plasma Fresco Congelado e Plaquetas)"
      },
      {
        "letter": "D",
        "label": "Ácido Tranexâmico (TXA)",
        "value": "1 g em Bolus em até 3 Horas do Trauma seguido de 1 g em Infusão Contínua por 8 Horas"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-128-cirurgia-de-controle-de-d",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Cirurgia de Controle de Danos",
    "fullTitle": "Cirurgia de Controle de Danos (Trauma e Atendimento Inicial • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Cirurgia de Controle de Danos (Damage Control)",
    "subfocos": [
      "As 3 Fases do Damage Control Surgery",
      "Síndrome Compartimental Abdominal (SCA)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Alvo de PAS entre 80-90 mmHg até o Controle Cirúrgico Definitivo da Hemorragia",
        "value": "Exceto se TCE Grave Concomitante"
      },
      {
        "letter": "B",
        "label": "Controle Agressivo da Tríade Letal",
        "value": "Hipotermia, Acidose Metabólica e Coagulopatia"
      },
      {
        "letter": "C",
        "label": "Fase 1 (Bloco Cirúrgico)",
        "value": "Laparotomia Abreviada, Controle Hemostático (Empacotamento / Packing Hepático) e Controle de Contaminação (Ligadura de Alças sem Anastomoses) e Fechamento Provisório (Bolsa de Bogotá / Vácuo)"
      },
      {
        "letter": "D",
        "label": "Fase 2 (UTI)",
        "value": "Reaquecimento Ativo, Correção da Acidose e da Coagulopatia, Otimização Ventilatória"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-129-abdome-agudo-inflamatorio",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Abdome Agudo Inflamatório",
    "fullTitle": "Abdome Agudo Inflamatório (Abdome Agudo Cirúrgico • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Inflamatório",
    "subfocos": [
      "Apendicite Aguda",
      "Colecistite Aguda Litiásica e Alitiásica",
      "Diverticulite Aguda dos Cólons",
      "Pancreatite Aguda Necrosante Cirúrgica"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia, Cronologia de Murphy e Sinais Físicos Canônicos",
        "value": "Blumberg, Rovsing, Lenander, Obturador e Psoas"
      },
      {
        "letter": "B",
        "label": "Escore de Alvarado, Propedêutica por Imagem",
        "value": "USG vs TC"
      },
      {
        "letter": "C",
        "label": "Tríade Diagnóstica de Tóquio",
        "value": "Sinal de Murphy, Sinais Sistêmicos e Achados USG com Parede Espessada > 4 mm"
      },
      {
        "letter": "D",
        "label": "Colecistectomia Videolaparoscópica Precoce",
        "value": "< 72h"
      }
    ],
    "rule": "Diretriz oficial de Abdome Agudo Cirúrgico (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Fisiopatologia, Cronologia de Murphy e Sinais Físicos Canônicos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Abdome Agudo Inflamatório e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/apendicite_tc.webp",
    "imageCaption": "Tomografia computadorizada de abdome: apêndice cecal espessado (> 6 mm), com realce parietal e densificação da gordura periapendicular.",
    "imageModality": "tc",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Hellerhoff",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Subhepatische_Appendicitis_45M_-_CT_coronar_-_001.jpg"
  },
  {
    "id": "tip-ciru-130-abdome-agudo-obstrutivo",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Abdome Agudo Obstrutivo",
    "fullTitle": "Abdome Agudo Obstrutivo (Abdome Agudo Cirúrgico • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Obstrutivo",
    "subfocos": [
      "Obstrução Intestinal por Bridas e Aderências",
      "Volvo de Sigmoide e Ceco",
      "Neoplasia Colorretal Obstrutiva e Hérnias Encarceradas",
      "Íleo Paralítico vs Síndrome de Ogilvie (Pseudo-obstrução)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Clínico",
        "value": "Dor em Cólica, Vômitos Biliosos, Parada de Eliminação de Gases e Fezes e Níveis Hidroaéreos"
      },
      {
        "letter": "B",
        "label": "Obstrução Intestinal por Bridas e Aderências",
        "value": "Tratamento Conservador Inicial com Sonda Nasogástrica e Hidratação vs Laparotomia por Estrangulamento / Sofrimento de Alça"
      },
      {
        "letter": "C",
        "label": "Volvo de Sigmoide e Ceco",
        "value": "Sinal do 'Grão de Café' / 'U Invertido' à Radiografia de Abdome e Volvo de Sigmoide"
      },
      {
        "letter": "D",
        "label": "Volvo de Sigmoide e Ceco",
        "value": "Descompressão Endoscópica por Colonoscopia seguida de Sigmoidectomia Eletiva vs Cirurgia de Emergência se Isquemia"
      }
    ],
    "rule": "Consenso CBC / Colégio Brasileiro de Cirurgiões: O diagnóstico de apendicite aguda no adulto jovem típico é essencialmente clínico; exames de imagem (TC com contraste ou USG) são reservados para casos duvidosos, mulheres em idade fértil e idosos.",
    "bancaTrap": "Na colecistite aguda litiásica, o sinal de Murphy (interrupção brusca da inspiração à palpação do ponto cístico) é positivo; amilase levemente elevada pode ocorrer por contiguidade sem configurar pancreatite.",
    "imageUrl": "/images/medical/obstrucao_delgado_rx.webp",
    "imageCaption": "Radiografia simples de abdome em ortostase: múltiplos níveis hidroaéreos centrais e padrão de empilhamento de moedas por obstrução de intestino delgado.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Igboeze",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:1._Bowel-obstruction-x-ray.jpg"
  },
  {
    "id": "tip-ciru-131-abdome-agudo-perfurativo",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Abdome Agudo Perfurativo",
    "fullTitle": "Abdome Agudo Perfurativo (Abdome Agudo Cirúrgico • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Perfurativo",
    "subfocos": [
      "Úlcera Péptica Perfurada (Gástrica e Duodenal)",
      "Perfuração de Cólon e Corpo Estranho Gastrointestinal"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Hiperagudo",
        "value": "Dor Súbita Lancinante em Facada com Abdome em Tábua e Pneumoperitônio (Sinal de Jobert)"
      },
      {
        "letter": "B",
        "label": "Tratamento Cirúrgico",
        "value": "Laparotomia / Laparoscopia com Úlcerorrafia e Patch de Omento (Manobra de Graham)"
      },
      {
        "letter": "C",
        "label": "Perfuração de Cólon e Corpo Estranho Gastrointestinal",
        "value": "Perfuração de Divertículo, Neoplasia ou Pós-Colonoscopia com Pneumoperitônio e Peritonite Fecaloide"
      },
      {
        "letter": "D",
        "label": "Perfuração de Cólon e Corpo Estranho Gastrointestinal",
        "value": "Ressuscitação Volêmica Agressiva, Antibioticoterapia de Amplo Espectro e Laparotomia com Ressecção e Estoma"
      }
    ],
    "rule": "Diretriz oficial de Abdome Agudo Cirúrgico (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Quadro Hiperagudo) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Abdome Agudo Perfurativo e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/pneumoperitonio_rx.webp",
    "imageCaption": "Radiografia de tórax e cúpulas diafragmáticas em ortostase: sinal do crescente gasoso subdiafragmático confirmando perfuração de víscera oca.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Cerevisae",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Chest_X-ray_showing_presence_of_free_air_under_left_diaphragm.png"
  },
  {
    "id": "tip-ciru-132-abdome-agudo-vascular",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Abdome Agudo Vascular",
    "fullTitle": "Abdome Agudo Vascular (Abdome Agudo Cirúrgico • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Vascular",
    "subfocos": [
      "Isquemia Mesentérica Aguda (Embolia e Trombose Arterial)",
      "Isquemia Mesentérica Não Oclusiva (IMNO) e Trombose Venosa Mesentérica",
      "Colite Isquêmica"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Isquemia Mesentérica Aguda (Embolia e Trombose Arterial)",
        "value": "Dor Abdominal Desproporcional aos Achados do Exame Físico Inicial em Cardiopatas com Fibrilação Atrial"
      },
      {
        "letter": "B",
        "label": "Evolução Tardia",
        "value": "Acidose Láctica Grave, Distensão Abdominal e Sinais de Necrose de Alça / Peritonite"
      },
      {
        "letter": "C",
        "label": "IMNO em Pacientes Críticos em Choque em Uso de Vasopressores em Altas Doses",
        "value": "Infusão de Vasodilatadores Intra- arteriais"
      },
      {
        "letter": "D",
        "label": "Trombose Venosa Mesentérica em Pacientes com Trombofilias",
        "value": "Anticoagulação Plena com Heparina"
      }
    ],
    "rule": "Diretriz oficial de Abdome Agudo Cirúrgico (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Isquemia Mesentérica Aguda (Embolia e Trombose Arterial)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Abdome Agudo Vascular e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-133-abdome-agudo-hemorragico",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Abdome Agudo Hemorrágico",
    "fullTitle": "Abdome Agudo Hemorrágico (Abdome Agudo Cirúrgico • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Hemorrágico",
    "subfocos": [
      "Rotura de Aneurisma de Aorta Abdominal (AAA)",
      "Rotura de Cisto Ovariano Hemorrágico e Gravidez Ectópica Rota Cirúrgica",
      "Rotura Espontânea de Neoplasias Hepáticas (Adenoma e Hepatocarcinoma)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Clássica",
        "value": "Dor Lombar/Abdominal Súbita Intensa, Hipotensão/Choque e Massa Abdominal Pulsátil Palpável"
      },
      {
        "letter": "B",
        "label": "Conduta na Instabilidade Hemodinâmica",
        "value": "Laparotomia Imediata com Clampeamento Aórtico Supra/Infrarrenal vs Reparo Endovascular (EVAR)"
      },
      {
        "letter": "C",
        "label": "Choque Hemorrágico Ginecológico-Cirúrgico com Sinal de Proust",
        "value": "Abaulamento e Dor Excruciante no Fundo de Saco de Douglas"
      },
      {
        "letter": "D",
        "label": "Rotura de Cisto Ovariano Hemorrágico e Gravidez Ectópica Rota Cirúrgica",
        "value": "Tratamento Cirúrgico por Laparoscopia / Salpingectomia de Emergência"
      }
    ],
    "rule": "Diretriz oficial de Abdome Agudo Cirúrgico (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tríade Clássica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Abdome Agudo Hemorrágico e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-134-cancer-gastrico",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Câncer Gástrico",
    "fullTitle": "Câncer Gástrico (Cirurgia do Trato Gastrointestinal Alto • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Câncer Gástrico (Adenocarcinoma e GIST)",
    "subfocos": [
      "Adenocarcinoma Gástrico e Classificação de Lauren",
      "Estadiamento e Tratamento Cirúrgico com Linfadenectomia D2"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação Histológica de Lauren",
        "value": "Tipo Intestinal (Idosos, Homens, Diferenciado, Relação com Gastrite Atrófica / *H. pylori*) vs Tipo Difuso (Jovens, Mulheres, Células em Anel de Sinete, Hereditário, Pior Prognóstico)"
      },
      {
        "letter": "B",
        "label": "Sinais de Incurabilidade / Metástases à Distância",
        "value": "Linfonodo de Virchow (Supraclavicular Esquerdo), Linfonodo de Irish (Axilar Esquerdo), Nódulo da Irmã Maria José (Umbilical), Prateleira de Blumer e Tumor de Krukenberg"
      },
      {
        "letter": "C",
        "label": "Indicação de Gastrectomia Subtotal",
        "value": "Lesões Distais / Antrais com Margem de Segurança >= 5 cm) vs Total (Lesões Proximais / Corpo Alto / Tipo Difuso"
      },
      {
        "letter": "D",
        "label": "Tumores Estromais Gastrointestinais (GIST)",
        "value": "Origem nas Células de Cajal, Marcador c-KIT / CD117 Positivo e Terapia com Imatinibe"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia do Trato Gastrointestinal Alto (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação Histológica de Lauren) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Câncer Gástrico e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-135-ulcera-peptica-e-complica",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Úlcera Péptica e Complicações Cirúrgicas",
    "fullTitle": "Úlcera Péptica e Complicações Cirúrgicas (Cirurgia do Trato Gastrointestinal Alto • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Úlcera Péptica e Complicações Cirúrgicas (Sangramento e Estenose)",
    "subfocos": [
      "Complicações Cirúrgicas da Doença Ulcerosa Péptica",
      "Síndromes Pós-Gastrectomia"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estenose Pilórica Cicatricial",
        "value": "Vômitos Pós-Prandiais Tardios de Alimentos Não Digeridos, Alcalose Metabólica Hipoclorêmica e Hipocalêmica"
      },
      {
        "letter": "B",
        "label": "Hemorragia Digestiva Refratária a Tratamento Endoscópico",
        "value": "Indicações de Cirurgia de Urgência"
      },
      {
        "letter": "C",
        "label": "Técnicas de Reconstrução",
        "value": "Billroth I (Gastroduodenostomia), Billroth II (Gastrojejunostomia com Alça Aferente) e Y de Roux"
      },
      {
        "letter": "D",
        "label": "Síndrome de Dumping Precoce",
        "value": "Sintomas Vasomotores e Gastrointestinais 20-30 min pós-dieta hiperosmolar) vs Tardia (Hipoglicemia Reativa 2-3h pós-refeição"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia do Trato Gastrointestinal Alto (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Estenose Pilórica Cicatricial) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Úlcera Péptica e Complicações Cirúrgicas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-136-doenca-do-refluxo-gastroe",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica",
    "fullTitle": "Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica (Cirurgia do Trato Gastrointestinal Alto • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica",
    "subfocos": [
      "Indicações de Tratamento Cirúrgico da DRGE",
      "Fundoplicatura Laparoscópica (Técnicas)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Indicações de Tratamento Cirúrgico da DRGE",
        "value": "Gastrite por Refluxo Biliar / Alcalino e Síndrome da Alça Aferente"
      },
      {
        "letter": "B",
        "label": "Indicações de Tratamento Cirúrgico da DRGE",
        "value": "Pacientes Jovens Refratários a IBP, Intolerantes à Medicação, com Grandes Hérnias de Hiato ou Complicações Respiratórias Recorrentes"
      },
      {
        "letter": "C",
        "label": "Exames Pré-Operatórios Obrigatórios",
        "value": "EDA, Esofagomanometria (Avaliar Motilidade do Corpo Esofágico) e pHmetria de 24 Horas"
      },
      {
        "letter": "D",
        "label": "Fundoplicatura Total a Nissen",
        "value": "360° - Indicada se Motilidade Esofágica Normal"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia do Trato Gastrointestinal Alto (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Indicações de Tratamento Cirúrgico da DRGE) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-137-megaesofago-e-acalasia",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Megaesôfago e Acalasia",
    "fullTitle": "Megaesôfago e Acalasia (Cirurgia do Trato Gastrointestinal Alto • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Megaesôfago e Acalasia",
    "subfocos": [
      "Fisiopatologia e Diagnóstico da Acalasia",
      "Classificação Radiológica de Rezende e Tratamento"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia e Diagnóstico da Acalasia",
        "value": "Disfagia de Transferência Lenta e Progressiva para Sólidos e Líquidos associada a Regurgitação e Perda Ponderal"
      },
      {
        "letter": "B",
        "label": "Esofagograma Baritado",
        "value": "Sinal do \"Bico de Pássaro\" ou \"Chama de Vela"
      },
      {
        "letter": "C",
        "label": "Graus de Rezende",
        "value": "Grupo I (Até 4 cm), Grupo II (4 a 7 cm), Grupo III (7 a 10 cm), Grupo IV (Dolicomegaesôfago > 10 cm)"
      },
      {
        "letter": "D",
        "label": "Tratamento de Escolha para Grupos II e III",
        "value": "Cardiomiotomia a Heller associada a Fundoplicatura Antirrefluxo Parcial Videolaparoscópica"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia do Trato Gastrointestinal Alto (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Fisiopatologia e Diagnóstico da Acalasia) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Megaesôfago e Acalasia e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-138-cancer-de-esofago",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Câncer de Esôfago",
    "fullTitle": "Câncer de Esôfago (Cirurgia do Trato Gastrointestinal Alto • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Câncer de Esôfago",
    "subfocos": [
      "Carcinoma Espinocelular (CEC) vs Adenocarcinoma",
      "Estadiamento e Tratamento Cirúrgico"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "CEC de Esôfago",
        "value": "Terço Médio e Superior, Associação Forte com Tabagismo e Etilismo"
      },
      {
        "letter": "B",
        "label": "Adenocarcinoma de Esôfago",
        "value": "Terço Inferior e Junção Esofagogástrica, Relação Direta com DRGE Crônica e Esôfago de Barrett"
      },
      {
        "letter": "C",
        "label": "Ecoendoscopia",
        "value": "Ultrassom Endoscópico) para Avaliação de Profundidade Tumoral (T) e Linfonodos (N"
      },
      {
        "letter": "D",
        "label": "Quimiorradioterapia Neoadjuvante seguida de Esofagectomia Transtorácica",
        "value": "Ivor Lewis ou McKeown"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia do Trato Gastrointestinal Alto (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (CEC de Esôfago) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Câncer de Esôfago e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-139-cirurgia-bariatrica-e-met",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Cirurgia Bariátrica e Metabólica",
    "fullTitle": "Cirurgia Bariátrica e Metabólica (Cirurgia do Trato Gastrointestinal Alto • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Cirurgia Bariátrica e Metabólica",
    "subfocos": [
      "Indicações Formais e Critérios do CFM",
      "Técnicas Cirúrgicas e Complicações"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Indicações Formais e Critérios do CFM",
        "value": "Cirurgia Metabólica para Diabéticos Tipo 2 com IMC >= 30 kg/m2 sem Resposta Clínica Otimizada"
      },
      {
        "letter": "B",
        "label": "Bypass Gástrico em Y de Roux (Fobi-Capella)",
        "value": "Misto Restritivo e Disabsortivo Leve (Excelente para DRGE e Diabetes)"
      },
      {
        "letter": "C",
        "label": "Gastrectomia Vertical / Sleeve",
        "value": "Restritivo Puro (Risco de Agravamento de DRGE)"
      },
      {
        "letter": "D",
        "label": "Complicações Agudas Graves",
        "value": "Fístula da Linha de Grampeamento (Taquicardia Sustentada > 120 bpm como Primeiro Sinal de Alarme), Embolia Pulmonar e Hérnia Interna de Petersen"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia do Trato Gastrointestinal Alto (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Indicações Formais e Critérios do CFM) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Cirurgia Bariátrica e Metabólica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-140-colelitiase-e-coledocolit",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Colelitíase e Coledocolitíase",
    "fullTitle": "Colelitíase e Coledocolitíase (Cirurgia Hepato-Bilio-Pancreática • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Colelitíase e Coledocolitíase",
    "subfocos": [
      "Colelitíase Sintomática e Indicações Cirúrgicas",
      "Coledocolitíase: Diagnóstico e Estratégia Terapêutica"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Cólica Biliar Típica",
        "value": "Dor em HCD Pós-Prandial Gordurosa com Duração Curta (< 6 Horas) sem Sinais Sistêmicos"
      },
      {
        "letter": "B",
        "label": "Indicações de Colecistectomia em Assintomáticos",
        "value": "Vesícula em Porcelana, Pólipos Biliares > 1 cm, Associação com Coledocolitíase ou Anemia Hemolítica"
      },
      {
        "letter": "C",
        "label": "Critérios Preditivos da ASGE",
        "value": "Muito Alto Risco (Cálculo Visualizado na USG, Colangite ou Bilirrubina > 4 com Colédoco Dilatado > 6 mm)"
      },
      {
        "letter": "D",
        "label": "Conduta em Alto Risco",
        "value": "CPRE (Colangiopancreatografia Retrógrada Endoscópica) Pré-Operatória com Papilotomia e Retirada dos Cálculos"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Hepato-Bilio-Pancreática (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Cólica Biliar Típica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Colelitíase e Coledocolitíase e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/colecistite_usg.webp",
    "imageCaption": "Ultrassonografia de abdome superior: cálculo impactado no colo da vesícula biliar, espessamento parietal (> 4 mm) e líquido perivesicular.",
    "imageModality": "usg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Cerevisae",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Acute_cholecystitis_as_seen_on_ultrasound_axial_view.jpg"
  },
  {
    "id": "tip-ciru-141-colangite-aguda",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Colangite Aguda",
    "fullTitle": "Colangite Aguda (Cirurgia Hepato-Bilio-Pancreática • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Colangite Aguda (Tríade de Charcot e Pêntade de Reynolds)",
    "subfocos": [
      "Colangite Aguda Não Supurativa (Tríade de Charcot)",
      "Colangite Aguda Grave Supurativa (Pêntade de Reynolds)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Colangiorressonância Magnética",
        "value": "CPRM"
      },
      {
        "letter": "B",
        "label": "Tríade de Charcot",
        "value": "Dor em Hipocôndrio Direito, Febre com Calafrios e Icterícia"
      },
      {
        "letter": "C",
        "label": "Colangite Aguda Não Supurativa (Tríade de Charcot)",
        "value": "Antibioticoterapia Venosa de Amplo Espectro com Cobertura para Gram-Negativos e Enterococos"
      },
      {
        "letter": "D",
        "label": "Pêntade de Reynolds",
        "value": "Tríade de Charcot associada a Choque Séptico / Hipotensão e Rebaixamento do Nível de Consciência / Confusão Mental"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Hepato-Bilio-Pancreática (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Colangiorressonância Magnética) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Colangite Aguda e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-142-neoplasias-malignas-da-ve",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Neoplasias Malignas da Vesícula e Vias Biliares",
    "fullTitle": "Neoplasias Malignas da Vesícula e Vias Biliares (Cirurgia Hepato-Bilio-Pancreática • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Neoplasias Malignas da Vesícula e Vias Biliares (Colangiocarcinoma)",
    "subfocos": [
      "Colangiocarcinoma e Tumor de Klatskin",
      "Câncer de Vesícula Biliar"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tumor de Klatskin",
        "value": "Colangiocarcinoma Peri-Hilar na Confluência dos Ductos Hepáticos Direito e Esquerdo"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico",
        "value": "Icterícia Colestática Progressiva Indolor com Prurido Intenso e Vesícula Biliar Murcha / Não Palpável"
      },
      {
        "letter": "C",
        "label": "Classificação de Bismuth-Corlette",
        "value": "Tipos I a IV"
      },
      {
        "letter": "D",
        "label": "Câncer de Vesícula Biliar",
        "value": "Achado Incidental Frequente Pós-Colecistectomia por Colelitíase"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Hepato-Bilio-Pancreática (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tumor de Klatskin) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Neoplasias Malignas da Vesícula e Vias Biliares e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-143-tumores-hepaticos-benigno",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Tumores Hepáticos Benignos e Malignos",
    "fullTitle": "Tumores Hepáticos Benignos e Malignos (Cirurgia Hepato-Bilio-Pancreática • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Tumores Hepáticos Benignos e Malignos (Carcinoma Hepatocelular e Metástases)",
    "subfocos": [
      "Tumores Benignos do Fígado (Hemangioma, HNF e Adenoma)",
      "Carcinoma Hepatocelular (CHC) e Critérios de Milão"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hemangioma Cavernoso",
        "value": "Tumor Hepático Mais Comum, Captação Nodular Periférica Globuliforme na Fase Arterial com Preenchimento Centrípeto Lento"
      },
      {
        "letter": "B",
        "label": "Hiperplasia Nodular Focal (HNF)",
        "value": "Cicatriz Estrelada Central Típica à Imagem, Conduta Expectante"
      },
      {
        "letter": "C",
        "label": "Adenoma Hepático",
        "value": "Risco de Sangramento e Degeneração Maligna em Mulheres Jovens sob Uso de ACO; Indicação Cirúrgica se Sintomático, Tamanho > 5 cm ou Homens"
      },
      {
        "letter": "D",
        "label": "Tumores Benignos do Fígado (Hemangioma, HNF e Adenoma)",
        "value": "Desenvolvimento quase Exclusivo em Fígado Cirrótico; Rastreamento Semestral com Ultrassonografia e Alfa-Fetoproteína"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Hepato-Bilio-Pancreática (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Hemangioma Cavernoso) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Tumores Hepáticos Benignos e Malignos e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-144-abscessos-hepaticos",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Abscessos Hepáticos",
    "fullTitle": "Abscessos Hepáticos (Cirurgia Hepato-Bilio-Pancreática • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Abscessos Hepáticos (Amebiano e Piogênico)",
    "subfocos": [
      "Abscesso Hepático Piogênico vs Amebiano",
      "Cisto Hidático Hepático (Equinococose)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Abscesso Piogênico",
        "value": "Múltiplo, Idosos, Origem Biliar / Pyleflebite (*E. coli*, *Klebsiella*); Tratamento com Antibióticos EV e Drenagem Percutânea Guiada por USG/TC"
      },
      {
        "letter": "B",
        "label": "Abscesso Amebiano (*Entamoeba histolytica*)",
        "value": "Homens Jovens, Lesão Única em Lobo Direito com Conteúdo em \"Pasta de Anchova\"; Tratamento Primário Clínico com Metronidazol (Raramente Requer Cirurgia)"
      },
      {
        "letter": "C",
        "label": "Cisto Hidático Hepático (Equinococose)",
        "value": "Contaminação por *Echinococcus granulosus*, Calcificação em Casca de Ovo e Cistos Filhos"
      },
      {
        "letter": "D",
        "label": "Cuidado Cirúrgico com Risco de Ruptura e Choque Anafilático",
        "value": "Técnica PAIR"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Hepato-Bilio-Pancreática (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Abscesso Piogênico) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Abscessos Hepáticos e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-145-neoplasias-do-pancreas",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Neoplasias do Pâncreas",
    "fullTitle": "Neoplasias do Pâncreas (Cirurgia Hepato-Bilio-Pancreática • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Neoplasias do Pâncreas (Adenocarcinoma e Neoplasias Císticas)",
    "subfocos": [
      "Adenocarcinoma de Cabeça de Pâncreas",
      "Neoplasias Císticas do Pâncreas (IPMN, Cistoadenoma)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Típica",
        "value": "Icterícia Colestática Indolor Flutuante/Progressiva, Perda Ponderal Acentuada e Vesícula Biliar Palpável e Indolor (Sinal de Courvoisier-Terrier)"
      },
      {
        "letter": "B",
        "label": "Marcador Tumoral CA 19-9 para Acompanhamento e Avaliação de Ressecabilidade Vascular na TC com Contraste",
        "value": "Artéria Mesentérica Superior, Tronco Celíaco"
      },
      {
        "letter": "C",
        "label": "Tratamento Cirúrgico Curativo",
        "value": "Gastroduodenopancreatectomia (Cirurgia de Whipple)"
      },
      {
        "letter": "D",
        "label": "IPMN (Neoplasia Mucinosa Papilar Intraductal)",
        "value": "Dilatação do Ducto Pancreático Principal ou Ramos com Saída de Muco pela Papila"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Hepato-Bilio-Pancreática (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tríade Típica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Neoplasias do Pâncreas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-146-cistos-e-anomalias-congen",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Cistos e Anomalias Congênitas da Via Biliar",
    "fullTitle": "Cistos e Anomalias Congênitas da Via Biliar (Cirurgia Hepato-Bilio-Pancreática • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Cistos e Anomalias Congênitas da Via Biliar",
    "subfocos": [
      "Cistos de Colédoco e Classificação de Todani",
      "Doença de Caroli (Todani Tipo V)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação de Todani (Tipos I a V)",
        "value": "Tipo I (Dilatação Fusiforme do Colédoco) como Mais Comum"
      },
      {
        "letter": "B",
        "label": "Cistos de Colédoco e Classificação de Todani",
        "value": "Risco Significativo de Degeneração para Colangiocarcinoma; Indicação de Ressecção Completa do Cisto com Hepatojejunostomia em Y de Roux"
      },
      {
        "letter": "C",
        "label": "Doença de Caroli (Todani Tipo V)",
        "value": "Dilatações Císticas Saculares Intra-Hepáticas Congênitas associadas a Fibrose Hepática Congênita e Litíase Intra-Hepática Recorrente"
      },
      {
        "letter": "D",
        "label": "Doença de Caroli (Todani Tipo V)",
        "value": "Risco de Colangite de Repetição e Indicação de Transplante Hepático em Formas Difusas Bilaterais"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Hepato-Bilio-Pancreática (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação de Todani (Tipos I a V)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Cistos e Anomalias Congênitas da Via Biliar e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-147-cancer-de-colon",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Câncer de Cólon",
    "fullTitle": "Câncer de Cólon (Coloproctologia e Doenças Orificiais • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Câncer de Cólon",
    "subfocos": [
      "Quadro Clínico por Topografia (Cólon Direito vs Esquerdo)",
      "Tratamento Cirúrgico Oncológico do Câncer de Cólon"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Câncer de Cólon Direito (Ceco / Ascendente)",
        "value": "Anemia Ferropriva Oculta, Fadiga, Massa Palpável em FID e Sangramento Oculto nas Fezes"
      },
      {
        "letter": "B",
        "label": "Câncer de Cólon Esquerdo (Descendente / Sigmoide)",
        "value": "Mudança do Hábito Intestinal, Fezes em Fita, Obstrução Intestinal e Hematoquezia"
      },
      {
        "letter": "C",
        "label": "Tratamento Cirúrgico Oncológico do Câncer de Cólon",
        "value": "Rastreamento Populacional com Colonoscopia a partir dos 45-50 Anos"
      },
      {
        "letter": "D",
        "label": "Colectomia com Ligadura Vascular na Origem e Linfadenectomia Obrigatória",
        "value": "Mínimo de 12 Linfonodos Avaliados"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-ciru-148-cancer-de-reto-e-canal-an",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Câncer de Reto e Canal Anal",
    "fullTitle": "Câncer de Reto e Canal Anal (Coloproctologia e Doenças Orificiais • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Câncer de Reto e Canal Anal",
    "subfocos": [
      "Câncer de Reto: Terapia Neoadjuvante e Margem Distal",
      "Câncer de Canal Anal (Carcinoma Epidermoide)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hemicolectomia Direita",
        "value": "Artérias Ileocólica e Cólica Direita) vs Hemicolectomia Esquerda (Artéria Cólica Esquerda"
      },
      {
        "letter": "B",
        "label": "Indicações de Quimioterapia Adjuvante",
        "value": "Estágio III (Linfonodo Positivo) e Estágio II de Alto Risco"
      },
      {
        "letter": "C",
        "label": "Quimiorradioterapia Neoadjuvante Padrão para Tumores T3/T4 ou Linfonodos Positivos",
        "value": "N+"
      },
      {
        "letter": "D",
        "label": "Ressecção Anterior Baixa",
        "value": "RAB) com Excisão Total do Mesorreto (ETM"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-ciru-149-doenca-hemorroidaria",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doença Hemorroidária",
    "fullTitle": "Doença Hemorroidária (Coloproctologia e Doenças Orificiais • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Doença Hemorroidária",
    "subfocos": [
      "Hemorroidas Internas e Classificação em Graus I a IV",
      "Tratamento Cirúrgico e Trombose Hemorroidária Externa"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Relação Etiológica Direta com Infecção pelo Papilomavírus Humano",
        "value": "HPV"
      },
      {
        "letter": "B",
        "label": "Grau I",
        "value": "Sangramento sem Prolapso); Grau II (Prolapso com Redução Espontânea); Grau III (Prolapso que Exige Redução Manual); Grau IV (Prolapso Irredutível / Estrangulamento"
      },
      {
        "letter": "C",
        "label": "Tratamento não Cirúrgico e Ambulatorial",
        "value": "Dieta Rica em Fibras, Banho de Assento e Ligadura Elástica (Padrão para Graus II e III)"
      },
      {
        "letter": "D",
        "label": "Hemorroidectomia Aberta",
        "value": "Milligan-Morgan) vs Fechada (Ferguson"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-ciru-150-fissura-anal",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Fissura Anal",
    "fullTitle": "Fissura Anal (Coloproctologia e Doenças Orificiais • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Fissura Anal",
    "subfocos": [
      "Fissura Anal Aguda vs Crônica",
      "Tratamento Clínico e Esfincterotomia"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fissura Anal Aguda vs Crônica",
        "value": "Dor Perianal Intensa em \"Rasgo\" Durante e após a Evacuação associada a Sangramento Vermelho Vivo no Papel Higiênico"
      },
      {
        "letter": "B",
        "label": "Tríade da Fissura Crônica",
        "value": "Plicoma Sentinela, Úlcera com Fibras do Esfíncter Interno Expostas e Papila Anal Hipertrófica"
      },
      {
        "letter": "C",
        "label": "Localização Mais Comum",
        "value": "Linha Média Posterior (90%)"
      },
      {
        "letter": "D",
        "label": "Tratamento Conservador de 1ª Linha",
        "value": "Pomadas de Nitratos (Dinitrato de Isossorbida) ou Bloqueadores de Canais de Cálcio Tópicos (Diltiazem / Nifedipino)"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-ciru-151-abscessos-anorretais-e-fi",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Abscessos Anorretais e Fístulas",
    "fullTitle": "Abscessos Anorretais e Fístulas (Coloproctologia e Doenças Orificiais • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Abscessos Anorretais e Fístulas",
    "subfocos": [
      "Abscesso Perianal e Isquiorretal",
      "Fístulas Anorretais e Regra de Goodsall-Salmon"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Teoria Criptoglandular",
        "value": "Obstrução e Infecção das Glândulas Anais de Chiari"
      },
      {
        "letter": "B",
        "label": "Conduta Imediata no Abscesso",
        "value": "Drenagem Cirúrgica sob Anestesia sem Aguardar Flutuação ou Antibioticoterapia Isolada"
      },
      {
        "letter": "C",
        "label": "Sequela Crônica Pós-Drenagem de Abscesso",
        "value": "Comunicação entre a Cripta Anal e a Pele Perianal"
      },
      {
        "letter": "D",
        "label": "Regra de Goodsall-Salmon",
        "value": "Orifício Externo Anterior -> Trajeto Retilíneo Radial; Orifício Externo Posterior -> Trajeto Curvo que Desemboca na Linha Média Posterior"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-ciru-152-doenca-pilonidal-sacrococ",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doença Pilonidal Sacrococcígea",
    "fullTitle": "Doença Pilonidal Sacrococcígea (Coloproctologia e Doenças Orificiais • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Doença Pilonidal Sacrococcígea",
    "subfocos": [
      "Quadro Clínico e Manejo da Crise Aguda",
      "Tratamento Definitivo da Doença Crônica"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Clínico e Manejo da Crise Aguda",
        "value": "Presença de Folículos Pilosos Infectados na Fenda Interglútea em Homens Jovens"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico e Manejo da Crise Aguda",
        "value": "Drenagem Cirúrgica Simples do Abscesso Agudo"
      },
      {
        "letter": "C",
        "label": "Excisão Cirúrgica Ampla dos Trajetos com Cicatrização por Segunda Intenção ou Fechamento com Retalhos",
        "value": "Técnica de Limberg / Karydakis"
      },
      {
        "letter": "D",
        "label": "Técnicas Minimamente Invasivas",
        "value": "Ablação Endoscópica a Laser (EPSiT) e Fechamento Primário com Retalho Fora da Linha Média"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-ciru-153-megacolon-chagasico-e-vol",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Megacólon Chagásico e Volvo de Sigmoide",
    "fullTitle": "Megacólon Chagásico e Volvo de Sigmoide (Coloproctologia e Doenças Orificiais • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Megacólon Chagásico e Volvo de Sigmoide",
    "subfocos": [
      "Megacólon Chagásico e Constipação Crônica",
      "Volvo de Sigmoide Recorrente"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Cirurgia Eletiva Programada Pós-Descompressão Endoscópica",
        "value": "Sigmoidectomia com Anastomose Primária"
      },
      {
        "letter": "B",
        "label": "Tratamento de Urgência no Volvo Isquêmico",
        "value": "Ressecção com Colostomia Terminal (Cirurgia de Hartmann)"
      },
      {
        "letter": "C",
        "label": "Parâmetro de Avaliação 3",
        "value": "Estratificação de gravidade e monitorização contínua de resposta terapêutica"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia.",
    "imageUrl": "/images/medical/volvo_sigmoide_rx.webp",
    "imageCaption": "Radiografia simples de abdome: dilatação colônica maciça com sinal do grão de café (ou U invertido) patognomônico de volvo de sigmoide.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Mont4nha",
    "imageLicense": "CC0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Sigmoidvolvulus.jpg"
  },
  {
    "id": "tip-ciru-154-prolapso-retal",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Prolapso Retal",
    "fullTitle": "Prolapso Retal (Coloproctologia e Doenças Orificiais • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Prolapso Retal",
    "subfocos": [
      "Prolapso Retal Completo vs Prolapso Mucoso",
      "Abordagem Cirúrgica Abdominal vs Perineal"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Prolapso Retal Completo vs Prolapso Mucoso",
        "value": "Eversão de Todas as Camadas da Parede Retal através do Ânus em Mulheres Idosas com Incontinência Fecal"
      },
      {
        "letter": "B",
        "label": "Prega Circular Concéntrica",
        "value": "Prolapso Completo) vs Prega Radial (Prolapso Mucoso / Hemorroidário"
      },
      {
        "letter": "C",
        "label": "Cirurgia Abdominal",
        "value": "Retopexia Ventral com Tela por Videolaparoscopia"
      },
      {
        "letter": "D",
        "label": "Cirurgia Perineal para Idosos Frágeis",
        "value": "Procedimento de Altemeier ou Delorme"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-ciru-155-hernia-inguinal",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hérnia Inguinal",
    "fullTitle": "Hérnia Inguinal (Hérnias e Parede Abdominal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnia Inguinal (Indireta e Direta)",
    "subfocos": [
      "Anatomia Cirúrgica e Diferenciação Indireta vs Direta",
      "Técnicas de Correção Cirúrgica (Herniorrafia)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hérnia Indireta",
        "value": "Causa Congênita por Patência do Conduto Peritoneovaginal, Passa pelo Anel Inguinal Profundo LATERAL aos Vasos Epigástricos Inferiores, Pode Descer à Bolsa Escrotal"
      },
      {
        "letter": "B",
        "label": "Hérnia Direta",
        "value": "Fraqueza da Fáscia Transversalis no Triângulo de Hesselbach MEDIAL aos Vasos Epigástricos Inferiores"
      },
      {
        "letter": "C",
        "label": "Limites do Triângulo de Hesselbach",
        "value": "Vasos Epigástricos Inferiores, Borda Lateral do Reto Abdominal e Ligamento Inguinal"
      },
      {
        "letter": "D",
        "label": "Técnicas Anatômicas sem Tela",
        "value": "Bassini, Shouldice e McVay"
      }
    ],
    "rule": "Diretriz oficial de Hérnias e Parede Abdominal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Hérnia Indireta) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hérnia Inguinal e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-156-hernia-femoral",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hérnia Femoral",
    "fullTitle": "Hérnia Femoral (Hérnias e Parede Abdominal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnia Femoral (Crural)",
    "subfocos": [
      "Anatomia e Risco Elevado de Estrangulamento",
      "Diagnóstico Diferencial da Massa Inguinocrural"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Anatomia e Risco Elevado de Estrangulamento",
        "value": "Mais Comum em Mulheres Idosas e Multíparas"
      },
      {
        "letter": "B",
        "label": "Localização Anatômica",
        "value": "Abaixo do Ligamento Inguinal, Medial à Veia Femoral no Canal Femoral"
      },
      {
        "letter": "C",
        "label": "Maior Índice de Estrangulamento entre Todas as Hérnias da Parede Abdominal",
        "value": "Indicação Cirúrgica Sempre Mandatória e Urgente"
      },
      {
        "letter": "D",
        "label": "Técnica Cirúrgica de McVay",
        "value": "Fixação no Ligamento de Cooper"
      }
    ],
    "rule": "Diretriz oficial de Hérnias e Parede Abdominal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Anatomia e Risco Elevado de Estrangulamento) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hérnia Femoral e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-157-hernia-incisional-e-evisc",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hérnia Incisional e Evisceração",
    "fullTitle": "Hérnia Incisional e Evisceração (Hérnias e Parede Abdominal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnia Incisional e Evisceração",
    "subfocos": [
      "Fatores de Risco e Correção da Hérnia Incisional",
      "Evisceração Pós-Operatória Aguda"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fatores Predisponentes",
        "value": "Infecção do Sítio Cirúrgico, Obesidade, Tabagismo, DM e Técnica Inadequada de Fechamento"
      },
      {
        "letter": "B",
        "label": "Uso Obrigatório de Tela de Reforço com Sobreposição Ampla",
        "value": "Overlap >= 5 cm"
      },
      {
        "letter": "C",
        "label": "Técnicas de Separação de Componentes",
        "value": "Técnica de Ramirez e TAR"
      },
      {
        "letter": "D",
        "label": "Evisceração Pós-Operatória Aguda",
        "value": "Deiscência Completa de Parede com Saída de Alças Intestinais para Fora da Cavidade"
      }
    ],
    "rule": "Diretriz oficial de Hérnias e Parede Abdominal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Fatores Predisponentes) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hérnia Incisional e Evisceração e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-158-hernia-umbilical-e-epigas",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hérnia Umbilical e Epigástrica",
    "fullTitle": "Hérnia Umbilical e Epigástrica (Hérnias e Parede Abdominal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnia Umbilical e Epigástrica",
    "subfocos": [
      "Hérnia Umbilical no Adulto vs na Criança",
      "Hérnia Epigástrica e Diástase dos Retos"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Emergência Cirúrgica",
        "value": "Cobertura Provisória com Compressas Estéreis Úmidas e Reoperação Imediata"
      },
      {
        "letter": "B",
        "label": "Hérnia Umbilical no Adulto",
        "value": "Adquirida (Gravidez, Obesidade, Ascite Cirrótica), Baixo Índice de Fechamento Espontâneo, Uso de Tela se Defeito > 1-2 cm"
      },
      {
        "letter": "C",
        "label": "Hérnia Umbilical na Criança",
        "value": "Fechamento Espontâneo na Grande Maioria até os 4 a 5 Anos de Idade; Aguardar Cirurgia exceto se Defeito > 2 cm ou Estrangulamento"
      },
      {
        "letter": "D",
        "label": "Hérnia Epigástrica",
        "value": "Defeito na Linha Alba entre o Xifoide e o Umbigo com Encarceramento Frequente de Gordura Pré- Peritoneal"
      }
    ],
    "rule": "Diretriz oficial de Hérnias e Parede Abdominal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Emergência Cirúrgica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hérnia Umbilical e Epigástrica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-159-hernias-raras",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Hérnias Raras",
    "fullTitle": "Hérnias Raras (Hérnias e Parede Abdominal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnias Raras (Spiegel, Obturadora, Lombar)",
    "subfocos": [
      "Hérnia de Spiegel, Obturadora e Lombares",
      "Hérnias Especiais com Conteúdo Específico"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hérnia de Spiegel",
        "value": "Defeito na Linha Semilunar de Spiegel (Borda Lateral do Reto com Linha Arqueada de Douglas)"
      },
      {
        "letter": "B",
        "label": "Hérnia Obturadora",
        "value": "Típica em Idosas Emagrecidas, Sinal de Howship-Romberg (Dor na Face Medial da Coxa que Piora com Extensão e Adução por Compressão do Nervo Obturador)"
      },
      {
        "letter": "C",
        "label": "Hérnias Lombares",
        "value": "Petit (Trígono Lombar Inferior) e Grynfelt (Trígono Lombar Superior)"
      },
      {
        "letter": "D",
        "label": "Hérnia de Littré",
        "value": "Contém o Divertículo de Meckel no Saco Herniário"
      }
    ],
    "rule": "Diretriz oficial de Hérnias e Parede Abdominal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Hérnia de Spiegel) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hérnias Raras e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-160-hernias-estranguladas-e-e",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Hérnias Estranguladas e Encarceradas",
    "fullTitle": "Hérnias Estranguladas e Encarceradas (Hérnias e Parede Abdominal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnias Estranguladas e Encarceradas",
    "subfocos": [
      "Diferenciação Encarceramento vs Estrangulamento",
      "Conduta Cirúrgica de Emergência"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hérnia de Richter",
        "value": "Pinçamento da Borda Antimesentérica da Alça com Estrangulamento sem Obstrução Mecânica Completa"
      },
      {
        "letter": "B",
        "label": "Hérnia Encarcerada",
        "value": "Irredutibilidade sem Sofrimento Vascular Isquêmico"
      },
      {
        "letter": "C",
        "label": "Hérnia Estrangulada",
        "value": "Isquemia e Necrose da Alça, Dor Intensa Súbita, Hiperemia Cutânea Local, Febre e Sinais Sistêmicos"
      },
      {
        "letter": "D",
        "label": "Contraindicação Formal de Redução Manual Forçada",
        "value": "Manobra de Taxis"
      }
    ],
    "rule": "Diretriz oficial de Hérnias e Parede Abdominal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Hérnia de Richter) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hérnias Estranguladas e Encarceradas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-161-avaliacao-de-risco-cirurg",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Avaliação de Risco Cirúrgico e Cardiopulmonar",
    "fullTitle": "Avaliação de Risco Cirúrgico e Cardiopulmonar (Princípios Cirúrgicos e Cuidados Perioperatórios • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Avaliação de Risco Cirúrgico e Cardiopulmonar",
    "subfocos": [
      "Escores Cardiovasculares (Índice de Lee / RCRI)",
      "Classificação do Estado Físico ASA"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Os 6 Fatores do Índice de Risco Cardíaco Revisado (RCRI / Lee)",
        "value": "Cirurgia de Alto Risco, Doença Isquêmica do Coração, Insuficiência Cardíaca, Doença Cerebrovascular, DM em Uso de Insulina, Creatinina > 2 mg/dL"
      },
      {
        "letter": "B",
        "label": "Classificação da Capacidade Funcional em Equivalentes Metabólicos",
        "value": "METs >= 4 Indica Boa Reserva Funcional"
      },
      {
        "letter": "C",
        "label": "ASA I",
        "value": "Hígido), ASA II (Doença Sistêmica Leve sem Limitação), ASA III (Doença Sistêmica Grave com Limitação Funcional), ASA IV (Doença Sistêmica Ameaçadora à Vida), ASA V (Moribundo), ASA VI (Morte Encefálica"
      },
      {
        "letter": "D",
        "label": "Classificação do Estado Físico ASA",
        "value": "Sufixo \"E\" Adicionado para Cirurgias de Emergência"
      }
    ],
    "rule": "Diretriz oficial de Princípios Cirúrgicos e Cuidados Perioperatórios (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Os 6 Fatores do Índice de Risco Cardíaco Revisado (RCRI / Lee)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Avaliação de Risco Cirúrgico e Cardiopulmonar e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-162-cicatrizacao-fisiologia-d",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Cicatrização, Fisiologia das Feridas e Queloides",
    "fullTitle": "Cicatrização, Fisiologia das Feridas e Queloides (Princípios Cirúrgicos e Cuidados Perioperatórios • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Cicatrização, Fisiologia das Feridas e Queloides",
    "subfocos": [
      "Fases da Cicatrização e Fatores de Interferência",
      "Cicatrizes Patológicas: Queloide vs Cicatriz Hipertrófica"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "As 3 Fases",
        "value": "Inflamatória (0-4 dias: Hemostasia, Neutrófilos e Macrófagos), Proliferativa (4-14 dias: Fibroblastos, Angiogênese e Síntese de Colágeno Tipo III), Remodelação (Semanas a Meses: Maturação e Substituição por Colágeno Tipo I)"
      },
      {
        "letter": "B",
        "label": "Fatores Sistêmicos que Prejudicam a Cicatrização",
        "value": "Tabagismo, Desnutrição / Hipoalbuminemia, Diabetes Descompensado, Uso de Corticoides e Deficiência de Vitamina C e Zinco"
      },
      {
        "letter": "C",
        "label": "Cicatriz Hipertrófica",
        "value": "Respeita os Limites da Ferida Original, Melhora Espontânea com o Tempo"
      },
      {
        "letter": "D",
        "label": "Queloide",
        "value": "Ultrapassa os Limites da Ferida Original, Não Regride Espontaneamente, Mais Comum em Negros, Tratamento com Injeção Intralesional de Triancinolona e Placas de Silicone"
      }
    ],
    "rule": "Diretriz oficial de Princípios Cirúrgicos e Cuidados Perioperatórios (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (As 3 Fases) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Cicatrização, Fisiologia das Feridas e Queloides e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-163-infeccao-de-sitio-cirurgi",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Infecção de Sítio Cirúrgico",
    "fullTitle": "Infecção de Sítio Cirúrgico (Princípios Cirúrgicos e Cuidados Perioperatórios • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Infecção de Sítio Cirúrgico (ISC) e Profilaxia Antibiótica",
    "subfocos": [
      "Classificação CDC da ISC e Cirurgias por Potencial de Contaminação",
      "Profilaxia Antibiótica em Cirurgia"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação Anatômica da ISC",
        "value": "Superficial (Pele e Subcutâneo), Profunda (Fáscia e Músculo) e de Órgão/Cavidade"
      },
      {
        "letter": "B",
        "label": "Manifestação Típica entre o 4º e o 7º Dia Pós-Operatório",
        "value": "Hiperemia, Dor, Edema e Drenagem Purulenta"
      },
      {
        "letter": "C",
        "label": "Antibiótico de Escolha na Maioria dos Procedimentos",
        "value": "Cefazolina (Cefalosporina de 1ª Geração)"
      },
      {
        "letter": "D",
        "label": "Momento Obrigatório da Administração",
        "value": "Até 60 Minutos Antes da Incisão da Pele (Na Indução Anestésica)"
      }
    ],
    "rule": "Diretriz oficial de Princípios Cirúrgicos e Cuidados Perioperatórios (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação Anatômica da ISC) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Infecção de Sítio Cirúrgico e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-164-complicacoes-pos-operator",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Complicações Pós-Operatórias",
    "fullTitle": "Complicações Pós-Operatórias (Princípios Cirúrgicos e Cuidados Perioperatórios • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Complicações Pós-Operatórias (Febre, Atelectasia, TVP/TEP, Deiscência)",
    "subfocos": [
      "Febre Pós-Operatória (Mnemônico dos 5 Ws)",
      "Prevenção e Profilaxia de TVP/TEP no Paciente Cirúrgico"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "7º Dia (Walking)",
        "value": "Trombose Venosa Profunda e TEP"
      },
      {
        "letter": "B",
        "label": "Qualquer Momento (Wonder drugs)",
        "value": "Febre Farmacológica"
      },
      {
        "letter": "C",
        "label": "Prevenção e Profilaxia de TVP/TEP no Paciente Cirúrgico",
        "value": "Estratificação de Risco pelo Escore de Caprini"
      },
      {
        "letter": "D",
        "label": "Profilaxia Mecânica",
        "value": "Meias Elásticas de Compressão Graduada e Compressão Pneumática Intermitente"
      }
    ],
    "rule": "Diretriz oficial de Princípios Cirúrgicos e Cuidados Perioperatórios (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (7º Dia (Walking)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Complicações Pós-Operatórias e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-165-resposta-endocrino-metabo",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Resposta Endócrino-Metabólica ao Trauma",
    "fullTitle": "Resposta Endócrino-Metabólica ao Trauma (Princípios Cirúrgicos e Cuidados Perioperatórios • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Resposta Endócrino-Metabólica ao Trauma (REMIT)",
    "subfocos": [
      "Fisiopatologia Hormonal e Mediadores da REMIT",
      "Protocolos Multimodais de Aceleração da Recuperação (ERAS / ACERTO)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Ativação do Eixo Simpático-Adrenal e Hormônios Contrarreguladores",
        "value": "Elevação de Cortisol, Glucagon, Catecolaminas, ADH e Aldosterona"
      },
      {
        "letter": "B",
        "label": "Protocolos Multimodais de Aceleração da Recuperação (ERAS / ACERTO)",
        "value": "Estado Hipercatabólico, Resistência Periférica à Insulina com Hiperglicemia de Estresse e Retenção Hídrica e Salina com Perda de Potássio"
      },
      {
        "letter": "C",
        "label": "Protocolos Multimodais de Aceleração da Recuperação (ERAS / ACERTO)",
        "value": "Abreviatura do Jejum Pré-Operatório com Bebidas Ricas em Carboidratos até 2 Horas Antes da Indução"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-166-tecnica-cirurgica-fios-e",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Técnica Cirúrgica, Fios e Drenos",
    "fullTitle": "Técnica Cirúrgica, Fios e Drenos (Princípios Cirúrgicos e Cuidados Perioperatórios • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Técnica Cirúrgica, Fios e Drenos",
    "subfocos": [
      "Fios Cirúrgicos (Absorvíveis vs Inabsorvíveis)",
      "Drenos Cirúrgicos (Laminares vs Sucção Fechada)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fios Cirúrgicos (Absorvíveis vs Inabsorvíveis)",
        "value": "Realimentação Oral Precoce, Não Uso Sistemático de Sondas e Drenos e Deambulação Precoce"
      },
      {
        "letter": "B",
        "label": "Fios Absorvíveis Sintéticos",
        "value": "Poliglactina / Vicryl (Trançado) e Polidioxanona / PDS (Monofilamentar - Ideal para Fáscia)"
      },
      {
        "letter": "C",
        "label": "Fios Inabsorvíveis",
        "value": "Náilon e Polipropileno / Prolene (Monofilamentar, Mínima Reação Tecidual, Ideal para Pele e Vasos)"
      },
      {
        "letter": "D",
        "label": "Catgut",
        "value": "Origem Animal, Reabsorção Rápida e Marcada Reação Inflamatória"
      }
    ],
    "rule": "Diretriz oficial de Princípios Cirúrgicos e Cuidados Perioperatórios (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Fios Cirúrgicos (Absorvíveis vs Inabsorvíveis)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Técnica Cirúrgica, Fios e Drenos e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-167-suporte-nutricional-no-pe",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Suporte Nutricional no Perioperatório",
    "fullTitle": "Suporte Nutricional no Perioperatório (Princípios Cirúrgicos e Cuidados Perioperatórios • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Suporte Nutricional no Perioperatório",
    "subfocos": [
      "Nutrição Enteral vs Parenteral no Paciente Cirúrgico",
      "Síndrome de Realimentação e Imunonutrição"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Regra de Ouro",
        "value": "\"Se o Intestino Funciona, Use-o\" (Nutrição Enteral Precoce Previne Translocação Bacteriana e Atrofia de Vilosidades)"
      },
      {
        "letter": "B",
        "label": "Indicações Formais de Nutrição Parenteral Total (NPT)",
        "value": "Íleo Prolongado Refratário, Fístula Enterocutânea de Alto Débito, Síndrome do Intestino Curto Extremo"
      },
      {
        "letter": "C",
        "label": "Síndrome de Realimentação",
        "value": "Hipofosfatemia Severa Aguda, Hipocalemia, Hipomagnesemia e Arritmias Cardíacas Pós- Reintrodução Rápida de Glicose em Desnutridos Crônicos"
      },
      {
        "letter": "D",
        "label": "Síndrome de Realimentação e Imunonutrição",
        "value": "Imunonutrição Pré-Operatória com Arginina e Ácidos Graxos Ômega-3"
      }
    ],
    "rule": "Diretriz oficial de Princípios Cirúrgicos e Cuidados Perioperatórios (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Regra de Ouro) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Suporte Nutricional no Perioperatório e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-168-doenca-arterial-obstrutiv",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doença Arterial Obstrutiva Periférica",
    "fullTitle": "Doença Arterial Obstrutiva Periférica (Doenças Vasculares Cirúrgicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Doença Arterial Obstrutiva Periférica (DAOP)",
    "subfocos": [
      "Fisiopatologia, Exame Físico e Classificação de Rutherford / Fontaine",
      "Tratamento Clínico de Otimização e Revascularização Cirúrgica / Endovascular"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estadiamento Clínico",
        "value": "Fontaine (I a IV: Claudicação Intermitente, Dor de Repouso e Úlcera Isquêmica) e Rutherford"
      },
      {
        "letter": "B",
        "label": "Índice Tornozelo-Braquial",
        "value": "ITB <= 0,9 Indica DAOP; ITB < 0,4 Isquemia Crítica"
      },
      {
        "letter": "C",
        "label": "Terapia Médica Padrão",
        "value": "Cessação do Tabagismo, Caminhada Supervisionada, Estatina de Alta Potência, AAS e Cilostazol"
      },
      {
        "letter": "D",
        "label": "Indicações de Revascularização",
        "value": "Bypass com Safena / Enxerto Protético vs Angioplastia Endovascular com Stent"
      }
    ],
    "rule": "Diretriz oficial de Doenças Vasculares Cirúrgicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Estadiamento Clínico) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doença Arterial Obstrutiva Periférica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-169-isquemia-arterial-aguda-d",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Isquemia Arterial Aguda de Membros",
    "fullTitle": "Isquemia Arterial Aguda de Membros (Doenças Vasculares Cirúrgicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Isquemia Arterial Aguda de Membros",
    "subfocos": [
      "Tétrade/Hexade dos 6 'Ps' e Diagnóstico Diferencial (Êmbolo vs Trombo)",
      "Classificação de Rutherford da Isquemia Aguda e Cirurgia de Urgência"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diferenciação Etiológica",
        "value": "Embolia (Fonte Cardíaca/FA, Início Súbito, Sem Circulação Colateral) vs Trombose Arterial Prévia"
      },
      {
        "letter": "B",
        "label": "Classificação de Rutherford (I",
        "value": "Viável; IIa: Marginalmente Ameaçado; IIb: Imediatamente Ameaçado; III: Irreversível)"
      },
      {
        "letter": "C",
        "label": "Parâmetro de Avaliação 3",
        "value": "Estratificação de gravidade e monitorização contínua de resposta terapêutica"
      }
    ],
    "rule": "Diretriz oficial de Doenças Vasculares Cirúrgicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Diferenciação Etiológica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Isquemia Arterial Aguda de Membros e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-170-aneurisma-de-aorta-abdomi",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Aneurisma de Aorta Abdominal",
    "fullTitle": "Aneurisma de Aorta Abdominal (Doenças Vasculares Cirúrgicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Aneurisma de Aorta Abdominal (AAA) e Torácica",
    "subfocos": [
      "Epidemiologia, Rastreamento e Indicações Cirúrgicas Eletivas",
      "Aneurisma Roto (Emergência Cirúrgica) e Técnicas (Aberta vs EVAR)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Epidemiologia, Rastreamento e Indicações Cirúrgicas Eletivas",
        "value": "Manejo Imediato com Heparinização Plena EV, Embolectomia Cirúrgica com Cateter de Fogarty e Fasciotomia Profilática"
      },
      {
        "letter": "B",
        "label": "Rastreamento com Ultrassonografia em Homens de 65-75 Anos Tabagistas (Definição de AAA",
        "value": "Diâmetro >= 3,0 cm)"
      },
      {
        "letter": "C",
        "label": "Indicações Cirúrgicas Canônicas",
        "value": "Diâmetro >= 5,5 cm em Homens (>= 5,0 cm em Mulheres), Crescimento > 1,0 cm/ano ou Presença de Sintomas"
      },
      {
        "letter": "D",
        "label": "Tríade do AAA Roto",
        "value": "Dor Lombar/Abdominal Súbita, Massa Pulsátil Palpável e Choque Hipovolêmico / Hipotensão"
      }
    ],
    "rule": "Diretriz oficial de Doenças Vasculares Cirúrgicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Epidemiologia, Rastreamento e Indicações Cirúrgicas Eletivas) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Aneurisma de Aorta Abdominal e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-171-doenca-carotidea-extracra",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Doença Carotídea Extracraniana Cirúrgica",
    "fullTitle": "Doença Carotídea Extracraniana Cirúrgica (Doenças Vasculares Cirúrgicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Doença Carotídea Extracraniana Cirúrgica",
    "subfocos": [
      "Estenose Carotídea Assintomática vs Sintomática (AIT / AVC)",
      "Endarterectomia Carotídea vs Angioplastia com Stent e Complicações"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estenose Carotídea Assintomática vs Sintomática (AIT / AVC)",
        "value": "Investigação Propedêutica por Doppler de Artérias Carótidas e Vertebrais, Angio-TC e Angio-RNM"
      },
      {
        "letter": "B",
        "label": "Critérios de Indicação de Revascularização",
        "value": "Sintomáticos com Estenose >= 50-70%; Assintomáticos com Estenose >= 70- 80%"
      },
      {
        "letter": "C",
        "label": "Angioplastia Carotídea com Stent e Sistema de Proteção Cerebral",
        "value": "Indicações Específicas (Pescoço Irradiado, Reestenose)"
      }
    ],
    "rule": "Diretriz oficial de Doenças Vasculares Cirúrgicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Estenose Carotídea Assintomática vs Sintomática (AIT / AVC)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Doença Carotídea Extracraniana Cirúrgica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-172-insuficiencia-venosa-cron",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Insuficiência Venosa Crônica e Varizes de Membros Inferiores",
    "fullTitle": "Insuficiência Venosa Crônica e Varizes de Membros Inferiores (Doenças Vasculares Cirúrgicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Insuficiência Venosa Crônica e Varizes de Membros Inferiores",
    "subfocos": [
      "Fisiopatologia, Classificação CEAP e Propedêutica",
      "Manejo Clínico Conservador e Tratamento Cirúrgico / Termoablação"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação CEAP (C0",
        "value": "Sem Sinais; C1: Telangiectasias; C2: Varizes; C3: Edema; C4: Alterações Tróficas/Dermatite Ocre; C5: Úlcera Cicatrizada; C6: Úlcera Ativa)"
      },
      {
        "letter": "B",
        "label": "Exame Físico Vascular, Prova de Brodie-Trendelenburg e Ultrassom Doppler Venoso Colorido",
        "value": "Mapeamento do Refluxo Safeno"
      },
      {
        "letter": "C",
        "label": "Manejo Clínico Conservador e Tratamento Cirúrgico / Termoablação",
        "value": "Tratamento Conservador com Meias Elásticas de Compressão Graduada, Elevação de Membros e Cuidados com a Pele"
      },
      {
        "letter": "D",
        "label": "Opções Cirúrgicas",
        "value": "Safenectomia Tradicional, Termoablação por Laser / Radiofrequência e Escleroterapia com Espuma Densa"
      }
    ],
    "rule": "Diretriz oficial de Doenças Vasculares Cirúrgicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Classificação CEAP (C0) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Insuficiência Venosa Crônica e Varizes de Membros Inferiores e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-173-trombose-venosa-profunda",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Trombose Venosa Profunda",
    "fullTitle": "Trombose Venosa Profunda (Doenças Vasculares Cirúrgicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Trombose Venosa Profunda (TVP) e Filtros de Veia Cava",
    "subfocos": [
      "Escore de Wells, Dímero-D e Doppler Venoso de Membros Inferiores",
      "Protocolos de Anticoagulação Plena e Filtro de Veia Cava Inferior"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Escore de Wells, Dímero-D e Doppler Venoso de Membros Inferiores",
        "value": "Estratificação com Escore de Wells para TVP e Uso do Dímero-D de Alta Sensibilidade como Exame de Alto VPN"
      },
      {
        "letter": "B",
        "label": "Anticoagulação com Anticoagulantes Orais Diretos (DOACs",
        "value": "Rivaroxabana, Apixabana) vs HBPM e Varfarina"
      },
      {
        "letter": "C",
        "label": "Indicações Formais de Filtro de Veia Cava Inferior (FVCI)",
        "value": "Contraindicação Absoluta à Anticoagulação ou TEP Recidivante em Anticoagulação Plena"
      }
    ],
    "rule": "Diretriz oficial de Doenças Vasculares Cirúrgicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Escore de Wells, Dímero-D e Doppler Venoso de Membros Inferiores) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Trombose Venosa Profunda e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-174-acessos-vasculares-para-h",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Acessos Vasculares para Hemodiálise",
    "fullTitle": "Acessos Vasculares para Hemodiálise (Doenças Vasculares Cirúrgicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Acessos Vasculares para Hemodiálise",
    "subfocos": [
      "Fístula Arteriovenosa Autógena (FAV) vs Enxerto Protético (PTFE)",
      "Complicações de Acessos Vasculares: Trombose, Estenose e Síndrome de Roubo"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Primeira Escolha Canônica",
        "value": "Fístula Autógena Radiocefálica (Brescia-Cimino) ou Braquiocefálica em Membro Não- Dominante"
      },
      {
        "letter": "B",
        "label": "Critérios de Maturação da Fístula (Regra dos 6",
        "value": "Fluxo > 600 mL/min, Diâmetro > 6 mm, Profundidade < 6 mm e Tempo >= 6 semanas)"
      },
      {
        "letter": "C",
        "label": "Fístula Arteriovenosa Autógena (FAV) vs Enxerto Protético (PTFE)",
        "value": "Identificação de Frêmito e Sopro Sistodiastólico na FAV e Propedêutica da Perda de Frêmito por Trombose"
      },
      {
        "letter": "D",
        "label": "Síndrome de Roubo Arterial",
        "value": "Isquemia Distal da Mão com Dor, Palidez e Frialdade) e Conduta Cirúrgica (Banding / DRIL"
      }
    ],
    "rule": "Diretriz oficial de Doenças Vasculares Cirúrgicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Primeira Escolha Canônica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Acessos Vasculares para Hemodiálise e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-175-litiase-urinaria-e-colica",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Litíase Urinária e Cólica Nefrética Cirúrgica",
    "fullTitle": "Litíase Urinária e Cólica Nefrética Cirúrgica (Patologias Cirúrgicas Urológicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Litíase Urinária e Cólica Nefrética Cirúrgica",
    "subfocos": [
      "Avaliação Propedêutica por Imagem e Manejo da Cólica Nefrética Aguda",
      "Critérios de Intervenção Cirúrgica de Urgência e Eletiva (LECO, Ureterorrenolitotripsia, NLPC)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tratamento da Dor Aguda com AINEs Intravenosos",
        "value": "Cetoprofeno"
      },
      {
        "letter": "B",
        "label": "Emergência Urológica Absoluta",
        "value": "Cálculo Obstrutivo Associado a Infecção Urinária / Sepse (Descompressão com Cateter Duplo J ou Nefrostomia)"
      },
      {
        "letter": "C",
        "label": "Tratamento Eletivo por Tamanho e Posição",
        "value": "Ureterolitotripsia Flexível a Laser, Litotripsia Extracorpórea (LECO) e Nefrolitotripsia Percutânea (NLPC > 2 cm)"
      }
    ],
    "rule": "Diretriz oficial de Patologias Cirúrgicas Urológicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tratamento da Dor Aguda com AINEs Intravenosos) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Litíase Urinária e Cólica Nefrética Cirúrgica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-176-hiperplasia-prostatica-be",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Hiperplasia Prostática Benigna",
    "fullTitle": "Hiperplasia Prostática Benigna (Patologias Cirúrgicas Urológicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Hiperplasia Prostática Benigna (HPB)",
    "subfocos": [
      "Quadro Clínico (Sintomas de Armazenamento e Esvaziamento) e Escore IPSS",
      "Terapia Farmacológica Combinada e Ressecção Transuretral de Próstata (RTUP)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sintomas do Trato Urinário Inferior (LUTS)",
        "value": "Jato Fraco, Hesitação, Noctúria, Polaciúria e Sensação de Esvaziamento Incompleto"
      },
      {
        "letter": "B",
        "label": "Toque Retal",
        "value": "Próstata Aumentada, Lisa, Fibroelástica, Indolor e Sulco Mediano Preservado"
      },
      {
        "letter": "C",
        "label": "Tratamento Medicamentoso",
        "value": "Alfa-Bloqueadores (Tansulosina) para Alívio Rápido + Inibidores da 5-Alfa-Redutase (Finasterida) para Redução de Volume"
      },
      {
        "letter": "D",
        "label": "Tratamento Cirúrgico",
        "value": "RTUP Monopolar/Bipolar (Próstatas < 80g) e Prostatectomia Suprapúbica Aberta / Enucleação a Laser (HoLEP > 80g)"
      }
    ],
    "rule": "Diretriz oficial de Patologias Cirúrgicas Urológicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Sintomas do Trato Urinário Inferior (LUTS)) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hiperplasia Prostática Benigna e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-177-cancer-de-prostata",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Câncer de Próstata",
    "fullTitle": "Câncer de Próstata (Patologias Cirúrgicas Urológicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Câncer de Próstata",
    "subfocos": [
      "Rastreamento, Biópsia Prostática Transretal e Escore de Gleason / ISUP",
      "Estratificação de Risco e Opções Terapêuticas (Vigilância, Prostatectomia e Hormonioterapia)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Investigação Inicial",
        "value": "Alteração no Toque Retal (Nódulo Endurecido) ou Elevação de PSA (Avaliação de Fração Livre e Velocidade)"
      },
      {
        "letter": "B",
        "label": "Biópsia de Próstata Guiada por USG/RNM e Graduação Histopatológica de Gleason",
        "value": "Padrão Primário + Secundário) e Grupos ISUP (1 a 5"
      },
      {
        "letter": "C",
        "label": "Doença Localizada de Baixo Risco",
        "value": "Vigilância Ativa com PSA Periódico e Biópsias Seriadas"
      },
      {
        "letter": "D",
        "label": "Tratamento Curativo",
        "value": "Prostatectomia Radical (Aberta, Laparoscópica ou Robótica) vs Radioterapia e Terapia de Privação Androgênica (Bloqueio Hormonal)"
      }
    ],
    "rule": "Diretriz oficial de Patologias Cirúrgicas Urológicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Investigação Inicial) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Câncer de Próstata e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-178-cancer-renal",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Câncer Renal",
    "fullTitle": "Câncer Renal (Patologias Cirúrgicas Urológicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Câncer Renal (Carcinoma de Células Renais)",
    "subfocos": [
      "Subtipos Histológicos, Tríade Clássica e Incidentalomas Renais",
      "Nefrectomia Parcial vs Radical e Síndromes Paraneoplásicas"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico na Maioria dos Casos como Incidentaloma em Exame de Imagem",
        "value": "USG ou TC de Abdome"
      },
      {
        "letter": "B",
        "label": "Tríade Clássica Tardia (Presente em < 10% dos casos)",
        "value": "Hematúria Macroscópica, Dor em Flanco e Massa Abdominal Palpável"
      },
      {
        "letter": "C",
        "label": "Subtipo Mais Comum",
        "value": "Carcinoma de Células Claras e Síndromes Paraneoplásicas (Eritrocitose por EPO, Hipercalcemia por PTHrP)"
      }
    ],
    "rule": "Diretriz oficial de Patologias Cirúrgicas Urológicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Diagnóstico na Maioria dos Casos como Incidentaloma em Exame de Imagem) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Câncer Renal e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-179-cancer-de-bexiga",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Câncer de Bexiga",
    "fullTitle": "Câncer de Bexiga (Patologias Cirúrgicas Urológicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Câncer de Bexiga",
    "subfocos": [
      "Fatores de Risco (Tabagismo), Apresentação Clínica e Cistoscopia",
      "Ressecção Transuretral de Bexiga (RTUB) e Invasão Muscular (Cistectomia Radical)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Principal Fator de Risco",
        "value": "Tabagismo e Exposição a Corantes de Anilina/Aminas Aromáticas"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico Mais Comum",
        "value": "Hematúria Macroscópica Indolor, Total, Intermitente e com Coágulos"
      },
      {
        "letter": "C",
        "label": "Diagnóstico e Estadiamento Inicial por Cistoscopia com RTUB",
        "value": "Avaliação da Presença de Camada Muscular Própria na Amostra"
      },
      {
        "letter": "D",
        "label": "Doença Não Músculo-Invasiva",
        "value": "RTUB + Imunoterapia Intravesical com BCG) vs Músculo-Invasiva (Cistectomia Radical + Neobexiga/Bricker"
      }
    ],
    "rule": "Diretriz oficial de Patologias Cirúrgicas Urológicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Principal Fator de Risco) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Câncer de Bexiga e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-180-cancer-de-testiculo",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Câncer de Testículo",
    "fullTitle": "Câncer de Testículo (Patologias Cirúrgicas Urológicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Câncer de Testículo",
    "subfocos": [
      "Fatores de Risco (Criptorquidia), Apresentação Clínica e Marcadores Tumorais",
      "Orquiectomia Radical Inguinal e Diferenciação Seminoma vs Não-Seminoma"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Principal Fator de Risco",
        "value": "Histórico de Criptorquidia; Apresentação como Nódulo Testicular Endurecido, Indolor e Fixo ao Parênquima"
      },
      {
        "letter": "B",
        "label": "Dosagem Pré-Operatória Mandatória de Marcadores",
        "value": "Alfa-fetoproteína (AFP), Beta-hCG e Desidrogenase Lática (LDH)"
      },
      {
        "letter": "C",
        "label": "Via de Acesso Cirúrgica Obrigatória",
        "value": "Orquiectomia Radical por Via Inguinal (Proibida Biópsia Transescrotal pelo Risco de Disseminação)"
      },
      {
        "letter": "D",
        "label": "Diferenciação Histopatológica",
        "value": "Seminoma (Alta Radiossensibilidade) vs Não-Seminoma (Teratoma, Carcinoma Embrionário, Coriocarcinoma)"
      }
    ],
    "rule": "Diretriz oficial de Patologias Cirúrgicas Urológicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Principal Fator de Risco) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Câncer de Testículo e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-181-escroto-agudo",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Escroto Agudo",
    "fullTitle": "Escroto Agudo (Patologias Cirúrgicas Urológicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Escroto Agudo (Torção Testicular e Orquiepididimite)",
    "subfocos": [
      "Diagnóstico Diferencial: Torção de Cordão Espermático vs Orquiepididimite Aguda",
      "Janela Cirúrgica de Ouro (< 6 horas) e Orquidopexia Bilateral"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Torção Testicular",
        "value": "Início Hiperagudo, Adolescentes, Testículo Elevado e Horizontalizado, Sinal de Prehn Negativo e Reflexo Cremastérico Ausente"
      },
      {
        "letter": "B",
        "label": "Orquiepididimite",
        "value": "Início Gradual, Disúria, Febre, Alívio da Dor à Elevação Testicular (Sinal de Prehn Positivo) e Reflexo Cremastérico Presente"
      },
      {
        "letter": "C",
        "label": "Emergência Cirúrgica Imediata",
        "value": "Exploração Escrotal de Urgência sem Perda de Tempo com Exames se Forte Suspeita Clínica"
      },
      {
        "letter": "D",
        "label": "Destorção Testicular, Avaliação da Viabilidade e Fixação Obrigatória do Testículo Contralateral",
        "value": "Orquidopexia Bilateral"
      }
    ],
    "rule": "Diretriz oficial de Patologias Cirúrgicas Urológicas (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Torção Testicular) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Escroto Agudo e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-182-trauma-urologico",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Trauma Urológico",
    "fullTitle": "Trauma Urológico (Patologias Cirúrgicas Urológicas • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Trauma Urológico (Renal, Vesical e Uretral)",
    "subfocos": [
      "Trauma Renal: Mecanismos, TC com Contraste e Manejo Não-Operatório",
      "Trauma de Bexiga e Trauma de Uretra (Anterior vs Posterior)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Indicações de TC com Contraste",
        "value": "Hematúria Macroscópica, Microematúria com Choque (PAS < 90 mmHg) ou Lesões Desacelerativas"
      },
      {
        "letter": "B",
        "label": "Classificação da AAST",
        "value": "Graus I a V"
      },
      {
        "letter": "C",
        "label": "Rotura Vesical Intraperitoneal",
        "value": "Dor Difusa, Indicação Cirúrgica Imediata) vs Extraperitoneal (Associada a Fratura de Pelve, Tratamento com SVD"
      },
      {
        "letter": "D",
        "label": "Trauma de Uretra",
        "value": "Sangue no Meato Uretral, Retenção Urinária e Hematoma Perineal (Proibida Cateterização Vesical; Realizar Uretrocistografia)"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-ciru-183-neoplasias-malignas-pulmo",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Neoplasias Malignas Pulmonares",
    "fullTitle": "Neoplasias Malignas Pulmonares (Afecções Cirúrgicas do Tórax • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Neoplasias Malignas Pulmonares (Câncer de Pulmão)",
    "subfocos": [
      "Tipos Histológicos, Rastreamento por TC de Baixa Dose e Diagnóstico",
      "Estadiamento TNM, Avaliação da Reserva Funcional Pulmonar e Ressecção"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diferenciação Histológica",
        "value": "Não-Pequenas Células (Adenocarcinoma mais comum em não-fumantes, Carcinoma Epidermoide central) vs Pequenas Células (Oat-Cell, Central, Alta Agressividade)"
      },
      {
        "letter": "B",
        "label": "Tipos Histológicos, Rastreamento por TC de Baixa Dose e Diagnóstico",
        "value": "Rastreamento Anual com TC de Baixa Dose em Indivíduos de 50-80 Anos com Carga Tabágica >= 20 maços-ano"
      },
      {
        "letter": "C",
        "label": "Avaliação Funcional",
        "value": "Espirometria (VEF1 previsto pós-operatório > 30-40%) e Cintilografia Pulmonar"
      },
      {
        "letter": "D",
        "label": "Tratamento Cirúrgico Curativo para Estádios Iniciais (I e II)",
        "value": "Lobectomia Pulmonar Anatômica com Linfadenectomia Mediastinal Sistêmica"
      }
    ],
    "rule": "Diretriz oficial de Afecções Cirúrgicas do Tórax (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Diferenciação Histológica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Neoplasias Malignas Pulmonares e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-184-derrame-pleural-neoplasic",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico",
    "fullTitle": "Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico (Afecções Cirúrgicas do Tórax • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico",
    "subfocos": [
      "Toracocentese Diagnóstica, Critérios de Light e Derrame Neoplásico",
      "Empiema Pleural: Fases Fisiopatológicas e Drenagem Torácica / Decorticação"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios de Light para Exsudato",
        "value": "Relação Proteína Pleural/Sérica > 0,5; LDH Pleural/Sérico > 0,6; LDH Pleural > 2/3 do limite superior"
      },
      {
        "letter": "B",
        "label": "Manejo do Derrame Neoplásico Recidivante com Pleurodese Química",
        "value": "Talco / Doxiciclina"
      },
      {
        "letter": "C",
        "label": "Fases do Derrame Parapneumônico",
        "value": "Exsudativa (Líquido Fluido, pH > 7,2), Fibrinopurulenta (pH < 7,2, Glicose < 40, Drenagem Obrigatória) e Organizada"
      },
      {
        "letter": "D",
        "label": "Indicações Cirúrgicas de Pleuroscopia",
        "value": "VATS"
      }
    ],
    "rule": "Diretriz oficial de Afecções Cirúrgicas do Tórax (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Critérios de Light para Exsudato) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/derrame_pleural_rx.webp",
    "imageCaption": "Radiografia de tórax: opacidade em base pulmonar com sinal do menisco (parábola de Damoiseau) e obliteração do seio costofrênico.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Harstonraven",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Pleural_effusion_editted.jpg"
  },
  {
    "id": "tip-ciru-185-pneumotorax-espontaneo",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Pneumotórax Espontâneo",
    "fullTitle": "Pneumotórax Espontâneo (Afecções Cirúrgicas do Tórax • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Pneumotórax Espontâneo",
    "subfocos": [
      "Pneumotórax Espontâneo Primário vs Secundário",
      "Manejo Inicial, Drenagem Tubular em Selo d'Água e Cirurgia para Recidiva"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Primário",
        "value": "Jovens Altos, Magros, Tabagistas, por Ruptura de Blebs Apicais Subpleurais, sem Doença Pulmonar Prévia"
      },
      {
        "letter": "B",
        "label": "Secundário",
        "value": "Decorrente de Pneumopatia de Base (DPOC com Bolhas, Enfisema, Tuberculose Cavitária, Fibrose Cística)"
      },
      {
        "letter": "C",
        "label": "Conduta por Tamanho",
        "value": "Pequeno (< 2 cm na cúpula, assintomático: Observação e O2 a 100%) vs Grande (> 2 cm ou sintomático: Drenagem Torácica)"
      },
      {
        "letter": "D",
        "label": "Indicações de Tratamento Cirúrgico por Toracoscopia (VATS) com Bullectomia e Pleurodese",
        "value": "2º Episódio (Recidiva), Fuga Aérea Persistente (> 48-72h) ou Hemopneumotórax"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/pneumotorax_rx.webp",
    "imageCaption": "Radiografia de tórax: hipertransparência unilateral com ausência de trama vascular periférica e retração do parênquima pulmonar (pneumotórax).",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Pilate SA, De Clercq S",
    "imageLicense": "CC BY 2.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:PMC3160360_1749-7922-6-23-1.png"
  },
  {
    "id": "tip-ciru-186-tumores-de-mediastino",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Tumores de Mediastino",
    "fullTitle": "Tumores de Mediastino (Afecções Cirúrgicas do Tórax • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Tumores de Mediastino",
    "subfocos": [
      "Anatomia Topográfica Mediastinal e Regra dos 4 Ts",
      "Investigação Radiológica e Abordagem Cirúrgica dos Timomas"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Mediastino Anterior (Regra dos 4 Ts",
        "value": "Timoma, Teratoma/Células Germinativas, Tireoide Ectópica e 'Terrível' Linfoma)"
      },
      {
        "letter": "B",
        "label": "Mediastino Médio (Cistos Broncogênicos e Pericárdicos, Linfadenopatias) e Mediastino Posterior (Tumores Neuroogênicos",
        "value": "Schwanoma, Neurofibroma)"
      },
      {
        "letter": "C",
        "label": "Parâmetro de Avaliação 3",
        "value": "Estratificação de gravidade e monitorização contínua de resposta terapêutica"
      }
    ],
    "rule": "Diretriz oficial de Afecções Cirúrgicas do Tórax (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Mediastino Anterior (Regra dos 4 Ts) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Tumores de Mediastino e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-187-bronquiectasias-e-doencas",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Bronquiectasias e Doenças Pleuropulmonares Supurativas",
    "fullTitle": "Bronquiectasias e Doenças Pleuropulmonares Supurativas (Afecções Cirúrgicas do Tórax • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Bronquiectasias e Doenças Pleuropulmonares Supurativas",
    "subfocos": [
      "Fisiopatologia, Tomografia de Alta Resolução e Diagnóstico",
      "Tratamento Clínico de Higiene Brônquica e Ressecção Pulmonar Cirúrgica"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia, Tomografia de Alta Resolução e Diagnóstico",
        "value": "Tomografia Computadorizada de Tórax com Contraste e Ressonância Magnética para Avaliação de Invasão Vascular e Pericárdica"
      },
      {
        "letter": "B",
        "label": "Fisiopatologia, Tomografia de Alta Resolução e Diagnóstico",
        "value": "Associação de Timoma com Miastenia Gravis e Técnica de Timectomia Radical Transtorácica ou Robótica"
      },
      {
        "letter": "C",
        "label": "Causas Principais",
        "value": "Sequela de Tuberculose, Infecções Pediátricas Graves na Infância, Fibrose Cística e Discinesia Ciliar"
      },
      {
        "letter": "D",
        "label": "Tratamento Clínico de Higiene Brônquica e Ressecção Pulmonar Cirúrgica",
        "value": "Manejo Clínico Conservador com Fisioterapia Respiratória, Antibioticoterapia Guiada por Escarro e Broncodilatadores"
      }
    ],
    "rule": "Diretriz oficial de Afecções Cirúrgicas do Tórax (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Fisiopatologia, Tomografia de Alta Resolução e Diagnóstico) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Bronquiectasias e Doenças Pleuropulmonares Supurativas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-188-atresia-de-esofago-e-fist",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Atresia de Esôfago e Fístula Traqueoesofágica",
    "fullTitle": "Atresia de Esôfago e Fístula Traqueoesofágica (Cirurgia Pediátrica e Neonatal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Atresia de Esôfago e Fístula Traqueoesofágica",
    "subfocos": [
      "Classificação Anatômica, Diagnóstico Neonatal e Sonda Orogástrica",
      "Propedêutica Radiológica (Presença de Ar no Abdome) e Correção Cirúrgica"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tipo Mais Frequente (Tipo C / III de Gross",
        "value": "85% dos casos): Atresia Proximal com Fístula Traqueoesofágica Distal"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico Clássico",
        "value": "Sialorréia Abundante, Regurgitação das Primeiras Mamadas, Sufocamento e Impossibilidade de Progressão da Sonda Orogástrica (Para a 10-12 cm)"
      },
      {
        "letter": "C",
        "label": "Radiografia Simples",
        "value": "Sonda Enovelada no Coto Proximal e Presença de Ar Gastrointestinal Confirmando Fístula Distal"
      },
      {
        "letter": "D",
        "label": "Propedêutica Radiológica (Presença de Ar no Abdome) e Correção Cirúrgica",
        "value": "Preparo Pré-Operatório com Aspiração Contínua do Coto Proximal e Cirurgia com Ligadura da Fístula e Anastomose Primária do Esôfago"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Pediátrica e Neonatal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Tipo Mais Frequente (Tipo C / III de Gross) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Atresia de Esôfago e Fístula Traqueoesofágica e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-189-estenose-hipertrofica-do",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Estenose Hipertrófica do Piloro",
    "fullTitle": "Estenose Hipertrófica do Piloro (Cirurgia Pediátrica e Neonatal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Estenose Hipertrófica do Piloro",
    "subfocos": [
      "Quadro Clínico (Vômitos Não-Biliosos em Jato) e Distúrbio Hidroeletrolítico",
      "Diagnóstico Ultrassonográfico e Piloromiotomia de Fredet-Ramstedt"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Apresentação Típica",
        "value": "Lactente Masculino de 3 a 6 Semanas com Vômitos Não-Biliosos Pós-Prandiais Progressivos 'Em Jato' e Fome Voraz"
      },
      {
        "letter": "B",
        "label": "Distúrbio Ácido-Base Típico Patognomônico",
        "value": "Alcalose Metabólica Hipoclorêmica e Hipocalêmica por Perda de Ácido Clorídrico Gástrico"
      },
      {
        "letter": "C",
        "label": "Exame Físico",
        "value": "Palpação da 'Oliva Pilórica' em Hipocôndrio Direito) e Ultrassom (Espessura Muscular Pilórica >= 3-4 mm e Comprimento >= 14-16 mm"
      },
      {
        "letter": "D",
        "label": "Diagnóstico Ultrassonográfico e Piloromiotomia de Fredet-Ramstedt",
        "value": "Preparo Obrigatório com Correção Hidroeletrolítica Antes de Qualquer Cirurgia, seguido de Piloromiotomia Extramucosa de Ramstedt"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Pediátrica e Neonatal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Apresentação Típica) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Estenose Hipertrófica do Piloro e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-190-hernia-diafragmatica-cong",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hérnia Diafragmática Congênita",
    "fullTitle": "Hérnia Diafragmática Congênita (Cirurgia Pediátrica e Neonatal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Hérnia Diafragmática Congênita",
    "subfocos": [
      "Hérnia de Bochdalek vs Morgagni e Fisiopatologia da Hipoplasia Pulmonar",
      "Manejo Ventilatório Neonatal Imediato e Momento da Correção Cirúrgica"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Localização Mais Frequente",
        "value": "Hérnia Posterolateral Esquerda de Bochdalek (85-90% dos casos) com Herniação de Alças Intestinais para o Tórax"
      },
      {
        "letter": "B",
        "label": "Fisiopatologia Crítica",
        "value": "Hipoplasia Pulmonar Bilateral Grave e Hipertensão Pulmonar Persistente do Neonato"
      },
      {
        "letter": "C",
        "label": "Conduta em Sala de Parto",
        "value": "Intubação Orotraqueal Imediata (Proibida Ventilação com Bolsa e Máscara para Evitar Distensão de Alças) e SOG Calibrosa"
      },
      {
        "letter": "D",
        "label": "Manejo Ventilatório Neonatal Imediato e Momento da Correção Cirúrgica",
        "value": "Estabilização Hemodinâmica e Respiratória Prévia com Óxido Nítrico Inalatório antes da Correção Cirúrgica Eletiva após 24-48h"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Pediátrica e Neonatal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Localização Mais Frequente) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Hérnia Diafragmática Congênita e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-191-malformacoes-anorretais",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Malformações Anorretais",
    "fullTitle": "Malformações Anorretais (Cirurgia Pediátrica e Neonatal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Malformações Anorretais (Ânus Imperfurado)",
    "subfocos": [
      "Classificação (Lesões Altas vs Baixas) e Fístulas Perineais / Urinárias",
      "Invertograma / Radiografia em Posição Prona e Conduta (Anoplastia vs Colostomia)"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Exame Físico Perineal Inicial após 16-24 Horas de Vida",
        "value": "Identificação de Fístulas no Períneo, Vestíbulo Vaginal ou Sistema Urinário"
      },
      {
        "letter": "B",
        "label": "Lesões Baixas",
        "value": "Fístula Perineal Visível, Abaixo do Músculo Elevador do Ânus) vs Lesões Altas (Sem Fístula Externa ou Fístula Retourinária/Retovaginal"
      },
      {
        "letter": "C",
        "label": "Propedêutica Radiológica",
        "value": "Invertograma ou Radiografia com Bacia Elevada após 24h"
      },
      {
        "letter": "D",
        "label": "Conduta Cirúrgica",
        "value": "Lesões Baixas tratadas com Anoplastia Sagital Posterior Imediata; Lesões Altas tratadas com Colostomia em Alça e Reconstrução Tardia (Pena)"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Pediátrica e Neonatal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Exame Físico Perineal Inicial após 16-24 Horas de Vida) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Malformações Anorretais e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-192-gastrosquise-e-onfalocele",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Gastrosquise e Onfalocele",
    "fullTitle": "Gastrosquise e Onfalocele (Cirurgia Pediátrica e Neonatal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Gastrosquise e Onfalocele",
    "subfocos": [
      "Diferenciação Embriológica e Anatômica: Gastrosquise vs Onfalocele",
      "Cuidados Imediatos em Sala de Parto e Fechamento Primário vs Silo Gradual"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Gastrosquise",
        "value": "Defeito Paraumbilical à Direita do Cordão, Sem Membrana de Cobertura, Alças Espessadas e Inflamadas pelo Contato com Líquido Amniótico"
      },
      {
        "letter": "B",
        "label": "Onfalocele",
        "value": "Defeito Central no Ânulo Umbilical, Coberto por Membrana de Peritônio e Âmnio, Frequente Associação com Anomalias Cardíacas e Genéticas"
      },
      {
        "letter": "C",
        "label": "Cuidados Imediatos em Sala de Parto e Fechamento Primário vs Silo Gradual",
        "value": "Proteção Térmica e Asséptica Imediata das Alças com Plástico Estéril e Sonda Gástrica Aberta sem Compressão dos Vasos Mesentéricos"
      },
      {
        "letter": "D",
        "label": "Redução das Vísceras",
        "value": "Fechamento Primário em Tempo Único vs Redução Escalonada com Silo de Molares para Evitar Síndrome Compartimental Abdominal"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Pediátrica e Neonatal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Gastrosquise) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Gastrosquise e Onfalocele e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-193-invaginacao-intestinal",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Invaginação Intestinal",
    "fullTitle": "Invaginação Intestinal (Cirurgia Pediátrica e Neonatal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Invaginação Intestinal (Intussuscepção)",
    "subfocos": [
      "Quadro Clínico (Dor Paroxística, Fezes em Geleia de Framboesa) e Ultrassom",
      "Redução Hidrostática / Pneumática vs Indicação Cirúrgica de Laparotomia"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Semiológica",
        "value": "Crises de Choro Intenso com Flexão de Pernas, Vômitos e Eliminação de Fezes com Sangue e Muco ('Geleia de Framboesa')"
      },
      {
        "letter": "B",
        "label": "Primeira Linha no Paciente Estável sem Sinais de Peritonite",
        "value": "Redução Não-Cirúrgica com Enema Pneumático ou Hidrostático Guiado por USG/Fluoroscopia"
      },
      {
        "letter": "C",
        "label": "Indicações Cirúrgicas Absolutas",
        "value": "Sinais de Peritonite, Perfuração Intestinal, Pneumoperitônio ou Falha da Redução Não- Invasiva"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-ciru-194-criptorquidia-e-hernias-c",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Criptorquidia e Hérnias Congênitas",
    "fullTitle": "Criptorquidia e Hérnias Congênitas (Cirurgia Pediátrica e Neonatal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Criptorquidia e Hérnias Congênitas",
    "subfocos": [
      "Fisiopatologia da Descida Testicular, Exame Físico e Idade para Correção",
      "Técnica de Orquidopexia e Hérnia Inguinal Indireta Congênita na Infância"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico Clínico por Palpação em Posição de Alfaiate",
        "value": "Testículo Retrátil vs Ectópico vs Criptorquídico"
      },
      {
        "letter": "B",
        "label": "Momento Cirúrgico Canônico",
        "value": "Intervenção entre 6 e 12 Meses de Idade (Risco Aumentado de Infertilidade e Neoplasia se Não Tratado)"
      },
      {
        "letter": "C",
        "label": "Técnica de Orquidopexia e Hérnia Inguinal Indireta Congênita na Infância",
        "value": "Orquidopexia por Via Inguinal com Dissecção Funicular e Fixação do Testículo em Bolsa Escrotal Subcutânea"
      },
      {
        "letter": "D",
        "label": "Hérnia Inguinal Pediátrica",
        "value": "Patência do Conduto Peritoniovaginal (Tratamento com Ligadura Alta do Saco Herniário sem Prótese)"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Pediátrica e Neonatal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Diagnóstico Clínico por Palpação em Posição de Alfaiate) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Criptorquidia e Hérnias Congênitas e condições correlatas, evitando intervenções invasivas precipitadas."
  },
  {
    "id": "tip-ciru-195-megacolon-congenito",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Megacólon Congênito",
    "fullTitle": "Megacólon Congênito (Cirurgia Pediátrica e Neonatal • Cirurgia Geral)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Megacólon Congênito (Doença de Hirschsprung)",
    "subfocos": [
      "Fisiopatologia da Aganglionose Retal, Atraso na Eliminação de Mecônio e Toque",
      "Enema Opaco, Manometria Anorretal, Biópsia Retal e Cirurgia de Abaixamento"
    ],
    "provenanceDefault": "Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia",
        "value": "Ausência Congênita de Plexos Nervosos Entéricos (Meissner e Auerbach) no Segmento Retal Distal"
      },
      {
        "letter": "B",
        "label": "Apresentação Neonatal Típica",
        "value": "Atraso na Eliminação de Mecônio (> 48h), Distensão Abdominal e Saída Explosiva de Fezes/Gases ao Toque Retal"
      },
      {
        "letter": "C",
        "label": "Enema Opaco demonstrando Cone de Transição e Cirurgias Definitivas de Abaixamento de Cólon",
        "value": "Técnicas de Duhamel, Soave ou Swenson"
      }
    ],
    "rule": "Diretriz oficial de Cirurgia Pediátrica e Neonatal (Colégio Brasileiro de Cirurgiões (CBC) / ATLS 11ª ed. (2024)): Priorize a identificação rápida dos critérios de inclusão diagnóstica (Fisiopatologia) e a estratificação de gravidade antes da intervenção definitiva.",
    "bancaTrap": "Em provas de residência (USP/ENARE/UNICAMP), preste atenção ao diagnóstico diferencial entre Megacólon Congênito e condições correlatas, evitando intervenções invasivas precipitadas.",
    "imageUrl": "/images/medical/volvo_sigmoide_rx.webp",
    "imageCaption": "Radiografia simples de abdome: dilatação colônica maciça com sinal do grão de café (ou U invertido) patognomônico de volvo de sigmoide.",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Mont4nha",
    "imageLicense": "CC0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Sigmoidvolvulus.jpg"
  },
  {
    "id": "tip-pedi-196-crescimento-ponderoestatu",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Crescimento Ponderoestatural e Baixa Estatura",
    "fullTitle": "Crescimento Ponderoestatural e Baixa Estatura (Puericultura e Desenvolvimento Infantil • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Puericultura e Desenvolvimento Infantil",
    "foco": "Crescimento Ponderoestatural e Baixa Estatura",
    "subfocos": [
      "Avaliação Antropométrica e Curvas de Crescimento da OMS",
      "Baixa Estatura Patológica e Desproporcional"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Curvas de Peso/Idade, Estatura/Idade e IMC/Idade",
        "value": "Z-Scores e Percentis"
      },
      {
        "letter": "B",
        "label": "Cálculo da Altura Alvo Familiar",
        "value": "Canal Genético Masculino e Feminino"
      },
      {
        "letter": "C",
        "label": "Retardo Constitucional do Crescimento e Puberdade vs Baixa Estatura Familiar",
        "value": "Idade Óssea"
      },
      {
        "letter": "D",
        "label": "Baixa Estatura Patológica e Desproporcional",
        "value": "Displasias Ósseas e Hipocondroplasia"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado.",
    "imageUrl": "/images/medical/curva_crescimento_oms.webp",
    "imageCaption": "Curva padrão de crescimento da Organização Mundial da Saúde (OMS): escores Z de estatura e peso para monitorização do estado nutricional.",
    "imageModality": "esquema",
    "imageSource": "CDC (Centers for Disease Control and Prevention)",
    "imageAuthor": "CDC / NCHS",
    "imageLicense": "Public Domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Ejemplo_de_uso_de_una_tabla_de_percentiles.png"
  },
  {
    "id": "tip-pedi-197-desenvolvimento-neuropsic",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Desenvolvimento Neuropsicomotor",
    "fullTitle": "Desenvolvimento Neuropsicomotor (Puericultura e Desenvolvimento Infantil • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Puericultura e Desenvolvimento Infantil",
    "foco": "Desenvolvimento Neuropsicomotor (DNPM)",
    "subfocos": [
      "Marcos do Desenvolvimento por Faixa Etária",
      "Sinais de Alerta e Atraso Global do DNPM"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Marcos Motores Grosseiros",
        "value": "Sustentação Cefálica 3m, Sentar sem Apoio 6-7m, Andar 12-15m"
      },
      {
        "letter": "B",
        "label": "Marcos Motores Finos e Adaptação",
        "value": "Pega em Pinça, Torre de Cubos"
      },
      {
        "letter": "C",
        "label": "Marcos de Linguagem e Social",
        "value": "Sorriso Social 2m, Balbucio, Primeiras Palavras"
      },
      {
        "letter": "D",
        "label": "Marcos do Desenvolvimento por Faixa Etária",
        "value": "Identificação Precoce de Regressão de Marcos Adquiridos"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-198-disturbios-do-sono-e-do-c",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Distúrbios do Sono e do Comportamento na Infância",
    "fullTitle": "Distúrbios do Sono e do Comportamento na Infância (Puericultura e Desenvolvimento Infantil • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Puericultura e Desenvolvimento Infantil",
    "foco": "Distúrbios do Sono e do Comportamento na Infância",
    "subfocos": [
      "Transtornos do Sono na Infância",
      "Birras, Encoprese e Enurese Noturna"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Terror Noturno vs Pesadelo",
        "value": "Fases do Sono REM vs Não-REM"
      },
      {
        "letter": "B",
        "label": "Transtornos do Sono na Infância",
        "value": "Higiene do Sono e Rotinas Comportamentais"
      },
      {
        "letter": "C",
        "label": "Birras, Encoprese e Enurese Noturna",
        "value": "Enurese Monossintomática vs Polissintomática"
      },
      {
        "letter": "D",
        "label": "Manejo Comportamental e Farmacológico",
        "value": "Desmopressina"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-199-aleitamento-materno",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Aleitamento Materno",
    "fullTitle": "Aleitamento Materno (Aleitamento Materno e Nutrição da Criança • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Aleitamento Materno (Técnica, Fisiologia e Pega)",
    "subfocos": [
      "Pega, Posicionamento e Fisiologia da Lactação",
      "Composição do Leite Materno (Colostro vs Leite Maduro)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Pega, Posicionamento e Fisiologia da Lactação",
        "value": "Reflexos de Ocitocina e Prolactina, Mecânica de Sucção"
      },
      {
        "letter": "B",
        "label": "Avaliação da Mamada Adequada",
        "value": "Sinais de Boa Pega e Posicionamento"
      },
      {
        "letter": "C",
        "label": "Variações Circadianas, Leite Anterior vs Posterior",
        "value": "Teor de Gordura"
      },
      {
        "letter": "D",
        "label": "Composição do Leite Materno (Colostro vs Leite Maduro)",
        "value": "Diferenças Imunológicas e Nutricionais entre Leite Humano e Leite de Vaca"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-200-dificuldades-e-contraindi",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Dificuldades e Contraindicações da Amamentação",
    "fullTitle": "Dificuldades e Contraindicações da Amamentação (Aleitamento Materno e Nutrição da Criança • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Dificuldades e Contraindicações da Amamentação",
    "subfocos": [
      "Fissuras Mamilares, Ingurgitamento e Mastite Lactacional",
      "Contraindicações Absolutas e Temporárias"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fissuras Mamilares, Ingurgitamento e Mastite Lactacional",
        "value": "Manejo do Ingurgitamento Mamário e Apojadura"
      },
      {
        "letter": "B",
        "label": "Mastite Puerperal Pediátrica",
        "value": "Tratamento com Oxacilina/Cefalexina e Manutenção da Mamada"
      },
      {
        "letter": "C",
        "label": "Contraindicações Absolutas da Mãe",
        "value": "HIV, HTLV) e da Criança (Galactosemia Clássica"
      },
      {
        "letter": "D",
        "label": "Contraindicações Absolutas e Temporárias",
        "value": "Falsas Contraindicações e Medicamentos na Lactação"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-201-alimentacao-complementar",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Alimentação Complementar e Fórmulas Infantis",
    "fullTitle": "Alimentação Complementar e Fórmulas Infantis (Aleitamento Materno e Nutrição da Criança • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Alimentação Complementar e Fórmulas Infantis",
    "subfocos": [
      "Introdução Alimentar aos 6 Meses e Guia Alimentar",
      "Fórmulas Infantis de Partida, Seguimento e Hidrolisados"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Introdução Alimentar aos 6 Meses e Guia Alimentar",
        "value": "Alimentação Responsiva e Métodos BLW vs Tradicional"
      },
      {
        "letter": "B",
        "label": "Introdução Alimentar aos 6 Meses e Guia Alimentar",
        "value": "Consistência, Grupos Alimentares e Alimentos Potencialmente Alergênicos"
      },
      {
        "letter": "C",
        "label": "Fórmulas Poliméricas Padrão",
        "value": "Fórmula 1 e 2"
      },
      {
        "letter": "D",
        "label": "Fórmulas Especiais",
        "value": "Extensamente Hidrolisadas e Aminoácidos Livres"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-202-desnutricao-energetico-pr",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Desnutrição Energético-Proteica",
    "fullTitle": "Desnutrição Energético-Proteica (Aleitamento Materno e Nutrição da Criança • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Desnutrição Energético-Proteica (Kwashiorkor e Marasmo)",
    "subfocos": [
      "Formas Graves de Desnutrição",
      "Classificação de Gomez e Waterlow"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Marasmo",
        "value": "Deficiência Calórica Global, Fácies Senil, Emagrecimento Extremo"
      },
      {
        "letter": "B",
        "label": "Kwashiorkor",
        "value": "Deficiência Proteica, Edema, Fácies de Lua Cheia, Hepatomegalia, Sinal da Bandeira"
      },
      {
        "letter": "C",
        "label": "Fases do Tratamento OMS",
        "value": "Estabilização, Reabilitação e Acompanhamento"
      },
      {
        "letter": "D",
        "label": "Desnutrição Aguda",
        "value": "Wasting) vs Crônica (Stunting"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-203-carencias-vitaminicas-e-m",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Carências Vitamínicas e Minerais",
    "fullTitle": "Carências Vitamínicas e Minerais (Aleitamento Materno e Nutrição da Criança • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Carências Vitamínicas e Minerais (Raquitismo e Hipovitaminoses)",
    "subfocos": [
      "Profilaxia e Tratamento da Anemia Ferropriva",
      "Raquitismo Carencial e Hipovitaminose D"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Suplementação Profilática de Ferro Elementar",
        "value": "SBP/MS"
      },
      {
        "letter": "B",
        "label": "Diagnóstico Laboratorial",
        "value": "Ferritina, Ferro Sérico, Capacidade Total de Ligação"
      },
      {
        "letter": "C",
        "label": "Raquitismo Carencial e Hipovitaminose D",
        "value": "Rosário Raquítico, Craniotabes e Alargamento Epifisário"
      },
      {
        "letter": "D",
        "label": "Raquitismo Carencial e Hipovitaminose D",
        "value": "Suplementação Profilática Universal de Vitamina D na Infância"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-204-obesidade-infantil-e-disl",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Obesidade Infantil e Dislipidemia Pediátrica",
    "fullTitle": "Obesidade Infantil e Dislipidemia Pediátrica (Aleitamento Materno e Nutrição da Criança • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Obesidade Infantil e Dislipidemia Pediátrica",
    "subfocos": [
      "Abordagem da Obesidade Infantil e Síndrome Metabólica",
      "Manejo Dietético e Comportamental na Infância"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação Antropométrica",
        "value": "Escore-Z de IMC > +2 e > +3"
      },
      {
        "letter": "B",
        "label": "Rastreamento de Comorbidades",
        "value": "Dislipidemia, Esteatose Hepática e HAS"
      },
      {
        "letter": "C",
        "label": "Manejo Dietético e Comportamental na Infância",
        "value": "Redução do Sedentarismo e Tempo de Telas"
      },
      {
        "letter": "D",
        "label": "Manejo Dietético e Comportamental na Infância",
        "value": "Envolvimento Familiar e Metas Graduais de Peso"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-205-calendario-vacinal-basico",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Calendário Vacinal Básico da Criança",
    "fullTitle": "Calendário Vacinal Básico da Criança (Imunizações e Calendário Vacinal • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Calendário Vacinal Básico da Criança (PNI)",
    "subfocos": [
      "Esquemas, Intervalos e Idades Mínimas do PNI",
      "Regras de Atraso e Atualização de Caderneta"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Esquema Vacinal dos Primeiros 6 Meses",
        "value": "BCG, Hep B, Penta, VIP, VORH, Pneumo-10, Meningo-C"
      },
      {
        "letter": "B",
        "label": "Reforços aos 12 e 15 Meses",
        "value": "DTP, VOP, Tríplice Viral, Varicela, Hepatite A, Febre Amarela"
      },
      {
        "letter": "C",
        "label": "Esquemas, Intervalos e Idades Mínimas do PNI",
        "value": "Regra de Nunca Reiniciar Esquemas Vacinais Atrasados"
      },
      {
        "letter": "D",
        "label": "Esquemas, Intervalos e Idades Mínimas do PNI",
        "value": "Intervalos Mínimos entre Doses e Vacinas Simultâneas"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-206-vacinas-do-primeiro-ano-d",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Vacinas do Primeiro Ano de Vida",
    "fullTitle": "Vacinas do Primeiro Ano de Vida (Imunizações e Calendário Vacinal • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Vacinas do Primeiro Ano de Vida (BCG, Hepatite B, Pentavalente, VIP, VORH, Pneumo-10, Meningo-C)",
    "subfocos": [
      "Vacinas do Neonato: BCG e Hepatite B",
      "Vacinas dos 2, 3, 4 e 5 Meses"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hepatite B em RN de Mãe HBsAg Positiva",
        "value": "Vacina + Imunoglobulina HBIG nas Primeiras 12h"
      },
      {
        "letter": "B",
        "label": "Pentavalente (DTP + Hib + Hep B)",
        "value": "Componente Pertussis de Célula Inteira"
      },
      {
        "letter": "C",
        "label": "Vacina Inativada Poliomielite (VIP) e Vacina Rotavírus Humano (VORH",
        "value": "Faixas Rígidas de Aplicação)"
      },
      {
        "letter": "D",
        "label": "Vacinas dos 2, 3, 4 e 5 Meses",
        "value": "Pneumocócica 10-Valente e Meningocócica C Conjugada"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-pedi-207-vacinas-do-segundo-ano-de",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Vacinas do Segundo Ano de Vida e Reforços",
    "fullTitle": "Vacinas do Segundo Ano de Vida e Reforços (Imunizações e Calendário Vacinal • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Vacinas do Segundo Ano de Vida e Reforços (VOP, DTP, Febre Amarela, Tríplice Viral, Varicela, Hepatite A)",
    "subfocos": [
      "Vacinas Vivas Atenuadas e Febre Amarela",
      "Reforços com DTP e Transição Poliomielite"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríplice Viral",
        "value": "Sarampo, Caxumba, Rubéola"
      },
      {
        "letter": "B",
        "label": "Febre Amarela no Calendário Básico e Intervalo com Tríplice Viral (< 2 anos",
        "value": "30 dias de intervalo)"
      },
      {
        "letter": "C",
        "label": "Reforços com DTP e Transição Poliomielite",
        "value": "Vacina Hepatite A e Reforço de Varicela"
      },
      {
        "letter": "D",
        "label": "Reforços da Tríplice Bacteriana",
        "value": "DTP"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-208-vacinas-em-populacoes-esp",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Vacinas em Populações Especiais e CRIE",
    "fullTitle": "Vacinas em Populações Especiais e CRIE (Imunizações e Calendário Vacinal • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Vacinas em Populações Especiais e CRIE",
    "subfocos": [
      "Indicações de Imunobiológicos Especiais no CRIE",
      "Indicações de Vacina Acelular (DTPa)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Prematuros Extremos (< 28-32 semanas)",
        "value": "Palivizumabe para Prevenção do VSR e Vacina Pneumo-13 / 23"
      },
      {
        "letter": "B",
        "label": "Crianças Imunossuprimidas e Contatos Domiciliares",
        "value": "Contraindicação de Vacinas de Vírus Vivo"
      },
      {
        "letter": "C",
        "label": "Parâmetro de Avaliação 3",
        "value": "Estratificação de gravidade e monitorização contínua de resposta terapêutica"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-209-eventos-adversos-pos-vaci",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Eventos Adversos Pós-Vacinais e Falsas Contraindicações",
    "fullTitle": "Eventos Adversos Pós-Vacinais e Falsas Contraindicações (Imunizações e Calendário Vacinal • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Eventos Adversos Pós-Vacinais e Falsas Contraindicações",
    "subfocos": [
      "Reações Comuns vs Eventos Adversos Graves",
      "Falsas Contraindicações Vacinais"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Síndrome Hipotônica-Hiporresponsiva",
        "value": "SHH"
      },
      {
        "letter": "B",
        "label": "Reações Comuns vs Eventos Adversos Graves",
        "value": "Cardiopatas e Pneumopatas Crônicos"
      },
      {
        "letter": "C",
        "label": "Reações Comuns vs Eventos Adversos Graves",
        "value": "Febre, Dor Local e Choro Inconsolável Pós-Pentavalente"
      },
      {
        "letter": "D",
        "label": "Síndrome Hipotônica-Hiporresponsiva",
        "value": "SHH"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-210-triagem-neonatal-biologic",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Triagem Neonatal Biológica e Testes de Triagem",
    "fullTitle": "Triagem Neonatal Biológica e Testes de Triagem (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Triagem Neonatal Biológica e Testes de Triagem (Pezinho, Olhinho, Coraçãozinho, Orelhinha)",
    "subfocos": [
      "Teste do Pezinho (Programa Nacional de Triagem Neonatal - PNTN)",
      "Testes de Triagem Física e Sensorial Neonatal"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Zonas Cutâneas de Kramer",
        "value": "Progressão Céfalo-Caudal da Icterícia"
      },
      {
        "letter": "B",
        "label": "Sinais de Alarme Patológico",
        "value": "Início nas Primeiras 24h de Vida, Aumento > 5 mg/dL/dia, Bilirrubina Direta > 1-2 mg/dL"
      },
      {
        "letter": "C",
        "label": "Parâmetro de Avaliação 3",
        "value": "Estratificação de gravidade e monitorização contínua de resposta terapêutica"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-211-reanimacao-neonatal-em-sa",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Reanimação Neonatal em Sala de Parto",
    "fullTitle": "Reanimação Neonatal em Sala de Parto (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Reanimação Neonatal em Sala de Parto (SBP)",
    "subfocos": [
      "Avaliação Imediata e Passos Iniciais da Reanimação (SBP)",
      "Ventilação com Pressão Positiva (VPP) e Manobras Avançadas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Três Perguntas Obrigatórias ao Nascer",
        "value": "Gestação a Termo? Respirando ou Chorando? Tônus Muscular em Flexão?"
      },
      {
        "letter": "B",
        "label": "Passos Iniciais (em até 30s sob calor radiante)",
        "value": "Prover Calor, Posicionar Cabeça em Leve Extensão, Aspirar se Necessário e Secar"
      },
      {
        "letter": "C",
        "label": "Indicação de VPP",
        "value": "FC < 100 bpm, Apneia ou Respiração Irregular (Iniciar com FiO2 21% se >= 34 sem ou 30% se < 34 sem)"
      },
      {
        "letter": "D",
        "label": "Massagem Cardíaca",
        "value": "Indicada se FC < 60 bpm após 30s de VPP Efetiva (Relação 3:1 com Técnica dos Dois Polegares)"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-212-prematuridade-e-sindrome",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Prematuridade e Síndrome do Desconforto Respiratório",
    "fullTitle": "Prematuridade e Síndrome do Desconforto Respiratório (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Prematuridade e Síndrome do Desconforto Respiratório (Doença da Membrana Hialina)",
    "subfocos": [
      "Doença da Membrana Hialina (DMH / SDR Tipo 1)",
      "Complicações da Prematuridade Extrema"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia Central",
        "value": "Deficiência Quantitativa de Surfactante Pulmonar por Imaturidade de Pneumócitos Tipo II em Prematuros"
      },
      {
        "letter": "B",
        "label": "Radiografia de Tórax Típica",
        "value": "Infiltrado Reticulogranular Difuso ('Vidro Moído') com Broncogramas Aéreos e Volume Pulmonar Reduzido"
      },
      {
        "letter": "C",
        "label": "Manejo na Sala de Parto",
        "value": "CPAP Nasal Precoce (5-6 cmH2O) e Surfactante Exógeno Intratraqueal sob Técnica LISA/INSURE"
      },
      {
        "letter": "D",
        "label": "Prevenção Primária",
        "value": "Corticoterapia Antenatal (Betametasona IM 12 mg, 2 doses) entre 24 e 34 Semanas"
      }
    ],
    "rule": "Diretrizes SBP / AAP: Na Doença da Membrana Hialina (DMH) do prematuro, o CPAP nasal precoce em sala de parto associado a surfactante exógeno intratraqueal (técnica LISA/INSURE) previne colapso alveolar e reduz a necessidade de ventilação mecânica.",
    "bancaTrap": "A administração de antibióticos empíricos (ampicilina + gentamicina) é mandatória no prematuro com desconforto até que culturas descartem sepse precoce, pois o RX de tórax pode ser indistinguível de pneumonia por EGB."
  },
  {
    "id": "tip-pedi-213-taquipneia-transitoria-do",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Taquipneia Transitória do Recém-Nascido",
    "fullTitle": "Taquipneia Transitória do Recém-Nascido (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Taquipneia Transitória do Recém-Nascido (TTRN)",
    "subfocos": [
      "Fisiopatologia e Quadro Clínico da TTRN",
      "Diagnóstico Diferencial e Conduta na TTRN"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Mecanismo Fisiopatológico",
        "value": "Retardo na Reabsorção do Líquido Pulmonar Fetal por Inadequação dos Canais Epiteliais de Sódio (ENaC)"
      },
      {
        "letter": "B",
        "label": "Fator de Risco Clássico",
        "value": "Cesariana Eletiva a Termo sem Trabalho de Parto Prévio"
      },
      {
        "letter": "C",
        "label": "Achados Radiológicos",
        "value": "Congestão Peri-Hilar, Trama Vascular Aumentada, Líquido na Cisura Interlobar ('Cisurite') e Hiperinsuflação"
      },
      {
        "letter": "D",
        "label": "Conduta Terapêutica",
        "value": "Oxigenoterapia de Baixo Fluxo (FiO2 < 40%) por Halo/Óculos; Resolução Espontânea e Autolimitada em 24-72h sem Antibióticos"
      }
    ],
    "rule": "Diretriz SBP: A Taquipneia Transitória do Recém-Nascido (TTRN) decorre do retardo na absorção do líquido pulmonar fetal após cesariana eletiva sem trabalho de parto; quadro benigno e autolimitado em 24-72h conduzido com suporte de O2 em baixo fluxo.",
    "bancaTrap": "Não prescreva antibioticoterapia empírica nem realize procedimentos invasivos em RN com história típica de cesárea eletiva a termo, desconforto respiratório precoce e ausência de fatores de risco infecciosos."
  },
  {
    "id": "tip-pedi-214-sindrome-de-aspiracao-mec",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Síndrome de Aspiração Meconial",
    "fullTitle": "Síndrome de Aspiração Meconial (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Síndrome de Aspiração Meconial (SAM)",
    "subfocos": [
      "Diagnóstico e Manejo Clínico da SAM",
      "Conduta na Sala de Parto com Líquido Meconial"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia",
        "value": "Sofrimento Fetal Intrauterino com Eliminação de Mecônio Espesso e Gasping em RN a Termo ou Pós-Termo"
      },
      {
        "letter": "B",
        "label": "Radiografia de Tórax",
        "value": "Infiltrado Grosseiro Nodular em 'Flocos de Algodão' com Áreas de Hiperinsuflação e Atelectasias Lamelares"
      },
      {
        "letter": "C",
        "label": "Conduta Atual (Diretriz SBP)",
        "value": "Não Intubar de Rotina para Aspiração Traqueal; Iniciar Passos Iniciais e VPP se Não Vigoroso"
      },
      {
        "letter": "D",
        "label": "Complicação Temida",
        "value": "Hipertensão Pulmonar Persistente Neonatal (HPPN) e Pneumotórax por Mecanismo de Válvula"
      }
    ],
    "rule": "Diretriz SBP de Reanimação Neonatal: No RN banhado em mecônio não vigoroso ao nascer, NÃO realize aspiração traqueal sob laringoscopia de rotina; inicie imediatamente os passos habituais de reanimação (aquecer, secar e VPP se FC < 100).",
    "bancaTrap": "A complicação mais temida da SAM é a Hipertensão Pulmonar Persistente Neonatal (HPPN), devendo-se monitorizar a SpO2 pré e pós-ductal para detectar shunt direita-esquerda pelo canal arterial."
  },
  {
    "id": "tip-pedi-215-hiperbilirrubinemia-e-ict",
    "category": "transfusao",
    "categoryLabel": "Gatilhos Hemoterápicos",
    "title": "Hiperbilirrubinemia e Icterícia Neonatal",
    "fullTitle": "Hiperbilirrubinemia e Icterícia Neonatal (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Hiperbilirrubinemia e Icterícia Neonatal",
    "subfocos": [
      "Icterícia Fisiológica vs Patológica",
      "Doença Hemolítica Perinatal e Tratamento"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Icterícia Patológica",
        "value": "Início Precoce (< 24h de Vida), Elevação > 5 mg/dL/dia ou Fração Direta > 1-2 mg/dL"
      },
      {
        "letter": "B",
        "label": "Icterícia do Aleitamento",
        "value": "Precoce por Baixa Ingesta/Desidratação) vs do Leite Materno (Tardia por Componentes Inibitórios do Leite"
      },
      {
        "letter": "C",
        "label": "Incompatibilidade Rh",
        "value": "Coombs Direto Positivo, Anemia Grave) vs Incompatibilidade ABO (Mais Comum, Menos Severa"
      },
      {
        "letter": "D",
        "label": "Doença Hemolítica Perinatal e Tratamento",
        "value": "Indicações de Fototerapia Intensiva e Exsanguinotransfusão segundo Gráficos de Bhutani e Nomogramas da AAP"
      }
    ],
    "rule": "Diretrizes SBP / AAP: Icterícia que surge nas primeiras 24 horas de vida é SEMPRE patológica (predomínio de incompatibilidade Rh ou ABO); indique fototerapia imediata conforme os nomogramas de Bhutani.",
    "bancaTrap": "Não confunda icterícia do aleitamento materno (precoce, na 1ª semana, por baixa ingesta calórica e desidratação) com icterícia do leite materno (tardia, após o 7º dia, em bebê saudável e com ganho ponderal adequado)."
  },
  {
    "id": "tip-pedi-216-sepse-neonatal-precoce-e",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Sepse Neonatal Precoce e Tardia",
    "fullTitle": "Sepse Neonatal Precoce e Tardia (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Sepse Neonatal Precoce e Tardia",
    "subfocos": [
      "Sepse Neonatal Precoce (< 48-72h)",
      "Sepse Neonatal Tardia (> 72h)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Transmissão Vertical",
        "value": "Fatores de Risco Maternos (RPMO > 18h, Febre Materna Intraparto, Corioamnionite, EGB Positivo sem Profilaxia)"
      },
      {
        "letter": "B",
        "label": "Agentes Principais e Terapia Empírica",
        "value": "*Streptococcus agalactiae* (EGB) e *E. coli*; Esquema: Ampicilina + Gentamicina EV"
      },
      {
        "letter": "C",
        "label": "Origem Nosocomial em UTIN",
        "value": "*Staphylococcus epidermidis* (Coagulase-Negativo), *S. aureus*, Gram-Negativos Multirresistentes e *Candida*"
      },
      {
        "letter": "D",
        "label": "Esquema Empírico Hospitalar",
        "value": "Oxacilina/Vancomicina + Amicacina ou Cefepima"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-217-enterocolite-necrosante",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Enterocolite Necrosante",
    "fullTitle": "Enterocolite Necrosante (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Enterocolite Necrosante",
    "subfocos": [
      "Diagnóstico e Classificação de Bell",
      "Manejo Clínico Inicial da ECN"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Típica em Prematuro sob Dieta Enteral",
        "value": "Distensão Abdominal, Sangramento Gastrointestinal e Resíduos Gástricos Biliosos"
      },
      {
        "letter": "B",
        "label": "Sinal Radiológico Patognomônico",
        "value": "Pneumatose Intestinal (Gás na Parede das Alças) e Gás no Sistema Porta"
      },
      {
        "letter": "C",
        "label": "Manejo Clínico (Bell I-II)",
        "value": "Jejum Absoluto, Descompressão Gástrica Contínua e Antibioticoterapia de Amplo Espectro"
      },
      {
        "letter": "D",
        "label": "Indicação Cirúrgica de Emergência",
        "value": "Pneumoperitônio (Perfuração Intestinal - Bell Estágio IIIb)"
      }
    ],
    "rule": "Diretrizes SBP: O achado de pneumatose intestinal (gás na parede da alça) e gás no sistema porta à radiografia de abdome é patognomônico de Enterocolite Necrosante (ECN - Bell estágio II).",
    "bancaTrap": "A presença de pneumoperitônio (ar livre na cavidade peritoneal - Bell estágio IIIb) indica perfuração intestinal com indicação cirúrgica de emergência mandatória (laparotomia exploradora ou drenagem peritoneal)."
  },
  {
    "id": "tip-pedi-218-hipoglicemia-e-disturbios",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Hipoglicemia e Distúrbios Metabólicos Neonatais",
    "fullTitle": "Hipoglicemia e Distúrbios Metabólicos Neonatais (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Hipoglicemia e Distúrbios Metabólicos Neonatais",
    "subfocos": [
      "Hipoglicemia Neonatal (Definição e Conduta)",
      "Hipocalcemia e Hipomagnesemia Neonatais"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critério Diagnóstico",
        "value": "Glicemia < 40-45 mg/dL em RN de Risco (Filho de Mãe Diabética, PIG, GIG, Prematuro)"
      },
      {
        "letter": "B",
        "label": "Tratamento da Crise Sintomática",
        "value": "Bolus de Glicose 10% (2 mL/kg EV) seguido de Taxa de Infusão de Glicose (TIG 4-8 mg/kg/min)"
      },
      {
        "letter": "C",
        "label": "Quadro Clínico",
        "value": "Tremores Finos aos Estímulos, Irritabilidade, Hiper-reflexia e Convulsões Neonatais"
      },
      {
        "letter": "D",
        "label": "Conduta na Hipocalcemia Sintomática (Cálcio Iônico < 4 mg/dL)",
        "value": "Gluconato de Cálcio 10% EV com Monitorização Eletrocardiográfica"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-219-asfixia-perinatal-e-encef",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica",
    "fullTitle": "Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica (Neonatologia e Cuidados Perinatais • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica",
    "subfocos": [
      "Critérios Diagnósticos de Asfixia Perinatal",
      "Encefalopatia Hipóxico-Isquêmica e Hipotermia Terapêutica"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Diagnósticos",
        "value": "Acidose Metabólica Grave no Cordão (pH < 7,00 e BE >= 12 mmol/L), Apgar <= 3 no 5º min e Falência Multiorgânica"
      },
      {
        "letter": "B",
        "label": "Estadiamento de Sarnat",
        "value": "Estágio I (Hiperalerta/Midríase), Estágio II (Letargia/Convulsões) e Estágio III (Coma/Hipotonia Flácida)"
      },
      {
        "letter": "C",
        "label": "Hipotermia Terapêutica Corpórea Total",
        "value": "Alvo 33,5°C a 34,5°C por 72 Horas Iniciada nas Primeiras 6 Horas de Vida"
      },
      {
        "letter": "D",
        "label": "Efeito Neuroprotetor Comprovado",
        "value": "Redução Significativa de Morte e Sequelas Graves de Paralisia Cerebral"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-220-sarampo",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Sarampo",
    "fullTitle": "Sarampo (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Sarampo",
    "subfocos": [
      "Diagnóstico Clínico e Sinais Patognomônicos",
      "Notificação, Bloqueio Vacinal e Suplementação de Vitamina A"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Pródromos Catarrais Intensos",
        "value": "Tosse, Coriza, Conjuntivite com Fotofobia"
      },
      {
        "letter": "B",
        "label": "Manchas de Koplik",
        "value": "Enantema Patognomônico na Mucosa Jugal Oposta aos Molares"
      },
      {
        "letter": "C",
        "label": "Notificação, Bloqueio Vacinal e Suplementação de Vitamina A",
        "value": "Exantema Maculopapular Morbiliforme Confluente de Progressão Crânio-Caudal com Descamação Furfurácea"
      },
      {
        "letter": "D",
        "label": "Notificação Compulsória Imediata",
        "value": "em até 24 Horas"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-221-varicela-e-herpes-zoster",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Varicela e Herpes-Zóster Infantil",
    "fullTitle": "Varicela e Herpes-Zóster Infantil (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Varicela e Herpes-Zóster Infantil",
    "subfocos": [
      "Manifestações Clínicas e Pleomorfismo Regional",
      "Complicações e Indicações de Aciclovir e Bloqueio"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Lesões em Diferentes Estágios Evolutivos Concomitantes",
        "value": "Mácula -> Pápula -> Vesícula em \"Gota de Orvalho\" -> Pústula - > Crosta"
      },
      {
        "letter": "B",
        "label": "Manifestações Clínicas e Pleomorfismo Regional",
        "value": "Distribuição Centrípeta com Prurido Intenso e Acometimento de Couro Cabeludo e Mucosas"
      },
      {
        "letter": "C",
        "label": "Período de Transmissibilidade",
        "value": "2 Dias Antes do Exantema até Todas as Lesões se Tornarem Crostas"
      },
      {
        "letter": "D",
        "label": "Infecção Bacteriana Secundária de Pele",
        "value": "Impetigo, Celulite Estafilocócica e Fasciíte Necrosante"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-222-escarlatina",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Escarlatina",
    "fullTitle": "Escarlatina (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Escarlatina",
    "subfocos": [
      "Quadro Clínico e Exantema Micropapular",
      "Tratamento Antimicrobiano e Prevenção de Sequelas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Etiologia",
        "value": "*Streptococcus pyogenes* (Estreptococo do Grupo A) Produtor de Exotoxina Pirogênica"
      },
      {
        "letter": "B",
        "label": "Exantema Micropapular em \"Lixa\" com Hiperemia em Dobras",
        "value": "Sinal de Pastia) e Palidez Perioral (Sinal de Filatov"
      },
      {
        "letter": "C",
        "label": "Língua em Framboesa",
        "value": "Branca nos Primeiros Dias e Vermelha Subsequentemente"
      },
      {
        "letter": "D",
        "label": "Tratamento Antimicrobiano e Prevenção de Sequelas",
        "value": "Penicilina Benzatina IM em Dose Única ou Amoxicilina Oral por 10 Dias"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-223-exantema-subito",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Exantema Súbito",
    "fullTitle": "Exantema Súbito (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Exantema Súbito (Roséola Infantil)",
    "subfocos": [
      "Fisiopatologia e Curso Clínico Bimodal",
      "Manejo Clínico e Diagnóstico Diferencial"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Febre Alta Súbita que Dura 3 a 5 Dias sem Foco Aparente",
        "value": "Bom Estado Geral"
      },
      {
        "letter": "B",
        "label": "Fisiopatologia e Curso Clínico Bimodal",
        "value": "Crise Febril Convulsiva Frequentemente Associada"
      },
      {
        "letter": "C",
        "label": "Fisiopatologia e Curso Clínico Bimodal",
        "value": "Exantema Maculopapular Rosado de Início em Tronco que Surge Exatamente Quando a Febre Desaparece em Crise"
      },
      {
        "letter": "D",
        "label": "Fisiopatologia e Curso Clínico Bimodal",
        "value": "Tratamento de Suporte e Antipiréticos"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-224-eritema-infeccioso",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Eritema Infeccioso",
    "fullTitle": "Eritema Infeccioso (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Eritema Infeccioso (Parvovírus B19)",
    "subfocos": [
      "Parvovírus B19 e as 3 Fases do Exantema",
      "Complicações Hematológicas e Gestacionais do Parvovírus"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Crise Aplásica Transitória em Pacientes com Doenças Hemolíticas Crônicas",
        "value": "Anemia Falciforme, Esferocitose"
      },
      {
        "letter": "B",
        "label": "Parvovírus B19 e as 3 Fases do Exantema",
        "value": "Hidropisia Fetal não Imune por Infecção Congênita"
      },
      {
        "letter": "C",
        "label": "Critério Obrigatório",
        "value": "Febre Alta Diária Persistente por pelo menos 5 Dias"
      },
      {
        "letter": "D",
        "label": "Critérios Adicionais (Pelo Menos 4 de 5)",
        "value": "Conjuntivite Bulbar Não-Purulenta, Alterações Orais (Lábios Fissurados, Língua em Framboesa), Adenopatia Cervical Unilateral > 1,5 cm, Exantema Polimorfo, Alterações de Extremidades (Edema/Eritema Palmoplantar e Descamação Periungueal Tardia)"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-225-doenca-de-kawasaki",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doença de Kawasaki",
    "fullTitle": "Doença de Kawasaki (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Doença de Kawasaki",
    "subfocos": [
      "Critérios Diagnósticos Clínicos da Vasculite de Kawasaki",
      "Prevenção de Aneurismas Coronarianos e Tratamento"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Imunoglobulina Humana Intravenosa",
        "value": "IVIG 2 g/kg"
      },
      {
        "letter": "B",
        "label": "Ácido Acetilsalicílico",
        "value": "AAS"
      },
      {
        "letter": "C",
        "label": "Parâmetro de Avaliação 3",
        "value": "Estratificação de gravidade e monitorização contínua de resposta terapêutica"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-226-doenca-mao-pe-boca",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Doença Mão-Pé-Boca",
    "fullTitle": "Doença Mão-Pé-Boca (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Doença Mão-Pé-Boca (Coxsackievírus)",
    "subfocos": [
      "Coxsackievírus A16 e Manifestações Vesiculares",
      "Herpangina e Complicações pelo Enterovírus 71"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Coxsackievírus A16 e Manifestações Vesiculares",
        "value": "Vesículas Elípticas em Base Eritematosa em Palmas das Mãos, Plantas dos Pés, Nádegas e Região Perioral"
      },
      {
        "letter": "B",
        "label": "Coxsackievírus A16 e Manifestações Vesiculares",
        "value": "Úlceras Dolorosas na Cavidade Oral Levando a Sialorreia e Recusa Alimentar"
      },
      {
        "letter": "C",
        "label": "Herpangina e Complicações pelo Enterovírus 71",
        "value": "Curso Benigno e Autolimitado com Resolução em 7-10 Dias"
      },
      {
        "letter": "D",
        "label": "Herpangina",
        "value": "Lesões Ulceradas Exclusivas em Pilares Amigdalianos e Palato Mole"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-227-mononucleose-infecciosa",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Mononucleose Infecciosa",
    "fullTitle": "Mononucleose Infecciosa (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Mononucleose Infecciosa",
    "subfocos": [
      "Vírus Epstein-Barr (EBV) e Síndrome Mononucleósica",
      "Diagnóstico Laboratorial da Mononucleose"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Clássica",
        "value": "Febre Prolongada, Faringite Exsudativa Grave e Linfadenopatia Generalizada (Cervical Posterior e Epitroclear)"
      },
      {
        "letter": "B",
        "label": "Esplenomegalia e Hepatomegalia com Risco de Rotura Esplênica",
        "value": "Evitar Esportes de Contato"
      },
      {
        "letter": "C",
        "label": "Diagnóstico Laboratorial da Mononucleose",
        "value": "Exantema Maculopapular Desencadeado pelo Uso Inadvertido de Amoxicilina / Ampicilina"
      },
      {
        "letter": "D",
        "label": "Leucocitose com Linfocitose Marcada e Presença de Linfócitos Atípicos",
        "value": "> 10%"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-228-coqueluche",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Coqueluche",
    "fullTitle": "Coqueluche (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Coqueluche",
    "subfocos": [
      "Fases Clínicas da Infecção por Bordetella pertussis",
      "Tratamento com Macrolídeos e Quimioprofilaxia"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fase Catarral (1-2 Semanas",
        "value": "Sintomas Respiratórios Altos Inespecíficos e Máxima Transmissibilidade)"
      },
      {
        "letter": "B",
        "label": "Fase Paroxística (2-6 Semanas",
        "value": "Crises de Tosse Espasmódica, Guincho Inspiratório, Cianose e Vômitos Pós-Tosse)"
      },
      {
        "letter": "C",
        "label": "Fase de Convalescença",
        "value": "Semanas a Meses"
      },
      {
        "letter": "D",
        "label": "Coqueluche Grave em Menores de 6 Meses",
        "value": "Reação Leucemoide (Linfocitose Extrema > 50.000) e Apneia Súbita"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-229-rubeola-congenita-e-adqui",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Rubéola Congênita e Adquirida",
    "fullTitle": "Rubéola Congênita e Adquirida (Doenças Exantemáticas e Infecciosas da Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Rubéola Congênita e Adquirida",
    "subfocos": [
      "Rubéola Pós-Natal Adquirida",
      "Síndrome da Rubéola Congênita (SRC)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Rubéola Pós-Natal Adquirida",
        "value": "Linfadenopatia Retroauricular, Suboccipital e Cervical Dolorosa Marcada"
      },
      {
        "letter": "B",
        "label": "Exantema Maculopapular Rosado Fugaz",
        "value": "3 Dias"
      },
      {
        "letter": "C",
        "label": "Tétrada Clássica de Gregg",
        "value": "Surdez Neurossensorial, Cardiopatia Congênita (PCA e Estenose de Artéria Pulmonar), Catarata Congênita e Retinopatia em \"Sal e Pimenta"
      },
      {
        "letter": "D",
        "label": "Microcefalia e Lesões em \"Muffin de Mirtilo\"",
        "value": "Blueberry Muffin"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-230-bronquiolite-viral-aguda",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Bronquiolite Viral Aguda",
    "fullTitle": "Bronquiolite Viral Aguda (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Bronquiolite Viral Aguda",
    "subfocos": [
      "Diagnóstico Clínico do Primeiro Episódio de Sibilância",
      "Manejo Terapêutico Baseado em Evidências (Diretriz SBP/AAP)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Etiologia Predominante",
        "value": "Vírus Sincicial Respiratório (VSR) em Lactentes Jovens (< 2 Anos)"
      },
      {
        "letter": "B",
        "label": "Diagnóstico Clínico do Primeiro Episódio de Sibilância",
        "value": "Pródromos Catarrais seguidos de Taquipneia, Tiragem Subcostal/Intercostal, Batimento de Asa de Nariz e Sibilos Expiratórios"
      },
      {
        "letter": "C",
        "label": "Critérios de Gravidade",
        "value": "Saturação de O2 < 90-92%, Cianose, Apneias e Dificuldade para Mamadas"
      },
      {
        "letter": "D",
        "label": "Medidas de Suporte Primárias",
        "value": "Oxigenoterapia para Manter SpO2 >= 90-92%, Lavagem Nasal com Solução Fisiológica e Hidratação Fracionada"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-231-asma-na-infancia-e-bebe-c",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Asma na Infância e Bebê Chiador",
    "fullTitle": "Asma na Infância e Bebê Chiador (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Asma na Infância e Bebê Chiador",
    "subfocos": [
      "Lactente Sibilante (Bebê Chiador) e Escore API",
      "Tratamento de Crise Asmática e Manutenção na Criança"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Práticas Não Recomendadas de Rotina",
        "value": "Contraindicação ao Uso Sistemático de Corticoides, Broncodilatadores, Fisioterapia Respiratória e Antibióticos"
      },
      {
        "letter": "B",
        "label": "Uso de Cânula Nasal de Alto Fluxo",
        "value": "CNAF"
      },
      {
        "letter": "C",
        "label": "Índice Preditivo de Asma (Asthma Predictive Index - API)",
        "value": "Critérios Maiores (História dos Pais de Asma, Eczema Atópico) e Menores"
      },
      {
        "letter": "D",
        "label": "Fenótipos de Sibilância",
        "value": "Sibilante Transitório Precoce vs Sibilante Persistente / Atópico"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro."
  },
  {
    "id": "tip-pedi-232-pneumonias-adquiridas-na",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Pneumonias Adquiridas na Comunidade",
    "fullTitle": "Pneumonias Adquiridas na Comunidade (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Pneumonias Adquiridas na Comunidade (PAC Pediátrica) e Complicações (Derrame Pleural)",
    "subfocos": [
      "Diagnóstico e Etiologia da PAC na Criança",
      "Tratamento Ambulatorial vs Hospitalar e Complicações"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Sinal Clínico Mais Sensível da OMS para Pneumonia",
        "value": "Taquipneia segundo a Faixa Etária (< 2m: >= 60; 2-11m: >= 50; 1-4a: >= 40 rpm)"
      },
      {
        "letter": "B",
        "label": "Etiologias por Idade",
        "value": "VSR em Menores de 1 Ano, *Streptococcus pneumoniae* em Qualquer Idade e *Mycoplasma pneumoniae* em Escolares (> 5 anos)"
      },
      {
        "letter": "C",
        "label": "Critérios de Pneumonia Grave",
        "value": "Tiragem Subcostal, Batimento de Asa de Nariz, Gemência e Sinais de Choque"
      },
      {
        "letter": "D",
        "label": "Tratamento Ambulatorial de Escolha",
        "value": "Amoxicilina Oral em Altas Doses (80-90 mg/kg/dia)"
      }
    ],
    "rule": "Consensos GINA & GOLD 2024: No tratamento de manutenção da asma, o corticoide inalatório (CI) associado a formoterol é a base obrigatória desde a etapa 1; monoterapia com SABA isolado não é mais recomendada.",
    "bancaTrap": "No escore CURB-65 para estratificação de PAC, pontuação ≥ 2 indica internação em enfermaria e ≥ 3 indica avaliação de UTI; não confunda com CRB-65 simplificado onde pontuação ≥ 1 já contraindica manejo ambulatorial puro.",
    "imageUrl": "/images/medical/pneumonia_lobar_rx.webp",
    "imageCaption": "Radiografia de tórax PA: consolidação alveolar homogênea em lobo inferior direito com broncograma aéreo nítido (Pneumonia Adquirida na Comunidade).",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Antonella GrottolaComments to Author , Fabio Forghieri, Marisa Meacci, Anna Fabio, Lorena Pozzi, Patrizia Marchegiano, Mauro Codeluppi, Monica Morselli, Leonardo Potenza, Ambra Paolini, Valeria Coluccio, Mario Luppi, Fabio Rumpianesi, and Monica Pecorari",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Severe_Pneumonia_Caused_by_Legionella_pneumophila_Serogroup_11,_Italy.jpg"
  },
  {
    "id": "tip-pedi-233-laringite-aguda-e-crupe-v",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Laringite Aguda e Crupe Viral",
    "fullTitle": "Laringite Aguda e Crupe Viral (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Laringite Aguda e Crupe Viral (Estridor)",
    "subfocos": [
      "Laringotraqueobronquite Viral (Crupe)",
      "Epiglotite Aguda e Diagnósticos Diferenciais"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Típica",
        "value": "Tosse Ladrante (\"Tosse de Cachorro\"), Rouquidão e Estridor Inspiratório"
      },
      {
        "letter": "B",
        "label": "Radiografia Cervical",
        "value": "Sinal da \"Torre de Igreja\" ou do \"Lápis\" (Estreitamento Subglótico)"
      },
      {
        "letter": "C",
        "label": "Tratamento Farmacológico Padrão",
        "value": "Dexametasona Oral/IM em Dose Única e Nebulização com Adrenalina se Estridor em Repouso"
      },
      {
        "letter": "D",
        "label": "Epiglotite Aguda por *Haemophilus influenzae* B",
        "value": "Febre Alta Súbita, Posição em Tripé, Sialorreia e Estridor Grave (Não Manipular a Cavidade Oral sem Via Aérea Pronta)"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-234-otite-media-aguda",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Otite Média Aguda",
    "fullTitle": "Otite Média Aguda (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Otite Média Aguda (OMA) e Mastoidite",
    "subfocos": [
      "Otoscopia e Tratamento Antimicrobiano da OMA",
      "Mastoidite Aguda e Complicações"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Achados Otoscópicos Obrigatórios",
        "value": "Abaulamento da Membrana Timpânica, Hiperemia e Otorreia Aguda"
      },
      {
        "letter": "B",
        "label": "Etiologias",
        "value": "*S. pneumoniae*, *Haemophilus influenzae* não tipável e *Moraxella catarrhalis*"
      },
      {
        "letter": "C",
        "label": "Tratamento de 1ª Escolha",
        "value": "Amoxicilina Oral (Indicação de Amoxicilina + Clavulanato se Falha Terapêutica ou Conjuntivite Concomitante)"
      },
      {
        "letter": "D",
        "label": "Mastoidite",
        "value": "Edema Retroauricular, Apagamento do Sulco Retroauricular e Proptose da Orelha"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-235-faringotonsilites-agudas",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Faringotonsilites Agudas",
    "fullTitle": "Faringotonsilites Agudas (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Faringotonsilites Agudas",
    "subfocos": [
      "Diferenciação Viral vs Bacteriana (Critérios de Centor)",
      "Abscesso Periamigdaliano e Retrofaríngeo"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Faringite Viral",
        "value": "Presença de Coriza, Tosse, Conjuntivite e Diarreia (Não Usar Antibiótico)"
      },
      {
        "letter": "B",
        "label": "Faringite Estreptocócica (*S. pyogenes*)",
        "value": "Febre Alta, Exsudato Amigdaliano Purulento, Petéquias no Palato e Adenopatia Cervical Dolorosa sem Tosse em Crianças > 3 Anos"
      },
      {
        "letter": "C",
        "label": "Abscesso Periamigdaliano e Retrofaríngeo",
        "value": "Tratamento com Penicilina Benzatina IM em Dose Única para Prevenção de Febre Reumática"
      },
      {
        "letter": "D",
        "label": "Abscesso Periamigdaliano e Retrofaríngeo",
        "value": "Trismo, Desvio da Úvula e Voz em \"Batata Quente"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-236-rinossinusite-aguda",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Rinossinusite Aguda",
    "fullTitle": "Rinossinusite Aguda (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Rinossinusite Aguda",
    "subfocos": [
      "Critérios Diagnósticos de Rinossinusite Bacteriana",
      "Complicações Orbitárias da Rinossinusite"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sintomas Persistentes",
        "value": "> 10 Dias sem Melhora), Piora Clínica (\"Duplo Acometimento\""
      },
      {
        "letter": "B",
        "label": "Critérios Diagnósticos de Rinossinusite Bacteriana",
        "value": "Tratamento com Amoxicilina Oral por 7-10 Dias"
      },
      {
        "letter": "C",
        "label": "Celulite Pré-Septal vs Pós-Septal / Orbitária",
        "value": "Oftalmoplegia, Proptose e Queda da Acuidade Visual"
      },
      {
        "letter": "D",
        "label": "Complicações Orbitárias da Rinossinusite",
        "value": "Tomografia Computadorizada de Crânio e Órbitas com Contraste"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-237-fibrose-cistica",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Fibrose Cística",
    "fullTitle": "Fibrose Cística (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Fibrose Cística",
    "subfocos": [
      "Fisiopatologia e Diagnóstico da Fibrose Cística",
      "Terapêutica Multidisciplinar e Moduladores do CFTR"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Triagem com Tripsina Imunorreativa",
        "value": "IRT) no Teste do Pezinho e Confirmação com Teste do Suor (Cloro no Suor >= 60 mEq/L em 2 Amostras"
      },
      {
        "letter": "B",
        "label": "Manifestações Pulmonares",
        "value": "Bronquiectasias, Colonização por *Pseudomonas aeruginosa*) e Digestivas (Insuficiência Pancreática Exócrina e Íleo Meconial"
      },
      {
        "letter": "C",
        "label": "Reposição de Enzimas Pancreáticas e Vitaminas Lipossolúveis",
        "value": "A, D, E, K"
      },
      {
        "letter": "D",
        "label": "Fisioterapia Respiratória, Alfadornase Inalatória e Moduladores",
        "value": "Ivacaftor / Elexacaftor"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-238-aspiracao-de-corpo-estran",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Aspiração de Corpo Estranho",
    "fullTitle": "Aspiração de Corpo Estranho (Afecções Respiratórias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Aspiração de Corpo Estranho",
    "subfocos": [
      "Quadro Clínico e Radiológico da Aspiração",
      "Manobras de Desengasgo no Lactente vs Maior de 1 Ano"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Radiografia de Tórax",
        "value": "Hiperinsuflação Unilateral por Mecanismo de Válvula e Desvio do Mediastino na Expiração"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico e Radiológico da Aspiração",
        "value": "Diagnóstico e Remoção Definitiva por Broncoscopia Rígida"
      },
      {
        "letter": "C",
        "label": "Lactente (< 1 Ano)",
        "value": "5 Golpes no Dorso seguidos de 5 Compressões Torácicas"
      },
      {
        "letter": "D",
        "label": "Crianças Maiores (> 1 Ano)",
        "value": "Manobra de Heimlich com Compressões Subdiafragmáticas"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-239-gastroenterite-aguda-vira",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Gastroenterite Aguda Viral e Bacteriana",
    "fullTitle": "Gastroenterite Aguda Viral e Bacteriana (Doenças Diarreicas e Terapia de Reidratação • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Gastroenterite Aguda Viral e Bacteriana (GECA)",
    "subfocos": [
      "Diarreia Aquosa Aguda (Rotavírus, Norovírus e EPEC/ETEC)",
      "Disenteria Aguda e Indicações de Antibiótico"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diarreia Aquosa Aguda (Rotavírus, Norovírus e EPEC/ETEC)",
        "value": "Rotavírus como Causa Frequente de Desidratação Grave e Vômitos Marcados"
      },
      {
        "letter": "B",
        "label": "Diarreia Aquosa Aguda (Rotavírus, Norovírus e EPEC/ETEC)",
        "value": "Manejo Inicial Centrado na Prevenção da Desidratação e Manutenção da Alimentação Habitual"
      },
      {
        "letter": "C",
        "label": "Fezes com Sangue, Muco e Pus associadas a Febre e Tenesmo",
        "value": "*Shigella*, *Campylobacter*, *Salmonella*, *EIEC*"
      },
      {
        "letter": "D",
        "label": "Indicações Formais de Antibioticoterapia",
        "value": "Disenteria com Comprometimento do Estado Geral (*Shigella*: Ciprofloxacino ou Ceftriaxona)"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-240-terapia-de-reidratacao-or",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Terapia de Reidratação Oral",
    "fullTitle": "Terapia de Reidratação Oral (Doenças Diarreicas e Terapia de Reidratação • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Terapia de Reidratação Oral (Planos A, B e C da OMS/MS)",
    "subfocos": [
      "Planos A, B e C de Manejo da Desidratação (MS/OMS)",
      "Sinais Clínicos de Desidratação e Falha do Plano B"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Plano A (Sem Desidratação - Domicílio)",
        "value": "Aumento da Oferta de Líquidos Caseiros, Solução de SRO após Cada Evacuação e Suplementação de Zinco por 10-14 Dias"
      },
      {
        "letter": "B",
        "label": "Plano B (Desidratação Leve a Moderada - Unidade de Saúde)",
        "value": "Terapia de Reidratação Oral (SRO) Supervisionada (50 a 100 mL/kg em 4 a 6 Horas); Não Administrar Alimentos Nem Outros Líquidos"
      },
      {
        "letter": "C",
        "label": "Plano C (Desidratação Grave / Choque Hipovolêmico - Hospitalar)",
        "value": "Expansão Venosa Rápida com Ringer Lactato ou Solução Fisiológica a 0,9%"
      },
      {
        "letter": "D",
        "label": "Olhos Encovados, Boca Seca, Sinal da Prega Lento",
        "value": "> 2s"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-241-diarreia-persistente-e-cr",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Diarreia Persistente e Crônica",
    "fullTitle": "Diarreia Persistente e Crônica (Doenças Diarreicas e Terapia de Reidratação • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Diarreia Persistente e Crônica",
    "subfocos": [
      "Diarreia Persistente (> 14 Dias) e Má Absorção",
      "Parasitoses Intestinais Causadoras de Diarreia Crônica"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Intolerância Secundária à Lactose Pós-Gastroenterite",
        "value": "Deficiência Transitória de Lactase e Fezes Ácidas com Eritema Perianal"
      },
      {
        "letter": "B",
        "label": "Diarreia Crônica Inespecífica",
        "value": "Diarreia dos Tropeiros / Toddler's Diarrhea"
      },
      {
        "letter": "C",
        "label": "Giardíase",
        "value": "Diarreia Esteatorreica, Dor Epigástrica e Tratamento com Metronidazol ou Nitazoxanida"
      },
      {
        "letter": "D",
        "label": "Parasitoses Intestinais Causadoras de Diarreia Crônica",
        "value": "Criptosporidiose em Crianças Imunodeprimidas"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-242-alergia-a-proteina-do-lei",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Alergia à Proteína do Leite de Vaca",
    "fullTitle": "Alergia à Proteína do Leite de Vaca (Doenças Diarreicas e Terapia de Reidratação • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Alergia à Proteína do Leite de Vaca (APLV)",
    "subfocos": [
      "Formas IgE-Mediadas vs Não-IgE-Mediadas da APLV",
      "Abordagem Nutricional e Dieta de Exclusão"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Formas IgE-Mediadas (Início Rápido < 2h)",
        "value": "Urticária, Angioedema, Vômitos Agudos e Anafilaxia; Teste Prick e IgE Específica Positivos"
      },
      {
        "letter": "B",
        "label": "Formas Não-IgE-Mediadas (Início Tardio)",
        "value": "Proctocolite Alérgica (Fezes com Sangue Vivo e Muco em Lactente Saudável e em Aleitamento Materno Exclusivo) e Enteropatia Induzida por Proteínas Alimentares (FPIES)"
      },
      {
        "letter": "C",
        "label": "Lactentes em Aleitamento Materno",
        "value": "Dieta Materna Isenta de Leite de Vaca e Derivados com Manutenção da Amamentação"
      },
      {
        "letter": "D",
        "label": "Lactentes em Uso de Fórmula",
        "value": "Substituição por Fórmula Extensamente Hidrolisada (ou Fórmula de Aminoácidos Livres se Anafilaxia/FPIES Grave)"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-243-doenca-celiaca-na-infanci",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doença Celíaca na Infância",
    "fullTitle": "Doença Celíaca na Infância (Doenças Diarreicas e Terapia de Reidratação • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Doença Celíaca na Infância",
    "subfocos": [
      "Diagnóstico e Triagem Sorológica na Criança",
      "Tratamento com Dieta Isenta de Glúten"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sorologia Inicial",
        "value": "Anticorpo Antitransglutaminase Tecidual IgA (associado à Dosagem de IgA Total)"
      },
      {
        "letter": "B",
        "label": "Critérios ESPGHAN para Dispensa de Biópsia Intestinal",
        "value": "Anti-tTG IgA > 10x LSN com Anti-Endomísio Positivo"
      },
      {
        "letter": "C",
        "label": "Tratamento com Dieta Isenta de Glúten",
        "value": "Exclusão Rigorosa e Perpétua de Trigo, Centeio, Cevada e Aveia Contaminada"
      },
      {
        "letter": "D",
        "label": "Tratamento com Dieta Isenta de Glúten",
        "value": "Acompanhamento do Crescimento e Normalização Sorológica"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-244-infeccao-do-trato-urinari",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Infecção do Trato Urinário na Criança",
    "fullTitle": "Infecção do Trato Urinário na Criança (Nefropatias e Infecções Urinárias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Infecção do Trato Urinário na Criança (Cistite e Pielonefrite)",
    "subfocos": [
      "Diagnóstico Clínico e Métodos de Coleta de Urina",
      "Tratamento Antimicrobiano e Rastreamento por Imagem"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Métodos Confiáveis de Coleta em Não Treinados",
        "value": "Cateterismo Vesical Aliviador (Critério Positivo: >= 50.000 UFC/mL) ou Punção Suprapúbica (Qualquer Contagem de Gram-Negativos)"
      },
      {
        "letter": "B",
        "label": "Saco Coletor",
        "value": "Alto Índice de Falsos-Positivos (Serve Apenas para Afastar ITU quando Urocultura Negativa)"
      },
      {
        "letter": "C",
        "label": "Etiologia Predominante",
        "value": "*Escherichia coli* (> 80-90%)"
      },
      {
        "letter": "D",
        "label": "Cistite vs Pielonefrite Aguda",
        "value": "Febre Alta, Calafrios, Vômitos e Marcadores Inflamatórios Elevados"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-245-refluxo-vesicoureteral-e",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Refluxo Vesicoureteral e Malformações Urinárias",
    "fullTitle": "Refluxo Vesicoureteral e Malformações Urinárias (Nefropatias e Infecções Urinárias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Refluxo Vesicoureteral e Malformações Urinárias",
    "subfocos": [
      "Classificação Radiológica e Investigação do RVU",
      "Profilaxia Antimicrobiana e Tratamento Cirúrgico"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação Radiológica e Investigação do RVU",
        "value": "Cintilografia Renal com DMSA para Avaliação de Cicatrizes Renais e Função Renal Diferencial"
      },
      {
        "letter": "B",
        "label": "Profilaxia Antimicrobiana e Tratamento Cirúrgico",
        "value": "Quimioprofilaxia com Nitrofurantoína ou Sulfametoxazol-Trimetoprima em Baixas Doses Noturnas"
      },
      {
        "letter": "C",
        "label": "Parâmetro de Avaliação 3",
        "value": "Estratificação de gravidade e monitorização contínua de resposta terapêutica"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-246-glomerulonefrite-difusa-a",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Glomerulonefrite Difusa Aguda Pós-Estreptocócica",
    "fullTitle": "Glomerulonefrite Difusa Aguda Pós-Estreptocócica (Nefropatias e Infecções Urinárias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Glomerulonefrite Difusa Aguda Pós-Estreptocócica (GNPE)",
    "subfocos": [
      "Fisiopatologia e Quadro Clínico da GNPE",
      "Evolução Laboratorial e Manejo das Complicações"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Indicações Cirúrgicas",
        "value": "Graus IV-V, Cicatrizes Renais Progressivas ou Falha do Manejo Clínico"
      },
      {
        "letter": "B",
        "label": "Tríade Clássica Nefrítica",
        "value": "Hematúria Dismórfica Macroscópica (\"Urina em Cor de Chá/Coca-Cola\"), Hipertensão Arterial Sistêmica e Edema Periorbitário/Oligúria"
      },
      {
        "letter": "C",
        "label": "Período de Latência Obrigatório",
        "value": "1 a 3 Semanas após Faringoamigdalite ou 2 a 6 Semanas após Piodermite / Impetigo"
      },
      {
        "letter": "D",
        "label": "Marcadores de Infecção Estreptocócica Prévia",
        "value": "ASLO pós-faringite, Anti-DNAse B pós-piodermite"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-247-sindrome-nefrotica-na-inf",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Síndrome Nefrótica na Infância",
    "fullTitle": "Síndrome Nefrótica na Infância (Nefropatias e Infecções Urinárias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Síndrome Nefrótica na Infância (Lesão Mínima)",
    "subfocos": [
      "Diagnóstico da Doença por Lesão Mínima (DLM)",
      "Corticoterapia e Complicações Infecciosas/Trombóticas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Indicações Formais de Biópsia Renal",
        "value": "Falha de Normalização do C3 após 8 Semanas, Proteinúria Nefrótica Persistente ou Perda Rápida de Função Renal (GNRP)"
      },
      {
        "letter": "B",
        "label": "Tratamento de Suporte",
        "value": "Restrição Hídrica e Salina, e Uso de Furosemida EV para Controle da Hipertensão e Sobrecarga Volêmica"
      },
      {
        "letter": "C",
        "label": "Tétrada Clássica",
        "value": "Edema Periférico Grave Anasarca, Proteinúria Maciça (> 50 mg/kg/dia ou Relação P/C Urinária > 2), Hipoalbuminemia (< 2,5 g/dL) e Hipercolesterolemia"
      },
      {
        "letter": "D",
        "label": "Diagnóstico da Doença por Lesão Mínima (DLM)",
        "value": "Doença por Lesão Mínima como Causa em > 85-90% das Crianças de 1 a 8 Anos com Complemento Sérico Normal e Sedimento Urinário Inocente"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-248-sindrome-hemolitico-uremi",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Síndrome Hemolítico-Urêmica",
    "fullTitle": "Síndrome Hemolítico-Urêmica (Nefropatias e Infecções Urinárias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Síndrome Hemolítico-Urêmica (SHU)",
    "subfocos": [
      "Tríade Clássica da SHU Típica (D+)",
      "Manejo Clínico e Contraindicações Absolutas"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Precedida por Episódio de Diarreia com Sangue causada por *E. coli* Produtora de Shiga-Toxina (STEC / O157",
        "value": "H7)"
      },
      {
        "letter": "B",
        "label": "Tríade Diagnóstica",
        "value": "Anemia Hemolítica Microangiopática (Coombs Negativo, Esquizócitos no Sangue), Trombocitopenia de Consumo e Injúria Renal Aguda Oligúrica"
      },
      {
        "letter": "C",
        "label": "Manejo Clínico e Contraindicações Absolutas",
        "value": "Manejo de Suporte Rigoroso com Diálise Precoce e Controle Hidroeletrolítico"
      },
      {
        "letter": "D",
        "label": "Contraindicações Críticas",
        "value": "Não Usar Antibióticos nem Antidiarreicos na Diarreia por STEC (Aumentam a Liberação de Toxina e Agravam a SHU); Evitar Transfusão de Plaquetas de Rotina"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-249-enurese-e-disturbios-micc",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Enurese e Distúrbios Miccionais",
    "fullTitle": "Enurese e Distúrbios Miccionais (Nefropatias e Infecções Urinárias na Infância • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Enurese e Distúrbios Miccionais",
    "subfocos": [
      "Enurese Noturna Monossintomática",
      "Disfunção do Trato Urinário Inferior e Bexiga Neurogênica"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tratamento de 1ª Linha",
        "value": "Alarme Noturno de Umidade e Conduta Comportamental"
      },
      {
        "letter": "B",
        "label": "Farmacoterapia com Desmopressina",
        "value": "Análogo do ADH"
      },
      {
        "letter": "C",
        "label": "Disfunção do Trato Urinário Inferior e Bexiga Neurogênica",
        "value": "Urgência, Incontinência Diurna e Manobras de Retenção"
      },
      {
        "letter": "D",
        "label": "Associação com Constipação Intestinal",
        "value": "Síndrome de Eliminação Disfuncional"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-250-anemia-ferropriva-na-cria",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Anemia Ferropriva na Criança",
    "fullTitle": "Anemia Ferropriva na Criança (Hematologia e Oncologia Pediátrica • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Anemia Ferropriva na Criança",
    "subfocos": [
      "Diagnóstico Laboratorial da Carência de Ferro",
      "Tratamento com Sulfato Ferroso e Resposta Reticulocitária"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Anemia Microcítica e Hipocrômica com RDW Elevado",
        "value": "Anisocitose Marcada"
      },
      {
        "letter": "B",
        "label": "Cinética do Ferro",
        "value": "Ferritina Sérica Baixa (< 12-15 ng/mL - Parâmetro Mais Sensível e Específico), Ferro Sérico Baixo e Capacidade Total de Ligação (TIBC) Elevada"
      },
      {
        "letter": "C",
        "label": "Dose Terapêutica",
        "value": "3 a 5 mg/kg/dia de Ferro Elementar Fracionado em Jejum ou com Sucos Cítricos"
      },
      {
        "letter": "D",
        "label": "Crise Reticulocitária",
        "value": "Pico entre o 5º e 10º Dia de Tratamento Comprovando Efetividade"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-251-doenca-falciforme-e-crise",
    "category": "transfusao",
    "categoryLabel": "Gatilhos Hemoterápicos",
    "title": "Doença Falciforme e Crises Falcêmicas",
    "fullTitle": "Doença Falciforme e Crises Falcêmicas (Hematologia e Oncologia Pediátrica • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Doença Falciforme e Crises Falcêmicas",
    "subfocos": [
      "Crises Agudas Falcêmicas na Infância",
      "Profilaxia Infecciosa e Modificadores da Doença"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Crise Vaso-Oclusiva Dolorosa",
        "value": "Dactilite Falcêmica / Síndrome Mão-Pé no Lactente"
      },
      {
        "letter": "B",
        "label": "Síndrome Torácica Aguda",
        "value": "Novo Infiltrado Pulmonar associado a Febre, Dor Torácica e Hipoxemia - Emergência com Hidratação Cautelosa, Antibiótico e Transfusão"
      },
      {
        "letter": "C",
        "label": "Sequestro Esplênico Agudo",
        "value": "Queda Rápida de Hb com Esplenomegalia Volumosa e Choque Hipovolêmico"
      },
      {
        "letter": "D",
        "label": "Profilaxia Infecciosa e Modificadores da Doença",
        "value": "Profilaxia com Penicilina Oral dos 3 Meses aos 5 Anos de Vida para Prevenção de Sepse Pneumocócica"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-252-talassemias-e-esferocitos",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Talassemias e Esferocitose Hereditária",
    "fullTitle": "Talassemias e Esferocitose Hereditária (Hematologia e Oncologia Pediátrica • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Talassemias e Esferocitose Hereditária",
    "subfocos": [
      "Betatalassemia Major e Minor",
      "Esferocitose Hereditária"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Traço Talassêmico (Talassemia Minor)",
        "value": "Microcitose Intensa Desproporcional à Anemia Leve com RDW Normal e Índice de Mentzer < 13"
      },
      {
        "letter": "B",
        "label": "Talassemia Major (Anemia de Cooley)",
        "value": "Dependência Transfusional Crônica, Fácies Talassêmica e Sobrecarga de Ferro (Quelantes)"
      },
      {
        "letter": "C",
        "label": "Defeito de Membrana Eritrocitária",
        "value": "Espectrina/Anquirina"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-253-purpura-trombocitopenica",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Púrpura Trombocitopênica Imune",
    "fullTitle": "Púrpura Trombocitopênica Imune (Hematologia e Oncologia Pediátrica • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Púrpura Trombocitopênica Imune (PTI) e Henoch-Schönlein",
    "subfocos": [
      "Púrpura Trombocitopênica Imune Aguda Pediátrica",
      "Púrpura de Henoch-Schönlein (Vasculite por IgA)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Púrpura Trombocitopênica Imune Aguda Pediátrica",
        "value": "Teste de Fragilidade Osmótica Positivo e Esplenomegalia Crônica com Resposta à Esplenectomia"
      },
      {
        "letter": "B",
        "label": "Plaquetopenia Isolada e Severa",
        "value": "< 20.000-30.000/mm3"
      },
      {
        "letter": "C",
        "label": "Conduta Expectante nos Casos com Manifestações Cutâneas Exclusivas",
        "value": "Petéquias/Púrpuras"
      },
      {
        "letter": "D",
        "label": "Tratamento com Corticoides Orais ou Imunoglobulina EV",
        "value": "IVIG"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-254-leucemias-agudas-na-infan",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Leucemias Agudas na Infância",
    "fullTitle": "Leucemias Agudas na Infância (Hematologia e Oncologia Pediátrica • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Leucemias Agudas na Infância (LLA)",
    "subfocos": [
      "Diagnóstico e Quadro Clínico da LLA",
      "Estratificação Prognóstica e Emergências na LLA"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Neoplasia Maligna Mais Comum da Infância",
        "value": "Pico entre 2 e 5 Anos de Vida"
      },
      {
        "letter": "B",
        "label": "Estratificação Prognóstica e Emergências na LLA",
        "value": "Sintomas B, Palidez, Sangramentos, Dores Ósseas Noturnas, Hepatoesplenomegalia e Linfadenopatia Generalizada"
      },
      {
        "letter": "C",
        "label": "Estratificação Prognóstica e Emergências na LLA",
        "value": "Hemograma com Pancitopenia ou Leucocitose com Blastos Circulantes; Confirmação por Mielograma com >= 20% de Blastos e Imunofenotipagem B ou T"
      },
      {
        "letter": "D",
        "label": "Fatores Prognósticos",
        "value": "Idade (1-9 Anos Melhor Prognóstico), Contagem de Leucócitos e Alterações Citogenéticas (Hiperdiploidia favorável vs t(9;22) BCR-ABL)"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-255-linfomas-pediatricos",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Linfomas Pediátricos",
    "fullTitle": "Linfomas Pediátricos (Hematologia e Oncologia Pediátrica • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Linfomas Pediátricos (Hodgkin e Não-Hodgkin)",
    "subfocos": [
      "Linfoma de Burkitt e Não-Hodgkin na Criança",
      "Linfoma de Hodgkin Pediátrico"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Linfoma de Burkitt e Não-Hodgkin na Criança",
        "value": "Prevenção da Síndrome de Lise Tumoral e Profilaxia do Sistema Nervoso Central com Quimioterapia Intratecal"
      },
      {
        "letter": "B",
        "label": "Linfoma de Burkitt",
        "value": "Crescimento Extremamente Rápido, Massa Abdominal Volumosa (Íleo-Cecal) e Histologia em \"Céu Estrelado"
      },
      {
        "letter": "C",
        "label": "Linfoma de Hodgkin Pediátrico",
        "value": "Alto Risco de Síndrome de Lise Tumoral Aguda"
      },
      {
        "letter": "D",
        "label": "Linfoma de Hodgkin Pediátrico",
        "value": "Linfadenopatia Cervical ou Supraclavicular Indolor, Endurecida e Aderida em Adolescentes associada a Sintomas B"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-256-tumores-solidos-pediatric",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Tumores Sólidos Pediátricos",
    "fullTitle": "Tumores Sólidos Pediátricos (Hematologia e Oncologia Pediátrica • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Tumores Sólidos Pediátricos (Neuroblastoma e Tumor de Wilms)",
    "subfocos": [
      "Nefroblastoma (Tumor de Wilms)",
      "Neuroblastoma"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Nefroblastoma (Tumor de Wilms)",
        "value": "Hematúria e Hipertensão Arterial associadas; Excelente Prognóstico Geral"
      },
      {
        "letter": "B",
        "label": "Origem na Crista Neural / Adrenal",
        "value": "Massa Abdominal Irregular, Dura e Fixa que Frequentemente ULTRAPASSA a Linha Média em Lactentes"
      },
      {
        "letter": "C",
        "label": "Metástases Ósseas e Orbitárias",
        "value": "Hematoma Periorbital em \"Olhos de Guaxinim\""
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-257-cardiopatias-congenitas-a",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Cardiopatias Congênitas Acianóticas",
    "fullTitle": "Cardiopatias Congênitas Acianóticas (Cardiopatias Congênitas e Adquiridas • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Cardiopatias Congênitas e Adquiridas",
    "foco": "Cardiopatias Congênitas Acianóticas (CIV, CIA, PCA, Coarctação de Aorta)",
    "subfocos": [
      "Comunicação Interventricular (CIV) e PCA",
      "Comunicação Interatrial (CIA) e Coarctação da Aorta"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "CIV",
        "value": "Cardiopatia Congênita Mais Frequente, Sopro Holossistólico Áspero em Borda Esternal Esquerda Baixa com Frêmito"
      },
      {
        "letter": "B",
        "label": "Persistência do Canal Arterial (PCA)",
        "value": "Sopro Contínuo em \"Maquinária\" infraclavicular esquerdo e Pulsos Amplos"
      },
      {
        "letter": "C",
        "label": "CIA",
        "value": "Desdobramento Fixo e Constante da Segunda Bulha (B2) com Sopro Sistólico Ejetivo Pulmonar"
      },
      {
        "letter": "D",
        "label": "Coarctação da Aorta",
        "value": "Hipertensão em Membros Superiores com Pulsos Femorais Diminuídos ou Ausentes e Hipotensão em Membros Inferiores"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-258-cardiopatias-congenitas-c",
    "category": "radiologia",
    "categoryLabel": "Sinais Radiológicos & ECG",
    "title": "Cardiopatias Congênitas Cianóticas",
    "fullTitle": "Cardiopatias Congênitas Cianóticas (Cardiopatias Congênitas e Adquiridas • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Cardiopatias Congênitas e Adquiridas",
    "foco": "Cardiopatias Congênitas Cianóticas (Tetralogia de Fallot, Transposição das Grandes Artérias)",
    "subfocos": [
      "Tetralogia de Fallot",
      "Transposição das Grandes Artérias (TGA)"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Crises Hipoxêmicas / Cianóticas",
        "value": "Piora com Choro/Agitação e Melhora na Posição de Cócoras / Genupeitoral (Aumenta a RVS)"
      },
      {
        "letter": "B",
        "label": "Radiografia com Silhueta Cardíaca em \"Tamanco Holandês\"",
        "value": "Coração em Bota"
      },
      {
        "letter": "C",
        "label": "Cardiopatia Cianótica Mais Comum no Período Neonatal Imediato",
        "value": "Cianose Intensa e Refratária a O2 nas Primeiras Horas"
      },
      {
        "letter": "D",
        "label": "Cardiopatia Canal-Dependente",
        "value": "Manutenção Obrigatória com Infusão Contínua de Prostaglandina E1 (Alprostadil)"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-259-febre-reumatica-e-cardite",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Febre Reumática e Cardite",
    "fullTitle": "Febre Reumática e Cardite (Cardiopatias Congênitas e Adquiridas • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Cardiopatias Congênitas e Adquiridas",
    "foco": "Febre Reumática e Cardite",
    "subfocos": [
      "Critérios de Jones Atualizados (AHA)",
      "Tratamento da Crise e Profilaxia Secundária"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Maiores",
        "value": "Poliartrite Migratória de Grandes Articulações, Cardite (Valvulite Mitral com Sopro Regurgitante), Coreia de Sydenham, Nódulos Subcutâneos e Eritema Marginado"
      },
      {
        "letter": "B",
        "label": "Critérios Menores",
        "value": "Febre, Artralgia, Aumento de VHS/PCR e Alargamento do Intervalo PR"
      },
      {
        "letter": "C",
        "label": "Evidência Obrigatória de Infecção Estreptocócica Prévia",
        "value": "ASLO ou Cultura de Orofaringe"
      },
      {
        "letter": "D",
        "label": "Tratamento da Crise e Profilaxia Secundária",
        "value": "Erradicação do Estreptococo com Penicilina Benzatina IM"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-pedi-260-insuficiencia-cardiaca-na",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Insuficiência Cardíaca na Criança",
    "fullTitle": "Insuficiência Cardíaca na Criança (Cardiopatias Congênitas e Adquiridas • Pediatria)",
    "specialty": "Pediatria",
    "tema": "Cardiopatias Congênitas e Adquiridas",
    "foco": "Insuficiência Cardíaca na Criança",
    "subfocos": [
      "Quadro Clínico e Etiologias por Idade",
      "Manejo Farmacológico da IC Pediátrica"
    ],
    "provenanceDefault": "Sociedade Brasileira de Pediatria (SBP) / PNI 2025",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Manifestações no Lactente",
        "value": "Dificuldade nas Mamadas com Pausas Frequentes e Sudorese Excessiva na Cabeça, Taquipneia e Ganho de Peso Insuficiente"
      },
      {
        "letter": "B",
        "label": "Sinal Físico Mais Confiável de Congestão Sistêmica",
        "value": "Hepatomegalia Dolorosa (Raramente Edema de MMII no Lactente)"
      },
      {
        "letter": "C",
        "label": "Diuréticos de Alça",
        "value": "Furosemida"
      },
      {
        "letter": "D",
        "label": "Inibidores da ECA",
        "value": "Captopril) e Betabloqueadores (Carvedilol"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-gine-261-ciclo-menstrual-e-eixo-hi",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário",
    "fullTitle": "Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário (Fisiologia Menstrual e Sangramento Uterino Anormal • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Fisiologia Menstrual e Sangramento Uterino Anormal",
    "foco": "Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário",
    "subfocos": [
      "Fisiologia do Ciclo Ovariano e Endometrial",
      "Controle Neuroendócrino e Feedback Hormonal"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fase Folicular / Proliferativa",
        "value": "Recrutamento Folicular, Seleção do Folículo Dominante e Pico de Estradiol"
      },
      {
        "letter": "B",
        "label": "Fisiologia do Ciclo Ovariano e Endometrial",
        "value": "Pico Pré-Ovulatório de LH, Mecanismo da Ovulação e Formação do Corpo Lúteo"
      },
      {
        "letter": "C",
        "label": "Fase Lútea / Secretora",
        "value": "Secreção de Progesterona, Degeneração Lútea e Mecanismo da Menstruação"
      },
      {
        "letter": "D",
        "label": "Pulsatilidade do GnRH Hipotalâmico",
        "value": "Frequência e Amplitude"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-262-sangramento-uterino-anorm",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Sangramento Uterino Anormal",
    "fullTitle": "Sangramento Uterino Anormal (Fisiologia Menstrual e Sangramento Uterino Anormal • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Fisiologia Menstrual e Sangramento Uterino Anormal",
    "foco": "Sangramento Uterino Anormal (Classificação PALM-COEIN)",
    "subfocos": [
      "Causas Estruturais - Mnemônico PALM",
      "Causas Não-Estruturais - Mnemônico COEIN"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Causas Estruturais - Mnemônico PALM",
        "value": "Pólipo Endometrial e Adenomiose Focal/Difusa"
      },
      {
        "letter": "B",
        "label": "Leiomioma Uterino",
        "value": "Classificação FIGO Submucoso vs Intramural vs Subseroso"
      },
      {
        "letter": "C",
        "label": "Causas Estruturais - Mnemônico PALM",
        "value": "Malignidade e Hiperplasia com Atipia"
      },
      {
        "letter": "D",
        "label": "Coagulopatias",
        "value": "Doença de von Willebrand em Meninas Adolescentes"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-263-manejo-farmacologico-e-ci",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Manejo Farmacológico e Cirúrgico do SUA",
    "fullTitle": "Manejo Farmacológico e Cirúrgico do SUA (Fisiologia Menstrual e Sangramento Uterino Anormal • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Fisiologia Menstrual e Sangramento Uterino Anormal",
    "foco": "Manejo Farmacológico e Cirúrgico do SUA",
    "subfocos": [
      "Abordagem Aguda e Hemodinâmica do SUA Grave",
      "Tratamento Clínico Crônico e Opções Cirúrgicas"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estabilização Hemodinâmica e Estrogênios Conjugados em Altas Doses ou Antifibrinolíticos",
        "value": "Ácido Tranexâmico EV/Oral"
      },
      {
        "letter": "B",
        "label": "Tamponamento Mecânico com Balão Intrauterino",
        "value": "Sonda de Foley"
      },
      {
        "letter": "C",
        "label": "Tratamento Clínico Crônico e Opções Cirúrgicas",
        "value": "SIU de Levonorgestrel, Progestágenos Orais Contínuos e ACOs Combinados"
      },
      {
        "letter": "D",
        "label": "Ablação Endometrial Histeroscópica e Histerectomia",
        "value": "Indicações, Vias e Prole Constituída"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-264-amenorreia-primaria",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Amenorreia Primária",
    "fullTitle": "Amenorreia Primária (Amenorreias e Distúrbios Neuroendócrinos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Amenorreias e Distúrbios Neuroendócrinos",
    "foco": "Amenorreia Primária (Investigação e Disgenesias Gonadais)",
    "subfocos": [
      "Amenorreia Primária com Caracteres Sexuais Secundários Presentes",
      "Amenorreia Primária sem Caracteres Sexuais Secundários"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Síndrome de Mayer-Rokitansky-Küster-Hauser",
        "value": "Agenesia Mülleriana, Cariótipo 46,XX, Ovários Normais e Ausência de Útero/2/3 Superiores de Vagina"
      },
      {
        "letter": "B",
        "label": "Síndrome de Insensibilidade Aos Androgênios / Morris",
        "value": "Cariótipo 46,XY, Testículos Intra-abdominais, Pelos Pubianos Ausentes/Escassos"
      },
      {
        "letter": "C",
        "label": "Hímen Imperfurado e Septo Vaginal Transverso",
        "value": "Hematocolpo / Hematometra com Dor Cíclica"
      },
      {
        "letter": "D",
        "label": "Hipogonadismo Hipergonadotrófico",
        "value": "Síndrome de Turner (45,X0) e Disgenesia Gonadal Pura (FSH e LH Muito Elevados)"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-265-amenorreia-secundaria",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Amenorreia Secundária",
    "fullTitle": "Amenorreia Secundária (Amenorreias e Distúrbios Neuroendócrinos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Amenorreias e Distúrbios Neuroendócrinos",
    "foco": "Amenorreia Secundária (Investigação Passo a Passo)",
    "subfocos": [
      "Algoritmo Sequencial de Investigação da Amenorreia Secundária",
      "Causas Uterinas e Amenorreia Hipotalâmica Funcional"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Passo 1",
        "value": "Exclusão Mandatória de Gravidez (Beta-hCG) e Dosagem de TSH e Prolactina"
      },
      {
        "letter": "B",
        "label": "Passo 2",
        "value": "Teste da Progesterona (Avaliação do Status Estrogênico e Trato de Saída Íntegro com Sangramento Positivo)"
      },
      {
        "letter": "C",
        "label": "Passo 3",
        "value": "Teste do Estrogênio + Progesterona (Sangramento Negativo Confirma Causa Anatômica / Uterina)"
      },
      {
        "letter": "D",
        "label": "Passo 4",
        "value": "Dosagem de FSH e LH (Diferenciação Ovariana vs Hipotálamo-Hipofisária)"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-266-hiperprolactinemia-e-aden",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hiperprolactinemia e Adenomas Hipofisários",
    "fullTitle": "Hiperprolactinemia e Adenomas Hipofisários (Amenorreias e Distúrbios Neuroendócrinos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Amenorreias e Distúrbios Neuroendócrinos",
    "foco": "Hiperprolactinemia e Adenomas Hipofisários",
    "subfocos": [
      "Diagnóstico e Etiologia da Hiperprolactinemia",
      "Prolactinomas e Tratamento com Agonistas Dopaminérgicos"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Manifestações Clínicas",
        "value": "Galactorreia, Oligomenorreia / Amenorreia, Infertilidade e Sintomas Compressivos (Hemianopsia Bitemporal)"
      },
      {
        "letter": "B",
        "label": "Causas Medicamentosas",
        "value": "Antipsicóticos, Metoclopramida, Antidepressivos) vs Hipotireoidismo Primário (TRH estimula prolactina"
      },
      {
        "letter": "C",
        "label": "Diferenciação Tomográfica/Ressonância entre Microadenoma",
        "value": "< 10 mm) e Macroadenoma (>= 10 mm"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-267-falencia-ovariana-prematu",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Falência Ovariana Prematura",
    "fullTitle": "Falência Ovariana Prematura (Amenorreias e Distúrbios Neuroendócrinos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Amenorreias e Distúrbios Neuroendócrinos",
    "foco": "Falência Ovariana Prematura",
    "subfocos": [
      "Diagnóstico e Quadro Clínico da Insuficiência Ovariana Prematura",
      "Terapia Hormonal e Riscos a Longo Prazo"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Clínicos e Laboratoriais",
        "value": "Amenorreia >= 4 Meses antes dos 40 Anos associada a Níveis Menopáusicos de FSH (> 25-40 UI/L) Confirmados em 2 Dosagens"
      },
      {
        "letter": "B",
        "label": "Etiologias Autoimunes, Genéticas",
        "value": "Pré-Mutação do X Frágil) e Iatrogênicas (Quimioterapia / Radioterapia"
      },
      {
        "letter": "C",
        "label": "Indicação Mandatória de Terapia Hormonal Substitutiva até a Idade Média da Menopausa Natural",
        "value": "~50 Anos"
      },
      {
        "letter": "D",
        "label": "Preservação da Fertilidade e Risco Residual de Ovulação Espontânea",
        "value": "5-10%"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-268-sindrome-dos-ovarios-poli",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Síndrome dos Ovários Policísticos",
    "fullTitle": "Síndrome dos Ovários Policísticos (Síndrome dos Ovários Policísticos e Hiperandrogenismo • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "foco": "Síndrome dos Ovários Policísticos (SOP: Critérios de Rotterdam e Fenótipos)",
    "subfocos": [
      "Diagnóstico e Critérios de Rotterdam Atualizados",
      "Manejo Clínico, Metabólico e Reprodutivo da SOP"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Canônicos (2 de 3)",
        "value": "Oligo/Anovulação, Hiperandrogenismo Clínico/Laboratorial e Morfologia Ovariana Policística à USG (>= 20 folículos de 2-9 mm por ovário ou volume >= 10 mL)"
      },
      {
        "letter": "B",
        "label": "Fenótipos da SOP (A",
        "value": "Completo; B: Ovulatório; C: Hiperandrogênico sem ovários policísticos; D: Não Hiperandrogênico)"
      },
      {
        "letter": "C",
        "label": "Exclusão Obrigatória de Outras Causas",
        "value": "HAC Não Clássica, Hiperprolactinemia, Disfunção Tireoidiana e Tumores Virilizantes"
      },
      {
        "letter": "D",
        "label": "Mudança do Estilo de Vida",
        "value": "Dieta e Atividade Física com Perda de 5-10% do Peso"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia.",
    "imageUrl": "/images/medical/sop_usg.webp",
    "imageCaption": "Ultrassonografia pélvica: ovário de volume aumentado (> 10 cm³) exibindo múltiplos pequenos folículos periféricos com aspecto 'em colar de pérolas'.",
    "imageModality": "usg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Anne Mousse",
    "imageLicense": "CC0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Echographie_pelvienne,_aplio_toshiba_ssa_700_5_2004_01.JPG"
  },
  {
    "id": "tip-gine-269-hiperandrogenismo-e-hirsu",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hiperandrogenismo e Hirsutismo",
    "fullTitle": "Hiperandrogenismo e Hirsutismo (Síndrome dos Ovários Policísticos e Hiperandrogenismo • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "foco": "Hiperandrogenismo e Hirsutismo",
    "subfocos": [
      "Avaliação Clínica do Hirsutismo e Escore de Ferriman-Gallwey",
      "Terapia Antiandrogênica Farmacológica"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Escore de Ferriman-Gallwey modificado",
        "value": "Pontuação >= 8 indica hirsutismo clinicamente relevante em 9 áreas andrógeno- dependentes"
      },
      {
        "letter": "B",
        "label": "Diferenciação Hirsutismo",
        "value": "Pelos terminais em áreas masculinas) vs Hipertricose (Aumento generalizado de lanugem"
      },
      {
        "letter": "C",
        "label": "Bloqueadores dos Receptores Androgênicos",
        "value": "Espironolactona (Necessidade de Anticoncepção Rigorosa pelo Risco de Feminilização de Feto Masculino)"
      },
      {
        "letter": "D",
        "label": "Inibidores da 5-Alfa-Redutase",
        "value": "Finasterida"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-270-hiperplasia-adrenal-conge",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Hiperplasia Adrenal Congênita Forma Não-Clássica",
    "fullTitle": "Hiperplasia Adrenal Congênita Forma Não-Clássica (Síndrome dos Ovários Policísticos e Hiperandrogenismo • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "foco": "Hiperplasia Adrenal Congênita Forma Não-Clássica",
    "subfocos": [
      "Diagnóstico da Deficiência Tardia da 21-Hidroxilase",
      "Tratamento com Glicocorticoides"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico da Deficiência Tardia da 21-Hidroxilase",
        "value": "Manifestação no Final da Adolescência com Hirsutismo, Acne Severa e Irregularidade Menstrual Mimetizando a SOP"
      },
      {
        "letter": "B",
        "label": "Dosagem da 17-Hidroxiprogesterona",
        "value": "17-OHP) Basal Pela Manhã na Fase Folicular (> 2 ng/mL suspeito; > 10 ng/mL diagnóstico; teste de estímulo com ACTH se intermediário"
      },
      {
        "letter": "C",
        "label": "Tratamento com Glicocorticoides",
        "value": "Supressão do ACTH com Dexametasona ou Prednisona em Baixas Doses Noturnas"
      },
      {
        "letter": "D",
        "label": "Tratamento com Glicocorticoides",
        "value": "Indicações em Pacientes Sintomáticas ou com Infertilidade"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-271-sindrome-climaterica-e-fi",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Síndrome Climatérica e Fisiologia da Menopausa",
    "fullTitle": "Síndrome Climatérica e Fisiologia da Menopausa (Climatério, Menopausa e Terapia Hormonal • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Climatério, Menopausa e Terapia Hormonal",
    "foco": "Síndrome Climatérica e Fisiologia da Menopausa",
    "subfocos": [
      "Fisiopatologia e Transição Menopáusica (Critérios STRAW)",
      "Sintomas Vasomotores e Alterações Neuropsíquicas"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia e Transição Menopáusica (Critérios STRAW)",
        "value": "Depleção Folicular Ovariana Progressiva com Queda da Inibina B, Aumento Precoce de FSH e Flutuações Estrogênicas"
      },
      {
        "letter": "B",
        "label": "Definição Retrospectiva de Menopausa",
        "value": "12 Meses Consecutivos de Amenorreia sem Outra Causa Óbvia (Idade Média de 50-51 Anos)"
      },
      {
        "letter": "C",
        "label": "Ondas de Calor",
        "value": "Fogachos"
      },
      {
        "letter": "D",
        "label": "Tratamento Não Hormonal para Fogachos",
        "value": "Inibidores Seletivos da Recaptação de Serotonina (Paroxetina, Sertralina) e Venlafaxina"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-272-terapia-hormonal-da-menop",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Terapia Hormonal da Menopausa",
    "fullTitle": "Terapia Hormonal da Menopausa (Climatério, Menopausa e Terapia Hormonal • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Climatério, Menopausa e Terapia Hormonal",
    "foco": "Terapia Hormonal da Menopausa (Indicações, Janela de Oportunidade e Contraindicações)",
    "subfocos": [
      "Indicações Formais e a \"Janela de Oportunidade\"",
      "Contraindicações Absolutas da Terapia Hormonal"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Conceito da Janela de Oportunidade",
        "value": "Início com Menos de 60 Anos de Idade ou Menos de 10 Anos de Menopausa (Relação Risco-Benefício Favorável)"
      },
      {
        "letter": "B",
        "label": "Esquema para Mulheres com Útero",
        "value": "Estrogênio associado Obrigatoriamente a Progestagênio para Proteção Endometrial (Prevenção de Câncer de Endométrio); Mulheres Histerectomizadas: Estrogênio Isolado"
      },
      {
        "letter": "C",
        "label": "Contraindicações Absolutas da Terapia Hormonal",
        "value": "Câncer de Mama Vigente ou Prévio e Lesões Precursoras com Alto Risco"
      },
      {
        "letter": "D",
        "label": "Neoplasias Malignas Hormonodependentes",
        "value": "Câncer de Endométrio"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-273-osteoporose-pos-menopausa",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Osteoporose Pós-Menopausa e Risco de Fratura",
    "fullTitle": "Osteoporose Pós-Menopausa e Risco de Fratura (Climatério, Menopausa e Terapia Hormonal • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Climatério, Menopausa e Terapia Hormonal",
    "foco": "Osteoporose Pós-Menopausa e Risco de Fratura",
    "subfocos": [
      "Densitometria Óssea e Critérios da OMS (T-Score)",
      "Farmacoterapia da Osteoporose (Bisfosfonatos e Anabólicos)"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios de T-Score (Coluna Lombar e Fêmur Proximal)",
        "value": "Normal (>= -1,0 DP), Osteopenia (entre -1,0 e -2,5 DP), Osteoporose (<= -2,5 DP) e Osteoporose Estabelecida / Grave (<= -2,5 com Fratura por Fragilidade)"
      },
      {
        "letter": "B",
        "label": "Densitometria Óssea e Critérios da OMS (T-Score)",
        "value": "Calculadora FRAX para Risco de Fratura Osteoporótica Maior e de Quadril em 10 Anos"
      },
      {
        "letter": "C",
        "label": "Bisfosfonatos Orais (Alendronato Semanal) e Intravenosos (Ácido Zoledrônico Anual)",
        "value": "Regras de Tomada em Jejum com Água e Decúbito Evitado por 30-60 min"
      },
      {
        "letter": "D",
        "label": "Denosumabe",
        "value": "Anticorpo Anti-RANKL), Teriparatida (Análogo do PTH"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-274-sindrome-geniturinaria-da",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Síndrome Geniturinária da Menopausa",
    "fullTitle": "Síndrome Geniturinária da Menopausa (Climatério, Menopausa e Terapia Hormonal • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Climatério, Menopausa e Terapia Hormonal",
    "foco": "Síndrome Geniturinária da Menopausa",
    "subfocos": [
      "Atrofia Vulvovaginal e Dispareunia",
      "Tratamento Tópico Local com Estrogênios"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Atrofia Vulvovaginal e Dispareunia",
        "value": "Secura Vaginal, Prurido, Queimação, Perda da Elasticidade, Dispareunia de Introdução e Disúria / Infecções Urinárias de Repetição"
      },
      {
        "letter": "B",
        "label": "Exame Físico",
        "value": "Mucosa Pálida, Lisa, sem Pregas e Friável"
      },
      {
        "letter": "C",
        "label": "Estrogênio Tópico Vaginal em Baixas Doses (Estriol ou Promestrieno)",
        "value": "Mínima Absorção Sistêmica, Seguro e Altamente Eficaz (Dispensa Uso Concomitante de Progesterona)"
      },
      {
        "letter": "D",
        "label": "Tratamento Tópico Local com Estrogênios",
        "value": "Hidratantes e Lubrificantes Vaginais sem Hormônio"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-275-contraceptivos-orais-comb",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Contraceptivos Orais Combinados e Injetáveis",
    "fullTitle": "Contraceptivos Orais Combinados e Injetáveis (Planejamento Familiar e Métodos Contraceptivos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Contraceptivos Orais Combinados e Injetáveis",
    "subfocos": [
      "Mecanismo de Ação e Efeitos dos Hormônios Combinados",
      "Injetável Mensal e Regras de Tomada / Esquecimento"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Eixo Principal",
        "value": "Anovulação por Supressão Central de GnRH, LH e FSH"
      },
      {
        "letter": "B",
        "label": "Efeitos Secundários",
        "value": "Espessamento do Moco Cervical (Impede Progressão Espermática) e Atrofia Endometrial"
      },
      {
        "letter": "C",
        "label": "Benefícios Não Contraceptivos",
        "value": "Redução do Risco de Câncer de Ovário e Endométrio, Controle da Dismenorreia e Melhora da Acne"
      },
      {
        "letter": "D",
        "label": "Injetável Mensal Combinado (Enantato de Noretisterona + Valerato de Estradiol)",
        "value": "Aplicação a Cada 30 Dias"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-276-metodos-contraceptivos-pr",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Métodos Contraceptivos Progestagênicos Exclusivos",
    "fullTitle": "Métodos Contraceptivos Progestagênicos Exclusivos (Planejamento Familiar e Métodos Contraceptivos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Métodos Contraceptivos Progestagênicos Exclusivos",
    "subfocos": [
      "Minipílula e Pílula de Desogestrel",
      "Acetato de Medroxiprogesterona de Depósito (AMPD Trimestral)"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Minipílula Tradicional (Noretisterona 0,35 mg)",
        "value": "Ação Predominante no Moco Cervical, Rigidez de Horário (Atraso Máximo de 3 Horas), Escolha na Amamentação Exclusiva"
      },
      {
        "letter": "B",
        "label": "Desogestrel 75 mcg",
        "value": "Anovulatório Efetivo com Janela de Tolerância de 12 Horas"
      },
      {
        "letter": "C",
        "label": "Injetável Trimestral (150 mg IM a Cada 12 Semanas)",
        "value": "Alta Eficácia com Taxas Elevadas de Amenorreia"
      },
      {
        "letter": "D",
        "label": "Efeitos Adversos Comuns",
        "value": "Sangramento Irregular / Spotting Inicial, Ganho Ponderal, Retardo no Retorno da Fertilidade e Perda Transitória de DMO"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-277-dispositivos-intrauterino",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Dispositivos Intrauterinos",
    "fullTitle": "Dispositivos Intrauterinos (Planejamento Familiar e Métodos Contraceptivos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Dispositivos Intrauterinos (DIU de Cobre e SIU de Levonorgestrel)",
    "subfocos": [
      "Comparação Clínica: DIU T-Cobre vs SIU-LNG",
      "Inserção, Contraindicações e Manejo de Complicações"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "DIU de Cobre / Prata",
        "value": "Método não Hormonal, Reação Inflamatória Asséptica Espermistática, Duração de até 10 Anos, Pode Aumentar o Fluxo Menstrual e Cólicas"
      },
      {
        "letter": "B",
        "label": "SIU Liberador de Levonorgestrel (Mirena / Kyleena)",
        "value": "Atrofia Endometrial Intensa, Redução Marcada do Fluxo Menstrual (Alta Taxa de Amenorreia), Benefício Terapêutico em SUA e Endometriose, Duração de 5 a 8 Anos"
      },
      {
        "letter": "C",
        "label": "Contraindicações Absolutas",
        "value": "Gravidez, Malformações Anatômicas que Distorcem a Cavidade, Infecção Pélvica Vigente (DIP nos Últimos 3 Meses), Câncer Cervical/Endometrial"
      },
      {
        "letter": "D",
        "label": "Fio de DIU Não Visível",
        "value": "Ultrassonografia Transvaginal para Localização (Descartar Perfuração Uterina ou Expulsão não Percebida) e Remoção Histeroscópica se Intrauterino"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-278-implante-subdermico-de-et",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Implante Subdérmico de Etonogestrel",
    "fullTitle": "Implante Subdérmico de Etonogestrel (Planejamento Familiar e Métodos Contraceptivos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Implante Subdérmico de Etonogestrel",
    "subfocos": [
      "Mecanismo de Ação, Inserção e Critérios de Elegibilidade (MEC da OMS)",
      "Eventos Adversos e Manejo do Padrão de Sangramento Irregular"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Mecanismo de Ação Primário",
        "value": "Inibição do Pico de LH e Espessamento do Moco Cervical"
      },
      {
        "letter": "B",
        "label": "Mecanismo de Ação, Inserção e Critérios de Elegibilidade (MEC da OMS)",
        "value": "Técnica de Inserção Subdérmica Segura na Face Medial do Braço e Contraindicações Formais"
      },
      {
        "letter": "C",
        "label": "Padrão de Sangramento Imprevisível",
        "value": "Spotting e Amenorreia"
      },
      {
        "letter": "D",
        "label": "Manejo Farmacológico do Sangramento Persistente",
        "value": "AINEs, Ácido Tranexâmico e Ciclos Curtos de Estrogênio"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-279-criterios-medicos-de-eleg",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Critérios Médicos de Elegibilidade da OMS",
    "fullTitle": "Critérios Médicos de Elegibilidade da OMS (Planejamento Familiar e Métodos Contraceptivos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Critérios Médicos de Elegibilidade da OMS",
    "subfocos": [
      "Categorias 1 a 4 da OMS e Interpretação",
      "Situações Clínicas Críticas de Categoria 4 para Métodos Combinados"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Categoria 1",
        "value": "Condição para a qual Não Há Restrição ao Uso do Método Contraceptivo"
      },
      {
        "letter": "B",
        "label": "Categoria 2",
        "value": "Condição em que as Vantagens do Uso Geralmente Superam os Riscos Comprovados"
      },
      {
        "letter": "C",
        "label": "Categoria 3",
        "value": "Condição em que os Riscos Teóricos ou Comprovados Geralmente Superam as Vantagens (Método Não Recomendado exceto na Ausência de Alternativas)"
      },
      {
        "letter": "D",
        "label": "Categoria 4",
        "value": "Condição que Representa Risco de Saúde Inaceitável se o Método For Usado (Contraindicação Absoluta)"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-280-contracepcao-de-emergenci",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Contracepção de Emergência",
    "fullTitle": "Contracepção de Emergência (Planejamento Familiar e Métodos Contraceptivos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Contracepção de Emergência",
    "subfocos": [
      "Levonorgestrel Oral e Acetato de Ulipristal",
      "DIU de Cobre como Contracepção de Emergência Pós-Coito"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Levonorgestrel Oral e Acetato de Ulipristal",
        "value": "Esquema com Levonorgestrel 1,5 mg Dose Única em até 72h e Mecanismo Anovulatório"
      },
      {
        "letter": "B",
        "label": "Impacto do IMC/Obesidade na Eficácia e Acetato de Ulipristal",
        "value": "até 120h"
      },
      {
        "letter": "C",
        "label": "Inserção do DIU de Cobre em até 5 Dias",
        "value": "120h) Pós-Coito Desprotegido (Método Mais Eficaz"
      },
      {
        "letter": "D",
        "label": "DIU de Cobre como Contracepção de Emergência Pós-Coito",
        "value": "Uso Concomitante como Contracepção de Longa Duração e Critérios de Elegibilidade"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-281-contracepcao-cirurgica-de",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Contracepção Cirúrgica Definitiva",
    "fullTitle": "Contracepção Cirúrgica Definitiva (Planejamento Familiar e Métodos Contraceptivos • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Contracepção Cirúrgica Definitiva (Laqueadura Tubária)",
    "subfocos": [
      "Legislação Brasileira e Critérios de Elegibilidade (Lei 14.443/2022)",
      "Técnicas Cirúrgicas e Salpingectomia Oportunística"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Legais Vigentes",
        "value": "Idade Mínima 21 Anos OU Pelo Menos 2 Filhos Vivos"
      },
      {
        "letter": "B",
        "label": "Legislação Brasileira e Critérios de Elegibilidade (Lei 14.443/2022)",
        "value": "Prazo Mínimo de 60 Dias entre Manifestação da Vontade e Procedimento e Permissão no Parto/Cesárea"
      },
      {
        "letter": "C",
        "label": "Técnicas Cirúrgicas e Salpingectomia Oportunística",
        "value": "Técnica de Pomeroy, Parkland e Uso de Clipes/Anéis por Videolaparoscopia"
      },
      {
        "letter": "D",
        "label": "Técnicas Cirúrgicas e Salpingectomia Oportunística",
        "value": "Salpingectomia Bilateral Total como Prevenção de Câncer Epitelial de Ovário"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-282-vaginose-bacteriana",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Vaginose Bacteriana",
    "fullTitle": "Vaginose Bacteriana (Infecções Ginecológicas e Doença Inflamatória Pélvica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Vaginose Bacteriana",
    "subfocos": [
      "Diagnóstico Clínico e Critérios de Amsel",
      "Tratamento com Metronidazol e Manejo na Gestação"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios de Amsel (Pelo Menos 3 de 4)",
        "value": "1. Corrimento Branco-Acinzentado Homogêneo e Fluido; 2. pH Vaginal > 4,5; 3. Teste das Aminas / Whiff Test Positivo (Liberação de Odor Fétido de Peixe Podre com KOH a 10%); 4. Presença de \"Clue Cells\" / Células-Guia na Microscopia a Fresco (>= 20% das Células Epiteliais)"
      },
      {
        "letter": "B",
        "label": "Desbalanço da Microbiota Vaginal",
        "value": "Queda de *Lactobacillus* e Proliferação de Anaeróbios (*Gardnerella vaginalis*, *Atopobium vaginae*, *Mobiluncus*)"
      },
      {
        "letter": "C",
        "label": "Metronidazol Oral",
        "value": "500 mg 12/12h por 7 Dias"
      },
      {
        "letter": "D",
        "label": "Tratamento do Parceiro Sexual NÃO Recomendado de Rotina",
        "value": "Não é Considerada IST Clássica"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-283-candidiase-vulvovaginal",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Candidíase Vulvovaginal",
    "fullTitle": "Candidíase Vulvovaginal (Infecções Ginecológicas e Doença Inflamatória Pélvica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Candidíase Vulvovaginal",
    "subfocos": [
      "Quadro Clínico e Exame a Fresco",
      "Tratamento Farmacológico e Candidíase Recorrente"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sintoma Cardeal",
        "value": "Prurido Vulvar Intenso, Ardor Miccional, Dispareunia Externa e Edema / Hiperemia Vulvovaginal com Fissuras"
      },
      {
        "letter": "B",
        "label": "Aspecto Típico do Corrimento",
        "value": "Branco, Grumoso, em Placas Aderidas em \"Nata de Leite\" ou \"Queijo Coalho\" e sem Odor"
      },
      {
        "letter": "C",
        "label": "Microscopia com KOH a 10%",
        "value": "Visualização de Hifas, Pseudo-Hifas e Esporos de *Candida albicans* com pH Vaginal Normal (< 4,5)"
      },
      {
        "letter": "D",
        "label": "Tratamento de Episódio Agudo",
        "value": "Fluconazol Oral (150 mg Dose Única) ou Imidazólicos Tópicos (Miconazol, Clotrimazol por 7 Noites)"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-284-tricomoniase-vaginal",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Tricomoníase Vaginal",
    "fullTitle": "Tricomoníase Vaginal (Infecções Ginecológicas e Doença Inflamatória Pélvica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Tricomoníase Vaginal",
    "subfocos": [
      "Manifestações Clínicas e Exame a Fresco",
      "Tratamento Mandatório do Casal"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Manifestações Clínicas e Exame a Fresco",
        "value": "Infecção Sexualmente Transmissível Causada pelo Protozoário Flagelado *Trichomonas vaginalis*"
      },
      {
        "letter": "B",
        "label": "Corrimento Típico",
        "value": "Amarelo-Esverdeado, Bolhoso, Fluido, Abundante e com Odor Desagradável associado a Prurido e Queimação"
      },
      {
        "letter": "C",
        "label": "Colpite Focal / Difusa",
        "value": "Colo Uterino com Aspecto em \"Framboesa\" ou \"Morango"
      },
      {
        "letter": "D",
        "label": "Exame a Fresco Imediato com Soro Fisiológico",
        "value": "Protozoários Móveis com Flagelos Ondulantes e Aumento Marcado de Leucócitos com pH > 5,0"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-285-cervicites",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Cervicites",
    "fullTitle": "Cervicites (Infecções Ginecológicas e Doença Inflamatória Pélvica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Cervicites (Clamídia e Gonococo)",
    "subfocos": [
      "Diagnóstico Clínico e Propedêutica Laboratorial (NAAT/PCR)",
      "Esquemas Terapêuticos e Tratamento de Parceiros"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Clínico",
        "value": "Colo Friável, Sangramento Pós-Coito, Exudato Mucopurulento endocervical"
      },
      {
        "letter": "B",
        "label": "Diagnóstico Microbiológico por Biologia Molecular",
        "value": "NAAT"
      },
      {
        "letter": "C",
        "label": "Tratamento Farmacológico Concomitante",
        "value": "Ceftriaxona 500mg IM + Doxiciclina 100mg VO 7 dias"
      },
      {
        "letter": "D",
        "label": "Esquemas Terapêuticos e Tratamento de Parceiros",
        "value": "Convocação e Notificação de Parceiros Sexuais e Rastreamento de Outras ISTs"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-286-doenca-inflamatoria-pelvi",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Doença Inflamatória Pélvica",
    "fullTitle": "Doença Inflamatória Pélvica (Infecções Ginecológicas e Doença Inflamatória Pélvica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Doença Inflamatória Pélvica (DIP: Critérios Diagnósticos, Estágios e Tratamento)",
    "subfocos": [
      "Critérios Diagnósticos (Maiores, Menores e Elaborados) e Estadiamento de Monif",
      "Tratamento Ambulatorial vs Hospitalar e Complicações Crônicas"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Maiores",
        "value": "Dor Pélvica, Dor à Mobilização do Colo e Dor Anexial) e Menores (Febre, Leucocitose, PCR"
      },
      {
        "letter": "B",
        "label": "Estadiamento de Monif (Estágio I",
        "value": "Endometrite/Salpingite; Estágio II: Peritonite; Estágio III: Abscesso Tubo-Ovariano Íntegro; Estágio IV: Abscesso Roto)"
      },
      {
        "letter": "C",
        "label": "Esquemas Antimicrobianos (Ambulatorial",
        "value": "Ceftriaxona + Doxiciclina + Metronidazol; Hospitalar: Ceftriaxona + Doxiciclina + Metronidazol EV)"
      },
      {
        "letter": "D",
        "label": "Complicações",
        "value": "Abscesso Tubo-Ovariano, Síndrome de Fitz-Hugh-Curtis, Infertilidade e Gravidez Ectópica"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-287-ulceras-genitais",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Úlceras Genitais",
    "fullTitle": "Úlceras Genitais (Infecções Ginecológicas e Doença Inflamatória Pélvica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Úlceras Genitais (Sífilis Primária, Cancro Mole, Herpes Genital, Linfogranuloma, Donovanose)",
    "subfocos": [
      "Diagnóstico Diferencial Clínico das Úlceras Genitais",
      "Manejo Propedêutico e Abordagem Sindrômica do Ministério da Saúde"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sífilis Primária (Cancro Duro",
        "value": "Única, Indolor, Base Limpa) vs Cancro Mole (Múltiplas, Muito Dolorosas, Base Suja)"
      },
      {
        "letter": "B",
        "label": "Herpes Genital",
        "value": "Vesículas Agrupadas em Base Eritematosa"
      },
      {
        "letter": "C",
        "label": "Diagnóstico Laboratorial",
        "value": "Campo Escuro, VDRL, Testes Rápidos e Citologia de Tzanck"
      },
      {
        "letter": "D",
        "label": "Manejo Propedêutico e Abordagem Sindrômica do Ministério da Saúde",
        "value": "Conduta Terapêutica Específica e Abordagem Sindrômica de Úlceras com Penicilina Benzatina e Azitromicina"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-288-endometriose-pelvica-e-ov",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Endometriose Pélvica e Ovariana",
    "fullTitle": "Endometriose Pélvica e Ovariana (Endometriose e Dor Pélvica Crônica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Endometriose e Dor Pélvica Crônica",
    "foco": "Endometriose Pélvica e Ovariana (Endometrioma)",
    "subfocos": [
      "Quadro Clínico e os \"6 Ds\" da Endometriose",
      "Mapeamento por Imagem e Terapêutica Escalonada"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Quadro Clínico e os \"6 Ds\" da Endometriose",
        "value": "Presença de Glândulas e Estroma Endometrial Ectópicos Fora da Cavidade Uterina"
      },
      {
        "letter": "B",
        "label": "Os 6 Ds",
        "value": "Dismenorreia Progressiva Severa, Dor Pélvica Crônica Não Cíclica, Dispareunia de Profundidade, Disquezia / Dor à Evacuação, Disúria Cíclica e Dificuldade para Engravidar (Infertilidade)"
      },
      {
        "letter": "C",
        "label": "Endometrioma Ovariano",
        "value": "Cisto em \"Vidro Fosco\" à Ultrassonografia e \"Chocolatado\" na Cirurgia"
      },
      {
        "letter": "D",
        "label": "Exames de Escolha para Endometriose Profunda",
        "value": "USG Transvaginal com Preparo Intestinal e Ressonância Magnética da Pelve"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-289-adenomiose-uterina",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Adenomiose Uterina",
    "fullTitle": "Adenomiose Uterina (Endometriose e Dor Pélvica Crônica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Endometriose e Dor Pélvica Crônica",
    "foco": "Adenomiose Uterina",
    "subfocos": [
      "Fisiopatologia e Diagnóstico por Imagem da Adenomiose",
      "Manejo Clínico vs Histerectomia"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia e Diagnóstico por Imagem da Adenomiose",
        "value": "Invasão de Glândulas e Estroma Endometrial no Interior do Miométrio Uterino"
      },
      {
        "letter": "B",
        "label": "Quadro Típico",
        "value": "Mulher Multípara com Sangramento Uterino Anormal (Menorragia), Dismenorreia Secundária Intensa e Útero Aumentado Globoso e Doloroso ao Toque"
      },
      {
        "letter": "C",
        "label": "Manejo Clínico vs Histerectomia",
        "value": "Tratamento Farmacológico com SIU de Levonorgestrel ou Dienogeste para Controle de Sintomas"
      },
      {
        "letter": "D",
        "label": "Manejo Clínico vs Histerectomia",
        "value": "Histerectomia como Tratamento Curativo Definitivo para Pacientes com Prole Constituída e Sintomas Refratários"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-290-dor-pelvica-cronica-e-dis",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Dor Pélvica Crônica e Dismenorreia",
    "fullTitle": "Dor Pélvica Crônica e Dismenorreia (Endometriose e Dor Pélvica Crônica • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Endometriose e Dor Pélvica Crônica",
    "foco": "Dor Pélvica Crônica e Dismenorreia",
    "subfocos": [
      "Dismenorreia Primária vs Secundária",
      "Investigação e Manejo da Dor Pélvica Crônica Não-Cíclica"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fisiopatologia da Dismenorreia Primária Mediada por Prostaglandinas",
        "value": "PGF2a"
      },
      {
        "letter": "B",
        "label": "Dismenorreia Secundária",
        "value": "Investigação de Endometriose, Adenomiose e Malformações Obstrutivas"
      },
      {
        "letter": "C",
        "label": "Diagnóstico Diferencial",
        "value": "Síndrome da Congestão Pélvica, Cistite Intersticial e Causas Miofasciais"
      },
      {
        "letter": "D",
        "label": "Investigação e Manejo da Dor Pélvica Crônica Não-Cíclica",
        "value": "Abordagem Terapêutica Multidisciplinar, Bloqueio Hormonal e Neuromoduladores"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-291-leiomiomatose-uterina",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Leiomiomatose Uterina",
    "fullTitle": "Leiomiomatose Uterina (Afecções Benignas do Trato Genital Feminino • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Afecções Benignas do Trato Genital Feminino",
    "foco": "Leiomiomatose Uterina (Miomas: Sintomas, Classificação FIGO e Conduta)",
    "subfocos": [
      "Classificação Anatômica FIGO e Sintomatologia",
      "Abordagem Cirúrgica Conservadora vs Definitiva"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação Anatômica FIGO e Sintomatologia",
        "value": "Tumor Ginecológico Benigno Mais Frequente, Dependente de Estrogênio e Progesterona"
      },
      {
        "letter": "B",
        "label": "Classificação FIGO",
        "value": "Submucosos (Graus 0, 1 e 2: Principal Causa de Sangramento Uterino Intenso e Infertilidade), Intramurais (Graus 3, 4 e 5: Aumento do Volume Uterino, Cólica e Sangramento) e Subserosos (Graus 6 e 7: Sintomas Compressivos de Bexiga e Reto sem SUA Típico)"
      },
      {
        "letter": "C",
        "label": "Abordagem Cirúrgica Conservadora vs Definitiva",
        "value": "Miomectomia Histeroscópica de Escolha para Miomas Submucosos FIGO 0 e 1 < 4-5 cm em Mulheres com Desejo de Preservação Reprodutiva"
      },
      {
        "letter": "D",
        "label": "Abordagem Cirúrgica Conservadora vs Definitiva",
        "value": "Miomectomia Laparoscópica ou Laparotômica para Miomas Intramurais e Subserosos com Desejo de Gestação"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-292-polipos-endometriais-e-ce",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Pólipos Endometriais e Cervicais",
    "fullTitle": "Pólipos Endometriais e Cervicais (Afecções Benignas do Trato Genital Feminino • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Afecções Benignas do Trato Genital Feminino",
    "foco": "Pólipos Endometriais e Cervicais",
    "subfocos": [
      "Quadro Clínico, Propedêutica por Imagem e Histeroscopia",
      "Indicações Cirúrgicas e Polipectomia Histeroscópica"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Histerectomia e Embolização das Artérias Uterinas",
        "value": "EAU"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico, Propedêutica por Imagem e Histeroscopia",
        "value": "Apresentação com Sangramento Intermenstrual ou Pós-Menopausa e Diagnóstico por USG Transvaginal / Histerossonografia"
      },
      {
        "letter": "C",
        "label": "Critérios de Ressecção",
        "value": "Pós-Menopausa, Sintomáticos, Pólipos > 1,5 cm ou Uso de Tamoxifeno"
      },
      {
        "letter": "D",
        "label": "Indicações Cirúrgicas e Polipectomia Histeroscópica",
        "value": "Polipectomia Histeroscópica com Alça Diatermica e Análise Anatomopatológica"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-293-cistos-e-tumores-ovariano",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Cistos e Tumores Ovarianos Benignos",
    "fullTitle": "Cistos e Tumores Ovarianos Benignos (Afecções Benignas do Trato Genital Feminino • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Afecções Benignas do Trato Genital Feminino",
    "foco": "Cistos e Tumores Ovarianos Benignos (Teratoma Cístico, Cistoadenoma)",
    "subfocos": [
      "Classificação e Diagnóstico Diferencial de Massas Anexiais Benignas",
      "Cistoadenomas (Seroso e Mucinoso) e Indicações Cirúrgicas"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Cistos Funcionais",
        "value": "Foliculares e de Corpo Lúteo"
      },
      {
        "letter": "B",
        "label": "Teratoma Cístico Maduro / Cisto Dermoide",
        "value": "Achados Ultrassonográficos Típicos e Risco de Torção"
      },
      {
        "letter": "C",
        "label": "Cistoadenoma Seroso e Mucinoso",
        "value": "Características Macroscópicas e Risco de Pseudomixoma Peritoneal"
      },
      {
        "letter": "D",
        "label": "Cistoadenomas (Seroso e Mucinoso) e Indicações Cirúrgicas",
        "value": "Indicação de Cistectomia Ovariana Laparoscópica vs Ooforectomia Preservando Fertilidade"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia.",
    "imageUrl": "/images/medical/cisto_ovario_usg.webp",
    "imageCaption": "Ultrassonografia transvaginal: formação cística anecóica, unilocular, de paredes finas e reforço acústico posterior (aspecto benigno BI-RADS/IOTA).",
    "imageModality": "usg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Nephron",
    "imageLicense": "CC BY-SA 3.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Mucinous_lmp_ovarian_tumour_intermed_mag.jpg"
  },
  {
    "id": "tip-gine-294-vulvovaginites-atroficas",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Vulvovaginites Atróficas e Doenças Benignas da Vulva",
    "fullTitle": "Vulvovaginites Atróficas e Doenças Benignas da Vulva (Afecções Benignas do Trato Genital Feminino • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Afecções Benignas do Trato Genital Feminino",
    "foco": "Vulvovaginites Atróficas e Doenças Benignas da Vulva (Líquen Escleroso)",
    "subfocos": [
      "Síndrome Geniturinária da Menopausa / Vaginite Atrófica",
      "Líquen Escleroso Vulvar e Lesões Dermatológicas Vulvares"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Síndrome Geniturinária da Menopausa / Vaginite Atrófica",
        "value": "Hipoestrogenismo, Ressecamento Vaginal, Dispareunia de Intróito e Queda de Lactobacillus"
      },
      {
        "letter": "B",
        "label": "Tratamento Local com Estrogênio Tópico",
        "value": "Estriol/Promestrieno"
      },
      {
        "letter": "C",
        "label": "Quadro Clínico de Prurido Vulvar Intenso, Placas Esbranquiçadas",
        "value": "Em Forma de 8"
      },
      {
        "letter": "D",
        "label": "Biópsia Diagnóstica Obrigatória para Exclusão de Neoplasia e Corticoterapia Tópica Ultrapotente",
        "value": "Clobetasol"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-295-rastreamento-e-prevencao",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Rastreamento e Prevenção do Câncer de Colo Uterino",
    "fullTitle": "Rastreamento e Prevenção do Câncer de Colo Uterino (Cânceres Ginecológicos e Lesões Precursoras • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Rastreamento e Prevenção do Câncer de Colo Uterino (Citologia, HPV e Colposcopia)",
    "subfocos": [
      "Diretrizes Nacionais do Ministério da Saúde para o Rastreamento",
      "Técnica de Coleta Citopatológica (Papanicolau)"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Faixa Etária Prioritária",
        "value": "25 a 64 Anos"
      },
      {
        "letter": "B",
        "label": "Rastreamento em Populações Especiais",
        "value": "Gestantes, Imunossuprimidas com HIV e Pós-Menopausa"
      },
      {
        "letter": "C",
        "label": "Técnica de Coleta Citopatológica (Papanicolau)",
        "value": "Coleta Ectocervical com Espátula de Ayre e Endocervical com Escova de Zona de Transformação"
      },
      {
        "letter": "D",
        "label": "Critérios de Adequabilidade da Amostra Citológica e Representatividade da Junção Escamocolunar",
        "value": "JEC"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-296-neoplasias-intraepiteliai",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Neoplasias Intraepiteliais Cervicais",
    "fullTitle": "Neoplasias Intraepiteliais Cervicais (Cânceres Ginecológicos e Lesões Precursoras • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Neoplasias Intraepiteliais Cervicais (NIC) e Lesões Precursoras",
    "subfocos": [
      "Conduta nas Alterações Citológicas do Colo Uterino (Diretrizes MS)",
      "Colposcopia e Métodos Excisionais (CAF vs Cone a Frio)"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Conduta no ASC-US e LIEBG",
        "value": "Repetição Citológica em 6 Meses se >= 30 Anos ou 12 Meses se < 30 Anos"
      },
      {
        "letter": "B",
        "label": "Conduta no ASC-H, LIEAG e AGC",
        "value": "Encaminhamento Direto e Obrigatório para Colposcopia"
      },
      {
        "letter": "C",
        "label": "Achados Colposcópicos Maiores",
        "value": "Epitélio Acetobranco Denso, Mosaico e Pontilhado Grosseiros"
      },
      {
        "letter": "D",
        "label": "Excisão da Zona de Transformação",
        "value": "EZT / CAF Tipos 1 e 2) vs Conização a Frio / Cirúrgica (Tipo 3"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-297-cancer-de-colo-uterino-in",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Câncer de Colo Uterino Invasor",
    "fullTitle": "Câncer de Colo Uterino Invasor (Cânceres Ginecológicos e Lesões Precursoras • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Câncer de Colo Uterino Invasor (Estadiamento e Conduta)",
    "subfocos": [
      "Estadiamento Clínico FIGO 2018 do Câncer de Colo Uterino",
      "Conduta Terapêutica por Estádio e Preservação de Fertilidade"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Estadiamento Clínico FIGO 2018",
        "value": "Estádios Iniciais Restritos ao Colo vs Invasão Parametrial e Vagina"
      },
      {
        "letter": "B",
        "label": "Critérios de Inoperabilidade e Tratamento Sistêmico",
        "value": "Acometimento Parametrial Estádio IIB em Diante com Quimiorradioterapia Definitiva"
      },
      {
        "letter": "C",
        "label": "Traquelectomia Radical com Linfadenectomia Pélvica para Preservação de Fertilidade em Mulheres Jovens",
        "value": "IA2 e IB1"
      },
      {
        "letter": "D",
        "label": "Cirurgia de Wertheim-Meigs",
        "value": "Histerectomia Radical com Linfadenectomia Pélvica Bilateral"
      }
    ],
    "rule": "Diretrizes SBC / AHA: O supradesnivelamento do segmento ST em ≥ 2 derivações contíguas define IAM com supra (IAMCSST); tempo porta-balão alvo < 90 min (ou porta-agulha < 30 min se trombólise).",
    "bancaTrap": "Em IAM de parede inferior (DII, DIII, aVF), é mandatório rodar as derivações direitas (V3R e V4R); se houver acometimento de ventrículo direito, nitratos e betabloqueadores são formalmente contraindicados."
  },
  {
    "id": "tip-gine-298-cancer-de-endometrio-e-hi",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Câncer de Endométrio e Hiperplasia Endometrial",
    "fullTitle": "Câncer de Endométrio e Hiperplasia Endometrial (Cânceres Ginecológicos e Lesões Precursoras • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Câncer de Endométrio e Hiperplasia Endometrial",
    "subfocos": [
      "Hiperplasia Endometrial (Sem Atipia vs Atípica / EIN)",
      "Câncer de Endométrio: Diagnóstico, Tipos Histológicos e Estadiamento"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Hiperplasia sem Atipia",
        "value": "Manejo com Progestagênios Orais ou SIU-LNG) vs Atípica / EIN (Histerectomia Total"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico Típico",
        "value": "Sangramento Uterino Pós-Menopausa e Avaliação da Espessura Endometrial à USG (> 4-5 mm)"
      },
      {
        "letter": "C",
        "label": "Tipo I",
        "value": "Endometrioide, Dependente de Estrogênio, Bom Prognóstico) vs Tipo II (Seroso e Células Claras, Agressivo"
      },
      {
        "letter": "D",
        "label": "Estadiamento Cirúrgico do Câncer de Endométrio",
        "value": "Laparotomia / Laparoscopia com Linfadenectomia e Omentectomia"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-299-cancer-de-ovario-e-tumore",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Câncer de Ovário e Tumores Anexiais Suspeitos",
    "fullTitle": "Câncer de Ovário e Tumores Anexiais Suspeitos (Cânceres Ginecológicos e Lesões Precursoras • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Câncer de Ovário e Tumores Anexiais Suspeitos",
    "subfocos": [
      "Critérios Ultrassonográficos de Suspeita (IOTA) e Marcadores Tumorais (CA-125, HE4, ROMA)",
      "Tipos Histológicos e Cirurgia Citorredutora Estadiadora"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Regras Simples do IOTA para Diferenciação USG",
        "value": "Características B (Benignas) vs M (Malignas / Papilas, Ascite, Fluxo Doppler Alto)"
      },
      {
        "letter": "B",
        "label": "Marcadores Tumorais Séricos",
        "value": "CA-125 para Epitelial, HE4, Alfa-fetoproteína e hCG para Germinativos"
      },
      {
        "letter": "C",
        "label": "Carcinoma Seroso de Alto Grau",
        "value": "Mais Comum, Origem na Fímbria Tubária e Forte Associação com Mutações BRCA1/2"
      },
      {
        "letter": "D",
        "label": "Laparotomia Estadiadora Completa e Citorredução Cirúrgica Ótima com Resíduo Tumoral Zero",
        "value": "R0"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-300-neoplasias-malignas-da-vu",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Neoplasias Malignas da Vulva e Vagina",
    "fullTitle": "Neoplasias Malignas da Vulva e Vagina (Cânceres Ginecológicos e Lesões Precursoras • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Neoplasias Malignas da Vulva e Vagina",
    "subfocos": [
      "Neoplasia Intraepitelial Vulvar (NIV) e Carcinoma de Células Escamosas da Vulva",
      "Estadiamento e Tratamento Cirúrgico da Doença Vulvar"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "NIV Usual",
        "value": "HPV-Induzida) vs NIV Diferenciada (Associada ao Líquen Escleroso"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico do CEC de Vulva",
        "value": "Úlcera ou Nódulo Endurecido em Grandes Lábios com Prurido Crônico"
      },
      {
        "letter": "C",
        "label": "Vulvectomia Radical com Margens Livres",
        "value": "> 1 cm"
      },
      {
        "letter": "D",
        "label": "Estadiamento e Tratamento Cirúrgico da Doença Vulvar",
        "value": "Papel da Radioterapia Adjuvante em Linfonodos Positivos e Manejo das Neoplasias Vaginais"
      }
    ],
    "rule": "Diretrizes Brasileiras para Rastreamento do Câncer do Colo do Útero (INCA/MS): Rastreamento citopatológico bienal para mulheres entre 25 e 64 anos após dois exames anuais consecutivos negativos.",
    "bancaTrap": "Resultado citológico de ASC-US em mulheres ≥ 30 anos indica repetição da citologia em 6 meses; em mulheres entre 25 e 29 anos, a repetição deve ocorrer em 12 meses antes de indicar colposcopia."
  },
  {
    "id": "tip-gine-301-rastreamento-do-cancer-de",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Rastreamento do Câncer de Mama e Classificação BI-RADS",
    "fullTitle": "Rastreamento do Câncer de Mama e Classificação BI-RADS (Doenças da Mama e Rastreamento • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Rastreamento do Câncer de Mama e Classificação BI-RADS",
    "subfocos": [
      "Diretrizes de Rastreamento Mamográfico",
      "Classificação BI-RADS e Condutas Radiológicas"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Ministério da Saúde / INCA",
        "value": "Mamografia Bianual para Mulheres de 50 a 69 Anos"
      },
      {
        "letter": "B",
        "label": "Sociedade Brasileira de Mastologia / Febrasgo / CBR",
        "value": "Mamografia Anual a Partir dos 40 Anos"
      },
      {
        "letter": "C",
        "label": "Rastreamento em Mulheres de Alto Risco (Mutação BRCA1/2 ou Parente de 1º Grau com Câncer Antes dos 50 Anos)",
        "value": "Mamografia associada a Ressonância Magnética das Mamas Anual Iniciada 10 Anos Antes do Caso Mais Jovem"
      },
      {
        "letter": "D",
        "label": "BI-RADS 0 (Incompleto)",
        "value": "Avaliação Adicional Obrigatória com Ultrassonografia ou Manobras Mamográficas (Compressão / Ampliação)"
      }
    ],
    "rule": "Diretriz FEBRASGO / INCA: Achados BI-RADS 0 exigem complementação diagnóstica obrigatória por imagem (ultrassonografia de mamas ou manobras mamográficas adicionais com compressão focal e magnificação) antes de qualquer intervenção invasiva.",
    "bancaTrap": "Nunca indique biópsia percutânea (Core biopsy) ou punção (PAAF) de imediato em lesões BI-RADS 0 antes de concluir a avaliação radiológica complementar.",
    "imageUrl": "/images/medical/mamografia_birads.webp",
    "imageCaption": "Mamografia digital: assimetria focal e microcalcificações pleomórficas agrupadas no quadrante superior externo (Classificação BI-RADS 4/5).",
    "imageModality": "rx",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Cerevisae",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Magnification_view_mammography.jpg"
  },
  {
    "id": "tip-gine-302-cancer-de-mama",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Câncer de Mama",
    "fullTitle": "Câncer de Mama (Doenças da Mama e Rastreamento • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Câncer de Mama (Diagnóstico, Subtipos Moleculares e Estadiamento)",
    "subfocos": [
      "Investigação Diagnóstica, Core Biopsy e Mamotomia",
      "Subtipos Moleculares Imuno-histoquímicos e Princípios Terapêuticos"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Biópsia por Agulha Grossa",
        "value": "Core Biopsy"
      },
      {
        "letter": "B",
        "label": "Carcinoma Ductal Invasivo / Sem Outra Especificação",
        "value": "SOE"
      },
      {
        "letter": "C",
        "label": "Classificação Molecular",
        "value": "Luminal A, Luminal B (HER2- ou HER2+), HER2-Enriquecido e Triplo-Negativo"
      },
      {
        "letter": "D",
        "label": "Indicações de Cirurgia Conservadora",
        "value": "Setorectomia"
      }
    ],
    "rule": "Diretriz FEBRASGO / INCA: Achados BI-RADS 0 exigem complementação diagnóstica obrigatória por imagem (ultrassonografia de mamas ou manobras mamográficas adicionais com compressão focal e magnificação) antes de qualquer intervenção invasiva.",
    "bancaTrap": "Nunca indique biópsia percutânea (Core biopsy) ou punção (PAAF) de imediato em lesões BI-RADS 0 antes de concluir a avaliação radiológica complementar."
  },
  {
    "id": "tip-gine-303-doencas-benignas-da-mama",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Doenças Benignas da Mama",
    "fullTitle": "Doenças Benignas da Mama (Doenças da Mama e Rastreamento • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Doenças Benignas da Mama (Fibroadenoma e Cistos Mamários)",
    "subfocos": [
      "Fibroadenoma Mamário: Diagnóstico e Manejo",
      "Cistos Mamários e Alterações Funcionais Benignas da Mama"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Nódulo Firme, Móvel, Indolor em Mulheres Jovens e Características Ultrassonográficas Benignas",
        "value": "BI-RADS 3"
      },
      {
        "letter": "B",
        "label": "Conduta Conservadora vs Indicações de Exérese",
        "value": "Crescimento Rápido > 2-3 cm ou Tumor Filodes"
      },
      {
        "letter": "C",
        "label": "Cisto Simples",
        "value": "Anecóico, Reforço Posterior, Margens Regulares, BI-RADS 2) e Punção Aspirativa (PAAF"
      },
      {
        "letter": "D",
        "label": "Cistos Complicados e Complexos",
        "value": "Componente Sólido Intracístico, BI-RADS 4 e Necessidade de Biópsia"
      }
    ],
    "rule": "Diretriz FEBRASGO / INCA: Achados BI-RADS 0 exigem complementação diagnóstica obrigatória por imagem (ultrassonografia de mamas ou manobras mamográficas adicionais com compressão focal e magnificação) antes de qualquer intervenção invasiva.",
    "bancaTrap": "Nunca indique biópsia percutânea (Core biopsy) ou punção (PAAF) de imediato em lesões BI-RADS 0 antes de concluir a avaliação radiológica complementar."
  },
  {
    "id": "tip-gine-304-mastalgia-e-descarga-papi",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Mastalgia e Descarga Papilar",
    "fullTitle": "Mastalgia e Descarga Papilar (Doenças da Mama e Rastreamento • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Mastalgia e Descarga Papilar",
    "subfocos": [
      "Mastalgia Cíclica vs Não-Cíclica",
      "Descarga Papilar: Características de Suspeita e Conduta"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Mastalgia Cíclica",
        "value": "Lútea, Bilateral, Fisiológica"
      },
      {
        "letter": "B",
        "label": "Mastalgia Não-Cíclica",
        "value": "Investigação de Causas Osteomusculares (Síndrome de Tietze) e Afecções Locais"
      },
      {
        "letter": "C",
        "label": "Fluxo Papilar Suspeito",
        "value": "Uniductal, Unilateral, Espontâneo, Sanguinolento ou 'Água de Rocha'"
      },
      {
        "letter": "D",
        "label": "Papiloma Intraductal",
        "value": "Causa Mais Comum de Descarga Sanguinolenta"
      }
    ],
    "rule": "Diretriz FEBRASGO / INCA: Achados BI-RADS 0 exigem complementação diagnóstica obrigatória por imagem (ultrassonografia de mamas ou manobras mamográficas adicionais com compressão focal e magnificação) antes de qualquer intervenção invasiva.",
    "bancaTrap": "Nunca indique biópsia percutânea (Core biopsy) ou punção (PAAF) de imediato em lesões BI-RADS 0 antes de concluir a avaliação radiológica complementar."
  },
  {
    "id": "tip-gine-305-mastites-e-abscessos-mama",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Mastites e Abscessos Mamários Não-Puerperais",
    "fullTitle": "Mastites e Abscessos Mamários Não-Puerperais (Doenças da Mama e Rastreamento • Ginecologia)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Mastites e Abscessos Mamários Não-Puerperais",
    "subfocos": [
      "Mastite Periductal e Ectasia Ductal",
      "Abscessos Mamários Subareolares e Mastite Granulomatosa"
    ],
    "provenanceDefault": "FEBRASGO / Diretrizes INCA-Ministério da Saúde 2024",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Mastite Periductal e Ectasia Ductal",
        "value": "Fisiopatologia da Mastite Periductal Associada ao Tabagismo e Inversão Papilar"
      },
      {
        "letter": "B",
        "label": "Mastite Periductal e Ectasia Ductal",
        "value": "Quadro Clínico Recidivante, Formação de Fístulas Periareolares e Antibioticoterapia contra Anaeróbios"
      },
      {
        "letter": "C",
        "label": "Abscessos Mamários Subareolares e Mastite Granulomatosa",
        "value": "Drenagem Cirúrgica de Abscessos com Incisão Circunferencial e Excisão do Ducto Doente"
      },
      {
        "letter": "D",
        "label": "Mastite Granulomatosa Idiopática",
        "value": "Diagnóstico Diferencial com Carcinoma Inflamatório e Corticoterapia"
      }
    ],
    "rule": "Diretriz FEBRASGO / INCA: Achados BI-RADS 0 exigem complementação diagnóstica obrigatória por imagem (ultrassonografia de mamas ou manobras mamográficas adicionais com compressão focal e magnificação) antes de qualquer intervenção invasiva.",
    "bancaTrap": "Nunca indique biópsia percutânea (Core biopsy) ou punção (PAAF) de imediato em lesões BI-RADS 0 antes de concluir a avaliação radiológica complementar."
  },
  {
    "id": "tip-obst-306-modificacoes-fisiologicas",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Modificações Fisiológicas da Gravidez",
    "fullTitle": "Modificações Fisiológicas da Gravidez (Assistência Pré-Natal e Fisiologia Gestacional • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Modificações Fisiológicas da Gravidez (Cardiovasculares, Renais, Hematológicas)",
    "subfocos": [
      "Modificações Cardiovasculares e Hematológicas",
      "Modificações Renais, Digestivas e Respiratórias"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Modificações Cardiovasculares e Hematológicas",
        "value": "Aumento do Débito Cardíaco em 30-50%, Queda da RVP e Queda Pressórica Fisiológica no 2º Trimestre"
      },
      {
        "letter": "B",
        "label": "Hipervolemia Fisiológica e Anemia Dilucional (Ponto de Corte de Anemia",
        "value": "Hb < 11 g/dL)"
      },
      {
        "letter": "C",
        "label": "Modificações Cardiovasculares e Hematológicas",
        "value": "Estado Pró-Trombótico Fisiológico e Edema em MMII por Compressão da Veia Cava Inferior"
      },
      {
        "letter": "D",
        "label": "Modificações Renais, Digestivas e Respiratórias",
        "value": "Aumento da TFG em 50% com Redução dos Níveis Normais de Ureia e Creatinina e Glicosúria Fisiológica"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-307-rotina-do-pre-natal-de-ba",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Rotina do Pré-Natal de Baixo Risco",
    "fullTitle": "Rotina do Pré-Natal de Baixo Risco (Assistência Pré-Natal e Fisiologia Gestacional • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Rotina do Pré-Natal de Baixo Risco (Consultas, Exames e Calendário)",
    "subfocos": [
      "Cronograma e Consultas de Rotina (MS/Febrasgo)",
      "Exames Complementares do 2º e 3º Trimestres"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Periodicidade Mínima Recomendada",
        "value": "Mensal até 28 Semanas, Quinzenal de 28 a 36 Semanas e Semanal até o Parto"
      },
      {
        "letter": "B",
        "label": "Exames Laboratoriais Obrigatórios do 1º Trimestre",
        "value": "Tipagem/Rh, Coombs Indireto, Hemograma, Glicemia, EAS/Urocultura, Sorologias"
      },
      {
        "letter": "C",
        "label": "Repetição Obrigatória no 3º Trimestre",
        "value": "VDRL, HIV, Hepatite B, Hemograma e Urocultura"
      },
      {
        "letter": "D",
        "label": "Exames Complementares do 2º e 3º Trimestres",
        "value": "Rastreamento de Diabetes Gestacional com TOTG 75g entre 24 e 28 Semanas"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-308-vacinacao-e-suplementacao",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Vacinação e Suplementação na Gestação",
    "fullTitle": "Vacinação e Suplementação na Gestação (Assistência Pré-Natal e Fisiologia Gestacional • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Vacinação e Suplementação na Gestação (Ácido Fólico, Ferro)",
    "subfocos": [
      "Calendário Vacinal da Gestante",
      "Suplementação de Ácido Fólico e Ferro"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "dTpa",
        "value": "Tríplice Bacteriana Acelular) Obrigatória a Partir da 20ª Semana a Cada Gestação (Proteção do Recém-Nascido contra Coqueluche"
      },
      {
        "letter": "B",
        "label": "Vacinas Recomendadas",
        "value": "Hepatite B, Influenza e COVID-19"
      },
      {
        "letter": "C",
        "label": "Contraindicação Absoluta de Vacinas de Vírus Vivos Atenuados",
        "value": "Tríplice Viral, Varicela, Febre Amarela"
      },
      {
        "letter": "D",
        "label": "Ácido Fólico Pré-Concepcional",
        "value": "0,4 mg/dia habitual vs 4-5 mg/dia se Alto Risco de DTN ou Anticonvulsivantes"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-309-calculo-da-idade-gestacio",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Cálculo da Idade Gestacional e Data Provável do Parto",
    "fullTitle": "Cálculo da Idade Gestacional e Data Provável do Parto (Assistência Pré-Natal e Fisiologia Gestacional • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Cálculo da Idade Gestacional e Data Provável do Parto",
    "subfocos": [
      "Regra de Nägele e Estimativa Clínica",
      "Datação Ultrassonográfica da Gestação"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Cálculo da Data Provável do Parto (DPP)",
        "value": "Somar 7 Dias ao Primeiro Dia da DUM e Somar 9 Meses (ou Subtrair 3 Meses)"
      },
      {
        "letter": "B",
        "label": "Altura do Fundo Uterino (AFU)",
        "value": "Correlação Centimétrica entre 20 e 32 Semanas"
      },
      {
        "letter": "C",
        "label": "Comprimento Cabeça-Nádega",
        "value": "CCN) no 1º Trimestre (6 a 12 Semanas) como Parâmetro Mais Preciso (Margem de Erro de 3 a 5 Dias"
      },
      {
        "letter": "D",
        "label": "Diâmetro Biparietal",
        "value": "DBP"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-310-estatica-fetal-e-diagnost",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Estática Fetal e Diagnóstico da Gravidez",
    "fullTitle": "Estática Fetal e Diagnóstico da Gravidez (Assistência Pré-Natal e Fisiologia Gestacional • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Estática Fetal e Diagnóstico da Gravidez",
    "subfocos": [
      "Manobras de Leopold e Relações Útero-Fetais",
      "Diagnóstico Clínico e Imunológico da Gravidez"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Os 4 Tempos de Leopold",
        "value": "1º Fundo Uterino; 2º Situação e Dorso Fetal; 3º Apresentação e Mobilidade; 4º Insinuação e Atitude"
      },
      {
        "letter": "B",
        "label": "Conceitos de Situação",
        "value": "Longitudinal, Transversa), Apresentação (Cefálica, Pélvica, Córmica) e Posição (Dorso Direita/Esquerda"
      },
      {
        "letter": "C",
        "label": "Sinais de Presunção",
        "value": "Náuseas, Aumento Mamário, Atraso Menstrual), Probabilidade (Amolecimento do Colo / Sinal de Hegar, Coloração Violácea da Vulva / Sinal de Jacquemier-Chadwick) e Certeza (BCF ao Sonar > 10-12s, Percepção de Movimentos Fetais pelo Examinador > 18-20s"
      },
      {
        "letter": "D",
        "label": "Diagnóstico Clínico e Imunológico da Gravidez",
        "value": "Fração Beta do hCG no Sangue e Zona Discriminatória Ultrassonográfica"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-311-abortamento-espontaneo-e",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Abortamento Espontâneo e suas Formas Clínicas",
    "fullTitle": "Abortamento Espontâneo e suas Formas Clínicas (Hemorragias da Primeira Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Primeira Metade da Gravidez",
    "foco": "Abortamento Espontâneo e suas Formas Clínicas (Ameaça, Inevitável, Incompleto, Retido, Infectado)",
    "subfocos": [
      "Diagnóstico Diferencial das Formas Clínicas de Abortamento",
      "Métodos de Esvaziamento Uterino e Imunoprofilaxia Rh"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Ameaça de Abortamento",
        "value": "Colo Fechado, Sangramento Moderado, BCF Presente, Vitalidade Mantida (Repouso e Abstinência Sexual)"
      },
      {
        "letter": "B",
        "label": "Abortamento Inevitável",
        "value": "Colo Aberto com Sangramento Intenso e Cólica, Feto em Expulsão"
      },
      {
        "letter": "C",
        "label": "Abortamento Incompleto",
        "value": "Colo Aberto com Restos Ovulares em Cavidade à USG (Endométrio Heterogêneo > 15 mm)"
      },
      {
        "letter": "D",
        "label": "Abortamento Completo",
        "value": "Colo Fechado, Sangramento Cessado e Cavidade Uterina Vazia"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-312-abortamento-recorrente-e",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Abortamento Recorrente e Incompetência Istmocervical",
    "fullTitle": "Abortamento Recorrente e Incompetência Istmocervical (Hemorragias da Primeira Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Primeira Metade da Gravidez",
    "foco": "Abortamento Recorrente e Incompetência Istmocervical",
    "subfocos": [
      "Incompetência Istmocervical (IIC)",
      "Investigação do Abortamento de Repetição"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "História de Perdas Fetais Tardias Repetitivas",
        "value": "2º Trimestre"
      },
      {
        "letter": "B",
        "label": "Tratamento Eletivo de Escolha",
        "value": "Cerclagem Uterina pela Técnica de McDonald entre 12 e 16 Semanas de Gestação"
      },
      {
        "letter": "C",
        "label": "Incompetência Istmocervical (IIC)",
        "value": "Cerclagem de Emergência / Resgate com Colo Dilatado e Bolsa Amniótica Prolabada"
      },
      {
        "letter": "D",
        "label": "Definição",
        "value": ">= 2 a 3 Perdas Espontâneas Consecutivas"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-313-gravidez-ectopica",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Gravidez Ectópica",
    "fullTitle": "Gravidez Ectópica (Hemorragias da Primeira Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Primeira Metade da Gravidez",
    "foco": "Gravidez Ectópica",
    "subfocos": [
      "Diagnóstico Clínico e Ultrassonográfico da Ectópica",
      "Manejo Clínico com Metotrexato vs Cirúrgico"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Tríade Clássica",
        "value": "Atraso Menstrual, Sangramento Vaginal de Primeiro Trimestre e Dor Pélvica Unilateral"
      },
      {
        "letter": "B",
        "label": "Fatores de Risco Maiores",
        "value": "História de Gravidez Ectópica Prévia, Doença Inflamatória Pélvica (DIP) e Cirurgia Tubária Prévia"
      },
      {
        "letter": "C",
        "label": "Zona Discriminatória do Beta-hCG",
        "value": ">= 1.500 a 2.000 mUI/mL sem Saco Gestacional Tópico Intrauterino à USG Transvaginal"
      },
      {
        "letter": "D",
        "label": "Critérios Rígidos para Uso de Metotrexato (MTX 50 mg/m2 IM)",
        "value": "Estabilidade Hemodinâmica, Massa Anexial Íntegra < 3,5 cm, Ausência de BCF e Beta-hCG < 5.000 mUI/mL"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-314-doenca-trofoblastica-gest",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Doença Trofoblástica Gestacional",
    "fullTitle": "Doença Trofoblástica Gestacional (Hemorragias da Primeira Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Primeira Metade da Gravidez",
    "foco": "Doença Trofoblástica Gestacional (Mola Hidatiforme e Neoplasias)",
    "subfocos": [
      "Mola Hidatiforme Completa vs Incompleta (Parcial)",
      "Esvaziamento Uterino e Seguimento Pós-Molar"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Mola Completa",
        "value": "Fecundação de Óvulo Vazio por Espermatozoide Diploide (46,XX), Ausência de Embrião, Vilosidades Edemaciadas Difusas (\"Cachos de Uva\"), Níveis Altíssimos de Beta-hCG e Risco de Malignização de 15-20%"
      },
      {
        "letter": "B",
        "label": "Mola Incompleta",
        "value": "Fecundação de Óvulo Normal por 2 Espermatozoides (Triploidia 69,XXY), Presença de Tecido Fetal / Embrião e Risco Menor de Malignização (2-5%)"
      },
      {
        "letter": "C",
        "label": "Mola Hidatiforme Completa vs Incompleta (Parcial)",
        "value": "Imagem Ultrassonográfica em \"Tempestade de Neve\" ou \"Flocos de Neve"
      },
      {
        "letter": "D",
        "label": "Esvaziamento Uterino e Seguimento Pós-Molar",
        "value": "Esvaziamento Uterino de Escolha por Vácuo-Aspiração Elétrica ou AMIU com Envio para Histopatológico"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-315-descolamento-prematuro-de",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Descolamento Prematuro de Placenta",
    "fullTitle": "Descolamento Prematuro de Placenta (Hemorragias da Segunda Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Descolamento Prematuro de Placenta (DPP)",
    "subfocos": [
      "Quadro Clínico e Fatores de Risco do DPP",
      "Conduta Obstétrica Imediata e Complicações"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Principal Fator de Risco Associado",
        "value": "Doença Hipertensiva Específica da Gravidez (DHEG / Pré-Eclâmpsia)"
      },
      {
        "letter": "B",
        "label": "Tétrade Clássica",
        "value": "Dor Abdominal Súbita Intensa, Hipertonia Uterina (\"Útero Lenhoso\" que Não Relaxa), Sangramento Vaginal Escuro com Coágulos e Sofrimento Fetal Agudo Grave"
      },
      {
        "letter": "C",
        "label": "Hematoma Retroplacentário e Apoplexia Útero-Placentária",
        "value": "Útero de Couvelaire"
      },
      {
        "letter": "D",
        "label": "Conduta com Feto Vivo",
        "value": "Cesariana Imediata de Urgência (Exceto se Parto Vaginal Iminente)"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-316-placenta-previa",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Placenta Prévia",
    "fullTitle": "Placenta Prévia (Hemorragias da Segunda Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Placenta Prévia",
    "subfocos": [
      "Classificação e Quadro Clínico da Placenta Prévia",
      "Conduta e Via de Parto na Placenta Prévia"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Classificação e Quadro Clínico da Placenta Prévia",
        "value": "Implantação Placentária no Segmento Inferior do Útero após 28 Semanas de Gestação"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico Típico",
        "value": "Sangramento Vaginal Vermelho Rutilante / Vivo, Espontâneo, Repetitivo, Progressivo e INDOLOR, com Tônus Uterino Normal e Ausência de Sofrimento Fetal Inicial"
      },
      {
        "letter": "C",
        "label": "Contraindicação Absoluta de Toque Vaginal",
        "value": "Realizar Especuloscopia Delicada e USG Transvaginal"
      },
      {
        "letter": "D",
        "label": "Conduta e Via de Parto na Placenta Prévia",
        "value": "Manejo Conservador se Prematuridade e Sangramento Controlado com Estabilidade Materno-Fetal"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV.",
    "imageUrl": "/images/medical/placenta_previa_usg.webp",
    "imageCaption": "Ultrassonografia obstétrica: tecido placentário recobrindo integralmente o orifício interno do colo uterino (Placenta Prévia Centro-Total).",
    "imageModality": "usg",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Lamiot",
    "imageLicense": "CC BY-SA 4.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:HawaI%27i_placenta_plastics_en.jpg"
  },
  {
    "id": "tip-obst-317-acretismo-placentario",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Acretismo Placentário",
    "fullTitle": "Acretismo Placentário (Hemorragias da Segunda Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Acretismo Placentário (Accreta, Increta, Percreta)",
    "subfocos": [
      "Graus de Invasão Miometrial (Accreta, Increta e Percreta)",
      "Diagnóstico Pré-Natal e Manejo Cirúrgico"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Fatores de Risco Maiores",
        "value": "Placenta Prévia Concomitante a Cicatrizes Uterinas / Cesarianas Prévias (Risco Escalonado)"
      },
      {
        "letter": "B",
        "label": "Placenta Accreta",
        "value": "Adesão Direta ao Miométrio sem Ultrapassá-lo - 75-80% dos Casos"
      },
      {
        "letter": "C",
        "label": "Placenta Increta",
        "value": "Invasão Profunda no Miométrio - 15%"
      },
      {
        "letter": "D",
        "label": "Placenta Percreta",
        "value": "Ultrapassa a Serosa Uterina com Invasão de Órgãos Vizinhos, Notadamente a Bexiga - 5%"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-318-rotura-uterina",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Rotura Uterina",
    "fullTitle": "Rotura Uterina (Hemorragias da Segunda Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Rotura Uterina",
    "subfocos": [
      "Sinais Iminentes de Rotura (Síndrome de Bandl-Frommel)",
      "Rotura Consumada e Conduta Cirúrgica"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Sinal de Bandl",
        "value": "Anel de Constrição que Separa o Corpo do Segmento Inferior Uterino"
      },
      {
        "letter": "B",
        "label": "Sinal de Frommel",
        "value": "Estiramento e Tensão Dolorosa dos Ligamentos Redondos"
      },
      {
        "letter": "C",
        "label": "Causas Principais",
        "value": "Hiperdinamia Uterina, Uso Inadequado de Ocitocina/Misoprostol e Parto Obstruído"
      },
      {
        "letter": "D",
        "label": "Rotura Consumada e Conduta Cirúrgica",
        "value": "Dor Lancinante Súbita que Cede Subitamente com Parada das Contrações Uterinas"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-319-rotura-de-vasa-previa-e-r",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Rotura de Vasa Prévia e Rotura de Seio Marginal",
    "fullTitle": "Rotura de Vasa Prévia e Rotura de Seio Marginal (Hemorragias da Segunda Metade da Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Rotura de Vasa Prévia e Rotura de Seio Marginal",
    "subfocos": [
      "Vasa Prévia e Inserção Velamentosa do Cordão",
      "Rotura de Seio Marginal Placentário"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Vasa Prévia e Inserção Velamentosa do Cordão",
        "value": "Vasos Fetais Desprotegidos que Cruzam o Orifício Interno do Colo Uterino sob as Membranas Amnióticas"
      },
      {
        "letter": "B",
        "label": "Quadro Patognomônico",
        "value": "Sangramento Vaginal Imediato após a Amniorrexe (Rotura de Bolsa) associado a Bradicardia Fetal Súbita / Sofrimento Fetal Agudo Grave (O Sangue Perdido é Fetal!)"
      },
      {
        "letter": "C",
        "label": "Vasa Prévia e Inserção Velamentosa do Cordão",
        "value": "Cesariana de Emergência Absoluta"
      },
      {
        "letter": "D",
        "label": "Rotura de Seio Marginal Placentário",
        "value": "Sangramento de Sangue Materno no Periparto com Tônus Uterino Normal e Ausência de Sofrimento Fetal, Diagnóstico de Exclusão"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-320-pre-eclampsia",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Pré-Eclâmpsia",
    "fullTitle": "Pré-Eclâmpsia (Síndromes Hipertensivas na Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Pré-Eclâmpsia (com e sem Sinais de Gravidade)",
    "subfocos": [
      "Diagnóstico e Critérios da Pré-Eclâmpsia",
      "Pré-Eclâmpsia com Sinais de Gravidade e Manejo"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Definição Clássica",
        "value": "Hipertensão Arterial (PAS >= 140 ou PAD >= 90 mmHg) que Surge após a 20ª Semana associada a Proteinúria Significativa (>= 300 mg/24h ou Relação P/C Urinária >= 0,3)"
      },
      {
        "letter": "B",
        "label": "Critérios de Pré-Eclâmpsia SEM Proteinúria",
        "value": "Hipertensão associada a Disfunção de Órgão-Alvo (Plaquetopenia < 100.000, Transaminases Dobradas, Creatinina > 1,1 mg/dL, Edema Agudo de Pulmão ou Sintomas Visuais/Cefaleia)"
      },
      {
        "letter": "C",
        "label": "Sinais de Gravidade",
        "value": "PA >= 160x110 mmHg, Cefaleia Intensa Refratária, Escotomas Cintilantes, Epigastralgia / Dor em HCD (Distensão da Cápsula de Glisson)"
      },
      {
        "letter": "D",
        "label": "Sulfatação Imediata para Prevenção de Convulsão com Sulfato de Magnésio",
        "value": "Esquema de Pritchard ou Zuspan"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-321-eclampsia",
    "category": "antidotos",
    "categoryLabel": "Toxicologia & Antídotos",
    "title": "Eclâmpsia",
    "fullTitle": "Eclâmpsia (Síndromes Hipertensivas na Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Eclâmpsia (Manejo da Crise e Sulfato de Magnésio)",
    "subfocos": [
      "Manejo da Crise Convulsiva Eclâmptica",
      "Monitorização da Intoxicação por Magnésio e Antídoto"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Manejo da Crise Convulsiva Eclâmptica",
        "value": "Aparecimento de Convulsões Tônico-Clônicas Generalizadas em Gestante com Pré-Eclâmpsia Não Explicadas por Outras Causas Neurológicas"
      },
      {
        "letter": "B",
        "label": "Droga de Escolha Absoluta para Controle e Prevenção de Recorrência",
        "value": "Sulfato de Magnésio (Jamais Benzodiazepínicos ou Fenitoína de 1ª Linha)"
      },
      {
        "letter": "C",
        "label": "Os 3 Parâmetros Clínicos Obrigatórios de Vigilância",
        "value": "Reflexo Patelar Presente, Frequência Respiratória >= 16 rpm e Débito Urinário >= 25-30 mL/hora"
      },
      {
        "letter": "D",
        "label": "Sinal Mais Precoce de Intoxicação",
        "value": "Abolição do Reflexo Patelar"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-322-sindrome-hellp",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Síndrome HELLP",
    "fullTitle": "Síndrome HELLP (Síndromes Hipertensivas na Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Síndrome HELLP",
    "subfocos": [
      "Critérios Laboratoriais Diagnósticos de Tennessee / Mississippi",
      "Conduta Obstétrica e Interrupção da Gravidez"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "H (Hemólise)",
        "value": "Esquizócitos no Sangue Periférico, Bilirrubina Indireta >= 1,2 mg/dL, Desidrogenase Láctica (LDH) >= 600 U/L"
      },
      {
        "letter": "B",
        "label": "EL (Elevated Liver Enzymes)",
        "value": "TGO/AST >= 70 U/L ou Dobro do LSN"
      },
      {
        "letter": "C",
        "label": "LP (Low Platelets)",
        "value": "Plaquetopenia < 100.000/mm3 (Classe 1 < 50.000, Classe 2 50.000-100.000, Classe 3 100.000-150.000)"
      },
      {
        "letter": "D",
        "label": "Conduta Obstétrica e Interrupção da Gravidez",
        "value": "Indicação de Interrupção Imediata da Gestação Independentemente da Idade Gestacional após Estabilização Materna e Sulfatação"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-323-hipertensao-arterial-cron",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hipertensão Arterial Crônica na Gravidez",
    "fullTitle": "Hipertensão Arterial Crônica na Gravidez (Síndromes Hipertensivas na Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Hipertensão Arterial Crônica na Gravidez",
    "subfocos": [
      "Diagnóstico Diferencial e Drogas de Uso Permitido",
      "Pré-Eclâmpsia Sobreposta à Hipertensão Crônica"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico Diferencial e Drogas de Uso Permitido",
        "value": "Hipertensão Diagnosticada Antes da Gravidez ou Antes da 20ª Semana, ou que Persiste após 12 Semanas Pós-Parto"
      },
      {
        "letter": "B",
        "label": "Anti-hipertensivos Orais Seguros de 1ª Linha",
        "value": "Metildopa, Nifedipino Retard e Hidralazina"
      },
      {
        "letter": "C",
        "label": "Contraindicação Formal e Absoluta",
        "value": "Inibidores da ECA e Bloqueadores dos Receptores de Angiotensina (Teratogenia e Disgenesia Renal Fetal)"
      },
      {
        "letter": "D",
        "label": "Pré-Eclâmpsia Sobreposta à Hipertensão Crônica",
        "value": "Piora Súbita dos Níveis Pressóricos, Surgimento ou Aumento Abrupto de Proteinúria ou Disfunção Orgânica após a 20ª Semana"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-324-hipertensao-gestacional",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Hipertensão Gestacional",
    "fullTitle": "Hipertensão Gestacional (Síndromes Hipertensivas na Gravidez • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Hipertensão Gestacional",
    "subfocos": [
      "Definição, Fisiopatologia e Diagnóstico Diferencial com Pré-Eclâmpsia",
      "Conduta Clínica, Metas Pressóricas e Risco de Evolução para Pré-Eclâmpsia"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Profilaxia com AAS em Baixas Doses",
        "value": "100-150 mg/dia"
      },
      {
        "letter": "B",
        "label": "Definição, Fisiopatologia e Diagnóstico Diferencial com Pré-Eclâmpsia",
        "value": "Níveis Pressóricos >= 140x90 mmHg após 20 Semanas sem Proteinúria ou Lesão de Órgão-Alvo"
      },
      {
        "letter": "C",
        "label": "Conduta Clínica, Metas Pressóricas e Risco de Evolução para Pré-Eclâmpsia",
        "value": "Diferenciação com Hipertensão Arterial Crônica Preexistente e Monitorização Ambulatorial"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-325-diabetes-mellitus-gestaci",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Diabetes Mellitus Gestacional",
    "fullTitle": "Diabetes Mellitus Gestacional (Diabetes Gestacional e Endocrinopatias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Diabetes Gestacional e Endocrinopatias",
    "foco": "Diabetes Mellitus Gestacional (DMG: Rastreamento, Diagnóstico e Metas)",
    "subfocos": [
      "Rastreamento e Critérios Diagnósticos do DMG (IADPSG/SBD/Febrasgo)",
      "Metas Glicêmicas, Dieta e Terapia com Insulina"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Vigilância Materno-Fetal Estrita",
        "value": "Pesquisa Periódica de Proteinúria, Plaquetas e Enzimas Hepáticas"
      },
      {
        "letter": "B",
        "label": "Manejo Anti-hipertensivo",
        "value": "Metildopa, Hidralazina e Anlodipino) e Momento do Parto a Termo (37-39 semanas"
      },
      {
        "letter": "C",
        "label": "1ª Consulta de Pré-Natal (1º Trimestre)",
        "value": "Glicemia de Jejum entre 92 e 125 mg/dL = Diagnóstico Imediato de DMG (Sem Necessidade de Teste Adicional)"
      },
      {
        "letter": "D",
        "label": "Metas Glicêmicas, Dieta e Terapia com Insulina",
        "value": "Glicemia de Jejum >= 126 mg/dL ou HbA1c >= 6,5% no 1º Trimestre = Diabetes Mellitus Pré-Gestacional / Overt Diabetes"
      }
    ],
    "rule": "Diretriz SBD 2024-2025: Na cetoacidose diabética (CAD), a reposição de potássio precede a insulinoterapia: se K+ < 3,3 mEq/L, adie a insulina e reponha cloreto de potássio até normalização.",
    "bancaTrap": "A resolução da CAD não é determinada pela queda da glicemia (< 200 mg/dL), mas sim pelo fechamento do ânion-gap (≤ 12 mEq/L) e elevação do bicarbonato sérico (≥ 18 mEq/L)."
  },
  {
    "id": "tip-obst-326-diabetes-mellitus-pre-ges",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Diabetes Mellitus Pré-Gestacional",
    "fullTitle": "Diabetes Mellitus Pré-Gestacional (Diabetes Gestacional e Endocrinopatias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Diabetes Gestacional e Endocrinopatias",
    "foco": "Diabetes Mellitus Pré-Gestacional (Manejo e Riscos Malformativos)",
    "subfocos": [
      "Planejamento Pré-Concepcional e Riscos de Malformações Fetais",
      "Ajuste da Insulinoterapia nos Três Trimestres e Vitalidade Fetal"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Terapêutica Inicial",
        "value": "Dieta Fracionada e Atividade Física por 1 a 2 Semanas"
      },
      {
        "letter": "B",
        "label": "Planejamento Pré-Concepcional e Riscos de Malformações Fetais",
        "value": "Indicação de Insulinoterapia se > 30% dos Valores Glicêmicos Acima da Meta"
      },
      {
        "letter": "C",
        "label": "Complicações Fetais",
        "value": "Macrossomia Fetal (> 4.000 g), Polidrâmnio, Distócia de Ombro e Hipoglicemia Neonatal Precoce"
      },
      {
        "letter": "D",
        "label": "Otimização da Hemoglobina Glicada",
        "value": "HbA1c < 6,5%"
      }
    ],
    "rule": "Diretriz SBD 2024-2025: Na cetoacidose diabética (CAD), a reposição de potássio precede a insulinoterapia: se K+ < 3,3 mEq/L, adie a insulina e reponha cloreto de potássio até normalização.",
    "bancaTrap": "A resolução da CAD não é determinada pela queda da glicemia (< 200 mg/dL), mas sim pelo fechamento do ânion-gap (≤ 12 mEq/L) e elevação do bicarbonato sérico (≥ 18 mEq/L)."
  },
  {
    "id": "tip-obst-327-tireoidopatias-na-gestaca",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Tireoidopatias na Gestação",
    "fullTitle": "Tireoidopatias na Gestação (Diabetes Gestacional e Endocrinopatias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Diabetes Gestacional e Endocrinopatias",
    "foco": "Tireoidopatias na Gestação (Hipotireoidismo e Hipertireoidismo)",
    "subfocos": [
      "Hipotireoidismo Gestacional e Metas de TSH por Trimestre",
      "Hipertireoidismo na Gestação (Doença de Graves vs Tireotoxicose Gestacional Transitória)"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Ajuste Dinâmico de Doses",
        "value": "Queda de Demanda no 1º Trimestre vs Resistência Severa no 2º e 3º Trimestres"
      },
      {
        "letter": "B",
        "label": "Avaliação de Complicações Microvasculares",
        "value": "Retinopatia, Nefropatia"
      },
      {
        "letter": "C",
        "label": "Valores de Referência do TSH Gestacional e Aumento Precoce da Dose de Levotiroxina",
        "value": "30-50%"
      },
      {
        "letter": "D",
        "label": "Hipotireoidismo Subclínico",
        "value": "Critérios de Tratamento (Anticorpo Anti-TPO Positivo)"
      }
    ],
    "rule": "Diretriz SBD 2024-2025: Na cetoacidose diabética (CAD), a reposição de potássio precede a insulinoterapia: se K+ < 3,3 mEq/L, adie a insulina e reponha cloreto de potássio até normalização.",
    "bancaTrap": "A resolução da CAD não é determinada pela queda da glicemia (< 200 mg/dL), mas sim pelo fechamento do ânion-gap (≤ 12 mEq/L) e elevação do bicarbonato sérico (≥ 18 mEq/L)."
  },
  {
    "id": "tip-obst-328-sifilis-gestacional-e-con",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Sífilis Gestacional e Congênita",
    "fullTitle": "Sífilis Gestacional e Congênita (Infecções Congênitas e Perinatais • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Sífilis Gestacional e Congênita",
    "subfocos": [
      "Diagnóstico e Critérios de Tratamento Adequado Materno",
      "Abordagem Diagnóstica e Conduta no Recém-Nascido"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Diagnóstico e Critérios de Tratamento Adequado Materno",
        "value": "Rastreamento Obrigatório no 1º e 3º Trimestres e no Momento do Parto com Teste Rápido / VDRL"
      },
      {
        "letter": "B",
        "label": "Critérios de Tratamento Materno Adequado para Considerar o Recém-Nascido Tratado",
        "value": "Uso Exclusivo de Penicilina Benzatina, Esquema Completo para o Estágio Clínico, Iniciado até 30 Dias Antes do Parto e Queda Comprovada dos Títulos de VDRL"
      },
      {
        "letter": "C",
        "label": "Doses",
        "value": "Sífilis Recente (< 1 Ano) - 2,4 Milhões UI em Dose Única; Sífilis Tardia / Indeterminada - 7,2 Milhões UI (3 Doses Semanais de 2,4 Milhões)"
      },
      {
        "letter": "D",
        "label": "VDRL do Sangue Periférico do RN",
        "value": "Não Usar Sangue de Cordão"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-329-toxoplasmose-gestacional",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Toxoplasmose Gestacional e Congênita",
    "fullTitle": "Toxoplasmose Gestacional e Congênita (Infecções Congênitas e Perinatais • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Toxoplasmose Gestacional e Congênita",
    "subfocos": [
      "Interpretação Sorológica e Teste de Avidez",
      "Tratamento com Espiramicina vs Esquema Tríplice"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "IgG Negativo e IgM Negativo",
        "value": "Gestante Suscetível (Orientação Profilática Higienodietética e Repetição Trimestral da Sorologia)"
      },
      {
        "letter": "B",
        "label": "IgG Positivo e IgM Negativo",
        "value": "Infecção Passada / Imune (Sem Risco de Transmissão Fetal)"
      },
      {
        "letter": "C",
        "label": "IgG Positivo e IgM Positivo no 1º Trimestre",
        "value": "Realização Imediata do Teste de Avidez de IgG (< 16 semanas: Alta Avidez Exclui Infecção Recente; Baixa Avidez Confirma Infecção Recente)"
      },
      {
        "letter": "D",
        "label": "Tratamento com Espiramicina vs Esquema Tríplice",
        "value": "Espiramicina Oral Imediata Diante de Infecção Aguda Materna para Prevenção da Transmissão Vertical"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-330-hiv-na-gestacao-e-profila",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "HIV na Gestação e Profilaxia da Transmissão Vertical",
    "fullTitle": "HIV na Gestação e Profilaxia da Transmissão Vertical (Infecções Congênitas e Perinatais • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "HIV na Gestação e Profilaxia da Transmissão Vertical",
    "subfocos": [
      "Terapia Antirretroviral e Rastreamento na Gravidez",
      "Via de Parto e Profilaxias Intra e Pós-Parto"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Terapia Antirretroviral e Rastreamento na Gravidez",
        "value": "Rastreamento Sorológico Obrigatório na 1ª Consulta, no 3º Trimestre e no Parto"
      },
      {
        "letter": "B",
        "label": "Início Imediato de TARV para Todas as Gestantes",
        "value": "Tenofovir + Lamivudina + Dolutegravir (TDF/3TC/DTG) com Meta de Carga Viral Indetectável"
      },
      {
        "letter": "C",
        "label": "Carga Viral com 34 Semanas",
        "value": "CV < 1.000 cópias/mL = Parto Vaginal Permitido sem Necessidade de Zidovudina (AZT) EV se CV Indetectável; CV >= 1.000 cópias/mL = Indicação de Cesariana Eletiva com 38 Semanas associada a AZT EV Intraparto"
      },
      {
        "letter": "D",
        "label": "Contraindicação Absoluta de Amamentação no Brasil",
        "value": "Inibição com Cabergolina Oral e Fórmula Infantil"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-331-infeccao-urinaria-e-pielo",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Infecção Urinária e Pielonefrite na Gravidez",
    "fullTitle": "Infecção Urinária e Pielonefrite na Gravidez (Infecções Congênitas e Perinatais • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Infecção Urinária e Pielonefrite na Gravidez",
    "subfocos": [
      "Bacteriúria Assintomática e Cistite Aguda na Gestação",
      "Pielonefrite Aguda Gestacional e Complicações"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Rastreamento Obrigatório na 1ª Consulta e Tratamento Sistemático da Bacteriúria Assintomática",
        "value": "Urocultura >= 10^5 UFC/mL"
      },
      {
        "letter": "B",
        "label": "Opções Antimicrobianas Seguras",
        "value": "Fosfomicina, Cefalexina, Amoxicilina-Clavulanato e Nitrofurantoína"
      },
      {
        "letter": "C",
        "label": "Quadro Clínico",
        "value": "Febre, Calafrios, Sinal de Giordano Positivo"
      },
      {
        "letter": "D",
        "label": "Antibioticoterapia Venosa",
        "value": "Ceftriaxona"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-332-rastreamento-e-profilaxia",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Rastreamento e Profilaxia do Estreptococo do Grupo B",
    "fullTitle": "Rastreamento e Profilaxia do Estreptococo do Grupo B (Infecções Congênitas e Perinatais • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Rastreamento e Profilaxia do Estreptococo do Grupo B (EGB)",
    "subfocos": [
      "Cultura Anovaginal Universal entre 35 e 37 Semanas",
      "Esquema de Profilaxia Intraparto com Antibiótico"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Indicações de Swab Anovaginal sem Espéculo e Pacientes que Dispensam Rastreamento",
        "value": "Bacteriúria por EGB ou Filho Anterior com Sepse"
      },
      {
        "letter": "B",
        "label": "Critérios Baseados em Fatores de Risco Intraparto se Cultura Desconhecida",
        "value": "Prematuridade, Bolsa Rota >= 18h, Tax >= 38°C"
      },
      {
        "letter": "C",
        "label": "Esquema de Profilaxia Intraparto com Antibiótico",
        "value": "Penicilina Cristalina EV ou Ampicilina EV Iniciadas no Mínimo 4 Horas Antes do Parto"
      },
      {
        "letter": "D",
        "label": "Manejo em Alérgicas à Penicilina",
        "value": "Cefazolina (Baixo Risco) vs Clindamicina/Vancomicina (Alto Risco)"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-333-hepatites-virais-e-infecc",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez",
    "fullTitle": "Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez (Infecções Congênitas e Perinatais • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez",
    "subfocos": [
      "Hepatite B e C no Ciclo Gravídico-Puerperal",
      "Citomegalovírus, Herpes Genital e Vírus Zika"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Rastreamento com HBsAg e Prevenção de Transmissão Vertical",
        "value": "Vacina + Imunoglobulina (HBIG) no RN nas Primeiras 12h"
      },
      {
        "letter": "B",
        "label": "Uso de Tenofovir na Gestante com Carga Viral Alta",
        "value": "> 200.000 UI/mL"
      },
      {
        "letter": "C",
        "label": "Herpes Genital Ativo no Trabalho de Parto",
        "value": "Lesões Visíveis ou Pródromos"
      },
      {
        "letter": "D",
        "label": "Síndrome da Zika Congênita",
        "value": "Microcefalia, Calcificações Subcorticais"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-334-trabalho-de-parto",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Trabalho de Parto",
    "fullTitle": "Trabalho de Parto (Mecanismo de Parto, Partograma e Distócias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Trabalho de Parto (Fases Clínicas e Assistência Humanizada)",
    "subfocos": [
      "Os 4 Períodos Clínicos do Parto",
      "Assistência Humanizada e Boas Práticas da OMS"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "1º Período (Dilatação)",
        "value": "Fase Latente vs Fase Ativa (Dilatação >= 4-5 cm com Contrações Efetivas)"
      },
      {
        "letter": "B",
        "label": "2º Período (Expulsivo)",
        "value": "Dilatação Cervical Total (10 cm) até a Saída Completa do Feto"
      },
      {
        "letter": "C",
        "label": "3º Período (Dequitadura / Secundamento)",
        "value": "Descolamento e Expulsão da Placenta (Manejo Ativo Obrigatório com 10 UI de Ocitocina IM)"
      },
      {
        "letter": "D",
        "label": "4º Período (Greenberg)",
        "value": "Primeira Hora Pós-Parto (Hemostasia Mecânica por Ligaduras de Pinard e Trombotamponamento)"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV.",
    "imageUrl": "/images/medical/partograma_grafico.webp",
    "imageCaption": "Partograma oficial: dilatação cervical ultrapassando a linha de alerta e atingindo a linha de ação, demonstrando fase ativa prolongada.",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Unknown authorUnknown author",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Accouchement_vers_1800_-_Peinture_fran%C3%A7aise_anonyme.jpg"
  },
  {
    "id": "tip-obst-335-mecanismo-do-parto-em-cef",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas",
    "fullTitle": "Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas (Mecanismo de Parto, Partograma e Distócias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas",
    "subfocos": [
      "Os Tempos do Mecanismo do Parto",
      "Apresentações Anômalas (Defletidas e Pélvicas)"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "1º Tempo",
        "value": "Insinuação (Passagem do Maior Diâmetro Transverso pelo Estreito Superior / Plano 0 de De Lee) e Flexão da Cabeça (Diâmetro Suboccipitobregmático 9,5 cm)"
      },
      {
        "letter": "B",
        "label": "2º Tempo",
        "value": "Descida e Rotação Interna da Cabeça (Variedades Anteriores como OEA viram para Púbis / OP)"
      },
      {
        "letter": "C",
        "label": "3º Tempo",
        "value": "Desprendimento da Cabeça por Deflexão / Extensão"
      },
      {
        "letter": "D",
        "label": "4º Tempo",
        "value": "Restituição / Rotação Externa da Cabeça e Desprendimento dos Ombros (Ombro Anterior sob a Sínfise Púbica seguido do Posterior)"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV.",
    "imageUrl": "/images/medical/partograma_grafico.webp",
    "imageCaption": "Partograma oficial: dilatação cervical ultrapassando a linha de alerta e atingindo a linha de ação, demonstrando fase ativa prolongada.",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Unknown authorUnknown author",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Accouchement_vers_1800_-_Peinture_fran%C3%A7aise_anonyme.jpg"
  },
  {
    "id": "tip-obst-336-interpretacao-do-partogra",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Interpretação do Partograma e Linhas de Ação/Alerta",
    "fullTitle": "Interpretação do Partograma e Linhas de Ação/Alerta (Mecanismo de Parto, Partograma e Distócias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Interpretação do Partograma e Linhas de Ação/Alerta",
    "subfocos": [
      "Linhas de Alerta e Ação e Distócias Funcionais",
      "Planos de De Lee e Avaliação da Descida"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Abertura do Partograma na Fase Ativa",
        "value": "Dilatação >= 4-5 cm); Linha de Alerta e Linha de Ação (Traçada 4 Horas à Direita da Linha de Alerta"
      },
      {
        "letter": "B",
        "label": "Fase Ativa Prolongada",
        "value": "Dilatação Cervical Lenta (< 1 cm/hora) Ultrapassando a Linha de Alerta (Causa: Hipocinesia Uterina; Conduta: Ocitocina e Amniotomia)"
      },
      {
        "letter": "C",
        "label": "Parada Secundária da Dilatação",
        "value": "Dilatação Cervical Estagnada na Mesma Medida por 2 Horas Consecutivas na Fase Ativa (Desproporção Cefalopélvica - Indicação de Cesariana)"
      },
      {
        "letter": "D",
        "label": "Período Expulsivo Prolongado",
        "value": "Dilatação Total com Descida Fetal Parada por > 1-2 Horas"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV.",
    "imageUrl": "/images/medical/partograma_grafico.webp",
    "imageCaption": "Partograma oficial: dilatação cervical ultrapassando a linha de alerta e atingindo a linha de ação, demonstrando fase ativa prolongada.",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Unknown authorUnknown author",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:Accouchement_vers_1800_-_Peinture_fran%C3%A7aise_anonyme.jpg"
  },
  {
    "id": "tip-obst-337-distocias-de-trajeto-moto",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Distócias de Trajeto, Motoras e de Ombro",
    "fullTitle": "Distócias de Trajeto, Motoras e de Ombro (Mecanismo de Parto, Partograma e Distócias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Distócias de Trajeto, Motoras e de Ombro",
    "subfocos": [
      "Distócias Ósseas e de Partes Moles",
      "Distócia de Ombro: Fatores de Risco e Manobras Sequenciais"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Avaliação da Bacia Obstétrica",
        "value": "Pelvimetria Clínica e Diâmetro Conjugata Vera vs Diagonal"
      },
      {
        "letter": "B",
        "label": "Distócias de Partes Moles",
        "value": "Miomas Cervicais Prévios, Septos Vaginais e Edema de Colo"
      },
      {
        "letter": "C",
        "label": "Fatores Predisponentes",
        "value": "Macrossomia Fetal e Diabetes Gestacional, e Sinal da Tartaruga"
      },
      {
        "letter": "D",
        "label": "Algoritmo Canônico de Manobras",
        "value": "McRoberts + Pressão Suprapúbica (Rubin I), Manobra de Rubin II, Woods e Gaskin"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-338-forcipe-e-vacuo-extrator",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Fórcipe e Vácuo-Extrator",
    "fullTitle": "Fórcipe e Vácuo-Extrator (Mecanismo de Parto, Partograma e Distócias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Fórcipe e Vácuo-Extrator (Indicações e Condições de Aplicabilidade)",
    "subfocos": [
      "Condições de Aplicabilidade do Fórcipe",
      "Tipos de Fórcipe e Complicações"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Condições Mandatórias",
        "value": "Dilatação Cervical Total (10 cm), Bolsa Rota, Feto Vivo, Apresentação Cefálica Fletida, Proporção Cefalopélvica Adequada, Pelve Materna Conhecida e Bacia Esvaziada"
      },
      {
        "letter": "B",
        "label": "Insinuação Mínima",
        "value": "Cabeça Fetal em Plano >= +2 de De Lee (Fórcipe Baixo / de Alívio)"
      },
      {
        "letter": "C",
        "label": "Fórcipe de Simpson",
        "value": "Ideal para Cabeça Fletida sem Rotação Complexa"
      },
      {
        "letter": "D",
        "label": "Fórcipe de Piper",
        "value": "Exclusivo para Cabeça Derradeira em Parto Pélvico"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-339-cesariana",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Cesariana",
    "fullTitle": "Cesariana (Mecanismo de Parto, Partograma e Distócias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Cesariana (Indicações, Técnica e Parto Vaginal após Cesárea)",
    "subfocos": [
      "Indicações Absolutas vs Relativas de Cesariana",
      "Parto Vaginal após Cesárea Prévia (VBAC) e Riscos de Rotura"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Indicações Absolutas Canônicas",
        "value": "Desproporção Cefalopélvica Absoluta, Placenta Prévia Oclusiva Total, Vasa Prévia e Herpes Ativo"
      },
      {
        "letter": "B",
        "label": "Classificação de Robson",
        "value": "Grupos 1 a 10"
      },
      {
        "letter": "C",
        "label": "Critérios de Segurança para Prova de Trabalho de Parto",
        "value": "Uma Cesárea Transversal Prévia e Ausência de Distócia Prévia"
      },
      {
        "letter": "D",
        "label": "Parto Vaginal após Cesárea Prévia (VBAC) e Riscos de Rotura",
        "value": "Contraindicação Absoluta ao Uso de Misoprostol pelo Risco Catastrófico de Rotura Uterina"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-340-inducao-do-parto-e-escore",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Indução do Parto e Escore de Bishop",
    "fullTitle": "Indução do Parto e Escore de Bishop (Mecanismo de Parto, Partograma e Distócias • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Indução do Parto e Escore de Bishop",
    "subfocos": [
      "Avaliação do Colo Uterino e Escore de Bishop",
      "Métodos de Maturação Cervical e Indução"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "5 Parâmetros do Escore de Bishop",
        "value": "Dilatação, Apagamento, Consistência, Posição e Altura da Apresentação"
      },
      {
        "letter": "B",
        "label": "Interpretação",
        "value": "Bishop >= 9 (Colo Favorável) vs Bishop <= 6 (Colo Desfavorável)"
      },
      {
        "letter": "C",
        "label": "Preparo de Colo Desfavorável",
        "value": "Métodos Mecânicos (Balão de Foley/Krause) e Prostaglandinas (Misoprostol)"
      },
      {
        "letter": "D",
        "label": "Métodos de Maturação Cervical e Indução",
        "value": "Condução com Ocitocina EV em Bomba de Infusão Contínua e Amniotomia Artificial"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-341-puerperio-fisiologico-e-a",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Puerpério Fisiológico e Aleitamento Materno",
    "fullTitle": "Puerpério Fisiológico e Aleitamento Materno (Puerpério e Hemorragia Pós-Parto • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Puerpério Fisiológico e Aleitamento Materno",
    "subfocos": [
      "Modificações Locais e Sistêmicas do Puerpério Imediato e Tardio",
      "Fisiologia da Lactação e Manejo de Dificuldades Iniciais"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Involução Uterina Fisiológica",
        "value": "Fundo Uterino na Cicatriz Umbilical no Pós-Parto Imediato) e Loquiação (Rubra, Serosa, Alba"
      },
      {
        "letter": "B",
        "label": "Puerpério Imediato",
        "value": "1º ao 10º dia), Tardio (11º ao 42º dia) e Remoto (> 42 dias"
      },
      {
        "letter": "C",
        "label": "Apojadura (Descida do Leite",
        "value": "48-72h Pós-Parto) Mediada pela Queda de Progesterona e Ação da Prolactina"
      },
      {
        "letter": "D",
        "label": "Ingurgitamento Mamário Fisiológico vs Patológico",
        "value": "Ordenha de Alívio, Massagem e Compressas Frias"
      }
    ],
    "rule": "Sociedade Brasileira de Pediatria (SBP) / PNI: O aleitamento materno exclusivo é recomendado até os 6 meses de vida; na bronquiolite viral aguda em lactentes, a conduta primária é suporte com aspiração de VAS e hidratação.",
    "bancaTrap": "Na bronquiolite viral aguda pelo VSR, o uso de broncodilatadores inalatórios (salbutamol), corticoides sistêmicos e antibióticos é formalmente desaconselhado pelas diretrizes por ausência de benefício comprovado."
  },
  {
    "id": "tip-obst-342-hemorragia-pos-parto",
    "category": "semiologia",
    "categoryLabel": "Semiologia & Manobras",
    "title": "Hemorragia Pós-Parto",
    "fullTitle": "Hemorragia Pós-Parto (Puerpério e Hemorragia Pós-Parto • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Hemorragia Pós-Parto (HPP: 4 Ts - Tônus, Trauma, Tecido, Trombina)",
    "subfocos": [
      "Definição, Fatores de Risco e Manejo Ativo do 3º Período",
      "Algoritmo Terapêutico Sequencial da Atonia Uterina"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Definição Canônica de HPP",
        "value": "Perda Sanguínea > 500 mL (Parto Vaginal) ou > 1000 mL (Cesariana) em 24h"
      },
      {
        "letter": "B",
        "label": "Profilaxia Obrigatória",
        "value": "Administração de 10 UI de Ocitocina IM Imediatamente após a Saída do Ombro Anterior"
      },
      {
        "letter": "C",
        "label": "Massagem Uterina Bimanual",
        "value": "Manobra de Hamilton) e Uterotônicos em Cascata (Ocitocina EV, Metilergonovina, Misoprostol"
      },
      {
        "letter": "D",
        "label": "Uso Precoce de Ácido Tranexâmico 1g EV nos Primeiros 30 Minutos e Balão de Tamponamento Intrauterino",
        "value": "Bakri"
      }
    ],
    "rule": "Protocolo ATLS 11ª edição: A sequência primária sistematizada X-A-B-C-D-E prioriza o controle de hemorragias exanguinantes externas (X) com torniquetes e curativos compressivos antes da abordagem da via aérea.",
    "bancaTrap": "No pneumotórax hipertensivo, o diagnóstico é puramente clínico (hipotensão, turgência jugular, desvio de traqueia e murmúrio ausente); aguardar radiografia de tórax é erro grave que atrasa a descompressão imediata."
  },
  {
    "id": "tip-obst-343-infeccao-puerperal-e-endo",
    "category": "triades",
    "categoryLabel": "Tríades & Pêntades Clínicas",
    "title": "Infecção Puerperal e Endometrite Pós-Parto",
    "fullTitle": "Infecção Puerperal e Endometrite Pós-Parto (Puerpério e Hemorragia Pós-Parto • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Infecção Puerperal e Endometrite Pós-Parto",
    "subfocos": [
      "Fisiopatologia, Critérios Diagnósticos e Fatores de Risco",
      "Esquemas Antimicrobianos Venosos e Complicações"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Clínicos de Morbidade Febril Puerperal",
        "value": "Febre >= 38°C em 2 Dias Consecutivos (Excluindo as Primeiras 24h)"
      },
      {
        "letter": "B",
        "label": "Tríade da Endometrite",
        "value": "Febre, Subinvolução Uterina Dolorosa e Lóquios Fétidos (Acentuada Pós-Cesariana)"
      },
      {
        "letter": "C",
        "label": "Investigação de Febre Persistente",
        "value": "Abscesso Pélvico, Hematoma Infectado e Tromboflebite Pélvica Séptica"
      },
      {
        "letter": "D",
        "label": "Quadro Clínico da Mastite",
        "value": "Sinais Flogísticos Unilaterais em Quadrante Mamário, Febre Alta, Calafrios e Queda do EG"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-344-mastite-puerperal-e-absce",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Mastite Puerperal e Abscesso Mamário",
    "fullTitle": "Mastite Puerperal e Abscesso Mamário (Puerpério e Hemorragia Pós-Parto • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Mastite Puerperal e Abscesso Mamário",
    "subfocos": [
      "Diagnóstico Diferencial: Ingurgitamento vs Mastite Puerperal",
      "Antibioticoterapia e Manejo de Abscessos Mamários"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Principal Agente Etiológico",
        "value": "Staphylococcus aureus e Manutenção Obrigatória da Amamentação na Mama Afetada"
      },
      {
        "letter": "B",
        "label": "Diagnóstico Diferencial: Ingurgitamento vs Mastite Puerperal",
        "value": "Tratamento Antimicrobiano com Cefalexina ou Amoxicilina-Clavulanato por 10 a 14 Dias"
      },
      {
        "letter": "C",
        "label": "Abscesso Mamário Fluctuante",
        "value": "Diagnóstico Ultrassonográfico e Drenagem por Aspiração com Agulha ou Incisão"
      },
      {
        "letter": "D",
        "label": "Antibioticoterapia e Manejo de Abscessos Mamários",
        "value": "Estado de Hipercoagulabilidade Puerperal e Alto Risco de Trombose Venosa Profunda em Membros Inferiores"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-345-tromboflebite-pelvica-sep",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Tromboflebite Pélvica Séptica e TVP no Puerpério",
    "fullTitle": "Tromboflebite Pélvica Séptica e TVP no Puerpério (Puerpério e Hemorragia Pós-Parto • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Tromboflebite Pélvica Séptica e TVP no Puerpério",
    "subfocos": [
      "Tromboembolismo Venoso no Puerpério",
      "Tromboflebite Pélvica Séptica (Diagnóstico de Exclusão)"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Anticoagulação Terapêutica Segura no Puerpério e Lactação com Heparina de Baixo Peso Molecular",
        "value": "Enoxaparina"
      },
      {
        "letter": "B",
        "label": "Suspeita em Paciente com Endometrite que Mantém Febre em Picos",
        "value": "Febre em Agulha"
      },
      {
        "letter": "C",
        "label": "Teste Terapêutico Diagnóstico com Heparinização Plena EV",
        "value": "Resolução Rápida da Febre em 48-72h"
      },
      {
        "letter": "D",
        "label": "Blues Puerperal",
        "value": "Transitório, Início Precoce (3º ao 5º dia), Autolimitado (até 2 semanas), sem Prejuízo do Vínculo"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-346-depressao-e-psicose-puerp",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Depressão e Psicose Puerperal",
    "fullTitle": "Depressão e Psicose Puerperal (Puerpério e Hemorragia Pós-Parto • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Depressão e Psicose Puerperal",
    "subfocos": [
      "Blues Puerperal (Disforia Pós-Parto) vs Depressão Pós-Parto",
      "Psicose Puerperal: Emergência Psiquiátrica"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Depressão Pós-Parto",
        "value": "Sintomas Persistentes (> 2 semanas), Anedonia, Sentimento de Culpa e Incapacidade de Cuidar do Bebê"
      },
      {
        "letter": "B",
        "label": "Quadro Clínico Severo",
        "value": "Alucinações, Delírios de Conteúdo Místico/Persecutório e Alto Risco de Infanticídio e Suicídio"
      },
      {
        "letter": "C",
        "label": "Psicose Puerperal: Emergência Psiquiátrica",
        "value": "Manejo Imediato com Internação Psiquiátrica, Separação Supervisionada do Bebê e Antipsicóticos"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-347-cardiotocografia-basal-e",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Cardiotocografia Basal e Intraparto",
    "fullTitle": "Cardiotocografia Basal e Intraparto (Avaliação da Vitalidade Fetal • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Avaliação da Vitalidade Fetal",
    "foco": "Cardiotocografia Basal e Intraparto (Categorias I, II e III)",
    "subfocos": [
      "Parâmetros Normais da Cardiotocografia",
      "Desacelerações e Categorias I, II e III do FIGO/ACOG"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Linha de Base Normal",
        "value": "FC Fetal entre 110 e 160 bpm"
      },
      {
        "letter": "B",
        "label": "Variabilidade Normal",
        "value": "Moderada (Flutuações entre 6 e 25 bpm - Marcador Mais Fidedigno de Boa Oxigenação do SNC Fetal)"
      },
      {
        "letter": "C",
        "label": "Acelerações Transitórias",
        "value": "Aumento >= 15 bpm por >= 15 segundos"
      },
      {
        "letter": "D",
        "label": "Contrações Uterinas Normais",
        "value": "Até 4 a 5 Contrações em 10 Minutos (Sem Taquissistolia)"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV.",
    "imageUrl": "/images/medical/cardiotocografia_dip.webp",
    "imageCaption": "Traçado de cardiotocografia: desacelerações tardias periódicas em espelho com as contrações uterinas (DIP II), indicando hipóxia e sofrimento fetal agudo.",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "PhantomSteve/talk|contribs\\",
    "imageLicense": "CC BY-SA 3.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:CTG_Output.jpg"
  },
  {
    "id": "tip-obst-348-perfil-biofisico-fetal",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Perfil Biofísico Fetal",
    "fullTitle": "Perfil Biofísico Fetal (Avaliação da Vitalidade Fetal • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Avaliação da Vitalidade Fetal",
    "foco": "Perfil Biofísico Fetal (PBF)",
    "subfocos": [
      "Parâmetros Agudos e Crônicos do PBF",
      "Interpretação e Conduta Obstétrica"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Parâmetro Crônico",
        "value": "Líquido Amniótico - ILA) vs Parâmetros Agudos (Reatividade Cardíaca, Movimentos Respiratórios, Movimentos Corpóreos, Tônus Fetal"
      },
      {
        "letter": "B",
        "label": "Pontuação do PBF (Total de 10 Pontos",
        "value": "2 Pontos por Parâmetro Normal e 0 se Anormal)"
      },
      {
        "letter": "C",
        "label": "Escore 8/10 ou 10/10 com ILA Normal",
        "value": "Feto Hígido e Bem-Estar Confirmado"
      },
      {
        "letter": "D",
        "label": "Escore <= 4/10",
        "value": "Forte Indício de Asfixia Fetal Aguda Grave e Indicação de Interrupção da Gestação"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-obst-349-dopplervelocimetria-obste",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Dopplervelocimetria Obstétrica",
    "fullTitle": "Dopplervelocimetria Obstétrica (Avaliação da Vitalidade Fetal • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Avaliação da Vitalidade Fetal",
    "foco": "Dopplervelocimetria Obstétrica (Artérias Uterinas, Umbilical e Cerebral Média, Ducto Venoso)",
    "subfocos": [
      "Artérias Uterinas, Umbilical e Cerebral Média",
      "Ducto Venoso e Avaliação da Acidemia Fetal"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Doppler de Artérias Uterinas no 2º Trimestre",
        "value": "Presença de Incisura Protodiastólica Bilateral Persistente após 24-26 Semanas Indica Falha na 2ª Onda de Invasão Trofoblástica e Risco Aumentado de Pré-Eclâmpsia e RCIU"
      },
      {
        "letter": "B",
        "label": "Doppler de Artéria Umbilical",
        "value": "Avalia a Resistência Placentária (Aumento da Relação S/D, Diástole Zero e Diástole Reversa como Indicador Crítico de Insuficiência Placentária)"
      },
      {
        "letter": "C",
        "label": "Doppler de Artéria Cerebral Média (ACM)",
        "value": "Vasodilatação com Queda do Índice de Pulsatilidade (Centralização Fetal - Priorização de Fluxo para Cérebro, Coração e Adrenais)"
      },
      {
        "letter": "D",
        "label": "Avaliação Hemodinâmica Cardíaca Direita Fetal",
        "value": "Onda A Normal (Anterógrada na Contração Atrial)"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV.",
    "imageUrl": "/images/medical/cardiotocografia_dip.webp",
    "imageCaption": "Traçado de cardiotocografia: desacelerações tardias periódicas em espelho com as contrações uterinas (DIP II), indicando hipóxia e sofrimento fetal agudo.",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "PhantomSteve/talk|contribs\\",
    "imageLicense": "CC BY-SA 3.0",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:CTG_Output.jpg"
  },
  {
    "id": "tip-obst-350-restricao-de-crescimento",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Restrição de Crescimento Intrauterino",
    "fullTitle": "Restrição de Crescimento Intrauterino (Avaliação da Vitalidade Fetal • Obstetrícia)",
    "specialty": "Obstetrícia",
    "tema": "Avaliação da Vitalidade Fetal",
    "foco": "Restrição de Crescimento Intrauterino (RCIU)",
    "subfocos": [
      "Classificação e Diagnóstico Ultrassonográfico da RCF",
      "Seguimento Dopplerfluorimétrico e Momento do Parto"
    ],
    "provenanceDefault": "FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Definição Canônica",
        "value": "Peso Fetal Estimado < P10 com Doppler Alterado ou < P3 Isolado"
      },
      {
        "letter": "B",
        "label": "RCIU Precoce",
        "value": "< 32 semanas, Insuficiência Placentária Grave, Alta Resistência) vs Tardio (>= 32 semanas, Hipóxia Crônica Sutil"
      },
      {
        "letter": "C",
        "label": "Centralização Fetal",
        "value": "Vasodilatação da Artéria Cerebral Média com Aumento da Relação Cérebro-Placentária (RCP < 1)"
      },
      {
        "letter": "D",
        "label": "Alterações Críticas do Ducto Venoso",
        "value": "Onda A Negativa/Reversa"
      }
    ],
    "rule": "FEBRASGO / Manual do Ministério da Saúde: Sulfato de magnésio é a droga de escolha mandatória para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclampsia (esquemas de Pritchard ou Zuspan).",
    "bancaTrap": "Durante a infusão contínua de sulfato de magnésio, a monitorização de segurança exige reflexo patelar presente, frequência respiratória ≥ 16 irpm e diurese ≥ 25 mL/h; o antídoto específico para intoxicação é o gluconato de cálcio 10% IV."
  },
  {
    "id": "tip-medi-351-principios-doutrinarios-e",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Princípios Doutrinários e Organizativos do SUS",
    "fullTitle": "Princípios Doutrinários e Organizativos do SUS (Sistema Único de Saúde (SUS): Princípios e Legislação • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Princípios Doutrinários e Organizativos do SUS (Universalidade, Integralidade, Equidade, Descentralização)",
    "subfocos": [
      "Princípios Doutrinários / Éticos do SUS",
      "Princípios Organizativos / Operacionais do SUS"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Universalidade",
        "value": "Acesso Garantido a Todos os Cidadãos em Todos os Níveis de Assistência à Saúde sem Discriminação"
      },
      {
        "letter": "B",
        "label": "Integralidade",
        "value": "Visão Holística Biopsicossocial que Engloba Ações de Promoção, Prevenção, Cura e Reabilitação Articuladas"
      },
      {
        "letter": "C",
        "label": "Equidade",
        "value": "Tratar Desigualmente os Desiguais para Reduzir Disparidades Sociais e Focar Mais Recursos Onde Há Maior Necessidade"
      },
      {
        "letter": "D",
        "label": "Descentralização Político-Administrativa com Direção Única em Cada Esfera de Governo",
        "value": "Ênfase na Municipalização"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-352-lei-organica-da-saude-8-0",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Lei Orgânica da Saúde 8.080/1990",
    "fullTitle": "Lei Orgânica da Saúde 8.080/1990 (Sistema Único de Saúde (SUS): Princípios e Legislação • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Lei Orgânica da Saúde 8.080/1990",
    "subfocos": [
      "Competências das Esferas de Governo e Campo de Atuação",
      "Participação Complementar do Setor Privado"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Atribuições Exclusivas da União",
        "value": "Nacional), Estados (Coordenação Regional) e Municípios (Executores Primários das Ações de Saúde"
      },
      {
        "letter": "B",
        "label": "Campo de Atuação do SUS",
        "value": "Vigilância Sanitária, Vigilância Epidemiológica, Saúde do Trabalhador e Assistência Terapêutica Integral (Inclusive Farmacêutica)"
      },
      {
        "letter": "C",
        "label": "Critérios de Contratação",
        "value": "Apenas quando as Disponibilidades do SUS Forem Insuficientes, Mediante Contrato de Direito Público ou Convênio"
      },
      {
        "letter": "D",
        "label": "Participação Complementar do Setor Privado",
        "value": "Preferência Constitucional Obrigatória por Entidades Filantrópicas e Sem Fins Lucrativos"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-353-lei-8-142-1990-e-particip",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Lei 8.142/1990 e Participação da Comunidade",
    "fullTitle": "Lei 8.142/1990 e Participação da Comunidade (Sistema Único de Saúde (SUS): Princípios e Legislação • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Lei 8.142/1990 e Participação da Comunidade",
    "subfocos": [
      "Conselhos e Conferências de Saúde",
      "Transferência Intergovernamental de Recursos e Condicionantes"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Conselhos de Saúde",
        "value": "Órgão Colegiado, Permanente e Deliberativo, Reuniões Mensais, Fiscalização Financeira e Aprovação dos Gastos em Saúde"
      },
      {
        "letter": "B",
        "label": "Conferências de Saúde",
        "value": "Reuniões Obrigatórias a Cada 4 Anos com Representação de Vários Segmentos Sociais para Avaliar a Situação de Saúde e Propor Diretrizes"
      },
      {
        "letter": "C",
        "label": "Paridade Representativa Obrigatória",
        "value": "50% Usuários, 25% Trabalhadores de Saúde e 25% Gestores e Prestadores de Serviços"
      },
      {
        "letter": "D",
        "label": "Transferência Intergovernamental de Recursos e Condicionantes",
        "value": "Repasse Fundo a Fundo Regular e Automático entre as Esferas de Governo"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-354-decreto-presidencial-7-50",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Decreto Presidencial 7.508/2011 e Regiões de Saúde",
    "fullTitle": "Decreto Presidencial 7.508/2011 e Regiões de Saúde (Sistema Único de Saúde (SUS): Princípios e Legislação • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Decreto Presidencial 7.508/2011 e Regiões de Saúde",
    "subfocos": [
      "Regiões de Saúde e Requisitos Mínimos",
      "Portas de Entrada e Contrato Organizativo (COAP)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Conceito de Região de Saúde",
        "value": "Espaço Geográfico Contínuo Constituído por Agrupamentos de Municípios Limítrofes para Integrar Organização, Planejamento e Ações de Saúde"
      },
      {
        "letter": "B",
        "label": "Os 5 Serviços Obrigatórios Mínimos da Região de Saúde",
        "value": "1. Atenção Primária; 2. Urgência e Emergência; 3. Atenção Psicossocial (CAPS); 4. Atenção Ambulatorial Especializada e Hospitalar; 5. Vigilância em Saúde"
      },
      {
        "letter": "C",
        "label": "Portas de Entrada Oficiais do SUS",
        "value": "Atenção Primária à Saúde, Atenção de Urgência e Emergência, Atenção Psicossocial e Serviços Especiais de Acesso Aberto"
      },
      {
        "letter": "D",
        "label": "Contrato Organizativo da Ação Pública da Saúde",
        "value": "COAP"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-355-financiamento-do-sus-e-em",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Financiamento do SUS e Emendas Constitucionais",
    "fullTitle": "Financiamento do SUS e Emendas Constitucionais (Sistema Único de Saúde (SUS): Princípios e Legislação • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Financiamento do SUS e Emendas Constitucionais",
    "subfocos": [
      "Emenda Constitucional 29/2000 e Lei Complementar 141/2012",
      "Blocos de Financiamento e Programa Previne Brasil"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Percentuais Mínimos Obrigatórios de Aplicação de Receitas em Saúde",
        "value": "Municípios (Mínimo de 15%), Estados (Mínimo de 12%) e União (Regras Progressivas e EC 95/Teto de Gastos)"
      },
      {
        "letter": "B",
        "label": "Despesas que NÃO Podem Ser Consideradas Ações e Serviços Públicos de Saúde",
        "value": "Merenda Escolar, Saneamento Básico Amplo, Aposentadorias e Pensões"
      },
      {
        "letter": "C",
        "label": "Transição dos Antigos 5 Blocos para os 2 Grandes Blocos de Financiamento",
        "value": "Custeio e Investimento - Portaria de Consolidação nº 6/2017"
      },
      {
        "letter": "D",
        "label": "Modelo do Previne Brasil para a APS",
        "value": "Capitação Ponderada, Pagamento por Desempenho (Indicadores de Saúde) e Incentivo para Ações Estratégicas"
      }
    ],
    "rule": "Diretrizes SBC / AHA: O supradesnivelamento do segmento ST em ≥ 2 derivações contíguas define IAM com supra (IAMCSST); tempo porta-balão alvo < 90 min (ou porta-agulha < 30 min se trombólise).",
    "bancaTrap": "Em IAM de parede inferior (DII, DIII, aVF), é mandatório rodar as derivações direitas (V3R e V4R); se houver acometimento de ventrículo direito, nitratos e betabloqueadores são formalmente contraindicados."
  },
  {
    "id": "tip-medi-356-evolucao-historica-das-po",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Evolução Histórica das Políticas de Saúde no Brasil",
    "fullTitle": "Evolução Histórica das Políticas de Saúde no Brasil (História das Políticas de Saúde e Gestão do SUS • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "História das Políticas de Saúde e Gestão do SUS",
    "foco": "Evolução Histórica das Políticas de Saúde no Brasil (INAMPS, Reforma Sanitária e 8ª CNS)",
    "subfocos": [
      "Da Previdência Social Excludente ao SUS (1923-1988)",
      "Movimento da Reforma Sanitária e 8ª CNS (1986)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Lei Eloy Chaves (1923)",
        "value": "Criação das Caixas de Aposentadoria e Pensões (CAPs por Empresa - Marco Inicial da Previdência Social no Brasil)"
      },
      {
        "letter": "B",
        "label": "Era Vargas",
        "value": "Criação dos Institutos de Aposentadoria e Pensões (IAPs por Categoria Profissional - Bancários, Marítimos, Comerciários)"
      },
      {
        "letter": "C",
        "label": "Ditadura Militar",
        "value": "Unificação no INPS (1966) e Criação do INAMPS (1977 - Medicina Previdenciária Curativista, Hospitalocêntrica e Excludente aos Trabalhadores Formais)"
      },
      {
        "letter": "D",
        "label": "8ª Conferência Nacional de Saúde (1986) presidida por Sergio Arouca",
        "value": "Marco Histórico que Concebeu a \"Saúde como Direito de Todos e Dever do Estado\""
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-357-normas-operacionais-basic",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Normas Operacionais Básicas",
    "fullTitle": "Normas Operacionais Básicas (História das Políticas de Saúde e Gestão do SUS • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "História das Políticas de Saúde e Gestão do SUS",
    "foco": "Normas Operacionais Básicas (NOB 91, 93, 96) e NOAS 2001/2002",
    "subfocos": [
      "O Processo de Descentralização pelas NOBs dos Anos 90",
      "Normas Operacionais de Assistência à Saúde (NOAS 2001/2002)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "NOB 91 e NOB 93",
        "value": "Municipalização Incipiente, Criação das Comissões Intergestores Bipartite (CIB) e Tripartite (CIT) e Habilitação em Condições de Gestão (Incipiente, Parcial e Semi-Plena)"
      },
      {
        "letter": "B",
        "label": "NOB 96",
        "value": "Marco da Descentralização - Criação do Piso da Atenção Básica (PAB Fixo e Variável), Gestão Plena da Atenção Básica e Gestão Plena do Sistema Municipal com Repasse Regular Fundo a Fundo"
      },
      {
        "letter": "C",
        "label": "Ênfase na Regionalização e Acesso com Equidade",
        "value": "Criação do Plano Diretor de Regionalização (PDR) e Plano Diretor de Investimentos (PDI)"
      },
      {
        "letter": "D",
        "label": "Normas Operacionais de Assistência à Saúde (NOAS 2001/2002)",
        "value": "Definição da Média Complexidade como Responsabilidade Compartilhada e Módulos Assistenciais"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-358-pacto-pela-saude",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Pacto pela Saúde",
    "fullTitle": "Pacto pela Saúde (História das Políticas de Saúde e Gestão do SUS • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "História das Políticas de Saúde e Gestão do SUS",
    "foco": "Pacto pela Saúde (2006) e Contrato Organizativo de Ação Pública (COAP)",
    "subfocos": [
      "As Três Dimensões do Pacto pela Saúde",
      "Contrato Organizativo e Colegiados Regionais"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Pacto pela Vida",
        "value": "Definição de 6 Prioridades Sanitárias Nacionais de Impacto (Saúde do Idoso, Câncer de Colo e Mama, Mortalidade Materno-Infantil, Doenças Emergentes como Dengue, Promoção da Saúde e APS)"
      },
      {
        "letter": "B",
        "label": "Pacto em Defesa do SUS",
        "value": "Fortalecimento da Cidadania, Movimento Social e Defesa do Financiamento Estável"
      },
      {
        "letter": "C",
        "label": "Pacto de Gestão",
        "value": "Descentralização, Fim do Processo de Habilitação das NOBs e Instituição do Termo de Compromisso de Gestão"
      },
      {
        "letter": "D",
        "label": "Criação dos Colegiados de Gestão Regional",
        "value": "CGR), Atuais Comissões Intergestores Regionais (CIR"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-359-planejamento-programacao",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Planejamento, Programação e Regulação no SUS",
    "fullTitle": "Planejamento, Programação e Regulação no SUS (História das Políticas de Saúde e Gestão do SUS • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "História das Políticas de Saúde e Gestão do SUS",
    "foco": "Planejamento, Programação e Regulação no SUS",
    "subfocos": [
      "Instrumentos de Planejamento Governamental e Gestão (PPA, LDO, LOA, PMS, PAS e RAG)",
      "Complexos Reguladores, Central de Vagas e Acesso do Usuário"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Ciclo de Planejamento em Saúde",
        "value": "Plano Municipal de Saúde (4 anos), Programação Anual de Saúde e Relatório Anual de Gestão"
      },
      {
        "letter": "B",
        "label": "Planejamento Regional Integrado",
        "value": "PRI"
      },
      {
        "letter": "C",
        "label": "Regulação do Acesso",
        "value": "Protocolos de Acesso, Central de Leitos e Sistema de Regulação (SISREG)"
      },
      {
        "letter": "D",
        "label": "Garantia de Fluxos de Referência e Contrarreferência nas Redes de Atenção à Saúde",
        "value": "RAS"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-360-principios-da-atencao-pri",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Princípios da Atenção Primária",
    "fullTitle": "Princípios da Atenção Primária (Atenção Primária à Saúde e Medicina de Família • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Princípios da Atenção Primária (Starfield: Atributos Essenciais e Derivados)",
    "subfocos": [
      "Atributos Essenciais de Barbara Starfield",
      "Atributos Derivados de Barbara Starfield"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Acesso de Primeiro Contato",
        "value": "Porta de Entrada Preferencial, Acessibilidade Geográfica, Funcional e Financeira"
      },
      {
        "letter": "B",
        "label": "Longitudinalidade",
        "value": "Acompanhamento Clínico Contínuo e Relação Pessoal Duradoura ao Longo do Tempo Independentemente da Presença de Doença"
      },
      {
        "letter": "C",
        "label": "Integralidade",
        "value": "Reconhecimento Amplo de Todas as Necessidades Biopsicossociais de Saúde da População com Encaminhamentos Apropriados"
      },
      {
        "letter": "D",
        "label": "Coordenação do Cuidado",
        "value": "Integração de Todas as Informações e Serviços Recebidos pelo Paciente nos Diferentes Pontos da Rede"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-361-estrategia-saude-da-famil",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Estratégia Saúde da Família",
    "fullTitle": "Estratégia Saúde da Família (Atenção Primária à Saúde e Medicina de Família • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Estratégia Saúde da Família (ESF) e Equipe Multiprofissional (eMulti)",
    "subfocos": [
      "Diretrizes Operacionais e Composição da Equipe ESF",
      "Atribuições do ACS e Equipes Multiprofissionais (eMulti)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Composição Mínima Obrigatória",
        "value": "Médico (Preferencialmente de Família e Comunidade), Enfermeiro, Técnico de Enfermagem e Agentes Comunitários de Saúde (ACS)"
      },
      {
        "letter": "B",
        "label": "Diretrizes Operacionais e Composição da Equipe ESF",
        "value": "Carga Horária de 40 Horas Semanais para Todos os Membros da Equipe"
      },
      {
        "letter": "C",
        "label": "População Adscrita Recomendada",
        "value": "Entre 2.000 e 3.500 Pessoas por Equipe de Saúde da Família"
      },
      {
        "letter": "D",
        "label": "Agente Comunitário de Saúde (ACS)",
        "value": "Elo entre a Comunidade e a Equipe, Cadastramento Familiar e Visita Domiciliar Periódica (Máximo de 750 Pessoas por ACS)"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-362-politica-nacional-de-aten",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Política Nacional de Atenção Básica",
    "fullTitle": "Política Nacional de Atenção Básica (Atenção Primária à Saúde e Medicina de Família • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Política Nacional de Atenção Básica (PNAB)",
    "subfocos": [
      "Diretrizes Operacionais, Carga Horária e Composição da ESF e eAP",
      "Atribuições dos Profissionais e Financiamento da Atenção Primária"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Equipe de Saúde da Família (Médico, Enfermeiro, Técnico e ACS)",
        "value": "40h Semanais e Adstrição de População (2.000 a 3.500 pessoas)"
      },
      {
        "letter": "B",
        "label": "Equipe de Atenção Primária (eAP",
        "value": "Modalidades I e II com Carga Horária Flexível) e Equipes de Saúde Bucal"
      },
      {
        "letter": "C",
        "label": "Atribuições do Agente Comunitário de Saúde",
        "value": "ACS"
      },
      {
        "letter": "D",
        "label": "Modelo de Financiamento da Atenção Primária",
        "value": "Capitação Ponderada, Pagamento por Desempenho e Ações Estratégicas"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-363-metodo-clinico-centrado-n",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Método Clínico Centrado na Pessoa e Genograma/Ecomapa",
    "fullTitle": "Método Clínico Centrado na Pessoa e Genograma/Ecomapa (Atenção Primária à Saúde e Medicina de Família • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Método Clínico Centrado na Pessoa e Genograma/Ecomapa",
    "subfocos": [
      "Os 4 Componentes do MCCP (Stewart)",
      "Ferramentas de Abordagem Familiar: Genograma e Ecomapa"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "2. Entendendo a Pessoa como um Todo",
        "value": "Indivíduo, Família, Ambiente e Contexto Cultural"
      },
      {
        "letter": "B",
        "label": "3. Elaborando um Projeto Comum de Manejo",
        "value": "Definição Conjunta de Prioridades e Metas Compartilhadas"
      },
      {
        "letter": "C",
        "label": "4. Intensificando a Relação Médico-Pessoa",
        "value": "Empatia, Autonomia e Cuidado Compartilhado"
      },
      {
        "letter": "D",
        "label": "Genograma / Familiograma",
        "value": "Representação Gráfica Estruturada de Pelo Menos 3 Gerações Familiares com Símbolos Padronizados (Homem Quadrado, Mulher Círculo, Laços e Conflitos)"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-364-prevencao-quaternaria-e-s",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Prevenção Quaternária e Segurança do Paciente na APS",
    "fullTitle": "Prevenção Quaternária e Segurança do Paciente na APS (Atenção Primária à Saúde e Medicina de Família • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Prevenção Quaternária e Segurança do Paciente na APS",
    "subfocos": [
      "Os Níveis de Prevenção de Leavell & Clark e Jamoulle",
      "Princípios do *Choosing Wisely* e Medicina Baseada em Evidências"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Prevenção Terciária (Período Patogênico Avançado)",
        "value": "Reabilitação e Prevenção de Incapacidades em Doenças Estabelecidas"
      },
      {
        "letter": "B",
        "label": "Prevenção Quaternária (Marc Jamoulle)",
        "value": "Identificação de Indivíduos em Risco de Sobrediagnóstico / Sobretratamento e Proteção contra Iatrogenias Médicas e Intervenções Excessivas"
      },
      {
        "letter": "C",
        "label": "Prevenção Quinquenária",
        "value": "Prevenção do Dano ao Próprio Profissional de Saúde (Burnout e Esgotamento)"
      },
      {
        "letter": "D",
        "label": "Campanha *Choosing Wisely*",
        "value": "Recomendações contra Práticas Médicas Inúteis ou Potencialmente Nocivas"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-365-incidencia-prevalencia-e",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Incidência, Prevalência e Taxa de Ataque",
    "fullTitle": "Incidência, Prevalência e Taxa de Ataque (Medidas de Frequência e Associação Epidemiológica • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Incidência, Prevalência e Taxa de Ataque",
    "subfocos": [
      "Conceito e Cálculo de Incidência vs Prevalência",
      "Taxa de Ataque e Taxa de Ataque Secundária"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Incidência",
        "value": "Número de Casos Novos em uma População sob Risco em Determinado Período de Tempo (Mede Risco e Dinâmica de Ocorrência)"
      },
      {
        "letter": "B",
        "label": "Prevalência",
        "value": "Número Total de Casos Existentes (Novos e Antigos) em um Ponto Específico do Tempo (Mede a Carga Estática da Doença)"
      },
      {
        "letter": "C",
        "label": "Relação Fisiomatemática",
        "value": "Prevalência ~ Incidência x Duração Média da Doença"
      },
      {
        "letter": "D",
        "label": "Fatores que Aumentam a Prevalência sem Aumentar a Incidência",
        "value": "Maior Sobrevida da Doença, Tratamento que Prolonga a Vida sem Curar e Imigração de Casos"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-366-risco-relativo",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Risco Relativo",
    "fullTitle": "Risco Relativo (Medidas de Frequência e Associação Epidemiológica • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Risco Relativo (RR) e Razão de Prevalência (RP)",
    "subfocos": [
      "Cálculo e Interpretação do Risco Relativo (RR)",
      "Razão de Prevalência (RP) em Estudos Transversais"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Medida de Associação Típica de Estudos Prospectivos com Acompanhamento",
        "value": "Estudo de Coorte e Ensaio Clínico Randomizado"
      },
      {
        "letter": "B",
        "label": "Fórmula",
        "value": "RR = Incidência nos Expostos (Ie) / Incidência nos Não Expostos (Ine)"
      },
      {
        "letter": "C",
        "label": "Interpretação",
        "value": "RR > 1 (Fator de Risco); RR = 1 (Ausência de Associação / Nulo); RR < 1 (Fator de Proteção)"
      },
      {
        "letter": "D",
        "label": "Interpretação do Intervalo de Confiança de 95%",
        "value": "Se o IC95% Não Conter o Valor 1,0, a Associação é Estatisticamente Significante"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-367-odds-ratio",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Odds Ratio",
    "fullTitle": "Odds Ratio (Medidas de Frequência e Associação Epidemiológica • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Odds Ratio (OR)",
    "subfocos": [
      "Cálculo do Odds Ratio (Razão de Chances) na Tabela 2x2",
      "Regressão Logística e Odds Ratio Ajustado"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Medida de Associação Exclusiva dos Estudos Transversais / Seccionais",
        "value": "Não Mede Incidência"
      },
      {
        "letter": "B",
        "label": "Cálculo do Odds Ratio (Razão de Chances) na Tabela 2x2",
        "value": "Medida de Associação Exclusiva dos Estudos de Caso-Controle"
      },
      {
        "letter": "C",
        "label": "Fórmula do Produto Cruzado",
        "value": "OR = (a x d) / (b x c)"
      },
      {
        "letter": "D",
        "label": "Interpretação",
        "value": "Chance de Exposição entre os Casos comparada à Chance de Exposição entre os Controles"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-368-risco-atribuivel-e-fracao",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Risco Atribuível e Fração Atribuível",
    "fullTitle": "Risco Atribuível e Fração Atribuível (Medidas de Frequência e Associação Epidemiológica • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Risco Atribuível e Fração Atribuível",
    "subfocos": [
      "Risco Atribuível no Grupo Exposto (RA / Risco Excessivo)",
      "Risco Atribuível Populacional (RAP) e Fração Atribuível Populacional (FAP)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Risco Atribuível no Grupo Exposto (RA / Risco Excessivo)",
        "value": "Uso de Modelos Multivariados para Ajustar o OR por Fatores de Confundimento Múltiplos Concomitantes"
      },
      {
        "letter": "B",
        "label": "Risco Atribuível no Grupo Exposto (RA / Risco Excessivo)",
        "value": "Interpretação do OR Bruto vs Ajustado para Identificação de Variáveis de Confundimento e Modificadores de Efeito"
      },
      {
        "letter": "C",
        "label": "Cálculo da Diferença de Incidências",
        "value": "RA = Ie - Ino"
      },
      {
        "letter": "D",
        "label": "Fração Atribuível no Exposto (FAe = [Ie - Ino] / Ie)",
        "value": "Percentual de Casos Preveníveis entre os Expostos"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-369-medidas-de-impacto-potenc",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Medidas de Impacto Potencial",
    "fullTitle": "Medidas de Impacto Potencial (Medidas de Frequência e Associação Epidemiológica • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Medidas de Impacto Potencial (NNT e NNH)",
    "subfocos": [
      "Redução Absoluta do Risco (RAR) e Cálculo do NNT",
      "Número Necessário para Prejudicar (NNH)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Redução Absoluta do Risco",
        "value": "RAR = Incidência no Grupo Controle (Ic) - Incidência no Grupo Intervenção (It)"
      },
      {
        "letter": "B",
        "label": "Redução Relativa do Risco",
        "value": "RRR = RAR / Ic = 1 - RR"
      },
      {
        "letter": "C",
        "label": "Número Necessário para Tratar",
        "value": "NNT = 1 / RAR (Sempre Arredondar para Cima para o Próximo Número Inteiro)"
      },
      {
        "letter": "D",
        "label": "Redução Absoluta do Risco (RAR) e Cálculo do NNT",
        "value": "Quanto Menor o NNT, Mais Eficaz e Clinicamente Significativa é a Intervenção Terapêutica"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-370-estudo-de-coorte",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Estudo de Coorte",
    "fullTitle": "Estudo de Coorte (Desenhos de Estudos Epidemiológicos • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Estudo de Coorte",
    "subfocos": [
      "Metodologia, Direcionalidade e Tipos de Coorte",
      "Limitações e Vieses Críticos em Estudos de Coorte"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Direcionalidade Causal Canônica",
        "value": "Parte da Exposição para Buscar o Aparecimento do Desfecho (Expostos vs Não Expostos)"
      },
      {
        "letter": "B",
        "label": "Características",
        "value": "Observacional, Longitudinal, Prospectivo (ou Histórico / Retrospectivo se Exposições Passadas Foram Documentadas no Prontuário)"
      },
      {
        "letter": "C",
        "label": "Metodologia, Direcionalidade e Tipos de Coorte",
        "value": "Ideal para Avaliar Exposições Raras, Descrever a História Natural da Doença e Investigar Múltiplos Desfechos Concomitantes a Partir de uma Mesma Exposição"
      },
      {
        "letter": "D",
        "label": "Metodologia, Direcionalidade e Tipos de Coorte",
        "value": "Permite o Cálculo Direto da Incidência e do Risco Relativo"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-371-estudo-de-caso-controle",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Estudo de Caso-Controle",
    "fullTitle": "Estudo de Caso-Controle (Desenhos de Estudos Epidemiológicos • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Estudo de Caso-Controle",
    "subfocos": [
      "Metodologia e Seleção Adequada de Controles",
      "Vieses Típicos do Estudo de Caso-Controle"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Direcionalidade Metodológica",
        "value": "Parte do Desfecho (Casos Doentes vs Controles Sãos) para Investigar Retrospectivamente a História Passada de Exposição"
      },
      {
        "letter": "B",
        "label": "Características",
        "value": "Observacional, Longitudinal Retrospectivo, Rápido, de Baixo Custo Financeiro"
      },
      {
        "letter": "C",
        "label": "Medida de Associação Própria",
        "value": "Odds Ratio (Não Permite o Cálculo Direto de Taxas de Incidência)"
      },
      {
        "letter": "D",
        "label": "Viés de Memória (Recall Bias",
        "value": "Indivíduos com a Doença Tendem a Lembrar de Exposições Passadas com Muito Mais Detalhes do que Controles Sãos)"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-372-estudo-transversal",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Estudo Transversal",
    "fullTitle": "Estudo Transversal (Desenhos de Estudos Epidemiológicos • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Estudo Transversal (Seccional)",
    "subfocos": [
      "Inquéritos Populacionais e Avaliação Simultânea",
      "Limitação Metodológica: Ausência de Temporalidade"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Avaliação Simultânea da Exposição e do Desfecho no Mesmo Exato Momento do Tempo",
        "value": "\"Fotografia Instantânea\""
      },
      {
        "letter": "B",
        "label": "Características",
        "value": "Observacional, Individual, Transversal, Rápido e de Baixo Custo"
      },
      {
        "letter": "C",
        "label": "Inquéritos Populacionais e Avaliação Simultânea",
        "value": "Excelente para Planejamento de Políticas de Saúde, Dimensionamento de Serviços e Formulação Inicial de Hipóteses Etiológicas"
      },
      {
        "letter": "D",
        "label": "Incapacidade Intrínseca de Estabelecer Relação Causal Direta pela Falta de Sequência Temporal",
        "value": "Não Permite Saber se a Exposição Ocorreu Antes do Desfecho ou Vice-Versa / Causalidade Reversa"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-373-ensaio-clinico-randomizad",
    "category": "tratamento",
    "categoryLabel": "Esquemas de 1ª Linha",
    "title": "Ensaio Clínico Randomizado",
    "fullTitle": "Ensaio Clínico Randomizado (Desenhos de Estudos Epidemiológicos • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Ensaio Clínico Randomizado",
    "subfocos": [
      "Metodologia Experimental e Randomização",
      "Análise por Intenção de Tratar e Fases do Ensaio Clínico"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Metodologia Experimental e Randomização",
        "value": "Estudo Experimental, Intervencionista, Longitudinal, Prospectivo e de Alto Nível de Evidência para Avaliação de Tratamentos e Vacinas"
      },
      {
        "letter": "B",
        "label": "Randomização / Alocação Aleatória",
        "value": "Mecanismo que Garante Distribuição Homogênea de Fatores de Confundimento Conhecidos e Desconhecidos entre os Grupos"
      },
      {
        "letter": "C",
        "label": "Mascaramento / Cegamento",
        "value": "Aberto, Simples-Cego, Duplo-Cego, Triplo-Cego"
      },
      {
        "letter": "D",
        "label": "Análise por Intenção de Tratar (ITT",
        "value": "Todos os Pacientes São Analisados no Grupo para o qual Foram Sorteados, Preservando o Benefício da Randomização) vs Análise por Protocolo"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-374-estudo-ecologico",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Estudo Ecológico",
    "fullTitle": "Estudo Ecológico (Desenhos de Estudos Epidemiológicos • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Estudo Ecológico",
    "subfocos": [
      "Estudos com Dados Agregados Espaciais e Temporais",
      "Falácia Ecológica (Viés de Agregação)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Unidade de Observação e Análise",
        "value": "População / Agregado Espacial ou Geográfico (Países, Estados, Cidades, Bairros) e NÃO o Indivíduo"
      },
      {
        "letter": "B",
        "label": "Utiliza Bancos de Dados Secundários Oficiais",
        "value": "SIM, SINASC, IBGE"
      },
      {
        "letter": "C",
        "label": "Estudos com Dados Agregados Espaciais e Temporais",
        "value": "Excelente para Gerar Hipóteses Iniciais com Baixo Custo e Rapidez"
      },
      {
        "letter": "D",
        "label": "Erro Metodológico de Inferir Relações Causais para o Nível Individual a Partir de Correlações Observadas Apenas no Nível Populacional Agregado",
        "value": "A Associação Observada no Grupo Pode Não Ocorrer no Indivíduo"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-375-revisoes-sistematicas-e-m",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Revisões Sistemáticas e Metanálises",
    "fullTitle": "Revisões Sistemáticas e Metanálises (Desenhos de Estudos Epidemiológicos • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Revisões Sistemáticas e Metanálises",
    "subfocos": [
      "Metodologia da Revisão Sistemática e Prisma",
      "Interpretação do Forest Plot e Heterogeneidade (I2)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Busca Abrangente, Sistemática, Reprodutível e com Critérios Transparentes de Inclusão e Exclusão em Múltiplas Bases",
        "value": "PubMed, Embase, Cochrane"
      },
      {
        "letter": "B",
        "label": "Avaliação Crítica do Risco de Viés dos Estudos Incluídos",
        "value": "Ferramenta RoB da Cochrane"
      },
      {
        "letter": "C",
        "label": "Gráfico de Floresta (Forest Plot)",
        "value": "Quadrados Representam a Estimativa Pontual de Cada Estudo com Área Proporcional ao Seu Peso Amostral; Barras Horizontais Representam o IC95%; Losango / Diamante Inferior Representa a Estimativa Combinada Sumarizada"
      },
      {
        "letter": "D",
        "label": "Avaliação da Heterogeneidade pelo I2",
        "value": "< 25% Baixa, 25-50% Moderada, > 50% Alta Heterogeneidade"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-376-validade-interna-vieses",
    "category": "criterios",
    "categoryLabel": "Critérios Diagnósticos",
    "title": "Validade Interna, Vieses",
    "fullTitle": "Validade Interna, Vieses (Desenhos de Estudos Epidemiológicos • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Validade Interna, Vieses (Confundimento, Seleção, Aferição) e Causalidade (Hill)",
    "subfocos": [
      "Vieses Epidemiológicos Clássicos (Seleção, Informação e Confundimento)",
      "Critérios de Causalidade de Sir Austin Bradford Hill"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Viés de Seleção",
        "value": "Viés de Berkson em Hospitais e Viés do Trabalhador Sadio"
      },
      {
        "letter": "B",
        "label": "Fator de Confundimento",
        "value": "Definição (Associado à Exposição, Causa do Desfecho e Não Intermediário) e Controle (Pareamento, Estratificação, Regressão)"
      },
      {
        "letter": "C",
        "label": "Critério Mandatório Essencial",
        "value": "Temporalidade (A Causa Precede o Efeito Obrigatoriamente)"
      },
      {
        "letter": "D",
        "label": "Critérios de Força de Associação, Gradiente Biológico",
        "value": "Dose-Resposta"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-377-sensibilidade-e-especific",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Sensibilidade e Especificidade",
    "fullTitle": "Sensibilidade e Especificidade (Acurácia de Testes Diagnósticos e Rastreamento • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Sensibilidade e Especificidade",
    "subfocos": [
      "Propriedades Intrínsecas do Teste Diagnóstico",
      "Testes em Série vs Testes em Paralelo"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Sensibilidade",
        "value": "Proporção de Indivíduos Doentes que Testam Positivo [VP / (VP + FN)]; Teste com Alta Sensibilidade Apresenta Poucos Falsos-Negativos (Ideal para Rastreamento / Triagem - Regra SnNOut)"
      },
      {
        "letter": "B",
        "label": "Especificidade",
        "value": "Proporção de Indivíduos Sãos que Testam Negativo [VN / (VN + FP)]; Teste com Alta Especificidade Apresenta Poucos Falsos-Positivos (Ideal para Confirmação Diagnóstica - Regra SpPIn)"
      },
      {
        "letter": "C",
        "label": "Independência Absoluta da Prevalência",
        "value": "A Sensibilidade e a Especificidade São Propriedades Intrínsecas do Teste e NÃO se Modificam Conforme a Prevalência da População"
      },
      {
        "letter": "D",
        "label": "Testes em Série (Realizados Sequencialmente Apenas se o Anterior For Positivo)",
        "value": "Aumenta a Especificidade Global e o Valor Preditivo Positivo (Reduz Falsos-Positivos)"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas.",
    "imageUrl": "/images/medical/curva_roc_grafico.webp",
    "imageCaption": "Gráfico de Curva ROC: relação de sensibilidade versus (1 - especificidade) para determinação do ponto de corte ótimo e acurácia diagnóstica (AUC).",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Autor desconhecido",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:A_sample_of_Receiver_Operating_Characteristic.jpg"
  },
  {
    "id": "tip-medi-378-valores-preditivos",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Valores Preditivos",
    "fullTitle": "Valores Preditivos (Acurácia de Testes Diagnósticos e Rastreamento • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Valores Preditivos (Positivo e Negativo) e Efeito da Prevalência",
    "subfocos": [
      "Cálculo de VPP e VPN e a Influência da Prevalência",
      "Acurácia Global do Teste Diagnóstico"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Valor Preditivo Positivo (VPP)",
        "value": "Probabilidade de Ter a Doença quando o Teste For Positivo [VP / (VP + FP)]"
      },
      {
        "letter": "B",
        "label": "Valor Preditivo Negativo (VPN)",
        "value": "Probabilidade de Não Ter a Doença quando o Teste For Negativo [VN / (VN + FN)]"
      },
      {
        "letter": "C",
        "label": "Regra de Ouro da Dependência da Prevalência",
        "value": "Quanto Maior a Prevalência da Doença na População, MAIOR o VPP e MENOR o VPN; Quanto Menor a Prevalência, MENOR o VPP e MAIOR o VPN"
      },
      {
        "letter": "D",
        "label": "Acurácia",
        "value": "Proporção Total de Acertos do Teste entre Doentes e Sãos [(VP + VN) / Total de Testados]"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas.",
    "imageUrl": "/images/medical/curva_roc_grafico.webp",
    "imageCaption": "Gráfico de Curva ROC: relação de sensibilidade versus (1 - especificidade) para determinação do ponto de corte ótimo e acurácia diagnóstica (AUC).",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Autor desconhecido",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:A_sample_of_Receiver_Operating_Characteristic.jpg"
  },
  {
    "id": "tip-medi-379-razoes-de-verossimilhanca",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Razões de Verossimilhança",
    "fullTitle": "Razões de Verossimilhança (Acurácia de Testes Diagnósticos e Rastreamento • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Razões de Verossimilhança (Likelihood Ratios)",
    "subfocos": [
      "Cálculo e Significado Clínico da RV+ e RV-",
      "Nomograma de Fagan e Teorema de Bayes"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Razão de Verossimilhança Positiva (RV+)",
        "value": "Sensibilidade / (1 - Especificidade); Indica Quanto Mais Provável é um Teste Positivo em Doentes do que em Sãos (Valores > 10 Geram Grande Mudança Diagnóstica)"
      },
      {
        "letter": "B",
        "label": "Razão de Verossimilhança Negativa (RV-)",
        "value": "(1 - Sensibilidade) / Especificidade (Valores < 0,1 Quase Excluem a Doença)"
      },
      {
        "letter": "C",
        "label": "Cálculo e Significado Clínico da RV+ e RV-",
        "value": "Independência da Prevalência"
      },
      {
        "letter": "D",
        "label": "Aplicação Prática no Nomograma de Fagan",
        "value": "Conversão da Probabilidade Pré-Teste na Probabilidade Pós-Teste Utilizando a Razão de Verossimilhança"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas.",
    "imageUrl": "/images/medical/curva_roc_grafico.webp",
    "imageCaption": "Gráfico de Curva ROC: relação de sensibilidade versus (1 - especificidade) para determinação do ponto de corte ótimo e acurácia diagnóstica (AUC).",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Autor desconhecido",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:A_sample_of_Receiver_Operating_Characteristic.jpg"
  },
  {
    "id": "tip-medi-380-curva-roc-e-ponto-de-cort",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Curva ROC e Ponto de Corte",
    "fullTitle": "Curva ROC e Ponto de Corte (Acurácia de Testes Diagnósticos e Rastreamento • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Curva ROC e Ponto de Corte",
    "subfocos": [
      "Construção da Curva ROC e Área sob a Curva (AUC)",
      "Escolha do Ponto de Corte Ideal"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": true,
    "chips": [
      {
        "letter": "A",
        "label": "Eixos Gráficos",
        "value": "Eixo Y (Sensibilidade / Taxa de Verdadeiros-Positivos) vs Eixo X (1 - Especificidade / Taxa de Falsos- Positivos)"
      },
      {
        "letter": "B",
        "label": "Área sob a Curva (AUC)",
        "value": "Medida Global de Acurácia Diagnóstica (AUC = 0,5 Indica Teste Nulo / Semelhante à Moeda ao Ar; AUC = 1,0 Indica Teste Perfeito sem Erros; AUC >= 0,8 Indica Bom Poder Discriminatório)"
      },
      {
        "letter": "C",
        "label": "Trade-off Inevitável",
        "value": "Deslocar o Ponto de Corte para Aumentar a Sensibilidade Inevitavelmente Reduz a Especificidade e Aumenta os Falsos-Positivos"
      },
      {
        "letter": "D",
        "label": "Escolha do Ponto de Corte Ideal",
        "value": "Critério de Youden para o Ponto de Equilíbrio Ótimo"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas.",
    "imageUrl": "/images/medical/curva_roc_grafico.webp",
    "imageCaption": "Gráfico de Curva ROC: relação de sensibilidade versus (1 - especificidade) para determinação do ponto de corte ótimo e acurácia diagnóstica (AUC).",
    "imageModality": "esquema",
    "imageSource": "Wikimedia Commons",
    "imageAuthor": "Autor desconhecido",
    "imageLicense": "Public domain",
    "imageOriginUrl": "https://commons.wikimedia.org/wiki/File:A_sample_of_Receiver_Operating_Characteristic.jpg"
  },
  {
    "id": "tip-medi-381-principios-de-rastreament",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Prevenção",
    "title": "Princípios de Rastreamento e Critérios de Frame & Carlson",
    "fullTitle": "Princípios de Rastreamento e Critérios de Frame & Carlson (Acurácia de Testes Diagnósticos e Rastreamento • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Princípios de Rastreamento e Critérios de Frame & Carlson",
    "subfocos": [
      "Critérios Clássicos de Rastreamento Populacional (Wilson & Jungner)",
      "Vieses em Rastreamento e Danos do Sobrediagnóstico (Overdiagnosis)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Critérios Clássicos de Rastreamento Populacional (Wilson & Jungner)",
        "value": "Condição de Importância em Saúde Pública, História Natural Conhecida e Fase Latente/Pré-Clínica Detectável"
      },
      {
        "letter": "B",
        "label": "Critérios Clássicos de Rastreamento Populacional (Wilson & Jungner)",
        "value": "Disponibilidade de Teste Aceitável, Seguro, Custo-Efetivo e com Tratamento Eficaz na Fase Inicial"
      },
      {
        "letter": "C",
        "label": "Viés de Tempo de Antecipação",
        "value": "Lead-Time Bias) e Viés de Duração da Doença (Length-Time Bias"
      },
      {
        "letter": "D",
        "label": "Conceito de Sobrediagnóstico",
        "value": "Diagnóstico de Doença que Jamais Causaria Sintomas ou Morte"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-382-lista-nacional-de-notific",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Lista Nacional de Notificação Compulsória",
    "fullTitle": "Lista Nacional de Notificação Compulsória (Vigilância em Saúde e Notificação Compulsória • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Vigilância em Saúde e Notificação Compulsória",
    "foco": "Lista Nacional de Notificação Compulsória (Portaria de Notificação e Prazos)",
    "subfocos": [
      "Notificação Imediata (em até 24 Horas)",
      "Notificação Semanal e Regras Gerais de Notificação"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Doenças de Notificação Imediata Obrigatória Simultânea ao MS, SES e SMS",
        "value": "Botulismo, Cólera, Febre Amarela, Peste, Raiva Humana, Sarampo, Varíola, Doença Meningocócica, Hantavirose, Síndrome Respiratória Aguda Grave por Vírus Novo, Evento Adverso Grave Pós-Vacinação"
      },
      {
        "letter": "B",
        "label": "Notificação Imediata Apenas ao Município e Estado",
        "value": "Acidente por Animal Peçonhento, Violência Sexual, Tentativa de Suicídio"
      },
      {
        "letter": "C",
        "label": "Doenças de Notificação Semanal no SINAN",
        "value": "Tuberculose, Hanseníase, Leishmaniose, Dengue sem Sinais de Alarme, Sífilis, Hepatites Virais, HIV/Aids"
      },
      {
        "letter": "D",
        "label": "Dever Legal e Universal de Notificação de Todo Profissional de Saúde",
        "value": "Mesmo Diante de MERA SUSPEITA CLÍNICA, sem Necessidade de Confirmação Laboratorial"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-383-investigacao-de-surtos-e",
    "category": "antidotos",
    "categoryLabel": "Toxicologia & Antídotos",
    "title": "Investigação de Surtos e Epidemias",
    "fullTitle": "Investigação de Surtos e Epidemias (Vigilância em Saúde e Notificação Compulsória • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Vigilância em Saúde e Notificação Compulsória",
    "foco": "Investigação de Surtos e Epidemias",
    "subfocos": [
      "Etapas Metodológicas de Investigação de Surto",
      "Curvas Epidêmicas (Fonte Pontual vs Propagada)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Passo 1",
        "value": "Confirmação da Existência Real da Epidemia / Surto (Número de Casos Observados Acima do Limite Superior do Diagrama de Controle Endêmico)"
      },
      {
        "letter": "B",
        "label": "Passo 2",
        "value": "Confirmação do Diagnóstico Clínico-Laboratorial e Definição Padronizada de Caso"
      },
      {
        "letter": "C",
        "label": "Passo 3",
        "value": "Caracterização Epidemiológica por Tempo, Lugar e Pessoa"
      },
      {
        "letter": "D",
        "label": "Epidemia de Fonte Comum / Pontual (Ex.",
        "value": "Intoxicação Alimentar em Festa): Pico Único Abrupto com Queda Rápida, Casos Concentrados em Período Menor que um Tempo de Incubação"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-384-vigilancia-epidemiologica",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Vigilância Epidemiológica de Doenças Transmissíveis",
    "fullTitle": "Vigilância Epidemiológica de Doenças Transmissíveis (Vigilância em Saúde e Notificação Compulsória • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Vigilância em Saúde e Notificação Compulsória",
    "foco": "Vigilância Epidemiológica de Doenças Transmissíveis",
    "subfocos": [
      "Lista Nacional de Notificação Compulsória e Prazos",
      "Investigação de Surtos e Epidemias em Saúde Pública"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Notificação Imediata (em até 24h para Município, Estado e MS)",
        "value": "Cólera, Febre Amarela, Peste, Raiva, Sarampo, Botulismo"
      },
      {
        "letter": "B",
        "label": "Notificação Semanal",
        "value": "Tuberculose, Hanseníase, Tétano Acidental, Hepatites Virais e Toxoplasmose Gestacional"
      },
      {
        "letter": "C",
        "label": "Definição Operacional de Caso",
        "value": "Suspeito, Provável e Confirmado) e Construção da Curva Epidêmica (Fonte Pontual vs Propagada"
      },
      {
        "letter": "D",
        "label": "Cálculo da Taxa de Ataque",
        "value": "Incidência em População Definida Durante Surto"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  },
  {
    "id": "tip-medi-385-vigilancia-sanitaria-e-vi",
    "category": "decorebas",
    "categoryLabel": "Pontos de Corte & Doses",
    "title": "Vigilância Sanitária e Vigilância Ambiental",
    "fullTitle": "Vigilância Sanitária e Vigilância Ambiental (Vigilância em Saúde e Notificação Compulsória • Medicina Preventiva e Social)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Vigilância em Saúde e Notificação Compulsória",
    "foco": "Vigilância Sanitária e Vigilância Ambiental",
    "subfocos": [
      "Atuação e Competências da Vigilância Sanitária (VISA / ANVISA)",
      "Vigilância em Saúde Ambiental (VIGIAMBIENTE)"
    ],
    "provenanceDefault": "Leis Orgânicas da Saúde 8.080/90 e 8.142/90 / PNAB / Ministério da Saúde",
    "requiresImage": false,
    "chips": [
      {
        "letter": "A",
        "label": "Atuação e Competências da Vigilância Sanitária (VISA / ANVISA)",
        "value": "Poder de Polícia Administrativa e Fiscalização de Bens de Consumo, Alimentos, Medicamentos e Serviços de Saúde"
      },
      {
        "letter": "B",
        "label": "Farmacovigilância, Tecnovigilância e Investigação de Eventos Adversos e Queixas Técnicas",
        "value": "NOTIVISA"
      },
      {
        "letter": "C",
        "label": "Vigilância da Qualidade da Água para Consumo Humano (VIGIAGUA",
        "value": "Parâmetros Físico-Químicos e Bacteriológicos)"
      },
      {
        "letter": "D",
        "label": "Vigilância de Populações Expostas a Agrotóxicos",
        "value": "VIGIPEQ) e Desastres Naturais/Antrópicos (VIGIDESASTRES"
      }
    ],
    "rule": "Leis 8.080/90 e 8.142/90: Os princípios doutrinários do SUS são Universalidade, Integralidade e Equidade; a participação da comunidade é garantida por meio dos Conselhos (deliberativos permanentes) e Conferências de Saúde (quadrienais).",
    "bancaTrap": "Em testes diagnósticos populacionais, o aumento da prevalência da doença eleva o Valor Preditivo Positivo (VPP) e reduz o Valor Preditivo Negativo (VPN), mantendo Sensibilidade e Especificidade intrinsecamente inalteradas."
  }
];
