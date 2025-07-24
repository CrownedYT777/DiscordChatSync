import { type SearchFilters, type YouTubeTrack } from "@shared/schema";

export interface YouTubeSearchResponse {
  tracks: YouTubeTrack[];
}

export async function searchYouTube(filters: SearchFilters): Promise<YouTubeSearchResponse> {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to search YouTube");
  }

  return response.json();
}
