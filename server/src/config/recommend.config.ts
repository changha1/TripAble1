export interface RecommendWeights {
  voucher: number;        // w1: 바우처 이용 편의 및 신뢰도
  budget: number;         // w2: 예산 적합성 (잔액 내 결제 비율)
  preference: number;     // w3: 사용자 선호 카테고리 매칭
  distance: number;       // w4: 이동 수단 및 대중교통/거리 최적화
  accessibility: number;  // w5: 필수 배리어프리 편의시설 충족도
  freshness: number;      // w6: 관광정보/가맹점 정보 갱신일 최신성
  completeness: number;   // w7: 관광공사 정보의 완성도 (대표이미지, 전화번호, 상세소개 유무)
}

// 기본 추천 알고리즘 가중치 설정 (가중치의 합은 1.0 권장)
export const RECOMMEND_WEIGHTS: RecommendWeights = {
  voucher: 0.25,       // 바우처 가용성이 가장 중요함
  budget: 0.20,        // 본인부담 최소화
  preference: 0.15,    // 선호 관광유형 매칭
  accessibility: 0.15, // 배리어프리 편의조건
  distance: 0.10,      // 거리 최적화
  freshness: 0.08,     // 데이터 신뢰도 (최신 수정일)
  completeness: 0.07   // 상세 정보 구성도
};
