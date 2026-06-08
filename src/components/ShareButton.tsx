'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useLibraryStore } from '@/lib/libraryStore';
import { encodeJSMCompressed } from '@/lib/shareState';

export function ShareButton() {
  const input = useStore(s => s.input);
  const nodes = useStore(s => s.nodes);
  const layoutAlgorithm = useStore(s => s.layoutAlgorithm);
  const edgeControlPoints = useStore(s => s.edgeControlPoints);
  const activeId = useLibraryStore(s => s.activeId);
  const entries = useLibraryStore(s => s.entries);

  const [copied, setCopied] = useState(false);

  function copyShareUrl() {
    const entry = entries.find(e => e.id === activeId);
    if (!entry || !input) return;

    // Use existing entry data with current state
    const positions: Record<string, { x: number; y: number }> = {};
    nodes.forEach(n => {
      positions[n.id] = n.position;
    });

    const jsm = {
      ...entry,
      raw: input,
      positions,
      layoutAlgorithm,
      edgeData: Object.keys(edgeControlPoints).length > 0 ? entry.edgeData : undefined,
    };

    const encoded = encodeJSMCompressed(jsm);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + '/state-machine-visualiser' : '';
    const url = `${baseUrl}?name=${encodeURIComponent(entry.name)}&data=${encoded}`;

    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copyShareUrl}
      disabled={!input || !activeId}
      className="text-xs text-zinc-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-2 py-1"
      title="Copy shareable link"
    >
      {copied ? '✓ Copied' : '🔗 Share'}
    </button>
  );
}
