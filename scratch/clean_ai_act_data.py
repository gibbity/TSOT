import json
import re

# Comprehensive list of split-word typos in the consolidated EU AI Act text
TYPO_MAPPING = [
    ("Ar ticle", "article"),
    ("ar tif icial", "artificial"),
    ("ar tificial", "artificial"),
    ("intellig ence", "intelligence"),
    ("Provi ders", "providers"),
    ("Provi der", "provider"),
    ("prov iders", "providers"),
    ("prov ider", "provider"),
    ("deplo y ers", "deployers"),
    ("deplo y er", "deployer"),
    ("depl oyers", "deployers"),
    ("depl oyer", "deployer"),
    ("syste ms", "systems"),
    ("syste m", "system"),
    ("syst ems", "systems"),
    ("syst em", "system"),
    ("exte nt", "extent"),
    ("suffi cient", "sufficient"),
    ("lite racy", "literacy"),
    ("kno wledge", "knowledge"),
    ("exper ience", "experience"),
    ("consider ing", "considering"),
    ("PR OHIBITED", "prohibited"),
    ("PR OHIBIT", "prohibit"),
    ("prohib ited", "prohibited"),
    ("PRA CTICES", "practices"),
    ("PRA CTICE", "practice"),
    ("oblig ations", "obligations"),
    ("oblig ation", "obligation"),
    ("tr ansparency", "transparency"),
    ("transp arency", "transparency"),
    ("transp arent", "transparent"),
    ("gove r nance", "governance"),
    ("gove r nce", "governance"),
    ("post-marke t", "post-market"),
    ("post-remot e", "post-remote"),
    ("biometr ic", "biometric"),
    ("biome tric", "biometric"),
    ("categor isation", "categorisation"),
    ("identifi cation", "identification"),
    ("identif ication", "identification"),
    ("remot e", "remote"),
    ("pur poses", "purposes"),
    ("la w", "law"),
    ("enf orcement", "enforcement"),
    ("Regulation", "regulation"),
    ("author isation", "authorisation"),
    ("judicial", "judicial"),
    ("administrative", "administrative"),
    ("authority", "authority"),
    ("decision", "decision"),
    ("adverse", "adverse"),
    ("legal", "legal"),
    ("effect", "effect"),
    ("person", "person"),
    ("persons", "persons"),
    ("output", "output"),
    ("notification", "notification"),
    ("market", "market"),
    ("surveillance", "surveillance"),
    ("data", "data"),
    ("protection", "protection"),
    ("annual", "annual"),
    ("reports", "reports"),
    ("Commission", "commission"),
    ("Member", "member"),
    ("States", "states"),
    ("restrictive", "restrictive"),
    ("laws", "laws"),
    ("te chnical", "technical"),
    ("saf e", "safe"),
    ("saf eguarding", "safeguarding"),
    ("safeg uards", "safeguards"),
    ("safeg uard", "safeguard"),
    ("f or", "for"),
    ("t o", "to"),
    ("o f", "of"),
    ("i n", "in"),
    ("a n d", "and"),
    ("t h e", "the"),
    ("a c h i e v e", "achieve"),
    ("p u t t i n g", "putting"),
    ("s e r v i c e", "service"),
    ("p l a c i n g", "placing"),
    ("m a r k e t", "market"),
    ("i n t e n d e d", "intended"),
    ("p u r p o s e", "purpose"),
    ("r e a s o n a b l y", "reasonably"),
    ("f o r e s e e a b l e", "foreseeable"),
    ("m i s u s e", "misuse"),
    ("c o m p o n e n t", "component"),
    ("p r o d u c t", "product"),
    ("f u n c t i o n", "function"),
    ("f a i l u r e", "failure"),
    ("m a l f u n c t i o n i n g", "malfunctioning"),
    ("e n d a n g e r s", "endangers"),
    ("h e a l t h", "health"),
    ("s a f e t y", "safety"),
    ("p e r s o n s", "persons"),
    ("p r o p e r t y", "property"),
    ("i n s t r u c t i o n s", "instructions"),
    ("r e c a l l", "recall"),
    ("w i t h d r a w a l", "withdrawal"),
    ("p e r f o r m a n c e", "performance"),
    ("n o t i f y i n g", "notifying"),
    ("a u t h o r i t y", "authority"),
    ("c o n f o r m i t y", "conformity"),
    ("a s s e s s m e n t", "assessment"),
    ("b o d y", "body"),
    ("n o t i f i e d", "notified"),
    ("s u b s t a n t i a l", "substantial"),
    ("m o d i f i c a t i o n", "modification"),
    ("m a r k i n g", "marking"),
    ("p o s t - m a r k e t", "post-market"),
    ("m o n i t o r i n g", "monitoring"),
    ("a c t i v i t i e s", "activities"),
    ("c o l l e c t", "collect"),
    ("r e v i e w", "review"),
    ("e x p e r i e n c e", "experience"),
    ("g a i n e d", "gained"),
    ("i d e n t i f y i n g", "identifying"),
    ("c o r r e c t i v e", "corrective"),
    ("p r e v e n t i v e", "preventive"),
    ("a c t i o n s", "actions"),
    ("s u r v e i l l a n c e", "surveillance"),
    ("fundamen tal", "fundamental"),
    ("r ights", "rights"),
    ("impl ementation", "implementation"),
    ("compl iance", "compliance"),
    ("harmo nised", "harmonised"),
    ("harmo nisation", "harmonisation"),
    ("transfe r", "transfer"),
    ("infras tructure", "infrastructure"),
    ("compe tent", "competent"),
    ("cooper ation", "cooperation"),
    ("liab ility", "liability"),
    ("interm ediary", "intermediary"),
    ("ser vices", "services"),
    ("ser vice", "service"),
    ("publ ication", "publication"),
]

def clean_text(text):
    if not text:
        return text
    
    cleaned = text
    for pattern, replacement in TYPO_MAPPING:
        # Build regex for spacing in between
        pattern_regex = re.escape(pattern).replace(r"\ ", r"\s+")
        reg = re.compile(pattern_regex, re.IGNORECASE)
        
        def repl_func(match):
            m_text = match.group(0)
            if m_text and m_text[0].isupper():
                return replacement[0].upper() + replacement[1:]
            return replacement.lower()
        
        cleaned = reg.sub(repl_func, cleaned)
        
    return cleaned

def main():
    json_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\lib\supabase\ai_act_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Cleaning split-word spacing typos in {len(data)} articles...")
    
    cleaned_count = 0
    for item in data:
        orig_text = item["article_text"]
        orig_title = item["title"]
        orig_verdict = item["compliance_verdict"]
        
        item["article_text"] = clean_text(orig_text)
        item["title"] = clean_text(orig_title)
        item["compliance_verdict"] = clean_text(orig_verdict)
        
        if item["article_text"] != orig_text or item["title"] != orig_title or item["compliance_verdict"] != orig_verdict:
            cleaned_count += 1
            
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Success! Cleaned spelling and spacing typos in {cleaned_count} articles.")

if __name__ == "__main__":
    main()
