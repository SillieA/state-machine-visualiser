'use client';

const POSITIONS = ['top', 'right', 'bottom', 'left'] as const;

interface EdgeHandleSelectorProps {
  label: string;
  type: 'source' | 'target';
  value: string | null;
  onChange: (handle: string | null) => void;
}

export function EdgeHandleSelector({ label, type, value, onChange }: EdgeHandleSelectorProps) {
  const suffix = type === 'source' ? '-s' : '-t';

  const getDisplayValue = (fullId: string | null) => {
    if (!fullId) return null;
    return fullId.replace(suffix, '');
  };

  const displayValue = getDisplayValue(value);

  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-zinc-700 mb-2">{label}</label>
      <div className="flex justify-center gap-1 w-24 mx-auto">
        {/* Top */}
        <div className="col-start-2 flex justify-center">
          <button
            onClick={() => {
              const newHandle = displayValue === 'top' ? null : `top${suffix}`;
              onChange(newHandle);
            }}
            className={`text-xs py-1 px-2 rounded border transition-colors ${
              displayValue === 'top'
                ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            ↑
          </button>
        </div>
        {/* Left, Right, Bottom */}
        <div className="flex gap-1">
          <button
            onClick={() => {
              const newHandle = displayValue === 'left' ? null : `left${suffix}`;
              onChange(newHandle);
            }}
            className={`text-xs py-1 px-2 rounded border transition-colors ${
              displayValue === 'left'
                ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            ←
          </button>
          <button
            onClick={() => {
              const newHandle = displayValue === 'right' ? null : `right${suffix}`;
              onChange(newHandle);
            }}
            className={`text-xs py-1 px-2 rounded border transition-colors ${
              displayValue === 'right'
                ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            →
          </button>
        </div>
        {/* Bottom */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const newHandle = displayValue === 'bottom' ? null : `bottom${suffix}`;
              onChange(newHandle);
            }}
            className={`text-xs py-1 px-2 rounded border transition-colors ${
              displayValue === 'bottom'
                ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
            }`}
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
}
