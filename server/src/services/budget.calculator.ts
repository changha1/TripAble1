import { VoucherStatus } from '../types/index.js';

export interface BudgetCost {
  entryFee: number;                  // 원래 전체 입장료/이용요금 (-1 이면 가격 확인 필요)
  voucherCovered: number;            // 바우처 예상 결제금액
  selfPay: number;                  // 본인부담 예상금액 (바우처 잔액 초과분)
  voucherUnavailableCost: number;   // 바우처 사용 불가능 비용 (가맹점 아님 등으로 본인이 100% 내야 하는 비용)
  isPriceConfirmed: boolean;        // 요금 정보 확인 여부
}

export class BudgetCalculator {
  /**
   * 개별 장소의 요금 및 바우처 적용 비용을 계산합니다.
   * 
   * @param rawFee 문자열 요금 정보 (OpenAPI usefee 등) 또는 숫자 요금
   * @param status 바우처 매칭 상태
   * @param balance 현재 바우처 잔액
   */
  public static calculatePlaceCost(
    rawFee: number | string | undefined | null,
    status: VoucherStatus,
    balance: number
  ): BudgetCost {
    let entryFee = 0;
    let isPriceConfirmed = true;

    if (rawFee === undefined || rawFee === null) {
      entryFee = -1;
      isPriceConfirmed = false;
    } else if (typeof rawFee === 'number') {
      entryFee = rawFee;
      if (entryFee < 0) {
        isPriceConfirmed = false;
      }
    } else {
      // 문자열인 경우 숫자 파싱 시도 (예: "3,000원" -> 3000, "무료" -> 0)
      const cleaned = rawFee.replace(/,/g, '').trim();
      if (cleaned.includes('무료') || cleaned === '0' || cleaned === '') {
        entryFee = 0;
      } else {
        const matches = cleaned.match(/\d+/);
        if (matches) {
          entryFee = parseInt(matches[0]);
        } else {
          entryFee = -1;
          isPriceConfirmed = false;
        }
      }
    }

    // 가격 미확인인 경우 요금 계산에서 제외
    if (!isPriceConfirmed) {
      return {
        entryFee: -1,
        voucherCovered: 0,
        selfPay: 0,
        voucherUnavailableCost: 0,
        isPriceConfirmed: false,
      };
    }

    let voucherCovered = 0;
    let selfPay = 0;
    let voucherUnavailableCost = 0;

    if (status === 'available' || status === 'conditional') {
      // 바우처 적용 가능
      if (balance >= entryFee) {
        voucherCovered = entryFee;
        selfPay = 0;
      } else {
        voucherCovered = balance;
        selfPay = entryFee - balance;
      }
    } else {
      // 바우처 사용 불가능(unavailable) 또는 확인 필요(check)인 경우 본인 부담으로 처리
      voucherCovered = 0;
      selfPay = 0;
      voucherUnavailableCost = entryFee;
    }

    return {
      entryFee,
      voucherCovered,
      selfPay,
      voucherUnavailableCost,
      isPriceConfirmed,
    };
  }

  /**
   * 여러 개의 장소 목록에 대한 통합 일정 예산을 요약 계산합니다.
   */
  public static calculateTotalPlanBudget(
    placesCosts: { cost: BudgetCost; status: VoucherStatus }[],
    initialBalance: number
  ): {
    totalVoucherAmount: number;
    totalSelfPay: number;
    remainingBalance: number;
  } {
    let currentBalance = initialBalance;
    let totalVoucherAmount = 0;
    let totalSelfPay = 0;

    for (const item of placesCosts) {
      const c = item.cost;
      if (!c.isPriceConfirmed) continue; // 가격 미확인 장소는 합산에서 제외

      if (item.status === 'available' || item.status === 'conditional') {
        // 바우처 잔액 차감식 계산
        if (currentBalance >= c.entryFee) {
          totalVoucherAmount += c.entryFee;
          currentBalance -= c.entryFee;
        } else {
          totalVoucherAmount += currentBalance;
          totalSelfPay += (c.entryFee - currentBalance);
          currentBalance = 0;
        }
      } else {
        // 바우처 사용 불가/확인 필요 -> 전액 본인부담금 추가
        totalSelfPay += c.entryFee;
      }
    }

    return {
      totalVoucherAmount,
      totalSelfPay,
      remainingBalance: currentBalance,
    };
  }
}
