import { MedicalGlossaryEntry } from '@/types/studyMaterialAnnotations';

export const MEDICAL_GLOSSARY: Record<string, MedicalGlossaryEntry> = {
  CIUR: {
    term: 'CIUR',
    fullName: 'Crescimento Intrauterino Restrito',
    definition: 'Feto que não atinge seu potencial genético de crescimento devido a fatores patológicos maternos, fetais ou placentários.',
    examTip: 'Atenção para não confundir com PIG constitucional: o CIUR cursa com alteração na dopplerfluxometria fetal/placentária.',
    category: 'obstetricia'
  },
  RCIU: {
    term: 'RCIU',
    fullName: 'Restrição de Crescimento Intrauterino',
    definition: 'Sinônimo clínico de CIUR. Indicador de insuficiência placentária crônica ou hipóxia fetal.',
    examTip: 'Rastreio padrão com altura uterina e confirmação por biometria fetal e doppler da artéria umbilical.',
    category: 'obstetricia'
  },
  PIG: {
    term: 'PIG',
    fullName: 'Pequeno para a Idade Gestacional',
    definition: 'Feto com peso estimado abaixo do percentil 10 para a idade gestacional. Nem todo PIG é patológico (pode ser constitucional).',
    examTip: 'PIG constitucional tem Doppler normal e líquido amniótico normal, sem risco elevado de hipóxia.',
    category: 'obstetricia'
  },
  FIGO: {
    term: 'FIGO',
    fullName: 'Federação Internacional de Ginecologia e Obstetrícia',
    definition: 'Entidade global que padroniza classificações clínicas em gineco-obstetrícia, como estadiamento oncológico e miomas uterinos.',
    examTip: 'A classificação FIGO para miomas varia de 0 (pediculado intracavitário) a 8 (parasita/cervical).',
    category: 'ginecologia'
  },
  'USG-TV': {
    term: 'USG-TV',
    fullName: 'Ultrassonografia Transvaginal',
    definition: 'Método de imagem inicial padrão-ouro para avaliação da pelve feminina, cavidade endometrial e anexos.',
    examTip: 'Em mulheres na pós-menopausa sem TRH, espessura endometrial > 4-5 mm exige biópsia endometrial.',
    category: 'ginecologia'
  },
  'PALM-COEIN': {
    term: 'PALM-COEIN',
    fullName: 'Classificação FIGO para Sangramento Uterino Anormal',
    definition: 'Acrônimo mnemônico: PALM para causas estruturais (Pólipo, Adenomiose, Leiomioma, Malignidade) e COEIN para não estruturais (Coagulopatia, Ovulatória, Endometrial, Iatrogênica, Não classificada).',
    examTip: 'Tema campeão no ENARE e USP para investigação diagnóstica de SUA na menacme.',
    category: 'ginecologia'
  },
  'BI-RADS': {
    term: 'BI-RADS',
    fullName: 'Breast Imaging-Reporting and Data System',
    definition: 'Classificação mamográfica padronizada de 0 a 6 para uniformizar laudos de imagem mamária e indicar condutas.',
    examTip: 'BI-RADS 3 = controle em 6 meses; BI-RADS 4 e 5 = indicação de biópsia histológica imediata (core biopsy).',
    category: 'ginecologia'
  },
  DHEG: {
    term: 'DHEG',
    fullName: 'Doença Hipertensiva Específica da Gestação',
    definition: 'Hipertensão arterial sistêmica que surge após 20 semanas de gestação, associada ou não à proteinúria (Pré-eclâmpsia).',
    examTip: 'O tratamento definitivo da pré-eclâmpsia grave é o parto. Para prevenção de convulsões, o fármaco de escolha é o Sulfato de Magnésio.',
    category: 'obstetricia'
  },
  HELLP: {
    term: 'HELLP',
    fullName: 'Síndrome HELLP (Hemolysis, Elevated Liver enzymes, Low Platelets)',
    definition: 'Forma grave de complicação microangiopática da pré-eclâmpsia caracterizada por hemólise (LDH alto, esquizócitos), transaminases elevadas e plaquetopenia (< 100.000/mm³).',
    examTip: 'Presença de dor epigástrica súbita em gestante hipertensa sugere distensão da cápsula de Glisson (iminência de rotura hepática).',
    category: 'obstetricia'
  },
  TEP: {
    term: 'TEP',
    fullName: 'Tromboembolismo Pulmonar',
    definition: 'Oclusão arterial pulmonar por êmbolos originados do sistema venoso profundo. Clínica clássica: dispneia súbita, dor pleurítica e taquicardia.',
    examTip: 'Avaliação inicial com Escore de Wells. Se alta probabilidade: Angiotomografia de tórax. O D-dímero só serve para descartar TEP em baixa probabilidade.',
    category: 'clinica'
  },
  TVP: {
    term: 'TVP',
    fullName: 'Trombose Venosa Profunda',
    definition: 'Formação de trombo no leito venoso profundo, mais frequente em membros inferiores. Diagnóstico padrão-ouro: Ultrassom Doppler venoso.',
    examTip: 'Tríade de Virchow: lesão endotelial, estase sanguínea e hipercoagulabilidade.',
    category: 'clinica'
  },
  ATLS: {
    term: 'ATLS',
    fullName: 'Advanced Trauma Life Support',
    definition: 'Protocolo sistematizado de abordagem do paciente politraumatizado com mnemônico X-A-B-C-D-E.',
    examTip: 'O "X" inicial prioriza o controle de hemorragias exanguinantes externas com torniquete antes da via aérea.',
    category: 'cirurgia'
  },
  'CURB-65': {
    term: 'CURB-65',
    fullName: 'Escore CURB-65 para Pneumonia Adquirida na Comunidade',
    definition: 'Critérios: Confusão mental, Ureia ≥ 50 mg/dL, Respiração ≥ 30 irpm, Blood pressure (PAS < 90 ou PAD ≤ 60), Idade ≥ 65 anos.',
    examTip: 'Escore 0-1 = ambulatorial; escore 2 = considerar internação em enfermaria; escore ≥ 3 = internação urgente / UTI.',
    category: 'clinica'
  },
  'CHA2DS2-VASc': {
    term: 'CHA2DS2-VASc',
    fullName: 'Escore de Risco Tromboembólico na Fibrilação Atrial',
    definition: 'Estratifica o risco de AVC em pacientes com fibrilação atrial não valvar para decidir início de anticoagulantes orais (DOACs ou Warfarina).',
    examTip: 'Homens ≥ 2 e mulheres ≥ 3 têm indicação formal de anticoagulação (Classe I).',
    category: 'cardiologia'
  },
  Glasgow: {
    term: 'Glasgow',
    fullName: 'Escala de Coma de Glasgow (ECG / GCS-P)',
    definition: 'Avaliação neurológica objetiva do nível de consciência (abertura ocular, resposta verbal, resposta motora e reatividade pupilar).',
    examTip: 'Pontuação ≤ 8 indica trauma cranioencefálico grave e é critério absoluto para intubação orotraqueal e proteção de via aérea.',
    category: 'cirurgia'
  },
  Alvarado: {
    term: 'Alvarado',
    fullName: 'Escore de Alvarado (MANTRELS)',
    definition: 'Sistema de pontuação para estratificação de probabilidade clínica de apendicite aguda.',
    examTip: 'Os dois critérios que pontuam 2 pontos no escore são: dor na fossa ilíaca direita (descompressão brusca) e leucocitose > 10.000.',
    category: 'cirurgia'
  }
};

