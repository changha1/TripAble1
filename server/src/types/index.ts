export type VoucherStatus = 'available' | 'conditional' | 'check' | 'unavailable';

export interface Voucher {
  id: string;
  name: string;
  color: string;
  maxAmount: number;
  description: string;
}

export interface AccessibilityInfo {
  wheelchair: boolean;
  disabledToilet: boolean;
  disabledParking: boolean;
  elevator: boolean;
  babyFacility: boolean;
  seniorFriendly: boolean;
  restArea: boolean;
}

export interface Place {
  id: string; // contentid in TourAPI
  name: string; // title
  type: string; // contentType name (관광지, 문화시설 등)
  types: string[]; // types array (history, culture, nature, experience, performance, rest, sports, shopping)
  region: string; // areaCode mapped name
  city: string; // sigunguCode mapped name
  address: string; // addr1 (+ addr2)
  phone: string; // tel
  image: string; // firstimage
  rating: number; // calculated/mock rating
  reviewCount: number; // mock review count
  voucherStatus: VoucherStatus;
  voucherStatusDetail: string;
  entryFee: number;
  selfPay: number;
  accessibility: AccessibilityInfo;
  operatingHours: string;
  closedDays: string;
  description: string;
  highlights: string[];
  lastUpdated: string;
  distance: number;
  transportOptions: string[];
  recommendReason: string;
}

export interface TripInput {
  voucher: Voucher | null;
  balance: number;
  endDate: string;
  region: string; // region name (e.g. '서울', '경기' 등)
  startDate: string;
  duration: 'day' | 'overnight';
  partySize: number;
  tourismTypes: string[]; // e.g. ['nature', 'history']
  transportation: string[]; // e.g. ['public', 'car', 'min-walk', 'parking', 'nearby']
  accessibility: string[]; // e.g. ['wheelchair', 'disabled-toilet', 'disabled-parking', 'elevator', 'baby', 'senior', 'rest-area']
  selfPayBudget: number;
  paymentPreference: 'online' | 'offline' | 'both';
}

export interface TripPlan {
  id: string;
  title: string;
  travelDate: string;
  duration: 'day' | 'overnight';
  places: Place[];
  totalVoucherAmount: number;
  totalSelfPay: number;
  remainingBalance: number;
  createdAt: string;
}

export interface AISearchConditions {
  tourismTypes: string[];
  accessibility: string[];
  partySize: number;
  transportation: string[];
  duration: 'day' | 'overnight';
}
