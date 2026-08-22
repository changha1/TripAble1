import type {
  BenefitCategory,
  BenefitDefinition,
  BenefitEligibility,
  WelfareProfile,
} from '../components/types';

export const BENEFIT_CATALOG: BenefitDefinition[] = [
  {
    id: 'munhwa-nuri',
    name: '문화누리카드',
    category: 'balance',
    description: '기초생활수급자·차상위계층의 국내 문화·관광·체육 활동을 지원하는 카드',
    policyYear: 2026,
    priority: 100,
    eligibilitySummary: '6세 이상 기초생활수급자 및 차상위계층',
    amount: 150000,
    amountLabel: '기본 연 150,000원',
    usageChannel: '등록 가맹점의 국내 관광·문화·체육 상품',
    sourceName: '문화누리카드 공식 누리집',
    sourceUrl: 'https://www.mnuri.kr/munhwa/introduceNuri.do',
    verifiedAt: '2026-08-22',
    requiresManualCheck: true,
    dataStatus: 'verified',
    color: '#16a34a',
  },
  {
    id: 'forest-welfare',
    name: '산림복지서비스이용권',
    category: 'balance',
    description: '산림복지 소외자가 등록 산림복지시설의 숙박·프로그램을 이용할 수 있는 이용권',
    policyYear: 2026,
    priority: 95,
    eligibilitySummary: '기초생활수급자·차상위·장애수당·장애인연금·한부모가족 등',
    amount: 100000,
    amountLabel: '1인당 100,000원',
    usageChannel: '등록 산림복지시설의 숙박·프로그램',
    sourceName: '산림복지서비스이용권 공식 누리집',
    sourceUrl: 'https://forestcard.or.kr/mobile/intro/mobileUseUtilize.do',
    verifiedAt: '2026-08-22',
    requiresManualCheck: true,
    dataStatus: 'verified',
    color: '#15803d',
  },
  {
    id: 'disabled-discount',
    name: '장애인 관광시설 감면',
    category: 'discount',
    description: '등록 장애인의 국·공립 관광시설, 공연장, 공공체육시설 등의 감면 자격',
    policyYear: 2026,
    priority: 90,
    eligibilitySummary: '등록 장애인 및 시설별 동반 보호자 기준',
    amount: null,
    amountLabel: '시설별 무료·할인',
    usageChannel: '장애인등록증(복지카드) 제시',
    sourceName: '보건복지부 장애인정책',
    sourceUrl: 'https://www.mohw.go.kr/menu.es?mid=a10710010500',
    verifiedAt: '2026-08-22',
    requiresManualCheck: true,
    dataStatus: 'verified',
    color: '#7c3aed',
  },
  {
    id: 'senior-discount',
    name: '경로우대',
    category: 'discount',
    description: '만 65세 이상 이용자를 위한 시설별 경로우대 후보 혜택',
    policyYear: 2026,
    priority: 70,
    eligibilitySummary: '만 65세 이상',
    amount: null,
    amountLabel: '시설별 무료·할인',
    usageChannel: '신분증 제시 및 시설별 확인',
    sourceName: '시설별 운영기관 확인',
    sourceUrl: 'https://www.gov.kr/portal/main',
    verifiedAt: '2026-08-22',
    requiresManualCheck: true,
    dataStatus: 'manual-check',
    color: '#d97706',
  },
  {
    id: 'worker-vacation',
    name: '근로자 휴가지원사업',
    category: 'program',
    description: '정부·기업·근로자가 함께 적립한 휴가비를 휴가샵 국내여행 상품에 사용하는 제도',
    policyYear: 2026,
    priority: 60,
    eligibilitySummary: '참여 기업의 중소·중견기업 등 근로자',
    amount: 100000,
    amountLabel: '정부 지원 100,000원 포함 총 400,000원 적립',
    usageChannel: '휴가샵 온라인몰',
    sourceName: '한국관광공사 근로자 휴가지원사업',
    sourceUrl: 'https://vacation.visitkorea.or.kr/travel/worker/renewal/workerNotyView.do',
    verifiedAt: '2026-08-22',
    requiresManualCheck: true,
    dataStatus: 'verified',
    color: '#2563eb',
  },
  {
    id: 'regional-travel-support',
    name: '지역별 관광복지 지원사업',
    category: 'program',
    description: '거주지와 대상에 따라 달라지는 지자체 관광지원 모집 정보를 확인하는 항목',
    policyYear: 2026,
    priority: 30,
    eligibilitySummary: '지역별 공고와 모집 조건 확인 필요',
    amount: null,
    amountLabel: '지역별 상이',
    usageChannel: '지자체별 신청·선정 절차',
    sourceName: '정부24 및 거주지 지자체 공고',
    sourceUrl: 'https://www.gov.kr/portal/main',
    verifiedAt: '2026-08-22',
    requiresManualCheck: true,
    dataStatus: 'manual-check',
    color: '#64748b',
  },
];

export const BENEFIT_CATEGORY_LABELS: Record<BenefitCategory, string> = {
  balance: '금액형 혜택',
  discount: '자격형 할인',
  program: '모집형 지원사업',
  accessibility: '관광 인프라',
};

export function findBenefit(benefitId: string): BenefitDefinition | undefined {
  return BENEFIT_CATALOG.find(benefit => benefit.id === benefitId);
}

export function getBenefitEligibility(
  profile: WelfareProfile,
  benefit: BenefitDefinition,
): BenefitEligibility {
  if (benefit.id === 'munhwa-nuri') {
    return profile.basicLivelihoodRecipient || profile.nearPoverty ? 'likely' : 'check';
  }
  if (benefit.id === 'forest-welfare') {
    return profile.basicLivelihoodRecipient || profile.nearPoverty || profile.disabilityAllowanceRecipient ||
      profile.disabilityPensionRecipient || profile.disabledChildAllowanceRecipient || profile.singleParentFamily
      ? 'likely' : 'check';
  }
  if (benefit.id === 'disabled-discount') return profile.disabled ? 'likely' : 'check';
  if (benefit.id === 'senior-discount') return (profile.age ?? 0) >= 65 ? 'likely' : 'check';
  if (benefit.id === 'worker-vacation') return profile.worker ? 'possible' : 'check';
  return 'check';
}

export function getBenefitReason(profile: WelfareProfile, benefitId: string): string {
  const reasons: string[] = [];
  if (benefitId === 'munhwa-nuri' && (profile.basicLivelihoodRecipient || profile.nearPoverty)) {
    reasons.push('기초생활수급 또는 차상위 조건을 입력했습니다.');
  }
  if (benefitId === 'forest-welfare' && (profile.basicLivelihoodRecipient || profile.nearPoverty || profile.singleParentFamily)) {
    reasons.push('산림복지서비스이용권 대상 후보 조건을 입력했습니다.');
  }
  if (benefitId === 'disabled-discount' && profile.disabled) reasons.push('등록 장애인 조건을 입력했습니다.');
  if (benefitId === 'senior-discount' && (profile.age ?? 0) >= 65) reasons.push('입력한 나이가 만 65세 이상입니다.');
  if (benefitId === 'worker-vacation' && profile.worker) reasons.push('근로자 휴가지원사업 참여 가능성을 확인해야 합니다.');
  return reasons.join(' ') || '행정정보를 조회한 결과가 아니라, 입력 조건을 바탕으로 한 후보입니다.';
}
