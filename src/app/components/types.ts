export type Screen =
  | 'start'
  | 'home'
  | 'benefit-finder'
  | 'benefit-results'
  | 'trip-finder'
  | 'results'
  | 'place-detail'
  | 'trip-plan'
  | 'saved-trips'
  | 'favorites'
  | 'my-page'
  | 'guide';

export type BenefitCategory = 'balance' | 'discount' | 'program' | 'accessibility';
export type BenefitEligibility = 'likely' | 'possible' | 'check' | 'not-eligible';
export type BenefitStatus = 'available' | 'conditional' | 'check' | 'unavailable';
export type BenefitDataStatus = 'verified' | 'stale' | 'manual-check' | 'mock';
export type AccessValue = boolean | null;

export interface BenefitDefinition {
  id: string;
  name: string;
  category: BenefitCategory;
  description: string;
  policyYear: number;
  priority: number;
  eligibilitySummary: string;
  amount: number | null;
  amountLabel: string;
  usageChannel: string;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  requiresManualCheck: boolean;
  dataStatus: BenefitDataStatus;
  color: string;
}

export interface WelfareProfile {
  residenceRegion: string;
  residenceCity?: string;
  age?: number;
  basicLivelihoodRecipient: boolean;
  nearPoverty: boolean;
  disabled: boolean;
  disabilityPensionRecipient: boolean;
  disabilityAllowanceRecipient: boolean;
  disabledChildAllowanceRecipient: boolean;
  singleParentFamily: boolean;
  veteran: boolean;
  multiChildFamily: boolean;
  infantCompanion: boolean;
  socialWelfareFacilityUser: boolean;
  worker: boolean;
  workerVacationParticipant?: boolean;
}

export interface BenefitEligibilityMatch {
  benefitId: string;
  eligibility: BenefitEligibility;
  reason: string;
  requiresManualCheck: boolean;
}

export interface UserBenefit {
  benefitId: string;
  enabled: boolean;
  owned: boolean;
  balance?: number;
  expiresAt?: string;
  priority?: number;
}

export interface BenefitApplication {
  benefitId: string;
  status: BenefitStatus;
  detail: string;
  verifiedDate?: string;
  sourceName?: string;
  sourceUrl?: string;
  confidence?: number;
  dataStatus?: BenefitDataStatus;
  originalPrice?: number;
  discountAmount?: number;
  coveredAmount?: number;
  discountRate?: number;
  applicable?: boolean;
  remainingBalance?: number;
}

export interface PriceBreakdown {
  originalPrice: number | null;
  discountAmount: number;
  discountedPrice: number | null;
  voucherCovered: number;
  selfPay: number | null;
  priceConfirmed: boolean;
}

export interface AccessibilityInfo {
  wheelchair: AccessValue;
  disabledToilet: AccessValue;
  disabledParking: AccessValue;
  elevator: AccessValue;
  babyFacility: AccessValue;
  seniorFriendly: AccessValue;
  restArea: AccessValue;
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
  overallBenefitStatus?: BenefitStatus;
  benefitApplications?: BenefitApplication[];
  priceBreakdown?: PriceBreakdown;
  // Aggregate fields retained for saved/demo data and older presentation components.
  voucherStatus: BenefitStatus;
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
  benefits: UserBenefit[];
  welfareProfile?: WelfareProfile;
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

export interface BenefitSummary {
  benefitId: string;
  usedAmount: number;
  remainingAmount?: number;
  discountAmount?: number;
}

export interface TripPlan {
  id: string;
  title: string;
  travelDate: string;
  duration: 'day' | 'overnight';
  places: Place[];
  benefitSummary?: BenefitSummary[];
  totalDiscountAmount?: number;
  totalVoucherCovered?: number;
  totalSelfPay: number;
  totalVoucherAmount: number;
  remainingBalance: number;
  createdAt: string;
}

export const benefitStatusConfig: Record<BenefitStatus, {
  label: string;
  shortLabel: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}> = {
  available: {
    label: '혜택 이용 가능', shortLabel: '이용 가능', bgColor: 'bg-green-100',
    textColor: 'text-green-700', borderColor: 'border-green-300', dotColor: 'bg-green-500',
  },
  conditional: {
    label: '조건부 이용 가능', shortLabel: '조건부 가능', bgColor: 'bg-amber-100',
    textColor: 'text-amber-700', borderColor: 'border-amber-300', dotColor: 'bg-amber-500',
  },
  check: {
    label: '확인 필요', shortLabel: '확인 필요', bgColor: 'bg-gray-100',
    textColor: 'text-gray-600', borderColor: 'border-gray-300', dotColor: 'bg-gray-400',
  },
  unavailable: {
    label: '혜택 이용 불가', shortLabel: '이용 불가', bgColor: 'bg-red-100',
    textColor: 'text-red-600', borderColor: 'border-red-300', dotColor: 'bg-red-500',
  },
};

// Compatibility alias for existing result/detail components during the UI migration.
export const voucherStatusConfig = benefitStatusConfig;
export type VoucherStatus = BenefitStatus;
