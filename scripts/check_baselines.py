with open('src/data/homologatedFacetsBaseline.ts', 'r', encoding='utf-8') as f:
    for line in f:
        if 'export const ' in line or '"total":' in line:
            print(line.strip())
