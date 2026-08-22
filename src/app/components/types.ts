export type Screen =
  | 'start'
  | 'home'
  | 'trip-finder'
  | 'results'
  | 'place-detail'
  | 'trip-plan'
  | 'saved-trips'
  | 'favorites'
  | 'my-page'
  | 'guide';

export type VoucherStatus = 'available' | 'conditional' | 'check' | 'unavailable';

export type VoucherBenefitType = 'balance' | 'discount' | 'program';

export interface Voucher {
  id: string;
  name: string;
  color: string;
  maxAmount: number;
  benefitType: VoucherBenefitType;
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
  id: string;
  name: string;
  type: string;
  types: string[];
  region: string;
  city: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  reviewCount: number;
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
  region: string;
  startDate: string;
  duration: 'day' | 'overnight';
  partySize: number;
  tourismTypes: string[];
  transportation: string[];
  accessibility: string[];
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

export const voucherStatusConfig: Record<VoucherStatus, {
  label: string;
  shortLabel: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}> = {
  available: {
    label: '바우처 이용 가능',
    shortLabel: '이용 가능',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    dotColor: 'bg-green-500',
  },
  conditional: {
    label: '조건부 가능',
    shortLabel: '조건부 가능',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  check: {
    label: '확인 필요',
    shortLabel: '확인 필요',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-300',
    dotColor: 'bg-gray-400',
  },
  unavailable: {
    label: '사용 불가',
    shortLabel: '불가',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    borderColor: 'border-red-300',
    dotColor: 'bg-red-500',
  },
};
