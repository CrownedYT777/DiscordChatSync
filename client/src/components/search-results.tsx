import { useQuery } from "@tanstack/react-query";
import { Grid, List as ListIcon } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { type YouTubeTrack, type SearchFilters } from "@shared/schema";
import TrackCard from "./track-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SearchResultsProps {
  searchFilters: SearchFilters;
  searchTriggered: boolean;
  onTrackSelect: (track: YouTubeTrack) => void;
}

export default function SearchResults({ searchFilters, searchTriggered, onTrackSelect }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/search", searchFilters],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/search", searchFilters);
      return response.json();
    },
    enabled: searchTriggered && searchFilters.query.length > 0,
    retry: false,
  });

  // Show error toast when there's an error
  if (error && searchTriggered) {
    toast({
      title: "Search Error",
      description: error instanceof Error ? error.message : "Failed to search for tracks. Please try again.",
      variant: "destructive",
    });
  }

  if (!searchTriggered) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-card-bg rounded-xl p-4 animate-pulse">
                <div className="bg-hover-dark rounded-lg aspect-square mb-4"></div>
                <div className="bg-hover-dark h-4 rounded mb-2"></div>
                <div className="bg-hover-dark h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !data?.tracks) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-4">No Results Found</h3>
          <p className="text-secondary">
            {error instanceof Error 
              ? "Something went wrong while searching. Please try again." 
              : "Try adjusting your search terms or filters."}
          </p>
        </div>
      </section>
    );
  }

  const tracks = data.tracks as YouTubeTrack[];

  if (tracks.length === 0) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-4">No Results Found</h3>
          <p className="text-secondary">Try adjusting your search terms or filters.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-white">
            Search Results{" "}
            <span className="text-secondary text-lg">({tracks.length} results)</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "text-spotify-green" : "text-secondary hover-dark"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "text-spotify-green" : "text-secondary hover-dark"
              }`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {tracks.map((track) => (
            <TrackCard
              key={track.videoId}
              track={track}
              viewMode={viewMode}
              onSelect={() => onTrackSelect(track)}
            />
          ))}
        </div>

        {/* Load More Button */}
        {tracks.length >= searchFilters.maxResults && (
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              className="bg-card-bg hover-dark border-dark text-white px-8 py-3 rounded-full font-medium"
            >
              Load More Results
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
