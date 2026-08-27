'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MarkdownRendererProps {
  text: string;
}

export function parseMarkdownToReact(text: string): React.ReactNode[] {
  if (!text) return [];

  // Helper to format bold, italic, and inline citations
  const formatInlineText = (str: string): React.ReactNode[] => {
    // Regex matches ***bold-italic***, **bold**, *italic*, and citation patterns like #EU-ACT-ART-5 or #SOT-COMP-2026
    const boldItalicRegex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|\[?#(?:SOT-[A-Z0-9-]{4,12}|EU-ACT-ART-\d{1,3})\]?)/g;
    const parts = str.split(boldItalicRegex);

    return parts.map((part, i) => {
      if (part.startsWith('***') && part.endsWith('***')) {
        return (
          <strong key={i} className="font-extrabold italic text-white">
            {part.slice(3, -3)}
          </strong>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-neutral-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('#') || (part.startsWith('[') && part.includes('#'))) {
        const code = part.replace(/[\[#\]]/g, '').trim();
        const isAiAct = code.startsWith('EU-ACT-');
        const href = isAiAct ? `/ai-act/${code}` : `/registry/${code}`;

        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-1.5 py-0.5 mx-0.5 inline-flex items-center gap-1 rounded bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#0a0a0c] transition-colors duration-150 font-mono text-[11px] font-bold text-emerald-400 border border-emerald-500/20 align-baseline cursor-pointer"
            title={`View detail brief for #${code}`}
          >
            #{code}
            <ArrowRight className="w-2.5 h-2.5 shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  // Track open lists stack to support nesting
  interface ListGroup {
    items: React.ReactNode[];
    type: 'ul' | 'ol';
    depth: number;
  }
  const listStack: ListGroup[] = [];

  const closeListsUpTo = (targetDepth: number) => {
    while (listStack.length > targetDepth) {
      const last = listStack.pop();
      if (!last) break;

      const listElement = last.type === 'ul' ? (
        <ul
          key={`list-group-${elements.length}-${listStack.length}`}
          className={`list-disc pl-5 my-2.5 space-y-2 text-neutral-300 ${
            last.depth > 0 ? 'list-[circle]' : 'list-outside'
          }`}
        >
          {last.items}
        </ul>
      ) : (
        <ol
          key={`list-group-${elements.length}-${listStack.length}`}
          className="list-decimal pl-5 my-2.5 space-y-2 text-neutral-300 list-outside"
        >
          {last.items}
        </ol>
      );

      if (listStack.length > 0) {
        const parent = listStack[listStack.length - 1];
        const lastItemIdx = parent.items.length - 1;
        if (lastItemIdx >= 0) {
          const prevItem = parent.items[lastItemIdx];
          const prevElement = prevItem as React.ReactElement<any>;
          // Wrap previous item child content and append the nested list element
          parent.items[lastItemIdx] = (
            <li key={`nested-li-${lastItemIdx}`} className="space-y-1">
              {React.isValidElement(prevItem) && prevElement.props && 'children' in prevElement.props
                ? prevElement.props.children
                : prevItem}
              {listElement}
            </li>
          );
        } else {
          parent.items.push(<li key="nested-orphan">{listElement}</li>);
        }
      } else {
        elements.push(listElement);
      }
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      closeListsUpTo(0);
      return;
    }

    // Determine indentation level
    const leadingSpaces = line.match(/^ */)?.[0].length || 0;
    // Map spaces to simple levels: 0 (no indent), 1 (indent 2-4 spaces), 2 (indent > 4 spaces)
    const depth = leadingSpaces > 4 ? 2 : leadingSpaces >= 2 ? 1 : 0;

    // Detect list items
    const bulletMatch = trimmed.match(/^[\*\-\+]\s+(.*)/);
    const numMatch = trimmed.match(/^\d+\.\s+(.*)/);

    if (bulletMatch) {
      const content = bulletMatch[1];
      closeListsUpTo(depth + 1);

      while (listStack.length <= depth) {
        listStack.push({ items: [], type: 'ul', depth: listStack.length });
      }

      listStack[depth].items.push(
        <li key={`li-${lineIdx}`} className="text-[13.5px] text-neutral-300 leading-[1.7] pl-1">
          {formatInlineText(content)}
        </li>
      );
    } else if (numMatch) {
      const content = numMatch[1];
      closeListsUpTo(depth + 1);

      while (listStack.length <= depth) {
        listStack.push({ items: [], type: 'ol', depth: listStack.length });
      }

      listStack[depth].items.push(
        <li key={`li-${lineIdx}`} className="text-[13.5px] text-neutral-300 leading-[1.7] pl-1">
          {formatInlineText(content)}
        </li>
      );
    } else {
      // Plain paragraph/text line
      closeListsUpTo(depth);

      if (listStack.length > 0) {
        const parent = listStack[listStack.length - 1];
        const lastItemIdx = parent.items.length - 1;
        if (lastItemIdx >= 0) {
          const prevItem = parent.items[lastItemIdx];
          const prevElement = prevItem as React.ReactElement<any>;
          parent.items[lastItemIdx] = (
            <li key={`li-extended-${lastItemIdx}`} className="space-y-1">
              <div>
                {React.isValidElement(prevItem) && prevElement.props && 'children' in prevElement.props
                  ? prevElement.props.children
                  : prevItem}
              </div>
              <p className="text-[13.5px] text-neutral-300 leading-[1.6] mt-1 pl-1">
                {formatInlineText(trimmed)}
              </p>
            </li>
          );
        } else {
          parent.items.push(<li key={`li-text-${lineIdx}`}>{formatInlineText(trimmed)}</li>);
        }
      } else {
        elements.push(
          <p key={`p-${lineIdx}`} className="text-[14px] text-neutral-300 leading-[1.75] my-2.5">
            {formatInlineText(trimmed)}
          </p>
        );
      }
    }
  });

  closeListsUpTo(0);
  return elements;
}

export default function MarkdownRenderer({ text }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none font-sans text-[13.5px] leading-relaxed text-neutral-300">
      {parseMarkdownToReact(text)}
    </div>
  );
}
