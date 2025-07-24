import { Play, Eye, Download } from "lucide-react";
import { type YouTubeTrack } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface TrackCardProps {
  track: YouTubeTrack;
  viewMode: "grid" | "list";
  onSelect: () => void;
}

export default function TrackCard({ track, viewMode, onSelect }: TrackCardProps) {
  const { toast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent track selection when clicking download
    
    try {
      toast({
        title: "Download Started",
        description: `Downloading "${track.title}"...`,
      });

      const response = await fetch(`/api/download/${track.videoId}?title=${encodeURIComponent(track.title)}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${track.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_')}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `"${track.title}" has been downloaded successfully!`,
        variant: "default",
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download this track. Please try again later.",
        variant: "destructive",
      });
    }
  };
  if (viewMode === "list") {
    return (
      <div 
        className="bg-card-bg rounded-lg p-4 hover-dark transition-all group cursor-pointer flex items-center space-x-4"
        onClick={onSelect}
      >
        <div className="relative flex-shrink-0">
          <img
            src={track.thumbnail}
            alt={`${track.title} thumbnail`}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/40 transition-all"></div>
          <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white mb-1 group-hover:text-spotify-green transition-colors truncate">
            {track.title}
          </h4>
          <p className="text-secondary text-sm truncate">{track.artist}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-secondary">
            <span>{track.duration}</span>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{track.viewCount}</span>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-spotify-green/10 hover:bg-spotify-green/20 text-spotify-green opacity-0 group-hover:opacity-100 transition-all"
            title="Download MP3"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-card-bg rounded-xl p-4 hover-dark transition-all group cursor-pointer"
      onClick={onSelect}
    >
      <div className="relative mb-4">
        <img
          src={track.thumbnail}
          alt={`${track.title} thumbnail`}
          className="w-full aspect-square object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/40 transition-all"></div>
        <button className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </button>
      </div>
      
      <h4 className="font-semibold text-white mb-1 group-hover:text-spotify-green transition-colors line-clamp-2">
        {track.title}
      </h4>
      <p className="text-secondary text-sm mb-2 truncate">{track.artist}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-secondary">
          <span>{track.duration}</span>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{track.viewCount}</span>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="p-2 rounded-full bg-spotify-green/10 hover:bg-spotify-green/20 text-spotify-green opacity-0 group-hover:opacity-100 transition-all"
          title="Download MP3"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
