import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon: React.ReactNode;
  iconColor: string;
}

export function StatsCard({ title, value, subtitle, trend, icon, iconColor }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
        </div>
        {(trend || subtitle) && (
          <div className="mt-4">
            {trend ? (
              <span className={`inline-flex items-center text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d={trend.positive ? "M7 11l3-3m0 0l3 3m-3-3v8" : "M17 13l-3 3m0 0l-3-3m3 3V5"}
                  />
                </svg>
                {trend.value}
              </span>
            ) : (
              <span className="text-sm text-gray-600">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
