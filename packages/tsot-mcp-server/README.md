# @tsot/mcp-server

> Standalone **Model Context Protocol (MCP) Server** providing real-time cognitive research registry queries, EU AI Act compliance auditing, and empirical human-AI interaction benchmarks.

[![npm version](https://img.shields.io/npm/v/@tsot/mcp-server.svg)](https://www.npmjs.com/package/@tsot/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Protocol Version](https://img.shields.io/badge/MCP-1.29.0-blue.svg)](https://modelcontextprotocol.io)

---

## 🌟 Overview

`@tsot/mcp-server` allows AI assistants (Claude Desktop, Cursor, Roo Code, Windsurf, Cline) to query empirical Human-Computer Interaction (HCI) research and audit product designs against the **EU AI Act legislation (Regulation EU 2024/1689)**.

### Key Capabilities

- **📜 EU AI Act Compliance Auditor (`audit_eu_compliance`)**: Evaluates AI system designs against 124 articles of the EU AI Act (Prohibited Practices, High Risk, Limited Risk, Minimal Risk).
- **🔬 HCI Design Optimizer (`optimize_hci_design`)**: Provides empirical recommendations on cognitive offloading, response latencies (e.g. sub-200ms anthropomorphism thresholds), epistemic agency, and friction checkpoints.
- **🛡️ Moat & Dilemma Solver (`query_research_moat`)**: Solves strategic product design trade-offs backed by peer-reviewed research papers and EU regulation articles.
- **🔎 Hybrid Vector & Keyword Search (`search_registry`, `search_ai_act`)**: Fast retrieval of empirical papers and regulation codes.
- **⚡ Offline Zero-Config Fallback**: Ships with embedded seed datasets for full functionality even without database credentials!

---

## 🚀 Quick Start (No Installation Needed)

You can run the server directly using `npx`:

```bash
npx -y @tsot/mcp-server
```

For HTTP / SSE mode:
```bash
npx -y @tsot/mcp-server --http --port 3001
```

---

## 💻 Client Configurations

### 1. Claude Desktop

Add this block to your `claude_desktop_config.json` (located at `%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "tsot": {
      "command": "npx",
      "args": ["-y", "@tsot/mcp-server"],
      "env": {
        "SUPABASE_URL": "optional_your_supabase_url",
        "SUPABASE_ANON_KEY": "optional_your_supabase_key",
        "GEMINI_API_KEY": "optional_your_gemini_key"
      }
    }
  }
}
```

### 2. Cursor / Windsurf / Roo Code / Cline

In your editor MCP settings, configure a Stdio MCP server:

- **Command**: `npx`
- **Args**: `-y @tsot/mcp-server`

---

## 🛠️ Tools Reference

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `audit_eu_compliance` | `prompt` (string) | Audits product design against EU AI Act risk categories and returns cited compliance findings. |
| `optimize_hci_design` | `prompt` (string) | Optimizes UI/UX flows using empirical HCI research papers (cognitive offloading, friction). |
| `query_research_moat` | `query` (string) | Resolves user design dilemmas with cited paper/article evidence. |
| `search_registry` | `query` (string), `pillar?`, `limit?` | Searches the TSOT Empirical Research Ledger. |
| `search_ai_act` | `query` (string), `category?`, `limit?` | Searches 124 articles of the EU AI Act database. |
| `get_record` | `code` (string), `source?` | Fetches full article or research paper by code (`SOT-COMP-2026`, `EU-ACT-ART-5`). |

---

## 📄 Resources & Prompts

### Resources
- `tsot://registry/summary` — Empirical research ledger overview and pillar stats.
- `tsot://ai_act/summary` — EU AI Act regulatory overview.
- `tsot://registry/record/{code}` — Specific research paper record.
- `tsot://ai_act/article/{code}` — Specific EU AI Act article text.

### Prompts
- `adversarial_audit` — Runs a complete multi-pillar adversarial audit for a product description.

---

## 📦 Local Development & Publishing

```bash
# Clone and navigate to package
cd packages/tsot-mcp-server

# Install dependencies
npm install

# Build standalone TypeScript distribution
npm run build

# Test local execution
node dist/index.js

# Publish to npm marketplace
npm publish --access public
```

---

## 📜 License

Distributed under the MIT License.
