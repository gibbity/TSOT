import pypdf

pdf_path = r"C:\Users\kushr\Downloads\OJ_L_202401689_EN_TXT.pdf"
reader = pypdf.PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

# Print text of first page
text_page_0 = reader.pages[0].extract_text()
print(f"Page 0 Text Length: {len(text_page_0)}")
print("--- Page 0 text ---")
print(text_page_0[:1000])
print("-------------------")

# Let's inspect page 30 or 40 to find the articles
for page_num in [10, 20, 30, 40, 50]:
    txt = reader.pages[page_num].extract_text()
    print(f"Page {page_num} Length: {len(txt)}")
    if len(txt) > 100:
        print(f"--- Page {page_num} Start ---")
        print(txt[:300])
        print("---------------------------")
