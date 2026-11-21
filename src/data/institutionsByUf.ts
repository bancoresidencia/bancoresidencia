export interface InstitutionInfo {
  id: string;
  sigla: string;
  nome: string;
  uf: string;
  cidade: string;
  logoSlug?: string;
  questoesCount: number;
  provasCount: number;
  isNacional?: boolean;
}

export const NACIONAL_INSTITUTIONS: InstitutionInfo[] = [
  {
    id: 'enare',
    sigla: 'ENARE',
    nome: 'Exame Nacional de Residência / EBSERH',
    uf: 'BR',
    cidade: 'Nacional',
    logoSlug: 'enare',
    questoesCount: 700,
    provasCount: 7,
    isNacional: true
  },
  {
    id: 'revalida',
    sigla: 'INEP Revalida',
    nome: 'Exame Nacional de Revalidação de Diplomas Médicos',
    uf: 'BR',
    cidade: 'Nacional',
    logoSlug: 'inep-revalida',
    questoesCount: 2109,
    provasCount: 14,
    isNacional: true
  },
  {
    id: 'amb',
    sigla: 'AMB / Especialidades',
    nome: 'Associação Médica Brasileira & Sociedades de Especialidade',
    uf: 'BR',
    cidade: 'Nacional',
    logoSlug: 'tecm-sbcm',
    questoesCount: 1420,
    provasCount: 10,
    isNacional: true
  }
];

export const STATE_INSTITUTIONS: Record<string, InstitutionInfo[]> = {
  CE: [
    {
      id: 'surce',
      sigla: 'SURCE / PSU-CE',
      nome: 'Processo Seletivo Unificado do Ceará (UFC, UECE, ESP-CE)',
      uf: 'CE',
      cidade: 'Fortaleza',
      questoesCount: 1450,
      provasCount: 12
    },
    {
      id: 'ufc',
      sigla: 'UFC / MEAC-HUWC',
      nome: 'Universidade Federal do Ceará - Maternidade Escola & HUWC',
      uf: 'CE',
      cidade: 'Fortaleza',
      questoesCount: 820,
      provasCount: 8
    },
    {
      id: 'ijf',
      sigla: 'IJF Fortaleza',
      nome: 'Instituto Doutor José Frota - Trauma e Emergência',
      uf: 'CE',
      cidade: 'Fortaleza',
      questoesCount: 420,
      provasCount: 5
    }
  ],
  SP: [
    {
      id: 'usp-sp',
      sigla: 'USP-SP / HCFMUSP',
      nome: 'Hospital das Clínicas da Faculdade de Medicina da USP',
      uf: 'SP',
      cidade: 'São Paulo',
      logoSlug: 'hcfmusp',
      questoesCount: 1162,
      provasCount: 10
    },
    {
      id: 'unicamp',
      sigla: 'UNICAMP',
      nome: 'Hospital de Clínicas da Unicamp - Campinas',
      uf: 'SP',
      cidade: 'Campinas',
      logoSlug: 'hc-unicamp',
      questoesCount: 1980,
      provasCount: 16
    },
    {
      id: 'unifesp',
      sigla: 'UNIFESP / EPM',
      nome: 'Universidade Federal de São Paulo - Escola Paulista de Medicina',
      uf: 'SP',
      cidade: 'São Paulo',
      logoSlug: 'unifesp-epm',
      questoesCount: 1199,
      provasCount: 10
    },
    {
      id: 'sus-sp',
      sigla: 'SUS-SP',
      nome: 'Sistema Único de Saúde do Estado de São Paulo',
      uf: 'SP',
      cidade: 'São Paulo',
      logoSlug: 'sus-sp',
      questoesCount: 1200,
      provasCount: 10
    },
    {
      id: 'einstein',
      sigla: 'Einstein',
      nome: 'Hospital Israelita Albert Einstein',
      uf: 'SP',
      cidade: 'São Paulo',
      logoSlug: 'einstein-hiae',
      questoesCount: 900,
      provasCount: 8
    },
    {
      id: 'santa-casa-sp',
      sigla: 'Santa Casa SP',
      nome: 'Irmandade da Santa Casa de Misericórdia de São Paulo',
      uf: 'SP',
      cidade: 'São Paulo',
      logoSlug: 'santa-casa-sp',
      questoesCount: 1200,
      provasCount: 10
    },
    {
      id: 'iamspe',
      sigla: 'IAMSPE',
      nome: 'Hospital do Servidor Público Estadual de SP',
      uf: 'SP',
      cidade: 'São Paulo',
      logoSlug: 'hspe-fmo',
      questoesCount: 1102,
      provasCount: 9
    },
    {
      id: 'fmabc',
      sigla: 'FMABC',
      nome: 'Centro Universitário Faculdade de Medicina do ABC',
      uf: 'SP',
      cidade: 'Santo André',
      logoSlug: 'fmabc',
      questoesCount: 850,
      provasCount: 8
    }
  ],
  RJ: [
    {
      id: 'ufrj',
      sigla: 'UFRJ / HUCFF',
      nome: 'Hospital Universitário Clementino Fraga Filho',
      uf: 'RJ',
      cidade: 'Rio de Janeiro',
      questoesCount: 1296,
      provasCount: 11
    },
    {
      id: 'uerj',
      sigla: 'UERJ / HUPE',
      nome: 'Hospital Universitário Pedro Ernesto',
      uf: 'RJ',
      cidade: 'Rio de Janeiro',
      logoSlug: 'hupe',
      questoesCount: 1253,
      provasCount: 11
    },
    {
      id: 'ses-rj',
      sigla: 'SES-RJ',
      nome: 'Secretaria de Estado de Saúde do Rio de Janeiro',
      uf: 'RJ',
      cidade: 'Rio de Janeiro',
      logoSlug: 'ses-rj',
      questoesCount: 820,
      provasCount: 8
    },
    {
      id: 'unimed-rio',
      sigla: 'Unimed-Rio',
      nome: 'Hospital Unimed-Rio e Complexo Hospitalar',
      uf: 'RJ',
      cidade: 'Rio de Janeiro',
      logoSlug: 'unimed-rio',
      questoesCount: 420,
      provasCount: 5
    }
  ],
  MG: [
    {
      id: 'psu-mg',
      sigla: 'PSU-MG / AREMG',
      nome: 'Associação de Apoio à Residência Médica de Minas Gerais',
      uf: 'MG',
      cidade: 'Belo Horizonte',
      logoSlug: 'aremg',
      questoesCount: 1169,
      provasCount: 10
    },
    {
      id: 'santa-casa-bh',
      sigla: 'Santa Casa BH',
      nome: 'Santa Casa de Misericórdia de Belo Horizonte',
      uf: 'MG',
      cidade: 'Belo Horizonte',
      logoSlug: 'scbm',
      questoesCount: 804,
      provasCount: 8
    },
    {
      id: 'ipsemg',
      sigla: 'IPSEMG',
      nome: 'Instituto de Previdência dos Servidores de Minas Gerais',
      uf: 'MG',
      cidade: 'Belo Horizonte',
      logoSlug: 'ipsemg',
      questoesCount: 520,
      provasCount: 6
    }
  ],
  RS: [
    {
      id: 'amrigs',
      sigla: 'AMRIGS',
      nome: 'Associação Médica do Rio Grande do Sul',
      uf: 'RS',
      cidade: 'Porto Alegre',
      logoSlug: 'amrigs',
      questoesCount: 1200,
      provasCount: 10
    },
    {
      id: 'hcpa',
      sigla: 'HCPA / UFRGS',
      nome: 'Hospital de Clínicas de Porto Alegre',
      uf: 'RS',
      cidade: 'Porto Alegre',
      logoSlug: 'hcpa',
      questoesCount: 1196,
      provasCount: 10
    },
    {
      id: 'ufcspa',
      sigla: 'UFCSPA',
      nome: 'Universidade Federal de Ciências da Saúde de Porto Alegre',
      uf: 'RS',
      cidade: 'Porto Alegre',
      logoSlug: 'ufcspa',
      questoesCount: 450,
      provasCount: 5
    }
  ],
  PR: [
    {
      id: 'amp',
      sigla: 'AMP',
      nome: 'Associação Médica do Paraná',
      uf: 'PR',
      cidade: 'Curitiba',
      logoSlug: 'amp',
      questoesCount: 1150,
      provasCount: 10
    },
    {
      id: 'puc-pr',
      sigla: 'PUC-PR',
      nome: 'Pontifícia Universidade Católica do Paraná',
      uf: 'PR',
      cidade: 'Curitiba',
      logoSlug: 'pucpr',
      questoesCount: 1298,
      provasCount: 11
    },
    {
      id: 'uel',
      sigla: 'UEL',
      nome: 'Hospital Universitário de Londrina',
      uf: 'PR',
      cidade: 'Londrina',
      logoSlug: 'hu-uel',
      questoesCount: 1350,
      provasCount: 11
    }
  ],
  PE: [
    {
      id: 'ses-pe',
      sigla: 'SES-PE',
      nome: 'Secretaria de Estado de Saúde de Pernambuco',
      uf: 'PE',
      cidade: 'Recife',
      logoSlug: 'ses-pe',
      questoesCount: 1200,
      provasCount: 10
    },
    {
      id: 'ufpe',
      sigla: 'UFPE / HC',
      nome: 'Hospital das Clínicas da UFPE',
      uf: 'PE',
      cidade: 'Recife',
      questoesCount: 580,
      provasCount: 6
    }
  ],
  BA: [
    {
      id: 'sus-ba',
      sigla: 'SUS-BA',
      nome: 'Processo Seletivo Unificado do Estado da Bahia',
      uf: 'BA',
      cidade: 'Salvador',
      logoSlug: 'sus-ba',
      questoesCount: 825,
      provasCount: 8
    },
    {
      id: 'ufba',
      sigla: 'UFBA / HUPES',
      nome: 'Hospital Universitário Professor Edgard Santos',
      uf: 'BA',
      cidade: 'Salvador',
      questoesCount: 450,
      provasCount: 5
    }
  ],
  DF: [
    {
      id: 'ses-df',
      sigla: 'SES-DF',
      nome: 'Secretaria de Estado de Saúde do Distrito Federal',
      uf: 'DF',
      cidade: 'Brasília',
      logoSlug: 'ses-df',
      questoesCount: 1100,
      provasCount: 10
    },
    {
      id: 'habm',
      sigla: 'HABM',
      nome: 'Hospital das Forças Armadas / Hospital da Aeronáutica',
      uf: 'DF',
      cidade: 'Brasília',
      logoSlug: 'habm',
      questoesCount: 380,
      provasCount: 4
    }
  ],
  GO: [
    {
      id: 'ses-go',
      sigla: 'SES-GO',
      nome: 'Secretaria de Estado de Saúde de Goiás',
      uf: 'GO',
      cidade: 'Goiânia',
      logoSlug: 'ses-go',
      questoesCount: 850,
      provasCount: 8
    },
    {
      id: 'psu-go',
      sigla: 'PSU-GO',
      nome: 'Processo Seletivo Unificado de Goiás',
      uf: 'GO',
      cidade: 'Goiânia',
      logoSlug: 'psu-go',
      questoesCount: 620,
      provasCount: 6
    }
  ],
  SC: [
    {
      id: 'acm',
      sigla: 'ACM',
      nome: 'Associação Catarinense de Medicina',
      uf: 'SC',
      cidade: 'Florianópolis',
      questoesCount: 950,
      provasCount: 9
    },
    {
      id: 'ufsc',
      sigla: 'UFSC / HU',
      nome: 'Hospital Universitário Polydoro Ernani de São Thiago',
      uf: 'SC',
      cidade: 'Florianópolis',
      questoesCount: 782,
      provasCount: 7
    }
  ],
  PA: [
    {
      id: 'uepa',
      sigla: 'UEPA',
      nome: 'Universidade do Estado do Pará',
      uf: 'PA',
      cidade: 'Belém',
      logoSlug: 'uepa-belem',
      questoesCount: 580,
      provasCount: 6
    },
    {
      id: 'cesupa',
      sigla: 'CESUPA',
      nome: 'Centro Universitário do Estado do Pará',
      uf: 'PA',
      cidade: 'Belém',
      logoSlug: 'cesupa',
      questoesCount: 410,
      provasCount: 4
    }
  ],
  AM: [
    {
      id: 'cermam',
      sigla: 'CERMAM',
      nome: 'Comissão Estadual de Residência Médica do Amazonas',
      uf: 'AM',
      cidade: 'Manaus',
      logoSlug: 'cermam',
      questoesCount: 640,
      provasCount: 6
    }
  ],
  ES: [
    {
      id: 'emescam',
      sigla: 'EMESCAM',
      nome: 'Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória',
      uf: 'ES',
      cidade: 'Vitória',
      logoSlug: 'emescam',
      questoesCount: 510,
      provasCount: 5
    }
  ],
  PI: [
    {
      id: 'uespi',
      sigla: 'UESPI',
      nome: 'Universidade Estadual do Piauí',
      uf: 'PI',
      cidade: 'Teresina',
      logoSlug: 'uespi',
      questoesCount: 480,
      provasCount: 5
    }
  ],
  RN: [
    {
      id: 'ufrn',
      sigla: 'UFRN / HUOL',
      nome: 'Hospital Universitário Onofre Lopes',
      uf: 'RN',
      cidade: 'Natal',
      questoesCount: 620,
      provasCount: 6
    }
  ],
  PB: [
    {
      id: 'famene',
      sigla: 'FAMENE',
      nome: 'Faculdade de Medicina Nova Esperança',
      uf: 'PB',
      cidade: 'João Pessoa',
      logoSlug: 'famene',
      questoesCount: 420,
      provasCount: 4
    }
  ],
  MA: [
    {
      id: 'ufma',
      sigla: 'UFMA / HU',
      nome: 'Hospital Universitário da UFMA',
      uf: 'MA',
      cidade: 'São Luís',
      questoesCount: 510,
      provasCount: 5
    }
  ],
  AL: [
    {
      id: 'psu-al',
      sigla: 'PSU-AL',
      nome: 'Processo Seletivo Unificado de Alagoas',
      uf: 'AL',
      cidade: 'Maceió',
      logoSlug: 'psu-al',
      questoesCount: 410,
      provasCount: 4
    }
  ],
  SE: [
    {
      id: 'ufs',
      sigla: 'UFS / HU',
      nome: 'Hospital Universitário de Sergipe',
      uf: 'SE',
      cidade: 'Aracaju',
      questoesCount: 380,
      provasCount: 4
    }
  ],
  MT: [
    {
      id: 'prmmt',
      sigla: 'PRMMT',
      nome: 'Programa de Residência Médica do Mato Grosso',
      uf: 'MT',
      cidade: 'Cuiabá',
      logoSlug: 'prmmt',
      questoesCount: 490,
      provasCount: 5
    }
  ],
  MS: [
    {
      id: 'ufms',
      sigla: 'UFMS / HUMAP',
      nome: 'Hospital Universitário Maria Aparecida Pedrossian',
      uf: 'MS',
      cidade: 'Campo Grande',
      questoesCount: 530,
      provasCount: 5
    }
  ],
  RO: [
    {
      id: 'unir',
      sigla: 'UNIR',
      nome: 'Universidade Federal de Rondônia',
      uf: 'RO',
      cidade: 'Porto Velho',
      questoesCount: 320,
      provasCount: 3
    }
  ],
  AC: [
    {
      id: 'fundhacre',
      sigla: 'FUNDHACRE',
      nome: 'Fundação Hospital Estadual do Acre',
      uf: 'AC',
      cidade: 'Rio Branco',
      logoSlug: 'fundhacre',
      questoesCount: 290,
      provasCount: 3
    }
  ],
  TO: [
    {
      id: 'unirg',
      sigla: 'UNIRG',
      nome: 'Universidade de Gurupi - Residência Médica',
      uf: 'TO',
      cidade: 'Gurupi',
      logoSlug: 'unirg-gurupi',
      questoesCount: 280,
      provasCount: 3
    }
  ],
  AP: [
    {
      id: 'unifap',
      sigla: 'UNIFAP',
      nome: 'Universidade Federal do Amapá - HUA',
      uf: 'AP',
      cidade: 'Macapá',
      questoesCount: 240,
      provasCount: 3
    }
  ],
  RR: [
    {
      id: 'ufrr',
      sigla: 'UFRR / HGR',
      nome: 'Hospital Geral de Roraima',
      uf: 'RR',
      cidade: 'Boa Vista',
      questoesCount: 220,
      provasCount: 3
    }
  ]
};

export const UF_FULL_NAMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins'
};
