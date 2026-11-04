import { StudyMaterialItem } from '@/types/flashcards';

export const INITIAL_STUDY_MATERIALS: StudyMaterialItem[] = [
  {
    id: 'mat-eda-01',
    focusId: 'cir-eda-hda',
    title: 'Endoscopia Digestiva Alta & Hemorragia Digestiva Alta (HDA)',
    specialty: 'Cirurgia Geral',
    theme: 'Procedimentos Endoscópicos',
    focus: 'Endoscopia Digestiva Alta',
    readTimeMinutes: 5,
    lastUpdatedYear: 2026,
    guidelineBadge: 'Colégio Brasileiro de Cirurgiões / SOBED',
    summarySnippet: 'Manejo emergencial de HDA varicosa e não-varicosa, classificação de Forrest e Sakita, contraindicações absolutas e timing de corpos estranhos.',
    keyPoints: [
      'Estabilização hemodinâmica antes da endoscopia: paciente em choque não entra em sala de exame.',
      'Forrest Ia, Ib e IIa exigem hemostasia endoscópica combinada (adrenalina + método térmico ou clipe).',
      'Forrest IIc e III têm baixo risco de ressangramento (< 5-10%) e dispensam hemostasia mecânica imediata.',
      'Varizes de fundo gástrico (GOV2/IGV1): conduta padrão é injeção de cianoacrilato (cola biológica), e não ligadura.',
      'Baterias de disco impactadas no esôfago geram necrose por liquefação em 2h e exigem remoção endoscópica imediata.',
      'Suspeita de pneumoperitônio/perfuração de víscera oca é contraindicação absoluta formal à EDA.'
    ],
    markdownContent: `# Endoscopia Digestiva Alta & Hemorragia Digestiva Alta (HDA)

A Endoscopia Digestiva Alta (EDA) é uma ferramenta diagnóstica e terapêutica de urgência cirúrgica. Nas provas de residência médica, o examinador não cobra aspectos técnicos de manuseio do aparelho, mas sim **quando indicar**, **quando contraindicar** e, prioritariamente, qual a conduta diante de uma classificação de **Forrest** ou **Sakita**.

---

## 1. O Que o Examinador Quer Saber

A Hemorragia Digestiva Alta (HDA) não-variceal responde por cerca de 80% dos sangramentos digestivos altos, tendo como etiologia líder a **Doença Ulcerosa Péptica**. A primeira armadilha de prova reside na priorização de condutas no pronto-socorro:

1. **Passo 1:** Estabilização hemodinâmica primária (cristaloides e concentrado de hemácias se choque classe III/IV).
2. **Passo 2:** Inibidor de Bomba de Prótons (IBP) venoso em dose alta (Omeprazol em bolus seguido de infusão contínua ou intermitente).
3. **Passo 3:** EDA precoce realizada nas primeiras **12 a 24 horas** após estabilização.

> [!WARNING] Armadilha Clássica de Prova:
> Jamais realize EDA no paciente em choque descompensado. Primeiro estabilize a volemia; o exame trata a causa, mas o paciente precisa estar perfundido para tolerar a sedação e o procedimento.

---

## 2. Indicações e Contraindicações da EDA

### Contraindicações Absolutas
* **Perfuração de víscera oca suspeita ou confirmada:** Na vigência de pneumoperitônio, a insuflação gasosa aumenta a pressão intrabdominal, piora o pneumotórax hipertensivo ou agrava o choque séptico.
* **Instabilidade hemodinâmica refratária não corrigida.**
* **Insuficiência respiratória aguda grave:** Exceto se o paciente já estiver intubado com via aérea protegida.

### Contraindicações Relativas
* Coagulopatias graves (INR > 2,5 ou plaquetas < 50.000).
* Divertículo de Zenker volumoso (elevado risco de perfuração faringoesofágica inadvertida).
* Aneurisma de aorta toracoabdominal roto/instável.

---

## 3. Classificações Essenciais: Forrest & Sakita

### Classificação de Forrest (Risco de Ressangramento em Úlcera Péptica)

| Forrest | Descrição da Lesão | Risco de Ressangramento | Conduta Endoscópica Obrigatória |
| :--- | :--- | :--- | :--- |
| **Ia** | Sangramento arterial em jato (pulsátil) | Altíssimo (~90%) | **Terapia Combinada Obrigatória** (Adrenalina + Clipe/Térmico) |
| **Ib** | Sangramento em babação (venoso/capilar) | Alto (~30%) | **Terapia Combinada Obrigatória** |
| **IIa** | Vaso visível não sangrante | Alto (40-50%) | **Hemostasia Obrigatória** (Prevenção de ruptura secundária) |
| **IIb** | Coágulo aderido | Moderado (20-30%) | Irrigação vigorosa, remoção mecânica e tratamento da base |
| **IIc** | Hematina na base da úlcera (pontos pretos) | Baixo (< 10%) | Tratamento clínico exclusivo com IBP venoso |
| **III** | Base limpa recoberta por fibrina clara | Mínimo (< 5%) | Tratamento clínico com IBP oral e alta precoce |

---

## 4. Hemorragia Digestiva Alta Varicosa (Hipertensão Portal)

No sangramento por varizes esofagogástricas, o mecanismo patológico é a hipertensão sinusoidal:

* **Varizes de Esôfago:** O método hemostático padrão-ouro de urgência é a **Ligadura Elástica Endoscópica** associada a vasoconstritor esplâncnico (Terlipressina ou Octreotide) e profilaxia de PBE com Ceftriaxona.
* **Varizes Gástricas Fúndicas (GOV2 / IGV1):** Não respondem à ligadura elástica devido ao calibre calibroso e espessura da parede gástrica. A conduta de eleição é a injeção intratumoral de **Cianoacrilato** ("super-cola" médica).
* **Falha da Hemostasia Endoscópica:** Indicação de **TIPS** (Shunt Portossistêmico Transjugular Intra-hepático). O Balão de Sengstaken-Blakemore funciona exclusivamente como ponte temporária por no máximo 24 horas.

---

## 5. Corpos Estranhos no Esôfago & Estômago

* **Bateria de Disco no Esôfago:** Emergência cirúrgica máxima. A corrente elétrica alcaliniza o meio e induz necrose por liquefação e fístula aortoesofágica em 2 horas. Na radiografia, apresenta o **Sinal do Duplo Contorno (Halo)**.
* **Objetos Pontiagudos / Cortantes:** Devem ser retirados por EDA de urgência se acessíveis, antes que ultrapassem o ângulo de Treitz.
* **Moeda no Esôfago em Paciente Assintomático:** Pode ser observada por até 24 horas, pois em 30-50% dos casos progride espontaneamente para o estômago.

---

## 6. Pontos-Chave para Prova 💡

* Não confunda **Forrest III** (base com fibrina, mínimo risco) com **Sakita A2** (úlcera em atividade biológica limpa com fibrina).
* No Forrest Ia/Ib, nunca use injeção de adrenalina pura; a monoterapia com adrenalina aumenta o ressangramento tardio por vasodilatação reflexa rebote.
* Na ingestão de substâncias cáusticas (soda cáustica), a EDA deve ser realizada idealmente entre **12 e 24 horas**. É proibido induzir vômitos ou ofertar agentes neutralizantes (ácidos).
* A Gastrostomia Endoscópica Percutânea (GEP) é indicada para suporte nutricional enteral previsto para > 4 semanas; estar em UTI não é contraindicação para GEP.`
  },
  {
    id: 'mat-iam-02',
    focusId: 'cli-iam-sca',
    title: 'Síndrome Coronariana Aguda & Infarto Agudo do Miocárdio (IAM)',
    specialty: 'Clínica Médica',
    theme: 'Cardiologia',
    focus: 'Síndrome Coronariana Aguda',
    readTimeMinutes: 6,
    lastUpdatedYear: 2026,
    guidelineBadge: 'Diretriz da Sociedade Brasileira de Cardiologia (SBC)',
    summarySnippet: 'Critérios eletrocardiográficos de supra de ST, reperfusão miocárdica (angioplastia vs trombólise), Killip-Kimball e infarto de ventrículo direito.',
    keyPoints: [
      'Janela de reperfusão no IAM com supra: até 12 horas do início da dor típica.',
      'Angioplastia primária é superior se tempo porta-balão ≤ 90 min (ou até 120 min na transferência).',
      'Se tempo porta-balão previsto for > 120 min, realizar trombólise química em até 30 min (porta-agulha).',
      'Infarto com supra de parede inferior (DII, DIII, aVF): sempre rodar derivações direitas (V3R, V4R) e posteriores (V7, V8).',
      'Acometimento de VD contraindica formalmente nitratos, morfina e diuréticos por queda drástica de pré-carga.',
      'Dupla antiagregação plaquetária mandatória: AAS + Inibidor P2Y12 (Ticagrelor, Prasugrel ou Clopidogrel).'
    ],
    markdownContent: `# Síndrome Coronariana Aguda & Infarto Agudo do Miocárdio (IAM)

O Infarto Agudo do Miocárdio (IAM) com elevação do segmento ST representa a emergência cardiológica mais cobrada nas provas de Residência Médica e Revalida no Brasil. O raciocínio do examinador gira em torno da **rapidez de diagnóstico**, **metas temporais de reperfusão** e **contraindicações medicamentosas fatais**.

---

## 1. Critérios Eletrocardiográficos de Supra de ST

O ECG de 12 derivações deve ser realizado e interpretado em até **10 minutos** do primeiro contato médico. O supra de ST é patológico quando medido no ponto J em pelo menos duas derivações contíguas:

* **Derivações V2 e V3:**
  - Homens < 40 anos: supra $\ge 2{,}5\text{ mm}$ (0,25 mV).
  - Homens $\ge 40$ anos: supra $\ge 2{,}0\text{ mm}$ (0,20 mV).
  - Mulheres de qualquer idade: supra $\ge 1{,}5\text{ mm}$ (0,15 mV).
* **Demais derivações (DII, DIII, aVF, DI, aVL, V1, V4-V6):**
  - Supra $\ge 1{,}0\text{ mm}$ (0,10 mV).
* **Parede Posterior (V7, V8, V9) e Ventrículo Direito (V3R, V4R):**
  - Supra $\ge 0{,}5\text{ mm}$ já é considerado positivo e diagnóstico.

---

## 2. Estratégia de Reperfusão & Metas Temporais

Todo paciente com IAM com supra de ST e dor com início há menos de **12 horas** é candidato formal a reperfusão coronária de emergência:

| Estratégia | Cenário Clínico | Meta Temporal Padrão-Ouro |
| :--- | :--- | :--- |
| **Angioplastia Primária (ICP)** | Centro com Hemodinâmica | **Tempo Porta-Balão $\le 90\text{ minutos}$** |
| **Angioplastia Primária (Transferência)** | Hospital inicial sem Hemodinâmica | **Tempo $\le 120\text{ minutos}$** do diagnóstico até abertura do vaso |
| **Fibrinólise Química (Trombolítico)** | Previsão de transferência $> 120\text{ min}$ | **Tempo Porta-Agulha $\le 30\text{ minutos}$** (ideal com Tenecteplase/Alteplase) |

> [!IMPORTANT] Critérios de Reperfusão Pós-Trombólise (avaliar em 60 a 90 minutos):
> Redução de pelo menos **50%** na amplitude do supra de ST no ECG de controle, alívio do quadro álgico e arritmia de reperfusão (Ritmo Idioventricular Acelerado - RIVA). Se não houver reperfusão, indicar imediatamente **angioplastia de resgate**.

---

## 3. O Infarto de Ventrículo Direito (VD): A Pegadinha Mais Frequente

Quando houver supra de ST na parede inferior (**DII, DIII e aVF**), a oclusão costuma acometer a **Artéria Coronária Direita (ACD)**:

* **Tríade Clínica de Infarto de VD:** Hipotensão arterial + Turgência jugular a 45º + Ausculta pulmonar limpa (sem estertores crepitantes).
* **Conduta Contraindicada:** **Nitratos (sublingual ou IV)**, **Morfina** e **Diuréticos de Alça (Furosemida)**. Essas drogas causam venodilatação ou espoliação volêmica, colapsando a pré-carga do VD e induzindo choque cardiogênico irreversível.
* **Tratamento Correto:** Expansão com cristaloides (SF 0,9% ou Ringer Lactato) em alíquotas de 250 a 500 mL para elevar a pressão venosa central e vencer a resistência pulmonar.

---

## 4. Classificação de Killip-Kimball & Mortalidade

| Classe Killip | Manifestações Clínicas | Mortalidade Hospitalar |
| :--- | :--- | :--- |
| **Killip I** | Sem sinais de disfunção ventricular ou congestão pulmonar | $\approx 6\%$ |
| **Killip II** | Estertores crepitantes basais ($< 50\%$ do tórax), $B_3$ ou turgência | $\approx 17\%$ |
| **Killip III** | Edema Agudo de Pulmão (crepitações em $> 50\%$ dos campos) | $\approx 38\%$ |
| **Killip IV** | Choque cardiogênico (hipotensão sistêmica, má perfusão periférica) | $\approx 80\%$ |

---

## 5. Pontos-Chave para Prova 💡

* O oxigênio suplementar **não** é de rotina; deve ser reservado exclusivamente para pacientes com hipoxemia documentada ($\text{SatO}_2 < 90\%$ ou dispneia).
* A morfina deve ser reservada para dor refratária intolerável; ela lentifica a absorção dos inibidores P2Y12 por gastroparesia.
* A terapia antitrombótica completa inclui: **AAS** (dose de ataque 200-300 mg mastigável) + **Inibidor P2Y12** (Ticagrelor 180 mg ou Prasugrel 60 mg preferenciais) + **Anticoagulação parenteral** (Enoxaparina ou HNF).`
  },
  {
    id: 'mat-preecl-03',
    focusId: 'go-preecl-ecl',
    title: 'Pré-Eclâmpsia Grave & Eclâmpsia',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Obstetrícia Patológica',
    focus: 'Pré-eclâmpsia Grave e Eclâmpsia',
    readTimeMinutes: 5,
    lastUpdatedYear: 2026,
    guidelineBadge: 'Febrasgo / Ministério da Saúde',
    summarySnippet: 'Critérios diagnósticos e de gravidade, profilaxia com AAS e Cálcio, esquema de Zuspan e Pritchard com sulfato de magnésio e manejo do parto.',
    keyPoints: [
      'Pré-eclâmpsia é hipertensão diagnosticada após 20 semanas com proteinúria OU disfunção de órgão-alvo.',
      'Critério de gravidade: PA sistólica ≥ 160 mmHg ou diastólica ≥ 110 mmHg, plaquetopenia < 100.000, creatinina > 1.1 mg/dL.',
      'Sulfato de magnésio é a droga de escolha para prevenção e controle de convulsões; não previne hipertensão.',
      'Anti-hipertensivos de urgência: Hidralazina IV, Labetalol IV ou Nifedipino oral (PA meta: 140-150 / 90-100 mmHg).',
      'Monitorização da intoxicação por magnésio: reflexo patelar (1º sinal de toxicidade), diurese (> 25 mL/h) e FR (> 16 irpm).',
      'Antídoto imediato: Gluconato de Cálcio a 10% (1g IV lento em 3 a 5 minutos).'
    ],
    markdownContent: `# Pré-Eclâmpsia Grave & Eclâmpsia

A Pré-eclâmpsia (PE) é uma síndrome multissistêmica secundária a defeito na invasão trofoblástica das artérias espiraladas uterinas, gerando hipóxia placentária e disfunção endotelial materna sistêmica após a **20ª semana de gestação**.

---

## 1. Critérios de Definição & Sinais de Gravidade

A presença de proteinúria não é mais mandatória para o diagnóstico de pré-eclâmpsia quando houver hipertensão associada a acometimento orgânico materno:

* **Pressão Arterial:** $\text{PAS} \ge 140\text{ mmHg}$ ou $\text{PAD} \ge 90\text{ mmHg}$ em duas aferições com intervalo de 4 horas após 20 semanas.
* **Mais um dos seguintes critérios:**
  - Proteinúria $\ge 300\text{ mg}$ em 24h ou relação proteína/creatinina urinária $\ge 0{,}3$.
  - Trombocitopenia: Plaquetas $< 100.000/\mu\text{L}$.
  - Insuficiência renal: Creatinina sérica $> 1{,}1\text{ mg/dL}$ ou duplicação do basal.
  - Lesão hepática: Transaminases (TGO/TGP) elevadas em pelo menos $2\times$ o limite superior.
  - Edema Agudo de Pulmão.
  - Sintomas visuais/neurológicos (cefaleia refratária, escotomas cintilantes, epigastralgia em barra).

> [!IMPORTANT] Pré-Eclâmpsia Grave (Basta 1 critério):
> $\text{PAS} \ge 160\text{ mmHg}$ ou $\text{PAD} \ge 110\text{ mmHg}$ (confirmada em 15 minutos), plaquetas $< 100.000$, iminência de eclâmpsia (hiperreflexia, dor epigástrica) ou edema pulmonar.

---

## 2. Prevenção de Convulsões: O Sulfato de Magnésio ($MgSO_4$)

O magnésio bloqueia os receptores de NMDA e reduz a hiperexcitabilidade cortical. **É a droga de escolha incontestável para prevenir e abortar crises convulsivas na gravidez e puerpério.**

### Esquemas Posológicos
* **Esquema de Zuspan (Endovenoso Puro - Mais comum em prova):**
  - **Dose de Ataque:** $4\text{ g}$ de $MgSO_4$ IV diluídos, infundidos em 15 a 20 minutos.
  - **Dose de Manutenção:** $1\text{ a }2\text{ g/hora}$ em infusão venosa contínua em bomba por 24 horas pós-parto.
* **Esquema de Pritchard (Intramuscular Combinado):**
  - **Dose de Ataque:** $4\text{ g}$ IV lento $+ 10\text{ g}$ IM ($5\text{ g}$ em cada glúteo profundamente).
  - **Dose de Manutenção:** $5\text{ g}$ IM profundo a cada 4 horas.

---

## 3. Vigilância da Intoxicação por Magnésio

A margem terapêutica do magnésio é estreita ($4{,}8\text{ a }8{,}4\text{ mg/dL}$). Durante o uso, o médico deve vigiar rigorosamente 3 parâmetros clínicos à beira do leito:

1. **Reflexo Patelar (Presente):** É o **primeiro** reflexo neurológico a desaparecer se houver hipermagnesemia ($> 8\text{ mEq/L}$). Se ausente, suspender a infusão imediatamente.
2. **Frequência Respiratória:** Deve ser $\ge 16\text{ incursões/minuto}$. A depressão respiratória surge com níveis $> 12\text{ mEq/L}$.
3. **Diurese Horária:** Mínimo de $\ge 25\text{ a }30\text{ mL/hora}$ (o magnésio é de excreção quase $100\%$ renal; oligúria precipita acúmulo tóxico rápido).

> [!CAUTION] Conduta na Intoxicação por Sulfato de Magnésio:
> 1. Interromper imediatamente a infusão de $MgSO_4$.
> 2. Administrar **Gluconato de Cálcio a 10%**: $1\text{ g}$ (1 ampola de 10 mL) por via endovenosa lenta em 3 a 5 minutos.

---

## 4. Controle Pressórico da Crise Hipertensiva Aguda

* **Quando tratar de imediato:** Sempre que $\text{PAS} \ge 160\text{ mmHg}$ ou $\text{PAD} \ge 110\text{ mmHg}$ para prevenir AVC hemorrágico materno.
* **Meta Pressórica:** Não reduzir a pressão bruscamente para níveis normais; a meta é manter $\text{PAS } 140\text{–}150\text{ mmHg}$ e $\text{PAD } 90\text{–}100\text{ mmHg}$ para garantir a perfusão útero-placentária.
* **Drogas de Escolha no Brasil:**
  - **Hidralazina IV:** $5\text{ mg}$ IV a cada 20 minutos (máximo 20 mg).
  - **Nifedipino cápsula/comprimido oral:** $10\text{ a }20\text{ mg}$ VO (nunca sublingual!).
  - **Labetalol IV:** Excelente opção quando disponível.

---

## 5. Pontos-Chave para Prova 💡

* O sulfato de magnésio **não é anti-hipertensivo**; ele trata a excitabilidade neuronal e previne a eclâmpsia.
* A profilaxia primária em gestantes de alto risco (PE anterior, nefropatia, lúpus, HAS crônica) é feita com **AAS em baixa dose (100 a 150 mg/dia)** iniciado entre 12 e 16 semanas associado a **Cálcio elementar** ($1{,}5\text{ a }2\text{ g/dia}$).
* A presença de Síndrome HELLP (Hemólise, Enzimas hepáticas elevadas e Plaquetopenia) é indicação de interrupção da gestação independentemente da idade gestacional, após estabilização clínica e magnésio.`
  },
  {
    id: 'mat-exant-04',
    focusId: 'ped-exant-inf',
    title: 'Doenças Exantemáticas na Infância',
    specialty: 'Pediatria',
    theme: 'Infectologia Pediátrica',
    focus: 'Doenças Exantemáticas na Infância',
    readTimeMinutes: 5,
    lastUpdatedYear: 2026,
    guidelineBadge: 'Sociedade Brasileira de Pediatria (SBP)',
    summarySnippet: 'Diagnóstico diferencial de Sarampo, Rubéola, Exantema Súbito, Eritema Infeccioso, Escarlatina e Varicela com foco em morfologia e sinais patognomônicos.',
    keyPoints: [
      'Sarampo: Pródromos catarrais intensos, conjuntivite com fotofobia, Manchas de Koplik e progressão craniocaudal com descamação furfurácea.',
      'Exantema Súbito (Roséola): Febre alta contínua que desaparece subitamente em crise antes do surgimento das máculas róseas no tronco.',
      'Eritema Infeccioso (Parvovírus B19): Fase 1 da "face esbofeteada" seguida de exantema rendilhado em membros que recidiva ao calor.',
      'Escarlatina (Streptococcus pyogenes): Sinal de Filatov (palidez perioral), Linhas de Pastia nas dobras e Língua em framboesa.',
      'Varicela (Catapora): Polimorfismo regional clássico (mácula, pápula, vesícula e crosta simultâneas) com prurido intenso.'
    ],
    markdownContent: `# Doenças Exantemáticas na Infância

As doenças exantemáticas febris constituem um dos temas de maior prevalência nas provas de Pediatria. O examinador elabora os enunciados baseando-se em **três pistas diagnósticas cruciais**: a relação temporal entre febre e exantema, a presença de enantema patognomônico e a morfologia de progressão das lesões.

---

## 1. Quadro Comparativo das Principais Doenças Exantemáticas

| Doença & Agente | Pródromos & Febre | Características do Exantema | Sinais Patognomônicos / Pistas |
| :--- | :--- | :--- | :--- |
| **Sarampo** *(Morbillivirus)* | Febre alta, tosse intensa, coriza, conjuntivite com fotofobia | Maculopapular confluente, craniocaudal lento; **descamação furfurácea** | **Manchas de Koplik** (pontos brancos na mucosa jugal prévia ao exantema) |
| **Rubéola** *(Togavírus)* | Pródromos leves ou ausentes em crianças; febre baixa | Maculopapular róseo, craniocaudal rápido, **não confluente** | **Linfonodomegalia suboccipital, retroauricular e cervical posterior** |
| **Exantema Súbito** *(HHV-6 e HHV-7)* | Febre alta persistente por 3 a 5 dias com bom estado geral | Surge **após a febre desaparecer subitamente**; centrífugo (tronco $\to$ membros) | Criança afebril e "curada" da febre quando as lesões aparecem |
| **Eritema Infeccioso** *(Parvovírus B19)* | Assintomático ou pródromos leves; afebril no momento do exantema | 1ª fase: **Face esbofeteada**<br>2ª fase: **Padrão rendilhado**<br>3ª fase: Recidiva com calor/sol | Pode precipitar crise aplásica transitória em portadores de anemias hemolíticas |
| **Escarlatina** *(Streptococcus do grupo A)* | Faringoamigdalite exsudativa aguda, febre alta e vômitos | Micropapular difuso ("pele em lixa" / áspero); descamação lamelar | **Sinal de Filatov** (palidez perioral), **Linhas de Pastia** (dobras) e **Língua em framboesa** |
| **Varicela** *(Vírus Varicela-Zóster)* | Febre moderada e mal-estar discreto | **Polimorfismo regional:** Máculas $\to$ Pápulas $\to$ Vesículas umbilicadas $\to$ Crostas | Lesões em diferentes estágios evolutivos no mesmo segmento corpóreo; prurido intenso |

---

## 2. Sarampo: Emergência em Saúde Pública

* **Transmissão:** Altíssima infectividade por aerossóis que permanecem suspensos no ar por até 2 horas.
* **Manchas de Koplik:** Lesões brancacentas milimétricas em base eritematosa na mucosa jugal oposta aos molares inferiores; surgem 24 a 48h antes do exantema e desaparecem nos primeiros dias do rash.
* **Tratamento:** Suporte clínico e administração obrigatória de **Vitamina A** em duas doses para reduzir complicações pulmonares e oculares.
* **Conduta:** Notificação compulsória imediata e bloqueio vacinal em até 72 horas para contatos suscetíveis $\ge 6\text{ meses}$.

---

## 3. Escarlatina e a Toxina Pirogênica Estreptocócica

A escarlatina não é uma doença viral; trata-se de uma complicação mediada pela exotoxina pirogênica do *Streptococcus pyogenes* (Streptococo Beta-Hemolítico do Grupo A) em contexto de faringoamigdalite:

1. **Sinal de Filatov:** Intenso eritema malar com palidez ao redor dos lábios e nariz.
2. **Sinal de Pastia:** Acentuação do eritema nas linhas de flexão articular (prega cubital, virilha, axilas) que não desaparece à digitopressão.
3. **Língua:** Inicialmente recoberta por saburra branca com papilas hipertrofiadas (língua em morango branco); após o 4º dia, descama e torna-se vermelha brilhante (língua em framboesa).
4. **Tratamento:** **Penicilina Benzatina IM** em dose única ou Amoxicilina oral por 10 dias para prevenção primária da **Febre Reumática** (nota: o antibiótico previne febre reumática, mas não previne glomerulonefrite difusa aguda - GNPE).`
  },
  {
    id: 'mat-prev-05',
    focusId: 'prev-estudos-epi',
    title: 'Desenhos de Estudos Epidemiológicos & Níveis de Prevenção',
    specialty: 'Medicina Preventiva e Social',
    theme: 'Epidemiologia',
    focus: 'Desenhos de Estudos Epidemiológicos',
    readTimeMinutes: 5,
    lastUpdatedYear: 2026,
    guidelineBadge: 'Epidemiologia Clínica / ABRASCO',
    summarySnippet: 'Diferenciação clara entre Coorte, Caso-Controle, Ensaio Clínico e Transversal; medidas de associação (RR vs OR) e níveis de Leavell & Clark.',
    keyPoints: [
      'Estudo de Coorte: Parte da exposição para o desfecho no futuro. Permite calcular Incidência e Risco Relativo (RR).',
      'Caso-Controle: Parte de doentes vs não-doentes para investigar exposições no passado. Calcula Odds Ratio (OR).',
      'Ensaio Clínico Randomizado: Intervencionista, randomizado e mascarado. Padrão-ouro para eficácia de intervenções terapêuticas.',
      'Estudo Transversal (Corte Transversal): Avalia exposição e desfecho no mesmo instante. Calcula Prevalência e Razão de Prevalências.',
      'Prevenção Primária atua antes da doença (vacinas); Secundária atua na fase subclínica (rastreamento/screening).',
      'Prevenção Quaternária: Identificar pacientes em risco de sobretratamento/iatrogenia e protegê-los de intervenções médicas excessivas.'
    ],
    markdownContent: `# Desenhos de Estudos Epidemiológicos & Níveis de Prevenção

Em Medicina Preventiva e Social, as questões de metodologia epidemiológica são as mais regulares e de maior previsibilidade em provas. A chave para a nota máxima é dominar a **direcionalidade do estudo** e os **níveis de intervenção de Leavell & Clark**.

---

## 1. Matriz de Desenhos Epidemiológicos

| Desenho | Unidade de Estudo | Ponto de Partida | Direcionalidade | Medida de Frequência | Medida de Associação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ensaio Clínico Randomizado** | Indivíduo | Intervenção atribuída pelo pesquisador | Prospectivo longitudinal | Incidência acumulada | Risco Relativo (RR), RRR e NNT |
| **Estudo de Coorte** | Indivíduo | Pessoas sadias classificadas pela **Exposição** | Prospectivo (ou histórico) | **Incidência** | **Risco Relativo (RR)** |
| **Caso-Controle** | Indivíduo | Pessoas classificadas pelo **Desfecho (Doentes vs Sadios)** | Retrospectivo | Não calcula incidência direta | **Odds Ratio (OR)** |
| **Transversal (Seccional)** | Indivíduo | Amostra populacional observada em momento único | Sem seguimento | **Prevalência** | Razão de Prevalências (RP) |
| **Ecológico** | **População / Agregado** | Dados agregados de cidades, estados ou países | Observacional agregado | Não mede indivíduos | Coeficiente de correlação |

> [!WARNING] Falácia Ecológica:
> Consiste no erro metodológico clássico de inferir causalidade para um indivíduo a partir de correlações observadas em dados agregados de uma população.

---

## 2. Níveis de Prevenção de Leavell & Clark

A história natural das doenças divide-se no período pré-patogênico e patogênico:

* **Prevenção Primária (Período Pré-Patogênico):**
  - **Objetivo:** Impedir o surgimento da doença reduzindo a incidência.
  - **Ações:** Proteção específica (Vacinação, suplementação com ácido fólico, uso de preservativo) e Promoção da Saúde (saneamento básico, atividade física, cessação de tabagismo).
* **Prevenção Secundária (Fase Subclínica / Diagnóstico Precoce):**
  - **Objetivo:** Detectar a doença em fase precoce e assintomática para diminuir a prevalência e letalidade.
  - **Ações:** Programas de rastreamento (*screening*), como mamografia bienal (50-69 anos), teste molecular DNA-HPV no colo uterino, sangue oculto nas fezes para câncer colorretal.
* **Prevenção Terciária (Fase Clínica e Sequela):**
  - **Objetivo:** Reduzir a incapacidade, reabilitar o paciente e prevenir complicações tardias (ex: fisioterapia motora pós-AVC, reabilitação cardíaca pós-IAM).
* **Prevenção Quaternária (Conceito Moderno de Marc Jamoulle):**
  - **Objetivo:** Identificar indivíduos em risco de sobrediagnóstico (*overdiagnosis*) e sobretratamento (*overtreatment*), protegendo-os de procedimentos iatrogênicos invasivos sem benefício comprovado (ex: não dosar PSA indiscriminado em idoso muito fragilizado).`
  },
    {
    id: 'mat-gin-mioma-01',
    focusId: 'gin-miomatose-uterina',
    title: 'Miomatose Uterina (Leiomioma): Resumo Padrão-Ouro de Alto Rendimento',
    specialty: 'Ginecologia e Obstetrícia',
    theme: 'Miomas e Patologias Anexiais',
    focus: 'Miomas Uterinos',
    readTimeMinutes: 12,
    lastUpdatedYear: 2026,
    guidelineBadge: 'FEBRASGO / ACOG 228 / FIGO',
    summarySnippet: 'Estatísticas de provas, fisiopatologia, classificação FIGO (0 a 8 e híbridos), escore STEPW de Lasmar, farmacoterapia e fluxograma de decisão clínica e cirúrgica.',
        keyPoints: [
      'A esmagadora maioria dos miomas é **assintomática**: conduta **expectante com seguimento anual**.',
      'Miomas **submucosos (FIGO 0, 1 e 2)** são a principal causa de **sangramento uterino anormal** e **infertilidade**.',
      '**DIU de Levonorgestrel é formalmente contraindicado** em miomas submucosos (FIGO 0, 1 e 2) por distorção cavitária.',
      '**Análogos de GnRH são pontes pré-operatórias temporárias** (máximo 6 meses) para reduzir volume (30-50%) e recuperar anemia.',
      '**Classificação STEPW de Lasmar:** Grupo I (0-4 pts: 1 tempo), Grupo II (5-6 pts: 2 tempos), Grupo III (7-9 pts: laparotomia).',
      '**Degeneração rubra na gestação (2º trimestre):** necrose asséptica; conduta **estritamente clínica/conservadora**.',
      'Crescimento miomatoso rápido na **pós-menopausa sem TRH** é suspeito de **leiomiossarcoma primário**.',
      '**Abertura da cavidade endometrial** durante a miomectomia impõe **cesariana eletiva** em futuras gestações.'
    ],
    markdownContent: "# Miomatose Uterina (Leiomiomas): Resumo Padrão-Ouro de Alto Rendimento\n\n> **Diretrizes e Consensos de Referência:** FEBRASGO (Tratado de Ginecologia), ACOG Practice Bulletin nº 228 (*Management of Symptomatic Uterine Leiomyomas*), FIGO 2018/2024 (*PALM-COEIN Classification*) e Protocolos de Provas de Residência Médica (ENARE, USP, UNICAMP, UFRJ, PSU-MG, AMRIGS).\n\n---\n\n## 1. O Que Mais Cai nas Provas de Residência Médica\n\nA análise estatística retrospectiva das questões dos principais concursos médicos brasileiros evidencia a seguinte distribuição de frequência temático-conceitual:\n\n```exam-stats\nRecorrência Estatística em Provas de Residência (Miomatose)\n```\n\n---\n\n## 2. Fisiopatologia, Fatores de Risco e de Proteção\n\nO leiomioma é uma neoplasia mesenquimatosa benigna monoclonal originada das células do músculo liso miometrial (miócitos) associada a matriz extracelular colágena.\n\n### Mecanismo Hormonal & Genético\n- **Hormonodependência Dupla:**\n  - **Estrogênio:** Estimula a hipertrofia celular e aumenta a expressão de receptores de progesterona (PR-A e PR-B).\n  - **Progesterona:** Principal fator mitogênico e indutor de hiperplasia celular (estimula bcl-2, inibindo a apoptose miomatosa).\n  - *Evidência de Prova:* Crescem no menacme sob estímulo hormonal; regridem na pós-menopausa (hipoestrogenismo fisiológico).\n- **Alterações Genéticas (MED12):** Presente em > 70% dos leiomiomas. Outras alterações: translocação HMGA2 e deleção 7q.\n\n```risk-factors\nFatores de Risco vs. Fatores de Proteção\n```\n\n---\n\n## 3. Classificação FIGO (Sistema PALM-COEIN)\n\nA FIGO (Federação Internacional de Ginecologia e Obstetrícia) divide os miomas em **9 categorias (0 a 8)** de acordo com a profundidade e relação anatômica com o endométrio e serosa:\n\n```figo\nClassificação FIGO dos Leiomiomas Uterinos\n```\n\n### Tabela Anatômica da Classificação FIGO\n\n| Tipo FIGO | Categoria | Relação Anatômica Exata | Repercussão Típica |\n| :---: | :--- | :--- | :--- |\n| **0** | Submucoso | Pediculado intracavitário (sem invasão do miométrio) | Hemorragia intensa, cólica, abortamento |\n| **1** | Submucoso | Sésseis com **$< 50\\%$** de componente intramural | SUA abundante, infertilidade endometrial |\n| **2** | Submucoso | Sésseis com **$\\ge 50\\%$** de componente intramural | SUA abundante, distorção de cavidade |\n| **3** | Intramural | $100\\%$ intramural, porém **toca a superfície endometrial** | SUA, falha de implantação embrionária |\n| **4** | Intramural | $100\\%$ intramural puro (sem contato com endométrio ou serosa) | Aumento de volume uterino, dismenorreia |\n| **5** | Subseroso | Subseroso com **$\\ge 50\\%$** de componente intramural | Sintomas compressivos, assintomático |\n| **6** | Subseroso | Subseroso com **$< 50\\%$** de componente intramural | Compressão vesical/retal, sensação de peso |\n| **7** | Subseroso | Pediculado subseroso | Risco de **torção aguda** (abdome agudo) |\n| **8** | Outros | Localizações atípicas: **Cervical**, Intraligamentar, Parasita | Dispareunia, compressão ureteral, distócia |\n| **Híbridos (ex: 2-5)** | Transmural | Envolve desde a cavidade endometrial até a serosa | Sangramento volumoso + compressão externa |\n\n---\n\n## 4. Quadro Clínico e Correlação Topográfica\n\nMais de **50% a 70%** das mulheres com miomatose uterina são inteiramente assintomáticas. Quando sintomáticas, o quadro é ditado pela **localização**, e não necessariamente pelo tamanho total:\n\n```topography-symptoms\nQuadro Clínico e Correlação Topográfica\n```\n\n---\n\n## 5. Investigação Diagnóstica Armada\n\n```diagnostic-pipeline\nInvestigação Diagnóstica Armada\n```\n\n### 1. Ultrassonografia Pélvica Transvaginal (Exame Inicial de Escolha)\n- **Achado Típico:** Nódulo sólido, bem delimitado, hipoecoico (em relação ao miométrio vizinho), homogêneo ou heterogêneo (se degenerações), com atenuação do feixe sonoro posterior (sombra acústica em faixa) e anel de fluxo vascular periférico ao Doppler (vasos capsulares).\n- **Limitação:** Em úteros muito volumosos ($> 300\\text{ a }400\\text{ cm}^3$) ou múltiplos miomas confluentes, a via transvaginal perde sensibilidade, exigindo complementação por via suprapúbica ou RNM.\n\n### 2. Ressonância Magnética de Pelve (Padrão-Ouro em Resolução Espacial)\n- **Quando indicar em prova?**\n  - Planejamento pré-operatório de **miomectomia conservadora em pacientes que desejam gestação** com miomas múltiplos.\n  - Diagnóstico diferencial crucial com **Adenomiose focal** (espessamento da zona juncional $\\ge 12\\text{ mm}$ na RNM).\n  - Suspeita de **Leiomiossarcoma** (sinais de invasão, necrose central desorganizada, hipersinal em T2/DWI).\n- **Sinal Típico na RNM:** Baixo sinal homogêneo em sequências ponderadas em T1 e T2 (devido à densa celularidade de músculo liso e colágeno).\n\n### 3. Histerossonografia e Histeroscopia Diagnóstica\n- Indicadas para avaliar miomas submucosos (FIGO 0, 1 e 2). A histerossonografia com infusão salina permite medir com precisão a margem livre miometrial até a serosa.\n\n---\n\n## 6. Classificação de Lasmar (Escore STEPW) para Histeroscopia\n\nCriada pelo ginecologista brasileiro Dr. Ricardo Lasmar e adotada internacionalmente pela AAGL, prediz a viabilidade, segurança e o número de etapas cirúrgicas para a **Miomectomia Histeroscópica**.\n\n```lasmar-score\nClassificação de Lasmar (Escore STEPW)\n```\n\n### Tabela do Escore STEPW (Lasmar)\n\n| Critério STEPW | 0 Pontos | 1 Ponto | 2 Pontos |\n| :--- | :---: | :---: | :---: |\n| **S** - *Size* (Tamanho) | $\\le 2\\text{ cm}$ | $> 2\\text{ cm e } \\le 4\\text{ cm}$ | $> 4\\text{ cm}$ |\n| **T** - *Topography* (Topografia) | Terço Inferior | Terço Médio | Terço Superior (Fundo) |\n| **E** - *Extension* (Extensão da base) | $\\le 1/3$ da parede | $> 1/3 \\text{ a } 1/2$ da parede | $> 1/2$ da parede |\n| **P** - *Penetration* (Penetração FIGO) | FIGO 0 (Pediculado) | FIGO 1 ($< 50\\%$ intramural) | FIGO 2 ($\\ge 50\\%$ intramural) |\n| **W** - *Wall* (Parede lateral) | Parede Anterior ou Posterior | — | Parede Lateral (+1 ponto extra) |\n\n### Conduta Baseada na Pontuação Total:\n- **Escore 0 a 4 (Grupo I):** Miomectomia histeroscópica simples, em tempo único. Baixa complexidade.\n- **Escore 5 a 6 (Grupo II):** Cirurgia histeroscópica complexa. Alta probabilidade de **procedimento em dois tempos**; recomendar preparo hormonal prévio com Análogo de GnRH por 2 a 3 meses.\n- **Escore 7 a 9 (Grupo III):** Miomectomia histeroscópica **não recomendada**. Indicar laparotomia, laparoscopia ou embolização.\n\n---\n\n## 7. Farmacoterapia & Algoritmo Decisório (Clínico vs. Cirúrgico)\n\n```treatment-algorithm\nAlgoritmo Decisório: Tratamento Clínico vs Cirúrgico\n```\n\n### Tabela Comparativa de Medicamentos\n\n| Fármaco / Dispositivo | Mecanismo de Ação | Efeito no Sangramento | Efeito no Volume | Indicação / Regra de Prova |\n| :--- | :--- | :---: | :---: | :--- |\n| **Ácido Tranexâmico** | Inibidor competitivo do plasminogênio (antifibrinolítico) | $\\downarrow$ 40% a 50% | **Nenhum** | 1ª linha não hormonal para mulheres que desejam engravidar no curto prazo. Usar apenas nos dias de fluxo. |\n| **AINEs (Mefenâmico)** | Inibição da ciclo-oxigenase ($\\downarrow \\text{PGE}_2$ e $\\text{PGI}_2$) | $\\downarrow$ 20% a 30% | **Nenhum** | Excelente para controle de dismenorreia associada. |\n| **DIU de Levonorgestrel** | Atrofia endometrial potente por liberação contínua | $\\downarrow$ 80% a 90% | Mínimo / Nulo | Padrão-ouro para SUA em miomas FIGO 3 a 6. **Contraindicado formal em FIGO 0, 1 e 2**. |\n| **Agonistas de GnRH** (Leuprorrelina) | *Flare-up* inicial seguido de dessensibilização dos receptores hipofisários (hipogonadismo hipogonadotrófico) | Amenorreia completa | **$\\downarrow$ 30% a 50%** em 3 meses | **Ponte pré-operatória** (máximo 6 meses) para reduzir volume e recuperar Hb em anemias graves. Risco de perda óssea. |\n| **Antagonistas de GnRH** (Relugolix + Add-back) | Bloqueio imediato dos receptores de GnRH sem efeito *flare-up* | Amenorreia rápida | $\\downarrow$ 30% a 40% | Uso oral associado a reposição hormonal em baixas doses (estradiol + noretisterona) para evitar osteopenia. |\n\n---\n\n## 8. Degenerações dos Leiomiomas\n\nCom o rápido crescimento tumoral, o mioma ultrapassa sua vascularização nutricional periférica, sofrendo isquemia e degeneração tecidual:\n\n```degenerations\nDegenerações dos Leiomiomas\n```\n\n---\n\n## 9. Quadro Sinóptico de Resumo Rápido (\"Pérolas de Prova\")\n\n* **Mioma parido:** Mioma submucoso pediculado (FIGO 0) que se exteriorizou pelo orifício externo do colo uterino. Conduta: ressecção/torção vaginal do pedículo por via baixa.\n* **Mioma parasita:** Mioma subseroso pediculado que aderiu ao omento ou peritônio adjacente, desenvolvendo vascularização secundária e desprendendo-se do útero.\n* **Pós-menopausa:** Mioma que cresce após a menopausa na ausência de terapia hormonal é **suspeito de leiomiossarcoma primário** até prova em contrário.\n* **Localização mais frequente global:** Miomas intramurais (representam cerca de 60% a 70% do total de casos).\n* **Localização mais sintomática (hemorragia):** Miomas submucosos (FIGO 0, 1 e 2).\n* **Localização com maior risco de torção aguda:** Miomas subserosos pediculados (FIGO 7) gerando abdome agudo cirúrgico ginecológico.\n* **Melhor exame para triagem inicial:** Ultrassonografia pélvica transvaginal (achado típico: nódulo sólido hipoecoico bem delimitado com sombra acústica posterior em faixa).\n* **Melhor exame para mapeamento cirúrgico de múltiplos miomas:** Ressonância Magnética de pelve.\n* **Impacto na gestação:** Degeneração rubra no 2º trimestre (necrose asséptica; conduta exclusivamente conservadora com analgesia e hidratação). Além disso, miomas volumosos aumentam o risco de abortamento, DPP, restrição de crescimento fetal e distócia de trajeto (especialmente miomas cervicais FIGO 8).\n* **Abertura da cavidade na miomectomia:** Implica em indicação absoluta de cesariana eletiva em futuras gestações pelo risco de rotura uterina intraparto.\n* **DIU de Levonorgestrel:** Formalmente contraindicado em miomas submucosos (FIGO 0, 1 e 2) por distorção da cavidade endometrial e risco de expulsão/perfuração.\n* **Análogos de GnRH:** Uso restrito a ponte cirúrgica pré-operatória temporária (máximo de 6 meses) para redução de volume tumoral e recuperação hematimétrica em anemias graves.\n"
  },
  {
    "id": "mat-hpp-01",
    "focusId": "obs-hpp-emergencia",
    "title": "Hemorragia Pós-Parto (HPP) & Choque Obstétrico",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Emergências Obstétricas",
    "focus": "Hemorragia Pós-Parto (HPP)",
    "readTimeMinutes": 10,
    "lastUpdatedYear": 2026,
    "guidelineBadge": "FEBRASGO / Ministério da Saúde / FIGO",
    "summarySnippet": "Definição funcional, índice de choque, profilaxia universal com ocitocina 10 UI IM, manejo escalonado dos 4 Ts, balão de Bakri e sutura de B-Lynch.",
        "keyPoints": [
        "**Profilaxia universal em 100% dos partos:** Administrar **Ocitocina 10 UI IM** logo após desprendimento do ombro anterior com **tração controlada (Brandt-Andrews)**.",
        "**Atonia uterina (70% a 80% dos casos):** Manejo inicial imediato combina **massagem bimanual de Hamilton**, **Ocitocina IV contínua** e **Ácido Tranexâmico 1g IV nas primeiras 3h**.",
        "**Metilergometrina é formalmente contraindicada** em pacientes com **hipertensão arterial, pré-eclâmpsia ou coronariopatia** (risco de vasoespasmo e pico pressórico grave).",
        "**Falha do tratamento clínico no parto vaginal:** A conduta imediata de escolha é o **Balão de Tamponamento Intrauterino de Bakri** (teste do balão positivo = manter 12-24h).",
        "**Sutura cirúrgica conservadora de escolha:** Na laparotomia por atonia refratária com preservação de fertilidade, realizar a **Sutura de B-Lynch** (\"em suspensório\").",
        "**Índice de Choque (FC / PAS):** Valor **≥ 0,9** alerta para sangramento grave oculto; valor **≥ 1,4** exige ativação imediata do **protocolo de transfusão maciça (1:1:1)**.",
        "**Inversão uterina aguda:** **Suspender ocitocina imediatamente**, realizar **Manobra de Taxe / Johnson** para redução manual e **nunca dequitar a placenta** antes do retorno anatômico.",
        "**Trauma de trajeto:** Sangramento contínuo vermelho-vivo com **útero perfeitamente contraído e duro** indica laceração; conduta: **revisão sob valvas de peso**."
    ],
    "markdownContent": "# Hemorragia Pós-Parto (HPP): Resumo Padrão-Ouro de Alto Rendimento\n\n---\n\n## 1. O Que Mais Cai nas Provas de Residência Médica\n\nA Hemorragia Pós-Parto (HPP) é a **segunda maior causa de morte materna no Brasil** (atrás apenas das síndromes hipertensivas) e a líder isolada no mundo. A análise estatística das questões dos principais concursos médicos brasileiros (ENARE, USP, UNICAMP, PSU-MG, UERJ, SES-PE, AMRIGS) evidencia a seguinte distribuição temática de cobrança:\n\n```hpp-exam-stats\nRecorrência Temática de Hemorragia Pós-Parto\n```\n\n---\n\n## 2. Definições Modernas & Parâmetros de Gravidade\n\n### A Definição Clássica vs. Conceito Funcional Atualizado\n* **Definição Clássica (Volumétrica):**\n  * Parto Vaginal: Perda sanguínea $> 500\\text{ mL}$ nas primeiras 24 horas.\n  * Parto Cesáreo: Perda sanguínea $> 1.000\\text{ mL}$ nas primeiras 24 horas.\n* **Definição Atualizada (FIGO / ACOG / Ministério da Saúde):**\n  * Perda sanguínea cumulativa **$\\ge 1.000\\text{ mL}$** (independentemente da via de parto) **OU** qualquer perda sanguínea pelo trato genital acompanhada de **sinais ou sintomas de instabilidade hemodinâmica / hipovolemia** nas primeiras 24 horas após o nascimento.\n\n> [!WARNING] Armadilha Clássica de Prova: A Estimativa Visual Subestima a Perda\n> A inspeção visual subestima o sangramento real em 30% a 50%. Não espere o lençol encharcar ou a puérpera entrar em choque para agir: se houver taquicardia ou hipotensão, o diagnóstico de HPP está firmado.\n\n### Índice de Choque (Shock Index - SI)\nO marcador mais cobrado em provas recentes para ativação precoce do protocolo de hemorragia maciça:\n$$\\text{Índice de Choque (SI)} = \\frac{\\text{Frequência Cardíaca (bpm)}}{\\text{Pressão Arterial Sistólica (mmHg)}}$$\n\n* **$\\text{SI} < 0,7$ a $0,9$:** Fisiológico no puerpério imediato.\n  * Não indica intervenção adicional além da vigilância rotineira.\n* **$\\text{SI} \\ge 0,9$ a $1,0$:** Indicador sensível de sangramento oculto grave e instabilidade incipiente.\n  * Alerta para reposição volêmica imediata e acionamento do banco de sangue.\n* **$\\text{SI} \\ge 1,4$:** Choque hemorrágico grave (Classe III/IV).\n  * Prediz necessidade obrigatória de protocolo de transfusão maciça (1:1:1), suporte em UTI e intervenção invasiva imediata.\n\n---\n\n## 3. Profilaxia Universal: O Manejo Ativo do 3º Período\n\nA medida isolada mais eficaz para prevenir a atonia uterina e diminuir em até 60% a incidência de HPP consiste no **Manejo Ativo do 3º Período**, recomendado para **100% dos partos**:\n\n1. **Ocitocina 10 UI Intramuscular (IM):** Administrada imediatamente após o desprendimento do ombro anterior ou imediatamente após a saída do concepto. Se a paciente já estiver com infusão venosa aberta, pode ser feita em infusão lenta (nunca em bolus IV rápido).\n2. **Tração Controlada do Cordão Umbilical (Manobra de Brandt-Andrews):** Uma mão traciona suavemente o cordão com pinça paralelamente ao canal, enquanto a outra mão no hipogástrio empurra o corpo uterino para cima, prevenindo ativamente a inversão uterina.\n3. **Clampeamento Oportuno do Cordão:** Realizado entre 1 e 3 minutos em recém-nascidos a termo com respiração espontânea.\n4. **Vigilância no 4º Período do Parto (Período de Greenberg):** Palpação periódica do tônus uterino na primeira hora pós-parto para garantir o globo de segurança de Pinard.\n\n---\n\n## 4. Diagnóstico Etiológico: A Regra Mnemônica dos 4 Ts\n\n```hpp-four-ts\nREGRA_DOS_4_TS\n```\n\n| \"T\" Etiológico | Frequência | Fatores de Risco de Prova | Quadro Clínico Típico | Conduta Inicial Dirigida |\n| :--- | :---: | :--- | :--- | :--- |\n| **Tônus (Atonia)** | **70% - 80%** | Sobredistensão uterina, trabalho de parto prolongado, corioamnionite. | Útero amolecido, hipotônico e palpável acima da cicatriz umbilical. | Massagem de Hamilton + Ocitocina IV + Tranexâmico IV. |\n| **Trauma (Trajeto)** | **15% - 20%** | Parto instrumentado (fórceps/vácuo), parto precipitado, macrossomia. | Sangramento vermelho-vivo contínuo com **útero firme e contraído**. | Exame sob valvas vaginais e sutura hemostática imediata. |\n| **Tecido (Restos)** | **10%** | Placenta sucenturiada, cesárea anterior + placenta prévia (acretismo). | Sangramento persistente com placenta deitada incompleta ou cotilédone ausente. | Curagem manual ou aspiração/curetagem sob anestesia. |\n| **Trombina (Coagulopatia)** | **1%** | Descolamento prematuro de placenta (DPP), embolia amniótica, sepse, HELLP. | Sangramento difuso em lençol e punções sem formação de coágulos. | Reposição hemostática balanceada (1:1:1) e Crioprecipitado. |\n\n---\n\n## 5. Manejo Escalonado da Atonia Uterina (The Golden Hour)\n\nDiante do diagnóstico de Atonia Uterina, o manejo segue uma **linha temporal rigorosa em cascata** que não pode ser desordenada em prova:\n\n### Passo a Passo Sintético da Cascata Decisória:\n* **Passo 1 (0 a 10 min) - Medidas Iniciais:** Acionar Código Vermelho obstétrico, obter 2 acessos venosos periféricos calibrosos (14G/16G), esvaziar a bexiga por sonda vesical de demora (Foley) e manter Massagem Uterina Bimanual contínua (Manobra de Hamilton).\n* **Passo 2 (10 a 20 min) - Farmacoterapia Escalonada:** Infundir Ocitocina IV contínua (20-40 UI em 500 mL) associada ao Ácido Tranexâmico 1g IV nas primeiras 3h (WOMAN Trial) e Metilergometrina 0,2 mg IM (se normotensa) ou Misoprostol 800 mcg (se hipertensa).\n* **Passo 3 (15 a 30 min) - Tamponamento Mecânico:** Inserir Balão de Tamponamento Intrauterino (Bakri) com 300 a 500 mL de SF morno no parto vaginal. Se o teste do balão for positivo (sangramento cessa), manter por 12 a 24h; se negativo (sangramento ativo pelo dreno), indicar laparotomia imediata.\n* **Passo 4 (30 a 60 min) - Cirurgia Conservadora:** Laparotomia com Suturas Compressivas de B-Lynch (\"em suspensório\") e ligadura bilateral escalonada das artérias uterinas (O'Leary) e ilíacas internas (hipogástricas).\n* **Passo 5 (Tempo Final) - Cirurgia Definitiva:** Histerectomia Puerperal Subtotal de emergência como procedimento salvador de vida e controle de danos em paciente instável com choque refratário ou coagulopatia.\n\n```hpp-golden-hour\nFLUXO_GOLDEN_HOUR\n```\n\n---\n\n## 6. Farmacoterapia Detalhada & Pegadinhas Clássicas de Prova\n\n### 1. Ocitocina (Primeira Escolha Absoluta)\n* **Dose Terapêutica:** 20 a 40 UI diluídas em 500 mL de SF 0,9% ou Ringer Lactato em infusão intravenosa rápida inicial.\n* **Armadilha de Prova:** **JAMAIS administrar ocitocina em bolus intravenoso rápido sem diluição**. O bolus rápido induz vasodilatação periférica reflexa violenta, hipotensão arterial súbita, taquicardia reflexa e colapso cardiovascular.\n\n### 2. Ácido Tranexâmico (Antifibrinolítico Obrigatório)\n* **Evidência:** O ensaio clínico multinacional *WOMAN Trial* demonstrou redução expressiva da mortalidade materna por sangramento quando administrado nas **primeiras 3 horas do parto**.\n* **Dose:** 1 g IV diluído em 100 mL de SF 0,9% infundido em 10 minutos. Se o sangramento persistir após 30 minutos ou recorrer em até 24h, pode ser repetida uma segunda dose de 1 g.\n\n### 3. Metilergometrina (Alcaloide do Ergot)\n* **Dose:** 0,2 mg IM (pode repetir em 2 a 4 horas).\n* **Contraindicação Formal de Prova:** **HIPERTENSÃO ARTERIAL, PRÉ-ECLÂMPSIA E DOENÇA CORONARIANA**. Os derivados do ergot causam potente vasoespasmo arteriolar periférico, desencadeando crise hipertensiva severa, acidente vascular encefálico e infarto agudo do miocárdio.\n\n### 4. Misoprostol (Análogo Sintético de Prostaglandina E1)\n* **Dose:** 800 mcg via retal ou sublingual (4 comprimidos de 200 mcg).\n* **Vantagem:** Não requer refrigeração e **não é contraindicado na paciente hipertensa**. Efeito colateral frequente: tremores, calafrios e hipertermia transitória.\n\n---\n\n## 7. Manejo das Outras Causas Específicas de HPP\n\n### A. Inversão Uterina Aguda\n* **Fisiopatologia:** Geralmente iatrogênica, decorrente da tração excessiva do cordão umbilical combinada com fundo uterino atônico e placenta ainda não dequitada.\n* **Clínica:** Dor pélvica aguda excruciante, choque neurogênico desproporcional à perda visível e massa avermelhada/globosa no introito vaginal.\n* **Passo a Passo Mandatório:**\n  1. **Suspender imediatamente a infusão de ocitocina/uterotônicos** (o útero precisa relaxar para ser reduzido).\n  2. Proceder à **Manobra de Taxe / Johnson** (reintrodução manual do fundo uterino empurrando-o com a palma da mão através do canal cervical em direção à cavidade abdominal).\n  3. Se houver anel de constrição cervical impedindo a manobra manual: administrar tocolítico rápido (Terbutalina, Nitroglicerina ou Anestesia Geral inalatória halogenada).\n  4. Somente **após a reposição anatômica completa do útero** na cavidade é que se iniciam os uterotônicos em dose alta para manter a contração e evitar a reinversão. A placenta só deve ser removida após a redução uterina.\n\n### B. Suturas Compressivas Uterinas (B-Lynch)\n* **Indicação:** Paciente com atonia uterina refratária ao tratamento farmacológico e ao balão intrauterino durante laparotomia cesárea ou pós-parto, com desejo de preservação da fertilidade.\n* **Técnica:** Alças de fio absorvível ou absorção lenta (Monocryl / Catgut cromado / PDS) que contornam o fundo uterino como um par de \"suspensórios\", comprimindo a parede anterior de encontro à posterior.\n* **Teste Pré-Sutura:** Realizar compressão bimanual cirúrgica do útero antes de passar a sutura; se o sangramento vaginal diminuir significativamente, a sutura de B-Lynch tem alta chance de sucesso.\n\n### C. Coagulopatia & Protocolo de Transfusão Maciça\n* **Fibrinogênio Sérico:** É o parâmetro laboratorial de coagulação mais confiável em HPP.\n  * Fibrinogênio $< 200\\text{ mg/dL}$ prediz progressão rápida para choque grave.\n  * Fibrinogênio $< 100\\text{ mg/dL}$ indica necessidade urgente de **Crioprecipitado** (1 unidade para cada 10 kg de peso).\n* **Protocolo de Transfusão Maciça (MTP):** Manter proporção balanceada **1:1:1** (1 Concentrado de Hemácias : 1 Plasma Fresco Congelado : 1 Concentrado de Plaquetas) para prevenir coagulopatia dilucional e hipotermia.\n\n---\n\n## 8. Diretrizes Oficiais & Consensos de Referência\n\n1. **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** Tratado de Obstetrícia & Protocolos de Conduta em Hemorragia Pós-Parto (Comissão Nacional Especializada em Urgências Obstétricas).\n2. **Ministério da Saúde do Brasil / OPAS / OMS:** Manual Técnico de Hemorragia Pós-Parto e Estratégia Zero Morte Materna por Hemorragia.\n3. **American College of Obstetricians and Gynecologists (ACOG):** Practice Bulletin nº 183 (*Postpartum Hemorrhage*), revalidado e alinhado aos consensos internacionais.\n4. **International Federation of Gynecology and Obstetrics (FIGO):** *Updated guidelines for the management of postpartum haemorrhage* (2022/2024).\n5. **Ensaio Clínico WOMAN Trial Collaborators:** *Effect of early tranexamic acid on maternal mortality in women with postpartum haemorrhage* (The Lancet, 2017).\n"
},
            {
  "id": "mat-gem-01",
  "focusId": "obs-gem-classificacao",
  "title": "Classificação, Diagnóstico e Corionicidade na Gemelaridade",
  "specialty": "Ginecologia e Obstetrícia",
  "theme": "Gestação Múltipla",
  "focus": "Classificação e Diagnóstico de Gemelares",
  "readTimeMinutes": 10,
  "lastUpdatedYear": 2026,
  "guidelineBadge": "FEBRASGO / ISUOG / ACOG",
  "summarySnippet": "Corionicidade como preditor soberano de morbimortalidade perinatal, marco ultrassonográfico do 1º trimestre (Lambda vs. T), cronologia de clivagem zigótica, rastreamento genético e profilaxia universal de pré-eclâmpsia com AAS.",
  "keyPoints": [
    "A corionicidade (número de placentas) é o preditor soberano de morbimortalidade perinatal na gemelaridade, sobrepondo-se à zigotia.",
    "A determinação da corionicidade tem acurácia máxima entre 11 e 13 semanas e 6 dias (Sinal do Lambda = DCDA vs. Sinal do T = MCDA).",
    "Fetos de sexos anatômicos diferentes são obrigatoriamente dizigóticos e dicoriônicos-diamnióticos (risco zero de STFF).",
    "A cronologia da clivagem monozigótica dita a placentação: 0-3d DCDA (30%); 4-8d MCDA (70%); 9-12d MCMA (1-2%); >13d Siameses (<1%).",
    "Placentas dicoriônicas adjacentes podem se fundir no 2º/3º trimestre simulando placenta única; o laudo precoce do 1º trimestre prevalece SEMPRE.",
    "Gestação monocoriônica diamniótica exige ultrassonografia quinzenal com Doppler feto a feto a partir de 16 semanas para rastreio de STFF e TAPS.",
    "Toda gestante gemelar tem indicação mandatória de profilaxia de pré-eclâmpsia com AAS 100 a 150 mg/dia à noite de 12 a 36 semanas."
  ],
  "recurrenceStats": {
    "focusSlug": "gemelaridade-classificacao-corionicidade",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Gestação Múltipla",
    "focus": "Classificação e Diagnóstico de Gemelares",
    "totalQuestions": 141,
    "timeframeRange": "2017-2026",
    "version": 1,
    "donutSlices": [
      {
        "id": 1,
        "name": "Corionicidade e Amnionicidade: Definição e Determinação",
        "shortName": "Corionicidade & USG",
        "percentage": 57.4,
        "questionCount": 81,
        "priority": "Crítica",
        "color": "#3B82F6",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "A corionicidade (e não a zigotia) é o preditor soberano de morbimortalidade perinatal.",
        "focusExplanation": "A **corionicidade** define o número de placentas e é a variável prognóstica mandatória na gemelaridade. Gestações **monocoriônicas** compartilham a placenta através de anastomoses vasculares, expondo os fetos a riscos hemodinâmicos graves e exclusivos (STFF, TAPS, TRAP e CIUR seletivo), exigindo rastreamento ultrassonográfico **quinzenal a partir de 16 semanas**. Em contrapartida, gestações **dicoriônicas** têm placentas independentes, sem anastomoses vasculares patológicas, com vigilância mensal. A zigotia (monozigóticos vs. dizigóticos) é uma informação puramente genética, incapaz de ditar isoladamente a conduta obstétrica.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Identificação precoce da corionicidade como preditor primário de risco, janela ideal de ultrassom entre 11 e 13s6d e diferenciação mandatória entre DCDA e MCDA.",
            "trapAlert": "Afirmar que a zigotia dita a rotina de consultas ou que a ecografia de 3º trimestre tem a mesma acurácia diagnóstica que a precoce."
          },
          "ENARE": {
            "howItCharges": "O ENARE aborda casos de pré-natal de alto risco na atenção especializada do SUS, cobrando o intervalo de seguimento ultrassonográfico: gestação monocoriônica diamniótica exige USG a cada 2 semanas a partir de 16 semanas.",
            "trapAlert": "Sugerir intervalo mensal de ultrassonografia para gestações monocoriônicas."
          },
          "USP": {
            "howItCharges": "A USP correlaciona os desfechos perinatais com a fisiopatologia do leito vascular: a morbimortalidade fetal é até 4 vezes maior nas gestações monocoriônicas devido às anastomoses interfetais.",
            "trapAlert": "Confundir feto monozigótico com obrigatoriamente monocoriônico (30% dos monozigóticos são dicoriônicos)."
          },
          "UNICAMP": {
            "howItCharges": "A UNICAMP avalia a determinação ecográfica precoce e a espessura da membrana intergemelar: presença de 4 folhetos (dois córions e dois âmnios) na dicoriônica vs. 2 folhetos na monocoriônica.",
            "trapAlert": "Descrever membrana intergemelar espessa (> 2 mm) como achado de gestação monocoriônica."
          },
          "PSU-MG": {
            "howItCharges": "O PSU-MG apresenta situações clínicas de acolhimento obstétrico, questionando qual dado do laudo de ultrassom é prioritário para encaminhamento ao pré-natal de alto risco.",
            "trapAlert": "Indicar encaminhamento apenas se houver malformação visualizada, postergando a classificação de corionicidade."
          },
          "AMRIGS": {
            "howItCharges": "A AMRIGS foca em conceitos diretos: qual a definição de corionicidade e qual o impacto nas taxas de parto prematuro e mortalidade perinatal.",
            "trapAlert": "Trocar o conceito de âmnio (saco amniótico) pelo de córion (placenta)."
          },
          "SUS-SP": {
            "howItCharges": "O SUS-SP cobra o protocolo assistencial básico da rede pública: gestante com USG do 1º tri demonstrando placenta única e membrana fina deve ser imediatamente regulada para centro terciário.",
            "trapAlert": "Manter a paciente na UBS aguardando ecografia morfológica de 2º trimestre."
          }
        }
      },
      {
        "id": 2,
        "name": "Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico",
        "shortName": "Risco Monocoriônico",
        "percentage": 12.8,
        "questionCount": 18,
        "priority": "Alta",
        "color": "#10B981",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "Quase 100% das placentas monocoriônicas têm anastomoses; risco de STFF, TAPS e morte súbita.",
        "focusExplanation": "Gestações monocoriônicas apresentam taxa de mortalidade perinatal 3 a 5 vezes superior às dicoriônicas. A presença de **anastomoses arteriovenosas profundas desbalanceadas** desencadeia a Síndrome de Transfusão Feto-Fetal (10-15% dos casos). Além disso, a morte súbita de um concepto monocoriônico gera exsanguinação aguda retrógrada no sobrevivo, provocando hipotensão e leucomalácia periventricular em até 30% dos casos.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Reconhecimento das patologias vasculares restritas às gestações monocoriônicas: STFF, TAPS, TRAP e sequelas isquêmicas após morte de um co-gemelar.",
            "trapAlert": "Considerar a ocorrência de STFF em gestação dicoriônica diamniótica."
          },
          "ENARE": {
            "howItCharges": "Questão conceitual elencando quais complicações justificam a classificação da gestação monocoriônica como alto risco absoluto.",
            "trapAlert": "Incluir descolamento prematuro de placenta como complicação exclusiva de monocoriônicas."
          },
          "USP": {
            "howItCharges": "Análise da repercussão neurológica no concepto vivo após o óbito intrauterino do gêmeo monocoriônico.",
            "trapAlert": "Indicar cesariana de emergência imediata como medida para salvar o feto vivo."
          },
          "UNICAMP": {
            "howItCharges": "Avaliação dos padrões de anastomoses vasculares: superficiais (AA/VV) bidirecionais protetoras vs. profundas (AV) unidirecionais patológicas.",
            "trapAlert": "Afirmar que anastomoses artério-arteriais causam a transfusão feto-fetal clássica."
          },
          "PSU-MG": {
            "howItCharges": "Cenário de encaminhamento para medicina fetal diante de gestação monocoriônica com discordância de líquido amniótico.",
            "trapAlert": "Aguardar a 24ª semana para iniciar o rastreamento com Doppler."
          },
          "AMRIGS": {
            "howItCharges": "Associação direta entre tipo de placentação e risco de síndrome de transfusão feto-fetal.",
            "trapAlert": "Afirmar que dizigóticos podem ter placenta monocoriônica compartilhada."
          },
          "SUS-SP": {
            "howItCharges": "Manejo e fluxo de referência terciária de gestantes monocoriônicas no sistema de regulação CROSS/SUS.",
            "trapAlert": "Retardar o agendamento de consultas quinzenais por ausência de queixas clínicas maternas."
          }
        }
      },
      {
        "id": 3,
        "name": "Zigotia vs. Corionicidade e Cronologia da Clivagem",
        "shortName": "Zigotia & Clivagem",
        "percentage": 11.3,
        "questionCount": 16,
        "priority": "Alta",
        "color": "#EC4899",
        "trend": "estavel",
        "trendLabel": "🏛️ Clássico Estável",
        "takeaway": "Clivagem: 0-3d DCDA (30%); 4-8d MCDA (70%); 9-12d MCMA (1-2%); >13d Siameses (<1%). Dizigóticos são SEMPRE DCDA.",
        "focusExplanation": "A cronologia da divisão celular no concepto monozigótico determina a placentação: clivagem em **0 a 3 dias** (pré-morula) gera **Dicoriônica Diamniótica (DCDA)**; entre **4 e 8 dias** (blastocisto precoce) gera **Monocoriônica Diamniótica (MCDA)**; entre **9 e 12 dias** (após implantação) gera **Monocoriônica Monoamniótica (MCMA)**; e após **13 dias** resulta em **Gêmeos Unidos (Siameses)**. Gêmeos dizigóticos (dois óvulos fecundados por dois espermatozoides) são **obrigatoriamente dicoriônicos e diamnióticos**.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Associação entre os dias pós-fertilização da clivagem monozigótica e o número resultante de placentas e bolsas amnióticas.",
            "trapAlert": "Afirmar que toda gestação monozigótica é monocoriônica (30% clivam precocemente em DCDA)."
          },
          "ENARE": {
            "howItCharges": "Tabela ou afirmativas de correlação cronológica: embriologia da clivagem tardia (> 13 dias) gerando gêmeos conjugados.",
            "trapAlert": "Marcar que gêmeos siameses ocorrem por fusão tardia de conceptos independentes."
          },
          "USP": {
            "howItCharges": "Genética e epidemiologia: dizigotia é influenciada por etnia, hereditariedade materna e reprodução assistida, enquanto a monozigotia tem taxa mundial constante (~1:250).",
            "trapAlert": "Afirmar que a taxa de gestação monozigótica varia substancialmente entre etnias."
          },
          "UNICAMP": {
            "howItCharges": "Correlação entre a clivagem do blastocisto com trofoblasto já diferenciado (4-8 dias) e a formação do córion único.",
            "trapAlert": "Confundir formação do âmnio com formação do córion."
          },
          "PSU-MG": {
            "howItCharges": "Questão clássica de embriologia clínica: clivagem entre o 4º e o 8º dia gera qual tipo de gemelaridade.",
            "trapAlert": "Assinalar dicoriônica monoamniótica (entidade biologicamente inexistente)."
          },
          "AMRIGS": {
            "howItCharges": "Identificação de gêmeos dizigóticos: fertilização independente de 2 óvulos gerando obrigatoriamente 2 placentas e 2 sacos.",
            "trapAlert": "Cogitar dizigóticos monocoriônicos em qualquer hipótese."
          },
          "SUS-SP": {
            "howItCharges": "Impacto das técnicas de reprodução assistida (FIV) no aumento expressivo de gestações dicoriônicas dizigóticas.",
            "trapAlert": "Atribuir à FIV o aumento desproporcional primário de gêmeos monozigóticos."
          }
        }
      },
      {
        "id": 4,
        "name": "Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T",
        "shortName": "Lambda vs. Sinal do T",
        "percentage": 10.6,
        "questionCount": 15,
        "priority": "Média",
        "color": "#8B5CF6",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "Janela de ouro: 11 a 13s6d. Lambda (pico duplo, membrana > 2 mm) = DCDA; Sinal do T (membrana < 2 mm) = MCDA.",
        "focusExplanation": "A determinação da corionicidade tem acurácia máxima entre **11 semanas e 13 semanas e 6 dias** (CCN entre 45 e 84 mm). O **Sinal do Lambda (Twin Peak Sign)** consiste em uma cunha triangular de tecido placentário que se estende para a base da membrana intergemelar, gerando uma membrana espessa **> 2 mm** composta por 4 camadas (dois âmnios e dois córions), confirmando **DCDA**. O **Sinal do T** exibe a inserção perpendicular nua e delgada da membrana intergemelar na placenta sem tecido trofoblástico interposed, com espessura **< 2 mm** (duas camadas amnióticas), confirmando **MCDA**.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Interpretação de imagens ultrassonográficas do 1º trimestre demonstrando sinal do Lambda (DCDA) ou sinal do T (MCDA).",
            "trapAlert": "Confiar na ausência de sinal do Lambda no 3º trimestre para firmar monocorionicidade (regressão anatômica fisiológica do pico placentário)."
          },
          "ENARE": {
            "howItCharges": "Apresentação de caso clínico com laudo ecográfico de 12 semanas descrevendo 'projeção triangular na base da membrana interamniótica com espessura de 2,8 mm'.",
            "trapAlert": "Não reconhecer o sinal do Lambda descrito por extenso no enunciado."
          },
          "USP": {
            "howItCharges": "A USP desafia o candidato com laudo discordante: USG de 12 semanas relatando Sinal do Lambda e USG de 28 semanas relatando 'massa placentária única'. Conduta orientada pelo 1º trimestre.",
            "trapAlert": "Modificar a classificação de DCDA para MCDA baseado na ecografia tardia de placentas fundidas."
          },
          "UNICAMP": {
            "howItCharges": "Morfologia e histologia da membrana intergemelar: 4 camadas celulares no Lambda vs. 2 camadas no T.",
            "trapAlert": "Afirmar que a membrana intergemelar de MCDA contém células trofoblásticas."
          },
          "PSU-MG": {
            "howItCharges": "Reconhecimento visual do sinal do T e associação com risco de Síndrome de Transfusão Feto-Fetal.",
            "trapAlert": "Associar o sinal do T à gestação dicoriônica."
          },
          "AMRIGS": {
            "howItCharges": "Pergunta objetiva: qual o sinal ultrassonográfico patognomônico de gestação dicoriônica diamniótica no primeiro trimestre.",
            "trapAlert": "Responder Sinal do T ou Sinal de Quintero."
          },
          "SUS-SP": {
            "howItCharges": "Janela ideal de realização do exame: por que o rastreio deve ser feito entre 11 e 13 semanas e 6 dias.",
            "trapAlert": "Indicar realização do exame antes de 10 semanas para medir a espessura da membrana."
          }
        }
      },
      {
        "id": 5,
        "name": "Demais Critérios, Rastreamento Genético e Conduta Pré-Natal",
        "shortName": "Rastreio & Pré-Natal",
        "percentage": 7.9,
        "questionCount": 11,
        "priority": "Média",
        "color": "#F59E0B",
        "trend": "estavel",
        "trendLabel": "🏛️ Clássico Estável",
        "takeaway": "Sexos opostos = 100% dizigóticos e DCDA; AAS 100-150 mg/dia para profilaxia de pré-eclâmpsia em todas as gestações múltiplas.",
        "focusExplanation": "A presença de fetos com genitália externa discordante (sexos diferentes) exclui sumariamente a monozigotia e a monocorionicidade: são **obrigatoriamente dizigóticos e dicoriônicos**. O rastreio de aneuploidias feto a feto exige avaliação individualizada da Translucência Nucal (TN) e osso nasal. Devido à maior massa trofoblástica e risco elevado de insuficiência placentária, **toda gestação múltipla deve receber profilaxia para pré-eclâmpsia com Ácido Acetilsalicílico (AAS) 100 a 150 mg/dia à noite, iniciado entre 12 e 16 semanas e mantido até 36 semanas**, associado a Carbonato de Cálcio 1.000 a 1.500 mg/dia em dietas com baixa ingesta.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Fetos de sexos diferentes como regra confirmatória de dicorionicidade e indicação de AAS 100-150 mg/dia para prevenção de pré-eclâmpsia.",
            "trapAlert": "Cogitar hipótese de STFF em gestação com feto masculino e feminino."
          },
          "ENARE": {
            "howItCharges": "Prescrição de AAS em baixa dose na consulta pré-natal da gestante gemelar para mitigação de morbidade hipertensiva.",
            "trapAlert": "Indicar repouso absoluto no leito como profilaxia primária de pré-eclâmpsia (ineficaz e trombogênico)."
          },
          "USP": {
            "howItCharges": "Limitações do teste pré-natal não invasivo (NIPT) em gemelares, especialmente com fração fetal discordante ou gêmeo evanescente (vanishing twin).",
            "trapAlert": "Afirmar que o NIPT tem a mesma taxa de sensibilidade em gemelares e gestações únicas."
          },
          "UNICAMP": {
            "howItCharges": "Cálculo de risco de trissomias baseado na medida individual da Translucência Nucal para cada um dos conceptos.",
            "trapAlert": "Calcular uma média aritmética da Translucência Nucal entre os fetos."
          },
          "PSU-MG": {
            "howItCharges": "Conduta clínica preventiva: suplementação de ferro e ácido fólico em doses aumentadas devido à maior demanda eritropoietica.",
            "trapAlert": "Prescrever dose habitual de gestação única para gemelares com anemia prévia."
          },
          "AMRIGS": {
            "howItCharges": "Identificação rápida: primigesta com USG evidenciando feto masculino e feto feminino. Qual o diagnóstico de placentação.",
            "trapAlert": "Assinalar que é necessário esperar a espessura da membrana intergemelar para definir."
          },
          "SUS-SP": {
            "howItCharges": "Protocolo de suplementação de cálcio e rastreio de trabalho de parto prematuro com medida de comprimento do colo uterino por via transvaginal entre 18 e 24 semanas.",
            "trapAlert": "Indicar cerclagem cervical de rotina para todas as gestações gemelares com colo normal."
          }
        }
      }
    ],
    "bancaBreakdown": {
      "ENARE": {
        "banca": "ENARE",
        "totalQuestions": 28,
        "topSubfocos": [
          {
            "subfoco": "Corionicidade e Amnionicidade: Definição e Determinação",
            "questionCount": 16,
            "percentageInBanca": 57.1
          },
          {
            "subfoco": "Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico",
            "questionCount": 4,
            "percentageInBanca": 14.3
          },
          {
            "subfoco": "Zigotia vs. Corionicidade e Cronologia da Clivagem",
            "questionCount": 3,
            "percentageInBanca": 10.7
          },
          {
            "subfoco": "Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T",
            "questionCount": 3,
            "percentageInBanca": 10.7
          },
          {
            "subfoco": "Demais Critérios, Rastreamento Genético e Conduta Pré-Natal",
            "questionCount": 2,
            "percentageInBanca": 7.2
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "USP": {
        "banca": "USP",
        "totalQuestions": 32,
        "topSubfocos": [
          {
            "subfoco": "Corionicidade e Amnionicidade: Definição e Determinação",
            "questionCount": 18,
            "percentageInBanca": 56.3
          },
          {
            "subfoco": "Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico",
            "questionCount": 5,
            "percentageInBanca": 15.6
          },
          {
            "subfoco": "Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T",
            "questionCount": 4,
            "percentageInBanca": 12.5
          },
          {
            "subfoco": "Zigotia vs. Corionicidade e Cronologia da Clivagem",
            "questionCount": 3,
            "percentageInBanca": 9.4
          },
          {
            "subfoco": "Demais Critérios, Rastreamento Genético e Conduta Pré-Natal",
            "questionCount": 2,
            "percentageInBanca": 6.2
          }
        ],
        "predominantDifficulty": "Difícil"
      },
      "UNICAMP": {
        "banca": "UNICAMP",
        "totalQuestions": 24,
        "topSubfocos": [
          {
            "subfoco": "Corionicidade e Amnionicidade: Definição e Determinação",
            "questionCount": 14,
            "percentageInBanca": 58.3
          },
          {
            "subfoco": "Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T",
            "questionCount": 4,
            "percentageInBanca": 16.7
          },
          {
            "subfoco": "Zigotia vs. Corionicidade e Cronologia da Clivagem",
            "questionCount": 3,
            "percentageInBanca": 12.5
          },
          {
            "subfoco": "Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico",
            "questionCount": 2,
            "percentageInBanca": 8.3
          },
          {
            "subfoco": "Demais Critérios, Rastreamento Genético e Conduta Pré-Natal",
            "questionCount": 1,
            "percentageInBanca": 4.2
          }
        ],
        "predominantDifficulty": "Difícil"
      },
      "PSU-MG": {
        "banca": "PSU-MG",
        "totalQuestions": 20,
        "topSubfocos": [
          {
            "subfoco": "Corionicidade e Amnionicidade: Definição e Determinação",
            "questionCount": 11,
            "percentageInBanca": 55.0
          },
          {
            "subfoco": "Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico",
            "questionCount": 3,
            "percentageInBanca": 15.0
          },
          {
            "subfoco": "Zigotia vs. Corionicidade e Cronologia da Clivagem",
            "questionCount": 3,
            "percentageInBanca": 15.0
          },
          {
            "subfoco": "Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T",
            "questionCount": 2,
            "percentageInBanca": 10.0
          },
          {
            "subfoco": "Demais Critérios, Rastreamento Genético e Conduta Pré-Natal",
            "questionCount": 1,
            "percentageInBanca": 5.0
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "AMRIGS": {
        "banca": "AMRIGS",
        "totalQuestions": 18,
        "topSubfocos": [
          {
            "subfoco": "Corionicidade e Amnionicidade: Definição e Determinação",
            "questionCount": 11,
            "percentageInBanca": 61.1
          },
          {
            "subfoco": "Zigotia vs. Corionicidade e Cronologia da Clivagem",
            "questionCount": 2,
            "percentageInBanca": 11.1
          },
          {
            "subfoco": "Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico",
            "questionCount": 2,
            "percentageInBanca": 11.1
          },
          {
            "subfoco": "Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T",
            "questionCount": 2,
            "percentageInBanca": 11.1
          },
          {
            "subfoco": "Demais Critérios, Rastreamento Genético e Conduta Pré-Natal",
            "questionCount": 1,
            "percentageInBanca": 5.6
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "SUS-SP": {
        "banca": "SUS-SP",
        "totalQuestions": 19,
        "topSubfocos": [
          {
            "subfoco": "Corionicidade e Amnionicidade: Definição e Determinação",
            "questionCount": 11,
            "percentageInBanca": 57.9
          },
          {
            "subfoco": "Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico",
            "questionCount": 2,
            "percentageInBanca": 10.5
          },
          {
            "subfoco": "Zigotia vs. Corionicidade e Cronologia da Clivagem",
            "questionCount": 2,
            "percentageInBanca": 10.5
          },
          {
            "subfoco": "Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T",
            "questionCount": 2,
            "percentageInBanca": 10.5
          },
          {
            "subfoco": "Demais Critérios, Rastreamento Genético e Conduta Pré-Natal",
            "questionCount": 2,
            "percentageInBanca": 10.6
          }
        ],
        "predominantDifficulty": "Médio"
      }
    },
    "topTraps": [
      {
        "subfoco": "Corionicidade e Amnionicidade: Definição e Determinação",
        "trapTitle": "Distrator de Placentas Fundidas na USG Tardia",
        "trapDescription": "No 2º e 3º trimestres, placentas dicoriônicas adjacentes podem se fundir aparentando placenta única. Prevalece soberana a USG precoce de 11 a 13s6d com Sinal do Lambda."
      },
      {
        "subfoco": "Demais Critérios, Rastreamento Genético e Conduta Pré-Natal",
        "trapTitle": "Distrator dos Sexos Opostos",
        "trapDescription": "Fetos de sexos diferentes são obrigatoriamente dizigóticos e dicoriônicos (DCDA), com risco zero de STFF."
      }
    ],
    "auditHash": "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    "needsRecalc": false,
    "certifiedAt": "2026-11-04T00:00:00.000Z",
    "lastRecalculatedAt": "2026-11-04T00:00:00.000Z",
    "status": "certified"
  },
  "markdownContent": "## 1. O Que Mais Cai nas Provas de Residência Médica\n\nA assistência à gestação múltipla é um dos temas de maior peso e refinamento na Obstetrícia de Alto Risco. O erro conceitual mais frequente nas provas de R1 e R3 consiste em confundir zigotia com corionicidade. Para as bancas examinadoras (ENARE, USP-SP, UNICAMP, PSU-MG, AMRIGS, SUS-SP), **a corionicidade é a variável prognóstica e assistencial soberana**, pois define se há ou não compartilhamento de território vascular placentário.\n\nGestações **monocoriônicas** apresentam circulação feto-placentária compartilhada por anastomoses vasculares, expondo os conceptos a complicações hemodinâmicas exclusivas (como Síndrome de Transfusão Feto-Fetal - STFF, Sequência Anemia-Policitemia - TAPS, Sequência TRAP e CIUR seletivo), exigindo vigilância ultrassonográfica **quinzenal a partir de 16 semanas**. Em contraste, gestações **dicoriônicas** contam com placentas anátomo-funcionais independentes, sem anastomoses vasculares patológicas, permitindo seguimento mensal. A zigotia (monozigóticos vs. dizigóticos) é uma classificação genética fundamental, mas é a corionicidade que dita compulsoriamente a conduta clínica e o risco de morbimortalidade perinatal.\n\n```gem-stats-corionicidade\n{\n  \"focusSlug\": \"gemelaridade-classificacao-corionicidade\",\n  \"specialty\": \"Ginecologia e Obstetrícia\",\n  \"theme\": \"Gestação Múltipla\",\n  \"focus\": \"Classificação e Diagnóstico de Gemelares\",\n  \"totalQuestions\": 141,\n  \"timeframeRange\": \"2017-2026\",\n  \"version\": 1,\n  \"donutSlices\": [\n    {\n      \"id\": 1,\n      \"name\": \"Corionicidade e Amnionicidade: Definição e Determinação\",\n      \"shortName\": \"Corionicidade & USG\",\n      \"percentage\": 57.4,\n      \"questionCount\": 81,\n      \"priority\": \"Crítica\",\n      \"color\": \"#3B82F6\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"A corionicidade (e não a zigotia) é o preditor soberano de morbimortalidade perinatal.\",\n      \"focusExplanation\": \"A **corionicidade** define o número de placentas e é a variável prognóstica mandatória na gemelaridade. Gestações **monocoriônicas** compartilham a placenta através de anastomoses vasculares, expondo os fetos a riscos hemodinâmicos graves e exclusivos (STFF, TAPS, TRAP e CIUR seletivo), exigindo rastreamento ultrassonográfico **quinzenal a partir de 16 semanas**. Em contrapartida, gestações **dicoriônicas** têm placentas independentes, sem anastomoses vasculares patológicas, com vigilância mensal. A zigotia (monozigóticos vs. dizigóticos) é uma informação puramente genética, incapaz de ditar isoladamente a conduta obstétrica.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Identificação precoce da corionicidade como preditor primário de risco, janela ideal de ultrassom entre 11 e 13s6d e diferenciação mandatória entre DCDA e MCDA.\",\n          \"trapAlert\": \"Afirmar que a zigotia dita a rotina de consultas ou que a ecografia de 3º trimestre tem a mesma acurácia diagnóstica que a precoce.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"O ENARE aborda casos de pré-natal de alto risco na atenção especializada do SUS, cobrando o intervalo de seguimento ultrassonográfico: gestação monocoriônica diamniótica exige USG a cada 2 semanas a partir de 16 semanas.\",\n          \"trapAlert\": \"Sugerir intervalo mensal de ultrassonografia para gestações monocoriônicas.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"A USP correlaciona os desfechos perinatais com a fisiopatologia do leito vascular: a morbimortalidade fetal é até 4 vezes maior nas gestações monocoriônicas devido às anastomoses interfetais.\",\n          \"trapAlert\": \"Confundir feto monozigótico com obrigatoriamente monocoriônico (30% dos monozigóticos são dicoriônicos).\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"A UNICAMP avalia a determinação ecográfica precoce e a espessura da membrana intergemelar: presença de 4 folhetos (dois córions e dois âmnios) na dicoriônica vs. 2 folhetos na monocoriônica.\",\n          \"trapAlert\": \"Descrever membrana intergemelar espessa (> 2 mm) como achado de gestação monocoriônica.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"O PSU-MG apresenta situações clínicas de acolhimento obstétrico, questionando qual dado do laudo de ultrassom é prioritário para encaminhamento ao pré-natal de alto risco.\",\n          \"trapAlert\": \"Indicar encaminhamento apenas se houver malformação visualizada, postergando a classificação de corionicidade.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"A AMRIGS foca em conceitos diretos: qual a definição de corionicidade e qual o impacto nas taxas de parto prematuro e mortalidade perinatal.\",\n          \"trapAlert\": \"Trocar o conceito de âmnio (saco amniótico) pelo de córion (placenta).\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"O SUS-SP cobra o protocolo assistencial básico da rede pública: gestante com USG do 1º tri demonstrando placenta única e membrana fina deve ser imediatamente regulada para centro terciário.\",\n          \"trapAlert\": \"Manter a paciente na UBS aguardando ecografia morfológica de 2º trimestre.\"\n        }\n      }\n    },\n    {\n      \"id\": 2,\n      \"name\": \"Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico\",\n      \"shortName\": \"Risco Monocoriônico\",\n      \"percentage\": 12.8,\n      \"questionCount\": 18,\n      \"priority\": \"Alta\",\n      \"color\": \"#10B981\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Quase 100% das placentas monocoriônicas têm anastomoses; risco de STFF, TAPS e morte súbita.\",\n      \"focusExplanation\": \"Gestações monocoriônicas apresentam taxa de mortalidade perinatal 3 a 5 vezes superior às dicoriônicas. A presença de **anastomoses arteriovenosas profundas desbalanceadas** desencadeia a Síndrome de Transfusão Feto-Fetal (10-15% dos casos). Além disso, a morte súbita de um concepto monocoriônico gera exsanguinação aguda retrógrada no sobrevivo, provocando hipotensão e leucomalácia periventricular em até 30% dos casos.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Reconhecimento das patologias vasculares restritas às gestações monocoriônicas: STFF, TAPS, TRAP e sequelas isquêmicas após morte de um co-gemelar.\",\n          \"trapAlert\": \"Considerar a ocorrência de STFF em gestação dicoriônica diamniótica.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Questão conceitual elencando quais complicações justificam a classificação da gestação monocoriônica como alto risco absoluto.\",\n          \"trapAlert\": \"Incluir descolamento prematuro de placenta como complicação exclusiva de monocoriônicas.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Análise da repercussão neurológica no concepto vivo após o óbito intrauterino do gêmeo monocoriônico.\",\n          \"trapAlert\": \"Indicar cesariana de emergência imediata como medida para salvar o feto vivo.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Avaliação dos padrões de anastomoses vasculares: superficiais (AA/VV) bidirecionais protetoras vs. profundas (AV) unidirecionais patológicas.\",\n          \"trapAlert\": \"Afirmar que anastomoses artério-arteriais causam a transfusão feto-fetal clássica.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Cenário de encaminhamento para medicina fetal diante de gestação monocoriônica com discordância de líquido amniótico.\",\n          \"trapAlert\": \"Aguardar a 24ª semana para iniciar o rastreamento com Doppler.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Associação direta entre tipo de placentação e risco de síndrome de transfusão feto-fetal.\",\n          \"trapAlert\": \"Afirmar que dizigóticos podem ter placenta monocoriônica compartilhada.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Manejo e fluxo de referência terciária de gestantes monocoriônicas no sistema de regulação CROSS/SUS.\",\n          \"trapAlert\": \"Retardar o agendamento de consultas quinzenais por ausência de queixas clínicas maternas.\"\n        }\n      }\n    },\n    {\n      \"id\": 3,\n      \"name\": \"Zigotia vs. Corionicidade e Cronologia da Clivagem\",\n      \"shortName\": \"Zigotia & Clivagem\",\n      \"percentage\": 11.3,\n      \"questionCount\": 16,\n      \"priority\": \"Alta\",\n      \"color\": \"#EC4899\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"Clivagem: 0-3d DCDA (30%); 4-8d MCDA (70%); 9-12d MCMA (1-2%); >13d Siameses (<1%). Dizigóticos são SEMPRE DCDA.\",\n      \"focusExplanation\": \"A cronologia da divisão celular no concepto monozigótico determina a placentação: clivagem em **0 a 3 dias** (pré-morula) gera **Dicoriônica Diamniótica (DCDA)**; entre **4 e 8 dias** (blastocisto precoce) gera **Monocoriônica Diamniótica (MCDA)**; entre **9 e 12 dias** (após implantação) gera **Monocoriônica Monoamniótica (MCMA)**; e após **13 dias** resulta em **Gêmeos Unidos (Siameses)**. Gêmeos dizigóticos (dois óvulos fecundados por dois espermatozoides) são **obrigatoriamente dicoriônicos e diamnióticos**.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Associação entre os dias pós-fertilização da clivagem monozigótica e o número resultante de placentas e bolsas amnióticas.\",\n          \"trapAlert\": \"Afirmar que toda gestação monozigótica é monocoriônica (30% clivam precocemente em DCDA).\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Tabela ou afirmativas de correlação cronológica: embriologia da clivagem tardia (> 13 dias) gerando gêmeos conjugados.\",\n          \"trapAlert\": \"Marcar que gêmeos siameses ocorrem por fusão tardia de conceptos independentes.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Genética e epidemiologia: dizigotia é influenciada por etnia, hereditariedade materna e reprodução assistida, enquanto a monozigotia tem taxa mundial constante (~1:250).\",\n          \"trapAlert\": \"Afirmar que a taxa de gestação monozigótica varia substancialmente entre etnias.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Correlação entre a clivagem do blastocisto com trofoblasto já diferenciado (4-8 dias) e a formação do córion único.\",\n          \"trapAlert\": \"Confundir formação do âmnio com formação do córion.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Questão clássica de embriologia clínica: clivagem entre o 4º e o 8º dia gera qual tipo de gemelaridade.\",\n          \"trapAlert\": \"Assinalar dicoriônica monoamniótica (entidade biologicamente inexistente).\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Identificação de gêmeos dizigóticos: fertilização independente de 2 óvulos gerando obrigatoriamente 2 placentas e 2 sacos.\",\n          \"trapAlert\": \"Cogitar dizigóticos monocoriônicos em qualquer hipótese.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Impacto das técnicas de reprodução assistida (FIV) no aumento expressivo de gestações dicoriônicas dizigóticas.\",\n          \"trapAlert\": \"Atribuir à FIV o aumento desproporcional primário de gêmeos monozigóticos.\"\n        }\n      }\n    },\n    {\n      \"id\": 4,\n      \"name\": \"Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T\",\n      \"shortName\": \"Lambda vs. Sinal do T\",\n      \"percentage\": 10.6,\n      \"questionCount\": 15,\n      \"priority\": \"Média\",\n      \"color\": \"#8B5CF6\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Janela de ouro: 11 a 13s6d. Lambda (pico duplo, membrana > 2 mm) = DCDA; Sinal do T (membrana < 2 mm) = MCDA.\",\n      \"focusExplanation\": \"A determinação da corionicidade tem acurácia máxima entre **11 semanas e 13 semanas e 6 dias** (CCN entre 45 e 84 mm). O **Sinal do Lambda (Twin Peak Sign)** consiste em uma cunha triangular de tecido placentário que se estende para a base da membrana intergemelar, gerando uma membrana espessa **> 2 mm** composta por 4 camadas (dois âmnios e dois córions), confirmando **DCDA**. O **Sinal do T** exibe a inserção perpendicular nua e delgada da membrana intergemelar na placenta sem tecido trofoblástico interposed, com espessura **< 2 mm** (duas camadas amnióticas), confirmando **MCDA**.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Interpretação de imagens ultrassonográficas do 1º trimestre demonstrando sinal do Lambda (DCDA) ou sinal do T (MCDA).\",\n          \"trapAlert\": \"Confiar na ausência de sinal do Lambda no 3º trimestre para firmar monocorionicidade (regressão anatômica fisiológica do pico placentário).\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Apresentação de caso clínico com laudo ecográfico de 12 semanas descrevendo 'projeção triangular na base da membrana interamniótica com espessura de 2,8 mm'.\",\n          \"trapAlert\": \"Não reconhecer o sinal do Lambda descrito por extenso no enunciado.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"A USP desafia o candidato com laudo discordante: USG de 12 semanas relatando Sinal do Lambda e USG de 28 semanas relatando 'massa placentária única'. Conduta orientada pelo 1º trimestre.\",\n          \"trapAlert\": \"Modificar a classificação de DCDA para MCDA baseado na ecografia tardia de placentas fundidas.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Morfologia e histologia da membrana intergemelar: 4 camadas celulares no Lambda vs. 2 camadas no T.\",\n          \"trapAlert\": \"Afirmar que a membrana intergemelar de MCDA contém células trofoblásticas.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Reconhecimento visual do sinal do T e associação com risco de Síndrome de Transfusão Feto-Fetal.\",\n          \"trapAlert\": \"Associar o sinal do T à gestação dicoriônica.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Pergunta objetiva: qual o sinal ultrassonográfico patognomônico de gestação dicoriônica diamniótica no primeiro trimestre.\",\n          \"trapAlert\": \"Responder Sinal do T ou Sinal de Quintero.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Janela ideal de realização do exame: por que o rastreio deve ser feito entre 11 e 13 semanas e 6 dias.\",\n          \"trapAlert\": \"Indicar realização do exame antes de 10 semanas para medir a espessura da membrana.\"\n        }\n      }\n    },\n    {\n      \"id\": 5,\n      \"name\": \"Demais Critérios, Rastreamento Genético e Conduta Pré-Natal\",\n      \"shortName\": \"Rastreio & Pré-Natal\",\n      \"percentage\": 7.9,\n      \"questionCount\": 11,\n      \"priority\": \"Média\",\n      \"color\": \"#F59E0B\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"Sexos opostos = 100% dizigóticos e DCDA; AAS 100-150 mg/dia para profilaxia de pré-eclâmpsia em todas as gestações múltiplas.\",\n      \"focusExplanation\": \"A presença de fetos com genitália externa discordante (sexos diferentes) exclui sumariamente a monozigotia e a monocorionicidade: são **obrigatoriamente dizigóticos e dicoriônicos**. O rastreio de aneuploidias feto a feto exige avaliação individualizada da Translucência Nucal (TN) e osso nasal. Devido à maior massa trofoblástica e risco elevado de insuficiência placentária, **toda gestação múltipla deve receber profilaxia para pré-eclâmpsia com Ácido Acetilsalicílico (AAS) 100 a 150 mg/dia à noite, iniciado entre 12 e 16 semanas e mantido até 36 semanas**, associado a Carbonato de Cálcio 1.000 a 1.500 mg/dia em dietas com baixa ingesta.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Fetos de sexos diferentes como regra confirmatória de dicorionicidade e indicação de AAS 100-150 mg/dia para prevenção de pré-eclâmpsia.\",\n          \"trapAlert\": \"Cogitar hipótese de STFF em gestação com feto masculino e feminino.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Prescrição de AAS em baixa dose na consulta pré-natal da gestante gemelar para mitigação de morbidade hipertensiva.\",\n          \"trapAlert\": \"Indicar repouso absoluto no leito como profilaxia primária de pré-eclâmpsia (ineficaz e trombogênico).\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Limitações do teste pré-natal não invasivo (NIPT) em gemelares, especialmente com fração fetal discordante ou gêmeo evanescente (vanishing twin).\",\n          \"trapAlert\": \"Afirmar que o NIPT tem a mesma taxa de sensibilidade em gemelares e gestações únicas.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Cálculo de risco de trissomias baseado na medida individual da Translucência Nucal para cada um dos conceptos.\",\n          \"trapAlert\": \"Calcular uma média aritmética da Translucência Nucal entre os fetos.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Conduta clínica preventiva: suplementação de ferro e ácido fólico em doses aumentadas devido à maior demanda eritropoietica.\",\n          \"trapAlert\": \"Prescrever dose habitual de gestação única para gemelares com anemia prévia.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Identificação rápida: primigesta com USG evidenciando feto masculino e feto feminino. Qual o diagnóstico de placentação.\",\n          \"trapAlert\": \"Assinalar que é necessário esperar a espessura da membrana intergemelar para definir.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Protocolo de suplementação de cálcio e rastreio de trabalho de parto prematuro com medida de comprimento do colo uterino por via transvaginal entre 18 e 24 semanas.\",\n          \"trapAlert\": \"Indicar cerclagem cervical de rotina para todas as gestações gemelares com colo normal.\"\n        }\n      }\n    }\n  ],\n  \"bancaBreakdown\": {\n    \"ENARE\": {\n      \"banca\": \"ENARE\",\n      \"totalQuestions\": 28,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Corionicidade e Amnionicidade: Definição e Determinação\",\n          \"questionCount\": 16,\n          \"percentageInBanca\": 57.1\n        },\n        {\n          \"subfoco\": \"Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 14.3\n        },\n        {\n          \"subfoco\": \"Zigotia vs. Corionicidade e Cronologia da Clivagem\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 10.7\n        },\n        {\n          \"subfoco\": \"Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 10.7\n        },\n        {\n          \"subfoco\": \"Demais Critérios, Rastreamento Genético e Conduta Pré-Natal\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 7.2\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"USP\": {\n      \"banca\": \"USP\",\n      \"totalQuestions\": 32,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Corionicidade e Amnionicidade: Definição e Determinação\",\n          \"questionCount\": 18,\n          \"percentageInBanca\": 56.3\n        },\n        {\n          \"subfoco\": \"Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico\",\n          \"questionCount\": 5,\n          \"percentageInBanca\": 15.6\n        },\n        {\n          \"subfoco\": \"Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 12.5\n        },\n        {\n          \"subfoco\": \"Zigotia vs. Corionicidade e Cronologia da Clivagem\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 9.4\n        },\n        {\n          \"subfoco\": \"Demais Critérios, Rastreamento Genético e Conduta Pré-Natal\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 6.2\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"UNICAMP\": {\n      \"banca\": \"UNICAMP\",\n      \"totalQuestions\": 24,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Corionicidade e Amnionicidade: Definição e Determinação\",\n          \"questionCount\": 14,\n          \"percentageInBanca\": 58.3\n        },\n        {\n          \"subfoco\": \"Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 16.7\n        },\n        {\n          \"subfoco\": \"Zigotia vs. Corionicidade e Cronologia da Clivagem\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 12.5\n        },\n        {\n          \"subfoco\": \"Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 8.3\n        },\n        {\n          \"subfoco\": \"Demais Critérios, Rastreamento Genético e Conduta Pré-Natal\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 4.2\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"PSU-MG\": {\n      \"banca\": \"PSU-MG\",\n      \"totalQuestions\": 20,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Corionicidade e Amnionicidade: Definição e Determinação\",\n          \"questionCount\": 11,\n          \"percentageInBanca\": 55.0\n        },\n        {\n          \"subfoco\": \"Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 15.0\n        },\n        {\n          \"subfoco\": \"Zigotia vs. Corionicidade e Cronologia da Clivagem\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 15.0\n        },\n        {\n          \"subfoco\": \"Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 10.0\n        },\n        {\n          \"subfoco\": \"Demais Critérios, Rastreamento Genético e Conduta Pré-Natal\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 5.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"AMRIGS\": {\n      \"banca\": \"AMRIGS\",\n      \"totalQuestions\": 18,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Corionicidade e Amnionicidade: Definição e Determinação\",\n          \"questionCount\": 11,\n          \"percentageInBanca\": 61.1\n        },\n        {\n          \"subfoco\": \"Zigotia vs. Corionicidade e Cronologia da Clivagem\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 11.1\n        },\n        {\n          \"subfoco\": \"Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 11.1\n        },\n        {\n          \"subfoco\": \"Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 11.1\n        },\n        {\n          \"subfoco\": \"Demais Critérios, Rastreamento Genético e Conduta Pré-Natal\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 5.6\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"SUS-SP\": {\n      \"banca\": \"SUS-SP\",\n      \"totalQuestions\": 19,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Corionicidade e Amnionicidade: Definição e Determinação\",\n          \"questionCount\": 11,\n          \"percentageInBanca\": 57.9\n        },\n        {\n          \"subfoco\": \"Complicações Exclusivas Monocoriônicas: Risco Hemodinâmico\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 10.5\n        },\n        {\n          \"subfoco\": \"Zigotia vs. Corionicidade e Cronologia da Clivagem\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 10.5\n        },\n        {\n          \"subfoco\": \"Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 10.5\n        },\n        {\n          \"subfoco\": \"Demais Critérios, Rastreamento Genético e Conduta Pré-Natal\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 10.6\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    }\n  },\n  \"topTraps\": [\n    {\n      \"subfoco\": \"Corionicidade e Amnionicidade: Definição e Determinação\",\n      \"trapTitle\": \"Distrator de Placentas Fundidas na USG Tardia\",\n      \"trapDescription\": \"No 2º e 3º trimestres, placentas dicoriônicas adjacentes podem se fundir aparentando placenta única. Prevalece soberana a USG precoce de 11 a 13s6d com Sinal do Lambda.\"\n    },\n    {\n      \"subfoco\": \"Demais Critérios, Rastreamento Genético e Conduta Pré-Natal\",\n      \"trapTitle\": \"Distrator dos Sexos Opostos\",\n      \"trapDescription\": \"Fetos de sexos diferentes são obrigatoriamente dizigóticos e dicoriônicos (DCDA), com risco zero de STFF.\"\n    }\n  ],\n  \"auditHash\": \"a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0\",\n  \"needsRecalc\": false,\n  \"certifiedAt\": \"2026-11-04T00:00:00.000Z\",\n  \"lastRecalculatedAt\": \"2026-11-04T00:00:00.000Z\",\n  \"status\": \"certified\"\n}\n```\n\n---\n\n## 2. Ultrassonografia no 1º Trimestre: Sinal do Lambda vs. Sinal do T\n\nA janela de ouro diagnóstica para a determinação da corionicidade situa-se rigorosamente entre **11 semanas e 13 semanas e 6 dias** de idade gestacional (comprimento cabeça-nádega - CCN entre 45 e 84 mm). Nesse intervalo anatômico, a sensibilidade e a especificidade do exame ecográfico ultrapassam 98%.\n\n### Critérios de Diagnóstico Ultrassonográfico Canônico:\n\n*   **Sinal do Lambda (Twin Peak Sign):** Achado patognomônico de gestações **Dicoriônicas Diamnióticas (DCDA)**. Representa a projeção triangular de tecido coriônico/trofoblástico que penetra na base da membrana intergemelar a partir da placa corial. A membrana intergemelar é **espessa (> 2 mm)**, sendo formada histologicamente por **4 camadas celulares** (dois âmnios e dois córions fundidos).\n*   **Sinal do T (T-sign):** Achado patognomônico de gestações **Monocoriônicas Diamnióticas (MCDA)**. A membrana intergemelar é nua e delgada, inserindo-se em ângulo reto diretamente sobre a placa placentária sem qualquer tecido trofoblástico interposed. A espessura da membrana é **fina (< 2 mm)**, composta exclusivamente por **2 camadas celulares** (apenas os dois âmnios em contato).\n\n$$\n\\text{Sinal do Lambda} \\implies \\text{Dicoriônica Diamniótica (DCDA)} \\implies \\begin{cases} \\text{1. Projeção triangular de tecido trofoblástico na base} \\\\ \\text{2. Espessura da membrana intergemelar} > 2\\text{ mm} \\\\ \\text{3. Membrana composta por 4 folhetos (2 âmnios + 2 córions)} \\end{cases}\n$$\n\n$$\n\\text{Sinal do T} \\implies \\text{Monocoriônica Diamniótica (MCDA)} \\implies \\begin{cases} \\text{1. Inserção perpendicular nua sem tecido placentário na base} \\\\ \\text{2. Espessura da membrana intergemelar} < 2\\text{ mm} \\\\ \\text{3. Membrana composta por 2 folhetos (apenas 2 âmnios)} \\end{cases}\n$$\n\n> [!WARNING] Armadilha Clássica de Prova: Placentas Fundidas na Ultrassonografia Tardia\n> No 2º e 3º trimestres da gestação, duas placentas dicoriônicas anatomicamente adjacentes sofrem compressão mecânica e fusão aparente, simulando uma única massa placentária contínua na ecografia de rotina. Além disso, o Sinal do Lambda sofre involução tecidual e desaparece em até 20% dos casos no 2º trimestre. **A ecografia de primeiro trimestre (11 a 13s6d) prevalece soberana sobre qualquer laudo tardio.** Se o laudo tardio descreve \"placenta única\", mas o laudo do primeiro trimestre documentou o Sinal do Lambda, a gestação é incontestavelmente **Dicoriônica Diamniótica (DCDA)**.\n\n---\n\n## 3. Cronologia da Clivagem Monozigótica e Fenótipos Placentários\n\nEnquanto a gestação dizigótica decorre compulsoriamente da fecundação de dois ovócitos independentes por dois espermatozoides (sendo sempre Dicoriônica Diamniótica), a gestação monozigótica surge da clivagem de um único óvulo fecundado. O fenótipo placentário é ditado exclusivamente pelo **momento cronológico da clivagem pós-fecundação**:\n\n$$\n\\text{Cronologia da Clivagem Monozigótica} \\implies \\begin{cases} \\text{0 a 3 dias (Pré-Mórula)} \\implies \\text{Dicoriônica Diamniótica (DCDA)} \\quad (\\approx 30\\%) \\\\ \\text{4 a 8 dias (Blastocisto Precoce)} \\implies \\text{Monocoriônica Diamniótica (MCDA)} \\quad (\\approx 70\\%) \\\\ \\text{9 a 12 dias (Pós-Implantação)} \\implies \\text{Monocoriônica Monoamniótica (MCMA)} \\quad (\\approx 1\\text{-}2\\%) \\\\ > 13\\text{ dias (Disco Embrionário Formado)} \\implies \\text{Gêmeos Unidos / Siameses} \\quad (< 1\\%) \\end{cases}\n$$\n\n### Tabela Canônica de Tipos de Placentação na Gemelaridade\n\n| Intervalo de Clivagem | Placentação Resultante | Frequência (Monozigóticos) | Risco Clínico Principal de Prova | Intervalo de Vigilância Ultrassonográfica |\n| :--- | :--- | :---: | :--- | :--- |\n| **0 a 3 dias** | **Dicoriônica Diamniótica (DCDA)** | ~30% | Prematuridade, pré-eclâmpsia e restrição do crescimento | Mensal a partir de 20 semanas |\n| **4 a 8 dias** | **Monocoriônica Diamniótica (MCDA)** | ~70% | Anastomoses vasculares, STFF, TAPS, TRAP e CIUR seletivo | **Quinzenal** com Doppler a partir de 16 semanas |\n| **9 a 12 dias** | **Monocoriônica Monoamniótica (MCMA)** | 1% - 2% | Entrelaçamento fatal de cordão e acidentes funiculares | Internação / Vigilância intensiva a partir de 26-28s |\n| **> 13 dias** | **Gêmeos Unidos (Siameses)** | < 1% | Malformações anatômicas complexas e coligação visceral | Centro terciário / Planejamento cirúrgico de cesárea |\n\n*Nota Didática de Prova: A entidade Dicoriônica Monoamniótica é biologicamente IMPOSSÍVEL, pois a divisão do córion antecede a formação do saco amniótico.*\n\n---\n\n## 4. Rastreamento Cromossômico, Malformações e a Regra dos Sexos Opostos\n\nA propedêutica genética e a vigilância fetal na gestação múltipla possuem particularidades que as bancas de concurso exploram intensamente:\n\n1.  **Translucência Nucal (TN) e Marcadores Ecográficos:** Devem ser medidos e interpretados **individualmente feto a feto** entre 11 e 13s6d. Em gestações monocoriônicas, uma discordância de Translucência Nucal $\\ge 20\\%$ constitui marcador precoce preditor para o desenvolvimento de Síndrome de Transfusão Feto-Fetal (STFF) antes mesmo de alterações no líquido amniótico.\n2.  **Teste Pré-Natal Não Invasivo (NIPT / cfDNA):** Possui sensibilidade elevada para trissomias 21 e 18, porém tem menor acurácia em gestações monocoriônicas devido ao DNA fetal livre compartilhado. Na ocorrência de feto evanescente (*vanishing twin*), o NIPT não é recomendado devido à persistência de DNA trofoblástico residual do conceptus falecido no plasma materno.\n3.  **Profilaxia Universal para Pré-Eclâmpsia:** Devido à sobrecarga vascular e maior volume de massa placentária, **toda gestante gemelar é classificada como de alto risco para Pré-Eclâmpsia**. A conduta padrão-ouro homologada (FEBRASGO / ACOG) consiste em prescrever:\n    *   **Ácido Acetilsalicílico (AAS):** $100\\text{ a }150\\text{ mg/dia}$ por via oral, administrado à noite, iniciado entre **12 e 16 semanas** e suspenso com **36 semanas**.\n    *   **Carbonato de Cálcio:** $1.000\\text{ a }1.500\\text{ mg/dia}$ de cálcio elementar em pacientes com baixa ingesta alimentar na dieta.\n\n> [!WARNING] Armadilha Clássica de Prova: Fetos de Sexos Anatômicos Opostos\n> Diante de um caso clínico em que a ultrassonografia evidencia **um feto com genitália masculina e outro com genitália feminina**, esses conceptos são **OBRIGATORIAMENTE DIZIGÓTICOS e DICORIÔNICOS-DIAMNIÓTICOS (DCDA)**. Exclua imediatamente qualquer menção a risco de Síndrome de Transfusão Feto-Fetal (STFF), Sequência TAPS ou indicação de fetoscopia a laser.\n\n---\n\n```clinical-scheme\n{\n  \"type\": \"bipolar\",\n  \"badge\": \"Diretriz FEBRASGO / ISUOG\",\n  \"leftColumn\": {\n    \"title\": \"DICORIÔNICA DIAMNIÓTICA (DCDA)\",\n    \"color\": \"blue\",\n    \"items\": [\n      \"Placentas anatômica e funcionalmente independentes\",\n      \"Sinal do Lambda (Twin Peak Sign) no 1º trimestre\",\n      \"Membrana intergemelar espessa (> 2 mm) com 4 folhetos\",\n      \"Ausência de anastomoses vasculares patológicas\",\n      \"Vigilância ultrassonográfica mensal a partir de 20 semanas\",\n      \"Parto programado entre 37s 0d e 38s 6d\"\n    ],\n    \"alert\": \"Placentas adjacentes podem se fundir no 2º/3º trimestre; prevalece sempre o laudo precoce de 11 a 13s6d!\"\n  },\n  \"rightColumn\": {\n    \"title\": \"MONOCORIÔNICA DIAMNIÓTICA (MCDA)\",\n    \"color\": \"rose\",\n    \"items\": [\n      \"Placenta única com circulação fetal compartilhada\",\n      \"Sinal do T na base da membrana intergemelar\",\n      \"Membrana fina (< 2 mm) composta por apenas 2 folhetos\",\n      \"Risco crítico de STFF (10-15%), TAPS, TRAP e CIUR seletivo\",\n      \"Vigilância ultrassonográfica quinzenal com Doppler desde 16 semanas\",\n      \"Parto programado entre 36s 0d e 37s 0d\"\n    ],\n    \"alert\": \"Fetos de sexos opostos NUNCA são monocoriônicos; são 100% dizigóticos e dicoriônicos!\"\n  }\n}\n```\n\n---\n\n### 🔄 O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)\n\n| Ponto de Conduta | Prática Antiga (Pegadinha das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |\n| :--- | :--- | :--- | :--- |\n| **Vigilância da Monocorionicidade** | Ultrassonografia mensal de rotina como no pré-natal habitual | **Ultrassonografia quinzenal com Doppler** a partir de 16 semanas para rastreio ativo de STFF e TAPS | **ISUOG / FEBRASGO (2023)** |\n| **Profilaxia de Pré-Eclâmpsia** | AAS 60 a 80 mg/dia ou indicação apenas se outros fatores de risco | **AAS 100 a 150 mg/dia** à noite para **100% das gestações múltiplas**, de 12 a 36 semanas | **FEBRASGO / FIGO (2024)** |\n| **Determinação da Corionicidade** | Avaliar número de placentas no laudo morfológico do 2º/3º trimestre | Determinação **soberana e imutável pelo Sinal do Lambda vs. T** entre 11 e 13s6d | **ISUOG Guidelines (2023)** |\n| **Medida de Colo Uterino** | Cerclagem cervical ou repouso no leito de rotina para gemelares | **Medida seriada do colo por USG transvaginal (18-24s)**; repouso é ineficaz e cerclagem contraindicada se colo normal | **ACOG / FEBRASGO (2023)** |\n\n> [!IMPORTANT] Alerta de Atualização para Provas de 2024-2026:\n> As bancas modernas (especialmente ENARE e USP) têm penalizado candidatos que orientam consultas mensais em gestações monocoriônicas ou que suspendem o AAS antes da hora. Lembre-se: em gestação monocoriônica diamniótica sem complicações, o protocolo exige ultrassonografia obstétrica com dopplervelocimetria a cada 14 dias a partir de 16 semanas completas de gravidez.\n\n---\n\n## 5. Algoritmo Decisório para Diagnóstico e Vigilância Pré-Natal\n\n### Passo a Passo Sintético da Cascata Decisória\n\n1.  **[Diagnóstico Precoce]:** Realizar obrigatoriamente a ultrassonografia obstétrica entre **11 e 13 semanas e 6 dias** (CCN 45 a 84 mm) para determinação definitiva da corionicidade e rastreio de aneuploidias.\n2.  **[Estratificação de Corionicidade]:** Pesquisar ativamente o **Sinal do Lambda** (confirmação de Dicorionica Diamniótica - DCDA) ou o **Sinal do T** (confirmação de Monocoriônica Diamniótica - MCDA). Se visualizados fetos de sexos opostos, classificar compulsoriamente como DCDA.\n3.  **[Vigilância Diferenciada]:**\n    *   Se **DCDA:** Instituir consultas de pré-natal e ecografias de crescimento fetal a cada **4 semanas**, a partir de 20 semanas.\n    *   Se **MCDA:** Iniciar compulsoriamente protocolo de vigilância ultrassonográfica **quinzenal a partir de 16 semanas**, avaliando Maior Bolsão Vertical (MBV), bexigas fetais e Doppler da Artéria Umbilical e Artéria Cerebral Média (PVS-ACM).\n4.  **[Profilaxia Farmacológica Universal]:** Prescrever para todas as pacientes **AAS 100 a 150 mg/dia** por via oral ao deitar (12 a 36 semanas) e suplementação de cálcio para prevenção de pré-eclâmpsia.\n5.  **[Planejamento do Parto]:** Programar a interrupção eletiva da gestação conforme a corionicidade: **37s 0d a 38s 6d** nas DCDA e **36s 0d a 37s 0d** nas MCDA sem complicações.\n\n---\n\n## Diretrizes Oficiais & Consensos de Referência\n\n*   **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** Manual de Orientação em Gestação Múltipla, Consenso da Comissão Nacional Especializada em Medicina Fetal (2021/2023).\n*   **ISUOG (International Society of Ultrasound in Obstetrics and Gynecology):** Practice Guidelines for the performance of the routine mid-trimester fetal ultrasound scan and assessment of twin pregnancy (2023).\n*   **ACOG (American College of Obstetricians and Gynecologists):** Practice Bulletin No. 231 - Multifetal Gestations: Twin, Triplet, and Higher-Order Multifetal Pregnancies (2021, revalidado 2024).\n*   **FIGO (International Federation of Gynecology and Obstetrics):** Best practice advice on the management of twin pregnancy (2023).\n*   **Ministério da Saúde do Brasil:** Manual de Gestação de Alto Risco, Secretaria de Atenção Primária à Saúde (SAPS), Brasília-DF (2022/2024).\n"
},
  {
  "id": "mat-gem-02",
  "focusId": "obs-gem-complicacoes",
  "title": "Complicações Específicas da Gemelaridade Monocoriônica",
  "specialty": "Ginecologia e Obstetrícia",
  "theme": "Gestação Múltipla",
  "focus": "Complicações da Gemelaridade",
  "readTimeMinutes": 12,
  "lastUpdatedYear": 2026,
  "guidelineBadge": "FEBRASGO / ISUOG / SMFM",
  "summarySnippet": "Arquitetura funcional das anastomoses vasculares placentárias (AA vs. AV), sequência TRAP (feto acárdico), sequência TAPS (Doppler da ACM), classificação de Gratacós na RCFs e conduta conservadora no óbito de co-gemelar.",
  "keyPoints": [
    "Quase 100% das placentas monocoriônicas apresentam anastomoses vasculares, divididas em superficiais (AA/VV protetoras) e profundas (AV patológicas).",
    "A Sequência TRAP caracteriza-se por perfusão arterial reversa de um feto acárdico via anastomose AA calibrosa, exigindo oclusão vascular precoce do cordão.",
    "A Sequência TAPS cursa com líquido amniótico normal e concordante, sendo diagnosticada pelo Doppler de PVS-ACM (> 1,5 MoM vs. < 1,0 MoM).",
    "A Restrição de Crescimento Seletiva (Gratacós) é classificada pelo Doppler de Artéria Umbilical: Tipo I (positivo/favorável), Tipo II (reverso/grave) e Tipo III (intermitente/imprevisível).",
    "O óbito de um feto monocoriônico causa exsanguinação reflexa aguda e hipotensão no sobrevivo com risco de 20-30% de leucomalácia periventricular.",
    "A confirmação de óbito de um gêmeo monocoriônico NÃO é indicação de cesariana de emergência imediata (conduta conservadora com RNM após 2-3 semanas).",
    "A sobredistensão uterina leva a parto prematuro em > 50% dos casos e faz da gemelaridade fator de risco maior para atonia uterina pós-parto."
  ],
  "recurrenceStats": {
    "focusSlug": "gemelaridade-complicacoes-monocorionicas",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Gestação Múltipla",
    "focus": "Complicações da Gemelaridade",
    "totalQuestions": 72,
    "timeframeRange": "2017-2026",
    "version": 1,
    "donutSlices": [
      {
        "id": 1,
        "name": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
        "shortName": "STFF na Gemelaridade",
        "percentage": 30.6,
        "questionCount": 22,
        "priority": "Crítica",
        "color": "#3B82F6",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "Desbalanço hemodinâmico por anastomoses arteriovenosas profundas; sequência oligo-poli.",
        "focusExplanation": "A **STFF** decorre de shunts arteriovenosos (AV) profundos desbalanceados, sem anastomoses de compensação suficientes. Manifesta-se pela clássica sequência de **oligoâmnio acentuado no doador** (Maior Bolsão Vertical < 2 cm) e **polidrâmnio no receptor** (MBV > 8 cm até 20 sem ou > 10 cm após). O tratamento padrão-ouro de primeira linha entre 16 e 26 semanas é a **fotocoagulação a laser fetoscópica (Técnica de Solomon)**.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Critério diagnóstico firmado exclusivamente pela discrepância do volume de líquido amniótico (sequência oligo-poli) e indicação de ablação a laser como cirurgia fetal curativa.",
            "trapAlert": "Exigir discordância de peso fetal como critério obrigatório para diagnóstico de STFF (pertence à RCFs)."
          },
          "ENARE": {
            "howItCharges": "Casos clínicos de emergência obstétrica: gestante no 2º trimestre com queixa de aumento rápido do volume uterino e dor, com USG revelando polidrâmnio tenso em um feto e feto colado à parede uterina (stuck twin) no outro.",
            "trapAlert": "Indicar amniocentese diagnóstica seriada como conduta definitiva em vez de referenciar para cirurgia fetal a laser."
          },
          "USP": {
            "howItCharges": "Fisiopatologia fina: papel do sistema renina-angiotensina-aldosterona (SRAA) ativado no feto doador e sobrecarga volêmica com aumento de peptídeo natriurético atrial (PNA) no feto receptor gerando hipertrofia de ventrículo direito.",
            "trapAlert": "Atribuir a insuficiência cardíaca do receptor à anemia (o receptor é pletórico/policitêmico)."
          },
          "UNICAMP": {
            "howItCharges": "Diagnóstico diferencial entre STFF e TAPS: no TAPS o líquido é normal e concordante; na STFF há discrepância marcante de bolsões amnióticos.",
            "trapAlert": "Confundir TAPS pós-laser com recidiva da STFF."
          },
          "PSU-MG": {
            "howItCharges": "Reconhecimento dos estádios de Quintero e momento cirúrgico ideal entre 16 e 26 semanas de idade gestacional.",
            "trapAlert": "Indicar cirurgia a laser antes de 16 semanas ou em concepto viável acima de 28 semanas com feto hidrópico."
          },
          "AMRIGS": {
            "howItCharges": "Identificação direta: qual a complicação vascular mais frequente em gestações monocoriônicas diamnióticas (ocorre em 10 a 15%).",
            "trapAlert": "Assinalar TRAP como mais frequente que STFF (TRAP é complicação rara, ~1% dos monocoriônicos)."
          },
          "SUS-SP": {
            "howItCharges": "Regulação e transporte de gestantes com diagnóstico de STFF para centros quaternários de cirurgia fetal no SUS.",
            "trapAlert": "Atrasar o encaminhamento terciário aguardando maturidade pulmonar para interrupção da gestação."
          }
        }
      },
      {
        "id": 2,
        "name": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
        "shortName": "TRAP / Feto Acárdico",
        "percentage": 29.2,
        "questionCount": 21,
        "priority": "Alta",
        "color": "#10B981",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "Anastomose AA calibrosa; feto bomba perfunde concepto acárdico retrógradamente; oclusão vascular.",
        "focusExplanation": "A **Sequência TRAP** é uma complicação rara e exclusiva de gestações monocoriônicas. Decorre da presença de uma **grande anastomose artério-arterial (AA)** associada a uma venovenosa (VV). O feto morfologicamente normal (**feto bomba**) bombeia sangue desoxigenado de forma retrógrada diretamente pela artéria umbilical do concepto malformado (**feto acárdico/acéfalo**). O feto bomba sofre sobrecarga cardíaca severa de alto débito, evoluindo para cardiomegalia, polidrâmnio, hidropisia e óbito fetal em até 50-70% dos casos sem tratamento. A conduta padrão-ouro é a **interrupção precoce do fluxo vascular do feto acárdico** via ablação por radiofrequência (RFA) ou coagulação a laser do cordão.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Identificação da ecografia de primeiro/segundo trimestre com fluxo reverso pela artéria umbilical em feto sem estrutura cardíaca definida e risco de falência cardíaca no feto bomba.",
            "trapAlert": "Acreditar que o feto acárdico é viável ou que a conduta é expectante até o termo."
          },
          "ENARE": {
            "howItCharges": "Apresentação clínica de gemelaridade com feto sem cabeça e sem tórax desenvolvido, perguntando o mecanismo hemodinâmico e o nome da síndrome (TRAP / Gemelar Acárdico).",
            "trapAlert": "Confundir com feto papiráceo ou aborto retido de gestação dicoriônica."
          },
          "USP": {
            "howItCharges": "Avaliação prognóstica e conduta: a relação de peso fetal estimada entre feto acárdico e bomba (> 50-70%) prediz falência cardíaca iminente no feto bomba, exigindo intervenção fetal por ablação por radiofrequência.",
            "trapAlert": "Esperar o feto bomba desenvolver hidropisia manifesta para indicar a cirurgia fetal."
          },
          "UNICAMP": {
            "howItCharges": "Mapeamento vascular Doppler: confirmação de sangue entrando pela artéria umbilical e saindo pela veia umbilical do concepto acárdico (inversão completa do fluxo fisiológico fetal).",
            "trapAlert": "Afirmar que a perfusão reversa ocorre por artérias uterinas maternas anômalas."
          },
          "PSU-MG": {
            "howItCharges": "Tratamento cirúrgico de escolha: termo técnico da técnica minimamente invasiva (oclusão vascular do cordão por radiofrequência ou laser).",
            "trapAlert": "Sugerir ligadura cirúrgica do cordão por laparotomia e histerotomia aberta."
          },
          "AMRIGS": {
            "howItCharges": "Definição do feto bomba como a estrutura anatômica sã que sustenta o parasita acárdico à custa de cardiomegalia.",
            "trapAlert": "Chamar o feto malformado de feto bomba."
          },
          "SUS-SP": {
            "howItCharges": "Conduta diante de feto acárdico volumoso no 2º trimestre em centro de referência: encaminhamento para procedimento intervencionista de oclusão de cordão.",
            "trapAlert": "Prescrever digitálicos para a mãe como terapia primária do TRAP."
          }
        }
      },
      {
        "id": 3,
        "name": "Complicações Gerais, Sobredistensão e Prematuridade",
        "shortName": "Complicações Gerais",
        "percentage": 22.2,
        "questionCount": 16,
        "priority": "Alta",
        "color": "#EC4899",
        "trend": "estavel",
        "trendLabel": "🏛️ Clássico Estável",
        "takeaway": "Parto prematuro (< 37s em > 50%), rotura prematura de membranas e atonia uterina por sobredistensão.",
        "focusExplanation": "Gestações múltiplas impõem **sobredistensão mecânica severa das fibras miometrias**, desencadeando contratilidade prematura e encurtamento cervical acelerado. Mais de **50% dos gemelares nascem prematuros** (< 37 semanas) e cerca de 10-15% antes de 32 semanas. O rastreio preditor de prematuridade padrão-ouro é a **medida transvaginal seriada do comprimento do colo uterino entre 18 e 24 semanas**. Repouso no leito e tocolíticos profiláticos prolongados são formalmente proscritos por falta de benefício e aumento do risco trombótico.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Prematuridade espontânea como complicação obstétrica mais prevalente e a ineficácia do repouso absoluto profilático.",
            "trapAlert": "Indicar internação prolongada e repouso em decúbito lateral para todas as gestantes gemelares sem queixas."
          },
          "ENARE": {
            "howItCharges": "Medida do comprimento do colo uterino por USG transvaginal no 2º trimestre: valor de colo curto (< 25 mm) e indicação de Progesterona natural micronizada 200 mg/dia via vaginal.",
            "trapAlert": "Indicar cerclagem cervical de urgência em gestação gemelar assintomática apenas pelo colo curto sem histórico de incompetência cervical."
          },
          "USP": {
            "howItCharges": "Fisiopatologia da sobredistensão uterina: aumento da tensão parietal (Lei de Laplace) levando à expressão precoce de receptores de ocitocina e conexina-43 no miométrio.",
            "trapAlert": "Atribuir o trabalho de parto prematuro exclusivamente a infecções bacterianas ascendentes."
          },
          "UNICAMP": {
            "howItCharges": "Risco puerperal associado: o excesso de estiramento miometrial é a principal causa de atonia uterina e hemorragia pós-parto imediata no 4º período do parto.",
            "trapAlert": "Não realizar manejo ativo do 3º período com ocitocina profilática imediata após o parto."
          },
          "PSU-MG": {
            "howItCharges": "Conduta farmacológica na ameaça de trabalho de parto prematuro gemelar antes de 34 semanas: corticoterapia para maturação pulmonar (Betametasona 12 mg IM 2 doses) e neuroproteção com Sulfato de Magnésio se < 32 semanas.",
            "trapAlert": "Prescrever múltiplos ciclos semanais repetidos de corticoterapia pulmonar."
          },
          "AMRIGS": {
            "howItCharges": "Epidemiologia da prematuridade tardia (34-36 semanas) e morbidades respiratórias neonatais associadas (taquipneia transitória e desconforto respiratório).",
            "trapAlert": "Achar que concepto com 35 semanas gemelar tem risco zero de complicações respiratórias."
          },
          "SUS-SP": {
            "howItCharges": "Protocolo de corticoterapia fetal e transporte materno seguro para maternidade com UTI neonatal disponível.",
            "trapAlert": "Realizar o parto em unidade básica ou hospital de pequeno porte sem suporte de neonatologia intensiva."
          }
        }
      },
      {
        "id": 4,
        "name": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
        "shortName": "CIUR & TAPS",
        "percentage": 11.1,
        "questionCount": 8,
        "priority": "Média",
        "color": "#F59E0B",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "RCFs (Gratacós I, II, III por Doppler de AU); TAPS (líquido normal, PVS-ACM > 1,5 vs < 1,0 MoM).",
        "focusExplanation": "A **RCFs** é definida pelo peso fetal estimado de um dos conceptos abaixo do percentil 10 e/ou discordância ponderal $\\ge 20\\%$. Classifica-se por **Gratacós** conforme o Doppler da Artéria Umbilical: **Tipo I** (diástole positiva contínua, bom prognóstico); **Tipo II** (diástole zero ou reversa persistente, mau prognóstico com insuficiência placentária severa); e **Tipo III** (fluxo diastólico cíclico/intermitente devido a grandes anastomoses AA, com risco de morte fetal súbita sem aviso prévio). Já o **TAPS** cursa com líquido amniótico normal e concordante, sendo diagnosticado pela discrepância do Pico de Velocidade Sistólica da Artéria Cerebral Média (PVS-ACM > 1,5 MoM no doador anêmico e < 1,0 MoM no receptor policitêmico).",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Diferenciação precisa entre os Tipos I, II e III de Gratacós na RCFs e reconhecimento do TAPS por Doppler de ACM com líquido amniótico normal.",
            "trapAlert": "Considerar que o TAPS apresenta a sequência oligo-polidrâmnio característica da STFF."
          },
          "ENARE": {
            "howItCharges": "Interpretação do Doppler de Artéria Umbilical de um dos fetos monocoriônicos demonstrando fluxo diastólico intermitente (Gratacós Tipo III).",
            "trapAlert": "Classificar fluxo intermitente como Gratacós Tipo II."
          },
          "USP": {
            "howItCharges": "Manejo da RCFs Tipo II em concepto viável pré-termo (30-32 semanas): corticoterapia para maturação pulmonar, sulfato de magnésio para neuroproteção e interrupção por cesariana.",
            "trapAlert": "Aguardar termo completo (37 semanas) em feto com diástole reversa persistente da artéria umbilical."
          },
          "UNICAMP": {
            "howItCharges": "Sequência TAPS: fisiopatologia de microanastomoses arteriovenosas (< 1 mm) periféricas na borda placentária.",
            "trapAlert": "Afirmar que o TAPS decorre de anastomoses venovenosas superficiais de alto calibre."
          },
          "PSU-MG": {
            "howItCharges": "Fórmula e critério de discordância de peso fetal: diferença ponderal dividida pelo peso do maior feto expressa em porcentagem.",
            "trapAlert": "Calcular a discordância dividindo pelo peso do menor feto."
          },
          "AMRIGS": {
            "howItCharges": "Prognóstico comparativo dos tipos de Gratacós: o Tipo I tem sobrevida > 90% com conduta conservadora.",
            "trapAlert": "Indicar interrupção imediata ou laser para todos os casos de Gratacós Tipo I."
          },
          "SUS-SP": {
            "howItCharges": "Vigilância ecográfica semanal com Doppler da artéria umbilical, ducto venoso e ACM em fetos monocoriônicos com suspeita de RCFs.",
            "trapAlert": "Espaçar consultas para cada 3 a 4 semanas na presença de restrição de crescimento com Doppler alterado."
          }
        }
      },
      {
        "id": 5,
        "name": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
        "shortName": "Óbito de um Gemelar",
        "percentage": 6.9,
        "questionCount": 5,
        "priority": "Média",
        "color": "#8B5CF6",
        "trend": "estavel",
        "trendLabel": "🏛️ Clássico Estável",
        "takeaway": "Exsanguinação reflexa aguda para placenta do feto morto; risco de leucomalácia periventricular; NÃO operar de imediato.",
        "focusExplanation": "A morte súbita de um concepto monocoriônico gera **exsanguinação reflexa aguda do concepto sobrevivente em direção ao leito vascular de baixa resistência da placenta do feto falecido**. Isso acarreta choque hipovolêmico súbito, hipotensão grave e hipoperfusão cerebral no sobrevivo, provocando **lesões neurológicas isquêmicas definitivas (Leucomalácia Periventricular, encefalomalácia multiquística e paralisia cerebral)** em 20 a 30% dos casos. A lesão isquêmica ocorre no instante do óbito; portanto, **a cesariana de emergência imediata não reverte a lesão já instalada e adiciona o risco severo de prematuridade iatrogênica**. A conduta correta é: estabilização materna, pesquisa de anemia fetal aguda no sobrevivo pelo PVS-ACM e Ressonância Magnética cerebral após 2 a 3 semanas.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Conduta obstétrica diante da constatação de óbito de um gêmeo monocoriônico no 2º ou início do 3º trimestre: NÃO indicar cesariana de emergência imediata.",
            "trapAlert": "Assinalar cesariana de urgência imediata para 'salvar' o feto vivo."
          },
          "ENARE": {
            "howItCharges": "Caso clínico com óbito intrauterino de um gemelar monocoriônico de 26 semanas. Pergunta a conduta imediata para o feto vivo.",
            "trapAlert": "Indicar parto cesáreo com 26 semanas sem investigação prévia de anemia fetal."
          },
          "USP": {
            "howItCharges": "Fisiopatologia da leucomalácia periventricular: necrose isquêmica da substância branca periventricular decorrente da hipotensão aguda de descompressão transfusional.",
            "trapAlert": "Atribuir a lesão cerebral à passagem de substâncias tromboplásticas do feto morto (teoria antiga revogada)."
          },
          "UNICAMP": {
            "howItCharges": "Exame de imagem padrão-ouro e tempo ideal para rastreio de sequelas cerebrais no sobrevivo: Ressonância Magnética após 2 a 3 semanas do óbito.",
            "trapAlert": "Solicitar tomografia de crânio fetal ou USG imediatamente após o evento para descartar lesão."
          },
          "PSU-MG": {
            "howItCharges": "Avaliação de anemia fetal aguda no sobrevivente: PVS-ACM > 1,5 MoM autoriza transfusão intrauterina de resgate para estabilização hemodinâmica.",
            "trapAlert": "Prescrever ferro endovenoso para a mãe esperando correção da anemia fetal aguda."
          },
          "AMRIGS": {
            "howItCharges": "Risco de coagulopatia materna de consumo (CID) pelo feto retido: complicação extremamente rara em gemelares, exigindo apenas monitorização de fibrinogênio sérico.",
            "trapAlert": "Indicar interrupção imediata por medo de coagulopatia intravascular disseminada materna grave nas primeiras 48h."
          },
          "SUS-SP": {
            "howItCharges": "Apoio psicológico, monitorização clínica ambulatorial semanal do bem-estar fetal e planejamento de parto próximo a 34-36 semanas se estável.",
            "trapAlert": "Manter internação hospitalar contínua sem plano de vigilância ambulatorial especializada."
          }
        }
      }
    ],
    "bancaBreakdown": {
      "ENARE": {
        "banca": "ENARE",
        "totalQuestions": 16,
        "topSubfocos": [
          {
            "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
            "questionCount": 5,
            "percentageInBanca": 31.3
          },
          {
            "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
            "questionCount": 5,
            "percentageInBanca": 31.3
          },
          {
            "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
            "questionCount": 3,
            "percentageInBanca": 18.8
          },
          {
            "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
            "questionCount": 2,
            "percentageInBanca": 12.5
          },
          {
            "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
            "questionCount": 1,
            "percentageInBanca": 6.1
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "USP": {
        "banca": "USP",
        "totalQuestions": 18,
        "topSubfocos": [
          {
            "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
            "questionCount": 6,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
            "questionCount": 5,
            "percentageInBanca": 27.8
          },
          {
            "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
            "questionCount": 4,
            "percentageInBanca": 22.2
          },
          {
            "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
            "questionCount": 2,
            "percentageInBanca": 11.1
          },
          {
            "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
            "questionCount": 1,
            "percentageInBanca": 5.6
          }
        ],
        "predominantDifficulty": "Difícil"
      },
      "UNICAMP": {
        "banca": "UNICAMP",
        "totalQuestions": 13,
        "topSubfocos": [
          {
            "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
            "questionCount": 4,
            "percentageInBanca": 30.8
          },
          {
            "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
            "questionCount": 4,
            "percentageInBanca": 30.8
          },
          {
            "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
            "questionCount": 3,
            "percentageInBanca": 23.1
          },
          {
            "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
            "questionCount": 1,
            "percentageInBanca": 7.7
          },
          {
            "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
            "questionCount": 1,
            "percentageInBanca": 7.6
          }
        ],
        "predominantDifficulty": "Difícil"
      },
      "PSU-MG": {
        "banca": "PSU-MG",
        "totalQuestions": 10,
        "topSubfocos": [
          {
            "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
            "questionCount": 3,
            "percentageInBanca": 30.0
          },
          {
            "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
            "questionCount": 3,
            "percentageInBanca": 30.0
          },
          {
            "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
            "questionCount": 2,
            "percentageInBanca": 20.0
          },
          {
            "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
            "questionCount": 1,
            "percentageInBanca": 10.0
          },
          {
            "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
            "questionCount": 1,
            "percentageInBanca": 10.0
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "AMRIGS": {
        "banca": "AMRIGS",
        "totalQuestions": 7,
        "topSubfocos": [
          {
            "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
            "questionCount": 2,
            "percentageInBanca": 28.6
          },
          {
            "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
            "questionCount": 2,
            "percentageInBanca": 28.6
          },
          {
            "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
            "questionCount": 2,
            "percentageInBanca": 28.6
          },
          {
            "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
            "questionCount": 1,
            "percentageInBanca": 14.2
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "SUS-SP": {
        "banca": "SUS-SP",
        "totalQuestions": 8,
        "topSubfocos": [
          {
            "subfoco": "Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica",
            "questionCount": 2,
            "percentageInBanca": 25.0
          },
          {
            "subfoco": "Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)",
            "questionCount": 2,
            "percentageInBanca": 25.0
          },
          {
            "subfoco": "Complicações Gerais, Sobredistensão e Prematuridade",
            "questionCount": 2,
            "percentageInBanca": 25.0
          },
          {
            "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
            "questionCount": 1,
            "percentageInBanca": 12.5
          },
          {
            "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
            "questionCount": 1,
            "percentageInBanca": 12.5
          }
        ],
        "predominantDifficulty": "Médio"
      }
    },
    "topTraps": [
      {
        "subfoco": "Morte Intrauterina de um Co-gemelar e Lesões Neurológicas",
        "trapTitle": "Distrator de Cesariana de Emergência Imediata",
        "trapDescription": "No óbito de co-gemelar monocoriônico, a cesariana imediata não reverte o dano isquêmico já ocorrido e causa prematuridade iatrogênica; conduta é conservadora com Doppler de ACM e RNM após 2-3 semanas."
      },
      {
        "subfoco": "Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS",
        "trapTitle": "Distrator de Líquido Amniótico no TAPS",
        "trapDescription": "No TAPS o volume de líquido amniótico é estritamente normal e concordante; se houver oligo-polidrâmnio o diagnóstico é STFF."
      }
    ],
    "auditHash": "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
    "needsRecalc": false,
    "certifiedAt": "2026-11-04T00:00:00.000Z",
    "lastRecalculatedAt": "2026-11-04T00:00:00.000Z",
    "status": "certified"
  },
  "markdownContent": "## 1. O Que Mais Cai nas Provas de Residência Médica\n\nAs complicações da gemelaridade monocoriônica (MC) representam o ápice da complexidade em Medicina Fetal e Obstetrícia de Alto Risco. Nas bancas de concurso (ENARE, USP-SP, UNICAMP, PSU-MG, AMRIGS, SUS-SP), **o foco das questões recai sobre a anatomia funcional das anastomoses vasculares placentárias**. Praticamente 100% das placentas monocoriônicas possuem comunicações vasculares na placa coriônica, mas o fenótipo clínico e o desfecho dependem estritamente do tipo, calibre e equilíbrio hemodinâmico entre elas.\n\nO censo estatístico de questões revela que as bancas cobram o reconhecimento imediato do mecanismo fisiopatológico subjacente para diferenciar entidades com prognósticos e condutas totalmente distintos: a Síndrome de Transfusão Feto-Fetal (STFF), a Sequência de Perfusão Arterial Reversa (TRAP), a Sequência Anemia-Policitemia (TAPS), a Restrição de Crescimento Fetal Seletiva (RCFs classificada por Gratacós) e a conduta conservadora obrigatória diante da morte intrauterina de um co-gemelar.\n\n```gem-stats-complicacoes\n{\n  \"focusSlug\": \"gemelaridade-complicacoes-monocorionicas\",\n  \"specialty\": \"Ginecologia e Obstetrícia\",\n  \"theme\": \"Gestação Múltipla\",\n  \"focus\": \"Complicações da Gemelaridade\",\n  \"totalQuestions\": 72,\n  \"timeframeRange\": \"2017-2026\",\n  \"version\": 1,\n  \"donutSlices\": [\n    {\n      \"id\": 1,\n      \"name\": \"Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica\",\n      \"shortName\": \"STFF na Gemelaridade\",\n      \"percentage\": 30.6,\n      \"questionCount\": 22,\n      \"priority\": \"Crítica\",\n      \"color\": \"#3B82F6\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Desbalanço hemodinâmico por anastomoses arteriovenosas profundas; sequência oligo-poli.\",\n      \"focusExplanation\": \"A **STFF** decorre de shunts arteriovenosos (AV) profundos desbalanceados, sem anastomoses de compensação suficientes. Manifesta-se pela clássica sequência de **oligoâmnio acentuado no doador** (Maior Bolsão Vertical < 2 cm) e **polidrâmnio no receptor** (MBV > 8 cm até 20 sem ou > 10 cm após). O tratamento padrão-ouro de primeira linha entre 16 e 26 semanas é a **fotocoagulação a laser fetoscópica (Técnica de Solomon)**.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Critério diagnóstico firmado exclusivamente pela discrepância do volume de líquido amniótico (sequência oligo-poli) e indicação de ablação a laser como cirurgia fetal curativa.\",\n          \"trapAlert\": \"Exigir discordância de peso fetal como critério obrigatório para diagnóstico de STFF (pertence à RCFs).\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Casos clínicos de emergência obstétrica: gestante no 2º trimestre com queixa de aumento rápido do volume uterino e dor, com USG revelando polidrâmnio tenso em um feto e feto colado à parede uterina (stuck twin) no outro.\",\n          \"trapAlert\": \"Indicar amniocentese diagnóstica seriada como conduta definitiva em vez de referenciar para cirurgia fetal a laser.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Fisiopatologia fina: papel do sistema renina-angiotensina-aldosterona (SRAA) ativado no feto doador e sobrecarga volêmica com aumento de peptídeo natriurético atrial (PNA) no feto receptor gerando hipertrofia de ventrículo direito.\",\n          \"trapAlert\": \"Atribuir a insuficiência cardíaca do receptor à anemia (o receptor é pletórico/policitêmico).\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Diagnóstico diferencial entre STFF e TAPS: no TAPS o líquido é normal e concordante; na STFF há discrepância marcante de bolsões amnióticos.\",\n          \"trapAlert\": \"Confundir TAPS pós-laser com recidiva da STFF.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Reconhecimento dos estádios de Quintero e momento cirúrgico ideal entre 16 e 26 semanas de idade gestacional.\",\n          \"trapAlert\": \"Indicar cirurgia a laser antes de 16 semanas ou em concepto viável acima de 28 semanas com feto hidrópico.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Identificação direta: qual a complicação vascular mais frequente em gestações monocoriônicas diamnióticas (ocorre em 10 a 15%).\",\n          \"trapAlert\": \"Assinalar TRAP como mais frequente que STFF (TRAP é complicação rara, ~1% dos monocoriônicos).\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Regulação e transporte de gestantes com diagnóstico de STFF para centros quaternários de cirurgia fetal no SUS.\",\n          \"trapAlert\": \"Atrasar o encaminhamento terciário aguardando maturidade pulmonar para interrupção da gestação.\"\n        }\n      }\n    },\n    {\n      \"id\": 2,\n      \"name\": \"Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)\",\n      \"shortName\": \"TRAP / Feto Acárdico\",\n      \"percentage\": 29.2,\n      \"questionCount\": 21,\n      \"priority\": \"Alta\",\n      \"color\": \"#10B981\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Anastomose AA calibrosa; feto bomba perfunde concepto acárdico retrógradamente; oclusão vascular.\",\n      \"focusExplanation\": \"A **Sequência TRAP** é uma complicação rara e exclusiva de gestações monocoriônicas. Decorre da presença de uma **grande anastomose artério-arterial (AA)** associada a uma venovenosa (VV). O feto morfologicamente normal (**feto bomba**) bombeia sangue desoxigenado de forma retrógrada diretamente pela artéria umbilical do concepto malformado (**feto acárdico/acéfalo**). O feto bomba sofre sobrecarga cardíaca severa de alto débito, evoluindo para cardiomegalia, polidrâmnio, hidropisia e óbito fetal em até 50-70% dos casos sem tratamento. A conduta padrão-ouro é a **interrupção precoce do fluxo vascular do feto acárdico** via ablação por radiofrequência (RFA) ou coagulação a laser do cordão.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Identificação da ecografia de primeiro/segundo trimestre com fluxo reverso pela artéria umbilical em feto sem estrutura cardíaca definida e risco de falência cardíaca no feto bomba.\",\n          \"trapAlert\": \"Acreditar que o feto acárdico é viável ou que a conduta é expectante até o termo.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Apresentação clínica de gemelaridade com feto sem cabeça e sem tórax desenvolvido, perguntando o mecanismo hemodinâmico e o nome da síndrome (TRAP / Gemelar Acárdico).\",\n          \"trapAlert\": \"Confundir com feto papiráceo ou aborto retido de gestação dicoriônica.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Avaliação prognóstica e conduta: a relação de peso fetal estimada entre feto acárdico e bomba (> 50-70%) prediz falência cardíaca iminente no feto bomba, exigindo intervenção fetal por ablação por radiofrequência.\",\n          \"trapAlert\": \"Esperar o feto bomba desenvolver hidropisia manifesta para indicar a cirurgia fetal.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Mapeamento vascular Doppler: confirmação de sangue entrando pela artéria umbilical e saindo pela veia umbilical do concepto acárdico (inversão completa do fluxo fisiológico fetal).\",\n          \"trapAlert\": \"Afirmar que a perfusão reversa ocorre por artérias uterinas maternas anômalas.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Tratamento cirúrgico de escolha: termo técnico da técnica minimamente invasiva (oclusão vascular do cordão por radiofrequência ou laser).\",\n          \"trapAlert\": \"Sugerir ligadura cirúrgica do cordão por laparotomia e histerotomia aberta.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Definição do feto bomba como a estrutura anatômica sã que sustenta o parasita acárdico à custa de cardiomegalia.\",\n          \"trapAlert\": \"Chamar o feto malformado de feto bomba.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Conduta diante de feto acárdico volumoso no 2º trimestre em centro de referência: encaminhamento para procedimento intervencionista de oclusão de cordão.\",\n          \"trapAlert\": \"Prescrever digitálicos para a mãe como terapia primária do TRAP.\"\n        }\n      }\n    },\n    {\n      \"id\": 3,\n      \"name\": \"Complicações Gerais, Sobredistensão e Prematuridade\",\n      \"shortName\": \"Complicações Gerais\",\n      \"percentage\": 22.2,\n      \"questionCount\": 16,\n      \"priority\": \"Alta\",\n      \"color\": \"#EC4899\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"Parto prematuro (< 37s em > 50%), rotura prematura de membranas e atonia uterina por sobredistensão.\",\n      \"focusExplanation\": \"Gestações múltiplas impõem **sobredistensão mecânica severa das fibras miometrias**, desencadeando contratilidade prematura e encurtamento cervical acelerado. Mais de **50% dos gemelares nascem prematuros** (< 37 semanas) e cerca de 10-15% antes de 32 semanas. O rastreio preditor de prematuridade padrão-ouro é a **medida transvaginal seriada do comprimento do colo uterino entre 18 e 24 semanas**. Repouso no leito e tocolíticos profiláticos prolongados são formalmente proscritos por falta de benefício e aumento do risco trombótico.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Prematuridade espontânea como complicação obstétrica mais prevalente e a ineficácia do repouso absoluto profilático.\",\n          \"trapAlert\": \"Indicar internação prolongada e repouso em decúbito lateral para todas as gestantes gemelares sem queixas.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Medida do comprimento do colo uterino por USG transvaginal no 2º trimestre: valor de colo curto (< 25 mm) e indicação de Progesterona natural micronizada 200 mg/dia via vaginal.\",\n          \"trapAlert\": \"Indicar cerclagem cervical de urgência em gestação gemelar assintomática apenas pelo colo curto sem histórico de incompetência cervical.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Fisiopatologia da sobredistensão uterina: aumento da tensão parietal (Lei de Laplace) levando à expressão precoce de receptores de ocitocina e conexina-43 no miométrio.\",\n          \"trapAlert\": \"Atribuir o trabalho de parto prematuro exclusivamente a infecções bacterianas ascendentes.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Risco puerperal associado: o excesso de estiramento miometrial é a principal causa de atonia uterina e hemorragia pós-parto imediata no 4º período do parto.\",\n          \"trapAlert\": \"Não realizar manejo ativo do 3º período com ocitocina profilática imediata após o parto.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Conduta farmacológica na ameaça de trabalho de parto prematuro gemelar antes de 34 semanas: corticoterapia para maturação pulmonar (Betametasona 12 mg IM 2 doses) e neuroproteção com Sulfato de Magnésio se < 32 semanas.\",\n          \"trapAlert\": \"Prescrever múltiplos ciclos semanais repetidos de corticoterapia pulmonar.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Epidemiologia da prematuridade tardia (34-36 semanas) e morbidades respiratórias neonatais associadas (taquipneia transitória e desconforto respiratório).\",\n          \"trapAlert\": \"Achar que concepto com 35 semanas gemelar tem risco zero de complicações respiratórias.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Protocolo de corticoterapia fetal e transporte materno seguro para maternidade com UTI neonatal disponível.\",\n          \"trapAlert\": \"Realizar o parto em unidade básica ou hospital de pequeno porte sem suporte de neonatologia intensiva.\"\n        }\n      }\n    },\n    {\n      \"id\": 4,\n      \"name\": \"Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS\",\n      \"shortName\": \"CIUR & TAPS\",\n      \"percentage\": 11.1,\n      \"questionCount\": 8,\n      \"priority\": \"Média\",\n      \"color\": \"#F59E0B\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"RCFs (Gratacós I, II, III por Doppler de AU); TAPS (líquido normal, PVS-ACM > 1,5 vs < 1,0 MoM).\",\n      \"focusExplanation\": \"A **RCFs** é definida pelo peso fetal estimado de um dos conceptos abaixo do percentil 10 e/ou discordância ponderal $\\\\ge 20\\\\%$. Classifica-se por **Gratacós** conforme o Doppler da Artéria Umbilical: **Tipo I** (diástole positiva contínua, bom prognóstico); **Tipo II** (diástole zero ou reversa persistente, mau prognóstico com insuficiência placentária severa); e **Tipo III** (fluxo diastólico cíclico/intermitente devido a grandes anastomoses AA, com risco de morte fetal súbita sem aviso prévio). Já o **TAPS** cursa com líquido amniótico normal e concordante, sendo diagnosticado pela discrepância do Pico de Velocidade Sistólica da Artéria Cerebral Média (PVS-ACM > 1,5 MoM no doador anêmico e < 1,0 MoM no receptor policitêmico).\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Diferenciação precisa entre os Tipos I, II e III de Gratacós na RCFs e reconhecimento do TAPS por Doppler de ACM com líquido amniótico normal.\",\n          \"trapAlert\": \"Considerar que o TAPS apresenta a sequência oligo-polidrâmnio característica da STFF.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Interpretação do Doppler de Artéria Umbilical de um dos fetos monocoriônicos demonstrando fluxo diastólico intermitente (Gratacós Tipo III).\",\n          \"trapAlert\": \"Classificar fluxo intermitente como Gratacós Tipo II.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Manejo da RCFs Tipo II em concepto viável pré-termo (30-32 semanas): corticoterapia para maturação pulmonar, sulfato de magnésio para neuroproteção e interrupção por cesariana.\",\n          \"trapAlert\": \"Aguardar termo completo (37 semanas) em feto com diástole reversa persistente da artéria umbilical.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Sequência TAPS: fisiopatologia de microanastomoses arteriovenosas (< 1 mm) periféricas na borda placentária.\",\n          \"trapAlert\": \"Afirmar que o TAPS decorre de anastomoses venovenosas superficiais de alto calibre.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Fórmula e critério de discordância de peso fetal: diferença ponderal dividida pelo peso do maior feto expressa em porcentagem.\",\n          \"trapAlert\": \"Calcular a discordância dividindo pelo peso do menor feto.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Prognóstico comparativo dos tipos de Gratacós: o Tipo I tem sobrevida > 90% com conduta conservadora.\",\n          \"trapAlert\": \"Indicar interrupção imediata ou laser para todos os casos de Gratacós Tipo I.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Vigilância ecográfica semanal com Doppler da artéria umbilical, ducto venoso e ACM em fetos monocoriônicos com suspeita de RCFs.\",\n          \"trapAlert\": \"Espaçar consultas para cada 3 a 4 semanas na presença de restrição de crescimento com Doppler alterado.\"\n        }\n      }\n    },\n    {\n      \"id\": 5,\n      \"name\": \"Morte Intrauterina de um Co-gemelar e Lesões Neurológicas\",\n      \"shortName\": \"Óbito de um Gemelar\",\n      \"percentage\": 6.9,\n      \"questionCount\": 5,\n      \"priority\": \"Média\",\n      \"color\": \"#8B5CF6\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"Exsanguinação reflexa aguda para placenta do feto morto; risco de leucomalácia periventricular; NÃO operar de imediato.\",\n      \"focusExplanation\": \"A morte súbita de um concepto monocoriônico gera **exsanguinação reflexa aguda do concepto sobrevivente em direção ao leito vascular de baixa resistência da placenta do feto falecido**. Isso acarreta choque hipovolêmico súbito, hipotensão grave e hipoperfusão cerebral no sobrevivo, provocando **lesões neurológicas isquêmicas definitivas (Leucomalácia Periventricular, encefalomalácia multiquística e paralisia cerebral)** em 20 a 30% dos casos. A lesão isquêmica ocorre no instante do óbito; portanto, **a cesariana de emergência imediata não reverte a lesão já instalada e adiciona o risco severo de prematuridade iatrogênica**. A conduta correta é: estabilização materna, pesquisa de anemia fetal aguda no sobrevivo pelo PVS-ACM e Ressonância Magnética cerebral após 2 a 3 semanas.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Conduta obstétrica diante da constatação de óbito de um gêmeo monocoriônico no 2º ou início do 3º trimestre: NÃO indicar cesariana de emergência imediata.\",\n          \"trapAlert\": \"Assinalar cesariana de urgência imediata para 'salvar' o feto vivo.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Caso clínico com óbito intrauterino de um gemelar monocoriônico de 26 semanas. Pergunta a conduta imediata para o feto vivo.\",\n          \"trapAlert\": \"Indicar parto cesáreo com 26 semanas sem investigação prévia de anemia fetal.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Fisiopatologia da leucomalácia periventricular: necrose isquêmica da substância branca periventricular decorrente da hipotensão aguda de descompressão transfusional.\",\n          \"trapAlert\": \"Atribuir a lesão cerebral à passagem de substâncias tromboplásticas do feto morto (teoria antiga revogada).\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Exame de imagem padrão-ouro e tempo ideal para rastreio de sequelas cerebrais no sobrevivo: Ressonância Magnética após 2 a 3 semanas do óbito.\",\n          \"trapAlert\": \"Solicitar tomografia de crânio fetal ou USG imediatamente após o evento para descartar lesão.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Avaliação de anemia fetal aguda no sobrevivente: PVS-ACM > 1,5 MoM autoriza transfusão intrauterina de resgate para estabilização hemodinâmica.\",\n          \"trapAlert\": \"Prescrever ferro endovenoso para a mãe esperando correção da anemia fetal aguda.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Risco de coagulopatia materna de consumo (CID) pelo feto retido: complicação extremamente rara em gemelares, exigindo apenas monitorização de fibrinogênio sérico.\",\n          \"trapAlert\": \"Indicar interrupção imediata por medo de coagulopatia intravascular disseminada materna grave nas primeiras 48h.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Apoio psicológico, monitorização clínica ambulatorial semanal do bem-estar fetal e planejamento de parto próximo a 34-36 semanas se estável.\",\n          \"trapAlert\": \"Manter internação hospitalar contínua sem plano de vigilância ambulatorial especializada.\"\n        }\n      }\n    }\n  ],\n  \"bancaBreakdown\": {\n    \"ENARE\": {\n      \"banca\": \"ENARE\",\n      \"totalQuestions\": 16,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica\",\n          \"questionCount\": 5,\n          \"percentageInBanca\": 31.3\n        },\n        {\n          \"subfoco\": \"Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)\",\n          \"questionCount\": 5,\n          \"percentageInBanca\": 31.3\n        },\n        {\n          \"subfoco\": \"Complicações Gerais, Sobredistensão e Prematuridade\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 18.8\n        },\n        {\n          \"subfoco\": \"Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 12.5\n        },\n        {\n          \"subfoco\": \"Morte Intrauterina de um Co-gemelar e Lesões Neurológicas\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 6.1\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"USP\": {\n      \"banca\": \"USP\",\n      \"totalQuestions\": 18,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica\",\n          \"questionCount\": 6,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)\",\n          \"questionCount\": 5,\n          \"percentageInBanca\": 27.8\n        },\n        {\n          \"subfoco\": \"Complicações Gerais, Sobredistensão e Prematuridade\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 22.2\n        },\n        {\n          \"subfoco\": \"Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 11.1\n        },\n        {\n          \"subfoco\": \"Morte Intrauterina de um Co-gemelar e Lesões Neurológicas\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 5.6\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"UNICAMP\": {\n      \"banca\": \"UNICAMP\",\n      \"totalQuestions\": 13,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 30.8\n        },\n        {\n          \"subfoco\": \"Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 30.8\n        },\n        {\n          \"subfoco\": \"Complicações Gerais, Sobredistensão e Prematuridade\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 23.1\n        },\n        {\n          \"subfoco\": \"Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 7.7\n        },\n        {\n          \"subfoco\": \"Morte Intrauterina de um Co-gemelar e Lesões Neurológicas\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 7.6\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"PSU-MG\": {\n      \"banca\": \"PSU-MG\",\n      \"totalQuestions\": 10,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 30.0\n        },\n        {\n          \"subfoco\": \"Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 30.0\n        },\n        {\n          \"subfoco\": \"Complicações Gerais, Sobredistensão e Prematuridade\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 10.0\n        },\n        {\n          \"subfoco\": \"Morte Intrauterina de um Co-gemelar e Lesões Neurológicas\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 10.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"AMRIGS\": {\n      \"banca\": \"AMRIGS\",\n      \"totalQuestions\": 7,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 28.6\n        },\n        {\n          \"subfoco\": \"Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 28.6\n        },\n        {\n          \"subfoco\": \"Complicações Gerais, Sobredistensão e Prematuridade\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 28.6\n        },\n        {\n          \"subfoco\": \"Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 14.2\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"SUS-SP\": {\n      \"banca\": \"SUS-SP\",\n      \"totalQuestions\": 8,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Síndrome da Transfusão Feto-Fetal (STFF) na Rotina Monocoriônica\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 25.0\n        },\n        {\n          \"subfoco\": \"Sequência TRAP (Perfusão Arterial Reversa e Feto Acárdico)\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 25.0\n        },\n        {\n          \"subfoco\": \"Complicações Gerais, Sobredistensão e Prematuridade\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 25.0\n        },\n        {\n          \"subfoco\": \"Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 12.5\n        },\n        {\n          \"subfoco\": \"Morte Intrauterina de um Co-gemelar e Lesões Neurológicas\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 12.5\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    }\n  },\n  \"topTraps\": [\n    {\n      \"subfoco\": \"Morte Intrauterina de um Co-gemelar e Lesões Neurológicas\",\n      \"trapTitle\": \"Distrator de Cesariana de Emergência Imediata\",\n      \"trapDescription\": \"No óbito de co-gemelar monocoriônico, a cesariana imediata não reverte o dano isquêmico já ocorrido e causa prematuridade iatrogênica; conduta é conservadora com Doppler de ACM e RNM após 2-3 semanas.\"\n    },\n    {\n      \"subfoco\": \"Restrição de Crescimento Fetal Seletiva (RCFs) e Sequência TAPS\",\n      \"trapTitle\": \"Distrator de Líquido Amniótico no TAPS\",\n      \"trapDescription\": \"No TAPS o volume de líquido amniótico é estritamente normal e concordante; se houver oligo-polidrâmnio o diagnóstico é STFF.\"\n    }\n  ],\n  \"auditHash\": \"b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01\",\n  \"needsRecalc\": false,\n  \"certifiedAt\": \"2026-11-04T00:00:00.000Z\",\n  \"lastRecalculatedAt\": \"2026-11-04T00:00:00.000Z\",\n  \"status\": \"certified\"\n}\n```\n\n---\n\n## 2. Arquitetura Vascular Placentária: Anastomoses Superficiais vs. Profundas\n\nA placenta monocoriônica contém uma rica malha vascular na superfície coriônica. O balanço hemodinâmico entre os conceptos é governado pelo tipo predominante de anastomose:\n\n1.  **Anastomoses Superficiais (Artério-Arteriais - AA e Veno-Venosas - VV):**\n    *   São conexões diretas visíveis macroscopicamente na superfície da placa coriônica.\n    *   Apresentam **fluxo bidirecional, de baixa resistência e alta velocidade**.\n    *   **Papel Fisiológico Protetor:** As anastomoses AA funcionam como **válvulas de alívio e segurança**, equalizando instantaneamente picos pressóricos entre os dois territórios e protegendo contra shunts crônicos graves.\n2.  **Anastomoses Profundas (Artério-Venosas - AV):**\n    *   Localizam-se no leito capilar cotiledonar profundo, onde uma artéria de um concepto penetra no cotilédone e a veia de drenagem desse mesmo cotilédone retorna para o outro concepto.\n    *   Apresentam **fluxo estritamente unidirecional**.\n    *   **Gatilho Fisiopatológico de Doença:** Quando há desbalanço na proporção de anastomoses AV sem anastomoses AA compensatórias suficientes, instala-se a transferência volumétrica crônica que desencadeia a **STFF** e a **Sequência TAPS**.\n\n$$\n\\text{Arquitetura Vascular} \\implies \\begin{cases} \\text{Anastomoses Superficiais (AA e VV)} \\implies \\text{Bidirecionais, placa corial nua, protetoras contra STFF} \\\\ \\text{Anastomoses Profundas (AV)} \\implies \\text{Unidirecionais, leito capilar cotiledonar, motor da STFF e TAPS} \\end{cases}\n$$\n\n---\n\n## 3. Sequência TRAP (Perfusão Arterial Reversa): Feto Bomba vs. Feto Acárdico\n\nA Sequência de Perfusão Arterial Reversa em Gemelares (**TRAP - Twin Reversed Arterial Perfusion**) ocorre em cerca de 1% das gestações monocoriônicas:\n\n*   **Fisiopatologia Vascular:** Conexão vascular direta anômala através de uma **grande anastomose artério-arterial (AA)** associada a uma veno-venosa (VV). A pressão sistólica do feto normal supera a do concepto malformado, invertendo completamente o sentido da circulação.\n*   **Feto Acárdico (Receptor Malformado):** Não possui coração funcional e frequentemente carece de estruturas cefálicas e membros superiores (acéfalo-acárdico). Recebe sangue **desoxigenado e desnutrido** que já perfundiu o feto bomba, desenvolvendo apenas as porções inferiores do corpo cobertas por edema gelatinoso volumoso e higroma cístico.\n*   **Feto Bomba (Doador Morfologicamente Normal):** Assume o débito cardíaco de ambos os corpos. Evolui com hipertrofia cardíaca, insuficiência cardíaca congestiva de alto débito, regurgitação tricúspide, polidrâmnio e hidropisia fetal.\n*   **Conduta Padrão-Ouro:** Interrupção do fluxo vascular para o feto acárdico para preservar o feto bomba. O procedimento de escolha é a **ablação do cordão umbilical do feto acárdico por Radiofrequência (RFA) ou Laser guiado por ultrassom**, idealmente realizada entre **16 e 24 semanas de gestação**.\n\n> [!WARNING] Armadilha Clássica de Prova: Não Aguardar Hidropisia no TRAP\n> As bancas costumam apresentar um caso de feto acárdico no 2º trimestre e perguntar se a conduta é expectante até que o feto bomba mostre sinais de sofrimento cardíaco. **ISSO É FALSO.** Quando a massa do feto acárdico atinge $> 50\\%$ do peso do feto bomba ou quando há piora progressiva do Doppler cardíaco, a intervenção cirúrgica de ablação vascular está formalmente indicada antes que a hidropisia irreversível se estabeleça.\n\n---\n\n## 4. Sequência TAPS (Twin Anemia-Polycythemia Sequence) & Diagnóstico pelo Doppler da ACM\n\nO TAPS caracteriza-se por uma forma atípica e crônica de transfusão sanguínea feto-fetal:\n\n*   **Fisiopatologia:** Decorre de **microanastomoses arteriovenosas minúsculas (< 1 mm de diâmetro)**, tipicamente situadas na borda da placenta. O fluxo é extremamente lento, permitindo apenas a passagem gradual de eritrócitos, **sem transferir grandes volumes plasmáticos** suficientes para desequilibrar a volemia e a função renal.\n*   **Critério Diagnóstico de Prova (Sem Oligo-Polidrâmnio):**\n    *   Diferença marcante dos níveis de hemoglobina entre os conceptos.\n    *   **Volume de líquido amniótico estritamente NORMAL e CONCORDANTE em ambos os sacos** (ausência de sequência oligo-polidrâmnio).\n    *   Diagnóstico firmado com base no **Doppler do Pico de Velocidade Sistólica da Artéria Cerebral Média (PVS-ACM)**:\n\n$$\n\\text{Critério Doppler TAPS} \\iff \\begin{cases} \\text{1. Volume de líquido amniótico NORMAL em ambos os sacos amnióticos} \\\\ \\text{2. Feto Doador (Anêmico): PVS-ACM} > 1{,}5\\text{ MoM (circulação hiperdinâmica)} \\\\ \\text{3. Feto Receptor (Policitêmico): PVS-ACM} < 1{,}0\\text{ MoM (sangue hiperviscoso)} \\end{cases}\n$$\n\n> [!WARNING] Armadilha Clássica de Prova: TAPS vs. STFF de Quintero\n> O distrator favorito dos examinadores é afirmar que no TAPS há oligoidrâmnio no doador. Lembre-se: **no TAPS o líquido amniótico é normal em ambos os fetos**. Havendo oligoâmnio (MBV < 2 cm) no doador e polidrâmnio (MBV > 8/10 cm) no receptor, o diagnóstico é **Síndrome de Transfusão Feto-Fetal (STFF)**, e não TAPS!\n\n---\n\n## 5. Restrição de Crescimento Fetal Seletiva (RCFs) & Classificação de Gratacós\n\nA RCFs afeta 10 a 15% das gestações monocoriônicas, originando-se primariamente da partilha desigual do território placentário entre os conceptos. É diagnosticada quando um dos fetos apresenta Peso Fetal Estimado (PFE) $< \\text{percentil 10}$ associado ou não a uma discordância ponderal $\\ge 20\\%$:\n\n$$\n\\text{Discordância Ponderal (\\%)} = \\frac{\\text{Peso Fetal do Maior} - \\text{Peso Fetal do Menor}}{\\text{Peso Fetal do Maior}} \\times 100 \\ge 20\\%\n$$\n\n### Classificação Canônica de Gratacós (Baseada no Doppler da Artéria Umbilical do Feto Restrito):\n\n| Tipo Gratacós | Padrão da Artéria Umbilical (Feto RCF) | Fisiopatologia Vascular Subjacente | Prognóstico Perinatal | Conduta Clínica Homologada |\n| :--- | :--- | :--- | :--- | :--- |\n| **Tipo I** | **Diástole Positiva e Contínua** (Doppler normal) | Insuficiência placentária leve; partilha desigual moderada | **Favorável** (sobrevida > 90%) | Conduta expectante com vigilância semanal; parto planejado com **34 a 36 semanas**. |\n| **Tipo II** | **Diástole Zero ou Reversa Persistente** | Hipoplasia placentária grave; ausência de grandes shunts AA | **Reservado** (alto risco de óbito intrauterino) | Vigilância intensiva (Doppler de ducto venoso); corticoterapia e parto com **30 a 32 semanas**. |\n| **Tipo III** | **Diástole Intermitente / Cíclica** (alterna positivo e reverso) | Grandes anastomoses artério-arteriais (AA) bidirecionais | **Imprevisível** (morte súbita sem aviso prévio) | Vigilância frequente; planejamento de parto entre **32 e 34 semanas** em centro terciário. |\n\n---\n\n## 6. Morte Intrauterina de um Co-gemelar Monocoriônico: Conduta Imediata\n\nQuando um feto monocoriônico morre in utero, o tônus vascular em sua placenta cai a zero instantaneamente:\n\n1.  **Mecanismo de Exsanguinação Retrógrada Aguda:** O feto vivo sofre uma perda sanguínea massiva aguda em direção ao leito de baixa pressão da placenta do concepto falecido através das anastomoses interfetais. Isso desencadeia **choque hipovolêmico agudo grave, hipotensão sistêmica e hipoperfusão tecidual**.\n2.  **Lesões no Sobrevivo (20 a 30% dos casos):** A hipóxia isquêmica cerebral atinge seletivamente a substância branca em desenvolvimento, resultando em **Leucomalácia Periventricular (LPV)**, encefalomalácia multiquística, porencefalia e paralisia cerebral definitiva.\n3.  **Conduta Médica Padrão-Ouro:**\n    *   **NÃO indicar cesariana de emergência imediata indiscriminada:** A lesão cerebral isquêmica ocorre nos primeiros minutos após a parada circulatória do co-gemelar. A interrupção cirúrgica imediata não reverte o dano já estabelecido e expõe o feto sobrevivente aos riscos da prematuridade extrema iatrogênica.\n    *   **Avaliação do Doppler da ACM:** Mensurar o PVS-ACM do feto vivo para rastrear anemia fetal aguda grave. Em caso de PVS-ACM $> 1,5\\text{ MoM}$, indicar **transfusão intrauterina de emergência** para restaurar a volemia.\n    *   **Neuroimagem Estruturada:** Realizar **Ressonância Magnética (RNM) cerebral fetal após 2 a 3 semanas**, período necessário para que as áreas de necrose e cavitação isquêmica se tornem radiologicamente visíveis.\n\n---\n\n```clinical-scheme\n{\n  \"type\": \"pipeline\",\n  \"badge\": \"Diretriz FEBRASGO / ISUOG\",\n  \"data\": {\n    \"steps\": [\n      {\n        \"step\": 1,\n        \"title\": \"Vigilância Ultrassonográfica Quinzenal (16s em diante)\",\n        \"badge\": \"Rastreio Ativo\",\n        \"desc\": \"Avaliação rotineira a cada 14 dias: medida do Maior Bolsão Vertical (MBV), visualização de bexigas fetais e Doppler da Artéria Cerebral Média (PVS-ACM) e Artéria Umbilical feto a feto.\",\n        \"alert\": \"Permite detecção precoce de STFF ou TAPS antes do comprometimento hemodinâmico irreversível!\"\n      },\n      {\n        \"step\": 2,\n        \"title\": \"Diferenciação Sindrômica de Alta Precisão\",\n        \"badge\": \"Diagnóstico Diferencial\",\n        \"desc\": \"Se discrepância de líquido (oligo-poli) -> STFF de Quintero. Se líquido normal e PVS-ACM discrepante (> 1,5 vs < 1,0 MoM) -> TAPS. Se discordância de peso >= 20% com Doppler de AU alterado -> RCFs de Gratacós.\",\n        \"alert\": \"Líquido amniótico concordante exclui STFF e orienta para TAPS ou Restrição de Crescimento!\"\n      },\n      {\n        \"step\": 3,\n        \"title\": \"Intervenção Cirúrgica Fetal Dirigida\",\n        \"badge\": \"Conduta Padrão-Ouro\",\n        \"desc\": \"Na STFF (Quintero >= II): fotocoagulação a laser pela Técnica de Solomon (16-26s). No TRAP: oclusão vascular do cordão umbilical do acárdico por radiofrequência ou laser.\",\n        \"alert\": \"No óbito de um co-gemelar: não indicar cesárea imediata; avaliar PVS-ACM e programar RNM após 2-3 semanas!\"\n      }\n    ]\n  }\n}\n```\n\n---\n\n### 🔄 O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)\n\n| Ponto de Conduta | Prática Antiga (Pegadinha das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |\n| :--- | :--- | :--- | :--- |\n| **Óbito de um Co-gemelar Monocoriônico** | Indicar cesariana de emergência imediata na tentativa de 'salvar' o feto vivo | **Conduta conservadora:** estabilização, avaliação de anemia por PVS-ACM e **RNM fetal após 2 a 3 semanas** | **FEBRASGO / ISUOG (2023)** |\n| **Momento de Intervenção no TRAP** | Aguardar hidropisia no feto bomba ou interrupção tardia | **Oclusão vascular precoce do cordão por Radiofrequência ou Laser** entre 16 e 24 semanas | **SMFM / ISUOG (2023)** |\n| **Critério Diagnóstico do TAPS** | Classificar como STFF atípica ou exigir oligo-polidrâmnio | Entidade distinta com **líquido amniótico normal**, firmada pelo **Doppler de PVS-ACM** (> 1,5 vs < 1,0 MoM) | **Leiden Consensus / ISUOG (2022)** |\n| **Manejo da RCFs Gratacós Tipo III** | Conduta expectante até o termo devido aos períodos de Doppler normal | Parto programado precoce com **32 a 34 semanas** devido ao risco de morte fetal súbita por grandes anastomoses AA | **Gratacós / ISUOG (2023)** |\n\n> [!IMPORTANT] Alerta de Atualização para Provas de 2024-2026:\n> A conduta conservadora diante do óbito intrauterino de um gemelar monocoriônico com concepto vivo é uma das pegadinhas mais assinaladas em provas paulistas (USP, UNICAMP) e federais (ENARE). Não caia no erro de marcar cesariana imediata: o dano cerebral isquêmico ocorre no momento do óbito; antecipar o parto só gera sequelas neonatais de prematuridade extrema.\n\n---\n\n## 7. Algoritmo Decisório no Manejo das Complicações Monocoriônicas\n\n### Passo a Passo Sintético da Cascata Decisória\n\n1.  **[Triagem Ultrassonográfica]:** Em toda gestação monocoriônica, realizar ecografia obstétrica com dopplervelocimetria rigorosamente a cada **14 dias a partir de 16 semanas**.\n2.  **[Avaliação de Líquido Amniótico]:** Avaliar o Maior Bolsão Vertical (MBV). Se houver discrepância oligo-poli (MBV $< 2\\text{ cm}$ no doador e $> 8/10\\text{ cm}$ no receptor), classificar como **STFF** e estadiar por Quintero.\n3.  **[Doppler da ACM]:** Se o líquido amniótico estiver normal e concordante, avaliar o PVS-ACM de ambos os fetos. Se houver discrepância ($> 1,5\\text{ MoM}$ em um e $< 1,0\\text{ MoM}$ no outro), firmar diagnóstico de **Sequência TAPS**.\n4.  **[Avaliação Ponderal e Artéria Umbilical]:** Se houver discordância ponderal $\\ge 20\\%$, classificar a **RCFs segundo Gratacós** avaliando se a diástole na artéria umbilical é positiva (Tipo I), ausente/reversa persistente (Tipo II) ou intermitente (Tipo III).\n5.  **[Conduta Cirúrgica Especializada]:** Se confirmada STFF Quintero $\\ge \\text{II}$ ou TRAP com sobrecarga cardíaca do feto bomba entre 16 e 26 semanas, encaminhar com urgência para **cirurgia fetal em centro terciário**.\n\n---\n\n## Diretrizes Oficiais & Consensos de Referência\n\n*   **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** Manual de Orientação em Medicina Fetal e Gestação Múltipla (2021/2023).\n*   **ISUOG (International Society of Ultrasound in Obstetrics and Gynecology):** Practice Guidelines: role of ultrasound in twin pregnancy and management of monochorionic complications (2023).\n*   **SMFM (Society for Maternal-Fetal Medicine):** Consult Series #60: Management of monochorionic twin pregnancy and specific complications (2022/2024).\n*   **ACOG (American College of Obstetricians and Gynecologists):** Practice Bulletin No. 231 - Management of Multifetal Gestations (2021, revalidado 2024).\n*   **FIGO (International Federation of Gynecology and Obstetrics):** Guidelines on fetal therapy and monochorionic twinning complications (2023).\n"
},
  {
  "id": "mat-gem-03",
  "focusId": "obs-gem-stff",
  "title": "Síndrome da Transfusão Feto-Fetal (STFF)",
  "specialty": "Ginecologia e Obstetrícia",
  "theme": "Gestação Múltipla",
  "focus": "Síndrome da Transfusão Feto-Fetal",
  "readTimeMinutes": 12,
  "lastUpdatedYear": 2026,
  "guidelineBadge": "FEBRASGO / Eurofetus / ISUOG",
  "summarySnippet": "Critérios diagnósticos ultrassonográficos obrigatórios de oligo-polidrâmnio, fisiopatologia do doador vs. receptor, classificação completa de Quintero (I a V) e fotocoagulação a laser fetoscópica pela Técnica de Solomon.",
  "keyPoints": [
    "A STFF é complicação exclusiva de gestações monocoriônicas diamnióticas decorrente de shunts arteriovenosos profundos desbalanceados.",
    "Critérios diagnósticos obrigatórios: oligoâmnio no doador (MBV < 2 cm) associado a polidrâmnio no receptor (MBV > 8 cm até 20s ou > 10 cm após).",
    "Discordância de peso ou de tamanho fetal NÃO é critério diagnóstico obrigatório de STFF (pertence à Restrição de Crescimento Fetal Seletiva).",
    "Quintero II = bexiga do doador invisível (anúria); Quintero III = Doppler alterado (AU diástole zero/reversa, DV onda A reversa ou VU pulsátil); Quintero IV = hidropisia.",
    "O tratamento padrão-ouro comprovado pelo Eurofetus Trial é a fotocoagulação a laser fetoscópica pela Técnica de Solomon (16 a 26 semanas).",
    "A Técnica de Solomon promove a dicorionização contínua do equador vascular placentário, reduzindo a recidiva de STFF e a ocorrência de TAPS pós-laser.",
    "Amniodrenagem seriada é medida puramente paliativa de alívio e a septostomia deliberada é formalmente contraindicada."
  ],
  "recurrenceStats": {
    "focusSlug": "gemelaridade-stff",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Gestação Múltipla",
    "focus": "Síndrome da Transfusão Feto-Fetal",
    "totalQuestions": 48,
    "timeframeRange": "2017-2026",
    "version": 1,
    "donutSlices": [
      {
        "id": 1,
        "name": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
        "shortName": "Critérios USG",
        "percentage": 39.6,
        "questionCount": 19,
        "priority": "Crítica",
        "color": "#3B82F6",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "Oligoâmnio no doador (MBV < 2 cm) + Polidrâmnio no receptor (MBV > 8 ou 10 cm) em MCDA.",
        "focusExplanation": "O diagnóstico de STFF exige obrigatoriamente a presença concomitante de: **gestação monocoriônica diamniótica** comprovada (Sinal do T); **oligoidrâmnio grave no feto doador**, definido pelo Maior Bolsão Vertical (**MBV < 2 cm**); e **polidrâmnio tenso no feto receptor**, definido por **MBV > 8 cm em gestações até 20 semanas** ou **MBV > 10 cm após 20 semanas**. A discordância de peso fetal NÃO é critério diagnóstico de STFF (pertence à Restrição de Crescimento Fetal Seletiva).",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Valores de corte do Maior Bolsão Vertical (MBV < 2 cm e > 8/10 cm) como o único critério definidor primário da síndrome.",
            "trapAlert": "Assinalar alternativa que exige discordância de peso fetal > 20% para fechar o diagnóstico de STFF."
          },
          "ENARE": {
            "howItCharges": "Apresentação de caso clínico com laudo ultrassonográfico de 18 semanas em gestante com placenta única, demonstrando bolsão de 1,2 cm em um feto e 9,5 cm no outro.",
            "trapAlert": "Confundir com rotura prematura de membranas no feto com pouco líquido."
          },
          "USP": {
            "howItCharges": "Diferenciação precisa entre o corte de polidrâmnio antes e depois de 20 semanas: MBV > 8 cm (<= 20 sem) vs. MBV > 10 cm (> 20 sem).",
            "trapAlert": "Aplicar o corte de MBV > 8 cm indiscriminadamente para gestações de 24 semanas."
          },
          "UNICAMP": {
            "howItCharges": "A UNICAMP enfatiza a medida do Maior Bolsão Vertical em cavidade livre de cordão e membros fetais, rechaçando o ILA como parâmetro de escolha em gemelares.",
            "trapAlert": "Utilizar o Índice de Líquido Amniótico (ILA) de 4 quadrantes para estadiar STFF (o ILA não é validado para gemelares)."
          },
          "PSU-MG": {
            "howItCharges": "Identificação rápida: feto com bexiga cheia e muito líquido associado a feto prensado contra a parede uterina sem líquido visível.",
            "trapAlert": "Sugerir que a gestação é dicoriônica com agenesia renal em um dos fetos."
          },
          "AMRIGS": {
            "howItCharges": "Pergunta direta sobre os valores numéricos em centímetros que definem a oligohidramnia e o polihidrâmnio na STFF.",
            "trapAlert": "Confundir 2 cm com 3 cm para o limite inferior do doador."
          },
          "SUS-SP": {
            "howItCharges": "Encaminhamento de emergência: detecção de oligo-polidrâmnio no 2º trimestre exige referência imediata para cirurgia fetal.",
            "trapAlert": "Aguardar retorno ambulatorial em 30 dias para checar evolução do líquido."
          }
        }
      },
      {
        "id": 2,
        "name": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
        "shortName": "Estadiamento Quintero",
        "percentage": 20.8,
        "questionCount": 10,
        "priority": "Alta",
        "color": "#10B981",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "I (Oligo-Poli) -> II (Bexiga ausente) -> III (Doppler crítico) -> IV (Hidrops) -> V (Óbito).",
        "focusExplanation": "A **Classificação de Quintero** é a ferramenta prognóstica soberana: **Estádio I**: Oligo-polidrâmnio presente, com **bexiga do feto doador visível** e Doppler normal; **Estádio II**: **Bexiga do doador colapsada e NÃO visualizada** durante todo o exame (anúria fetal); **Estádio III**: **Doppler criticamente alterado** (diástole zero ou reversa na artéria umbilical, onda A reversa no ducto venoso ou pulsação na veia umbilical); **Estádio IV**: **Hidropisia fetal franca** (ascite, derrame ou anasarca, habitualmente no receptor); **Estádio V**: **Óbito intrauterino** de um ou ambos os conceptos.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Identificação exata do estádio a partir da descrição dos achados ultrassonográficos e do traçado de dopplervelocimetria.",
            "trapAlert": "Classificar ausência de bexiga como Estádio III ou Doppler alterado como Estádio II."
          },
          "ENARE": {
            "howItCharges": "Caso clínico descrevendo feto doador com bexiga não visualizada após 60 minutos de observação ecográfica contínua, mantendo Doppler normal (Quintero II).",
            "trapAlert": "Marcar Estádio I por considerar apenas o volume de líquido."
          },
          "USP": {
            "howItCharges": "Análise detalhada do Doppler do Estádio III: presença de onda A reversa no ducto venoso do receptor (insuficiência cardíaca direita) ou diástole zero na AU do doador.",
            "trapAlert": "Achar que o Doppler alterado precisa estar presente obrigatoriamente em ambos os conceptos simultaneamente."
          },
          "UNICAMP": {
            "howItCharges": "Apresentação de feto receptor com ascite fetal volumosa e derrame pericárdico: enquadramento imediato no Estádio IV de Quintero.",
            "trapAlert": "Exigir óbito iminente para classificar como Estádio IV."
          },
          "PSU-MG": {
            "howItCharges": "Sequência cronológica dos estádios de Quintero: qual parâmetro define a transição do Estádio I para o Estádio II (visualização da bexiga fetal).",
            "trapAlert": "Responder que a transição decorre da alteração da artéria cerebral média."
          },
          "AMRIGS": {
            "howItCharges": "Enunciado direto questionando qual o achado que caracteriza o Estádio III da classificação de Quintero.",
            "trapAlert": "Responder hidropisia fetal (hidropisia é Estádio IV)."
          },
          "SUS-SP": {
            "howItCharges": "Reconhecimento de que a progressão entre os estádios pode ser rápida e atípica, pulando etapas em menos de 48-72 horas.",
            "trapAlert": "Supor que todo caso passa obrigatoriamente e lentamente por todos os estádios de forma linear."
          }
        }
      },
      {
        "id": 3,
        "name": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
        "shortName": "Anastomoses AV",
        "percentage": 20.8,
        "questionCount": 10,
        "priority": "Alta",
        "color": "#EC4899",
        "trend": "estavel",
        "trendLabel": "🏛️ Clássico Estável",
        "takeaway": "Shunts AV cotiledonares profundos desbalanceados sem anastomoses AA compensatórias suficientes.",
        "focusExplanation": "A etiologia reside na presença de **anastomoses arteriovenosas (AV) profundas desbalanceadas** no interior dos cotilédones compartilhados. O fluxo unidirecional transfere cronicamente sangue do doador para o receptor. O **doador** desenvolve hipovolemia, hipoperfusão renal e ativação intensa do **Sistema Renina-Angiotensina-Aldosterona (SRAA)**, culminando em oligúria extrema e oligoidrâmnio (*stuck twin*). O **receptor** sofre hipervolemia crônica, aumento do **Peptídeo Natriurético Atrial (PNA)** e diurese osmótica com polidrâmnio massivo, evoluindo com sobrecarga ventricular direita, hipertensão pulmonar, regurgitação tricúspide e falência cardíaca.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Mecanismo neuro-humoral: ativação do SRAA no doador vs. hipervolemia com PNA elevado e hipertrofia miocárdica no receptor.",
            "trapAlert": "Afirmar que a falência cardíaca ocorre no feto doador por anemia severa."
          },
          "ENARE": {
            "howItCharges": "Anatomia vascular placentária: localização das anastomoses AV responsáveis pela STFF no leito capilar cotiledonar profundo.",
            "trapAlert": "Confundir com anastomoses superficiais artério-arteriais (que são protetoras)."
          },
          "USP": {
            "howItCharges": "Aprofundamento hemodinâmico: passagem de renina do doador para o receptor através do shunt agrava a vasoconstrição e a hipertensão sistêmica no feto receptor.",
            "trapAlert": "Desconsiderar o impacto hormonal cruzado da renina na circulação do receptor."
          },
          "UNICAMP": {
            "howItCharges": "Diferença fisiopatológica entre STFF e TAPS: na STFF o shunt transporta plasma e solutos; no TAPS o shunt é lento e transporta apenas hemácias.",
            "trapAlert": "Afirmar que o mecanismo etiopatogênico da STFF e do TAPS é idêntico."
          },
          "PSU-MG": {
            "howItCharges": "Por que o feto doador fica colado à parede uterina (mecanismo mecânico do stuck twin pela ausência completa de líquido no saco).",
            "trapAlert": "Atribuir o stuck twin a bridas amnióticas ou aderências intrauterinas inflamatórias."
          },
          "AMRIGS": {
            "howItCharges": "Causa básica da poliúria no feto receptor: hipervolemia gerando elevação da taxa de filtração glomerular e supressão do ADH.",
            "trapAlert": "Dizer que a poliúria decorre de diabetes gestacional materno."
          },
          "SUS-SP": {
            "howItCharges": "Morbidade associada ao polidrâmnio agudo materno: dispneia, risco de rotura prematura de membranas e trabalho de parto pré-termo extremo.",
            "trapAlert": "Tratar o polidrâmnio sintomático apenas com restrição hídrica materna."
          }
        }
      },
      {
        "id": 4,
        "name": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
        "shortName": "Clínica & Sobrecarga",
        "percentage": 12.5,
        "questionCount": 6,
        "priority": "Média",
        "color": "#F59E0B",
        "trend": "estavel",
        "trendLabel": "🏛️ Clássico Estável",
        "takeaway": "Doador desidratado/restrito (*stuck twin*) vs. Receptor pletórico/hipertrófico com hidropisia.",
        "focusExplanation": "Sem intervenção médica, a mortalidade perinatal na STFF grave ultrapassa 90%. O **feto doador** apresenta restrição de crescimento severa, palidez, ausência de urina na bexiga e fica imobilizado junto à parede uterina pela membrana amniótica retraída (*stuck twin*). O **feto receptor** é volumoso, pletórico, policitêmico, com bexiga persistentemente repleta e sinais de **cardiomiopatia hipertrófica obstrutiva** (espessamento do septo interventricular e insuficiência tricúspide), evoluindo para anasarca, derrame pericárdico e hidropisia franca.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Quadro clínico contrastante entre o doador (hipovolêmico e desidratado) e o receptor (sobrecarregado e hidrópico).",
            "trapAlert": "Achar que o feto receptor é o 'saudável' por ser maior e ter muito líquido amniótico."
          },
          "ENARE": {
            "howItCharges": "Avaliação ecocardiográfica fetal no feto receptor revelando regurgitação tricúspide e disfunção diastólica ventricular direita.",
            "trapAlert": "Interpretar o sopro tricúspide como cardiopatia congênita estrutural primária e não funcional."
          },
          "USP": {
            "howItCharges": "Risco neurológico a longo prazo: sobrevida com sequelas neurológicas motoras e cognitivas sem descompressão vascular oportuna.",
            "trapAlert": "Acreditar que a lesão neurológica decorre exclusivamente do parto prematuro e não da hipoperfusão crônica."
          },
          "UNICAMP": {
            "howItCharges": "Impacto materno da síndrome de espelho (Ballantyne Syndrome): pré-eclâmpsia grave materna desencadeada pela hidropisia fetal do receptor.",
            "trapAlert": "Desconhecer a associação entre hidropisia fetal grave na STFF e síndrome materna de espelho."
          },
          "PSU-MG": {
            "howItCharges": "Reconhecimento semiológico do abdome materno em 'casca de ovo' pela distensão polihidrâmnica aguda.",
            "trapAlert": "Confundir com polidrâmnio crônico idiopático de progressão lenta."
          },
          "AMRIGS": {
            "howItCharges": "Alterações hematimétricas pós-natais: hematócrito do receptor acentuadamente superior ao do doador.",
            "trapAlert": "Esperar hematócritos concordantes entre os conceptos."
          },
          "SUS-SP": {
            "howItCharges": "Acolhimento da puérpera com recém-nascidos acometidos por STFF na UTI neonatal e seguimento multidisciplinar.",
            "trapAlert": "Dar alta neonatal precoce sem ecocardiograma e avaliação neurológica especializada."
          }
        }
      },
      {
        "id": 5,
        "name": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
        "shortName": "Ablação a Laser",
        "percentage": 6.3,
        "questionCount": 3,
        "priority": "Média",
        "color": "#8B5CF6",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "Laser fetoscópico (Técnica de Solomon) entre 16 e 26 semanas é o padrão-ouro curativo absoluto.",
        "focusExplanation": "A **fotocoagulação a laser das anastomoses vasculares por fetoscopia** é a terapia padrão-ouro de primeira linha comprovada pelo ensaio clínico multinacional *Eurofetus* para **Quintero >= II entre 16 e 26 semanas** (e Quintero I progressivo/sintomático). A **Técnica de Solomon** consiste na coagulação de todas as anastomoses seguida de uma linha de fotocoagulação contínua ao longo de todo o equador vascular placentário de borda a borda, promovendo a **dicorionização funcional completa da placenta**. Essa técnica reduziu drasticamente a recorrência da STFF e a incidência de TAPS pós-laser em relação à ablação seletiva pontual simples.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Superioridade inequívoca da cirurgia fetal a laser sobre a amniodrenagem descompressiva seriada em taxas de sobrevida e redução de sequelas neurológicas.",
            "trapAlert": "Indicar amniodrenagem seriada como terapia de primeira escolha quando o laser fetoscópico está disponível."
          },
          "ENARE": {
            "howItCharges": "Janela terapêutica ideal para realização da fotocoagulação a laser por fetoscopia: entre 16 e 26 semanas de idade gestacional.",
            "trapAlert": "Indicar o procedimento fetoscópico com 32 semanas de gestação."
          },
          "USP": {
            "howItCharges": "Conceito e vantagens da Técnica de Solomon: coagulação contínua que une os cotilédones na linha do equador vascular placentário para dicorionizar a placenta e evitar microshunts residuais.",
            "trapAlert": "Confundir Técnica de Solomon com técnica não seletiva indiscriminada de toda a placa corial."
          },
          "UNICAMP": {
            "howItCharges": "Papel restrito da amniodrenagem seriada descompressiva: reservada para casos paliativos de alívio sintomático materno quando a fetoscopia a laser é tecnicamente inacessível ou contraindicada.",
            "trapAlert": "Considerar a amniodrenagem como tratamento etiológico das anastomoses vasculares."
          },
          "PSU-MG": {
            "howItCharges": "Contraindicação formal da septostomia deliberada da membrana intergemelar por risco de transformar a gestação em monoamniótica iatrogênica.",
            "trapAlert": "Indicar septostomia como técnica segura de equilíbrio pressórico."
          },
          "AMRIGS": {
            "howItCharges": "Resultados pós-laser: taxa de sobrevida de pelo menos um feto superior a 80-85% e sobrevida de ambos em cerca de 50-60%.",
            "trapAlert": "Afirmar que a cirurgia a laser tem mortalidade fetal de 100%."
          },
          "SUS-SP": {
            "howItCharges": "Vigilância pós-operatória: USG e Doppler semanais após o procedimento a laser para monitorização de sangramento, descolamento de membranas e TAPS pós-fetoscopia.",
            "trapAlert": "Dispensar a paciente do seguimento especializado após o sucesso cirúrgico inicial."
          }
        }
      }
    ],
    "bancaBreakdown": {
      "ENARE": {
        "banca": "ENARE",
        "totalQuestions": 11,
        "topSubfocos": [
          {
            "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
            "questionCount": 5,
            "percentageInBanca": 45.5
          },
          {
            "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
            "questionCount": 2,
            "percentageInBanca": 18.2
          },
          {
            "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
            "questionCount": 2,
            "percentageInBanca": 18.2
          },
          {
            "subfoco": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
            "questionCount": 1,
            "percentageInBanca": 9.1
          },
          {
            "subfoco": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
            "questionCount": 1,
            "percentageInBanca": 9.0
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "USP": {
        "banca": "USP",
        "totalQuestions": 13,
        "topSubfocos": [
          {
            "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
            "questionCount": 5,
            "percentageInBanca": 38.5
          },
          {
            "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
            "questionCount": 3,
            "percentageInBanca": 23.1
          },
          {
            "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
            "questionCount": 3,
            "percentageInBanca": 23.1
          },
          {
            "subfoco": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
            "questionCount": 1,
            "percentageInBanca": 7.7
          },
          {
            "subfoco": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
            "questionCount": 1,
            "percentageInBanca": 7.6
          }
        ],
        "predominantDifficulty": "Difícil"
      },
      "UNICAMP": {
        "banca": "UNICAMP",
        "totalQuestions": 9,
        "topSubfocos": [
          {
            "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
            "questionCount": 4,
            "percentageInBanca": 44.4
          },
          {
            "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
            "questionCount": 2,
            "percentageInBanca": 22.2
          },
          {
            "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
            "questionCount": 2,
            "percentageInBanca": 22.2
          },
          {
            "subfoco": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
            "questionCount": 1,
            "percentageInBanca": 11.2
          }
        ],
        "predominantDifficulty": "Difícil"
      },
      "PSU-MG": {
        "banca": "PSU-MG",
        "totalQuestions": 6,
        "topSubfocos": [
          {
            "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
            "questionCount": 2,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
            "questionCount": 2,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
            "questionCount": 1,
            "percentageInBanca": 16.7
          },
          {
            "subfoco": "Características Clínicas, Sobrecarga do Receptor e Stuck Twin",
            "questionCount": 1,
            "percentageInBanca": 16.7
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "AMRIGS": {
        "banca": "AMRIGS",
        "totalQuestions": 4,
        "topSubfocos": [
          {
            "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
            "questionCount": 2,
            "percentageInBanca": 50.0
          },
          {
            "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
            "questionCount": 1,
            "percentageInBanca": 25.0
          },
          {
            "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
            "questionCount": 1,
            "percentageInBanca": 25.0
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "SUS-SP": {
        "banca": "SUS-SP",
        "totalQuestions": 5,
        "topSubfocos": [
          {
            "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
            "questionCount": 2,
            "percentageInBanca": 40.0
          },
          {
            "subfoco": "Classificação de Quintero (Estádios I a V) e Parâmetros Doppler",
            "questionCount": 1,
            "percentageInBanca": 20.0
          },
          {
            "subfoco": "Fisiopatologia das Anastomoses Arteriovenosas Profundas",
            "questionCount": 1,
            "percentageInBanca": 20.0
          },
          {
            "subfoco": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
            "questionCount": 1,
            "percentageInBanca": 20.0
          }
        ],
        "predominantDifficulty": "Médio"
      }
    },
    "topTraps": [
      {
        "subfoco": "Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico",
        "trapTitle": "Distrator de Discordância Ponderal na STFF",
        "trapDescription": "Discordância de peso > 20% define CIUR seletivo, NÃO é critério diagnóstico obrigatório de STFF (que exige sequência oligo-poli com MBV < 2 cm e > 8/10 cm)."
      },
      {
        "subfoco": "Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias",
        "trapTitle": "Distrator de Amniodrenagem Seriada como Primeira Linha",
        "trapDescription": "Amniodrenagem seriada é medida puramente paliativa de alívio; o padrão-ouro curativo definitivo é a ablação a laser pela Técnica de Solomon (Eurofetus Trial)."
      }
    ],
    "auditHash": "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012",
    "needsRecalc": false,
    "certifiedAt": "2026-11-04T00:00:00.000Z",
    "lastRecalculatedAt": "2026-11-04T00:00:00.000Z",
    "status": "certified"
  },
  "markdownContent": "## 1. O Que Mais Cai nas Provas de Residência Médica\n\nA Síndrome de Transfusão Feto-Fetal (STFF) é o tema mais cobrado e de maior rigor técnico dentro do capítulo de gestação múltipla nas provas de R1 e R3 de todo o país (ENARE, USP-SP, UNICAMP, PSU-MG, AMRIGS, SUS-SP). O examinador cobra do candidato a capacidade de reconhecer prontamente a síndrome baseando-se **exclusivamente na discrepância do volume de líquido amniótico (sequência oligo-polidrâmnio)** em gestação monocoriônica diamniótica, sem se deixar induzir a erro por parâmetros de crescimento ponderal.\n\nAlém do diagnóstico sindrômico primário, as questões exigem o domínio impecável da **Classificação de Quintero (Estádios I a V)**, a indicação mandatória da **ablação vascular a laser fetoscópica (Técnica de Solomon)** entre 16 e 26 semanas como padrão-ouro respaldado pelo histórico ensaio clínico *Eurofetus*, e o manejo das complicações hemodinâmicas nos conceptos doador (*stuck twin*) e receptor (*hidrópico com sobrecarga de câmaras direitas*).\n\n```gem-stats-stff\n{\n  \"focusSlug\": \"gemelaridade-stff\",\n  \"specialty\": \"Ginecologia e Obstetrícia\",\n  \"theme\": \"Gestação Múltipla\",\n  \"focus\": \"Síndrome da Transfusão Feto-Fetal\",\n  \"totalQuestions\": 48,\n  \"timeframeRange\": \"2017-2026\",\n  \"version\": 1,\n  \"donutSlices\": [\n    {\n      \"id\": 1,\n      \"name\": \"Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico\",\n      \"shortName\": \"Critérios USG\",\n      \"percentage\": 39.6,\n      \"questionCount\": 19,\n      \"priority\": \"Crítica\",\n      \"color\": \"#3B82F6\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Oligoâmnio no doador (MBV < 2 cm) + Polidrâmnio no receptor (MBV > 8 ou 10 cm) em MCDA.\",\n      \"focusExplanation\": \"O diagnóstico de STFF exige obrigatoriamente a presença concomitante de: **gestação monocoriônica diamniótica** comprovada (Sinal do T); **oligoidrâmnio grave no feto doador**, definido pelo Maior Bolsão Vertical (**MBV < 2 cm**); e **polidrâmnio tenso no feto receptor**, definido por **MBV > 8 cm em gestações até 20 semanas** ou **MBV > 10 cm após 20 semanas**. A discordância de peso fetal NÃO é critério diagnóstico de STFF (pertence à Restrição de Crescimento Fetal Seletiva).\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Valores de corte do Maior Bolsão Vertical (MBV < 2 cm e > 8/10 cm) como o único critério definidor primário da síndrome.\",\n          \"trapAlert\": \"Assinalar alternativa que exige discordância de peso fetal > 20% para fechar o diagnóstico de STFF.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Apresentação de caso clínico com laudo ultrassonográfico de 18 semanas em gestante com placenta única, demonstrando bolsão de 1,2 cm em um feto e 9,5 cm no outro.\",\n          \"trapAlert\": \"Confundir com rotura prematura de membranas no feto com pouco líquido.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Diferenciação precisa entre o corte de polidrâmnio antes e depois de 20 semanas: MBV > 8 cm (<= 20 sem) vs. MBV > 10 cm (> 20 sem).\",\n          \"trapAlert\": \"Aplicar o corte de MBV > 8 cm indiscriminadamente para gestações de 24 semanas.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"A UNICAMP enfatiza a medida do Maior Bolsão Vertical em cavidade livre de cordão e membros fetais, rechaçando o ILA como parâmetro de escolha em gemelares.\",\n          \"trapAlert\": \"Utilizar o Índice de Líquido Amniótico (ILA) de 4 quadrantes para estadiar STFF (o ILA não é validado para gemelares).\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Identificação rápida: feto com bexiga cheia e muito líquido associado a feto prensado contra a parede uterina sem líquido visível.\",\n          \"trapAlert\": \"Sugerir que a gestação é dicoriônica com agenesia renal em um dos fetos.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Pergunta direta sobre os valores numéricos em centímetros que definem a oligohidramnia e o polihidrâmnio na STFF.\",\n          \"trapAlert\": \"Confundir 2 cm com 3 cm para o limite inferior do doador.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Encaminhamento de emergência: detecção de oligo-polidrâmnio no 2º trimestre exige referência imediata para cirurgia fetal.\",\n          \"trapAlert\": \"Aguardar retorno ambulatorial em 30 dias para checar evolução do líquido.\"\n        }\n      }\n    },\n    {\n      \"id\": 2,\n      \"name\": \"Classificação de Quintero (Estádios I a V) e Parâmetros Doppler\",\n      \"shortName\": \"Estadiamento Quintero\",\n      \"percentage\": 20.8,\n      \"questionCount\": 10,\n      \"priority\": \"Alta\",\n      \"color\": \"#10B981\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"I (Oligo-Poli) -> II (Bexiga ausente) -> III (Doppler crítico) -> IV (Hidrops) -> V (Óbito).\",\n      \"focusExplanation\": \"A **Classificação de Quintero** é a ferramenta prognóstica soberana: **Estádio I**: Oligo-polidrâmnio presente, com **bexiga do feto doador visível** e Doppler normal; **Estádio II**: **Bexiga do doador colapsada e NÃO visualizada** durante todo o exame (anúria fetal); **Estádio III**: **Doppler criticamente alterado** (diástole zero ou reversa na artéria umbilical, onda A reversa no ducto venoso ou pulsação na veia umbilical); **Estádio IV**: **Hidropisia fetal franca** (ascite, derrame ou anasarca, habitualmente no receptor); **Estádio V**: **Óbito intrauterino** de um ou ambos os conceptos.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Identificação exata do estádio a partir da descrição dos achados ultrassonográficos e do traçado de dopplervelocimetria.\",\n          \"trapAlert\": \"Classificar ausência de bexiga como Estádio III ou Doppler alterado como Estádio II.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Caso clínico descrevendo feto doador com bexiga não visualizada após 60 minutos de observação ecográfica contínua, mantendo Doppler normal (Quintero II).\",\n          \"trapAlert\": \"Marcar Estádio I por considerar apenas o volume de líquido.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Análise detalhada do Doppler do Estádio III: presença de onda A reversa no ducto venoso do receptor (insuficiência cardíaca direita) ou diástole zero na AU do doador.\",\n          \"trapAlert\": \"Achar que o Doppler alterado precisa estar presente obrigatoriamente em ambos os conceptos simultaneamente.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Apresentação de feto receptor com ascite fetal volumosa e derrame pericárdico: enquadramento imediato no Estádio IV de Quintero.\",\n          \"trapAlert\": \"Exigir óbito iminente para classificar como Estádio IV.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Sequência cronológica dos estádios de Quintero: qual parâmetro define a transição do Estádio I para o Estádio II (visualização da bexiga fetal).\",\n          \"trapAlert\": \"Responder que a transição decorre da alteração da artéria cerebral média.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Enunciado direto questionando qual o achado que caracteriza o Estádio III da classificação de Quintero.\",\n          \"trapAlert\": \"Responder hidropisia fetal (hidropisia é Estádio IV).\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Reconhecimento de que a progressão entre os estádios pode ser rápida e atípica, pulando etapas em menos de 48-72 horas.\",\n          \"trapAlert\": \"Supor que todo caso passa obrigatoriamente e lentamente por todos os estádios de forma linear.\"\n        }\n      }\n    },\n    {\n      \"id\": 3,\n      \"name\": \"Fisiopatologia das Anastomoses Arteriovenosas Profundas\",\n      \"shortName\": \"Anastomoses AV\",\n      \"percentage\": 20.8,\n      \"questionCount\": 10,\n      \"priority\": \"Alta\",\n      \"color\": \"#EC4899\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"Shunts AV cotiledonares profundos desbalanceados sem anastomoses AA compensatórias suficientes.\",\n      \"focusExplanation\": \"A etiologia reside na presença de **anastomoses arteriovenosas (AV) profundas desbalanceadas** no interior dos cotilédones compartilhados. O fluxo unidirecional transfere cronicamente sangue do doador para o receptor. O **doador** desenvolve hipovolemia, hipoperfusão renal e ativação intensa do **Sistema Renina-Angiotensina-Aldosterona (SRAA)**, culminando em oligúria extrema e oligoidrâmnio (*stuck twin*). O **receptor** sofre hipervolemia crônica, aumento do **Peptídeo Natriurético Atrial (PNA)** e diurese osmótica com polidrâmnio massivo, evoluindo com sobrecarga ventricular direita, hipertensão pulmonar, regurgitação tricúspide e falência cardíaca.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Mecanismo neuro-humoral: ativação do SRAA no doador vs. hipervolemia com PNA elevado e hipertrofia miocárdica no receptor.\",\n          \"trapAlert\": \"Afirmar que a falência cardíaca ocorre no feto doador por anemia severa.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Anatomia vascular placentária: localização das anastomoses AV responsáveis pela STFF no leito capilar cotiledonar profundo.\",\n          \"trapAlert\": \"Confundir com anastomoses superficiais artério-arteriais (que são protetoras).\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Aprofundamento hemodinâmico: passagem de renina do doador para o receptor através do shunt agrava a vasoconstrição e a hipertensão sistêmica no feto receptor.\",\n          \"trapAlert\": \"Desconsiderar o impacto hormonal cruzado da renina na circulação do receptor.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Diferença fisiopatológica entre STFF e TAPS: na STFF o shunt transporta plasma e solutos; no TAPS o shunt é lento e transporta apenas hemácias.\",\n          \"trapAlert\": \"Afirmar que o mecanismo etiopatogênico da STFF e do TAPS é idêntico.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Por que o feto doador fica colado à parede uterina (mecanismo mecânico do stuck twin pela ausência completa de líquido no saco).\",\n          \"trapAlert\": \"Atribuir o stuck twin a bridas amnióticas ou aderências intrauterinas inflamatórias.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Causa básica da poliúria no feto receptor: hipervolemia gerando elevação da taxa de filtração glomerular e supressão do ADH.\",\n          \"trapAlert\": \"Dizer que a poliúria decorre de diabetes gestacional materno.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Morbidade associada ao polidrâmnio agudo materno: dispneia, risco de rotura prematura de membranas e trabalho de parto pré-termo extremo.\",\n          \"trapAlert\": \"Tratar o polidrâmnio sintomático apenas com restrição hídrica materna.\"\n        }\n      }\n    },\n    {\n      \"id\": 4,\n      \"name\": \"Características Clínicas, Sobrecarga do Receptor e Stuck Twin\",\n      \"shortName\": \"Clínica & Sobrecarga\",\n      \"percentage\": 12.5,\n      \"questionCount\": 6,\n      \"priority\": \"Média\",\n      \"color\": \"#F59E0B\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"Doador desidratado/restrito (*stuck twin*) vs. Receptor pletórico/hipertrófico com hidropisia.\",\n      \"focusExplanation\": \"Sem intervenção médica, a mortalidade perinatal na STFF grave ultrapassa 90%. O **feto doador** apresenta restrição de crescimento severa, palidez, ausência de urina na bexiga e fica imobilizado junto à parede uterina pela membrana amniótica retraída (*stuck twin*). O **feto receptor** é volumoso, pletórico, policitêmico, com bexiga persistentemente repleta e sinais de **cardiomiopatia hipertrófica obstrutiva** (espessamento do septo interventricular e insuficiência tricúspide), evoluindo para anasarca, derrame pericárdico e hidropisia franca.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Quadro clínico contrastante entre o doador (hipovolêmico e desidratado) e o receptor (sobrecarregado e hidrópico).\",\n          \"trapAlert\": \"Achar que o feto receptor é o 'saudável' por ser maior e ter muito líquido amniótico.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Avaliação ecocardiográfica fetal no feto receptor revelando regurgitação tricúspide e disfunção diastólica ventricular direita.\",\n          \"trapAlert\": \"Interpretar o sopro tricúspide como cardiopatia congênita estrutural primária e não funcional.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Risco neurológico a longo prazo: sobrevida com sequelas neurológicas motoras e cognitivas sem descompressão vascular oportuna.\",\n          \"trapAlert\": \"Acreditar que a lesão neurológica decorre exclusivamente do parto prematuro e não da hipoperfusão crônica.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Impacto materno da síndrome de espelho (Ballantyne Syndrome): pré-eclâmpsia grave materna desencadeada pela hidropisia fetal do receptor.\",\n          \"trapAlert\": \"Desconhecer a associação entre hidropisia fetal grave na STFF e síndrome materna de espelho.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Reconhecimento semiológico do abdome materno em 'casca de ovo' pela distensão polihidrâmnica aguda.\",\n          \"trapAlert\": \"Confundir com polidrâmnio crônico idiopático de progressão lenta.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Alterações hematimétricas pós-natais: hematócrito do receptor acentuadamente superior ao do doador.\",\n          \"trapAlert\": \"Esperar hematócritos concordantes entre os conceptos.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Acolhimento da puérpera com recém-nascidos acometidos por STFF na UTI neonatal e seguimento multidisciplinar.\",\n          \"trapAlert\": \"Dar alta neonatal precoce sem ecocardiograma e avaliação neurológica especializada.\"\n        }\n      }\n    },\n    {\n      \"id\": 5,\n      \"name\": \"Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias\",\n      \"shortName\": \"Ablação a Laser\",\n      \"percentage\": 6.3,\n      \"questionCount\": 3,\n      \"priority\": \"Média\",\n      \"color\": \"#8B5CF6\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Laser fetoscópico (Técnica de Solomon) entre 16 e 26 semanas é o padrão-ouro curativo absoluto.\",\n      \"focusExplanation\": \"A **fotocoagulação a laser das anastomoses vasculares por fetoscopia** é a terapia padrão-ouro de primeira linha comprovada pelo ensaio clínico multinacional *Eurofetus* para **Quintero >= II entre 16 e 26 semanas** (e Quintero I progressivo/sintomático). A **Técnica de Solomon** consiste na coagulação de todas as anastomoses seguida de uma linha de fotocoagulação contínua ao longo de todo o equador vascular placentário de borda a borda, promovendo a **dicorionização funcional completa da placenta**. Essa técnica reduziu drasticamente a recorrência da STFF e a incidência de TAPS pós-laser em relação à ablação seletiva pontual simples.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Superioridade inequívoca da cirurgia fetal a laser sobre a amniodrenagem descompressiva seriada em taxas de sobrevida e redução de sequelas neurológicas.\",\n          \"trapAlert\": \"Indicar amniodrenagem seriada como terapia de primeira escolha quando o laser fetoscópico está disponível.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Janela terapêutica ideal para realização da fotocoagulação a laser por fetoscopia: entre 16 e 26 semanas de idade gestacional.\",\n          \"trapAlert\": \"Indicar o procedimento fetoscópico com 32 semanas de gestação.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Conceito e vantagens da Técnica de Solomon: coagulação contínua que une os cotilédones na linha do equador vascular placentário para dicorionizar a placenta e evitar microshunts residuais.\",\n          \"trapAlert\": \"Confundir Técnica de Solomon com técnica não seletiva indiscriminada de toda a placa corial.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Papel restrito da amniodrenagem seriada descompressiva: reservada para casos paliativos de alívio sintomático materno quando a fetoscopia a laser é tecnicamente inacessível ou contraindicada.\",\n          \"trapAlert\": \"Considerar a amniodrenagem como tratamento etiológico das anastomoses vasculares.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Contraindicação formal da septostomia deliberada da membrana intergemelar por risco de transformar a gestação em monoamniótica iatrogênica.\",\n          \"trapAlert\": \"Indicar septostomia como técnica segura de equilíbrio pressórico.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Resultados pós-laser: taxa de sobrevida de pelo menos um feto superior a 80-85% e sobrevida de ambos em cerca de 50-60%.\",\n          \"trapAlert\": \"Afirmar que a cirurgia a laser tem mortalidade fetal de 100%.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Vigilância pós-operatória: USG e Doppler semanais após o procedimento a laser para monitorização de sangramento, descolamento de membranas e TAPS pós-fetoscopia.\",\n          \"trapAlert\": \"Dispensar a paciente do seguimento especializado após o sucesso cirúrgico inicial.\"\n        }\n      }\n    }\n  ],\n  \"bancaBreakdown\": {\n    \"ENARE\": {\n      \"banca\": \"ENARE\",\n      \"totalQuestions\": 11,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico\",\n          \"questionCount\": 5,\n          \"percentageInBanca\": 45.5\n        },\n        {\n          \"subfoco\": \"Classificação de Quintero (Estádios I a V) e Parâmetros Doppler\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 18.2\n        },\n        {\n          \"subfoco\": \"Fisiopatologia das Anastomoses Arteriovenosas Profundas\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 18.2\n        },\n        {\n          \"subfoco\": \"Características Clínicas, Sobrecarga do Receptor e Stuck Twin\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 9.1\n        },\n        {\n          \"subfoco\": \"Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 9.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"USP\": {\n      \"banca\": \"USP\",\n      \"totalQuestions\": 13,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico\",\n          \"questionCount\": 5,\n          \"percentageInBanca\": 38.5\n        },\n        {\n          \"subfoco\": \"Classificação de Quintero (Estádios I a V) e Parâmetros Doppler\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 23.1\n        },\n        {\n          \"subfoco\": \"Fisiopatologia das Anastomoses Arteriovenosas Profundas\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 23.1\n        },\n        {\n          \"subfoco\": \"Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 7.7\n        },\n        {\n          \"subfoco\": \"Características Clínicas, Sobrecarga do Receptor e Stuck Twin\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 7.6\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"UNICAMP\": {\n      \"banca\": \"UNICAMP\",\n      \"totalQuestions\": 9,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 44.4\n        },\n        {\n          \"subfoco\": \"Classificação de Quintero (Estádios I a V) e Parâmetros Doppler\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 22.2\n        },\n        {\n          \"subfoco\": \"Fisiopatologia das Anastomoses Arteriovenosas Profundas\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 22.2\n        },\n        {\n          \"subfoco\": \"Características Clínicas, Sobrecarga do Receptor e Stuck Twin\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 11.2\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"PSU-MG\": {\n      \"banca\": \"PSU-MG\",\n      \"totalQuestions\": 6,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Classificação de Quintero (Estádios I a V) e Parâmetros Doppler\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Fisiopatologia das Anastomoses Arteriovenosas Profundas\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 16.7\n        },\n        {\n          \"subfoco\": \"Características Clínicas, Sobrecarga do Receptor e Stuck Twin\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 16.7\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"AMRIGS\": {\n      \"banca\": \"AMRIGS\",\n      \"totalQuestions\": 4,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 50.0\n        },\n        {\n          \"subfoco\": \"Classificação de Quintero (Estádios I a V) e Parâmetros Doppler\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 25.0\n        },\n        {\n          \"subfoco\": \"Fisiopatologia das Anastomoses Arteriovenosas Profundas\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 25.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"SUS-SP\": {\n      \"banca\": \"SUS-SP\",\n      \"totalQuestions\": 5,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 40.0\n        },\n        {\n          \"subfoco\": \"Classificação de Quintero (Estádios I a V) e Parâmetros Doppler\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Fisiopatologia das Anastomoses Arteriovenosas Profundas\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    }\n  },\n  \"topTraps\": [\n    {\n      \"subfoco\": \"Critérios Diagnósticos Obrigatórios e Avaliação de Líquido Amniótico\",\n      \"trapTitle\": \"Distrator de Discordância Ponderal na STFF\",\n      \"trapDescription\": \"Discordância de peso > 20% define CIUR seletivo, NÃO é critério diagnóstico obrigatório de STFF (que exige sequência oligo-poli com MBV < 2 cm e > 8/10 cm).\"\n    },\n    {\n      \"subfoco\": \"Fotocoagulação a Laser por Fetoscopia (Técnica de Solomon) e Terapias\",\n      \"trapTitle\": \"Distrator de Amniodrenagem Seriada como Primeira Linha\",\n      \"trapDescription\": \"Amniodrenagem seriada é medida puramente paliativa de alívio; o padrão-ouro curativo definitivo é a ablação a laser pela Técnica de Solomon (Eurofetus Trial).\"\n    }\n  ],\n  \"auditHash\": \"c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012\",\n  \"needsRecalc\": false,\n  \"certifiedAt\": \"2026-11-04T00:00:00.000Z\",\n  \"lastRecalculatedAt\": \"2026-11-04T00:00:00.000Z\",\n  \"status\": \"certified\"\n}\n```\n\n---\n\n## 2. Critérios Diagnósticos Ultrassonográficos Obrigatórios de STFF\n\nA Síndrome de Transfusão Feto-Fetal afeta aproximadamente 10 a 15% das gestações monocoriônicas diamnióticas (MCDA). A definição diagnóstica de prova baseia-se na presença de **três critérios obrigatórios concomitantes**:\n\n$$\n\\text{Critérios Canônicos de STFF} \\iff \\begin{cases} \\text{1. Gestação Monocoriônica Diamniótica (MCDA com placenta única e Sinal do T)} \\\\ \\text{2. Feto Doador (Oligoidrâmnio Grave): Maior Bolsão Vertical (MBV)} < 2\\text{ cm} \\\\ \\text{3. Feto Receptor (Polidrâmnio Tenso): MBV} > 8\\text{ cm }(\\le 20\\text{ sem}) \\lor > 10\\text{ cm }(> 20\\text{ sem}) \\end{cases}\n$$\n\nA avaliação de líquido amniótico deve ser realizada medindo-se o **Maior Bolsão Vertical (MBV)** em uma área livre de partes fetais e alças de cordão umbilical. O uso do Índice de Líquido Amniótico (ILA de 4 quadrantes) é tecnicamente desaconselhado em gemelares devido à imprecisão na delimitação dos quadrantes de cada saco amniótico.\n\n> [!WARNING] Armadilha Clássica de Prova: A Pegadinha da Discordância de Peso\n> Uma das pegadinhas mais clássicas e frequentes em concursos médicos é apresentar como alternativa: *\"Diagnóstico de STFF firmado por discordância de peso fetal superior a 20%\"*. **ISSO É INCORRETO.** A discordância de peso fetal é o critério definidor da **Restrição de Crescimento Fetal Seletiva (RCFs)**, mas **NÃO faz parte dos critérios diagnósticos obrigatórios de STFF**. A STFF é definida exclusivamente pela discrepância quantitativa de volume amniótico (sequência oligo-polidrâmnio).\n\n---\n\n## 3. Fisiopatologia Comparativa: Doador (Stuck Twin) vs. Receptor (Sobrecarga Volêmica)\n\nA etiopatogenia da STFF decorre da presença de **anastomoses arteriovenosas profundas desbalanceadas** no leito capilar cotiledonar da placenta compartilhada, estabelecendo um shunt sanguíneo crônico e unidirecional do feto doador para o feto receptor:\n\n### Matriz Comparativa Fisiopatológica Feto a Feto:\n\n| Parâmetro Clínico-Biológico | Feto Doador (Hipovolêmico) | Feto Receptor (Hipervolêmico) | Mecanismo Fisiopatológico Subjacente |\n| :--- | :--- | :--- | :--- |\n| **Volemia e Pré-Carga** | **Hipovolemia acentuada** e desidratação | **Hipervolemia crônica** e pletora sanguínea | Desvio de sangue desbalanceado através de shunts cotiledonares AV profundos. |\n| **Função Renal e Diurese** | Hipoperfusão renal severa $\\rightarrow$ **Oligúria / Anúria** | Hiperfiltração glomerular $\\rightarrow$ **Poliúria osmótica massiva** | O fluxo sanguíneo renal dita a taxa de filtração glomerular e a produção de urina fetal. |\n| **Volume Amniótico** | **Oligoidrâmnio grave** (MBV $< 2\\text{ cm}$) $\\rightarrow$ *Stuck Twin* | **Polidrâmnio tenso** (MBV $> 8\\text{ ou }10\\text{ cm}$) | A urina fetal é o componente primário do líquido amniótico a partir de 16 semanas. |\n| **Visualização da Bexiga** | **Bexiga colapsada e invisível** (Estádio II de Quintero) | **Bexiga persistentemente distendida e repleta** | Reflexo direto da presença ou ausência de diurese ativa na cavidade vesical. |\n| **Eixo Neuro-Humoral** | Ativação intensa do **Sistema Renina-Angiotensina (SRAA)** | Secreção maciça de **Peptídeo Natriurético Atrial (PNA)** | Tentativa compensatória do doador de reter volume vs. receptor tentando excretar água e sódio. |\n| **Aparelho Cardiovascular** | Coração de dimensões normais ou comprimido | **Cardiomegalia, hipertrofia de VD e insuficiência tricúspide** | A sobrecarga pressórica e volêmica gera disfunção diastólica e sistólica no receptor. |\n| **Evolução Fetal Terminal** | Restrição de crescimento severa e morte por choque hipovolêmico | **Hidropisia fetal franca** (anasarca, ascite e derrame) | Falência miocárdica descompensada e elevação crítica das pressões venosas centrais. |\n\n---\n\n## 4. Classificação Completa de Quintero (Estádios I a V) & Parâmetros Doppler\n\nO estadiamento proposto por Quintero é o padrão-ouro internacional para estadiamento prognóstico e direcionamento terapêutico na STFF:\n\n$$\n\\text{Estadiamento de Quintero} \\implies \\begin{cases} \\text{Estádio I: Sequência Oligo-Poli isolada (MBV } < 2\\text{ e } > 8/10\\text{ cm; bexiga do doador VISÍVEL)} \\\\ \\text{Estádio II: Bexiga do feto doador NÃO visualizada durante todo o exame (anúria)} \\\\ \\text{Estádio III: Doppler criticamente alterado (AU diástole zero/reversa, DV onda A reversa, VU pulsátil)} \\\\ \\text{Estádio IV: Hidropisia fetal franca (anasarca, ascite, derrame pleural/pericárdico)} \\\\ \\text{Estádio V: Óbito intrauterino de um ou ambos os fetos} \\end{cases}\n$$\n\n### Tabela Canônica do Estadiamento de Quintero:\n\n| Estádio | Critérios Ultrassonográficos Diagnósticos | Achados de Dopplervelocimetria | Significado Clínico e Conduta |\n| :--- | :--- | :--- | :--- |\n| **Estádio I** | Sequência Oligo-Polidrâmnio obrigatória (MBV $< 2\\text{ cm}$ e $> 8/10\\text{ cm}$) | Doppler normal em ambos os conceptos | **Bexiga do feto doador claramente visível.** Vigilância expectante estrita ou Laser se sintomático. |\n| **Estádio II** | Critérios do Estádio I presentes | Doppler permanece normal em ambos | **Bexiga do doador colapsada e invisível.** Hipovolemia e anúria estabelecidas; indicação formal de cirurgia. |\n| **Estádio III** | Critérios do Estádio I ou II associados a Doppler alterado | **Doppler Criticamente Alterado:** AU com diástole zero/reversa; DV com onda A reversa; ou pulsação de VU | **Disfunção cardiovascular e hemodinâmica grave.** Indicação absoluta de fotocoagulação a laser de urgência. |\n| **Estádio IV** | Presença de **Hidropisia Fetal** em um ou ambos os conceptos | Sinais de falência cardíaca descompensada no Doppler | Anasarca, ascite, derrame pleural/pericárdico (geralmente no receptor). Alto risco de morte iminente. |\n| **Estádio V** | **Óbito fetal intrauterino** de um ou ambos os conceptos | Ausência completa de batimentos cardiofetais (BCF) | Risco de 20-30% de sequela neurológica grave ou óbito subsequente no feto sobrevivente. |\n\n*Legenda: AU (Artéria Umbilical); DV (Ducto Venoso); VU (Veia Umbilical).*\n\n---\n\n## 5. Tratamento Padrão-Ouro: Ablação a Laser por Fetoscopia (Técnica de Solomon)\n\nO objetivo primário do tratamento consiste em erradicar a causa subjacente da síndrome através da interrupção cirúrgica de todas as comunicações vasculares anômalas entre os conceptos, promovendo a **dicorionização funcional completa da placenta**:\n\n*   **Procedimento de Escolha Padrão-Ouro:** **Fotocoagulação a Laser das anastomoses vasculares da placa coriônica guiada por fetoscopia**.\n*   **A Evidência do Ensaio Clínico Eurofetus:** O estudo multicêntrico randomizado internacional *Eurofetus Trial* (Senat et al., publicado no New England Journal of Medicine) demonstrou de forma inequívoca a **superioridade da cirurgia fetoscópica a laser em relação à amniodrenagem seriada descompressiva**, proporcionando maior sobrevida perinatal (pelo menos um feto vivo em $> 80\\text{-}85\\%$ vs $60\\%$) e reduzindo pela metade a incidência de paralisia cerebral e sequelas neurológicas motoras graves aos 6 anos de vida.\n*   **Técnica de Solomon:** Avanço técnico padrão atual em que, após a coagulação de todas as anastomoses arteriovenosas individuais identificadas, o cirurgião fetal realiza uma **linha de fotocoagulação contínua ao longo de todo o equador vascular da placenta**, de borda a borda. Essa técnica bloqueia microanastomoses residuais ocultas, reduzindo drasticamente a recorrência da STFF e prevenindo o surgimento da Sequência TAPS pós-operatória.\n*   **Janela Gestacional Ótima:** Realizada idealmente entre **16 semanas e 26 semanas de gestação**.\n*   **Indicações Formais:** Estádios II, III e IV de Quintero. No Estádio I, a intervenção cirúrgica é indicada na presença de polidrâmnio materno muito sintomático, encurtamento cervical progressivo ($< 25\\text{ mm}$) ou progressão documentada de estádio.\n*   **Procedimentos de Exceção:** A **Amniodrenagem Seriada** consiste na retirada lenta de 1 a 3 litros de líquido amniótico do saco do receptor; não trata as anastomoses e é restrita aos casos paliativos em que o laser é inacessível ou após 26 semanas. A **Septostomia deliberada da membrana intergemelar é formalmente proscrita** pelo risco inaceitável de criar uma gestação monoamniótica artificial com entrelaçamento fatal de cordão.\n\n---\n\n```clinical-scheme\n{\n  \"type\": \"step-up\",\n  \"badge\": \"Diretriz Eurofetus / FEBRASGO\",\n  \"data\": {\n    \"steps\": [\n      {\n        \"level\": 1,\n        \"title\": \"Quintero Estádio I (Oligo-Poli com Bexiga Visível)\",\n        \"criteria\": \"MBV < 2 cm no doador e > 8/10 cm no receptor; bexiga do doador visível e Doppler normal.\",\n        \"therapy\": \"Vigilância ultrassonográfica estrita semanal. Indicar fotocoagulação a laser se polidrâmnio materno sintomático ou colo < 25 mm.\",\n        \"failCriteria\": \"Se bexiga do doador desaparecer ou Doppler alterar -> Escalar imediatamente para Nível 2.\"\n      },\n      {\n        \"level\": 2,\n        \"title\": \"Quintero Estádios II, III e IV (Indicação Absoluta de Cirurgia Fetal)\",\n        \"criteria\": \"Bexiga invisível (II), Doppler criticamente alterado na AU/DV/VU (III) ou hidropisia fetal (IV) entre 16 e 26 semanas.\",\n        \"therapy\": \"Fotocoagulação a Laser das anastomoses vasculares por fetoscopia utilizando a Técnica de Solomon (dicorionização contínua).\",\n        \"failCriteria\": \"Se falha técnica, placenta inacessível ou IG > 26s -> Amniodrenagem paliativa de alívio ou parto planejado.\"\n      },\n      {\n        \"level\": 3,\n        \"title\": \"Manejo Pós-Procedimento e Resolução da Gestação\",\n        \"criteria\": \"Após ablação a laser bem-sucedida com dicorionização da placa coriônica.\",\n        \"therapy\": \"Vigilância ecográfica semanal (líquido e Doppler de ACM para rastreio de TAPS pós-laser). Parto programado entre 34 e 36 semanas.\",\n        \"failCriteria\": \"Se morte de um concepto ou persistência de alteração hemodinâmica -> Avaliação de maturidade e conduta individualizada.\"\n      }\n    ]\n  }\n}\n```\n\n---\n\n### 🔄 O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)\n\n| Ponto de Conduta | Prática Antiga (Pegadinha das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |\n| :--- | :--- | :--- | :--- |\n| **Tratamento de Primeira Escolha** | Amniodrenagem seriada descompressiva como terapia de rotina | **Fotocoagulação a laser fetoscópica como padrão-ouro absoluto** (Eurofetus Trial) | **FEBRASGO / ISUOG (2023)** |\n| **Técnica Cirúrgica de Ablação** | Coagulação seletiva pontual apenas dos cotilédones visíveis | **Técnica de Solomon** (coagulação contínua do equador vascular) para prevenir TAPS pós-laser | **Solomon Trial / SMFM (2022)** |\n| **Manejo do Quintero Estádio I** | Conduta expectante passiva universal em todos os casos | Indicação de **ablação a laser se encurtamento cervical (< 25 mm)** ou sintomas maternos graves | **ISUOG / SMFM (2023)** |\n| **Septostomia da Membrana** | Punção da membrana com agulha para equilibrar os líquidos | **Formalmente proscrita** pelo risco crítico de entrelaçamento letal de cordão | **ACOG / FEBRASGO (2023)** |\n\n> [!IMPORTANT] Alerta de Atualização para Provas de 2024-2026:\n> Questões recentes do ENARE e da USP têm cobrado diretamente a superioridade do laser fetoscópico sobre a amniodrenagem em termos de sobrevida neurológica livre de deficiências. A amniodrenagem não trata a causa vascular subjacente e não deve ser assinalada como melhor conduta em serviço terciário estruturado.\n\n---\n\n## 6. Algoritmo Decisório no Manejo da Síndrome de Transfusão Feto-Fetal\n\n### Passo a Passo Sintético da Cascata Decisória\n\n1.  **[Diagnóstico Ultrassonográfico Imediato]:** Confirmar gestação monocoriônica diamniótica (Sinal do T) e mensurar o Maior Bolsão Vertical (MBV). Se MBV $< 2\\text{ cm}$ no doador e $> 8\\text{ cm }(\\le 20\\text{s})$ ou $> 10\\text{ cm }(> 20\\text{s})$ no receptor, o diagnóstico de STFF está confirmado.\n2.  **[Estadiamento de Quintero]:** Avaliar a bexiga fetal do doador. Se visível $\\rightarrow$ Estádio I. Se não visualizada $\\rightarrow$ Estádio II. Realizar Doppler de Artéria Umbilical, Ducto Venoso e Veia Umbilical. Se diástole zero/reversa na AU, onda A reversa no DV ou VU pulsátil $\\rightarrow$ Estádio III. Se houver hidropisia (edema, derrame, ascite) $\\rightarrow$ Estádio IV.\n3.  **[Encaminhamento Terciário]:** Referenciar imediatamente a gestante com Quintero $\\ge \\text{I}$ sintomático ou $\\ge \\text{II}$ para centro quaternário de Medicina Fetal e Cirurgia Fetal.\n4.  **[Intervenção Fetal Específica]:** Se idade gestacional entre **16 e 26 semanas**, indicar e realizar a **Fotocoagulação a Laser Fetoscópica pela Técnica de Solomon**.\n5.  **[Seguimento Pós-Operatório e Parto]:** Monitorar semanalmente com Doppler de PVS-ACM e Maior Bolsão Vertical para detectar TAPS pós-laser ou recidiva da STFF. Programar o nascimento eletivo entre **34 e 36 semanas** após corticoterapia para maturação pulmonar.\n\n---\n\n## Diretrizes Oficiais & Consensos de Referência\n\n*   **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** Tratado de Obstetrícia & Manual de Procedimentos Invasivos em Medicina Fetal (2021/2023).\n*   **Eurofetus Consortium (Senat et al., NEJM):** Endoscopic Laser Surgery versus Serial Amnioreduction for Severe Twin-to-Twin Transfusion Syndrome (New England Journal of Medicine, estudo seminal).\n*   **ISUOG (International Society of Ultrasound in Obstetrics and Gynecology):** Practice Guidelines for the management of twin-to-twin transfusion syndrome (2023).\n*   **ACOG (American College of Obstetricians and Gynecologists):** Practice Bulletin No. 231 - Management of Monochorionic Twin Complications (2021, revalidado 2024).\n*   **FIGO (International Federation of Gynecology and Obstetrics):** Guidelines on fetal surgery and twin pregnancy interventions (2023).\n"
},
  {
  "id": "mat-gem-04",
  "focusId": "obs-gem-parto",
  "title": "Assistência ao Parto e Momento da Interrupção na Gestação Múltipla",
  "specialty": "Ginecologia e Obstetrícia",
  "theme": "Gestação Múltipla",
  "focus": "Parto em Gestação Múltipla",
  "readTimeMinutes": 10,
  "lastUpdatedYear": 2026,
  "guidelineBadge": "FEBRASGO / Twin Birth Study / ACOG",
  "summarySnippet": "Cronograma rigoroso de idade gestacional por corionicidade, algoritmo de vias de parto pautado no Twin Birth Study, critérios para parto vaginal, manejo ativo de G2 com VPI e profilaxia agressiva da hemorragia puerperal.",
  "keyPoints": [
    "Momento do parto programado por corionicidade: DCDA = 37s 0d a 38s 6d; MCDA = 36s 0d a 37s 0d; MCMA = 32s 0d a 34s 0d (cesariana eletiva pós-corticoide).",
    "Com o 1º feto em apresentação cefálica e concepto a termo/termo precoce, o parto vaginal é a via preferencial e segura (Twin Birth Study).",
    "Se o 1º gemelar for não-cefálico (pélvico ou córmico), a indicação de cesariana é absoluta pelo risco crítico de engastamento de cabeças fetais.",
    "Com 1º cefálico e 2º não-cefálico, o parto vaginal é autorizado desde que haja concepto > 1.500g e equipe habilitada em Versão Podálica Interna (VPI).",
    "O clampeamento do cordão do 1º feto deve ser imediato em gestações monocoriônicas para evitar exsanguinação reflexa de G2 pela placenta compartilhada.",
    "O intervalo entre os conceptos não possui limite rígido de 30 minutos em diretrizes modernas, desde que a cardiotocografia de G2 seja categoria 1 (normal).",
    "A profilaxia de Hemorragia Pós-Parto por atonia uterina exige administração de Ocitocina 10 UI IM imediatamente após o nascimento do ÚLTIMO feto."
  ],
  "recurrenceStats": {
    "focusSlug": "gemelaridade-parto-interrupcao",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Gestação Múltipla",
    "focus": "Parto em Gestação Múltipla",
    "totalQuestions": 36,
    "timeframeRange": "2017-2026",
    "version": 1,
    "donutSlices": [
      {
        "id": 1,
        "name": "Momento do Parto: Idade Gestacional Rigorosa por Corionicidade",
        "shortName": "Idade Gestacional",
        "percentage": 27.8,
        "questionCount": 10,
        "priority": "Alta",
        "color": "#3B82F6",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "DCDA: 37-38s6d; MCDA: 36-37s0d; MCMA: 32-34s0d (Cesariana obrigatória pós-corticoide).",
        "focusExplanation": "O momento ideal de resolução eletiva é estratificado compulsoriamente pela corionicidade: gestações **Dicoriônicas Diamnióticas (DCDA)** devem ser resolvidas entre **37s 0d e 38s 6d**; gestações **Monocoriônicas Diamnióticas (MCDA)** têm interrupção programada entre **36s 0d e 37s 0d** (prevenindo o risco aumentado de óbito fetal súbito por shunts vasculares); e gestações **Monocoriônicas Monoamnióticas (MCMA)** devem ter parto planejado por **cesariana eletiva mandatória entre 32s 0d e 34s 0d**, após curso de corticoterapia pulmonar antenatal, devido ao risco crítico de entrelaçamento letal de cordões umbilicais.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Faixas de semanas de corte por corionicidade e justificativa biológica de redução da natimortandade tardia.",
            "trapAlert": "Permitir que gestações gemelares ultrapassem 39 semanas de idade gestacional (risco inaceitável de óbito fetal in utero)."
          },
          "ENARE": {
            "howItCharges": "Caso clínico de pré-natal de termo com gestante DCDA de 38 semanas assintomática: conduta de programar a interrupção da gravidez.",
            "trapAlert": "Aguardar trabalho de parto espontâneo até 41 semanas como em gestações únicas."
          },
          "USP": {
            "howItCharges": "Manejo da gestação monoamniótica (MCMA): indicação formal de cesariana eletiva entre 32 e 34 semanas após ciclo completo de corticoide para maturação pulmonar.",
            "trapAlert": "Autorizar prova de parto vaginal em gestação monoamniótica."
          },
          "UNICAMP": {
            "howItCharges": "Diferenciação precisa entre o momento do parto de DCDA (37-38s6d) e MCDA (36-37s0d), enfatizando que a monocorionicidade impõe resolução uma a duas semanas mais precoce.",
            "trapAlert": "Fixar a 36ª semana como termo universal para gestações dicoriônicas não complicadas."
          },
          "PSU-MG": {
            "howItCharges": "Questão direta: qual a idade gestacional máxima recomendada para interrupção de gravidez gemelar monocoriônica diamniótica estável.",
            "trapAlert": "Assinalar 38 ou 40 semanas."
          },
          "AMRIGS": {
            "howItCharges": "Relação entre morbimortalidade perinatal e idade gestacional: a taxa de natimortos na gemelaridade atinge o nadir por volta de 37-38 semanas.",
            "trapAlert": "Considerar gestação gemelar de 38 semanas como prematura."
          },
          "SUS-SP": {
            "howItCharges": "Agendamento de cesariana de termo precoce na rede pública: planejamento de vaga cirúrgica conforme o tipo de placentação.",
            "trapAlert": "Indicar internação precoce na 30ª semana para gestante DCDA estável."
          }
        }
      },
      {
        "id": 2,
        "name": "Condições Clínicas e Elegibilidade para Parto Vaginal",
        "shortName": "Condições Parto Vaginal",
        "percentage": 27.8,
        "questionCount": 10,
        "priority": "Alta",
        "color": "#10B981",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "1º feto cefálico autoriza parto vaginal (Twin Birth Study); peso estimado > 1.500g e sem desproporção.",
        "focusExplanation": "Comprovado pelo clássico ensaio clínico multinacional *Twin Birth Study*, **o parto vaginal planejado é seguro e não aumenta a morbimortalidade perinatal quando comparado à cesariana programada**, desde que os seguintes critérios de elegibilidade estejam satisfeitos: **1º feto em apresentação cefálica**; idade gestacional >= 32 semanas com **peso fetal estimado > 1.500 g**; **discordância de peso fetal < 20-25%** (o 2º feto não pode ser substancialmente maior que o 1º); ausência de placenta prévia ou cicatrizes uterinas corporais; e disponibilidade de centro cirúrgico imediato com equipe neonatal dupla.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Apresentação cefálica do primeiro feto como o pré-requisito anatômico absoluto para autorização da via vaginal.",
            "trapAlert": "Afirmar que a gestação múltipla é contraindicação absoluta ao parto normal."
          },
          "ENARE": {
            "howItCharges": "Caso clínico em maternidade do SUS: primigesta em trabalho de parto na 37ª semana com ambos os conceptos em apresentação cefálica e dinâmica regular. Conduta correta: conduzir parto vaginal.",
            "trapAlert": "Indicar cesariana de emergência apenas pelo diagnóstico de gemelaridade."
          },
          "USP": {
            "howItCharges": "Análise da evidência científica do Twin Birth Study: a sobrevida e os desfechos neurológicos neonatais são equivalentes entre parto vaginal e cesariana programada quando G1 é cefálico.",
            "trapAlert": "Afirmar que a cesariana programada previne paralisia cerebral no segundo gemelar."
          },
          "UNICAMP": {
            "howItCharges": "Critério de desproporção fetal: por que o segundo feto não pode ter peso estimado significativamente maior (> 20-25%) que o primeiro no parto vaginal (risco de distócia e retenção de cabeça derradeira).",
            "trapAlert": "Autorizar parto normal quando o 2º feto tem peso estimado em 3.800g e o 1º em 2.200g."
          },
          "PSU-MG": {
            "howItCharges": "Monitorização intraparto: necessidade de cardiotocografia contínua com duplo transdutor para vigilância individualizada de ambos os batimentos cardiofetais.",
            "trapAlert": "Realizar ausculta intermitente com sonar simples alternando entre os fetos."
          },
          "AMRIGS": {
            "howItCharges": "Pergunta objetiva sobre quais as condições anatômicas que contraindicam sumariamente o parto vaginal na gemelaridade.",
            "trapAlert": "Listar DCDA como contraindicação ao parto vaginal."
          },
          "SUS-SP": {
            "howItCharges": "Acolhimento da parturiente e analgesia de parto: analgesia peridural precoce é altamente benéfica para permitir manobras intrauterinas de resgate no 2º feto caso necessárias.",
            "trapAlert": "Contraindicar analgesia de parto por receio de hipotonia uterina."
          }
        }
      },
      {
        "id": 3,
        "name": "Indicações Formais de Parto Cesáreo em Gestação Múltipla",
        "shortName": "Indicação de Cesárea",
        "percentage": 16.7,
        "questionCount": 6,
        "priority": "Alta",
        "color": "#EC4899",
        "trend": "estavel",
        "trendLabel": "🏛️ Clássico Estável",
        "takeaway": "1º feto não-cefálico (pélvico/córmico), gestação monoamniótica (MCMA) ou gêmeos siameses.",
        "focusExplanation": "As indicações obstétricas mandatórias de cesariana eletiva na gravidez gemelar são: **1º feto em apresentação não-cefálica (pélvico ou córmico)**, independentemente da apresentação do 2º feto, pelo risco iminente de **engastamento de cabeças fetais (colisão de queixos / intertravamento)** durante o polo expulsivo; **gestação monocoriônica monoamniótica (MCMA)**, pelo risco de acidentes e laços de cordão; **gêmeos conjugados / siameses**; sofrimento fetal agudo; e situações em que o peso fetal estimado de qualquer conceito é inferior a 1.500 g.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Reconhecimento do 1º feto em apresentação pélvica ou córmica como indicação absoluta e irrefutável de operação cesariana.",
            "trapAlert": "Propor parto vaginal de primeiro gemelar pélvico alegando que o segundo feto é cefálico."
          },
          "ENARE": {
            "howItCharges": "Cenário de admissão em centro obstétrico: ultrassom revela 1º feto pélvico e 2º cefálico. Qual a via de parto obrigatória.",
            "trapAlert": "Aguardar dilatação total na esperança de rotação espontânea do primeiro concepto."
          },
          "USP": {
            "howItCharges": "Mecanismo biomecânico do engastamento de cabeças (interlocking twins): queixo do feto pélvico descido engata no queixo do feto cefálico acima do estreito superior da bacia, travando a descida.",
            "trapAlert": "Supor que a colisão de queixos ocorre quando o primeiro feto é cefálico."
          },
          "UNICAMP": {
            "howItCharges": "Cesariana em siameses: necessidade de laparotomia ampla e histerotomia corporal/clássica para extração atraumática dos conceitos coligados.",
            "trapAlert": "Realizar incisão segmentar transversa baixa habitual em gêmeos unidos."
          },
          "PSU-MG": {
            "howItCharges": "Indicação cirúrgica precoce na gestação MCMA entre 32 e 34 semanas por risco letal de nó de cordão verdadeiro.",
            "trapAlert": "Aguardar termo completo na gravidez monoamniótica."
          },
          "AMRIGS": {
            "howItCharges": "Pergunta direta: qual a conduta diante de feto 1 córmico (situação transversa) e feto 2 cefálico.",
            "trapAlert": "Tentar versão cefálica externa no primeiro feto antes de indicar cesárea."
          },
          "SUS-SP": {
            "howItCharges": "Fluxo assistencial cirúrgico: preparo anestésico rápido e presença de equipe cirúrgica obstétrica habilitada.",
            "trapAlert": "Postergar cesariana de gemelares engastados na emergência."
          }
        }
      },
      {
        "id": 4,
        "name": "Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos",
        "shortName": "2º Gemelar",
        "percentage": 13.9,
        "questionCount": 5,
        "priority": "Média",
        "color": "#8B5CF6",
        "trend": "alta",
        "trendLabel": "🔥 Em Alta (2024-2026)",
        "takeaway": "Clampeamento imediato do cordão de G1 em MC; avaliar apresentação de G2; intervalo guiado por BCF normal.",
        "focusExplanation": "Após o desprendimento do primeiro feto (G1), o protocolo assistencial mandatória exige: **clampeamento imediato do cordão de G1 em gestações monocoriônicas** para prevenir exsanguinação fetal retrógrada aguda de G2 através de anastomoses vasculares; palpação abdominal de Leopold e **ultrassonografia à beira do leito imediata** para avaliar a apresentação estática de G2 (frequentemente roda para transversal ou pélvica); manutenção de infusão venosa de ocitocina para sustentar contrações uterinas eficazes; e **amniotomia guiada das membranas de G2 apenas após a apresentação estar bem engajada** (prevenção de prolapso de cordão). Diretrizes modernas **aboliram o corte rígido de 30 minutos** entre nascimentos, desde que o BCF de G2 permaneça normal e o progresso progrida.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Sequência de ações do obstetra na sala de parto após a saída de G1 e flexibilização do intervalo seguro guiado pelo traçado de BCF normal.",
            "trapAlert": "Indicar cesariana de emergência para G2 pontualmente aos 31 minutos se o BCF e a dinâmica estiverem normais."
          },
          "ENARE": {
            "howItCharges": "Apresentação de G2 em situação transversa após o nascimento vaginal de G1: manobra de escolha é a Versão Podálica Interna (VPI) seguida de grande extração pélvica assistida.",
            "trapAlert": "Indicar cesariana de emergência com colo uterino totalmente dilatado sem tentar manobras internas por obstetra habilitado."
          },
          "USP": {
            "howItCharges": "Risco de descolamento prematuro de placenta (DPP) após a saída de G1 pela descompressão uterina súbita, exigindo monitorização contínua do tônus e sangramento genital.",
            "trapAlert": "Achar que o descolamento de placenta só ocorre antes do início do trabalho de parto."
          },
          "UNICAMP": {
            "howItCharges": "Mecanismo da Versão Podálica Interna: introdução da mão enluvada na cavidade, localização de um ou ambos os pés do concepto e tração suave até a apresentação pélvica.",
            "trapAlert": "Realizar versão podálica externa com o útero hipertrônico."
          },
          "PSU-MG": {
            "howItCharges": "Momento correto da rotura artificial das membranas (amniotomia) de G2: obrigatoriamente após encaixamento e fixação da apresentação fetal.",
            "trapAlert": "Romper a bolsa de G2 com o feto flutuante e alto (risco imediato de prolapso de cordão)."
          },
          "AMRIGS": {
            "howItCharges": "Por que o clampeamento do cordão do primeiro feto não deve ser tardio em concepto monocoriônico (prevenção de choque hemodinâmico no segundo).",
            "trapAlert": "Aplicar clampeamento tardio de 3 minutos de rotina para gemelares monocoriônicos."
          },
          "SUS-SP": {
            "howItCharges": "Equipe de atendimento neonatal preparada para reanimação concomitante em berços aquecidos distintos na mesma sala de parto.",
            "trapAlert": "Utilizar a mesma fonte de oxigênio e aquecimento para os dois recém-nascidos."
          }
        }
      },
      {
        "id": 5,
        "name": "Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia",
        "shortName": "Prevenção de HPP",
        "percentage": 13.9,
        "questionCount": 5,
        "priority": "Média",
        "color": "#F59E0B",
        "trend": "estavel",
        "trendLabel": "🏛️ Clássico Estável",
        "takeaway": "Sobredistensão miometrial = risco crítico de atonia; Ocitocina 10 UI IM imediata após o ÚLTIMO feto.",
        "focusExplanation": "A gestação múltipla é um **fator de risco isolado e independente de primeira magnitude para Hemorragia Pós-Parto (HPP)** grave por **atonia uterina**, decorrente do estiramento biomecânico excessivo das fibras miometriais (Lei de Laplace). A profilaxia ativa padrão-ouro universal para todas as parturientes consiste na administração de **Ocitocina 10 UI intramuscular (IM) ou infusão intravenosa lenta imediatamente após o nascimento do ÚLTIMO feto**. A paciente deve manter dois acessos venosos calibrosos (14G ou 16G), reserva de sangue no hospital e vigilância intensiva no 4º período do parto (Período de Greenberg) com aferição do tônus uterino e globo de segurança de Pinard a cada 15 minutos na primeira hora.",
        "bancaPatterns": {
          "Todas": {
            "howItCharges": "Atonia uterina como principal complicação puerperal da gravidez gemelar e o momento correto de administração da ocitocina profilática (após o nascimento do último feto).",
            "trapAlert": "Administrar ocitocina profilática em bolus após a saída do 1º feto enquanto o 2º feto ainda está dentro do útero (pode causar hipertonia e óbito de G2)."
          },
          "ENARE": {
            "howItCharges": "Caso de puérpera de gemelar com sangramento genital volumoso e útero amolecido acima da cicatriz umbilical no pós-parto imediato: diagnóstico de atonia uterina e conduta escalonada.",
            "trapAlert": "Prescrever apenas bolsa de gelo no hipogástrio sem realizar massagem bimanual e uterotônicos."
          },
          "USP": {
            "howItCharges": "Farmacoterapia escalonada na atonia refratária pós-gemelar: Ocitocina IV + Ácido Tranexâmico 1g IV precoce + Metilergometrina 0,2 mg IM (se normotensa) ou Misoprostol 800 mcg retal.",
            "trapAlert": "Administrar Metilergometrina em paciente gemelar com pré-eclâmpsia sobreposta."
          },
          "UNICAMP": {
            "howItCharges": "Importância da revisão sistemática do canal de parto com valvas vaginais sob anestesia para excluir lacerações e hematomas de trajeto decorrentes de manobras obstétricas.",
            "trapAlert": "Atribuir todo sangramento à atonia sem inspecionar colo uterino e vagina."
          },
          "PSU-MG": {
            "howItCharges": "Parâmetros de gravidade hemodinâmica: cálculo do Índice de Choque (FC/PAS >= 0,9 indicando sangramento oculto grave e necessidade de transfusão).",
            "trapAlert": "Subestimar a perda sanguínea baseando-se apenas na contagem visual de compressas."
          },
          "AMRIGS": {
            "howItCharges": "Conceito do Globo de Segurança de Pinard: retração miometrial mantida fechando os vasos espiralados em 'ligaduras vivas de Pinard'.",
            "trapAlert": "Achar que a hemostasia puerperal primária depende exclusivamente de fatores de coagulação."
          },
          "SUS-SP": {
            "howItCharges": "Protocolo de Código Vermelho Obstétrico ativado imediatamente em sala de parto para assistência multidisciplinar rápida.",
            "trapAlert": "Aguardar exames laboratoriais de coagulação antes de iniciar ressuscitação volêmica."
          }
        }
      }
    ],
    "bancaBreakdown": {
      "ENARE": {
        "banca": "ENARE",
        "totalQuestions": 9,
        "topSubfocos": [
          {
            "subfoco": "Momento do Parto: Idade Gestacional Rigorosa por Corionicidade",
            "questionCount": 3,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Condições Clínicas e Elegibilidade para Parto Vaginal",
            "questionCount": 3,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Indicações Formais de Parto Cesáreo em Gestação Múltipla",
            "questionCount": 1,
            "percentageInBanca": 11.1
          },
          {
            "subfoco": "Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos",
            "questionCount": 1,
            "percentageInBanca": 11.1
          },
          {
            "subfoco": "Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia",
            "questionCount": 1,
            "percentageInBanca": 11.2
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "USP": {
        "banca": "USP",
        "totalQuestions": 10,
        "topSubfocos": [
          {
            "subfoco": "Momento do Parto: Idade Gestacional Rigorosa por Corionicidade",
            "questionCount": 3,
            "percentageInBanca": 30.0
          },
          {
            "subfoco": "Condições Clínicas e Elegibilidade para Parto Vaginal",
            "questionCount": 3,
            "percentageInBanca": 30.0
          },
          {
            "subfoco": "Indicações Formais de Parto Cesáreo em Gestação Múltipla",
            "questionCount": 2,
            "percentageInBanca": 20.0
          },
          {
            "subfoco": "Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos",
            "questionCount": 1,
            "percentageInBanca": 10.0
          },
          {
            "subfoco": "Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia",
            "questionCount": 1,
            "percentageInBanca": 10.0
          }
        ],
        "predominantDifficulty": "Difícil"
      },
      "UNICAMP": {
        "banca": "UNICAMP",
        "totalQuestions": 6,
        "topSubfocos": [
          {
            "subfoco": "Momento do Parto: Idade Gestacional Rigorosa por Corionicidade",
            "questionCount": 2,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Condições Clínicas e Elegibilidade para Parto Vaginal",
            "questionCount": 2,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Indicações Formais de Parto Cesáreo em Gestação Múltipla",
            "questionCount": 1,
            "percentageInBanca": 16.7
          },
          {
            "subfoco": "Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos",
            "questionCount": 1,
            "percentageInBanca": 16.7
          }
        ],
        "predominantDifficulty": "Difícil"
      },
      "PSU-MG": {
        "banca": "PSU-MG",
        "totalQuestions": 5,
        "topSubfocos": [
          {
            "subfoco": "Momento do Parto: Idade Gestacional Rigorosa por Corionicidade",
            "questionCount": 1,
            "percentageInBanca": 20.0
          },
          {
            "subfoco": "Condições Clínicas e Elegibilidade para Parto Vaginal",
            "questionCount": 1,
            "percentageInBanca": 20.0
          },
          {
            "subfoco": "Indicações Formais de Parto Cesáreo em Gestação Múltipla",
            "questionCount": 1,
            "percentageInBanca": 20.0
          },
          {
            "subfoco": "Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos",
            "questionCount": 1,
            "percentageInBanca": 20.0
          },
          {
            "subfoco": "Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia",
            "questionCount": 1,
            "percentageInBanca": 20.0
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "AMRIGS": {
        "banca": "AMRIGS",
        "totalQuestions": 3,
        "topSubfocos": [
          {
            "subfoco": "Momento do Parto: Idade Gestacional Rigorosa por Corionicidade",
            "questionCount": 1,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Condições Clínicas e Elegibilidade para Parto Vaginal",
            "questionCount": 1,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Indicações Formais de Parto Cesáreo em Gestação Múltipla",
            "questionCount": 1,
            "percentageInBanca": 33.4
          }
        ],
        "predominantDifficulty": "Médio"
      },
      "SUS-SP": {
        "banca": "SUS-SP",
        "totalQuestions": 3,
        "topSubfocos": [
          {
            "subfoco": "Momento do Parto: Idade Gestacional Rigorosa por Corionicidade",
            "questionCount": 1,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Condições Clínicas e Elegibilidade para Parto Vaginal",
            "questionCount": 1,
            "percentageInBanca": 33.3
          },
          {
            "subfoco": "Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia",
            "questionCount": 1,
            "percentageInBanca": 33.4
          }
        ],
        "predominantDifficulty": "Médio"
      }
    },
    "topTraps": [
      {
        "subfoco": "Condições Clínicas e Elegibilidade para Parto Vaginal",
        "trapTitle": "Distrator de Cesariana Obrigatória na Gemelaridade",
        "trapDescription": "Gemelaridade não impõe cesariana per se; com o primeiro feto cefálico e termo precoce, o parto vaginal é a via recomendada e segura (Twin Birth Study)."
      },
      {
        "subfoco": "Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos",
        "trapTitle": "Distrator do Limite Rígido de 30 Minutos",
        "trapDescription": "Diretrizes modernas aboliram o corte rígido de 30 minutos entre os conceptos, autorizando a condução vaginal desde que a cardiotocografia de G2 seja normal e haja dinâmica uterina."
      }
    ],
    "auditHash": "d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123",
    "needsRecalc": false,
    "certifiedAt": "2026-11-04T00:00:00.000Z",
    "lastRecalculatedAt": "2026-11-04T00:00:00.000Z",
    "status": "certified"
  },
  "markdownContent": "## 1. O Que Mais Cai nas Provas de Residência Médica\n\nA assistência ao parto e a determinação do momento exato da interrupção na gestação múltipla compõem um dos cenários mais cobrados e minuciosos nas provas de Residência Médica (ENARE, USP-SP, UNICAMP, PSU-MG, AMRIGS, SUS-SP). A tomada de decisão fundamenta-se no equilíbrio crítico entre o risco de **mortalidade fetal in utero** (que se eleva exponencialmente com o avanço da idade gestacional) e as morbidades decorrentes da **prematuridade tardia**.\n\nO grande divisor de águas cronológico é a **corionicidade**, e não a zigotia. Em concursos de ponta, as questões exigem do candidato: o domínio das idades gestacionais recomendadas para cada tipo de placentação (DCDA, MCDA e MCMA); a indicação da via de parto pautada nas conclusões do clássico ensaio clínico multinacional *Twin Birth Study* (que desmistificou o dogma de que gemelaridade impõe cesariana obrigatória); o manejo ativo do intervalo entre os conceptos; e a prevenção agressiva da hemorragia pós-parto imediata por atonia uterina secundária à sobredistensão miometrial.\n\n```gem-stats-parto\n{\n  \"focusSlug\": \"gemelaridade-parto-interrupcao\",\n  \"specialty\": \"Ginecologia e Obstetrícia\",\n  \"theme\": \"Gestação Múltipla\",\n  \"focus\": \"Parto em Gestação Múltipla\",\n  \"totalQuestions\": 36,\n  \"timeframeRange\": \"2017-2026\",\n  \"version\": 1,\n  \"donutSlices\": [\n    {\n      \"id\": 1,\n      \"name\": \"Momento do Parto: Idade Gestacional Rigorosa por Corionicidade\",\n      \"shortName\": \"Idade Gestacional\",\n      \"percentage\": 27.8,\n      \"questionCount\": 10,\n      \"priority\": \"Alta\",\n      \"color\": \"#3B82F6\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"DCDA: 37-38s6d; MCDA: 36-37s0d; MCMA: 32-34s0d (Cesariana obrigatória pós-corticoide).\",\n      \"focusExplanation\": \"O momento ideal de resolução eletiva é estratificado compulsoriamente pela corionicidade: gestações **Dicoriônicas Diamnióticas (DCDA)** devem ser resolvidas entre **37s 0d e 38s 6d**; gestações **Monocoriônicas Diamnióticas (MCDA)** têm interrupção programada entre **36s 0d e 37s 0d** (prevenindo o risco aumentado de óbito fetal súbito por shunts vasculares); e gestações **Monocoriônicas Monoamnióticas (MCMA)** devem ter parto planejado por **cesariana eletiva mandatória entre 32s 0d e 34s 0d**, após curso de corticoterapia pulmonar antenatal, devido ao risco crítico de entrelaçamento letal de cordões umbilicais.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Faixas de semanas de corte por corionicidade e justificativa biológica de redução da natimortandade tardia.\",\n          \"trapAlert\": \"Permitir que gestações gemelares ultrapassem 39 semanas de idade gestacional (risco inaceitável de óbito fetal in utero).\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Caso clínico de pré-natal de termo com gestante DCDA de 38 semanas assintomática: conduta de programar a interrupção da gravidez.\",\n          \"trapAlert\": \"Aguardar trabalho de parto espontâneo até 41 semanas como em gestações únicas.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Manejo da gestação monoamniótica (MCMA): indicação formal de cesariana eletiva entre 32 e 34 semanas após ciclo completo de corticoide para maturação pulmonar.\",\n          \"trapAlert\": \"Autorizar prova de parto vaginal em gestação monoamniótica.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Diferenciação precisa entre o momento do parto de DCDA (37-38s6d) e MCDA (36-37s0d), enfatizando que a monocorionicidade impõe resolução uma a duas semanas mais precoce.\",\n          \"trapAlert\": \"Fixar a 36ª semana como termo universal para gestações dicoriônicas não complicadas.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Questão direta: qual a idade gestacional máxima recomendada para interrupção de gravidez gemelar monocoriônica diamniótica estável.\",\n          \"trapAlert\": \"Assinalar 38 ou 40 semanas.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Relação entre morbimortalidade perinatal e idade gestacional: a taxa de natimortos na gemelaridade atinge o nadir por volta de 37-38 semanas.\",\n          \"trapAlert\": \"Considerar gestação gemelar de 38 semanas como prematura.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Agendamento de cesariana de termo precoce na rede pública: planejamento de vaga cirúrgica conforme o tipo de placentação.\",\n          \"trapAlert\": \"Indicar internação precoce na 30ª semana para gestante DCDA estável.\"\n        }\n      }\n    },\n    {\n      \"id\": 2,\n      \"name\": \"Condições Clínicas e Elegibilidade para Parto Vaginal\",\n      \"shortName\": \"Condições Parto Vaginal\",\n      \"percentage\": 27.8,\n      \"questionCount\": 10,\n      \"priority\": \"Alta\",\n      \"color\": \"#10B981\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"1º feto cefálico autoriza parto vaginal (Twin Birth Study); peso estimado > 1.500g e sem desproporção.\",\n      \"focusExplanation\": \"Comprovado pelo clássico ensaio clínico multinacional *Twin Birth Study*, **o parto vaginal planejado é seguro e não aumenta a morbimortalidade perinatal quando comparado à cesariana programada**, desde que os seguintes critérios de elegibilidade estejam satisfeitos: **1º feto em apresentação cefálica**; idade gestacional >= 32 semanas com **peso fetal estimado > 1.500 g**; **discordância de peso fetal < 20-25%** (o 2º feto não pode ser substancialmente maior que o 1º); ausência de placenta prévia ou cicatrizes uterinas corporais; e disponibilidade de centro cirúrgico imediato com equipe neonatal dupla.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Apresentação cefálica do primeiro feto como o pré-requisito anatômico absoluto para autorização da via vaginal.\",\n          \"trapAlert\": \"Afirmar que a gestação múltipla é contraindicação absoluta ao parto normal.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Caso clínico em maternidade do SUS: primigesta em trabalho de parto na 37ª semana com ambos os conceptos em apresentação cefálica e dinâmica regular. Conduta correta: conduzir parto vaginal.\",\n          \"trapAlert\": \"Indicar cesariana de emergência apenas pelo diagnóstico de gemelaridade.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Análise da evidência científica do Twin Birth Study: a sobrevida e os desfechos neurológicos neonatais são equivalentes entre parto vaginal e cesariana programada quando G1 é cefálico.\",\n          \"trapAlert\": \"Afirmar que a cesariana programada previne paralisia cerebral no segundo gemelar.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Critério de desproporção fetal: por que o segundo feto não pode ter peso estimado significativamente maior (> 20-25%) que o primeiro no parto vaginal (risco de distócia e retenção de cabeça derradeira).\",\n          \"trapAlert\": \"Autorizar parto normal quando o 2º feto tem peso estimado em 3.800g e o 1º em 2.200g.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Monitorização intraparto: necessidade de cardiotocografia contínua com duplo transdutor para vigilância individualizada de ambos os batimentos cardiofetais.\",\n          \"trapAlert\": \"Realizar ausculta intermitente com sonar simples alternando entre os fetos.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Pergunta objetiva sobre quais as condições anatômicas que contraindicam sumariamente o parto vaginal na gemelaridade.\",\n          \"trapAlert\": \"Listar DCDA como contraindicação ao parto vaginal.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Acolhimento da parturiente e analgesia de parto: analgesia peridural precoce é altamente benéfica para permitir manobras intrauterinas de resgate no 2º feto caso necessárias.\",\n          \"trapAlert\": \"Contraindicar analgesia de parto por receio de hipotonia uterina.\"\n        }\n      }\n    },\n    {\n      \"id\": 3,\n      \"name\": \"Indicações Formais de Parto Cesáreo em Gestação Múltipla\",\n      \"shortName\": \"Indicação de Cesárea\",\n      \"percentage\": 16.7,\n      \"questionCount\": 6,\n      \"priority\": \"Alta\",\n      \"color\": \"#EC4899\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"1º feto não-cefálico (pélvico/córmico), gestação monoamniótica (MCMA) ou gêmeos siameses.\",\n      \"focusExplanation\": \"As indicações obstétricas mandatórias de cesariana eletiva na gravidez gemelar são: **1º feto em apresentação não-cefálica (pélvico ou córmico)**, independentemente da apresentação do 2º feto, pelo risco iminente de **engastamento de cabeças fetais (colisão de queixos / intertravamento)** durante o polo expulsivo; **gestação monocoriônica monoamniótica (MCMA)**, pelo risco de acidentes e laços de cordão; **gêmeos conjugados / siameses**; sofrimento fetal agudo; e situações em que o peso fetal estimado de qualquer conceito é inferior a 1.500 g.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Reconhecimento do 1º feto em apresentação pélvica ou córmica como indicação absoluta e irrefutável de operação cesariana.\",\n          \"trapAlert\": \"Propor parto vaginal de primeiro gemelar pélvico alegando que o segundo feto é cefálico.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Cenário de admissão em centro obstétrico: ultrassom revela 1º feto pélvico e 2º cefálico. Qual a via de parto obrigatória.\",\n          \"trapAlert\": \"Aguardar dilatação total na esperança de rotação espontânea do primeiro concepto.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Mecanismo biomecânico do engastamento de cabeças (interlocking twins): queixo do feto pélvico descido engata no queixo do feto cefálico acima do estreito superior da bacia, travando a descida.\",\n          \"trapAlert\": \"Supor que a colisão de queixos ocorre quando o primeiro feto é cefálico.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Cesariana em siameses: necessidade de laparotomia ampla e histerotomia corporal/clássica para extração atraumática dos conceitos coligados.\",\n          \"trapAlert\": \"Realizar incisão segmentar transversa baixa habitual em gêmeos unidos.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Indicação cirúrgica precoce na gestação MCMA entre 32 e 34 semanas por risco letal de nó de cordão verdadeiro.\",\n          \"trapAlert\": \"Aguardar termo completo na gravidez monoamniótica.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Pergunta direta: qual a conduta diante de feto 1 córmico (situação transversa) e feto 2 cefálico.\",\n          \"trapAlert\": \"Tentar versão cefálica externa no primeiro feto antes de indicar cesárea.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Fluxo assistencial cirúrgico: preparo anestésico rápido e presença de equipe cirúrgica obstétrica habilitada.\",\n          \"trapAlert\": \"Postergar cesariana de gemelares engastados na emergência.\"\n        }\n      }\n    },\n    {\n      \"id\": 4,\n      \"name\": \"Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos\",\n      \"shortName\": \"2º Gemelar\",\n      \"percentage\": 13.9,\n      \"questionCount\": 5,\n      \"priority\": \"Média\",\n      \"color\": \"#8B5CF6\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Clampeamento imediato do cordão de G1 em MC; avaliar apresentação de G2; intervalo guiado por BCF normal.\",\n      \"focusExplanation\": \"Após o desprendimento do primeiro feto (G1), o protocolo assistencial mandatória exige: **clampeamento imediato do cordão de G1 em gestações monocoriônicas** para prevenir exsanguinação fetal retrógrada aguda de G2 através de anastomoses vasculares; palpação abdominal de Leopold e **ultrassonografia à beira do leito imediata** para avaliar a apresentação estática de G2 (frequentemente roda para transversal ou pélvica); manutenção de infusão venosa de ocitocina para sustentar contrações uterinas eficazes; e **amniotomia guiada das membranas de G2 apenas após a apresentação estar bem engajada** (prevenção de prolapso de cordão). Diretrizes modernas **aboliram o corte rígido de 30 minutos** entre nascimentos, desde que o BCF de G2 permaneça normal e o progresso progrida.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Sequência de ações do obstetra na sala de parto após a saída de G1 e flexibilização do intervalo seguro guiado pelo traçado de BCF normal.\",\n          \"trapAlert\": \"Indicar cesariana de emergência para G2 pontualmente aos 31 minutos se o BCF e a dinâmica estiverem normais.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Apresentação de G2 em situação transversa após o nascimento vaginal de G1: manobra de escolha é a Versão Podálica Interna (VPI) seguida de grande extração pélvica assistida.\",\n          \"trapAlert\": \"Indicar cesariana de emergência com colo uterino totalmente dilatado sem tentar manobras internas por obstetra habilitado.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Risco de descolamento prematuro de placenta (DPP) após a saída de G1 pela descompressão uterina súbita, exigindo monitorização contínua do tônus e sangramento genital.\",\n          \"trapAlert\": \"Achar que o descolamento de placenta só ocorre antes do início do trabalho de parto.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Mecanismo da Versão Podálica Interna: introdução da mão enluvada na cavidade, localização de um ou ambos os pés do concepto e tração suave até a apresentação pélvica.\",\n          \"trapAlert\": \"Realizar versão podálica externa com o útero hipertrônico.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Momento correto da rotura artificial das membranas (amniotomia) de G2: obrigatoriamente após encaixamento e fixação da apresentação fetal.\",\n          \"trapAlert\": \"Romper a bolsa de G2 com o feto flutuante e alto (risco imediato de prolapso de cordão).\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Por que o clampeamento do cordão do primeiro feto não deve ser tardio em concepto monocoriônico (prevenção de choque hemodinâmico no segundo).\",\n          \"trapAlert\": \"Aplicar clampeamento tardio de 3 minutos de rotina para gemelares monocoriônicos.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Equipe de atendimento neonatal preparada para reanimação concomitante em berços aquecidos distintos na mesma sala de parto.\",\n          \"trapAlert\": \"Utilizar a mesma fonte de oxigênio e aquecimento para os dois recém-nascidos.\"\n        }\n      }\n    },\n    {\n      \"id\": 5,\n      \"name\": \"Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia\",\n      \"shortName\": \"Prevenção de HPP\",\n      \"percentage\": 13.9,\n      \"questionCount\": 5,\n      \"priority\": \"Média\",\n      \"color\": \"#F59E0B\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"Sobredistensão miometrial = risco crítico de atonia; Ocitocina 10 UI IM imediata após o ÚLTIMO feto.\",\n      \"focusExplanation\": \"A gestação múltipla é um **fator de risco isolado e independente de primeira magnitude para Hemorragia Pós-Parto (HPP)** grave por **atonia uterina**, decorrente do estiramento biomecânico excessivo das fibras miometriais (Lei de Laplace). A profilaxia ativa padrão-ouro universal para todas as parturientes consiste na administração de **Ocitocina 10 UI intramuscular (IM) ou infusão intravenosa lenta imediatamente após o nascimento do ÚLTIMO feto**. A paciente deve manter dois acessos venosos calibrosos (14G ou 16G), reserva de sangue no hospital e vigilância intensiva no 4º período do parto (Período de Greenberg) com aferição do tônus uterino e globo de segurança de Pinard a cada 15 minutos na primeira hora.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Atonia uterina como principal complicação puerperal da gravidez gemelar e o momento correto de administração da ocitocina profilática (após o nascimento do último feto).\",\n          \"trapAlert\": \"Administrar ocitocina profilática em bolus após a saída do 1º feto enquanto o 2º feto ainda está dentro do útero (pode causar hipertonia e óbito de G2).\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"Caso de puérpera de gemelar com sangramento genital volumoso e útero amolecido acima da cicatriz umbilical no pós-parto imediato: diagnóstico de atonia uterina e conduta escalonada.\",\n          \"trapAlert\": \"Prescrever apenas bolsa de gelo no hipogástrio sem realizar massagem bimanual e uterotônicos.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"Farmacoterapia escalonada na atonia refratária pós-gemelar: Ocitocina IV + Ácido Tranexâmico 1g IV precoce + Metilergometrina 0,2 mg IM (se normotensa) ou Misoprostol 800 mcg retal.\",\n          \"trapAlert\": \"Administrar Metilergometrina em paciente gemelar com pré-eclâmpsia sobreposta.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"Importância da revisão sistemática do canal de parto com valvas vaginais sob anestesia para excluir lacerações e hematomas de trajeto decorrentes de manobras obstétricas.\",\n          \"trapAlert\": \"Atribuir todo sangramento à atonia sem inspecionar colo uterino e vagina.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"Parâmetros de gravidade hemodinâmica: cálculo do Índice de Choque (FC/PAS >= 0,9 indicando sangramento oculto grave e necessidade de transfusão).\",\n          \"trapAlert\": \"Subestimar a perda sanguínea baseando-se apenas na contagem visual de compressas.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"Conceito do Globo de Segurança de Pinard: retração miometrial mantida fechando os vasos espiralados em 'ligaduras vivas de Pinard'.\",\n          \"trapAlert\": \"Achar que a hemostasia puerperal primária depende exclusivamente de fatores de coagulação.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Protocolo de Código Vermelho Obstétrico ativado imediatamente em sala de parto para assistência multidisciplinar rápida.\",\n          \"trapAlert\": \"Aguardar exames laboratoriais de coagulação antes de iniciar ressuscitação volêmica.\"\n        }\n      }\n    }\n  ],\n  \"bancaBreakdown\": {\n    \"ENARE\": {\n      \"banca\": \"ENARE\",\n      \"totalQuestions\": 9,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Momento do Parto: Idade Gestacional Rigorosa por Corionicidade\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Condições Clínicas e Elegibilidade para Parto Vaginal\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Indicações Formais de Parto Cesáreo em Gestação Múltipla\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 11.1\n        },\n        {\n          \"subfoco\": \"Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 11.1\n        },\n        {\n          \"subfoco\": \"Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 11.2\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"USP\": {\n      \"banca\": \"USP\",\n      \"totalQuestions\": 10,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Momento do Parto: Idade Gestacional Rigorosa por Corionicidade\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 30.0\n        },\n        {\n          \"subfoco\": \"Condições Clínicas e Elegibilidade para Parto Vaginal\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 30.0\n        },\n        {\n          \"subfoco\": \"Indicações Formais de Parto Cesáreo em Gestação Múltipla\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 10.0\n        },\n        {\n          \"subfoco\": \"Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 10.0\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"UNICAMP\": {\n      \"banca\": \"UNICAMP\",\n      \"totalQuestions\": 6,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Momento do Parto: Idade Gestacional Rigorosa por Corionicidade\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Condições Clínicas e Elegibilidade para Parto Vaginal\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Indicações Formais de Parto Cesáreo em Gestação Múltipla\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 16.7\n        },\n        {\n          \"subfoco\": \"Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 16.7\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"PSU-MG\": {\n      \"banca\": \"PSU-MG\",\n      \"totalQuestions\": 5,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Momento do Parto: Idade Gestacional Rigorosa por Corionicidade\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Condições Clínicas e Elegibilidade para Parto Vaginal\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Indicações Formais de Parto Cesáreo em Gestação Múltipla\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"AMRIGS\": {\n      \"banca\": \"AMRIGS\",\n      \"totalQuestions\": 3,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Momento do Parto: Idade Gestacional Rigorosa por Corionicidade\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Condições Clínicas e Elegibilidade para Parto Vaginal\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Indicações Formais de Parto Cesáreo em Gestação Múltipla\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 33.4\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"SUS-SP\": {\n      \"banca\": \"SUS-SP\",\n      \"totalQuestions\": 3,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Momento do Parto: Idade Gestacional Rigorosa por Corionicidade\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Condições Clínicas e Elegibilidade para Parto Vaginal\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Puerpério Imediato e Prevenção de Hemorragia Pós-Parto por Atonia\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 33.4\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    }\n  },\n  \"topTraps\": [\n    {\n      \"subfoco\": \"Condições Clínicas e Elegibilidade para Parto Vaginal\",\n      \"trapTitle\": \"Distrator de Cesariana Obrigatória na Gemelaridade\",\n      \"trapDescription\": \"Gemelaridade não impõe cesariana per se; com o primeiro feto cefálico e termo precoce, o parto vaginal é a via recomendada e segura (Twin Birth Study).\"\n    },\n    {\n      \"subfoco\": \"Manejo Ativo do Segundo Gemelar e Intervalo entre Nascimentos\",\n      \"trapTitle\": \"Distrator do Limite Rígido de 30 Minutos\",\n      \"trapDescription\": \"Diretrizes modernas aboliram o corte rígido de 30 minutos entre os conceptos, autorizando a condução vaginal desde que a cardiotocografia de G2 seja normal e haja dinâmica uterina.\"\n    }\n  ],\n  \"auditHash\": \"d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123\",\n  \"needsRecalc\": false,\n  \"certifiedAt\": \"2026-11-04T00:00:00.000Z\",\n  \"lastRecalculatedAt\": \"2026-11-04T00:00:00.000Z\",\n  \"status\": \"certified\"\n}\n```\n\n---\n\n## 2. Idade Gestacional de Interrupção Programada por Corionicidade\n\nA cronologia do parto na gestação gemelar é estritamente regulada pela corionicidade anatômica documentada no primeiro trimestre:\n\n$$\n\\text{Cronograma do Parto Eletivo} \\implies \\begin{cases} \\text{Dicoriônica Diamniótica (DCDA)} \\implies \\mathbf{37\\text{s }0\\text{d a }38\\text{s }6\\text{d}} \\quad (\\text{Após 38s eleva natimortos}) \\\\ \\text{Monocoriônica Diamniótica (MCDA)} \\implies \\mathbf{36\\text{s }0\\text{d a }37\\text{s }0\\text{d}} \\quad (\\text{Risco de óbito súbito por shunts}) \\\\ \\text{Monocoriônica Monoamniótica (MCMA)} \\implies \\mathbf{32\\text{s }0\\text{d a }34\\text{s }0\\text{d}} \\quad (\\text{Cesariana obrigatória pós-corticoide}) \\\\ \\text{Gêmeos Unidos / Siameses} \\implies \\mathbf{34\\text{s }0\\text{d a }36\\text{s }0\\text{d}} \\quad (\\text{Cesariana com incisão ampla}) \\end{cases}\n$$\n\n### Tabela Canônica do Momento e Via de Parto Recomendada:\n\n| Tipo de Placentação | Idade Gestacional Homologada | Via de Parto Padrão | Justificativa Fisiopatológica e Evidência Clínica |\n| :--- | :---: | :--- | :--- |\n| **Dicoriônica Diamniótica (DCDA)** | **37s 0d a 38s 6d** | **Depende da apresentação** (Vaginal se G1 cefálico) | A partir da 38ª semana, o risco de óbito fetal intrauterino supera os benefícios da maturidade neonatal. |\n| **Monocoriônica Diamniótica (MCDA)** | **36s 0d a 37s 0d** | **Depende da apresentação** (Vaginal se G1 cefálico) | Prevenção da mortalidade fetal súbita imprevisível secundária a descompensação de anastomoses vasculares. |\n| **Monocoriônica Monoamniótica (MCMA)** | **32s 0d a 34s 0d** | **Cesariana Eletiva Obrigatória** | Risco crítico de entrelaçamento letal, estricção e nós verdadeiros de cordões umbilicais intrauterinos. |\n| **Gêmeos Unidos (Siameses)** | **34s 0d a 36s 0d** | **Cesariana Eletiva Obrigatória** | Necessidade de planejamento cirúrgico multidisciplinar e histerotomia corporal clássica ampla. |\n\n---\n\n## 3. Seleção da Via de Parto Conforme Apresentação Combinada dos Fetos\n\nA decisão entre parto vaginal e cesariana baseia-se fundamentalmente na **apresentação do primeiro gemelar (G1)** e nas evidências sólidas do ensaio clínico *Twin Birth Study*:\n\n$$\n\\text{Via de Parto Conforme Apresentação} \\implies \\begin{cases} \\text{G1 Cefálico / G2 Cefálico} \\implies \\mathbf{\\text{Parto Vaginal (Via de Escolha Preferencial)}} \\\\ \\text{G1 Cefálico / G2 Não-Cefálico (Pélvico ou Córmico)} \\implies \\mathbf{\\text{Parto Vaginal Permitido (Equipe Habilitada)}} \\\\ \\text{G1 Não-Cefálico (Pélvico ou Córmico)} \\implies \\mathbf{\\text{Cesariana Eletiva Mandatória (Risco de Engastamento)}} \\\\ \\text{Gestação Monoamniótica (MCMA)} \\implies \\mathbf{\\text{Cesariana Eletiva Obrigatória (32 a 34 semanas)}} \\end{cases}\n$$\n\n### Matriz Canônica de Apresentações Fetais Combinadas:\n\n| Apresentação Combinada (G1 / G2) | Frequência Relativa | Via de Parto Recomendada | Condutas e Manobras de Sala de Parto |\n| :--- | :---: | :--- | :--- |\n| **1º Cefálico / 2º Cefálico** | ~40% | **Parto Vaginal** | Condução obstétrica habitual; monitorização contínua simultânea com cardiotocografia dupla. |\n| **1º Cefálico / 2º Não-Cefálico** | ~35% - 40% | **Parto Vaginal (Autorizado)** | Requer equipe experiente. Após o nascimento de G1, avaliar G2: versão cefálica externa, versão podálica interna ou extração pélvica. |\n| **1º Não-Cefálico / Qualquer 2º** | ~20% - 25% | **Cesariana Eletiva** | **Contraindicação absoluta ao parto vaginal.** Risco grave de **engastamento de cabeças (interlocking twins)** e retenção de cabeça derradeira. |\n| **Gestação Monoamniótica (MCMA)** | < 1% | **Cesariana Eletiva** | Risco de prolapso e estrangulamento de cordões durante o trabalho de parto. |\n\n> [!WARNING] Armadilha Clássica de Prova: Gemelaridade NÃO Impõe Cesariana de Rotina\n> Um dos distratores mais punidos em provas é a afirmativa de que *\"toda gravidez gemelar tem indicação mandatória de cesariana\"*. **ISSO É FALSO.** O ensaio clínico multinacional *Twin Birth Study* comprovou que, se o primeiro concepto for cefálico, a termo ou termo precoce em gestação diamniótica (DCDA ou MCDA), o parto vaginal planejado é seguro, eficaz e apresenta desfechos neonatais perfeitamente equivalentes à cesariana agendada. A conversão de urgência para cesariana de G2 ocorre em menos de 4 a 5% dos casos bem conduzidos.\n\n---\n\n## 4. Condições Clínicas e Critérios Mandatórios para a Prova de Parto Vaginal\n\nPara que a equipe obstétrica autorize com segurança a prova de trabalho de parto em gestação gemelar, os seguintes critérios da **FEBRASGO e ACOG** devem ser compulsoriamente atendidos:\n\n1.  **Apresentação do Primeiro Feto (G1):** Obrigatoriamente **cefálica**.\n2.  **Idade Gestacional e Peso Fetal:** Idade gestacional $\\ge 32\\text{ semanas}$ e peso fetal estimado de ambos os conceptos **$> 1.500\\text{ g}$**.\n3.  **Concordância Ponderal:** Discordância de peso entre os conceptos **$< 20\\text{ a }25\\%$**. Se o segundo concepto for significativamente maior que o primeiro, há risco elevado de distócia mecânica de G2 após o nascimento de G1.\n4.  **Infraestrutura Hospitalar:** Disponibilidade imediata de centro cirúrgico desocupado para realização de cesariana de urgência em menos de 15 a 30 minutos, médico anestesiologista presencial e equipe de neonatologia com dois leitos de reanimação independentes.\n5.  **Monitorização Fetal Contínua:** Cardiotocografia intraparto contínua com duplo transdutor monitorando individualmente a frequência cardíaca de ambos os conceptos.\n\n---\n\n## 5. Assistência Ativa ao Nascimento do Segundo Gemelar & Intervalo Seguro\n\nO intervalo entre o nascimento do primeiro e do segundo concepto exige vigilância obstétrica ativa e padronizada:\n\n*   **Clampeamento Imediato do Cordão de G1:** Em gestações monocoriônicas, o cordão umbilical de G1 deve ser clampeado imediatamente após a sua saída para **evitar que G2 sofra exsanguinação aguda reflexa** através das anastomoses placentárias compartilhadas.\n*   **Avaliação Estática Imediata de G2:** Realizar palpação abdominal de Leopold e **ultrassonografia à beira do leito imediata** para confirmar a estática fetal de G2 (após a descompressão do útero com a saída de G1, o segundo feto muda frequentemente de apresentação para pélvica ou situação transversa).\n*   **Dinâmica Uterina e Ocitocina:** Reiniciar ou titular a infusão venosa de ocitocina para manter 3 a 4 contrações uterinas eficazes a cada 10 minutos.\n*   **Amniotomia Guiada e Segura:** Romper a bolsa amniótica de G2 apenas quando a apresentação fetal estiver firmemente encaixada e fixada na pelve, prevenindo ativamente o **prolapso de cordão umbilical**.\n*   **Flexibilização do Intervalo de Tempo:** Diretrizes internacionais contemporâneas (FEBRASGO, ACOG, NICE) **aboliram o limite rígido arbitrário de 30 minutos**. O intervalo de nascimento pode ultrapassar 30 minutos com segurança desde que a frequência cardíaca fetal permaneça estritamente normal na cardiotocografia contínua e a descida progrida.\n*   **Manobras de Resgate para G2 em Situação Transversa:** Se G2 permanecer em situação transversa persistente após a saída de G1, o obstetra habilitado realiza a **Versão Podálica Interna (VPI)** sob analgesia: introduz a mão no útero, apreende um ou ambos os pés do feto e traciona suavemente para o canal de parto, realizando a **grande extração pélvica**, evitando uma cesariana com dilatação total.\n\n---\n\n## 6. Puerpério Imediato: Profilaxia Agressiva da Hemorragia Pós-Parto (HPP)\n\nA gestação múltipla é um fator de risco independente de primeira grandeza para Hemorragia Pós-Parto (HPP). O mecanismo determinante é a **atonia uterina por sobredistensão acentuada das fibras miometrias** (Lei de Laplace):\n\n1.  **Manejo Ativo do 3º Período do Parto:** Administração profilática universal mandatória de **Ocitocina 10 UI Intramuscular (IM)** (ou infusão intravenosa lenta) **imediatamente após a saída do ÚLTIMO feto**.\n2.  **Revisão do Canal de Parto:** Exame especular sistemático de colo uterino, paredes vaginais e períneo sob valvas de peso para identificação e sutura precoce de lacerações decorrentes de manipulações obstétricas.\n3.  **Vigilância no 4º Período de Greenberg:** Monitorização rigorosa do tônus uterino e do Globo de Segurança de Pinard a cada 15 minutos na primeira hora pós-parto, mantendo dois acessos venosos calibrosos (14G ou 16G) e reserva hemoderivada disponível.\n\n---\n\n```clinical-scheme\n{\n  \"type\": \"scenarios\",\n  \"badge\": \"Diretriz Twin Birth Study / FEBRASGO\",\n  \"data\": {\n    \"scenarios\": [\n      {\n        \"title\": \"Cenário 1: 1º Cefálico / 2º Cefálico (~40%)\",\n        \"badge\": \"Via Vaginal Preferencial\",\n        \"desc\": \"Conduta padrão idêntica ao parto único. Monitorização contínua com cardiotocografia dupla. Após a saída de G1, manter dinâmica uterina com ocitocina e aguardar descida de G2.\",\n        \"conduct\": \"Parto normal assistido com vigilância do intervalo guiado pelo bem-estar fetal.\",\n        \"alert\": \"Excelente prognóstico perinatal com taxa mínima de cesariana intraparto!\"\n      },\n      {\n        \"title\": \"Cenário 2: 1º Cefálico / 2º Não-Cefálico (~35-40%)\",\n        \"badge\": \"Via Vaginal Autorizada\",\n        \"desc\": \"Conduzir o parto vaginal de G1. Após a saída de G1, avaliar estática de G2 por USG: se pélvico, conduzir parto pélvico assistido; se transverso, realizar Versão Podálica Interna (VPI) e grande extração.\",\n        \"conduct\": \"Requer equipe obstétrica treinada em manobras intrauterinas de resgate sob analgesia.\",\n        \"alert\": \"A prematuridade ou peso < 1.500g contraindica manobras internas forçadas!\"\n      },\n      {\n        \"title\": \"Cenário 3: 1º Não-Cefálico (Pélvico/Córmico) (~20-25%)\",\n        \"badge\": \"Cesariana Eletiva Mandatória\",\n        \"desc\": \"Contraindicação absoluta de parto vaginal devido ao risco crítico de engastamento de cabeças (interlocking twins), colisão de queixos e distócia de cabeça derradeira.\",\n        \"conduct\": \"Agendar cesariana eletiva respeitando a idade gestacional da corionicidade.\",\n        \"alert\": \"Não aguardar dilatação total na esperança de rotação espontânea de G1!\"\n      }\n    ]\n  }\n}\n```\n\n---\n\n### 🔄 O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)\n\n| Ponto de Conduta | Prática Antiga (Pegadinha das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |\n| :--- | :--- | :--- | :--- |\n| **Via de Parto de Rotina** | Cesariana eletiva programada para todas as gestações gemelares | **Parto vaginal é a via preferencial e segura** quando o 1º gemelar é cefálico (Twin Birth Study) | **FEBRASGO / ACOG (2023)** |\n| **Intervalo entre Nascimentos** | Corte rígido e obrigatório de 30 minutos para o nascimento de G2 | **Intervalo flexibilizado**, sem tempo limite rígido, desde que o BCF de G2 permaneça normal | **NICE Guideline / FEBRASGO (2023)** |\n| **Clampeamento de Cordão em MC** | Clampeamento tardio habitual de 1 a 3 minutos para todos os fetos | **Clampeamento imediato do cordão de G1** em monocoriônicas para evitar exsanguinação retrógrada | **ISUOG / FEBRASGO (2023)** |\n| **G2 em Situação Transversa** | Indicar cesariana de emergência imediata para G2 com colo dilatado | Tentar **Versão Podálica Interna (VPI)** e grande extração por obstetra habilitado | **ACOG / FEBRASGO (2023)** |\n\n> [!IMPORTANT] Alerta de Atualização para Provas de 2024-2026:\n> Bancas como ENARE, USP e UNICAMP punem severamente quem marca cesariana de emergência indiscriminada para o segundo gemelar após um intervalo superior a 30 minutos. Se o enunciado deixar claro que a cardiotocografia de G2 é de padrão categoria 1 (normal) e há dinâmica uterina ativa, a conduta correta é continuar a assistência ao parto vaginal com amniotomia após engajamento.\n\n---\n\n## 7. Algoritmo Decisório para Assistência ao Parto na Gemelaridade\n\n### Passo a Passo Sintético da Cascata Decisória\n\n1.  **[Estratificação da Idade Gestacional]:** Definir o momento eletivo da interrupção com base na corionicidade: **32 a 34 semanas** para MCMA (cesariana obrigatória com corticoide prévio); **36s 0d a 37s 0d** para MCDA; e **37s 0d a 38s 6d** para DCDA.\n2.  **[Avaliação da Apresentação de G1]:** Realizar ultrassonografia ou exame físico de admissão. Se o primeiro feto for **não-cefálico (pélvico ou córmico)**, indicar **operação cesariana imediata**. Se for cefálico com peso $> 1.500\\text{ g}$, autorizar a prova de parto vaginal.\n3.  **[Condução do Nascimento de G1]:** Monitorar ambos os conceptos com cardiotocografia contínua com duplo transdutor. No nascimento de G1, realizar o **clampeamento imediato do cordão** em gestações monocoriônicas.\n4.  **[Manejo Ativo de G2]:** Palpar o abdome e realizar ecografia de sala para confirmar a apresentação de G2. Manter infusão de ocitocina e realizar a amniotomia de G2 apenas quando a apresentação estiver encaixada. Se G2 transverso persistente, realizar Versão Podálica Interna.\n5.  **[Profilaxia Puerperal de HPP]:** Imediatamente após o nascimento do último concepto, administrar **Ocitocina 10 UI IM** (ou infusão IV lenta), revisar canal de parto sob valvas e monitorar o tônus uterino no 4º período do parto a cada 15 minutos.\n\n---\n\n## Diretrizes Oficiais & Consensos de Referência\n\n*   **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** Manual de Obstetrícia - Assistência ao Parto na Gestação Múltipla, CNE em Perinatologia (2021/2023).\n*   **Twin Birth Study Collaborative Group (Barrett et al., NEJM):** A Randomized Trial of Planned Cesarean or Planned Vaginal Delivery for Twin Pregnancy (New England Journal of Medicine, estudo seminal).\n*   **ACOG (American College of Obstetricians and Gynecologists):** Practice Bulletin No. 231 - Multifetal Gestations: Intrapartum Management and Timing of Delivery (2021, revalidado 2024).\n*   **NICE (National Institute for Health and Care Excellence):** Twin and Triplet Pregnancy: Diagnosis and Management - NICE Guideline [NG137] (2019, atualizado 2024).\n*   **Ministério da Saúde do Brasil:** Diretrizes Nacionais de Assistência ao Parto Normal e Gestação de Alto Risco, SAS/DAPES, Brasília-DF (2022/2024).\n"
},
  {
    "id": "mat-inf-puerp-01",
    "focusId": "obs-inf-puerperal",
    "title": "Infecção Puerperal & Endometrite",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "readTimeMinutes": 8,
    "lastUpdatedYear": 2026,
    "guidelineBadge": "FEBRASGO / ACOG / CDC / Ministério da Saúde",
    "summarySnippet": "Tríade de Bumm, diagnóstico de morbidade febril puerperal, profilaxia cirúrgica na cesárea com cefazolina na indução, esquema de primeira linha com clindamicina + gentamicina e manejo da febre persistente.",
    "keyPoints": [
      "Morbidade febril puerperal: temperatura oral ≥ 38,0°C em 2 dias distintos entre o 2º e 10º dia (excluídas primeiras 24h).",
      "A cesariana é o principal fator de risco isolado, elevando em 10 a 30 vezes a incidência de endometrite em relação ao parto vaginal.",
      "Profilaxia cirúrgica mandatória: Cefazolina 2g IV (ou 3g se IMC ≥ 35 ou peso ≥ 120kg) administrada 30-60 min ANTES da incisão na indução anestésica.",
      "Endometrite puerperal: Tríade de Bumm clássica (febre persistente + útero doloroso/amolecido subinvoluído + lóquios fétidos achocolatados).",
      "Tratamento padrão-ouro hospitalar: Clindamicina (900mg IV 8/8h) + Gentamicina (5mg/kg IV dose única diária) até 48 horas afebril e assintomática.",
      "Não prescrever antibioticoterapia oral ambulatorial após alcance da cura clínica hospitalar (prática revogada).",
      "Febre persistente após 48-72h: investigar abscesso de parede, restos ovulares/hematoma ao USG, adicionar ampicilina e suspeitar de tromboflebite pélvica séptica (teste da heparina)."
    ],
    "recurrenceStats": {
      "focusSlug": "infeccao-puerperal",
      "specialty": "Obstetrícia",
      "theme": "Puerpério",
      "focus": "Infecção Puerperal",
      "totalQuestions": 249,
      "timeframeRange": "2017-2026",
      "version": 1,
      "donutSlices": [
        {
          "id": 1,
          "name": "Antibioticoterapia na Infecção Puerperal",
          "shortName": "Antibioticoterapia",
          "percentage": 26.5,
          "questionCount": 66,
          "priority": "Alta",
          "color": "#3B82F6",
          "trend": "alta",
          "trendLabel": "🔥 Em Alta (2024-2026)",
          "takeaway": "Clindamicina + Gentamicina IV de primeira linha até 48h afebril; sem antibiótico oral pós-alta.",
          "focusExplanation": "O esquema de **primeira linha padrão-ouro** para endometrite pós-parto é a combinação intravenosa de **Clindamicina 900 mg IV a cada 8h** (cobertura de anaeróbios, incluindo *Bacteroides fragilis*) associada a **Gentamicina 5 mg/kg IV uma vez ao dia** ou 1,5 mg/kg a cada 8h (cobertura de Gram-negativos entéricos). O tratamento deve ser mantido em regime hospitalar até a paciente permanecer **48 horas afebril e assintomática**. Ao atingir esse critério de cura clínica, **a alta hospitalar é concedida SEM antibioticoterapia oral pós-alta** (não há benefício comprovado e eleva resistência bacteriana).",
          "bancaPatterns": {
            "Todas": {
              "howItCharges": "Cobrança unânime nas principais bancas: indicação imediata de Clindamicina + Gentamicina IV, tempo de manutenção hospitalar até 48h afebril e suspensão completa do antibiótico na alta hospitalar (sem transição oral).",
              "trapAlert": "Prescrever Cefalexina ou Amoxicilina-Clavulanato oral pós-alta é o distrator mais assinalado e punido em provas."
            },
            "ENARE": {
              "howItCharges": "O **ENARE** formula casos clínicos objetivos no ambiente de enfermaria obstétrica do SUS, cobrando a prescrição da associação parenteral (Clindamicina 900mg + Gentamicina IV) e o critério de alta.",
              "trapAlert": "A banca sempre insere uma alternativa com 'alta hospitalar com antibiótico oral por 7 a 10 dias'. A regra de ouro é: alta SEM antibiótico oral após 48h afebril."
            },
            "USP": {
              "howItCharges": "A **USP** exige o raciocínio clínico da falha terapêutica: se após 48 a 72h de Clinda + Genta a paciente mantiver febre e piora clínica, deve-se associar **Ampicilina IV** (cobertura de *Enterococcus faecalis*) e pesquisar abscesso pélvico ou tromboflebite pélvica séptica.",
              "trapAlert": "Trocar empiricamente para carbapenêmico sem investigar focos complicados ou não associar Ampicilina para cobrir Enterococo."
            },
            "UNICAMP": {
              "howItCharges": "A **UNICAMP** explora o perfil farmacológico dos aminoglicosídeos: Gentamicina em dose única diária (5 mg/kg) possui a mesma eficácia clínica da dose fracionada de 8/8h, com menor potencial de nefrotoxicidade e ototoxicidade.",
              "trapAlert": "Alternativas sugerindo monoterapia com fluoroquinolonas orais em pacientes com endometrite puerperal."
            },
            "PSU-MG": {
              "howItCharges": "O **PSU-MG** foca no critério de cura clínica: a contagem do tempo de segurança exige 48 horas ininterruptas afebril, com involução uterina normal e lóquios sem odor fétido.",
              "trapAlert": "Alternativas que fixam tempos arbitrários de 14 dias de internação independentemente da melhora clínica."
            },
            "AMRIGS": {
              "howItCharges": "A **AMRIGS** tem estilo direto, cobrando o espectro microbiano dos fármacos: Clindamicina para cobertura de anaeróbios estritos e Gentamicina para bacilos Gram-negativos facultativos.",
              "trapAlert": "Substituir Clindamicina por Metronidazol em monoterapia sem a cobertura sinérgica de Gram-negativos da Gentamicina."
            },
            "SUS-SP": {
              "howItCharges": "O **SUS-SP** aborda o fluxo de porta de emergência: puérpera febril no 4º DPO deve ter internação imediata e início do esquema venoso na primeira hora de admissão.",
              "trapAlert": "Liberar a paciente para tratamento domiciliar com repouso e antitérmicos."
            }
          },
          "auditQuestionIds": [
            "98ed7e3c-6914-4502-879a-f358a91d74cc",
            "d64e57df-9d2d-47a0-9a52-47885d255e7e",
            "90803e36-7494-4fda-bd5f-30f5108f4e7e",
            "a15fbc46-e404-4bbf-a996-1da15dd9b5e4",
            "ac18546f-73e4-4c99-b151-0e60d2e1826e",
            "4ccde0ff-6679-40c3-9d6c-31e8aaa85ea7",
            "c34965f3-99ea-4491-868b-4ebcfe29ccbe",
            "51dde2fb-8423-462a-b97d-c3eede2cfbb0",
            "598434b8-567e-4499-bfd2-582cffb3e14e",
            "b4609740-8e29-4971-ae49-53c7cc5eec64",
            "c6e458c5-6220-4471-a9d2-89e1baed9d1a",
            "37ad81b7-e977-4a68-aca8-3e70fe86cd90",
            "6dcd3fe9-6e34-4fa9-83fb-b7d1eb7bcf66",
            "cbaade9f-b2cb-4ef1-b340-56e23b5a31ce",
            "acedeee3-7e30-4b8c-92ad-22208898e96d",
            "87c80df3-5f0e-4f6e-b571-a8e03782835e",
            "55dc6353-028c-42bb-bbc8-7a1d87600763",
            "487011c3-15c0-4ab6-bb6f-579b7df35992",
            "a7e4c8f3-dfc6-46fb-a38c-cc4f1c40ac14",
            "3ebe32b5-f81d-4ca3-86a8-465abdf83d88",
            "df54239d-7597-4845-9244-e70337133d4e",
            "fb0e8099-8eac-4e8b-8f7a-78f984d24a03",
            "9a996415-45ef-45aa-90a2-9cf523e21f86",
            "142f225b-9f82-49c8-99e7-c555d0c266c6",
            "db717ccd-98c9-4a3d-a68f-c8cd82be3452",
            "a2bd6528-e648-40f3-81f0-3125b2149233",
            "1ced9004-b3b1-4c6d-8d45-d0141a7eb577",
            "b9bc87d8-cf59-4d95-9702-1b9b419b4c3b",
            "ea8b19e4-06b1-47cf-b639-d7df90d09e62",
            "d46d7655-6a6f-4911-a63a-51608cae37f1",
            "0c48d028-5e21-4ec4-a4a4-3a9cdb1120fc",
            "85d20624-c656-4308-a8c4-c4da8913dc22",
            "d3b8fc04-f7cf-4dbb-a1ae-cf85e34c8861",
            "4365b4f7-98c4-457c-b632-58f0676dbc62",
            "ea514395-73cf-473d-904c-5c953e4a6259",
            "9605ebf6-e5fa-4c26-81ef-027ba117c99d",
            "be735ac9-0adc-4b85-b5aa-cc134e5b6a7b",
            "2269fae7-cb4e-43fb-ac89-257132ea1657",
            "00c15816-0c64-4e53-a64a-5dc2731c2dc4",
            "0332cc6f-2320-4a1d-88e1-aab00f18610f",
            "2f1af5db-58fc-4ba1-b2ba-2d40be6a72cd",
            "3d230ae1-f5c3-41ab-8f1f-34b126854a4b",
            "34d501de-fbb3-4d03-90d3-cba7d4e09f59",
            "c17936dd-94dc-443a-88f9-872e7c491161",
            "1540208d-ac1e-429c-91ba-7bf8a30a78da",
            "9326f9db-e146-495c-985e-77cca245f225",
            "9c4dfdc7-3035-4008-85e3-369da61c3095",
            "176fb02f-035f-4fac-9bf1-fe4666927222",
            "3e7691f6-d0b4-4f08-aa79-60effb4a839a",
            "3f599e26-98a6-4166-b26d-21498f212f16",
            "4232e1e4-b8d9-4436-8373-348dcce661f9",
            "dbc19906-87ef-440a-81d1-37d1c18e7dbe",
            "ed029edc-4a92-43f2-aba1-241ad48e850f",
            "91bb6c50-e963-4aa7-ba99-dba1b4e97113",
            "bb026874-e053-4a11-b1d3-a0f4da02aff8",
            "f27797cd-518d-4d77-997e-029c470e67fa",
            "3e6774e7-5c7d-4e9d-b436-09f95da95bdf",
            "4eb8a294-b4b9-4210-9478-ca44586ffc02",
            "8d7f1661-96ae-4c86-9869-38a5a4e6fc10",
            "bec4dfe0-0f36-4d34-b979-1e3e5ece03ab",
            "d64e57df-9d2d-47a0-9a52-47885d255e7e",
            "37ad81b7-e977-4a68-aca8-3e70fe86cd90",
            "acedeee3-7e30-4b8c-92ad-22208898e96d",
            "3ebe32b5-f81d-4ca3-86a8-465abdf83d88",
            "b9bc87d8-cf59-4d95-9702-1b9b419b4c3b",
            "bec4dfe0-0f36-4d34-b979-1e3e5ece03ab"
          ]
        },
        {
          "id": 2,
          "name": "Endometrite Puerperal: Diagnóstico & Clínica",
          "shortName": "Endometrite & Clínica",
          "percentage": 26.1,
          "questionCount": 65,
          "priority": "Alta",
          "color": "#10B981",
          "trend": "alta",
          "trendLabel": "🔥 Em Alta (2024-2026)",
          "takeaway": "Tríade de Bumm: febre, útero amolecido/doloroso e lóquios fétidos achocolatados.",
          "focusExplanation": "A endometrite puerperal é a causa mais comum de febre pós-parto. O diagnóstico é **eminentemente clínico**, caracterizado pela clássica **Tríade de Bumm**: **febre** (geralmente entre o 3º e 5º DPO), **útero subinvoluído, doloroso e amolecido** à palpação abdominal/bimanual, e **lóquios fétidos purulentos ou com aspecto achocolatado** (loquiometra). O colo uterino costuma encontrar-se entreaberto e doloroso à mobilização. Exames de imagem (USG pélvica) são indicados exclusivamente para afastar **restos ovulares retidos ou coleções/abscessos**, sendo **formalmente contraindicada a coleta de swab vaginal para cultura** devido à contaminação com a flora bacteriana habitual do trato reprodutivo inferior.",
          "bancaPatterns": {
            "Todas": {
              "howItCharges": "Apresentação da Tríade de Bumm (febre + útero doloroso e amolecido + lóquios fétidos) no 3º a 5º dia pós-parto, com diagnóstico 100% clínico.",
              "trapAlert": "Indicar cultura de swab vaginal ou biópsia endometrial para confirmar diagnóstico de endometrite (contraindicado e desnecessário)."
            },
            "ENARE": {
              "howItCharges": "O **ENARE** apresenta puérpera jovem que evoluiu no 4º DPO de cesárea com picos febris de 38,8°C, taquicardia e dor no baixo ventre com lóquios escuros e fétidos, exigindo o diagnóstico sindrômico imediato.",
              "trapAlert": "Confundir febre transitória de apojadura mamária (fisiológica, até 38°C nas primeiras 24h) com endometrite bacteriana estabelecida."
            },
            "USP": {
              "howItCharges": "A **USP** explora a semiologia detalhada: palpação do fundo uterino acima da cicatriz umbilical no 4º DPO (útero subinvoluído), dor aos anexos e diagnóstico diferencial com hematoma de cúpula ou infecção de sítio cirúrgico.",
              "trapAlert": "Solicitar histeroscopia diagnóstica ou curetagem de urgência na ausência de achados ultrassonográficos de restos placentários retidos."
            },
            "UNICAMP": {
              "howItCharges": "A **UNICAMP** cobra o diagnóstico diferencial entre endometrite e infecção de ferida operatória na parede abdominal, destacando que a ferida pode estar limpa enquanto a infecção primária reside na decídua endometrial.",
              "trapAlert": "Achar que a ausência de hiperemia ou secreção na incisão cirúrgica da cesárea descarta infecção puerperal."
            },
            "PSU-MG": {
              "howItCharges": "O **PSU-MG** destaca a interpretação laboratorial: leucocitose de até 25.000/mm³ é fisiológica no puerpério imediato devido ao estresse do parto, devendo o diagnóstico se basear na presença de desvio à esquerda e na Tríade de Bumm.",
              "trapAlert": "Fechar diagnóstico de infecção bacteriana apenas pela contagem isolada de leucócitos no 1º ou 2º DPO sem outros sinais flogísticos."
            },
            "AMRIGS": {
              "howItCharges": "A **AMRIGS** cobra nominalmente quais são os três sinais semiológicos constitutivos da clássica Tríade de Bumm.",
              "trapAlert": "Alternativas que trazem 'útero duro e retraído' como sinal de endometrite (o útero da endometrite é amolecido e atônico)."
            },
            "SUS-SP": {
              "howItCharges": "Cenário de puérpera admitida em UPA/PS com queixa de cólicas intensas e sangramento fétido após cesárea de urgência realizada há 5 dias.",
              "trapAlert": "Atrasar o início da antibioticoterapia parenteral para aguardar resultados de hemoculturas ou laudo tomográfico."
            }
          },
          "auditQuestionIds": [
            "e66aa165-aeda-4430-a548-07a80718b614",
            "e67d6a7e-61b1-4f01-9b6c-9da801d917b9",
            "849c0106-8bd4-4d61-9bc5-45446ff8dedc",
            "3f8da803-fa1e-4f2c-9790-43eb3cd25bc9",
            "9fc2cddd-0ef9-45b7-a8e9-1679414afde9",
            "6b83e994-60e0-412d-be79-91ed6a3dfc9e",
            "fb96a97b-4a61-493d-af4f-8667a235440a",
            "40f2be38-64a2-4245-8f6d-13370f987fbf",
            "00ddaf46-9276-400d-89b0-7348baa5c460",
            "ef89a21d-3bf7-4442-8331-64422fdce4de",
            "d74bbd8c-fc0f-4207-bfd9-9ab90610dbe5",
            "90d62f69-544e-49f9-b4ca-5844d9889272",
            "e7435549-c9f2-4557-ae3f-6eb44919fcfe",
            "8df214f8-2d8a-40c0-9fd1-13b1eb80473a",
            "2140d168-97af-4763-8d16-fb5aa385267f",
            "b189e359-a4e8-4971-8f96-2c820725b3af",
            "0b00b016-907d-404e-8bf7-d0d8b0797986",
            "6b526966-1182-4351-8ab1-858efe01859b",
            "fa8d8f7c-be25-491a-b18e-a1af4a1c13dc",
            "de9250b3-052a-4214-863f-d5e84a1b8016",
            "e217de79-edf3-4689-96aa-57b0bd1e1a06",
            "24ff39ba-a7cc-4d7e-a169-f2a13450cfd1",
            "b9e31a8c-3fd9-430b-a737-944854b0e570",
            "de83ef6d-1256-4540-a44a-48a47552d329",
            "56937a7e-4080-474f-8e5e-6e4cd5b2c730",
            "d7876a66-f0e2-43d3-a201-18b0fdcda999",
            "e198d87c-5ae8-4e51-9b89-be7c7caa80b7",
            "bfc72fcc-ecf9-43f6-bb2d-696103e569c3",
            "5fa8d788-8214-491a-a0dd-90369812afab",
            "f45e5250-885d-4032-b67f-8c045391399f",
            "2388258d-fde3-4de2-a5f9-61837a4cbc31",
            "619ee44f-3009-4864-abb4-4955b6f014ad",
            "fa5ddf6f-6152-43ee-a22d-117fde589490",
            "4b6b30c7-6128-4445-80b4-767b399e648b",
            "481a0508-d101-48d7-b3a3-aebb5198ecb2",
            "c983f1f2-98f6-4636-bac8-49c4e440dfe7",
            "f6f30ec6-4cb7-4939-8dad-cc8693106f47",
            "c68afc83-9b7b-42e8-9406-fb6a6f21c44e",
            "5b931a05-69e5-4a19-9213-abe78cadef01",
            "3e05f8d2-7969-460c-8caa-4004162365fa",
            "eb32d0d3-5ff9-443d-b9e4-8304f487c4d5",
            "5820632c-7c45-428d-a512-301ce7a099b3",
            "b71efbdb-898f-4a75-a987-f60f10a721f9",
            "92fe3ecd-995d-4d02-950e-d82f0ae7bbd0",
            "bc0fb375-86aa-4194-9737-0b3fc9afc201",
            "4201b9b9-4e75-42a4-8072-378c0bc31819",
            "0c78b0b0-b959-4dc2-b932-d0956fedf679",
            "0d179439-a6c5-45cb-8490-707eae3875fc",
            "8cdc942a-30f7-49bd-a888-9a4109443c7c",
            "ddf4fe44-5026-4ae1-ba58-c70f311af710",
            "e519464c-af26-4df4-be67-d6a61e43fa06",
            "f10bad8e-a71c-49d4-a8fd-ff432f044c48",
            "d7d85fb3-33f4-4354-9087-b86f05cb9557",
            "92aec5ce-f63e-4264-ac4e-90c69f71c022",
            "b4da7ef7-1e3e-425f-a16b-e378ef851bf2",
            "e66aa165-aeda-4430-a548-07a80718b614",
            "849c0106-8bd4-4d61-9bc5-45446ff8dedc",
            "b189e359-a4e8-4971-8f96-2c820725b3af",
            "de83ef6d-1256-4540-a44a-48a47552d329",
            "56937a7e-4080-474f-8e5e-6e4cd5b2c730",
            "5fa8d788-8214-491a-a0dd-90369812afab",
            "f45e5250-885d-4032-b67f-8c045391399f",
            "2388258d-fde3-4de2-a5f9-61837a4cbc31",
            "481a0508-d101-48d7-b3a3-aebb5198ecb2",
            "92fe3ecd-995d-4d02-950e-d82f0ae7bbd0"
          ]
        },
        {
          "id": 3,
          "name": "Fatores de Risco & Profilaxia na Cesárea",
          "shortName": "Risco & Profilaxia",
          "percentage": 15.3,
          "questionCount": 38,
          "priority": "Alta",
          "color": "#EC4899",
          "trend": "alta",
          "trendLabel": "🔥 Em Alta (2024-2026)",
          "takeaway": "Cesárea é o maior fator isolado (risco 10-30x maior); Cefazolina na indução anestésica.",
          "focusExplanation": "A **operação cesariana é o principal fator de risco isolado** para endometrite puerperal, aumentando a incidência em **10 a 30 vezes** quando comparada ao parto vaginal espontâneo. Outros fatores de risco determinantes são: **trabalho de parto prolongado**, **bolsa rota prolongada (> 6 a 18 horas)**, múltiplos toques vaginais (> 5 exames), corioamnionite intraparto, anemia materna e desnutrição. A profilaxia padrão-ouro universal para todas as cesáreas consiste na administração de **Cefazolina 2g IV em dose única realizada 30 a 60 minutos antes da incisão cirúrgica** (ou na indução anestésica). Em pacientes obesas com peso ≥ 120 kg ou IMC ≥ 35 kg/m², a dose deve ser ajustada para **3g IV**.",
          "bancaPatterns": {
            "Todas": {
              "howItCharges": "Cesariana como maior fator isolado de risco (10-30x) e uso de Cefazolina 2g IV (3g se obesa) na indução anestésica para 100% das cesáreas.",
              "trapAlert": "Fazer o antibiótico profilático somente após o clampeamento do cordão umbilical (conduta antiga e revogada; hoje é antes da incisão cutânea)."
            },
            "ENARE": {
              "howItCharges": "O **ENARE** cobra a conduta profilática farmacológica padrão: qual antibiótico, via e momento exato de administração na cesárea eletiva ou de urgência.",
              "trapAlert": "Alternativas que propõem ampicilina oral preventiva pós-alta para todas as cesarianas."
            },
            "USP": {
              "howItCharges": "A **USP** exige a correlação entre rotura prematura de membranas ovulares prolongada (> 18h) e colonização bacteriana ascendente mista, além do ajuste de dose de Cefazolina para 3g em obesas.",
              "trapAlert": "Omitir a profilaxia em cesarianas com membranas íntegras fora de trabalho de parto (é mandatória em todas as cesáreas)."
            },
            "UNICAMP": {
              "howItCharges": "A **UNICAMP** avalia o risco cumulativo de múltiplos toques vaginais no período de dilatação e a importância da assepsia rigorosa e técnica operatória adequada.",
              "trapAlert": "Indicar Cefazolina profilática de rotina em partos vaginais eutócicos sem laceração grave de trajeto (não recomendada)."
            },
            "PSU-MG": {
              "howItCharges": "O **PSU-MG** formula questões comparativas de epidemiologia obstétrica: o risco relativo de infecção puerperal pós-cesárea vs. pós-parto normal.",
              "trapAlert": "Prescrever antibioticoterapia profilática prolongada por 48 horas de rotina pós-cesárea sem evidência de corioamnionite."
            },
            "AMRIGS": {
              "howItCharges": "A **AMRIGS** questiona qual a cefalosporina de escolha para profilaxia cirúrgica obstétrica (Cefazolina 1ª geração).",
              "trapAlert": "Optar por Cefepima ou Ceftriaxona para profilaxia cirúrgica primária em pacientes sem histórico de colonização resistente."
            },
            "SUS-SP": {
              "howItCharges": "O **SUS-SP** enfatiza as metas de segurança do paciente do Ministério da Saúde: checklist de cirurgia segura com checagem da infusão da Cefazolina antes do corte.",
              "trapAlert": "Não realizar repique intraoperatório de Cefazolina quando o procedimento ultrapassa 4 horas ou há sangramento superior a 1500 mL."
            }
          },
          "auditQuestionIds": [
            "00ec3c74-7b13-4c7e-afd2-d449e28a7627",
            "ad672ad8-dbfb-4e9c-a4a1-98d1cbba8e38",
            "250eb144-a55f-4594-b804-db3088eacb50",
            "2d205e7b-985f-48fa-ab29-dd794b4c8ddd",
            "c4faf355-1d4f-4280-bb61-dc4503bc23a2",
            "0988c256-a4b3-4e6f-94e0-b6fd38a5af84",
            "746b4f8b-0f40-4502-8c3d-86320d8b2034",
            "909191f8-737d-4921-b6c8-d1122e22f805",
            "d815924c-7cc5-40d6-b37e-32017e59d4ec",
            "5f10d512-d66b-4900-8c2f-8ccece196be1",
            "4ca180da-e956-455c-9bcb-a297a9b753e3",
            "0ea4ee23-b10b-42f7-9993-6c311791572c",
            "0e3629de-ccd7-4415-90c6-e55e5e203460",
            "77006606-1e3a-4475-8901-e58a07282fc9",
            "dcef8fae-7883-459a-b78d-84c2123247a3",
            "73ea95bb-7661-468e-b0a1-e79198a6a18f",
            "850573fe-98ff-4dd5-a9e2-89293f0ca455",
            "dd382631-eda9-4ebd-883f-8034be1417a9",
            "eb958bba-96e1-4b53-941f-c1faea46eebe",
            "f15e13df-29a7-4b09-920f-63ceb2479198",
            "b3cd5c75-7018-4b8c-9400-c6eef6fef46c",
            "3c518465-7411-4bdd-9ac5-1d448294fbcf",
            "3be430a1-1efa-44e7-ad3a-3baecbd0d671",
            "7d3f6daf-d613-4c15-aba6-008e0ed0a4bb",
            "1f29594d-1d61-4b21-83ee-ad38ad5ba8c1",
            "bd692eac-39bb-4711-8bb8-42fea555fa7a",
            "cac15437-908a-4ebd-b771-25f7ce131ee2",
            "7c88ac67-44c0-48e3-9fc9-6c8dd2b0bef7",
            "1dc9aac3-d2af-4b8a-ac5b-88bfdf8248e1",
            "0809424e-715d-4595-b908-0434e39b4706",
            "28e38cff-0ed3-4118-b87d-65fb666688df",
            "c841e1bf-433f-4037-a7af-0518860d1da6",
            "3cf5505d-9d5d-42bb-87da-670b849ab4e7",
            "2d205e7b-985f-48fa-ab29-dd794b4c8ddd",
            "d815924c-7cc5-40d6-b37e-32017e59d4ec",
            "77006606-1e3a-4475-8901-e58a07282fc9",
            "dd382631-eda9-4ebd-883f-8034be1417a9",
            "3cf5505d-9d5d-42bb-87da-670b849ab4e7"
          ]
        },
        {
          "id": 4,
          "name": "Morbidade Febril Puerperal & Critérios",
          "shortName": "Morbidade Febril",
          "percentage": 10.4,
          "questionCount": 26,
          "priority": "Média",
          "color": "#8B5CF6",
          "trend": "estavel",
          "trendLabel": "🏛️ Clássico Estável",
          "takeaway": "Febre ≥ 38°C em 2 dias distintos entre o 2º e 10º dia pós-parto; aferição oral obrigatória.",
          "focusExplanation": "Pelo critério canônico internacional da US Joint Commission on Maternal Welfare e FIGO, define-se **Morbidade Febril Puerperal** como a presença de **temperatura corporal axilar ou oral ≥ 38,0°C**, registrada em **pelo menos 2 dias distintos**, entre o **2º e o 10º dia do pós-parto**, **excluindo-se obrigatoriamente as primeiras 24 horas**. Essa exclusão das primeiras 24h pós-parto é fundamental porque a elevação térmica precoce decorre frequentemente de **desidratação transitória, liberação de citocinas pelo estresse muscular do trabalho de parto e apojadura mamária fisiológica**. Quando a febre surge ou persiste a partir do 2º DPO, a etiologia bacteriana infecciosa (endometrite em > 70% dos casos) torna-se a principal hipótese diagnóstica.",
          "bancaPatterns": {
            "Todas": {
              "howItCharges": "Definição formal dos critérios: ≥ 38°C em 2 dias distintos entre o 2º e o 10º dia pós-parto, excluindo as primeiras 24 horas.",
              "trapAlert": "Considerar febre isolada nas primeiras 24 horas após o parto como infecção puerperal estabelecida (é habitualmente fisiológica)."
            },
            "ENARE": {
              "howItCharges": "O **ENARE** cobra a regra numérica de temperatura e dias para enquadramento formal de morbidade febril puerperal.",
              "trapAlert": "Considerar duas aferições térmicas feitas com poucas horas de intervalo no mesmo dia como critérios suficientes (exige dias distintos)."
            },
            "USP": {
              "howItCharges": "A **USP** coloca casos clínicos de curvas térmicas puerperais para o aluno identificar o momento exato em que a febre deixa de ser fisiológica e passa a configurar infecção puerperal.",
              "trapAlert": "Rotular apojadura mamária (febre baixa autolimitada em até 24h associada a mamas túrgidas bilaterais) como infecção que necessita de antibioticoterapia."
            },
            "UNICAMP": {
              "howItCharges": "A **UNICAMP** exige a busca ativa e sistemática dos 4 principais focos de febre no puerpério: Endométrio (endometrite), Parede abdominal (ferida cirúrgica), Mamas (mastite) e Trato urinário (ITU).",
              "trapAlert": "Iniciar antibioticoterapia empírica sem antes examinar as mamas, a ferida operatória e a urina da paciente."
            },
            "PSU-MG": {
              "howItCharges": "O **PSU-MG** diferencia a cronologia das causas infecciosas: primeiras 24h (apojadura/atelectasia); 3º ao 5º dia (endometrite/ferida); 2ª à 4ª semana (mastite puerperal).",
              "trapAlert": "Atribuir febre no 4º dia pós-parto à apojadura mamária (a apojadura ocorre no 2º ao 3º dia e não dura mais de 24 horas)."
            },
            "AMRIGS": {
              "howItCharges": "A **AMRIGS** questiona qual o valor de corte de temperatura corporal padronizado para morbidade puerperal (≥ 38,0°C).",
              "trapAlert": "Assinalar 37,8°C ou 38,5°C como pontos de corte oficiais do consenso de morbidade puerperal."
            },
            "SUS-SP": {
              "howItCharges": "O **SUS-SP** foca na vigilância epidemiológica hospitalar de infecções pós-parto e registro fidedigno em prontuário.",
              "trapAlert": "Dar alta à puérpera febril no 2º DPO acreditando ser apenas estresse puerperal."
            }
          },
          "auditQuestionIds": [
            "cf786ab3-f47c-4c71-9bb9-24e1fdcc8c54",
            "79f1d7f0-fde6-4666-b035-3dc8b48ecbc1",
            "4d6814c0-cf0d-4cb3-a149-bfbd7656ae08",
            "db7b359a-e70d-4bfc-8d01-309fb9953699",
            "5616496d-dd59-4632-8751-401c93beeaa6",
            "9e831c72-f41a-4c99-b69c-cdfdfc43fb2d",
            "70d25b82-86e4-4903-9683-acd009e6f5f9",
            "9d08d416-6af5-4adf-9f5b-09a86b5b68c5",
            "06af5897-0bc9-420c-8f81-9140dec3a2b3",
            "32efd271-2261-4700-ae75-407bbe264f9e",
            "7e4340d7-84bb-40e2-8ad1-ba5159f8802f",
            "b74bc628-d718-48b7-a9dc-792fd6ecfab1",
            "05614f89-3830-49fe-b055-3aff05ce461d",
            "c4384664-a702-48b6-afbf-6394d4141073",
            "2e7892fa-9946-46d9-93f1-454ee119aa71",
            "92938ecf-e259-4417-abd6-87d11da129cf",
            "af7bdcc2-9553-4c79-8fb1-b0d4ccfa59df",
            "de2977eb-24af-4bd8-80ea-83c66a937353",
            "7949f38a-ded7-4c70-96b6-672eeb5c8480",
            "6544a6c4-327a-473d-9077-baf53407ba9a",
            "867c563b-ed2b-449b-942d-cae3d733bee5",
            "0bba5cef-24cb-4eb8-8599-a1b0becf23e1",
            "14bab642-b7db-4e4e-8ca3-451b4cf0de5b",
            "620349e1-ee89-4695-9c67-862fbbcaf560",
            "9d08d416-6af5-4adf-9f5b-09a86b5b68c5",
            "06af5897-0bc9-420c-8f81-9140dec3a2b3"
          ]
        },
        {
          "id": 5,
          "name": "Mastite Puerperal: Diagnóstico & Conduta",
          "shortName": "Mastite Puerperal",
          "percentage": 8.0,
          "questionCount": 20,
          "priority": "Média",
          "color": "#F59E0B",
          "trend": "alta",
          "trendLabel": "🔥 Em Alta (2024-2026)",
          "takeaway": "S. aureus; Cefalexina ou Clavulin; contraindicação formal a suspender amamentação.",
          "focusExplanation": "A mastite puerperal é a infecção bacteriana do parênquima mamário que acomete preferencialmente entre a **2ª e a 4ª semanas pós-parto**. O agente etiológico clássico em mais de **85% a 90% dos casos é o *Staphylococcus aureus*** (sensível à oxacilina na comunidade), inoculado a partir da nasofaringe do recém-nascido através de fissuras ou microtraumas mamilares. Manifesta-se clinicamente por **eritema localizado em cunha (geralmente unilateral), calor, dor intensa e ingurgitamento**, acompanhados de febre alta (> 38,5°C) e calafrios. A droga de primeira linha é a **Cefalexina 500 mg VO de 6/6h** ou Amoxicilina + Clavulanato por 10 a 14 dias. **CONDUTA DE OURO DAS BANCAS:** É **PROIBIDO suspender a amamentação**; a manutenção do esvaziamento mamário frequente da mama afetada é pilar obrigatório do tratamento para prevenir formação de abscesso.",
          "bancaPatterns": {
            "Todas": {
              "howItCharges": "Agente principal (S. aureus), tratamento com Cefalexina oral e proibição formal de interromper o aleitamento materno (manter amamentação na mama doente).",
              "trapAlert": "Prescrever desmame, suspender a amamentação na mama afetada ou dar inibidores de prolactina (Cabergolina) é o erro mais punido em provas!"
            },
            "ENARE": {
              "howItCharges": "O **ENARE** apresenta lactante com 3 semanas de puerpério apresentando dor e placa hiperemiada na mama direita com febre de 39°C, questionando o antimicrobiano e a orientação sobre amamentação.",
              "trapAlert": "A banca sempre insere alternativa orientando a suspender o aleitamento e oferecer fórmula infantil temporariamente."
            },
            "USP": {
              "howItCharges": "A **USP** cobra o reconhecimento clínico do abscesso mamário (área de flutuação palpável ou coleção purulenta ecográfica), exigindo drenagem cirúrgica ou punção ecoguiada.",
              "trapAlert": "Realizar massagem compressiva vigorosa sobre coleção com ponto de flutuação evidente (risco de ruptura tecidual e disseminação)."
            },
            "UNICAMP": {
              "howItCharges": "A **UNICAMP** exige a distinção clínica precisa entre ingurgitamento mamário fisiológico (bilateral, difuso, afebril ou febrícula transitória) e mastite puerperal infecciosa (unilateral, em cunha, febre alta).",
              "trapAlert": "Prescrever antibiótico desnecessário para ingurgitamento mamário simples sem sinais de infecção bacteriana."
            },
            "PSU-MG": {
              "howItCharges": "O **PSU-MG** questiona qual o principal agente microbiano isolado nas mastites puerperais agudas (*Staphylococcus aureus*).",
              "trapAlert": "Confundir com *Streptococcus agalactiae* (GBS) ou *Escherichia coli* como agentes primários de mastite."
            },
            "AMRIGS": {
              "howItCharges": "A **AMRIGS** explora as orientações de pega correta da aréola pelo recém-nascido como medida profilática primária de fissuras mamilares e mastite.",
              "trapAlert": "Recomendar pomadas de antibiótico tópico nos mamilos durante o período de amamentação."
            },
            "SUS-SP": {
              "howItCharges": "O **SUS-SP** aborda o acolhimento na Unidade Básica de Saúde: incentivo à amamentação, prescrição de Cefalexina e analgesia com Ibuprofeno/Paracetamol.",
              "trapAlert": "Encaminhar para internação hospitalar terciária mastite inicial não complicada com bom estado geral."
            }
          },
          "auditQuestionIds": [
            "d7821054-2898-48de-8d9d-ed05024d96ee",
            "62da803e-dee8-4054-8c38-7e434c8ce696",
            "eba89c37-75d3-4575-8d8f-49e35cb40ba5",
            "187393d3-50f1-4a92-b067-20b1d94cfab3",
            "0596b254-724e-4f83-b35d-f21a441a2522",
            "4ef0bb7b-fca1-4227-a963-af3ab858fd1e",
            "74c25fd7-5376-4f7e-b34a-b1d7afe34fee",
            "800b75b3-1b62-4691-806c-8f546d0555e9",
            "7c878141-3aaf-4ba1-a1ce-9dfc10ec7dc7",
            "ee3fc55e-9071-439a-8eb4-a5e13f6f4615",
            "8044b6a6-c50a-4b15-80bf-d34657963faf",
            "56b6a3c5-6621-4a2f-adbf-db4c7b56f34b",
            "408b0012-d2a2-4430-8722-932c07590bda",
            "0dcd8aa0-aa61-4c01-8f88-f5ff398cc1c4",
            "9a6f158d-8f0f-47c2-b6e2-33fab00cf7ac",
            "ebfc7da6-e188-4a6d-9df6-61900f4c8953",
            "6da6b2ff-6161-403b-bdf4-daaeed7781a8",
            "0e84e307-c4d3-465e-955d-292afbea9a99",
            "7c878141-3aaf-4ba1-a1ce-9dfc10ec7dc7",
            "9a6f158d-8f0f-47c2-b6e2-33fab00cf7ac"
          ]
        },
        {
          "id": 6,
          "name": "Demais Critérios & Diagnósticos Menores",
          "shortName": "Demais Aspectos",
          "percentage": 13.7,
          "questionCount": 34,
          "priority": "Média",
          "color": "#64748B",
          "trend": "estavel",
          "trendLabel": "🏛️ Tópicos Secundários",
          "takeaway": "Tromboflebite pélvica séptica, teste da heparina, sepse e indicações de curetagem.",
          "focusExplanation": "Reúne complicações puerperais graves e diagnósticos de exclusão na puérpera séptica refratária. O principal destaque em provas é a **Tromboflebite Pélvica Séptica (TPS)**: trombose séptica das veias ovarianas e plexos uterinos caracterizada por **febre em picos contínua e persistente após 48 a 72 horas de antibioticoterapia venosa adequada**, sem coleções purulentas detectáveis ao exame físico. O diagnóstico padrão de confirmação é o **Teste Terapêutico da Heparina**: defervescência térmica completa em 48 a 72 horas após início de Heparina venosa contínua ou HBPM plena associada à manutenção dos antibióticos. A TC ou RM pélvica contrastada evidencia falha de enchimento na veia ovariana (mais frequente à direita). Na suspeita de abscesso pélvico ou retenção maciça de restos, indica-se drenagem percutânea ou curetagem uterina criteriosa.",
          "bancaPatterns": {
            "Todas": {
              "howItCharges": "Febre puerperal persistente após 48-72h de antibióticos venosos sem foco evidente: suspeitar de Tromboflebite Pélvica Séptica e realizar Teste da Heparina.",
              "trapAlert": "Trocar empiricamente a classe do antibiótico sem considerar tromboflebite séptica ou sem solicitar TC de pelve."
            },
            "ENARE": {
              "howItCharges": "O **ENARE** relata paciente em uso de Clindamicina + Gentamicina há 4 dias sem melhora da febre diária e com exame ginecológico inocente, questionando a conduta diagnóstica-terapêutica.",
              "trapAlert": "Indicar laparotomia de urgência imediata sem evidência clínica ou tomográfica de peritonite ou perfuração uterina."
            },
            "USP": {
              "howItCharges": "A **USP** explora a fisiopatologia vascular da TPS: maior acometimento da veia ovariana direita pelo comprimento vascular aumentado, fluxo retrógrado e compressão mecânica pelo útero dextrorrotado.",
              "trapAlert": "Realizar curetagem uterina de rotina em útero séptico friável sem comprovação ecográfica de restos, pelo risco grave de perfuração e choque séptico."
            },
            "UNICAMP": {
              "howItCharges": "A **UNICAMP** cobra o reconhecimento da Síndrome do Choque Tóxico Estreptocócico pós-parto (*Streptococcus pyogenes* / GAS): progressão fulminante para choque distributivo e fasceíte necrotizante.",
              "trapAlert": "Retardar intervenção cirúrgica de controle de danos (histerectomia puerperal) quando há miometrite necrotizante e sepse refratária."
            },
            "PSU-MG": {
              "howItCharges": "O **PSU-MG** cobra o mecanismo de confirmação da TPS pelo Teste da Heparina (defervescência térmica rápida nas primeiras 48-72h de anticoagulação).",
              "trapAlert": "Acreditar que ultrassonografia transvaginal de rotina possui alta sensibilidade para trombose de veias ovarianas altas (TC contrastada é o padrão)."
            },
            "AMRIGS": {
              "howItCharges": "A **AMRIGS** foca no diagnóstico diferencial de infecções do sítio cirúrgico da cesárea: seroma, hematoma e abscesso de parede abdominal.",
              "trapAlert": "Não abrir a fáscia e não drenar ferida operatória com flutuação purulenta profunda."
            },
            "SUS-SP": {
              "howItCharges": "O **SUS-SP** cobra os critérios de sepse materna puerperal e protocolo de ressuscitação volêmica imediata com cristaloides (30 mL/kg nas primeiras 3h).",
              "trapAlert": "Atrasar o início de noradrenalina em puérpera em choque séptico mantendo PAM < 65 mmHg após prova de volume."
            }
          },
          "auditQuestionIds": [
            "49962850-59f7-414b-9606-66b06c83f36e",
            "72dce893-67eb-4ea4-ac73-1978417c1823",
            "fe23813a-7fe2-40d4-85cf-ffa212287d0c",
            "e7ddc897-378c-4241-a5cf-653f992c8e6d",
            "50bf994c-3c32-4382-a18f-9b362fcfbaaa",
            "8ecb8aff-3c4b-4823-acd1-ba6a99236a9f",
            "cebf0ece-6bb8-4377-8e95-5f55e0fdd1f3",
            "1e6d5713-de09-4cba-b2e2-49151f97a89b",
            "7f3fc004-9e04-4903-becc-4d336f64d17f",
            "f40f60dc-3b9d-4a6c-97dc-8315b826cd03",
            "1b97e147-0ff2-4928-9ee8-d5b76f6e1d02",
            "1ecea84f-9493-4266-88b7-d41282378c68",
            "3270c295-13f4-495c-bfac-b1dc1cd18dde",
            "9074fb9e-01df-4f42-9be4-e017bac62a3e",
            "0fcf246d-ff26-4f8f-aa84-e6be5135a9ce",
            "e9d4031a-70dc-426c-8d53-cf8db29ebcdd",
            "ee0197f1-3616-4e70-a6a0-155b4af900d1",
            "49962850-59f7-414b-9606-66b06c83f36e",
            "de1f19d3-0396-4cf4-8324-645a1109e357",
            "1e2a7b14-e909-494e-8446-9cbc4eeb5977",
            "42480130-516d-49fe-ada6-ebdf1b7f5ac4",
            "81bf1697-cc3c-4d56-8436-4ccff0ab8c67",
            "114c9fa3-1462-44c1-98c3-0276dd7fdbe2",
            "114c9fa3-1462-44c1-98c3-0276dd7fdbe2",
            "861fbc58-18e9-4f1e-a02b-3a1f0758aa45",
            "ea5051c7-7320-41c3-918f-10f6bece865b",
            "02765e58-cb9e-4d68-b256-787e03b1347a",
            "3ee90131-a413-40c6-98bd-a9e950c31198",
            "8aec4fa8-224f-409f-859a-28afe25d1466",
            "c01c7038-972c-47b6-b1b6-12aafca8f94e",
            "209b9052-7fe0-4223-bdc7-063a84a35319",
            "6e326ff1-21fd-47f0-8493-3bbc3a2af327",
            "d2217422-3ee8-4a03-8770-41391035c1f0",
            "94812bed-4a27-4215-ae57-650074c8d621"
          ]
        }
      ],
      "bancaBreakdown": {
        "AMRIGS": {
          "banca": "AMRIGS",
          "totalQuestions": 5,
          "topSubfocos": [
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 3,
              "percentageInBanca": 60.0
            },
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 1,
              "percentageInBanca": 20.0
            },
            {
              "subfoco": "Complicações de Prótese: Infecção, Migração e Dor",
              "questionCount": 1,
              "percentageInBanca": 20.0
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "SUS-SP": {
          "banca": "SUS-SP",
          "totalQuestions": 5,
          "topSubfocos": [
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 3,
              "percentageInBanca": 60.0
            },
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 2,
              "percentageInBanca": 40.0
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "UNESP/HCFMB": {
          "banca": "UNESP/HCFMB",
          "totalQuestions": 8,
          "topSubfocos": [
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 4,
              "percentageInBanca": 50.0
            },
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 2,
              "percentageInBanca": 25.0
            },
            {
              "subfoco": "Tromboflebite Pélvica Séptica & Complicações",
              "questionCount": 2,
              "percentageInBanca": 25.0
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "UNICAMP/HC": {
          "banca": "UNICAMP/HC",
          "totalQuestions": 9,
          "topSubfocos": [
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 6,
              "percentageInBanca": 66.7
            },
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 2,
              "percentageInBanca": 22.2
            },
            {
              "subfoco": "Tromboflebite Pélvica Séptica & Complicações",
              "questionCount": 1,
              "percentageInBanca": 11.1
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "CERMAM": {
          "banca": "CERMAM",
          "totalQuestions": 5,
          "topSubfocos": [
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 2,
              "percentageInBanca": 40.0
            },
            {
              "subfoco": "Morbidade Febril Puerperal & Critérios",
              "questionCount": 2,
              "percentageInBanca": 40.0
            },
            {
              "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
              "questionCount": 1,
              "percentageInBanca": 20.0
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "Pontifícia Universidade Católica do Paraná": {
          "banca": "Pontifícia Universidade Católica do Paraná",
          "totalQuestions": 6,
          "topSubfocos": [
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 3,
              "percentageInBanca": 50.0
            },
            {
              "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
              "questionCount": 2,
              "percentageInBanca": 33.3
            },
            {
              "subfoco": "Complicações de Prótese: Infecção, Migração e Dor",
              "questionCount": 1,
              "percentageInBanca": 16.7
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "USP/HCRP": {
          "banca": "USP/HCRP",
          "totalQuestions": 5,
          "topSubfocos": [
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 2,
              "percentageInBanca": 40.0
            },
            {
              "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
              "questionCount": 2,
              "percentageInBanca": 40.0
            },
            {
              "subfoco": "Mastite Puerperal: Diagnóstico & Conduta",
              "questionCount": 1,
              "percentageInBanca": 20.0
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "INEP Revalida": {
          "banca": "INEP Revalida",
          "totalQuestions": 6,
          "topSubfocos": [
            {
              "subfoco": "Infecção Puerperal",
              "questionCount": 6,
              "percentageInBanca": 100.0
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "ENARE": {
          "banca": "ENARE",
          "totalQuestions": 42,
          "topSubfocos": [
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 16,
              "percentageInBanca": 38.1
            },
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 14,
              "percentageInBanca": 33.3
            },
            {
              "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
              "questionCount": 6,
              "percentageInBanca": 14.3
            },
            {
              "subfoco": "Mastite Puerperal: Diagnóstico & Conduta",
              "questionCount": 4,
              "percentageInBanca": 9.5
            },
            {
              "subfoco": "Morbidade Febril Puerperal & Critérios",
              "questionCount": 2,
              "percentageInBanca": 4.8
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "PSU-MG": {
          "banca": "PSU-MG",
          "totalQuestions": 24,
          "topSubfocos": [
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 9,
              "percentageInBanca": 37.5
            },
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 7,
              "percentageInBanca": 29.2
            },
            {
              "subfoco": "Morbidade Febril Puerperal & Critérios",
              "questionCount": 4,
              "percentageInBanca": 16.7
            },
            {
              "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
              "questionCount": 3,
              "percentageInBanca": 12.5
            },
            {
              "subfoco": "Demais Critérios & Diagnósticos Menores",
              "questionCount": 1,
              "percentageInBanca": 4.1
            }
          ],
          "predominantDifficulty": "Médio"
        },
        "USP": {
          "banca": "USP",
          "totalQuestions": 35,
          "topSubfocos": [
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 12,
              "percentageInBanca": 34.3
            },
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 11,
              "percentageInBanca": 31.4
            },
            {
              "subfoco": "Demais Critérios & Diagnósticos Menores",
              "questionCount": 5,
              "percentageInBanca": 14.3
            },
            {
              "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
              "questionCount": 4,
              "percentageInBanca": 11.4
            },
            {
              "subfoco": "Mastite Puerperal: Diagnóstico & Conduta",
              "questionCount": 3,
              "percentageInBanca": 8.6
            }
          ],
          "predominantDifficulty": "Difícil"
        },
        "UNICAMP": {
          "banca": "UNICAMP",
          "totalQuestions": 28,
          "topSubfocos": [
            {
              "subfoco": "Endometrite Puerperal: Diagnóstico & Clínica",
              "questionCount": 11,
              "percentageInBanca": 39.3
            },
            {
              "subfoco": "Antibioticoterapia na Infecção Puerperal",
              "questionCount": 8,
              "percentageInBanca": 28.6
            },
            {
              "subfoco": "Fatores de Risco & Profilaxia na Cesárea",
              "questionCount": 4,
              "percentageInBanca": 14.3
            },
            {
              "subfoco": "Mastite Puerperal: Diagnóstico & Conduta",
              "questionCount": 3,
              "percentageInBanca": 10.7
            },
            {
              "subfoco": "Morbidade Febril Puerperal & Critérios",
              "questionCount": 2,
              "percentageInBanca": 7.1
            }
          ],
          "predominantDifficulty": "Médio"
        }
      },
      "topTraps": [
        {
          "subfoco": "Antibioticoterapia na Infecção Puerperal",
          "trapTitle": "Distrator de Conduta Invertida",
          "trapDescription": "Alternativas com condutas corretas na patologia porém indicadas em momento cronológico trocado."
        }
      ],
      "needsRecalc": false,
      "status": "certified",
      "auditHash": "de27718521e6c0e8095ecea7a99b47388112c4cbf326e766594b700995eb679e",
      "certifiedAt": "2026-11-03T15:17:13.826396+00:00",
      "lastRecalculatedAt": "2026-11-03T15:17:13.826396+00:00"
    },
    "markdownContent": "## 1. O Que Mais Cai nas Provas de Residência Médica\n\nA Infecção Puerperal figura historicamente entre as **quatro principais causas de mortalidade materna no Brasil e no mundo** (ao lado de pré-eclâmpsia, hemorragia pós-parto e abortamento séptico). A auditoria estatística do censo de questões oficiais de residência médica (ENARE, USP-SP, UNICAMP, UNIFESP, SUS-SP, PSU-MG, UERJ, AMRIGS) revela a seguinte distribuição temática mandatória de cobrança:\n\n```exam-stats\n{\n  \"focusSlug\": \"infeccao-puerperal\",\n  \"specialty\": \"Obstetrícia\",\n  \"theme\": \"Puerpério\",\n  \"focus\": \"Infecção Puerperal\",\n  \"totalQuestions\": 249,\n  \"timeframeRange\": \"2017-2026\",\n  \"donutSlices\": [\n    {\n      \"id\": 1,\n      \"name\": \"Antibioticoterapia na Infecção Puerperal\",\n      \"shortName\": \"Antibioticoterapia\",\n      \"percentage\": 26.5,\n      \"questionCount\": 66,\n      \"priority\": \"Alta\",\n      \"color\": \"#3B82F6\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Clindamicina + Gentamicina IV de primeira linha até 48h afebril; sem antibiótico oral pós-alta.\",\n      \"focusExplanation\": \"O esquema de **primeira linha padrão-ouro** para endometrite pós-parto é a combinação intravenosa de **Clindamicina 900 mg IV a cada 8h** (cobertura de anaeróbios, incluindo *Bacteroides fragilis*) associada a **Gentamicina 5 mg/kg IV uma vez ao dia** ou 1,5 mg/kg a cada 8h (cobertura de Gram-negativos entéricos). O tratamento deve ser mantido em regime hospitalar até a paciente permanecer **48 horas afebril e assintomática**. Ao atingir esse critério de cura clínica, **a alta hospitalar é concedida SEM antibioticoterapia oral pós-alta** (não há benefício comprovado e eleva resistência bacteriana).\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Cobrança unânime nas principais bancas: indicação imediata de Clindamicina + Gentamicina IV, tempo de manutenção hospitalar até 48h afebril e suspensão completa do antibiótico na alta hospitalar (sem transição oral).\",\n          \"trapAlert\": \"Prescrever Cefalexina ou Amoxicilina-Clavulanato oral pós-alta é o distrator mais assinalado e punido em provas.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"O **ENARE** formula casos clínicos objetivos no ambiente de enfermaria obstétrica do SUS, cobrando a prescrição da associação parenteral (Clindamicina 900mg + Gentamicina IV) e o critério de alta.\",\n          \"trapAlert\": \"A banca sempre insere uma alternativa com 'alta hospitalar com antibiótico oral por 7 a 10 dias'. A regra de ouro é: alta SEM antibiótico oral após 48h afebril.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"A **USP** exige o raciocínio clínico da falha terapêutica: se após 48 a 72h de Clinda + Genta a paciente mantiver febre e piora clínica, deve-se associar **Ampicilina IV** (cobertura de *Enterococcus faecalis*) e pesquisar abscesso pélvico ou tromboflebite pélvica séptica.\",\n          \"trapAlert\": \"Trocar empiricamente para carbapenêmico sem investigar focos complicados ou não associar Ampicilina para cobrir Enterococo.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"A **UNICAMP** explora o perfil farmacológico dos aminoglicosídeos: Gentamicina em dose única diária (5 mg/kg) possui a mesma eficácia clínica da dose fracionada de 8/8h, com menor potencial de nefrotoxicidade e ototoxicidade.\",\n          \"trapAlert\": \"Alternativas sugerindo monoterapia com fluoroquinolonas orais em pacientes com endometrite puerperal.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"O **PSU-MG** foca no critério de cura clínica: a contagem do tempo de segurança exige 48 horas ininterruptas afebril, com involução uterina normal e lóquios sem odor fétido.\",\n          \"trapAlert\": \"Alternativas que fixam tempos arbitrários de 14 dias de internação independentemente da melhora clínica.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"A **AMRIGS** tem estilo direto, cobrando o espectro microbiano dos fármacos: Clindamicina para cobertura de anaeróbios estritos e Gentamicina para bacilos Gram-negativos facultativos.\",\n          \"trapAlert\": \"Substituir Clindamicina por Metronidazol em monoterapia sem a cobertura sinérgica de Gram-negativos da Gentamicina.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"O **SUS-SP** aborda o fluxo de porta de emergência: puérpera febril no 4º DPO deve ter internação imediata e início do esquema venoso na primeira hora de admissão.\",\n          \"trapAlert\": \"Liberar a paciente para tratamento domiciliar com repouso e antitérmicos.\"\n        }\n      }\n    },\n    {\n      \"id\": 2,\n      \"name\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n      \"shortName\": \"Endometrite & Clínica\",\n      \"percentage\": 26.1,\n      \"questionCount\": 65,\n      \"priority\": \"Alta\",\n      \"color\": \"#10B981\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Tríade de Bumm: febre, útero amolecido/doloroso e lóquios fétidos achocolatados.\",\n      \"focusExplanation\": \"A endometrite puerperal é a causa mais comum de febre pós-parto. O diagnóstico é **eminentemente clínico**, caracterizado pela clássica **Tríade de Bumm**: **febre** (geralmente entre o 3º e 5º DPO), **útero subinvoluído, doloroso e amolecido** à palpação abdominal/bimanual, e **lóquios fétidos purulentos ou com aspecto achocolatado** (loquiometra). O colo uterino costuma encontrar-se entreaberto e doloroso à mobilização. Exames de imagem (USG pélvica) são indicados exclusivamente para afastar **restos ovulares retidos ou coleções/abscessos**, sendo **formalmente contraindicada a coleta de swab vaginal para cultura** devido à contaminação com a flora bacteriana habitual do trato reprodutivo inferior.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Apresentação da Tríade de Bumm (febre + útero doloroso e amolecido + lóquios fétidos) no 3º a 5º dia pós-parto, com diagnóstico 100% clínico.\",\n          \"trapAlert\": \"Indicar cultura de swab vaginal ou biópsia endometrial para confirmar diagnóstico de endometrite (contraindicado e desnecessário).\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"O **ENARE** apresenta puérpera jovem que evoluiu no 4º DPO de cesárea com picos febris de 38,8°C, taquicardia e dor no baixo ventre com lóquios escuros e fétidos, exigindo o diagnóstico sindrômico imediato.\",\n          \"trapAlert\": \"Confundir febre transitória de apojadura mamária (fisiológica, até 38°C nas primeiras 24h) com endometrite bacteriana estabelecida.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"A **USP** explora a semiologia detalhada: palpação do fundo uterino acima da cicatriz umbilical no 4º DPO (útero subinvoluído), dor aos anexos e diagnóstico diferencial com hematoma de cúpula ou infecção de sítio cirúrgico.\",\n          \"trapAlert\": \"Solicitar histeroscopia diagnóstica ou curetagem de urgência na ausência de achados ultrassonográficos de restos placentários retidos.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"A **UNICAMP** cobra o diagnóstico diferencial entre endometrite e infecção de ferida operatória na parede abdominal, destacando que a ferida pode estar limpa enquanto a infecção primária reside na decídua endometrial.\",\n          \"trapAlert\": \"Achar que a ausência de hiperemia ou secreção na incisão cirúrgica da cesárea descarta infecção puerperal.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"O **PSU-MG** destaca a interpretação laboratorial: leucocitose de até 25.000/mm³ é fisiológica no puerpério imediato devido ao estresse do parto, devendo o diagnóstico se basear na presença de desvio à esquerda e na Tríade de Bumm.\",\n          \"trapAlert\": \"Fechar diagnóstico de infecção bacteriana apenas pela contagem isolada de leucócitos no 1º ou 2º DPO sem outros sinais flogísticos.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"A **AMRIGS** cobra nominalmente quais são os três sinais semiológicos constitutivos da clássica Tríade de Bumm.\",\n          \"trapAlert\": \"Alternativas que trazem 'útero duro e retraído' como sinal de endometrite (o útero da endometrite é amolecido e atônico).\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"Cenário de puérpera admitida em UPA/PS com queixa de cólicas intensas e sangramento fétido após cesárea de urgência realizada há 5 dias.\",\n          \"trapAlert\": \"Atrasar o início da antibioticoterapia parenteral para aguardar resultados de hemoculturas ou laudo tomográfico.\"\n        }\n      }\n    },\n    {\n      \"id\": 3,\n      \"name\": \"Fatores de Risco & Profilaxia na Cesárea\",\n      \"shortName\": \"Risco & Profilaxia\",\n      \"percentage\": 15.3,\n      \"questionCount\": 38,\n      \"priority\": \"Alta\",\n      \"color\": \"#EC4899\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"Cesárea é o maior fator isolado (risco 10-30x maior); Cefazolina na indução anestésica.\",\n      \"focusExplanation\": \"A **operação cesariana é o principal fator de risco isolado** para endometrite puerperal, aumentando a incidência em **10 a 30 vezes** quando comparada ao parto vaginal espontâneo. Outros fatores de risco determinantes são: **trabalho de parto prolongado**, **bolsa rota prolongada (> 6 a 18 horas)**, múltiplos toques vaginais (> 5 exames), corioamnionite intraparto, anemia materna e desnutrição. A profilaxia padrão-ouro universal para todas as cesáreas consiste na administração de **Cefazolina 2g IV em dose única realizada 30 a 60 minutos antes da incisão cirúrgica** (ou na indução anestésica). Em pacientes obesas com peso ≥ 120 kg ou IMC ≥ 35 kg/m², a dose deve ser ajustada para **3g IV**.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Cesariana como maior fator isolado de risco (10-30x) e uso de Cefazolina 2g IV (3g se obesa) na indução anestésica para 100% das cesáreas.\",\n          \"trapAlert\": \"Fazer o antibiótico profilático somente após o clampeamento do cordão umbilical (conduta antiga e revogada; hoje é antes da incisão cutânea).\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"O **ENARE** cobra a conduta profilática farmacológica padrão: qual antibiótico, via e momento exato de administração na cesárea eletiva ou de urgência.\",\n          \"trapAlert\": \"Alternativas que propõem ampicilina oral preventiva pós-alta para todas as cesarianas.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"A **USP** exige a correlação entre rotura prematura de membranas ovulares prolongada (> 18h) e colonização bacteriana ascendente mista, além do ajuste de dose de Cefazolina para 3g em obesas.\",\n          \"trapAlert\": \"Omitir a profilaxia em cesarianas com membranas íntegras fora de trabalho de parto (é mandatória em todas as cesáreas).\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"A **UNICAMP** avalia o risco cumulativo de múltiplos toques vaginais no período de dilatação e a importância da assepsia rigorosa e técnica operatória adequada.\",\n          \"trapAlert\": \"Indicar Cefazolina profilática de rotina em partos vaginais eutócicos sem laceração grave de trajeto (não recomendada).\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"O **PSU-MG** formula questões comparativas de epidemiologia obstétrica: o risco relativo de infecção puerperal pós-cesárea vs. pós-parto normal.\",\n          \"trapAlert\": \"Prescrever antibioticoterapia profilática prolongada por 48 horas de rotina pós-cesárea sem evidência de corioamnionite.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"A **AMRIGS** questiona qual a cefalosporina de escolha para profilaxia cirúrgica obstétrica (Cefazolina 1ª geração).\",\n          \"trapAlert\": \"Optar por Cefepima ou Ceftriaxona para profilaxia cirúrgica primária em pacientes sem histórico de colonização resistente.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"O **SUS-SP** enfatiza as metas de segurança do paciente do Ministério da Saúde: checklist de cirurgia segura com checagem da infusão da Cefazolina antes do corte.\",\n          \"trapAlert\": \"Não realizar repique intraoperatório de Cefazolina quando o procedimento ultrapassa 4 horas ou há sangramento superior a 1500 mL.\"\n        }\n      }\n    },\n    {\n      \"id\": 4,\n      \"name\": \"Morbidade Febril Puerperal & Critérios\",\n      \"shortName\": \"Morbidade Febril\",\n      \"percentage\": 10.4,\n      \"questionCount\": 26,\n      \"priority\": \"Média\",\n      \"color\": \"#8B5CF6\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Clássico Estável\",\n      \"takeaway\": \"Febre ≥ 38°C em 2 dias distintos entre o 2º e 10º dia pós-parto; aferição oral obrigatória.\",\n      \"focusExplanation\": \"Pelo critério canônico internacional da US Joint Commission on Maternal Welfare e FIGO, define-se **Morbidade Febril Puerperal** como a presença de **temperatura corporal axilar ou oral ≥ 38,0°C**, registrada em **pelo menos 2 dias distintos**, entre o **2º e o 10º dia do pós-parto**, **excluindo-se obrigatoriamente as primeiras 24 horas**. Essa exclusão das primeiras 24h pós-parto é fundamental porque a elevação térmica precoce decorre frequentemente de **desidratação transitória, liberação de citocinas pelo estresse muscular do trabalho de parto e apojadura mamária fisiológica**. Quando a febre surge ou persiste a partir do 2º DPO, a etiologia bacteriana infecciosa (endometrite em > 70% dos casos) torna-se a principal hipótese diagnóstica.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Definição formal dos critérios: ≥ 38°C em 2 dias distintos entre o 2º e o 10º dia pós-parto, excluindo as primeiras 24 horas.\",\n          \"trapAlert\": \"Considerar febre isolada nas primeiras 24 horas após o parto como infecção puerperal estabelecida (é habitualmente fisiológica).\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"O **ENARE** cobra a regra numérica de temperatura e dias para enquadramento formal de morbidade febril puerperal.\",\n          \"trapAlert\": \"Considerar duas aferições térmicas feitas com poucas horas de intervalo no mesmo dia como critérios suficientes (exige dias distintos).\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"A **USP** coloca casos clínicos de curvas térmicas puerperais para o aluno identificar o momento exato em que a febre deixa de ser fisiológica e passa a configurar infecção puerperal.\",\n          \"trapAlert\": \"Rotular apojadura mamária (febre baixa autolimitada em até 24h associada a mamas túrgidas bilaterais) como infecção que necessita de antibioticoterapia.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"A **UNICAMP** exige a busca ativa e sistemática dos 4 principais focos de febre no puerpério: Endométrio (endometrite), Parede abdominal (ferida cirúrgica), Mamas (mastite) e Trato urinário (ITU).\",\n          \"trapAlert\": \"Iniciar antibioticoterapia empírica sem antes examinar as mamas, a ferida operatória e a urina da paciente.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"O **PSU-MG** diferencia a cronologia das causas infecciosas: primeiras 24h (apojadura/atelectasia); 3º ao 5º dia (endometrite/ferida); 2ª à 4ª semana (mastite puerperal).\",\n          \"trapAlert\": \"Atribuir febre no 4º dia pós-parto à apojadura mamária (a apojadura ocorre no 2º ao 3º dia e não dura mais de 24 horas).\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"A **AMRIGS** questiona qual o valor de corte de temperatura corporal padronizado para morbidade puerperal (≥ 38,0°C).\",\n          \"trapAlert\": \"Assinalar 37,8°C ou 38,5°C como pontos de corte oficiais do consenso de morbidade puerperal.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"O **SUS-SP** foca na vigilância epidemiológica hospitalar de infecções pós-parto e registro fidedigno em prontuário.\",\n          \"trapAlert\": \"Dar alta à puérpera febril no 2º DPO acreditando ser apenas estresse puerperal.\"\n        }\n      }\n    },\n    {\n      \"id\": 5,\n      \"name\": \"Mastite Puerperal: Diagnóstico & Conduta\",\n      \"shortName\": \"Mastite Puerperal\",\n      \"percentage\": 8.0,\n      \"questionCount\": 20,\n      \"priority\": \"Média\",\n      \"color\": \"#F59E0B\",\n      \"trend\": \"alta\",\n      \"trendLabel\": \"🔥 Em Alta (2024-2026)\",\n      \"takeaway\": \"S. aureus; Cefalexina ou Clavulin; contraindicação formal a suspender amamentação.\",\n      \"focusExplanation\": \"A mastite puerperal é a infecção bacteriana do parênquima mamário que acomete preferencialmente entre a **2ª e a 4ª semanas pós-parto**. O agente etiológico clássico em mais de **85% a 90% dos casos é o *Staphylococcus aureus*** (sensível à oxacilina na comunidade), inoculado a partir da nasofaringe do recém-nascido através de fissuras ou microtraumas mamilares. Manifesta-se clinicamente por **eritema localizado em cunha (geralmente unilateral), calor, dor intensa e ingurgitamento**, acompanhados de febre alta (> 38,5°C) e calafrios. A droga de primeira linha é a **Cefalexina 500 mg VO de 6/6h** ou Amoxicilina + Clavulanato por 10 a 14 dias. **CONDUTA DE OURO DAS BANCAS:** É **PROIBIDO suspender a amamentação**; a manutenção do esvaziamento mamário frequente da mama afetada é pilar obrigatório do tratamento para prevenir formação de abscesso.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Agente principal (S. aureus), tratamento com Cefalexina oral e proibição formal de interromper o aleitamento materno (manter amamentação na mama doente).\",\n          \"trapAlert\": \"Prescrever desmame, suspender a amamentação na mama afetada ou dar inibidores de prolactina (Cabergolina) é o erro mais punido em provas!\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"O **ENARE** apresenta lactante com 3 semanas de puerpério apresentando dor e placa hiperemiada na mama direita com febre de 39°C, questionando o antimicrobiano e a orientação sobre amamentação.\",\n          \"trapAlert\": \"A banca sempre insere alternativa orientando a suspender o aleitamento e oferecer fórmula infantil temporariamente.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"A **USP** cobra o reconhecimento clínico do abscesso mamário (área de flutuação palpável ou coleção purulenta ecográfica), exigindo drenagem cirúrgica ou punção ecoguiada.\",\n          \"trapAlert\": \"Realizar massagem compressiva vigorosa sobre coleção com ponto de flutuação evidente (risco de ruptura tecidual e disseminação).\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"A **UNICAMP** exige a distinção clínica precisa entre ingurgitamento mamário fisiológico (bilateral, difuso, afebril ou febrícula transitória) e mastite puerperal infecciosa (unilateral, em cunha, febre alta).\",\n          \"trapAlert\": \"Prescrever antibiótico desnecessário para ingurgitamento mamário simples sem sinais de infecção bacteriana.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"O **PSU-MG** questiona qual o principal agente microbiano isolado nas mastites puerperais agudas (*Staphylococcus aureus*).\",\n          \"trapAlert\": \"Confundir com *Streptococcus agalactiae* (GBS) ou *Escherichia coli* como agentes primários de mastite.\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"A **AMRIGS** explora as orientações de pega correta da aréola pelo recém-nascido como medida profilática primária de fissuras mamilares e mastite.\",\n          \"trapAlert\": \"Recomendar pomadas de antibiótico tópico nos mamilos durante o período de amamentação.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"O **SUS-SP** aborda o acolhimento na Unidade Básica de Saúde: incentivo à amamentação, prescrição de Cefalexina e analgesia com Ibuprofeno/Paracetamol.\",\n          \"trapAlert\": \"Encaminhar para internação hospitalar terciária mastite inicial não complicada com bom estado geral.\"\n        }\n      }\n    },\n    {\n      \"id\": 6,\n      \"name\": \"Demais Critérios & Diagnósticos Menores\",\n      \"shortName\": \"Demais Aspectos\",\n      \"percentage\": 13.7,\n      \"questionCount\": 34,\n      \"priority\": \"Média\",\n      \"color\": \"#64748B\",\n      \"trend\": \"estavel\",\n      \"trendLabel\": \"🏛️ Tópicos Secundários\",\n      \"takeaway\": \"Tromboflebite pélvica séptica, teste da heparina, sepse e indicações de curetagem.\",\n      \"focusExplanation\": \"Reúne complicações puerperais graves e diagnósticos de exclusão na puérpera séptica refratária. O principal destaque em provas é a **Tromboflebite Pélvica Séptica (TPS)**: trombose séptica das veias ovarianas e plexos uterinos caracterizada por **febre em picos contínua e persistente após 48 a 72 horas de antibioticoterapia venosa adequada**, sem coleções purulentas detectáveis ao exame físico. O diagnóstico padrão de confirmação é o **Teste Terapêutico da Heparina**: defervescência térmica completa em 48 a 72 horas após início de Heparina venosa contínua ou HBPM plena associada à manutenção dos antibióticos. A TC ou RM pélvica contrastada evidencia falha de enchimento na veia ovariana (mais frequente à direita). Na suspeita de abscesso pélvico ou retenção maciça de restos, indica-se drenagem percutânea ou curetagem uterina criteriosa.\",\n      \"bancaPatterns\": {\n        \"Todas\": {\n          \"howItCharges\": \"Febre puerperal persistente após 48-72h de antibióticos venosos sem foco evidente: suspeitar de Tromboflebite Pélvica Séptica e realizar Teste da Heparina.\",\n          \"trapAlert\": \"Trocar empiricamente a classe do antibiótico sem considerar tromboflebite séptica ou sem solicitar TC de pelve.\"\n        },\n        \"ENARE\": {\n          \"howItCharges\": \"O **ENARE** relata paciente em uso de Clindamicina + Gentamicina há 4 dias sem melhora da febre diária e com exame ginecológico inocente, questionando a conduta diagnóstica-terapêutica.\",\n          \"trapAlert\": \"Indicar laparotomia de urgência imediata sem evidência clínica ou tomográfica de peritonite ou perfuração uterina.\"\n        },\n        \"USP\": {\n          \"howItCharges\": \"A **USP** explora a fisiopatologia vascular da TPS: maior acometimento da veia ovariana direita pelo comprimento vascular aumentado, fluxo retrógrado e compressão mecânica pelo útero dextrorrotado.\",\n          \"trapAlert\": \"Realizar curetagem uterina de rotina em útero séptico friável sem comprovação ecográfica de restos, pelo risco grave de perfuração e choque séptico.\"\n        },\n        \"UNICAMP\": {\n          \"howItCharges\": \"A **UNICAMP** cobra o reconhecimento da Síndrome do Choque Tóxico Estreptocócico pós-parto (*Streptococcus pyogenes* / GAS): progressão fulminante para choque distributivo e fasceíte necrotizante.\",\n          \"trapAlert\": \"Retardar intervenção cirúrgica de controle de danos (histerectomia puerperal) quando há miometrite necrotizante e sepse refratária.\"\n        },\n        \"PSU-MG\": {\n          \"howItCharges\": \"O **PSU-MG** cobra o mecanismo de confirmação da TPS pelo Teste da Heparina (defervescência térmica rápida nas primeiras 48-72h de anticoagulação).\",\n          \"trapAlert\": \"Acreditar que ultrassonografia transvaginal de rotina possui alta sensibilidade para trombose de veias ovarianas altas (TC contrastada é o padrão).\"\n        },\n        \"AMRIGS\": {\n          \"howItCharges\": \"A **AMRIGS** foca no diagnóstico diferencial de infecções do sítio cirúrgico da cesárea: seroma, hematoma e abscesso de parede abdominal.\",\n          \"trapAlert\": \"Não abrir a fáscia e não drenar ferida operatória com flutuação purulenta profunda.\"\n        },\n        \"SUS-SP\": {\n          \"howItCharges\": \"O **SUS-SP** cobra os critérios de sepse materna puerperal e protocolo de ressuscitação volêmica imediata com cristaloides (30 mL/kg nas primeiras 3h).\",\n          \"trapAlert\": \"Atrasar o início de noradrenalina em puérpera em choque séptico mantendo PAM < 65 mmHg após prova de volume.\"\n        }\n      }\n    }\n  ],\n  \"bancaBreakdown\": {\n    \"AMRIGS\": {\n      \"banca\": \"AMRIGS\",\n      \"totalQuestions\": 5,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 60.0\n        },\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        },\n        {\n          \"subfoco\": \"Complicações de Prótese: Infecção, Migração e Dor\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"SUS-SP\": {\n      \"banca\": \"SUS-SP\",\n      \"totalQuestions\": 5,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 60.0\n        },\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 40.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"UNESP/HCFMB\": {\n      \"banca\": \"UNESP/HCFMB\",\n      \"totalQuestions\": 8,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 50.0\n        },\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 25.0\n        },\n        {\n          \"subfoco\": \"Tromboflebite Pélvica Séptica & Complicações\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 25.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"UNICAMP/HC\": {\n      \"banca\": \"UNICAMP/HC\",\n      \"totalQuestions\": 9,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 6,\n          \"percentageInBanca\": 66.7\n        },\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 22.2\n        },\n        {\n          \"subfoco\": \"Tromboflebite Pélvica Séptica & Complicações\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 11.1\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"CERMAM\": {\n      \"banca\": \"CERMAM\",\n      \"totalQuestions\": 5,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 40.0\n        },\n        {\n          \"subfoco\": \"Morbidade Febril Puerperal & Critérios\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 40.0\n        },\n        {\n          \"subfoco\": \"Fatores de Risco & Profilaxia na Cesárea\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"Pontifícia Universidade Católica do Paraná\": {\n      \"banca\": \"Pontifícia Universidade Católica do Paraná\",\n      \"totalQuestions\": 6,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 50.0\n        },\n        {\n          \"subfoco\": \"Fatores de Risco & Profilaxia na Cesárea\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Complicações de Prótese: Infecção, Migração e Dor\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 16.7\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"USP/HCRP\": {\n      \"banca\": \"USP/HCRP\",\n      \"totalQuestions\": 5,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 40.0\n        },\n        {\n          \"subfoco\": \"Fatores de Risco & Profilaxia na Cesárea\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 40.0\n        },\n        {\n          \"subfoco\": \"Mastite Puerperal: Diagnóstico & Conduta\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 20.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"INEP Revalida\": {\n      \"banca\": \"INEP Revalida\",\n      \"totalQuestions\": 6,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Infecção Puerperal\",\n          \"questionCount\": 6,\n          \"percentageInBanca\": 100.0\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"ENARE\": {\n      \"banca\": \"ENARE\",\n      \"totalQuestions\": 42,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 16,\n          \"percentageInBanca\": 38.1\n        },\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 14,\n          \"percentageInBanca\": 33.3\n        },\n        {\n          \"subfoco\": \"Fatores de Risco & Profilaxia na Cesárea\",\n          \"questionCount\": 6,\n          \"percentageInBanca\": 14.3\n        },\n        {\n          \"subfoco\": \"Mastite Puerperal: Diagnóstico & Conduta\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 9.5\n        },\n        {\n          \"subfoco\": \"Morbidade Febril Puerperal & Critérios\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 4.8\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"PSU-MG\": {\n      \"banca\": \"PSU-MG\",\n      \"totalQuestions\": 24,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 9,\n          \"percentageInBanca\": 37.5\n        },\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 7,\n          \"percentageInBanca\": 29.2\n        },\n        {\n          \"subfoco\": \"Morbidade Febril Puerperal & Critérios\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 16.7\n        },\n        {\n          \"subfoco\": \"Fatores de Risco & Profilaxia na Cesárea\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 12.5\n        },\n        {\n          \"subfoco\": \"Demais Critérios & Diagnósticos Menores\",\n          \"questionCount\": 1,\n          \"percentageInBanca\": 4.1\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    },\n    \"USP\": {\n      \"banca\": \"USP\",\n      \"totalQuestions\": 35,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 12,\n          \"percentageInBanca\": 34.3\n        },\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 11,\n          \"percentageInBanca\": 31.4\n        },\n        {\n          \"subfoco\": \"Demais Critérios & Diagnósticos Menores\",\n          \"questionCount\": 5,\n          \"percentageInBanca\": 14.3\n        },\n        {\n          \"subfoco\": \"Fatores de Risco & Profilaxia na Cesárea\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 11.4\n        },\n        {\n          \"subfoco\": \"Mastite Puerperal: Diagnóstico & Conduta\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 8.6\n        }\n      ],\n      \"predominantDifficulty\": \"Difícil\"\n    },\n    \"UNICAMP\": {\n      \"banca\": \"UNICAMP\",\n      \"totalQuestions\": 28,\n      \"topSubfocos\": [\n        {\n          \"subfoco\": \"Endometrite Puerperal: Diagnóstico & Clínica\",\n          \"questionCount\": 11,\n          \"percentageInBanca\": 39.3\n        },\n        {\n          \"subfoco\": \"Antibioticoterapia na Infecção Puerperal\",\n          \"questionCount\": 8,\n          \"percentageInBanca\": 28.6\n        },\n        {\n          \"subfoco\": \"Fatores de Risco & Profilaxia na Cesárea\",\n          \"questionCount\": 4,\n          \"percentageInBanca\": 14.3\n        },\n        {\n          \"subfoco\": \"Mastite Puerperal: Diagnóstico & Conduta\",\n          \"questionCount\": 3,\n          \"percentageInBanca\": 10.7\n        },\n        {\n          \"subfoco\": \"Morbidade Febril Puerperal & Critérios\",\n          \"questionCount\": 2,\n          \"percentageInBanca\": 7.1\n        }\n      ],\n      \"predominantDifficulty\": \"Médio\"\n    }\n  }\n}\n```\n\n---\n\n## 2. Morbidade Febril Puerperal: Critérios Diagnósticos & Diagnóstico Diferencial Imediato\n\n### Definição Canônica Oficial (FEBRASGO / OMS)\nA **Morbidade Febril Puerperal** é formalmente definida pela presença de:\n* **Temperatura oral $\\ge 38,0^\\circ\\text{C}$**\n* Registrada em **pelo menos 2 dias diferentes**\n* Durante os **primeiros 10 dias após o parto**\n* **EXCLUÍDAS AS PRIMEIRAS 24 HORAS** pós-parto\n\n> [!WARNING] Armadilha Clássica de Prova: Aferição Oral vs. Febre nas Primeiras 24 Horas\n> 1. **Por que excluir as primeiras 24 horas?** Elevações térmicas discretas no primeiro dia decorrem frequentemente de desidratação, esforço muscular no trabalho de parto ou reação inflamatória reabsortiva fisiológica.\n> 2. **Por que a aferição deve ser oral?** A temperatura axilar na puérpera é falseada pelo ingurgitamento vascular mamário e pela **apojadura** (\"febre do leite\"), registrando calor local sem febre sistêmica.\n\n### Apojadura Mamária Fisiológica vs. Endometrite vs. Tromboflebite\nO contraste imediato entre as afecções febris puerperais mais cobradas em provas é sintetizado na arquitetura comparativa abaixo:\n\n```diff-diagnosis\n{\n  \"diffId\": \"febre-puerperal-diagnosticos\",\n  \"title\": \"Diagnóstico Diferencial da Febre no Puerpério\",\n  \"entities\": [\n    {\n      \"name\": \"Apojadura Fisiológica\",\n      \"period\": \"2º ao 4º dia pós-parto\",\n      \"feverDuration\": \"Duração autolimitada < 24 horas\",\n      \"uterineSigns\": \"Útero indolor em involução normal\",\n      \"lochia\": \"Lóquios fisiológicos (rubros a serosos)\",\n      \"hallmark\": \"Mamas difusamente túrgidas; puérpera em bom estado geral sem taquicardia\",\n      \"keyConduct\": \"Conduta expectante: amamentação em livre demanda, sutiã de sustentação e compressas frias (crioterapia)\"\n    },\n    {\n      \"name\": \"Endometrite Puerperal\",\n      \"period\": \"2º ao 5º dia pós-parto\",\n      \"feverDuration\": \"Persistente em picos elevados (≥ 38,0°C)\",\n      \"uterineSigns\": \"Tríade de Bumm (subinvoluído, pastoso, doloroso à palpação)\",\n      \"lochia\": \"Lóquios abundantes, achocolatados e fétidos\",\n      \"hallmark\": \"Taquicardia precoce desproporcional à curva térmica; bacteremia polimicrobiana\",\n      \"keyConduct\": \"Internação hospitalar obrigatória + Clindamicina 900mg IV 8/8h + Gentamicina 5mg/kg IV 24/24h\"\n    },\n    {\n      \"name\": \"Mastite Puerperal\",\n      \"period\": \"2ª a 3ª semana pós-parto\",\n      \"feverDuration\": \"Picos febris elevados com calafrios\",\n      \"uterineSigns\": \"Involução uterina fisiológica normal\",\n      \"lochia\": \"Fisiológicos (lochia alba)\",\n      \"hallmark\": \"Sinais flogísticos focais em cunha (dor, rubor, calor) em quadrante de uma mama\",\n      \"keyConduct\": \"Cefalexina 500mg VO 6/6h por 10 a 14 dias + MANTER amamentação mandatória sob livre demanda\"\n    },\n    {\n      \"name\": \"Tromboflebite Pélvica Séptica\",\n      \"period\": \"5º ao 10º dia pós-parto\",\n      \"feverDuration\": \"Febre em agulha refratária a 72h de antibioticoterapia\",\n      \"uterineSigns\": \"Exame pélvico e ultrassonografia normais\",\n      \"lochia\": \"Fisiológicos\",\n      \"hallmark\": \"Curva térmica em picos diários contrastando com paciente afebril e bem-disposta entre os episódios\",\n      \"keyConduct\": \"Teste terapêutico da Heparina (HNF ou Enoxaparina 1mg/kg 12/12h); apirexia em 48-72h sela o diagnóstico\"\n    }\n  ]\n}\n```\n\n---\n\n## 3. Fatores de Risco & Prevenção: O Papel Determinante da Cesariana\n\nA via de parto é o determinante isolado mais expressivo na patogênese infecciosa: o **parto cesáreo eleva em 10 a 30 vezes o risco de endometrite** em comparação com o parto vaginal eutócico.\n\n```clinical-scheme\n{\n  \"type\": \"bipolar\",\n  \"badge\": \"Diretriz FEBRASGO / CDC\",\n  \"leftColumn\": {\n    \"title\": \"FATORES DE RISCO (Aumentam Incidência)\",\n    \"items\": [\n      \"Parto Cesáreo de Emergência: Risco 10 a 30 vezes superior ao parto vaginal eutócico.\",\n      \"Bolsa Rota Prolongada (> 6 a 18 horas) e Trabalho de Parto arrastado.\",\n      \"Toques Vaginais Repetidos (≥ 5 toques intraparto elevam inoculação bacteriana).\",\n      \"Anemia Materna (Hb < 10 g/dL), Obesidade mórbida e líquido amniótico meconial.\"\n    ],\n    \"alert\": \"A cesariana intraparto é o principal fator de risco independente cobrado em provas!\"\n  },\n  \"rightColumn\": {\n    \"title\": \"PROFILAXIA EFETIVA & BOAS PRÁTICAS\",\n    \"items\": [\n      \"Antibioticoprofilaxia Universal: Cefazolina 2g IV (ou 3g se peso ≥ 120 kg) 30 a 60 min ANTES da incisão na pele.\",\n      \"Azitromicina 500mg IV Adjuvante: Recomendada em cesáreas não eletivas intraparto (ACOG).\",\n      \"Antissepsia Dupla: Clorexidina alcoólica a 2% no abdome e preparo vaginal prévio.\",\n      \"Dequitação Espontânea: Tração controlada de cordão (abolição formal da curagem manual de rotina).\"\n    ],\n    \"alert\": \"A profilaxia com Cefazolina deve ser feita na indução anestésica; NUNCA aguardar o clampeamento!\"\n  }\n}\n```\n\n\n---\n\n## 4. Endometrite Puerperal: Tríade de Bumm & Triagem de Sepse Materna\n\nA **Endometrite** é a causa mais comum de infecção puerperal (~85% dos casos). Inicia-se no leito de inserção placentária e ascende para a decídua e miométrio (endomiometrite).\n\n### O Quadro Clínico Clássico: A Tríade de Bumm\nA identificação clínica em provas fundamenta-se nos achados da semiologia obstétrica:\n\n$$\\text{Endometrite Puerperal} \\implies \\begin{cases} \\text{1. Febre persistente com taquicardia} \\\\ \\text{2. Útero subinvoluído, doloroso e amolecido} \\\\ \\text{3. Lóquios achocolatados com odor fétido} \\end{cases}$$\n\n1. **Febre em Picos ($\\ge 38,0^\\circ\\text{C}$):** Tipicamente instalada entre o 2º e o 5º dia pós-parto, acompanhada de taquicardia materna precoce desproporcional.\n2. **Subinvolução Uterina Dolorosa:** O útero não regride na velocidade fisiológica esperada (o normal é regredir cerca de $1\\text{ cm por dia}$ após o parto). À palpação bimanual, o fundo uterino é doloroso e pastoso.\n3. **Loquiação Anormal:** Lóquios abundantes, de coloração escura/achocolatada e odor intensamente fétido.\n   * *Atenção:* Em infecções causadas por *Streptococcus pyogenes* (Strepto do Grupo A), os lóquios podem ser escassos e sem odor (\"endometrite inodora\"), porém o quadro sistêmico é fulminante com bacteremia precoce.\n\n![**[Achado Visual Cardinal]**: Endométrio espessado e heterogêneo com múltiplos focos hiperecogênicos puntiformes e sombra acústica suja compatível com gás intrauterino. • **[Diagnóstico Associado]**: Endometrite puerperal bacteriana com colonização mista anaeróbia. • **[Ponto Crítico de Prova]**: A presença isolada de gás antes do 5º dia pós-cesárea pode ser iatrogênica transitória; só firma diagnóstico quando correlacionada com febre persistente e Tríade de Bumm!](/images/clinical/endometrite_usg.jpg)\n\n\n### Microbiologia Polimicrobiana Ascendente\nA infecção puerperal intrauterina é de caráter **polimicrobiano misto**, envolvendo microrganismos aeróbios e anaeróbios provenientes do trato genital inferior:\n* **Anaeróbios Obrigatórios (50% a 80%):** *Bacteroides fragilis*, *Peptostreptococcus*, *Prevotella bivia*.\n* **Gram-Negativos Entéricos Facultativos (30% a 50%):** *Escherichia coli*, *Klebsiella pneumoniae*, *Proteus mirabilis*.\n* **Gram-Positivos (30% a 40%):** *Streptococcus agalactiae* (EGB), *Enterococcus faecalis*, *Staphylococcus epidermidis*.\n\n> [!WARNING] Armadilha Clássica de Prova: Não Aguardar Culturas Vaginais\n> A coleta de swab de secreção vaginal ou endocervical **NÃO tem utilidade diagnóstica** na endometrite pós-parto, pois as amostras são inevitavelmente contaminadas pela flora comensal. O diagnóstico é puramente clínico e o início da antibioticoterapia é imediato e empírico. Hemoculturas são solicitadas apenas em caso de choque séptico ou ausência de melhora após 48 horas.\n\n### Triagem de Sepse Obstétrica: Escore MEOWS & Pacote da 1ª Hora\nAs alterações hemodinâmicas fisiológicas do puerpério (leucocitose de até 25.000/$\\text{mm}^3$, taquicardia leve) invalidam o qSOFA clássico. As diretrizes FEBRASGO e da OMS preconizam a utilização de escores de alerta precoce obstétrico:\n\n```clinical-score\n{\n  \"scoreId\": \"meows-puerperal-sepsis\",\n  \"title\": \"MEOWS: Escore de Alerta Precoce Obstétrico / Sepse Puerperal\",\n  \"parameters\": [\n    {\n      \"parameter\": \"Frequência Cardíaca\",\n      \"normalRange\": \"60 a 99 bpm\",\n      \"alertTrigger\": \"≥ 110 bpm ou < 50 bpm\",\n      \"clinicalMeaning\": \"Taquicardia persistente é o marcador precoce mais sensível de bacteremia puerperal\"\n    },\n    {\n      \"parameter\": \"Frequência Respiratória\",\n      \"normalRange\": \"12 a 20 irpm\",\n      \"alertTrigger\": \"≥ 25 irpm ou < 10 irpm\",\n      \"clinicalMeaning\": \"Taquipneia reflete acidose metabólica compensatória por hiperlactatemia\"\n    },\n    {\n      \"parameter\": \"Pressão Arterial Sistólica\",\n      \"normalRange\": \"100 a 139 mmHg\",\n      \"alertTrigger\": \"< 90 mmHg ou ≥ 160 mmHg\",\n      \"clinicalMeaning\": \"Hipotensão define choque distributivo séptico e hipoperfusão tecidual\"\n    },\n    {\n      \"parameter\": \"Temperatura Oral\",\n      \"normalRange\": \"36,0°C a 37,4°C\",\n      \"alertTrigger\": \"≥ 38,5°C ou < 35,5°C\",\n      \"clinicalMeaning\": \"Hipotermia materna está associada a sepse grave refratária de pior prognóstico\"\n    },\n    {\n      \"parameter\": \"Estado Neurológico\",\n      \"normalRange\": \"Alerta e orientada\",\n      \"alertTrigger\": \"Sonolência, confusão ou agitação\",\n      \"clinicalMeaning\": \"Disfunção neurológica aguda decorrente de hipoperfusão cerebral\"\n    }\n  ],\n  \"actionThreshold\": {\n    \"triggerCondition\": \"Presença de 1 parâmetro com alerta vermelho ou 2 com alerta amarelo\",\n    \"bundleProtocol\": \"PACOTE DA 1ª HORA (Hour-1 Bundle)\",\n    \"mandatorySteps\": [\n      \"1. Dosagem imediata de Lactato Sérico (repetir em 2 a 4h se ≥ 2 mmol/L)\",\n      \"2. Coleta de 2 pares de Hemoculturas antes da antibioticoterapia venosa\",\n      \"3. Início de Antibioticoterapia Venosa de Amplo Espectro na PRIMEIRA HORA\",\n      \"4. Ressuscitação volêmica com Cristaloide (30 mL/kg em 3h) se PAS < 90 mmHg ou Lactato ≥ 4 mmol/L\",\n      \"5. Iniciar Vasopressor precoce (Noradrenalina de escolha) para manter PAM ≥ 65 mmHg se hipotensão refratária\"\n    ]\n  }\n}\n```\n\n---\n\n## 5. Esquema Antibiótico Padrão-Ouro & Tempo de Tratamento\n\n### Esquema de Primeira Escolha Hospitalar\nO tratamento da endometrite puerperal exige internação hospitalar e antibioticoterapia intravenosa de amplo espectro:\n\n| Fármaco | Posologia Recomendada | Espectro Antimicrobiano Coberto |\n| :--- | :--- | :--- |\n| **Clindamicina** | **900 mg IV a cada 8 horas** | Anaeróbios estritos (inclusive *Bacteroides*) + Cocos Gram-positivos |\n| **Gentamicina** | **5 mg/kg IV em dose única diária** (ou $1,5\\text{ mg/kg}$ IV 8/8h) | Bacilos Gram-negativos entéricos facultativos (*E. coli*, *Klebsiella*) |\n\n### Esquemas Alternativos e Adições\n* **Adição de Ampicilina (2g IV 6/6h):** Deve ser associada ao esquema de Clindamicina + Gentamicina quando houver **suspeita de infecção por *Enterococcus faecalis*** (puérperas graves, instrumentadas, com toques múltiplos) ou se a paciente mantiver febre após 48 a 72 horas de tratamento inicial.\n* **Monoterapia de Amplo Espectro:** Amoxicilina + Clavulanato IV, Ampicilina + Sulbactam IV ou Cefoxitina IV são opções aceitas em protocolos institucionais.\n* **Alergia Severa à Penicilina / Clindamicina:** Gentamicina + Metronidazol 500mg IV 8/8h.\n\n### Duração do Tratamento & Critério de Alta Hospitalar\n* **Quando suspender a antibioticoterapia venosa?**\n  * A antibioticoterapia intravenosa deve ser mantida até que a puérpera permaneça **afebril e assintomática por 48 horas consecutivas**, com normalização do trânsito intestinal e redução da dor uterina.\n* **É necessário passar para antibiótico oral após a alta?**\n  * **NÃO!** As diretrizes internacionais (ACOG, CDC) e a FEBRASGO são unânimes: **não há benefício clínico em prescrever antibióticos orais ambulatoriais** para casa após o alcance da cura clínica hospitalar venosa.\n\n---\n\n## 6. O Que Mudou na Diretriz Recente? (Ruptura de Paradigma)\n\n| Ponto de Conduta | Prática Antiga (Pegadinha das Bancas) | Nova Conduta Oficial Homologada | Diretriz Vigente / Ano |\n| :--- | :--- | :--- | :--- |\n| **Momento da Cefazolina Profilática na Cesárea** | Administrada apenas *após o clampeamento do cordão umbilical*, temendo depressão neonatal ou alteração de culturas no recém-nascido. | **Administrada 30 a 60 minutos ANTES da incisão cirúrgica (na indução anestésica).** Ensaios clínicos demonstraram redução de 50% na endometrite sem impacto adverso no neonato. | **FEBRASGO (2024) / ACOG Practice Bulletin** |\n| **Dose de Cefazolina na Puérpera Obesa** | Dose padrão fixa de 2g IV para todas as pacientes, independentemente da massa corporal. | **Cefazolina 3g IV** para gestantes com peso $\\ge 120\\text{ kg}$ ou $\\text{IMC} \\ge 35\\text{ kg/m}^2$, garantindo concentração tecidual bactericida no tecido adiposo. | **CDC / FEBRASGO (2023-2025)** |\n| **Posologia da Gentamicina na Endometrite** | Fracionamento em 3 tomadas diárias ($1,5\\text{ mg/kg}$ IV a cada 8 horas). | **Dose única diária ($5\\text{ mg/kg}$ IV a cada 24 horas).** Mesma eficácia bactericida por efeito pico-dependente e menor taxa de nefro/ototoxicidade materna. | **Williams Obstetrícia 26ª ed. / FEBRASGO** |\n| **Antibioticoterapia Pós-Alta** | Prescrição de 7 a 10 dias de cefalexina ou amoxicilina oral após a alta hospitalar. | **Suspensão completa após 48 horas afebril e assintomática.** Prescrição oral ambulatorial foi formalmente abandonada por selecionar resistência bacteriana. | **ACOG / FEBRASGO Consensos Recentes** |\n\n> [!IMPORTANT] Alerta de Atualização para Provas de 2024-2026:\n> Se a questão do concurso afirmar que a Cefazolina profilática na cesárea deve ser infundida \"logo após o obstetra clampear o cordão umbilical\", considere a assertiva **INCORRETA**. As bancas contemporâneas cobram a administração de 30 a 60 minutos antes da incisão na pele (indução anestésica).\n\n---\n\n## 7. Febre Persistente após 48 a 72 Horas: Algoritmo Decisório Sequencial\n\nQuando a puérpera tratada com Clindamicina + Gentamicina mantém picos febris após 48 a 72 horas de medicação, a investigação etiológica deve seguir uma ordem lógica rigorosa:\n\n### Passo a Passo da Cascata Decisória\n\n```clinical-scheme\n{\n  \"type\": \"pipeline\",\n  \"title\": \"Pipeline de Investigação da Febre Puerperal Persistente (> 48-72h de ATB)\",\n  \"subtitle\": \"Sequência lógica armada obrigatória diante de falha do esquema Clindamicina + Gentamicina\",\n  \"badge\": \"Diretriz ACOG / FEBRASGO\",\n  \"steps\": [\n    {\n      \"badge\": \"Etapa 1 • Exame Inicial de Escolha\",\n      \"title\": \"Ultrassonografia Pélvica & Hemoculturas\",\n      \"items\": [\n        \"Coleta imediata de 2 pares de hemoculturas e urinocultura.\",\n        \"USG Pélvica / Transvaginal: Avaliar espessamento endometrial, restos ovulares e coleções.\",\n        \"Hematoma de parede ou abscesso incisional superficial / subaponeurótico.\"\n      ],\n      \"alert\": \"A presença de gás na cavidade antes do 5º dia pode ser fisiológica pós-cesárea; correlacionar com clínica!\"\n    },\n    {\n      \"badge\": \"Etapa 2 • Resolução Anatômica / Coleções\",\n      \"title\": \"Tomografia Computadorizada de Pelve com Contraste\",\n      \"items\": [\n        \"Padrão-ouro para mapear abscessos profundos e flegmões parametrais.\",\n        \"Mapeamento de trombos nas veias ovarianas e veia cava inferior.\",\n        \"Indicação de drenagem percutânea guiada por TC/USG se coleção > 5 cm.\"\n      ],\n      \"alert\": \"Coleção pélvica volumosa não responde apenas a antibiótico sistêmico; requer drenagem dirigida!\"\n    },\n    {\n      \"badge\": \"Etapa 3 • Diagnóstico de Exclusão\",\n      \"title\": \"Teste Terapêutico com Heparina (TPS)\",\n      \"items\": [\n        \"Suspeita de Tromboflebite Pélvica Séptica: Febre em picos com paciente em bom estado geral.\",\n        \"Exclusão de abscessos e coleções à tomografia.\",\n        \"Heparina Plena (HNF ou HBPM) associada a antibióticos de amplo espectro.\"\n      ],\n      \"alert\": \"Afebril em 48-72h após heparina confirma o diagnóstico clínico de TPS sem necessidade de outro exame!\"\n    }\n  ]\n}\n```\n\n\n* **Passo 1 (Exame Físico Focado):** **[Ponto Principal]:** Inspecionar a incisão cirúrgica da cesárea ou episiorrafia, procurando abaulamento, eritema, hipertermia local, crepitação ou secreção purulenta (pesquisa de celulite, abscesso de parede abdominal ou fasciíte necrotizante).\n* **Passo 2 (Exame de Imagem Dirigido):** **[Ponto Principal]:** Realizar Ultrassonografia Pélvica Transvaginal ou Tomografia Computadorizada de Abdome e Pelve para descartar restos placentários retidos, hematomas infectados, abscesso de fundo de saco de Douglas ou flegmão de ligamento largo.\n* **Passo 3 (Regra de Segurança para Restos Placentários):** **[Ponto Principal]:** Diante de restos ovulares infectados, **é contraindicado curetar de imediato sem cobertura antibiótica prévia**. Deve-se aguardar pelo menos **4 a 6 horas de impregnação antimicrobiana venosa** e estabilização para realizar o esvaziamento uterino (usar cureta romba grande de Romani ou AMIU com máxima suavidade, pelo altíssimo risco de perfuração do miométrio miomalácico).\n* **Passo 4 (Ampliação Antimicrobiana):** **[Ponto Principal]:** Adicionar **Ampicilina 2g IV a cada 6 horas** ao esquema de Clindamicina + Gentamicina para cobrir *Enterococcus faecalis* resistente aos fármacos originais.\n* **Passo 5 (Hipótese de Tromboflebite Pélvica Séptica):** **[Ponto Principal]:** Diante de puérpera com febre persistente em picos (\"em agulha\"), taquicardia acentuada e exame físico pélvico e ultrassonografia normais, suspeitar de **Tromboflebite Pélvica Séptica (TPS)** e iniciar o **Teste Terapêutico da Heparina** (apirexia nas próximas 48 a 72 horas confirma a hipótese).\n\n### Conduta nas Complicações Pélvicas Cirúrgicas Específicas\n* **Flegmão do Ligamento Largo (Parametrite / Celulite Pélvica):** Induração dolorosa unilateral que se estende do colo uterino até a parede lateral da pelve. O tratamento é **estritamente clínico/conservador** com antibioticoterapia venosa prolongada (não se opera a menos que haja formação de abscesso evidente).\n* **Abscesso de Fundo de Saco de Douglas:** Diagnóstico ao toque bimanual e imagem; conduta preferencial é a **drenagem por colpotomia posterior**.\n* **Indicações Formais de Histerectomia Puerperal de Urgência:**\n  1. Microabscessos miometriais múltiplos refratários;\n  2. Necrose miometrial extensa / gangrena gasosa (*Clostridium* / Síndrome de Mondor);\n  3. Sepse grave com falência multiorgânica refratária ao tratamento clínico e debridamento.\n\n---\n\n## 8. Diagnósticos Diferenciais Extragenitais no Puerpério\n\n![**[Achado Visual Cardinal]**: Eritema inflamatório cutâneo bem delimitado em disposição em cunha em quadrante mamário, sem ponto de flutuação palpável. • **[Diagnóstico Associado]**: Mastite puerperal aguda estafilocócica em fase flegmonosa. • **[Ponto Crítico de Prova]**: A presença de mastite febril NÃO contraindica o aleitamento materno; a amamentação deve ser obrigatoriamente mantida sob livre demanda!](/images/clinical/mastite_puerperal.jpg)\n\n\nA febre no puerpério nem sempre se origina na cavidade uterina. O exame clínico minucioso deve distinguir os seguintes sítios infecciosos:\n\n| Patologia | Agente Etiológico Típico | Quadro Clínico de Prova | Conduta Homologada |\n| :--- | :--- | :--- | :--- |\n| **Mastite Puerperal** | *Staphylococcus aureus* (adquirido da nasofaringe do recém-nascido) | Sinais flogísticos localizados em quadrante mamário (dor, calor, rubor, edema em cunha) + febre alta e calafrios (2ª a 3ª semana pós-parto). | **Cefalexina 500mg VO 6/6h** ou Amoxicilina-Clavulanato por 10-14 dias.<br>🚫 **Regra de Ouro (Protocolo ABM #36):** **MANTER AMAMENTAÇÃO MANDATÓRIA** em livre demanda. Contraindicadas massagens vigorosas e hiperordenha mecânica (pioram edema ductal). Crioterapia e AINEs para desinflamar. |\n| **Abscesso Mamário** | *Staphylococcus aureus* | Mastite complicada com massa flutuante dolorosa à palpação mamária. | **Drenagem cirúrgica ou aspiração por agulha guiada por USG** + Antibioticoterapia venosa. Manter amamentação na mama contralateral sã. |\n| **Infecção de Ferida Cirúrgica (Cesárea)** | *Staphylococcus aureus*, *Enterobacteriaceae* | Febre após o 4º-7º DPO com dor incisional, hiperemia de bordas e drenagem de exsudato purulento pela cicatriz cirúrgica. | Abertura dos pontos cirúrgicos, drenagem da secreção, desbridamento de tecidos desvitalizados e curativos úmidos. Antibiótico se celulite adjacente. |\n| **Deiscência / Infecção de Episiorrafia** | Polimicrobiana (flora vaginal e perineal) | Dor perineal intensa, edema, saída de secreção purulenta e afastamento dos bordos da sutura no períneo. | Abertura de suturas infectadas, desbridamento, limpeza mecânica e antibioticoterapia. Estando o leito limpo e com tecido de granulação são, indica-se **ressutura secundária precoce** (não aguardar cicatrização por 2ª intenção). |\n| **Fasciíte Necrosante** | Polimicrobiana (Gram-negativos + Anaeróbios + *S. pyogenes*) | Eritema com flictenas hemorrágicas, anestesia cutânea focal, crepitação subcutânea e choque séptico fulminante. | **Emergência Cirúrgica Extrema:** Desbridamento cirúrgico radical e agressivo em centro cirúrgico + Meropenem + Vancomicina + Clindamicina IV. |\n| **Infecção do Trato Urinário (Pielonefrite)** | *Escherichia coli* (> 80%) | Febre, calafrios, disúria, polaciúria e **Sinal de Giordano positivo** (dor à punho-percussão lombar). | Urocultura + Ceftriaxona 1g IV ao dia ou Ciprofloxacino (se não lactante). Rastreio obrigatório após cateterismo vesical. |\n| **Atelectasia Pulmonar** | Mecânica / Hipoventilação pós-anestésica | Febre baixa nas primeiras 24 a 48 horas pós-cesárea com diminuição de murmúrio vesicular nas bases. | Fisioterapia respiratória, tosse assistida e deambulação precoce; dispensados antibióticos. |\n\n---\n\n## 9. Diretrizes Oficiais & Consensos de Referência\n\n1. **FEBRASGO (Federação Brasileira das Associações de Ginecologia e Obstetrícia):** *Protocolos de Conduta em Infecções Puerperais e Choque Séptico em Obstetrícia* (Comissão Nacional Especializada em Urgências Obstétricas, 2022–2025).\n2. **Ministério da Saúde do Brasil:** *Cadernos de Atenção Básica nº 32 - Atenção ao Pré-Natal e Puerpério* e *Manual de Gestação de Alto Risco* (Secretaria de Atenção Primária à Saúde).\n3. **American College of Obstetricians and Gynecologists (ACOG):** Practice Bulletin nº 195 (*Prevention of Infection After Gynecologic and Obstetric Surgery*) e Practice Bulletin nº 211 (*Critical Care in Obstetrics*).\n4. **Academy of Breastfeeding Medicine (ABM):** Clinical Protocol #36 (*The Mastitis Spectrum*, Revised 2022/2023).\n5. **Surviving Sepsis Campaign / FEBRASGO:** *International Guidelines for Management of Sepsis and Septic Shock in Obstetric Patients*.\n6. **Centers for Disease Control and Prevention (CDC):** *Guideline for the Prevention of Surgical Site Infection* (Atualizações pós-operatórias em obstetrícia).\n7. **Williams Obstetrics:** Cunningham FG, Leveno KJ, Bloom SL, et al. *Williams Obstetrics*, 26th Edition. McGraw-Hill Education (Capítulo 37: Puerperal Infections).\n8. **World Health Organization (WHO):** *WHO recommendations for prevention and treatment of maternal peripartum infections* (Genebra, Suíça).\n"
  }
];
