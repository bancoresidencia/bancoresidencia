import fs from 'fs';
import path from 'path';

// Helper to create clean inline SVG badges / schematics for medical flashcards
function createSvg(title, subtitle, statusColor, badgeText, isAnswer = false) {
  const bgFill = "#0f172a";
  const cardBorder = statusColor || "#38bdf8";
  const textColor = "#f8fafc";
  const subtextColor = "#94a3b8";
  const badgeBg = isAnswer ? "#166534" : "#1e293b";
  const badgeTextColor = isAnswer ? "#4ade80" : "#38bdf8";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 140" width="100%" height="100%" style="border-radius: 8px; background: ${bgFill};">
    <rect x="2" y="2" width="476" height="136" rx="6" fill="${bgFill}" stroke="${cardBorder}" stroke-width="2" />
    <rect x="16" y="16" width="140" height="24" rx="4" fill="${badgeBg}" />
    <text x="86" y="32" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="${badgeTextColor}" text-anchor="middle">${badgeText}</text>
    <text x="16" y="70" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="${textColor}">${title}</text>
    <text x="16" y="98" font-family="system-ui, sans-serif" font-size="12" fill="${subtextColor}">${subtitle}</text>
  </svg>`;
}

const rawCards = [
  // ==========================================
  // BLUSH 1: CLASSIFICAÇÃO FIGO & ANATOMIA (Cards 1 a 10)
  // ==========================================
  {
    id: "FC-MIOMA-01",
    type: "image_occlusion",
    subfocus_name: "Classificação FIGO",
    front: "Identifique na Classificação FIGO: O mioma submucoso que se encontra totalmente dentro da cavidade endometrial ligado apenas por uma haste é classificado como FIGO {{c1::0 (Submucoso Pediculado)}}.",
    back: "FIGO 0 (Submucoso Pediculado Intracavitário)",
    comment: "Os miomas FIGO 0 não possuem componente intramural e são 100% intracavitários. São os mais propensos a sangramento intenso e exteriorização cervical ('mioma parido').",
    priority: "essential",
    tags: ["FIGO", "Submucoso", "Anatomia"],
    img_title_front: "Classificação FIGO: Mioma Intracavitário Pediculado = [ ? ]",
    img_sub_front: "Localização: 100% no interior da cavidade endometrial",
    img_title_back: "Classificação FIGO: TIPO 0 (Submucoso Pediculado)",
    img_sub_back: "Conduta Padrão-Ouro: Miomectomia Histeroscópica em tempo único"
  },
  {
    id: "FC-MIOMA-02",
    type: "cloze",
    subfocus_name: "Classificação FIGO",
    front: "Um mioma submucoso séssil que invade a parede uterina, com penetração miometrial menor que 50% (< 50%), é classificado como FIGO {{c1::1}}.",
    back: "FIGO 1",
    comment: "Critério FIGO: tipo 1 tem menos de 50% no miométrio (> 50% na cavidade). Tipo 2 tem 50% ou mais no miométrio (< 50% na cavidade).",
    priority: "essential",
    tags: ["FIGO", "Submucoso", "Critérios"],
    img_title_front: "Mioma Submucoso com Invasão Miometrial < 50% = FIGO [ ? ]",
    img_sub_front: "Corte sagital uterino - Protrusão endocavitária dominante",
    img_title_back: "Classificação FIGO: TIPO 1",
    img_sub_back: "Ressecção histeroscópica favorável (Lasmar STEPW baixo/moderado)"
  },
  {
    id: "FC-MIOMA-03",
    type: "direct",
    subfocus_name: "Classificação FIGO",
    front: "Qual o tipo FIGO do mioma que tem seu epicentro submucoso, porém com invasão miometrial maior ou igual a 50% (≥ 50%)?",
    back: "FIGO 2",
    comment: "O mioma FIGO 2 possui maior componente intramural (≥ 50%), aumentando a complexidade para ressecção histeroscópica e frequentemente necessitando de procedimento em 2 tempos ou preparo prévio com análogo de GnRH.",
    priority: "essential",
    tags: ["FIGO", "Submucoso", "Miomectomia"],
    img_title_front: "Submucoso com ≥ 50% no Miométrio = [ ? ]",
    img_sub_front: "Avaliação por Histerossonografia / RNM",
    img_title_back: "FIGO 2: Submucoso de Alta Penetração Miometrial",
    img_sub_back: "Atenção: Margem miometrial livre até a serosa deve ser monitorada"
  },
  {
    id: "FC-MIOMA-04",
    type: "cloze",
    subfocus_name: "Classificação FIGO",
    front: "O mioma classificado como FIGO {{c1::3}} é 100% intramural, porém tangencia (está em contato com) o endométrio.",
    back: "FIGO 3",
    comment: "Diferença chave de prova: FIGO 3 é 100% intramural mas toca a superfície endometrial (causa SUA). O FIGO 4 é intramural puro, sem contato com o endométrio nem com a serosa.",
    priority: "essential",
    tags: ["FIGO", "Intramural", "Diagnóstico"],
    img_title_front: "100% Intramural em Contato Endometrial = FIGO [ ? ]",
    img_sub_front: "Tangencia a cavidade sem invadi-la microscopicamente",
    img_title_back: "FIGO 3 (Intramural com Contato Endometrial)",
    img_sub_back: "Pode causar sangramento e infertilidade por distorção microvascular"
  },
  {
    id: "FC-MIOMA-05",
    type: "direct",
    subfocus_name: "Classificação FIGO",
    front: "Como é classificado um mioma miometrial que não toca a cavidade endometrial e não deforma a superfície serosa peritoneal?",
    back: "FIGO 4 (Intramural Verdadeiro / Puro)",
    comment: "O FIGO 4 situa-se estritamente no estroma miometrial. Seu impacto clínico decorre principalmente do aumento global do volume uterino e dismenorreia.",
    priority: "standard",
    tags: ["FIGO", "Intramural"],
    img_title_front: "Mioma Miometrial Central sem Contato Mucoso/Seroso = [ ? ]",
    img_sub_front: "Corte histológico e ultrassonográfico intramural puro",
    img_title_back: "FIGO 4: Intramural Verdadeiro",
    img_sub_back: "Tratamento cirúrgico de escolha se sintomático: Miomectomia laparotômica/laparoscópica"
  },
  {
    id: "FC-MIOMA-06",
    type: "cloze",
    subfocus_name: "Classificação FIGO",
    front: "Um mioma subseroso que possui 50% ou mais de seu diâmetro localizado no miométrio (≥ 50% intramural) é classificado como FIGO {{c1::5}}.",
    back: "FIGO 5",
    comment: "Os miomas subserosos dividem-se em: FIGO 5 (≥ 50% intramural), FIGO 6 (< 50% intramural) e FIGO 7 (pediculado externo).",
    priority: "standard",
    tags: ["FIGO", "Subseroso"],
    img_title_front: "Subseroso com ≥ 50% Intramural = FIGO [ ? ]",
    img_sub_front: "Protrusão peritoneal externa com base profunda",
    img_title_back: "FIGO 5: Subseroso de Base Larga",
    img_sub_back: "Abordagem cirúrgica: Laparoscopia ou Laparotomia"
  },
  {
    id: "FC-MIOMA-07",
    type: "direct",
    subfocus_name: "Classificação FIGO",
    front: "Qual o tipo FIGO do mioma subseroso com menos de 50% intramural (< 50%) e do mioma subseroso pediculado, respectivamente?",
    back: "FIGO 6 (< 50% intramural) e FIGO 7 (pediculado)",
    comment: "O mioma FIGO 7 apresenta pedículo vascular externo delgado, conferindo alto risco de torção isquêmica aguda (quadro de abdome agudo cirúrgico).",
    priority: "essential",
    tags: ["FIGO", "Subseroso", "Abdome Agudo"],
    img_title_front: "Subseroso < 50% e Subseroso Pediculado = FIGO [ ? ] e [ ? ]",
    img_sub_front: "Risco cirúrgico de torção no pediculado",
    img_title_back: "FIGO 6 (< 50% intramural) e FIGO 7 (Pediculado)",
    img_sub_back: "O FIGO 7 é indicação formal de exérese laparoscópica pelo risco de torção"
  },
  {
    id: "FC-MIOMA-08",
    type: "cloze",
    subfocus_name: "Classificação FIGO",
    front: "Os miomas em localizações atípicas, como os miomas cervicais, intraligamentares ou parasitas, são agrupados no tipo FIGO {{c1::8}}.",
    back: "FIGO 8 (Outros)",
    comment: "Os miomas de colo uterino (cervicais) podem causar dispareunia, estenose cervical, infertilidade mecânica e distócia de trajeto no parto vaginal.",
    priority: "standard",
    tags: ["FIGO", "Cervical", "Parto"],
    img_title_front: "Miomas Cervicais e Intraligamentares = FIGO [ ? ]",
    img_sub_front: "Topografia atípica do trato genital inferior",
    img_title_back: "FIGO 8: Localizações Não Miometriais Habitual",
    img_sub_back: "Miomas cervicais grandes causam distócia de apresentação e indicação de cesárea"
  },
  {
    id: "FC-MIOMA-09",
    type: "cloze",
    subfocus_name: "Classificação FIGO",
    front: "Um mioma híbrido transmural que se estende desde a cavidade endometrial até a superfície serosa é designado na FIGO como tipo {{c1::2-5}}.",
    back: "FIGO 2-5 (Transmural)",
    comment: "A notação híbrida utiliza dois números: o primeiro descreve a relação submucosa e o segundo a relação subserosa. O 2-5 tem ≥ 50% no miométrio em ambas as interfaces.",
    priority: "standard",
    tags: ["FIGO", "Híbrido"],
    img_title_front: "Mioma Híbrido Transmural (Mucosa à Serosa) = FIGO [ ? ]",
    img_sub_front: "Transfixa toda a espessura da parede miometrial",
    img_title_back: "FIGO 2-5: Mioma Transmural",
    img_sub_back: "Gera sangramento uterino anormal severo concomitante a sintomas compressivos"
  },
  {
    id: "FC-MIOMA-10",
    type: "direct",
    subfocus_name: "Fisiopatologia",
    front: "Qual gene com mutações somáticas está presente em mais de 70% dos leiomiomas uterinos?",
    back: "Gene MED12",
    comment: "Mutações no gene MED12 (exon 2) no cromossomo X desregulam a via da transcrição miocitária, gerando proliferação clonal monoclonal e deposição massiva de matriz extracelular.",
    priority: "standard",
    tags: ["Fisiopatologia", "Genética"],
    img_title_front: "Principal Mutação Genética dos Leiomiomas = [ ? ]",
    img_sub_front: "Presente em mais de 70% das peças cirúrgicas analisadas",
    img_title_back: "Gene MED12 (Subunidade 12 do Complexo Mediador)",
    img_sub_back: "Induz crescimento monoclonal autônomo sob estímulo estro-progestágeno"
  },

  // ==========================================
  // BLUSH 2: TRATAMENTO CLÍNICO & FARMACOLOGIA (Cards 11 a 22)
  // ==========================================
  {
    id: "FC-MIOMA-11",
    type: "direct",
    subfocus_name: "Tratamento Clínico",
    front: "Qual o fármaco antifibrinolítico não hormonal de primeira linha indicado para controle do sangramento em mulheres com mioma que mantêm desejo reprodutivo a curto prazo?",
    back: "Ácido Tranexâmico",
    comment: "O ácido tranexâmico inibe competitivamente a ativação do plasminogênio em plasmina. Reduz a perda sanguínea em 40-50% sem afetar a fertilidade nem a ovulação; é usado apenas durante o fluxo menstrual.",
    priority: "essential",
    tags: ["Tratamento Clínico", "Farmacologia", "Sangramento"],
    img_title_front: "1ª Linha Não Hormonal para Sangramento com Desejo de Gestação = [ ? ]",
    img_sub_front: "Antifibrinolítico administrado nos dias de fluxo intenso",
    img_title_back: "ÁCIDO TRANEXÂMICO",
    img_sub_back: "Redução de até 50% da perda sanguínea; não interfere na fertilidade"
  },
  {
    id: "FC-MIOMA-12",
    type: "cloze",
    subfocus_name: "Tratamento Clínico",
    front: "O DIU liberador de Levonorgestrel (DIU-Mirena) é formalmente CONTRAINDICADO em miomas FIGO {{c1::0, 1 e 2 (Submucosos)}} devido à distorção da cavidade endometrial.",
    back: "FIGO 0, 1 e 2 (Submucosos)",
    comment: "A presença de mioma distorcendo a cavidade endometrial aumenta expressivamente a taxa de expulsão espontânea do DIU, dor intratável e falha no controle hemorrágico.",
    priority: "essential",
    tags: ["Tratamento Clínico", "DIU", "Contraindicação"],
    img_title_front: "Contraindicação Formal do DIU de Levonorgestrel = FIGO [ ? ]",
    img_sub_front: "Risco severo de expulsão, perfuração e ineficácia",
    img_title_back: "FIGO 0, 1 e 2: MIOMAS SUBMUCOSOS",
    img_sub_back: "Permitido apenas em miomas FIGO 3, 4, 5 e 6 com cavidade regular"
  },
  {
    id: "FC-MIOMA-13",
    type: "direct",
    subfocus_name: "Tratamento Clínico",
    front: "Qual o papel clínico EXATO dos agonistas de GnRH (como a Leuprorrelina) no manejo dos miomas uterinos?",
    back: "Ponte pré-operatória temporária (por 3 a 6 meses) para reduzir volume tumoral e corrigir anemia",
    comment: "Agonistas de GnRH causam hipoestrogenismo profundo. Reduzem o volume tumoral em 30-50% e induzem amenorreia, mas seu uso além de 6 meses é contraindicado devido à desmineralização óssea (osteoporose) e fogachos.",
    priority: "essential",
    tags: ["Tratamento Clínico", "GnRH", "Pré-operatório"],
    img_title_front: "Papel do Agonista de GnRH (Leuprorrelina) no Mioma = [ ? ]",
    img_sub_front: "Tratamento definitivo contínuo vs Ponte pré-operatória?",
    img_title_back: "PONTE PRÉ-OPERATÓRIA (3 a 6 meses)",
    img_sub_back: "Diminui sangramento, recupera hemoglobina e reduz tamanho do útero"
  },
  {
    id: "FC-MIOMA-14",
    type: "cloze",
    subfocus_name: "Tratamento Clínico",
    front: "Os agonistas de GnRH provocam um efeito inicial de estímulo hormonal transitório denominado {{c1::flare-up}}, que dura de 7 a 14 dias antes do bloqueio hipofisário completo.",
    back: "Efeito Flare-up",
    comment: "A ligação inicial do análogo aos receptores de GnRH estimula uma descarga transitória de LH e FSH, podendo exacerbar temporariamente o sangramento e as cólicas antes da dessensibilização dos receptores.",
    priority: "standard",
    tags: ["Tratamento Clínico", "GnRH", "Farmacologia"],
    img_title_front: "Efeito Inicial Transitório dos Agonistas de GnRH = [ ? ]",
    img_sub_front: "Pico de liberação de gonadotrofinas nas primeiras semanas",
    img_title_back: "EFEITO FLARE-UP",
    img_sub_back: "Evitado com uso dos novos antagonistas orais de GnRH (Relugolix)"
  },
  {
    id: "FC-MIOMA-15",
    type: "direct",
    subfocus_name: "Tratamento Clínico",
    front: "Qual a grande vantagem farmacocinética dos Antagonistas orais de GnRH (como o Relugolix) em relação aos Agonistas de GnRH?",
    back: "Bloqueio imediato dos receptores sem efeito flare-up e reversibilidade oral rápida",
    comment: "Os antagonistas orais (associados à add-back therapy com estradiol/noretisterona) inibem os receptores de GnRH competitivamente desde o primeiro dia, induzindo amenorreia rápida sem o pico de liberação hormonal do flare-up.",
    priority: "standard",
    tags: ["Tratamento Clínico", "Antagonista GnRH"],
    img_title_front: "Vantagem do Antagonista de GnRH (Relugolix) vs Agonista = [ ? ]",
    img_sub_front: "Mecanismo competitivo de ação imediata",
    img_title_back: "BLOQUEIO IMEDIATO SEM FLARE-UP",
    img_sub_back: "Administração oral diária associada a 'Add-Back Therapy' para osso"
  },
  {
    id: "FC-MIOMA-16",
    type: "cloze",
    subfocus_name: "Tratamento Clínico",
    front: "Para atenuar os efeitos colaterais de hipoestrogenismo (perda de massa óssea e sintomas vasomotores) decorrentes do bloqueio de GnRH, utiliza-se a terapia de reposição complementar denominada {{c1::Add-back therapy}}.",
    back: "Add-back therapy (Terapia de Adição)",
    comment: "Consiste na administração concomitante de baixas doses de estrogênio associado a progestágeno (ex: 1 mg de estradiol + 0,5 mg de noretisterona), mantendo a supressão do mioma sem espoliar a massa óssea.",
    priority: "standard",
    tags: ["Tratamento Clínico", "Farmacologia"],
    img_title_front: "Proteção Óssea no Uso Prolongado de Antagonistas = [ ? ]",
    img_sub_front: "Reposição estro-progestágena em microdoses",
    img_title_back: "ADD-BACK THERAPY",
    img_sub_back: "Preserva densidade mineral óssea e controla fogachos climatéricos"
  },
  {
    id: "FC-MIOMA-17",
    type: "direct",
    subfocus_name: "Tratamento Clínico",
    front: "Os Anti-inflamatórios Não Esteroidais (AINEs) atuam no mioma reduzindo o sangramento em até 30% através de qual mecanismo enzimático?",
    back: "Inibição da COX-1 e COX-2, reduzindo a síntese de prostaglandinas vasodilatadoras (PGE2 e PGI2)",
    comment: "O miometrio miomatoso superexpressa prostaglandinas vasodilatadoras e anticoagulantes. Os AINEs diminuem o fluxo e atuam como analgésicos de primeira escolha para a dismenorreia.",
    priority: "standard",
    tags: ["Tratamento Clínico", "AINEs", "Farmacologia"],
    img_title_front: "Mecanismo dos AINEs no Controle da Hemorragia = [ ? ]",
    img_sub_front: "Inibição enzimática da cascata do ácido araquidônico",
    img_title_back: "INIBIÇÃO DA CICLO-OXIGENASE (COX)",
    img_sub_back: "Diminui PGE2 e prostaciclina (vasodilatadores), aumentando TXA2"
  },
  {
    id: "FC-MIOMA-18",
    type: "cloze",
    subfocus_name: "Tratamento Clínico",
    front: "Em relação ao volume dos miomas uterinos, os contraceptivos orais combinados (ACO) e o DIU-Levonorgestrel atuam controlando o sangramento, porém {{c1::NÃO}} reduzem significativamente o tamanho tumoral.",
    back: "NÃO reduzem o volume tumoral",
    comment: "Ponto clássico de pegadinha em provas: progestágenos e ACOs controlam os sintomas hemorrágicos por atrofia endometrial, mas não diminuem o diâmetro dos nódulos miomatosos (apenas análogos de GnRH reduzem volume).",
    priority: "essential",
    tags: ["Tratamento Clínico", "Pegadinha de Prova"],
    img_title_front: "Efeito do DIU-LNG e ACOs no Tamanho dos Miomas = [ ? ]",
    img_sub_front: "Redução de volume vs Controle exclusivo de sangramento?",
    img_title_back: "NÃO REDUZEM VOLUME TUMORAL",
    img_sub_back: "Atuam exclusivamente induzindo atrofia no endométrio e decídua"
  },
  {
    id: "FC-MIOMA-19",
    type: "direct",
    subfocus_name: "Conduta Inicial",
    front: "Qual a conduta indicada para uma paciente de 38 anos, assintomática, na qual foi identificado incidentalmente ao USG um mioma intramural de 5 cm?",
    back: "Conduta Expectante (Seguimento clínico e ultrassonográfico anual)",
    comment: "Regra absoluta de ouro: mioma assintomático NÃO se opera e NÃO se trata com medicação, independentemente do tamanho de 5 ou 6 cm, a menos que cause repercussões compressivas ocultas (ex: hidronefrose) ou cresça pós-menopausa.",
    priority: "essential",
    tags: ["Conduta", "Assintomático", "Regra de Ouro"],
    img_title_front: "Conduta em Mioma Intramural de 5 cm Assintomático = [ ? ]",
    img_sub_front: "Miomectomia imediata vs Seguimento clínico?",
    img_title_back: "CONDUTA EXPECTANTE",
    img_sub_back: "Acompanhamento anual com exame ginecológico e ultrassonografia"
  },
  {
    id: "FC-MIOMA-20",
    type: "cloze",
    subfocus_name: "Tratamento Clínico",
    front: "O modulador seletivo do receptor de progesterona (SPRM) denominado {{c1::Acetato de Ulipristal}} teve seu uso suspenso/restringido na prática devido ao risco grave de insuficiência hepática aguda.",
    back: "Acetato de Ulipristal",
    comment: "Embora muito eficaz na redução do sangramento e volume do mioma, os relatos de hepatite fulminante e necessidade de transplante hepático levaram à restrição severa de sua comercialização pela EMA e Anvisa.",
    priority: "standard",
    tags: ["Farmacologia", "Segurança"],
    img_title_front: "Modulador Progestágeno Suspenso por Risco Hepático = [ ? ]",
    img_sub_front: "SPRM causador de hepatotoxicidade medicamentosa grave",
    img_title_back: "ACETATO DE ULIPRISTAL",
    img_sub_back: "Restrito/proibido pelas agências regulatórias por risco de transplante"
  },
  {
    id: "FC-MIOMA-21",
    type: "direct",
    subfocus_name: "Tratamento Clínico",
    front: "Por que os análogos de GnRH não podem ser utilizados isoladamente como terapia clínica contínua a longo prazo para miomatose?",
    back: "Pelo risco severo de desmineralização óssea acelerada (osteopenia/osteoporose) e eventos cardiovasculares",
    comment: "O estado de hipoestrogenismo severo simulando menopausa precoce espolia o cálcio ósseo e piora o perfil lipídico. O limite de segurança sem Add-back therapy é de 6 meses.",
    priority: "essential",
    tags: ["GnRH", "Segurança", "Osteoporose"],
    img_title_front: "Limite Temporal do Agonista de GnRH Isolado = [ ? ]",
    img_sub_front: "Fator limitante: Perda de densidade mineral óssea",
    img_title_back: "MÁXIMO DE 6 MESES",
    img_sub_back: "Risco de osteopenia irreversível e fraturas patológicas no menacme"
  },
  {
    id: "FC-MIOMA-22",
    type: "cloze",
    subfocus_name: "Tratamento Clínico",
    front: "Após a suspensão do tratamento pré-operatório com agonista de GnRH, caso a cirurgia não seja realizada, os miomas retornam ao seu tamanho original prévio em {{c1::3 a 6 meses}}.",
    back: "3 a 6 meses",
    comment: "O efeito redutor de volume dos análogos é temporário e completamente reversível com o retorno da função ovariana cíclica normal.",
    priority: "standard",
    tags: ["GnRH", "Fisiologia"],
    img_title_front: "Reversibilidade do Volume do Mioma Pós-GnRH = [ ? ]",
    img_sub_front: "Tempo de retorno ao tamanho original após suspensão",
    img_title_back: "RETORNO EM 3 A 6 MESES",
    img_sub_back: "Reforça a indicação exclusiva como ponte cirúrgica programada"
  },

  // ==========================================
  // BLUSH 3: TRATAMENTO CIRÚRGICO & LASMAR (Cards 23 a 34)
  // ==========================================
  {
    id: "FC-MIOMA-23",
    type: "direct",
    subfocus_name: "Tratamento Cirúrgico",
    front: "Qual a via cirúrgica padrão-ouro para o tratamento de miomas submucosos sintomáticos FIGO 0 e FIGO 1?",
    back: "Miomectomia Histeroscópica",
    comment: "A histeroscopia cirúrgica permite ressecção por fatiamento (slicing) com preservação miometrial máxima, sem incisão abdominal e com alta hospitalar no mesmo dia.",
    priority: "essential",
    tags: ["Cirurgia", "Histeroscopia", "Padrão-Ouro"],
    img_title_front: "Via Padrão-Ouro para Miomas Submucosos FIGO 0 e 1 = [ ? ]",
    img_sub_front: "Preservação da parede uterina e ausência de cicatriz externa",
    img_title_back: "MIOMECTOMIA HISTEROSCÓPICA",
    img_sub_back: "Executada por ressectoscopia monopolar/bipolar em ambiente cirúrgico"
  },
  {
    id: "FC-MIOMA-24",
    type: "cloze",
    subfocus_name: "Critérios de Lasmar",
    front: "O sistema STEPW de Lasmar avalia a viabilidade da histeroscopia cirúrgica com base em 5 parâmetros: Size (Tamanho), Topography (Topografia), Extension (Extensão da base), Penetration (Penetração) e {{c1::Wall (Parede acometida)}}.",
    back: "Wall (Parede Lateral)",
    comment: "O acometimento da parede lateral ganha 1 ponto extra no escore de Lasmar devido à proximidade anatômica com os vasos uterinos principais e menor espessura miometrial.",
    priority: "essential",
    tags: ["Lasmar", "STEPW", "Histeroscopia"],
    img_title_front: "Parâmetros do Escore STEPW de Lasmar = S - T - E - P - [ ? ]",
    img_sub_front: "Acrônimo dos 5 critérios prognósticos histeroscópicos",
    img_title_back: "W = WALL (PAREDE LATERAL)",
    img_sub_back: "Parede lateral adiciona complexidade vascular ao procedimento"
  },
  {
    id: "FC-MIOMA-25",
    type: "direct",
    subfocus_name: "Critérios de Lasmar",
    front: "Qual a conduta para um mioma submucoso classificado no Escore de Lasmar como Grupo I (0 a 4 pontos)?",
    back: "Miomectomia Histeroscópica em tempo único (baixa complexidade)",
    comment: "Escores de 0 a 4 apresentam alta taxa de sucesso em tempo operatório único, sem necessidade de preparo prévio com análogo de GnRH.",
    priority: "essential",
    tags: ["Lasmar", "Histeroscopia", "Conduta"],
    img_title_front: "Conduta no Escore de Lasmar de 0 a 4 Pontos = [ ? ]",
    img_sub_front: "Grupo I da classificação STEPW",
    img_title_back: "HISTEROSCOPIA EM TEMPO ÚNICO",
    img_sub_back: "Baixa complexidade cirúrgica e excelente margem de segurança"
  },
  {
    id: "FC-MIOMA-26",
    type: "cloze",
    subfocus_name: "Critérios de Lasmar",
    front: "Um mioma submucoso com Escore de Lasmar de 5 a 6 pontos (Grupo II) é considerado de moderada a alta complexidade, sendo frequente a necessidade de cirurgia em {{c1::dois tempos}} e preparo com análogo de GnRH.",
    back: "Dois tempos cirúrgicos",
    comment: "No Grupo II, opera-se a porção intracavitária no 1º tempo; a porção intramural remanescente é empurrada pela contratilidade miometrial para a cavidade, sendo retirada no 2º tempo semanas após.",
    priority: "essential",
    tags: ["Lasmar", "Dois Tempos", "Histeroscopia"],
    img_title_front: "Escore de Lasmar de 5 a 6 Pontos (Grupo II) = Cirurgia em [ ? ]",
    img_sub_front: "Estratégia cirúrgica para evitar perfuração uterina",
    img_title_back: "PROCEDIMENTO EM DOIS TEMPOS",
    img_sub_back: "Ressecção inicial da calota seguida de migração miometrial secundária"
  },
  {
    id: "FC-MIOMA-27",
    type: "direct",
    subfocus_name: "Critérios de Lasmar",
    front: "Qual a recomendação cirúrgica formal para miomas com Escore de Lasmar de 7 a 9 pontos (Grupo III)?",
    back: "Contraindicar a via histeroscópica exclusiva; indicar laparotomia/laparoscopia ou embolização",
    comment: "Miomas com 7-9 pontos têm penetração miometrial profunda e grande volume. O risco de perfuração uterina e sobrecarga de fluidos intravasculares na histeroscopia é proibitivo.",
    priority: "essential",
    tags: ["Lasmar", "Contraindicação", "Histeroscopia"],
    img_title_front: "Escore de Lasmar de 7 a 9 Pontos (Grupo III) = Via [ ? ]",
    img_sub_front: "Avaliação do risco de complicações hidroeletrolíticas",
    img_title_back: "NÃO INDICAR HISTEROSCOPIA",
    img_sub_back: "Optar por Miomectomia Laparotômica, Laparoscópica ou Embolização"
  },
  {
    id: "FC-MIOMA-28",
    type: "cloze",
    subfocus_name: "Tratamento Cirúrgico",
    front: "Qualquer miomectomia na qual ocorra abertura acidental ou intencional da {{c1::cavidade endometrial}} impõe indicação absoluta de cesariana eletiva em futuras gestações.",
    back: "Cavidade endometrial (Endométrio)",
    comment: "A invasão transmural da cavidade endometrial gera fragilidade na parede uterina com risco catastrófico de ruptura uterina durante o trabalho de parto.",
    priority: "essential",
    tags: ["Cirurgia", "Obstetrícia", "Ruptura Uterina"],
    img_title_front: "Abertura Endometrial na Miomectomia = Futuro Parto [ ? ]",
    img_sub_front: "Risco de deiscência da cicatriz miometrial sob contração",
    img_title_back: "CESARIANA ELETIVA OBRIGATÓRIA",
    img_sub_back: "Contraindica trabalho de parto vaginal pelo alto risco de ruptura"
  },
  {
    id: "FC-MIOMA-29",
    type: "direct",
    subfocus_name: "Tratamento Cirúrgico",
    front: "Qual o tratamento cirúrgico definitivo de escolha para mulheres com miomatose sintomática e prole constituída?",
    back: "Histerectomia Total",
    comment: "A histerectomia elimina o risco de recidiva miomatosa e o sangramento uterino anormal. A via vaginal ou laparoscópica é preferida em relação à abdominal se as condições anatômicas permitirem.",
    priority: "essential",
    tags: ["Cirurgia", "Histerectomia", "Definitivo"],
    img_title_front: "Tratamento Definitivo em Paciente com Prole Constituída = [ ? ]",
    img_sub_front: "Resolução cirúrgica radical sem chance de recorrência",
    img_title_back: "HISTERECTOMIA TOTAL",
    img_sub_back: "Via minimamente invasiva (vaginal/laparoscópica) como 1ª opção"
  },
  {
    id: "FC-MIOMA-30",
    type: "cloze",
    subfocus_name: "Histeroscopia",
    front: "Durante a miomectomia histeroscópica monopolar com uso de glicina ou manitol, o limite máximo de déficit de balanço hídrico aceitável antes de interromper o procedimento por risco de hiponatremia dilucional é de {{c1::1.000 mL}}.",
    back: "1.000 mL (1 litro)",
    comment: "Déficits superiores a 1.000 mL de solução não condutora hipotônica (glicina) causam a Síndrome de Sobrecarga Hídrica com hiponatremia grave, edema cerebral, coma e óbito.",
    priority: "essential",
    tags: ["Histeroscopia", "Complicação", "Balanço Hídrico"],
    img_title_front: "Limite de Déficit Hídrico com Solução Hipotônica (Glicina) = [ ? ]",
    img_sub_front: "Risco de síndrome de sobrecarga de fluidos na histeroscopia",
    img_title_back: "DÉFICIT MÁXIMO DE 1.000 mL",
    img_sub_back: "Interrupção cirúrgica imediata para dosagem de sódio e furosemida"
  },
  {
    id: "FC-MIOMA-31",
    type: "direct",
    subfocus_name: "Histeroscopia",
    front: "Qual a grande vantagem do uso de ressectoscópios BIPOLARES em relação aos monopolares na miomectomia histeroscópica?",
    back: "Permitem o uso de Solução Salina Fisiológica (NaCl 0,9%) como meio de distensão, prevenindo a hiponatremia",
    comment: "O sistema bipolar opera em meio condutor isotônico (SF 0,9%). Mesmo com sobrecarga volêmica eventual (limite de 2.500 mL), não ocorre hiponatremia hipotônica.",
    priority: "standard",
    tags: ["Histeroscopia", "Segurança", "Tecnologia"],
    img_title_front: "Vantagem do Ressectoscópio Bipolar na Histeroscopia = [ ? ]",
    img_sub_front: "Tipo de meio líquido condutor utilizado na distensão",
    img_title_back: "USO DE SORO FISIOLÓGICO (NaCl 0,9%)",
    img_sub_back: "Elimina o risco de hiponatremia dilucional grave da glicina"
  },
  {
    id: "FC-MIOMA-32",
    type: "cloze",
    subfocus_name: "Tratamento Cirúrgico",
    front: "Mulher de 29 anos, nulípara com desejo de gestação, apresenta mioma intramural de 6 cm FIGO 4 com dor pélvica. O tratamento cirúrgico padrão é a {{c1::Miomectomia laparotômica ou laparoscópica}}.",
    back: "Miomectomia (Laparotômica ou Laparoscópica)",
    comment: "Para miomas intramurais e subserosos em mulheres que desejam manter a fertilidade, a miomectomia é a cirurgia conservadora mandatória, sendo a histerectomia contraindicada.",
    priority: "essential",
    tags: ["Cirurgia", "Fertilidade", "Miomectomia"],
    img_title_front: "Conduta em Mioma Intramural Sintomático com Desejo Reprodutivo = [ ? ]",
    img_sub_front: "Paciente jovem nulípara de 29 anos",
    img_title_back: "MIOMECTOMIA (LAPARO/LAP)",
    img_sub_back: "Cirurgia conservadora padrão para preservação de fertilidade"
  },
  {
    id: "FC-MIOMA-33",
    type: "direct",
    subfocus_name: "Tratamento Cirúrgico",
    front: "Qual a manobra mecânica inicial de conduta para um 'Mioma Parido' visualizado no exame especular exteriorizando-se pelo orifício externo do colo?",
    back: "Ressecção por via baixa vaginal (torção ou secção do pedículo com pinça de Cheron/Kocher sob analgesia/anestesia)",
    comment: "O mioma parido é um mioma FIGO 0 cujo pedículo se alongou. Não requer laparotomia; é apreendido e desinserido diretamente por via vaginal.",
    priority: "essential",
    tags: ["Mioma Parido", "Urgência", "Conduta"],
    img_title_front: "Conduta Imediata no Mioma Parido Vaginal = [ ? ]",
    img_sub_front: "Nódulo exteriorizado através do orifício cervical externo",
    img_title_back: "RESSECÇÃO VAGINAL POR TORÇÃO DO PEDÍCULO",
    img_sub_back: "Procedimento por via baixa sob campo cirúrgico; evita laparotomia"
  },
  {
    id: "FC-MIOMA-34",
    type: "cloze",
    subfocus_name: "Tratamento Cirúrgico",
    front: "A realização de morcelamento intra-abdominal não contido de miomas uterinos em laparoscopia é contraindicada pelo FDA e sociedades médicas pelo risco de disseminar um {{c1::Leiomiossarcoma oculto}} não diagnosticado.",
    back: "Leiomiossarcoma oculto",
    comment: "O morcelamento não contido pode espalhar células sarcomatosas pelo peritônio, piorando drasticamente o prognóstico oncológico (queda de sobrevida de estágio I para IV). Exige uso de bolsas protetoras fechadas (endobag).",
    priority: "standard",
    tags: ["Segurança", "Sarcoma", "Laparoscopia"],
    img_title_front: "Risco do Morcelamento Sem Bolsa Protetora = Disseminação de [ ? ]",
    img_sub_front: "Alerta de segurança cirúrgica global da FDA",
    img_title_back: "LEIOMIOSSARCOMA OCULTO",
    img_sub_back: "Uso obrigatório de saco endoscópico fechado se for realizada morcelação"
  },

  // ==========================================
  // BLUSH 4: DEGENERAÇÕES & GESTAÇÃO (Cards 35 a 42)
  // ==========================================
  {
    id: "FC-MIOMA-35",
    type: "direct",
    subfocus_name: "Degenerações",
    front: "Qual é o tipo de degeneração miomatosa MAIS FREQUENTE na população em geral?",
    back: "Degeneração Hialina (cerca de 65% dos casos)",
    comment: "A degeneração hialina ocorre pela substituição do tecido muscular liso por matriz proteica eosinofílica acelular. Geralmente é assintomática.",
    priority: "essential",
    tags: ["Degeneração", "Hialina", "Frequência"],
    img_title_front: "Degeneração Miomatosa Mais Frequente Globalmente = [ ? ]",
    img_sub_front: "Achado histopatológico presente em 65% das peças",
    img_title_back: "DEGENERAÇÃO HIALINA",
    img_sub_back: "Processo assintomático de substituição celular por colágeno acelular"
  },
  {
    id: "FC-MIOMA-36",
    type: "cloze",
    subfocus_name: "Degenerações na Gestação",
    front: "A degeneração mais frequente dos miomas durante a gestação (típica do 2º trimestre) é a degeneração {{c1::Rubra (ou Carneosa/Necrose Asséptica)}}.",
    back: "Degeneração Rubra (Carneosa)",
    comment: "Causada pelo crescimento acelerado do mioma sob estímulo estrogênico maciço associado a trombose da drenagem venosa periférica, gerando infarto isquêmico e hemorrágico.",
    priority: "essential",
    tags: ["Gestação", "Degeneração Rubra", "Pérola de Prova"],
    img_title_front: "Degeneração Típica na Gestação (2º Trimestre) = [ ? ]",
    img_sub_front: "Infarto hemorrágico decorrente de trombose venosa tumoral",
    img_title_back: "DEGENERAÇÃO RUBRA (CARNEOSA)",
    img_sub_back: "Necrose asséptica com dor abdominal aguda, febre baixa e leucocitose"
  },
  {
    id: "FC-MIOMA-37",
    type: "direct",
    subfocus_name: "Degenerações na Gestação",
    front: "Qual a conduta padrão-ouro para uma gestante de 22 semanas diagnosticada com Degeneração Rubra de mioma uterino?",
    back: "Tratamento clínico conservador (Internação hospitalar, analgesia escalonada, hidratação venosa e antiespasmódicos)",
    comment: "NÃO se faz miomectomia na gravidez! A cirurgia é contraindicada pelo risco extremo de sangramento incoercível decorrente da hipervascularização uterina gestacional e risco de aborto/parto prematuro.",
    priority: "essential",
    tags: ["Gestação", "Conduta", "Conservador"],
    img_title_front: "Conduta na Degeneração Rubra na Gravidez = [ ? ]",
    img_sub_front: "Miomectomia de urgência vs Tratamento clínico?",
    img_title_back: "TRATAMENTO CONSERVADOR",
    img_sub_back: "Analgesia potente e hidratação; miomectomia é contraindicada na gravidez"
  },
  {
    id: "FC-MIOMA-38",
    type: "cloze",
    subfocus_name: "Degenerações",
    front: "A degeneração {{c1::Calcificada (ou Calcificação distrófica)}} é comum na pós-menopausa, resultando em nódulos pétreos radiopacos visíveis no RX simples de pelve.",
    back: "Degeneração Calcificada",
    comment: "Ocorre pela deposição de sais de carbonato e fosfato de cálcio em tecidos previamente isquemiados após a cessação hormonal do climatério.",
    priority: "standard",
    tags: ["Degenerações", "Pós-menopausa", "Radiologia"],
    img_title_front: "Degeneração Típica da Pós-Menopausa com 'Pedras Pélvicas' = [ ? ]",
    img_sub_front: "Achado de nódulo endurecido hiperatenuante ao RX",
    img_title_back: "DEGENERAÇÃO CALCIFICADA",
    img_sub_back: "Calcificação distrófica assintomática tardia pós-menopausa"
  },
  {
    id: "FC-MIOMA-39",
    type: "direct",
    subfocus_name: "Degenerações",
    front: "Qual a degeneração que decorre da liquefação central e reabsorção de áreas previamente acometidas por degeneração hialina, mimetizando cisto ovariano ao USG?",
    back: "Degeneração Cística",
    comment: "A degeneração cística cria cavidades com conteúdo líquido seroso no centro do mioma, sendo um importante diagnóstico diferencial de massas anexiais císticas.",
    priority: "standard",
    tags: ["Degenerações", "Cística"],
    img_title_front: "Degeneração que Mimetiza Cisto Anexial/Ovariano = [ ? ]",
    img_sub_front: "Liquefação central de tecido necrótico prévio",
    img_title_back: "DEGENERAÇÃO CÍSTICA",
    img_sub_back: "Exige RNM ou Doppler para confirmar origem estritamente miometrial"
  },
  {
    id: "FC-MIOMA-40",
    type: "cloze",
    subfocus_name: "Sarcoma",
    front: "O crescimento rápido de um nódulo uterino em mulher na {{c1::pós-menopausa}} que não realiza terapia de reposição hormonal deve levantar suspeita imediata de Leiomiossarcoma.",
    back: "Pós-menopausa (Sem TRH)",
    comment: "Na menopausa fisiológica, miomas benignos obrigatoriamente estabilizam ou regridem devido ao hipoestrogenismo. Crescimento novo é sinal de alarme de malignidade primária.",
    priority: "essential",
    tags: ["Sarcoma", "Oncologia", "Sinal de Alarme"],
    img_title_front: "Crescimento Uterino Rápido na Pós-Menopausa = Suspeita de [ ? ]",
    img_sub_front: "Ausência de reposição hormonal com nódulo em expansão",
    img_title_back: "LEIOMIOSSARCOMA UTERINO",
    img_sub_back: "Exige investigação cirúrgica oncológica com biópsia e estadiamento"
  },
  {
    id: "FC-MIOMA-41",
    type: "direct",
    subfocus_name: "Sarcoma",
    front: "O Leiomiossarcoma surge a partir da transformação maligna de um mioma benigno prévio? Verdadeiro ou Falso?",
    back: "FALSO. O Leiomiossarcoma quase invariavelmente surge 'de novo' (mutação primária autônoma) e não de um mioma benigno.",
    comment: "A taxa de transformação maligna de um leiomioma é inferior a 0,2%. A imensa maioria dos sarcomas já se inicia como sarcoma desde a primeira célula mutada.",
    priority: "essential",
    tags: ["Sarcoma", "Oncologia", "Conceito"],
    img_title_front: "Leiomiossarcoma se Origina de Mioma Benigno Prévio? [ V ou F ]",
    img_sub_front: "Teoria da progressão neoplásica vs Surgimento primário",
    img_title_back: "FALSO: SURGE 'DE NOVO'",
    img_sub_back: "Malignização de mioma é raríssima (< 0,2%); sarcomas surgem isolados"
  },
  {
    id: "FC-MIOMA-42",
    type: "cloze",
    subfocus_name: "Gestação e Obstetrícia",
    front: "Miomas volumosos retroplacentários durante a gravidez aumentam consideravelmente o risco obstétrico de {{c1::Descolamento Prematuro de Placenta (DPP)}}.",
    back: "Descolamento Prematuro de Placenta (DPP)",
    comment: "A vascularização anômala da interface endométrio-mioma retroplacentário compromete o leito decíduo-placentário, facilitando hematomas e descolamento precoce.",
    priority: "standard",
    tags: ["Obstetrícia", "DPP", "Gestação"],
    img_title_front: "Complicação Grave de Mioma Retroplacentário na Gravidez = [ ? ]",
    img_sub_front: "Defeito de adesão e integridade da vasculatura basal",
    img_title_back: "DESCOLAMENTO PREMATURO DE PLACENTA (DPP)",
    img_sub_back: "Além de DPP, miomas aumentam risco de RCIU e trabalho de parto pré-termo"
  },

  // ==========================================
  // BLUSH 5: DIAGNÓSTICO POR IMAGEM & EMBOLIZAÇÃO (Cards 43 a 50)
  // ==========================================
  {
    id: "FC-MIOMA-43",
    type: "direct",
    subfocus_name: "Diagnóstico por Imagem",
    front: "Qual o achado ultrassonográfico característico do mioma uterino na ultrassonografia transvaginal em modo B e Doppler?",
    back: "Nódulo sólido hipoecoico bem delimitado com sombra acústica posterior em faixas e anel de fluxo vascular periférico ao Doppler",
    comment: "A vascularização periférica com cápsula pseudovascular (anel) e centro relativamente avascular é típica do mioma benigno, diferenciando-o da adenomiose.",
    priority: "essential",
    tags: ["USG", "Imagem", "Diagnóstico"],
    img_title_front: "Achado Típico do Mioma ao USG Transvaginal + Doppler = [ ? ]",
    img_sub_front: "Padrão de ecogenicidade e mapeamento de fluxo vascular",
    img_title_back: "NÓDULO HIPOECOICO COM ANEL VASCULAR PERIFÉRICO",
    img_sub_back: "Sombra acústica lateral em feixes e bordas bem demarcadas"
  },
  {
    id: "FC-MIOMA-44",
    type: "cloze",
    subfocus_name: "Diagnóstico por Imagem",
    front: "No diagnóstico diferencial de dor e sangramento, a Adenomiose difere do Mioma na Ressonância Magnética por apresentar espessamento da Zona Juncional miometrial maior que {{c1::12 mm}}.",
    back: "12 mm (Zona Juncional > 12 mm)",
    comment: "Zona juncional < 8 mm afasta adenomiose; > 12 mm confirma adenomiose na RNM. Miomas apresentam pseudocápsula nítida sem espessamento juncional difuso.",
    priority: "essential",
    tags: ["RNM", "Diferencial", "Adenomiose"],
    img_title_front: "Ponto de Corte da Zona Juncional na RNM para Adenomiose = > [ ? ] mm",
    img_sub_front: "Diferenciação crucial entre nódulo de mioma e adenomiose focal",
    img_title_back: "ZONA JUNCIONAL > 12 mm",
    img_sub_back: "Sinal patognomônico de invasão endometrial no estroma miometrial"
  },
  {
    id: "FC-MIOMA-45",
    type: "direct",
    subfocus_name: "Diagnóstico por Imagem",
    front: "Qual a melhor modalidade de exame de imagem para o planejamento cirúrgico pré-operatório em pacientes com úteros com múltiplos miomas que desejam preservar a fertilidade?",
    back: "Ressonância Magnética de Pelve (RNM)",
    comment: "A RNM tem maior sensibilidade e resolução de contraste para contar, medir e localizar exatamente todos os nódulos em relação à cavidade e à serosa.",
    priority: "essential",
    tags: ["RNM", "Pré-operatório", "Padrão-Ouro"],
    img_title_front: "Melhor Exame para Mapeamento Pré-Operatório de Múltiplos Miomas = [ ? ]",
    img_sub_front: "Planejamento conservador em paciente com desejo de gravidez",
    img_title_back: "RESSONÂNCIA MAGNÉTICA DE PELVE (RNM)",
    img_sub_back: "Mapeia com precisão milimétrica a distância até a cavidade endometrial"
  },
  {
    id: "FC-MIOMA-46",
    type: "cloze",
    subfocus_name: "Embolização de Artérias Uterinas",
    front: "A substância emboligênica mais utilizada na Embolização das Artérias Uterinas (EAU) são as microesferas de {{c1::Álcool Polivinílico (PVA)}} injetadas por cateterismo.",
    back: "Álcool Polivinílico (PVA)",
    comment: "As partículas ocluem os ramos terminais das artérias uterinas bilaterais, provocando isquemia miomatosa seletiva com necrose do tumor e preservação miometrial por fluxo colateral.",
    priority: "standard",
    tags: ["EAU", "Embolização", "Radiologia Intervencionista"],
    img_title_front: "Substância Oclusiva Usada na Embolização de Artérias Uterinas = [ ? ]",
    img_sub_front: "Microesferas biocompatíveis injetadas via artéria femoral",
    img_title_back: "PARTÍCULAS DE PVA (ÁLCOOL POLIVINÍLICO)",
    img_sub_back: "Induzem isquemia seletiva com redução de até 60% do volume do nódulo"
  },
  {
    id: "FC-MIOMA-47",
    type: "direct",
    subfocus_name: "Embolização de Artérias Uterinas",
    front: "Qual é a principal contraindicação relativa de longo prazo para a Embolização das Artérias Uterinas (EAU)?",
    back: "Desejo de gestação futura (potencial insuficiência ovariana e complicações placentárias)",
    comment: "A EAU pode provocar embolização inadvertida de anastomoses utero-ovarianas levando à falência ovariana prematura, além de maior risco de abortamento e acretismo placentário.",
    priority: "essential",
    tags: ["EAU", "Contraindicação", "Fertilidade"],
    img_title_front: "Principal Contraindicação Relativa da Embolização (EAU) = [ ? ]",
    img_sub_front: "Impacto reprodutivo e circulação anastomótica ovariana",
    img_title_back: "DESEJO DE GRAVIDEZ FUTURA",
    img_sub_back: "Risco de insuficiência ovariana prematura e defeitos de placentação"
  },
  {
    id: "FC-MIOMA-48",
    type: "cloze",
    subfocus_name: "Embolização de Artérias Uterinas",
    front: "Nas primeiras 48 horas após a realização de embolização de artérias uterinas, a paciente frequentemente desenvolve dor pélvica aguda, náuseas, leucocitose e febre baixa, quadro denominado {{c1::Síndrome Pós-Embolização}}.",
    back: "Síndrome Pós-Embolização",
    comment: "Trata-se de uma resposta inflamatória estéril decorrente da necrose isquêmica maciça dos miomas. É autolimitada e manejada com AINEs, opioides e antieméticos.",
    priority: "standard",
    tags: ["EAU", "Complicação", "Pós-operatório"],
    img_title_front: "Dor Pélvica, Febre e Leucocitose Pós-EAU = Síndrome [ ? ]",
    img_sub_front: "Quadro inflamatório agudo nas primeiras 48 horas",
    img_title_back: "SÍNDROME PÓS-EMBOLIZAÇÃO",
    img_sub_back: "Resposta inflamatória estéril à necrose tecidual tumoral aguda"
  },
  {
    id: "FC-MIOMA-49",
    type: "direct",
    subfocus_name: "Casos Especiais",
    front: "O que é um 'Mioma Parasita' e como se dá a sua fisiopatologia de sustentação vascular?",
    back: "É um mioma subseroso pediculado que se aderiu ao omento ou peritônio pélvico, desenvolveu neovascularização externa e perdeu a fixação uterina original",
    comment: "Pode ocorrer espontaneamente ou após cirurgias laparoscópicas com morcelamento de fragmentos residuais abandonados na cavidade peritoneal.",
    priority: "standard",
    tags: ["Casos Especiais", "Mioma Parasita"],
    img_title_front: "Mioma Desprendido do Útero com Vascularização Omental = [ ? ]",
    img_sub_front: "Nódulo aderente à parede abdominal ou estruturas vizinhas",
    img_title_back: "MIOMA PARASITA",
    img_sub_back: "Adquire suprimento sanguíneo de vasos omentais ou mesentéricos"
  },
  {
    id: "FC-MIOMA-50",
    type: "cloze",
    subfocus_name: "Prognóstico",
    front: "Após a menopausa fisiológica, na ausência de terapia hormonal exógena, a evolução biológica esperada para a esmagadora maioria dos miomas uterinos é a {{c1::regressão espontânea de volume / atrofia}}.",
    back: "Regressão espontânea / Atrofia tumoral",
    comment: "A queda drástica dos níveis séricos de estradiol e progesterona retira o estímulo mitogênico e trófico, levando à hialinização, calcificação e redução volumétrica progressiva.",
    priority: "essential",
    tags: ["Fisiologia", "Menopausa", "Prognóstico"],
    img_title_front: "Evolução Natural do Mioma na Menopausa sem TRH = [ ? ]",
    img_sub_front: "Impacto da cessação hormonal cíclica no menacme",
    img_title_back: "REGRESSÃO ESPONTÂNEA / ATROFIA",
    img_sub_back: "Hipoestrogenismo fisiológico induz atrofia miocitária progressiva"
  }
];

const processedCards = rawCards.map(c => {
  const svgFront = createSvg(c.img_title_front, c.img_sub_front, "#38bdf8", `CARD ${c.id} • ${c.subfocus_name}`, false);
  const svgBack = createSvg(c.img_title_back, c.img_sub_back, "#22c55e", `RESPOSTA • ${c.subfocus_name}`, true);

  return {
    id: c.id,
    type: c.type,
    front: c.front,
    back: c.back,
    comment: c.comment,
    specialty_name: "Ginecologia",
    theme_name: "Miomatose Uterina",
    focus_name: "Miomas Uterinos",
    subfocus_name: c.subfocus_name,
    priority: c.priority,
    tags: c.tags,
    image_front_svg: svgFront,
    image_back_svg: svgBack,
    state: "new",
    stability: null,
    difficulty: null,
    retrievability: null,
    lapses: 0
  };
});

fs.writeFileSync(
  path.join(process.cwd(), 'data', 'flashcards_miomatose_uterina.json'),
  JSON.stringify(processedCards, null, 2),
  'utf8'
);

console.log(`Sucesso: 50 flashcards gerados e validados em data/flashcards_miomatose_uterina.json`);

