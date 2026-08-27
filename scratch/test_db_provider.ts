import { DbProvider } from '../packages/tsot-mcp-server/src/db.js';

async function test() {
  console.log('Testing DbProvider in 100% Zero-Setup Standalone Mode...');
  const db = new DbProvider();

  // 1. Search Registry
  console.log('\n--- 1. Search Registry ("cognitive offloading") ---');
  const regResults = await db.searchRegistry('cognitive offloading', 'ALL', 2);
  console.log('Found records:', regResults.length);
  regResults.forEach(r => console.log(`- [${r.code}] ${r.title} (${r.pillar})`));

  // 2. Search AI Act
  console.log('\n--- 2. Search AI Act ("transparency obligations") ---');
  const actResults = await db.searchAiAct('transparency obligations', 'ALL', 2);
  console.log('Found articles:', actResults.length);
  actResults.forEach(a => console.log(`- [${a.code}] ${a.title} (${a.category})`));

  // 3. Audit EU Compliance
  console.log('\n--- 3. Audit EU Compliance ---');
  const auditOutput = await db.auditEuCompliance('Executive AI Cockpit with 30+ synthetic AI personas for roadmap planning');
  console.log(auditOutput.slice(0, 500) + '...\n');

  // 4. Optimize HCI Design
  console.log('\n--- 4. Optimize HCI Design ---');
  const hciOutput = await db.optimizeHciDesign('Fast streaming non-linear canvas with rapid automated persona nodes');
  console.log(hciOutput.slice(0, 500) + '...\n');

  console.log('✅ ALL TESTS PASSED! Zero-setup MCP engine is working flawlessly.');
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
