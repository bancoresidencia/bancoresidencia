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
  },
  Bumm: {
    term: 'Bumm',
    fullName: 'Tríade de Bumm (Endometrite Puerperal)',
    definition: 'Tríade clínica clássica patognomônica de infecção puerperal: 1) Febre em picos; 2) Útero subinvoluído, doloroso e amolecido (pastoso); 3) Lóquios escuros/achocolatados e de odor fétido.',
    examTip: 'Nas provas, o útero NUNCA é duro e retraído; a miomalácia e atonia são marcadores do acometimento infeccioso da decídua e miométrio.',
    category: 'obstetricia'
  },
  Endometrite: {
    term: 'Endometrite',
    fullName: 'Endometrite Puerperal (Infecção Puerperal)',
    definition: 'Infecção bacteriana polimicrobiana mista (anaeróbios + Gram-negativos) do endométrio e decídua pós-parto. Principal causa de morbidade febril puerperal.',
    examTip: 'Tratamento padrão-ouro hospitalar com Clindamicina 900mg IV 8/8h + Gentamicina 5mg/kg IV 24/24h até 48h afebril. Sem antibiótico oral após a alta!',
    category: 'obstetricia'
  },
  Apojadura: {
    term: 'Apojadura',
    fullName: 'Apojadura Mamária Fisiológica ("Descida do Leite")',
    definition: 'Descida fisiológica do leite que ocorre entre o 2º e 4º dia pós-parto por queda de progesterona e liberação de prolactina. Pode causar febre baixa autolimitada (< 24h) e mamas túrgidas bilaterais.',
    examTip: 'Não é infecção! O útero está normal, a puérpera está em bom estado geral e NÃO se usa antibiótico. Aferição axilar pode ser falseada pelo calor mamário.',
    category: 'obstetricia'
  },
  TPS: {
    term: 'TPS',
    fullName: 'Tromboflebite Pélvica Séptica',
    definition: 'Trombose venosa infectada dos plexos pélvicos e veias ovarianas (especialmente a veia ovariana direita) após infecção puerperal.',
    examTip: 'Suspeitar quando a puérpera mantém picos febris diários ("em agulha") após 48-72h de antibióticos venosos, com exame físico pélvico inocente. Confirmada pelo Teste da Heparina.',
    category: 'obstetricia'
  },
  Loquiometra: {
    term: 'Loquiometra',
    fullName: 'Loquiometra Puerperal',
    definition: 'Retenção patológica de secreções e lóquios no interior da cavidade uterina decorrente de espasmo ou estenose cervical pós-parto, favorecendo proliferação bacteriana e febre.',
    examTip: 'Reconhecida por útero discretamente aumentado e doloroso sem fluxo externo de lóquios. Trata-se com ocitocina e desobstrução suave do canal cervical.',
    category: 'obstetricia'
  },
  MEOWS: {
    term: 'MEOWS',
    fullName: 'Modified Early Obstetric Warning Score',
    definition: 'Escore fisiológico de alerta precoce específico para obstetrícia, calibrado para detectar precocemente sepse materna e choque séptico puerperal.',
    examTip: 'Substitui o qSOFA clássico no ciclo gravídico-puerperal, pois a leucocitose fisiológica pós-parto falseia escores clínicos comuns de adultos.',
    category: 'obstetricia'
  },
  Giordano: {
    term: 'Giordano',
    fullName: 'Sinal de Giordano (Punho-percussão Lombar)',
    definition: 'Dor aguda em pontada ou choque desencadeada pela percussão suave da região lombar (fossa renal) com a borda ulnar da mão, indicando distensão da cápsula renal.',
    examTip: 'Sinal semiológico cardinal de pielonefrite aguda. Fundamental no puerpério febril para descartar infecção alta do trato urinário após sondagem vesical da cesárea.',
    category: 'clinica'
  },
  Cefazolina: {
    term: 'Cefazolina',
    fullName: 'Cefazolina Sódica (Cefalosporina de 1ª Geração)',
    definition: 'Antimicrobiano betalactâmico de primeira geração com excelente ação bactericida contra Staphylococcus aureus sensível e estreptococos de pele.',
    examTip: 'Fármaco padrão-ouro para profilaxia cirúrgica em 100% das cesarianas: 2g IV (3g se IMC ≥ 35 ou peso ≥ 120 kg) infundido 30 a 60 min ANTES da incisão na pele (indução anestésica).',
    category: 'obstetricia'
  },
  Gentamicina: {
    term: 'Gentamicina',
    fullName: 'Gentamicina (Aminoglicosídeo Pico-Dependente)',
    definition: 'Antimicrobiano aminoglicosídeo bactericida concentração-dependente (pico-dependente), ativo contra bacilos Gram-negativos entéricos aeróbios/facultativos como E. coli e Klebsiella.',
    examTip: 'Administrada em dose única diária (5 mg/kg IV uma vez ao dia). Possui efeito pós-antibiótico prolongado e menor nefro/ototoxicidade que o regime fracionado de 8/8h.',
    category: 'obstetricia'
  },
  Clindamicina: {
    term: 'Clindamicina',
    fullName: 'Clindamicina Fosfato (Lincosamida)',
    definition: 'Antimicrobiano da classe das lincosamidas com potente atividade contra bactérias anaeróbias estritas (incluindo Bacteroides fragilis) e cocos Gram-positivos.',
    examTip: 'Dose padrão na endometrite: 900 mg IV a cada 8 horas. Sua associação com Gentamicina cobre 95% da flora polimicrobiana ascendente da infecção puerperal.',
    category: 'obstetricia'
  },
  Lóquios: {
    term: 'Lóquios',
    fullName: 'Loquiação Puerperal Fisiológica',
    definition: 'Corrimento fisiológico uterovaginal pós-parto composto por sangue, fragmentos de decídua desprendida, muco cervical e transudato de cicatrização.',
    examTip: 'Evolução normal: rubros (sangue vivo, 1º-3º dia), serosos/fuscos (róseo-acastanhados, 4º-10º dia) e alvos/brancos (após 10º dia). Odor fétido e cor de borra de café indicam infecção (endometrite).',
    category: 'obstetricia'
  }
};