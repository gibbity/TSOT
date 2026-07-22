import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('Testing Standalone TSOT MCP Server...');
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./packages/tsot-mcp-server/bin/cli.js']
  });

  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log('✅ Client connected to standalone MCP server via stdio!');

  // Test List Tools
  const tools = await client.listTools();
  console.log(`✅ Tools discovered (${tools.tools.length}):`, tools.tools.map(t => t.name).join(', '));

  // Test List Resources
  const resources = await client.listResources();
  console.log(`✅ Resources discovered (${resources.resources.length}):`, resources.resources.map(r => r.uri).join(', '));

  // Test Tool Call: search_ai_act
  console.log('\nTesting tool call search_ai_act ("prohibited")...');
  const actRes = await client.callTool({
    name: 'search_ai_act',
    arguments: { query: 'prohibited', limit: 2 }
  });
  console.log('Result sample:', (actRes.content as any)[0]?.text?.slice(0, 300));

  // Test Tool Call: audit_eu_compliance
  console.log('\nTesting tool call audit_eu_compliance...');
  const auditRes = await client.callTool({
    name: 'audit_eu_compliance',
    arguments: { prompt: 'A facial recognition system for tracking crowds in public spaces.' }
  });
  console.log('Audit sample:', (auditRes.content as any)[0]?.text?.slice(0, 300));

  await client.close();
  console.log('\n🎉 Standalone MCP Server verification complete!');
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
