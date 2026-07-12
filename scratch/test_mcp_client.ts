import { spawn } from 'child_process';
import * as path from 'path';

async function runTest() {
  console.log('🚀 Starting MCP Server Test Client...');

  // Resolve absolute paths
  const serverPath = path.resolve(__dirname, 'mcp_server.ts');
  const envPath = path.resolve(__dirname, '../.env.local');

  // Spawn the server process running tsx
  const child = spawn('npx', ['tsx', '--env-file=' + envPath, serverPath], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
  });

  let responseResolver: ((value: any) => void) | null = null;
  let buffer = '';

  child.stdout.on('data', (data) => {
    buffer += data.toString();
    
    // Split messages by newline since JSON-RPC over stdio uses newline delimiters
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

    for (const line of lines) {
      if (line.trim() === '') continue;
      try {
        const message = JSON.parse(line);
        console.log(`📥 RECEIVED RESPONSE (id: ${message.id}):`, JSON.stringify(message, null, 2).slice(0, 500) + (line.length > 500 ? '...' : ''));
        if (responseResolver) {
          responseResolver(message);
        }
      } catch (err) {
        console.error('⚠️ Failed to parse incoming message line:', line, err);
      }
    }
  });

  const sendRequest = (method: string, params: any, id: number): Promise<any> => {
    return new Promise((resolve) => {
      responseResolver = resolve;
      const request = {
        jsonrpc: '2.0',
        method,
        id,
        params
      };
      const reqString = JSON.stringify(request) + '\n';
      console.log(`📤 SENDING REQUEST (id: ${id}, method: ${method})...`);
      child.stdin.write(reqString);
    });
  };

  const sendNotification = (method: string, params?: any) => {
    const notification = {
      jsonrpc: '2.0',
      method,
      params
    };
    console.log(`📤 SENDING NOTIFICATION (${method})...`);
    child.stdin.write(JSON.stringify(notification) + '\n');
  };

  try {
    // 1. Handshake Step 1: Initialize
    const initRes = await sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'tsot-test-client', version: '1.0.0' }
    }, 1);

    // 2. Handshake Step 2: Initialized Notification
    sendNotification('notifications/initialized');

    // Wait a brief moment
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. List Tools
    await sendRequest('tools/list', {}, 2);

    // 4. Call search_registry
    await sendRequest('tools/call', {
      name: 'search_registry',
      arguments: {
        query: 'cognitive offloading',
        limit: 2
      }
    }, 3);

    // 5. Call search_ai_act
    await sendRequest('tools/call', {
      name: 'search_ai_act',
      arguments: {
        query: 'prohibited practices',
        limit: 2
      }
    }, 4);

    // 6. Call get_record
    await sendRequest('tools/call', {
      name: 'get_record',
      arguments: {
        code: 'SOT-COMP-2026',
        source: 'corpus'
      }
    }, 5);

    // 7. Call audit_eu_compliance
    await sendRequest('tools/call', {
      name: 'audit_eu_compliance',
      arguments: {
        prompt: 'We are building an agentic conversational assistant with response latency under 150ms that guides the user and summarizes all daily tasks automatically.'
      }
    }, 6);

    // 7.1. Call optimize_hci_design
    await sendRequest('tools/call', {
      name: 'optimize_hci_design',
      arguments: {
        prompt: 'We are building an agentic conversational assistant with response latency under 150ms that guides the user and summarizes all daily tasks automatically.'
      }
    }, 10);

    // 7.2. Call query_research_moat
    await sendRequest('tools/call', {
      name: 'query_research_moat',
      arguments: {
        query: 'What is the optimal latency delay to avoid anthropomorphic turn-taking confusion?'
      }
    }, 11);

    // 8. List Resources
    await sendRequest('resources/list', {}, 7);

    // 9. Read Resource
    await sendRequest('resources/read', {
      uri: 'tsot://registry/summary'
    }, 8);

    // 10. List Prompts
    await sendRequest('prompts/list', {}, 9);

    console.log('✅ All requests completed. Tearing down server...');
  } catch (err) {
    console.error('❌ Error during testing:', err);
  } finally {
    child.stdin.end();
    child.kill();
    console.log('👋 Test client exited.');
  }
}

runTest().catch(err => {
  console.error('Unhandled runTest error:', err);
});
