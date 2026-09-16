import React, { useState } from 'react';
import { Spot } from '../types';
import { ExternalLink, ArrowUpRight } from 'lucide-react';

interface SpotsGridProps {
  spots: Record<string, Spot>;
  onSelectSpot: (spotKey: string) => void;
}

export const SpotsGrid: React.FC<SpotsGridProps> = ({ spots, onSelectSpot }) => {
  const [filter, setFilter] = useState<'all' | 'front' | 'back' | 'shirt' | 'denim'>('all');

  const spotsList = Object.values(spots) as Spot[];

  const filteredSpots = spotsList.filter((spot) => {
    if (filter === 'front') return spot.view === 'front';
    if (filter === 'back') return spot.view === 'back';
    if (filter === 'shirt') return spot.isShirt;
    if (filter === 'denim') return !spot.isShirt;
    return true;
  });

  const frontCount = spotsList.filter((s) => s.view === 'front').length;
  const backCount = spotsList.filter((s) => s.view === 'back').length;
  const shirtCount = spotsList.filter((s) => s.isShirt).length;
  const denimCount = spotsList.filter((s) => !s.isShirt).length;

  return (
    <section className="max-w-[1160px] mx-auto px-4 sm:px-6 py-12 border-t border-[#e5e5e0]" id="spots">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0f0f0f]">
            Available Spots
          </h2>
          <p className="text-xs text-[#666666] mt-1">
            Explore all 15 physical positions across front & back. Click to submit a bid or view current winner.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#0f0f0f] shadow-xs'
                : 'text-[#666666] hover:text-[#0f0f0f]'
            }`}
            type="button"
          >
            All Spots ({spotsList.length})
          </button>
          <button
            onClick={() => setFilter('front')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filter === 'front'
                ? 'bg-white text-[#0f0f0f] shadow-xs'
                : 'text-[#666666] hover:text-[#0f0f0f]'
            }`}
            type="button"
          >
            Front View ({frontCount})
          </button>
          <button
            onClick={() => setFilter('back')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filter === 'back'
                ? 'bg-white text-[#0f0f0f] shadow-xs'
                : 'text-[#666666] hover:text-[#0f0f0f]'
            }`}
            type="button"
          >
            Back View ({backCount})
          </button>
          <button
            onClick={() => setFilter('shirt')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filter === 'shirt'
                ? 'bg-white text-[#0f0f0f] shadow-xs'
                : 'text-[#666666] hover:text-[#0f0f0f]'
            }`}
            type="button"
          >
            Shirt ({shirtCount})
          </button>
          <button
            onClick={() => setFilter('denim')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              filter === 'denim'
                ? 'bg-white text-[#0f0f0f] shadow-xs'
                : 'text-[#666666] hover:text-[#0f0f0f]'
            }`}
            type="button"
          >
            Denim ({denimCount})
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSpots.map((spot) => {
          const isSponsored = !!spot.sponsor;

          return (
            <div
              key={spot.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-md ${
                isSponsored
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-[#e5e5e0] bg-white'
              }`}
            >
              <div>
                {/* Header: Name + Badge */}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-[#0f0f0f] tracking-tight">{spot.name}</h3>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSponsored
                        ? 'bg-emerald-100 text-[#10b981]'
                        : 'bg-neutral-100 text-[#666666]'
                    }`}
                  >
                    {isSponsored ? 'SPONSORED' : 'AVAILABLE'}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-[#666666] mb-2">{spot.zone}</div>
                <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed mb-3">
                  {spot.desc}
                </p>

                {/* Status Box */}
                <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-2.5 mb-3.5">
                  {isSponsored ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {spot.logoUrl ? (
                          <img
                            src={spot.logoUrl}
                            alt={spot.sponsor || 'Sponsor'}
                            className="w-7 h-7 object-contain rounded bg-white p-0.5 border border-neutral-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                            {spot.sponsor?.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-neutral-900 truncate">
                            {spot.sponsor}
                          </div>
                          {spot.tagline && (
                            <div className="text-[10px] text-neutral-500 truncate">
                              {spot.tagline}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-200/60">
                        <span className="text-neutral-500">Winning Bid</span>
                        <span className="font-mono font-bold text-emerald-600">
                          ${spot.currentBid}
                        </span>
                      </div>

                      {spot.sponsorUrl && (
                        <a
                          href={spot.sponsorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Visit sponsor site</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] uppercase font-mono text-neutral-400">
                          Starting Bid
                        </span>
                        <span className="font-mono font-bold text-sm text-neutral-900">
                          ${spot.nextMinBid}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
                        Ready for logo
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  onClick={() => onSelectSpot(spot.id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSponsored
                      ? 'bg-neutral-900 text-white hover:bg-black shadow-xs'
                      : 'bg-neutral-900 text-white hover:bg-black shadow-xs'
                  }`}
                  type="button"
                >
                  <span>{isSponsored ? `Outbid ($${spot.nextMinBid} min)` : 'Bid for this spot'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
