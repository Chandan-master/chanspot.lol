export interface Spot {
  id: string;
  name: string;
  side: 'front' | 'back';
  view: 'front' | 'back';
  zone: string;
  isShirt: boolean;
  currentBid: number;
  nextMinBid: number;
  sponsor: string | null;
  tagline: string;
  logoUrl: string | null;
  sponsorUrl: string | null;
  desc: string;
  durationWeeks?: number;
  timestamp?: string;
  coords: {
    left: string;
    top: string;
    width: string;
    height: string;

  };


  logoOffsetX?: number;
  logoOffsetY?: number;
}

export interface BidFormValues {
  spotKey: string;
  brandName: string;
  tagline: string;
  websiteUrl: string;
  logoUrl: string | null;
  bidAmount: number;
  durationWeeks: number;

}
