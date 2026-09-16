import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Pick a physical spot',
      desc: 'Choose an available placement across front or back positions on my shirt or denim.',
    },
    {
      num: '02',
      title: 'Submit your bid & URL',
      desc: 'Enter your weekly bid amount, brand name, website link, and attach your logo file.',
    },
    {
      num: '03',
      title: 'Weekly auction closing',
      desc: 'Bids close every Saturday at 8:00 PM. Highest bidder wins the exclusive slot.',
    },
    {
      num: '04',
      title: 'I wear it daily',
      desc: 'I print & wear your logo daily to classes, tech meetups, commutes, and campus grounds.',
    },
  ];

  return (
    <section className="max-w-[1160px] mx-auto px-4 sm:px-6 py-12 border-t border-[#e5e5e0]" id="how-it-works">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-[#0f0f0f]">
          How it works
        </h2>
        <p className="text-xs text-[#666666] mt-1">
          Four simple steps to secure guaranteed real-world walking impressions for your brand.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => (
          <div
            key={step.num}
            className="p-5 rounded-xl border border-[#e5e5e0] bg-white flex flex-col justify-between"
          >
            <div>
              <div className="font-mono text-xs font-bold text-[#999999] mb-3">
                {step.num}
              </div>
              <h3 className="font-bold text-sm text-[#0f0f0f] mb-1.5">{step.title}</h3>
              <p className="text-xs text-[#666666] leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
