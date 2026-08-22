import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface GuideScreenProps {
  onBack: () => void;
}

const GUIDE_SECTIONS = [
  {
    id: '1',
    title: '🎯 TripAble이란?',
    content: `TripAble은 문화누리카드와 관광 관련 복지·여행 지원 제도를 이용하는 분들이 쉽고 빠르게 관광시설을 찾을 수 있도록 돕는 맞춤 여행 서비스입니다.

• 바우처 잔액 내에서 이용 가능한 관광지, 숙박시설 검색
• 휠체어 접근 가능, 장애인 화장실, 엘리베이터 등 편의시설 필터
• 예상 본인부담금 미리 확인
• 여행 계획 저장 및 공유`,
  },
  {
    id: '2',
    title: '💳 지원 카드·제도 종류',
    content: `현재 TripAble에서 안내하는 실제 관광 관련 카드·지원 제도입니다.

① 문화누리카드
기초생활수급자·차상위계층을 위한 국내 문화·관광·체육 지원 카드
2026년 기본 지원금 1인당 연 150,000원

② 장애인등록증(복지카드)
국·공립 관광시설 입장료 무료, 철도·공공체육시설 등 요금 감면 자격
시설·대상별 적용 조건은 방문 전에 확인 필요

③ 근로자 휴가지원사업
참여 기업·근로자·정부가 적립한 여행경비를 휴가샵 온라인몰의 국내여행 상품에 사용
2026년 일반 참여 기준 정부 100,000원·기업 100,000원·근로자 200,000원 적립`,
  },
  {
    id: '3',
    title: '🔍 이용 방법',
    content: `TripAble을 이용하는 방법을 안내합니다.

1단계: 바우처 선택
보유하고 계신 복지 바우처를 선택하세요.

2단계: 잔액 입력
남은 바우처 잔액과 사용 종료일을 입력하세요.

3단계: 여행 조건 입력
여행 지역, 날짜, 인원, 선호 관광 유형을 선택하세요.

4단계: 편의조건 선택
필요한 이동 조건과 편의시설을 선택하세요.

5단계: 결과 확인
맞춤 추천 장소와 예상 비용을 확인하세요.

6단계: 여행 계획 생성
마음에 드는 장소를 선택하여 여행 계획을 만들고 저장하세요.`,
  },
  {
    id: '4',
    title: '🟢 바우처 이용 상태 안내',
    content: `검색 결과에서 표시되는 바우처 이용 상태 배지의 의미입니다.

🟢 이용 가능 (초록색)
공식 가맹점 정보와 일치하며 현재 조건에서 바우처 이용이 가능합니다.

🟡 조건부 가능 (노란색)
특정 상품, 결제 방식(온라인 사전 결제 등), 또는 현장 상황에 따라 이용이 가능합니다. 방문 전 확인을 권장합니다.

⬜ 확인 필요 (회색)
가맹점 정보가 오래되었거나 관광 정보와 정확히 일치하지 않습니다. 방문 전 해당 시설에 전화하여 확인하시기 바랍니다.

🔴 사용 불가 (빨간색)
현재 확인된 기준에서 선택한 바우처로 이용이 불가합니다.

※ 바우처 이용 가능 여부는 현장 상황에 따라 변경될 수 있습니다.`,
  },
  {
    id: '5',
    title: '⚠️ 주의사항',
    content: `TripAble 이용 시 반드시 확인하세요.

• 바우처 이용 가능 여부는 변경될 수 있으므로 방문 전 해당 시설에 직접 확인하세요.
• 관광 정보는 한국관광공사 TourAPI를 기반으로 제공됩니다.
• 예상 이용 금액은 실제 금액과 다를 수 있습니다.
• 바우처 잔액 정보는 직접 입력하는 값으로, 실제 잔액과 다를 수 있습니다.
• 문화누리카드 실제 잔액은 문화누리 앱 또는 고객센터(1544-3412)에서 확인하세요.`,
  },
  {
    id: '6',
    title: '📞 도움이 필요하신가요?',
    content: `바우처 관련 문의처입니다.

문화누리카드
• 고객센터: 1544-3412
• 홈페이지: www.mnuri.kr

장애인등록증(복지카드)
• 보건복지상담센터: 129

근로자 휴가지원사업
• 전담 지원센터: 1670-1330

TripAble 서비스 문의
• 이메일: support@tripable.kr`,
  },
];

function AccordionItem({ section }: { section: typeof GUIDE_SECTIONS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <p className="text-gray-800 text-left" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{section.title}</p>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-none" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-none" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <p className="text-gray-600 whitespace-pre-line mt-3" style={{ fontSize: '0.82rem', lineHeight: 1.8 }}>
            {section.content}
          </p>
        </div>
      )}
    </div>
  );
}

export function GuideScreen({ onBack }: GuideScreenProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1rem' }}>서비스 이용 안내</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
        {/* Hero */}
        <div className="bg-green-700 rounded-2xl p-5 text-white text-center">
          <p style={{ fontSize: '2rem' }}>🧭</p>
          <h3 className="text-white mt-2 mb-1" style={{ fontWeight: 800, fontSize: '1.1rem' }}>TripAble 이용 안내</h3>
          <p className="text-green-200" style={{ fontSize: '0.82rem' }}>
            복지 바우처로 떠나는 맞춤 여행 서비스 안내
          </p>
        </div>

        {GUIDE_SECTIONS.map(section => (
          <AccordionItem key={section.id} section={section} />
        ))}

        <div className="h-4" />
      </div>
    </div>
  );
}
