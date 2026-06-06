'use client';
import { Fragment } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { StateNode } from '@/lib/jsm/parse';

const handleStyle = { width: 8, height: 8 };

const SIDES = [Position.Top, Position.Right, Position.Bottom, Position.Left] as const;

export function StateNode({ data, selected }: NodeProps<StateNode>) {
  return (
    <div
      className={`px-4 py-2.5 rounded-lg border-2 bg-white shadow-sm min-w-[160px] text-center transition-colors ${
        selected ? 'border-blue-500 shadow-blue-100' : 'border-zinc-300 hover:border-zinc-400'
      }`}
    >
      {SIDES.map(pos => (
        <Fragment key={pos}>
          <Handle id={`${pos}-s`} type="source" position={pos} style={handleStyle} />
          <Handle id={`${pos}-t`} type="target" position={pos} style={handleStyle} />
        </Fragment>
      ))}
      <span className="text-sm font-medium text-zinc-800 select-none">{data.label}</span>
    </div>
  );
}
