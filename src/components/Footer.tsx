import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#e5e5e0] py-12 mt-12 bg-white">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <a className="font-extrabold text-xl tracking-tight text-[#0f0f0f]" href="#">
            ChanSpot
          </a>
          <p className="text-xs text-[#666666] mt-1 max-w-sm">
            Walking billboard advertising platform. Wearable physical sponsorships for the next
            generation of brands.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[#666666] font-medium">
          <a className="hover:text-[#0f0f0f] transition-colors" href="#how-it-works">
            How it works
          </a>
          <a className="hover:text-[#0f0f0f] transition-colors" href="#what-you-get">
            What you get
          </a>
          <a className="hover:text-[#0f0f0f] transition-colors" href="#about-me">
            About me
          </a>
          <a className="hover:text-[#0f0f0f] transition-colors" href="#spots">
            Bid for spots
          </a>
        </div>
      </div>

      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#999999]">
        <div>© 2026 ChanSpot. All rights reserved. Created with purpose.</div>
        <div className="mt-2 sm:mt-0">All physical spots verified & worn daily.</div>
      </div>
    </footer>
  );
};
