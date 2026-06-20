import pypdf

pdf_path = r"C:\Users\kushr\Downloads\OJ_L_202401689_EN_TXT.pdf"
reader = pypdf.PdfReader(pdf_path)

for p in range(45, 52):
    print(f"================ PAGE {p} ================")
    txt = reader.pages[p].extract_text()
    # Print first 2000 chars of each page
    print(txt[:2000])
