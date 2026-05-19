import { fetchPapersFromOpenAlex } from '../lib/openalex/fetch';
import { ingestPapersBatch } from '../lib/gemini/ingest';

async function run() {
  console.log('Starting ingestion dry run/test...');
  console.log('Using GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'undefined');
  console.log('Using OPENALEX_API_KEY:', process.env.OPENALEX_API_KEY ? process.env.OPENALEX_API_KEY.substring(0, 5) + '...' : 'undefined');

  const query = 'human AI interaction cognitive load';
  console.log(`\n1. Fetching papers from OpenAlex for query: "${query}"...`);
  
  try {
    const rawPapers = await fetchPapersFromOpenAlex(query, 5);
    console.log(`Fetched ${rawPapers.length} papers from OpenAlex.`);
    if (rawPapers.length === 0) {
      console.log('No papers found.');
      return;
    }

    console.log('\nFirst paper found:');
    console.log('Title:', rawPapers[0].title);
    console.log('Abstract snippet:', rawPapers[0].abstract ? rawPapers[0].abstract.substring(0, 150) + '...' : 'no abstract');

    console.log('\n2. Ingesting and summarizing first 2 papers via Gemini...');
    const batch = rawPapers.slice(0, 2);
    const results = await ingestPapersBatch(batch);
    
    console.log(`Gemini processed ${results.length} papers.`);
    console.log('Results:', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('Ingestion test failed:', error);
  }
}

run();
