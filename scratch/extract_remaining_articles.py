import json
import re

def clean_title(title):
    # Clean up PDF extraction artifacts
    title = title.replace("`", "").strip()
    title = re.sub(r"\bDef\s+initions\b", "Definitions", title, flags=re.IGNORECASE)
    title = re.sub(r"\bClassif\s+ication\b", "Classification", title, flags=re.IGNORECASE)
    title = re.sub(r"\btr\s+ansparency\b", "Transparency", title, flags=re.IGNORECASE)
    title = re.sub(r"\bpost\s*-\s*market\b", "Post-market", title, flags=re.IGNORECASE)
    title = re.sub(r"\bmonito\s*r\s*ing\b", "Monitoring", title, flags=re.IGNORECASE)
    # Capitalize first letter of each word (except minor ones)
    words = title.split()
    cleaned_words = []
    for i, w in enumerate(words):
        if i > 0 and w.lower() in ["and", "or", "to", "for", "of", "in", "on", "with", "by", "the", "a", "an"]:
            cleaned_words.append(w.lower())
        else:
            # Preserve acronyms
            if w.upper() in ["AI", "HCI", "LLM", "EU", "CCTV", "RBI"]:
                cleaned_words.append(w.upper())
            else:
                cleaned_words.append(w.capitalize())
    return " ".join(cleaned_words)

def extract_compliance_verdict(text, art_num):
    # Extract sentences that contain requirements
    # Split text into sentences using standard regex
    sentences = re.split(r'\.\s+', text)
    verdict_bullets = []
    
    # Common keywords indicating requirements
    req_patterns = [
        re.compile(r'\bshall\b', re.IGNORECASE),
        re.compile(r'\bmust\b', re.IGNORECASE),
        re.compile(r'\brequired to\b', re.IGNORECASE),
        re.compile(r'\bobliged to\b', re.IGNORECASE),
        re.compile(r'\bis prohibited\b', re.IGNORECASE)
    ]
    
    for sent in sentences:
        sent = sent.strip().replace('\n', ' ')
        # Clean double spaces
        sent = re.sub(r'\s+', ' ', sent)
        if not sent:
            continue
        
        # Check if it matches any pattern
        is_req = any(pat.search(sent) for pat in req_patterns)
        if is_req:
            # Let's keep it if it's reasonably sized
            if 15 < len(sent) < 400:
                # Format bullet points nicely
                verdict_bullets.append(sent)

    # If we have too few bullets, fall back to the first few sentences
    if len(verdict_bullets) < 2:
        verdict_bullets = []
        for sent in sentences[:3]:
            sent = sent.strip().replace('\n', ' ')
            sent = re.sub(r'\s+', ' ', sent)
            if len(sent) > 15:
                verdict_bullets.append(sent)

    # Clean and cap at 6 bullets to avoid overflow
    cleaned_bullets = []
    for b in verdict_bullets[:6]:
        # Clean any trailing/leading symbols and make sure it ends with a dot
        b = b.strip()
        if not b.endswith('.'):
            b += '.'
        # Sentence case (except acronyms)
        if b:
            cleaned_bullets.append(f"- {b}")

    if not cleaned_bullets:
        return f"- Obligations and provisions as laid down in Article {art_num} of the EU AI Act."
        
    return "\n".join(cleaned_bullets)

def main():
    json_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\lib\supabase\ai_act_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated_count = 0
    for item in data:
        art_num = int(item["code"].split("-")[-1])
        # Only process those that are currently fallback
        if "Obligations as defined under Article" in item["compliance_verdict"]:
            # Clean title
            raw_title = item["title"]
            item["title"] = clean_title(raw_title)
            
            # Extract verdict
            item["compliance_verdict"] = extract_compliance_verdict(item["article_text"], art_num)
            
            # Deduce risk level
            item["risk_level"] = "critical" if art_num == 5 else ("warning" if 6 <= art_num <= 49 else "stable")
            updated_count += 1

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Extractive fallback parser completed. Updated {updated_count} articles in {json_path}.")

if __name__ == "__main__":
    main()
