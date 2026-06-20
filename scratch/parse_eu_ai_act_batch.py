import json
import os
import urllib.request
import re
import time

def get_api_key():
    try:
        env_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\.env.local"
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        return line.split("=")[1].strip()
    except Exception as e:
        print(f"Error reading .env.local: {e}")
    return "AIzaSyBkbPjvSMuFQpqMNptBngaiS3baunruoTI"

def get_category(art_num):
    if art_num == 5:
        return "UNACCEPTABLE RISK"
    elif 6 <= art_num <= 49:
        return "HIGH RISK"
    elif art_num in (50, 52):
        return "LIMITED RISK"
    else:
        return "MINIMAL RISK"

def process_batch(api_key, batch_articles):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    # Construct batch prompt
    articles_prompt_parts = []
    for art_num, art_text in batch_articles:
        articles_prompt_parts.append(
            f"[START OF ARTICLE {art_num}]\n{art_text}\n[END OF ARTICLE {art_num}]"
        )
    
    prompt = f"""You are a legal expert specializing in the EU AI Act (Regulation (EU) 2024/1689).
Given the following raw texts of articles from the Act, please process each one and generate:
1. A cleaned up, professionally capitalized title (e.g. 'Article X: [Title]').
2. A concrete, actionable compliance verdict. This should be a concise summary of the obligations, steps, or rules established by this article, structured as a markdown bulleted list.
3. The risk level: 'critical' (if it deals with prohibited practices/unacceptable risk), 'warning' (if it deals with high-risk obligations/requirements), or 'stable' (otherwise).

Output your response strictly as a JSON list of objects, where each object has keys:
- 'art_num': integer (the article number)
- 'title': string
- 'compliance_verdict': string (markdown bulleted list of actionable requirements)
- 'risk_level': string ('critical' | 'warning' | 'stable')

Articles to process:
{"\n\n".join(articles_prompt_parts)}
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
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=45) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                output_json = json.loads(res_data['candidates'][0]['content']['parts'][0]['text'])
                return output_json
        except Exception as e:
            print(f"Attempt {attempt+1} failed for batch: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
    return None

def main():
    json_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\lib\supabase\ai_act_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # We need to process all articles.
    # Group articles into batches of 10
    articles_to_process = []
    for item in data:
        art_num = int(item["code"].split("-")[-1])
        articles_to_process.append((art_num, item["article_text"]))

    batches = []
    batch_size = 10
    for i in range(0, len(articles_to_process), batch_size):
        batches.append(articles_to_process[i:i+batch_size])

    print(f"Divided {len(articles_to_process)} articles into {len(batches)} batches.")
    
    api_key = get_api_key()
    results_map = {}

    for batch_idx, batch in enumerate(batches):
        print(f"Processing batch {batch_idx + 1}/{len(batches)} (Articles {[x[0] for x in batch]})...")
        batch_results = process_batch(api_key, batch)
        
        if batch_results:
            for res in batch_results:
                art_num = res.get("art_num")
                if art_num:
                    results_map[art_num] = res
            print(f"Batch {batch_idx + 1} succeeded. Obtained summaries for: {list(results_map.keys())[-len(batch_results):]}")
        else:
            print(f"Batch {batch_idx + 1} failed completely after retries.")
        
        # Throttling to prevent 429
        time.sleep(4)

    # Merge results back into the original data
    updated_count = 0
    for item in data:
        art_num = int(item["code"].split("-")[-1])
        if art_num in results_map:
            res = results_map[art_num]
            item["title"] = res.get("title", item["title"])
            item["compliance_verdict"] = res.get("compliance_verdict", item["compliance_verdict"])
            item["risk_level"] = res.get("risk_level", item["risk_level"])
            updated_count += 1

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Finished batch enrichment. Updated {updated_count}/{len(data)} articles in {json_path}.")

if __name__ == "__main__":
    main()
