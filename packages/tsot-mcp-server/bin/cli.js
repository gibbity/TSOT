#!/usr/bin/env node

import('../dist/cli.js').then((module) => {
  return module.runCli();
}).catch((err) => {
  console.error('Failed to start TSOT MCP Server CLI:', err);
  process.exit(1);
});
