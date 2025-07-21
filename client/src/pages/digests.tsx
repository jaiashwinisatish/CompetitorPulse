import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Digests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: latestDigest, isLoading } = useQuery<any>({
    queryKey: ["/api/digests/latest"],
  });

  const generateDigestMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/digests/generate", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Digest generated successfully",
        description: "The weekly digest has been created and sent to Slack",
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

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Weekly Digests</h1>
            <p className="text-sm text-gray-600 mt-1">AI-generated competitive intelligence summaries</p>
          </div>
          <Button 
            className="bg-brand-500 hover:bg-brand-600"
            onClick={() => generateDigestMutation.mutate()}
            disabled={generateDigestMutation.isPending}
          >
            {generateDigestMutation.isPending ? "Generating..." : "Generate New Digest"}
          </Button>
        </div>
      </header>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">Loading digest...</div>
        ) : !latestDigest ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No digest available</h3>
              <p className="text-gray-600 mb-4">Generate your first weekly competitive intelligence digest.</p>
              <Button 
                className="bg-brand-500 hover:bg-brand-600"
                onClick={() => generateDigestMutation.mutate()}
                disabled={generateDigestMutation.isPending}
              >
                {generateDigestMutation.isPending ? "Generating..." : "Generate First Digest"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Digest Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Updates</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{latestDigest.totalUpdates || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Impact</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{latestDigest.highImpactCount || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Slack Delivery</p>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        {latestDigest.slackSent ? "Delivered" : "Pending"}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      latestDigest.slackSent ? "bg-green-100" : "bg-yellow-100"
                    }`}>
                      <svg className={`w-6 h-6 ${
                        latestDigest.slackSent ? "text-green-600" : "text-yellow-600"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Latest Digest Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="mb-2">{latestDigest.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Generated: {new Date(latestDigest.createdAt).toLocaleDateString()}</span>
                      <Badge variant="secondary">
                        {Math.round(latestDigest.content.length / 5)} words
                      </Badge>
                      {latestDigest.slackSent && (
                        <Badge className="bg-green-100 text-green-800">
                          Delivered to Slack
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm">
                    {latestDigest.content}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Period: {new Date(latestDigest.weekStart).toLocaleDateString()} - {new Date(latestDigest.weekEnd).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Next digest: Monday 9AM EST
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}