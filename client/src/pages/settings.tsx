import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompetitorSchema, type InsertCompetitor } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);

  const { data: systemStatus } = useQuery<any>({
    queryKey: ["/api/system/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: competitors = [] } = useQuery<any[]>({
    queryKey: ["/api/competitors"],
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<InsertCompetitor>({
    resolver: zodResolver(insertCompetitorSchema),
    defaultValues: {
      isActive: true
    }
  });

  const createCompetitorMutation = useMutation({
    mutationFn: async (data: InsertCompetitor) => {
      const response = await apiRequest("POST", "/api/competitors", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/competitors"] });
      toast({
        title: "Competitor added successfully",
        description: "You can now add sources to monitor this competitor."
      });
      reset();
      setIsAddingCompetitor(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add competitor",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const runScrapingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/scraping/run", {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Manual scraping completed",
        description: `Successfully scraped ${data.success} sources, ${data.failed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/system/status"] });
    },
    onError: (error) => {
      toast({
        title: "Scraping failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCompetitor) => {
    createCompetitorMutation.mutate(data);
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Configure competitors and system preferences</p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  systemStatus?.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-sm">
                  System: {systemStatus?.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  systemStatus?.database === 'connected' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-sm">
                  Database: {systemStatus?.database === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  systemStatus?.slackConnected ? 'bg-green-400' : 'bg-yellow-400'
                }`}></div>
                <span className="text-sm">
                  Slack: {systemStatus?.slackConnected ? 'Connected' : 'Not Configured'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Success Rate: {systemStatus?.successRate || 0}%
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Last Updated: {systemStatus?.lastUpdate ? new Date(systemStatus.lastUpdate).toLocaleString() : 'Never'}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => runScrapingMutation.mutate()}
                  disabled={runScrapingMutation.isPending}
                >
                  {runScrapingMutation.isPending ? "Running..." : "Run Manual Scrape"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Competitor Management</CardTitle>
              <Button 
                size="sm" 
                className="bg-brand-500 hover:bg-brand-600"
                onClick={() => setIsAddingCompetitor(!isAddingCompetitor)}
              >
                {isAddingCompetitor ? "Cancel" : "Add Competitor"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isAddingCompetitor && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Competitor Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Figma"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://figma.com"
                        {...register("website")}
                      />
                      {errors.website && (
                        <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of the competitor"
                      {...register("description")}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsAddingCompetitor(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-brand-500 hover:bg-brand-600"
                    >
                      {isSubmitting ? "Adding..." : "Add Competitor"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {competitors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No competitors added yet. Add your first competitor to start monitoring.
                </div>
              ) : (
                competitors.map((competitor: any) => (
                  <div key={competitor.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{competitor.name}</h3>
                        {competitor.website && (
                          <a 
                            href={competitor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-brand-500 hover:text-brand-600"
                          >
                            {competitor.website}
                          </a>
                        )}
                        {competitor.description && (
                          <p className="text-sm text-gray-500">{competitor.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={competitor.isActive ? "default" : "secondary"}>
                        {competitor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Automatic Scraping</h4>
                  <p className="text-sm text-gray-600">Runs every 6 hours to check for new updates</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Weekly Digest</h4>
                  <p className="text-sm text-gray-600">Generates and sends summary every Monday at 9 AM EST</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">High Impact Alerts</h4>
                  <p className="text-sm text-gray-600">Immediate notifications for high-impact competitor updates</p>
                </div>
                <Badge className={systemStatus?.slackConnected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {systemStatus?.slackConnected ? "Enabled" : "Slack Required"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}