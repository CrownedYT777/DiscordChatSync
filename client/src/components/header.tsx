import { Music, Menu, Home, Compass, List } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-spotify-green to-youtube-red rounded-full flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">MusicStream</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-spotify-green transition-colors flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </a>
            <a href="#" className="text-secondary hover:text-white transition-colors flex items-center space-x-2">
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </a>
            <a href="#" className="text-secondary hover:text-white transition-colors flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>Playlists</span>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md hover-dark transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-white hover:text-spotify-green transition-colors flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
              <a href="#" className="text-secondary hover:text-white transition-colors flex items-center space-x-2">
                <Compass className="w-4 h-4" />
                <span>Discover</span>
              </a>
              <a href="#" className="text-secondary hover:text-white transition-colors flex items-center space-x-2">
                <List className="w-4 h-4" />
                <span>Playlists</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
