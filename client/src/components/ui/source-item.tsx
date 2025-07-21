import { Button } from "@/components/ui/button";
import type { SourceWithDetails } from "@shared/schema";

interface SourceItemProps {
  source: SourceWithDetails;
  onEdit?: () => void;
}

export function SourceItem({ source, onEdit }: SourceItemProps) {
  const statusColor = source.lastStatus === "success" ? "bg-green-400" : 
                     source.lastStatus === "failed" ? "bg-red-400" : 
                     "bg-yellow-400";

  const timeAgo = source.lastChecked 
    ? new Date(source.lastChecked).toLocaleString()
    : "Never";

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <div>
            <p className="font-medium text-gray-900">{source.name}</p>
            <p className="text-sm text-gray-500">{source.url}</p>
            {source.competitor && (
              <p className="text-xs text-gray-400">{source.competitor.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{timeAgo}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
            onClick={onEdit}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        </div>
      </div>
      {source.errorMessage && (
        <div className="mt-2 text-xs text-red-600">
          Error: {source.errorMessage}
        </div>
      )}
    </div>
  );
}
