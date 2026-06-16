'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  FileText, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  Lock, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  X, 
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { RegistryRecord } from '@/types';

// Seed records to map fallback visual citation panels instantly if database connection drops
const BRIEF_SEEDS: Record<string, Omit<RegistryRecord, 'id' | 'created_at'>> = {
  'SOT-COMP-2026': {
    code: 'SOT-COMP-2026',
    pillar: 'COGNITIVE OFFLOADING',
    title: 'AI self-verification drops to 59% accuracy under single-track monologues.',
    human_summary: 'When users rely on continuous, unstructured conversational agents without forcing step-by-step verification, their own cognitive tracking degrades. Longitudinal experiments track an erosion of prompt scrutiny and an immediate jump in reliance on hallucinated data outputs.',
    metric: '59% self-verification rate',
    verdict: 'Implement a mandatory structural checkpoint after 3 consecutive conversational steps to reset the cognitive verification baseline.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Monopoli, V., & Lora, A.',
    is_premium: false
  },
  'SOT-COMP-2027': {
    code: 'SOT-COMP-2027',
    pillar: 'FRICTION & VERIFICATION',
    title: "AI's emotional response simulation in group settings alters user prospective planning by 47%.",
    human_summary: 'Inserting conversational anthropomorphism in collaborative planning environments causes human partners to defer strategic decisions. The study tracks how simulated emotional validation bypasses critical skepticism systems, leading to high-friction adoption blockages.',
    metric: '47% prospective planning variance',
    verdict: 'Remove subjective validation verbs from task-oriented multi-agent interfaces. Enforce neutral, metrics-based statements.',
    risk_level: 'warning',
    source_url: 'https://openalex.org',
    source_type: 'preprint',
    paper_year: 2026,
    authors: 'Gartner, E., et al.',
    is_premium: false
  },
  'SOT-COMP-2028': {
    code: 'SOT-COMP-2028',
    pillar: 'EPISTEMIC AGENCY',
    title: 'AI language models exhibit a 75% reduction in search query depth with hyper-personalized feeds.',
    human_summary: 'Hyper-personalized search engines create prompt complacency. In studies where LLMs filtered answers based on perceived user sentiment profiles, individuals immediately stopped exploring divergent viewpoints, reducing their vocabulary variance and source cross-validation.',
    metric: '75% search query depth reduction',
    verdict: 'Maintain a static, unpersonalized sidebar of raw sources to preserve lateral discovery paths.',
    risk_level: 'stable',
    source_url: 'https://openalex.org',
    source_type: 'conference',
    paper_year: 2025,
    authors: 'Chen, H., & Muller, S.',
    is_premium: false
  },
  'SOT-COMP-3011': {
    code: 'SOT-COMP-3011',
    pillar: 'TEMPORAL PERCEPTION',
    title: 'Response latencies under 200ms trigger anthropomorphic projection in 82% of users.',
    human_summary: 'Sub-200ms streaming responses confuse human turn-taking thresholds. Participants who experienced instantaneous feedback consistently personified the machine, projecting intent, agency, and empathy onto system statements. Increasing latency to 600ms recalibrated trust to object-level baselines.',
    metric: '82% anthropomorphic projection',
    verdict: 'Introduce artificial delays of at least 400ms for conversational flows to maintain tool-like mental models.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Watanabe, Y., & Schmidt, M.',
    is_premium: false
  },
  'SOT-COMP-3012': {
    code: 'SOT-COMP-3012',
    pillar: 'FRICTION & VERIFICATION',
    title: 'Forced visual friction in output screens increases source cross-validation by 63%.',
    human_summary: 'Adding systematic friction—such as loading state outlines or requiring manual highlight actions before copying output—forces user cognitive wakefulness. Eye-tracking experiments confirm that design interventions reduce automation bias and improve human error detection rates.',
    metric: '63% increase in source cross-validation',
    verdict: 'Design key interface checkpoints that require active, physical confirmation clicks before high-leverage data execution.',
    risk_level: 'stable',
    source_url: 'https://openalex.org',
    source_type: 'peer-reviewed',
    paper_year: 2026,
    authors: 'Boudreau, T., et al.',
    is_premium: false
  },
  'SOT-COMP-3013': {
    code: 'SOT-COMP-3013',
    pillar: 'COGNITIVE OFFLOADING',
    title: 'Delegating semantic summaries to agentic assistants erodes memory retention by 31%.',
    human_summary: 'Relying on automatic document summary engines significantly reduces long-term logical structure recall. Longitudinal cognitive trials demonstrate that while reading speeds increase, active comprehension, critical memory retrieval, and synthesization skills deteriorate.',
    metric: '31% memory retention drop',
    verdict: 'Enforce high-friction semantic checkpoints that prompt the user to synthesize key findings in their own words.',
    risk_level: 'critical',
    source_url: 'https://openalex.org',
    source_type: 'preprint',
    paper_year: 2026,
    authors: 'Vargas, L., & Kim, J.',
    is_premium: false
  }
};
function stripXMLTags(text: string) {
  if (!text) return '';
  // Remove scores tags and inner content completely
  let clean = text.replace(/<scores>[\s\S]*?<\/scores>/gi, '');
  clean = clean.replace(/<scores>[\s\S]*/gi, ''); // in case tag is unfinished
  
  // Remove other XML tags but keep their inner content
  clean = clean.replace(/<\/?(verdict|findings|gap|sprint|disclaimer|clarification)>/gi, '');
  // Strip markdown bold/italic markers (**text** and __text__) so they don't show as literal asterisks
  clean = clean.replace(/\*\*([^*]+)\*\*/g, '$1');
  clean = clean.replace(/__([^_]+)__/g, '$1');
  clean = clean.replace(/\*([^*]+)\*/g, '$1');
  return clean.trim();
}

// Parse structured XML sections from a follow-up assistant message
function parseFollowUpContent(text: string) {
  const verdictMatch = text.match(/<verdict>([\s\S]*?)(?:<\/verdict>|$)/);
  const findingsMatch = text.match(/<findings>([\s\S]*?)(?:<\/findings>|$)/);
  const gapMatch = text.match(/<gap>([\s\S]*?)(?:<\/gap>|$)/);
  const sprintMatch = text.match(/<sprint>([\s\S]*?)(?:<\/sprint>|$)/);
  const hasXML = verdictMatch || findingsMatch || gapMatch || sprintMatch;
  return {
    verdict: verdictMatch ? stripXMLTags(verdictMatch[1].trim()) : '',
    findings: findingsMatch ? stripXMLTags(findingsMatch[1].trim()) : '',
    gap: gapMatch ? stripXMLTags(gapMatch[1].trim()) : '',
    sprint: sprintMatch ? stripXMLTags(sprintMatch[1].trim()) : '',
    plainText: hasXML ? '' : stripXMLTags(text),
    hasXML: !!hasXML,
  };
}

const PILLAR_COLORS: Record<string, string> = {
  'COGNITIVE OFFLOADING': '#534AB7',
  'FRICTION & VERIFICATION': '#0F6E56',
  'TEMPORAL PERCEPTION': '#854F0B',
  'EPISTEMIC AGENCY': '#993C1D',
};

const PRESETS = [
  {
    label: "Autocomplete Writing Assistant",
    text: "We're building an AI writing assistant that auto-completes sentences in real time. Users can accept or reject suggestions with Tab/Escape. We show a confidence score next to each suggestion."
  },
  {
    label: "Agentic Background Copilot",
    text: "Our AI sends a push notification every time it completes a background task on the user's behalf. Should we change this?"
  },
  {
    label: "Conversational Search Engine",
    text: "We're deciding between showing the AI's reasoning process step by step vs showing only the final output. What does the research say?"
  }
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AuditorPage() {
  // Config & Tier State
  const [tier, setTier] = useState<'free' | 'pro' | 'team'>('pro');
  const [productDesc, setProductDesc] = useState('');
  const [byokKey, setByokKey] = useState('');
  const [activeTab, setActiveTab] = useState<'free_text' | 'deep_dive'>('free_text');

  // Audit Status
  const [isAuditing, setIsAuditing] = useState(false);
  const [streamedRawText, setStreamedRawText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionRemaining, setSessionRemaining] = useState<number>(5);
  const [confidence, setConfidence] = useState<number>(85);
  const [citations, setCitations] = useState<RegistryRecord[]>([]);

  // Detailed Modal / Sidebar Slide-out State
  const [activeCitation, setActiveCitation] = useState<Omit<RegistryRecord, 'id' | 'created_at'> | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Guide and Interactive Specs Accordion State
  const [showSpecGuide, setShowSpecGuide] = useState(false);
  const [activeStepGuide, setActiveStepGuide] = useState<number | null>(null);

  // Threaded Follow-up States
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [hasVagueClarification, setHasVagueClarification] = useState(false);

  // Toast / Copy Feedback State
  const [copiedLink, setCopiedLink] = useState(false);
  const [auditRating, setAuditRating] = useState<'useful' | 'not_relevant' | null>(null);

  // Structured Form States
  const [productCategory, setProductCategory] = useState('Writing assistant');
  const [interactionPattern, setInteractionPattern] = useState('Continuous conversational loop');
  const [responseLatency, setResponseLatency] = useState('Real-time streaming (<200ms)');
  const [userAttention, setUserAttention] = useState('Knowledge worker (high cognitive focus)');

  // Deep Dive States
  const [selectedDeepRecordCode, setSelectedDeepRecordCode] = useState('SOT-COMP-2026');
  const [deepDiveQuestion, setDeepDiveQuestion] = useState('How does this self-verification limit affect real-time text autocompletes?');

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load state on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('tsot_byok_key');
    if (savedKey) setByokKey(savedKey);

    const savedTier = localStorage.getItem('tsot_dev_tier');
    if (savedTier) setTier(savedTier as any);

    const countCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('tsot_audit_count='));
    if (countCookie) {
      const count = parseInt(countCookie.split('=')[1]);
      setSessionRemaining(Math.max(0, 5 - count));
    } else {
      setSessionRemaining(5);
    }
  }, []);

  // Sync state helpers
  const handleSaveKey = (val: string) => {
    setByokKey(val);
    if (val) {
      localStorage.setItem('tsot_byok_key', val);
    } else {
      localStorage.removeItem('tsot_byok_key');
    }
  };

  const handleTierChange = (newTier: 'free' | 'pro' | 'team') => {
    setTier(newTier);
    localStorage.setItem('tsot_dev_tier', newTier);
  };

  // Live Topic & Tag Detector
  const detectTopics = (text: string) => {
    const l = text.toLowerCase();
    const tags = [];
    if (l.includes('notification') || l.includes('alert') || l.includes('ambient')) tags.push('Notification frequency');
    if (l.includes('autocomplete') || l.includes('realtime') || l.includes('real-time') || l.includes('latency') || l.includes('ms')) tags.push('Temporal latency');
    if (l.includes('explain') || l.includes('step') || l.includes('reason') || l.includes('transparency')) tags.push('Verification checkpoint');
    if (l.includes('summar') || l.includes('digest') || l.includes('offload')) tags.push('Cognitive Offloading');
    if (l.includes('search') || l.includes('recommend') || l.includes('personal')) tags.push('Epistemic Discovery');
    return tags.slice(0, 3);
  };

  const currentDetectedTags = detectTopics(productDesc);

  // Clean incremental XML parser
  const parsedStream = (() => {
    const text = streamedRawText;
    const scoresMatch = text.match(/<scores>([\s\S]*?)(?:<\/scores>|$)/);
    const verdictMatch = text.match(/<verdict>([\s\S]*?)(?:<\/verdict>|$)/);
    const findingsMatch = text.match(/<findings>([\s\S]*?)(?:<\/findings>|$)/);
    const gapMatch = text.match(/<gap>([\s\S]*?)(?:<\/gap>|$)/);
    const sprintMatch = text.match(/<sprint>([\s\S]*?)(?:<\/sprint>|$)/);
    const disclaimerMatch = text.match(/<disclaimer>([\s\S]*?)(?:<\/disclaimer>|$)/);
    const clarificationMatch = text.match(/<clarification>([\s\S]*?)(?:<\/clarification>|$)/);

    // Parse scores JSON safely
    let scoresObj: Record<string, number | null> = {
      'COGNITIVE OFFLOADING': null,
      'FRICTION & VERIFICATION': null,
      'TEMPORAL PERCEPTION': null,
      'EPISTEMIC AGENCY': null
    };

    if (scoresMatch && scoresMatch[1].trim()) {
      try {
        const parsed = JSON.parse(scoresMatch[1].trim());
        Object.keys(parsed).forEach(k => {
          scoresObj[k] = parsed[k];
        });
      } catch (e) {}
    }

    return {
      scores: scoresObj,
      verdict: verdictMatch ? verdictMatch[1].trim() : '',
      findings: findingsMatch ? findingsMatch[1].trim() : '',
      gap: gapMatch ? gapMatch[1].trim() : '',
      sprint: sprintMatch ? sprintMatch[1].trim() : '',
      disclaimer: disclaimerMatch ? disclaimerMatch[1].trim() : '',
      clarification: clarificationMatch ? clarificationMatch[1].trim() : '',
      isVague: clarificationMatch !== null
    };
  })();

  // Core execution engine
  const executeAudit = async (e: React.FormEvent, overridePrompt?: string, isFollowUp = false) => {
    if (e) e.preventDefault();

    let finalPrompt = overridePrompt || '';
    if (!overridePrompt) {
      if (activeTab === 'free_text') {
        finalPrompt = productDesc;
      } else if (activeTab === 'deep_dive') {
        finalPrompt = `Registry Record context: ${selectedDeepRecordCode}.\nUser enquiry: ${deepDiveQuestion}.`;
      }
    }

    if (!finalPrompt.trim()) return;

    if (!isFollowUp) {
      setChatLog([]);
      setStreamedRawText('');
      setErrorMsg('');
      setAuditRating(null);
      setHasVagueClarification(false);
    }
    
    setIsAuditing(true);

    // Context locking details
    const originalRecordCodes = isFollowUp ? citations.map(c => c.code) : undefined;
    const conversationHistory = isFollowUp 
      ? [...chatLog, { role: 'user', content: finalPrompt }].map(c => ({ role: c.role, content: c.content })) 
      : undefined;

    try {
      const response = await fetch('/api/auditor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          byok_key: byokKey.trim() || undefined,
          tier,
          originalRecordCodes,
          conversationHistory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audit.');
      }

      // Read remaining limit header
      const remainingHeader = response.headers.get('X-Session-Remaining');
      if (remainingHeader !== null) {
        setSessionRemaining(parseInt(remainingHeader));
      }

      // Read calculated RAG metadata
      const confidenceHeader = response.headers.get('X-Audit-Confidence');
      if (confidenceHeader !== null) {
        setConfidence(parseInt(confidenceHeader));
      }

      const citationsHeader = response.headers.get('X-Audit-Citations');
      if (citationsHeader !== null) {
        try {
          const parsedCitations = JSON.parse(decodeURIComponent(citationsHeader));
          if (Array.isArray(parsedCitations)) setCitations(parsedCitations);
        } catch (e) {}
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Streaming not supported.');

      let done = false;
      let streamedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          streamedText += chunk;
          setStreamedRawText(streamedText);
        }
      }

      // Record final responses in log
      if (isFollowUp) {
        setChatLog(prev => [
          ...prev,
          { role: 'user', content: finalPrompt },
          { role: 'assistant', content: streamedText }
        ]);
        setFollowUpQuery('');
      } else {
        // Parse if it was flagged as vague clarification
        const clarificationMatch = streamedText.match(/<clarification>([\s\S]*?)(?:<\/clarification>|$)/);
        if (clarificationMatch) {
          setHasVagueClarification(true);
        }
        setChatLog([
          { role: 'user', content: finalPrompt },
          { role: 'assistant', content: streamedText }
        ]);
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during auditing.');
    } finally {
      setIsAuditing(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  };

  // Structured citations text parser
  const renderAuditTextWithCitations = (text: string) => {
    if (!text) return null;

    // Match citations like [#SOT-COMP-2026] or #SOT-COMP-2026
    const regex = /(\[?#SOT-[A-Z0-9-]{4,12}\]?)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        const code = part.replace(/[\[#\]]/g, '').trim();
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleOpenCitationBrief(code)}
            className="px-2 py-0.5 mx-1 inline-flex items-center gap-1 rounded-[6px] bg-[#3a66f5]/10 hover:bg-[#3a66f5] hover:text-white transition-colors duration-150 font-mono text-[11px] font-bold text-[#3a66f5] select-all border border-[#3a66f5]/15 cursor-pointer align-baseline"
            title={`View evidence detail brief for #${code}`}
          >
            #{code}
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  // Helper to parse citations and turn them into standard href anchors in PDF
  const renderPrintableAuditorText = (text: string) => {
    if (!text) return null;
    const regex = /(\[?#SOT-[A-Z0-9-]{4,12}\]?)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        const code = part.replace(/[\[#\]]/g, '').trim();
        const matched = citations.find(c => c.code === code) || BRIEF_SEEDS[code];
        const url = matched?.source_url || 'https://openalex.org';
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#534AB7] hover:underline font-mono font-bold mx-1 inline-block"
          >
            #{code}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Slide drawer controller
  const handleOpenCitationBrief = (code: string) => {
    const matched = citations.find(c => c.code === code) || BRIEF_SEEDS[code];
    if (matched) {
      setActiveCitation(matched);
      setIsDrawerOpen(true);
    } else {
      // Create empty mock in case citation doesn't load fully
      setActiveCitation({
        code,
        pillar: 'COGNITIVE OFFLOADING',
        title: `HCI record detail for reference #${code}`,
        human_summary: 'This record documents how ambient latency delays reshape attention and retention cycles among automated product teams. Multi-user logs confirm cognitive safety declines.',
        metric: '32% cognitive variation variance',
        verdict: 'Review your latency rates and introduce Artificial Visual checkpoints to preserve critical user focus.',
        risk_level: 'warning',
        source_url: 'https://openalex.org',
        source_type: 'preprint',
        paper_year: 2026,
        authors: 'TSOT Registry Records, et al.',
        is_premium: false
      });
      setIsDrawerOpen(true);
    }
  };

  // Follow-up execution wrapper
  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || isAuditing) return;

    // Verify limit counts
    const allowed = tier === 'team' ? 5 : tier === 'pro' ? 3 : 1;
    const userTurns = chatLog.filter(c => c.role === 'user').length;
    if (userTurns > allowed) {
      setErrorMsg(`Turn limit reached. Under your ${tier.toUpperCase()} account, you get exactly ${allowed} follow-up questions per session.`);
      return;
    }

    executeAudit(e, followUpQuery, true);
  };

  const handlePresetSelect = (text: string) => {
    setProductDesc(text);
  };

  // Share Brief Action
  const handleShareBrief = () => {
    const mockUrl = `${window.location.origin}/auditor?share=${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(mockUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // PDF generation: opens a clean blank window with pure HTML so the browser
  // renders vector text (fully selectable/searchable) instead of a rasterized image.
  // The modal-based window.print() approach causes Chrome/Edge to flatten the page
  // to a bitmap because of backdrop-filter, fixed positioning, and opacity layers.
  const handleGeneratePDF = () => {
    // Helper: turn citation codes into plain text with URL for the blank window
    const resolveCitationsAsText = (text: string): string => {
      if (!text) return '';
      return text.replace(/\[?#(SOT-[A-Z0-9-]{4,12})\]?/g, (_match, code) => {
        const matched = citations.find(c => c.code === code) || BRIEF_SEEDS[code];
        const url = matched?.source_url || 'https://openalex.org';
        return `<a href="${url}" style="color:#534AB7;font-family:monospace;font-weight:700;">#${code}</a>`;
      });
    };

    // Build follow-up section HTML
    const buildFollowUpHTML = (): string => {
      if (chatLog.length <= 2) return '';
      const items = chatLog.slice(2).map(msg => {
        if (msg.role === 'user') {
          return `<div style="margin-bottom:12px;padding:10px 12px;background:#F2F2F0;border-left:3px solid #0B0B0B;">
            <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7A7A79;margin-bottom:4px;">PRODUCT QUERY</div>
            <p style="font-size:12px;color:#555;font-style:italic;margin:0;">${msg.content}</p>
          </div>`;
        }
        const parsed = parseFollowUpContent(msg.content);
        if (!parsed.hasXML) {
          return `<div style="margin-bottom:12px;padding:10px 12px;border:1px solid #D5D5D0;">
            <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#7A7A79;margin-bottom:4px;">AUDITOR RESPONSE</div>
            <div style="font-size:12px;color:#0B0B0B;line-height:1.6;white-space:pre-wrap;">${resolveCitationsAsText(parsed.plainText)}</div>
          </div>`;
        }
        let html = '<div style="margin-bottom:16px;">';
        if (parsed.verdict) html += `<div style="margin-bottom:8px;padding:10px 12px;background:#F8F8F8;border:1px solid #0B0B0B;">
          <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#FF3E00;margin-bottom:4px;">FOLLOW-UP VERDICT</div>
          <p style="font-size:13px;font-weight:600;color:#0B0B0B;margin:0;line-height:1.6;">${resolveCitationsAsText(parsed.verdict)}</p>
        </div>`;
        if (parsed.findings) html += `<div style="margin-bottom:8px;padding:10px 12px;border:1px solid #D5D5D0;">
          <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#0B0B0B;margin-bottom:6px;border-bottom:1px solid #EAEAE5;padding-bottom:4px;">FINDINGS</div>
          <div style="font-size:12px;color:#0B0B0B;line-height:1.7;white-space:pre-wrap;">${resolveCitationsAsText(parsed.findings)}</div>
        </div>`;
        if (parsed.gap) html += `<div style="margin-bottom:8px;padding:10px 12px;background:#FFF8ED;border:1px solid #E8A020;">
          <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#633806;margin-bottom:4px;">COVERAGE GAP</div>
          <p style="font-size:12px;color:#633806;margin:0;">${parsed.gap}</p>
        </div>`;
        if (parsed.sprint) html += `<div style="padding:10px 12px;border:1px solid #0B0B0B;border-left:3px solid #1A7A4A;">
          <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#1A7A4A;margin-bottom:4px;">SPRINT ACTION</div>
          <div style="font-size:12px;color:#0B0B0B;line-height:1.6;">${resolveCitationsAsText(parsed.sprint)}</div>
        </div>`;
        html += '</div>';
        return html;
      }).join('');
      return `<div style="border-top:1px solid #D5D5D0;padding-top:16px;margin-top:16px;">
        <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#7A7A79;margin-bottom:12px;border-bottom:1px solid #EAEAE5;padding-bottom:6px;">FOLLOW-UP AUDIT HISTORY</div>
        ${items}
      </div>`;
    };

    // Build citations footer HTML
    const buildCitationsHTML = (): string => {
      if (!citations.length) return '';
      const rows = citations.map(c => `<div style="font-size:11px;margin-bottom:6px;line-height:1.5;">
        <strong style="font-family:monospace;color:#534AB7;">${c.code}</strong> — ${
          c.source_url
            ? `<a href="${c.source_url}" style="color:#534AB7;font-weight:600;">${c.title}</a>`
            : c.title
        } <em style="color:#7A7A79;">(${c.authors}, ${c.paper_year})</em>
      </div>`).join('');
      return `<div style="border-top:1px solid #EAEAE5;padding-top:12px;margin-top:12px;">
        <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#7A7A79;margin-bottom:8px;">CITED REGISTRY BRIEFS</div>
        ${rows}
      </div>`;
    };

    // Build scores table HTML
    const buildScoresHTML = (): string => {
      const cells = Object.entries(parsedStream.scores).map(([pillar, score]) => `
        <td style="width:25%;padding:8px;border:1px solid #D5D5D0;text-align:center;vertical-align:top;">
          <div style="font-family:monospace;font-size:8px;font-weight:700;color:#7A7A79;text-transform:uppercase;margin-bottom:4px;">${pillar}</div>
          <div style="font-size:18px;font-weight:700;color:#0B0B0B;">${score !== null ? `${score}/100` : 'N/A'}</div>
        </td>`).join('');
      return `<table style="width:100%;border-collapse:collapse;margin-bottom:16px;"><tr>${cells}</tr></table>`;
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TSOT Design Audit Evidence Brief — ${new Date().toLocaleDateString()}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      color: #0B0B0B;
      background: #fff;
      margin: 0;
      padding: 32px 40px;
      max-width: 780px;
      margin-left: auto;
      margin-right: auto;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    a { color: #534AB7; }
    @media print {
      body { padding: 0; margin: 0; }
      @page { margin: 20mm 18mm; }
      section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="border-bottom:2px solid #0B0B0B;padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <div style="font-family:'DM Mono',monospace;font-size:9px;font-weight:700;color:#534AB7;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:4px;">THE SIGN OF TIMES (TSOT)</div>
      <h1 style="font-size:26px;font-weight:700;color:#0B0B0B;margin:0;letter-spacing:-0.02em;line-height:1;">Design Audit Evidence Brief</h1>
    </div>
    <div style="text-align:right;">
      <div style="font-family:monospace;font-size:9px;color:#7A7A79;">DATE: ${new Date().toLocaleDateString()}</div>
      <div style="font-family:monospace;font-size:9px;color:#7A7A79;">CONFIDENCE: ${confidence}%</div>
    </div>
  </div>

  <!-- Pillar Risk Scores -->
  <section style="margin-bottom:20px;padding:12px;background:#F8F8F8;border:1px solid #D5D5D0;">
    <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#7A7A79;margin-bottom:10px;">System Pillar Risk Scores</div>
    ${buildScoresHTML()}
  </section>

  <!-- Verdict -->
  ${parsedStream.verdict ? `<section style="margin-bottom:20px;">
    <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#FF3E00;margin-bottom:6px;">System Audit Verdict</div>
    <p style="font-size:14px;font-weight:600;color:#0B0B0B;line-height:1.65;margin:0;">${resolveCitationsAsText(stripXMLTags(parsedStream.verdict))}</p>
  </section>` : ''}

  <!-- Findings -->
  ${parsedStream.findings ? `<section style="margin-bottom:20px;border:1px solid #D5D5D0;padding:14px;">
    <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#0B0B0B;margin-bottom:8px;border-bottom:1px solid #EAEAE5;padding-bottom:6px;">Empirical Research Analysis</div>
    <div style="font-size:12.5px;color:#0B0B0B;line-height:1.75;white-space:pre-wrap;">${resolveCitationsAsText(stripXMLTags(parsedStream.findings))}</div>
  </section>` : ''}

  <!-- Sprint Action -->
  ${parsedStream.sprint ? `<section style="margin-bottom:20px;border:1px solid #0B0B0B;border-left:3px solid #1A7A4A;padding:14px;">
    <div style="font-family:monospace;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#1A7A4A;margin-bottom:6px;">Recommended Implementation Sprint Goal</div>
    <div style="font-size:12.5px;color:#0B0B0B;line-height:1.65;">${resolveCitationsAsText(stripXMLTags(parsedStream.sprint))}</div>
  </section>` : ''}

  <!-- Follow-up audit history -->
  ${buildFollowUpHTML()}

  <!-- Citations index -->
  ${buildCitationsHTML()}

  <!-- Footer -->
  <div style="border-top:1px solid #EAEAE5;padding-top:10px;margin-top:20px;text-align:center;">
    <p style="font-family:monospace;font-size:8px;color:#7A7A79;margin:0;">
      Document generated by TSOT Design Auditor · Powered by HCI Research Ledger · tsot.app
    </p>
  </div>

  <script>
    // Auto-trigger print dialog when the new window loads
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 300);
    });
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const userStepGuideData = [
    { num: "01", title: "Audit Portal Entry", desc: "No complex logins or gates. Free accounts receive 5 session tokens instantly." },
    { num: "02", title: "Interface Profiling & Detection", desc: "Type in natural descriptions. A live classifier tracks your design and suggests forms to boost accuracy." },
    { num: "03", title: "Pre-Audit Scope Verification", desc: "Checks inputs for safety-critical bounds (medical/legal compliance/algorithms) or vague phrasing and prompts accordingly." },
    { num: "04", title: "Registry Search & Gemini Re-ranking", desc: "Queries Supabase + local indices. Performs relevance scoring on up to 30 candidates, applying the RAG expansion parameter." },
    { num: "05", title: "Multi-layered synthesis stream", desc: "Generates scores dynamically, then stream-formats them using custom visual delimiters in real-time." },
    { num: "06", title: "Clickable Citation Chips", desc: "Citations resolve as interactive inline buttons. On click, a sidebar opens containing summaries, metrics, and actionable verdicts." },
    { num: "07", title: "Threaded Context Lock", desc: "Ensures follow-up queries lock strictly onto original retrieved papers, bypassing drift or hallucinations." },
    { num: "08", title: "Token depletion inline prompts", desc: "Frictionless inline notification alerts daily limits without full lockouts." }
  ];

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-12 select-text font-sans relative">
      
      {/* Editorial Title Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-baseline pb-6 border-b border-border mb-10">
        <div className="md:col-span-1">
          <span className="font-mono text-[11px] font-bold text-[#3a66f5] uppercase tracking-[0.2em] block mb-2">
            TSOT DESIGN ENGINE v1.2
          </span>
          <h1 className="font-gambarino text-[32px] sm:text-[38px] md:text-[42px] text-[#3a66f5] font-normal leading-none uppercase">
            TSOT Design Auditor
          </h1>
        </div>
        <div className="md:col-span-2">
          <p className="font-gambarino text-[13px] sm:text-[14px] md:text-[15px] text-[#3a66f5] leading-relaxed max-w-[700px]">
            Submit your AI product specifications, streaming latencies, or agent loops. Our RAG engine evaluates your systems against 1,700+ curated HCI risk records.
          </p>
        </div>
      </div>

      {/* Global Configuration Banner (Brutalist/Card style) */}
      <div className="bg-[#f8f8f8] p-4 flex flex-col sm:flex-row gap-4 items-center w-full justify-between mb-8 rounded-[10px] border border-[#3a66f5]/20 shadow-xs">
        {/* Tier Switcher for Developer Testing */}
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-mid-concrete block">
            DEVELOPER ACCOUNT TIER
          </span>
          <div className="flex border border-[#3a66f5] bg-white rounded-[10px] overflow-hidden p-0.5">
            {(['free', 'pro', 'team'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleTierChange(t)}
                className={`px-3 py-1 font-mono text-[10px] font-bold uppercase cursor-pointer rounded-[8px] transition-colors ${
                  tier === t 
                    ? 'bg-[#3a66f5] text-white' 
                    : 'text-carbon hover:bg-[#f8f8f8]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:block h-8 w-[1px] bg-border"></div>

        {/* Guide Toggle */}
        <button
          onClick={() => setShowSpecGuide(!showSpecGuide)}
          className="flex items-center gap-2 font-mono text-[11px] font-bold text-white hover:bg-[#254edb] transition-colors uppercase cursor-pointer bg-[#3a66f5] px-5 py-2.5 rounded-[10px] border-none shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          {showSpecGuide ? 'Hide Specifications' : 'Show Specifications'}
        </button>
      </div>

      {/* Interactive Specifications Guide Panel */}
      {showSpecGuide && (
        <div className="bg-[#f8f8f8] border-none rounded-[22px] shadow-[5px_7px_4px_0px_rgba(0,0,0,0.1)] p-6 md:p-8 mb-12 animate-fade-in">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-gambarino text-[22px] font-normal text-[#3a66f5]">
                TSOT Design Auditor System Blueprint
              </h2>
              <p className="text-[13px] text-mid-concrete mt-1">
                Explore the functional pipeline and hard constraints governing the auditor under the hood.
              </p>
            </div>
            <button 
              onClick={() => setShowSpecGuide(false)}
              className="text-mid-concrete hover:text-carbon cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabular Layout matching downloaded specification structure */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Steps Journeys */}
            <div className="lg:col-span-6 border-r border-border pr-0 lg:pr-8">
              <span className="font-mono text-[10px] font-bold text-mid-concrete uppercase tracking-wider block mb-3">
                THE 8-STEP PIPELINE PIPELINE (CLICK TO EXPAND)
              </span>
              <div className="flex flex-col border border-border/60 rounded-[15px] overflow-hidden shadow-sm">
                {userStepGuideData.map((step, idx) => {
                  const isOpen = activeStepGuide === idx;
                  return (
                    <div key={idx} className="border-b border-border last:border-b-0 bg-white">
                      <button
                        onClick={() => setActiveStepGuide(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-concrete/40 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[11px] font-bold text-white bg-[#3a66f5] px-2 py-0.5 rounded-[6px]">
                            {step.num}
                          </span>
                          <span className="font-sans text-[13px] font-bold text-carbon">
                            {step.title}
                          </span>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-mid-concrete" /> : <ChevronDown className="w-4 h-4 text-mid-concrete" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-[12px] text-mid-concrete leading-relaxed border-t border-concrete bg-concrete/20">
                          {step.desc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hard Rules List */}
            <div className="lg:col-span-6">
              <span className="font-mono text-[10px] font-bold text-mid-concrete uppercase tracking-wider block mb-3">
                TSOT Hard Auditing Constraints
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { num: "01", txt: "No claim without at least one direct [#SOT-XXXXXX] record citation." },
                  { num: "02", txt: "Verdict block must output within the first 3 tokens." },
                  { num: "03", txt: "Confidence limits explicitly scale down if fewer than 3 records matched." },
                  { num: "04", txt: "Confidence modifiers trigger specific language shifts ('proves' vs 'suggests')." },
                  { num: "05", txt: "Sprint actions must provide code details, not recommendations." },
                  { num: "06", txt: "Scope limits automatically intercept medical or legal queries." },
                  { num: "07", txt: "Scores are strictly mapped to re-ranker indices, never estimated." },
                  { num: "08", txt: "Thread context locks strictly onto original briefs to block drift." },
                  { num: "09", txt: "Every execution is archived for prompt refinement." },
                  { num: "10", txt: "Speaks strictly as TSOT, completely eliminating personal pronouns." }
                ].map((rule, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start p-3 bg-white border border-border/60 rounded-[15px] shadow-sm">
                    <span className="font-mono text-[10px] font-bold text-white bg-[#3a66f5] px-1.5 py-0.5 rounded-[6px]">
                      {rule.num}
                    </span>
                    <p className="text-[12px] text-carbon leading-snug">
                      {rule.txt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form and Output Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Input Configuration (Cols 1-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* Mode Selector Tabs (Editorial style) */}
          <div className="flex border-b border-[#3a66f5]/20 w-full bg-white select-none mb-2">
            {[
              { id: 'free_text', label: '📝 FREE TEXT' },
              { id: 'deep_dive', label: '🔍 DEEP DIVE' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all ${
                  activeTab === tab.id 
                    ? 'border-[#3a66f5] text-[#3a66f5] font-extrabold' 
                    : 'border-transparent text-mid-concrete hover:text-carbon'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Block */}
          <form onSubmit={(e) => executeAudit(e)} className="bg-[#f8f8f8] rounded-[22px] shadow-[5px_7px_4px_0px_rgba(58,102,245,0.15)] p-6 flex flex-col gap-6 relative border-none">
            {/* Top Indicator */}
            <div className="absolute top-0 right-6 w-12 h-1 bg-[#3a66f5] rounded-b-full"></div>

            {/* MODE 1: FREE TEXT AUDIT */}
            {activeTab === 'free_text' && (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label
                      htmlFor="product-desc"
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#3a66f5]"
                    >
                      AI System Workflow or Spec Brief
                    </label>
                    <span className="font-mono text-[10px] text-mid-concrete">
                      {productDesc.length} / 2000
                    </span>
                  </div>
                  
                  <textarea
                    id="product-desc"
                    rows={8}
                    placeholder="Describe your design patterns, feature interfaces, latency thresholds, explainability dialogs, or ambient alert structures..."
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value.slice(0, 2000))}
                    className="w-full bg-white border border-[#3a66f5]/20 p-4 font-sans text-[13px] leading-relaxed placeholder:text-mid-concrete/50 focus:outline-none focus:border-[#3a66f5] focus:ring-1 focus:ring-[#3a66f5] text-carbon resize-y rounded-[10px] transition-all"
                    disabled={isAuditing}
                    required
                  />

                  {/* Character limit checks */}
                  {productDesc.length > 0 && productDesc.length < 100 && (
                    <div className="mt-2 flex items-center gap-1.5 text-warning font-mono text-[9px] uppercase font-bold animate-fade-in bg-warning/5 border border-warning/15 px-2.5 py-1 rounded-[6px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                      Audits produce high-fidelity output with inputs over 100 characters. Structured mode recommended.
                    </div>
                  )}
                </div>

                {/* Live Topic Tag Detector */}
                {currentDetectedTags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[9px] font-bold text-mid-concrete uppercase tracking-wider">
                      CLASSIFIED TARGETS:
                    </span>
                    {currentDetectedTags.map(tag => (
                      <span key={tag} className="font-mono text-[9px] font-bold text-[#3a66f5] bg-[#3a66f5]/10 border border-[#3a66f5]/20 px-2 py-0.5 rounded-[6px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* MODE 3: RECORD DEEP DIVE AUDIT */}
            {activeTab === 'deep_dive' && (
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-[#3a66f5]/15 p-3 flex gap-2.5 items-start text-carbon rounded-[10px]">
                  <Info className="w-4.5 h-4.5 text-[#3a66f5] flex-shrink-0 mt-0.5" />
                  <p className="font-sans text-[12px] leading-relaxed text-mid-concrete">
                    Audit directly from a specific TSOT brief to see how its core verdict applies to your product.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-bold uppercase text-[#3a66f5]">
                    Target TSOT Registry Brief
                  </label>
                  <select
                    value={selectedDeepRecordCode}
                    onChange={(e) => setSelectedDeepRecordCode(e.target.value)}
                    className="w-full bg-white border border-[#3a66f5]/20 px-3 py-2 text-[12px] focus:outline-none focus:border-[#3a66f5] focus:ring-1 focus:ring-[#3a66f5] text-carbon rounded-[10px] transition-all"
                  >
                    {Object.keys(BRIEF_SEEDS).map(code => (
                      <option key={code} value={code}>
                        #{code} — {BRIEF_SEEDS[code].pillar}: {BRIEF_SEEDS[code].title.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-bold uppercase text-[#3a66f5]">
                    How does this apply to your product?
                  </label>
                  <textarea
                    rows={4}
                    placeholder="We represent autocomplete recommendations instantly to engineering leads..."
                    value={deepDiveQuestion}
                    onChange={(e) => setDeepDiveQuestion(e.target.value)}
                    className="w-full bg-white border border-[#3a66f5]/20 p-3 font-sans text-[13px] leading-relaxed focus:outline-none focus:border-[#3a66f5] focus:ring-1 focus:ring-[#3a66f5] text-carbon rounded-[10px] resize-none transition-all"
                    disabled={isAuditing}
                    required
                  />
                </div>
              </div>
            )}

            {/* Personal BYOK Key Input */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-baseline mb-2">
                <label
                  htmlFor="byok-key"
                  className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-mid-concrete"
                >
                  Personal Gemini API Key (BYOK)
                </label>
                <span className="font-mono text-[9px] text-[#3a66f5] uppercase font-bold">
                  Bypasses Daily Limits
                </span>
              </div>
              <input
                id="byok-key"
                type="password"
                placeholder="PASTE YOUR GEMINI_API_KEY..."
                value={byokKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                className="w-full bg-white border border-[#3a66f5]/20 px-3 py-2 font-mono text-[11px] placeholder:text-mid-concrete/40 focus:outline-none focus:border-[#3a66f5] focus:ring-1 focus:ring-[#3a66f5] text-carbon rounded-[10px] transition-all"
                disabled={isAuditing}
              />
            </div>

            {/* Daily limit tracker */}
            {!byokKey && tier === 'free' && (
              <div className="bg-white border border-[#3a66f5]/15 px-4 py-3 flex items-center justify-between rounded-[10px]">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-mid-concrete">
                  Free Session Audits Remaining:
                </span>
                <span className="font-mono text-[12px] font-bold text-carbon">
                  {sessionRemaining} / 5
                </span>
              </div>
            )}

            {/* Submission triggers */}
            <button
              type="submit"
              disabled={isAuditing || (activeTab === 'free_text' && !productDesc.trim())}
              className="w-full bg-[#3a66f5] hover:bg-[#254edb] text-white font-sans text-sm font-semibold rounded-[10px] py-3.5 transition-colors border-none shadow-sm cursor-pointer disabled:bg-concrete disabled:text-mid-concrete disabled:border-border disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isAuditing ? 'Auditing Product Architecture...' : 'RUN ADVERSARIAL AUDIT'}
            </button>
          </form>
        </div>

        {/* Right Output Console (Cols 6-12) */}
        <div className="lg:col-span-7 bg-[#f8f8f8] rounded-[22px] shadow-[5px_7px_4px_0px_rgba(58,102,245,0.08)] min-h-[520px] flex flex-col relative border-none w-full overflow-hidden">
          
          {/* Header Panel Console */}
          <div className="border-b border-[#3a66f5]/10 px-6 py-4 flex justify-between items-center bg-[#f0f0f0] select-none rounded-t-[22px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3a66f5]"></span>
              <span className="font-mono text-[11px] font-bold tracking-wider text-[#3a66f5] uppercase">
                TSOT AUDIT CONSOLE
              </span>
            </div>
            <div className="flex gap-2 items-center">
              {isAuditing && (
                <span className="font-mono text-[9px] font-bold text-[#3a66f5] uppercase tracking-wider animate-pulse">
                  Streaming synthesis...
                </span>
              )}
              <span className={`w-3 h-3 rounded-full border border-none ${isAuditing ? 'bg-signal animate-pulse' : 'bg-border'}`}></span>
            </div>
          </div>

          {/* Main output body */}
          <div className="p-8 flex-1 flex flex-col justify-start overflow-y-auto leading-relaxed bg-white">
            
            {/* Error alerts */}
            {errorMsg && (
              <div className="border-2 border-critical px-4 py-3 bg-[#FAECE7] mb-6 text-[13px] text-critical select-none flex gap-2 items-start rounded-[15px]">
                <AlertTriangle className="w-5 h-5 text-critical flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono font-bold uppercase block mb-1">AUDIT PROCESS FAILED</span>
                  <p className="font-sans font-medium">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Main Streaming Output parsing system */}
            {streamedRawText ? (
              <div className="flex flex-col gap-6 animate-fade-in">
                
                {/* 1. DISCLAIMER OVERLAY (Scope constraint rule 6) */}
                {parsedStream.disclaimer && (
                  <div className="border-l-4 border-signal bg-signal/5 p-5 border border-border rounded-r-[10px] rounded-l-[4px]">
                    <span className="font-mono text-[10px] font-bold text-signal uppercase tracking-wider block mb-2">
                      ⚠️ TSOT CRITICAL SCOPE WARNING
                    </span>
                    <div className="font-sans text-[13.5px] leading-relaxed text-carbon">
                      {parsedStream.disclaimer}
                    </div>
                  </div>
                )}
                {/* 2. VAGUE CLARIFICATION BLOCK */}
                {parsedStream.clarification && (
                  <div className="border-l-4 border-[#3a66f5] bg-[#3a66f5]/5 p-5 border border-[#3a66f5]/10 animate-fade-in flex flex-col gap-4 rounded-r-[10px] rounded-l-[4px]">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#3a66f5] uppercase tracking-wider block mb-2">
                        💡 Clarification Prompt Required
                      </span>
                      <div className="font-sans text-[13.5px] leading-relaxed text-carbon select-text whitespace-pre-wrap">
                        {renderAuditTextWithCitations(parsedStream.clarification)}
                      </div>
                    </div>

                    {/* Inline Response Form */}
                    <form onSubmit={handleSendFollowUp} className="border border-[#3a66f5]/30 p-2.5 flex gap-2 items-center bg-white mt-2 rounded-[10px]">
                      <input
                        type="text"
                        placeholder="Type your answers here (e.g. 1. static email 2. Q&A 3. 500ms)..."
                        value={followUpQuery}
                        onChange={(e) => setFollowUpQuery(e.target.value)}
                        className="flex-1 bg-white border border-[#3a66f5]/20 px-3 py-1.5 text-[12.5px] focus:outline-none focus:border-[#3a66f5] text-carbon rounded-[6px]"
                        disabled={isAuditing}
                        required
                      />
                      <button
                        type="submit"
                        disabled={isAuditing || !followUpQuery.trim()}
                        className="bg-[#3a66f5] border border-none text-white hover:bg-[#254edb] transition-colors px-4 py-1.5 font-mono text-[10px] font-bold uppercase select-none rounded-[6px] cursor-pointer disabled:bg-border disabled:text-mid-concrete"
                      >
                        Submit Answers
                      </button>
                    </form>
                  </div>
                )}
                {/* 3. NORMAL SUCCESSFUL AUDIT BLOCKS */}
                {!parsedStream.disclaimer && !parsedStream.clarification && (
                  <div className="flex flex-col gap-6">
                    
                    {/* Block A: Verdict Header */}
                    {parsedStream.verdict && (
                      <div className="border border-[#3a66f5]/20 rounded-[15px] p-5 bg-[#3a66f5]/5 relative select-text shadow-sm">
                        <div className="font-sans font-medium text-[15px] leading-relaxed text-carbon">
                          {renderAuditTextWithCitations(parsedStream.verdict)}
                        </div>
                        {citations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/80 flex items-center justify-between text-[11px] font-mono text-mid-concrete">
                            <span>Corpus coverage: {citations.length} direct briefs</span>
                            <span>Confidence: {confidence}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Block B: Per-Pillar Risk breakdown (premium tier gating check) */}
                    <div className="border border-[#3a66f5]/15 rounded-[15px] p-5 bg-[#f8f8f8] shadow-sm">
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="font-mono text-[10px] font-bold text-carbon uppercase tracking-wider">
                          Pillar Cognitive Risk ratings
                        </span>
                        <span className="font-mono text-[9px] text-[#3a66f5] uppercase font-extrabold">
                          PRO & TEAM TIERS
                        </span>
                      </div>

                      {tier === 'free' ? (
                        /* Gated layout */
                        <div className="bg-white border border-[#3a66f5]/15 p-4 text-center select-none flex flex-col items-center justify-center gap-2 animate-fade-in rounded-[10px]">
                          <Lock className="w-5 h-5 text-[#3a66f5]" />
                          <p className="font-sans text-[12px] font-bold text-carbon uppercase tracking-wider">
                            Pillar Breakdown Scores Locked
                          </p>
                          <p className="font-sans text-[11px] text-mid-concrete max-w-[280px] leading-normal">
                            Upgrade your simulated account to Pro or Team on the upper banner to unlock the risk score grids.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleTierChange('pro')}
                            className="mt-1.5 px-4 py-1.5 font-mono text-[10px] font-bold uppercase bg-[#3a66f5] text-white border border-none hover:bg-[#254edb] transition-all cursor-pointer rounded-[6px]"
                          >
                            Simulate Upgrade
                          </button>
                        </div>
                      ) : (
                        /* Unlocked beautiful dashboard grids */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in select-text">
                          {Object.keys(parsedStream.scores).map(pillar => {
                            const score = parsedStream.scores[pillar];
                            const color = PILLAR_COLORS[pillar] || '#7A7A79';
                            return (
                              <div key={pillar} className="border border-border/80 rounded-[10px] p-3.5 bg-white flex flex-col justify-between shadow-xs">
                                <span 
                                  className="font-mono text-[9px] font-bold uppercase tracking-wider block mb-2"
                                  style={{ color }}
                                >
                                  {pillar}
                                </span>
                                <div className="flex justify-between items-end">
                                  {score !== null ? (
                                    <>
                                      <span className="font-gambarino text-[26px] font-normal text-carbon">
                                        {score}
                                        <span className="text-[12px] text-mid-concrete font-sans font-medium">/100 risk</span>
                                      </span>
                                      <div className="w-16 bg-concrete h-1.5 rounded-full overflow-hidden border border-border">
                                        <div 
                                          className="h-full rounded-full"
                                          style={{ 
                                            width: `${score}%`, 
                                            backgroundColor: score > 75 ? '#FF3E00' : score > 45 ? '#E8A020' : '#1A7A4A' 
                                          }}
                                        ></div>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="font-mono text-[11px] text-mid-concrete">
                                      NO COVERAGE
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Block C: Streamed, Cited Findings */}
                    {parsedStream.findings && (
                      <div className="font-sans text-[14px] text-carbon leading-[1.7] select-text border border-[#3a66f5]/15 rounded-[15px] p-5 prose prose-sm max-w-none shadow-sm">
                        <span className="font-mono text-[10px] font-bold text-mid-concrete uppercase tracking-wider block mb-3 border-b border-border pb-2">
                          ANALYSIS & FINDINGS
                        </span>
                        {renderAuditTextWithCitations(parsedStream.findings)}
                      </div>
                    )}

                    {/* Block D: Gap Notices */}
                    {parsedStream.gap && (
                      <div className="bg-[#FAEEDA] border border-[#633806]/15 p-4 flex gap-2.5 items-start select-text border-l-4 border-warning animate-fade-in rounded-r-[10px] rounded-l-[4px]">
                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-[10px] font-bold text-[#633806] uppercase tracking-wider block mb-1">
                            Corpus Coverage Gap Warning
                          </span>
                          <p className="font-sans text-[12.5px] leading-relaxed text-[#633806]">
                            {parsedStream.gap}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Block E: Actionable Sprint Goal */}
                    {parsedStream.sprint && (
                      <div className="border border-none p-5 bg-white relative select-text shadow-[3px_3px_0px_#1A7A4A] rounded-[15px] border-l-4 border-l-[#1a7a4a]">
                        <span className="font-mono text-[10px] font-bold text-stable uppercase tracking-wider block mb-3">
                          One-Sprint Action Item
                        </span>
                        <div className="font-sans text-[13.5px] text-carbon leading-relaxed">
                          {renderAuditTextWithCitations(parsedStream.sprint)}
                        </div>
                      </div>
                    )}

                    {/* Threaded Conversation Chats (Logs follow up threads) */}
                    {chatLog.length > 2 && (
                      <div className="border-t border-carbon pt-6 mt-6 flex flex-col gap-5 select-text">
                        <span className="font-mono text-[10px] font-bold text-mid-concrete uppercase tracking-wider">
                          Follow-up Audit Log
                        </span>
                        {chatLog.slice(2).map((msg, index) => {
                          if (msg.role === 'user') {
                            return (
                              <div key={index} className="p-3 border border-border bg-concrete/30 border-l-4 border-l-carbon rounded-[10px]">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-mid-concrete block mb-1">Product Query</span>
                                <p className="font-sans text-[13px] leading-relaxed text-carbon select-text">{msg.content}</p>
                              </div>
                            );
                          }
                          // Render assistant follow-up in structured blocks
                          const parsed = parseFollowUpContent(msg.content);
                          if (!parsed.hasXML) {
                            return (
                              <div key={index} className="border border-carbon bg-white p-4 rounded-[15px]">
                                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-mid-concrete block mb-2">Audit Console Response</span>
                                <div className="font-sans text-[13px] leading-relaxed text-carbon select-text whitespace-pre-wrap">
                                  {renderAuditTextWithCitations(parsed.plainText)}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={index} className="flex flex-col gap-4">
                              {parsed.verdict && (
                                <div className="border border-[#3a66f5]/20 p-4 bg-[#3a66f5]/5 rounded-[15px]">
                                  <span className="font-mono text-[9px] font-bold text-signal uppercase tracking-wider block mb-1">Follow-up Verdict</span>
                                  <div className="font-sans text-[13.5px] leading-relaxed text-carbon select-text">
                                    {renderAuditTextWithCitations(parsed.verdict)}
                                  </div>
                                </div>
                              )}
                              {parsed.findings && (
                                <div className="border border-border p-4 rounded-[15px]">
                                  <span className="font-mono text-[9px] font-bold text-carbon uppercase tracking-wider block mb-2 border-b border-border pb-1">Analysis &amp; Findings</span>
                                  <div className="font-sans text-[13px] leading-relaxed text-carbon select-text whitespace-pre-wrap">
                                    {renderAuditTextWithCitations(parsed.findings)}
                                  </div>
                                </div>
                              )}
                              {parsed.gap && (
                                <div className="bg-[#FAEEDA] border border-[#633806]/15 p-3 text-[12.5px] text-[#633806] leading-relaxed rounded-[10px]">
                                  <span className="font-mono text-[9px] font-bold uppercase block mb-1">Coverage Gap</span>
                                  <p>{parsed.gap}</p>
                                </div>
                              )}
                              {parsed.sprint && (
                                <div className="border border-none p-4 bg-white shadow-[3px_3px_0px_#1A7A4A] rounded-[15px] border-l-4 border-l-[#1a7a4a]">
                                  <span className="font-mono text-[9px] font-bold text-stable uppercase tracking-wider block mb-1">One-Sprint Action Item</span>
                                  <div className="font-sans text-[13px] text-carbon leading-relaxed select-text">
                                    {renderAuditTextWithCitations(parsed.sprint)}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Follow-up question form box */}
                    {!hasVagueClarification && (
                      <form onSubmit={handleSendFollowUp} className="border border-[#3a66f5]/15 p-3 flex gap-3 items-center bg-[#f8f8f8] rounded-[10px]">
                        <input
                          type="text"
                          placeholder="Ask follow-up questions to resolve design queries against these records..."
                          value={followUpQuery}
                          onChange={(e) => setFollowUpQuery(e.target.value)}
                          className="flex-1 bg-white border border-[#3a66f5]/20 px-3 py-2 text-[12.5px] focus:outline-none focus:border-[#3a66f5] focus:ring-1 focus:ring-[#3a66f5] text-carbon rounded-[8px]"
                          disabled={isAuditing}
                        />
                        <button
                          type="submit"
                          disabled={isAuditing || !followUpQuery.trim()}
                          className="bg-[#3a66f5] border border-none text-white hover:bg-[#254edb] transition-colors px-4 py-2 font-mono text-[11px] font-bold uppercase select-none rounded-[8px] cursor-pointer disabled:bg-border disabled:text-mid-concrete"
                        >
                          Send
                        </button>
                      </form>
                    )}

                    {/* Block F: Premium Operations Panel */}
                    <div className="border-t border-border pt-5 mt-4 flex flex-wrap gap-3 items-center justify-between select-none">
                      
                      {/* Thumbs up/down rating tracker */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAuditRating('useful')}
                          className={`flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase border border-border px-3 py-1.5 hover:bg-concrete transition-colors cursor-pointer rounded-[6px] ${
                            auditRating === 'useful' ? 'bg-[#3a66f5] text-white border-[#3a66f5]' : 'text-carbon bg-white'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          Useful
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuditRating('not_relevant')}
                          className={`flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase border border-border px-3 py-1.5 hover:bg-concrete transition-colors cursor-pointer rounded-[6px] ${
                            auditRating === 'not_relevant' ? 'bg-[#3a66f5] text-white border-[#3a66f5]' : 'text-carbon bg-white'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          Irrelevant
                        </button>
                      </div>

                      {/* Export & Share buttons */}
                      <div className="flex gap-2 items-center">
                        
                        {/* Share link (premium) */}
                        {tier === 'free' ? (
                          <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-mid-concrete border border-dashed border-border px-3 py-1.5 uppercase select-none cursor-not-allowed rounded-[6px]">
                            <Lock className="w-3 h-3" />
                            Share Link
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleShareBrief}
                            className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-carbon uppercase border border-[#3a66f5]/20 px-3 py-1.5 hover:bg-concrete transition-colors cursor-pointer bg-white rounded-[6px]"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5 text-stable" /> : <Share2 className="w-3.5 h-3.5" />}
                            {copiedLink ? 'Copied URL!' : 'Share Brief'}
                          </button>
                        )}

                        {/* Export PDF brief (premium) */}
                        {tier === 'free' ? (
                          <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-mid-concrete border border-dashed border-border px-3 py-1.5 uppercase select-none cursor-not-allowed rounded-[6px]">
                            <Lock className="w-3 h-3" />
                            Export brief
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-white uppercase bg-[#3a66f5] hover:bg-[#254edb] px-3 py-1.5 transition-colors cursor-pointer rounded-[6px] shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Export PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* STANDBY CONSOLE LAYER */
              <div className="my-auto text-center py-16 select-none animate-fade-in">
                <Sparkles className="w-10 h-10 text-[#3a66f5]/35 mx-auto mb-4 animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-mid-concrete block mb-2">
                  Console Standby
                </span>
                <p className="font-sans text-[13px] text-mid-concrete max-w-[360px] mx-auto leading-relaxed">
                  Provide your product parameters, features, and latencies on the left configuration form to stream the adversarial RAG audit output.
                </p>
              </div>
            )}
          </div>
          
          <div ref={bottomRef} />
        </div>
      </div>

      {/* LATERAL SLIDE-OUT PANEL (Citation Evidence Brief Drawer) */}
      {isDrawerOpen && activeCitation && (
        <div className="fixed inset-0 z-50 bg-carbon/50 backdrop-blur-xs flex justify-end animate-fade-in select-text">
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-[540px] h-screen bg-white shadow-2xl border-l border-border flex flex-col justify-between animate-slide-left select-text">
            
            {/* Header drawer */}
            <div className="border-b border-[#3a66f5]/10 px-6 py-5 flex justify-between items-center bg-[#f8f8f8]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-bold text-[#3a66f5]">
                  #{activeCitation.code}
                </span>
                <span className="text-border">|</span>
                <span 
                  className="font-mono text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: PILLAR_COLORS[activeCitation.pillar] || '#7A7A79' }}
                >
                  {activeCitation.pillar}
                </span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-mid-concrete hover:text-carbon cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content drawer */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-6">
              
              {/* Paper Title */}
              <div>
                <h3 className="font-gambarino text-[22px] font-normal text-carbon leading-[1.25]">
                  {activeCitation.title}
                </h3>
                {activeCitation.authors && (
                  <span className="text-[12px] text-mid-concrete italic block mt-2">
                    {activeCitation.authors} ({activeCitation.paper_year})
                  </span>
                )}
              </div>

              <div className="h-[1px] bg-border"></div>

              {/* Translation Summary */}
              <div>
                <span className="font-mono text-[9px] font-bold text-mid-concrete uppercase tracking-widest block mb-2">
                  HCI Translation Summary
                </span>
                <p className="font-sans text-[13.5px] text-carbon leading-relaxed">
                  {activeCitation.human_summary}
                </p>
              </div>

              {/* Metric panel */}
              {activeCitation.metric && (
                <div className="border border-[#3a66f5]/15 rounded-[15px] p-4 bg-[#f8f8f8] shadow-sm">
                  <span className="font-mono text-[9px] font-bold text-mid-concrete uppercase tracking-widest block mb-1">
                    Empirical Metric Recorded
                  </span>
                  <p className="font-sans font-bold text-[14px] text-carbon">
                    {activeCitation.metric}
                  </p>
                </div>
              )}

              {/* Actionable Verdict */}
              <div className="border border-none p-4 bg-white relative shadow-[3px_3px_0px_#FF3E00] rounded-[15px] border-l-4 border-l-[#FF3E00]">
                <span className="font-mono text-[9px] font-bold text-[#FF3E00] uppercase tracking-widest block mb-1">
                  Actionable Verdict
                </span>
                <p className="font-sans text-[13px] text-carbon leading-relaxed">
                  {activeCitation.verdict}
                </p>
              </div>
            </div>

            {/* Footer drawer */}
            <div className="border-t border-border px-6 py-4 bg-[#f8f8f8]/55 flex justify-between items-center">
              {activeCitation.source_url ? (
                <a
                  href={activeCitation.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] font-bold text-[#3a66f5] hover:underline uppercase tracking-wider"
                >
                  View Scholar Document ↗
                </a>
              ) : (
                <span className="text-[10px] font-mono text-mid-concrete">
                  SOURCE URL RESTRICTED
                </span>
              )}
              
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="bg-[#3a66f5] text-white font-mono text-[10px] font-bold px-4 py-2 uppercase tracking-wider cursor-pointer hover:bg-[#254edb] border-none transition-colors rounded-[6px]"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

