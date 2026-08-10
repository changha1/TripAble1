import { VoucherMatcher } from './services/voucher.matcher.js';
import { RecommendScorer } from './services/recommend.scorer.js';
import { TripInput } from './types/index.js';
import { TourItem } from './services/tour.interface.js';

// 임의의 Tour API 응답
const testItems: TourItem[] = [
  {
    contentid: '1',
    contenttypeid: '12',
    title: '경복궁',
    addr1: '서울특별시 종로구 사직로 161',
    tel: '02-3700-3900',
    mapx: '126.9768955',
    mapy: '37.5776087',
    modifiedtime: '20260615120000',
    areacode: '1',
    sigungucode: '1'
  },
  {
    contentid: '9',
    contenttypeid: '39', // 음식점
    title: '종로 전통 한정식 도담',
    addr1: '서울특별시 종로구 삼청로 35',
    tel: '02-733-1234',
    mapx: '126.9802000',
    mapy: '37.5791000',
    modifiedtime: '20260712120000',
    areacode: '1',
    sigungucode: '1'
  },
  {
    contentid: '99', // 존재하지 않는 가맹점
    contenttypeid: '39', // 음식점
    title: '맛있는 분식집',
    addr1: '서울특별시 종로구 사직로 10',
    mapx: '126.9700000',
    mapy: '37.5700000',
    modifiedtime: '20260712120000',
    areacode: '1',
    sigungucode: '1'
  }
];

const testInput: TripInput = {
  voucher: {
    id: 'munhwa-nuri',
    name: '문화누리카드',
    color: '#16a34a',
    maxAmount: 130000,
    description: '문화누리카드'
  },
  balance: 50000,
  endDate: '2026-12-31',
  region: '서울',
  startDate: '2026-08-10',
  duration: 'day',
  partySize: 1,
  tourismTypes: ['history'],
  transportation: [],
  accessibility: ['wheelchair'],
  selfPayBudget: 20000,
  paymentPreference: 'both'
};

function runTests() {
  console.log('🧪 Starting core algorithms unit tests...');

  // 1. VoucherMatcher 매칭 테스트
  console.log('\n--- 1. VoucherMatcher Tests ---');
  const matcher = new VoucherMatcher();

  const match1 = matcher.match(testItems[0], 'munhwa-nuri');
  console.log(`경복궁 매칭 결과 (기대: available, confidence: 100):`);
  console.log(`-> status: ${match1.status}, confidence: ${match1.confidence}%, detail: ${match1.detail}`);
  if (match1.status !== 'available') throw new Error('Match 1 failed');

  const match2 = matcher.match(testItems[1], 'munhwa-nuri');
  console.log(`도담 매칭 결과 (기대: available, confidence: 100):`);
  console.log(`-> status: ${match2.status}, confidence: ${match2.confidence}%, detail: ${match2.detail}`);
  if (match2.status !== 'available') throw new Error('Match 2 failed');

  const match3 = matcher.match(testItems[2], 'munhwa-nuri');
  console.log(`미등록 분식점 매칭 결과 (기대: unavailable, confidence: 0):`);
  console.log(`-> status: ${match3.status}, confidence: ${match3.confidence}%, detail: ${match3.detail}`);
  if (match3.status !== 'unavailable') throw new Error('Match 3 failed');

  // 2. RecommendScorer 필터링 및 점수화 테스트
  console.log('\n--- 2. RecommendScorer Tests ---');
  const filtered = RecommendScorer.filterItems(testItems, testInput, (item) => matcher.match(item, 'munhwa-nuri'));
  console.log(`필터링 후 개수 (기대: 미등록 분식점은 unavailable이므로 통과 / 또는 예산 범위 대조):`);
  console.log(`-> filtered count: ${filtered.length} (기대: 2개 - 경복궁, 도담)`);
  
  const scored = RecommendScorer.scoreAndNormalize(filtered, testInput);
  console.log(`정렬된 장소 결과:`);
  scored.forEach((place, index) => {
    console.log(`[${index + 1}] ${place.name} - 상태: ${place.voucherStatus}, 본인부담금: ${place.selfPay}원`);
    console.log(`    추천사유: ${place.recommendReason}`);
  });

  console.log('\n✅ Core algorithm tests passed successfully!');
}

try {
  runTests();
} catch (e: any) {
  console.error('❌ Test failed:', e.message);
  process.exit(1);
}
