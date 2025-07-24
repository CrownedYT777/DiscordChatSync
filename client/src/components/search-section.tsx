import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type SearchFilters } from "@shared/schema";

interface SearchSectionProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchSection({ onSearch }: SearchSectionProps) {
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState<SearchFilters["duration"]>("any");
  const [uploadDate, setUploadDate] = useState<SearchFilters["uploadDate"]>("any");
  const [order, setOrder] = useState<SearchFilters["order"]>("relevance");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch({
        query: query.trim(),
        duration,
        uploadDate,
        order,
        maxResults: 20,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Search & Stream Music{" "}
            <span className="text-spotify-green">Free</span>
          </h2>
          <p className="text-secondary text-lg">Discover millions of songs from YouTube</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="w-5 h-5 text-secondary" />
            </div>
            <Input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-card-bg border-dark rounded-full py-4 px-6 pl-14 text-white placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent h-14"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-spotify-green hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Search Filters */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Select value={duration} onValueChange={(value: SearchFilters["duration"]) => setDuration(value)}>
            <SelectTrigger className="bg-card-bg border-dark rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-spotify-green w-auto min-w-[150px]">
              <SelectValue placeholder="Any Duration" />
            </SelectTrigger>
            <SelectContent className="bg-card-bg border-dark text-white">
              <SelectItem value="any">Any Duration</SelectItem>
              <SelectItem value="short">Under 4 minutes</SelectItem>
              <SelectItem value="medium">4-20 minutes</SelectItem>
              <SelectItem value="long">Over 20 minutes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={uploadDate} onValueChange={(value: SearchFilters["uploadDate"]) => setUploadDate(value)}>
            <SelectTrigger className="bg-card-bg border-dark rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-spotify-green w-auto min-w-[150px]">
              <SelectValue placeholder="Upload Date" />
            </SelectTrigger>
            <SelectContent className="bg-card-bg border-dark text-white">
              <SelectItem value="any">Upload Date</SelectItem>
              <SelectItem value="hour">Last hour</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={order} onValueChange={(value: SearchFilters["order"]) => setOrder(value)}>
            <SelectTrigger className="bg-card-bg border-dark rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-spotify-green w-auto min-w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card-bg border-dark text-white">
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Upload date</SelectItem>
              <SelectItem value="viewCount">View count</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
