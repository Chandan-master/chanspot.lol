import React, { useState, useEffect } from 'react';
import { Spot } from '../types';
import { FRONT_IMAGE_URL, BACK_IMAGE_URL } from '../data/spotsData';

interface HeroProps {
  spots: Record<string, Spot>;
  totalRaised: number;
  onSpotClick: (spotKey: string) => void;
  onHeroSpotAction: (spotKey: string) => void;
  onGetSpotClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  spots,
  totalRaised,
  onHeroSpotAction,
  onGetSpotClick,
}) => {
  const [countdownText, setCountdownText] = useState('05d 06h 02m 18s');
  const [countdownLabel, setCountdownLabel] = useState('BIDDING OPENS IN');
  const [isLivePulse, setIsLivePulse] = useState(true);

  useEffect(() => {
    const formatDiff = (diff: number) => {
      if (diff <= 0) {
        setCountdownText('00d 00h 00m 00s');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdownText(
        `${String(days).padStart(2, '0')}d ${String(hours).padStart(
          2,
          '0'
        )}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(
          2,
          '0'
        )}s`
      );
    };

    const updateHeroCountdown = () => {
      const now = new Date();

      const launchDate = new Date(2026, 8, 21, 0, 0, 0);
      const diffToLaunch = launchDate.getTime() - now.getTime();

      if (diffToLaunch > 0) {
        setCountdownLabel('BIDDING OPENS IN');
        setIsLivePulse(true);
        formatDiff(diffToLaunch);
      } else {
        const currentDay = now.getDay();
        const isSaturdayNight = currentDay === 6 && now.getHours() >= 20;
        const isSunday = currentDay === 0;

        if (isSaturdayNight || isSunday) {
          setCountdownLabel('BIDDING CLOSED');
          setCountdownText('OPENS MONDAY');
          setIsLivePulse(false);
        } else {
          const targetSaturday = new Date(now);
          const daysUntilSaturday = 6 - currentDay;

          targetSaturday.setDate(
            now.getDate() + daysUntilSaturday
          );
          targetSaturday.setHours(20, 0, 0, 0);

          const diffWeekly =
            targetSaturday.getTime() - now.getTime();

          setCountdownLabel('BIDDING CLOSES IN');
          setIsLivePulse(true);
          formatDiff(diffWeekly);
        }
      }
    };

    updateHeroCountdown();

    const interval = setInterval(updateHeroCountdown, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const spotsList = Object.values(spots) as Spot[];

  const availableCount = spotsList.filter(
    (s) => !s.sponsor
  ).length;

  const fundingPct = Math.min(
    100,
    Math.round((totalRaised / 1000) * 100)
  );

  const frontSpotKeys = [
    'spot-front-center',
    'spot-left-chest',
    'spot-right-chest',
    'spot-left-sleeve',
    'spot-right-sleeve',
    'spot-lower-left',
    'spot-lower-right',
    'spot-left-thigh',
    'spot-right-thigh',
  ];

  const backSpotKeys = [
    'spot-back-center',
    'spot-back-lower-left',
    'spot-back-lower-right',
    'spot-full-butt',
    'spot-left-calf',
    'spot-right-calf',
  ];

  /*
   * MANUAL LOGO POSITIONING
   *
   * logoOffsetX:
   *   positive = right
   *   negative = left
   *
   * logoOffsetY:
   *   positive = down
   *   negative = up
   *
   * These values come from spotsData.ts.
   *
   * Example:
   * logoOffsetX: 5
   * logoOffsetY: -3
   */

  const getLogoStyle = (spot: Spot): React.CSSProperties => {
    const logoOffsetX =
      (spot as Spot & { logoOffsetX?: number }).logoOffsetX ?? 0;

    const logoOffsetY =
      (spot as Spot & { logoOffsetY?: number }).logoOffsetY ?? 0;

    return {
      transform: `translate(${logoOffsetX}px, ${logoOffsetY}px)`,
    };
  };

  const renderSpot = (key: string) => {
    const spot = spots[key];

    if (!spot) return null;

    const isSponsored = !!spot.sponsor;

    let domain = 'brand website';

    if (spot.sponsorUrl) {
      try {
        domain = new URL(spot.sponsorUrl)
          .hostname
          .replace(/^www\./, '');
      } catch {
        domain = spot.sponsorUrl;
      }
    }

    return (
      <button
        key={key}
        aria-label={spot.name}
        className={`cursor-pointer absolute rounded transition-all duration-200 border group z-10 flex items-center justify-center p-0.5 ${isSponsored
          ? 'border-transparent hover:ring-2 hover:ring-emerald-500/80'
          : 'border-transparent hover:border-emerald-500/80 hover:bg-emerald-400/10'
          }`}
        id={`hotspot-${key}`}
        onClick={() => onHeroSpotAction(key)}
        style={{
          left: spot.coords.left,
          top: spot.coords.top,
          width: spot.coords.width,
          height: spot.coords.height,
        }}
        type="button"
      >
        <div
          className="w-full h-full flex items-center justify-center overflow-hidden"
          id={`overlay-slot-${key}`}
        >
          {spot.logoUrl && (
            <img
              src={spot.logoUrl}
              alt={spot.sponsor || 'Sponsor'}
              className="max-w-[78%] max-h-[78%] w-auto h-auto object-contain pointer-events-none drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
              style={getLogoStyle(spot)}
            />
          )}
        </div>

        <span
          className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[11px] font-medium px-2.5 py-1 rounded shadow-md whitespace-nowrap z-30"
          id={`tooltip-${key}`}
        >
          {isSponsored ? (
            <span>
              Sponsored by{' '}
              <strong className="text-white">
                {spot.sponsor}
              </strong>{' '}
              • Click to visit{' '}
              <span className="text-emerald-300 underline font-mono">
                {domain} ↗
              </span>
            </span>
          ) : (
            <span>
              {spot.name} · Available · Bid now
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <section
      className="max-w-[1160px] mx-auto px-4 sm:px-6 pt-5 sm:pt-6 pb-6 relative"
      id="hero"
    >
      {/* Countdown */}
      <div className="flex justify-end mb-6">
        <div
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border border-[#e5e5e0] bg-white shadow-xs"
          id="hero-countdown-widget"
        >
          <span
            className="text-[10px] font-mono uppercase font-bold text-[#666666] tracking-wider"
            id="hero-countdown-label"
          >
            {countdownLabel}
          </span>

          <span
            className={`w-1.5 h-1.5 rounded-full ${isLivePulse
              ? 'bg-[#10b981] animate-pulse'
              : 'bg-neutral-400'
              }`}
            id="hero-countdown-dot"
          />

          <span
            className="font-mono text-xs font-bold text-[#0f0f0f] tabular-nums tracking-tight"
            id="hero-countdown-clock"
          >
            {countdownText}
          </span>
        </div>
      </div>

      {/* Headline */}
      <div className="max-w-4xl mx-auto text-center mb-8 px-2">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.1] m-0">
          Walking billboard for your brand
        </h1>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-base md:text-lg text-neutral-800 font-medium max-w-3xl mx-auto text-center leading-relaxed">
          <span className="bg-neutral-200/70 text-neutral-900 font-semibold px-2 py-0.5 rounded">
            Bid for a spot
          </span>{' '}
          on my clothes, and if you win,{' '}
          <span className="bg-neutral-200/70 text-neutral-900 font-semibold px-2 py-0.5 rounded">
            I’ll wear your brand
          </span>{' '}
          every day for 1 week — including{' '}
          <span className="bg-neutral-200/70 text-neutral-900 font-semibold px-2 py-0.5 rounded">
            daily college
          </span>{' '}
          and{' '}
          <span className="bg-neutral-200/70 text-neutral-900 font-semibold px-2 py-0.5 rounded">
            real-world exposure
          </span>
          .
        </div>
      </div>

      {/* Front + Back */}
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center justify-center">

          {/* FRONT */}
          <div className="relative flex flex-col items-center">
            <div className="mb-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase bg-neutral-900 text-white shadow-xs">
                FRONT VIEW
              </span>
            </div>

            <div
              className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-[1024/1536] max-h-[540px] flex items-center justify-center"
              id="hero-container-front"
            >
              <img
                alt="Chandan Front View advertising spots"
                className="w-full h-full object-contain block select-none pointer-events-none mix-blend-multiply"
                loading="eager"
                src={FRONT_IMAGE_URL}
              />

              {/* FRONT HOTSPOTS */}
              {frontSpotKeys.map(renderSpot)}
            </div>
          </div>

          {/* BACK */}
          <div className="relative flex flex-col items-center">
            <div className="mb-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase bg-neutral-900 text-white shadow-xs">
                BACK VIEW
              </span>
            </div>

            <div
              className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-[1024/1536] max-h-[540px] flex items-center justify-center"
              id="hero-container-back"
            >
              <img
                alt="Chandan Back View advertising spots"
                className="w-full h-full object-contain block select-none pointer-events-none mix-blend-multiply"
                loading="eager"
                src={BACK_IMAGE_URL}
              />

              {/* BACK HOTSPOTS */}
              {backSpotKeys.map(renderSpot)}
            </div>
          </div>
        </div>

        {/* Micro status bar */}
        <div className="mt-3 flex justify-between items-center px-2 text-[10px] uppercase font-semibold tracking-wider text-[#999999]">
          <span>INTERACTIVE WARDROBE MAPPING</span>

          <span className="flex items-center gap-1.5 text-[#0f0f0f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />

            <span id="spots-count-label">
              {availableCount} OF 15 SPOTS AVAILABLE
            </span>
          </span>
        </div>
      </div>

      {/* Raised Amount */}
      <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl border border-[#e5e5e0] bg-white shadow-xs">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span
              className="text-xl font-bold text-[#0f0f0f]"
              id="raised-amount"
            >
              ${totalRaised}
            </span>

            <span className="text-xs text-[#666666] font-medium">
              raised of $1,000 goal
            </span>
          </div>

          <span
            className="text-[11px] font-semibold text-[#0f0f0f] bg-neutral-100 px-2 py-0.5 rounded"
            id="funding-pct"
          >
            {fundingPct}% Funded
          </span>
        </div>

        <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden mb-2">
          <div
            className="bg-[#10b981] h-2 rounded-full transition-all duration-500"
            id="funding-progress-fill"
            style={{ width: `${fundingPct}%` }}
          />
        </div>

        <p className="text-xs text-[#666666] mb-3">
          1 week of daily campus exposure • Option for 2-week continuous run
        </p>

        <button
          className="w-full py-2.5 px-4 rounded-lg bg-[#0f0f0f] text-white text-xs font-semibold hover:bg-black transition-all text-center shadow-sm block active:scale-98 cursor-pointer"
          onClick={onGetSpotClick}
          type="button"
        >
          Get a spot
        </button>
      </div>
    </section>
  );
};