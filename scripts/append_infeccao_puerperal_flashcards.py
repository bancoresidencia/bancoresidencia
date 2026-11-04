#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys
import json
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CARDS = [
  # Subfoco 1: Antibioticoterapia na Infecção Puerperal (10 cards)
  {
    "id": "fc-obs-inf-01",
    "type": "direct",
    "front": "Qual o esquema antibiótico intravenoso padrão-ouro de primeira linha para o tratamento hospitalar da endometrite puerperal?",
    "back": "Clindamicina (900 mg IV 8/8h) + Gentamicina (5 mg/kg IV 1x/dia).",
    "comment": "A clindamicina cobre anaeróbios estritos (Bacteroides) e cocos gram-positivos; a gentamicina cobre gram-negativos entéricos (E. coli). Diretriz FEBRASGO/ACOG.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "essential",
    "tags": ["obstetricia", "puerperio", "infeccao-puerperal", "endometrite", "antibiotico"]
  },
  {
    "id": "fc-obs-inf-02",
    "type": "direct",
    "front": "Qual o critério clínico padronizado para suspensão segura da antibioticoterapia venosa na endometrite puerperal não complicada?",
    "back": "Manutenção da paciente afebril e assintomática por 48 horas consecutivas.",
    "comment": "Após 48h afebril, com melhora da dor uterina e trânsito intestinal preservado, suspende-se o antibiótico. Não há indicação de terapia oral ambulatorial.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "essential",
    "tags": ["obstetricia", "endometrite", "criterio-cura", "antibiotico"]
  },
  {
    "id": "fc-obs-inf-03",
    "type": "cloze",
    "front": "Após o término da antibioticoterapia venosa e alcance da cura clínica na endometrite, {{c1::não há indicação}} de prescrever antibióticos orais ambulatoriais.",
    "back": "não há indicação (prescrição oral ambulatorial foi revogada)",
    "comment": "Pegadinha clássica de prova: prescrever 7 a 10 dias de cefalexina ou amoxicilina pós-alta é conduta antiga desaconselhada que apenas seleciona resistência bacteriana.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "essential",
    "tags": ["obstetricia", "endometrite", "pegadinha-prova", "diretrizes"]
  },
  {
    "id": "fc-obs-inf-04",
    "type": "direct",
    "front": "Em paciente com endometrite puerperal que mantém febre após 48-72h de Clindamicina + Gentamicina, qual antimicrobiano deve ser adicionado para cobrir Enterococcus faecalis?",
    "back": "Ampicilina (2g IV a cada 6 horas).",
    "comment": "O Enterococcus faecalis é intrinsecamente resistente à clindamicina e tem sensibilidade variável a aminoglicosídeos isolados. A ampicilina fornece cobertura sinérgica.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "standard",
    "tags": ["obstetricia", "endometrite", "enterococo", "ampicilina"]
  },
  {
    "id": "fc-obs-inf-05",
    "type": "cloze",
    "front": "Na endometrite puerperal, a posologia atualizada recomendada de Gentamicina é em dose única diária de {{c1::5 mg/kg/dia IV}}, reduzindo o risco de nefrotoxicidade materna.",
    "back": "5 mg/kg/dia IV (dose única diária)",
    "comment": "A administração em dose única diária aproveita a morte bacteriana pico-dependente e reduz o acúmulo no córtex renal, superando o esquema antigo fracionado 8/8h.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "essential",
    "tags": ["obstetricia", "farmacologia", "gentamicina", "dose-unica"]
  },
  {
    "id": "fc-obs-inf-06",
    "type": "direct",
    "front": "Qual alternativa antimicrobiana venosa de primeira linha é recomendada para puérpera com endometrite e histórico de alergia anafilática à penicilina e clindamicina?",
    "back": "Gentamicina + Metronidazol (500 mg IV a cada 8 horas).",
    "comment": "O metronidazol cobre os anaeróbios estritos da flora pélvica de forma potente, substituindo a clindamicina em pacientes com hipersensibilidade.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "standard",
    "tags": ["obstetricia", "alergia", "metronidazol", "anaerobios"]
  },
  {
    "id": "fc-obs-inf-07",
    "type": "clinical_case",
    "front": "Puérpera no 3º DPO de cesárea apresenta febre de 38,9°C, útero doloroso acima da cicatriz umbilical e lóquios fétidos. Iniciada Clindamicina + Gentamicina. Após 48h está afebril, sem dor e tolerando dieta. Qual a conduta?",
    "back": "Manter o esquema venoso por mais 24h (total 48h afebril) e dar alta sem antibiótico oral.",
    "comment": "Atingidas 48h de apirexia e assintomática, a alta hospitalar é autorizada sem qualquer necessidade de complemento com cefalosporina ou amoxicilina por via oral.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "essential",
    "tags": ["caso-clinico", "obstetricia", "endometrite", "alta-hospitalar"]
  },
  {
    "id": "fc-obs-inf-08",
    "type": "mechanism",
    "front": "Qual a base farmacodinâmica que justifica a eficácia superior da Gentamicina em dose única diária (5 mg/kg/dia) na infecção puerperal comparada ao regime 8/8h?",
    "back": "Ação bactericida concentração-dependente (Cmax/MIC) e efeito pós-antibiótico prolongado.",
    "comment": "Aminoglicosídeos dependem do pico sérico para matar bacilos gram-negativos. Picos altos com vales baixos maximizam o efeito bactericida e diminuem nefro/ototoxicidade.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "standard",
    "tags": ["farmacologia", "gentamicina", "farmacodinamica", "mecanismo"]
  },
  {
    "id": "fc-obs-inf-09",
    "type": "cloze",
    "front": "Em casos de endometrite puerperal grave com instabilidade hemodinâmica ou choque séptico refratário, a ampliação empírica de espectro deve incluir {{c1::Meropenem ou Piperacilina-Tazobactam}}.",
    "back": "Meropenem ou Piperacilina-Tazobactam (carbapenêmico / antipseudomonas)",
    "comment": "Casos graves com disfunção orgânica puerperal exigem espectro estendido contra enterobactérias produtoras de ESBL e anaeróbios resistentes em ambiente de UTI.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "standard",
    "tags": ["sepse-materna", "uti", "carbapenemico", "choque-septico"]
  },
  {
    "id": "fc-obs-inf-10",
    "type": "direct",
    "front": "Por que a coleta de swab vaginal para cultura é contraindicada como guia terapêutico inicial na endometrite puerperal?",
    "back": "Porque a amostra é inevitavelmente contaminada pela flora bacteriana comensal da vagina.",
    "comment": "O swab vaginal isola contaminantes da microbiota saprófita, não refletindo os patógenos invasivos intracavitários. O tratamento da endometrite é estritamente clínico e empírico.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Antibioticoterapia na Infecção Puerperal",
    "priority": "standard",
    "tags": ["diagnostico", "cultura-vaginal", "microbiota", "armadilha-prova"]
  },

  # Subfoco 2: Endometrite Puerperal: Diagnóstico & Clínica (10 cards)
  {
    "id": "fc-obs-inf-11",
    "type": "direct",
    "front": "Quais são os 3 componentes semiológicos clássicos que compõem a chamada Tríade de Bumm na endometrite puerperal?",
    "back": "1. Febre; 2. Útero subinvoluído doloroso e amolecido; 3. Lóquios fétidos e escuros.",
    "comment": "A Tríade de Bumm é o achado sindrômico definidor da infecção intrauterina no exame físico obstétrico entre o 2º e o 5º dia pós-parto.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "essential",
    "tags": ["triade-de-bumm", "semiologia", "endometrite", "diagnostico"]
  },
  {
    "id": "fc-obs-inf-12",
    "type": "cloze",
    "front": "Na endometrite puerperal causada por Streptococcus do Grupo A (S. pyogenes), os lóquios podem apresentar-se paradoxalmente {{c1::inodoros e escassos}}, com sepse fulminante.",
    "back": "inodoros e escassos (endometrite inodora com rápida bacteremia)",
    "comment": "Pegadinha de prova: nem toda endometrite tem secreção fétida. O S. pyogenes produz exotoxinas pirogênicas sem odor pútrido característico dos anaeróbios, gerando choque séptico precoce.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "essential",
    "tags": ["streptococcus", "sepse", "loquios", "pegadinha-prova"]
  },
  {
    "id": "fc-obs-inf-13",
    "type": "direct",
    "front": "Qual o padrão fisiológico de regressão da altura uterina esperado após o parto, cuja falha caracteriza a subinvolução uterina infecciosa?",
    "back": "Redução de aproximadamente 1 cm por dia, tornando-se intrapélvico no 10º a 12º dia.",
    "comment": "Na endometrite, o miômetro edemaciado e inflamado não se contrai adequadamente, mantendo o fundo uterino palpável acima do esperado e com consistência pastosa.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "essential",
    "tags": ["semiologia", "involucao-uterina", "puerperio-fisiologico"]
  },
  {
    "id": "fc-obs-inf-14",
    "type": "clinical_case",
    "front": "Primigesta no 4º DPO de parto cesáreo apresenta calafrios, temperatura de 38,7°C, FC 115 bpm e dor no hipogástrio. Ao exame: útero na cicatriz umbilical, doloroso ao toque, lóquios achocolatados fétidos. Diagnóstico?",
    "back": "Endometrite puerperal (endomiometrite pós-cesárea).",
    "comment": "Quadro clássico com todos os componentes da Tríade de Bumm no período de maior incidência (3º a 5º dia pós-cesárea). Exige internação imediata e antibiótico venoso.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "essential",
    "tags": ["caso-clinico", "endometrite", "cesarea", "diagnostico"]
  },
  {
    "id": "fc-obs-inf-15",
    "type": "cloze",
    "front": "O principal mecanismo fisiopatológico de instalação da endometrite puerperal é a via {{c1::ascendente}}, com proliferação de bactérias do trato genital inferior no leito placentário.",
    "back": "ascendente (do trato genital inferior para a cavidade endometrial)",
    "comment": "A perda das barreiras mecânicas cervicais após a rotura de membranas e o parto permite que a flora mista colonize a ferida cruenta do leito de fixação placentária.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "standard",
    "tags": ["fisiopatologia", "mecanismo", "infeccao-ascendente"]
  },
  {
    "id": "fc-obs-inf-16",
    "type": "direct",
    "front": "Qual exame de imagem de primeira linha deve ser solicitado quando há suspeita de restos placentários infectados ou hematoma em paciente com endometrite?",
    "back": "Ultrassonografia pélvica transvaginal (com estudo Doppler).",
    "comment": "O ultrassom avalia a espessura da linha endometrial, presença de ecos heterogêneos sugestivos de restos ovulares retidos e fluxo vascular trofoblástico anormal.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "standard",
    "tags": ["ultrassom", "imagem", "restos-placentarios", "doppler"]
  },
  {
    "id": "fc-obs-inf-17",
    "type": "cloze",
    "front": "A presença de gás na cavidade endometrial ao ultrassom nos primeiros dias pós-parto {{c1::pode ser um achado fisiológico normal}} e não fecha isoladamente diagnóstico de abscesso.",
    "back": "pode ser um achado fisiológico normal (ar introduzido no parto)",
    "comment": "Pegadinha de prova: pequenas bolhas de gás intracavitárias ocorrem pelo próprio ato do parto ou cesárea. O diagnóstico de gangrena ou abscesso exige clínica de toxemia e coleções volumosas.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "standard",
    "tags": ["ultrassom", "gas-uterino", "armadilha-prova"]
  },
  {
    "id": "fc-obs-inf-18",
    "type": "clinical_case",
    "front": "Puérpera no 5º DPO com diagnóstico de endometrite não apresenta lóquios visíveis ao exame especular, mas tem dor excruciante à palpação do útero distendido. Qual complicação anatômica suspeitar?",
    "back": "Loquiometra (retenção de lóquios purulentos por oclusão do colo uterino).",
    "comment": "A oclusão espasmódica ou por coágulos do canal cervical impede a drenagem dos lóquios, distendendo o útero com pus e aumentando a dor. A dilatação cervical alivia o quadro.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "standard",
    "tags": ["caso-clinico", "loquiometra", "complicacao", "colo-uterino"]
  },
  {
    "id": "fc-obs-inf-19",
    "type": "mechanism",
    "front": "Por que o leito de implantação placentária pós-parto é uma região de extrema vulnerabilidade à infecção bacteriana?",
    "back": "É uma grande superfície cruenta com trombos intravasculares e decídua desvitalizada exposta à flora ascendente.",
    "comment": "O descolamento da placenta deixa vasos abertos e tecido necrótico superficial, ambiente anaeróbio perfeito para proliferação de bactérias oportunistas da vagina.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "standard",
    "tags": ["fisiopatologia", "leito-placentario", "decidua", "mecanismo"]
  },
  {
    "id": "fc-obs-inf-20",
    "type": "direct",
    "front": "Quando está formalmente indicada a curetagem uterina na puérpera com infecção puerperal?",
    "back": "Apenas quando há evidência ultrassonográfica inequívoca de restos placentários retidos.",
    "comment": "A curetagem às cegas no puerpério imediato sem restos comprovados eleva dramaticamente o risco de perfuração miometrial (útero friável) e de Sinéquias Uterinas (Síndrome de Asherman).",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Endometrite Puerperal: Diagnóstico & Clínica",
    "priority": "standard",
    "tags": ["curetagem", "restos-ovulares", "perfuracao-uterina", "asherman"]
  },

  # Subfoco 3: Fatores de Risco & Profilaxia na Cesárea (7 cards)
  {
    "id": "fc-obs-inf-21",
    "type": "direct",
    "front": "Qual é o fator de risco isolado mais importante para o desenvolvimento de infecção puerperal e endometrite?",
    "back": "Parto Cesáreo (risco 10 a 30 vezes maior que o parto vaginal).",
    "comment": "A cesariana combina abertura da cavidade peritoneal, histerotomia em segmento uterino, manuseio cirúrgico, perda sanguínea e inoculação direta da flora bacteriana.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Fatores de Risco & Profilaxia na Cesárea",
    "priority": "essential",
    "tags": ["cesarea", "fatores-de-risco", "epidemiologia"]
  },
  {
    "id": "fc-obs-inf-22",
    "type": "cloze",
    "front": "A dose padrão de Cefazolina profilática na cesariana deve ser aumentada de 2g para {{c1::3g IV}} em gestantes com peso ≥ 120 kg ou IMC ≥ 35 kg/m².",
    "back": "3g IV (ajuste obrigatório na obesidade severa)",
    "comment": "Diretrizes ACOG/CDC e FEBRASGO atualizadas recomendam 3g de Cefazolina para compensar o maior volume de distribuição e manter níveis bactericidas no panículo adiposo.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Fatores de Risco & Profilaxia na Cesárea",
    "priority": "essential",
    "tags": ["cefazolina", "obesidade", "profilaxia", "diretrizes"]
  },
  {
    "id": "fc-obs-inf-23",
    "type": "direct",
    "front": "Qual o momento preconizado pelas diretrizes atuais (FEBRASGO/ACOG/CDC) para a administração da antibioticoprofilaxia na cesariana?",
    "back": "30 a 60 minutos antes da incisão na pele (durante a indução anestésica).",
    "comment": "Administrar o antibiótico antes da incisão atinge concentração tecidual bactericida ideal no momento da diérese, reduzindo pela metade a taxa de endometrite e infecção de sítio cirúrgico.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Fatores de Risco & Profilaxia na Cesárea",
    "priority": "essential",
    "tags": ["profilaxia", "timing", "inducao-anestesica", "cesarea"]
  },
  {
    "id": "fc-obs-inf-24",
    "type": "cloze",
    "front": "Em gestantes alérgicas à penicilina com anafilaxia submetidas a parto cesáreo, o esquema profilático de escolha substitutivo à Cefazolina é {{c1::Clindamicina (900mg) + Gentamicina (5mg/kg)}}.",
    "back": "Clindamicina (900mg) + Gentamicina (5mg/kg) IV",
    "comment": "Na contraindicação aos beta-lactâmicos por reação anafilática mediada por IgE, a associação de lincosamida e aminoglicosídeo provê cobertura estafilocócica e para gram-negativos.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Fatores de Risco & Profilaxia na Cesárea",
    "priority": "standard",
    "tags": ["alergia-penicilina", "profilaxia-alternativa", "cesarea"]
  },
  {
    "id": "fc-obs-inf-25",
    "type": "clinical_case",
    "front": "Primigesta em trabalho de parto há 14h, bolsa rota há 9h com 7 toques vaginais evolui com parada de progressão e indicação de cesárea. Além da Cefazolina, qual droga pode ser associada para profilaxia estendida?",
    "back": "Azitromicina (500 mg IV em infusão lenta).",
    "comment": "O ensaio clínico C-STUDY demonstrou que a adição de Azitromicina à Cefazolina na cesárea intraparto ou após bolsa rota reduz expressivamente a endometrite e infecção incisional.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Fatores de Risco & Profilaxia na Cesárea",
    "priority": "essential",
    "tags": ["caso-clinico", "azitromicina", "c-study", "profilaxia-estendida"]
  },
  {
    "id": "fc-obs-inf-26",
    "type": "direct",
    "front": "Cite dois fatores obstétricos intraparto que aumentam de forma independente o risco de infecção puerperal no parto vaginal.",
    "back": "Bolsa rota prolongada (> 6 a 18 horas) e toques vaginais múltiplos (≥ 5 toques).",
    "comment": "A perda da barreira das membranas ovulares e toques repetidos facilitam a ascensão mecânica e colonização endometrial pelos patógenos cervicovaginais.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Fatores de Risco & Profilaxia na Cesárea",
    "priority": "standard",
    "tags": ["fatores-de-risco", "parto-vaginal", "bolsa-rota", "toque-vaginal"]
  },
  {
    "id": "fc-obs-inf-27",
    "type": "cloze",
    "front": "A dequitação placentária na cesariana deve ser conduzida preferencialmente por {{c1::tração controlada do cordão umbilical}}, evitando a curagem manual rotineira.",
    "back": "tração controlada do cordão (reduz risco infeccioso e sangramento)",
    "comment": "A remoção manual rotineira da placenta na cesárea aumenta a contaminação miometrial e o sangramento, elevando a taxa de infecção em relação à dequitação espontânea tracionada.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Fatores de Risco & Profilaxia na Cesárea",
    "priority": "standard",
    "tags": ["dequitacao", "curagem-manual", "tecnica-cirurgica"]
  },

  # Subfoco 4: Morbidade Febril Puerperal & Critérios (5 cards)
  {
    "id": "fc-obs-inf-28",
    "type": "direct",
    "front": "Qual a definição cronológica e térmica formal da Morbidade Febril Puerperal segundo a FEBRASGO e a Organização Mundial da Saúde?",
    "back": "Temperatura oral ≥ 38,0°C em pelo menos 2 dias diferentes, nos primeiros 10 dias pós-parto, excluídas as primeiras 24h.",
    "comment": "Critério estrito de prova: o primeiro dia (primeiras 24 horas) é formalmente excluído da contagem diagnóstica por abrigar alterações térmicas fisiológicas.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Morbidade Febril Puerperal & Critérios",
    "priority": "essential",
    "tags": ["morbidade-febril", "criterios-oms", "definicao", "febrasgo"]
  },
  {
    "id": "fc-obs-inf-29",
    "type": "cloze",
    "front": "A aferição da temperatura na puérpera deve ser realizada obrigatoriamente por via {{c1::oral}}, evitando a via axilar que é falseada pela apojadura mamária.",
    "back": "oral (a via axilar sofre calor local do ingurgitamento mamário)",
    "comment": "O aumento da vascularização e a descida do leite (apojadura) elevam a temperatura axilar local em até 1°C sem que haja qualquer febre sistêmica ou infecção.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Morbidade Febril Puerperal & Critérios",
    "priority": "essential",
    "tags": ["afericao-oral", "apojadura", "temperatura", "semiologia"]
  },
  {
    "id": "fc-obs-inf-30",
    "type": "direct",
    "front": "Por que as primeiras 24 horas após o parto são formalmente excluídas da definição clássica de morbidade febril puerperal?",
    "back": "Picos febris isolados nas primeiras 24h decorrem frequentemente de desidratação e esforço muscular do parto.",
    "comment": "A febre isolada no 1º dia tem baixa correlação com infecção bacteriana bacterêmica, resolvendo-se habitualmente com hidratação oral ou venosa.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Morbidade Febril Puerperal & Critérios",
    "priority": "standard",
    "tags": ["febre-precoce", "desidratacao", "puerperio-fisiologico"]
  },
  {
    "id": "fc-obs-inf-31",
    "type": "clinical_case",
    "front": "Puérpera no 3º DPO de parto vaginal queixa-se de calor e mamas dolorosas. Temperatura axilar de 37,9°C. Mamas tensas e ingurgitadas bilateralmente, sem rubor em cunha. Útero contraído e lóquios serossanguíneos normais. Conduta?",
    "back": "Orientações de ordenha/amamentação e suporte térmico (apojadura mamária fisiológica; não prescrever antibiótico).",
    "comment": "Trata-se de apojadura mamária fisiológica. A febre da apojadura dura < 24h e não se acompanha de taquicardia ou toxemia. Antibioticoterapia é terminantemente errada.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Morbidade Febril Puerperal & Critérios",
    "priority": "standard",
    "tags": ["caso-clinico", "apojadura", "diagnostico-diferencial"]
  },
  {
    "id": "fc-obs-inf-32",
    "type": "cloze",
    "front": "Diante de febre materna persistente nas primeiras 24h pós-cesárea com taquipneia e estertores pulmonares em bases, a principal hipótese respiratória é {{c1::atelectasia pulmonar}}.",
    "back": "atelectasia pulmonar (causa respiratória líder no 1º DPO pós-anestesia)",
    "comment": "A hipoventilação pós-anestésica e dor incisional levam ao colapso alveolar precoce nas primeiras 24-48h. Tratamento é fisioterapia respiratória e deambulação precoce.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Morbidade Febril Puerperal & Critérios",
    "priority": "standard",
    "tags": ["atelectasia", "pos-operatorio", "febre-pulmonar"]
  },

  # Subfoco 5: Mastite Puerperal: Diagnóstico & Conduta (4 cards)
  {
    "id": "fc-obs-inf-33",
    "type": "direct",
    "front": "Qual o agente bacteriano mais frequentemente isolado na mastite puerperal aguda e qual a via de contaminação típica?",
    "back": "Staphylococcus aureus, transmitido a partir da nasofaringe do recém-nascido através de fissuras mamilares.",
    "comment": "O S. aureus penetra pelas soluções de continuidade da papila mamária e prolifera no leite estagnado por esvaziamento incompleto.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Mastite Puerperal: Diagnóstico & Conduta",
    "priority": "essential",
    "tags": ["mastite", "staphylococcus-aureus", "fissura-mamilar"]
  },
  {
    "id": "fc-obs-inf-34",
    "type": "direct",
    "front": "Qual a regra de ouro mandatória quanto à amamentação na mama afetada por mastite puerperal aguda não complicada?",
    "back": "A amamentação DEVE SER MANTIDA em ambas as mamas para garantir o esvaziamento glandular eficaz.",
    "comment": "Contraindicação absoluta de prova: JAMAIS suspender o aleitamento materno. A estase láctea piora o quadro infeccioso e acelera a evolução para abscesso mamário.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Mastite Puerperal: Diagnóstico & Conduta",
    "priority": "essential",
    "tags": ["mastite", "amamentacao", "regra-de-ouro", "manutencao-aleitamento"]
  },
  {
    "id": "fc-obs-inf-35",
    "type": "cloze",
    "front": "O tratamento antimicrobiano oral empírico de primeira escolha para mastite puerperal aguda com sinais inflamatórios exuberantes é {{c1::Cefalexina (500mg a cada 6 horas)}}.",
    "back": "Cefalexina (500mg VO 6/6h por 10 a 14 dias)",
    "comment": "A cefalosporina de 1ª geração fornece excelente cobertura contra Staphylococcus aureus sensível à meticilina (MSSA). Amoxicilina-clavulanato é alternativa aceita.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Mastite Puerperal: Diagnóstico & Conduta",
    "priority": "essential",
    "tags": ["mastite", "cefalexina", "antibioticoterapia", "tratamento"]
  },
  {
    "id": "fc-obs-inf-36",
    "type": "clinical_case",
    "front": "Puérpera na 3ª semana de aleitamento apresenta febre alta de 39°C com calafrios. Mama direita com área endurada, hiperemiada e dolorosa no quadrante superior externo. Ao USG: ausência de coleções fluidas. Conduta?",
    "back": "Iniciar Cefalexina 500mg VO 6/6h, analgésicos e ordenha/amamentação vigorosa na mama direita.",
    "comment": "Mastite puerperal aguda sem formação de abscesso. A amamentação frequente ou esvaziamento mecânico com ordenha é indispensável para resolução clínica.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Mastite Puerperal: Diagnóstico & Conduta",
    "priority": "standard",
    "tags": ["caso-clinico", "mastite", "cefalexina", "conduta"]
  },

  # Subfoco 6: Tromboflebite Pélvica Séptica & Complicações (4 cards)
  {
    "id": "fc-obs-inf-37",
    "type": "direct",
    "front": "Qual vaso sanguíneo pélvico é mais frequentemente acometido pela Tromboflebite Pélvica Séptica no pós-parto e por qual razão anatômica?",
    "back": "Veia ovariana direita (pelo maior comprimento, fluxo retrógrado e dilatação gravídica acentuada).",
    "comment": "Em até 90% dos casos de tromboflebite da veia ovariana, o vaso direito é o acometido, drenando diretamente na veia cava inferior.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Tromboflebite Pélvica Séptica & Complicações",
    "priority": "essential",
    "tags": ["tromboflebite", "veia-ovariana-direita", "anatomia", "complicacoes"]
  },
  {
    "id": "fc-obs-inf-38",
    "type": "cloze",
    "front": "O teste diagnóstico confirmatório e terapêutico na suspeita de Tromboflebite Pélvica Séptica refratária é o {{c1::Teste da Heparina}}, com melhora térmica em 48-72h.",
    "back": "Teste da Heparina (anticoagulação plena com heparina IV ou HBPM)",
    "comment": "A defervescência completa da febre após 48 a 72 horas de anticoagulação plena confirma o diagnóstico de TPS, descartando causas infecciosas puras refratárias.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Tromboflebite Pélvica Séptica & Complicações",
    "priority": "essential",
    "tags": ["teste-da-heparina", "tromboflebite", "anticoagulacao", "diagnostico"]
  },
  {
    "id": "fc-obs-inf-39",
    "type": "clinical_case",
    "front": "Puérpera no 6º DPO de cesárea mantém picos febris diários de 39,5°C apesar de 4 dias de Clindamicina + Gentamicina + Ampicilina. USG e TC de pelve não mostram abscessos ou restos. Paciente em bom estado geral. Hipótese e conduta?",
    "back": "Tromboflebite Pélvica Séptica; iniciar Heparina venosa plena ou Enoxaparina 1 mg/kg 12/12h.",
    "comment": "Quadro clássico: febre em agulha desproporcional ao exame físico inocente e refratária a antibióticos de amplo espectro. O início da heparina reverte a febre.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Tromboflebite Pélvica Séptica & Complicações",
    "priority": "essential",
    "tags": ["caso-clinico", "tromboflebite", "febre-em-picos", "heparina"]
  },
  {
    "id": "fc-obs-inf-40",
    "type": "direct",
    "front": "Qual a tríade clínica de alarme que exige desbridamento cirúrgico de emergência na infecção de parede abdominal pós-cesárea?",
    "back": "Crepitação subcutânea, anestesia cutânea focal e flictenas hemorrágicas (suspeita de Fasciíte Necrosante).",
    "comment": "A fasciíte necrotizante da ferida cirúrgica é uma emergência cirúrgica com mortalidade > 30%. Exige desbridamento cirúrgico imediato em centro cirúrgico e UTI.",
    "specialty": "Ginecologia e Obstetrícia",
    "theme": "Puerpério & Complicações Puerperais",
    "focus": "Infecção Puerperal",
    "subfocus": "Tromboflebite Pélvica Séptica & Complicações",
    "priority": "standard",
    "tags": ["fasciite-necrosante", "emergencia-cirurgica", "ferida-operatoria", "desbridamento"]
  }
]

def validate_card(card, index):
    errors = []
    cid = card.get("id")
    front = card.get("front", "")
    back = card.get("back", "")
    comment = card.get("comment", "")

    if not (10 <= len(front) <= 400):
        errors.append(f"[{cid}] 'front' deve ter entre 10 e 400 caracteres (tem {len(front)})")
    if not (2 <= len(back) <= 120):
        errors.append(f"[{cid}] 'back' deve ter entre 2 e 120 caracteres (tem {len(back)})")
    if not (20 <= len(comment) <= 350):
        errors.append(f"[{cid}] 'comment' deve ter entre 20 e 350 caracteres (tem {len(comment)})")

    card_type = card.get("type")
    if card_type == "cloze" and "{{c1::" not in front:
        errors.append(f"[{cid}] tipo 'cloze' requer marcador {{c1::...}} na frente")

    return errors

def main():
    print("=" * 60)
    print("🛡️ VALIDADOR DO CONTRATO ZOD DE FLASHCARDS FSRS v5")
    print("=" * 60)

    all_errors = []
    for i, c in enumerate(CARDS):
        errs = validate_card(c, i)
        if errs:
            all_errors.extend(errs)

    if all_errors:
        print(f"❌ {len(all_errors)} ERRO(S) DE CONTRATO DETECTADOS:")
        for e in all_errors:
            print(f"  • {e}")
        sys.exit(1)

    print(f"✅ Todos os {len(CARDS)} flashcards foram 100% aprovados nas regras Zod!")
    print(f"   • 'back' <= 120 caracteres rigorosamente atendido em todos os cards.")
    print(f"   • 'comment' <= 350 caracteres rigorosamente atendido em todos os cards.")
    print(f"   • Cloze deletions sanitizados e atômicos.")

    # Inserção no src/data/flashcardsData.ts
    base_dir = r'C:\bancoresidencia\bancoresidencia'
    ts_path = os.path.join(base_dir, 'src', 'data', 'flashcardsData.ts')

    with open(ts_path, 'r', encoding='utf-8') as f:
        ts_code = f.read()

    # Verificar se já foram adicionados
    if 'fc-obs-inf-01' in ts_code:
        print("⚠️ Flashcards já presentes em flashcardsData.ts!")
        return

    # Serializar lista de cards
    card_strings = []
    for c in CARDS:
        card_strings.append("  " + json.dumps(c, indent=2, ensure_ascii=False).replace('\n', '\n  '))

    cards_block = ",\n" + ",\n".join(card_strings)

    # Inserir antes de "];" final
    last_bracket = ts_code.rfind('];')
    if last_bracket == -1:
        print("❌ Fechamento do array ]; não encontrado em flashcardsData.ts")
        sys.exit(1)

    new_ts_code = ts_code[:last_bracket].rstrip() + cards_block + "\n];\n"

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(new_ts_code)

    print(f"🎉 {len(CARDS)} flashcards canônicos anexados com sucesso em src/data/flashcardsData.ts!")

if __name__ == '__main__':
    main()

