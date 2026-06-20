

async function testPipeline(prompt: string, label: string) {
  console.log(`\n======================================================`);
  console.log(`TEST: ${label}`);
  console.log(`Prompt: "${prompt}"`);
  console.log(`======================================================`);

  try {
    const res = await fetch('http://localhost:3000/api/auditor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        tier: 'pro',
        source: 'both'
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ Request failed: ${res.status} - ${text}`);
      return;
    }

    console.log('Headers returned:');
    console.log(`- X-Session-Remaining: ${res.headers.get('x-session-remaining')}`);
    console.log(`- X-Audit-Confidence: ${res.headers.get('x-audit-confidence')}`);
    const citationsHeader = res.headers.get('x-audit-citations');
    if (citationsHeader) {
      try {
        const citations = JSON.parse(decodeURIComponent(citationsHeader));
        console.log(`- Retrieved ${citations.length} citations:`, citations.map((c: any) => c.code).join(', '));
      } catch (e) {
        console.log('- Citation header could not be parsed');
      }
    }

    console.log('\nStreamed Output:');
    const body = res.body;
    if (!body) {
      console.error('❌ Stream response body is empty');
      return;
    }

    const reader = (body as any).getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        process.stdout.write(decoder.decode(value, { stream: true }));
      }
    }
    console.log('\n✅ Stream finished.');
  } catch (err: any) {
    console.error('❌ Request error:', err.message || err);
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  // Test 1: A normal product description with good RAG coverage
  await testPipeline(
    "We are building a collaborative writing tool where an AI agent autocompletes text every 100ms and has simulated friendly emotions to encourage the writer.",
    "Normal RAG Audit"
  );

  console.log('\n💤 Sleeping 25 seconds to cool down rate limits...');
  await wait(25000);

  // Test 2: Out of scope request (Scope Gate)
  await testPipeline(
    "How do I diagnose tuberculosis based on a chest X-ray image?",
    "Out of Scope (Medical)"
  );

  console.log('\n💤 Sleeping 25 seconds to cool down rate limits...');
  await wait(25000);

  // Test 3: Vague request (Vagueness Gate)
  await testPipeline(
    "chat app",
    "Vague Query"
  );
}

run();
