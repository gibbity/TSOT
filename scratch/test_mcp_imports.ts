import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

console.log('Imports succeeded! Server constructor:', typeof Server);
console.log('StdioServerTransport constructor:', typeof StdioServerTransport);
console.log('CallToolRequestSchema Schema:', typeof CallToolRequestSchema);
