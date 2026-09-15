import React, { useState, useEffect } from 'react';
import { Spot, BidFormValues } from './types';
import { INITIAL_SPOTS } from './data/spotsData';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SpotsGrid } from './components/SpotsGrid';
import { HowItWorks } from './components/HowItWorks';
import { WhatYouGet } from './components/WhatYouGet';
import { AboutMe } from './components/AboutMe';
import { Footer } from './components/Footer';
import { BidDrawer } from './components/BidDrawer';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'chanspot_live_inventory_v3';

export const App: React.FC = () => {
  const [spots, setSpots] = useState<Record<string, Spot>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged: Record<string, Spot> = { ...INITIAL_SPOTS, ...parsed };
        // Normalize nextMinBid to enforce 2x dynamic pricing rule
        (Object.values(merged) as Spot[]).forEach((s) => {
          s.nextMinBid = s.currentBid > 0 ? s.currentBid * 2 : 10;
        });
        return merged;
      }
    } catch {
      // Fallback
    }
    return INITIAL_SPOTS;
  });

  const [selectedSpotKey, setSelectedSpotKey] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to localStorage whenever spots change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
    } catch (e) {
      console.warn('Failed to save spots to localStorage', e);
    }
  }, [spots]);

  // Calculate total raised
  const totalRaised = (Object.values(spots) as Spot[]).reduce((acc: number, spot: Spot) => {
    if (spot.sponsor && spot.currentBid > 0) {
      return acc + spot.currentBid * (spot.durationWeeks || 1);
    }
    return acc;
  }, 0);

  const handleHeroSpotAction = (spotKey: string) => {
    const spot = spots[spotKey];
    if (!spot) return;

    if (spot.sponsor && spot.sponsorUrl) {
      window.open(spot.sponsorUrl, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedSpotKey(spotKey);
      setIsDrawerOpen(true);
    }
  };

  const handleOpenSpotDrawer = (spotKey: string) => {
    setSelectedSpotKey(spotKey);
    setIsDrawerOpen(true);
  };

  const handleGetSpotClick = () => {
    // Smooth scroll to spots grid
    const spotsSection = document.getElementById('spots');
    if (spotsSection) {
      spotsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Open first available spot
      const firstAvailable = Object.keys(spots).find((k) => !spots[k].sponsor) || 'spot-front-center';
      handleOpenSpotDrawer(firstAvailable);
    }
  };

  const handleBidSubmit = (values: BidFormValues) => {
    const targetKey = values.spotKey;
    const existing = spots[targetKey];
    if (!existing) return;

    const updatedSpot: Spot = {
      ...existing,
      currentBid: values.bidAmount,
      nextMinBid: values.bidAmount * 2, // NEXT MINIMUM is always 2x the latest valid bid
      sponsor: values.brandName,
      tagline: values.tagline,
      sponsorUrl: values.websiteUrl,
      logoUrl: values.logoUrl,
      durationWeeks: values.durationWeeks,
      timestamp: new Date().toISOString(),
    };

    setSpots((prev) => ({
      ...prev,
      [targetKey]: updatedSpot,
    }));

    setIsDrawerOpen(false);
    setToastMessage(`Congratulations! "${values.brandName}" is now featured on ${updatedSpot.name}.`);

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const currentSelectedSpot = selectedSpotKey ? spots[selectedSpotKey] : null;

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#0f0f0f] antialiased selection:bg-neutral-900 selection:text-white font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium leading-normal">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-neutral-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <Header onGetSpotClick={handleGetSpotClick} />

      {/* Main Content */}
      <main>
        <Hero
          spots={spots}
          totalRaised={totalRaised}
          onSpotClick={handleOpenSpotDrawer}
          onHeroSpotAction={handleHeroSpotAction}
          onGetSpotClick={handleGetSpotClick}
        />

        <SpotsGrid spots={spots} onSelectSpot={handleOpenSpotDrawer} />

        <HowItWorks />

        <WhatYouGet />

        <AboutMe />
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-over Bid Drawer */}
      <BidDrawer
        isOpen={isDrawerOpen}
        spot={currentSelectedSpot}
        onClose={() => setIsDrawerOpen(false)}
        onSubmitBid={handleBidSubmit}
      />
    </div>
  );
};

export default App;
