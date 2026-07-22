import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { DbProvider } from './db.js';
import { ServerConfig } from './types.js';
import { SEED_RECORDS, SEED_AI_ACT_RECORDS } from './seed_data.js';

export function createMcpServer(config: ServerConfig = {}): Server {
  const db = new DbProvider(config);

  const server = new Server(
    {
      name: 'tsot-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {},
      },
    }
  );

  // List Tools Handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'audit_eu_compliance',
          description: 'Check if a product design or feature description complies with the EU AI Act regulations. Returns specific article alignments, risk classifications, and compliance verdicts.',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'A detailed description of the AI product features, risk areas, or data collection practices to check against regulations.'
              }
            },
            required: ['prompt']
          }
        },
        {
          name: 'optimize_hci_design',
          description: 'Analyze an AI product interface design and see how it can be optimized using the TSOT Empirical HCI Research Ledger (Cognitive Offloading, Latencies, Friction, Epistemic Agency, etc.).',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'A detailed description of the user interface flow, response latency, conversational turns, or automation features to optimize.'
              }
            },
            required: ['prompt']
          }
        },
        {
          name: 'query_research_moat',
          description: 'Answer user queries or solve design dilemmas using findings from the TSOT HCI Research Ledger and EU AI Act compliance articles. Tells the user the best possible action and trade-offs.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The user question, design dilemma, or compliance query.'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'search_registry',
          description: 'Search the TSOT HCI Research Ledger (human-AI interaction guidelines, automation bias, cognitive offloading, response latencies, etc.) using hybrid semantic search and keyword fallback.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search text or keyword query.'
              },
              pillar: {
                type: 'string',
                enum: ['COGNITIVE OFFLOADING', 'FRICTION & VERIFICATION', 'TEMPORAL PERCEPTION', 'EPISTEMIC AGENCY', 'ALL'],
                description: 'Filter results by a specific TSOT research pillar.'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of records to return (default is 20).'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'search_ai_act',
          description: 'Search the EU AI Act compliance articles and regulations using hybrid semantic search and keyword fallback.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search text or keyword query.'
              },
              category: {
                type: 'string',
                enum: ['PROHIBITED PRACTICE', 'HIGH RISK', 'LIMITED RISK', 'MINIMAL RISK', 'ALL'],
                description: 'Filter results by EU AI Act risk category/pillar.'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of articles to return (default is 20).'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'get_record',
          description: 'Fetch detailed content of a single research ledger paper or EU AI Act article by its unique code (e.g. SOT-COMP-2026 or EU-ACT-ART-5).',
          inputSchema: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'The code of the record to fetch.'
              },
              source: {
                type: 'string',
                enum: ['corpus', 'ai_act', 'both'],
                description: 'Database table source to query (default is "both").'
              }
            },
            required: ['code']
          }
        }
      ]
    };
  });

  // Call Tool Handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'audit_eu_compliance') {
        const promptText = (args?.prompt as string) || '';
        const auditText = await db.auditEuCompliance(promptText);
        return {
          content: [
            {
              type: 'text',
              text: auditText
            }
          ]
        };
      }

      if (name === 'optimize_hci_design') {
        const promptText = (args?.prompt as string) || '';
        const optText = await db.optimizeHciDesign(promptText);
        return {
          content: [
            {
              type: 'text',
              text: optText
            }
          ]
        };
      }

      if (name === 'query_research_moat') {
        const queryText = (args?.query as string) || '';
        const answerText = await db.queryResearchMoat(queryText);
        return {
          content: [
            {
              type: 'text',
              text: answerText
            }
          ]
        };
      }

      if (name === 'search_registry') {
        const queryText = (args?.query as string) || '';
        const pillar = (args?.pillar as string) || 'ALL';
        const limit = Number(args?.limit) || 20;

        const results = await db.searchRegistry(queryText, pillar, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      if (name === 'search_ai_act') {
        const queryText = (args?.query as string) || '';
        const category = (args?.category as string) || 'ALL';
        const limit = Number(args?.limit) || 20;

        const results = await db.searchAiAct(queryText, category, limit);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      }

      if (name === 'get_record') {
        const code = (args?.code as string) || '';
        const source = (args?.source as 'corpus' | 'ai_act' | 'both') || 'both';

        const record = await db.getRecord(code, source);
        if (!record) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Record with code "${code}" was not found.`
              }
            ]
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(record, null, 2)
            }
          ]
        };
      }

      throw new Error(`Unknown tool name: "${name}"`);
    } catch (err: any) {
      console.error(`Error executing tool "${name}":`, err);
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Tool execution failed: ${err.message || String(err)}`
          }
        ]
      };
    }
  });

  // List Resources Handler
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'tsot://registry/summary',
          name: 'TSOT HCI Research Registry Ledger Summary',
          description: 'Summary metrics and active empirical research guidelines for human-AI interaction.',
          mimeType: 'application/json'
        },
        {
          uri: 'tsot://ai_act/summary',
          name: 'EU AI Act Regulatory Ledger Summary',
          description: 'Overview of EU AI Act compliance articles and risk classification breakdown.',
          mimeType: 'application/json'
        }
      ]
    };
  });

  // Read Resource Handler
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      if (uri === 'tsot://registry/summary') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                ledger: 'TSOT HCI Research Ledger',
                records_count: SEED_RECORDS.length,
                pillars: ['COGNITIVE OFFLOADING', 'FRICTION & VERIFICATION', 'TEMPORAL PERCEPTION', 'EPISTEMIC AGENCY']
              }, null, 2)
            }
          ]
        };
      }

      if (uri === 'tsot://ai_act/summary') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                ledger: 'EU AI Act Regulation Ledger',
                articles_count: SEED_AI_ACT_RECORDS.length,
                risk_categories: ['PROHIBITED PRACTICE', 'HIGH RISK', 'LIMITED RISK', 'MINIMAL RISK']
              }, null, 2)
            }
          ]
        };
      }

      if (uri.startsWith('tsot://registry/record/')) {
        const code = uri.replace('tsot://registry/record/', '');
        const record = await db.getRecord(code, 'corpus');
        if (!record) throw new Error(`Record with code "${code}" not found`);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(record, null, 2)
            }
          ]
        };
      }

      if (uri.startsWith('tsot://ai_act/article/')) {
        const code = uri.replace('tsot://ai_act/article/', '');
        const record = await db.getRecord(code, 'ai_act');
        if (!record) throw new Error(`AI Act article with code "${code}" not found`);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(record, null, 2)
            }
          ]
        };
      }

      throw new Error(`Unsupported resource URI: ${uri}`);
    } catch (err: any) {
      console.error(`Error reading resource "${uri}":`, err);
      throw err;
    }
  });

  // List Prompts Handler
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: [
        {
          name: 'adversarial_audit',
          description: 'Generate an adversarial human-AI interaction audit for a product design description.',
          arguments: [
            {
              name: 'product_description',
              description: 'A detailed description of the AI product features.',
              required: true
            },
            {
              name: 'source',
              description: 'Context ledger source to query (corpus, ai_act, or both).',
              required: false
            }
          ]
        }
      ]
    };
  });

  // Get Prompt Handler
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'adversarial_audit') {
      const productDescription = (args?.product_description as string) || '';
      const src = (args?.source as string) || 'both';

      return {
        description: 'Audit a product design against the TSOT research registry and EU AI Act compliance database.',
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please run a TSOT Adversarial Audit using the audit_eu_compliance tool.\nProduct Description:\n${productDescription}\n\nSource ledger context: ${src}`
            }
          }
        ]
      };
    }

    throw new Error(`Unsupported prompt name: "${name}"`);
  });

  return server;
}
