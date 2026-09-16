import React, { useState, useEffect } from 'react';
import { Spot } from '../types';
import { X, Upload, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BidDrawerProps {
  isOpen: boolean;
  spot: Spot | null;
  onClose: () => void;
  onSubmitBid: (values: any) => void; // kept for API compatibility; not called after checkout redirect
}

export const BidDrawer: React.FC<BidDrawerProps> = ({
  isOpen,
  spot,
  onClose,
  // onSubmitBid intentionally unused — payment is now handled by create-checkout + webhook
}) => {
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bidAmountInput, setBidAmountInput] = useState('');
  const [durationWeeks, setDurationWeeks] = useState<number>(1);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form whenever drawer opens or spot changes
  useEffect(() => {
    if (spot && isOpen) {
      setBrandName('');
      setTagline('');
      setWebsiteUrl('');
      setBidAmountInput('');
      setDurationWeeks(1);
      setLogoUrl(null);
      setLogoFileName(null);
      setLogoFile(null);
      setIsSubmitting(false);
      setError(null);
    }
  }, [spot, isOpen]);

  if (!isOpen || !spot) return null;

  const currentBid = spot.currentBid || 0;
  const currentMinBid = currentBid > 0 ? currentBid * 2 : (spot.nextMinBid || 10);
  const isSponsored = !!spot.sponsor;

  // Numerical bid calculation
  const hasEntered = bidAmountInput.trim() !== '';
  const parsedBid = hasEntered ? parseInt(bidAmountInput, 10) : 0;
  const isValidBid = hasEntered && !isNaN(parsedBid) && parsedBid >= currentMinBid;
  const isBelowMin = hasEntered && (!isNaN(parsedBid) ? parsedBid < currentMinBid : true);

  // NEXT MINIMUM calculation:
  // Must always be 2x the latest valid bid. Example: bid $50 -> next minimum becomes $100.
  // Before first bid: Current = $0, Minimum = starting price, Next Minimum = starting price * 2.
  // When user enters a valid bid, immediately recalculates to 2x that entered bid.
  const nextMinimum = isValidBid ? parsedBid * 2 : currentMinBid * 2;

  const totalCommitment = (isValidBid ? parsedBid : 0) * durationWeeks;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo file size must be under 2MB.');
        return;
      }
      setLogoFile(file);
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoUrl(result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      setError('Please enter your brand or company name.');
      return;
    }

    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl) {
      setError('Please enter your website URL.');
      return;
    }

    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      const parsed = new URL(formattedUrl);
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        throw new Error('Invalid host');
      }
    } catch {
      setError('Please enter a valid website URL (e.g. abc.com or https://abc.com/path).');
      return;
    }

    if (!hasEntered || isNaN(parsedBid) || parsedBid < currentMinBid) {
      setError(`Minimum bid required for this spot is $${currentMinBid}.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let uploadedPublicLogoUrl: string | null = null;

    try {
      // 1. Upload logo to Supabase Storage 'sponsor-logos' bucket if file selected
      if (logoFile) {
        const sanitized = logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `logos/${Date.now()}-${sanitized}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('sponsor-logos')
          .upload(storagePath, logoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadErr) {
          setError(`Logo upload failed: ${uploadErr.message}`);
          setIsSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('sponsor-logos')
          .getPublicUrl(uploadData.path);

        uploadedPublicLogoUrl = publicUrlData.publicUrl;
      }

      // 2. Save sponsor record to Supabase `sponsors` table
      const { data: sponsor, error: insertErr } = await supabase
        .from('sponsors')
        .insert({
          brand_name: brandName.trim(),
          description: tagline.trim() || null,
          website_url: formattedUrl,
          logo_url: uploadedPublicLogoUrl || logoUrl || null,
        })
        .select('id')
        .single();


      if (insertErr || !sponsor) {
        setError(`Failed to save sponsor: ${insertErr?.message || 'Unknown error'}`);
        setIsSubmitting(false);
        return;
      }

      if (insertErr) {
        setError(`Failed to save sponsor: ${insertErr.message}`);
        setIsSubmitting(false);
        return;
      }

      // 3. Call the create-checkout Edge Function and redirect to payment
      const view = String(spot.view || '').toLowerCase();

      const checkoutSpotId =
        view === 'front'
          ? `front-${spot.id.replace(/^spot-(?:front-)?/, '')}`
          : `back-${spot.id.replace(/^spot-(?:back-)?/, '')}`;
      console.log("CHECKOUT DATA:", {
        originalSpotId: spot.id,
        view: spot.view,
        finalSpotId: checkoutSpotId,
        amount: parsedBid,
        sponsorId: sponsor.id,
      });
      const { data: checkoutData, error: checkoutErr } =
        await supabase.functions.invoke('create-checkout', {
          body: {
            spotId: checkoutSpotId,
            amount: parsedBid,
            sponsorId: sponsor.id,
          },
        });


      if (checkoutErr) {
        setError(`Payment setup failed: ${checkoutErr.message}`);
        setIsSubmitting(false);
        return;
      }

      const checkoutUrl: string | undefined = checkoutData?.checkout_url ?? checkoutData?.url;
      if (!checkoutUrl) {
        setError('Payment setup failed: no redirect URL returned. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Redirect — browser takes over, no local spot state update here.
      // The webhook will update current_bid once payment is confirmed.
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over drawer */}
      <div className="relative w-full max-w-[400px] bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 sticky top-0 bg-white/95 backdrop-blur-md z-20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">{spot.name}</h2>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isSponsored ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                  }`}
              >
                {isSponsored ? 'SPONSORED' : 'AVAILABLE'}
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-500 mt-0.5">{spot.zone}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            type="button"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          {/* Current Sponsor Notice if already sponsored */}
          {isSponsored && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              {spot.logoUrl ? (
                <img
                  src={spot.logoUrl}
                  alt={spot.sponsor || 'Sponsor'}
                  className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-emerald-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  {spot.sponsor?.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-800 uppercase font-semibold">
                    Current Winner
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-900">
                    ${spot.currentBid}
                  </span>
                </div>
                <div className="text-xs font-bold text-emerald-950 truncate">{spot.sponsor}</div>
                {spot.sponsorUrl && (
                  <a
                    href={spot.sponsorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:underline mt-0.5"
                  >
                    <span>Visit site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="bid-drawer-form">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Brand / Company Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                Brand / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => {
                  setBrandName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. ABC Ltd"
                required
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Tagline / Short Description */}
            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                Tagline or Short Description
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Short pitch or motto"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                Website URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => {
                  setWebsiteUrl(e.target.value);
                  setError(null);
                }}
                placeholder="abc.com"
                required
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {/* Brand Logo Upload - Compact and Clean */}
            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                Brand Logo <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>

              {logoUrl ? (
                <div className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 bg-neutral-50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={logoUrl}
                      alt="Uploaded logo"
                      className="w-7 h-7 object-contain rounded bg-white p-0.5 border border-neutral-200 shrink-0"
                    />
                    <span className="text-xs text-neutral-700 truncate font-medium">
                      {logoFileName || 'logo.png'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl(null);
                      setLogoFileName(null);
                      setLogoFile(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-neutral-300 hover:border-neutral-500 bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer transition-colors text-neutral-600">
                  <Upload className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-medium text-neutral-700">
                    Upload logo (PNG or SVG)
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* PRICING STATUS (Directly above Enter Bid Amount) */}
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-3">
              <div className="grid grid-cols-3 divide-x divide-neutral-200 text-center">
                <div className="px-1">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-0.5">
                    CURRENT BID
                  </span>
                  <span className="text-base font-mono font-bold text-neutral-900">
                    ${currentBid}
                  </span>
                </div>
                <div className="px-1">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-0.5">
                    MINIMUM BID
                  </span>
                  <span className="text-base font-mono font-bold text-neutral-900">
                    ${currentMinBid}
                  </span>
                </div>
                <div className="px-1">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-0.5">
                    NEXT MINIMUM
                  </span>
                  <span className="text-base font-mono font-bold text-emerald-600">
                    ${nextMinimum}
                  </span>
                </div>
              </div>
            </div>

            {/* Enter Bid Amount */}
            <div>
              <label htmlFor="bid-amount-input" className="block text-xs font-semibold text-neutral-900 mb-1.5">
                Enter Bid Amount (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-mono font-bold text-xl select-none">
                  $
                </span>
                <input
                  id="bid-amount-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={bidAmountInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setBidAmountInput(val);
                    setError(null);
                  }}
                  placeholder="0"
                  className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 font-mono text-2xl font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none transition-colors ${isBelowMin
                    ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                    : 'border-neutral-300 focus:border-neutral-900'
                    }`}
                />
              </div>

              {/* Small red validation message directly below input */}
              {isBelowMin && (
                <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Minimum valid bid is ${currentMinBid}.</span>
                </p>
              )}
            </div>

            {/* Sponsorship Duration */}
            <div>
              <label className="block text-xs font-semibold text-neutral-900 mb-1.5">
                Sponsorship Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDurationWeeks(1)}
                  className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${durationWeeks === 1
                    ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                    }`}
                >
                  <div className="text-xs">1 Week</div>
                  <div className="text-[10px] opacity-80">Standard cycle</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDurationWeeks(2)}
                  className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${durationWeeks === 2
                    ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                    : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                    }`}
                >
                  <div className="text-xs">2 Weeks</div>
                  <div className="text-[10px] opacity-80">Extended lock-in</div>
                </button>
              </div>
            </div>

            {/* Total Commitment Banner */}
            <div className="bg-neutral-100 rounded-lg p-3 flex items-center justify-between text-xs">
              <span className="text-neutral-600">Total Commitment:</span>
              <span className="font-mono font-bold text-base text-neutral-900">
                ${totalCommitment} ({durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'})
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={!isValidBid || isSubmitting}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${isValidBid && !isSubmitting
                  ? 'bg-neutral-900 hover:bg-black text-white'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Redirecting to payment…</span>
                  </>
                ) : (
                  <span>
                    {isValidBid
                      ? `Place Bid • $${totalCommitment}`
                      : `Enter bid (min $${currentMinBid})`}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
