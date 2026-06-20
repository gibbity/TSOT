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

# Words that should not be merged (e.g. "in to" or "may be") unless explicitly overridden
EXCLUDE_MERGES = {
    "into", "maybe", "cannot", "without", "within", "throughout", "upon", "undergo",
    "therein", "thereof", "thereby", "thereto", "herein", "hereof", "hereby", "hereto",
    "whereby", "wherein", "whereof", "widespread"
}

def load_words():
    if not os.path.exists(WORDS_ALPHA_PATH):
        print(f"Downloading {WORDS_ALPHA_URL}...")
        urllib.request.urlretrieve(WORDS_ALPHA_URL, WORDS_ALPHA_PATH)
    if not os.path.exists(COMMON_WORDS_PATH):
        print(f"Downloading {COMMON_WORDS_URL}...")
        urllib.request.urlretrieve(COMMON_WORDS_URL, COMMON_WORDS_PATH)
        
    with open(WORDS_ALPHA_PATH, "r", encoding="utf-8") as f:
        alpha_words = {line.strip().lower() for line in f}
    alpha_words.update(DOMAIN_WORDS)
    
    with open(COMMON_WORDS_PATH, "r", encoding="utf-8") as f:
        common_words = {line.strip().lower() for line in f}
        
    # Standard valid English words (length >= 3)
    valid_standalone = {w for w in common_words if len(w) >= 3}
    
    # Add common short words of length 1 or 2
    valid_short = {
        "a", "i", "an", "am", "as", "at", "be", "by", "do", "go", "he", "if", "in", 
        "is", "it", "me", "my", "no", "of", "on", "or", "so", "to", "up", "us", "we", 
        "oh", "ah", "ha", "hi", "ok", "re", "ex"
    }
    valid_standalone.update(valid_short)
    
    # Remove common split fragments that could be in common_words
    fragments = {
        "carr", "stat", "comp", "imp", "pa", "ma", "la", "te", "concer", "obliga", 
        "notif", "provid", "har", "specif", "pur", "deplo", "inter", "exper", "verif", 
        "identif", "categor", "biometr", "regul", "monit", "transp", "gover", "implem", 
        "compl", "coord", "coop", "excl", "auth", "estab", "deleg", "subst", "analys", 
        "docum", "infor", "refe", "carr"
    }
    valid_standalone = valid_standalone - fragments
    
    return alpha_words, valid_standalone

def get_replacement_map(text, alpha_words, valid_standalone):
    # Split text into alphabetical tokens and spacing
    tokens = re.split(r'(\s+)', text)
    replacements = {}
    
    # Known split pairs that we want to explicitly allow even if they contain two seemingly valid standalone words
    known_split_pairs = {
        ("pur", "pose"), ("pur", "poses"), ("inter", "nal"), ("inter", "nally"),
        ("deplo", "yment"), ("deplo", "yments"), ("deplo", "yer"), ("deplo", "yers"),
        ("prov", "ider"), ("prov", "iders"), ("pro", "vider"), ("pro", "viders"),
        ("gove", "rnance"), ("gove", "rning"), ("com", "pliance"), ("obliga", "tions"),
        ("obliga", "tion"), ("specif", "ic"), ("specif", "ically"), ("concer", "ning"),
        ("concer", "ned"), ("notif", "ied"), ("notif", "ying"), ("har", "monised"),
        ("har", "monisation"), ("exper", "ience"), ("exper", "iences"), ("un", "acceptable")
    }
    
    i = 0
    while i < len(tokens) - 2:
        token1 = tokens[i]
        sep = tokens[i+1]
        token2 = tokens[i+2]
        
        if token1.isalpha() and sep.strip() == "" and token2.isalpha():
            t1_l = token1.lower()
            t2_l = token2.lower()
            joined = (token1 + token2).lower()
            
            if joined in alpha_words:
                is_standalone_t1 = t1_l in valid_standalone
                is_standalone_t2 = t2_l in valid_standalone
                
                is_fragment_t1 = len(t1_l) <= 2 and t1_l not in valid_standalone
                is_fragment_t2 = len(t2_l) <= 2 and t2_l not in valid_standalone
                
                should_join = False
                if (t1_l, t2_l) in known_split_pairs:
                    should_join = True
                elif not is_standalone_t1 or not is_standalone_t2 or is_fragment_t1 or is_fragment_t2:
                    # Exclude typical multiple word joins like "into", "maybe" if both are valid standalone
                    if joined in EXCLUDE_MERGES and is_standalone_t1 and is_standalone_t2:
                        should_join = False
                    else:
                        should_join = True
                        
                if should_join:
                    # Preserve case logic:
                    # If both are uppercase, uppercase joined. If first is capitalized, capitalized joined.
                    if token1.isupper() and token2.isupper():
                        rep = joined.upper()
                    elif token1[0].isupper():
                        rep = joined[0].upper() + joined[1:]
                    else:
                        rep = joined
                        
                    orig = token1 + sep + token2
                    replacements[orig] = rep
                    
        # Check triplets
        if i < len(tokens) - 4:
            sep2 = tokens[i+3]
            token3 = tokens[i+4]
            if token1.isalpha() and sep.strip() == "" and token2.isalpha() and sep2.strip() == "" and token3.isalpha():
                joined3 = (token1 + token2 + token3).lower()
                if joined3 in alpha_words:
                    if token1.isupper():
                        rep3 = joined3.upper()
                    elif token1[0].isupper():
                        rep3 = joined3[0].upper() + joined3[1:]
                    else:
                        rep3 = joined3
                    orig3 = token1 + sep + token2 + sep2 + token3
                    replacements[orig3] = rep3
                    
        i += 2
        
    return replacements

def clean_text_with_map(text, repl_map):
    if not text or not repl_map:
        return text
    
    # Sort keys by length descending to replace larger chunks first
    sorted_keys = sorted(repl_map.keys(), key=len, reverse=True)
    
    cleaned = text
    for key in sorted_keys:
        # Use regex boundary/escaping to replace exact instances
        # Escape special characters in key
        pattern = re.escape(key).replace(r"\ ", r"\s+")
        cleaned = re.sub(pattern, repl_map[key], cleaned)
        
    return cleaned

def main():
    alpha_words, valid_standalone = load_words()
    json_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\lib\supabase\ai_act_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Cleaning split words in {len(data)} articles...")
    
    total_replaces = 0
    for idx, item in enumerate(data):
        changed = False
        for field in ["title", "article_text", "compliance_verdict"]:
            orig_text = item[field]
            repl_map = get_replacement_map(orig_text, alpha_words, valid_standalone)
            if repl_map:
                new_text = clean_text_with_map(orig_text, repl_map)
                if new_text != orig_text:
                    item[field] = new_text
                    changed = True
                    for orig, rep in repl_map.items():
                        print(f"[{item['code']} - {field}] replaced {repr(orig)} with {repr(rep)}")
                        total_replaces += 1
                        
    if total_replaces > 0:
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully cleaned data. Total replacements: {total_replaces}")
    else:
        print("No split words found or cleaned.")

if __name__ == "__main__":
    main()
