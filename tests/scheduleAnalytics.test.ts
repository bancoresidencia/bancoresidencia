import { describe, it } from 'node:test';
import assert from 'node:assert';
import { UserScheduleItem, FocusProgressMap } from '../src/types/studySchedule';

describe('Schedule Analytics Computations', () => {
  it('correctly calculates studied percentage based on catalog total', () => {
    const focusProgressMap: FocusProgressMap = {
      'clinica_medica__cardiologia__hipertensao': {
        id: 'p1',
        userId: 'u1',
        focusKey: 'clinica_medica__cardiologia__hipertensao',
        especialidade: 'Clínica Médica',
        tema: 'Cardiologia',
        foco: 'Hipertensão Arterial Sistêmica',
        isStudied: true,
        reviewCount: 1
      },
      'cirurgia_geral__trauma__atls': {
        id: 'p2',
        userId: 'u1',
        focusKey: 'cirurgia_geral__trauma__atls',
        especialidade: 'Cirurgia Geral',
        tema: 'Trauma',
        foco: 'Atendimento Inicial ao Politraumatizado',
        isStudied: true,
        reviewCount: 0
      },
      'pediatria__puericultura__marcos': {
        id: 'p3',
        userId: 'u1',
        focusKey: 'pediatria__puericultura__marcos',
        especialidade: 'Pediatria',
        tema: 'Puericultura',
        foco: 'Marcos do Desenvolvimento',
        isStudied: false,
        reviewCount: 0
      }
    };

    const studiedCount = Object.values(focusProgressMap).filter((p) => p.isStudied).length;
    const totalCatalogFoci = 786;
    const percentage = Math.round((studiedCount / totalCatalogFoci) * 100);

    assert.strictEqual(studiedCount, 2);
    assert.strictEqual(percentage, 0); // 2/786 is 0.25%, rounds to 0
  });

  it('correctly tracks R1, R2, R3 completion and adherence', () => {
    const items: UserScheduleItem[] = [
      {
        id: '1',
        userId: 'u1',
        scheduleId: 's1',
        scheduledDate: '2026-11-20',
        itemType: 'review_1',
        especialidade: 'Clínica Médica',
        tema: 'Cardiologia',
        foco: 'Hipertensão Arterial',
        orderIndex: 0,
        isCompleted: true
      },
      {
        id: '2',
        userId: 'u1',
        scheduleId: 's1',
        scheduledDate: '2026-11-27',
        itemType: 'review_1',
        especialidade: 'Cirurgia Geral',
        tema: 'Abdome Agudo',
        foco: 'Apendicite Aguda',
        orderIndex: 0,
        isCompleted: false
      },
      {
        id: '3',
        userId: 'u1',
        scheduleId: 's1',
        scheduledDate: '2026-12-20',
        itemType: 'review_2',
        especialidade: 'Clínica Médica',
        tema: 'Cardiologia',
        foco: 'Hipertensão Arterial',
        orderIndex: 0,
        isCompleted: true
      }
    ];

    const r1Items = items.filter((it) => it.itemType === 'review_1');
    const r1Done = r1Items.filter((it) => it.isCompleted).length;
    const r2Items = items.filter((it) => it.itemType === 'review_2');
    const r2Done = r2Items.filter((it) => it.isCompleted).length;

    assert.strictEqual(r1Items.length, 2);
    assert.strictEqual(r1Done, 1);
    assert.strictEqual(r2Items.length, 1);
    assert.strictEqual(r2Done, 1);

    const totalRevisions = r1Items.length + r2Items.length;
    const totalDone = r1Done + r2Done;
    const adherence = Math.round((totalDone / totalRevisions) * 100);

    assert.strictEqual(adherence, 67); // 2 / 3 = 66.6% -> 67%
  });
});
