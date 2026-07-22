export { createMcpServer } from './server.js';
export { DbProvider } from './db.js';
export { SEED_RECORDS, SEED_AI_ACT_RECORDS } from './seed_data.js';
export * from './types.js';

import { runCli } from './cli.js';

// If executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cli.js') || process.argv[1]?.endsWith('index.js')) {
  runCli().catch((err) => {
    console.error('Fatal error in TSOT MCP Server CLI:', err);
    process.exit(1);
  });
}
