import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchFiltersSchema } from "@shared/schema";
import { z } from "zod";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_YOUTUBE_API_KEY || "";

export async function registerRoutes(app: Express): Promise<Server> {
  // YouTube search API route
  app.post("/api/search", async (req, res) => {
    try {
      const filters = searchFiltersSchema.parse(req.body);
      
      if (!YOUTUBE_API_KEY) {
        return res.status(500).json({ 
          message: "YouTube API key not configured" 
        });
      }

      // Build YouTube API URL with filters
      const baseUrl = "https://www.googleapis.com/youtube/v3/search";
      const params = new URLSearchParams({
        part: "snippet",
        q: filters.query,
        type: "video",
        videoCategoryId: "10", // Music category
        key: YOUTUBE_API_KEY,
        maxResults: filters.maxResults.toString(),
        order: filters.order,
      });

      // Add duration filter
      if (filters.duration !== "any") {
        const durationMap = {
          short: "short", // < 4 minutes
          medium: "medium", // 4-20 minutes
          long: "long", // > 20 minutes
        };
        params.append("videoDuration", durationMap[filters.duration]);
      }

      // Add upload date filter
      if (filters.uploadDate !== "any") {
        const now = new Date();
        let publishedAfter = "";
        
        switch (filters.uploadDate) {
          case "hour":
            publishedAfter = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
            break;
          case "today":
            publishedAfter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            break;
          case "week":
            publishedAfter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case "month":
            publishedAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case "year":
            publishedAfter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
            break;
        }
        
        if (publishedAfter) {
          params.append("publishedAfter", publishedAfter);
        }
      }

      const searchResponse = await fetch(`${baseUrl}?${params}`);
      const searchData = await searchResponse.json();

      if (!searchResponse.ok) {
        return res.status(searchResponse.status).json({
          message: searchData.error?.message || "YouTube API error"
        });
      }

      // Get video details for duration and view count
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
      const detailsUrl = "https://www.googleapis.com/youtube/v3/videos";
      const detailsParams = new URLSearchParams({
        part: "contentDetails,statistics",
        id: videoIds,
        key: YOUTUBE_API_KEY,
      });

      const detailsResponse = await fetch(`${detailsUrl}?${detailsParams}`);
      const detailsData = await detailsResponse.json();

      if (!detailsResponse.ok) {
        return res.status(detailsResponse.status).json({
          message: detailsData.error?.message || "YouTube API error"
        });
      }

      // Combine search results with video details
      const tracks = searchData.items.map((item: any) => {
        const details = detailsData.items.find((d: any) => d.id === item.id.videoId);
        
        // Parse duration from ISO 8601 format (PT4M13S) to readable format
        const duration = details?.contentDetails?.duration || "PT0S";
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match?.[1] || "0");
        const minutes = parseInt(match?.[2] || "0");
        const seconds = parseInt(match?.[3] || "0");
        
        let formattedDuration = "";
        if (hours > 0) {
          formattedDuration = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        } else {
          formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }

        // Format view count
        const viewCount = details?.statistics?.viewCount || "0";
        const views = parseInt(viewCount);
        let formattedViews = "";
        if (views >= 1000000000) {
          formattedViews = `${(views / 1000000000).toFixed(1)}B`;
        } else if (views >= 1000000) {
          formattedViews = `${(views / 1000000).toFixed(1)}M`;
        } else if (views >= 1000) {
          formattedViews = `${(views / 1000).toFixed(1)}K`;
        } else {
          formattedViews = views.toString();
        }

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          duration: formattedDuration,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          videoId: item.id.videoId,
          viewCount: formattedViews,
          publishedAt: item.snippet.publishedAt,
        };
      });

      res.json({ tracks });
    } catch (error) {
      console.error("Search error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid search parameters",
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Internal server error" 
        });
      }
    }
  });

  // Download route for YouTube audio
  app.get("/api/download/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      const { title } = req.query;

      if (!videoId) {
        return res.status(400).json({ message: "Video ID is required" });
      }

      // Validate video ID format
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return res.status(400).json({ message: "Invalid video ID format" });
      }

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Check if video exists and is available
      try {
        const info = await ytdl.getInfo(videoUrl);
        const videoTitle = (title as string) || info.videoDetails.title;
        
        // Sanitize filename
        const sanitizedTitle = videoTitle.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
        const filename = `${sanitizedTitle}.mp3`;

        // Set response headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'audio/mpeg');

        // Get audio stream with highest quality
        const audioStream = ytdl(videoUrl, {
          filter: 'audioonly',
          quality: 'highestaudio',
        });

        // Convert to MP3 using ffmpeg
        const ffmpegCommand = ffmpeg(audioStream)
          .audioBitrate(128)
          .format('mp3')
          .on('error', (err: any) => {
            console.error('FFmpeg error:', err);
            if (!res.headersSent) {
              res.status(500).json({ message: 'Audio conversion failed' });
            }
          })
          .on('end', () => {
            console.log('Download completed:', filename);
          });

        // Pipe the converted audio to response
        ffmpegCommand.pipe(res, { end: true });

      } catch (ytdlError) {
        console.error('YTDL error:', ytdlError);
        return res.status(404).json({ 
          message: "Video not found or unavailable for download" 
        });
      }

    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ 
        message: "Failed to download audio" 
      });
    }
  });

  // Stream route for YouTube audio
  app.get("/api/stream/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;

      if (!videoId) {
        return res.status(400).json({ message: "Video ID is required" });
      }

      // Validate video ID format
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return res.status(400).json({ message: "Invalid video ID format" });
      }

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      try {
        // Set headers for audio streaming
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');

        // Get audio stream
        const audioStream = ytdl(videoUrl, {
          filter: 'audioonly',
          quality: 'highestaudio',
        });

        // Convert to MP3 and stream directly
        const ffmpegCommand = ffmpeg(audioStream)
          .audioBitrate(128)
          .format('mp3')
          .on('error', (err: any) => {
            console.error('FFmpeg streaming error:', err);
            if (!res.headersSent) {
              res.status(500).json({ message: 'Audio streaming failed' });
            }
          })
          .on('end', () => {
            console.log('Stream ended for video:', videoId);
          });

        // Pipe the converted audio to response
        ffmpegCommand.pipe(res, { end: true });

      } catch (ytdlError) {
        console.error('YTDL streaming error:', ytdlError);
        return res.status(404).json({ 
          message: "Video not found or unavailable for streaming" 
        });
      }

    } catch (error) {
      console.error("Stream error:", error);
      res.status(500).json({ 
        message: "Failed to stream audio" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
