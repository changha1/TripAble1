import type {
  BenefitDefinition,
  BenefitEligibilityMatch,
  Place,
  TripInput,
  TripPlan,
  UserBenefit,
  WelfareProfile,
} from '../components/types';

const API_BASE_URL = 'http://localhost:4000/api';

export async function loginUser(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('로그인 실패');
  const data = await res.json();
  return data.user as { id: string; email: string };
}

export async function searchPlaces(input: TripInput): Promise<{ results: Place[]; suggestions?: string[] }> {
  const res = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('검색 요청 중 오류 발생');
  return res.json();
}

export async function getBenefits(): Promise<BenefitDefinition[]> {
  const res = await fetch(`${API_BASE_URL}/benefits`);
  if (!res.ok) throw new Error('여행복지 목록을 불러오지 못했습니다.');
  const data = await res.json();
  return data.benefits;
}

export async function findEligibleBenefits(profile: WelfareProfile): Promise<BenefitEligibilityMatch[]> {
  const res = await fetch(`${API_BASE_URL}/benefits/eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error('여행복지 대상 후보를 찾지 못했습니다.');
  const data = await res.json();
  return data.matches;
}

export async function getPlaceDetail(id: string): Promise<{ detail: any; images: string[]; subDetails: string[] }> {
  const res = await fetch(`${API_BASE_URL}/places/${id}/detail`);
  if (!res.ok) throw new Error('상세 정보 불러오기 실패');
  return res.json();
}

export async function toggleFavoriteApi(userId: string, placeId: string) {
  const res = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, placeId }),
  });
  if (!res.ok) throw new Error('관심 장소 저장 실패');
  return res.json();
}

export async function getFavoritesApi(userId: string): Promise<{ id: string; placeId: string }[]> {
  const res = await fetch(`${API_BASE_URL}/favorites?userId=${userId}`);
  if (!res.ok) throw new Error('관심 장소 목록 조회 실패');
  const data = await res.json();
  return data.favorites;
}

export async function saveTripPlanApi(userId: string, plan: TripPlan) {
  const payload = {
    userId,
    title: plan.title,
    travelDate: plan.travelDate,
    duration: plan.duration,
    totalVoucherAmount: plan.totalVoucherAmount,
    totalSelfPay: plan.totalSelfPay,
    remainingBalance: plan.remainingBalance,
    totalDiscountAmount: plan.totalDiscountAmount || 0,
    totalVoucherCovered: plan.totalVoucherCovered || plan.totalVoucherAmount,
    benefitSummary: plan.benefitSummary || [],
    places: plan.places.map((p, idx) => ({
      placeId: p.id,
      visitOrder: idx + 1,
      entryFee: p.entryFee,
      selfPay: p.selfPay,
    })),
  };

  const res = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('일정 저장 실패');
  return res.json();
}

export async function getTripPlansApi(userId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/trips?userId=${userId}`);
  if (!res.ok) throw new Error('일정 목록 조회 실패');
  const data = await res.json();
  return data.plans;
}

export async function parseNaturalLanguageApi(prompt: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/search/natural-language`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('자연어 파싱 실패');
  const data = await res.json();
  return data.conditions;
}
