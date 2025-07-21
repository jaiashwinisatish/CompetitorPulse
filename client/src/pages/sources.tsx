import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceItem } from "@/components/ui/source-item";
import { AddSourceModal } from "@/components/ui/add-source-modal";
import { useState } from "react";

export default function Sources() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);

  const { data: sources = [], isLoading: sourcesLoading } = useQuery<any[]>({
    queryKey: ["/api/sources"],
  });

  const { data: competitors = [] } = useQuery<any[]>({
    queryKey: ["/api/competitors"],
  });

  const groupedSources = sources.reduce((acc: any, source: any) => {
    const competitorName = source.competitor?.name || "Unknown";
    if (!acc[competitorName]) {
      acc[competitorName] = [];
    }
    acc[competitorName].push(source);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Source Management</h1>
            <p className="text-sm text-gray-600 mt-1">Configure and monitor competitor data sources</p>
          </div>
          <Button 
            className="bg-brand-500 hover:bg-brand-600"
            onClick={() => setIsAddSourceOpen(true)}
          >
            Add New Source
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sources</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{sources.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v0a2 2 0 002 2h14a2 2 0 002-2v0a2 2 0 00-2-2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sources</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {sources.filter((s: any) => s.isActive).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Sources</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {sources.filter((s: any) => s.lastStatus === "failed").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sources by Competitor */}
        <div className="space-y-6">
          {sourcesLoading ? (
            <div className="text-center py-12">Loading sources...</div>
          ) : sources.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v0a2 2 0 002 2h14a2 2 0 002-2v0a2 2 0 00-2-2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sources configured</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first competitor source to begin monitoring.</p>
                <Button 
                  className="bg-brand-500 hover:bg-brand-600"
                  onClick={() => setIsAddSourceOpen(true)}
                >
                  Add First Source
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedSources).map(([competitorName, competitorSources]: [string, any]) => (
              <Card key={competitorName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <span>{competitorName}</span>
                      <Badge variant="secondary">
                        {(competitorSources as any[]).length} sources
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {(competitorSources as any[]).map((source) => (
                      <SourceItem key={source.id} source={source} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Source Modal */}
      <AddSourceModal
        open={isAddSourceOpen}
        onOpenChange={setIsAddSourceOpen}
        competitors={competitors}
      />
    </div>
  );
}
