'use client';

interface ProgressBarProps {
  currentIndex: number;
  totalNodes: number;
  currentNodeId: string;
  previousNodeId?: string;
}

export function ProgressBar({
  currentIndex,
  totalNodes,
  currentNodeId,
  previousNodeId,
}: ProgressBarProps) {
  const percentage = (currentIndex / totalNodes) * 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-48 h-2 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-zinc-600 font-medium">
          Parsing nodes: {currentIndex} / {totalNodes}
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          {previousNodeId && (
            <>
              <span className="block">Previous: {previousNodeId}</span>
            </>
          )}
          <span className="block font-medium text-zinc-600">Current: {currentNodeId}</span>
        </p>
      </div>
    </div>
  );
}
