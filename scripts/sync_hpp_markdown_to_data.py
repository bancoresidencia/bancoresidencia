import json

def sync():
    with open('docs/resumo_hemorragia_pos_parto_alto_rendimento.md', 'r', encoding='utf-8') as f:
        md_content = f.read()

    with open('src/data/studyMaterialsData.ts', 'r', encoding='utf-8') as f:
        ts_code = f.read()

    # Find the object for mat-hpp-01
    start_str = '"id": "mat-hpp-01"'
    start_pos = ts_code.find(start_str)
    if start_pos == -1:
        print("mat-hpp-01 not found!")
        return

    # Find "markdownContent": in this object
    md_key = '"markdownContent":'
    md_pos = ts_code.find(md_key, start_pos)
    if md_pos == -1:
        print("markdownContent not found!")
        return

    # The value starts with a quote right after "markdownContent":
    quote_pos = ts_code.find('"', md_pos + len(md_key))
    if quote_pos == -1:
        print("Opening quote not found!")
        return

    # Let's find the closing quote of markdownContent
    # It ends before the closing of the object (which ends at "\n  }\n];" or similar)
    closing_bracket = ts_code.rfind('}', quote_pos)
    # The last quote before closing_bracket is the closing quote of markdownContent
    end_quote_pos = ts_code.rfind('"', quote_pos + 1, closing_bracket)
    
    # Format the md_content as a JSON string (without surrounding quotes)
    serialized_md = json.dumps(md_content, ensure_ascii=False)
    
    new_ts_code = ts_code[:quote_pos] + serialized_md + ts_code[end_quote_pos + 1:]
    
    with open('src/data/studyMaterialsData.ts', 'w', encoding='utf-8') as f:
        f.write(new_ts_code)
    
    print("Successfully updated src/data/studyMaterialsData.ts!")

if __name__ == '__main__':
    sync()
