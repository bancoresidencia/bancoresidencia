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
}
];
