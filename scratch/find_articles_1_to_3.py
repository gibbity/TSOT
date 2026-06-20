import pypdf
import re

pdf_path = r"C:\Users\kushr\Downloads\OJ_L_202401689_EN_TXT.pdf"
reader = pypdf.PdfReader(pdf_path)

pattern = re.compile(r"Ar\s*t\s*i\s*c\s*l\s*e\s+(\d+)", re.IGNORECASE)

for idx, page in enumerate(reader.pages):
    text = page.extract_text()
    for line in text.split('\n'):
        match = pattern.search(line)
        if match:
            art_num = int(match.group(1))
            if art_num <= 10:
                print(f"Page {idx}: {line.strip()}")
