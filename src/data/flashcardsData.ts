import { FlashcardItem } from '@/types/flashcards';

export const INITIAL_FLASHCARDS: FlashcardItem[] = [
  // Cirurgia Geral
  {
    id: 'fc-cir-01',
    front: 'A ingestão de {{c1::bateria de disco}} impactada no esôfago exige remoção endoscópica imediata.',
    back: 'bateria de disco',
    comment: 'No esôfago, a bateria gera corrente elétrica e necrose por liquefação em até 2 horas. Na radiografia, o sinal do duplo contorno (halo) diferencia a bateria de uma moeda comum.',
    imageUrl: 'https://jetem.org/wp-content/uploads/2018/07/ButtonBatteryinEsophagus.-Plain-Film-Xray.-JETem-2018.jpg',
    specialty: 'Cirurgia Geral',
    theme: 'Procedimentos Endoscópicos',
    focus: 'Endoscopia Digestiva Alta',
    priority: 'essential',
    tags: ['cirurgia', 'endoscopia', 'corpo-estranho', 'urgencia']
  },
  {
    id: 'fc-cir-02',
    front: 'Na Classificação de Forrest para úlcera péptica, o achado de vaso visível não sangrante corresponde ao estágio {{c1::IIa}} e possui indicação obrigatória de hemostasia endoscópica.',
    back: 'IIa (vaso visível não sangrante)',
    comment: 'Forrest Ia (jato arterial), Ib (babação) e IIa (vaso visível) têm alto risco de ressangramento e exigem hemostasia combinada (adrenalina + método térmico ou mecânico).',
    specialty: 'Cirurgia Geral',
    theme: 'Cirurgia Geral e Digestiva',
    focus: 'HDA: Abordagem Cirúrgica e Hemostasia',
    priority: 'essential',
    tags: ['cirurgia', 'hda', 'forrest', 'endoscopia']
  },
  {
    id: 'fc-cir-03',
    front: 'A cirurgia definitiva de escolha para o cisto do ducto tireoglosso, que exige ressecção de todo o trajeto ductal associada ao corpo do osso hioide, denomina-se cirurgia de {{c1::Sistrunk}}.',
    back: 'Sistrunk (com ressecção do osso hioide)',
    comment: 'A ressecção exclusiva do cisto gera taxa de recidiva > 50%. A técnica de Sistrunk remove o corpo do hioide e o trajeto até o forame cego na base da língua.',
    specialty: 'Cirurgia Geral',
    theme: 'Cirurgia de Cabeça e Pescoço',
    focus: 'Tumores Cervicais Congênitos',
    priority: 'standard',
    tags: ['cirurgia', 'cabeca-pescoco', 'cisto-tireoglosso']
  },
  {
    id: 'fc-cir-04',
    front: 'Na fratura de órbita do tipo "alçapão" (white blow-out) em crianças, o sinal clássico associado ao aprisionamento muscular e reflexo oculocardíaco com bradicardia torna a cirurgia uma {{c1::emergência cirúrgica}}.',
    back: 'emergência cirúrgica imediata',
    comment: 'Pela alta elasticidade óssea pediátrica, o osso fratura, o reto inferior hernia e a fratura fecha imediatamente. Sem equimose externa ("white"), mas com isquemia muscular e bradicardia vagal reflexa.',
    specialty: 'Cirurgia Geral',
    theme: 'Cirurgia Plástica e Reparadora',
    focus: 'Trauma de Face',
    priority: 'essential',
    tags: ['trauma', 'pediatria', 'cirurgia', 'emergencia']
  },
  {
    id: 'fc-cir-05',
    front: 'A formação do líquido pleural é regida pela Lei de Starling; o transudato clássico da insuficiência cardíaca decorre principalmente do aumento da pressão {{c1::hidrostática}} sistêmica.',
    back: 'pressão hidrostática capilar',
    comment: 'Transudatos decorrem de aumento de pressão hidrostática (IC descompensada) ou queda de pressão oncótica (síndrome nefrótica, cirrose). Exsudatos decorrem de aumento de permeabilidade capilar (pneumonia, neoplasia).',
    specialty: 'Cirurgia Geral',
    theme: 'Cirurgia Torácica',
    focus: 'Derrame Pleural e Drenagem',
    priority: 'standard',
    tags: ['torax', 'derrame-pleural', 'cirurgia']
  },

  // Clínica Médica
  {
    id: 'fc-cli-01',
    front: 'No infarto agudo do miocárdio com supra de parede inferior com acometimento de ventrículo direito (hipotensão e campos pleuropulmonares limpos), o uso de {{c1::nitratos e diuréticos}} é formalmente contraindicado.',
    back: 'nitratos e diuréticos',
    comment: 'O ventrículo direito isquêmico depende criticamente da pré-carga para manter o débito cardíaco. Vasodilatadores e diuréticos precipitam choque cardiogênico refratário imediato. Conduta: expansão volêmica cautelosa com SF 0,9%.',
    specialty: 'Clínica Médica',
    theme: 'Cardiologia',
    focus: 'Síndrome Coronariana Aguda',
    priority: 'essential',
    tags: ['cardiologia', 'iam', 'contraindicacao', 'emergencia']
  },
  {
    id: 'fc-cli-02',
    front: 'O tempo porta-balão recomendado para angioplastia coronária primária em centro com serviço de hemodinâmica disponível é de até {{c1::90 minutos}}.',
    back: '90 minutos (ou até 120 min se transferido)',
    comment: 'Diretrizes SBC/ESC: se tempo porta-balão for > 120 min para transferência, deve-se optar por trombólise química precoce com tempo porta-agulha ≤ 30 minutos.',
    specialty: 'Clínica Médica',
    theme: 'Cardiologia',
    focus: 'Infarto com Supra de ST',
    priority: 'essential',
    tags: ['cardiologia', 'iam-supra', 'tempos-porta']
  },
  {
    id: 'fc-cli-03',
    front: 'Na cetoacidose diabética (CAD), antes de iniciar a infusão contínua de insulina regular intravenosa, o nível sérico de potássio deve ser obrigatoriamente superior a {{c1::3,3 mEq/L}}.',
    back: '3,3 mEq/L',
    comment: 'A insulina internaliza potássio nas células. Se infundida com K+ < 3,3 mEq/L, causa hipocalemia grave e arritmias ventriculares fatais. Primeiro repõe-se potássio; quando K+ ≥ 3,3, inicia-se insulina.',
    specialty: 'Clínica Médica',
    theme: 'Endocrinologia',
    focus: 'Cetoacidose Diabética (CAD)',
    priority: 'essential',
    tags: ['endocrino', 'diabetes', 'cad', 'eletrolitos']
  },
  {
    id: 'fc-cli-04',
    front: 'Na Fibrilação Atrial com instabilidade hemodinâmica (hipotensão, angina, choque, edema agudo de pulmão), a conduta mandatória de emergência é a {{c1::cardioversão elétrica sincronizada}}.',
    back: 'cardioversão elétrica sincronizada (CVE)',
    comment: 'A sincronização no pico da onda R é vital para evitar choque sobre a onda T (fenômeno R sobre T), que desencadearia fibrilação ventricular e PCR.',
    specialty: 'Clínica Médica',
    theme: 'Cardiologia',
    focus: 'Arritmias Cardíacas',
    priority: 'essential',
    tags: ['cardiologia', 'arritmia', 'fa', 'emergencia']
  },
  {
    id: 'fc-cli-05',
    front: 'A janela terapêutica máxima padrão para trombólise intravenosa com alteplase (rt-PA) no AVC isquêmico agudo é de até {{c1::4,5 horas}} do início dos sintomas.',
    back: '4,5 horas (270 minutos)',
    comment: 'Para realização de rtPA, a PA deve estar controlada (PAS < 185 mmHg e PAD < 110 mmHg). Para trombectomia mecânica arterial em grandes vasos, a janela se estende para 6 a 24 horas sob critérios de imagem.',
    specialty: 'Clínica Médica',
    theme: 'Neurologia',
    focus: 'AVC Isquêmico Agudo',
    priority: 'essential',
    tags: ['neuro', 'avc', 'trombolise', 'janela-tempo']
  },

  // Pediatria
  {
    id: 'fc-ped-01',
    front: 'Na Bronquiolite Viral Aguda (BVA) pelo vírus sincicial respiratório em lactentes, o uso rotineiro de broncodilatadores inalatórios e corticoides sistêmicos é {{c1::contraindicado}} pelas diretrizes da SBP.',
    back: 'contraindicado (não recomendado rotineiramente)',
    comment: 'A fisiopatologia da BVA é necrose do epitélio bronquiolar com rolhas de muco e edema, e não broncoespasmo muscular. O pilar terapêutico é suporte: oxigenoterapia se SatO2 < 90-92% e hidratação.',
    specialty: 'Pediatria',
    theme: 'Pneumologia Pediátrica',
    focus: 'Bronquiolite Viral Aguda',
    priority: 'essential',
    tags: ['pediatria', 'bva', 'vsr', 'diretriz-sbp']
  },
  {
    id: 'fc-ped-02',
    front: 'No exantema súbito (roséola infantil), o padrão clínico característico é o desaparecimento abrupto da {{c1::febre alta}} exatamente no momento em que surge o exantema maculopapular róseo.',
    back: 'febre alta (a febre some e o exantema aparece)',
    comment: 'Causado pelo Herpesvírus humano 6 e 7. A criança tem febre alta por 3 a 5 dias sem foco evidente e bom estado geral; com a lise térmica súbita, desabrocha o exantema de tronco para periferia.',
    specialty: 'Pediatria',
    theme: 'Infectologia Pediátrica',
    focus: 'Doenças Exantemáticas na Infância',
    priority: 'essential',
    tags: ['pediatria', 'exantema', 'roseola', 'infecto']
  },
  {
    id: 'fc-ped-03',
    front: 'Na reanimação neonatal em sala de parto para RN a termo, a ventilação com pressão positiva (VPP) inicial deve ser iniciada com fração inspirada de oxigênio a {{c1::21%}} (ar ambiente).',
    back: '21% (ar ambiente, sem O2 suplementar)',
    comment: 'Diretrizes SBP/AHA: RN ≥ 34 semanas inicia VPP em ar ambiente (21%). O excesso de O2 (hiperóxia) lesa tecidos nobres por radicais livres. RN < 34 semanas inicia com FiO2 de 30%.',
    specialty: 'Pediatria',
    theme: 'Neonatologia',
    focus: 'Reanimação Neonatal em Sala de Parto',
    priority: 'essential',
    tags: ['neonatologia', 'vpp', 'sala-de-parto', 'sbp']
  },
  {
    id: 'fc-ped-04',
    front: 'Na avaliação da desidratação infantil segundo a OMS, a presença de letargia, olhos muito fundos e sinal da prega que volta muito lentamente (> 2s) classifica o paciente no Plano {{c1::C}} (Desidratação Grave).',
    back: 'Plano C (hidratação venosa imediata)',
    comment: 'Plano A: tratamento domiciliar (TRO + líquidos caseiros + zinco). Plano B: TRO na unidade de saúde. Plano C: expansão venosa imediata com SF 0,9% ou Ringer Lactato.',
    specialty: 'Pediatria',
    theme: 'Gastroenterologia Pediátrica',
    focus: 'Diarreia Aguda e Desidratação',
    priority: 'essential',
    tags: ['pediatria', 'desidratacao', 'oms', 'plano-c']
  },

  // Ginecologia e Obstetrícia
  {
    id: 'fc-go-01',
    front: 'O fármaco padrão-ouro para prevenção e tratamento de convulsões na pré-eclâmpsia grave e eclâmpsia é o {{c1::sulfato de magnésio}}.',
    back: 'sulfato de magnésio (MgSO4)',
    comment: 'Esquemas consagrados: Zuspan (ataque 4g IV + manutenção 1g/h) ou Pritchard (ataque 4g IV + 10g IM e 5g IM a cada 4h). Benzodiazepínicos e fenitoína são inferiores e contraindicados como monoterapia.',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Obstetrícia Patológica',
    focus: 'Pré-eclâmpsia Grave e Eclâmpsia',
    priority: 'essential',
    tags: ['obstetricia', 'preeclampsia', 'eclampsia', 'sulfato-magnesio']
  },
  {
    id: 'fc-go-02',
    front: 'Para monitorar a intoxicação por sulfato de magnésio, o primeiro reflexo osteotendinoso a ser abolido é o reflexo {{c1::patelar}}.',
    back: 'reflexo patelar (tendíneo)',
    comment: 'Sinais de intoxicação por MgSO4: 1º abolição do reflexo patelar (nível 8-10 mEq/L); 2º depressão respiratória FR < 16 irpm (nível > 12 mEq/L); 3º parada cardíaca. Antídoto imediato: Gluconato de Cálcio 10% IV.',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Obstetrícia Patológica',
    focus: 'Monitorização do Sulfato de Magnésio',
    priority: 'essential',
    tags: ['obstetricia', 'gluconato-calcio', 'patelar', 'toxicidade']
  },
  {
    id: 'fc-go-03',
    front: 'A nova diretriz do Ministério da Saúde / CONITEC incorporou como teste primário de rastreamento do câncer de colo uterino no SUS a pesquisa molecular de {{c1::DNA-HPV}} a cada 5 anos em mulheres de 25 a 64 anos.',
    back: 'DNA-HPV molecular (a cada 5 anos)',
    comment: 'Atualização histórica: substitui progressivamente a citopatologia (Papanicolau) trienal pelo teste molecular de alta sensibilidade a cada 5 anos. Se HPV 16/18 positivo, encaminha-se diretamente para colposcopia.',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Ginecologia Oncológica',
    focus: 'Rastreamento de Câncer de Colo Uterino',
    priority: 'essential',
    tags: ['ginecologia', 'hpv', 'rastreamento', 'diretriz-ms']
  },
  {
    id: 'fc-go-04',
    front: 'Na hemorragia pós-parto imediata secundária à atonia uterina, a primeira medida medicamentosa recomendada pela Febrasgo/OMS é a administração de {{c1::ocitocina}} intravenosa.',
    back: 'ocitocina (10 a 20 UI em infusão IV)',
    comment: 'A atonia uterina responde por 70% das hemorragias pós-parto (regra dos 4 Ts: Tônus, Trauma, Tecido, Trombina). Linha de tratamento: Massagem uterina bimanual (Hamilton) + Ocitocina -> Metilergometrina (se não for hipertensa) -> Misoprostol.',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Obstetrícia',
    focus: 'Hemorragia Pós-Parto (HPP)',
    priority: 'essential',
    tags: ['obstetricia', 'hpp', 'atonia-uterina', 'ocitocina']
  },
    {
    id: 'fc-mioma-01',
    front: "Identifique na Classificação FIGO: O mioma submucoso que se encontra totalmente dentro da cavidade endometrial ligado apenas por uma haste é classificado como FIGO {{c1::0 (Submucoso Pediculado)}}.",
    back: "FIGO 0 (Submucoso Pediculado Intracavitário)",
    comment: "Os miomas FIGO 0 não possuem componente intramural e são 100% intracavitários. São os mais propensos a sangramento intenso e exteriorização cervical ('mioma parido').",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'essential',
    tags: ["FIGO","Submucoso","Anatomia"]
  },
  {
    id: 'fc-mioma-02',
    front: "Um mioma submucoso séssil que invade a parede uterina, com penetração miometrial menor que 50% (< 50%), é classificado como FIGO {{c1::1}}.",
    back: "FIGO 1",
    comment: "Critério FIGO: tipo 1 tem menos de 50% no miométrio (> 50% na cavidade). Tipo 2 tem 50% ou mais no miométrio (< 50% na cavidade).",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'essential',
    tags: ["FIGO","Submucoso","Critérios"]
  },
  {
    id: 'fc-mioma-03',
    front: "Qual o tipo FIGO do mioma que tem seu epicentro submucoso, porém com invasão miometrial maior ou igual a 50% (≥ 50%)?",
    back: "FIGO 2",
    comment: "O mioma FIGO 2 possui maior componente intramural (≥ 50%), aumentando a complexidade para ressecção histeroscópica e frequentemente necessitando de procedimento em 2 tempos ou preparo prévio com análogo de GnRH.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'essential',
    tags: ["FIGO","Submucoso","Miomectomia"]
  },
  {
    id: 'fc-mioma-04',
    front: "O mioma classificado como FIGO {{c1::3}} é 100% intramural, porém tangencia (está em contato com) o endométrio.",
    back: "FIGO 3",
    comment: "Diferença chave de prova: FIGO 3 é 100% intramural mas toca a superfície endometrial (causa SUA). O FIGO 4 é intramural puro, sem contato com o endométrio nem com a serosa.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'essential',
    tags: ["FIGO","Intramural","Diagnóstico"]
  },
  {
    id: 'fc-mioma-05',
    front: "Como é classificado um mioma miometrial que não toca a cavidade endometrial e não deforma a superfície serosa peritoneal?",
    back: "FIGO 4 (Intramural Verdadeiro / Puro)",
    comment: "O FIGO 4 situa-se estritamente no estroma miometrial. Seu impacto clínico decorre principalmente do aumento global do volume uterino e dismenorreia.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'standard',
    tags: ["FIGO","Intramural"]
  },
  {
    id: 'fc-mioma-06',
    front: "Um mioma subseroso que possui 50% ou mais de seu diâmetro localizado no miométrio (≥ 50% intramural) é classificado como FIGO {{c1::5}}.",
    back: "FIGO 5",
    comment: "Os miomas subserosos dividem-se em: FIGO 5 (≥ 50% intramural), FIGO 6 (< 50% intramural) e FIGO 7 (pediculado externo).",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'standard',
    tags: ["FIGO","Subseroso"]
  },
  {
    id: 'fc-mioma-07',
    front: "Qual o tipo FIGO do mioma subseroso com menos de 50% intramural (< 50%) e do mioma subseroso pediculado, respectivamente?",
    back: "FIGO 6 (< 50% intramural) e FIGO 7 (pediculado)",
    comment: "O mioma FIGO 7 apresenta pedículo vascular externo delgado, conferindo alto risco de torção isquêmica aguda (quadro de abdome agudo cirúrgico).",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'essential',
    tags: ["FIGO","Subseroso","Abdome Agudo"]
  },
  {
    id: 'fc-mioma-08',
    front: "Os miomas em localizações atípicas, como os miomas cervicais, intraligamentares ou parasitas, são agrupados no tipo FIGO {{c1::8}}.",
    back: "FIGO 8 (Outros)",
    comment: "Os miomas de colo uterino (cervicais) podem causar dispareunia, estenose cervical, infertilidade mecânica e distócia de trajeto no parto vaginal.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'standard',
    tags: ["FIGO","Cervical","Parto"]
  },
  {
    id: 'fc-mioma-09',
    front: "Um mioma híbrido transmural que se estende desde a cavidade endometrial até a superfície serosa é designado na FIGO como tipo {{c1::2-5}}.",
    back: "FIGO 2-5 (Transmural)",
    comment: "A notação híbrida utiliza dois números: o primeiro descreve a relação submucosa e o segundo a relação subserosa. O 2-5 tem ≥ 50% no miométrio em ambas as interfaces.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Classificação FIGO',
    priority: 'standard',
    tags: ["FIGO","Híbrido"]
  },
  {
    id: 'fc-mioma-10',
    front: "Qual gene com mutações somáticas está presente em mais de 70% dos leiomiomas uterinos?",
    back: "Gene MED12",
    comment: "Mutações no gene MED12 (exon 2) no cromossomo X desregulam a via da transcrição miocitária, gerando proliferação clonal monoclonal e deposição massiva de matriz extracelular.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Fisiopatologia',
    priority: 'standard',
    tags: ["Fisiopatologia","Genética"]
  },
  {
    id: 'fc-mioma-11',
    front: "Qual o fármaco antifibrinolítico não hormonal de primeira linha indicado para controle do sangramento em mulheres com mioma que mantêm desejo reprodutivo a curto prazo?",
    back: "Ácido Tranexâmico",
    comment: "O ácido tranexâmico inibe competitivamente a ativação do plasminogênio em plasmina. Reduz a perda sanguínea em 40-50% sem afetar a fertilidade nem a ovulação; é usado apenas durante o fluxo menstrual.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'essential',
    tags: ["Tratamento Clínico","Farmacologia","Sangramento"]
  },
  {
    id: 'fc-mioma-12',
    front: "O DIU liberador de Levonorgestrel (DIU-Mirena) é formalmente CONTRAINDICADO em miomas FIGO {{c1::0, 1 e 2 (Submucosos)}} devido à distorção da cavidade endometrial.",
    back: "FIGO 0, 1 e 2 (Submucosos)",
    comment: "A presença de mioma distorcendo a cavidade endometrial aumenta expressivamente a taxa de expulsão espontânea do DIU, dor intratável e falha no controle hemorrágico.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'essential',
    tags: ["Tratamento Clínico","DIU","Contraindicação"]
  },
  {
    id: 'fc-mioma-13',
    front: "Qual o papel clínico EXATO dos agonistas de GnRH (como a Leuprorrelina) no manejo dos miomas uterinos?",
    back: "Ponte pré-operatória temporária (por 3 a 6 meses) para reduzir volume tumoral e corrigir anemia",
    comment: "Agonistas de GnRH causam hipoestrogenismo profundo. Reduzem o volume tumoral em 30-50% e induzem amenorreia, mas seu uso além de 6 meses é contraindicado devido à desmineralização óssea (osteoporose) e fogachos.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'essential',
    tags: ["Tratamento Clínico","GnRH","Pré-operatório"]
  },
  {
    id: 'fc-mioma-14',
    front: "Os agonistas de GnRH provocam um efeito inicial de estímulo hormonal transitório denominado {{c1::flare-up}}, que dura de 7 a 14 dias antes do bloqueio hipofisário completo.",
    back: "Efeito Flare-up",
    comment: "A ligação inicial do análogo aos receptores de GnRH estimula uma descarga transitória de LH e FSH, podendo exacerbar temporariamente o sangramento e as cólicas antes da dessensibilização dos receptores.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'standard',
    tags: ["Tratamento Clínico","GnRH","Farmacologia"]
  },
  {
    id: 'fc-mioma-15',
    front: "Qual a grande vantagem farmacocinética dos Antagonistas orais de GnRH (como o Relugolix) em relação aos Agonistas de GnRH?",
    back: "Bloqueio imediato dos receptores sem efeito flare-up e reversibilidade oral rápida",
    comment: "Os antagonistas orais (associados à add-back therapy com estradiol/noretisterona) inibem os receptores de GnRH competitivamente desde o primeiro dia, induzindo amenorreia rápida sem o pico de liberação hormonal do flare-up.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'standard',
    tags: ["Tratamento Clínico","Antagonista GnRH"]
  },
  {
    id: 'fc-mioma-16',
    front: "Para atenuar os efeitos colaterais de hipoestrogenismo (perda de massa óssea e sintomas vasomotores) decorrentes do bloqueio de GnRH, utiliza-se a terapia de reposição complementar denominada {{c1::Add-back therapy}}.",
    back: "Add-back therapy (Terapia de Adição)",
    comment: "Consiste na administração concomitante de baixas doses de estrogênio associado a progestágeno (ex: 1 mg de estradiol + 0,5 mg de noretisterona), mantendo a supressão do mioma sem espoliar a massa óssea.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'standard',
    tags: ["Tratamento Clínico","Farmacologia"]
  },
  {
    id: 'fc-mioma-17',
    front: "Os Anti-inflamatórios Não Esteroidais (AINEs) atuam no mioma reduzindo o sangramento em até 30% através de qual mecanismo enzimático?",
    back: "Inibição da COX-1 e COX-2, reduzindo a síntese de prostaglandinas vasodilatadoras (PGE2 e PGI2)",
    comment: "O miometrio miomatoso superexpressa prostaglandinas vasodilatadoras e anticoagulantes. Os AINEs diminuem o fluxo e atuam como analgésicos de primeira escolha para a dismenorreia.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'standard',
    tags: ["Tratamento Clínico","AINEs","Farmacologia"]
  },
  {
    id: 'fc-mioma-18',
    front: "Em relação ao volume dos miomas uterinos, os contraceptivos orais combinados (ACO) e o DIU-Levonorgestrel atuam controlando o sangramento, porém {{c1::NÃO}} reduzem significativamente o tamanho tumoral.",
    back: "NÃO reduzem o volume tumoral",
    comment: "Ponto clássico de pegadinha em provas: progestágenos e ACOs controlam os sintomas hemorrágicos por atrofia endometrial, mas não diminuem o diâmetro dos nódulos miomatosos (apenas análogos de GnRH reduzem volume).",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'essential',
    tags: ["Tratamento Clínico","Pegadinha de Prova"]
  },
  {
    id: 'fc-mioma-19',
    front: "Qual a conduta indicada para uma paciente de 38 anos, assintomática, na qual foi identificado incidentalmente ao USG um mioma intramural de 5 cm?",
    back: "Conduta Expectante (Seguimento clínico e ultrassonográfico anual)",
    comment: "Regra absoluta de ouro: mioma assintomático NÃO se opera e NÃO se trata com medicação, independentemente do tamanho de 5 ou 6 cm, a menos que cause repercussões compressivas ocultas (ex: hidronefrose) ou cresça pós-menopausa.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Conduta Inicial',
    priority: 'essential',
    tags: ["Conduta","Assintomático","Regra de Ouro"]
  },
  {
    id: 'fc-mioma-20',
    front: "O modulador seletivo do receptor de progesterona (SPRM) denominado {{c1::Acetato de Ulipristal}} teve seu uso suspenso/restringido na prática devido ao risco grave de insuficiência hepática aguda.",
    back: "Acetato de Ulipristal",
    comment: "Embora muito eficaz na redução do sangramento e volume do mioma, os relatos de hepatite fulminante e necessidade de transplante hepático levaram à restrição severa de sua comercialização pela EMA e Anvisa.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'standard',
    tags: ["Farmacologia","Segurança"]
  },
  {
    id: 'fc-mioma-21',
    front: "Por que os análogos de GnRH não podem ser utilizados isoladamente como terapia clínica contínua a longo prazo para miomatose?",
    back: "Pelo risco severo de desmineralização óssea acelerada (osteopenia/osteoporose) e eventos cardiovasculares",
    comment: "O estado de hipoestrogenismo severo simulando menopausa precoce espolia o cálcio ósseo e piora o perfil lipídico. O limite de segurança sem Add-back therapy é de 6 meses.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'essential',
    tags: ["GnRH","Segurança","Osteoporose"]
  },
  {
    id: 'fc-mioma-22',
    front: "Após a suspensão do tratamento pré-operatório com agonista de GnRH, caso a cirurgia não seja realizada, os miomas retornam ao seu tamanho original prévio em {{c1::3 a 6 meses}}.",
    back: "3 a 6 meses",
    comment: "O efeito redutor de volume dos análogos é temporário e completamente reversível com o retorno da função ovariana cíclica normal.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Clínico',
    priority: 'standard',
    tags: ["GnRH","Fisiologia"]
  },
  {
    id: 'fc-mioma-23',
    front: "Qual a via cirúrgica padrão-ouro para o tratamento de miomas submucosos sintomáticos FIGO 0 e FIGO 1?",
    back: "Miomectomia Histeroscópica",
    comment: "A histeroscopia cirúrgica permite ressecção por fatiamento (slicing) com preservação miometrial máxima, sem incisão abdominal e com alta hospitalar no mesmo dia.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Cirúrgico',
    priority: 'essential',
    tags: ["Cirurgia","Histeroscopia","Padrão-Ouro"]
  },
  {
    id: 'fc-mioma-24',
    front: "O sistema STEPW de Lasmar avalia a viabilidade da histeroscopia cirúrgica com base em 5 parâmetros: Size (Tamanho), Topography (Topografia), Extension (Extensão da base), Penetration (Penetração) e {{c1::Wall (Parede acometida)}}.",
    back: "Wall (Parede Lateral)",
    comment: "O acometimento da parede lateral ganha 1 ponto extra no escore de Lasmar devido à proximidade anatômica com os vasos uterinos principais e menor espessura miometrial.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Critérios de Lasmar',
    priority: 'essential',
    tags: ["Lasmar","STEPW","Histeroscopia"]
  },
  {
    id: 'fc-mioma-25',
    front: "Qual a conduta para um mioma submucoso classificado no Escore de Lasmar como Grupo I (0 a 4 pontos)?",
    back: "Miomectomia Histeroscópica em tempo único (baixa complexidade)",
    comment: "Escores de 0 a 4 apresentam alta taxa de sucesso em tempo operatório único, sem necessidade de preparo prévio com análogo de GnRH.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Critérios de Lasmar',
    priority: 'essential',
    tags: ["Lasmar","Histeroscopia","Conduta"]
  },
  {
    id: 'fc-mioma-26',
    front: "Um mioma submucoso com Escore de Lasmar de 5 a 6 pontos (Grupo II) é considerado de moderada a alta complexidade, sendo frequente a necessidade de cirurgia em {{c1::dois tempos}} e preparo com análogo de GnRH.",
    back: "Dois tempos cirúrgicos",
    comment: "No Grupo II, opera-se a porção intracavitária no 1º tempo; a porção intramural remanescente é empurrada pela contratilidade miometrial para a cavidade, sendo retirada no 2º tempo semanas após.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Critérios de Lasmar',
    priority: 'essential',
    tags: ["Lasmar","Dois Tempos","Histeroscopia"]
  },
  {
    id: 'fc-mioma-27',
    front: "Qual a recomendação cirúrgica formal para miomas com Escore de Lasmar de 7 a 9 pontos (Grupo III)?",
    back: "Contraindicar a via histeroscópica exclusiva; indicar laparotomia/laparoscopia ou embolização",
    comment: "Miomas com 7-9 pontos têm penetração miometrial profunda e grande volume. O risco de perfuração uterina e sobrecarga de fluidos intravasculares na histeroscopia é proibitivo.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Critérios de Lasmar',
    priority: 'essential',
    tags: ["Lasmar","Contraindicação","Histeroscopia"]
  },
  {
    id: 'fc-mioma-28',
    front: "Qualquer miomectomia na qual ocorra abertura acidental ou intencional da {{c1::cavidade endometrial}} impõe indicação absoluta de cesariana eletiva em futuras gestações.",
    back: "Cavidade endometrial (Endométrio)",
    comment: "A invasão transmural da cavidade endometrial gera fragilidade na parede uterina com risco catastrófico de ruptura uterina durante o trabalho de parto.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Cirúrgico',
    priority: 'essential',
    tags: ["Cirurgia","Obstetrícia","Ruptura Uterina"]
  },
  {
    id: 'fc-mioma-29',
    front: "Qual o tratamento cirúrgico definitivo de escolha para mulheres com miomatose sintomática e prole constituída?",
    back: "Histerectomia Total",
    comment: "A histerectomia elimina o risco de recidiva miomatosa e o sangramento uterino anormal. A via vaginal ou laparoscópica é preferida em relação à abdominal se as condições anatômicas permitirem.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Cirúrgico',
    priority: 'essential',
    tags: ["Cirurgia","Histerectomia","Definitivo"]
  },
  {
    id: 'fc-mioma-30',
    front: "Durante a miomectomia histeroscópica monopolar com uso de glicina ou manitol, o limite máximo de déficit de balanço hídrico aceitável antes de interromper o procedimento por risco de hiponatremia dilucional é de {{c1::1.000 mL}}.",
    back: "1.000 mL (1 litro)",
    comment: "Déficits superiores a 1.000 mL de solução não condutora hipotônica (glicina) causam a Síndrome de Sobrecarga Hídrica com hiponatremia grave, edema cerebral, coma e óbito.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Histeroscopia',
    priority: 'essential',
    tags: ["Histeroscopia","Complicação","Balanço Hídrico"]
  },
  {
    id: 'fc-mioma-31',
    front: "Qual a grande vantagem do uso de ressectoscópios BIPOLARES em relação aos monopolares na miomectomia histeroscópica?",
    back: "Permitem o uso de Solução Salina Fisiológica (NaCl 0,9%) como meio de distensão, prevenindo a hiponatremia",
    comment: "O sistema bipolar opera em meio condutor isotônico (SF 0,9%). Mesmo com sobrecarga volêmica eventual (limite de 2.500 mL), não ocorre hiponatremia hipotônica.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Histeroscopia',
    priority: 'standard',
    tags: ["Histeroscopia","Segurança","Tecnologia"]
  },
  {
    id: 'fc-mioma-32',
    front: "Mulher de 29 anos, nulípara com desejo de gestação, apresenta mioma intramural de 6 cm FIGO 4 com dor pélvica. O tratamento cirúrgico padrão é a {{c1::Miomectomia laparotômica ou laparoscópica}}.",
    back: "Miomectomia (Laparotômica ou Laparoscópica)",
    comment: "Para miomas intramurais e subserosos em mulheres que desejam manter a fertilidade, a miomectomia é a cirurgia conservadora mandatória, sendo a histerectomia contraindicada.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Cirúrgico',
    priority: 'essential',
    tags: ["Cirurgia","Fertilidade","Miomectomia"]
  },
  {
    id: 'fc-mioma-33',
    front: "Qual a manobra mecânica inicial de conduta para um 'Mioma Parido' visualizado no exame especular exteriorizando-se pelo orifício externo do colo?",
    back: "Ressecção por via baixa vaginal (torção ou secção do pedículo com pinça de Cheron/Kocher sob analgesia/anestesia)",
    comment: "O mioma parido é um mioma FIGO 0 cujo pedículo se alongou. Não requer laparotomia; é apreendido e desinserido diretamente por via vaginal.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Cirúrgico',
    priority: 'essential',
    tags: ["Mioma Parido","Urgência","Conduta"]
  },
  {
    id: 'fc-mioma-34',
    front: "A realização de morcelamento intra-abdominal não contido de miomas uterinos em laparoscopia é contraindicada pelo FDA e sociedades médicas pelo risco de disseminar um {{c1::Leiomiossarcoma oculto}} não diagnosticado.",
    back: "Leiomiossarcoma oculto",
    comment: "O morcelamento não contido pode espalhar células sarcomatosas pelo peritônio, piorando drasticamente o prognóstico oncológico (queda de sobrevida de estágio I para IV). Exige uso de bolsas protetoras fechadas (endobag).",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Tratamento Cirúrgico',
    priority: 'standard',
    tags: ["Segurança","Sarcoma","Laparoscopia"]
  },
  {
    id: 'fc-mioma-35',
    front: "Qual é o tipo de degeneração miomatosa MAIS FREQUENTE na população em geral?",
    back: "Degeneração Hialina (cerca de 65% dos casos)",
    comment: "A degeneração hialina ocorre pela substituição do tecido muscular liso por matriz proteica eosinofílica acelular. Geralmente é assintomática.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Degenerações',
    priority: 'essential',
    tags: ["Degeneração","Hialina","Frequência"]
  },
  {
    id: 'fc-mioma-36',
    front: "A degeneração mais frequente dos miomas durante a gestação (típica do 2º trimestre) é a degeneração {{c1::Rubra (ou Carneosa/Necrose Asséptica)}}.",
    back: "Degeneração Rubra (Carneosa)",
    comment: "Causada pelo crescimento acelerado do mioma sob estímulo estrogênico maciço associado a trombose da drenagem venosa periférica, gerando infarto isquêmico e hemorrágico.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Degenerações na Gestação',
    priority: 'essential',
    tags: ["Gestação","Degeneração Rubra","Pérola de Prova"]
  },
  {
    id: 'fc-mioma-37',
    front: "Qual a conduta padrão-ouro para uma gestante de 22 semanas diagnosticada com Degeneração Rubra de mioma uterino?",
    back: "Tratamento clínico conservador (Internação hospitalar, analgesia escalonada, hidratação venosa e antiespasmódicos)",
    comment: "NÃO se faz miomectomia na gravidez! A cirurgia é contraindicada pelo risco extremo de sangramento incoercível decorrente da hipervascularização uterina gestacional e risco de aborto/parto prematuro.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Degenerações na Gestação',
    priority: 'essential',
    tags: ["Gestação","Conduta","Conservador"]
  },
  {
    id: 'fc-mioma-38',
    front: "A degeneração {{c1::Calcificada (ou Calcificação distrófica)}} é comum na pós-menopausa, resultando em nódulos pétreos radiopacos visíveis no RX simples de pelve.",
    back: "Degeneração Calcificada",
    comment: "Ocorre pela deposição de sais de carbonato e fosfato de cálcio em tecidos previamente isquemiados após a cessação hormonal do climatério.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Degenerações',
    priority: 'standard',
    tags: ["Degenerações","Pós-menopausa","Radiologia"]
  },
  {
    id: 'fc-mioma-39',
    front: "Qual a degeneração que decorre da liquefação central e reabsorção de áreas previamente acometidas por degeneração hialina, mimetizando cisto ovariano ao USG?",
    back: "Degeneração Cística",
    comment: "A degeneração cística cria cavidades com conteúdo líquido seroso no centro do mioma, sendo um importante diagnóstico diferencial de massas anexiais císticas.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Degenerações',
    priority: 'standard',
    tags: ["Degenerações","Cística"]
  },
  {
    id: 'fc-mioma-40',
    front: "O crescimento rápido de um nódulo uterino em mulher na {{c1::pós-menopausa}} que não realiza terapia de reposição hormonal deve levantar suspeita imediata de Leiomiossarcoma.",
    back: "Pós-menopausa (Sem TRH)",
    comment: "Na menopausa fisiológica, miomas benignos obrigatoriamente estabilizam ou regridem devido ao hipoestrogenismo. Crescimento novo é sinal de alarme de malignidade primária.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Sarcoma',
    priority: 'essential',
    tags: ["Sarcoma","Oncologia","Sinal de Alarme"]
  },
  {
    id: 'fc-mioma-41',
    front: "O Leiomiossarcoma surge a partir da transformação maligna de um mioma benigno prévio? Verdadeiro ou Falso?",
    back: "FALSO. O Leiomiossarcoma quase invariavelmente surge 'de novo' (mutação primária autônoma) e não de um mioma benigno.",
    comment: "A taxa de transformação maligna de um leiomioma é inferior a 0,2%. A imensa maioria dos sarcomas já se inicia como sarcoma desde a primeira célula mutada.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Sarcoma',
    priority: 'essential',
    tags: ["Sarcoma","Oncologia","Conceito"]
  },
  {
    id: 'fc-mioma-42',
    front: "Miomas volumosos retroplacentários durante a gravidez aumentam consideravelmente o risco obstétrico de {{c1::Descolamento Prematuro de Placenta (DPP)}}.",
    back: "Descolamento Prematuro de Placenta (DPP)",
    comment: "A vascularização anômala da interface endométrio-mioma retroplacentário compromete o leito decíduo-placentário, facilitando hematomas e descolamento precoce.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Gestação e Obstetrícia',
    priority: 'standard',
    tags: ["Obstetrícia","DPP","Gestação"]
  },
  {
    id: 'fc-mioma-43',
    front: "Qual o achado ultrassonográfico característico do mioma uterino na ultrassonografia transvaginal em modo B e Doppler?",
    back: "Nódulo sólido hipoecoico bem delimitado com sombra acústica posterior em faixas e anel de fluxo vascular periférico ao Doppler",
    comment: "A vascularização periférica com cápsula pseudovascular (anel) e centro relativamente avascular é típica do mioma benigno, diferenciando-o da adenomiose.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Diagnóstico por Imagem',
    priority: 'essential',
    tags: ["USG","Imagem","Diagnóstico"]
  },
  {
    id: 'fc-mioma-44',
    front: "No diagnóstico diferencial de dor e sangramento, a Adenomiose difere do Mioma na Ressonância Magnética por apresentar espessamento da Zona Juncional miometrial maior que {{c1::12 mm}}.",
    back: "12 mm (Zona Juncional > 12 mm)",
    comment: "Zona juncional < 8 mm afasta adenomiose; > 12 mm confirma adenomiose na RNM. Miomas apresentam pseudocápsula nítida sem espessamento juncional difuso.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Diagnóstico por Imagem',
    priority: 'essential',
    tags: ["RNM","Diferencial","Adenomiose"]
  },
  {
    id: 'fc-mioma-45',
    front: "Qual a melhor modalidade de exame de imagem para o planejamento cirúrgico pré-operatório em pacientes com úteros com múltiplos miomas que desejam preservar a fertilidade?",
    back: "Ressonância Magnética de Pelve (RNM)",
    comment: "A RNM tem maior sensibilidade e resolução de contraste para contar, medir e localizar exatamente todos os nódulos em relação à cavidade e à serosa.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Diagnóstico por Imagem',
    priority: 'essential',
    tags: ["RNM","Pré-operatório","Padrão-Ouro"]
  },
  {
    id: 'fc-mioma-46',
    front: "A substância emboligênica mais utilizada na Embolização das Artérias Uterinas (EAU) são as microesferas de {{c1::Álcool Polivinílico (PVA)}} injetadas por cateterismo.",
    back: "Álcool Polivinílico (PVA)",
    comment: "As partículas ocluem os ramos terminais das artérias uterinas bilaterais, provocando isquemia miomatosa seletiva com necrose do tumor e preservação miometrial por fluxo colateral.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Embolização de Artérias Uterinas',
    priority: 'standard',
    tags: ["EAU","Embolização","Radiologia Intervencionista"]
  },
  {
    id: 'fc-mioma-47',
    front: "Qual é a principal contraindicação relativa de longo prazo para a Embolização das Artérias Uterinas (EAU)?",
    back: "Desejo de gestação futura (potencial insuficiência ovariana e complicações placentárias)",
    comment: "A EAU pode provocar embolização inadvertida de anastomoses utero-ovarianas levando à falência ovariana prematura, além de maior risco de abortamento e acretismo placentário.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Embolização de Artérias Uterinas',
    priority: 'essential',
    tags: ["EAU","Contraindicação","Fertilidade"]
  },
  {
    id: 'fc-mioma-48',
    front: "Nas primeiras 48 horas após a realização de embolização de artérias uterinas, a paciente frequentemente desenvolve dor pélvica aguda, náuseas, leucocitose e febre baixa, quadro denominado {{c1::Síndrome Pós-Embolização}}.",
    back: "Síndrome Pós-Embolização",
    comment: "Trata-se de uma resposta inflamatória estéril decorrente da necrose isquêmica maciça dos miomas. É autolimitada e manejada com AINEs, opioides e antieméticos.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Embolização de Artérias Uterinas',
    priority: 'standard',
    tags: ["EAU","Complicação","Pós-operatório"]
  },
  {
    id: 'fc-mioma-49',
    front: "O que é um 'Mioma Parasita' e como se dá a sua fisiopatologia de sustentação vascular?",
    back: "É um mioma subseroso pediculado que se aderiu ao omento ou peritônio pélvico, desenvolveu neovascularização externa e perdeu a fixação uterina original",
    comment: "Pode ocorrer espontaneamente ou após cirurgias laparoscópicas com morcelamento de fragmentos residuais abandonados na cavidade peritoneal.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Casos Especiais',
    priority: 'standard',
    tags: ["Casos Especiais","Mioma Parasita"]
  },
  {
    id: 'fc-mioma-50',
    front: "Após a menopausa fisiológica, na ausência de terapia hormonal exógena, a evolução biológica esperada para a esmagadora maioria dos miomas uterinos é a {{c1::regressão espontânea de volume / atrofia}}.",
    back: "Regressão espontânea / Atrofia tumoral",
    comment: "A queda drástica dos níveis séricos de estradiol e progesterona retira o estímulo mitogênico e trófico, levando à hialinização, calcificação e redução volumétrica progressiva.",
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    subfocus: 'Prognóstico',
    priority: 'essential',
    tags: ["Fisiologia","Menopausa","Prognóstico"]
  },

  // Medicina Preventiva e Social
  {
    id: 'fc-prev-01',
    front: 'A vacinação em massa contra a Febre Amarela e o uso de preservativos para prevenção de ISTs são exemplos clássicos de prevenção {{c1::primária}} segundo o modelo de Leavell & Clark.',
    back: 'prevenção primária',
    comment: 'Prevenção Primária atua no período pré-patogênico (promoção da saúde e proteção específica). Prevenção Secundária foca em diagnóstico precoce e rastreamento (ex: mamografia). Terciária em reabilitação. Quaternária em evitar iatrogenia/sobrediagnóstico.',
    specialty: 'Medicina Preventiva e Social',
    theme: 'Saúde Coletiva',
    focus: 'História Natural da Doença e Níveis de Prevenção',
    priority: 'essential',
    tags: ['preventiva', 'leavell-clark', 'prevencao-primaria']
  },
  {
    id: 'fc-prev-02',
    front: 'O delineamento epidemiológico observacional que parte da exposição presente para acompanhar os participantes ao longo do tempo e calcular a Incidência e o Risco Relativo (RR) é o estudo de {{c1::Coorte}}.',
    back: 'Estudo de Coorte (Cohort Study)',
    comment: 'Estudos de Coorte avaliam causa-efeito e calculam Incidência e Risco Relativo. Já o estudo Caso-Controle parte do desfecho/doença para o passado e calcula Odds Ratio (Razão de Chances).',
    specialty: 'Medicina Preventiva e Social',
    theme: 'Epidemiologia',
    focus: 'Desenhos de Estudos Epidemiológicos',
    priority: 'essential',
    tags: ['preventiva', 'coorte', 'risco-relativo', 'epidemiologia']
  },
  {
    id: 'fc-prev-03',
    front: 'Em caso de óbito por causa externa (homicídio, suicídio ou acidente), mesmo que ocorrido dentro do hospital sob cuidados médicos, a Declaração de Óbito (DO) deve ser emitida obrigatoriamente pelo médico do {{c1::IML}}.',
    back: 'IML (Instituto Médico Legal)',
    comment: 'Médicos assistentes e do Serviço de Verificação de Óbito (SVO) são proibidos de assinar DO em mortes violentas ou suspeitas, mesmo que a internação tenha durado dias ou meses.',
    specialty: 'Medicina Preventiva e Social',
    theme: 'Bioética e Legislação Médica',
    focus: 'Declaração de Óbito (DO)',
    priority: 'essential',
    tags: ['preventiva', 'declaracao-obito', 'iml', 'medicina-legal']
  },
  {
    "id": "fc-hpp-01",
    "front": "De acordo com as diretrizes atualizadas da FIGO e ACOG, define-se Hemorragia Pós-Parto (HPP) como a perda sanguínea cumulativa maior ou igual a {{c1::1.000 mL}} (independente da via de parto) ou acompanhada de sinais de instabilidade hemodinâmica nas primeiras 24 horas.",
    "back": "1.000 mL (ou qualquer perda com instabilidade)",
    "comment": "Tradicionalmente definia-se > 500 mL para parto vaginal e > 1.000 mL para cesárea. O conceito moderno unifica em ≥ 1.000 mL ou qualquer volume com sinais de choque hipovolêmico.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "definicao",
        "figo",
        "acog",
        "hpp"
    ]
},
  {
    "id": "fc-hpp-02",
    "front": "No Brasil, qual a posição da Hemorragia Pós-Parto no ranking de mortalidade materna?",
    "back": "Segunda causa de morte materna (atrás apenas das síndromes hipertensivas)",
    "comment": "No mundo, a HPP é a primeira causa isolada de morte materna. No Brasil, fica atrás apenas da pré-eclâmpsia/eclâmpsia.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "epidemiologia",
        "mortalidade-materna",
        "saude-publica"
    ]
},
  {
    "id": "fc-hpp-03",
    "front": "O Índice de Choque (Shock Index) no puerpério imediato é calculado dividindo-se a {{c1::Frequência Cardíaca (bpm) pela Pressão Arterial Sistólica (mmHg)}}.",
    "back": "Frequência Cardíaca / PA Sistólica (FC / PAS)",
    "comment": "Pela hipervolemia fisiológica da gestação, a puérpera pode perder até 1.000 a 1.500 mL antes de manifestar queda da PA. O aumento da FC eleva o índice precocemente.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "indice-de-choque",
        "triagem",
        "avaliacao"
    ]
},
  {
    "id": "fc-hpp-04",
    "front": "No puerpério imediato, um Índice de Choque (FC/PAS) maior ou igual a {{c1::0,9}} é um indicador precoce e altamente sensível de hemorragia grave oculta.",
    "back": "0,9 (ou ≥ 1,0 em alguns protocolos)",
    "comment": "O valor normal do índice de choque é 0,7 a 0,8. Valores ≥ 0,9 indicam perda significativa e ativam o protocolo de HPP antes da instalação de hipotensão franca.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "indice-de-choque",
        "ponto-de-corte",
        "urgencia"
    ]
},
  {
    "id": "fc-hpp-05",
    "front": "Qual a conduta imediata mandatória diante de uma puérpera com Índice de Choque (FC/PAS) ≥ 1,4?",
    "back": "Ativação do protocolo de transfusão maciça, suporte intensivo e preparação cirúrgica imediata",
    "comment": "Índice de choque ≥ 1,4 denota choque Classe III/IV (perda > 30% da volemia), com risco iminente de parada cardiorrespiratória e coagulopatia consumptiva.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "choque-grave",
        "transfusao-macica",
        "conduta"
    ]
},
  {
    "id": "fc-hpp-06",
    "front": "Qual a principal causa isolada de Hemorragia Pós-Parto, respondendo por aproximadamente 70% a 80% dos casos?",
    "back": "Atonia Uterina (falha do Tônus)",
    "comment": "A atonia uterina responde por 7 a 8 em cada 10 casos de HPP. Por isso, a profilaxia do 3º período visa especificamente garantir a contração miometrial.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "atonia-uterina",
        "etiologia",
        "frequencia"
    ]
},
  {
    "id": "fc-hpp-07",
    "front": "A regra mnemônica clássica das quatro etiologias de hemorragia pós-parto consiste nos '4 Ts': {{c1::Tônus, Trauma, Tecido e Trombina}}.",
    "back": "Tônus (70%), Trauma (20%), Tecido (10%) e Trombina (1%)",
    "comment": "Tônus = Atonia; Trauma = Lacerações/Rotura/Inversão; Tecido = Restos/Acretismo; Trombina = Coagulopatias.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "mnemonico",
        "4ts",
        "etiologia"
    ]
},
  {
    "id": "fc-hpp-08",
    "front": "Por que a estimativa visual da perda sanguínea é considerada uma armadilha diagnóstica em obstetrícia?",
    "back": "Porque subestima a perda real em 30% a 50%, atrasando o início do tratamento",
    "comment": "O sangue se mistura com líquido amniótico, urina e fica retido sob a paciente ou em coágulos vaginais ocultos.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "estimativa-visual",
        "armadilha",
        "perda-sanguinea"
    ]
},
  {
    "id": "fc-hpp-09",
    "front": "Diferencia-se a HPP primária da secundária pelo tempo de início: a primária ocorre nas primeiras {{c1::24 horas}} do pós-parto, enquanto a secundária ocorre entre 24h e 6 a 12 semanas.",
    "back": "24 horas pós-parto",
    "comment": "A imensa maioria dos óbitos ocorre na HPP primária nas primeiras 4 horas pós-parto. A secundária decorre comumente de infecção (endometrite) ou restos placentários.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "classificacao",
        "primaria-vs-secundaria",
        "tempo"
    ]
},
  {
    "id": "fc-hpp-10",
    "front": "Qual o principal mecanismo fisiológico de hemostasia no sítio de inserção placentária imediatamente após a dequitação?",
    "back": "Ligaduras vivas de Pinard (contração miometrial que colapsa os vasos espiralados)",
    "comment": "As fibras musculares uterinas em arranjo entrecruzado estrangulam as artérias e veias espiraladas quando o útero se contrai (globo de segurança de Pinard).",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "pinard",
        "hemostasia",
        "fisiologia"
    ]
},
  {
    "id": "fc-hpp-11",
    "front": "Puérpera de 32 anos, após parto vaginal com recém-nascido de 4.200g, apresenta PA 90x60 mmHg e FC 115 bpm. O que esses dados clínicos indicam em relação ao Índice de Choque?",
    "back": "Índice de Choque = 1,27 (115/90), indicando hemorragia pós-parto grave com necessidade de intervenção imediata",
    "comment": "Índice de choque > 0,9 alerta para descompensação; > 1,0 indica gravidade iminente. O macrossoma é fator de risco clássico para atonia por sobredistensão.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "caso-clinico",
        "indice-choque",
        "calculo"
    ]
},
  {
    "id": "fc-hpp-12",
    "front": "O parâmetro laboratorial da coagulação mais fiel para predizer a evolução para choque grave e coagulopatia na HPP é a dosagem de {{c1::fibrinogênio sérico}}.",
    "back": "Fibrinogênio sérico (< 200 mg/dL)",
    "comment": "Fibrinogênio normal na gestação é 400-600 mg/dL. Níveis < 200 mg/dL sinalizam consumo acelerado e antecipam necessidade de hemotransfusão maciça.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "fibrinogenio",
        "laboratorio",
        "coagulacao"
    ]
},
  {
    "id": "fc-hpp-13",
    "front": "A recomendação padrão da OMS, MS e FEBRASGO para prevenção universal de HPP em 100% dos partos é a administração de {{c1::10 UI de Ocitocina Intramuscular (IM)}} logo após o desprendimento do ombro anterior.",
    "back": "10 UI de Ocitocina IM",
    "comment": "Essa medida isolada reduz a atonia uterina em até 60%. Não deve ser feita em bolus venoso rápido não diluído.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "ocitocina",
        "profilaxia",
        "padrao-ouro"
    ]
},
  {
    "id": "fc-hpp-14",
    "front": "Qual o momento exato preconizado pelas diretrizes para administrar a ocitocina profilática no parto vaginal?",
    "back": "Logo após o desprendimento do ombro anterior (ou imediatamente após a saída do concepto)",
    "comment": "Fazer a ocitocina antes da dequitação placentária não aumenta a retenção e diminui expressivamente a perda sanguínea.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "timing",
        "ocitocina",
        "parto"
    ]
},
  {
    "id": "fc-hpp-15",
    "front": "A manobra de tração controlada do cordão associada à contratração suprapúbica do útero para prevenir a inversão uterina denomina-se manobra de {{c1::Brandt-Andrews}}.",
    "back": "Manobra de Brandt-Andrews",
    "comment": "Uma mão segura o cordão próximo ao introito tracionando suavemente; a outra mão empurra o corpo uterino para cima a partir do hipogástrio.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "brandt-andrews",
        "manobra",
        "dequitacao"
    ]
},
  {
    "id": "fc-hpp-16",
    "front": "Quais são os 4 componentes do Manejo Ativo do Terceiro Período do Parto recomendados pela OMS?",
    "back": "1. Ocitocina profilática; 2. Clampeamento oportuno; 3. Tração de cordão; 4. Vigilância do tônus",
    "comment": "A ocitocina 10 UI IM é o componente mais importante. A massagem de rotina pós-dequitação não é obrigatória se o útero estiver contraído.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "terceiro-periodo",
        "oms",
        "manejo-ativo"
    ]
},
  {
    "id": "fc-hpp-17",
    "front": "Na ausência de ocitocina ou impossibilidade da via injetável, o uterotônico alternativo oral preconizado pela OMS para profilaxia é o {{c1::Misoprostol 400 a 600 mcg via oral}}.",
    "back": "Misoprostol 400 a 600 mcg VO",
    "comment": "O misoprostol é estável à temperatura ambiente e crucial em cenários de recursos escassos, embora a ocitocina continue sendo a primeira linha superior.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "misoprostol",
        "profilaxia-alternativa",
        "oms"
    ]
},
  {
    "id": "fc-hpp-18",
    "front": "O que caracteriza o 4º período do parto (Período de Greenberg) e por que ele exige vigilância rigorosa?",
    "back": "É a primeira hora após a dequitação placentária, período de maior ocorrência de atonia uterina e choque hemorrágico",
    "comment": "Compreende os fenômenos de miotamponagem (ligaduras de Pinard) e trombotamponagem. Se a paciente atoniar, atonia ocorre tipicamente nessa primeira hora.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "greenberg",
        "quarto-periodo",
        "vigilancia"
    ]
},
  {
    "id": "fc-hpp-19",
    "front": "No parto cesáreo, a ocitocina profilática deve ser administrada por via {{c1::intravenosa em infusão lenta (diluída) ou intramural direta}}, e nunca em bólus IV rápido.",
    "back": "IV em infusão lenta ou intramural",
    "comment": "Usa-se a 'regra dos três': 3 UI IV lentas, podendo repetir com cautela, ou 10-20 UI em frasco de infusão contínua para evitar colapso hemodinâmico.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "cesarea",
        "ocitocina",
        "infusao"
    ]
},
  {
    "id": "fc-hpp-20",
    "front": "Por que a manobra de Credé (espremer vigorosamente o fundo uterino para dequitar a placenta) é formalmente proscrita?",
    "back": "Porque aumenta o risco de hemorragia, trauma miometrial e inversão uterina aguda iatrogênica",
    "comment": "A compressão fúndica violenta rompe cotilédones, causa dor excruciante e pode evertir o útero se associada a tração.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "crede",
        "proscrito",
        "trauma"
    ]
},
  {
    "id": "fc-hpp-21",
    "front": "O tempo fisiológico de espera para a dequitação espontânea da placenta sob manejo ativo antes de diagnosticar retenção placentária é de até {{c1::30 minutos}}.",
    "back": "30 minutos",
    "comment": "Sob conduta ativa, 90% dequitam em até 15 minutos. Se atingir 30 min sem dequitação, define-se retenção placentária e indica-se curagem manual sob anestesia.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "tempo",
        "retencao",
        "dequitacao"
    ]
},
  {
    "id": "fc-hpp-22",
    "front": "Qual a conduta obstétrica quando, após 30 minutos do parto, a placenta não dequitou e há sangramento vaginal ativo?",
    "back": "Extração manual da placenta (curagem manual) no centro cirúrgico sob analgesia/anestesia",
    "comment": "A mão do obstetra penetra na cavidade, encontra o plano de clivagem entre placenta e miométrio e descola o órgão em movimento de serra.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "curagem",
        "retencao",
        "conduta"
    ]
},
  {
    "id": "fc-hpp-23",
    "front": "A carbetocina é um análogo sintético da ocitocina com meia-vida mais longa, administrada em dose única de {{c1::100 mcg IV/IM}}, aprovada principalmente para profilaxia de HPP em cesarianas eletivas.",
    "back": "100 mcg IV ou IM",
    "comment": "Tem ação por até 4 a 5 horas, eliminando a necessidade de bomba de infusão contínua pós-cesárea.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "carbetocina",
        "profilaxia",
        "farmaco"
    ]
},
  {
    "id": "fc-hpp-24",
    "front": "A tração controlada do cordão umbilical deve ser realizada em que momento em relação à contração uterina?",
    "back": "Exclusivamente durante a contração uterina (útero firme), com contratração suprapúbica simultânea",
    "comment": "Tracionar o cordão com útero flácido e relaxado é o principal mecanismo iatrogênico da inversão uterina aguda.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "cordao",
        "contracao",
        "inversao"
    ]
},
  {
    "id": "fc-hpp-25",
    "front": "Cite 4 fatores de risco clássicos para atonia uterina associados à sobredistensão miometrial cobrados em prova.",
    "back": "1. Gestação múltipla; 2. Polidrâmnio; 3. Macrossomia fetal; 4. Grande multiparidade",
    "comment": "O estiramento excessivo das fibras musculares esgota a capacidade contrátil miometrial após o esvaziamento uterino.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "fatores-risco",
        "sobredistensao",
        "atonia"
    ]
},
  {
    "id": "fc-hpp-26",
    "front": "A primeira medida mecânica não farmacológica mandatória diante de uma atonia uterina com sangramento no pós-parto imediato é a {{c1::massagem uterina bimanual (Manobra de Hamilton)}}.",
    "back": "Massagem uterina bimanual (Manobra de Hamilton)",
    "comment": "Uma mão fechada em punho comprime a parede uterina anterior através do fundo de saco vaginal; a outra mão comprime a parede posterior pelo abdome.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "hamilton",
        "massagem",
        "primeira-linha"
    ]
},
  {
    "id": "fc-hpp-27",
    "front": "Por que a sondagem vesical de demora com esvaziamento imediato é um passo inicial crucial no tratamento da atonia?",
    "back": "Porque a bexiga cheia desloca o útero para cima e para o lado, impedindo mecanicamente a contração miometrial efetiva",
    "comment": "Além disso, o cateterismo vesical é mandatório para monitorizar o débito urinário na ressuscitação volêmica (meta ≥ 0,5 mL/kg/h).",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "bexiga",
        "sondagem",
        "debito"
    ]
},
  {
    "id": "fc-hpp-28",
    "front": "Qual a dose e diluição recomendada da ocitocina no tratamento venoso da atonia uterina declarada? {{c1::20 a 40 UI em 500 mL de SF 0,9% ou Ringer Lactato em infusão rápida}}.",
    "back": "20 a 40 UI em 500 mL de SF/RL contínuo",
    "comment": "NUNCA fazer em bólus IV rápido pelo risco de vasodilatação sistêmica fulminante, hipotensão severa e colapso circulatório.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "ocitocina",
        "dose-terapeutica",
        "infusao"
    ]
},
  {
    "id": "fc-hpp-29",
    "front": "Por que a metilergometrina (Ergotrate) é estritamente contraindicada na paciente hipertensa ou com pré-eclâmpsia?",
    "back": "Causa vasoconstrição arteriolar intensa, podendo precipitar crise hipertensiva severa e AVC",
    "comment": "Essa é uma das armadilhas mais repetidas em provas de residência. Na hipertensa, pula-se a metilergometrina e usa-se misoprostol e ácido tranexâmico.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "metilergometrina",
        "contraindicacao",
        "hipertensao"
    ]
},
  {
    "id": "fc-hpp-30",
    "front": "A dose padrão da Metilergometrina no tratamento da atonia uterina na puérpera normotensa é de {{c1::0,2 mg Intramuscular (IM)}}.",
    "back": "0,2 mg IM",
    "comment": "Pode ser repetida a cada 2 a 4 horas se necessário. Não deve ser administrada por via intravenosa direta devido ao alto risco de espasmo coronariano.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "metilergometrina",
        "posologia",
        "uterotonico"
    ]
},
  {
    "id": "fc-hpp-31",
    "front": "Segundo o ensaio clínico WOMAN Trial, o Ácido Tranexâmico na dose de {{c1::1 g IV em 10 minutos}} deve ser administrado o mais precocemente possível, preferencialmente nas primeiras {{c2::3 horas}} do sangramento.",
    "back": "1 g IV em 10 min | primeiras 3 horas",
    "comment": "Administrado após 3 horas, o ácido tranexâmico perde eficácia e pode aumentar riscos trombóticos. Pode ser repetido 1g se sangramento persistir após 30 min.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "tranexamico",
        "woman-trial",
        "antifibrinolitico"
    ]
},
  {
    "id": "fc-hpp-32",
    "front": "Qual a dose e via de escolha do Misoprostol (PGE1) no tratamento da atonia uterina refratária?",
    "back": "800 mcg por via retal ou sublingual (4 comprimidos de 200 mcg)",
    "comment": "A via retal tem absorção mais lenta e prolongada com menos efeitos colaterais que a oral, embora a sublingual tenha início de ação mais rápido.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "misoprostol",
        "dose",
        "atonia"
    ]
},
  {
    "id": "fc-hpp-33",
    "front": "A prostaglandina F2-alfa (Carboprost / Hemabate) promove intensa contração uterina, porém possui contraindicação formal em pacientes portadoras de {{c1::asma brônquica}}.",
    "back": "Asma brônquica (causa broncoespasmo severo)",
    "comment": "A PGF2-alfa induz broncoconstrição potente e hipertensão pulmonar reflexa. Seu uso é restrito e exige exclusão de hiper-reatividade brônquica.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "carboprost",
        "asma",
        "contraindicacao"
    ]
},
  {
    "id": "fc-hpp-34",
    "front": "Puérpera no 4º período de parto cesáreo por descolamento de placenta apresenta hemorragia volumosa e atonia. É hipertensa crônica em uso de metildopa. Quais drogas uterotônicas são a melhor escolha e qual está PROIBIDA?",
    "back": "Indicadas: Ocitocina, Tranexâmico e Misoprostol. Proibida: Metilergometrina (risco de crise hipertensiva)",
    "comment": "A hipertensão prévia contraindica formalmente alcaloides do ergot. O misoprostol e o ácido tranexâmico são seguros nesse cenário.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "caso-clinico",
        "hipertensao",
        "farmacos"
    ]
},
  {
    "id": "fc-hpp-35",
    "front": "Qual o próximo passo imediato diante de atonia uterina pós-parto vaginal que não respondeu à massagem bimanual e às drogas uterotônicas?",
    "back": "Tamponamento com Balão Intrauterino (Balão de Bakri ou artesanal)",
    "comment": "Em parto vaginal, tenta-se o balão de tamponamento antes de indicar laparotomia cirúrgica. Se cessar o sangramento, evita-se a cirurgia.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "bakri",
        "tamponamento",
        "escalonamento"
    ]
},
  {
    "id": "fc-hpp-36",
    "front": "O volume médio de solução fisiológica estéril infundido para insuflação do balão de tamponamento intrauterino de Bakri é de {{c1::300 a 500 mL}}.",
    "back": "300 a 500 mL de SF morno",
    "comment": "Não insuflar com ar ou líquido quente. O balão tem dreno central para escoamento do sangue e monitorização da hemostasia.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "volume",
        "bakri",
        "tecnica"
    ]
},
  {
    "id": "fc-hpp-37",
    "front": "O que é o 'Teste do Balão' de Bakri e como interpretar seus resultados?",
    "back": "Positivo: sangramento cessa pelo dreno (sucesso). Negativo: sangramento ativo persiste (falha, laparotomia)",
    "comment": "O teste do balão leva 15-30 minutos. Se o sangramento pelo dreno cessar ou for < 50 mL, mantém-se o balão; se persistir sangrando, indica-se laparotomia.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "teste-do-balao",
        "interpretacao",
        "falha"
    ]
},
  {
    "id": "fc-hpp-38",
    "front": "Em caso de sucesso no tamponamento intrauterino pelo balão de Bakri, o tempo recomendado de permanência do dispositivo na cavidade é de {{c1::12 a 24 horas}}.",
    "back": "12 a 24 horas",
    "comment": "Deixar por mais de 24 horas aumenta drasticamente o risco de infecção endometrial (endometrite) e necrose tecidual. Retira-se desinsuflando gradualmente.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "tempo-permanencia",
        "bakri",
        "retirada"
    ]
},
  {
    "id": "fc-hpp-39",
    "front": "Qual a principal sutura compressiva uterina conservadora de primeira linha empregada na laparotomia para atonia refratária?",
    "back": "Sutura de B-Lynch (sutura em 'suspensório')",
    "comment": "Criada por Christopher B-Lynch em 1997. Passa alças que contornam o fundo uterino comprimindo a parede anterior e posterior, preservando a fertilidade.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "b-lynch",
        "sutura",
        "conservador"
    ]
},
  {
    "id": "fc-hpp-40",
    "front": "Antes de passar a sutura definitiva de B-Lynch, o teste prognóstico de sucesso consiste em realizar a {{c1::compressão bimanual direta do útero laparotomizado}} e verificar a cessação do sangramento vaginal.",
    "back": "Compressão bimanual direta do útero",
    "comment": "Se a compressão manual estanca o sangramento que sai pelo colo, a sutura de compressão tem elevadíssima taxa de êxito.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "teste-prognostico",
        "b-lynch",
        "cirurgia"
    ]
},
  {
    "id": "fc-hpp-41",
    "front": "Quais as artérias ligadas na técnica de desvascularização uterina escalonada antes de considerar histerectomia?",
    "back": "1. Artérias Uterinas (O'Leary); 2. Ramos ováricos/inferiores; 3. Artérias Ilíacas Internas (Hipogástricas)",
    "comment": "CUIDADO EM PROVA: NUNCA ligar a artéria ilíaca comum ou externa, o que causaria isquemia de membro inferior.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "oleary",
        "desvascularizacao",
        "arterias-uterinas"
    ]
},
  {
    "id": "fc-hpp-42",
    "front": "A técnica de sutura hemostática descrita por Hayman difere da de B-Lynch por {{c1::não necessitar de histerotomia prévia (passa direto pelas paredes anterior e posterior do útero fechado)}}.",
    "back": "Não necessitar de histerotomia prévia",
    "comment": "A técnica de Hayman é especialmente vantajosa em atonia pós-parto vaginal laparotomizado, pois não precisa abrir o segmento uterino.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "hayman",
        "b-lynch",
        "cirurgia"
    ]
},
  {
    "id": "fc-hpp-43",
    "front": "Quando a histerectomia puerperal de urgência está formalmente indicada na HPP?",
    "back": "Falha de medidas conservadoras (uterotônicos, balão e suturas) ou choque hemorrágico refratário com risco de morte",
    "comment": "A histerectomia subtotal é preferida por ser mais rápida, a menos que haja sangramento de origem cervical ou acretismo do colo que exija a total.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "histerectomia",
        "definitiva",
        "indicacao"
    ]
},
  {
    "id": "fc-hpp-44",
    "front": "Entre histerectomia puerperal subtotal e total na emergência por atonia uterina, a técnica preferida na maioria dos casos é a {{c1::histerectomia subtotal}}, devido ao menor tempo cirúrgico e menor perda adicional de sangue.",
    "back": "Histerectomia subtotal (amputação supracervical)",
    "comment": "Preserva-se o colo uterino, diminuindo a dissecção dos ureteres e o tempo intraoperatório em uma paciente hemodinamicamente crítica.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "subtotal",
        "cirurgia-urgencia",
        "tempo"
    ]
},
  {
    "id": "fc-hpp-45",
    "front": "Puérpera em choque classe IV por atonia refratária é submetida a laparotomia. Sutura de B-Lynch falhou, sangramento difuso persiste e PA 60x30 mmHg. O cirurgião deve insistir em ligaduras vasculares complexas ou partir para histerectomia imediata?",
    "back": "Histerectomia imediata (cirurgia de controle de danos / salvadora de vida)",
    "comment": "Em choque gravíssimo com hipotermia, acidose e coagulopatia (tríade da morte), procedimentos demorados elevam a letalidade. O tempo manda interromper o sangramento definitivo.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "caso-clinico",
        "controle-danos",
        "histerectomia"
    ]
},
  {
    "id": "fc-hpp-46",
    "front": "Puérpera imediata apresenta sangramento vaginal vermelho-vivo abundante e contínuo, porém à palpação abdominal o útero encontra-se perfeitamente firme e contraído. Qual a principal hipótese diagnóstica?",
    "back": "Trauma de canal de parto (laceração de colo, vagina ou períneo)",
    "comment": "O útero duro descarta atonia como causa primária. A conduta mandatória imediata é a revisão instrumental sistemática do canal de parto com valvas.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "trauma",
        "utero-contraido",
        "diferencial"
    ]
},
  {
    "id": "fc-hpp-47",
    "front": "Diante de suspeita de laceração de trajeto puerperal, o exame físico mandatório de escolha exige {{c1::inspeção sob valvas de peso (valvas vaginais) e boa iluminação}} de todo o colo, fórnices e paredes vaginais.",
    "back": "Inspeção sob valvas de peso e boa iluminação",
    "comment": "O espéculo comum pode ocultar lacerações de parede vaginal ou fórnices posteriores. Usam-se valvas de Doyen ou Sims.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "valvas",
        "revisao-canal",
        "tecnica"
    ]
},
  {
    "id": "fc-hpp-48",
    "front": "Como é classificada a laceração perineal de 3º grau e qual estrutura muscular é obrigatoriamente acometida?",
    "back": "Lesão que rompe o esfíncter anal externo e/ou interno (sem lesão de mucosa retal)",
    "comment": "Subdivide-se em: 3a (< 50% do EAE), 3b (> 50% do EAE) e 3c (esfíncter anal interno rompido). Laceração de 4º grau atinge a mucosa retal.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "esfincter-anal",
        "terceiro-grau",
        "laceracao"
    ]
},
  {
    "id": "fc-hpp-49",
    "front": "A laceração perineal de 4º grau envolve a pele, musculatura perineal, esfíncteres anais e se estende até a {{c1::mucosa retal}}.",
    "back": "Mucosa retal",
    "comment": "Exige rafia por planos rigorosa no centro cirúrgico e antibioticoprofilaxia, além de laxativos para prevenir fístula retovaginal.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "quarto-grau",
        "mucosa-retal",
        "laceracao"
    ]
},
  {
    "id": "fc-hpp-50",
    "front": "Qual a principal causa iatrogênica de inversão uterina aguda no 3º período do parto?",
    "back": "Tração excessiva e intempestiva do cordão umbilical com útero atônico e placenta não dequitada",
    "comment": "Associada à ausência de contratração suprapúbica. A placenta fúndica atua como êmbolo que puxa o fundo uterino para dentro.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "inversao-uterina",
        "tracao-cordao",
        "iatrogenica"
    ]
},
  {
    "id": "fc-hpp-51",
    "front": "Na inversão uterina aguda, o primeiro passo farmacológico imediato antes de qualquer tentativa de reposição é {{c1::suspender imediatamente qualquer infusão de ocitocina ou uterotônicos}}.",
    "back": "Suspender imediatamente a ocitocina/uterotônicos",
    "comment": "Ocitocina fecha o anel cervical e enrijece o útero evertido, impossibilitando a redução manual e agravando o choque.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "suspender-ocitocina",
        "inversao",
        "primeiro-passo"
    ]
},
  {
    "id": "fc-hpp-52",
    "front": "A manobra manual de reposição da inversão uterina aguda, realizada empurrando o fundo uterino com a palma da mão e pontas dos dedos através do colo em direção ao umbigo, chama-se {{c1::Manobra de Taxe (ou Manobra de Johnson)}}.",
    "back": "Manobra de Taxe / Johnson",
    "comment": "Deve ser feita imediatamente após o diagnóstico, antes da formação do anel de constrição cervical. O útero é empurrado como uma luva invertida.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "taxe",
        "johnson",
        "manobra-reducao"
    ]
},
  {
    "id": "fc-hpp-53",
    "front": "Se a placenta ainda estiver aderida ao fundo uterino invertido durante a manobra de Taxe, ela deve ser removida antes ou depois da reposição uterina?",
    "back": "Depois da reposição anatômica do útero na cavidade abdominal",
    "comment": "Tentar dequitar a placenta antes da redução causa hemorragia torrencial incontrolável e aumenta o choque neurogênico.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "placenta",
        "inversao",
        "timing"
    ]
},
  {
    "id": "fc-hpp-54",
    "front": "Quando a manobra manual de Taxe falha devido a espasmo severo do colo uterino (anel de constrição), indica-se o uso de drogas {{c1::tocolíticas (como Terbutalina, Nitroglicerina ou Anestésicos Halogenados)}} para relaxar o miométrio.",
    "back": "Tocolíticas (Terbutalina / Nitroglicerina)",
    "comment": "O relaxamento farmacológico desfaz o anel espasmódico e permite que a mão do obstetra empurre o fundo de volta.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "tocolitico",
        "inversao",
        "relaxamento"
    ]
},
  {
    "id": "fc-hpp-55",
    "front": "Em que momento exato os uterotônicos em dose alta devem ser administrados na paciente com inversão uterina?",
    "back": "Imediatamente APÓS a reposição anatômica completa do útero na cavidade",
    "comment": "Assim que o fundo retorna à posição normal, a infusão de ocitocina em dose alta é aberta e a mão interna do obstetra permanece até o útero contrair firmemente.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "uterotonicos",
        "pos-reducao",
        "inversao"
    ]
},
  {
    "id": "fc-hpp-56",
    "front": "A técnica cirúrgica abdominal para redução da inversão uterina refratária que consiste na tração do fundo uterino através de pinças de Allis colocadas no anel de invaginação denomina-se técnica de {{c1::Huntington}}.",
    "back": "Técnica de Huntington",
    "comment": "Se a tração não resolver, realiza-se a técnica de Haultain (incisão posterior do anel constritor para alívio mecânico).",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "huntington",
        "haultain",
        "cirurgia"
    ]
},
  {
    "id": "fc-hpp-57",
    "front": "Puérpera após parto normal domiciliar dá entrada pálida, sudorética, PA 70x40 mmHg e FC 130 bpm. Ao toque e exame especular, palpa-se massa avermelhada carnosa exteriorizando-se no introito vaginal e o abdome encontra-se escavado no hipogástrio. Qual o diagnóstico e a primeira conduta imediata?",
    "back": "Inversão Uterina Aguda; Conduta: ressuscitação, suspender uterotônicos e realizar Manobra de Taxe imediata",
    "comment": "O abdome 'em xícara' ou escavado pela ausência do corpo uterino no hipogástrio associado a massa vaginal confirma a inversão.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "caso-clinico",
        "inversao",
        "taxe"
    ]
},
  {
    "id": "fc-hpp-58",
    "front": "Qual a conduta para um hematoma puerperal vulvovaginal expansivo e sintomático com diâmetro maior que 5 cm?",
    "back": "Incisão cirúrgica ampla, evacuação dos coágulos, ligadura do vaso sangrante e drenagem / tamponamento",
    "comment": "Hematomas pequenos (< 3 a 5 cm) estáveis e assintomáticos podem ser tratados conservadoramente com gelo e vigilância.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "hematoma",
        "drenagem",
        "trauma"
    ]
},
  {
    "id": "fc-hpp-59",
    "front": "Qual a principal associação clínica de risco para o desenvolvimento de Espectro do Acretismo Placentário (PAS)?",
    "back": "Associação entre Placenta Prévia e Cesariana Anterior prévia",
    "comment": "Com 1 cesárea prévia + placenta prévia, o risco de acretismo é de ~10% a 25%; com 3 ou mais cesáreas, supera 50% a 60%.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "acretismo",
        "placenta-previa",
        "cesarea-anterior"
    ]
},
  {
    "id": "fc-hpp-60",
    "front": "O acretismo placentário divide-se histologicamente de acordo com a profundidade de invasão: placenta acreta (adia ao miométrio), increta (invade o miométrio) e {{c1::percreta (ultrapassa a serosa e pode invadir órgãos vizinhos, como a bexiga)}}.",
    "back": "Placenta Percreta",
    "comment": "Acretismo clássico (accreta vera) corresponde a 75-80% dos casos; increta a ~15% e percreta a ~5% (a mais grave).",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "percreta",
        "increta",
        "classificacao"
    ]
},
  {
    "id": "fc-hpp-61",
    "front": "Qual a conduta padrão-ouro no parto de gestante com diagnóstico pré-natal confirmado de placenta prévia e placenta percreta?",
    "back": "Cesariana programada sem tentar descolar a placenta, seguida de histerectomia puerperal em bloco",
    "comment": "Tentar descolar a placenta acretada causa sangramento cataclísmico e choque imediato. Abre-se o útero longe da placenta e extrai-se o feto.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "histerectomia-em-bloco",
        "percreta",
        "conduta"
    ]
},
  {
    "id": "fc-hpp-62",
    "front": "O exame de imagem pré-natal padrão-ouro para triagem e diagnóstico de acretismo placentário é a {{c1::Ultrassonografia com Dopplerfluxometria}}.",
    "back": "Ultrassonografia com Doppler",
    "comment": "Sinais: perda da zona hipoecoica retroplacentária, lacunas vasculares com fluxo turbilhonado ('queijo suíço') e hipervascularização da interface útero-bexiga.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "usg-doppler",
        "acretismo",
        "imagem"
    ]
},
  {
    "id": "fc-hpp-63",
    "front": "Qual a principal complicação tardia grave da HPP associada a choque hipovolêmico prolongado decorrente de necrose isquêmica da adeno-hipófise?",
    "back": "Síndrome de Sheehan (pan-hipopituitarismo pós-parto)",
    "comment": "Manifesta-se clinicamente por agalactia (ausência de apojadura), amenorreia pós-parto, astenia, hipotireoidismo e perda de pelos pubianos/axilares.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "sheehan",
        "necrose-hipofise",
        "complicacao-tardia"
    ]
},
  {
    "id": "fc-hpp-64",
    "front": "Os primeiros sinais clínicos clássicos da Síndrome de Sheehan no pós-parto são a {{c1::agalactia (falha total de lactação)}} seguida de amenorreia secundária e astenia profunda.",
    "back": "Agalactia e amenorreia secundária",
    "comment": "A glândula hipofisária hipertrofia na gestação tornando-se suscetível à isquemia em episódios de choque e hipotensão grave.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "agalactia",
        "sheehan",
        "sintomas"
    ]
},
  {
    "id": "fc-hpp-65",
    "front": "No Protocolo de Transfusão Maciça para choque hemorrágico obstétrico, a proporção recomendada de Concentrado de Hemácias, Plasma Fresco Congelado e Concentrado de Plaquetas é de {{c1::1 : 1 : 1}}.",
    "back": "1 : 1 : 1 (CH : PFC : Plaquetas)",
    "comment": "A proporção 1:1:1 reconstitui o sangue total e combate a coagulopatia dilucional e a hipotermia precoce.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "transfusao-macica",
        "proporcao",
        "1-1-1"
    ]
},
  {
    "id": "fc-hpp-66",
    "front": "Qual hemocomponente é especificamente indicado na HPP quando o nível sérico de fibrinogênio encontra-se persistentemente menor que 100 mg/dL?",
    "back": "Crioprecipitado (1 bolsa para cada 10 kg de peso)",
    "comment": "O crioprecipitado fornece alta concentração de fibrinogênio e fator VIII em pequeno volume, revertendo a hipofibrinogenemia crítica.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "crioprecipitado",
        "fibrinogenio",
        "coagulopatia"
    ]
},
  {
    "id": "fc-hpp-67",
    "front": "A 'Tríade Letal' do choque hemorrágico que deve ser ativamente prevenida durante a ressuscitação da puérpera consiste em: {{c1::Hipotermia, Acidose metabólica e Coagulopatia}}.",
    "back": "Hipotermia, Acidose e Coagulopatia",
    "comment": "Deve-se aquecer a paciente com mantas térmicas, aquecer os fluidos intravenosos e evitar infusão excessiva de cristaloides puros.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "triade-letal",
        "choque",
        "resfriamento"
    ]
},
  {
    "id": "fc-hpp-68",
    "front": "Qual a emergência obstétrica clássica que cursa com sangramento vaginal escuro, dor abdominal intensa, hipertonia uterina e alto risco de Coagulação Intravascular Disseminada (CIVD)?",
    "back": "Descolamento Prematuro de Placenta (DPP)",
    "comment": "O DPP libera tromboplastina tecidual na circulação materna, desencadeando CIVD grave e atonia uterina secundária (útero de Couvelaire).",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "dpp",
        "civd",
        "couvelaire"
    ]
},
  {
    "id": "fc-hpp-69",
    "front": "A infiltração hemorrágica maciça do miométrio decorrente de DPP grave com aspecto arroxeado/azulado à inspeção na cesariana denomina-se {{c1::Útero de Couvelaire (apoplexia uteroplacentária)}}.",
    "back": "Útero de Couvelaire",
    "comment": "O útero de Couvelaire isolado NÃO é indicação imediata de histerectomia: deve-se tentar massagem e uterotônicos vigorosos antes.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "couvelaire",
        "apoplexia",
        "dpp"
    ]
},
  {
    "id": "fc-hpp-70",
    "front": "Puérpera com sangramento ativo pós-parto apresenta exames: Plaquetas 45.000/mm³, Fibrinogênio 75 mg/dL e TTPA alargado. Qual conduta com hemocomponentes deve ser adotada prioritariamente?",
    "back": "Transfusão de Plaquetas (1 UI/10 kg), Crioprecipitado (1 UI/10 kg para fibrinogênio < 100) e Plasma Fresco Congelado",
    "comment": "Fibrinogênio < 100 mg/dL exige reposição imediata de crioprecipitado, e plaquetas < 50.000 em paciente sangrando ativamente exigem aférese/concentrado de plaquetas.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "caso-clinico",
        "coagulopatia",
        "crioprecipitado"
    ]
},
  {
    "id": "fc-hpp-71",
    "front": "O que é o Dispositivo de Tamponamento a Vácuo Intrauterino (Sistema JADA) e qual sua proposta de ação?",
    "back": "Sistema de vácuo intrauterino que aplica pressão negativa, colapsando o útero e induzindo contração fisiológica",
    "comment": "Tecnologia recentemente incorporada em diretrizes que aplica vácuo suave (< 90 mmHg), atingindo hemostasia em minutos.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "jada",
        "vacuo",
        "tecnologia-recente"
    ]
},
  {
    "id": "fc-hpp-72",
    "front": "A embolização de artérias uterinas (EAU) por radiologia intervencionista é uma opção conservadora de hemostasia na HPP, mas exige que a paciente esteja {{c1::hemodinamicamente estável e em centro terciário com suporte intervencionista imediato}}.",
    "back": "Hemodinamicamente estável",
    "comment": "Puérpera em choque descompensado ou instabilidade grave não tolera o tempo de transporte e angiografia, devendo ir para laparotomia.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "embolizacao",
        "estabilidade",
        "intervencao"
    ]
},
  {
    "id": "fc-hpp-73",
    "front": "Multípara, 40 semanas, parto vaginal rápido há 20 min. Logo após saída da placenta, sangramento profuso. Ao exame: útero endurecido no nível da sínfise púbica, porém sangue vermelho-vivo com coágulos exterioriza-se ativamente pela vulva. O que o médico deve fazer?",
    "back": "Exame especular minucioso do canal de parto sob valvas de peso à procura de lacerações de colo ou vagina",
    "comment": "Útero endurecido = não é atonia! É trauma de trajeto (segundo T mais comum). Tratar com ocitocina sem revisar o canal é erro clássico de prova.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "caso-clinico",
        "utero-contraido",
        "laceracao"
    ]
},
  {
    "id": "fc-hpp-74",
    "front": "Qual a conduta obstétrica quando, durante a revisão da placenta após o parto, constata-se a ausência de um cotilédone placentário com sangramento uterino contínuo?",
    "back": "Revisão manual da cavidade uterina (curagem) ou curetagem uterina imediata",
    "comment": "A retenção de cotilédone impede a contração homogênea do sítio de implantação, perpetuando a hemorragia.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "cotiledone",
        "curagem",
        "restos"
    ]
},
  {
    "id": "fc-hpp-75",
    "front": "No choque hemorrágico pós-parto, a reposição volêmica inicial com cristaloides (SF 0,9% ou Ringer Lactato) deve ser criteriosa, evitando-se infusões superiores a {{c1::1.500 a 2.000 mL}} para não induzir coagulopatia dilucional e hipotermia.",
    "back": "1.500 a 2.000 mL",
    "comment": "As diretrizes modernas preconizam ressuscitação hemostática precoce com sangue e hemoderivados (1:1:1) em vez de hiperidratação com cristaloide puro.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "cristaloides",
        "diluicao",
        "volume"
    ]
},
  {
    "id": "fc-hpp-76",
    "front": "Em uma paciente com atonia uterina pós-parto normal, coloque na ordem cronológica correta: Balão de Bakri, Ocitocina IV, Sutura de B-Lynch, Massagem de Hamilton e Histerectomia.",
    "back": "1. Massagem Hamilton + Ocitocina IV; 2. Balão de Bakri; 3. Sutura B-Lynch; 4. Histerectomia (se refratário)",
    "comment": "Ordem cronológica obrigatória de cobrança nas bancas de residência.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "sequencia",
        "cronologia",
        "resumo-geral"
    ]
},
  {
    "id": "fc-hpp-77",
    "front": "A principal sutura hemostática compressiva utilizada no segmento uterino inferior sangrante pós-cesárea por placenta prévia é a sutura de {{c1::Cho (sutura transmural em múltiplos quadrados)}}.",
    "back": "Sutura de Cho",
    "comment": "Enquanto B-Lynch contorna o útero como suspensório, a sutura de Cho aplica múltiplos pontos em quadrado aproximando a parede anterior e posterior.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "cho",
        "sutura-quadrada",
        "placenta-previa"
    ]
},
  {
    "id": "fc-hpp-78",
    "front": "Qual o limite de perda sanguínea visual que corresponde aproximadamente a uma poça de sangue de 50 cm de diâmetro no lençol da puérpera?",
    "back": "Aproximadamente 500 mL de sangue",
    "comment": "Poça de 50 cm ≈ 500 mL; poça de 100 cm ou cama inteiramente encharcada ≈ 1.000 mL ou mais.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "estimativa",
        "perda",
        "sespe"
    ]
},
  {
    "id": "fc-hpp-79",
    "front": "O tempo máximo seguro para clampeamento do balão intrauterino de Bakri sem desinflar é de 24 horas, e sua profilaxia infecciosa requer cobertura com {{c1::antibioticoterapia (geralmente cefazolina ou ampicilina)}}.",
    "back": "Antibioticoterapia profilática",
    "comment": "Corpo estranho retido no útero puerperal com sangramento contínuo é meio de cultura ideal para bactérias anaeróbias e estreptococos.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "standard",
    "tags": [
        "bakri",
        "antibiotico",
        "infeccao"
    ]
},
  {
    "id": "fc-hpp-80",
    "front": "Quais as duas artérias pélvicas que NUNCA devem ser ligadas inadvertidamente durante a tentativa de hemostasia cirúrgica na HPP?",
    "back": "Artéria Ilíaca Comum e Artéria Ilíaca Externa",
    "comment": "A ligadura da ilíaca externa ou comum interrompe a irrigação arterial do membro inferior, provocando isquemia aguda e risco de amputação. Liga-se apenas a Ilíaca Interna (Hipogástrica).",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "priority": "essential",
    "tags": [
        "iliaca-comum",
        "iliaca-externa",
        "risco-isquemia"
    ]
}
];
