import type {
  BenefitApplication,
  BenefitDefinition,
  BenefitStatus,
  PriceBreakdown,
  UserBenefit,
} from '../types/index.js';

export interface BudgetCost {
  entryFee: number;
  voucherCovered: number;
  selfPay: number;
  voucherUnavailableCost: number;
  isPriceConfirmed: boolean;
  discountAmount: number;
  priceBreakdown: PriceBreakdown;
  applications: BenefitApplication[];
}

export interface PlanBudgetSummary {
  totalDiscountAmount: number;
  totalVoucherCovered: number;
  totalVoucherAmount: number;
  totalSelfPay: number;
  remainingBalanceByBenefit: Record<string, number>;
}

function parsePrice(rawFee: number | string | undefined | null): { value: number; confirmed: boolean } {
  if (rawFee === undefined || rawFee === null) return { value: -1, confirmed: false };
  if (typeof rawFee === 'number') return { value: rawFee >= 0 ? rawFee : -1, confirmed: rawFee >= 0 };
  const cleaned = rawFee.replace(/,/g, '').trim();
  if (cleaned.includes('무료') || cleaned === '0' || cleaned === '') return { value: 0, confirmed: true };
  const match = cleaned.match(/\d+/);
  return match ? { value: Number(match[0]), confirmed: true } : { value: -1, confirmed: false };
}

export class BudgetCalculator {
  public static calculateMultiBenefitCost(
    rawFee: number | string | undefined | null,
    applications: BenefitApplication[],
    definitions: BenefitDefinition[],
    benefits: UserBenefit[],
  ): BudgetCost {
    const parsed = parsePrice(rawFee);
    if (!parsed.confirmed) {
      return {
        entryFee: -1, voucherCovered: 0, selfPay: 0, voucherUnavailableCost: 0,
        isPriceConfirmed: false, discountAmount: 0,
        priceBreakdown: { originalPrice: null, discountAmount: 0, discountedPrice: null, voucherCovered: 0, selfPay: null, priceConfirmed: false },
        applications,
      };
    }

    let remainingPrice = parsed.value;
    let discountAmount = 0;
    let voucherCovered = 0;
    const updatedApplications = applications.map(application => ({ ...application }));

    // Discounts are applied before balance-type benefits. Multiple discounts are deliberately not stacked.
    const discountApplication = updatedApplications.find(application => {
      const definition = definitions.find(item => item.id === application.benefitId);
      return definition?.category === 'discount' && (application.status === 'available' || application.status === 'conditional');
    });
    if (discountApplication) {
      const rate = discountApplication.discountRate || 0;
      const fixed = discountApplication.discountAmount || 0;
      const amount = rate > 0 ? Math.round(parsed.value * rate) : fixed;
      discountAmount = Math.min(parsed.value, amount);
      remainingPrice = Math.max(0, parsed.value - discountAmount);
      discountApplication.discountAmount = discountAmount;
    }

    const balanceBenefits = benefits
      .filter(benefit => benefit.enabled && benefit.owned)
      .map(benefit => ({ benefit, definition: definitions.find(item => item.id === benefit.benefitId) }))
      .filter(item => item.definition?.category === 'balance');

    for (const { benefit } of balanceBenefits) {
      const application = updatedApplications.find(item => item.benefitId === benefit.benefitId);
      if (!application || !['available', 'conditional'].includes(application.status)) continue;
      const balance = Math.max(0, benefit.balance || 0);
      const covered = Math.min(remainingPrice, balance);
      application.coveredAmount = covered;
      application.remainingBalance = balance - covered;
      application.applicable = true;
      voucherCovered += covered;
      remainingPrice -= covered;
      if (remainingPrice <= 0) break;
    }

    for (const application of updatedApplications) {
      const definition = definitions.find(item => item.id === application.benefitId);
      if (definition?.category === 'balance' && application.coveredAmount === undefined) {
        application.coveredAmount = 0;
        application.applicable = application.status === 'available' || application.status === 'conditional';
        const owned = benefits.find(item => item.benefitId === application.benefitId);
        application.remainingBalance = owned?.balance;
      }
    }

    return {
      entryFee: parsed.value,
      voucherCovered,
      selfPay: remainingPrice,
      voucherUnavailableCost: 0,
      isPriceConfirmed: true,
      discountAmount,
      priceBreakdown: {
        originalPrice: parsed.value,
        discountAmount,
        discountedPrice: parsed.value - discountAmount,
        voucherCovered,
        selfPay: remainingPrice,
        priceConfirmed: true,
      },
      applications: updatedApplications,
    };
  }

  // Kept for isolated legacy tests; new search code uses calculateMultiBenefitCost.
  public static calculatePlaceCost(rawFee: number | string | undefined | null, status: BenefitStatus, balance: number): BudgetCost {
    const application: BenefitApplication = { benefitId: 'legacy', status, detail: '기존 호환 계산', coveredAmount: 0 };
    return this.calculateMultiBenefitCost(rawFee, [application], [{
      id: 'legacy', name: 'legacy', category: 'balance', description: '', policyYear: 0, priority: 0,
      eligibilitySummary: '', amount: null, amountLabel: '', usageChannel: '', sourceName: '', sourceUrl: '',
      verifiedAt: '', requiresManualCheck: true, dataStatus: 'mock', color: '#000000'
    }], [{ benefitId: 'legacy', enabled: true, owned: true, balance }]);
  }

  public static calculateTotalPlanBudget(
    placesCosts: { cost: BudgetCost; applications?: BenefitApplication[] }[],
    benefits: UserBenefit[] = [],
  ): PlanBudgetSummary {
    const remainingBalanceByBenefit: Record<string, number> = {};
    benefits.forEach(benefit => { if (benefit.balance !== undefined) remainingBalanceByBenefit[benefit.benefitId] = benefit.balance; });
    let totalDiscountAmount = 0;
    let totalVoucherCovered = 0;
    let totalSelfPay = 0;
    for (const item of placesCosts) {
      totalDiscountAmount += item.cost.discountAmount;
      totalVoucherCovered += item.cost.voucherCovered;
      totalSelfPay += item.cost.isPriceConfirmed ? item.cost.selfPay : 0;
      for (const application of item.cost.applications) {
        if (application.remainingBalance !== undefined) remainingBalanceByBenefit[application.benefitId] = application.remainingBalance;
      }
    }
    return { totalDiscountAmount, totalVoucherCovered, totalVoucherAmount: totalVoucherCovered, totalSelfPay, remainingBalanceByBenefit };
  }
}
