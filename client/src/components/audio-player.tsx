import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Shuffle, 
  Repeat, 
  Heart,
  List,
  Monitor,
  Download
} from "lucide-react";
import { type YouTubeTrack } from "@shared/schema";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface AudioPlayerProps {
  track: YouTubeTrack;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function AudioPlayer({ track, isPlaying, onPlayPause }: AudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle progress bar click
  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle download
  const handleDownload = async () => {
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => onPlayPause();
    const handleError = () => {
      toast({
        title: "Playback Error",
        description: "Unable to play this track. Try downloading instead.",
        variant: "destructive",
      });
      onPlayPause();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onPlayPause, toast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(err => {
        console.error('Playback failed:', err);
        toast({
          title: "Playback Error",
          description: "Unable to play this track. Try downloading instead.",
          variant: "destructive",
        });
        onPlayPause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, onPlayPause, toast]);

  useEffect(() => {
    // Reset when track changes
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.src = `/api/stream/${track.videoId}`;
      audioRef.current.volume = volume;
    }
  }, [track.videoId, volume]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card-bg border-t border-dark px-4 py-3 z-40">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <img
              src={track.thumbnail}
              alt={`${track.title} thumbnail`}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-white truncate">{track.title}</h4>
              <p className="text-secondary text-sm truncate">{track.artist}</p>
            </div>
            <button className="text-secondary hover:text-white transition-colors p-2">
              <Heart className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDownload}
              className="text-secondary hover:text-spotify-green transition-colors p-2"
              title="Download MP3"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center flex-1 max-w-md mx-8">
            {/* Control Buttons */}
            <div className="flex items-center space-x-4 mb-2">
              <button 
                className={`transition-colors ${isShuffle ? 'text-spotify-green' : 'text-secondary hover:text-white'}`}
                onClick={() => setIsShuffle(!isShuffle)}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button className="text-secondary hover:text-white transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                onClick={onPlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button className="text-secondary hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              <button 
                className={`transition-colors ${repeatMode !== 'off' ? 'text-spotify-green' : 'text-secondary hover:text-white'}`}
                onClick={() => {
                  const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
                  const currentIndex = modes.indexOf(repeatMode);
                  setRepeatMode(modes[(currentIndex + 1) % modes.length]);
                }}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-3 w-full">
              <span className="text-xs text-secondary">{formatTime(currentTime)}</span>
              <div className="flex-1">
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <span className="text-xs text-secondary">{track.duration}</span>
            </div>
          </div>

          {/* Volume & Options */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <button className="text-secondary hover:text-white transition-colors">
              <List className="w-4 h-4" />
            </button>
            <button className="text-secondary hover:text-white transition-colors">
              <Monitor className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 w-24">
              <Volume2 className="w-4 h-4 text-secondary" />
              <div className="flex-1">
                <Slider
                  value={[volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
