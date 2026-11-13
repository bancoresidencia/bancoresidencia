// Catálogo Oficial de Bancas e Instituições Consolidadas
// Censo Real extraído diretamente das tabelas do banco
export interface CanonicalBancaItem {
  sigla: string;
  nome: string;
  count: number;
  uf: string;
  key: string;
  modalidades: string[];
}

export const CANONICAL_BANCAS_DIRECTORY: CanonicalBancaItem[] = [
  {
    "sigla": "SES-PE",
    "nome": "FAMERP",
    "count": 4005,
    "uf": "PE",
    "key": "SES-PE",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "USP-SP",
    "nome": "FAMERP",
    "count": 3614,
    "uf": "SP",
    "key": "USP-SP",
    "modalidades": [
      "Acesso Direto",
      "Revalida",
      "R+"
    ]
  },
  {
    "sigla": "AMP",
    "nome": "AMP",
    "count": 3393,
    "uf": "PR",
    "key": "AMP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "FMABC",
    "nome": "FAMERP",
    "count": 3145,
    "uf": "SP",
    "key": "FMABC",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "AMRIGS",
    "nome": "AMRIGS",
    "count": 2873,
    "uf": "RS",
    "key": "AMRIGS",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UNICAMP",
    "nome": "Hospital Angelina Caron",
    "count": 2698,
    "uf": "SP",
    "key": "UNICAMP",
    "modalidades": [
      "R+",
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SES-RJ",
    "nome": "FAMERP",
    "count": 2674,
    "uf": "RJ",
    "key": "SES-RJ",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFPR",
    "nome": "Fundação Escola de Saúde de Teresópolis",
    "count": 2621,
    "uf": "PR",
    "key": "UFPR",
    "modalidades": [
      "R+",
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SURCE",
    "nome": "SURCE",
    "count": 2573,
    "uf": "CE",
    "key": "SURCE",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "PUC-PR",
    "nome": "FAMERP",
    "count": 2535,
    "uf": "PR",
    "key": "PUC-PR",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "FAMERP",
    "nome": "FAMERP",
    "count": 2472,
    "uf": "SP",
    "key": "FAMERP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SUS-SP",
    "nome": "FAMERP",
    "count": 2464,
    "uf": "SP",
    "key": "SUS-SP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "CERMAM",
    "nome": "CERMAM",
    "count": 2228,
    "uf": "Nacional",
    "key": "CERMAM",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "PSU-MG",
    "nome": "Hospital Universitário Sul Fluminense",
    "count": 2206,
    "uf": "MG",
    "key": "PSU-MG",
    "modalidades": [
      "R+",
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIFESP",
    "nome": "Centro Médico de Campinas",
    "count": 2184,
    "uf": "SP",
    "key": "UNIFESP",
    "modalidades": [
      "R+",
      "Acesso Direto"
    ]
  },
  {
    "sigla": "USP-RP",
    "nome": "FAMERP",
    "count": 2124,
    "uf": "SP",
    "key": "USP-RP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UNESP",
    "nome": "FAMERP",
    "count": 2090,
    "uf": "SP",
    "key": "UNESP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "IAMSPE",
    "nome": "FAMERP",
    "count": 1988,
    "uf": "SP",
    "key": "IAMSPE",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SES-DF",
    "nome": "SES-DF",
    "count": 1987,
    "uf": "DF",
    "key": "SES-DF",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UNICAMP/HC",
    "nome": "UNICAMP",
    "count": 1980,
    "uf": "SP",
    "key": "UNICAMP/HC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFG",
    "nome": "UFG",
    "count": 1965,
    "uf": "GO",
    "key": "UFG",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "ENARE",
    "nome": "AFAMCI",
    "count": 1954,
    "uf": "Nacional",
    "key": "ENARE",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "FGV",
    "nome": "FGV",
    "count": 1817,
    "uf": "Nacional",
    "key": "FGV",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UEL",
    "nome": "FAMERP",
    "count": 1813,
    "uf": "SP",
    "key": "UEL",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "FJG",
    "nome": "FAMERP",
    "count": 1807,
    "uf": "SP",
    "key": "FJG",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SCMBH",
    "nome": "SCMBH",
    "count": 1739,
    "uf": "Nacional",
    "key": "SCMBH",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade do Estado do Pará",
    "nome": "Universidade do Estado do Pará",
    "count": 1737,
    "uf": "PA",
    "key": "Universidade do Estado do Pará",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOA",
    "nome": "HOA",
    "count": 1640,
    "uf": "Nacional",
    "key": "HOA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UERJ",
    "nome": "Fundação João Goulart",
    "count": 1637,
    "uf": "RJ",
    "key": "UERJ",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SUS-BA",
    "nome": "SUS-BA",
    "count": 1509,
    "uf": "BA",
    "key": "SUS-BA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SES-GO",
    "nome": "SES-GO",
    "count": 1484,
    "uf": "GO",
    "key": "SES-GO",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UnB",
    "nome": "UnB",
    "count": 1436,
    "uf": "DF",
    "key": "UnB",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "IOG",
    "nome": "IOG",
    "count": 1360,
    "uf": "Nacional",
    "key": "IOG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FUBOG",
    "nome": "FAMERP",
    "count": 1344,
    "uf": "SP",
    "key": "FUBOG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IPSEMG",
    "nome": "Hospital Santa Isabel",
    "count": 1302,
    "uf": "MG",
    "key": "IPSEMG",
    "modalidades": [
      "R+",
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HU-FMJ",
    "nome": "FMJ",
    "count": 1300,
    "uf": "Nacional",
    "key": "HU-FMJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SEMUSA (SMS) Macaé",
    "nome": "SEMUSA (SMS) Macaé",
    "count": 1297,
    "uf": "Nacional",
    "key": "SEMUSA (SMS) Macaé",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFRJ/HUCFF",
    "nome": "UFRJ",
    "count": 1295,
    "uf": "RJ",
    "key": "UFRJ/HUCFF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade de Taubaté",
    "nome": "Universidade de Taubaté - UNITAU",
    "count": 1280,
    "uf": "SP",
    "key": "Universidade de Taubaté",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade de Ribeirão Preto",
    "nome": "Universidade de Ribeirão Preto",
    "count": 1266,
    "uf": "SP",
    "key": "Universidade de Ribeirão Preto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CMC",
    "nome": "CMC",
    "count": 1239,
    "uf": "Nacional",
    "key": "CMC",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SANTA CASA - SP",
    "nome": "FAMERP",
    "count": 1235,
    "uf": "SP",
    "key": "SANTA CASA - SP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UERJ/HUPE",
    "nome": "UERJ",
    "count": 1233,
    "uf": "RJ",
    "key": "UERJ/HUPE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Estadual do Piauí",
    "nome": "Universidade Estadual do Piauí",
    "count": 1208,
    "uf": "PI",
    "key": "Universidade Estadual do Piauí",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "USP/HCRP",
    "nome": "USP-RP",
    "count": 1206,
    "uf": "SP",
    "key": "USP/HCRP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de São Paulo",
    "nome": "SCMSP",
    "count": 1200,
    "uf": "SP",
    "key": "Santa Casa de São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIFESP/EPM",
    "nome": "UNIFESP",
    "count": 1198,
    "uf": "SP",
    "key": "UNIFESP/EPM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFRGS/HCPA",
    "nome": "UFRGS",
    "count": 1196,
    "uf": "RS",
    "key": "UFRGS/HCPA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade de Medicina de Petrópolis",
    "nome": "Faculdade de Medicina de Petrópolis",
    "count": 1189,
    "uf": "RJ",
    "key": "Faculdade de Medicina de Petrópolis",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "USP/HCFMUSP",
    "nome": "USP-SP",
    "count": 1162,
    "uf": "SP",
    "key": "USP/HCFMUSP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HAC",
    "nome": "HAC",
    "count": 1143,
    "uf": "Nacional",
    "key": "HAC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade do Estado do Rio Grande do Norte",
    "nome": "Universidade do Estado do Rio Grande do Norte",
    "count": 1143,
    "uf": "RN",
    "key": "Universidade do Estado do Rio Grande do Norte",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFRN",
    "nome": "UFRN",
    "count": 1142,
    "uf": "RN",
    "key": "UFRN",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFT",
    "nome": "FAMERP",
    "count": 1132,
    "uf": "SP",
    "key": "UFT",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SES - DF",
    "nome": "SES - DF",
    "count": 1117,
    "uf": "DF",
    "key": "SES - DF",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "IAMSPE/HSPE",
    "nome": "IAMSPE",
    "count": 1102,
    "uf": "SP",
    "key": "IAMSPE/HSPE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMG",
    "nome": "HMG",
    "count": 1100,
    "uf": "Nacional",
    "key": "HMG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFSC/HU",
    "nome": "UFSC/HU",
    "count": 1096,
    "uf": "SC",
    "key": "UFSC/HU",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HEVV",
    "nome": "FAMERP",
    "count": 1077,
    "uf": "SP",
    "key": "HEVV",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFPA/HUJBB",
    "nome": "UFPA/HUJBB",
    "count": 1072,
    "uf": "PA",
    "key": "UFPA/HUJBB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNESP/HCFMB",
    "nome": "UNESP",
    "count": 1059,
    "uf": "SP",
    "key": "UNESP/HCFMB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HEAA-FMC",
    "nome": "HEAA-FMC",
    "count": 1056,
    "uf": "Nacional",
    "key": "HEAA-FMC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HNMD",
    "nome": "FAMERP",
    "count": 1050,
    "uf": "SP",
    "key": "HNMD",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Pontifícia Universidade Católica de São Paulo",
    "nome": "Pontifícia Universidade Católica de São Paulo",
    "count": 1009,
    "uf": "SP",
    "key": "Pontifícia Universidade Católica de São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-SP",
    "nome": "SMS-SP",
    "count": 1009,
    "uf": "SP",
    "key": "SMS-SP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HFA",
    "nome": "HFA",
    "count": 1007,
    "uf": "DF",
    "key": "HFA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFES/HUCAM",
    "nome": "UFES/HUCAM",
    "count": 991,
    "uf": "ES",
    "key": "UFES/HUCAM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HUSE",
    "nome": "Complexo Hospitalar de Niterói",
    "count": 966,
    "uf": "SE",
    "key": "HUSE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFPE",
    "nome": "FAMERP",
    "count": 951,
    "uf": "SP",
    "key": "UFPE",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HUGG/UNIRIO",
    "nome": "HUGG/UNIRIO",
    "count": 948,
    "uf": "RJ",
    "key": "HUGG/UNIRIO",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFRJ",
    "nome": "FAMERP",
    "count": 934,
    "uf": "SP",
    "key": "UFRJ",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Santa Casa de Ribeirão Preto (SP)",
    "nome": "Santa Casa de Ribeirão Preto (SP)",
    "count": 933,
    "uf": "SP",
    "key": "Santa Casa de Ribeirão Preto (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMASP",
    "nome": "FAMERP",
    "count": 928,
    "uf": "SP",
    "key": "HMASP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Santa Casa de Maceió (AL)",
    "nome": "Santa Casa de Maceió (AL)",
    "count": 922,
    "uf": "AL",
    "key": "Santa Casa de Maceió (AL)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SUPREMA",
    "nome": "FAMERP",
    "count": 918,
    "uf": "SP",
    "key": "SUPREMA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "INCA",
    "nome": "FAMERP",
    "count": 910,
    "uf": "SP",
    "key": "INCA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HIAE/Einstein",
    "nome": "Hospital Albert Einstein",
    "count": 900,
    "uf": "SP",
    "key": "HIAE/Einstein",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOB",
    "nome": "HOB",
    "count": 897,
    "uf": "Nacional",
    "key": "HOB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFMA/HU-UFMA",
    "nome": "UFMA/HU-UFMA",
    "count": 896,
    "uf": "MA",
    "key": "UFMA/HU-UFMA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "INTO",
    "nome": "FAMERP",
    "count": 894,
    "uf": "SP",
    "key": "INTO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOS/BOS",
    "nome": "HOS/BOS",
    "count": 877,
    "uf": "Nacional",
    "key": "HOS/BOS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS Volta Redonda",
    "nome": "SMS Volta Redonda - Secretaria Municipal de Saúde (RJ)",
    "count": 861,
    "uf": "RJ",
    "key": "SMS Volta Redonda",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HPP",
    "nome": "FAMERP",
    "count": 850,
    "uf": "SP",
    "key": "HPP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UniEVANGÉLICA / Hospital Evangélico Goiano - HEG (GO)",
    "nome": "UniEVANGÉLICA / Hospital Evangélico Goiano - HEG (GO)",
    "count": 850,
    "uf": "GO",
    "key": "UniEVANGÉLICA / Hospital Evangélico Goiano - HEG (GO)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFCG/HUAC",
    "nome": "UFCG/HUAC",
    "count": 848,
    "uf": "CE",
    "key": "UFCG/HUAC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FAMEMA",
    "nome": "FAMEMA",
    "count": 847,
    "uf": "SP",
    "key": "FAMEMA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Santa Casa de Limeira (SP)",
    "nome": "Santa Casa de Limeira (SP)",
    "count": 833,
    "uf": "SP",
    "key": "Santa Casa de Limeira (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UESPI",
    "nome": "FAMERP",
    "count": 829,
    "uf": "SP",
    "key": "UESPI",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "PSU-GO",
    "nome": "PSU-GO",
    "count": 811,
    "uf": "GO",
    "key": "PSU-GO",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Fundação Universidade Federal do Tocantins",
    "nome": "Fundação Universidade Federal do Tocantins",
    "count": 808,
    "uf": "TO",
    "key": "Fundação Universidade Federal do Tocantins",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFMT",
    "nome": "UFMT",
    "count": 807,
    "uf": "MT",
    "key": "UFMT",
    "modalidades": [
      "Acesso Direto",
      "R+",
      "Revalida"
    ]
  },
  {
    "sigla": "Faculdade de Medicina de Marília",
    "nome": "Faculdade de Medicina de Marília",
    "count": 805,
    "uf": "SP",
    "key": "Faculdade de Medicina de Marília",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FBHC",
    "nome": "FAMERP",
    "count": 804,
    "uf": "SP",
    "key": "FBHC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FAMERP/HB",
    "nome": "FAMERP",
    "count": 799,
    "uf": "SP",
    "key": "FAMERP/HB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIFESO/HCTCO",
    "nome": "UNIFESO/HCTCO",
    "count": 799,
    "uf": "Nacional",
    "key": "UNIFESO/HCTCO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HPEV",
    "nome": "HPEV",
    "count": 795,
    "uf": "Nacional",
    "key": "HPEV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFMA",
    "nome": "Escola de Saúde Pública de Porto Alegre",
    "count": 795,
    "uf": "MA",
    "key": "UFMA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HSL PUCRS",
    "nome": "HSL PUCRS",
    "count": 785,
    "uf": "RS",
    "key": "HSL PUCRS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Alfenas",
    "nome": "Santa Casa de Alfenas - Casa de Caridade (MG)",
    "count": 781,
    "uf": "MG",
    "key": "Santa Casa de Alfenas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UDI Hospital",
    "nome": "UDI Hospital",
    "count": 775,
    "uf": "Nacional",
    "key": "UDI Hospital",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFRN/HUOL",
    "nome": "UFRN",
    "count": 775,
    "uf": "RN",
    "key": "UFRN/HUOL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFF/HUAP",
    "nome": "UFF/HUAP",
    "count": 770,
    "uf": "RJ",
    "key": "UFF/HUAP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UNAERP",
    "nome": "UNAERP",
    "count": 770,
    "uf": "Nacional",
    "key": "UNAERP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "IHOA",
    "nome": "IHOA",
    "count": 761,
    "uf": "Nacional",
    "key": "IHOA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HM São José",
    "nome": "HM São José - Hospital Municipal de São José (SC)",
    "count": 760,
    "uf": "SC",
    "key": "HM São José",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Campo Grande (MS)",
    "nome": "Santa Casa de Campo Grande (MS)",
    "count": 741,
    "uf": "MS",
    "key": "Santa Casa de Campo Grande (MS)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Evangélica de Goiás",
    "nome": "Universidade Evangélica de Goiás",
    "count": 733,
    "uf": "GO",
    "key": "Universidade Evangélica de Goiás",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HEDA",
    "nome": "FAMERP",
    "count": 730,
    "uf": "SP",
    "key": "HEDA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Santa Casa de São Carlos (SP)",
    "nome": "Santa Casa de São Carlos (SP)",
    "count": 728,
    "uf": "SP",
    "key": "Santa Casa de São Carlos (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IFF/Fiocruz",
    "nome": "IFF/Fiocruz",
    "count": 720,
    "uf": "RJ",
    "key": "IFF/Fiocruz",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFS",
    "nome": "Centro Médico de Campinas",
    "count": 718,
    "uf": "PR",
    "key": "UFS",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HE Jayme Neves",
    "nome": "HE Jayme Neves - Hospital Escola Jayme dos Santos Neves (ES)",
    "count": 717,
    "uf": "ES",
    "key": "HE Jayme Neves",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UEM",
    "nome": "FAMERP",
    "count": 717,
    "uf": "SP",
    "key": "UEM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFMT/HUJM",
    "nome": "UFMT/HUJM",
    "count": 715,
    "uf": "MT",
    "key": "UFMT/HUJM",
    "modalidades": [
      "Acesso Direto",
      "Revalida"
    ]
  },
  {
    "sigla": "HMU/HMMG",
    "nome": "HMU/HMMG",
    "count": 700,
    "uf": "Nacional",
    "key": "HMU/HMMG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFPI/HU-UFPI",
    "nome": "UFPI/HU-UFPI",
    "count": 682,
    "uf": "PI",
    "key": "UFPI/HU-UFPI",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFGD/HU",
    "nome": "UFGD",
    "count": 681,
    "uf": "GO",
    "key": "UFGD/HU",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Barra Mansa (RJ)",
    "nome": "Santa Casa de Barra Mansa (RJ)",
    "count": 677,
    "uf": "RJ",
    "key": "Santa Casa de Barra Mansa (RJ)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFPR/HC",
    "nome": "UFPR",
    "count": 668,
    "uf": "PR",
    "key": "UFPR/HC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SUS-RR",
    "nome": "SUS-RR",
    "count": 667,
    "uf": "RR",
    "key": "SUS-RR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UnB/HUB",
    "nome": "UnB",
    "count": 665,
    "uf": "DF",
    "key": "UnB/HUB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HAS",
    "nome": "HAS",
    "count": 660,
    "uf": "Nacional",
    "key": "HAS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCPA",
    "nome": "FAMERP",
    "count": 657,
    "uf": "SP",
    "key": "HCPA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFU/HC",
    "nome": "UFU/HC",
    "count": 645,
    "uf": "MG",
    "key": "UFU/HC",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "PMFI",
    "nome": "PMFI - Prefeitura Municipal de Foz do Iguaçu (PR)",
    "count": 640,
    "uf": "PR",
    "key": "PMFI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SUS - BA",
    "nome": "Instituto de Olhos de Goiânia",
    "count": 640,
    "uf": "BA",
    "key": "SUS - BA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "EINSTEIN",
    "nome": "EINSTEIN",
    "count": 639,
    "uf": "SP",
    "key": "EINSTEIN",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "TEGO",
    "nome": "TEGO",
    "count": 636,
    "uf": "Nacional",
    "key": "TEGO",
    "modalidades": [
      "Título de Especialista"
    ]
  },
  {
    "sigla": "AMS",
    "nome": "AMS - Autarquia Municipal de Saúde de Apucarana (PR)",
    "count": 633,
    "uf": "PR",
    "key": "AMS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCV",
    "nome": "HCV",
    "count": 630,
    "uf": "Nacional",
    "key": "HCV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Goiânia (GO)",
    "nome": "Santa Casa de Goiânia (GO)",
    "count": 615,
    "uf": "GO",
    "key": "Santa Casa de Goiânia (GO)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCE",
    "nome": "FAMERP",
    "count": 602,
    "uf": "SP",
    "key": "HCE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMDI",
    "nome": "HMDI",
    "count": 602,
    "uf": "MG",
    "key": "HMDI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria de Estado da Saúde de Santa Catarina",
    "nome": "Secretaria de Estado da Saúde de Santa Catarina",
    "count": 601,
    "uf": "SC",
    "key": "Secretaria de Estado da Saúde de Santa Catarina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMSJ",
    "nome": "HMSJ",
    "count": 600,
    "uf": "Nacional",
    "key": "HMSJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SES-MA",
    "nome": "SES-MA",
    "count": 598,
    "uf": "MA",
    "key": "SES-MA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSL/Sírio",
    "nome": "Hospital Sírio-Libanês",
    "count": 595,
    "uf": "SP",
    "key": "HSL/Sírio",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Sírio-Libanês",
    "nome": "Hospital Sírio-Libanês",
    "count": 593,
    "uf": "SP",
    "key": "Hospital Sírio-Libanês",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFS/HU",
    "nome": "UFS/HU",
    "count": 587,
    "uf": "SE",
    "key": "UFS/HU",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SES - GO",
    "nome": "SES - GO",
    "count": 585,
    "uf": "GO",
    "key": "SES - GO",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HMMSJP",
    "nome": "HMMSJP",
    "count": 583,
    "uf": "Nacional",
    "key": "HMMSJP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ESP CE - Escola de Saúde Pública do Ceará",
    "nome": "ESP CE - Escola de Saúde Pública do Ceará",
    "count": 579,
    "uf": "CE",
    "key": "ESP CE - Escola de Saúde Pública do Ceará",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMAR",
    "nome": "HMAR",
    "count": 577,
    "uf": "Nacional",
    "key": "HMAR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Marília (SP)",
    "nome": "Santa Casa de Marília (SP)",
    "count": 576,
    "uf": "SP",
    "key": "Santa Casa de Marília (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMTJ",
    "nome": "HMTJ",
    "count": 573,
    "uf": "Nacional",
    "key": "HMTJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS João Pessoa",
    "nome": "SMS João Pessoa - Secretaria Municipal de Saúde de João Pessoa (PB)",
    "count": 573,
    "uf": "PB",
    "key": "SMS João Pessoa",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundhacre",
    "nome": "Fundhacre",
    "count": 567,
    "uf": "AC",
    "key": "Fundhacre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Ourinhos (SP)",
    "nome": "Santa Casa de Ourinhos (SP)",
    "count": 559,
    "uf": "SP",
    "key": "Santa Casa de Ourinhos (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS Curitiba",
    "nome": "SMS Curitiba",
    "count": 556,
    "uf": "PR",
    "key": "SMS Curitiba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCG",
    "nome": "FAMERP",
    "count": 555,
    "uf": "SP",
    "key": "HCG",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SMS Piracicaba",
    "nome": "SMS Piracicaba",
    "count": 554,
    "uf": "Nacional",
    "key": "SMS Piracicaba",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "PSU-AL",
    "nome": "PSU-AL",
    "count": 538,
    "uf": "AL",
    "key": "PSU-AL",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade de Gurupi",
    "nome": "Universidade de Gurupi - Campus Gurupi",
    "count": 534,
    "uf": "PR",
    "key": "Universidade de Gurupi",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IC-FUC",
    "nome": "IC-FUC",
    "count": 525,
    "uf": "Nacional",
    "key": "IC-FUC",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HSJC-SP",
    "nome": "HSJC-SP",
    "count": 520,
    "uf": "SP",
    "key": "HSJC-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMM",
    "nome": "SCMM",
    "count": 517,
    "uf": "Nacional",
    "key": "SCMM",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital São José de Joinville",
    "nome": "Hospital São José de Joinville",
    "count": 513,
    "uf": "SC",
    "key": "Hospital São José de Joinville",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFSC",
    "nome": "FAMERP",
    "count": 506,
    "uf": "SP",
    "key": "UFSC",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade de Rio Verde",
    "nome": "Universidade de Rio Verde",
    "count": 493,
    "uf": "Nacional",
    "key": "Universidade de Rio Verde",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HE Cachoeiro",
    "nome": "HE Cachoeiro",
    "count": 492,
    "uf": "Nacional",
    "key": "HE Cachoeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Unimed-Rio",
    "nome": "Unimed-Rio - Cooperativa de Trabalho Médico (RJ)",
    "count": 490,
    "uf": "RJ",
    "key": "Unimed-Rio",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário do Espírito Santo",
    "nome": "Centro Universitário do Espírito Santo",
    "count": 488,
    "uf": "ES",
    "key": "Centro Universitário do Espírito Santo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HFCF",
    "nome": "HFCF",
    "count": 488,
    "uf": "Nacional",
    "key": "HFCF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Veredas",
    "nome": "Hospital Veredas - Maceió (AL)",
    "count": 488,
    "uf": "AL",
    "key": "Hospital Veredas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário do Estado do Pará",
    "nome": "Centro Universitário do Estado do Pará",
    "count": 484,
    "uf": "PA",
    "key": "Centro Universitário do Estado do Pará",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFAM/HUGV",
    "nome": "UFAM/HUGV",
    "count": 480,
    "uf": "AM",
    "key": "UFAM/HUGV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Estadual de Ciências da Saúde de Alagoas",
    "nome": "Universidade Estadual de Ciências da Saúde de Alagoas",
    "count": 480,
    "uf": "AL",
    "key": "Universidade Estadual de Ciências da Saúde de Alagoas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Votuporanga (SP)",
    "nome": "Santa Casa de Votuporanga (SP)",
    "count": 473,
    "uf": "SP",
    "key": "Santa Casa de Votuporanga (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de São José dos Campos (SP)",
    "nome": "Santa Casa de São José dos Campos (SP)",
    "count": 470,
    "uf": "SP",
    "key": "Santa Casa de São José dos Campos (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSA Guarujá",
    "nome": "HSA Guarujá - Hospital Santo Amaro de Guarujá (SP)",
    "count": 462,
    "uf": "SP",
    "key": "HSA Guarujá",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CSNSC",
    "nome": "CSNSC",
    "count": 460,
    "uf": "Nacional",
    "key": "CSNSC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "AFAMCI",
    "nome": "AFAMCI",
    "count": 457,
    "uf": "Nacional",
    "key": "AFAMCI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Araçatuba (SP)",
    "nome": "Santa Casa de Araçatuba (SP)",
    "count": 456,
    "uf": "SP",
    "key": "Santa Casa de Araçatuba (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UERN",
    "nome": "Associação Médica do Paraná",
    "count": 454,
    "uf": "PR",
    "key": "UERN",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Albert Einstein",
    "nome": "Hospital Albert Einstein",
    "count": 451,
    "uf": "SP",
    "key": "Hospital Albert Einstein",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFAL/HUPAA",
    "nome": "UFAL/HUPAA",
    "count": 451,
    "uf": "AL",
    "key": "UFAL/HUPAA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HIS",
    "nome": "HIS",
    "count": 447,
    "uf": "Nacional",
    "key": "HIS",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SCML",
    "nome": "SCML",
    "count": 440,
    "uf": "Nacional",
    "key": "SCML",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SES-PB",
    "nome": "SES-PB",
    "count": 439,
    "uf": "PB",
    "key": "SES-PB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Angelina Caron",
    "nome": "Hospital Angelina Caron",
    "count": 437,
    "uf": "Nacional",
    "key": "Hospital Angelina Caron",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFRGS",
    "nome": "UFRGS",
    "count": 437,
    "uf": "RS",
    "key": "UFRGS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSJ",
    "nome": "HSJ",
    "count": 432,
    "uf": "Nacional",
    "key": "HSJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSM",
    "nome": "HSM",
    "count": 431,
    "uf": "Nacional",
    "key": "HSM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SISE-SUS",
    "nome": "SISE-SUS",
    "count": 428,
    "uf": "Nacional",
    "key": "SISE-SUS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HFASP",
    "nome": "HFASP",
    "count": 426,
    "uf": "DF",
    "key": "HFASP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFES",
    "nome": "FAMERP",
    "count": 421,
    "uf": "SP",
    "key": "UFES",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade Federal do Estado do Rio de Janeiro",
    "nome": "Universidade Federal do Estado do Rio de Janeiro",
    "count": 421,
    "uf": "RJ",
    "key": "Universidade Federal do Estado do Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas de Goiás",
    "nome": "Hospital das Clínicas de Goiás",
    "count": 413,
    "uf": "GO",
    "key": "Hospital das Clínicas de Goiás",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CEOQ",
    "nome": "CEOQ",
    "count": 406,
    "uf": "Nacional",
    "key": "CEOQ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CEPOA",
    "nome": "CEPOA",
    "count": 403,
    "uf": "Nacional",
    "key": "CEPOA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Municipal de São Caetano do Sul",
    "nome": "Universidade Municipal de São Caetano do Sul - Campus São Caetano do Sul",
    "count": 400,
    "uf": "PR",
    "key": "Universidade Municipal de São Caetano do Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFPB/HULW",
    "nome": "UFPB/HULW",
    "count": 395,
    "uf": "PB",
    "key": "UFPB/HULW",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFPI",
    "nome": "FAMERP",
    "count": 394,
    "uf": "SP",
    "key": "UFPI",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HR Presidente Prudente",
    "nome": "HR Presidente Prudente - Hospital Regional de Presidente Prudente (SP)",
    "count": 390,
    "uf": "SP",
    "key": "HR Presidente Prudente",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HA",
    "nome": "HA",
    "count": 387,
    "uf": "Nacional",
    "key": "HA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Universidade Federal de Ciências da Saúde de Porto Alegre",
    "nome": "Fundação Universidade Federal de Ciências da Saúde de Porto Alegre",
    "count": 386,
    "uf": "Nacional",
    "key": "Fundação Universidade Federal de Ciências da Saúde de Porto Alegre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Unioeste/HUOP",
    "nome": "Unioeste/HUOP",
    "count": 386,
    "uf": "PR",
    "key": "Unioeste/HUOP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PSU-CE",
    "nome": "PSU-CE",
    "count": 385,
    "uf": "CE",
    "key": "PSU-CE",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SMS-RJ",
    "nome": "SMS-RJ",
    "count": 372,
    "uf": "RJ",
    "key": "SMS-RJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Regional de Mato Grosso do Sul - Rosa Pedrossian",
    "nome": "Hospital Regional de Mato Grosso do Sul - Rosa Pedrossian",
    "count": 368,
    "uf": "MT",
    "key": "Hospital Regional de Mato Grosso do Sul - Rosa Pedrossian",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PUC-RS",
    "nome": "FAMERP",
    "count": 361,
    "uf": "RS",
    "key": "PUC-RS",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "CCANSPS",
    "nome": "CCANSPS",
    "count": 360,
    "uf": "Nacional",
    "key": "CCANSPS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Pasteur - Rio de Janeiro (RJ)",
    "nome": "Hospital Pasteur - Rio de Janeiro (RJ)",
    "count": 360,
    "uf": "RJ",
    "key": "Hospital Pasteur - Rio de Janeiro (RJ)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOC",
    "nome": "HOC",
    "count": 356,
    "uf": "Nacional",
    "key": "HOC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FMP",
    "nome": "FMP",
    "count": 355,
    "uf": "Nacional",
    "key": "FMP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital da Cruz Vermelha do Paraná",
    "nome": "Hospital da Cruz Vermelha do Paraná",
    "count": 350,
    "uf": "PR",
    "key": "Hospital da Cruz Vermelha do Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Afya Universidade Unigranrio",
    "nome": "Afya Universidade Unigranrio - Campus Duque de Caxias",
    "count": 347,
    "uf": "PR",
    "key": "Afya Universidade Unigranrio",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Clínica Campo Grande",
    "nome": "Clínica Campo Grande - Hospital do Coração de Mato Grosso do Sul (MS)",
    "count": 347,
    "uf": "MS",
    "key": "Clínica Campo Grande",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HAOC",
    "nome": "HAOC",
    "count": 346,
    "uf": "Nacional",
    "key": "HAOC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "EMESCAM",
    "nome": "EMESCAM",
    "count": 345,
    "uf": "ES",
    "key": "EMESCAM",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital Central da Polícia Militar - Rio de Janeiro",
    "nome": "Hospital Central da Polícia Militar - Rio de Janeiro",
    "count": 344,
    "uf": "RJ",
    "key": "Hospital Central da Polícia Militar - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFG/HC",
    "nome": "UFG",
    "count": 343,
    "uf": "GO",
    "key": "UFG/HC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFMS/HUMAP",
    "nome": "UFMS/HUMAP",
    "count": 343,
    "uf": "MS",
    "key": "UFMS/HUMAP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SGCH",
    "nome": "SGCH - Santa Genoveva Complexo Hospitalar (MG)",
    "count": 336,
    "uf": "MG",
    "key": "SGCH",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ABEM — Teste de Progresso Nacional",
    "nome": "ABEM — Teste de Progresso Nacional",
    "count": 326,
    "uf": "Nacional",
    "key": "ABEM — Teste de Progresso Nacional",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMA-SP",
    "nome": "FAMERP",
    "count": 321,
    "uf": "SP",
    "key": "SCMA-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "INEP",
    "nome": "ENARE",
    "count": 315,
    "uf": "Nacional",
    "key": "INEP",
    "modalidades": [
      "Acesso Direto",
      "Revalida"
    ]
  },
  {
    "sigla": "SANTA CASA - BH",
    "nome": "SANTA CASA - BH",
    "count": 315,
    "uf": "Nacional",
    "key": "SANTA CASA - BH",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SCM-GO",
    "nome": "SCM-GO",
    "count": 313,
    "uf": "GO",
    "key": "SCM-GO",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SMS Campo Grande",
    "nome": "SMS Campo Grande - Secretaria Municipal de Saúde (MS)",
    "count": 304,
    "uf": "MS",
    "key": "SMS Campo Grande",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOG",
    "nome": "HOG",
    "count": 303,
    "uf": "Nacional",
    "key": "HOG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade de Medicina Nova Esperança",
    "nome": "Faculdade de Medicina Nova Esperança",
    "count": 300,
    "uf": "Nacional",
    "key": "Faculdade de Medicina Nova Esperança",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HTLF",
    "nome": "HTLF",
    "count": 300,
    "uf": "Nacional",
    "key": "HTLF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IJF",
    "nome": "IJF",
    "count": 300,
    "uf": "CE",
    "key": "IJF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PROVA UNIFICADA",
    "nome": "PROVA UNIFICADA",
    "count": 300,
    "uf": "Nacional",
    "key": "PROVA UNIFICADA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade de Ciências Médicas de Minas Gerais",
    "nome": "Faculdade de Ciências Médicas de Minas Gerais",
    "count": 295,
    "uf": "MG",
    "key": "Faculdade de Ciências Médicas de Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFPB",
    "nome": "UFPB",
    "count": 293,
    "uf": "PB",
    "key": "UFPB",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Santa Casa - LIMEIRA",
    "nome": "FAMERP",
    "count": 291,
    "uf": "SP",
    "key": "Santa Casa - LIMEIRA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HA Barretos",
    "nome": "HA Barretos",
    "count": 289,
    "uf": "Nacional",
    "key": "HA Barretos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PUC-SP",
    "nome": "FAMERP",
    "count": 288,
    "uf": "SP",
    "key": "PUC-SP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFF",
    "nome": "FAMERP",
    "count": 285,
    "uf": "SP",
    "key": "UFF",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HGNI",
    "nome": "HGNI",
    "count": 280,
    "uf": "Nacional",
    "key": "HGNI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PMSO",
    "nome": "PMSO - Prefeitura Municipal de Sorocaba (SP)",
    "count": 277,
    "uf": "SP",
    "key": "PMSO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HST",
    "nome": "FAMERP",
    "count": 274,
    "uf": "SP",
    "key": "HST",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Municipal Dr. Mário Gatti",
    "nome": "Hospital Municipal Dr. Mário Gatti",
    "count": 274,
    "uf": "Nacional",
    "key": "Hospital Municipal Dr. Mário Gatti",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS São José dos Pinhais",
    "nome": "SMS São José dos Pinhais - Secretaria Municipal de Saúde (PR)",
    "count": 274,
    "uf": "PR",
    "key": "SMS São José dos Pinhais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-PATOS",
    "nome": "Escola Multicampi de Ciências Médicas",
    "count": 274,
    "uf": "PR",
    "key": "SMS-PATOS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HC-ICC",
    "nome": "HC-ICC",
    "count": 273,
    "uf": "Nacional",
    "key": "HC-ICC",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HAC-PR",
    "nome": "HAC-PR",
    "count": 270,
    "uf": "PR",
    "key": "HAC-PR",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Fundação João Goulart",
    "nome": "Fundação João Goulart",
    "count": 264,
    "uf": "Nacional",
    "key": "Fundação João Goulart",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS Florianópolis",
    "nome": "SMS Florianópolis - Secretaria Municipal de Saúde de Florianópolis (SC)",
    "count": 263,
    "uf": "SC",
    "key": "SMS Florianópolis",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Fernandes Figueira",
    "nome": "Instituto Fernandes Figueira",
    "count": 260,
    "uf": "Nacional",
    "key": "Instituto Fernandes Figueira",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CEREM",
    "nome": "CEREM - Comissão Estadual de Residência Médica de Alagoas",
    "count": 258,
    "uf": "AL",
    "key": "CEREM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário Multivix Vitória",
    "nome": "Centro Universitário Multivix Vitória",
    "count": 257,
    "uf": "ES",
    "key": "Centro Universitário Multivix Vitória",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCPM",
    "nome": "HCPM",
    "count": 256,
    "uf": "Nacional",
    "key": "HCPM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Santa Catarina",
    "nome": "Universidade Federal de Santa Catarina",
    "count": 256,
    "uf": "SC",
    "key": "Universidade Federal de Santa Catarina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNCISAL",
    "nome": "Fundação Universidade de Ciências da Saúde de Alagoas",
    "count": 255,
    "uf": "AL",
    "key": "UNCISAL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "COC",
    "nome": "COC",
    "count": 254,
    "uf": "Nacional",
    "key": "COC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMRP",
    "nome": "SCMRP",
    "count": 254,
    "uf": "Nacional",
    "key": "SCMRP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HVV",
    "nome": "HVV",
    "count": 252,
    "uf": "Nacional",
    "key": "HVV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCMT",
    "nome": "HCMT",
    "count": 251,
    "uf": "Nacional",
    "key": "HCMT",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HDG",
    "nome": "HDG",
    "count": 242,
    "uf": "Nacional",
    "key": "HDG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal Fluminense",
    "nome": "Universidade Federal Fluminense",
    "count": 242,
    "uf": "Nacional",
    "key": "Universidade Federal Fluminense",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IDOR",
    "nome": "IDOR",
    "count": 241,
    "uf": "Nacional",
    "key": "IDOR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ISCMSC",
    "nome": "Centro Médico de Campinas",
    "count": 241,
    "uf": "PR",
    "key": "ISCMSC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Católica de Pelotas",
    "nome": "Universidade Católica de Pelotas",
    "count": 240,
    "uf": "RS",
    "key": "Universidade Católica de Pelotas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Pernambuco",
    "nome": "Universidade Federal de Pernambuco",
    "count": 240,
    "uf": "PE",
    "key": "Universidade Federal de Pernambuco",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HABM",
    "nome": "HABM",
    "count": 239,
    "uf": "Nacional",
    "key": "HABM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário Atenas",
    "nome": "Centro Universitário Atenas",
    "count": 238,
    "uf": "Nacional",
    "key": "Centro Universitário Atenas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UCPel/HUSFP",
    "nome": "UCPel/HUSFP",
    "count": 237,
    "uf": "Nacional",
    "key": "UCPel/HUSFP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFMS",
    "nome": "UFMS",
    "count": 237,
    "uf": "MS",
    "key": "UFMS",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HSD",
    "nome": "HSD",
    "count": 235,
    "uf": "Nacional",
    "key": "HSD",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PSU PRMMT",
    "nome": "PSU PRMMT - Processo Seletivo Unificado de Residência Médica do MT",
    "count": 235,
    "uf": "MT",
    "key": "PSU PRMMT",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNESC - ES",
    "nome": "Centro Universitário do Espírito Santo",
    "count": 234,
    "uf": "ES",
    "key": "UNESC - ES",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital Santa Genoveva",
    "nome": "Hospital Santa Genoveva",
    "count": 231,
    "uf": "Nacional",
    "key": "Hospital Santa Genoveva",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HPM",
    "nome": "HPM",
    "count": 230,
    "uf": "Nacional",
    "key": "HPM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Ortopédico de Goiânia",
    "nome": "Instituto Ortopédico de Goiânia",
    "count": 229,
    "uf": "GO",
    "key": "Instituto Ortopédico de Goiânia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HP-SP",
    "nome": "HP-SP",
    "count": 218,
    "uf": "SP",
    "key": "HP-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Urgência de Goiânia",
    "nome": "Hospital de Urgência de Goiânia",
    "count": 218,
    "uf": "GO",
    "key": "Hospital de Urgência de Goiânia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HUOL",
    "nome": "FAMERP",
    "count": 216,
    "uf": "SP",
    "key": "HUOL",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HEA",
    "nome": "Faculdade de Medicina de Petrópolis",
    "count": 215,
    "uf": "RJ",
    "key": "HEA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNOCHAPECO",
    "nome": "UNOCHAPECO",
    "count": 213,
    "uf": "Nacional",
    "key": "UNOCHAPECO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IGESP",
    "nome": "IGESP",
    "count": 210,
    "uf": "Nacional",
    "key": "IGESP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIRV",
    "nome": "UNIRV",
    "count": 209,
    "uf": "RO",
    "key": "UNIRV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Médico de Campinas",
    "nome": "Centro Médico de Campinas",
    "count": 208,
    "uf": "PR",
    "key": "Centro Médico de Campinas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Unimed Ferj",
    "nome": "Hospital Unimed Ferj - Rio de Janeiro (RJ)",
    "count": 208,
    "uf": "RJ",
    "key": "Hospital Unimed Ferj",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Escola de Saúde Pública de Porto Alegre",
    "nome": "Escola de Saúde Pública de Porto Alegre",
    "count": 207,
    "uf": "Nacional",
    "key": "Escola de Saúde Pública de Porto Alegre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UAM",
    "nome": "Centro Médico de Campinas",
    "count": 206,
    "uf": "PR",
    "key": "UAM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "COREME-AP - Comissão Estadual de Residência Médica do Amapá (AP)",
    "nome": "COREME-AP - Comissão Estadual de Residência Médica do Amapá (AP)",
    "count": 205,
    "uf": "AP",
    "key": "COREME-AP - Comissão Estadual de Residência Médica do Amapá (AP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMRP SANTA CASA DE MISERICÓRDIA DE RIBEIRÃO PRETO",
    "nome": "FAMERP",
    "count": 204,
    "uf": "SP",
    "key": "SCMRP SANTA CASA DE MISERICÓRDIA DE RIBEIRÃO PRETO",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFGD",
    "nome": "Hospital da Cruz Vermelha do Paraná",
    "count": 202,
    "uf": "PR",
    "key": "UFGD",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HRMS",
    "nome": "HRMS",
    "count": 201,
    "uf": "Nacional",
    "key": "HRMS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FESO",
    "nome": "FAMERP",
    "count": 200,
    "uf": "SP",
    "key": "FESO",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HJAF",
    "nome": "HJAF",
    "count": 200,
    "uf": "Nacional",
    "key": "HJAF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HNSG",
    "nome": "HNSG",
    "count": 200,
    "uf": "Nacional",
    "key": "HNSG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSC",
    "nome": "HSC",
    "count": 200,
    "uf": "Nacional",
    "key": "HSC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HIVS",
    "nome": "HIVS",
    "count": 199,
    "uf": "Nacional",
    "key": "HIVS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMCG",
    "nome": "SCMCG",
    "count": 198,
    "uf": "Nacional",
    "key": "SCMCG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSL Brasília",
    "nome": "HSL Brasília - Hospital Sírio-Libanês Brasília (DF)",
    "count": 197,
    "uf": "DF",
    "key": "HSL Brasília",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSRC",
    "nome": "HSRC",
    "count": 197,
    "uf": "Nacional",
    "key": "HSRC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCanMT",
    "nome": "HCanMT",
    "count": 196,
    "uf": "Nacional",
    "key": "HCanMT",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IBC",
    "nome": "IBC",
    "count": 196,
    "uf": "Nacional",
    "key": "IBC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ICEPI",
    "nome": "ICEPI",
    "count": 196,
    "uf": "Nacional",
    "key": "ICEPI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS Sinop",
    "nome": "SMS Sinop",
    "count": 196,
    "uf": "Nacional",
    "key": "SMS Sinop",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Visão Laser",
    "nome": "Visão Laser - Centro Oftalmológico (SP)",
    "count": 196,
    "uf": "SP",
    "key": "Visão Laser",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CRER",
    "nome": "CRER",
    "count": 195,
    "uf": "Nacional",
    "key": "CRER",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FAMECA",
    "nome": "FAMECA",
    "count": 195,
    "uf": "Nacional",
    "key": "FAMECA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSM-DF",
    "nome": "HSM-DF",
    "count": 194,
    "uf": "DF",
    "key": "HSM-DF",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HSLRP",
    "nome": "HSLRP",
    "count": 192,
    "uf": "Nacional",
    "key": "HSLRP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade de Taubaté - UNITAU",
    "nome": "Universidade de Taubaté - UNITAU",
    "count": 192,
    "uf": "SP",
    "key": "Universidade de Taubaté - UNITAU",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UEPA",
    "nome": "UEPA",
    "count": 191,
    "uf": "PA",
    "key": "UEPA",
    "modalidades": [
      "Acesso Direto",
      "Revalida"
    ]
  },
  {
    "sigla": "Hospital Estadual do Acre",
    "nome": "Hospital Estadual do Acre",
    "count": 189,
    "uf": "AC",
    "key": "Hospital Estadual do Acre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Associação Médica do Paraná",
    "nome": "Associação Médica do Paraná",
    "count": 188,
    "uf": "PR",
    "key": "Associação Médica do Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Claretiano",
    "nome": "Claretiano",
    "count": 188,
    "uf": "Nacional",
    "key": "Claretiano",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade São Leopoldo Mandic de Araras",
    "nome": "Faculdade São Leopoldo Mandic de Araras",
    "count": 188,
    "uf": "Nacional",
    "key": "Faculdade São Leopoldo Mandic de Araras",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PMC",
    "nome": "PMC - Prefeitura Municipal de Curitiba (PR)",
    "count": 188,
    "uf": "PR",
    "key": "PMC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Comissão Estadual de Residência Médica do Mato Grosso do Sul",
    "nome": "Comissão Estadual de Residência Médica do Mato Grosso do Sul",
    "count": 187,
    "uf": "MT",
    "key": "Comissão Estadual de Residência Médica do Mato Grosso do Sul",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HRAC-USP",
    "nome": "HRAC-USP",
    "count": 186,
    "uf": "SP",
    "key": "HRAC-USP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMV",
    "nome": "SCMV",
    "count": 186,
    "uf": "Nacional",
    "key": "SCMV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HAA",
    "nome": "HAA",
    "count": 184,
    "uf": "Nacional",
    "key": "HAA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Grupo OPTY",
    "nome": "Grupo OPTY - Rede de Oftalmologia",
    "count": 183,
    "uf": "Nacional",
    "key": "Grupo OPTY",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Alcides Carneiro",
    "nome": "Hospital Universitário Alcides Carneiro",
    "count": 183,
    "uf": "Nacional",
    "key": "Hospital Universitário Alcides Carneiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS Foz do Iguaçu",
    "nome": "SMS Foz do Iguaçu - Secretaria Municipal de Saúde (PR)",
    "count": 183,
    "uf": "PR",
    "key": "SMS Foz do Iguaçu",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia do Rio de Janeiro",
    "nome": "Santa Casa de Misericórdia do Rio de Janeiro",
    "count": 183,
    "uf": "RJ",
    "key": "Santa Casa de Misericórdia do Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Vitória",
    "nome": "Santa Casa de Misericórdia de Vitória",
    "count": 182,
    "uf": "ES",
    "key": "Santa Casa de Misericórdia de Vitória",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Uberlândia",
    "nome": "Universidade Federal de Uberlândia",
    "count": 182,
    "uf": "MG",
    "key": "Universidade Federal de Uberlândia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São João Batista de Volta Redonda",
    "nome": "Hospital São João Batista de Volta Redonda",
    "count": 181,
    "uf": "Nacional",
    "key": "Hospital São João Batista de Volta Redonda",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "IC-FUC/RS",
    "nome": "IC-FUC/RS",
    "count": 181,
    "uf": "RS",
    "key": "IC-FUC/RS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMSP",
    "nome": "SCMSP",
    "count": 181,
    "uf": "SP",
    "key": "SCMSP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "FMJ",
    "nome": "FAMERP",
    "count": 180,
    "uf": "SP",
    "key": "FMJ",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Associação Catarinense de Medicina - Santa Catarina",
    "nome": "Associação Catarinense de Medicina - Santa Catarina",
    "count": 179,
    "uf": "SC",
    "key": "Associação Catarinense de Medicina - Santa Catarina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "DASA",
    "nome": "DASA - Diagnósticos da América (SP)",
    "count": 179,
    "uf": "AM",
    "key": "DASA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HPM-MG",
    "nome": "HPM-MG",
    "count": 179,
    "uf": "MG",
    "key": "HPM-MG",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Secretaria Estadual de Saúde - Rio de Janeiro",
    "nome": "Secretaria Estadual de Saúde - Rio de Janeiro",
    "count": 179,
    "uf": "RJ",
    "key": "Secretaria Estadual de Saúde - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HGG GO",
    "nome": "HGG GO",
    "count": 178,
    "uf": "GO",
    "key": "HGG GO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Vassouras",
    "nome": "Vassouras",
    "count": 178,
    "uf": "RJ",
    "key": "Vassouras",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Pontifícia Universidade Católica do Rio Grande do Sul",
    "nome": "Pontifícia Universidade Católica do Rio Grande do Sul",
    "count": 177,
    "uf": "RS",
    "key": "Pontifícia Universidade Católica do Rio Grande do Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Campina Grande - Hospital Universitário Alcides Carneiro",
    "nome": "Universidade Federal de Campina Grande - Hospital Universitário Alcides Carneiro",
    "count": 174,
    "uf": "PR",
    "key": "Universidade Federal de Campina Grande - Hospital Universitário Alcides Carneiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIEVANGÉLICA - Universidade Evangélica de Goiás",
    "nome": "UNIEVANGÉLICA - Universidade Evangélica de Goiás",
    "count": 173,
    "uf": "GO",
    "key": "UNIEVANGÉLICA - Universidade Evangélica de Goiás",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HRPP",
    "nome": "HRPP",
    "count": 172,
    "uf": "Nacional",
    "key": "HRPP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital Maternidade Therezinha de Jesus",
    "nome": "Hospital Maternidade Therezinha de Jesus",
    "count": 172,
    "uf": "Nacional",
    "key": "Hospital Maternidade Therezinha de Jesus",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FHEMIG",
    "nome": "FAMERP",
    "count": 171,
    "uf": "SP",
    "key": "FHEMIG",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital Escola Luiz Gioseffi Jannuzzi",
    "nome": "Hospital Escola Luiz Gioseffi Jannuzzi",
    "count": 171,
    "uf": "Nacional",
    "key": "Hospital Escola Luiz Gioseffi Jannuzzi",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade Estadual do Oeste do Paraná",
    "nome": "Universidade Estadual do Oeste do Paraná",
    "count": 171,
    "uf": "PR",
    "key": "Universidade Estadual do Oeste do Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "RMEAP - Residência Médica do Estado do Amapá",
    "nome": "Hospital Central da Polícia Militar - Rio de Janeiro",
    "count": 170,
    "uf": "RJ",
    "key": "RMEAP - Residência Médica do Estado do Amapá",
    "modalidades": [
      "Revalida",
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Estadual de Londrina",
    "nome": "Universidade Estadual de Londrina",
    "count": 170,
    "uf": "PR",
    "key": "Universidade Estadual de Londrina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Ciências da Saúde de Porto Alegre",
    "nome": "Universidade Federal de Ciências da Saúde de Porto Alegre",
    "count": 170,
    "uf": "Nacional",
    "key": "Universidade Federal de Ciências da Saúde de Porto Alegre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FESF-SUS",
    "nome": "FESF-SUS",
    "count": 168,
    "uf": "Nacional",
    "key": "FESF-SUS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IFF",
    "nome": "FAMERP",
    "count": 168,
    "uf": "SP",
    "key": "IFF",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SCM-BM",
    "nome": "Fundação de Beneficência Hospital de Cirurgia",
    "count": 166,
    "uf": "Nacional",
    "key": "SCM-BM",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade Estadual de Maringá",
    "nome": "Universidade Estadual de Maringá",
    "count": 163,
    "uf": "PR",
    "key": "Universidade Estadual de Maringá",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UEPA-BELÉM",
    "nome": "UEPA-BELÉM",
    "count": 162,
    "uf": "PA",
    "key": "UEPA-BELÉM",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SMS-CE",
    "nome": "SMS-CE",
    "count": 160,
    "uf": "CE",
    "key": "SMS-CE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Clínicas de Porto Alegre",
    "nome": "Hospital de Clínicas de Porto Alegre",
    "count": 159,
    "uf": "Nacional",
    "key": "Hospital de Clínicas de Porto Alegre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UEMA",
    "nome": "UEMA",
    "count": 154,
    "uf": "PR",
    "key": "UEMA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFU",
    "nome": "FAMERP",
    "count": 154,
    "uf": "SP",
    "key": "UFU",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Banca Oficial",
    "nome": "Banca Oficial",
    "count": 153,
    "uf": "Nacional",
    "key": "Banca Oficial",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOSP",
    "nome": "HOSP",
    "count": 152,
    "uf": "Nacional",
    "key": "HOSP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "INEP ENADE",
    "nome": "Hospital Central da Polícia Militar - Rio de Janeiro",
    "count": 152,
    "uf": "Nacional",
    "key": "INEP ENADE",
    "modalidades": [
      "Revalida"
    ]
  },
  {
    "sigla": "IOVALE",
    "nome": "AMRIGS",
    "count": 151,
    "uf": "RS",
    "key": "IOVALE",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HCB-SP",
    "nome": "HCB-SP",
    "count": 150,
    "uf": "SP",
    "key": "HCB-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HELGJ",
    "nome": "HELGJ",
    "count": 150,
    "uf": "Nacional",
    "key": "HELGJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UE-RJ",
    "nome": "UE-RJ",
    "count": 150,
    "uf": "RJ",
    "key": "UE-RJ",
    "modalidades": [
      "R+"
    ]
  },
  {
    "sigla": "Universidade Federal de Mato Grosso do Sul",
    "nome": "Universidade Federal de Mato Grosso do Sul",
    "count": 150,
    "uf": "MT",
    "key": "Universidade Federal de Mato Grosso do Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HASP",
    "nome": "HASP",
    "count": 148,
    "uf": "Nacional",
    "key": "HASP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFSM/HUSM",
    "nome": "UFSM/HUSM",
    "count": 148,
    "uf": "RS",
    "key": "UFSM/HUSM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Policlin",
    "nome": "Hospital Policlin - São José dos Campos (SP)",
    "count": 147,
    "uf": "SP",
    "key": "Hospital Policlin",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário de Jundiaí",
    "nome": "Hospital Universitário de Jundiaí",
    "count": 147,
    "uf": "SP",
    "key": "Hospital Universitário de Jundiaí",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ISCMS-SP",
    "nome": "ISCMS-SP",
    "count": 147,
    "uf": "SP",
    "key": "ISCMS-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal do Rio de Janeiro",
    "nome": "Universidade Federal do Rio de Janeiro",
    "count": 147,
    "uf": "RJ",
    "key": "Universidade Federal do Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOB-DF",
    "nome": "HOB-DF",
    "count": 145,
    "uf": "DF",
    "key": "HOB-DF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HVC-SP",
    "nome": "HVC-SP",
    "count": 145,
    "uf": "SP",
    "key": "HVC-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSL Copacabana",
    "nome": "HSL Copacabana",
    "count": 144,
    "uf": "Nacional",
    "key": "HSL Copacabana",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Evangélica de Anápolis",
    "nome": "Universidade Evangélica de Anápolis",
    "count": 143,
    "uf": "GO",
    "key": "Universidade Evangélica de Anápolis",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Estadual Santa Casa",
    "nome": "Hospital Estadual Santa Casa - Cuiabá (MT)",
    "count": 142,
    "uf": "MT",
    "key": "Hospital Estadual Santa Casa",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PMF",
    "nome": "PMF - Prefeitura Municipal de Franca (SP)",
    "count": 142,
    "uf": "SP",
    "key": "PMF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-PR",
    "nome": "FAMERP",
    "count": 141,
    "uf": "PR",
    "key": "SMS-PR",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UNIRIO -",
    "nome": "FAMERP",
    "count": 141,
    "uf": "SP",
    "key": "UNIRIO -",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HSI",
    "nome": "HSI",
    "count": 140,
    "uf": "Nacional",
    "key": "HSI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HUBFS-HUJBB",
    "nome": "HUBFS-HUJBB",
    "count": 140,
    "uf": "DF",
    "key": "HUBFS-HUJBB",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFSCar",
    "nome": "UFSCar",
    "count": 140,
    "uf": "SC",
    "key": "UFSCar",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Naval Marcílio Dias",
    "nome": "Hospital Naval Marcílio Dias",
    "count": 138,
    "uf": "Nacional",
    "key": "Hospital Naval Marcílio Dias",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFCSPA",
    "nome": "UFCSPA",
    "count": 138,
    "uf": "RS",
    "key": "UFCSPA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sistema Único de Saúde - Roraima",
    "nome": "Sistema Único de Saúde - Roraima",
    "count": 136,
    "uf": "RR",
    "key": "Sistema Único de Saúde - Roraima",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UFAL",
    "nome": "Hospital Universitário Alcides Carneiro",
    "count": 136,
    "uf": "AL",
    "key": "UFAL",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Desconhecida",
    "nome": "Desconhecida",
    "count": 135,
    "uf": "Nacional",
    "key": "Desconhecida",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMSJRP",
    "nome": "FAMERP",
    "count": 135,
    "uf": "SP",
    "key": "SCMSJRP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIMED",
    "nome": "UNIMED",
    "count": 134,
    "uf": "Nacional",
    "key": "UNIMED",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOG-SP",
    "nome": "HOG-SP",
    "count": 132,
    "uf": "SP",
    "key": "HOG-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-JP",
    "nome": "PUC-PR",
    "count": 131,
    "uf": "PR",
    "key": "SMS-JP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SES-SC",
    "nome": "FAMERP",
    "count": 128,
    "uf": "SC",
    "key": "SES-SC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Luterana do Brasil",
    "nome": "Universidade Luterana do Brasil",
    "count": 128,
    "uf": "Nacional",
    "key": "Universidade Luterana do Brasil",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Associação Fluminense de Assistência à Mulher, à Criança e ao Idoso",
    "nome": "Associação Fluminense de Assistência à Mulher, à Criança e ao Idoso",
    "count": 126,
    "uf": "Nacional",
    "key": "Associação Fluminense de Assistência à Mulher, à Criança e ao Idoso",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "BOS",
    "nome": "BOS",
    "count": 125,
    "uf": "Nacional",
    "key": "BOS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas de Teresópolis Costantino Ottaviano",
    "nome": "Hospital das Clínicas de Teresópolis Costantino Ottaviano",
    "count": 125,
    "uf": "Nacional",
    "key": "Hospital das Clínicas de Teresópolis Costantino Ottaviano",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de São José do Rio Preto (SP)",
    "nome": "Santa Casa de São José do Rio Preto (SP)",
    "count": 125,
    "uf": "SP",
    "key": "Santa Casa de São José do Rio Preto (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSJBVR",
    "nome": "HSJBVR",
    "count": 122,
    "uf": "Nacional",
    "key": "HSJBVR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HNSL-PR",
    "nome": "HNSL-PR",
    "count": 120,
    "uf": "PR",
    "key": "HNSL-PR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Bettina Ferro de Souza / João Barros Barreto",
    "nome": "Hospital Universitário Bettina Ferro de Souza / João Barros Barreto",
    "count": 120,
    "uf": "Nacional",
    "key": "Hospital Universitário Bettina Ferro de Souza / João Barros Barreto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FHSTE",
    "nome": "FHSTE",
    "count": 119,
    "uf": "Nacional",
    "key": "FHSTE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFPA",
    "nome": "UFPA",
    "count": 119,
    "uf": "PA",
    "key": "UFPA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "UNITAU",
    "nome": "FAMERP",
    "count": 119,
    "uf": "SP",
    "key": "UNITAU",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade Federal do Amapá",
    "nome": "Universidade Federal do Amapá - Campus Marco Zero",
    "count": 117,
    "uf": "PR",
    "key": "Universidade Federal do Amapá",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Municipal de São José dos Campos",
    "nome": "Hospital Municipal de São José dos Campos",
    "count": 116,
    "uf": "PR",
    "key": "Hospital Municipal de São José dos Campos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ICRS",
    "nome": "FAMERP",
    "count": 116,
    "uf": "SP",
    "key": "ICRS",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "IDPC/Dante Pazzanese",
    "nome": "IDPC/Dante Pazzanese - Instituto de Cardiologia (SP)",
    "count": 116,
    "uf": "SP",
    "key": "IDPC/Dante Pazzanese",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ESPPA",
    "nome": "ESPPA",
    "count": 115,
    "uf": "Nacional",
    "key": "ESPPA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FESP",
    "nome": "FESP",
    "count": 114,
    "uf": "Nacional",
    "key": "FESP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HA-AL",
    "nome": "HA-AL",
    "count": 114,
    "uf": "AL",
    "key": "HA-AL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FundMed",
    "nome": "UFCSPA",
    "count": 112,
    "uf": "RS",
    "key": "FundMed",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOA-AC",
    "nome": "HOA-AC",
    "count": 111,
    "uf": "AC",
    "key": "HOA-AC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IBAP",
    "nome": "Hospital de Clínicas da Universidade Federal do Paraná",
    "count": 110,
    "uf": "PR",
    "key": "IBAP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HSJC",
    "nome": "FAMERP",
    "count": 109,
    "uf": "SP",
    "key": "HSJC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Processo Seletivo Unificado - Minas Gerais",
    "nome": "Processo Seletivo Unificado - Minas Gerais",
    "count": 108,
    "uf": "MG",
    "key": "Processo Seletivo Unificado - Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ULBRA",
    "nome": "ULBRA",
    "count": 108,
    "uf": "Nacional",
    "key": "ULBRA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital da Polícia Militar de Minas Gerais",
    "nome": "Hospital da Polícia Militar de Minas Gerais",
    "count": 107,
    "uf": "MG",
    "key": "Hospital da Polícia Militar de Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UDI - UDI Hospital",
    "nome": "Hospital Angelina Caron",
    "count": 107,
    "uf": "Nacional",
    "key": "UDI - UDI Hospital",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Faculdade de Medicina de Campos",
    "nome": "Faculdade de Medicina de Campos",
    "count": 104,
    "uf": "PR",
    "key": "Faculdade de Medicina de Campos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HVL",
    "nome": "HVL",
    "count": 104,
    "uf": "Nacional",
    "key": "HVL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas do Paraná",
    "nome": "Hospital das Clínicas do Paraná",
    "count": 102,
    "uf": "PR",
    "key": "Hospital das Clínicas do Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de São José dos Pinhais",
    "nome": "Secretaria Municipal de Saúde de São José dos Pinhais",
    "count": 102,
    "uf": "Nacional",
    "key": "Secretaria Municipal de Saúde de São José dos Pinhais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HEL",
    "nome": "FAMERP",
    "count": 101,
    "uf": "SP",
    "key": "HEL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSJA",
    "nome": "HSJA",
    "count": 101,
    "uf": "Nacional",
    "key": "HSJA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "APCC",
    "nome": "APCC",
    "count": 100,
    "uf": "Nacional",
    "key": "APCC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CEPS/UFPA",
    "nome": "UFPA",
    "count": 100,
    "uf": "PA",
    "key": "CEPS/UFPA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Complexo Américas",
    "nome": "Complexo Américas - Rede Américas (RJ)",
    "count": 100,
    "uf": "AM",
    "key": "Complexo Américas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FUNDHACRE/HEA",
    "nome": "FUNDHACRE/HEA",
    "count": 100,
    "uf": "AC",
    "key": "FUNDHACRE/HEA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade Evangélica Mackenzie do Paraná",
    "nome": "Faculdade Evangélica Mackenzie do Paraná - FEMPAR",
    "count": 100,
    "uf": "PR",
    "key": "Faculdade Evangélica Mackenzie do Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade São Leopoldo Mandic",
    "nome": "Faculdade São Leopoldo Mandic",
    "count": 100,
    "uf": "Nacional",
    "key": "Faculdade São Leopoldo Mandic",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMMG",
    "nome": "HMMG",
    "count": 100,
    "uf": "Nacional",
    "key": "HMMG",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HRAV",
    "nome": "HRAV",
    "count": 100,
    "uf": "Nacional",
    "key": "HRAV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HRD",
    "nome": "HRD",
    "count": 100,
    "uf": "Nacional",
    "key": "HRD",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HUAB",
    "nome": "HUAB",
    "count": 100,
    "uf": "Nacional",
    "key": "HUAB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HUEC",
    "nome": "HUEC",
    "count": 100,
    "uf": "Nacional",
    "key": "HUEC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMC-MT",
    "nome": "SCMC-MT",
    "count": 100,
    "uf": "MT",
    "key": "SCMC-MT",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMPA-PA",
    "nome": "SCMPA-PA",
    "count": 100,
    "uf": "PA",
    "key": "SCMPA-PA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS São José dos Pinhais - Secretaria Municipal de Saúde (PR)",
    "nome": "SMS São José dos Pinhais - Secretaria Municipal de Saúde (PR)",
    "count": 100,
    "uf": "PR",
    "key": "SMS São José dos Pinhais - Secretaria Municipal de Saúde (PR)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Selecting",
    "nome": "Grupo VIV",
    "count": 100,
    "uf": "Nacional",
    "key": "Selecting",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIPLAC",
    "nome": "UNIPLAC",
    "count": 100,
    "uf": "Nacional",
    "key": "UNIPLAC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNISA",
    "nome": "UNISA",
    "count": 100,
    "uf": "Nacional",
    "key": "UNISA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Paulista",
    "nome": "Universidade Paulista - UNIP",
    "count": 100,
    "uf": "Nacional",
    "key": "Universidade Paulista",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade do Oeste Paulista",
    "nome": "Universidade do Oeste Paulista - Campus Presidente Prudente - UNOESTE",
    "count": 100,
    "uf": "PR",
    "key": "Universidade do Oeste Paulista",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "EFCE",
    "nome": "EFCE",
    "count": 99,
    "uf": "Nacional",
    "key": "EFCE",
    "modalidades": [
      "R+"
    ]
  },
  {
    "sigla": "HHJ-ICC",
    "nome": "HHJ-ICC",
    "count": 99,
    "uf": "Nacional",
    "key": "HHJ-ICC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMMKB",
    "nome": "HMMKB",
    "count": 99,
    "uf": "Nacional",
    "key": "HMMKB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSC-SP",
    "nome": "HSC-SP",
    "count": 99,
    "uf": "SP",
    "key": "HSC-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PSU-ES/SUL",
    "nome": "PSU-ES/SUL - Processo Seletivo Unificado ES/Sul de Residência Médica",
    "count": 99,
    "uf": "ES",
    "key": "PSU-ES/SUL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SESAPI",
    "nome": "SESAPI",
    "count": 99,
    "uf": "Nacional",
    "key": "SESAPI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal do Maranhão",
    "nome": "Universidade Federal do Maranhão",
    "count": 99,
    "uf": "MA",
    "key": "Universidade Federal do Maranhão",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HEV-UNIFAA",
    "nome": "HEV-UNIFAA",
    "count": 98,
    "uf": "Nacional",
    "key": "HEV-UNIFAA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São Marcos",
    "nome": "Hospital São Marcos - Teresina (PI)",
    "count": 98,
    "uf": "PI",
    "key": "Hospital São Marcos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Oftalmoclínica",
    "nome": "Oftalmoclínica - São Gonçalo (RJ)",
    "count": 98,
    "uf": "RJ",
    "key": "Oftalmoclínica",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFCG R1 2021",
    "nome": "UFCG R1 2021",
    "count": 98,
    "uf": "CE",
    "key": "UFCG R1 2021",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ultra",
    "nome": "Ultra-X Medicina Diagnóstica (SP)",
    "count": 98,
    "uf": "SP",
    "key": "Ultra",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "AUSTA",
    "nome": "AUSTA",
    "count": 97,
    "uf": "Nacional",
    "key": "AUSTA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSJ - PR - Hospital São José",
    "nome": "FAMERP",
    "count": 97,
    "uf": "PR",
    "key": "HSJ - PR - Hospital São José",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SPBC",
    "nome": "SPBC - Sociedade Portuguesa de Beneficência de Campos (RJ)",
    "count": 97,
    "uf": "RJ",
    "key": "SPBC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSP/UNIFESP",
    "nome": "UNIFESP",
    "count": 96,
    "uf": "SP",
    "key": "HSP/UNIFESP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade de Uberaba",
    "nome": "Universidade de Uberaba - UNIUBE",
    "count": 96,
    "uf": "MG",
    "key": "Universidade de Uberaba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CESUPA",
    "nome": "CESUPA",
    "count": 94,
    "uf": "Nacional",
    "key": "CESUPA",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "HMV/Moinhos",
    "nome": "HMV/Moinhos",
    "count": 94,
    "uf": "Nacional",
    "key": "HMV/Moinhos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Benjamin Constant",
    "nome": "Instituto Benjamin Constant",
    "count": 94,
    "uf": "Nacional",
    "key": "Instituto Benjamin Constant",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HGG-GO",
    "nome": "HGG-GO",
    "count": 93,
    "uf": "GO",
    "key": "HGG-GO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Barra Mansa",
    "nome": "Santa Casa de Misericórdia de Barra Mansa",
    "count": 93,
    "uf": "Nacional",
    "key": "Santa Casa de Misericórdia de Barra Mansa",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Caxias",
    "nome": "Secretaria Municipal de Saúde de Caxias",
    "count": 93,
    "uf": "Nacional",
    "key": "Secretaria Municipal de Saúde de Caxias",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UDI 24 Horas",
    "nome": "UDI 24 Horas - UDI Medicina Diagnóstica (PI)",
    "count": 93,
    "uf": "PI",
    "key": "UDI 24 Horas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória",
    "nome": "Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória",
    "count": 92,
    "uf": "PE",
    "key": "Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS Goiânia",
    "nome": "SMS Goiânia - Secretaria Municipal de Saúde de Goiânia (GO)",
    "count": 92,
    "uf": "GO",
    "key": "SMS Goiânia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMSCG",
    "nome": "SMSCG",
    "count": 92,
    "uf": "Nacional",
    "key": "SMSCG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "AOCP",
    "nome": "AOCP",
    "count": 91,
    "uf": "Nacional",
    "key": "AOCP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Limeira",
    "nome": "Santa Casa de Misericórdia de Limeira",
    "count": 91,
    "uf": "Nacional",
    "key": "Santa Casa de Misericórdia de Limeira",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Afya Centro Universitário de Araguaína",
    "nome": "Afya Centro Universitário de Araguaína - UNITPAC",
    "count": 90,
    "uf": "TO",
    "key": "Afya Centro Universitário de Araguaína",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Naval Marcilio Dias",
    "nome": "Hospital Naval Marcilio Dias",
    "count": 90,
    "uf": "Nacional",
    "key": "Hospital Naval Marcilio Dias",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSL-DF",
    "nome": "HSL-DF",
    "count": 89,
    "uf": "DF",
    "key": "HSL-DF",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital Pequeno Príncipe",
    "nome": "Hospital Pequeno Príncipe",
    "count": 89,
    "uf": "PR",
    "key": "Hospital Pequeno Príncipe",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HACC",
    "nome": "HACC",
    "count": 88,
    "uf": "Nacional",
    "key": "HACC",
    "modalidades": [
      "R+"
    ]
  },
  {
    "sigla": "Hospital Ernesto Dornelles",
    "nome": "Hospital Ernesto Dornelles",
    "count": 88,
    "uf": "Nacional",
    "key": "Hospital Ernesto Dornelles",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Evangélico Mackenzie (Curitiba)",
    "nome": "Hospital Universitário Evangélico Mackenzie (Curitiba)",
    "count": 88,
    "uf": "PR",
    "key": "Hospital Universitário Evangélico Mackenzie (Curitiba)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto de Previdência dos Servidores do Estado de Minas Gerais",
    "nome": "Instituto de Previdência dos Servidores do Estado de Minas Gerais",
    "count": 88,
    "uf": "MG",
    "key": "Instituto de Previdência dos Servidores do Estado de Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Materno Infantil Dr. Jeser Amarante Faria",
    "nome": "Hospital Materno Infantil Dr. Jeser Amarante Faria",
    "count": 87,
    "uf": "Nacional",
    "key": "Hospital Materno Infantil Dr. Jeser Amarante Faria",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ISCMA",
    "nome": "FAMERP",
    "count": 86,
    "uf": "SP",
    "key": "ISCMA",
    "modalidades": [
      "Acesso Direto",
      "Revalida"
    ]
  },
  {
    "sigla": "Universidade Santo Amaro",
    "nome": "Universidade Santo Amaro",
    "count": 86,
    "uf": "SP",
    "key": "Universidade Santo Amaro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Associação Médica de Santa Catarina - Santa Catarina",
    "nome": "Associação Médica de Santa Catarina - Santa Catarina",
    "count": 85,
    "uf": "SC",
    "key": "Associação Médica de Santa Catarina - Santa Catarina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Santa Isabel",
    "nome": "Hospital Santa Isabel",
    "count": 85,
    "uf": "Nacional",
    "key": "Hospital Santa Isabel",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS Lucas do Rio Verde",
    "nome": "SMS Lucas do Rio Verde - Secretaria Municipal de Saúde (MT)",
    "count": 85,
    "uf": "MT",
    "key": "SMS Lucas do Rio Verde",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFFS",
    "nome": "UFFS",
    "count": 85,
    "uf": "RJ",
    "key": "UFFS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Nossa Senhora da Conceição",
    "nome": "Hospital Nossa Senhora da Conceição",
    "count": 84,
    "uf": "Nacional",
    "key": "Hospital Nossa Senhora da Conceição",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Bettina Ferro de Souza / Hospital João Barros Barreto",
    "nome": "Hospital Universitário Bettina Ferro de Souza / Hospital João Barros Barreto",
    "count": 84,
    "uf": "Nacional",
    "key": "Hospital Universitário Bettina Ferro de Souza / Hospital João Barros Barreto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Católica de Pelotas - Hospital Universitário São Francisco de Paula",
    "nome": "Universidade Católica de Pelotas - Hospital Universitário São Francisco de Paula",
    "count": 84,
    "uf": "RS",
    "key": "Universidade Católica de Pelotas - Hospital Universitário São Francisco de Paula",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Escola de Saúde de Teresópolis",
    "nome": "Fundação Escola de Saúde de Teresópolis",
    "count": 83,
    "uf": "Nacional",
    "key": "Fundação Escola de Saúde de Teresópolis",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Escola Luiz Gioseffi Jannuzi",
    "nome": "Hospital Escola Luiz Gioseffi Jannuzi",
    "count": 83,
    "uf": "Nacional",
    "key": "Hospital Escola Luiz Gioseffi Jannuzi",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Moinhos de Vento",
    "nome": "Hospital Moinhos de Vento",
    "count": 83,
    "uf": "Nacional",
    "key": "Hospital Moinhos de Vento",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universidade da Integração de Direitos",
    "nome": "Hospital Universidade da Integração de Direitos",
    "count": 83,
    "uf": "Nacional",
    "key": "Hospital Universidade da Integração de Direitos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "OftalmoClínica São Gonçalo",
    "nome": "OftalmoClínica São Gonçalo",
    "count": 83,
    "uf": "Nacional",
    "key": "OftalmoClínica São Gonçalo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal do Espírito Santo",
    "nome": "Universidade Federal do Espírito Santo",
    "count": 83,
    "uf": "ES",
    "key": "Universidade Federal do Espírito Santo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Cajuru",
    "nome": "Hospital Universitário Cajuru",
    "count": 82,
    "uf": "Nacional",
    "key": "Hospital Universitário Cajuru",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Pelotas",
    "nome": "Universidade Federal de Pelotas",
    "count": 82,
    "uf": "RS",
    "key": "Universidade Federal de Pelotas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS São José do Rio Preto",
    "nome": "SMS São José do Rio Preto - Secretaria Municipal de Saúde (SP)",
    "count": 80,
    "uf": "SP",
    "key": "SMS São José do Rio Preto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CHN",
    "nome": "CHN",
    "count": 79,
    "uf": "Nacional",
    "key": "CHN",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HEJSN",
    "nome": "HEJSN",
    "count": 79,
    "uf": "Nacional",
    "key": "HEJSN",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Comunitária da Região de Chapecó",
    "nome": "Universidade Comunitária da Região de Chapecó",
    "count": 78,
    "uf": "Nacional",
    "key": "Universidade Comunitária da Região de Chapecó",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CVV",
    "nome": "CVV",
    "count": 77,
    "uf": "Nacional",
    "key": "CVV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Regional de Maringá",
    "nome": "Hospital Universitário Regional de Maringá",
    "count": 77,
    "uf": "PR",
    "key": "Hospital Universitário Regional de Maringá",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Emergência e Traumas Senador Humberto Lucena",
    "nome": "Hospital de Emergência e Traumas Senador Humberto Lucena",
    "count": 76,
    "uf": "Nacional",
    "key": "Hospital de Emergência e Traumas Senador Humberto Lucena",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SUS - RR",
    "nome": "FAMERP",
    "count": 76,
    "uf": "RR",
    "key": "SUS - RR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Araras (SP)",
    "nome": "Santa Casa de Araras (SP)",
    "count": 76,
    "uf": "SP",
    "key": "Santa Casa de Araras (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FMIT",
    "nome": "FMIT",
    "count": 75,
    "uf": "Nacional",
    "key": "FMIT",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HFR",
    "nome": "HFR",
    "count": 75,
    "uf": "Nacional",
    "key": "HFR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMJLF",
    "nome": "HMJLF",
    "count": 75,
    "uf": "Nacional",
    "key": "HMJLF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Dante Pazzanese",
    "nome": "Hospital Dante Pazzanese",
    "count": 75,
    "uf": "Nacional",
    "key": "Hospital Dante Pazzanese",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Beneficência Portuguesa de Ribeirão Preto",
    "nome": "Beneficência Portuguesa de Ribeirão Preto",
    "count": 74,
    "uf": "SP",
    "key": "Beneficência Portuguesa de Ribeirão Preto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Hospitalar do Estado de Minas Gerais",
    "nome": "Fundação Hospitalar do Estado de Minas Gerais",
    "count": 74,
    "uf": "MG",
    "key": "Fundação Hospitalar do Estado de Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Nossa Senhora das Graças - Apucarana",
    "nome": "Hospital Nossa Senhora das Graças - Apucarana",
    "count": 74,
    "uf": "Nacional",
    "key": "Hospital Nossa Senhora das Graças - Apucarana",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFPEL",
    "nome": "UFPEL",
    "count": 74,
    "uf": "RS",
    "key": "UFPEL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto de Doenças Osteoarticulares e Reumatologia - Rede DOR",
    "nome": "Instituto de Doenças Osteoarticulares e Reumatologia - Rede DOR",
    "count": 73,
    "uf": "Nacional",
    "key": "Instituto de Doenças Osteoarticulares e Reumatologia - Rede DOR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-SANTOS",
    "nome": "SMS-SANTOS",
    "count": 71,
    "uf": "Nacional",
    "key": "SMS-SANTOS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HECI",
    "nome": "HECI",
    "count": 70,
    "uf": "Nacional",
    "key": "HECI",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade Federal de Pelotas - Hospital Escola da UFPEL",
    "nome": "Universidade Federal de Pelotas - Hospital Escola da UFPEL",
    "count": 69,
    "uf": "RS",
    "key": "Universidade Federal de Pelotas - Hospital Escola da UFPEL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação de Ensino e Pesquisa em Medicina de Itajubá",
    "nome": "Fundação de Ensino e Pesquisa em Medicina de Itajubá",
    "count": 68,
    "uf": "Nacional",
    "key": "Fundação de Ensino e Pesquisa em Medicina de Itajubá",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São José de Criciúma",
    "nome": "Hospital São José de Criciúma",
    "count": 68,
    "uf": "SC",
    "key": "Hospital São José de Criciúma",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto do Ombro e do Joelho - Rede D'Or",
    "nome": "Instituto do Ombro e do Joelho - Rede D'Or",
    "count": 67,
    "uf": "Nacional",
    "key": "Instituto do Ombro e do Joelho - Rede D'Or",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SES - MA.",
    "nome": "SES - MA.",
    "count": 66,
    "uf": "MA",
    "key": "SES - MA.",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Fundação de Beneficência Hospital de Cirurgia",
    "nome": "Fundação de Beneficência Hospital de Cirurgia",
    "count": 65,
    "uf": "Nacional",
    "key": "Fundação de Beneficência Hospital de Cirurgia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Luterana do Brasil - Hospital Universitário da ULBRA",
    "nome": "Universidade Luterana do Brasil - Hospital Universitário da ULBRA",
    "count": 65,
    "uf": "Nacional",
    "key": "Universidade Luterana do Brasil - Hospital Universitário da ULBRA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Alvorada",
    "nome": "Hospital Alvorada",
    "count": 62,
    "uf": "Nacional",
    "key": "Hospital Alvorada",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HC-MT",
    "nome": "HC-MT",
    "count": 61,
    "uf": "MT",
    "key": "HC-MT",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Campina Grande",
    "nome": "Universidade Federal de Campina Grande",
    "count": 61,
    "uf": "PR",
    "key": "Universidade Federal de Campina Grande",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCOR",
    "nome": "HCOR",
    "count": 60,
    "uf": "Nacional",
    "key": "HCOR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOL-PA",
    "nome": "HOL-PA",
    "count": 60,
    "uf": "PA",
    "key": "HOL-PA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Rondonópolis (MT)",
    "nome": "Santa Casa de Rondonópolis (MT)",
    "count": 60,
    "uf": "MT",
    "key": "Santa Casa de Rondonópolis (MT)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Vida",
    "nome": "Hospital Vida",
    "count": 59,
    "uf": "Nacional",
    "key": "Hospital Vida",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital do Coração de Londrina",
    "nome": "Hospital do Coração de Londrina",
    "count": 59,
    "uf": "PR",
    "key": "Hospital do Coração de Londrina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário da Universidade Luterana do Brasil",
    "nome": "Hospital Universitário da Universidade Luterana do Brasil",
    "count": 58,
    "uf": "Nacional",
    "key": "Hospital Universitário da Universidade Luterana do Brasil",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto de Olhos de Goiânia",
    "nome": "Instituto de Olhos de Goiânia",
    "count": 58,
    "uf": "GO",
    "key": "Instituto de Olhos de Goiânia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Prontobaby",
    "nome": "Prontobaby",
    "count": 57,
    "uf": "Nacional",
    "key": "Prontobaby",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Alvorada - São Paulo",
    "nome": "Hospital Alvorada - São Paulo",
    "count": 56,
    "uf": "SP",
    "key": "Hospital Alvorada - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Sul Fluminense",
    "nome": "Hospital Universitário Sul Fluminense",
    "count": 55,
    "uf": "Nacional",
    "key": "Hospital Universitário Sul Fluminense",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIGRANRIO",
    "nome": "FAMERP",
    "count": 55,
    "uf": "SP",
    "key": "UNIGRANRIO",
    "modalidades": [
      "Revalida",
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIRG",
    "nome": "Centro Universitário UNIRG",
    "count": 55,
    "uf": "TO",
    "key": "UNIRG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CCG",
    "nome": "CCG",
    "count": 54,
    "uf": "Nacional",
    "key": "CCG",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "EMCM - Escola Municipal de Ciências Médicas",
    "nome": "EMCM - Escola Municipal de Ciências Médicas",
    "count": 54,
    "uf": "Nacional",
    "key": "EMCM - Escola Municipal de Ciências Médicas",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital de Câncer de Mato Grosso",
    "nome": "Hospital de Câncer de Mato Grosso",
    "count": 53,
    "uf": "MT",
    "key": "Hospital de Câncer de Mato Grosso",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "AMS-LONDRINA",
    "nome": "AMS-LONDRINA",
    "count": 52,
    "uf": "PR",
    "key": "AMS-LONDRINA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSL - RP - Hospital São Lucas de Ribeirão Preto",
    "nome": "FAMERP",
    "count": 51,
    "uf": "SP",
    "key": "HSL - RP - Hospital São Lucas de Ribeirão Preto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "OASE",
    "nome": "OASE",
    "count": 51,
    "uf": "Nacional",
    "key": "OASE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CRAZ",
    "nome": "CRAZ",
    "count": 50,
    "uf": "Nacional",
    "key": "CRAZ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário de Várzea Grande",
    "nome": "Centro Universitário de Várzea Grande - UNIVAG",
    "count": 50,
    "uf": "Nacional",
    "key": "Centro Universitário de Várzea Grande",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCB-RO",
    "nome": "HCB-RO",
    "count": 50,
    "uf": "RO",
    "key": "HCB-RO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HEETSHL",
    "nome": "HEETSHL",
    "count": 50,
    "uf": "Nacional",
    "key": "HEETSHL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMSC",
    "nome": "HMSC",
    "count": 50,
    "uf": "Nacional",
    "key": "HMSC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HO Tocantins",
    "nome": "HO Tocantins",
    "count": 50,
    "uf": "TO",
    "key": "HO Tocantins",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSR-MT",
    "nome": "HSR-MT",
    "count": 50,
    "uf": "MT",
    "key": "HSR-MT",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "INGOH",
    "nome": "INGOH",
    "count": 50,
    "uf": "Nacional",
    "key": "INGOH",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IPUB",
    "nome": "IPUB",
    "count": 50,
    "uf": "Nacional",
    "key": "IPUB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ISMEP",
    "nome": "ISMEP",
    "count": 50,
    "uf": "Nacional",
    "key": "ISMEP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Nova Bene",
    "nome": "Nova Bene",
    "count": 50,
    "uf": "Nacional",
    "key": "Nova Bene",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "REVALIDA UFMT",
    "nome": "REVALIDA UFMT",
    "count": 50,
    "uf": "MT",
    "key": "REVALIDA UFMT",
    "modalidades": [
      "Revalida"
    ]
  },
  {
    "sigla": "Escola Multicampi de Ciências Médicas",
    "nome": "Escola Multicampi de Ciências Médicas",
    "count": 49,
    "uf": "PR",
    "key": "Escola Multicampi de Ciências Médicas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HBD",
    "nome": "HBD",
    "count": 49,
    "uf": "Nacional",
    "key": "HBD",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCP",
    "nome": "HCP",
    "count": 49,
    "uf": "Nacional",
    "key": "HCP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "ISCMB",
    "nome": "ISCMB",
    "count": 49,
    "uf": "Nacional",
    "key": "ISCMB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Nacional de Câncer",
    "nome": "Instituto Nacional de Câncer",
    "count": 49,
    "uf": "Nacional",
    "key": "Instituto Nacional de Câncer",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Unimontes/HUCF",
    "nome": "Unimontes/HUCF",
    "count": 49,
    "uf": "MG",
    "key": "Unimontes/HUCF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Santo Antônio de Blumenau",
    "nome": "Hospital Santo Antônio de Blumenau",
    "count": 48,
    "uf": "SC",
    "key": "Hospital Santo Antônio de Blumenau",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Consulplan",
    "nome": "ICC prova II",
    "count": 48,
    "uf": "Nacional",
    "key": "Instituto Consulplan",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SESAP Praia Grande",
    "nome": "SESAP Praia Grande - Secretaria de Saúde Pública de Praia Grande (SP)",
    "count": 48,
    "uf": "SP",
    "key": "SESAP Praia Grande",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UEPA-SANTARÉM",
    "nome": "UEPA-SANTARÉM",
    "count": 48,
    "uf": "PA",
    "key": "UEPA-SANTARÉM",
    "modalidades": [
      "R+"
    ]
  },
  {
    "sigla": "UNIMED-JP",
    "nome": "UNIMED-JP",
    "count": 48,
    "uf": "Nacional",
    "key": "UNIMED-JP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade Cesumar",
    "nome": "Universidade Cesumar - UniCesumar Maringá",
    "count": 48,
    "uf": "PR",
    "key": "Universidade Cesumar",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ESP CE",
    "nome": "ESP CE - Escola de Saúde Pública do Ceará",
    "count": 47,
    "uf": "CE",
    "key": "ESP CE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSL",
    "nome": "HSL",
    "count": 47,
    "uf": "Nacional",
    "key": "HSL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Mãe de Deus",
    "nome": "Hospital Mãe de Deus",
    "count": 47,
    "uf": "Nacional",
    "key": "Hospital Mãe de Deus",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-CG",
    "nome": "SMS-CG",
    "count": 47,
    "uf": "Nacional",
    "key": "SMS-CG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCAL",
    "nome": "HCAL",
    "count": 46,
    "uf": "Nacional",
    "key": "HCAL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Ofir Loyola",
    "nome": "Hospital Ofir Loyola",
    "count": 46,
    "uf": "Nacional",
    "key": "Hospital Ofir Loyola",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "TECM - Título de Especialista em Clínica Médica",
    "nome": "TECM - Título de Especialista em Clínica Médica",
    "count": 46,
    "uf": "Nacional",
    "key": "TECM - Título de Especialista em Clínica Médica",
    "modalidades": [
      "Título de Especialista"
    ]
  },
  {
    "sigla": "UOPCCAN",
    "nome": "UOPCCAN - União Oeste Paranaense de Combate ao Câncer (PR)",
    "count": 46,
    "uf": "PR",
    "key": "UOPCCAN",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMM - Santa Casa de Misericórdia de Maceió",
    "nome": "FAMERP",
    "count": 45,
    "uf": "SP",
    "key": "SCMM - Santa Casa de Misericórdia de Maceió",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Campo Grande",
    "nome": "Secretaria Municipal de Saúde de Campo Grande",
    "count": 45,
    "uf": "PR",
    "key": "Secretaria Municipal de Saúde de Campo Grande",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Unimed Rio",
    "nome": "Unimed Rio",
    "count": 45,
    "uf": "Nacional",
    "key": "Unimed Rio",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCLPM",
    "nome": "HCLPM",
    "count": 44,
    "uf": "Nacional",
    "key": "HCLPM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Alemão Oswaldo Cruz",
    "nome": "Hospital Alemão Oswaldo Cruz",
    "count": 44,
    "uf": "Nacional",
    "key": "Hospital Alemão Oswaldo Cruz",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Santa Rosa - Mato Grosso",
    "nome": "Hospital Santa Rosa - Mato Grosso",
    "count": 44,
    "uf": "MT",
    "key": "Hospital Santa Rosa - Mato Grosso",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMMA",
    "nome": "SCMMA",
    "count": 44,
    "uf": "Nacional",
    "key": "SCMMA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa casa de Assis",
    "nome": "Santa Casa de Assis",
    "count": 44,
    "uf": "Nacional",
    "key": "Santa casa de Assis",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário UNIRG",
    "nome": "Centro Universitário UNIRG",
    "count": 43,
    "uf": "TO",
    "key": "Centro Universitário UNIRG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital do Servidor Público Municipal",
    "nome": "Hospital do Servidor Público Municipal",
    "count": 43,
    "uf": "Nacional",
    "key": "Hospital do Servidor Público Municipal",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UHG - UnitedHealth Group Brasil (Amil)",
    "nome": "UHG - UnitedHealth Group Brasil (Amil)",
    "count": 42,
    "uf": "Nacional",
    "key": "UHG - UnitedHealth Group Brasil (Amil)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade do Planalto Catarinense",
    "nome": "Universidade do Planalto Catarinense",
    "count": 42,
    "uf": "Nacional",
    "key": "Universidade do Planalto Catarinense",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HIFA",
    "nome": "HIFA",
    "count": 41,
    "uf": "Nacional",
    "key": "HIFA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Emergência e Trauma Senador Humberto Lucena",
    "nome": "Hospital de Emergência e Trauma Senador Humberto Lucena",
    "count": 41,
    "uf": "Nacional",
    "key": "Hospital de Emergência e Trauma Senador Humberto Lucena",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital e Maternidade Marieta Konder Bornhausen",
    "nome": "Hospital e Maternidade Marieta Konder Bornhausen",
    "count": 41,
    "uf": "Nacional",
    "key": "Hospital e Maternidade Marieta Konder Bornhausen",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Estadual de Saúde de Teresópolis - Hospital das Clínicas de Teresópolis Costantino Ottaviano",
    "nome": "Fundação Estadual de Saúde de Teresópolis - Hospital das Clínicas de Teresópolis Costantino Ottaviano",
    "count": 40,
    "uf": "Nacional",
    "key": "Fundação Estadual de Saúde de Teresópolis - Hospital das Clínicas de Teresópolis Costantino Ottaviano",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Santa Teresa",
    "nome": "Hospital Santa Teresa",
    "count": 40,
    "uf": "Nacional",
    "key": "Hospital Santa Teresa",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Instituto de Doenças do Tórax",
    "nome": "Instituto de Doenças do Tórax",
    "count": 40,
    "uf": "Nacional",
    "key": "Instituto de Doenças do Tórax",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "SMS Santos",
    "nome": "SMS Santos",
    "count": 40,
    "uf": "Nacional",
    "key": "SMS Santos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SPMIP",
    "nome": "SPMIP",
    "count": 40,
    "uf": "Nacional",
    "key": "SPMIP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal da Saúde do Paraná",
    "nome": "Secretaria Municipal da Saúde do Paraná",
    "count": 40,
    "uf": "PR",
    "key": "Secretaria Municipal da Saúde do Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFCG",
    "nome": "UFCG",
    "count": 40,
    "uf": "CE",
    "key": "UFCG",
    "modalidades": [
      "R+"
    ]
  },
  {
    "sigla": "HLR",
    "nome": "HLR",
    "count": 38,
    "uf": "Nacional",
    "key": "HLR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Juiz de Fora",
    "nome": "Universidade Federal de Juiz de Fora",
    "count": 38,
    "uf": "MG",
    "key": "Universidade Federal de Juiz de Fora",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FESF",
    "nome": "FESF",
    "count": 37,
    "uf": "Nacional",
    "key": "FESF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Complexo Hospitalar de Niterói",
    "nome": "Complexo Hospitalar de Niterói",
    "count": 36,
    "uf": "Nacional",
    "key": "Complexo Hospitalar de Niterói",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FSNH",
    "nome": "FSNH",
    "count": 36,
    "uf": "Nacional",
    "key": "FSNH",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HUGO",
    "nome": "HUGO",
    "count": 36,
    "uf": "GO",
    "key": "HUGO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Cruz Azul",
    "nome": "Hospital Cruz Azul",
    "count": 36,
    "uf": "Nacional",
    "key": "Hospital Cruz Azul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São José do Avaí",
    "nome": "Hospital São José do Avaí",
    "count": 36,
    "uf": "Nacional",
    "key": "Hospital São José do Avaí",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital da Polícia Militar - Minas Gerais",
    "nome": "Hospital da Polícia Militar - Minas Gerais",
    "count": 36,
    "uf": "MG",
    "key": "Hospital da Polícia Militar - Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital e Maternidade Marieta Konder Bornhausense",
    "nome": "Hospital e Maternidade Marieta Konder Bornhausense",
    "count": 36,
    "uf": "Nacional",
    "key": "Hospital e Maternidade Marieta Konder Bornhausense",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFRB",
    "nome": "UFRB",
    "count": 35,
    "uf": "Nacional",
    "key": "UFRB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal da Fronteira Sul",
    "nome": "Universidade Federal da Fronteira Sul - Campus Passo Fundo",
    "count": 35,
    "uf": "RS",
    "key": "Universidade Federal da Fronteira Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HECNG",
    "nome": "FMABC",
    "count": 34,
    "uf": "SP",
    "key": "HECNG",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "ESP RS",
    "nome": "ESP RS - Escola de Saúde Pública do Rio Grande do Sul",
    "count": 33,
    "uf": "RS",
    "key": "ESP RS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PRO-CARDIACO",
    "nome": "PRO-CARDIACO",
    "count": 32,
    "uf": "Nacional",
    "key": "PRO-CARDIACO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSG",
    "nome": "HSG",
    "count": 31,
    "uf": "Nacional",
    "key": "HSG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Goiânia",
    "nome": "Santa Casa de Misericórdia de Goiânia",
    "count": 31,
    "uf": "GO",
    "key": "Santa Casa de Misericórdia de Goiânia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CEPUERJ",
    "nome": "UERJ (Pró-MFC)",
    "count": 30,
    "uf": "PR",
    "key": "CEPUERJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Evangélico de Vila Velha",
    "nome": "Hospital Evangélico de Vila Velha",
    "count": 30,
    "uf": "ES",
    "key": "Hospital Evangélico de Vila Velha",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "NUCLEOS",
    "nome": "NUCLEOS",
    "count": 30,
    "uf": "Nacional",
    "key": "NUCLEOS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HRPG",
    "nome": "HRPG",
    "count": 29,
    "uf": "Nacional",
    "key": "HRPG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UEPG",
    "nome": "UEPG",
    "count": 29,
    "uf": "Nacional",
    "key": "UEPG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HOSPITAL UNIVERSITÁRIO JÚLIO MÜLLER - UFMT",
    "nome": "HOSPITAL UNIVERSITÁRIO JÚLIO MÜLLER - UFMT",
    "count": 28,
    "uf": "MT",
    "key": "HOSPITAL UNIVERSITÁRIO JÚLIO MÜLLER - UFMT",
    "modalidades": [
      "R+"
    ]
  },
  {
    "sigla": "UEPASANTAREM",
    "nome": "Hospital da Cruz Vermelha do Paraná",
    "count": 28,
    "uf": "PR",
    "key": "UEPASANTAREM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SES - PB",
    "nome": "Casa de Saúde Nossa Senhora do Carmo",
    "count": 27,
    "uf": "PB",
    "key": "SES - PB",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Universidade Federal de Pernambuco - Hospital das Clínicas da UFPE",
    "nome": "Universidade Federal de Pernambuco - Hospital das Clínicas da UFPE",
    "count": 26,
    "uf": "PE",
    "key": "Universidade Federal de Pernambuco - Hospital das Clínicas da UFPE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HA-SP",
    "nome": "FAMERP",
    "count": 25,
    "uf": "SP",
    "key": "HA-SP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ISA",
    "nome": "ISA",
    "count": 25,
    "uf": "Nacional",
    "key": "ISA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Pró-Cardíaco",
    "nome": "Pró-Cardíaco - Hospital Pró-Cardíaco (RJ)",
    "count": 25,
    "uf": "PR",
    "key": "Pró-Cardíaco",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Genoveva Complexo Hospitalar",
    "nome": "Santa Genoveva Complexo Hospitalar",
    "count": 25,
    "uf": "Nacional",
    "key": "Santa Genoveva Complexo Hospitalar",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "OFTALMOCLINICA",
    "nome": "OFTALMOCLINICA",
    "count": 24,
    "uf": "Nacional",
    "key": "OFTALMOCLINICA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS Olímpia",
    "nome": "SMS Olímpia - Secretaria Municipal de Saúde de Olímpia (SP)",
    "count": 24,
    "uf": "SP",
    "key": "SMS Olímpia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Strix",
    "nome": "SUS",
    "count": 24,
    "uf": "Nacional",
    "key": "Strix",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Udi",
    "nome": "Udi",
    "count": 24,
    "uf": "Nacional",
    "key": "Udi",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital do Açúcar - Alagoas",
    "nome": "Hospital do Açúcar - Alagoas",
    "count": 23,
    "uf": "AL",
    "key": "Hospital do Açúcar - Alagoas",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Instituto Suel Abujamra - São Paulo",
    "nome": "Instituto Suel Abujamra - São Paulo",
    "count": 23,
    "uf": "SP",
    "key": "Instituto Suel Abujamra - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Estadual de Saúde - SES - Rio de Janeiro",
    "nome": "Secretaria Estadual de Saúde - SES - Rio de Janeiro",
    "count": 22,
    "uf": "RJ",
    "key": "Secretaria Estadual de Saúde - SES - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Pró-Cardíaco",
    "nome": "Hospital Pró-Cardíaco",
    "count": 21,
    "uf": "PR",
    "key": "Hospital Pró-Cardíaco",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMRJ",
    "nome": "SCMRJ",
    "count": 20,
    "uf": "Nacional",
    "key": "SCMRJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Uema",
    "nome": "Uema",
    "count": 20,
    "uf": "PR",
    "key": "Uema",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "AMS-APUCARANA",
    "nome": "AMS-APUCARANA",
    "count": 19,
    "uf": "Nacional",
    "key": "AMS-APUCARANA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CSPSL",
    "nome": "CSPSL",
    "count": 19,
    "uf": "Nacional",
    "key": "CSPSL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SISE",
    "nome": "FAMERP",
    "count": 19,
    "uf": "SP",
    "key": "SISE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sistema Único de Saúde - Bahia",
    "nome": "Sistema Único de Saúde - Bahia",
    "count": 19,
    "uf": "BA",
    "key": "Sistema Único de Saúde - Bahia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HNSC",
    "nome": "HNSC",
    "count": 18,
    "uf": "Nacional",
    "key": "HNSC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSPM",
    "nome": "HSPM",
    "count": 18,
    "uf": "Nacional",
    "key": "HSPM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Pmg-guaruja",
    "nome": "Pmg-guaruja",
    "count": 18,
    "uf": "Nacional",
    "key": "Pmg-guaruja",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "EMCM",
    "nome": "EMCM",
    "count": 17,
    "uf": "Nacional",
    "key": "EMCM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HAS-RJ",
    "nome": "HAS-RJ",
    "count": 17,
    "uf": "RJ",
    "key": "HAS-RJ",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Sinop",
    "nome": "Secretaria Municipal de Saúde de Sinop",
    "count": 17,
    "uf": "Nacional",
    "key": "Secretaria Municipal de Saúde de Sinop",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Clínicas da Universidade Federal do Paraná",
    "nome": "Hospital de Clínicas da Universidade Federal do Paraná",
    "count": 16,
    "uf": "PR",
    "key": "Hospital de Clínicas da Universidade Federal do Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCO - Santa Casa de Ouro Preto",
    "nome": "Associação da Santa Casa de Misericórdia de Ourinhos",
    "count": 16,
    "uf": "Nacional",
    "key": "SCO - Santa Casa de Ouro Preto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMMA - Santa Casa de Misericórdia de Marília",
    "nome": "SCMMA - Santa Casa de Misericórdia de Marília",
    "count": 15,
    "uf": "SP",
    "key": "SCMMA - Santa Casa de Misericórdia de Marília",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FMC",
    "nome": "FAMERP",
    "count": 14,
    "uf": "SP",
    "key": "FMC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Inep-Revalida",
    "nome": "Inep-Revalida",
    "count": 14,
    "uf": "Nacional",
    "key": "Inep-Revalida",
    "modalidades": [
      "Revalida"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Florianópolis",
    "nome": "Secretaria Municipal de Saúde de Florianópolis",
    "count": 14,
    "uf": "SC",
    "key": "Secretaria Municipal de Saúde de Florianópolis",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal do Piauí - UFPI",
    "nome": "Universidade Federal do Piauí - UFPI",
    "count": 14,
    "uf": "PI",
    "key": "Universidade Federal do Piauí - UFPI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FUVEST",
    "nome": "HRAC-USP",
    "count": 13,
    "uf": "SP",
    "key": "FUVEST",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HEPV",
    "nome": "HEPV",
    "count": 13,
    "uf": "Nacional",
    "key": "HEPV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSD-MA - Hospital São Domingos",
    "nome": "Hospital São Domingos - Maranhão",
    "count": 13,
    "uf": "MA",
    "key": "HSD-MA - Hospital São Domingos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Lúcio Rebelo",
    "nome": "Hospital Lúcio Rebelo",
    "count": 13,
    "uf": "Nacional",
    "key": "Hospital Lúcio Rebelo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sms-patos",
    "nome": "Sms-patos",
    "count": 13,
    "uf": "Nacional",
    "key": "Sms-patos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMV - Santa Casa de Misericórdia de Votuporanga",
    "nome": "SCMV - Santa Casa de Misericórdia de Votuporanga",
    "count": 12,
    "uf": "Nacional",
    "key": "SCMV - Santa Casa de Misericórdia de Votuporanga",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFJF",
    "nome": "UFJF",
    "count": 12,
    "uf": "MG",
    "key": "UFJF",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação João Goulart - Hospitais Municipais - FJG - Rio de Janeiro",
    "nome": "Fundação João Goulart - Hospitais Municipais - FJG - Rio de Janeiro",
    "count": 11,
    "uf": "RJ",
    "key": "Fundação João Goulart - Hospitais Municipais - FJG - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSI-SE",
    "nome": "FAMERP",
    "count": 11,
    "uf": "SE",
    "key": "HSI-SE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto de Cardiologia do Rio Grande do Sul",
    "nome": "Instituto de Cardiologia do Rio Grande do Sul",
    "count": 11,
    "uf": "RS",
    "key": "Instituto de Cardiologia do Rio Grande do Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto de Psiquiatria da Universidade Federal do Rio de Janeiro",
    "nome": "Instituto de Psiquiatria da Universidade Federal do Rio de Janeiro",
    "count": 11,
    "uf": "RJ",
    "key": "Instituto de Psiquiatria da Universidade Federal do Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMSJC",
    "nome": "Centro Médico de Campinas",
    "count": 11,
    "uf": "PR",
    "key": "SCMSJC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UEPA Revalida",
    "nome": "UEPA Revalida",
    "count": 11,
    "uf": "PA",
    "key": "UEPA Revalida",
    "modalidades": [
      "Revalida"
    ]
  },
  {
    "sigla": "UNIOESTE",
    "nome": "Autarquia Municipal de Saúde de Apucarana",
    "count": 11,
    "uf": "PR",
    "key": "UNIOESTE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Casa de Caridade de Alfaces NSP Socorro",
    "nome": "Casa de Caridade de Alfaces NSP Socorro",
    "count": 10,
    "uf": "Nacional",
    "key": "Casa de Caridade de Alfaces NSP Socorro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Votuporanga",
    "nome": "Santa Casa de Misericórdia de Votuporanga",
    "count": 10,
    "uf": "Nacional",
    "key": "Santa Casa de Misericórdia de Votuporanga",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade do Estado do Pará - UEPA",
    "nome": "Universidade do Estado do Pará - UEPA",
    "count": 10,
    "uf": "PA",
    "key": "Universidade do Estado do Pará - UEPA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "AGRM",
    "nome": "PSU",
    "count": 9,
    "uf": "Nacional",
    "key": "AGRM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCB",
    "nome": "FAMERP",
    "count": 9,
    "uf": "SP",
    "key": "HCB",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSA - GUARUJÁ - Hospital Santo Amaro de Guarujá",
    "nome": "Associação Médica do Paraná",
    "count": 9,
    "uf": "SP",
    "key": "HSA - GUARUJÁ - Hospital Santo Amaro de Guarujá",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Evangélico de Cachoeiro de Itapemirim",
    "nome": "Hospital Evangélico de Cachoeiro de Itapemirim",
    "count": 9,
    "uf": "Nacional",
    "key": "Hospital Evangélico de Cachoeiro de Itapemirim",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Nacional de Traumatologia e Ortopedia",
    "nome": "Instituto Nacional de Traumatologia e Ortopedia",
    "count": 9,
    "uf": "Nacional",
    "key": "Instituto Nacional de Traumatologia e Ortopedia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIMED-RJ",
    "nome": "FAMERP",
    "count": 9,
    "uf": "RJ",
    "key": "UNIMED-RJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Sergipe - UFS",
    "nome": "Universidade Federal de Sergipe - UFS",
    "count": 9,
    "uf": "SE",
    "key": "Universidade Federal de Sergipe - UFS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FEAS",
    "nome": "SMS",
    "count": 8,
    "uf": "Nacional",
    "key": "FEAS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Casa de Portugal",
    "nome": "Hospital Casa de Portugal",
    "count": 8,
    "uf": "Nacional",
    "key": "Hospital Casa de Portugal",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São Julião - Ministério da Saúde",
    "nome": "Hospital São Julião - Ministério da Saúde",
    "count": 8,
    "uf": "Nacional",
    "key": "Hospital São Julião - Ministério da Saúde",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira",
    "nome": "Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira",
    "count": 8,
    "uf": "Nacional",
    "key": "Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira",
    "modalidades": [
      "Acesso Direto",
      "Revalida"
    ]
  },
  {
    "sigla": "Puc-sp",
    "nome": "Puc-sp",
    "count": 8,
    "uf": "SP",
    "key": "Puc-sp",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SGCH - Santa Genoveva Complexo Hospitalar",
    "nome": "Hospital das Clínicas Luzia de Pinho Melo",
    "count": 8,
    "uf": "Nacional",
    "key": "SGCH - Santa Genoveva Complexo Hospitalar",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-SINOP - Secretaria Municipal de Saúde de Sinop",
    "nome": "Secretaria Municipal de Saúde de Sinop",
    "count": 8,
    "uf": "Nacional",
    "key": "SMS-SINOP - Secretaria Municipal de Saúde de Sinop",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria de Estado de Saúde de Goiás",
    "nome": "Secretaria de Estado de Saúde de Goiás",
    "count": 8,
    "uf": "GO",
    "key": "Secretaria de Estado de Saúde de Goiás",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCB RO",
    "nome": "HCB RO",
    "count": 7,
    "uf": "RO",
    "key": "HCB RO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Câncer de Barretos - HCB - Rondônia",
    "nome": "Hospital de Câncer de Barretos - HCB - Rondônia",
    "count": 7,
    "uf": "RO",
    "key": "Hospital de Câncer de Barretos - HCB - Rondônia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCM-CG",
    "nome": "Santa Casa de Misericórdia de Campo Grande",
    "count": 7,
    "uf": "PR",
    "key": "SCM-CG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sco",
    "nome": "Sco",
    "count": 7,
    "uf": "Nacional",
    "key": "Sco",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Goiânia",
    "nome": "Secretaria Municipal de Saúde de Goiânia",
    "count": 7,
    "uf": "GO",
    "key": "Secretaria Municipal de Saúde de Goiânia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de João Pessoa",
    "nome": "Secretaria Municipal de Saúde de João Pessoa",
    "count": 7,
    "uf": "PB",
    "key": "Secretaria Municipal de Saúde de João Pessoa",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Uepa-Revalida",
    "nome": "Uepa-Revalida",
    "count": 7,
    "uf": "Nacional",
    "key": "Uepa-Revalida",
    "modalidades": [
      "Revalida"
    ]
  },
  {
    "sigla": "Universidade Estadual do Espírito Santo",
    "nome": "Universidade Estadual do Espírito Santo",
    "count": 7,
    "uf": "ES",
    "key": "Universidade Estadual do Espírito Santo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade do Grande Rio",
    "nome": "Universidade do Grande Rio",
    "count": 7,
    "uf": "Nacional",
    "key": "Universidade do Grande Rio",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Casa de Caridade de Alfenas NSP Socorro",
    "nome": "Casa de Caridade de Alfenas NSP Socorro",
    "count": 6,
    "uf": "Nacional",
    "key": "Casa de Caridade de Alfenas NSP Socorro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Iff",
    "nome": "Iff",
    "count": 6,
    "uf": "Nacional",
    "key": "Iff",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Psu-go",
    "nome": "Psu-go",
    "count": 6,
    "uf": "GO",
    "key": "Psu-go",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Maceió",
    "nome": "Santa Casa de Misericórdia de Maceió",
    "count": 6,
    "uf": "AL",
    "key": "Santa Casa de Misericórdia de Maceió",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal da Saúde de Curitiba",
    "nome": "Secretaria Municipal da Saúde de Curitiba",
    "count": 6,
    "uf": "PR",
    "key": "Secretaria Municipal da Saúde de Curitiba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Administração de Macaé",
    "nome": "Secretaria Municipal de Administração de Macaé",
    "count": 6,
    "uf": "Nacional",
    "key": "Secretaria Municipal de Administração de Macaé",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Administração de Volta Redonda",
    "nome": "Secretaria Municipal de Administração de Volta Redonda",
    "count": 6,
    "uf": "Nacional",
    "key": "Secretaria Municipal de Administração de Volta Redonda",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sistema Integrado de Saúde - Sistema Único de Saúde",
    "nome": "Sistema Integrado de Saúde - Sistema Único de Saúde",
    "count": 6,
    "uf": "Nacional",
    "key": "Sistema Integrado de Saúde - Sistema Único de Saúde",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Tego",
    "nome": "Tego",
    "count": 6,
    "uf": "Nacional",
    "key": "Tego",
    "modalidades": [
      "Título de Especialista"
    ]
  },
  {
    "sigla": "Universidade Federal de Mato Grosso",
    "nome": "Universidade Federal de Mato Grosso",
    "count": 6,
    "uf": "MT",
    "key": "Universidade Federal de Mato Grosso",
    "modalidades": [
      "Acesso Direto",
      "Revalida"
    ]
  },
  {
    "sigla": "Casa de Saúde Nossa Senhora do Carmo",
    "nome": "Casa de Saúde Nossa Senhora do Carmo",
    "count": 5,
    "uf": "Nacional",
    "key": "Casa de Saúde Nossa Senhora do Carmo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Exame Nacional de Residência",
    "nome": "Exame Nacional de Residência",
    "count": 5,
    "uf": "Nacional",
    "key": "Exame Nacional de Residência",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "FELUMA",
    "nome": "FELUMA",
    "count": 5,
    "uf": "Nacional",
    "key": "FELUMA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hcpa",
    "nome": "Hcpa",
    "count": 5,
    "uf": "RS",
    "key": "Hcpa",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Tarquínio Lopes Filho",
    "nome": "Hospital Tarquínio Lopes Filho",
    "count": 5,
    "uf": "Nacional",
    "key": "Hospital Tarquínio Lopes Filho",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Presidente Dutra - UFMA - Maranhão",
    "nome": "Hospital Universitário Presidente Dutra - UFMA - Maranhão",
    "count": 5,
    "uf": "MA",
    "key": "Hospital Universitário Presidente Dutra - UFMA - Maranhão",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas Luzia de Pinho Melo",
    "nome": "Hospital das Clínicas Luzia de Pinho Melo",
    "count": 5,
    "uf": "Nacional",
    "key": "Hospital das Clínicas Luzia de Pinho Melo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-PIRACICABA",
    "nome": "SMS-PIRACICABA",
    "count": 5,
    "uf": "Nacional",
    "key": "SMS-PIRACICABA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Araçatuba",
    "nome": "Santa Casa de Misericórdia de Araçatuba",
    "count": 5,
    "uf": "Nacional",
    "key": "Santa Casa de Misericórdia de Araçatuba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Uepa",
    "nome": "Uepa",
    "count": 5,
    "uf": "PA",
    "key": "Uepa",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ufpb",
    "nome": "Ufpb",
    "count": 5,
    "uf": "PB",
    "key": "Ufpb",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "AEBES",
    "nome": "AEBES",
    "count": 4,
    "uf": "Nacional",
    "key": "AEBES",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Associação Piauiense de Combate ao Câncer - APCC - Piauí",
    "nome": "Associação Piauiense de Combate ao Câncer - APCC - Piauí",
    "count": 4,
    "uf": "PI",
    "key": "Associação Piauiense de Combate ao Câncer - APCC - Piauí",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Casa de Caridade de Alfenás NSP Socorro",
    "nome": "Casa de Caridade de Alfenás NSP Socorro",
    "count": 4,
    "uf": "Nacional",
    "key": "Casa de Caridade de Alfenás NSP Socorro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação de Saúde Pública de Novo Hamburgo",
    "nome": "Fundação de Saúde Pública de Novo Hamburgo",
    "count": 4,
    "uf": "Nacional",
    "key": "Fundação de Saúde Pública de Novo Hamburgo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HDG - Hospital Dilson Godinho",
    "nome": "Hospital Dilson Godinho",
    "count": 4,
    "uf": "Nacional",
    "key": "HDG - Hospital Dilson Godinho",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSP-SP",
    "nome": "HSP-SP",
    "count": 4,
    "uf": "SP",
    "key": "HSP-SP",
    "modalidades": [
      "Acesso Direto",
      "R+"
    ]
  },
  {
    "sigla": "Hospital Estadual Dr. Jayme dos Santos Neves - HEJSN - Espírito Santo",
    "nome": "Hospital Estadual Dr. Jayme dos Santos Neves - HEJSN - Espírito Santo",
    "count": 4,
    "uf": "ES",
    "key": "Hospital Estadual Dr. Jayme dos Santos Neves - HEJSN - Espírito Santo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Santa Catarina (SP)",
    "nome": "Hospital Santa Catarina (SP)",
    "count": 4,
    "uf": "SP",
    "key": "Hospital Santa Catarina (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São Lucas Copacabana",
    "nome": "Hospital São Lucas Copacabana",
    "count": 4,
    "uf": "Nacional",
    "key": "Hospital São Lucas Copacabana",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Cassiano Antônio de Moraes - UFES - Espírito Santo",
    "nome": "Hospital Universitário Cassiano Antônio de Moraes - UFES - Espírito Santo",
    "count": 4,
    "uf": "ES",
    "key": "Hospital Universitário Cassiano Antônio de Moraes - UFES - Espírito Santo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Júlio Müller - UFMT - Mato Grosso",
    "nome": "Hospital Universitário Júlio Müller - UFMT - Mato Grosso",
    "count": 4,
    "uf": "MT",
    "key": "Hospital Universitário Júlio Müller - UFMT - Mato Grosso",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital adventista Silvestre",
    "nome": "Hospital adventista Silvestre",
    "count": 4,
    "uf": "Nacional",
    "key": "Hospital adventista Silvestre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IAUPE",
    "nome": "SES-2",
    "count": 4,
    "uf": "PE",
    "key": "IAUPE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "MULTIVIX - Centro Universitário Multivix",
    "nome": "Faculdade Brasileira - MULTIVIX Vitória",
    "count": 4,
    "uf": "ES",
    "key": "MULTIVIX - Centro Universitário Multivix",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PRONTOBABY",
    "nome": "PRONTOBABY",
    "count": 4,
    "uf": "Nacional",
    "key": "PRONTOBABY",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-FLORIPA",
    "nome": "Secretaria Municipal de Saúde de Florianópolis",
    "count": 4,
    "uf": "SC",
    "key": "SMS-FLORIPA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-SG",
    "nome": "Secretaria Municipal de Saúde de Campo Grande",
    "count": 4,
    "uf": "PR",
    "key": "SMS-SG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Estadual de Saúde - SES - Distrito Federal",
    "nome": "Secretaria Estadual de Saúde - SES - Distrito Federal",
    "count": 4,
    "uf": "DF",
    "key": "Secretaria Estadual de Saúde - SES - Distrito Federal",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Estadual de Saúde do Estado de Pernambuco - SES_",
    "nome": "Secretaria Estadual de Saúde do Estado de Pernambuco - SES_",
    "count": 4,
    "uf": "PE",
    "key": "Secretaria Estadual de Saúde do Estado de Pernambuco - SES_",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria de Estado da Saúde da Paraíba",
    "nome": "Secretaria de Estado da Saúde da Paraíba",
    "count": 4,
    "uf": "PB",
    "key": "Secretaria de Estado da Saúde da Paraíba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sms-rj",
    "nome": "Sms-rj",
    "count": 4,
    "uf": "RJ",
    "key": "Sms-rj",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sms-santos",
    "nome": "Sms-santos",
    "count": 4,
    "uf": "Nacional",
    "key": "Sms-santos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFRR",
    "nome": "UFRR",
    "count": 4,
    "uf": "RR",
    "key": "UFRR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFSCAR",
    "nome": "UFSCAR",
    "count": 4,
    "uf": "SC",
    "key": "UFSCAR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIUBE",
    "nome": "UNIUBE",
    "count": 4,
    "uf": "Nacional",
    "key": "UNIUBE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ufma",
    "nome": "Ufma",
    "count": 4,
    "uf": "MA",
    "key": "Ufma",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Vunesp",
    "nome": "Faculdade de Medicina de São João del-Rei",
    "count": 4,
    "uf": "SP",
    "key": "Vunesp",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ACCESS",
    "nome": "IPSEMG",
    "count": 3,
    "uf": "MG",
    "key": "ACCESS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Afamci",
    "nome": "Afamci",
    "count": 3,
    "uf": "Nacional",
    "key": "Afamci",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Oftalmológico de Cáceres",
    "nome": "Centro Oftalmológico de Cáceres",
    "count": 3,
    "uf": "Nacional",
    "key": "Centro Oftalmológico de Cáceres",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Comissão Estadual de Residência Médica do Amazonas",
    "nome": "Comissão Estadual de Residência Médica do Amazonas",
    "count": 3,
    "uf": "AM",
    "key": "Comissão Estadual de Residência Médica do Amazonas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ESPCE - Escola de Saúde Pública do Ceará",
    "nome": "ESPCE - Escola de Saúde Pública do Ceará",
    "count": 3,
    "uf": "CE",
    "key": "ESPCE - Escola de Saúde Pública do Ceará",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade de Medicina de Petrópolis - FMP - Rio de Janeiro",
    "nome": "Faculdade de Medicina de Petrópolis - FMP - Rio de Janeiro",
    "count": 3,
    "uf": "RJ",
    "key": "Faculdade de Medicina de Petrópolis - FMP - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Feso",
    "nome": "Feso",
    "count": 3,
    "uf": "Nacional",
    "key": "Feso",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Escola Superior de Otorrinolaringologia",
    "nome": "Fundação Escola Superior de Otorrinolaringologia",
    "count": 3,
    "uf": "PE",
    "key": "Fundação Escola Superior de Otorrinolaringologia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Estatal de Saúde da Família - FESF - SUS - Bahia",
    "nome": "Fundação Estatal de Saúde da Família - FESF - SUS - Bahia",
    "count": 3,
    "uf": "BA",
    "key": "Fundação Estatal de Saúde da Família - FESF - SUS - Bahia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação João Goulart - Hospitais Municipais",
    "nome": "Fundação João Goulart - Hospitais Municipais",
    "count": 3,
    "uf": "Nacional",
    "key": "Fundação João Goulart - Hospitais Municipais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Universitária de Ciências da Saúde de Alagoas - UNCISAL",
    "nome": "Fundação Universitária de Ciências da Saúde de Alagoas - UNCISAL",
    "count": 3,
    "uf": "AL",
    "key": "Fundação Universitária de Ciências da Saúde de Alagoas - UNCISAL",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HCP - 2021 - R1",
    "nome": "Hospital Casa de Portugal (RJ)",
    "count": 3,
    "uf": "RJ",
    "key": "HCP - 2021 - R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMD-RS",
    "nome": "HMD-RS",
    "count": 3,
    "uf": "RS",
    "key": "HMD-RS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSJ-MS",
    "nome": "HSJ-MS",
    "count": 3,
    "uf": "MS",
    "key": "HSJ-MS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Estadual Dr Jayme dos Santos Neves",
    "nome": "Hospital Estadual Dr Jayme dos Santos Neves",
    "count": 3,
    "uf": "Nacional",
    "key": "Hospital Estadual Dr Jayme dos Santos Neves",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Estadual Dr. Jayme dos Santos Neves",
    "nome": "Hospital Estadual Dr. Jayme dos Santos Neves",
    "count": 3,
    "uf": "Nacional",
    "key": "Hospital Estadual Dr. Jayme dos Santos Neves",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Oftalmológico de Brasília",
    "nome": "Hospital Oftalmológico de Brasília",
    "count": 3,
    "uf": "DF",
    "key": "Hospital Oftalmológico de Brasília",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Pequeno Príncipe (PR)",
    "nome": "Hospital Pequeno Príncipe (PR)",
    "count": 3,
    "uf": "PR",
    "key": "Hospital Pequeno Príncipe (PR)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Professor Edmundo Vasconcelos",
    "nome": "Hospital Professor Edmundo Vasconcelos",
    "count": 3,
    "uf": "Nacional",
    "key": "Hospital Professor Edmundo Vasconcelos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São Julião",
    "nome": "Hospital São Julião",
    "count": 3,
    "uf": "Nacional",
    "key": "Hospital São Julião",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Onofre Lopes - HUOL - UFRN - Rio Grande do Norte",
    "nome": "Hospital Universitário Onofre Lopes - HUOL - UFRN - Rio Grande do Norte",
    "count": 3,
    "uf": "RN",
    "key": "Hospital Universitário Onofre Lopes - HUOL - UFRN - Rio Grande do Norte",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas da UFU - Minas Gerais",
    "nome": "Hospital das Clínicas da UFU - Minas Gerais",
    "count": 3,
    "uf": "MG",
    "key": "Hospital das Clínicas da UFU - Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Câncer de Barretos - Ribeirão Preto",
    "nome": "Hospital de Câncer de Barretos - Ribeirão Preto",
    "count": 3,
    "uf": "SP",
    "key": "Hospital de Câncer de Barretos - Ribeirão Preto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Olhos de Aparecida",
    "nome": "Hospital de Olhos de Aparecida",
    "count": 3,
    "uf": "Nacional",
    "key": "Hospital de Olhos de Aparecida",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hsl-df",
    "nome": "Hsl-df",
    "count": 3,
    "uf": "DF",
    "key": "Hsl-df",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Igesp",
    "nome": "Igesp",
    "count": 3,
    "uf": "Nacional",
    "key": "Igesp",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto de Previdência dos Servidores do Estado de Minas Gerais - IPSEMG",
    "nome": "Instituto de Previdência dos Servidores do Estado de Minas Gerais - IPSEMG",
    "count": 3,
    "uf": "MG",
    "key": "Instituto de Previdência dos Servidores do Estado de Minas Gerais - IPSEMG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto e Hospital Oftalmológico de Anápolis",
    "nome": "Instituto e Hospital Oftalmológico de Anápolis",
    "count": 3,
    "uf": "GO",
    "key": "Instituto e Hospital Oftalmológico de Anápolis",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Irmandade da Santa Casa de Misericórdia de Santos",
    "nome": "Irmandade da Santa Casa de Misericórdia de Santos",
    "count": 3,
    "uf": "Nacional",
    "key": "Irmandade da Santa Casa de Misericórdia de Santos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Processo Seletivo Unificado - Alagoas",
    "nome": "Processo Seletivo Unificado - Alagoas",
    "count": 3,
    "uf": "AL",
    "key": "Processo Seletivo Unificado - Alagoas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-LRV",
    "nome": "SMS-LRV",
    "count": 3,
    "uf": "Nacional",
    "key": "SMS-LRV",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia da Campanha",
    "nome": "Santa Casa de Misericórdia da Campanha",
    "count": 3,
    "uf": "PR",
    "key": "Santa Casa de Misericórdia da Campanha",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Scmm",
    "nome": "Scmm",
    "count": 3,
    "uf": "Nacional",
    "key": "Scmm",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Estadual de Saúde - Distrito Federal",
    "nome": "Secretaria Estadual de Saúde - Distrito Federal",
    "count": 3,
    "uf": "DF",
    "key": "Secretaria Estadual de Saúde - Distrito Federal",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal da Saúde do Rio de Janeiro",
    "nome": "Secretaria Municipal da Saúde do Rio de Janeiro",
    "count": 3,
    "uf": "RJ",
    "key": "Secretaria Municipal da Saúde do Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UEPABELEM",
    "nome": "UEPABELEM",
    "count": 3,
    "uf": "PA",
    "key": "UEPABELEM",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIMED RJ",
    "nome": "FAMERP",
    "count": 3,
    "uf": "RJ",
    "key": "UNIMED RJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "USS - Universidade de Vassouras",
    "nome": "Hospital Universitário Sul Fluminense",
    "count": 3,
    "uf": "RJ",
    "key": "USS - Universidade de Vassouras",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Uern",
    "nome": "Uern",
    "count": 3,
    "uf": "Nacional",
    "key": "Uern",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Estadual do Pará - Santarém",
    "nome": "Universidade Estadual do Pará - Santarém",
    "count": 3,
    "uf": "PA",
    "key": "Universidade Estadual do Pará - Santarém",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Estadual do Piauí - UESPI",
    "nome": "Universidade Estadual do Piauí - UESPI",
    "count": 3,
    "uf": "PI",
    "key": "Universidade Estadual do Piauí - UESPI",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal da Paraíba",
    "nome": "Universidade Federal da Paraíba",
    "count": 3,
    "uf": "PB",
    "key": "Universidade Federal da Paraíba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade da Integração da Lusofonia Afro-Boaneense",
    "nome": "Universidade da Integração da Lusofonia Afro-Boaneense",
    "count": 3,
    "uf": "Nacional",
    "key": "Universidade da Integração da Lusofonia Afro-Boaneense",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade de Uberada - Uniube - Minas Gerais",
    "nome": "Universidade de Uberada - Uniube - Minas Gerais",
    "count": 3,
    "uf": "MG",
    "key": "Universidade de Uberada - Uniube - Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "AUSTA - AUSTA Hospital",
    "nome": "Universidade Federal do Estado do Rio de Janeiro",
    "count": 2,
    "uf": "RJ",
    "key": "AUSTA - AUSTA Hospital",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Autarquia Municipal de Saúde de Apucarana",
    "nome": "Autarquia Municipal de Saúde de Apucarana",
    "count": 2,
    "uf": "Nacional",
    "key": "Autarquia Municipal de Saúde de Apucarana",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Autarquia Municipal de Saúde de Apucarana - AMS - Paraná",
    "nome": "Autarquia Municipal de Saúde de Apucarana - AMS - Paraná",
    "count": 2,
    "uf": "PR",
    "key": "Autarquia Municipal de Saúde de Apucarana - AMS - Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário de Juiz de Fora",
    "nome": "Centro Universitário de Juiz de Fora",
    "count": 2,
    "uf": "MG",
    "key": "Centro Universitário de Juiz de Fora",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Clínica de Campo Grande - CCG - Mato Grosso do Sul",
    "nome": "Clínica de Campo Grande - CCG - Mato Grosso do Sul",
    "count": 2,
    "uf": "PR",
    "key": "Clínica de Campo Grande - CCG - Mato Grosso do Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade Brasileira - Multivix Vitória",
    "nome": "Faculdade Brasileira - Multivix Vitória",
    "count": 2,
    "uf": "ES",
    "key": "Faculdade Brasileira - Multivix Vitória",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fmp",
    "nome": "Fmp",
    "count": 2,
    "uf": "Nacional",
    "key": "Fmp",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Universidade Federal do Tocantins - UFT",
    "nome": "Fundação Universidade Federal do Tocantins - UFT",
    "count": 2,
    "uf": "TO",
    "key": "Fundação Universidade Federal do Tocantins - UFT",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Funda��o de Benefic�ncia Hospital de Cirurgia",
    "nome": "Funda��o de Benefic�ncia Hospital de Cirurgia",
    "count": 2,
    "uf": "Nacional",
    "key": "Funda��o de Benefic�ncia Hospital de Cirurgia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSJC- SC",
    "nome": "HSJC- SC",
    "count": 2,
    "uf": "SC",
    "key": "HSJC- SC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Adventista Silvestre",
    "nome": "Hospital Adventista Silvestre",
    "count": 2,
    "uf": "Nacional",
    "key": "Hospital Adventista Silvestre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Dilson Godinho",
    "nome": "Hospital Dilson Godinho",
    "count": 2,
    "uf": "Nacional",
    "key": "Hospital Dilson Godinho",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Pasteur",
    "nome": "Hospital Pasteur",
    "count": 2,
    "uf": "Nacional",
    "key": "Hospital Pasteur",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Santa Isabel - HSI - Sergipe",
    "nome": "Hospital Santa Isabel - HSI - Sergipe",
    "count": 2,
    "uf": "SE",
    "key": "Hospital Santa Isabel - HSI - Sergipe",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Santa Marta - Distrito Federal",
    "nome": "Hospital Santa Marta - Distrito Federal",
    "count": 2,
    "uf": "DF",
    "key": "Hospital Santa Marta - Distrito Federal",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São Lucas (Ribeirão Preto)",
    "nome": "Hospital São Lucas (Ribeirão Preto)",
    "count": 2,
    "uf": "SP",
    "key": "Hospital São Lucas (Ribeirão Preto)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Bettina Ferro de Souza-João Barros Barreto - HUBFS-HUJBB - Pará",
    "nome": "Hospital Universitário Bettina Ferro de Souza-João Barros Barreto - HUBFS-HUJBB - Pará",
    "count": 2,
    "uf": "DF",
    "key": "Hospital Universitário Bettina Ferro de Souza-João Barros Barreto - HUBFS-HUJBB - Pará",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário de Brasília - UNB - Distrito Federal",
    "nome": "Hospital Universitário de Brasília - UNB - Distrito Federal",
    "count": 2,
    "uf": "DF",
    "key": "Hospital Universitário de Brasília - UNB - Distrito Federal",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Olhos Aparecida",
    "nome": "Hospital de Olhos Aparecida",
    "count": 2,
    "uf": "Nacional",
    "key": "Hospital de Olhos Aparecida",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Olhos Grottone - HOG - São Paulo",
    "nome": "Hospital de Olhos Grottone - HOG - São Paulo",
    "count": 2,
    "uf": "SP",
    "key": "Hospital de Olhos Grottone - HOG - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Huse",
    "nome": "Huse",
    "count": 2,
    "uf": "SE",
    "key": "Huse",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IADES",
    "nome": "SES",
    "count": 2,
    "uf": "Nacional",
    "key": "IADES",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Capixaba de Ensino, Pesquisa e Inovação em Saúde",
    "nome": "Instituto Capixaba de Ensino, Pesquisa e Inovação em Saúde",
    "count": 2,
    "uf": "Nacional",
    "key": "Instituto Capixaba de Ensino, Pesquisa e Inovação em Saúde",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Nacional de Estudos e Pesquisas Educacionais",
    "nome": "Instituto Nacional de Estudos e Pesquisas Educacionais",
    "count": 2,
    "uf": "Nacional",
    "key": "Instituto Nacional de Estudos e Pesquisas Educacionais",
    "modalidades": [
      "Revalida"
    ]
  },
  {
    "sigla": "Instituto Verbena",
    "nome": "SES",
    "count": 2,
    "uf": "Nacional",
    "key": "Instituto Verbena",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto de Cardiologia do Rio Grande do Sul - ICRS",
    "nome": "Instituto de Cardiologia do Rio Grande do Sul - ICRS",
    "count": 2,
    "uf": "RS",
    "key": "Instituto de Cardiologia do Rio Grande do Sul - ICRS",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Irmandade da Santa Casa de Misericórdia de São Carlos - ISCMSC - São Paulo",
    "nome": "Irmandade da Santa Casa de Misericórdia de São Carlos - ISCMSC - São Paulo",
    "count": 2,
    "uf": "SP",
    "key": "Irmandade da Santa Casa de Misericórdia de São Carlos - ISCMSC - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ma",
    "nome": "Ma",
    "count": 2,
    "uf": "MA",
    "key": "Ma",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "NucVest",
    "nome": "PUC",
    "count": 2,
    "uf": "Nacional",
    "key": "NucVest",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "POLICLIN",
    "nome": "FAMERP",
    "count": 2,
    "uf": "SP",
    "key": "POLICLIN",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Psu-al",
    "nome": "Psu-al",
    "count": 2,
    "uf": "AL",
    "key": "Psu-al",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SMS-SJP",
    "nome": "SMS-SJP",
    "count": 2,
    "uf": "Nacional",
    "key": "SMS-SJP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Araçatuba - SCMA - São Paulo",
    "nome": "Santa Casa de Misericórdia de Araçatuba - SCMA - São Paulo",
    "count": 2,
    "uf": "SP",
    "key": "Santa Casa de Misericórdia de Araçatuba - SCMA - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Cuiabá",
    "nome": "Santa Casa de Misericórdia de Cuiabá",
    "count": 2,
    "uf": "MT",
    "key": "Santa Casa de Misericórdia de Cuiabá",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de São José dos Campos",
    "nome": "Santa Casa de Misericórdia de São José dos Campos",
    "count": 2,
    "uf": "PR",
    "key": "Santa Casa de Misericórdia de São José dos Campos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Scm-bm",
    "nome": "Scm-bm",
    "count": 2,
    "uf": "Nacional",
    "key": "Scm-bm",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Scmrp",
    "nome": "Scmrp",
    "count": 2,
    "uf": "Nacional",
    "key": "Scmrp",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Lucas do Rio Verde",
    "nome": "Secretaria Municipal de Saúde de Lucas do Rio Verde",
    "count": 2,
    "uf": "Nacional",
    "key": "Secretaria Municipal de Saúde de Lucas do Rio Verde",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Piracicaba",
    "nome": "Secretaria Municipal de Saúde de Piracicaba",
    "count": 2,
    "uf": "Nacional",
    "key": "Secretaria Municipal de Saúde de Piracicaba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Piracicaba - SMS - Piracicaba",
    "nome": "Secretaria Municipal de Saúde de Piracicaba - SMS - Piracicaba",
    "count": 2,
    "uf": "Nacional",
    "key": "Secretaria Municipal de Saúde de Piracicaba - SMS - Piracicaba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria de Estado da Saúde do Maranhão",
    "nome": "Secretaria de Estado da Saúde do Maranhão",
    "count": 2,
    "uf": "MA",
    "key": "Secretaria de Estado da Saúde do Maranhão",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria de Saúde do Estado do Ceará",
    "nome": "Secretaria de Saúde do Estado do Ceará",
    "count": 2,
    "uf": "CE",
    "key": "Secretaria de Saúde do Estado do Ceará",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria do Estado da Saúde - SES - Maranhão",
    "nome": "Secretaria do Estado da Saúde - SES - Maranhão",
    "count": 2,
    "uf": "MA",
    "key": "Secretaria do Estado da Saúde - SES - Maranhão",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sistema Único de Saúde - SUS - Roraima",
    "nome": "Sistema Único de Saúde - SUS - Roraima",
    "count": 2,
    "uf": "RR",
    "key": "Sistema Único de Saúde - SUS - Roraima",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sms-cg",
    "nome": "Sms-cg",
    "count": 2,
    "uf": "Nacional",
    "key": "Sms-cg",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UCPEL - Universidade Católica de Pelotas",
    "nome": "Universidade Católica de Pelotas",
    "count": 2,
    "uf": "RS",
    "key": "UCPEL - Universidade Católica de Pelotas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIMONTES",
    "nome": "UNIMONTES",
    "count": 2,
    "uf": "MG",
    "key": "UNIMONTES",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ufal",
    "nome": "Ufal",
    "count": 2,
    "uf": "AL",
    "key": "Ufal",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ufpi",
    "nome": "Ufpi",
    "count": 2,
    "uf": "PI",
    "key": "Ufpi",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ufsc",
    "nome": "Ufsc",
    "count": 2,
    "uf": "SC",
    "key": "Ufsc",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Unievangélica de Anápolis - UEVA - Goiás",
    "nome": "Unievangélica de Anápolis - UEVA - Goiás",
    "count": 2,
    "uf": "GO",
    "key": "Unievangélica de Anápolis - UEVA - Goiás",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Unitau",
    "nome": "Unitau",
    "count": 2,
    "uf": "Nacional",
    "key": "Unitau",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal da Grande Dourados",
    "nome": "Universidade Federal da Grande Dourados",
    "count": 2,
    "uf": "MS",
    "key": "Universidade Federal da Grande Dourados",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de Campina Grande - UFCG - Paraíba",
    "nome": "Universidade Federal de Campina Grande - UFCG - Paraíba",
    "count": 2,
    "uf": "PR",
    "key": "Universidade Federal de Campina Grande - UFCG - Paraíba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal do Piauí",
    "nome": "Universidade Federal do Piauí",
    "count": 2,
    "uf": "PI",
    "key": "Universidade Federal do Piauí",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade de Rio Verde - UNIRV - Goiás",
    "nome": "Universidade de Rio Verde - UNIRV - Goiás",
    "count": 2,
    "uf": "GO",
    "key": "Universidade de Rio Verde - UNIRV - Goiás",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Associação Médica do Paraná - AMP - Paraná",
    "nome": "Associação Médica do Paraná - AMP - Paraná",
    "count": 1,
    "uf": "PR",
    "key": "Associação Médica do Paraná - AMP - Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Associação da Santa Casa de Misericórdia de Ourinhos",
    "nome": "Associação da Santa Casa de Misericórdia de Ourinhos",
    "count": 1,
    "uf": "Nacional",
    "key": "Associação da Santa Casa de Misericórdia de Ourinhos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Autarquia Municipal de Saúde do Município de Londrina",
    "nome": "Autarquia Municipal de Saúde do Município de Londrina",
    "count": 1,
    "uf": "PR",
    "key": "Autarquia Municipal de Saúde do Município de Londrina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "CEREM - Comissão Estadual de Residência Médica do Mato Grosso do Sul",
    "nome": "CEREM - Comissão Estadual de Residência Médica do Mato Grosso do Sul",
    "count": 1,
    "uf": "MT",
    "key": "CEREM - Comissão Estadual de Residência Médica do Mato Grosso do Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Casa de Caridade de Alfenas NSP Socorro - CCANSPS - Minas Gerais",
    "nome": "Casa de Caridade de Alfenas NSP Socorro - CCANSPS - Minas Gerais",
    "count": 1,
    "uf": "MG",
    "key": "Casa de Caridade de Alfenas NSP Socorro - CCANSPS - Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Casa de Caridade de Alfenes NSP Socorro",
    "nome": "Casa de Caridade de Alfenes NSP Socorro",
    "count": 1,
    "uf": "Nacional",
    "key": "Casa de Caridade de Alfenes NSP Socorro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário Cesumar",
    "nome": "Centro Universitário Cesumar",
    "count": 1,
    "uf": "Nacional",
    "key": "Centro Universitário Cesumar",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário UnirG",
    "nome": "Centro Universitário UnirG",
    "count": 1,
    "uf": "TO",
    "key": "Centro Universitário UnirG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Centro Universitário de Ariquemes - UNIRG",
    "nome": "Centro Universitário de Ariquemes - UNIRG",
    "count": 1,
    "uf": "PR",
    "key": "Centro Universitário de Ariquemes - UNIRG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Cvvfj",
    "nome": "Cvvfj",
    "count": 1,
    "uf": "Nacional",
    "key": "Cvvfj",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Faculdade Brasileira - MULTIVIX Vitória",
    "nome": "Faculdade Brasileira - MULTIVIX Vitória",
    "count": 1,
    "uf": "ES",
    "key": "Faculdade Brasileira - MULTIVIX Vitória",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundaçao Estatal Saúde da Família - Sistema Único de Saúde - Bahia",
    "nome": "Fundaçao Estatal Saúde da Família - Sistema Único de Saúde - Bahia",
    "count": 1,
    "uf": "BA",
    "key": "Fundaçao Estatal Saúde da Família - Sistema Único de Saúde - Bahia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Banco de Olhos de Goiás",
    "nome": "Fundação Banco de Olhos de Goiás",
    "count": 1,
    "uf": "GO",
    "key": "Fundação Banco de Olhos de Goiás",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Estatal Saúde da Família",
    "nome": "Fundação Estatal Saúde da Família",
    "count": 1,
    "uf": "Nacional",
    "key": "Fundação Estatal Saúde da Família",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação Universitária de Ciências da Saúde de Alagoas",
    "nome": "Fundação Universitária de Ciências da Saúde de Alagoas",
    "count": 1,
    "uf": "AL",
    "key": "Fundação Universitária de Ciências da Saúde de Alagoas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Fundação de Beneficência Hospital de Cirurgia - FBHC - Sergipe",
    "nome": "Fundação de Beneficência Hospital de Cirurgia - FBHC - Sergipe",
    "count": 1,
    "uf": "SE",
    "key": "Fundação de Beneficência Hospital de Cirurgia - FBHC - Sergipe",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HMMKB - Hospital e Maternidade Marieta Konder Born",
    "nome": "Hospital e Maternidade Marieta Konder Bornhausen",
    "count": 1,
    "uf": "Nacional",
    "key": "HMMKB - Hospital e Maternidade Marieta Konder Born",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HNJ",
    "nome": "HNJ",
    "count": 1,
    "uf": "Nacional",
    "key": "HNJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HPM-MG - 2021 - R1",
    "nome": "Hospital da Polícia Militar de Minas Gerais",
    "count": 1,
    "uf": "MG",
    "key": "HPM-MG - 2021 - R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSA-GUARUJA 2021 R1",
    "nome": "Hospital Santo Amaro - Guarujá",
    "count": 1,
    "uf": "SP",
    "key": "HSA-GUARUJA 2021 R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HSL - RJ - Hospital São Lucas - RJ",
    "nome": "HSL - RJ - Hospital São Lucas - RJ",
    "count": 1,
    "uf": "RJ",
    "key": "HSL - RJ - Hospital São Lucas - RJ",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "HUOL - 2021 - R1",
    "nome": "UFRN",
    "count": 1,
    "uf": "RN",
    "key": "HUOL - 2021 - R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hoa-ac",
    "nome": "Hoa-ac",
    "count": 1,
    "uf": "AC",
    "key": "Hoa-ac",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospitaal Adventista Silvestre",
    "nome": "Hospitaal Adventista Silvestre",
    "count": 1,
    "uf": "Nacional",
    "key": "Hospitaal Adventista Silvestre",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Dr Adolfo Bezerra de Menezes",
    "nome": "Hospital Dr Adolfo Bezerra de Menezes",
    "count": 1,
    "uf": "Nacional",
    "key": "Hospital Dr Adolfo Bezerra de Menezes",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Evangélico de Cachoeiro do Itapemerim - HECI - Espírito Santo",
    "nome": "Hospital Evangélico de Cachoeiro do Itapemerim - HECI - Espírito Santo",
    "count": 1,
    "uf": "ES",
    "key": "Hospital Evangélico de Cachoeiro do Itapemerim - HECI - Espírito Santo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Geral de Goiânia",
    "nome": "Hospital Geral de Goiânia",
    "count": 1,
    "uf": "GO",
    "key": "Hospital Geral de Goiânia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Infantil Sabará",
    "nome": "Hospital Infantil Sabará",
    "count": 1,
    "uf": "Nacional",
    "key": "Hospital Infantil Sabará",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Maternidade Therezinha de Jesus - Suprema - Minas Gerais",
    "nome": "Hospital Maternidade Therezinha de Jesus - Suprema - Minas Gerais",
    "count": 1,
    "uf": "MG",
    "key": "Hospital Maternidade Therezinha de Jesus - Suprema - Minas Gerais",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Memorial Arthur Ramos",
    "nome": "Hospital Memorial Arthur Ramos",
    "count": 1,
    "uf": "Nacional",
    "key": "Hospital Memorial Arthur Ramos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Memorial Arthur Ramos - Alagoas",
    "nome": "Hospital Memorial Arthur Ramos - Alagoas",
    "count": 1,
    "uf": "AL",
    "key": "Hospital Memorial Arthur Ramos - Alagoas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Nacional do Câncer - INCA - Rio de Janeiro",
    "nome": "Hospital Nacional do Câncer - INCA - Rio de Janeiro",
    "count": 1,
    "uf": "Nacional",
    "key": "Hospital Nacional do Câncer - INCA - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Naval Marcílio Dias - HNMD - Rio de Janeiro",
    "nome": "Hospital Naval Marcílio Dias - HNMD - Rio de Janeiro",
    "count": 1,
    "uf": "RJ",
    "key": "Hospital Naval Marcílio Dias - HNMD - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Oftalmológico de Brasília - HOB - Distrito Federal",
    "nome": "Hospital Oftalmológico de Brasília - HOB - Distrito Federal",
    "count": 1,
    "uf": "DF",
    "key": "Hospital Oftalmológico de Brasília - HOB - Distrito Federal",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Oftalmológico de Sorocaba",
    "nome": "Hospital Oftalmológico de Sorocaba",
    "count": 1,
    "uf": "SP",
    "key": "Hospital Oftalmológico de Sorocaba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Ortopédico de Goiânia",
    "nome": "Hospital Ortopédico de Goiânia",
    "count": 1,
    "uf": "GO",
    "key": "Hospital Ortopédico de Goiânia",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Ortopédico de Goiânia - HOG - Goiás",
    "nome": "Hospital Ortopédico de Goiânia - HOG - Goiás",
    "count": 1,
    "uf": "GO",
    "key": "Hospital Ortopédico de Goiânia - HOG - Goiás",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Pequeno Príncipe - HPP - Paraná",
    "nome": "Hospital Pequeno Príncipe - HPP - Paraná",
    "count": 1,
    "uf": "PR",
    "key": "Hospital Pequeno Príncipe - HPP - Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Professor Edmundo Vasconcelos - HPEV - São Paulo",
    "nome": "Hospital Professor Edmundo Vasconcelos - HPEV - São Paulo",
    "count": 1,
    "uf": "SP",
    "key": "Hospital Professor Edmundo Vasconcelos - HPEV - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Regional de Ponta Grossa Wallace Thadeu de Mello e Silva",
    "nome": "Hospital Regional de Ponta Grossa Wallace Thadeu de Mello e Silva",
    "count": 1,
    "uf": "PR",
    "key": "Hospital Regional de Ponta Grossa Wallace Thadeu de Mello e Silva",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Regional de Ponta Grossa Wallace Thadeu de Mello e Silva - HRPG - Paraná",
    "nome": "Hospital Regional de Ponta Grossa Wallace Thadeu de Mello e Silva - HRPG - Paraná",
    "count": 1,
    "uf": "PR",
    "key": "Hospital Regional de Ponta Grossa Wallace Thadeu de Mello e Silva - HRPG - Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Santo Amaro",
    "nome": "Hospital Santo Amaro",
    "count": 1,
    "uf": "SP",
    "key": "Hospital Santo Amaro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital São Domingos - Maranhão",
    "nome": "Hospital São Domingos - Maranhão",
    "count": 1,
    "uf": "MA",
    "key": "Hospital São Domingos - Maranhão",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Alberto Antunes - UFAL - Alagoas",
    "nome": "Hospital Universitário Alberto Antunes - UFAL - Alagoas",
    "count": 1,
    "uf": "AL",
    "key": "Hospital Universitário Alberto Antunes - UFAL - Alagoas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Antônio Pedro - UFF - Rio de Janeiro",
    "nome": "Hospital Universitário Antônio Pedro - UFF - Rio de Janeiro",
    "count": 1,
    "uf": "RJ",
    "key": "Hospital Universitário Antônio Pedro - UFF - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Bettina Ferro de Souza / Hospital João de Barros Barreto",
    "nome": "Hospital Universitário Bettina Ferro de Souza / Hospital João de Barros Barreto",
    "count": 1,
    "uf": "Nacional",
    "key": "Hospital Universitário Bettina Ferro de Souza / Hospital João de Barros Barreto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário Lauro Wanderley - UFPB - Paraíba",
    "nome": "Hospital Universitário Lauro Wanderley - UFPB - Paraíba",
    "count": 1,
    "uf": "PB",
    "key": "Hospital Universitário Lauro Wanderley - UFPB - Paraíba",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário da UFSC - Santa Catarina",
    "nome": "Hospital Universitário da UFSC - Santa Catarina",
    "count": 1,
    "uf": "SC",
    "key": "Hospital Universitário da UFSC - Santa Catarina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital Universitário de Taubaté - UNITAU - São Paulo",
    "nome": "Hospital Universitário de Taubaté - UNITAU - São Paulo",
    "count": 1,
    "uf": "SP",
    "key": "Hospital Universitário de Taubaté - UNITAU - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital da Polícia Militar de Minas Gerais - HPM MG",
    "nome": "Hospital da Polícia Militar de Minas Gerais - HPM MG",
    "count": 1,
    "uf": "MG",
    "key": "Hospital da Polícia Militar de Minas Gerais - HPM MG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas de Goiás - HCG",
    "nome": "Hospital das Clínicas de Goiás - HCG",
    "count": 1,
    "uf": "GO",
    "key": "Hospital das Clínicas de Goiás - HCG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas de Porto Alegre - HCPA - Rio Grande do Sul",
    "nome": "Hospital das Clínicas de Porto Alegre - HCPA - Rio Grande do Sul",
    "count": 1,
    "uf": "RS",
    "key": "Hospital das Clínicas de Porto Alegre - HCPA - Rio Grande do Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas de Teresópolis Constantino Ottaviano - FESO - Rio de Janeiro",
    "nome": "Hospital das Clínicas de Teresópolis Constantino Ottaviano - FESO - Rio de Janeiro",
    "count": 1,
    "uf": "RJ",
    "key": "Hospital das Clínicas de Teresópolis Constantino Ottaviano - FESO - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital das Clínicas do Paraná - UFPR",
    "nome": "Hospital das Clínicas do Paraná - UFPR",
    "count": 1,
    "uf": "PR",
    "key": "Hospital das Clínicas do Paraná - UFPR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Urgência de Sergipe",
    "nome": "Hospital de Urgência de Sergipe",
    "count": 1,
    "uf": "SE",
    "key": "Hospital de Urgência de Sergipe",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital de Urgência de Sergipe - HUSE",
    "nome": "Hospital de Urgência de Sergipe - HUSE",
    "count": 1,
    "uf": "SE",
    "key": "Hospital de Urgência de Sergipe - HUSE",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital do Câncer de Goiás",
    "nome": "Hospital do Câncer de Goiás",
    "count": 1,
    "uf": "GO",
    "key": "Hospital do Câncer de Goiás",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hospital e Maternidade Marieta Konder Bornhausen - HMMKB - Santa Catarina",
    "nome": "Hospital e Maternidade Marieta Konder Bornhausen - HMMKB - Santa Catarina",
    "count": 1,
    "uf": "SC",
    "key": "Hospital e Maternidade Marieta Konder Bornhausen - HMMKB - Santa Catarina",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hsa-guaruja",
    "nome": "Hsa-guaruja",
    "count": 1,
    "uf": "Nacional",
    "key": "Hsa-guaruja",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hsjc",
    "nome": "Hsjc",
    "count": 1,
    "uf": "Nacional",
    "key": "Hsjc",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Hsm-df",
    "nome": "Hsm-df",
    "count": 1,
    "uf": "DF",
    "key": "Hsm-df",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "IBR",
    "nome": "IBR",
    "count": 1,
    "uf": "Nacional",
    "key": "IBR",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "ISCMSP",
    "nome": "ISCMSP",
    "count": 1,
    "uf": "SP",
    "key": "ISCMSP",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ibap",
    "nome": "Ibap",
    "count": 1,
    "uf": "Nacional",
    "key": "Ibap",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ibest",
    "nome": "Hospital Santa Rita de Cássia",
    "count": 1,
    "uf": "Nacional",
    "key": "Ibest",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Idor",
    "nome": "Idor",
    "count": 1,
    "uf": "Nacional",
    "key": "Idor",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituição Oficial",
    "nome": "Instituição Oficial",
    "count": 1,
    "uf": "Nacional",
    "key": "Instituição Oficial",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Instituto Nacional de Traumatologia e Ortopedia - INTO - Rio de Janeiro",
    "nome": "Instituto Nacional de Traumatologia e Ortopedia - INTO - Rio de Janeiro",
    "count": 1,
    "uf": "Nacional",
    "key": "Instituto Nacional de Traumatologia e Ortopedia - INTO - Rio de Janeiro",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Into",
    "nome": "Into",
    "count": 1,
    "uf": "Nacional",
    "key": "Into",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Irmandade da Santa Casa de Misericórdia das Araras - ISCMA",
    "nome": "Irmandade da Santa Casa de Misericórdia das Araras - ISCMA",
    "count": 1,
    "uf": "Nacional",
    "key": "Irmandade da Santa Casa de Misericórdia das Araras - ISCMA",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PMF - Prefeitura Municipal de Franca",
    "nome": "FAMERP",
    "count": 1,
    "uf": "SP",
    "key": "PMF - Prefeitura Municipal de Franca",
    "modalidades": [
      "R+"
    ]
  },
  {
    "sigla": "PSU Alagoas",
    "nome": "PSU Alagoas",
    "count": 1,
    "uf": "AL",
    "key": "PSU Alagoas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "PUC - Sorocaba - São Paulo",
    "nome": "PUC - Sorocaba - São Paulo",
    "count": 1,
    "uf": "SP",
    "key": "PUC - Sorocaba - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Residência Médica do Estado do Amapá",
    "nome": "Residência Médica do Estado do Amapá",
    "count": 1,
    "uf": "AP",
    "key": "Residência Médica do Estado do Amapá",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SCMBH - 2021 - R1",
    "nome": "SCMBH",
    "count": 1,
    "uf": "Nacional",
    "key": "SCMBH - 2021 - R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SLMANDIC",
    "nome": "SLMANDIC",
    "count": 1,
    "uf": "Nacional",
    "key": "SLMANDIC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SPBC - Sociedade Portuguesa de Beneficência de Campos (RJ)",
    "nome": "SPBC - Sociedade Portuguesa de Beneficência de Campos (RJ)",
    "count": 1,
    "uf": "RJ",
    "key": "SPBC - Sociedade Portuguesa de Beneficência de Campos (RJ)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "SSPPG",
    "nome": "Secretaria de Segurança Pública - Praia Grande",
    "count": 1,
    "uf": "Nacional",
    "key": "SSPPG",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Limeira",
    "nome": "Santa Casa de Limeira",
    "count": 1,
    "uf": "Nacional",
    "key": "Santa Casa de Limeira",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Campo Grande",
    "nome": "Santa Casa de Misericórdia de Campo Grande",
    "count": 1,
    "uf": "PR",
    "key": "Santa Casa de Misericórdia de Campo Grande",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Campo Grande - SCMCG - Mato Grosso do Sul",
    "nome": "Santa Casa de Misericórdia de Campo Grande - SCMCG - Mato Grosso do Sul",
    "count": 1,
    "uf": "PR",
    "key": "Santa Casa de Misericórdia de Campo Grande - SCMCG - Mato Grosso do Sul",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Maceió - Alagoas",
    "nome": "Santa Casa de Misericórdia de Maceió - Alagoas",
    "count": 1,
    "uf": "AL",
    "key": "Santa Casa de Misericórdia de Maceió - Alagoas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Marília - SCMMA - São Paulo",
    "nome": "Santa Casa de Misericórdia de Marília - SCMMA - São Paulo",
    "count": 1,
    "uf": "SP",
    "key": "Santa Casa de Misericórdia de Marília - SCMMA - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Ribeirão Preto",
    "nome": "Santa Casa de Misericórdia de Ribeirão Preto",
    "count": 1,
    "uf": "SP",
    "key": "Santa Casa de Misericórdia de Ribeirão Preto",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Santa Casa de Misericórdia de Ribeirão Preto - SCMRR - São Paulo",
    "nome": "Santa Casa de Misericórdia de Ribeirão Preto - SCMRR - São Paulo",
    "count": 1,
    "uf": "SP",
    "key": "Santa Casa de Misericórdia de Ribeirão Preto - SCMRR - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Scm-go",
    "nome": "Scm-go",
    "count": 1,
    "uf": "GO",
    "key": "Scm-go",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Scma-sp",
    "nome": "Scma-sp",
    "count": 1,
    "uf": "SP",
    "key": "Scma-sp",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Scmsjc",
    "nome": "Scmsjc",
    "count": 1,
    "uf": "Nacional",
    "key": "Scmsjc",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de Sinop - SMS - Mato Grosso",
    "nome": "Secretaria Municipal de Saúde de Sinop - SMS - Mato Grosso",
    "count": 1,
    "uf": "MT",
    "key": "Secretaria Municipal de Saúde de Sinop - SMS - Mato Grosso",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria Municipal de Saúde de São José dos Pinhais - SMS - SJP - Paraná",
    "nome": "Secretaria Municipal de Saúde de São José dos Pinhais - SMS - SJP - Paraná",
    "count": 1,
    "uf": "PR",
    "key": "Secretaria Municipal de Saúde de São José dos Pinhais - SMS - SJP - Paraná",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Secretaria do Estado de Saúde de Goiás - SES",
    "nome": "Secretaria do Estado de Saúde de Goiás - SES",
    "count": 1,
    "uf": "GO",
    "key": "Secretaria do Estado de Saúde de Goiás - SES",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Sirio-libanes",
    "nome": "Sirio-libanes",
    "count": 1,
    "uf": "Nacional",
    "key": "Sirio-libanes",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UDI Hospital - Maranhão",
    "nome": "UDI Hospital - Maranhão",
    "count": 1,
    "uf": "MA",
    "key": "UDI Hospital - Maranhão",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UESPI - 2021 - R1",
    "nome": "Uespi",
    "count": 1,
    "uf": "Nacional",
    "key": "UESPI - 2021 - R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UFSM - Universidade Federal de Santa Maria",
    "nome": "Universidade Federal de Santa Maria",
    "count": 1,
    "uf": "RS",
    "key": "UFSM - Universidade Federal de Santa Maria",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNESC",
    "nome": "UNESC",
    "count": 1,
    "uf": "SC",
    "key": "UNESC",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIATENAS - Centro Universitário Atenas",
    "nome": "Fundação Escola de Saúde de Teresópolis",
    "count": 1,
    "uf": "Nacional",
    "key": "UNIATENAS - Centro Universitário Atenas",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIFAN",
    "nome": "UNIFAN",
    "count": 1,
    "uf": "Nacional",
    "key": "UNIFAN",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "UNIMED-RJ - 2021 - R1",
    "nome": "Unimed-rj",
    "count": 1,
    "uf": "RJ",
    "key": "UNIMED-RJ - 2021 - R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "USPRP2012R1",
    "nome": "USP-RP",
    "count": 1,
    "uf": "SP",
    "key": "USPRP2012R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "USPRP2013R1",
    "nome": "USP-RP",
    "count": 1,
    "uf": "SP",
    "key": "USPRP2013R1",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ufmt",
    "nome": "Ufmt",
    "count": 1,
    "uf": "MT",
    "key": "Ufmt",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ufrb",
    "nome": "Ufrb",
    "count": 1,
    "uf": "Nacional",
    "key": "Ufrb",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Ultra-X Medicina Diagnóstica (SP)",
    "nome": "Ultra-X Medicina Diagnóstica (SP)",
    "count": 1,
    "uf": "SP",
    "key": "Ultra-X Medicina Diagnóstica (SP)",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Unesc",
    "nome": "Unesc",
    "count": 1,
    "uf": "SC",
    "key": "Unesc",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Unievangelica",
    "nome": "Unievangelica",
    "count": 1,
    "uf": "Nacional",
    "key": "Unievangelica",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Unirv",
    "nome": "Unirv",
    "count": 1,
    "uf": "RO",
    "key": "Unirv",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Estadual do Pará",
    "nome": "Universidade Estadual do Pará",
    "count": 1,
    "uf": "PA",
    "key": "Universidade Estadual do Pará",
    "modalidades": [
      "R+"
    ]
  },
  {
    "sigla": "Universidade Estadual do Pará - UEPA - Santarém",
    "nome": "Universidade Estadual do Pará - UEPA - Santarém",
    "count": 1,
    "uf": "PA",
    "key": "Universidade Estadual do Pará - UEPA - Santarém",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal de São Carlos",
    "nome": "Universidade Federal de São Carlos",
    "count": 1,
    "uf": "Nacional",
    "key": "Universidade Federal de São Carlos",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade Federal do Estado do Rio de Janeiro - UNIRIO",
    "nome": "Universidade Federal do Estado do Rio de Janeiro - UNIRIO",
    "count": 1,
    "uf": "RJ",
    "key": "Universidade Federal do Estado do Rio de Janeiro - UNIRIO",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade de Desenvolvimento Institucional",
    "nome": "Universidade de Desenvolvimento Institucional",
    "count": 1,
    "uf": "Nacional",
    "key": "Universidade de Desenvolvimento Institucional",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Universidade de Ribeirão Preto - UNAERP - São Paulo",
    "nome": "Universidade de Ribeirão Preto - UNAERP - São Paulo",
    "count": 1,
    "uf": "SP",
    "key": "Universidade de Ribeirão Preto - UNAERP - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Visão Laser Hospital Oftalmológico",
    "nome": "Visão Laser Hospital Oftalmológico",
    "count": 1,
    "uf": "Nacional",
    "key": "Visão Laser Hospital Oftalmológico",
    "modalidades": [
      "Acesso Direto"
    ]
  },
  {
    "sigla": "Visão Laser Hospital Oftalmológico - HVL - São Paulo",
    "nome": "Visão Laser Hospital Oftalmológico - HVL - São Paulo",
    "count": 1,
    "uf": "SP",
    "key": "Visão Laser Hospital Oftalmológico - HVL - São Paulo",
    "modalidades": [
      "Acesso Direto"
    ]
  }
];
