import { Badge } from "@/components/ui/badge";
import type { UpdateWithDetails } from "@shared/schema";

interface UpdateItemProps {
  update: UpdateWithDetails;
}

const categoryColors = {
  Feature: "bg-blue-100 text-blue-800",
  "Bug Fix": "bg-yellow-100 text-yellow-800",
  "UI Update": "bg-purple-100 text-purple-800",
  Pricing: "bg-red-100 text-red-800",
  Integration: "bg-green-100 text-green-800",
};

const impactColors = {
  High: "text-orange-600",
  Medium: "text-yellow-600", 
  Low: "text-green-600",
};

export function UpdateItem({ update }: UpdateItemProps) {
  const timeAgo = update.scrapedAt 
    ? new Date(update.scrapedAt).toLocaleString()
    : "Unknown";

  const category = update.classification?.category || "Uncategorized";
  const impact = update.classification?.impact || "Unknown";

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <span className="font-medium text-gray-900">{update.competitor.name}</span>
            <Badge className={categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}>
              {category}
            </Badge>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">{update.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {update.classification?.summary || update.content.substring(0, 150) + "..."}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">{timeAgo}</span>
              {update.classification && (
                <div className={`flex items-center text-xs ${impactColors[impact as keyof typeof impactColors] || "text-gray-600"}`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  Impact: {impact}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
