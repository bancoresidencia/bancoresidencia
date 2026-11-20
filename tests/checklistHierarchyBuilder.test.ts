import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildChecklistHierarchy,
  filterChecklistHierarchy
} from '../src/utils/checklistHierarchyBuilder';
import { EnrichedFocusWithIncidence } from '../src/services/examIncidenceService';
import { UserFocusProgress } from '../src/types/studySchedule';

const mockFoci: EnrichedFocusWithIncidence[] = [
  {
    focusKey: 'clinica_medica__has__has_primaria',
    especialidade: 'Clínica Médica',
    tema: 'Hipertensão Arterial',
    foco: 'Hipertensão Primária',
    specialtyColor: '#3b82f6',
    subfocoCount: 2,
    incidence: {
      level: 'extreme',
      fireCount: 4,
      label: 'Altíssima',
      colorHex: '#ef4444',
      badgeClass: 'badge-extreme'
    },
    score: 100
  },
  {
    focusKey: 'clinica_medica__has__crise_hipertensiva',
    especialidade: 'Clínica Médica',
    tema: 'Hipertensão Arterial',
    foco: 'Crise Hipertensiva',
    specialtyColor: '#3b82f6',
    subfocoCount: 3,
    incidence: {
      level: 'high',
      fireCount: 3,
      label: 'Alta',
      colorHex: '#f97316',
      badgeClass: 'badge-high'
    },
    score: 75
  },
  {
    focusKey: 'clinica_medica__ic__ic_fracao_reduzida',
    especialidade: 'Clínica Médica',
    tema: 'Insuficiência Cardíaca',
    foco: 'IC com Fração Reduzida',
    specialtyColor: '#3b82f6',
    subfocoCount: 4,
    incidence: {
      level: 'medium',
      fireCount: 2,
      label: 'Média',
      colorHex: '#eab308',
      badgeClass: 'badge-med'
    },
    score: 50
  },
  {
    focusKey: 'cirurgia__apendicite__apendicite_aguda',
    especialidade: 'Cirurgia Geral',
    tema: 'Abdome Agudo Inflamatório',
    foco: 'Apendicite Aguda',
    specialtyColor: '#10b981',
    subfocoCount: 3,
    incidence: {
      level: 'extreme',
      fireCount: 4,
      label: 'Altíssima',
      colorHex: '#ef4444',
      badgeClass: 'badge-extreme'
    },
    score: 100
  }
];

const mockProgressMap: Record<string, UserFocusProgress> = {
  clinica_medica__has__has_primaria: {
    focusKey: 'clinica_medica__has__has_primaria',
    especialidade: 'Clínica Médica',
    tema: 'Hipertensão Arterial',
    foco: 'Hipertensão Primária',
    isStudied: true,
    reviewCount: 2
  },
  cirurgia__apendicite__apendicite_aguda: {
    focusKey: 'cirurgia__apendicite__apendicite_aguda',
    especialidade: 'Cirurgia Geral',
    tema: 'Abdome Agudo Inflamatório',
    foco: 'Apendicite Aguda',
    isStudied: true,
    reviewCount: 0
  }
};

test('Checklist Hierarchy Builder', async (t) => {
  await t.test('1. Agrupa corretamente por Especialidade e Tema', () => {
    const tree = buildChecklistHierarchy(mockFoci, mockProgressMap);
    assert.equal(tree.length, 2);

    const clinica = tree.find((s) => s.especialidade === 'Clínica Médica');
    assert.ok(clinica);
    assert.equal(clinica.temas.length, 2);
    assert.equal(clinica.totalFoci, 3);
    assert.equal(clinica.studiedFoci, 1);
    assert.equal(clinica.progressPercent, 33); // 1 / 3 = 33%

    const has = clinica.temas.find((tm) => tm.tema === 'Hipertensão Arterial');
    assert.ok(has);
    assert.equal(has.totalFoci, 2);
    assert.equal(has.studiedFoci, 1);
    assert.equal(has.progressPercent, 50); // 1 / 2 = 50%
    assert.equal(has.hasExtremeIncidence, true);
    assert.equal(has.hasHighIncidence, true);

    const cirurgia = tree.find((s) => s.especialidade === 'Cirurgia Geral');
    assert.ok(cirurgia);
    assert.equal(cirurgia.totalFoci, 1);
    assert.equal(cirurgia.studiedFoci, 1);
    assert.equal(cirurgia.progressPercent, 100);
  });

  await t.test('2. Filtra por busca e auto-expande os ramos correspondentes', () => {
    const fullTree = buildChecklistHierarchy(mockFoci, mockProgressMap);
    const result = filterChecklistHierarchy(fullTree, { searchQuery: 'crise' }, mockProgressMap);

    assert.equal(result.totalFilteredFoci, 1);
    assert.equal(result.tree.length, 1);
    assert.equal(result.tree[0].especialidade, 'Clínica Médica');
    assert.equal(result.tree[0].temas.length, 1);
    assert.equal(result.tree[0].temas[0].tema, 'Hipertensão Arterial');
    assert.equal(result.tree[0].temas[0].foci[0].foco, 'Crise Hipertensiva');

    assert.ok(result.autoExpandedKeys.specialties.has('Clínica Médica'));
    assert.ok(result.autoExpandedKeys.temas.has('Clínica Médica::Hipertensão Arterial'));
  });

  await t.test('3. Filtra por incidência altíssima (4 fogos)', () => {
    const fullTree = buildChecklistHierarchy(mockFoci, mockProgressMap);
    const result = filterChecklistHierarchy(
      fullTree,
      { incidenceFilter: 'extreme_only' },
      mockProgressMap
    );

    assert.equal(result.totalFilteredFoci, 2);
    assert.equal(result.tree.length, 2);
  });

  await t.test('4. Filtra por status estudado', () => {
    const fullTree = buildChecklistHierarchy(mockFoci, mockProgressMap);
    const result = filterChecklistHierarchy(
      fullTree,
      { statusFilter: 'studied' },
      mockProgressMap
    );

    assert.equal(result.totalFilteredFoci, 2); // HAS Primária e Apendicite
  });
});
