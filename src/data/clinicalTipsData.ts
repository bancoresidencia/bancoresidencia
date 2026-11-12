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
  specialty: string;
  tema: string;
  provenanceDefault: string;
  acronym?: string;
  chips: Array<{
    label: string;
    letter?: string;
    value: string;
  }>;
  rule: string;
  bancaTrap?: string;
}

export const CLINICAL_TIPS_DATABASE: ClinicalTipItem[] = [
  // 1. CRITÉRIOS & ESCORES DIAGNÓSTICOS
  {
    id: 'tip-ranson-admissao',
    category: 'criterios',
    categoryLabel: 'Critérios Diagnósticos',
    title: 'Critérios de Ranson na Admissão (Pancreatite Aguda)',
    specialty: 'Cirurgia Geral',
    tema: 'Pancreatite Aguda',
    provenanceDefault: 'Visto em Cirurgia Geral • Pancreatite Aguda',
    acronym: 'L-A-G-A-R',
    chips: [
      { label: 'Leucócitos', letter: 'L', value: '> 16.000 /mm³' },
      { label: 'Idade', letter: 'A', value: '> 55 anos' },
      { label: 'Glicose', letter: 'G', value: '> 200 mg/dL' },
      { label: 'AST / TGO', letter: 'A', value: '> 250 U/L' },
      { label: 'LDH / DHL', letter: 'R', value: '> 350 U/L' }
    ],
    rule: '≥3 critérios na admissão prediz pancreatite aguda grave (indicação formal de UTI e hidratação vigorosa).',
    bancaTrap: 'Amilase e Lipase NÃO avaliam gravidade nem entram em Ranson (servem apenas para diagnóstico).'
  },
  {
    id: 'tip-criterios-light',
    category: 'criterios',
    categoryLabel: 'Critérios Diagnósticos',
    title: 'Critérios de Light (Derrame Pleural: Exsudato vs Transudato)',
    specialty: 'Clínica Médica',
    tema: 'Pneumologia',
    provenanceDefault: 'Visto em Clínica Médica • Derrame Pleural',
    acronym: 'LIGHT',
    chips: [
      { label: 'Prot Pleural/Sérica', letter: '1', value: '> 0,5' },
      { label: 'LDH Pleural/Sérico', letter: '2', value: '> 0,6' },
      { label: 'LDH Pleural Absoluto', letter: '3', value: '> 2/3 LSN sérico' }
    ],
    rule: 'Basta 1 critério positivo para classificar como EXSUDATO (inflamatório/infeccioso/neoplásico).',
    bancaTrap: 'A regra é "OU", nunca "E". Em cardiopatas usando diurético, use gradiente albumina soro-pleural > 1,2.'
  },
  {
    id: 'tip-curb-65',
    category: 'criterios',
    categoryLabel: 'Critérios Diagnósticos',
    title: 'Escore CURB-65 (Estratificação na Pneumonia Adquirida na Comunidade)',
    specialty: 'Clínica Médica',
    tema: 'Pneumologia',
    provenanceDefault: 'Visto em Clínica Médica • Pneumologia e PAC',
    acronym: 'C-U-R-B-65',
    chips: [
      { label: 'Confusão Mental', letter: 'C', value: 'Presente (1 pt)' },
      { label: 'Ureia Sérica', letter: 'U', value: '≥ 50 mg/dL (1 pt)' },
      { label: 'Respiração / FR', letter: 'R', value: '≥ 30 irpm (1 pt)' },
      { label: 'Blood Pressure / PA', letter: 'B', value: 'PAS < 90 ou PAD ≤ 60 (1 pt)' },
      { label: 'Idade', letter: '65', value: '≥ 65 anos (1 pt)' }
    ],
    rule: '0-1 pt: Ambulatório | 2 pts: Internação em enfermaria | ≥3 pts: Internação grave (avaliar UTI).',
    bancaTrap: 'No CRB-65 simplificado (sem ureia), pontuação ≥ 1 já contraindica tratamento ambulatorial isolado.'
  },
  {
    id: 'tip-escore-apgar',
    category: 'criterios',
    categoryLabel: 'Critérios Diagnósticos',
    title: 'Escore de Apgar Neonatal (Avaliação da Vitalidade)',
    specialty: 'Pediatria',
    tema: 'Neonatologia',
    provenanceDefault: 'Visto em Pediatria • Recepção Neonatal',
    acronym: 'A-P-G-A-R',
    chips: [
      { label: 'Aparência / Cor', letter: 'A', value: '0: Pálido • 1: Acrocianose • 2: Rosado' },
      { label: 'Pulso / FC', letter: 'P', value: '0: Ausente • 1: < 100 • 2: ≥ 100 bpm' },
      { label: 'Gesticulação', letter: 'G', value: '0: Sem reposta • 1: Careta • 2: Choro/Espirro' },
      { label: 'Atividade / Tônus', letter: 'A', value: '0: Flácido • 1: Alguma flexão • 2: Ativo' },
      { label: 'Respiração', letter: 'R', value: '0: Ausente • 1: Irregular • 2: Choro forte' }
    ],
    rule: 'Pontuado no 1º e 5º min. Apgar < 7 no 5º min exige reavaliação a cada 5 min até 20 min.',
    bancaTrap: 'NUNCA aguarde a contagem do Apgar para iniciar manobras de reanimação em sala de parto!'
  },

  // 2. VALORES DECOREBAS & PONTOS DE CORTE
  {
    id: 'tip-metas-hba1c',
    category: 'decorebas',
    categoryLabel: 'Valores Decorebas de Prova',
    title: 'Metas Glicêmicas e HbA1c (Diretrizes SBD / ADA)',
    specialty: 'Clínica Médica',
    tema: 'Endocrinologia',
    provenanceDefault: 'Visto em Clínica Médica • Diabetes Mellitus',
    chips: [
      { label: 'Adulto Não Gestante', value: 'HbA1c < 7,0%' },
      { label: 'Idoso Hígido / Ativo', value: 'HbA1c < 7,5%' },
      { label: 'Idoso Frágil / Demência', value: 'HbA1c < 8,0% - 8,5%' },
      { label: 'Glicemia Pré-Prandial', value: '80 a 130 mg/dL' },
      { label: 'Glicemia Pós-Prandial', value: '< 180 mg/dL' }
    ],
    rule: 'Em idosos com múltiplas comorbidades, priorize evitar hipoglicemia relaxando o alvo para < 8,0%.',
    bancaTrap: 'Na gestante diabética o alvo é mais estrito: HbA1c < 6,0% e jejum < 95 mg/dL.'
  },
  {
    id: 'tip-aneurisma-aorta',
    category: 'decorebas',
    categoryLabel: 'Valores Decorebas de Prova',
    title: 'Pontos de Corte para Cirurgia no Aneurisma de Aorta Abdominal (AAA)',
    specialty: 'Cirurgia Geral',
    tema: 'Cirurgia Vascular',
    provenanceDefault: 'Visto em Cirurgia Geral • Cirurgia Vascular',
    chips: [
      { label: 'Diâmetro Homens', value: '≥ 5,5 cm' },
      { label: 'Diâmetro Mulheres', value: '≥ 5,0 cm' },
      { label: 'Taxa de Crescimento', value: '> 0,5 cm em 6 meses' },
      { label: 'Sintomático / Dor', value: 'Cirurgia Imediata' },
      { label: 'Forma Sacular', value: 'Indicação Cirúrgica' }
    ],
    rule: 'Aneurismas assintomáticos fusiformes < 5,5 cm em homens mantêm vigilância ultrassonográfica seriada.',
    bancaTrap: 'A presença de dor lombar ou hipotensão indica iminência de rotura: TC de urgência ou Bloco.'
  },
  {
    id: 'tip-diurese-kdigo',
    category: 'decorebas',
    categoryLabel: 'Valores Decorebas de Prova',
    title: 'Critérios de Oligúria e Estadiamento KDIGO na Injúria Renal Aguda (IRA)',
    specialty: 'Clínica Médica',
    tema: 'Nefrologia',
    provenanceDefault: 'Visto em Clínica Médica • Nefrologia',
    chips: [
      { label: 'KDIGO 1 (Cr)', value: 'Cr 1,5-1,9x ou ↑ ≥ 0,3' },
      { label: 'KDIGO 1 (Diurese)', value: '< 0,5 mL/kg/h por 6-12h' },
      { label: 'KDIGO 2 (Cr / D)', value: 'Cr 2,0-2,9x ou < 0,5 mL/kg/h ≥ 12h' },
      { label: 'KDIGO 3 (Cr)', value: 'Cr ≥ 3,0x ou Cr ≥ 4,0 ou TRS' },
      { label: 'KDIGO 3 (Diurese)', value: '< 0,3 mL/kg/h ≥ 24h ou Anúria ≥ 12h' }
    ],
    rule: 'A queda do débito urinário (< 0,5 mL/kg/h por 6h) detecta IRA antes mesmo do pico sérico de creatinina.',
    bancaTrap: 'O aumento de apenas 0,3 mg/dL na creatinina em 48h já fecha diagnóstico formal de KDIGO 1.'
  },

  // 3. MNEMÔNICOS CANÔNICOS
  {
    id: 'tip-palm-coein',
    category: 'mnemonicos',
    categoryLabel: 'Mnemônicos Canônicos',
    title: 'Classificação FIGO do Sangramento Uterino Anormal (PALM-COEIN)',
    specialty: 'Ginecologia',
    tema: 'Sangramento Uterino Anormal',
    provenanceDefault: 'Visto em Ginecologia • Sangramento Uterino Anormal',
    acronym: 'PALM-COEIN',
    chips: [
      { label: 'Pólipo', letter: 'P', value: 'Estrutural (USG/Histero)' },
      { label: 'Adenomiose', letter: 'A', value: 'Útero globoso doloroso' },
      { label: 'Leiomioma', letter: 'L', value: 'Submucoso vs Outros' },
      { label: 'Malignidade', letter: 'M', value: 'Hiperplasia / Endométrio' },
      { label: 'Não Estruturais', letter: 'COEIN', value: 'Coagulopatia, Ovulatória, Endometrial, Iatrogênica, Não esp.' }
    ],
    rule: 'PALM = Causas anatômicas/estruturais (imagem e histopatologia). COEIN = Causas funcionais/médicas.',
    bancaTrap: 'DIU de cobre e anticoagulantes entram no grupo não estrutural (Iatrogênica / Coagulopatia).'
  },
  {
    id: 'tip-monache',
    category: 'mnemonicos',
    categoryLabel: 'Mnemônicos Canônicos',
    title: 'Manejo Inicial na Síndrome Coronariana Aguda (M-O-N-A-C-H-E)',
    specialty: 'Clínica Médica',
    tema: 'Cardiologia',
    provenanceDefault: 'Visto em Cardiologia • Síndrome Coronariana Aguda',
    acronym: 'M-O-N-A-C-H-E',
    chips: [
      { label: 'Morfina', letter: 'M', value: 'Apenas se dor refratária' },
      { label: 'Oxigênio', letter: 'O', value: 'Apenas se SatO2 < 90%' },
      { label: 'Nitrato', letter: 'N', value: 'SL (evitar se VD ou sildenafil)' },
      { label: 'AAS', letter: 'A', value: '160-325 mg mastigado' },
      { label: 'Clopidogrel / Heparina', letter: 'C-H', value: 'Dupla antiagregação + Anticoagulação' }
    ],
    rule: 'AAS + Segundo antiagregante + Heparina reduzem mortalidade. Morfina e O2 NÃO são rotina para todos!',
    bancaTrap: 'Nitrato é formalmente contraindicado no infarto de Ventrículo Direito (V3R/V4R) e uso recente de IPDE-5.'
  },
  {
    id: 'tip-snoop-cefaleia',
    category: 'mnemonicos',
    categoryLabel: 'Mnemônicos Canônicos',
    title: 'Sinais de Alerta para Cefaleias Secundárias (S-N-O-O-P)',
    specialty: 'Clínica Médica',
    tema: 'Neurologia',
    provenanceDefault: 'Visto em Neurologia • Cefaleias e Emergências',
    acronym: 'S-N-O-O-P',
    chips: [
      { label: 'Sintomas Sistêmicos', letter: 'S', value: 'Febre, perda ponderal, HIV, neoplasia' },
      { label: 'Neurológico', letter: 'N', value: 'Déficit focal, convulsão, papiledema' },
      { label: 'Onset Súbito', letter: 'O', value: 'Cefaleia em trovoada (Thunderclap / HSA)' },
      { label: 'Older / Idade', letter: 'O', value: 'Início após os 50 anos (Arterite Temporal)' },
      { label: 'Padrão Progressivo', letter: 'P', value: 'Mudança de caráter, piora ao deitar/Valsalva' }
    ],
    rule: 'Qualquer sinal do SNOOP impõe neuroimagem (TC de crânio sem contraste ou RM) imediata.',
    bancaTrap: 'Cefaleia com início súbito que atinge pico em < 1 minuto é HSA até prova em contrário (TC + líquor se normal).'
  },

  // 4. SINAIS SEMIOLÓGICOS PATOGNOMÔNICOS
  {
    id: 'tip-semiologia-abdome-agudo',
    category: 'semiologia',
    categoryLabel: 'Sinais Semiológicos Patognomônicos',
    title: 'Sinais Semiológicos no Abdome Agudo Cirúrgico',
    specialty: 'Cirurgia Geral',
    tema: 'Abdome Agudo',
    provenanceDefault: 'Visto em Cirurgia Geral • Semiologia Cirúrgica',
    chips: [
      { label: 'Sinal de Murphy', value: 'Pausa inspiratória no CSD (Colecistite Aguda)' },
      { label: 'Sinal de Rovsing', value: 'Dor na FID à palpação da FIE (Apendicite Aguda)' },
      { label: 'Sinal de Blumberg', value: 'Descompressão brusca no McBurney (Peritonite)' },
      { label: 'Sinal do Obturador', value: 'Dor à rotação interna da coxa flexionada' },
      { label: 'Sinal de Dunphy', value: 'Piora da dor na FID com a tosse' }
    ],
    rule: 'O Sinal de Murphy é patognomônico de Colecistite Aguda litiásica (sensibilidade de ~97%).',
    bancaTrap: 'Sinal de Jobert é o desaparecimento da macicez hepática substituída por timpanismo (Pneumoperitônio).'
  },
  {
    id: 'tip-nikolsky-auspitz',
    category: 'semiologia',
    categoryLabel: 'Sinais Semiológicos Patognomônicos',
    title: 'Sinal de Nikolsky e Fenômeno de Auspitz na Dermatologia',
    specialty: 'Clínica Médica',
    tema: 'Dermatologia',
    provenanceDefault: 'Visto em Dermatologia • Doenças Bolhosas e Psoríase',
    chips: [
      { label: 'Nikolsky Positivo', value: 'Descolamento na fricção (Pênfigo Vulgar, NET, SSSS)' },
      { label: 'Nikolsky Negativo', value: 'Bolhas tensas profundas (Penfigoide Bolhoso)' },
      { label: 'Fenômeno de Auspitz', value: 'Orvalho sangrento na curetagem de Brocq (Psoríase)' },
      { label: 'Fenômeno de Koebner', value: 'Lesão em área de trauma prévio (Psoríase / Vitiligo)' },
      { label: 'Sinal da Vela', value: 'Descamação estratificada esbranquiçada' }
    ],
    rule: 'Pênfigo Vulgar acomete mucosa oral com bolhas flácidas e Nikolsky (+); Penfigoide poupa mucosa com bolhas tensas.',
    bancaTrap: 'Na Síndrome de Stevens-Johnson / NET, o sinal de Nikolsky positivo reflete necrose epidérmica extensa.'
  },

  // 5. TRÍADES & PÊNTADES CLÁSSICAS
  {
    id: 'tip-charcot-reynolds',
    category: 'triades',
    categoryLabel: 'Tríades & Pêntades Clássicas',
    title: 'Tríade de Charcot e Pêntade de Reynolds na Colangite Aguda',
    specialty: 'Cirurgia Geral',
    tema: 'Vias Biliares',
    provenanceDefault: 'Visto em Cirurgia Geral • Vias Biliares e Pâncreas',
    chips: [
      { label: 'Tríade de Charcot', value: 'Dor abdominal + Icterícia + Febre com calafrios' },
      { label: 'Pêntade de Reynolds', value: 'Charcot + Hipotensão (Choque) + Rebaixamento sensorial' },
      { label: 'Conduta Charcot', value: 'Antibioticoterapia IV + Descompressão biliar eletiva' },
      { label: 'Conduta Reynolds', value: 'Descompressão biliar de emergência por CPRE / Cirurgia' }
    ],
    rule: 'Pêntade de Reynolds define Colangite Tóxica Supurativa Aguda: risco iminente de morte sem descompressão de urgência.',
    bancaTrap: 'Não aguarde a melhora clínica com antibióticos isolados na Pêntade de Reynolds: drene a via biliar imediatamente.'
  },
  {
    id: 'tip-beck-cushing-virchow',
    category: 'triades',
    categoryLabel: 'Tríades & Pêntades Clássicas',
    title: 'Tríades Clássicas de Beck, Cushing e Virchow',
    specialty: 'Clínica Médica',
    tema: 'Emergências e Cardiologia',
    provenanceDefault: 'Visto em Emergências Médicas e Terapia Intensiva',
    chips: [
      { label: 'Tríade de Beck', value: 'Hipotensão + Hipofonese de bulhas + Turgência jugular' },
      { label: 'Significado Beck', value: 'Tamponamento Cardíaco (Pericardiocentese / Marfan)' },
      { label: 'Tríade de Cushing', value: 'Hipertensão + Bradicardia + Respiração irregular' },
      { label: 'Significado Cushing', value: 'Hipertensão Intracraniana Grave (Herniação iminente)' },
      { label: 'Tríade de Virchow', value: 'Lesão endotelial + Estase venosa + Hipercoagulabilidade' }
    ],
    rule: 'A Tríade de Cushing reflete reflexo autonômico extremo à isquemia do tronco encefálico.',
    bancaTrap: 'No choque neurogênico ocorre Hipotensão COM Bradicardia, mas sem hipertensão de Cushing.'
  },

  // 6. ANTÍDOTOS & TOXICOLOGIA DE EMERGÊNCIA
  {
    id: 'tip-antidotos-emergencia',
    category: 'antidotos',
    categoryLabel: 'Antídotos & Toxicologia',
    title: 'Antídotos Específicos e Toxíndromes nas Provas de Emergência',
    specialty: 'Clínica Médica',
    tema: 'Toxicologia',
    provenanceDefault: 'Visto em Clínica Médica • Emergências e Toxicologia',
    chips: [
      { label: 'Paracetamol', value: 'N-Acetilcisteína (NAC) IV/VO nas primeiras 8-10h' },
      { label: 'Opioides (Morfina/Fentanil)', value: 'Naloxona IV titulada (reverte miose e apneia)' },
      { label: 'Benzodiazepínicos', value: 'Flumazenil IV (cuidado em usuários crônicos)' },
      { label: 'Betabloqueadores', value: 'Glucagon IV (aumenta AMPc intracelular)' },
      { label: 'Heparina Não Fracionada', value: 'Sulfato de Protamina (1mg neutraliza ~100 UI)' }
    ],
    rule: 'Na intoxicação por Organofosforados (miose, broncorreia, bradicardia): use Atropina até secar secreções pulmonares.',
    bancaTrap: 'O Flumazenil pode desencadear estado de mal epiléptico refratário se administrado em pacientes com co-ingestão de tricíclicos.'
  },

  // 7. TRATAMENTO DE ESCOLHA & DROGAS DE 1ª LINHA
  {
    id: 'tip-tratamento-primeira-linha',
    category: 'tratamento',
    categoryLabel: 'Tratamentos de 1ª Linha',
    title: 'Drogas de Escolha Padrão-Ouro em Infecções e Choque',
    specialty: 'Clínica Médica',
    tema: 'Infectologia',
    provenanceDefault: 'Visto em Infectologia • Terapia Antimicrobiana',
    chips: [
      { label: 'Sífilis Primária / Secundária', value: 'Penicilina Benzatina 2,4M UI IM dose única' },
      { label: 'Neurossífilis', value: 'Penicilina Cristalina 18-24M UI/dia IV por 10-14 dias' },
      { label: 'Choque Anafilático', value: 'Adrenalina IM 0,5 mg (1:1.000) no vasto lateral' },
      { label: 'Coqueluche (Bordetella)', value: 'Azitromicina 500mg D1 + 250mg D2-D5' },
      { label: 'Cistite Não Complicada', value: 'Fosfomicina 3g dose única OU Nitrofurantoína 5d' }
    ],
    rule: 'Adrenalina na anafilaxia é sempre intramuscular (IM) no vasto lateral da coxa, nunca subcutânea!',
    bancaTrap: 'Na gestante com sífilis alérgica à penicilina, a conduta mandatória é DESSENSIBILIZAÇÃO; outros antibióticos não tratam o feto.'
  },

  // 8. RASTREAMENTO OFICIAL & PREVENÇÃO (MS / INCA)
  {
    id: 'tip-rastreamento-inca',
    category: 'rastreamento',
    categoryLabel: 'Rastreamento Populacional (MS / INCA)',
    title: 'Faixas Etárias Oficiais para Rastreamento Oncológico',
    specialty: 'Preventiva',
    tema: 'Medicina Preventiva',
    provenanceDefault: 'Visto em Preventiva • Rastreamento e Políticas Públicas',
    chips: [
      { label: 'Câncer de Colo Uterino', value: '25 a 64 anos (anual; após 2 normais, a cada 3 anos)' },
      { label: 'Câncer de Mama (MS)', value: '50 a 69 anos (Mamografia a cada 2 anos)' },
      { label: 'Câncer Colorretal', value: '45/50 a 75 anos (Colonoscopia 10/10a ou Sangue Oculto 1/1a)' },
      { label: 'Aneurisma Aorta (AAA)', value: '65 a 75 anos homens tabagistas (USG único)' },
      { label: 'Câncer de Próstata', value: 'MS NÃO recomenda rastreamento populacional' }
    ],
    rule: 'Mulheres histerectomizadas por doença benigna (sem colo) não necessitam mais colher preventivo.',
    bancaTrap: 'A Sociedade Brasileira de Mastologia recomenda mamografia a partir dos 40 anos, mas a banca de SUS cobra o Ministério da Saúde (50-69 anos).'
  },

  // 9. GATILHOS TRANSFUSIONAIS
  {
    id: 'tip-gatilhos-transfusionais',
    category: 'transfusao',
    categoryLabel: 'Gatilhos Transfusionais',
    title: 'Gatilhos Oficiais para Hemocomponentes (ABHH / ASH)',
    specialty: 'Clínica Médica',
    tema: 'Hematologia',
    provenanceDefault: 'Visto em Hematologia • Medicina Transfusional',
    chips: [
      { label: 'Hemácias (Padrão)', value: 'Hb < 7,0 g/dL em pacientes estáveis' },
      { label: 'Hemácias (Coronariopata)', value: 'Hb < 8,0 g/dL se SCA ou pós-op cardíaco' },
      { label: 'Plaquetas (Profilático)', value: '< 10.000 /μL (ou < 20.000 se febre/sepse)' },
      { label: 'Plaquetas (Invasivo)', value: '< 50.000 /μL para cirurgias em geral' },
      { label: 'Plaquetas (SNC / Olho)', value: '< 100.000 /μL para neurocirurgia' }
    ],
    rule: 'Estratégia transfusional restritiva (Hb < 7 g/dL) tem menor mortalidade que estratégia liberal em UTI.',
    bancaTrap: 'Plasma fresco congelado é reservado para INR > 1,5 com sangramento ativo ou cirurgia de urgência; não use para expansão volêmica.'
  },

  // 10. SINAIS RADIOLÓGICOS E ACHADOS TÍPICOS DE IMAGEM
  {
    id: 'tip-sinais-radiologicos',
    category: 'radiologia',
    categoryLabel: 'Sinais Radiológicos Típicos',
    title: 'Achados Radiológicos Patognomônicos em Questões de Imagem',
    specialty: 'Cirurgia Geral',
    tema: 'Radiologia e Cirurgia',
    provenanceDefault: 'Visto em Cirurgia Geral • Diagnóstico por Imagem',
    chips: [
      { label: 'Sinal do Grão de Café', value: 'Vólvulo de Sigmoide (Rx simples de abdome)' },
      { label: 'Sinal do Alvo / Casca', value: 'Intussuscepção Intestinal no USG pediátrico' },
      { label: 'Sinal do Bico de Pássaro', value: 'Acalásia / Megaesôfago no esofagograma baritado' },
      { label: 'Sinal de Rigler', value: 'Pneumoperitônio (gás desenha paredes da alça)' },
      { label: 'Asa de Borboleta', value: 'Edema Agudo de Pulmão (infiltrado peri-hilar simétrico)' }
    ],
    rule: 'No vólvulo de sigmoide sem sinais de necrose ou peritonite, o tratamento inicial é retossigmoidoscopia descompressiva.',
    bancaTrap: 'No Rx de tórax em ortostase, o gás sob a hemicúpula diafragmática direita confirma perfuração de víscera oca.'
  }
];

