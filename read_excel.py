import pandas as pd

file = r'c:\Users\mario\OneDrive\Documentos\Projectos\TMERT\tmert-app\TMERT Planilla oficial.xlsx'
try:
    xl = pd.ExcelFile(file)
    with open(r'C:\Users\mario\.gemini\antigravity\brain\298e7a13-0ed8-4e16-9b31-bdbcc30a6f39\excel_summary.txt', 'w', encoding='utf-8') as f:
        for sheet in xl.sheet_names:
            f.write(f"--- Sheet: {sheet} ---\n")
            df = xl.parse(sheet, nrows=10)
            f.write(df.to_string() + "\n\n")
except Exception as e:
    with open(r'C:\Users\mario\.gemini\antigravity\brain\298e7a13-0ed8-4e16-9b31-bdbcc30a6f39\excel_summary.txt', 'w', encoding='utf-8') as f:
        f.write(f"Error: {e}")
