import json
import re
import urllib.request
import os

WORDS_ALPHA_URL = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
COMMON_WORDS_URL = "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa-no-swears.txt"

WORDS_ALPHA_PATH = "scratch/words_alpha.txt"
COMMON_WORDS_PATH = "scratch/google-10000-english.txt"

DOMAIN_WORDS = {
    "deployer", "deployers", "deployment", "deployments", "provider", "providers",
    "harmonised", "harmonisation", "biometric", "biometrics", "categorisation", "systemic",
    "unacceptable", "sandboxes", "sandbox", "deepfake", "deepfakes", "downstream", "conformity",
    "scoring", "scraping", "minimise", "minimising", "optimise", "optimising", "prioritise",
    "prioritising", "authorisation", "authorisations", "categorise", "categorised", "emotion",
    "subliminal", "manipulatory", "deceptive", "consciousness", "vulnerabilities", "infringement",
    "jurisdiction", "surveillance", "framework", "cooperation", "intermediary", "instructions",
    "malfunctioning", "verification", "dactyloscopic", "rules", "union", "article"
}

def download_file(url, path):
    if not os.path.exists(path):
        print(f"Downloading {url} to {path}...")
        urllib.request.urlretrieve(url, path)

def load_words():
    download_file(WORDS_ALPHA_URL, WORDS_ALPHA_PATH)
    download_file(COMMON_WORDS_URL, COMMON_WORDS_PATH)
    
    with open(WORDS_ALPHA_PATH, "r", encoding="utf-8") as f:
        alpha_words = {line.strip().lower() for line in f}
    alpha_words.update(DOMAIN_WORDS)
    
    with open(COMMON_WORDS_PATH, "r", encoding="utf-8") as f:
        common_words = {line.strip().lower() for line in f}
        
    # We want to treat common words of length >= 3 as valid independent words
    # but exclude some that are actually common split fragments (like "carr", "stat")
    # or words that are extremely rare or typically typos.
    # Also, single/double letter words are handled separately.
    valid_standalone = {w for w in common_words if len(w) >= 3}
    valid_standalone.update({"in", "on", "at", "by", "to", "of", "or", "an", "as", "if", "so", "do", "go", "no", "we", "me", "my", "he", "is", "it", "us", "am"})
    
    # "carr", "stat", "comp", "imp", "ad", "re", "pa", "ma", "la", "te" might be in common words but are often fragments in this context
    fragments = {"carr", "stat", "comp", "imp", "pa", "ma", "la", "te", "concer", "obliga", "notif", "provid", "har", "specif", "pur", "deplo", "inter", "exper"}
    valid_standalone = valid_standalone - fragments
    
    return alpha_words, valid_standalone

def find_candidates(text, alpha_words, valid_standalone):
    tokens = re.split(r'(\s+)', text)
    candidates = {}
    
    i = 0
    while i < len(tokens) - 2:
        token1 = tokens[i]
        sep = tokens[i+1]
        token2 = tokens[i+2]
        
        # Check if both are alphabetical and sep is whitespace
        if token1.isalpha() and sep.strip() == "" and token2.isalpha():
            t1_l = token1.lower()
            t2_l = token2.lower()
            joined = (token1 + token2).lower()
            
            # If joined is a valid word
            if joined in alpha_words:
                # We should join if at least one of the tokens is NOT a valid standalone word
                is_standalone_t1 = t1_l in valid_standalone
                is_standalone_t2 = t2_l in valid_standalone
                
                # Check for single/double letter tokens which are usually fragments
                is_fragment_t1 = len(t1_l) <= 2 and t1_l not in {"in", "on", "at", "by", "to", "of", "or", "an", "as", "if", "so", "do", "go", "no", "we", "me", "my", "he", "is", "it", "us", "am"}
                is_fragment_t2 = len(t2_l) <= 2 and t2_l not in {"in", "on", "at", "by", "to", "of", "or", "an", "as", "if", "so", "do", "go", "no", "we", "me", "my", "he", "is", "it", "us", "am"}
                
                # Special common cases in AI act text
                known_split_pairs = {
                    ("pur", "pose"), ("pur", "poses"), ("inter", "nal"), ("inter", "nally"),
                    ("deplo", "yment"), ("deplo", "yments"), ("deplo", "yer"), ("deplo", "yers"),
                    ("prov", "ider"), ("prov", "iders"), ("pro", "vider"), ("pro", "viders"),
                    ("gove", "rnance"), ("gove", "rning"), ("com", "pliance"), ("obliga", "tions"),
                    ("obliga", "tion"), ("specif", "ic"), ("specif", "ically"), ("concer", "ning"),
                    ("concer", "ned"), ("notif", "ied"), ("notif", "ying"), ("har", "monised"),
                    ("har", "monisation"), ("exper", "ience"), ("exper", "iences"), ("un", "acceptable")
                }
                
                if (t1_l, t2_l) in known_split_pairs or not is_standalone_t1 or not is_standalone_t2 or is_fragment_t1 or is_fragment_t2:
                    # Exclude joining valid phrases like "to be", "he is", "in to" -> only join if they're not a common phrase
                    # e.g., "in to" -> "into". Is "into" in alpha_words? Yes. Is "in" standalone? Yes. Is "to" standalone? Yes.
                    # Under our rule, since both are standalone, we won't join unless it's in known_split_pairs.
                    orig = token1 + sep + token2
                    candidates[orig] = token1 + token2
                    
        # Check triplets
        if i < len(tokens) - 4:
            sep2 = tokens[i+3]
            token3 = tokens[i+4]
            if token1.isalpha() and sep.strip() == "" and token2.isalpha() and sep2.strip() == "" and token3.isalpha():
                joined3 = (token1 + token2 + token3).lower()
                if joined3 in alpha_words:
                    orig3 = token1 + sep + token2 + sep2 + token3
                    candidates[orig3] = token1 + token2 + token3
                    
        i += 2
        
    return candidates

def main():
    alpha_words, valid_standalone = load_words()
    json_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\lib\supabase\ai_act_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    all_candidates = {}
    for item in data:
        for field in ["title", "article_text", "compliance_verdict"]:
            text = item.get(field, "")
            cands = find_candidates(text, alpha_words, valid_standalone)
            for k, v in cands.items():
                if k not in all_candidates:
                    all_candidates[k] = {"rep": v, "count": 0}
                all_candidates[k]["count"] += 1
                
    # Sort candidates by count descending
    sorted_cands = sorted(all_candidates.items(), key=lambda x: x[1]["count"], reverse=True)
    
    print(f"Found {len(sorted_cands)} unique candidate split words:")
    # Print the ones that are likely correct splits
    with open("scratch/split_words_detected.json", "w", encoding="utf-8") as f_out:
        json.dump({k: v["rep"] for k, v in sorted_cands}, f_out, indent=2)
        
    for orig, info in sorted_cands[:100]:
        print(f"  {repr(orig)} -> {repr(info['rep'])} ({info['count']} times)")

if __name__ == "__main__":
    main()
