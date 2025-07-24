import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// YouTube track data schema
export const youtubeTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  duration: z.string(),
  thumbnail: z.string(),
  videoId: z.string(),
  viewCount: z.string(),
  publishedAt: z.string(),
});

export type YouTubeTrack = z.infer<typeof youtubeTrackSchema>;

// Search filters schema
export const searchFiltersSchema = z.object({
  query: z.string().min(1),
  duration: z.enum(["any", "short", "medium", "long"]).default("any"),
  uploadDate: z.enum(["any", "hour", "today", "week", "month", "year"]).default("any"),
  order: z.enum(["relevance", "date", "viewCount", "rating"]).default("relevance"),
  maxResults: z.number().min(1).max(50).default(20),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

// Current playing track schema
export const currentTrackSchema = z.object({
  track: youtubeTrackSchema,
  isPlaying: z.boolean(),
  currentTime: z.number(),
  volume: z.number().min(0).max(1),
});

export type CurrentTrack = z.infer<typeof currentTrackSchema>;
