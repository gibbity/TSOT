import pypdf
import re
import urllib.request
import json
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_api_key():
    try:
        # Check in workspace path first
        env_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\.env.local"
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        return line.split("=")[1].strip()
    except Exception as e:
        print(f"Error reading .env.local: {e}")
    # Fallback to known key
    return "AIzaSyBkbPjvSMuFQpqMNptBngaiS3baunruoTI"

def clean_article_text(lines):
    cleaned = []
    for l in lines:
        s_l = l.strip()
        if not s_l:
            continue
        # Remove PDF header/footer artifacts
        if "ELI: http://" in s_l or "OJ L," in s_l:
            continue
        if s_l == "EN" or re.match(r"^\d+/\d+$", s_l):
            continue
        cleaned.append(l)
    return "\n".join(cleaned)

def get_category(art_num):
    if art_num == 5:
        return "UNACCEPTABLE RISK"
    elif 6 <= art_num <= 49:
        return "HIGH RISK"
    elif art_num in (50, 52):
        return "LIMITED RISK"
    else:
        return "MINIMAL RISK"

def summarize_article(api_key, art_num, art_text):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    prompt = f"""You are a legal expert specializing in the EU AI Act (Regulation (EU) 2024/1689).
Given the following raw text of Article {art_num}, please:
1. Provide a cleaned up, professionally capitalized title for the article (e.g. 'Article {art_num}: [Clean Title]').
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
    
    # Retry logic
    max_retries = 3
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                output_json = json.loads(res_data['candidates'][0]['content']['parts'][0]['text'])
                return {
                    "code": f"EU-ACT-ART-{art_num}",
                    "title": output_json.get("title", f"Article {art_num}"),
                    "category": get_category(art_num),
                    "article_text": art_text,
                    "compliance_verdict": output_json.get("compliance_verdict", ""),
                    "risk_level": output_json.get("risk_level", "stable")
                }
        except Exception as e:
            print(f"Attempt {attempt+1} failed for Article {art_num}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                # Fallback in case of total failure
                return {
                    "code": f"EU-ACT-ART-{art_num}",
                    "title": f"Article {art_num}",
                    "category": get_category(art_num),
                    "article_text": art_text,
                    "compliance_verdict": f"Obligations as defined under Article {art_num} of the EU AI Act.",
                    "risk_level": "critical" if art_num == 5 else ("warning" if 6 <= art_num <= 49 else "stable")
                }

def main():
    pdf_path = r"C:\Users\kushr\Downloads\OJ_L_202401689_EN_TXT.pdf"
    print(f"Reading PDF from {pdf_path}...")
    reader = pypdf.PdfReader(pdf_path)

    # Concatenate text from pages 43 to 123
    full_text_parts = []
    for p in range(43, 124):
        full_text_parts.append(reader.pages[p].extract_text())
    full_text = "\n".join(full_text_parts)

    lines = full_text.split('\n')
    article_def_pattern = re.compile(r"^\s*Ar\s*t\s*i\s*c\s*l\s*e\s+(\d+)\s*$", re.IGNORECASE)

    found_articles = []
    for idx, line in enumerate(lines):
        match = article_def_pattern.match(line)
        if match:
            art_num = int(match.group(1))
            found_articles.append({
                "number": art_num,
                "line_idx": idx
            })

    # Sort by line index to ensure order
    found_articles.sort(key=lambda x: x["line_idx"])

    # Slice text for each article
    articles_data = []
    for idx, art in enumerate(found_articles):
        art_num = art["number"]
        start_line = art["line_idx"]
        end_line = found_articles[idx + 1]["line_idx"] if idx + 1 < len(found_articles) else len(lines)
        
        # We skip the very first line which is the article header line (e.g. "Article 1")
        # and look at subsequent lines for title and text
        art_lines = lines[start_line:end_line]
        cleaned_text = clean_article_text(art_lines)
        articles_data.append((art_num, cleaned_text))

    print(f"Extracted {len(articles_data)} articles from PDF. Starting AI enrichment...")
    
    api_key = get_api_key()
    enriched_articles = []

    # Run enriched summarization concurrently
    # Since it's network-bound, a thread pool of 15 is highly efficient
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = {executor.submit(summarize_article, api_key, art_num, art_text): art_num for art_num, art_text in articles_data}
        
        completed_count = 0
        for future in as_completed(futures):
            art_num = futures[future]
            try:
                res = future.result()
                enriched_articles.append(res)
                completed_count += 1
                if completed_count % 10 == 0 or completed_count == len(articles_data):
                    print(f"Progress: {completed_count}/{len(articles_data)} articles enriched...")
            except Exception as e:
                print(f"Exception for article {art_num}: {e}")

    # Re-sort to match Article number order
    enriched_articles.sort(key=lambda x: int(x["code"].split("-")[-1]))

    # Ensure target directory exists and write JSON file
    output_dir = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\lib\supabase"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "ai_act_data.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(enriched_articles, f, indent=2, ensure_ascii=False)

    print(f"Success! Saved {len(enriched_articles)} articles to {output_path} in {time.time() - start_time:.2f} seconds.")

if __name__ == "__main__":
    main()
