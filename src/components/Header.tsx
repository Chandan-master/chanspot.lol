import React from 'react';

interface HeaderProps {
  onGetSpotClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGetSpotClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#fbfbfa]/90 backdrop-blur-md border-b border-[#e5e5e0]">
      <nav
        aria-label="Main Navigation"
        className="max-w-[1160px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4"
      >
        {/* Left: Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <a
            className="font-extrabold text-xl tracking-tight text-[#0f0f0f] hover:opacity-80 transition-opacity"
            href="#"
          >
            ChanSpot
          </a>
        </div>

        {/* Right: Links & Get a Spot button */}
        <div className="flex items-center space-x-6 shrink-0">
          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#666666]">
            <a className="hover:text-[#0f0f0f] transition-colors" href="#how-it-works">
              How it works
            </a>
            <a className="hover:text-[#0f0f0f] transition-colors" href="#what-you-get">
              What you get
            </a>
            <a className="hover:text-[#0f0f0f] transition-colors" href="#about-me">
              About me
            </a>
          </div>
          <button
            onClick={onGetSpotClick}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#0f0f0f] text-white text-xs font-semibold hover:bg-black transition-all shadow-sm active:scale-95 cursor-pointer"
            type="button"
          >
            Get a spot
          </button>
        </div>
      </nav>
    </header>
  );
};
