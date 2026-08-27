import { DbProvider } from './src/db.js';

async function runAnalysis() {
  const db = new DbProvider({});
  console.log("=== TSOT MCP SERVER ANALYSIS OF SCRIBE ===\n");

  const scribeProductPrompt = `
  Scribe (Oracle Lens) is an executive AI strategic cockpit and non-linear roadmap synthesis platform.
  Features:
  1. Adversarial AI Synthesis Engine: Automatically synthesizes strategic inputs (PRDs, specs, roadmaps) across 30+ specialized AI personas (Risk Auditor, Competitor Strategist, Financial Modeling Agent, etc.).
  2. Spatial HUD / GigaMap: Topographic D3/ReactFlow canvas with fixed Pillar columns (300px), snap-grids (40px), and zoom scales (0.04x to 4.0x) for structural spatial navigation.
  3. Dynamic Node Classification: Classifies nodes into RISK (#ef4444), CRITIQUE (#f97316), and OPPORTUNITY (#22c55e).
  4. Local & Cloud Storage: IndexedDB for client offline persistence + Supabase backend for synchronized graph state.
  5. Automated Strategic Decision Support: Provides AI-generated strategic pivots, vulnerability alerts, and non-linear roadmapping for C-suite and Product Managers.
  `;

  console.log("--- 1. EU AI ACT COMPLIANCE AUDIT ---");
  const euAudit = await db.auditEuCompliance(scribeProductPrompt);
  console.log(euAudit);

  console.log("\n--- 2. HCI DESIGN OPTIMIZATION ---");
  const hciOpt = await db.optimizeHciDesign(scribeProductPrompt);
  console.log(hciOpt);

  console.log("\n--- 3. STRATEGIC RESEARCH MOAT QUERY ---");
  const moatQuery = await db.queryResearchMoat(
    "How does Scribe balance automated strategic AI synthesis with maintaining epistemic agency and avoiding automation bias for executive decision-makers?"
  );
  console.log(moatQuery);

  console.log("\n--- 4. SEARCH REGISTRY (Cognitive Offloading & Epistemic Agency) ---");
  const regResults = await db.searchRegistry("cognitive offloading epistemic agency automation bias", "ALL", 5);
  console.log(JSON.stringify(regResults, null, 2));

  console.log("\n--- 5. SEARCH EU AI ACT (High-Risk AI Systems & Transparency) ---");
  const actResults = await db.searchAiAct("management decision making high risk transparency technical documentation", "ALL", 5);
  console.log(JSON.stringify(actResults, null, 2));
}

runAnalysis().catch(err => {
  console.error("Error running TSOT analysis:", err);
  process.exit(1);
});
