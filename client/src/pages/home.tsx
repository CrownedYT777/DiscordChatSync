import { useState } from "react";
import Header from "@/components/header";
import SearchSection from "@/components/search-section";
import SearchResults from "@/components/search-results";
import AudioPlayer from "@/components/audio-player";
import { type YouTubeTrack, type SearchFilters } from "@shared/schema";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: "",
    duration: "any",
    uploadDate: "any",
    order: "relevance",
    maxResults: 20,
  });
  
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setSearchTriggered(true);
  };

  const handleTrackSelect = (track: YouTubeTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <SearchSection onSearch={handleSearch} />
      <SearchResults 
        searchFilters={searchFilters}
        searchTriggered={searchTriggered}
        onTrackSelect={handleTrackSelect}
      />
      {currentTrack && (
        <AudioPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
        />
      )}
    </div>
  );
}
