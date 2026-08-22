export type BenefitCategory = 'balance' | 'discount' | 'program' | 'accessibility';
export type BenefitEligibility = 'likely' | 'possible' | 'check' | 'not-eligible';
export type BenefitStatus = 'available' | 'conditional' | 'check' | 'unavailable';
export type VoucherStatus = BenefitStatus;
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

export interface UserBenefit {
  benefitId: string;
  enabled: boolean;
  owned: boolean;
  balance?: number;
  expiresAt?: string;
  priority?: number;
}

export interface BenefitEligibilityMatch {
  benefitId: string;
  eligibility: BenefitEligibility;
  reason: string;
  requiresManualCheck: boolean;
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
  overallBenefitStatus: BenefitStatus;
  benefitApplications: BenefitApplication[];
  priceBreakdown: PriceBreakdown;
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
  benefitSummary: BenefitSummary[];
  totalDiscountAmount: number;
  totalVoucherCovered: number;
  totalSelfPay: number;
  totalVoucherAmount: number;
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
