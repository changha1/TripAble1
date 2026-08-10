import { TourItem } from './tour.interface.js';
import { VoucherStatus } from '../types/index.js';

export interface VoucherMerchant {
  contentId?: string;       // 한국관광공사 contentid가 식별된 경우 매칭 속도 향상
  voucherType: string;     // 'munhwa-nuri' (문화누리카드), 'tourism-welfare' (여행이용권), 'gwandoo-re' (관광두레), 'leisure' (여가바우처)
  merchantName: string;    // 가맹점명
  address: string;         // 가맹점 주소
  tel?: string;            // 가맹점 전화번호
  latitude?: number;       // 위도
  longitude?: number;      // 경도
  status: VoucherStatus;
  verifiedDate: string;    // 가맹점 정보 최종 확인일
  terms?: string;          // 이용 조건 및 혜택
}

// 가상 시드 데이터베이스 (추후 실제 공공데이터 가맹점 DB로 교체 예정)
const SEED_MERCHANTS: VoucherMerchant[] = [
  {
    contentId: '1',
    voucherType: 'munhwa-nuri',
    merchantName: '경복궁',
    address: '서울특별시 종로구 사직로 161',
    tel: '02-3700-3900',
    latitude: 37.5776087,
    longitude: 126.9768955,
    status: 'available',
    verifiedDate: '2026-06-15',
    terms: '입장료 전액 문화누리카드 결제 가능 (한복 착용자 무료 입장)'
  },
  {
    contentId: '2',
    voucherType: 'munhwa-nuri',
    merchantName: '국립중앙박물관',
    address: '서울특별시 용산구 서빙고로 137',
    tel: '02-2077-9000',
    latitude: 37.5240356,
    longitude: 126.9801456,
    status: 'available',
    verifiedDate: '2026-07-01',
    terms: '기획 전시관 특별전 입장료 결제 가능, 상설전시는 원래 무료'
  },
  {
    contentId: '3',
    voucherType: 'munhwa-nuri',
    merchantName: '한국민속촌',
    address: '경기도 용인시 기흥구 민속촌로 90',
    tel: '031-288-0000',
    latitude: 37.2588321,
    longitude: 127.1203498,
    status: 'conditional',
    verifiedDate: '2026-05-20',
    terms: '온라인 오픈마켓 예매 시에만 바우처 결제 가능 (현장 매표소 사용 불가)'
  },
  {
    contentId: '4',
    voucherType: 'munhwa-nuri',
    merchantName: '천지연 폭포',
    address: '제주특별자치도 서귀포시 천지동 667-7',
    tel: '064-760-6304',
    latitude: 33.2458422,
    longitude: 126.5594411,
    status: 'check',
    verifiedDate: '2025-11-10',
    terms: '가맹점 매칭 데이터 최신성 미흡, 방문 전 전화를 통한 재확인 권장'
  },
  {
    contentId: '6',
    voucherType: 'munhwa-nuri',
    merchantName: '전주 한옥마을 경기전',
    address: '전북특별자치도 전주시 완산구 태조로 44',
    tel: '063-281-2790',
    latitude: 35.8153421,
    longitude: 127.1498421,
    status: 'available',
    verifiedDate: '2026-06-28',
    terms: '매표소 현장 결제 가능'
  },
  {
    contentId: '7',
    voucherType: 'munhwa-nuri',
    merchantName: '창경궁 야간 고궁음악회',
    address: '서울특별시 종로구 창경궁로 185',
    tel: '02-762-4861',
    latitude: 37.5794300,
    longitude: 126.9946800,
    status: 'available',
    verifiedDate: '2026-08-05',
    terms: '인터넷 예매 및 현장 구매 시 바우처 사용 가능'
  },
  {
    contentId: '8',
    voucherType: 'munhwa-nuri',
    merchantName: '서울 유스호스텔 더블룸',
    address: '서울특별시 중구 퇴계로26길 110',
    tel: '02-319-1318',
    latitude: 37.5574510,
    longitude: 126.9904250,
    status: 'available',
    verifiedDate: '2026-07-05',
    terms: '숙박료 결제 가능 (사전 전화 예약 필수)'
  },
  {
    contentId: '9',
    voucherType: 'munhwa-nuri',
    merchantName: '종로 전통 한정식 도담',
    address: '서울특별시 종로구 삼청로 35',
    tel: '02-733-1234',
    latitude: 37.5791000,
    longitude: 126.9802000,
    status: 'available',
    verifiedDate: '2026-07-12',
    terms: '식사 결제 가능 (식음료 가맹점 확인 완료)'
  },
  {
    contentId: '10',
    voucherType: 'munhwa-nuri',
    merchantName: '국립현대미술관 서울관',
    address: '서울특별시 종로구 삼청로 30',
    tel: '02-3701-9500',
    latitude: 37.5786884,
    longitude: 126.9790204,
    status: 'available',
    verifiedDate: '2026-07-05',
    terms: '입장권 및 아트샵 일부 상품 결제 가능'
  }
];

// 문자열 유사성을 계산하는 간단한 자카드 유사도 (Jaccard Similarity)
function getWordSimilarity(str1: string, str2: string): number {
  const s1 = new Set(str1.replace(/\s+/g, '').split(''));
  const s2 = new Set(str2.replace(/\s+/g, '').split(''));
  
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// 거리 계산 함수 (미터 단위)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class VoucherMatcher {
  private merchants: VoucherMerchant[];

  constructor(customMerchants?: VoucherMerchant[]) {
    this.merchants = customMerchants || SEED_MERCHANTS;
  }

  /**
   * 한국관광공사 관광 정보 아이템과 바우처 가맹점 테이블을 비교하여 매칭 결과를 도출합니다.
   */
  public match(place: TourItem, voucherType: string): {
    status: VoucherStatus;
    detail: string;
    confidence: number;
    verifiedDate: string;
  } {
    // 1단계: contentId 직접 매칭이 있는지 확인
    const directMatch = this.merchants.find(
      m => m.voucherType === voucherType && m.contentId === place.contentid
    );

    if (directMatch) {
      return {
        status: directMatch.status,
        detail: directMatch.terms || `${directMatch.merchantName}은(는) 가맹점으로 확인되었습니다.`,
        confidence: 100,
        verifiedDate: directMatch.verifiedDate
      };
    }

    let bestMatch: VoucherMerchant | null = null;
    let maxScore = 0;

    // 해당 바우처 가맹점 리스트 루프
    const candidateMerchants = this.merchants.filter(m => m.voucherType === voucherType);

    for (const merchant of candidateMerchants) {
      let score = 0;

      // 1. 이름 유사성 비교 (최대 40점)
      const nameSim = getWordSimilarity(place.title, merchant.merchantName);
      if (place.title === merchant.merchantName) {
        score += 40;
      } else if (place.title.includes(merchant.merchantName) || merchant.merchantName.includes(place.title)) {
        score += 30;
      } else {
        score += nameSim * 30;
      }

      // 2. 주소 유사성 비교 (최대 30점)
      // 시/구명 및 도로명 대조
      const cleanAddrPlace = place.addr1.replace(/\s+/g, '');
      const cleanAddrMerch = merchant.address.replace(/\s+/g, '');
      const addrSim = getWordSimilarity(cleanAddrPlace, cleanAddrMerch);
      if (cleanAddrPlace.includes(cleanAddrMerch) || cleanAddrMerch.includes(cleanAddrPlace)) {
        score += 30;
      } else {
        score += addrSim * 30;
      }

      // 3. 전화번호 일치 여부 (최대 15점)
      if (place.tel && merchant.tel) {
        const telPlace = place.tel.replace(/[^0-9]/g, '');
        const telMerch = merchant.tel.replace(/[^0-9]/g, '');
        if (telPlace === telMerch && telPlace.length > 5) {
          score += 15;
        }
      }

      // 4. 지리적 거리 (최대 15점)
      if (place.mapx && place.mapy && merchant.latitude && merchant.longitude) {
        const latP = parseFloat(place.mapy);
        const lonP = parseFloat(place.mapx);
        const dist = getDistanceMeters(latP, lonP, merchant.latitude, merchant.longitude);
        if (dist <= 150) {
          score += 15;
        } else if (dist <= 500) {
          score += 10;
        } else if (dist <= 1500) {
          score += 5;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMatch = merchant;
      }
    }

    // 신뢰도 기준값 매칭 처리
    const roundedConfidence = Math.round(maxScore);

    if (bestMatch && roundedConfidence >= 75) {
      return {
        status: bestMatch.status,
        detail: bestMatch.terms || `${bestMatch.merchantName}은(는) 가맹점으로 확인되었습니다.`,
        confidence: roundedConfidence,
        verifiedDate: bestMatch.verifiedDate
      };
    }

    if (bestMatch && roundedConfidence >= 45) {
      return {
        status: 'check',
        detail: `유사 가맹점(${bestMatch.merchantName})이 발견되었으나 정확도가 낮아(${roundedConfidence}%) 확인이 필요합니다.`,
        confidence: roundedConfidence,
        verifiedDate: bestMatch.verifiedDate
      };
    }

    // 음식점(39) 및 쇼핑(38)은 가맹점이 확인되지 않은 경우 자동으로 사용 불가(unavailable) 처리하거나 안전하게 확인 필요(check) 처리
    const isFoodOrShopping = ['39', '38'].includes(place.contenttypeid);
    const defaultStatus: VoucherStatus = isFoodOrShopping ? 'unavailable' : 'check';
    const defaultDetail = isFoodOrShopping
      ? '해당 바우처를 이용할 수 있는 등록 가맹점 정보가 없습니다.'
      : '바우처 가맹점 등록 여부가 시스템에 기록되지 않아, 사전 문의를 권장합니다.';

    return {
      status: defaultStatus,
      detail: defaultDetail,
      confidence: 0,
      verifiedDate: 'N/A'
    };
  }
}
