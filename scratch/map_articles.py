import pypdf
import re

pdf_path = r"C:\Users\kushr\Downloads\OJ_L_202401689_EN_TXT.pdf"
reader = pypdf.PdfReader(pdf_path)

article_pattern = re.compile(r"Ar\s*t\s*i\s*c\s*l\s*e\s+(\d+)", re.IGNORECASE)

for i, page in enumerate(reader.pages):
    text = page.extract_text()
    matches = article_pattern.findall(text)
    if matches:
        print(f"Page {i}: Articles found: {', '.join(matches)}")
