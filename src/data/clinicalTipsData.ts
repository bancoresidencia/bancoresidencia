export type ClinicalTipCategory =
  | 'criterios'
  | 'decorebas'
  | 'mnemonicos'
  | 'semiologia'
  | 'triades'
  | 'antidotos'
  | 'tratamento'
  | 'rastreamento'
  | 'transfusao'
  | 'radiologia';

export interface ClinicalTipItem {
  id: string;
  category: ClinicalTipCategory;
  categoryLabel: string;
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
    "id": "tip-clin-sindromes-coronarianas-isquemicas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndromes Coronarianas Isquêmicas",
    "fullTitle": "Síndromes Coronarianas Isquêmicas (Cardiologia)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Síndromes Coronarianas Isquêmicas (Aguda e Crônica)",
    "subfocos": [
      "IAM com Supradesnivelamento do Segmento ST (IAMCSST)",
      "Síndrome Coronariana Aguda sem Supra de ST (SCASST) e Angina Instável",
      "Doença Arterial Coronariana Crônica e Angina Estável"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "IAM com Supradesnivelamento do Segmento ST",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndromes Coronarianas Isquêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome Coronariana Aguda sem Supra de ST",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndromes Coronarianas Isquêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Doença Arterial Coronariana Crônica e Angina Estável",
        "letter": "3",
        "value": "Conceito de alta relevância em Síndromes Coronarianas Isquêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndromes Coronarianas Isquêmicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndromes Coronarianas Isquêmicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-insuficiencia-cardiaca-e-cardiomiop",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Insuficiência Cardíaca e Cardiomiopati",
    "fullTitle": "Insuficiência Cardíaca e Cardiomiopatias (Cardiologia)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Insuficiência Cardíaca e Cardiomiopatias",
    "subfocos": [
      "Insuficiência Cardíaca com Fração de Ejeção Reduzida (ICFER)",
      "Insuficiência Cardíaca Agudamente Descompensada",
      "Cardiomiopatia Hipertrófica e Cardiomiopatia Chagásica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Insuficiência Cardíaca com Fração de Ejeção Reduzida",
        "letter": "1",
        "value": "Conceito de alta relevância em Insuficiência Cardíaca e Cardiomiopatias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Insuficiência Cardíaca Agudamente Descompensada",
        "letter": "2",
        "value": "Conceito de alta relevância em Insuficiência Cardíaca e Cardiomiopatias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cardiomiopatia Hipertrófica e Cardiomiopatia Chagásica",
        "letter": "3",
        "value": "Conceito de alta relevância em Insuficiência Cardíaca e Cardiomiopatias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Insuficiência Cardíaca e Cardiomiopatias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Insuficiência Cardíaca e Cardiomiopatias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-taquiarritmias-e-bradiarritmias",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Taquiarritmias e Bradiarritmias",
    "fullTitle": "Taquiarritmias e Bradiarritmias (Cardiologia)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Taquiarritmias e Bradiarritmias",
    "subfocos": [
      "Fibrilação Atrial e Flutter Atrial",
      "Taquicardias Supraventriculares Paroxísticas",
      "Bradiarritmias e Bloqueios Atrioventriculares"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Fibrilação Atrial e Flutter Atrial",
        "letter": "1",
        "value": "Conceito de alta relevância em Taquiarritmias e Bradiarritmias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Taquicardias Supraventriculares Paroxísticas",
        "letter": "2",
        "value": "Conceito de alta relevância em Taquiarritmias e Bradiarritmias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Bradiarritmias e Bloqueios Atrioventriculares",
        "letter": "3",
        "value": "Conceito de alta relevância em Taquiarritmias e Bradiarritmias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Taquiarritmias e Bradiarritmias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Taquiarritmias e Bradiarritmias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-valvares-cardiacas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Valvares Cardíacas",
    "fullTitle": "Doenças Valvares Cardíacas (Cardiologia)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Doenças Valvares Cardíacas",
    "subfocos": [
      "Estenose Aórtica",
      "Insuficiência Mitral e Estenose Mitral"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Estenose Aórtica",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Valvares Cardíacas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Insuficiência Mitral e Estenose Mitral",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Valvares Cardíacas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Valvares Cardíacas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Valvares Cardíacas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-hipertensao-arterial-sistemica-e-cr",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hipertensão Arterial Sistêmica e Crise",
    "fullTitle": "Hipertensão Arterial Sistêmica e Crise Hipertensiva (Cardiologia)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Hipertensão Arterial Sistêmica e Crise Hipertensiva",
    "subfocos": [
      "Diagnóstico e Manejo Ambulatorial da Hipertensão",
      "Crise Hipertensiva (Urgência vs Emergência Hipertensiva)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Diagnóstico e Manejo Ambulatorial da Hipertensão",
        "letter": "1",
        "value": "Conceito de alta relevância em Hipertensão Arterial Sistêmica e Crise Hipertensiva: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Crise Hipertensiva",
        "letter": "2",
        "value": "Conceito de alta relevância em Hipertensão Arterial Sistêmica e Crise Hipertensiva: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hipertensão Arterial Sistêmica e Crise Hipertensiva: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hipertensão Arterial Sistêmica e Crise Hipertensiva: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-do-pericardio-e-endocardite",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças do Pericárdio e Endocardite In",
    "fullTitle": "Doenças do Pericárdio e Endocardite Infecciosa (Cardiologia)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Doenças do Pericárdio e Endocardite Infecciosa",
    "subfocos": [
      "Pericardite Aguda e Tamponamento Cardíaco",
      "Endocardite Infecciosa"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Pericardite Aguda e Tamponamento Cardíaco",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças do Pericárdio e Endocardite Infecciosa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Endocardite Infecciosa",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças do Pericárdio e Endocardite Infecciosa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças do Pericárdio e Endocardite Infecciosa: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças do Pericárdio e Endocardite Infecciosa: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-parada-cardiorrespiratoria-e-ressus",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Parada Cardiorrespiratória e Ressuscit",
    "fullTitle": "Parada Cardiorrespiratória e Ressuscitação (Cardiologia)",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Parada Cardiorrespiratória e Ressuscitação (ACLS)",
    "subfocos": [
      "Ritmos Chocáveis e Não Chocáveis",
      "Cuidados Pós-Parada Cardiorrespiratória"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Ritmos Chocáveis e Não Chocáveis",
        "letter": "1",
        "value": "Conceito de alta relevância em Parada Cardiorrespiratória e Ressuscitação: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cuidados Pós-Parada Cardiorrespiratória",
        "letter": "2",
        "value": "Conceito de alta relevância em Parada Cardiorrespiratória e Ressuscitação: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Parada Cardiorrespiratória e Ressuscitação: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Parada Cardiorrespiratória e Ressuscitação: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-obstrutivas-das-vias-aereas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Obstrutivas das Vias Aéreas",
    "fullTitle": "Doenças Obstrutivas das Vias Aéreas (Pneumologia)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Obstrutivas das Vias Aéreas (Asma e DPOC)",
    "subfocos": [
      "Asma Brônquica no Adulto",
      "Doença Pulmonar Obstrutiva Crônica (DPOC)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Asma Brônquica no Adulto",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Obstrutivas das Vias Aéreas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Doença Pulmonar Obstrutiva Crônica",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Obstrutivas das Vias Aéreas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Obstrutivas das Vias Aéreas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Obstrutivas das Vias Aéreas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-infeccoes-respiratorias-baixas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecções Respiratórias Baixas",
    "fullTitle": "Infecções Respiratórias Baixas (Pneumologia)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Infecções Respiratórias Baixas (Pneumonias e Abscessos)",
    "subfocos": [
      "Pneumonia Adquirida na Comunidade (PAC) no Adulto",
      "Abscesso Pulmonar e Pneumonia Aspirativa"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Pneumonia Adquirida na Comunidade",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecções Respiratórias Baixas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Abscesso Pulmonar e Pneumonia Aspirativa",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecções Respiratórias Baixas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecções Respiratórias Baixas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecções Respiratórias Baixas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-vasculares-pulmonares",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Vasculares Pulmonares",
    "fullTitle": "Doenças Vasculares Pulmonares (Pneumologia)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Vasculares Pulmonares (TEP e Hipertensão Pulmonar)",
    "subfocos": [
      "Tromboembolismo Pulmonar (TEP)",
      "Hipertensão Pulmonar"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Tromboembolismo Pulmonar",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Vasculares Pulmonares: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hipertensão Pulmonar",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Vasculares Pulmonares: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Vasculares Pulmonares: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Vasculares Pulmonares: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-pleurais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Pleurais",
    "fullTitle": "Doenças Pleurais (Pneumologia)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Pleurais (Derrames e Pneumotórax)",
    "subfocos": [
      "Derrame Pleural e Critérios de Light",
      "Pneumotórax Espontâneo no Adulto"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Derrame Pleural e Critérios de Light",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Pleurais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Pneumotórax Espontâneo no Adulto",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Pleurais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Pleurais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Pleurais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-pulmonares-intersticiais-e-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Pulmonares Intersticiais e Fib",
    "fullTitle": "Doenças Pulmonares Intersticiais e Fibrose (Pneumologia)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Pulmonares Intersticiais e Fibrose",
    "subfocos": [
      "Fibrose Pulmonar Idiopática (FPI) e Padrão TCAR de PIU",
      "Sarcoidose e Pneumonite por Hipersensibilidade (PH)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Fibrose Pulmonar Idiopática",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Pulmonares Intersticiais e Fibrose: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Sarcoidose e Pneumonite por Hipersensibilidade",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Pulmonares Intersticiais e Fibrose: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Pulmonares Intersticiais e Fibrose: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Pulmonares Intersticiais e Fibrose: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-tuberculose-pulmonar-e-micobacterio",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Tuberculose Pulmonar e Micobacterioses",
    "fullTitle": "Tuberculose Pulmonar e Micobacterioses (Pneumologia)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Tuberculose Pulmonar e Micobacterioses",
    "subfocos": [
      "Diagnóstico e Manejo Clínico da Tuberculose Ativa",
      "Infecção Latente pelo Mycobacterium tuberculosis (ILTB)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Diagnóstico e Manejo Clínico da Tuberculose Ativa",
        "letter": "1",
        "value": "Conceito de alta relevância em Tuberculose Pulmonar e Micobacterioses: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Infecção Latente pelo Mycobacterium tuberculosis",
        "letter": "2",
        "value": "Conceito de alta relevância em Tuberculose Pulmonar e Micobacterioses: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Tuberculose Pulmonar e Micobacterioses: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Tuberculose Pulmonar e Micobacterioses: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-neoplasias-pulmonares-e-nodulo-pulm",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Neoplasias Pulmonares e Nódulo Pulmona",
    "fullTitle": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário (Pneumologia)",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário",
    "subfocos": [
      "Nódulo Pulmonar Solitário (NPS): Critérios de Fleischner e Malignidade",
      "Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Nódulo Pulmonar Solitário",
        "letter": "1",
        "value": "Conceito de alta relevância em Neoplasias Pulmonares e Nódulo Pulmonar Solitário: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo",
        "letter": "2",
        "value": "Conceito de alta relevância em Neoplasias Pulmonares e Nódulo Pulmonar Solitário: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Neoplasias Pulmonares e Nódulo Pulmonar Solitário: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Neoplasias Pulmonares e Nódulo Pulmonar Solitário: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-esofagicas-e-gastroduodenai",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Esofágicas e Gastroduodenais",
    "fullTitle": "Doenças Esofágicas e Gastroduodenais (Gastroenterologia)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças Esofágicas e Gastroduodenais (DRGE, Úlcera e Gastrite)",
    "subfocos": [
      "Doença do Refluxo Gastroesofágico (DRGE) e Esôfago de Barrett",
      "Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Doença do Refluxo Gastroesofágico",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Esofágicas e Gastroduodenais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Esofágicas e Gastroduodenais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Esofágicas e Gastroduodenais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Esofágicas e Gastroduodenais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-hemorragia-digestiva",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hemorragia Digestiva",
    "fullTitle": "Hemorragia Digestiva (Gastroenterologia)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Hemorragia Digestiva (Alta e Baixa)",
    "subfocos": [
      "Hemorragia Digestiva Alta (HDA) Não-Varicosa vs Varicosa",
      "Hemorragia Digestiva Baixa (HDB): Divertículos, Angiodisplasia e Conduta"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Hemorragia Digestiva Alta",
        "letter": "1",
        "value": "Conceito de alta relevância em Hemorragia Digestiva: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hemorragia Digestiva Baixa",
        "letter": "2",
        "value": "Conceito de alta relevância em Hemorragia Digestiva: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hemorragia Digestiva: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hemorragia Digestiva: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-hepatites-agudas-e-cronicas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hepatites Agudas e Crônicas",
    "fullTitle": "Hepatites Agudas e Crônicas (Gastroenterologia)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Hepatites Agudas e Crônicas (Virais, Tóxicas e Autoimunes)",
    "subfocos": [
      "Hepatite B e C: Interpretação Sorológica e Terapia Antiviral",
      "Hepatite Autoimune e Doença Hepática Alcoólica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Hepatite B e C: Interpretação Sorológica e Terapia Antiviral",
        "letter": "1",
        "value": "Conceito de alta relevância em Hepatites Agudas e Crônicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hepatite Autoimune e Doença Hepática Alcoólica",
        "letter": "2",
        "value": "Conceito de alta relevância em Hepatites Agudas e Crônicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hepatites Agudas e Crônicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hepatites Agudas e Crônicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-cirrose-hepatica-e-hipertensao-port",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cirrose Hepática e Hipertensão Portal",
    "fullTitle": "Cirrose Hepática e Hipertensão Portal (Gastroenterologia)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Cirrose Hepática e Hipertensão Portal",
    "subfocos": [
      "Estratificação Prognóstica (Child-Pugh e MELD) e Síndrome de Hipertensão Portal",
      "Manejo da Ascite, Peritonite Bacteriana Espontânea (PBE) e Encefalopatia Hepática"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Estratificação Prognóstica",
        "letter": "1",
        "value": "Conceito de alta relevância em Cirrose Hepática e Hipertensão Portal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo da Ascite, Peritonite Bacteriana Espontânea",
        "letter": "2",
        "value": "Conceito de alta relevância em Cirrose Hepática e Hipertensão Portal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cirrose Hepática e Hipertensão Portal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cirrose Hepática e Hipertensão Portal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-da-vesicula-vias-biliares-e",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças da Vesícula, Vias Biliares e P",
    "fullTitle": "Doenças da Vesícula, Vias Biliares e Pancreatite (Gastroenterologia)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças da Vesícula, Vias Biliares e Pancreatite",
    "subfocos": [
      "Pancreatite Aguda no Adulto: Diagnóstico Clínico e Escores Prognósticos",
      "Pancreatite Crônica, Doenças Colestáticas (Cirrose Biliar Primária e CEP)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Pancreatite Aguda no Adulto: Diagnóstico Clínico e Escores Prognósticos",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças da Vesícula, Vias Biliares e Pancreatite: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Pancreatite Crônica, Doenças Colestáticas",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças da Vesícula, Vias Biliares e Pancreatite: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças da Vesícula, Vias Biliares e Pancreatite: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças da Vesícula, Vias Biliares e Pancreatite: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-inflamatorias-intestinais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Inflamatórias Intestinais",
    "fullTitle": "Doenças Inflamatórias Intestinais (Gastroenterologia)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças Inflamatórias Intestinais (Crohn e RCU)",
    "subfocos": [
      "Diagnóstico Diferencial Clínico e Endoscópico: Doença de Crohn vs Retocolite Ulcerativa",
      "Terapia de Indução e Manutenção (Biológicos) e Megacólon Tóxico"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Diagnóstico Diferencial Clínico e Endoscópico: Doença de Crohn vs Retocolite Ulcerativa",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Inflamatórias Intestinais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Terapia de Indução e Manutenção",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Inflamatórias Intestinais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Inflamatórias Intestinais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Inflamatórias Intestinais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-sindromes-malabsortivas-e-transtorn",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndromes Malabsortivas e Transtornos ",
    "fullTitle": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais (Gastroenterologia)",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais",
    "subfocos": [
      "Doença Celíaca: Fisiopatologia, Sorologia e Biópsia Duodenal",
      "Síndrome do Intestino Irritável (Critérios de Roma IV) e Supercrescimento Bacteriano (SIBO)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Doença Celíaca: Fisiopatologia, Sorologia e Biópsia Duodenal",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndromes Malabsortivas e Transtornos Funcionais Intestinais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome do Intestino Irritável",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndromes Malabsortivas e Transtornos Funcionais Intestinais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndromes Malabsortivas e Transtornos Funcionais Intestinais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndromes Malabsortivas e Transtornos Funcionais Intestinais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-injuria-renal-aguda",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Injúria Renal Aguda",
    "fullTitle": "Injúria Renal Aguda (Nefrologia)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Injúria Renal Aguda (LRA)",
    "subfocos": [
      "Classificação KDIGO e Fisiopatologia da LRA",
      "Indicações de Diálise de Urgência"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Classificação KDIGO e Fisiopatologia da LRA",
        "letter": "1",
        "value": "Conceito de alta relevância em Injúria Renal Aguda: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Indicações de Diálise de Urgência",
        "letter": "2",
        "value": "Conceito de alta relevância em Injúria Renal Aguda: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Injúria Renal Aguda: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Injúria Renal Aguda: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doenca-renal-cronica-e-manejo-conse",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Doença Renal Crônica  e Manejo Conserv",
    "fullTitle": "Doença Renal Crônica  e Manejo Conservador/Dialítico (Nefrologia)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Doença Renal Crônica (DRC) e Manejo Conservador/Dialítico",
    "subfocos": [
      "Estadiamento da DRC (KDIGO por TFG e Albuminúria) e Medidas Nefroprotetoras",
      "Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo (DMO-DRC)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Estadiamento da DRC",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Renal Crônica  e Manejo Conservador/Dialítico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Renal Crônica  e Manejo Conservador/Dialítico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Renal Crônica  e Manejo Conservador/Dialítico: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Renal Crônica  e Manejo Conservador/Dialítico: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-disturbios-hidroeletroliticos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Distúrbios Hidroeletrolíticos",
    "fullTitle": "Distúrbios Hidroeletrolíticos (Nefrologia)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Distúrbios Hidroeletrolíticos (Sódio, Potássio, Cálcio, Magnésio)",
    "subfocos": [
      "Hiponatremia e Hipernatremia",
      "Distúrbios do Potássio (Hipercalemia e Hipocalemia)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Hiponatremia e Hipernatremia",
        "letter": "1",
        "value": "Conceito de alta relevância em Distúrbios Hidroeletrolíticos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Distúrbios do Potássio",
        "letter": "2",
        "value": "Conceito de alta relevância em Distúrbios Hidroeletrolíticos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Distúrbios Hidroeletrolíticos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Distúrbios Hidroeletrolíticos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-disturbios-do-equilibrio-acido-base",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Distúrbios do Equilíbrio Ácido-Base",
    "fullTitle": "Distúrbios do Equilíbrio Ácido-Base (Nefrologia)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Distúrbios do Equilíbrio Ácido-Base",
    "subfocos": [
      "Acidose Metabólica com Ânion Gap Elevado vs Normal (Hiperclorêmica)",
      "Alcalose Metabólica e Distúrbios Respiratórios (Acidose e Alcalose)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Acidose Metabólica com Ânion Gap Elevado vs Normal",
        "letter": "1",
        "value": "Conceito de alta relevância em Distúrbios do Equilíbrio Ácido-Base: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Alcalose Metabólica e Distúrbios Respiratórios",
        "letter": "2",
        "value": "Conceito de alta relevância em Distúrbios do Equilíbrio Ácido-Base: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Distúrbios do Equilíbrio Ácido-Base: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Distúrbios do Equilíbrio Ácido-Base: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-sindromes-glomerulares",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndromes Glomerulares",
    "fullTitle": "Síndromes Glomerulares (Nefrologia)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Síndromes Glomerulares (Nefrítica, Nefrótica, GNRP)",
    "subfocos": [
      "Síndrome Nefrótica: Fisiopatologia, Complicações e Padrões Histológicos",
      "Síndrome Nefrítica, GNRP e Glomerulonefrite Difusa Aguda (GNDA)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Síndrome Nefrótica: Fisiopatologia, Complicações e Padrões Histológicos",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndromes Glomerulares: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome Nefrítica, GNRP e Glomerulonefrite Difusa Aguda",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndromes Glomerulares: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndromes Glomerulares: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndromes Glomerulares: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-tubulointersticiais-e-micro",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Tubulointersticiais e Microang",
    "fullTitle": "Doenças Tubulointersticiais e Microangiopatias Trombóticas (Nefrologia)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Doenças Tubulointersticiais e Microangiopatias Trombóticas",
    "subfocos": [
      "Nefrite Intersticial Aguda (NIA) e Necrose Tubular Aguda (NTA)",
      "Microangiopatia Trombótica: Púrpura Trombocitopênica Trombótica (PTT) e SHU"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Nefrite Intersticial Aguda",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Tubulointersticiais e Microangiopatias Trombóticas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Microangiopatia Trombótica: Púrpura Trombocitopênica Trombótica",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Tubulointersticiais e Microangiopatias Trombóticas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Tubulointersticiais e Microangiopatias Trombóticas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Tubulointersticiais e Microangiopatias Trombóticas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-litiase-renal-e-infeccoes-urinarias",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Litíase Renal e Infecções Urinárias no",
    "fullTitle": "Litíase Renal e Infecções Urinárias no Adulto (Nefrologia)",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Litíase Renal e Infecções Urinárias no Adulto",
    "subfocos": [
      "Investigação Metabólica da Nefrolitíase Recorrente",
      "Cistite, Pielonefrite Aguda e ITU Complicada no Adulto"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Investigação Metabólica da Nefrolitíase Recorrente",
        "letter": "1",
        "value": "Conceito de alta relevância em Litíase Renal e Infecções Urinárias no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cistite, Pielonefrite Aguda e ITU Complicada no Adulto",
        "letter": "2",
        "value": "Conceito de alta relevância em Litíase Renal e Infecções Urinárias no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Litíase Renal e Infecções Urinárias no Adulto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Litíase Renal e Infecções Urinárias no Adulto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-diabetes-mellitus-e-complicacoes-ag",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Diabetes Mellitus e Complicações Aguda",
    "fullTitle": "Diabetes Mellitus e Complicações Agudas (Endocrinologia)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Diabetes Mellitus e Complicações Agudas (CAD e EHH)",
    "subfocos": [
      "Diagnóstico e Metas Glicêmicas no Diabetes Tipo 2",
      "Cetoacidose Diabética (CAD) e Estado Hiperglicêmico Hiperosmolar (EHH)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Endocrinologia",
    "chips": [
      {
        "label": "Diagnóstico e Metas Glicêmicas no Diabetes Tipo 2",
        "letter": "1",
        "value": "Conceito de alta relevância em Diabetes Mellitus e Complicações Agudas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cetoacidose Diabética",
        "letter": "2",
        "value": "Conceito de alta relevância em Diabetes Mellitus e Complicações Agudas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Diabetes Mellitus e Complicações Agudas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Diabetes Mellitus e Complicações Agudas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-complicacoes-cronicas-do-diabetes",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Complicações Crônicas do Diabetes",
    "fullTitle": "Complicações Crônicas do Diabetes (Endocrinologia)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Complicações Crônicas do Diabetes (Nefropatia, Retinopatia, Neuropatia)",
    "subfocos": [
      "Doença Renal do Diabetes (DRD) e Rastreamento de Albuminúria",
      "Retinopatia Diabética, Polineuropatia Simétrica Distal e Pé Diabético"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Endocrinologia",
    "chips": [
      {
        "label": "Doença Renal do Diabetes",
        "letter": "1",
        "value": "Conceito de alta relevância em Complicações Crônicas do Diabetes: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Retinopatia Diabética, Polineuropatia Simétrica Distal e Pé Diabético",
        "letter": "2",
        "value": "Conceito de alta relevância em Complicações Crônicas do Diabetes: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Complicações Crônicas do Diabetes: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Complicações Crônicas do Diabetes: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-da-glandula-tireoide",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças da Glândula Tireoide",
    "fullTitle": "Doenças da Glândula Tireoide (Endocrinologia)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Doenças da Glândula Tireoide (Hipo, Hiper e Tireoidites)",
    "subfocos": [
      "Hipotireoidismo Primário (Tireoidite de Hashimoto) e Hipotireoidismo Subclínico",
      "Hipertireoidismo (Doença de Graves, Bócio Multinodular Tóxico) e Tireoidites"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Endocrinologia",
    "chips": [
      {
        "label": "Hipotireoidismo Primário",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças da Glândula Tireoide: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hipertireoidismo",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças da Glândula Tireoide: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças da Glândula Tireoide: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças da Glândula Tireoide: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-das-glandulas-adrenais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças das Glândulas Adrenais",
    "fullTitle": "Doenças das Glândulas Adrenais (Endocrinologia)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Doenças das Glândulas Adrenais (Cushing, Addison, Feocromocitoma)",
    "subfocos": [
      "Síndrome de Cushing: Algoritmo de Triagem e Localização Etiológica",
      "Insuficiência Adrenal (Doença de Addison) e Feocromocitoma"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Endocrinologia",
    "chips": [
      {
        "label": "Síndrome de Cushing: Algoritmo de Triagem e Localização Etiológica",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças das Glândulas Adrenais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Insuficiência Adrenal",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças das Glândulas Adrenais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças das Glândulas Adrenais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças das Glândulas Adrenais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-disturbios-hipotalamo-hipofisarios-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Distúrbios Hipotálamo-Hipofisários e P",
    "fullTitle": "Distúrbios Hipotálamo-Hipofisários e Prolactina (Endocrinologia)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Distúrbios Hipotálamo-Hipofisários e Prolactina",
    "subfocos": [
      "Hiperprolactinemia e Prolactinomas (Micro vs Macroprolactinomas)",
      "Acromegalia e Diabetes Insipidus (Central vs Nefrogênico)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Endocrinologia",
    "chips": [
      {
        "label": "Hiperprolactinemia e Prolactinomas",
        "letter": "1",
        "value": "Conceito de alta relevância em Distúrbios Hipotálamo-Hipofisários e Prolactina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Acromegalia e Diabetes Insipidus",
        "letter": "2",
        "value": "Conceito de alta relevância em Distúrbios Hipotálamo-Hipofisários e Prolactina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Distúrbios Hipotálamo-Hipofisários e Prolactina: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Distúrbios Hipotálamo-Hipofisários e Prolactina: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-obesidade-sindrome-metabolica-e-dis",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Obesidade, Síndrome Metabólica e Disli",
    "fullTitle": "Obesidade, Síndrome Metabólica e Dislipidemias (Endocrinologia)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Obesidade, Síndrome Metabólica e Dislipidemias",
    "subfocos": [
      "Critérios Diagnósticos de Síndrome Metabólica (NCEP-ATP III / IDF)",
      "Dislipidemias: Metas de LDL-c e Terapia Farmacológica (Estatinas e Ezetimiba)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Endocrinologia",
    "chips": [
      {
        "label": "Critérios Diagnósticos de Síndrome Metabólica",
        "letter": "1",
        "value": "Conceito de alta relevância em Obesidade, Síndrome Metabólica e Dislipidemias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Dislipidemias: Metas de LDL-c e Terapia Farmacológica",
        "letter": "2",
        "value": "Conceito de alta relevância em Obesidade, Síndrome Metabólica e Dislipidemias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Obesidade, Síndrome Metabólica e Dislipidemias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Obesidade, Síndrome Metabólica e Dislipidemias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-disturbios-do-metabolismo-osseo-e-p",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Distúrbios do Metabolismo Ósseo e Para",
    "fullTitle": "Distúrbios do Metabolismo Ósseo e Paratireoide (Endocrinologia)",
    "specialty": "Clínica Médica",
    "tema": "Endocrinologia",
    "foco": "Distúrbios do Metabolismo Ósseo e Paratireoide",
    "subfocos": [
      "Osteoporose no Adulto: Densitometria Óssea e Escore FRAX",
      "Distúrbios do Cálcio: Hipercalcemia da Malignidade vs Hiperparatireoidismo"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Endocrinologia",
    "chips": [
      {
        "label": "Osteoporose no Adulto: Densitometria Óssea e Escore FRAX",
        "letter": "1",
        "value": "Conceito de alta relevância em Distúrbios do Metabolismo Ósseo e Paratireoide: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Distúrbios do Cálcio: Hipercalcemia da Malignidade vs Hiperparatireoidismo",
        "letter": "2",
        "value": "Conceito de alta relevância em Distúrbios do Metabolismo Ósseo e Paratireoide: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Distúrbios do Metabolismo Ósseo e Paratireoide: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Distúrbios do Metabolismo Ósseo e Paratireoide: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-artrite-reumatoide-e-doenca-de-stil",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Artrite Reumatoide e Doença de Still",
    "fullTitle": "Artrite Reumatoide e Doença de Still (Reumatologia)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Artrite Reumatoide e Doença de Still",
    "subfocos": [
      "Critérios de Classificação ACR/EULAR 2010 da Artrite Reumatoide",
      "Medicamentos Modificadores do Curso da Doença (DMARDs) e Doença de Still"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Reumatologia",
    "chips": [
      {
        "label": "Critérios de Classificação ACR/EULAR 2010 da Artrite Reumatoide",
        "letter": "1",
        "value": "Conceito de alta relevância em Artrite Reumatoide e Doença de Still: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Medicamentos Modificadores do Curso da Doença",
        "letter": "2",
        "value": "Conceito de alta relevância em Artrite Reumatoide e Doença de Still: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Artrite Reumatoide e Doença de Still: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Artrite Reumatoide e Doença de Still: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-lupus-eritematoso-sistemico-e-saf",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Lúpus Eritematoso Sistêmico  e SAF",
    "fullTitle": "Lúpus Eritematoso Sistêmico  e SAF (Reumatologia)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Lúpus Eritematoso Sistêmico (LES) e SAF",
    "subfocos": [
      "Critérios EULAR/ACR 2019 de Classificação do LES",
      "Síndrome do Anticorpo Antifosfolípide (SAF) e Tratamento do LES"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Reumatologia",
    "chips": [
      {
        "label": "Critérios EULAR/ACR 2019 de Classificação do LES",
        "letter": "1",
        "value": "Conceito de alta relevância em Lúpus Eritematoso Sistêmico  e SAF: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome do Anticorpo Antifosfolípide",
        "letter": "2",
        "value": "Conceito de alta relevância em Lúpus Eritematoso Sistêmico  e SAF: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Lúpus Eritematoso Sistêmico  e SAF: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Lúpus Eritematoso Sistêmico  e SAF: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-espondiloartrites",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Espondiloartrites",
    "fullTitle": "Espondiloartrites (Reumatologia)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Espondiloartrites (Espondilite Anquilosante, Artrite Psoriásica, Reativa)",
    "subfocos": [
      "Espondilite Anquilosante: Lombalgia Inflamatória e HLA-B27",
      "Artrite Psoriásica e Artrite Reativa (Síndrome de Reiter)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Reumatologia",
    "chips": [
      {
        "label": "Espondilite Anquilosante: Lombalgia Inflamatória e HLA-B27",
        "letter": "1",
        "value": "Conceito de alta relevância em Espondiloartrites: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Artrite Psoriásica e Artrite Reativa",
        "letter": "2",
        "value": "Conceito de alta relevância em Espondiloartrites: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Espondiloartrites: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Espondiloartrites: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-vasculites-sistemicas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vasculites Sistêmicas",
    "fullTitle": "Vasculites Sistêmicas (Reumatologia)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Vasculites Sistêmicas (Grandes, Médios e Pequenos Vasos)",
    "subfocos": [
      "Vasculites de Grandes e Médios Vasos (Arterite Temporal, Takayasu e Poliarterite Nodosa)",
      "Vasculites de Pequenos Vasos Associadas ao ANCA e por Imunocomplexos"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Reumatologia",
    "chips": [
      {
        "label": "Vasculites de Grandes e Médios Vasos",
        "letter": "1",
        "value": "Conceito de alta relevância em Vasculites Sistêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Vasculites de Pequenos Vasos Associadas ao ANCA e por Imunocomplexos",
        "letter": "2",
        "value": "Conceito de alta relevância em Vasculites Sistêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vasculites Sistêmicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vasculites Sistêmicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-esclerose-sistemica-e-miopatias-inf",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Esclerose Sistêmica e Miopatias Inflam",
    "fullTitle": "Esclerose Sistêmica e Miopatias Inflamatórias (Reumatologia)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Esclerose Sistêmica e Miopatias Inflamatórias",
    "subfocos": [
      "Esclerose Sistêmica Limitada (Síndrome CREST) vs Difusa",
      "Polimiosite e Dermatomiosite: Diagnóstico Clínico e Imunológico"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Reumatologia",
    "chips": [
      {
        "label": "Esclerose Sistêmica Limitada",
        "letter": "1",
        "value": "Conceito de alta relevância em Esclerose Sistêmica e Miopatias Inflamatórias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Polimiosite e Dermatomiosite: Diagnóstico Clínico e Imunológico",
        "letter": "2",
        "value": "Conceito de alta relevância em Esclerose Sistêmica e Miopatias Inflamatórias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Esclerose Sistêmica e Miopatias Inflamatórias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Esclerose Sistêmica e Miopatias Inflamatórias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-artropatias-por-microcristais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Artropatias por Microcristais",
    "fullTitle": "Artropatias por Microcristais (Reumatologia)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Artropatias por Microcristais (Gota e Pseudogota)",
    "subfocos": [
      "Gota Úrica: Fisiopatologia, Crise Aguda de Podagra e Artrocentese",
      "Tratamento da Crise Aguda vs Terapia Hipouricemiante Crônica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Reumatologia",
    "chips": [
      {
        "label": "Gota Úrica: Fisiopatologia, Crise Aguda de Podagra e Artrocentese",
        "letter": "1",
        "value": "Conceito de alta relevância em Artropatias por Microcristais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento da Crise Aguda vs Terapia Hipouricemiante Crônica",
        "letter": "2",
        "value": "Conceito de alta relevância em Artropatias por Microcristais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Artropatias por Microcristais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Artropatias por Microcristais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-osteoartrite-e-fibromialgia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Osteoartrite e Fibromialgia",
    "fullTitle": "Osteoartrite e Fibromialgia (Reumatologia)",
    "specialty": "Clínica Médica",
    "tema": "Reumatologia",
    "foco": "Osteoartrite e Fibromialgia",
    "subfocos": [
      "Osteoartrite (Artrose): Fisiopatologia, Nódulos de Heberden/Bouchard e Radiologia",
      "Fibromialgia: Critérios Diagnósticos do ACR e Terapia Farmacológica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Reumatologia",
    "chips": [
      {
        "label": "Osteoartrite",
        "letter": "1",
        "value": "Conceito de alta relevância em Osteoartrite e Fibromialgia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Fibromialgia: Critérios Diagnósticos do ACR e Terapia Farmacológica",
        "letter": "2",
        "value": "Conceito de alta relevância em Osteoartrite e Fibromialgia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Osteoartrite e Fibromialgia: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Osteoartrite e Fibromialgia: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-infeccao-pelo-hiv-e-doencas-oportun",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecção pelo HIV e Doenças Oportunist",
    "fullTitle": "Infecção pelo HIV e Doenças Oportunistas (Infectologia)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecção pelo HIV e Doenças Oportunistas",
    "subfocos": [
      "Diagnóstico e Terapia Antirretroviral (TARV)",
      "Doenças Oportunistas Maiores no HIV"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Infectologia",
    "chips": [
      {
        "label": "Diagnóstico e Terapia Antirretroviral",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecção pelo HIV e Doenças Oportunistas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Doenças Oportunistas Maiores no HIV",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecção pelo HIV e Doenças Oportunistas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecção pelo HIV e Doenças Oportunistas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecção pelo HIV e Doenças Oportunistas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-arboviroses-e-viroses-sistemicas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Arboviroses e Viroses Sistêmicas",
    "fullTitle": "Arboviroses e Viroses Sistêmicas (Infectologia)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Arboviroses e Viroses Sistêmicas (Dengue, Chikungunya, Zika, Febre Amarela)",
    "subfocos": [
      "Dengue (Classificação de Risco e Manejo Clínico)",
      "Febre Amarela, Chikungunya e Zika Vírus"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Infectologia",
    "chips": [
      {
        "label": "Dengue",
        "letter": "1",
        "value": "Conceito de alta relevância em Arboviroses e Viroses Sistêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Febre Amarela, Chikungunya e Zika Vírus",
        "letter": "2",
        "value": "Conceito de alta relevância em Arboviroses e Viroses Sistêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Arboviroses e Viroses Sistêmicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Arboviroses e Viroses Sistêmicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-sepse-e-choque-septico-no-adulto",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Sepse e Choque Séptico no Adulto",
    "fullTitle": "Sepse e Choque Séptico no Adulto (Infectologia)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Sepse e Choque Séptico no Adulto",
    "subfocos": [
      "Definições do Consenso Sepsis-3 e Escore SOFA / qSOFA",
      "Pacote de 1 Hora do Surviving Sepsis Campaign (SSC)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Infectologia",
    "chips": [
      {
        "label": "Definições do Consenso Sepsis-3 e Escore SOFA / qSOFA",
        "letter": "1",
        "value": "Conceito de alta relevância em Sepse e Choque Séptico no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Pacote de 1 Hora do Surviving Sepsis Campaign",
        "letter": "2",
        "value": "Conceito de alta relevância em Sepse e Choque Séptico no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Sepse e Choque Séptico no Adulto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Sepse e Choque Séptico no Adulto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-infeccoes-por-micobacterias-e-fungo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecções por Micobactérias e Fungos S",
    "fullTitle": "Infecções por Micobactérias e Fungos Sistêmicos (Infectologia)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecções por Micobactérias e Fungos Sistêmicos",
    "subfocos": [
      "Tuberculose Pulmonar: Diagnóstico (TRM-TB, Baciloscopia) e Esquema RIPE",
      "Micoses Endêmicas: Paracoccidioidomicose, Histoplasmose e Criptococose"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Infectologia",
    "chips": [
      {
        "label": "Tuberculose Pulmonar: Diagnóstico",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecções por Micobactérias e Fungos Sistêmicos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Micoses Endêmicas: Paracoccidioidomicose, Histoplasmose e Criptococose",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecções por Micobactérias e Fungos Sistêmicos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecções por Micobactérias e Fungos Sistêmicos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecções por Micobactérias e Fungos Sistêmicos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-zoonoses-e-doencas-tropicais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Zoonoses e Doenças Tropicais",
    "fullTitle": "Zoonoses e Doenças Tropicais (Infectologia)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Zoonoses e Doenças Tropicais (Leptospirose, Malária, Chagas, Leishmanioses)",
    "subfocos": [
      "Leptospirose (Doença de Weil) e Malária no Brasil",
      "Doença de Chagas (Fase Aguda e Crônica) e Leishmaniose Visceral (Calazar)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Infectologia",
    "chips": [
      {
        "label": "Leptospirose",
        "letter": "1",
        "value": "Conceito de alta relevância em Zoonoses e Doenças Tropicais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Doença de Chagas",
        "letter": "2",
        "value": "Conceito de alta relevância em Zoonoses e Doenças Tropicais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Zoonoses e Doenças Tropicais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Zoonoses e Doenças Tropicais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-infeccoes-respiratorias-e-faringeas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecções Respiratórias e Faríngeas",
    "fullTitle": "Infecções Respiratórias e Faríngeas (Infectologia)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecções Respiratórias e Faríngeas (COVID-19, Influenza)",
    "subfocos": [
      "Síndrome Respiratória Aguda Grave (SRAG) por Influenza e Oseltamivir",
      "COVID-19 no Adulto: Estratificação de Gravidade e Manejo Terapêutico"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Infectologia",
    "chips": [
      {
        "label": "Síndrome Respiratória Aguda Grave",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecções Respiratórias e Faríngeas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "COVID-19 no Adulto: Estratificação de Gravidade e Manejo Terapêutico",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecções Respiratórias e Faríngeas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecções Respiratórias e Faríngeas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecções Respiratórias e Faríngeas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-infeccoes-do-sistema-nervoso-centra",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecções do Sistema Nervoso Central n",
    "fullTitle": "Infecções do Sistema Nervoso Central no Adulto (Infectologia)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecções do Sistema Nervoso Central no Adulto (Meningites e Encefalites)",
    "subfocos": [
      "Meningite Bacteriana Aguda: Quadro Clínico, Punção Lombar e Análise Liquórica",
      "Terapia Antimicrobiana Empírica Imediata e Encefalite Herpética"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Infectologia",
    "chips": [
      {
        "label": "Meningite Bacteriana Aguda: Quadro Clínico, Punção Lombar e Análise Liquórica",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecções do Sistema Nervoso Central no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Terapia Antimicrobiana Empírica Imediata e Encefalite Herpética",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecções do Sistema Nervoso Central no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecções do Sistema Nervoso Central no Adulto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecções do Sistema Nervoso Central no Adulto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-infeccoes-hospitalares-e-uso-racion",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecções Hospitalares e Uso Racional ",
    "fullTitle": "Infecções Hospitalares e Uso Racional de Antimicrobianos (Infectologia)",
    "specialty": "Clínica Médica",
    "tema": "Infectologia",
    "foco": "Infecções Hospitalares e Uso Racional de Antimicrobianos",
    "subfocos": [
      "Pneumonia Associada à Ventilação Mecânica (PAV) e Infecções de Corrente Sanguínea (IPCS)",
      "Patógenos Multirresistentes (MDR / ESKAPE) e Stewardship de Antimicrobianos"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Infectologia",
    "chips": [
      {
        "label": "Pneumonia Associada à Ventilação Mecânica",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecções Hospitalares e Uso Racional de Antimicrobianos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Patógenos Multirresistentes",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecções Hospitalares e Uso Racional de Antimicrobianos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecções Hospitalares e Uso Racional de Antimicrobianos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecções Hospitalares e Uso Racional de Antimicrobianos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-anemias-carenciais-e-de-doenca-cron",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Anemias Carenciais e de Doença Crônica",
    "fullTitle": "Anemias Carenciais e de Doença Crônica (Hematologia)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Anemias Carenciais e de Doença Crônica",
    "subfocos": [
      "Anemia Ferropriva: Cinética do Ferro e Propedêutica Laboratorial",
      "Anemia de Doença Crônica e Anemias Megaloblásticas (B12 e Folato)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Hematologia",
    "chips": [
      {
        "label": "Anemia Ferropriva: Cinética do Ferro e Propedêutica Laboratorial",
        "letter": "1",
        "value": "Conceito de alta relevância em Anemias Carenciais e de Doença Crônica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Anemia de Doença Crônica e Anemias Megaloblásticas",
        "letter": "2",
        "value": "Conceito de alta relevância em Anemias Carenciais e de Doença Crônica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Anemias Carenciais e de Doença Crônica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Anemias Carenciais e de Doença Crônica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-anemias-hemoliticas-adquiridas-e-co",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Anemias Hemolíticas Adquiridas e Congê",
    "fullTitle": "Anemias Hemolíticas Adquiridas e Congênitas (Hematologia)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Anemias Hemolíticas Adquiridas e Congênitas",
    "subfocos": [
      "Achados Gerais de Hemólise e Anemia Falciforme (Crises Vaso-Oclusivas)",
      "Anemias Hemolíticas Autoimunes (AHAI) e Esferocitose Hereditária"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Hematologia",
    "chips": [
      {
        "label": "Achados Gerais de Hemólise e Anemia Falciforme",
        "letter": "1",
        "value": "Conceito de alta relevância em Anemias Hemolíticas Adquiridas e Congênitas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Anemias Hemolíticas Autoimunes",
        "letter": "2",
        "value": "Conceito de alta relevância em Anemias Hemolíticas Adquiridas e Congênitas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Anemias Hemolíticas Adquiridas e Congênitas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Anemias Hemolíticas Adquiridas e Congênitas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-leucemias-agudas-e-cronicas-no-adul",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Leucemias Agudas e Crônicas no Adulto",
    "fullTitle": "Leucemias Agudas e Crônicas no Adulto (Hematologia)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Leucemias Agudas e Crônicas no Adulto",
    "subfocos": [
      "Leucemia Mieloide Aguda (LMA) e Leucemia Linfoide Aguda (LLA)",
      "Leucemia Mieloide Crônica (LMC) e Leucemia Linfoide Crônica (LLC)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Hematologia",
    "chips": [
      {
        "label": "Leucemia Mieloide Aguda",
        "letter": "1",
        "value": "Conceito de alta relevância em Leucemias Agudas e Crônicas no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Leucemia Mieloide Crônica",
        "letter": "2",
        "value": "Conceito de alta relevância em Leucemias Agudas e Crônicas no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Leucemias Agudas e Crônicas no Adulto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Leucemias Agudas e Crônicas no Adulto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-linfomas-e-mieloma-multiplo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Linfomas  e Mieloma Múltiplo",
    "fullTitle": "Linfomas  e Mieloma Múltiplo (Hematologia)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Linfomas (Hodgkin e Não-Hodgkin) e Mieloma Múltiplo",
    "subfocos": [
      "Linfoma de Hodgkin vs Linfoma Não-Hodgkin (LNH)",
      "Mieloma Múltiplo: Critérios Diagnósticos Canônicos (CRAB)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Hematologia",
    "chips": [
      {
        "label": "Linfoma de Hodgkin vs Linfoma Não-Hodgkin",
        "letter": "1",
        "value": "Conceito de alta relevância em Linfomas  e Mieloma Múltiplo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Mieloma Múltiplo: Critérios Diagnósticos Canônicos",
        "letter": "2",
        "value": "Conceito de alta relevância em Linfomas  e Mieloma Múltiplo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Linfomas  e Mieloma Múltiplo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Linfomas  e Mieloma Múltiplo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-disturbios-da-hemostasia-e-coagulop",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Distúrbios da Hemostasia e Coagulopati",
    "fullTitle": "Distúrbios da Hemostasia e Coagulopatias (Hematologia)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Distúrbios da Hemostasia e Coagulopatias (Hemofilias e Plaquetopenias)",
    "subfocos": [
      "Púrpura Trombocitopênica Imunológica (PTI) e Trombocitopenia Induzida por Heparina (HIT)",
      "Hemofilias Congênitas (Hemofilia A e B) e Coagulação Intravascular Disseminada (CIVD)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Hematologia",
    "chips": [
      {
        "label": "Púrpura Trombocitopênica Imunológica",
        "letter": "1",
        "value": "Conceito de alta relevância em Distúrbios da Hemostasia e Coagulopatias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hemofilias Congênitas",
        "letter": "2",
        "value": "Conceito de alta relevância em Distúrbios da Hemostasia e Coagulopatias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Distúrbios da Hemostasia e Coagulopatias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Distúrbios da Hemostasia e Coagulopatias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-trombofilias-e-trombose",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trombofilias e Trombose",
    "fullTitle": "Trombofilias e Trombose (Hematologia)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Trombofilias e Trombose",
    "subfocos": [
      "Trombofilias Hereditárias (Fator V de Leiden, Mutação da Protrombina)",
      "Indicações de Rastreamento de Trombofilias e Duração da Anticoagulação"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Hematologia",
    "chips": [
      {
        "label": "Trombofilias Hereditárias",
        "letter": "1",
        "value": "Conceito de alta relevância em Trombofilias e Trombose: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Indicações de Rastreamento de Trombofilias e Duração da Anticoagulação",
        "letter": "2",
        "value": "Conceito de alta relevância em Trombofilias e Trombose: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trombofilias e Trombose: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trombofilias e Trombose: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-medicina-transfusional-e-reacoes-he",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Medicina Transfusional e Reações Hemol",
    "fullTitle": "Medicina Transfusional e Reações Hemolíticas (Hematologia)",
    "specialty": "Clínica Médica",
    "tema": "Hematologia",
    "foco": "Medicina Transfusional e Reações Hemolíticas",
    "subfocos": [
      "Gatilhos Transfusionais para Concentrado de Hemácias e Plaquetas",
      "Reações Transfusionais Graves: TRALI, TACO e Hemólise Aguda Imune"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Hematologia",
    "chips": [
      {
        "label": "Gatilhos Transfusionais para Concentrado de Hemácias e Plaquetas",
        "letter": "1",
        "value": "Conceito de alta relevância em Medicina Transfusional e Reações Hemolíticas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Reações Transfusionais Graves: TRALI, TACO e Hemólise Aguda Imune",
        "letter": "2",
        "value": "Conceito de alta relevância em Medicina Transfusional e Reações Hemolíticas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Medicina Transfusional e Reações Hemolíticas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Medicina Transfusional e Reações Hemolíticas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-acidente-vascular-cerebral",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Acidente Vascular Cerebral",
    "fullTitle": "Acidente Vascular Cerebral (Neurologia)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Acidente Vascular Cerebral (Isquêmico e Hemorrágico)",
    "subfocos": [
      "Acidente Vascular Cerebral Isquêmico (AVCi) Agudo",
      "Acidente Vascular Cerebral Hemorrágico e Hemorragia Subaracnóidea"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Neurologia",
    "chips": [
      {
        "label": "Acidente Vascular Cerebral Isquêmico",
        "letter": "1",
        "value": "Conceito de alta relevância em Acidente Vascular Cerebral: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Acidente Vascular Cerebral Hemorrágico e Hemorragia Subaracnóidea",
        "letter": "2",
        "value": "Conceito de alta relevância em Acidente Vascular Cerebral: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Acidente Vascular Cerebral: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Acidente Vascular Cerebral: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-epilepsias-e-estado-de-mal-epilepti",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Epilepsias e Estado de Mal Epiléptico ",
    "fullTitle": "Epilepsias e Estado de Mal Epiléptico no Adulto (Neurologia)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Epilepsias e Estado de Mal Epiléptico no Adulto",
    "subfocos": [
      "Classificação das Crises Epilépticas (Focais vs Generalizadas)",
      "Protocolo de Manejo do Estado de Mal Epiléptico (Status Epilepticus)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Neurologia",
    "chips": [
      {
        "label": "Classificação das Crises Epilépticas",
        "letter": "1",
        "value": "Conceito de alta relevância em Epilepsias e Estado de Mal Epiléptico no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Protocolo de Manejo do Estado de Mal Epiléptico",
        "letter": "2",
        "value": "Conceito de alta relevância em Epilepsias e Estado de Mal Epiléptico no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Epilepsias e Estado de Mal Epiléptico no Adulto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Epilepsias e Estado de Mal Epiléptico no Adulto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-cefaleias-primarias-e-secundarias",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cefaleias Primárias e Secundárias",
    "fullTitle": "Cefaleias Primárias e Secundárias (Neurologia)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Cefaleias Primárias e Secundárias",
    "subfocos": [
      "Cefaleias Primárias: Enxaqueca, Tensional e Cefaleia em Salvas",
      "Sinais de Alarme (Red Flags) e Cefaleia Secundária (Hemorragia Subaracnóidea)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Neurologia",
    "chips": [
      {
        "label": "Cefaleias Primárias: Enxaqueca, Tensional e Cefaleia em Salvas",
        "letter": "1",
        "value": "Conceito de alta relevância em Cefaleias Primárias e Secundárias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Sinais de Alarme",
        "letter": "2",
        "value": "Conceito de alta relevância em Cefaleias Primárias e Secundárias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cefaleias Primárias e Secundárias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cefaleias Primárias e Secundárias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-sindromes-demenciais-e-doenca-de-al",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndromes Demenciais e Doença de Alzhe",
    "fullTitle": "Síndromes Demenciais e Doença de Alzheimer (Neurologia)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Síndromes Demenciais e Doença de Alzheimer",
    "subfocos": [
      "Doença de Alzheimer: Fisiopatologia, Perda de Memória Recente e Farmacoterapia",
      "Diagnóstico Diferencial: Demência Vascular, Corpos de Lewy e Frontotemporal"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Neurologia",
    "chips": [
      {
        "label": "Doença de Alzheimer: Fisiopatologia, Perda de Memória Recente e Farmacoterapia",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndromes Demenciais e Doença de Alzheimer: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Diagnóstico Diferencial: Demência Vascular, Corpos de Lewy e Frontotemporal",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndromes Demenciais e Doença de Alzheimer: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndromes Demenciais e Doença de Alzheimer: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndromes Demenciais e Doença de Alzheimer: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-desmielinizantes",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Desmielinizantes",
    "fullTitle": "Doenças Desmielinizantes (Neurologia)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Doenças Desmielinizantes (Esclerose Múltipla)",
    "subfocos": [
      "Esclerose Múltipla: Fisiopatologia, Disseminação no Tempo e Espaço (Critérios de McDonald)",
      "Tratamento do Surto Agudo (Pulsoterapia) e Terapias Modificadoras de Doença"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Neurologia",
    "chips": [
      {
        "label": "Esclerose Múltipla: Fisiopatologia, Disseminação no Tempo e Espaço",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Desmielinizantes: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento do Surto Agudo",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Desmielinizantes: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Desmielinizantes: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Desmielinizantes: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-neuromusculares-e-polineuro",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Neuromusculares e Polineuropat",
    "fullTitle": "Doenças Neuromusculares e Polineuropatias (Neurologia)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Doenças Neuromusculares e Polineuropatias (Guillain-Barré, Miastenia Gravis)",
    "subfocos": [
      "Síndrome de Guillain-Barré (Polirradiculoneuropatia Inflamatória Desmielinizante Aguda)",
      "Miastenia Gravis: Fisiopatologia Autoimune da Placa Motora e Crise Miastênica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Neurologia",
    "chips": [
      {
        "label": "Síndrome de Guillain-Barré",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Neuromusculares e Polineuropatias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Miastenia Gravis: Fisiopatologia Autoimune da Placa Motora e Crise Miastênica",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Neuromusculares e Polineuropatias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Neuromusculares e Polineuropatias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Neuromusculares e Polineuropatias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doenca-de-parkinson-e-disturbios-do",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença de Parkinson e Distúrbios do Mo",
    "fullTitle": "Doença de Parkinson e Distúrbios do Movimento (Neurologia)",
    "specialty": "Clínica Médica",
    "tema": "Neurologia",
    "foco": "Doença de Parkinson e Distúrbios do Movimento",
    "subfocos": [
      "Tétrade Motora Canônica do Parkinsonismo e Diagnóstico Clínico",
      "Tratamento com Levodopa/Carbidopa e Diagnóstico Diferencial de Parkinsonismo Secundário"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Neurologia",
    "chips": [
      {
        "label": "Tétrade Motora Canônica do Parkinsonismo e Diagnóstico Clínico",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença de Parkinson e Distúrbios do Movimento: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento com Levodopa/Carbidopa e Diagnóstico Diferencial de Parkinsonismo Secundário",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença de Parkinson e Distúrbios do Movimento: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença de Parkinson e Distúrbios do Movimento: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença de Parkinson e Distúrbios do Movimento: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-dermatoses-inflamatorias-e-eritemat",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Dermatoses Inflamatórias e Eritêmato-D",
    "fullTitle": "Dermatoses Inflamatórias e Eritêmato-Descamativas (Dermatologia)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Dermatoses Inflamatórias e Eritêmato-Descamativas (Psoríase, Dermatite Atópica)",
    "subfocos": [
      "Psoríase Vulgar: Fisiopatologia, Quadro Clínico e Fenômeno de Koebner",
      "Dermatite Atópica e Dermatite de Contato (Alérgica vs Irritativa)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Dermatologia",
    "chips": [
      {
        "label": "Psoríase Vulgar: Fisiopatologia, Quadro Clínico e Fenômeno de Koebner",
        "letter": "1",
        "value": "Conceito de alta relevância em Dermatoses Inflamatórias e Eritêmato-Descamativas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Dermatite Atópica e Dermatite de Contato",
        "letter": "2",
        "value": "Conceito de alta relevância em Dermatoses Inflamatórias e Eritêmato-Descamativas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Dermatoses Inflamatórias e Eritêmato-Descamativas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Dermatoses Inflamatórias e Eritêmato-Descamativas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-erupcoes-medicamentosas-graves",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Erupções Medicamentosas Graves",
    "fullTitle": "Erupções Medicamentosas Graves (Dermatologia)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Erupções Medicamentosas Graves (DRESS, Stevens-Johnson, NET)",
    "subfocos": [
      "Síndrome DRESS (Drug Reaction with Eosinophilia and Systemic Symptoms)",
      "Síndrome de Stevens-Johnson (SSJ) e Necrólise Epidérmica Tóxica (NET)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Dermatologia",
    "chips": [
      {
        "label": "Síndrome DRESS",
        "letter": "1",
        "value": "Conceito de alta relevância em Erupções Medicamentosas Graves: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome de Stevens-Johnson",
        "letter": "2",
        "value": "Conceito de alta relevância em Erupções Medicamentosas Graves: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Erupções Medicamentosas Graves: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Erupções Medicamentosas Graves: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-doencas-bolhosas-autoimunes",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Bolhosas Autoimunes",
    "fullTitle": "Doenças Bolhosas Autoimunes (Dermatologia)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Doenças Bolhosas Autoimunes (Pênfigos e Penfigoide)",
    "subfocos": [
      "Pênfigo Vulgar vs Pênfigo Foliáceo",
      "Penfigoide Bolhoso: Fisiopatologia e Quadro Clínico em Idosos"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Dermatologia",
    "chips": [
      {
        "label": "Pênfigo Vulgar vs Pênfigo Foliáceo",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Bolhosas Autoimunes: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Penfigoide Bolhoso: Fisiopatologia e Quadro Clínico em Idosos",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Bolhosas Autoimunes: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Bolhosas Autoimunes: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Bolhosas Autoimunes: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-infeccoes-cutaneas-bacterianas-fung",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecções Cutâneas Bacterianas, Fúngic",
    "fullTitle": "Infecções Cutâneas Bacterianas, Fúngicas e Virais (Dermatologia)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Infecções Cutâneas Bacterianas, Fúngicas e Virais",
    "subfocos": [
      "Infecções Bacterianas Cutâneas: Erisipela, Celulite e Fasciíte Necrosante",
      "Micoses Superficiais (Dermatofitoses) e Infecções Virais (Herpes-Zóster)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Dermatologia",
    "chips": [
      {
        "label": "Infecções Bacterianas Cutâneas: Erisipela, Celulite e Fasciíte Necrosante",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecções Cutâneas Bacterianas, Fúngicas e Virais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Micoses Superficiais",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecções Cutâneas Bacterianas, Fúngicas e Virais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecções Cutâneas Bacterianas, Fúngicas e Virais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecções Cutâneas Bacterianas, Fúngicas e Virais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-hanseniase-e-manifestacoes-cutaneas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hanseníase e Manifestações Cutâneas",
    "fullTitle": "Hanseníase e Manifestações Cutâneas (Dermatologia)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Hanseníase e Manifestações Cutâneas",
    "subfocos": [
      "Classificação de Ridley-Jopling e Formas Operacionais (Paucibacilar vs Multibacilar)",
      "Poliquimioterapia Única (PQT-U) e Estados Reacionais Hansênicos"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Dermatologia",
    "chips": [
      {
        "label": "Classificação de Ridley-Jopling e Formas Operacionais",
        "letter": "1",
        "value": "Conceito de alta relevância em Hanseníase e Manifestações Cutâneas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Poliquimioterapia Única",
        "letter": "2",
        "value": "Conceito de alta relevância em Hanseníase e Manifestações Cutâneas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hanseníase e Manifestações Cutâneas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hanseníase e Manifestações Cutâneas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-cancer-de-pele-e-lesoes-pre-maligna",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Pele e Lesões Pré-Malignas n",
    "fullTitle": "Câncer de Pele e Lesões Pré-Malignas no Adulto (Dermatologia)",
    "specialty": "Clínica Médica",
    "tema": "Dermatologia",
    "foco": "Câncer de Pele e Lesões Pré-Malignas no Adulto",
    "subfocos": [
      "Carcinomas Cutâneos (CBC e CEC) e Ceratose Actínica na Prática Clínica",
      "Melanoma Cutâneo: Reconhecimento Precoce e Triagem Dermatológica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Dermatologia",
    "chips": [
      {
        "label": "Carcinomas Cutâneos",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Pele e Lesões Pré-Malignas no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Melanoma Cutâneo: Reconhecimento Precoce e Triagem Dermatológica",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Pele e Lesões Pré-Malignas no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Pele e Lesões Pré-Malignas no Adulto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Pele e Lesões Pré-Malignas no Adulto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-anafilaxia-e-reacoes-alergicas-grav",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Anafilaxia e Reações Alérgicas Graves",
    "fullTitle": "Anafilaxia e Reações Alérgicas Graves (Alergia e Imunologia)",
    "specialty": "Clínica Médica",
    "tema": "Alergia e Imunologia",
    "foco": "Anafilaxia e Reações Alérgicas Graves",
    "subfocos": [
      "Critérios Clínicos de Diagnóstico Imediato da Anafilaxia",
      "Protocolo de Emergência: Adrenalina Intramuscular Precoce e Manejo"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Alergia e Imunologia",
    "chips": [
      {
        "label": "Critérios Clínicos de Diagnóstico Imediato da Anafilaxia",
        "letter": "1",
        "value": "Conceito de alta relevância em Anafilaxia e Reações Alérgicas Graves: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Protocolo de Emergência: Adrenalina Intramuscular Precoce e Manejo",
        "letter": "2",
        "value": "Conceito de alta relevância em Anafilaxia e Reações Alérgicas Graves: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Anafilaxia e Reações Alérgicas Graves: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Anafilaxia e Reações Alérgicas Graves: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-urticaria-e-angioedema",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Urticária e Angioedema",
    "fullTitle": "Urticária e Angioedema (Alergia e Imunologia)",
    "specialty": "Clínica Médica",
    "tema": "Alergia e Imunologia",
    "foco": "Urticária e Angioedema (Hereditário e Adquirido)",
    "subfocos": [
      "Urticária Aguda vs Crônica e Terapia com Anti-Histamínicos H1",
      "Angioedema Hereditário Mediado por Bradicinina"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Alergia e Imunologia",
    "chips": [
      {
        "label": "Urticária Aguda vs Crônica e Terapia com Anti-Histamínicos H1",
        "letter": "1",
        "value": "Conceito de alta relevância em Urticária e Angioedema: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Angioedema Hereditário Mediado por Bradicinina",
        "letter": "2",
        "value": "Conceito de alta relevância em Urticária e Angioedema: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Urticária e Angioedema: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Urticária e Angioedema: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-rinite-alergica-e-alergias-alimenta",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Rinite Alérgica e Alergias Alimentares",
    "fullTitle": "Rinite Alérgica e Alergias Alimentares/Medicamentosas (Alergia e Imunologia)",
    "specialty": "Clínica Médica",
    "tema": "Alergia e Imunologia",
    "foco": "Rinite Alérgica e Alergias Alimentares/Medicamentosas",
    "subfocos": [
      "Rinite Alérgica: Classificação ARIA e Corticoterapia Nasal",
      "Reações Adversas a Fármacos: Reações Alérgicas Tipo I (IgE) vs Reações Pseudoalérgicas"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Alergia e Imunologia",
    "chips": [
      {
        "label": "Rinite Alérgica: Classificação ARIA e Corticoterapia Nasal",
        "letter": "1",
        "value": "Conceito de alta relevância em Rinite Alérgica e Alergias Alimentares/Medicamentosas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Reações Adversas a Fármacos: Reações Alérgicas Tipo I",
        "letter": "2",
        "value": "Conceito de alta relevância em Rinite Alérgica e Alergias Alimentares/Medicamentosas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rinite Alérgica e Alergias Alimentares/Medicamentosas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rinite Alérgica e Alergias Alimentares/Medicamentosas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-imunodeficiencias-primarias-e-secun",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Imunodeficiências Primárias e Secundár",
    "fullTitle": "Imunodeficiências Primárias e Secundárias no Adulto (Alergia e Imunologia)",
    "specialty": "Clínica Médica",
    "tema": "Alergia e Imunologia",
    "foco": "Imunodeficiências Primárias e Secundárias no Adulto",
    "subfocos": [
      "Imunodeficiência Comum Variável (IDCV) no Adulto",
      "Imunodeficiências Secundárias a Fármacos Imunossupressores e Doenças Sistêmicas"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Alergia e Imunologia",
    "chips": [
      {
        "label": "Imunodeficiência Comum Variável",
        "letter": "1",
        "value": "Conceito de alta relevância em Imunodeficiências Primárias e Secundárias no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Imunodeficiências Secundárias a Fármacos Imunossupressores e Doenças Sistêmicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Imunodeficiências Primárias e Secundárias no Adulto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Imunodeficiências Primárias e Secundárias no Adulto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Imunodeficiências Primárias e Secundárias no Adulto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-principios-de-oncogenese-estadiamen",
    "category": "criterios",
    "categoryLabel": "Critérios & Escores Diagnósticos",
    "title": "Princípios de Oncogênese, Estadiamento",
    "fullTitle": "Princípios de Oncogênese, Estadiamento e Biópsia (Oncologia Clínica)",
    "specialty": "Clínica Médica",
    "tema": "Oncologia Clínica",
    "foco": "Princípios de Oncogênese, Estadiamento e Biópsia",
    "subfocos": [
      "Bases Biológicas do Câncer e Avaliação do Performance Status (ECOG / Karnofsky)",
      "Princípios do Sistema TNM e Importância da Confirmação Histopatológica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Oncologia Clínica",
    "chips": [
      {
        "label": "Bases Biológicas do Câncer e Avaliação do Performance Status",
        "letter": "1",
        "value": "Conceito de alta relevância em Princípios de Oncogênese, Estadiamento e Biópsia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Princípios do Sistema TNM e Importância da Confirmação Histopatológica",
        "letter": "2",
        "value": "Conceito de alta relevância em Princípios de Oncogênese, Estadiamento e Biópsia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Princípios de Oncogênese, Estadiamento e Biópsia: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Princípios de Oncogênese, Estadiamento e Biópsia: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-emergencias-oncologicas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Emergências Oncológicas",
    "fullTitle": "Emergências Oncológicas (Oncologia Clínica)",
    "specialty": "Clínica Médica",
    "tema": "Oncologia Clínica",
    "foco": "Emergências Oncológicas (Síndrome de Lise Tumoral, Neutropenia Febril, Hipercalcemia)",
    "subfocos": [
      "Síndrome de Lise Tumoral (SLT): Fisiopatologia, Critérios de Cairo-Bishop e Rasburicase",
      "Neutropenia Febril e Compressão Medular Maligna"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Oncologia Clínica",
    "chips": [
      {
        "label": "Síndrome de Lise Tumoral",
        "letter": "1",
        "value": "Conceito de alta relevância em Emergências Oncológicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Neutropenia Febril e Compressão Medular Maligna",
        "letter": "2",
        "value": "Conceito de alta relevância em Emergências Oncológicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Emergências Oncológicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Emergências Oncológicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-toxicidades-de-quimioterapia-imunot",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Toxicidades de Quimioterapia, Imunoter",
    "fullTitle": "Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo (Oncologia Clínica)",
    "specialty": "Clínica Médica",
    "tema": "Oncologia Clínica",
    "foco": "Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo",
    "subfocos": [
      "Toxicidades Clássicas de Quimioterápicos Citotóxicos",
      "Eventos Adversos Imunomediados por Inibidores de Checkpoint (Anti-PD-1, Anti-CTLA-4)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Oncologia Clínica",
    "chips": [
      {
        "label": "Toxicidades Clássicas de Quimioterápicos Citotóxicos",
        "letter": "1",
        "value": "Conceito de alta relevância em Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Eventos Adversos Imunomediados por Inibidores de Checkpoint",
        "letter": "2",
        "value": "Conceito de alta relevância em Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Toxicidades de Quimioterapia, Imunoterapia e Terapia-Alvo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-sindromes-paraneoplasicas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndromes Paraneoplásicas",
    "fullTitle": "Síndromes Paraneoplásicas (Oncologia Clínica)",
    "specialty": "Clínica Médica",
    "tema": "Oncologia Clínica",
    "foco": "Síndromes Paraneoplásicas",
    "subfocos": [
      "Síndromes Paraneoplásicas Endócrinas (SIADH, Cushing Ectópico, Hipercalcemia)",
      "Síndromes Paraneoplásicas Neurológicas e Hematológicas"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Oncologia Clínica",
    "chips": [
      {
        "label": "Síndromes Paraneoplásicas Endócrinas",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndromes Paraneoplásicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndromes Paraneoplásicas Neurológicas e Hematológicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndromes Paraneoplásicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndromes Paraneoplásicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndromes Paraneoplásicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-choque-circulatorio-e-monitorizacao",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Choque Circulatório e Monitorização He",
    "fullTitle": "Choque Circulatório e Monitorização Hemodinâmica (Medicina de Emergência)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Choque Circulatório e Monitorização Hemodinâmica",
    "subfocos": [
      "Diferenciação Hemodinâmica dos 4 Tipos de Choque (Distributivo, Cardiogênico, Hipovolêmico, Obstrutivo)",
      "Uso de Drogas Vasoativas, Inotrópicos e Ressuscitação Guiada por Metas"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Medicina de Emergência",
    "chips": [
      {
        "label": "Diferenciação Hemodinâmica dos 4 Tipos de Choque",
        "letter": "1",
        "value": "Conceito de alta relevância em Choque Circulatório e Monitorização Hemodinâmica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Uso de Drogas Vasoativas, Inotrópicos e Ressuscitação Guiada por Metas",
        "letter": "2",
        "value": "Conceito de alta relevância em Choque Circulatório e Monitorização Hemodinâmica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Choque Circulatório e Monitorização Hemodinâmica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Choque Circulatório e Monitorização Hemodinâmica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-insuficiencia-respiratoria-aguda-e-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Insuficiência Respiratória Aguda e Ven",
    "fullTitle": "Insuficiência Respiratória Aguda e Ventilação Mecânica (Medicina de Emergência)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Insuficiência Respiratória Aguda e Ventilação Mecânica",
    "subfocos": [
      "Insuficiência Respiratória Tipo 1 (Hipoxêmica) vs Tipo 2 (Hipercápnica)",
      "Parâmetros Iniciais da Ventilação Mecânica Protetora na SDRA"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Medicina de Emergência",
    "chips": [
      {
        "label": "Insuficiência Respiratória Tipo 1",
        "letter": "1",
        "value": "Conceito de alta relevância em Insuficiência Respiratória Aguda e Ventilação Mecânica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Parâmetros Iniciais da Ventilação Mecânica Protetora na SDRA",
        "letter": "2",
        "value": "Conceito de alta relevância em Insuficiência Respiratória Aguda e Ventilação Mecânica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Insuficiência Respiratória Aguda e Ventilação Mecânica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Insuficiência Respiratória Aguda e Ventilação Mecânica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-intoxicacoes-exogenas-agudas-e-sind",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Intoxicações Exógenas Agudas e Síndrom",
    "fullTitle": "Intoxicações Exógenas Agudas e Síndromes Tóxicas (Medicina de Emergência)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Intoxicações Exógenas Agudas e Síndromes Tóxicas",
    "subfocos": [
      "Descontaminação Gastrointestinal e Métodos de Eliminação Acelerada",
      "Reconhecimento das Toxidromes e Antídotos Específicos em Emergência"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Medicina de Emergência",
    "chips": [
      {
        "label": "Descontaminação Gastrointestinal e Métodos de Eliminação Acelerada",
        "letter": "1",
        "value": "Conceito de alta relevância em Intoxicações Exógenas Agudas e Síndromes Tóxicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Reconhecimento das Toxidromes e Antídotos Específicos em Emergência",
        "letter": "2",
        "value": "Conceito de alta relevância em Intoxicações Exógenas Agudas e Síndromes Tóxicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Intoxicações Exógenas Agudas e Síndromes Tóxicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Intoxicações Exógenas Agudas e Síndromes Tóxicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-coma-e-alteracao-aguda-do-nivel-de-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Coma e Alteração Aguda do Nível de Con",
    "fullTitle": "Coma e Alteração Aguda do Nível de Consciência (Medicina de Emergência)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Coma e Alteração Aguda do Nível de Consciência (Delirium)",
    "subfocos": [
      "Coma Agudo: Escala de Coma de Glasgow-P e Avaliação de Tronco Encefálico",
      "Delirium no Paciente Grave: Avaliação com CAM-ICU e Manejo"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Medicina de Emergência",
    "chips": [
      {
        "label": "Coma Agudo: Escala de Coma de Glasgow-P e Avaliação de Tronco Encefálico",
        "letter": "1",
        "value": "Conceito de alta relevância em Coma e Alteração Aguda do Nível de Consciência: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Delirium no Paciente Grave: Avaliação com CAM-ICU e Manejo",
        "letter": "2",
        "value": "Conceito de alta relevância em Coma e Alteração Aguda do Nível de Consciência: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Coma e Alteração Aguda do Nível de Consciência: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Coma e Alteração Aguda do Nível de Consciência: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-hipotermia-e-queimaduras-no-adulto-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hipotermia e Queimaduras no Adulto em ",
    "fullTitle": "Hipotermia e Queimaduras no Adulto em UTI (Medicina de Emergência)",
    "specialty": "Clínica Médica",
    "tema": "Medicina de Emergência",
    "foco": "Hipotermia e Queimaduras no Adulto em UTI",
    "subfocos": [
      "Hipotermia Acidental Grave no Adulto e Reaquecimento Ativo",
      "Suporte Intensivo ao Grande Queimado Adulto e Complicações Sistêmicas"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Medicina de Emergência",
    "chips": [
      {
        "label": "Hipotermia Acidental Grave no Adulto e Reaquecimento Ativo",
        "letter": "1",
        "value": "Conceito de alta relevância em Hipotermia e Queimaduras no Adulto em UTI: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Suporte Intensivo ao Grande Queimado Adulto e Complicações Sistêmicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Hipotermia e Queimaduras no Adulto em UTI: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hipotermia e Queimaduras no Adulto em UTI: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hipotermia e Queimaduras no Adulto em UTI: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-grandes-sindromes-geriatricas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Grandes Síndromes Geriátricas",
    "fullTitle": "Grandes Síndromes Geriátricas (Geriatria)",
    "specialty": "Clínica Médica",
    "tema": "Geriatria",
    "foco": "Grandes Síndromes Geriátricas (Instabilidade, Quedas e Fragilidade)",
    "subfocos": [
      "Síndrome da Fragilidade no Idoso: Fenótipo de Fried",
      "Instabilidade Postural, Marcha e Avaliação de Quedas em Idosos"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Geriatria",
    "chips": [
      {
        "label": "Síndrome da Fragilidade no Idoso: Fenótipo de Fried",
        "letter": "1",
        "value": "Conceito de alta relevância em Grandes Síndromes Geriátricas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Instabilidade Postural, Marcha e Avaliação de Quedas em Idosos",
        "letter": "2",
        "value": "Conceito de alta relevância em Grandes Síndromes Geriátricas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Grandes Síndromes Geriátricas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Grandes Síndromes Geriátricas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-polifarmacia-e-criterios-de-beers-s",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Polifarmácia e Critérios de Beers/STOP",
    "fullTitle": "Polifarmácia e Critérios de Beers/STOPP-START (Geriatria)",
    "specialty": "Clínica Médica",
    "tema": "Geriatria",
    "foco": "Polifarmácia e Critérios de Beers/STOPP-START",
    "subfocos": [
      "Definição de Polifarmácia e Efeito Cascata Iatrogênico",
      "Critérios de Beers e Ferramenta STOPP/START para Prescrição Segura"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Geriatria",
    "chips": [
      {
        "label": "Definição de Polifarmácia e Efeito Cascata Iatrogênico",
        "letter": "1",
        "value": "Conceito de alta relevância em Polifarmácia e Critérios de Beers/STOPP-START: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Critérios de Beers e Ferramenta STOPP/START para Prescrição Segura",
        "letter": "2",
        "value": "Conceito de alta relevância em Polifarmácia e Critérios de Beers/STOPP-START: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Polifarmácia e Critérios de Beers/STOPP-START: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Polifarmácia e Critérios de Beers/STOPP-START: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-avaliacao-geriatrica-ampla-e-funcio",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Avaliação Geriátrica Ampla  e Funciona",
    "fullTitle": "Avaliação Geriátrica Ampla  e Funcionalidade (Geriatria)",
    "specialty": "Clínica Médica",
    "tema": "Geriatria",
    "foco": "Avaliação Geriátrica Ampla (AGA) e Funcionalidade",
    "subfocos": [
      "Instrumentos de Avaliação das Atividades de Vida Diária (AVDs e AIVDs)",
      "Avaliação Cognitiva e Rastreamento de Humor no Idoso (MEEM e GDS)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Geriatria",
    "chips": [
      {
        "label": "Instrumentos de Avaliação das Atividades de Vida Diária",
        "letter": "1",
        "value": "Conceito de alta relevância em Avaliação Geriátrica Ampla  e Funcionalidade: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Avaliação Cognitiva e Rastreamento de Humor no Idoso",
        "letter": "2",
        "value": "Conceito de alta relevância em Avaliação Geriátrica Ampla  e Funcionalidade: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Avaliação Geriátrica Ampla  e Funcionalidade: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Avaliação Geriátrica Ampla  e Funcionalidade: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-incontinencia-e-imobilidade-no-idos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Incontinência e Imobilidade no Idoso",
    "fullTitle": "Incontinência e Imobilidade no Idoso (Geriatria)",
    "specialty": "Clínica Médica",
    "tema": "Geriatria",
    "foco": "Incontinência e Imobilidade no Idoso",
    "subfocos": [
      "Incontinência Urinária no Idoso: Causas Transitórias (Mnemônico DIAPPERS)",
      "Síndrome da Imobilidade e Consequências Sistêmicas do Confinamento ao Leito"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Geriatria",
    "chips": [
      {
        "label": "Incontinência Urinária no Idoso: Causas Transitórias",
        "letter": "1",
        "value": "Conceito de alta relevância em Incontinência e Imobilidade no Idoso: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome da Imobilidade e Consequências Sistêmicas do Confinamento ao Leito",
        "letter": "2",
        "value": "Conceito de alta relevância em Incontinência e Imobilidade no Idoso: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Incontinência e Imobilidade no Idoso: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Incontinência e Imobilidade no Idoso: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-principios-e-filosofia-dos-cuidados",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Princípios e Filosofia dos Cuidados Pa",
    "fullTitle": "Princípios e Filosofia dos Cuidados Paliativos (Cuidados Paliativos)",
    "specialty": "Clínica Médica",
    "tema": "Cuidados Paliativos",
    "foco": "Princípios e Filosofia dos Cuidados Paliativos",
    "subfocos": [
      "Definição da OMS, Indicações Precoces e Ortogásia",
      "Avaliação do Sofrimento Global (Dor Total de Cicely Saunders)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cuidados Paliativos",
    "chips": [
      {
        "label": "Definição da OMS, Indicações Precoces e Ortogásia",
        "letter": "1",
        "value": "Conceito de alta relevância em Princípios e Filosofia dos Cuidados Paliativos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Avaliação do Sofrimento Global",
        "letter": "2",
        "value": "Conceito de alta relevância em Princípios e Filosofia dos Cuidados Paliativos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Princípios e Filosofia dos Cuidados Paliativos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Princípios e Filosofia dos Cuidados Paliativos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-manejo-da-dor-cronica-e-escada-anal",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Manejo da Dor Crônica e Escada Analgés",
    "fullTitle": "Manejo da Dor Crônica e Escada Analgésica da OMS (Cuidados Paliativos)",
    "specialty": "Clínica Médica",
    "tema": "Cuidados Paliativos",
    "foco": "Manejo da Dor Crônica e Escada Analgésica da OMS",
    "subfocos": [
      "Escada Analgésica da OMS para Dor Oncológica e Não-Oncológica",
      "Conversão de Opioides, Manejo de Efeitos Colaterais e Dor Incidental"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cuidados Paliativos",
    "chips": [
      {
        "label": "Escada Analgésica da OMS para Dor Oncológica e Não-Oncológica",
        "letter": "1",
        "value": "Conceito de alta relevância em Manejo da Dor Crônica e Escada Analgésica da OMS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Conversão de Opioides, Manejo de Efeitos Colaterais e Dor Incidental",
        "letter": "2",
        "value": "Conceito de alta relevância em Manejo da Dor Crônica e Escada Analgésica da OMS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Manejo da Dor Crônica e Escada Analgésica da OMS: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Manejo da Dor Crônica e Escada Analgésica da OMS: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-controle-de-sintomas-nao-dor",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Controle de Sintomas Não-Dor",
    "fullTitle": "Controle de Sintomas Não-Dor (Cuidados Paliativos)",
    "specialty": "Clínica Médica",
    "tema": "Cuidados Paliativos",
    "foco": "Controle de Sintomas Não-Dor (Dispneia, Náusea, Estertor, Agitação)",
    "subfocos": [
      "Dispneia Refratária em Cuidados Paliativos e Uso de Opioides",
      "Manejo de Sintomas Digestivos e Neuropsiquiátricos (Estertor Agônico)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cuidados Paliativos",
    "chips": [
      {
        "label": "Dispneia Refratária em Cuidados Paliativos e Uso de Opioides",
        "letter": "1",
        "value": "Conceito de alta relevância em Controle de Sintomas Não-Dor: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo de Sintomas Digestivos e Neuropsiquiátricos",
        "letter": "2",
        "value": "Conceito de alta relevância em Controle de Sintomas Não-Dor: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Controle de Sintomas Não-Dor: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Controle de Sintomas Não-Dor: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-sedacao-paliativa-e-comunicacao-em-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Sedação Paliativa e Comunicação em Fim",
    "fullTitle": "Sedação Paliativa e Comunicação em Fim de Vida (Cuidados Paliativos)",
    "specialty": "Clínica Médica",
    "tema": "Cuidados Paliativos",
    "foco": "Sedação Paliativa e Comunicação em Fim de Vida",
    "subfocos": [
      "Critérios Éticos e Indicações Formais de Sedação Paliativa",
      "Protocolos Farmacológicos de Sedação com Midazolam e Cuidados com a Família"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cuidados Paliativos",
    "chips": [
      {
        "label": "Critérios Éticos e Indicações Formais de Sedação Paliativa",
        "letter": "1",
        "value": "Conceito de alta relevância em Sedação Paliativa e Comunicação em Fim de Vida: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Protocolos Farmacológicos de Sedação com Midazolam e Cuidados com a Família",
        "letter": "2",
        "value": "Conceito de alta relevância em Sedação Paliativa e Comunicação em Fim de Vida: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Sedação Paliativa e Comunicação em Fim de Vida: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Sedação Paliativa e Comunicação em Fim de Vida: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-sindromes-toxicas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndromes Tóxicas",
    "fullTitle": "Síndromes Tóxicas (Toxicologia Clínica)",
    "specialty": "Clínica Médica",
    "tema": "Toxicologia Clínica",
    "foco": "Síndromes Tóxicas (Anticolinérgica, Colinérgica, Simpaticomimética, Opioide)",
    "subfocos": [
      "Síndrome Colinérgica e Síndrome Anticolinérgica",
      "Síndrome Simpaticomimética (Cocaína, Anfetaminas) vs Síndrome Serotoninérgica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Toxicologia Clínica",
    "chips": [
      {
        "label": "Síndrome Colinérgica e Síndrome Anticolinérgica",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndromes Tóxicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome Simpaticomimética",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndromes Tóxicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndromes Tóxicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndromes Tóxicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-intoxicacoes-por-medicamentos",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Intoxicações por Medicamentos",
    "fullTitle": "Intoxicações por Medicamentos (Toxicologia Clínica)",
    "specialty": "Clínica Médica",
    "tema": "Toxicologia Clínica",
    "foco": "Intoxicações por Medicamentos (Paracetamol, Benzodiazepínicos, Antidepressivos)",
    "subfocos": [
      "Intoxicação por Paracetamol (Acetaminofeno) e N-Acetilcisteína",
      "Intoxicação por Antidepressivos Tricíclicos (ADT) e Bicarbonato de Sódio"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Toxicologia Clínica",
    "chips": [
      {
        "label": "Intoxicação por Paracetamol",
        "letter": "1",
        "value": "Conceito de alta relevância em Intoxicações por Medicamentos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Intoxicação por Antidepressivos Tricíclicos",
        "letter": "2",
        "value": "Conceito de alta relevância em Intoxicações por Medicamentos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Intoxicações por Medicamentos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Intoxicações por Medicamentos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-acidentes-por-animais-peconhentos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Acidentes por Animais Peçonhentos",
    "fullTitle": "Acidentes por Animais Peçonhentos (Toxicologia Clínica)",
    "specialty": "Clínica Médica",
    "tema": "Toxicologia Clínica",
    "foco": "Acidentes por Animais Peçonhentos (Ofídico, Escorpiônico, Aracnídico)",
    "subfocos": [
      "Acidentes Ofídicos no Brasil: Botrópico, Crotálico, Laquético e Elapídico",
      "Escorpionismo (Tityus serrulatus) e Araneísmo (Loxosceles e Phoneutria)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Toxicologia Clínica",
    "chips": [
      {
        "label": "Acidentes Ofídicos no Brasil: Botrópico, Crotálico, Laquético e Elapídico",
        "letter": "1",
        "value": "Conceito de alta relevância em Acidentes por Animais Peçonhentos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Escorpionismo",
        "letter": "2",
        "value": "Conceito de alta relevância em Acidentes por Animais Peçonhentos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Acidentes por Animais Peçonhentos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Acidentes por Animais Peçonhentos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-intoxicacao-por-agrotoxicos-e-alcoo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Intoxicação por Agrotóxicos e Álcoois ",
    "fullTitle": "Intoxicação por Agrotóxicos e Álcoois Tóxicos (Toxicologia Clínica)",
    "specialty": "Clínica Médica",
    "tema": "Toxicologia Clínica",
    "foco": "Intoxicação por Agrotóxicos e Álcoois Tóxicos (Metanol, Etilenoglicol)",
    "subfocos": [
      "Intoxicação por Inibidores da Colinesterase (Organofosforados e Carbamatos)",
      "Álcoois Tóxicos: Metanol e Etilenoglicol (Fomepizol e Etanol)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Toxicologia Clínica",
    "chips": [
      {
        "label": "Intoxicação por Inibidores da Colinesterase",
        "letter": "1",
        "value": "Conceito de alta relevância em Intoxicação por Agrotóxicos e Álcoois Tóxicos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Álcoois Tóxicos: Metanol e Etilenoglicol",
        "letter": "2",
        "value": "Conceito de alta relevância em Intoxicação por Agrotóxicos e Álcoois Tóxicos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Intoxicação por Agrotóxicos e Álcoois Tóxicos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Intoxicação por Agrotóxicos e Álcoois Tóxicos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-clin-sindrome-coronariana-aguda-sem-supr",
    "category": "criterios",
    "categoryLabel": "Cardiologia • Critérios",
    "title": "Síndrome Coronariana Aguda sem Supra d",
    "fullTitle": "Síndrome Coronariana Aguda sem Supra de ST  e Angina Instável - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Síndromes Coronarianas Isquêmicas (Aguda e Crônica)",
    "subfocos": [
      "Síndrome Coronariana Aguda sem Supra de ST (SCASST) e Angina Instável"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Síndrome Coronariana Aguda sem Supra de ST  e Angina Instável."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Síndrome Coronariana Aguda sem Supra de ST  e Angina Instável, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Síndrome Coronariana Aguda sem Supra de ST  e Angina Instável com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-insuficiencia-cardiaca-agudamente-d",
    "category": "criterios",
    "categoryLabel": "Cardiologia • Critérios",
    "title": "Insuficiência Cardíaca Agudamente Desc",
    "fullTitle": "Insuficiência Cardíaca Agudamente Descompensada - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Insuficiência Cardíaca e Cardiomiopatias",
    "subfocos": [
      "Insuficiência Cardíaca Agudamente Descompensada"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Insuficiência Cardíaca Agudamente Descompensada."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Insuficiência Cardíaca Agudamente Descompensada, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Insuficiência Cardíaca Agudamente Descompensada com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-taquicardias-supraventriculares-par",
    "category": "criterios",
    "categoryLabel": "Cardiologia • Critérios",
    "title": "Taquicardias Supraventriculares Paroxí",
    "fullTitle": "Taquicardias Supraventriculares Paroxísticas - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Taquiarritmias e Bradiarritmias",
    "subfocos": [
      "Taquicardias Supraventriculares Paroxísticas"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Taquicardias Supraventriculares Paroxísticas."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Taquicardias Supraventriculares Paroxísticas, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Taquicardias Supraventriculares Paroxísticas com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-insuficiencia-mitral-e-estenose-mit",
    "category": "criterios",
    "categoryLabel": "Cardiologia • Critérios",
    "title": "Insuficiência Mitral e Estenose Mitral",
    "fullTitle": "Insuficiência Mitral e Estenose Mitral - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Doenças Valvares Cardíacas",
    "subfocos": [
      "Insuficiência Mitral e Estenose Mitral"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Insuficiência Mitral e Estenose Mitral."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Insuficiência Mitral e Estenose Mitral, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Insuficiência Mitral e Estenose Mitral com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-crise-hipertensiva",
    "category": "criterios",
    "categoryLabel": "Cardiologia • Critérios",
    "title": "Crise Hipertensiva",
    "fullTitle": "Crise Hipertensiva - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Hipertensão Arterial Sistêmica e Crise Hipertensiva",
    "subfocos": [
      "Crise Hipertensiva (Urgência vs Emergência Hipertensiva)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Crise Hipertensiva."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Crise Hipertensiva, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Crise Hipertensiva com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-endocardite-infecciosa",
    "category": "criterios",
    "categoryLabel": "Cardiologia • Critérios",
    "title": "Endocardite Infecciosa",
    "fullTitle": "Endocardite Infecciosa - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Doenças do Pericárdio e Endocardite Infecciosa",
    "subfocos": [
      "Endocardite Infecciosa"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Endocardite Infecciosa."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Endocardite Infecciosa, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Endocardite Infecciosa com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-cuidados-pos-parada-cardiorrespirat",
    "category": "criterios",
    "categoryLabel": "Cardiologia • Critérios",
    "title": "Cuidados Pós-Parada Cardiorrespiratóri",
    "fullTitle": "Cuidados Pós-Parada Cardiorrespiratória - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Cardiologia",
    "foco": "Parada Cardiorrespiratória e Ressuscitação (ACLS)",
    "subfocos": [
      "Cuidados Pós-Parada Cardiorrespiratória"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Cardiologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Cuidados Pós-Parada Cardiorrespiratória."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Cuidados Pós-Parada Cardiorrespiratória, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Cuidados Pós-Parada Cardiorrespiratória com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-doenca-pulmonar-obstrutiva-cronica",
    "category": "criterios",
    "categoryLabel": "Pneumologia • Critérios",
    "title": "Doença Pulmonar Obstrutiva Crônica",
    "fullTitle": "Doença Pulmonar Obstrutiva Crônica - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Obstrutivas das Vias Aéreas (Asma e DPOC)",
    "subfocos": [
      "Doença Pulmonar Obstrutiva Crônica (DPOC)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Doença Pulmonar Obstrutiva Crônica."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Doença Pulmonar Obstrutiva Crônica, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Doença Pulmonar Obstrutiva Crônica com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-abscesso-pulmonar-e-pneumonia-aspir",
    "category": "criterios",
    "categoryLabel": "Pneumologia • Critérios",
    "title": "Abscesso Pulmonar e Pneumonia Aspirati",
    "fullTitle": "Abscesso Pulmonar e Pneumonia Aspirativa - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Infecções Respiratórias Baixas (Pneumonias e Abscessos)",
    "subfocos": [
      "Abscesso Pulmonar e Pneumonia Aspirativa"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Abscesso Pulmonar e Pneumonia Aspirativa."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Abscesso Pulmonar e Pneumonia Aspirativa, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Abscesso Pulmonar e Pneumonia Aspirativa com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-hipertensao-pulmonar",
    "category": "criterios",
    "categoryLabel": "Pneumologia • Critérios",
    "title": "Hipertensão Pulmonar",
    "fullTitle": "Hipertensão Pulmonar - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Vasculares Pulmonares (TEP e Hipertensão Pulmonar)",
    "subfocos": [
      "Hipertensão Pulmonar"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Hipertensão Pulmonar."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Hipertensão Pulmonar, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Hipertensão Pulmonar com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-pneumotorax-espontaneo-no-adulto",
    "category": "criterios",
    "categoryLabel": "Pneumologia • Critérios",
    "title": "Pneumotórax Espontâneo no Adulto",
    "fullTitle": "Pneumotórax Espontâneo no Adulto - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Pleurais (Derrames e Pneumotórax)",
    "subfocos": [
      "Pneumotórax Espontâneo no Adulto"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Pneumotórax Espontâneo no Adulto."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Pneumotórax Espontâneo no Adulto, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Pneumotórax Espontâneo no Adulto com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-sarcoidose-e-pneumonite-por-hiperse",
    "category": "criterios",
    "categoryLabel": "Pneumologia • Critérios",
    "title": "Sarcoidose e Pneumonite por Hipersensi",
    "fullTitle": "Sarcoidose e Pneumonite por Hipersensibilidade - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Doenças Pulmonares Intersticiais e Fibrose",
    "subfocos": [
      "Sarcoidose e Pneumonite por Hipersensibilidade (PH)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Sarcoidose e Pneumonite por Hipersensibilidade."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Sarcoidose e Pneumonite por Hipersensibilidade, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Sarcoidose e Pneumonite por Hipersensibilidade com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-infeccao-latente-pelo-mycobacterium",
    "category": "criterios",
    "categoryLabel": "Pneumologia • Critérios",
    "title": "Infecção Latente pelo Mycobacterium tu",
    "fullTitle": "Infecção Latente pelo Mycobacterium tuberculosis - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Tuberculose Pulmonar e Micobacterioses",
    "subfocos": [
      "Infecção Latente pelo Mycobacterium tuberculosis (ILTB)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Infecção Latente pelo Mycobacterium tuberculosis."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Infecção Latente pelo Mycobacterium tuberculosis, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Infecção Latente pelo Mycobacterium tuberculosis com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-carcinoma-pulmonar-clinico-marcador",
    "category": "criterios",
    "categoryLabel": "Pneumologia • Critérios",
    "title": "Carcinoma Pulmonar Clínico: Marcadores",
    "fullTitle": "Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Pneumologia",
    "foco": "Neoplasias Pulmonares e Nódulo Pulmonar Solitário",
    "subfocos": [
      "Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Pneumologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Carcinoma Pulmonar Clínico: Marcadores Moleculares e Terapia-Alvo com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-doenca-ulcerosa-peptica-e-erradicac",
    "category": "criterios",
    "categoryLabel": "Gastroenterologia • Critérios",
    "title": "Doença Ulcerosa Péptica e Erradicação ",
    "fullTitle": "Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças Esofágicas e Gastroduodenais (DRGE, Úlcera e Gastrite)",
    "subfocos": [
      "Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Doença Ulcerosa Péptica e Erradicação do Helicobacter pylori com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-hemorragia-digestiva-baixa-divertic",
    "category": "criterios",
    "categoryLabel": "Gastroenterologia • Critérios",
    "title": "Hemorragia Digestiva Baixa : Divertícu",
    "fullTitle": "Hemorragia Digestiva Baixa : Divertículos, Angiodisplasia e Conduta - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Hemorragia Digestiva (Alta e Baixa)",
    "subfocos": [
      "Hemorragia Digestiva Baixa (HDB): Divertículos, Angiodisplasia e Conduta"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Hemorragia Digestiva Baixa : Divertículos, Angiodisplasia e Conduta."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Hemorragia Digestiva Baixa : Divertículos, Angiodisplasia e Conduta, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Hemorragia Digestiva Baixa : Divertículos, Angiodisplasia e Conduta com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-hepatite-autoimune-e-doenca-hepatic",
    "category": "criterios",
    "categoryLabel": "Gastroenterologia • Critérios",
    "title": "Hepatite Autoimune e Doença Hepática A",
    "fullTitle": "Hepatite Autoimune e Doença Hepática Alcoólica - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Hepatites Agudas e Crônicas (Virais, Tóxicas e Autoimunes)",
    "subfocos": [
      "Hepatite Autoimune e Doença Hepática Alcoólica"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Hepatite Autoimune e Doença Hepática Alcoólica."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Hepatite Autoimune e Doença Hepática Alcoólica, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Hepatite Autoimune e Doença Hepática Alcoólica com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-manejo-da-ascite-peritonite-bacteri",
    "category": "criterios",
    "categoryLabel": "Gastroenterologia • Critérios",
    "title": "Manejo da Ascite, Peritonite Bacterian",
    "fullTitle": "Manejo da Ascite, Peritonite Bacteriana Espontânea  e Encefalopatia Hepática - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Cirrose Hepática e Hipertensão Portal",
    "subfocos": [
      "Manejo da Ascite, Peritonite Bacteriana Espontânea (PBE) e Encefalopatia Hepática"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Manejo da Ascite, Peritonite Bacteriana Espontânea  e Encefalopatia Hepática."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Manejo da Ascite, Peritonite Bacteriana Espontânea  e Encefalopatia Hepática, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Manejo da Ascite, Peritonite Bacteriana Espontânea  e Encefalopatia Hepática com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-pancreatite-cronica-doencas-colesta",
    "category": "criterios",
    "categoryLabel": "Gastroenterologia • Critérios",
    "title": "Pancreatite Crônica, Doenças Colestáti",
    "fullTitle": "Pancreatite Crônica, Doenças Colestáticas - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças da Vesícula, Vias Biliares e Pancreatite",
    "subfocos": [
      "Pancreatite Crônica, Doenças Colestáticas (Cirrose Biliar Primária e CEP)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Pancreatite Crônica, Doenças Colestáticas."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Pancreatite Crônica, Doenças Colestáticas, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Pancreatite Crônica, Doenças Colestáticas com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-terapia-de-inducao-e-manutencao-e-m",
    "category": "criterios",
    "categoryLabel": "Gastroenterologia • Critérios",
    "title": "Terapia de Indução e Manutenção  e Meg",
    "fullTitle": "Terapia de Indução e Manutenção  e Megacólon Tóxico - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Doenças Inflamatórias Intestinais (Crohn e RCU)",
    "subfocos": [
      "Terapia de Indução e Manutenção (Biológicos) e Megacólon Tóxico"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Terapia de Indução e Manutenção  e Megacólon Tóxico."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Terapia de Indução e Manutenção  e Megacólon Tóxico, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Terapia de Indução e Manutenção  e Megacólon Tóxico com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-sindrome-do-intestino-irritavel-e-s",
    "category": "criterios",
    "categoryLabel": "Gastroenterologia • Critérios",
    "title": "Síndrome do Intestino Irritável  e Sup",
    "fullTitle": "Síndrome do Intestino Irritável  e Supercrescimento Bacteriano - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Gastroenterologia",
    "foco": "Síndromes Malabsortivas e Transtornos Funcionais Intestinais",
    "subfocos": [
      "Síndrome do Intestino Irritável (Critérios de Roma IV) e Supercrescimento Bacteriano (SIBO)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Gastroenterologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Síndrome do Intestino Irritável  e Supercrescimento Bacteriano."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Síndrome do Intestino Irritável  e Supercrescimento Bacteriano, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Síndrome do Intestino Irritável  e Supercrescimento Bacteriano com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-indicacoes-de-dialise-de-urgencia",
    "category": "criterios",
    "categoryLabel": "Nefrologia • Critérios",
    "title": "Indicações de Diálise de Urgência",
    "fullTitle": "Indicações de Diálise de Urgência - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Injúria Renal Aguda (LRA)",
    "subfocos": [
      "Indicações de Diálise de Urgência"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Indicações de Diálise de Urgência."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Indicações de Diálise de Urgência, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Indicações de Diálise de Urgência com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-manejo-das-complicacoes-uremicas-an",
    "category": "criterios",
    "categoryLabel": "Nefrologia • Critérios",
    "title": "Manejo das Complicações Urêmicas, Anem",
    "fullTitle": "Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Doença Renal Crônica (DRC) e Manejo Conservador/Dialítico",
    "subfocos": [
      "Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo (DMO-DRC)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Manejo das Complicações Urêmicas, Anemia e Distúrbio Mineral Ósseo com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-disturbios-do-potassio",
    "category": "criterios",
    "categoryLabel": "Nefrologia • Critérios",
    "title": "Distúrbios do Potássio",
    "fullTitle": "Distúrbios do Potássio - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Distúrbios Hidroeletrolíticos (Sódio, Potássio, Cálcio, Magnésio)",
    "subfocos": [
      "Distúrbios do Potássio (Hipercalemia e Hipocalemia)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Distúrbios do Potássio."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Distúrbios do Potássio, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Distúrbios do Potássio com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-clin-alcalose-metabolica-e-disturbios-re",
    "category": "criterios",
    "categoryLabel": "Nefrologia • Critérios",
    "title": "Alcalose Metabólica e Distúrbios Respi",
    "fullTitle": "Alcalose Metabólica e Distúrbios Respiratórios - Detalhamento de Prova",
    "specialty": "Clínica Médica",
    "tema": "Nefrologia",
    "foco": "Distúrbios do Equilíbrio Ácido-Base",
    "subfocos": [
      "Alcalose Metabólica e Distúrbios Respiratórios (Acidose e Alcalose)"
    ],
    "provenanceDefault": "Visto em Clínica Médica • Nefrologia",
    "chips": [
      {
        "label": "Definição Diagnóstica",
        "letter": "1",
        "value": "Critérios confirmatórios essenciais de Alcalose Metabólica e Distúrbios Respiratórios."
      },
      {
        "label": "Manejo Inicial",
        "letter": "2",
        "value": "Passo a passo terapêutico imediato recomendado pelas bancas oficiais."
      },
      {
        "label": "Armadilha Frequente",
        "letter": "3",
        "value": "Ponto de corte e detalhe técnico frequentemente alterado em enunciados de prova."
      }
    ],
    "rule": "Na abordagem de Alcalose Metabólica e Distúrbios Respiratórios, confirme a estabilidade hemodinâmica antes de instituir condutas invasivas.",
    "bancaTrap": "A banca costuma confundir a conduta de urgência em Alcalose Metabólica e Distúrbios Respiratórios com alternativas de seguimento ambulatorial crônico."
  },
  {
    "id": "tip-ciru-avaliacao-inicial-e-via-aerea-no-tr",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Avaliação Inicial e Via Aérea no Traum",
    "fullTitle": "Avaliação Inicial e Via Aérea no Trauma (Trauma e Atendimento Inicial)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Avaliação Inicial e Via Aérea no Trauma (A do ATLS)",
    "subfocos": [
      "Sistematização do Exame Primário (ABCDE do ATLS)",
      "Via Aérea Definitiva e Via Aérea Difícil no Trauma"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Trauma e Atendimento Inicial",
    "chips": [
      {
        "label": "Sistematização do Exame Primário",
        "letter": "1",
        "value": "Conceito de alta relevância em Avaliação Inicial e Via Aérea no Trauma: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Via Aérea Definitiva e Via Aérea Difícil no Trauma",
        "letter": "2",
        "value": "Conceito de alta relevância em Avaliação Inicial e Via Aérea no Trauma: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Avaliação Inicial e Via Aérea no Trauma: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Avaliação Inicial e Via Aérea no Trauma: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-trauma-toracico-com-risco-iminente-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trauma Torácico com Risco Iminente de ",
    "fullTitle": "Trauma Torácico com Risco Iminente de Morte (Trauma e Atendimento Inicial)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Torácico com Risco Iminente de Morte (Pneumotórax Hipertensivo/Aberto, Hemotórax Maciço, Tamponamento)",
    "subfocos": [
      "Pneumotórax Hipertensivo e Pneumotórax Aberto",
      "Hemotórax Maciço e Tamponamento Cardíaco",
      "Tórax Instável e Contusão Pulmonar"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Trauma e Atendimento Inicial",
    "chips": [
      {
        "label": "Pneumotórax Hipertensivo e Pneumotórax Aberto",
        "letter": "1",
        "value": "Conceito de alta relevância em Trauma Torácico com Risco Iminente de Morte: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hemotórax Maciço e Tamponamento Cardíaco",
        "letter": "2",
        "value": "Conceito de alta relevância em Trauma Torácico com Risco Iminente de Morte: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tórax Instável e Contusão Pulmonar",
        "letter": "3",
        "value": "Conceito de alta relevância em Trauma Torácico com Risco Iminente de Morte: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trauma Torácico com Risco Iminente de Morte: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trauma Torácico com Risco Iminente de Morte: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-trauma-abdominal-contuso-e-penetran",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trauma Abdominal Contuso e Penetrante",
    "fullTitle": "Trauma Abdominal Contuso e Penetrante (Trauma e Atendimento Inicial)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Abdominal Contuso e Penetrante (FAST e Laparotomia)",
    "subfocos": [
      "Avaliação por FAST e Lavado Peritoneal Diagnóstico",
      "Trauma Penetrante: Arma Branca vs Arma de Fogo",
      "Trauma de Baço e Fígado (Manejo Não Operatório - MNO)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Trauma e Atendimento Inicial",
    "chips": [
      {
        "label": "Avaliação por FAST e Lavado Peritoneal Diagnóstico",
        "letter": "1",
        "value": "Conceito de alta relevância em Trauma Abdominal Contuso e Penetrante: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Trauma Penetrante: Arma Branca vs Arma de Fogo",
        "letter": "2",
        "value": "Conceito de alta relevância em Trauma Abdominal Contuso e Penetrante: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Trauma de Baço e Fígado",
        "letter": "3",
        "value": "Conceito de alta relevância em Trauma Abdominal Contuso e Penetrante: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trauma Abdominal Contuso e Penetrante: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trauma Abdominal Contuso e Penetrante: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-trauma-cranioencefalico",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trauma Cranioencefálico",
    "fullTitle": "Trauma Cranioencefálico (Trauma e Atendimento Inicial)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Cranioencefálico (TCE Leve, Moderado e Grave)",
    "subfocos": [
      "Hematoma Extradural vs Hematoma Subdural Agudo",
      "Manejo da Hipertensão Intracraniana e Escala de Glasgow"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Trauma e Atendimento Inicial",
    "chips": [
      {
        "label": "Hematoma Extradural vs Hematoma Subdural Agudo",
        "letter": "1",
        "value": "Conceito de alta relevância em Trauma Cranioencefálico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo da Hipertensão Intracraniana e Escala de Glasgow",
        "letter": "2",
        "value": "Conceito de alta relevância em Trauma Cranioencefálico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trauma Cranioencefálico: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trauma Cranioencefálico: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-trauma-raquimedular",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trauma Raquimedular",
    "fullTitle": "Trauma Raquimedular (Trauma e Atendimento Inicial)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Raquimedular (TRM)",
    "subfocos": [
      "Avaliação Neurológica Inicial e Nível de Lesão (Escala ASIA)",
      "Imobilização, Propedêutica por Imagem e Indicações Cirúrgicas de Descompressão"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Trauma e Atendimento Inicial",
    "chips": [
      {
        "label": "Avaliação Neurológica Inicial e Nível de Lesão",
        "letter": "1",
        "value": "Conceito de alta relevância em Trauma Raquimedular: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Imobilização, Propedêutica por Imagem e Indicações Cirúrgicas de Descompressão",
        "letter": "2",
        "value": "Conceito de alta relevância em Trauma Raquimedular: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trauma Raquimedular: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trauma Raquimedular: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-trauma-pelvico-e-hemorragia-retrope",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trauma Pélvico e Hemorragia Retroperit",
    "fullTitle": "Trauma Pélvico e Hemorragia Retroperitoneal (Trauma e Atendimento Inicial)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Trauma Pélvico e Hemorragia Retroperitoneal",
    "subfocos": [
      "Mecanismo de Trauma, Classificação de Young-Burgess e Diagnóstico",
      "Estabilização Hemodinâmica, Lençol Pélvico, Fixador Externo e Angioembolização"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Trauma e Atendimento Inicial",
    "chips": [
      {
        "label": "Mecanismo de Trauma, Classificação de Young-Burgess e Diagnóstico",
        "letter": "1",
        "value": "Conceito de alta relevância em Trauma Pélvico e Hemorragia Retroperitoneal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Estabilização Hemodinâmica, Lençol Pélvico, Fixador Externo e Angioembolização",
        "letter": "2",
        "value": "Conceito de alta relevância em Trauma Pélvico e Hemorragia Retroperitoneal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trauma Pélvico e Hemorragia Retroperitoneal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trauma Pélvico e Hemorragia Retroperitoneal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-choque-no-trauma-e-ressuscitacao-he",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Choque no Trauma e Ressuscitação Hemos",
    "fullTitle": "Choque no Trauma e Ressuscitação Hemostática (Trauma e Atendimento Inicial)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Choque no Trauma e Ressuscitação Hemostática",
    "subfocos": [
      "Classificação do Choque Hemorrágico (Classes I a IV do ATLS)",
      "Hipotensão Permissiva e Alvos de Ressuscitação"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Trauma e Atendimento Inicial",
    "chips": [
      {
        "label": "Classificação do Choque Hemorrágico",
        "letter": "1",
        "value": "Conceito de alta relevância em Choque no Trauma e Ressuscitação Hemostática: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hipotensão Permissiva e Alvos de Ressuscitação",
        "letter": "2",
        "value": "Conceito de alta relevância em Choque no Trauma e Ressuscitação Hemostática: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Choque no Trauma e Ressuscitação Hemostática: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Choque no Trauma e Ressuscitação Hemostática: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cirurgia-de-controle-de-danos",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Cirurgia de Controle de Danos",
    "fullTitle": "Cirurgia de Controle de Danos (Trauma e Atendimento Inicial)",
    "specialty": "Cirurgia Geral",
    "tema": "Trauma e Atendimento Inicial",
    "foco": "Cirurgia de Controle de Danos (Damage Control)",
    "subfocos": [
      "As 3 Fases do Damage Control Surgery",
      "Síndrome Compartimental Abdominal (SCA)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Trauma e Atendimento Inicial",
    "chips": [
      {
        "label": "As 3 Fases do Damage Control Surgery",
        "letter": "1",
        "value": "Conceito de alta relevância em Cirurgia de Controle de Danos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome Compartimental Abdominal",
        "letter": "2",
        "value": "Conceito de alta relevância em Cirurgia de Controle de Danos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cirurgia de Controle de Danos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cirurgia de Controle de Danos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-abdome-agudo-inflamatorio",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abdome Agudo Inflamatório",
    "fullTitle": "Abdome Agudo Inflamatório (Abdome Agudo Cirúrgico)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Inflamatório",
    "subfocos": [
      "Apendicite Aguda",
      "Colecistite Aguda Litiásica e Alitiásica",
      "Diverticulite Aguda dos Cólons",
      "Pancreatite Aguda Necrosante Cirúrgica"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Abdome Agudo Cirúrgico",
    "chips": [
      {
        "label": "Apendicite Aguda",
        "letter": "1",
        "value": "Conceito de alta relevância em Abdome Agudo Inflamatório: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Colecistite Aguda Litiásica e Alitiásica",
        "letter": "2",
        "value": "Conceito de alta relevância em Abdome Agudo Inflamatório: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Diverticulite Aguda dos Cólons",
        "letter": "3",
        "value": "Conceito de alta relevância em Abdome Agudo Inflamatório: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Pancreatite Aguda Necrosante Cirúrgica",
        "letter": "4",
        "value": "Conceito de alta relevância em Abdome Agudo Inflamatório: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abdome Agudo Inflamatório: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abdome Agudo Inflamatório: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-abdome-agudo-obstrutivo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abdome Agudo Obstrutivo",
    "fullTitle": "Abdome Agudo Obstrutivo (Abdome Agudo Cirúrgico)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Obstrutivo",
    "subfocos": [
      "Obstrução Intestinal por Bridas e Aderências",
      "Volvo de Sigmoide e Ceco",
      "Neoplasia Colorretal Obstrutiva e Hérnias Encarceradas",
      "Íleo Paralítico vs Síndrome de Ogilvie (Pseudo-obstrução)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Abdome Agudo Cirúrgico",
    "chips": [
      {
        "label": "Obstrução Intestinal por Bridas e Aderências",
        "letter": "1",
        "value": "Conceito de alta relevância em Abdome Agudo Obstrutivo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Volvo de Sigmoide e Ceco",
        "letter": "2",
        "value": "Conceito de alta relevância em Abdome Agudo Obstrutivo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Neoplasia Colorretal Obstrutiva e Hérnias Encarceradas",
        "letter": "3",
        "value": "Conceito de alta relevância em Abdome Agudo Obstrutivo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Íleo Paralítico vs Síndrome de Ogilvie",
        "letter": "4",
        "value": "Conceito de alta relevância em Abdome Agudo Obstrutivo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abdome Agudo Obstrutivo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abdome Agudo Obstrutivo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-abdome-agudo-perfurativo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abdome Agudo Perfurativo",
    "fullTitle": "Abdome Agudo Perfurativo (Abdome Agudo Cirúrgico)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Perfurativo",
    "subfocos": [
      "Úlcera Péptica Perfurada (Gástrica e Duodenal)",
      "Perfuração de Cólon e Corpo Estranho Gastrointestinal"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Abdome Agudo Cirúrgico",
    "chips": [
      {
        "label": "Úlcera Péptica Perfurada",
        "letter": "1",
        "value": "Conceito de alta relevância em Abdome Agudo Perfurativo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Perfuração de Cólon e Corpo Estranho Gastrointestinal",
        "letter": "2",
        "value": "Conceito de alta relevância em Abdome Agudo Perfurativo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abdome Agudo Perfurativo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abdome Agudo Perfurativo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-abdome-agudo-vascular",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abdome Agudo Vascular",
    "fullTitle": "Abdome Agudo Vascular (Abdome Agudo Cirúrgico)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Vascular",
    "subfocos": [
      "Isquemia Mesentérica Aguda (Embolia e Trombose Arterial)",
      "Isquemia Mesentérica Não Oclusiva (IMNO) e Trombose Venosa Mesentérica",
      "Colite Isquêmica"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Abdome Agudo Cirúrgico",
    "chips": [
      {
        "label": "Isquemia Mesentérica Aguda",
        "letter": "1",
        "value": "Conceito de alta relevância em Abdome Agudo Vascular: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Isquemia Mesentérica Não Oclusiva",
        "letter": "2",
        "value": "Conceito de alta relevância em Abdome Agudo Vascular: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Colite Isquêmica",
        "letter": "3",
        "value": "Conceito de alta relevância em Abdome Agudo Vascular: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abdome Agudo Vascular: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abdome Agudo Vascular: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-abdome-agudo-hemorragico",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abdome Agudo Hemorrágico",
    "fullTitle": "Abdome Agudo Hemorrágico (Abdome Agudo Cirúrgico)",
    "specialty": "Cirurgia Geral",
    "tema": "Abdome Agudo Cirúrgico",
    "foco": "Abdome Agudo Hemorrágico",
    "subfocos": [
      "Rotura de Aneurisma de Aorta Abdominal (AAA)",
      "Rotura de Cisto Ovariano Hemorrágico e Gravidez Ectópica Rota Cirúrgica",
      "Rotura Espontânea de Neoplasias Hepáticas (Adenoma e Hepatocarcinoma)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Abdome Agudo Cirúrgico",
    "chips": [
      {
        "label": "Rotura de Aneurisma de Aorta Abdominal",
        "letter": "1",
        "value": "Conceito de alta relevância em Abdome Agudo Hemorrágico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Rotura de Cisto Ovariano Hemorrágico e Gravidez Ectópica Rota Cirúrgica",
        "letter": "2",
        "value": "Conceito de alta relevância em Abdome Agudo Hemorrágico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Rotura Espontânea de Neoplasias Hepáticas",
        "letter": "3",
        "value": "Conceito de alta relevância em Abdome Agudo Hemorrágico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abdome Agudo Hemorrágico: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abdome Agudo Hemorrágico: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cancer-gastrico",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer Gástrico",
    "fullTitle": "Câncer Gástrico (Cirurgia do Trato Gastrointestinal Alto)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Câncer Gástrico (Adenocarcinoma e GIST)",
    "subfocos": [
      "Adenocarcinoma Gástrico e Classificação de Lauren",
      "Estadiamento e Tratamento Cirúrgico com Linfadenectomia D2"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia do Trato Gastrointestinal Alto",
    "chips": [
      {
        "label": "Adenocarcinoma Gástrico e Classificação de Lauren",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer Gástrico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Estadiamento e Tratamento Cirúrgico com Linfadenectomia D2",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer Gástrico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer Gástrico: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer Gástrico: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-ulcera-peptica-e-complicacoes-cirur",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Úlcera Péptica e Complicações Cirúrgic",
    "fullTitle": "Úlcera Péptica e Complicações Cirúrgicas (Cirurgia do Trato Gastrointestinal Alto)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Úlcera Péptica e Complicações Cirúrgicas (Sangramento e Estenose)",
    "subfocos": [
      "Complicações Cirúrgicas da Doença Ulcerosa Péptica",
      "Síndromes Pós-Gastrectomia"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia do Trato Gastrointestinal Alto",
    "chips": [
      {
        "label": "Complicações Cirúrgicas da Doença Ulcerosa Péptica",
        "letter": "1",
        "value": "Conceito de alta relevância em Úlcera Péptica e Complicações Cirúrgicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndromes Pós-Gastrectomia",
        "letter": "2",
        "value": "Conceito de alta relevância em Úlcera Péptica e Complicações Cirúrgicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Úlcera Péptica e Complicações Cirúrgicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Úlcera Péptica e Complicações Cirúrgicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-doenca-do-refluxo-gastroesofagico-e",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença do Refluxo Gastroesofágico e Hé",
    "fullTitle": "Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica (Cirurgia do Trato Gastrointestinal Alto)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica",
    "subfocos": [
      "Indicações de Tratamento Cirúrgico da DRGE",
      "Fundoplicatura Laparoscópica (Técnicas)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia do Trato Gastrointestinal Alto",
    "chips": [
      {
        "label": "Indicações de Tratamento Cirúrgico da DRGE",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Fundoplicatura Laparoscópica",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença do Refluxo Gastroesofágico e Hérnia de Hiato Cirúrgica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-megaesofago-e-acalasia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Megaesôfago e Acalasia",
    "fullTitle": "Megaesôfago e Acalasia (Cirurgia do Trato Gastrointestinal Alto)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Megaesôfago e Acalasia",
    "subfocos": [
      "Fisiopatologia e Diagnóstico da Acalasia",
      "Classificação Radiológica de Rezende e Tratamento"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia do Trato Gastrointestinal Alto",
    "chips": [
      {
        "label": "Fisiopatologia e Diagnóstico da Acalasia",
        "letter": "1",
        "value": "Conceito de alta relevância em Megaesôfago e Acalasia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Classificação Radiológica de Rezende e Tratamento",
        "letter": "2",
        "value": "Conceito de alta relevância em Megaesôfago e Acalasia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Megaesôfago e Acalasia: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Megaesôfago e Acalasia: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cancer-de-esofago",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Esôfago",
    "fullTitle": "Câncer de Esôfago (Cirurgia do Trato Gastrointestinal Alto)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Câncer de Esôfago",
    "subfocos": [
      "Carcinoma Espinocelular (CEC) vs Adenocarcinoma",
      "Estadiamento e Tratamento Cirúrgico"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia do Trato Gastrointestinal Alto",
    "chips": [
      {
        "label": "Carcinoma Espinocelular",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Esôfago: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Estadiamento e Tratamento Cirúrgico",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Esôfago: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Esôfago: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Esôfago: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cirurgia-bariatrica-e-metabolica",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Cirurgia Bariátrica e Metabólica",
    "fullTitle": "Cirurgia Bariátrica e Metabólica (Cirurgia do Trato Gastrointestinal Alto)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia do Trato Gastrointestinal Alto",
    "foco": "Cirurgia Bariátrica e Metabólica",
    "subfocos": [
      "Indicações Formais e Critérios do CFM",
      "Técnicas Cirúrgicas e Complicações"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia do Trato Gastrointestinal Alto",
    "chips": [
      {
        "label": "Indicações Formais e Critérios do CFM",
        "letter": "1",
        "value": "Conceito de alta relevância em Cirurgia Bariátrica e Metabólica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Técnicas Cirúrgicas e Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Cirurgia Bariátrica e Metabólica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cirurgia Bariátrica e Metabólica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cirurgia Bariátrica e Metabólica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-colelitiase-e-coledocolitiase",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Colelitíase e Coledocolitíase",
    "fullTitle": "Colelitíase e Coledocolitíase (Cirurgia Hepato-Bilio-Pancreática)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Colelitíase e Coledocolitíase",
    "subfocos": [
      "Colelitíase Sintomática e Indicações Cirúrgicas",
      "Coledocolitíase: Diagnóstico e Estratégia Terapêutica"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Hepato-Bilio-Pancreática",
    "chips": [
      {
        "label": "Colelitíase Sintomática e Indicações Cirúrgicas",
        "letter": "1",
        "value": "Conceito de alta relevância em Colelitíase e Coledocolitíase: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Coledocolitíase: Diagnóstico e Estratégia Terapêutica",
        "letter": "2",
        "value": "Conceito de alta relevância em Colelitíase e Coledocolitíase: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Colelitíase e Coledocolitíase: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Colelitíase e Coledocolitíase: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-colangite-aguda",
    "category": "triades",
    "categoryLabel": "Tríades & Constelações",
    "title": "Colangite Aguda",
    "fullTitle": "Colangite Aguda (Cirurgia Hepato-Bilio-Pancreática)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Colangite Aguda (Tríade de Charcot e Pêntade de Reynolds)",
    "subfocos": [
      "Colangite Aguda Não Supurativa (Tríade de Charcot)",
      "Colangite Aguda Grave Supurativa (Pêntade de Reynolds)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Hepato-Bilio-Pancreática",
    "chips": [
      {
        "label": "Colangite Aguda Não Supurativa",
        "letter": "1",
        "value": "Conceito de alta relevância em Colangite Aguda: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Colangite Aguda Grave Supurativa",
        "letter": "2",
        "value": "Conceito de alta relevância em Colangite Aguda: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Colangite Aguda: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Colangite Aguda: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-neoplasias-malignas-da-vesicula-e-v",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Neoplasias Malignas da Vesícula e Vias",
    "fullTitle": "Neoplasias Malignas da Vesícula e Vias Biliares (Cirurgia Hepato-Bilio-Pancreática)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Neoplasias Malignas da Vesícula e Vias Biliares (Colangiocarcinoma)",
    "subfocos": [
      "Colangiocarcinoma e Tumor de Klatskin",
      "Câncer de Vesícula Biliar"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Hepato-Bilio-Pancreática",
    "chips": [
      {
        "label": "Colangiocarcinoma e Tumor de Klatskin",
        "letter": "1",
        "value": "Conceito de alta relevância em Neoplasias Malignas da Vesícula e Vias Biliares: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Câncer de Vesícula Biliar",
        "letter": "2",
        "value": "Conceito de alta relevância em Neoplasias Malignas da Vesícula e Vias Biliares: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Neoplasias Malignas da Vesícula e Vias Biliares: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Neoplasias Malignas da Vesícula e Vias Biliares: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-tumores-hepaticos-benignos-e-malign",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Tumores Hepáticos Benignos e Malignos",
    "fullTitle": "Tumores Hepáticos Benignos e Malignos (Cirurgia Hepato-Bilio-Pancreática)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Tumores Hepáticos Benignos e Malignos (Carcinoma Hepatocelular e Metástases)",
    "subfocos": [
      "Tumores Benignos do Fígado (Hemangioma, HNF e Adenoma)",
      "Carcinoma Hepatocelular (CHC) e Critérios de Milão"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Hepato-Bilio-Pancreática",
    "chips": [
      {
        "label": "Tumores Benignos do Fígado",
        "letter": "1",
        "value": "Conceito de alta relevância em Tumores Hepáticos Benignos e Malignos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Carcinoma Hepatocelular",
        "letter": "2",
        "value": "Conceito de alta relevância em Tumores Hepáticos Benignos e Malignos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Tumores Hepáticos Benignos e Malignos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Tumores Hepáticos Benignos e Malignos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-abscessos-hepaticos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abscessos Hepáticos",
    "fullTitle": "Abscessos Hepáticos (Cirurgia Hepato-Bilio-Pancreática)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Abscessos Hepáticos (Amebiano e Piogênico)",
    "subfocos": [
      "Abscesso Hepático Piogênico vs Amebiano",
      "Cisto Hidático Hepático (Equinococose)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Hepato-Bilio-Pancreática",
    "chips": [
      {
        "label": "Abscesso Hepático Piogênico vs Amebiano",
        "letter": "1",
        "value": "Conceito de alta relevância em Abscessos Hepáticos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cisto Hidático Hepático",
        "letter": "2",
        "value": "Conceito de alta relevância em Abscessos Hepáticos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abscessos Hepáticos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abscessos Hepáticos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-neoplasias-do-pancreas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Neoplasias do Pâncreas",
    "fullTitle": "Neoplasias do Pâncreas (Cirurgia Hepato-Bilio-Pancreática)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Neoplasias do Pâncreas (Adenocarcinoma e Neoplasias Císticas)",
    "subfocos": [
      "Adenocarcinoma de Cabeça de Pâncreas",
      "Neoplasias Císticas do Pâncreas (IPMN, Cistoadenoma)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Hepato-Bilio-Pancreática",
    "chips": [
      {
        "label": "Adenocarcinoma de Cabeça de Pâncreas",
        "letter": "1",
        "value": "Conceito de alta relevância em Neoplasias do Pâncreas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Neoplasias Císticas do Pâncreas",
        "letter": "2",
        "value": "Conceito de alta relevância em Neoplasias do Pâncreas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Neoplasias do Pâncreas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Neoplasias do Pâncreas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cistos-e-anomalias-congenitas-da-vi",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cistos e Anomalias Congênitas da Via B",
    "fullTitle": "Cistos e Anomalias Congênitas da Via Biliar (Cirurgia Hepato-Bilio-Pancreática)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Hepato-Bilio-Pancreática",
    "foco": "Cistos e Anomalias Congênitas da Via Biliar",
    "subfocos": [
      "Cistos de Colédoco e Classificação de Todani",
      "Doença de Caroli (Todani Tipo V)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Hepato-Bilio-Pancreática",
    "chips": [
      {
        "label": "Cistos de Colédoco e Classificação de Todani",
        "letter": "1",
        "value": "Conceito de alta relevância em Cistos e Anomalias Congênitas da Via Biliar: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Doença de Caroli",
        "letter": "2",
        "value": "Conceito de alta relevância em Cistos e Anomalias Congênitas da Via Biliar: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cistos e Anomalias Congênitas da Via Biliar: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cistos e Anomalias Congênitas da Via Biliar: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cancer-de-colon",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Cólon",
    "fullTitle": "Câncer de Cólon (Coloproctologia e Doenças Orificiais)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Câncer de Cólon",
    "subfocos": [
      "Quadro Clínico por Topografia (Cólon Direito vs Esquerdo)",
      "Tratamento Cirúrgico Oncológico do Câncer de Cólon"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Coloproctologia e Doenças Orificiais",
    "chips": [
      {
        "label": "Quadro Clínico por Topografia",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Cólon: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Cirúrgico Oncológico do Câncer de Cólon",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Cólon: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Cólon: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Cólon: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cancer-de-reto-e-canal-anal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Reto e Canal Anal",
    "fullTitle": "Câncer de Reto e Canal Anal (Coloproctologia e Doenças Orificiais)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Câncer de Reto e Canal Anal",
    "subfocos": [
      "Câncer de Reto: Terapia Neoadjuvante e Margem Distal",
      "Câncer de Canal Anal (Carcinoma Epidermoide)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Coloproctologia e Doenças Orificiais",
    "chips": [
      {
        "label": "Câncer de Reto: Terapia Neoadjuvante e Margem Distal",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Reto e Canal Anal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Câncer de Canal Anal",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Reto e Canal Anal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Reto e Canal Anal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Reto e Canal Anal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-doenca-hemorroidaria",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença Hemorroidária",
    "fullTitle": "Doença Hemorroidária (Coloproctologia e Doenças Orificiais)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Doença Hemorroidária",
    "subfocos": [
      "Hemorroidas Internas e Classificação em Graus I a IV",
      "Tratamento Cirúrgico e Trombose Hemorroidária Externa"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Coloproctologia e Doenças Orificiais",
    "chips": [
      {
        "label": "Hemorroidas Internas e Classificação em Graus I a IV",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Hemorroidária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Cirúrgico e Trombose Hemorroidária Externa",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Hemorroidária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Hemorroidária: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Hemorroidária: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-fissura-anal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Fissura Anal",
    "fullTitle": "Fissura Anal (Coloproctologia e Doenças Orificiais)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Fissura Anal",
    "subfocos": [
      "Fissura Anal Aguda vs Crônica",
      "Tratamento Clínico e Esfincterotomia"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Coloproctologia e Doenças Orificiais",
    "chips": [
      {
        "label": "Fissura Anal Aguda vs Crônica",
        "letter": "1",
        "value": "Conceito de alta relevância em Fissura Anal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Clínico e Esfincterotomia",
        "letter": "2",
        "value": "Conceito de alta relevância em Fissura Anal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Fissura Anal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Fissura Anal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-abscessos-anorretais-e-fistulas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abscessos Anorretais e Fístulas",
    "fullTitle": "Abscessos Anorretais e Fístulas (Coloproctologia e Doenças Orificiais)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Abscessos Anorretais e Fístulas",
    "subfocos": [
      "Abscesso Perianal e Isquiorretal",
      "Fístulas Anorretais e Regra de Goodsall-Salmon"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Coloproctologia e Doenças Orificiais",
    "chips": [
      {
        "label": "Abscesso Perianal e Isquiorretal",
        "letter": "1",
        "value": "Conceito de alta relevância em Abscessos Anorretais e Fístulas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Fístulas Anorretais e Regra de Goodsall-Salmon",
        "letter": "2",
        "value": "Conceito de alta relevância em Abscessos Anorretais e Fístulas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abscessos Anorretais e Fístulas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abscessos Anorretais e Fístulas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-doenca-pilonidal-sacrococcigea",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença Pilonidal Sacrococcígea",
    "fullTitle": "Doença Pilonidal Sacrococcígea (Coloproctologia e Doenças Orificiais)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Doença Pilonidal Sacrococcígea",
    "subfocos": [
      "Quadro Clínico e Manejo da Crise Aguda",
      "Tratamento Definitivo da Doença Crônica"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Coloproctologia e Doenças Orificiais",
    "chips": [
      {
        "label": "Quadro Clínico e Manejo da Crise Aguda",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Pilonidal Sacrococcígea: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Definitivo da Doença Crônica",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Pilonidal Sacrococcígea: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Pilonidal Sacrococcígea: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Pilonidal Sacrococcígea: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-megacolon-chagasico-e-volvo-de-sigm",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Megacólon Chagásico e Volvo de Sigmoid",
    "fullTitle": "Megacólon Chagásico e Volvo de Sigmoide (Coloproctologia e Doenças Orificiais)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Megacólon Chagásico e Volvo de Sigmoide",
    "subfocos": [
      "Megacólon Chagásico e Constipação Crônica",
      "Volvo de Sigmoide Recorrente"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Coloproctologia e Doenças Orificiais",
    "chips": [
      {
        "label": "Megacólon Chagásico e Constipação Crônica",
        "letter": "1",
        "value": "Conceito de alta relevância em Megacólon Chagásico e Volvo de Sigmoide: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Volvo de Sigmoide Recorrente",
        "letter": "2",
        "value": "Conceito de alta relevância em Megacólon Chagásico e Volvo de Sigmoide: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Megacólon Chagásico e Volvo de Sigmoide: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Megacólon Chagásico e Volvo de Sigmoide: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-prolapso-retal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Prolapso Retal",
    "fullTitle": "Prolapso Retal (Coloproctologia e Doenças Orificiais)",
    "specialty": "Cirurgia Geral",
    "tema": "Coloproctologia e Doenças Orificiais",
    "foco": "Prolapso Retal",
    "subfocos": [
      "Prolapso Retal Completo vs Prolapso Mucoso",
      "Abordagem Cirúrgica Abdominal vs Perineal"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Coloproctologia e Doenças Orificiais",
    "chips": [
      {
        "label": "Prolapso Retal Completo vs Prolapso Mucoso",
        "letter": "1",
        "value": "Conceito de alta relevância em Prolapso Retal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Abordagem Cirúrgica Abdominal vs Perineal",
        "letter": "2",
        "value": "Conceito de alta relevância em Prolapso Retal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Prolapso Retal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Prolapso Retal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-hernia-inguinal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hérnia Inguinal",
    "fullTitle": "Hérnia Inguinal (Hérnias e Parede Abdominal)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnia Inguinal (Indireta e Direta)",
    "subfocos": [
      "Anatomia Cirúrgica e Diferenciação Indireta vs Direta",
      "Técnicas de Correção Cirúrgica (Herniorrafia)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Hérnias e Parede Abdominal",
    "chips": [
      {
        "label": "Anatomia Cirúrgica e Diferenciação Indireta vs Direta",
        "letter": "1",
        "value": "Conceito de alta relevância em Hérnia Inguinal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Técnicas de Correção Cirúrgica",
        "letter": "2",
        "value": "Conceito de alta relevância em Hérnia Inguinal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hérnia Inguinal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hérnia Inguinal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-hernia-femoral",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hérnia Femoral",
    "fullTitle": "Hérnia Femoral (Hérnias e Parede Abdominal)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnia Femoral (Crural)",
    "subfocos": [
      "Anatomia e Risco Elevado de Estrangulamento",
      "Diagnóstico Diferencial da Massa Inguinocrural"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Hérnias e Parede Abdominal",
    "chips": [
      {
        "label": "Anatomia e Risco Elevado de Estrangulamento",
        "letter": "1",
        "value": "Conceito de alta relevância em Hérnia Femoral: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Diagnóstico Diferencial da Massa Inguinocrural",
        "letter": "2",
        "value": "Conceito de alta relevância em Hérnia Femoral: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hérnia Femoral: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hérnia Femoral: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-hernia-incisional-e-evisceracao",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hérnia Incisional e Evisceração",
    "fullTitle": "Hérnia Incisional e Evisceração (Hérnias e Parede Abdominal)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnia Incisional e Evisceração",
    "subfocos": [
      "Fatores de Risco e Correção da Hérnia Incisional",
      "Evisceração Pós-Operatória Aguda"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Hérnias e Parede Abdominal",
    "chips": [
      {
        "label": "Fatores de Risco e Correção da Hérnia Incisional",
        "letter": "1",
        "value": "Conceito de alta relevância em Hérnia Incisional e Evisceração: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Evisceração Pós-Operatória Aguda",
        "letter": "2",
        "value": "Conceito de alta relevância em Hérnia Incisional e Evisceração: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hérnia Incisional e Evisceração: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hérnia Incisional e Evisceração: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-hernia-umbilical-e-epigastrica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hérnia Umbilical e Epigástrica",
    "fullTitle": "Hérnia Umbilical e Epigástrica (Hérnias e Parede Abdominal)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnia Umbilical e Epigástrica",
    "subfocos": [
      "Hérnia Umbilical no Adulto vs na Criança",
      "Hérnia Epigástrica e Diástase dos Retos"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Hérnias e Parede Abdominal",
    "chips": [
      {
        "label": "Hérnia Umbilical no Adulto vs na Criança",
        "letter": "1",
        "value": "Conceito de alta relevância em Hérnia Umbilical e Epigástrica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hérnia Epigástrica e Diástase dos Retos",
        "letter": "2",
        "value": "Conceito de alta relevância em Hérnia Umbilical e Epigástrica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hérnia Umbilical e Epigástrica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hérnia Umbilical e Epigástrica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-hernias-raras",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hérnias Raras",
    "fullTitle": "Hérnias Raras (Hérnias e Parede Abdominal)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnias Raras (Spiegel, Obturadora, Lombar)",
    "subfocos": [
      "Hérnia de Spiegel, Obturadora e Lombares",
      "Hérnias Especiais com Conteúdo Específico"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Hérnias e Parede Abdominal",
    "chips": [
      {
        "label": "Hérnia de Spiegel, Obturadora e Lombares",
        "letter": "1",
        "value": "Conceito de alta relevância em Hérnias Raras: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hérnias Especiais com Conteúdo Específico",
        "letter": "2",
        "value": "Conceito de alta relevância em Hérnias Raras: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hérnias Raras: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hérnias Raras: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-hernias-estranguladas-e-encarcerada",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hérnias Estranguladas e Encarceradas",
    "fullTitle": "Hérnias Estranguladas e Encarceradas (Hérnias e Parede Abdominal)",
    "specialty": "Cirurgia Geral",
    "tema": "Hérnias e Parede Abdominal",
    "foco": "Hérnias Estranguladas e Encarceradas",
    "subfocos": [
      "Diferenciação Encarceramento vs Estrangulamento",
      "Conduta Cirúrgica de Emergência"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Hérnias e Parede Abdominal",
    "chips": [
      {
        "label": "Diferenciação Encarceramento vs Estrangulamento",
        "letter": "1",
        "value": "Conceito de alta relevância em Hérnias Estranguladas e Encarceradas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Conduta Cirúrgica de Emergência",
        "letter": "2",
        "value": "Conceito de alta relevância em Hérnias Estranguladas e Encarceradas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hérnias Estranguladas e Encarceradas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hérnias Estranguladas e Encarceradas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-avaliacao-de-risco-cirurgico-e-card",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Avaliação de Risco Cirúrgico e Cardiop",
    "fullTitle": "Avaliação de Risco Cirúrgico e Cardiopulmonar (Princípios Cirúrgicos e Cuidados Perioperatórios)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Avaliação de Risco Cirúrgico e Cardiopulmonar",
    "subfocos": [
      "Escores Cardiovasculares (Índice de Lee / RCRI)",
      "Classificação do Estado Físico ASA"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Princípios Cirúrgicos e Cuidados Perioperatórios",
    "chips": [
      {
        "label": "Escores Cardiovasculares",
        "letter": "1",
        "value": "Conceito de alta relevância em Avaliação de Risco Cirúrgico e Cardiopulmonar: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Classificação do Estado Físico ASA",
        "letter": "2",
        "value": "Conceito de alta relevância em Avaliação de Risco Cirúrgico e Cardiopulmonar: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Avaliação de Risco Cirúrgico e Cardiopulmonar: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Avaliação de Risco Cirúrgico e Cardiopulmonar: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cicatrizacao-fisiologia-das-feridas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cicatrização, Fisiologia das Feridas e",
    "fullTitle": "Cicatrização, Fisiologia das Feridas e Queloides (Princípios Cirúrgicos e Cuidados Perioperatórios)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Cicatrização, Fisiologia das Feridas e Queloides",
    "subfocos": [
      "Fases da Cicatrização e Fatores de Interferência",
      "Cicatrizes Patológicas: Queloide vs Cicatriz Hipertrófica"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Princípios Cirúrgicos e Cuidados Perioperatórios",
    "chips": [
      {
        "label": "Fases da Cicatrização e Fatores de Interferência",
        "letter": "1",
        "value": "Conceito de alta relevância em Cicatrização, Fisiologia das Feridas e Queloides: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cicatrizes Patológicas: Queloide vs Cicatriz Hipertrófica",
        "letter": "2",
        "value": "Conceito de alta relevância em Cicatrização, Fisiologia das Feridas e Queloides: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cicatrização, Fisiologia das Feridas e Queloides: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cicatrização, Fisiologia das Feridas e Queloides: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-infeccao-de-sitio-cirurgico-e-profi",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecção de Sítio Cirúrgico  e Profila",
    "fullTitle": "Infecção de Sítio Cirúrgico  e Profilaxia Antibiótica (Princípios Cirúrgicos e Cuidados Perioperatórios)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Infecção de Sítio Cirúrgico (ISC) e Profilaxia Antibiótica",
    "subfocos": [
      "Classificação CDC da ISC e Cirurgias por Potencial de Contaminação",
      "Profilaxia Antibiótica em Cirurgia"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Princípios Cirúrgicos e Cuidados Perioperatórios",
    "chips": [
      {
        "label": "Classificação CDC da ISC e Cirurgias por Potencial de Contaminação",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecção de Sítio Cirúrgico  e Profilaxia Antibiótica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Profilaxia Antibiótica em Cirurgia",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecção de Sítio Cirúrgico  e Profilaxia Antibiótica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecção de Sítio Cirúrgico  e Profilaxia Antibiótica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecção de Sítio Cirúrgico  e Profilaxia Antibiótica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-complicacoes-pos-operatorias",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Complicações Pós-Operatórias",
    "fullTitle": "Complicações Pós-Operatórias (Princípios Cirúrgicos e Cuidados Perioperatórios)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Complicações Pós-Operatórias (Febre, Atelectasia, TVP/TEP, Deiscência)",
    "subfocos": [
      "Febre Pós-Operatória (Mnemônico dos 5 Ws)",
      "Prevenção e Profilaxia de TVP/TEP no Paciente Cirúrgico"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Princípios Cirúrgicos e Cuidados Perioperatórios",
    "chips": [
      {
        "label": "Febre Pós-Operatória",
        "letter": "1",
        "value": "Conceito de alta relevância em Complicações Pós-Operatórias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Prevenção e Profilaxia de TVP/TEP no Paciente Cirúrgico",
        "letter": "2",
        "value": "Conceito de alta relevância em Complicações Pós-Operatórias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Complicações Pós-Operatórias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Complicações Pós-Operatórias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-resposta-endocrino-metabolica-ao-tr",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Resposta Endócrino-Metabólica ao Traum",
    "fullTitle": "Resposta Endócrino-Metabólica ao Trauma (Princípios Cirúrgicos e Cuidados Perioperatórios)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Resposta Endócrino-Metabólica ao Trauma (REMIT)",
    "subfocos": [
      "Fisiopatologia Hormonal e Mediadores da REMIT",
      "Protocolos Multimodais de Aceleração da Recuperação (ERAS / ACERTO)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Princípios Cirúrgicos e Cuidados Perioperatórios",
    "chips": [
      {
        "label": "Fisiopatologia Hormonal e Mediadores da REMIT",
        "letter": "1",
        "value": "Conceito de alta relevância em Resposta Endócrino-Metabólica ao Trauma: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Protocolos Multimodais de Aceleração da Recuperação",
        "letter": "2",
        "value": "Conceito de alta relevância em Resposta Endócrino-Metabólica ao Trauma: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Resposta Endócrino-Metabólica ao Trauma: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Resposta Endócrino-Metabólica ao Trauma: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-tecnica-cirurgica-fios-e-drenos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Técnica Cirúrgica, Fios e Drenos",
    "fullTitle": "Técnica Cirúrgica, Fios e Drenos (Princípios Cirúrgicos e Cuidados Perioperatórios)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Técnica Cirúrgica, Fios e Drenos",
    "subfocos": [
      "Fios Cirúrgicos (Absorvíveis vs Inabsorvíveis)",
      "Drenos Cirúrgicos (Laminares vs Sucção Fechada)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Princípios Cirúrgicos e Cuidados Perioperatórios",
    "chips": [
      {
        "label": "Fios Cirúrgicos",
        "letter": "1",
        "value": "Conceito de alta relevância em Técnica Cirúrgica, Fios e Drenos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Drenos Cirúrgicos",
        "letter": "2",
        "value": "Conceito de alta relevância em Técnica Cirúrgica, Fios e Drenos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Técnica Cirúrgica, Fios e Drenos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Técnica Cirúrgica, Fios e Drenos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-suporte-nutricional-no-perioperator",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Suporte Nutricional no Perioperatório",
    "fullTitle": "Suporte Nutricional no Perioperatório (Princípios Cirúrgicos e Cuidados Perioperatórios)",
    "specialty": "Cirurgia Geral",
    "tema": "Princípios Cirúrgicos e Cuidados Perioperatórios",
    "foco": "Suporte Nutricional no Perioperatório",
    "subfocos": [
      "Nutrição Enteral vs Parenteral no Paciente Cirúrgico",
      "Síndrome de Realimentação e Imunonutrição"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Princípios Cirúrgicos e Cuidados Perioperatórios",
    "chips": [
      {
        "label": "Nutrição Enteral vs Parenteral no Paciente Cirúrgico",
        "letter": "1",
        "value": "Conceito de alta relevância em Suporte Nutricional no Perioperatório: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome de Realimentação e Imunonutrição",
        "letter": "2",
        "value": "Conceito de alta relevância em Suporte Nutricional no Perioperatório: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Suporte Nutricional no Perioperatório: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Suporte Nutricional no Perioperatório: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-doenca-arterial-obstrutiva-periferi",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença Arterial Obstrutiva Periférica",
    "fullTitle": "Doença Arterial Obstrutiva Periférica (Doenças Vasculares Cirúrgicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Doença Arterial Obstrutiva Periférica (DAOP)",
    "subfocos": [
      "Fisiopatologia, Exame Físico e Classificação de Rutherford / Fontaine",
      "Tratamento Clínico de Otimização e Revascularização Cirúrgica / Endovascular"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Doenças Vasculares Cirúrgicas",
    "chips": [
      {
        "label": "Fisiopatologia, Exame Físico e Classificação de Rutherford / Fontaine",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Arterial Obstrutiva Periférica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Clínico de Otimização e Revascularização Cirúrgica / Endovascular",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Arterial Obstrutiva Periférica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Arterial Obstrutiva Periférica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Arterial Obstrutiva Periférica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-isquemia-arterial-aguda-de-membros",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Isquemia Arterial Aguda de Membros",
    "fullTitle": "Isquemia Arterial Aguda de Membros (Doenças Vasculares Cirúrgicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Isquemia Arterial Aguda de Membros",
    "subfocos": [
      "Tétrade/Hexade dos 6 'Ps' e Diagnóstico Diferencial (Êmbolo vs Trombo)",
      "Classificação de Rutherford da Isquemia Aguda e Cirurgia de Urgência"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Doenças Vasculares Cirúrgicas",
    "chips": [
      {
        "label": "Tétrade/Hexade dos 6 'Ps' e Diagnóstico Diferencial",
        "letter": "1",
        "value": "Conceito de alta relevância em Isquemia Arterial Aguda de Membros: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Classificação de Rutherford da Isquemia Aguda e Cirurgia de Urgência",
        "letter": "2",
        "value": "Conceito de alta relevância em Isquemia Arterial Aguda de Membros: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Isquemia Arterial Aguda de Membros: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Isquemia Arterial Aguda de Membros: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-aneurisma-de-aorta-abdominal-e-tora",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Aneurisma de Aorta Abdominal  e Toráci",
    "fullTitle": "Aneurisma de Aorta Abdominal  e Torácica (Doenças Vasculares Cirúrgicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Aneurisma de Aorta Abdominal (AAA) e Torácica",
    "subfocos": [
      "Epidemiologia, Rastreamento e Indicações Cirúrgicas Eletivas",
      "Aneurisma Roto (Emergência Cirúrgica) e Técnicas (Aberta vs EVAR)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Doenças Vasculares Cirúrgicas",
    "chips": [
      {
        "label": "Epidemiologia, Rastreamento e Indicações Cirúrgicas Eletivas",
        "letter": "1",
        "value": "Conceito de alta relevância em Aneurisma de Aorta Abdominal  e Torácica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Aneurisma Roto",
        "letter": "2",
        "value": "Conceito de alta relevância em Aneurisma de Aorta Abdominal  e Torácica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Aneurisma de Aorta Abdominal  e Torácica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Aneurisma de Aorta Abdominal  e Torácica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-doenca-carotidea-extracraniana-ciru",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença Carotídea Extracraniana Cirúrgi",
    "fullTitle": "Doença Carotídea Extracraniana Cirúrgica (Doenças Vasculares Cirúrgicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Doença Carotídea Extracraniana Cirúrgica",
    "subfocos": [
      "Estenose Carotídea Assintomática vs Sintomática (AIT / AVC)",
      "Endarterectomia Carotídea vs Angioplastia com Stent e Complicações"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Doenças Vasculares Cirúrgicas",
    "chips": [
      {
        "label": "Estenose Carotídea Assintomática vs Sintomática",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Carotídea Extracraniana Cirúrgica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Endarterectomia Carotídea vs Angioplastia com Stent e Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Carotídea Extracraniana Cirúrgica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Carotídea Extracraniana Cirúrgica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Carotídea Extracraniana Cirúrgica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-insuficiencia-venosa-cronica-e-vari",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Insuficiência Venosa Crônica e Varizes",
    "fullTitle": "Insuficiência Venosa Crônica e Varizes de Membros Inferiores (Doenças Vasculares Cirúrgicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Insuficiência Venosa Crônica e Varizes de Membros Inferiores",
    "subfocos": [
      "Fisiopatologia, Classificação CEAP e Propedêutica",
      "Manejo Clínico Conservador e Tratamento Cirúrgico / Termoablação"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Doenças Vasculares Cirúrgicas",
    "chips": [
      {
        "label": "Fisiopatologia, Classificação CEAP e Propedêutica",
        "letter": "1",
        "value": "Conceito de alta relevância em Insuficiência Venosa Crônica e Varizes de Membros Inferiores: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Clínico Conservador e Tratamento Cirúrgico / Termoablação",
        "letter": "2",
        "value": "Conceito de alta relevância em Insuficiência Venosa Crônica e Varizes de Membros Inferiores: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Insuficiência Venosa Crônica e Varizes de Membros Inferiores: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Insuficiência Venosa Crônica e Varizes de Membros Inferiores: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-trombose-venosa-profunda-e-filtros-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trombose Venosa Profunda  e Filtros de",
    "fullTitle": "Trombose Venosa Profunda  e Filtros de Veia Cava (Doenças Vasculares Cirúrgicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Trombose Venosa Profunda (TVP) e Filtros de Veia Cava",
    "subfocos": [
      "Escore de Wells, Dímero-D e Doppler Venoso de Membros Inferiores",
      "Protocolos de Anticoagulação Plena e Filtro de Veia Cava Inferior"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Doenças Vasculares Cirúrgicas",
    "chips": [
      {
        "label": "Escore de Wells, Dímero-D e Doppler Venoso de Membros Inferiores",
        "letter": "1",
        "value": "Conceito de alta relevância em Trombose Venosa Profunda  e Filtros de Veia Cava: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Protocolos de Anticoagulação Plena e Filtro de Veia Cava Inferior",
        "letter": "2",
        "value": "Conceito de alta relevância em Trombose Venosa Profunda  e Filtros de Veia Cava: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trombose Venosa Profunda  e Filtros de Veia Cava: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trombose Venosa Profunda  e Filtros de Veia Cava: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-acessos-vasculares-para-hemodialise",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Acessos Vasculares para Hemodiálise",
    "fullTitle": "Acessos Vasculares para Hemodiálise (Doenças Vasculares Cirúrgicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Doenças Vasculares Cirúrgicas",
    "foco": "Acessos Vasculares para Hemodiálise",
    "subfocos": [
      "Fístula Arteriovenosa Autógena (FAV) vs Enxerto Protético (PTFE)",
      "Complicações de Acessos Vasculares: Trombose, Estenose e Síndrome de Roubo"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Doenças Vasculares Cirúrgicas",
    "chips": [
      {
        "label": "Fístula Arteriovenosa Autógena",
        "letter": "1",
        "value": "Conceito de alta relevância em Acessos Vasculares para Hemodiálise: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Complicações de Acessos Vasculares: Trombose, Estenose e Síndrome de Roubo",
        "letter": "2",
        "value": "Conceito de alta relevância em Acessos Vasculares para Hemodiálise: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Acessos Vasculares para Hemodiálise: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Acessos Vasculares para Hemodiálise: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-litiase-urinaria-e-colica-nefretica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Litíase Urinária e Cólica Nefrética Ci",
    "fullTitle": "Litíase Urinária e Cólica Nefrética Cirúrgica (Patologias Cirúrgicas Urológicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Litíase Urinária e Cólica Nefrética Cirúrgica",
    "subfocos": [
      "Avaliação Propedêutica por Imagem e Manejo da Cólica Nefrética Aguda",
      "Critérios de Intervenção Cirúrgica de Urgência e Eletiva (LECO, Ureterorrenolitotripsia, NLPC)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Patologias Cirúrgicas Urológicas",
    "chips": [
      {
        "label": "Avaliação Propedêutica por Imagem e Manejo da Cólica Nefrética Aguda",
        "letter": "1",
        "value": "Conceito de alta relevância em Litíase Urinária e Cólica Nefrética Cirúrgica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Critérios de Intervenção Cirúrgica de Urgência e Eletiva",
        "letter": "2",
        "value": "Conceito de alta relevância em Litíase Urinária e Cólica Nefrética Cirúrgica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Litíase Urinária e Cólica Nefrética Cirúrgica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Litíase Urinária e Cólica Nefrética Cirúrgica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-hiperplasia-prostatica-benigna",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hiperplasia Prostática Benigna",
    "fullTitle": "Hiperplasia Prostática Benigna (Patologias Cirúrgicas Urológicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Hiperplasia Prostática Benigna (HPB)",
    "subfocos": [
      "Quadro Clínico (Sintomas de Armazenamento e Esvaziamento) e Escore IPSS",
      "Terapia Farmacológica Combinada e Ressecção Transuretral de Próstata (RTUP)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Patologias Cirúrgicas Urológicas",
    "chips": [
      {
        "label": "Quadro Clínico",
        "letter": "1",
        "value": "Conceito de alta relevância em Hiperplasia Prostática Benigna: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Terapia Farmacológica Combinada e Ressecção Transuretral de Próstata",
        "letter": "2",
        "value": "Conceito de alta relevância em Hiperplasia Prostática Benigna: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hiperplasia Prostática Benigna: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hiperplasia Prostática Benigna: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cancer-de-prostata",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Próstata",
    "fullTitle": "Câncer de Próstata (Patologias Cirúrgicas Urológicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Câncer de Próstata",
    "subfocos": [
      "Rastreamento, Biópsia Prostática Transretal e Escore de Gleason / ISUP",
      "Estratificação de Risco e Opções Terapêuticas (Vigilância, Prostatectomia e Hormonioterapia)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Patologias Cirúrgicas Urológicas",
    "chips": [
      {
        "label": "Rastreamento, Biópsia Prostática Transretal e Escore de Gleason / ISUP",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Próstata: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Estratificação de Risco e Opções Terapêuticas",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Próstata: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Próstata: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Próstata: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cancer-renal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer Renal",
    "fullTitle": "Câncer Renal (Patologias Cirúrgicas Urológicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Câncer Renal (Carcinoma de Células Renais)",
    "subfocos": [
      "Subtipos Histológicos, Tríade Clássica e Incidentalomas Renais",
      "Nefrectomia Parcial vs Radical e Síndromes Paraneoplásicas"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Patologias Cirúrgicas Urológicas",
    "chips": [
      {
        "label": "Subtipos Histológicos, Tríade Clássica e Incidentalomas Renais",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer Renal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Nefrectomia Parcial vs Radical e Síndromes Paraneoplásicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer Renal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer Renal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer Renal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cancer-de-bexiga",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Bexiga",
    "fullTitle": "Câncer de Bexiga (Patologias Cirúrgicas Urológicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Câncer de Bexiga",
    "subfocos": [
      "Fatores de Risco (Tabagismo), Apresentação Clínica e Cistoscopia",
      "Ressecção Transuretral de Bexiga (RTUB) e Invasão Muscular (Cistectomia Radical)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Patologias Cirúrgicas Urológicas",
    "chips": [
      {
        "label": "Fatores de Risco",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Bexiga: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Ressecção Transuretral de Bexiga",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Bexiga: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Bexiga: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Bexiga: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-cancer-de-testiculo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Testículo",
    "fullTitle": "Câncer de Testículo (Patologias Cirúrgicas Urológicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Câncer de Testículo",
    "subfocos": [
      "Fatores de Risco (Criptorquidia), Apresentação Clínica e Marcadores Tumorais",
      "Orquiectomia Radical Inguinal e Diferenciação Seminoma vs Não-Seminoma"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Patologias Cirúrgicas Urológicas",
    "chips": [
      {
        "label": "Fatores de Risco",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Testículo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Orquiectomia Radical Inguinal e Diferenciação Seminoma vs Não-Seminoma",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Testículo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Testículo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Testículo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-escroto-agudo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Escroto Agudo",
    "fullTitle": "Escroto Agudo (Patologias Cirúrgicas Urológicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Escroto Agudo (Torção Testicular e Orquiepididimite)",
    "subfocos": [
      "Diagnóstico Diferencial: Torção de Cordão Espermático vs Orquiepididimite Aguda",
      "Janela Cirúrgica de Ouro (< 6 horas) e Orquidopexia Bilateral"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Patologias Cirúrgicas Urológicas",
    "chips": [
      {
        "label": "Diagnóstico Diferencial: Torção de Cordão Espermático vs Orquiepididimite Aguda",
        "letter": "1",
        "value": "Conceito de alta relevância em Escroto Agudo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Janela Cirúrgica de Ouro",
        "letter": "2",
        "value": "Conceito de alta relevância em Escroto Agudo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Escroto Agudo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Escroto Agudo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-trauma-urologico",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trauma Urológico",
    "fullTitle": "Trauma Urológico (Patologias Cirúrgicas Urológicas)",
    "specialty": "Cirurgia Geral",
    "tema": "Patologias Cirúrgicas Urológicas",
    "foco": "Trauma Urológico (Renal, Vesical e Uretral)",
    "subfocos": [
      "Trauma Renal: Mecanismos, TC com Contraste e Manejo Não-Operatório",
      "Trauma de Bexiga e Trauma de Uretra (Anterior vs Posterior)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Patologias Cirúrgicas Urológicas",
    "chips": [
      {
        "label": "Trauma Renal: Mecanismos, TC com Contraste e Manejo Não-Operatório",
        "letter": "1",
        "value": "Conceito de alta relevância em Trauma Urológico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Trauma de Bexiga e Trauma de Uretra",
        "letter": "2",
        "value": "Conceito de alta relevância em Trauma Urológico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trauma Urológico: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trauma Urológico: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-neoplasias-malignas-pulmonares",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Neoplasias Malignas Pulmonares",
    "fullTitle": "Neoplasias Malignas Pulmonares (Afecções Cirúrgicas do Tórax)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Neoplasias Malignas Pulmonares (Câncer de Pulmão)",
    "subfocos": [
      "Tipos Histológicos, Rastreamento por TC de Baixa Dose e Diagnóstico",
      "Estadiamento TNM, Avaliação da Reserva Funcional Pulmonar e Ressecção"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Afecções Cirúrgicas do Tórax",
    "chips": [
      {
        "label": "Tipos Histológicos, Rastreamento por TC de Baixa Dose e Diagnóstico",
        "letter": "1",
        "value": "Conceito de alta relevância em Neoplasias Malignas Pulmonares: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Estadiamento TNM, Avaliação da Reserva Funcional Pulmonar e Ressecção",
        "letter": "2",
        "value": "Conceito de alta relevância em Neoplasias Malignas Pulmonares: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Neoplasias Malignas Pulmonares: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Neoplasias Malignas Pulmonares: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-derrame-pleural-neoplasico-e-empiem",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Derrame Pleural Neoplásico e Empiema P",
    "fullTitle": "Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico (Afecções Cirúrgicas do Tórax)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico",
    "subfocos": [
      "Toracocentese Diagnóstica, Critérios de Light e Derrame Neoplásico",
      "Empiema Pleural: Fases Fisiopatológicas e Drenagem Torácica / Decorticação"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Afecções Cirúrgicas do Tórax",
    "chips": [
      {
        "label": "Toracocentese Diagnóstica, Critérios de Light e Derrame Neoplásico",
        "letter": "1",
        "value": "Conceito de alta relevância em Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Empiema Pleural: Fases Fisiopatológicas e Drenagem Torácica / Decorticação",
        "letter": "2",
        "value": "Conceito de alta relevância em Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Derrame Pleural Neoplásico e Empiema Pleural Cirúrgico: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-pneumotorax-espontaneo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Pneumotórax Espontâneo",
    "fullTitle": "Pneumotórax Espontâneo (Afecções Cirúrgicas do Tórax)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Pneumotórax Espontâneo",
    "subfocos": [
      "Pneumotórax Espontâneo Primário vs Secundário",
      "Manejo Inicial, Drenagem Tubular em Selo d'Água e Cirurgia para Recidiva"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Afecções Cirúrgicas do Tórax",
    "chips": [
      {
        "label": "Pneumotórax Espontâneo Primário vs Secundário",
        "letter": "1",
        "value": "Conceito de alta relevância em Pneumotórax Espontâneo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Inicial, Drenagem Tubular em Selo d'Água e Cirurgia para Recidiva",
        "letter": "2",
        "value": "Conceito de alta relevância em Pneumotórax Espontâneo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Pneumotórax Espontâneo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Pneumotórax Espontâneo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-tumores-de-mediastino",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Tumores de Mediastino",
    "fullTitle": "Tumores de Mediastino (Afecções Cirúrgicas do Tórax)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Tumores de Mediastino",
    "subfocos": [
      "Anatomia Topográfica Mediastinal e Regra dos 4 Ts",
      "Investigação Radiológica e Abordagem Cirúrgica dos Timomas"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Afecções Cirúrgicas do Tórax",
    "chips": [
      {
        "label": "Anatomia Topográfica Mediastinal e Regra dos 4 Ts",
        "letter": "1",
        "value": "Conceito de alta relevância em Tumores de Mediastino: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Investigação Radiológica e Abordagem Cirúrgica dos Timomas",
        "letter": "2",
        "value": "Conceito de alta relevância em Tumores de Mediastino: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Tumores de Mediastino: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Tumores de Mediastino: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-bronquiectasias-e-doencas-pleuropul",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Bronquiectasias e Doenças Pleuropulmon",
    "fullTitle": "Bronquiectasias e Doenças Pleuropulmonares Supurativas (Afecções Cirúrgicas do Tórax)",
    "specialty": "Cirurgia Geral",
    "tema": "Afecções Cirúrgicas do Tórax",
    "foco": "Bronquiectasias e Doenças Pleuropulmonares Supurativas",
    "subfocos": [
      "Fisiopatologia, Tomografia de Alta Resolução e Diagnóstico",
      "Tratamento Clínico de Higiene Brônquica e Ressecção Pulmonar Cirúrgica"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Afecções Cirúrgicas do Tórax",
    "chips": [
      {
        "label": "Fisiopatologia, Tomografia de Alta Resolução e Diagnóstico",
        "letter": "1",
        "value": "Conceito de alta relevância em Bronquiectasias e Doenças Pleuropulmonares Supurativas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Clínico de Higiene Brônquica e Ressecção Pulmonar Cirúrgica",
        "letter": "2",
        "value": "Conceito de alta relevância em Bronquiectasias e Doenças Pleuropulmonares Supurativas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Bronquiectasias e Doenças Pleuropulmonares Supurativas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Bronquiectasias e Doenças Pleuropulmonares Supurativas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-atresia-de-esofago-e-fistula-traque",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Atresia de Esôfago e Fístula Traqueoes",
    "fullTitle": "Atresia de Esôfago e Fístula Traqueoesofágica (Cirurgia Pediátrica e Neonatal)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Atresia de Esôfago e Fístula Traqueoesofágica",
    "subfocos": [
      "Classificação Anatômica, Diagnóstico Neonatal e Sonda Orogástrica",
      "Propedêutica Radiológica (Presença de Ar no Abdome) e Correção Cirúrgica"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Pediátrica e Neonatal",
    "chips": [
      {
        "label": "Classificação Anatômica, Diagnóstico Neonatal e Sonda Orogástrica",
        "letter": "1",
        "value": "Conceito de alta relevância em Atresia de Esôfago e Fístula Traqueoesofágica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Propedêutica Radiológica",
        "letter": "2",
        "value": "Conceito de alta relevância em Atresia de Esôfago e Fístula Traqueoesofágica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Atresia de Esôfago e Fístula Traqueoesofágica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Atresia de Esôfago e Fístula Traqueoesofágica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-estenose-hipertrofica-do-piloro",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Estenose Hipertrófica do Piloro",
    "fullTitle": "Estenose Hipertrófica do Piloro (Cirurgia Pediátrica e Neonatal)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Estenose Hipertrófica do Piloro",
    "subfocos": [
      "Quadro Clínico (Vômitos Não-Biliosos em Jato) e Distúrbio Hidroeletrolítico",
      "Diagnóstico Ultrassonográfico e Piloromiotomia de Fredet-Ramstedt"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Pediátrica e Neonatal",
    "chips": [
      {
        "label": "Quadro Clínico",
        "letter": "1",
        "value": "Conceito de alta relevância em Estenose Hipertrófica do Piloro: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Diagnóstico Ultrassonográfico e Piloromiotomia de Fredet-Ramstedt",
        "letter": "2",
        "value": "Conceito de alta relevância em Estenose Hipertrófica do Piloro: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Estenose Hipertrófica do Piloro: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Estenose Hipertrófica do Piloro: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-hernia-diafragmatica-congenita",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hérnia Diafragmática Congênita",
    "fullTitle": "Hérnia Diafragmática Congênita (Cirurgia Pediátrica e Neonatal)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Hérnia Diafragmática Congênita",
    "subfocos": [
      "Hérnia de Bochdalek vs Morgagni e Fisiopatologia da Hipoplasia Pulmonar",
      "Manejo Ventilatório Neonatal Imediato e Momento da Correção Cirúrgica"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Pediátrica e Neonatal",
    "chips": [
      {
        "label": "Hérnia de Bochdalek vs Morgagni e Fisiopatologia da Hipoplasia Pulmonar",
        "letter": "1",
        "value": "Conceito de alta relevância em Hérnia Diafragmática Congênita: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Ventilatório Neonatal Imediato e Momento da Correção Cirúrgica",
        "letter": "2",
        "value": "Conceito de alta relevância em Hérnia Diafragmática Congênita: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hérnia Diafragmática Congênita: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hérnia Diafragmática Congênita: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-malformacoes-anorretais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Malformações Anorretais",
    "fullTitle": "Malformações Anorretais (Cirurgia Pediátrica e Neonatal)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Malformações Anorretais (Ânus Imperfurado)",
    "subfocos": [
      "Classificação (Lesões Altas vs Baixas) e Fístulas Perineais / Urinárias",
      "Invertograma / Radiografia em Posição Prona e Conduta (Anoplastia vs Colostomia)"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Pediátrica e Neonatal",
    "chips": [
      {
        "label": "Classificação",
        "letter": "1",
        "value": "Conceito de alta relevância em Malformações Anorretais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Invertograma / Radiografia em Posição Prona e Conduta",
        "letter": "2",
        "value": "Conceito de alta relevância em Malformações Anorretais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Malformações Anorretais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Malformações Anorretais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-gastrosquise-e-onfalocele",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Gastrosquise e Onfalocele",
    "fullTitle": "Gastrosquise e Onfalocele (Cirurgia Pediátrica e Neonatal)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Gastrosquise e Onfalocele",
    "subfocos": [
      "Diferenciação Embriológica e Anatômica: Gastrosquise vs Onfalocele",
      "Cuidados Imediatos em Sala de Parto e Fechamento Primário vs Silo Gradual"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Pediátrica e Neonatal",
    "chips": [
      {
        "label": "Diferenciação Embriológica e Anatômica: Gastrosquise vs Onfalocele",
        "letter": "1",
        "value": "Conceito de alta relevância em Gastrosquise e Onfalocele: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cuidados Imediatos em Sala de Parto e Fechamento Primário vs Silo Gradual",
        "letter": "2",
        "value": "Conceito de alta relevância em Gastrosquise e Onfalocele: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Gastrosquise e Onfalocele: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Gastrosquise e Onfalocele: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-invaginacao-intestinal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Invaginação Intestinal",
    "fullTitle": "Invaginação Intestinal (Cirurgia Pediátrica e Neonatal)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Invaginação Intestinal (Intussuscepção)",
    "subfocos": [
      "Quadro Clínico (Dor Paroxística, Fezes em Geleia de Framboesa) e Ultrassom",
      "Redução Hidrostática / Pneumática vs Indicação Cirúrgica de Laparotomia"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Pediátrica e Neonatal",
    "chips": [
      {
        "label": "Quadro Clínico",
        "letter": "1",
        "value": "Conceito de alta relevância em Invaginação Intestinal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Redução Hidrostática / Pneumática vs Indicação Cirúrgica de Laparotomia",
        "letter": "2",
        "value": "Conceito de alta relevância em Invaginação Intestinal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Invaginação Intestinal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Invaginação Intestinal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-criptorquidia-e-hernias-congenitas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Criptorquidia e Hérnias Congênitas",
    "fullTitle": "Criptorquidia e Hérnias Congênitas (Cirurgia Pediátrica e Neonatal)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Criptorquidia e Hérnias Congênitas",
    "subfocos": [
      "Fisiopatologia da Descida Testicular, Exame Físico e Idade para Correção",
      "Técnica de Orquidopexia e Hérnia Inguinal Indireta Congênita na Infância"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Pediátrica e Neonatal",
    "chips": [
      {
        "label": "Fisiopatologia da Descida Testicular, Exame Físico e Idade para Correção",
        "letter": "1",
        "value": "Conceito de alta relevância em Criptorquidia e Hérnias Congênitas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Técnica de Orquidopexia e Hérnia Inguinal Indireta Congênita na Infância",
        "letter": "2",
        "value": "Conceito de alta relevância em Criptorquidia e Hérnias Congênitas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Criptorquidia e Hérnias Congênitas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Criptorquidia e Hérnias Congênitas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-ciru-megacolon-congenito",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Megacólon Congênito",
    "fullTitle": "Megacólon Congênito (Cirurgia Pediátrica e Neonatal)",
    "specialty": "Cirurgia Geral",
    "tema": "Cirurgia Pediátrica e Neonatal",
    "foco": "Megacólon Congênito (Doença de Hirschsprung)",
    "subfocos": [
      "Fisiopatologia da Aganglionose Retal, Atraso na Eliminação de Mecônio e Toque",
      "Enema Opaco, Manometria Anorretal, Biópsia Retal e Cirurgia de Abaixamento"
    ],
    "provenanceDefault": "Visto em Cirurgia Geral • Cirurgia Pediátrica e Neonatal",
    "chips": [
      {
        "label": "Fisiopatologia da Aganglionose Retal, Atraso na Eliminação de Mecônio e Toque",
        "letter": "1",
        "value": "Conceito de alta relevância em Megacólon Congênito: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Enema Opaco, Manometria Anorretal, Biópsia Retal e Cirurgia de Abaixamento",
        "letter": "2",
        "value": "Conceito de alta relevância em Megacólon Congênito: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Megacólon Congênito: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Megacólon Congênito: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-crescimento-ponderoestatural-e-baix",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Crescimento Ponderoestatural e Baixa E",
    "fullTitle": "Crescimento Ponderoestatural e Baixa Estatura (Puericultura e Desenvolvimento Infantil)",
    "specialty": "Pediatria",
    "tema": "Puericultura e Desenvolvimento Infantil",
    "foco": "Crescimento Ponderoestatural e Baixa Estatura",
    "subfocos": [
      "Avaliação Antropométrica e Curvas de Crescimento da OMS",
      "Baixa Estatura Patológica e Desproporcional"
    ],
    "provenanceDefault": "Visto em Pediatria • Puericultura e Desenvolvimento Infantil",
    "chips": [
      {
        "label": "Avaliação Antropométrica e Curvas de Crescimento da OMS",
        "letter": "1",
        "value": "Conceito de alta relevância em Crescimento Ponderoestatural e Baixa Estatura: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Baixa Estatura Patológica e Desproporcional",
        "letter": "2",
        "value": "Conceito de alta relevância em Crescimento Ponderoestatural e Baixa Estatura: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Crescimento Ponderoestatural e Baixa Estatura: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Crescimento Ponderoestatural e Baixa Estatura: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-desenvolvimento-neuropsicomotor",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Desenvolvimento Neuropsicomotor",
    "fullTitle": "Desenvolvimento Neuropsicomotor (Puericultura e Desenvolvimento Infantil)",
    "specialty": "Pediatria",
    "tema": "Puericultura e Desenvolvimento Infantil",
    "foco": "Desenvolvimento Neuropsicomotor (DNPM)",
    "subfocos": [
      "Marcos do Desenvolvimento por Faixa Etária",
      "Sinais de Alerta e Atraso Global do DNPM"
    ],
    "provenanceDefault": "Visto em Pediatria • Puericultura e Desenvolvimento Infantil",
    "chips": [
      {
        "label": "Marcos do Desenvolvimento por Faixa Etária",
        "letter": "1",
        "value": "Conceito de alta relevância em Desenvolvimento Neuropsicomotor: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Sinais de Alerta e Atraso Global do DNPM",
        "letter": "2",
        "value": "Conceito de alta relevância em Desenvolvimento Neuropsicomotor: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Desenvolvimento Neuropsicomotor: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Desenvolvimento Neuropsicomotor: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-disturbios-do-sono-e-do-comportamen",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Distúrbios do Sono e do Comportamento ",
    "fullTitle": "Distúrbios do Sono e do Comportamento na Infância (Puericultura e Desenvolvimento Infantil)",
    "specialty": "Pediatria",
    "tema": "Puericultura e Desenvolvimento Infantil",
    "foco": "Distúrbios do Sono e do Comportamento na Infância",
    "subfocos": [
      "Transtornos do Sono na Infância",
      "Birras, Encoprese e Enurese Noturna"
    ],
    "provenanceDefault": "Visto em Pediatria • Puericultura e Desenvolvimento Infantil",
    "chips": [
      {
        "label": "Transtornos do Sono na Infância",
        "letter": "1",
        "value": "Conceito de alta relevância em Distúrbios do Sono e do Comportamento na Infância: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Birras, Encoprese e Enurese Noturna",
        "letter": "2",
        "value": "Conceito de alta relevância em Distúrbios do Sono e do Comportamento na Infância: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Distúrbios do Sono e do Comportamento na Infância: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Distúrbios do Sono e do Comportamento na Infância: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-aleitamento-materno",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Aleitamento Materno",
    "fullTitle": "Aleitamento Materno (Aleitamento Materno e Nutrição da Criança)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Aleitamento Materno (Técnica, Fisiologia e Pega)",
    "subfocos": [
      "Pega, Posicionamento e Fisiologia da Lactação",
      "Composição do Leite Materno (Colostro vs Leite Maduro)"
    ],
    "provenanceDefault": "Visto em Pediatria • Aleitamento Materno e Nutrição da Criança",
    "chips": [
      {
        "label": "Pega, Posicionamento e Fisiologia da Lactação",
        "letter": "1",
        "value": "Conceito de alta relevância em Aleitamento Materno: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Composição do Leite Materno",
        "letter": "2",
        "value": "Conceito de alta relevância em Aleitamento Materno: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Aleitamento Materno: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Aleitamento Materno: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-dificuldades-e-contraindicacoes-da-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Dificuldades e Contraindicações da Ama",
    "fullTitle": "Dificuldades e Contraindicações da Amamentação (Aleitamento Materno e Nutrição da Criança)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Dificuldades e Contraindicações da Amamentação",
    "subfocos": [
      "Fissuras Mamilares, Ingurgitamento e Mastite Lactacional",
      "Contraindicações Absolutas e Temporárias"
    ],
    "provenanceDefault": "Visto em Pediatria • Aleitamento Materno e Nutrição da Criança",
    "chips": [
      {
        "label": "Fissuras Mamilares, Ingurgitamento e Mastite Lactacional",
        "letter": "1",
        "value": "Conceito de alta relevância em Dificuldades e Contraindicações da Amamentação: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Contraindicações Absolutas e Temporárias",
        "letter": "2",
        "value": "Conceito de alta relevância em Dificuldades e Contraindicações da Amamentação: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Dificuldades e Contraindicações da Amamentação: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Dificuldades e Contraindicações da Amamentação: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-alimentacao-complementar-e-formulas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Alimentação Complementar e Fórmulas In",
    "fullTitle": "Alimentação Complementar e Fórmulas Infantis (Aleitamento Materno e Nutrição da Criança)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Alimentação Complementar e Fórmulas Infantis",
    "subfocos": [
      "Introdução Alimentar aos 6 Meses e Guia Alimentar",
      "Fórmulas Infantis de Partida, Seguimento e Hidrolisados"
    ],
    "provenanceDefault": "Visto em Pediatria • Aleitamento Materno e Nutrição da Criança",
    "chips": [
      {
        "label": "Introdução Alimentar aos 6 Meses e Guia Alimentar",
        "letter": "1",
        "value": "Conceito de alta relevância em Alimentação Complementar e Fórmulas Infantis: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Fórmulas Infantis de Partida, Seguimento e Hidrolisados",
        "letter": "2",
        "value": "Conceito de alta relevância em Alimentação Complementar e Fórmulas Infantis: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Alimentação Complementar e Fórmulas Infantis: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Alimentação Complementar e Fórmulas Infantis: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-desnutricao-energetico-proteica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Desnutrição Energético-Proteica",
    "fullTitle": "Desnutrição Energético-Proteica (Aleitamento Materno e Nutrição da Criança)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Desnutrição Energético-Proteica (Kwashiorkor e Marasmo)",
    "subfocos": [
      "Formas Graves de Desnutrição",
      "Classificação de Gomez e Waterlow"
    ],
    "provenanceDefault": "Visto em Pediatria • Aleitamento Materno e Nutrição da Criança",
    "chips": [
      {
        "label": "Formas Graves de Desnutrição",
        "letter": "1",
        "value": "Conceito de alta relevância em Desnutrição Energético-Proteica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Classificação de Gomez e Waterlow",
        "letter": "2",
        "value": "Conceito de alta relevância em Desnutrição Energético-Proteica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Desnutrição Energético-Proteica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Desnutrição Energético-Proteica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-carencias-vitaminicas-e-minerais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Carências Vitamínicas e Minerais",
    "fullTitle": "Carências Vitamínicas e Minerais (Aleitamento Materno e Nutrição da Criança)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Carências Vitamínicas e Minerais (Raquitismo e Hipovitaminoses)",
    "subfocos": [
      "Profilaxia e Tratamento da Anemia Ferropriva",
      "Raquitismo Carencial e Hipovitaminose D"
    ],
    "provenanceDefault": "Visto em Pediatria • Aleitamento Materno e Nutrição da Criança",
    "chips": [
      {
        "label": "Profilaxia e Tratamento da Anemia Ferropriva",
        "letter": "1",
        "value": "Conceito de alta relevância em Carências Vitamínicas e Minerais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Raquitismo Carencial e Hipovitaminose D",
        "letter": "2",
        "value": "Conceito de alta relevância em Carências Vitamínicas e Minerais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Carências Vitamínicas e Minerais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Carências Vitamínicas e Minerais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-obesidade-infantil-e-dislipidemia-p",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Obesidade Infantil e Dislipidemia Pedi",
    "fullTitle": "Obesidade Infantil e Dislipidemia Pediátrica (Aleitamento Materno e Nutrição da Criança)",
    "specialty": "Pediatria",
    "tema": "Aleitamento Materno e Nutrição da Criança",
    "foco": "Obesidade Infantil e Dislipidemia Pediátrica",
    "subfocos": [
      "Abordagem da Obesidade Infantil e Síndrome Metabólica",
      "Manejo Dietético e Comportamental na Infância"
    ],
    "provenanceDefault": "Visto em Pediatria • Aleitamento Materno e Nutrição da Criança",
    "chips": [
      {
        "label": "Abordagem da Obesidade Infantil e Síndrome Metabólica",
        "letter": "1",
        "value": "Conceito de alta relevância em Obesidade Infantil e Dislipidemia Pediátrica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Dietético e Comportamental na Infância",
        "letter": "2",
        "value": "Conceito de alta relevância em Obesidade Infantil e Dislipidemia Pediátrica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Obesidade Infantil e Dislipidemia Pediátrica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Obesidade Infantil e Dislipidemia Pediátrica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-calendario-vacinal-basico-da-crianc",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Calendário Vacinal Básico da Criança",
    "fullTitle": "Calendário Vacinal Básico da Criança (Imunizações e Calendário Vacinal)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Calendário Vacinal Básico da Criança (PNI)",
    "subfocos": [
      "Esquemas, Intervalos e Idades Mínimas do PNI",
      "Regras de Atraso e Atualização de Caderneta"
    ],
    "provenanceDefault": "Visto em Pediatria • Imunizações e Calendário Vacinal",
    "chips": [
      {
        "label": "Esquemas, Intervalos e Idades Mínimas do PNI",
        "letter": "1",
        "value": "Conceito de alta relevância em Calendário Vacinal Básico da Criança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Regras de Atraso e Atualização de Caderneta",
        "letter": "2",
        "value": "Conceito de alta relevância em Calendário Vacinal Básico da Criança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Calendário Vacinal Básico da Criança: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Calendário Vacinal Básico da Criança: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-vacinas-do-primeiro-ano-de-vida",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vacinas do Primeiro Ano de Vida",
    "fullTitle": "Vacinas do Primeiro Ano de Vida (Imunizações e Calendário Vacinal)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Vacinas do Primeiro Ano de Vida (BCG, Hepatite B, Pentavalente, VIP, VORH, Pneumo-10, Meningo-C)",
    "subfocos": [
      "Vacinas do Neonato: BCG e Hepatite B",
      "Vacinas dos 2, 3, 4 e 5 Meses"
    ],
    "provenanceDefault": "Visto em Pediatria • Imunizações e Calendário Vacinal",
    "chips": [
      {
        "label": "Vacinas do Neonato: BCG e Hepatite B",
        "letter": "1",
        "value": "Conceito de alta relevância em Vacinas do Primeiro Ano de Vida: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Vacinas dos 2, 3, 4 e 5 Meses",
        "letter": "2",
        "value": "Conceito de alta relevância em Vacinas do Primeiro Ano de Vida: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vacinas do Primeiro Ano de Vida: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vacinas do Primeiro Ano de Vida: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-vacinas-do-segundo-ano-de-vida-e-re",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vacinas do Segundo Ano de Vida e Refor",
    "fullTitle": "Vacinas do Segundo Ano de Vida e Reforços (Imunizações e Calendário Vacinal)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Vacinas do Segundo Ano de Vida e Reforços (VOP, DTP, Febre Amarela, Tríplice Viral, Varicela, Hepatite A)",
    "subfocos": [
      "Vacinas Vivas Atenuadas e Febre Amarela",
      "Reforços com DTP e Transição Poliomielite"
    ],
    "provenanceDefault": "Visto em Pediatria • Imunizações e Calendário Vacinal",
    "chips": [
      {
        "label": "Vacinas Vivas Atenuadas e Febre Amarela",
        "letter": "1",
        "value": "Conceito de alta relevância em Vacinas do Segundo Ano de Vida e Reforços: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Reforços com DTP e Transição Poliomielite",
        "letter": "2",
        "value": "Conceito de alta relevância em Vacinas do Segundo Ano de Vida e Reforços: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vacinas do Segundo Ano de Vida e Reforços: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vacinas do Segundo Ano de Vida e Reforços: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-vacinas-em-populacoes-especiais-e-c",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vacinas em Populações Especiais e CRIE",
    "fullTitle": "Vacinas em Populações Especiais e CRIE (Imunizações e Calendário Vacinal)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Vacinas em Populações Especiais e CRIE",
    "subfocos": [
      "Indicações de Imunobiológicos Especiais no CRIE",
      "Indicações de Vacina Acelular (DTPa)"
    ],
    "provenanceDefault": "Visto em Pediatria • Imunizações e Calendário Vacinal",
    "chips": [
      {
        "label": "Indicações de Imunobiológicos Especiais no CRIE",
        "letter": "1",
        "value": "Conceito de alta relevância em Vacinas em Populações Especiais e CRIE: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Indicações de Vacina Acelular",
        "letter": "2",
        "value": "Conceito de alta relevância em Vacinas em Populações Especiais e CRIE: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vacinas em Populações Especiais e CRIE: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vacinas em Populações Especiais e CRIE: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-eventos-adversos-pos-vacinais-e-fal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Eventos Adversos Pós-Vacinais e Falsas",
    "fullTitle": "Eventos Adversos Pós-Vacinais e Falsas Contraindicações (Imunizações e Calendário Vacinal)",
    "specialty": "Pediatria",
    "tema": "Imunizações e Calendário Vacinal",
    "foco": "Eventos Adversos Pós-Vacinais e Falsas Contraindicações",
    "subfocos": [
      "Reações Comuns vs Eventos Adversos Graves",
      "Falsas Contraindicações Vacinais"
    ],
    "provenanceDefault": "Visto em Pediatria • Imunizações e Calendário Vacinal",
    "chips": [
      {
        "label": "Reações Comuns vs Eventos Adversos Graves",
        "letter": "1",
        "value": "Conceito de alta relevância em Eventos Adversos Pós-Vacinais e Falsas Contraindicações: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Falsas Contraindicações Vacinais",
        "letter": "2",
        "value": "Conceito de alta relevância em Eventos Adversos Pós-Vacinais e Falsas Contraindicações: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Eventos Adversos Pós-Vacinais e Falsas Contraindicações: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Eventos Adversos Pós-Vacinais e Falsas Contraindicações: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-triagem-neonatal-biologica-e-testes",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Triagem Neonatal Biológica e Testes de",
    "fullTitle": "Triagem Neonatal Biológica e Testes de Triagem (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Triagem Neonatal Biológica e Testes de Triagem (Pezinho, Olhinho, Coraçãozinho, Orelhinha)",
    "subfocos": [
      "Teste do Pezinho (Programa Nacional de Triagem Neonatal - PNTN)",
      "Testes de Triagem Física e Sensorial Neonatal"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Teste do Pezinho",
        "letter": "1",
        "value": "Conceito de alta relevância em Triagem Neonatal Biológica e Testes de Triagem: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Testes de Triagem Física e Sensorial Neonatal",
        "letter": "2",
        "value": "Conceito de alta relevância em Triagem Neonatal Biológica e Testes de Triagem: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Triagem Neonatal Biológica e Testes de Triagem: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Triagem Neonatal Biológica e Testes de Triagem: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-reanimacao-neonatal-em-sala-de-part",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Reanimação Neonatal em Sala de Parto",
    "fullTitle": "Reanimação Neonatal em Sala de Parto (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Reanimação Neonatal em Sala de Parto (SBP)",
    "subfocos": [
      "Avaliação Imediata e Passos Iniciais da Reanimação (SBP)",
      "Ventilação com Pressão Positiva (VPP) e Manobras Avançadas"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Avaliação Imediata e Passos Iniciais da Reanimação",
        "letter": "1",
        "value": "Conceito de alta relevância em Reanimação Neonatal em Sala de Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Ventilação com Pressão Positiva",
        "letter": "2",
        "value": "Conceito de alta relevância em Reanimação Neonatal em Sala de Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Reanimação Neonatal em Sala de Parto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Reanimação Neonatal em Sala de Parto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-prematuridade-e-sindrome-do-desconf",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Prematuridade e Síndrome do Desconfort",
    "fullTitle": "Prematuridade e Síndrome do Desconforto Respiratório (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Prematuridade e Síndrome do Desconforto Respiratório (Doença da Membrana Hialina)",
    "subfocos": [
      "Doença da Membrana Hialina (DMH / SDR Tipo 1)",
      "Complicações da Prematuridade Extrema"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Doença da Membrana Hialina",
        "letter": "1",
        "value": "Conceito de alta relevância em Prematuridade e Síndrome do Desconforto Respiratório: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Complicações da Prematuridade Extrema",
        "letter": "2",
        "value": "Conceito de alta relevância em Prematuridade e Síndrome do Desconforto Respiratório: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Prematuridade e Síndrome do Desconforto Respiratório: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Prematuridade e Síndrome do Desconforto Respiratório: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-taquipneia-transitoria-do-recem-nas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Taquipneia Transitória do Recém-Nascid",
    "fullTitle": "Taquipneia Transitória do Recém-Nascido (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Taquipneia Transitória do Recém-Nascido (TTRN)",
    "subfocos": [
      "Fisiopatologia e Quadro Clínico da TTRN",
      "Diagnóstico Diferencial com Outras Taquipneias"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Fisiopatologia e Quadro Clínico da TTRN",
        "letter": "1",
        "value": "Conceito de alta relevância em Taquipneia Transitória do Recém-Nascido: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Diagnóstico Diferencial com Outras Taquipneias",
        "letter": "2",
        "value": "Conceito de alta relevância em Taquipneia Transitória do Recém-Nascido: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Taquipneia Transitória do Recém-Nascido: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Taquipneia Transitória do Recém-Nascido: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-sindrome-de-aspiracao-meconial",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndrome de Aspiração Meconial",
    "fullTitle": "Síndrome de Aspiração Meconial (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Síndrome de Aspiração Meconial (SAM)",
    "subfocos": [
      "Diagnóstico e Manejo Clínico da SAM",
      "Conduta na Sala de Parto com Líquido Meconial"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Diagnóstico e Manejo Clínico da SAM",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndrome de Aspiração Meconial: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Conduta na Sala de Parto com Líquido Meconial",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndrome de Aspiração Meconial: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndrome de Aspiração Meconial: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndrome de Aspiração Meconial: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-hiperbilirrubinemia-e-ictericia-neo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hiperbilirrubinemia e Icterícia Neonat",
    "fullTitle": "Hiperbilirrubinemia e Icterícia Neonatal (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Hiperbilirrubinemia e Icterícia Neonatal",
    "subfocos": [
      "Icterícia Fisiológica vs Patológica",
      "Doença Hemolítica Perinatal e Tratamento"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Icterícia Fisiológica vs Patológica",
        "letter": "1",
        "value": "Conceito de alta relevância em Hiperbilirrubinemia e Icterícia Neonatal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Doença Hemolítica Perinatal e Tratamento",
        "letter": "2",
        "value": "Conceito de alta relevância em Hiperbilirrubinemia e Icterícia Neonatal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hiperbilirrubinemia e Icterícia Neonatal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hiperbilirrubinemia e Icterícia Neonatal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-sepse-neonatal-precoce-e-tardia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Sepse Neonatal Precoce e Tardia",
    "fullTitle": "Sepse Neonatal Precoce e Tardia (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Sepse Neonatal Precoce e Tardia",
    "subfocos": [
      "Sepse Neonatal Precoce (< 48-72h)",
      "Sepse Neonatal Tardia (> 72h)"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Sepse Neonatal Precoce",
        "letter": "1",
        "value": "Conceito de alta relevância em Sepse Neonatal Precoce e Tardia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Sepse Neonatal Tardia",
        "letter": "2",
        "value": "Conceito de alta relevância em Sepse Neonatal Precoce e Tardia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Sepse Neonatal Precoce e Tardia: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Sepse Neonatal Precoce e Tardia: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-enterocolite-necrosante",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Enterocolite Necrosante",
    "fullTitle": "Enterocolite Necrosante (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Enterocolite Necrosante",
    "subfocos": [
      "Diagnóstico e Classificação de Bell",
      "Manejo Clínico Inicial da ECN"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Diagnóstico e Classificação de Bell",
        "letter": "1",
        "value": "Conceito de alta relevância em Enterocolite Necrosante: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Clínico Inicial da ECN",
        "letter": "2",
        "value": "Conceito de alta relevância em Enterocolite Necrosante: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Enterocolite Necrosante: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Enterocolite Necrosante: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-hipoglicemia-e-disturbios-metabolic",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hipoglicemia e Distúrbios Metabólicos ",
    "fullTitle": "Hipoglicemia e Distúrbios Metabólicos Neonatais (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Hipoglicemia e Distúrbios Metabólicos Neonatais",
    "subfocos": [
      "Hipoglicemia Neonatal (Definição e Conduta)",
      "Hipocalcemia e Hipomagnesemia Neonatais"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Hipoglicemia Neonatal",
        "letter": "1",
        "value": "Conceito de alta relevância em Hipoglicemia e Distúrbios Metabólicos Neonatais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hipocalcemia e Hipomagnesemia Neonatais",
        "letter": "2",
        "value": "Conceito de alta relevância em Hipoglicemia e Distúrbios Metabólicos Neonatais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hipoglicemia e Distúrbios Metabólicos Neonatais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hipoglicemia e Distúrbios Metabólicos Neonatais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-asfixia-perinatal-e-encefalopatia-h",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Asfixia Perinatal e Encefalopatia Hipó",
    "fullTitle": "Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica (Neonatologia e Cuidados Perinatais)",
    "specialty": "Pediatria",
    "tema": "Neonatologia e Cuidados Perinatais",
    "foco": "Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica",
    "subfocos": [
      "Critérios Diagnósticos de Asfixia Perinatal",
      "Encefalopatia Hipóxico-Isquêmica e Hipotermia Terapêutica"
    ],
    "provenanceDefault": "Visto em Pediatria • Neonatologia e Cuidados Perinatais",
    "chips": [
      {
        "label": "Critérios Diagnósticos de Asfixia Perinatal",
        "letter": "1",
        "value": "Conceito de alta relevância em Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Encefalopatia Hipóxico-Isquêmica e Hipotermia Terapêutica",
        "letter": "2",
        "value": "Conceito de alta relevância em Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Asfixia Perinatal e Encefalopatia Hipóxico-Isquêmica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-sarampo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Sarampo",
    "fullTitle": "Sarampo (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Sarampo",
    "subfocos": [
      "Diagnóstico Clínico e Sinais Patognomônicos",
      "Notificação, Bloqueio Vacinal e Suplementação de Vitamina A"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Diagnóstico Clínico e Sinais Patognomônicos",
        "letter": "1",
        "value": "Conceito de alta relevância em Sarampo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Notificação, Bloqueio Vacinal e Suplementação de Vitamina A",
        "letter": "2",
        "value": "Conceito de alta relevância em Sarampo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Sarampo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Sarampo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-varicela-e-herpes-zoster-infantil",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Varicela e Herpes-Zóster Infantil",
    "fullTitle": "Varicela e Herpes-Zóster Infantil (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Varicela e Herpes-Zóster Infantil",
    "subfocos": [
      "Manifestações Clínicas e Pleomorfismo Regional",
      "Complicações e Indicações de Aciclovir e Bloqueio"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Manifestações Clínicas e Pleomorfismo Regional",
        "letter": "1",
        "value": "Conceito de alta relevância em Varicela e Herpes-Zóster Infantil: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Complicações e Indicações de Aciclovir e Bloqueio",
        "letter": "2",
        "value": "Conceito de alta relevância em Varicela e Herpes-Zóster Infantil: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Varicela e Herpes-Zóster Infantil: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Varicela e Herpes-Zóster Infantil: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-escarlatina",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Escarlatina",
    "fullTitle": "Escarlatina (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Escarlatina",
    "subfocos": [
      "Quadro Clínico e Exantema Micropapular",
      "Tratamento Antimicrobiano e Prevenção de Sequelas"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Quadro Clínico e Exantema Micropapular",
        "letter": "1",
        "value": "Conceito de alta relevância em Escarlatina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Antimicrobiano e Prevenção de Sequelas",
        "letter": "2",
        "value": "Conceito de alta relevância em Escarlatina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Escarlatina: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Escarlatina: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-exantema-subito",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Exantema Súbito",
    "fullTitle": "Exantema Súbito (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Exantema Súbito (Roséola Infantil)",
    "subfocos": [
      "Fisiopatologia e Curso Clínico Bimodal",
      "Manejo Clínico e Diagnóstico Diferencial"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Fisiopatologia e Curso Clínico Bimodal",
        "letter": "1",
        "value": "Conceito de alta relevância em Exantema Súbito: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Clínico e Diagnóstico Diferencial",
        "letter": "2",
        "value": "Conceito de alta relevância em Exantema Súbito: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Exantema Súbito: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Exantema Súbito: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-eritema-infeccioso",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Eritema Infeccioso",
    "fullTitle": "Eritema Infeccioso (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Eritema Infeccioso (Parvovírus B19)",
    "subfocos": [
      "Parvovírus B19 e as 3 Fases do Exantema",
      "Complicações Hematológicas e Gestacionais do Parvovírus"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Parvovírus B19 e as 3 Fases do Exantema",
        "letter": "1",
        "value": "Conceito de alta relevância em Eritema Infeccioso: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Complicações Hematológicas e Gestacionais do Parvovírus",
        "letter": "2",
        "value": "Conceito de alta relevância em Eritema Infeccioso: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Eritema Infeccioso: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Eritema Infeccioso: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-doenca-de-kawasaki",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença de Kawasaki",
    "fullTitle": "Doença de Kawasaki (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Doença de Kawasaki",
    "subfocos": [
      "Critérios Diagnósticos Clínicos da Vasculite de Kawasaki",
      "Prevenção de Aneurismas Coronarianos e Tratamento"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Critérios Diagnósticos Clínicos da Vasculite de Kawasaki",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença de Kawasaki: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Prevenção de Aneurismas Coronarianos e Tratamento",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença de Kawasaki: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença de Kawasaki: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença de Kawasaki: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-doenca-mao-pe-boca",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença Mão-Pé-Boca",
    "fullTitle": "Doença Mão-Pé-Boca (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Doença Mão-Pé-Boca (Coxsackievírus)",
    "subfocos": [
      "Coxsackievírus A16 e Manifestações Vesiculares",
      "Herpangina e Complicações pelo Enterovírus 71"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Coxsackievírus A16 e Manifestações Vesiculares",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Mão-Pé-Boca: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Herpangina e Complicações pelo Enterovírus 71",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Mão-Pé-Boca: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Mão-Pé-Boca: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Mão-Pé-Boca: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-mononucleose-infecciosa",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Mononucleose Infecciosa",
    "fullTitle": "Mononucleose Infecciosa (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Mononucleose Infecciosa",
    "subfocos": [
      "Vírus Epstein-Barr (EBV) e Síndrome Mononucleósica",
      "Diagnóstico Laboratorial da Mononucleose"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Vírus Epstein-Barr",
        "letter": "1",
        "value": "Conceito de alta relevância em Mononucleose Infecciosa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Diagnóstico Laboratorial da Mononucleose",
        "letter": "2",
        "value": "Conceito de alta relevância em Mononucleose Infecciosa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Mononucleose Infecciosa: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Mononucleose Infecciosa: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-coqueluche",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Coqueluche",
    "fullTitle": "Coqueluche (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Coqueluche",
    "subfocos": [
      "Fases Clínicas da Infecção por Bordetella pertussis",
      "Tratamento com Macrolídeos e Quimioprofilaxia"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Fases Clínicas da Infecção por Bordetella pertussis",
        "letter": "1",
        "value": "Conceito de alta relevância em Coqueluche: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento com Macrolídeos e Quimioprofilaxia",
        "letter": "2",
        "value": "Conceito de alta relevância em Coqueluche: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Coqueluche: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Coqueluche: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-rubeola-congenita-e-adquirida",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Rubéola Congênita e Adquirida",
    "fullTitle": "Rubéola Congênita e Adquirida (Doenças Exantemáticas e Infecciosas da Infância)",
    "specialty": "Pediatria",
    "tema": "Doenças Exantemáticas e Infecciosas da Infância",
    "foco": "Rubéola Congênita e Adquirida",
    "subfocos": [
      "Rubéola Pós-Natal Adquirida",
      "Síndrome da Rubéola Congênita (SRC)"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Exantemáticas e Infecciosas da Infância",
    "chips": [
      {
        "label": "Rubéola Pós-Natal Adquirida",
        "letter": "1",
        "value": "Conceito de alta relevância em Rubéola Congênita e Adquirida: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Síndrome da Rubéola Congênita",
        "letter": "2",
        "value": "Conceito de alta relevância em Rubéola Congênita e Adquirida: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rubéola Congênita e Adquirida: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rubéola Congênita e Adquirida: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-bronquiolite-viral-aguda",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Bronquiolite Viral Aguda",
    "fullTitle": "Bronquiolite Viral Aguda (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Bronquiolite Viral Aguda",
    "subfocos": [
      "Diagnóstico Clínico do Primeiro Episódio de Sibilância",
      "Manejo Terapêutico Baseado em Evidências (Diretriz SBP/AAP)"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Diagnóstico Clínico do Primeiro Episódio de Sibilância",
        "letter": "1",
        "value": "Conceito de alta relevância em Bronquiolite Viral Aguda: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Terapêutico Baseado em Evidências",
        "letter": "2",
        "value": "Conceito de alta relevância em Bronquiolite Viral Aguda: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Bronquiolite Viral Aguda: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Bronquiolite Viral Aguda: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-asma-na-infancia-e-bebe-chiador",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Asma na Infância e Bebê Chiador",
    "fullTitle": "Asma na Infância e Bebê Chiador (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Asma na Infância e Bebê Chiador",
    "subfocos": [
      "Lactente Sibilante (Bebê Chiador) e Escore API",
      "Tratamento de Crise Asmática e Manutenção na Criança"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Lactente Sibilante",
        "letter": "1",
        "value": "Conceito de alta relevância em Asma na Infância e Bebê Chiador: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento de Crise Asmática e Manutenção na Criança",
        "letter": "2",
        "value": "Conceito de alta relevância em Asma na Infância e Bebê Chiador: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Asma na Infância e Bebê Chiador: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Asma na Infância e Bebê Chiador: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-pneumonias-adquiridas-na-comunidade",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Pneumonias Adquiridas na Comunidade  e",
    "fullTitle": "Pneumonias Adquiridas na Comunidade  e Complicações (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Pneumonias Adquiridas na Comunidade (PAC Pediátrica) e Complicações (Derrame Pleural)",
    "subfocos": [
      "Diagnóstico e Etiologia da PAC na Criança",
      "Tratamento Ambulatorial vs Hospitalar e Complicações"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Diagnóstico e Etiologia da PAC na Criança",
        "letter": "1",
        "value": "Conceito de alta relevância em Pneumonias Adquiridas na Comunidade  e Complicações: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Ambulatorial vs Hospitalar e Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Pneumonias Adquiridas na Comunidade  e Complicações: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Pneumonias Adquiridas na Comunidade  e Complicações: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Pneumonias Adquiridas na Comunidade  e Complicações: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-laringite-aguda-e-crupe-viral",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Laringite Aguda e Crupe Viral",
    "fullTitle": "Laringite Aguda e Crupe Viral (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Laringite Aguda e Crupe Viral (Estridor)",
    "subfocos": [
      "Laringotraqueobronquite Viral (Crupe)",
      "Epiglotite Aguda e Diagnósticos Diferenciais"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Laringotraqueobronquite Viral",
        "letter": "1",
        "value": "Conceito de alta relevância em Laringite Aguda e Crupe Viral: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Epiglotite Aguda e Diagnósticos Diferenciais",
        "letter": "2",
        "value": "Conceito de alta relevância em Laringite Aguda e Crupe Viral: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Laringite Aguda e Crupe Viral: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Laringite Aguda e Crupe Viral: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-otite-media-aguda-e-mastoidite",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Otite Média Aguda  e Mastoidite",
    "fullTitle": "Otite Média Aguda  e Mastoidite (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Otite Média Aguda (OMA) e Mastoidite",
    "subfocos": [
      "Otoscopia e Tratamento Antimicrobiano da OMA",
      "Mastoidite Aguda e Complicações"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Otoscopia e Tratamento Antimicrobiano da OMA",
        "letter": "1",
        "value": "Conceito de alta relevância em Otite Média Aguda  e Mastoidite: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Mastoidite Aguda e Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Otite Média Aguda  e Mastoidite: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Otite Média Aguda  e Mastoidite: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Otite Média Aguda  e Mastoidite: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-faringotonsilites-agudas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Faringotonsilites Agudas",
    "fullTitle": "Faringotonsilites Agudas (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Faringotonsilites Agudas",
    "subfocos": [
      "Diferenciação Viral vs Bacteriana (Critérios de Centor)",
      "Abscesso Periamigdaliano e Retrofaríngeo"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Diferenciação Viral vs Bacteriana",
        "letter": "1",
        "value": "Conceito de alta relevância em Faringotonsilites Agudas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Abscesso Periamigdaliano e Retrofaríngeo",
        "letter": "2",
        "value": "Conceito de alta relevância em Faringotonsilites Agudas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Faringotonsilites Agudas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Faringotonsilites Agudas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-rinossinusite-aguda",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Rinossinusite Aguda",
    "fullTitle": "Rinossinusite Aguda (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Rinossinusite Aguda",
    "subfocos": [
      "Critérios Diagnósticos de Rinossinusite Bacteriana",
      "Complicações Orbitárias da Rinossinusite"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Critérios Diagnósticos de Rinossinusite Bacteriana",
        "letter": "1",
        "value": "Conceito de alta relevância em Rinossinusite Aguda: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Complicações Orbitárias da Rinossinusite",
        "letter": "2",
        "value": "Conceito de alta relevância em Rinossinusite Aguda: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rinossinusite Aguda: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rinossinusite Aguda: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-fibrose-cistica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Fibrose Cística",
    "fullTitle": "Fibrose Cística (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Fibrose Cística",
    "subfocos": [
      "Fisiopatologia e Diagnóstico da Fibrose Cística",
      "Terapêutica Multidisciplinar e Moduladores do CFTR"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Fisiopatologia e Diagnóstico da Fibrose Cística",
        "letter": "1",
        "value": "Conceito de alta relevância em Fibrose Cística: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Terapêutica Multidisciplinar e Moduladores do CFTR",
        "letter": "2",
        "value": "Conceito de alta relevância em Fibrose Cística: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Fibrose Cística: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Fibrose Cística: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-aspiracao-de-corpo-estranho",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Aspiração de Corpo Estranho",
    "fullTitle": "Aspiração de Corpo Estranho (Afecções Respiratórias na Infância)",
    "specialty": "Pediatria",
    "tema": "Afecções Respiratórias na Infância",
    "foco": "Aspiração de Corpo Estranho",
    "subfocos": [
      "Quadro Clínico e Radiológico da Aspiração",
      "Manobras de Desengasgo no Lactente vs Maior de 1 Ano"
    ],
    "provenanceDefault": "Visto em Pediatria • Afecções Respiratórias na Infância",
    "chips": [
      {
        "label": "Quadro Clínico e Radiológico da Aspiração",
        "letter": "1",
        "value": "Conceito de alta relevância em Aspiração de Corpo Estranho: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manobras de Desengasgo no Lactente vs Maior de 1 Ano",
        "letter": "2",
        "value": "Conceito de alta relevância em Aspiração de Corpo Estranho: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Aspiração de Corpo Estranho: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Aspiração de Corpo Estranho: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-gastroenterite-aguda-viral-e-bacter",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Gastroenterite Aguda Viral e Bacterian",
    "fullTitle": "Gastroenterite Aguda Viral e Bacteriana (Doenças Diarreicas e Terapia de Reidratação)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Gastroenterite Aguda Viral e Bacteriana (GECA)",
    "subfocos": [
      "Diarreia Aquosa Aguda (Rotavírus, Norovírus e EPEC/ETEC)",
      "Disenteria Aguda e Indicações de Antibiótico"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Diarreicas e Terapia de Reidratação",
    "chips": [
      {
        "label": "Diarreia Aquosa Aguda",
        "letter": "1",
        "value": "Conceito de alta relevância em Gastroenterite Aguda Viral e Bacteriana: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Disenteria Aguda e Indicações de Antibiótico",
        "letter": "2",
        "value": "Conceito de alta relevância em Gastroenterite Aguda Viral e Bacteriana: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Gastroenterite Aguda Viral e Bacteriana: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Gastroenterite Aguda Viral e Bacteriana: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-terapia-de-reidratacao-oral",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Terapia de Reidratação Oral",
    "fullTitle": "Terapia de Reidratação Oral (Doenças Diarreicas e Terapia de Reidratação)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Terapia de Reidratação Oral (Planos A, B e C da OMS/MS)",
    "subfocos": [
      "Planos A, B e C de Manejo da Desidratação (MS/OMS)",
      "Sinais Clínicos de Desidratação e Falha do Plano B"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Diarreicas e Terapia de Reidratação",
    "chips": [
      {
        "label": "Planos A, B e C de Manejo da Desidratação",
        "letter": "1",
        "value": "Conceito de alta relevância em Terapia de Reidratação Oral: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Sinais Clínicos de Desidratação e Falha do Plano B",
        "letter": "2",
        "value": "Conceito de alta relevância em Terapia de Reidratação Oral: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Terapia de Reidratação Oral: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Terapia de Reidratação Oral: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-diarreia-persistente-e-cronica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Diarreia Persistente e Crônica",
    "fullTitle": "Diarreia Persistente e Crônica (Doenças Diarreicas e Terapia de Reidratação)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Diarreia Persistente e Crônica",
    "subfocos": [
      "Diarreia Persistente (> 14 Dias) e Má Absorção",
      "Parasitoses Intestinais Causadoras de Diarreia Crônica"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Diarreicas e Terapia de Reidratação",
    "chips": [
      {
        "label": "Diarreia Persistente",
        "letter": "1",
        "value": "Conceito de alta relevância em Diarreia Persistente e Crônica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Parasitoses Intestinais Causadoras de Diarreia Crônica",
        "letter": "2",
        "value": "Conceito de alta relevância em Diarreia Persistente e Crônica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Diarreia Persistente e Crônica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Diarreia Persistente e Crônica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-alergia-a-proteina-do-leite-de-vaca",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Alergia à Proteína do Leite de Vaca",
    "fullTitle": "Alergia à Proteína do Leite de Vaca (Doenças Diarreicas e Terapia de Reidratação)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Alergia à Proteína do Leite de Vaca (APLV)",
    "subfocos": [
      "Formas IgE-Mediadas vs Não-IgE-Mediadas da APLV",
      "Abordagem Nutricional e Dieta de Exclusão"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Diarreicas e Terapia de Reidratação",
    "chips": [
      {
        "label": "Formas IgE-Mediadas vs Não-IgE-Mediadas da APLV",
        "letter": "1",
        "value": "Conceito de alta relevância em Alergia à Proteína do Leite de Vaca: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Abordagem Nutricional e Dieta de Exclusão",
        "letter": "2",
        "value": "Conceito de alta relevância em Alergia à Proteína do Leite de Vaca: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Alergia à Proteína do Leite de Vaca: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Alergia à Proteína do Leite de Vaca: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-doenca-celiaca-na-infancia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença Celíaca na Infância",
    "fullTitle": "Doença Celíaca na Infância (Doenças Diarreicas e Terapia de Reidratação)",
    "specialty": "Pediatria",
    "tema": "Doenças Diarreicas e Terapia de Reidratação",
    "foco": "Doença Celíaca na Infância",
    "subfocos": [
      "Diagnóstico e Triagem Sorológica na Criança",
      "Tratamento com Dieta Isenta de Glúten"
    ],
    "provenanceDefault": "Visto em Pediatria • Doenças Diarreicas e Terapia de Reidratação",
    "chips": [
      {
        "label": "Diagnóstico e Triagem Sorológica na Criança",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Celíaca na Infância: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento com Dieta Isenta de Glúten",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Celíaca na Infância: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Celíaca na Infância: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Celíaca na Infância: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-infeccao-do-trato-urinario-na-crian",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecção do Trato Urinário na Criança",
    "fullTitle": "Infecção do Trato Urinário na Criança (Nefropatias e Infecções Urinárias na Infância)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Infecção do Trato Urinário na Criança (Cistite e Pielonefrite)",
    "subfocos": [
      "Diagnóstico Clínico e Métodos de Coleta de Urina",
      "Tratamento Antimicrobiano e Rastreamento por Imagem"
    ],
    "provenanceDefault": "Visto em Pediatria • Nefropatias e Infecções Urinárias na Infância",
    "chips": [
      {
        "label": "Diagnóstico Clínico e Métodos de Coleta de Urina",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecção do Trato Urinário na Criança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Antimicrobiano e Rastreamento por Imagem",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecção do Trato Urinário na Criança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecção do Trato Urinário na Criança: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecção do Trato Urinário na Criança: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-refluxo-vesicoureteral-e-malformaco",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Refluxo Vesicoureteral e Malformações ",
    "fullTitle": "Refluxo Vesicoureteral e Malformações Urinárias (Nefropatias e Infecções Urinárias na Infância)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Refluxo Vesicoureteral e Malformações Urinárias",
    "subfocos": [
      "Classificação Radiológica e Investigação do RVU",
      "Profilaxia Antimicrobiana e Tratamento Cirúrgico"
    ],
    "provenanceDefault": "Visto em Pediatria • Nefropatias e Infecções Urinárias na Infância",
    "chips": [
      {
        "label": "Classificação Radiológica e Investigação do RVU",
        "letter": "1",
        "value": "Conceito de alta relevância em Refluxo Vesicoureteral e Malformações Urinárias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Profilaxia Antimicrobiana e Tratamento Cirúrgico",
        "letter": "2",
        "value": "Conceito de alta relevância em Refluxo Vesicoureteral e Malformações Urinárias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Refluxo Vesicoureteral e Malformações Urinárias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Refluxo Vesicoureteral e Malformações Urinárias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-glomerulonefrite-difusa-aguda-pos-e",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Glomerulonefrite Difusa Aguda Pós-Estr",
    "fullTitle": "Glomerulonefrite Difusa Aguda Pós-Estreptocócica (Nefropatias e Infecções Urinárias na Infância)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Glomerulonefrite Difusa Aguda Pós-Estreptocócica (GNPE)",
    "subfocos": [
      "Fisiopatologia e Quadro Clínico da GNPE",
      "Evolução Laboratorial e Manejo das Complicações"
    ],
    "provenanceDefault": "Visto em Pediatria • Nefropatias e Infecções Urinárias na Infância",
    "chips": [
      {
        "label": "Fisiopatologia e Quadro Clínico da GNPE",
        "letter": "1",
        "value": "Conceito de alta relevância em Glomerulonefrite Difusa Aguda Pós-Estreptocócica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Evolução Laboratorial e Manejo das Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Glomerulonefrite Difusa Aguda Pós-Estreptocócica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Glomerulonefrite Difusa Aguda Pós-Estreptocócica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Glomerulonefrite Difusa Aguda Pós-Estreptocócica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-sindrome-nefrotica-na-infancia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndrome Nefrótica na Infância",
    "fullTitle": "Síndrome Nefrótica na Infância (Nefropatias e Infecções Urinárias na Infância)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Síndrome Nefrótica na Infância (Lesão Mínima)",
    "subfocos": [
      "Diagnóstico da Doença por Lesão Mínima (DLM)",
      "Corticoterapia e Complicações Infecciosas/Trombóticas"
    ],
    "provenanceDefault": "Visto em Pediatria • Nefropatias e Infecções Urinárias na Infância",
    "chips": [
      {
        "label": "Diagnóstico da Doença por Lesão Mínima",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndrome Nefrótica na Infância: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Corticoterapia e Complicações Infecciosas/Trombóticas",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndrome Nefrótica na Infância: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndrome Nefrótica na Infância: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndrome Nefrótica na Infância: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-sindrome-hemolitico-uremica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndrome Hemolítico-Urêmica",
    "fullTitle": "Síndrome Hemolítico-Urêmica (Nefropatias e Infecções Urinárias na Infância)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Síndrome Hemolítico-Urêmica (SHU)",
    "subfocos": [
      "Tríade Clássica da SHU Típica (D+)",
      "Manejo Clínico e Contraindicações Absolutas"
    ],
    "provenanceDefault": "Visto em Pediatria • Nefropatias e Infecções Urinárias na Infância",
    "chips": [
      {
        "label": "Tríade Clássica da SHU Típica",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndrome Hemolítico-Urêmica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Clínico e Contraindicações Absolutas",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndrome Hemolítico-Urêmica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndrome Hemolítico-Urêmica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndrome Hemolítico-Urêmica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-enurese-e-disturbios-miccionais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Enurese e Distúrbios Miccionais",
    "fullTitle": "Enurese e Distúrbios Miccionais (Nefropatias e Infecções Urinárias na Infância)",
    "specialty": "Pediatria",
    "tema": "Nefropatias e Infecções Urinárias na Infância",
    "foco": "Enurese e Distúrbios Miccionais",
    "subfocos": [
      "Enurese Noturna Monossintomática",
      "Disfunção do Trato Urinário Inferior e Bexiga Neurogênica"
    ],
    "provenanceDefault": "Visto em Pediatria • Nefropatias e Infecções Urinárias na Infância",
    "chips": [
      {
        "label": "Enurese Noturna Monossintomática",
        "letter": "1",
        "value": "Conceito de alta relevância em Enurese e Distúrbios Miccionais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Disfunção do Trato Urinário Inferior e Bexiga Neurogênica",
        "letter": "2",
        "value": "Conceito de alta relevância em Enurese e Distúrbios Miccionais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Enurese e Distúrbios Miccionais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Enurese e Distúrbios Miccionais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-anemia-ferropriva-na-crianca",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Anemia Ferropriva na Criança",
    "fullTitle": "Anemia Ferropriva na Criança (Hematologia e Oncologia Pediátrica)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Anemia Ferropriva na Criança",
    "subfocos": [
      "Diagnóstico Laboratorial da Carência de Ferro",
      "Tratamento com Sulfato Ferroso e Resposta Reticulocitária"
    ],
    "provenanceDefault": "Visto em Pediatria • Hematologia e Oncologia Pediátrica",
    "chips": [
      {
        "label": "Diagnóstico Laboratorial da Carência de Ferro",
        "letter": "1",
        "value": "Conceito de alta relevância em Anemia Ferropriva na Criança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento com Sulfato Ferroso e Resposta Reticulocitária",
        "letter": "2",
        "value": "Conceito de alta relevância em Anemia Ferropriva na Criança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Anemia Ferropriva na Criança: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Anemia Ferropriva na Criança: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-doenca-falciforme-e-crises-falcemic",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença Falciforme e Crises Falcêmicas",
    "fullTitle": "Doença Falciforme e Crises Falcêmicas (Hematologia e Oncologia Pediátrica)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Doença Falciforme e Crises Falcêmicas",
    "subfocos": [
      "Crises Agudas Falcêmicas na Infância",
      "Profilaxia Infecciosa e Modificadores da Doença"
    ],
    "provenanceDefault": "Visto em Pediatria • Hematologia e Oncologia Pediátrica",
    "chips": [
      {
        "label": "Crises Agudas Falcêmicas na Infância",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Falciforme e Crises Falcêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Profilaxia Infecciosa e Modificadores da Doença",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Falciforme e Crises Falcêmicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Falciforme e Crises Falcêmicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Falciforme e Crises Falcêmicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-talassemias-e-esferocitose-heredita",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Talassemias e Esferocitose Hereditária",
    "fullTitle": "Talassemias e Esferocitose Hereditária (Hematologia e Oncologia Pediátrica)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Talassemias e Esferocitose Hereditária",
    "subfocos": [
      "Betatalassemia Major e Minor",
      "Esferocitose Hereditária"
    ],
    "provenanceDefault": "Visto em Pediatria • Hematologia e Oncologia Pediátrica",
    "chips": [
      {
        "label": "Betatalassemia Major e Minor",
        "letter": "1",
        "value": "Conceito de alta relevância em Talassemias e Esferocitose Hereditária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Esferocitose Hereditária",
        "letter": "2",
        "value": "Conceito de alta relevância em Talassemias e Esferocitose Hereditária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Talassemias e Esferocitose Hereditária: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Talassemias e Esferocitose Hereditária: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-purpura-trombocitopenica-imune-e-he",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Púrpura Trombocitopênica Imune  e Heno",
    "fullTitle": "Púrpura Trombocitopênica Imune  e Henoch-Schönlein (Hematologia e Oncologia Pediátrica)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Púrpura Trombocitopênica Imune (PTI) e Henoch-Schönlein",
    "subfocos": [
      "Púrpura Trombocitopênica Imune Aguda Pediátrica",
      "Púrpura de Henoch-Schönlein (Vasculite por IgA)"
    ],
    "provenanceDefault": "Visto em Pediatria • Hematologia e Oncologia Pediátrica",
    "chips": [
      {
        "label": "Púrpura Trombocitopênica Imune Aguda Pediátrica",
        "letter": "1",
        "value": "Conceito de alta relevância em Púrpura Trombocitopênica Imune  e Henoch-Schönlein: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Púrpura de Henoch-Schönlein",
        "letter": "2",
        "value": "Conceito de alta relevância em Púrpura Trombocitopênica Imune  e Henoch-Schönlein: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Púrpura Trombocitopênica Imune  e Henoch-Schönlein: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Púrpura Trombocitopênica Imune  e Henoch-Schönlein: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-leucemias-agudas-na-infancia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Leucemias Agudas na Infância",
    "fullTitle": "Leucemias Agudas na Infância (Hematologia e Oncologia Pediátrica)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Leucemias Agudas na Infância (LLA)",
    "subfocos": [
      "Diagnóstico e Quadro Clínico da LLA",
      "Estratificação Prognóstica e Emergências na LLA"
    ],
    "provenanceDefault": "Visto em Pediatria • Hematologia e Oncologia Pediátrica",
    "chips": [
      {
        "label": "Diagnóstico e Quadro Clínico da LLA",
        "letter": "1",
        "value": "Conceito de alta relevância em Leucemias Agudas na Infância: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Estratificação Prognóstica e Emergências na LLA",
        "letter": "2",
        "value": "Conceito de alta relevância em Leucemias Agudas na Infância: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Leucemias Agudas na Infância: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Leucemias Agudas na Infância: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-linfomas-pediatricos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Linfomas Pediátricos",
    "fullTitle": "Linfomas Pediátricos (Hematologia e Oncologia Pediátrica)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Linfomas Pediátricos (Hodgkin e Não-Hodgkin)",
    "subfocos": [
      "Linfoma de Burkitt e Não-Hodgkin na Criança",
      "Linfoma de Hodgkin Pediátrico"
    ],
    "provenanceDefault": "Visto em Pediatria • Hematologia e Oncologia Pediátrica",
    "chips": [
      {
        "label": "Linfoma de Burkitt e Não-Hodgkin na Criança",
        "letter": "1",
        "value": "Conceito de alta relevância em Linfomas Pediátricos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Linfoma de Hodgkin Pediátrico",
        "letter": "2",
        "value": "Conceito de alta relevância em Linfomas Pediátricos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Linfomas Pediátricos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Linfomas Pediátricos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-tumores-solidos-pediatricos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Tumores Sólidos Pediátricos",
    "fullTitle": "Tumores Sólidos Pediátricos (Hematologia e Oncologia Pediátrica)",
    "specialty": "Pediatria",
    "tema": "Hematologia e Oncologia Pediátrica",
    "foco": "Tumores Sólidos Pediátricos (Neuroblastoma e Tumor de Wilms)",
    "subfocos": [
      "Nefroblastoma (Tumor de Wilms)",
      "Neuroblastoma"
    ],
    "provenanceDefault": "Visto em Pediatria • Hematologia e Oncologia Pediátrica",
    "chips": [
      {
        "label": "Nefroblastoma",
        "letter": "1",
        "value": "Conceito de alta relevância em Tumores Sólidos Pediátricos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Neuroblastoma",
        "letter": "2",
        "value": "Conceito de alta relevância em Tumores Sólidos Pediátricos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Tumores Sólidos Pediátricos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Tumores Sólidos Pediátricos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-cardiopatias-congenitas-acianoticas",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cardiopatias Congênitas Acianóticas",
    "fullTitle": "Cardiopatias Congênitas Acianóticas (Cardiopatias Congênitas e Adquiridas)",
    "specialty": "Pediatria",
    "tema": "Cardiopatias Congênitas e Adquiridas",
    "foco": "Cardiopatias Congênitas Acianóticas (CIV, CIA, PCA, Coarctação de Aorta)",
    "subfocos": [
      "Comunicação Interventricular (CIV) e PCA",
      "Comunicação Interatrial (CIA) e Coarctação da Aorta"
    ],
    "provenanceDefault": "Visto em Pediatria • Cardiopatias Congênitas e Adquiridas",
    "chips": [
      {
        "label": "Comunicação Interventricular",
        "letter": "1",
        "value": "Conceito de alta relevância em Cardiopatias Congênitas Acianóticas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Comunicação Interatrial",
        "letter": "2",
        "value": "Conceito de alta relevância em Cardiopatias Congênitas Acianóticas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cardiopatias Congênitas Acianóticas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cardiopatias Congênitas Acianóticas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-cardiopatias-congenitas-cianoticas",
    "category": "triades",
    "categoryLabel": "Tríades & Constelações",
    "title": "Cardiopatias Congênitas Cianóticas",
    "fullTitle": "Cardiopatias Congênitas Cianóticas (Cardiopatias Congênitas e Adquiridas)",
    "specialty": "Pediatria",
    "tema": "Cardiopatias Congênitas e Adquiridas",
    "foco": "Cardiopatias Congênitas Cianóticas (Tetralogia de Fallot, Transposição das Grandes Artérias)",
    "subfocos": [
      "Tetralogia de Fallot",
      "Transposição das Grandes Artérias (TGA)"
    ],
    "provenanceDefault": "Visto em Pediatria • Cardiopatias Congênitas e Adquiridas",
    "chips": [
      {
        "label": "Tetralogia de Fallot",
        "letter": "1",
        "value": "Conceito de alta relevância em Cardiopatias Congênitas Cianóticas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Transposição das Grandes Artérias",
        "letter": "2",
        "value": "Conceito de alta relevância em Cardiopatias Congênitas Cianóticas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cardiopatias Congênitas Cianóticas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cardiopatias Congênitas Cianóticas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-febre-reumatica-e-cardite",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Febre Reumática e Cardite",
    "fullTitle": "Febre Reumática e Cardite (Cardiopatias Congênitas e Adquiridas)",
    "specialty": "Pediatria",
    "tema": "Cardiopatias Congênitas e Adquiridas",
    "foco": "Febre Reumática e Cardite",
    "subfocos": [
      "Critérios de Jones Atualizados (AHA)",
      "Tratamento da Crise e Profilaxia Secundária"
    ],
    "provenanceDefault": "Visto em Pediatria • Cardiopatias Congênitas e Adquiridas",
    "chips": [
      {
        "label": "Critérios de Jones Atualizados",
        "letter": "1",
        "value": "Conceito de alta relevância em Febre Reumática e Cardite: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento da Crise e Profilaxia Secundária",
        "letter": "2",
        "value": "Conceito de alta relevância em Febre Reumática e Cardite: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Febre Reumática e Cardite: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Febre Reumática e Cardite: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-pedi-insuficiencia-cardiaca-na-crianca",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Insuficiência Cardíaca na Criança",
    "fullTitle": "Insuficiência Cardíaca na Criança (Cardiopatias Congênitas e Adquiridas)",
    "specialty": "Pediatria",
    "tema": "Cardiopatias Congênitas e Adquiridas",
    "foco": "Insuficiência Cardíaca na Criança",
    "subfocos": [
      "Quadro Clínico e Etiologias por Idade",
      "Manejo Farmacológico da IC Pediátrica"
    ],
    "provenanceDefault": "Visto em Pediatria • Cardiopatias Congênitas e Adquiridas",
    "chips": [
      {
        "label": "Quadro Clínico e Etiologias por Idade",
        "letter": "1",
        "value": "Conceito de alta relevância em Insuficiência Cardíaca na Criança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Farmacológico da IC Pediátrica",
        "letter": "2",
        "value": "Conceito de alta relevância em Insuficiência Cardíaca na Criança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Insuficiência Cardíaca na Criança: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Insuficiência Cardíaca na Criança: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-ciclo-menstrual-e-eixo-hipotalamo-h",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Ciclo Menstrual e Eixo Hipotálamo-Hipó",
    "fullTitle": "Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário (Fisiologia Menstrual e Sangramento Uterino Anormal)",
    "specialty": "Ginecologia",
    "tema": "Fisiologia Menstrual e Sangramento Uterino Anormal",
    "foco": "Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário",
    "subfocos": [
      "Fisiologia do Ciclo Ovariano e Endometrial",
      "Controle Neuroendócrino e Feedback Hormonal"
    ],
    "provenanceDefault": "Visto em Ginecologia • Fisiologia Menstrual e Sangramento Uterino Anormal",
    "chips": [
      {
        "label": "Fisiologia do Ciclo Ovariano e Endometrial",
        "letter": "1",
        "value": "Conceito de alta relevância em Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Controle Neuroendócrino e Feedback Hormonal",
        "letter": "2",
        "value": "Conceito de alta relevância em Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Ciclo Menstrual e Eixo Hipotálamo-Hipófise-Ovário: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-sangramento-uterino-anormal",
    "category": "mnemonicos",
    "categoryLabel": "Mnemônicos de Prova",
    "title": "Sangramento Uterino Anormal",
    "fullTitle": "Sangramento Uterino Anormal (Fisiologia Menstrual e Sangramento Uterino Anormal)",
    "specialty": "Ginecologia",
    "tema": "Fisiologia Menstrual e Sangramento Uterino Anormal",
    "foco": "Sangramento Uterino Anormal (Classificação PALM-COEIN)",
    "subfocos": [
      "Causas Estruturais - Mnemônico PALM",
      "Causas Não-Estruturais - Mnemônico COEIN"
    ],
    "provenanceDefault": "Visto em Ginecologia • Fisiologia Menstrual e Sangramento Uterino Anormal",
    "chips": [
      {
        "label": "Causas Estruturais - Mnemônico PALM",
        "letter": "1",
        "value": "Conceito de alta relevância em Sangramento Uterino Anormal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Causas Não-Estruturais - Mnemônico COEIN",
        "letter": "2",
        "value": "Conceito de alta relevância em Sangramento Uterino Anormal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Sangramento Uterino Anormal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Sangramento Uterino Anormal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-manejo-farmacologico-e-cirurgico-do",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Manejo Farmacológico e Cirúrgico do SU",
    "fullTitle": "Manejo Farmacológico e Cirúrgico do SUA (Fisiologia Menstrual e Sangramento Uterino Anormal)",
    "specialty": "Ginecologia",
    "tema": "Fisiologia Menstrual e Sangramento Uterino Anormal",
    "foco": "Manejo Farmacológico e Cirúrgico do SUA",
    "subfocos": [
      "Abordagem Aguda e Hemodinâmica do SUA Grave",
      "Tratamento Clínico Crônico e Opções Cirúrgicas"
    ],
    "provenanceDefault": "Visto em Ginecologia • Fisiologia Menstrual e Sangramento Uterino Anormal",
    "chips": [
      {
        "label": "Abordagem Aguda e Hemodinâmica do SUA Grave",
        "letter": "1",
        "value": "Conceito de alta relevância em Manejo Farmacológico e Cirúrgico do SUA: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Clínico Crônico e Opções Cirúrgicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Manejo Farmacológico e Cirúrgico do SUA: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Manejo Farmacológico e Cirúrgico do SUA: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Manejo Farmacológico e Cirúrgico do SUA: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-amenorreia-primaria",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Amenorreia Primária",
    "fullTitle": "Amenorreia Primária (Amenorreias e Distúrbios Neuroendócrinos)",
    "specialty": "Ginecologia",
    "tema": "Amenorreias e Distúrbios Neuroendócrinos",
    "foco": "Amenorreia Primária (Investigação e Disgenesias Gonadais)",
    "subfocos": [
      "Amenorreia Primária com Caracteres Sexuais Secundários Presentes",
      "Amenorreia Primária sem Caracteres Sexuais Secundários"
    ],
    "provenanceDefault": "Visto em Ginecologia • Amenorreias e Distúrbios Neuroendócrinos",
    "chips": [
      {
        "label": "Amenorreia Primária com Caracteres Sexuais Secundários Presentes",
        "letter": "1",
        "value": "Conceito de alta relevância em Amenorreia Primária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Amenorreia Primária sem Caracteres Sexuais Secundários",
        "letter": "2",
        "value": "Conceito de alta relevância em Amenorreia Primária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Amenorreia Primária: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Amenorreia Primária: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-amenorreia-secundaria",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Amenorreia Secundária",
    "fullTitle": "Amenorreia Secundária (Amenorreias e Distúrbios Neuroendócrinos)",
    "specialty": "Ginecologia",
    "tema": "Amenorreias e Distúrbios Neuroendócrinos",
    "foco": "Amenorreia Secundária (Investigação Passo a Passo)",
    "subfocos": [
      "Algoritmo Sequencial de Investigação da Amenorreia Secundária",
      "Causas Uterinas e Amenorreia Hipotalâmica Funcional"
    ],
    "provenanceDefault": "Visto em Ginecologia • Amenorreias e Distúrbios Neuroendócrinos",
    "chips": [
      {
        "label": "Algoritmo Sequencial de Investigação da Amenorreia Secundária",
        "letter": "1",
        "value": "Conceito de alta relevância em Amenorreia Secundária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Causas Uterinas e Amenorreia Hipotalâmica Funcional",
        "letter": "2",
        "value": "Conceito de alta relevância em Amenorreia Secundária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Amenorreia Secundária: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Amenorreia Secundária: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-hiperprolactinemia-e-adenomas-hipof",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hiperprolactinemia e Adenomas Hipofisá",
    "fullTitle": "Hiperprolactinemia e Adenomas Hipofisários (Amenorreias e Distúrbios Neuroendócrinos)",
    "specialty": "Ginecologia",
    "tema": "Amenorreias e Distúrbios Neuroendócrinos",
    "foco": "Hiperprolactinemia e Adenomas Hipofisários",
    "subfocos": [
      "Diagnóstico e Etiologia da Hiperprolactinemia",
      "Prolactinomas e Tratamento com Agonistas Dopaminérgicos"
    ],
    "provenanceDefault": "Visto em Ginecologia • Amenorreias e Distúrbios Neuroendócrinos",
    "chips": [
      {
        "label": "Diagnóstico e Etiologia da Hiperprolactinemia",
        "letter": "1",
        "value": "Conceito de alta relevância em Hiperprolactinemia e Adenomas Hipofisários: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Prolactinomas e Tratamento com Agonistas Dopaminérgicos",
        "letter": "2",
        "value": "Conceito de alta relevância em Hiperprolactinemia e Adenomas Hipofisários: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hiperprolactinemia e Adenomas Hipofisários: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hiperprolactinemia e Adenomas Hipofisários: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-falencia-ovariana-prematura",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Falência Ovariana Prematura",
    "fullTitle": "Falência Ovariana Prematura (Amenorreias e Distúrbios Neuroendócrinos)",
    "specialty": "Ginecologia",
    "tema": "Amenorreias e Distúrbios Neuroendócrinos",
    "foco": "Falência Ovariana Prematura",
    "subfocos": [
      "Diagnóstico e Quadro Clínico da Insuficiência Ovariana Prematura",
      "Terapia Hormonal e Riscos a Longo Prazo"
    ],
    "provenanceDefault": "Visto em Ginecologia • Amenorreias e Distúrbios Neuroendócrinos",
    "chips": [
      {
        "label": "Diagnóstico e Quadro Clínico da Insuficiência Ovariana Prematura",
        "letter": "1",
        "value": "Conceito de alta relevância em Falência Ovariana Prematura: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Terapia Hormonal e Riscos a Longo Prazo",
        "letter": "2",
        "value": "Conceito de alta relevância em Falência Ovariana Prematura: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Falência Ovariana Prematura: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Falência Ovariana Prematura: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-sindrome-dos-ovarios-policisticos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndrome dos Ovários Policísticos",
    "fullTitle": "Síndrome dos Ovários Policísticos (Síndrome dos Ovários Policísticos e Hiperandrogenismo)",
    "specialty": "Ginecologia",
    "tema": "Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "foco": "Síndrome dos Ovários Policísticos (SOP: Critérios de Rotterdam e Fenótipos)",
    "subfocos": [
      "Diagnóstico e Critérios de Rotterdam Atualizados",
      "Manejo Clínico, Metabólico e Reprodutivo da SOP"
    ],
    "provenanceDefault": "Visto em Ginecologia • Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "chips": [
      {
        "label": "Diagnóstico e Critérios de Rotterdam Atualizados",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndrome dos Ovários Policísticos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Clínico, Metabólico e Reprodutivo da SOP",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndrome dos Ovários Policísticos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndrome dos Ovários Policísticos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndrome dos Ovários Policísticos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-hiperandrogenismo-e-hirsutismo",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hiperandrogenismo e Hirsutismo",
    "fullTitle": "Hiperandrogenismo e Hirsutismo (Síndrome dos Ovários Policísticos e Hiperandrogenismo)",
    "specialty": "Ginecologia",
    "tema": "Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "foco": "Hiperandrogenismo e Hirsutismo",
    "subfocos": [
      "Avaliação Clínica do Hirsutismo e Escore de Ferriman-Gallwey",
      "Terapia Antiandrogênica Farmacológica"
    ],
    "provenanceDefault": "Visto em Ginecologia • Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "chips": [
      {
        "label": "Avaliação Clínica do Hirsutismo e Escore de Ferriman-Gallwey",
        "letter": "1",
        "value": "Conceito de alta relevância em Hiperandrogenismo e Hirsutismo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Terapia Antiandrogênica Farmacológica",
        "letter": "2",
        "value": "Conceito de alta relevância em Hiperandrogenismo e Hirsutismo: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hiperandrogenismo e Hirsutismo: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hiperandrogenismo e Hirsutismo: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-hiperplasia-adrenal-congenita-forma",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hiperplasia Adrenal Congênita Forma Nã",
    "fullTitle": "Hiperplasia Adrenal Congênita Forma Não-Clássica (Síndrome dos Ovários Policísticos e Hiperandrogenismo)",
    "specialty": "Ginecologia",
    "tema": "Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "foco": "Hiperplasia Adrenal Congênita Forma Não-Clássica",
    "subfocos": [
      "Diagnóstico da Deficiência Tardia da 21-Hidroxilase",
      "Tratamento com Glicocorticoides"
    ],
    "provenanceDefault": "Visto em Ginecologia • Síndrome dos Ovários Policísticos e Hiperandrogenismo",
    "chips": [
      {
        "label": "Diagnóstico da Deficiência Tardia da 21-Hidroxilase",
        "letter": "1",
        "value": "Conceito de alta relevância em Hiperplasia Adrenal Congênita Forma Não-Clássica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento com Glicocorticoides",
        "letter": "2",
        "value": "Conceito de alta relevância em Hiperplasia Adrenal Congênita Forma Não-Clássica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hiperplasia Adrenal Congênita Forma Não-Clássica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hiperplasia Adrenal Congênita Forma Não-Clássica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-sindrome-climaterica-e-fisiologia-d",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndrome Climatérica e Fisiologia da M",
    "fullTitle": "Síndrome Climatérica e Fisiologia da Menopausa (Climatério, Menopausa e Terapia Hormonal)",
    "specialty": "Ginecologia",
    "tema": "Climatério, Menopausa e Terapia Hormonal",
    "foco": "Síndrome Climatérica e Fisiologia da Menopausa",
    "subfocos": [
      "Fisiopatologia e Transição Menopáusica (Critérios STRAW)",
      "Sintomas Vasomotores e Alterações Neuropsíquicas"
    ],
    "provenanceDefault": "Visto em Ginecologia • Climatério, Menopausa e Terapia Hormonal",
    "chips": [
      {
        "label": "Fisiopatologia e Transição Menopáusica",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndrome Climatérica e Fisiologia da Menopausa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Sintomas Vasomotores e Alterações Neuropsíquicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndrome Climatérica e Fisiologia da Menopausa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndrome Climatérica e Fisiologia da Menopausa: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndrome Climatérica e Fisiologia da Menopausa: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-terapia-hormonal-da-menopausa",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Terapia Hormonal da Menopausa",
    "fullTitle": "Terapia Hormonal da Menopausa (Climatério, Menopausa e Terapia Hormonal)",
    "specialty": "Ginecologia",
    "tema": "Climatério, Menopausa e Terapia Hormonal",
    "foco": "Terapia Hormonal da Menopausa (Indicações, Janela de Oportunidade e Contraindicações)",
    "subfocos": [
      "Indicações Formais e a \"Janela de Oportunidade\"",
      "Contraindicações Absolutas da Terapia Hormonal"
    ],
    "provenanceDefault": "Visto em Ginecologia • Climatério, Menopausa e Terapia Hormonal",
    "chips": [
      {
        "label": "Indicações Formais e a \"Janela de Oportunidade\"",
        "letter": "1",
        "value": "Conceito de alta relevância em Terapia Hormonal da Menopausa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Contraindicações Absolutas da Terapia Hormonal",
        "letter": "2",
        "value": "Conceito de alta relevância em Terapia Hormonal da Menopausa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Terapia Hormonal da Menopausa: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Terapia Hormonal da Menopausa: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-osteoporose-pos-menopausa-e-risco-d",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Osteoporose Pós-Menopausa e Risco de F",
    "fullTitle": "Osteoporose Pós-Menopausa e Risco de Fratura (Climatério, Menopausa e Terapia Hormonal)",
    "specialty": "Ginecologia",
    "tema": "Climatério, Menopausa e Terapia Hormonal",
    "foco": "Osteoporose Pós-Menopausa e Risco de Fratura",
    "subfocos": [
      "Densitometria Óssea e Critérios da OMS (T-Score)",
      "Farmacoterapia da Osteoporose (Bisfosfonatos e Anabólicos)"
    ],
    "provenanceDefault": "Visto em Ginecologia • Climatério, Menopausa e Terapia Hormonal",
    "chips": [
      {
        "label": "Densitometria Óssea e Critérios da OMS",
        "letter": "1",
        "value": "Conceito de alta relevância em Osteoporose Pós-Menopausa e Risco de Fratura: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Farmacoterapia da Osteoporose",
        "letter": "2",
        "value": "Conceito de alta relevância em Osteoporose Pós-Menopausa e Risco de Fratura: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Osteoporose Pós-Menopausa e Risco de Fratura: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Osteoporose Pós-Menopausa e Risco de Fratura: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-sindrome-geniturinaria-da-menopausa",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndrome Geniturinária da Menopausa",
    "fullTitle": "Síndrome Geniturinária da Menopausa (Climatério, Menopausa e Terapia Hormonal)",
    "specialty": "Ginecologia",
    "tema": "Climatério, Menopausa e Terapia Hormonal",
    "foco": "Síndrome Geniturinária da Menopausa",
    "subfocos": [
      "Atrofia Vulvovaginal e Dispareunia",
      "Tratamento Tópico Local com Estrogênios"
    ],
    "provenanceDefault": "Visto em Ginecologia • Climatério, Menopausa e Terapia Hormonal",
    "chips": [
      {
        "label": "Atrofia Vulvovaginal e Dispareunia",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndrome Geniturinária da Menopausa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Tópico Local com Estrogênios",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndrome Geniturinária da Menopausa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndrome Geniturinária da Menopausa: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndrome Geniturinária da Menopausa: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-contraceptivos-orais-combinados-e-i",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Contraceptivos Orais Combinados e Inje",
    "fullTitle": "Contraceptivos Orais Combinados e Injetáveis (Planejamento Familiar e Métodos Contraceptivos)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Contraceptivos Orais Combinados e Injetáveis",
    "subfocos": [
      "Mecanismo de Ação e Efeitos dos Hormônios Combinados",
      "Injetável Mensal e Regras de Tomada / Esquecimento"
    ],
    "provenanceDefault": "Visto em Ginecologia • Planejamento Familiar e Métodos Contraceptivos",
    "chips": [
      {
        "label": "Mecanismo de Ação e Efeitos dos Hormônios Combinados",
        "letter": "1",
        "value": "Conceito de alta relevância em Contraceptivos Orais Combinados e Injetáveis: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Injetável Mensal e Regras de Tomada / Esquecimento",
        "letter": "2",
        "value": "Conceito de alta relevância em Contraceptivos Orais Combinados e Injetáveis: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Contraceptivos Orais Combinados e Injetáveis: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Contraceptivos Orais Combinados e Injetáveis: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-metodos-contraceptivos-progestageni",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Métodos Contraceptivos Progestagênicos",
    "fullTitle": "Métodos Contraceptivos Progestagênicos Exclusivos (Planejamento Familiar e Métodos Contraceptivos)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Métodos Contraceptivos Progestagênicos Exclusivos",
    "subfocos": [
      "Minipílula e Pílula de Desogestrel",
      "Acetato de Medroxiprogesterona de Depósito (AMPD Trimestral)"
    ],
    "provenanceDefault": "Visto em Ginecologia • Planejamento Familiar e Métodos Contraceptivos",
    "chips": [
      {
        "label": "Minipílula e Pílula de Desogestrel",
        "letter": "1",
        "value": "Conceito de alta relevância em Métodos Contraceptivos Progestagênicos Exclusivos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Acetato de Medroxiprogesterona de Depósito",
        "letter": "2",
        "value": "Conceito de alta relevância em Métodos Contraceptivos Progestagênicos Exclusivos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Métodos Contraceptivos Progestagênicos Exclusivos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Métodos Contraceptivos Progestagênicos Exclusivos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-dispositivos-intrauterinos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Dispositivos Intrauterinos",
    "fullTitle": "Dispositivos Intrauterinos (Planejamento Familiar e Métodos Contraceptivos)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Dispositivos Intrauterinos (DIU de Cobre e SIU de Levonorgestrel)",
    "subfocos": [
      "Comparação Clínica: DIU T-Cobre vs SIU-LNG",
      "Inserção, Contraindicações e Manejo de Complicações"
    ],
    "provenanceDefault": "Visto em Ginecologia • Planejamento Familiar e Métodos Contraceptivos",
    "chips": [
      {
        "label": "Comparação Clínica: DIU T-Cobre vs SIU-LNG",
        "letter": "1",
        "value": "Conceito de alta relevância em Dispositivos Intrauterinos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Inserção, Contraindicações e Manejo de Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Dispositivos Intrauterinos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Dispositivos Intrauterinos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Dispositivos Intrauterinos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-implante-subdermico-de-etonogestrel",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Implante Subdérmico de Etonogestrel",
    "fullTitle": "Implante Subdérmico de Etonogestrel (Planejamento Familiar e Métodos Contraceptivos)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Implante Subdérmico de Etonogestrel",
    "subfocos": [
      "Mecanismo de Ação, Inserção e Critérios de Elegibilidade (MEC da OMS)",
      "Eventos Adversos e Manejo do Padrão de Sangramento Irregular"
    ],
    "provenanceDefault": "Visto em Ginecologia • Planejamento Familiar e Métodos Contraceptivos",
    "chips": [
      {
        "label": "Mecanismo de Ação, Inserção e Critérios de Elegibilidade",
        "letter": "1",
        "value": "Conceito de alta relevância em Implante Subdérmico de Etonogestrel: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Eventos Adversos e Manejo do Padrão de Sangramento Irregular",
        "letter": "2",
        "value": "Conceito de alta relevância em Implante Subdérmico de Etonogestrel: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Implante Subdérmico de Etonogestrel: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Implante Subdérmico de Etonogestrel: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-criterios-medicos-de-elegibilidade-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Critérios Médicos de Elegibilidade da ",
    "fullTitle": "Critérios Médicos de Elegibilidade da OMS (Planejamento Familiar e Métodos Contraceptivos)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Critérios Médicos de Elegibilidade da OMS",
    "subfocos": [
      "Categorias 1 a 4 da OMS e Interpretação",
      "Situações Clínicas Críticas de Categoria 4 para Métodos Combinados"
    ],
    "provenanceDefault": "Visto em Ginecologia • Planejamento Familiar e Métodos Contraceptivos",
    "chips": [
      {
        "label": "Categorias 1 a 4 da OMS e Interpretação",
        "letter": "1",
        "value": "Conceito de alta relevância em Critérios Médicos de Elegibilidade da OMS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Situações Clínicas Críticas de Categoria 4 para Métodos Combinados",
        "letter": "2",
        "value": "Conceito de alta relevância em Critérios Médicos de Elegibilidade da OMS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Critérios Médicos de Elegibilidade da OMS: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Critérios Médicos de Elegibilidade da OMS: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-contracepcao-de-emergencia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Contracepção de Emergência",
    "fullTitle": "Contracepção de Emergência (Planejamento Familiar e Métodos Contraceptivos)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Contracepção de Emergência",
    "subfocos": [
      "Levonorgestrel Oral e Acetato de Ulipristal",
      "DIU de Cobre como Contracepção de Emergência Pós-Coito"
    ],
    "provenanceDefault": "Visto em Ginecologia • Planejamento Familiar e Métodos Contraceptivos",
    "chips": [
      {
        "label": "Levonorgestrel Oral e Acetato de Ulipristal",
        "letter": "1",
        "value": "Conceito de alta relevância em Contracepção de Emergência: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "DIU de Cobre como Contracepção de Emergência Pós-Coito",
        "letter": "2",
        "value": "Conceito de alta relevância em Contracepção de Emergência: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Contracepção de Emergência: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Contracepção de Emergência: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-contracepcao-cirurgica-definitiva",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Contracepção Cirúrgica Definitiva",
    "fullTitle": "Contracepção Cirúrgica Definitiva (Planejamento Familiar e Métodos Contraceptivos)",
    "specialty": "Ginecologia",
    "tema": "Planejamento Familiar e Métodos Contraceptivos",
    "foco": "Contracepção Cirúrgica Definitiva (Laqueadura Tubária)",
    "subfocos": [
      "Legislação Brasileira e Critérios de Elegibilidade (Lei 14.443/2022)",
      "Técnicas Cirúrgicas e Salpingectomia Oportunística"
    ],
    "provenanceDefault": "Visto em Ginecologia • Planejamento Familiar e Métodos Contraceptivos",
    "chips": [
      {
        "label": "Legislação Brasileira e Critérios de Elegibilidade",
        "letter": "1",
        "value": "Conceito de alta relevância em Contracepção Cirúrgica Definitiva: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Técnicas Cirúrgicas e Salpingectomia Oportunística",
        "letter": "2",
        "value": "Conceito de alta relevância em Contracepção Cirúrgica Definitiva: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Contracepção Cirúrgica Definitiva: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Contracepção Cirúrgica Definitiva: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-vaginose-bacteriana",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vaginose Bacteriana",
    "fullTitle": "Vaginose Bacteriana (Infecções Ginecológicas e Doença Inflamatória Pélvica)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Vaginose Bacteriana",
    "subfocos": [
      "Diagnóstico Clínico e Critérios de Amsel",
      "Tratamento com Metronidazol e Manejo na Gestação"
    ],
    "provenanceDefault": "Visto em Ginecologia • Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "chips": [
      {
        "label": "Diagnóstico Clínico e Critérios de Amsel",
        "letter": "1",
        "value": "Conceito de alta relevância em Vaginose Bacteriana: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento com Metronidazol e Manejo na Gestação",
        "letter": "2",
        "value": "Conceito de alta relevância em Vaginose Bacteriana: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vaginose Bacteriana: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vaginose Bacteriana: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-candidiase-vulvovaginal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Candidíase Vulvovaginal",
    "fullTitle": "Candidíase Vulvovaginal (Infecções Ginecológicas e Doença Inflamatória Pélvica)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Candidíase Vulvovaginal",
    "subfocos": [
      "Quadro Clínico e Exame a Fresco",
      "Tratamento Farmacológico e Candidíase Recorrente"
    ],
    "provenanceDefault": "Visto em Ginecologia • Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "chips": [
      {
        "label": "Quadro Clínico e Exame a Fresco",
        "letter": "1",
        "value": "Conceito de alta relevância em Candidíase Vulvovaginal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Farmacológico e Candidíase Recorrente",
        "letter": "2",
        "value": "Conceito de alta relevância em Candidíase Vulvovaginal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Candidíase Vulvovaginal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Candidíase Vulvovaginal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-tricomoniase-vaginal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Tricomoníase Vaginal",
    "fullTitle": "Tricomoníase Vaginal (Infecções Ginecológicas e Doença Inflamatória Pélvica)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Tricomoníase Vaginal",
    "subfocos": [
      "Manifestações Clínicas e Exame a Fresco",
      "Tratamento Mandatório do Casal"
    ],
    "provenanceDefault": "Visto em Ginecologia • Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "chips": [
      {
        "label": "Manifestações Clínicas e Exame a Fresco",
        "letter": "1",
        "value": "Conceito de alta relevância em Tricomoníase Vaginal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Mandatório do Casal",
        "letter": "2",
        "value": "Conceito de alta relevância em Tricomoníase Vaginal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Tricomoníase Vaginal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Tricomoníase Vaginal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-cervicites",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cervicites",
    "fullTitle": "Cervicites (Infecções Ginecológicas e Doença Inflamatória Pélvica)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Cervicites (Clamídia e Gonococo)",
    "subfocos": [
      "Diagnóstico Clínico e Propedêutica Laboratorial (NAAT/PCR)",
      "Esquemas Terapêuticos e Tratamento de Parceiros"
    ],
    "provenanceDefault": "Visto em Ginecologia • Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "chips": [
      {
        "label": "Diagnóstico Clínico e Propedêutica Laboratorial",
        "letter": "1",
        "value": "Conceito de alta relevância em Cervicites: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Esquemas Terapêuticos e Tratamento de Parceiros",
        "letter": "2",
        "value": "Conceito de alta relevância em Cervicites: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cervicites: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cervicites: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-doenca-inflamatoria-pelvica",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Doença Inflamatória Pélvica",
    "fullTitle": "Doença Inflamatória Pélvica (Infecções Ginecológicas e Doença Inflamatória Pélvica)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Doença Inflamatória Pélvica (DIP: Critérios Diagnósticos, Estágios e Tratamento)",
    "subfocos": [
      "Critérios Diagnósticos (Maiores, Menores e Elaborados) e Estadiamento de Monif",
      "Tratamento Ambulatorial vs Hospitalar e Complicações Crônicas"
    ],
    "provenanceDefault": "Visto em Ginecologia • Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "chips": [
      {
        "label": "Critérios Diagnósticos",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Inflamatória Pélvica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento Ambulatorial vs Hospitalar e Complicações Crônicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Inflamatória Pélvica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Inflamatória Pélvica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Inflamatória Pélvica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-ulceras-genitais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Úlceras Genitais",
    "fullTitle": "Úlceras Genitais (Infecções Ginecológicas e Doença Inflamatória Pélvica)",
    "specialty": "Ginecologia",
    "tema": "Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "foco": "Úlceras Genitais (Sífilis Primária, Cancro Mole, Herpes Genital, Linfogranuloma, Donovanose)",
    "subfocos": [
      "Diagnóstico Diferencial Clínico das Úlceras Genitais",
      "Manejo Propedêutico e Abordagem Sindrômica do Ministério da Saúde"
    ],
    "provenanceDefault": "Visto em Ginecologia • Infecções Ginecológicas e Doença Inflamatória Pélvica",
    "chips": [
      {
        "label": "Diagnóstico Diferencial Clínico das Úlceras Genitais",
        "letter": "1",
        "value": "Conceito de alta relevância em Úlceras Genitais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Propedêutico e Abordagem Sindrômica do Ministério da Saúde",
        "letter": "2",
        "value": "Conceito de alta relevância em Úlceras Genitais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Úlceras Genitais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Úlceras Genitais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-endometriose-pelvica-e-ovariana",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Endometriose Pélvica e Ovariana",
    "fullTitle": "Endometriose Pélvica e Ovariana (Endometriose e Dor Pélvica Crônica)",
    "specialty": "Ginecologia",
    "tema": "Endometriose e Dor Pélvica Crônica",
    "foco": "Endometriose Pélvica e Ovariana (Endometrioma)",
    "subfocos": [
      "Quadro Clínico e os \"6 Ds\" da Endometriose",
      "Mapeamento por Imagem e Terapêutica Escalonada"
    ],
    "provenanceDefault": "Visto em Ginecologia • Endometriose e Dor Pélvica Crônica",
    "chips": [
      {
        "label": "Quadro Clínico e os \"6 Ds\" da Endometriose",
        "letter": "1",
        "value": "Conceito de alta relevância em Endometriose Pélvica e Ovariana: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Mapeamento por Imagem e Terapêutica Escalonada",
        "letter": "2",
        "value": "Conceito de alta relevância em Endometriose Pélvica e Ovariana: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Endometriose Pélvica e Ovariana: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Endometriose Pélvica e Ovariana: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-adenomiose-uterina",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Adenomiose Uterina",
    "fullTitle": "Adenomiose Uterina (Endometriose e Dor Pélvica Crônica)",
    "specialty": "Ginecologia",
    "tema": "Endometriose e Dor Pélvica Crônica",
    "foco": "Adenomiose Uterina",
    "subfocos": [
      "Fisiopatologia e Diagnóstico por Imagem da Adenomiose",
      "Manejo Clínico vs Histerectomia"
    ],
    "provenanceDefault": "Visto em Ginecologia • Endometriose e Dor Pélvica Crônica",
    "chips": [
      {
        "label": "Fisiopatologia e Diagnóstico por Imagem da Adenomiose",
        "letter": "1",
        "value": "Conceito de alta relevância em Adenomiose Uterina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Clínico vs Histerectomia",
        "letter": "2",
        "value": "Conceito de alta relevância em Adenomiose Uterina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Adenomiose Uterina: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Adenomiose Uterina: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-dor-pelvica-cronica-e-dismenorreia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Dor Pélvica Crônica e Dismenorreia",
    "fullTitle": "Dor Pélvica Crônica e Dismenorreia (Endometriose e Dor Pélvica Crônica)",
    "specialty": "Ginecologia",
    "tema": "Endometriose e Dor Pélvica Crônica",
    "foco": "Dor Pélvica Crônica e Dismenorreia",
    "subfocos": [
      "Dismenorreia Primária vs Secundária",
      "Investigação e Manejo da Dor Pélvica Crônica Não-Cíclica"
    ],
    "provenanceDefault": "Visto em Ginecologia • Endometriose e Dor Pélvica Crônica",
    "chips": [
      {
        "label": "Dismenorreia Primária vs Secundária",
        "letter": "1",
        "value": "Conceito de alta relevância em Dor Pélvica Crônica e Dismenorreia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Investigação e Manejo da Dor Pélvica Crônica Não-Cíclica",
        "letter": "2",
        "value": "Conceito de alta relevância em Dor Pélvica Crônica e Dismenorreia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Dor Pélvica Crônica e Dismenorreia: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Dor Pélvica Crônica e Dismenorreia: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-leiomiomatose-uterina",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Leiomiomatose Uterina",
    "fullTitle": "Leiomiomatose Uterina (Afecções Benignas do Trato Genital Feminino)",
    "specialty": "Ginecologia",
    "tema": "Afecções Benignas do Trato Genital Feminino",
    "foco": "Leiomiomatose Uterina (Miomas: Sintomas, Classificação FIGO e Conduta)",
    "subfocos": [
      "Classificação Anatômica FIGO e Sintomatologia",
      "Abordagem Cirúrgica Conservadora vs Definitiva"
    ],
    "provenanceDefault": "Visto em Ginecologia • Afecções Benignas do Trato Genital Feminino",
    "chips": [
      {
        "label": "Classificação Anatômica FIGO e Sintomatologia",
        "letter": "1",
        "value": "Conceito de alta relevância em Leiomiomatose Uterina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Abordagem Cirúrgica Conservadora vs Definitiva",
        "letter": "2",
        "value": "Conceito de alta relevância em Leiomiomatose Uterina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Leiomiomatose Uterina: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Leiomiomatose Uterina: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-polipos-endometriais-e-cervicais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Pólipos Endometriais e Cervicais",
    "fullTitle": "Pólipos Endometriais e Cervicais (Afecções Benignas do Trato Genital Feminino)",
    "specialty": "Ginecologia",
    "tema": "Afecções Benignas do Trato Genital Feminino",
    "foco": "Pólipos Endometriais e Cervicais",
    "subfocos": [
      "Quadro Clínico, Propedêutica por Imagem e Histeroscopia",
      "Indicações Cirúrgicas e Polipectomia Histeroscópica"
    ],
    "provenanceDefault": "Visto em Ginecologia • Afecções Benignas do Trato Genital Feminino",
    "chips": [
      {
        "label": "Quadro Clínico, Propedêutica por Imagem e Histeroscopia",
        "letter": "1",
        "value": "Conceito de alta relevância em Pólipos Endometriais e Cervicais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Indicações Cirúrgicas e Polipectomia Histeroscópica",
        "letter": "2",
        "value": "Conceito de alta relevância em Pólipos Endometriais e Cervicais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Pólipos Endometriais e Cervicais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Pólipos Endometriais e Cervicais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-cistos-e-tumores-ovarianos-benignos",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cistos e Tumores Ovarianos Benignos",
    "fullTitle": "Cistos e Tumores Ovarianos Benignos (Afecções Benignas do Trato Genital Feminino)",
    "specialty": "Ginecologia",
    "tema": "Afecções Benignas do Trato Genital Feminino",
    "foco": "Cistos e Tumores Ovarianos Benignos (Teratoma Cístico, Cistoadenoma)",
    "subfocos": [
      "Classificação e Diagnóstico Diferencial de Massas Anexiais Benignas",
      "Cistoadenomas (Seroso e Mucinoso) e Indicações Cirúrgicas"
    ],
    "provenanceDefault": "Visto em Ginecologia • Afecções Benignas do Trato Genital Feminino",
    "chips": [
      {
        "label": "Classificação e Diagnóstico Diferencial de Massas Anexiais Benignas",
        "letter": "1",
        "value": "Conceito de alta relevância em Cistos e Tumores Ovarianos Benignos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cistoadenomas",
        "letter": "2",
        "value": "Conceito de alta relevância em Cistos e Tumores Ovarianos Benignos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cistos e Tumores Ovarianos Benignos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cistos e Tumores Ovarianos Benignos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-vulvovaginites-atroficas-e-doencas-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vulvovaginites Atróficas e Doenças Ben",
    "fullTitle": "Vulvovaginites Atróficas e Doenças Benignas da Vulva (Afecções Benignas do Trato Genital Feminino)",
    "specialty": "Ginecologia",
    "tema": "Afecções Benignas do Trato Genital Feminino",
    "foco": "Vulvovaginites Atróficas e Doenças Benignas da Vulva (Líquen Escleroso)",
    "subfocos": [
      "Síndrome Geniturinária da Menopausa / Vaginite Atrófica",
      "Líquen Escleroso Vulvar e Lesões Dermatológicas Vulvares"
    ],
    "provenanceDefault": "Visto em Ginecologia • Afecções Benignas do Trato Genital Feminino",
    "chips": [
      {
        "label": "Síndrome Geniturinária da Menopausa / Vaginite Atrófica",
        "letter": "1",
        "value": "Conceito de alta relevância em Vulvovaginites Atróficas e Doenças Benignas da Vulva: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Líquen Escleroso Vulvar e Lesões Dermatológicas Vulvares",
        "letter": "2",
        "value": "Conceito de alta relevância em Vulvovaginites Atróficas e Doenças Benignas da Vulva: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vulvovaginites Atróficas e Doenças Benignas da Vulva: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vulvovaginites Atróficas e Doenças Benignas da Vulva: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-rastreamento-e-prevencao-do-cancer-",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Exames de Rotina",
    "title": "Rastreamento e Prevenção do Câncer de ",
    "fullTitle": "Rastreamento e Prevenção do Câncer de Colo Uterino (Cânceres Ginecológicos e Lesões Precursoras)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Rastreamento e Prevenção do Câncer de Colo Uterino (Citologia, HPV e Colposcopia)",
    "subfocos": [
      "Diretrizes Nacionais do Ministério da Saúde para o Rastreamento",
      "Técnica de Coleta Citopatológica (Papanicolau)"
    ],
    "provenanceDefault": "Visto em Ginecologia • Cânceres Ginecológicos e Lesões Precursoras",
    "chips": [
      {
        "label": "Diretrizes Nacionais do Ministério da Saúde para o Rastreamento",
        "letter": "1",
        "value": "Conceito de alta relevância em Rastreamento e Prevenção do Câncer de Colo Uterino: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Técnica de Coleta Citopatológica",
        "letter": "2",
        "value": "Conceito de alta relevância em Rastreamento e Prevenção do Câncer de Colo Uterino: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rastreamento e Prevenção do Câncer de Colo Uterino: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rastreamento e Prevenção do Câncer de Colo Uterino: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-neoplasias-intraepiteliais-cervicai",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Neoplasias Intraepiteliais Cervicais  ",
    "fullTitle": "Neoplasias Intraepiteliais Cervicais  e Lesões Precursoras (Cânceres Ginecológicos e Lesões Precursoras)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Neoplasias Intraepiteliais Cervicais (NIC) e Lesões Precursoras",
    "subfocos": [
      "Conduta nas Alterações Citológicas do Colo Uterino (Diretrizes MS)",
      "Colposcopia e Métodos Excisionais (CAF vs Cone a Frio)"
    ],
    "provenanceDefault": "Visto em Ginecologia • Cânceres Ginecológicos e Lesões Precursoras",
    "chips": [
      {
        "label": "Conduta nas Alterações Citológicas do Colo Uterino",
        "letter": "1",
        "value": "Conceito de alta relevância em Neoplasias Intraepiteliais Cervicais  e Lesões Precursoras: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Colposcopia e Métodos Excisionais",
        "letter": "2",
        "value": "Conceito de alta relevância em Neoplasias Intraepiteliais Cervicais  e Lesões Precursoras: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Neoplasias Intraepiteliais Cervicais  e Lesões Precursoras: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Neoplasias Intraepiteliais Cervicais  e Lesões Precursoras: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-cancer-de-colo-uterino-invasor",
    "category": "criterios",
    "categoryLabel": "Critérios & Escores Diagnósticos",
    "title": "Câncer de Colo Uterino Invasor",
    "fullTitle": "Câncer de Colo Uterino Invasor (Cânceres Ginecológicos e Lesões Precursoras)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Câncer de Colo Uterino Invasor (Estadiamento e Conduta)",
    "subfocos": [
      "Estadiamento Clínico FIGO 2018 do Câncer de Colo Uterino",
      "Conduta Terapêutica por Estádio e Preservação de Fertilidade"
    ],
    "provenanceDefault": "Visto em Ginecologia • Cânceres Ginecológicos e Lesões Precursoras",
    "chips": [
      {
        "label": "Estadiamento Clínico FIGO 2018 do Câncer de Colo Uterino",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Colo Uterino Invasor: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Conduta Terapêutica por Estádio e Preservação de Fertilidade",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Colo Uterino Invasor: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Colo Uterino Invasor: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Colo Uterino Invasor: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-cancer-de-endometrio-e-hiperplasia-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Endométrio e Hiperplasia End",
    "fullTitle": "Câncer de Endométrio e Hiperplasia Endometrial (Cânceres Ginecológicos e Lesões Precursoras)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Câncer de Endométrio e Hiperplasia Endometrial",
    "subfocos": [
      "Hiperplasia Endometrial (Sem Atipia vs Atípica / EIN)",
      "Câncer de Endométrio: Diagnóstico, Tipos Histológicos e Estadiamento"
    ],
    "provenanceDefault": "Visto em Ginecologia • Cânceres Ginecológicos e Lesões Precursoras",
    "chips": [
      {
        "label": "Hiperplasia Endometrial",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Endométrio e Hiperplasia Endometrial: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Câncer de Endométrio: Diagnóstico, Tipos Histológicos e Estadiamento",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Endométrio e Hiperplasia Endometrial: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Endométrio e Hiperplasia Endometrial: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Endométrio e Hiperplasia Endometrial: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-cancer-de-ovario-e-tumores-anexiais",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Câncer de Ovário e Tumores Anexiais Su",
    "fullTitle": "Câncer de Ovário e Tumores Anexiais Suspeitos (Cânceres Ginecológicos e Lesões Precursoras)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Câncer de Ovário e Tumores Anexiais Suspeitos",
    "subfocos": [
      "Critérios Ultrassonográficos de Suspeita (IOTA) e Marcadores Tumorais (CA-125, HE4, ROMA)",
      "Tipos Histológicos e Cirurgia Citorredutora Estadiadora"
    ],
    "provenanceDefault": "Visto em Ginecologia • Cânceres Ginecológicos e Lesões Precursoras",
    "chips": [
      {
        "label": "Critérios Ultrassonográficos de Suspeita",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Ovário e Tumores Anexiais Suspeitos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tipos Histológicos e Cirurgia Citorredutora Estadiadora",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Ovário e Tumores Anexiais Suspeitos: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Ovário e Tumores Anexiais Suspeitos: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Ovário e Tumores Anexiais Suspeitos: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-neoplasias-malignas-da-vulva-e-vagi",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Neoplasias Malignas da Vulva e Vagina",
    "fullTitle": "Neoplasias Malignas da Vulva e Vagina (Cânceres Ginecológicos e Lesões Precursoras)",
    "specialty": "Ginecologia",
    "tema": "Cânceres Ginecológicos e Lesões Precursoras",
    "foco": "Neoplasias Malignas da Vulva e Vagina",
    "subfocos": [
      "Neoplasia Intraepitelial Vulvar (NIV) e Carcinoma de Células Escamosas da Vulva",
      "Estadiamento e Tratamento Cirúrgico da Doença Vulvar"
    ],
    "provenanceDefault": "Visto em Ginecologia • Cânceres Ginecológicos e Lesões Precursoras",
    "chips": [
      {
        "label": "Neoplasia Intraepitelial Vulvar",
        "letter": "1",
        "value": "Conceito de alta relevância em Neoplasias Malignas da Vulva e Vagina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Estadiamento e Tratamento Cirúrgico da Doença Vulvar",
        "letter": "2",
        "value": "Conceito de alta relevância em Neoplasias Malignas da Vulva e Vagina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Neoplasias Malignas da Vulva e Vagina: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Neoplasias Malignas da Vulva e Vagina: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-rastreamento-do-cancer-de-mama-e-cl",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Exames de Rotina",
    "title": "Rastreamento do Câncer de Mama e Class",
    "fullTitle": "Rastreamento do Câncer de Mama e Classificação BI-RADS (Doenças da Mama e Rastreamento)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Rastreamento do Câncer de Mama e Classificação BI-RADS",
    "subfocos": [
      "Diretrizes de Rastreamento Mamográfico",
      "Classificação BI-RADS e Condutas Radiológicas"
    ],
    "provenanceDefault": "Visto em Ginecologia • Doenças da Mama e Rastreamento",
    "chips": [
      {
        "label": "Diretrizes de Rastreamento Mamográfico",
        "letter": "1",
        "value": "Conceito de alta relevância em Rastreamento do Câncer de Mama e Classificação BI-RADS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Classificação BI-RADS e Condutas Radiológicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Rastreamento do Câncer de Mama e Classificação BI-RADS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rastreamento do Câncer de Mama e Classificação BI-RADS: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rastreamento do Câncer de Mama e Classificação BI-RADS: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-cancer-de-mama",
    "category": "criterios",
    "categoryLabel": "Critérios & Escores Diagnósticos",
    "title": "Câncer de Mama",
    "fullTitle": "Câncer de Mama (Doenças da Mama e Rastreamento)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Câncer de Mama (Diagnóstico, Subtipos Moleculares e Estadiamento)",
    "subfocos": [
      "Investigação Diagnóstica, Core Biopsy e Mamotomia",
      "Subtipos Moleculares Imuno-histoquímicos e Princípios Terapêuticos"
    ],
    "provenanceDefault": "Visto em Ginecologia • Doenças da Mama e Rastreamento",
    "chips": [
      {
        "label": "Investigação Diagnóstica, Core Biopsy e Mamotomia",
        "letter": "1",
        "value": "Conceito de alta relevância em Câncer de Mama: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Subtipos Moleculares Imuno-histoquímicos e Princípios Terapêuticos",
        "letter": "2",
        "value": "Conceito de alta relevância em Câncer de Mama: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Câncer de Mama: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Câncer de Mama: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-doencas-benignas-da-mama",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doenças Benignas da Mama",
    "fullTitle": "Doenças Benignas da Mama (Doenças da Mama e Rastreamento)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Doenças Benignas da Mama (Fibroadenoma e Cistos Mamários)",
    "subfocos": [
      "Fibroadenoma Mamário: Diagnóstico e Manejo",
      "Cistos Mamários e Alterações Funcionais Benignas da Mama"
    ],
    "provenanceDefault": "Visto em Ginecologia • Doenças da Mama e Rastreamento",
    "chips": [
      {
        "label": "Fibroadenoma Mamário: Diagnóstico e Manejo",
        "letter": "1",
        "value": "Conceito de alta relevância em Doenças Benignas da Mama: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Cistos Mamários e Alterações Funcionais Benignas da Mama",
        "letter": "2",
        "value": "Conceito de alta relevância em Doenças Benignas da Mama: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doenças Benignas da Mama: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doenças Benignas da Mama: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-mastalgia-e-descarga-papilar",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Mastalgia e Descarga Papilar",
    "fullTitle": "Mastalgia e Descarga Papilar (Doenças da Mama e Rastreamento)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Mastalgia e Descarga Papilar",
    "subfocos": [
      "Mastalgia Cíclica vs Não-Cíclica",
      "Descarga Papilar: Características de Suspeita e Conduta"
    ],
    "provenanceDefault": "Visto em Ginecologia • Doenças da Mama e Rastreamento",
    "chips": [
      {
        "label": "Mastalgia Cíclica vs Não-Cíclica",
        "letter": "1",
        "value": "Conceito de alta relevância em Mastalgia e Descarga Papilar: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Descarga Papilar: Características de Suspeita e Conduta",
        "letter": "2",
        "value": "Conceito de alta relevância em Mastalgia e Descarga Papilar: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Mastalgia e Descarga Papilar: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Mastalgia e Descarga Papilar: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-gine-mastites-e-abscessos-mamarios-nao-p",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Mastites e Abscessos Mamários Não-Puer",
    "fullTitle": "Mastites e Abscessos Mamários Não-Puerperais (Doenças da Mama e Rastreamento)",
    "specialty": "Ginecologia",
    "tema": "Doenças da Mama e Rastreamento",
    "foco": "Mastites e Abscessos Mamários Não-Puerperais",
    "subfocos": [
      "Mastite Periductal e Ectasia Ductal",
      "Abscessos Mamários Subareolares e Mastite Granulomatosa"
    ],
    "provenanceDefault": "Visto em Ginecologia • Doenças da Mama e Rastreamento",
    "chips": [
      {
        "label": "Mastite Periductal e Ectasia Ductal",
        "letter": "1",
        "value": "Conceito de alta relevância em Mastites e Abscessos Mamários Não-Puerperais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Abscessos Mamários Subareolares e Mastite Granulomatosa",
        "letter": "2",
        "value": "Conceito de alta relevância em Mastites e Abscessos Mamários Não-Puerperais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Mastites e Abscessos Mamários Não-Puerperais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Mastites e Abscessos Mamários Não-Puerperais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-modificacoes-fisiologicas-da-gravid",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Modificações Fisiológicas da Gravidez",
    "fullTitle": "Modificações Fisiológicas da Gravidez (Assistência Pré-Natal e Fisiologia Gestacional)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Modificações Fisiológicas da Gravidez (Cardiovasculares, Renais, Hematológicas)",
    "subfocos": [
      "Modificações Cardiovasculares e Hematológicas",
      "Modificações Renais, Digestivas e Respiratórias"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Assistência Pré-Natal e Fisiologia Gestacional",
    "chips": [
      {
        "label": "Modificações Cardiovasculares e Hematológicas",
        "letter": "1",
        "value": "Conceito de alta relevância em Modificações Fisiológicas da Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Modificações Renais, Digestivas e Respiratórias",
        "letter": "2",
        "value": "Conceito de alta relevância em Modificações Fisiológicas da Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Modificações Fisiológicas da Gravidez: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Modificações Fisiológicas da Gravidez: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-rotina-do-pre-natal-de-baixo-risco",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Rotina do Pré-Natal de Baixo Risco",
    "fullTitle": "Rotina do Pré-Natal de Baixo Risco (Assistência Pré-Natal e Fisiologia Gestacional)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Rotina do Pré-Natal de Baixo Risco (Consultas, Exames e Calendário)",
    "subfocos": [
      "Cronograma e Consultas de Rotina (MS/Febrasgo)",
      "Exames Complementares do 2º e 3º Trimestres"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Assistência Pré-Natal e Fisiologia Gestacional",
    "chips": [
      {
        "label": "Cronograma e Consultas de Rotina",
        "letter": "1",
        "value": "Conceito de alta relevância em Rotina do Pré-Natal de Baixo Risco: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Exames Complementares do 2º e 3º Trimestres",
        "letter": "2",
        "value": "Conceito de alta relevância em Rotina do Pré-Natal de Baixo Risco: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rotina do Pré-Natal de Baixo Risco: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rotina do Pré-Natal de Baixo Risco: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-vacinacao-e-suplementacao-na-gestac",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vacinação e Suplementação na Gestação",
    "fullTitle": "Vacinação e Suplementação na Gestação (Assistência Pré-Natal e Fisiologia Gestacional)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Vacinação e Suplementação na Gestação (Ácido Fólico, Ferro)",
    "subfocos": [
      "Calendário Vacinal da Gestante",
      "Suplementação de Ácido Fólico e Ferro"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Assistência Pré-Natal e Fisiologia Gestacional",
    "chips": [
      {
        "label": "Calendário Vacinal da Gestante",
        "letter": "1",
        "value": "Conceito de alta relevância em Vacinação e Suplementação na Gestação: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Suplementação de Ácido Fólico e Ferro",
        "letter": "2",
        "value": "Conceito de alta relevância em Vacinação e Suplementação na Gestação: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vacinação e Suplementação na Gestação: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vacinação e Suplementação na Gestação: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-calculo-da-idade-gestacional-e-data",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cálculo da Idade Gestacional e Data Pr",
    "fullTitle": "Cálculo da Idade Gestacional e Data Provável do Parto (Assistência Pré-Natal e Fisiologia Gestacional)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Cálculo da Idade Gestacional e Data Provável do Parto",
    "subfocos": [
      "Regra de Nägele e Estimativa Clínica",
      "Datação Ultrassonográfica da Gestação"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Assistência Pré-Natal e Fisiologia Gestacional",
    "chips": [
      {
        "label": "Regra de Nägele e Estimativa Clínica",
        "letter": "1",
        "value": "Conceito de alta relevância em Cálculo da Idade Gestacional e Data Provável do Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Datação Ultrassonográfica da Gestação",
        "letter": "2",
        "value": "Conceito de alta relevância em Cálculo da Idade Gestacional e Data Provável do Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cálculo da Idade Gestacional e Data Provável do Parto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cálculo da Idade Gestacional e Data Provável do Parto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-estatica-fetal-e-diagnostico-da-gra",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Estática Fetal e Diagnóstico da Gravid",
    "fullTitle": "Estática Fetal e Diagnóstico da Gravidez (Assistência Pré-Natal e Fisiologia Gestacional)",
    "specialty": "Obstetrícia",
    "tema": "Assistência Pré-Natal e Fisiologia Gestacional",
    "foco": "Estática Fetal e Diagnóstico da Gravidez",
    "subfocos": [
      "Manobras de Leopold e Relações Útero-Fetais",
      "Diagnóstico Clínico e Imunológico da Gravidez"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Assistência Pré-Natal e Fisiologia Gestacional",
    "chips": [
      {
        "label": "Manobras de Leopold e Relações Útero-Fetais",
        "letter": "1",
        "value": "Conceito de alta relevância em Estática Fetal e Diagnóstico da Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Diagnóstico Clínico e Imunológico da Gravidez",
        "letter": "2",
        "value": "Conceito de alta relevância em Estática Fetal e Diagnóstico da Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Estática Fetal e Diagnóstico da Gravidez: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Estática Fetal e Diagnóstico da Gravidez: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-abortamento-espontaneo-e-suas-forma",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abortamento Espontâneo e suas Formas C",
    "fullTitle": "Abortamento Espontâneo e suas Formas Clínicas (Hemorragias da Primeira Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Primeira Metade da Gravidez",
    "foco": "Abortamento Espontâneo e suas Formas Clínicas (Ameaça, Inevitável, Incompleto, Retido, Infectado)",
    "subfocos": [
      "Diagnóstico Diferencial das Formas Clínicas de Abortamento",
      "Métodos de Esvaziamento Uterino e Imunoprofilaxia Rh"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Primeira Metade da Gravidez",
    "chips": [
      {
        "label": "Diagnóstico Diferencial das Formas Clínicas de Abortamento",
        "letter": "1",
        "value": "Conceito de alta relevância em Abortamento Espontâneo e suas Formas Clínicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Métodos de Esvaziamento Uterino e Imunoprofilaxia Rh",
        "letter": "2",
        "value": "Conceito de alta relevância em Abortamento Espontâneo e suas Formas Clínicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abortamento Espontâneo e suas Formas Clínicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abortamento Espontâneo e suas Formas Clínicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-abortamento-recorrente-e-incompeten",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Abortamento Recorrente e Incompetência",
    "fullTitle": "Abortamento Recorrente e Incompetência Istmocervical (Hemorragias da Primeira Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Primeira Metade da Gravidez",
    "foco": "Abortamento Recorrente e Incompetência Istmocervical",
    "subfocos": [
      "Incompetência Istmocervical (IIC)",
      "Investigação do Abortamento de Repetição"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Primeira Metade da Gravidez",
    "chips": [
      {
        "label": "Incompetência Istmocervical",
        "letter": "1",
        "value": "Conceito de alta relevância em Abortamento Recorrente e Incompetência Istmocervical: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Investigação do Abortamento de Repetição",
        "letter": "2",
        "value": "Conceito de alta relevância em Abortamento Recorrente e Incompetência Istmocervical: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Abortamento Recorrente e Incompetência Istmocervical: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Abortamento Recorrente e Incompetência Istmocervical: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-gravidez-ectopica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Gravidez Ectópica",
    "fullTitle": "Gravidez Ectópica (Hemorragias da Primeira Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Primeira Metade da Gravidez",
    "foco": "Gravidez Ectópica",
    "subfocos": [
      "Diagnóstico Clínico e Ultrassonográfico da Ectópica",
      "Manejo Clínico com Metotrexato vs Cirúrgico"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Primeira Metade da Gravidez",
    "chips": [
      {
        "label": "Diagnóstico Clínico e Ultrassonográfico da Ectópica",
        "letter": "1",
        "value": "Conceito de alta relevância em Gravidez Ectópica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Manejo Clínico com Metotrexato vs Cirúrgico",
        "letter": "2",
        "value": "Conceito de alta relevância em Gravidez Ectópica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Gravidez Ectópica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Gravidez Ectópica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-doenca-trofoblastica-gestacional",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Doença Trofoblástica Gestacional",
    "fullTitle": "Doença Trofoblástica Gestacional (Hemorragias da Primeira Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Primeira Metade da Gravidez",
    "foco": "Doença Trofoblástica Gestacional (Mola Hidatiforme e Neoplasias)",
    "subfocos": [
      "Mola Hidatiforme Completa vs Incompleta (Parcial)",
      "Esvaziamento Uterino e Seguimento Pós-Molar"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Primeira Metade da Gravidez",
    "chips": [
      {
        "label": "Mola Hidatiforme Completa vs Incompleta",
        "letter": "1",
        "value": "Conceito de alta relevância em Doença Trofoblástica Gestacional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Esvaziamento Uterino e Seguimento Pós-Molar",
        "letter": "2",
        "value": "Conceito de alta relevância em Doença Trofoblástica Gestacional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Doença Trofoblástica Gestacional: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Doença Trofoblástica Gestacional: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-descolamento-prematuro-de-placenta",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Descolamento Prematuro de Placenta",
    "fullTitle": "Descolamento Prematuro de Placenta (Hemorragias da Segunda Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Descolamento Prematuro de Placenta (DPP)",
    "subfocos": [
      "Quadro Clínico e Fatores de Risco do DPP",
      "Conduta Obstétrica Imediata e Complicações"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Segunda Metade da Gravidez",
    "chips": [
      {
        "label": "Quadro Clínico e Fatores de Risco do DPP",
        "letter": "1",
        "value": "Conceito de alta relevância em Descolamento Prematuro de Placenta: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Conduta Obstétrica Imediata e Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Descolamento Prematuro de Placenta: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Descolamento Prematuro de Placenta: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Descolamento Prematuro de Placenta: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-placenta-previa",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Placenta Prévia",
    "fullTitle": "Placenta Prévia (Hemorragias da Segunda Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Placenta Prévia",
    "subfocos": [
      "Classificação e Quadro Clínico da Placenta Prévia",
      "Conduta e Via de Parto na Placenta Prévia"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Segunda Metade da Gravidez",
    "chips": [
      {
        "label": "Classificação e Quadro Clínico da Placenta Prévia",
        "letter": "1",
        "value": "Conceito de alta relevância em Placenta Prévia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Conduta e Via de Parto na Placenta Prévia",
        "letter": "2",
        "value": "Conceito de alta relevância em Placenta Prévia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Placenta Prévia: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Placenta Prévia: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-acretismo-placentario",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Acretismo Placentário",
    "fullTitle": "Acretismo Placentário (Hemorragias da Segunda Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Acretismo Placentário (Accreta, Increta, Percreta)",
    "subfocos": [
      "Graus de Invasão Miometrial (Accreta, Increta e Percreta)",
      "Diagnóstico Pré-Natal e Manejo Cirúrgico"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Segunda Metade da Gravidez",
    "chips": [
      {
        "label": "Graus de Invasão Miometrial",
        "letter": "1",
        "value": "Conceito de alta relevância em Acretismo Placentário: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Diagnóstico Pré-Natal e Manejo Cirúrgico",
        "letter": "2",
        "value": "Conceito de alta relevância em Acretismo Placentário: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Acretismo Placentário: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Acretismo Placentário: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-rotura-uterina",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Rotura Uterina",
    "fullTitle": "Rotura Uterina (Hemorragias da Segunda Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Rotura Uterina",
    "subfocos": [
      "Sinais Iminentes de Rotura (Síndrome de Bandl-Frommel)",
      "Rotura Consumada e Conduta Cirúrgica"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Segunda Metade da Gravidez",
    "chips": [
      {
        "label": "Sinais Iminentes de Rotura",
        "letter": "1",
        "value": "Conceito de alta relevância em Rotura Uterina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Rotura Consumada e Conduta Cirúrgica",
        "letter": "2",
        "value": "Conceito de alta relevância em Rotura Uterina: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rotura Uterina: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rotura Uterina: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-rotura-de-vasa-previa-e-rotura-de-s",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Rotura de Vasa Prévia e Rotura de Seio",
    "fullTitle": "Rotura de Vasa Prévia e Rotura de Seio Marginal (Hemorragias da Segunda Metade da Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Hemorragias da Segunda Metade da Gravidez",
    "foco": "Rotura de Vasa Prévia e Rotura de Seio Marginal",
    "subfocos": [
      "Vasa Prévia e Inserção Velamentosa do Cordão",
      "Rotura de Seio Marginal Placentário"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Hemorragias da Segunda Metade da Gravidez",
    "chips": [
      {
        "label": "Vasa Prévia e Inserção Velamentosa do Cordão",
        "letter": "1",
        "value": "Conceito de alta relevância em Rotura de Vasa Prévia e Rotura de Seio Marginal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Rotura de Seio Marginal Placentário",
        "letter": "2",
        "value": "Conceito de alta relevância em Rotura de Vasa Prévia e Rotura de Seio Marginal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rotura de Vasa Prévia e Rotura de Seio Marginal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rotura de Vasa Prévia e Rotura de Seio Marginal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-pre-eclampsia",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Pré-Eclâmpsia",
    "fullTitle": "Pré-Eclâmpsia (Síndromes Hipertensivas na Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Pré-Eclâmpsia (com e sem Sinais de Gravidade)",
    "subfocos": [
      "Diagnóstico e Critérios da Pré-Eclâmpsia",
      "Pré-Eclâmpsia com Sinais de Gravidade e Manejo"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Síndromes Hipertensivas na Gravidez",
    "chips": [
      {
        "label": "Diagnóstico e Critérios da Pré-Eclâmpsia",
        "letter": "1",
        "value": "Conceito de alta relevância em Pré-Eclâmpsia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Pré-Eclâmpsia com Sinais de Gravidade e Manejo",
        "letter": "2",
        "value": "Conceito de alta relevância em Pré-Eclâmpsia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Pré-Eclâmpsia: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Pré-Eclâmpsia: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-eclampsia",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Eclâmpsia",
    "fullTitle": "Eclâmpsia (Síndromes Hipertensivas na Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Eclâmpsia (Manejo da Crise e Sulfato de Magnésio)",
    "subfocos": [
      "Manejo da Crise Convulsiva Eclâmptica",
      "Monitorização da Intoxicação por Magnésio e Antídoto"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Síndromes Hipertensivas na Gravidez",
    "chips": [
      {
        "label": "Manejo da Crise Convulsiva Eclâmptica",
        "letter": "1",
        "value": "Conceito de alta relevância em Eclâmpsia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Monitorização da Intoxicação por Magnésio e Antídoto",
        "letter": "2",
        "value": "Conceito de alta relevância em Eclâmpsia: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Eclâmpsia: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Eclâmpsia: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-sindrome-hellp",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Síndrome HELLP",
    "fullTitle": "Síndrome HELLP (Síndromes Hipertensivas na Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Síndrome HELLP",
    "subfocos": [
      "Critérios Laboratoriais Diagnósticos de Tennessee / Mississippi",
      "Conduta Obstétrica e Interrupção da Gravidez"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Síndromes Hipertensivas na Gravidez",
    "chips": [
      {
        "label": "Critérios Laboratoriais Diagnósticos de Tennessee / Mississippi",
        "letter": "1",
        "value": "Conceito de alta relevância em Síndrome HELLP: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Conduta Obstétrica e Interrupção da Gravidez",
        "letter": "2",
        "value": "Conceito de alta relevância em Síndrome HELLP: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Síndrome HELLP: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Síndrome HELLP: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-hipertensao-arterial-cronica-na-gra",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hipertensão Arterial Crônica na Gravid",
    "fullTitle": "Hipertensão Arterial Crônica na Gravidez (Síndromes Hipertensivas na Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Hipertensão Arterial Crônica na Gravidez",
    "subfocos": [
      "Diagnóstico Diferencial e Drogas de Uso Permitido",
      "Pré-Eclâmpsia Sobreposta à Hipertensão Crônica"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Síndromes Hipertensivas na Gravidez",
    "chips": [
      {
        "label": "Diagnóstico Diferencial e Drogas de Uso Permitido",
        "letter": "1",
        "value": "Conceito de alta relevância em Hipertensão Arterial Crônica na Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Pré-Eclâmpsia Sobreposta à Hipertensão Crônica",
        "letter": "2",
        "value": "Conceito de alta relevância em Hipertensão Arterial Crônica na Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hipertensão Arterial Crônica na Gravidez: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hipertensão Arterial Crônica na Gravidez: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-hipertensao-gestacional",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hipertensão Gestacional",
    "fullTitle": "Hipertensão Gestacional (Síndromes Hipertensivas na Gravidez)",
    "specialty": "Obstetrícia",
    "tema": "Síndromes Hipertensivas na Gravidez",
    "foco": "Hipertensão Gestacional",
    "subfocos": [
      "Definição, Fisiopatologia e Diagnóstico Diferencial com Pré-Eclâmpsia",
      "Conduta Clínica, Metas Pressóricas e Risco de Evolução para Pré-Eclâmpsia"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Síndromes Hipertensivas na Gravidez",
    "chips": [
      {
        "label": "Definição, Fisiopatologia e Diagnóstico Diferencial com Pré-Eclâmpsia",
        "letter": "1",
        "value": "Conceito de alta relevância em Hipertensão Gestacional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Conduta Clínica, Metas Pressóricas e Risco de Evolução para Pré-Eclâmpsia",
        "letter": "2",
        "value": "Conceito de alta relevância em Hipertensão Gestacional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hipertensão Gestacional: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hipertensão Gestacional: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-diabetes-mellitus-gestacional",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Exames de Rotina",
    "title": "Diabetes Mellitus Gestacional",
    "fullTitle": "Diabetes Mellitus Gestacional (Diabetes Gestacional e Endocrinopatias)",
    "specialty": "Obstetrícia",
    "tema": "Diabetes Gestacional e Endocrinopatias",
    "foco": "Diabetes Mellitus Gestacional (DMG: Rastreamento, Diagnóstico e Metas)",
    "subfocos": [
      "Rastreamento e Critérios Diagnósticos do DMG (IADPSG/SBD/Febrasgo)",
      "Metas Glicêmicas, Dieta e Terapia com Insulina"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Diabetes Gestacional e Endocrinopatias",
    "chips": [
      {
        "label": "Rastreamento e Critérios Diagnósticos do DMG",
        "letter": "1",
        "value": "Conceito de alta relevância em Diabetes Mellitus Gestacional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Metas Glicêmicas, Dieta e Terapia com Insulina",
        "letter": "2",
        "value": "Conceito de alta relevância em Diabetes Mellitus Gestacional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Diabetes Mellitus Gestacional: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Diabetes Mellitus Gestacional: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-diabetes-mellitus-pre-gestacional",
    "category": "tratamento",
    "categoryLabel": "Tratamentos & Drogas de Escolha",
    "title": "Diabetes Mellitus Pré-Gestacional",
    "fullTitle": "Diabetes Mellitus Pré-Gestacional (Diabetes Gestacional e Endocrinopatias)",
    "specialty": "Obstetrícia",
    "tema": "Diabetes Gestacional e Endocrinopatias",
    "foco": "Diabetes Mellitus Pré-Gestacional (Manejo e Riscos Malformativos)",
    "subfocos": [
      "Planejamento Pré-Concepcional e Riscos de Malformações Fetais",
      "Ajuste da Insulinoterapia nos Três Trimestres e Vitalidade Fetal"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Diabetes Gestacional e Endocrinopatias",
    "chips": [
      {
        "label": "Planejamento Pré-Concepcional e Riscos de Malformações Fetais",
        "letter": "1",
        "value": "Conceito de alta relevância em Diabetes Mellitus Pré-Gestacional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Ajuste da Insulinoterapia nos Três Trimestres e Vitalidade Fetal",
        "letter": "2",
        "value": "Conceito de alta relevância em Diabetes Mellitus Pré-Gestacional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Diabetes Mellitus Pré-Gestacional: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Diabetes Mellitus Pré-Gestacional: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-tireoidopatias-na-gestacao",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Tireoidopatias na Gestação",
    "fullTitle": "Tireoidopatias na Gestação (Diabetes Gestacional e Endocrinopatias)",
    "specialty": "Obstetrícia",
    "tema": "Diabetes Gestacional e Endocrinopatias",
    "foco": "Tireoidopatias na Gestação (Hipotireoidismo e Hipertireoidismo)",
    "subfocos": [
      "Hipotireoidismo Gestacional e Metas de TSH por Trimestre",
      "Hipertireoidismo na Gestação (Doença de Graves vs Tireotoxicose Gestacional Transitória)"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Diabetes Gestacional e Endocrinopatias",
    "chips": [
      {
        "label": "Hipotireoidismo Gestacional e Metas de TSH por Trimestre",
        "letter": "1",
        "value": "Conceito de alta relevância em Tireoidopatias na Gestação: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Hipertireoidismo na Gestação",
        "letter": "2",
        "value": "Conceito de alta relevância em Tireoidopatias na Gestação: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Tireoidopatias na Gestação: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Tireoidopatias na Gestação: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-sifilis-gestacional-e-congenita",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Sífilis Gestacional e Congênita",
    "fullTitle": "Sífilis Gestacional e Congênita (Infecções Congênitas e Perinatais)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Sífilis Gestacional e Congênita",
    "subfocos": [
      "Diagnóstico e Critérios de Tratamento Adequado Materno",
      "Abordagem Diagnóstica e Conduta no Recém-Nascido"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Infecções Congênitas e Perinatais",
    "chips": [
      {
        "label": "Diagnóstico e Critérios de Tratamento Adequado Materno",
        "letter": "1",
        "value": "Conceito de alta relevância em Sífilis Gestacional e Congênita: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Abordagem Diagnóstica e Conduta no Recém-Nascido",
        "letter": "2",
        "value": "Conceito de alta relevância em Sífilis Gestacional e Congênita: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Sífilis Gestacional e Congênita: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Sífilis Gestacional e Congênita: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-toxoplasmose-gestacional-e-congenit",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Toxoplasmose Gestacional e Congênita",
    "fullTitle": "Toxoplasmose Gestacional e Congênita (Infecções Congênitas e Perinatais)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Toxoplasmose Gestacional e Congênita",
    "subfocos": [
      "Interpretação Sorológica e Teste de Avidez",
      "Tratamento com Espiramicina vs Esquema Tríplice"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Infecções Congênitas e Perinatais",
    "chips": [
      {
        "label": "Interpretação Sorológica e Teste de Avidez",
        "letter": "1",
        "value": "Conceito de alta relevância em Toxoplasmose Gestacional e Congênita: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tratamento com Espiramicina vs Esquema Tríplice",
        "letter": "2",
        "value": "Conceito de alta relevância em Toxoplasmose Gestacional e Congênita: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Toxoplasmose Gestacional e Congênita: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Toxoplasmose Gestacional e Congênita: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-hiv-na-gestacao-e-profilaxia-da-tra",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "HIV na Gestação e Profilaxia da Transm",
    "fullTitle": "HIV na Gestação e Profilaxia da Transmissão Vertical (Infecções Congênitas e Perinatais)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "HIV na Gestação e Profilaxia da Transmissão Vertical",
    "subfocos": [
      "Terapia Antirretroviral e Rastreamento na Gravidez",
      "Via de Parto e Profilaxias Intra e Pós-Parto"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Infecções Congênitas e Perinatais",
    "chips": [
      {
        "label": "Terapia Antirretroviral e Rastreamento na Gravidez",
        "letter": "1",
        "value": "Conceito de alta relevância em HIV na Gestação e Profilaxia da Transmissão Vertical: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Via de Parto e Profilaxias Intra e Pós-Parto",
        "letter": "2",
        "value": "Conceito de alta relevância em HIV na Gestação e Profilaxia da Transmissão Vertical: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em HIV na Gestação e Profilaxia da Transmissão Vertical: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em HIV na Gestação e Profilaxia da Transmissão Vertical: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-infeccao-urinaria-e-pielonefrite-na",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecção Urinária e Pielonefrite na Gr",
    "fullTitle": "Infecção Urinária e Pielonefrite na Gravidez (Infecções Congênitas e Perinatais)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Infecção Urinária e Pielonefrite na Gravidez",
    "subfocos": [
      "Bacteriúria Assintomática e Cistite Aguda na Gestação",
      "Pielonefrite Aguda Gestacional e Complicações"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Infecções Congênitas e Perinatais",
    "chips": [
      {
        "label": "Bacteriúria Assintomática e Cistite Aguda na Gestação",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecção Urinária e Pielonefrite na Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Pielonefrite Aguda Gestacional e Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecção Urinária e Pielonefrite na Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecção Urinária e Pielonefrite na Gravidez: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecção Urinária e Pielonefrite na Gravidez: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-rastreamento-e-profilaxia-do-estrep",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Exames de Rotina",
    "title": "Rastreamento e Profilaxia do Estreptoc",
    "fullTitle": "Rastreamento e Profilaxia do Estreptococo do Grupo B (Infecções Congênitas e Perinatais)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Rastreamento e Profilaxia do Estreptococo do Grupo B (EGB)",
    "subfocos": [
      "Cultura Anovaginal Universal entre 35 e 37 Semanas",
      "Esquema de Profilaxia Intraparto com Antibiótico"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Infecções Congênitas e Perinatais",
    "chips": [
      {
        "label": "Cultura Anovaginal Universal entre 35 e 37 Semanas",
        "letter": "1",
        "value": "Conceito de alta relevância em Rastreamento e Profilaxia do Estreptococo do Grupo B: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Esquema de Profilaxia Intraparto com Antibiótico",
        "letter": "2",
        "value": "Conceito de alta relevância em Rastreamento e Profilaxia do Estreptococo do Grupo B: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Rastreamento e Profilaxia do Estreptococo do Grupo B: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Rastreamento e Profilaxia do Estreptococo do Grupo B: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-hepatites-virais-e-infeccoes-por-cm",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hepatites Virais e Infecções por CMV, ",
    "fullTitle": "Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez (Infecções Congênitas e Perinatais)",
    "specialty": "Obstetrícia",
    "tema": "Infecções Congênitas e Perinatais",
    "foco": "Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez",
    "subfocos": [
      "Hepatite B e C no Ciclo Gravídico-Puerperal",
      "Citomegalovírus, Herpes Genital e Vírus Zika"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Infecções Congênitas e Perinatais",
    "chips": [
      {
        "label": "Hepatite B e C no Ciclo Gravídico-Puerperal",
        "letter": "1",
        "value": "Conceito de alta relevância em Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Citomegalovírus, Herpes Genital e Vírus Zika",
        "letter": "2",
        "value": "Conceito de alta relevância em Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hepatites Virais e Infecções por CMV, Herpes e Arboviroses na Gravidez: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-trabalho-de-parto",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Trabalho de Parto",
    "fullTitle": "Trabalho de Parto (Mecanismo de Parto, Partograma e Distócias)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Trabalho de Parto (Fases Clínicas e Assistência Humanizada)",
    "subfocos": [
      "Os 4 Períodos Clínicos do Parto",
      "Assistência Humanizada e Boas Práticas da OMS"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Mecanismo de Parto, Partograma e Distócias",
    "chips": [
      {
        "label": "Os 4 Períodos Clínicos do Parto",
        "letter": "1",
        "value": "Conceito de alta relevância em Trabalho de Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Assistência Humanizada e Boas Práticas da OMS",
        "letter": "2",
        "value": "Conceito de alta relevância em Trabalho de Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Trabalho de Parto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Trabalho de Parto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-mecanismo-do-parto-em-cefalica-flet",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Mecanismo do Parto em Cefálica Fletida",
    "fullTitle": "Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas (Mecanismo de Parto, Partograma e Distócias)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas",
    "subfocos": [
      "Os Tempos do Mecanismo do Parto",
      "Apresentações Anômalas (Defletidas e Pélvicas)"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Mecanismo de Parto, Partograma e Distócias",
    "chips": [
      {
        "label": "Os Tempos do Mecanismo do Parto",
        "letter": "1",
        "value": "Conceito de alta relevância em Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Apresentações Anômalas",
        "letter": "2",
        "value": "Conceito de alta relevância em Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Mecanismo do Parto em Cefálica Fletida e Apresentações Defletidas/Pélvicas: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-interpretacao-do-partograma-e-linha",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Interpretação do Partograma e Linhas d",
    "fullTitle": "Interpretação do Partograma e Linhas de Ação/Alerta (Mecanismo de Parto, Partograma e Distócias)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Interpretação do Partograma e Linhas de Ação/Alerta",
    "subfocos": [
      "Linhas de Alerta e Ação e Distócias Funcionais",
      "Planos de De Lee e Avaliação da Descida"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Mecanismo de Parto, Partograma e Distócias",
    "chips": [
      {
        "label": "Linhas de Alerta e Ação e Distócias Funcionais",
        "letter": "1",
        "value": "Conceito de alta relevância em Interpretação do Partograma e Linhas de Ação/Alerta: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Planos de De Lee e Avaliação da Descida",
        "letter": "2",
        "value": "Conceito de alta relevância em Interpretação do Partograma e Linhas de Ação/Alerta: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Interpretação do Partograma e Linhas de Ação/Alerta: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Interpretação do Partograma e Linhas de Ação/Alerta: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-distocias-de-trajeto-motoras-e-de-o",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Distócias de Trajeto, Motoras e de Omb",
    "fullTitle": "Distócias de Trajeto, Motoras e de Ombro (Mecanismo de Parto, Partograma e Distócias)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Distócias de Trajeto, Motoras e de Ombro",
    "subfocos": [
      "Distócias Ósseas e de Partes Moles",
      "Distócia de Ombro: Fatores de Risco e Manobras Sequenciais"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Mecanismo de Parto, Partograma e Distócias",
    "chips": [
      {
        "label": "Distócias Ósseas e de Partes Moles",
        "letter": "1",
        "value": "Conceito de alta relevância em Distócias de Trajeto, Motoras e de Ombro: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Distócia de Ombro: Fatores de Risco e Manobras Sequenciais",
        "letter": "2",
        "value": "Conceito de alta relevância em Distócias de Trajeto, Motoras e de Ombro: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Distócias de Trajeto, Motoras e de Ombro: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Distócias de Trajeto, Motoras e de Ombro: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-forcipe-e-vacuo-extrator",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Fórcipe e Vácuo-Extrator",
    "fullTitle": "Fórcipe e Vácuo-Extrator (Mecanismo de Parto, Partograma e Distócias)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Fórcipe e Vácuo-Extrator (Indicações e Condições de Aplicabilidade)",
    "subfocos": [
      "Condições de Aplicabilidade do Fórcipe",
      "Tipos de Fórcipe e Complicações"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Mecanismo de Parto, Partograma e Distócias",
    "chips": [
      {
        "label": "Condições de Aplicabilidade do Fórcipe",
        "letter": "1",
        "value": "Conceito de alta relevância em Fórcipe e Vácuo-Extrator: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tipos de Fórcipe e Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Fórcipe e Vácuo-Extrator: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Fórcipe e Vácuo-Extrator: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Fórcipe e Vácuo-Extrator: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-cesariana",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cesariana",
    "fullTitle": "Cesariana (Mecanismo de Parto, Partograma e Distócias)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Cesariana (Indicações, Técnica e Parto Vaginal após Cesárea)",
    "subfocos": [
      "Indicações Absolutas vs Relativas de Cesariana",
      "Parto Vaginal após Cesárea Prévia (VBAC) e Riscos de Rotura"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Mecanismo de Parto, Partograma e Distócias",
    "chips": [
      {
        "label": "Indicações Absolutas vs Relativas de Cesariana",
        "letter": "1",
        "value": "Conceito de alta relevância em Cesariana: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Parto Vaginal após Cesárea Prévia",
        "letter": "2",
        "value": "Conceito de alta relevância em Cesariana: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cesariana: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cesariana: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-inducao-do-parto-e-escore-de-bishop",
    "category": "criterios",
    "categoryLabel": "Critérios & Escores Diagnósticos",
    "title": "Indução do Parto e Escore de Bishop",
    "fullTitle": "Indução do Parto e Escore de Bishop (Mecanismo de Parto, Partograma e Distócias)",
    "specialty": "Obstetrícia",
    "tema": "Mecanismo de Parto, Partograma e Distócias",
    "foco": "Indução do Parto e Escore de Bishop",
    "subfocos": [
      "Avaliação do Colo Uterino e Escore de Bishop",
      "Métodos de Maturação Cervical e Indução"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Mecanismo de Parto, Partograma e Distócias",
    "chips": [
      {
        "label": "Avaliação do Colo Uterino e Escore de Bishop",
        "letter": "1",
        "value": "Conceito de alta relevância em Indução do Parto e Escore de Bishop: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Métodos de Maturação Cervical e Indução",
        "letter": "2",
        "value": "Conceito de alta relevância em Indução do Parto e Escore de Bishop: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Indução do Parto e Escore de Bishop: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Indução do Parto e Escore de Bishop: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-puerperio-fisiologico-e-aleitamento",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Puerpério Fisiológico e Aleitamento Ma",
    "fullTitle": "Puerpério Fisiológico e Aleitamento Materno (Puerpério e Hemorragia Pós-Parto)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Puerpério Fisiológico e Aleitamento Materno",
    "subfocos": [
      "Modificações Locais e Sistêmicas do Puerpério Imediato e Tardio",
      "Fisiologia da Lactação e Manejo de Dificuldades Iniciais"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Puerpério e Hemorragia Pós-Parto",
    "chips": [
      {
        "label": "Modificações Locais e Sistêmicas do Puerpério Imediato e Tardio",
        "letter": "1",
        "value": "Conceito de alta relevância em Puerpério Fisiológico e Aleitamento Materno: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Fisiologia da Lactação e Manejo de Dificuldades Iniciais",
        "letter": "2",
        "value": "Conceito de alta relevância em Puerpério Fisiológico e Aleitamento Materno: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Puerpério Fisiológico e Aleitamento Materno: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Puerpério Fisiológico e Aleitamento Materno: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-hemorragia-pos-parto",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Hemorragia Pós-Parto",
    "fullTitle": "Hemorragia Pós-Parto (Puerpério e Hemorragia Pós-Parto)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Hemorragia Pós-Parto (HPP: 4 Ts - Tônus, Trauma, Tecido, Trombina)",
    "subfocos": [
      "Definição, Fatores de Risco e Manejo Ativo do 3º Período",
      "Algoritmo Terapêutico Sequencial da Atonia Uterina"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Puerpério e Hemorragia Pós-Parto",
    "chips": [
      {
        "label": "Definição, Fatores de Risco e Manejo Ativo do 3º Período",
        "letter": "1",
        "value": "Conceito de alta relevância em Hemorragia Pós-Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Algoritmo Terapêutico Sequencial da Atonia Uterina",
        "letter": "2",
        "value": "Conceito de alta relevância em Hemorragia Pós-Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Hemorragia Pós-Parto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Hemorragia Pós-Parto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-infeccao-puerperal-e-endometrite-po",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Infecção Puerperal e Endometrite Pós-P",
    "fullTitle": "Infecção Puerperal e Endometrite Pós-Parto (Puerpério e Hemorragia Pós-Parto)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Infecção Puerperal e Endometrite Pós-Parto",
    "subfocos": [
      "Fisiopatologia, Critérios Diagnósticos e Fatores de Risco",
      "Esquemas Antimicrobianos Venosos e Complicações"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Puerpério e Hemorragia Pós-Parto",
    "chips": [
      {
        "label": "Fisiopatologia, Critérios Diagnósticos e Fatores de Risco",
        "letter": "1",
        "value": "Conceito de alta relevância em Infecção Puerperal e Endometrite Pós-Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Esquemas Antimicrobianos Venosos e Complicações",
        "letter": "2",
        "value": "Conceito de alta relevância em Infecção Puerperal e Endometrite Pós-Parto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Infecção Puerperal e Endometrite Pós-Parto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Infecção Puerperal e Endometrite Pós-Parto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-mastite-puerperal-e-abscesso-mamari",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Mastite Puerperal e Abscesso Mamário",
    "fullTitle": "Mastite Puerperal e Abscesso Mamário (Puerpério e Hemorragia Pós-Parto)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Mastite Puerperal e Abscesso Mamário",
    "subfocos": [
      "Diagnóstico Diferencial: Ingurgitamento vs Mastite Puerperal",
      "Antibioticoterapia e Manejo de Abscessos Mamários"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Puerpério e Hemorragia Pós-Parto",
    "chips": [
      {
        "label": "Diagnóstico Diferencial: Ingurgitamento vs Mastite Puerperal",
        "letter": "1",
        "value": "Conceito de alta relevância em Mastite Puerperal e Abscesso Mamário: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Antibioticoterapia e Manejo de Abscessos Mamários",
        "letter": "2",
        "value": "Conceito de alta relevância em Mastite Puerperal e Abscesso Mamário: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Mastite Puerperal e Abscesso Mamário: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Mastite Puerperal e Abscesso Mamário: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-tromboflebite-pelvica-septica-e-tvp",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Tromboflebite Pélvica Séptica e TVP no",
    "fullTitle": "Tromboflebite Pélvica Séptica e TVP no Puerpério (Puerpério e Hemorragia Pós-Parto)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Tromboflebite Pélvica Séptica e TVP no Puerpério",
    "subfocos": [
      "Tromboembolismo Venoso no Puerpério",
      "Tromboflebite Pélvica Séptica (Diagnóstico de Exclusão)"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Puerpério e Hemorragia Pós-Parto",
    "chips": [
      {
        "label": "Tromboembolismo Venoso no Puerpério",
        "letter": "1",
        "value": "Conceito de alta relevância em Tromboflebite Pélvica Séptica e TVP no Puerpério: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Tromboflebite Pélvica Séptica",
        "letter": "2",
        "value": "Conceito de alta relevância em Tromboflebite Pélvica Séptica e TVP no Puerpério: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Tromboflebite Pélvica Séptica e TVP no Puerpério: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Tromboflebite Pélvica Séptica e TVP no Puerpério: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-depressao-e-psicose-puerperal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Depressão e Psicose Puerperal",
    "fullTitle": "Depressão e Psicose Puerperal (Puerpério e Hemorragia Pós-Parto)",
    "specialty": "Obstetrícia",
    "tema": "Puerpério e Hemorragia Pós-Parto",
    "foco": "Depressão e Psicose Puerperal",
    "subfocos": [
      "Blues Puerperal (Disforia Pós-Parto) vs Depressão Pós-Parto",
      "Psicose Puerperal: Emergência Psiquiátrica"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Puerpério e Hemorragia Pós-Parto",
    "chips": [
      {
        "label": "Blues Puerperal",
        "letter": "1",
        "value": "Conceito de alta relevância em Depressão e Psicose Puerperal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Psicose Puerperal: Emergência Psiquiátrica",
        "letter": "2",
        "value": "Conceito de alta relevância em Depressão e Psicose Puerperal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Depressão e Psicose Puerperal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Depressão e Psicose Puerperal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-cardiotocografia-basal-e-intraparto",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Cardiotocografia Basal e Intraparto",
    "fullTitle": "Cardiotocografia Basal e Intraparto (Avaliação da Vitalidade Fetal)",
    "specialty": "Obstetrícia",
    "tema": "Avaliação da Vitalidade Fetal",
    "foco": "Cardiotocografia Basal e Intraparto (Categorias I, II e III)",
    "subfocos": [
      "Parâmetros Normais da Cardiotocografia",
      "Desacelerações e Categorias I, II e III do FIGO/ACOG"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Avaliação da Vitalidade Fetal",
    "chips": [
      {
        "label": "Parâmetros Normais da Cardiotocografia",
        "letter": "1",
        "value": "Conceito de alta relevância em Cardiotocografia Basal e Intraparto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Desacelerações e Categorias I, II e III do FIGO/ACOG",
        "letter": "2",
        "value": "Conceito de alta relevância em Cardiotocografia Basal e Intraparto: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Cardiotocografia Basal e Intraparto: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Cardiotocografia Basal e Intraparto: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-perfil-biofisico-fetal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Perfil Biofísico Fetal",
    "fullTitle": "Perfil Biofísico Fetal (Avaliação da Vitalidade Fetal)",
    "specialty": "Obstetrícia",
    "tema": "Avaliação da Vitalidade Fetal",
    "foco": "Perfil Biofísico Fetal (PBF)",
    "subfocos": [
      "Parâmetros Agudos e Crônicos do PBF",
      "Interpretação e Conduta Obstétrica"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Avaliação da Vitalidade Fetal",
    "chips": [
      {
        "label": "Parâmetros Agudos e Crônicos do PBF",
        "letter": "1",
        "value": "Conceito de alta relevância em Perfil Biofísico Fetal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Interpretação e Conduta Obstétrica",
        "letter": "2",
        "value": "Conceito de alta relevância em Perfil Biofísico Fetal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Perfil Biofísico Fetal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Perfil Biofísico Fetal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-dopplervelocimetria-obstetrica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Dopplervelocimetria Obstétrica",
    "fullTitle": "Dopplervelocimetria Obstétrica (Avaliação da Vitalidade Fetal)",
    "specialty": "Obstetrícia",
    "tema": "Avaliação da Vitalidade Fetal",
    "foco": "Dopplervelocimetria Obstétrica (Artérias Uterinas, Umbilical e Cerebral Média, Ducto Venoso)",
    "subfocos": [
      "Artérias Uterinas, Umbilical e Cerebral Média",
      "Ducto Venoso e Avaliação da Acidemia Fetal"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Avaliação da Vitalidade Fetal",
    "chips": [
      {
        "label": "Artérias Uterinas, Umbilical e Cerebral Média",
        "letter": "1",
        "value": "Conceito de alta relevância em Dopplervelocimetria Obstétrica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Ducto Venoso e Avaliação da Acidemia Fetal",
        "letter": "2",
        "value": "Conceito de alta relevância em Dopplervelocimetria Obstétrica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Dopplervelocimetria Obstétrica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Dopplervelocimetria Obstétrica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-obst-restricao-de-crescimento-intrauteri",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Restrição de Crescimento Intrauterino",
    "fullTitle": "Restrição de Crescimento Intrauterino (Avaliação da Vitalidade Fetal)",
    "specialty": "Obstetrícia",
    "tema": "Avaliação da Vitalidade Fetal",
    "foco": "Restrição de Crescimento Intrauterino (RCIU)",
    "subfocos": [
      "Classificação e Diagnóstico Ultrassonográfico da RCF",
      "Seguimento Dopplerfluorimétrico e Momento do Parto"
    ],
    "provenanceDefault": "Visto em Obstetrícia • Avaliação da Vitalidade Fetal",
    "chips": [
      {
        "label": "Classificação e Diagnóstico Ultrassonográfico da RCF",
        "letter": "1",
        "value": "Conceito de alta relevância em Restrição de Crescimento Intrauterino: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Seguimento Dopplerfluorimétrico e Momento do Parto",
        "letter": "2",
        "value": "Conceito de alta relevância em Restrição de Crescimento Intrauterino: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Restrição de Crescimento Intrauterino: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Restrição de Crescimento Intrauterino: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-principios-doutrinarios-e-organizat",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Princípios Doutrinários e Organizativo",
    "fullTitle": "Princípios Doutrinários e Organizativos do SUS (Sistema Único de Saúde (SUS): Princípios e Legislação)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Princípios Doutrinários e Organizativos do SUS (Universalidade, Integralidade, Equidade, Descentralização)",
    "subfocos": [
      "Princípios Doutrinários / Éticos do SUS",
      "Princípios Organizativos / Operacionais do SUS"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Sistema Único de Saúde (SUS): Princípios e Legislação",
    "chips": [
      {
        "label": "Princípios Doutrinários / Éticos do SUS",
        "letter": "1",
        "value": "Conceito de alta relevância em Princípios Doutrinários e Organizativos do SUS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Princípios Organizativos / Operacionais do SUS",
        "letter": "2",
        "value": "Conceito de alta relevância em Princípios Doutrinários e Organizativos do SUS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Princípios Doutrinários e Organizativos do SUS: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Princípios Doutrinários e Organizativos do SUS: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-lei-organica-da-saude-8-080-1990",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Lei Orgânica da Saúde 8.080/1990",
    "fullTitle": "Lei Orgânica da Saúde 8.080/1990 (Sistema Único de Saúde (SUS): Princípios e Legislação)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Lei Orgânica da Saúde 8.080/1990",
    "subfocos": [
      "Competências das Esferas de Governo e Campo de Atuação",
      "Participação Complementar do Setor Privado"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Sistema Único de Saúde (SUS): Princípios e Legislação",
    "chips": [
      {
        "label": "Competências das Esferas de Governo e Campo de Atuação",
        "letter": "1",
        "value": "Conceito de alta relevância em Lei Orgânica da Saúde 8.080/1990: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Participação Complementar do Setor Privado",
        "letter": "2",
        "value": "Conceito de alta relevância em Lei Orgânica da Saúde 8.080/1990: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Lei Orgânica da Saúde 8.080/1990: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Lei Orgânica da Saúde 8.080/1990: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-lei-8-142-1990-e-participacao-da-co",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Lei 8.142/1990 e Participação da Comun",
    "fullTitle": "Lei 8.142/1990 e Participação da Comunidade (Sistema Único de Saúde (SUS): Princípios e Legislação)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Lei 8.142/1990 e Participação da Comunidade",
    "subfocos": [
      "Conselhos e Conferências de Saúde",
      "Transferência Intergovernamental de Recursos e Condicionantes"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Sistema Único de Saúde (SUS): Princípios e Legislação",
    "chips": [
      {
        "label": "Conselhos e Conferências de Saúde",
        "letter": "1",
        "value": "Conceito de alta relevância em Lei 8.142/1990 e Participação da Comunidade: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Transferência Intergovernamental de Recursos e Condicionantes",
        "letter": "2",
        "value": "Conceito de alta relevância em Lei 8.142/1990 e Participação da Comunidade: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Lei 8.142/1990 e Participação da Comunidade: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Lei 8.142/1990 e Participação da Comunidade: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-decreto-presidencial-7-508-2011-e-r",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Decreto Presidencial 7.508/2011 e Regi",
    "fullTitle": "Decreto Presidencial 7.508/2011 e Regiões de Saúde (Sistema Único de Saúde (SUS): Princípios e Legislação)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Decreto Presidencial 7.508/2011 e Regiões de Saúde",
    "subfocos": [
      "Regiões de Saúde e Requisitos Mínimos",
      "Portas de Entrada e Contrato Organizativo (COAP)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Sistema Único de Saúde (SUS): Princípios e Legislação",
    "chips": [
      {
        "label": "Regiões de Saúde e Requisitos Mínimos",
        "letter": "1",
        "value": "Conceito de alta relevância em Decreto Presidencial 7.508/2011 e Regiões de Saúde: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Portas de Entrada e Contrato Organizativo",
        "letter": "2",
        "value": "Conceito de alta relevância em Decreto Presidencial 7.508/2011 e Regiões de Saúde: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Decreto Presidencial 7.508/2011 e Regiões de Saúde: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Decreto Presidencial 7.508/2011 e Regiões de Saúde: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-financiamento-do-sus-e-emendas-cons",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Financiamento do SUS e Emendas Constit",
    "fullTitle": "Financiamento do SUS e Emendas Constitucionais (Sistema Único de Saúde (SUS): Princípios e Legislação)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Sistema Único de Saúde (SUS): Princípios e Legislação",
    "foco": "Financiamento do SUS e Emendas Constitucionais",
    "subfocos": [
      "Emenda Constitucional 29/2000 e Lei Complementar 141/2012",
      "Blocos de Financiamento e Programa Previne Brasil"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Sistema Único de Saúde (SUS): Princípios e Legislação",
    "chips": [
      {
        "label": "Emenda Constitucional 29/2000 e Lei Complementar 141/2012",
        "letter": "1",
        "value": "Conceito de alta relevância em Financiamento do SUS e Emendas Constitucionais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Blocos de Financiamento e Programa Previne Brasil",
        "letter": "2",
        "value": "Conceito de alta relevância em Financiamento do SUS e Emendas Constitucionais: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Financiamento do SUS e Emendas Constitucionais: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Financiamento do SUS e Emendas Constitucionais: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-evolucao-historica-das-politicas-de",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Evolução Histórica das Políticas de Sa",
    "fullTitle": "Evolução Histórica das Políticas de Saúde no Brasil (História das Políticas de Saúde e Gestão do SUS)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "História das Políticas de Saúde e Gestão do SUS",
    "foco": "Evolução Histórica das Políticas de Saúde no Brasil (INAMPS, Reforma Sanitária e 8ª CNS)",
    "subfocos": [
      "Da Previdência Social Excludente ao SUS (1923-1988)",
      "Movimento da Reforma Sanitária e 8ª CNS (1986)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • História das Políticas de Saúde e Gestão do SUS",
    "chips": [
      {
        "label": "Da Previdência Social Excludente ao SUS",
        "letter": "1",
        "value": "Conceito de alta relevância em Evolução Histórica das Políticas de Saúde no Brasil: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Movimento da Reforma Sanitária e 8ª CNS",
        "letter": "2",
        "value": "Conceito de alta relevância em Evolução Histórica das Políticas de Saúde no Brasil: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Evolução Histórica das Políticas de Saúde no Brasil: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Evolução Histórica das Políticas de Saúde no Brasil: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-normas-operacionais-basicas-e-noas-",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Normas Operacionais Básicas  e NOAS 20",
    "fullTitle": "Normas Operacionais Básicas  e NOAS 2001/2002 (História das Políticas de Saúde e Gestão do SUS)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "História das Políticas de Saúde e Gestão do SUS",
    "foco": "Normas Operacionais Básicas (NOB 91, 93, 96) e NOAS 2001/2002",
    "subfocos": [
      "O Processo de Descentralização pelas NOBs dos Anos 90",
      "Normas Operacionais de Assistência à Saúde (NOAS 2001/2002)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • História das Políticas de Saúde e Gestão do SUS",
    "chips": [
      {
        "label": "O Processo de Descentralização pelas NOBs dos Anos 90",
        "letter": "1",
        "value": "Conceito de alta relevância em Normas Operacionais Básicas  e NOAS 2001/2002: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Normas Operacionais de Assistência à Saúde",
        "letter": "2",
        "value": "Conceito de alta relevância em Normas Operacionais Básicas  e NOAS 2001/2002: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Normas Operacionais Básicas  e NOAS 2001/2002: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Normas Operacionais Básicas  e NOAS 2001/2002: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-pacto-pela-saude-e-contrato-organiz",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Pacto pela Saúde  e Contrato Organizat",
    "fullTitle": "Pacto pela Saúde  e Contrato Organizativo de Ação Pública (História das Políticas de Saúde e Gestão do SUS)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "História das Políticas de Saúde e Gestão do SUS",
    "foco": "Pacto pela Saúde (2006) e Contrato Organizativo de Ação Pública (COAP)",
    "subfocos": [
      "As Três Dimensões do Pacto pela Saúde",
      "Contrato Organizativo e Colegiados Regionais"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • História das Políticas de Saúde e Gestão do SUS",
    "chips": [
      {
        "label": "As Três Dimensões do Pacto pela Saúde",
        "letter": "1",
        "value": "Conceito de alta relevância em Pacto pela Saúde  e Contrato Organizativo de Ação Pública: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Contrato Organizativo e Colegiados Regionais",
        "letter": "2",
        "value": "Conceito de alta relevância em Pacto pela Saúde  e Contrato Organizativo de Ação Pública: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Pacto pela Saúde  e Contrato Organizativo de Ação Pública: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Pacto pela Saúde  e Contrato Organizativo de Ação Pública: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-planejamento-programacao-e-regulaca",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Planejamento, Programação e Regulação ",
    "fullTitle": "Planejamento, Programação e Regulação no SUS (História das Políticas de Saúde e Gestão do SUS)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "História das Políticas de Saúde e Gestão do SUS",
    "foco": "Planejamento, Programação e Regulação no SUS",
    "subfocos": [
      "Instrumentos de Planejamento Governamental e Gestão (PPA, LDO, LOA, PMS, PAS e RAG)",
      "Complexos Reguladores, Central de Vagas e Acesso do Usuário"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • História das Políticas de Saúde e Gestão do SUS",
    "chips": [
      {
        "label": "Instrumentos de Planejamento Governamental e Gestão",
        "letter": "1",
        "value": "Conceito de alta relevância em Planejamento, Programação e Regulação no SUS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Complexos Reguladores, Central de Vagas e Acesso do Usuário",
        "letter": "2",
        "value": "Conceito de alta relevância em Planejamento, Programação e Regulação no SUS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Planejamento, Programação e Regulação no SUS: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Planejamento, Programação e Regulação no SUS: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-principios-da-atencao-primaria",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Princípios da Atenção Primária",
    "fullTitle": "Princípios da Atenção Primária (Atenção Primária à Saúde e Medicina de Família)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Princípios da Atenção Primária (Starfield: Atributos Essenciais e Derivados)",
    "subfocos": [
      "Atributos Essenciais de Barbara Starfield",
      "Atributos Derivados de Barbara Starfield"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Atenção Primária à Saúde e Medicina de Família",
    "chips": [
      {
        "label": "Atributos Essenciais de Barbara Starfield",
        "letter": "1",
        "value": "Conceito de alta relevância em Princípios da Atenção Primária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Atributos Derivados de Barbara Starfield",
        "letter": "2",
        "value": "Conceito de alta relevância em Princípios da Atenção Primária: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Princípios da Atenção Primária: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Princípios da Atenção Primária: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-estrategia-saude-da-familia-e-equip",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Estratégia Saúde da Família  e Equipe ",
    "fullTitle": "Estratégia Saúde da Família  e Equipe Multiprofissional (Atenção Primária à Saúde e Medicina de Família)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Estratégia Saúde da Família (ESF) e Equipe Multiprofissional (eMulti)",
    "subfocos": [
      "Diretrizes Operacionais e Composição da Equipe ESF",
      "Atribuições do ACS e Equipes Multiprofissionais (eMulti)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Atenção Primária à Saúde e Medicina de Família",
    "chips": [
      {
        "label": "Diretrizes Operacionais e Composição da Equipe ESF",
        "letter": "1",
        "value": "Conceito de alta relevância em Estratégia Saúde da Família  e Equipe Multiprofissional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Atribuições do ACS e Equipes Multiprofissionais",
        "letter": "2",
        "value": "Conceito de alta relevância em Estratégia Saúde da Família  e Equipe Multiprofissional: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Estratégia Saúde da Família  e Equipe Multiprofissional: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Estratégia Saúde da Família  e Equipe Multiprofissional: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-politica-nacional-de-atencao-basica",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Política Nacional de Atenção Básica",
    "fullTitle": "Política Nacional de Atenção Básica (Atenção Primária à Saúde e Medicina de Família)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Política Nacional de Atenção Básica (PNAB)",
    "subfocos": [
      "Diretrizes Operacionais, Carga Horária e Composição da ESF e eAP",
      "Atribuições dos Profissionais e Financiamento da Atenção Primária"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Atenção Primária à Saúde e Medicina de Família",
    "chips": [
      {
        "label": "Diretrizes Operacionais, Carga Horária e Composição da ESF e eAP",
        "letter": "1",
        "value": "Conceito de alta relevância em Política Nacional de Atenção Básica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Atribuições dos Profissionais e Financiamento da Atenção Primária",
        "letter": "2",
        "value": "Conceito de alta relevância em Política Nacional de Atenção Básica: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Política Nacional de Atenção Básica: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Política Nacional de Atenção Básica: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-metodo-clinico-centrado-na-pessoa-e",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Método Clínico Centrado na Pessoa e Ge",
    "fullTitle": "Método Clínico Centrado na Pessoa e Genograma/Ecomapa (Atenção Primária à Saúde e Medicina de Família)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Método Clínico Centrado na Pessoa e Genograma/Ecomapa",
    "subfocos": [
      "Os 4 Componentes do MCCP (Stewart)",
      "Ferramentas de Abordagem Familiar: Genograma e Ecomapa"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Atenção Primária à Saúde e Medicina de Família",
    "chips": [
      {
        "label": "Os 4 Componentes do MCCP",
        "letter": "1",
        "value": "Conceito de alta relevância em Método Clínico Centrado na Pessoa e Genograma/Ecomapa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Ferramentas de Abordagem Familiar: Genograma e Ecomapa",
        "letter": "2",
        "value": "Conceito de alta relevância em Método Clínico Centrado na Pessoa e Genograma/Ecomapa: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Método Clínico Centrado na Pessoa e Genograma/Ecomapa: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Método Clínico Centrado na Pessoa e Genograma/Ecomapa: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-prevencao-quaternaria-e-seguranca-d",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Prevenção Quaternária e Segurança do P",
    "fullTitle": "Prevenção Quaternária e Segurança do Paciente na APS (Atenção Primária à Saúde e Medicina de Família)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Atenção Primária à Saúde e Medicina de Família",
    "foco": "Prevenção Quaternária e Segurança do Paciente na APS",
    "subfocos": [
      "Os Níveis de Prevenção de Leavell & Clark e Jamoulle",
      "Princípios do *Choosing Wisely* e Medicina Baseada em Evidências"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Atenção Primária à Saúde e Medicina de Família",
    "chips": [
      {
        "label": "Os Níveis de Prevenção de Leavell & Clark e Jamoulle",
        "letter": "1",
        "value": "Conceito de alta relevância em Prevenção Quaternária e Segurança do Paciente na APS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Princípios do *Choosing Wisely* e Medicina Baseada em Evidências",
        "letter": "2",
        "value": "Conceito de alta relevância em Prevenção Quaternária e Segurança do Paciente na APS: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Prevenção Quaternária e Segurança do Paciente na APS: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Prevenção Quaternária e Segurança do Paciente na APS: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-incidencia-prevalencia-e-taxa-de-at",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Incidência, Prevalência e Taxa de Ataq",
    "fullTitle": "Incidência, Prevalência e Taxa de Ataque (Medidas de Frequência e Associação Epidemiológica)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Incidência, Prevalência e Taxa de Ataque",
    "subfocos": [
      "Conceito e Cálculo de Incidência vs Prevalência",
      "Taxa de Ataque e Taxa de Ataque Secundária"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Medidas de Frequência e Associação Epidemiológica",
    "chips": [
      {
        "label": "Conceito e Cálculo de Incidência vs Prevalência",
        "letter": "1",
        "value": "Conceito de alta relevância em Incidência, Prevalência e Taxa de Ataque: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Taxa de Ataque e Taxa de Ataque Secundária",
        "letter": "2",
        "value": "Conceito de alta relevância em Incidência, Prevalência e Taxa de Ataque: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Incidência, Prevalência e Taxa de Ataque: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Incidência, Prevalência e Taxa de Ataque: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-risco-relativo-e-razao-de-prevalenc",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Risco Relativo  e Razão de Prevalência",
    "fullTitle": "Risco Relativo  e Razão de Prevalência (Medidas de Frequência e Associação Epidemiológica)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Risco Relativo (RR) e Razão de Prevalência (RP)",
    "subfocos": [
      "Cálculo e Interpretação do Risco Relativo (RR)",
      "Razão de Prevalência (RP) em Estudos Transversais"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Medidas de Frequência e Associação Epidemiológica",
    "chips": [
      {
        "label": "Cálculo e Interpretação do Risco Relativo",
        "letter": "1",
        "value": "Conceito de alta relevância em Risco Relativo  e Razão de Prevalência: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Razão de Prevalência",
        "letter": "2",
        "value": "Conceito de alta relevância em Risco Relativo  e Razão de Prevalência: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Risco Relativo  e Razão de Prevalência: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Risco Relativo  e Razão de Prevalência: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-odds-ratio",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Odds Ratio",
    "fullTitle": "Odds Ratio (Medidas de Frequência e Associação Epidemiológica)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Odds Ratio (OR)",
    "subfocos": [
      "Cálculo do Odds Ratio (Razão de Chances) na Tabela 2x2",
      "Regressão Logística e Odds Ratio Ajustado"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Medidas de Frequência e Associação Epidemiológica",
    "chips": [
      {
        "label": "Cálculo do Odds Ratio",
        "letter": "1",
        "value": "Conceito de alta relevância em Odds Ratio: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Regressão Logística e Odds Ratio Ajustado",
        "letter": "2",
        "value": "Conceito de alta relevância em Odds Ratio: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Odds Ratio: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Odds Ratio: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-risco-atribuivel-e-fracao-atribuive",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Risco Atribuível e Fração Atribuível",
    "fullTitle": "Risco Atribuível e Fração Atribuível (Medidas de Frequência e Associação Epidemiológica)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Risco Atribuível e Fração Atribuível",
    "subfocos": [
      "Risco Atribuível no Grupo Exposto (RA / Risco Excessivo)",
      "Risco Atribuível Populacional (RAP) e Fração Atribuível Populacional (FAP)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Medidas de Frequência e Associação Epidemiológica",
    "chips": [
      {
        "label": "Risco Atribuível no Grupo Exposto",
        "letter": "1",
        "value": "Conceito de alta relevância em Risco Atribuível e Fração Atribuível: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Risco Atribuível Populacional",
        "letter": "2",
        "value": "Conceito de alta relevância em Risco Atribuível e Fração Atribuível: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Risco Atribuível e Fração Atribuível: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Risco Atribuível e Fração Atribuível: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-medidas-de-impacto-potencial",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Medidas de Impacto Potencial",
    "fullTitle": "Medidas de Impacto Potencial (Medidas de Frequência e Associação Epidemiológica)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Medidas de Frequência e Associação Epidemiológica",
    "foco": "Medidas de Impacto Potencial (NNT e NNH)",
    "subfocos": [
      "Redução Absoluta do Risco (RAR) e Cálculo do NNT",
      "Número Necessário para Prejudicar (NNH)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Medidas de Frequência e Associação Epidemiológica",
    "chips": [
      {
        "label": "Redução Absoluta do Risco",
        "letter": "1",
        "value": "Conceito de alta relevância em Medidas de Impacto Potencial: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Número Necessário para Prejudicar",
        "letter": "2",
        "value": "Conceito de alta relevância em Medidas de Impacto Potencial: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Medidas de Impacto Potencial: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Medidas de Impacto Potencial: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-estudo-de-coorte",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Estudo de Coorte",
    "fullTitle": "Estudo de Coorte (Desenhos de Estudos Epidemiológicos)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Estudo de Coorte",
    "subfocos": [
      "Metodologia, Direcionalidade e Tipos de Coorte",
      "Limitações e Vieses Críticos em Estudos de Coorte"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Desenhos de Estudos Epidemiológicos",
    "chips": [
      {
        "label": "Metodologia, Direcionalidade e Tipos de Coorte",
        "letter": "1",
        "value": "Conceito de alta relevância em Estudo de Coorte: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Limitações e Vieses Críticos em Estudos de Coorte",
        "letter": "2",
        "value": "Conceito de alta relevância em Estudo de Coorte: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Estudo de Coorte: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Estudo de Coorte: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-estudo-de-caso-controle",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Estudo de Caso-Controle",
    "fullTitle": "Estudo de Caso-Controle (Desenhos de Estudos Epidemiológicos)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Estudo de Caso-Controle",
    "subfocos": [
      "Metodologia e Seleção Adequada de Controles",
      "Vieses Típicos do Estudo de Caso-Controle"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Desenhos de Estudos Epidemiológicos",
    "chips": [
      {
        "label": "Metodologia e Seleção Adequada de Controles",
        "letter": "1",
        "value": "Conceito de alta relevância em Estudo de Caso-Controle: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Vieses Típicos do Estudo de Caso-Controle",
        "letter": "2",
        "value": "Conceito de alta relevância em Estudo de Caso-Controle: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Estudo de Caso-Controle: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Estudo de Caso-Controle: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-estudo-transversal",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Estudo Transversal",
    "fullTitle": "Estudo Transversal (Desenhos de Estudos Epidemiológicos)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Estudo Transversal (Seccional)",
    "subfocos": [
      "Inquéritos Populacionais e Avaliação Simultânea",
      "Limitação Metodológica: Ausência de Temporalidade"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Desenhos de Estudos Epidemiológicos",
    "chips": [
      {
        "label": "Inquéritos Populacionais e Avaliação Simultânea",
        "letter": "1",
        "value": "Conceito de alta relevância em Estudo Transversal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Limitação Metodológica: Ausência de Temporalidade",
        "letter": "2",
        "value": "Conceito de alta relevância em Estudo Transversal: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Estudo Transversal: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Estudo Transversal: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-ensaio-clinico-randomizado",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Ensaio Clínico Randomizado",
    "fullTitle": "Ensaio Clínico Randomizado (Desenhos de Estudos Epidemiológicos)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Ensaio Clínico Randomizado",
    "subfocos": [
      "Metodologia Experimental e Randomização",
      "Análise por Intenção de Tratar e Fases do Ensaio Clínico"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Desenhos de Estudos Epidemiológicos",
    "chips": [
      {
        "label": "Metodologia Experimental e Randomização",
        "letter": "1",
        "value": "Conceito de alta relevância em Ensaio Clínico Randomizado: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Análise por Intenção de Tratar e Fases do Ensaio Clínico",
        "letter": "2",
        "value": "Conceito de alta relevância em Ensaio Clínico Randomizado: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Ensaio Clínico Randomizado: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Ensaio Clínico Randomizado: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-estudo-ecologico",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Estudo Ecológico",
    "fullTitle": "Estudo Ecológico (Desenhos de Estudos Epidemiológicos)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Estudo Ecológico",
    "subfocos": [
      "Estudos com Dados Agregados Espaciais e Temporais",
      "Falácia Ecológica (Viés de Agregação)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Desenhos de Estudos Epidemiológicos",
    "chips": [
      {
        "label": "Estudos com Dados Agregados Espaciais e Temporais",
        "letter": "1",
        "value": "Conceito de alta relevância em Estudo Ecológico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Falácia Ecológica",
        "letter": "2",
        "value": "Conceito de alta relevância em Estudo Ecológico: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Estudo Ecológico: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Estudo Ecológico: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-revisoes-sistematicas-e-metanalises",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Revisões Sistemáticas e Metanálises",
    "fullTitle": "Revisões Sistemáticas e Metanálises (Desenhos de Estudos Epidemiológicos)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Revisões Sistemáticas e Metanálises",
    "subfocos": [
      "Metodologia da Revisão Sistemática e Prisma",
      "Interpretação do Forest Plot e Heterogeneidade (I2)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Desenhos de Estudos Epidemiológicos",
    "chips": [
      {
        "label": "Metodologia da Revisão Sistemática e Prisma",
        "letter": "1",
        "value": "Conceito de alta relevância em Revisões Sistemáticas e Metanálises: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Interpretação do Forest Plot e Heterogeneidade",
        "letter": "2",
        "value": "Conceito de alta relevância em Revisões Sistemáticas e Metanálises: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Revisões Sistemáticas e Metanálises: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Revisões Sistemáticas e Metanálises: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-validade-interna-vieses-e-causalida",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Validade Interna, Vieses  e Causalidad",
    "fullTitle": "Validade Interna, Vieses  e Causalidade (Desenhos de Estudos Epidemiológicos)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Desenhos de Estudos Epidemiológicos",
    "foco": "Validade Interna, Vieses (Confundimento, Seleção, Aferição) e Causalidade (Hill)",
    "subfocos": [
      "Vieses Epidemiológicos Clássicos (Seleção, Informação e Confundimento)",
      "Critérios de Causalidade de Sir Austin Bradford Hill"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Desenhos de Estudos Epidemiológicos",
    "chips": [
      {
        "label": "Vieses Epidemiológicos Clássicos",
        "letter": "1",
        "value": "Conceito de alta relevância em Validade Interna, Vieses  e Causalidade: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Critérios de Causalidade de Sir Austin Bradford Hill",
        "letter": "2",
        "value": "Conceito de alta relevância em Validade Interna, Vieses  e Causalidade: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Validade Interna, Vieses  e Causalidade: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Validade Interna, Vieses  e Causalidade: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-sensibilidade-e-especificidade",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Sensibilidade e Especificidade",
    "fullTitle": "Sensibilidade e Especificidade (Acurácia de Testes Diagnósticos e Rastreamento)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Sensibilidade e Especificidade",
    "subfocos": [
      "Propriedades Intrínsecas do Teste Diagnóstico",
      "Testes em Série vs Testes em Paralelo"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Acurácia de Testes Diagnósticos e Rastreamento",
    "chips": [
      {
        "label": "Propriedades Intrínsecas do Teste Diagnóstico",
        "letter": "1",
        "value": "Conceito de alta relevância em Sensibilidade e Especificidade: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Testes em Série vs Testes em Paralelo",
        "letter": "2",
        "value": "Conceito de alta relevância em Sensibilidade e Especificidade: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Sensibilidade e Especificidade: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Sensibilidade e Especificidade: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-valores-preditivos-e-efeito-da-prev",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Valores Preditivos  e Efeito da Preval",
    "fullTitle": "Valores Preditivos  e Efeito da Prevalência (Acurácia de Testes Diagnósticos e Rastreamento)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Valores Preditivos (Positivo e Negativo) e Efeito da Prevalência",
    "subfocos": [
      "Cálculo de VPP e VPN e a Influência da Prevalência",
      "Acurácia Global do Teste Diagnóstico"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Acurácia de Testes Diagnósticos e Rastreamento",
    "chips": [
      {
        "label": "Cálculo de VPP e VPN e a Influência da Prevalência",
        "letter": "1",
        "value": "Conceito de alta relevância em Valores Preditivos  e Efeito da Prevalência: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Acurácia Global do Teste Diagnóstico",
        "letter": "2",
        "value": "Conceito de alta relevância em Valores Preditivos  e Efeito da Prevalência: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Valores Preditivos  e Efeito da Prevalência: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Valores Preditivos  e Efeito da Prevalência: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-razoes-de-verossimilhanca",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Razões de Verossimilhança",
    "fullTitle": "Razões de Verossimilhança (Acurácia de Testes Diagnósticos e Rastreamento)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Razões de Verossimilhança (Likelihood Ratios)",
    "subfocos": [
      "Cálculo e Significado Clínico da RV+ e RV-",
      "Nomograma de Fagan e Teorema de Bayes"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Acurácia de Testes Diagnósticos e Rastreamento",
    "chips": [
      {
        "label": "Cálculo e Significado Clínico da RV+ e RV-",
        "letter": "1",
        "value": "Conceito de alta relevância em Razões de Verossimilhança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Nomograma de Fagan e Teorema de Bayes",
        "letter": "2",
        "value": "Conceito de alta relevância em Razões de Verossimilhança: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Razões de Verossimilhança: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Razões de Verossimilhança: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-curva-roc-e-ponto-de-corte",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Curva ROC e Ponto de Corte",
    "fullTitle": "Curva ROC e Ponto de Corte (Acurácia de Testes Diagnósticos e Rastreamento)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Curva ROC e Ponto de Corte",
    "subfocos": [
      "Construção da Curva ROC e Área sob a Curva (AUC)",
      "Escolha do Ponto de Corte Ideal"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Acurácia de Testes Diagnósticos e Rastreamento",
    "chips": [
      {
        "label": "Construção da Curva ROC e Área sob a Curva",
        "letter": "1",
        "value": "Conceito de alta relevância em Curva ROC e Ponto de Corte: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Escolha do Ponto de Corte Ideal",
        "letter": "2",
        "value": "Conceito de alta relevância em Curva ROC e Ponto de Corte: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Curva ROC e Ponto de Corte: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Curva ROC e Ponto de Corte: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-principios-de-rastreamento-e-criter",
    "category": "rastreamento",
    "categoryLabel": "Rastreamento & Exames de Rotina",
    "title": "Princípios de Rastreamento e Critérios",
    "fullTitle": "Princípios de Rastreamento e Critérios de Frame & Carlson (Acurácia de Testes Diagnósticos e Rastreamento)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Acurácia de Testes Diagnósticos e Rastreamento",
    "foco": "Princípios de Rastreamento e Critérios de Frame & Carlson",
    "subfocos": [
      "Critérios Clássicos de Rastreamento Populacional (Wilson & Jungner)",
      "Vieses em Rastreamento e Danos do Sobrediagnóstico (Overdiagnosis)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Acurácia de Testes Diagnósticos e Rastreamento",
    "chips": [
      {
        "label": "Critérios Clássicos de Rastreamento Populacional",
        "letter": "1",
        "value": "Conceito de alta relevância em Princípios de Rastreamento e Critérios de Frame & Carlson: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Vieses em Rastreamento e Danos do Sobrediagnóstico",
        "letter": "2",
        "value": "Conceito de alta relevância em Princípios de Rastreamento e Critérios de Frame & Carlson: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Princípios de Rastreamento e Critérios de Frame & Carlson: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Princípios de Rastreamento e Critérios de Frame & Carlson: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-lista-nacional-de-notificacao-compu",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Lista Nacional de Notificação Compulsó",
    "fullTitle": "Lista Nacional de Notificação Compulsória (Vigilância em Saúde e Notificação Compulsória)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Vigilância em Saúde e Notificação Compulsória",
    "foco": "Lista Nacional de Notificação Compulsória (Portaria de Notificação e Prazos)",
    "subfocos": [
      "Notificação Imediata (em até 24 Horas)",
      "Notificação Semanal e Regras Gerais de Notificação"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Vigilância em Saúde e Notificação Compulsória",
    "chips": [
      {
        "label": "Notificação Imediata",
        "letter": "1",
        "value": "Conceito de alta relevância em Lista Nacional de Notificação Compulsória: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Notificação Semanal e Regras Gerais de Notificação",
        "letter": "2",
        "value": "Conceito de alta relevância em Lista Nacional de Notificação Compulsória: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Lista Nacional de Notificação Compulsória: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Lista Nacional de Notificação Compulsória: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-investigacao-de-surtos-e-epidemias",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Investigação de Surtos e Epidemias",
    "fullTitle": "Investigação de Surtos e Epidemias (Vigilância em Saúde e Notificação Compulsória)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Vigilância em Saúde e Notificação Compulsória",
    "foco": "Investigação de Surtos e Epidemias",
    "subfocos": [
      "Etapas Metodológicas de Investigação de Surto",
      "Curvas Epidêmicas (Fonte Pontual vs Propagada)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Vigilância em Saúde e Notificação Compulsória",
    "chips": [
      {
        "label": "Etapas Metodológicas de Investigação de Surto",
        "letter": "1",
        "value": "Conceito de alta relevância em Investigação de Surtos e Epidemias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Curvas Epidêmicas",
        "letter": "2",
        "value": "Conceito de alta relevância em Investigação de Surtos e Epidemias: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Investigação de Surtos e Epidemias: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Investigação de Surtos e Epidemias: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-vigilancia-epidemiologica-de-doenca",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vigilância Epidemiológica de Doenças T",
    "fullTitle": "Vigilância Epidemiológica de Doenças Transmissíveis (Vigilância em Saúde e Notificação Compulsória)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Vigilância em Saúde e Notificação Compulsória",
    "foco": "Vigilância Epidemiológica de Doenças Transmissíveis",
    "subfocos": [
      "Lista Nacional de Notificação Compulsória e Prazos",
      "Investigação de Surtos e Epidemias em Saúde Pública"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Vigilância em Saúde e Notificação Compulsória",
    "chips": [
      {
        "label": "Lista Nacional de Notificação Compulsória e Prazos",
        "letter": "1",
        "value": "Conceito de alta relevância em Vigilância Epidemiológica de Doenças Transmissíveis: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Investigação de Surtos e Epidemias em Saúde Pública",
        "letter": "2",
        "value": "Conceito de alta relevância em Vigilância Epidemiológica de Doenças Transmissíveis: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vigilância Epidemiológica de Doenças Transmissíveis: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vigilância Epidemiológica de Doenças Transmissíveis: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  },
  {
    "id": "tip-medi-vigilancia-sanitaria-e-vigilancia-a",
    "category": "decorebas",
    "categoryLabel": "Valores & Pontos de Corte",
    "title": "Vigilância Sanitária e Vigilância Ambi",
    "fullTitle": "Vigilância Sanitária e Vigilância Ambiental (Vigilância em Saúde e Notificação Compulsória)",
    "specialty": "Medicina Preventiva e Social",
    "tema": "Vigilância em Saúde e Notificação Compulsória",
    "foco": "Vigilância Sanitária e Vigilância Ambiental",
    "subfocos": [
      "Atuação e Competências da Vigilância Sanitária (VISA / ANVISA)",
      "Vigilância em Saúde Ambiental (VIGIAMBIENTE)"
    ],
    "provenanceDefault": "Visto em Medicina Preventiva e Social • Vigilância em Saúde e Notificação Compulsória",
    "chips": [
      {
        "label": "Atuação e Competências da Vigilância Sanitária",
        "letter": "1",
        "value": "Conceito de alta relevância em Vigilância Sanitária e Vigilância Ambiental: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      },
      {
        "label": "Vigilância em Saúde Ambiental",
        "letter": "2",
        "value": "Conceito de alta relevância em Vigilância Sanitária e Vigilância Ambiental: avaliação dos critérios de conduta e condutas padronizadas nas diretrizes."
      }
    ],
    "rule": "Diretriz oficial em Vigilância Sanitária e Vigilância Ambiental: priorize a conduta de primeira linha e o diagnóstico diferencial com as principais patologias da mesma topografia.",
    "bancaTrap": "Pegadinha clássica em Vigilância Sanitária e Vigilância Ambiental: fique atento aos falsos-positivos e às contraindicações formais mais exploradas pelas bancas de residência."
  }
];
