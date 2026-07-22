import * as fs from 'fs';
import * as path from 'path';

function run() {
  const jsonPath = path.join(process.cwd(), 'lib/supabase/ai_act_data.json');
  if (fs.existsSync(jsonPath)) {
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const articles = JSON.parse(rawData);
    const art = articles.find((a: any) => a.code === 'EU-ACT-ART-11');
    if (art) {
      console.log('=== ARTICLE 11 DETAILS ===');
      console.log(`Code: ${art.code}`);
      console.log(`Title: ${art.title}`);
      console.log(`Category: ${art.category}`);
      console.log(`Risk Level: ${art.risk_level}`);
      console.log('\n--- Official Text ---');
      console.log(art.article_text);
      console.log('\n--- Compliance Verdict & Audit ---');
      console.log(art.compliance_verdict);
    } else {
      console.log('Article 11 not found.');
    }
  } else {
    console.log('Local JSON file not found.');
  }
}

run();
