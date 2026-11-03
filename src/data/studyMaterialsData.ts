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
    id: "mat-gem-01",
    focusId: "obs-gem-classificacao",
    title: "Classificação, Diagnóstico e Corionicidade na Gemelaridade",
    specialty: "Ginecologia e Obstetrícia",
    theme: "Gestação Múltipla",
    focus: "Classificação e Diagnóstico de Gemelares",
    readTimeMinutes: 10,
    lastUpdatedYear: 2026,
    guidelineBadge: "FEBRASGO / ISUOG / ACOG",
    summarySnippet: "Corionicidade como preditor primário de morbimortalidade, marco ultrassonográfico do 1º trimestre (Lambda vs. T), cronologia de clivagem zigótica, rastreamento genético e conduta pré-natal.",
    keyPoints: [
          "A corionicidade (número de placentas) é o preditor isolado mais relevante de morbimortalidade perinatal na gemelaridade.",
          "Sinal do Lambda (pico duplo) na USG de 11 a 13+6 semanas confirma dicorionicidade; Sinal do T confirma monocorionicidade.",
          "Fetos de sexos anatômicos diferentes são obrigatoriamente dizigóticos e dicoriônicos-diamnióticos.",
          "Clivagem do zigoto em 0-3 dias gera DCDA; 4-8 dias MCDA; 9-12 dias MCMA; após 13 dias gera gêmeos unidos/siameses.",
          "Placentas aparentemente únicas na USG de 2º/3º trimestre podem ser dicoriônicas fundidas; a avaliação no 1º trimestre é padrão-ouro.",
          "Gestação monocoriônica diamniótica exige ultrassonografia quinzenal com Doppler a partir de 16 semanas para rastreio de STFF.",
          "Toda gestação gemelar tem indicação formal de profilaxia para pré-eclâmpsia com AAS em baixa dose (100 a 150 mg/dia) de 12 a 36 semanas."
    ],
    markdownContent: "---\n\n## 1. O Que Mais Cai: A Corionicidade como Preditor Primário de Risco\n\nA gestão da gestação múltipla é um dos pilares da obstetrícia de alto risco nas provas de residência. O erro conceitual mais comum é confundir zigotia com corionicidade. Para as bancas (ENARE, USP, UNICAMP, PSU-MG, AMRIGS), a **corionicidade** é a variável soberana, pois define o compartilhamento da circulação placentária e, consequentemente, o risco de complicações vasculares exclusivas (Síndrome de Transfusão Feto-Fetal - STFF, Anemia-Policitemia - TAPS, e CIUR seletivo). A zigotia (monozigóticos vs. dizigóticos) é um dado genético, mas a corionicidade é o dado clínico-prognóstico.\n\n```gem-stats-corionicidade\nRecorrência Temática de Classificação e Diagnóstico de Gemelares\n- Corionicidade (DCDA vs MCDA): 85% das questões de prova.\n- Diagnóstico ultrassonográfico (Sinal do T vs Lambda): 70% das questões de imagem.\n- Complicações específicas de MCDA (STFF): 60% das questões de conduta.\n- Cronologia de clivagem: 40% das questões de embriologia aplicada.\n```\n\nA corionicidade dita o protocolo de vigilância: gestações monocoriônicas exigem monitoramento quinzenal, enquanto dicoriônicas permitem intervalos maiores, devido à ausência de anastomoses vasculares placentárias patológicas.\n\n## 2. Ultrassonografia do 1º Trimestre: Sinal do Lambda (Pico Duplo) vs. Sinal do T\n\nA janela de ouro para determinação da corionicidade é entre **11 e 13 semanas e 6 dias**. Após este período, a acurácia diminui devido à fusão placentária e ao crescimento dos fetos.\n\n*   **Sinal do Lambda (Twin Peak Sign):** Observado em gestações **Dicoriônicas Diamnióticas (DCDA)**. Caracteriza-se por uma projeção triangular de tecido placentário (córion) que se estende para dentro da base da membrana intergemelar. A membrana é espessa (> 2 mm), composta por 4 camadas (2 âmnios + 2 córions).\n*   **Sinal do T (T-sign):** Observado em gestações **Monocoriônicas Diamnióticas (MCDA)**. A membrana intergemelar insere-se perpendicularmente na placenta, sem a interposição de tecido trofoblástico. A membrana é fina (< 2 mm), composta por apenas 2 camadas (2 âmnios).\n\n$$\\text{Sinal do Lambda} \\implies \\text{Dicoriônica Diamniótica (DCDA)} \\implies \\text{Espessura} > 2\\text{ mm}$$\n$$\\text{Sinal do T} \\implies \\text{Monocoriônica Diamniótica (MCDA)} \\implies \\text{Espessura} < 2\\text{ mm}$$\n\n> [!WARNING] Armadilha Clássica de Prova: Placentas Fundidas na USG Tardia\n> No 2º e 3º trimestres, duas placentas dicoriônicas adjacentes podem se fundir anatomicamente e simular uma placenta única. O ultrassom precoce do 1º trimestre prevalece SEMPRE sobre qualquer laudo tardio. Se o laudo tardio descreve \"placenta única\", mas o 1º trimestre descreveu \"Lambda\", a gestação é DCDA.\n\n## 3. Cronologia da Clivagem Monozigótica e Tipos de Placentação\n\nA tabela abaixo resume a relação entre o momento da clivagem do zigoto e o fenótipo placentário resultante:\n\n| Dias pós-fertilização | Tipo de Placentação | Proporção (Monozigóticos) | Risco Clínico Principal | Vigilância |\n| :--- | :--- | :--- | :--- | :--- |\n| 0 a 3 dias | DCDA | 30% | Baixo (risco de gestação única) | Mensal |\n| 4 a 8 dias | MCDA | 70% | STFF, TAPS, CIUR seletivo | Quinzenal |\n| 9 a 12 dias | MCMA | 1-2% | Entrelaçamento de cordões | Internação/Vigilância intensiva |\n| > 13 dias | Siameses | < 1% | Malformações complexas | Avaliação especializada |\n\n*Nota: Gêmeos dizigóticos são sempre DCDA (2 óvulos, 2 espermatozoides).*\n\n## 4. Rastreamento Cromossômico, Malformações & A Armadilha dos Sexos Opostos\n\n*   **Translucência Nucal (TN):** Deve ser realizada feto a feto. Em gemelares, o risco de aneuploidia é calculado individualmente.\n*   **NIPT:** Pode ser utilizado, mas a sensibilidade é reduzida em gestações monocoriônicas (compartilhamento de DNA) e em casos de óbito fetal de um dos gêmeos (vanishing twin).\n*   **Rastreamento de Pré-Eclâmpsia:** Devido ao maior risco de placentação anômala, recomenda-se o uso de **AAS (100-150 mg/dia)**, iniciado preferencialmente antes de 16 semanas, mantido até 36 semanas.\n\n> [!WARNING] Armadilha Clássica de Prova: Fetos de Sexos Diferentes\n> Se a questão descreve um feto masculino e um feminino, eles são OBRIGATORIAMENTE dizigóticos e dicoriônicos. Exclua sumariamente qualquer hipótese de monocorionicidade ou risco de STFF, mesmo se o examinador tentar induzir erro com descrições ultrassonográficas duvidosas.\n\n## 5. Algoritmo Decisório para Diagnóstico e Vigilância Pré-Natal\n\n### Passo a Passo Sintético da Cascata Decisória\n\n1.  **[Diagnóstico Precoce]:** Realizar USG entre 11-13s6d para definir corionicidade pelo sinal do Lambda ou T.\n2.  **[Classificação de Risco]:** Se DCDA, risco obstétrico padrão para gemelares. Se MCDA, classificar como alto risco para complicações vasculares.\n3.  **[Vigilância DCDA]:** USG obstétrica com avaliação de crescimento fetal a cada 4 semanas, iniciando com 20 semanas.\n4.  **[Vigilância MCDA]:** USG com Doppler de artéria umbilical e cerebral média a cada 2 semanas, a partir de 16 semanas, para rastreio de STFF (polidrâmnio/oligodrâmnio) e TAPS.\n5.  **[Interrupção]:** DCDA (37-38 semanas); MCDA (36-37 semanas); MCMA (32-34 semanas).\n\n## Diretrizes Oficiais & Consensos de Referência\n*   **FEBRASGO:** Manual de Orientação em Gestação Múltipla.\n*   **ACOG:** Practice Bulletin No. 169 (Multifetal Gestations).\n*   **ISUOG:** Guidelines for the ultrasound assessment of the fetus in twin pregnancy.\n*   **FIGO:** Best practice in twin pregnancy.\n*   **Ministério da Saúde:** Manual de Atenção ao Pré-Natal de Baixo e Alto Risco."
  },
  {
    id: "mat-gem-02",
    focusId: "obs-gem-complicacoes",
    title: "Complicações Específicas da Gemelaridade Monocoriônica",
    specialty: "Ginecologia e Obstetrícia",
    theme: "Gestação Múltipla",
    focus: "Complicações da Gemelaridade",
    readTimeMinutes: 12,
    lastUpdatedYear: 2026,
    guidelineBadge: "FEBRASGO / ISUOG / SMFM",
    summarySnippet: "Fisiopatologia das anastomoses vasculares placentárias (AA vs. AV), sequência TRAP (feto acárdico), TAPS, CIUR seletivo (Gratacós) e conduta na morte de um co-gemelar.",
    keyPoints: [
          "Anastomoses vasculares estão presentes em quase 100% das placentas monocoriônicas, gerando patologias exclusivas.",
          "Anastomoses arterioarteriais (AA) são bidirecionais e superficiais, exercendo papel protetor contra desbalanço hemodinâmico grave.",
          "A sequência TRAP envolve perfusão arterial reversa de um feto acárdico, gerando sobrecarga cardíaca e insuficiência no feto bomba.",
          "O TAPS é diagnosticado por discrepância de pico sistólico na artéria cerebral média (> 1,5 MoM vs < 1,0 MoM) sem alteração de líquido amniótico.",
          "Na restrição seletiva (Gratacós), o Tipo II apresenta diástole zero/reversa contínua e o Tipo III apresenta fluxo intermitente por grandes anastomoses AA.",
          "O óbito de um concepto monocoriônico gera exsanguinação aguda reflexa e hipotensão no concepto vivo, com alto risco de leucomalácia periventricular.",
          "A confirmação de óbito de um feto monocoriônico NÃO é indicação de cesariana de emergência imediata indiscriminada."
    ],
    markdownContent: "---\n\n## 1. O Que Mais Cai: Fisiopatologia das Anastomoses Vasculares Placentárias\n\nA compreensão das complicações da gemelaridade monocoriônica (MC) é o pilar da obstetrícia de alta complexidade. Em provas de residência, o foco recai sobre a arquitetura vascular placentária. Praticamente 100% das placentas MC apresentam anastomoses vasculares, mas o fenótipo clínico depende do balanço entre elas.\n\n*   **Anastomoses Superficiais (Arterioarteriais - AA e Venovenosas - VV):** São bidirecionais, de baixa resistência e alto fluxo. As anastomoses AA são consideradas \"válvulas de segurança\", pois permitem o fluxo bidirecional, equilibrando as pressões entre os territórios placentários e protegendo contra desequilíbrios hemodinâmicos graves.\n*   **Anastomoses Profundas (Arteriovenosas - AV):** São unidirecionais, localizadas no leito capilar cotiledonar compartilhado. São as responsáveis pelo desvio crônico de sangue de um feto para o outro, sendo o motor fisiopatológico da Síndrome de Transfusão Feto-Fetal (STFF) e da TAPS.\n\n```gem-stats-complicacoes\nRecorrência Temática de Complicações da Gemelaridade\n1. Síndrome de Transfusão Feto-Fetal (STFF): 45% das questões.\n2. Restrição de Crescimento Seletiva (RCFs): 25% das questões.\n3. Morte de um Co-gemelar: 15% das questões.\n4. Sequência TAPS e TRAP: 15% das questões.\n```\n\n## 2. Sequência TRAP (Perfusão Arterial Reversa): Feto Bomba vs. Acárdico\n\nA sequência TRAP é uma complicação rara e grave, exclusiva de gestações monocoriônicas.\n\n*   **Fisiopatologia:** Presença de uma anastomose artério-arterial (AA) calibrosa associada a uma veno-venosa (VV). O feto \"bomba\" (normal) perfunde o feto \"acárdico\" (malformado) de forma retrógrada.\n*   **Feto Acárdico:** Apresenta ausência de desenvolvimento cardíaco e cefálico (acéfalo-acárdico), com edema maciço em tronco e membros inferiores devido à perfusão de sangue desoxigenado.\n*   **Repercussão no Feto Bomba:** O feto normal sobrecarrega seu sistema cardiovascular para bombear sangue para dois corpos, evoluindo com cardiomegalia, insuficiência cardíaca congestiva de alto débito, hidropisia e polidrâmnio.\n*   **Conduta Padrão-Ouro:** Interrupção do fluxo vascular para o feto acárdico para salvar o feto bomba. Realiza-se a oclusão do cordão umbilical do feto acárdico via ablação por radiofrequência (RFA) ou coagulação a laser guiada por ultrassom.\n\n## 3. Sequência TAPS (Anemia-Policitemia): Diagnóstico pelo Doppler da ACM\n\nO TAPS é uma forma crônica de transfusão sanguínea, distinta da STFF clássica.\n\n*   **Fisiopatologia:** Decorre de microanastomoses arteriovenosas minúsculas (< 1 mm) de fluxo muito lento, que permitem a passagem de hemácias, mas não de grandes volumes de plasma.\n*   **Critério Diagnóstico Padrão de Prova:**\n    *   Ausência de discordância de volume amniótico (o líquido é normal em ambos).\n    *   Diagnóstico firmado pelo **Pico de Velocidade Sistólica da Artéria Cerebral Média (PVS-ACM)**:\n        *   **Feto Doador (Anêmico):** PVS-ACM > 1,5 MoM (hiperdinâmico).\n        *   **Feto Receptor (Policitêmico):** PVS-ACM < 1,0 MoM (sangue viscoso).\n\n> [!WARNING] Armadilha Clássica de Prova: TAPS vs. STFF\n> A banca tenta enganar o candidato afirmando que há líquido amniótico diminuído no doador de TAPS. Lembre-se: no TAPS, o volume de líquido amniótico é NORMAL e CONCORDANTE em ambos os sacos. Se houver polidrâmnio/oligodrâmnio, o diagnóstico é STFF (Quintero).\n\n## 4. Restrição de Crescimento Seletiva (RCFs) & Classificação de Gratacós\n\nA RCFs é definida por EPF < percentil 10 em um dos fetos e/ou discordância de peso $\\ge 20\\%$.\n\n*   **Critérios Ultrassonográficos e Doppler:**\n$$\\text{Discordância Ponderal (\\%)} = \\frac{\\text{Peso Feto Maior} - \\text{Peso Feto Menor}}{\\text{Peso Feto Maior}} \\times 100$$\n$$\\text{Critério Doppler TAPS} \\implies \\text{PVS-ACM Doador} > 1{,}5\\text{ MoM} \\quad\\iff\\quad \\text{PVS-ACM Receptor} < 1{,}0\\text{ MoM}$$\n$$\\text{CIUR Seletivo} \\implies \\text{PFE Feto Menor} < p10 \\quad\\lor\\quad \\text{Discordância de Peso} \\ge 20\\%$$\n\n| Tipo Gratacós | Doppler Artéria Umbilical (Feto Restrito) | Fisiopatologia | Prognóstico | Conduta |\n| :--- | :--- | :--- | :--- | :--- |\n| **Tipo I** | Diástole positiva (normal) | Insuficiência placentária leve | Favorável | Expectante/Vigilância |\n| **Tipo II** | Diástole zero ou reversa persistente | Insuficiência placentária severa | Reservado | Parto prematuro/Intervenção |\n| **Tipo III** | Fluxo diastólico intermitente/cíclico | Anastomoses AA grandes | Imprevisível | Vigilância rigorosa/Intervenção |\n\n## 5. Morte Intrauterina de um Co-Gemelar: Riscos ao Sobrevivente & Conduta\n\n*   **Fisiopatologia:** O óbito de um feto MC causa uma queda brusca da pressão vascular na placenta do feto morto. O feto vivo sofre uma exsanguinação aguda através das anastomoses vasculares para o leito de baixa resistência do feto morto.\n*   **Repercussões:** Choque hipovolêmico, hipotensão súbita e hipoperfusão cerebral, resultando em lesões como Leucomalácia Periventricular, porencefalia e paralisia cerebral.\n\n> [!WARNING] Armadilha Clássica de Prova: Não Indicar Cesariana de Emergência Imediata\n> A lesão isquêmica ocorre no momento do óbito. A cesariana imediata não reverte a lesão e expõe o feto à prematuridade iatrogênica. A conduta é: estabilização materna, avaliação do feto vivo (Doppler de ACM para anemia) e RNM de encéfalo após 2-3 semanas.\n\n## 6. Algoritmo Decisório na Suspeita de Complicações Monocoriônicas\n\n### Passo a Passo Sintético da Cascata Decisória\n\n1.  **[Triagem Ultrassonográfica]:** Realizar USG obstétrico com Doppler entre 11-14 semanas para determinar a corionicidade (sinal do T).\n2.  **[Monitoramento de Risco]:** Em gestações MC, realizar USG quinzenal a partir de 16 semanas para avaliar volume de líquido amniótico e Doppler de ACM.\n3.  **[Diagnóstico Diferencial]:** Se houver discordância de líquido, aplicar critérios de Quintero (STFF). Se o líquido for normal, avaliar PVS-ACM (TAPS) e Doppler de artéria umbilical (RCFs).\n4.  **[Intervenção Fetal]:** Diante de STFF estágios II a IV de Quintero, a conduta padrão-ouro é a **fotocoagulação a laser das anastomoses vasculares placentárias**.\n\n## Diretrizes Oficiais & Consensos de Referência\n*   **FEBRASGO:** Manual de Orientação em Obstetrícia (Gestação Múltipla).\n*   **ISUOG:** Practice Guidelines for the ultrasound assessment of the fetus.\n*   **ACOG/SMFM:** Practice Bulletin on Multifetal Gestations.\n*   **FIGO:** Guidelines on the management of monochorionic twins."
  },
  {
    id: "mat-gem-03",
    focusId: "obs-gem-stff",
    title: "Síndrome da Transfusão Feto-Fetal (STFF)",
    specialty: "Ginecologia e Obstetrícia",
    theme: "Gestação Múltipla",
    focus: "Síndrome da Transfusão Feto-Fetal",
    readTimeMinutes: 12,
    lastUpdatedYear: 2026,
    guidelineBadge: "FEBRASGO / Eurofetus / ISUOG",
    summarySnippet: "Critérios diagnósticos ultrassonográficos obrigatórios, fisiopatologia do doador vs. receptor, classificação completa de Quintero (I a V), ablação vascular a laser e técnicas paliativas.",
    keyPoints: [
          "STFF é complicação exclusiva de gestações monocoriônicas diamnióticas por desbalanço de anastomoses arteriovenosas profundas.",
          "O diagnóstico exige obrigatoriamente oligoâmnio no doador (MBV < 2 cm) associado a polidrâmnio no receptor (MBV > 8 cm até 20 sem ou > 10 cm após).",
          "Discordância de peso ou de tamanho fetal NÃO é critério diagnóstico obrigatório de STFF.",
          "Quintero II = bexiga do doador invisível; Quintero III = Doppler alterado (diástole zero/reversa na AU ou onda A reversa no DV); Quintero IV = hidropisia; Quintero V = óbito.",
          "O tratamento padrão-ouro de 1ª linha entre 16 e 26 semanas é a fotocoagulação a laser das anastomoses vasculares por fetoscopia (Técnica de Solomon).",
          "A amniodrenagem seriada é um tratamento secundário/paliativo de alívio para quando o laser é indisponível ou após 26 semanas.",
          "Sem intervenção fetal, a mortalidade perinatal na STFF grave (Quintero II a IV) ultrapassa 90% dos casos."
    ],
    markdownContent: "---\n\n## 1. O Que Mais Cai: Critérios Diagnósticos Ultrassonográficos Obrigatórios\n\nA Síndrome da Transfusão Feto-Fetal (STFF) é o tema de maior peso dentro do capítulo de gestação múltipla em provas de R1 e R3. A cobrança foca na distinção clara entre STFF e CIUR seletivo, além do reconhecimento imediato dos critérios de Quintero. Estatisticamente, 85% das questões exigem que o candidato identifique o diagnóstico baseado exclusivamente no volume de líquido amniótico, sem se deixar confundir por parâmetros de peso.\n\n```gem-stats-stff\nRecorrência Temática de Síndrome da Transfusão Feto-Fetal\n- Diagnóstico e Critérios de Quintero: 65%\n- Conduta (Laser vs. Amniodrenagem): 25%\n- Fisiopatologia e Complicações: 10%\n```\n\n### Critérios Diagnósticos Obrigatórios de STFF (Cai em 100% das bancas)\nPara o diagnóstico de STFF, é imperativo o preenchimento concomitante dos seguintes critérios:\n\n1.  **Gestação Monocoriônica Diamniótica (MCDA):** Presença de sinal do \"T\" (ausência de sinal do lambda) e placenta única.\n2.  **Oligoâmnio no Feto Doador:** Maior Bolsão Vertical (MBV) **< 2 cm**.\n3.  **Polidrâmnio no Feto Receptor:** Maior Bolsão Vertical (MBV) **> 8 cm** (até 20 semanas) ou **> 10 cm** (após 20 semanas).\n\n$$\\text{Feto Doador (Oligoidrâmnio)} \\implies \\text{MBV} < 2\\text{ cm}$$\n$$\\text{Feto Receptor (Polidrâmnio)} \\implies \\text{MBV} > 8\\text{ cm }(\\le 20\\text{ sem}) \\quad\\lor\\quad \\text{MBV} > 10\\text{ cm }(> 20\\text{ sem})$$\n$$\\text{Estádios Quintero: I (Líquido)} \\implies \\text{II (Bexiga)} \\implies \\text{III (Doppler)} \\implies \\text{IV (Hidrops)} \\implies \\text{V (Óbito)}$$\n\n> [!WARNING] Armadilha Clássica de Prova: A Pegadinha da Discordância de Peso\n> As bancas adoram colocar como alternativa: \"Diagnóstico firmado por discordância de peso > 20%\". **ISSO É FALSO.** A discordância de peso é o critério definidor do Crescimento Intrauterino Restrito (CIUR) seletivo, NÃO é critério diagnóstico de STFF. A STFF é definida estritamente pela discrepância de volume amniótico (sequência oligo-poli).\n\n---\n\n## 2. Fisiopatologia Comparativa: Feto Doador (Stuck Twin) vs. Receptor (Sobrecarga)\n\nA STFF decorre de anastomoses vasculares placentárias desbalanceadas (predominantemente arteriovenosas - AV), que geram um fluxo unidirecional de um feto para o outro.\n\n| Parâmetro Clínico | Feto Doador (Hipovolêmico) | Feto Receptor (Hipervolêmico) | Fisiopatologia Subjacente |\n| :--- | :--- | :--- | :--- |\n| **Volemia** | Hipovolemia / Desidratação | Hipervolemia / Pletora | Shunt vascular unidirecional através de anastomoses AV. |\n| **Função Renal** | Oligúria / Anúria | Poliúria acentuada | Hipoperfusão renal (Doador) vs. Aumento do PNA e diurese osmótica (Receptor). |\n| **Bexiga Fetal** | Pequena, colapsada ou invisível | Muito distendida e cheia | Reflexo direto da taxa de filtração glomerular e produção de urina. |\n| **Líquido Amniótico** | Oligoâmnio grave (*stuck twin*) | Polidrâmnio tenso | A urina fetal é o principal componente do líquido amniótico no 2º trimestre. |\n| **Sistema CV** | Coração normal ou comprimido | Cardiomegalia e Hipertrofia | Sobrecarga pressórica e volumétrica no receptor leva à disfunção diastólica e sistólica. |\n| **Peso e Crescimento** | Habitualmente menor (CIUR) | Maior / Hidrópico | O doador sofre de insuficiência placentária relativa; o receptor de sobrecarga hídrica. |\n| **Hematimetria** | Anemia (nem sempre grave) | Policitemia | Transferência de massa eritrocitária (mais evidente na TAPS, mas presente na STFF). |\n\n---\n\n## 3. Classificação de Quintero (Estádios I a V) & Achados de Doppler Fetal\n\nO estadiamento de Quintero é a ferramenta prognóstica e decisória mais importante. O Doppler não define a síndrome, mas define o **Estádio III**.\n\n| Estádio | Critérios Diagnósticos Exatos | Achados de Doppler Fetal | Significado / Conduta |\n| :--- | :--- | :--- | :--- |\n| **I** | Sequência Oligo/Poli (MBV <2 e >8/10) | Doppler normal em ambos os fetos. | **Bexiga do doador visível.** Conduta expectante ou Laser. |\n| **II** | Critérios de Estádio I presentes | Doppler ainda normal. | **Bexiga do doador NÃO visualizada.** Progressão da hipovolemia. |\n| **III** | Critérios de Estádio I ou II | **Doppler Criticamente Alterado:** AU com diástole zero/reversa; DV com onda A reversa; ou VU pulsátil. | **Disfunção cardiovascular instalada.** Indicação absoluta de Laser. |\n| **IV** | Presença de Hidropisia Fetal | Sinais de falência cardíaca (ascite, derrame, edema subcutâneo). | Geralmente no receptor. Prognóstico reservado sem intervenção imediata. |\n| **V** | Óbito de um ou ambos os fetos | Ausência de batimentos cardiofetais. | Risco de sequela neurológica grave (20-30%) para o sobrevivente. |\n\n*Legenda: AU (Artéria Umbilical); DV (Ducto Venoso); VU (Veia Umbilical).*\n\n---\n\n## 4. Tratamento Padrão-Ouro: Ablação a Laser por Fetoscopia (Técnica de Solomon)\n\nO tratamento visa interromper a comunicação vascular entre os fetos, transformando a placenta monocoriônica em uma placenta funcionalmente dicoriônica.\n\n*   **Procedimento de Escolha:** Fotocoagulação a Laser das anastomoses vasculares da placa coriônica guiada por fetoscopia.\n*   **Técnica de Solomon:** Consiste na coagulação completa em linha contínua de todo o equador vascular placentário (unindo os pontos das anastomoses). Esta técnica é superior à técnica seletiva simples pois reduz drasticamente a recorrência da STFF e a ocorrência de TAPS (Twin Anemia-Polycythemia Sequence) pós-procedimento.\n*   **Janela Terapêutica Ideal:** Entre **16 e 26 semanas** de gestação.\n*   **Indicações:** Quintero II, III e IV. O Estádio I é controverso, mas o laser é indicado se houver polidrâmnio sintomático (encurtamento cervical ou dor materna) ou progressão rápida.\n*   **Resultados:** Sobrevida de pelo menos um feto em > 80-85% dos casos. Reduz o risco de paralisia cerebral e atraso neuropsicomotor.\n\n---\n\n## 5. Procedimentos Alternativos e Manejo Paliativo (Amniodrenagem Seriada)\n\nA amniodrenagem não trata a causa (anastomoses), apenas as consequências (pressão intra-amniótica).\n\n*   **Amniodrenagem Descompressiva:** Drenagem lenta de grande volume (1 a 3 litros) do saco do receptor.\n    *   *Indicação:* Quando o laser não está disponível, em casos de Quintero I estável, ou em idades gestacionais avançadas (> 26-28 semanas) onde o risco da fetoscopia supera o benefício.\n    *   *Objetivo:* Reduzir risco de rotura de membranas e parto prematuro extremo.\n*   **Septostomia:** Punção deliberada da membrana intergemelar para equilibrar as pressões. **Atualmente proscrita** devido ao risco de criar uma pseudo-monoamniocididade com entrelaçamento de cordão e óbito fetal.\n\n---\n\n## 6. Algoritmo Decisório no Diagnóstico e Manejo da STFF\n\n### Passo a Passo Sintético da Cascata Decisória\n\n1.  **[Confirmar Corionocidade]:** Identificar gestação monocoriônica (Sinal do T) entre 11-14 semanas. Se monocoriônica, USG quinzenal a partir de 16 semanas.\n2.  **[Triagem de Líquido]:** Avaliar MBV em todos os exames. Se MBV < 2 cm em um saco e > 8 cm no outro, o diagnóstico de STFF está firmado.\n3.  **[Estadiar por Quintero]:** Procurar ativamente pela bexiga do doador (Estádio II) e realizar Doppler de AU, DV e VU em ambos os fetos (Estádio III).\n4.  **[Definir Terapia]:** Se Quintero ≥ II e IG entre 16-26 semanas, encaminhar imediatamente para **Ablação a Laser (Técnica de Solomon)**.\n5.  **[Vigilância Pós-Procedimento]:** Monitorar semanalmente com Doppler e USG para detectar TAPS pós-laser ou recorrência. Parto planejado geralmente entre 34-36 semanas se estável.\n\n---\n\n## Diretrizes Oficiais & Consensos de Referência\n\n*   **FEBRASGO (Tratado de Obstetrícia):** Reafirma o laser como padrão-ouro para Quintero ≥ II.\n*   **Eurofetus Consortium:** Estudo seminal que estabeleceu a superioridade do laser sobre a amniodrenagem.\n*   **ISUOG (International Society of Ultrasound in Obstetrics and Gynecology):** Define os padrões técnicos para o rastreio Doppler e medida do MBV.\n*   **ACOG (Practice Bulletin 231):** Manejo de gestações multifetais e critérios de intervenção fetal.\n*   **FIGO:** Diretrizes globais para cirurgia fetal em países de média e baixa renda."
  },
  {
    id: "mat-gem-04",
    focusId: "obs-gem-parto",
    title: "Assistência ao Parto e Momento da Interrupção na Gestação Múltipla",
    specialty: "Ginecologia e Obstetrícia",
    theme: "Gestação Múltipla",
    focus: "Parto em Gestação Múltipla",
    readTimeMinutes: 10,
    lastUpdatedYear: 2026,
    guidelineBadge: "FEBRASGO / ACOG / NICE",
    summarySnippet: "Cronograma rigoroso de idade gestacional por corionicidade, algoritmo de vias de parto por apresentações combinadas, critérios para parto vaginal, manejo ativo do 2º gemelar e profilaxia da hemorragia puerperal.",
    keyPoints: [
          "Idade gestacional programada: DCDA = 37-38s; MCDA = 36-37s; MCMA = 32-34s (cesariana obrigatória pós-corticoide).",
          "Se o 1º gemelar for não-cefálico (pélvico ou córmico), a indicação de cesariana é absoluta pelo risco de engastamento.",
          "Com 1º feto cefálico e 2º cefálico, a via de escolha é o parto vaginal.",
          "Com 1º cefálico e 2º não-cefálico, o parto vaginal é permitido em concepto > 1.500g e equipe habilitada em versão podálica.",
          "O clampeamento do cordão do 1º concepto deve ser imediato para evitar exsanguinação caso existam anastomoses placentárias.",
          "O intervalo entre os conceptos pode ser de até 30 minutos desde que a monitorização fetal contínua permaneça estritamente normal.",
          "A principal complicação puerperal é a hemorragia por atonia uterina pela sobredistensão, exigindo profilaxia universal com ocitocina."
    ],
    markdownContent: "---\n\n## 1. O Que Mais Cai: Idade Gestacional de Interrupção por Corionicidade\n\nA definição do momento do parto na gestação múltipla é um dos temas mais recorrentes em provas de R1 e R3, fundamentando-se no equilíbrio crítico entre o risco de **mortalidade perinatal in utero** (que aumenta exponencialmente após certas idades gestacionais) e os riscos da **prematuridade tardia**. O divisor de águas é a **corionicidade**, e não a zigosidade. Em provas como USP e ENARE, a cobrança foca na redução do risco de óbito fetal súbito em gestações monocoriônicas devido às anastomoses vasculares placentárias.\n\n```gem-stats-parto\nRecorrência Temática de Parto em Gestação Múltipla\n- Momento do Parto/Corionicidade: 45%\n- Via de Parto/Apresentação Fetal: 35%\n- Manejo do 2º Gemelar e HPP: 20%\n```\n\n### Tabela Canônica do Momento Programado do Parto\n\n| Tipo de Placentação | Idade Gestacional Recomendada | Via de Parto Padrão | Justificativa Fisiopatológica / Evidência |\n| :--- | :--- | :--- | :--- |\n| **Dicoriônica Diamniótica (DCDA)** | 37s 0d a 38s 6d | Depende da apresentação | Após 38s, o risco de óbito fetal supera o benefício da manutenção intrauterina. |\n| **Monocoriônica Diamniótica (MCDA)** | 36s 0d a 37s 0d | Depende da apresentação | Risco de complicações vasculares (STFF, TAPS) e óbito súbito de um dos fetos. |\n| **Monocoriônica Monoamniótica (MCMA)** | 32s 0d a 34s 0d | **Cesariana Eletiva** | Risco crítico de entrelaçamento de cordões e acidentes funiculares fatais. |\n| **Gêmeos Unidos (Siameses)** | 34s 0d a 36s 0d | **Cesariana Eletiva** | Necessidade de planejamento cirúrgico e incisão uterina ampla (clássica/corporal). |\n\n---\n\n## 2. Seleção da Via de Parto Conforme Apresentação Combinada dos Fetos\n\nA decisão sobre a via de parto é pautada no **Twin Birth Study**, que demonstrou que, preenchidos os critérios de segurança, a via vaginal não aumenta a morbimortalidade neonatal em comparação à cesariana programada quando o primeiro feto é cefálico.\n\n$$\\text{G1 Cefálico} + \\text{G2 Cefálico / Não-Cefálico} \\implies \\text{Parto Vaginal (Via Preferencial / Permitida)}$$\n$$\\text{G1 Não-Cefálico (Pélvico / Córmico)} \\implies \\text{Cesariana Eletiva (Indicação Absoluta)}$$\n$$\\text{Gestação Monoamniótica (MCMA)} \\implies \\text{Cesariana Eletiva Obrigatória (32 a 34 semanas)}$$\n\n### Matriz de Apresentações Fetais e Conduta\n\n| Apresentação Fetal Combinada | Frequência | Via de Parto Recomendada | Condições e Cuidados de Sala de Parto |\n| :--- | :--- | :--- | :--- |\n| **1º Cefálico / 2º Cefálico** | ~40% | **Parto Vaginal** | Conduta idêntica ao parto único; monitorização contínua de ambos os BCFs. |\n| **1º Cefálico / 2º Não-Cefálico** | ~35-40% | **Parto Vaginal (Permitido)** | Requer equipe experiente. Opções para o 2º feto: versão cefálica externa, versão podálica interna ou extração pélvica. |\n| **1º Não-Cefálico / Qualquer 2º** | ~20-25% | **Cesariana Eletiva** | Risco de \"engastamento de cabeças\" (colisão de mentos) se o 2º for cefálico e distócia de cabeça derradeira. |\n| **Gestação Monoamniótica** | < 1% | **Cesariana Eletiva** | Risco de prolapso e nó de cordão durante a descida do primeiro feto. |\n\n---\n\n## 3. Condições Clínicas e Critérios Mandatórios para o Parto Vaginal\n\nPara que o preceptor autorize a prova de trabalho de parto em gestação gemelar, os seguintes critérios da **FEBRASGO/ACOG** devem ser rigorosamente preenchidos:\n\n1.  **Apresentação do Primeiro Feto:** Obrigatoriamente **cefálica**.\n2.  **Idade Gestacional e Peso:** Idealmente $\\ge 32$ semanas e peso estimado entre $1.500\\text{ g}$ e $4.000\\text{ g}$.\n3.  **Discordância de Peso:** Diferença de peso entre os fetos $< 20-25\\%$. Se o segundo feto for muito maior que o primeiro, há risco de distócia após o nascimento do menor.\n4.  **Infraestrutura:** Disponibilidade de anestesia imediata, centro cirúrgico vago e equipe de neonatologia para dois conceptos simultâneos.\n5.  **Monitorização:** Cardiotocografia contínua com duplo transdutor (um para cada feto).\n\n> [!WARNING] Armadilha Clássica de Prova: Gemelaridade NÃO é Sinônimo de Cesariana\n> As bancas costumam afirmar que \"toda gravidez gemelar tem indicação de cesárea\". Isso é **FALSO**. Com o 1º feto cefálico e conceito a termo em DCDA ou MCDA, a via vaginal é segura, recomendada e tem desfechos neonatais equivalentes à cesariana programada (Twin Birth Study). A cesariana de urgência para o segundo gemelar após o parto vaginal do primeiro ocorre em apenas < 5% dos casos bem conduzidos.\n\n---\n\n## 4. Assistência Ativa ao Nascimento do Segundo Gemelar & Intervalo Seguro\n\nO período entre o nascimento do primeiro e do segundo feto é o momento de maior estresse para o obstetra. O descolamento prematuro de placenta (DPP) pode ocorrer devido à descompressão súbita do útero.\n\n### Protocolo de Manejo do Segundo Feto\n1.  **Clampeamento Imediato do Cordão do 1º:** Essencial em monocoriônicas para evitar que o 2º feto sofra hipovolemia/exsanguinação através das anastomoses placentárias.\n2.  **Avaliação Estática Imediata:** Realizar palpação abdominal e, preferencialmente, **ultrassonografia de cabeceira** para confirmar a nova apresentação do 2º feto (ele pode rodar após a saída do 1º).\n3.  **Estímulo à Dinâmica Uterina:** Se as contrações diminuírem, iniciar **ocitocina IV** para garantir a descida do segundo feto.\n4.  **Amniotomia Guiada:** Realizar a rotura das membranas do 2º feto apenas quando a apresentação estiver bem encaixada, visando prevenir o prolapso de cordão umbilical.\n5.  **Intervalo entre Nascimentos:** Historicamente fixado em 30 minutos, hoje a evidência mostra que **não há tempo limite rígido**, desde que a monitorização fetal (BCF) esteja normal e o útero apresente dinâmica.\n6.  **Versão Podálica Interna:** Se o 2º feto estiver em situação transversa, o obstetra introduz a mão no útero, busca os pés do feto e realiza a extração pélvica (procedimento de alta complexidade, comum em provas de R3).\n\n---\n\n## 5. Puerpério Imediato: Profilaxia Agressiva da Hemorragia Pós-Parto por Atonia\n\nA gestação múltipla é um fator de risco independente e maior para **Hemorragia Pós-Parto (HPP)**. O mecanismo é a **atonia uterina** por sobredistensão das fibras miometrias (Lei de Laplace aplicada ao útero).\n\n*   **Manejo Ativo do 3º Período:** Administração de **10 UI de Ocitocina IM** (ou IV lenta) imediatamente após o nascimento do **último** feto.\n*   **Revisão de Canal:** Inspeção rigorosa de colo e vagina, dado o maior risco de lacerações por manipulações intrauterinas.\n*   **Acesso Venoso:** Manter dois acessos calibrosos (14G ou 16G) e reserva de sangue disponível.\n*   **Vigilância (4º Período de Greenberg):** Monitorização do \"Globo de Segurança de Pinard\" a cada 15 minutos na primeira hora pós-parto.\n\n---\n\n## 6. Algoritmo Decisório no Parto da Gestação Múltipla\n\n### Passo a Passo Sintético da Cascata Decisória\n\n1.  **[Corionicidade]:** Definir a idade gestacional de interrupção (32-34s para MCMA; 36-37s para MCDA; 37-38s para DCDA).\n2.  **[Apresentação do 1º Feto]:** Se não-cefálico, agendar **Cesariana**. Se cefálico, avaliar critérios para parto vaginal.\n3.  **[Peso e Viabilidade]:** Confirmar peso $> 1.500\\text{ g}$ e ausência de contraindicações obstétricas (ex: placenta prévia).\n4.  **[Condução do 2º Feto]:** Após o 1º nascimento, estabilizar a apresentação do 2º feto (manobras de Leopold/USG) e manter ocitocina.\n5.  **[Prevenção de HPP]:** Aplicar protocolo de ocitocina profilática e vigilância rigorosa do tônus uterino no pós-parto imediato.\n\n---\n\n## Diretrizes Oficiais & Consensos de Referência\n*   **FEBRASGO:** Manual de Obstetrícia - Gestação Múltipla (2021/2023).\n*   **ACOG Practice Bulletin No. 231:** Multifetal Gestations.\n*   **NICE Guideline [NG137]:** Twin and triplet pregnancy.\n*   **Twin Birth Study (Barrett et al., NEJM):** Referência mundial para via de parto.\n*   **Ministério da Saúde (Brasil):** Cadernos de Atenção Básica e Pré-natal de Alto Risco."
  }
];
