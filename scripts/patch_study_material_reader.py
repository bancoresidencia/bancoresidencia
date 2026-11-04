#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

def patch_reader():
    path = r'C:\bancoresidencia\bancoresidencia\src\components\StudyMaterialReader.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    old_target = """        if (material?.recurrenceStats) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={material.recurrenceStats}
              focusTitle={material.focus}
            />
          );
        } else if (parsedData && Array.isArray(parsedData.items) && parsedData.items.length > 0) {
          elements.push(
            <ExamRecurrenceStatsCard
              key={`exam-stats-${key}`}
              data={parsedData.items}
              totalQuestions={parsedData.totalQuestions}
              title={parsedData.title}
            />
          );
        } else {"""

    new_replacement = """        const rawSlices = (parsedData as any)?.donutSlices || (parsedData as any)?.items;

        if (material?.recurrenceStats) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={material.recurrenceStats}
              focusTitle={material.focus}
            />
          );
        } else if (parsedData && Array.isArray(rawSlices) && rawSlices.length > 0) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={parsedData as any}
              slices={rawSlices}
              totalQuestions={parsedData.totalQuestions}
              focusTitle={material?.focus || (parsedData as any)?.focus || parsedData.title}
            />
          );
        } else if (parsedData && Array.isArray(parsedData.items) && parsedData.items.length > 0) {
          elements.push(
            <ExamRecurrenceStatsCard
              key={`exam-stats-${key}`}
              data={parsedData.items}
              totalQuestions={parsedData.totalQuestions}
              title={parsedData.title}
            />
          );
        } else {"""

    # Normalize CRLF for matching
    code_norm = code.replace('\r\n', '\n')
    old_norm = old_target.replace('\r\n', '\n')
    new_norm = new_replacement.replace('\r\n', '\n')

    if old_norm in code_norm:
        code_norm = code_norm.replace(old_norm, new_norm)
        # restore CRLF
        code_final = code_norm.replace('\n', '\r\n')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(code_final)
        print("✅ StudyMaterialReader.tsx patched successfully!")
    else:
        print("⚠️ Target not found in StudyMaterialReader.tsx")

if __name__ == '__main__':
    patch_reader()

