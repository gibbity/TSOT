import pypdf
import re

pdf_path = r"C:\Users\kushr\Downloads\OJ_L_202401689_EN_TXT.pdf"
reader = pypdf.PdfReader(pdf_path)

full_text_parts = []
for p in range(43, 124):
    full_text_parts.append(reader.pages[p].extract_text())

full_text = "\n".join(full_text_parts)

# Let's split by lines and look for lines that contain only "Article \d+" or "Ar ticle \d+"
lines = full_text.split('\n')
article_def_pattern = re.compile(r"^\s*Ar\s*t\s*i\s*c\s*l\s*e\s+(\d+)\s*$", re.IGNORECASE)

found_articles = {}
for idx, line in enumerate(lines):
    match = article_def_pattern.match(line)
    if match:
        art_num = int(match.group(1))
        # Look ahead to find the title (first non-empty line)
        title = ""
        for j in range(idx + 1, min(idx + 5, len(lines))):
            if lines[j].strip():
                title = lines[j].strip()
                break
        found_articles[art_num] = {
            "line_idx": idx,
            "title": title,
            "line_content": line
        }

print(f"Total articles found with strict line match: {len(found_articles)}")
missing = [i for i in range(1, 114) if i not in found_articles]
print(f"Missing articles: {missing}")

# Let's list the ones we found to verify
for i in sorted(found_articles.keys())[:10]:
    print(f"Article {i}: {found_articles[i]['title']}")
