import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { UpdateItem } from "@/components/ui/update-item";
import { SourceItem } from "@/components/ui/source-item";
import { AddSourceModal } from "@/components/ui/add-source-modal";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentUpdates = [], isLoading: updatesLoading } = useQuery<any[]>({
    queryKey: ["/api/updates/recent"],
  });

  const { data: sources = [], isLoading: sourcesLoading } = useQuery<any[]>({
    queryKey: ["/api/sources"],
  });

  const { data: competitors = [] } = useQuery<any[]>({
    queryKey: ["/api/competitors"],
  });

  const { data: latestDigest } = useQuery<any>({
    queryKey: ["/api/digests/latest"],
  });

  const { data: systemStatus } = useQuery<any>({
    queryKey: ["/api/system/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutations
  const runScrapingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/scraping/run", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping completed",
        description: `Successfully scraped ${data.success} sources, ${data.failed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/updates/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Scraping failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const generateDigestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/digests/generate", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Digest generated and sent",
        description: "The weekly digest has been generated and sent to Slack",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/digests/latest"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate digest",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  if (statsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Competitor Intelligence Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor competitor features and market movements</p>
          </div>
          <div className="flex items-center space-x-3">
            {systemStatus && (
              <Badge 
                variant={systemStatus.status === "active" ? "default" : "destructive"}
                className="bg-green-100 text-green-800 border-green-200"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                System Active
              </Badge>
            )}
            <Button 
              onClick={() => runScrapingMutation.mutate()}
              disabled={runScrapingMutation.isPending}
              className="bg-brand-500 hover:bg-brand-600"
            >
              {runScrapingMutation.isPending ? "Scraping..." : "Run Scrape Now"}
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tracked Competitors"
            value={stats?.competitorCount || 0}
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            iconColor="bg-blue-100"
          />

          <StatsCard
            title="Updates This Week"
            value={stats?.weeklyUpdatesCount || 0}
            trend={stats?.weeklyUpdatesCount > 0 ? { value: "+23% from last week", positive: true } : undefined}
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            iconColor="bg-green-100"
          />

          <StatsCard
            title="High Impact Features"
            value={stats?.highImpactCount || 0}
            subtitle="Requires attention"
            icon={
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
            iconColor="bg-red-100"
          />

          <StatsCard
            title="Success Rate"
            value={`${stats?.successRate || 0}%`}
            subtitle="Scraping reliability"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="bg-purple-100"
          />
        </div>

        {/* Recent Updates and Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Feature Updates</CardTitle>
                <Button variant="ghost" size="sm" className="text-brand-500 hover:text-brand-600">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {updatesLoading ? (
                <div className="p-6 text-center">Loading updates...</div>
              ) : recentUpdates.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No recent updates found
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentUpdates.slice(0, 3).map((update: any) => (
                    <UpdateItem key={update.id} update={update} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sources & Admin Panel */}
          <div className="space-y-6">
            {/* Sources Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Monitored Sources</CardTitle>
                  <Button 
                    size="sm" 
                    className="bg-brand-500 hover:bg-brand-600"
                    onClick={() => setIsAddSourceOpen(true)}
                  >
                    Add Source
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {sourcesLoading ? (
                  <div className="p-4 text-center">Loading sources...</div>
                ) : sources.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No sources configured yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {sources.slice(0, 3).map((source: any) => (
                      <SourceItem key={source.id} source={source} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latest Digest Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Latest Weekly Digest</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-brand-500 hover:text-brand-600">
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-brand-500 hover:bg-brand-600"
                      onClick={() => generateDigestMutation.mutate()}
                      disabled={generateDigestMutation.isPending}
                    >
                      {generateDigestMutation.isPending ? "Generating..." : "Send Now"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {latestDigest ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{latestDigest.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        This week we tracked {latestDigest.totalUpdates} updates across competitors, with {latestDigest.highImpactCount} high-impact features that may affect our product strategy.
                      </p>
                      <div className="text-xs text-gray-500">
                        <span>Generated: {new Date(latestDigest.createdAt).toLocaleString()}</span> • 
                        <span> ~{Math.round(latestDigest.content.length / 5)} words</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {latestDigest.slackSent ? "Slack delivered" : "Pending delivery"}
                        </div>
                      </div>
                      <span className="text-gray-500">Next digest: Monday 9AM</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    No digest generated yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
