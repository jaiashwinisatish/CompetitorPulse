import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Classifications() {
  const { data: stats = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/classifications/stats"],
  });

  const categoryColors = {
    Feature: "bg-blue-100 text-blue-800",
    "Bug Fix": "bg-yellow-100 text-yellow-800",
    "UI Update": "bg-purple-100 text-purple-800",
    Pricing: "bg-red-100 text-red-800",
    Integration: "bg-green-100 text-green-800",
  };

  const impactColors = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800", 
    Low: "bg-green-100 text-green-800",
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Classification Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">AI-powered categorization insights</p>
        </div>
      </header>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">Loading classification data...</div>
        ) : stats.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classifications yet</h3>
              <p className="text-gray-600">Once you start monitoring competitors, AI classifications will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>By Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      stats.reduce((acc, stat) => {
                        if (!acc[stat.category]) acc[stat.category] = 0;
                        acc[stat.category] += stat.count;
                        return acc;
                      }, {})
                    ).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}>
                            {category}
                          </Badge>
                        </div>
                        <span className="font-semibold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By Impact Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      stats.reduce((acc, stat) => {
                        if (!acc[stat.impact]) acc[stat.impact] = 0;
                        acc[stat.impact] += stat.count;
                        return acc;
                      }, {})
                    ).map(([impact, count]) => (
                      <div key={impact} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={impactColors[impact as keyof typeof impactColors] || "bg-gray-100 text-gray-800"}>
                            {impact} Impact
                          </Badge>
                        </div>
                        <span className="font-semibold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Classification Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Impact</th>
                        <th className="text-right py-3 px-4">Count</th>
                        <th className="text-right py-3 px-4">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((stat, index) => {
                        const total = stats.reduce((sum, s) => sum + s.count, 0);
                        const percentage = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                        
                        return (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <Badge className={categoryColors[stat.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-800"}>
                                {stat.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={impactColors[stat.impact as keyof typeof impactColors] || "bg-gray-100 text-gray-800"}>
                                {stat.impact}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold">{stat.count}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}