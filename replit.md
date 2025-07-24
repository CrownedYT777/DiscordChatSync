# MusicStream - YouTube Music Player

## Overview

MusicStream is a modern web application that allows users to search and stream music from YouTube. Built with React on the frontend and Express.js on the backend, the application provides a Spotify-like interface for discovering and playing music tracks from YouTube's vast library.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom music app theming (dark theme with Spotify-green accents)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Integration**: YouTube Data API v3 for music search
- **Download Engine**: ytdl-core for YouTube audio extraction
- **Audio Processing**: FFmpeg for MP3 conversion and audio optimization
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Development**: TSX for TypeScript execution in development

### Database Design
- **Primary Database**: PostgreSQL (configured via Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Current Schema**: 
  - Users table with username/password authentication
  - Schema designed to support future features like playlists and favorites

## Key Components

### Search & Discovery
- **Search Filters**: Comprehensive filtering by duration, upload date, sort order, and result count
- **YouTube Integration**: Direct integration with YouTube Data API for real-time search results
- **Grid/List View**: Flexible display modes for search results

### Audio Player
- **Real-time Streaming**: Direct audio streaming from YouTube via server-side conversion
- **Track Management**: Current track state with play/pause controls
- **Player Controls**: Volume control, progress tracking, shuffle, and repeat modes
- **Visual Interface**: Progress bars, time display, and track information
- **Download Feature**: One-click MP3 download from the player interface
- **Error Handling**: Graceful fallback with user notifications for streaming issues

### Music Download System
- **One-Click Download**: Download button on each track card and in the audio player
- **MP3 Conversion**: Server-side audio extraction and conversion using ytdl-core and FFmpeg
- **Progress Notifications**: Toast notifications for download start, completion, and errors
- **File Naming**: Automatic sanitization of track titles for safe filenames

### UI Components
- **Design System**: Complete shadcn/ui component library
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Dark Theme**: Custom dark theme optimized for music applications
- **Toast Notifications**: User feedback for errors and actions

## Data Flow

### Search Flow
1. User enters search query with optional filters
2. Frontend validates input using Zod schemas
3. POST request to `/api/search` with search parameters
4. Backend constructs YouTube API request with proper filtering
5. YouTube API returns video data
6. Backend transforms and returns structured track data
7. Frontend displays results in grid or list format

### Audio Playback Flow
1. User selects track from search results
2. Track data stored in component state
3. Audio player component receives track information
4. Player creates streaming URL: `/api/stream/:videoId`
5. Server extracts and converts YouTube audio to MP3 stream
6. HTML5 audio element plays the converted stream
7. Real-time progress tracking and volume control
8. Error handling with user notifications for failed streams

### Download Flow
1. User clicks download button on track card or player
2. Frontend displays "Download Started" toast notification
3. GET request to `/api/download/:videoId` with track title
4. Backend validates video ID and fetches YouTube audio stream
5. Server uses ytdl-core to extract highest quality audio
6. FFmpeg converts audio stream to MP3 format (128kbps)
7. Converted audio streamed directly to client as file download
8. Frontend handles blob download and shows completion notification

### Error Handling
- YouTube API errors handled with user-friendly messages
- Network errors displayed via toast notifications
- Form validation errors shown inline
- 404 routing handled with custom not-found page

## External Dependencies

### YouTube Data API v3
- **Purpose**: Music search and metadata retrieval
- **Configuration**: API key stored in environment variables
- **Rate Limits**: Handled through query optimization and result caching
- **Search Filters**: Duration, upload date, category (music), and sorting options

### YouTube Download Dependencies
- **ytdl-core**: JavaScript library for extracting YouTube video/audio streams
- **fluent-ffmpeg**: Node.js wrapper for FFmpeg audio/video processing
- **FFmpeg**: System dependency for audio conversion and optimization
- **Audio Quality**: Extracts highest available audio quality, converts to 128kbps MP3

### Neon Database
- **Purpose**: PostgreSQL database hosting
- **Connection**: Serverless connection via connection string
- **Features**: Automatic scaling and built-in connection pooling

### UI Dependencies
- **Radix UI**: Headless UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle Kit manages schema migrations

### Environment Configuration
- **Development**: Local development with Vite dev server and TSX
- **Production**: Bundled server serves static files and API routes
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **YouTube API**: API key via `YOUTUBE_API_KEY` environment variable

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared TypeScript schemas
├── migrations/      # Database migrations
└── dist/           # Production build output
```

### Development Features
- **Hot Reload**: Vite HMR for frontend, TSX for backend
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code
- **Development Tools**: Replit-specific development tooling and error overlays
- **Path Aliases**: Clean imports using `@/` for client code and `@shared/` for shared schemas

The application is designed for easy deployment on platforms like Replit, with automatic builds and environment-based configuration switching between development and production modes.