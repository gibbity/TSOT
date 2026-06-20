import json
import re
import urllib.request
import os

WORDLIST_URL = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
WORDLIST_CACHE = "scratch/words_alpha.txt"

DOMAIN_WORDS = {
    "deployer", "deployers", "deployment", "deployments", "provider", "providers",
    "harmonised", "harmonisation", "biometric", "biometrics", "categorisation", "systemic",
    "unacceptable", "sandboxes", "sandbox", "deepfake", "deepfakes", "downstream", "conformity",
    "scoring", "scraping", "minimise", "minimising", "optimise", "optimising", "prioritise",
    "prioritising", "authorisation", "authorisations", "categorise", "categorised", "emotion",
    "subliminal", "manipulatory", "deceptive", "consciousness", "vulnerabilities", "infringement",
    "jurisdiction", "surveillance", "framework", "cooperation", "intermediary", "instructions",
    "malfunctioning", "verification", "dactyloscopic"
}

def load_dictionary():
    if not os.path.exists(WORDLIST_CACHE):
        print(f"Downloading wordlist from {WORDLIST_URL}...")
        urllib.request.urlretrieve(WORDLIST_URL, WORDLIST_CACHE)
    
    with open(WORDLIST_CACHE, "r", encoding="utf-8") as f:
        words = {line.strip().lower() for line in f}
    
    words.update(DOMAIN_WORDS)
    return words

def find_candidates(text, dictionary):
    # Find all sequences of two or three alphabetical tokens separated by spaces
    # Example: "pur pose", "inter nal", "deplo y ers"
    # We want to find cases where:
    # 1. Joins of the tokens form a valid word in the dictionary
    # 2. The individual tokens are not both common valid standalone words (unless one is very short or is a known fragment)
    
    words_in_text = re.findall(r'[a-zA-Z]+', text)
    candidates = {}
    
    # We also check the raw text with spacing. Let's tokenize and check adjacent pairs/triplets
    tokens = re.split(r'(\s+)', text)
    
    i = 0
    while i < len(tokens) - 2:
        token1 = tokens[i]
        sep = tokens[i+1]
        token2 = tokens[i+2]
        
        # Check if both tokens are purely alphabetical and sep is spaces
        if token1.isalpha() and sep.strip() == "" and token2.isalpha():
            joined = (token1 + token2).lower()
            t1_lower = token1.lower()
            t2_lower = token2.lower()
            
            # Heuristic: 
            # - joined is a valid word
            # - AND (either t1 or t2 is not a word, OR one of them is <= 3 letters, OR we know it is a common typo)
            if joined in dictionary:
                is_valid_t1 = t1_lower in dictionary and len(t1_lower) > 1
                is_valid_t2 = t2_lower in dictionary and len(t2_lower) > 1
                
                # Exceptions where t1 and t2 are both valid but we should NOT join them
                # e.g., "in to" -> "into" (could be valid or not, usually we want to keep "in to" or "into"?)
                # "an d" -> "and" (d is not a word)
                # "he art" -> "heart" (both valid)
                # "the re" -> "there" (both valid)
                # "on to" -> "onto" (both valid)
                
                should_join = False
                if not is_valid_t1 or not is_valid_t2:
                    should_join = True
                elif len(t1_lower) <= 2 or len(t2_lower) <= 2:
                    # e.g., "up take", "deplo y", "pur pose", "la ys", "do wn"
                    # But exclude common valid two-word phrases like "an act", "by the", "to be", "he is", "it is", "of us", "in or"
                    common_exceptions = {"to", "be", "he", "is", "it", "of", "us", "in", "or", "an", "at", "by", "on", "if", "so", "do", "go", "no", "we", "me", "my", "up", "am"}
                    if t1_lower in common_exceptions and t2_lower in common_exceptions:
                        should_join = False
                    else:
                        should_join = True
                
                if should_join:
                    orig = token1 + sep + token2
                    candidates[orig] = token1 + token2
        
        # Check triplets (e.g. "deplo y er" or "Char te r" or "ar tif icial")
        if i < len(tokens) - 4:
            sep2 = tokens[i+3]
            token3 = tokens[i+4]
            if token1.isalpha() and sep.strip() == "" and token2.isalpha() and sep2.strip() == "" and token3.isalpha():
                joined3 = (token1 + token2 + token3).lower()
                if joined3 in dictionary:
                    orig3 = token1 + sep + token2 + sep2 + token3
                    candidates[orig3] = token1 + token2 + token3
                    
        i += 2
        
    return candidates

def main():
    dictionary = load_dictionary()
    json_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\lib\supabase\ai_act_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    all_candidates = {}
    for item in data:
        for field in ["title", "article_text", "compliance_verdict"]:
            text = item.get(field, "")
            cands = find_candidates(text, dictionary)
            for k, v in cands.items():
                if k not in all_candidates:
                    all_candidates[k] = {"rep": v, "count": 0}
                all_candidates[k]["count"] += 1
                
    # Sort candidates by count descending
    sorted_cands = sorted(all_candidates.items(), key=lambda x: x[1]["count"], reverse=True)
    
    print(f"Found {len(sorted_cands)} unique candidate split words:")
    for orig, info in sorted_cands[:100]:
        print(f"  {repr(orig)} -> {repr(info['rep'])} ({info['count']} times)")

if __name__ == "__main__":
    main()
