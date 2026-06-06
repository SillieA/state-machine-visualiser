'use client';
import { useEffect, useRef } from 'react';

interface Props {
  x: number;
  y: number;
  onAddNode: () => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, onAddNode, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ top: y, left: x }}
      className="fixed z-50 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 min-w-[140px]"
    >
      <button
        className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
        onClick={() => { onAddNode(); onClose(); }}
      >
        + Add State
      </button>
    </div>
  );
}
