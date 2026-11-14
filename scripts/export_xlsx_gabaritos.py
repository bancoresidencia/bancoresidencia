import os, json, zipfile, xml.etree.ElementTree as ET

dir_path = r'C:\Users\cnath\.gemini\antigravity\brain\9618f204-3788-45d2-8b60-26cb27d0dbd1\.user_uploaded'
files = {
    '2024': os.path.join(dir_path, 'media_1794604731419_39334b2d.xlsx'),
    '2025': os.path.join(dir_path, 'media_1794604731457_571dbc0d.xlsx'),
    '2026': os.path.join(dir_path, 'media_1794604731573_6bd6b37c.xlsx')
}

all_gabs = {}

for year, fp in files.items():
    print(f'Extracting {year} from {fp}...')
    with zipfile.ZipFile(fp, 'r') as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            strings = [''.join(node.itertext()) for node in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si')]
        sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = sheet_tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
        
        gabs_year = {}
        for r in rows:
            row_vals = []
            for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                t = c.get('t')
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                val = v.text if v is not None else ''
                if t == 's' and val.isdigit():
                    val = strings[int(val)]
                row_vals.append(val.strip())
            
            if not row_vals or not row_vals[0].isdigit():
                continue
            
            q_num = int(row_vals[0])
            correct_field = row_vals[1] if len(row_vals) > 1 else ''
            comment = row_vals[2] if len(row_vals) > 2 else ''
            
            # Extract letter and text
            letter = ''
            opt_text = ''
            if correct_field and len(correct_field) >= 2 and correct_field[1] == ')':
                letter = correct_field[0].upper()
                opt_text = correct_field[2:].strip()
            elif correct_field:
                letter = correct_field[0].upper()
                opt_text = correct_field[1:].strip()
                
            gabs_year[q_num] = {
                'num': q_num,
                'letter': letter,
                'opt_text': opt_text,
                'raw_field': correct_field,
                'commentary': comment
            }
        print(f'Year {year}: {len(gabs_year)} questions extracted.')
        all_gabs[year] = gabs_year

out_fp = r'data\abem_gabaritos_2024_2025_2026.json'
with open(out_fp, 'w', encoding='utf-8') as f:
    json.dump(all_gabs, f, ensure_ascii=False, indent=2)
print(f'Saved all gabaritos to {out_fp}')
