import json

json_path = r"c:\Users\kushr\.gemini\antigravity\scratch\tsot\lib\supabase\ai_act_data.json"
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

fallback_count = 0
failures = []
for item in data:
    if "Obligations as defined under Article" in item["compliance_verdict"]:
        fallback_count += 1
        failures.append(int(item["code"].split("-")[-1]))

print(f"Total articles: {len(data)}")
print(f"Fallback count: {fallback_count}")
print(f"Failed articles: {sorted(failures)}")
