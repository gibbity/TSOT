import urllib.request
import json
import os

api_key = "AIzaSyBkbPjvSMuFQpqMNptBngaiS3baunruoTI"  # from .env.local
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

payload = {
    "contents": [{
        "parts": [{
            "text": "Hello, write a 3 word greeting."
        }]
    }]
}

headers = {
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        print("Response:")
        print(res_data['candidates'][0]['content']['parts'][0]['text'])
except Exception as e:
    print(f"Error: {e}")
