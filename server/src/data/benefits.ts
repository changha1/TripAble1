import type { BenefitDefinition, BenefitEligibility, WelfareProfile } from '../types/index.js';

export const BENEFIT_CATALOG: BenefitDefinition[] = [
  {
    id: 'munhwa-nuri', name: '문화누리카드', category: 'balance',
    description: '기초생활수급자·차상위계층의 국내 문화·관광·체육 활동을 지원하는 카드',
    policyYear: 2026, priority: 100, eligibilitySummary: '6세 이상 기초생활수급자 및 차상위계층',
    amount: 150000, amountLabel: '기본 연 150,000원', usageChannel: '등록 가맹점의 국내 관광·문화·체육 상품',
    sourceName: '문화누리카드 공식 누리집', sourceUrl: 'https://www.mnuri.kr/munhwa/introduceNuri.do',
    verifiedAt: '2026-08-22', requiresManualCheck: true, dataStatus: 'verified', color: '#16a34a'
  },
  {
    id: 'forest-welfare', name: '산림복지서비스이용권', category: 'balance',
    description: '등록 산림복지시설의 숙박·프로그램을 이용할 수 있는 이용권',
    policyYear: 2026, priority: 95, eligibilitySummary: '기초생활수급자·차상위·장애수당·장애인연금·한부모가족 등',
    amount: 100000, amountLabel: '1인당 100,000원', usageChannel: '등록 산림복지시설의 숙박·프로그램',
    sourceName: '산림복지서비스이용권 공식 누리집', sourceUrl: 'https://forestcard.or.kr/mobile/intro/mobileUseUtilize.do',
    verifiedAt: '2026-08-22', requiresManualCheck: true, dataStatus: 'verified', color: '#15803d'
  },
  {
    id: 'disabled-discount', name: '장애인 관광시설 감면', category: 'discount',
    description: '등록 장애인의 국·공립 관광시설, 공연장, 공공체육시설 등의 감면 자격',
    policyYear: 2026, priority: 90, eligibilitySummary: '등록 장애인 및 시설별 동반 보호자 기준',
    amount: null, amountLabel: '시설별 무료·할인', usageChannel: '장애인등록증(복지카드) 제시',
    sourceName: '보건복지부 장애인정책', sourceUrl: 'https://www.mohw.go.kr/menu.es?mid=a10710010500',
    verifiedAt: '2026-08-22', requiresManualCheck: true, dataStatus: 'verified', color: '#7c3aed'
  },
  {
    id: 'senior-discount', name: '경로우대', category: 'discount',
    description: '만 65세 이상 이용자를 위한 시설별 경로우대 후보 혜택',
    policyYear: 2026, priority: 70, eligibilitySummary: '만 65세 이상', amount: null,
    amountLabel: '시설별 무료·할인', usageChannel: '신분증 제시 및 시설별 확인',
    sourceName: '시설별 운영기관 확인', sourceUrl: 'https://www.gov.kr/portal/main',
    verifiedAt: '2026-08-22', requiresManualCheck: true, dataStatus: 'manual-check', color: '#d97706'
  },
  {
    id: 'worker-vacation', name: '근로자 휴가지원사업', category: 'program',
    description: '정부·기업·근로자가 함께 적립한 휴가비를 휴가샵 국내여행 상품에 사용하는 제도',
    policyYear: 2026, priority: 60, eligibilitySummary: '참여 기업의 중소·중견기업 등 근로자',
    amount: 100000, amountLabel: '정부 지원 100,000원 포함 총 400,000원 적립', usageChannel: '휴가샵 온라인몰',
    sourceName: '한국관광공사 근로자 휴가지원사업', sourceUrl: 'https://vacation.visitkorea.or.kr/travel/worker/renewal/workerNotyView.do',
    verifiedAt: '2026-08-22', requiresManualCheck: true, dataStatus: 'verified', color: '#2563eb'
  },
];

export function findBenefit(benefitId: string): BenefitDefinition | undefined {
  return BENEFIT_CATALOG.find(benefit => benefit.id === benefitId);
}

export function getEligibility(profile: WelfareProfile, benefit: BenefitDefinition): {
  eligibility: BenefitEligibility;
  reason: string;
} {
  const reason = '행정정보를 조회한 결과가 아니라, 사용자가 입력한 조건을 바탕으로 한 후보입니다.';
  if (benefit.id === 'munhwa-nuri') {
    return profile.basicLivelihoodRecipient || profile.nearPoverty
      ? { eligibility: 'likely', reason: '기초생활수급 또는 차상위 조건을 입력했습니다.' }
      : { eligibility: 'check', reason };
  }
  if (benefit.id === 'forest-welfare') {
    const likely = profile.basicLivelihoodRecipient || profile.nearPoverty || profile.disabilityPensionRecipient ||
      profile.disabilityAllowanceRecipient || profile.disabledChildAllowanceRecipient || profile.singleParentFamily;
    return likely
      ? { eligibility: 'likely', reason: '산림복지서비스이용권 대상 후보 조건을 입력했습니다.' }
      : { eligibility: 'check', reason };
  }
  if (benefit.id === 'disabled-discount') {
    return profile.disabled
      ? { eligibility: 'likely', reason: '등록 장애인 조건을 입력했습니다. 시설별 감면 기준을 확인하세요.' }
      : { eligibility: 'check', reason };
  }
  if (benefit.id === 'senior-discount') {
    return (profile.age ?? 0) >= 65
      ? { eligibility: 'likely', reason: '입력한 나이가 만 65세 이상입니다. 시설별 경로우대 기준을 확인하세요.' }
      : { eligibility: 'check', reason };
  }
  if (benefit.id === 'worker-vacation') {
    return profile.worker
      ? { eligibility: 'possible', reason: '근로자 조건에 해당하지만 참여 기업·모집 여부 확인이 필요합니다.' }
      : { eligibility: 'check', reason };
  }
  return { eligibility: 'check', reason: '지역별 공식 공고를 확인해야 합니다.' };
}
