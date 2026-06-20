import pypdf
import re

pdf_path = r"C:\Users\kushr\Downloads\OJ_L_202401689_EN_TXT.pdf"
reader = pypdf.PdfReader(pdf_path)

# Concatenate text from pages 43 to 123 (0-indexed: 43 to 123)
full_text_parts = []
for p in range(43, 124):
    full_text_parts.append(reader.pages[p].extract_text())

full_text = "\n".join(full_text_parts)

# Regular expression to find article headings like:
# "Ar ticle 1", "Ar ticle 2", "Ar ticle 113", "Article 5"
# It should be on a line by itself or followed by a line break.
# Let's find matches and their positions.
matches = list(re.finditer(r"(?:^|\n)\s*Ar\s*t\s*i\s*c\s*l\s*e\s+(\d+)\b", full_text, re.IGNORECASE))

print(f"Total article matches found: {len(matches)}")

# Print first 20 matches details
for idx, m in enumerate(matches[:20]):
    art_num = m.group(1)
    start_pos = m.start()
    # Find title (next line or non-empty lines)
    end_pos = matches[idx+1].start() if idx+1 < len(matches) else len(full_text)
    chunk = full_text[start_pos:end_pos].strip()
    lines = [l.strip() for l in chunk.split('\n') if l.strip()]
    header = lines[0] if len(lines) > 0 else ""
    title = lines[1] if len(lines) > 1 else ""
    print(f"Match {idx+1}: {header} | Title: {title} | Chunk len: {len(chunk)}")
