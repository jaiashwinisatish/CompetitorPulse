import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSourceSchema, type InsertSource, type Competitor } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitors: Competitor[];
}

const sourceTypes = [
  { value: "website", label: "Website/Changelog" },
  { value: "twitter", label: "Twitter/X Account" },
  { value: "linkedin", label: "LinkedIn Page" },
  { value: "appstore", label: "App Store Page" },
  { value: "rss", label: "RSS Feed" },
];

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "6hours", label: "Every 6 hours" },
  { value: "12hours", label: "Every 12 hours" },
  { value: "weekly", label: "Weekly" },
];

export function AddSourceModal({ open, onOpenChange, competitors }: AddSourceModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState("");
  const [selectedCompetitor, setSelectedCompetitor] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("daily");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<InsertSource>({
    resolver: zodResolver(insertSourceSchema),
    defaultValues: {
      checkFrequency: "daily",
      isActive: true
    }
  });

  const createSourceMutation = useMutation({
    mutationFn: async (data: InsertSource) => {
      const response = await apiRequest("POST", "/api/sources", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
      toast({
        title: "Source added successfully",
        description: "The new source has been added and will be monitored."
      });
      onOpenChange(false);
      reset();
      setSelectedType("");
      setSelectedCompetitor("");
      setSelectedFrequency("daily");
    },
    onError: (error) => {
      toast({
        title: "Failed to add source",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InsertSource) => {
    const sourceData = {
      ...data,
      type: selectedType,
      competitorId: parseInt(selectedCompetitor),
      checkFrequency: selectedFrequency
    };
    createSourceMutation.mutate(sourceData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Source</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="type">Source Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                {sourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedType && <p className="text-sm text-red-600 mt-1">Please select a source type</p>}
          </div>

          <div>
            <Label htmlFor="competitorId">Competitor</Label>
            <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
              <SelectTrigger>
                <SelectValue placeholder="Select competitor" />
              </SelectTrigger>
              <SelectContent>
                {competitors.map((competitor) => (
                  <SelectItem key={competitor.id} value={competitor.id.toString()}>
                    {competitor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedCompetitor && <p className="text-sm text-red-600 mt-1">Please select a competitor</p>}
          </div>

          <div>
            <Label htmlFor="name">Source Name</Label>
            <Input
              id="name"
              placeholder="e.g., Figma Changelog"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="url">Source URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://figma.com/changelog"
              {...register("url")}
            />
            {errors.url && (
              <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="checkFrequency">Check Frequency</Label>
            <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedType || !selectedCompetitor}
            >
              {isSubmitting ? "Adding..." : "Add Source"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
