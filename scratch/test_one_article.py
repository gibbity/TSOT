import urllib.request
import json
import pypdf
import re

pdf_path = r"C:\Users\kushr\Downloads\OJ_L_202401689_EN_TXT.pdf"
reader = pypdf.PdfReader(pdf_path)

# Extract text from pages 43 to 123
full_text_parts = []
for p in range(43, 124):
    full_text_parts.append(reader.pages[p].extract_text())
full_text = "\n".join(full_text_parts)

# Split into lines and find Article headers
lines = full_text.split('\n')
article_def_pattern = re.compile(r"^\s*Ar\s*t\s*i\s*c\s*l\s*e\s+(\d+)\s*$", re.IGNORECASE)

found_articles = []
for idx, line in enumerate(lines):
    match = article_def_pattern.match(line)
    if match:
        art_num = int(match.group(1))
        # Look ahead for title
        title = ""
        for j in range(idx + 1, min(idx + 5, len(lines))):
            if lines[j].strip():
                title = lines[j].strip()
                break
        found_articles.append({
            "number": art_num,
            "line_idx": idx,
            "title": title
        })

# Sort by line index
found_articles.sort(key=lambda x: x["line_idx"])

# Let's get the text of Article 5
art_5_idx = None
for idx, art in enumerate(found_articles):
    if art["number"] == 5:
        art_5_idx = idx
        break

if art_5_idx is not None:
    start_line = found_articles[art_5_idx]["line_idx"]
    end_line = found_articles[art_5_idx + 1]["line_idx"] if art_5_idx + 1 < len(found_articles) else len(lines)
    art_lines = lines[start_line:end_line]
    # Clean up footers
    cleaned_lines = []
    for l in art_lines:
        s_l = l.strip()
        if not s_l:
            continue
        if "ELI: http://" in s_l or "OJ L," in s_l:
            continue
        if s_l == "EN" or re.match(r"^\d+/\d+$", s_l):
            continue
        cleaned_lines.append(l)
    
    art_text = "\n".join(cleaned_lines)
    print(f"Article 5 extracted text length: {len(art_text)}")
    
    # Let's call Gemini
    api_key = "AIzaSyBkbPjvSMuFQpqMNptBngaiS3baunruoTI"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    prompt = f"""You are a legal expert specializing in the EU AI Act (Regulation (EU) 2024/1689).
Given the following raw text of Article 5, please:
1. Provide a cleaned up, professionally capitalized title for the article (e.g. 'Article 5: [Clean Title]').
2. Provide a concrete, actionable compliance verdict. This should be a concise summary of the obligations, steps, or rules established by this article, structured as a markdown bulleted list.
3. Determine the risk level of this article: 'critical' (if it deals with prohibited practices/unacceptable risk), 'warning' (if it deals with high-risk obligations/requirements), or 'stable' (otherwise).

Output your response strictly as a JSON object with keys:
- 'title': string
- 'compliance_verdict': string (markdown bulleted list of actionable requirements)
- 'risk_level': string ('critical' | 'warning' | 'stable')

Raw text:
{art_text}
"""

    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            output_json = json.loads(res_data['candidates'][0]['content']['parts'][0]['text'])
            print("Gemini response JSON:")
            print(json.dumps(output_json, indent=2))
    except Exception as e:
        print(f"Error: {e}")
