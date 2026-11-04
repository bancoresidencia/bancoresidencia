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
