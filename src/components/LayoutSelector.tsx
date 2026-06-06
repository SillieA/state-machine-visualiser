'use client';
import type { LayoutType } from '@/lib/jsm/layout';

interface LayoutSelectorProps {
  value: LayoutType;
  onChange: (type: LayoutType) => void;
}

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as LayoutType)}
      className="text-xs bg-white border border-zinc-200 rounded px-2 py-1.5 text-zinc-800 hover:border-blue-400 shadow-sm transition-colors"
    >
      <option value="hierarchical">Hierarchical</option>
      <option value="grid">Grid</option>
    </select>
  );
}
