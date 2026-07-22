import 'dotenv/config';
import express from 'express';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createMcpServer } from './server.js';

export async function runCli() {
  const args = process.argv.slice(2);
  const isHttp = args.includes('--http');
  const portIndex = args.indexOf('--port');
  const port = portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1], 10) : parseInt(process.env.PORT || '3001', 10);

  const server = createMcpServer();

  if (isHttp) {
    const app = express();
    let sseTransport: SSEServerTransport | null = null;

    app.get('/sse', async (req, res) => {
      console.log('New SSE connection established.');
      sseTransport = new SSEServerTransport('/message', res);
      await server.connect(sseTransport);
    });

    app.post('/message', async (req, res) => {
      if (sseTransport) {
        await sseTransport.handlePostMessage(req, res);
      } else {
        res.status(400).send('No active SSE connection found.');
      }
    });

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', name: 'tsot-mcp-server', version: '1.0.0' });
    });

    app.listen(port, () => {
      console.log(`TSOT MCP Server running on HTTP SSE mode at http://localhost:${port}`);
      console.log(`- SSE Endpoint: http://localhost:${port}/sse`);
      console.log(`- POST Endpoint: http://localhost:${port}/message`);
    });
  } else {
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error('TSOT MCP Server running on stdio');
  }
}
