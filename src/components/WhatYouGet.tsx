import React from 'react';
import { Eye, Camera, ExternalLink } from 'lucide-react';

export const WhatYouGet: React.FC = () => {
  const perks = [
    {
      icon: Eye,
      title: 'High-Frequency Daily Impressions',
      desc: 'Over 20,000+ weekly organic walking impressions across active college halls, lecture auditoriums, coffee spots, and public transit.',
    },
    {
      icon: Camera,
      title: 'Dedicated Social Proof & Proof of Wear',
      desc: 'Receive daily photographic proof-of-wear updates posted on social channels with direct tags and backlink to your website.',
    },
    {
      icon: ExternalLink,
      title: 'Direct Website Backlinks & Clicks',
      desc: "Your brand name, tagline, and clickable URL are permanently linked on ChanSpot's interactive billboard while your sponsorship runs.",
    },
  ];

  return (
    <section className="max-w-[1160px] mx-auto px-4 sm:px-6 py-12 border-t border-[#e5e5e0]" id="what-you-get">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-[#0f0f0f]">
          What you get
        </h2>
        <p className="text-xs text-[#666666] mt-1">
          Everything included in your ChanSpot sponsorship package.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {perks.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl border border-[#e5e5e0] bg-white flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center mb-4 text-[#0f0f0f]">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#0f0f0f] mb-1.5">{item.title}</h3>
                <p className="text-xs text-[#666666] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
