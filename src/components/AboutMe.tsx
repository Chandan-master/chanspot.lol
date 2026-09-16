import React from 'react';
import { AVATAR_IMAGE_URL } from '../data/spotsData';
import { CheckCircle2 } from 'lucide-react';

export const AboutMe: React.FC = () => {
  return (
    <section className="max-w-[1160px] mx-auto px-4 sm:px-6 py-12 border-t border-[#e5e5e0]" id="about-me">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-[#0f0f0f]">
          About me
        </h2>
        <p className="text-xs text-[#666666] mt-1">
          The human canvas behind the ChanSpot physical billboard campaign.
        </p>
      </div>

      <div className="p-6 md:p-8 rounded-2xl border border-[#e5e5e0] bg-white max-w-3xl">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img
            src={AVATAR_IMAGE_URL}
            alt="Chandan"
            className="w-24 h-24 rounded-full object-cover border-2 border-neutral-200 shadow-sm shrink-0"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#0f0f0f]">Chandan</h3>
            <p className="text-xs font-mono text-[#666666] mb-3">
              Computer Science Student & Real-World Advertising Canvas
            </p>
            <p className="text-sm text-neutral-700 leading-relaxed mb-4">
              Hey, I'm Chandan! I'm a CS student spending 8+ hours every single day navigating
              bustling university campuses, lecture halls, tech hubs, and commuter transit. I decided
              to turn my daily wardrobe into a transparent, community-backed physical billboard for
              indie hackers, startups, and creative brands.
            </p>

            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Active campus life with 15,000+ daily student foot traffic</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>100% genuine wearable guarantee — washed & worn daily</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Transparent public bidding log and proof-of-wear photos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
