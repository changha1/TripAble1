import { TourItem } from './tour.interface.js';
import { Place, TripInput, AccessibilityInfo, VoucherStatus } from '../types/index.js';
import { RECOMMEND_WEIGHTS } from '../config/recommend.config.js';
import { BudgetCalculator, BudgetCost } from './budget.calculator.js';

export class RecommendScorer {
  /**
   * 사용자의 필수 조건을 필터링합니다. (1단계)
   * 
   * @param items 원본 관광지/행사/숙박 아이템 목록
   * @param input 사용자 입력 조건
   * @param matchFn 바우처 매칭 함수 (각 아이템의 VoucherStatus 및 가격 부담을 사전에 계산하기 위해 사용)
   */
  public static filterItems(
    items: TourItem[],
    input: TripInput,
    matchFn: (item: TourItem) => { status: VoucherStatus; detail: string; verifiedDate: string }
  ): { item: TourItem; status: VoucherStatus; detail: string; cost: BudgetCost; verifiedDate: string }[] {
    const filtered: { item: TourItem; status: VoucherStatus; detail: string; cost: BudgetCost; verifiedDate: string }[] = [];

    for (const item of items) {
      // 1. 지역 필터링 (검색 시 지역을 입력한 경우)
      if (input.region && item.addr1 && !item.addr1.includes(input.region)) {
        continue;
      }

      // 2. 바우처 매칭 상태 및 비용 분석
      const matchResult = matchFn(item);
      
      // 목업 가격/입장료 파싱 (상세정보 혹은 임의 매핑)
      // 경복궁(3000), 국립중앙박물관(0), 한국민속촌(25000), 천지연폭포(2000), 부산해운대(0), 전주경기전(3000), 고궁음악회(10000), 유스호스텔(60000), 도담(15000), 현대미술관(4000)
      const rawPrice = this.getMockEntryFee(item.contentid);
      
      const cost = BudgetCalculator.calculatePlaceCost(rawPrice, matchResult.status, input.balance);

      // 3. 예산 필터링 (본인부담금이 예산을 초과하는지 여부)
      if (cost.isPriceConfirmed && input.selfPayBudget !== undefined) {
        // 본인부담금 + 사용불가비용이 본인부담 한도를 초과하면 제외
        const totalOutofPocket = cost.selfPay + cost.voucherUnavailableCost;
        if (totalOutofPocket > input.selfPayBudget) {
          continue;
        }
      }

      // 4. 필수 편의조건 필터링
      // 사용자가 필수 편의조건을 선택한 경우, 명백히 "없음(false)"으로 판정된 장소는 필터링
      const accessInfo = this.getMockAccessibility(item.contentid);
      let isExcludedByAccessibility = false;

      for (const cond of input.accessibility) {
        const key = this.mapAccessibilityKey(cond);
        if (key && accessInfo[key] === false) {
          // 명백히 지원하지 않는 경우 제외
          isExcludedByAccessibility = true;
          break;
        }
      }
      if (isExcludedByAccessibility) {
        continue;
      }

      filtered.push({
        item,
        status: matchResult.status,
        detail: matchResult.detail,
        cost,
        verifiedDate: matchResult.verifiedDate
      });
    }

    return filtered;
  }

  /**
   * 필터링된 장소들에 대해 점수를 계산하고 정렬합니다. (2단계 & 3단계)
   */
  public static scoreAndNormalize(
    filteredItems: { item: TourItem; status: VoucherStatus; detail: string; cost: BudgetCost; verifiedDate: string }[],
    input: TripInput
  ): Place[] {
    const scoredPlaces: { place: Place; score: number }[] = [];

    for (const entry of filteredItems) {
      const { item, status, detail, cost, verifiedDate } = entry;

      // 각 서브스코어 계산 (0 ~ 1 범위)
      const sVoucher = this.calcVoucherScore(status);
      const sBudget = this.calcBudgetScore(cost);
      const sPreference = this.calcPreferenceScore(item, input.tourismTypes);
      const sDistance = this.calcDistanceScore(item.dist);
      const sAccessibility = this.calcAccessibilityScore(item.contentid, input.accessibility);
      const sFreshness = this.calcFreshnessScore(item.modifiedtime, verifiedDate);
      const sCompleteness = this.calcCompletenessScore(item);

      // 가중합 계산
      const totalScore = 
        RECOMMEND_WEIGHTS.voucher * sVoucher +
        RECOMMEND_WEIGHTS.budget * sBudget +
        RECOMMEND_WEIGHTS.preference * sPreference +
        RECOMMEND_WEIGHTS.distance * sDistance +
        RECOMMEND_WEIGHTS.accessibility * sAccessibility +
        RECOMMEND_WEIGHTS.freshness * sFreshness +
        RECOMMEND_WEIGHTS.completeness * sCompleteness;

      const accessInfo = this.getMockAccessibility(item.contentid);

      // 추천 사유 생성 (3단계)
      const recommendReason = this.generateRecommendReason({
        sVoucher, sBudget, sPreference, sAccessibility,
        status, cost, title: item.title, tourismTypes: input.tourismTypes
      });

      const place: Place = {
        id: item.contentid,
        name: item.title,
        type: this.mapContentTypeName(item.contenttypeid),
        types: this.mapContentTypeIdToTypes(item.contenttypeid, item.cat2),
        region: item.areacode === '1' ? '서울' : (item.areacode === '31' ? '경기' : (item.areacode === '39' ? '제주' : '전국')),
        city: item.sigungucode === '1' ? '종로구' : (item.sigungucode === '21' ? '용산구' : '시군구'),
        address: item.addr1 + (item.addr2 ? ' ' + item.addr2 : ''),
        phone: item.tel || '정보 없음',
        image: item.firstimage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
        rating: this.getMockRating(item.contentid),
        reviewCount: this.getMockReviewCount(item.contentid),
        voucherStatus: status,
        voucherStatusDetail: detail,
        entryFee: cost.entryFee,
        selfPay: cost.selfPay + cost.voucherUnavailableCost,
        accessibility: accessInfo,
        operatingHours: item.usetime || '운영 시간 정보 없음',
        closedDays: '시설 문의 요망',
        description: `${item.title}은(는) 한국관광공사 등록 관광 콘텐츠입니다. ${item.addr1}에 위치하고 있습니다.`,
        highlights: [
          item.parking ? `주차: ${item.parking}` : '주차 정보 확인 필요',
          '무장애 편의시설 보유 여부 사전 확인 권장'
        ],
        lastUpdated: item.modifiedtime ? `${item.modifiedtime.substring(0, 4)}-${item.modifiedtime.substring(4, 6)}-${item.modifiedtime.substring(6, 8)}` : '최근 갱신 정보 없음',
        distance: item.dist ? parseFloat((parseFloat(item.dist) / 1000).toFixed(1)) : 0.0,
        transportOptions: item.tel ? [`문의처: ${item.tel}`] : [],
        recommendReason: recommendReason
      };

      scoredPlaces.push({ place, score: totalScore });
    }

    // 점수 높은 순 정렬
    return scoredPlaces.sort((a, b) => b.score - a.score).map(x => x.place);
  }

  // 바우처 적합도 (Available 우선)
  private static calcVoucherScore(status: VoucherStatus): number {
    switch (status) {
      case 'available': return 1.0;
      case 'conditional': return 0.7;
      case 'check': return 0.3;
      case 'unavailable': return 0.0;
    }
  }

  // 예산 적합도 (본인부담금 발생량에 따라 평가)
  private static calcBudgetScore(cost: BudgetCost): number {
    if (!cost.isPriceConfirmed) return 0.2; // 가격 미확인은 낮은 점수
    const totalPay = cost.selfPay + cost.voucherUnavailableCost;
    if (totalPay === 0) return 1.0;       // 본인부담 없음
    if (totalPay <= 20000) return 0.6;    // 적은 본인부담금
    return 0.1;                           // 많은 본인부담금
  }

  // 선호 카테고리 일치도
  private static calcPreferenceScore(item: TourItem, prefTypes: string[]): number {
    if (prefTypes.length === 0) return 1.0; // 조건 지정 안 한 경우 패스
    const itemTypes = this.mapContentTypeIdToTypes(item.contenttypeid, item.cat2);
    const matched = prefTypes.filter(t => itemTypes.includes(t));
    return matched.length / prefTypes.length;
  }

  // 거리 가중치
  private static calcDistanceScore(distStr?: string): number {
    if (!distStr) return 0.5; // 위치 정보가 없을 경우 중간값
    const dist = parseFloat(distStr); // 미터 단위
    if (dist <= 1000) return 1.0;
    if (dist >= 20000) return 0.0;
    return 1.0 - (dist - 1000) / 19000;
  }

  // 필수 편의조건 부합성
  private static calcAccessibilityScore(contentId: string, reqConditions: string[]): number {
    if (reqConditions.length === 0) return 1.0;
    const access = this.getMockAccessibility(contentId);
    let scoreSum = 0;
    
    for (const cond of reqConditions) {
      const key = this.mapAccessibilityKey(cond);
      if (key) {
        const val = access[key];
        if (val === true) {
          scoreSum += 1.0;
        } else if (val === null || val === undefined) {
          // 정보 없음의 경우 단정 짓지 않고 보류 점수 (0.5) 부여
          scoreSum += 0.5;
        }
      }
    }
    return scoreSum / reqConditions.length;
  }

  // 데이터 최신성 스코어
  private static calcFreshnessScore(modifiedTime?: string, verifiedDate?: string): number {
    // modifiedTime 형식: YYYYMMDDHHMMSS
    const currentYear = new Date().getFullYear();
    let modYear = currentYear - 3; // 기본값: 3년 전

    if (modifiedTime && modifiedTime.length >= 4) {
      modYear = parseInt(modifiedTime.substring(0, 4));
    }
    
    const diff = Math.max(0, currentYear - modYear);
    const timeScore = diff === 0 ? 1.0 : (diff <= 2 ? 0.7 : 0.4);

    // 가맹점 확인 정보 최신성 결합
    let verScore = 0.5;
    if (verifiedDate && verifiedDate !== 'N/A') {
      const verYear = parseInt(verifiedDate.split('-')[0]);
      const verDiff = Math.max(0, currentYear - verYear);
      verScore = verDiff === 0 ? 1.0 : (verDiff <= 1 ? 0.8 : 0.5);
    }

    return (timeScore + verScore) / 2;
  }

  // 관광정보 구성의 완성도
  private static calcCompletenessScore(item: TourItem): number {
    let score = 0;
    if (item.firstimage) score += 0.4;
    if (item.tel) score += 0.2;
    if (item.addr1) score += 0.2;
    if (item.zipcode) score += 0.2;
    return score;
  }

  // 규칙 기반 추천 사유 문장 생성기 (3단계)
  private static generateRecommendReason(params: {
    sVoucher: number;
    sBudget: number;
    sPreference: number;
    sAccessibility: number;
    status: VoucherStatus;
    cost: BudgetCost;
    title: string;
    tourismTypes: string[];
  }): string {
    const reasons: string[] = [];

    // 1. 바우처 및 예산 관련 사유
    if (params.status === 'available') {
      if (params.cost.entryFee === 0) {
        reasons.push('무료로 부담 없이 이용 가능해요');
      } else if (params.cost.selfPay === 0) {
        reasons.push('바우처 잔액으로 전액 결제할 수 있어요');
      } else {
        reasons.push('바우처 잔액 지원으로 본인부담금을 절약할 수 있어요');
      }
    } else if (params.status === 'conditional') {
      reasons.push('특정 예약 방식(예: 온라인) 조건으로 바우처를 쓸 수 있어요');
    }

    // 2. 카테고리 매칭 사유
    if (params.sPreference > 0.5 && params.tourismTypes.length > 0) {
      reasons.push(`선택하신 선호 유형(${params.tourismTypes.join(', ')})과 잘 맞아요`);
    }

    // 3. 편의조건 매칭 사유
    if (params.sAccessibility >= 0.8) {
      reasons.push('장애인 주차장, 휠체어 전용 시설 등 배리어프리 조건이 뛰어납니다');
    }

    if (reasons.length === 0) {
      return '무장애 편의시설과 함께 관람하기 좋은 추천 명소입니다.';
    }

    return reasons.join(', ') + '.';
  }

  // contentid별 목업 요금 데이터
  private static getMockEntryFee(id: string): number {
    const prices: Record<string, number> = {
      '1': 3000,
      '2': 0,
      '3': 25000,
      '4': 2000,
      '5': 0,
      '6': 3000,
      '7': 10000,
      '8': 60000,
      '9': 15000,
      '10': 4000
    };
    return prices[id] !== undefined ? prices[id] : 0;
  }

  // contentid별 무장애 정보 매핑
  private static getMockAccessibility(id: string): AccessibilityInfo {
    const mockDb: Record<string, AccessibilityInfo> = {
      '1': { wheelchair: true, disabledToilet: true, disabledParking: true, elevator: false, babyFacility: true, seniorFriendly: true, restArea: true },
      '2': { wheelchair: true, disabledToilet: true, disabledParking: true, elevator: true, babyFacility: true, seniorFriendly: true, restArea: true },
      '3': { wheelchair: true, disabledToilet: true, disabledParking: true, elevator: false, babyFacility: true, seniorFriendly: false, restArea: true },
      '4': { wheelchair: false, disabledToilet: true, disabledParking: true, elevator: false, babyFacility: true, seniorFriendly: false, restArea: true },
      '5': { wheelchair: true, disabledToilet: true, disabledParking: true, elevator: false, babyFacility: true, seniorFriendly: true, restArea: true },
      '6': { wheelchair: true, disabledToilet: true, disabledParking: true, elevator: false, babyFacility: true, seniorFriendly: true, restArea: true },
      '7': { wheelchair: false, disabledToilet: true, disabledParking: true, elevator: false, babyFacility: false, seniorFriendly: false, restArea: true },
      '8': { wheelchair: true, disabledToilet: true, disabledParking: true, elevator: true, babyFacility: true, seniorFriendly: true, restArea: true },
      '9': { wheelchair: true, disabledToilet: false, disabledParking: false, elevator: false, babyFacility: false, seniorFriendly: true, restArea: false },
      '10': { wheelchair: true, disabledToilet: true, disabledParking: true, elevator: true, babyFacility: true, seniorFriendly: true, restArea: true }
    };
    return mockDb[id] || { wheelchair: false, disabledToilet: false, disabledParking: false, elevator: false, babyFacility: false, seniorFriendly: false, restArea: false };
  }

  private static mapAccessibilityKey(cond: string): keyof AccessibilityInfo | null {
    const mapping: Record<string, keyof AccessibilityInfo> = {
      'wheelchair': 'wheelchair',
      'disabled-toilet': 'disabledToilet',
      'disabled-parking': 'disabledParking',
      'elevator': 'elevator',
      'baby': 'babyFacility',
      'senior': 'seniorFriendly',
      'rest-area': 'restArea'
    };
    return mapping[cond] || null;
  }

  private static mapContentTypeName(typeId: string): string {
    const mapping: Record<string, string> = {
      '12': '관광지',
      '14': '문화시설',
      '15': '행사/공연/축제',
      '25': '여행코스',
      '28': '레포츠',
      '32': '숙박',
      '38': '쇼핑',
      '39': '음식점'
    };
    return mapping[typeId] || '기타';
  }

  private static mapContentTypeIdToTypes(typeId: string, cat2?: string): string[] {
    const types: string[] = [];
    if (typeId === '12') {
      types.push('nature');
      if (cat2 === 'A0201') types.push('history');
      if (cat2 === 'A0202') types.push('experience');
    }
    if (typeId === '14') types.push('culture', 'history');
    if (typeId === '15') types.push('performance', 'experience');
    if (typeId === '32') types.push('rest');
    if (typeId === '39') types.push('rest');
    if (typeId === '28') types.push('sports');
    if (typeId === '38') types.push('shopping');
    return types;
  }

  private static getMockRating(id: string): number {
    const ratings: Record<string, number> = { '1': 4.7, '2': 4.8, '3': 4.5, '4': 4.6, '5': 4.4, '6': 4.6, '7': 4.3, '8': 4.5, '9': 4.2, '10': 4.5 };
    return ratings[id] || 4.0;
  }

  private static getMockReviewCount(id: string): number {
    const counts: Record<string, number> = { '1': 12453, '2': 8921, '3': 6234, '4': 9876, '5': 15342, '6': 18923, '7': 1240, '8': 3452, '9': 2341, '10': 5678 };
    return counts[id] || 100;
  }
}
